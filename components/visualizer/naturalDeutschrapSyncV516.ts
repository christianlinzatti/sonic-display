/**
 * V516 – evidence-based Deutschrap/rap phrasing shared by GLB and procedural
 * performers. Respects authored singer slots, existing lyric clocks, authored
 * motions and mouth/phoneme tracks. All outputs are small additive cue changes.
 */
import type {VocalDanceAccentV472, AuthoredVocalCastV472} from './vocalAwareChoreographyV472';
import type {RapExpressionV510} from './expressiveRapPerformanceV510';
import type {Lyrics} from '@/types/music';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

type Word={text:string;startMs:number;endMs?:number|null};
type Line={startMs:number;endMs?:number|null;words?:readonly Word[]};
export type DeutschrapLyricsV516={synced:boolean;lines:readonly Line[]};
export type DeutschrapTimingV516={
  lyrics?:DeutschrapLyricsV516|null;progressMs:number;offsetMs?:number;
  trackId?:string|null;slot:number;count:number;playing:boolean;reducedMotion:boolean;
  rap:boolean;authored:boolean;section?:string|null;
  casting?:AuthoredVocalCastV472|null;
};
export type RapPhraseAnalysisV516={
  evidence:'word-timestamps';wordDurationMs:number;density:'fast'|'regular'|'relaxed';
  cadence:number;phrasePhase:number;startMs:number;endMs:number;
};
const limit=(n:number,a:number,b:number)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
const round=(n:number)=>Math.round(n*100000)/100000;
/** No syllable, voice, rhyme, stress or BPM detection: only confirmed word times. */
export function analyzeRapPhraseV516(lyrics:DeutschrapLyricsV516|null|undefined,lineIndex:number,wordIndex:number,clockMs:number):RapPhraseAnalysisV516|null {
  if(!lyrics?.synced||!Number.isFinite(clockMs)||clockMs<0||!Number.isInteger(lineIndex)||lineIndex<0||lineIndex>=lyrics.lines.length||!Number.isInteger(wordIndex)||wordIndex<0)return null;
  const line=lyrics.lines[lineIndex],words=line.words??[];
  if(wordIndex>=Math.min(words.length,120)||!Number.isFinite(line.startMs))return null;
  const word=words[wordIndex];if(!word||!word.text?.trim()||!Number.isFinite(word.startMs)||word.startMs<line.startMs)return null;
  const next=words[wordIndex+1],prev=words[wordIndex-1];
  const nextStart=next&&Number.isFinite(next.startMs)&&next.startMs>word.startMs?next.startMs:Infinity;
  const lineLimit=Math.min(line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,lyrics.lines[lineIndex+1]?.startMs??Infinity,line.startMs+15000);
  const end=Math.min(word.endMs!=null&&Number.isFinite(word.endMs)&&word.endMs>word.startMs?word.endMs:Infinity,nextStart,lineLimit,word.startMs+1600);
  if(end<=word.startMs||clockMs<word.startMs||clockMs>=end)return null;
  // Starts and gaps are genuine timestamp evidence; do not invent rap syllables.
  const previousSpacing=prev&&Number.isFinite(prev.startMs)&&prev.startMs<word.startMs?word.startMs-prev.startMs:Infinity;
  const nextSpacing=Number.isFinite(nextStart)?nextStart-word.startMs:Infinity;
  const spacing=Math.min(previousSpacing,nextSpacing);
  const duration=end-word.startMs;
  const density=spacing<250||duration<220?'fast':spacing>=530&&duration>=360?'relaxed':'regular';
  // Word attack/release are bounded; phrase phase changes over ~2 seconds, not every syllable.
  const attack=limit((clockMs-word.startMs)/Math.min(80,duration*.30),0,1);
  const release=limit((end-clockMs)/Math.min(95,duration*.30),0,1);
  const cadence=(attack*attack*(3-2*attack))*(release*release*(3-2*release));
  const phrasePhase=(clockMs-line.startMs)/2100*Math.PI*2;
  return {evidence:'word-timestamps',wordDurationMs:duration,density,cadence,phrasePhase,startMs:word.startMs,endMs:end};
}
/** Slightly calm automatic, extra GLB/procedural gestures in rapid Deutschrap. */
export function synchronizeRapAccentV516(base:VocalDanceAccentV472,input:DeutschrapTimingV516):VocalDanceAccentV472 {
  if(!base.active||base.source!=='word'||base.confidence!=='lyrics-word'||base.role==='background'||!input.rap||!input.playing||input.reducedMotion||input.authored||!input.trackId||
    !Number.isInteger(input.slot)||input.slot<0||input.slot>3||!Number.isInteger(input.count)||input.count<1||input.count>4||input.slot>=input.count||
    input.section==='break'||!Number.isFinite(input.progressMs)||input.progressMs<0)return base;
  // In features, never promote unassigned lyrical words into recognised singers.
  if(input.count>1&&!(input.casting?.active&&input.casting.lineIndex===base.lineIndex&&input.casting.singingSlots.includes(input.slot)))return base;
  const now=input.progressMs+limit(input.offsetMs??0,-2000,2000);
  const word=analyzeRapPhraseV516(input.lyrics,base.lineIndex,base.wordIndex,now);
  if(!word)return base;
  const flowing=(1+Math.sin(word.phrasePhase+input.slot*.17)*.06);
  const fast=word.density==='fast';
  const hook=input.section==='hook'||input.section==='chorus'||input.section==='drop';
  const endOfPhrase=input.lyrics?.lines[base.lineIndex]?.words?.length===base.wordIndex+1;
  // Flow continuity outweighs accents on each dense word. No invented rhyme markers.
  const arms=round(limit(base.arms*(fast?.62:.92)*(hook?1.06:1)*(.80+.20*word.cadence),0,.11));
  const head=round(limit(base.head*(fast?.86:1.04)*flowing,0,.055));
  const chest=round(limit(base.chest*(fast?.92:1.035)*flowing*(endOfPhrase?1.04:1),0,.09));
  return {...base,head,chest,arms};
}
/** Keep V510's evidence, role, body/face priority and lip-safety unchanged. */
export function synchronizeRapExpressionV516(base:RapExpressionV510,input:{
 lyrics:Lyrics|null|undefined;effectiveTimeMs:number;section?:string|null;
}):RapExpressionV510 {
  if(!base.active||base.evidence!=='timed-word')return base;
  // Same authenticated V415 word clock that V510 uses, not a second mouth clock.
  const mark=rapLipWordAtV415(input.lyrics??null,input.effectiveTimeMs);
  if(!mark)return base;
  const rapid=mark.end-mark.start<260||mark.previousGap<75||mark.nextGap<75;
  const wave=1+Math.sin(input.effectiveTimeMs/2150*Math.PI*2)*.045;
  const phraseEnd=mark.next===null;
  return {...base,
    headPitch:round(limit(base.headPitch*wave,-.018,.018)),
    headTilt:round(limit(base.headTilt*wave,-.012,.012)),
    chestLean:round(limit(base.chestLean*(phraseEnd?1.045:wave),-.012,.012)),
    leftArm:round(limit(base.leftArm*(rapid?.64:.95),-.020,.020)),
    rightArm:round(limit(base.rightArm*(rapid?.64:.95),-.020,.020)),
    // Emotion follows longer phrases; face, lips and jaw channels remain in V510/V415.
    brow:round(limit(base.brow*(rapid?.92:1),0,.038)),
    cheek:round(limit(base.cheek*(rapid?.92:1),0,.027)),
    squint:round(limit(base.squint*(rapid?.92:1),0,.013))};
}
