import type {RecentTrackV672} from './recently-played-v672';

/** V700: local, event-based insight. Never infer actual listened seconds from track length. */
export type SmartHistoryDayV700={key:string; label:string; dateLabel:string; plays:number; tracks:RecentTrackV672[]};
export type SmartHistorySongV700={id:string;title:string;artist:string;cover:string|null;spotifyUrl:string;plays:number;firstPlayedAt:string;lastPlayedAt:string;activeDays:number};
export type SmartHistoryArtistV700={credit:string;plays:number;uniqueSongs:number;lastPlayedAt:string};
export type SmartHistoryV700={events:number;uniqueSongs:number;artistCredits:number;repeatEvents:number;repeatPercent:number;activeDays:number;totalTrackDurationMs:number;dayWindow:SmartHistoryDayV700[];topSongs:SmartHistorySongV700[];topArtists:SmartHistoryArtistV700[];daysOutsideWindow:number};
export const V700_DAY_WINDOW=14;
const dateKeyV700=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const formatDate=(d:Date)=>new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'2-digit'}).format(d);
const formatWeekday=(d:Date)=>new Intl.DateTimeFormat('de-AT',{weekday:'short'}).format(d);

/** Events must already be a user's *loaded* Spotify pages, optionally filtered by V699's search/period.
 * The data is ephemeral and has no requests, storage or background instrumentation.
 * All day boundaries are calculated in the device's local timezone (DST safe).
 */
export function smartListeningHistoryV700(events:ReadonlyArray<RecentTrackV672>, now:Date=new Date()):SmartHistoryV700{
 const current=Number.isFinite(now.getTime())?now:new Date();
 const window:SmartHistoryDayV700[]=Array.from({length:V700_DAY_WINDOW},(_,i)=>{
  const date=new Date(current.getFullYear(),current.getMonth(),current.getDate()-(V700_DAY_WINDOW-1-i));
  return {key:dateKeyV700(date),label:formatWeekday(date),dateLabel:formatDate(date),plays:0,tracks:[]};
 });
 const dayIndex=new Map(window.map((day,i)=>[day.key,i]));
 const songs=new Map<string,SmartHistorySongV700&{days:Set<string>}>();
 const artists=new Map<string,SmartHistoryArtistV700&{songIds:Set<string>}>();
 const allDays=new Set<string>();
 const observed:RecentTrackV672[]=[];
 let totalTrackDurationMs=0,daysOutsideWindow=0;
 for(const track of events.slice(0,600)){
  if(!track||typeof track.id!=='string'||!track.id||typeof track.playedAt!=='string')continue;
  const at=new Date(track.playedAt);
  if(!Number.isFinite(at.getTime())||at.getTime()>current.getTime()+60000)continue;
  const key=dateKeyV700(at);
  allDays.add(key);observed.push(track);
  const index=dayIndex.get(key);
  if(index===undefined)daysOutsideWindow++;
  else {window[index].plays++;window[index].tracks.push(track);}
  if(Number.isFinite(track.durationMs)&&track.durationMs>0)totalTrackDurationMs+=Math.min(86400000,track.durationMs);
  const song=songs.get(track.id);
  if(song){song.plays++;song.days.add(key);if(at.getTime()<Date.parse(song.firstPlayedAt))song.firstPlayedAt=track.playedAt;if(at.getTime()>Date.parse(song.lastPlayedAt))song.lastPlayedAt=track.playedAt;}
  else songs.set(track.id,{id:track.id,title:track.title,artist:track.artist,cover:track.albumCoverUrl,spotifyUrl:track.spotifyUrl,plays:1,firstPlayedAt:track.playedAt,lastPlayedAt:track.playedAt,activeDays:1,days:new Set([key])});
  // The Spotify display credit may contain multiple artists. Do not split or invent individual plays.
  const credit=(typeof track.artist==='string'&&track.artist.trim())||'Unbekannter Künstler-Credit';
  const artist=artists.get(credit);
  if(artist){artist.plays++;artist.songIds.add(track.id);if(at.getTime()>Date.parse(artist.lastPlayedAt))artist.lastPlayedAt=track.playedAt;}
  else artists.set(credit,{credit,plays:1,uniqueSongs:1,lastPlayedAt:track.playedAt,songIds:new Set([track.id])});
 }
 const rank=(a:{plays:number;lastPlayedAt:string},b:{plays:number;lastPlayedAt:string})=>b.plays-a.plays||Date.parse(b.lastPlayedAt)-Date.parse(a.lastPlayedAt);
 const topSongs=[...songs.values()].map(({days,...s})=>({...s,activeDays:days.size})).sort(rank).slice(0,12);
 const topArtists=[...artists.values()].map(({songIds,...a})=>({...a,uniqueSongs:songIds.size})).sort(rank).slice(0,10);
 const repeatEvents=observed.length-songs.size;
 for(const d of window)d.tracks.sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt));
 return {events:observed.length,uniqueSongs:songs.size,artistCredits:artists.size,repeatEvents,
  repeatPercent:observed.length?Math.round(100*repeatEvents/observed.length):0,
  activeDays:allDays.size,totalTrackDurationMs,dayWindow:window,topSongs,topArtists,daysOutsideWindow};
}
