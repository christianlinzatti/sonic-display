/** V1067 · Floating Platform Experience 2.0. A pure, decorative overlay on
 * the original V1038 satellite platforms. No performer moves, no foot IK,
 * new meshes, hardware commands, audio polling or independent animation clock.
 * Authored V1040 scenes are NOT observed beat/drop signals.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import type {StageFormationCueV1066} from './arena360TransformingStageV1066';
export type FloatFormationV1067='halo'|'ripple'|'staircase'|'orbit'|'breath'|'crown';
export type FloatCueV1067={active:boolean;formation:FloatFormationV1067;power:number;phase:number};
export type FloatOffsetV1067={radial:number;rise:number;yaw:number;glow:number};
export const REST_FLOAT_V1067:FloatOffsetV1067=Object.freeze({radial:0,rise:0,yaw:0,glow:0});
export const OFF_FLOAT_V1067:FloatCueV1067=Object.freeze({active:false,formation:'halo',power:0,phase:0});
const FORMATIONS:Record<ArenaShowSceneV1040,FloatFormationV1067>={
 intro:'halo',verse:'ripple',build:'staircase',hook:'orbit',interlude:'breath',finale:'crown',
};
const TAU=Math.PI*2;
const clamp=(n:number,a:number,b:number)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
/** Apply only to the existing automatic floating effect after explicit opt-in.
 * A V1066 petal plan can synchronize timing, but is never mandatory.
 */
export function planFloatingExperienceV1067(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 showDesignerEnabled:boolean;floatingEnabled:boolean;showDirectorEnabled:boolean;
 floatMode?:string|null;reactive:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;
 show?:ArenaShowCueV1040|null;stageCueV1066?:StageFormationCueV1066|null;
}):FloatCueV1067{
 if(!input.enabled||!input.stageIsArena||!input.playing||input.reducedMotion||
   !input.showDesignerEnabled||!input.floatingEnabled||!input.showDirectorEnabled||
   !input.reactive||input.floatMode!=='auto'||input.performanceTier==='low')return OFF_FLOAT_V1067;
 const ms=input.progressMs,duration=input.durationMs,s=input.show,st=input.strength;
 if(!Number.isFinite(ms)||!Number.isFinite(duration)||!Number.isFinite(st)||
   ms! < 0||duration! < 30000||ms! > duration!||st! <= 0||st! > 100||
   !s?.active||!s.scene||!Object.prototype.hasOwnProperty.call(FORMATIONS,s.scene)||!Number.isFinite(s.intensity)||
   s.intensity<=0||s.intensity>100||!Number.isFinite(s.fade)||s.fade<=0||s.fade>1)
   return OFF_FLOAT_V1067;
 const stage=input.stageCueV1066;
 const sync=stage?.active&&Number.isFinite(stage.phase)&&stage.phase>=0&&stage.phase<=1;
 const phase=sync?stage.phase:clamp(ms!/duration!,0,1);
 const intensity=clamp(s.intensity/100,0,1)*clamp(st!/100,0,1)*s.fade;
 const tierGain=input.performanceTier==='balanced'?.62:1;
 // V1066 finale aligns on its bloom cue, otherwise the authored scene is authoritative.
 const stageGain=sync&&stage.shape==='bloom'&&s.scene==='finale'?1:.94;
 const power=clamp(intensity*tierGain*stageGain,0,1);
 if(power<=0)return OFF_FLOAT_V1067;
 return {active:true,formation:FORMATIONS[s.scene as ArenaShowSceneV1040],power,phase};
}
/** Per-satellite offsets are inside the original V1038 world-fixed ring:
 * radial +/-3.5 cm, additional lift <=18 cm and angular offset <=.028 rad.
 * With the original >=3.27 m radius, platforms cannot enter the cast floor.
 */
export function sampleFloatingExperienceV1067(index:number,count:number,cue:FloatCueV1067):FloatOffsetV1067{
 if(!cue.active||!Number.isFinite(cue.power)||cue.power<=0||cue.power>1||
   !Number.isFinite(cue.phase)||cue.phase<0||cue.phase>1)return {...REST_FLOAT_V1067};
 const n=Math.max(1,Math.min(6,Math.floor(Number.isFinite(count)?count:4)));
 const i=Math.max(0,Math.min(n-1,Math.floor(Number.isFinite(index)?index:0)));
 const a=TAU*i/n,ph=cue.phase*TAU;
 const ripple=Math.sin(a+ph),pair=i%2===0?1:-1;
 let radial=0,rise=0,yaw=0,glow=0;
 switch(cue.formation){
 case 'halo':radial=.15;rise=.2+.13*(1+ripple);yaw=pair*.2;glow=.3;break;
 case 'ripple':radial=.5*ripple;rise=.38+.25*(1+ripple);yaw=.35*ripple;glow=.45;break;
 case 'staircase':radial=.22*pair;rise=.20+.13*i; yaw=.45*pair;glow=.6;break;
 case 'orbit':radial=.50*ripple;rise=.68+.12*(1+ripple);yaw=.75*pair;glow=.75;break;
 case 'breath':radial=-.24;rise=.10+.10*(1+ripple);yaw=0;glow=.2;break;
 case 'crown':radial=.40*pair;rise=.70+.3*(i%3)/2;yaw=.55*pair;glow=1;break;
 default:return {...REST_FLOAT_V1067};
 }
 const power=cue.power;
 return {radial:clamp(radial*.035*power,-.035,.035),
  rise:clamp(rise*.18*power,0,.18),yaw:clamp(yaw*.028*power,-.028,.028),
  glow:clamp(glow*.04*power,0,.04)};
}
/** Single-owner interpolation in V1038's existing useFrame. Pause freezes,
 * disable/motion/low-tier immediately parks. No standalone ticker.
 */
export function stepFloatingExperienceV1067(old:FloatOffsetV1067,dt:number,target:FloatOffsetV1067,
 flags:{enabled:boolean;playing:boolean;reducedMotion:boolean;lowTier:boolean}):FloatOffsetV1067{
 if(!flags.enabled||flags.reducedMotion||flags.lowTier)return {...REST_FLOAT_V1067};
 const safe={radial:clamp(old.radial,-.035,.035),rise:clamp(old.rise,0,.18),
  yaw:clamp(old.yaw,-.028,.028),glow:clamp(old.glow,0,.04)};
 if(!flags.playing)return safe;
 const delta=clamp(dt,0,.1),blend=1-Math.exp(-delta*1.8);
 const approach=(previous:number,next:number,lo:number,hi:number,velocity:number)=>
  clamp(previous+clamp((clamp(next,lo,hi)-previous)*blend,-velocity*delta,velocity*delta),lo,hi);
 return {radial:approach(safe.radial,target.radial,-.035,.035,.08),
  rise:approach(safe.rise,target.rise,0,.18,.28),
  yaw:approach(safe.yaw,target.yaw,-.028,.028,.08),
  glow:approach(safe.glow,target.glow,0,.04,.10)};
}
