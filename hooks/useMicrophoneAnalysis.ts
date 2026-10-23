"use client";
import { useEffect, useState } from "react";
import { publishAudioWorkerTelemetry } from "@/components/visualizer/audioWorkerTelemetry";
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
    if (!enabled) { setActive(value => value ? false : value); setMetrics(value => value === zero ? value : zero); setBeatEvents(value => value.length ? [] : value); setError(value => value === null ? value : null); return; }
    let stream: MediaStream | undefined;
    let context: AudioContext | undefined;
    let raf = 0;
    // Worker is optional: older browsers and restricted environments retain the V160 path.
    let worker: Worker | null = null;
    let pendingSnapshot = false;
    let pendingSince = 0;
    const WORKER_STALL_MS = 1500;
    let sequence = 0;
    const workerRequests = new Map<number, number>();
    let latestSequence = -1;
    let latestAudio: AudioMetrics = zero;
    let latestAdvanced: Partial<AudioMetrics> = {};
    try {
      if (typeof Worker !== "undefined" && window.localStorage.getItem("sonic-display:audio-worker") !== "off") {
        worker = new Worker(new URL("./audioRhythm.worker.ts", import.meta.url), { type: "module" });
        worker.onmessage = (event: MessageEvent<{type: string; sequence: number; metrics: Partial<AudioMetrics>}>) => {
          if (cancelled || event.data.type !== "result" || event.data.sequence < latestSequence) return;
          latestSequence = event.data.sequence;
          const sentAt = workerRequests.get(event.data.sequence);
          workerRequests.delete(event.data.sequence);
          pendingSince = 0;
          if (sentAt !== undefined) publishAudioWorkerTelemetry(performance.now() - sentAt, "worker");
          pendingSnapshot = false;
          latestAdvanced = event.data.metrics;
          // Keep locally captured onset in preference to the predicted pulse.
          setMetrics({ ...latestAudio, ...latestAdvanced,
            beat: Boolean(latestAudio.beat || latestAdvanced.beat),
            beatStrength: Math.max(latestAudio.beatStrength, latestAdvanced.beatStrength ?? 0) });
        };
        worker.onerror = () => { worker?.terminate(); worker = null; pendingSnapshot = false; pendingSince = 0; workerRequests.clear(); latestAdvanced = {}; publishAudioWorkerTelemetry(null, "fallback"); };
      }
    } catch { worker = null; }
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
        // FFT geometry and sample rate remain constant throughout this capture session.
        // Resolve frequency-to-bin boundaries once, not on every animation frame.
        const bandRange = (low: number, high: number): readonly [number, number] => {
          const a = Math.max(0, Math.floor(low * analyser.fftSize / context!.sampleRate));
          const b = Math.min(bins.length, Math.max(a + 1, Math.ceil(high * analyser.fftSize / context!.sampleRate)));
          return [a, b];
        };
        const bands = [bandRange(35, 180), bandRange(180, 2000), bandRange(2000, 9000),
          bandRange(35, 130), bandRange(150, 2500), bandRange(5000, 11000)];
        const band = (range: readonly [number, number]) => {
          let sum = 0;
          for (let i = range[0]; i < range[1]; i++) sum += bins[i];
          return sum / (range[1] - range[0]) / 255;
        };
        const tick = (now: number) => {
          if (cancelled) return;
          analyser.getByteFrequencyData(bins);
          const bass = band(bands[0]), mids = band(bands[1]), highs = band(bands[2]);
          const kick = band(bands[3]), snare = band(bands[4]), hiHat = band(bands[5]);
          // A dead worker must never permanently suppress rhythm analysis.
          // A single outstanding snapshot bounds worker queue growth.
          if (worker && pendingSnapshot && now - pendingSince > WORKER_STALL_MS) {
            worker.terminate(); worker = null; pendingSnapshot = false; pendingSince = 0;
            workerRequests.clear(); latestAdvanced = {};
            publishAudioWorkerTelemetry(null, "fallback");
          }
          bassFloor = bassFloor * 0.985 + bass * 0.015;
          const impulse = Math.max(0, bass - Math.max(0.12, bassFloor * 1.45) - previousBass * 0.18);
          const beatStrength = now - lastBeat > calibration.cooldownMs && impulse > 0.075 / Math.max(0.25, calibration.sensitivity) ? Math.min(1, impulse * 5) : 0;
          const beat = beatStrength > 0;
          if (beat) {
            if (worker) worker.postMessage({ type: "onset", at: now, strength: beatStrength, kick });
            else kickTracker.onset(now, beatStrength, kick);
            const measuredTempo = worker ? { bpm: null, confidence: 0 } : tempoTracker.current(now);
            if (!worker) patternTracker.onset(now, beatStrength, measuredTempo.bpm, measuredTempo.confidence);
            setBeatEvents(events => [...events.filter(event => now - event.at < 10000), { at: now, strength: beatStrength }].slice(-80));
            const onsetTempo = worker ? measuredTempo : tempoTracker.addOnset(now);
            if (!worker) phaseTracker.onset(now, beatStrength, onsetTempo.bpm, onsetTempo.confidence);
            if (!worker) rhythmLearner.onset(now, beatStrength, onsetTempo.bpm, onsetTempo.confidence);
            lastBeat = now;
          }
          previousBass = previousBass * 0.65 + bass * 0.35;
          if (now - lastUpdate >= 33) {
            const alpha = 0.28;
            const volume = (bass + mids + highs) / 3;
            smoothed = { bass: smoothed.bass + (bass - smoothed.bass) * alpha, mids: smoothed.mids + (mids - smoothed.mids) * alpha, highs: smoothed.highs + (highs - smoothed.highs) * alpha, volume: smoothed.volume + (volume - smoothed.volume) * alpha };
            const attack = Math.max(0, volume - previousVolume); const decay = Math.max(0, previousVolume - volume); previousVolume = volume;
            envelope += (volume - envelope) * (volume > envelope ? 0.35 : 0.08);
            const tempo = worker ? { bpm: null, confidence: 0 } : tempoTracker.current(now);
            const bpm = tempo.confidence >= 0.55 ? tempo.bpm : null;
            const phaseLock = worker ? { phase: 0, confidence: 0, locked: false, pulse: false, pulseStrength: 0 } : phaseTracker.current(now, bpm, tempo.confidence);
            const prediction = predictNextKick(phaseLock.phase, bpm, phaseLock.confidence, phaseLock.locked);
            const accent = worker ? { accent: 0, intensity: 0 } : kickTracker.current(now);
            const pattern = worker ? { pattern: "unknown" as const, confidence: 0, accent: 0 } : patternTracker.current(now);
            const learned = worker ? { rhythm: "unknown" as const, confidence: 0, phrasePosition: 0, phraseAccent: 0, repetitions: 0 } : rhythmLearner.current(now);
            // A locked clock can trigger dance accents between audible kicks, but never
            // replaces the microphone-derived kick/spectral measurements.
            const synchronizedBeat = beat || phaseLock.pulse;
            const synchronizedStrength = Math.max(beatStrength, phaseLock.pulseStrength);
            latestAudio = { ...smoothed, beat: synchronizedBeat, beatStrength: synchronizedStrength, bpm, bpmConfidence: tempo.confidence, beatPhase: phaseLock.phase, phaseConfidence: phaseLock.confidence, phaseLocked: phaseLock.locked, kickAnticipation: prediction.anticipation, kickAccent: typeof accent.accent === "number" ? (accent.accent < 0.2 ? "none" : accent.accent < 0.45 ? "soft" : accent.accent < 0.75 ? "normal" : "strong") : accent.accent, kickAccentIntensity: accent.intensity, kickPattern: pattern.pattern, kickPatternConfidence: pattern.confidence, kickPatternAccent: pattern.accent, learnedRhythm: learned.rhythm, rhythmConfidence: learned.confidence, rhythmPhrasePosition: learned.phrasePosition, rhythmPhraseAccent: learned.phraseAccent, rhythmRepetitions: learned.repetitions, timeToNextKickMs: prediction.timeToKickMs, kick, snare, hiHat, energyEnvelope: envelope, attack: Math.min(1, attack * 5), decay: Math.min(1, decay * 3) };
            if (worker) {
              // Bound queue depth: a slow worker must not accumulate audio frames.
              if (!pendingSnapshot) { pendingSnapshot = true; pendingSince = now; workerRequests.set(++sequence, performance.now()); worker.postMessage({ type: "snapshot", at: now, sequence }); }
              setMetrics({ ...latestAudio, ...latestAdvanced, beat: latestAudio.beat, beatStrength: latestAudio.beatStrength });
            } else setMetrics(latestAudio);
            lastUpdate = now;
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) { setActive(false); setError(e instanceof Error ? e.message : "Mikrofon konnte nicht gestartet werden."); }
    };
    void start();
    return () => { cancelled = true; workerRequests.clear(); publishAudioWorkerTelemetry(null, "off"); worker?.terminate(); cancelAnimationFrame(raf); stream?.getTracks().forEach(t => t.stop()); if (context && context.state !== "closed") void context.close(); };
  }, [enabled, calibration.sensitivity, calibration.cooldownMs]);
  return { metrics, active, error, beatEvents };
}
