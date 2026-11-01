/** V864 Playlist Taste Analyzer – pure, local, provenance-aware comparison. */
import type {SpotifyPlaylistTrackV851} from './spotify-playlists-v851';
import type {LastFmEventV706} from './lastfm-history-v706';
export const V864_MAX_TRACKS = 500;
export type TasteStatusV864 = 'favorite'|'heard'|'not-in-archive'|'no-history';
export type TasteTrackV864={
 key:string;track:SpotifyPlaylistTrackV851;playlistOccurrences:number;
 plays:number;lastPlayed:string|null;status:TasteStatusV864;
};
export type TasteArtistV864={name:string;tracks:number;heard:number;plays:number};
export type PlaylistTasteReportV864={
 playlistItems:number;uniqueTracks:number;duplicates:number;scanned:number;
 historyAvailable:boolean;matchedTracks:number;missingTracks:number;favoriteTracks:number;
 matchingScrobbles:number;topArtists:TasteArtistV864[];tracks:TasteTrackV864[];
};
const normal=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘´`]/g,"'").toLocaleLowerCase('en-US').trim().replace(/\s+/g,' ');
const artistKey=(s:string)=>normal(s.split(/,|\s+feat\.?\s+|\s+ft\.?\s+/i)[0]).replace(/[^\p{L}\p{N}]+/gu,'');
const titleKey=(s:string)=>normal(s).replace(/\s*[\[(]\s*(?:feat\.?|ft\.?)\s+[^\])]+[\])]\s*$/i,'').replace(/\s+(?:feat\.?|ft\.?)\s+.*$/i,'').replace(/[^\p{L}\p{N}]+/gu,'');
export const playlistSongKeyV864=(artist:string,title:string)=>artistKey(artist)+'\u001f'+titleKey(title);
const str=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<=500;
/** Album and remix/live qualifiers remain part of the title: do not invent approximate matches. */
export function buildPlaylistTasteV864(
 playlistTracks:readonly SpotifyPlaylistTrackV851[],
 scrobbles:readonly LastFmEventV706[]|null,
):PlaylistTasteReportV864{
 const archive=new Map<string,{plays:number;lastPlayed:string}>();
 if(scrobbles){for(const event of scrobbles){
  if(!event||!str(event.artist)||!str(event.title)||!str(event.playedAt)||!Number.isFinite(Date.parse(event.playedAt)))continue;
  const key=playlistSongKeyV864(event.artist,event.title);if(key==='\u001f')continue;
  const prev=archive.get(key);
  if(prev){prev.plays++;if(event.playedAt>prev.lastPlayed)prev.lastPlayed=event.playedAt;}
  else archive.set(key,{plays:1,lastPlayed:event.playedAt});
 }}
 const unique=new Map<string,TasteTrackV864>();let scanned=0;
 for(const track of playlistTracks){
  if(!track||!str(track.artist)||!str(track.title)||!str(track.id))continue;
  // Bound raw playlist positions, not only the number of valid music items.
  if(!Number.isSafeInteger(track.position)||track.position<0||track.position>=V864_MAX_TRACKS)continue;
  if(scanned>=V864_MAX_TRACKS)break;
  scanned++;
  const key=playlistSongKeyV864(track.artist,track.title),prior=unique.get(key);
  if(prior){prior.playlistOccurrences++;continue;}
  const match=archive.get(key),plays=scrobbles?(match?.plays??0):0;
  unique.set(key,{key,track,playlistOccurrences:1,plays,lastPlayed:match?.lastPlayed??null,
   status:scrobbles===null?'no-history':plays>=3?'favorite':plays>0?'heard':'not-in-archive'});
 }
 const tracks=[...unique.values()];const artists=new Map<string,TasteArtistV864>();
 for(const entry of tracks){const name=entry.track.artist.split(',')[0].trim();const key=artistKey(name);
  const old=artists.get(key);if(old){old.tracks++;old.heard+=entry.plays>0?1:0;old.plays+=entry.plays;}
  else artists.set(key,{name,tracks:1,heard:entry.plays>0?1:0,plays:entry.plays});
 }
 const matchedTracks=tracks.filter(x=>x.plays>0).length;
 return {playlistItems:scanned,scanned,uniqueTracks:tracks.length,duplicates:scanned-tracks.length,
  historyAvailable:scrobbles!==null,matchedTracks,missingTracks:scrobbles===null?0:tracks.length-matchedTracks,
  favoriteTracks:tracks.filter(x=>x.plays>=3).length,
  matchingScrobbles:tracks.reduce((sum,x)=>sum+x.plays,0),
  topArtists:[...artists.values()].sort((a,b)=>b.tracks-a.tracks||b.plays-a.plays||a.name.localeCompare(b.name,'de')).slice(0,8),tracks};
}
