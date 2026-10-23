/** Shared, deterministic performance policy, independent of React and the renderer. */
export type PerformanceTier = "high" | "balanced" | "low";
export type PerformanceDecision = { tier: PerformanceTier; poorWindows: number; goodWindows: number; cooldown: number };
export const initialPerformanceDecision = (tier: PerformanceTier = "high"): PerformanceDecision => ({tier, poorWindows: 0, goodWindows: 0, cooldown: 0});
export type FrameWindow = { fps: number; slowRatio: number; elapsed: number; p95FrameMs?: number };
/** Hysteresis means a single hiccup never changes the quality. Each interval is ~1 second. */
export function advancePerformanceDecision(previous: PerformanceDecision, window: FrameWindow): PerformanceDecision {
  if (!Number.isFinite(window.fps) || !Number.isFinite(window.slowRatio) || !Number.isFinite(window.elapsed) || window.elapsed < 0.5 || window.elapsed > 2.5) return previous;
  const poor = window.fps < 42 || window.slowRatio > 0.30 || (Number.isFinite(window.p95FrameMs) && (window.p95FrameMs ?? 0) > 42);
  const good = window.fps > 56 && window.slowRatio < 0.08 && (!Number.isFinite(window.p95FrameMs) || (window.p95FrameMs ?? 0) < 22);
  const poorWindows = poor ? previous.poorWindows + 1 : 0;
  const goodWindows = good ? previous.goodWindows + 1 : 0;
  const cooldown = Math.max(0, previous.cooldown - window.elapsed);
  if (cooldown > 0) return { ...previous, poorWindows: Math.min(3, poorWindows), goodWindows: Math.min(12, goodWindows), cooldown };
  if (poorWindows >= 3 && previous.tier !== "low") return { tier: previous.tier === "high" ? "balanced" : "low", poorWindows: 0, goodWindows: 0, cooldown: 8 };
  if (goodWindows >= 12 && previous.tier !== "high") return { tier: previous.tier === "low" ? "balanced" : "high", poorWindows: 0, goodWindows: 0, cooldown: 8 };
  return { tier: previous.tier, poorWindows: Math.min(poorWindows, 3), goodWindows: Math.min(goodWindows, 12), cooldown };
}
