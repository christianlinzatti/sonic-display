/** V720 Music Discovery Timeline, derived exclusively from the user's local Last.fm archive.
 * Dates are viewer-local calendar dates. "Discovery" means first OBSERVED archive occurrence,
 * not first-ever hearing. A "favorite moment" is a strictly defined monthly measurement:
 * >=20 observed monthly scrobbles overall; artist >=5 plays, >=10% share, rank among top 3.
 * Scrobbles are neither listening minutes nor evidence about subjective music taste.
 */
import type {LastFmEventV706} from './lastfm-history-v706';

export type V720Song={key:string;artist:string;title:string;plays:number;share:number;firstAt:string;lastAt:string};
export type V720Month={month:string;plays:number;allPlays:number;share:number;rank:number};
export type V720Moment={month:string;plays:number;share:number;rank:number};
export type V720Artist={key:string;artist:string;plays:number;firstAt:string;lastAt:string;firstYear:number;
 activeMonths:number;years:number[];months:V720Month[];topSongs:V720Song[];
 firstRepeatMonth:string|null;favoriteMoment:V720Moment|null;peakMonth:V720Moment};
export type V720DiscoveryYear={year:number;firstSeenArtists:number;scrobbles:number;newArtists:{key:string;artist:string;plays:number}[]};
export type V720Timeline={total:number;artists:V720Artist[];years:V720DiscoveryYear[];firstAt:string|null;lastAt:string|null};

type Tally={artist:string;title:string;plays:number;first:number;last:number};
type Person={artist:string;plays:number;first:number;last:number;byMonth:Map<string,number>;songs:Map<string,Tally>};
const keyOf=(s:string)=>s.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const pad=(n:number)=>String(n).padStart(2,'0');
const monthOf=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
function valid(e:unknown,now:number):e is LastFmEventV706{
 if(!e||typeof e!=='object'||Array.isArray(e))return false;
 const x=e as Partial<LastFmEventV706>;
 if(typeof x.artist!=='string'||typeof x.title!=='string'||!x.artist.trim()||!x.title.trim()||
  x.artist.length>400||x.title.length>400||/[\u0000-\u001f\u007f]/.test(x.artist+x.title)||
  typeof x.playedAt!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/.test(x.playedAt))return false;
 const t=Date.parse(x.playedAt);
 return Number.isFinite(t)&&t>=946684800000&&t<=now&&new Date(t).toISOString()===x.playedAt;
}
const iso=(t:number)=>new Date(t).toISOString();
export function buildLastFmDiscoveryTimelineV720(events:readonly LastFmEventV706[],now=new Date()):V720Timeline{
 const nowMs=now.getTime();
 if(!Array.isArray(events)||!Number.isFinite(nowMs))return {total:0,artists:[],years:[],firstAt:null,lastAt:null};
 const people=new Map<string,Person>(),totals=new Map<string,number>(),monthlyArtist=new Map<string,Map<string,number>>();
 const byYear=new Map<number,number>();
 let total=0,first=Infinity,last=-Infinity;
 for(const e of events){
  if(!valid(e,nowMs))continue;
  const t=Date.parse(e.playedAt),d=new Date(t),year=d.getFullYear();
  if(year<2000)continue;
  const month=monthOf(d),ak=keyOf(e.artist),sk=`${ak}\u001f${keyOf(e.title)}`;
  const p=people.get(ak)??{artist:e.artist.trim(),plays:0,first:t,last:t,byMonth:new Map(),songs:new Map()};
  p.plays++;p.first=Math.min(p.first,t);
  if(t>=p.last){p.last=t;p.artist=e.artist.trim();}
  p.byMonth.set(month,(p.byMonth.get(month)??0)+1);
  const s=p.songs.get(sk)??{artist:e.artist.trim(),title:e.title.trim(),plays:0,first:t,last:t};
  s.plays++;s.first=Math.min(s.first,t);
  if(t>=s.last){s.last=t;s.artist=e.artist.trim();s.title=e.title.trim();}
  p.songs.set(sk,s);people.set(ak,p);
  totals.set(month,(totals.get(month)??0)+1);
  const m=monthlyArtist.get(month)??new Map<string,number>();m.set(ak,(m.get(ak)??0)+1);monthlyArtist.set(month,m);
  byYear.set(year,(byYear.get(year)??0)+1);
  first=Math.min(first,t);last=Math.max(last,t);total++;
 }
 // Rank all artists for a month; ties use canonical keys for deterministic order.
 const ranks=new Map<string,Map<string,number>>();
 for(const [month,counts] of monthlyArtist){
  const ranked=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'en'));
  ranks.set(month,new Map(ranked.map(([key],index)=>[key,index+1])));
 }
 const artists:V720Artist[]=[...people].map(([key,p])=>{
  const months:V720Month[]=[...p.byMonth].sort((a,b)=>a[0].localeCompare(b[0])).map(([month,plays])=>({month,plays,allPlays:totals.get(month)??0,share:plays/(totals.get(month)??1),rank:ranks.get(month)?.get(key)??0}));
  const favorite=months.find(m=>m.allPlays>=20&&m.plays>=5&&m.share>=.10&&m.rank<=3);
  const peak=months.slice().sort((a,b)=>b.plays-a.plays||b.share-a.share||a.month.localeCompare(b.month))[0];
  const topSongs:V720Song[]=[...p.songs].map(([key,s])=>({key,artist:s.artist,title:s.title,plays:s.plays,share:s.plays/p.plays,firstAt:iso(s.first),lastAt:iso(s.last)}))
   .sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist,'de')||a.title.localeCompare(b.title,'de')).slice(0,5);
  return {key,artist:p.artist,plays:p.plays,firstAt:iso(p.first),lastAt:iso(p.last),firstYear:new Date(p.first).getFullYear(),
   activeMonths:months.length,years:[...new Set(months.map(m=>Number(m.month.slice(0,4))))],months,topSongs,
   firstRepeatMonth:months.find(m=>m.plays>=5)?.month??null,
   favoriteMoment:favorite?{month:favorite.month,plays:favorite.plays,share:favorite.share,rank:favorite.rank}:null,
   peakMonth:{month:peak.month,plays:peak.plays,share:peak.share,rank:peak.rank}};
 }).sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist,'de')||a.key.localeCompare(b.key));
 const firstYear=total?new Date(first).getFullYear():null,lastYear=total?new Date(last).getFullYear():null;
 const years:V720DiscoveryYear[]=[];
 if(firstYear!==null&&lastYear!==null)for(let year=firstYear;year<=lastYear;year++){
  const newArtists=artists.filter(a=>a.firstYear===year);
  years.push({year,firstSeenArtists:newArtists.length,scrobbles:byYear.get(year)??0,
   newArtists:newArtists.slice(0,5).map(a=>({key:a.key,artist:a.artist,plays:a.plays}))});
 }
 return {total,artists,years,firstAt:total?iso(first):null,lastAt:total?iso(last):null};
}

export function findLastFmDiscoveryArtistV720(timeline:V720Timeline,key:string):V720Artist|null{
 return timeline.artists.find(a=>a.key===key)??null;
}
export function searchLastFmDiscoveryArtistsV720(timeline:V720Timeline,query:string,limit=12):V720Artist[]{
 const term=keyOf(query);
 const cap=Number.isSafeInteger(limit)?Math.max(0,Math.min(50,limit)):12;
 return timeline.artists.filter(a=>a.key.includes(term)).slice(0,cap);
}
export function lastFmDiscoveryYearMonthsV720(artist:V720Artist,year:number):V720Month[]{
 if(!Number.isSafeInteger(year)||year<2000||year>9999)return [];
 const byMonth=new Map(artist.months.filter(m=>m.month.startsWith(`${year}-`)).map(m=>[m.month,m]));
 return Array.from({length:12},(_,i)=>{
  const month=`${year}-${pad(i+1)}`;
  return byMonth.get(month)??{month,plays:0,allPlays:0,share:0,rank:0};
 });
}
