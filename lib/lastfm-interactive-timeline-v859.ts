import type {LastFmEventV706} from './lastfm-history-v706';
import type {V711TimeZone} from './lastfm-intelligence-v711';

/** V859: archival chronology. All results describe *recorded scrobbles*, never full listening activity. */
export type V859Year={year:number;plays:number;artists:number;tracks:number;activeDays:number;observed:boolean};
export type V859Month={month:string;plays:number;artists:number;tracks:number;activeDays:number;observed:boolean};
export type V859Artist={key:string;artist:string;plays:number;first:string;last:string;firstMonth:string;peakMonth:string;peakPlays:number;comebackCount:number;comebacks:{after:string;at:string;days:number}[];byYear:{year:number;plays:number}[];byMonth:{month:string;plays:number}[]};
export type V859Timeline={hasEvents:boolean;total:number;oldest:string|null;latest:string|null;zone:V711TimeZone;years:V859Year[];selectedYear:number|null;months:V859Month[];selectedMonth:string|null;monthArtists:{artist:string;plays:number;key:string}[];topArtists:{artist:string;plays:number;key:string}[];artist:V859Artist|null;artistOptions:{artist:string;plays:number;key:string}[];};
const DAY=86_400_000;
const norm=(x:string)=>x.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-AT');
const ok=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0&&x.length<=400&&!/[\u0000-\u001f\u007f]/.test(x);
const yearMonth=(year:number,month:number)=>`${year}-${String(month).padStart(2,'0')}`;
const dateFormatter:Record<V711TimeZone,Intl.DateTimeFormat>={
 UTC:new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'UTC'}),
 'Europe/Vienna':new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Vienna'})
};
function dayKey(ms:number,zone:V711TimeZone){
 const parts:Record<string,string>={};
 for(const p of dateFormatter[zone].formatToParts(new Date(ms)))if(p.type!=='literal')parts[p.type]=p.value;
 return `${parts.year}-${parts.month}-${parts.day}`;
}
function safeEvent(e:LastFmEventV706,max:number){
 if(!e||!ok(e.artist)||!ok(e.title)||typeof e.playedAt!=='string'||!/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(e.playedAt))return null;
 const ms=Date.parse(e.playedAt);
 return Number.isFinite(ms)&&ms>=946684800000&&ms<=max&&new Date(ms).toISOString()===e.playedAt?ms:null;
}
type Stat={plays:number;artists:Set<string>;tracks:Set<string>;days:Set<string>};
const makeStat=():Stat=>({plays:0,artists:new Set(),tracks:new Set(),days:new Set()});
const increment=(stat:Stat,a:string,t:string,d:string)=>{stat.plays++;stat.artists.add(a);stat.tracks.add(t);stat.days.add(d);};
type ArtistAcc={key:string;artist:string;plays:number;first:number;last:number;firstIso:string;lastIso:string;byMonth:Map<string,number>;comebacks:{after:string;at:string;days:number}[]};
const empty=(zone:V711TimeZone):V859Timeline=>({zone,hasEvents:false,total:0,oldest:null,latest:null,years:[],selectedYear:null,months:[],selectedMonth:null,monthArtists:[],topArtists:[],artistOptions:[],artist:null});
/** No API or storage access. One O(n log n) pass (sorting) + bounded calendar/artist summaries. */
export function buildInteractiveMusicTimelineV859(events:readonly LastFmEventV706[],requestedYear?:number|null,requestedMonth?:string|null,requestedArtist?:string|null,now=new Date(),timeZone:V711TimeZone='Europe/Vienna'):V859Timeline{
 const zone:V711TimeZone=timeZone==='UTC'?'UTC':'Europe/Vienna';
 const max=Number.isFinite(now.getTime())?now.getTime():Date.now();
 const ordered:{ms:number;day:string;month:string;year:number;artist:string;artistKey:string;trackKey:string}[]=[];
 for(const e of Array.isArray(events)?events:[]){
  const ms=safeEvent(e,max);if(ms===null)continue;
  const day=dayKey(ms,zone),artistKey=norm(e.artist),trackKey=`${artistKey}\u001f${norm(e.title)}`;
  ordered.push({ms,day,month:day.slice(0,7),year:Number(day.slice(0,4)),artist:e.artist.trim(),artistKey,trackKey});
 }
 if(!ordered.length)return empty(zone);
 ordered.sort((a,b)=>a.ms-b.ms||a.artistKey.localeCompare(b.artistKey)||a.trackKey.localeCompare(b.trackKey));
 const years=new Map<number,Stat>(),months=new Map<string,Stat>(),artists=new Map<string,ArtistAcc>();
 for(const item of ordered){
  const ys=years.get(item.year)??makeStat();increment(ys,item.artistKey,item.trackKey,item.day);years.set(item.year,ys);
  const ms=months.get(item.month)??makeStat();increment(ms,item.artistKey,item.trackKey,item.day);months.set(item.month,ms);
  const previous=artists.get(item.artistKey);
  if(previous){
   const gap=Math.floor((item.ms-previous.last)/DAY);
   if(gap>=90)previous.comebacks.push({after:previous.lastIso.slice(0,10),at:item.day,days:gap});
   previous.plays++;previous.last=item.ms;previous.lastIso=new Date(item.ms).toISOString();previous.artist=item.artist;
   previous.byMonth.set(item.month,(previous.byMonth.get(item.month)??0)+1);
  }else{
   artists.set(item.artistKey,{key:item.artistKey,artist:item.artist,plays:1,first:item.ms,last:item.ms,firstIso:new Date(item.ms).toISOString(),lastIso:new Date(item.ms).toISOString(),byMonth:new Map([[item.month,1]]),comebacks:[]});
  }
 }
 const minYear=ordered[0].year,maxYear=ordered[ordered.length-1].year;
 const yearList:V859Year[]=[];
 for(let y=minYear;y<=maxYear;y++){
  const stat=years.get(y);
  yearList.push({year:y,plays:stat?.plays??0,artists:stat?.artists.size??0,tracks:stat?.tracks.size??0,activeDays:stat?.days.size??0,observed:!!stat});
 }
 const selectedYear=typeof requestedYear==='number'&&Number.isInteger(requestedYear)&&requestedYear>=minYear&&requestedYear<=maxYear?requestedYear:maxYear;
 const monthList:V859Month[]=Array.from({length:12},(_,i)=>{
  const month=yearMonth(selectedYear,i+1),stat=months.get(month);
  return {month,plays:stat?.plays??0,artists:stat?.artists.size??0,tracks:stat?.tracks.size??0,activeDays:stat?.days.size??0,observed:!!stat};
 });
 const recentMonth=monthList.filter(m=>m.observed).at(-1)?.month??monthList[0].month;
 const selectedMonth=typeof requestedMonth==='string'&&/^20\d\d-(0[1-9]|1[0-2])$/.test(requestedMonth)&&requestedMonth.startsWith(String(selectedYear))?requestedMonth:recentMonth;
 const artistList=[...artists.values()].sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist));
 const artistOptions=artistList.map(a=>({artist:a.artist,key:a.key,plays:a.plays}));
 const targetArtist=requestedArtist?artists.get(norm(requestedArtist)):null;
 const currentArtist=targetArtist??artistList[0];
 let artist:V859Artist|null=null;
 if(currentArtist){
  const peak=[...currentArtist.byMonth.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0];
  artist={key:currentArtist.key,artist:currentArtist.artist,plays:currentArtist.plays,first:currentArtist.firstIso,last:currentArtist.lastIso,firstMonth:dayKey(currentArtist.first,zone).slice(0,7),peakMonth:peak[0],peakPlays:peak[1],
   byYear:yearList.map(y=>({year:y.year,plays:[...currentArtist.byMonth.entries()].reduce((n,[month,count])=>n+(month.startsWith(String(y.year))?count:0),0)})),
   byMonth:monthList.map(m=>({month:m.month,plays:currentArtist.byMonth.get(m.month)??0})),
   comebackCount:currentArtist.comebacks.length,
   comebacks:[...currentArtist.comebacks].sort((a,b)=>b.days-a.days||b.at.localeCompare(a.at)).slice(0,5)};
 }
 const monthArtists=artistList.map(a=>({artist:a.artist,key:a.key,plays:a.byMonth.get(selectedMonth)??0})).filter(a=>a.plays>0).sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist)).slice(0,8);
 return {hasEvents:true,total:ordered.length,oldest:ordered[0].day,latest:ordered[ordered.length-1].day,zone,years:yearList,selectedYear,months:monthList,selectedMonth,monthArtists,topArtists:artistOptions.slice(0,10),artistOptions,artist};
}
