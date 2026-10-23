/** V255: bounded, in-memory history of actual rendering-quality changes. */
export type QualityDecisionRecord = Readonly<{
  at: number; from: "high" | "balanced" | "low"; to: "high" | "balanced" | "low";
  reason: string; fps: number; p95FrameMs: number; slowPercent: number;
  drawCalls: number; triangles: number; deviceCap: "high" | "balanced" | "low";
}>;
const MAX_ENTRIES = 24;
let entries: readonly QualityDecisionRecord[] = [];
const listeners = new Set<() => void>();
export function recordQualityDecision(entry: QualityDecisionRecord): void {
  if (entry.from === entry.to || !Number.isFinite(entry.at)) return;
  entries = [entry, ...entries].slice(0, MAX_ENTRIES);
  listeners.forEach(listener => listener());
}
export function getQualityDecisionHistory(): readonly QualityDecisionRecord[] { return entries; }
export function getServerQualityDecisionHistory(): readonly QualityDecisionRecord[] { return []; }
export function subscribeQualityDecisionHistory(listener: () => void): () => void {
  listeners.add(listener); return () => { listeners.delete(listener); };
}
export function clearQualityDecisionHistory(): void { entries = []; listeners.forEach(listener => listener()); }
