/** V719 – read-only comparison of two freely selected calendar years.
 * All times use the local browser calendar. An archived scrobble is not listening time.
 * Discovery/return/absence refer ONLY to observed archived events, not to actual taste.
 */
import type {LastFmEventV706} from './lastfm-history-v706';

export type V719Artist={key:string;name:string;plays:number;share:number};
export type V719Song={key:string;artist:string;title:string;plays:number};
export type V719Year={year:number;plays:number;artists:number;songs:number;days:number;months:number[];
 topArtists:V719Artist[];topSongs:V719Song[]};
export type V719Change={key:string;name:string;before:number;after:number;beforeShare:number;afterShare:number;shareChange:number};
export type V719Discovery={key:string;name:string;plays:number;firstArchiveYear:number};
export type V719Rediscovery={key:string;artist:string;title:string;gapDays:number;returnedAt:string;previousAt:string};
export type V719Comparison={availableYears:number[];a:V719Year;b:V719Year;hasData:boolean;
 delta:{plays:number;artists:number;songs:number;days:number};
 retained:V719Artist[];newInB:V719Discovery[];missingInB:V719Discovery[];movers:V719Change[];
 rediscoveries:V719Rediscovery[];earlierYear:number;laterYear:number};

type ArtistAcc={name:string;plays:number;last:number};
type SongAcc={artist:string;title:string;plays:number;last:number};
type YearAcc={plays:number;days:Set<string>;artists:Map<string,ArtistAcc>;songs:Map<string,SongAcc>;months:number[]};
type Scrobble={at:number;year:number;event:LastFmEventV706;key:string};
const normalize=(v:string)=>v.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const pad=(n:number)=>String(n).padStart(2,'0');
const empty=():YearAcc=>({plays:0,days:new Set(),artists:new Map(),songs:new Map(),months:Array(12).fill(0)});
function safeEvent(raw:unknown,nowMs:number):raw is LastFmEventV706{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
 const e=raw as Partial<LastFmEventV706>;
 if(typeof e.artist!=='string'||typeof e.title!=='string'||!e.artist.trim()||!e.title.trim()||
  e.artist.length>400||e.title.length>400||/[\u0000-\u001f\u007f]/.test(e.artist+e.title)||
  typeof e.playedAt!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/.test(e.playedAt))return false;
 const t=Date.parse(e.playedAt);
 return Number.isFinite(t)&&t>=946684800000&&t<=nowMs&&new Date(t).toISOString()===e.playedAt;
}
const rankArtists=(acc:YearAcc):V719Artist[]=>[...acc.artists.entries()].map(([key,a])=>({key,name:a.name,plays:a.plays,share:acc.plays?a.plays/acc.plays:0}))
 .sort((a,b)=>b.plays-a.plays||a.name.localeCompare(b.name,'de')||a.key.localeCompare(b.key));
const rankSongs=(acc:YearAcc):V719Song[]=>[...acc.songs.entries()].map(([key,s])=>({key,artist:s.artist,title:s.title,plays:s.plays}))
 .sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist,'de')||a.title.localeCompare(b.title,'de'));
const summary=(year:number,a:YearAcc):V719Year=>({year,plays:a.plays,artists:a.artists.size,songs:a.songs.size,days:a.days.size,months:[...a.months],
 topArtists:rankArtists(a).slice(0,5),topSongs:rankSongs(a).slice(0,5)});
function dayNumber(ms:number){const d=new Date(ms);return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);}

/** Lightweight selector data, without sorting/aggregating the entire event stream. */
export function listLastFmYearsV719(events:readonly LastFmEventV706[],now=new Date()):number[]{
 const nowMs=now.getTime(),years=new Set<number>();
 if(!Number.isFinite(nowMs)||!Array.isArray(events))return [];
 for(const e of events){if(!safeEvent(e,nowMs))continue;const y=new Date(e.playedAt).getFullYear();if(y>=2000)years.add(y);}
 return [...years].sort((a,b)=>a-b);
}

/** Linear aggregation plus a chronological scan for genuine >=90 LOCAL-calendar-day gaps.
 * Both selections are independent, and A -> B deltas retain the selected direction.
 */
export function compareLastFmYearsV719(events:readonly LastFmEventV706[],aYear:number,bYear:number,now=new Date()):V719Comparison{
 const current=Number.isFinite(now.getTime())?now:new Date();
 const nowMs=current.getTime();
 const years=new Map<number,YearAcc>();
 const firstArtistYear=new Map<string,number>();
 const valid:Scrobble[]=[];
 if(Array.isArray(events))for(const e of events){
  if(!safeEvent(e,nowMs))continue;
  const time=Date.parse(e.playedAt),at=new Date(time),year=at.getFullYear();
  if(year<2000)continue;
  const artistKey=normalize(e.artist),songKey=`${artistKey}\u001f${normalize(e.title)}`;
  const y=years.get(year)??empty();y.plays++;
  y.days.add(`${year}-${pad(at.getMonth()+1)}-${pad(at.getDate())}`);y.months[at.getMonth()]++;
  const a=y.artists.get(artistKey);
  if(a){a.plays++;if(time>=a.last){a.name=e.artist.trim();a.last=time;}}
  else y.artists.set(artistKey,{name:e.artist.trim(),plays:1,last:time});
  const s=y.songs.get(songKey);
  if(s){s.plays++;if(time>=s.last){s.artist=e.artist.trim();s.title=e.title.trim();s.last=time;}}
  else y.songs.set(songKey,{artist:e.artist.trim(),title:e.title.trim(),plays:1,last:time});
  firstArtistYear.set(artistKey,Math.min(firstArtistYear.get(artistKey)??year,year));
  years.set(year,y);valid.push({at:time,year,event:e,key:songKey});
 }
 const availableYears=[...years.keys()].sort((a,b)=>a-b);
 const maxYear=current.getFullYear();
 const legal=(year:number)=>Number.isSafeInteger(year)&&year>=2000&&year<=maxYear;
 const ay=legal(aYear)?years.get(aYear)??empty():empty();
 const by=legal(bYear)?years.get(bYear)??empty():empty();
 const a=summary(aYear,ay),b=summary(bYear,by);
 const aArtists=rankArtists(ay),bArtists=rankArtists(by);
 const retained=bArtists.filter(artist=>ay.artists.has(artist.key)).slice(0,8);
 const newInB=bArtists.filter(artist=>!ay.artists.has(artist.key)).slice(0,8).map(artist=>({key:artist.key,name:artist.name,plays:artist.plays,firstArchiveYear:firstArtistYear.get(artist.key)??bYear}));
 const missingInB=aArtists.filter(artist=>!by.artists.has(artist.key)).slice(0,8).map(artist=>({key:artist.key,name:artist.name,plays:artist.plays,firstArchiveYear:firstArtistYear.get(artist.key)??aYear}));
 const movers:V719Change[]=bArtists.filter(artist=>ay.artists.has(artist.key)).map(artist=>{
  const before=ay.artists.get(artist.key)!.plays;
  const beforeShare=ay.plays?before/ay.plays:0;
  return {key:artist.key,name:artist.name,before,after:artist.plays,beforeShare,afterShare:artist.share,shareChange:(artist.share-beforeShare)*100};
 }).sort((x,y)=>Math.abs(y.shareChange)-Math.abs(x.shareChange)||y.after-x.after||x.name.localeCompare(y.name,'de')).slice(0,8);
 // For re-discovery, the track must occur in BOTH selected years, and a real
 // >=90-day gap must end in the chronologically later selected year.
 const earlierYear=Math.min(aYear,bYear),laterYear=Math.max(aYear,bYear);
 const earlier=years.get(earlierYear)??empty(),later=years.get(laterYear)??empty();
 const lastBySong=new Map<string,Scrobble>();
 const found=new Map<string,V719Rediscovery>();
 valid.sort((x,y)=>x.at-y.at||x.key.localeCompare(y.key));
 for(const x of valid){
  const prev=lastBySong.get(x.key);
  if(prev&&earlierYear!==laterYear&&x.year===laterYear&&earlier.songs.has(x.key)&&later.songs.has(x.key)){
   const gapDays=dayNumber(x.at)-dayNumber(prev.at);
   if(gapDays>=90){const old=found.get(x.key);
    if(!old||x.at>Date.parse(old.returnedAt))found.set(x.key,{key:x.key,artist:x.event.artist.trim(),title:x.event.title.trim(),gapDays,returnedAt:x.event.playedAt,previousAt:prev.event.playedAt});}
  }
  lastBySong.set(x.key,x);
 }
 const rediscoveries=[...found.values()].sort((x,y)=>y.returnedAt.localeCompare(x.returnedAt)||y.gapDays-x.gapDays||x.key.localeCompare(y.key)).slice(0,8);
 return {availableYears,a,b,hasData:ay.plays>0&&by.plays>0,
  delta:{plays:b.plays-a.plays,artists:b.artists-a.artists,songs:b.songs-a.songs,days:b.days-a.days},
  retained,newInB,missingInB,movers,rediscoveries,earlierYear,laterYear};
}
