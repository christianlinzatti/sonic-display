"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";

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
export function AdaptivePerformanceController() {
  const setDpr = useThree(state => state.setDpr);
  const mode = useAdaptivePerformance().mode;
  const sampler = useRef({ elapsed: 0, frames: 0, slow: 0, poorWindows: 0, goodWindows: 0, cooldown: 0 });
  const tier = useRef<QualityState["tier"]>("high");
  const deviceDpr = useRef(1);
  useEffect(() => {
    deviceDpr.current = typeof window === "undefined" ? 1 : Math.max(0.5, window.devicePixelRatio || 1);
    try {
      const saved = window.localStorage.getItem("sonic-performance-mode");
      if (saved === "auto" || saved === "high" || saved === "balanced" || saved === "low") setPerformanceMode(saved);
    } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => {
    sampler.current.poorWindows = 0; sampler.current.goodWindows = 0;
    tier.current = mode === "auto" ? "high" : mode;
    const dpr = dprFor(tier.current, deviceDpr.current);
    setDpr(dpr);
    update({ mode, tier: tier.current, dpr, reason: mode === "auto" ? "Monitoring frame rate" : "Manual quality" });
  }, [mode, setDpr]);
  useFrame((_state, delta) => {
    if (!Number.isFinite(delta) || delta <= 0 || delta > 0.25) return;
    const s = sampler.current;
    s.elapsed += delta; s.frames++;
    if (delta > 1 / 30) s.slow++;
    if (s.elapsed < 1) return;
    const fps = s.frames / s.elapsed;
    const slowRatio = s.slow / s.frames;
    s.elapsed = 0; s.frames = 0; s.slow = 0;
    if (mode !== "auto") return;
    s.cooldown = Math.max(0, s.cooldown - 1);
    const poor = fps < 42 || slowRatio > 0.3;
    const good = fps > 56 && slowRatio < 0.08;
    s.poorWindows = poor ? s.poorWindows + 1 : 0;
    s.goodWindows = good ? s.goodWindows + 1 : 0;
    if (s.cooldown > 0) return;
    const old = tier.current;
    if (s.poorWindows >= 3) {
      tier.current = old === "high" ? "balanced" : "low";
    } else if (s.goodWindows >= 12) {
      tier.current = old === "low" ? "balanced" : "high";
    }
    if (old !== tier.current) {
      s.cooldown = 8; s.poorWindows = 0; s.goodWindows = 0;
      const dpr = dprFor(tier.current, deviceDpr.current);
      setDpr(dpr);
      update({ mode, tier: tier.current, dpr, reason: poor ? "Sustained slow frames" : "Stable frame rate" });
    }
  });
  return null;
}
export function AdaptivePerformanceSettings() {
  const { mode, tier, dpr, reason } = useAdaptivePerformance();
  return <div className="settings-field">
    <label htmlFor="performance-mode">3D render quality</label>
    <select id="performance-mode" value={mode} onChange={event => setPerformanceMode(event.target.value as QualityMode)}>
      <option value="auto">Auto (adaptive)</option>
      <option value="high">High</option>
      <option value="balanced">Balanced</option>
      <option value="low">Low</option>
    </select>
    <p className="settings-note">Active: {tier} · pixel ratio {dpr.toFixed(2)} · {reason}. Auto lowers resolution after sustained slow frames and raises it only after a longer stable period. This does not change dance timing or microphone analysis.</p>
  </div>;
}
