/** V254 passive, device-scoped rendering calibration. No synthetic GPU workload. */
export type CalibratedTier = "high" | "balanced" | "low";
export type CalibrationSample = { fps: number; slowRatio: number; p95FrameMs: number; calls: number; triangles: number };
export type DeviceRenderCalibration = { schema: 1; fingerprint: string; tier: CalibratedTier; collectedAt: number; samples: number; avgFps: number };
const KEY = "sonic-device-render-calibration-v254";
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const tierRank: Record<CalibratedTier, number> = { low: 0, balanced: 1, high: 2 };
export function capCalibratedTier(requested: CalibratedTier, cap: CalibratedTier): CalibratedTier {
  return tierRank[requested] <= tierRank[cap] ? requested : cap;
}
export function chooseDeviceRenderTier(samples: readonly CalibrationSample[]): CalibratedTier | null {
  if (samples.length < 8) return null;
  const clean = samples.filter(s => Number.isFinite(s.fps) && s.fps > 0 && s.fps <= 240 &&
    Number.isFinite(s.slowRatio) && s.slowRatio >= 0 && s.slowRatio <= 1 &&
    Number.isFinite(s.p95FrameMs) && s.p95FrameMs >= 0 && Number.isFinite(s.calls) && Number.isFinite(s.triangles));
  if (clean.length < 8) return null;
  const avg = (f: (v: CalibrationSample) => number) => clean.reduce((sum, s) => sum + f(s), 0) / clean.length;
  const fps = avg(s => s.fps);
  const slow = avg(s => s.slowRatio);
  const p95 = avg(s => s.p95FrameMs);
  const calls = avg(s => s.calls);
  const triangles = avg(s => s.triangles);
  if (fps < 38 || slow > 0.29 || p95 > 42) return "low";
  if (fps < 54 || slow > 0.12 || p95 > 27 || calls > 210 || triangles > 520000) return "balanced";
  return "high";
}
export function validateDeviceRenderCalibration(raw: unknown, fingerprint: string, now: number): DeviceRenderCalibration | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<DeviceRenderCalibration>;
  if (p.schema !== 1 || p.fingerprint !== fingerprint || !["low", "balanced", "high"].includes(p.tier || "") ||
      typeof p.collectedAt !== "number" || !Number.isFinite(p.collectedAt) || p.collectedAt > now + 60000 ||
      now - p.collectedAt > MAX_AGE_MS || typeof p.samples !== "number" || p.samples < 8 || p.samples > 120 ||
      typeof p.avgFps !== "number" || !Number.isFinite(p.avgFps) || p.avgFps <= 0 || p.avgFps > 240) return null;
  return p as DeviceRenderCalibration;
}
export function readDeviceRenderCalibration(fingerprint: string, now = Date.now()): DeviceRenderCalibration | null {
  try { if (typeof window === "undefined") return null;
    return validateDeviceRenderCalibration(JSON.parse(window.localStorage.getItem(KEY) || "null"), fingerprint, now);
  } catch { return null; }
}
export function writeDeviceRenderCalibration(fingerprint: string, tier: CalibratedTier, samples: readonly CalibrationSample[], now = Date.now()): void {
  if (!fingerprint || samples.length < 8 || typeof window === "undefined") return;
  const profile: DeviceRenderCalibration = { schema: 1, fingerprint, tier, collectedAt: now, samples: samples.length,
    avgFps: samples.reduce((sum, s) => sum + s.fps, 0) / samples.length };
  try { window.localStorage.setItem(KEY, JSON.stringify(profile)); } catch { /* private browsing */ }
}
export function clearDeviceRenderCalibration(): void {
  try { if (typeof window !== "undefined") window.localStorage.removeItem(KEY); } catch { /* unavailable */ }
}
