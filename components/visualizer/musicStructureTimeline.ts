/** V195: bounded, opt-in client-side observations. No Spotify audio or waveform is stored. */
export const MUSIC_STRUCTURE_TIMELINE_EVENT = "sonic:music-structure-timeline";
export type TimelinePhase = "verse" | "build" | "drop" | "break";
export type TimelineEvidence = { energy: number; kick: number; bass: number; anticipation: number; buildScore: number; confidence: number };
export type TimelineObservation = { at: number; avatarId: string; phase: TimelinePhase; motion: string; reason: string; evidence: TimelineEvidence };
export type TimelineSegment = TimelineObservation & { until: number; samples: number };
const bounded = (v:number) => Number.isFinite(v) ? Math.max(0,Math.min(1,v)) : 0;
export function explainTimelineDecision(phase:TimelinePhase, motion:string, evidence:TimelineEvidence):string {
 if(phase==="drop")return `Drop-Indiz: Kick ${Math.round(bounded(evidence.kick)*100)}%, Bass ${Math.round(bounded(evidence.bass)*100)}%; Motion ${motion || "Standard"}`;
 if(phase==="build")return `Build-up-Indiz: Prognose ${Math.round(bounded(evidence.buildScore)*100)}%, Antizipation ${Math.round(bounded(evidence.anticipation)*100)}%`;
 if(phase==="break")return `Ruhiger Abschnitt: Energie ${Math.round(bounded(evidence.energy)*100)}%`;
 return `Verse/Grundphase: Energie ${Math.round(bounded(evidence.energy)*100)}%`;
}
export function appendTimelineObservation(segments:TimelineSegment[], o:TimelineObservation, limit=64):TimelineSegment[] {
 if(!Number.isFinite(o.at)||o.at<0||!o.avatarId)return segments;
 const prev=segments[segments.length-1];
 if(prev && o.at<prev.until)return segments;
 const same=prev && prev.avatarId===o.avatarId && prev.phase===o.phase && prev.motion===o.motion;
 if(same)return [...segments.slice(0,-1),{...prev,until:o.at,samples:prev.samples+1}];
 return [...segments,{...o,until:o.at,samples:1}].slice(-Math.max(1,Math.min(256,Math.floor(limit)||64)));
}
export function normalizeTimelineEvidence(e:TimelineEvidence):TimelineEvidence{return {energy:bounded(e.energy),kick:bounded(e.kick),bass:bounded(e.bass),anticipation:bounded(e.anticipation),buildScore:bounded(e.buildScore),confidence:bounded(e.confidence)};}
export function publishTimelineObservation(data:TimelineObservation):void {
 if(typeof window==="undefined")return;
 window.dispatchEvent(new CustomEvent<TimelineObservation>(MUSIC_STRUCTURE_TIMELINE_EVENT,{detail:data}));
}
