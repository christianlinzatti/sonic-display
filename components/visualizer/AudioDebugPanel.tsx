"use client";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { DancePerformancePreview } from "./DancePerformancePreview";
import { DanceDiagnosticsPanel } from "./DanceDiagnosticsPanel";
import { BeatGridVisualizer } from "@/components/visualizer/BeatGridVisualizer";

const signals = [
  ["Kick", "kick"], ["Snare", "snare"], ["Hi-hat", "hiHat"],
  ["Bass", "bass"], ["Mids", "mids"], ["Highs", "highs"],
  ["Energy", "energyEnvelope"], ["Attack", "attack"], ["Decay", "decay"],
] as const;

export function AudioDebugPanel() {
  const { enabled, active, error, metrics, beatEvents } = useAudioAnalysis();
  if (!enabled) return <><p className="settings-note">Enable microphone analysis to inspect live audio signals.</p><DancePerformancePreview /><DanceDiagnosticsPanel /></>;
  return <section className="audio-debug" aria-label="Live audio analysis">
    <div className="audio-debug-heading"><strong>Live audio debug</strong><span className={active ? "audio-live" : "audio-idle"}>{active ? "● LIVE" : "○ INACTIVE"}</span></div>
    {error && <p role="alert" className="audio-debug-error">{error}</p>}
    <div className="audio-debug-meta"><span>BPM estimate: <b>{metrics.bpm ?? "—"}</b></span><span>BPM confidence: <b>{Math.round((metrics.bpmConfidence ?? 0) * 100)}%</b></span><span>Phase lock: <b>{metrics.phaseLocked ? "LOCKED" : "SEARCHING"}</b></span><span>Phase confidence: <b>{Math.round((metrics.phaseConfidence ?? 0) * 100)}%</b></span><span>Next kick: <b>{metrics.timeToNextKickMs == null ? "—" : `${metrics.timeToNextKickMs} ms`}</b></span><span>Pre-kick: <b>{Math.round((metrics.kickAnticipation ?? 0) * 100)}%</b></span><span>Beat phase: <b>{metrics.beatPhase == null ? "—" : `${Math.round(metrics.beatPhase * 360)}°`}</b></span><span>Learned rhythm: <b>{metrics.learnedRhythm ?? "unknown"}</b></span><span>Rhythm confidence: <b>{Math.round((metrics.rhythmConfidence ?? 0) * 100)}%</b></span><span>Learned phrases: <b>{metrics.rhythmRepetitions ?? 0}</b></span><span>Kick pattern: <b>{metrics.kickPattern ?? "unknown"}</b></span><span>Pattern confidence: <b>{Math.round((metrics.kickPatternConfidence ?? 0) * 100)}%</b></span><span>Kick accent: <b>{metrics.kickAccent ?? "—"}</b></span><span>Accent intensity: <b>{Math.round((metrics.kickAccentIntensity ?? 0) * 100)}%</b></span><span>Beat: <b>{metrics.beat ? "DETECTED" : "—"}</b></span><span>Strength: <b>{metrics.beatStrength.toFixed(2)}</b></span></div>
    {signals.map(([label, key]) => {
      const value = metrics[key];
      return <div className="audio-meter" key={key}><span>{label}</span><div className="audio-meter-track"><div className="audio-meter-fill" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}/></div><code>{value.toFixed(2)}</code></div>;
    })}
    <div className="beat-timeline" aria-label="Beat detection timeline">
      <div className="beat-timeline-heading"><strong>Recent beat timeline</strong><span>Last 5 seconds</span></div>
      <div className="beat-timeline-track">{beatEvents.filter(event => performance.now() - event.at <= 5000).map((event, index) => <span key={`${event.at}-${index}`} title={`Beat strength ${event.strength.toFixed(2)}`} style={{ left: `${100 - (performance.now() - event.at) / 50}%`, height: `${25 + event.strength * 75}%` }} />)}</div>
      <div className="beat-timeline-axis"><span>5s ago</span><span>now</span></div>
    </div>
    <BeatGridVisualizer events={beatEvents} bpm={metrics.bpm} active={active} />
    <DancePerformancePreview />
    <DanceDiagnosticsPanel />
    <p className="settings-note">Signals are estimated from microphone input; frequency bands overlap and are not instrument classification.</p>
  </section>;
}
