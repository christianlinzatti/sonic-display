/** V145: conservative additive partner gestures for two independently animated dancers.
 * Outputs angular offsets, never replaces source animation clips or moves body roots.
 */
import type { DuoScene } from "./duoChoreographyDirector";
export type PartnerGestureCue = { leftLift: number; rightLift: number; shoulder: number; lean: number; intensity: number };
export const NEUTRAL_GESTURE: PartnerGestureCue = {leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0};
const clamp = (n:number, lo=0, hi=1) => Math.max(lo,Math.min(hi,Number.isFinite(n)?n:0));
/** Deterministic four-beat phrases: greeting, answer, shared accent, recovery. */
export function partnerGestureCue(mode:DuoScene, beat:number, phrase:number, playing:boolean, reducedMotion:boolean, secondary=false, visibility=1):PartnerGestureCue {
  if (!playing || reducedMotion || mode === "solo") return {...NEUTRAL_GESTURE};
  const strength=clamp(beat)*clamp(visibility);
  const p=((Number.isFinite(phrase)?phrase:0)%1+1)%1;
  const window=(at:number)=>Math.max(0,1-Math.abs(p-at)/0.16);
  const leader=window(0.15), response=window(0.4), together=window(0.68);
  const duet=mode === "duet" ? 1 : mode === "mirror" ? 0.62 : 0.35;
  const directed=secondary ? response : leader;
  const reply=secondary ? leader : response;
  const pulse=strength*duet;
  return {
    leftLift: clamp(pulse*(0.34*directed+0.12*together),0,0.35),
    rightLift: clamp(pulse*(0.34*reply+0.12*together),0,0.35),
    shoulder: clamp(pulse*(0.12*together+0.045*directed),0,0.13),
    lean: clamp(pulse*(0.045*directed-0.035*reply),-0.05,0.05),
    intensity:pulse,
  };
}
export function approachGesture(current:number,target:number,delta:number,speed=7):number {
  const dt=clamp(delta,0,0.1);
  return (Number.isFinite(current)?current:0)+((Number.isFinite(target)?target:0)-(Number.isFinite(current)?current:0))*(1-Math.exp(-Math.max(0,speed)*dt));
}
