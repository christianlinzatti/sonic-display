import type { CameraPose } from "./stageCameraPoseHelpersV289";
import { sanitizeCameraPose } from "./cameraPresetLibraryV290";

export type CameraKeyframe = { id: string; time: number; pose: CameraPose };
export const CAMERA_KEYFRAMES_EVENT = "sonic-camera-keyframes-v295-change";
const KEY = "sonic-camera-keyframes-v295";
export function normalizeCameraKeyframes(raw: unknown): CameraKeyframe[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  return raw.slice(0, 120).flatMap(item => {
    if (!item || typeof item !== "object") return [];
    const r = item as Record<string, unknown>;
    if (typeof r.id !== "string" || !/^[\w-]{1,80}$/.test(r.id) || seen.has(r.id) ||
        typeof r.time !== "number" || !Number.isFinite(r.time)) return [];
    seen.add(r.id);
    return [{ id: r.id, time: Math.max(0, Math.min(3600, r.time)), pose: sanitizeCameraPose(r.pose) }];
  }).sort((a,b)=>a.time-b.time);
}
export function readCameraKeyframes(presetId: string): CameraKeyframe[] {
  if (typeof window === "undefined") return [];
  try { const data=JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return normalizeCameraKeyframes(data && typeof data === "object" ? data[presetId] : null);
  } catch {return [];}
}
export function writeCameraKeyframes(presetId: string, frames: CameraKeyframe[]): void {
  if (typeof window === "undefined" || !/^[\w-]{1,80}$/.test(presetId)) return;
  try {const data=JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    const next=data && typeof data === "object" && !Array.isArray(data) ? data : {};
    next[presetId]=normalizeCameraKeyframes(frames);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CAMERA_KEYFRAMES_EVENT));
  } catch { /* disabled local storage */ }
}
const smooth = (t:number) => t*t*(3-2*t);
type Vec3 = [number,number,number];
const length3=(v:Vec3)=>Math.hypot(...v);
const unit3=(v:Vec3):Vec3=>{const length=length3(v);return length>1e-6?[v[0]/length,v[1]/length,v[2]/length]:[0,0,1];};
/** Spherical direction interpolation keeps front-to-rear camera flights outside the subject.
 * If the endpoints are opposite, use a stable orthogonal direction rather than crossing the origin.
 */
export function interpolateCameraOrbitDirection(a:Vec3,b:Vec3,t:number):Vec3 {
  const u=unit3(a),v=unit3(b),dot=Math.max(-1,Math.min(1,u[0]*v[0]+u[1]*v[1]+u[2]*v[2]));
  if(dot>0.9995)return unit3([u[0]+(v[0]-u[0])*t,u[1]+(v[1]-u[1])*t,u[2]+(v[2]-u[2])*t]);
  if(dot<-.9995){
    const reference:Vec3=Math.abs(u[0])<.9?[1,0,0]:[0,1,0];
    const projection=u[0]*reference[0]+u[1]*reference[1]+u[2]*reference[2];
    const perpendicular=unit3([reference[0]-projection*u[0],reference[1]-projection*u[1],reference[2]-projection*u[2]]);
    const angle=Math.PI*t;
    return [u[0]*Math.cos(angle)+perpendicular[0]*Math.sin(angle),u[1]*Math.cos(angle)+perpendicular[1]*Math.sin(angle),u[2]*Math.cos(angle)+perpendicular[2]*Math.sin(angle)];
  }
  const angle=Math.acos(dot),denominator=Math.sin(angle);
  const w1=Math.sin((1-t)*angle)/denominator,w2=Math.sin(t*angle)/denominator;
  return unit3([u[0]*w1+v[0]*w2,u[1]*w1+v[1]*w2,u[2]*w1+v[2]*w2]);
}
export function cameraPoseAtTime(frames: CameraKeyframe[], seconds: number): CameraPose | null {
  const sorted=normalizeCameraKeyframes(frames);
  if (!sorted.length) return null;
  if (seconds <= sorted[0].time) return sorted[0].pose;
  const last=sorted[sorted.length-1];
  if (seconds >= last.time) return last.pose;
  const index=sorted.findIndex(f=>f.time>=seconds);
  const a=sorted[index-1], b=sorted[index];
  const factor=smooth(Math.max(0, Math.min(1,(seconds-a.time)/Math.max(.000001,b.time-a.time))));
  const targetX=(a.pose.targetX??0)+((b.pose.targetX??0)-(a.pose.targetX??0))*factor;
  const targetY=a.pose.targetY+(b.pose.targetY-a.pose.targetY)*factor;
  const targetZ=(a.pose.targetZ??0)+((b.pose.targetZ??0)-(a.pose.targetZ??0))*factor;
  const va:Vec3=[a.pose.x-(a.pose.targetX??0),a.pose.y-a.pose.targetY,a.pose.z-(a.pose.targetZ??0)];
  const vb:Vec3=[b.pose.x-(b.pose.targetX??0),b.pose.y-b.pose.targetY,b.pose.z-(b.pose.targetZ??0)];
  const radius=Math.max(1.2,length3(va)+(length3(vb)-length3(va))*factor);
  const direction=interpolateCameraOrbitDirection(va,vb,factor);
  return {x:targetX+direction[0]*radius,y:targetY+direction[1]*radius,z:targetZ+direction[2]*radius,
    targetX,targetY,targetZ,fov:a.pose.fov+(b.pose.fov-a.pose.fov)*factor};
}
