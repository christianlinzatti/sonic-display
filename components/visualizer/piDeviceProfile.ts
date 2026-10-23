/** V165: Browser-visible device hints; no privileged hardware detection. */
export type PiProfile = "off" | "auto" | "pi-low" | "pi-balanced";
export const PI_PROFILE_KEY = "sonic-display:v165:pi-profile";
export type PiHints = { platform: string; cores: number | null; memoryGb: number | null; likelyPi: boolean; reason: string };
export function detectPiHints(userAgent: string, cores?: number, memoryGb?: number): PiHints {
  const ua = userAgent.toLowerCase();
  const linuxArm = /linux/.test(ua) && /arm|aarch64/.test(ua);
  const identified = /raspberry pi|raspbian/.test(ua);
  const likelyPi = identified || linuxArm;
  return {
    platform: identified ? "Raspberry Pi (Browser-Hinweis)" : linuxArm ? "Linux ARM (möglicher Pi)" : "Unbekannt / anderes Gerät",
    cores: Number.isFinite(cores) && (cores ?? 0) > 0 ? cores! : null,
    memoryGb: Number.isFinite(memoryGb) && (memoryGb ?? 0) > 0 ? memoryGb! : null,
    likelyPi,
    reason: identified ? "Browser meldet Raspberry Pi" : linuxArm ? "Linux ARM – nicht eindeutig Raspberry Pi" : "Keine zuverlässige Raspberry-Pi-Kennung",
  };
}
export function resolvePiQuality(profile: PiProfile, hints: PiHints): "low" | "balanced" | null {
  if (profile === "off") return null;
  if (profile === "pi-low") return "low";
  if (profile === "pi-balanced") return "balanced";
  if (!hints.likelyPi) return null;
  return hints.memoryGb !== null && hints.memoryGb >= 6 && hints.cores !== null && hints.cores >= 4 ? "balanced" : "low";
}
export function normalizePiProfile(value: string | null): PiProfile {
  return value === "auto" || value === "pi-low" || value === "pi-balanced" ? value : "off";
}
export function readPiProfile(): PiProfile {
  if (typeof window === "undefined") return "off";
  try { return normalizePiProfile(window.localStorage.getItem(PI_PROFILE_KEY)); } catch { return "off"; }
}
export function writePiProfile(value: PiProfile) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(PI_PROFILE_KEY, value); } catch { /* kiosk storage may be disabled */ }
  window.dispatchEvent(new Event("sonic:pi-profile-changed"));
}
