import type {RecentTrackV672} from './recently-played-v672';
import {isMusicGenre, MUSIC_GENRES, musicGenreFamily, type MusicGenre} from '../config/musicGenres';
import type {StageEnvironmentId} from '../components/visualizer/stages';

export type HistoryGenreV674 = MusicGenre | null;
export type HistoryGenreMapV674 = Readonly<Record<string, HistoryGenreV674>>;
export type GenreBarV674 = {genre:MusicGenre; label:string; count:number; color:string};
export type GenreSummaryV674 = {bars:GenreBarV674[]; covered:number; unknown:number; total:number; classifiedSongs:number};
export type FavoriteArtistV674 = {name:string; count:number; cover:string|null; trackId:string; spotifyUrl:string};
export type HistoryStageSuggestionV674 = {
 label:string; description:string; stageTheme:StageEnvironmentId; stageLightStrength:number; stageReactive:boolean;
 avatarDancePreset:'auto'|'hardstyle'|'techno'|'rock-metal'|'ambient'|'freestyle';
};

/** Do not fabricate genre information from artist names, BPM or album titles. */
export function genreResponseV674(data:unknown): HistoryGenreV674 {
 if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
 const response = data as {genre?:unknown; confidence?:unknown};
 // Last.fm inference is a heuristic; reject low confidence or malformed results.
 return typeof response.genre === 'string' && isMusicGenre(response.genre) &&
  typeof response.confidence === 'number' && Number.isFinite(response.confidence) && response.confidence >= 40
  ? response.genre : null;
}

/** One genre vote per playback event, counting repeats and showing unclassified coverage. */
export function historyGenresV674(tracks:ReadonlyArray<RecentTrackV672>, known:HistoryGenreMapV674):GenreSummaryV674{
 const totals = new Map<MusicGenre,number>();
 let covered=0,classifiedSongs=0;
 const classified=new Set<string>();
 for (const track of tracks){
  if(!track.id)continue;
  if(!Object.prototype.hasOwnProperty.call(known,track.id))continue;
  covered++;
  const genre=known[track.id];
  if(genre && isMusicGenre(genre)){
   totals.set(genre,(totals.get(genre)??0)+1);
   classified.add(track.id);
  }
 }
 classifiedSongs=classified.size;
 const bars=[...totals].map(([genre,count])=>({genre,label:MUSIC_GENRES[genre].label,count,color:MUSIC_GENRES[genre].accent}))
  .sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'de'));
 return {bars,covered,unknown:Math.max(0,tracks.length-[...totals.values()].reduce((a,b)=>a+b,0)),total:tracks.length,classifiedSongs};
}

/** Credits stay intact for collaborations; the image represents a recently played track, not an artist photo. */
export function favoriteArtistsV674(tracks:ReadonlyArray<RecentTrackV672>,limit=5):FavoriteArtistV674[]{
 const artists=new Map<string,FavoriteArtistV674>();
 for(const track of tracks){
  if(!track.id)continue;
  const name=track.artist.trim()||'Unbekannter Künstler';
  const key=name.toLocaleLowerCase('de');
  const prior=artists.get(key);
  if(prior){prior.count++;continue;}
  artists.set(key,{name,count:1,cover:track.albumCoverUrl,trackId:track.id,spotifyUrl:track.spotifyUrl});
 }
 return [...artists.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'de')).slice(0,Math.max(0,Math.min(10,limit)));
}

/** Stage / dance only. Never change avatar models, lyric setup, playback or camera. */
export function suggestHistoryStageV674(genre:HistoryGenreV674): HistoryStageSuggestionV674|null {
 if(!genre || !isMusicGenre(genre))return null;
 const family=musicGenreFamily(genre);
 switch(family){
  case 'hardtekk':return {label:'Hardtekk Mainstage',description:'Festival-Look mit energiereichem Hardstyle-Footwork',stageTheme:'festival',stageLightStrength:82,stageReactive:true,avatarDancePreset:'hardstyle'};
  case 'hardstyle':return {label:'Hardstyle Festival',description:'Intensive Beams und kraftvoller Tanzstil',stageTheme:'festival',stageLightStrength:78,stageReactive:true,avatarDancePreset:'hardstyle'};
  case 'hiphop':return {label:'Rap Spotlight',description:'Fokussierte Bühne und automatische Rap-Choreografie',stageTheme:'white',stageLightStrength:65,stageReactive:true,avatarDancePreset:'auto'};
  case 'rock':return {label:'Rock Live Arena',description:'Bühnenstrahler und Rock-/Metal-Motion',stageTheme:'rock',stageLightStrength:68,stageReactive:true,avatarDancePreset:'rock-metal'};
  case 'techno':return {label:'Neon Club',description:'Elektronische Lichter und Techno-Motion',stageTheme:'neon',stageLightStrength:72,stageReactive:true,avatarDancePreset:'techno'};
  case 'pop':return {label:'Pop Prism',description:'Leuchtende Farben und Freestyle-Choreografie',stageTheme:'vaporwave',stageLightStrength:60,stageReactive:true,avatarDancePreset:'freestyle'};
  case 'ambient':return {label:'Ambient Galaxy',description:'Ruhiges Licht und sanfte Bewegungen',stageTheme:'galaxy',stageLightStrength:35,stageReactive:false,avatarDancePreset:'ambient'};
 }
}
