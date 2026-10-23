import { useSyncExternalStore } from "react";
import type { AvatarRigMotion } from "./avatarRigController";

export type MotionIssue = { code: string; severity: "warning" | "info"; description: string };
export type MotionQualitySnapshot = { quality: number; maxJointAngle: number; maxSpeed: number; conflicts: number; clipped: number; samples: number; issues: MotionIssue[] };
const empty: MotionQualitySnapshot = { quality: 100, maxJointAngle: 0, maxSpeed: 0, conflicts: 0, clipped: 0, samples: 0, issues: [] };
let current = empty;
const subscribers = new Set<() => void>();
export const subscribeMotionQuality = (callback: () => void) => { subscribers.add(callback); return () => { subscribers.delete(callback); }; };
export const getMotionQualitySnapshot = () => current;
export const getMotionQualityServerSnapshot = () => empty;
export const useMotionQuality = () => useSyncExternalStore(subscribeMotionQuality, getMotionQualitySnapshot, getMotionQualityServerSnapshot);
const keys: (keyof AvatarRigMotion)[] = ["headNod", "headTurn", "spineSway", "hipSway", "armSwing", "legGroove", "footStep", "weightShift", "torsoTwist", "counterArm", "hipCounter"];
const limits: Partial<Record<keyof AvatarRigMotion, number>> = { headNod: .5, headTurn: .65, spineSway: .65, hipSway: .7, armSwing: 1, legGroove: .9, footStep: .7, weightShift: 1, torsoTwist: .3, counterArm: .35, hipCounter: .3 };
export function createMotionQualitySampler() { return { elapsed: 0, samples: 0, maxJoint: 0, maxSpeed: 0, conflicts: 0, clipped: 0, previous: null as Partial<AvatarRigMotion> | null }; }
/** Diagnostic-only sampler. No modifications to the animation or rig. */
export function sampleMotionQuality(s: ReturnType<typeof createMotionQualitySampler>, pose: AvatarRigMotion, dt: number, active: boolean) {
  if (!active || !Number.isFinite(dt) || dt <= 0 || dt > .25) { s.previous = null; return; }
  s.elapsed += dt; s.samples++;
  for (const key of keys) {
    const v = pose[key] ?? 0;
    if (!Number.isFinite(v)) { s.clipped++; continue; }
    const magnitude = Math.abs(v);
    s.maxJoint = Math.max(s.maxJoint, magnitude);
    if (magnitude > (limits[key] ?? 1)) s.clipped++;
    if (s.previous) { const last = s.previous[key] ?? 0; s.maxSpeed = Math.max(s.maxSpeed, Math.abs(v - last) / dt); }
  }
  // Opposing overlays can compete even if the final pose remains within safe angle limits.
  if (Math.abs(pose.spineSway) > .22 && Math.abs(pose.torsoTwist ?? 0) > .17) s.conflicts++;
  s.previous = { ...pose };
  if (s.elapsed < 1) return;
  const issues: MotionIssue[] = [];
  if (s.clipped) issues.push({ code: "high-amplitude", severity: "warning", description: "High joint amplitudes: lower dance aggression or overlay intensity." });
  if (s.maxSpeed > 8) issues.push({ code: "rapid-change", severity: "warning", description: "Abrupt motion changes: use stronger damping or smoother transitions." });
  if (s.conflicts > s.samples * .25) issues.push({ code: "competing-overlays", severity: "info", description: "Simultaneous torso overlays: check blending and retarget calibration." });
  current = { quality: Math.max(0, Math.round(100 - (s.clipped ? 20 : 0) - (s.maxSpeed > 8 ? 25 : 0) - (s.conflicts > s.samples * .25 ? 15 : 0))), maxJointAngle: Math.round(s.maxJoint * 180 / Math.PI), maxSpeed: Math.round(s.maxSpeed * 10) / 10, conflicts: s.conflicts, clipped: s.clipped, samples: s.samples, issues };
  subscribers.forEach(fn => fn());
  s.elapsed = 0; s.samples = 0; s.maxJoint = 0; s.maxSpeed = 0; s.conflicts = 0; s.clipped = 0;
}
