"use client";
import { AdaptivePerformanceAutoPilot } from "./AdaptivePerformanceAutoPilot";

import { useEffect, useRef, useState } from "react";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { setPerformanceMode, useAdaptivePerformance } from "./adaptivePerformance";
import { useRenderDiagnostics } from "./renderDiagnostics";
import { PerformanceProfiles } from "./PerformanceProfiles";
import { recommendPerformanceProfile } from "./benchmarkOptimizer";
import { createTuningAdvice } from "./performanceAutoTuner";
import { InteractivePerformanceTuner } from "./InteractivePerformanceTuner";
import { ScenePerformanceStudio } from "./ScenePerformanceStudio";
import { AutomaticPerformanceCalibrationWizard } from "./AutomaticPerformanceCalibrationWizard";
import { PiOptimizationSuite } from "./PiOptimizationSuite";
import { compareBenchmarkTiers } from "./performanceComparisonV256";

import { BenchmarkHistory, exportBenchmarkCsv, saveBenchmarkHistory, loadBenchmarkHistory } from "./benchmarkHistory";
type Tier = "high" | "balanced" | "low";
type Result = { tier: Tier; fps: number; frameMs: number; slowPercent: number; calls: number; triangles: number; samples: number; p95FrameMs?: number; fpsSpread?: number };
type Run = { tierIndex: number; started: number; warmupUntil: number; stopAt: number; previousMode: "auto" | Tier; readings: Result[]; results: Result[]; lastTimestamp: number };
const tiers: Tier[] = ["high", "balanced", "low"];
const TEST_MS = 6500;
const WARMUP_MS = 2000;
const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
const n = (v: number) => Number.isFinite(v) ? v.toFixed(1) : "—";

export function PerformanceBenchmark() {
  const metrics = useRenderDiagnostics();
  const quality = useAdaptivePerformance();
  const { preferences } = useUiPreferences();
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<BenchmarkHistory[]>([]);
  useEffect(() => { setHistory(loadBenchmarkHistory()); }, []);
  const [phase, setPhase] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const runRef = useRef<Run | null>(null);
  const metricsRef = useRef(metrics);
  const qualityRef = useRef(quality);
  const preferencesRef = useRef(preferences);
  preferencesRef.current = preferences;
  metricsRef.current = metrics;
  qualityRef.current = quality;

  function stop(message = "") {
    const run = runRef.current;
    if (run) setPerformanceMode(run.previousMode);
    runRef.current = null;
    setRunning(false);
    setPhase("");
    setError(message);
  }
  function start() {
    if (runRef.current) return;
    const latest = metricsRef.current;
    if (!latest.updatedAt || Date.now() - latest.updatedAt > 3500) {
      setError("Keine Live-3D-Messwerte. Aktiviere die Avatar-Visualisierung und starte den Test erneut.");
      return;
    }
    const now = Date.now();
    runRef.current = { tierIndex: 0, started: now, warmupUntil: now + WARMUP_MS,
      stopAt: now + TEST_MS, previousMode: qualityRef.current.mode,
      readings: [], results: [], lastTimestamp: 0 };
    setResults([]);
    setProgress(0);
    setError("");
    setRunning(true);
    setPhase("High: Aufwärmen");
    setPerformanceMode("high");
  }
  useEffect(() => {
    const timer = window.setInterval(() => {
      const run = runRef.current;
      if (!run) return;
      const now = Date.now();
      const current = tiers[run.tierIndex];
      if (now - metricsRef.current.updatedAt > 3500) { stop("Der 3D-Visualizer liefert keine aktuellen Frames mehr. Benchmark abgebrochen."); return; }
      setProgress(Math.min(100, Math.round(100 * (run.tierIndex * TEST_MS + Math.min(TEST_MS, now - run.started)) / (tiers.length * TEST_MS))));
      setPhase(`${current}: ${now < run.warmupUntil ? "Aufwärmen" : "Messen"} (${run.tierIndex + 1}/${tiers.length})`);
      const m = metricsRef.current;
      if (now >= run.warmupUntil && m.updatedAt !== run.lastTimestamp && m.updatedAt >= run.warmupUntil && qualityRef.current.tier === current) {
        run.lastTimestamp = m.updatedAt;
        if (Number.isFinite(m.fps) && m.fps > 0) run.readings.push({ tier: current, fps: m.fps, frameMs: m.frameMs,
          slowPercent: m.slowPercent, calls: m.drawCalls, triangles: m.triangles, samples: m.samples, p95FrameMs: m.p95FrameMs ?? m.frameMs });
      }
      if (now < run.stopAt) return;
      if (run.readings.length < 2) { stop("Zu wenige Messungen. Halte den Avatar-Visualizer während des gesamten Tests aktiv."); return; }
      const readings = run.readings;
      const result: Result = { tier: current, fps: mean(readings.map(r => r.fps)), frameMs: mean(readings.map(r => r.frameMs)),
        slowPercent: mean(readings.map(r => r.slowPercent)), calls: mean(readings.map(r => r.calls)),
        triangles: mean(readings.map(r => r.triangles)), samples: readings.reduce((s, r) => s + r.samples, 0),
        p95FrameMs: mean(readings.map(r => r.p95FrameMs ?? r.frameMs)),
        fpsSpread: Math.max(...readings.map(r => r.fps)) - Math.min(...readings.map(r => r.fps)) };
      run.results.push(result);
      setResults([...run.results]);
      run.tierIndex++;
      if (run.tierIndex >= tiers.length) {
        const entry: BenchmarkHistory = { id: `${Date.now()}`, createdAt: new Date().toISOString(), avatar: preferencesRef.current.avatarModelId, lyricsStyle: preferencesRef.current.lyricsStyle, userAgent: navigator.userAgent, results: run.results };
        setHistory(saveBenchmarkHistory(entry));
        stop(); setProgress(100); return; }
      run.started = now;
      run.warmupUntil = now + WARMUP_MS;
      run.stopAt = now + TEST_MS;
      run.lastTimestamp = 0;
      run.readings = [];
      setPerformanceMode(tiers[run.tierIndex]);
    }, 250);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => () => {
    if (runRef.current) { setPerformanceMode(runRef.current.previousMode); runRef.current = null; }
  }, []);
  function download(data: string, filename: string, mime: string) {
    const url = URL.createObjectURL(new Blob([data], { type: mime }));
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
  const advice = recommendPerformanceProfile(results);
  const tuning = createTuningAdvice(results, results.map(r => ({tier:r.tier, calls:r.calls, triangles:r.triangles})));
  const comparison = compareBenchmarkTiers(results);
  const recommended = advice.recommended ? results.find(r => r.tier === advice.recommended) ?? null : null;
  return <section className="render-diagnostics" aria-label="3D-Performance-Benchmark">
    <h3>3D-Performance-Benchmark</h3>
    <p className="settings-note">Misst deine <strong>aktuell ausgewählte Avatar-/Lyrics-Kombination</strong> nacheinander in High, Balanced und Low (je 2 Sekunden Aufwärmen und 4,5 Sekunden Messung). Keine simulierten FPS. Halte die 3D-Avatar-Ansicht sichtbar; die Qualitätseinstellung wird danach wiederhergestellt.</p>
    <p className="settings-note">Aktuell: Avatar <strong>{preferences.avatarModelId}</strong> · Lyrics-Stil <strong>{preferences.lyricsStyle}</strong> · Immersive 3D <strong>{preferences.lyricsImmersiveEnabled ? "an" : "aus"}</strong></p>
    <div className="avatar-editor-buttons">
      <button type="button" disabled={running} onClick={start}>Benchmark starten</button>
      {running && <button type="button" onClick={() => stop("Benchmark abgebrochen.")}>Abbrechen</button>}
    </div>
    {running && <p role="status">{phase} · {progress}%</p>}
    {error && <p role="alert">{error}</p>}
    {results.length > 0 && <div className="render-diagnostics-grid">
      {results.map(r => <div key={r.tier}><strong>{r.tier}</strong><p>FPS: {n(r.fps)}</p><p>Frame-Zeit: {n(r.frameMs)} ms</p><p>P95: {n(r.p95FrameMs ?? 0)} ms · FPS-Schwankung: {n(r.fpsSpread ?? 0)}</p><p>Langsame Frames: {n(r.slowPercent)} %</p><small>Draw Calls: {Math.round(r.calls)} · Dreiecke: {Math.round(r.triangles)}</small></div>)}
    </div>}
    {!running && results.length === 3 && <div className="settings-note" aria-label="V256 Qualitätsvergleich">
      <h4>V256 – Qualitätsvergleich</h4>
      <p>Bewertung aus FPS, P95-Framezeit und langsamen Frames. Die Stichprobe ist kurz und die Qualitätsstufen laufen nacheinander; wechselnde Szenen oder thermische Drosselung können das Ergebnis beeinflussen.</p>
      <div className="render-diagnostics-grid">
        {comparison.map(item => <div key={item.tier}>
          <strong>{item.tier} · {item.score}/100 Punkte</strong>
          <p>{item.label}</p>
          <small>{item.explanation}</small>
        </div>)}
      </div>
      <p>Vergleiche die P95-Zeit mit deinem Ziel: 60 FPS ≈ 16,7 ms, 30 FPS ≈ 33,3 ms. Mehr Punkte bedeuten eine stabilere Messung, nicht automatisch die schönste Darstellung.</p>
    </div>}
    {!running && results.length === 3 && recommended && <p role="status"><strong>Empfehlung: {recommended.tier}</strong> – {advice.explanation}. Vergleich gilt nur für die aktuelle Avatar-/Lyrics-Kombination und dieses Gerät.</p>}
    {!running && results.length === 3 && !advice.reliable && <p role="alert">{advice.explanation}</p>}
    {!running && results.length === 3 && <div className="settings-note" aria-label="V225 Performance Auto-Tuning Empfehlungen">
      <h4>V225 – Performance Auto-Tuning Assistant</h4>
      <p>Unverbindliche Vorschläge aus den vorhandenen Benchmark-Messwerten. Keine automatische Änderung von DPR, Schatten, Effekten oder Avatar-Details.</p>
      <ul>{tuning.map(item => <li key={item.title}><strong>{item.title}</strong> ({item.priority}) – {item.rationale} <span>{item.nextStep}</span></li>)}</ul>
    </div>}
    <InteractivePerformanceTuner disabled={running} />
    <ScenePerformanceStudio disabled={running} />
    <PiOptimizationSuite disabled={running} />
    <AutomaticPerformanceCalibrationWizard disabled={running} />
    <AdaptivePerformanceAutoPilot disabled={running} />
    <PerformanceProfiles suggested={!running && results.length === 3 && recommended ? {quality: recommended.tier, fps: recommended.fps, frameMs: recommended.frameMs, slowPercent: recommended.slowPercent, avatar: preferences.avatarModelId, lyricsStyle: preferences.lyricsStyle} : null} />
    <div className="render-diagnostics-grid" aria-label="Geräteinformationen">
      <div><strong>Gerät / Browser</strong><p>{typeof navigator !== "undefined" ? navigator.platform || "Nicht verfügbar" : "Nicht verfügbar"}</p><small>{typeof navigator !== "undefined" ? navigator.userAgent : ""}</small></div>
      <div><strong>GPU / WebGL</strong><p>{metrics.renderer}</p><small>{metrics.webgl}</small></div>
      <div><strong>Canvas-Ressourcen</strong><p>{metrics.geometries} Geometrien · {metrics.textures} Texturen</p><small>Renderer-Statistik, keine GPU-Auslastung</small></div>
    </div>
    <h4>Benchmark-Verlauf ({history.length})</h4>
    <div className="avatar-editor-buttons">
      <button type="button" disabled={history.length === 0} onClick={() => download(JSON.stringify(history, null, 2), "sonic-benchmark-history.json", "application/json")}>JSON exportieren</button>
      <button type="button" disabled={history.length === 0} onClick={() => download(exportBenchmarkCsv(history), "sonic-benchmark-history.csv", "text/csv;charset=utf-8")}>CSV exportieren</button>
      <button type="button" disabled={running || history.length === 0} onClick={() => { if (window.confirm("Gespeicherten Benchmark-Verlauf löschen?")) { localStorage.removeItem("sonic-benchmark-history-v122"); setHistory([]); } }}>Verlauf löschen</button>
    </div>
    {history.slice(0, 10).map(entry => <div key={entry.id} className="settings-note"><strong>{new Date(entry.createdAt).toLocaleString("de-AT")}</strong> · {entry.avatar} · {entry.lyricsStyle}<div>{entry.results.map(r => `${r.tier}: ${n(r.fps)} FPS`).join(" | ")}</div></div>)}
    <p className="settings-note">Für einen anderen Avatar oder Lyrics-Stil: in den Einstellungen auswählen und Benchmark erneut starten. GPU-Auslastung lässt sich damit nicht direkt bestimmen.</p>
  </section>;
}
