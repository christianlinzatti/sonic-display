import type { MusicGenre } from "@/types/animation";
import { normalizeArtist, sanitizeGenreMemory, type GenreMemory } from "./genreCorrectionMemory";

export const GENRE_SNAPSHOT_KEY = "sonic-display:v183:genre-memory-snapshots";
export const MAX_GENRE_SNAPSHOTS = 10;
export type GenreSnapshot = {id:string;label:string;createdAt:number;memory:GenreMemory};
const ALL_GENRES: MusicGenre[] = ["hardstyle","hardtekk","techno","hiphop","rock","ambient","pop"];

export function genreMemoryInsights(memory:GenreMemory, now=Date.now()) {
 const byArtist=new Map<string,{artist:string;total:number;genres:Partial<Record<MusicGenre,number>>}>();
 let recent=0,older=0;
 for(const correction of memory.corrections){
  const key=normalizeArtist(correction.artist)||"unbekannt";
  const group=byArtist.get(key)||{artist:key,total:0,genres:{}};
  group.total++;group.genres[correction.genre]=(group.genres[correction.genre]||0)+1;
  byArtist.set(key,group);
  if(correction.updatedAt>=now-30*86400000&&correction.updatedAt<=now)recent++;
  else older++;
 }
 const mixedArtists=[...byArtist.values()].filter(group=>Object.values(group.genres).filter(Boolean).length>1).sort((a,b)=>b.total-a.total);
 const genreCounts=Object.fromEntries(ALL_GENRES.map(genre=>[genre,memory.corrections.filter(c=>c.genre===genre).length])) as Record<MusicGenre,number>;
 return {recent,older,genreCounts,mixedArtists,artists:byArtist.size};
}
export function sanitizeGenreSnapshots(raw:unknown):GenreSnapshot[]{
 if(!Array.isArray(raw))return [];
 const used=new Set<string>();
 return raw.filter((entry):entry is GenreSnapshot=>{
  if(!entry||typeof entry!=="object")return false;
  const s=entry as Partial<GenreSnapshot>;
  if(typeof s.id!=="string"||!s.id||s.id.length>100||used.has(s.id)||typeof s.label!=="string"||!s.label.trim()||s.label.length>90||!Number.isFinite(s.createdAt))return false;
  if(!s.memory||s.memory.version!==1||!Array.isArray(s.memory.corrections)||s.memory.corrections.length>250)return false;
  if(sanitizeGenreMemory(s.memory).corrections.length!==s.memory.corrections.length)return false;
  used.add(s.id);return true;
 }).sort((a,b)=>b.createdAt-a.createdAt).slice(0,MAX_GENRE_SNAPSHOTS).map(s=>({...s,memory:sanitizeGenreMemory(s.memory)}));
}
export function createGenreSnapshot(existing:GenreSnapshot[],memory:GenreMemory,label:string,now=Date.now()):GenreSnapshot[]{
 const safeLabel=label.trim().slice(0,90);
 if(!safeLabel)throw new Error("Bitte einen Namen für die Sicherung eingeben.");
 const current=sanitizeGenreSnapshots(existing);
 return sanitizeGenreSnapshots([{id:`${now}-${current.length+1}`,label:safeLabel,createdAt:now,memory:sanitizeGenreMemory(memory)},...current]);
}
export function restoreGenreSnapshot(snapshot:GenreSnapshot):GenreMemory {
 const safe=sanitizeGenreSnapshots([snapshot]);
 if(safe.length!==1)throw new Error("Ungültige Sicherung.");
 return sanitizeGenreMemory(safe[0].memory);
}
export function loadGenreSnapshots():GenreSnapshot[]{
 try{if(typeof window==="undefined")return [];return sanitizeGenreSnapshots(JSON.parse(localStorage.getItem(GENRE_SNAPSHOT_KEY)||"[]"));}catch{return [];}
}
export function saveGenreSnapshots(snapshots:GenreSnapshot[]):boolean{
 try{localStorage.setItem(GENRE_SNAPSHOT_KEY,JSON.stringify(sanitizeGenreSnapshots(snapshots)));return true;}catch{return false;}
}
