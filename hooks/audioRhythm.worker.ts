/// <reference lib="webworker" />
import { BeatTempoTracker } from "./beatTempoTracker";
import { BeatPhaseTracker } from "./beatPhaseTracker";
import { predictNextKick } from "./kickPrediction";
import { AdaptiveKickTracker } from "./adaptiveKickChoreography";
import { KickPatternTracker } from "./kickPatternTracker";
import { RhythmLearningEngine } from "./rhythmLearningEngine";

type Input = { type: "onset"; at: number; strength: number; kick: number } | { type: "snapshot"; at: number; sequence: number } | { type: "reset" };
const tempo = new BeatTempoTracker();
const phase = new BeatPhaseTracker();
const kick = new AdaptiveKickTracker();
const pattern = new KickPatternTracker();
const learning = new RhythmLearningEngine();
let lastAt = -Infinity;
self.onmessage = (event: MessageEvent<Input>) => {
  const msg = event.data;
  if (msg.type === "reset") { tempo.reset(); learning.reset(); lastAt = -Infinity; return; }
  if (!Number.isFinite(msg.at) || msg.at < lastAt - 250) return;
  lastAt = Math.max(lastAt, msg.at);
  if (msg.type === "onset") {
    const current = tempo.current(msg.at);
    kick.onset(msg.at, msg.strength, msg.kick);
    pattern.onset(msg.at, msg.strength, current.bpm, current.confidence);
    const onsetTempo = tempo.addOnset(msg.at);
    phase.onset(msg.at, msg.strength, onsetTempo.bpm, onsetTempo.confidence);
    learning.onset(msg.at, msg.strength, onsetTempo.bpm, onsetTempo.confidence);
  } else {
    const t = tempo.current(msg.at);
    const bpm = t.confidence >= 0.55 ? t.bpm : null;
    const p = phase.current(msg.at, bpm, t.confidence);
    const prediction = predictNextKick(p.phase, bpm, p.confidence, p.locked);
    const accent = kick.current(msg.at);
    const patterns = pattern.current(msg.at);
    const learned = learning.current(msg.at);
    self.postMessage({ type: "result", sequence: msg.sequence, at: msg.at, metrics: {
      bpm, bpmConfidence: t.confidence, beatPhase: p.phase, phaseConfidence: p.confidence,
      phaseLocked: p.locked, beat: p.pulse, beatStrength: p.pulseStrength,
      kickAnticipation: prediction.anticipation, kickAccent: accent.accent,
      kickAccentIntensity: accent.intensity, kickPattern: patterns.pattern,
      kickPatternConfidence: patterns.confidence, kickPatternAccent: patterns.accent,
      learnedRhythm: learned.rhythm, rhythmConfidence: learned.confidence,
      rhythmPhrasePosition: learned.phrasePosition, rhythmPhraseAccent: learned.phraseAccent,
      rhythmRepetitions: learned.repetitions, timeToNextKickMs: prediction.timeToKickMs
    }});
  }
};
