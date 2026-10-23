import type { AudioFeatures } from "@/types/audio";
import type { LightingSection } from "./intelligentLightingDirector";

export type LightingPattern = "classic" | "rave" | "cinematic";
export type LightingPreset = {
  id: string; name: string; pattern: LightingPattern;
  blackoutStrength: number; kickRollStrength: number; anticipation: number;
};
export const LIGHTING_STORAGE = "sonic-display:lighting-preset-v171";
export const LIGHTING_CHANGED = "sonic-display:lighting-preset-changed";
export const defaultLightingPreset: LightingPreset = {
  id: "rave", name: "Hard Dance", pattern: "rave", blackoutStrength: .58, kickRollStrength: .72, anticipation: .7,
};
export const lightingPresets: LightingPreset[] = [
  { id: "classic", name: "Balanced", pattern: "classic", blackoutStrength: .12, kickRollStrength: .35, anticipation: .45 },
  defaultLightingPreset,
  { id: "cinematic", name: "Cinematic", pattern: "cinematic", blackoutStrength: .8, kickRollStrength: .25, anticipation: .85 },
];
const clamp = (x: number) => Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0;
export function sanitizeLightingPreset(input: unknown): LightingPreset {
  if (!input || typeof input !== "object") return defaultLightingPreset;
  const obj = input as Partial<LightingPreset>;
  const pattern: LightingPattern = obj.pattern === "classic" || obj.pattern === "cinematic" ? obj.pattern : "rave";
  return {
    id: typeof obj.id === "string" ? obj.id.slice(0, 48) : "custom",
    name: typeof obj.name === "string" ? obj.name.slice(0, 48) : "Custom",
    pattern,
    blackoutStrength: clamp(Number(obj.blackoutStrength)),
    kickRollStrength: clamp(Number(obj.kickRollStrength)),
    anticipation: clamp(Number(obj.anticipation)),
  };
}
export function loadLightingPreset(): LightingPreset {
  if (typeof window === "undefined") return defaultLightingPreset;
  try { const raw = window.localStorage.getItem(LIGHTING_STORAGE); return raw ? sanitizeLightingPreset(JSON.parse(raw)) : defaultLightingPreset; }
  catch { return defaultLightingPreset; }
}
export function saveLightingPreset(preset: LightingPreset): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LIGHTING_STORAGE, JSON.stringify(sanitizeLightingPreset(preset))); window.dispatchEvent(new Event(LIGHTING_CHANGED)); } catch { /* private browsing */ }
}
export type PredictiveLightingState = { predicted: number; previousEnergy: number; riseDuration: number; beatInterval: number; lastBeatAt: number; elapsed: number; roll: number; blackout: number; };
export type PredictiveLightingCue = { anticipation: number; kickRoll: number; blackout: number; predictedDrop: boolean };
export const createPredictiveLightingState = (): PredictiveLightingState => ({ predicted: 0, previousEnergy: 0, riseDuration: 0, beatInterval: .5, lastBeatAt: -10, elapsed: 0, roll: 0, blackout: 0 });
/** Lightweight forward-looking heuristic: NOT a guaranteed/annotated drop detector. */
export function advancePredictiveLighting(state: PredictiveLightingState, audio: AudioFeatures, section: LightingSection, dt: number, active: boolean, preset: LightingPreset, reducedMotion: boolean): PredictiveLightingCue {
  const step = Math.min(.1, Math.max(0, Number.isFinite(dt) ? dt : 0));
  state.elapsed += step;
  if (!active || reducedMotion) {
    state.predicted = 0; state.roll = 0; state.blackout = 0; state.riseDuration = 0; state.lastBeatAt = -10;
    return { anticipation: 0, kickRoll: 0, blackout: 0, predictedDrop: false };
  }
  const energy = clamp(audio.bass * .48 + audio.mids * .28 + audio.highs * .1 + audio.volume * .14);
  const rising = energy > state.previousEnergy + .018;
  state.riseDuration = rising && section === "build" ? Math.min(4, state.riseDuration + step * 2) : Math.max(0, state.riseDuration - step * .7);
  state.previousEnergy += (energy - state.previousEnergy) * Math.min(1, step * 5);
  const beat = Boolean(audio.beat) && audio.beatStrength > .19;
  if (beat && state.elapsed - state.lastBeatAt > .14) {
    if (state.lastBeatAt > 0) {
      const interval = state.elapsed - state.lastBeatAt;
      if (interval >= .15 && interval <= 1.5) state.beatInterval += (interval - state.beatInterval) * .23;
    }
    const rapid = state.beatInterval < .4 && (section === "build" || section === "drop");
    if (rapid) state.roll = Math.max(state.roll, clamp(audio.beatStrength));
    state.lastBeatAt = state.elapsed;
  }
  const evidence = section === "build" ? clamp(state.riseDuration / 1.7 * .6 + energy * .55) : 0;
  state.predicted += (evidence - state.predicted) * (1 - Math.exp(-step / .26));
  // A brief pre-drop dip is a *possible* cue; only apply blackout in a confirmed build.
  if (section === "build" && state.predicted > .66 && energy < .24 && state.elapsed - state.lastBeatAt < 1.25) state.blackout = preset.blackoutStrength;
  state.blackout *= Math.exp(-step / .13);
  state.roll *= Math.exp(-step / .16);
  return {
    anticipation: clamp(state.predicted * preset.anticipation),
    kickRoll: clamp(state.roll * preset.kickRollStrength),
    blackout: clamp(state.blackout),
    predictedDrop: state.predicted > .72 && section === "build",
  };
}
