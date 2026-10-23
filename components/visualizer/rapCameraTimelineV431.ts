import type {Lyrics} from "@/types/music";
import {cameraSceneAssignmentsV436} from "./autoRapSceneAssignmentsV436";
import type {RapDuetAssignmentV416} from "./rapDuetStudioV416";
import {normalizeRapCameraOverridesV430, type RapCameraChoiceV430} from "./rapCameraShotStudioV430";
import type {RapCameraShotV429} from "./cinematicRapCameraV429";

/** Editorial projection; V436 can optionally add heuristic fallback stage scenes. */
export type RapCameraTimelineItemV431={
  lineIndex:number; startMs:number; endMs:number; text:string;
  shot:RapCameraShotV429; authoredShot:RapCameraShotV429;
  override:RapCameraChoiceV430|null; strength:number;
  leadSlot:number; durationMs:number; eligible:boolean;
};
export type RapCameraTimelineV431={items:RapCameraTimelineItemV431[]; total:number; assigned:number; edited:number};
const shotFor=(style:RapDuetAssignmentV416["style"]):RapCameraShotV429=>
  style==="solo"?"solo-close":style==="reply"?"reply-side":
  style==="duet"?"duet-wide":"hook-push";
const isFiniteMs=(value:unknown):value is number=>
  typeof value==="number"&&Number.isFinite(value)&&value>=0;

/**
 * Read-only timeline from timed lyrics and V416 roles or explicitly enabled V436 fallback.
 * Ignores corrupt timestamps and inactive/invalid avatar roles without changing stored data.
 * Last V416 assignment wins, just as the live V416 resolver does.
 */
export function buildRapCameraTimelineV431({trackId,lyrics,assignments,overrides,avatarCount,autoAssignIfMissing=false}:{
  trackId:string;lyrics:Lyrics|null|undefined;assignments:unknown;overrides:unknown;avatarCount:number;
  autoAssignIfMissing?:boolean;
}):RapCameraTimelineV431{
  const empty:RapCameraTimelineV431={items:[],total:0,assigned:0,edited:0};
  if(!trackId||!lyrics?.synced||!Array.isArray(lyrics.lines))return empty;
  const lines=lyrics.lines.slice(0,5000);
  const cast=cameraSceneAssignmentsV436({lyrics,authored:assignments,avatarCount,
    autoEnabled:autoAssignIfMissing}).assignments;
  const edits=new Map(normalizeRapCameraOverridesV430(overrides).map(edit=>[edit.lineIndex,edit]));
  const count=Number.isFinite(avatarCount)?Math.max(1,Math.min(4,Math.trunc(avatarCount))):1;
  const items:RapCameraTimelineItemV431[]=[];
  let assigned=0,edited=0;
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!isFiniteMs(line?.startMs))continue;
    const next=lines[i+1];
    const nextStart=isFiniteMs(next?.startMs)&&next.startMs>line.startMs?next.startMs:Infinity;
    const lineEnd=isFiniteMs(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity;
    const endMs=Math.min(nextStart,lineEnd,line.startMs+14000);
    if(endMs<=line.startMs)continue;
    let castLine:RapDuetAssignmentV416|undefined;
    if(count>=2&&typeof line.text==="string"&&line.text.trim()){
      for(let j=cast.length-1;j>=0;j--){
        const candidate=cast[j];
        if(candidate.fromLine<=i&&candidate.toLine>=i&&candidate.leadSlot<count&&
          candidate.partnerSlot<count){castLine=candidate;break;}
      }
    }
    const authoredShot=castLine?shotFor(castLine.style):"none";
    const eligible=authoredShot!=="none"&&castLine!.strength>0;
    const override=eligible?edits.get(i)??null:null;
    const overridden=override!==null;
    const shot:RapCameraShotV429=override?.shot==="off"||override?.strength===0?"none":
      (override?.shot?override.shot:authoredShot);
    if(eligible)assigned++;
    if(overridden)edited++;
    items.push({lineIndex:i,startMs:line.startMs,endMs,text:line.text??"",
      authoredShot,shot,override:override?.shot??null,strength:override?.strength??100,
      durationMs:endMs-line.startMs,leadSlot:castLine?.leadSlot??0,eligible});
  }
  return {items,total:items.length,assigned,edited};
}

/** Same last-starting-line selection rule as V416, no forced seeking of the music player. */
export function timelineLineAtV431(items:readonly RapCameraTimelineItemV431[],timeMs:number):number{
  if(!Number.isFinite(timeMs)||timeMs<0)return -1;
  let index=-1;
  for(let i=0;i<items.length;i++){
    if(items[i].startMs>timeMs)break;
    index=i;
  }
  return index>=0&&timeMs<items[index].endMs?index:-1;
}

/** Render a short, bounded window even on 5,000-line lyric files. */
export function visibleRapCameraWindowV431(items:readonly RapCameraTimelineItemV431[],selected:number,radius=7){
  const r=Number.isFinite(radius)?Math.max(0,Math.min(20,Math.trunc(radius))):7;
  const center=Math.max(0,Math.min(items.length-1,Number.isInteger(selected)?selected:0));
  const start=Math.max(0,Math.min(center-r,items.length-(r*2+1)));
  return {start,items:items.slice(start,start+r*2+1)};
}

/** Mid-line inspection never calls the Spotify seek endpoint. */
export function rapCameraPreviewTimeV431(item:RapCameraTimelineItemV431):number{
  return Math.round(item.startMs+Math.min(220,item.durationMs/2));
}
