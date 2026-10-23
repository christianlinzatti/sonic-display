/** Saved animation segments; kept separate from the source GLB. Browser-local in V94. */
export type AvatarLoopPreset = {
  id: string; name: string; modelUrl: string; animationUrl: string;
  clipId: string; start: number; end: number; speed: number;
};
export const LOOP_PRESETS_KEY = "sonic-display-avatar-loops-v94";
export const ACTIVE_LOOP_KEY = "sonic-display-active-avatar-loop-v94";
export const LOOP_CHANGE_EVENT = "sonic-avatar-loop-changed";
export function isAvatarLoopPreset(value: unknown): value is AvatarLoopPreset {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<AvatarLoopPreset>;
  return typeof p.id === "string" && p.id.length < 100 && typeof p.name === "string" && p.name.length <= 60 &&
    typeof p.modelUrl === "string" && typeof p.animationUrl === "string" && typeof p.clipId === "string" &&
    /^(embedded|external):\d+$/.test(p.clipId) &&
    [p.start, p.end, p.speed].every(v => typeof v === "number" && Number.isFinite(v)) &&
    p.start! >= 0 && p.end! > p.start! && p.end! <= 36000 && p.speed! >= 0.25 && p.speed! <= 2;
}
export function readAvatarLoopPresets(): AvatarLoopPreset[] {
  if (typeof window === "undefined") return [];
  try { const stored: unknown = JSON.parse(localStorage.getItem(LOOP_PRESETS_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter(isAvatarLoopPreset).slice(0, 50) : [];
  } catch { return []; }
}
export function persistAvatarLoopPresets(presets: AvatarLoopPreset[]) {
  localStorage.setItem(LOOP_PRESETS_KEY, JSON.stringify(presets));
  window.dispatchEvent(new Event(LOOP_CHANGE_EVENT));
}
export function getActiveAvatarLoop(modelUrl: string, animationUrl = ""): AvatarLoopPreset | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(ACTIVE_LOOP_KEY);
  return readAvatarLoopPresets().find(p => p.id === id && p.modelUrl === modelUrl && p.animationUrl === animationUrl) ?? null;
}
export function setActiveAvatarLoop(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_LOOP_KEY, id);
  else localStorage.removeItem(ACTIVE_LOOP_KEY);
  window.dispatchEvent(new Event(LOOP_CHANGE_EVENT));
}
