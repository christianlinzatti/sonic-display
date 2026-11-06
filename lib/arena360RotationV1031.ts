/** V1031 · rotation of the entire 360° turntable, including the cast.
 * Pure state transition. No hidden timer, Spotify polling or per-frame allocations.
 */
export const ARENA360_DEFAULT_SPEED_V1031 = 90; // degrees / minute
export const ARENA360_MAX_SPEED_V1031 = 180;

export function normalizedArenaSpeedV1031(value: number | null | undefined): number {
  return Number.isFinite(value) ? Math.min(ARENA360_MAX_SPEED_V1031, Math.max(0, value!)) : ARENA360_DEFAULT_SPEED_V1031;
}

export function stepArenaRotationV1031(angle: number, deltaSeconds: number, options: {
  playing: boolean;
  reducedMotion: boolean;
  enabled: boolean;
  speedDegPerMinute: number;
  bass?: number;
  reactive?: boolean;
}): number {
  const previous = Number.isFinite(angle) ? (angle >= 0 && angle < Math.PI * 2
    ? angle : ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) : 0;
  if (!options.playing || options.reducedMotion || !options.enabled) return previous;
  const delta = Number.isFinite(deltaSeconds) ? Math.max(0, Math.min(0.1, deltaSeconds)) : 0;
  const speed = normalizedArenaSpeedV1031(options.speedDegPerMinute);
  const bass = Number.isFinite(options.bass) ? Math.min(1, Math.max(0, options.bass!)) : 0;
  // A very small bass boost; never jump the stage on a kick or a drop.
  const multiplier = options.reactive ? 1 + bass * 0.15 : 1;
  return (previous + delta * speed * Math.PI / 10800 * multiplier) % (Math.PI * 2);
}
