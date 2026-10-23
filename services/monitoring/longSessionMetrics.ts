"use client";
import {recordAnalysisSample,resetAnalysisSamples} from "./performanceSessionAnalyzerV262";
/** V250: bounded, local-only 5-second telemetry. No network, persistence or per-frame work. */
export type SessionSample = { at: number; elapsedSeconds: number; fps: number | null; p95FrameMs: number | null; slowPercent: number | null; heapMiB: number | null; drawCalls: number | null; avatars: number | null };
export type SessionSummary = { active: boolean; durationSeconds: number; samples: number; fpsAverage: number | null; fpsP10: number | null; slowAverage: number | null; heapLatestMiB: number | null; heapDeltaMiB: number | null; heapGrowthMiBPerHour: number | null; latest: SessionSample | null };
export const SESSION_METRICS_EVENT = "sonic:long-session-metrics";
export const MAX_SESSION_SAMPLES = 720; // up to one hour sampled every 5s
let samples: SessionSample[] = [];
let active = false;
let accumulatedMs = 0;
let startedAt: number | null = null;
const emit = () => { if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_METRICS_EVENT)); };
export function startSession(at = Date.now()) { if (!active) { active = true; startedAt = at; emit(); } }
export function pauseSession(at = Date.now()) { if (active) { accumulatedMs += Math.max(0, at - (startedAt ?? at)); active = false; startedAt = null; emit(); } }
export function resetSession() { resetAnalysisSamples(); samples = []; accumulatedMs = 0; startedAt = active ? Date.now() : null; emit(); }
export function recordSessionSample(sample: Omit<SessionSample,"elapsedSeconds">) {
  if (!active) return;
  const elapsedSeconds = (accumulatedMs + Math.max(0, sample.at - (startedAt ?? sample.at))) / 1000;
  samples.push({...sample, elapsedSeconds});
  if (samples.length > MAX_SESSION_SAMPLES) samples.splice(0, samples.length - MAX_SESSION_SAMPLES);
  recordAnalysisSample(samples[samples.length - 1]);
  emit();
}
export function getSessionSamples() { return samples.slice(); }
const avg = (values: number[]) => values.length ? values.reduce((a,b)=>a+b,0)/values.length : null;
export function getSessionSummary(now = Date.now()): SessionSummary {
  const fps = samples.flatMap(s=> s.fps === null ? [] : [s.fps]).sort((a,b)=>a-b);
  const slow = samples.flatMap(s=>s.slowPercent === null ? [] : [s.slowPercent]);
  const heap = samples.filter(s=>s.heapMiB !== null);
  const first = heap[0], last = heap[heap.length-1];
  const spanHours = first && last ? (last.at - first.at) / 3_600_000 : 0;
  const heapDelta = first && last ? last.heapMiB! - first.heapMiB! : null;
  return { active, durationSeconds:(accumulatedMs+(active ? Math.max(0, now-(startedAt ?? now)):0))/1000,
    samples:samples.length, fpsAverage:avg(fps), fpsP10:fps.length ? fps[Math.floor((fps.length-1)*0.1)] : null,
    slowAverage:avg(slow), heapLatestMiB:last?.heapMiB ?? null, heapDeltaMiB:heapDelta,
    heapGrowthMiBPerHour:spanHours >= 5/60 ? heapDelta! / spanHours : null, latest:samples[samples.length-1] ?? null };
}
