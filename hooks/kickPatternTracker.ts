/** Heuristic microphone onset-pattern detection; not a musical transcription. */
export type KickPattern = "unknown" | "steady" | "double" | "syncopated";
export interface KickPatternSnapshot { pattern: KickPattern; confidence: number; accent: number; }
const clamp = (x: number) => Math.max(0, Math.min(1, x));
export class KickPatternTracker {
  private times: number[] = [];
  private strengths: number[] = [];
  private lastOnset = 0;
  private snapshot: KickPatternSnapshot = { pattern: "unknown", confidence: 0, accent: 0 };
  onset(at: number, strength: number, bpm: number | null, tempoConfidence: number) {
    if (this.lastOnset && (at <= this.lastOnset || at - this.lastOnset > 3000)) this.reset();
    this.lastOnset = at;
    this.times.push(at); this.strengths.push(clamp(strength));
    if (this.times.length > 20) { this.times.shift(); this.strengths.shift(); }
    if (this.times.length < 5 || !bpm || tempoConfidence < 0.5) return;
    const beatMs = 60000 / bpm;
    const intervals = this.times.slice(1).map((t, i) => t - this.times[i]).filter(x => x > 70 && x < 1800);
    if (intervals.length < 4) return;
    const close = (a: number, b: number, tolerance: number) => Math.abs(a - b) <= tolerance * b;
    const full = intervals.filter(x => close(x, beatMs, 0.22)).length;
    const half = intervals.filter(x => close(x, beatMs / 2, 0.24)).length;
    const off = intervals.filter(x => !close(x, beatMs, 0.22) && !close(x, beatMs / 2, 0.24) && !close(x, beatMs * 2, 0.22)).length;
    const n = intervals.length;
    let pattern: KickPattern = "unknown";
    let score = 0;
    if (half >= 2 && half / n >= 0.24) { pattern = "double"; score = half / n; }
    else if (off / n >= 0.30) { pattern = "syncopated"; score = off / n; }
    else if (full / n >= 0.55) { pattern = "steady"; score = full / n; }
    const sampleConfidence = Math.min(1, n / 9);
    const confidence = pattern === "unknown" ? 0 : clamp((0.25 + score * 0.75) * tempoConfidence * sampleConfidence);
    this.snapshot = { pattern: confidence >= 0.4 ? pattern : "unknown", confidence, accent: clamp(strength) };
  }
  current(at: number): KickPatternSnapshot {
    if (!this.lastOnset || at - this.lastOnset > 1800) return { pattern: "unknown", confidence: 0, accent: 0 };
    const freshness = clamp(1 - Math.max(0, at - this.lastOnset - 600) / 1200);
    return { pattern: this.snapshot.pattern, confidence: this.snapshot.confidence * freshness, accent: this.snapshot.accent * Math.exp(-(at - this.lastOnset) / 160) };
  }
  reset() { this.times = []; this.strengths = []; this.lastOnset = 0; this.snapshot = { pattern: "unknown", confidence: 0, accent: 0 }; }
}
