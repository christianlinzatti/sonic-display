/** V774: compact only visible dance-FX instances; never allocate inside the render loop. */
export type DanceFxTierV774 = "low" | "balanced" | "high";
export type DanceFxPulseV774 = { active: boolean; age: number; x: number; z: number; side: number };
export type DanceFxInstanceSinkV774 = {
  write(index: number, pulse: DanceFxPulseV774, opacity: number): void;
  finish(visibleInstances: number): void;
};
export type DanceFxFlagsV774 = {
  shockwaves: boolean; footprints: boolean; trails: boolean; tier: DanceFxTierV774;
};
export function getDanceFxPoolLimitV774(tier: DanceFxTierV774): number {
  return tier === "low" ? 2 : tier === "balanced" ? 4 : 8;
}
/** Preserves individual pulse decay and tier limits while reducing the draw calls to at most 3.
 * Counts are compacted from zero; disabled effects call finish(0) and consume no draws.
 * Each sink updates a preallocated InstancedMesh/InstancedBufferAttribute in place. */
export function writeDanceFxInstancesV774(
  pulses: readonly DanceFxPulseV774[], max: number, intensity: number, flags: DanceFxFlagsV774,
  rings: DanceFxInstanceSinkV774, marks: DanceFxInstanceSinkV774, trails: DanceFxInstanceSinkV774,
): void {
  let ringCount = 0, markCount = 0, trailCount = 0;
  const n = Math.min(pulses.length, Math.max(0, Math.floor(max)));
  for (let i = 0; i < n; i++) {
    const pulse = pulses[i];
    if (!pulse.active || !Number.isFinite(pulse.age)) continue;
    if (flags.shockwaves && flags.tier !== "low") {
      const a = Math.max(0, (1 - pulse.age / .95) * .56 * intensity);
      if (a > 0) rings.write(ringCount++, pulse, a);
    }
    if (flags.footprints) {
      const a = Math.max(0, (1 - pulse.age / 1.1) * .42 * intensity);
      if (a > 0) marks.write(markCount++, pulse, a);
    }
    if (flags.trails && flags.tier === "high") {
      const a = Math.max(0, (1 - pulse.age / .65) * .25 * intensity);
      if (a > 0) trails.write(trailCount++, pulse, a);
    }
  }
  rings.finish(ringCount);
  marks.finish(markCount);
  trails.finish(trailCount);
}
