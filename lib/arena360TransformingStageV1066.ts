/** V1066 · Transforming Stage 3.0: subordinate, deterministic scenic motion.
 * Existing V1037 petals (radius >= 2.86) are the ONLY moving geometry.
 * Central cast, ground/floor, camera, audio and hardware are never modified.
 * A V1040 scene is an authored plan, NOT evidence of a detected drop/beat.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
export type StageShapeV1066='iris'|'crown'|'helix'|'fan'|'halo'|'bloom';
export type StageFormationCueV1066={active:boolean;shape:StageShapeV1066;amount:number;phase:number};
export type StagePetalOffsetV1066={radial:number;lift:number;yaw:number;ledBonus:number};
export const INITIAL_STAGE_PETAL_V1066:StagePetalOffsetV1066=Object.freeze({radial:0,lift:0,yaw:0,ledBonus:0});
const SHAPES:Record<ArenaShowSceneV1040,StageShapeV1066>={
 intro:'crown',verse:'iris',build:'helix',hook:'fan',interlude:'halo',finale:'bloom',
};
const ZERO:StageFormationCueV1066=Object.freeze({active:false,shape:'halo',amount:0,phase:0});
const clamp=(x:number,lo:number,hi:number)=>Number.isFinite(x)?Math.max(lo,Math.min(hi,x)):lo;
/** Existing deck mode 'fan', 'spiral', 'halo' always wins; the new effects are
 * strictly an OPT-IN overlay for the existing 'auto' setting and a real show.
 */
export function planStageFormationV1066(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 showDesignerEnabled:boolean;decorEnabled:boolean;manualDeckMode?:string|null;
 performanceTier?:'low'|'balanced'|'high'|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;
 show?:ArenaShowCueV1040|null;
}):StageFormationCueV1066{
 if(!input.enabled||!input.stageIsArena||!input.playing||input.reducedMotion||
   !input.showDesignerEnabled||!input.decorEnabled||input.manualDeckMode!=='auto'||
   input.performanceTier==='low')return ZERO;
 const ms=input.progressMs,duration=input.durationMs,show=input.show;
 if(!Number.isFinite(ms)||!Number.isFinite(duration)||(duration??0)<30000||
   (ms??-1)<0||(ms??0)>(duration??0)||!Number.isFinite(input.strength)||
   (input.strength??0)<=0||!show?.active||!show.scene||
   !Object.prototype.hasOwnProperty.call(SHAPES,show.scene)||
   !Number.isFinite(show.fade)||show.fade<=0||show.fade>1||
   !Number.isFinite(show.intensity)||show.intensity<=0||show.intensity>100)return ZERO;
 const amount=clamp(input.strength??0,0,80)/80*clamp(show.intensity/100,0,1)*
   clamp(show.fade,0,1)*(input.performanceTier==='balanced'?.65:1);
 if(amount<=0)return ZERO;
 return {active:true,shape:SHAPES[show.scene],amount,phase:clamp((ms??0)/(duration??1),0,1)};
}
/** Bounded per-petal offsets outside the stable central platform.
 * Max extension 6.5 cm, lift 8.5 cm, yaw 0.045 rad. Extra outer edge <=3.665m.
 */
export function sampleStagePetalV1066(index:number,count:number,cue:StageFormationCueV1066):StagePetalOffsetV1066{
 if(!cue?.active||!Number.isFinite(cue.amount)||cue.amount<=0||
   !Number.isFinite(cue.phase)||cue.phase<0||cue.phase>1)return {...INITIAL_STAGE_PETAL_V1066};
 const n=Math.max(1,Math.min(16,Math.floor(Number.isFinite(count)?count:8)));
 const i=Math.max(0,Math.min(n-1,Math.floor(Number.isFinite(index)?index:0)));
 const a=Math.PI*2*(i+.5)/n,phase=cue.phase*Math.PI*2;
 const stripe=(i%2===0?1:-1),wave=.5+.5*Math.sin(a*1.5+phase*3);
 let radial=0,lift=0,yaw=0,led=.3;
 switch(cue.shape){
  case 'crown':radial=.35;lift=i%2===0?1:.30;yaw=stripe*.3;led=.8;break;
  case 'iris':radial=.28+.48*wave;lift=.22;yaw=stripe*.85;led=.5;break;
  case 'helix':radial=.32+.60*wave;lift=.25+.7*wave;yaw=(wave-.5)*1.6;led=.8;break;
  case 'fan':radial=i%2===0?1:.55;lift=i%2===0?.5:.25;yaw=stripe*.65;led=.75;break;
  case 'halo':radial=.22;lift=.08;yaw=0;led=.30;break;
  case 'bloom':radial=.95;lift=.84;yaw=stripe*.15;led=1;break;
  default:return {...INITIAL_STAGE_PETAL_V1066};
 }
 const gain=clamp(cue.amount,0,1);
 return {radial:clamp(radial*.065*gain,0,.065),
  lift:clamp(lift*.085*gain,0,.085),
  yaw:clamp(yaw*.045*gain,-.045,.045),
  ledBonus:clamp(led*.05*gain,0,.05)};
}
/** Existing V1037 useFrame callback owns the only frame clock. Pause holds the
 * last pose; disabling, reduced motion or low tier parks the V1066 offsets.
 */
export function stepStagePetalV1066(previous:StagePetalOffsetV1066,dt:number,
 target:StagePetalOffsetV1066,settings:{enabled:boolean;playing:boolean;reducedMotion:boolean;lowTier:boolean}):StagePetalOffsetV1066{
 if(!settings.enabled||settings.reducedMotion||settings.lowTier)return {...INITIAL_STAGE_PETAL_V1066};
 const safe={radial:clamp(previous.radial,0,.065),lift:clamp(previous.lift,0,.085),
  yaw:clamp(previous.yaw,-.045,.045),ledBonus:clamp(previous.ledBonus,0,.05)};
 if(!settings.playing)return safe;
 const alpha=1-Math.exp(-clamp(dt,0,.1)*2.5);
 return {radial:clamp(safe.radial+(clamp(target.radial,0,.065)-safe.radial)*alpha,0,.065),
  lift:clamp(safe.lift+(clamp(target.lift,0,.085)-safe.lift)*alpha,0,.085),
  yaw:clamp(safe.yaw+(clamp(target.yaw,-.045,.045)-safe.yaw)*alpha,-.045,.045),
  ledBonus:clamp(safe.ledBonus+(clamp(target.ledBonus,0,.05)-safe.ledBonus)*alpha,0,.05)};
}
