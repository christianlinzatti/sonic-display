/** V763: read-only, song-scoped bridge between the genuine V761 stage plan and the
 * authoring UI. A page reload needs an actual active stage to publish data again.
 * No fabricated artist timings, no persistently stored V761 scene suggestions. */
import type {CinematicPlanV761} from './cinematicConcertDirectorV761';
export const CONCERT_TIMELINE_EVENT_V763='sonic:concert-timeline-v763';
export interface ConcertTimelineSnapshotV763 {
 trackId:string; durationMs:number; progressMs:number; playing:boolean;
 source:'verified-v604'|'unavailable';
 scenes:ReadonlyArray<{index:number;actIndex:number;section:string;intent:string;startMs:number;endMs:number}>;
}
let current:ConcertTimelineSnapshotV763|null=null;
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
export function getConcertTimelineV763():ConcertTimelineSnapshotV763|null {return current;}
export function publishConcertTimelineV763(plan:CinematicPlanV761, progressMs:number, playing:boolean):void {
 if(!plan||!plan.trackId||!finite(plan.durationMs)||plan.durationMs<10000||plan.durationMs>1800000){
  current=null;
 }else{
  const valid=plan.source==='verified-v604'&&Array.isArray(plan.scenes)&&plan.scenes.length>0&&plan.scenes.length<=480&&
   plan.scenes.every((s,i)=>s.index===i&&finite(s.startMs)&&finite(s.endMs)&&s.startMs>=0&&s.endMs>s.startMs&&s.endMs<=plan.durationMs&&
    (i===0||s.startMs>=plan.scenes[i-1].endMs));
  current={trackId:plan.trackId.slice(0,160),durationMs:plan.durationMs,
   progressMs:finite(progressMs)?Math.max(0,Math.min(plan.durationMs,progressMs)):0,playing:playing===true,
   source:valid?'verified-v604':'unavailable',scenes:valid?plan.scenes.map(s=>({index:s.index,actIndex:s.actIndex,
    section:s.section,intent:s.intent,startMs:s.startMs,endMs:s.endMs})):[]};
 }
 if(typeof window!=='undefined')window.dispatchEvent(new Event(CONCERT_TIMELINE_EVENT_V763));
}
/** Authoring is song-specific. Existing global V354 scores must never be silently discarded. */
export function canEditConcertTimelineV763(score:{trackId:string;durationMs:number},snapshot:ConcertTimelineSnapshotV763|null):boolean {
 return !!snapshot&&!!snapshot.trackId&&score.trackId===snapshot.trackId&&score.durationMs===snapshot.durationMs;
}
