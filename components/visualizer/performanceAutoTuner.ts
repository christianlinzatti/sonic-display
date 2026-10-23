/** V225: Advisory-only tuner. No settings are changed by this module. */
import type { TierMeasurement, Tier } from "./benchmarkOptimizer";
export type PerformanceResource = Readonly<{ tier: Tier; calls: number; triangles: number }>;
export type TuningAdvice = Readonly<{ title: string; rationale: string; nextStep: string; priority: "high" | "medium" | "low" }>;
export function createTuningAdvice(measurements: readonly TierMeasurement[], resources: readonly PerformanceResource[] = [], targetFps = 55): readonly TuningAdvice[] {
  const valid = measurements.filter(m => Number.isFinite(m.fps) && m.fps > 0 && Number.isFinite(m.slowPercent) && m.slowPercent >= 0 && m.slowPercent <= 100 && Number.isFinite(m.samples) && m.samples >= 2);
  if (valid.length < 3 || new Set(valid.map(m => m.tier)).size < 3) return [{title: "Messung vervollständigen", rationale: "Es fehlen verlässliche Werte für High, Balanced und Low.", nextStep: "Automatischen Benchmark bei sichtbarem 3D-Visualizer wiederholen.", priority: "high"}];
  const high = valid.find(m => m.tier === "high")!;
  const balanced = valid.find(m => m.tier === "balanced")!;
  const low = valid.find(m => m.tier === "low")!;
  const suggestions: TuningAdvice[] = [];
  const best = [high,balanced,low].find(m => m.fps >= targetFps && m.slowPercent < 10);
  if (!best) suggestions.push({title: "Grafiklast schrittweise senken", rationale: `Keine getestete Stufe erreicht ${targetFps} FPS bei weniger als 10 % langsamen Frames.`, nextStep: "Low als Ausgangspunkt testen; Avataranzahl und Bühnenbeleuchtung in separaten Messläufen vergleichen.", priority: "high"});
  else suggestions.push({title: `Grafikstufe ${best.tier} testen`, rationale: `Diese Stufe erfüllt im Benchmark ${targetFps} FPS und die Grenze für langsame Frames.`, nextStep: "Profil bei unveränderter Szene erneut messen und nur nach Prüfung manuell übernehmen.", priority: "low"});
  if (high.fps < balanced.fps * 0.88 || high.slowPercent > balanced.slowPercent + 8) suggestions.push({title: "Auflösung / DPR prüfen", rationale: "High ist deutlich langsamer oder instabiler als Balanced.", nextStep: "DPR im vorhandenen Qualitätsprofil reduzieren und bei identischer Musiksequenz neu messen.", priority: "medium"});
  if (balanced.fps < targetFps && low.fps >= balanced.fps * 0.98) suggestions.push({title: "Szenenlast isolieren", rationale: "Die niedrigere Qualitätsstufe bringt kaum FPS-Gewinn.", nextStep: "Beleuchtung, Effekte und Avataranzahl einzeln vergleichen; CPU-/Animationstiming prüfen.", priority: "medium"});
  const measuredResources = resources.filter(r => Number.isFinite(r.calls) && r.calls >= 0 && Number.isFinite(r.triangles) && r.triangles >= 0);
  const highResources = measuredResources.find(r => r.tier === "high");
  if (highResources && highResources.calls > 300) suggestions.push({title: "Draw Calls untersuchen", rationale: `${Math.round(highResources.calls)} Draw Calls bei High können auf viele einzelne Objekte hinweisen; kein direkter GPU-Auslastungswert.`, nextStep: "Material-/Mesh-Batches prüfen und den Effekt anschließend benchmarken.", priority: "medium"});
  if (highResources && highResources.triangles > 500000) suggestions.push({title: "Avatar-LOD vergleichen", rationale: `Die Szene rendert rund ${Math.round(highResources.triangles).toLocaleString("de-DE")} Dreiecke pro Frame.`, nextStep: "Vorhandene LOD-Stufen in vergleichbaren Szenen messen; keine automatische Modelländerung.", priority: "medium"});
  return suggestions;
}
