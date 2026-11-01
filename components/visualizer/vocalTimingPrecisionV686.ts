/** V686 – verified-word response timing for existing facial morph targets.
 * No audio-to-phoneme inference: ONLY genuine provider word timestamps (or
 * already manually aligned data handled by V644/V662). The lip renderer is
 * still the sole mouth owner; no extra frame loop or new GLB animation.
 */
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

export type VocalPrecisionCueV686=Readonly<{
  active:boolean;source:'timed-word'|'none';wordStartMs:number;
  phase:'onset'|'body'|'release'|'none';
  /** 0–1: verified-word-local rate emphasis, NEVER phoneme intensity. */
  onset:number;release:number;rapid:boolean;bilabial:boolean;
}>;
const OFF:VocalPrecisionCueV686={active:false,source:'none',wordStartMs:-1,
  phase:'none',onset:0,release:0,rapid:false,bilabial:false};
const finite=(n:number)=>Number.isFinite(n);
const unit=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(x:number)=>{const t=unit(x);return t*t*(3-2*t);};
const norm=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const labial=(s:string)=>/^[^\p{L}]*[bmp]/iu.test(s);

/** With manual or measured-mouth sources, rate must be neutral for the WHOLE
 * authoring session, including explicit silent gaps between viseme events. */
export function planVocalTimingPrecisionV686(input:DeutschrapFaceOptionsV538,
 tier:'low'|'balanced'|'high', protectedSource=false):VocalPrecisionCueV686{
 if(protectedSource||tier==='low'||!input.playing||!input.enabled||!input.rap||
   !input.verifiedWord||!input.roleAllowed||input.manualSilent||input.manualPriority||
   input.reducedMotion||input.preserveAudioMouth||!input.lyrics?.synced||
   !input.activeWord?.trim()||!finite(input.effectiveTimeMs)||input.effectiveTimeMs<0||
   !finite(input.intensity)||input.intensity<=0)return OFF;
 const word=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
 if(!word||norm(word.word.text)!==norm(input.activeWord)||
   input.editedWords?.some(edit=>edit.startMs===word.start))return OFF;
 const duration=word.end-word.start;
 // A rapid word is evidence of an interval, not of a new phoneme.
 const connected=word.previousGap>=0&&word.previousGap<=100||
   word.nextGap>=0&&word.nextGap<=100;
 if(!finite(duration)||duration<65||duration>510||!(connected||duration<=275))return OFF;
 const elapsed=input.effectiveTimeMs-word.start,remaining=word.end-input.effectiveTimeMs;
 if(elapsed<0||remaining<=0)return OFF;
 const strength=unit(input.intensity/100)*(tier==='balanced'?.58:1);
 const onsetWindow=Math.min(90,Math.max(32,duration*.3));
 const releaseWindow=Math.min(95,Math.max(36,duration*.34));
 // Fade both envelopes inside verified word bounds; never bleed into gaps.
 const onset=(1-smooth(elapsed/onsetWindow))*smooth(remaining/Math.min(20,duration*.16))*strength;
 const release=(1-smooth(remaining/releaseWindow))*smooth(elapsed/Math.min(20,duration*.16))*strength;
 const phase=onset>=release&&onset>.0001?'onset':release>.0001?'release':'body';
 return {active:true,source:'timed-word',wordStartMs:word.start,phase,
   onset,release,rapid:duration<330||connected,bilabial:labial(word.word.text)};
}

/** Rate-only overlay. B/P/M closure targets are still produced by V384/V415;
 * V686 can reach a pre-existing seal sooner but never invent one. The positive
 * multiplier cannot change any target or singer assignment. */
export function vocalTimingRateV686(cue:VocalPrecisionCueV686,channel:string,
 current:number,target:number):number{
 if(!cue.active||!finite(current)||!finite(target)||current<0||current>1||
   target<0||target>1||Math.abs(target-current)<.000001)return 1;
 const attacking=target>current;
 if(channel==='lipsClosed'){
   if(!cue.bilabial||!attacking||target<.15)return 1;
   return Math.min(1.30,1+cue.onset*.30);
 }
 if(channel!=='jaw'&&channel!=='wide'&&channel!=='round')return 1;
 if(cue.bilabial&&channel==='jaw'&&attacking)return 1;
 const change=Math.abs(target-current);
 const jumpLimit=1-.48*smooth((change-.22)/.50);
 const rate=attacking?(cue.onset*.21+cue.release*.055):
   (cue.release*.16+cue.onset*.06);
 return Math.min(1.24,Math.max(1,1+rate*jumpLimit));
}
