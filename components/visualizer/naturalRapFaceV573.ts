/** V573: naturally timed, deliberately small expressions on verified Deutschrap words.
 * Actual word marks are required. This is NOT emotion/phoneme recognition.
 * Does not touch lips, jaw, authored preview, audio-mouth edits or blink cadence.
 */
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import type {FacialPoseV369} from './facialPerformanceV369';
import {rapLipWordAtV415} from './rapLipPrecisionV415';
const clamp=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const ease=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
export type NaturalRapExpressionV573=Readonly<{active:boolean;brow:number;cheek:number;squint:number;blink:number;wordStartMs:number}>;
export const EMPTY_RAP_EXPRESSION_V573:NaturalRapExpressionV573=Object.freeze({active:false,brow:0,cheek:0,squint:0,blink:0,wordStartMs:-1});
export function planNaturalRapExpressionV573(input:DeutschrapFaceOptionsV538):NaturalRapExpressionV573{
 if(!input.playing||!input.enabled||!input.rap||!input.verifiedWord||input.reducedMotion||
    !input.roleAllowed||input.manualSilent||input.manualPriority||input.preserveAudioMouth||
    !Number.isFinite(input.intensity)||input.intensity<=0||!Number.isFinite(input.effectiveTimeMs)||
    input.effectiveTimeMs<0||!input.lyrics?.synced||!input.activeWord?.trim())return EMPTY_RAP_EXPRESSION_V573;
 const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
 if(!mark||mark.word.text.trim().toLocaleLowerCase('de')!==input.activeWord.trim().toLocaleLowerCase('de')||
    input.editedWords?.some(w=>w.startMs===mark.start))return EMPTY_RAP_EXPRESSION_V573;
 const duration=mark.end-mark.start;
 if(duration<90||duration>950)return EMPTY_RAP_EXPRESSION_V573;
 const envelope=ease((input.effectiveTimeMs-mark.start)/Math.min(125,duration*.35))*
   ease((mark.end-input.effectiveTimeMs)/Math.min(185,duration*.4));
 const gain=clamp(input.intensity/100)*envelope;
 // Subtle facial engagement; no inferred anger/sadness; no artificial spoken syllables.
 return {active:gain>.0001,brow:gain*.075,cheek:gain*.055,squint:gain*.045,blink:0,wordStartMs:mark.start};
}
/** Additively refine only expression channels, never the authored mouth pose. */
export function applyNaturalRapExpressionV573<T extends {face:FacialPoseV369}>(frame:T,expression:NaturalRapExpressionV573):T{
 if(!expression.active)return frame;
 return {...frame,face:{...frame.face,
   brow:clamp((frame.face.brow??0)+expression.brow),
   cheek:clamp((frame.face.cheek??0)+expression.cheek),
   squint:clamp((frame.face.squint??0)+expression.squint)}};
}
