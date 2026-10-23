"use client";
import { useSyncExternalStore, useState } from "react";
import {ConcertPerformanceDiagnosticsV480} from "./ConcertPerformanceDiagnosticsV480";
import { subscribeAnimationScheduler, getAnimationSchedulerSnapshot, setAnimationSchedulerEnabled, isAnimationSchedulerEnabled } from "./adaptiveAnimationScheduler";
import { useAdaptivePerformance } from "./adaptivePerformance";
import { useRuntimeProfiler } from "./runtimeProfiler";
import { useAudioWorkerTelemetry } from "./audioWorkerTelemetry";
import { useRenderDiagnostics } from "./renderDiagnostics";
import { getQualityDecisionHistory, getServerQualityDecisionHistory, subscribeQualityDecisionHistory, clearQualityDecisionHistory } from "./qualityDecisionHistoryV255";

const number = (value: number, digits = 0) => Number.isFinite(value) ? value.toFixed(digits) : "—";
export function RenderDiagnosticsPanel() {
  const scheduler = useSyncExternalStore(subscribeAnimationScheduler, getAnimationSchedulerSnapshot, getAnimationSchedulerSnapshot);
  const [schedulerEnabled, setSchedulerEnabled] = useState(isAnimationSchedulerEnabled);
  const metrics = useRenderDiagnostics();
  const decisions = useSyncExternalStore(subscribeQualityDecisionHistory, getQualityDecisionHistory, getServerQualityDecisionHistory);
  const profiler = useRuntimeProfiler();
  const audioWorker = useAudioWorkerTelemetry();
  const quality = useAdaptivePerformance();
  const available = metrics.updatedAt !== 0 && Date.now() - metrics.updatedAt < 5000;
  return <section className="render-diagnostics" aria-label="3D-Renderdiagnose">
    <h3>3D-Renderdiagnose</h3>
    <p className="settings-note">Live-Daten werden etwa einmal pro Sekunde aktualisiert. Öffne den Avatar-Visualizer, damit WebGL-Messwerte verfügbar sind.</p>
    {!available ? <p role="status">Keine aktuellen Messwerte – Avatar-Visualizer aktivieren.</p> : <>
      <div className="render-diagnostics-grid">
        <div><span>FPS</span><strong>{number(metrics.fps, 1)}</strong></div>
        <div><span>Frame-Zeit</span><strong>{number(metrics.frameMs, 1)} ms</strong></div>
        <div><span>Frame-Zeit P95</span><strong>{number(metrics.p95FrameMs ?? 0, 1)} ms</strong></div>
        <div><span>Langsame Frames (&gt;33 ms)</span><strong>{number(metrics.slowPercent, 1)} %</strong></div>
        <div><span>Draw Calls</span><strong>{number(metrics.drawCalls)}</strong></div>
        <div><span>Dreiecke</span><strong>{number(metrics.triangles)}</strong></div>
        <div><span>Geometrien / Texturen</span><strong>{metrics.geometries} / {metrics.textures}</strong></div>
      </div>
      <p className="settings-note">GPU / Renderer: {metrics.renderer}</p>
      <p className="settings-note">WebGL: {metrics.webgl}</p>
    </>}
    <ConcertPerformanceDiagnosticsV480 />
    <h4>V255 – Verlauf der Rendering-Entscheidungen</h4>
    <p className="settings-note">Automatische Qualitätswechsel während dieser Sitzung. Es werden maximal 24 Wechsel gespeichert, ohne Upload oder dauerhafte Speicherung. Die Werte sind Näherungen, keine GPU-Ausführungszeiten.</p>
    <button type="button" onClick={clearQualityDecisionHistory} disabled={decisions.length === 0}>Verlauf löschen</button>
    {decisions.length === 0 ? <p className="settings-note">Noch keine automatischen Qualitätswechsel gemessen.</p> :
      <ol className="quality-decision-history" aria-label="Qualitätswechsel">
        {decisions.map((entry, index) => <li key={`${entry.at}-${index}`}>
          <strong>{entry.from} → {entry.to}</strong> · {entry.reason} · {new Date(entry.at).toLocaleTimeString()}<span className="settings-note"> · {number(entry.fps,1)} FPS · P95 {number(entry.p95FrameMs,1)} ms · langsam {number(entry.slowPercent,1)} % · {entry.drawCalls} Calls · {entry.triangles} Dreiecke · Gerätegrenze {entry.deviceCap}</span>
        </li>)}
      </ol>}
    <h4>V164 – Adaptive Animation Scheduler</h4>
    <label><input type="checkbox" checked={schedulerEnabled} onChange={event => { setSchedulerEnabled(event.target.checked); setAnimationSchedulerEnabled(event.target.checked); }} /> CPU-bewusste Nebenaufgaben-Drosselung aktivieren</label>
    <p className="settings-note">Stufe: <strong>{schedulerEnabled ? scheduler.tier : "deaktiviert"}</strong> · {scheduler.reason}. Choreografie-Auswahl: {scheduler.timings.director.toFixed(1)} s · Formation: {scheduler.timings.formation === 0 ? "pro Frame" : `${Math.round(1 / scheduler.timings.formation)} Hz`} · Diagnosen: {scheduler.timings.preview.toFixed(2)} s. Kritische IK-, Clip- und Beatberechnungen laufen weiterhin pro Frame.</p>
    <h4>V163 – CPU-Bottleneck-Profiler</h4>
    <p className="settings-note">Heuristischer Hauptthread-Engpass: <strong>{profiler.bottleneck}</strong> · {profiler.explanation}</p>
    <div className="render-diagnostics-grid">
      {profiler.phases.map(phase => <div key={phase.name}><span>{phase.name} · Mittel / P95</span><strong>{number(phase.meanMs,2)} / {number(phase.p95Ms,2)} ms</strong></div>)}
      <div><span>Audio Worker · Mittel / P95</span><strong>{audioWorker.mode === "worker" ? `${number(audioWorker.latencyMs,1)} / ${number(audioWorker.p95Ms,1)} ms` : audioWorker.mode}</strong></div>
    </div>
    <p className="settings-note">CPU-Phasen sind synchron gemessene JavaScript-Zeiten und dürfen nicht mit GPU-Renderzeit addiert werden. Worker-Latenz ist asynchron und enthält Nachrichtenlaufzeit. Messungen basieren auf gleitenden Stichproben. V164 verwendet CPU-P95-Werte nur für nichtkritische Berechnungsintervalle; die Grafikqualitätsregelung bleibt unabhängig.</p>
    <p className="settings-note">Qualität: <strong>{quality.tier}</strong> · Modus: {quality.mode} · Pixel Ratio: {number(quality.dpr, 2)} · {quality.reason}</p>
    <p className="settings-note">Avatar LOD (V123): {quality.tier === "high" ? "LOD0" : quality.tier === "balanced" ? "LOD1" : "LOD2"} bevorzugt. Funktioniert nur bei importierten Avataren mit benannten Mesh-Varianten (z. B. Body_LOD0/Body_LOD1/Body_LOD2). Ohne Varianten wird die Geometrie nicht reduziert.</p>
    <p className="settings-note">GPU-Auslastung (%) und VRAM-Verbrauch lassen sich im Browser nicht zuverlässig messen. Draw Calls und Dreiecke sind WebGL-Zähler, keine GPU-Auslastungswerte.</p>
  </section>;
}
