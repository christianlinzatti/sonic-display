export type LoadMetric = { name: string; milliseconds: number; at: number };
export const LOADING_METRIC_EVENT = "sonic:loading-metric";
const MAX_METRICS = 30;
const entries: LoadMetric[] = [];
export function recordLoadMetric(name: string, milliseconds: number): void {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return;
  entries.push({ name, milliseconds: Math.round(milliseconds * 10) / 10, at: Date.now() });
  if (entries.length > MAX_METRICS) entries.splice(0, entries.length - MAX_METRICS);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(LOADING_METRIC_EVENT));
}
export function getLoadMetrics(): LoadMetric[] { return entries.slice(); }
