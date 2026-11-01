/** V728 – read-only On This Day: same viewer-local calendar date in earlier archive years.
 * This is evidence of archived scrobbles, NEVER proof of listening gaps or of first discovery.
 * The leap day is matched only to February 29 (no invented February 28 substitute).
 */
import type {LastFmEventV706} from './lastfm-history-v706';
export type V728Track={artist:string;title:string;plays:number;years:number[]};
export type V728Artist={artist:string;plays:number};
export type V728Moment={artist:string;title:string;playedAt:string};
export type V728Year={year:number;day:string;plays:number;uniqueArtists:number;uniqueSongs:number;artists:V728Artist[];songs:V728Track[];moments:V728Moment[]};
export type V728Result={referenceDay:string;monthDay:string;firstArchivedDay:string|null;lastArchivedDay:string|null;lookbackYears:number;years:V728Year[];total:number;repeatedSongs:V728Track[];matchedYears:number;hasArchive:boolean;};
const localDay=(value:Date)=>`${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
const key=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const songKey=(artist:string,title:string)=>key(artist)+'\u001f'+key(title);
const compare=(a:string,b:string)=>a.localeCompare(b,'de-AT');
function dateKey(value:string){
 if(!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value))return false;
 const [y,m,d]=value.split('-').map(Number);
 if(y<2000||y>9999)return false;
 const noon=new Date(y,m-1,d,12);
 return noon.getFullYear()===y&&noon.getMonth()===m-1&&noon.getDate()===d;
}
/** @param referenceDay a local YYYY-MM-DD, defaults to today's calendar day.
 * @param lookbackYears 1–100 earlier calendar years, independently of archive coverage.
 */
export function buildLastFmOnThisDayV728(events:readonly LastFmEventV706[],referenceDay?:string,now=new Date(),lookbackYears=30):V728Result{
 const nowMs=now instanceof Date&&Number.isFinite(now.getTime())?now.getTime():Date.now();
 const today=localDay(new Date(nowMs));
 const selectedDay=referenceDay===undefined?today:referenceDay;
 if(!dateKey(selectedDay)||selectedDay>today)throw new Error('Bitte einen gültigen Kalendertag bis einschließlich heute wählen.');
 if(!Number.isSafeInteger(lookbackYears)||lookbackYears<1||lookbackYears>100)throw new Error('Ungültiger Jahresrückblick.');
 const referenceYear=Number(selectedDay.slice(0,4));
 const mmdd=selectedDay.slice(5);
 const grouped=new Map<number,{artists:Map<string,V728Artist>;songs:Map<string,V728Track>;moments:V728Moment[];plays:number}>();
 const repeated=new Map<string,V728Track>();
 let earliest:string|null=null,latest:string|null=null,hasArchive=false;
 for(const event of Array.isArray(events)?events:[]){
  if(!event||typeof event.artist!=='string'||!event.artist.trim()||typeof event.title!=='string'||!event.title.trim()||typeof event.playedAt!=='string')continue;
  const time=Date.parse(event.playedAt);
  if(!Number.isFinite(time)||time<946684800000||time>nowMs+60000)continue;
  const observed=localDay(new Date(time));
  hasArchive=true;
  if(earliest===null||observed<earliest)earliest=observed;
  if(latest===null||observed>latest)latest=observed;
  const year=Number(observed.slice(0,4));
  if(year>=referenceYear||year<Math.max(2000,referenceYear-lookbackYears)||observed.slice(5)!==mmdd)continue;
  let group=grouped.get(year);
  if(!group){group={artists:new Map(),songs:new Map(),moments:[],plays:0};grouped.set(year,group);}
  group.plays++;
  const artist=event.artist.trim(),title=event.title.trim(),aKey=key(artist),sKey=songKey(artist,title);
  const a=group.artists.get(aKey);
  if(a)a.plays++;else group.artists.set(aKey,{artist,plays:1});
  const s=group.songs.get(sKey);
  if(s)s.plays++;else group.songs.set(sKey,{artist,title,plays:1,years:[year]});
  group.moments.push({artist,title,playedAt:event.playedAt});
  const repeatedEntry=repeated.get(sKey);
  if(repeatedEntry){repeatedEntry.plays++;if(!repeatedEntry.years.includes(year))repeatedEntry.years.push(year);}
  else repeated.set(sKey,{artist,title,plays:1,years:[year]});
 }
 const years=[...grouped.entries()].sort((a,b)=>b[0]-a[0]).map(([year,g]):V728Year=>({
  year,day:`${year}-${mmdd}`,plays:g.plays,uniqueArtists:g.artists.size,uniqueSongs:g.songs.size,
  artists:[...g.artists.values()].sort((a,b)=>b.plays-a.plays||compare(a.artist,b.artist)).slice(0,5),
  songs:[...g.songs.values()].sort((a,b)=>b.plays-a.plays||compare(a.artist,b.artist)||compare(a.title,b.title)).slice(0,5),
  moments:g.moments.sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt)||compare(a.artist,b.artist)||compare(a.title,b.title)).slice(0,5)
 }));
 const repeatedSongs=[...repeated.values()].filter(v=>v.years.length>=2).map(v=>({...v,years:[...v.years].sort((a,b)=>b-a)}))
 .sort((a,b)=>b.years.length-a.years.length||b.plays-a.plays||compare(a.artist,b.artist)||compare(a.title,b.title)).slice(0,8);
 return {referenceDay:selectedDay,monthDay:mmdd,firstArchivedDay:earliest,lastArchivedDay:latest,lookbackYears,years,total:years.reduce((s,y)=>s+y.plays,0),repeatedSongs,matchedYears:years.length,hasArchive};
}
