/** V155: Conservative hinge-axis inference for rigged elbows and knees.
 * Geometry is taken from the bone hierarchy in parent-local coordinates;
 * ambiguous/straight chains deliberately produce no automatic constraint.
 */
import { Vector3, type Object3D } from "three";

export type AnatomicalJointKind = "elbow" | "knee";
export type InferredHinge = {
  kind: AnatomicalJointKind;
  /** Unit hinge axis in the joint's local space. */
  localAxis: Vector3;
  /** Conservative maximum change relative to the current animated pose. */
  maxDeltaRadians: number;
  confidence: number;
};
const EPS = 1e-8;
const ELBOW = /(?:elbow|forearm|lowerarm|lower_arm|lowerarm|unterarm)/i;
const KNEE = /(?:knee|calf|shin|lowerleg|lower_leg|unterschenkel)/i;
const valid = (v: Vector3) => [v.x, v.y, v.z].every(Number.isFinite);

export function inferAnatomicalHinge(joint: Object3D): InferredHinge | null {
  const kind: AnatomicalJointKind | null = ELBOW.test(joint.name) ? "elbow" : KNEE.test(joint.name) ? "knee" : null;
  if (!kind || !joint.parent) return null;
  const next = joint.children.find(child => child.position.lengthSq() > EPS && valid(child.position));
  if (!next || !valid(joint.position) || joint.position.lengthSq() <= EPS) return null;
  // Both vectors are in joint-parent space: map the downstream vector through
  // the joint's rest/local quaternion before taking their cross product.
  const upstream = joint.position.clone().normalize();
  const downstream = next.position.clone().applyQuaternion(joint.quaternion).normalize();
  const cross = new Vector3().crossVectors(upstream, downstream);
  const sin = cross.length();
  // Near-straight and near-folded configurations do not uniquely define a bend plane.
  if (!Number.isFinite(sin) || sin < 0.12) return null;
  const localAxis = cross.normalize().applyQuaternion(joint.quaternion.clone().invert()).normalize();
  if (!valid(localAxis)) return null;
  return {
    kind,
    localAxis,
    maxDeltaRadians: (kind === "elbow" ? 28 : 24) * Math.PI / 180,
    confidence: Math.min(1, sin / 0.45),
  };
}
