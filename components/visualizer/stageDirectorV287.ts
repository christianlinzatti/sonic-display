import type { StageEnvironmentId } from "./stages";
import { recommendedStage } from "./stages";

export const STAGE_DIRECTOR_EVENT = "sonic-stage-director-v287-change";
export const STAGE_DIRECTOR_KEY = "sonic-stage-director-v287";
export type StageDirectorSettings = { enabled: boolean; transitionMs: number; energySensitive: boolean; cinematic: boolean; cameraMotion: boolean; dropFlash: boolean; realCamera: boolean; cameraIntensity: number };
export type StageSection = "verse" | "hook" | "drop" | "build" | "break";
export type StageDirectorState = { trackId: string; stage: StageEnvironmentId; lastChangeMs: number; section: StageSection; override: StageEnvironmentId | null };
export type StageDirectorInput = { trackId: string; progressMs: number; playing: boolean; genre: string | null | undefined; section: StageSection; energy: number; currentManual: StageEnvironmentId; settings: StageDirectorSettings; desiredStage?: StageEnvironmentId };
export const DEFAULT_STAGE_DIRECTOR: StageDirectorSettings = { enabled: false, transitionMs: 700, energySensitive: true, cinematic: true, cameraMotion: true, dropFlash: true, realCamera: false, cameraIntensity: 55 };
export function readStageDirector(): StageDirectorSettings {
  if (typeof window === "undefined") return DEFAULT_STAGE_DIRECTOR;
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STAGE_DIRECTOR_KEY) ?? "null");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_STAGE_DIRECTOR;
    const data = raw as Record<string, unknown>;
    return { enabled: data.enabled === true, transitionMs: typeof data.transitionMs === "number" && Number.isFinite(data.transitionMs) ? Math.max(250, Math.min(1800, Math.round(data.transitionMs))) : 700, energySensitive: data.energySensitive !== false, cinematic: data.cinematic !== false, cameraMotion: data.cameraMotion !== false, dropFlash: data.dropFlash !== false, realCamera: data.realCamera === true, cameraIntensity: typeof data.cameraIntensity === "number" && Number.isFinite(data.cameraIntensity) ? Math.max(0, Math.min(100, Math.round(data.cameraIntensity))) : 55 };
  } catch { return DEFAULT_STAGE_DIRECTOR; }
}
export function writeStageDirector(settings: StageDirectorSettings): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STAGE_DIRECTOR_KEY, JSON.stringify(settings)); } catch { /* private browsing */ }
  window.dispatchEvent(new Event(STAGE_DIRECTOR_EVENT));
}
export function initialStageDirector(manual: StageEnvironmentId = "classic"): StageDirectorState {
  return { trackId: "", stage: manual, lastChangeMs: 0, section: "verse", override: null };
}
export function chooseDirectedStage(genre: string | null | undefined, section: StageSection, energy: number, energySensitive: boolean): StageEnvironmentId {
  const base = recommendedStage(genre);
  const g = (genre ?? "").toLowerCase();
  const e = Number.isFinite(energy) ? Math.max(0, Math.min(1, energy)) : 0;
  if (section === "break") return g.includes("rock") || g.includes("metal") ? "minimal" : g.includes("rap") ? "white" : "galaxy";
  if (section === "build") return base === "classic" ? "neon" : base;
  if ((section === "drop" || section === "hook") && (!energySensitive || e >= .42)) {
    if (base === "festival" || base === "cyberpunk") return "festival";
    if (base === "white") return "neon";
    if (base === "classic" || base === "galaxy" || base === "vaporwave") return "neon";
  }
  return base;
}
/** Pure playback-time governor; never changes the user's saved manual stage. */
export function advanceStageDirector(state: StageDirectorState, input: StageDirectorInput): StageDirectorState {
  const at = Number.isFinite(input.progressMs) ? Math.max(0, input.progressMs) : 0;
  if (!input.settings.enabled) return { trackId: input.trackId, stage: input.currentManual, lastChangeMs: at, section: input.section, override: null };
  if (input.trackId !== state.trackId || at < state.lastChangeMs - 1500) {
    return { trackId: input.trackId, stage: input.desiredStage ?? chooseDirectedStage(input.genre, input.section, input.energy, input.settings.energySensitive), lastChangeMs: at, section: input.section, override: null };
  }
  if (state.override) return { ...state, section: input.section };
  if (!input.playing) return state;
  const next = input.desiredStage ?? chooseDirectedStage(input.genre, input.section, input.energy, input.settings.energySensitive);
  // A stable song-section transition (rather than individual beats) changes the scene.
  const minInterval = input.section === "drop" ? 2800 : 5800;
  if (next === state.stage || at - state.lastChangeMs < minInterval) return state;
  return { ...state, stage: next, section: input.section, lastChangeMs: at };
}
export function manualStageOverride(state: StageDirectorState, stage: StageEnvironmentId): StageDirectorState {
  return { ...state, stage, override: stage };
}
