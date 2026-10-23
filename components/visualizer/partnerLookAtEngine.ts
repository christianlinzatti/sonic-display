/** V144: bounded partner-focused head and eye IK cues, independent of Three/React. */
import type { DuoScene } from "./duoChoreographyDirector";
export type LookPoint = readonly [number, number, number];
export type LookAtCue = { yaw: number; pitch: number; eyeYaw: number; weight: number };
export const NEUTRAL_LOOK: LookAtCue = { yaw: 0, pitch: 0, eyeYaw: 0, weight: 0 };
const finite = (x: number, fallback = 0) => Number.isFinite(x) ? x : fallback;
const clamp = (x: number, low: number, high: number) => Math.min(high, Math.max(low, x));
/** Head IK uses local scene-space relative positions, with safe limits so dance remains dominant. */
export function partnerLookCue(mode: DuoScene, self: LookPoint, partner: LookPoint, enabled: boolean, visibility = 1): LookAtCue {
  if (!enabled || mode === "solo") return { ...NEUTRAL_LOOK };
  const dx = finite(partner[0]) - finite(self[0]);
  const dz = finite(partner[2]) - finite(self[2]);
  const dy = finite(partner[1]) - finite(self[1]);
  const distance = Math.hypot(dx, dy, dz);
  if (!Number.isFinite(distance) || distance < 0.1) return { ...NEUTRAL_LOOK };
  const modeWeight = mode === "duet" ? 0.78 : mode === "mirror" ? 0.42 : 0.26;
  const weight = modeWeight * clamp(finite(visibility), 0, 1);
  // Scene space +Z forward. Do not turn the head fully away from the audience.
  const angle = Math.atan2(dx, Math.max(0.5, 1 + dz));
  const yaw = clamp(angle, -0.42, 0.42) * weight;
  const pitch = clamp(-Math.atan2(dy, Math.hypot(dx, dz)), -0.16, 0.16) * weight;
  return { yaw, pitch, eyeYaw: clamp(angle * 0.22, -0.11, 0.11) * weight, weight };
}
export function approachLook(current: number, target: number, delta: number, speed = 5): number {
  const dt = clamp(finite(delta), 0, 0.1);
  return finite(current) + (finite(target) - finite(current)) * (1 - Math.exp(-Math.max(0, finite(speed)) * dt));
}
