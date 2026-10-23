/** V308 Concert Lighting & Atmosphere: pure, bounded stage-direction decisions. */
import type { StageSection } from "./stageDirectorV287";
import type { ShowCue } from "./ultimateShowDirectorV306";

export const CONCERT_ATMOSPHERE_KEY = "sonic-concert-atmosphere-v308";
export const CONCERT_ATMOSPHERE_EVENT = "sonic-concert-atmosphere-v308-change";
export type AtmosphereSettingsV308 = {
  enabled: boolean;
  beams: boolean;
  haze: boolean;
  stageSpots: boolean;
  syncToShow: boolean;
  intensity: number;
  hazeDensity: number;
  sweep: number;
};
export const DEFAULT_CONCERT_ATMOSPHERE: AtmosphereSettingsV308 = Object.freeze({
  enabled: true, beams: true, haze: true, stageSpots: true,
  syncToShow: true, intensity: 65, hazeDensity: 40, sweep: 45,
});
const clamp = (n: number, lo: number, hi: number): number => Number.isFinite(n) ? Math.max(lo,Math.min(hi,n)) : lo;
const pct = (v: unknown, fallback: number) => typeof v === "number" && Number.isFinite(v) ? Math.round(clamp(v,0,100)) : fallback;
export function normalizeConcertAtmosphereSettings(value: unknown): AtmosphereSettingsV308 {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {...DEFAULT_CONCERT_ATMOSPHERE};
  const v = value as Record<string,unknown>;
  return {
    enabled: v.enabled !== false, beams: v.beams !== false,
    haze: v.haze !== false, stageSpots: v.stageSpots !== false,
    syncToShow: v.syncToShow !== false,
    intensity: pct(v.intensity,65), hazeDensity: pct(v.hazeDensity,40), sweep: pct(v.sweep,45),
  };
}
export function readConcertAtmosphereSettings(): AtmosphereSettingsV308 {
  if (typeof window === "undefined") return {...DEFAULT_CONCERT_ATMOSPHERE};
  try { return normalizeConcertAtmosphereSettings(JSON.parse(window.localStorage.getItem(CONCERT_ATMOSPHERE_KEY) || "null")); }
  catch { return {...DEFAULT_CONCERT_ATMOSPHERE}; }
}
export function writeConcertAtmosphereSettings(settings: AtmosphereSettingsV308): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(CONCERT_ATMOSPHERE_KEY, JSON.stringify(normalizeConcertAtmosphereSettings(settings))); }
  catch { /* private or blocked storage */ }
  window.dispatchEvent(new Event(CONCERT_ATMOSPHERE_EVENT));
}
export type ConcertAtmosphereInputV308 = {
  settings: AtmosphereSettingsV308;
  isPlaying: boolean;
  reactive: boolean;
  reducedMotion: boolean;
  section?: StageSection;
  energy: number;
  kick: number;
  timeSeconds: number;
  timelineGain: number;
  showCue?: ShowCue;
  theme?: string;
  tier: "low" | "balanced" | "high";
  sceneExtraLights: boolean;
};
export type ConcertAtmosphereFrameV308 = {
  leftOpacity: number;
  rightOpacity: number;
  leftLight: number;
  rightLight: number;
  floorHaze: number;
  backHaze: number;
  targetLeftX: number;
  targetRightX: number;
  colorShift: number;
};
const sectionEnergy: Record<StageSection,number> = {break:.35,verse:.62,build:.82,hook:.96,drop:1.12};
/** Time never jumps to random destinations: paused/reduced-motion scenes use stationary, low-cost ambience. */
export function evaluateConcertAtmosphereV308(input: ConcertAtmosphereInputV308): ConcertAtmosphereFrameV308 {
  const empty: ConcertAtmosphereFrameV308 = {leftOpacity:0,rightOpacity:0,leftLight:0,rightLight:0,floorHaze:0,backHaze:0,targetLeftX:-.65,targetRightX:.65,colorShift:0};
  const s = input.settings;
  if (!s.enabled) return empty;
  const intensity = clamp(s.intensity / 100,0,1);
  const timeline = clamp(input.timelineGain,0,1);
  const active = input.isPlaying && input.reactive;
  const energy = active ? clamp(input.energy,0,1) : .16;
  const kick = active && !input.reducedMotion ? clamp(input.kick,0,1) : 0;
  const section: StageSection = input.showCue?.enabled && s.syncToShow ? input.showCue.section : (input.section ?? "verse");
  // When show lighting is manually disabled it must not be reintroduced here.
  const showAllowsLight = !(s.syncToShow && input.showCue?.enabled && !input.showCue.lightingEnabled);
  const showMultiplier = s.syncToShow && input.showCue?.lightingEnabled ? clamp(input.showCue.beamGain, .35, 1.65) : 1;
  const sectionMultiplier = active && !input.reducedMotion ? sectionEnergy[section] : .43;
  const still = input.reducedMotion ? .45 : 1;
  const stageMultiplier = input.theme === "minimal" || input.theme === "white" ? .55 : 1;
  const playGain = (active ? (.45 + .42*energy + .10*kick) : .27) * sectionMultiplier;
  const gain = showAllowsLight ? clamp(intensity*playGain*showMultiplier*stageMultiplier*timeline*still,0,1.5) : 0;
  const spots = s.stageSpots && input.sceneExtraLights && input.tier !== "low";
  // Glow cones are GPU-budgeted independent of the actual stage lights, no shadow-map allocations.
  const beamGain = s.beams && input.tier !== "low" ? gain : 0;
  const hazeGain = s.haze && input.tier !== "low" && showAllowsLight
    ? clamp((s.hazeDensity/100) * (active ? .42 + .20*energy : .26) * timeline*still,0,.7) : 0;
  const time = Number.isFinite(input.timeSeconds) ? Math.max(0,input.timeSeconds) : 0;
  const swing = !active || input.reducedMotion ? 0 : .88 * (s.sweep/100) * (section === "break" ? .18 : section === "build" ? .5 : 1);
  return {
    leftOpacity:clamp(beamGain*.19,0,.24),
    rightOpacity:input.tier === "high" ? clamp(beamGain*.17,0,.23) : 0,
    leftLight:spots ? clamp(gain*2.0,0,1.7) : 0,
    rightLight:spots && input.tier === "high" ? clamp(gain*1.8,0,1.6) : 0,
    floorHaze:clamp(hazeGain*.23,0,.13),
    backHaze:input.tier === "high" ? clamp(hazeGain*.11,0,.07) : 0,
    targetLeftX:-.65 + Math.sin(time*.57)*swing,
    targetRightX:.65 - Math.sin(time*.51+.95)*swing,
    colorShift:active ? clamp(kick*.12,0,.12) : 0,
  };
}
