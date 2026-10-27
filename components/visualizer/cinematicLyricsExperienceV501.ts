import type { LyricLine } from "@/types/music";
import { planBeautifulLyricsV477, type LyricsTimingModeV477 } from "./beautifulLyricsV477";
import type { CinematicLyricsLayoutV461 } from "./cinematicLyricsV461";

/** V501 deliberately stages lyrics, not voices or song structure. Playback time is the only clock. */
export interface CinematicLyricsExperienceV501 {
  timingMode: LyricsTimingModeV477;
  /** Show lyrics in full when paused or when motion is reduced. */
  reveal: number;
  glow: number;
  /** Reading-safe backing for bright stages; purely visual. */
  plateOpacity: number;
  /** Multiplier applied only to the existing V477 font limits. */
  fontScale: number;
  /** No camera, actor or user-selected spatial-layout changes. */
  max3DWidth: number;
  wordMotion: number;
  lineOffsetPx: number;
  cast: 1 | 2 | 3 | 4;
  density: "normal" | "dense" | "rapid";
}

const clamp = (value: number, low: number, high: number) =>
  Number.isFinite(value) ? Math.min(high, Math.max(low, value)) : low;
const smooth = (v: number) => {
  const x = clamp(v, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Correct word-boundary accent only if upstream word marks have already been verified. */
export function lyricWordAccentV501(args: {
  progressMs: number;
  startMs: number;
  endMs: number;
  verifiedWordTiming: boolean;
  playing: boolean;
  reducedMotion: boolean;
}): number {
  if (!args.verifiedWordTiming || !args.playing || args.reducedMotion ||
    ![args.progressMs, args.startMs, args.endMs].every(Number.isFinite) ||
    args.endMs <= args.startMs || args.progressMs < args.startMs || args.progressMs >= args.endMs) return 0;
  // A small, bounded highlight after the true word onset. Never changes karaoke fill.
  const elapsed = args.progressMs - args.startMs;
  const attack = smooth(elapsed / 90);
  const decay = 1 - smooth(Math.max(0, elapsed - 110) / 190);
  return clamp(attack * decay, 0, 1);
}

export function planCinematicLyricsExperienceV501(args: {
  line: LyricLine;
  nextLineStart?: number;
  progressMs: number;
  synchronized: boolean;
  playing: boolean;
  reducedMotion: boolean;
  layout: CinematicLyricsLayoutV461;
  avatarCount?: number;
  userScale?: number;
}): CinematicLyricsExperienceV501 {
  const base = planBeautifulLyricsV477(args);
  const cast = Math.round(clamp(args.avatarCount ?? 1, 1, 4)) as 1 | 2 | 3 | 4;
  const stage = args.layout !== "standard";
  const start = args.line.startMs;
  const validEnd = args.line.endMs != null && Number.isFinite(args.line.endMs) && args.line.endMs > start
    ? args.line.endMs : undefined;
  const next = args.nextLineStart != null && Number.isFinite(args.nextLineStart) && args.nextLineStart > start
    ? args.nextLineStart : undefined;
  const end = Math.min(validEnd ?? Infinity, next ?? Infinity);
  const finite = Number.isFinite(start) && Number.isFinite(args.progressMs) && end !== Infinity && end > start;
  const duration = finite ? end - start : 0;
  const motion = args.playing && !args.reducedMotion && args.synchronized && finite;
  const intro = motion ? smooth((args.progressMs - start) / Math.min(250, duration * .35)) : 1;
  const outro = motion ? smooth((end - args.progressMs) / Math.min(210, duration * .30)) : 1;
  const reveal = clamp(.82 + .18 * Math.min(intro, outro), .82, 1);
  const dense = base.density !== "normal";
  // Crowded stage: protect readable type and reserve the center for avatars.
  const fontScale = stage && cast >= 3 && dense ? (cast === 4 ? .94 : .97) : 1;
  const max3DWidth = Math.min(base.max3DWidth, stage && cast >= 3 ? (cast === 4 ? 1.91 : 2.00) : base.max3DWidth);
  const wordMotion = motion && base.timingMode === "verified-word" && base.density !== "rapid"
    ? clamp(base.motionScale * (stage && cast >= 3 ? .6 : .85), 0, .65) : 0;
  return {
    timingMode: base.timingMode,
    reveal,
    glow: motion ? clamp((intro * outro) * (dense ? .32 : .52), 0, .55) : 0,
    plateOpacity: stage ? clamp(base.backdropOpacity + (cast >= 3 ? .065 : .025), .74, .92) : .12,
    fontScale,
    max3DWidth,
    wordMotion,
    lineOffsetPx: motion ? clamp((1 - intro) * (dense ? 2 : 5), 0, 5) : 0,
    cast,
    density: base.density,
  };
}
