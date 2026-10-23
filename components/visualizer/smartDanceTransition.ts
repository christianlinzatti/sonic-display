/** V136 – transition planning shared by live clip changes and stored choreography.
 * All numeric inputs are clamped. This is a lightweight planner, not a pose-matching solver.
 */
export type DanceTransitionPlan = { duration: number; phase: number; preservePhase: boolean };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo));
export function planDanceTransition(args: {
  baseSeconds: number; bpm?: number | null; genre?: string | null;
  outgoingTime?: number; outgoingDuration?: number; incomingDuration?: number;
  sameClip?: boolean; grounded?: boolean;
}): DanceTransitionPlan {
  const tempo = clamp(args.bpm ?? 120, 55, 240);
  const base = clamp(args.baseSeconds, 0.08, 1.5);
  const hard = /hardstyle|hardtekk|hardcore/i.test(args.genre ?? "");
  const rap = /rap|trap|hip.?hop/i.test(args.genre ?? "");
  // Faster tracks require shorter crossfades to avoid muddy, double-played steps.
  const beat = 60 / tempo;
  const duration = clamp(Math.min(base * (hard ? 0.75 : rap ? 1.15 : 1), beat * (hard ? 1.0 : 1.75)), 0.08, 1.5);
  const oldDuration = args.outgoingDuration ?? 0;
  const phase = oldDuration > 0 && Number.isFinite(oldDuration) ?
    ((clamp(args.outgoingTime ?? 0, 0, oldDuration) / oldDuration) % 1) : 0;
  const hasIncoming = Number.isFinite(args.incomingDuration) && (args.incomingDuration ?? 0) > 0;
  // A planted foot should not force time alignment across unrelated authored clips.
  return { duration, phase, preservePhase: !args.sameClip && !!hasIncoming && !!args.grounded && oldDuration > 0 };
}
export function matchedClipTime(plan: DanceTransitionPlan, duration: number): number {
  return clamp(plan.phase, 0, 0.999999) * Math.max(0, Number.isFinite(duration) ? duration : 0);
}
