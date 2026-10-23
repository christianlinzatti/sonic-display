import type { LyricLine } from "@/types/music";
import { planBeautifulLyricsV455 } from "./beautifulLyricsV455";

/** V461 only changes presentation; no invented vocal roles, timing, or lyrics. */
export type CinematicLyricsLayoutV461 = "standard" | "immersive" | "stage-3d";
export interface CinematicLyricsPlanV461 {
  density: "normal" | "dense" | "rapid";
  fontScale: number;
  motionScale: number;
  wordEntranceDelayMs: number;
  visibleLineCount: 1 | 3;
  max3DWidth: number;
  allowWordMeshes: boolean;
  realWordTiming: boolean;
}
const clamp = (x: number, lo: number, hi: number) => Number.isFinite(x) ? Math.max(lo, Math.min(hi, x)) : lo;

export function planCinematicLyricsV461(args: {
  line: LyricLine;
  nextLineStart?: number;
  synchronized: boolean;
  playing: boolean;
  reducedMotion: boolean;
  layout: CinematicLyricsLayoutV461;
  userScale?: number;
}): CinematicLyricsPlanV461 {
  const base = planBeautifulLyricsV455({
    line: args.line, nextLineStart: args.nextLineStart, synchronized: args.synchronized,
    playing: args.playing, reducedMotion: args.reducedMotion, userScale: args.userScale,
  });
  const text = typeof args.line.text === "string" ? args.line.text : "";
  const characters = Array.from(text).length;
  const tokens = text.match(/\S+/gu) ?? [];
  const longest = tokens.reduce((m, word) => Math.max(m, Array.from(word).length), 0);
  const immersive = args.layout !== "standard";
  // Keep the original font choices. Only very long or dense stage captions shrink.
  const extraReduction = immersive
    ? clamp(1 - Math.max(0, characters - 46) * .0045 - Math.max(0, longest - 17) * .008, .76, 1)
    : clamp(1 - Math.max(0, characters - 74) * .0025, .89, 1);
  const motionScale = args.playing && !args.reducedMotion
    ? clamp(base.motionScale * (immersive ? .72 : .9), 0, 1) : 0;
  // Stagger is only an arrival effect. Playback-based karaoke fill remains untouched.
  const wordEntranceDelayMs = !motionScale || base.density === "rapid"
    ? 0 : base.density === "dense" ? 12 : immersive ? 18 : 26;
  // During dense immersive rap, show the active line rather than crop three large rows.
  const visibleLineCount: 1 | 3 = immersive && base.density !== "normal" && args.synchronized ? 1 : 3;
  return {
    density: base.density,
    fontScale: extraReduction,
    motionScale,
    wordEntranceDelayMs,
    visibleLineCount,
    max3DWidth: 2.30,
    allowWordMeshes: tokens.length <= 22 && longest <= 23,
    realWordTiming: base.verifiedWordTiming,
  };
}
