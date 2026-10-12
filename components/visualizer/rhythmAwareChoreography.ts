import type { AudioFeatures } from "@/types/audio";
import type { ChoreographyMove } from "./advancedDanceChoreography";

export type RhythmSequence = "baseline" | "driving" | "double-step" | "offbeat" | "freeform";
export interface RhythmChoreographyState {
  sequence: RhythmSequence;
  previousSequence: RhythmSequence;
  phrase: number;
  blend: number;
  lastReliableAt: number;
}
export interface RhythmChoreographyOutput {
  sequence: RhythmSequence;
  moveOptions: ChoreographyMove[] | null;
  blend: number;
  confidence: number;
}
const moves: Record<Exclude<RhythmSequence, "baseline">, ChoreographyMove[]> = {
  driving: ["alternating-kicks", "headbang-arms", "groove", "drop-hit"],
  "double-step": ["alternating-kicks", "robot-locks", "side-step", "drop-hit"],
  offbeat: ["side-step", "robot-locks", "groove", "flow"],
  freeform: ["flow", "side-step", "headbang-arms", "groove"],
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));
export function createRhythmChoreographyState(): RhythmChoreographyState {
  return { sequence: "baseline", previousSequence: "baseline", phrase: -1, blend: 1, lastReliableAt: -1 };
}
/** Select a dance vocabulary only at phrase boundaries to avoid jitter between frames. */
export function updateRhythmChoreography(
  state: RhythmChoreographyState,
  audio: AudioFeatures,
  elapsed: number,
  delta: number,
  active: boolean,
): RhythmChoreographyOutput {
  const confidence = clamp(audio.rhythmConfidence ?? 0);
  const reliable = active && confidence >= 0.62 && (audio.rhythmRepetitions ?? 0) >= 2;
  if (reliable) state.lastReliableAt = elapsed;
  const rhythm = reliable ? audio.learnedRhythm : "unknown";
  const candidate: RhythmSequence = rhythm === "four-on-floor" ? "driving"
    : rhythm === "double-accent" ? "double-step"
    : rhythm === "offbeat-accent" ? "offbeat"
    : rhythm === "variable" ? "freeform" : "baseline";
  // Only revert after a short grace period so a brief microphone dropout doesn't change the dance.
  const target = !active || (!reliable && elapsed - state.lastReliableAt > 3) ? "baseline" : reliable ? candidate : state.sequence;
  const bpm = Math.max(55, Math.min(220, audio.bpm ?? 120));
  const phrase = Math.floor(elapsed * bpm / 60 / 8);
  if (phrase !== state.phrase) {
    state.phrase = phrase;
    if (target !== state.sequence) {
      state.previousSequence = state.sequence;
      state.sequence = target;
      state.blend = 0;
    }
  }
  state.blend = Math.min(1, state.blend + Math.max(0, delta) * 2.5);
  return { sequence: state.sequence, moveOptions: state.sequence === "baseline" ? null : moves[state.sequence], blend: state.blend, confidence };
}
