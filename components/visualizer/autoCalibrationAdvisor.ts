/** V238: pure, explainable comparison of measured browser profiles. */
export type CalibrationTier = "high" | "balanced" | "low";
export type CalibrationScene = "full" | "no-pulse" | "no-rings" | "minimal-lights";
export type CalibrationCandidate = { tier: CalibrationTier; scene: CalibrationScene };
export type CalibrationResult = CalibrationCandidate & { fps: number; slowPercent: number; frameMs: number; drawCalls: number; samples: number };
export const calibrationCandidates: CalibrationCandidate[] = [
  { tier: "balanced", scene: "full" }, { tier: "balanced", scene: "no-rings" },
  { tier: "balanced", scene: "minimal-lights" }, { tier: "low", scene: "minimal-lights" },
  { tier: "high", scene: "full" }
];
const valid = (r: CalibrationResult) => [r.fps,r.slowPercent,r.frameMs,r.drawCalls,r.samples].every(Number.isFinite) && r.fps > 0 && r.samples >= 2;
export function recommendCalibration(results: CalibrationResult[]): { recommended: CalibrationResult | null; reason: string } {
  const measured = results.filter(valid);
  if (measured.length < 2) return { recommended: null, reason: "Zu wenige gültige Vergleichsmessungen." };
  // Prefer visual quality once acceptable (>=45 FPS, <=15% slow frames); otherwise prioritize stability.
  const stable = measured.filter(r => r.fps >= 45 && r.slowPercent <= 15 && r.frameMs <= 27);
  const quality = (r: CalibrationResult) => ({high:3,balanced:2,low:1}[r.tier] * 5 + ({full:4,"no-pulse":3,"no-rings":2,"minimal-lights":1}[r.scene]));
  const ranked = stable.length ? [...stable].sort((a,b)=>quality(b)-quality(a) || b.fps-a.fps)
    : [...measured].sort((a,b)=> b.fps-a.fps || a.slowPercent-b.slowPercent);
  return { recommended: ranked[0], reason: stable.length
    ? "Stabile Bildrate erreicht: höchste gemessene Darstellungsqualität empfohlen."
    : "Keine Testvariante erreicht das Stabilitätsziel; schnellste gemessene Kombination empfohlen." };
}
