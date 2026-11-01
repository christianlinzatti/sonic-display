import type {V701Archive} from './persistent-listening-history-v701';
import type {LastFmArchiveV706} from './lastfm-history-v706';
import {lastFmEventKeyV706} from './lastfm-history-v706';

/** V707: read-only cross-provider views. A match is only a heuristic, never a verified common play ID. */
export type HistorySourceV707='spotify'|'lastfm'|'combined';
export type HistoryEventV707={source:'spotify'|'lastfm'|'both';songKey:string;artist:string;title:string;playedAt:string;url:string|null};
export type HistoryCollectionV707={events:HistoryEventV707[];spotifyCount:number;lastfmCount:number;matched:number;unmatchedSpotify:number;unmatchedLastfm:number};
export type HistoryRangeV707='30d'|'90d'|'365d'|'all';
export type HistorySongV707={key:string;title:string;artist:string;url:string|null;plays:number;first:string;last:string;recent:number;lastGapDays:number|null;days:number};
export type HistoryArtistV707={name:string;plays:number;songs:number;last:string};
export type HistoryStatsV707={plays:number;uniqueSongs:number;activeDays:number;repeats:number;months:{key:string;plays:number}[];hours:number[];weekdays:number[];topSongs:HistorySongV707[];topArtists:HistoryArtistV707[];previousMonth:{latest:string;earlier:string;latestCount:number;earlierCount:number;delta:number;percent:number|null}};
export type HistoryDiscoveryV707={comebacks:HistorySongV707[];rare:HistorySongV707[];first:HistorySongV707[];repeat:HistorySongV707[];artistChanges:{name:string;recent:number;previous:number;deltaPoints:number}[];currentCount:number;previousCount:number;comparisonAvailable:boolean};
const DAY=86400000;
const normal=(s:string)=>s.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-US');
const songKey=(artist:string,title:string)=>`${normal(artist)}\u001f${normal(title)}`;
const valid=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<=400&&!/[\u0000-\u001f\u007f]/.test(s);
const time=(s:unknown,now:number)=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(s)&&Number.isFinite(Date.parse(s))&&Date.parse(s)>=946684800000&&Date.parse(s)<=now+60000&&new Date(s).toISOString()===s;
const localMonth=(ms:number)=>{const d=new Date(ms);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;};
const localDay=(ms:number)=>{const d=new Date(ms);return `${localMonth(ms)}-${String(d.getDate()).padStart(2,'0')}`;};
const midnight=(d:Date)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
const lastNDays=(d:Date,n:number)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()-(n-1)).getTime();
const rangeCut=(range:HistoryRangeV707,now:Date)=>range==='all'?0:lastNDays(now,range==='30d'?30:range==='90d'?90:365);
const safeLastfmUrl=(raw:unknown):string|null=>{if(typeof raw!=='string')return null;try{const u=new URL(raw);return u.protocol==='https:'&&(u.hostname==='www.last.fm'||u.hostname==='last.fm')&&u.pathname.startsWith('/music/')&&!u.username&&!u.password?u.toString():null;}catch{return null;}};
/** Spotify events use their track ID; Last.fm events use the V706 timestamp/metadata identity. */
export function collectHistoryV707(spotify:Pick<V701Archive,'events'>|null,lastfm:Pick<LastFmArchiveV706,'events'>|null,source:HistorySourceV707,now=new Date()):HistoryCollectionV707{
 const ms=Number.isFinite(now.getTime())?now.getTime():0;
 const sp:HistoryEventV707[]=[],lf:HistoryEventV707[]=[];
 const ids=new Set<string>();
 if(source!=='lastfm')for(const e of (spotify?.events??[]).slice(0,5000)){
  if(!e||typeof e.id!=='string'||!/^[A-Za-z0-9]{22}$/.test(e.id)||!valid(e.artist)||!valid(e.title)||!time(e.playedAt,ms))continue;
  const key=`${e.id}\u001f${e.playedAt}`;if(ids.has(key))continue;ids.add(key);
  sp.push({source:'spotify',songKey:songKey(e.artist,e.title),artist:e.artist,title:e.title,playedAt:e.playedAt,url:`https://open.spotify.com/track/${e.id}`});
 }
 ids.clear();
 if(source!=='spotify')for(const e of (lastfm?.events??[])){
  if(!e||!valid(e.artist)||!valid(e.title)||!valid(e.album)||!time(e.playedAt,ms))continue;
  const key=lastFmEventKeyV706(e);if(ids.has(key))continue;ids.add(key);
  lf.push({source:'lastfm',songKey:songKey(e.artist,e.title),artist:e.artist,title:e.title,playedAt:e.playedAt,url:safeLastfmUrl(e.url)});
 }
 if(source==='spotify')return {events:sp.sort(sortEvents),spotifyCount:sp.length,lastfmCount:0,matched:0,unmatchedSpotify:sp.length,unmatchedLastfm:0};
 if(source==='lastfm')return {events:lf.sort(sortEvents),spotifyCount:0,lastfmCount:lf.length,matched:0,unmatchedSpotify:0,unmatchedLastfm:lf.length};
 // One-to-one match: same normalized artist and title, timestamps no more than 90 seconds apart.
 // Same-song replays at other timestamps are retained. No album- or recording-level proof is claimed.
 const pools=new Map<string,{ms:number;idx:number}[]>();
 for(let i=0;i<sp.length;i++){const e=sp[i],list=pools.get(e.songKey)??[];list.push({ms:Date.parse(e.playedAt),idx:i});pools.set(e.songKey,list);}
 for(const list of pools.values())list.sort((a,b)=>a.ms-b.ms);
 const used=new Set<number>();let matched=0;
 const remain:HistoryEventV707[]=[];
 for(const e of lf){const list=pools.get(e.songKey)??[],timestamp=Date.parse(e.playedAt);let lo=0,hi=list.length;
  while(lo<hi){const mid=(lo+hi)>>1;if(list[mid].ms<timestamp-90000)lo=mid+1;else hi=mid;}
  let chosen=-1,delta=90001;
  for(let j=lo;j<list.length&&list[j].ms<=timestamp+90000;j++){const candidate=list[j],distance=Math.abs(candidate.ms-timestamp);if(!used.has(candidate.idx)&&distance<delta){chosen=candidate.idx;delta=distance;}}
  if(chosen<0){remain.push(e);continue;}
  used.add(chosen);matched++;sp[chosen]={...sp[chosen],source:'both'};
 }
 const events=[...sp,...remain].sort(sortEvents);
 return {events,spotifyCount:sp.length,lastfmCount:lf.length,matched,unmatchedSpotify:sp.length-matched,unmatchedLastfm:lf.length-matched};
}
const sortEvents=(a:HistoryEventV707,b:HistoryEventV707)=>b.playedAt.localeCompare(a.playedAt)||a.songKey.localeCompare(b.songKey);
function grouped(events:readonly HistoryEventV707[],recentCutoff:number){
 const songs=new Map<string,{key:string;artist:string;title:string;url:string|null;times:number[];recent:number;days:Set<string>}>();
 for(const e of events){let s=songs.get(e.songKey);if(!s){s={key:e.songKey,artist:e.artist,title:e.title,url:e.url,times:[],recent:0,days:new Set()};songs.set(e.songKey,s);}
  const ts=Date.parse(e.playedAt);s.times.push(ts);s.days.add(localDay(ts));if(ts>=recentCutoff)s.recent++;if(!s.url&&e.url)s.url=e.url;
 }
 return [...songs.values()].map((s):HistorySongV707=>{s.times.sort((a,b)=>a-b);const last=s.times[s.times.length-1],previous=s.times[s.times.length-2];return {key:s.key,title:s.title,artist:s.artist,url:s.url,plays:s.times.length,first:new Date(s.times[0]).toISOString(),last:new Date(last).toISOString(),recent:s.recent,lastGapDays:previous===undefined?null:Math.floor((last-previous)/DAY),days:s.days.size};});
}
export function historyStatisticsV707(input:HistoryCollectionV707,range:HistoryRangeV707='90d',now=new Date()):HistoryStatsV707{
 const date=Number.isFinite(now.getTime())?now:new Date(0),limit=rangeCut(range,date);
 const events=input.events.filter(e=>Date.parse(e.playedAt)>=limit&&Date.parse(e.playedAt)<=date.getTime()+60000);
 const songs=grouped(events,0),topSongs=songs.sort((a,b)=>b.plays-a.plays||b.last.localeCompare(a.last)||a.key.localeCompare(b.key)).slice(0,12);
 const artists=new Map<string,{name:string;plays:number;songs:Set<string>;last:string}>();const days=new Set<string>();
 const hours=Array.from({length:24},()=>0),weekdays=Array.from({length:7},()=>0),monthCounts=new Map<string,number>();
 for(const e of events){const ts=Date.parse(e.playedAt),d=new Date(ts);days.add(localDay(ts));hours[d.getHours()]++;weekdays[d.getDay()]++;const m=localMonth(ts);monthCounts.set(m,(monthCounts.get(m)??0)+1);
  const id=normal(e.artist);const a=artists.get(id)??{name:e.artist,plays:0,songs:new Set<string>(),last:e.playedAt};a.plays++;a.songs.add(e.songKey);if(e.playedAt>a.last)a.last=e.playedAt;artists.set(id,a);
 }
 const months=Array.from({length:12},(_,index)=>{const d=new Date(date.getFullYear(),date.getMonth()+index-11,1),key=localMonth(d.getTime());return {key,plays:monthCounts.get(key)??0};});
 const latest=localMonth(new Date(date.getFullYear(),date.getMonth()-1,1).getTime()),earlier=localMonth(new Date(date.getFullYear(),date.getMonth()-2,1).getTime());
 let latestCount=0,earlierCount=0;
 for(const e of input.events){const month=localMonth(Date.parse(e.playedAt));if(month===latest)latestCount++;else if(month===earlier)earlierCount++;}
 return {plays:events.length,uniqueSongs:grouped(events,0).length,repeats:events.length-grouped(events,0).length,activeDays:days.size,months,hours,weekdays,topSongs,
  topArtists:[...artists.values()].sort((a,b)=>b.plays-a.plays||b.last.localeCompare(a.last)||a.name.localeCompare(b.name)).slice(0,10).map(a=>({name:a.name,plays:a.plays,songs:a.songs.size,last:a.last})),
  previousMonth:{latest,earlier,latestCount,earlierCount,delta:latestCount-earlierCount,percent:earlierCount?Math.round(100*(latestCount-earlierCount)/earlierCount):null}};
}
export function historyDiscoveriesV707(input:HistoryCollectionV707,now=new Date()):HistoryDiscoveryV707{
 const date=Number.isFinite(now.getTime())?now:new Date(0),recentCutoff=lastNDays(date,30),previousCutoff=lastNDays(date,60),fourteen=lastNDays(date,14),year=lastNDays(date,365);
 const songs=grouped(input.events,recentCutoff),changes=new Map<string,{name:string;recent:number;previous:number}>();let currentCount=0,previousCount=0;
 for(const e of input.events){const ts=Date.parse(e.playedAt);const current=ts>=recentCutoff,previous=ts>=previousCutoff&&ts<recentCutoff;if(!current&&!previous)continue;
  if(current)currentCount++;else previousCount++;
  const id=normal(e.artist),a=changes.get(id)??{name:e.artist,recent:0,previous:0};if(current)a.recent++;else a.previous++;changes.set(id,a);
 }
 const recent=(a:HistorySongV707,b:HistorySongV707)=>b.last.localeCompare(a.last)||a.key.localeCompare(b.key);
 const comparisonAvailable=currentCount>=8&&previousCount>=8;
 return {currentCount,previousCount,comparisonAvailable,
  comebacks:songs.filter(s=>s.recent>0&&s.lastGapDays!==null&&s.lastGapDays>=30&&Date.parse(s.last)>=fourteen).sort((a,b)=>b.lastGapDays!-a.lastGapDays!||recent(a,b)).slice(0,12),
  rare:songs.filter(s=>s.plays===1&&Date.parse(s.last)<fourteen&&Date.parse(s.last)>=year).sort(recent).slice(0,12),
  first:songs.filter(s=>Date.parse(s.first)>=recentCutoff).sort((a,b)=>b.first.localeCompare(a.first)).slice(0,12),
  repeat:songs.filter(s=>s.recent>=3).sort((a,b)=>b.recent-a.recent||recent(a,b)).slice(0,12),
  artistChanges:comparisonAvailable?[...changes.values()].map(a=>({...a,deltaPoints:Math.round((a.recent/currentCount-a.previous/previousCount)*100)})).filter(a=>a.recent>=2&&a.deltaPoints>=10).sort((a,b)=>b.deltaPoints-a.deltaPoints||b.recent-a.recent).slice(0,8):[]};
}
