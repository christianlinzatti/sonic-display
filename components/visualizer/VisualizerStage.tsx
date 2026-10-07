"use client";
import { useVisualizer } from "@/context/VisualizerContext";
import { visualizerRegistry } from "@/components/visualizer/registry";

export function VisualizerStage() {
  const { preferences, audio, track, isPlaying } = useVisualizer();
  const definition = visualizerRegistry[preferences.visualizerMode];
  const Mode = definition.Component;
  return <section aria-label={`${definition.label} visualization`}><Mode audio={audio} track={track} isPlaying={isPlaying} reducedMotion={preferences.reducedMotion} /></section>;
}
