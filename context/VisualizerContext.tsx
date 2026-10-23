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
  genreFusion: ReturnType<typeof useMusic>["genreFusion"];
  genreStatus: ReturnType<typeof useMusic>["genreStatus"];
  genreSource: ReturnType<typeof useMusic>["genreSource"];
  genreMatchedTag: string | null;
  genreError: string | null;
  genreOverride: MusicGenre | null;
  artistSuggestion:{genre:MusicGenre;votes:number;total:number}|null;
  genreMemoryCount:number;
  genreMemory:ReturnType<typeof useMusic>["genreMemory"];
  replaceGenreMemory:ReturnType<typeof useMusic>["replaceGenreMemory"];
  clearGenreMemory:()=>void;
  genreConfidence:number;
  genreReason:string|null;
  genreBpmHint:number|null;
  setGenreBpmHint:(bpm:number|null)=>void;
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
    track: music.track, isPlaying: music.isPlaying, genre: music.genre, genreFusion:music.genreFusion,
    genreStatus: music.genreStatus, genreSource: music.genreSource,
    genreMatchedTag: music.genreMatchedTag, genreError: music.genreError,
    genreOverride: music.genreOverride, setGenreOverride: music.setGenreOverride,
    artistSuggestion:music.artistSuggestion,genreMemoryCount:music.genreMemoryCount,genreMemory:music.genreMemory,replaceGenreMemory:music.replaceGenreMemory,clearGenreMemory:music.clearGenreMemory,
    genreConfidence:music.genreConfidence,genreReason:music.genreReason,genreBpmHint:music.genreBpmHint,setGenreBpmHint:music.setGenreBpmHint,
    audio: audio.metrics, audioActive: audio.active, audioError: audio.error,
    preferences: ui.preferences, updatePreferences: ui.updatePreferences,
  }), [music.track, music.isPlaying, music.genre, music.genreFusion, music.genreStatus, music.genreSource,
    music.genreMatchedTag, music.genreError, music.genreOverride, music.setGenreOverride, music.artistSuggestion, music.genreMemoryCount, music.genreMemory, music.replaceGenreMemory, music.clearGenreMemory, music.genreConfidence,music.genreReason,music.genreBpmHint,music.setGenreBpmHint,
    audio.metrics, audio.active, audio.error, ui.preferences, ui.updatePreferences]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useVisualizer() {
  const value = useContext(Context);
  if (!value) throw new Error("useVisualizer must be used within VisualizerProvider");
  return value;
}
