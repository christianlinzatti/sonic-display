/** V863 · read-only Last.fm listening session analysis. Scrobble spans are NOT listening time. */
import type {LastFmEventV706} from './lastfm-history-v706';
export type SessionGapV863=20|30|60;
export type SessionRangeV863=30|90|365|'all';
export type SessionZoneV863='Europe/Vienna'|'UTC';
export type DaypartV863='night'|'morning'|'afternoon'|'evening';
export type SessionV863={id:string;first:string;last:string;day:string;daypart:DaypartV863;scrobbles:number;spanMinutes:number;artists:number;songs:number;topArtist:string;artistCounts:{artist:string;count:number}[];tracks:{artist:string;title:string}[]};
export type HourV863={hour:number;plays:number};
export type DaypartStatsV863={key:DaypartV863;label:string;plays:number;share:number;topArtist:string|null;artists:number};
export type SessionReportV863={total:number;sessionScrobbles:number;sessionCount:number;singletons:number;averageSpanMinutes:number;longestSpanMinutes:number;averageScrobbles:number;gapMinutes:SessionGapV863;range:SessionRangeV863;zone:SessionZoneV863;hours:HourV863[];dayparts:DaypartStatsV863[];weekdays:{day:number;label:string;plays:number}[];sessions:SessionV863[]};
const MS_MINUTE=60_000,MS_DAY=86_400_000;
const norm=(v:string)=>v.normalize('NFKC').trim().toLocaleLowerCase('de-AT');
const name=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=400;
const keys:DaypartV863[]=['night','morning','afternoon','evening'];
const labels:Record<DaypartV863,string>={night:'Nacht (23–05)',morning:'Morgen (05–11)',afternoon:'Nachmittag (11–17)',evening:'Abend (17–23)'};
const weekdayNames=['So','Mo','Di','Mi','Do','Fr','Sa'];
function local(ms:number,zone:SessionZoneV863){
 const fields=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23',weekday:'short'}).formatToParts(new Date(ms));
 const part=(key:string)=>fields.find(p=>p.type===key)?.value??'';
 const date=`${part('year')}-${part('month')}-${part('day')}`;
 const hour=Number(part('hour'));
 // Derive weekday from calendar key at UTC noon to avoid server TZ differences.
 const weekday=new Date(`${date}T12:00:00.000Z`).getUTCDay();
 return {date,hour,weekday};
}
function partOf(hour:number):DaypartV863{return hour<5||hour>=23?'night':hour<11?'morning':hour<17?'afternoon':'evening';}
type Row={event:LastFmEventV706;ms:number;artist:string;title:string;key:string;local:ReturnType<typeof local>};
/** A session is at least TWO scrobbles with consecutive gaps <= selected threshold.
 * The duration-like field is an observed timestamp span, not audio playback time. */
export function buildListeningSessionsV863(events:readonly LastFmEventV706[],options:{gap?:SessionGapV863;range?:SessionRangeV863;zone?:SessionZoneV863;now?:Date}={}):SessionReportV863{
 const gap:SessionGapV863=options.gap===20||options.gap===60?options.gap:30;
 const range:SessionRangeV863=options.range===30||options.range===365||options.range==='all'?options.range:90;
 const zone:SessionZoneV863=options.zone==='UTC'?'UTC':'Europe/Vienna';
 const now=options.now?.getTime();const max=now!==undefined&&Number.isFinite(now)?now:Date.now();
 const cutoff=range==='all'?946684800000:max-range*MS_DAY;
 const rows:Row[]=[],seen=new Set<string>();
 for(const event of Array.isArray(events)?events:[]){
  if(!event||!name(event.artist)||!name(event.title)||typeof event.playedAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(event.playedAt))continue;
  const ms=Date.parse(event.playedAt);if(!Number.isFinite(ms)||ms<946684800000||ms>max||ms<cutoff||new Date(ms).toISOString()!==event.playedAt)continue;
  const artist=norm(event.artist),title=norm(event.title);
  const key=`${ms}\u001f${artist}\u001f${title}\u001f${norm(event.album??'')}`;
  if(seen.has(key))continue;seen.add(key);
  rows.push({event,ms,artist,title,key,local:local(ms,zone)});
 }
 rows.sort((a,b)=>a.ms-b.ms||a.key.localeCompare(b.key));
 const hours=Array.from({length:24},(_,hour)=>({hour,plays:0}));
 const weekdays=weekdayNames.map((label,day)=>({day,label,plays:0}));
 const byPart=new Map<DaypartV863,{plays:number;artistMap:Map<string,{artist:string;plays:number}>}>();
 for(const key of keys)byPart.set(key,{plays:0,artistMap:new Map()});
 for(const row of rows){
  hours[row.local.hour].plays++;weekdays[row.local.weekday].plays++;
  const p=byPart.get(partOf(row.local.hour))!;p.plays++;
  const old=p.artistMap.get(row.artist);
  if(old){old.plays++;old.artist=row.event.artist;}else p.artistMap.set(row.artist,{artist:row.event.artist,plays:1});
 }
 const dayparts=keys.map(key=>{
  const p=byPart.get(key)!;const top=[...p.artistMap.values()].sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist,'de'))[0];
  return {key,label:labels[key],plays:p.plays,share:rows.length?p.plays/rows.length:0,topArtist:top?.artist??null,artists:p.artistMap.size};
 });
 const sessions:SessionV863[]=[];let singletons=0,sessionScrobbles=0;
 function flush(group:Row[]){
  if(group.length<2){singletons+=group.length;return;}
  const artists=new Map<string,{artist:string;count:number}>(),songs=new Set<string>();
  for(const item of group){const a=artists.get(item.artist);if(a){a.count++;a.artist=item.event.artist;}else artists.set(item.artist,{artist:item.event.artist,count:1});songs.add(item.artist+'\u001f'+item.title);}
  const artistCounts=[...artists.values()].sort((a,b)=>b.count-a.count||a.artist.localeCompare(b.artist,'de'));
  const first=group[0],last=group[group.length-1];
  const tracks=group.slice(-4).reverse().map(x=>({artist:x.event.artist,title:x.event.title}));
  sessions.push({id:`${first.ms}-${last.ms}-${first.key}`,first:first.event.playedAt,last:last.event.playedAt,day:first.local.date,daypart:partOf(first.local.hour),scrobbles:group.length,spanMinutes:Math.round((last.ms-first.ms)/MS_MINUTE),artists:artists.size,songs:songs.size,topArtist:artistCounts[0]?.artist??'',artistCounts:artistCounts.slice(0,5),tracks});sessionScrobbles+=group.length;
 }
 let group:Row[]=[];
 for(const row of rows){if(group.length&&row.ms-group[group.length-1].ms>gap*MS_MINUTE){flush(group);group=[];}group.push(row);}
 if(group.length)flush(group);
 sessions.sort((a,b)=>Date.parse(b.last)-Date.parse(a.last));
 const spans=sessions.reduce((n,s)=>n+s.spanMinutes,0);
 return {total:rows.length,sessionScrobbles,sessionCount:sessions.length,singletons,averageSpanMinutes:sessions.length?Math.round(spans/sessions.length):0,longestSpanMinutes:sessions.reduce((n,s)=>Math.max(n,s.spanMinutes),0),averageScrobbles:sessions.length?Math.round(sessionScrobbles/sessions.length*10)/10:0,gapMinutes:gap,range,zone,hours,dayparts,weekdays,sessions};
}
