/** V716 – read-only local-calendar index for Last.fm scrobbles already archived in V713. */
import type {LastFmEventV706} from './lastfm-history-v706';

export type V716CalendarDay={day:string;date:number;count:number;level:0|1|2|3|4};
export type V716Calendar={month:string;label:string;cells:(V716CalendarDay|null)[];total:number;activeDays:number;peakDay:number};
export type V716Bounds={oldest:string;newest:string};

const pad=(value:number)=>String(value).padStart(2,'0');
/** Use local getters rather than ISO (UTC) slicing: the viewer's day can differ. */
export function localDayKeyV716(date:Date):string{
 return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}
export function monthKeyV716(date:Date):string{
 return `${date.getFullYear()}-${pad(date.getMonth()+1)}`;
}
function monthParts(month:string):{year:number;index:number}|null{
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return null;
 const year=Number(month.slice(0,4));
 return year>=2000&&year<=9999?{year,index:Number(month.slice(5,7))-1}:null;
}
/** Navigation does not overflow across years or produce impossible dates. */
export function moveMonthV716(month:string,offset:number):string|null{
 const parts=monthParts(month);
 if(!parts||!Number.isSafeInteger(offset))return null;
 const absolute=parts.year*12+parts.index+offset;
 if(absolute<2000*12||absolute>9999*12+11)return null;
 const year=Math.floor(absolute/12);
 return `${year}-${pad(absolute%12+1)}`;
}
/** The archive defines the navigation bounds; a completely empty archive uses the current month. */
export function calendarBoundsV716(events:readonly LastFmEventV706[],now=new Date()):V716Bounds{
 let oldest:string|null=null,newest:string|null=null;
 for(const event of events){
  const millis=Date.parse(event.playedAt);
  if(!Number.isFinite(millis))continue;
  const month=monthKeyV716(new Date(millis));
  if(!monthParts(month))continue;
  if(oldest===null||month<oldest)oldest=month;
  if(newest===null||month>newest)newest=month;
 }
 const fallback=monthKeyV716(now);
 return {oldest:oldest??fallback,newest:newest??fallback};
}
export function calendarIntensityV716(count:number):0|1|2|3|4{
 return count===0?0:count<5?1:count<15?2:count<35?3:4;
}
/** Render a Monday-first month, with blank slots outside the displayed month. */
export function buildLastFmCalendarV716(events:readonly LastFmEventV706[],month:string):V716Calendar{
 const parts=monthParts(month);
 if(!parts)throw new RangeError('Ungültiger Monat im History-Kalender.');
 const {year,index}=parts;
 const start=new Date(year,index,1).getTime();
 const end=new Date(year,index+1,1).getTime();
 const daysInMonth=new Date(year,index+1,0).getDate();
 const counts=new Array<number>(daysInMonth).fill(0);
 for(const event of events){
  const time=Date.parse(event.playedAt);
  if(!Number.isFinite(time)||time<start||time>=end)continue;
  const day=new Date(time).getDate();
  counts[day-1]++;
 }
 const offset=(new Date(year,index,1).getDay()+6)%7;
 const length=Math.ceil((offset+daysInMonth)/7)*7;
 const cells:(V716CalendarDay|null)[]=Array.from({length},(_,i)=>{
  const day=i-offset+1;
  if(day<1||day>daysInMonth)return null;
  const count=counts[day-1];
  return {day:`${month}-${pad(day)}`,date:day,count,level:calendarIntensityV716(count)};
 });
 return {
  month,label:new Intl.DateTimeFormat('de-AT',{month:'long',year:'numeric'}).format(new Date(year,index,1)),
  cells,total:counts.reduce((a,b)=>a+b,0),activeDays:counts.filter(x=>x>0).length,peakDay:Math.max(0,...counts)
 };
}
