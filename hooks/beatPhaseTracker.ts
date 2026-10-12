/** A microphone-onset phase-locked clock. Uses actual kick onsets as anchors,
 * predicts intervening beats only when tempo confidence is sufficient, and
 * slowly corrects phase rather than jumping on every noisy transient.
 * All timestamps are monotonic performance.now() milliseconds.
 */
export interface PhaseLockState {
  phase: number | null;
  confidence: number;
  locked: boolean;
  pulse: boolean;
  pulseStrength: number;
}
export class BeatPhaseTracker {
  private anchor: number | null = null;
  private bpm: number | null = null;
  private confidence = 0;
  private lastOnset = -Infinity;
  private lastPulseIndex = -1;
  private lastPulseAt = -Infinity;
  reset() { this.anchor = null; this.bpm = null; this.confidence = 0; this.lastOnset = -Infinity; this.lastPulseIndex = -1; this.lastPulseAt = -Infinity; }
  onset(now: number, strength: number, bpm: number | null, tempoConfidence: number) {
    if (!Number.isFinite(now) || strength < 0.12) return;
    if (bpm == null || tempoConfidence < 0.55) { this.lastOnset = now; return; }
    const period = 60000 / bpm;
    if (this.anchor === null || this.bpm === null || Math.abs(this.bpm - bpm) > Math.max(8, bpm * 0.09) || now - this.lastOnset > period * 5) {
      this.anchor = now;
      this.lastPulseIndex = 0;
      this.lastPulseAt = now;
      this.confidence = Math.min(0.65, tempoConfidence);
    } else {
      const beats = Math.round((now - this.anchor) / period);
      const expected = this.anchor + beats * period;
      const error = now - expected;
      // Accept an onset only near the beat grid; offbeats must not drag the clock.
      if (Math.abs(error) <= period * 0.22) {
        this.anchor += Math.max(-25, Math.min(25, error * 0.3));
        this.confidence = Math.min(1, this.confidence * 0.75 + tempoConfidence * 0.25 + 0.04);
      } else {
        this.confidence *= 0.88;
      }
    }
    this.bpm = bpm;
    this.lastOnset = now;
  }
  current(now: number, bpm: number | null, tempoConfidence: number): PhaseLockState {
    if (this.anchor === null || this.bpm === null || bpm === null || tempoConfidence < 0.55) return { phase: null, confidence: 0, locked: false, pulse: false, pulseStrength: 0 };
    const period = 60000 / bpm;
    const age = now - this.lastOnset;
    const confidence = Math.max(0, Math.min(this.confidence, tempoConfidence) * Math.max(0, 1 - Math.max(0, age - period * 2) / (period * 5)));
    const locked = confidence >= 0.55;
    const position = (now - this.anchor) / period;
    const phase = ((position % 1) + 1) % 1;
    const index = Math.floor(position);
    const nearBoundary = phase < 0.12;
    const pulse = locked && nearBoundary && index > this.lastPulseIndex && now - this.lastPulseAt > period * 0.65;
    if (pulse) { this.lastPulseIndex = index; this.lastPulseAt = now; }
    return { phase, confidence, locked, pulse, pulseStrength: pulse ? confidence : 0 };
  }
}
