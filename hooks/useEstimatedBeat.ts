"use client";
import { useEffect, useState } from "react";
import type { AudioFeatures } from "@/types/audio";
import type { MusicContextValue } from "@/types/music";

const silent: AudioFeatures = { bass: 0, mids: 0, highs: 0, volume: 0, beat: false, beatStrength: 0, bpm: null, kick: 0, snare: 0, hiHat: 0, energyEnvelope: 0, attack: 0, decay: 0 };
/** A synthetic, tempo-based visual pulse. NOT actual Spotify audio analysis or beat detection. */
export function useEstimatedBeat(music: Pick<MusicContextValue, "track" | "isPlaying" | "progressMs" | "fetchedAt" | "genre">): AudioFeatures {
  const [metrics, setMetrics] = useState<AudioFeatures>(silent);
  useEffect(() => {
    if (!music.isPlaying || !music.track) { setMetrics(silent); return; }
    const genre = String(music.genre ?? "").toLowerCase();
    const bpm = genre.includes("hardstyle") ? 150 : genre.includes("techno") ? 140 : genre.includes("metal") ? 165 : genre.includes("rock") ? 120 : 120;
    const interval = 60000 / bpm;
    const update = () => {
      const age = music.fetchedAt ? Math.max(0, Date.now() - music.fetchedAt) : 0;
      const position = Math.min(music.track!.durationMs, music.progressMs + age);
      const phase = (position % interval) / interval;
      const pulse = Math.exp(-phase * 12);
      const beat = phase < 0.12;
      setMetrics({ bass: 0.12 + pulse * 0.55, mids: 0.12 + pulse * 0.25, highs: 0.08 + pulse * 0.16,
        volume: 0.15 + pulse * 0.35, beat, beatStrength: pulse * 0.8, bpm,
        kick: pulse * 0.8, snare: Math.exp(-Math.abs(phase - 0.5) * 16) * 0.3,
        hiHat: 0.1 + pulse * 0.2, energyEnvelope: 0.2 + pulse * 0.35,
        attack: beat ? pulse * 0.6 : 0, decay: phase >= 0.12 ? pulse * 0.4 : 0 });
    };
    update();
    const timer = window.setInterval(update, 50);
    return () => window.clearInterval(timer);
  }, [music.isPlaying, music.track?.id, music.track?.durationMs, music.progressMs, music.fetchedAt, music.genre]);
  return metrics;
}
