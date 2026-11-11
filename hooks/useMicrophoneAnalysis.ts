"use client";
import {SpectralMusicAnalyzer,mergeMusicAnalysis,waveformRms} from "./spectralMusicAnalyzer";
import { useEffect, useState } from "react";
import {releaseMicrophoneResourcesV654} from "./microphoneResourceCleanupV654";
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
    let cancelled = false;
    const cleanup = () => {
      if(cancelled)return;
      cancelled=true;
      workerRequests.clear();pendingSnapshot=false;pendingSince=0;
      publishAudioWorkerTelemetry(null,"off");
      releaseMicrophoneResourcesV654({frame:raf,cancelFrame:cancelAnimationFrame,stream,context,worker});
      worker=null;stream=undefined;context=undefined;
    };
    let latestSequence = -1;
    let latestAudio: AudioMetrics = zero;
    let latestAdvanced: Partial<AudioMetrics> = {};
    let advancedAt = -Infinity;
    try {
      if (typeof Worker !== "undefined" && window.localStorage.getItem("sonic-display:audio-worker") !== "off") {
        worker = new Worker(new URL("./audioRhythm.worker.ts", import.meta.url), { type: "module" });
        worker.onmessage = (event: MessageEvent<{type: string; sequence: number; metrics: Partial<AudioMetrics>}>) => {
          if (cancelled || event.data.type !== "result" || event.data.sequence < latestSequence || !workerRequests.has(event.data.sequence)) return;
          latestSequence = event.data.sequence;
          const sentAt = workerRequests.get(event.data.sequence);
          workerRequests.delete(event.data.sequence);
          pendingSince = 0;
          if (sentAt !== undefined) publishAudioWorkerTelemetry(performance.now() - sentAt, "worker");
          pendingSnapshot = false;
          advancedAt=performance.now();
          latestAdvanced = sentAt!==undefined&&performance.now()-sentAt<=250?event.data.metrics:{};
          // Keep locally captured onset in preference to the predicted pulse.
          setMetrics(mergeMusicAnalysis(latestAudio,latestAdvanced));
        };
        worker.onerror = () => { worker?.terminate(); worker = null; pendingSnapshot = false; pendingSince = 0; workerRequests.clear(); latestAdvanced = {}; publishAudioWorkerTelemetry(null, "fallback"); };
      }
    } catch { worker = null; }
    let lastUpdate = 0;
    const spectral = new SpectralMusicAnalyzer();
    const tempoTracker = new BeatTempoTracker();
    const phaseTracker = new BeatPhaseTracker();
    const kickTracker = new AdaptiveKickTracker();
    const patternTracker = new KickPatternTracker();
    const rhythmLearner = new RhythmLearningEngine();
    let lastDiagnostic = 0;
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Mikrofonzugriff wird in diesem Browser nicht unterstützt.");
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        context = new AudioContext();
        if (context.state === "suspended") await context.resume();
        if (cancelled) return;
        const analyser = context.createAnalyser(); analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.35;
        context.createMediaStreamSource(stream).connect(analyser);
        const bins = new Uint8Array(analyser.frequencyBinCount);
        const waveform = new Float32Array(analyser.fftSize);
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
          // Tempo follows the capture sample clock; UI latency remains on performance.now().
          const audioAt=context!.currentTime*1000;
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
          analyser.getFloatTimeDomainData(waveform);
          if(now-advancedAt>250)latestAdvanced={};
          const measured=spectral.process({bass,mids,highs,kick,snare,hiHat},waveformRms(waveform),now,calibration.sensitivity,calibration.cooldownMs);
          const {beat,beatStrength}=measured;
          if(measured.reset){
            tempoTracker.reset();phaseTracker.reset();kickTracker.reset();patternTracker.reset();rhythmLearner.reset();
            latestAdvanced={};workerRequests.clear();pendingSnapshot=false;pendingSince=0;latestSequence=sequence;
            worker?.postMessage({type:'reset'});setBeatEvents([]);
          }
          if (beat) {
            if (worker) worker.postMessage({ type: "onset", at: audioAt, strength: beatStrength, kick });
            else kickTracker.onset(audioAt, beatStrength, kick);
            const measuredTempo = worker ? { bpm: null, confidence: 0 } : tempoTracker.current(audioAt);
            if (!worker) patternTracker.onset(audioAt, beatStrength, measuredTempo.bpm, measuredTempo.confidence);
            setBeatEvents(events => [...events.filter(event => now - event.at < 10000), { at: now, strength: beatStrength }].slice(-80));
            const onsetTempo = worker ? measuredTempo : tempoTracker.addOnset(audioAt);
            if (!worker) phaseTracker.onset(audioAt, beatStrength, onsetTempo.bpm, onsetTempo.confidence);
            if (!worker) rhythmLearner.onset(audioAt, beatStrength, onsetTempo.bpm, onsetTempo.confidence);

          }
          if (now - lastUpdate >= 33) {
            const tempo = worker ? { bpm: null, confidence: 0 } : tempoTracker.current(audioAt);
            const bpm = tempo.confidence >= 0.55 ? tempo.bpm : null;
            const phaseLock = worker ? { phase: 0, confidence: 0, locked: false, pulse: false, pulseStrength: 0 } : phaseTracker.current(audioAt, bpm, tempo.confidence);
            const prediction = predictNextKick(phaseLock.phase, bpm, phaseLock.confidence, phaseLock.locked);
            const accent = worker ? { accent: 0, intensity: 0 } : kickTracker.current(audioAt);
            const pattern = worker ? { pattern: "unknown" as const, confidence: 0, accent: 0 } : patternTracker.current(audioAt);
            const learned = worker ? { rhythm: "unknown" as const, confidence: 0, phrasePosition: 0, phraseAccent: 0, repetitions: 0 } : rhythmLearner.current(audioAt);
            // A locked clock can trigger dance accents between audible kicks, but never
            // replaces the microphone-derived kick/spectral measurements.
            const synchronizedBeat = beat || phaseLock.pulse;
            const synchronizedStrength = Math.max(beatStrength, phaseLock.pulseStrength);
            latestAudio = { ...measured, beat: synchronizedBeat, beatStrength: synchronizedStrength, bpm, bpmConfidence: tempo.confidence, beatPhase: phaseLock.phase, phaseConfidence: phaseLock.confidence, phaseLocked: phaseLock.locked, kickAnticipation: prediction.anticipation, kickAccent: typeof accent.accent === "number" ? (accent.accent < 0.2 ? "none" : accent.accent < 0.45 ? "soft" : accent.accent < 0.75 ? "normal" : "strong") : accent.accent, kickAccentIntensity: accent.intensity, kickPattern: pattern.pattern, kickPatternConfidence: pattern.confidence, kickPatternAccent: pattern.accent, learnedRhythm: learned.rhythm, rhythmConfidence: learned.confidence, rhythmPhrasePosition: learned.phrasePosition, rhythmPhraseAccent: learned.phraseAccent, rhythmRepetitions: learned.repetitions, timeToNextKickMs: prediction.timeToKickMs, kick:measured.activity==='music'?kick:0, snare:measured.activity==='music'?snare:0, hiHat:measured.activity==='music'?hiHat:0, energyEnvelope: measured.energyEnvelope, attack: measured.attack, decay: measured.decay };
            if (worker) {
              // Bound queue depth: a slow worker must not accumulate audio frames.
              if (!pendingSnapshot) { pendingSnapshot = true; pendingSince = now; workerRequests.set(++sequence, performance.now()); worker.postMessage({ type: "snapshot", at: audioAt, sequence }); }
              setMetrics(mergeMusicAnalysis(latestAudio, latestAdvanced));
            } else setMetrics(mergeMusicAnalysis(latestAudio,{}));
            if(now-lastDiagnostic>=1000){lastDiagnostic=now;const frame=mergeMusicAnalysis(latestAudio,latestAdvanced);window.dispatchEvent(new CustomEvent('sonic:music-analysis',{detail:{source:'microphone',activity:frame.activity,rms:frame.rms,bassOnset:frame.bassOnset,snareOnset:frame.snareOnset,highOnset:frame.highOnset,bpm:frame.bpm,confidence:frame.bpmConfidence,locked:frame.phaseLocked,worker:!!worker}}));}
            lastUpdate = now;
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) {
        const wasCancelled=cancelled;
        cleanup();
        if (!wasCancelled) {
          setActive(false);setMetrics(zero);setBeatEvents([]);
          setError(e instanceof Error ? e.message : "Mikrofon konnte nicht gestartet werden.");
        }
      }
    };
    void start();
    return cleanup;
  }, [enabled, calibration.sensitivity, calibration.cooldownMs]);
  return { metrics, active, error, beatEvents };
}
