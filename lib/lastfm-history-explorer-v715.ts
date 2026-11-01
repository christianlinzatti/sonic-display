/** V715: read-only, browser-local timeline explorer for the existing Last.fm archive. */
import type {LastFmEventV706} from './lastfm-history-v706';

export type V715Period='all'|'30'|'365'|'custom';
export type V715ExplorerFilters={query:string;period:V715Period;from:string;to:string;artist?:string};
export type V715Group={day:string;events:LastFmEventV706[];offset:number};
export const V715_PAGE_SIZES=[50,100,200] as const;
export const V715_CSV_LIMIT=25000;

/** YYYY-MM-DD is interpreted in the viewer's calendar timezone, not UTC. */
function localCalendarDay(value:string):Date|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const year=Number(value.slice(0,4)),month=Number(value.slice(5,7)),day=Number(value.slice(8,10));
 if(year<2000||year>9999||month<1||month>12||day<1||day>31)return null;
 const d=new Date(year,month-1,day);
 return d.getFullYear()===year&&d.getMonth()===month-1&&d.getDate()===day?d:null;
}
const normalized=(s:string)=>s.normalize('NFKC').toLocaleLowerCase('de-AT').trim();
export function filterLastFmHistoryV715(events:readonly LastFmEventV706[],filter:V715ExplorerFilters,now=new Date()):{events:LastFmEventV706[];error:string|null}{
 let start=-Infinity,end=Infinity;
 if(filter.period==='custom'){
  const from=filter.from?localCalendarDay(filter.from):null;
  const to=filter.to?localCalendarDay(filter.to):null;
  if((filter.from&&!from)||(filter.to&&!to))return {events:[],error:'Bitte gültige Kalenderdaten eingeben.'};
  if(from)start=from.getTime();
  if(to){const exclusive=new Date(to.getFullYear(),to.getMonth(),to.getDate()+1);end=exclusive.getTime();}
  if(start>=end)return {events:[],error:'Das Startdatum muss vor oder am Enddatum liegen.'};
 }else if(filter.period==='30'||filter.period==='365'){
  start=now.getTime()-(filter.period==='30'?30:365)*86400000;
 }
 const query=normalized(filter.query),artist=normalized(filter.artist??'');
 const matches=events.filter(e=>{
  const time=Date.parse(e.playedAt);
  return Number.isFinite(time)&&time>=start&&time<end&&(!artist||normalized(e.artist)===artist)&&(!query||normalized(`${e.artist} ${e.title} ${e.album}`).includes(query));
 });
 // The persisted V713 archive is newest-first; never mutate it when filtering.
 matches.sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt));
 return {events:matches,error:null};
}
export function pageLastFmHistoryV715(events:readonly LastFmEventV706[],requestedPage:number,requestedSize:number){
 const size=(V715_PAGE_SIZES as readonly number[]).includes(requestedSize)?requestedSize:50;
 const total=events.length,pages=Math.max(1,Math.ceil(total/size));
 const page=Number.isSafeInteger(requestedPage)?Math.min(pages,Math.max(1,requestedPage)):1;
 const start=(page-1)*size;
 return {total,pages,page,size,start,end:Math.min(start+size,total),events:events.slice(start,start+size)};
}
export function groupLastFmPageV715(events:readonly LastFmEventV706[],startOffset=0):V715Group[]{
 const groups:V715Group[]=[];
 for(let i=0;i<events.length;i++){
  const date=new Date(events[i].playedAt);
  const day=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const last=groups[groups.length-1];
  if(last?.day===day)last.events.push(events[i]);
  else groups.push({day,events:[events[i]],offset:startOffset+i});
 }
 return groups;
}
function csvCell(value:string){
 // Neutralise spreadsheet formulas, including whitespace-prefixed payloads.
 let cleaned=value.replace(/[\u0000-\u001f\u007f]/g,' ').trim();
 if(/^[=+\-@]/.test(cleaned))cleaned="'"+cleaned;
 return `"${cleaned.replace(/"/g,'""')}"`;
}
/** Limit is deliberately explicit: the JSON archive remains the full-fidelity backup. */
export function makeLastFmCsvV715(events:readonly LastFmEventV706[],maxRows=V715_CSV_LIMIT){
 const safeLimit=Number.isSafeInteger(maxRows)&&maxRows>0?Math.min(maxRows,V715_CSV_LIMIT):V715_CSV_LIMIT;
 const rows=events.slice(0,safeLimit).map(e=>[e.playedAt,e.artist,e.title,e.album,e.url??''].map(csvCell).join(';'));
 return {csv:'\ufeff'+['"UTC Zeit";"Künstler";"Song";"Album";"Last.fm Link"',...rows].join('\r\n')+'\r\n',exported:rows.length,truncated:events.length>rows.length,total:events.length};
}
