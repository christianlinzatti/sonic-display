import type { AudioFeatures } from "../../types/audio";

/** V139: bounded, deterministic stage cues; band energy is a proxy, not stem separation. */
export type StageEnergyStyle = "rap" | "hard" | "steady";
export type StageQuality = "low" | "balanced" | "high";
export interface StageCueState { bass: number; snare: number; glow: number; pulse: number; elapsed: number; lastPulseAt: number; lastBeat: boolean; }
export interface StageCue { key: number; fill: number; beam: number; floor: number; glow: number; pulse: number; sweep: number; colorMix: number; }
const bounded = (v: unknown): number => typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
export const createStageCueState = (): StageCueState => ({bass: 0, snare: 0, glow: 0, pulse: 0, elapsed: 0, lastPulseAt: -10, lastBeat: false});
export const stageStyle = (genre?: string | null): StageEnergyStyle => /deutschrap|hip.?hop|trap|rap/i.test(genre ?? "") ? "rap" : /hardstyle|hardtekk|hardcore/i.test(genre ?? "") ? "hard" : "steady";
export function advanceStageCue(state: StageCueState, audio: AudioFeatures, delta: number, genre?: string | null, playing = true, reducedMotion = false, strength = 60, quality: StageQuality = "high"): StageCue {
  const dt = Number.isFinite(delta) ? Math.max(0, Math.min(.1, delta)) : 0;
  const intensity = bounded(strength / 100);
  const enabled = playing && !reducedMotion && intensity > 0;
  const style = stageStyle(genre);
  const smooth = 1 - Math.exp(-dt / (style === "hard" ? .075 : .19));
  const bass = enabled ? Math.max(bounded(audio.bass), bounded(audio.kickAccentIntensity), bounded(audio.kick)) : 0;
  const snare = enabled ? Math.max(bounded(audio.snare), bounded(audio.mids) * .7) : 0;
  state.bass += (bass - state.bass) * smooth;
  state.snare += (snare - state.snare) * smooth;
  state.elapsed += dt;
  const edge = Boolean(audio.beat) && !state.lastBeat;
  state.lastBeat = enabled && Boolean(audio.beat);
  const kickEdge = enabled && (edge || (bass > .82 && bass - state.bass > .3)) && state.elapsed - state.lastPulseAt > (style === "hard" ? .17 : .3);
  if (kickEdge) { state.pulse = bass; state.lastPulseAt = state.elapsed; }
  state.pulse *= Math.exp(-dt / (style === "hard" ? .13 : .28));
  if (!enabled) { state.pulse = 0; state.lastBeat = false; }
  const qualityScale = quality === "low" ? .52 : quality === "balanced" ? .8 : 1;
  const motionScale = enabled ? intensity * qualityScale : 0;
  const accent = style === "rap" ? state.snare * .64 + state.bass * .36 : style === "hard" ? state.bass * .85 + state.snare * .15 : state.bass * .6 + state.snare * .4;
  const targetGlow = motionScale * (accent * .65 + state.pulse * .35);
  state.glow += (targetGlow - state.glow) * (1 - Math.exp(-dt / .15));
  return {
    key: 1.05 + state.bass * 1.45 * motionScale,
    fill: .58 + state.snare * 1.05 * motionScale,
    beam: .62 + accent * 1.5 * motionScale,
    floor: .4 + state.bass * .55 * motionScale,
    glow: enabled ? bounded(state.glow) : 0,
    pulse: enabled && quality !== "low" ? bounded(state.pulse * intensity) : 0,
    sweep: enabled && quality === "high" ? .45 * motionScale : 0,
    colorMix: enabled ? bounded((style === "hard" ? state.bass : style === "rap" ? state.snare : accent) * intensity) : 0,
  };
}
