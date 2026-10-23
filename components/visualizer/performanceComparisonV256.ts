/** V256: explainable per-tier frame stability, not a GPU timing measurement. */
export type ComparisonReading = {
  tier: string; fps: number; frameMs: number; slowPercent: number;
  samples: number; p95FrameMs?: number; fpsSpread?: number;
};
export function compareBenchmarkTiers(readings: readonly ComparisonReading[]) {
  return readings.map(reading => {
    const fps = Number.isFinite(reading.fps) ? Math.max(0, reading.fps) : 0;
    const p95 = Number.isFinite(reading.p95FrameMs) ? Math.max(0, reading.p95FrameMs!) : reading.frameMs;
    const slow = Number.isFinite(reading.slowPercent) ? Math.min(100, Math.max(0, reading.slowPercent)) : 100;
    // Weighted responsiveness (60 FPS target) and tail-latency; scores are comparative heuristics.
    const fpsFactor = Math.min(1, fps / 60);
    const latencyFactor = Math.min(1, 16.667 / Math.max(1, p95));
    const cleanFactor = 1 - slow / 100;
    const score = Math.round(100 * (0.40 * fpsFactor + 0.40 * latencyFactor + 0.20 * cleanFactor));
    const label = p95 <= 17 && fps >= 55 && slow <= 5 ? "Sehr flüssig" :
      p95 <= 34 && fps >= 28 && slow <= 20 ? "Spielbar" : "Eingeschränkt";
    const samples = Number.isFinite(reading.samples) ? reading.samples : 0;
    return { tier: reading.tier, score, label,
      explanation: `${Math.round(fps)} FPS · P95 ${p95.toFixed(1)} ms · ${slow.toFixed(1)} % langsame Frames · ${samples} Frames`,
    };
  });
}
