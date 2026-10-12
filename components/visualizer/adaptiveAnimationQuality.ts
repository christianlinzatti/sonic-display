/** Throttle costly choreography calculations, never the render loop or beat-reactive motion. */
export type AnimationTier = "high" | "balanced" | "low";
export type AnimationCadence = { lastRun: number; runs: number; skipped: number; lastPublish: number };
export const createAnimationCadence = (): AnimationCadence => ({ lastRun: Number.NEGATIVE_INFINITY, runs: 0, skipped: 0, lastPublish: 0 });
export function animationInterval(tier: AnimationTier): number {
  return tier === "high" ? 0 : tier === "balanced" ? 1 / 30 : 1 / 20;
}
/** Returns true on first call and whenever the quality-dependent interval has elapsed. */
export function shouldUpdateAnimation(cadence: AnimationCadence, now: number, tier: AnimationTier): boolean {
  const interval = animationInterval(tier);
  if (now < cadence.lastRun || now - cadence.lastRun >= interval - 0.0001) {
    cadence.lastRun = now;
    cadence.runs++;
    return true;
  }
  cadence.skipped++;
  return false;
}

// Lightweight diagnostics bridge, updated at most once a second by the GLTF avatar.
export type AnimationQualitySnapshot = { tier: AnimationTier; targetHz: number; evaluated: number; reused: number };
const initialSnapshot: AnimationQualitySnapshot = { tier: "high", targetHz: 60, evaluated: 0, reused: 0 };
let snapshot = initialSnapshot;
const listeners = new Set<() => void>();
export function subscribeAnimationQuality(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function getAnimationQualitySnapshot() { return snapshot; }
export function publishAnimationQuality(tier: AnimationTier, cadence: AnimationCadence, now: number) {
  if (now - cadence.lastPublish < 1) return;
  snapshot = { tier, targetHz: tier === "high" ? 60 : tier === "balanced" ? 30 : 20, evaluated: cadence.runs, reused: cadence.skipped };
  cadence.lastPublish = now;
  listeners.forEach(listener => listener());
}
