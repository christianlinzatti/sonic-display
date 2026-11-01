import type {LastFmEventV706} from './lastfm-history-v706';

/** V711: pure, read-only listening intelligence over an already validated V706 archive.
 * Counts are scrobbles, never duration, and never a claim of complete listening history.
 */
export type V711TimeZone='Europe/Vienna'|'UTC';
export type V711Period='30'|'90'|'365'|'all';
export type V711Day={day:number;label:string;count:number};
export type V711Slot={label:string;count:number};
export type V711Month={month:string;count:number;artists:number;songs:number};
export type V711Artist={artist:string;plays:number;songs:number;activeDays:number;lastPlayed:string};
export type V711Song={artist:string;title:string;plays:number;activeDays:number;lastPlayed:string};
export type V711Change={artist:string;recent:number;previous:number;change:number};
export type V711Intelligence={
 total:number;uniqueArtists:number;uniqueSongs:number;activeDays:number;
 period:V711Period;timeZone:V711TimeZone;oldest:string|null;newest:string|null;
 weekdays:V711Day[];dayparts:V711Slot[];months:V711Month[];
 topArtists:V711Artist[];topSongs:V711Song[];
 rising:V711Change[];falling:V711Change[];recent30:number;previous30:number;
};
const DAY=86_400_000;
const norm=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const safe=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0&&x.length<=400&&!/[\u0000-\u001f\u007f]/.test(x);
const weekdayLabels=['Mo','Di','Mi','Do','Fr','Sa','So'];
const daypartLabels=['Nacht (0–6)','Vormittag (6–12)','Nachmittag (12–18)','Abend (18–24)'];
const datePartsFormatters:Record<V711TimeZone,Intl.DateTimeFormat>={
 'Europe/Vienna':new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}),
 'UTC':new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'})
};
function localParts(epoch:number,zone:V711TimeZone){
 const fields:Record<string,string>={};
 for(const p of datePartsFormatters[zone].formatToParts(new Date(epoch)))if(p.type!=='literal')fields[p.type]=p.value;
 const year=Number(fields.year),month=Number(fields.month),day=Number(fields.day),hour=Number(fields.hour);
 const weekday=(new Date(Date.UTC(year,month-1,day)).getUTCDay()+6)%7;
 return {date:`${fields.year}-${fields.month}-${fields.day}`,month:`${fields.year}-${fields.month}`,weekday,hour};
}
function monthsFrom(now:number,zone:V711TimeZone){
 const parts=localParts(now,zone),[year,month]=parts.month.split('-').map(Number),result:V711Month[]=[];
 for(let i=11;i>=0;i--){const d=new Date(Date.UTC(year,month-1-i,1));result.push({month:d.toISOString().slice(0,7),count:0,artists:0,songs:0});}
 return result;
}
function validEvent(value:unknown,now:number):value is LastFmEventV706{
 if(value===null||typeof value!=='object'||Array.isArray(value))return false;
 const v=value as Partial<LastFmEventV706>;
 if(!safe(v.artist)||!safe(v.title)||!safe(v.playedAt))return false;
 if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v.playedAt))return false;
 const timestamp=Date.parse(v.playedAt);
 return Number.isFinite(timestamp)&&timestamp>=946684800000&&timestamp<=now+60_000&&new Date(timestamp).toISOString()===v.playedAt;
}
const byPlaysThenName=(a:{plays:number;artist:string},b:{plays:number;artist:string})=>b.plays-a.plays||a.artist.localeCompare(b.artist);

export function lastFmIntelligenceV711(events:readonly LastFmEventV706[],now=new Date(),period:V711Period='365',timeZone:V711TimeZone='Europe/Vienna'):V711Intelligence{
 const time=Number.isFinite(now.getTime())?now.getTime():Date.now();
 const zone:V711TimeZone=timeZone==='UTC'?'UTC':'Europe/Vienna';
 const range:V711Period=period==='all'||period==='30'||period==='90'?period:'365';
 const cutoff=range==='all'?Number.NEGATIVE_INFINITY:time-Number(range)*DAY;
 const weekdays:V711Day[]=weekdayLabels.map((label,day)=>({label,day,count:0}));
 const dayparts:V711Slot[]=daypartLabels.map(label=>({label,count:0}));
 const months=monthsFrom(time,zone),monthMap=new Map(months.map(m=>[m.month,m]));
 const monthArtist=new Map<string,Set<string>>(),monthSong=new Map<string,Set<string>>();
 const artists=new Map<string,{artist:string;plays:number;songs:Set<string>;days:Set<string>;last:number}>();
 const songs=new Map<string,{artist:string;title:string;plays:number;days:Set<string>;last:number}>();
 const changes=new Map<string,{artist:string;recent:number;previous:number}>();
 const activeDays=new Set<string>();let total=0,oldest:number|null=null,newest:number|null=null,recent30=0,previous30=0;
 for(const item of Array.isArray(events)?events:[]){
  if(!validEvent(item,time))continue;
  const epoch=Date.parse(item.playedAt);
  if(epoch>time)continue; // A clock-skewed future scrobble is not yet historical data.
  const delta=time-epoch;
  const a=norm(item.artist),s=norm(item.title),key=`${a}\u001f${s}`;
  const loc=localParts(epoch,zone);
  // Trends and month chart always use all saved scrobbles, not the ranking filter.
  if(delta>=0&&delta<30*DAY){recent30++;const entry=changes.get(a)??{artist:item.artist,recent:0,previous:0};entry.recent++;changes.set(a,entry);}
  else if(delta>=30*DAY&&delta<60*DAY){previous30++;const entry=changes.get(a)??{artist:item.artist,recent:0,previous:0};entry.previous++;changes.set(a,entry);}
  const month=monthMap.get(loc.month);
  if(month){month.count++;if(!monthArtist.has(loc.month)){monthArtist.set(loc.month,new Set());monthSong.set(loc.month,new Set());}monthArtist.get(loc.month)!.add(a);monthSong.get(loc.month)!.add(key);}
  if(epoch<cutoff||epoch>time)continue;
  total++;activeDays.add(loc.date);weekdays[loc.weekday].count++;dayparts[Math.floor(loc.hour/6)].count++;
  oldest=oldest===null?epoch:Math.min(oldest,epoch);newest=newest===null?epoch:Math.max(newest,epoch);
  const artist=artists.get(a)??{artist:item.artist,plays:0,songs:new Set<string>(),days:new Set<string>(),last:epoch};
  artist.plays++;artist.songs.add(key);artist.days.add(loc.date);
  if(epoch>artist.last){artist.last=epoch;artist.artist=item.artist;}artists.set(a,artist);
  const song=songs.get(key)??{artist:item.artist,title:item.title,plays:0,days:new Set<string>(),last:epoch};
  song.plays++;song.days.add(loc.date);
  if(epoch>song.last){song.last=epoch;song.artist=item.artist;song.title=item.title;}songs.set(key,song);
 }
 for(const m of months){m.artists=monthArtist.get(m.month)?.size??0;m.songs=monthSong.get(m.month)?.size??0;}
 const topArtists=[...artists.values()].map(x=>({artist:x.artist,plays:x.plays,songs:x.songs.size,activeDays:x.days.size,lastPlayed:new Date(x.last).toISOString()})).sort(byPlaysThenName).slice(0,10);
 const topSongs=[...songs.values()].map(x=>({artist:x.artist,title:x.title,plays:x.plays,activeDays:x.days.size,lastPlayed:new Date(x.last).toISOString()})).sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist)||a.title.localeCompare(b.title)).slice(0,10);
 const ranked=[...changes.values()].map(x=>({...x,change:x.recent-x.previous}));
 const rising=ranked.filter(x=>x.change>0).sort((a,b)=>b.change-a.change||b.recent-a.recent||a.artist.localeCompare(b.artist)).slice(0,6);
 const falling=ranked.filter(x=>x.change<0).sort((a,b)=>a.change-b.change||b.previous-a.previous||a.artist.localeCompare(b.artist)).slice(0,6);
 return {total,uniqueArtists:artists.size,uniqueSongs:songs.size,activeDays:activeDays.size,period:range,timeZone:zone,
  oldest:oldest===null?null:new Date(oldest).toISOString(),newest:newest===null?null:new Date(newest).toISOString(),weekdays,dayparts,months,topArtists,topSongs,rising,falling,recent30,previous30};
}
