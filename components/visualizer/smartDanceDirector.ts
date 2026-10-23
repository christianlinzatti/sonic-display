import type { AudioFeatures } from "@/types/audio";
import type { AvatarChoreography } from "./avatarChoreographies";

export type DanceEnergy = "calm" | "groove" | "intense";
export interface SmartDanceDecision { id: string; energy: DanceEnergy; score: number; }
export function getDanceEnergy(audio: AudioFeatures, isPlaying: boolean): DanceEnergy {
  if (!isPlaying) return "calm";
  const signal = Math.max(0, Math.min(1, audio.energyEnvelope * 0.5 + audio.bass * 0.2 + audio.volume * 0.2 + audio.beatStrength * 0.1));
  return signal > 0.63 ? "intense" : signal > 0.24 ? "groove" : "calm";
}
/** A conservative, deterministic heuristic; not real drop or section recognition. */
export function rankChoreographies(items: AvatarChoreography[], genre: string | null | undefined, bpm: number | null, energy: DanceEnergy): SmartDanceDecision[] {
  const key = (genre ?? "").toLowerCase();
  const speed = bpm && Number.isFinite(bpm) && bpm >= 50 && bpm <= 240 ? bpm : null;
  return items.map((item) => {
    const title = item.name.toLowerCase();
    let score = 1;
    if (key && title.includes(key)) score += 6;
    if (/hardstyle|hardcore|hardtekk/.test(key) && /hakken|hardstyle|hardtekk|jumpstyle/.test(title)) score += 4;
    if (/techno|house/.test(key) && /techno|shuffle|groove|house/.test(title)) score += 4;
    if (energy === "calm") score += /idle|chill|slow|ambient|break/.test(title) ? 5 : -2;
    if (energy === "groove") score += /groove|shuffle|dance|medium/.test(title) ? 4 : 0;
    if (energy === "intense") score += /hakken|jump|hard|fast|intense|drop/.test(title) ? 5 : 0;
    if (speed && speed >= 145 && /hakken|hardstyle|jump|fast/.test(title)) score += 3;
    if (speed && speed < 115 && /slow|groove|house|chill/.test(title)) score += 2;
    return { id: item.id, energy, score };
  }).sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
}
