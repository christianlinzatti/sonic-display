/** Relative kick accents from detected microphone onsets, not instrument recognition. */
export type KickAccent = "none" | "soft" | "normal" | "strong";
export class AdaptiveKickTracker {
  private baseline = 0.18;
  private lastAt = 0;
  private accent: KickAccent = "none";
  private strength = 0;
  private hits = 0;
  /** Update only on measured onsets; predicted phase pulses are intentionally ignored. */
  onset(at: number, impulse: number, bass: number) {
    if (this.lastAt && at - this.lastAt > 4500) this.reset();
    const measured = Math.max(0, Math.min(1, impulse * 0.8 + bass * 0.2));
    const relative = measured / Math.max(0.10, this.baseline);
    // Warm up the baseline; avoid classifying the first isolated onset as a strong kick.
    this.hits++;
    this.accent = this.hits < 4 ? "normal" : relative >= 1.65 ? "strong" : relative < 0.75 ? "soft" : "normal";
    this.strength = this.accent === "strong" ? Math.min(1, 0.65 + (relative - 1.65) * 0.22) : this.accent === "soft" ? 0.24 : 0.48;
    this.baseline = this.baseline * 0.90 + measured * 0.10;
    this.lastAt = at;
  }
  current(at: number) {
    const elapsed = at - this.lastAt;
    const envelope = this.lastAt && elapsed >= 0 && elapsed < 320 ? Math.exp(-elapsed / 130) : 0;
    return { accent: envelope > 0.03 ? this.accent : "none" as KickAccent, intensity: this.strength * envelope };
  }
  reset() { this.baseline = 0.18; this.lastAt = 0; this.accent = "none"; this.strength = 0; this.hits = 0; }
}
