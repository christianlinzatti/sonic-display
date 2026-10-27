/**
 * V581 – coherent GLB Deutschrap micro-performance.
 *
 * Word timestamps only establish timing/density. They are NOT a phoneme,
 * vocal-emotion or performer detector. The rig owns this *optional* micro
 * overlay; V384/415/420/423, manual facial tracks and the authored GLB mixer
 * continue to own the mouth, head and eye animations.
 */
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import type {RapMouthDynamicsV572} from './rapMouthDynamicsV572';
import type {EyeCueV574} from './verifiedEyeContactV574';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

export type CoherentRapFaceV581=Readonly<{
  active:boolean;wordStartMs:number;
  jawAttackRate:number;vowelReleaseRate:number;
  browAccent:number;squintAccent:number;
  headPitch:number;headYaw:number;
  /** Delta, not the entire V574 eye cue. Only used when the cue is verified. */
  eyePitchDelta:number;eyeYawDelta:number;
  source:'verified-timed-word'|'none';
}>;
export const COHERENT_RAP_OFF_V581:CoherentRapFaceV581=Object.freeze({
  active:false,wordStartMs:-1,jawAttackRate:1,vowelReleaseRate:1,
  browAccent:0,squintAccent:0,headPitch:0,headYaw:0,
  eyePitchDelta:0,eyeYawDelta:0,source:'none' as const,
});
const bound=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const smooth=(n:number)=>{const x=bound(n);return x*x*(3-2*x);};
const clean=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');

/** Pure, stateless planner; seek/pause/track changes cannot retain an old cue. */
export function planCoherentRapFaceV581(input:DeutschrapFaceOptionsV538 & {
  cadence:RapMouthDynamicsV572|null;
  eye:EyeCueV574;
  tier:'low'|'balanced'|'high';
  /** Multi-avatar cue actually belongs to this song and singer, not artist credits. */
  castVerified:boolean;
}):CoherentRapFaceV581 {
  if(!input.playing||!input.enabled||!input.rap||!input.verifiedWord||
     !input.roleAllowed||!input.castVerified||input.manualSilent||input.manualPriority||
     input.reducedMotion||input.preserveAudioMouth||input.tier==='low'||
     !input.cadence?.active||!input.lyrics?.synced||!input.activeWord?.trim()||
     !Number.isFinite(input.intensity)||input.intensity<=0||
     !Number.isFinite(input.effectiveTimeMs)||input.effectiveTimeMs<0) return COHERENT_RAP_OFF_V581;
  const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
  if(!mark||clean(mark.word.text)!==clean(input.activeWord)||
     input.editedWords?.some(w=>w.startMs===mark.start))
    return COHERENT_RAP_OFF_V581;
  const duration=mark.end-mark.start;
  if(duration<75||duration>520)return COHERENT_RAP_OFF_V581;
  const position=bound((input.effectiveTimeMs-mark.start)/duration);
  const envelope=smooth((input.effectiveTimeMs-mark.start)/Math.min(90,duration*.32))*
    smooth((mark.end-input.effectiveTimeMs)/Math.min(105,duration*.42));
  const strength=bound(input.intensity/100)*(input.tier==='balanced'?.55:1);
  const gain=strength*envelope;
  if(gain<.0001)return COHERENT_RAP_OFF_V581;
  const dense=input.cadence.cadence==='dense-rap';
  // Gentle head nod tied to the *existing* word. No synthetic syllable beats.
  const nod=Math.sin(position*Math.PI);
  const partner=input.eye.mode==='partner'&&input.eye.weight>0;
  const audience=input.eye.mode==='audience'&&input.eye.weight>0;
  return {
    active:true,wordStartMs:mark.start,source:'verified-timed-word',
    jawAttackRate:1+(dense?.105:.055)*gain,
    vowelReleaseRate:1-(dense?.055:.035)*gain,
    browAccent:.022*gain,squintAccent:.011*gain,
    headPitch:-.025*gain*nod,headYaw:partner?input.eye.yaw*.12*gain:0,
    eyePitchDelta:(partner||audience)?-.007*gain:0,
    eyeYawDelta:partner?Math.sign(input.eye.yaw)*.004*gain:0,
  };
}

/** Preserve authored channels, including ALL mouth, blink, cheek and smile targets. */
export function addCoherentRapExpressionV581<T extends {face:{brow:number;squint:number}}>(
 frame:T,cue:CoherentRapFaceV581,
):T{
  if(!cue.active)return frame;
  return {...frame,face:{...frame.face,
    brow:bound(frame.face.brow+cue.browAccent),
    squint:bound(frame.face.squint+cue.squintAccent),
  }};
}

/** V581 never modifies bilabial closure or any other channel speed. */
export function coherentRapRateV581(cue:CoherentRapFaceV581,channel:string,attacking:boolean):number {
  if(!cue.active)return 1;
  if(channel==='jaw'&&attacking)return cue.jawAttackRate;
  if((channel==='round'||channel==='wide')&&!attacking)return cue.vowelReleaseRate;
  return 1;
}

/**
 * Preserve the authored GLB rotation. The mixer may either keep our last overlay
 * or replace it with a new keyframe; in the latter case do NOT subtract it.
 */
export function additiveBoneAxisV581(current:number,target:number,last:number,rendered:number):number{
  const kept=Math.abs(current-rendered)<.0001?last:0;
  return current+target-kept;
}
export function releaseBoneAxisV581(current:number,last:number,rendered:number):number{
  return Math.abs(current-rendered)<.0001?current-last:current;
}
