/** Lightweight read-only bridge from the R3F animation loop to the settings preview.
 * Publishing is throttled by the caller to avoid React rerenders on every animation frame.
 */
import { useSyncExternalStore } from "react";
import type { RhythmSequence } from "./rhythmAwareChoreography";

export interface DancePerformanceSnapshot {
  playing: boolean;
  sequence: RhythmSequence;
  move: string;
  section: string;
  rhythm: string;
  confidence: number;
  blend: number;
  beatsUntilSwitch: number | null;
  secondsUntilSwitch: number | null;
  source: "gltf" | "procedural";
}
const empty: DancePerformanceSnapshot = {
  playing: false, sequence: "baseline", move: "idle", section: "—", rhythm: "unknown",
  confidence: 0, blend: 1, beatsUntilSwitch: null, secondsUntilSwitch: null, source: "procedural",
};
let snapshot = empty;
const listeners = new Set<() => void>();
export function publishDancePerformance(next: DancePerformanceSnapshot) {
  snapshot = next;
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function getSnapshot() { return snapshot; }
export function useDancePerformance() {
  return useSyncExternalStore(subscribe, getSnapshot, () => empty);
}
/** Eight-beat boundaries are based on animation elapsed time and estimated BPM. */
export function nextPhraseBoundary(elapsed: number, bpm: number | null | undefined) {
  const tempo = Math.max(55, Math.min(220, bpm ?? 120));
  const beatPosition = Math.max(0, elapsed) * tempo / 60;
  const remaining = 8 - (beatPosition % 8);
  return { beatsUntilSwitch: Math.ceil(remaining), secondsUntilSwitch: remaining * 60 / tempo };
}
