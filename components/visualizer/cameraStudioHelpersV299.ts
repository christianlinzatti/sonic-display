import type { StageSection } from "./stageDirectorV287";
import type { CameraPose } from "./stageCameraPoseHelpersV289";

export type ManualCameraMode = "auto" | "wide" | "close" | "side";
export const CAMERA_STUDIO_MODE_KEY = "sonic-camera-studio-mode-v299";
export const CAMERA_STUDIO_MODE_EVENT = "sonic-camera-studio-mode-v299-change";
export const CAMERA_STUDIO_STATUS_EVENT = "sonic-camera-studio-status-v299";
export type CameraStudioStatus = { section: StageSection; mode: ManualCameraMode; playing: boolean; reducedMotion: boolean; intensity: number; source: string; composer: boolean; tracking: boolean; progressMs: number; camera: {x:number;y:number;z:number;fov:number;targetX?:number;targetY?:number;targetZ?:number} };
export function normalizeManualCameraMode(value: unknown): ManualCameraMode {
  return value === "wide" || value === "close" || value === "side" ? value : "auto";
}
export function readManualCameraMode(): ManualCameraMode {
  if(typeof window === "undefined") return "auto";
  try { return normalizeManualCameraMode(window.localStorage.getItem(CAMERA_STUDIO_MODE_KEY)); } catch { return "auto"; }
}
export function writeManualCameraMode(mode: ManualCameraMode): void {
  if(typeof window === "undefined") return;
  const safe=normalizeManualCameraMode(mode);
  try { window.localStorage.setItem(CAMERA_STUDIO_MODE_KEY,safe); } catch { /* storage disabled */ }
  window.dispatchEvent(new Event(CAMERA_STUDIO_MODE_EVENT));
}
/** Overrides cinematic composition, never the safety framing applied by avatar tracking. */
export function applyManualCameraMode(pose:CameraPose,mode:ManualCameraMode,duo:boolean):CameraPose {
  const p={...pose};
  if(mode === "wide") { p.z=Math.max(p.z,duo?8:6.5);p.fov=Math.max(p.fov,48);p.x*=.4; }
  if(mode === "close") {p.z=Math.max(duo?4.4:3.2,Math.min(p.z,duo?5.4:4));p.fov=Math.min(p.fov,36);}
  if(mode === "side") {p.x=duo?2.2:1.6;p.z=Math.max(p.z,duo?5.7:4.7);}
  return p;
}
