/** V297: bounds-aware framing for the actual animated avatar group. */
export const SMART_CAMERA_TRACKING_KEY = "sonic-display-smart-camera-tracking-v297";
export const SMART_CAMERA_TRACKING_EVENT = "sonic-display-smart-camera-tracking-changed-v297";
export const TRACKING_ROOT_NAME = "sonic-display-animated-avatar-root-v297";
export function readSmartCameraTrackingEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(SMART_CAMERA_TRACKING_KEY) === "true"; } catch { return false; }
}
export function writeSmartCameraTrackingEnabled(value: boolean): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SMART_CAMERA_TRACKING_KEY, String(value)); } catch { /* unavailable */ }
  window.dispatchEvent(new Event(SMART_CAMERA_TRACKING_EVENT));
}
export type TrackingBounds = { centerX: number; centerY: number; width: number; height: number };
/** Adds distance only when the figure no longer fits the camera's vertical/horizontal field of view. */
export function frameTrackedAvatar(bounds: TrackingBounds, cameraZ: number, fov: number, aspect: number, duo: boolean) {
  const height = Math.max(0, Math.min(8, bounds.height));
  const width = Math.max(0, Math.min(12, bounds.width));
  const halfAngle = Math.max(.1, Math.min(1.3, fov * Math.PI / 360));
  const verticalDistance = height * 1.12 / (2 * Math.tan(halfAngle));
  const horizontalDistance = width * 1.12 / (2 * Math.tan(halfAngle) * Math.max(.45, aspect));
  const minimum = duo ? 4.8 : 3.2;
  return {
    z: Math.max(cameraZ, minimum, Math.min(18, verticalDistance, 18), Math.min(18, horizontalDistance)),
    targetX: Math.max(-3.5, Math.min(3.5, bounds.centerX)),
    targetY: Math.max(-1, Math.min(3.5, bounds.centerY))
  };
}
