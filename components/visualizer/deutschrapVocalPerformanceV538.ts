/**
 * V538 – Word-evidence Deutschrap vocal expression for GLB and procedural dancers.
 * Text timing is NOT a phoneme or voice-recognition signal. This module ONLY
 * refines existing additive cues, never edits GLB clips, IK or authored timelines.
 * Singer assignments, audio-derived mouth data and manual keyframes win.
 */
import type {Lyrics} from '@/types/music';
import type {FacialPoseV369} from './facialPerformanceV369';
import {rapLipWordAtV415} from './rapLipPrecisionV415';
import type {VocalDanceAccentV472,AuthoredVocalCastV472} from './vocalAwareChoreographyV472';

const limit=(n:number,lo=0,hi=1)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const ease=(n:number)=>{const x=limit(n);return x*x*(3-2*x);};
const clean=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const wordEvidence=(lyrics:Lyrics|null|undefined,timeMs:number,word:string|null|undefined)=>{
  if(!word?.trim()||!lyrics?.synced||!Number.isFinite(timeMs)||timeMs<0)return null;
  const mark=rapLipWordAtV415(lyrics,timeMs);
  return mark&&clean(mark.word.text)===clean(word)?mark:null;
};

export interface DeutschrapFaceOptionsV538 {
  lyrics:Lyrics|null|undefined;
  effectiveTimeMs:number;activeWord?:string|null;
  playing:boolean;enabled:boolean;reducedMotion:boolean;rap:boolean;verifiedWord:boolean;
  /** Authoritative V385/V496 singer role. Not inferred from lyrics. */
  roleAllowed:boolean;manualSilent:boolean;manualPriority:boolean;
  preserveAudioMouth:boolean;editedWords?:readonly {startMs:number;text:string}[];
  intensity:number;section?:string|null;energy?:number;
}
export type DeutschrapFaceResultV538<T>={frame:T;active:boolean;source:'timed-word'|'none';
  expression:'verse'|'hook'|'none'};
/** Seek-safe, stateless; no state survives a pause or a seek. */
export function refineDeutschrapFaceV538<T extends {face:FacialPoseV369}>(
  base:T,input:DeutschrapFaceOptionsV538,
):DeutschrapFaceResultV538<T>{
  const idle:DeutschrapFaceResultV538<T>={frame:base,active:false,source:'none',expression:'none'};
  if(!input.playing||!input.enabled||input.reducedMotion||!input.rap||!input.verifiedWord||
     !input.roleAllowed||input.manualSilent||input.manualPriority||input.preserveAudioMouth||
     !Number.isFinite(input.intensity)||input.intensity<=0)return idle;
  const mark=wordEvidence(input.lyrics,input.effectiveTimeMs,input.activeWord);
  if(!mark||input.editedWords?.some(w=>w.startMs===mark.start&&clean(w.text)===clean(mark.word.text)))return idle;
  const duration=mark.end-mark.start;
  if(duration<70||duration>1250)return idle;
  const fast=duration<330||(mark.previousGap>=0&&mark.previousGap<90)||(mark.nextGap>=0&&mark.nextGap<90);
  const phase=(input.effectiveTimeMs-mark.start)/duration;
  const gate=ease(phase/Math.min(.32,75/duration))*ease((1-phase)/Math.min(.35,95/duration));
  const strength=limit(input.intensity/100);
  const hook=input.section==='hook'||input.section==='chorus'||input.section==='drop';
  // Slow phrase modulation, not invented phoneme or per-syllable timestamps.
  const phrase=.82+.18*Math.cos(input.effectiveTimeMs/2200*Math.PI*2);
  const punctuation=/[!?]$/.test(mark.word.text)?1.1:1;
  const gain=gate*strength*phrase*punctuation*(hook?1.15:1);
  if(gain<=0)return idle;
  const face={...base.face};
  const seal=limit(face.lipsClosed);
  // The existing V384/V415 B/P/M closure and authored jaw pose are authoritative.
  // A SMALL shaping hint is permitted only while the mouth is visibly open.
  if(seal<.22){
    const vowel=mark.word.text.match(/[aeiouäöü]/iu)?.[0]??'';
    const wide=/[aeiä]/iu.test(vowel)?1:0;
    const round=/[oöuü]/iu.test(vowel)?1:0;
    const articulation=limit((1-seal*4)*gain);
    face.jaw=limit(Math.min(1-seal*.985,face.jaw+(fast?.011:.007)*articulation));
    face.wide=limit(face.wide+wide*.014*articulation*(1-face.round*.3));
    face.round=limit(face.round+round*.014*articulation);
  }
  // Expression is restrained and does not override blink, smile or singer eye gaze.
  const expression=limit(input.energy??.5)*.25+.75;
  face.cheek=limit(face.cheek+.013*gain*expression);
  face.brow=limit(face.brow+.009*gain*expression);
  face.squint=limit(face.squint+.006*gain*expression);
  return {frame:{...base,face},active:true,source:'timed-word',expression:hook?'hook':'verse'};
}

export interface DeutschrapGestureOptionsV538 {
  lyrics:Lyrics|null|undefined;effectiveTimeMs:number;playing:boolean;rap:boolean;
  reducedMotion:boolean;authored:boolean;bodyEnabled:boolean;gesturesEnabled:boolean;
  trackId?:string|null;slot:number;count:number;casting?:AuthoredVocalCastV472|null;
  section?:string|null;
}
/** Only scales a pre-existing V472/V516/V526 word cue, preserving its role and direction. */
export function refineDeutschrapGestureV538(base:VocalDanceAccentV472,input:DeutschrapGestureOptionsV538):VocalDanceAccentV472 {
  if(!base.active||base.source!=='word'||base.confidence!=='lyrics-word'||base.role==='background'||
    !input.playing||!input.rap||input.reducedMotion||input.authored||!input.bodyEnabled||!input.gesturesEnabled||
    !input.trackId||input.section==='break'||!Number.isInteger(input.slot)||!Number.isInteger(input.count)||
    input.slot<0||input.count<1||input.count>4||input.slot>=input.count)return base;
  // Without written casting evidence, multi-avatar lyrics must not imply a specific singer.
  if(input.count>1&&!(input.casting?.active&&input.casting.lineIndex===base.lineIndex&&
    input.casting.singingSlots.includes(input.slot)))return base;
  const line=input.lyrics?.lines[base.lineIndex];
  const token=line?.words?.[base.wordIndex]?.text;
  const mark=wordEvidence(input.lyrics,input.effectiveTimeMs,token);
  if(!mark||mark.end-mark.start<70)return base;
  const dur=mark.end-mark.start;
  const fast=dur<270;
  const phase=(input.effectiveTimeMs-mark.start)/dur;
  const gate=ease(phase/.25)*ease((1-phase)/.3);
  const slowPhrase=.5+.5*Math.sin(input.effectiveTimeMs/2300*Math.PI*2+input.slot*.3);
  const hook=input.section==='hook'||input.section==='chorus'||input.section==='drop';
  // Dense verses should flow: no abrupt arm jab on every quick word.
  const swing=1+(hook?.095:.048)*slowPhrase*gate;
  const arms=limit(base.arms*(fast?.94:swing),0,.11);
  const chest=limit(base.chest*(1+.045*slowPhrase*gate),0,.09);
  const head=limit(base.head*(1+.035*slowPhrase*gate),0,.055);
  return {...base,arms,chest,head};
}
