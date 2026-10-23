"use client";
import { useSyncExternalStore } from "react";
import type { UnifiedMotion } from "./unifiedDanceEngine";
import type { IKQualitySnapshot } from "./ikMotionAnalyzer";

/** V158 is opt-in. No persistent changes to calibrated bones or authored clips. */
export type RefinementSettings = { enabled: boolean; intensity: number };
export const DEFAULT_REFINEMENT: RefinementSettings = { enabled: false, intensity: 0.5 };
const KEY = "sonic-display:v158:motion-refinement";
const listeners = new Set<() => void>();
let settings: RefinementSettings = DEFAULT_REFINEMENT;
let hydrated = false;
const finite = (n: number, fallback = 0) => Number.isFinite(n) ? n : fallback;
const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, finite(n)));
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (saved && typeof saved.enabled === "boolean") settings = { enabled: saved.enabled, intensity: clamp(Number(saved.intensity ?? 0.5)) };
  } catch { /* unreadable settings safely fall back to off */ }
}
export function getRefinementSettings(): RefinementSettings { hydrate(); return settings; }
export function subscribeRefinementSettings(fn: () => void) { listeners.add(fn); return () => {listeners.delete(fn)}; }
export function setRefinementSettings(update: Partial<RefinementSettings>) {
  const old = getRefinementSettings();
  settings = {enabled: typeof update.enabled === "boolean" ? update.enabled : old.enabled,
    intensity: clamp(update.intensity ?? old.intensity)};
  if (typeof window !== "undefined") try {window.localStorage.setItem(KEY, JSON.stringify(settings))} catch { /* private mode */ }
  for (const fn of listeners) fn();
}
export function useRefinementSettings() {return useSyncExternalStore(subscribeRefinementSettings, getRefinementSettings, () => DEFAULT_REFINEMENT);}
export type RefinementState = { factor: number; previous: Record<string, number> };
export const createRefinementState = (): RefinementState => ({factor: 1, previous: {}});
/** Diagnostic-driven *additive* overlays only. The mixer, IK solvers and bone bind poses are untouched.
 * Missing or other-dancer samples produce a neutral factor; adjustments are bounded and eased.
 */
export function refineFullBodyMotion<T extends UnifiedMotion>(state: RefinementState, motion: T,
  context: {dt:number; active:boolean; dancer:string; quality:IKQualitySnapshot; settings:RefinementSettings}): T {
  const dt = clamp(context.dt, 0, .1);
  const valid = context.quality.frames > 0 && context.quality.dancer === context.dancer;
  const slide = valid && context.quality.plantedFrames ? clamp(context.quality.slideMean / .12) : 0;
  const correction = valid ? clamp(context.quality.correctionMean / .65) : 0;
  const hand = valid && context.quality.handErrorMean !== null ? clamp(context.quality.handErrorMean / .5) : 0;
  const risk = clamp(slide * .48 + correction * .34 + hand * .18);
  const target = context.settings.enabled && context.active ? 1 - clamp(context.settings.intensity) * .45 * risk : 1;
  const alpha = context.active && dt > 0 ? 1-Math.exp(-6*dt) : 1;
  state.factor = clamp(state.factor + (target-state.factor)*alpha, .55, 1);
  const result: Record<string,number> = {};
  const dampingChannels = new Set(["armSwing","legGroove","footStep","weightShift","hipSway","shoulderRoll","spineSway","followThrough"]);
  for (const [key, value] of Object.entries(motion)) {
    const safe = finite(value);
    result[key] = dampingChannels.has(key) ? safe * state.factor : safe;
  }
  state.previous = result;
  return result as T;
}
