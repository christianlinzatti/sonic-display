import type {LastFmEventV706} from './lastfm-history-v706';

export type ExplorerSelectionV729={artist:string;title?:string};
export const explorerKeyV729=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const songKey=(artist:string,title:string)=>JSON.stringify([explorerKeyV729(artist),explorerKeyV729(title)]);
const day=(stamp:string)=>{const d=new Date(stamp);return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000;};
export function spotifyExplorerLinkV729(selection:ExplorerSelectionV729){
 return `https://open.spotify.com/search/${encodeURIComponent(selection.title===undefined?selection.artist:`${selection.artist} ${selection.title}`)}`;
}
/** Only observed, valid scrobbles. Album variants at the same instant are one play. */
export function explorerEventsV729(events:readonly LastFmEventV706[],now=new Date()){
 const seen=new Set<string>();
 return events.filter(e=>{
  if(!e||typeof e.artist!=='string'||typeof e.title!=='string'||!e.artist.trim()||!e.title.trim())return false;
  const t=Date.parse(e.playedAt);if(!Number.isFinite(t)||t<946684800000||t>now.getTime())return false;
  const key=JSON.stringify([t,songKey(e.artist,e.title)]);if(seen.has(key))return false;seen.add(key);return true;
 }).slice().sort((a,b)=>Date.parse(a.playedAt)-Date.parse(b.playedAt));
}
export function explorerCatalogV729(events:readonly LastFmEventV706[],now=new Date()){
 const artists=new Map<string,{artist:string;plays:number}>(),songs=new Map<string,{artist:string;title:string;plays:number}>();
 for(const e of explorerEventsV729(events,now)){
  const ak=explorerKeyV729(e.artist),sk=songKey(e.artist,e.title);
  const a=artists.get(ak)??{artist:e.artist.trim(),plays:0};a.plays++;artists.set(ak,a);
  const s=songs.get(sk)??{artist:e.artist.trim(),title:e.title.trim(),plays:0};s.plays++;songs.set(sk,s);
 }
 const rank=<T extends {artist:string;plays:number;title?:string}>(a:T,b:T)=>b.plays-a.plays||a.artist.localeCompare(b.artist)||String(a.title??'').localeCompare(String(b.title??''));
 return {artists:[...artists.values()].sort(rank),songs:[...songs.values()].sort(rank)};
}
export function buildExplorerProfileV729(events:readonly LastFmEventV706[],selection:ExplorerSelectionV729,now=new Date()){
 const matches=explorerEventsV729(events,now).filter(e=>explorerKeyV729(e.artist)===explorerKeyV729(selection.artist)&&(selection.title===undefined||explorerKeyV729(e.title)===explorerKeyV729(selection.title)));
 const years=new Map<number,number>(),months=new Map<string,number>();
 const rediscoveries:{previous:string;returned:string;gapDays:number}[]=[];
 for(let i=0;i<matches.length;i++){
  const e=matches[i],d=new Date(e.playedAt),year=d.getFullYear(),month=`${year}-${String(d.getMonth()+1).padStart(2,'0')}`;
  years.set(year,(years.get(year)??0)+1);months.set(month,(months.get(month)??0)+1);
  if(i){const previous=matches[i-1].playedAt,gapDays=day(e.playedAt)-day(previous);if(gapDays>=90)rediscoveries.push({previous,returned:e.playedAt,gapDays});}
 }
 return {selection,plays:matches.length,first:matches[0]?.playedAt??null,last:matches[matches.length-1]?.playedAt??null,
  years:[...years].sort((a,b)=>b[0]-a[0]),months:[...months].sort((a,b)=>b[0].localeCompare(a[0])),
  rediscoveries:rediscoveries.reverse(),topSongs:explorerCatalogV729(matches,now).songs,history:matches.slice().reverse()};
}
