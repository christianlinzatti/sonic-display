import type { AudioFeatures } from "@/types/audio";

export type MotionPersonality = "hardstyle" | "hardcore" | "techno" | "rock" | "metal" | "ambient" | "robot" | "default";
export type NaturalMotionState = {
  energy: number;
  anticipation: number;
  followThrough: number;
  hipSway: number;
  shoulderRoll: number;
  headLag: number;
  weightShift: number;
  personality: MotionPersonality;
};

const profiles: Record<MotionPersonality, { groove: number; anticipation: number; follow: number; head: number; stiffness: number }> = {
  hardstyle: { groove: 0.65, anticipation: 0.9, follow: 0.5, head: 0.9, stiffness: 0.55 },
  hardcore: { groove: 0.55, anticipation: 1, follow: 0.4, head: 1, stiffness: 0.75 },
  techno: { groove: 1, anticipation: 0.45, follow: 0.9, head: 0.35, stiffness: 0.2 },
  rock: { groove: 0.6, anticipation: 0.55, follow: 0.9, head: 0.8, stiffness: 0.3 },
  metal: { groove: 0.45, anticipation: 0.75, follow: 0.65, head: 1, stiffness: 0.45 },
  ambient: { groove: 0.45, anticipation: 0.15, follow: 1, head: 0.15, stiffness: 0.05 },
  robot: { groove: 0.4, anticipation: 0.35, follow: 0.1, head: 0.25, stiffness: 1 },
  default: { groove: 0.7, anticipation: 0.45, follow: 0.65, head: 0.45, stiffness: 0.25 },
};

export function resolveMotionPersonality(genre?: string | null, dancePreset?: string): MotionPersonality {
  const value = `${dancePreset ?? ""} ${genre ?? ""}`.toLowerCase();
  if (/robot|mechanical/.test(value)) return "robot";
  if (/hardcore/.test(value)) return "hardcore";
  if (/hardstyle|hard.?tekk/.test(value)) return "hardstyle";
  if (/metal/.test(value)) return "metal";
  if (/rock/.test(value)) return "rock";
  if (/techno/.test(value)) return "techno";
  if (/ambient|chill|classical/.test(value)) return "ambient";
  return "default";
}

export function createNaturalMotionState(personality: MotionPersonality = "default"): NaturalMotionState {
  return { energy: 0, anticipation: 0, followThrough: 0, hipSway: 0, shoulderRoll: 0, headLag: 0, weightShift: 0, personality };
}

/** Stateful, frame-rate-independent motion shaping. No random values are generated per frame. */
export function updateNaturalMotion(
  previous: NaturalMotionState,
  audio: AudioFeatures,
  genre: string | null | undefined,
  elapsedSeconds: number,
  deltaSeconds: number,
  isPlaying: boolean,
  reducedMotion: boolean,
  dancePreset?: string,
): NaturalMotionState {
  const personality = resolveMotionPersonality(genre, dancePreset);
  const profile = profiles[personality];
  const enabled = isPlaying && !reducedMotion;
  const energyTarget = enabled ? Math.max(0, Math.min(1, audio.energyEnvelope * 0.65 + audio.volume * 0.2 + audio.bass * 0.15)) : 0;
  const attack = enabled ? Math.max(audio.attack, audio.kick * 0.72, audio.beat ? audio.beatStrength * 0.65 : 0) : 0;
  const beatPhase = elapsedSeconds * (audio.bpm && audio.bpm > 0 ? audio.bpm / 60 : 1.8) * Math.PI * 2;
  const smooth = (rate: number) => 1 - Math.exp(-Math.max(0, deltaSeconds) * rate);
  const energy = previous.energy + (energyTarget - previous.energy) * smooth(energyTarget > previous.energy ? 3.5 : 1.8);
  const anticipationTarget = enabled ? Math.max(0, Math.min(1, attack * profile.anticipation + energy * 0.18)) : 0;
  const followTarget = enabled ? Math.sin(beatPhase - 0.55) * energy * profile.follow * 0.5 : 0;
  const swayTarget = enabled ? Math.sin(beatPhase - 0.3) * energy * profile.groove * 0.16 : 0;
  const shoulderTarget = enabled ? Math.sin(beatPhase - 0.8) * energy * profile.follow * 0.1 : 0;
  const headLagTarget = enabled ? Math.sin(beatPhase - 1.05) * energy * profile.head * (1 - profile.stiffness) * 0.12 : 0;
  const weightTarget = enabled ? Math.sin(beatPhase - 0.4) * energy * profile.groove * 0.45 : 0;
  return {
    personality,
    energy,
    anticipation: previous.anticipation + (anticipationTarget - previous.anticipation) * smooth(12),
    followThrough: previous.followThrough + (followTarget - previous.followThrough) * smooth(7),
    hipSway: previous.hipSway + (swayTarget - previous.hipSway) * smooth(5.5),
    shoulderRoll: previous.shoulderRoll + (shoulderTarget - previous.shoulderRoll) * smooth(6),
    headLag: previous.headLag + (headLagTarget - previous.headLag) * smooth(4),
    weightShift: previous.weightShift + (weightTarget - previous.weightShift) * smooth(5),
  };
}
