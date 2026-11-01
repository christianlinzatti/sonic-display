import type {LastFmEventV706} from './lastfm-history-v706';
import type {V711TimeZone} from './lastfm-intelligence-v711';

/** Read-only statistics based on observed Last.fm scrobbles. No invented genres or recommendations. */
export type V857GenreEvidence={genre:string|null;source:'track'|'artist'|null;matchedTag:string|null;confidence:number};
export type V857Sample={key:string;artist:string;title:string;plays:number;month:string};
export type V857Artist={artist:string;plays:number;before:number;share:number;beforeShare:number;changePoints:number;firstSeen:boolean};
export type V857GenreMonth={month:string;total:number;covered:number;genres:{genre:string;plays:number}[]};
export type V857Analysis={selected:string;months:string[];currentPlays:number;baselinePlays:number;artists:V857Artist[];newArtists:V857Artist[];samples:V857Sample[];uniqueTracks:number};
const clean=(s:string)=>s.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-AT');
const text=(s:unknown):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=400&&!/[\u0000-\u001f\u007f]/.test(s);
const fmt={UTC:new Intl.DateTimeFormat('en-CA',{timeZone:'UTC',year:'numeric',month:'2-digit'}),'Europe/Vienna':new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit'})};
const validMonth=(s:string)=>/^20\d{2}-(0[1-9]|1[0-2])$/.test(s);
const prior=(m:string)=>{const [y,mon]=m.split('-').map(Number);return `${mon===1?y-1:y}-${String(mon===1?12:mon-1).padStart(2,'0')}`;};
const monthOf=(time:number,zone:V711TimeZone)=>{
 const parts:Record<string,string>={};for(const part of fmt[zone].formatToParts(new Date(time)))if(part.type!=='literal')parts[part.type]=part.value;
 return `${parts.year}-${parts.month}`;
};
export const v857TrackKey=(artist:string,title:string)=>`${clean(artist)}\u001f${clean(title)}`;
type Play={month:string;ms:number;artist:string;title:string;artistKey:string;trackKey:string};
function prepare(events:readonly LastFmEventV706[],zone:V711TimeZone,now:Date):Play[]{
 const end=now.getTime(),out:Play[]=[];
 if(!Array.isArray(events)||!Number.isFinite(end))return out;
 for(const e of events){
  if(!e||!text(e.artist)||!text(e.title)||typeof e.playedAt!=='string'||!/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(e.playedAt))continue;
  const ms=Date.parse(e.playedAt);if(!Number.isFinite(ms)||ms<946684800000||ms>end||new Date(ms).toISOString()!==e.playedAt)continue;
  out.push({ms,month:monthOf(ms,zone),artist:e.artist.trim(),title:e.title.trim(),artistKey:clean(e.artist),trackKey:v857TrackKey(e.artist,e.title)});
 }
 return out;
}
/** Six equally sampled months; max 6 highest-played distinct songs/month, max 36 lookups total. */
export function personalDiscoveryV857(events:readonly LastFmEventV706[],month:string,now=new Date(),timeZone:V711TimeZone='Europe/Vienna'):V857Analysis{
 const zone=timeZone==='UTC'?'UTC':'Europe/Vienna';const currentMonth=monthOf(Number.isFinite(now.getTime())?now.getTime():Date.now(),zone);
 const selected=validMonth(month)&&month<=currentMonth?month:currentMonth;
 const months:string[]=[];let pointer=selected;for(let i=0;i<6;i++){months.unshift(pointer);pointer=prior(pointer);}const earliestBaseline=prior(months[0]);
 const plays=prepare(events,zone,now),current=new Map<string,{artist:string;plays:number}>(),baseline=new Map<string,number>();
 const firstSeen=new Map<string,string>();const sampleMonths=new Map<string,Map<string,V857Sample>>();
 let currentPlays=0,baselinePlays=0;const unique=new Set<string>();
 for(const p of plays){
  const first=firstSeen.get(p.artistKey);if(!first||p.month<first)firstSeen.set(p.artistKey,p.month);
  if(p.month===selected){currentPlays++;const prev=current.get(p.artistKey);current.set(p.artistKey,{artist:p.artist,plays:(prev?.plays??0)+1});}
  if(p.month>=earliestBaseline&&p.month<selected){baselinePlays++;baseline.set(p.artistKey,(baseline.get(p.artistKey)??0)+1);}
  if(months.includes(p.month)){
   unique.add(p.trackKey);const items=sampleMonths.get(p.month)??new Map<string,V857Sample>();
   const s=items.get(p.trackKey);items.set(p.trackKey,{key:p.trackKey,artist:p.artist,title:p.title,plays:(s?.plays??0)+1,month:p.month});sampleMonths.set(p.month,items);
  }
 }
 // Compare this month against up to three immediately preceding calendar months, not five.
 const before3=new Set([prior(selected),prior(prior(selected)),prior(prior(prior(selected)))]);
 const previous3=new Map<string,number>();let previous3Plays=0;
 for(const p of plays){if(before3.has(p.month)){previous3Plays++;previous3.set(p.artistKey,(previous3.get(p.artistKey)??0)+1);}}
 const artists:V857Artist[]=[];
 for(const [key,a] of current){
  if(a.plays<3)continue;
  const before=previous3.get(key)??0,share=currentPlays?a.plays/currentPlays:0,beforeShare=previous3Plays?before/previous3Plays:0;
  artists.push({artist:a.artist,plays:a.plays,before,share,beforeShare,changePoints:(share-beforeShare)*100,firstSeen:firstSeen.get(key)===selected});
 }
 const rising=artists.filter(a=>!a.firstSeen&&previous3Plays>=10&&currentPlays>=10&&a.share>a.beforeShare).sort((a,b)=>b.changePoints-a.changePoints||b.plays-a.plays||a.artist.localeCompare(b.artist)).slice(0,8);
 const newArtists=artists.filter(a=>a.firstSeen).sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist)).slice(0,6);
 const samples:V857Sample[]=[];
 for(const monthKey of months){
  const ranked=[...(sampleMonths.get(monthKey)?.values()??[])].sort((a,b)=>b.plays-a.plays||a.key.localeCompare(b.key));
  for(const s of ranked.slice(0,6))if(!samples.some(previous=>previous.key===s.key))samples.push(s);
 }
 return {selected,months,currentPlays,baselinePlays:previous3Plays,artists:rising,newArtists,samples:samples.slice(0,36),uniqueTracks:unique.size};
}

/** No unrecognized metadata is ever counted as a genre. For each month: denominator is only recognized sampled-track plays. */
export function genreTrendsV857(events:readonly LastFmEventV706[],months:readonly string[],lookups:ReadonlyMap<string,V857GenreEvidence>,now=new Date(),timeZone:V711TimeZone='Europe/Vienna'):V857GenreMonth[]{
 const zone=timeZone==='UTC'?'UTC':'Europe/Vienna';const result=new Map<string,{total:number;covered:number;genres:Map<string,number>}>();
 for(const month of months)if(validMonth(month))result.set(month,{total:0,covered:0,genres:new Map()});
 for(const p of prepare(events,zone,now)){
  const target=result.get(p.month);if(!target)continue;target.total++;
  const evidence=lookups.get(p.trackKey);
  if(!evidence||!evidence.genre||!['artist','track'].includes(evidence.source??'')||!evidence.matchedTag||evidence.matchedTag==='Titel/Interpret'||evidence.matchedTag==='BPM-Hinweis'||evidence.confidence<40)continue;
  target.covered++;target.genres.set(evidence.genre,(target.genres.get(evidence.genre)??0)+1);
 }
 return [...result].map(([month,entry])=>({month,total:entry.total,covered:entry.covered,genres:[...entry.genres].map(([genre,plays])=>({genre,plays})).sort((a,b)=>b.plays-a.plays||a.genre.localeCompare(b.genre))}));
}
/** Enforce safe, metadata-based only evidence even if upstream API returns a title-based guess. */
export function validateGenreResponseV857(value:unknown):V857GenreEvidence|null{
 if(!value||typeof value!=='object')return null;
 const v=value as Record<string,unknown>;
 if(typeof v.error==='string'&&v.error.trim())return null;
 if(v.genre===null)return {genre:null,source:null,matchedTag:null,confidence:0};
 if(typeof v.genre!=='string'||!/^[-a-z0-9]{2,32}$/.test(v.genre)||!['track','artist'].includes(String(v.source))||typeof v.matchedTag!=='string'||!text(v.matchedTag)||['Titel/Interpret','BPM-Hinweis'].includes(v.matchedTag)||typeof v.confidence!=='number'||v.confidence<40||v.confidence>100)return null;
 // Source may fall back to artist-level tags; this will be labelled as less precise in UI.
 return {genre:v.genre,source:v.source as 'track'|'artist',matchedTag:v.matchedTag,confidence:v.confidence};
}
