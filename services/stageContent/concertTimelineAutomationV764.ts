/** V764 – review-only suggestions and bounded, local multi-song library.
 * The ONLY playback owner is the pre-existing V354 timeline. No invented audio
 * analysis, artist identity, beat timestamps, camera or light renderers. */
import {DEFAULT_TIMELINE_V354,SHOW_TIMELINE_KEY_V354,
 readTimelineV354,saveTimelineV354,sanitizeTimelineV354,
 type ShowLaneV354,type ShowTimelineV354,type ShowClipV354,type ShowValueV354} from './showTimelineV354';
import type {ConcertTimelineSnapshotV763} from '../../components/visualizer/concertTimelineBridgeV763';

export const CONCERT_LIBRARY_KEY_V764='sonic-concert-song-library-v764';
export const CONCERT_LIBRARY_EVENT_V764='sonic:concert-song-library-v764';
export const MAX_CONCERT_SONGS_V764=32;
export interface ConcertLibraryV764{version:1;autoLoad:boolean;entries:ShowTimelineV354[]}
export interface SuggestedCueV764{clip:ShowClipV354;section:string;intent:string;reason:string}
export interface ApplySuggestionsResultV764{score:ShowTimelineV354;applied:number;conflicts:number;invalid:number}
const validId=(id:unknown):id is string=>typeof id==='string'&&id.length>0&&id.length<=160&&id.trim()===id;
const overlap=(a:Pick<ShowClipV354,'startMs'|'durationMs'>,b:Pick<ShowClipV354,'startMs'|'durationMs'>)=>a.startMs<b.startMs+b.durationMs&&b.startMs<a.startMs+a.durationMs;
const supported=new Set(['portrait','dialogue','ensemble','wide','rise','pulse','breath']);
const sections=new Set(['verse','hook','build','drop','break']);
function draftCue(scene:ConcertTimelineSnapshotV763['scenes'][number],lane:ShowLaneV354,trackMs:number):SuggestedCueV764{
 const palettes:{[key:string]:[string,number,string,string]}={
  portrait:['close',1,'Porträt-Kamera','Sänger-Fokus (ohne Erkennung der Stimme)'],
  dialogue:['medium',1,'Halbtotale','Dialogartige Kameraperspektive'],
  ensemble:['wide',1,'Gruppenbild','Gruppenansicht'],
  wide:['wide',1,'Weite Bühne','Übersicht über die Gruppe'],
  rise:['medium',1,'Aufbau','Ruhiger Aufbau'],
  pulse:['wide',1,'Drop','Weitwinkel für den Drop'],
  breath:['wide',1,'Ruhephase','Kamera beruhigen']};
 const camera=palettes[scene.intent]||palettes.wide;
 const action:ShowValueV354=lane==='camera'?camera[0]:lane==='lighting'?
  (scene.section==='drop'?1.35:scene.section==='hook'?1.2:scene.section==='break'?.7:scene.section==='build'?1.12:.9):
  lane==='dance'?(scene.section==='hook'||scene.intent==='ensemble'?'sync':scene.intent==='dialogue'?'duet':'solo'):
  lane==='lyrics'?'focus':1;
 const length=Math.max(250,Math.min(8000,scene.endMs-scene.startMs,trackMs-scene.startMs));
 return {clip:{id:`v764-${scene.index}-${lane}`,lane,startMs:scene.startMs,durationMs:length,
  value:action,label:`${scene.section}: ${lane}`},section:scene.section,intent:scene.intent,
  reason:lane==='camera'?camera[3]:lane==='lighting'?'Lichtintensität aus bestätigtem Abschnitt':
   lane==='dance'?'Gruppenrolle passend zum Abschnitt':'Lyrics-Fokus zur bestätigten Hook'};
}
/** Deterministic; safe only for scenes published from V604 via V761. */
export function proposeConcertCuesV764(snapshot:ConcertTimelineSnapshotV763|null):SuggestedCueV764[]{
 if(!snapshot||snapshot.source!=='verified-v604'||!validId(snapshot.trackId)||
  !Number.isFinite(snapshot.durationMs)||snapshot.durationMs<10000||snapshot.durationMs>1800000||
  !Array.isArray(snapshot.scenes)||snapshot.scenes.length===0||snapshot.scenes.length>480)return [];
 const out:SuggestedCueV764[]=[];let lastEnd=0;
 for(let i=0;i<snapshot.scenes.length;i++){
  const scene=snapshot.scenes[i];
  if(scene.index!==i||!supported.has(scene.intent)||!sections.has(scene.section)||
   !Number.isFinite(scene.startMs)||!Number.isFinite(scene.endMs)||
   scene.startMs<lastEnd||scene.startMs<0||scene.endMs<=scene.startMs||scene.endMs>snapshot.durationMs)return [];
  lastEnd=scene.endMs;
  if(out.length>=120)break;
  out.push(draftCue(scene,'camera',snapshot.durationMs));
  if(out.length<120)out.push(draftCue(scene,'lighting',snapshot.durationMs));
  if((scene.section==='hook'||scene.section==='drop'||scene.intent==='ensemble')&&out.length<120)
   out.push(draftCue(scene,'dance',snapshot.durationMs));
  if(scene.section==='hook'&&out.length<120)out.push(draftCue(scene,'lyrics',snapshot.durationMs));
 }
 return out;
}
export function applyConcertSuggestionsV764(score:ShowTimelineV354,snapshot:ConcertTimelineSnapshotV763|null,
 selected:readonly string[],overrides:Readonly<Record<string,ShowValueV354>>={}):ApplySuggestionsResultV764{
 const clean=sanitizeTimelineV354(score),proposed=proposeConcertCuesV764(snapshot);
 if(!snapshot||clean.trackId!==snapshot.trackId||clean.durationMs!==snapshot.durationMs||selected.length>120)
  return {score:clean,applied:0,conflicts:0,invalid:selected.length};
 const all=new Map(proposed.map(p=>[p.clip.id,p]));const ids=new Set(selected);
 const next=[...clean.clips];let applied=0,conflicts=0,invalid=0;
 for(const id of ids){
  const candidate=all.get(id);if(!candidate){invalid++;continue;}
  if(next.length>=400||next.some(c=>c.id===id||c.lane===candidate.clip.lane&&overlap(c,candidate.clip))){conflicts++;continue;}
  // Reuse V354's exact normalizer; the user may edit a proposed action, never its identity or lane.
  const patch=Object.prototype.hasOwnProperty.call(overrides,id)?overrides[id]:candidate.clip.value;
  const sanitized=sanitizeTimelineV354({...clean,clips:[{...candidate.clip,value:patch}]}).clips[0];
  if(!sanitized){invalid++;continue;}
  next.push(sanitized);applied++;
 }
 return {score:sanitizeTimelineV354({...clean,clips:next}),applied,conflicts,invalid};
}
const empty=():ConcertLibraryV764=>({version:1,autoLoad:false,entries:[]});
export function parseConcertLibraryV764(raw:unknown):ConcertLibraryV764|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const data=raw as Partial<ConcertLibraryV764>;
 if(data.version!==1||typeof data.autoLoad!=='boolean'||!Array.isArray(data.entries)||data.entries.length>MAX_CONCERT_SONGS_V764)return null;
 const entries:ShowTimelineV354[]=[],ids=new Set<string>();
 for(const entry of data.entries){
  if(!entry||entry.version!==1||typeof entry.enabled!=='boolean'||typeof entry.name!=='string'||
   !validId(entry.trackId)||!Number.isFinite(entry.durationMs)||
   entry.durationMs<10000||entry.durationMs>1800000||!Array.isArray(entry.clips)||entry.clips.length>400||ids.has(entry.trackId))return null;
  const safe=sanitizeTimelineV354(entry);
  if(safe.trackId!==entry.trackId||safe.durationMs!==entry.durationMs||safe.clips.length!==entry.clips.length)return null;
  ids.add(safe.trackId);entries.push(safe);
 }
 return {version:1,autoLoad:data.autoLoad,entries};
}
/** null means CORRUPTED or unsupported data; never silently overwrite it. */
export function readConcertLibraryV764():ConcertLibraryV764|null{
 if(typeof window==='undefined')return empty();
 try{const value=window.localStorage.getItem(CONCERT_LIBRARY_KEY_V764);
  return value===null?empty():parseConcertLibraryV764(JSON.parse(value));}
 catch{return null;}
}
export function writeConcertLibraryV764(data:ConcertLibraryV764):boolean{
 if(typeof window==='undefined')return false;
 const safe=parseConcertLibraryV764(data);if(!safe)return false;
 try{window.localStorage.setItem(CONCERT_LIBRARY_KEY_V764,JSON.stringify(safe));
  window.dispatchEvent(new Event(CONCERT_LIBRARY_EVENT_V764));return true;
 }catch{return false;}
}
export function putConcertSongV764(raw:ShowTimelineV354):boolean{
 const lib=readConcertLibraryV764();if(!lib||!validId(raw.trackId)||!Array.isArray(raw.clips)||raw.clips.length>400)return false;
 const score=sanitizeTimelineV354(raw);if(score.trackId!==raw.trackId||score.durationMs!==raw.durationMs||score.clips.length!==raw.clips.length)return false;
 const idx=lib.entries.findIndex(e=>e.trackId===score.trackId);
 if(idx<0&&lib.entries.length>=MAX_CONCERT_SONGS_V764)return false;
 const entries=lib.entries.slice();if(idx>=0)entries[idx]=score;else entries.push(score);
 return writeConcertLibraryV764({...lib,entries});
}
export function deleteConcertSongV764(trackId:string):boolean{
 const lib=readConcertLibraryV764();if(!lib||!lib.entries.some(e=>e.trackId===trackId))return false;
 return writeConcertLibraryV764({...lib,entries:lib.entries.filter(e=>e.trackId!==trackId)});
}
export function setConcertAutoLoadV764(enabled:boolean):boolean{
 const lib=readConcertLibraryV764();return !!lib&&writeConcertLibraryV764({...lib,autoLoad:enabled});
}
export type LoadResultV764='disabled'|'missing'|'already'|'loaded'|'storage-error'|'corrupt';
/** The legacy V354 writer catches storage exceptions; verify before reporting success. */
const commitV354=(candidate:ShowTimelineV354):boolean=>{
 const intended=sanitizeTimelineV354(candidate);saveTimelineV354(intended);
 return JSON.stringify(readTimelineV354())===JSON.stringify(intended);
};
/** Called on a real track change, outside React render. Opt-in only; safeguard V354 before swapping. */
export function autoLoadConcertSongV764(trackId:string|null|undefined):LoadResultV764{
 if(!validId(trackId))return 'missing';
 const lib=readConcertLibraryV764();if(!lib)return 'corrupt';if(!lib.autoLoad)return 'disabled';
 const candidate=lib.entries.find(e=>e.trackId===trackId);if(!candidate)return 'missing';
 const existing=readTimelineV354();if(existing.trackId===trackId)return 'already';
 // The V354 slot may contain edits done outside this panel. Never drop them on a song change.
 if(validId(existing.trackId)&&!putConcertSongV764(existing))return 'storage-error';
 return commitV354(candidate)?'loaded':'storage-error';
}
/** Explicit restore. Caller must request confirmation when replacing the active V354 slot. */
export function loadConcertSongV764(trackId:string):LoadResultV764{
 const lib=readConcertLibraryV764();if(!lib)return 'corrupt';
 const candidate=lib.entries.find(e=>e.trackId===trackId);if(!candidate)return 'missing';
 const active=readTimelineV354();if(active.trackId!==trackId&&validId(active.trackId)&&!putConcertSongV764(active))return 'storage-error';
 return commitV354(candidate)?'loaded':'storage-error';
}
/** Start a new song without abandoning an occupied V354 slot. No old song is overwritten in the library. */
export function createConcertSongV764(trackId:string,durationMs:number):boolean{
 if(!validId(trackId)||!Number.isInteger(durationMs)||durationMs<10000||durationMs>1800000)return false;
 const existing=readTimelineV354();if(validId(existing.trackId)&&!putConcertSongV764(existing))return false;
 return commitV354({...DEFAULT_TIMELINE_V354,name:'Konzertregie',trackId,durationMs,clips:[]});
}
