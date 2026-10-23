/** V220: Only optional choreography/personality work is throttled by CPU pressure.
 * Beat accents, clip playback, rig interpolation and IK always use the render frame.
 */
import type { AnimationTier } from "./adaptiveAnimationQuality";
import type { SchedulerTier } from "./adaptiveAnimationScheduler";

const priority: Record<AnimationTier, number> = { high: 0, balanced: 1, low: 2 };
const tiers: AnimationTier[] = ["high", "balanced", "low"];

export function selectMotionWorkloadTier(renderTier: AnimationTier, cpuTier: SchedulerTier, enabled = true): AnimationTier {
  if (!enabled) return renderTier;
  const cpuFloor = cpuTier === "critical" ? 2 : cpuTier === "constrained" ? 1 : 0;
  return tiers[Math.max(priority[renderTier], cpuFloor)];
}
