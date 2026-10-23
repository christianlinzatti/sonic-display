import {createGroundLockStateV322,resetGroundLockV322,isFootLockDiscontinuityV322,updateGroundEstimateV322,updateFootLockTargetV322,type FootLockSettingsV322,type GroundLockStateV322} from "./intelligentFootLockV322";
import type {StanceProbeV323} from "./advancedFullBodyBalanceV323";
import type { BeatFootworkCue } from "./beatPerfectFootworkV234";
import { applyIKJointSafety } from "./ikJointSafety";
import type { JointConstraintMap } from "./jointConstraintCalibration";
import { Object3D, Quaternion, Vector3 } from "three";
import type { AvatarRigTargets } from "./avatarRigController";
import { createFootContactTracker, updateGroundContact, type FootContactTracker } from "./groundContactEngine";
import { createBalanceState, updateBalanceAnchor, boundedFootTarget, resolveSupport, updateLanding, type BalanceState } from "./advancedFootworkBalance";

/** Runtime two-bone solver for recognized humanoid hip -> knee -> ankle chains.
 * Targets are world-space; no skinning meshes or original animation files are modified.
 * All corrections are bounded and applied after authored animation / procedural overlays.
 */
type Leg = {
  hip: Object3D;
  knee: Object3D;
  ankle: Object3D;
  upperLength: number;
  lowerLength: number;
  previous: Vector3;
  planted: Vector3;
  weight: number;
  contact: FootContactTracker;
};
export type FootIKState = { left: Leg | null; right: Leg | null; floorY: number; initialized: boolean; balance:BalanceState; groundV322:GroundLockStateV322 };
const tmpA = new Vector3();
const tmpB = new Vector3();
const tmpC = new Vector3();
const tmpD = new Vector3();
const worldQ = new Quaternion();
const parentQ = new Quaternion();
const adjustQ = new Quaternion();
const localQ = new Quaternion();
const UP = new Vector3(0, 1, 0);

function isAncestor(parent: Object3D, descendant: Object3D) {
  let cursor: Object3D | null = descendant.parent;
  while (cursor) { if (cursor === parent) return true; cursor = cursor.parent; }
  return false;
}

function findKnee(hip: Object3D, ankle: Object3D, side: "left" | "right") {
  const candidates: Object3D[] = [];
  hip.traverse(node => {
    if (node === hip || node === ankle || !isAncestor(node, ankle)) return;
    if (/knee|shin|calf|lower.?leg/i.test(node.name)) candidates.push(node);
  });
  // Use only an actual intervening knee node (never infer from another leg).
  return candidates.find(node => /knee|lower.?leg|shin|calf/i.test(node.name) &&
    !(side === "left" && /right/i.test(node.name)) &&
    !(side === "right" && /left/i.test(node.name))) ?? null;
}

function buildLeg(hip: Object3D | undefined, ankle: Object3D | undefined, side: "left" | "right"): Leg | null {
  if (!hip || !ankle || !isAncestor(hip, ankle)) return null;
  const knee = findKnee(hip, ankle, side);
  if (!knee || !isAncestor(knee, ankle)) return null;
  hip.updateWorldMatrix(true, true);
  const a = hip.getWorldPosition(new Vector3());
  const b = knee.getWorldPosition(new Vector3());
  const c = ankle.getWorldPosition(new Vector3());
  const upperLength = a.distanceTo(b);
  const lowerLength = b.distanceTo(c);
  if (upperLength < 0.02 || lowerLength < 0.02) return null;
  return { hip, knee, ankle, upperLength, lowerLength, previous: c.clone(), planted: c.clone(), weight: 0, contact: createFootContactTracker() };
}

export function createFootIKState(): FootIKState {
  return { left: null, right: null, floorY: 0, initialized: false, balance:createBalanceState(),groundV322:createGroundLockStateV322() };
}
export function initializeFootIK(root: Object3D, targets: AvatarRigTargets): FootIKState {
  root.updateWorldMatrix(true, true);
  return {
    left: buildLeg(targets.leftLeg, targets.leftFoot, "left"),
    right: buildLeg(targets.rightLeg, targets.rightFoot, "right"),
    initialized: false,
    floorY: 0,
    balance:createBalanceState(),groundV322:createGroundLockStateV322(),
  };
}

/** Rotate a joint in world space, preserving its current animated orientation. */
function rotateTowards(joint: Object3D, from: Vector3, to: Vector3, amount: number, constraints?: JointConstraintMap) {
  const baseline = joint.quaternion.clone();
  if (from.lengthSq() < 1e-8 || to.lengthSq() < 1e-8 || amount <= 0) return;
  from.normalize(); to.normalize();
  adjustQ.setFromUnitVectors(from, to);
  joint.getWorldQuaternion(worldQ);
  localQ.copy(adjustQ).multiply(worldQ);
  if (joint.parent) {
    joint.parent.getWorldQuaternion(parentQ);
    localQ.premultiply(parentQ.invert());
  }
  joint.quaternion.slerp(localQ, Math.max(0, Math.min(1, amount)));
  applyIKJointSafety(joint, baseline, constraints);
  joint.updateWorldMatrix(false, true);
}

function solveLeg(leg: Leg, target: Vector3, weight: number, constraints?: JointConstraintMap) {
  leg.hip.updateWorldMatrix(true, true);
  const hip = leg.hip.getWorldPosition(tmpA);
  const knee = leg.knee.getWorldPosition(tmpB);
  const ankle = leg.ankle.getWorldPosition(tmpC);
  const upper = hip.distanceTo(knee);
  const lower = knee.distanceTo(ankle);
  // Use live segment lengths, which respect avatar scale and individual proportions.
  if (upper < 0.02 || lower < 0.02 || weight < 0.001) return;
  const dir = tmpD.copy(target).sub(hip);
  const distance = dir.length();
  if (distance < 0.01 || distance > (upper + lower) * 1.25) return;
  dir.divideScalar(distance);
  const reach = Math.max(Math.abs(upper - lower) + 0.001, Math.min(upper + lower - 0.001, distance));
  const x = (upper * upper - lower * lower + reach * reach) / (2 * reach);
  const height = Math.sqrt(Math.max(0, upper * upper - x * x));
  const bend = knee.clone().sub(hip);
  bend.addScaledVector(dir, -bend.dot(dir));
  // An almost straight leg needs an unambiguous pole direction from current pose.
  if (bend.lengthSq() < 1e-8) bend.crossVectors(dir, UP);
  if (bend.lengthSq() < 1e-8) bend.set(0, 0, 1);
  bend.normalize();
  const desiredKnee = hip.clone().addScaledVector(dir, x).addScaledVector(bend, height);
  rotateTowards(leg.hip, knee.clone().sub(hip), desiredKnee.clone().sub(hip), weight, constraints);
  const movedKnee = leg.knee.getWorldPosition(new Vector3());
  const movedAnkle = leg.ankle.getWorldPosition(new Vector3());
  rotateTowards(leg.knee, movedAnkle.sub(movedKnee), target.clone().sub(movedKnee), weight, constraints);
}

export function updateFootIK(
  state: FootIKState, root: Object3D, delta: number, active: boolean, strength = 0.7, contactSensitivity = 0.5, lockStrength = 0.5, constraints?: JointConstraintMap, cue?: BeatFootworkCue, optionsV322?:FootLockSettingsV322, contextV322?:{trackId?:string;playheadMs?:number},
): boolean {
  const legs = [state.left, state.right].filter((leg): leg is Leg => leg !== null);
  if (!legs.length) return false;
  root.updateWorldMatrix(true, true);
  if (!active) { for (const leg of legs) { leg.weight = 0; leg.contact = createFootContactTracker(); } state.balance=createBalanceState(); resetGroundLockV322(state.groundV322); state.initialized = false; return true; }
  if(optionsV322?.enabled && isFootLockDiscontinuityV322(state.groundV322,contextV322?.trackId??'',
    typeof contextV322?.playheadMs==='number'&&Number.isFinite(contextV322.playheadMs)?contextV322.playheadMs:null)){
    resetGroundLockV322(state.groundV322);
    state.initialized=false;
  }
  if(!optionsV322?.enabled && (state.groundV322.lastMs!==null || state.groundV322.floorY!==null || state.groundV322.left.active || state.groundV322.right.active)) resetGroundLockV322(state.groundV322);
  const positions = legs.map(leg => leg.ankle.getWorldPosition(new Vector3()));
  if (!state.initialized) {
    state.floorY = Math.min(...positions.map(p => p.y));
    state.initialized = true;
    for (let i = 0; i < legs.length; i++) { legs[i].previous.copy(positions[i]); legs[i].planted.copy(positions[i]); }
  }
  const dt = Math.max(1 / 120, Math.min(0.1, delta));
  if(optionsV322?.enabled){
    const observations=legs.map((leg,i)=>({position:positions[i],phase:leg.contact.phase,confidence:leg.contact.confidence}));
    updateGroundEstimateV322(state.groundV322,observations,dt,optionsV322,
      Math.max(.25,...legs.map(leg=>leg.upperLength+leg.lowerLength)));
  }
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]; const pos = positions[i];
    const velocity = pos.distanceTo(leg.previous) / dt;
    const verticalSpeed = (pos.y - leg.previous.y) / dt;
    const scale = Math.max(0.5, Math.min(3, leg.upperLength + leg.lowerLength));
    updateGroundContact(leg.contact, {x:pos.x, y:pos.y, z:pos.z, speed:velocity, verticalSpeed}, state.floorY, dt, contactSensitivity, scale);
    // Anchors are captured ONLY upon plant acquisition, not rewritten on every frame.
    // This avoids the moving target that previously defeated horizontal foot locking.
    const anchor = leg === state.left ? state.balance.left : state.balance.right;
    updateBalanceAnchor(anchor, {x:pos.x,y:pos.y,z:pos.z,phase:leg.contact.phase,confidence:leg.contact.confidence}, dt);
    leg.weight = anchor.influence;
    leg.planted.set(anchor.x,anchor.y,anchor.z);
    leg.previous.copy(pos);
    if(optionsV322?.enabled){
      const step=updateFootLockTargetV322(leg===state.left?state.groundV322.left:state.groundV322.right,
        {position:pos,phase:leg.contact.phase,confidence:leg.contact.confidence,verticalSpeed,
          legLength:leg.upperLength+leg.lowerLength,delta:dt,floorY:state.groundV322.floorY??state.floorY},optionsV322);
      // The V204 IK solver still applies joint limits and reachable-leg guards.
      if(step.weight>.02){
        solveLeg(leg,new Vector3(step.x,step.y,step.z),
          step.weight*Math.max(0,Math.min(1,strength))*(leg===state.left?(cue?.leftStrength??1):(cue?.rightStrength??1)),constraints);
      }
      continue;
    }
    if (leg.weight < 0.02) continue;
    // Clamp correction relative to leg length so unusual rigs cannot snap violently.
    const next = boundedFootTarget(anchor,{x:pos.x,y:pos.y,z:pos.z,phase:leg.contact.phase,confidence:leg.contact.confidence},leg.upperLength+leg.lowerLength,lockStrength);
    const target = new Vector3(next.x,next.y,next.z);
    solveLeg(leg, target, next.weight * Math.max(0, Math.min(1, strength)) * (leg === state.left ? (cue?.leftStrength ?? 1) : (cue?.rightStrength ?? 1)), constraints);
  }
  // Track dominant support foot and smooth landing only; no destructive pelvis/root offsets.
  state.balance.support = resolveSupport(state.balance.left,state.balance.right);
  state.balance.landing = updateLanding(state.balance.landing,
    state.balance.left.planted || state.balance.right.planted,dt);
  return true;
}

/** V323 uses *previous-frame* V135 ground contacts as an observational input.
 * Coordinates are transformed into the avatar's local space, scaled by leg
 * length. No new IK solver or transformations are applied here. */
export function sampleStanceV323(state:FootIKState,root:Object3D):StanceProbeV323|null{
  if(!state.initialized)return null;
  const sample=(leg:Leg|null)=>{
    if(!leg||!Number.isFinite(leg.upperLength+leg.lowerLength))return null;
    const scale=leg.upperLength+leg.lowerLength;
    if(scale<.1)return null;
    const world=leg.ankle.getWorldPosition(new Vector3());
    const local=root.worldToLocal(world);
    return {x:Math.max(-.4,Math.min(.4,local.x/scale)),
      contact:leg.contact.phase==='planted',confidence:leg.contact.confidence};
  };
  return {left:sample(state.left),right:sample(state.right)};
}
