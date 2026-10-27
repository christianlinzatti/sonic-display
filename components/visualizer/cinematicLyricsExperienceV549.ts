import type { LyricLine } from "@/types/music";
import type { ConcertSceneV528 } from "./cinematicConcertCoordinationV528";
import {
  planCinematicWordV541,
  type CinematicLyricsExperienceV541,
  type CinematicWordVisualV541,
} from "./cinematicLyricsExperienceV541";

/** V549 visual-only direction. Word progress remains exactly on the V541 verified
 * timestamps. A V528 scene is accepted only after the existing track-bound
 * singer director verified it; a visual-only stage focus is never a singer. */
export interface CinematicLyricsExperienceV549 {
  wordMotionGain: number;
  wordGlowGain: number;
  readingScale: number;
  plateOpacity: number;
  max3DWordMeshes: number;
  singerLabel: string | null;
  singerCue: "none" | "solo" | "handoff" | "ensemble";
  /** Length of the motion-only handoff emphasis, not a karaoke delay. */
  handoffEmphasis: number;
}
export interface CinematicWordVisualV549 extends CinematicWordVisualV541 {
  /** Additional bounded, decoration-only accent; NOT a timestamp offset. */
  motion: number;
}
const clamp = (v: number, lo = 0, hi = 1): number =>
  Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo;
const smooth = (v: number): number => { const t = clamp(v); return t * t * (3 - 2 * t); };

function verifiedScene(scene: ConcertSceneV528 | undefined, progressMs: number): boolean {
  if (!scene?.active || !scene.trackId?.trim() || !Number.isFinite(progressMs) ||
      !Number.isFinite(scene.cueStartMs) || !Number.isFinite(scene.cueEndMs) ||
      scene.cueStartMs < 0 || scene.cueEndMs <= scene.cueStartMs ||
      progressMs < scene.cueStartMs || progressMs >= scene.cueEndMs ||
      !Number.isInteger(scene.count) || scene.count < 2 || scene.count > 4 ||
      !Number.isInteger(scene.leadSlot) || scene.leadSlot < 0 || scene.leadSlot >= scene.count ||
      !Array.isArray(scene.singingSlots) || !scene.singingSlots.length ||
      scene.singingSlots.some(slot => !Number.isInteger(slot) || slot < 0 || slot >= scene.count) ||
      new Set(scene.singingSlots).size !== scene.singingSlots.length ||
      !scene.singingSlots.includes(scene.leadSlot)) return false;
  return scene.handoffFrom === null ||
    (Number.isInteger(scene.handoffFrom) && scene.handoffFrom >= 0 &&
     scene.handoffFrom < scene.count && scene.handoffFrom !== scene.leadSlot);
}

export function planCinematicLyricsV549(input: {
  base: CinematicLyricsExperienceV541;
  line: LyricLine;
  progressMs: number;
  playing: boolean;
  reducedMotion: boolean;
  avatarCount?: number;
  tier: "low" | "balanced" | "high";
  scene?: ConcertSceneV528;
}): CinematicLyricsExperienceV549 {
  const { base } = input;
  const active = input.playing && !input.reducedMotion;
  const rapid = base.density === "rapid";
  const dense = base.density === "dense";
  const crowded = clamp(input.avatarCount ?? 1, 1, 4) >= 3;
  const scene = verifiedScene(input.scene, input.progressMs) && input.playing ? input.scene : undefined;
  const recentHandoff = scene?.handoffFrom !== null && scene?.handoffFrom !== undefined &&
    input.progressMs - scene.cueStartMs < 720;
  const singerCue: CinematicLyricsExperienceV549["singerCue"] = !scene ? "none" :
    recentHandoff ? "handoff" : scene.singingSlots.length > 1 ? "ensemble" : "solo";
  const singerLabel = !scene ? null : singerCue === "handoff" ?
    `Avatar ${(scene.handoffFrom ?? 0) + 1} → Avatar ${scene.leadSlot + 1}` :
    singerCue === "ensemble" ? `Gemeinsam · Avatare ${scene.singingSlots.map(i => i + 1).join(" + ")}` :
    `Avatar ${scene.leadSlot + 1}`;
  // All additions are visual. Never enlarge the actual screen-space lyric bounds.
  const handoffEmphasis = recentHandoff && active ?
    smooth(1 - (input.progressMs - scene!.cueStartMs) / 720) * .13 : 0;
  const motion = !active ? 0 : rapid ? .72 : dense ? .88 : 1;
  const wordMotionGain = clamp(base.wordMotionGain * motion, 0, 1);
  const wordGlowGain = !active || input.tier === "low" ? 0 :
    rapid ? .40 : dense ? .64 : .88;
  const max3DWordMeshes = input.tier === "low" ? 0 :
    Math.min(base.max3DWordMeshes, crowded ? 12 : rapid ? 14 : input.tier === "balanced" ? 14 : 24);
  return {
    wordMotionGain, wordGlowGain,
    readingScale: crowded && (rapid || dense) ? 1.012 : 1,
    plateOpacity: clamp(base.backdropOpacity + (crowded && (rapid || dense) ? .035 : 0), 0, .98),
    max3DWordMeshes,
    singerLabel, singerCue, handoffEmphasis,
  };
}

export function planCinematicWordV549(args: {
  line: LyricLine;
  nextLineStart?: number;
  wordIndex: number;
  progressMs: number;
  playing: boolean;
  reducedMotion: boolean;
  base: CinematicLyricsExperienceV541;
  visual: CinematicLyricsExperienceV549;
}): CinematicWordVisualV549 | null {
  const v541 = planCinematicWordV541({
    line: args.line, nextLineStart: args.nextLineStart,
    wordIndex: args.wordIndex, progressMs: args.progressMs,
    playing: args.playing, reducedMotion: args.reducedMotion, plan: args.base,
  });
  if (!v541) return null;
  // For fast flow, tighten only the decorative focus; fill stays untouched.
  const visualGain = args.base.wordMotionGain > 0 ?
    clamp(args.visual.wordMotionGain / args.base.wordMotionGain) : 0;
  const motion = clamp(v541.focus * visualGain + args.visual.handoffEmphasis, 0, .28);
  return {
    fill: v541.fill,
    focus: clamp(v541.focus * visualGain, 0, 1),
    glow: clamp(v541.glow * args.visual.wordGlowGain, 0, .42),
    motion,
  };
}
