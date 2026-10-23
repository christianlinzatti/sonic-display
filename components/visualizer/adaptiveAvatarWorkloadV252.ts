import type { AvatarFrameStat } from "./avatarFrameProfiler";
import type { AnimationTier } from "./adaptiveAnimationQuality";

/** Per-avatar CPU budgeting. Only secondary choreography calculations are throttled;
 * beat transport, animation mixer, rigging, IK and frame updates keep running.
 * All thresholds are conservative and require a reasonable sample population.
 */
export type AvatarWorkloadDecision = { tier: AnimationTier; constrained: boolean; reason: string };
export function chooseAvatarWorkloadTier(
  baseTier: AnimationTier,
  avatarId: string,
  stats: readonly AvatarFrameStat[],
  playing: boolean,
): AvatarWorkloadDecision {
  if (!playing || baseTier === "low") return {tier:baseTier,constrained:false,reason:"idle or already low"};
  const active = stats.filter(s => s.frames >= 30 && Number.isFinite(s.meanMs) && Number.isFinite(s.p95Ms));
  const own = active.find(s => s.id === avatarId);
  if (!own || active.length < 2) return {tier:baseTier,constrained:false,reason:"insufficient multi-avatar samples"};
  const totalMean = active.reduce((sum,s)=>sum+s.meanMs,0);
  const overloaded = totalMean >= 12 || active.some(s=>s.p95Ms >= 10);
  // Protect light-weight dancers; one heavy dancer cannot degrade every avatar.
  if (!overloaded || (own.meanMs < 2.5 && own.p95Ms < 5))
    return {tier:baseTier,constrained:false,reason:"within CPU budget"};
  const hottest = active.slice().sort((a,b)=>b.meanMs-a.meanMs)[0];
  if (hottest.id !== avatarId && own.meanMs < 5) return {tier:baseTier,constrained:false,reason:"other avatar dominates"};
  const tier: AnimationTier = baseTier === "high" ? "balanced" : "low";
  return {tier,constrained:true,reason:"avatar CPU pressure"};
}

/** Avoid oscillation while CPU measurements cross a threshold. */
export type WorkloadLatch = {tier:AnimationTier; lastChangedAt:number};
export function stabilizeAvatarWorkload(
  state: WorkloadLatch, desired: AnimationTier, nowSeconds: number, releaseSeconds = 4,
): AnimationTier {
  if (state.tier === desired) return desired;
  const rank: Record<AnimationTier,number> = {high:0,balanced:1,low:2};
  if (rank[desired] > rank[state.tier] || nowSeconds - state.lastChangedAt >= releaseSeconds) {
    state.tier = desired; state.lastChangedAt = nowSeconds;
  }
  return state.tier;
}
