import type {LastFmEventV706} from './lastfm-history-v706';
import type {V711TimeZone} from './lastfm-intelligence-v711';
import type {V857GenreEvidence} from './lastfm-personal-discovery-v857';

/** V862 only counts Last.fm genre tags already verified by V857; never infers a genre from an artist/title. */
export type V862Mode='months'|'years';
export type V862Bucket={period:string;total:number;covered:number;trackBased:number;artistBased:number;genres:{genre:string;plays:number;share:number}[]};
export type V862Candidate={key:string;artist:string;title:string;plays:number;period:string};
export type V862Result={mode:V862Mode;buckets:V862Bucket[];samples:V862Candidate[];total:number;covered:number;trackBased:number;artistBased:number;genres:{genre:string;plays:number}[];maxLookups:number};
export const V862_MAX_LOOKUPS=72;
const clean=(value:string)=>value.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-AT');
export const genreTrackKeyV862=(artist:string,title:string)=>`${clean(artist)}\u001f${clean(title)}`;
const validString=(s:unknown):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=400&&!/[\u0000-\u001f\u007f]/.test(s);
const pad=(n:number)=>String(n).padStart(2,'0');
const formatters={UTC:new Intl.DateTimeFormat('en-CA',{timeZone:'UTC',year:'numeric',month:'2-digit'}),'Europe/Vienna':new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit'})};
function calendarParts(ms:number,zone:V711TimeZone){const parts:Record<string,string>={};for(const p of formatters[zone].formatToParts(new Date(ms)))if(p.type!=='literal')parts[p.type]=p.value;return {year:parts.year,month:parts.month};}
function periods(mode:V862Mode,now:number,zone:V711TimeZone):string[]{
 const {year,month}=calendarParts(now,zone);const base=Number(year),m=Number(month);
 if(mode==='years')return Array.from({length:10},(_,i)=>String(base-9+i));
 return Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(base,m-1-23+i,15));return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}`;});
}
function verified(evidence:V857GenreEvidence|undefined){
 return evidence&&typeof evidence.genre==='string'&&/^[a-z0-9-]{2,32}$/.test(evidence.genre)&&['track','artist'].includes(evidence.source??'')&&typeof evidence.matchedTag==='string'&&evidence.matchedTag.length>0&&!['Titel/Interpret','BPM-Hinweis'].includes(evidence.matchedTag)&&Number.isFinite(evidence.confidence)&&evidence.confidence>=40&&evidence.confidence<=100;
}
/** Bounded, time-distributed sampling and fully transparent coverage over *all* archived events in each period. */
export function buildGenreEvolutionV862(events:readonly LastFmEventV706[],lookups:ReadonlyMap<string,V857GenreEvidence>,mode:V862Mode='months',now=new Date(),timeZone:V711TimeZone='Europe/Vienna'):V862Result{
 const selectedMode=mode==='years'?'years':'months';const zone=timeZone==='UTC'?'UTC':'Europe/Vienna';const time=Number.isFinite(now.getTime())?now.getTime():Date.now();
 const keys=periods(selectedMode,time,zone),byPeriod=new Map<string,{total:number;covered:number;trackBased:number;artistBased:number;genres:Map<string,number>;tracks:Map<string,V862Candidate>}>();
 for(const period of keys)byPeriod.set(period,{total:0,covered:0,trackBased:0,artistBased:0,genres:new Map(),tracks:new Map()});
 for(const e of Array.isArray(events)?events:[]){
  if(!e||!validString(e.artist)||!validString(e.title)||typeof e.playedAt!=='string'||!/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(e.playedAt))continue;
  const ms=Date.parse(e.playedAt);if(!Number.isFinite(ms)||ms<946684800000||ms>time||new Date(ms).toISOString()!==e.playedAt)continue;
  const {year,month}=calendarParts(ms,zone),period=selectedMode==='years'?year:`${year}-${month}`,entry=byPeriod.get(period);if(!entry)continue;
  entry.total++;
  const key=genreTrackKeyV862(e.artist,e.title),prior=entry.tracks.get(key);
  entry.tracks.set(key,{key,artist:prior?.artist??e.artist.trim(),title:prior?.title??e.title.trim(),plays:(prior?.plays??0)+1,period});
  const evidence=lookups.get(key);if(!verified(evidence)||!evidence?.genre)continue;
  entry.covered++;if(evidence.source==='track')entry.trackBased++;else entry.artistBased++;
  entry.genres.set(evidence.genre,(entry.genres.get(evidence.genre)??0)+1);
 }
 const buckets:V862Bucket[]=[];const overall=new Map<string,number>();let total=0,covered=0,trackBased=0,artistBased=0;
 for(const [period,p] of byPeriod){total+=p.total;covered+=p.covered;trackBased+=p.trackBased;artistBased+=p.artistBased;
  for(const [genre,n] of p.genres)overall.set(genre,(overall.get(genre)??0)+n);
  buckets.push({period,total:p.total,covered:p.covered,trackBased:p.trackBased,artistBased:p.artistBased,genres:[...p.genres].map(([genre,plays])=>({genre,plays,share:p.covered?plays/p.covered:0})).sort((a,b)=>b.plays-a.plays||a.genre.localeCompare(b.genre))});
 }
 const seen=new Set<string>();const samples:V862Candidate[]=[];
 // 24 months × 3 or 10 years × 7, with global cap and dedup across buckets.
 const perBucket=selectedMode==='months'?3:7;
 for(const period of [...keys].reverse()){
  const ranked=[...(byPeriod.get(period)?.tracks.values()??[])].sort((a,b)=>b.plays-a.plays||a.key.localeCompare(b.key));
  let added=0;
  for(const item of ranked){if(seen.has(item.key))continue;if(added>=perBucket||samples.length>=V862_MAX_LOOKUPS)break;seen.add(item.key);samples.push(item);added++;}
 }
 return {mode:selectedMode,buckets,samples,total,covered,trackBased,artistBased,genres:[...overall].map(([genre,plays])=>({genre,plays})).sort((a,b)=>b.plays-a.plays||a.genre.localeCompare(b.genre)),maxLookups:V862_MAX_LOOKUPS};
}
export function genreChangeV862(previous:V862Bucket|undefined,current:V862Bucket|undefined,genre:string):{percentagePoints:number;previous:number;current:number}|null{
 // Sparse tagged samples cannot justify quantitative conclusions about changes.
 if(!previous||!current||previous.covered<10||current.covered<10||previous.total===0||current.total===0||previous.covered/previous.total<0.2||current.covered/current.total<0.2)return null;
 const before=(previous.genres.find(g=>g.genre===genre)?.plays??0)/previous.covered;
 const after=(current.genres.find(g=>g.genre===genre)?.plays??0)/current.covered;
 return {percentagePoints:(after-before)*100,previous:before,current:after};
}
