/** V790 — Cinematic Show Director 2.0.
 * One score joining the EXISTING V604 authored acts, V761 storyboard, V671 pacing
 * and V679 peak roles. No additional section/singer/beat inference, camera cut,
 * playback timer, request, persistence, render object or manual cue.
 * A single deterministic plan is sampled from the real playback position.
 */
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import type {CinematicPlanV761,CinematicCueV761,ConcertVisualIntentV761} from './cinematicConcertDirectorV761';
import type {PacingCueV671} from './fullSongPacingV671';
import type {SongArcPlanV679,SongArcCueV679,SongArcRoleV679} from './intelligentSongArcV679';
import type {ConcertDynamicsV502,ConcertTierV502} from './smartConcertDynamicsV502';

export type ConcertMomentV790='establish'|'focus'|'anticipate'|'payoff'|'breath'|'resolve';
export type ShowSceneV790={index:number;actIndex:number;startMs:number;endMs:number;
  intent:ConcertVisualIntentV761;section:string;role:SongArcRoleV679;
  moment:ConcertMomentV790;emphasis:number;variation:number};
export type ShowPlanV790={source:'verified-storyboard'|'unavailable';trackId:string;
  durationMs:number;scenes:readonly ShowSceneV790[];peakAct:number};
export type ShowCueV790={active:boolean;reason:'verified-show'|'off';sceneIndex:number;
  actIndex:number;moment:ConcertMomentV790|null;intent:ConcertVisualIntentV761|null;
  emphasis:number;blend:number;dynamics:ConcertDynamicsV502};
export type ShowInputV790={trackId:string;durationMs:number;progressMs:number;
  playing:boolean;enabled:boolean;reducedMotion:boolean;tier:ConcertTierV502;
  strength:number;lyricsProtected:boolean;manualDance:boolean;manualCamera:boolean;
  manualLighting:boolean;narrative:NarrativeCueV604;cinematic:CinematicCueV761;
  pacing:PacingCueV671;arc:SongArcCueV679;base:ConcertDynamicsV502};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const round=(x:number)=>Math.round(x*100000)/100000;
const unavailable=(trackId:string,durationMs:number):ShowPlanV790=>({
  source:'unavailable',trackId,durationMs,scenes:[],peakAct:-1,
});

/** Compose only plans describing the same exact verified acts and scene intervals.
 * Never bridge a gap with a synthetic scene or silently trust an old track plan.
 */
export function planCinematicShowV790(n:NarrativePlanV604,c:CinematicPlanV761,a:SongArcPlanV679):ShowPlanV790{
  const off=unavailable(n.trackId,n.durationMs);
  if(n.source!=='verified-v600'||c.source!=='verified-v604'||a.source!=='verified-timeline'||
    !n.trackId||c.trackId!==n.trackId||a.trackId!==n.trackId||
    !finite(n.durationMs)||n.durationMs<=0||c.durationMs!==n.durationMs||a.durationMs!==n.durationMs||
    !Array.isArray(n.acts)||!Array.isArray(c.scenes)||!Array.isArray(a.moments)||
    n.acts.length<3||n.acts.length>160||c.scenes.length<3||c.scenes.length>480||
    a.moments.length!==n.acts.length||a.peakIndex<0||a.peakIndex>=n.acts.length||
    !Array.isArray(a.supportIndices)||a.moments[a.peakIndex]?.role!=='main-peak'||
    a.supportIndices.some(i=>!Number.isInteger(i)||i<0||i>=n.acts.length||i===a.peakIndex))return off;
  const scenes:ShowSceneV790[]=[];
  let lastEnd=0;
  const counts=new Array<number>(n.acts.length).fill(0);
  for(let j=0;j<c.scenes.length;j++){
    const s=c.scenes[j],act=n.acts[s.actIndex],role=a.moments[s.actIndex];
    if(!act||!role||s.index!==j||!Number.isInteger(s.actIndex)||s.actIndex<0||
      act.index!==s.actIndex||role.index!==act.index||role.startMs!==act.startMs||
      role.endMs!==act.endMs||role.section!==act.section||
      !finite(s.startMs)||!finite(s.endMs)||s.startMs<lastEnd||
      s.startMs<act.startMs||s.endMs>act.endMs||s.endMs-s.startMs<1200||
      s.section!==act.section||s.repetition!==act.repetition||
      !['portrait','dialogue','ensemble','wide','rise','pulse','breath'].includes(s.intent))return off;
    lastEnd=s.endMs;
    const firstInAct=counts[s.actIndex]++===0;
    const next=n.acts[act.index+1];
    const leadToPeak=act.section==='build'&&next?.startMs===act.endMs&&
      (next.index===a.peakIndex||a.supportIndices.includes(next.index));
    const moment:ConcertMomentV790=role.role==='main-peak'||role.role==='support-peak'?'payoff':
      act.section==='break'||role.role==='rest'?'breath':leadToPeak?'anticipate':
      act.chapter==='ending-arc'?'resolve':act.chapter==='setup'?'establish':'focus';
    // The main highlight wins; secondary hooks are intentionally quieter.
    // Repeated sections alternate their accents, while V761 owns shot variety.
    const weight:Record<ConcertMomentV790,number>={
      establish:-.22,focus:act.section==='verse'?-.05:.09,anticipate:.40,
      payoff:role.role==='main-peak'?.95:.37,breath:-.63,resolve:.22,
    };
    const variation=(act.repetition+j)%2===0?1:.82;
    const emphasis=round(clamp(weight[moment]*variation*(firstInAct?.94:1),-.7,1));
    scenes.push({index:j,actIndex:s.actIndex,startMs:s.startMs,endMs:s.endMs,
      intent:s.intent,section:s.section,role:role.role,moment,emphasis,variation});
  }
  if(!scenes.length||scenes.every(s=>s.actIndex!==a.peakIndex))return off;
  // Each approved act must be represented. The storyboard cannot silently omit
  // or shuffle entire imported sections while the arc still claims to be valid.
  if(counts.some(count=>count===0))return off;
  return {...off,source:'verified-storyboard',scenes,peakAct:a.peakIndex};
}

/** Fade every change at BOTH scene and act boundaries; never brighten text.
 * Does not request camera cuts, alter lip sync or override manual controls.
 */
export function sampleCinematicShowV790(plan:ShowPlanV790,input:ShowInputV790):ShowCueV790{
  const off:ShowCueV790={active:false,reason:'off',sceneIndex:-1,actIndex:-1,
    moment:null,intent:null,emphasis:0,blend:0,dynamics:input.base};
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
    !input.base.active||plan.source!=='verified-storyboard'||
    input.trackId!==plan.trackId||input.durationMs!==plan.durationMs||
    !finite(input.progressMs)||input.progressMs<0||input.progressMs>=plan.durationMs||
    !finite(input.strength)||input.strength<=0)return off;
  let lo=0,hi=plan.scenes.length;
  while(lo<hi){const mid=(lo+hi)>>1;if(plan.scenes[mid].startMs<=input.progressMs)lo=mid+1;else hi=mid;}
  const scene=plan.scenes[lo-1],n=input.narrative,c=input.cinematic,p=input.pacing,a=input.arc;
  if(!scene||input.progressMs>=scene.endMs||!n?.active||n.source!=='verified-v600'||
    n.act!==scene.actIndex||!c?.active||c.reason!=='verified-act'||
    c.sceneIndex!==scene.index||c.actIndex!==scene.actIndex||c.intent!==scene.intent||
    !p?.active||p.evidence!=='verified-arc'||p.beatIndex!==scene.actIndex||
    !a?.active||a.evidence!=='verified-arc'||a.index!==scene.actIndex||a.role!==scene.role||
    input.base.section!==scene.section||!finite(c.blend)||!finite(n.transition)||
    !finite(a.emphasis)||c.blend<0||c.blend>1||n.transition<0||n.transition>1)return off;
  const time=Math.min(input.progressMs-scene.startMs,scene.endMs-input.progressMs);
  const sceneFade=Math.min(2000,(scene.endMs-scene.startMs)*.25);
  const blend=round(Math.min(smooth(time/Math.max(1,sceneFade)),c.blend,n.transition));
  const weight=clamp(input.strength,0,100)/100*(input.tier==='balanced'?.60:1)*blend;
  const emphasis=round(scene.emphasis*weight*(input.lyricsProtected?.32:1));
  const apply=(n:number,bias:number,manual:boolean)=>manual?n:round(clamp(n*(1+bias*emphasis),.88,1.12));
  // Existing V670 quality guard runs after this composer and remains authoritative.
  const dynamics:ConcertDynamicsV502={...input.base,
    dance:apply(input.base.dance,.028,input.manualDance),
    camera:apply(input.base.camera,.020,input.manualCamera),
    // Positive lighting accents must not compete with protected lyrics.
    lighting:apply(input.base.lighting,.038,input.manualLighting),
  };
  return {active:true,reason:'verified-show',sceneIndex:scene.index,actIndex:scene.actIndex,
    moment:scene.moment,intent:scene.intent,emphasis,blend,dynamics};
}
