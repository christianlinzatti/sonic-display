"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { useMicrophoneAnalysis } from "@/hooks/useMicrophoneAnalysis";
import { useDelayedAudio } from "@/hooks/useDelayedAudio";
import { useBeatSync } from "@/hooks/useBeatSync";
import type { AudioAnalysisState } from "@/types/audio";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { useMusic } from "@/context/MusicContext";
import { useEstimatedBeat } from "@/hooks/useEstimatedBeat";
const Context = createContext<AudioAnalysisState | null>(null);
export function AudioAnalysisProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const { preferences } = useUiPreferences();
  const music = useMusic();
  const estimatedMetrics = useEstimatedBeat(music);
  const { metrics, active, error, beatEvents } = useMicrophoneAnalysis(enabled, { sensitivity: preferences.beatSensitivity, cooldownMs: preferences.beatCooldownMs });
  const sync = useBeatSync(beatEvents, music, preferences.beatSyncMode, preferences.beatSyncOffsetMs, active);
  const delayedMetrics = useDelayedAudio(metrics, enabled && active && preferences.beatSyncMode === "manual", Math.max(0, preferences.beatSyncOffsetMs));
  const selectedMetrics = enabled ? (active ? delayedMetrics : { ...estimatedMetrics, beat: false, beatStrength: 0, kick: 0 }) : estimatedMetrics;
  const value = useMemo(() => ({ enabled, active, error, metrics: selectedMetrics, beatEvents, setEnabled, ...sync }), [enabled, active, error, selectedMetrics, beatEvents, sync]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAudioAnalysis() { const value = useContext(Context); if (!value) throw new Error("useAudioAnalysis must be used within AudioAnalysisProvider"); return value; }
