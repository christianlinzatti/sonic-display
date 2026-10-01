"use client";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
export function AudioVisualizer() {
  const { enabled, active, error, metrics, setEnabled } = useAudioAnalysis();
  return <aside className="audio-panel" aria-label="Mikrofon-Visualisierung">
    <button className="audio-toggle" onClick={() => setEnabled(!enabled)}>{enabled ? "Mikrofon ausschalten" : "Mikrofon aktivieren"}</button>
    <span className="audio-status" role="status">{error ?? (active ? "Mikrofon aktiv · lokale Analyse" : enabled ? "Mikrofon wird gestartet …" : "Mikrofon aus")}</span>
    <div className="audio-bars" aria-hidden="true">{([metrics.bass, metrics.mids, metrics.highs] as number[]).map((v, i) => <span key={i} style={{ height: `${Math.max(3, v * 100)}%` }} />)}</div>
    <span className="audio-label">{metrics.beat > 0.2 ? "BEAT" : "BASS · MITTEN · HÖHEN"}</span>
  </aside>;
}
