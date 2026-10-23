import type { CameraStudioStatus } from "./cameraStudioHelpersV299";
import { CAMERA_SECTIONS, type CameraPresetLibrary } from "./cameraPresetLibraryV290";
import { normalizeCameraKeyframes, type CameraKeyframe } from "./cameraKeyframesV295";
import type { StageSection } from "./stageDirectorV287";

export const CAMERA_DASHBOARD_NAV_EVENT = "sonic-camera-dashboard-v300-navigate";
export const CAMERA_DASHBOARD_STATUS_TIMEOUT_MS = 3000;
export type CameraDashboardNavigation = { section: StageSection; presetId?: string; seconds?: number };
export type CameraDashboardLane = { section: StageSection; presetId: string | null; presetName: string | null; keyframes: CameraKeyframe[]; duration: number };

/** Section assignments are categories, not known song-time ranges. Never fake section timestamps. */
export function buildCameraDashboardLanes(library: CameraPresetLibrary, allFrames: Record<string, CameraKeyframe[]>): CameraDashboardLane[] {
  return CAMERA_SECTIONS.map(section => {
    const preset = library.presets.find(p => p.id === library.assignments[section]);
    const keyframes = preset ? normalizeCameraKeyframes(allFrames[preset.id]) : [];
    return {section, presetId:preset?.id ?? null, presetName:preset?.name ?? null, keyframes, duration:keyframes.at(-1)?.time ?? 0};
  });
}
export function cameraLaneCursor(progressMs: number, duration: number): number | null {
  if (!Number.isFinite(progressMs) || duration <= 0) return null;
  return Math.min(100, Math.max(0, (((Math.max(0, progressMs)/1000) % duration) / duration) * 100));
}
export function cameraKeyframePosition(seconds: number, duration: number): number {
  return duration > 0 ? Math.min(100,Math.max(0,100 * seconds / duration)) : 0;
}
export type ProjectedPoint = { x:number;y:number };
type P3 = [number,number,number];
const dot=(a:P3,b:P3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const sub=(a:P3,b:P3):P3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a:P3,b:P3):P3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=(v:P3):P3=>{const length=Math.hypot(...v)||1;return [v[0]/length,v[1]/length,v[2]/length];};

/** Perspective projection from the *measured live camera*; geometry is an illustrative stage, never a video feed. */
export function projectCameraStagePoint(point:P3, status:Pick<CameraStudioStatus,"camera">, width=420,height=238):ProjectedPoint | null {
  const c=status.camera;
  if (![c.x,c.y,c.z,c.fov].every(Number.isFinite)) return null;
  const origin:P3=[c.x,c.y,c.z];
  const destination:P3=[c.targetX ?? 0,c.targetY ?? 0,c.targetZ ?? 0];
  const forward=unit(sub(destination,origin));
  const right=unit(cross(forward,[0,1,0]));
  const up=unit(cross(right,forward));
  const relative=sub(point,origin);
  const depth=dot(relative,forward);
  if(depth<=0.05)return null;
  const fovRadians=Math.min(85,Math.max(18,c.fov))*Math.PI/180;
  const scale=Math.tan(fovRadians/2)*depth;
  const sx=dot(relative,right)/((width/height)*scale);
  const sy=dot(relative,up)/scale;
  const x=(sx+1)*width/2,y=(1-sy)*height/2;
  return Number.isFinite(x)&&Number.isFinite(y)?{x:Math.max(-10000,Math.min(10000,x)),y:Math.max(-10000,Math.min(10000,y))}:null;
}
export const CAMERA_DASHBOARD_STAGE_EDGES: [P3,P3][] = [
  [[-3,-1.2,-2.2],[3,-1.2,-2.2]], [[3,-1.2,-2.2],[3,-1.2,2.2]],
  [[3,-1.2,2.2],[-3,-1.2,2.2]],[[-3,-1.2,2.2],[-3,-1.2,-2.2]],
  ...[-2,-1,0,1,2].map(x=>[[x,-1.2,-2.2],[x,-1.2,2.2]] as [P3,P3]),
  ...[-1,0,1].map(z=>[[-3,-1.2,z],[3,-1.2,z]] as [P3,P3]),
  [[-2.5,-1.2,-1.8],[-2.5,2,-1.8]], [[2.5,-1.2,-1.8],[2.5,2,-1.8]],
  [[-2.5,2,-1.8],[2.5,2,-1.8]],
];
