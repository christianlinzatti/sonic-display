/** V234: bounded, frame-independent foot-contact control from existing beat telemetry. */
export type BeatFootworkState = { impulse: number; lastBeat: boolean; support: "left" | "right"; elapsed: number };
export type BeatFootworkInput = { beat?: boolean; beatStrength?: number; kick?: number; bpm?: number; genre?: string | null; playing: boolean; reducedMotion: boolean; delta: number };
export type BeatFootworkCue = { contactBoost: number; lockBoost: number; leftStrength: number; rightStrength: number; impulse: number; support: "left" | "right" };
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));
export function createBeatFootworkState(): BeatFootworkState { return { impulse: 0, lastBeat: false, support: "left", elapsed: 0 }; }
export function updateBeatFootwork(state: BeatFootworkState, input: BeatFootworkInput): BeatFootworkCue {
  const dt = clamp(input.delta, 0, 0.1);
  const active = input.playing && !input.reducedMotion;
  const beat = active && Boolean(input.beat);
  const kick = active ? clamp(input.kick ?? 0) : 0;
  const strong = active ? clamp(input.beatStrength ?? 0) : 0;
  const genre = (input.genre ?? "").toLowerCase();
  const hard = /hardstyle|hardtekk|hardtek|gabber/.test(genre);
  const rap = /rap|hip.?hop|trap/.test(genre);
  const intensity = hard ? 1 : rap ? 0.56 : 0.73;
  // Only an onset can switch the support side; a held boolean cannot cause oscillation.
  if (beat && !state.lastBeat && (kick > 0.13 || strong > 0.28)) {
    state.support = state.support === "left" ? "right" : "left";
    state.impulse = Math.max(state.impulse, clamp(Math.max(kick, strong * 0.65) * intensity));
  }
  state.lastBeat = beat;
  state.elapsed += dt;
  const bpm = clamp(Number(input.bpm) || 120, 65, 200);
  // Avoid abrupt changes and decay naturally even when playback is stopped.
  const tau = active ? clamp(18 / bpm, 0.09, 0.28) : 0.08;
  state.impulse *= Math.exp(-dt / tau);
  if (state.impulse < 0.0001) state.impulse = 0;
  const amount = clamp(state.impulse);
  return {
    impulse: amount,
    support: state.support,
    contactBoost: amount * 0.12,
    lockBoost: amount * 0.16,
    leftStrength: state.support === "left" ? 1 : 1 - amount * 0.12,
    rightStrength: state.support === "right" ? 1 : 1 - amount * 0.12,
  };
}
