/**
 * V597 – restrained written-word flow smoothing for fast Deutschrap.
 *
 * The existing V384/V415/V420/V423/V523/V546 layers own closure, audio alignment,
 * word edits and facial targets. V597 never pretends to know phonemes, syllables
 * or performer identity from timestamps. Seek/pause-safe pure sampling only.
 */
import type {FacialPoseV369} from './facialPerformanceV369';
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

export type RapLipFlowKindV597='connected-flow'|'phrase-release'|'none';
export type RapLipFlowV597<T>={
  frame:T;active:boolean;kind:RapLipFlowKindV597;
  source:'verified-written-word'|'none';
  /** Multipliers of existing exponential attack/release rates, not channel targets. */
  jawAttackRate:number;jawReleaseRate:number;vowelAttackRate:number;vowelReleaseRate:number;
};
const clamp=(v:number)=>Number.isFinite(v)?Math.min(1,Math.max(0,v)):0;
const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
const normalize=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const beginsWithBilabial=(s:string)=>/^[^\p{L}]*[bmp]/iu.test(s);
const vowelHint=(s:string)=>s.toLocaleLowerCase('de-DE').match(/[aeiouäöü]/iu)?.[0]??'';
const FACE_KEYS=['jaw','wide','round','lipsClosed','smile','brow','blink','cheek','squint'] as const;
const validFace=(face:FacialPoseV369)=>{
  for(const key of FACE_KEYS){const v=face[key];if(!Number.isFinite(v)||v<0||v>1)return false;}
  return true;
};

/** Samples ONLY a real timed word and previously authorized singer; no stored phase. */
export function refineDeutschrapLipFlowV597<T extends {face:FacialPoseV369}>(
 base:T, input:DeutschrapFaceOptionsV538, tier:'low'|'balanced'|'high',
):RapLipFlowV597<T>{
 const off:RapLipFlowV597<T>={frame:base,active:false,kind:'none',source:'none',
   jawAttackRate:1,jawReleaseRate:1,vowelAttackRate:1,vowelReleaseRate:1};
 if(tier==='low'||!input.playing||!input.enabled||!input.rap||!input.verifiedWord||
    !input.roleAllowed||input.manualSilent||input.manualPriority||input.reducedMotion||
    input.preserveAudioMouth||!input.lyrics?.synced||!input.activeWord?.trim()||
    !Number.isFinite(input.effectiveTimeMs)||input.effectiveTimeMs<0||
    !Number.isFinite(input.intensity)||input.intensity<=0||!validFace(base.face))return off;
 const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
 if(!mark||normalize(mark.word.text)!==normalize(input.activeWord)||
    input.editedWords?.some(w=>w.startMs===mark.start&&normalize(w.text)===normalize(mark.word.text)))return off;
 const duration=mark.end-mark.start;
 if(duration<80||duration>560)return off;
 const elapsed=input.effectiveTimeMs-mark.start;
 const phase=clamp(elapsed/duration);
 const incomingConnected=Number.isFinite(mark.previousGap)&&mark.previousGap>=0&&mark.previousGap<=110;
 const nextConnected=!!mark.next&&Number.isFinite(mark.nextGap)&&mark.nextGap>=0&&mark.nextGap<=110;
 const dense=duration<=330&&(incomingConnected||nextConnected);
 const explicitEnd=Number.isFinite(mark.word.endMs)&&mark.word.endMs===mark.end;
 const phraseEnd=explicitEnd&&(!!mark.next?mark.nextGap>=180:duration>=120);
 if(!dense&&!phraseEnd)return off;
 // A B/P/M word's original lip seal cannot be weakened by a decorative cue.
 const bilabial=beginsWithBilabial(mark.word.text);
 const nextBilabial=!!mark.next&&beginsWithBilabial(mark.next.text);
 const strength=clamp(input.intensity/100)*(tier==='balanced'?.58:1);
 const gate=ease(elapsed/Math.min(85,duration*.34))*ease((duration-elapsed)/Math.min(90,duration*.38));
 if(gate<.00001||strength<.00001)return off;
 const face={...base.face};
 const sealed=clamp(face.lipsClosed);
 const openness=clamp((.25-sealed)/.25);
 const connectedFlow=dense&&nextConnected&&!bilabial&&!nextBilabial&&phase>.55;
 let kind:RapLipFlowKindV597='none';
 // Written vowels offer a SMALL shape hint, not a per-phoneme animation.
 // Explicit current lip closure stays authoritative, including future B/P/M onset.
 if(connectedFlow&&mark.next&&openness>0){
   const upcoming=vowelHint(mark.next.text);
   const round=/[oöuü]/iu.test(upcoming)?1:0;
   const wide=/[aeiä]/iu.test(upcoming)?1:0;
   const blend=gate*strength*ease((phase-.55)/.4)*.026*openness;
   if(upcoming&&blend>0){
     face.round=clamp(face.round*(1-blend)+round*blend);
     face.wide=clamp(face.wide*(1-blend)+wide*blend);
     // Keep original V546 jaw targets almost unchanged in a connected burst.
     face.jaw=clamp(Math.min(1-sealed*.985,face.jaw+blend*.22));
     kind='connected-flow';
   }
 }
 // On a genuine written-phrase ending, slightly ease the already-open jaw.
 // There is NO carry-over into unverified silence and no guessed next syllable.
 if(kind==='none'&&phraseEnd&&phase>.69&&!bilabial&&openness>0){
   const soften=gate*strength*ease((phase-.69)/.28)*.018*openness;
   if(soften>0){
     face.jaw=clamp(Math.max(0,face.jaw-soften));
     kind='phrase-release';
   }
 }
 if(kind==='none')return off;
 // Preserve ALL non-mouth channels and especially exact B/P/M closure.
 face.lipsClosed=base.face.lipsClosed;
 face.jaw=Math.min(face.jaw,1-face.lipsClosed*.985);
 const density=strength*gate*(dense?1:.4);
 return {frame:{...base,face},active:true,kind,source:'verified-written-word',
   jawAttackRate:1+.075*density,jawReleaseRate:1+.035*density,
   vowelAttackRate:1-.035*density,vowelReleaseRate:1+.03*density};
}

/** Existing V572/V581 rates retain priority; never accelerate lip closures. */
export function rapLipFlowRateV597<T>(plan:RapLipFlowV597<T>,channel:string,attacking:boolean):number{
 if(!plan.active)return 1;
 if(channel==='jaw')return attacking?plan.jawAttackRate:plan.jawReleaseRate;
 if(channel==='wide'||channel==='round')return attacking?plan.vowelAttackRate:plan.vowelReleaseRate;
 return 1;
}
