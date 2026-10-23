import type { AudioFeatures } from "../../types/audio";
import type { DuoScene } from "./duoChoreographyDirector";

/** V146: deterministic, allocation-free partner interaction score.
 * This augments V145 gestures; it does not replace GLB animation or root motion.
 */
export type PartnerInteractionPhase = "greeting" | "call" | "response" | "together" | "recovery";
export interface PartnerInteractionState {
  elapsed: number;
  phase: PartnerInteractionPhase;
  cycle: number;
  lead: number;
  partner: number;
}
export const createPartnerInteractionState = (): PartnerInteractionState => ({ elapsed: 0, phase: "recovery", cycle: -1, lead: 0, partner: 0 });
const finite = (value: number | null | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const clamp = (value: number) => Math.max(0, Math.min(1, finite(value, 0)));
const smooth = (from: number, to: number, delta: number) =>
  from + (to - from) * (1 - Math.exp(-7 * Math.max(0, Math.min(0.12, finite(delta, 0)))));

/** Gain per dancer; genre, reliable phrase position and observed beat accents affect timing.
 * No random decisions and no dependency on isolated audio stems.
 */
export function advancePartnerInteraction(
  state: PartnerInteractionState, audio: AudioFeatures, delta: number,
  scene: DuoScene, genre?: string | null, playing = true, reducedMotion = false,
  enabled = true,
): PartnerInteractionState {
  if (!enabled || !playing || reducedMotion || scene === "solo") {
    Object.assign(state, createPartnerInteractionState());
    return state;
  }
  const dt = Math.max(0, Math.min(0.12, finite(delta, 0)));
  state.elapsed += dt;
  const bpm = Math.max(60, Math.min(220, finite(audio.bpm, 120)));
  const hard = /hardtekk|hardstyle|hardcore/i.test(genre ?? "");
  const rap = /deutschrap|rap|trap|hip.?hop/i.test(genre ?? "");
  const beatsPerCycle = hard ? 8 : rap ? 16 : 12;
  const cycleSeconds = beatsPerCycle * 60 / bpm;
  const confidence = clamp(finite(audio.rhythmConfidence, 0));
  const reliablePhrase = confidence >= 0.75 && Number.isFinite(audio.rhythmPhrasePosition);
  const progress = reliablePhrase
    ? clamp(finite(audio.rhythmPhrasePosition, 0))
    : (state.elapsed % cycleSeconds) / cycleSeconds;
  const cycle = Math.floor(state.elapsed / cycleSeconds);
  const first = state.cycle < 0;
  state.cycle = cycle;
  const position = first ? Math.max(progress, 0.01) : progress;
  state.phase = position < 0.14 ? "greeting"
    : position < 0.36 ? "call"
    : position < 0.57 ? "response"
    : position < 0.81 ? "together" : "recovery";
  const accent = clamp(Math.max(finite(audio.kickAccentIntensity, 0), finite(audio.rhythmPhraseAccent, 0), finite(audio.beatStrength, 0)));
  const energy = clamp(finite(audio.energyEnvelope, finite(audio.volume, 0)));
  const power = Math.max(0.20, Math.min(1, 0.35 + 0.35 * energy + 0.5 * accent));
  const sceneFactor = scene === "duet" ? 1 : scene === "mirror" ? 0.8 : 0.55;
  const leadTarget = ({greeting: .55, call: 1, response: .18, together: 1, recovery: 0} as Record<PartnerInteractionPhase,number>)[state.phase] * power * sceneFactor;
  const partnerTarget = ({greeting: .25, call: .18, response: 1, together: 1, recovery: 0} as Record<PartnerInteractionPhase,number>)[state.phase] * power * sceneFactor;
  state.lead = smooth(state.lead, leadTarget, dt);
  state.partner = smooth(state.partner, partnerTarget, dt);
  return state;
}
