/** V1094 · Concert Timeline Studio 3.0.
 * Pure, local editor for the existing V1040 show plan. Time edits change the
 * plan actually sampled by Arena360Stage; they never claim to detect sections.
 * Does not control audio transport, pyro, Govee, camera or hardware.
 */
import {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,
 type ArenaShowPlanV1040,type ArenaShowCueV1040,
 sampleArenaShowPlanV1040} from './arena360ShowDesignerV1040';
export const MIN_SCENE_FRACTION_V1094=.025;
export const TIMELINE_COLORS_V1094=['#427cba','#936caa','#b58b48','#aa4a76','#4a9480','#7c77ad','#a77943'] as const;
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const fraction=(value:number)=>Math.round(value*1_000_000)/1_000_000;
export function timelineBoundaryRangeV1094(plan:unknown,boundary:number):{minMs:number;maxMs:number;currentMs:number}|null{
 const valid=normalizeArenaShowPlanV1040(plan);
 if(!valid||!Number.isInteger(boundary)||boundary<1||boundary>=valid.segments.length)return null;
 const previous=valid.segments[boundary-1],next=valid.segments[boundary];
 const minFraction=previous.start+MIN_SCENE_FRACTION_V1094;
 const maxFraction=next.end-MIN_SCENE_FRACTION_V1094;
 if(maxFraction<minFraction)return null;
 return {minMs:Math.ceil(minFraction*valid.durationMs),maxMs:Math.floor(maxFraction*valid.durationMs),
  currentMs:Math.round(previous.end*valid.durationMs)};
}
export function retimeConcertBoundaryV1094(plan:unknown,boundary:number,atMs:number):ArenaShowPlanV1040|null{
 const valid=normalizeArenaShowPlanV1040(plan);
 if(!valid||!Number.isFinite(atMs))return null;
 const range=timelineBoundaryRangeV1094(valid,boundary);
 if(!range)return null;
 const time=clamp(atMs,range.minMs,range.maxMs);
 const normalized=fraction(time/valid.durationMs);
 const segments=valid.segments.map((s,i)=>i===boundary-1?{...s,end:normalized}:
  i===boundary?{...s,start:normalized}:s);
 return normalizeArenaShowPlanV1040({...valid,segments});
}
/** Restore just the default chapter boundaries; keep user's cues, prompt and mode. */
export function resetConcertBoundariesV1094(plan:unknown):ArenaShowPlanV1040|null{
 const valid=normalizeArenaShowPlanV1040(plan);if(!valid)return null;
 const defaults=generateArenaShowPlanV1040({durationMs:valid.durationMs});
 return normalizeArenaShowPlanV1040({...valid,segments:valid.segments.map((s,i)=>({
  ...s,start:defaults.segments[i].start,end:defaults.segments[i].end
 }))});
}
/** Virtual playhead: preview does not seek Spotify or send renderer actions. */
export function previewConcertTimelineV1094(plan:unknown,positionMs:number):ArenaShowCueV1040|null{
 const valid=normalizeArenaShowPlanV1040(plan);
 if(!valid||!Number.isFinite(positionMs)||positionMs<0)return null;
 return sampleArenaShowPlanV1040(valid,{enabled:true,playing:true,reducedMotion:false,
  progressMs:clamp(positionMs,0,valid.durationMs),durationMs:valid.durationMs});
}
