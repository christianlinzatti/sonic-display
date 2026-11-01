/** V765 – validated concert-show library tools; never mutates the live V354 slot.
 * Imports are previewed, bounded and committed only on explicit confirmation.
 */
import {
  CONCERT_LIBRARY_KEY_V764, MAX_CONCERT_SONGS_V764,
  parseConcertLibraryV764, readConcertLibraryV764, writeConcertLibraryV764,
  type ConcertLibraryV764,
} from './concertTimelineAutomationV764';
import type {ShowTimelineV354} from './showTimelineV354';

export const MAX_CONCERT_IMPORT_BYTES_V765 = 4_000_000;
export type ConcertImportModeV765 = 'skip' | 'replace';
export type ConcertSortV765 = 'name' | 'cues' | 'duration';
export type ConcertImportErrorV765 = 'invalid-file' | 'library-unavailable' | 'stale-preview' |
  'capacity-exceeded' | 'no-changes' | 'write-failed';
export interface ConcertImportPreviewV765 {
  valid: boolean;
  reason: ConcertImportErrorV765 | null;
  incoming: number;
  newEntries: number;
  conflicts: number;
  unchanged: number;
  wouldReplace: number;
  wouldSkip: number;
  availableSlots: number;
  entries: readonly {trackId:string; name:string; clips:number; conflict:boolean; identical:boolean}[];
  baseline: string;
}
export interface ConcertImportResultV765 {
  ok:boolean; reason:ConcertImportErrorV765|null;
  added:number; replaced:number; skipped:number;
}
const fail = (reason:ConcertImportErrorV765):ConcertImportResultV765 =>
  ({ok:false,reason,added:0,replaced:0,skipped:0});
const isLibrary = (value:ConcertLibraryV764|null):value is ConcertLibraryV764 => value!==null;
const sameSong = (a:ShowTimelineV354,b:ShowTimelineV354) => JSON.stringify(a)===JSON.stringify(b);
/** Exported JSON has the V764 portable-library schema. Never imports autoLoad=true. */
export function readConcertImportV765(raw:unknown):ConcertLibraryV764|null {
  let candidate:unknown = raw;
  if(typeof raw==='string'){
    if(raw.length>MAX_CONCERT_IMPORT_BYTES_V765)return null;
    try{candidate=JSON.parse(raw);}catch{return null;}
  }
  try{
    if(JSON.stringify(candidate).length>MAX_CONCERT_IMPORT_BYTES_V765)return null;
  }catch{return null;}
  const library=parseConcertLibraryV764(candidate);
  if(!library||library.entries.length===0)return null;
  return {...library,autoLoad:false};
}
export function searchConcertSongsV765(library:ConcertLibraryV764|null, search:string,sort:ConcertSortV765='name'):ShowTimelineV354[]{
  if(!library)return [];
  const q=search.trim().slice(0,160).toLocaleLowerCase();
  return library.entries.filter(song=>`${song.name} ${song.trackId}`.toLocaleLowerCase().includes(q))
   .slice().sort((a,b)=>sort==='cues'?b.clips.length-a.clips.length||a.name.localeCompare(b.name):
    sort==='duration'?b.durationMs-a.durationMs||a.name.localeCompare(b.name):
    a.name.localeCompare(b.name)||a.trackId.localeCompare(b.trackId));
}
function projectMerge(current:ConcertLibraryV764, incoming:ConcertLibraryV764, mode:ConcertImportModeV765){
  const entries=current.entries.slice();let added=0,replaced=0,skipped=0;
  for(const song of incoming.entries){
    const i=entries.findIndex(e=>e.trackId===song.trackId);
    if(i<0){entries.push(song);added++;}
    else if(sameSong(entries[i],song)||mode==='skip')skipped++;
    else{entries[i]=song;replaced++;}
  }
  return {lib:{version:1 as const,autoLoad:current.autoLoad,entries},added,replaced,skipped,
    over:entries.length>MAX_CONCERT_SONGS_V764};
}
export function previewConcertImportV765(raw:unknown,current:ConcertLibraryV764|null,
 mode:ConcertImportModeV765):ConcertImportPreviewV765 {
  const baseline=current?JSON.stringify(current):'';
  const unavailable=!isLibrary(current);
  const incoming=readConcertImportV765(raw);
  const entries=incoming&&current?incoming.entries.map(song=>{
    const other=current.entries.find(e=>e.trackId===song.trackId);
    return {trackId:song.trackId,name:song.name,clips:song.clips.length,conflict:!!other,
      identical:!!other&&sameSong(other,song)};
  }):[];
  const newEntries=entries.filter(e=>!e.conflict).length;
  const conflicts=entries.filter(e=>e.conflict&&!e.identical).length;
  const unchanged=entries.filter(e=>e.identical).length;
  const over=!!current&&current.entries.length+newEntries>MAX_CONCERT_SONGS_V764;
  const reason:ConcertImportErrorV765|null=unavailable?'library-unavailable':!incoming?'invalid-file':
    over?'capacity-exceeded':null;
  return {valid:reason===null,reason,incoming:entries.length,newEntries,conflicts,unchanged,
    wouldReplace:mode==='replace'?conflicts:0,
    wouldSkip:unchanged+(mode==='skip'?conflicts:0),
    availableSlots:current?MAX_CONCERT_SONGS_V764-current.entries.length:0,
    entries,baseline};
}
/** Never trust a cached preview if any local data changed after inspection. */
export function importConcertLibraryV765(raw:unknown,mode:ConcertImportModeV765,
 expectedBaseline:string):ConcertImportResultV765 {
  if(mode!=='skip'&&mode!=='replace')return fail('invalid-file');
  const current=readConcertLibraryV764();if(!current)return fail('library-unavailable');
  if(JSON.stringify(current)!==expectedBaseline)return fail('stale-preview');
  const preview=previewConcertImportV765(raw,current,mode);
  if(!preview.valid)return fail(preview.reason||'invalid-file');
  const incoming=readConcertImportV765(raw);if(!incoming)return fail('invalid-file');
  const merged=projectMerge(current,incoming,mode);
  if(merged.over)return fail('capacity-exceeded');
  if(!merged.added&&!merged.replaced)return {ok:true,reason:'no-changes',added:0,replaced:0,skipped:merged.skipped};
  if(!writeConcertLibraryV764(merged.lib))return fail('write-failed');
  const saved=readConcertLibraryV764();
  if(!saved||JSON.stringify(saved)!==JSON.stringify(merged.lib))return fail('write-failed');
  return {ok:true,reason:null,added:merged.added,replaced:merged.replaced,skipped:merged.skipped};
}
/** Rename only the selected library entry; existing V354 live editing is untouched. */
export function renameConcertSongV765(trackId:string,name:string,expectedName:string):boolean {
  if(typeof name!=='string'||typeof trackId!=='string'||typeof expectedName!=='string')return false;
  const clean=name.trim();if(!clean||clean.length>60)return false;
  const current=readConcertLibraryV764();if(!current)return false;
  const existing=current.entries.find(e=>e.trackId===trackId);
  if(!existing||existing.name!==expectedName)return false;
  if(clean===existing.name)return true;
  const updated={...current,entries:current.entries.map(e=>e.trackId===trackId?{...e,name:clean}:e)};
  if(!writeConcertLibraryV764(updated))return false;
  return readConcertLibraryV764()?.entries.find(e=>e.trackId===trackId)?.name===clean;
}
export function exportConcertSongV765(trackId:string,library:ConcertLibraryV764|null):string|null {
  if(!library)return null;
  const song=library.entries.find(e=>e.trackId===trackId);
  if(!song)return null;
  return JSON.stringify({version:1,autoLoad:false,entries:[song]},null,2);
}
/** Keep the v764 persistent storage key stable for compatibility with the portable backup. */
export const CONCERT_LIBRARY_STORAGE_V765=CONCERT_LIBRARY_KEY_V764;
