"use client";
import { useState, useSyncExternalStore } from "react";
import { finishBenchmark, appendBenchmark, benchmarkDelta, BENCHMARK_MIN_SAMPLES, type BenchmarkRun } from "./performanceBenchmarkMetrics";
import { useDanceDiagnostics } from "./danceDiagnosticsStore";
import { useMotionQuality } from "./motionQualityDiagnostics";
import { useRuntimeProfiler } from "./runtimeProfiler";
import { useAdaptivePerformance } from "./adaptivePerformance";
import { subscribeAnimationQuality, getAnimationQualitySnapshot } from "./adaptiveAnimationQuality";
import { subscribeAnimationScheduler, getAnimationSchedulerSnapshot, isAnimationSchedulerEnabled } from "./adaptiveAnimationScheduler";
import { usePerformanceHistory, clearPerformanceHistory } from "./danceDiagnosticsStore";
import { summarizePerformance, recommendPerformance } from "./performanceRecommendations";
import { deriveMotionDashboardStatus } from "./motionDashboardStatus";

/** V221: read-only view over existing low-frequency stores. No additional render-loop sampler. */
export function AdaptiveMotionQualityDashboard() {
  const [benchmarkStart, setBenchmarkStart] = useState<number | null>(null);
  const [benchmarkRuns, setBenchmarkRuns] = useState<readonly BenchmarkRun[]>([]);
  const [benchmarkLabel, setBenchmarkLabel] = useState("");
  const [benchmarkAvatarCount, setBenchmarkAvatarCount] = useState(1);
  const [benchmarkError, setBenchmarkError] = useState("");
  const frame = useDanceDiagnostics();
  const history = usePerformanceHistory();
  const capturedCount = benchmarkStart === null ? 0 : history.filter(sample => sample.time >= benchmarkStart).length;
  const endBenchmark = () => {
    if (benchmarkStart === null) return;
    const completed = finishBenchmark(history, benchmarkStart, Date.now(), benchmarkLabel, benchmarkAvatarCount, performance.tier);
    if (!completed) { setBenchmarkError(`Mindestens ${BENCHMARK_MIN_SAMPLES} Messintervalle erforderlich (aktuell ${capturedCount}).`); return; }
    setBenchmarkRuns(previous => appendBenchmark(previous, completed));
    setBenchmarkStart(null);
    setBenchmarkError("");
  };
  const recent = history.slice(-60);
  const historySummary = summarizePerformance(recent);
  const historyRecommendations = recommendPerformance(recent);
  const points = recent.map((entry,i)=>`${(i / Math.max(1,recent.length-1)*300).toFixed(1)},${(80-Math.min(80,entry.fps)/80*76).toFixed(1)}`).join(" ");
  const motion = useMotionQuality();
  const profiler = useRuntimeProfiler();
  const performance = useAdaptivePerformance();
  const animation = useSyncExternalStore(subscribeAnimationQuality, getAnimationQualitySnapshot, getAnimationQualitySnapshot);
  const scheduler = useSyncExternalStore(subscribeAnimationScheduler, getAnimationSchedulerSnapshot, getAnimationSchedulerSnapshot);
  const enabled = isAnimationSchedulerEnabled();
  const status = deriveMotionDashboardStatus({fps:frame.fps,framesSampled:frame.framesSampled,
    slowFrames:frame.slowFrames,active:frame.active,quality:motion.quality,
    motionSamples:motion.samples,schedulerTier:enabled?scheduler.tier:"disabled",
    animationTier:animation.tier});
  const hasProfiler = profiler.updatedAt > 0 && Date.now() - profiler.updatedAt < 6000;
  return <section className="render-diagnostics" aria-label="Adaptive Motion Quality Dashboard">
    <h3>V222 – Performance History & Intelligent Recommendations</h3>
    <p className="settings-note">Bestehende Diagnosedaten, ohne zusätzliche Messungen pro Frame. Werte beziehen sich auf die zuletzt gemeldete Szene beziehungsweise den zuletzt gemeldeten Avatar.</p>
    <div className="render-diagnostics-grid" aria-live="off">
      <div><span>Canvas FPS</span><strong>{frame.fps ?? "—"}</strong></div>
      <div><span>Frame-Zeit</span><strong>{frame.frameMs == null ? "—" : `${frame.frameMs} ms`}</strong></div>
      <div><span>Langsame Frames</span><strong>{status.slowPercent == null ? "—" : `${status.slowPercent.toFixed(1)} %`}</strong></div>
      <div><span>Motion-Qualität (heuristisch)</span><strong>{motion.samples ? `${motion.quality}/100` : "—"}</strong></div>
      <div><span>Animationsstufe</span><strong>{animation.tier} · {animation.targetHz} Hz max.</strong></div>
      <div><span>Grafikstufe / DPR</span><strong>{performance.tier} / {performance.dpr.toFixed(2)}</strong></div>
      <div><span>CPU-Scheduler</span><strong>{enabled ? scheduler.tier : "deaktiviert"}</strong></div>
      <div><span>Engpass (instrumentiert)</span><strong>{hasProfiler ? profiler.bottleneck : "—"}</strong></div>
    </div>
    <p role="status" className="settings-note"><strong>{status.label}:</strong> {status.explanation}</p>
    <details><summary>CPU-Phasen und Update-Frequenz</summary>
      <p className="settings-note">Aufwendige Choreografie-Auswertungen: {animation.evaluated} · wiederverwendete Frames: {animation.reused}. Zähler können bei Avatar-Wechsel zurückgesetzt werden.</p>
      {hasProfiler && profiler.phases.length ? <div className="render-diagnostics-grid">{profiler.phases.map(phase =>
        <div key={phase.name}><span>{phase.name} · CPU Mittel / P95</span><strong>{phase.meanMs.toFixed(2)} / {phase.p95Ms.toFixed(2)} ms</strong></div>
      )}</div> : <p className="settings-note">Keine aktuellen Profiler-Messwerte.</p>}
    </details>
    <details open><summary>V222 – FPS-Verlauf & Empfehlungen</summary>
      <p className="settings-note">Die letzten {history.length} aktiven Messintervalle (maximal 120, nur im Arbeitsspeicher). Gleiche Szene und gleiche Einstellungen für Vergleiche verwenden.</p>
      {recent.length > 1 ? <svg viewBox="0 0 300 84" role="img" aria-label="FPS-Verlauf der letzten bis zu 60 Messintervalle" style={{width:"100%",maxWidth:640,height:130,background:"rgba(127,127,127,0.08)",borderRadius:8}}>
        <line x1="0" y1="42" x2="300" y2="42" stroke="currentColor" opacity="0.2" strokeDasharray="4 4" />
        <polyline fill="none" stroke="#48c5ab" strokeWidth="2" strokeLinejoin="round" points={points}/>
      </svg> : <p className="settings-note">Noch keine ausreichenden Verlaufsmesswerte.</p>}
      {historySummary && <p className="settings-note">Durchschnitt: {historySummary.avgFps.toFixed(1)} FPS · {historySummary.avgFrameMs.toFixed(1)} ms · {historySummary.avgSlowPercent.toFixed(1)} % langsame Frames · Spanne: {historySummary.minFps}–{historySummary.maxFps} FPS.</p>}
      <ul>{historyRecommendations.map(message=><li key={message}>{message}</li>)}</ul>
      <button type="button" onClick={clearPerformanceHistory}>Verlauf zurücksetzen</button>
      <p className="settings-note">Die Werte beweisen keine Ursache: Avataranzahl, Bewegungen und Licht separat verändern und vergleichen. Keine automatische Anpassung.</p>
    </details>
    <details open><summary>V223 – Performance Benchmark Studio</summary>
      <p className="settings-note">Vergleiche verschiedene Einstellungen unter möglichst identischen Bedingungen. Messläufe verwenden ausschließlich die bestehenden ca. 1-Hz-FPS-Daten und bleiben lokal im Arbeitsspeicher.</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
        <label>Bezeichnung <input aria-label="Benchmark-Bezeichnung" value={benchmarkLabel} onChange={event=>setBenchmarkLabel(event.target.value)} placeholder="z.B. 2 Avatare · Balanced" disabled={benchmarkStart!==null}/></label>
        <label>Avatare <input aria-label="Avataranzahl im Benchmark" type="number" min={1} max={16} value={benchmarkAvatarCount} onChange={event=>setBenchmarkAvatarCount(Number(event.target.value))} disabled={benchmarkStart!==null}/></label>
        {benchmarkStart===null ? <button type="button" onClick={()=>{setBenchmarkError("");setBenchmarkStart(Date.now());}}>Messlauf starten</button>
          : <><span role="status">Messung läuft · {capturedCount} Intervalle</span><button type="button" onClick={endBenchmark}>Messlauf abschließen</button><button type="button" onClick={()=>{setBenchmarkStart(null);setBenchmarkError("");}}>Abbrechen</button></>}
        {benchmarkRuns.length>0 && <button type="button" onClick={()=>setBenchmarkRuns([])} disabled={benchmarkStart!==null}>Vergleiche löschen</button>}
      </div>
      {benchmarkError && <p role="alert" className="settings-note">{benchmarkError}</p>}
      {benchmarkRuns.length ? <div style={{overflowX:"auto"}}><table style={{width:"100%",textAlign:"left"}}><thead><tr><th>Messlauf</th><th>Avatare</th><th>Grafik</th><th>Samples</th><th>Ø FPS</th><th>Min. FPS</th><th>Ø Frame</th><th>Langsam</th></tr></thead><tbody>
        {benchmarkRuns.map(run=><tr key={run.id}><td>{run.label}</td><td>{run.avatarCount}</td><td>{run.graphicsTier}</td><td>{run.samples}</td><td>{run.avgFps.toFixed(1)}</td><td>{run.minFps.toFixed(0)}</td><td>{run.avgFrameMs.toFixed(1)} ms</td><td>{run.slowPercent.toFixed(1)} %</td></tr>)}
      </tbody></table></div> : <p className="settings-note">Noch keine abgeschlossenen Messläufe.</p>}
      {benchmarkRuns.length>=2 && (()=>{const baseline=benchmarkRuns[benchmarkRuns.length-2];const latest=benchmarkRuns[benchmarkRuns.length-1];const delta=benchmarkDelta(baseline,latest);return <p className="settings-note">Letzter Vergleich ({latest.label} gegenüber {baseline.label}): {delta.fps>=0?"+":""}{delta.fps.toFixed(1)} FPS, {delta.frameMs>=0?"+":""}{delta.frameMs.toFixed(1)} ms Frame-Zeit, {delta.slowPercent>=0?"+":""}{delta.slowPercent.toFixed(1)} Prozentpunkte langsame Frames.</p>;})()}
      <p className="settings-note">Avataranzahl wird manuell angegeben. Grafikstufe wird beim Abschluss übernommen. Vergleiche belegen keine Ursache, da Browser, Musik und Szeneninhalt variieren können.</p>
    </details>
    <p className="settings-note">CPU-Werte sind instrumentierte JavaScript-Phasen und keine Gesamtauslastung in %. Motion-Qualität ist eine Heuristik, keine physikalische Bewegungsmessung. Diese Anzeige beeinflusst Animation und automatische Qualitätssteuerung nicht.</p>
  </section>;
}
