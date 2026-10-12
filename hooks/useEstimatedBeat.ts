"use client";
import { useEffect, useRef, useState } from "react";
import type { AudioFeatures } from "@/types/audio";
import type { MusicContextValue } from "@/types/music";

const silent: AudioFeatures = { bass: 0, mids: 0, highs: 0, volume: 0, beat: false, beatStrength: 0, bpm: null, kick: 0, snare: 0, hiHat: 0, energyEnvelope: 0, attack: 0, decay: 0 };
/** A synthetic, tempo-based visual pulse. NOT actual Spotify audio analysis or beat detection. */
export function useEstimatedBeat(music: Pick<MusicContextValue, "track" | "isPlaying" | "progressMs" | "fetchedAt" | "genre">): AudioFeatures {
  const [metrics, setMetrics] = useState<AudioFeatures>(silent);
  // Preserve the playback anchor across Spotify polling updates; avoid a visible phase jump.
  const playbackRef = useRef(music);
  playbackRef.current = music;
  const smoothRef = useRef(0);
  useEffect(() => {
    if (!music.isPlaying || !music.track) { smoothRef.current = 0; setMetrics(previous => previous === silent ? previous : silent); return; }
    const genre = String(music.genre ?? "").toLowerCase();
    const bpm = genre.includes("hardstyle") ? 150 : genre.includes("techno") ? 140 : genre.includes("metal") ? 165 : genre.includes("rock") ? 120 : 120;
    const interval = 60000 / bpm;
    const update = () => {
      const latest = playbackRef.current;
      if (!latest.isPlaying || !latest.track) return;
      const age = latest.fetchedAt ? Math.max(0, Date.now() - latest.fetchedAt) : 0;
      const position = Math.min(latest.track.durationMs, latest.progressMs + age);
      const phase = ((position % interval) + interval) % interval / interval;
      // No microphone: show a gentle, continuous approximation instead of sharp
      // synthetic onsets that make the screen/avatar appear to flicker.
      const target = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
      smoothRef.current += (target - smoothRef.current) * 0.12;
      const pulse = smoothRef.current;
      setMetrics({ bass: 0.12 + pulse * 0.16, mids: 0.12 + pulse * 0.10, highs: 0.08 + pulse * 0.06,
        volume: 0.15 + pulse * 0.10, beat: false, beatStrength: pulse * 0.20, bpm,
        kick: pulse * 0.16, snare: 0.05 + pulse * 0.05,
        hiHat: 0.1 + pulse * 0.05, energyEnvelope: 0.2 + pulse * 0.10,
        attack: 0, decay: 0 });
    };
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [music.isPlaying, music.track?.id, music.genre]);
  return metrics;
}
