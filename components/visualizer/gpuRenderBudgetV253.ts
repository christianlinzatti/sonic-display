/** V253: cheap render-load guard. These are workload proxies, not true GPU timings. */
export type RenderBudgetTier = "high" | "balanced" | "low";
export type RenderBudgetState = { tier: RenderBudgetTier; pressureWindows: number; recoveryWindows: number };
export function initialRenderBudget(): RenderBudgetState {
  return { tier: "high", pressureWindows: 0, recoveryWindows: 0 };
}
export function renderPressure(drawCalls: number, triangles: number): boolean {
  return (Number.isFinite(drawCalls) && drawCalls > 170) ||
    (Number.isFinite(triangles) && triangles > 420000);
}
const nextLower = (tier: RenderBudgetTier): RenderBudgetTier => tier === "high" ? "balanced" : "low";
const nextHigher = (tier: RenderBudgetTier): RenderBudgetTier => tier === "low" ? "balanced" : "high";
/** One observation per second. Three costly windows to lower, ten stable windows to recover. */
export function advanceRenderBudget(state: RenderBudgetState, costly: boolean): RenderBudgetState {
  if (costly) {
    const pressureWindows = state.pressureWindows + 1;
    return pressureWindows >= 3
      ? { tier: nextLower(state.tier), pressureWindows: 0, recoveryWindows: 0 }
      : { ...state, pressureWindows, recoveryWindows: 0 };
  }
  const recoveryWindows = state.recoveryWindows + 1;
  return recoveryWindows >= 10
    ? { tier: nextHigher(state.tier), pressureWindows: 0, recoveryWindows: 0 }
    : { ...state, pressureWindows: 0, recoveryWindows };
}
export function limitDpr(baseDpr: number, tier: RenderBudgetTier): number {
  return Math.min(baseDpr, tier === "high" ? 1.5 : tier === "balanced" ? 1.15 : 0.8);
}
