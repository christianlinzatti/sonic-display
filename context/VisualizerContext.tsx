"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMusic } from "@/context/MusicContext";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import type { MusicGenre } from "@/types/animation";

export interface VisualizerState {
  track: ReturnType<typeof useMusic>["track"];
  isPlaying: boolean;
  genre: MusicGenre | null;
  genreStatus: ReturnType<typeof useMusic>["genreStatus"];
  genreSource: ReturnType<typeof useMusic>["genreSource"];
  genreMatchedTag: string | null;
  genreError: string | null;
  genreOverride: MusicGenre | null;
  setGenreOverride: (genre: MusicGenre | null) => void;
  audio: ReturnType<typeof useAudioAnalysis>["metrics"];
  audioActive: boolean;
  audioError: string | null;
  preferences: ReturnType<typeof useUiPreferences>["preferences"];
  updatePreferences: ReturnType<typeof useUiPreferences>["updatePreferences"];
}
const Context = createContext<VisualizerState | null>(null);
export function VisualizerProvider({ children }: { children: ReactNode }) {
  const music = useMusic();
  const audio = useAudioAnalysis();
  const ui = useUiPreferences();
  const value = useMemo<VisualizerState>(() => ({
    track: music.track, isPlaying: music.isPlaying, genre: music.genre,
    genreStatus: music.genreStatus, genreSource: music.genreSource,
    genreMatchedTag: music.genreMatchedTag, genreError: music.genreError,
    genreOverride: music.genreOverride, setGenreOverride: music.setGenreOverride,
    audio: audio.metrics, audioActive: audio.active, audioError: audio.error,
    preferences: ui.preferences, updatePreferences: ui.updatePreferences,
  }), [music.track, music.isPlaying, music.genre, music.genreStatus, music.genreSource,
    music.genreMatchedTag, music.genreError, music.genreOverride, music.setGenreOverride,
    audio.metrics, audio.active, audio.error, ui.preferences, ui.updatePreferences]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useVisualizer() {
  const value = useContext(Context);
  if (!value) throw new Error("useVisualizer must be used within VisualizerProvider");
  return value;
}
