/** V135 - deterministic foot-contact classifier. No dependency on WebGL/Three.js.
 * Input heights and velocities are in world units. A planted foot is anchored
 * until a clear lift/step is detected; hysteresis avoids rapid contact toggles.
 */
export type ContactPhase = "airborne" | "candidate" | "planted" | "releasing";
export type FootContactTracker = {
  phase: ContactPhase;
  confidence: number;
  quietSeconds: number;
  plantedX: number;
  plantedY: number;
  plantedZ: number;
};
export type FootProbe = { x: number; y: number; z: number; speed: number; verticalSpeed: number };
export function createFootContactTracker(): FootContactTracker {
  return { phase: "airborne", confidence: 0, quietSeconds: 0, plantedX: 0, plantedY: 0, plantedZ: 0 };
}
const finite = (n: number, fallback = 0) => Number.isFinite(n) ? n : fallback;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export function updateGroundContact(
  state: FootContactTracker, probe: FootProbe, floorY: number, delta: number,
  sensitivity = 0.5, contactScale = 1,
): FootContactTracker {
  const dt = clamp(finite(delta), 1 / 240, 0.1);
  const s = clamp(finite(sensitivity, 0.5), 0, 1);
  const scale = Math.max(0.1, finite(contactScale, 1));
  const height = finite(probe.y) - finite(floorY);
  const speed = Math.abs(finite(probe.speed));
  const vertical = finite(probe.verticalSpeed);
  const enterHeight = (0.012 + 0.055 * s) * scale;
  const exitHeight = enterHeight + 0.06 * scale;
  const slowEnough = speed < (0.30 + 1.15 * s) * scale;
  const canAcquire = height <= enterHeight && slowEnough && Math.abs(vertical) < (0.35 + 0.95 * s) * scale;
  const mustRelease = height > exitHeight || vertical > (0.5 + 0.85 * s) * scale || speed > (0.9 + 1.55 * s) * scale;
  if (state.phase === "planted" && mustRelease) state.phase = "releasing";
  if (state.phase !== "planted" && state.phase !== "releasing") {
    if (canAcquire) {
      state.quietSeconds += dt;
      state.phase = "candidate";
      if (state.quietSeconds >= 0.045) {
        state.phase = "planted";
        state.plantedX = finite(probe.x);
        state.plantedY = finite(probe.y);
        state.plantedZ = finite(probe.z);
      }
    } else { state.quietSeconds = 0; state.phase = "airborne"; }
  } else if (state.phase === "releasing" && state.confidence < 0.03) {
    state.phase = "airborne";
    state.quietSeconds = 0;
  }
  const target = state.phase === "planted" ? 1 : 0;
  const rate = target ? 9 : 16;
  state.confidence = clamp(state.confidence + (target - state.confidence) * (1 - Math.exp(-rate * dt)), 0, 1);
  return state;
}
