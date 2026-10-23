/** V285: local-only, low-cost runtime timing checkpoints. No telemetry export. */
export type RuntimeCheckpoint = Readonly<{ name: string; elapsedMs: number; at: number }>;
export const RUNTIME_PERFORMANCE_EVENT = "sonic:runtime-performance-v285";
const LIMIT = 40;
const checkpoints: RuntimeCheckpoint[] = [];
const seen = new Set<string>();

export function recordRuntimeCheckpoint(name: string, elapsedMs?: number): void {
  if (typeof window === "undefined" || typeof performance === "undefined" || seen.has(name)) return;
  const elapsed = elapsedMs ?? performance.now();
  if (!Number.isFinite(elapsed) || elapsed < 0) return;
  seen.add(name);
  checkpoints.push({ name, elapsedMs: Math.round(elapsed * 10) / 10, at: Date.now() });
  if (checkpoints.length > LIMIT) checkpoints.shift();
  window.dispatchEvent(new Event(RUNTIME_PERFORMANCE_EVENT));
}

export function getRuntimeCheckpoints(): readonly RuntimeCheckpoint[] {
  return [...checkpoints];
}

export type NavigationSnapshot = Readonly<{
  domContentLoadedMs: number | null;
  loadMs: number | null;
  responseEndMs: number | null;
  firstPaintMs: number | null;
  firstContentfulPaintMs: number | null;
}>;

export function getNavigationSnapshot(): NavigationSnapshot {
  if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") {
    return { domContentLoadedMs: null, loadMs: null, responseEndMs: null, firstPaintMs: null, firstContentfulPaintMs: null };
  }
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const paints = performance.getEntriesByType("paint");
  const paint = (name: string) => paints.find(entry => entry.name === name)?.startTime ?? null;
  const valid = (value?: number): number | null => value && Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  return {
    domContentLoadedMs: valid(navigation?.domContentLoadedEventEnd),
    loadMs: valid(navigation?.loadEventEnd),
    responseEndMs: valid(navigation?.responseEnd),
    firstPaintMs: paint("first-paint"),
    firstContentfulPaintMs: paint("first-contentful-paint"),
  };
}

export function getJsHeapMiB(): number | null {
  if (typeof performance === "undefined") return null;
  const memory = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory;
  const value = memory?.usedJSHeapSize;
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value / (1024 * 1024) * 10) / 10 : null;
}
