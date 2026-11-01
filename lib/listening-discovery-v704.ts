import type {V701Archive} from './persistent-listening-history-v701';
import {V701_MAX_EVENTS} from './persistent-listening-history-v701';

/** Evidence-bound, local-only discovery. A play event is NOT listening duration or a complete Spotify history. */
export type V704Song={id:string;title:string;artist:string;cover:string|null;spotifyUrl:string;plays:number;firstPlayedAt:string;lastPlayedAt:string;lastGapDays:number|null;recentPlays:number};
export type V704ArtistChange={name:string;recent:number;previous:number;recentShare:number;previousShare:number;deltaPoints:number};
export type V704Discovery={archivedEvents:number;validEvents:number;last30:number;previous30:number;comparisonAvailable:boolean;comebacks:V704Song[];rareGems:V704Song[];firstInArchive:V704Song[];onRepeat:V704Song[];artistChanges:V704ArtistChange[]};
const DAY=86400000;
const validId=(id:unknown):id is string=>typeof id==='string'&&/^[a-zA-Z0-9]{22}$/.test(id);
const validIso=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString()===s;
const safe=(s:unknown):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=400&& !/[\u0000-\u001F\u007F]/.test(s);
const validCover=(s:unknown):s is string=>{if(typeof s!=='string'||s.length>2048)return false;try{const u=new URL(s);return u.protocol==='https:'&&(u.hostname==='i.scdn.co'||u.hostname.endsWith('.scdn.co'));}catch{return false;}};
const dayStart=(d:Date)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
const recentFirst=(a:V704Song,b:V704Song)=>Date.parse(b.lastPlayedAt)-Date.parse(a.lastPlayedAt)||a.id.localeCompare(b.id);
const frequentFirst=(a:V704Song,b:V704Song)=>b.recentPlays-a.recentPlays||recentFirst(a,b);
/** All windows use local calendar days; repeats are track ID + precise playback timestamp. */
export function listeningDiscoveryV704(archive:Pick<V701Archive,'events'>,now=new Date()):V704Discovery{
 const date=Number.isFinite(now.getTime())?now:new Date(0);
 const recentCutoff=new Date(date.getFullYear(),date.getMonth(),date.getDate()-29).getTime();
 const earlierCutoff=new Date(date.getFullYear(),date.getMonth(),date.getDate()-59).getTime();
 const latest=date.getTime()+60000;
 const unique=new Set<string>();
 const songs=new Map<string,{id:string;title:string;artist:string;cover:string|null;times:number[];recent:number}>();
 const artists=new Map<string,{recent:number;previous:number}>();
 let validEvents=0,last30=0,previous30=0;
 const items=Array.isArray(archive?.events)?archive.events:[];
 for(const e of items.slice(0,V701_MAX_EVENTS)){
  if(!e||!validId(e.id)||!validIso(e.playedAt)||!safe(e.title)||!safe(e.artist)||!safe(e.album))continue;
  const t=Date.parse(e.playedAt);
  if(t<946684800000||t>latest||!Number.isSafeInteger(e.durationMs)||e.durationMs<0||e.durationMs>86400000)continue;
  const key=`${e.id}:${e.playedAt}`;if(unique.has(key))continue;unique.add(key);validEvents++;
  const current=t>=recentCutoff,previous=t>=earlierCutoff&&t<recentCutoff;
  if(current)last30++;if(previous)previous30++;
  let record=songs.get(e.id);
  if(!record){record={id:e.id,title:e.title,artist:e.artist,cover:validCover(e.albumCoverUrl)?e.albumCoverUrl:null,times:[],recent:0};songs.set(e.id,record);}
  record.times.push(t);if(current)record.recent++;
  if(current||previous){const a=artists.get(e.artist)??{recent:0,previous:0};if(current)a.recent++;else a.previous++;artists.set(e.artist,a);}
 }
 const values:V704Song[]=[];
 for(const s of songs.values()){
  s.times.sort((a,b)=>a-b);const last=s.times[s.times.length-1],before=s.times[s.times.length-2];
  values.push({id:s.id,title:s.title,artist:s.artist,cover:s.cover,spotifyUrl:`https://open.spotify.com/track/${s.id}`,plays:s.times.length,firstPlayedAt:new Date(s.times[0]).toISOString(),lastPlayedAt:new Date(last).toISOString(),lastGapDays:before===undefined?null:Math.floor((last-before)/DAY),recentPlays:s.recent});
 }
 // The comparison only appears with a minimum sample in BOTH windows; it is not a complete listening-profile inference.
 const comparisonAvailable=last30>=8&&previous30>=8;
 const artistChanges:V704ArtistChange[]=comparisonAvailable?[...artists.entries()].map(([name,n])=>({name,recent:n.recent,previous:n.previous,recentShare:Math.round(n.recent/last30*100),previousShare:Math.round(n.previous/previous30*100),deltaPoints:Math.round((n.recent/last30-n.previous/previous30)*100)}))
  .filter(a=>a.recent>=2&&a.deltaPoints>=10).sort((a,b)=>b.deltaPoints-a.deltaPoints||b.recent-a.recent||a.name.localeCompare(b.name)).slice(0,8):[];
 return {archivedEvents:items.length,validEvents,last30,previous30,comparisonAvailable,
  comebacks:values.filter(s=>s.recentPlays>0&&s.lastGapDays!==null&&s.lastGapDays>=30&&Date.parse(s.lastPlayedAt)>=dayStart(new Date(date.getFullYear(),date.getMonth(),date.getDate()-13))).sort((a,b)=>b.lastGapDays!-a.lastGapDays!||recentFirst(a,b)).slice(0,12),
  rareGems:values.filter(s=>s.plays===1&&Date.parse(s.lastPlayedAt)>=dayStart(new Date(date.getFullYear(),date.getMonth(),date.getDate()-364))&&Date.parse(s.lastPlayedAt)<dayStart(new Date(date.getFullYear(),date.getMonth(),date.getDate()-13))).sort(recentFirst).slice(0,12),
  firstInArchive:values.filter(s=>Date.parse(s.firstPlayedAt)>=recentCutoff).sort((a,b)=>Date.parse(b.firstPlayedAt)-Date.parse(a.firstPlayedAt)||a.id.localeCompare(b.id)).slice(0,12),
  onRepeat:values.filter(s=>s.recentPlays>=3).sort(frequentFirst).slice(0,12),artistChanges};
}
