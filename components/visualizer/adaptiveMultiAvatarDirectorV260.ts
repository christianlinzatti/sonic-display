import type { AvatarFrameStat } from "./avatarFrameProfiler";
import type { AnimationTier } from "./adaptiveAnimationQuality";

const KEY = "sonic.v260.adaptiveMultiAvatarDirector";
/** Opt-in only; never changes model selection, beat clock, clip mixer or IK. */
export function readMultiAvatarDirectorEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(KEY) === "true"; } catch { return false; }
}
export function setMultiAvatarDirectorEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, String(enabled)); } catch { /* private mode */ }
  window.dispatchEvent(new Event("sonic:v260-director"));
}
export type MultiAvatarDirectorDecision = {tier: AnimationTier; reason: string; overloaded: boolean};
/** Only reduce expensive secondary motion calculations when multiple sampled avatars compete.
 * Thresholds represent callback CPU proxies, not GPU timings or a guarantee of FPS. */
export function decideMultiAvatarDirector(base: AnimationTier, id: string, stats: readonly AvatarFrameStat[], playing: boolean): MultiAvatarDirectorDecision {
  if (!playing || base === "low") return {tier:base,reason:"inaktiv oder bereits Low",overloaded:false};
  const active = stats.filter(s => s.frames >= 45 && Number.isFinite(s.meanMs) && Number.isFinite(s.p95Ms) && s.meanMs >= 0 && s.p95Ms >= 0);
  const own = active.find(s => s.id === id);
  if (!own || active.length < 2) return {tier:base,reason:"noch keine ausreichenden Duo-Messungen",overloaded:false};
  const total = active.reduce((sum,s)=>sum+s.meanMs,0);
  const overloaded = total >= 9 || active.some(s=>s.p95Ms >= 8);
  if (!overloaded || (own.meanMs < 2 && own.p95Ms < 4)) return {tier:base,reason:"CPU-Budget ausreichend",overloaded};
  const expensive = active.filter(s=>s.meanMs >= 2.5 || s.p95Ms >= 5);
  const biggest = expensive.reduce((best,s)=>!best || s.meanMs > best.meanMs ? s:best,undefined as AvatarFrameStat|undefined);
  if (biggest?.id !== id && own.meanMs < 4) return {tier:base,reason:"leichteren Avatar schützen",overloaded};
  return {tier:base === "high" ? "balanced" : "low",reason:"mehrere Avatare belasten den CPU-Callback",overloaded:true};
}
