"use client";
// Extracted unchanged from ThreeAvatar.tsx (V492 modular refactor).
// --- Extracted dependencies (V492 refactor) ---
import { type MotionSyncV328, type MotionSyncClockV328 } from "./groupMotionSynchronizationV328";
import { type PhraseSettingsV329, type PhraseSignatureV329, type PhraseMatchV329 } from "./intelligentMotionPhraseV329";
import { approachLook, type LookAtCue } from "./partnerLookAtEngine";
import { approachGesture, type PartnerGestureCue } from "./partnerGestureEngine";
import { type PartnerHandCue } from "./partnerHandIK";
import { createContext, useContext } from "react";
import { type LowPoseSlotV481 } from "./intelligentLowPoseV481";
import { type NaturalDanceSlotV485 } from "./naturalDanceMotionStudioV485";
import { type FootSupportV486, type FootworkSlotV486 } from "./advancedDanceFootworkV486";
import { type GroundObservationV487 } from './groundContactStudioV487';
import { type AvatarRigTargets } from "./avatarRigController";

export const GroupMotionClockContextV328=createContext<{settings:MotionSyncV328;clock:{current:MotionSyncClockV328}}|null>(null);
// V329: clip signatures published only on asset/clip changes, never per animation frame.
export const GroupLowPoseContextV481=createContext<{current:LowPoseSlotV481}|null>(null);
export const GroupDanceMotionContextV485=createContext<{current:NaturalDanceSlotV485}|null>(null);
export const GroupFootworkContextV486=createContext<{current:FootworkSlotV486}|null>(null);
export const GroupFootSupportContextV486=createContext<{current:FootSupportV486}|null>(null);
export const GroupGroundObservationContextV487=createContext<{current:GroundObservationV487}|null>(null);
export const GroupPhraseContextV329=createContext<{settings:PhraseSettingsV329;plan:PhraseMatchV329;register:(slot:number,profiles:readonly PhraseSignatureV329[])=>void}|null>(null);
export const PartnerLookContext = createContext<{current: LookAtCue} | null>(null);
export function usePartnerLook() { return useContext(PartnerLookContext); }
export function applyPartnerLook(targets: AvatarRigTargets, cue: LookAtCue, delta: number, previous: { yaw: number; pitch: number; eye: number }) {
  const yaw = approachLook(previous.yaw, cue.yaw, delta);
  const pitch = approachLook(previous.pitch, cue.pitch, delta);
  const eye = approachLook(previous.eye, cue.eyeYaw, delta);
  // Add only frame-to-frame overlay deltas, preserving authored clip rotations.
  if (targets.head) { targets.head.rotation.y += yaw - previous.yaw; targets.head.rotation.x += pitch - previous.pitch; }
  if (targets.leftEye) targets.leftEye.rotation.y += eye - previous.eye;
  if (targets.rightEye) targets.rightEye.rotation.y += eye - previous.eye;
  previous.yaw = yaw; previous.pitch = pitch; previous.eye = eye;
}

/** Add delta overlays after source animation, retaining previous offset for smooth release. */
export const PartnerHandContext = createContext<{current:PartnerHandCue} | null>(null);
export const PartnerCalibrationContext = createContext<{reach:number;height:number;strength:number} | null>(null);
export function usePartnerHand() { return useContext(PartnerHandContext); }
export const PartnerGestureContext = createContext<{current:PartnerGestureCue} | null>(null);
export function usePartnerGesture() { return useContext(PartnerGestureContext); }
export function applyPartnerGesture(targets:AvatarRigTargets, cue:PartnerGestureCue, delta:number, previous:PartnerGestureCue) {
  const next:PartnerGestureCue = {
    leftLift:approachGesture(previous.leftLift,cue.leftLift,delta),
    rightLift:approachGesture(previous.rightLift,cue.rightLift,delta),
    shoulder:approachGesture(previous.shoulder,cue.shoulder,delta),
    lean:approachGesture(previous.lean,cue.lean,delta),
    intensity:approachGesture(previous.intensity,cue.intensity,delta),
  };
  if (targets.leftArm) targets.leftArm.rotation.z += next.leftLift-previous.leftLift;
  if (targets.rightArm) targets.rightArm.rotation.z -= next.rightLift-previous.rightLift;
  if (targets.chest) targets.chest.rotation.x += next.shoulder-previous.shoulder;
  if (targets.spine) targets.spine.rotation.z += next.lean-previous.lean;
  Object.assign(previous,next);
}

