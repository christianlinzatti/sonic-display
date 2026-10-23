import { DEFAULT_LAYER_WEIGHTS, type MotionDebugLayer } from "./motionDebugControls";

export type PresetGenre = "any" | "deutschrap" | "trap" | "hiphop" | "hardstyle" | "hardtekk" | "techno";
export interface MotionLayerPreset {
  id: string;
  name: string;
  genre: PresetGenre;
  weights: Record<MotionDebugLayer, number>;
}
export const MOTION_PRESET_STORAGE_KEY = "sonic-motion-layer-presets-v119";
export const MOTION_AUTO_STORAGE_KEY = "sonic-motion-layer-auto-v119";
export const BUILTIN_MOTION_PRESETS: MotionLayerPreset[] = [
  { id: "built-in-rap", name: "Deutschrap Groove", genre: "deutschrap", weights:{head:.8,torso:.65,arms:.45,legs:.55,expression:.4,physics:.6}},
  { id: "built-in-trap", name: "Trap Halftime", genre: "trap", weights:{head:.9,torso:.8,arms:.45,legs:.35,expression:.35,physics:.75}},
  { id: "built-in-hiphop", name: "Hip-Hop Bounce", genre: "hiphop", weights:{head:.85,torso:.8,arms:.75,legs:.8,expression:.6,physics:.7}},
  { id: "built-in-hardstyle", name: "Hardstyle Energy", genre: "hardstyle", weights:{head:1.1,torso:1,arms:1.2,legs:1.25,expression:.8,physics:.5}},
  { id: "built-in-hardtekk", name: "Hardtekk Rave", genre: "hardtekk", weights:{head:1,torso:1.15,arms:1.25,legs:1.4,expression:.7,physics:.45}},
  { id: "built-in-techno", name: "Techno Flow", genre: "techno", weights:{head:.65,torso:.8,arms:.65,legs:.7,expression:.5,physics:.8}}
];
const GENRES: PresetGenre[] = ["any","deutschrap","trap","hiphop","hardstyle","hardtekk","techno"];
export function normalizePreset(value: unknown): MotionLayerPreset | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<MotionLayerPreset>;
  if (typeof raw.id !== "string" || !/^custom-[a-zA-Z0-9-]{1,80}$/.test(raw.id) || typeof raw.name !== "string" || !raw.name.trim() || raw.name.length > 60 || !GENRES.includes(raw.genre as PresetGenre) || !raw.weights || typeof raw.weights !== "object") return null;
  const weights = {...DEFAULT_LAYER_WEIGHTS};
  for (const layer of Object.keys(weights) as MotionDebugLayer[]) {
    const n = raw.weights[layer];
    if (typeof n !== "number" || !Number.isFinite(n)) return null;
    weights[layer] = Math.max(0, Math.min(1.5,n));
  }
  return {id:raw.id,name:raw.name.trim(),genre:raw.genre as PresetGenre,weights};
}
export function parsePresetImport(text: string): MotionLayerPreset[] {
  const parsed: unknown = JSON.parse(text);
  const items = Array.isArray(parsed) ? parsed : [parsed];
  if (items.length > 40) throw new Error("Maximal 40 Presets importieren.");
  const valid = items.map(normalizePreset);
  if (valid.some(x=>x===null)) throw new Error("Ungültiges Preset-Format.");
  return valid as MotionLayerPreset[];
}
export function genreForTrack(genre: string | null | undefined): PresetGenre {
  const g=(genre||"").toLowerCase();
  if (/hardtekk|hard.?tekk/.test(g)) return "hardtekk";
  if (/hardstyle|hardcore|rawstyle/.test(g)) return "hardstyle";
  if (/trap|drill/.test(g)) return "trap";
  if (/deutschrap|german rap|deutsch.?hip.?hop/.test(g)) return "deutschrap";
  if (/hip.?hop|rap/.test(g)) return "hiphop";
  if (/techno/.test(g)) return "techno";
  return "any";
}
export function choosePreset(presets: MotionLayerPreset[], genre: string | null | undefined): MotionLayerPreset | null {
  const detected=genreForTrack(genre);
  return detected === "any" ? null : presets.find(p=>p.genre===detected) ?? null;
}
