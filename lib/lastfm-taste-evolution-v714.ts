import type {LastFmEventV706} from './lastfm-history-v706';
import type {V711TimeZone} from './lastfm-intelligence-v711';

/** V714: read-only longitudinal analysis of local Last.fm scrobbles.
 * All "new" / "returning" claims refer only to FIRST / PREVIOUS observations in this local archive.
 * Genre cannot be inferred from artist names: reliable tags are deliberately not invented.
 */
export type V714Year={year:number;plays:number;artists:number;songs:number;activeDays:number;firstSeenArtists:number};
export type V714Artist={artist:string;plays:number;previous:number;change:number;firstYear:number;lastYear:number;yearsActive:number};
export type V714Return={artist:string;plays:number;previousObservedYear:number;gapYears:number};
export type V714Timeline={artist:string;counts:number[];total:number};
export type V714Evolution={zone:V711TimeZone;selectedYear:number;compareYear:number;total:number;
 years:V714Year[];selected:V714Year;previous:V714Year;hasComparison:boolean;
 newArtists:V714Artist[];returning:V714Return[];rising:V714Artist[];falling:V714Artist[];
 stableFavorites:V714Artist[];timeline:V714Timeline[];earliest:string|null;latest:string|null;
 mayBeIncomplete:true;genreDataAvailable:false};
const fmt:Record<V711TimeZone,Intl.DateTimeFormat>={
 'Europe/Vienna':new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'}),
 'UTC':new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit'})
};
const key=(text:string)=>text.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const cleanLabel=(value:unknown):value is string=>typeof value==='string'&&!!value.trim()&&value.length<=400&&!/[\u0000-\u001f\u007f]/.test(value);
const good=(x:unknown,nowMs:number):x is LastFmEventV706=>{
 if(!x||typeof x!=='object'||Array.isArray(x))return false;
 const e=x as Partial<LastFmEventV706>;
 if(!cleanLabel(e.artist)||!cleanLabel(e.title)||typeof e.playedAt!=='string'||!/^(?:19|20)\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(e.playedAt))return false;
 const t=Date.parse(e.playedAt);
 return Number.isFinite(t)&&t>=946684800000&&t<=nowMs&&new Date(t).toISOString()===e.playedAt;
};
const yearAndDay=(ms:number,zone:V711TimeZone)=>{
 const p:Record<string,string>={};
 for(const x of fmt[zone].formatToParts(new Date(ms)))if(x.type!=='literal')p[x.type]=x.value;
 return {year:Number(p.year),day:`${p.year}-${p.month}-${p.day}`};
};
type ArtistAcc={artist:string;plays:Map<number,number>;firstYear:number;lastYear:number;lastTime:number};
type YearAcc={plays:number;artists:Set<string>;songs:Set<string>;days:Set<string>};
const blankYear=(year:number):V714Year=>({year,plays:0,artists:0,songs:0,activeDays:0,firstSeenArtists:0});

export function lastFmTasteYearsV714(events:readonly LastFmEventV706[],now=new Date(),zone:V711TimeZone='Europe/Vienna'):number[]{
 const tz:V711TimeZone=zone==='UTC'?'UTC':'Europe/Vienna',nowMs=Number.isFinite(now.getTime())?now.getTime():Date.now();
 const years=new Set<number>([yearAndDay(nowMs,tz).year]);
 if(Array.isArray(events))for(const e of events)if(good(e,nowMs))years.add(yearAndDay(Date.parse(e.playedAt),tz).year);
 return [...years].sort((a,b)=>b-a);
}

export function lastFmTasteEvolutionV714(events:readonly LastFmEventV706[],requestedYear:number,now=new Date(),timeZone:V711TimeZone='Europe/Vienna'):V714Evolution{
 const nowMs=Number.isFinite(now.getTime())?now.getTime():Date.now(),zone:V711TimeZone=timeZone==='UTC'?'UTC':'Europe/Vienna';
 const currentYear=yearAndDay(nowMs,zone).year;
 const selectedYear=Number.isSafeInteger(requestedYear)&&requestedYear>=2000&&requestedYear<=currentYear?requestedYear:currentYear;
 const compareYear=selectedYear-1;
 const byYear=new Map<number,YearAcc>(),byArtist=new Map<string,ArtistAcc>();
 let total=0,earliest:number|null=null,latest:number|null=null;
 if(Array.isArray(events))for(const e of events){
  if(!good(e,nowMs))continue;
  const epoch=Date.parse(e.playedAt),{year,day}=yearAndDay(epoch,zone),ak=key(e.artist),sk=`${ak}\u001f${key(e.title)}`;
  const annual=byYear.get(year)??{plays:0,artists:new Set<string>(),songs:new Set<string>(),days:new Set<string>()};
  annual.plays++;annual.artists.add(ak);annual.songs.add(sk);annual.days.add(day);byYear.set(year,annual);
  const artist=byArtist.get(ak)??{artist:e.artist.trim(),plays:new Map<number,number>(),firstYear:year,lastYear:year,lastTime:epoch};
  artist.plays.set(year,(artist.plays.get(year)??0)+1);
  artist.firstYear=Math.min(artist.firstYear,year);artist.lastYear=Math.max(artist.lastYear,year);
  if(epoch>=artist.lastTime){artist.artist=e.artist.trim();artist.lastTime=epoch;}byArtist.set(ak,artist);
  total++;earliest=earliest===null?epoch:Math.min(earliest,epoch);latest=latest===null?epoch:Math.max(latest,epoch);
 }
 const years:number[]=[];
 const firstYear=byYear.size?Math.min(selectedYear,...byYear.keys()):selectedYear;
 const lastYear=Math.max(currentYear,...byYear.keys());
 // Calendar axis stays bounded to the valid archive era, including zero months/years.
 for(let y=Math.max(2000,firstYear);y<=lastYear;y++)years.push(y);
 const annual:V714Year[]=years.map(year=>{
  const a=byYear.get(year);if(!a)return blankYear(year);
  let firstSeenArtists=0;for(const artist of a.artists)if(byArtist.get(artist)?.firstYear===year)firstSeenArtists++;
  return {year,plays:a.plays,artists:a.artists.size,songs:a.songs.size,activeDays:a.days.size,firstSeenArtists};
 });
 const getYear=(y:number)=>annual.find(x=>x.year===y)??blankYear(y);
 const selected=getYear(selectedYear),previous=getYear(compareYear),hasComparison=selected.plays>0&&previous.plays>0;
 const sortedArtists=[...byArtist.values()];
 const asRank=(a:ArtistAcc):V714Artist=>{const plays=a.plays.get(selectedYear)??0,prev=a.plays.get(compareYear)??0;
  return {artist:a.artist,plays,previous:prev,change:plays-prev,firstYear:a.firstYear,lastYear:a.lastYear,yearsActive:a.plays.size};};
 const selectedArtists=sortedArtists.filter(a=>a.plays.has(selectedYear)).map(asRank);
 const byRank=(a:V714Artist,b:V714Artist)=>b.plays-a.plays||a.artist.localeCompare(b.artist);
 const newArtists=selectedArtists.filter(a=>a.firstYear===selectedYear).sort(byRank).slice(0,10);
 const returning:V714Return[]=sortedArtists.filter(a=>a.plays.has(selectedYear)&&a.firstYear<selectedYear&&(!a.plays.has(compareYear)))
  .map(a=>{const preceding=[...a.plays.keys()].filter(y=>y<selectedYear),prior=Math.max(...preceding);return {artist:a.artist,plays:a.plays.get(selectedYear)??0,previousObservedYear:prior,gapYears:selectedYear-prior-1};})
  .filter(a=>a.gapYears>=1).sort((a,b)=>b.plays-a.plays||b.gapYears-a.gapYears||a.artist.localeCompare(b.artist)).slice(0,10);
 const rising=hasComparison?selectedArtists.filter(a=>a.previous>0&&a.change>0).sort((a,b)=>b.change-a.change||b.plays-a.plays||a.artist.localeCompare(b.artist)).slice(0,10):[];
 const falling=hasComparison?sortedArtists.filter(a=>(a.plays.get(compareYear)??0)>(a.plays.get(selectedYear)??0))
  .map(asRank).sort((a,b)=>a.change-b.change||a.artist.localeCompare(b.artist)).slice(0,10):[];
 const stableFavorites=selectedArtists.filter(a=>a.yearsActive>=3).sort((a,b)=>b.yearsActive-a.yearsActive||b.plays-a.plays||a.artist.localeCompare(b.artist)).slice(0,10);
 const timeline=sortedArtists.filter(a=>a.plays.has(selectedYear)||a.plays.has(compareYear))
  .sort((a,b)=>(b.plays.get(selectedYear)??0)-(a.plays.get(selectedYear)??0)||a.artist.localeCompare(b.artist)).slice(0,6)
  .map(a=>({artist:a.artist,counts:annual.map(x=>a.plays.get(x.year)??0),total:[...a.plays.values()].reduce((v,c)=>v+c,0)}));
 return {zone,selectedYear,compareYear,total,years:annual,selected,previous,hasComparison,
  newArtists,returning,rising,falling,stableFavorites,timeline,earliest:earliest===null?null:new Date(earliest).toISOString(),latest:latest===null?null:new Date(latest).toISOString(),
  mayBeIncomplete:true,genreDataAvailable:false};
}
