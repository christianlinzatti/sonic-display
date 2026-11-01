import type {LastFmEventV706} from './lastfm-history-v706';
import type {V711TimeZone} from './lastfm-intelligence-v711';

/** V856: offline analysis of already-loaded Last.fm scrobbles; never infer missing listening history. */
export type MonthV856={month:string;plays:number;artists:number;tracks:number;activeDays:number};
export type EmergingArtistV856={artist:string;plays:number;previousMonth:number;beforeMonth:number;firstSeen:string;kind:'new'|'growing'};
export type RediscoveredTrackV856={artist:string;title:string;plays:number;gapDays:number;lastHeard:string;rediscoveredAt:string;url:string|null;cover:string|null};
export type MonthlyInsightsV856={selected:string;zone:V711TimeZone;months:MonthV856[];current:MonthV856;previous:MonthV856;change:number|null;hasComparison:boolean;emerging:EmergingArtistV856[];rediscovered:RediscoveredTrackV856[];earliest:string|null;latest:string|null;sourceCount:number};

const MONTH_RE=/^20\d{2}-(?:0[1-9]|1[0-2])$/;
const formatter={
 'UTC':new Intl.DateTimeFormat('en-CA',{timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit'}),
 'Europe/Vienna':new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'})
};
const norm=(x:string)=>x.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-AT');
const validText=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0&&x.length<=400&&!/[\u0000-\u001f\u007f]/.test(x);
const localDay=(ms:number,zone:V711TimeZone)=>{
 const parts:Record<string,string>={};
 for(const part of formatter[zone].formatToParts(new Date(ms)))if(part.type!=='literal')parts[part.type]=part.value;
 return `${parts.year}-${parts.month}-${parts.day}`;
};
const monthBefore=(month:string)=>{const [year,m]=month.split('-').map(Number);return `${m===1?year-1:year}-${String(m===1?12:m-1).padStart(2,'0')}`;};
const empty=(month:string):MonthV856=>({month,plays:0,artists:0,tracks:0,activeDays:0});
const DAY=86_400_000;

type Play={ms:number;day:string;month:string;artist:string;title:string;artistKey:string;trackKey:string;url:string|null;cover:string|null};
type MonthAcc={plays:number;artists:Set<string>;tracks:Set<string>;days:Set<string>};
type ArtistAcc={artist:string;lastTime:number;firstMonth:string;byMonth:Map<string,number>;totalBefore:Map<string,number>};

function indexEvents(events:readonly LastFmEventV706[],now:Date,zone:V711TimeZone):Play[]{
 const max=now.getTime(),result:Play[]=[];
 if(!Array.isArray(events)||!Number.isFinite(max))return result;
 for(const e of events){
  if(!e||!validText(e.artist)||!validText(e.title)||typeof e.playedAt!=='string')continue;
  if(!/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(e.playedAt))continue;
  const ms=Date.parse(e.playedAt);
  if(!Number.isFinite(ms)||ms<946684800000||ms>max||new Date(ms).toISOString()!==e.playedAt)continue;
  const day=localDay(ms,zone),artistKey=norm(e.artist),trackKey=`${artistKey}\u001f${norm(e.title)}`;
  result.push({ms,day,month:day.slice(0,7),artist:e.artist.trim(),title:e.title.trim(),artistKey,trackKey,url:e.url,cover:e.cover});
 }
 return result.sort((a,b)=>a.ms-b.ms||a.trackKey.localeCompare(b.trackKey));
}

export function availableInsightMonthsV856(events:readonly LastFmEventV706[],now=new Date(),zone:V711TimeZone='Europe/Vienna'){
 const tz:V711TimeZone=zone==='UTC'?'UTC':'Europe/Vienna';
 const current=Number.isFinite(now.getTime())?localDay(now.getTime(),tz).slice(0,7):'2026-01';
 const months=new Set<string>([current]);
 for(const e of indexEvents(events,now,tz))months.add(e.month);
 return [...months].sort((a,b)=>b.localeCompare(a));
}

/** Selected month and previous month always use the same timezone and observed event semantics. */
export function calculateMonthlyInsightsV856(events:readonly LastFmEventV706[],requestedMonth:string,now=new Date(),timeZone:V711TimeZone='Europe/Vienna'):MonthlyInsightsV856{
 const zone:V711TimeZone=timeZone==='UTC'?'UTC':'Europe/Vienna';
 const nowMs=Number.isFinite(now.getTime())?now.getTime():Date.now();
 const currentMonth=localDay(nowMs,zone).slice(0,7);
 const selected=MONTH_RE.test(requestedMonth)&&requestedMonth<=currentMonth?requestedMonth:currentMonth;
 const prevMonth=monthBefore(selected);
 const sorted=indexEvents(events,new Date(nowMs),zone);
 const byMonth=new Map<string,MonthAcc>();
 const byArtist=new Map<string,ArtistAcc>();
 const selectedTracks=new Map<string,{artist:string;title:string;plays:number;lastTime:number;url:string|null;cover:string|null}>();
 const lastTrackPlay=new Map<string,Play>();
 const rediscovery=new Map<string,RediscoveredTrackV856>();
 let earliest:string|null=null,latest:string|null=null;
 for(const e of sorted){
  earliest=earliest??new Date(e.ms).toISOString();latest=new Date(e.ms).toISOString();
  const m=byMonth.get(e.month)??{plays:0,artists:new Set<string>(),tracks:new Set<string>(),days:new Set<string>()};
  m.plays++;m.artists.add(e.artistKey);m.tracks.add(e.trackKey);m.days.add(e.day);byMonth.set(e.month,m);
  const a=byArtist.get(e.artistKey)??{artist:e.artist,lastTime:e.ms,firstMonth:e.month,byMonth:new Map<string,number>(),totalBefore:new Map<string,number>()};
  a.byMonth.set(e.month,(a.byMonth.get(e.month)??0)+1);
  if(e.ms>=a.lastTime){a.artist=e.artist;a.lastTime=e.ms;}
  byArtist.set(e.artistKey,a);
  if(e.month===selected){
   const previous=selectedTracks.get(e.trackKey);
   selectedTracks.set(e.trackKey,{artist:e.artist,title:e.title,plays:(previous?.plays??0)+1,lastTime:e.ms,url:e.url,cover:e.cover});
  }
  const previous=lastTrackPlay.get(e.trackKey);
  if(e.month===selected&&previous){
   const gapDays=Math.floor((e.ms-previous.ms)/DAY);
   if(gapDays>=90){
    const existing=rediscovery.get(e.trackKey);
    if(!existing||gapDays>existing.gapDays)rediscovery.set(e.trackKey,{artist:e.artist,title:e.title,plays:0,gapDays,lastHeard:previous.day,rediscoveredAt:e.day,url:e.url,cover:e.cover});
   }
  }
  lastTrackPlay.set(e.trackKey,e);
 }
 const summary=(month:string):MonthV856=>{const m=byMonth.get(month);return m?{month,plays:m.plays,artists:m.artists.size,tracks:m.tracks.size,activeDays:m.days.size}:empty(month);};
 // Include zero months in the 12-month chart; empty months must never be taken as proof of not listening.
 const axis:string[]=[];let pointer=selected;
 for(let i=0;i<12;i++){axis.push(pointer);pointer=monthBefore(pointer);}
 axis.reverse();
 const current=summary(selected),previous=summary(prevMonth);
 const emerging:EmergingArtistV856[]=[];
 for(const a of byArtist.values()){
  const plays=a.byMonth.get(selected)??0;
  if(plays<3)continue;
  const previousMonth=a.byMonth.get(prevMonth)??0;
  const prior=[...a.byMonth.entries()].reduce((sum,[m,c])=>sum+(m<selected?c:0),0);
  // Newly seen OR strong recent growth; prior months are based on recorded scrobbles only.
  const kind=prior===0?'new':plays>=Math.max(3,previousMonth*2)&&plays>previousMonth?'growing':null;
  if(kind)emerging.push({artist:a.artist,plays,previousMonth,beforeMonth:prior,firstSeen:a.firstMonth,kind});
 }
 emerging.sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist));
 const rediscovered=[...rediscovery.entries()].map(([key,item])=>({...item,plays:selectedTracks.get(key)?.plays??0}))
  .sort((a,b)=>b.gapDays-a.gapDays||b.plays-a.plays||a.title.localeCompare(b.title)).slice(0,12);
 return {selected,zone,months:axis.map(summary),current,previous,hasComparison:previous.plays>0,change:previous.plays>0?Math.round((current.plays-previous.plays)/previous.plays*100):null,
  emerging:emerging.slice(0,10),rediscovered,earliest,latest,sourceCount:sorted.length};
}
