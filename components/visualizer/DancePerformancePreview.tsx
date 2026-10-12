"use client";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useDancePerformance } from "./dancePerformanceStore";

const names: Record<string, string> = {
  baseline: "Default choreography", driving: "Driving / four-on-floor",
  "double-step": "Double-step", offbeat: "Offbeat", freeform: "Freeform",
};
export function DancePerformancePreview() {
  const performance = useDancePerformance();
  const { enabled, active } = useAudioAnalysis();
  const live = performance.playing;
  return <section className="dance-performance-preview" aria-label="Dance performance preview">
    <div className="audio-debug-heading"><strong>Dance performance preview</strong><span className={live ? "audio-live" : "audio-idle"}>{live ? "● PLAYING" : "○ IDLE"}</span></div>
    <div className="dance-preview-grid">
      <div><small>Detected rhythm</small><strong>{enabled && active ? performance.rhythm : "Microphone off"}</strong></div>
      <div><small>Active sequence</small><strong>{names[performance.sequence] ?? performance.sequence}</strong></div>
      <div><small>Current move</small><strong>{performance.move}</strong></div>
      <div><small>Song section (estimated)</small><strong>{performance.section}</strong></div>
      <div><small>Rhythm confidence</small><strong>{Math.round(performance.confidence * 100)}%</strong></div>
      <div><small>Transition progress</small><strong>{Math.round(performance.blend * 100)}%</strong></div>
    </div>
    <div className="dance-preview-progress" role="progressbar" aria-label="Choreography transition" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(performance.blend * 100)}><div style={{width: `${performance.blend * 100}%`}} /></div>
    <p className="settings-note">{live && performance.secondsUntilSwitch !== null
      ? `Next possible sequence switch: ~${performance.secondsUntilSwitch.toFixed(1)} s (${performance.beatsUntilSwitch} beats) · at the next eight-beat boundary`
      : "Start playback to see the next possible sequence change."}</p>
    <p className="settings-note">The boundary is estimated from BPM, not a confirmed upcoming move. A sequence changes only when a reliable rhythm change is detected. {performance.source === "procedural" ? "The procedural avatar uses the default choreography." : "Displaying the active GLTF choreography."}</p>
  </section>;
}
