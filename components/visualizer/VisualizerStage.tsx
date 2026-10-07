"use client";
import { useVisualizer } from "@/context/VisualizerContext";
import { visualizerRegistry } from "@/components/visualizer/registry";

export function VisualizerStage() {
  const { preferences, audio, track, isPlaying, genre } = useVisualizer();
  const definition = visualizerRegistry[preferences.visualizerMode];
  const Mode = definition.Component;
  const genreAvatar: Record<string, string> = { hardstyle: "festival", techno: "neon", rock: "festival", metal: "festival" };
  const selectedAvatarId = preferences.autoAvatarByGenre && genre ? (genreAvatar[genre.toLowerCase()] ?? preferences.avatarModelId) : preferences.avatarModelId;
  const avatarModelUrl = getAvatarModel(selectedAvatarId).url;
  return <section aria-label={`${definition.label} visualization`}><Mode audio={audio} track={track} isPlaying={isPlaying} reducedMotion={preferences.reducedMotion} genre={genre} avatarModelUrl={preferences.visualizerMode === "avatar" ? avatarModelUrl : null} avatarScale={preferences.avatarScale} avatarOffsetY={preferences.avatarOffsetY} avatarAnimationIntensity={preferences.avatarAnimationIntensity} /></section>;
}
