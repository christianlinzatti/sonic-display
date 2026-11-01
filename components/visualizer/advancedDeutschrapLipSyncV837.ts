/**
 * V837 – verified-word Deutschrap articulation response.
 *
 * Adds no phoneme recognition and does not change artist identity, timelines,
 * viseme targets, jaw bones or GLB animations. ONLY modifies how quickly the
 * existing V368 mouth morph interpolator reaches its pre-existing target.
 * A timed lyric word is evidence of a word interval, not exact sound alignment.
 */
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

export type RapArticulationModeV837='none'|'connected-flow'|'bilabial-onset'|'phrase-release';
export type RapArticulationV837=Readonly<{
  active:boolean;
  source:'verified-timed-word'|'none';
  mode:RapArticulationModeV837;
  wordStartMs:number;
  wordEndMs:number;
  /** Envelope strengths; NEVER fabricated visemes or measurements of audio. */
  onset:number;
  release:number;
  connected:boolean;
  bilabial:boolean;
}>;
const OFF:RapArticulationV837=Object.freeze({active:false,source:'none',mode:'none',wordStartMs:-1,wordEndMs:-1,onset:0,release:0,connected:false,bilabial:false});
const unit=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
const ease=(v:number)=>{const x=unit(v);return x*x*(3-2*x);};
const normalize=(v:string)=>v.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const startsBilabial=(word:string)=>/^[^\p{L}]*[bmp]/iu.test(word);
/** The caller passes an explicitly verified V385/V496 singer, not an inferred role. */
export function planAdvancedDeutschrapLipSyncV837(
  input:DeutschrapFaceOptionsV538,
  tier:'low'|'balanced'|'high',
  confirmedSinger:boolean,
  protectedMouth=false,
):RapArticulationV837 {
  if(protectedMouth||tier==='low'||!confirmedSinger||!input.roleAllowed||
     !input.playing||!input.enabled||!input.rap||!input.verifiedWord||
     input.manualSilent||input.manualPriority||input.preserveAudioMouth||input.reducedMotion||
     !input.lyrics?.synced||!input.activeWord?.trim()||
     !Number.isFinite(input.effectiveTimeMs)||input.effectiveTimeMs<0||
     !Number.isFinite(input.intensity)||input.intensity<=0)return OFF;
  const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
  if(!mark||normalize(mark.word.text)!==normalize(input.activeWord)||
     input.editedWords?.some(edit=>edit.startMs===mark.start))return OFF;
  const duration=mark.end-mark.start;
  if(duration<85||duration>650)return OFF;
  const elapsed=input.effectiveTimeMs-mark.start;
  const remaining=mark.end-input.effectiveTimeMs;
  if(elapsed<0||remaining<=0)return OFF;
  const previousConnected=mark.previousGap>=0&&mark.previousGap<=100;
  const nextConnected=mark.nextGap>=0&&mark.nextGap<=100&&!!mark.next;
  const connected=previousConnected||nextConnected;
  const bilabial=startsBilabial(mark.word.text);
  // Phrase release requires a real word end, never an inferred end at line cut.
  const explicitEnd=Number.isFinite(mark.word.endMs)&&mark.word.endMs===mark.end;
  const phraseEnd=explicitEnd&&(!mark.next||mark.nextGap>=175);
  if(!connected&&!phraseEnd&&duration>300)return OFF;
  const gain=unit(input.intensity/100)*(tier==='balanced'?.6:1);
  const onset=(1-ease(elapsed/Math.min(95,duration*.34)))*ease(remaining/Math.min(28,duration*.13))*gain;
  const release=(1-ease(remaining/Math.min(105,duration*.34)))*ease(elapsed/Math.min(28,duration*.13))*gain;
  const mode:RapArticulationModeV837=bilabial&&onset>.001?'bilabial-onset':
    connected&&duration<=420?'connected-flow':phraseEnd?'phrase-release':'none';
  if(mode==='none'||onset+release<.00001)return OFF;
  return {active:true,source:'verified-timed-word',mode,wordStartMs:mark.start,wordEndMs:mark.end,
    onset,release,connected,bilabial};
}
/**
 * Existing V384/V415/V546/V644/V662 owners produce targets. V837 NEVER
 * creates a mouth target, never advances an unrequested lip seal and never
 * changes non-mouth channels. Retains the existing per-frame exponential smoothing.
 */
export function deutschrapLipRateV837(
  cue:RapArticulationV837,
  channel:string,
  current:number,
  target:number,
):number {
  if(!cue.active||!Number.isFinite(current)||!Number.isFinite(target)||
     current<0||current>1||target<0||target>1||Math.abs(current-target)<.000001)return 1;
  const attacking=target>current;
  const gainLimit=1-.54*ease((Math.abs(target-current)-.25)/.55);
  if(channel==='lipsClosed'){
    // Only speed up an EXISTING B/P/M seal. Never open the mouth by assumption.
    return cue.bilabial&&attacking&&target>=.2?1+Math.min(.12,cue.onset*.12)*gainLimit:1;
  }
  if(channel==='jaw'){
    // During a B/P/M word onset do not accelerate jaw opening over its seal.
    if(cue.bilabial&&attacking)return 1;
    if(attacking)return 1+Math.min(.14,cue.onset*.14)*gainLimit;
    // Relax gently toward the owner's exact target at phrase endings.
    return cue.mode==='phrase-release'?Math.max(.92,1-cue.release*.08):1+cue.release*.08*gainLimit;
  }
  if(channel==='wide'||channel==='round'){
    if(cue.bilabial&&attacking&&cue.onset>.08)return 1;
    return attacking?1+cue.onset*.095*gainLimit:Math.max(.92,1-cue.release*.065);
  }
  return 1;
}
