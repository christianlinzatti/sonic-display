import type {CameraPoseV432 as CameraPose} from "./cameraPoseTypeV432";
import type {RapCameraPlanV429} from "./cinematicRapCameraV429";

/** Author-authored song-local 3D poses; offsetMs is relative to the synced lyric line. */
export type RapCameraKeyframeV432={lineIndex:number;offsetMs:number;pose:CameraPose};
export type RapCameraKeyframeLibraryV432=Record<string,RapCameraKeyframeV432[]>;
const MAX_TRACKS=128, MAX_FRAMES=128, MAX_INPUT=MAX_FRAMES*4, MAX_LINES=10000;
const bounds={x:[-20,20,0],y:[-12,12,.1],z:[-20,20,4.2],targetX:[-12,12,0],targetY:[-6,8,0],targetZ:[-12,12,0],fov:[20,95,38]} as const;
const clamp=(value:unknown,min:number,max:number,fallback:number)=>
  typeof value==="number"&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
const validTrack=(id:string)=>!!id&&id.length<=180&&!(["__proto__","constructor","prototype"].includes(id));
const validLine=(n:number)=>Number.isInteger(n)&&n>=0&&n<MAX_LINES;
const validOffset=(n:number)=>Number.isFinite(n)&&n>=0&&n<=14000;

/** Defensive validation of imported settings; normalize optional target axes. */
export function normalizeRapCameraPoseV432(value:unknown):CameraPose {
  const source=value&&typeof value==="object"&&!Array.isArray(value)?value as Partial<CameraPose>:{};
  return {
    x:clamp(source.x,...bounds.x),y:clamp(source.y,...bounds.y),z:clamp(source.z,...bounds.z),
    targetX:clamp(source.targetX,...bounds.targetX),targetY:clamp(source.targetY,...bounds.targetY),
    targetZ:clamp(source.targetZ,...bounds.targetZ),fov:clamp(source.fov,...bounds.fov)
  };
}
export function normalizeRapCameraKeyframesV432(raw:unknown):RapCameraKeyframeV432[]{
  if(!Array.isArray(raw))return [];
  const unique=new Map<string,RapCameraKeyframeV432>();
  for(const value of raw.slice(0,MAX_INPUT)){
    if(!value||typeof value!=="object"||Array.isArray(value))continue;
    const frame=value as Partial<RapCameraKeyframeV432>;
    if(typeof frame.lineIndex!=="number"||!validLine(frame.lineIndex)||
      typeof frame.offsetMs!=="number"||!validOffset(frame.offsetMs)||
      !frame.pose||typeof frame.pose!=="object"||Array.isArray(frame.pose))continue;
    const offsetMs=Math.round(frame.offsetMs);
    unique.set(`${frame.lineIndex}:${offsetMs}`,{lineIndex:frame.lineIndex,offsetMs,
      pose:normalizeRapCameraPoseV432(frame.pose)});
  }
  return [...unique.values()].sort((a,b)=>a.lineIndex-b.lineIndex||a.offsetMs-b.offsetMs).slice(0,MAX_FRAMES);
}
export function normalizeRapCameraKeyframeLibraryV432(raw:unknown):RapCameraKeyframeLibraryV432{
  const result:RapCameraKeyframeLibraryV432=Object.create(null) as RapCameraKeyframeLibraryV432;
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return result;
  for(const [id,items] of Object.entries(raw)){
    if(Object.keys(result).length>=MAX_TRACKS)break;
    if(!validTrack(id))continue;
    const frames=normalizeRapCameraKeyframesV432(items);
    if(frames.length)result[id]=frames;
  }
  return result;
}
/** Atomic local-only update. A missing edit or bad input is never persisted. */
export function saveRapCameraKeyframeV432(raw:unknown,trackId:string,lineIndex:number,
    offsetMs:number,pose:CameraPose|null):RapCameraKeyframeLibraryV432{
  const library=normalizeRapCameraKeyframeLibraryV432(raw);
  if(!validTrack(trackId)||!validLine(lineIndex)||!validOffset(offsetMs)||
    (pose!==null&&(!pose||typeof pose!=="object"||Array.isArray(pose))))return library;
  if(!Object.prototype.hasOwnProperty.call(library,trackId)&&Object.keys(library).length>=MAX_TRACKS)return library;
  const ms=Math.round(offsetMs);
  const others=(library[trackId]??[]).filter(f=>f.lineIndex!==lineIndex||f.offsetMs!==ms);
  if(pose&&others.length>=MAX_FRAMES)return library;
  const next=normalizeRapCameraKeyframesV432(pose?[...others,{lineIndex,offsetMs:ms,pose}]:others);
  if(next.length)library[trackId]=next;
  else delete library[trackId];
  return library;
}
export function lineRapCameraKeyframesV432(frames:readonly RapCameraKeyframeV432[],lineIndex:number):RapCameraKeyframeV432[]{
  return frames.filter(f=>f.lineIndex===lineIndex).sort((a,b)=>a.offsetMs-b.offsetMs);
}
const smooth=(x:number)=>{const t=clamp(x,0,1,0);return t*t*(3-2*t);};
const fields=["x","y","z","targetX","targetY","targetZ","fov"] as const;
/** Local song timebase. Sparse frames hold their nearest authored pose; between frames cubic easing. */
export function sampleRapCameraKeyframesV432(frames:readonly RapCameraKeyframeV432[],
  lineIndex:number,offsetMs:number):CameraPose|null{
  if(!validLine(lineIndex)||!validOffset(offsetMs))return null;
  // Live entries are normalized once at hydration/update; cap scanning to avoid unbounded rendering.
  let previous:RapCameraKeyframeV432|undefined,next:RapCameraKeyframeV432|undefined;
  for(let i=0;i<frames.length&&i<MAX_FRAMES;i++){
    const frame=frames[i];
    if(frame.lineIndex!==lineIndex||!validOffset(frame.offsetMs))continue;
    if(frame.offsetMs<=offsetMs&&(!previous||frame.offsetMs>previous.offsetMs))previous=frame;
    if(frame.offsetMs>=offsetMs&&(!next||frame.offsetMs<next.offsetMs))next=frame;
  }
  if(!previous&&!next)return null;
  const start=normalizeRapCameraPoseV432((previous??next)!.pose);
  if(!previous||!next||previous.offsetMs===next.offsetMs)return start;
  const end=normalizeRapCameraPoseV432(next.pose),t=smooth((offsetMs-previous.offsetMs)/(next.offsetMs-previous.offsetMs));
  const output={...start};
  for(const key of fields)output[key]=(start[key]??0)+((end[key]??0)-(start[key]??0))*t;
  return output;
}
/** V429's manual priority, V430 off-gate and lyrics protection have already run. */
export function composeRapCameraKeyframeV432(pose:CameraPose,plan:RapCameraPlanV429,
  frames:readonly RapCameraKeyframeV432[],progressMs:number,opts:{enabled:boolean;lyricsProtected:boolean}):CameraPose{
  if(!opts.enabled||!plan.active||plan.gain<=0||!Number.isFinite(progressMs)||
    progressMs<plan.startMs||progressMs>=plan.endMs)return pose;
  const targetPose=sampleRapCameraKeyframesV432(frames,plan.lineIndex,progressMs-plan.startMs);
  if(!targetPose)return pose;
  const gain=clamp(plan.gain,0,1,0)*(opts.lyricsProtected ? .3 : 1);
  // Full 3D poses in the editor, but an overlay cannot create a hazardous camera jump.
  // Respect safe authored keyframes elsewhere: this is only called inside the V429 gate.
  const maxDelta:Record<typeof fields[number],number>={x:2.2,y:1.3,z:2.2,targetX:1.4,targetY:1,targetZ:1.4,fov:7};
  const result={...pose};
  for(const key of fields){
    const value=pose[key]??0,requested=targetPose[key]??0;
    result[key]=value+clamp(requested-value,-maxDelta[key],maxDelta[key],0)*gain;
  }
  // Keep the camera outside the target; cannot cross the avatar for zero/negative Z.
  result.z=Math.max(1.2,result.z);
  return result;
}
