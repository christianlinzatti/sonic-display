export type RapCameraPoseV429 = {x:number;y:number;z:number;targetY:number;fov:number;targetX?:number;targetZ?:number};
import type { ExpressiveRapCueV425 } from "./expressiveRapDirectorV425";

/** V429 is a PURE camera overlay on the existing R3F camera, not a second camera rig. */
export type RapCameraShotV429 = "none" | "solo-close" | "reply-side" | "duet-wide" | "hook-push";
export type RapCameraPlanV429 = {
  active: boolean; shot: RapCameraShotV429; lineIndex: number; leadSlot: number;
  startMs: number; endMs: number; gain: number; holdMs: number;
};
export type RapCameraHoldV429 = {
  trackId: string; lastMs: number; sinceMs: number; plan: RapCameraPlanV429;
};
const clamp = (v: number, lo: number, hi: number) =>
  Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo;
export const INACTIVE_RAP_CAMERA_V429: RapCameraPlanV429 = {
  active: false, shot: "none", lineIndex: -1, leadSlot: 0, startMs: 0, endMs: 0, gain: 0, holdMs: 0,
};

/** V416-authored scenes or explicitly enabled V436 camera-only inferred staging qualify. No audio or singer detection is implied. */
export function planRapCameraV429(input: {
  enabled: boolean; playing: boolean; reducedMotion: boolean; manualPriority?: boolean;
  trackId: string; assignmentTrackId: string; progressMs: number;
  strength: number; cue: ExpressiveRapCueV425;
}): RapCameraPlanV429 {
  const {cue} = input;
  if (!input.enabled || !input.playing || input.reducedMotion || input.manualPriority ||
      !input.trackId || input.trackId !== input.assignmentTrackId ||
      !Number.isFinite(input.progressMs) || input.progressMs < 0 ||
      !cue.active || (cue.source !== "authored-lyrics" && cue.source !== "auto-lyrics") || cue.startMs > input.progressMs ||
      cue.endMs <= input.progressMs || cue.lineIndex < 0) return {...INACTIVE_RAP_CAMERA_V429};
  const shot: RapCameraShotV429 = cue.scene === "solo" ? "solo-close" :
    cue.scene === "reply" ? "reply-side" : cue.scene === "duet" ? "duet-wide" :
    cue.scene === "hook" ? "hook-push" : "none";
  const gain = clamp(input.strength, 0, 100) / 100 * clamp(cue.cameraEnergy, 0, 1);
  if (shot === "none" || gain <= 0) return {...INACTIVE_RAP_CAMERA_V429};
  return {
    active: true, shot, lineIndex: cue.lineIndex,
    leadSlot: Math.trunc(clamp(cue.leadSlot, 0, 3)),
    startMs: cue.startMs, endMs: cue.endMs, gain,
    holdMs: shot === "hook-push" ? 1400 : 1100,
  };
}

export function newRapCameraHoldV429(): RapCameraHoldV429 {
  return {trackId: "", lastMs: -1, sinceMs: 0, plan: {...INACTIVE_RAP_CAMERA_V429}};
}
/** Minimum shot duration, scoped to the Spotify playback clock. Pause, seek and song changes reset cleanly. */
export function advanceRapCameraHoldV429(
  state: RapCameraHoldV429, incoming: RapCameraPlanV429,
  trackId: string, progressMs: number, playing: boolean,
): RapCameraPlanV429 {
  const safeMs = Number.isFinite(progressMs) && progressMs >= 0 ? progressMs : -1;
  if (!playing || !incoming.active || !trackId || safeMs < 0) {
    Object.assign(state, newRapCameraHoldV429());
    return {...INACTIVE_RAP_CAMERA_V429};
  }
  const jumped = trackId !== state.trackId || safeMs < state.lastMs - 250 ||
    (state.lastMs >= 0 && safeMs - state.lastMs > 3500);
  const key = (p: RapCameraPlanV429) => `${p.shot}:${p.leadSlot}`;
  if (jumped || !state.plan.active || safeMs >= state.plan.endMs ||
      (key(incoming) !== key(state.plan) && safeMs - state.sinceMs >= state.plan.holdMs)) {
    state.plan = incoming;
    state.sinceMs = safeMs;
  } else if (key(incoming) === key(state.plan)) {
    // Refresh the current line bounds/strength, without resetting the hold timer.
    state.plan = incoming;
  }
  state.trackId = trackId;
  state.lastMs = safeMs;
  return state.plan;
}

/** Applies a small dolly/angle adjustment to the FINAL auto-framed pose. Does not edit any saved keyframes. */
export function composeRapCameraV429(
  pose: RapCameraPoseV429, plan: RapCameraPlanV429,
  options: {lyricsProtected?: boolean; duo?: boolean} = {},
): RapCameraPoseV429 {
  if (!plan.active || plan.gain <= 0 || !Number.isFinite(pose.x) ||
      !Number.isFinite(pose.y) || !Number.isFinite(pose.z) ||
      !Number.isFinite(pose.fov) || !Number.isFinite(pose.targetY)) return pose;
  const gain = clamp(plan.gain, 0, 1) * (options.lyricsProtected ? .38 : 1);
  const direction = plan.leadSlot % 2 ? 1 : -1;
  const movement = {
    "solo-close": {dolly: .10, shift: .035, lift: 0, fov: 1.0},
    "reply-side": {dolly: .07, shift: .27 * direction, lift: .035, fov: .7},
    "duet-wide": {dolly: -.075, shift: 0, lift: .015, fov: -.7},
    "hook-push": {dolly: .13, shift: 0, lift: .075, fov: 1.5},
    "none": {dolly: 0, shift: 0, lift: 0, fov: 0},
  }[plan.shot];
  const originX = pose.targetX ?? 0, originZ = pose.targetZ ?? 0;
  // Positive dolly brings the existing camera slightly closer to its look-at target.
  const factor = 1 - gain * movement.dolly;
  const cameraX = originX + (pose.x - originX) * factor + movement.shift * gain;
  const cameraY = pose.targetY + (pose.y - pose.targetY) * factor + movement.lift * gain;
  const cameraZ = originZ + (pose.z - originZ) * factor;
  const distance = Math.hypot(cameraX-originX,cameraY-pose.targetY,cameraZ-originZ);
  // Clamp minimum distance, for arbitrary externally supplied camera poses.
  const safety = distance > 0 ? Math.max(1, (options.duo ? 3.15 : 2.6) / distance) : 1;
  return {
    ...pose,
    x: originX + (cameraX-originX)*safety,
    y: pose.targetY+(cameraY-pose.targetY)*safety,
    z: originZ + (cameraZ-originZ)*safety,
    targetX: originX+movement.shift*gain*.22,
    fov: clamp(pose.fov-movement.fov*gain, 28, 58),
  };
}
