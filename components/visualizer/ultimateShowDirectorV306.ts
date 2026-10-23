import type { EvolutionDirectiveV313 } from "./danceShowEvolutionV313";
import type { StageSection } from "./stageDirectorV287";
import { chooseDirectedStage } from "./stageDirectorV287";
import type { StageEnvironmentId } from "./stages";

/** V306 central show score. Playback-time only; no timers, storage reads or random values in the planner. */
export const ULTIMATE_SHOW_KEY = "sonic-ultimate-show-v306";
export const ULTIMATE_SHOW_EVENT = "sonic-ultimate-show-v306-change";
export type ShowStyle = "auto" | "rave" | "rap" | "cinematic";
export type ShowSettings = { enabled: boolean; style: ShowStyle; intensity: number; camera: boolean; lighting: boolean; effects: boolean; formations: boolean };
export const DEFAULT_SHOW_SETTINGS: ShowSettings = { enabled: false, style: "auto", intensity: 70, camera: true, lighting: true, effects: true, formations: true };
export type ShowCameraShot = "wide" | "groove" | "rise" | "hero" | "intimate";
export type ShowFormation = "solo" | "sync" | "mirror" | "duet";
export type ShowCue = {
  enabled: boolean; section: StageSection; style: Exclude<ShowStyle,"auto">;
  sectionStartMs: number; cameraShot: ShowCameraShot; cameraEnabled: boolean; cameraGain: number;
  lightingEnabled: boolean; fxEnabled: boolean; formationsEnabled: boolean;
  formation: ShowFormation; lightGain: number; beamGain: number; fxGain: number;
  accent: number; stage: StageEnvironmentId; evolution?: EvolutionDirectiveV313;
};
export type ShowState = { trackId: string; at: number; section: StageSection; sectionStartMs: number; changeAtMs: number; transition: boolean };
export type ShowInput = { trackId: string; progressMs: number; playing: boolean; reducedMotion: boolean; genre?: string | null; section: StageSection; energy: number; kick: number; settings: ShowSettings };
const unit = (n: number) => Number.isFinite(n) ? Math.max(0,Math.min(1,n)) : 0;
export function normalizeShowSettings(value: unknown): ShowSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...DEFAULT_SHOW_SETTINGS };
  const v=value as Record<string,unknown>;
  const style: ShowStyle = v.style === "rave" || v.style === "rap" || v.style === "cinematic" ? v.style : "auto";
  return { enabled:v.enabled === true, style, intensity:typeof v.intensity === "number" && Number.isFinite(v.intensity) ? Math.max(0,Math.min(100,Math.round(v.intensity))) : 70,
    camera:v.camera !== false, lighting:v.lighting !== false, effects:v.effects !== false, formations:v.formations !== false };
}
export function readShowSettings(): ShowSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SHOW_SETTINGS };
  try { return normalizeShowSettings(JSON.parse(window.localStorage.getItem(ULTIMATE_SHOW_KEY) || "null")); } catch { return { ...DEFAULT_SHOW_SETTINGS }; }
}
export function writeShowSettings(value: ShowSettings): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(ULTIMATE_SHOW_KEY,JSON.stringify(normalizeShowSettings(value))); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(ULTIMATE_SHOW_EVENT));
}
export function resolveShowStyle(preference: ShowStyle, genre?: string | null): Exclude<ShowStyle,"auto"> {
  if (preference !== "auto") return preference;
  if (/hardtek|hardsty|techno|hardcore|rave|trance|edm/i.test(genre || "")) return "rave";
  if (/rap|hip.?hop|trap|drill/i.test(genre || "")) return "rap";
  return "cinematic";
}
export const initialShowState = (): ShowState => ({trackId:"",at:-1,section:"verse",sectionStartMs:0,changeAtMs:-1,transition:false});
/** Reset on track change, rewind and large seek; a seek never emits an artificial drop impact. */
export function advanceShowState(state: ShowState, input: ShowInput): ShowState {
  const at = Number.isFinite(input.progressMs) ? Math.max(0,input.progressMs) : 0;
  if (state.trackId !== input.trackId || state.at < 0 || at < state.at - 1200 || at > state.at + 10_000) {
    return {trackId:input.trackId,at,section:input.section,sectionStartMs:at,changeAtMs:-1,transition:false};
  }
  if (!input.playing || at <= state.at) return { ...state, at, transition:false };
  if (state.section !== input.section) return {trackId:input.trackId,at,section:input.section,sectionStartMs:at,changeAtMs:at,transition:true};
  return {...state,at,transition:false};
}
/** One cue consumed by stage, camera, lighting, effects and formations. */
export function createShowCue(state: ShowState, input: ShowInput): ShowCue {
  const style=resolveShowStyle(input.settings.style,input.genre);
  const section=state.section;
  const enabled=input.settings.enabled;
  const scale=unit(input.settings.intensity/100);
  const energy=unit(input.energy);
  const sectionSeconds=Math.max(0,(state.at-state.sectionStartMs)/1000);
  const impact = input.playing && state.changeAtMs >= 0 && section === "drop" && sectionSeconds < 1.25 && !input.reducedMotion
    ? Math.max(0,1-sectionSeconds/1.25) * unit((energy+unit(input.kick))*.75) : 0;
  const accent=enabled ? impact*scale : 0;
  const shots:Record<StageSection,ShowCameraShot>={verse:"groove",hook:"hero",build:"rise",drop:"wide",break:"intimate"};
  const formations:Record<StageSection,ShowFormation> = style==="rap"
    ? {verse:"solo",hook:"duet",build:"mirror",drop:"sync",break:"solo"}
    : {verse:"duet",hook:"mirror",build:"duet",drop:"sync",break:"solo"};
  const lightGain = enabled && input.settings.lighting && input.playing && !input.reducedMotion
    ? 1 + scale * ({verse:.03,hook:.14,build:.10,drop:.23,break:-.18}[section]) + accent*.14 : 1;
  const beamGain = enabled && input.settings.lighting && input.playing && !input.reducedMotion
    ? 1 + scale*({verse:.02,hook:.24,build:.26,drop:.34,break:-.55}[section]) : 1;
  const fxGain = enabled && input.settings.effects && input.playing && !input.reducedMotion
    ? Math.max(.15,Math.min(1,scale*({verse:.5,hook:.75,build:.35,drop:1.0,break:.12}[section]) + accent*.15)) : 0;
  return {enabled,section,style,sectionStartMs:state.sectionStartMs,cameraShot:shots[section],cameraEnabled:enabled&&input.settings.camera,cameraGain:scale,
    lightingEnabled:enabled&&input.settings.lighting,fxEnabled:enabled&&input.settings.effects,formationsEnabled:enabled&&input.settings.formations,
    formation:formations[section],lightGain,beamGain,fxGain,accent,
    stage:chooseDirectedStage(input.genre,section,energy,true)};
}
