/** V143 – gentle partner facing and separation, operating on stage transforms only. */
import type { DuoScene } from "./duoChoreographyDirector";
type Point = readonly [number, number, number];
export type PartnerCue = { leadYaw: number; partnerYaw: number; leadLean: number; partnerLean: number; separation: number };
const finite = (v: unknown, fallback = 0): number => typeof v === "number" && Number.isFinite(v) ? v : fallback;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** Angle from forward (+Z) toward another dancer; capped to keep dances facing the audience. */
export function facingYaw(origin: Point, target: Point, maxTurn = 0.38): number {
  const dx = finite(target[0]) - finite(origin[0]);
  const dz = finite(target[2]) - finite(origin[2]);
  if (Math.hypot(dx, dz) < 0.001) return 0;
  return clamp(Math.atan2(dx, Math.max(0.3, 1 + dz)), -Math.abs(maxTurn), Math.abs(maxTurn));
}
export function partnerCue(mode: DuoScene, lead: Point, partner: Point, beat = 0, reducedMotion = false): PartnerCue {
  const separation = Math.hypot(finite(lead[0])-finite(partner[0]),finite(lead[2])-finite(partner[2]));
  if (mode === "solo" || reducedMotion) return { leadYaw:0, partnerYaw:0, leadLean:0, partnerLean:0, separation };
  const turn = mode === "duet" ? 0.36 : mode === "mirror" ? 0.14 : 0.08;
  const leadYaw = facingYaw(lead, partner, turn);
  const partnerYaw = facingYaw(partner, lead, turn);
  const accent = clamp(finite(beat), 0, 1);
  const lean = mode === "duet" ? Math.min(0.035, accent*0.035) : 0;
  return {leadYaw,partnerYaw,leadLean:lean,partnerLean:lean,separation};
}
/** Safety spacing for the stage. Pull targets apart rather than pushing live IK bones. */
export function separatePartners(lead: Point, partner: Point, minDistance = 1.25): {lead: [number,number,number]; partner: [number,number,number]} {
  const a: [number,number,number] = [finite(lead[0]),finite(lead[1]),finite(lead[2])];
  const b: [number,number,number] = [finite(partner[0]),finite(partner[1]),finite(partner[2])];
  const dx=b[0]-a[0], dz=b[2]-a[2], dist=Math.hypot(dx,dz);
  const minimum=clamp(finite(minDistance,1.25),0,4);
  if(dist>=minimum) return {lead:a,partner:b};
  const ux=dist>0.0001?dx/dist:1, uz=dist>0.0001?dz/dist:0;
  const shift=(minimum-dist)/2;
  a[0]-=ux*shift; a[2]-=uz*shift; b[0]+=ux*shift; b[2]+=uz*shift;
  return {lead:a,partner:b};
}
