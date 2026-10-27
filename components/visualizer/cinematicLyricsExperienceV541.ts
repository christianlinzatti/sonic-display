import type { LyricLine } from "@/types/music";
import { lyricPlaybackFractionV477, verifiedLyricWordsV477 } from "./beautifulLyricsV477";
import { lyricWordAccentV501 } from "./cinematicLyricsExperienceV501";
import type { CinematicLyricsLayoutV461 } from "./cinematicLyricsV461";

/** V541: a visual-only, playback-clock-driven reading plan shared by DOM and WebGL.
 * Never infers artists, syllables, phonemes, beats or unprovided word boundaries. */
export interface CinematicLyricsExperienceV541 {
  density: "normal" | "dense" | "rapid";
  verifiedWords: boolean;
  backdropOpacity: number;
  readingScale: number;
  wordMotionGain: number;
  /** Zero on slow devices; every 3D word is an individual GPU text mesh. */
  max3DWordMeshes: number;
  /** CSS styling only. The user-selected caption position never changes. */
  lineContrast: number;
}

export interface CinematicWordVisualV541 {
  fill: number;
  focus: number;
  glow: number;
}

const clamp = (v: number, lo = 0, hi = 1): number =>
  Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo;
const ease = (v: number): number => { const x = clamp(v); return x * x * (3 - 2 * x); };

function medianInterval(words: NonNullable<LyricLine["words"]>): number {
  if (words.length < 2) return Infinity;
  const gaps = words.slice(1).map((w, i) => w.startMs - words[i].startMs);
  if (gaps.some(g => !Number.isFinite(g) || g < 0)) return Infinity;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

export function planCinematicLyricsV541(args: {
  line: LyricLine;
  nextLineStart?: number;
  synchronized: boolean;
  playing: boolean;
  reducedMotion: boolean;
  layout: CinematicLyricsLayoutV461;
  avatarCount?: number;
  tier?: "low" | "balanced" | "high";
}): CinematicLyricsExperienceV541 {
  const verified = args.synchronized && verifiedLyricWordsV477(args.line, args.nextLineStart);
  const words = args.line.words ?? [];
  const rapid = verified && words.length >= 4 && medianInterval(words) <= 215;
  const longLine = Array.from(args.line.text ?? "").length >= 76;
  const dense = (verified && words.length >= 9) || longLine;
  const density = rapid ? "rapid" : dense ? "dense" : "normal";
  const cast = clamp(args.avatarCount ?? 1, 1, 4);
  const immersive = args.layout !== "standard";
  const crowded = immersive && cast >= 3;
  const animated = args.playing && !args.reducedMotion && verified;
  // Fonts remain anchored to the user's size: only a small, bounded correction.
  const readingScale = crowded && (dense || rapid) ? (cast >= 4 ? 1.045 : 1.025) : 1;
  const wordMotionGain = !animated ? 0 : rapid ? .18 : dense ? .46 : crowded ? .66 : 1;
  const longWord = (args.line.text?.match(/\S+/gu) ?? []).some(token => [...token].length >= 26);
  const max3DWordMeshes = !verified || longWord || args.tier === "low" ? 0 :
    args.tier === "balanced" ? (rapid ? 10 : 14) : (rapid ? 16 : 26);
  return {
    density,
    verifiedWords: verified,
    backdropOpacity: immersive ? (crowded ? .94 : rapid ? .89 : .82) : .13,
    readingScale,
    wordMotionGain,
    max3DWordMeshes,
    lineContrast: crowded ? .94 : rapid ? .86 : .75,
  };
}

/** Continuous, seek-safe karaoke fill. The only boundaries are validated word
 * marks; when the end of the final word is unknown, we do not invent it. */
export function planCinematicWordV541(args: {
  line: LyricLine;
  nextLineStart?: number;
  wordIndex: number;
  progressMs: number;
  playing: boolean;
  reducedMotion: boolean;
  plan: CinematicLyricsExperienceV541;
}): CinematicWordVisualV541 | null {
  if (!args.plan.verifiedWords || !Number.isFinite(args.progressMs) || !Number.isInteger(args.wordIndex)) return null;
  const words = args.line.words ?? [];
  const word = words[args.wordIndex];
  if (!word) return null;
  const endCandidates = [word.endMs, words[args.wordIndex + 1]?.startMs,
    args.line.endMs, args.nextLineStart].filter((n): n is number =>
    typeof n === "number" && Number.isFinite(n) && n > word.startMs);
  if (!endCandidates.length) return null;
  const end = Math.min(...endCandidates);
  const fill = lyricPlaybackFractionV477(args.progressMs, word.startMs, end);
  const focusBase = lyricWordAccentV501({
    progressMs: args.progressMs, startMs: word.startMs, endMs: end,
    verifiedWordTiming: true, playing: args.playing, reducedMotion: args.reducedMotion,
  });
  const focus = focusBase * args.plan.wordMotionGain;
  // The accent eases away instead of flashing at the next word boundary.
  const glow = ease(focus) * (args.plan.density === "rapid" ? .22 : .42);
  return { fill, focus, glow };
}
