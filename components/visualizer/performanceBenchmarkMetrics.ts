import type { PerformanceSample } from "./danceDiagnosticsStore";
import { summarizePerformance } from "./performanceRecommendations";

export type BenchmarkRun = Readonly<{
  id: number; label: string; avatarCount: number; graphicsTier: string;
  startedAt: number; endedAt: number; samples: number;
  avgFps: number; minFps: number; avgFrameMs: number; slowPercent: number;
}>;
export const BENCHMARK_MIN_SAMPLES = 5;
export const BENCHMARK_MAX_RUNS = 8;
/** Take only samples emitted since Start; never measure in the render loop. */
export function finishBenchmark(samples: readonly PerformanceSample[], startedAt: number, endedAt: number,
  label: string, avatarCount: number, graphicsTier: string): BenchmarkRun | null {
  const window = samples.filter(s => s.time >= startedAt && s.time <= endedAt && Number.isFinite(s.fps));
  if (window.length < BENCHMARK_MIN_SAMPLES) return null;
  const summary = summarizePerformance(window);
  if (!summary) return null;
  return { id: startedAt, label: label.trim() || `Messlauf ${new Date(startedAt).toLocaleTimeString()}`,
    avatarCount: Math.max(1, Math.min(16, Math.floor(avatarCount) || 1)), graphicsTier,
    startedAt, endedAt, samples: window.length, avgFps: summary.avgFps,
    minFps: summary.minFps, avgFrameMs: summary.avgFrameMs, slowPercent: summary.avgSlowPercent };
}
export function appendBenchmark(runs: readonly BenchmarkRun[], run: BenchmarkRun): readonly BenchmarkRun[] {
  return [...runs.filter(previous => previous.id !== run.id),run].slice(-BENCHMARK_MAX_RUNS);
}
export function benchmarkDelta(a: BenchmarkRun, b: BenchmarkRun) {
  return { fps: b.avgFps - a.avgFps, frameMs: b.avgFrameMs - a.avgFrameMs,
    slowPercent: b.slowPercent - a.slowPercent };
}
