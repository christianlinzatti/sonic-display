/** V1088 · Smart Song Structure Detection.
 * Song-scoped, deterministic analysis of validated V1018 evidence.
 * Only a verified V604 timeline can establish verse/hook/drop/section boundaries.
 * Live audio may suggest a build or quiet break, but is NEVER authority for
 * stage pyro, real hardware, Govee, BPM, lyric or downbeat decisions.
 * No timers, network requests, storage, arbitrary percentages or guessed hooks.
 */
import type {SongUnderstandingV1018,RecognizedSectionV1018} from './songUnderstandingV1018';

export type StructureLabelV1088=RecognizedSectionV1018;
export type StructureEvidenceV1088='verified-timeline'|'audio-hypothesis'|'unavailable';
export type StructureChapterV1088='opening'|'body'|'ending'|'unavailable';
export interface SongStructureObservationV1088 {
 trackId:string;durationMs:number;positionMs:number;playing:boolean;
 evidence:SongUnderstandingV1018|null;
}
export interface SongStructureStateV1088 {
 trackId:string;durationMs:number;positionMs:number;
 candidate:'build'|'break'|null;candidateSinceMs:number;candidateObservations:number;
 lastAudioPositionMs:number;
}
export interface SongStructureResultV1088 {
 label:StructureLabelV1088|null;source:StructureEvidenceV1088;
 confidence:number;startMs:number|null;endMs:number|null;
 nextLabel:StructureLabelV1088|null;
 chapter:StructureChapterV1088;/** Chapter is navigation only, not observed song structure. */
 reason:string;
}
export interface SongStructureSnapshotV1088 {state:SongStructureStateV1088|null;result:SongStructureResultV1088;}
const valid=(x:unknown,lo:number,hi:number):x is number=>typeof x==='number'&&Number.isFinite(x)&&x>=lo&&x<=hi;
const OFF:Readonly<SongStructureResultV1088>={label:null,source:'unavailable',confidence:0,
 startMs:null,endMs:null,nextLabel:null,chapter:'unavailable',reason:'Keine belastbaren Musikdaten'};
const SECTIONS:readonly StructureLabelV1088[]=['verse','hook','build','drop','break'];
const recognized=(s:unknown):s is StructureLabelV1088=>typeof s==='string'&&SECTIONS.includes(s as StructureLabelV1088);
/** A position-only navigation hint; never claim that the intro/finale was detected. */
function chapterOf(positionMs:number,durationMs:number):StructureChapterV1088 {
 const p=positionMs/durationMs;
 return p<.07?'opening':p>.92?'ending':'body';
}
/** Explicit timeline evidence always wins. Audio hypotheses need >=3s of distinct,
 * contiguous measurements and are dropped immediately on pause/seek/stale input.
 */
export function advanceSongStructureV1088(previous:SongStructureStateV1088|null,
 input:SongStructureObservationV1088):SongStructureSnapshotV1088 {
 if(!input||!input.playing||typeof input.trackId!=='string'||!input.trackId||input.trackId.length>160||
  !Number.isInteger(input.durationMs)||input.durationMs<10000||input.durationMs>1800000||
  !valid(input.positionMs,0,input.durationMs-1))return {state:null,result:{...OFF}};
 const {trackId,durationMs,positionMs}=input;
 const chapter=chapterOf(positionMs,durationMs),ev=input.evidence;
 const same=previous?.trackId===trackId&&previous.durationMs===durationMs;
 const dt=same?positionMs-previous.positionMs:null;
 // A seek or a long gap invalidates history even when the track ID did not change.
 const contiguous=same&&dt!==null&&dt>=0&&dt<=1600;
 const init:SongStructureStateV1088={trackId,durationMs,positionMs,candidate:null,
  candidateSinceMs:positionMs,candidateObservations:0,lastAudioPositionMs:-1};
 const state:SongStructureStateV1088=contiguous?{...previous!,positionMs}:init;
 const evidenceValid=!!ev&&ev.source!=='unavailable';
 // The earlier V1018 module validates track, clock, and every timeline boundary.
 if(evidenceValid&&ev.verifiedSection&&recognized(ev.section)&&
    valid(ev.sectionStartMs,0,durationMs-1)&&valid(ev.sectionEndMs,ev.sectionStartMs+1,durationMs)&&
    positionMs>=ev.sectionStartMs&&positionMs<ev.sectionEndMs) {
  return {state:{...init,lastAudioPositionMs:positionMs},result:{label:ev.section,
   source:'verified-timeline',confidence:1,startMs:ev.sectionStartMs,endMs:ev.sectionEndMs,
   nextLabel:recognized(ev.nextSection)?ev.nextSection:null,chapter,
   reason:'Bestätigte, songbezogene Timeline (V604/V1018)'}};
 }
 const audio=!!ev&&ev.measuredAudio&&ev.source!=='unavailable'&&
  valid(ev.energy,0,1)&&valid(ev.bass,0,1)&&valid(ev.trend,-1,1);
 if(!audio)return {state:init,result:{...OFF,chapter}};
 // Duplicate render or stalled Spotify clock must not manufacture persistence.
 if(state.lastAudioPositionMs===positionMs){
  // Preserve the last qualified hypothesis on duplicate React renders, without
  // counting a second measurement or advancing any timers.
  const elapsed=Math.max(0,positionMs-state.candidateSinceMs);
  if(state.candidate&&state.candidateObservations>=4&&elapsed>=3000)return {state,
   result:{label:state.candidate,source:'audio-hypothesis',
    confidence:Math.min(.72,.52+elapsed/30000),startMs:null,endMs:null,nextLabel:null,chapter,
    reason:state.candidate==='build'?'Wahrscheinlicher Aufbau: länger ansteigende Energie und Bass':'Möglicher Break: länger abfallende Energie und Bass'}};
  return {state,result:{...OFF,chapter,reason:'Noch keine neue Audiomessung'}};
 }
 const label: 'build'|'break'|null=ev!.trend!>.15&&ev!.energy!>.37&&ev!.bass!>.18?'build':
  ev!.trend!<-.13&&ev!.energy!<.28&&ev!.bass!<.32?'break':null;
 if(!contiguous||label===null){return {state:{...init,lastAudioPositionMs:positionMs},
  result:{...OFF,chapter,reason:label===null?'Keine eindeutige Audiosignatur':'Warte auf zusammenhängende Messungen'}};}
 const continued=state.candidate===label;
 const candidateSinceMs=continued?state.candidateSinceMs:positionMs;
 const candidateObservations=continued?Math.min(state.candidateObservations+1,10000):1;
 const nextState={...state,candidate:label,candidateSinceMs,candidateObservations,
  lastAudioPositionMs:positionMs};
 const elapsed=positionMs-candidateSinceMs;
 if(elapsed<3000||candidateObservations<4)return {state:nextState,
  result:{...OFF,chapter,reason:'Audiosignatur wird geprüft (mindestens 3 Sekunden)'}};
 return {state:nextState,result:{label,source:'audio-hypothesis',confidence:Math.min(.72,.52+elapsed/30000),
  startMs:null,endMs:null,nextLabel:null,chapter,
  reason:label==='build'?'Wahrscheinlicher Aufbau: länger ansteigende Energie und Bass':'Möglicher Break: länger abfallende Energie und Bass'}};
}
