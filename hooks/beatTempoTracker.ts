/** Tempo estimation from microphone kick onset timestamps (performance.now() milliseconds).
 * No Spotify audio access is required. A confidence below 0.55 should not drive the dance tempo.
 */
export interface TempoEstimate { bpm: number | null; confidence: number; sampleCount: number }
export class BeatTempoTracker {
  private onsets: number[] = [];
  private estimate: TempoEstimate = { bpm: null, confidence: 0, sampleCount: 0 };
  reset() { this.onsets = []; this.estimate = { bpm: null, confidence: 0, sampleCount: 0 }; }
  addOnset(at: number): TempoEstimate {
    if (!Number.isFinite(at)) return this.estimate;
    if (this.onsets.length && at - this.onsets[this.onsets.length - 1] < 170) return this.estimate;
    if (this.onsets.length && at <= this.onsets[this.onsets.length - 1]) return this.estimate;
    this.onsets.push(at);
    this.onsets = this.onsets.filter(t => at - t <= 16000).slice(-64);
    this.estimate = this.calculate(at);
    return this.estimate;
  }
  current(at: number): TempoEstimate {
    const age = this.onsets.length ? at - this.onsets[this.onsets.length - 1] : Infinity;
    if (age > 4000) return { bpm: null, confidence: 0, sampleCount: 0 };
    return { ...this.estimate, confidence: this.estimate.confidence * Math.max(0, 1 - Math.max(0, age - 1500) / 2500) };
  }
  private calculate(now: number): TempoEstimate {
    const intervals = this.onsets.slice(1).map((t, i) => t - this.onsets[i]).filter(x => x >= 190 && x <= 1600);
    if (intervals.length < 5) return { bpm: null, confidence: 0, sampleCount: intervals.length };
    // Evaluate plausible dance tempos; each interval may span one or two beats,
    // or represent a half-beat subdivision. Score using phase-consistency.
    let bestBpm = 0, bestScore = -1;
    const recent = this.onsets.filter(t => now - t <= 12000);
    for (let bpm = 70; bpm <= 200; bpm++) {
      const beatMs = 60000 / bpm;
      let weighted = 0, total = 0;
      for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];
        const ratio = interval / beatMs;
        const error = Math.min(Math.abs(ratio - 0.5) * 1.25, Math.abs(ratio - 1), Math.abs(ratio - 2) * 0.7, Math.abs(ratio - 3) * 0.65);
        const recency = 0.4 + 0.6 * (i + 1) / intervals.length;
        weighted += Math.exp(-Math.pow(error / 0.14, 2)) * recency;
        total += recency;
      }
      const intervalScore = weighted / total;
      // Beat phase consistency reduces candidates which fit only occasional gaps.
      let x = 0, y = 0;
      for (const t of recent) { const phase = 2 * Math.PI * (t - recent[0]) / beatMs; x += Math.cos(phase); y += Math.sin(phase); }
      const phaseScore = Math.hypot(x, y) / recent.length;
      const score = intervalScore * 0.7 + phaseScore * 0.3;
      // Favor a stable previous tempo on ambiguous half/double-time patterns.
      const continuity = this.estimate.bpm && Math.abs(bpm - this.estimate.bpm) <= 2 ? 0.035 : 0;
      if (score + continuity > bestScore) { bestScore = score + continuity; bestBpm = bpm; }
    }
    const confidence = Math.max(0, Math.min(1, (bestScore - 0.35) / 0.55)) * Math.min(1, intervals.length / 9);
    // For ambiguous half/double-time beats prefer energetic dance tempo if equally supported.
    let chosen = bestBpm;
    if (chosen < 105 && chosen * 2 <= 200) {
      const doubled = chosen * 2;
      // Preserve established double-time if confidence is comparable.
      if (this.estimate.bpm && Math.abs(this.estimate.bpm - doubled) < 4) chosen = doubled;
    }
    return { bpm: confidence >= 0.3 ? chosen : null, confidence, sampleCount: intervals.length };
  }
}
