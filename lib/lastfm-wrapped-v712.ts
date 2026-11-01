import type {LastFmEventV706} from './lastfm-history-v706';
import type {V711TimeZone} from './lastfm-intelligence-v711';
/** V712: read-only annual recap of valid, locally archived Last.fm scrobbles.
 * Never interpret a scrobble as a measured listening duration or complete annual history.
 */
export type V712RankedArtist={artist:string;plays:number;distinctSongs:number};
export type V712RankedSong={artist:string;title:string;plays:number};
export type V712RankedAlbum={artist:string;album:string;plays:number};
export type V712Month={month:number;label:string;plays:number;artists:number;songs:number};
export type V712Wrapped={year:number;zone:V711TimeZone;plays:number;artists:number;songs:number;albums:number;activeDays:number;
 first:string|null;last:string|null;months:V712Month[];topArtists:V712RankedArtist[];topSongs:V712RankedSong[];topAlbums:V712RankedAlbum[];
 mostActiveMonth:V712Month|null;previousYearPlays:number;previousYearInArchive:boolean;archiveCount:number;archiveAtLimit:boolean;
 oldestArchived:string|null;newestArchived:string|null;isCurrentYear:boolean;mayBeIncomplete:boolean};
const formatter:Record<V711TimeZone,Intl.DateTimeFormat>={
 'Europe/Vienna':new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'}),
 'UTC':new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit'})
};
const monthLabels=['Jän','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const valid=(x:unknown,now:number):x is LastFmEventV706=>{
 if(!x||typeof x!=='object'||Array.isArray(x))return false;
 const e=x as Partial<LastFmEventV706>;
 if(typeof e.artist!=='string'||typeof e.title!=='string'||typeof e.playedAt!=='string')return false;
 if(!e.artist.trim()||!e.title.trim()||e.artist.length>400||e.title.length>400||/[\u0000-\u001f\u007f]/.test(e.artist+e.title))return false;
 if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(e.playedAt))return false;
 const t=Date.parse(e.playedAt);return Number.isFinite(t)&&t>=946684800000&&t<=now&&new Date(t).toISOString()===e.playedAt;
};
const clean=(s:string)=>s.normalize('NFKC').trim().toLocaleLowerCase('en-US');
function parts(epoch:number,zone:V711TimeZone){
 const p:Record<string,string>={};for(const x of formatter[zone].formatToParts(new Date(epoch)))if(x.type!=='literal')p[x.type]=x.value;
 return {year:Number(p.year),month:Number(p.month),date:`${p.year}-${p.month}-${p.day}`};
}
const eventsValid=(events:readonly LastFmEventV706[],now:number)=>Array.isArray(events)?events.filter(x=>valid(x,now)):[];
export function lastFmWrappedYearsV712(events:readonly LastFmEventV706[],now=new Date(),zone:V711TimeZone='Europe/Vienna'){
 const current=Number.isFinite(now.getTime())?now.getTime():Date.now(),tz:V711TimeZone=zone==='UTC'?'UTC':'Europe/Vienna';
 const years=new Set<number>([parts(current,tz).year]);for(const x of eventsValid(events,current))years.add(parts(Date.parse(x.playedAt),tz).year);
 return [...years].sort((a,b)=>b-a);
}
export function lastFmWrappedV712(events:readonly LastFmEventV706[],requestedYear:number,now=new Date(),timeZone:V711TimeZone='Europe/Vienna'):V712Wrapped{
 const time=Number.isFinite(now.getTime())?now.getTime():Date.now();const zone:V711TimeZone=timeZone==='UTC'?'UTC':'Europe/Vienna';
 const currentYear=parts(time,zone).year;
 const year=Number.isSafeInteger(requestedYear)&&requestedYear>=2000&&requestedYear<=currentYear?requestedYear:currentYear;
 const filtered=eventsValid(events,time);const archiveCount=filtered.length;
 const months:V712Month[]=monthLabels.map((label,i)=>({month:i+1,label,plays:0,artists:0,songs:0}));
 const monthArtists=Array.from({length:12},()=>new Set<string>()),monthSongs=Array.from({length:12},()=>new Set<string>());
 const byArtist=new Map<string,{artist:string;plays:number;songs:Set<string>;latest:number}>();
 const bySong=new Map<string,{artist:string;title:string;plays:number;latest:number}>();
 const byAlbum=new Map<string,{artist:string;album:string;plays:number;latest:number}>();
 const days=new Set<string>();let plays=0,first:number|null=null,last:number|null=null,previousYearPlays=0,previousYearInArchive=false;
 let oldestArchived:number|null=null,newestArchived:number|null=null;
 for(const x of filtered){
  const epoch=Date.parse(x.playedAt),p=parts(epoch,zone);oldestArchived=oldestArchived===null?epoch:Math.min(oldestArchived,epoch);newestArchived=newestArchived===null?epoch:Math.max(newestArchived,epoch);
  if(p.year===year-1){previousYearPlays++;previousYearInArchive=true;}
  if(p.year!==year)continue;
  plays++;first=first===null?epoch:Math.min(first,epoch);last=last===null?epoch:Math.max(last,epoch);days.add(p.date);
  const a=clean(x.artist),s=clean(x.title),sk=`${a}\u001f${s}`;months[p.month-1].plays++;monthArtists[p.month-1].add(a);monthSongs[p.month-1].add(sk);
  const artist=byArtist.get(a)??{artist:x.artist,plays:0,songs:new Set<string>(),latest:epoch};artist.plays++;artist.songs.add(sk);
  if(epoch>artist.latest){artist.latest=epoch;artist.artist=x.artist;}byArtist.set(a,artist);
  const song=bySong.get(sk)??{artist:x.artist,title:x.title,plays:0,latest:epoch};song.plays++;
  if(epoch>song.latest){song.latest=epoch;song.artist=x.artist;song.title=x.title;}bySong.set(sk,song);
  if(typeof x.album==='string'&&x.album.trim()&&x.album.length<=400&&!/[\u0000-\u001f\u007f]/.test(x.album)){
   const albumKey=`${a}\u001f${clean(x.album)}`;const album=byAlbum.get(albumKey)??{artist:x.artist,album:x.album,plays:0,latest:epoch};album.plays++;
   if(epoch>album.latest){album.latest=epoch;album.artist=x.artist;album.album=x.album;}byAlbum.set(albumKey,album);
  }
 }
 for(let i=0;i<12;i++){months[i].artists=monthArtists[i].size;months[i].songs=monthSongs[i].size;}
 const mostActiveMonth=[...months].sort((a,b)=>b.plays-a.plays||a.month-b.month)[0];
 const topArtists=[...byArtist.values()].map(x=>({artist:x.artist,plays:x.plays,distinctSongs:x.songs.size})).sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist)).slice(0,10);
 const topSongs=[...bySong.values()].map(x=>({artist:x.artist,title:x.title,plays:x.plays})).sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist)||a.title.localeCompare(b.title)).slice(0,10);
 const topAlbums=[...byAlbum.values()].map(x=>({artist:x.artist,album:x.album,plays:x.plays})).sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist)||a.album.localeCompare(b.album)).slice(0,8);
 // Archive completeness cannot be inferred from scrobble counts; always explain the limitation.
 return {year,zone,plays,artists:byArtist.size,songs:bySong.size,albums:byAlbum.size,activeDays:days.size,
  first:first===null?null:new Date(first).toISOString(),last:last===null?null:new Date(last).toISOString(),months,topArtists,topSongs,topAlbums,
  mostActiveMonth:plays?mostActiveMonth:null,previousYearPlays,previousYearInArchive,archiveCount,archiveAtLimit:archiveCount>=8000,
  oldestArchived:oldestArchived===null?null:new Date(oldestArchived).toISOString(),newestArchived:newestArchived===null?null:new Date(newestArchived).toISOString(),
  isCurrentYear:year===currentYear,mayBeIncomplete:true};
}
