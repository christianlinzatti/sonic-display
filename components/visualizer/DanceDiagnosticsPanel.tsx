"use client";
import { AdaptiveMotionQualityDashboard } from "./AdaptiveMotionQualityDashboard";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useMotionQuality } from "./motionQualityDiagnostics";
import { useIKQuality } from "./ikMotionAnalyzer";
import { useRefinementSettings, setRefinementSettings } from "./adaptiveFullBodyRefinement";
import { useDanceDiagnostics } from "./danceDiagnosticsStore";
import { useDancePerformance } from "./dancePerformanceStore";
import { AdaptivePerformanceSettings } from "./adaptivePerformance";
import { RaspberryPiEditionSettings } from "./RaspberryPiEdition";
import {LongRunStabilitySettingsV355} from "./LongRunStabilityV355";
import { useSyncExternalStore } from "react";
import { subscribeAnimationQuality, getAnimationQualitySnapshot } from "./adaptiveAnimationQuality";

export function DanceDiagnosticsPanel() {
  const frame = useDanceDiagnostics();
  const motionQuality = useMotionQuality();
  const ikQuality = useIKQuality();
  const refinement = useRefinementSettings();
  const animation = useSyncExternalStore(subscribeAnimationQuality, getAnimationQualitySnapshot, getAnimationQualitySnapshot);
  const dance = useDancePerformance();
  const { enabled, active, metrics, beatEvents } = useAudioAnalysis();
  // The age of a beat event is NOT end-to-end audio-to-avatar latency.
  const lastBeatAt = beatEvents.length ? beatEvents[beatEvents.length - 1].at : null;
  const beatAge = lastBeatAt === null ? null : Math.max(0, Math.round(performance.now() - lastBeatAt));
  return <section className="dance-performance-preview" aria-label="Dance engine diagnostics">
    <AdaptiveMotionQualityDashboard />
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
    <div className="audio-debug-heading"><strong>Motion quality (heuristic)</strong><span>{motionQuality.samples ? `${motionQuality.quality}/100` : "—"}</span></div>
    <div className="dance-preview-grid">
      <div><small>Peak joint rotation</small><strong>{motionQuality.samples ? `${motionQuality.maxJointAngle}°` : "—"}</strong></div>
      <div><small>Fastest sampled change</small><strong>{motionQuality.samples ? `${motionQuality.maxSpeed} rad/s` : "—"}</strong></div>
      <div><small>High-amplitude samples</small><strong>{motionQuality.clipped}</strong></div>
      <div><small>Competing torso overlays</small><strong>{motionQuality.conflicts}</strong></div>
    </div>
    {motionQuality.issues.length > 0 ? <ul>{motionQuality.issues.map(issue => <li key={issue.code}>{issue.description}</li>)}</ul> : <p className="settings-note">No sampled motion warnings. A high score does not guarantee realistic movement.</p>}
    <div className="audio-debug-heading"><strong>V157 – IK motion analyzer (heuristic)</strong><span>{ikQuality.frames ? "● SAMPLED" : "○ IDLE"}</span></div>
    <div className="dance-preview-grid">
      <div><small>Measured dancer</small><strong>{ikQuality.dancer}</strong></div>
      <div><small>Planted foot samples</small><strong>{ikQuality.plantedFrames}</strong></div>
      <div><small>Mean foot anchor deviation (world units)</small><strong>{ikQuality.plantedFrames ? ikQuality.slideMean.toFixed(3) : "—"}</strong></div>
      <div><small>Hand target error (world units)</small><strong>{ikQuality.handErrorMean === null ? "—" : ikQuality.handErrorMean.toFixed(3)}</strong></div>
      <div><small>Mean hand correction (radians)</small><strong>{ikQuality.frames ? ikQuality.correctionMean.toFixed(3) : "—"}</strong></div>
    </div>
    {ikQuality.recommendations.length ? <ul>{ikQuality.recommendations.map(value => <li key={value}>{value}</li>)}</ul> : <p className="settings-note">Keine IK-Warnung in der letzten Messperiode. Heuristische Werte sind keine physikalische Kontaktmessung.</p>}
    <p className="settings-note">Auto-Tuning ist zunächst ein Vorschlagsmodus: vorhandene IK-Profile und GLB-Animationen werden nicht verändert. Bei mehreren Avataren zeigt die Anzeige den zuletzt gemeldeten Tänzer.</p>
    <div className="audio-debug-heading"><strong>V158 – Adaptive Full-Body Motion Refinement</strong><span>{refinement.enabled ? "● ACTIVE" : "○ OFF"}</span></div>
    <label className="settings-note"><input type="checkbox" checked={refinement.enabled} onChange={e => setRefinementSettings({enabled:e.target.checked})} /> Optional: additive Körperbewegungen anhand der IK-Diagnose sanft reduzieren</label>
    <label className="settings-note">Anpassungsstärke: {Math.round(refinement.intensity*100)} % <input aria-label="Anpassungsstärke" type="range" min="0" max="100" step="5" value={Math.round(refinement.intensity*100)} onChange={e=>setRefinementSettings({intensity:Number(e.target.value)/100})} /></label>
    <p className="settings-note">Standardmäßig ausgeschaltet. Es werden nur additive Overlay-Kanäle gedämpft, nicht GLB-Clips, Fuß-/Hand-IK, Kontaktanker oder Gelenkkalibrierungen. Die Diagnosewerte sind heuristisch und bei Duo-Auftritten nicht pro Tänzer getrennt gespeichert.</p>
    <AdaptivePerformanceSettings />
    <LongRunStabilitySettingsV355 />
    <RaspberryPiEditionSettings />
    <p className="settings-note">Complex choreography and personality updates may be reused at lower quality; beat impulses, microphone analysis, and avatar pose interpolation still run every frame. FPS and frame interval are measured inside the 3D render loop, sampled approximately once per second. Beat age is the time since the last detected event, <strong>not</strong> measured audio or display latency. Browser rendering may be throttled in background tabs.</p>
  </section>;
}
