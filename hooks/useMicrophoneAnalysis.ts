"use client";
import { useEffect, useState } from "react";
import type { AudioMetrics, BeatEvent } from "@/types/audio";
import { BeatTempoTracker } from "@/hooks/beatTempoTracker";
import { BeatPhaseTracker } from "@/hooks/beatPhaseTracker";
import { predictNextKick } from "@/hooks/kickPrediction";
import { AdaptiveKickTracker } from "@/hooks/adaptiveKickChoreography";
import { KickPatternTracker } from "@/hooks/kickPatternTracker";
import { RhythmLearningEngine } from "@/hooks/rhythmLearningEngine";
const zero: AudioMetrics = { bass: 0, mids: 0, highs: 0, volume: 0, beat: false, beatStrength: 0, bpm: null, kick: 0, snare: 0, hiHat: 0, energyEnvelope: 0, attack: 0, decay: 0 };
export function useMicrophoneAnalysis(enabled: boolean, calibration: { sensitivity: number; cooldownMs: number } = { sensitivity: 1, cooldownMs: 180 }) {
  const [metrics, setMetrics] = useState<AudioMetrics>(zero);
  const [active, setActive] = useState(false);
  const [beatEvents, setBeatEvents] = useState<BeatEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) { setActive(false); setMetrics(zero); setBeatEvents([]); setError(null); return; }
    let stream: MediaStream | undefined;
    let context: AudioContext | undefined;
    let raf = 0;
    let cancelled = false;
    let lastUpdate = 0;
    let previousBass = 0;
    let bassFloor = 0.08;
    let lastBeat = 0;
    let previousVolume = 0;
    let envelope = 0;
    const tempoTracker = new BeatTempoTracker();
    const phaseTracker = new BeatPhaseTracker();
    const kickTracker = new AdaptiveKickTracker();
    const patternTracker = new KickPatternTracker();
    const rhythmLearner = new RhythmLearningEngine();
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
          const kick = band(35, 130), snare = band(150, 2500), hiHat = band(5000, 11000);
          bassFloor = bassFloor * 0.985 + bass * 0.015;
          const impulse = Math.max(0, bass - Math.max(0.12, bassFloor * 1.45) - previousBass * 0.18);
          const beatStrength = now - lastBeat > calibration.cooldownMs && impulse > 0.075 / Math.max(0.25, calibration.sensitivity) ? Math.min(1, impulse * 5) : 0;
          const beat = beatStrength > 0;
          if (beat) {
            kickTracker.onset(now, beatStrength, kick);
            const measuredTempo = tempoTracker.current(now);
            patternTracker.onset(now, beatStrength, measuredTempo.bpm, measuredTempo.confidence);
            setBeatEvents(events => [...events.filter(event => now - event.at < 10000), { at: now, strength: beatStrength }].slice(-80));
            const onsetTempo = tempoTracker.addOnset(now);
            phaseTracker.onset(now, beatStrength, onsetTempo.bpm, onsetTempo.confidence);
            rhythmLearner.onset(now, beatStrength, onsetTempo.bpm, onsetTempo.confidence);
            lastBeat = now;
          }
          previousBass = previousBass * 0.65 + bass * 0.35;
          if (now - lastUpdate >= 33) {
            const alpha = 0.28;
            const volume = (bass + mids + highs) / 3;
            smoothed = { bass: smoothed.bass + (bass - smoothed.bass) * alpha, mids: smoothed.mids + (mids - smoothed.mids) * alpha, highs: smoothed.highs + (highs - smoothed.highs) * alpha, volume: smoothed.volume + (volume - smoothed.volume) * alpha };
            const attack = Math.max(0, volume - previousVolume); const decay = Math.max(0, previousVolume - volume); previousVolume = volume;
            envelope += (volume - envelope) * (volume > envelope ? 0.35 : 0.08);
            const tempo = tempoTracker.current(now);
            const bpm = tempo.confidence >= 0.55 ? tempo.bpm : null;
            const phaseLock = phaseTracker.current(now, bpm, tempo.confidence);
            const prediction = predictNextKick(phaseLock.phase, bpm, phaseLock.confidence, phaseLock.locked);
            const accent = kickTracker.current(now);
            const pattern = patternTracker.current(now);
            const learned = rhythmLearner.current(now);
            // A locked clock can trigger dance accents between audible kicks, but never
            // replaces the microphone-derived kick/spectral measurements.
            const synchronizedBeat = beat || phaseLock.pulse;
            const synchronizedStrength = Math.max(beatStrength, phaseLock.pulseStrength);
            setMetrics({ ...smoothed, beat: synchronizedBeat, beatStrength: synchronizedStrength, bpm, bpmConfidence: tempo.confidence, beatPhase: phaseLock.phase, phaseConfidence: phaseLock.confidence, phaseLocked: phaseLock.locked, kickAnticipation: prediction.anticipation, kickAccent: accent.accent, kickAccentIntensity: accent.intensity, kickPattern: pattern.pattern, kickPatternConfidence: pattern.confidence, kickPatternAccent: pattern.accent, learnedRhythm: learned.rhythm, rhythmConfidence: learned.confidence, rhythmPhrasePosition: learned.phrasePosition, rhythmPhraseAccent: learned.phraseAccent, rhythmRepetitions: learned.repetitions, timeToNextKickMs: prediction.timeToKickMs, kick, snare, hiHat, energyEnvelope: envelope, attack: Math.min(1, attack * 5), decay: Math.min(1, decay * 3) });
            lastUpdate = now;
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) { setActive(false); setError(e instanceof Error ? e.message : "Mikrofon konnte nicht gestartet werden."); }
    };
    void start();
    return () => { cancelled = true; cancelAnimationFrame(raf); stream?.getTracks().forEach(t => t.stop()); if (context && context.state !== "closed") void context.close(); };
  }, [enabled, calibration.sensitivity, calibration.cooldownMs]);
  return { metrics, active, error, beatEvents };
}
