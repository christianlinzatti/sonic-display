import type { CameraPose } from "./stageCameraPoseHelpersV289";
import type { CameraKeyframe } from "./cameraKeyframesV295";
import { sanitizeCameraPose } from "./cameraPresetLibraryV290";

export type CameraPathSettings = {
  enabled: boolean;
  curve: "catmull-rom" | "linear";
  easing: "linear" | "ease-in-out" | "cinematic";
  speed: number;
  tension: number;
  loop: boolean;
};
export const CAMERA_PATH_EVENT = "sonic-cinematic-camera-paths-v305-change";
export const CAMERA_PATH_KEY = "sonic-cinematic-camera-paths-v305";
export const DEFAULT_CAMERA_PATH_SETTINGS: CameraPathSettings = {
  enabled: false, curve: "catmull-rom", easing: "cinematic", speed: 1, tension: .3, loop: true,
};
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const safe = (value: unknown, low: number, high: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? clamp(value, low, high) : fallback;
export function normalizeCameraPathSettings(raw: unknown): CameraPathSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ...DEFAULT_CAMERA_PATH_SETTINGS };
  const o = raw as Record<string, unknown>;
  return {
    enabled: o.enabled === true,
    curve: o.curve === "linear" ? "linear" : "catmull-rom",
    easing: o.easing === "linear" || o.easing === "ease-in-out" ? o.easing : "cinematic",
    speed: safe(o.speed, .25, 3, 1),
    tension: safe(o.tension, 0, 1, .3),
    loop: o.loop !== false,
  };
}
const validId = (value: string) => /^[\w-]{1,80}$/.test(value);
export function readCameraPathSettings(presetId: string): CameraPathSettings {
  if (typeof window === "undefined" || !validId(presetId)) return { ...DEFAULT_CAMERA_PATH_SETTINGS };
  try {
    const map: unknown = JSON.parse(window.localStorage.getItem(CAMERA_PATH_KEY) ?? "{}");
    const record = map && typeof map === "object" && !Array.isArray(map) ? map as Record<string, unknown> : {};
    return normalizeCameraPathSettings(record[presetId]);
  } catch { return { ...DEFAULT_CAMERA_PATH_SETTINGS }; }
}
export function writeCameraPathSettings(presetId: string, value: CameraPathSettings): void {
  if (typeof window === "undefined" || !validId(presetId)) return;
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(CAMERA_PATH_KEY) ?? "{}");
    const record: Record<string,unknown> = stored && typeof stored === "object" && !Array.isArray(stored) ? stored as Record<string,unknown> : {};
    record[presetId] = normalizeCameraPathSettings(value);
    // Bound the number of keys independently from the existing preset data.
    const ids = Object.keys(record).filter(validId).slice(-80);
    window.localStorage.setItem(CAMERA_PATH_KEY, JSON.stringify(Object.fromEntries(ids.map(id => [id, record[id]]))));
    window.dispatchEvent(new Event(CAMERA_PATH_EVENT));
  } catch { /* Private mode / blocked storage: leave presets untouched. */ }
}

type Channels = [number, number, number, number, number, number, number];
const toChannels = (pose: CameraPose): Channels => {
  const tx=pose.targetX??0, ty=pose.targetY, tz=pose.targetZ??0;
  const dx=pose.x-tx, dy=pose.y-ty, dz=pose.z-tz;
  return [tx,ty,tz,Math.atan2(dx,dz),Math.atan2(dy,Math.hypot(dx,dz)),Math.max(1.2,Math.hypot(dx,dy,dz)),pose.fov];
};
const interpolate = (a: number,b: number,t:number) => a+(b-a)*t;
const easing = (t:number,mode:CameraPathSettings["easing"]) => mode === "linear" ? t :
  mode === "ease-in-out" ? t*t*(3-2*t) : t*t*t*(t*(6*t-15)+10);
/** Evaluate a cyclic/open camera orbit in spherical coordinates around a smoothly moving target.
 * Angular unwrapping prevents the camera from cutting through the avatar when passing behind it.
 * The spline never interpolates absolute camera coordinates through the subject.
 */
export function cinematicCameraPoseAtTime(
  frames: CameraKeyframe[], seconds: number, rawSettings: CameraPathSettings
): CameraPose | null {
  if (!frames.length || !Number.isFinite(seconds)) return null;
  const settings = normalizeCameraPathSettings(rawSettings);
  // Sampling is frequent (live R3F useFrame): callers provide already-normalized, sorted frames.
  const ordered = frames.filter(f => Number.isFinite(f.time)).slice().sort((a,b)=>a.time-b.time);
  if (!ordered.length) return null;
  if (ordered.length === 1) return sanitizeCameraPose(ordered[0].pose);
  const end=ordered[ordered.length-1].time;
  const closureSpan=Math.max(.5,Math.min(10,(end-ordered[0].time)/Math.max(1,ordered.length-1)));
  const period=end+closureSpan;
  let t=Math.max(0,seconds)*settings.speed;
  if(settings.loop && end>0) t=t%period;
  if(t<=ordered[0].time) return sanitizeCameraPose(ordered[0].pose);
  const channels = ordered.map(f=>toChannels(f.pose));
  // Unwrap azimuth relative to previous camera, taking the shortest adjacent arc.
  for (let i=1;i<channels.length;i++) {
    let angle=channels[i][3];
    const previous=channels[i-1][3];
    while(angle-previous>Math.PI)angle-=2*Math.PI;
    while(angle-previous< -Math.PI)angle+=2*Math.PI;
    channels[i][3]=angle;
  }
  if(t>=end) {
    // Close the loop as a real orbit segment: never teleport from last to first pose.
    if(!settings.loop || end<=0) return sanitizeCameraPose(ordered[ordered.length-1].pose);
    const u=easing(clamp((t-end)/closureSpan,0,1),settings.easing);
    const last=channels[channels.length-1],first=channels[0];
    let firstAngle=first[3];
    while(firstAngle-last[3]>Math.PI)firstAngle-=2*Math.PI;
    while(firstAngle-last[3]< -Math.PI)firstAngle+=2*Math.PI;
    const tx=interpolate(last[0],first[0],u),ty=interpolate(last[1],first[1],u),tz=interpolate(last[2],first[2],u);
    const azimuth=interpolate(last[3],firstAngle,u);
    const elevation=interpolate(last[4],first[4],u);
    const radius=Math.max(1.2,interpolate(last[5],first[5],u));
    const cos=Math.cos(elevation);
    return sanitizeCameraPose({x:tx+radius*cos*Math.sin(azimuth),y:ty+radius*Math.sin(elevation),
      z:tz+radius*cos*Math.cos(azimuth),targetX:tx,targetY:ty,targetZ:tz,fov:interpolate(last[6],first[6],u)});
  }
  let j=1;
  while (j<ordered.length-1 && ordered[j].time<t) j++;
  const a=ordered[j-1],b=ordered[j];
  const span=Math.max(1e-6,b.time-a.time);
  const fraction=easing(clamp((t-a.time)/span,0,1),settings.easing);
  const interpolateChannel=(k:number):number=>{
    const p=channels[j-1][k],q=channels[j][k];
    if(settings.curve==="linear")return interpolate(p,q,fraction);
    const before=Math.max(0,j-2), after=Math.min(ordered.length-1,j+1);
    const dt0=Math.max(1e-6,ordered[j].time-ordered[before].time);
    const dt1=Math.max(1e-6,ordered[after].time-ordered[j-1].time);
    // Catmull–Rom/Hermite tangents with adjustable tension; time-aware for uneven keys.
    const m0=(1-settings.tension)*(channels[j][k]-channels[before][k])/dt0*span;
    const m1=(1-settings.tension)*(channels[after][k]-channels[j-1][k])/dt1*span;
    const u=fraction,u2=u*u,u3=u2*u;
    return (2*u3-3*u2+1)*p+(u3-2*u2+u)*m0+(-2*u3+3*u2)*q+(u3-u2)*m1;
  };
  const tx=interpolateChannel(0),ty=interpolateChannel(1),tz=interpolateChannel(2);
  const azimuth=interpolateChannel(3),elevation=clamp(interpolateChannel(4),-1.48,1.48);
  const radius=clamp(interpolateChannel(5),1.2,30),fov=interpolateChannel(6);
  const cos=Math.cos(elevation);
  return sanitizeCameraPose({
    x:tx+radius*cos*Math.sin(azimuth), y:ty+radius*Math.sin(elevation),z:tz+radius*cos*Math.cos(azimuth),
    targetX:tx,targetY:ty,targetZ:tz,fov,
  });
}
export function sampleCinematicCameraPath(frames: CameraKeyframe[], settings: CameraPathSettings, count=48): CameraPose[] {
  if(frames.length<2) return [];
  const end=Math.max(...frames.map(f=>f.time));
  if(!Number.isFinite(end)||end<=0)return [];
  const n=Math.round(clamp(count,2,120));
  // Samples describe a single authored path, independently from playback speed/looping.
  const previewSettings={...normalizeCameraPathSettings(settings),speed:1,loop:false};
  return Array.from({length:n},(_,i)=>cinematicCameraPoseAtTime(frames,end*i/(n-1),previewSettings)).filter((p):p is CameraPose=>p!==null);
}
