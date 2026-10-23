import type { RapCameraPlanV429, RapCameraShotV429 } from "./cinematicRapCameraV429";
import { INACTIVE_RAP_CAMERA_V429 } from "./cinematicRapCameraV429";

/** User-authored edits are tied to a Spotify track and the original synced-lyrics line index. */
export type RapCameraChoiceV430 = Exclude<RapCameraShotV429, "none"> | "off";
export type RapCameraDraftChoiceV430 = RapCameraChoiceV430 | "auto";
export type RapCameraOverrideV430 = { lineIndex: number; shot: RapCameraChoiceV430; strength: number };
export type RapCameraLibraryV430 = Record<string, RapCameraOverrideV430[]>;

const VALID_SHOTS = new Set<RapCameraChoiceV430>([
  "solo-close", "reply-side", "duet-wide", "hook-push", "off",
]);
const MAX_LINES = 10000;
const MAX_EDITS_PER_TRACK = 256;
const MAX_TRACKS = 128;
const own = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

/** Strict normalization of persisted JSON. Last valid edit wins; no input mutation. */
export function normalizeRapCameraOverridesV430(value: unknown): RapCameraOverrideV430[] {
  if (!Array.isArray(value)) return [];
  const unique = new Map<number, RapCameraOverrideV430>();
  for (const item of value.slice(0, MAX_EDITS_PER_TRACK * 4)) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const {lineIndex, shot, strength} = item as Partial<RapCameraOverrideV430>;
    if (typeof lineIndex !== "number" || !Number.isInteger(lineIndex) || lineIndex < 0 || lineIndex >= MAX_LINES ||
        typeof shot !== "string" || !VALID_SHOTS.has(shot as RapCameraChoiceV430) ||
        typeof strength !== "number" || !Number.isFinite(strength)) continue;
    unique.set(lineIndex, {lineIndex,shot:shot as RapCameraChoiceV430,
      strength: Math.round(Math.max(0, Math.min(100, strength)))});
  }
  return [...unique.values()].sort((a,b) => a.lineIndex-b.lineIndex).slice(0, MAX_EDITS_PER_TRACK);
}

/** Limits imported preferences without altering the existing local-only library. */
export function normalizeRapCameraLibraryV430(value: unknown): RapCameraLibraryV430 {
  const result: RapCameraLibraryV430 = Object.create(null) as RapCameraLibraryV430;
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;
  let count = 0;
  for (const [trackId, edits] of Object.entries(value)) {
    if (count >= MAX_TRACKS) break;
    if (!trackId || trackId.length > 180 || trackId === "__proto__" || trackId === "constructor" || trackId === "prototype") continue;
    const normalized = normalizeRapCameraOverridesV430(edits);
    if (normalized.length > 0) {result[trackId] = normalized; count++;}
  }
  return result;
}

/** Commit only after an explicit Save action; Auto deletes the current edit. */
export function saveRapCameraOverrideV430(
  existing: unknown, lineIndex: number, shot: RapCameraDraftChoiceV430, strength: number,
): RapCameraOverrideV430[] {
  const safe = normalizeRapCameraOverridesV430(existing);
  if (!Number.isInteger(lineIndex) || lineIndex < 0 || lineIndex >= MAX_LINES) return safe;
  if (shot !== "auto" && !VALID_SHOTS.has(shot)) return safe;
  if (!Number.isFinite(strength)) return safe;
  const without = safe.filter(entry => entry.lineIndex !== lineIndex);
  if (shot === "auto") return without;
  return normalizeRapCameraOverridesV430([
    ...without, {lineIndex,shot,strength:Math.round(Math.max(0,Math.min(100,strength)))}
  ]);
}

/** V429 owns all safety and manual-precedence gates; V430 can ONLY modify a valid V429 plan. */
export function applyRapCameraShotV430(
  plan: RapCameraPlanV429, trackId: string, assignmentTrackId: string,
  edits: unknown,
): RapCameraPlanV429 {
  if (!plan.active || !trackId || trackId !== assignmentTrackId || plan.lineIndex < 0) return plan;
  // Called by R3F every frame: avoid copying/sorting all edits during rendering.
  // Scan the same bounded prefix as normalization; last valid edit for a line wins.
  if (!Array.isArray(edits)) return plan;
  for (let i = Math.min(edits.length, MAX_EDITS_PER_TRACK * 4) - 1; i >= 0; i--) {
    const edit: unknown = edits[i];
    if (!edit || typeof edit !== "object" || Array.isArray(edit)) continue;
    const candidate = edit as Partial<RapCameraOverrideV430>;
    if (candidate.lineIndex !== plan.lineIndex || !Number.isInteger(candidate.lineIndex) ||
        typeof candidate.shot !== "string" || !VALID_SHOTS.has(candidate.shot as RapCameraChoiceV430) ||
        typeof candidate.strength !== "number" || !Number.isFinite(candidate.strength)) continue;
    const strength = Math.round(Math.min(100,Math.max(0,candidate.strength)));
    if (candidate.shot === "off" || strength === 0) return {...INACTIVE_RAP_CAMERA_V429};
    const gain = Math.min(1,Math.max(0,plan.gain * strength/100));
    return {...plan,shot:candidate.shot as RapCameraShotV429,gain,
      holdMs:candidate.shot === "hook-push" ? 1400 : 1100};
  }
  return plan;
}

/** Safe library update for one track; preserves other tracks and prunes an empty entry. */
export function saveRapCameraLibraryV430(
  existing: unknown, trackId: string, lineIndex: number,
  shot: RapCameraDraftChoiceV430, strength: number,
): RapCameraLibraryV430 {
  const library = normalizeRapCameraLibraryV430(existing);
  if (!trackId || trackId.length > 180 || trackId === "__proto__" || trackId === "constructor" || trackId === "prototype") return library;
  const wasPresent = own(library, trackId);
  if (!wasPresent && Object.keys(library).length >= MAX_TRACKS) return library;
  const edits = saveRapCameraOverrideV430(library[trackId],lineIndex,shot,strength);
  if (edits.length) library[trackId] = edits;
  else delete library[trackId];
  return library;
}
