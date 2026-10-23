import type { AudioFeatures } from "../../types/audio";
import type { DuoScene } from "./duoChoreographyDirector";

/** V159: deterministic phase-locked partner cues. One state is shared by both dancers. */
export type PartnerSyncState = { phase: number; elapsed: number; confidence: number; active: boolean };
export type PartnerSyncCue = { phase: number; leadPhase: number; partnerPhase: number; contactGain: number; locked: boolean };
export const createPartnerSyncState = (): PartnerSyncState => ({ phase: 0, elapsed: 0, confidence: 0, active: false });
const finite = (n: number | null | undefined, fallback = 0) => typeof n === "number" && Number.isFinite(n) ? n : fallback;
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, finite(n)));
const wrap = (n: number) => ((finite(n) % 1) + 1) % 1;
const circularError = (target: number, value: number) => wrap(target - value + 0.5) - 0.5;

/** No external audio required. Use detected phrase only at sufficiently high confidence,
 * with bounded PLL correction to avoid sudden gestures when analysis jumps.
 */
export function advancePartnerSync(
  state: PartnerSyncState, audio: AudioFeatures, delta: number,
  scene: DuoScene, playing: boolean, reducedMotion: boolean,
): PartnerSyncCue {
  if (!playing || reducedMotion || scene === "solo") {
    Object.assign(state, createPartnerSyncState());
    return { phase: 0, leadPhase: 0, partnerPhase: 0, contactGain: 0, locked: false };
  }
  const dt = clamp(delta, 0, 0.12);
  const bpm = clamp(finite(audio.bpm, 120), 55, 240);
  const confidence = clamp(finite(audio.rhythmConfidence));
  state.elapsed += dt;
  // Four beats = one phrase; the two dancers share the same clock.
  const predicted = wrap(state.phase + dt * bpm / 240);
  const observed = audio.rhythmPhrasePosition;
  const locked = confidence >= 0.75 && typeof observed === "number" && Number.isFinite(observed);
  // Bounded correction prevents discontinuities on noisy or delayed beat observations.
  const correction = locked ? clamp(circularError(wrap(observed!), predicted) * dt * 3 * confidence, -0.045, 0.045) : 0;
  state.phase = wrap(predicted + correction);
  state.confidence = confidence;
  state.active = true;
  const accent = clamp(Math.max(finite(audio.beatStrength), finite(audio.kickAccentIntensity), finite(audio.rhythmPhraseAccent)));
  const together = Math.max(0, 1 - Math.abs(circularError(0.68, state.phase)) / 0.20);
  const contactGain = clamp((0.25 + 0.75 * together) * (0.4 + 0.6 * accent));
  // A response uses a common phrase clock, offset by an eighth phrase in duet mode.
  const offset = scene === "duet" ? 0.125 : 0;
  return { phase: state.phase, leadPhase: state.phase, partnerPhase: wrap(state.phase - offset), contactGain, locked };
}
