import type { LyricLine } from '@/types/music';
import { verifiedLyricWordsV477 } from './beautifulLyricsV477';

/** V598 – Visual-only typography/word accents. Never invents timing, sections,
 * roles, lyrics or words. The existing karaoke fill retains sole ownership of time. */
export type BeautifulLyricsSectionV598 = 'hook' | 'verse' | 'drop' | 'unknown';
export interface BeautifulLyricsExperienceV598 {
  mode: 'quiet' | 'flow' | 'hook';
  density: 'normal' | 'dense' | 'very-dense';
  widthCh: number;
  plateOpacity: number;
  lineHeight: number;
  contrast: number;
  hookAccent: number;
  wordAccentGain: number;
  verifiedWords: boolean;
}
export interface BeautifulLyricsWordV598 { accent: number; }
const clamp = (n: number, lo: number, hi: number): number =>
  Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo;
const ease = (n: number): number => { const x = clamp(n, 0, 1); return x * x * (3 - 2 * x); };

export function planBeautifulLyricsExperienceV598(input: {
  line: LyricLine | null | undefined;
  nextLineStart?: number;
  progressMs: number;
  synchronized: boolean;
  playing: boolean;
  reducedMotion: boolean;
  immersive: boolean;
  avatarCount?: number;
  sectionCue?: BeautifulLyricsSectionV598;
  intensity?: number;
}): BeautifulLyricsExperienceV598 {
  const line = input.line;
  const text = typeof line?.text === 'string' ? line.text.trim() : '';
  const length = [...text].length;
  const longest = (text.match(/\S+/gu) ?? []).reduce((n, word) => Math.max(n, [...word].length), 0);
  const cast = Math.round(clamp(input.avatarCount ?? 1, 1, 4));
  const dense = length > (input.immersive ? 48 : 72) || longest > 23;
  const veryDense = length > (input.immersive ? 86 : 116) || longest > 35;
  const density: BeautifulLyricsExperienceV598['density'] = veryDense ? 'very-dense' : dense ? 'dense' : 'normal';
  const verifiedWords = Boolean(line && input.synchronized && verifiedLyricWordsV477(line, input.nextLineStart));
  const active = Boolean(line && text && input.playing && input.synchronized && Number.isFinite(input.progressMs) &&
    input.progressMs >= line.startMs &&
    (line.endMs == null || input.progressMs < line.endMs) &&
    (input.nextLineStart == null || input.progressMs < input.nextLineStart));
  const hook = active && input.sectionCue === 'hook'; // Cue supplied by stage, never inferred from lyric text.
  const mode: BeautifulLyricsExperienceV598['mode'] = hook ? 'hook' : active ? 'flow' : 'quiet';
  const crowd = input.immersive && cast >= 3;
  const widthCh = veryDense ? (crowd ? 34 : 42) : dense ? (crowd ? 38 : 48) : crowd ? 42 : input.immersive ? 48 : 60;
  const accentStrength = clamp(input.intensity ?? 0.65, 0, 1);
  const animated = active && !input.reducedMotion && accentStrength > 0;
  // Typography never forces a larger user font or changes the user's chosen positioning.
  return {
    mode, density, widthCh,
    plateOpacity: input.immersive ? (crowd ? .84 : .77) : dense ? .14 : .08,
    lineHeight: veryDense ? 1.27 : dense ? 1.30 : 1.35,
    contrast: crowd ? .93 : input.immersive ? .87 : .75,
    hookAccent: hook && animated ? clamp(.08 + .16 * accentStrength, 0, .24) : 0,
    wordAccentGain: animated && verifiedWords ? (veryDense ? .22 : dense ? .40 : crowd ? .45 : .68) * accentStrength : 0,
    verifiedWords,
  };
}

/** An extra glow only: the existing V541/V549 word fill and user settings are untouched. */
export function planBeautifulLyricsWordV598(input: {
  line: LyricLine;
  nextLineStart?: number;
  wordIndex: number;
  progressMs: number;
  playing: boolean;
  reducedMotion: boolean;
  plan: BeautifulLyricsExperienceV598;
}): BeautifulLyricsWordV598 | null {
  if (!input.plan.verifiedWords || !input.playing || input.reducedMotion ||
    !Number.isInteger(input.wordIndex) || !Number.isFinite(input.progressMs)) return null;
  const words = input.line.words ?? [];
  const word = words[input.wordIndex];
  if (!word) return null;
  const ends = [word.endMs, words[input.wordIndex + 1]?.startMs, input.line.endMs, input.nextLineStart]
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > word.startMs);
  if (!ends.length) return null;
  const end = Math.min(...ends);
  // No attraction to future/past words; deterministic under seeks and replay.
  if (input.progressMs < word.startMs || input.progressMs >= end) return { accent: 0 };
  const attack = ease((input.progressMs - word.startMs) / 90);
  const release = ease((end - input.progressMs) / 115);
  const accent = clamp(attack * release * input.plan.wordAccentGain, 0, .68);
  return { accent };
}
