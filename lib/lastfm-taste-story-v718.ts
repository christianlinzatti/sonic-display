/** V718: read-only musical story from the complete, locally archived Last.fm scrobbles.
 * A play is an archived scrobble, not verified listening time or a complete play.
 * 'First seen' and year-over-year comparisons refer to the observed archive only.
 * All buckets use the viewer's local calendar (consistent with the V716 calendar).
 */
import type {LastFmEventV706} from './lastfm-history-v706';

export type V718FavoriteArtist={artist:string;plays:number;firstObservedYear:number;presentPreviousYear:boolean};
export type V718FavoriteSong={artist:string;title:string;plays:number};
export type V718Month={month:string;plays:number};
export type V718StoryYear={year:number;plays:number;activeDays:number;artists:number;songs:number;
 firstSeenArtists:number;returningArtists:number;retainedArtists:number;continuityPercent:number|null;
 topArtists:V718FavoriteArtist[];topSongs:V718FavoriteSong[];months:V718Month[];
 firstAt:string|null;lastAt:string|null};
export type V718Story={total:number;firstYear:number|null;latestYear:number|null;years:V718StoryYear[];
 mostPlayedYear:number|null;mostExploratoryYear:number|null;mostDiverseYear:number|null};

const normal=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const pad=(number:number)=>String(number).padStart(2,'0');
const validLabel=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0&&value.length<=400&&!/[\u0000-\u001f\u007f]/.test(value);
function isValid(e:unknown,nowMs:number):e is LastFmEventV706{
 if(!e||typeof e!=='object'||Array.isArray(e))return false;
 const x=e as Partial<LastFmEventV706>;
 if(!validLabel(x.artist)||!validLabel(x.title)||typeof x.playedAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x.playedAt))return false;
 const time=Date.parse(x.playedAt);
 return Number.isFinite(time)&&time>=946684800000&&time<=nowMs&&new Date(time).toISOString()===x.playedAt;
}
type YearAcc={year:number;plays:number;days:Set<string>;artistKeys:Set<string>;songKeys:Set<string>;
 artists:Map<string,{artist:string;plays:number;latest:number}>;
 songs:Map<string,{artist:string;title:string;plays:number;latest:number}>;
 months:number[];firstAt:number|null;lastAt:number|null};
const makeYear=(year:number):YearAcc=>({year,plays:0,days:new Set(),artistKeys:new Set(),songKeys:new Set(),artists:new Map(),songs:new Map(),months:Array(12).fill(0),firstAt:null,lastAt:null});
const sortedByCount=<T extends {plays:number}>(a:T,b:T)=>b.plays-a.plays;

export function buildLastFmTasteStoryV718(events:readonly LastFmEventV706[],now=new Date()):V718Story{
 const current=Number.isFinite(now.getTime())?now:new Date();
 const nowMs=current.getTime();
 const byYear=new Map<number,YearAcc>();
 const artistFirstYear=new Map<string,number>();
 let total=0;
 if(Array.isArray(events))for(const event of events){
  if(!isValid(event,nowMs))continue;
  const at=new Date(event.playedAt),time=at.getTime(),year=at.getFullYear();
  // V715/V716 date inputs start at local year 2000; an early UTC event in a western
  // timezone may still belong to 1999 locally and cannot be opened in the explorer.
  if(year<2000)continue;
  const akey=normal(event.artist),skey=`${akey}\u001f${normal(event.title)}`;
  const acc=byYear.get(year)??makeYear(year);
  acc.plays++;acc.days.add(`${year}-${pad(at.getMonth()+1)}-${pad(at.getDate())}`);
  acc.artistKeys.add(akey);acc.songKeys.add(skey);acc.months[at.getMonth()]++;
  acc.firstAt=acc.firstAt===null?time:Math.min(acc.firstAt,time);
  acc.lastAt=acc.lastAt===null?time:Math.max(acc.lastAt,time);
  const artist=acc.artists.get(akey);
  if(artist){artist.plays++;if(time>=artist.latest){artist.artist=event.artist.trim();artist.latest=time;}}
  else acc.artists.set(akey,{artist:event.artist.trim(),plays:1,latest:time});
  const song=acc.songs.get(skey);
  if(song){song.plays++;if(time>=song.latest){song.artist=event.artist.trim();song.title=event.title.trim();song.latest=time;}}
  else acc.songs.set(skey,{artist:event.artist.trim(),title:event.title.trim(),plays:1,latest:time});
  artistFirstYear.set(akey,Math.min(artistFirstYear.get(akey)??year,year));
  byYear.set(year,acc);total++;
 }
 if(!byYear.size)return {total:0,firstYear:null,latestYear:null,years:[],mostPlayedYear:null,mostExploratoryYear:null,mostDiverseYear:null};
 const observedYears=[...byYear.keys()].sort((a,b)=>a-b);
 const firstYear=observedYears[0],latestYear=observedYears[observedYears.length-1];
 const years:V718StoryYear[]=[];
 for(let year=firstYear;year<=latestYear;year++){
  const a=byYear.get(year)??makeYear(year),prev=byYear.get(year-1);
  const firstSeenArtists=[...a.artistKeys].filter(key=>artistFirstYear.get(key)===year).length;
  const retainedArtists=prev&&prev.artistKeys.size?[...a.artistKeys].filter(key=>prev.artistKeys.has(key)).length:0;
  const returningArtists=[...a.artistKeys].filter(key=>(artistFirstYear.get(key)??year)<year).length;
  const continuityPercent=prev?.artistKeys.size&&a.artistKeys.size?Math.round(retainedArtists/a.artistKeys.size*100):null;
  const topArtists=[...a.artists.entries()]
   .map(([key,value]):V718FavoriteArtist=>({artist:value.artist,plays:value.plays,firstObservedYear:artistFirstYear.get(key)??year,presentPreviousYear:prev?.artistKeys.has(key)??false}))
   .sort((x,y)=>sortedByCount(x,y)||x.artist.localeCompare(y.artist,'de')).slice(0,5);
  const topSongs=[...a.songs.values()].sort((x,y)=>sortedByCount(x,y)||x.artist.localeCompare(y.artist,'de')||x.title.localeCompare(y.title,'de'))
   .slice(0,3).map(({artist,title,plays}):V718FavoriteSong=>({artist,title,plays}));
  years.push({year,plays:a.plays,artists:a.artistKeys.size,songs:a.songKeys.size,activeDays:a.days.size,
   firstSeenArtists,returningArtists,retainedArtists,continuityPercent,topArtists,topSongs,
   months:a.months.map((plays,index)=>({month:`${year}-${pad(index+1)}`,plays})),
   firstAt:a.firstAt===null?null:new Date(a.firstAt).toISOString(),lastAt:a.lastAt===null?null:new Date(a.lastAt).toISOString()});
 }
 // Deterministic ties choose the more recent year; zero-observation years aren't records.
 const rank=(key:'plays'|'firstSeenArtists'|'artists')=>years.filter(y=>y.plays>0)
  .sort((a,b)=>b[key]-a[key]||b.year-a.year)[0]?.year??null;
 return {total,firstYear,latestYear,years,mostPlayedYear:rank('plays'),mostExploratoryYear:rank('firstSeenArtists'),mostDiverseYear:rank('artists')};
}

export function selectLastFmStoryYearV718(story:V718Story,requested:number):V718StoryYear|null{
 if(!Number.isSafeInteger(requested))return null;
 return story.years.find(y=>y.year===requested)??null;
}

/** Describes observed turnover only. A missing prior year is not evidence of changed taste. */
export function compareLastFmStoryYearsV718(story:V718Story,year:number){
 const selected=selectLastFmStoryYearV718(story,year);
 const previous=selectLastFmStoryYearV718(story,year-1);
 if(!selected||!previous||!selected.plays||!previous.plays)return {selected,previous:null,delta:null,continuityPercent:null};
 return {selected,previous,delta:selected.plays-previous.plays,continuityPercent:selected.continuityPercent};
}
