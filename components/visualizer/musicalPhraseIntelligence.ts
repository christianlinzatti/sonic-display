import type { AudioFeatures } from "../../types/audio";
import type { PerformanceSection } from "./performanceDirector";

/** V229: Phrase-aware secondary-motion envelope, independent of the beat-accurate pose pipeline. */
export type PhraseMotion = { groove: number; accents: number; upperBody: number; anticipation: number };
export type PhraseMotionState = { current: PhraseMotion; section: PerformanceSection; };
const zero = (): PhraseMotion => ({ groove: 0, accents: 0, upperBody: 0, anticipation: 0 });
const clamp = (n: number, lo = 0, hi = 1.5) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));
export const createPhraseMotionState = (): PhraseMotionState => ({ current: zero(), section: "intro" });

export function phraseMotionTarget(section: PerformanceSection, genre: string | null | undefined, audio: AudioFeatures, phraseProgress: number): PhraseMotion {
  const rap = /rap|hip.?hop|trap|deutsch/i.test(genre ?? "");
  const hard = /hardstyle|hardtekk|hardcore/i.test(genre ?? "");
  const energy = clamp(audio.energyEnvelope ?? 0, 0, 1);
  const progress = clamp(phraseProgress, 0, 1);
  const phraseLift = progress > 0.7 ? (progress - 0.7) / 0.3 : 0;
  const base: Record<PerformanceSection, PhraseMotion> = {
    intro: {groove:.43,accents:.30,upperBody:.40,anticipation:0},
    verse: {groove:rap ? .88 : .72,accents:.56,upperBody:rap ? .90 : .65,anticipation:.1},
    chorus: {groove:1.05,accents:rap ? .95 : .86,upperBody:1.05,anticipation:.23},
    drop: {groove:hard ? 1.25 : 1.10,accents:hard ? 1.35 : 1.10,upperBody:1.05,anticipation:0},
    break: {groove:.25,accents:.18,upperBody:.36,anticipation:.15},
    outro: {groove:.32,accents:.24,upperBody:.34,anticipation:0},
  };
  const p = base[section] ?? base.verse;
  const energyFactor = .75 + energy * .25;
  return {groove:clamp(p.groove * energyFactor), accents:clamp(p.accents * energyFactor),
    upperBody:clamp(p.upperBody * energyFactor), anticipation:clamp(p.anticipation + (section === "break" ? phraseLift * .18 : 0))};
}

/** Exponential smoothing prevents sudden jumps on unreliable section detections. */
export function updatePhraseMotion(state: PhraseMotionState, section: PerformanceSection, genre: string | null | undefined,
  audio: AudioFeatures, progress: number, dt: number, playing: boolean, reducedMotion: boolean): PhraseMotion {
  const target = playing && !reducedMotion ? phraseMotionTarget(section, genre, audio, progress) : zero();
  const step = clamp(dt, 0, .1);
  const alpha = 1 - Math.exp(-step * (playing && !reducedMotion ? 3.5 : 12));
  for (const key of Object.keys(target) as (keyof PhraseMotion)[]) {
    state.current[key] += (target[key] - state.current[key]) * alpha;
    if (Math.abs(state.current[key]) < 1e-7) state.current[key] = 0;
  }
  state.section = section;
  return state.current;
}
