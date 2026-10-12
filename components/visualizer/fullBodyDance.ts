import type { AudioFeatures } from "@/types/audio";
import type { AvatarDancePresetId } from "./avatarDancePresets";

export type FullBodyDanceState = {
  phase: number;
  weight: number;
  step: number;
  kick: number;
};

export function createFullBodyDanceState(): FullBodyDanceState {
  return { phase: 0, weight: 0, step: 0, kick: 0 };
}

/** Generates smooth lower-body targets. It deliberately uses the existing normalized audio model only. */
export function updateFullBodyDance(
  state: FullBodyDanceState,
  audio: AudioFeatures,
  elapsedSeconds: number,
  preset: AvatarDancePresetId = "auto",
): FullBodyDanceState {
  const bpm = Math.max(50, Math.min(220, audio.bpm ?? 120));
  const beatPhase = elapsedSeconds * bpm / 60;
  const groove = Math.sin(beatPhase * Math.PI * 2);
  const alternating = Math.sin(beatPhase * Math.PI);
  const hard = preset === "hardstyle" || preset === "robot" || preset === "rock-metal";
  const step = (0.045 + audio.bass * 0.06 + audio.kick * (hard ? 0.09 : 0.055)) * groove;
  const weight = (0.04 + audio.mids * 0.045) * alternating;
  const kick = audio.beat ? audio.beatStrength * (hard ? 0.11 : 0.065) : state.kick * 0.82;
  return { phase: beatPhase % 1, weight, step, kick };
}

export function getFullBodyDanceMotion(state: FullBodyDanceState, audio: AudioFeatures, intensity: number) {
  const legGroove = (state.step + state.kick) * intensity;
  const footStep = (state.step * 1.35 + audio.hiHat * 0.025) * intensity;
  const weightShift = state.weight * intensity;
  return { legGroove, footStep, weightShift };
}
