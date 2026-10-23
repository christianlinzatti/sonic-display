import type { AudioFeatures } from "../../types/audio";

/** V241: deterministic, phrase-aware, low-amplitude secondary movement.
 * No world-space translation, IK mutation, random jitter or clip replacement.
 */
export type PhraseMotionVariation = {
  torso: number;
  shoulder: number;
  hip: number;
  arm: number;
  head: number;
};
export type PhraseMotionVariationState = { value: PhraseMotionVariation };
const zero = (): PhraseMotionVariation => ({ torso: 0, shoulder: 0, hip: 0, arm: 0, head: 0 });
const finite = (value: number | undefined | null, fallback = 0) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, finite(v)));
const fract = (n: number) => n - Math.floor(n);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 78.233) * 43758.5453123);
export function createPhraseMotionVariation(): PhraseMotionVariationState { return { value: zero() }; }

export function targetPhraseMotionVariation(audio: AudioFeatures, seconds: number, genre: string | null | undefined,
  intensity: number, variation: number, phraseProgress: number): PhraseMotionVariation {
  const bpm = clamp(finite(audio.bpm, 120), 60, 220);
  const beats = Math.max(0, finite(seconds)) * bpm / 60;
  const bar = Math.floor(beats / 4);
  const beatInBar = beats % 4;
  const rap = /rap|hip.?hop|trap|deutsch/i.test(genre || "");
  const hard = /hardstyle|hardtekk|hardcore/i.test(genre || "");
  const energy = clamp(audio.energyEnvelope ?? 0.5, 0, 1);
  const amount = clamp(intensity, 0, 1.5) * clamp(variation, 0, 1) * (0.22 + 0.78 * energy);
  const phrase = clamp(phraseProgress, 0, 1);
  // Fade across bar boundaries to avoid stepping between deterministic textures.
  const boundary = Math.min(1, beatInBar * 1.5, (4 - beatInBar) * 1.5);
  const envelope = Math.max(0, boundary) * (0.75 + 0.25 * Math.sin(phrase * Math.PI));
  const drift = (hash(bar + (rap ? 11 : hard ? 31 : 51)) - 0.5) * 2;
  const accent = (hash(bar + 107) - 0.5) * 2;
  const groovePhase = beats * Math.PI * (rap ? 1 : 2);
  const wave = Math.sin(groovePhase - (hard ? 0.12 : 0.54));
  const scale = amount * envelope;
  return {
    torso: clamp((drift * 0.028 + wave * 0.009) * scale, -0.05, 0.05),
    shoulder: clamp((accent * 0.035 + wave * 0.017) * scale, -0.07, 0.07),
    hip: clamp((-drift * 0.026 + wave * 0.012) * scale, -0.05, 0.05),
    arm: clamp((accent * 0.040 + Math.sin(groovePhase - 0.65) * 0.016) * scale, -0.08, 0.08),
    head: clamp((-accent * 0.014 + wave * 0.006) * scale, -0.03, 0.03),
  };
}

export function updatePhraseMotionVariation(state: PhraseMotionVariationState, audio: AudioFeatures, seconds: number,
  delta: number, playing: boolean, reducedMotion: boolean, genre: string | null | undefined,
  intensity: number, variation: number, phraseProgress: number): PhraseMotionVariation {
  const target = playing && !reducedMotion
    ? targetPhraseMotionVariation(audio, seconds, genre, intensity, variation, phraseProgress) : zero();
  const factor = 1 - Math.exp(-clamp(delta, 0, 0.1) * (playing && !reducedMotion ? 6 : 14));
  for (const key of Object.keys(target) as (keyof PhraseMotionVariation)[]){
    state.value[key] += (target[key] - state.value[key]) * factor;
    if (Math.abs(state.value[key]) < 1e-8) state.value[key] = 0;
  }
  return state.value;
}
