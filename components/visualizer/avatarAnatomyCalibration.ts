/** V151 – static rig anatomy diagnostics; measurements are descriptive, not anatomical guarantees. */
import { Vector3, type Object3D } from "three";
import { findAvatarRigTargets, type AvatarRigTargets } from "./avatarRigController";

export type AnatomyMeasurement = {
  height: number | null;
  shoulderWidth: number | null;
  leftArmLength: number | null;
  rightArmLength: number | null;
  leftLegLength: number | null;
  rightLegLength: number | null;
  torsoLength: number | null;
  detected: number;
  total: number;
  warnings: string[];
  landmarks: { slot: string; bone: string; position: [number, number, number] }[];
};
const positive = (value: number): number | null => Number.isFinite(value) && value > 0.001 && value < 20 ? value : null;
const point = (node?: Object3D): Vector3 | null => node ? node.getWorldPosition(new Vector3()) : null;
const distance = (a?: Object3D, b?: Object3D): number | null => {
  const pa = point(a), pb = point(b);
  return pa && pb ? positive(pa.distanceTo(pb)) : null;
};
const chain = (...nodes: (Object3D | undefined)[]): number | null => {
  if (nodes.some(n => !n)) return null;
  const lengths = nodes.slice(1).map((node, i) => distance(nodes[i], node));
  return lengths.every(n => n !== null) ? positive((lengths as number[]).reduce((a, b) => a + b, 0)) : null;
};
const vec = (p: Vector3): [number, number, number] => [p.x, p.y, p.z];

export function measureAvatarAnatomy(root: Object3D, targets?: AvatarRigTargets): AnatomyMeasurement {
  root.updateWorldMatrix(true, true);
  const rig = targets ?? findAvatarRigTargets(root);
  const keys = ["head", "neck", "spine", "chest", "hips", "leftArm", "rightArm", "leftForearm", "rightForearm", "leftHand", "rightHand", "leftLeg", "rightLeg", "leftFoot", "rightFoot"] as const;
  const landmarks = keys.flatMap(slot => { const node = rig[slot]; const p = point(node); return node && p ? [{slot, bone: node.name, position: vec(p)}] : []; });
  const height = rig.head && (rig.leftFoot || rig.rightFoot)
    ? positive(Math.abs(point(rig.head)!.y - Math.min(...[rig.leftFoot, rig.rightFoot].filter((v): v is Object3D => !!v).map(n => point(n)!.y))))
    : null;
  const shoulderWidth = distance(rig.leftArm, rig.rightArm);
  const leftArmLength = chain(rig.leftArm, rig.leftForearm, rig.leftHand);
  const rightArmLength = chain(rig.rightArm, rig.rightForearm, rig.rightHand);
  // Only a partial leg distance is available without reliable knee landmarks.
  const leftLegLength = distance(rig.leftLeg, rig.leftFoot);
  const rightLegLength = distance(rig.rightLeg, rig.rightFoot);
  const torsoLength = distance(rig.hips, rig.chest ?? rig.spine);
  const warnings: string[] = [];
  if (!leftArmLength || !rightArmLength) warnings.push("Unvollständige Armketten: Hand-IK möglicherweise eingeschränkt.");
  if (!rig.hips || !rig.leftFoot || !rig.rightFoot) warnings.push("Bein-/Hüft-Landmarks fehlen: Grounding nur eingeschränkt beurteilbar.");
  if (!height) warnings.push("Keine zuverlässige Höhenabschätzung möglich.");
  return { height, shoulderWidth, leftArmLength, rightArmLength, leftLegLength, rightLegLength, torsoLength,
    detected: landmarks.length, total: keys.length, warnings, landmarks };
}
