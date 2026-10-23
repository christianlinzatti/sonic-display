/** V237: conservative, explainable guidance from actual browser render diagnostics. */
export type PiMeasurement = { fps: number; slowPercent: number; frameMs: number; drawCalls: number; updatedAt: number };
export type PiOptimization = { quality: "balanced" | "low" | null; scene: "full" | "no-pulse" | "no-rings" | "minimal-lights"; reason: string; reliable: boolean };
export function recommendPiOptimization(m: PiMeasurement, now: number = Date.now()): PiOptimization {
  if (![m.fps, m.slowPercent, m.frameMs, m.drawCalls, m.updatedAt].every(Number.isFinite) ||
      m.fps <= 0 || m.updatedAt <= 0 || now - m.updatedAt > 3500 || m.updatedAt > now + 1000) {
    return { quality: null, scene: "full", reliable: false, reason: "Keine aktuellen, gültigen 3D-Messwerte. Avatar-Ansicht aktivieren." };
  }
  if (m.fps < 24 || m.slowPercent > 35 || m.frameMs > 42) {
    return { quality: "low", scene: "minimal-lights", reliable: true, reason: "Deutliche Render-Engpässe: niedrige Qualität und reduzierte Bühneneffekte empfohlen." };
  }
  if (m.fps < 44 || m.slowPercent > 15 || m.frameMs > 25) {
    return { quality: "balanced", scene: "no-rings", reliable: true, reason: "Schwankende Bildrate: Balanced und weniger Bühneneffekte empfohlen." };
  }
  return { quality: null, scene: "full", reliable: true, reason: "Aktuelle Bildrate stabil; kein Eingriff erforderlich." };
}
