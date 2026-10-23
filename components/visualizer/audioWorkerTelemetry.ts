"use client";
import { useSyncExternalStore } from "react";
export type AudioWorkerTelemetry = { latencyMs: number; p95Ms: number; samples: number; lastAt: number; mode: "worker" | "fallback" | "off" };
const empty: AudioWorkerTelemetry = { latencyMs: 0, p95Ms: 0, samples: 0, lastAt: 0, mode: "off" };
let value = empty;
const listeners = new Set<() => void>();
const samples: number[] = [];
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export function useAudioWorkerTelemetry() { return useSyncExternalStore(subscribe, () => value, () => empty); }
export function publishAudioWorkerTelemetry(latency: number | null, mode: AudioWorkerTelemetry["mode"]) {
  if (latency !== null && Number.isFinite(latency) && latency >= 0 && latency < 10000) { samples.push(latency); if (samples.length > 120) samples.shift(); }
  const ordered = [...samples].sort((a,b) => a-b);
  value = { latencyMs: latency ?? value.latencyMs, p95Ms: ordered.length ? ordered[Math.ceil(ordered.length*.95)-1] : 0,
    samples: samples.length, lastAt: Date.now(), mode };
  for (const fn of listeners) fn();
}
