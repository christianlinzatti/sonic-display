/**
 * V572 – cadence-aware smoothing for existing GLB facial morphs.
 *
 * Word timestamps allow a conservative estimate of local *word density* only.
 * They do not reveal phonemes, syllables, pronunciation, or individual singers.
 * Preserve artist/manual mouth poses, V384/V415 lip seals, V420 word edits,
 * V423 audio mouth, reduced motion and multi-avatar ownership.
 *
 * Zero new timers, buffers, meshes or GPU operations. All plans are immutable
 * shared constants to avoid allocations in the per-frame GLB useFrame path.
 */
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

export type RapMouthCadenceV572='none'|'connected-rap'|'dense-rap';
export type RapMouthDynamicsV572=Readonly<{
  active:boolean;
  cadence:RapMouthCadenceV572;
  jawAttack:number;jawRelease:number;
  vowelAttack:number;vowelRelease:number;
  /** The already-authored bilabial closure rates are never modified. */
  closureAttack:1;closureRelease:1;
  source:'timed-word-density'|'none';
}>;
const NONE:RapMouthDynamicsV572=Object.freeze({active:false,cadence:'none',jawAttack:1,jawRelease:1,
  vowelAttack:1,vowelRelease:1,closureAttack:1 as const,closureRelease:1 as const,source:'none' as const});
const CONNECTED:RapMouthDynamicsV572=Object.freeze({active:true,cadence:'connected-rap',
  jawAttack:1.07,jawRelease:1.03,vowelAttack:.94,vowelRelease:.96,
  closureAttack:1 as const,closureRelease:1 as const,source:'timed-word-density' as const});
const DENSE:RapMouthDynamicsV572=Object.freeze({active:true,cadence:'dense-rap',
  jawAttack:1.16,jawRelease:1.05,vowelAttack:.87,vowelRelease:.93,
  closureAttack:1 as const,closureRelease:1 as const,source:'timed-word-density' as const});
const normalize=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');

/** Returns shared immutable objects; wrong/ambiguous/stale word evidence is a hard off. */
export function planRapMouthDynamicsV572(input:DeutschrapFaceOptionsV538):RapMouthDynamicsV572 {
  if(!input.enabled||!input.playing||!input.rap||!input.verifiedWord||
     input.reducedMotion||!input.roleAllowed||input.manualSilent||input.manualPriority||
     input.preserveAudioMouth||!input.lyrics?.synced||!input.activeWord?.trim()||
     !Number.isFinite(input.intensity)||input.intensity<=0||
     !Number.isFinite(input.effectiveTimeMs)||input.effectiveTimeMs<0)return NONE;
  const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
  if(!mark||normalize(mark.word.text)!==normalize(input.activeWord))return NONE;
  if(input.editedWords?.some(w=>w.startMs===mark.start&&normalize(w.text)===normalize(mark.word.text)))return NONE;
  // Neighboring text must be separated by a REAL, nonnegative timestamp gap.
  // We must not infer dense cadence across silence, overlapping timestamps,
  // invalid durations, sparse lyrics or a new line with unknown word timing.
  const duration=mark.end-mark.start;
  if(duration<75||duration>520)return NONE;
  const previousConnected=Number.isFinite(mark.previousGap)&&mark.previousGap>=0&&mark.previousGap<=110;
  const nextConnected=!!mark.next&&Number.isFinite(mark.nextGap)&&mark.nextGap>=0&&mark.nextGap<=110;
  if(!previousConnected&&!nextConnected)return NONE;
  return duration<=285&&(previousConnected&&mark.previousGap<=75||nextConnected&&mark.nextGap<=75)
    ? DENSE : CONNECTED;
}

/** Only timing, never changes the target face pose or overrides a GLB animation. */
export function rapMouthRateV572(plan:RapMouthDynamicsV572,channel:string,attacking:boolean):number {
  if(!plan.active)return 1;
  if(channel==='lipsClosed')return attacking?plan.closureAttack:plan.closureRelease;
  if(channel==='jaw')return attacking?plan.jawAttack:plan.jawRelease;
  if(channel==='wide'||channel==='round')return attacking?plan.vowelAttack:plan.vowelRelease;
  return 1; // brows, cheeks, blinks, emotion are not part of mouth timing
}
