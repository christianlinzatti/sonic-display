/** V172: song-scoped lighting cues; no audio or Spotify data leaves the browser. */
export type LightCueKind = "drop" | "blackout" | "strobe" | "color" | "build";
export type LightCue = { id: string; atMs: number; kind: LightCueKind; strength: number; color?: string; durationMs: number };
export const LIGHT_TIMELINE_CHANGED = "sonic-display:lighting-timeline-changed";
const PREFIX = "sonic-display:light-timeline-v172:";
const kinds: LightCueKind[] = ["drop", "blackout", "strobe", "color", "build"];
const clamp = (v: number, lo: number, hi: number) => Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo;
export function sanitizeLightCues(raw: unknown, durationMs = 24 * 60 * 60 * 1000): LightCue[] {
  if (!Array.isArray(raw)) return [];
  const duration = clamp(durationMs, 0, 24 * 60 * 60 * 1000);
  return raw.slice(0, 128).flatMap((candidate, index): LightCue[] => {
    if (!candidate || typeof candidate !== "object") return [];
    const c = candidate as Partial<LightCue>;
    if (!kinds.includes(c.kind as LightCueKind)) return [];
    const color = typeof c.color === "string" && /^#[0-9a-fA-F]{6}$/.test(c.color) ? c.color : undefined;
    return [{ id: typeof c.id === "string" && c.id.length > 0 ? c.id.slice(0, 64) : `cue-${index}`, kind: c.kind as LightCueKind,
      atMs: Math.round(clamp(Number(c.atMs), 0, duration)), durationMs: Math.round(clamp(Number(c.durationMs), 60, 10000)),
      strength: clamp(Number(c.strength), 0, 1), ...(color ? { color } : {}) }];
  }).sort((a,b) => a.atMs - b.atMs);
}
export function timelineStorageKey(trackId: string): string | null {
  // Reject synthetic/empty track ids and keep keys bounded.
  return /^[a-zA-Z0-9_-]{1,128}$/.test(trackId) ? PREFIX + trackId : null;
}
export function loadLightCues(trackId: string, durationMs: number): LightCue[] {
  const key = timelineStorageKey(trackId);
  if (!key || typeof window === "undefined") return [];
  try { const raw = window.localStorage.getItem(key); return raw ? sanitizeLightCues(JSON.parse(raw), durationMs) : []; }
  catch { return []; }
}
export function saveLightCues(trackId: string, durationMs: number, cues: LightCue[]): boolean {
  const key = timelineStorageKey(trackId);
  if (!key || typeof window === "undefined") return false;
  try { window.localStorage.setItem(key, JSON.stringify(sanitizeLightCues(cues, durationMs))); window.dispatchEvent(new CustomEvent(LIGHT_TIMELINE_CHANGED, {detail:trackId})); return true; }
  catch { return false; }
}
export type TimelineLightOutput = { scale: number; blackout: number; strobe: number; color?: string; activeCue?: LightCueKind };
export function evaluateLightTimeline(cues: LightCue[], atMs: number, reducedMotion: boolean): TimelineLightOutput {
  const result: TimelineLightOutput = {scale:1, blackout:0, strobe:0};
  if (!Number.isFinite(atMs)) return result;
  for (const cue of cues) {
    const elapsed = atMs - cue.atMs;
    if (elapsed < 0 || elapsed > cue.durationMs) continue;
    const progress = elapsed / Math.max(1, cue.durationMs);
    const envelope = Math.sin(Math.PI * progress) * cue.strength;
    result.activeCue = cue.kind;
    if (cue.kind === "blackout") result.blackout = Math.max(result.blackout, Math.min(.88, envelope * .88));
    if (cue.kind === "drop") result.scale = Math.max(result.scale, 1 + envelope * .65);
    if (cue.kind === "build") result.scale = Math.max(result.scale, 1 + envelope * .25);
    if (cue.kind === "color" && cue.color) result.color = cue.color;
    if (cue.kind === "strobe" && !reducedMotion) result.strobe = Math.max(result.strobe, envelope * (Math.sin(elapsed * Math.PI * 2 / 140) > 0 ? .35 : 0));
  }
  return result;
}
export function suggestedLightCue(atMs: number, kind: LightCueKind = "drop"): LightCue {
  const time = Math.max(0, Math.round(atMs));
  return {id:`suggest-${kind}-${time}`,atMs:time,kind,durationMs:kind==="blackout"?320:kind==="strobe"?850:1600,strength:.65};
}
