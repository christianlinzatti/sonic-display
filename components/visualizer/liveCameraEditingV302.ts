import type { CameraPose } from "./stageCameraPoseHelpersV289";
import { normalizeCameraPresets, sanitizeCameraPose, type CameraPresetLibrary } from "./cameraPresetLibraryV290";
import { normalizeCameraKeyframes, type CameraKeyframe } from "./cameraKeyframesV295";
import type { CameraStudioStatus } from "./cameraStudioHelpersV299";
import type { StageSection } from "./stageDirectorV287";

export const LIVE_CAMERA_EDIT_COMMAND_EVENT = "sonic-live-camera-edit-v302-command";
export type LiveCameraEditCommand = { kind:"pose"; pose:CameraPose } | { kind:"stop" };

/** Explicit, temporary manual edits. No settings are changed until the user saves. */
export function publishLiveCameraEdit(command:LiveCameraEditCommand):void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LIVE_CAMERA_EDIT_COMMAND_EVENT,{detail:command}));
}
export function normalizeLiveCameraEditCommand(raw:unknown):LiveCameraEditCommand|null {
  if (!raw || typeof raw!=="object" || Array.isArray(raw)) return null;
  const value=raw as Record<string,unknown>;
  if (value.kind==="stop") return {kind:"stop"};
  if (value.kind!=="pose" || !value.pose || typeof value.pose!=="object" || Array.isArray(value.pose)) return null;
  const pose=value.pose as Record<string,unknown>;
  if (![pose.x,pose.y,pose.z,pose.targetY,pose.fov].every(n=>typeof n==="number" && Number.isFinite(n))) return null;
  return {kind:"pose",pose:sanitizeCameraPose(pose)};
}
export function cameraPoseFromLiveStatus(status:CameraStudioStatus):CameraPose {
  return sanitizeCameraPose({x:status.camera.x,y:status.camera.y,z:status.camera.z,
    targetX:status.camera.targetX??0,targetY:status.camera.targetY??0,
    targetZ:status.camera.targetZ??0,fov:status.camera.fov});
}
/** Returns a normalized library so new presets appear immediately in the existing editor. */
export function addLiveCameraPreset(library:CameraPresetLibrary, id:string, name:string, pose:CameraPose, section:StageSection):CameraPresetLibrary|null {
  if(!/^[\w-]{1,80}$/.test(id) || library.presets.length>=80 || library.presets.some(p=>p.id===id))return null;
  const title=name.trim().slice(0,60)||"Live-Kamera";
  return normalizeCameraPresets({enabled:true,presets:[...library.presets,{id,name:title,pose:sanitizeCameraPose(pose)}],
    assignments:{...library.assignments,[section]:id}});
}
/** Upsert at nearly the same moment to avoid stacking duplicate frames; never silently drop at 120. */
export function upsertLiveCameraKeyframe(existing:CameraKeyframe[], id:string, seconds:number, pose:CameraPose):CameraKeyframe[]|null {
  if (!/^[\w-]{1,80}$/.test(id) || !Number.isFinite(seconds) || seconds<0 || seconds>3600) return null;
  const frames=normalizeCameraKeyframes(existing);
  const at=frames.findIndex(f=>Math.abs(f.time-seconds)<0.025);
  const next:CameraKeyframe={id:at>=0?frames[at].id:id,time:seconds,pose:sanitizeCameraPose(pose)};
  if(at<0&&frames.length>=120)return null;
  if(at>=0)frames[at]=next;else frames.push(next);
  return normalizeCameraKeyframes(frames);
}
