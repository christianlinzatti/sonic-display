import type { Group, Object3D } from "three";
import { getAvatarRigProfile, type AvatarRigProfileId } from "./avatarRigProfiles";

export type AvatarRigTargets = {
  head?: Object3D;
  neck?: Object3D;
  spine?: Object3D;
  chest?: Object3D;
  hips?: Object3D;
  leftArm?: Object3D;
  rightArm?: Object3D;
  leftForearm?: Object3D;
  rightForearm?: Object3D;
  leftHand?: Object3D;
  rightHand?: Object3D;
  leftLeg?: Object3D;
  rightLeg?: Object3D;
  leftFoot?: Object3D;
  rightFoot?: Object3D;
  jaw?: Object3D;
  leftEye?: Object3D;
  rightEye?: Object3D;
};



function findNode(root: Object3D, patterns: readonly RegExp[]) {
  let result: Object3D | undefined;
  root.traverse((node) => {
    if (result) return;
    if (patterns.some((pattern) => pattern.test(node.name))) result = node;
  });
  return result;
}

export function findAvatarRigTargets(root: Object3D, profileId: AvatarRigProfileId = "auto"): AvatarRigTargets {
  const aliases = getAvatarRigProfile(profileId).aliases;
  return {
    head: findNode(root, aliases.head ?? []),
    neck: findNode(root, aliases.neck ?? []),
    spine: findNode(root, aliases.spine ?? []),
    chest: findNode(root, aliases.chest ?? []),
    hips: findNode(root, [/\bhips?\b/i, /pelvis/i, /mixamorig:?Hips/i]),
    leftArm: findNode(root, aliases.leftArm ?? []),
    rightArm: findNode(root, aliases.rightArm ?? []),
    leftForearm: findNode(root, [/left.*(forearm|lowerarm|elbow)/i, /(forearm|lowerarm).*left/i, /mixamorig:?LeftForeArm/i]),
    rightForearm: findNode(root, [/right.*(forearm|lowerarm|elbow)/i, /(forearm|lowerarm).*right/i, /mixamorig:?RightForeArm/i]),
    leftHand: findNode(root, [/left.*(hand|wrist)/i, /(hand|wrist).*left/i, /mixamorig:?LeftHand/i]),
    rightHand: findNode(root, [/right.*(hand|wrist)/i, /(hand|wrist).*right/i, /mixamorig:?RightHand/i]),
    leftLeg: findNode(root, aliases.leftLeg ?? []),
    rightLeg: findNode(root, aliases.rightLeg ?? []),
    leftFoot: findNode(root, aliases.leftFoot ?? []),
    rightFoot: findNode(root, aliases.rightFoot ?? []),
    jaw: findNode(root, [/jaw/i, /mandible/i, /mouth/i]),
    leftEye: findNode(root, [/left.*eye/i, /eye.*left/i, /lefteye/i]),
    rightEye: findNode(root, [/right.*eye/i, /eye.*right/i, /righteye/i]),
  };
}

export function describeAvatarRig(targets: AvatarRigTargets) {
  return Object.entries(targets)
    .filter(([, node]) => Boolean(node))
    .map(([slot, node]) => `${slot}:${node?.name}`)
    .join(", ");
}

export type AvatarRigMotion = {
  /** V307: subtle independent arm gestures; bounded and zero when disabled. */
  leftArmAccent?: number;
  rightArmAccent?: number;
  torsoTwist?: number;
  counterArm?: number;
  hipCounter?: number;
  headCounter?: number;
  kneeFollow?: number;
  headNod: number;
  headTurn: number;
  spineSway: number;
  hipSway: number;
  shoulderRoll: number;
  followThrough: number;
  headLag: number;
  chestPulse: number;
  armSwing: number;
  legGroove: number;
  footStep: number;
  weightShift: number;
  beatImpulse: number;
  expressionJaw: number;
  expressionBrow: number;
  expressionEyeNarrow: number;
  expressionHeadTilt: number;
};

/** Applies small local rotation overlays after authored GLTF animation clips.
 * The controller tracks the previous overlay so it adds/removes only the delta;
 * authored clip rotations remain intact instead of being overwritten.
 */
export function applyAvatarRigMotion(
  targets: AvatarRigTargets,
  motion: AvatarRigMotion,
  delta: number,
) {
  const smoothing = Math.min(1, delta * 10);
  const state = overlayState.get(targets) ?? {};
  overlayState.set(targets, state);

  const rotate = (slot: keyof AvatarRigTargets, axis: "x" | "y" | "z", target: number) => {
    const node = targets[slot];
    if (!node) return;
    const key = `${slot}.${axis}`;
    const previous = state[key] ?? 0;
    const next = previous + (target - previous) * smoothing;
    node.rotation[axis] += next - previous;
    state[key] = next;
  };

  rotate("head", "x", motion.headNod + motion.headLag);
  rotate("head", "y", motion.headTurn + (motion.headCounter ?? 0));
  rotate("neck", "x", motion.headNod * 0.55);
  rotate("neck", "y", motion.headTurn * 0.6);
  rotate("spine", "z", motion.spineSway + motion.shoulderRoll * 0.35);
  rotate("hips", "y", motion.hipSway + (motion.hipCounter ?? 0));
  rotate("spine", "y", motion.torsoTwist ?? 0);
  rotate("hips", "z", motion.weightShift * 0.08);
  rotate("chest", "x", motion.chestPulse);
  rotate("leftArm", "z", motion.armSwing + motion.followThrough + (motion.counterArm ?? 0) + (motion.leftArmAccent ?? 0));
  rotate("rightArm", "z", -motion.armSwing - motion.followThrough * 0.85 - (motion.counterArm ?? 0) + (motion.rightArmAccent ?? 0));
  rotate("leftLeg", "x", motion.legGroove + motion.weightShift * 0.12 + (motion.kneeFollow ?? 0));
  rotate("rightLeg", "x", motion.legGroove - motion.weightShift * 0.12 - (motion.kneeFollow ?? 0));
  rotate("leftFoot", "x", motion.footStep);
  rotate("rightFoot", "x", -motion.footStep);
  rotate("jaw", "x", motion.expressionJaw);
  rotate("leftEye", "x", motion.expressionEyeNarrow);
  rotate("rightEye", "x", motion.expressionEyeNarrow);
  rotate("head", "z", motion.expressionHeadTilt);
}

const overlayState = new WeakMap<AvatarRigTargets, Record<string, number>>();

export function resetAvatarRigMotion(targets: AvatarRigTargets, delta: number) {
  applyAvatarRigMotion(targets, {
    headNod: 0,
    headTurn: 0,
    spineSway: 0,
    hipSway: 0,
    shoulderRoll: 0,
    followThrough: 0,
    headLag: 0,
    chestPulse: 0,
    armSwing: 0,
    legGroove: 0,
    footStep: 0,
    weightShift: 0,
    beatImpulse: 0,
    expressionJaw: 0,
    expressionBrow: 0,
    expressionEyeNarrow: 0,
    expressionHeadTilt: 0,
  }, delta);
}

export function collectAvatarRigNodes(root: Object3D, profileId: AvatarRigProfileId = "auto") {
  const targets = findAvatarRigTargets(root, profileId);
  return { targets, description: describeAvatarRig(targets) };
}
