"use client";

import { useEffect, useRef, useState } from "react";
import { setPerformanceMode, useAdaptivePerformance } from "./adaptivePerformance";
import { useRenderDiagnostics } from "./renderDiagnostics";

type Tier = "high" | "balanced" | "low";
type Sample = { fps: number; frameMs: number; slowPercent: number };
const SAMPLE_MS = 6500;
const WARMUP_MS = 1500;
const average = (items: Sample[]): Sample => ({
  fps: items.reduce((s, x) => s + x.fps, 0) / items.length,
  frameMs: items.reduce((s, x) => s + x.frameMs, 0) / items.length,
  slowPercent: items.reduce((s, x) => s + x.slowPercent, 0) / items.length,
});
export function compareTuningRuns(before: Sample, after: Sample) {
  return { fps: after.fps - before.fps, frameMs: after.frameMs - before.frameMs, slowPercent: after.slowPercent - before.slowPercent };
}

export function InteractivePerformanceTuner({ disabled = false }: { disabled?: boolean }) {
  const performance = useAdaptivePerformance();
  const diagnostics = useRenderDiagnostics();
  const performanceRef = useRef(performance);
  const diagnosticsRef = useRef(diagnostics);
  performanceRef.current = performance;
  diagnosticsRef.current = diagnostics;
  const [candidate, setCandidate] = useState<Tier>("balanced");
  const [stage, setStage] = useState<"idle" | "baseline" | "candidate" | "review">("idle");
  const [result, setResult] = useState<{ before: Sample; after: Sample } | null>(null);
  const [error, setError] = useState("");
  const run = useRef<{ original: "auto" | Tier; started: number; lastStamp: number; samples: Sample[]; baseline?: Sample; phase: "baseline" | "candidate" } | null>(null);
  const candidateRef = useRef(candidate);
  candidateRef.current = candidate;

  function restore() {
    if (run.current) setPerformanceMode(run.current.original);
    run.current = null;
    setStage("idle");
  }
  function begin() {
    if (disabled || run.current) return;
    const d = diagnosticsRef.current;
    if (!d.updatedAt || Date.now() - d.updatedAt > 3500) {
      setError("Keine aktuellen 3D-Messwerte. Avatar-Ansicht aktivieren."); return;
    }
    setError(""); setResult(null);
    run.current = { original: performanceRef.current.mode, started: Date.now(), lastStamp: d.updatedAt, samples: [], phase: "baseline" };
    // The same configuration is sampled before trying the candidate.
    setStage("baseline");
  }
  useEffect(() => {
    const interval = window.setInterval(() => {
      const active = run.current;
      if (!active) return;
      const now = Date.now();
      const d = diagnosticsRef.current;
      if (now - d.updatedAt > 3500) { restore(); setError("Visualizer-Messwerte nicht mehr aktuell. Einstellungen wiederhergestellt."); return; }
      if (now - active.started > WARMUP_MS && d.updatedAt !== active.lastStamp) {
        active.lastStamp = d.updatedAt;
        if (d.fps > 0 && Number.isFinite(d.fps) && Number.isFinite(d.frameMs) && Number.isFinite(d.slowPercent)) {
          active.samples.push({ fps: d.fps, frameMs: d.frameMs, slowPercent: d.slowPercent });
        }
      }
      if (now - active.started < SAMPLE_MS) return;
      if (active.samples.length < 2) { restore(); setError("Zu wenige gültige Messwerte. Test abgebrochen und zurückgesetzt."); return; }
      const measured = average(active.samples);
      if (active.phase === "baseline") {
        active.baseline = measured;
        active.phase = "candidate";
        active.started = now;
        active.samples = [];
        active.lastStamp = d.updatedAt;
        setPerformanceMode(candidateRef.current);
        setStage("candidate");
      } else {
        setResult({ before: active.baseline!, after: measured });
        // Always restore after the trial; applying is a separate explicit action.
        restore();
        setStage("review");
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => () => { if (run.current) setPerformanceMode(run.current.original); run.current = null; }, []);
  const delta = result ? compareTuningRuns(result.before, result.after) : null;
  return <section className="settings-note" aria-label="V226 Interactive Performance Tuning Studio">
    <h4>V226 – Interactive Performance Tuning Studio</h4>
    <p>Qualitätsprofil vorübergehend testen und Live-FPS vergleichen. Pro Phase ca. 6,5 Sekunden einschließlich Aufwärmen. Nach dem Test wird die ursprüngliche Einstellung automatisch wiederhergestellt.</p>
    <label>Testprofil {" "}<select aria-label="Qualitätsprofil testen" disabled={disabled || stage !== "idle"} value={candidate} onChange={e => setCandidate(e.target.value as Tier)}>
      <option value="high">High</option><option value="balanced">Balanced</option><option value="low">Low</option>
    </select></label>
    <div className="avatar-editor-buttons">
      <button type="button" disabled={disabled || stage === "baseline" || stage === "candidate"} onClick={begin}>Vorher/Nachher testen</button>
      {(stage === "baseline" || stage === "candidate") && <button type="button" onClick={() => { restore(); setError("Test abgebrochen. Ursprüngliche Einstellung wiederhergestellt."); }}>Abbrechen &amp; zurücksetzen</button>}
      {stage === "review" && result && <button type="button" disabled={disabled} onClick={() => { setPerformanceMode(candidate); setStage("idle"); setError(`Profil ${candidate} übernommen. Zum dauerhaften Speichern nutze die Performance-Profile.`); }}>Testprofil übernehmen</button>}
    </div>
    {(stage === "baseline" || stage === "candidate") && <p role="status">{stage === "baseline" ? "Vorher-Messung" : "Testprofil wird gemessen"} …</p>}
    {result && <div aria-label="Vorher/Nachher-Ergebnis">
      <p>Vorher: {result.before.fps.toFixed(1)} FPS · {result.before.frameMs.toFixed(1)} ms · {result.before.slowPercent.toFixed(1)} % langsame Frames</p>
      <p>Testprofil {candidate}: {result.after.fps.toFixed(1)} FPS · {result.after.frameMs.toFixed(1)} ms · {result.after.slowPercent.toFixed(1)} % langsame Frames</p>
      <p><strong>Unterschied:</strong> {delta!.fps >= 0 ? "+" : ""}{delta!.fps.toFixed(1)} FPS; {delta!.frameMs >= 0 ? "+" : ""}{delta!.frameMs.toFixed(1)} ms; {delta!.slowPercent >= 0 ? "+" : ""}{delta!.slowPercent.toFixed(1)} Prozentpunkte langsame Frames.</p>
    </div>}
    {error && <p role="status">{error}</p>}
    <p>Keine automatische Änderung an Avataren, Schatten oder Effekt-Konfigurationen. Vergleiche denselben Songabschnitt und dieselbe Avataranzahl.</p>
  </section>;
}
