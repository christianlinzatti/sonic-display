import {isMusicGenre,MUSIC_GENRES,musicGenreFamily,type MusicGenre} from '../config/musicGenres';
import type {ConcertLookV676,LookLibraryV676,LookPatchV676} from './concert-look-designer-v676';

/** Auto-Look is opt-in and song-scoped. A manual correction counts as explicit evidence;
 * automatically detected genres require evidence linked to this track and >= 40 confidence. */
export type AutoGenreEvidenceV677={trackId:string;detectedForTrackId:string|null;genre:string|null;source:'manual'|'artist'|'track'|null;confidence:number;status:string};
export type AutoLookMatchV677={look:ConcertLookV676;match:'exact'|'family'|'universal';mood:string;genre:MusicGenre};
export function trustedAutoGenreV677(evidence:AutoGenreEvidenceV677):MusicGenre|null{
 if(!evidence.trackId||!evidence.genre||!isMusicGenre(evidence.genre))return null;
 if(evidence.source==='manual')return evidence.genre;
 if(evidence.detectedForTrackId!==evidence.trackId||evidence.status!=='detected'||!Number.isFinite(evidence.confidence)||evidence.confidence<40)return null;
 return evidence.genre;
}
/** Stable song-hash gives variation between stored looks without random per-render changes. */
export function lookIndexV677(trackId:string,length:number):number{
 if(!Number.isInteger(length)||length<=0)return 0;
 let hash=2166136261;
 for(let i=0;i<trackId.length;i++){hash=Math.imul(hash^trackId.charCodeAt(i),16777619);}
 return (hash>>>0)%length;
}
export function selectAutoConcertLookV677(library:LookLibraryV676,genre:MusicGenre|null,trackId:string):AutoLookMatchV677|null{
 if(!genre||!isMusicGenre(genre)||!trackId||!Array.isArray(library.looks))return null;
 const exact=library.looks.filter(item=>item.genre===genre);
 const family=musicGenreFamily(genre);
 const related=library.looks.filter(item=>item.genre!=='all'&&item.genre!==genre&&isMusicGenre(item.genre)&&musicGenreFamily(item.genre)===family);
 const universal=library.looks.filter(item=>item.genre==='all');
 const pool=exact.length?exact:related.length?related:universal;
 if(!pool.length)return null;
 const match:AutoLookMatchV677['match']=exact.length?'exact':related.length?'family':'universal';
 const mood:Record<string,string>={hardtekk:'Festival-Energie',hardstyle:'Kraftvoll',hiphop:'Rap-Groove',rock:'Live-Arena',techno:'Club-Puls',pop:'Pop-Glanz',ambient:'Sanfte Atmosphäre'};
 return {look:pool[lookIndexV677(trackId,pool.length)],match,mood:mood[family]||'Genre-Look',genre};
}
/** Guard ensures an automatic switch never overrides an intervening manual change. */
export function safeToContinueAutoLookV677(current:LookPatchV676,applied:LookPatchV676):boolean{
 return (Object.keys(applied) as (keyof LookPatchV676)[]).every(key=>current[key]===applied[key]);
}
export function matchLabelV677(match:AutoLookMatchV677['match']):string{
 return match==='exact'?'Genregenau':match==='family'?'Verwandtes Genre':'Universal-Look';
}
export function genreLabelV677(genre:MusicGenre):string{return MUSIC_GENRES[genre].label;}
