/**
 * V543 — Concert Show Integration & Performance Validation.
 * Aggregates REAL V518/V522 WebGL benchmark windows and a HUMAN visual review.
 * Does not simulate performance, certify lip-sync, or infer hardware identity.
 * Pure function: no clocks, timers, GPU calls, storage or network requests.
 */
import {
  BENCHMARK_RECIPES_V522, benchmarkResultV522, validateBenchmarksV522,
  type BenchmarkRunV522, type BenchmarkSceneV522, type BenchmarkVisualAuditV522,
  type BenchmarkValidationV522,
} from './concertBenchmarkValidationV522';

export type ConcertShowReadinessStatusV543 =
  'measurements-missing' | 'needs-attention' | 'visual-review-missing' | 'locally-reviewed';
export type ConcertShowSceneReviewV543 = Readonly<{
  scene: BenchmarkSceneV522;
  label: string;
  repetitions: number;
  status: BenchmarkValidationV522['status'];
  reason: string;
  visualChecked: number;
  visualRequired: 4;
  configuration: string | null;
  targetFps: 30 | 45 | 60;
  meanFps: number | null;
  worstP99Ms: number | null;
}>;
export type ConcertShowReadinessV543 = Readonly<{
  status: ConcertShowReadinessStatusV543;
  scenes: readonly ConcertShowSceneReviewV543[];
  completedScenes: number;
  reviewedScenes: number;
  totalScenes: 3;
  note: string;
}>;
export type ConcertVisualReviewsV543 = Partial<Record<BenchmarkSceneV522, BenchmarkVisualAuditV522>>;

const auditCount = (review: BenchmarkVisualAuditV522 | undefined): number =>
  review ? [review.lyricsLegible, review.lipSyncPlausible,
    review.motionNatural, review.lightReadable].filter(Boolean).length : 0;

/** Each scenario MUST have three compatible completed real-canvas runs.
 * A checkmark is user-attested visual judgement, not an automated pass.
 * Results are provisional on the device where readings were captured; no Pi claim.
 */
export function assessConcertShowReadinessV543(
  runs: readonly BenchmarkRunV522[],
  visualReviews: ConcertVisualReviewsV543,
  targetFps: 30 | 45 | 60,
): ConcertShowReadinessV543 {
  const scenes = BENCHMARK_RECIPES_V522.map((recipe): ConcertShowSceneReviewV543 => {
    const completed = runs.filter(r => r.scene === recipe.id && r.status === 'complete' &&
      r.targetFps === targetFps && benchmarkResultV522(r) !== null);
    // Most recent comparable configuration per scene; never mix quality/device profiles.
    const latest = completed.at(-1);
    const configuration = latest?.configuration ?? null;
    const validation = validateBenchmarksV522(runs, recipe.id, targetFps, configuration ?? '');
    return {scene: recipe.id, label: recipe.label, repetitions: validation.repetitions,
      status: validation.status, reason: validation.reason,
      visualChecked: auditCount(visualReviews[recipe.id]), visualRequired: 4,
      configuration, targetFps, meanFps: validation.meanFps,
      worstP99Ms: validation.worstP99Ms};
  });
  const completedScenes = scenes.filter(s => s.status === 'provisional').length;
  const reviewedScenes = scenes.filter(s => s.status === 'provisional' && s.visualChecked === 4).length;
  // Completed but deficient benchmark must never be hidden by an incomplete other recipe.
  const hasProblem = scenes.some(s => s.status === 'needs-review') ||
    runs.some(r => r.status === 'invalid' && r.targetFps === targetFps && !runs.some(v => v.scene === r.scene &&
      v.status === 'complete' && v.startedAt > r.startedAt));
  const status: ConcertShowReadinessStatusV543 = hasProblem ? 'needs-attention' :
    completedScenes < scenes.length ? 'measurements-missing' :
    reviewedScenes < scenes.length ? 'visual-review-missing' : 'locally-reviewed';
  const note = status === 'locally-reviewed' ?
    'Alle drei Browser-Benchmarks bestanden und alle Sichtprüfpunkte manuell bestätigt. Nur auf diesem Gerät geprüft; kein automatischer Pi-, Audio- oder WebGL-Qualitätsnachweis.' :
    status === 'needs-attention' ? 'Fehlerhafte oder unzureichende Messungen prüfen; kein Freigabestatus.' :
    status === 'visual-review-missing' ? 'Browser-Messungen vorläufig bestanden. Die separate Sicht- und Hörprüfung fehlt noch.' :
    'Für jedes Szenario sind drei vollständige, gleich konfigurierte Messläufe nötig.';
  return {status, scenes, completedScenes, reviewedScenes, totalScenes: 3, note};
}
