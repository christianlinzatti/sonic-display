import type {V701Archive} from './persistent-listening-history-v701';
import {V701_MAX_EVENTS} from './persistent-listening-history-v701';

/** Pure, browser-local analysis of explicitly archived Spotify play events. No listening minutes inferred. */
export type V703Range='30d'|'90d'|'365d'|'all';
export type V703Month={key:string;plays:number;isCurrent:boolean};
export type V703Song={id:string;title:string;artist:string;cover:string|null;spotifyUrl:string;plays:number;activeDays:number;lastPlayedAt:string};
export type V703Artist={name:string;plays:number;uniqueSongs:number;lastPlayedAt:string};
export type V703Bucket={key:number;plays:number};
export type V703MonthComparison={latestKey:string;earlierKey:string;latest:number;earlier:number;delta:number;percent:number|null};
export type V703Stats={plays:number;uniqueSongs:number;repeatEvents:number;activeDays:number;earliest:string|null;latest:string|null;
 months:V703Month[];topSongs:V703Song[];topArtists:V703Artist[];hours:V703Bucket[];weekdays:V703Bucket[];
 completedMonths:V703MonthComparison;archivedEvents:number};
const monthKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const dayKey=(d:Date)=>`${monthKey(d)}-${String(d.getDate()).padStart(2,'0')}`;
const beginDay=(d:Date)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
const cutoff=(range:V703Range,now:Date)=>range==='all'?0:range==='365d'?beginDay(new Date(now.getFullYear(),now.getMonth(),now.getDate()-364)):range==='90d'?beginDay(new Date(now.getFullYear(),now.getMonth(),now.getDate()-89)):beginDay(new Date(now.getFullYear(),now.getMonth(),now.getDate()-29));
const maxItems=V701_MAX_EVENTS;
/** Empty months and missing dates are not imputed as listening activity. */
export function listeningStatisticsV703(archive:Pick<V701Archive,'events'>,range:V703Range='90d',now=new Date()):V703Stats{
 const date=Number.isFinite(now.getTime())?now:new Date(0);
 const start=cutoff(range,date),end=date.getTime()+60000;
 const selected:V701Archive['events']=[];const all:V701Archive['events']=[];const seen=new Set<string>();
 for(const event of archive.events.slice(0,maxItems)){
  if(!event||typeof event.id!=='string'||typeof event.playedAt!=='string')continue;
  const ms=Date.parse(event.playedAt);if(!Number.isFinite(ms)||ms<946684800000||ms>end)continue;
  const identity=`${event.id}:${event.playedAt}`;if(seen.has(identity))continue;seen.add(identity);all.push(event);
  if(ms>=start)selected.push(event);
 }
 const monthCounts=new Map<string,number>();
 for(const e of selected){const m=monthKey(new Date(e.playedAt));monthCounts.set(m,(monthCounts.get(m)??0)+1);}
 const months:V703Month[]=[];
 for(let offset=11;offset>=0;offset--){const d=new Date(date.getFullYear(),date.getMonth()-offset,1);const key=monthKey(d);months.push({key,plays:monthCounts.get(key)??0,isCurrent:offset===0});}
 const songs=new Map<string,V703Song>();const artists=new Map<string,{name:string;plays:number;songs:Set<string>;lastPlayedAt:string}>();
 const daySet=new Set<string>();const songDays=new Map<string,Set<string>>();
 const hours=Array.from({length:24},(_,key)=>({key,plays:0}));const weekdays=Array.from({length:7},(_,key)=>({key,plays:0}));
 let earliest:string|null=null,latest:string|null=null;
 for(const e of selected){
  const t=new Date(e.playedAt),day=dayKey(t);daySet.add(day);hours[t.getHours()].plays++;weekdays[t.getDay()].plays++;
  if(!earliest||e.playedAt<earliest)earliest=e.playedAt;
  if(!latest||e.playedAt>latest)latest=e.playedAt;
  const song=songs.get(e.id);
  if(song){song.plays++;if(e.playedAt>song.lastPlayedAt) song.lastPlayedAt=e.playedAt;}
  else songs.set(e.id,{id:e.id,title:e.title,artist:e.artist,cover:e.albumCoverUrl,spotifyUrl:`https://open.spotify.com/track/${e.id}`,plays:1,activeDays:0,lastPlayedAt:e.playedAt});
  let days=songDays.get(e.id);if(!days){days=new Set();songDays.set(e.id,days);}days.add(day);
  // Spotify artist credits are not split or guessed; collaborations remain a single credit label.
  const artist=artists.get(e.artist);
  if(artist){artist.plays++;artist.songs.add(e.id);if(e.playedAt>artist.lastPlayedAt)artist.lastPlayedAt=e.playedAt;}
  else artists.set(e.artist,{name:e.artist,plays:1,songs:new Set([e.id]),lastPlayedAt:e.playedAt});
 }
 for(const s of songs.values())s.activeDays=songDays.get(s.id)?.size??0;
 const topSongs=[...songs.values()].sort((a,b)=>b.plays-a.plays||b.lastPlayedAt.localeCompare(a.lastPlayedAt)||a.title.localeCompare(b.title)).slice(0,12);
 const topArtists=[...artists.values()].sort((a,b)=>b.plays-a.plays||b.lastPlayedAt.localeCompare(a.lastPlayedAt)||a.name.localeCompare(b.name)).slice(0,10).map(x=>({name:x.name,plays:x.plays,uniqueSongs:x.songs.size,lastPlayedAt:x.lastPlayedAt}));
 const latestKey=monthKey(new Date(date.getFullYear(),date.getMonth()-1,1));const earlierKey=monthKey(new Date(date.getFullYear(),date.getMonth()-2,1));
 let latestMonth=0,earlierMonth=0;
 for(const e of all){const key=monthKey(new Date(e.playedAt));if(key===latestKey)latestMonth++;else if(key===earlierKey)earlierMonth++;}
 return {plays:selected.length,uniqueSongs:songs.size,repeatEvents:selected.length-songs.size,activeDays:daySet.size,earliest,latest,months,topSongs,topArtists,hours,weekdays,
  completedMonths:{latestKey,earlierKey,latest:latestMonth,earlier:earlierMonth,delta:latestMonth-earlierMonth,percent:earlierMonth?Math.round(100*(latestMonth-earlierMonth)/earlierMonth):null},archivedEvents:all.length};
}
