/**
 * V612 – expressive, verified-word facial micro-performance for Deutschrap.
 *
 * This is NOT phoneme/syllable detection. Real word timestamps and the existing
 * V581/V572/V597 cues are the only evidence. Existing lip seals, manual
 * edits, audio-mouth automation, keyframed rigs and V562 calibration win.
 * Pure sampling; no timers, allocations of rig resources or extra render loops.
 */
import type {FacialPoseV369} from './facialPerformanceV369';
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import type {CoherentRapFaceV581} from './coherentRapFacialPerformanceV581';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

export type ExpressiveVocalFaceV612<T> = Readonly<{
 frame:T;active:boolean;source:'verified-timed-word'|'none';wordStartMs:number;
 /** Tiny additive head offsets, only alongside the already verified V581 cue. */
 headPitch:number;headYaw:number;
 jawAttackRate:number;jawReleaseRate:number;vowelAttackRate:number;vowelReleaseRate:number;
}>;
const clamp=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
const smooth=(v:number)=>{const x=clamp(v);return x*x*(3-2*x)};
const norm=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const validFace=(face:FacialPoseV369)=>
 (['jaw','wide','round','lipsClosed','smile','brow','blink','cheek','squint'] as const)
   .every(k=>Number.isFinite(face[k])&&face[k]>=0&&face[k]<=1);
const vowel=(s:string)=>s.toLocaleLowerCase('de-DE').match(/[aeiouäöü]/iu)?.[0]??'';
const bilabial=(s:string)=>/^[^\p{L}]*[bmp]/iu.test(s);

/** Frame-local rendering hint. Never carry values over a pause, seek or singer change. */
export function refineExpressiveVocalFaceV612<T extends {face:FacialPoseV369}>(
 base:T, input:DeutschrapFaceOptionsV538,tier:'low'|'balanced'|'high',
 coherent?:CoherentRapFaceV581|null,
):ExpressiveVocalFaceV612<T>{
 const off:ExpressiveVocalFaceV612<T>={frame:base,active:false,source:'none',wordStartMs:-1,
  headPitch:0,headYaw:0,jawAttackRate:1,jawReleaseRate:1,vowelAttackRate:1,vowelReleaseRate:1};
 if(tier==='low'||!input.playing||!input.enabled||!input.rap||!input.verifiedWord||
   !input.roleAllowed||input.manualSilent||input.manualPriority||input.reducedMotion||
   input.preserveAudioMouth||!input.lyrics?.synced||!input.activeWord?.trim()||
   !Number.isFinite(input.effectiveTimeMs)||input.effectiveTimeMs<0||
   !Number.isFinite(input.intensity)||input.intensity<=0||!validFace(base.face))return off;
 const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
 if(!mark||norm(mark.word.text)!==norm(input.activeWord)||
    input.editedWords?.some(w=>w.startMs===mark.start))return off;
 const duration=mark.end-mark.start;
 if(duration<85||duration>540||!Number.isFinite(duration))return off;
 const previous=Number.isFinite(mark.previousGap)&&mark.previousGap>=0&&mark.previousGap<=120;
 const next=!!mark.next&&Number.isFinite(mark.nextGap)&&mark.nextGap>=0&&mark.nextGap<=120;
 const dense=duration<=350&&(previous||next);
 // Only rapid/connected words: a slow ballad must not inherit rapid articulation.
 if(!dense)return off;
 const phase=clamp((input.effectiveTimeMs-mark.start)/duration);
 const envelope=smooth((input.effectiveTimeMs-mark.start)/Math.min(85,duration*.34))*
   smooth((mark.end-input.effectiveTimeMs)/Math.min(105,duration*.42));
 const gain=envelope*clamp(input.intensity/100)*(tier==='balanced'?.55:1);
 if(gain<.00001)return off;
 const face={...base.face};
 const sealed=face.lipsClosed;
 const mouthOpen=clamp((.22-sealed)/.22);
 // Write-time vowel is only a gentle appearance hint; no per-phoneme timing.
 // Never enhance a B/P/M attack or the next B/P/M seal.
 const safeMouth=!bilabial(mark.word.text)&&!(next&&mark.next&&bilabial(mark.next.text))&&mouthOpen>0;
 if(safeMouth){
   const opening=vowel(mark.word.text);
   const rounded=/[oöuü]/iu.test(opening);
   const widened=/[aeiä]/iu.test(opening);
   if(opening){
     const articulatory=smooth(phase/.35)*smooth((1-phase)/.35)*gain*mouthOpen;
     face.round=clamp(face.round+(rounded?.012:0)*articulatory);
     face.wide=clamp(face.wide+(widened?.012:0)*articulatory);
     // No opening from an originally closed jaw; V384 owns closure and V562 ceilings.
     if(face.jaw>.08) face.jaw=Math.min(1-sealed*.985,clamp(face.jaw+face.jaw*.008*articulatory));
   }
 }
 // The existing vocalist's already timed word cue supports tiny expression.
 // This is NOT inferred emotion or a guess of which artist sings.
 face.brow=clamp(face.brow+.012*gain);
 face.cheek=clamp(face.cheek+.011*gain);
 face.squint=clamp(face.squint+.007*gain);
 // Preserve B/P/M, blink, smile, and the original lip contact exactly.
 face.lipsClosed=base.face.lipsClosed;
 face.blink=base.face.blink;
 face.smile=base.face.smile;
 const headVerified=!!coherent?.active&&coherent.source==='verified-timed-word'&&
   coherent.wordStartMs===mark.start&&Number.isFinite(coherent.headPitch)&&
   Number.isFinite(coherent.headYaw);
 const headPitch=headVerified?-.009*gain*Math.sin(Math.PI*phase):0;
 const headYaw=headVerified?Math.sign(coherent!.headYaw)*.003*gain:0;
 return {frame:{...base,face},active:true,source:'verified-timed-word',wordStartMs:mark.start,
   headPitch,headYaw,jawAttackRate:1+.045*gain,jawReleaseRate:1+.02*gain,
   vowelAttackRate:1-.025*gain,vowelReleaseRate:1+.025*gain};
}

/** No lip-seal, blink, smile or authored bone animation rates can be changed. */
export function expressiveVocalRateV612<T>(cue:ExpressiveVocalFaceV612<T>,channel:string,attacking:boolean):number{
 if(!cue.active)return 1;
 if(channel==='jaw')return attacking?cue.jawAttackRate:cue.jawReleaseRate;
 if(channel==='wide'||channel==='round')return attacking?cue.vowelAttackRate:cue.vowelReleaseRate;
 return 1;
}
