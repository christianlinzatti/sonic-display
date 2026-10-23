import type { AnimationClip, KeyframeTrack } from "three";

/** Lightweight pose and velocity comparison using matching retargeted track names. */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const finite = (v: number) => Number.isFinite(v) ? v : 0;
const sample = (track: KeyframeTrack, time: number): number[] => {
  // Three.js installs createInterpolant at runtime according to the track interpolation mode.
  // Some @types/three releases omit the instance method from KeyframeTrack.
  const interpolant = (track as KeyframeTrack & {
    createInterpolant(): { evaluate(time: number): ArrayLike<number> };
  }).createInterpolant();
  return Array.from(interpolant.evaluate(time)).map(finite);
};
export type MotionMatch = { time: number; score: number; comparedTracks: number };
export function findMotionMatch(from: AnimationClip, to: AnimationClip, outgoingTime: number, candidates = 16): MotionMatch {
  if (!Number.isFinite(to.duration) || to.duration <= 0) return { time: 0, score: Infinity, comparedTracks: 0 };
  const outgoing = new Map(from.tracks.map(track => [track.name, track]));
  const matching = to.tracks.filter(track => outgoing.has(track.name) && outgoing.get(track.name)?.getValueSize() === track.getValueSize());
  if (!matching.length) return { time: 0, score: Infinity, comparedTracks: 0 };
  const fromAt = clamp(Number.isFinite(outgoingTime) ? outgoingTime : 0, 0, Math.max(0, from.duration));
  const delta = 0.04;
  let best: MotionMatch = { time: 0, score: Infinity, comparedTracks: matching.length };
  const count = clamp(Math.round(candidates), 2, 48);
  for (let i = 0; i < count; i++) {
    const t = (i / count) * to.duration;
    let distance = 0, dimensions = 0;
    for (const incoming of matching) {
      const previous = outgoing.get(incoming.name)!;
      const a = sample(previous, fromAt), b = sample(incoming, t);
      const av = sample(previous, Math.min(from.duration, fromAt + delta));
      const bv = sample(incoming, Math.min(to.duration, t + delta));
      // Quaternion tracks are compared sign-invariantly (q and -q represent the same rotation).
      const isQuaternion = incoming.name.endsWith('.quaternion') && a.length === 4;
      const sign = isQuaternion && a.reduce((sum, x, j) => sum + x * b[j], 0) < 0 ? -1 : 1;
      for (let j = 0; j < a.length; j++) {
        const pose = a[j] - sign * b[j];
        const velocity = (av[j] - a[j]) - sign * (bv[j] - b[j]);
        distance += pose * pose + velocity * velocity * 0.35;
        dimensions++;
      }
    }
    const score = distance / Math.max(1, dimensions);
    if (score < best.score) best = { time: t, score, comparedTracks: matching.length };
  }
  return best;
}
