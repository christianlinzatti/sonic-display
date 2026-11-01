/** V761 Cinematic Concert Director 4.0.
 * Read-only storyboard built from VERIFIED V604 authored acts, not guessed sections,
 * vocal identities, beat detections or GPU metrics. Adds small automatic modulation
 * to the existing V502/V604/V654/V670 pipeline; no cameras, lights or timers.
 */
import type {NarrativePlanV604,NarrativeCueV604,NarrativeActV604} from './fullSongConcertDramaturgyV604';
import type {ConcertDynamicsV502} from './smartConcertDynamicsV502';

export interface CinematicConcertSettingsV761 {
  enabled:boolean;strength:number;variety:number;transitionMs:number;protectLyrics:boolean;
}
export const DEFAULT_CINEMATIC_CONCERT_V761:Readonly<CinematicConcertSettingsV761>={
  enabled:true,strength:65,variety:70,transitionMs:1300,protectLyrics:true,
};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
const round=(n:number)=>Math.round(n*100000)/100000;
const fade=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
export function normalizeCinematicConcertV761(raw?:Partial<CinematicConcertSettingsV761>|null):CinematicConcertSettingsV761{
  const d=DEFAULT_CINEMATIC_CONCERT_V761;
  return {enabled:typeof raw?.enabled==='boolean'?raw.enabled:d.enabled,
    strength:finite(raw?.strength)?clamp(raw.strength,0,100):d.strength,
    variety:finite(raw?.variety)?clamp(raw.variety,0,100):d.variety,
    transitionMs:finite(raw?.transitionMs)?clamp(raw.transitionMs,400,3000):d.transitionMs,
    protectLyrics:typeof raw?.protectLyrics==='boolean'?raw.protectLyrics:d.protectLyrics};
}
export type ConcertVisualIntentV761='portrait'|'dialogue'|'ensemble'|'wide'|'rise'|'pulse'|'breath';
export interface CinematicSceneV761 {
  index:number;actIndex:number;section:NarrativeActV604['section'];
  startMs:number;endMs:number;intent:ConcertVisualIntentV761;repetition:number;
}
export interface CinematicPlanV761 {
  source:'verified-v604'|'unavailable';trackId:string;durationMs:number;
  scenes:readonly CinematicSceneV761[];actCount:number;
}
export interface CinematicCueV761 {
  active:boolean;intent:ConcertVisualIntentV761|null;sceneIndex:number;
  actIndex:number;repetition:number;blend:number;reason:'verified-act'|'off';
  dynamics:ConcertDynamicsV502;
}
const choices:Record<NarrativeActV604['section'],readonly ConcertVisualIntentV761[]>={
  verse:['portrait','dialogue','ensemble'],
  hook:['wide','ensemble','dialogue'],
  build:['rise','portrait','wide'],
  drop:['pulse','wide','ensemble'],
  break:['breath','wide','portrait'],
};
/** Deterministic variation across and within acts. No new timing source. */
export function planCinematicConcertV761(narrative:NarrativePlanV604, settings?:Partial<CinematicConcertSettingsV761>|null):CinematicPlanV761{
  const variety=normalizeCinematicConcertV761(settings).variety;
  const empty:CinematicPlanV761={source:'unavailable',trackId:narrative.trackId,
    durationMs:narrative.durationMs,actCount:0,scenes:[]};
  if(narrative.source!=='verified-v600'||!narrative.trackId||!finite(narrative.durationMs)||
    narrative.durationMs<=0||!Array.isArray(narrative.acts)||!narrative.acts.length||narrative.acts.length>160)return empty;
  const scenes:CinematicSceneV761[]=[];let last:ConcertVisualIntentV761|null=null;let previousEnd=0;
  for(const [i,act] of (narrative.acts as readonly NarrativeActV604[]).entries()){
    if(act.index!==i||!finite(act.startMs)||!finite(act.endMs)||act.startMs<previousEnd||
      act.endMs-act.startMs<2600||act.endMs>narrative.durationMs||
      !choices[act.section]||!Number.isInteger(act.repetition)||act.repetition<0)return empty;
    previousEnd=act.endMs;
    // Sections under ten seconds are a single cinematic beat, not a fabricated 3-act arc.
    const pieces=variety>=60&&act.endMs-act.startMs>=24000?3:
      variety>=20&&act.endMs-act.startMs>=24000?2:
      variety>=60&&act.endMs-act.startMs>=10000?2:1;
    const palette=choices[act.section];
    for(let j=0;j<pieces;j++){
      const startMs=act.startMs+Math.round((act.endMs-act.startMs)*j/pieces);
      const endMs=j===pieces-1?act.endMs:act.startMs+Math.round((act.endMs-act.startMs)*(j+1)/pieces);
      let candidate=palette[(act.repetition+j+(i%2))%palette.length];
      if(candidate===last)candidate=palette[(palette.indexOf(candidate)+1)%palette.length];
      // A section must never generate the same consecutive visual intent, even on repeated hooks.
      if(candidate===last)return empty;
      scenes.push({index:scenes.length,actIndex:i,section:act.section,
        startMs,endMs,intent:candidate,repetition:act.repetition});
      last=candidate;
    }
  }
  return {...empty,source:'verified-v604',scenes,actCount:narrative.acts.length};
}

export interface CinematicInputV761 {
  settings?:Partial<CinematicConcertSettingsV761>|null;
  narrative:NarrativeCueV604;trackId:string;progressMs:number;playing:boolean;
  reducedMotion:boolean;tier:'low'|'balanced'|'high';
  manualDance:boolean;manualCamera:boolean;manualLighting:boolean;manualLyrics:boolean;
  lyricsProtected:boolean;verifiedSinger:boolean;base:ConcertDynamicsV502;
}
/** Render-safe, seek-safe sample. Source and act MUST match V604's confirmation.
 * Smoothing returns the BASE at every scene edge and in any gap.
 */
export function sampleCinematicConcertV761(plan:CinematicPlanV761,input:CinematicInputV761):CinematicCueV761{
  const off:CinematicCueV761={active:false,intent:null,sceneIndex:-1,actIndex:-1,
    repetition:0,blend:0,reason:'off',dynamics:input.base};
  const settings=normalizeCinematicConcertV761(input.settings);
  if(!settings.enabled||settings.strength<=0||plan.source!=='verified-v604'||
    !input.playing||input.reducedMotion||input.tier==='low'||
    !input.base.active||!input.narrative.active||input.narrative.source!=='verified-v600'||
    input.trackId!==plan.trackId||!finite(input.progressMs)||input.progressMs<0||
    input.progressMs>=plan.durationMs)return off;
  let low=0,high=plan.scenes.length;
  while(low<high){const mid=(low+high)>>>1;if(plan.scenes[mid].startMs<=input.progressMs)low=mid+1;else high=mid;}
  const scene=plan.scenes[low-1];
  if(!scene||input.progressMs>=scene.endMs||scene.actIndex!==input.narrative.act||
    scene.section!==input.base.section)return off;
  const length=scene.endMs-scene.startMs;
  const boundary=Math.min(settings.transitionMs,length*.30);
  const edge=Math.min(input.progressMs-scene.startMs,scene.endMs-input.progressMs);
  const blend=fade(edge/Math.max(1,boundary));
  const weight=settings.strength/100*(input.tier==='balanced'?.60:1)*blend;
  const varieties=settings.variety/100;
  // Portraits are restrained for readability; repeated sections receive different scenes.
  const atmosphere:Record<ConcertVisualIntentV761,[number,number,number,number]>={
    portrait:[-.010,-.018,-.025,-.002],dialogue:[.014,.012,.016,.002],
    ensemble:[.018,.020,.028,.004],wide:[.010,.026,.030,.004],
    rise:[.015,.012,.030,.003],pulse:[.022,.021,.036,.004],
    breath:[-.024,-.020,-.034,-.002],
  };
  const [danceDelta,cameraDelta,lightingDelta,lyricsDelta]=atmosphere[scene.intent];
  const extra=(v:number,delta:number,min:number,max:number)=>round(clamp(v*(1+delta*weight*(.6+.4*varieties)),min,max));
  const cameraLyricGuard=input.lyricsProtected&&settings.protectLyrics?.30:1;
  // Never raise decorative light/lyrics accents around protected text.
  const lighting=input.manualLighting?input.base.lighting:extra(input.base.lighting,
    input.lyricsProtected&&settings.protectLyrics?Math.min(0,lightingDelta)*.3:lightingDelta,.88,1.12);
  const lyrics=input.manualLyrics||input.lyricsProtected&&settings.protectLyrics?
    input.base.lyrics:round(clamp(input.base.lyrics+lyricsDelta*weight*varieties,0,.12));
  const dynamics:ConcertDynamicsV502={...input.base,
    dance:input.manualDance?input.base.dance:extra(input.base.dance,danceDelta,.88,1.12),
    camera:input.manualCamera?input.base.camera:extra(input.base.camera,cameraDelta*cameraLyricGuard*
      (input.verifiedSinger&&scene.intent==='portrait'?.6:1),.88,1.12),
    lighting,lyrics};
  return {active:true,intent:scene.intent,sceneIndex:scene.index,actIndex:scene.actIndex,
    repetition:scene.repetition,blend:round(blend),reason:'verified-act',dynamics};
}
