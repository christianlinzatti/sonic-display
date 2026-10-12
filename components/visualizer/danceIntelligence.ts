import type { AudioFeatures } from "@/types/audio";

export type DanceIntelligenceState = {
  lastBeatAt: number;
  previousEnergy: number;
  buildUp: number;
  accent: number;
  variation: number;
  phrase: number;
};

export function createDanceIntelligenceState(): DanceIntelligenceState {
  return { lastBeatAt: -Infinity, previousEnergy: 0, buildUp: 0, accent: 0, variation: 0, phrase: 0 };
}

/** Adds musical phrasing and controlled variation without changing the underlying audio model. */
export function updateDanceIntelligence(
  state: DanceIntelligenceState,
  audio: AudioFeatures,
  elapsedSeconds: number,
  cooldownMs = 180,
): DanceIntelligenceState {
  const energyDelta = audio.energyEnvelope - state.previousEnergy;
  const rising = Math.max(0, energyDelta);
  const falling = Math.max(0, -energyDelta);
  const beatAllowed = elapsedSeconds * 1000 - state.lastBeatAt >= cooldownMs;
  const beatAccent = audio.beat && beatAllowed ? Math.min(1, audio.beatStrength * 1.25) : 0;
  const drop = audio.attack > 0.72 && audio.volume > 0.62 && audio.bass > 0.58 ? 1 : 0;
  const buildUp = Math.max(0, Math.min(1, state.buildUp * 0.94 + rising * 1.8 - falling * 0.55));
  const phrase = (elapsedSeconds * Math.max(0.35, (audio.bpm ?? 120) / 60) / 4) % 1;
  const variation = 0.78 + 0.22 * Math.sin(phrase * Math.PI * 2 + audio.highs * 1.7);

  return {
    lastBeatAt: beatAccent > 0 ? elapsedSeconds * 1000 : state.lastBeatAt,
    previousEnergy: audio.energyEnvelope,
    buildUp,
    accent: Math.max(beatAccent, drop),
    variation,
    phrase,
  };
}

export function getDanceIntelligenceMultipliers(state: DanceIntelligenceState) {
  return {
    kick: 1 + state.accent * 0.35 + state.buildUp * 0.18,
    head: 1 + state.accent * 0.28,
    body: 1 + state.buildUp * 0.25,
    arms: state.variation,
    chest: 1 + state.accent * 0.3 + state.buildUp * 0.15,
  };
}
