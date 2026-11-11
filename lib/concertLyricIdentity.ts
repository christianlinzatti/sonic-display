import type {Lyrics} from '../types/playbackCore';
import {lyricSpotlightV1133} from './lyricSpotlightV1133';
import {concertRefrainVisit} from './concertLyricTimeline';
export type ConcertLyricIdentity={mode:'none'|'verse'|'refrain'|'rap';pattern:number;visit:number};
/** Repeated words keep a visual signature; no new word timings or semantic labels. */
export function concertLyricIdentity(lyrics:Lyrics|null|undefined,positionMs:number,seed:string):ConcertLyricIdentity{
 const spot=lyricSpotlightV1133(lyrics,positionMs);
 if(spot.lineIndex<0)return {mode:'none',pattern:0,visit:0};
 const mode=spot.mode==='rap'?'rap':spot.mode==='anthem'?'refrain':'verse';
 const text=lyrics!.lines[spot.lineIndex].text.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 let pattern=2166136261;for(const c of seed+text)pattern=Math.imul(pattern^c.charCodeAt(0),16777619)>>>0;
 return {mode,pattern:pattern%4,visit:concertRefrainVisit(lyrics,positionMs)};
}
