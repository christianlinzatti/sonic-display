import type { LyricLine } from "@/types/music";

/** V455: visual-only pacing. No invented phonemes, word marks or song structure. */
export type LyricsReadabilityV455 = "normal" | "dense" | "rapid";
export interface LyricsLinePlanV455 {
  density: LyricsReadabilityV455;
  fontScale: number;
  motionScale: number;
  wordSpacingEm: number;
  estimatedWordsPerSecond: number;
  verifiedWordTiming: boolean;
}
const clamp = (value: number, lower: number, upper: number) =>
  Number.isFinite(value) ? Math.min(upper, Math.max(lower, value)) : lower;

export function planBeautifulLyricsV455(args: {
  line: LyricLine;
  nextLineStart?: number;
  synchronized: boolean;
  playing: boolean;
  reducedMotion: boolean;
  userScale?: number;
}): LyricsLinePlanV455 {
  const { line, nextLineStart, synchronized, playing, reducedMotion } = args;
  const rawText = typeof line.text === "string" ? line.text.trim() : "";
  const graphemes = Array.from(rawText).length;
  const count = rawText.match(/\S+/gu)?.length ?? 0;
  const lineEnd = line.endMs != null && Number.isFinite(line.endMs) && line.endMs > line.startMs
    ? line.endMs : nextLineStart != null && Number.isFinite(nextLineStart) && nextLineStart > line.startMs
    ? nextLineStart : undefined;
  const duration = synchronized && lineEnd != null && Number.isFinite(line.startMs)
    ? lineEnd - line.startMs : 0;
  const rate = duration >= 200 && count > 0 ? clamp(count * 1000 / duration, 0, 20) : 0;
  const verifiedWordTiming = synchronized && !!line.words?.length && line.words.every((word, i) =>
    !!word.text?.trim() && Number.isFinite(word.startMs) && word.startMs >= line.startMs &&
    (i === 0 || word.startMs >= line.words![i-1].startMs) &&
    (lineEnd == null || word.startMs < lineEnd));
  const rapid = rate >= 3.8;
  const dense = graphemes >= 65 || count >= 11 || rate >= 2.9;
  const fontScale = clamp(graphemes > 88 ? .78 : graphemes > 67 ? .86 : graphemes > 48 ? .94 : 1, .76, 1);
  // Preserve the user's requested typography; only prevent overflowing long lines.
  const desired = clamp(args.userScale ?? 1, .6, 1.8);
  const boundedFontScale = Math.min(1, fontScale + Math.max(0, 1 - desired) * .05);
  const motionScale = reducedMotion || !playing ? 0 : rapid ? .28 : dense ? .56 : 1;
  return {
    density: rapid ? "rapid" : dense ? "dense" : "normal",
    fontScale: boundedFontScale,
    motionScale,
    wordSpacingEm: rapid ? .015 : dense ? .025 : .035,
    estimatedWordsPerSecond: rate,
    verifiedWordTiming
  };
}

/** A single word's stable progress for karaoke fill; using playback time prevents drift. */
export function lyricWordFillV455(args: {
  progressMs: number; startMs: number; endMs: number; reducedMotion: boolean;
}) {
  const {progressMs,startMs,endMs} = args;
  if (![progressMs,startMs,endMs].every(Number.isFinite) || endMs <= startMs) return 0;
  return clamp((progressMs-startMs)/(endMs-startMs), 0, 1);
}
