import type { LyricLine } from "@/types/music";
import { planCinematicLyricsV461, type CinematicLyricsLayoutV461 } from "./cinematicLyricsV461";

/** V477: visual typography and playback-time karaoke only. No lyric or singer inference. */
export type LyricsTimingModeV477 = "verified-word" | "line-progress" | "static";
export interface BeautifulLyricsPlanV477 {
  timingMode: LyricsTimingModeV477;
  visibleLineCount: 1 | 3;
  fontScale: number;
  lineHeight: number;
  wordSpacingEm: number;
  motionScale: number;
  entranceDelayMs: number;
  max3DWidth: number;
  allowWordMeshes: boolean;
  backdropOpacity: number;
  focusOpacity: number;
  density: "normal" | "dense" | "rapid";
}
const clamp = (n: number, lo: number, hi: number) => Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo;

/** Verify the actual word sequence; malformed timestamps must not look like verified karaoke. */
export function verifiedLyricWordsV477(line: LyricLine, nextLineStart?: number): boolean {
  const words = line.words;
  if (!words?.length || !Number.isFinite(line.startMs)) return false;
  const end = line.endMs != null && Number.isFinite(line.endMs) && line.endMs > line.startMs
    ? line.endMs : nextLineStart != null && Number.isFinite(nextLineStart) && nextLineStart > line.startMs
    ? nextLineStart : undefined;
  let previous = line.startMs;
  for (const [i, word] of words.entries()) {
    if (!word.text?.trim() || !Number.isFinite(word.startMs) || word.startMs < previous ||
      (end != null && word.startMs >= end) ||
      (word.endMs != null && (!Number.isFinite(word.endMs) || word.endMs <= word.startMs || (end != null && word.endMs > end))) ||
      (i + 1 < words.length && word.endMs != null && word.endMs > words[i + 1].startMs)) return false;
    previous = word.startMs;
  }
  return true;
}

export function lyricPlaybackFractionV477(progressMs: number, startMs: number, endMs: number): number {
  return Number.isFinite(progressMs) && Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs
    ? clamp((progressMs - startMs) / (endMs - startMs), 0, 1) : 0;
}

export function planBeautifulLyricsV477(args: {
  line: LyricLine;
  nextLineStart?: number;
  synchronized: boolean;
  playing: boolean;
  reducedMotion: boolean;
  layout: CinematicLyricsLayoutV461;
  avatarCount?: number;
  userScale?: number;
}): BeautifulLyricsPlanV477 {
  const base = planCinematicLyricsV461(args);
  const text = typeof args.line.text === "string" ? args.line.text : "";
  const chars = Array.from(text).length;
  const longest = (text.match(/\S+/gu) ?? []).reduce((max, token) => Math.max(max, Array.from(token).length), 0);
  const immersive = args.layout !== "standard";
  const cast = clamp(args.avatarCount ?? 1, 1, 4);
  // Only reduce the active caption when a crowded stage/long text requires the clearance.
  const crowdPenalty = immersive && cast >= 3 ? (cast === 4 ? .925 : .965) : 1;
  const lengthPenalty = clamp(1 - Math.max(0, chars - (immersive ? 52 : 75)) * .0025 -
    Math.max(0, longest - 20) * .006, .81, 1);
  const fontScale = clamp(crowdPenalty * lengthPenalty, .74, 1);
  const denseStage = immersive && args.synchronized && (base.density !== "normal" || (cast >= 3 && chars >= 42));
  const timingMode: LyricsTimingModeV477 = !args.synchronized ? "static" :
    verifiedLyricWordsV477(args.line, args.nextLineStart) ? "verified-word" : "line-progress";
  const visibleLineCount: 1 | 3 = denseStage ? 1 : base.visibleLineCount;
  const motionScale = !args.playing || args.reducedMotion ? 0 : clamp(base.motionScale * (cast >= 3 && immersive ? .72 : 1), 0, 1);
  return {
    timingMode,
    visibleLineCount,
    fontScale,
    lineHeight: base.density === "normal" ? 1.32 : 1.39,
    wordSpacingEm: base.density === "rapid" ? .012 : base.density === "dense" ? .023 : .034,
    motionScale,
    entranceDelayMs: motionScale > 0 && base.density === "normal" ? Math.min(18, base.wordEntranceDelayMs) : 0,
    max3DWidth: immersive && cast >= 3 ? 2.08 : base.max3DWidth,
    allowWordMeshes: base.allowWordMeshes && timingMode === "verified-word" && (!immersive || cast < 4 || chars <= 54),
    backdropOpacity: immersive && cast >= 3 ? .84 : .72,
    focusOpacity: immersive && cast >= 3 ? .34 : .48,
    density: base.density,
  };
}
