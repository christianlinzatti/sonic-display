import type {RecentTrackV672} from './recently-played-v672';

/** A deliberately opt-in, account-isolated, device-local archive. No Spotify tokens, audio or lyrics. */
export const V701_ARCHIVE_FORMAT='sonic-display-personal-history-v701';
export const V701_STORAGE_PREFIX='sonic-display:personal-history:v701:';
export const V701_MAX_EVENTS=5000;
export const V701_MAX_JSON_CHARS=3_500_000;
export type V701Archive={format:typeof V701_ARCHIVE_FORMAT;version:1;owner:string;savedAt:string;events:RecentTrackV672[]};
export type V701Storage={getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void};
export type V701Read={archive:V701Archive|null;error:string|null};
const validOwner=(v:unknown):v is string=>typeof v==='string'&&/^[A-Za-z0-9._-]{1,128}$/.test(v);
export const validArchiveOwnerV701=validOwner;
export const archiveKeyV701=(owner:string)=>`${V701_STORAGE_PREFIX}${encodeURIComponent(owner)}`;
const obj=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown,max:number):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[\u0000-\u001F\u007F]/.test(v);
const iso=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v;
function validEventV701(value:unknown,nowMs:number):RecentTrackV672|null{
 if(!obj(value)||typeof value.id!=='string'||!/^[A-Za-z0-9]{22}$/.test(value.id)||!text(value.title,400)||!text(value.artist,400)||!text(value.album,400))return null;
 if(!iso(value.playedAt)||Date.parse(value.playedAt)<946684800000||Date.parse(value.playedAt)>nowMs+60000)return null;
 if(typeof value.durationMs!=='number'||!Number.isSafeInteger(value.durationMs)||value.durationMs<0||value.durationMs>86400000)return null;
 if(value.primaryArtist!==undefined&&(typeof value.primaryArtist!=='string'||value.primaryArtist.length>400))return null;
 const cover=value.albumCoverUrl;
 if(cover!==null&&cover!==undefined){
  if(typeof cover!=='string'||cover.length>2048)return null;
  try{const url=new URL(cover);if(url.protocol!=='https:'||!(url.hostname==='i.scdn.co'||url.hostname.endsWith('.scdn.co')))return null;}catch{return null;}
 }
 return {id:value.id,title:value.title,artist:value.artist,primaryArtist:typeof value.primaryArtist==='string'?value.primaryArtist:undefined,album:value.album,albumCoverUrl:typeof cover==='string'?cover:null,spotifyUrl:`https://open.spotify.com/track/${value.id}`,durationMs:value.durationMs,playedAt:value.playedAt};
}
export function newArchiveV701(owner:string,now=new Date()):V701Archive{
 if(!validOwner(owner))throw new Error('Spotify-Konto konnte nicht zugeordnet werden.');
 return {format:V701_ARCHIVE_FORMAT,version:1,owner,savedAt:now.toISOString(),events:[]};
}
/** Reject corrupt, foreign, future-schema and duplicate inputs without overwriting existing storage. */
export function validateArchiveV701(input:unknown,owner:string,now=new Date()):V701Archive{
 if(!validOwner(owner)||!obj(input)||input.format!==V701_ARCHIVE_FORMAT||input.version!==1||input.owner!==owner||!iso(input.savedAt)||!Array.isArray(input.events)||input.events.length>V701_MAX_EVENTS)
  throw new Error('Archivformat oder Spotify-Konto passt nicht.');
 const seen=new Set<string>();const events:RecentTrackV672[]=[];
 for(const raw of input.events){
  const item=validEventV701(raw,now.getTime());if(!item)throw new Error('Archiv enthält ungültige Wiedergabedaten.');
  const key=`${item.id}:${item.playedAt}`;if(seen.has(key))throw new Error('Archiv enthält doppelte Wiedergabeereignisse.');
  seen.add(key);events.push(item);
 }
 events.sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt));
 return {format:V701_ARCHIVE_FORMAT,version:1,owner,savedAt:input.savedAt,events};
}
export function parseArchiveJSONV701(raw:string,owner:string,now=new Date()):V701Archive{
 if(typeof raw!=='string'||raw.length>V701_MAX_JSON_CHARS)throw new Error('JSON-Archiv zu groß.');
 let input:unknown;try{input=JSON.parse(raw);}catch{throw new Error('Ungültige JSON-Datei.');}
 return validateArchiveV701(input,owner,now);
}
/** Exact duplicates match track ID + playback timestamp; repeated plays stay separate. */
export function mergeArchiveV701(existing:V701Archive,items:ReadonlyArray<RecentTrackV672>,now=new Date()):{archive:V701Archive;added:number;trimmed:number}{
 const seen=new Set(existing.events.map(x=>`${x.id}:${x.playedAt}`));
 const add:RecentTrackV672[]=[];
 for(const raw of items){const item=validEventV701(raw,now.getTime());if(!item)continue;const key=`${item.id}:${item.playedAt}`;if(seen.has(key))continue;seen.add(key);add.push(item);}
 if(!add.length)return {archive:existing,added:0,trimmed:0};
 const sorted=[...existing.events,...add].sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt));
 const trimmed=Math.max(0,sorted.length-V701_MAX_EVENTS);
 return {archive:{...existing,savedAt:now.toISOString(),events:sorted.slice(0,V701_MAX_EVENTS)},added:add.length,trimmed};
}
export function readArchiveV701(storage:V701Storage,owner:string,now=new Date()):V701Read{
 if(!validOwner(owner))return {archive:null,error:'Spotify-Konto nicht erkannt.'};
 try{const raw=storage.getItem(archiveKeyV701(owner));return raw===null?{archive:null,error:null}:{archive:parseArchiveJSONV701(raw,owner,now),error:null};}
 catch{return {archive:null,error:'Lokales Archiv beschädigt oder Browser-Speicher nicht lesbar. Vorhandene Daten wurden nicht verändert.'};}
}
export function writeArchiveV701(storage:V701Storage,archive:V701Archive,now=new Date()):V701Read{
 try{const validated=validateArchiveV701(archive,archive.owner,now);const serialized=JSON.stringify(validated);
  if(serialized.length>V701_MAX_JSON_CHARS)return {archive:null,error:'Archiv zu groß für den lokalen Speicher; bitte eine Sicherung erstellen.'};
  storage.setItem(archiveKeyV701(archive.owner),serialized);return {archive:validated,error:null};
 }catch{return {archive:null,error:'Speichern fehlgeschlagen (Browser-Speicher voll oder gesperrt); vorhandenes Archiv bleibt unverändert.'};}
}
export function removeArchiveV701(storage:V701Storage,owner:string):boolean{
 if(!validOwner(owner))return false;
 try{storage.removeItem(archiveKeyV701(owner));return true;}catch{return false;}
}
export const exportArchiveJSONV701=(archive:V701Archive)=>JSON.stringify(archive,null,2)+'\n';
export type V701Period='month'|'year'|'all';
export function archiveSummaryV701(archive:V701Archive,period:V701Period='all',now=new Date()){
 const cutoff=period==='month'?new Date(now.getFullYear(),now.getMonth(),1).getTime():period==='year'?new Date(now.getFullYear(),0,1).getTime():0;
 const list=archive.events.filter(x=>{const t=Date.parse(x.playedAt);return t>=cutoff&&t<=now.getTime()+60000;});
 const songs=new Map<string,{id:string;title:string;artist:string;plays:number}>();const artists=new Map<string,number>();const months=new Map<string,number>();const days=new Set<string>();
 for(const item of list){const s=songs.get(item.id);if(s)s.plays++;else songs.set(item.id,{id:item.id,title:item.title,artist:item.artist,plays:1});artists.set(item.artist,(artists.get(item.artist)??0)+1);
  const d=new Date(item.playedAt);const month=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;months.set(month,(months.get(month)??0)+1);days.add(`${month}-${String(d.getDate()).padStart(2,'0')}`);}
 return {plays:list.length,uniqueSongs:songs.size,activeDays:days.size,topSongs:[...songs.values()].sort((a,b)=>b.plays-a.plays||a.title.localeCompare(b.title)).slice(0,12),topArtists:[...artists.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,10),months:[...months.entries()].sort((a,b)=>a[0].localeCompare(b[0]))};
}
