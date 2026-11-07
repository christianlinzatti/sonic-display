/** V1073 · Concert Audience Experience 3.0
 * Pure, deterministic opt-in cue for the EXISTING V1032 crowd renderer.
 * Show chapters are authored templates, not claims of recognized applause or vocals.
 * No audio output, network, device commands, physics or new animation loop.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';

export type AudienceMoodV1073='arrival'|'sway'|'anticipate'|'celebrate'|'listen'|'encore';
export interface AudienceCueV1073{
 active:boolean;reason:'disabled'|'paused'|'motion'|'performance'|'manual'|'show'|'clock'|'planned';
 mood:AudienceMoodV1073;gain:number;wristband:number;cheer:number;attention:number;
 phase:number;color:readonly [number,number,number];
}
export type AudienceSampleV1073={light:number;lift:number;arms:number;faceStage:number};
const OFF:AudienceCueV1073=Object.freeze({active:false,reason:'disabled',mood:'arrival',gain:0,
 wristband:0,cheer:0,attention:0,phase:0,color:[1,1,1] as const});
const clamp=(n:unknown,lo:number,hi:number,otherwise=0):number=>
 typeof n==='number'&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):otherwise;
const MOODS:Record<ArenaShowSceneV1040,AudienceMoodV1073>={
 intro:'arrival',verse:'sway',build:'anticipate',hook:'celebrate',interlude:'listen',finale:'encore',
};
const COLORS:Record<'rap'|'hard'|'rock'|'pop',readonly [number,number,number]>={
 rap:[.49,.37,1],hard:[.17,.85,1],rock:[1,.44,.25],pop:[1,.48,.78],
};
const finiteClock=(progress:number|undefined|null,duration:number|undefined|null):boolean=>
 typeof progress==='number'&&Number.isFinite(progress)&&progress>=0&&
 typeof duration==='number'&&Number.isFinite(duration)&&duration>=30000&&
 progress<=duration;
/** Observed drops/hooks may increase emphasis, never trigger an imagined audience sound.
 * A manual phone animation mode owns the phone/wrist animation and disables this overlay.
 */
export function planAudienceExperienceV1073(input:{
 enabled:boolean;stageIsArena:boolean;audienceEnabled:boolean;phoneEnabled:boolean;
 phoneMode?:string;showDesignerEnabled:boolean;showDirectorEnabled:boolean;
 playing:boolean;reducedMotion:boolean;reactive?:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;
 show?:ArenaShowCueV1040|null;trackId?:string|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number;
 observedSection?:string|null;genre?:string|null;
}):AudienceCueV1073{
 if(!input.enabled||!input.stageIsArena||!input.audienceEnabled||!input.phoneEnabled||
    !input.showDesignerEnabled||!input.showDirectorEnabled||input.reactive===false)return OFF;
 if(!input.playing)return {...OFF,reason:'paused'};
 if(input.reducedMotion)return {...OFF,reason:'motion'};
 if(input.performanceTier==='low')return {...OFF,reason:'performance'};
 if(input.phoneMode&&input.phoneMode!=='wave')return {...OFF,reason:'manual'};
 const show=input.show;
 if(!show?.active||!show.scene||!(show.scene in MOODS)||!Number.isInteger(show.segmentIndex)||
    show.segmentIndex<0||show.segmentIndex>6||!Number.isFinite(show.intensity)||
    show.intensity<=0||show.intensity>100||!Number.isFinite(show.fade)||
    show.fade<=0||show.fade>1)return {...OFF,reason:'show'};
 if(typeof input.trackId!=='string'||!input.trackId.trim()||
    !finiteClock(input.progressMs,input.durationMs))return {...OFF,reason:'clock'};
 // Strictly bounded; invalid strengths fail closed instead of increasing visuals.
 if(typeof input.strength!=='number'||!Number.isFinite(input.strength)||
    input.strength<0||input.strength>80||input.strength===0)return OFF;
 const tier=input.performanceTier==='balanced'?.7:1;
 const gain=clamp(input.strength/100*show.intensity/100*show.fade*tier,0,.8);
 if(gain<.001)return OFF;
 let hash=2166136261;
 for(let i=0;i<Math.min(120,input.trackId.length);i++)hash=Math.imul(hash^input.trackId.charCodeAt(i),16777619);
 const genre=String(input.genre??'').toLowerCase();
 const key=genre.includes('hard')||genre.includes('tekk')?'hard':
  genre.includes('rock')||genre.includes('metal')?'rock':genre.includes('rap')?'rap':'pop';
 const mood=MOODS[show.scene];
 const emphasis=input.observedSection==='hook'||input.observedSection==='drop';
 const crowdScene=mood==='celebrate'||mood==='encore';
 const cheer=clamp(gain*(mood==='listen'?.14:mood==='arrival'?.2:mood==='anticipate'?.58:
  crowdScene?.77:.37)*(emphasis?1.12:1),0,.65);
 return {active:true,reason:'planned',mood,gain,wristband:clamp(gain*(emphasis?1:.86),0,.75),
  cheer,attention:clamp(gain*(mood==='sway'?.7:mood==='listen'?.85:.52),0,.6),
  phase:((hash>>>0)%4096)/4096*Math.PI*2,color:COLORS[key]};
}
/** Continuous low-frequency waves (<=~1.2Hz); no full-intensity strobing.
 * `beatStrength` affects *amplitude* only and is never an event trigger.
 * Values can only be applied within existing fixed-size crowd instance budgets.
 */
export function sampleAudienceExperienceV1073(cue:AudienceCueV1073|null|undefined,
 angle:number,seconds:number,beatStrength=0):AudienceSampleV1073{
 if(!cue?.active||!Number.isFinite(angle)||!Number.isFinite(seconds))
  return {light:0,lift:0,arms:0,faceStage:0};
 const beat=clamp(beatStrength,0,1);
 const swirl=(v:number)=>.5+.5*Math.cos(v);
 const t=Math.max(0,seconds),a=angle+cue.phase;
 const wave=swirl(a*2-t*(cue.mood==='anticipate'?2.2:1.35));
 const slow=swirl(t*.82+a*.72);
 const pulse=cue.mood==='listen'?.3+.3*slow:
   cue.mood==='anticipate'?.31+.59*wave:
   cue.mood==='celebrate'?.38+.58*slow:
   cue.mood==='encore'?.47+.49*wave:.26+.55*wave;
 const light=clamp(cue.wristband*(.28+.56*pulse+.08*beat*slow),0,.72);
 return {light,lift:clamp(cue.cheer*(.035+.13*wave),0,.12),
  arms:clamp(cue.cheer*(.28+.68*slow),0,.58),faceStage:clamp(cue.attention*(.4+.6*slow),0,.6)};
}
export const OFF_AUDIENCE_V1073=OFF;
