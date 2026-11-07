/** V1049 · Live Concert Intelligence Engine.
 * Pure opt-in layer over authored V1040/V1048 cues. Only fresh, active
 * microphone measurements count as live evidence. Never invent a drop,
 * change an authored shot/formation, or exceed authored effect intensity.
 */
import type {AudioFeatures} from '../types/audio';
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';

export type LiveConcertMomentV1049='off'|'steady'|'rise'|'crest'|'release';
export interface LiveConcertCueV1049 {
 active:boolean;moment:LiveConcertMomentV1049;verifiedBeat:boolean;
 intensityGain:number;show:ArenaShowCueV1040;
}
const finite01=(v:unknown):number|null=>
 typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1?v:null;
const off=(show:ArenaShowCueV1040):LiveConcertCueV1049=>({
 active:false,moment:'off',verifiedBeat:false,intensityGain:1,show,
});
export function directLiveConcertV1049(input:{
 enabled:boolean;microphoneActive:boolean;playing:boolean;reducedMotion:boolean;
 stageIsArena:boolean;reactive?:boolean;show:ArenaShowCueV1040;
 audio?:Partial<AudioFeatures>|null;strength?:number|null;
 performanceTier?:'low'|'balanced'|'high'|null;
 /** Required for scheduler-driven devices; prevents replaying stale audio. */
 sampleAgeMs?:number|null;
}):LiveConcertCueV1049{
 const {show,audio}=input;
 if(!input.enabled||!input.microphoneActive||!input.playing||input.reducedMotion||
  !input.stageIsArena||input.reactive===false||input.performanceTier==='low'||
  !show?.active||show.segmentIndex<0||!Number.isFinite(show.intensity)||
  show.intensity<0||show.intensity>100||!audio||
  (input.sampleAgeMs!=null&&(!Number.isFinite(input.sampleAgeMs)||input.sampleAgeMs<0||input.sampleAgeMs>450)))return off(show);
 const energy=finite01(audio.energyEnvelope),attack=finite01(audio.attack),decay=finite01(audio.decay);
 if(energy===null||attack===null||decay===null)return off(show);
 const requested=typeof input.strength==='number'&&Number.isFinite(input.strength)?input.strength:50;
 const strength=Math.max(0,Math.min(70,requested))/100;
 if(strength<=0)return off(show);
 // The microphone analyzer's beat flag alone is insufficient: require a
 // phase-locked, confidence-qualified measurement. No predicted kick pulses.
 const verifiedBeat=audio.beat===true&&audio.phaseLocked===true&&
  (finite01(audio.phaseConfidence)??0)>=.55&&
  (finite01(audio.beatStrength)??0)>=.55;
 const accent=finite01(audio.kickAccentIntensity)??0;
 let moment:LiveConcertMomentV1049='steady';
 if(verifiedBeat&&energy>=.62&&accent>=.50)moment='crest';
 else if(attack>=.35&&attack>decay*1.2&&energy>=.24)moment='rise';
 else if(decay>=.30&&decay>attack*1.2&&energy<=.65)moment='release';
 // Continuous, strictly non-boosting dynamics: crests recover the authored
 // brightness; quieter passages breathe. This affects only existing cues.
 const quiet=1-energy;
 const breathing=moment==='crest'?0:moment==='rise'?.05:
  moment==='release'?.22:.12;
 const tier=input.performanceTier==='balanced'?.5:1;
 const attenuation=Math.min(.35,strength*tier*(breathing+.15*quiet));
 const intensityGain=1-attenuation;
 return {active:true,moment,verifiedBeat,intensityGain,
  show:{...show,intensity:Math.max(0,Math.min(show.intensity,Math.round(show.intensity*intensityGain)))}};
}
