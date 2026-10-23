import type {CameraPose} from './stageCameraPoseHelpersV289';
import type {VisualPlanV397} from './visualPerformanceDirectorV397';
import type {CameraAnchorV377} from './cinematicDuetCameraV377';
import {composeVisualPerformanceV397} from './visualPerformanceDirectorV397';

/** User-authored, track-specific cues. No singer detection or playback control. */
export type CameraTimelineShotV400='lead'|'two-shot'|'group';
export type CameraTimelineTransitionV400='cut'|'smooth';
export type CameraTimelineCueV400={id:string;atMs:number;shot:CameraTimelineShotV400;leadSlot:number;partnerSlot:number;distance:number;pan:number;transition:CameraTimelineTransitionV400;transitionMs:number};
export type CameraTimelineTrackV400={durationMs:number;cues:CameraTimelineCueV400[]};
export type CameraTimelineLibraryV400={enabled:boolean;tracks:Record<string,CameraTimelineTrackV400>};
export type CameraTimelineResultV400={cue:CameraTimelineCueV400;trackId:string;count:number};
export const EMPTY_CAMERA_TIMELINE_V400:CameraTimelineLibraryV400={enabled:false,tracks:{}};
const clamp=(n:unknown,lo:number,hi:number,def:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):def;
const safeId=(s:unknown)=>typeof s==='string'?s.trim().slice(0,140):'';
export const safeTrackIdV400=(s:unknown)=>safeId(s);
export const MAX_CAMERA_CUES_V400=48;
export const MAX_CAMERA_TRACKS_V400=24;
const safeDuration=(n:unknown)=>Math.round(clamp(n,1000,36000000,180000));
export function newCameraCueV400(atMs:number,seed:number=0):CameraTimelineCueV400{
 return {id:`shot-${Math.round(clamp(atMs,0,36000000,0))}-${Math.round(clamp(seed,0,99999,0))}`,atMs:Math.round(clamp(atMs,0,36000000,0)),
  shot:'lead',leadSlot:0,partnerSlot:1,distance:50,pan:0,transition:'smooth',transitionMs:750};
}
/** Strict normalization supports older backups, corrupt localStorage and duplicate cue IDs. */
export function normalizeCameraTimelineV400(value:unknown):CameraTimelineLibraryV400{
 const raw=value&&typeof value==='object'?value as {enabled?:unknown;tracks?:unknown}:{};
 const source=raw.tracks&&typeof raw.tracks==='object'&&!Array.isArray(raw.tracks)?raw.tracks as Record<string,unknown>:{};
 const tracks:Record<string,CameraTimelineTrackV400>={};
 for(const [original,entry] of Object.entries(source).slice(0,MAX_CAMERA_TRACKS_V400)){
  const id=safeTrackIdV400(original);if(!id||id==='__proto__'||id==='constructor'||id==='prototype')continue;
  const t=entry&&typeof entry==='object'?entry as {durationMs?:unknown;cues?:unknown}:{};
  const durationMs=safeDuration(t.durationMs);
  const cues:Array<CameraTimelineCueV400>=[];
  const used=new Set<string>();
  for(const candidate of (Array.isArray(t.cues)?t.cues:[]).slice(0,MAX_CAMERA_CUES_V400)){
   if(!candidate||typeof candidate!=='object')continue;
   const v=candidate as Partial<CameraTimelineCueV400>;
   const id=safeId(v.id);if(!id||used.has(id))continue;used.add(id);
   const shot=v.shot==='lead'||v.shot==='two-shot'||v.shot==='group'?v.shot:'lead';
   cues.push({id,atMs:Math.round(clamp(v.atMs,0,durationMs,0)),shot,
    leadSlot:Math.round(clamp(v.leadSlot,0,3,0)),partnerSlot:Math.round(clamp(v.partnerSlot,0,3,1)),
    distance:Math.round(clamp(v.distance,0,100,50)),pan:Math.round(clamp(v.pan,-100,100,0)),
    transition:v.transition==='cut'?'cut':'smooth',transitionMs:Math.round(clamp(v.transitionMs,150,3000,750))});
  }
  tracks[id]={durationMs,cues:cues.sort((a,b)=>a.atMs-b.atMs||a.id.localeCompare(b.id))};
 }
 return {enabled:raw.enabled===true,tracks};
}
export function editCameraCuesV400(library:CameraTimelineLibraryV400,trackId:string,durationMs:number,cues:readonly CameraTimelineCueV400[]):CameraTimelineLibraryV400{
 const id=safeTrackIdV400(trackId);if(!id)return library;
 const tracks={...library.tracks,[id]:{durationMs:safeDuration(durationMs),cues:[...cues]}};
 // Keep at most 24 songs. A new edit evicts the oldest entry, never all existing shows.
 const keys=Object.keys(tracks);if(keys.length>MAX_CAMERA_TRACKS_V400){for(const key of keys){if(key!==id){delete tracks[key];break;}}}
 return normalizeCameraTimelineV400({...library,tracks});
}
/** A cue is eligible only on its exact track and while music plays normally. */
export function activeCameraCueV400(library:CameraTimelineLibraryV400,trackId:string,progressMs:number,
 playing:boolean,reducedMotion:boolean,count:number):CameraTimelineResultV400|null{
 const id=safeTrackIdV400(trackId),track=Object.prototype.hasOwnProperty.call(library.tracks,id)?library.tracks[id]:undefined;
 if(!library.enabled||!id||!track||!Array.isArray(track.cues)||!playing||reducedMotion||!Number.isFinite(progressMs)||progressMs<0||progressMs>track.durationMs+1500)return null;
 const n=Math.floor(clamp(count,1,4,1));let cue:CameraTimelineCueV400|undefined;
 for(const candidate of track.cues){if(candidate.atMs>progressMs)break;cue=candidate;}
 if(!cue)return null;
 if(cue.leadSlot>=n||cue.shot==='group'&&n<2||cue.shot==='two-shot'&&(n<2||cue.partnerSlot>=n||cue.partnerSlot===cue.leadSlot))return null;
 return {cue,trackId:id,count:n};
}
/** Requires matching visible stage anchors before any authored solo, duo or group framing. */
export function composeCameraTimelineV400(pose:CameraPose,result:CameraTimelineResultV400|null,anchors:readonly CameraAnchorV377[],lyricsProtected:boolean):CameraPose{
 if(!result)return pose;
 const {cue,count}=result;
 const plan:VisualPlanV397={active:true,shot:cue.shot,leadSlot:cue.leadSlot,partnerSlot:cue.shot==='two-shot'?cue.partnerSlot:null,
  strength:1,count,reason:cue.shot==='group'?'chorus':cue.shot==='two-shot'?'handoff':'verse',source:'manual-stage-cast'};
 const framed=composeVisualPerformanceV397(pose,plan,anchors,lyricsProtected,null);
 if(framed===pose)return pose;
 const gain=lyricsProtected?.35:1;
 const z=Math.max(3.2,Math.min(9.2,framed.z+(50-cue.distance)*.032*gain));
 const delta=cue.pan*.007*gain;
 const targetX=Math.max(-3,Math.min(3,(framed.targetX??0)+delta));
 return {...framed,z,targetX,x:framed.x+targetX-(framed.targetX??0)};
}
export const formatCameraTimeV400=(ms:number)=>`${Math.floor(ms/60000).toString().padStart(2,'0')}:${(Math.floor(ms/1000)%60).toString().padStart(2,'0')}.${Math.floor((ms%1000)/100)}`;
