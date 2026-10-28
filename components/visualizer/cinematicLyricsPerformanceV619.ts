import type { LyricLine } from "@/types/music";
import { verifiedLyricWordsV477 } from "./beautifulLyricsV477";
import type { BeautifulLyricsExperienceV598 } from "./beautifulLyricsExperienceV598";
import type { LyricsHarmonyV606 } from "./concertLyricsPerformerHarmonyV606";
import type { LyricReadabilityV578 } from "./beautifulLyricsV578";

/** V619: conservative, purely visual concert lyric direction. All timing comes
 * from the existing synchronized lyric source; V606 owns confirmed hook cues.
 * Never changes the V541/V549 karaoke fill, text, layout, singer or camera. */
export type CinematicLyricModeV619 = 'quiet' | 'verse' | 'duet' | 'hook';
export interface CinematicLyricsPerformanceV619 {
  mode: CinematicLyricModeV619;
  active: boolean;
  verifiedWords: boolean;
  maxWidthCh: number;
  plateOpacity: number;
  hookUnderline: number;
  wordGain: number;
  /** Deliberately calm typography on crowded stages and fast rap. */
  calm: boolean;
}
const clamp = (x: number, low: number, high: number): number =>
  Number.isFinite(x) ? Math.max(low, Math.min(high, x)) : low;
const smooth = (n: number): number => { const x = clamp(n, 0, 1); return x * x * (3 - 2 * x); };

export function planCinematicLyricsPerformanceV619(input: {
  line: LyricLine | null | undefined;
  nextLineStart?: number;
  progressMs: number;
  playing: boolean;
  synchronized: boolean;
  reducedMotion: boolean;
  immersive: boolean;
  avatarCount: number;
  wordHighlight: boolean;
  intensity: number;
  visual: BeautifulLyricsExperienceV598;
  harmony: LyricsHarmonyV606;
  readability: LyricReadabilityV578;
}): CinematicLyricsPerformanceV619 {
  const l = input.line;
  const cast = Math.round(clamp(input.avatarCount, 1, 4));
  const length = [...(l?.text ?? '')].length;
  const crowded = input.immersive && cast >= 3;
  const calm = crowded || input.visual.density !== 'normal' || length > 72;
  const width = Math.min(input.visual.widthCh, input.harmony.widthCh,
    input.readability.maxWidthCh);
  // Legibility is independent of autoplay, intensity and accessibility preferences.
  const plateOpacity = clamp(Math.max(input.visual.plateOpacity,
    input.readability.plateOpacity,
    input.visual.plateOpacity + (crowded ? .04 : .018)), 0, .95);
  const quiet: CinematicLyricsPerformanceV619 = {
    mode:'quiet', active:false, verifiedWords:false, maxWidthCh:width,
    plateOpacity, hookUnderline:0, wordGain:0, calm,
  };
  if (!l || !l.text?.trim() || !input.playing || !input.synchronized ||
      !input.harmony.active || !Number.isFinite(input.progressMs) ||
      !Number.isFinite(l.startMs) || input.progressMs < l.startMs) return quiet;
  const ends = [l.endMs,input.nextLineStart].filter((v):v is number =>
    typeof v === 'number' && Number.isFinite(v) && v > l.startMs);
  // If a provider lacks a line end, do not fabricate an unbounded active period.
  const end = ends.length ? Math.min(...ends) : l.startMs + 8000;
  if(input.progressMs >= end) return quiet;
  const hook = input.harmony.mode === 'hook'; // V606 checks verified V604 narrative evidence.
  const duet = !hook && input.harmony.confirmedDuet;
  const mode: CinematicLyricModeV619 = hook ? 'hook' : duet ? 'duet' : 'verse';
  const verifiedWords = input.wordHighlight &&
    input.visual.verifiedWords && input.harmony.verifiedWords &&
    verifiedLyricWordsV477(l, input.nextLineStart);
  const strength = clamp(input.intensity,0,1);
  const enabled = !input.reducedMotion && strength > 0;
  const lineFade = smooth((input.progressMs - l.startMs)/200) * smooth((end-input.progressMs)/250);
  return {
    mode, active:true, verifiedWords,
    maxWidthCh:width, plateOpacity,
    // Only a modest, already authenticated hook/duet underline; no new animations.
    hookUnderline: !enabled ? 0 : lineFade * strength * (hook ? .22 : duet ? .08 : 0),
    wordGain: !enabled || !verifiedWords ? 0 :
      (calm ? .065 : hook ? .17 : duet ? .12 : .095) * strength,
    calm,
  };
}

/** Add a bounded emphasis to the CURRENT verified word only, never to the
 * next word. State-free by design, including seeks, repeated hooks and pause. */
export function cinematicLyricWordAccentV619(input: {
  line: LyricLine;
  nextLineStart?: number;
  wordIndex: number;
  progressMs: number;
  playing: boolean;
  reducedMotion: boolean;
  plan: CinematicLyricsPerformanceV619;
}): number {
  if (!input.plan.active || !input.plan.verifiedWords ||
      input.plan.wordGain <= 0 || !input.playing || input.reducedMotion ||
      !Number.isFinite(input.progressMs) || !Number.isInteger(input.wordIndex)) return 0;
  const w = input.line.words?.[input.wordIndex];
  if (!w || !Number.isFinite(w.startMs)) return 0;
  const endpoints = [w.endMs, input.line.words?.[input.wordIndex+1]?.startMs,
    input.line.endMs, input.nextLineStart].filter((v):v is number =>
      typeof v === 'number' && Number.isFinite(v) && v > w.startMs);
  if (!endpoints.length) return 0;
  const end = Math.min(...endpoints);
  if (input.progressMs < w.startMs || input.progressMs >= end) return 0;
  // Keep the word envelope smooth even with 150ms rapid Deutschrap words.
  const window = end - w.startMs;
  const attack = Math.min(65, window*.33);
  const release = Math.min(90, window*.4);
  const accent = smooth((input.progressMs-w.startMs)/Math.max(1,attack)) *
    smooth((end-input.progressMs)/Math.max(1,release)) * input.plan.wordGain;
  return clamp(accent, 0, .17);
}
