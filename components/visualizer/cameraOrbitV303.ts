import type { CameraPose } from "./stageCameraPoseHelpersV289";
import { sanitizeCameraPose } from "./cameraPresetLibraryV290";

export const CAMERA_ORBIT_GESTURE_EVENT = "sonic-camera-orbit-v303-gesture";
export const CAMERA_ORBIT_ACTIVE_EVENT = "sonic-camera-orbit-v303-active";
export type CameraOrbitGesture =
  | { kind: "rotate"; deltaX: number; deltaY: number }
  | { kind: "pan"; deltaX: number; deltaY: number }
  | { kind: "zoom"; factor: number }
  | { kind: "reset" };
const clamp = (n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function normalizeCameraOrbitGesture(raw:unknown):CameraOrbitGesture|null {
  if (!raw || typeof raw!=="object" || Array.isArray(raw)) return null;
  const obj=raw as Record<string,unknown>;
  if(obj.kind==="reset")return {kind:"reset"};
  if((obj.kind==="rotate" || obj.kind==="pan") && typeof obj.deltaX==="number" && typeof obj.deltaY==="number" && Number.isFinite(obj.deltaX) && Number.isFinite(obj.deltaY))
    return {kind:obj.kind,deltaX:clamp(obj.deltaX,-240,240),deltaY:clamp(obj.deltaY,-240,240)};
  if(obj.kind==="zoom" && typeof obj.factor==="number" && Number.isFinite(obj.factor) && obj.factor>0)
    return {kind:"zoom",factor:clamp(obj.factor,.75,1.33)};
  return null;
}
export function publishCameraOrbitGesture(gesture:CameraOrbitGesture):void {
  if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent(CAMERA_ORBIT_GESTURE_EVENT,{detail:gesture}));
}
export function publishCameraOrbitActive(active:boolean):void {
  if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent(CAMERA_ORBIT_ACTIVE_EVENT,{detail:active}));
}
/** Continuous, full 360-degree orbital motion around a freely translated look-at target.
 * Panning translates BOTH camera and target along the view's right/up vectors.
 * Old V303 gestures and saved poses remain readable without changing localStorage keys.
 */
export function applyCameraOrbitGesture(pose:CameraPose,gesture:CameraOrbitGesture):CameraPose {
  const p=sanitizeCameraPose(pose);
  if(gesture.kind==="reset")return p; // editor restores the start-of-edit pose
  const tx=p.targetX??0, ty=p.targetY, tz=p.targetZ??0;
  const dx=p.x-tx,dy=p.y-ty,dz=p.z-tz;
  const h=Math.hypot(dx,dz),radius=Math.max(.001,Math.hypot(dx,dy,dz));
  const yaw=Math.atan2(dx,dz),pitch=Math.atan2(dy,h);
  if(gesture.kind==="pan") {
    // Horizontal camera right = (cos yaw,0,-sin yaw), camera up = (-sin(pitch)*sin(yaw),cos(pitch),-sin(pitch)*cos(yaw)).
    const step=clamp(radius*.0022,.004,.04);
    const sx=-gesture.deltaX*step,sy=gesture.deltaY*step;
    const x=sx*Math.cos(yaw)-sy*Math.sin(pitch)*Math.sin(yaw);
    const y=sy*Math.cos(pitch);
    const z=-sx*Math.sin(yaw)-sy*Math.sin(pitch)*Math.cos(yaw);
    // Clamp a common displacement so camera and target retain the SAME relative pose.
    const shift=(d:number,ca:number,ta:number,camMin:number,camMax:number,targetMin:number,targetMax:number)=>
      clamp(d,Math.max(camMin-ca,targetMin-ta),Math.min(camMax-ca,targetMax-ta));
    const mx=shift(x,p.x,tx,-20,20,-12,12),my=shift(y,p.y,ty,-12,12,-6,8),mz=shift(z,p.z,tz,-20,20,-12,12);
    return sanitizeCameraPose({...p,x:p.x+mx,y:p.y+my,z:p.z+mz,targetX:tx+mx,targetY:ty+my,targetZ:tz+mz});
  }
  const nextYaw=gesture.kind==="rotate"?yaw+gesture.deltaX*.006:yaw;
  const nextPitch=gesture.kind==="rotate"?clamp(pitch-gesture.deltaY*.006,-Math.PI*.47,Math.PI*.47):pitch;
  const nextRadius=gesture.kind==="zoom"?clamp(radius*gesture.factor,1.3,15):clamp(radius,1.3,15);
  const horizontal=nextRadius*Math.cos(nextPitch);
  return sanitizeCameraPose({...p,x:tx+horizontal*Math.sin(nextYaw),y:ty+nextRadius*Math.sin(nextPitch),z:tz+horizontal*Math.cos(nextYaw)});
}
