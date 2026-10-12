/** Session-only rhythmic phrase learning from actual microphone onsets. */
export type LearnedRhythm = "unknown" | "four-on-floor" | "double-accent" | "offbeat-accent" | "variable";
export interface RhythmLearningSnapshot { rhythm: LearnedRhythm; confidence: number; phrasePosition: number; phraseAccent: number; repetitions: number; }
const clamp = (n: number) => Math.max(0, Math.min(1, n));
export class RhythmLearningEngine {
  private onsets: { at: number; strength: number }[] = [];
  private lastOnset = 0;
  private state: RhythmLearningSnapshot = { rhythm: "unknown", confidence: 0, phrasePosition: 0, phraseAccent: 0, repetitions: 0 };
  onset(at: number, strength: number, bpm: number | null, tempoConfidence: number) {
    if (this.lastOnset && (at <= this.lastOnset || at - this.lastOnset > 3000)) this.reset();
    this.lastOnset = at;
    this.onsets.push({ at, strength: clamp(strength) });
    this.onsets = this.onsets.filter(x => at - x.at < 16000).slice(-96);
    if (!bpm || tempoConfidence < 0.55 || this.onsets.length < 12) return;
    const beatMs = 60000 / bpm;
    const phraseMs = beatMs * 4;
    const origin = this.onsets[0].at;
    const phrases = new Map<number, number[]>();
    for (const onset of this.onsets) {
      const index = Math.floor((onset.at - origin) / phraseMs);
      const phase = ((onset.at - origin) % phraseMs) / beatMs;
      const slot = Math.round(phase * 2) % 8;
      const values = phrases.get(index) ?? Array(8).fill(0);
      values[slot] = Math.max(values[slot], onset.strength);
      phrases.set(index, values);
    }
    const complete = [...phrases.entries()].filter(([i]) => (i + 1) * phraseMs <= at - origin - beatMs * 0.15).map(([,v]) => v).slice(-6);
    if (complete.length < 2) return;
    const signatures = complete.map(v => v.map(x => x >= 0.22 ? 1 : 0));
    let similarity = 0, comparisons = 0;
    for (let i = 1; i < signatures.length; i++) {
      similarity += signatures[i].filter((x, j) => x === signatures[i - 1][j]).length / 8;
      comparisons++;
    }
    const repeat = similarity / Math.max(1, comparisons);
    const average = Array.from({length:8}, (_,i) => complete.reduce((s,v)=>s+v[i],0)/complete.length);
    const onBeat = [0,2,4,6].reduce((s,i)=>s+average[i],0);
    const offBeat = [1,3,5,7].reduce((s,i)=>s+average[i],0);
    const strongest = Math.max(...average,0.01);
    let rhythm: LearnedRhythm = "variable";
    if (repeat > 0.64 && offBeat > onBeat * 0.38) rhythm = offBeat > onBeat * 0.8 ? "offbeat-accent" : "double-accent";
    else if (repeat > 0.64 && onBeat > offBeat * 2) rhythm = "four-on-floor";
    const confidence = clamp(tempoConfidence * repeat * Math.min(1, complete.length / 4));
    const phrasePosition = ((at - origin) % phraseMs) / phraseMs;
    const slot = Math.round(phrasePosition * 8) % 8;
    this.state = { rhythm: confidence >= 0.45 ? rhythm : "unknown", confidence, phrasePosition, phraseAccent: average[slot] / strongest, repetitions: complete.length };
  }
  current(at: number): RhythmLearningSnapshot {
    if (!this.lastOnset || at - this.lastOnset > 1800) return { rhythm: "unknown", confidence: 0, phrasePosition: 0, phraseAccent: 0, repetitions: 0 };
    return { ...this.state, confidence: this.state.confidence * clamp(1 - Math.max(0, at - this.lastOnset - 600) / 1200) };
  }
  reset() { this.onsets=[]; this.lastOnset=0; this.state={ rhythm:"unknown", confidence:0, phrasePosition:0, phraseAccent:0, repetitions:0 }; }
}
