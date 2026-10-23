import { loadPresetLibrary, type PresetLibrary } from "./lightingPresetLibrary";
import { MUSIC_GENRES, resolveMusicGenre, musicGenreFamily, type MusicGenre } from "@/config/musicGenres";
import { loadLightingPreset, sanitizeLightingPreset, type LightingPreset } from "./predictiveLighting";

/** V179: mapping is explicit, never inferred from a similarly named preset. */
export const GENRE_PROFILE_KEY = "sonic-display:lighting-genre-profiles-v179";
export const GENRE_PROFILE_CHANGED = "sonic-display:lighting-genre-profiles-changed";
export const LIGHTING_GENRES = Object.keys(MUSIC_GENRES) as MusicGenre[];
export type LightingGenre = MusicGenre;
export type GenreProfiles = {version:1; enabled:boolean; assignments:Partial<Record<LightingGenre,string>>};
export const DEFAULT_GENRE_PROFILES: GenreProfiles = {version:1,enabled:false,assignments:{}};
export function normalizeLightingGenre(input:string|null|undefined):LightingGenre|null {
  return resolveMusicGenre(input);
}
export function sanitizeGenreProfiles(input:unknown):GenreProfiles {
  if(!input || typeof input!=="object")return {version:1,enabled:false,assignments:{}};
  const raw=input as Partial<GenreProfiles>;
  if(raw.version!==1)return {version:1,enabled:false,assignments:{}};
  const assignments:GenreProfiles["assignments"]={};
  for(const genre of LIGHTING_GENRES){
    const id=raw.assignments?.[genre];
    if(typeof id==="string" && id.length>0 && id.length<=64)assignments[genre]=id;
  }
  return {version:1,enabled:raw.enabled===true,assignments};
}
export function selectGenrePreset(genre:string|null|undefined, config:GenreProfiles, library:PresetLibrary):LightingPreset|null {
  if(!config.enabled)return null;
  const normalized=normalizeLightingGenre(genre);
  if(!normalized)return null;
  const id=config.assignments[normalized] ?? config.assignments[musicGenreFamily(normalized)];
  if(!id)return null;
  const entry=library.entries.find(item=>item.id===id);
  const latest=entry?.revisions.at(-1);
  return latest?sanitizeLightingPreset(latest.preset):null;
}
export function loadGenreProfiles():GenreProfiles {
  if(typeof window==="undefined")return {version:1,enabled:false,assignments:{}};
  try{return sanitizeGenreProfiles(JSON.parse(window.localStorage.getItem(GENRE_PROFILE_KEY)||"null"));}catch{return {version:1,enabled:false,assignments:{}};}
}
export function saveGenreProfiles(config:GenreProfiles):boolean {
  if(typeof window==="undefined")return false;
  try{window.localStorage.setItem(GENRE_PROFILE_KEY,JSON.stringify(sanitizeGenreProfiles(config)));window.dispatchEvent(new Event(GENRE_PROFILE_CHANGED));return true;}catch{return false;}
}
/** A manual preset remains the fallback when auto selection is off or unmapped. */
export function resolveLightingPreset(genre:string|null|undefined,config:GenreProfiles,library:PresetLibrary):LightingPreset {
  return selectGenrePreset(genre,config,library)??loadLightingPreset();
}
