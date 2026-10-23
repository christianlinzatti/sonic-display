"use client";
import { useRef, useState } from "react";
import { useRenderDiagnostics } from "./renderDiagnostics";
import { setPerformanceMode, useAdaptivePerformance } from "./adaptivePerformance";
import { getSceneDetail, setSceneDetail, useSceneDetail, type SceneDetail } from "./scenePerformanceControls";
import { recommendPiOptimization, type PiOptimization } from "./piOptimizationAdvisor";

/** Explicit opt-in. A single live snapshot is guidance, not a hardware benchmark. */
export function PiOptimizationSuite({ disabled = false }: { disabled?: boolean }) {
  const metrics = useRenderDiagnostics();
  const quality = useAdaptivePerformance();
  const detail = useSceneDetail();
  const [advice, setAdvice] = useState<PiOptimization | null>(null);
  const [message, setMessage] = useState("");
  const prior = useRef<{ mode: "auto" | "high" | "balanced" | "low"; scene: SceneDetail } | null>(null);
  function inspect() {
    setAdvice(recommendPiOptimization(metrics));
    setMessage("");
  }
  function apply() {
    if (!advice?.reliable || disabled) return;
    if (!prior.current) prior.current = { mode: quality.mode, scene: getSceneDetail() };
    if (advice.quality) setPerformanceMode(advice.quality);
    setSceneDetail(advice.scene);
    setMessage("Optimierung für diese Sitzung angewendet. Über 'Zurücksetzen' wiederherstellbar.");
  }
  function reset() {
    if (!prior.current) return;
    setPerformanceMode(prior.current.mode);
    setSceneDetail(prior.current.scene);
    prior.current = null;
    setAdvice(null);
    setMessage("Ursprüngliche Einstellungen wiederhergestellt.");
  }
  return <section className="settings-note" aria-label="V237 Raspberry Pi Optimization Suite">
    <h4>V237 – Raspberry Pi Optimization Suite 2.0</h4>
    <p>Ein-Klick-Diagnose mit echten Browser-FPS, Frame-Zeit und langsamen Frames. Die Empfehlung ist keine Raspberry-Pi-Hardwaremessung und ersetzt keinen mehrphasigen Benchmark.</p>
    <p>Live: {metrics.fps.toFixed(1)} FPS · {metrics.frameMs.toFixed(1)} ms · {metrics.slowPercent.toFixed(1)} % langsame Frames · {metrics.drawCalls} Draw Calls</p>
    <p>Render-Modus: {quality.mode} · Bühne: {detail}</p>
    <div className="avatar-editor-buttons">
      <button type="button" disabled={disabled} onClick={inspect}>Performance prüfen</button>
      <button type="button" disabled={disabled || !advice?.reliable} onClick={apply}>Empfehlung übernehmen</button>
      <button type="button" disabled={!prior.current} onClick={reset}>Zurücksetzen</button>
    </div>
    {advice && <p role="status">{advice.reason} {advice.reliable && `Profil: ${advice.quality ?? "unverändert"}, Bühne: ${advice.scene}.`}</p>}
    {message && <p role="status">{message}</p>}
    <p>Keine Konfigurationsdateien nötig. Avatar-Beats, Animationen und Lyrics bleiben unverändert. Für verlässliche Vergleiche den Benchmark mit identischer Avatar-/Song-Szene wiederholen.</p>
  </section>;
}
