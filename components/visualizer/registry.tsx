import { ThreeAvatar } from "./ThreeAvatar";
import type { ComponentType } from "react";
import type { AudioFeatures, Track } from "@/types/music";

export type VisualizerMode = "wave" | "particles" | "album-glow" | "avatar";
export interface VisualizerProps {
  audio: AudioFeatures;
  track: Track | null;
  isPlaying: boolean;
  reducedMotion: boolean;
  genre?: string | null;
}
export interface VisualizerDefinition {
  id: VisualizerMode;
  label: string;
  Component: ComponentType<VisualizerProps>;
}

function WaveVisualizer({ audio, isPlaying, reducedMotion }: VisualizerProps) {
  return <div className="visualizer-stage wave-stage" aria-label="Waveform visualizer" style={{ "--wave-level": audio.volume, "--wave-motion": reducedMotion ? "0s" : isPlaying ? "1.2s" : "0s" } as React.CSSProperties}><div className="wave-bars">{Array.from({ length: 32 }, (_, i) => <i key={i} style={{ height: `${8 + 75 * Math.max(audio.bass, audio.mids, audio.highs) * (0.25 + Math.abs(Math.sin(i * 0.73)))}%` }} />)}</div></div>;
}
function ParticleVisualizer({ audio, isPlaying, reducedMotion }: VisualizerProps) {
  return <div className={`visualizer-stage particle-stage ${isPlaying && !reducedMotion ? "is-active" : ""}`} aria-label="Particle visualizer" style={{ "--particle-energy": audio.volume } as React.CSSProperties}>{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--i": i, "--delay": `${i * -0.17}s` } as React.CSSProperties} />)}</div>;
}
function AlbumGlowVisualizer({ audio, track }: VisualizerProps) {
  return <div className="visualizer-stage album-glow-stage" aria-label="Album art glow" style={{ "--glow-energy": audio.bass } as React.CSSProperties}>{track?.albumCoverUrl ? <img src={track.albumCoverUrl} alt="" /> : <span>♫</span>}</div>;
}


export const visualizerRegistry: Record<VisualizerMode, VisualizerDefinition> = {
  wave: { id: "wave", label: "Waveform", Component: WaveVisualizer },
  particles: { id: "particles", label: "Particles", Component: ParticleVisualizer },
  "album-glow": { id: "album-glow", label: "Album glow", Component: AlbumGlowVisualizer },
  avatar: { id: "avatar", label: "3D Avatar", Component: ThreeAvatar },
};
