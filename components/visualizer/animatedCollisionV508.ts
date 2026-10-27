/** V508: read-only, sampled animated capsule clearance. This is neither a
 * skinned-mesh collision solver nor a replacement for V506 root/foot guards.
 * Geometry is in the same world-space units for every slot (Three.js Y-up).
 */
import type {CollisionSlotV506} from './multiAvatarCollisionAvoidanceV506';
export type MotionPointV508=readonly [number,number,number];
export interface MotionCapsuleV508 {a:MotionPointV508;b:MotionPointV508;radius:number;part:'torso'|'arm';}
export interface MotionSampleV508 {at:number;capsules:readonly MotionCapsuleV508[];}
export interface AnimatedSlotV508 {risk:number;gestureScale:number;accentScale:number;closestSurface:number;}
export interface AnimatedCollisionPlanV508 {active:boolean;pairsChecked:number;nearPairs:number;slots:AnimatedSlotV508[];}
export interface AnimatedCollisionInputV508 {
  samples:readonly (MotionSampleV508|undefined)[];
  count:number;now:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
  tier:'low'|'balanced'|'high';
}
const clamp=(v:number,min:number,max:number)=>Number.isFinite(v)?Math.min(max,Math.max(min,v)):min;
const finite=(p:MotionPointV508)=>p?.length===3&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<1e5);
export const validCapsuleV508=(c:MotionCapsuleV508)=>!!c&&finite(c.a)&&finite(c.b)&&
  Number.isFinite(c.radius)&&c.radius>=.035&&c.radius<=.34&&
  (c.part==='torso'||c.part==='arm')&&
  Math.hypot(c.a[0]-c.b[0],c.a[1]-c.b[1],c.a[2]-c.b[2])>=.04&&
  Math.hypot(c.a[0]-c.b[0],c.a[1]-c.b[1],c.a[2]-c.b[2])<=3.8;
const sub=(a:MotionPointV508,b:MotionPointV508):[number,number,number]=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:MotionPointV508,b:MotionPointV508)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
/** Exact closest distance between two 3D segments, including parallel and
 * degenerate lines (Ericson-style clamping, no allocations of Three objects).
 */
export function segmentDistanceV508(a:MotionPointV508,b:MotionPointV508,c:MotionPointV508,d:MotionPointV508):number {
  if(![a,b,c,d].every(finite))return Infinity;
  const u=sub(b,a),v=sub(d,c),w=sub(a,c);
  const aa=dot(u,u),bb=dot(u,v),cc=dot(v,v),dd=dot(u,w),ee=dot(v,w);
  const D=aa*cc-bb*bb;let sn=0,sd=D,tn=0,td=D;
  if(aa<1e-12&&cc<1e-12)return Math.hypot(...w);
  if(aa<1e-12){sn=0;sd=1;tn=ee;td=cc;}
  else if(cc<1e-12){sn=-dd;sd=aa;tn=0;td=1;}
  else {
    if(D<1e-12){sn=0;sd=1;tn=ee;td=cc;}
    else {sn=bb*ee-cc*dd;tn=aa*ee-bb*dd;
      if(sn<0){sn=0;tn=ee;td=cc;}
      else if(sn>sd){sn=sd;tn=ee+bb;td=cc;}
    }
  }
  if(tn<0){tn=0;if(-dd<0)sn=0;
    else if(-dd>aa)sn=sd;else{sn=-dd;sd=aa;}}
  else if(tn>td){tn=td;if(-dd+bb<0)sn=0;
    else if(-dd+bb>aa)sn=sd;else{sn=-dd+bb;sd=aa;}}
  const s=Math.abs(sd)<1e-12?0:sn/sd,t=Math.abs(td)<1e-12?0:tn/td;
  return Math.hypot(w[0]+s*u[0]-t*v[0],w[1]+s*u[1]-t*v[1],w[2]+s*u[2]-t*v[2]);
}
const neutral=():AnimatedSlotV508=>({risk:0,gestureScale:1,accentScale:1,closestSurface:Infinity});
const off=():AnimatedCollisionPlanV508=>({active:false,pairsChecked:0,nearPairs:0,slots:[]});
/** Six capped segments per performer, four performers at most. Fresh samples
 * only: never infer bone positions from an unloaded, paused or stale GLB.
 */
export function planAnimatedCollisionV508(input:AnimatedCollisionInputV508):AnimatedCollisionPlanV508 {
 const {count,now}=input;
 if(!Number.isInteger(count)||count<2||count>4||!Number.isFinite(now)||!input.playing||input.reducedMotion||
   input.manualPriority||input.tier==='low')return off();
 const slots=Array.from({length:count},neutral);
 let pairsChecked=0,nearPairs=0;
 for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
   const a=input.samples[i],b=input.samples[j];
   if(!a||!b||!Number.isFinite(a.at)||!Number.isFinite(b.at)||
      now-a.at<0||now-b.at<0||now-a.at>.42||now-b.at>.42||
      a.capsules.length>6||b.capsules.length>6||a.capsules.length===0||b.capsules.length===0)continue;
   const ca=a.capsules.filter(validCapsuleV508),cb=b.capsules.filter(validCapsuleV508);
   if(!ca.length||!cb.length)continue;
   pairsChecked++;
   let smallest=Infinity,found=false;
   for(const x of ca)for(const y of cb){
      // A lifted hand near someone's torso matters just as much as two arms.
      const surface=segmentDistanceV508(x.a,x.b,y.a,y.b)-x.radius-y.radius;
      smallest=Math.min(smallest,surface);
   }
   const near=smoothRiskV508(smallest);
   if(smallest<.07){nearPairs++;found=true;}
   if(near>0||found)for(const k of [i,j]){
      slots[k].risk=Math.max(slots[k].risk,near);
      slots[k].closestSurface=Math.min(slots[k].closestSurface,smallest);
   }
 }
 const tierFactor=input.tier==='balanced'?.75:1;
 for(const s of slots){
    s.risk=clamp(s.risk*tierFactor,0,1);
    s.gestureScale=clamp(1-.72*s.risk,.28,1);
    s.accentScale=clamp(1-.45*s.risk,.55,1);
 }
 return {active:slots.some(s=>s.risk>0),pairsChecked,nearPairs,slots};
}
export function smoothRiskV508(surface:number):number {
 if(!Number.isFinite(surface))return 0;
 const t=clamp((.25-surface)/.34,0,1);return t*t*(3-2*t);
}
/** Combine without rewriting V506-approved root translations or IK decisions. */
export function mergeAnimatedSlotV508(base:CollisionSlotV506|undefined,motion:AnimatedSlotV508|undefined):CollisionSlotV506 {
 const fallback:CollisionSlotV506=base??{risk:0,gestureScale:1,accentScale:1,depthOffset:0,closestApproach:Infinity};
 if(!motion)return fallback;
 return {...fallback,risk:Math.max(fallback.risk,motion.risk),
   gestureScale:Math.min(fallback.gestureScale,motion.gestureScale),
   accentScale:Math.min(fallback.accentScale,motion.accentScale)};
}
export interface AnimatedBodyRegistryV508 {
 set(slot:number,identity:string,sample:MotionSampleV508):void;
 get(slot:number,now:number):MotionSampleV508|undefined;
 clear(slot:number,identity:string):void;
}
export function createAnimatedBodyRegistryV508():AnimatedBodyRegistryV508 {
 const slots=new Map<number,{identity:string;sample:MotionSampleV508}>();
 const validSlot=(slot:number)=>Number.isInteger(slot)&&slot>=0&&slot<4;
 return {set(slot,identity,sample){if(validSlot(slot)&&identity&&Number.isFinite(sample?.at)&&
     sample.capsules.length>0&&sample.capsules.length<=6&&sample.capsules.every(validCapsuleV508))slots.set(slot,{identity,sample});},
  get(slot,now){const s=slots.get(slot)?.sample;
    return s&&Number.isFinite(now)&&now>=s.at&&now-s.at<=.42?s:undefined;},
  clear(slot,identity){if(slots.get(slot)?.identity===identity)slots.delete(slot);}};
}
