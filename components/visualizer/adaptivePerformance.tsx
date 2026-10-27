"use client";
import { useEffect, useRef, useSyncExternalStore, useState } from "react";
import {useDisplayProfileV388} from "../DisplayPerformanceV388";
import {samplePiConcertV479,readPiConcertBudgetV479,usePiConcertBudgetV479} from "./piConcertRuntimeV479";
import {planPiConcertVisualQualityV602,capPiConcertDprV602} from "./piConcertOptimizationV602";
import {recordPiStudioV518} from "./piConcertPerformanceRuntimeV518";
import {limitDisplayDprV388,resolveDisplayBudgetV388} from "./displayPerformancePolicyV388";
import { useFrame, useThree } from "@react-three/fiber";
import { publishRenderMetrics } from "./renderDiagnostics";
import {isPiQualityTransitionV463} from "@/services/monitoring/piSessionStabilityV463";
import {useStabilityCapV355,useStabilityDeviceV355,useStabilitySettingsV355,stabilityDprCapV355} from "@/services/monitoring/performanceStabilityV355";
import { currentDeviceFingerprint } from "./deviceCalibrationProfiles";
import { capCalibratedTier, chooseDeviceRenderTier, readDeviceRenderCalibration, writeDeviceRenderCalibration, clearDeviceRenderCalibration, type CalibrationSample, type CalibratedTier } from "./deviceRenderCalibrationV254";
import { advanceRenderBudget, initialRenderBudget, limitDpr, renderPressure } from "./gpuRenderBudgetV253";
import { initialPerformanceDecision, advancePerformanceDecision } from "./performancePolicy";
import { useAudioWorkerTelemetry } from "./audioWorkerTelemetry";
import { recordQualityDecision } from "./qualityDecisionHistoryV255";

type QualityMode = "auto" | "high" | "balanced" | "low";
type QualityState = { mode: QualityMode; tier: "high" | "balanced" | "low"; dpr: number; reason: string };
const defaults: QualityState = { mode: "auto", tier: "high", dpr: 1.5, reason: "Waiting for frame samples" };
let current = defaults;
const listeners = new Set<() => void>();
function notify() { for (const listener of listeners) listener(); }
function update(next: QualityState) {
  if (current.mode === next.mode && current.tier === next.tier && current.dpr === next.dpr && current.reason === next.reason) return;
  current = next; notify();
}
/** Read the active quality tier from a render-loop callback without React rerenders. */
export function getActivePerformanceTier(): QualityState["tier"] { return current.tier; }
export function useAdaptivePerformance() {
  return useSyncExternalStore(subscribe, () => current, () => defaults);
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function setPerformanceMode(mode: QualityMode) {
  if (!(["auto", "high", "balanced", "low"] as string[]).includes(mode)) return;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem("sonic-performance-mode", mode); } catch { /* storage unavailable */ }
  }
  update({ ...current, mode, reason: "Mode changed" });
}
const dprFor = (tier: QualityState["tier"], deviceDpr: number) => Math.min(deviceDpr, tier === "high" ? 1.5 : tier === "balanced" ? 1.15 : 0.8);
/** Adaptive resolution controller. Hysteresis and a cooldown prevent oscillation. */
export function AdaptivePerformanceController({avatarCount=1,playing=true}:{avatarCount?:number;playing?:boolean}) {
  const setDpr = useThree(state => state.setDpr);
  const gl = useThree(state => state.gl);
  const gpuDescription = useRef<{renderer: string; webgl: string}>({renderer: "Nicht verfügbar", webgl: "Nicht verfügbar"});
  const diagnostic = useRef({elapsed: 0, frames: 0, slow: 0, frameSeconds: 0, durations: [] as number[]});
  const mode = useAdaptivePerformance().mode;
  const piBudgetV602=usePiConcertBudgetV479();
  const displayV388 = useDisplayProfileV388();
  const [displayDeviceV388,setDisplayDeviceV388]=useState({width:1600,height:900,pixelRatio:1,cores:8,memoryGb:8,saveData:false});
  useEffect(()=>{
    const read=()=>{const nav=navigator as Navigator & {deviceMemory?:number;connection?:{saveData?:boolean}};
      setDisplayDeviceV388({width:window.innerWidth,height:window.innerHeight,pixelRatio:window.devicePixelRatio||1,
        cores:nav.hardwareConcurrency||8,memoryGb:nav.deviceMemory??8,saveData:nav.connection?.saveData??false});};
    read();window.addEventListener("resize",read,{passive:true});return()=>window.removeEventListener("resize",read);
  },[]);
  const displayBudgetV388=resolveDisplayBudgetV388(displayV388.profile,displayV388.kioskEnabled,{...displayDeviceV388,avatarCount});
  const stabilityCapV355=useStabilityCapV355();
  const stabilityDeviceV355=useStabilityDeviceV355();
  const stabilitySettingsV355=useStabilitySettingsV355();
  const decision = useRef(initialPerformanceDecision());
  const renderBudget = useRef(initialRenderBudget());
  const tier = useRef<QualityState["tier"]>("high");
  const deviceDpr = useRef(1);
  const deviceFingerprint = useRef("");
  const deviceCap = useRef<CalibratedTier>("high");
  const calibrationSamples = useRef<CalibrationSample[]>([]);
  const calibrated = useRef(false);
  useEffect(() => {
    try {
      const ctx = gl.getContext();
      const info = ctx.getExtension("WEBGL_debug_renderer_info");
      const renderer = info ? String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "Vom Browser verborgen";
      gpuDescription.current = {renderer, webgl: String(ctx.getParameter(ctx.VERSION))};
    } catch { /* WebGL information may be unavailable */ }
  }, [gl]);
  useEffect(() => {
    deviceDpr.current = typeof window === "undefined" ? 1 : Math.max(0.5, window.devicePixelRatio || 1);
    deviceFingerprint.current = currentDeviceFingerprint();
    const profile = readDeviceRenderCalibration(deviceFingerprint.current);
    if (profile) { deviceCap.current = profile.tier; calibrated.current = true; }
    try {
      const saved = window.localStorage.getItem("sonic-performance-mode");
      if (saved === "auto" || saved === "high" || saved === "balanced" || saved === "low") setPerformanceMode(saved);
    } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => {
    const clearFrameWindow=()=>{diagnostic.current={elapsed:0,frames:0,slow:0,frameSeconds:0,durations:[]};};
    document.addEventListener("visibilitychange",clearFrameWindow);
    const resetPi=()=>{if(document.hidden)samplePiConcertV479({at:Date.now(),fps:NaN,p95FrameMs:NaN,avatarCount,playing,visible:false});};
    document.addEventListener("visibilitychange",resetPi);
    return ()=>{document.removeEventListener("visibilitychange",clearFrameWindow);document.removeEventListener("visibilitychange",resetPi);};
  },[avatarCount,playing]);
  useEffect(() => {
    deviceDpr.current=Math.max(.5,displayDeviceV388.pixelRatio||1);
  },[displayDeviceV388.pixelRatio]);
  useEffect(() => {
    decision.current = initialPerformanceDecision(mode === "auto" ? "high" : mode);
    renderBudget.current = initialRenderBudget();
    tier.current = mode === "auto" ? deviceCap.current : mode;
    const requestedDprV602=limitDisplayDprV388(dprFor(tier.current, deviceDpr.current),displayBudgetV388);
    const dpr=capPiConcertDprV602(requestedDprV602,planPiConcertVisualQualityV602({budget:readPiConcertBudgetV479(),avatarCount,autoQuality:mode==='auto',manualLighting:false,reactive:true}),mode==='auto');
    setDpr(dpr);
    update({ mode, tier: tier.current, dpr, reason: mode !== "auto" ? "Manual quality" : dpr<requestedDprV602 ? "V602 Pi concert quality budget" : "Monitoring frame rate" });
  }, [mode, setDpr]);
  // V355 only caps the existing DPR policy. A protection-level change must not reset
  // V253/254 calibration, render workload history, or manual quality settings.
  useEffect(() => {
    // V388 profile changes adjust the cap immediately without resetting the adaptive frame history.
    const baseline = mode === "auto" ? limitDpr(dprFor(tier.current, deviceDpr.current),renderBudget.current.tier) : dprFor(tier.current,deviceDpr.current);
    const stableDpr = (mode === "auto" && stabilitySettingsV355.enabled) ? Math.min(baseline,stabilityDprCapV355(stabilityCapV355,stabilityDeviceV355)) : baseline;
    const requestedDprV602=limitDisplayDprV388(stableDpr,displayBudgetV388);
    const dpr=capPiConcertDprV602(requestedDprV602,planPiConcertVisualQualityV602({budget:readPiConcertBudgetV479(),avatarCount,autoQuality:mode==='auto',manualLighting:false,reactive:true}),mode==='auto');
    setDpr(dpr);
    update({...current,dpr,reason:dpr<requestedDprV602?"V602 Pi concert quality budget":dpr<stableDpr?displayBudgetV388.reason:dpr<baseline?"V355 long-session render guard":current.reason});
  }, [mode,setDpr,stabilityCapV355,stabilityDeviceV355,stabilitySettingsV355.enabled,displayBudgetV388.dprCap,displayBudgetV388.enabled,displayDeviceV388.pixelRatio,piBudgetV602.level,piBudgetV602.enabled,avatarCount]);
  useFrame((_state, delta) => {
    // V218: one sample window feeds both diagnostics and the adaptive DPR policy.
    // Exclude long suspended-tab frames so returning to the page cannot force low quality.
    if (typeof document !== "undefined" && document.hidden) return; // V403: background frames cannot trigger downshifts.
    if (!Number.isFinite(delta) || delta <= 0 || delta >= 0.25) return;
    const d = diagnostic.current;
    d.elapsed += delta;
    d.frameSeconds += delta;
    d.frames++;
    d.durations.push(delta * 1000);
    if (delta > 1 / 30) d.slow++;
    if (d.elapsed < 1) return;

    const elapsed = d.elapsed;
    const fps = d.frames / elapsed;
    const slowRatio = d.slow / d.frames;
    const sorted = d.durations.sort((a, b) => a - b);
    const p95FrameMs = sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] ?? 0;
    // V522: measured window P99 from these SAME frame durations (not synthetic or global P99).
    const p99FrameMsV522 = sorted[Math.max(0, Math.ceil(sorted.length * 0.99) - 1)] ?? 0;
    const info = gl.info;
    const nowV518=Date.now();
    publishRenderMetrics({
      fps, frameMs: (d.frameSeconds / d.frames) * 1000, p95FrameMs,
      slowPercent: 100 * slowRatio,
      drawCalls: info.render.calls, triangles: info.render.triangles,
      geometries: info.memory.geometries, textures: info.memory.textures,
      renderer: gpuDescription.current.renderer, webgl: gpuDescription.current.webgl,
      samples: d.frames, avatarCount, updatedAt: nowV518,
    });
    d.elapsed = 0; d.frameSeconds = 0; d.frames = 0; d.slow = 0; d.durations = [];
    // V479 consumes the same once-per-second frame window (no duplicate RAF or GPU timer).
    samplePiConcertV479({at:nowV518,fps,p95FrameMs,avatarCount,playing,visible:true});
    // V518: reuse this exact render window; Chromium JS heap is optional, never device RAM.
    const heapValueV518=(typeof performance!=='undefined' ? (performance as Performance & {memory?:{usedJSHeapSize?:number}}).memory?.usedJSHeapSize : undefined);
    const heapMbV518=typeof heapValueV518==='number'&&Number.isFinite(heapValueV518)&&heapValueV518>=0?heapValueV518/1048576:null;
    const piV518=readPiConcertBudgetV479();
    recordPiStudioV518({at:nowV518,fps,p95FrameMs,p99FrameMs:p99FrameMsV522,
      geometries:info.memory.geometries,textures:info.memory.textures,slowPercent:100*slowRatio,
      drawCalls:info.render.calls,triangles:info.render.triangles,avatarCount,tier:current.tier,
      dpr:current.dpr,piProfile:piV518.profile,piLevel:piV518.level,heapMb:heapMbV518},playing,true);

    if (mode !== "auto" || isPiQualityTransitionV463(Date.now())) return;
    // V254: passive calibration from real scene load. Collect once, then reuse the
    // validated device-scoped profile for 14 days. Manual modes never get capped.
    if (!calibrated.current && info.render.calls > 0 && info.render.triangles > 0) {
      calibrationSamples.current.push({fps, slowRatio, p95FrameMs, calls: info.render.calls, triangles: info.render.triangles});
      if (calibrationSamples.current.length >= 10) {
        const recommended = chooseDeviceRenderTier(calibrationSamples.current);
        if (recommended) {
          deviceCap.current = recommended;
          writeDeviceRenderCalibration(deviceFingerprint.current, recommended, calibrationSamples.current);
          calibrated.current = true;
          calibrationSamples.current = [];
        }
      }
    }
    // GPU cost cannot be measured reliably without timestamp-query support; draw calls
    // and triangle counts are low-overhead proxies, combined with sustained frame drops.
    // Never touch beat transport or the animation clock.
    const oldTier = tier.current;
    const oldBudget = renderBudget.current.tier;
    decision.current = advancePerformanceDecision(decision.current, { fps, slowRatio, elapsed, p95FrameMs });
    const workloadHigh = renderPressure(info.render.calls, info.render.triangles);
    renderBudget.current = advanceRenderBudget(renderBudget.current, workloadHigh && (fps < 57 || slowRatio > 0.12));
    const baseTier = decision.current.tier;
    const rank = { low: 0, balanced: 1, high: 2 } as const;
    const budgetTier = rank[baseTier] < rank[renderBudget.current.tier] ? baseTier : renderBudget.current.tier;
    tier.current = capCalibratedTier(budgetTier, deviceCap.current);
    if (tier.current !== oldTier) {
      const reason = renderBudget.current.tier !== "high" ? "Render workload budget" : tier.current !== budgetTier
        ? "Device calibration cap" : fps < 42 || slowRatio > 0.3 ? "Sustained slow frames" : "Stable frame rate";
      recordQualityDecision({ at: Date.now(), from: oldTier, to: tier.current, reason,
        fps, p95FrameMs, slowPercent: slowRatio * 100, drawCalls: info.render.calls,
        triangles: info.render.triangles, deviceCap: deviceCap.current });
    }
    if (tier.current !== oldTier || renderBudget.current.tier !== oldBudget) {
      const baseDpr = limitDpr(dprFor(tier.current, deviceDpr.current), renderBudget.current.tier);
      const stableDpr = (mode === "auto" && stabilitySettingsV355.enabled) ? Math.min(baseDpr,stabilityDprCapV355(stabilityCapV355,stabilityDeviceV355)) : baseDpr;
      const requestedDprV602=limitDisplayDprV388(stableDpr,displayBudgetV388);
      const dpr=capPiConcertDprV602(requestedDprV602,planPiConcertVisualQualityV602({budget:readPiConcertBudgetV479(),avatarCount,autoQuality:mode==='auto',manualLighting:false,reactive:true}),mode==='auto');
      setDpr(dpr);
      update({ mode, tier: tier.current, dpr, reason: dpr<requestedDprV602 ? "V602 Pi concert quality budget" : renderBudget.current.tier !== "high"
        ? "Render workload budget (draw calls / triangles)" : tier.current !== budgetTier ? "Device calibration cap" : fps < 42 || slowRatio > 0.3 ? "Sustained slow frames" : "Stable frame rate" });
    }
  });
  return null;
}
export function AdaptivePerformanceSettings() {
  const { mode, tier, dpr, reason } = useAdaptivePerformance();
  const audio = useAudioWorkerTelemetry();
  return <div className="settings-field">
    <label htmlFor="performance-mode">3D render quality</label>
    <select id="performance-mode" value={mode} onChange={event => setPerformanceMode(event.target.value as QualityMode)}>
      <option value="auto">Auto (adaptive)</option>
      <option value="high">High</option>
      <option value="balanced">Balanced</option>
      <option value="low">Low</option>
    </select>
    <p className="settings-note">Audio Worker: {audio.mode} · Last response {audio.latencyMs.toFixed(1)} ms · P95 {audio.p95Ms.toFixed(1)} ms ({audio.samples} samples).</p>
    <p className="settings-note">V254: Automatic quality calibrates against the real scene and remembers a device-specific cap for up to 14 days. Manual modes bypass the cap. <button type="button" onClick={() => { clearDeviceRenderCalibration(); window.location.reload(); }}>Recalibrate device</button></p>
    <p className="settings-note">Active: {tier} · pixel ratio {dpr.toFixed(2)} · {reason}. Auto lowers resolution after sustained slow frames and raises it only after a longer stable period. This does not change dance timing or microphone analysis.</p>
    <p className="settings-note">V552: invisible light shafts/haze do not consume transparent GPU draw calls; inactive dance effects stop updating their mesh pool. Existing Pi concert presets and measured FPS/P95/P99 still control adaptive quality. No changes to lyric, lip-sync, camera or dance timing.</p>
  </div>;
}
