/** Normalized microphone-derived values. Every continuous value is in the 0..1 range. */
export interface AudioFeatures {
  bass: number;
  mids: number;
  highs: number;
  volume: number;
  beat: boolean;
  beatStrength: number;
  bpm: number | null;
  /** 0..1 confidence of microphone-derived BPM (optional for synthetic sources). */
  bpmConfidence?: number;
  /** Normalized phase within the microphone-locked beat period, or null before lock. */
  beatPhase?: number | null;
  phaseConfidence?: number;
  phaseLocked?: boolean;
  /** Predicted pre-kick movement envelope, 0..1; microphone phase-lock only. */
  kickAnticipation?: number;
  timeToNextKickMs?: number | null;
  /** Relative microphone onset class (not an instrument classifier). */
  kickAccent?: "none" | "soft" | "normal" | "strong";
  /** Decaying accent envelope from a measured onset, 0..1. */
  kickAccentIntensity?: number;
  /** Microphone onset timing heuristic: steady, double, syncopated, or unknown. */
  kickPattern?: "unknown" | "steady" | "double" | "syncopated";
  kickPatternConfidence?: number;
  learnedRhythm?: "unknown" | "four-on-floor" | "double-accent" | "offbeat-accent" | "variable";
  rhythmConfidence?: number;
  rhythmPhrasePosition?: number;
  rhythmPhraseAccent?: number;
  rhythmRepetitions?: number;
  kickPatternAccent?: number;
  kick: number;
  snare: number;
  hiHat: number;
  energyEnvelope: number;
  attack: number;
  decay: number;
}

/** Backward-compatible alias for existing visualizer components. */
export type AudioMetrics = AudioFeatures;
export interface BeatEvent { at: number; strength: number; }
export type AudioAnalysisState = { syncOffsetMs: number; syncConfidence: number; syncStatus: string; enabled: boolean; active: boolean; error: string | null; metrics: AudioFeatures; beatEvents: BeatEvent[]; setEnabled: (enabled: boolean) => void };
