import type {LastFmEventV706} from './lastfm-history-v706';
import type {V711TimeZone} from './lastfm-intelligence-v711';

/** V860: read-only insights into recorded Last.fm events, never a complete listening history. */
export type V860ArtistOption={key:string;artist:string;plays:number};
export type V860RankedSong={key:string;title:string;plays:number;first:string;last:string;album:string;cover:string|null};
export type V860RankedAlbum={key:string;album:string;plays:number;tracks:number;cover:string|null};
export type V860Year={year:number;plays:number;allPlays:number;share:number;activeMonths:number};
export type V860ArtistProfile={key:string;artist:string;plays:number;first:string;last:string;firstMonth:string;lastMonth:string;uniqueSongs:number;uniqueAlbums:number;unassignedAlbumPlays:number;peakYear:number;peakYearPlays:number;years:V860Year[];songs:V860RankedSong[];albums:V860RankedAlbum[];yearSongs:V860RankedSong[];yearAlbums:V860RankedAlbum[];selectedYear:number|null;};
export type V860DeepDive={zone:V711TimeZone;total:number;artists:V860ArtistOption[];profile:V860ArtistProfile|null;};
const norm=(s:string)=>s.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-AT');
const validText=(s:unknown):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=400&&!/[\u0000-\u001f\u007f]/.test(s);
const knownAlbum=(s:string)=>validText(s)&&!['album unbekannt','unknown album','[unknown]','(unknown)','unbekannt'].includes(norm(s));
const formatters:Record<V711TimeZone,Intl.DateTimeFormat>={
 UTC:new Intl.DateTimeFormat('en-CA',{timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit'}),
 'Europe/Vienna':new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'})
};
function dayKey(ms:number,zone:V711TimeZone){const parts:Record<string,string>={};for(const p of formatters[zone].formatToParts(new Date(ms)))if(p.type!=='literal')parts[p.type]=p.value;return `${parts.year}-${parts.month}-${parts.day}`;}
function validEvent(e:LastFmEventV706,maximum:number){
 if(!e||!validText(e.artist)||!validText(e.title)||typeof e.playedAt!=='string'||!/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(e.playedAt))return null;
 const ms=Date.parse(e.playedAt);return Number.isFinite(ms)&&ms>=946684800000&&ms<=maximum&&new Date(ms).toISOString()===e.playedAt?ms:null;
}
type Item={e:LastFmEventV706;ms:number;day:string;month:string;year:number;artistKey:string};
type SongAcc={key:string;title:string;plays:number;first:number;last:number;album:string;cover:string|null};
type AlbumAcc={key:string;album:string;plays:number;titles:Set<string>;cover:string|null};
const byPlays=<T extends {key:string;plays:number}>(a:T,b:T)=>b.plays-a.plays||a.key.localeCompare(b.key,'de-AT');
function ranked(items:readonly Item[]){
 const songs=new Map<string,SongAcc>(),albums=new Map<string,AlbumAcc>();let unknown=0;
 for(const {e,ms} of items){
  const titleKey=norm(e.title),albumKey=norm(e.album||'');
  const song=songs.get(titleKey);
  if(song){song.plays++;if(ms<song.first) song.first=ms;if(ms>song.last){song.last=ms;song.title=e.title; if(knownAlbum(e.album))song.album=e.album; if(e.cover)song.cover=e.cover;}}
  else songs.set(titleKey,{key:titleKey,title:e.title,plays:1,first:ms,last:ms,album:knownAlbum(e.album)?e.album:'Album unbekannt',cover:e.cover});
  if(!knownAlbum(e.album)){unknown++;continue;}
  const album=albums.get(albumKey);
  if(album){album.plays++;album.titles.add(titleKey);if(e.cover)album.cover=e.cover;}
  else albums.set(albumKey,{key:albumKey,album:e.album,plays:1,titles:new Set([titleKey]),cover:e.cover});
 }
 const songList=[...songs.values()].sort(byPlays).map(s=>({key:s.key,title:s.title,plays:s.plays,first:new Date(s.first).toISOString(),last:new Date(s.last).toISOString(),album:s.album,cover:s.cover}));
 const albumList=[...albums.values()].sort(byPlays).map(a=>({key:a.key,album:a.album,plays:a.plays,tracks:a.titles.size,cover:a.cover}));
 return {songs:songList,albums:albumList,unknown};
}
/** Pure and deterministic for a fixed archive and `now`; no storage, network, or mutations. */
export function buildArtistDeepDiveV860(events:readonly LastFmEventV706[],requestedArtist?:string|null,requestedYear?:number|null,now=new Date(),timeZone:V711TimeZone='Europe/Vienna'):V860DeepDive{
 const zone:V711TimeZone=timeZone==='UTC'?'UTC':'Europe/Vienna';
 const max=Number.isFinite(now.getTime())?now.getTime():Date.now();
 const items:Item[]=[],artistCounts=new Map<string,V860ArtistOption>(),yearCounts=new Map<number,number>();
 for(const e of Array.isArray(events)?events:[]){
  const ms=validEvent(e,max);if(ms===null)continue;
  const day=dayKey(ms,zone),year=Number(day.slice(0,4)),key=norm(e.artist);
  const item={e,ms,day,month:day.slice(0,7),year,artistKey:key};items.push(item);
  yearCounts.set(year,(yearCounts.get(year)??0)+1);
  const stat=artistCounts.get(key);
  if(stat){stat.plays++;}else artistCounts.set(key,{key,artist:e.artist.trim(),plays:1});
 }
 const artists=[...artistCounts.values()].sort(byPlays);
 if(!artists.length)return {zone,total:0,artists:[],profile:null};
 const target=validText(requestedArtist)?artistCounts.get(norm(requestedArtist)):null;
 const selected=target??artists[0];
 const filtered=items.filter(i=>i.artistKey===selected.key).sort((a,b)=>a.ms-b.ms);
 const mostRecent=filtered[filtered.length-1];
 const first=filtered[0];
 // Latest captured spelling is preferred, but case/Unicode aliases share the same profile.
 const displayName=mostRecent.e.artist.trim();
 const yearStats=new Map<number,{plays:number;months:Set<string>}>();
 for(const item of filtered){const v=yearStats.get(item.year)??{plays:0,months:new Set<string>()};v.plays++;v.months.add(item.month);yearStats.set(item.year,v);}
 const years:V860Year[]=[];
 for(let y=first.year;y<=mostRecent.year;y++){
  const v=yearStats.get(y),plays=v?.plays??0,allPlays=yearCounts.get(y)??0;
  years.push({year:y,plays,allPlays,share:allPlays?plays/allPlays:0,activeMonths:v?.months.size??0});
 }
 const peak=years.slice().sort((a,b)=>b.plays-a.plays||a.year-b.year)[0];
 const year=typeof requestedYear==='number'&&Number.isSafeInteger(requestedYear)&&years.some(x=>x.year===requestedYear)?requestedYear:null;
 const overall=ranked(filtered),selectedItems=year===null?filtered:filtered.filter(e=>e.year===year),scoped=year===null?overall:ranked(selectedItems);
 const profile:V860ArtistProfile={key:selected.key,artist:displayName,plays:filtered.length,first:new Date(first.ms).toISOString(),last:new Date(mostRecent.ms).toISOString(),firstMonth:first.month,lastMonth:mostRecent.month,uniqueSongs:overall.songs.length,uniqueAlbums:overall.albums.length,unassignedAlbumPlays:overall.unknown,peakYear:peak.year,peakYearPlays:peak.plays,years,songs:overall.songs.slice(0,12),albums:overall.albums.slice(0,10),yearSongs:scoped.songs.slice(0,12),yearAlbums:scoped.albums.slice(0,10),selectedYear:year};
 return {zone,total:items.length,artists,profile};
}
