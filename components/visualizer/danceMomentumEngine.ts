/** V114 local, deterministic secondary motion. Angles are in radians. */
import type { NaturalDanceCoordination } from "./naturalDanceCoordination";

export type MomentumChannel = keyof NaturalDanceCoordination;
export type MomentumState = {
  values: NaturalDanceCoordination;
  velocity: NaturalDanceCoordination;
};
const keys: MomentumChannel[] = ["torsoTwist", "counterArm", "hipCounter", "headCounter", "kneeFollow"];
const zero = (): NaturalDanceCoordination => ({torsoTwist:0,counterArm:0,hipCounter:0,headCounter:0,kneeFollow:0});
export function createMomentumState(): MomentumState { return {values:zero(),velocity:zero()}; }
export function resetMomentumState(state: MomentumState) { state.values=zero(); state.velocity=zero(); }

/** Semi-implicit spring integration with substeps, finite/clamped input and velocity limits.
 * Suppresses overshoot and reduces jitter at variable browser frame rates.
 * Physics affects secondary joint rotations only, not root translation or planted feet.
 */
export function updateMomentumState(state: MomentumState, target: NaturalDanceCoordination,
  elapsedSeconds: number, genre: string | undefined, playing: boolean, reducedMotion: boolean): NaturalDanceCoordination {
  if (!playing || reducedMotion) { resetMomentumState(state); return state.values; }
  const rap = /rap|hip.?hop|trap|deutsch/i.test(genre ?? "");
  const hard = /hardstyle|hardtekk|hardcore/i.test(genre ?? "");
  const frequency = hard ? 5.8 : rap ? 3.4 : 4.2; // Hz: rap keeps a longer follow-through
  const dampingRatio = hard ? 0.86 : rap ? 0.73 : 0.81;
  const omega = 2 * Math.PI * frequency;
  const maxAngles: NaturalDanceCoordination = {torsoTwist:0.14,counterArm:0.18,hipCounter:0.11,headCounter:0.06,kneeFollow:0.08};
  const frameDelta = Number.isFinite(elapsedSeconds) ? Math.max(0, Math.min(0.1, elapsedSeconds)) : 0;
  const steps = Math.max(1, Math.ceil(frameDelta / (1/120)));
  const dt = frameDelta / steps;
  for (let n = 0; n < steps; n++) {
    for (const k of keys) {
      const limit = maxAngles[k];
      const desired = Number.isFinite(target[k]) ? Math.max(-limit, Math.min(limit, target[k])) : 0;
      const acceleration = omega*omega*(desired-state.values[k]) - 2*dampingRatio*omega*state.velocity[k];
      state.velocity[k] = Math.max(-3, Math.min(3, state.velocity[k] + acceleration*dt));
      state.values[k] = Math.max(-limit, Math.min(limit, state.values[k] + state.velocity[k]*dt));
      if (Math.abs(state.values[k]) >= limit && Math.sign(state.values[k])===Math.sign(state.velocity[k])) state.velocity[k]=0;
    }
  }
  return {...state.values};
}
