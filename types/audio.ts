export type AudioMetrics = { bass: number; mids: number; highs: number; volume: number; beat: number };
export type AudioAnalysisState = { enabled: boolean; active: boolean; error: string | null; metrics: AudioMetrics; setEnabled: (enabled: boolean) => void };
