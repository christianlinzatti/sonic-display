/**
 * V582 – Natural Dance & Facial Coordination 2.0.
 *
 * Turns an already verified V581 word-performance cue into a very small,
 * word-synchronized upper-body overlay. There is deliberately NO second lyric,
 * singer, phoneme, tempo, or emotion detector. A missing/ambiguous source means
 * no movement. This module does not own mouth, feet, hips or manual choreography.
 */
import type {CoherentRapFaceV581} from './coherentRapFacialPerformanceV581';
import {additiveBoneAxisV581,releaseBoneAxisV581} from './coherentRapFacialPerformanceV581';

export type NaturalDanceFaceCueV582=Readonly<{
  active:boolean;
  chestPitch:number;
  chestRoll:number;
  leftShoulderRoll:number;
  rightShoulderRoll:number;
  source:'verified-v581-word'|'none';
}>;
export const NATURAL_DANCE_FACE_OFF_V582:NaturalDanceFaceCueV582=Object.freeze({
  active:false,chestPitch:0,chestRoll:0,leftShoulderRoll:0,rightShoulderRoll:0,source:'none' as const,
});
const clamp01=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;

export function planNaturalDanceFacialCoordinationV582(input:{
  faceCue:CoherentRapFaceV581;
  effectiveTimeMs:number;
  playing:boolean;
  bodyEnabled:boolean;
  /** Authored dances and timeline clips have precedence over overlays. */
  authoredMotion:boolean;
  reducedMotion:boolean;
  performanceTier:'low'|'balanced'|'high';
  bodyStrength:number;
  energy:number;
  avatarSlot:number;
}):NaturalDanceFaceCueV582 {
  const {faceCue:cue}=input;
  if(!cue.active||cue.source!=='verified-timed-word'||cue.wordStartMs<0||
     !input.playing||!input.bodyEnabled||input.authoredMotion||input.reducedMotion||
     input.performanceTier==='low'||!Number.isInteger(input.avatarSlot)||
     input.avatarSlot<0||input.avatarSlot>3||
     !Number.isFinite(input.effectiveTimeMs)||
     input.effectiveTimeMs<cue.wordStartMs||input.effectiveTimeMs>cue.wordStartMs+520||
     !Number.isFinite(input.energy)||!Number.isFinite(input.bodyStrength)||input.bodyStrength<=0||
     !Number.isFinite(cue.headPitch)||!Number.isFinite(cue.jawAttackRate)||
     cue.headPitch>=0||cue.headPitch<-.02501||
     cue.jawAttackRate<=1||cue.jawAttackRate>1.10501)return NATURAL_DANCE_FACE_OFF_V582;
  // Use only V581's already smoothed word envelope, not fabricated beat onsets.
  // Chest follows the head, while the shoulders subtly counter-balance it.
  const wordPulse=clamp01(-cue.headPitch/.025);
  const vocalAttack=clamp01((cue.jawAttackRate-1)/.105);
  const gain=clamp01(input.bodyStrength/100)*(.7+.3*clamp01(input.energy)) *
    Math.min(1,wordPulse*.8+vocalAttack*.2) *
    (input.performanceTier==='balanced'?.65:1);
  if(gain<.0001)return NATURAL_DANCE_FACE_OFF_V582;
  // Short words alternate their shoulder support, consistently per existing
  // start mark/slot. No RNG, state or inferred phrase boundary.
  const side=((Math.floor(cue.wordStartMs/180)+input.avatarSlot)%2===0)?1:-1;
  return {
    active:true,
    chestPitch:-.009*gain,
    chestRoll:.005*side*gain,
    leftShoulderRoll:-.007*side*gain,
    rightShoulderRoll:.007*side*gain,
    source:'verified-v581-word',
  };
}

/** Add and release one overlay axis safely across GLB mixer keyframe updates. */
export interface BodyBoneAxisV582 {
  bone:{rotation:{x:number;y:number;z:number}};
  axis:'x'|'y'|'z';
  last:number;
  rendered:number;
}
export function applyBodyBoneAxisV582(binding:BodyBoneAxisV582|null,value:number):void {
  if(!binding)return;
  const next=additiveBoneAxisV581(binding.bone.rotation[binding.axis],value,binding.last,binding.rendered);
  binding.bone.rotation[binding.axis]=next;
  binding.last=value;
  binding.rendered=next;
}
export function releaseBodyBoneAxisV582(binding:BodyBoneAxisV582|null):void {
  if(!binding)return;
  binding.bone.rotation[binding.axis]=releaseBoneAxisV581(
    binding.bone.rotation[binding.axis],binding.last,binding.rendered);
  binding.last=0;
  binding.rendered=binding.bone.rotation[binding.axis];
}
