/** V721 Artist Discovery Dashboard. Pure, read-only analysis of already loaded Last.fm archive.
 * Rolling windows are 30 VIEWER-LOCAL CALENDAR DAYS anchored at last observed archive day,
 * not at the computer clock: this keeps older/incomplete archives understandable.
 * All labels describe recorded scrobbles, never verified first listens or inferred genres.
 */
import type {LastFmEventV706} from './lastfm-history-v706';

export type V721Artist={key:string;artist:string;plays:number;firstAt:string;lastAt:string;
 years:number[];activeMonths:number;currentPlays:number;previousPlays:number;
 currentShare:number;previousShare:number;shareChange:number};
export type V721Comeback={artist:V721Artist;previousAt:string;returnedAt:string;returnDay:string;gapDays:number;playsAfterReturn:number};
export type V721Dashboard={total:number;artistCount:number;asOf:string|null;
 current:{from:string;to:string;plays:number};previous:{from:string;to:string;plays:number};
 rising:V721Artist[];loyal:V721Artist[];comebacks:V721Comeback[];
 comparable:boolean;limitations:string};
type Seen={artist:string;first:number;last:number;plays:number;years:Set<number>;months:Set<string>;times:number[];current:number;previous:number};
const normalized=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const pad=(n:number)=>String(n).padStart(2,'0');
const localDay=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const localIndex=(d:Date)=>Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);
const localOffsetDay=(d:Date,days:number)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+days,12);
const iso=(t:number)=>new Date(t).toISOString();
const asc=(a:V721Artist,b:V721Artist)=>a.artist.localeCompare(b.artist,'de')||a.key.localeCompare(b.key,'en');
function valid(raw:unknown,nowMs:number):raw is LastFmEventV706{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
 const e=raw as Partial<LastFmEventV706>;
 if(typeof e.artist!=='string'||typeof e.title!=='string'||!e.artist.trim()||!e.title.trim()||e.artist.length>400||e.title.length>400||/[\u0000-\u001f\u007f]/.test(e.artist+e.title))return false;
 if(typeof e.playedAt!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.\d{3}Z$/.test(e.playedAt))return false;
 const ms=Date.parse(e.playedAt);
 return Number.isFinite(ms)&&ms>=946684800000&&ms<=nowMs&&new Date(ms).toISOString()===e.playedAt;
}
function empty():V721Dashboard{return {total:0,artistCount:0,asOf:null,current:{from:'',to:'',plays:0},previous:{from:'',to:'',plays:0},rising:[],loyal:[],comebacks:[],comparable:false,limitations:'Keine gültigen archivierten Scrobbles.'};}

export function buildLastFmArtistDashboardV721(events:readonly LastFmEventV706[],now=new Date()):V721Dashboard{
 const nowMs=now.getTime();if(!Array.isArray(events)||!Number.isFinite(nowMs))return empty();
 // Preserve genuine repeats at different timestamps, reject identical archive entries.
 const unique=new Set<string>();const entries:{artist:string;key:string;time:number;date:Date;day:number;title:string}[]=[];
 let anchor=-Infinity;
 for(const e of events){
  if(!valid(e,nowMs))continue;
  const time=Date.parse(e.playedAt),date=new Date(time),year=date.getFullYear();if(year<2000||year>9999)continue;
  const key=normalized(e.artist),title=normalized(e.title),album=typeof e.album==='string'?normalized(e.album):'';
  const identity=`${time}\u001f${key}\u001f${title}\u001f${album}`;if(unique.has(identity))continue;unique.add(identity);
  entries.push({artist:e.artist.trim(),key,time,date,day:localIndex(date),title});anchor=Math.max(anchor,time);
 }
 if(!entries.length)return empty();
 const anchorDate=new Date(anchor),lastDay=localIndex(anchorDate),currentStart=lastDay-29,previousStart=lastDay-59;
 const curr={from:localDay(localOffsetDay(anchorDate,-29)),to:localDay(anchorDate),plays:0};
 const prev={from:localDay(localOffsetDay(anchorDate,-59)),to:localDay(localOffsetDay(anchorDate,-30)),plays:0};
 const people=new Map<string,Seen>();
 for(const e of entries){
  const p=people.get(e.key)??{artist:e.artist,first:e.time,last:e.time,plays:0,years:new Set<number>(),months:new Set<string>(),times:[],current:0,previous:0};
  p.plays++;p.first=Math.min(p.first,e.time);
  if(e.time>=p.last){p.last=e.time;p.artist=e.artist;}
  p.years.add(e.date.getFullYear());p.months.add(`${e.date.getFullYear()}-${pad(e.date.getMonth()+1)}`);p.times.push(e.time);
  if(e.day>=currentStart&&e.day<=lastDay){p.current++;curr.plays++;}
  else if(e.day>=previousStart&&e.day<currentStart){p.previous++;prev.plays++;}
  people.set(e.key,p);
 }
 // Require both observation windows to have at least 10 scrobbles. This avoids calling
 // trivial changes on tiny archives an emerging listening trend.
 const comparable=curr.plays>=10&&prev.plays>=10;
 const all:V721Artist[]=[...people].map(([key,p])=>({key,artist:p.artist,plays:p.plays,firstAt:iso(p.first),lastAt:iso(p.last),years:[...p.years].sort((a,b)=>a-b),activeMonths:p.months.size,
  currentPlays:p.current,previousPlays:p.previous,currentShare:curr.plays?p.current/curr.plays:0,previousShare:prev.plays?p.previous/prev.plays:0,
  shareChange:(curr.plays?p.current/curr.plays:0)-(prev.plays?p.previous/prev.plays:0)}));
 const byKey=new Map(all.map(a=>[a.key,a]));
 // 'Rising' means at least 3 recent scrobbles, >=5 percentage points share gain,
 // and >=2 extra plays compared to the previous 30 calendar days.
 const rising=comparable?all.filter(a=>a.currentPlays>=3&&a.currentPlays>=a.previousPlays+2&&a.shareChange>=.05-1e-12)
  .sort((a,b)=>b.shareChange-a.shareChange||b.currentPlays-a.currentPlays||asc(a,b)):[];
 // 3 observed calendar years + >=30 plays, with at least one in the trailing 365
 // observed calendar days. No claim that all intermediate days/years were complete.
 const loyal=all.filter(a=>a.years.length>=3&&a.plays>=30&&people.get(a.key)!.times.some(t=>localIndex(new Date(t))>=lastDay-364))
  .sort((a,b)=>b.years.length-a.years.length||b.plays-a.plays||asc(a,b));
 const comebacks:V721Comeback[]=[];
 for(const [key,p] of people){
  const a=byKey.get(key)!;const times=p.times.sort((x,y)=>x-y);
  // Choose most recent qualified return in the trailing 90 LOCAL calendar days.
  // The preceding event must exist in archive; a first observation isn't a comeback.
  for(let i=times.length-1;i>=1;i--){
   const returnedAt=times[i],before=times[i-1],day=localIndex(new Date(returnedAt));
   if(day<lastDay-89)break;
   const gapDays=day-localIndex(new Date(before));
   if(gapDays<90)continue;
   comebacks.push({artist:a,previousAt:iso(before),returnedAt:iso(returnedAt),returnDay:localDay(new Date(returnedAt)),gapDays,playsAfterReturn:times.length-i});break;
  }
 }
 comebacks.sort((a,b)=>Date.parse(b.returnedAt)-Date.parse(a.returnedAt)||b.gapDays-a.gapDays||asc(a.artist,b.artist));
 return {total:entries.length,artistCount:all.length,asOf:localDay(anchorDate),current:curr,previous:prev,rising,loyal,comebacks,comparable,
  limitations:'Die Zeitfenster enden am neuesten Scrobble im Archiv und beziehen sich auf lokale Kalendertage. Lücken und unvollständige Importe können Trends verfälschen.'};
}
export function filterLastFmArtistDashboardV721<T extends {artist:V721Artist}|V721Artist>(entries:readonly T[],query:string,limit=12):T[]{
 const q=normalized(typeof query==='string'?query:'');const cap=Number.isSafeInteger(limit)?Math.min(50,Math.max(0,limit)):12;
 return entries.filter(x=>normalized(('artist' in x&&typeof x.artist==='object'?x.artist.artist:(x as V721Artist).artist)).includes(q)).slice(0,cap);
}
