/** Deterministic helpers for realtime music-aware animation mixing. */
export type BlendCurve = "linear" | "smooth" | "ease-in" | "ease-out";
export const clamp = (n: number, low = 0, high = 1) => Math.max(low, Math.min(high, Number.isFinite(n) ? n : low));
export function curveBlend(t: number, curve: BlendCurve): number {
  const x = clamp(t);
  switch (curve) {
    case "ease-in": return x * x;
    case "ease-out": return 1 - (1 - x) * (1 - x);
    case "smooth": return x * x * (3 - 2 * x);
    default: return x;
  }
}
export function targetBlendWeight(base: number, energy: number, auto: boolean, curve: BlendCurve): number {
  const intensity = auto ? curveBlend(clamp(energy), curve) : 1;
  return clamp(base * intensity, 0, 0.85);
}
/** Half-life independent exponential damping. */
export function smoothBlend(current: number, target: number, dt: number, halfLife: number): number {
  if (halfLife <= 0) return target;
  return current + (target - current) * (1 - Math.pow(0.5, clamp(dt, 0, 0.25) / halfLife));
}
/** Reference BPM defines the clip's authored musical tempo, no track duration inference. */
export function syncedClipSpeed(baseSpeed: number, bpm: number | null, reference: number, enabled: boolean): number {
  if (!enabled || !bpm || bpm < 40 || bpm > 260) return clamp(baseSpeed, 0.25, 2.5);
  return clamp(baseSpeed * bpm / clamp(reference, 60, 240), 0.25, 2.5);
}
