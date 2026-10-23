import type { AudioFeatures } from "../../types/audio";

/** V137: temporal accents from normalized audio features. Instrument labels are
 * heuristic energy-band proxies, not isolated stems or speech recognition.
 * This estimator only processes audio data already available to Sonic Display.
 */
export type FlowStyle = "rap-halftime" | "hard-kick" | "steady";
export interface BeatFlowState {
  bassAverage: number;
  midAverage: number;
  lastKickAt: number;
  lastSnareAt: number;
  kickEnvelope: number;
  snareEnvelope: number;
  groove: number;
  elapsed: number;
}
export interface BeatFlowResult {
  kickOnset: number;
  snareOnset: number;
  groove: number;
  accent: number;
  transitionBoost: number;
  style: FlowStyle;
  confidence: number;
}
export const createBeatFlowState = (): BeatFlowState => ({bassAverage: 0, midAverage: 0, lastKickAt: -10, lastSnareAt: -10, kickEnvelope: 0, snareEnvelope: 0, groove: 0, elapsed: 0});
const bounded = (value: unknown, fallback = 0): number => typeof value === "number" && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
const smooth = (delta: number, seconds: number) => 1 - Math.exp(-Math.max(0, Math.min(.25, delta)) / seconds);
export function classifyFlow(genre?: string | null): FlowStyle {
  if (/deutschrap|hip.?hop|rap|trap/i.test(genre ?? "")) return "rap-halftime";
  if (/hardtekk|hardstyle|hardcore/i.test(genre ?? "")) return "hard-kick";
  return "steady";
}
export function advanceBeatFlow(state: BeatFlowState, audio: AudioFeatures, delta: number, genre?: string | null, playing = true, reducedMotion = false): BeatFlowResult {
  const style = classifyFlow(genre);
  const zero: BeatFlowResult = {kickOnset:0,snareOnset:0,groove:0,accent:0,transitionBoost:0,style,confidence:0};
  if (!playing || reducedMotion) {
    Object.assign(state, createBeatFlowState());
    return zero;
  }
  const dt = Number.isFinite(delta) ? Math.min(.25, Math.max(0, delta)) : 0;
  state.elapsed += dt;
  const bass = bounded(audio.kick, bounded(audio.bass));
  const mid = bounded(audio.snare, bounded(audio.mids));
  const priorBass = state.bassAverage;
  const priorMid = state.midAverage;
  state.bassAverage += (bass - state.bassAverage) * smooth(dt, .38);
  state.midAverage += (mid - state.midAverage) * smooth(dt, .30);
  const kickRise = Math.max(0, bass - priorBass - .12) * 1.8;
  const snareRise = Math.max(0, mid - priorMid - .14) * 1.7;
  const kick = state.elapsed - state.lastKickAt > .11 ? bounded(kickRise) : 0;
  const snare = state.elapsed - state.lastSnareAt > .14 ? bounded(snareRise) : 0;
  if (kick > .15) state.lastKickAt = state.elapsed;
  if (snare > .15) state.lastSnareAt = state.elapsed;
  state.kickEnvelope = Math.max(kick, state.kickEnvelope * Math.exp(-dt / .16));
  state.snareEnvelope = Math.max(snare, state.snareEnvelope * Math.exp(-dt / .22));
  const isRap = style === "rap-halftime";
  const isHard = style === "hard-kick";
  const target = isRap ? .44 * state.kickEnvelope + .56 * state.snareEnvelope : isHard ? .8 * state.kickEnvelope + .2 * state.snareEnvelope : .6 * state.kickEnvelope + .4 * state.snareEnvelope;
  state.groove += (target - state.groove) * smooth(dt, isRap ? .17 : .09);
  const confidence = bounded((audio.bpmConfidence ?? 0) * .35 + (audio.rhythmConfidence ?? 0) * .35 + (audio.phaseConfidence ?? 0) * .3);
  // No predicted beat when no microphone/analysis confidence is available.
  const accent = bounded(state.groove);
  const transitionBoost = bounded(accent * (.45 + confidence * .55));
  return {kickOnset:kick, snareOnset:snare, groove:state.groove, accent, transitionBoost, style, confidence};
}
