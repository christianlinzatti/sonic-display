/** V506 – bounded predictive interaction clearance for 2–4 performers.
 * The stage has no consistently calibrated per-GLB limb dimensions. Therefore
 * these are conservative torso/reach envelopes, NOT animated mesh collisions.
 * Read-only planner; only optional automatic-group root accents may move, and
 * V494 foot-contact approval is required by safeCollisionDepthV506.
 */
import type {PartnerGestureCue} from './partnerGestureEngine';

export type StagePointV506=readonly [number,number,number];
export interface CollisionSlotV506 {
  /** Risk of a near body/reach encounter, 0..1. */
  risk:number;
  /** Scales optional automatic upper-body gestures; never authored hand IK. */
  gestureScale:number;
  /** Scales optional automatic group root accents and yaw. */
  accentScale:number;
  /** Bounded Z-only intention: never apply without the V494 guard. */
  depthOffset:number;
  /** Swept-path minimum separation in stage units, not a mesh distance. */
  closestApproach:number;
}
export interface CollisionPlanV506 {
  active:boolean;closePairs:number;predictedPairs:number;
  slots:CollisionSlotV506[];
}
export interface CollisionInputV506 {
  positions:readonly StagePointV506[];
  targets:readonly StagePointV506[];
  count:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
  automaticGroup:boolean;tier:'low'|'balanced'|'high';
  /** Optional calibrated torso half-widths; absent => conservative 0.42 m. */
  torsoRadii?:readonly number[];
  /** V507 measured rest-pose reach, bounded; when absent preserve old V506. */
  armReaches?:readonly number[];
  /** Optional current non-manual arm emphasis from 0..1. */
  gestureIntensity?:readonly number[];
}
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
const valid=(p:StagePointV506)=>p?.length===3&&p.every(Number.isFinite);
const zeroSlot=():CollisionSlotV506=>({risk:0,gestureScale:1,accentScale:1,depthOffset:0,closestApproach:Infinity});
const off=():CollisionPlanV506=>({active:false,closePairs:0,predictedPairs:0,slots:[]});
/** Minimum planar separation of simultaneous linear root movement during the
 * next formation interpolation. Handles equal velocities and intersecting paths.
 */
export function sweptDistanceV506(a:StagePointV506,b:StagePointV506,
  futureA:StagePointV506,futureB:StagePointV506):number {
  if(![a,b,futureA,futureB].every(valid))return Infinity;
  const rx=a[0]-b[0],rz=a[2]-b[2];
  const vx=(futureA[0]-a[0])-(futureB[0]-b[0]);
  const vz=(futureA[2]-a[2])-(futureB[2]-b[2]);
  const v2=vx*vx+vz*vz;
  const t=v2>1e-10?clamp(-(rx*vx+rz*vz)/v2,0,1):0;
  return Math.hypot(rx+vx*t,rz+vz*t);
}
/** Predicts torso and *approximate* arm-reach proximity with O(n²), n<=4.
 * Only short additive, safe-to-ignore suggestions; does not rewrite stage cues.
 */
export function planMultiAvatarCollisionV506(input:CollisionInputV506):CollisionPlanV506 {
  const {count,positions,targets}=input;
  if(!Number.isInteger(count)||count<2||count>4||!input.playing||input.reducedMotion||
    input.manualPriority||positions.length<count||targets.length<count||
    !positions.slice(0,count).every(valid)||!targets.slice(0,count).every(valid))return off();
  const slots=Array.from({length:count},zeroSlot);
  let closePairs=0,predictedPairs=0;
  const radii=Array.from({length:count},(_,i)=>clamp(input.torsoRadii?.[i]??.42,.30,.58));
  for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
    const current=Math.hypot(positions[i][0]-positions[j][0],positions[i][2]-positions[j][2]);
    const future=Math.hypot(targets[i][0]-targets[j][0],targets[i][2]-targets[j][2]);
    const swept=sweptDistanceV506(positions[i],positions[j],targets[i],targets[j]);
    slots[i].closestApproach=Math.min(slots[i].closestApproach,swept);
    slots[j].closestApproach=Math.min(slots[j].closestApproach,swept);
    const torso=radii[i]+radii[j];
    const measuredReach=(clamp(input.armReaches?.[i]??.12,.085,.19)+clamp(input.armReaches?.[j]??.12,.085,.19))*.5;
    const reach=measuredReach+Math.min(.20,(clamp(input.gestureIntensity?.[i]??0,0,1)+
      clamp(input.gestureIntensity?.[j]??0,0,1))*.11);
    const threshold=torso+reach;
    // A path crossing can be dangerous even when both endpoints are far apart.
    const risk=smooth((threshold+.34-swept)/.62);
    if(current<threshold)closePairs++;
    if(swept<threshold)predictedPairs++;
    if(!risk)continue;
    for(const slot of [i,j]){
      slots[slot].risk=Math.max(slots[slot].risk,risk);
      slots[slot].closestApproach=Math.min(slots[slot].closestApproach,swept);
    }
    if(!input.automaticGroup||input.tier==='low')continue;
    // Stage's automatic lanes own X; only try a tiny, stable Z separation.
    // The pair's target Z separation sets the sign, not the current head yaw.
    const sign=Math.abs(targets[i][2]-targets[j][2])>.008?
      Math.sign(targets[i][2]-targets[j][2]):-1;
    const weight=clamp((threshold+.12-Math.min(current,future,swept))*.21*risk,0,.115)*
      (input.tier==='balanced'?.58:1);
    if(weight<=0)continue;
    const beforeI=slots[i].depthOffset,beforeJ=slots[j].depthOffset;
    const candidateI=clamp(beforeI+sign*weight,-.14,.14);
    const candidateJ=clamp(beforeJ-sign*weight,-.14,.14);
    const movedI:StagePointV506=[targets[i][0],targets[i][1],targets[i][2]+candidateI];
    const movedJ:StagePointV506=[targets[j][0],targets[j][1],targets[j][2]+candidateJ];
    const original=sweptDistanceV506(positions[i],positions[j],
      [targets[i][0],targets[i][1],targets[i][2]+beforeI],
      [targets[j][0],targets[j][1],targets[j][2]+beforeJ]);
    const improved=sweptDistanceV506(positions[i],positions[j],movedI,movedJ);
    // Do not recommend a dodge that makes the predicted closest approach worse.
    if(improved>original+.001){slots[i].depthOffset=candidateI;slots[j].depthOffset=candidateJ;}
  }
  for(const slot of slots){
    slot.gestureScale=clamp(1-.78*slot.risk,.22,1);
    slot.accentScale=clamp(1-.90*slot.risk,.10,1);
  }
  return {active:slots.some(slot=>slot.risk>0),closePairs,predictedPairs,slots};
}
/** V494 alone can authorize additive depth; locked feet and large drift veto it.
 * In low tier we keep no additional root animation, even if arms are damped.
 */
export function safeCollisionDepthV506(slot:CollisionSlotV506|undefined,
  ground:{active:boolean;phase:string;support:string;gain:number;driftCm:number}|undefined):number {
  if(!slot||!ground?.active||!Number.isFinite(ground.driftCm)||
    !Number.isFinite(ground.gain)||ground.driftCm>4||
    ground.phase==='low'||ground.phase==='lowering'||ground.phase==='rising'||
    ground.support==='both')return 0;
  const grounded=ground.support==='none'?.75:.43;
  return clamp(slot.depthOffset*grounded*clamp(ground.gain,0,1),-.11,.11);
}
/** Scale only existing *automatic* gesture accents; no bones or hand IK touched. */
export function softenCollisionGestureV506(cue:PartnerGestureCue,slot:CollisionSlotV506|undefined):PartnerGestureCue {
  const factor=clamp(slot?.gestureScale??1,0,1);
  return {leftLift:clamp(cue.leftLift*factor,0,.35),rightLift:clamp(cue.rightLift*factor,0,.35),
    shoulder:clamp(cue.shoulder*factor,-.13,.13),lean:clamp(cue.lean*factor,-.05,.05),
    intensity:clamp(cue.intensity*factor,0,1)};
}
