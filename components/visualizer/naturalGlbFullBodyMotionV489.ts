/** V489: conservative crossfade refinement for already installed GLB squat/kneel
 * animations. It does not modify skeletons, author clips or IK anchor positions.
 * Only use when a V481 low-pose clip is the incoming or outgoing automatic clip. */
export type GlbLowMotionInputV489={
  enteringLow:boolean;leavingLow:boolean;switchingLow:boolean;
  baseFadeSeconds:number;incomingDuration:number|null|undefined;
  plantedLeft:boolean;plantedRight:boolean;manualPriority:boolean;
  playing:boolean;reducedMotion:boolean;quality:'low'|'balanced'|'high'|string;
  matchScore:number|null|undefined;matchTime:number|null|undefined;
};
export type GlbLowMotionPlanV489={
  active:boolean;fadeSeconds:number;allowPoseMatch:boolean;allowPhaseFallback:boolean;
  phaseStart:'begin'|'matched';
};
const valid=(n:number)=>Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
/** Stable, allocation-free bounded decision; existing V311 crossfade remains in charge
 * for normal dance and all authored/manual clips. Longer supported transitions are
 * preferred to sudden foot snaps; a short loop never gets an overlong fade. */
export function planNaturalGlbMotionV489(input:GlbLowMotionInputV489):GlbLowMotionPlanV489{
 const base=valid(input.baseFadeSeconds)?clamp(input.baseFadeSeconds,.08,1.5):.3;
 const neutral:GlbLowMotionPlanV489={active:false,fadeSeconds:base,allowPoseMatch:true,allowPhaseFallback:true,phaseStart:'matched'};
 const lowChange=Boolean(input.enteringLow||input.leavingLow||input.switchingLow);
 if(!lowChange||input.manualPriority||!input.playing||input.reducedMotion||input.quality==='low')return neutral;
 const duration=input.incomingDuration;
 if(typeof duration!=='number'||!valid(duration)||duration<=0)return neutral;
 const feet=(input.plantedLeft?1:0)+(input.plantedRight?1:0);
 // Default is short enough for fast dance. Grounded feet need a more forgiving blend.
 const groundBoost=feet===2?1.22:feet===1?1.10:1;
 const actionBoost=input.switchingLow?1.15:input.enteringLow?1.08:1.17;
 const tier=input.quality==='balanced'?.92:1;
 const suggested=clamp(base*groundBoost*actionBoost*tier,.16,.62);
 const fade=clamp(Math.min(suggested,duration*.42),.08,.62);
 // Only a *strong* motion pose match can enter in the middle of a squat.
 // Otherwise start at frame zero; matching arbitrary late kneel frames causes pops.
 const threshold=input.enteringLow?.52:input.switchingLow?.42:.82;
 const matched=typeof input.matchScore==='number'&&valid(input.matchScore)&&input.matchScore>=0&&input.matchScore<=threshold
   &&typeof input.matchTime==='number'&&valid(input.matchTime)&&input.matchTime>=0&&input.matchTime<duration*(input.enteringLow?.65:.92);
 return {active:true,fadeSeconds:fade,allowPoseMatch:matched,allowPhaseFallback:false,phaseStart:matched?'matched':'begin'};
}
