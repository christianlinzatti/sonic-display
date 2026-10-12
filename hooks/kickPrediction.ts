/** Predictive pre-kick envelope derived only from a confidently locked microphone beat grid.
 * It does not predict musical drops or classify instruments. The output rises in the
 * final lookahead window and falls to zero at the expected beat boundary.
 */
export interface KickPrediction { anticipation: number; timeToKickMs: number | null; reliable: boolean }
export function predictNextKick(phase: number | null, bpm: number | null, phaseConfidence: number, locked: boolean, lookaheadMs = 140): KickPrediction {
  if (!locked || phase === null || !Number.isFinite(phase) || bpm === null || !Number.isFinite(bpm) || bpm <= 0 || phaseConfidence < 0.55)
    return { anticipation: 0, timeToKickMs: null, reliable: false };
  const period = 60000 / bpm;
  const normalized = ((phase % 1) + 1) % 1;
  const remaining = (1 - normalized) * period;
  const window = Math.min(Math.max(40, lookaheadMs), period * 0.45);
  const progress = Math.max(0, Math.min(1, (window - remaining) / window));
  // Smoothstep avoids a sharp transition into the preparatory movement.
  const anticipation = (progress * progress * (3 - 2 * progress)) * Math.min(1, phaseConfidence);
  return { anticipation, timeToKickMs: Math.round(remaining), reliable: true };
}
