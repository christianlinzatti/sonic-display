import type { CalibrationResult, CalibrationTier } from "./autoCalibrationAdvisor";
import type { SceneDetail } from "./scenePerformanceControls";

export const DEVICE_PROFILE_KEY = "sonic-display-device-calibration-v240";
export type DeviceProfile = { schema: 1; fingerprint: string; tier: CalibrationTier; scene: SceneDetail; savedAt: number; fps: number; samples: number };
const tiers: CalibrationTier[] = ["low", "balanced", "high"];
const scenes: SceneDetail[] = ["full", "no-pulse", "no-rings", "minimal-lights"];
export function deviceFingerprint(info: { platform?: string; cores?: number; memory?: number; width?: number; height?: number; dpr?: number }): string {
  const cores = Number.isFinite(info.cores) ? Math.max(0, Math.min(128, Math.floor(info.cores!))) : 0;
  const memory = Number.isFinite(info.memory) ? Math.max(0, Math.min(256, info.memory!)) : 0;
  const width = Number.isFinite(info.width) ? Math.max(0, Math.min(16384, Math.round(info.width!))) : 0;
  const height = Number.isFinite(info.height) ? Math.max(0, Math.min(16384, Math.round(info.height!))) : 0;
  const dpr = Number.isFinite(info.dpr) ? Math.max(0, Math.min(8, Math.round(info.dpr! * 10) / 10)) : 0;
  return JSON.stringify([String(info.platform || "unknown").slice(0, 90), cores, memory, width, height, dpr]);
}
export function currentDeviceFingerprint(): string {
  if (typeof window === "undefined") return "server";
  const nav = navigator as Navigator & { deviceMemory?: number; userAgentData?: { platform?: string } };
  return deviceFingerprint({ platform: nav.userAgentData?.platform || nav.platform, cores: nav.hardwareConcurrency, memory: nav.deviceMemory, width: window.screen.width, height: window.screen.height, dpr: window.devicePixelRatio });
}
export function validateDeviceProfile(value: unknown): DeviceProfile | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Partial<DeviceProfile>;
  if (p.schema !== 1 || typeof p.fingerprint !== "string" || p.fingerprint.length > 300 || !tiers.includes(p.tier as CalibrationTier) || !scenes.includes(p.scene as SceneDetail)) return null;
  if (![p.savedAt,p.fps,p.samples].every(v => typeof v === "number" && Number.isFinite(v))) return null;
  if (p.savedAt! <= 0 || p.fps! <= 0 || p.fps! > 300 || p.samples! < 2 || p.samples! > 1e6) return null;
  return { schema: 1, fingerprint: p.fingerprint, tier: p.tier!, scene: p.scene!, savedAt: p.savedAt!, fps: p.fps!, samples: p.samples! };
}
export function loadDeviceProfile(fingerprint: string): DeviceProfile | null {
  try { if (typeof localStorage === "undefined") return null; const p = validateDeviceProfile(JSON.parse(localStorage.getItem(DEVICE_PROFILE_KEY) || "null")); return p?.fingerprint === fingerprint ? p : null; } catch { return null; }
}
export function saveDeviceProfile(fingerprint: string, result: CalibrationResult): DeviceProfile | null {
  if (!fingerprint || !Number.isFinite(result.fps) || result.fps <= 0 || !Number.isFinite(result.samples) || result.samples < 2) return null;
  const profile = validateDeviceProfile({ schema: 1, fingerprint, tier: result.tier, scene: result.scene, savedAt: Date.now(), fps: result.fps, samples: result.samples });
  if (!profile) return null;
  try { localStorage.setItem(DEVICE_PROFILE_KEY, JSON.stringify(profile)); return profile; } catch { return null; }
}
export function clearDeviceProfile(): boolean { try { localStorage.removeItem(DEVICE_PROFILE_KEY); return true; } catch { return false; } }
