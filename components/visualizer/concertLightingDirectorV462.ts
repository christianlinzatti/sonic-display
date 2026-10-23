/**
 * V462 – Concert Lighting Director 3.0.
 * Pure, bounded cues for existing lights and low-poly concert haze. No GPU resources.
 * All authored cues, blackouts and user-disabled effects take precedence.
 * Sections derived from energy are show estimates, never claimed as song metadata.
 */
export type LightingMoodV462 = "rap" | "hardstyle" | "hardtekk" | "neutral";
export type LightingSectionV462 = "intro" | "verse" | "build" | "hook" | "drop" | "break";
export type LightingTierV462 = "low" | "balanced" | "high";
export type ConcertLightingInputV462 = {
  genre?: string | null;
  section?: LightingSectionV462 | null;
  energy: number;
  kick: number;
  playing: boolean;
  reactive: boolean;
  reducedMotion: boolean;
  tier: LightingTierV462;
  authored: boolean;
  blackout: boolean;
  enabled?: boolean;
};
export type ConcertLightingPlanV462 = {
  mood: LightingMoodV462;
  active: boolean;
  // Multipliers on already budgeted, user-controlled stage effects.
  keyGain: number;
  fillGain: number;
  beamGain: number;
  spotGain: number;
  hazeGain: number;
  sweepGain: number;
  // Minimum face visibility is applied ONLY to un-authored, active, non-blackout light.
  faceFloor: number;
};
const finite = (n: number) => Number.isFinite(n) ? n : 0;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, finite(n)));
export function lightingMoodV462(genre: string | null | undefined): LightingMoodV462 {
  const text = (genre ?? "").toLowerCase().replace(/[\s_\-]+/g, "");
  if (text.includes("hardtekk") || text.includes("hardtek")) return "hardtekk";
  if (text.includes("hardstyle") || text.includes("rawstyle")) return "hardstyle";
  if (text.includes("deutschrap") || text.includes("germanrap") || text.includes("hiphop") || text.includes("trap") || text === "rap") return "rap";
  return "neutral";
}
export function planConcertLightingV462(input: ConcertLightingInputV462): ConcertLightingPlanV462 {
  const mood = lightingMoodV462(input.genre);
  const neutral: ConcertLightingPlanV462 = {mood,active:false,keyGain:1,fillGain:1,beamGain:1,spotGain:1,hazeGain:1,sweepGain:1,faceFloor:0};
  // Manual timelines, saved light scenes, intentional blackouts and reduced motion win.
  if (input.enabled === false || !input.playing || !input.reactive || input.reducedMotion || input.authored || input.blackout) return neutral;
  // Low tier keeps the original lights only; no additional directional animation.
  if (input.tier === "low") return neutral;
  const energy = clamp(input.energy,0,1);
  const kick = clamp(input.kick,0,1);
  const section = input.section ?? "verse";
  const isHook = section === "hook";
  const isDrop = section === "drop";
  const isBuild = section === "build";
  const isQuiet = section === "break" || section === "intro";
  const level = input.tier === "balanced" ? .58 : 1;
  // Drop emphasis needs actual kick evidence, not merely a genre label.
  const dropAccent = isDrop ? kick : 0;
  let keyGain = 1, fillGain = 1, beamGain = 1, spotGain = 1, hazeGain = 1, sweepGain = 1;
  let faceFloor = 0;
  if (mood === "rap") {
    const groupAccent = isHook ? .10 : isQuiet ? -.05 : .02;
    keyGain = 1 + groupAccent * level;
    fillGain = 1 + (isHook ? .11 : .08) * level;
    beamGain = 1 + (isHook ? .12 : -.04) * level;
    spotGain = 1 + (isHook ? .11 : .03) * level;
    hazeGain = 1 - (isHook ? .18 : .25) * level; // never obscure faces
    sweepGain = 1 - (isHook ? .38 : .62) * level; // calm vocal close-ups
    faceFloor = .40 + .05 * level;
  } else if (mood === "hardstyle" || mood === "hardtekk") {
    const drive = isDrop ? .11 + dropAccent * .13 : isBuild ? .07 : isQuiet ? -.10 : 0;
    keyGain = 1 + drive * level;
    fillGain = 1 + (isDrop ? .06 : 0) * level;
    beamGain = 1 + (isDrop ? .18 + dropAccent * .12 : isBuild ? .08 : 0) * level;
    spotGain = 1 + (isDrop ? .16 + dropAccent * .08 : isBuild ? .07 : 0) * level;
    hazeGain = 1 + (isDrop ? .08 : -.10) * level;
    sweepGain = 1 + (isDrop ? .20 : isBuild ? .13 : -.12) * level;
    // Tighter hardtekk sweeps, but no beat-driven flashes/strobes.
    if (mood === "hardtekk") sweepGain += (isDrop ? .07 : -.05) * level;
    faceFloor = .34;
  } else {
    keyGain = 1 + (isHook ? .05 : 0) * level;
    fillGain = 1 + (isHook ? .04 : 0) * level;
    beamGain = 1 + (isDrop ? .07 * kick : 0) * level;
    spotGain = 1 + (isHook ? .05 : 0) * level;
    hazeGain = 1;
    sweepGain = 1;
    faceFloor = .34;
  }
  return {
    mood,active:true,
    keyGain:clamp(keyGain,.75,1.27),fillGain:clamp(fillGain,.75,1.2),
    beamGain:clamp(beamGain,.7,1.35),spotGain:clamp(spotGain,.75,1.28),
    hazeGain:clamp(hazeGain,.55,1.12),sweepGain:clamp(sweepGain,.28,1.28),
    faceFloor:clamp(faceFloor,0,.55),
  };
}
