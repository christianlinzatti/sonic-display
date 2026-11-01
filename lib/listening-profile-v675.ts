import type {RecentTrackV672} from './recently-played-v672';
import type {HistoryGenreMapV674} from './recently-played-discovery-v674';
import {suggestHistoryStageV674} from './recently-played-discovery-v674';
import {MUSIC_GENRES,isMusicGenre,musicGenreFamily,type GenreFamily,type MusicGenre} from '../config/musicGenres';
import type {UiPreferences} from '../types/music';

/** This profile describes ONLY the currently loaded listening history, never a user's long-term tastes. */
export type ProfileArtistV675 = Readonly<{name:string;plays:number;uniqueSongs:number;cover:string|null}>;
export type ProfileFamilyV675 = Readonly<{
 family:GenreFamily; genre:MusicGenre;label:string;plays:number;uniqueSongs:number;share:number;color:string;
}>;
export type ProfileStagePatchV675 = Pick<UiPreferences,'stageTheme'|'stageLightStrength'|'stageReactive'|'avatarDancePreset'>;
export type ProfileFxPatchV675 = Pick<UiPreferences,'danceFxEnabled'|'danceFxStrength'>;
export type ProfileRecommendationV675 = Readonly<{
 key:GenreFamily;name:string;description:string;showStyle:string;familyLabel:string;plays:number;
 share:number;uniqueSongs:number;stageTheme:UiPreferences['stageTheme'];
 avatarDancePreset:UiPreferences['avatarDancePreset'];lightStrength:number;
 stage:ProfileStagePatchV675;fx:ProfileFxPatchV675;
}>;
export type ListeningProfileV675 = Readonly<{
 total:number;classified:number;unclassified:number;coverage:number;
 uniqueTracks:number;families:ReadonlyArray<ProfileFamilyV675>;
 artists:ReadonlyArray<ProfileArtistV675>;
 recommendations:ReadonlyArray<ProfileRecommendationV675>;
 note:string;
}>;

const STYLES:Record<GenreFamily,{showStyle:string;fx:boolean;fxStrength:number}>={
 hardtekk:{showStyle:'Festival-Energie · kraftvolle Drops',fx:true,fxStrength:65},
 hardstyle:{showStyle:'Mainstage · pulsierende Hooks',fx:true,fxStrength:60},
 techno:{showStyle:'Club-Nacht · rhythmische Lichtwechsel',fx:true,fxStrength:48},
 hiphop:{showStyle:'Rap-Spotlight · Verse und Hooks',fx:false,fxStrength:35},
 rock:{showStyle:'Live-Arena · instrumentale Akzente',fx:false,fxStrength:40},
 pop:{showStyle:'Pop-Show · farbige Refrains',fx:false,fxStrength:40},
 ambient:{showStyle:'Atmosphäre · ruhige Übergänge',fx:false,fxStrength:25},
};

/** Does not use artist-name guessing, Spotify audio heuristics, or unpublished listening data. */
export function buildListeningProfileV675(tracks:ReadonlyArray<RecentTrackV672>,genres:HistoryGenreMapV674):ListeningProfileV675{
 const families=new Map<GenreFamily,{genreVotes:Map<MusicGenre,number>;plays:number;songs:Set<string>}>();
 const artists=new Map<string,{name:string;plays:number;songs:Set<string>;cover:string|null}>();
 const allSongs=new Set<string>();
 let classified=0;
 for(const track of tracks){
  if(!track.id)continue;
  allSongs.add(track.id);
  const name=(track.primaryArtist||track.artist||'Unbekannt').trim()||'Unbekannt';
  const key=name.toLocaleLowerCase('de');
  const prior=artists.get(key);
  if(prior){prior.plays++;prior.songs.add(track.id);if(!prior.cover)prior.cover=track.albumCoverUrl;}
  else artists.set(key,{name,plays:1,songs:new Set([track.id]),cover:track.albumCoverUrl});
  // Only valid, explicitly resolved Last.fm genres count as evidence.
  if(!Object.prototype.hasOwnProperty.call(genres,track.id))continue;
  const genre=genres[track.id];
  if(typeof genre!=='string'||!isMusicGenre(genre))continue;
  classified++;
  const family=musicGenreFamily(genre);
  const bucket=families.get(family)||{genreVotes:new Map<MusicGenre,number>(),plays:0,songs:new Set<string>()};
  bucket.plays++;
  bucket.songs.add(track.id);
  bucket.genreVotes.set(genre,(bucket.genreVotes.get(genre)||0)+1);
  families.set(family,bucket);
 }
 const total=tracks.length;
 const ranked=[...families].map(([family,item]):ProfileFamilyV675=>{
  const genre=[...item.genreVotes].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0][0];
  return {family,genre,label:MUSIC_GENRES[genre].label,plays:item.plays,uniqueSongs:item.songs.size,
   share:classified?Math.round(item.plays/classified*100):0,color:MUSIC_GENRES[genre].accent};
 }).sort((a,b)=>b.plays-a.plays||b.uniqueSongs-a.uniqueSongs||a.label.localeCompare(b.label,'de'));
 const topArtists=[...artists.values()].map(a=>({name:a.name,plays:a.plays,uniqueSongs:a.songs.size,cover:a.cover}))
  .sort((a,b)=>b.plays-a.plays||b.uniqueSongs-a.uniqueSongs||a.name.localeCompare(b.name,'de')).slice(0,5);
 // Multiple independently identified songs prevent one replay from becoming a "taste" or a show preset.
 const suggestions=ranked.filter(item=>item.plays>=3&&item.uniqueSongs>=2).slice(0,3).flatMap((item):ProfileRecommendationV675[]=>{
  const suggestion=suggestHistoryStageV674(item.genre);if(!suggestion)return [];
  const style=STYLES[item.family];
  return [{key:item.family,name:suggestion.label,description:suggestion.description,showStyle:style.showStyle,
   familyLabel:item.label,plays:item.plays,share:item.share,uniqueSongs:item.uniqueSongs,
   stageTheme:suggestion.stageTheme,avatarDancePreset:suggestion.avatarDancePreset,lightStrength:suggestion.stageLightStrength,
   stage:{stageTheme:suggestion.stageTheme,stageReactive:suggestion.stageReactive,
    stageLightStrength:suggestion.stageLightStrength,avatarDancePreset:suggestion.avatarDancePreset},
   fx:{danceFxEnabled:style.fx,danceFxStrength:style.fxStrength}}];
 });
 const note=classified===0?'Noch keine Genres erkannt. Bitte zuerst im Genre-Mix Daten ermitteln.':
  classified<5||classified/Math.max(1,total)<.35?'Wenig Genre-Evidenz: Empfehlungen sind vorläufig.':
  'Ein Ausschnitt deines Hörverlaufs – keine vollständige Langzeit- oder Lieblingsmusik-Analyse.';
 return {total,classified,unclassified:Math.max(0,total-classified),coverage:total?Math.round(classified/total*100):0,
  uniqueTracks:allSongs.size,families:ranked,artists:topArtists,recommendations:suggestions,note};
}

/** Whitelisted preferences only. Automatic song dramaturgy/camera/lyrics/performer models are untouched. */
export function musicProfilePatchV675(recommendation:ProfileRecommendationV675,includeFx:boolean):Partial<UiPreferences>{
 return includeFx?{...recommendation.stage,...recommendation.fx}:{...recommendation.stage};
}

export function snapshotProfilePatchV675(preferences:UiPreferences,patch:Partial<UiPreferences>):Partial<UiPreferences>{
 const previous:Partial<UiPreferences>={};
 // Explicit keys avoid copying private settings or unrelated configuration into a history snapshot.
 if('stageTheme' in patch)previous.stageTheme=preferences.stageTheme;
 if('stageLightStrength' in patch)previous.stageLightStrength=preferences.stageLightStrength;
 if('stageReactive' in patch)previous.stageReactive=preferences.stageReactive;
 if('avatarDancePreset' in patch)previous.avatarDancePreset=preferences.avatarDancePreset;
 if('danceFxEnabled' in patch)previous.danceFxEnabled=preferences.danceFxEnabled;
 if('danceFxStrength' in patch)previous.danceFxStrength=preferences.danceFxStrength;
 return previous;
}
