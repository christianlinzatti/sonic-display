/** V1068 · Holographic Concert FX 3.0.
 * Pure and deterministic VISUAL staging of the existing V1039 portal fixtures.
 * Show scenes are authored templates, not detected song events. Never generates
 * hardware lasers, Govee commands, avatars, words, camera shots or network IO.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import type {StageFormationCueV1066} from './arena360TransformingStageV1066';
import type {FloatCueV1067} from './arena360FloatingExperienceV1067';
export type HologramLookV1068='awakening'|'reflection'|'vortex'|'duet'|'breath'|'finale';
export type HologramCueV1068={active:boolean;look:HologramLookV1068;power:number;phase:number;sync:'show'|'stage'|'float'};
export type HologramOffsetV1068={radial:number;rise:number;rotation:number;scale:number;echo:number;glow:number};
export const OFF_HOLOGRAM_V1068:HologramCueV1068=Object.freeze({active:false,look:'awakening',power:0,phase:0,sync:'show'});
export const REST_HOLOGRAM_V1068:HologramOffsetV1068=Object.freeze({radial:0,rise:0,rotation:0,scale:1,echo:0,glow:0});
const LOOKS:Record<ArenaShowSceneV1040,HologramLookV1068>={
 intro:'awakening',verse:'reflection',build:'vortex',hook:'duet',interlude:'breath',finale:'finale',
};
const clamp=(x:number,min:number,max:number)=>Number.isFinite(x)?Math.max(min,Math.min(max,x)):min;
export function planHolographicConcertV1068(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 showDesignerEnabled:boolean;showDirectorEnabled:boolean;hologramsEnabled:boolean;
 portalPattern?:string|null;performanceTier?:'low'|'balanced'|'high'|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;
 show?:ArenaShowCueV1040|null;stageCueV1066?:StageFormationCueV1066|null;
 floatCueV1067?:FloatCueV1067|null;
}):HologramCueV1068{
 if(!input.enabled||!input.stageIsArena||!input.playing||input.reducedMotion||!input.reactive||
  !input.showDesignerEnabled||!input.showDirectorEnabled||!input.hologramsEnabled||
  input.portalPattern!=='auto'||input.performanceTier==='low')return OFF_HOLOGRAM_V1068;
 const {progressMs:ms,durationMs:duration,strength,show}=input;
 if(!Number.isFinite(ms)||!Number.isFinite(duration)||!Number.isFinite(strength)||
  ms!<0||duration!<30000||ms!>duration!||strength!<=0||strength!>80||
  !show?.active||!show.scene||!(show.scene in LOOKS)||!Number.isFinite(show.intensity)||
  show.intensity<=0||show.intensity>100||!Number.isFinite(show.fade)||
  show.fade<=0||show.fade>1)return OFF_HOLOGRAM_V1068;
 const st=input.stageCueV1066,fl=input.floatCueV1067;
 const hasFloat=fl?.active===true&&Number.isFinite(fl.phase)&&fl.phase>=0&&fl.phase<=1;
 const hasStage=st?.active===true&&Number.isFinite(st.phase)&&st.phase>=0&&st.phase<=1;
 const phase=hasFloat?fl!.phase:hasStage?st!.phase:clamp(ms!/duration!,0,1);
 const sync=hasFloat?'float':hasStage?'stage':'show';
 const tierGain=input.performanceTier==='balanced'?.68:1;
 // Synchronization does not bypass the original opacity/brightness bounds.
 const power=clamp(strength!/80*show.intensity/100*show.fade*tierGain,0,1);
 if(power<=0)return OFF_HOLOGRAM_V1068;
 return {active:true,look:LOOKS[show.scene as ArenaShowSceneV1040],power,phase,sync};
}
/** Per-fixture offsets for the original world-fixed hologram ring. Extra radial
 * shift <=5cm and vertical shift <=9cm; never intersect the central cast floor.
 * The visual echo is a silhouette only, not a performer/cast member.
 */
export function sampleHolographicConcertV1068(index:number,count:number,cue:HologramCueV1068):HologramOffsetV1068{
 if(!cue.active||!Number.isFinite(cue.power)||cue.power<=0||cue.power>1||
  !Number.isFinite(cue.phase)||cue.phase<0||cue.phase>1)return {...REST_HOLOGRAM_V1068};
 const n=clamp(Math.floor(count),1,9),i=clamp(Math.floor(index),0,n-1),
  a=2*Math.PI*i/n,phase=cue.phase*Math.PI*2,wave=Math.sin(a+phase),pair=i%2===0?1:-1;
 let radial=0,rise=0,rotation=0,echo=0,glow=0,scale=1;
 switch(cue.look){
  case 'awakening':rise=.25+.1*wave;echo=.24;glow=.2;scale=1.02;break;
  case 'reflection':radial=.35*wave;rotation=.16*wave;echo=.4;glow=.26;break;
  case 'vortex':radial=.8*wave;rotation=.65*pair;rise=.25*wave;echo=.58;glow=.45;break;
  case 'duet':radial=.65*pair;rotation=.28*pair;rise=.22*wave;echo=.88;glow=.52;scale=1.06;break;
  case 'breath':rise=.16*wave;echo=.19;glow=.14;scale=.95;break;
  case 'finale':radial=.85*pair;rise=.6+.35*wave;rotation=.8*pair;echo=1;glow=.7;scale=1.09;break;
  default:return {...REST_HOLOGRAM_V1068};
 }
 const p=cue.power;
 return {radial:clamp(radial*.05*p,-.05,.05),rise:clamp(rise*.09*p,-.09,.09),
  rotation:clamp(rotation*.095*p,-.095,.095),scale:clamp(1+(scale-1)*p,.94,1.10),
  echo:clamp(echo*p,0,1),glow:clamp(glow*.12*p,0,.084)};
}
