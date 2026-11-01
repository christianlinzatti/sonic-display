import type {HistoryCollectionV707,HistoryEventV707} from './listening-sources-v707';

/** V865: read-only audit of V707's heuristic one-to-one match. Never infer an actual play from an empty day. */
export type FusionRangeV865=30|90|365;
export type FusionDayV865={date:string;spotify:number;lastfm:number;paired:number;spotifyOnly:number;lastfmOnly:number;counted:number;withinObservedSpan:boolean};
export type FusionAuditV865={days:FusionDayV865[];rangeDays:FusionRangeV865;spotify:number;lastfm:number;paired:number;spotifyOnly:number;lastfmOnly:number;counted:number;sourceOnlyDays:number;bothSourceDays:number;quietInsideDays:number;quietOutsideDays:number;firstSpotify:string|null;lastSpotify:string|null;firstLastfm:string|null;lastLastfm:string|null;events:HistoryEventV707[]};
const DAY=86_400_000;
const safeTime=(iso:string)=>{const result=Date.parse(iso);return Number.isFinite(result)?result:NaN;};
const dateKey=(ms:number)=>new Date(ms).toISOString().slice(0,10);
/** UTC calendar days avoid DST ambiguity; V707's original device-local statistics are left intact. */
export function auditHistoryFusionV865(collection:HistoryCollectionV707,rangeDays:FusionRangeV865=30,now=new Date()):FusionAuditV865{
 if(rangeDays!==30&&rangeDays!==90&&rangeDays!==365)throw new Error('Ungültiger Zeitbereich');
 const timestamp=now.getTime();if(!Number.isFinite(timestamp))throw new Error('Ungültiges Bezugsdatum');
 const end=Math.floor(timestamp/DAY)*DAY,start=end-(rangeDays-1)*DAY;
 const all=collection.events.filter(e=>e&&['spotify','lastfm','both'].includes(e.source)&&Number.isFinite(safeTime(e.playedAt))&&safeTime(e.playedAt)<=timestamp+60_000);
 const validAll=all.filter(e=>safeTime(e.playedAt)>=946_684_800_000);
 let first:number|null=null,last:number|null=null;
 for(const e of validAll){const t=safeTime(e.playedAt);if(first===null||t<first)first=t;if(last===null||t>last)last=t;}
 const days=Array.from({length:rangeDays},(_,i):FusionDayV865=>({date:dateKey(start+i*DAY),spotify:0,lastfm:0,paired:0,spotifyOnly:0,lastfmOnly:0,counted:0,withinObservedSpan:first!==null&&last!==null&&start+i*DAY>=Math.floor(first/DAY)*DAY&&start+i*DAY<=Math.floor(last/DAY)*DAY}));
 const present=validAll.filter(e=>safeTime(e.playedAt)>=start&&safeTime(e.playedAt)<end+DAY);
 let firstSpotify:string|null=null,lastSpotify:string|null=null,firstLastfm:string|null=null,lastLastfm:string|null=null;
 for(const e of validAll){
  if(e.source==='spotify'||e.source==='both'){
   if(firstSpotify===null||e.playedAt<firstSpotify)firstSpotify=e.playedAt;
   if(lastSpotify===null||e.playedAt>lastSpotify)lastSpotify=e.playedAt;
  }
  if(e.source==='lastfm'||e.source==='both'){
   if(firstLastfm===null||e.playedAt<firstLastfm)firstLastfm=e.playedAt;
   if(lastLastfm===null||e.playedAt>lastLastfm)lastLastfm=e.playedAt;
  }
 }
 let paired=0,spotifyOnly=0,lastfmOnly=0;
 for(const e of present){
  const index=Math.floor(safeTime(e.playedAt)/DAY)-Math.floor(start/DAY);
  const d=days[index];if(!d)continue;
  d.counted++;
  if(e.source==='both'){d.spotify++;d.lastfm++;d.paired++;paired++;}
  else if(e.source==='spotify'){d.spotify++;d.spotifyOnly++;spotifyOnly++;}
  else {d.lastfm++;d.lastfmOnly++;lastfmOnly++;}
 }
 return {days,rangeDays,spotify:paired+spotifyOnly,lastfm:paired+lastfmOnly,paired,spotifyOnly,lastfmOnly,counted:present.length,
  sourceOnlyDays:days.filter(d=>(d.spotify>0)!==(d.lastfm>0)).length,
  bothSourceDays:days.filter(d=>d.spotify>0&&d.lastfm>0).length,
  quietInsideDays:days.filter(d=>d.withinObservedSpan&&d.counted===0).length,
  quietOutsideDays:days.filter(d=>!d.withinObservedSpan&&d.counted===0).length,
  firstSpotify,lastSpotify,firstLastfm,lastLastfm,events:present.slice().sort((a,b)=>b.playedAt.localeCompare(a.playedAt))};
}
export function fusionDayEventsV865(audit:FusionAuditV865,day:string,limit=30):HistoryEventV707[]{
 if(!/^\d{4}-\d\d-\d\d$/.test(day)||!audit.days.some(d=>d.date===day))return [];
 return audit.events.filter(e=>e.playedAt.slice(0,10)===day).slice(0,Math.max(0,Math.min(100,Math.floor(limit)||0)));
}
