import type { AudioFeatures } from "@/types/audio";
export type LightingSection = "intro" | "build" | "drop" | "break";
export type LightingDirectorState = { section: LightingSection; elapsed: number; smoothEnergy: number; previousEnergy: number; riseSeconds: number; quietSeconds: number; highSeconds: number; holdSeconds: number; };
export type LightingDirectorCue = { section: LightingSection; intensity: number; colorBoost: number; sweep: number; pulse: number };
export const createLightingDirectorState = (): LightingDirectorState => ({ section: "intro", elapsed: 0, smoothEnergy: 0, previousEnergy: 0, riseSeconds: 0, quietSeconds: 0, highSeconds: 0, holdSeconds: 0 });
const clamp = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
/** Energy-based section estimates, not a claim to identify ground-truth song sections. */
export function advanceLightingDirector(s: LightingDirectorState, audio: AudioFeatures, delta: number, active: boolean, reducedMotion: boolean): LightingDirectorCue {
  const dt = Math.max(0, Math.min(.1, Number.isFinite(delta) ? delta : 0));
  s.elapsed += dt;
  if (!active) {
    s.section = "intro"; s.smoothEnergy = 0; s.previousEnergy = 0;
    s.riseSeconds = 0; s.quietSeconds = 0; s.highSeconds = 0; s.holdSeconds = 0;
    return { section: "intro", intensity: 1, colorBoost: 0, sweep: 0, pulse: 0 };
  }
  const energy = clamp(.45 * audio.bass + .28 * audio.mids + .12 * audio.highs + .15 * audio.volume);
  const before = s.smoothEnergy;
  s.smoothEnergy += (energy - s.smoothEnergy) * (1 - Math.exp(-dt / .8));
  const rising = s.smoothEnergy > before + .0005 || energy > s.smoothEnergy + .16;
  s.riseSeconds = rising && energy > .24 ? Math.min(9, s.riseSeconds + dt) : Math.max(0, s.riseSeconds - dt * 1.4);
  s.quietSeconds = energy < .19 ? s.quietSeconds + dt : Math.max(0, s.quietSeconds - dt * 2);
  s.highSeconds = energy > .59 || (audio.beat && energy > .45) ? s.highSeconds + dt : Math.max(0, s.highSeconds - dt * 1.2);
  s.holdSeconds += dt;
  // Debounce section transitions, requiring sustained evidence to avoid beat-by-beat flicker.
  if (s.holdSeconds >= 1.5) {
    let next: LightingSection = s.section;
    if (s.quietSeconds > 2.5) next = s.elapsed < 7 ? "intro" : "break";
    else if (s.highSeconds > .75 && (s.riseSeconds > .35 || s.section === "build" || s.section === "drop")) next = "drop";
    else if (s.riseSeconds > 1 && energy > .24 && s.highSeconds < .75) next = "build";
    else if (s.section === "intro" && s.elapsed > 8 && energy < .4) next = "break";
    if (next !== s.section) { s.section = next; s.holdSeconds = 0; }
  }
  s.previousEnergy = energy;
  if (reducedMotion) return { section: s.section, intensity: 1, colorBoost: 0, sweep: 0, pulse: 0 };
  const section = s.section;
  const pulse = section === "drop" ? clamp(Math.max(audio.kickAccentIntensity ?? 0, audio.beat ? audio.beatStrength : 0, audio.kick * .5)) : 0;
  return {
    section,
    intensity: section === "drop" ? 1.2 + pulse * .3 : section === "build" ? .88 + clamp(s.riseSeconds / 5) * .26 : section === "break" ? .48 : .7,
    colorBoost: section === "drop" ? .45 : section === "build" ? .22 : 0,
    sweep: section === "build" ? .3 : section === "drop" ? .2 : 0,
    pulse,
  };
}
