import type { MusicGenre } from "@/types/animation";
import { emptyGenreMemory, normalizeArtist, sanitizeGenreMemory, type GenreCorrection, type GenreMemory } from "./genreCorrectionMemory";

export const GENRE_MEMORY_EXPORT_FORMAT = "sonic-display.genre-corrections.v1";
export type GenreMemoryExport = {format:typeof GENRE_MEMORY_EXPORT_FORMAT;exportedAt:string;data:GenreMemory};
export type GenreMemoryImportPreview = {incoming:GenreMemory;newCount:number;conflicts:number;unchanged:number};
const GENRES:MusicGenre[]=["hardstyle","hardtekk","techno","hiphop","rock","ambient","pop"];
export function filterGenreCorrections(memory:GenreMemory,search="",genre:MusicGenre|"all"="all"):GenreCorrection[]{
 const term=search.trim().toLocaleLowerCase();
 return memory.corrections.filter(c=>(genre==="all"||c.genre===genre)&&(!term||c.artist.toLocaleLowerCase().includes(term)||c.trackId.toLocaleLowerCase().includes(term)));
}
export function summarizeGenreCorrections(memory:GenreMemory){
 const counts=Object.fromEntries(GENRES.map(g=>[g,0])) as Record<MusicGenre,number>;
 const artists=new Set<string>();
 for(const entry of memory.corrections){counts[entry.genre]++;if(entry.artist)artists.add(normalizeArtist(entry.artist));}
 return {total:memory.corrections.length,artists:artists.size,counts};
}
export function updateSelectedGenre(memory:GenreMemory,trackIds:readonly string[],genre:MusicGenre,now=Date.now()):GenreMemory{
 if(!GENRES.includes(genre))return memory;
 const selected=new Set(trackIds);
 return sanitizeGenreMemory({version:1,corrections:memory.corrections.map(entry=>selected.has(entry.trackId)?{...entry,genre,updatedAt:now}:entry)});
}
export function removeSelectedCorrections(memory:GenreMemory,trackIds:readonly string[]):GenreMemory{
 const selected=new Set(trackIds);
 return sanitizeGenreMemory({version:1,corrections:memory.corrections.filter(entry=>!selected.has(entry.trackId))});
}
export function exportGenreMemory(memory:GenreMemory):string{
 const payload:GenreMemoryExport={format:GENRE_MEMORY_EXPORT_FORMAT,exportedAt:new Date().toISOString(),data:sanitizeGenreMemory(memory)};
 return JSON.stringify(payload,null,2);
}
export function previewGenreMemoryImport(raw:string,current:GenreMemory):GenreMemoryImportPreview{
 if(raw.length>1024*1024)throw new Error("Importdatei ist zu groß (max. 1 MB).");
 let parsed:unknown;
 try{parsed=JSON.parse(raw);}catch{throw new Error("Ungültige JSON-Datei.");}
 if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("Ungültiges Importformat.");
 const value=parsed as Partial<GenreMemoryExport>;
 if(value.format!==GENRE_MEMORY_EXPORT_FORMAT||!value.data||!Array.isArray(value.data.corrections)||value.data.version!==1)throw new Error("Kein kompatibler Sonic-Display-Genre-Export.");
 // Reject partial/malformed imports instead of silently dropping entries.
 if(value.data.corrections.length>250)throw new Error("Import enthält mehr als 250 Korrekturen.");
 const incoming=sanitizeGenreMemory(value.data);
 if(incoming.corrections.length!==value.data.corrections.length)throw new Error("Import enthält ungültige oder doppelte Korrekturen.");
 const existing=new Map(current.corrections.map(c=>[c.trackId,c]));
 let newCount=0,conflicts=0,unchanged=0;
 for(const entry of incoming.corrections){const prior=existing.get(entry.trackId);if(!prior)newCount++;else if(prior.genre!==entry.genre||prior.artist!==entry.artist)conflicts++;else unchanged++;}
 return {incoming,newCount,conflicts,unchanged};
}
export function mergeGenreMemory(current:GenreMemory,incoming:GenreMemory,overwrite=false):GenreMemory{
 const existing=new Map(current.corrections.map(c=>[c.trackId,c]));
 for(const entry of sanitizeGenreMemory(incoming).corrections){if(overwrite||!existing.has(entry.trackId))existing.set(entry.trackId,entry);}
 return sanitizeGenreMemory({version:1,corrections:[...existing.values()]});
}
export { emptyGenreMemory };
