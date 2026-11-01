/** V706: Last.fm history is independent from the Spotify ID-based V701 archive. */
export const V706_FORMAT='sonic-display-lastfm-history-v706';
export const V706_STORAGE_PREFIX='sonic-display:lastfm:history:v706:';
export const V706_USERNAME_KEY='sonic-display:lastfm:username:v706';
export const V706_MAX_EVENTS=8000;
export const V706_MAX_JSON_CHARS=3_800_000;
export const V706_PAGE_SIZE=200;
export type LastFmEventV706={artist:string;title:string;album:string;playedAt:string;url:string|null;cover:string|null};
export type LastFmPageV706={username:string;events:LastFmEventV706[];nowPlaying:{artist:string;title:string}|null;page:number;totalPages:number;total:number};
export type LastFmArchiveV706={format:typeof V706_FORMAT;version:1;username:string;updatedAt:string;events:LastFmEventV706[]};
export type LastFmStorageV706={getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void};
export type LastFmReadV706={archive:LastFmArchiveV706|null;error:string|null};
type Obj=Record<string,unknown>;
const obj=(x:unknown):x is Obj=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const str=(x:unknown,max=400):x is string=>typeof x==='string'&&x.trim().length>0&&x.length<=max&&!/[\u0000-\u001f\u007f]/.test(x);
export const validLastFmUsernameV706=(x:unknown):x is string=>str(x,64)&&/^[A-Za-z0-9][A-Za-z0-9_. -]{0,63}$/.test(x)&&x===x.trim();
export const canonicalLastFmUsernameV706=(x:string)=>x.toLocaleLowerCase('en-US');
export const lastFmArchiveKeyV706=(user:string)=>`${V706_STORAGE_PREFIX}${encodeURIComponent(canonicalLastFmUsernameV706(user))}`;
const validIso=(value:unknown):value is string=>typeof value==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
function safeLastfmLink(x:unknown):string|null{
 if(!str(x,2048))return null;
 try{const u=new URL(x);return u.protocol==='https:'&&(u.hostname==='www.last.fm'||u.hostname==='last.fm')&&u.username===''&&u.password===''&&u.pathname.startsWith('/music/')?u.toString():null;}catch{return null;}
}
function safeLastfmCover(x:unknown):string|null{
 if(!str(x,2048))return null;
 try{const u=new URL(x);const host=u.hostname.toLowerCase();return u.protocol==='https:'&&(host==='lastfm.freetls.fastly.net'||host==='lastfm-img2.akamaized.net'||host.endsWith('.last.fm'))?u.toString():null;}catch{return null;}
}
function artistText(x:unknown):string|null{
 const value=obj(x)?x['#text']:x;
 return str(value)?value.trim():null;
}
function eventFrom(x:unknown,nowMs:number):LastFmEventV706|null{
 if(!obj(x)||!str(x.artist)||!str(x.title)||!str(x.album,400)||!validIso(x.playedAt))return null;
 const timestamp=Date.parse(x.playedAt);if(timestamp<946684800000||timestamp>nowMs+60000)return null;
 if(x.url!==null&&x.url!==undefined&&safeLastfmLink(x.url)===null)return null;
 if(x.cover!==null&&x.cover!==undefined&&safeLastfmCover(x.cover)===null)return null;
 return {artist:x.artist.trim(),title:x.title.trim(),album:x.album.trim(),playedAt:x.playedAt,url:safeLastfmLink(x.url),cover:safeLastfmCover(x.cover)};
}
const normal=(x:string)=>x.normalize('NFKC').trim().toLocaleLowerCase('en-US');
export const lastFmEventKeyV706=(e:LastFmEventV706)=>`${e.playedAt}\u001f${normal(e.artist)}\u001f${normal(e.title)}\u001f${normal(e.album)}`;
/** Validate upstream JSON; exclude the now-playing item (which has no scrobble timestamp). */
export function normalizeLastFmPageV706(raw:unknown,username:string,now=new Date()):LastFmPageV706|null{
 if(!validLastFmUsernameV706(username)||!obj(raw)||!obj(raw.recenttracks))return null;
 const result=raw.recenttracks,attr=result['@attr'];if(!obj(attr))return null;
 const page=Number(attr.page),totalPages=Number(attr.totalPages),total=Number(attr.total);
 if(!Number.isSafeInteger(page)||page<1||!Number.isSafeInteger(totalPages)||totalPages<0||totalPages>1000000||!Number.isSafeInteger(total)||total<0||total>100000000)return null;
 if(str(attr.user,64)&&canonicalLastFmUsernameV706(attr.user)!==canonicalLastFmUsernameV706(username))return null;
 const entries=Array.isArray(result.track)?result.track:result.track===undefined?[]:[result.track];if(entries.length>V706_PAGE_SIZE+1)return null;
 const seen=new Set<string>(),events:LastFmEventV706[]=[];let nowPlaying:LastFmPageV706['nowPlaying']=null;
 for(const entry of entries){if(!obj(entry))continue;
  const artist=artistText(entry.artist),title=str(entry.name)?entry.name.trim():null;
  if(!artist||!title)continue;
  if(obj(entry['@attr'])&&entry['@attr'].nowplaying==='true'){
   if(!nowPlaying)nowPlaying={artist,title};continue;
  }
  const uts=obj(entry.date)?entry.date.uts:undefined;
  if(typeof uts!=='string'||!/^\d{10,11}$/.test(uts))continue;
  const seconds=Number(uts);if(!Number.isSafeInteger(seconds))continue;
  const album=artistText(entry.album)??'Album unbekannt';
  const images=Array.isArray(entry.image)?entry.image:[];
  const cover=images.map(i=>obj(i)?safeLastfmCover(i['#text']):null).filter((i):i is string=>Boolean(i)).pop()??null;
  const event=eventFrom({artist,title,album,playedAt:new Date(seconds*1000).toISOString(),url:safeLastfmLink(entry.url),cover},now.getTime());
  if(!event)continue;const key=lastFmEventKeyV706(event);if(seen.has(key))continue;seen.add(key);events.push(event);
 }
 events.sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt));
 return {username,events,nowPlaying,page,totalPages,total};
}
export function emptyLastFmArchiveV706(user:string,now=new Date()):LastFmArchiveV706{
 if(!validLastFmUsernameV706(user))throw new Error('Ungültiger Last.fm-Benutzername.');
 return {format:V706_FORMAT,version:1,username:user,updatedAt:now.toISOString(),events:[]};
}
export function validateLastFmArchiveV706(input:unknown,user:string,now=new Date()):LastFmArchiveV706{
 if(!validLastFmUsernameV706(user)||!obj(input)||input.format!==V706_FORMAT||input.version!==1||!validLastFmUsernameV706(input.username)||canonicalLastFmUsernameV706(input.username)!==canonicalLastFmUsernameV706(user)||!validIso(input.updatedAt)||!Array.isArray(input.events)||input.events.length>V706_MAX_EVENTS)throw new Error('Ungültiges Archivformat oder falsches Last.fm-Konto.');
 const events:LastFmEventV706[]=[],seen=new Set<string>();
 for(const raw of input.events){const e=eventFrom(raw,now.getTime());if(!e)throw new Error('Archiv enthält ungültige Daten.');const key=lastFmEventKeyV706(e);if(seen.has(key))throw new Error('Archiv enthält doppelte Ereignisse.');seen.add(key);events.push(e);}
 events.sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt));
 return {format:V706_FORMAT,version:1,username:user,updatedAt:input.updatedAt,events};
}
export function parseLastFmArchiveV706(raw:string,user:string,now=new Date()):LastFmArchiveV706{
 if(typeof raw!=='string'||raw.length>V706_MAX_JSON_CHARS)throw new Error('Archivdatei ist zu groß.');
 let parsed:unknown;try{parsed=JSON.parse(raw);}catch{throw new Error('Archiv ist kein gültiges JSON.');}
 return validateLastFmArchiveV706(parsed,user,now);
}
/** Explicit same-timestamp/artist/song/album duplicates are collapsed, not genuine replays on different timestamps. */
export function mergeLastFmArchiveV706(archive:LastFmArchiveV706,incoming:readonly LastFmEventV706[],now=new Date()){
 const keys=new Set(archive.events.map(lastFmEventKeyV706)),added:LastFmEventV706[]=[];
 for(const raw of incoming.slice(0,V706_MAX_EVENTS)){const e=eventFrom(raw,now.getTime());if(!e)continue;const k=lastFmEventKeyV706(e);if(keys.has(k))continue;keys.add(k);added.push(e);}
 if(!added.length)return {archive,added:0,trimmed:0};
 const all=[...archive.events,...added].sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt));
 return {archive:{...archive,updatedAt:now.toISOString(),events:all.slice(0,V706_MAX_EVENTS)},added:added.length,trimmed:Math.max(0,all.length-V706_MAX_EVENTS)};
}
export function readLastFmArchiveV706(storage:LastFmStorageV706,user:string,now=new Date()):LastFmReadV706{
 if(!validLastFmUsernameV706(user))return {archive:null,error:'Last.fm-Benutzername ungültig.'};
 try{const raw=storage.getItem(lastFmArchiveKeyV706(user));return raw===null?{archive:null,error:null}:{archive:parseLastFmArchiveV706(raw,user,now),error:null};}
 catch{return {archive:null,error:'Archiv beschädigt oder nicht lesbar. Es wurde nicht überschrieben.'};}
}
export function writeLastFmArchiveV706(storage:LastFmStorageV706,archive:LastFmArchiveV706,now=new Date()):LastFmReadV706{
 try{const clean=validateLastFmArchiveV706(archive,archive.username,now),raw=JSON.stringify(clean);
  if(raw.length>V706_MAX_JSON_CHARS)return {archive:null,error:'Das Archiv ist zu groß. Bitte JSON-Backup erstellen.'};
  storage.setItem(lastFmArchiveKeyV706(clean.username),raw);return {archive:clean,error:null};
 }catch{return {archive:null,error:'Browser-Speicher nicht beschreibbar; das bisherige Archiv bleibt erhalten.'};}
}
export function lastFmHistoryStatsV706(events:readonly LastFmEventV706[]){
 const artist=new Map<string,number>(),songs=new Map<string,{artist:string;title:string;plays:number}>(),months=new Map<string,number>();
 for(const e of events){const key=normal(e.artist)+'\u001f'+normal(e.title);const previous=songs.get(key);if(previous)previous.plays++;else songs.set(key,{artist:e.artist,title:e.title,plays:1});artist.set(e.artist,(artist.get(e.artist)??0)+1);const month=e.playedAt.slice(0,7);months.set(month,(months.get(month)??0)+1);}
 return {plays:events.length,uniqueSongs:songs.size,artists:artist.size,topSongs:[...songs.values()].sort((a,b)=>b.plays-a.plays||a.title.localeCompare(b.title)).slice(0,10),topArtists:[...artist.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,10),months:[...months.entries()].sort((a,b)=>b[0].localeCompare(a[0])).slice(0,12)};
}
