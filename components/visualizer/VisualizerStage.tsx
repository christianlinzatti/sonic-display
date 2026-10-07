"use client";
import { useVisualizer } from "@/context/VisualizerContext";
import { visualizerRegistry } from "@/components/visualizer/registry";

export function VisualizerStage() {
  const { preferences, audio, track, isPlaying, genre } = useVisualizer();
  const definition = visualizerRegistry[preferences.visualizerMode];
  const Mode = definition.Component;
  const avatarModelUrl = preferences.avatarModelId === "custom" ? process.env.NEXT_PUBLIC_AVATAR_MODEL_URL ?? null : null;
  return <section aria-label={`${definition.label} visualization`}><Mode audio={audio} track={track} isPlaying={isPlaying} reducedMotion={preferences.reducedMotion} genre={genre} avatarModelUrl={preferences.visualizerMode === "avatar" ? avatarModelUrl : null} /></section>;
}
