import { Object3D, Vector3 } from "three";
import type { AvatarRigTargets } from "./avatarRigController";

/** Lightweight ground-contact correction for heterogeneous humanoid GLBs.
 * It stabilizes the model's floor-relative root offset. It deliberately does
 * not reposition knee joints: that would require verified limb chains and a
 * proper two-bone IK solver for each avatar rig.
 */
export type FootContactState = {
  initialized: boolean;
  floorY: number;
  correction: number;
  lastContact: "left" | "right" | "both" | "none";
};

export const createFootContactState = (): FootContactState => ({
  initialized: false, floorY: 0, correction: 0, lastContact: "none",
});

const leftPosition = new Vector3();
const rightPosition = new Vector3();

export function updateFootContact(
  contact: FootContactState,
  root: Object3D,
  targets: AvatarRigTargets,
  delta: number,
  active: boolean,
  strength = 0.65,
) {
  const left = targets.leftFoot;
  const right = targets.rightFoot;
  // Undo the previous offset before probing, so the feedback cannot drift.
  root.position.y -= contact.correction;
  contact.correction = 0;
  if (!left || !right || !active) {
    contact.lastContact = "none";
    return;
  }
  root.updateWorldMatrix(true, true);
  left.getWorldPosition(leftPosition);
  right.getWorldPosition(rightPosition);
  const lowest = Math.min(leftPosition.y, rightPosition.y);
  if (!Number.isFinite(lowest)) return;
  if (!contact.initialized) {
    contact.floorY = lowest;
    contact.initialized = true;
  }
  // Only modestly correct penetration/lift. Avoid pulling the avatar down
  // aggressively when BOTH feet lift (jumping or exaggerated choreography).
  const distance = contact.floorY - lowest;
  const bounded = Math.max(-0.065, Math.min(0.11, distance));
  const gain = Math.min(1, Math.max(0, delta) * 9);
  const correction = bounded * gain * Math.max(0, Math.min(1, strength));
  root.position.y += correction;
  contact.correction = correction;
  const threshold = 0.065;
  const nearLeft = Math.abs(leftPosition.y - contact.floorY) < threshold;
  const nearRight = Math.abs(rightPosition.y - contact.floorY) < threshold;
  contact.lastContact = nearLeft && nearRight ? "both" : nearLeft ? "left" : nearRight ? "right" : "none";
}
