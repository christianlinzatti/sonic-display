/** V142: deterministic stage formation targets; positions are local Three.js units. */
import type { DuoScene } from "./duoChoreographyDirector";
export type FormationTargets = { lead: [number,number,number]; partner: [number,number,number]; partnerVisible: boolean; mirror: boolean };
const number = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const unit = (value: number) => Math.max(0, Math.min(1, value));
export function duoFormationTargets(mode: DuoScene, beatStrength = 0, phase = 0, reducedMotion = false): FormationTargets {
  const accent = unit(number(beatStrength,0));
  const pulse = reducedMotion ? 0 : 0.075 * accent * Math.sin(number(phase,0) * Math.PI * 2);
  switch(mode) {
    case "solo": return { lead:[0,0,0], partner:[1.9,0,-0.5], partnerVisible:false, mirror:false };
    case "sync": return { lead:[-0.92,0,0], partner:[0.92,0,0], partnerVisible:true, mirror:false };
    case "mirror": return { lead:[-0.92,0,0], partner:[0.92,0,0], partnerVisible:true, mirror:true };
    case "duet": return { lead:[-0.8-pulse,0,0.12], partner:[0.8+pulse,0,-0.12], partnerVisible:true, mirror:false };
  }
}
/** Frame-rate-independent exponential easing, robust to NaN and suspended frames. */
export function formationApproach(current: number, target: number, delta: number, speed=4.5): number {
  const from=number(current,number(target,0)); const to=number(target,from);
  const dt=Math.max(0,Math.min(0.1,number(delta,0)));
  return from+(to-from)*(1-Math.exp(-Math.max(0,number(speed,4.5))*dt));
}
