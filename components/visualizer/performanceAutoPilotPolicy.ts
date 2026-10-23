/** V239: conservative, reversible scene quality policy. Pure logic, no render-thread allocations. */
export type PilotScene = "full" | "no-pulse" | "no-rings" | "minimal-lights";
export type PilotTelemetry = { fps: number; slowPercent: number; updatedAt: number };
export type PilotState = { level: number; bad: number; good: number; lastChangeAt: number; lastSampleAt: number };
export const pilotScenes: PilotScene[] = ["full", "no-pulse", "no-rings", "minimal-lights"];
export const initialPilotState = (now = 0): PilotState => ({ level: 0, bad: 0, good: 0, lastChangeAt: now, lastSampleAt: 0 });
export function advancePilot(state: PilotState, sample: PilotTelemetry, now: number): PilotState {
  if (!Number.isFinite(now) || !Number.isFinite(sample.updatedAt) || sample.updatedAt <= state.lastSampleAt || now - sample.updatedAt > 3500 || now < sample.updatedAt ||
    !Number.isFinite(sample.fps) || !Number.isFinite(sample.slowPercent) || sample.fps < 1 || sample.fps > 300 || sample.slowPercent < 0 || sample.slowPercent > 100) return state;
  const bad = sample.fps < 40 || sample.slowPercent > 34;
  const good = sample.fps > 55 && sample.slowPercent < 15;
  const next = { ...state, bad: bad ? state.bad + 1 : 0, good: good ? state.good + 1 : 0, lastSampleAt: sample.updatedAt };
  if (now - state.lastChangeAt < 14000) return next;
  if (next.bad >= 4 && next.level < pilotScenes.length - 1) return { ...next, level: next.level + 1, bad: 0, good: 0, lastChangeAt: now };
  if (next.good >= 12 && next.level > 0) return { ...next, level: next.level - 1, bad: 0, good: 0, lastChangeAt: now };
  return next;
}
