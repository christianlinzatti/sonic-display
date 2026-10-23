"use client";
import { useSyncExternalStore } from "react";

export type RenderMetrics = {
  fps: number; frameMs: number; p95FrameMs?: number; slowPercent: number; drawCalls: number;
  triangles: number; geometries: number; textures: number;
  renderer: string; webgl: string; samples: number; avatarCount?: number; updatedAt: number;
};
const empty: RenderMetrics = { fps: 0, frameMs: 0, slowPercent: 0, drawCalls: 0, triangles: 0, geometries: 0, textures: 0, renderer: "Unbekannt", webgl: "Unbekannt", samples: 0, updatedAt: 0 };
let snapshot = empty;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function useRenderDiagnostics() { return useSyncExternalStore(subscribe, () => snapshot, () => empty); }
export function publishRenderMetrics(value: RenderMetrics) {
  snapshot = value;
  for (const listener of listeners) listener();
}

/** Non-hook snapshot reader for low-frequency long-session sampling. */
export function getRenderMetricsSnapshot(): RenderMetrics { return snapshot; }
