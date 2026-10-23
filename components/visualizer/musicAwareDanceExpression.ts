import type { BeatFlowResult } from "./beatFlowDetector";

/** V138: restrained, deterministic accents layered onto the existing V134 motion pipeline.
 * Kick and snare are audio-band estimates, not isolated instrument detection.
 * All rotations are in radians, bounded to preserve authored clips and foot IK.
 */
export interface DanceExpressionAccents {
  headNod: number;
  shoulderRoll: number;
  armSwing: number;
  chestPulse: number;
  expressionJaw: number;
  expressionBrow: number;
  expressionEyeNarrow: number;
  expressionHeadTilt: number;
}
export const NEUTRAL_DANCE_EXPRESSION: DanceExpressionAccents = {
  headNod: 0, shoulderRoll: 0, armSwing: 0, chestPulse: 0,
  expressionJaw: 0, expressionBrow: 0, expressionEyeNarrow: 0, expressionHeadTilt: 0
};
const clamp = (value: number, high = 1): number => Number.isFinite(value) ? Math.max(0, Math.min(high, value)) : 0;
export function computeMusicAwareDanceExpression(
  flow: BeatFlowResult,
  playing: boolean,
  reducedMotion: boolean,
  intensity = 1,
): DanceExpressionAccents {
  if (!playing || reducedMotion) return { ...NEUTRAL_DANCE_EXPRESSION };
  const scale = clamp(intensity, 1.5);
  const kick = clamp(flow.kickOnset);
  const snare = clamp(flow.snareOnset);
  const groove = clamp(flow.groove);
  const rap = flow.style === "rap-halftime";
  const hard = flow.style === "hard-kick";
  return {
    headNod: scale * (rap ? -(0.045 * snare + 0.016 * groove) : -(0.025 * kick + 0.01 * groove)),
    shoulderRoll: scale * (rap ? 0.045 * snare : 0.025 * kick),
    armSwing: scale * (hard ? 0.075 * kick : rap ? 0.036 * snare : 0.032 * (kick + snare) / 2),
    chestPulse: scale * (hard ? 0.05 * kick : 0.025 * groove),
    expressionJaw: scale * (rap ? 0.04 * snare : 0.025 * kick),
    expressionBrow: scale * (hard ? 0.04 * kick : 0.015 * snare),
    expressionEyeNarrow: scale * (hard ? 0.04 * kick : 0.01 * groove),
    expressionHeadTilt: scale * (rap ? 0.012 * snare : 0.008 * groove),
  };
}
