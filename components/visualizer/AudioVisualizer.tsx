"use client";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useUiPreferences } from "@/context/UiPreferencesContext";
export function AudioVisualizer() {
  const { enabled, active, error, metrics, setEnabled } = useAudioAnalysis();
  const { updatePreferences } = useUiPreferences();
  const toggle = () => { setEnabled(!enabled); updatePreferences({ microphoneEnabled: !enabled }); };
  return <aside className="audio-panel" aria-label="Mikrofon-Visualisierung">
    <button className="audio-toggle" onClick={toggle}>{enabled ? "Mikrofon ausschalten" : "Mikrofon aktivieren"}</button>
    <span className="audio-status" role="status">{error ?? (active ? "Mikrofon aktiv · lokale Analyse" : enabled ? "Mikrofon wird gestartet …" : "Mikrofon aus")}</span>
    <div className="audio-bars" aria-hidden="true">{([metrics.bass, metrics.mids, metrics.highs] as number[]).map((v, i) => <span key={i} style={{ height: `${Math.max(3, v * 100)}%` }} />)}</div>
    <span className="audio-label">{metrics.beatStrength > 0.2 ? "BEAT" : "BASS · MITTEN · HÖHEN"}</span>
  </aside>;
}
