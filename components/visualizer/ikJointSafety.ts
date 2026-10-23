/** V154 - Bound only IK-generated local rotation offsets, never authored animation poses. */
import { Euler, Quaternion, Vector3, type Object3D } from "three";
import { inferAnatomicalHinge, type InferredHinge } from "./anatomicalJointAxes";
import { jointConstraintKey, normalizeConstraintMap, type JointConstraintMap } from "./jointConstraintCalibration";
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const limit = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
/** A missing constraint means no alteration, preserving V153 behavior. */
export function clampIKDelta(baseline: Quaternion, candidate: Quaternion, boneName: string, constraints?: JointConstraintMap): Quaternion {
  const bounds = constraints?.[boneName];
  if (!bounds || !baseline || !candidate) return candidate.clone();
  // Euler offsets in local XYZ space; applied only to the incremental IK correction.
  const delta = baseline.clone().invert().multiply(candidate).normalize();
  const angles = new Euler().setFromQuaternion(delta, "XYZ");
  const x = limit(angles.x * RAD, bounds.x.min, bounds.x.max) * DEG;
  const y = limit(angles.y * RAD, bounds.y.min, bounds.y.max) * DEG;
  const z = limit(angles.z * RAD, bounds.z.min, bounds.z.max) * DEG;
  return baseline.clone().multiply(new Quaternion().setFromEuler(new Euler(x,y,z,"XYZ"))).normalize();
}
/** Invalid storage and SSR return an empty map. Only explicit per-bone calibration enables clamps. */
export function readIKConstraints(modelUrl: string): JointConstraintMap {
  if (typeof window === "undefined" || !modelUrl) return {};
  try { return normalizeConstraintMap(JSON.parse(window.localStorage.getItem(jointConstraintKey(modelUrl)) ?? "{}")); }
  catch { return {}; }
}
/** Cache bone hierarchy measurements, which do not depend on the current audio frame.
 * A null inference is cached too: ambiguous rigs retain legacy V154 behavior.
 */
const inferredAxes = new WeakMap<Object3D, InferredHinge | null>();
export function autoHingeForBone(node: Object3D): InferredHinge | null {
  if (!inferredAxes.has(node)) inferredAxes.set(node, inferAnatomicalHinge(node));
  return inferredAxes.get(node) ?? null;
}
/** Project an IK-only quaternion delta onto a confident hinge axis.
 * Never change the current animated baseline or attempt to rewrite source clips.
 */
export function clampAutomaticHingeDelta(baseline: Quaternion, candidate: Quaternion, hinge: InferredHinge): Quaternion {
  const delta = baseline.clone().invert().multiply(candidate).normalize();
  const axis = hinge.localAxis;
  const along = new Vector3(delta.x, delta.y, delta.z).dot(axis);
  const angle = 2 * Math.atan2(along, delta.w);
  if (!Number.isFinite(angle)) return candidate.clone();
  const bounded = limit(angle, -hinge.maxDeltaRadians, hinge.maxDeltaRadians);
  return baseline.clone().multiply(new Quaternion().setFromAxisAngle(axis, bounded)).normalize();
}
/** Matches a bone's actual name; never writes inferred limits to user settings. */
export function applyIKJointSafety(node: Object3D, baseline: Quaternion, constraints?: JointConstraintMap) {
  // Explicit V153 calibration always wins over automatic inference.
  if (constraints?.[node.name]) {
    node.quaternion.copy(clampIKDelta(baseline,node.quaternion,node.name,constraints));
  } else {
    const inferred = autoHingeForBone(node);
    if (!inferred) return false;
    node.quaternion.copy(clampAutomaticHingeDelta(baseline, node.quaternion, inferred));
  }
  node.updateWorldMatrix(false,true);
  return true;
}
