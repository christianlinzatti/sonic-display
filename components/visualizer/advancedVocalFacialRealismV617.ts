/**
 * V617 – restrained word-paced facial realism for existing GLB/procedural rigs.
 *
 * Synced text is evidence of word *boundaries*, not evidence of phonemes, breaths,
 * emotion, a singer identity or sounds from audio. This stage never creates lip
 * poses: V384/V415/V546/V597/V612 and manual/audio calibration own the mouth.
 * The GLB's V574/V581 confirmed head / eye cues own gaze direction.
 * Pure frame-local function – seeking, pausing, changing singer or song leaves
 * no cached facial state behind. No additional render loops or 3D allocations.
 */
import type {FacialPoseV369} from './facialPerformanceV369';
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import type {CoherentRapFaceV581} from './coherentRapFacialPerformanceV581';
import type {EyeCueV574} from './verifiedEyeContactV574';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

export type VocalFacialRealismV617<T>=Readonly<{
  frame:T;active:boolean;source:'verified-timed-word'|'none';wordStartMs:number;
  jawAttackRate:number;jawReleaseRate:number;vowelAttackRate:number;vowelReleaseRate:number;
  /** Additive rotations, radians: valid only on real bones with verified cues. */
  headPitch:number;headYaw:number;eyePitch:number;eyeYaw:number;
}>;
const clamp=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const smooth=(n:number)=>{const x=clamp(n);return x*x*(3-2*x);};
const normalize=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const valid=(face:FacialPoseV369)=>
  (['jaw','wide','round','lipsClosed','smile','brow','blink','cheek','squint'] as const)
    .every(k=>Number.isFinite(face[k])&&face[k]>=0&&face[k]<=1);
const isBilabial=(s:string)=>/^[^\p{L}]*[bmp]/iu.test(s);
const inactive=<T>(frame:T):VocalFacialRealismV617<T>=>({
  frame,active:false,source:'none',wordStartMs:-1,
  jawAttackRate:1,jawReleaseRate:1,vowelAttackRate:1,vowelReleaseRate:1,
  headPitch:0,headYaw:0,eyePitch:0,eyeYaw:0,
});

/** Adds measured-word expressiveness without changing jaw/mouth/blink targets. */
export function refineVocalFacialRealismV617<T extends {face:FacialPoseV369}>(
 base:T,input:DeutschrapFaceOptionsV538,tier:'low'|'balanced'|'high',
 coherent?:CoherentRapFaceV581|null,eye?:EyeCueV574|null,
):VocalFacialRealismV617<T>{
 const off=inactive(base);
 if(tier==='low'||!input.playing||!input.enabled||!input.rap||!input.verifiedWord||
    !input.roleAllowed||input.manualSilent||input.manualPriority||input.reducedMotion||
    input.preserveAudioMouth||!input.lyrics?.synced||!input.activeWord?.trim()||
    !Number.isFinite(input.effectiveTimeMs)||input.effectiveTimeMs<0||
    !Number.isFinite(input.intensity)||input.intensity<=0||!valid(base.face))return off;
 const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
 if(!mark||normalize(mark.word.text)!==normalize(input.activeWord)||
    input.editedWords?.some(w=>w.startMs===mark.start))return off;
 const duration=mark.end-mark.start;
 if(!Number.isFinite(duration)||duration<90||duration>850)return off;
 const elapsed=input.effectiveTimeMs-mark.start;
 const phase=clamp(elapsed/duration);
 const envelope=smooth(elapsed/Math.min(115,duration*.33))*
   smooth((mark.end-input.effectiveTimeMs)/Math.min(150,duration*.40));
 const gain=envelope*clamp(input.intensity/100)*(tier==='balanced'?.55:1);
 if(gain<.00001)return off;
 const previousGap=Number.isFinite(mark.previousGap)?mark.previousGap:Infinity;
 const nextGap=mark.next&&Number.isFinite(mark.nextGap)?mark.nextGap:Infinity;
 const connected=duration<=400&&(previousGap>=0&&previousGap<=125||nextGap>=0&&nextGap<=125);
 const mouthOpen=base.face.lipsClosed<.20;
 const sealed=isBilabial(mark.word.text)||
   (nextGap>=0&&nextGap<=80&&!!mark.next&&isBilabial(mark.next.text));
 // This layer ONLY adjusts how quickly EXISTING mouth targets are reached.
 // Never relax a B/P/M contact or change how its lip-seal morph responds.
 const canPace=connected&&mouthOpen&&!sealed;
 const mouthGain=canPace?gain:0;
 const late=smooth((phase-.38)/.5);
 const jawAttackRate=1+.055*mouthGain*(1-late);
 const jawReleaseRate=1+.040*mouthGain*late;
 const vowelAttackRate=1+.035*mouthGain*(1-late);
 const vowelReleaseRate=1+.045*mouthGain*late;
 const face={...base.face,
   brow:clamp(base.face.brow+.009*gain),
   cheek:clamp(base.face.cheek+.008*gain),
   squint:clamp(base.face.squint+.005*gain),
 };
 // These five authored/safety channels are never rewritten, even when connected.
 // In particular, there is no jaw/vowel target synthesis from written vowels.
 const headVerified=!!coherent?.active&&coherent.source==='verified-timed-word'&&
   coherent.wordStartMs===mark.start&&Number.isFinite(coherent.headPitch)&&
   Number.isFinite(coherent.headYaw);
 const headPitch=headVerified?Math.sign(coherent!.headPitch)*.004*gain*Math.sin(Math.PI*phase):0;
 const headYaw=headVerified?Math.sign(coherent!.headYaw)*.002*gain:0;
 // Eye gestures require an independently verified V574 gaze; no synthetic
 // partner glances in a solo and no change of existing gaze direction.
 const eyeVerified=headVerified&&eye&&eye.mode!=='off'&&eye.weight>0&&
   Number.isFinite(eye.weight)&&eye.weight<=1&&Number.isFinite(eye.yaw)&&
   Number.isFinite(eye.pitch);
 const eyePitch=eyeVerified?Math.sign(eye.pitch)*.003*gain*eye.weight:0;
 const eyeYaw=eyeVerified?Math.sign(eye.yaw)*.003*gain*eye.weight:0;
 return {frame:{...base,face},active:true,source:'verified-timed-word',wordStartMs:mark.start,
   jawAttackRate,jawReleaseRate,vowelAttackRate,vowelReleaseRate,
   headPitch,headYaw,eyePitch,eyeYaw};
}

/** Mouth closure and all other authored channels always retain their rates. */
export function vocalFacialRateV617<T>(cue:VocalFacialRealismV617<T>,channel:string,attacking:boolean):number{
 if(!cue.active)return 1;
 if(channel==='jaw')return attacking?cue.jawAttackRate:cue.jawReleaseRate;
 if(channel==='wide'||channel==='round')return attacking?cue.vowelAttackRate:cue.vowelReleaseRate;
 return 1;
}
