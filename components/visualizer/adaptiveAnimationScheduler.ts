"use client";
import { getRuntimeProfilerSnapshot, type ProfilerSnapshot } from "./runtimeProfiler";

export type SchedulerTier = "normal" | "constrained" | "critical";
export type SchedulerTask = "director" | "formation" | "preview";
export type SchedulerDiagnostics = { tier: SchedulerTier; reason: string; timings: Record<SchedulerTask, number>; changedAt: number };
const PERIODS: Record<SchedulerTier, Record<SchedulerTask, number>> = {
  normal: { director: 2, formation: 0, preview: 0.15 },
  constrained: { director: 3, formation: 1 / 24, preview: 0.3 },
  critical: { director: 4, formation: 1 / 15, preview: 0.5 },
};
const lastRun = new Map<string, number>();
let tier: SchedulerTier = "normal";
let reason = "CPU-Phasen innerhalb des Budgets";
let changedAt = 0;
let evaluatedAt = -Infinity;
let healthyIntervals = 0;
let enabled = true;
const listeners = new Set<() => void>();
let published: SchedulerDiagnostics = { tier, reason, timings: PERIODS[tier], changedAt };
export const subscribeAnimationScheduler = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getAnimationSchedulerSnapshot = () => published;
const notify = () => { published = { tier, reason, timings: PERIODS[tier], changedAt }; listeners.forEach(listener => listener()); };
export function setAnimationSchedulerEnabled(value: boolean) {
  if (enabled === value) return;
  enabled = value;
  tier = "normal"; healthyIntervals = 0; evaluatedAt = -Infinity; lastRun.clear();
  reason = value ? "Adaptive CPU-Steuerung aktiviert" : "Adaptive CPU-Steuerung deaktiviert";
  changedAt = Date.now(); notify();
}
export function isAnimationSchedulerEnabled() { return enabled; }
/** Lightweight read for per-frame consumers; no React subscription. */
export function getAnimationSchedulerTier(): SchedulerTier { return enabled ? tier : "normal"; }
/** Returns the next tier without altering critical per-frame IK or animation mixer work. */
export function evaluateAnimationBudget(nowSeconds: number, profiler: ProfilerSnapshot = getRuntimeProfilerSnapshot()): SchedulerTier {
  if (!enabled || !Number.isFinite(nowSeconds)) return "normal";
  if (nowSeconds < evaluatedAt) { evaluatedAt = -Infinity; lastRun.clear(); }
  if (nowSeconds - evaluatedAt < 1) return tier;
  evaluatedAt = nowSeconds;
  // Ignore uninitialized or stale telemetry (updatedAt is in wall-clock milliseconds).
  if (!profiler.updatedAt || Date.now() - profiler.updatedAt > 6000 || !profiler.phases.length) return tier;
  const total = profiler.phases.reduce((sum, phase) => sum + (Number.isFinite(phase.p95Ms) ? Math.max(0, phase.p95Ms) : 0), 0);
  const desired: SchedulerTier = total >= 15 ? "critical" : total >= 8 ? "constrained" : "normal";
  const rank = { normal: 0, constrained: 1, critical: 2 };
  if (rank[desired] > rank[tier]) { tier = desired; healthyIntervals = 0; reason = `Instrumentierte CPU-P95-Summe: ${total.toFixed(1)} ms`; changedAt = Date.now(); notify(); }
  else if (rank[desired] < rank[tier]) {
    healthyIntervals++;
    if (healthyIntervals >= 5) { tier = rank[tier] === 2 ? "constrained" : "normal"; healthyIntervals = 0; reason = `CPU-Last normalisiert: ${total.toFixed(1)} ms`; changedAt = Date.now(); notify(); }
  } else healthyIntervals = 0;
  return tier;
}
/** Per-instance task id prevents dancers from interfering with one another. */
export function shouldRunScheduledTask(instance: string, task: SchedulerTask, nowSeconds: number, force = false): boolean {
  if (!Number.isFinite(nowSeconds)) return true;
  const key = `${instance}:${task}`;
  const previous = lastRun.get(key);
  const interval = PERIODS[enabled ? tier : "normal"][task];
  if (!force && previous !== undefined && nowSeconds >= previous && nowSeconds - previous < interval) return false;
  lastRun.set(key, nowSeconds);
  return true;
}
/** Release instance timestamps after an avatar is unmounted or its model changes. */
export function releaseScheduledInstance(instance: string) {
  for (const task of ["director", "formation", "preview"] as const) lastRun.delete(`${instance}:${task}`);
}
export function resetAnimationScheduler() { tier = "normal"; reason = "CPU-Phasen innerhalb des Budgets"; changedAt = 0; evaluatedAt = -Infinity; healthyIntervals = 0; lastRun.clear(); notify(); }
