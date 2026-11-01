/** V726 Shared History Filters: only local, observed Last.fm scrobbles.
 * Calendar-day arithmetic is in the browser's timezone, including DST boundaries.
 * Relative ranges are anchored to the newest archived scrobble, not wall-clock time.
 */
import type {LastFmEventV706} from './lastfm-history-v706';

export type V726Range='all'|'days'|'year'|'custom';
export type V726Days=7|30|90;
export type V726Selection={range:V726Range;days:V726Days;year:number;from:string;to:string;artist:string};
export type V726FilterResult={events:LastFmEventV706[];error:string|null;label:string;fromDay:string|null;toDay:string|null;years:number[];artists:string[];sourceTotal:number;anchorDay:string|null};
export const V726_DEFAULT_SELECTION:V726Selection={range:'all',days:30,year:0,from:'',to:'',artist:''};

const dayKey=(date:Date)=>`${String(date.getFullYear()).padStart(4,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const calendarDate=(text:string):Date|null=>{
 if(!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(text))return null;
 const y=Number(text.slice(0,4)),m=Number(text.slice(5,7)),d=Number(text.slice(8,10));
 if(y<2000||y>9999)return null;
 const date=new Date(0);date.setFullYear(y,m-1,d);date.setHours(12,0,0,0);
 return date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d?date:null;
};
const norm=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('de-AT');
export function listLastFmFilterYearsV726(events:readonly LastFmEventV706[]):number[]{
 const years=new Set<number>();
 for(const event of events??[]){const t=Date.parse(event?.playedAt??'');if(!Number.isFinite(t))continue;const y=new Date(t).getFullYear();if(y>=2000&&y<=9999)years.add(y);}
 return [...years].sort((a,b)=>b-a);
}
export function buildLastFmSharedFilterV726(events:readonly LastFmEventV706[], selection:V726Selection):V726FilterResult{
 const source=Array.isArray(events)?events:[];
 const valid:{event:LastFmEventV706;timestamp:number;day:string}[]=[];
 let anchor=0;
 const years=new Set<number>(),artistNames=new Map<string,string>();
 for(const event of source){
  const timestamp=Date.parse(event?.playedAt??'');
  if(!Number.isFinite(timestamp)||!event||typeof event.artist!=='string'||!event.artist.trim()||typeof event.title!=='string'||!event.title.trim())continue;
  const date=new Date(timestamp),year=date.getFullYear();if(year<2000||year>9999)continue;
  const day=dayKey(date);valid.push({event,timestamp,day});
  years.add(year);const key=norm(event.artist);if(!artistNames.has(key))artistNames.set(key,event.artist.trim());
  if(timestamp>anchor)anchor=timestamp;
 }
 const availableYears=[...years].sort((a,b)=>b-a);
 const artists=[...artistNames.values()].sort((a,b)=>a.localeCompare(b,'de-AT'));
 const anchorDay=anchor?dayKey(new Date(anchor)):null;
 const base={years:availableYears,artists,sourceTotal:valid.length,anchorDay};
 const failure=(error:string):V726FilterResult=>({...base,events:[],error,label:'Ungültiger Filter',fromDay:null,toDay:null});
 const selected=selection??V726_DEFAULT_SELECTION;
 let fromDay:string|null=null,toDay:string|null=null,label='Gesamtes Archiv';
 if(selected.range==='days'){
  if(!([7,30,90] as number[]).includes(selected.days))return failure('Ungültige Tagesanzahl.');
  label=`Letzte ${selected.days} Kalendertage`;
  if(anchorDay){const latest=calendarDate(anchorDay)!;latest.setDate(latest.getDate()-(selected.days-1));fromDay=dayKey(latest);toDay=anchorDay;}
 }else if(selected.range==='year'){
  if(!Number.isSafeInteger(selected.year)||selected.year<2000||selected.year>9999)return failure('Bitte ein gültiges Kalenderjahr wählen.');
  fromDay=`${selected.year}-01-01`;toDay=`${selected.year}-12-31`;label=`Jahr ${selected.year}`;
 }else if(selected.range==='custom'){
  if(!calendarDate(selected.from)||!calendarDate(selected.to))return failure('Bitte zwei gültige Kalenderdaten wählen.');
  if(selected.from>selected.to)return failure('Das Startdatum muss vor oder am Enddatum liegen.');
  fromDay=selected.from;toDay=selected.to;label=`${selected.from} bis ${selected.to}`;
 }else if(selected.range!=='all')return failure('Unbekannter Zeitfilter.');
 const artist=typeof selected.artist==='string'?selected.artist.trim():'';
 if(artist.length>160)return failure('Künstlername zu lang.');
 if(artist)label+=` · ${artist}`;
 const artistKey=norm(artist);
 const filtered=valid.filter(x=>(!fromDay||x.day>=fromDay)&&(!toDay||x.day<=toDay)&&(!artistKey||norm(x.event.artist)===artistKey));
 filtered.sort((a,b)=>b.timestamp-a.timestamp||a.event.artist.localeCompare(b.event.artist,'de-AT'));
 return {...base,events:filtered.map(x=>x.event),error:null,label,fromDay,toDay};
}
