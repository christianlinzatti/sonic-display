import type {RecentTrackV672} from './recently-played-v672';

/** Statistics are computed in memory from *loaded playback events*, not a user's whole history. */
export type HistorySongV673 = {id:string; title:string; artist:string; cover:string|null; spotifyUrl:string; plays:number};
export type HistoryArtistV673 = {name:string; plays:number};
export type HistoryPeriodV673 = {key:'night'|'morning'|'afternoon'|'evening'; label:string; plays:number};
export type HistoryInsightsV673 = {
 plays:number;
 uniqueSongs:number;
 uniqueArtistCredits:number;
 repeatPlays:number;
 days:number;
 topSongs:HistorySongV673[];
 topArtists:HistoryArtistV673[];
 periods:HistoryPeriodV673[];
};
const TIME_PERIODS:ReadonlyArray<Pick<HistoryPeriodV673,'key'|'label'>> = [
 {key:'night',label:'Nachts · 0–6 Uhr'},
 {key:'morning',label:'Morgens · 6–12 Uhr'},
 {key:'afternoon',label:'Nachmittags · 12–18 Uhr'},
 {key:'evening',label:'Abends · 18–24 Uhr'},
];
/** Caller supplies local time interpretation through the date factory when testing. */
export function historyInsightsV673(tracks:ReadonlyArray<RecentTrackV672>, dateOf:(value:string)=>Date = (value)=>new Date(value)):HistoryInsightsV673 {
 const songs = new Map<string,HistorySongV673>();
 const artists = new Map<string,number>();
 const days = new Set<string>();
 const counts=[0,0,0,0];
 let plays=0;
 for(const track of tracks){
  if(!track.id || !Number.isFinite(Date.parse(track.playedAt)))continue;
  plays++;
  const existing=songs.get(track.id);
  if(existing)existing.plays++;
  else songs.set(track.id,{id:track.id,title:track.title,artist:track.artist,cover:track.albumCoverUrl,spotifyUrl:track.spotifyUrl,plays:1});
  // A credit line with features is counted as one displayed credit, not as falsely parsed artists.
  const credit=track.artist.trim() || 'Unbekannter Künstler';
  artists.set(credit,(artists.get(credit)??0)+1);
  const date=dateOf(track.playedAt);
  if(Number.isFinite(date.getTime())){
   days.add(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
   counts[Math.floor(date.getHours()/6)]++;
  }
 }
 const order=(a:{plays:number},b:{plays:number})=>b.plays-a.plays;
 return {
  plays,
  uniqueSongs:songs.size,
  uniqueArtistCredits:artists.size,
  repeatPlays:Math.max(0,plays-songs.size),
  days:days.size,
  topSongs:[...songs.values()].sort((a,b)=>order(a,b)||a.title.localeCompare(b.title,'de')).slice(0,5),
  topArtists:[...artists.entries()].map(([name,count])=>({name,plays:count})).sort((a,b)=>order(a,b)||a.name.localeCompare(b.name,'de')).slice(0,5),
  periods:TIME_PERIODS.map((period,index)=>({...period,plays:counts[index]})),
 };
}
