/** Low-frequency diagnostics bridge. Never publish from every animation frame. */
import { useSyncExternalStore } from "react";
export type DanceDiagnostics = {
  fps: number | null;
  frameMs: number | null;
  slowFrames: number;
  framesSampled: number;
  avatar: "gltf" | "procedural" | "none";
  active: boolean;
};
const initial: DanceDiagnostics = { fps: null, frameMs: null, slowFrames: 0, framesSampled: 0, avatar: "none", active: false };
let snapshot = initial;
const listeners = new Set<() => void>();
export function publishDanceDiagnostics(next: DanceDiagnostics) {
  snapshot = next;
  listeners.forEach(listener => listener());
}
export function useDanceDiagnostics() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => snapshot, () => initial);
}
/** Per-avatar frame sampler, resets on remount. Samples a one-second window. */
export function createFrameSampler() { return { seconds: 0, frames: 0, slow: 0, totalMs: 0 }; }
export function sampleAvatarFrame(sampler: ReturnType<typeof createFrameSampler>, delta: number, avatar: "gltf" | "procedural", active: boolean) {
  // Browser tab suspensions / initial long frames should not poison averages.
  if (!Number.isFinite(delta) || delta <= 0 || delta > 0.25) return;
  sampler.seconds += delta;
  sampler.frames++;
  sampler.totalMs += delta * 1000;
  if (delta > 1 / 30) sampler.slow++;
  if (sampler.seconds >= 1) {
    publishDanceDiagnostics({ fps: Math.round(sampler.frames / sampler.seconds), frameMs: Math.round(sampler.totalMs / sampler.frames * 10) / 10,
      slowFrames: sampler.slow, framesSampled: sampler.frames, avatar, active });
    sampler.seconds = 0; sampler.frames = 0; sampler.slow = 0; sampler.totalMs = 0;
  }
}
