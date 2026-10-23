import type { MusicGenre } from "@/types/animation";
import type { Track } from "@/types/music";

export const GENRE_MEMORY_KEY = "sonic-display:v181:genre-corrections";
export type GenreCorrection = {trackId:string;artist:string;genre:MusicGenre;updatedAt:number};
export type GenreMemory = {version:1;corrections:GenreCorrection[]};
const GENRES: MusicGenre[] = ["hardstyle","hardtekk","techno","hiphop","rock","ambient","pop"];
export const emptyGenreMemory=():GenreMemory=>({version:1,corrections:[]});
export const normalizeArtist=(artist:string)=>artist.trim().normalize("NFKC").toLocaleLowerCase("en");
export function sanitizeGenreMemory(raw:unknown):GenreMemory {
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return emptyGenreMemory();
 const data=raw as Partial<GenreMemory>;
 if(data.version!==1||!Array.isArray(data.corrections))return emptyGenreMemory();
 const valid=data.corrections.filter((entry):entry is GenreCorrection=>{
   if(!entry||typeof entry!=="object")return false;
   return typeof entry.trackId==="string"&&entry.trackId.length>0&&entry.trackId.length<=200&&typeof entry.artist==="string"&&entry.artist.length<=250&&GENRES.includes(entry.genre)&&Number.isFinite(entry.updatedAt);
 });
 const seen=new Set<string>();
 return {version:1,corrections:valid.sort((a,b)=>b.updatedAt-a.updatedAt).filter(entry=>{if(seen.has(entry.trackId))return false;seen.add(entry.trackId);return true;}).slice(0,250)};
}
export function readGenreMemory():GenreMemory {
 try{if(typeof window==="undefined")return emptyGenreMemory();return sanitizeGenreMemory(JSON.parse(window.localStorage.getItem(GENRE_MEMORY_KEY)||"null"));}catch{return emptyGenreMemory();}
}
export function writeGenreMemory(memory:GenreMemory):boolean {
 try{window.localStorage.setItem(GENRE_MEMORY_KEY,JSON.stringify(sanitizeGenreMemory(memory)));return true;}catch{return false;}
}
export function saveTrackCorrection(memory:GenreMemory,track:Track,genre:MusicGenre,now=Date.now()):GenreMemory {
 return sanitizeGenreMemory({version:1,corrections:[{trackId:track.id,artist:normalizeArtist(track.artist),genre,updatedAt:now},...memory.corrections.filter(c=>c.trackId!==track.id)]});
}
export function deleteTrackCorrection(memory:GenreMemory,trackId:string):GenreMemory {
 return {...memory,corrections:memory.corrections.filter(c=>c.trackId!==trackId)};
}
export function recommendArtistGenre(memory:GenreMemory,track:Track):{genre:MusicGenre;votes:number;total:number}|null {
 const key=normalizeArtist(track.artist);
 if(!key)return null;
 const related=memory.corrections.filter(c=>c.artist===key&&c.trackId!==track.id);
 if(related.length<2)return null;
 const counts=new Map<MusicGenre,number>();for(const c of related)counts.set(c.genre,(counts.get(c.genre)||0)+1);
 const ranked=[...counts].sort((a,b)=>b[1]-a[1]);
 if(!ranked.length||ranked[0][1]<2||ranked[0][1]/related.length<0.75)return null;
 return {genre:ranked[0][0],votes:ranked[0][1],total:related.length};
}
