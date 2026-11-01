/** V661: An optional, local, song-bound timing aid derived from user-declared
 * ISOLATED vocal PCM using the existing V643 80-ms analysis. No microphone,
 * Spotify PCM, speaker identification, transcription, phoneme or true syllable
 * recognition. The user explicitly opts in to a small additive jaw cue.
 */
import {normalizeVocalStemV643,type VocalStemDocumentV643} from './vocalStemAnalysisV643';

export type VocalPulseV661={atMs:number;energy:number;onset:number};
export type VocalPauseV661={startMs:number;endMs:number};
export type VocalTimingReviewV661={
 trackId:string;slot:number;durationMs:number;
 phrases:number;estimatedOnsetCandidates:VocalPulseV661[];
 pauses:VocalPauseV661[];
 activePercent:number;clippingPercent:number;
 warnings:string[];
};
const clamp=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
/** Each pulse is a *candidate* transient, NEVER a measured syllable or phoneme.
 * Refractory period and threshold suppress consecutive peaks in one vowel.
 */
export function inspectVocalStemV661(raw:VocalStemDocumentV643|null|undefined,trackId:string,durationMs:number):VocalTimingReviewV661|null{
 const doc=normalizeVocalStemV643(raw,trackId,durationMs);
 if(!doc)return null;
 const hop=doc.hopMs;
 const energyGate=18;
 const candidates:VocalPulseV661[]=[];
 let lastPulse=-500;
 let phraseAt=0;
 for(let i=1;i<doc.points.length-1;i++){
  const [energy,onset]=doc.points[i];
  // Only examine frames inside a source-detected phrase; no false silence hits.
  const atMs=i*hop;
  if(energy<energyGate||onset<18||onset<doc.points[i-1][1]||onset<doc.points[i+1][1]||atMs-lastPulse<160)continue;
  while(phraseAt<doc.phrases.length&&doc.phrases[phraseAt].endMs<=atMs)phraseAt++;
  const phrase=doc.phrases[phraseAt];
  if(!phrase||atMs<phrase.startMs)continue;
  if(candidates.length>=1600)break;
  candidates.push({atMs,energy:energy/100,onset:onset/100});lastPulse=atMs;
 }
 const pauses:VocalPauseV661[]=[];
 let previous=0;
 for(const phrase of doc.phrases){
  if(phrase.startMs-previous>=240)pauses.push({startMs:previous,endMs:phrase.startMs});
  previous=phrase.endMs;
 }
 if(doc.durationMs-previous>=240)pauses.push({startMs:previous,endMs:doc.durationMs});
 const warnings:string[]=[];
 if(doc.stats.clippingPercent>=3)warnings.push('Signal ist möglicherweise übersteuert.');
 if(doc.stats.activityPercent<4)warnings.push('Sehr wenig Aktivität: Timing-Vorschläge möglicherweise unbrauchbar.');
 if(doc.stats.activityPercent>94)warnings.push('Fast ununterbrochen aktiv: möglicherweise keine isolierte Stimme.');
 if(doc.phrases.length===0)warnings.push('Keine ausreichend langen Signalphrasen erkannt.');
 return {trackId:doc.trackId,slot:doc.slot,durationMs:doc.durationMs,phrases:doc.phrases.length,
  estimatedOnsetCandidates:candidates,pauses,activePercent:doc.stats.activityPercent,
  clippingPercent:doc.stats.clippingPercent,warnings};
}

// One bounded, in-memory, explicitly enabled session. Closing Settings does
// not disable it. Changing the song or removing the stem does.
let active:{trackId:string;durationMs:number;bySlot:Map<number,VocalStemDocumentV643>}|null=null;
export function setLiveVocalEnvelopeV661(stems:readonly VocalStemDocumentV643[],trackId:string,durationMs:number):boolean{
 if(!trackId||!Number.isFinite(durationMs)||stems.length<1||stems.length>4)return false;
 const bySlot=new Map<number,VocalStemDocumentV643>();
 for(const stem of stems){
  const valid=normalizeVocalStemV643(stem,trackId,durationMs);
  if(!valid||bySlot.has(valid.slot))return false;
  bySlot.set(valid.slot,valid);
 }
 active={trackId,durationMs,bySlot};return true;
}
export function clearLiveVocalEnvelopeV661(){active=null;}
export function clearVocalEnvelopeOnTrackChangeV661(trackId:string){
 if(active?.trackId!==trackId)active=null;
}
export function getLiveVocalEnvelopeV661(){return active?{trackId:active.trackId,slots:[...active.bySlot.keys()]}:null;}
export function sampleLiveVocalEnvelopeV661(trackId:string,slot:number,timeMs:number,playing:boolean):{energy:number;onset:number}|null{
 if(!playing||!active||active.trackId!==trackId||!Number.isInteger(slot)||slot<0||slot>3||
  !Number.isFinite(timeMs)||timeMs<0||timeMs>=active.durationMs)return null;
 const stem=active.bySlot.get(slot);if(!stem)return null;
 const frame=stem.points[Math.floor(timeMs/stem.hopMs)];if(!frame)return null;
 // The phrase gate prevents instrument/mix energy leaking into inactive intervals.
 let left=0,right=stem.phrases.length-1,found=false;
 while(left<=right){
  const mid=(left+right)>>>1,p=stem.phrases[mid];
  if(timeMs<p.startMs)right=mid-1;
  else if(timeMs>=p.endMs)left=mid+1;
  else{found=true;break;}
 }
 if(!found)return null;
 return {energy:clamp(frame[0]/100),onset:clamp(frame[1]/100)};
}
/** Additive only; deliberately cannot create an unverified speaking mouth.
 * The caller must enforce manual-viseme, authored-key and singer priority.
 */
export function refineVocalJawV661(baseJaw:number,closed:number,signal:{energy:number;onset:number}|null):number{
 if(!signal)return clamp(baseJaw);
 const headroom=1-clamp(closed)*.985;
 const boost=clamp(signal.energy)*.075+clamp(signal.onset)*.025;
 return Math.min(headroom,clamp(baseJaw)+boost*(1-clamp(closed)));
}
