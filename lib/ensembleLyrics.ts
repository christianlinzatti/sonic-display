import type {Lyrics} from '../types/playbackCore';
import {concertLyricIdentity} from './concertLyricIdentity';
export function ensembleLyrics(lyrics:Lyrics|null|undefined,position:number,seed:string,enabled:boolean,playing:boolean,reduced:boolean){
 const identity=concertLyricIdentity(lyrics,position,seed);
 if(!enabled||identity.mode==='none')return {effect:'off'};
 if(identity.mode==='rap')return {effect:'reading'};
 if(!playing||reduced)return {effect:'still'};
 const effects=identity.mode==='refrain'?['halo','ribbon','brackets','constellation']:['brackets','constellation','halo','ribbon'];
 return {effect:effects[(identity.pattern+Math.max(0,identity.visit-1))%4]};
}
