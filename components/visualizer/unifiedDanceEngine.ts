/** V134: shared safety/temporal compositor for additive motion, before debug masking and IK.
 * Clip animation still owns the Three.js mixer; this only processes additive joint channels.
 */
export type UnifiedMotion = Record<string, number>;
export interface UnifiedMotionState { previous: UnifiedMotion; initialized: boolean }
export interface UnifiedMotionContext {
  delta: number; playing: boolean; reducedMotion: boolean; genre?: string | null;
}
export function createUnifiedMotionState(): UnifiedMotionState {
  return {previous: {}, initialized: false};
}
const finite = (n: number) => Number.isFinite(n) ? n : 0;
const bounded = (n: number, limit: number) => Math.max(-limit, Math.min(limit, finite(n)));
const slowChannels = new Set(['spineSway','hipSway','weightShift','shoulderRoll','torsoTwist','hipCounter']);
const expressionChannels = new Set(['expressionJaw','expressionBrow','expressionEyeNarrow','expressionHeadTilt']);
/**
 * Explicit precedence: source calculation -> sanitization -> frame-rate-independent smoothing
 * -> debugger/preset masking -> rig overlay -> foot IK -> LOD correction.
 * Paused playback preserves non-kinematic expression while clearing kinetic secondary motion.
 */
export function composeUnifiedMotion<T extends UnifiedMotion>(
  state: UnifiedMotionState, source: T, context: UnifiedMotionContext
): T {
  const delta = Number.isFinite(context.delta) ? Math.max(0, Math.min(0.1, context.delta)) : 0;
  const result: UnifiedMotion = {};
  const inactive = !context.playing || context.reducedMotion;
  const rap = /deutschrap|hip.?hop|trap|rap/i.test(context.genre ?? '');
  const hard = /hardstyle|hardtekk|hardcore/i.test(context.genre ?? '');
  for (const [key, input] of Object.entries(source)) {
    const limit = expressionChannels.has(key) ? 0.8 : key === 'beatImpulse' ? 2 : 1.2;
    const target = inactive && !expressionChannels.has(key) ? 0 : bounded(input, limit);
    // Stricter easing for low-frequency torso/hip movement; sharper accents for hard dance.
    const response = slowChannels.has(key) ? (rap ? 7 : 10) : hard ? 20 : 14;
    const alpha = state.initialized ? (1 - Math.exp(-response * delta)) : 1;
    result[key] = bounded((state.previous[key] ?? target) + (target - (state.previous[key] ?? target)) * alpha, limit);
    if (inactive) result[key] = target;
  }
  state.previous = result;
  state.initialized = !inactive;
  return result as T;
}
