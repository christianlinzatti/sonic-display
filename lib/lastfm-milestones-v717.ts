/** V717 – deterministic, read-only milestones for the existing local Last.fm archive.
 * A scrobble is not a guarantee of a complete play or minutes listened.
 * Days and months use the viewer's local timezone, including DST changes.
 */
import type {LastFmEventV706} from './lastfm-history-v706';
import {localDayKeyV716,monthKeyV716,moveMonthV716} from './lastfm-history-calendar-v716';

export type V717Streak={start:string;end:string;days:number};
export type V717PeakDay={day:string;plays:number};
export type V717PeakMonth={month:string;plays:number};
export type V717Favorite={artist:string;title?:string;plays:number};
export type V717Rediscovery={artist:string;title:string;album:string;day:string;returnedAt:string;previousAt:string;gapDays:number};
export type V717Month={month:string;plays:number;artists:number;songs:number;activeDays:number};
export type V717RecordBook={total:number;activeDays:number;firstDay:string|null;lastDay:string|null;
 longestStreak:V717Streak|null;currentStreak:V717Streak|null;peakDay:V717PeakDay|null;peakMonth:V717PeakMonth|null;
 topArtist:V717Favorite|null;topSong:V717Favorite|null;rediscoveries:V717Rediscovery[];months:V717Month[]};
export type V717MonthComparison={selected:V717Month;previous:V717Month|null;previousMonth:string|null;
 change:{plays:number;artists:number;songs:number;activeDays:number}|null;isCurrentMonth:boolean;
 isFirstArchiveMonth:boolean};

const clean=(v:string)=>v.normalize('NFKC').trim().toLocaleLowerCase('en-US');
const dayNumber=(day:string):number=>{
 const [y,m,d]=day.split('-').map(Number);
 return Math.floor(Date.UTC(y,m-1,d)/86_400_000);
};
const blank=(month:string):V717Month=>({month,plays:0,artists:0,songs:0,activeDays:0});
const match=(e:LastFmEventV706,nowMs:number):boolean=>{
 if(!e||typeof e.artist!=='string'||!e.artist.trim()||typeof e.title!=='string'||!e.title.trim()||typeof e.playedAt!=='string')return false;
 const time=Date.parse(e.playedAt);
 return Number.isFinite(time)&&time>=946684800000&&time<=nowMs;
};

/** Run once per archive snapshot; month navigation reuses these aggregates. */
export function lastFmMilestonesV717(events:readonly LastFmEventV706[],now=new Date()):V717RecordBook{
 const nowMs=now.getTime();
 const valid=Array.isArray(events)&&Number.isFinite(nowMs)?events.filter(e=>match(e,nowMs)).slice().sort((a,b)=>a.playedAt.localeCompare(b.playedAt)):[];
 const byDay=new Map<string,number>();
 const byMonth=new Map<string,{plays:number;days:Set<string>;artists:Set<string>;songs:Set<string>}>();
 const artists=new Map<string,V717Favorite>();
 const songs=new Map<string,V717Favorite>();
 const previousSong=new Map<string,LastFmEventV706>();
 const rediscoveries=new Map<string,V717Rediscovery>();
 for(const e of valid){
  const at=new Date(e.playedAt),day=localDayKeyV716(at),month=monthKeyV716(at),artistKey=clean(e.artist),songKey=`${artistKey}\u001f${clean(e.title)}`;
  byDay.set(day,(byDay.get(day)??0)+1);
  const m=byMonth.get(month)??{plays:0,days:new Set<string>(),artists:new Set<string>(),songs:new Set<string>()};
  m.plays++;m.days.add(day);m.artists.add(artistKey);m.songs.add(songKey);byMonth.set(month,m);
  const a=artists.get(artistKey)??{artist:e.artist,plays:0};a.plays++;artists.set(artistKey,a);
  const s=songs.get(songKey)??{artist:e.artist,title:e.title,plays:0};s.plays++;songs.set(songKey,s);
  const prior=previousSong.get(songKey);
  if(prior){
   const gapDays=dayNumber(day)-dayNumber(localDayKeyV716(new Date(prior.playedAt)));
   if(gapDays>=90)rediscoveries.set(songKey,{artist:e.artist,title:e.title,album:e.album,day,returnedAt:e.playedAt,previousAt:prior.playedAt,gapDays});
  }
  previousSong.set(songKey,e);
 }
 const days=[...byDay.keys()].sort();
 let longest:V717Streak|null=null,run:V717Streak|null=null;
 for(const day of days){
  const consecutive:boolean=run!==null&&dayNumber(day)-dayNumber(run.end)===1;
  run=consecutive?{start:run!.start,end:day,days:run!.days+1}:{start:day,end:day,days:1};
  if(longest===null||run.days>=longest.days)longest={...run};
 }
 const todayNumber=dayNumber(localDayKeyV716(now));
 const currentStreak=run&&(todayNumber-dayNumber(run.end)===0||todayNumber-dayNumber(run.end)===1)?{...run}:null;
 const monthStats=[...byMonth.entries()].map(([month,m]):V717Month=>({month,plays:m.plays,artists:m.artists.size,songs:m.songs.size,activeDays:m.days.size})).sort((a,b)=>a.month.localeCompare(b.month));
 const peakDay=[...byDay.entries()].sort((a,b)=>b[1]-a[1]||b[0].localeCompare(a[0]))[0];
 const peakMonth=[...byMonth.entries()].sort((a,b)=>b[1].plays-a[1].plays||b[0].localeCompare(a[0]))[0];
 const favorite=(values:Iterable<V717Favorite>)=>[...values].sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist)||((a.title??'').localeCompare(b.title??'')))[0]??null;
 return {total:valid.length,activeDays:days.length,firstDay:days[0]??null,lastDay:days[days.length-1]??null,
  longestStreak:longest,currentStreak,peakDay:peakDay?{day:peakDay[0],plays:peakDay[1]}:null,
  peakMonth:peakMonth?{month:peakMonth[0],plays:peakMonth[1].plays}:null,topArtist:favorite(artists.values()),topSong:favorite(songs.values()),
  rediscoveries:[...rediscoveries.values()].sort((a,b)=>b.returnedAt.localeCompare(a.returnedAt)||a.artist.localeCompare(b.artist)).slice(0,8),months:monthStats};
}

/** A missing month *within* the archive has zero observations. A month before
 * the first archived month is NOT a fair comparison baseline and stays null.
 */
export function compareLastFmMonthsV717(book:V717RecordBook,month:string,now=new Date()):V717MonthComparison{
 if(!moveMonthV716(month,0))throw new RangeError('Ungültiger Monatsvergleich.');
 const prevMonth=moveMonthV716(month,-1);
 const first=book.months[0]?.month??null;
 const selected=book.months.find(m=>m.month===month)??blank(month);
 const previous=first&&prevMonth&&prevMonth>=first?(book.months.find(m=>m.month===prevMonth)??blank(prevMonth)):null;
 return {selected,previous,previousMonth:previous?prevMonth:null,
  change:previous?{plays:selected.plays-previous.plays,artists:selected.artists-previous.artists,songs:selected.songs-previous.songs,activeDays:selected.activeDays-previous.activeDays}:null,
  isCurrentMonth:month===monthKeyV716(now),isFirstArchiveMonth:month===first};
}
