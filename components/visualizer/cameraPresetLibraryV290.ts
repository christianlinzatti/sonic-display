import type { StageSection } from "./stageDirectorV287";
import { stageCameraPoseV289, type CameraPose } from "./stageCameraPoseHelpersV289";

export const CAMERA_PRESET_KEY = "sonic-camera-presets-v290";
export const CAMERA_PRESET_EVENT = "sonic-camera-presets-v290-change";
export type CameraPreset = { id: string; name: string; pose: CameraPose };
export type CameraPresetLibrary = { enabled: boolean; presets: CameraPreset[]; assignments: Partial<Record<StageSection, string>> };
export const CAMERA_SECTIONS: StageSection[] = ["verse", "break", "build", "hook", "drop"];
export const EMPTY_CAMERA_PRESETS: CameraPresetLibrary = { enabled: false, presets: [], assignments: {} };
const clamp = (value: unknown, low: number, high: number, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(low, Math.min(high, value)) : fallback;
export function sanitizeCameraPose(value: unknown): CameraPose {
  const v = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  // Explicit defaults migrate V290-V303 localStorage presets and keyframes in memory.
  // Negative Z and wider X allow a full rear-side orbit; look-at target is independently persisted.
  return { x: clamp(v.x, -20, 20, 0), y: clamp(v.y, -12, 12, .1), z: clamp(v.z, -20, 20, 4.2),
    targetX: clamp(v.targetX, -12, 12, 0), targetY: clamp(v.targetY, -6, 8, 0),
    targetZ: clamp(v.targetZ, -12, 12, 0), fov: clamp(v.fov, 18, 85, 38) };
}
export function normalizeCameraPresets(raw: unknown): CameraPresetLibrary {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return EMPTY_CAMERA_PRESETS;
  const obj = raw as Record<string, unknown>;
  const presets: CameraPreset[] = [];
  const seen = new Set<string>();
  for (const item of (Array.isArray(obj.presets) ? obj.presets : []).slice(0, 80)) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const entry = item as Record<string, unknown>;
    if (typeof entry.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(entry.id) || seen.has(entry.id)) continue;
    seen.add(entry.id);
    presets.push({ id: entry.id, name: typeof entry.name === "string" ? entry.name.trim().slice(0, 60) || "Kamera" : "Kamera", pose: sanitizeCameraPose(entry.pose) });
  }
  const assignments: Partial<Record<StageSection, string>> = {};
  const input = obj.assignments && typeof obj.assignments === "object" && !Array.isArray(obj.assignments) ? obj.assignments as Record<string,unknown> : {};
  for (const section of CAMERA_SECTIONS) {
    const id = input[section];
    if (typeof id === "string" && seen.has(id)) assignments[section] = id;
  }
  return { enabled: obj.enabled === true, presets, assignments };
}
export function readCameraPresets(): CameraPresetLibrary {
  if (typeof window === "undefined") return EMPTY_CAMERA_PRESETS;
  try { return normalizeCameraPresets(JSON.parse(window.localStorage.getItem(CAMERA_PRESET_KEY) ?? "null")); }
  catch { return EMPTY_CAMERA_PRESETS; }
}
export function writeCameraPresets(value: CameraPresetLibrary): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(CAMERA_PRESET_KEY, JSON.stringify(normalizeCameraPresets(value))); } catch { /* storage disabled */ }
  window.dispatchEvent(new Event(CAMERA_PRESET_EVENT));
}
export function resolveCameraPose(library: CameraPresetLibrary, section: StageSection, progressMs: number, intensity: number, duo: boolean): CameraPose {
  const fallback = stageCameraPoseV289(section, progressMs, intensity, duo);
  if (!library.enabled) return fallback;
  const preset = library.presets.find(p => p.id === library.assignments[section]);
  if (!preset) return fallback;
  // Custom poses are absolute camera positions and are not scaled by automatic intensity.
  return preset.pose;
}
