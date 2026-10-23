/** V227: ephemeral and explicit scene-detail overrides, never persisted implicitly. */
import { useSyncExternalStore } from "react";
export type SceneDetail = "full" | "no-pulse" | "no-rings" | "minimal-lights";
let detail: SceneDetail = "full";
const listeners = new Set<() => void>();
export function getSceneDetail(): SceneDetail { return detail; }
export function setSceneDetail(value: SceneDetail) {
  if (detail === value) return;
  detail = value;
  listeners.forEach(fn => fn());
}
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function useSceneDetail() { return useSyncExternalStore(subscribe, getSceneDetail, () => "full" as SceneDetail); }
export function sceneDetailFlags(value: SceneDetail) {
  return { pulse: value === "full", rings: value === "full" || value === "no-pulse", extraLights: value !== "minimal-lights", beamSweep: value === "full" || value === "no-pulse" };
}
