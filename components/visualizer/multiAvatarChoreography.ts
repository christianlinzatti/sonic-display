import type { AudioFeatures } from "../../types/audio";
import type { DuoScene } from "./duoChoreographyDirector";

/** V206: deterministic, bounded shared musical director for two simultaneous dancers.
 * A rhythmic estimate is used, not sample-accurate Spotify audio. */
export type DuoRole = "together" | "lead-solo" | "partner-solo";
export type DuoPattern = "alternating" | "unison" | "call-response";
export interface MultiAvatarSettings { enabled: boolean; pattern: DuoPattern; barsPerPart: number; dropTogether: boolean; soloEmphasis: number; smartInteraction?: boolean; }
export interface MultiAvatarCue { scene: DuoScene; role: DuoRole; leadGain: number; partnerGain: number; phrase: number; formation: "line" | "diagonal" | "wide"; partnerDelayBeats: number; dropAccent: boolean; }
export interface MultiAvatarState { beats: number; part: number; lastPart: number; initialized: boolean; }
export const MULTI_AVATAR_EVENT = "sonic:multi-avatar-choreo-v206";
const KEY = "sonic.multiAvatarChoreography.v206";
export const DEFAULT_MULTI_AVATAR_SETTINGS: MultiAvatarSettings = { enabled: false, pattern: "alternating", barsPerPart: 4, dropTogether: true, soloEmphasis: 0.65, smartInteraction: false };
const finite = (x: unknown, fallback: number) => typeof x === "number" && Number.isFinite(x) ? x : fallback;
const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));
export function sanitizeMultiAvatarSettings(input: unknown): MultiAvatarSettings {
  const v = input && typeof input === "object" ? input as Partial<MultiAvatarSettings> : {};
  return { enabled: v.enabled === true, pattern: v.pattern === "unison" || v.pattern === "call-response" ? v.pattern : "alternating", barsPerPart: Math.round(clamp(finite(v.barsPerPart,4),1,16)), dropTogether: v.dropTogether !== false, soloEmphasis: clamp(finite(v.soloEmphasis,.65),0,1), smartInteraction: v.smartInteraction === true };
}
export function readMultiAvatarSettings(): MultiAvatarSettings {
  if(typeof window === "undefined") return {...DEFAULT_MULTI_AVATAR_SETTINGS};
  try { return sanitizeMultiAvatarSettings(JSON.parse(window.localStorage.getItem(KEY) || "null")); } catch { return {...DEFAULT_MULTI_AVATAR_SETTINGS}; }
}
export function saveMultiAvatarSettings(value: unknown): MultiAvatarSettings {
  const clean = sanitizeMultiAvatarSettings(value);
  if (typeof window !== "undefined") { try { window.localStorage.setItem(KEY, JSON.stringify(clean)); } catch {} window.dispatchEvent(new Event(MULTI_AVATAR_EVENT)); }
  return clean;
}
export function initialMultiAvatarState(): MultiAvatarState { return {beats:0,part:0,lastPart:-1,initialized:false}; }
/** All role changes occur only on whole-bar boundaries of the shared estimated beat clock. */
export function advanceMultiAvatarChoreography(state: MultiAvatarState, settings: MultiAvatarSettings, audio: AudioFeatures, delta: number, playing: boolean, reducedMotion: boolean): MultiAvatarCue {
  if(!playing || reducedMotion || !settings.enabled) return { scene:"sync",role:"together",leadGain:1,partnerGain:1,phrase:state.part,formation:"line",partnerDelayBeats:0,dropAccent:false };
  const bpm = clamp(finite(audio.bpm,120),55,240);
  state.beats += clamp(finite(delta,0),0,.15) * bpm / 60;
  const part = Math.floor(state.beats / (4*settings.barsPerPart));
  state.part = part;
  state.lastPart = part;
  state.initialized = true;
  const energy = clamp(finite(audio.energyEnvelope,0),0,1);
  const kick = clamp(finite(audio.kickAccentIntensity,0),0,1);
  const isDrop = settings.dropTogether && energy >= .58 && kick >= .55;
  let role: DuoRole = "together";
  if(!isDrop && settings.pattern === "alternating") role = part % 2 === 0 ? "lead-solo" : "partner-solo";
  if(!isDrop && settings.pattern === "call-response") role = part % 3 === 0 ? "lead-solo" : part % 3 === 1 ? "partner-solo" : "together";
  const quiet = 1 - .85 * settings.soloEmphasis;
  return { scene:role === "together" ? "sync" : "duet", role, leadGain:role === "partner-solo"?quiet:1, partnerGain:role === "lead-solo"?quiet:1, phrase:part, formation: isDrop ? "wide" : part % 3 === 1 ? "diagonal" : "line", partnerDelayBeats: isDrop || role === "together" ? 0 : .5, dropAccent:isDrop };
}
