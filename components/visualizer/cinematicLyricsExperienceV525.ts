import type { LyricLine } from "@/types/music";
import { verifiedLyricWordsV477 } from "./beautifulLyricsV477";
import type { CinematicLyricsExperienceV501 } from "./cinematicLyricsExperienceV501";
import type { CinematicLyricsLayoutV461 } from "./cinematicLyricsV461";

/** V525 is a bounded visual-only planner: it NEVER synthesizes word/voice timing,
 * moves a user-positioned stage caption, or modifies karaoke progress. */
export interface CinematicLyricsExperienceV525 {
  readingBoost: number;
  plateOpacity: number;
  wordMotionGain: number;
  max3DWidth: number;
  /** Visible type metadata, not a statement about identified musical structure. */
  rapidRap: boolean;
  textClass: "rapid-rap" | "dense-stage" | "standard";
}
const clamp = (v: number, min: number, max: number) =>
  Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;

/** Requires REAL validated individual start marks. A rapid lyric is not proof of
 * actual artist/phoneme/syllable timing or a detected song section. */
export function hasRapidVerifiedRapWordsV525(line: LyricLine, nextStart?: number): boolean {
  if (!verifiedLyricWordsV477(line, nextStart) || (line.words?.length ?? 0) < 4) return false;
  const words = line.words!;
  const intervals: number[] = [];
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].startMs - words[i - 1].startMs;
    if (!Number.isFinite(gap) || gap < 0) return false;
    intervals.push(gap);
  }
  intervals.sort((a, b) => a - b);
  return intervals[Math.floor(intervals.length / 2)] <= 215;
}

export function planCinematicLyricsExperienceV525(args: {
  line: LyricLine;
  nextLineStart?: number;
  base: CinematicLyricsExperienceV501;
  synchronized: boolean;
  playing: boolean;
  reducedMotion: boolean;
  layout: CinematicLyricsLayoutV461;
  avatarCount?: number;
  genre?: string;
}): CinematicLyricsExperienceV525 {
  const stage = args.layout !== "standard";
  const cast = clamp(args.avatarCount ?? 1, 1, 4);
  const crowded = stage && cast >= 3;
  const text = typeof args.line.text === "string" ? args.line.text : "";
  const chars = Array.from(text).length;
  const genreIsRap = /(?:deutsch[ -]?rap|hip[ -]?hop|\brap\b|trap|drill)/i.test(args.genre ?? "");
  const rapidRap = genreIsRap && args.synchronized && args.base.timingMode === "verified-word" &&
    hasRapidVerifiedRapWordsV525(args.line, args.nextLineStart);
  // Only a small readable-type recovery on crowded stages with manageable text.
  // Never override a user font-size/position or break very long lyric lines.
  const readingBoost = crowded && chars > 0 && chars <= 80
    ? clamp(1 + (cast === 4 ? .11 : .075) * Math.min(1, (90 - chars) / 40), 1, 1.11)
    : 1;
  const plateOpacity = stage ? clamp(Math.max(args.base.plateOpacity, crowded ? .89 : .78), 0, .94)
    : args.base.plateOpacity;
  const wordMotionGain = !args.playing || args.reducedMotion || !args.synchronized ||
    args.base.timingMode !== "verified-word" ? 0 : rapidRap ? .24 : args.base.density === "rapid" ? .42 : crowded ? .68 : 1;
  return {
    readingBoost,
    plateOpacity,
    wordMotionGain,
    // 3D title width is limited by V501, preventing center-stage intrusion.
    max3DWidth: args.base.max3DWidth,
    rapidRap,
    textClass: rapidRap ? "rapid-rap" : crowded ? "dense-stage" : "standard",
  };
}
