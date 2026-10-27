/** V596 – Natural Dance & Footwork Quality 6.0.
 * Ground contact is supplied by the EXISTING previous-frame IK observer.
 * This pass never creates steps/contacts, changes root travel, edits a GLB
 * AnimationAction, or moves any bone/ankle/IK anchor directly.
 */
import type {AdvancedFootworkOutputV486,FootSupportV486,FootworkSlotV486} from './advancedDanceFootworkV486';
import type {AvatarRigMotion} from './avatarRigController';

const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const safeRate=(delta:number,tau:number)=>clamp(1-Math.exp(-delta/tau),0,1);
const rap=(genre?:string|null)=>/deutschrap|hip.?hop|trap|drill|\brap\b/i.test(genre??'');
const hard=(genre?:string|null)=>/hardstyle|hardtekk|hardtek|rawstyle|hardcore/i.test(genre??'');
const tau=(genre?:string|null)=>hard(genre)?.070:rap(genre)?.145:.115;

export type ReleasePhaseV596={left:number;right:number;leftPlanted:boolean;rightPlanted:boolean;known:boolean};
const newPhase=():ReleasePhaseV596=>({left:1,right:1,leftPlanted:false,rightPlanted:false,known:false});
export type GroupFootworkQualityStateV596={trackId:string;lastSeconds:number;count:number;phases:ReleasePhaseV596[]};
export const newGroupFootworkQualityStateV596=():GroupFootworkQualityStateV596=>({trackId:'',lastSeconds:-1,count:0,phases:[]});
export type GroupFootworkQualityInputV596={trackId?:string|null;seconds:number;delta:number;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;automaticGroup:boolean;footLocked:boolean;
 tier:'low'|'balanced'|'high';genre?:string|null;support:readonly FootSupportV486[]};
/** Time-domain release envelopes. An observed plant stops immediately. After
 * release, the source clip / V486 step is gradually restored (not generated).
 * Unknown support is never assumed to be planted. State is explicit: seeks,
 * track swaps and disabled motion never retain previous contact information.
 */
export function stepGroupFootworkQualityV596(state:GroupFootworkQualityStateV596,base:AdvancedFootworkOutputV486,input:GroupFootworkQualityInputV596):{
 state:GroupFootworkQualityStateV596;footwork:AdvancedFootworkOutputV486;active:boolean}{
 const neutral=()=>({state:newGroupFootworkQualityStateV596(),footwork:base,active:false});
 const count=base.slots.length;
 if(!base.active||(count!==3&&count!==4)||input.support.length<count||!input.trackId?.trim()||
  !input.playing||input.reducedMotion||input.manualPriority||!input.automaticGroup||input.footLocked||input.tier==='low'||
  !finite(input.seconds)||input.seconds<0||!finite(input.delta)||input.delta<=0||input.delta>.15||
  base.slots.some(s=>![s.offsetX,s.offsetZ,s.liftLeft,s.liftRight,s.rootSpeed,s.weightShift].every(finite))){return neutral();}
 const reset=state.trackId!==input.trackId||state.lastSeconds<0||state.count!==count||
  state.phases.length!==count||input.seconds<state.lastSeconds-.08||input.seconds-state.lastSeconds>.4;
 const factor=safeRate(input.delta,tau(input.genre));
 const phases:ReleasePhaseV596[]=[];
 const slots=base.slots.map((s,i):FootworkSlotV486=>{
  const support=input.support[i];const known=support.tracked;
  const leftPlanted=known&&support.leftPlanted,rightPlanted=known&&support.rightPlanted;
  const previous=reset?newPhase():state.phases[i];
  const envelope=(planted:boolean,wasPlanted:boolean,old:number)=>{
   if(planted)return 0;
   if(!known)return 1; // Unknown contact is not evidence for a held stance.
   return !reset&&previous.known&&wasPlanted?0:reset||!previous.known?1:clamp(old+(1-old)*factor,0,1);
  };
  const left=envelope(leftPlanted,previous.leftPlanted,previous.left);
  const right=envelope(rightPlanted,previous.rightPlanted,previous.right);
  phases.push({left,right,leftPlanted,rightPlanted,known});
  const stand=known&&leftPlanted&&rightPlanted;
  // No sway amplification or non-zero shift when the original has zero sway.
  const shiftGain=stand?.70:known&&(leftPlanted||rightPlanted)?.90:1;
  const shift=clamp(s.weightShift*shiftGain,-.014,.014);
  return {...s,liftLeft:leftPlanted?0:clamp(s.liftLeft,0,1)*left,
   liftRight:rightPlanted?0:clamp(s.liftRight,0,1)*right,
   weightShift:Math.abs(shift)<=Math.abs(s.weightShift)?shift:s.weightShift};
 });
 return {state:{trackId:input.trackId!,lastSeconds:input.seconds,count,phases},footwork:{active:base.active,slots},active:true};
}

export type GlbFootworkQualityStateV596={trackId:string;modelKey:string;lastSeconds:number;
 release:number;wasPlanted:boolean;known:boolean};
export const newGlbFootworkQualityStateV596=():GlbFootworkQualityStateV596=>({trackId:'',modelKey:'',lastSeconds:-1,release:1,wasPlanted:false,known:false});
export type GlbFootworkQualityInputV596={trackId?:string|null;modelKey:string;seconds:number;delta:number;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;footIKEnabled:boolean;contactKnown:boolean;
 plantedLeft:boolean;plantedRight:boolean;genre?:string|null;quality:'low'|'balanced'|'high'|string};
/** A small last-mile adjustment to V545/V587's ALREADY COMPUTED additive rig
 * values. V545 still owns initial stance damping, IK still owns real foot lock.
 * The release envelope is only used on the existing generated footStep value.
 */
export function stepGlbFootworkQualityV596<T extends AvatarRigMotion>(state:GlbFootworkQualityStateV596,motion:T,input:GlbFootworkQualityInputV596):{
 state:GlbFootworkQualityStateV596;motion:T;active:boolean}{
 const neutral=()=>({state:newGlbFootworkQualityStateV596(),motion,active:false});
 if(!input.trackId?.trim()||!input.modelKey||!input.playing||input.reducedMotion||input.manualPriority||
  !input.footIKEnabled||!input.contactKnown||input.quality==='low'||
  !finite(input.seconds)||input.seconds<0||!finite(input.delta)||input.delta<=0||input.delta>.15||
  ![motion.footStep,motion.legGroove,motion.weightShift].every(v=>v===undefined||finite(v)))return neutral();
 const planted=input.plantedLeft||input.plantedRight;
 const both=input.plantedLeft&&input.plantedRight;
 const reset=state.trackId!==input.trackId||state.modelKey!==input.modelKey||state.lastSeconds<0||
  input.seconds<state.lastSeconds-.08||input.seconds-state.lastSeconds>.4;
 const release=planted?0:reset||!state.known?1:state.wasPlanted?0:clamp(state.release+safeRate(input.delta,tau(input.genre)),0,1);
 const next={trackId:input.trackId!,modelKey:input.modelKey,lastSeconds:input.seconds,
  release,wasPlanted:planted,known:true};
 // Do not add a positive or negative step where V545 provided none.
 // On landing, immediately reduce the residual additive foot impulse;
 // when leaving a planted stance, increase no faster than the envelope.
 const stepGain=planted?(both?.78:.91):(.72+.28*release);
 const grooveGain=both?.93:1;
 const weightGain=both?.85:1;
 return {state:next,active:true,motion:{...motion,
  footStep:motion.footStep===undefined?undefined:motion.footStep*stepGain,
  legGroove:motion.legGroove===undefined?undefined:motion.legGroove*grooveGain,
  weightShift:motion.weightShift===undefined?undefined:motion.weightShift*weightGain} as T};
}
