/** V567 – one verified lyric-word timeline for restrained concert accents.
 * Existing media time, manual vocalist ownership, visemes, jaw/lip seals, song
 * playback and karaoke fill remain authoritative. NO voice/phoneme recognition.
 */
import type {Lyrics} from '@/types/music';
import {rapLipWordAtV415} from './rapLipPrecisionV415';
import type {DeutschrapLipFrameV523} from './advancedDeutschrapLipSyncV523';
import type {VocalDanceAccentV472,AuthoredVocalCastV472} from './vocalAwareChoreographyV472';

export type WordConcertCueV567={
  quality:'none'|'paused'|'line'|'word';lineIndex:number;wordIndex:number;
  startMs:number;endMs:number;progress:number;accent:number;word:string|null;
};
const clamp=(n:number,min=0,max=1)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const NONE:WordConcertCueV567=Object.freeze({quality:'none',lineIndex:-1,wordIndex:-1,startMs:-1,endMs:-1,progress:0,accent:0,word:null});
const PAUSED:WordConcertCueV567=Object.freeze({...NONE,quality:'paused'});
const isInstrumental=(t:string)=>!/[a-zäöüß]/iu.test(t)||/^\s*(?:\[[^\]]+\]|\((?:instrumental|music|musik|pause|intro|outro)[^)]*\))\s*$/iu.test(t);

/** Each channel samples the *same* trusted provider word marks using its
 * existing presentation clock. Visual-only offsets may be intentionally
 * different from karaoke: this function never changes those user offsets. */
export function sampleWordConcertV567(args:{lyrics?:Lyrics|null;timeMs:number;playing:boolean;reducedMotion:boolean}):WordConcertCueV567{
  const {lyrics,timeMs,playing,reducedMotion}=args;
  if(!playing||reducedMotion)return PAUSED;
  if(!lyrics?.synced||!Array.isArray(lyrics.lines)||!Number.isFinite(timeMs)||timeMs<0)return NONE;
  let lineIndex=-1;
  for(let i=0;i<lyrics.lines.length;i++){
    if(!Number.isFinite(lyrics.lines[i].startMs))return NONE;
    if(lyrics.lines[i].startMs<=timeMs)lineIndex=i;else break;
  }
  if(lineIndex<0)return NONE;
  const line=lyrics.lines[lineIndex];
  if(isInstrumental(line.text??''))return NONE;
  const end=Math.min(line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,
    lyrics.lines[lineIndex+1]?.startMs??Infinity,line.startMs+12000);
  if(timeMs>=end||end<=line.startMs)return NONE;
  const fallback:WordConcertCueV567={quality:'line',lineIndex,wordIndex:-1,startMs:line.startMs,endMs:end,
    progress:clamp((timeMs-line.startMs)/(end-line.startMs)),accent:0,word:null};
  const mark=rapLipWordAtV415(lyrics,timeMs);
  if(!mark||!Array.isArray(line.words))return fallback;
  const wordIndex=line.words.indexOf(mark.word);
  if(wordIndex<0||mark.start<line.startMs||mark.start>=end||mark.end>end||mark.end<=mark.start||
    (mark.word.endMs!=null&&mark.word.endMs>end))return fallback;
  const duration=mark.end-mark.start;
  // Very short/noisy or implausibly long word marks must not animate bodies.
  if(duration<55||duration>1800)return fallback;
  const elapsed=timeMs-mark.start;
  const fadeIn=smooth(elapsed/Math.min(90,duration*.35));
  const fadeOut=smooth((duration-elapsed)/Math.min(120,duration*.35));
  return {quality:'word',lineIndex,wordIndex,startMs:mark.start,endMs:mark.end,
    progress:clamp(elapsed/duration),accent:clamp(fadeIn*fadeOut),word:mark.word.text};
}

/** Facial overlay only: lower lip, jaw, vowels and authored V420/V423 edits are
 * never touched; the preceding V523/V526 pipeline owns these channels. */
export function coordinateWordFaceV567(base:DeutschrapLipFrameV523,cue:WordConcertCueV567,args:{manualPriority:boolean;roleAllowed:boolean}):DeutschrapLipFrameV523{
  if(!base.activeV523||cue.quality!=='word'||!cue.accent||args.manualPriority||!args.roleAllowed)return base;
  const weight=cue.accent*.0035;
  return {...base,face:{...base.face,cheek:clamp(base.face.cheek+weight),brow:clamp(base.face.brow+weight*.65)}};
}

/** Add NO new animation channel or per-word nod. Smooth existing V564 body
 * targets at real word boundaries, respecting both track and authored cast. */
export function coordinateWordDanceV567(base:VocalDanceAccentV472,cue:WordConcertCueV567,args:{
 trackId?:string|null;slot:number;count:number;authored:boolean;casting?:AuthoredVocalCastV472|null;
}):VocalDanceAccentV472{
  if(cue.quality!=='word'||base.source!=='word'||base.confidence!=='lyrics-word'||!base.active||
     base.lineIndex!==cue.lineIndex||base.wordIndex!==cue.wordIndex||base.role==='background'||
     !args.trackId?.trim()||args.authored||!Number.isInteger(args.slot)||!Number.isInteger(args.count)||
     args.count<1||args.count>4||args.slot<0||args.slot>=args.count)return base;
  if(args.count>1&&!(args.casting?.active&&args.casting.lineIndex===cue.lineIndex&&
    args.casting.singingSlots.includes(args.slot)))return base;
  // Only attenuate transient discontinuity; legacy amplitude is the upper limit.
  const gain=.87+.13*cue.accent;
  return {...base,arms:base.arms*gain,head:base.head*(.94+.06*cue.accent),
    chest:base.chest*(.96+.04*cue.accent)};
}

/** A verified word may add a *tiny* appearance accent to 3D karaoke, but
 * NEVER changes the text, fill amount, timing, position or readable opacity. */
export function wordKaraokeAccentV567(cue:WordConcertCueV567,args:{lineIndex:number;wordIndex:number;enabled:boolean;highTier:boolean}){
  if(!args.enabled||!args.highTier||cue.quality!=='word'||
     cue.lineIndex!==args.lineIndex||cue.wordIndex!==args.wordIndex)return {scale:0,outline:0};
  return {scale:cue.accent*.0035,outline:cue.accent*.0012};
}
