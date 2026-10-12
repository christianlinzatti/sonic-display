import type { AudioFeatures } from "@/types/audio";
import type { PerformancePattern, PerformanceSection } from "./performanceDirector";

export type ChoreographyMove = "groove" | "alternating-kicks" | "headbang-arms" | "robot-locks" | "side-step" | "drop-hit" | "flow";
export type ChoreographyState = {
  phraseIndex: number;
  moveIndex: number;
  previousMove: ChoreographyMove;
  currentMove: ChoreographyMove;
  transition: number;
  lastAccentAt: number;
  recentMoves: ChoreographyMove[];
  /** Song-session memory: long-term move counts and section recurrence. */
  moveHistory: ChoreographyMove[];
  moveCounts: Partial<Record<ChoreographyMove, number>>;
  dropCount: number;
  lastSection: PerformanceSection;
  previousEnergy: number;
  energyTrend: number;
};
export type ChoreographyOutput = {
  move: ChoreographyMove;
  previousMove: ChoreographyMove;
  transition: number;
  armAccent: number;
  legAccent: number;
  hipAccent: number;
  headAccent: number;
  poseAccent: number;
  phase: number;
  adaptiveIntensity: number;
  novelty: number;
};

const sequences: Record<string, ChoreographyMove[]> = {
  hard: ["alternating-kicks", "headbang-arms", "drop-hit", "side-step", "alternating-kicks", "groove"],
  techno: ["groove", "side-step", "robot-locks", "groove", "flow"],
  metal: ["headbang-arms", "groove", "headbang-arms", "alternating-kicks", "drop-hit"],
  robot: ["robot-locks", "side-step", "robot-locks", "drop-hit", "groove"],
  ambient: ["flow", "groove", "flow", "side-step"],
  default: ["groove", "side-step", "alternating-kicks", "flow", "drop-hit"],
};

export function createChoreographyState(): ChoreographyState {
  return { phraseIndex: -1, moveIndex: 0, previousMove: "groove", currentMove: "groove", transition: 1, lastAccentAt: -10, recentMoves: [], moveHistory: [], moveCounts: {}, dropCount: 0, lastSection: "intro", previousEnergy: 0, energyTrend: 0 };
}

function clamp(value: number, min = 0, max = 1) { return Math.max(min, Math.min(max, value)); }
function family(genre?: string | null, preset?: string) {
  const key = `${preset ?? ""} ${genre ?? ""}`.toLowerCase();
  if (/robot|mechanical/.test(key)) return "robot";
  if (/hardstyle|hardcore|hard.?tekk/.test(key)) return "hard";
  if (/metal|rock/.test(key)) return "metal";
  if (/techno|house|trance/.test(key)) return "techno";
  if (/ambient|chill|classical/.test(key)) return "ambient";
  return "default";
}

/** Phrase-level choreography selector. It changes on musical phrases, never randomly per frame. */
export function updateDanceChoreography(
  state: ChoreographyState,
  audio: AudioFeatures,
  genre: string | null | undefined,
  preset: string | undefined,
  section: PerformanceSection,
  pattern: PerformancePattern,
  elapsedSeconds: number,
  deltaSeconds: number,
  isPlaying: boolean,
  reducedMotion: boolean,
  tuning: { aggression: number; variation: number; style: "smooth" | "balanced" | "sharp" } = { aggression: 0.5, variation: 0.5, style: "balanced" },
  rhythmMoves: ChoreographyMove[] | null = null,
): ChoreographyOutput {
  const bpm = Math.max(50, Math.min(220, audio.bpm ?? 120));
  const beats = elapsedSeconds * bpm / 60;
  const phraseIndex = Math.floor(beats / 8);
  const key = family(genre, preset);
  const options = rhythmMoves && section !== "break" && section !== "drop" ? rhythmMoves : section === "break" ? ["flow", "groove"] as ChoreographyMove[]
    : section === "drop" ? (key === "hard" || key === "metal" ? ["drop-hit", "alternating-kicks", "headbang-arms"] as ChoreographyMove[] : ["drop-hit", "robot-locks", "side-step"] as ChoreographyMove[])
    : sequences[key];

  const energyNow = clamp(audio.energyEnvelope * 0.55 + audio.volume * 0.25 + audio.bass * 0.2);
  // Smooth trend tracking: prefer building movements when energy rises and avoid moves used in recent phrases.
  state.energyTrend += (energyNow - state.previousEnergy - state.energyTrend) * Math.min(1, Math.max(0, deltaSeconds) * 2.5);
  state.previousEnergy += (energyNow - state.previousEnergy) * Math.min(1, Math.max(0, deltaSeconds) * 1.8);
  // Remember recurring drops across the current playback session. A repeated drop
  // keeps its energetic signature, but rotates the selected move when possible.
  const enteredDrop = section === "drop" && state.lastSection !== "drop";
  if (enteredDrop) state.dropCount += 1;
  state.lastSection = section;
  if (phraseIndex !== state.phraseIndex && isPlaying && !reducedMotion) {
    state.phraseIndex = phraseIndex;
    const ranked = options.map((move, index) => {
      const recentIndex = state.recentMoves.lastIndexOf(move);
      const variation = clamp(tuning.variation);
      const recentPenalty = (recentIndex < 0 ? 0 : recentIndex === state.recentMoves.length - 1 ? 5 : 2.5) * (0.25 + variation * 1.5);
      const lifetimeCount = state.moveCounts[move] ?? 0;
      const longTermPenalty = Math.min(3.5, lifetimeCount * 0.55) * (0.25 + variation * 1.5);
      const aggressiveBonus = ["drop-hit", "alternating-kicks", "headbang-arms", "robot-locks"].includes(move) ? clamp(tuning.aggression) * 2.2 : (1 - clamp(tuning.aggression)) * 1.3;
      const energyBonus = state.energyTrend > 0.025 && ["drop-hit", "alternating-kicks", "headbang-arms"].includes(move) ? 1.2 : 0;
      const calmBonus = state.energyTrend < -0.025 && ["flow", "groove", "side-step"].includes(move) ? 1.0 : 0;
      // The same drop can recur recognizably, while a stable offset adds variation.
      const dropVariation = section === "drop" ? Math.abs((state.dropCount + index * 2 + key.length) % 5) * 0.12 : 0;
      const stableTieBreak = Math.abs(phraseIndex + key.length * 3 + (section === "chorus" ? 2 : 0) + index * 5) % 7 / 10;
      return { move, score: recentPenalty + longTermPenalty + dropVariation - energyBonus - calmBonus - aggressiveBonus + stableTieBreak * (0.4 + variation * 1.2) };
    }).sort((a, b) => a.score - b.score);
    const next = ranked[0]?.move ?? options[0];
    const index = Math.max(0, options.indexOf(next));
    if (next !== state.currentMove) {
      state.previousMove = state.currentMove;
      state.currentMove = next;
      state.moveIndex = index;
      state.transition = 0;
      state.recentMoves.push(next);
      state.moveHistory.push(next);
      state.moveCounts[next] = (state.moveCounts[next] ?? 0) + 1;
      if (state.recentMoves.length > 4) state.recentMoves.shift();
      // Keep a bounded history for long sessions while retaining per-move counts.
      if (state.moveHistory.length > 96) state.moveHistory.shift();
    }
  }
  const transitionRate = reducedMotion || !isPlaying ? 8 : tuning.style === "sharp" ? 5 : tuning.style === "smooth" ? 1.4 : 2.4;
  state.transition = Math.min(1, state.transition + Math.max(0, deltaSeconds) * transitionRate);
  const transition = state.transition * state.transition * (3 - 2 * state.transition);
  const phase = beats * Math.PI * 2;
  const energy = energyNow;
  const adaptiveIntensity = clamp(0.72 + energy * 0.42 + Math.max(-0.12, Math.min(0.12, state.energyTrend * 1.4)), 0.55, 1.15);
  const novelty = state.recentMoves.length === 0 ? 1 : (state.recentMoves[state.recentMoves.length - 1] === state.currentMove ? 0.72 : 1);
  const beatHit = audio.beat && elapsedSeconds - state.lastAccentAt > 0.12;
  if (beatHit) state.lastAccentAt = elapsedSeconds;
  const accent = isPlaying && !reducedMotion && beatHit ? clamp(audio.beatStrength * 0.8 + audio.kick * 0.35) : 0;
  const active = isPlaying && !reducedMotion ? 1 : 0;
  let armAccent = 0, legAccent = 0, hipAccent = 0, headAccent = 0, poseAccent = 0;
  switch (state.currentMove) {
    case "alternating-kicks": legAccent = Math.sin(phase * 0.5) * 0.14 * energy; armAccent = Math.sin(phase * 0.5 + Math.PI / 2) * 0.09 * energy; hipAccent = Math.sin(phase * 0.5) * 0.07; break;
    case "headbang-arms": headAccent = Math.sin(phase) * 0.13 * energy; armAccent = Math.sin(phase + Math.PI / 2) * 0.15 * energy; hipAccent = Math.sin(phase * 0.5) * 0.04; break;
    case "robot-locks": armAccent = Math.sin(phase) * 0.07 * energy; legAccent = Math.sign(Math.sin(phase)) * 0.055 * energy; poseAccent = accent * 0.16; break;
    case "side-step": legAccent = Math.sin(phase * 0.5) * 0.075 * energy; hipAccent = Math.sin(phase * 0.5) * 0.1 * energy; armAccent = Math.sin(phase * 0.5 + 0.7) * 0.055 * energy; break;
    case "drop-hit": legAccent = Math.sin(phase * 0.5) * 0.08 * energy; armAccent = Math.sin(phase) * 0.1 * energy; headAccent = Math.sin(phase) * 0.07 * energy; poseAccent = accent * 0.28; break;
    case "flow": armAccent = Math.sin(phase * 0.5) * 0.045 * energy; hipAccent = Math.sin(phase * 0.25) * 0.07 * energy; headAccent = Math.sin(phase * 0.5 - 0.5) * 0.035 * energy; break;
    default: armAccent = Math.sin(phase) * 0.065 * energy; legAccent = Math.sin(phase * 0.5) * 0.055 * energy; hipAccent = Math.sin(phase * 0.5) * 0.06 * energy;
  }
  const blend = active * transition;
  return {
    move: state.currentMove, previousMove: state.previousMove, transition,
    armAccent: armAccent * blend * adaptiveIntensity, legAccent: legAccent * blend * adaptiveIntensity, hipAccent: hipAccent * blend * adaptiveIntensity,
    headAccent: headAccent * blend * adaptiveIntensity, poseAccent: poseAccent * blend * adaptiveIntensity, phase,
    adaptiveIntensity, novelty,
  };
}
