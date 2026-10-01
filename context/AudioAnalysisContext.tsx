"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { useMicrophoneAnalysis } from "@/hooks/useMicrophoneAnalysis";
import type { AudioAnalysisState } from "@/types/audio";
const Context = createContext<AudioAnalysisState | null>(null);
export function AudioAnalysisProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const { metrics, active, error } = useMicrophoneAnalysis(enabled);
  const value = useMemo(() => ({ enabled, active, error, metrics, setEnabled }), [enabled, active, error, metrics]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAudioAnalysis() { const value = useContext(Context); if (!value) throw new Error("useAudioAnalysis must be used within AudioAnalysisProvider"); return value; }
