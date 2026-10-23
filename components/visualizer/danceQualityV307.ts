/**
 * V307 Dance Quality & Expression.
 * Small, deterministic, additive movement accents over V134/V158. Never edits GLB
 * clips, bind poses, IK anchors or the Three.js AnimationMixer.
 */
import type { AvatarRigMotion } from "./avatarRigController";

export type DanceQualityStyle = "auto" | "rave" | "rap" | "cinematic";
export interface DanceQualitySettings {
  enabled: boolean;
  intensity: number;
  style: DanceQualityStyle;
  expressiveArms: boolean;
  bodyGroove: boolean;
  plantedFootSafety: boolean;
}
export const DANCE_QUALITY_KEY = "sonic-dance-quality-v307";
export const DANCE_QUALITY_EVENT = "sonic:dance-quality-v307";
export const DEFAULT_DANCE_QUALITY: DanceQualitySettings = {
  enabled: true, intensity: 55, style: "auto", expressiveArms: true, bodyGroove: true, plantedFootSafety: true,
};
const clamp = (x: number, lo = 0, hi = 1) => Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : lo;
const safe = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const styles: DanceQualityStyle[] = ["auto", "rave", "rap", "cinematic"];
let cached: DanceQualitySettings | null = null;
export function normalizeDanceQualitySettings(value: unknown): DanceQualitySettings {
  if (!value || typeof value !== "object") return {...DEFAULT_DANCE_QUALITY};
  const v = value as Partial<DanceQualitySettings>;
  return {
    enabled: typeof v.enabled === "boolean" ? v.enabled : DEFAULT_DANCE_QUALITY.enabled,
    intensity: Math.round(clamp(safe(v.intensity, DEFAULT_DANCE_QUALITY.intensity), 0, 100)),
    style: styles.includes(v.style as DanceQualityStyle) ? v.style as DanceQualityStyle : "auto",
    expressiveArms: typeof v.expressiveArms === "boolean" ? v.expressiveArms : true,
    bodyGroove: typeof v.bodyGroove === "boolean" ? v.bodyGroove : true,
    plantedFootSafety: typeof v.plantedFootSafety === "boolean" ? v.plantedFootSafety : true,
  };
}
export function readDanceQualitySettings(): DanceQualitySettings {
  if (cached) return cached;
  if (typeof window === "undefined") return {...DEFAULT_DANCE_QUALITY};
  try { cached = normalizeDanceQualitySettings(JSON.parse(window.localStorage.getItem(DANCE_QUALITY_KEY) ?? "null")); }
  catch { cached = {...DEFAULT_DANCE_QUALITY}; }
  return cached;
}
export function writeDanceQualitySettings(settings: DanceQualitySettings) {
  cached = normalizeDanceQualitySettings(settings);
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(DANCE_QUALITY_KEY, JSON.stringify(cached)); } catch { /* storage optional */ }
  window.dispatchEvent(new Event(DANCE_QUALITY_EVENT));
}
/** Avoid stale cache when another tab edits the preference. */
export function refreshDanceQualitySettings() {
  cached = null;
  return readDanceQualitySettings();
}
export function resolveDanceQualityStyle(style: DanceQualityStyle, genre?: string | null): Exclude<DanceQualityStyle,"auto"> {
  if (style !== "auto") return style;
  return /hardstyle|hardtekk|hardtek|hardcore|gabber|techno/i.test(genre ?? "") ? "rave"
    : /deutschrap|hip.?hop|trap|rap/i.test(genre ?? "") ? "rap" : "cinematic";
}
/** Interpolate infrequent player progress updates without depending on render frame cadence.
 * An actual seek or track change snaps to the new playback clock; pauses do not drift.
 */
export interface DanceSongClock { trackId: string; progressMs: number; syncedAt: number; songSeconds: number; initialized: boolean }
export const createDanceSongClock = (): DanceSongClock => ({trackId:"",progressMs:0,syncedAt:0,songSeconds:0,initialized:false});
export function updateDanceSongClock(clock:DanceSongClock, input:{trackId?:string; progressMs?:number; elapsed:number; playing:boolean}):number {
  const local = safe(input.elapsed,0);
  const id = input.trackId ?? "";
  const progress = Math.max(0,safe(input.progressMs,0));
  if (!input.trackId || input.progressMs === undefined) return local;
  if (!clock.initialized || clock.trackId !== id || Math.abs(clock.progressMs-progress)>1) {
    clock.initialized=true;clock.trackId=id;clock.progressMs=progress;clock.syncedAt=local;clock.songSeconds=progress/1000;
  }
  return Math.max(0,clock.songSeconds + (input.playing ? Math.max(0,local-clock.syncedAt) : 0));
}
export interface DanceQualityState {
  gain: number;
  accents: Record<string, number>;
  lastTime: number | null;
  lastTrack: string;
}
export const createDanceQualityState = (): DanceQualityState => ({gain: 0, accents: {}, lastTime: null, lastTrack: ""});
export const NEUTRAL_QUALITY_MOTION: AvatarRigMotion = Object.freeze({
  headNod:0,headTurn:0,spineSway:0,hipSway:0,shoulderRoll:0,followThrough:0,headLag:0,chestPulse:0,
  armSwing:0,legGroove:0,footStep:0,weightShift:0,beatImpulse:0,
  expressionJaw:0,expressionBrow:0,expressionEyeNarrow:0,expressionHeadTilt:0,
});
export interface DanceQualityInput {
  playing: boolean;
  reducedMotion: boolean;
  delta: number;
  songSeconds: number;
  trackId?: string;
  dancerKey?: string;
  genre?: string | null;
  section?: string;
  bpm?: number | null;
  beatStrength?: number;
  kick?: number;
  snare?: number;
  energy?: number;
  /** A planted foot should not receive an additional lift. */
  plantedLeft?: boolean;
  plantedRight?: boolean;
  /** Choreography mode / manual clips require a deliberately smaller overlay. */
  authoredClipPriority?: boolean;
  settings: DanceQualitySettings;
}
const hash = (value: string): number => {
  let n = 2166136261;
  for (let i = 0; i < value.length; i++) n = Math.imul(n ^ value.charCodeAt(i), 16777619);
  return n >>> 0;
};
const smoothstep = (x: number) => { const v = clamp(x); return v*v*(3-2*v); };
/** Return an unchanged motion object on pause/reduced-motion; all extra channels decay or clear. */
export function enhanceDanceQuality<T extends AvatarRigMotion>(state: DanceQualityState, motion: T, input: DanceQualityInput): T {
  const time = safe(input.songSeconds, 0);
  const dt = clamp(input.delta, 0, .1);
  const active = input.playing && !input.reducedMotion && input.settings.enabled && input.settings.intensity > 0;
  const seek = state.lastTime !== null && (time < state.lastTime - .1 || time - state.lastTime > Math.max(3.5, dt * 12));
  const newTrack = state.lastTrack !== (input.trackId ?? "");
  state.lastTime = time;
  state.lastTrack = input.trackId ?? "";
  if (seek || newTrack) { state.accents = {}; state.gain = 0; return motion; }
  // On pause, no residual movement, no beat-flash or drift.
  if (!input.playing || input.reducedMotion) { state.gain = 0; state.accents = {}; return motion; }
  const gainTarget = active ? clamp(input.settings.intensity / 100) * (input.authoredClipPriority ? .47 : 1) : 0;
  state.gain += (gainTarget - state.gain) * (1 - Math.exp(-dt * (gainTarget > state.gain ? 5 : 9)));
  if (state.gain < 0.0001) return motion;
  const style = resolveDanceQualityStyle(input.settings.style, input.genre);
  const section = (input.section ?? "verse").toLowerCase();
  const calm = /break|outro|intro/.test(section);
  const big = /drop|hook|chorus/.test(section);
  const emphasis = calm ? .28 : big ? 1 : .66;
  const bpm = clamp(safe(input.bpm, 120), 60, 205);
  const beatSeconds = 60 / bpm;
  const musicalBeat = time / beatSeconds;
  const barsOfTwo = Math.floor(musicalBeat / 8);
  const phraseKey = `${input.trackId ?? ""}:${input.dancerKey ?? ""}:${barsOfTwo}`;
  const pattern = hash(phraseKey) % 4;
  const polarity = ((hash(phraseKey + "side") % 2) ? 1 : -1);
  // Vary the phrase pattern every two bars; no unbounded random per-frame jitter.
  const phase = 2 * Math.PI * (musicalBeat % 4) / 4;
  const swing = Math.sin(phase + pattern * .52);
  const counter = Math.cos(phase + pattern * .52);
  const kick = clamp(safe(input.kick, 0));
  const snare = clamp(safe(input.snare, 0));
  const beat = clamp(safe(input.beatStrength, 0));
  const energy = clamp(safe(input.energy, .5));
  const accent = smoothstep(Math.max(beat * .6, kick, snare * .7));
  const amount = state.gain * emphasis * (.6 + energy * .4);
  const rap = style === "rap";
  const rave = style === "rave";
  const face = (rap ? .6 * snare + .4 * beat : .75 * kick + .25 * beat);
  const base = rap ? .078 : rave ? .065 : .045;
  const raw: Record<string, number> = {
    headNod: -base * (rap ? snare : kick) * amount,
    headTurn: polarity * (rap ? .052 : .028) * swing * amount,
    headLag: (rap ? .023 : .013) * counter * amount,
    expressionHeadTilt: polarity * (rap ? .029 : .013) * swing * amount,
    expressionBrow: .026 * face * amount,
    shoulderRoll: (rap ? .067 : .041) * swing * amount,
    spineSway: .042 * swing * amount,
    hipSway: -polarity * .034 * swing * amount,
    chestPulse: (rave ? .04 : .018) * accent * amount,
    followThrough: -counter * (rap ? .035 : .022) * amount,
    leftArmAccent: (pattern < 2 ? 1 : .45) * polarity * (rap ? .17 : .115) * (0.3 + .7 * snare) * amount,
    rightArmAccent: (pattern >= 2 ? 1 : .45) * -polarity * (rap ? .17 : .115) * (0.3 + .7 * kick) * amount,
    legGroove: (rave ? .042 : .025) * accent * amount,
    footStep: (rave ? .034 : .018) * Math.max(0, swing) * amount,
  };
  if (!input.settings.expressiveArms) {raw.leftArmAccent = 0; raw.rightArmAccent = 0;raw.followThrough = 0;}
  if (!input.settings.bodyGroove) for (const key of ["spineSway","hipSway","shoulderRoll","chestPulse","headLag","legGroove","footStep"]) raw[key] = 0;
  // With two planted feet, block the V307 additive step. When a single foot is planted,
  // prevent its lift entirely and restrict the existing foot-step overlay as well.
  const planted = !!input.settings.plantedFootSafety;
  if (planted && input.plantedLeft && input.plantedRight) {raw.footStep = 0; raw.legGroove *= .35;}
  else if (planted && (input.plantedLeft || input.plantedRight)) raw.footStep *= .35;
  const additions: Record<string,number> = {};
  for (const [channel, target] of Object.entries(raw)) {
    const previous = state.accents[channel] ?? 0;
    const rate = /ArmAccent|followThrough|headLag/.test(channel) ? (rap ? 8 : 13) : 10;
    const next = previous + (target - previous) * (1 - Math.exp(-rate * dt));
    state.accents[channel] = next;
    additions[channel] = Number.isFinite(next) ? next : 0;
  }
  const output = {...motion} as T & Record<string, number>;
  for (const [key, addition] of Object.entries(additions)) {
    // For new left/right channels, zeros are the correct neutral base.
    const value = safe(output[key], 0) + addition;
    (output as Record<string, number>)[key] = clamp(value, -(/Accent/.test(key) ? .35 : 1.2), /Accent/.test(key) ? .35 : 1.2);
  }
  // Additional contact safety acts only on the tiny reactive overlay; never clears authored IK.
  return output;
}
