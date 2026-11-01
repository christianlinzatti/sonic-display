/** V727 — on-demand, local-only Last.fm weekly/monthly recap.
 * Windows use viewer-local calendar dates (not fixed millisecond days). All
 * discoveries mean *first in the available archive*, never actual first listen.
 */
import type {LastFmEventV706} from './lastfm-history-v706';
export type V727RecapMode='week'|'month';
export type V727RecapCount={artist:string;plays:number;share:number};
export type V727RecapSong={artist:string;title:string;plays:number;share:number};
export type V727RecapDay={day:string;plays:number;observed:boolean};
export type V727Recap={mode:V727RecapMode;offset:number;empty:boolean;anchorDay:string|null;firstArchivedDay:string|null;
 from:string|null;to:string|null;observedTo:string|null;previousFrom:string|null;previousTo:string|null;
 partial:boolean;total:number;previousTotal:number;delta:number;deltaPercent:number|null;activeDays:number;
 uniqueArtists:number;uniqueSongs:number;newArtists:V727RecapCount[];topArtists:V727RecapCount[];topSongs:V727RecapSong[];
 risingArtists:{artist:string;current:number;previous:number;shareDelta:number}[];days:V727RecapDay[];canGoOlder:boolean};
const key=(s:string)=>s.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const day=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const date=(s:string)=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12);};
const shift=(s:string,n:number)=>{const d=date(s);d.setDate(d.getDate()+n);return day(d);};
const span=(a:string,b:string)=>Math.round((Date.UTC(+b.slice(0,4),+b.slice(5,7)-1,+b.slice(8))-Date.UTC(+a.slice(0,4),+a.slice(5,7)-1,+a.slice(8)))/86400000);
const valid=(e:LastFmEventV706,nowMs:number)=>e&&typeof e.artist==='string'&&e.artist.trim().length>0&&typeof e.title==='string'&&e.title.trim().length>0&&typeof e.playedAt==='string'&&Number.isFinite(Date.parse(e.playedAt))&&Date.parse(e.playedAt)>=946684800000&&Date.parse(e.playedAt)<=nowMs+60000;
function periodStart(anchor:string,mode:V727RecapMode,offset:number){
 const d=date(anchor);
 if(mode==='week')d.setDate(d.getDate()-((d.getDay()+6)%7)-offset*7);
 else d.setDate(1),d.setMonth(d.getMonth()-offset);
 return day(d);
}
function periodEnd(start:string,mode:V727RecapMode){const d=date(start);if(mode==='week')d.setDate(d.getDate()+6);else d.setMonth(d.getMonth()+1,0);return day(d);}
function tally(events:readonly LastFmEventV706[],start:string,end:string){
 const selected=events.filter(e=>{const d=day(new Date(e.playedAt));return d>=start&&d<=end;});
 const artists=new Map<string,{artist:string;plays:number}>(),songs=new Map<string,{artist:string;title:string;plays:number}>();
 const daily=new Map<string,number>();
 for(const e of selected){const a=key(e.artist),s=a+'\u001f'+key(e.title),local=day(new Date(e.playedAt));daily.set(local,(daily.get(local)??0)+1);
  const priorA=artists.get(a);if(priorA)priorA.plays++;else artists.set(a,{artist:e.artist.trim(),plays:1});
  const priorS=songs.get(s);if(priorS)priorS.plays++;else songs.set(s,{artist:e.artist.trim(),title:e.title.trim(),plays:1});
 }
 return {total:selected.length,artists,songs,daily,activeDays:daily.size};
}
const rank=<T extends {plays:number}>(values:Iterable<T>)=>[...values].sort((a,b)=>b.plays-a.plays||JSON.stringify(a).localeCompare(JSON.stringify(b),'de-AT'));
/** offset=0 is the archive's latest period, 1 the period before that, etc. */
export function buildLastFmPeriodRecapV727(events:readonly LastFmEventV706[],mode:V727RecapMode='week',offset=0,now=new Date()):V727Recap{
 if(mode!=='week'&&mode!=='month')throw new Error('Unbekannter Rückblick-Zeitraum.');
 if(!Number.isSafeInteger(offset)||offset<0||offset>1200)throw new Error('Rückblick außerhalb des zulässigen Bereichs.');
 const source=(Array.isArray(events)?events:[]).filter(e=>valid(e,Number.isFinite(now.getTime())?now.getTime():Date.now()));
 const sorted=source.slice().sort((a,b)=>Date.parse(a.playedAt)-Date.parse(b.playedAt));
 const anchor=sorted.length?day(new Date(sorted[sorted.length-1].playedAt)):null;
 const first=sorted.length?day(new Date(sorted[0].playedAt)):null;
 const base={mode,offset,empty:!anchor,anchorDay:anchor,firstArchivedDay:first,from:null,to:null,observedTo:null,previousFrom:null,previousTo:null,partial:false,total:0,previousTotal:0,delta:0,deltaPercent:null,activeDays:0,uniqueArtists:0,uniqueSongs:0,newArtists:[],topArtists:[],topSongs:[],risingArtists:[],days:[],canGoOlder:false} as V727Recap;
 if(!anchor||!first)return base;
 const from=periodStart(anchor,mode,offset),to=periodEnd(from,mode),observedTo=to<anchor?to:anchor;
 const prevFrom=periodStart(from,mode,1),previousEnd=periodEnd(prevFrom,mode);
 // Partial current week/month: compare only the same number of calendar days.
 const prevTo=observedTo<to?shift(prevFrom,Math.min(span(from,observedTo),span(prevFrom,previousEnd))):previousEnd;
 const current=tally(sorted,from,observedTo),previous=tally(sorted,prevFrom,prevTo);
 const firstByArtist=new Map<string,string>();
 for(const e of sorted){const a=key(e.artist);if(!firstByArtist.has(a))firstByArtist.set(a,day(new Date(e.playedAt)));}
 const toCounts=(entries:Iterable<{artist:string;plays:number}>,total:number)=>rank(entries).slice(0,5).map(a=>({...a,share:total?a.plays/total:0}));
 const topArtists=toCounts(current.artists.values(),current.total);
 const topSongs=rank(current.songs.values()).slice(0,5).map(s=>({...s,share:current.total?s.plays/current.total:0}));
 const newArtists=toCounts([...current.artists.entries()].filter(([a])=>(firstByArtist.get(a)??'')>=from&&(firstByArtist.get(a)??'')<=observedTo).map(([,v])=>v),current.total);
 const risingArtists=[...current.artists.entries()].map(([a,v])=>({artist:v.artist,current:v.plays,previous:previous.artists.get(a)?.plays??0,shareDelta:current.total?v.plays/current.total-(previous.total?(previous.artists.get(a)?.plays??0)/previous.total:0):0}))
  .filter(a=>previous.total>0&&a.shareDelta>0).sort((a,b)=>b.shareDelta-a.shareDelta||b.current-a.current||a.artist.localeCompare(b.artist,'de-AT')).slice(0,5);
 const days:V727RecapDay[]=[];
 for(let d=from;d<=to;d=shift(d,1))days.push({day:d,plays:current.daily.get(d)??0,observed:d<=anchor});
 const olderFrom=periodStart(from,mode,1);
 return {...base,empty:false,from,to,observedTo,previousFrom:prevFrom,previousTo:prevTo,partial:observedTo<to,total:current.total,previousTotal:previous.total,delta:current.total-previous.total,deltaPercent:previous.total?((current.total-previous.total)/previous.total)*100:null,activeDays:current.activeDays,uniqueArtists:current.artists.size,uniqueSongs:current.songs.size,newArtists,topArtists,topSongs,risingArtists,days,canGoOlder:olderFrom>=first||from>first};
}
