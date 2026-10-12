import type { AudioFeatures } from "@/types/audio";

export type MusicalPhase = "intro" | "verse" | "build-up" | "drop" | "break" | "outro";

export type MusicalStructureState = {
  phase: MusicalPhase;
  previousPhase: MusicalPhase;
  phaseSince: number;
  energy: number;
  previousEnergy: number;
  rising: number;
  falling: number;
  buildUp: number;
  dropStrength: number;
  release: number;
  lastDropAt: number;
  phraseIndex: number;
  phraseProgress: number;
};

export type MusicalStructure = {
  phase: MusicalPhase;
  previousPhase: MusicalPhase;
  phraseIndex: number;
  phraseProgress: number;
  energy: number;
  energyTrend: number;
  buildUp: number;
  dropStrength: number;
  release: number;
  phaseProgress: number;
};

const MIN_PHASE_SECONDS = 2.4;
const DROP_COOLDOWN_SECONDS = 3.5;

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function createMusicalStructureState(): MusicalStructureState {
  return {
    phase: "intro",
    previousPhase: "intro",
    phaseSince: 0,
    energy: 0,
    previousEnergy: 0,
    rising: 0,
    falling: 0,
    buildUp: 0,
    dropStrength: 0,
    release: 0,
    lastDropAt: -Infinity,
    phraseIndex: -1,
    phraseProgress: 0,
  };
}

function selectPhase(
  state: MusicalStructureState,
  audio: AudioFeatures,
  elapsedSeconds: number,
  energy: number,
  trend: number,
  phraseIndex: number,
) {
  const phaseAge = elapsedSeconds - state.phaseSince;
  const canChange = phaseAge >= MIN_PHASE_SECONDS;
  const afterDrop = elapsedSeconds - state.lastDropAt;
  const dropCandidate =
    afterDrop >= DROP_COOLDOWN_SECONDS &&
    energy > 0.58 &&
    audio.attack > 0.7 &&
    audio.bass > 0.55 &&
    (state.buildUp > 0.42 || trend > 0.08 || audio.beatStrength > 0.82);

  if (dropCandidate) return "drop" as const;
  if (!canChange) return state.phase;
  if (state.phase === "drop" && afterDrop < 1.8) return "drop";
  if (state.phase === "drop" && energy < 0.4) return "break";
  if (state.phase === "drop") return energy > 0.65 ? "verse" : "break";
  if (state.phase === "build-up" && state.buildUp < 0.3 && trend < -0.02) return energy > 0.58 ? "chorus" : "verse";
  if (state.phase === "break") return energy > 0.48 ? "verse" : "break";
  if (state.phase === "intro") return elapsedSeconds < 12 && energy < 0.55 ? "intro" : "verse";
  if (state.phase === "outro") return "outro";
  if (state.buildUp > 0.58 && trend > 0.025) return "build-up";
  if (energy < 0.2 && trend <= 0) return "break";
  if (energy > 0.7 || (phraseIndex % 4 === 3 && energy > 0.55)) return "chorus";
  return "verse";
}

export function updateMusicalStructure(
  state: MusicalStructureState,
  audio: AudioFeatures,
  elapsedSeconds: number,
  isPlaying: boolean,
  reducedMotion: boolean,
): MusicalStructureState {
  if (!isPlaying || reducedMotion) return createMusicalStructureState();

  const energy = clamp(audio.energyEnvelope * 0.55 + audio.volume * 0.3 + audio.bass * 0.15);
  const trend = energy - state.energy;
  const rising = clamp(Math.max(0, trend) * 5.5);
  const falling = clamp(Math.max(0, -trend) * 4.5);
  const buildUp = clamp(state.buildUp * 0.965 + rising * 0.09 - falling * 0.07);
  const bpm = Math.max(50, Math.min(220, audio.bpm ?? 120));
  const beats = elapsedSeconds * bpm / 60;
  const phraseIndex = Math.floor(beats / 8);
  const phraseProgress = (beats % 8) / 8;

  const next = { ...state, previousEnergy: state.energy, energy, rising, falling, buildUp, phraseIndex, phraseProgress, dropStrength: state.dropStrength * 0.78, release: state.release * 0.9 };
  const phase = selectPhase(next, audio, elapsedSeconds, energy, trend, phraseIndex);

  if (phase !== state.phase) {
    next.previousPhase = state.phase;
    next.phase = phase;
    next.phaseSince = elapsedSeconds;
  }

  if (phase === "drop" && state.phase !== "drop") {
    next.lastDropAt = elapsedSeconds;
    next.dropStrength = clamp(audio.beatStrength * 0.8 + audio.attack * 0.2);
    next.release = 1;
  } else if (state.phase === "drop") {
    next.release = clamp(1 - (elapsedSeconds - state.phaseSince) / 1.8);
  }

  return next;
}

export function getMusicalStructure(state: MusicalStructureState, elapsedSeconds: number): MusicalStructure {
  const phaseDuration = Math.max(0.001, elapsedSeconds - state.phaseSince);
  const typicalDuration = state.phase === "drop" ? 8 : state.phase === "build-up" ? 10 : 6;
  return {
    phase: state.phase,
    previousPhase: state.previousPhase,
    phraseIndex: state.phraseIndex,
    phraseProgress: state.phraseProgress,
    energy: state.energy,
    energyTrend: state.rising - state.falling,
    buildUp: state.buildUp,
    dropStrength: state.dropStrength,
    release: state.release,
    phaseProgress: clamp(phaseDuration / typicalDuration),
  };
}
