import type {RecentTrackV672} from './recently-played-v672';

/** V855: pure, local-only exploration of the user-owned Spotify archive. No extra Spotify calls. */
export type HistoryOrderV855='newest'|'oldest';
export type HistoryFiltersV855={query:string;from:string;to:string;repeatsOnly:boolean;order:HistoryOrderV855};
export type HistoryDayV855={key:string;label:string;items:RecentTrackV672[]};
export const HISTORY_PAGE_SIZE_V855=35;
export const HISTORY_DEFAULT_FILTERS_V855:HistoryFiltersV855={query:'',from:'',to:'',repeatsOnly:false,order:'newest'};

const dayFormatter=new Intl.DateTimeFormat('de-AT',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
const validDay=(value:string)=>{
 if(!/^\d{4}-\d\d-\d\d$/.test(value))return false;
 const [year,month,day]=value.split('-').map(Number);
 const date=new Date(year,month-1,day);
 return date.getFullYear()===year&&date.getMonth()+1===month&&date.getDate()===day;
};
const dayKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const localPlaybackDayV855=(timestamp:string)=>dayKey(new Date(timestamp));
const fold=(text:string)=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de-AT');

export function filterListeningHistoryV855(events:ReadonlyArray<RecentTrackV672>,filters:HistoryFiltersV855){
 const from=validDay(filters.from)?filters.from:'';
 const to=validDay(filters.to)?filters.to:'';
 const words=fold(filters.query.trim()).split(/\s+/).filter(Boolean);
 const period=events.filter(event=>{
  const date=localPlaybackDayV855(event.playedAt);
  return (!from||date>=from)&&(!to||date<=to);
 });
 // A repeat is a track played twice within the selected date range, not merely a search match.
 const plays=new Map<string,number>();
 for(const event of period)plays.set(event.id,(plays.get(event.id)??0)+1);
 const matching=period.filter(event=>{
  if(filters.repeatsOnly&&(plays.get(event.id)??0)<2)return false;
  const haystack=fold(`${event.title} ${event.artist} ${event.album}`);
  return words.every(word=>haystack.includes(word));
 });
 matching.sort((a,b)=>{
  const times=Date.parse(a.playedAt)-Date.parse(b.playedAt);
  const first=filters.order==='oldest'?times:-times;
  return first||a.id.localeCompare(b.id);
 });
 const uniqueSongs=new Set(matching.map(event=>event.id)).size;
 const activeDays=new Set(matching.map(event=>localPlaybackDayV855(event.playedAt))).size;
 return {items:matching,total:matching.length,uniqueSongs,activeDays,repeatEvents:matching.filter(event=>(plays.get(event.id)??0)>=2).length};
}
export function pageListeningHistoryV855(events:ReadonlyArray<RecentTrackV672>,page:number,pageSize=HISTORY_PAGE_SIZE_V855){
 const safeSize=Math.min(100,Math.max(1,Number.isInteger(pageSize)?pageSize:HISTORY_PAGE_SIZE_V855));
 const pages=Math.max(1,Math.ceil(events.length/safeSize));
 const selected=Math.min(pages,Math.max(1,Number.isInteger(page)?page:1));
 const items=events.slice((selected-1)*safeSize,selected*safeSize);
 const groups:HistoryDayV855[]=[];
 for(const event of items){
  const date=new Date(event.playedAt);
  const key=dayKey(date);
  const current=groups[groups.length-1];
  if(current&&current.key===key)current.items.push(event);
  else groups.push({key,label:dayFormatter.format(date),items:[event]});
 }
 return {page:selected,pages,groups,from:items.length?(selected-1)*safeSize+1:0,to:Math.min(selected*safeSize,events.length)};
}

/** Export only the visible filter result. Protect every user-controlled CSV field from spreadsheet formulas. */
export function exportListeningHistoryCSVV855(events:ReadonlyArray<RecentTrackV672>){
 const cell=(value:string)=>{
  const safe=/^\s*[=+\-@]/u.test(value)?`'${value}`:value;
  return `"${safe.replace(/"/g,'""')}"`;
 };
 const header=['Abgespielt (ISO)','Titel','Künstler','Album','Spotify-Link','Länge (ms)'];
 const rows=events.map(event=>[event.playedAt,event.title,event.artist,event.album,event.spotifyUrl,String(event.durationMs)]);
 return '\uFEFF'+[header,...rows].map(row=>row.map(cell).join(';')).join('\r\n')+'\r\n';
}
