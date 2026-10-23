/** Ordered, browser-local dance sequences. Clip references are scoped to a single avatar. */
import { readAvatarLoopPresets, type AvatarLoopPreset, LOOP_CHANGE_EVENT } from "./avatarLoopPresets";
export type ChoreographyStep = { loopId: string; transition: number; beatAligned: boolean };
export type AvatarChoreography = { id: string; name: string; modelUrl: string; animationUrl: string; steps: ChoreographyStep[]; repeat: boolean };
const STORAGE_KEY = "sonic-display-choreographies-v95";
const ACTIVE_KEY = "sonic-display-active-choreography-v95";
export const CHOREOGRAPHY_CHANGE_EVENT = "sonic-avatar-choreography-changed";
const emit = () => { if (typeof window !== "undefined") { window.dispatchEvent(new Event(CHOREOGRAPHY_CHANGE_EVENT)); window.dispatchEvent(new Event(LOOP_CHANGE_EVENT)); } };
export function readChoreographies(): AvatarChoreography[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is AvatarChoreography => {
      if (!item || typeof item !== "object") return false;
      const c = item as Partial<AvatarChoreography>;
      return typeof c.id === "string" && typeof c.name === "string" && c.name.length <= 60 &&
        typeof c.modelUrl === "string" && typeof c.animationUrl === "string" && typeof c.repeat === "boolean" &&
        Array.isArray(c.steps) && c.steps.length >= 1 && c.steps.length <= 24 && c.steps.every(s =>
          s && typeof s.loopId === "string" && typeof s.transition === "number" && Number.isFinite(s.transition) &&
          s.transition >= 0.05 && s.transition <= 2 && typeof s.beatAligned === "boolean");
    }).slice(0, 30);
  } catch { return []; }
}
export function saveChoreographies(value: AvatarChoreography[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value.slice(0, 30)));
  emit();
}
export function setActiveChoreography(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_KEY, id); else localStorage.removeItem(ACTIVE_KEY);
  // Exactly one live source has priority: a choreography supersedes a single loop.
  if (id) localStorage.removeItem("sonic-display-active-avatar-loop-v94");
  emit();
}
export function resolveChoreography(id: string | null, modelUrl: string, animationUrl = "") {
  if (typeof window === "undefined") return null;
  const choreography = readChoreographies().find(c => c.id === id && c.modelUrl === modelUrl && c.animationUrl === animationUrl);
  if (!choreography) return null;
  const loops = readAvatarLoopPresets();
  const sequence = choreography.steps.map(step => ({ step, loop: loops.find(l => l.id === step.loopId && l.modelUrl === modelUrl && l.animationUrl === animationUrl) }))
    .filter((part): part is { step: ChoreographyStep; loop: AvatarLoopPreset } => Boolean(part.loop));
  return sequence.length ? { choreography, sequence } : null;
}

export function getActiveChoreography(modelUrl: string, animationUrl = "") {
  return resolveChoreography(typeof window === "undefined" ? null : localStorage.getItem(ACTIVE_KEY), modelUrl, animationUrl);
}
