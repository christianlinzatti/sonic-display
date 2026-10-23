import type { DanceSection } from "./intelligentDanceCombinationV242";
import type { LiveStructureState } from "./musicStructureAwareV243";

/** V273: causal, genre-aware transition governor. Audio features are estimates,
 * not isolated instrument stems. Do not interpret these phases as ground truth. */
export type DanceGenre = "hardtekk" | "hardstyle" | "deutschrap" | "other";
export type DanceIntelligenceState = {
  trackId: string; at: number; section: DanceSection; committedAt: number;
  revision: number; candidate: DanceSection | null; candidateSince: number;
};
export type DanceIntelligenceInput = {
  trackId: string; progressMs: number; playing: boolean; genre?: string | null;
  bpm?: number | null; energy: number; kick: number; bass: number;
  structure: LiveStructureState;
};
const bounded = (n: number) => Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
export function danceGenre(genre?: string | null): DanceGenre {
  const name = (genre ?? "").toLowerCase().replace(/[\s_-]+/g, "");
  if (name.includes("hardtekk") || name.includes("hardtek")) return "hardtekk";
  if (name.includes("hardstyle") || name.includes("rawstyle")) return "hardstyle";
  if (["deutschrap", "germanrap", "hiphop", "rap", "trap"].some(x => name.includes(x))) return "deutschrap";
  return "other";
}
export function initialDanceIntelligence(): DanceIntelligenceState {
  return { trackId: "", at: -1, section: "verse", committedAt: 0, revision: 0, candidate: null, candidateSince: 0 };
}
/** Only confirmed, sufficiently sustained musical changes can rotate motions.
 * Pauses, seeks, track changes and missing playback do not create transitions. */
export function advanceDanceIntelligence(s: DanceIntelligenceState, x: DanceIntelligenceInput): DanceIntelligenceState {
  const at = Number.isFinite(x.progressMs) ? Math.max(0, x.progressMs) : 0;
  if (!x.playing) return { ...s, at, candidate: null };
  if (x.trackId !== s.trackId || at < s.at - 1200) {
    return { ...initialDanceIntelligence(), trackId: x.trackId, at, committedAt: at };
  }
  if (at <= s.at) return s;
  const g = danceGenre(x.genre);
  const strength = bounded(x.energy) * .45 + bounded(x.bass) * .25 + bounded(x.kick) * .30;
  const confident = x.structure.confidence >= (g === "deutschrap" ? .53 : .60);
  let desired: DanceSection = confident ? x.structure.section : s.section;
  // Fast styles need a clear bass/kick signal for a drop, not merely a transient attack.
  if (desired === "drop" && g !== "deutschrap" && strength < .46) desired = s.section;
  // A rap hook can have less bass energy than a hardstyle drop.
  if (desired === "hook" && g === "deutschrap" && strength < .28) desired = s.section;
  if (desired === s.section) return { ...s, at, candidate: null };
  const minStable = desired === "drop" ? (g === "hardtekk" ? 180 : 260) :
    desired === "build" ? 600 : desired === "break" ? 650 : g === "deutschrap" ? 850 : 700;
  const cooldown = desired === "drop" ? 1100 : g === "deutschrap" ? 3200 : 2400;
  const candidateSince = desired === s.candidate ? s.candidateSince : at;
  if (at - candidateSince < minStable || at - s.committedAt < cooldown) {
    return { ...s, at, candidate: desired, candidateSince };
  }
  return { trackId: x.trackId, at, section: desired, committedAt: at,
    revision: s.revision + 1, candidate: null, candidateSince: at };
}
export function danceIntelligenceSlot(phrase: number, s: DanceIntelligenceState): string {
  return `${phrase}:v273:${s.revision}`;
}
