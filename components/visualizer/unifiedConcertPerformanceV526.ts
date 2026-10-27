/** V526 – Unified Concert Performance Director.
 * ONE existing verified word clock connects (a) conservative facial expression,
 * (b) additive rap gestures and (c) lyric motion attenuation. This planner does
 * not invent performers, beat/phoneme timestamps, camera or spatial geometry.
 * Never touches mouth seals/jaw/visemes, karaoke fill, authored clips or IK.
 */
import type {Lyrics} from '@/types/music';
import {rapLipWordAtV415} from './rapLipPrecisionV415';
import type {DeutschrapLipFrameV523} from './advancedDeutschrapLipSyncV523';
import type {VocalDanceAccentV472,AuthoredVocalCastV472} from './vocalAwareChoreographyV472';
import type {CinematicLyricsExperienceV525} from './cinematicLyricsExperienceV525';

const clamp=(n:number,low:number,high:number)=>Number.isFinite(n)?Math.min(high,Math.max(low,n)):low;
const smooth=(n:number)=>{const s=clamp(n,0,1);return s*s*(3-2*s);};
const rapGenre=(genre?:string|null)=>/(?:deutsch[ -]?rap|hip[ -]?hop|\brap\b|trap|drill)/i.test(genre??'');
export interface UnifiedWordCueV526 {
  verified:boolean;rapid:boolean;pulse:number;phrase:number;wordStartMs:number;wordEndMs:number;
}
const OFF:UnifiedWordCueV526=Object.freeze({verified:false,rapid:false,pulse:0,phrase:0,wordStartMs:-1,wordEndMs:-1});
/** No new clock: V415's own validated, current word is the sole source. */
export function sampleUnifiedWordV526(args:{lyrics?:Lyrics|null;effectiveTimeMs:number;genre?:string|null;
 playing:boolean;reducedMotion:boolean}):UnifiedWordCueV526 {
  if(!args.playing||args.reducedMotion||!rapGenre(args.genre)||!Number.isFinite(args.effectiveTimeMs))return OFF;
  const mark=rapLipWordAtV415(args.lyrics??null,args.effectiveTimeMs);
  if(!mark)return OFF;
  const duration=mark.end-mark.start;
  if(duration<50||duration>1800)return OFF;
  const elapsed=args.effectiveTimeMs-mark.start;
  const pulse=smooth(elapsed/Math.min(85,duration*.35))*smooth((duration-elapsed)/Math.min(120,duration*.35));
  // Phrase modulation is deliberately slow (~1.8s), not a second per-syllable nod.
  const phrase=.5+.5*Math.sin(args.effectiveTimeMs/1800*Math.PI*2);
  const rapid=duration<265||(mark.nextGap>=0&&mark.nextGap<=90)||(mark.previousGap>=0&&mark.previousGap<=90);
  return {verified:true,rapid,pulse:clamp(pulse,0,1),phrase:clamp(phrase,0,1),wordStartMs:mark.start,wordEndMs:mark.end};
}
/** V523 has already verified the vocalist and given V384/V415/audio/manual
 * priority. Only tiny cheeks/brows are added; mouth channels stay bit-identical. */
export function coordinateRapFaceV526(base:DeutschrapLipFrameV523,args:{lyrics?:Lyrics|null;effectiveTimeMs:number;
 genre?:string|null;playing:boolean;reducedMotion:boolean;manualPriority?:boolean}):DeutschrapLipFrameV523 {
  if(!base.activeV523||args.manualPriority)return base;
  const cue=sampleUnifiedWordV526(args);
  if(!cue.verified||!cue.rapid)return base;
  const micro=cue.pulse*(.002+.002*cue.phrase);
  return {...base,face:{...base.face,cheek:clamp(base.face.cheek+micro,0,1),
    brow:clamp(base.face.brow+micro*.65,0,1)}};
}
/** V516 role evidence is mandatory for a multi-avatar show. All values are
 * micro multipliers of an existing V472/V516 accent, never independent motions. */
export function coordinateRapDanceV526(base:VocalDanceAccentV472,args:{lyrics?:Lyrics|null;
 effectiveTimeMs:number;genre?:string|null;trackId?:string|null;slot:number;count:number;
 playing:boolean;reducedMotion:boolean;authored:boolean;casting?:AuthoredVocalCastV472|null;
}):VocalDanceAccentV472 {
  if(!base.active||base.source!=='word'||base.confidence!=='lyrics-word'||base.role==='background'||
     !args.trackId?.trim()||args.authored||!Number.isInteger(args.count)||args.count<1||args.count>4||
     !Number.isInteger(args.slot)||args.slot<0||args.slot>=args.count)return base;
  if(args.count>1&&!(args.casting?.active&&args.casting.lineIndex===base.lineIndex&&
     args.casting.singingSlots.includes(args.slot)))return base;
  const cue=sampleUnifiedWordV526(args);
  if(!cue.verified||!cue.rapid)return base;
  const slow=1+cue.phrase*.035;
  // Reduces per-word arms while preserving facial/gesture phrase continuity.
  return {...base,arms:clamp(base.arms*(.88+.07*cue.pulse),0,.11),
    head:clamp(base.head*slow,0,.055),chest:clamp(base.chest*slow,0,.09)};
}
/** All lyrics stay exactly where the layout/user placed them. Synchronized
 * highlights / fill / word timing never change – only visual motion is calmer. */
export function coordinateConcertLyricsV526(base:CinematicLyricsExperienceV525,args:{
 lyrics?:Lyrics|null;effectiveTimeMs:number;genre?:string|null;playing:boolean;
 reducedMotion:boolean;active:boolean;}):CinematicLyricsExperienceV525 {
  if(!args.active)return base;
  const cue=sampleUnifiedWordV526(args);
  if(!cue.verified||!cue.rapid||base.wordMotionGain<=0)return base;
  return {...base,wordMotionGain:clamp(base.wordMotionGain*(.83+.08*cue.phrase),0,base.wordMotionGain)};
}
