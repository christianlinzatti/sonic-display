/**
 * V631 – evidence-bounded mouth response continuity for rapid Deutschrap.
 *
 * This uses ONLY synced word boundaries and already computed mouth targets.
 * Written lyrics do NOT supply phoneme / syllable timestamps. V384/V415/V420,
 * V423 audio, V562 calibration and manual singer assignment own the mouth.
 * No added morphs, word clocks, smoothing state, render loops or GPU allocations.
 */
import type {FacialPoseV369} from './facialPerformanceV369';
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

export type VocalLipSyncModeV631='connected-flow'|'phrase-settle'|'none';
export type VocalLipSyncV631<T> = Readonly<{
 frame:T;active:boolean;mode:VocalLipSyncModeV631;
 source:'verified-timed-word'|'none';wordStartMs:number;
 /** 0–1 verified-word envelope; never a guessed phoneme intensity. */
 weight:number;edge:number;
}>;
const clamp=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
const name=(v:string)=>v.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const bilabial=(v:string)=>/^[^\p{L}]*[bmp]/iu.test(v);
const valid=(face:FacialPoseV369)=>
 (['jaw','wide','round','lipsClosed','smile','brow','blink','cheek','squint'] as const)
  .every(k=>Number.isFinite(face[k])&&face[k]>=0&&face[k]<=1);

/** Pure, seek-safe policy: returns the original frame unchanged on purpose. */
export function planAdvancedVocalLipSyncV631<T extends {face:FacialPoseV369}>(
 frame:T,input:DeutschrapFaceOptionsV538,tier:'low'|'balanced'|'high',
):VocalLipSyncV631<T>{
 const off:VocalLipSyncV631<T>={frame,active:false,mode:'none',source:'none',wordStartMs:-1,weight:0,edge:0};
 if(tier==='low'||!input.playing||!input.enabled||!input.rap||!input.verifiedWord||
   !input.roleAllowed||input.manualSilent||input.manualPriority||input.reducedMotion||
   input.preserveAudioMouth||!input.lyrics?.synced||!input.activeWord?.trim()||
   !Number.isFinite(input.effectiveTimeMs)||input.effectiveTimeMs<0||
   !Number.isFinite(input.intensity)||input.intensity<=0||!valid(frame.face)||
   frame.face.lipsClosed>=.16)return off;
 const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
 if(!mark||name(mark.word.text)!==name(input.activeWord)||
    input.editedWords?.some(w=>w.startMs===mark.start))return off;
 const duration=mark.end-mark.start;
 if(!Number.isFinite(duration)||duration<90||duration>450||
   bilabial(mark.word.text)||
   (mark.next&&mark.nextGap>=0&&mark.nextGap<=115&&bilabial(mark.next.text)))return off;
 const connectedBefore=Number.isFinite(mark.previousGap)&&mark.previousGap>=0&&mark.previousGap<=110;
 const connectedAfter=!!mark.next&&Number.isFinite(mark.nextGap)&&mark.nextGap>=0&&mark.nextGap<=110;
 const endOfPhrase=connectedBefore&&!connectedAfter&&mark.nextGap>=180;
 const mode:VocalLipSyncModeV631=duration<=370&&(connectedBefore||connectedAfter)
   ?endOfPhrase?'phrase-settle':'connected-flow':'none';
 if(mode==='none')return off;
 const elapsed=input.effectiveTimeMs-mark.start;
 const remaining=mark.end-input.effectiveTimeMs;
 // Envelope goes to neutral at both boundaries, preserving the current target
 // exactly. "edge" only controls large existing morph changes, not seals.
 const envelope=ease(elapsed/Math.min(85,duration*.30))*ease(remaining/Math.min(95,duration*.35));
 const weight=clamp(envelope*clamp(input.intensity/100)*(tier==='balanced'?.56:1));
 const edge=1-ease(Math.min(elapsed,remaining)/Math.min(88,duration*.32));
 return {frame,active:weight>0,mode,source:'verified-timed-word',wordStartMs:mark.start,weight,edge};
}

/**
 * Subtle multiplier for the caller's *existing* exponential mouth target rate.
 * Small in-word changes become a touch crisper; large changes near word
 * boundaries slow slightly rather than snapping. No synthetic mouth shapes.
 * Lip closures, eye, brow, smile and all other morph channels are untouched.
 */
export function vocalMouthRateV631<T>(
 cue:VocalLipSyncV631<T>,channel:string,attacking:boolean,current:number,target:number,
):number{
 if(!cue.active||(channel!=='jaw'&&channel!=='wide'&&channel!=='round')||
   !Number.isFinite(current)||!Number.isFinite(target)||current<0||current>1||target<0||target>1)return 1;
 const difference=Math.abs(target-current);
 if(difference<.000001)return 1;
 const largeJump=ease((difference-.22)/.34);
 const pace=1+cue.weight*(attacking?.115:.078)*(1-.40*largeJump);
 const softEdge=cue.edge*largeJump*cue.weight*.24;
 const phraseRelease=cue.mode==='phrase-settle'&&!attacking?cue.edge*cue.weight*.045:0;
 return Math.max(.85,Math.min(1.15,pace-softEdge-phraseRelease));
}
