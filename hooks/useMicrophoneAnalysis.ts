"use client";
import { useEffect, useState } from "react";
import type { AudioMetrics } from "@/types/audio";
const zero: AudioMetrics = { bass: 0, mids: 0, highs: 0, volume: 0, beat: false, beatStrength: 0 };
export function useMicrophoneAnalysis(enabled: boolean) {
  const [metrics, setMetrics] = useState<AudioMetrics>(zero);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) { setActive(false); setMetrics(zero); setError(null); return; }
    let stream: MediaStream | undefined;
    let context: AudioContext | undefined;
    let raf = 0;
    let cancelled = false;
    let lastUpdate = 0;
    let previousBass = 0;
    let bassFloor = 0.08;
    let lastBeat = 0;
    let smoothed = { bass: 0, mids: 0, highs: 0, volume: 0 };
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Mikrofonzugriff wird in diesem Browser nicht unterstützt.");
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        context = new AudioContext();
        if (context.state === "suspended") await context.resume();
        const analyser = context.createAnalyser(); analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.72;
        context.createMediaStreamSource(stream).connect(analyser);
        const bins = new Uint8Array(analyser.frequencyBinCount);
        setActive(true); setError(null);
        const band = (low: number, high: number) => {
          const a = Math.max(0, Math.floor(low * analyser.fftSize / context!.sampleRate));
          const b = Math.min(bins.length, Math.max(a + 1, Math.ceil(high * analyser.fftSize / context!.sampleRate)));
          let sum = 0; for (let i = a; i < b; i++) sum += bins[i];
          return sum / (b - a) / 255;
        };
        const tick = (now: number) => {
          if (cancelled) return;
          analyser.getByteFrequencyData(bins);
          const bass = band(35, 180), mids = band(180, 2000), highs = band(2000, 9000);
          bassFloor = bassFloor * 0.985 + bass * 0.015;
          const impulse = Math.max(0, bass - Math.max(0.12, bassFloor * 1.45) - previousBass * 0.18);
          const beatStrength = now - lastBeat > 180 && impulse > 0.075 ? Math.min(1, impulse * 5) : 0;
          const beat = beatStrength > 0;
          if (beat) lastBeat = now;
          previousBass = previousBass * 0.65 + bass * 0.35;
          if (now - lastUpdate >= 33) {
            const alpha = 0.28;
            smoothed = { bass: smoothed.bass + (bass - smoothed.bass) * alpha, mids: smoothed.mids + (mids - smoothed.mids) * alpha, highs: smoothed.highs + (highs - smoothed.highs) * alpha, volume: smoothed.volume + (((bass + mids + highs) / 3) - smoothed.volume) * alpha };
            setMetrics({ ...smoothed, beat, beatStrength });
            lastUpdate = now;
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) { setActive(false); setError(e instanceof Error ? e.message : "Mikrofon konnte nicht gestartet werden."); }
    };
    void start();
    return () => { cancelled = true; cancelAnimationFrame(raf); stream?.getTracks().forEach(t => t.stop()); if (context && context.state !== "closed") void context.close(); };
  }, [enabled]);
  return { metrics, active, error };
}
