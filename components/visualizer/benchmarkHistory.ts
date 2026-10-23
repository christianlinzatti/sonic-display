export type BenchmarkResult = { tier: "high" | "balanced" | "low"; fps: number; frameMs: number; slowPercent: number; calls: number; triangles: number; samples: number };
export type BenchmarkHistory = { id: string; createdAt: string; avatar: string; lyricsStyle: string; userAgent: string; results: BenchmarkResult[] };
const KEY = "sonic-benchmark-history-v122";
export function loadBenchmarkHistory(): BenchmarkHistory[] {
  if (typeof localStorage === "undefined") return [];
  try { const data: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data.filter((x): x is BenchmarkHistory => Boolean(x && typeof x === "object" && typeof x.id === "string" && Array.isArray(x.results))).slice(0, 40) : [];
  } catch { return []; }
}
export function saveBenchmarkHistory(item: BenchmarkHistory): BenchmarkHistory[] {
  const history = [item, ...loadBenchmarkHistory()].slice(0, 40);
  try { localStorage.setItem(KEY, JSON.stringify(history)); } catch { /* storage unavailable */ }
  return history;
}
const quote = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
export function exportBenchmarkCsv(history: BenchmarkHistory[]): string {
  const header = "timestamp,avatar,lyricsStyle,quality,fps,frameMs,slowPercent,drawCalls,triangles,samples";
  return "\uFEFF" + [header, ...history.flatMap(h => h.results.map(r => [h.createdAt, h.avatar, h.lyricsStyle, r.tier, r.fps, r.frameMs, r.slowPercent, r.calls, r.triangles, r.samples].map(quote).join(",")))].join("\r\n");
}
