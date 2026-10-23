"use client";
import { useSyncExternalStore } from "react";
export type ProfilerPhase = "motion" | "rigging" | "handIK" | "footIK" | "formation" | "choreography";
export type PhaseReport = { name: ProfilerPhase; meanMs: number; p95Ms: number; calls: number; maxMs: number };
export type ProfilerSnapshot = { phases: PhaseReport[]; totalMainMs: number; bottleneck: string; explanation: string; updatedAt: number };
const empty: ProfilerSnapshot = { phases: [], totalMainMs: 0, bottleneck: "Noch keine Messungen", explanation: "Avatar-Szene aktivieren", updatedAt: 0 };
let snapshot = empty;
const listeners = new Set<() => void>();
const samples = new Map<ProfilerPhase, number[]>();
let reportAt = 0;
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function useRuntimeProfiler() { return useSyncExternalStore(subscribe, () => snapshot, () => empty); }
export function getRuntimeProfilerSnapshot() { return snapshot; }
/** Measures synchronous JavaScript work only, not GPU execution or async worker time. */
export function measureProfilerPhase<T>(phase: ProfilerPhase, work: () => T): T {
  if (typeof performance === "undefined") return work();
  const start = performance.now();
  try { return work(); } finally { recordProfilerDuration(phase, performance.now() - start, start); }
}
export function recordProfilerDuration(phase: ProfilerPhase, durationMs: number, nowMs: number) {
  if (!Number.isFinite(durationMs) || durationMs < 0 || durationMs > 1000) return;
  const queue = samples.get(phase) ?? [];
  if (queue.length >= 120) queue.shift();
  queue.push(durationMs);
  samples.set(phase, queue);
  if (nowMs - reportAt >= 1000) { reportAt = nowMs; publishProfilerSnapshot(); }
}
function publishProfilerSnapshot() {
  const phases: PhaseReport[] = Array.from(samples, ([name, values]) => {
    const ordered = [...values].sort((a,b) => a-b);
    return {name, meanMs: values.reduce((a,b) => a+b, 0)/values.length,
      p95Ms: ordered[Math.max(0,Math.ceil(ordered.length*.95)-1)] ?? 0,
      calls: values.length, maxMs: ordered[ordered.length-1] ?? 0};
  }).sort((a,b) => b.p95Ms-a.p95Ms);
  const dominant = phases[0];
  snapshot = { phases, totalMainMs: phases.reduce((total,p)=>total+p.meanMs,0),
    bottleneck: dominant?.p95Ms > 2 ? dominant.name : "Kein auffälliger CPU-Engpass",
    explanation: dominant?.p95Ms > 2 ? `${dominant.name}: P95 ${dominant.p95Ms.toFixed(1)} ms CPU-Zeit (heuristisch)` : "Keine stark belastete instrumentierte Phase",
    updatedAt: Date.now() };
  for (const listener of listeners) listener();
}
export function resetRuntimeProfiler() { samples.clear(); reportAt = 0; snapshot = empty; for (const listener of listeners) listener(); }
