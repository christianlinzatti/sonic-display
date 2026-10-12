import type { AudioFeatures } from "@/types/audio";
import { getAvatarDancePreset, type AvatarDancePresetId } from "./avatarDancePresets";

export type AvatarAnimationState = {
  bodyBounce: number;
  headNod: number;
  bodySway: number;
  beatImpulse: number;
  intensity: number;
};

const genreProfiles: Record<string, { kick: number; sway: number; head: number }> = {
  hardstyle: { kick: 1, sway: 0.7, head: 1 },
  hardcore: { kick: 1, sway: 0.75, head: 1 },
  techno: { kick: 0.72, sway: 1, head: 0.35 },
  rock: { kick: 0.65, sway: 0.55, head: 0.85 },
  metal: { kick: 0.8, sway: 0.5, head: 1 },
  ambient: { kick: 0.15, sway: 0.2, head: 0.1 },
  default: { kick: 0.6, sway: 0.55, head: 0.45 },
};

/** Pure mapping from audio/playback state to animation targets. */
export function getAvatarAnimationState(
  audio: AudioFeatures,
  genre: string | null | undefined,
  isPlaying: boolean,
  reducedMotion: boolean,
  userIntensity = 1,
  elapsedSeconds = 0,
  dancePreset: AvatarDancePresetId = "auto",
): AvatarAnimationState {
  const profile = genreProfiles[genre?.toLowerCase() ?? ""] ?? genreProfiles.default;
  const preset = getAvatarDancePreset(dancePreset, genre);
  const enabled = isPlaying && !reducedMotion;
  const intensity = enabled ? Math.max(0, Math.min(2, userIntensity)) : 0;
  const kick = Math.max(audio.kick, audio.beat ? audio.beatStrength : 0);
  const beatImpulse = enabled ? kick * profile.kick * preset.multipliers.kick * intensity : 0;
  return {
    bodyBounce: enabled ? (audio.bass * 0.055 * preset.multipliers.bounce + beatImpulse * 0.075) * intensity : 0,
    headNod: enabled ? (audio.kick * 0.24 + (audio.beat ? audio.beatStrength * 0.18 : 0)) * profile.head * preset.multipliers.head * intensity : 0,
    bodySway: enabled ? Math.sin(elapsedSeconds * (audio.bpm && audio.bpm > 0 ? audio.bpm / 60 : 1.8)) * 0.12 * profile.sway * preset.multipliers.sway * intensity : 0,
    beatImpulse,
    intensity,
  };
}
