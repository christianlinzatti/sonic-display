"use client";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useDanceDiagnostics } from "./danceDiagnosticsStore";
import { useDancePerformance } from "./dancePerformanceStore";
import { AdaptivePerformanceSettings } from "./adaptivePerformance";
import { useSyncExternalStore } from "react";
import { subscribeAnimationQuality, getAnimationQualitySnapshot } from "./adaptiveAnimationQuality";

export function DanceDiagnosticsPanel() {
  const frame = useDanceDiagnostics();
  const animation = useSyncExternalStore(subscribeAnimationQuality, getAnimationQualitySnapshot, getAnimationQualitySnapshot);
  const dance = useDancePerformance();
  const { enabled, active, metrics, beatEvents } = useAudioAnalysis();
  // The age of a beat event is NOT end-to-end audio-to-avatar latency.
  const lastBeatAt = beatEvents.length ? beatEvents[beatEvents.length - 1].at : null;
  const beatAge = lastBeatAt === null ? null : Math.max(0, Math.round(performance.now() - lastBeatAt));
  return <section className="dance-performance-preview" aria-label="Dance engine diagnostics">
    <div className="audio-debug-heading"><strong>Dance engine diagnostics</strong><span>{frame.active ? "● RENDERING" : "○ IDLE"}</span></div>
    <div className="dance-preview-grid">
      <div><small>Canvas FPS (sampled)</small><strong>{frame.fps ?? "—"}</strong></div>
      <div><small>Average frame interval</small><strong>{frame.frameMs == null ? "—" : `${frame.frameMs} ms`}</strong></div>
      <div><small>Slow frames (&gt;33 ms)</small><strong>{frame.framesSampled ? `${frame.slowFrames}/${frame.framesSampled}` : "—"}</strong></div>
      <div><small>Avatar renderer</small><strong>{frame.avatar}</strong></div>
      <div><small>Animation quality</small><strong>{frame.avatar === "gltf" ? `${animation.tier} (${animation.targetHz} Hz max)` : "Full rate"}</strong></div>
      <div><small>Complex animation updates / reused frames</small><strong>{frame.avatar === "gltf" ? `${animation.evaluated} / ${animation.reused}` : "—"}</strong></div>
      <div><small>Rhythm source</small><strong>{enabled && active ? "Microphone" : "Estimated"}</strong></div>
      <div><small>Phase lock</small><strong>{enabled && active && metrics.phaseLocked ? "Locked" : "Not locked"}</strong></div>
      <div><small>Choreography sequence</small><strong>{dance.sequence}</strong></div>
      <div><small>Last microphone beat age</small><strong>{enabled && active && beatAge !== null ? `${beatAge} ms` : "—"}</strong></div>
    </div>
    <AdaptivePerformanceSettings />
    <p className="settings-note">Complex choreography and personality updates may be reused at lower quality; beat impulses, microphone analysis, and avatar pose interpolation still run every frame. FPS and frame interval are measured inside the 3D render loop, sampled approximately once per second. Beat age is the time since the last detected event, <strong>not</strong> measured audio or display latency. Browser rendering may be throttled in background tabs.</p>
  </section>;
}
