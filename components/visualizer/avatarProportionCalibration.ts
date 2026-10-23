/** V150 – conservative, per-rig automatic proportion measurement. */
import { Vector3, type Object3D } from "three";
import { normalizeContactCalibration, type ContactCalibration } from "./partnerContactCalibration";

export type ContactRig = { rightArm?: Object3D; rightForearm?: Object3D; rightHand?: Object3D; chest?: Object3D; spine?: Object3D };
export type AvatarProportions = { upperArm: number; forearm: number; armLength: number; torsoHeight: number | null; confidence: number };
const point = (node: Object3D): Vector3 => node.getWorldPosition(new Vector3());
const safeLength = (a: Object3D, b: Object3D): number => point(a).distanceTo(point(b));
const finiteLength = (n: number): boolean => Number.isFinite(n) && n > 0.035 && n < 5;

/** Call after matrices are updated. Returns null for incomplete or degenerate rigs. */
export function measureAvatarProportions(rig: ContactRig): AvatarProportions | null {
  const {rightArm: shoulder, rightForearm: elbow, rightHand: wrist} = rig;
  if (!shoulder || !elbow || !wrist) return null;
  shoulder.updateWorldMatrix(true, true);
  const upperArm = safeLength(shoulder, elbow);
  const forearm = safeLength(elbow, wrist);
  if (!finiteLength(upperArm) || !finiteLength(forearm)) return null;
  const armLength = upperArm + forearm;
  const direct = safeLength(shoulder, wrist);
  if (!finiteLength(direct) || direct > armLength * 1.03) return null;
  const torsoNode = rig.spine ?? rig.chest;
  const torso = torsoNode ? safeLength(shoulder, torsoNode) : null;
  const torsoHeight = torso !== null && finiteLength(torso) ? torso : null;
  return { upperArm, forearm, armLength, torsoHeight,
    confidence: torsoHeight !== null ? 1 : 0.8 };
}

/** Estimate reach relative to a reference-sized rig. User calibration remains an override. */
export function automaticContactCalibration(measurement: AvatarProportions | null): ContactCalibration {
  if (!measurement || !finiteLength(measurement.armLength)) return normalizeContactCalibration();
  // The solver accepts a bounded multiplier; do not amplify disproportionate rigs.
  const reach = measurement.armLength / 0.75;
  // Without trustworthy ground/hip landmarks, never guess a world-space contact height.
  return normalizeContactCalibration({reach, height: 0, strength: 1});
}

/** Multiplicative manual reach + additive manual contact-height fine tuning. */
export function resolveContactCalibration(
  user: Partial<ContactCalibration> | null | undefined,
  measurement: AvatarProportions | null,
): ContactCalibration {
  const manual = normalizeContactCalibration(user);
  const automatic = automaticContactCalibration(measurement);
  return normalizeContactCalibration({
    reach: manual.reach * automatic.reach,
    height: manual.height + automatic.height,
    strength: manual.strength,
  });
}
