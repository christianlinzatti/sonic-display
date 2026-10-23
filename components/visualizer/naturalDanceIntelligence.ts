import type { AudioFeatures } from "../../types/audio";

/** V228: low-amplitude additive body dynamics, never translates the model or modifies foot locks. */
export type NaturalDanceDynamics = {
  weightTransfer: number;
  hipCounter: number;
  shoulderCounter: number;
  torsoLean: number;
  armFollow: number;
  headFollow: number;
};
export type NaturalDanceDynamicsState = { values: NaturalDanceDynamics };
const zero = (): NaturalDanceDynamics => ({weightTransfer: 0, hipCounter: 0, shoulderCounter: 0, torsoLean: 0, armFollow: 0, headFollow: 0});
const finite = (v: number | undefined | null, fallback = 0) => typeof v === "number" && Number.isFinite(v) ? v : fallback;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, finite(v)));
export function createNaturalDanceDynamics(): NaturalDanceDynamicsState { return { values: zero() }; }
/** Beat-locked when confidence is sufficient; otherwise uses continuous time to avoid phase jumps. */
export function naturalDanceTargets(audio: AudioFeatures, seconds: number, genre: string | null | undefined, intensity: number): NaturalDanceDynamics {
  const rap = /rap|hip.?hop|trap|deutsch/i.test(genre ?? "");
  const hard = /hardstyle|hardtekk|hardcore/i.test(genre ?? "");
  const bpm = clamp(finite(audio.bpm, 110), 55, 220);
  const clockPhase = Math.max(0, finite(seconds)) * bpm / 60;
  const locked = finite(audio.phaseConfidence) >= 0.75 && audio.beatPhase != null && Number.isFinite(audio.beatPhase);
  // Avoid discontinuous phase correction by using locked phase only for beat accents.
  const phase = clockPhase * Math.PI * 2 * (rap ? 0.5 : 1);
  const accentPhase = (locked ? clamp(finite(audio.beatPhase), 0, 1) : clockPhase % 1) * Math.PI * 2;
  const energy = clamp(finite(audio.energyEnvelope), 0, 1);
  const power = clamp(intensity, 0, 1.5) * (0.25 + 0.75 * energy);
  const pulse = 0.72 + 0.28 * Math.max(0, Math.cos(accentPhase));
  const shift = Math.sin(phase - 0.25) * power * (rap ? 0.21 : hard ? 0.13 : 0.17);
  const delayed = Math.sin(phase - (rap ? 0.82 : 0.57)) * power;
  const hip = -shift * (rap ? 0.48 : 0.56);
  return {
    weightTransfer: shift,
    hipCounter: hip,
    shoulderCounter: clamp(-hip * 0.58 + delayed * 0.016, -0.1, 0.1),
    torsoLean: clamp(-shift * 0.32, -0.09, 0.09),
    armFollow: clamp(-delayed * 0.085 * pulse, -0.13, 0.13),
    headFollow: clamp(-delayed * 0.025, -0.04, 0.04),
  };
}
/** Continuous exponential blend: robust to 30/60/120 Hz and long frame gaps. */
export function updateNaturalDanceDynamics(state: NaturalDanceDynamicsState, audio: AudioFeatures, seconds: number, dt: number,
  playing: boolean, reducedMotion: boolean, genre: string | null | undefined, intensity: number): NaturalDanceDynamics {
  const target = playing && !reducedMotion ? naturalDanceTargets(audio, seconds, genre, intensity) : zero();
  const safeDt = clamp(dt, 0, 0.1);
  const response = playing && !reducedMotion ? 7 : 14;
  const blend = 1 - Math.exp(-safeDt * response);
  for (const k of Object.keys(target) as (keyof NaturalDanceDynamics)[]) {
    state.values[k] += (target[k] - state.values[k]) * blend;
    if (Math.abs(state.values[k]) < 1e-7) state.values[k] = 0;
  }
  return state.values;
}
