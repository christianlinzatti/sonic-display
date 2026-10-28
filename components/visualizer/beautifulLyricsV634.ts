import type { LyricLine } from '@/types/music';
import { verifiedLyricWordsV477 } from './beautifulLyricsV477';

/** V634: typography and decorative karaoke emphasis only. The existing V477/V541/V549
 * playback fill, provider text, stage/camera protection, user font and lyric position
 * remain authoritative. No audio inference or newly fabricated word timestamps. */
export type BeautifulLyricMoodV634 = 'quiet' | 'flow' | 'rapid' | 'ensemble';
export interface BeautifulLyricsV634 {
  active: boolean;
  mood: BeautifulLyricMoodV634;
  verifiedWords: boolean;
  dense: boolean;
  crowded: boolean;
  widthCh: number;
  lineHeight: number;
  plateOpacity: number;
  wordGlow: number;
  wordTransitionMs: number;
  max3DWidth: number;
  /** Extra outline emphasis only for the active, verified word, never karaoke fill. */
  outlineBoost: number;
}
const finite = (x: number): boolean => Number.isFinite(x);
const clamp = (x: number, lo: number, hi: number): number => finite(x) ? Math.max(lo, Math.min(hi, x)) : lo;
const ease = (x: number): number => { const n=clamp(x,0,1); return n*n*(3-2*n); };

export function planBeautifulLyricsV634(input: {
  line?: LyricLine | null;
  nextLineStart?: number;
  progressMs: number;
  synchronized: boolean;
  playing: boolean;
  reducedMotion: boolean;
  immersive: boolean;
  avatarCount: number;
  wordHighlight: boolean;
  /** This is a real, explicitly assigned vocal scene, never guessed from text. */
  vocalSceneActive?: boolean;
  existingWidthCh?: number;
  existingPlateOpacity?: number;
  existing3DWidth?: number;
  intensity?: number;
}): BeautifulLyricsV634 {
  const line = input.line;
  const text = typeof line?.text === 'string' ? line.text.trim() : '';
  const length = [...text].length;
  const longest = (text.match(/\S+/gu) ?? []).reduce((m,w)=>Math.max(m,[...w].length),0);
  const cast = Math.round(clamp(input.avatarCount,1,4));
  const crowded = input.immersive && cast>=3;
  const dense = length > (input.immersive ? 49 : 76) || longest > 24;
  const veryDense = length > (input.immersive ? 82 : 118) || longest > 34;
  const widthLimit = veryDense ? (crowded ? 33 : 40) : dense ? (crowded ? 37 : 47) : crowded ? 42 : input.immersive ? 48 : 60;
  const widthCh = Math.min(clamp(input.existingWidthCh ?? 60,22,80),widthLimit);
  // The readability plate can get darker, but must never be weakened by V634.
  const plateOpacity = clamp(Math.max(clamp(input.existingPlateOpacity ?? 0,0,1),
    input.immersive ? crowded ? .86 : .80 : veryDense ? .22 : dense ? .14 : .08,
    input.vocalSceneActive && input.immersive ? .84 : 0),0,.98);
  const lineHeight = veryDense ? 1.42 : dense ? 1.36 : 1.33;
  const max3DWidth = Math.min(clamp(input.existing3DWidth ?? 2.7,.8,3.4),
    veryDense ? 2.05 : crowded ? 2.12 : dense ? 2.3 : 2.7);
  const base: BeautifulLyricsV634 = {active:false,mood:'quiet',verifiedWords:false,dense,crowded,
    widthCh,lineHeight,plateOpacity,wordGlow:0,wordTransitionMs:0,max3DWidth,outlineBoost:0};
  if(!line || !text || !finite(line.startMs) || line.startMs<0 ||
    !finite(input.progressMs) || !input.playing || !input.synchronized ||
    input.progressMs < line.startMs) return base;
  const ends = [line.endMs,input.nextLineStart].filter((v):v is number =>
    typeof v === 'number' && finite(v) && v>line.startMs);
  const end = ends.length ? Math.min(...ends) : line.startMs+8000;
  if(input.progressMs>=end) return base;
  const verifiedWords = input.wordHighlight && verifiedLyricWordsV477(line,input.nextLineStart);
  // Actual word timestamp spacing, not text length or estimated words-per-minute.
  const wordStarts = verifiedWords ? (line.words ?? []).map(w=>w.startMs) : [];
  const gaps = wordStarts.slice(1).map((start,i)=>start-wordStarts[i]).filter(v=>finite(v)&&v>0);
  const averageGap = gaps.length ? gaps.reduce((a,b)=>a+b,0)/gaps.length : Infinity;
  const rapid = gaps.length >= 2 && averageGap < 270;
  const mood: BeautifulLyricMoodV634 = crowded ? 'ensemble' : rapid ? 'rapid' : 'flow';
  const intensity = clamp(input.intensity ?? .65,0,1);
  const animated = !input.reducedMotion && intensity>0;
  const envelope = ease((input.progressMs-line.startMs)/150) * ease((end-input.progressMs)/190);
  const wordGlow = animated && verifiedWords ? clamp((rapid?.060:crowded?.072:dense?.08:.115)*intensity*envelope,0,.115):0;
  return {...base,active:true,mood,verifiedWords,
    wordGlow,wordTransitionMs:animated && verifiedWords ? rapid ? 60 : crowded ? 90 : 125 : 0,
    outlineBoost: animated && verifiedWords ? clamp(wordGlow * (crowded?.28:.5),0,.058):0};
}

/** Optional glow on the *current* verified word. No look-ahead, no changing
 * fill, no stored state, and deterministic under backward seeks and pause. */
export function beautifulLyricWordAccentV634(input: {
  line: LyricLine;
  nextLineStart?: number;
  wordIndex: number;
  progressMs: number;
  playing: boolean;
  reducedMotion: boolean;
  plan: BeautifulLyricsV634;
}): number {
  if(!input.plan.active || !input.plan.verifiedWords || input.plan.wordGlow<=0 ||
    !input.playing || input.reducedMotion || !finite(input.progressMs) ||
    !Number.isInteger(input.wordIndex) || input.wordIndex<0) return 0;
  const word = input.line.words?.[input.wordIndex];
  if(!word || !finite(word.startMs)) return 0;
  const ends = [word.endMs,input.line.words?.[input.wordIndex+1]?.startMs,
    input.line.endMs,input.nextLineStart].filter((v):v is number =>
    typeof v === 'number' && finite(v) && v>word.startMs);
  if(!ends.length) return 0;
  const end = Math.min(...ends);
  if(input.progressMs < word.startMs || input.progressMs >= end) return 0;
  const length = end-word.startMs;
  const attack = Math.max(1,Math.min(input.plan.mood==='rapid'?42:72,length*.32));
  const release = Math.max(1,Math.min(input.plan.mood==='rapid'?55:100,length*.38));
  return clamp(input.plan.wordGlow * ease((input.progressMs-word.startMs)/attack) *
    ease((end-input.progressMs)/release),0,.115);
}
