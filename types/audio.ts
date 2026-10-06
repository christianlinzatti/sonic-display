/** Normalized microphone-derived values. Every continuous value is in the 0..1 range. */
export interface AudioFeatures {
  bass: number;
  mids: number;
  highs: number;
  volume: number;
  beat: boolean;
  beatStrength: number;
}

/** Backward-compatible alias for existing visualizer components. */
export type AudioMetrics = AudioFeatures;
export type AudioAnalysisState = { enabled: boolean; active: boolean; error: string | null; metrics: AudioFeatures; setEnabled: (enabled: boolean) => void };
