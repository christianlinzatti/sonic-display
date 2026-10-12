import type { AudioFeatures } from "@/types/audio";
import type { AvatarExpression } from "./avatarExpressionEngine";
import type { AvatarDancePresetId } from "./avatarDancePresets";
import type { DanceIntelligenceState } from "./danceIntelligence";
import type { MusicalStructure } from "./musicalStructureEngine";

export type PerformanceSection = "intro" | "verse" | "chorus" | "drop" | "break" | "outro";
export type PerformancePattern =
  | "soft-groove"
  | "steady-groove"
  | "kick-drive"
  | "drop-hit"
  | "headbang"
  | "mechanical"
  | "flow";

export type PerformanceDirectorState = {
  section: PerformanceSection;
  previousSection: PerformanceSection;
  pattern: PerformancePattern;
  previousPattern: PerformancePattern;
  sectionSince: number;
  patternSince: number;
  phraseIndex: number;
};

export type PerformanceDirectorOutput = {
  section: PerformanceSection;
  pattern: PerformancePattern;
  previousPattern: PerformancePattern;
  transitionBlend: number;
  performanceIntensity: number;
  danceMultiplier: number;
  expressionIntensity: number;
  poseImpulse: number;
  expressionBias: AvatarExpression;
  musicalPhase: MusicalStructure["phase"];
  buildUp: number;
  dropStrength: number;
  phraseProgress: number;
};

const MIN_SECTION_SECONDS = 2.8;
const MIN_PATTERN_SECONDS = 2.2;

export function createPerformanceDirectorState(): PerformanceDirectorState {
  return {
    section: "intro",
    previousSection: "intro",
    pattern: "soft-groove",
    previousPattern: "soft-groove",
    sectionSince: 0,
    patternSince: 0,
    phraseIndex: -1,
  };
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function genreKey(genre?: string | null) {
  return genre?.toLowerCase() ?? "";
}

function isHardGenre(genre: string) {
  return /hardstyle|hardcore|hardtekk|metal/.test(genre);
}

function choosePattern(genre: string, section: PerformanceSection, phraseIndex: number): PerformancePattern {
  const variants: Record<PerformanceSection, PerformancePattern[]> = {
    intro: ["soft-groove", "flow"],
    verse: ["steady-groove", "flow", "kick-drive"],
    chorus: ["steady-groove", "kick-drive", "headbang"],
    drop: isHardGenre(genre) ? ["drop-hit", "kick-drive", "headbang"] : ["drop-hit", "steady-groove", "mechanical"],
    break: ["flow", "soft-groove"],
    outro: ["flow", "soft-groove"],
  };
  const choices = variants[section];
  return choices[Math.abs(phraseIndex) % choices.length];
}

function classifySection(audio: AudioFeatures, intelligence: DanceIntelligenceState, elapsedSeconds: number): PerformanceSection {
  const energy = clamp(audio.energyEnvelope * 0.55 + audio.volume * 0.3 + audio.bass * 0.15);
  const recentDrop = audio.attack > 0.72 && audio.volume > 0.62 && audio.bass > 0.58;

  if (elapsedSeconds < 4 && energy < 0.55) return "intro";
  if (recentDrop || (intelligence.accent > 0.86 && energy > 0.68)) return "drop";
  if (energy < 0.22 && intelligence.buildUp < 0.2) return "break";
  if (energy > 0.68 || intelligence.buildUp > 0.72) return "chorus";
  return "verse";
}

function targetExpression(section: PerformanceSection, genre: string, intensity: number): AvatarExpression {
  if (section === "break" || section === "intro" || section === "outro") return "relaxed";
  if (section === "drop" && isHardGenre(genre)) return "aggressive";
  if (section === "chorus" && intensity > 0.72) return "euphoric";
  return /ambient|chill|classical/.test(genre) ? "relaxed" : "cool";
}

/**
 * Coordinates the existing dance and expression layers without owning either one.
 * Musical sections are inferred from normalized audio energy because Spotify playback
 * metadata does not guarantee section-level timing. Decisions are stateful and phrase-aware.
 */
export function updatePerformanceDirector(
  state: PerformanceDirectorState,
  audio: AudioFeatures,
  genre: string | null | undefined,
  intelligence: DanceIntelligenceState,
  structure: MusicalStructure,
  elapsedSeconds: number,
  isPlaying: boolean,
  reducedMotion: boolean,
  dancePreset: AvatarDancePresetId = "auto",
): PerformanceDirectorOutput {
  if (!isPlaying || reducedMotion) {
    return {
      section: "break",
      pattern: "flow",
      previousPattern: state.pattern,
      transitionBlend: 1,
      performanceIntensity: 0,
      danceMultiplier: 0,
      expressionIntensity: 0,
      poseImpulse: 0,
      expressionBias: "neutral",
      musicalPhase: structure.phase,
      buildUp: structure.buildUp,
      dropStrength: structure.dropStrength,
      phraseProgress: structure.phraseProgress,
    };
  }

  const key = genreKey(genre);
  const bpm = Math.max(50, Math.min(220, audio.bpm ?? 120));
  const beatsPerPhrase = 8;
  const phraseIndex = Math.floor((elapsedSeconds * bpm) / 60 / beatsPerPhrase);
  const candidateSection = structure.phase === "build-up" ? "chorus" : structure.phase === "drop" ? "drop" : structure.phase === "break" ? "break" : classifySection(audio, intelligence, elapsedSeconds);
  const sectionAge = elapsedSeconds - state.sectionSince;
  const canSwitchSection = sectionAge >= MIN_SECTION_SECONDS || candidateSection === "drop";
  const section = canSwitchSection ? candidateSection : state.section;
  const sectionChanged = section !== state.section;

  if (sectionChanged) {
    state.previousSection = state.section;
    state.section = section;
    state.sectionSince = elapsedSeconds;
  }

  const phraseChanged = phraseIndex !== state.phraseIndex;
  if (phraseChanged) state.phraseIndex = phraseIndex;

  const candidatePattern = choosePattern(key, section, phraseIndex);
  const patternAge = elapsedSeconds - state.patternSince;
  if (candidatePattern !== state.pattern && (sectionChanged || (phraseChanged && patternAge >= MIN_PATTERN_SECONDS))) {
    state.previousPattern = state.pattern;
    state.pattern = candidatePattern;
    state.patternSince = elapsedSeconds;
  }

  const energy = clamp(audio.energyEnvelope * 0.55 + audio.volume * 0.3 + audio.bass * 0.15);
  const sectionBase: Record<PerformanceSection, number> = {
    intro: 0.55,
    verse: 0.82,
    chorus: 1.0,
    drop: 1.16,
    break: 0.3,
    outro: 0.48,
  };
  const patternBase: Record<PerformancePattern, number> = {
    "soft-groove": 0.72,
    "steady-groove": 0.9,
    "kick-drive": 1.05,
    "drop-hit": 1.22,
    headbang: 1.08,
    mechanical: 0.98,
    flow: 0.62,
  };

  const dramaticBoost = 1 + structure.buildUp * 0.18 + structure.dropStrength * 0.28;
  const target = clamp(sectionBase[state.section] * patternBase[state.pattern] * (0.72 + energy * 0.5) * dramaticBoost, 0, 1.35);
  const transitionAge = Math.max(0, elapsedSeconds - state.patternSince);
  const transitionBlend = clamp(transitionAge / 0.9);
  const performanceIntensity = target * (0.72 + transitionBlend * 0.28);
  const presetBoost = dancePreset === "ambient" ? 0.82 : dancePreset === "robot" ? 1.05 : 1;
  const dropImpulse = state.section === "drop" && audio.beat ? audio.beatStrength * 0.35 + structure.dropStrength * 0.2 : structure.release * 0.08;

  return {
    section: state.section,
    pattern: state.pattern,
    previousPattern: state.previousPattern,
    transitionBlend,
    performanceIntensity,
    danceMultiplier: performanceIntensity * presetBoost,
    expressionIntensity: clamp(0.72 + performanceIntensity * 0.38),
    poseImpulse: clamp(dropImpulse + intelligence.accent * 0.18, 0, 0.5),
    expressionBias: targetExpression(state.section, key, energy),
    musicalPhase: structure.phase,
    buildUp: structure.buildUp,
    dropStrength: structure.dropStrength,
    phraseProgress: structure.phraseProgress,
  };
}
