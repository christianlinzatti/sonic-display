import type { StageSection } from "./stageDirectorV287";
import type { CameraPose } from "./stageCameraPoseHelpersV289";
import type { CameraPresetLibrary } from "./cameraPresetLibraryV290";
import { cameraPoseAtTime, type CameraKeyframe } from "./cameraKeyframesV295";
import { cinematicCameraPoseAtTime, type CameraPathSettings } from "./cinematicCameraPathsV305";

export const LIVE_CAMERA_KEYFRAMES_KEY = "sonic-live-camera-keyframes-v296";
export const LIVE_CAMERA_KEYFRAMES_EVENT = "sonic-live-camera-keyframes-v296-change";
export function readLiveCameraKeyframesEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(LIVE_CAMERA_KEYFRAMES_KEY) === "true"; }
  catch { return false; }
}
export function writeLiveCameraKeyframesEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LIVE_CAMERA_KEYFRAMES_KEY, String(enabled)); }
  catch { /* storage can be disabled */ }
  window.dispatchEvent(new Event(LIVE_CAMERA_KEYFRAMES_EVENT));
}
/** Resolve the assigned camera's motion-timeline frames against playback time.
 * A clip loops at its final keyframe. No assignment or frames: use V289/V290.
 * Pause, seek and song changes are deterministic because there is no wall clock.
 */
export function resolveLiveCameraKeyframePose(
  library: CameraPresetLibrary, section: StageSection, progressMs: number,
  enabled: boolean, keyframes: Record<string, CameraKeyframe[]>, paths?: Record<string, CameraPathSettings>
): CameraPose | null {
  if (!enabled || !library.enabled || !Number.isFinite(progressMs)) return null;
  const id = library.assignments[section];
  if (!id || !library.presets.some(p => p.id === id)) return null;
  const frames = keyframes[id] ?? [];
  if (!frames.length) return null;
  const last = frames[frames.length - 1]?.time ?? 0;
  const elapsed = Math.max(0, progressMs / 1000);
  const position = last > 0 && frames.length > 1 ? elapsed % last : elapsed;
  const cinematic = paths?.[id];
  if (cinematic?.enabled) return cinematicCameraPoseAtTime(frames, elapsed, cinematic);
  return cameraPoseAtTime(frames, position);
}
