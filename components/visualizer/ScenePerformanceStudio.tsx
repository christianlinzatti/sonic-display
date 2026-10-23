"use client";
import { useEffect, useRef, useState } from "react";
import { useRenderDiagnostics } from "./renderDiagnostics";
import { getSceneDetail, setSceneDetail, useSceneDetail, type SceneDetail } from "./scenePerformanceControls";

type Sample = { fps: number; frameMs: number; slowPercent: number; drawCalls: number };
type Result = { before: Sample; after: Sample; candidate: SceneDetail };
const DURATION_MS = 6500;
const WARMUP_MS = 1500;
function mean(samples: Sample[]): Sample {
  const sum = (key: keyof Sample) => samples.reduce((acc, item) => acc + item[key], 0) / samples.length;
  return { fps: sum("fps"), frameMs: sum("frameMs"), slowPercent: sum("slowPercent"), drawCalls: sum("drawCalls") };
}
export function scenePerformanceAdvice(result: Result): string {
  const gain = result.after.fps - result.before.fps;
  if (gain >= 3 && result.after.slowPercent <= result.before.slowPercent + 2) return `Testvariante bringt ${gain.toFixed(1)} FPS mehr. Derselbe Songabschnitt sollte erneut geprüft werden.`;
  if (gain <= -3) return "Testvariante war langsamer. Die Messung unter gleichen Bedingungen wiederholen.";
  return "Kein eindeutiger FPS-Vorteil. Für belastbare Ergebnisse mehrere Durchläufe vergleichen.";
}
export function ScenePerformanceStudio({ disabled = false }: { disabled?: boolean }) {
  const detail = useSceneDetail();
  const diagnostics = useRenderDiagnostics();
  const metricsRef = useRef(diagnostics);
  metricsRef.current = diagnostics;
  const [candidate, setCandidate] = useState<SceneDetail>("no-pulse");
  const [stage, setStage] = useState<"idle" | "baseline" | "trial" | "review">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const run = useRef<{ original: SceneDetail; candidate: SceneDetail; phase: "baseline" | "trial"; started: number; lastStamp: number; samples: Sample[]; before?: Sample } | null>(null);
  function restore() { if (run.current) setSceneDetail(run.current.original); run.current = null; setStage("idle"); }
  function start() {
    if (disabled || run.current) return;
    const d = metricsRef.current;
    if (!d.updatedAt || Date.now() - d.updatedAt > 3500) { setMessage("Keine aktuellen Messwerte – zuerst die 3D-Ansicht aktivieren."); return; }
    setMessage(""); setResult(null);
    run.current = { original: getSceneDetail(), candidate, phase: "baseline", started: Date.now(), lastStamp: d.updatedAt, samples: [] };
    setStage("baseline");
  }
  useEffect(() => {
    const interval = window.setInterval(() => {
      const r = run.current;
      if (!r) return;
      const now = Date.now();
      const d = metricsRef.current;
      if (!d.updatedAt || now - d.updatedAt > 3500) { restore(); setMessage("Messwerte veraltet: Test abgebrochen und Szene zurückgesetzt."); return; }
      if (now - r.started >= WARMUP_MS && d.updatedAt !== r.lastStamp) {
        r.lastStamp = d.updatedAt;
        if ([d.fps, d.frameMs, d.slowPercent, d.drawCalls].every(Number.isFinite) && d.fps > 0) {
          r.samples.push({ fps: d.fps, frameMs: d.frameMs, slowPercent: d.slowPercent, drawCalls: d.drawCalls });
        }
      }
      if (now - r.started < DURATION_MS) return;
      if (r.samples.length < 2) { restore(); setMessage("Zu wenige gültige Messwerte: Test abgebrochen."); return; }
      const measured = mean(r.samples);
      if (r.phase === "baseline") {
        r.before = measured;
        r.phase = "trial";
        r.started = now;
        r.lastStamp = d.updatedAt;
        r.samples = [];
        setSceneDetail(r.candidate);
        setStage("trial");
      } else {
        setResult({ before: r.before!, after: measured, candidate: r.candidate });
        restore();
        setStage("review");
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => () => { if (run.current) setSceneDetail(run.current.original); run.current = null; }, []);
  return <section className="settings-note" aria-label="V227 Scene Performance Studio">
    <h4>V227 – Intelligent Scene Performance Optimizer</h4>
    <p>Vergleicht die aktuelle Bühne mit einer einzelnen echten Szenenänderung. Beide Phasen dauern je 6,5 Sekunden. Die Testvariante wird danach automatisch zurückgesetzt.</p>
    <label>Szene testen <select value={candidate} disabled={disabled || stage === "baseline" || stage === "trial"} onChange={e => setCandidate(e.target.value as SceneDetail)}>
      <option value="no-pulse">Bodenpuls deaktivieren</option>
      <option value="no-rings">Auch Bodenringe ausblenden</option>
      <option value="minimal-lights">Zusatzlicht und Lichtstrahl deaktivieren</option>
      <option value="full">Volle Szenendetails</option>
    </select></label>
    <p>Aktuelle Bühnenvariante: {detail}. Schattenkarten und 3D-Partikelsysteme werden hier nicht als Testoption angeboten, da die aktuelle Bühne sie nicht nutzt. Avatar-LOD bitte separat im Benchmark testen.</p>
    <div className="avatar-editor-buttons">
      <button type="button" disabled={disabled || stage === "baseline" || stage === "trial"} onClick={start}>Szenenvergleich starten</button>
      {(stage === "baseline" || stage === "trial") && <button type="button" onClick={() => { restore(); setMessage("Abgebrochen – ursprüngliche Szene wiederhergestellt."); }}>Abbrechen &amp; zurücksetzen</button>}
      {stage === "review" && result && <button type="button" disabled={disabled} onClick={() => { setSceneDetail(result.candidate); setMessage("Szenenvariante übernommen (nur für die aktuelle Sitzung). Über den Vollmodus zurücksetzbar."); setStage("idle"); }}>Testvariante übernehmen</button>}
      {stage === "idle" && detail !== "full" && <button type="button" onClick={() => { setSceneDetail("full"); setMessage("Volle Szenendetails wiederhergestellt."); }}>Volle Szene wiederherstellen</button>}
    </div>
    {(stage === "baseline" || stage === "trial") && <p role="status">{stage === "baseline" ? "Ausgangsszene wird gemessen" : "Testszene wird gemessen"} …</p>}
    {result && <div aria-label="Szenenvergleich"><p>Vorher: {result.before.fps.toFixed(1)} FPS · {result.before.slowPercent.toFixed(1)} % langsame Frames · {result.before.drawCalls.toFixed(0)} Draw Calls</p>
      <p>Test: {result.after.fps.toFixed(1)} FPS · {result.after.slowPercent.toFixed(1)} % langsame Frames · {result.after.drawCalls.toFixed(0)} Draw Calls</p>
      <p><strong>FPS-Unterschied: {(result.after.fps - result.before.fps).toFixed(1)}</strong> · {scenePerformanceAdvice(result)}</p></div>}
    {message && <p role="status">{message}</p>}
  </section>;
}
