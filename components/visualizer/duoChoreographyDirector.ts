import type { AudioFeatures } from "../../types/audio";

/** V141: deterministic phrase-aware solo/duo direction. No isolated-stem analysis. */
export type DuoScene = "solo" | "sync" | "mirror" | "duet";
export interface DuoDirectorState { scene: DuoScene; elapsed: number; nextAt: number; sequence: number; }
export const createDuoDirectorState = (): DuoDirectorState => ({ scene: "solo", elapsed: 0, nextAt: 0, sequence: 0 });
const finite = (v: unknown, fallback: number) => typeof v === "number" && Number.isFinite(v) ? v : fallback;
const bound = (v: number) => Math.max(0, Math.min(1, v));
const cycle: DuoScene[] = ["solo", "sync", "mirror", "duet", "sync", "duet"];
/** Updates only at musical phrase boundaries (or a conservative timer fallback). */
export function advanceDuoDirector(state: DuoDirectorState, audio: AudioFeatures, delta: number, genre?: string | null, playing = true, reducedMotion = false): DuoScene {
  if (!playing || reducedMotion) { Object.assign(state, createDuoDirectorState()); return "solo"; }
  state.elapsed += Math.max(0, Math.min(.25, finite(delta, 0)));
  const bpm = Math.max(60, Math.min(210, finite(audio.bpm, 120)));
  const hard = /hardtekk|hardstyle|hardcore/i.test(genre ?? "");
  const rap = /deutschrap|rap|trap|hip.?hop/i.test(genre ?? "");
  const phraseSeconds = (60 / bpm) * (hard ? 8 : 16);
  const phrasePosition = bound(finite(audio.rhythmPhrasePosition, -1));
  const confidence = bound(finite(audio.rhythmConfidence, 0));
  const accent = bound(Math.max(finite(audio.kickAccentIntensity, 0), finite(audio.rhythmPhraseAccent, 0), finite(audio.beatStrength, 0)));
  if (state.elapsed < state.nextAt) return state.scene;
  // Schedule changes on a strong, reasonably reliable phrase accent, otherwise on the next timer boundary.
  if (confidence > .65 && phrasePosition > .15 && phrasePosition < .88 && accent < .8 && state.nextAt > 0) return state.scene;
  const next = cycle[state.sequence % cycle.length];
  const energy = bound(finite(audio.energyEnvelope, finite(audio.volume, 0)));
  state.scene = energy < .12 && state.sequence > 0 ? "solo" : (rap && next === "mirror" ? "duet" : next);
  state.sequence += 1;
  state.nextAt = state.elapsed + Math.max(2.5, phraseSeconds);
  return state.scene;
}
