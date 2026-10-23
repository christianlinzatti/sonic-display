import type { AudioFeatures } from "../../types/audio";

/** V113: low-amplitude, phase-coherent secondary motion. All values are radians.
 * Never changes world position or root transform, preserving authored clips and foot IK.
 */
export interface NaturalDanceCoordination {
  torsoTwist: number;
  counterArm: number;
  hipCounter: number;
  headCounter: number;
  kneeFollow: number;
}
export const ZERO_NATURAL_DANCE: NaturalDanceCoordination = {
  torsoTwist: 0, counterArm: 0, hipCounter: 0, headCounter: 0, kneeFollow: 0
};
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : 0));
export function computeNaturalDanceCoordination(
  audio: AudioFeatures,
  seconds: number,
  isPlaying: boolean,
  reducedMotion: boolean,
  genre: string | undefined,
  intensity: number
): NaturalDanceCoordination {
  if (!isPlaying || reducedMotion) return { ...ZERO_NATURAL_DANCE };
  const bpm = clamp(audio.bpm || 100, 55, 220);
  const phase = seconds * bpm / 60 * Math.PI * 2;
  const rap = /rap|hip.?hop|trap|deutsch/i.test(genre || "");
  const hard = /hardstyle|hardtekk|hardcore/i.test(genre || "");
  const groove = Math.sin(phase * (rap ? 0.5 : 1));
  const follow = Math.sin(phase * (rap ? 0.5 : 1) - 0.42);
  const energy = clamp(audio.energyEnvelope ?? 0.4, 0, 1);
  const scale = clamp(intensity, 0, 1.5) * (0.35 + energy * 0.65) * (rap ? 1 : hard ? 0.78 : 0.85);
  const sway = groove * 0.07 * scale;
  return {
    torsoTwist: sway,
    hipCounter: -sway * 0.55,
    counterArm: -follow * 0.085 * scale,
    headCounter: -Math.sin(phase * (rap ? 0.5 : 1) - 0.62) * 0.022 * scale,
    kneeFollow: Math.max(0, follow) * 0.042 * scale
  };
}
