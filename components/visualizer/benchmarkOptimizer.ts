/** Pure, deterministic evaluation of a completed automatic High/Balanced/Low benchmark. */
export type Tier = "high" | "balanced" | "low";
export type TierMeasurement = Readonly<{tier: Tier; fps: number; frameMs: number; slowPercent: number; samples: number}>;
export type ProfileAdvice = Readonly<{recommended: Tier | null; reliable: boolean; meetsTarget: boolean; explanation: string}>;
const ORDER: readonly Tier[] = ["high", "balanced", "low"];
export function recommendPerformanceProfile(measurements: readonly TierMeasurement[], targetFps = 55, maxSlowPercent = 10): ProfileAdvice {
  if (measurements.length !== 3 || new Set(measurements.map(m => m.tier)).size !== 3 ||
      !ORDER.every(tier => measurements.some(m => m.tier === tier))) {
    return {recommended: null, reliable: false, meetsTarget: false, explanation: "Für die Empfehlung fehlen vollständige High-, Balanced- und Low-Messungen."};
  }
  const valid = measurements.every(m => Number.isFinite(m.fps) && m.fps > 0 &&
    Number.isFinite(m.frameMs) && m.frameMs > 0 && Number.isFinite(m.slowPercent) &&
    m.slowPercent >= 0 && m.slowPercent <= 100 && Number.isFinite(m.samples) && m.samples >= 2);
  if (!valid) return {recommended: null, reliable: false, meetsTarget: false, explanation: "Ein Messlauf enthält zu wenige oder ungültige Messwerte. Bitte den Benchmark wiederholen."};
  const sorted = ORDER.map(t => measurements.find(m => m.tier === t)!);
  const qualified = sorted.find(m => m.fps >= targetFps && m.slowPercent < maxSlowPercent);
  if (qualified) return {recommended: qualified.tier, reliable: true, meetsTarget: true,
    explanation: `Höchste getestete Grafikstufe mit mindestens ${targetFps} FPS und weniger als ${maxSlowPercent} % langsamen Frames.`};
  // Prefer fewer slow frames in borderline runs, followed by FPS; never claim a target is met.
  const fallback = [...sorted].sort((a,b) => a.slowPercent - b.slowPercent || b.fps - a.fps || ORDER.indexOf(a.tier) - ORDER.indexOf(b.tier))[0];
  return {recommended: fallback.tier, reliable: true, meetsTarget: false,
    explanation: `Keine Grafikstufe erreichte zuverlässig ${targetFps} FPS bei unter ${maxSlowPercent} % langsamen Frames. Empfehlung minimiert zunächst langsame Frames; reduziere bei Bedarf Bühneneffekte oder Avataranzahl.`};
}
