/** V318: provider-neutral, fully local track-analysis model. No Spotify private API calls. */
export type SongSectionV318 = 'verse' | 'hook' | 'build' | 'drop' | 'break';
export type AnalysisMarkerV318 = {startMs:number; durationMs:number; confidence:number};
export type AnalysisSectionV318 = AnalysisMarkerV318 & {label?:SongSectionV318};
export type TrackAnalysisV318 = {
  schema:'sonic-track-analysis-v318'; trackId:string; source:string; durationMs:number;
  tempo:number|null; timeSignature:number;
  beats:AnalysisMarkerV318[]; bars:AnalysisMarkerV318[];
  sections:AnalysisSectionV318[]; importedAt:number;
};
export type TrackAnalysisProviderV318 = {
  id:string; priority:number;
  load:(trackId:string)=>Promise<TrackAnalysisV318|null>;
};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
const record=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const sectionNames=new Set(['verse','hook','build','drop','break']);
function label(v:unknown):SongSectionV318|undefined {
  return typeof v==='string'&&sectionNames.has(v.toLowerCase())?v.toLowerCase() as SongSectionV318:undefined;
}
const secondsToMs=(v:unknown)=>finite(v)?Math.round(v*1000):NaN;
function parseMarkers(value:unknown,maxEntries:number,fromSeconds:boolean,durationMs:number,allowLabels=false):(AnalysisMarkerV318|AnalysisSectionV318)[] {
  if(!Array.isArray(value))return [];
  const data:(AnalysisMarkerV318|AnalysisSectionV318)[]=[];
  for(const raw of value.slice(0,maxEntries*2)) {
    const item=record(raw), start=fromSeconds?secondsToMs(item.start):item.startMs;
    if(!finite(start)||start<0||start>durationMs+5000)continue;
    const length=fromSeconds?secondsToMs(item.duration):item.durationMs;
    const confidence=finite(item.confidence)?clamp(item.confidence,0,1):1;
    const m:AnalysisSectionV318={startMs:Math.round(start),durationMs:finite(length)?clamp(Math.round(length),0,durationMs):0,confidence};
    if(allowLabels)m.label=label(item.label??item.section??item.type);
    data.push(m);
    if(data.length>=maxEntries)break;
  }
  data.sort((a,b)=>a.startMs-b.startMs);
  return data.filter((m,i)=>i===0||m.startMs>data[i-1].startMs);
}
/** Accepts authorized Spotify-style JSON (seconds) or Sonic Display normalized JSON (milliseconds).
 * Never assumes Spotify audio-analysis sections have 'drop' or 'hook' labels.
 */
export function normalizeTrackAnalysisV318(raw:unknown,selectedTrackId:string,knownDurationMs=0,source='json-import'):TrackAnalysisV318 {
  const outer=record(raw);
  const r=Array.isArray(outer.beats)||Array.isArray(outer.bars)||Array.isArray(outer.sections)||outer.schema==='sonic-track-analysis-v318'
    ?outer:record(outer.audio_analysis??outer.audioAnalysis??outer.analysis??outer.data);
  if(!selectedTrackId||selectedTrackId.length>200)throw Error('Keine gültige Track-ID.');
  const identity=typeof outer.trackId==='string'?outer.trackId:typeof r.trackId==='string'?r.trackId:
    typeof record(r.track).id==='string'?record(r.track).id as string:undefined;
  if(identity&&identity!==selectedTrackId)throw Error('Die Analyse gehört zu einem anderen Track.');
  const normalized=r.schema==='sonic-track-analysis-v318';
  const track=record(r.track);
  const embeddedDuration=normalized?r.durationMs:finite(track.duration)?track.duration*1000:undefined;
  const durationMs=clamp(finite(knownDurationMs)&&knownDurationMs>0?knownDurationMs:finite(embeddedDuration)?embeddedDuration:15*60*1000,1000,2*60*60*1000);
  const rawTempo=normalized?r.tempo:track.tempo??r.tempo;
  const tempo=finite(rawTempo)&&rawTempo>=40&&rawTempo<=260?rawTempo:null;
  const rawMeter=normalized?r.timeSignature:track.time_signature??r.time_signature;
  const timeSignature=finite(rawMeter)&&rawMeter>=1&&rawMeter<=12?Math.round(rawMeter):4;
  const beats=parseMarkers(r.beats,4500,!normalized,durationMs) as AnalysisMarkerV318[];
  const bars=parseMarkers(r.bars,1400,!normalized,durationMs) as AnalysisMarkerV318[];
  const sections=parseMarkers(r.sections,160,!normalized,durationMs,true) as AnalysisSectionV318[];
  if(!beats.length&&!bars.length&&!sections.length&&tempo===null)throw Error('Keine auswertbaren Beats, Takte, Abschnitte oder BPM gefunden.');
  return {schema:'sonic-track-analysis-v318',trackId:selectedTrackId,source:source.slice(0,60),durationMs,
    tempo,timeSignature,beats,bars,sections,importedAt:normalized && finite(r.importedAt)?r.importedAt:Date.now()};
}
export function upperBoundMarkerV318(markers:readonly AnalysisMarkerV318[],at:number):number {
  let l=0,h=markers.length;
  while(l<h){const m=(l+h)>>>1;if(markers[m].startMs<=at)l=m+1;else h=m;}
  return l;
}
export type TimelineInputV318={trackId:string;progressMs:number;playing:boolean;liveSection:SongSectionV318;liveBpm?:number|null};
export type TimelineCueV318={trackId:string;source:'imported'|'live';section:SongSectionV318;sectionStartMs:number|null;
  sectionBoundaryMs:number|null;tempo:number|null;barIndex:number|null;beatIndex:number|null;phraseSlot:number|null;
  nextBeatMs:number|null;nextBarMs:number|null;confidence:number;hasSectionLabels:boolean};
export function resolveTimelineV318(x:TimelineInputV318,analysis:TrackAnalysisV318|null):TimelineCueV318 {
  const at=finite(x.progressMs)?Math.max(0,x.progressMs):0;
  const imported=Boolean(analysis&&analysis.trackId===x.trackId);
  const doc=imported?analysis:null;
  const tempo=doc?.tempo??(finite(x.liveBpm)&&x.liveBpm>=40&&x.liveBpm<=260?x.liveBpm:null);
  const beatEnd=doc?upperBoundMarkerV318(doc.beats,at):0;
  const barEnd=doc?upperBoundMarkerV318(doc.bars,at):0;
  const sectionEnd=doc?upperBoundMarkerV318(doc.sections,at):0;
  const sec=sectionEnd&&doc?doc.sections[sectionEnd-1]:undefined;
  const labeled=sec?.label && sec.confidence>=.5?sec.label:undefined;
  const beatIndex=doc?.beats.length?beatEnd-1:null;
  const barIndex=doc?.bars.length?barEnd-1:null;
  const nextBeatMs=doc?.beats[beatEnd]?.startMs??null;
  const nextBarMs=doc?.bars[barEnd]?.startMs??null;
  // Fallback BPM grid is intentionally not passed off as detected song timing.
  const phraseSlot=barIndex!==null?Math.max(0,Math.floor(barIndex/4)):
    beatIndex!==null?Math.max(0,Math.floor(beatIndex/(doc?.timeSignature??4)/4)):null;
  return {trackId:x.trackId,source:imported?'imported':'live',section:labeled??x.liveSection,
    sectionStartMs:labeled?sec!.startMs:null,sectionBoundaryMs:sec?.startMs??null,
    tempo,barIndex,beatIndex,phraseSlot,nextBeatMs,nextBarMs,
    confidence:labeled?sec!.confidence:imported?(beatIndex!==null||barIndex!==null ? .9 : .55):0,
    hasSectionLabels:Boolean(labeled)};
}
export const ANALYSIS_STORAGE_KEY_V318='sonic-track-analyses-v318';
export const ANALYSIS_EVENT_V318='sonic-track-analyses-v318-change';
/** Track-scoped, bounded, opt-in browser cache. No tokens, external requests or persisted audio. */
export function readTrackAnalysisV318(trackId:string):TrackAnalysisV318|null {
  if(!trackId||typeof window==='undefined')return null;
  try{
    const items=JSON.parse(window.localStorage.getItem(ANALYSIS_STORAGE_KEY_V318)||'[]') as unknown;
    if(!Array.isArray(items))return null;
    const match=items.find(v=>record(v).trackId===trackId);
    if(!match)return null;
    return normalizeTrackAnalysisV318(match,trackId,0,typeof record(match).source==='string'?record(match).source as string:'json-import');
  }catch{return null;}
}
export function writeTrackAnalysisV318(analysis:TrackAnalysisV318|null,trackId:string):void {
  if(typeof window==='undefined'||!trackId)return;
  try{
    const existing=JSON.parse(window.localStorage.getItem(ANALYSIS_STORAGE_KEY_V318)||'[]') as unknown;
    const entries=Array.isArray(existing)?existing.filter(v=>record(v).trackId!==trackId):[];
    if(analysis){if(analysis.trackId!==trackId)throw Error('Track-ID stimmt nicht überein.');entries.unshift(analysis);}
    window.localStorage.setItem(ANALYSIS_STORAGE_KEY_V318,JSON.stringify(entries.slice(0,3)));
    window.dispatchEvent(new Event(ANALYSIS_EVENT_V318));
  }catch(e){throw e instanceof Error?e:Error('Die Analyse konnte nicht gespeichert werden.');}
}
/** Provider interface ready for properly authorized future sources; currently only local imports.
 * Isolation: a failing provider must not interrupt the existing live analysis.
 */
export async function loadFromProvidersV318(trackId:string,providers:readonly TrackAnalysisProviderV318[]):Promise<TrackAnalysisV318|null>{
  for(const p of [...providers].sort((a,b)=>b.priority-a.priority)){
    try{const candidate=await p.load(trackId);if(candidate?.trackId===trackId)return candidate;}catch{/* fallback */}
  }
  return null;
}
export const localImportProviderV318:TrackAnalysisProviderV318={id:'local-json',priority:100,load:async trackId=>readTrackAnalysisV318(trackId)};
