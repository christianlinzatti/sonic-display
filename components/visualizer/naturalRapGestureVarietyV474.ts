/**
 * V474 - deterministic, non-repeating rap gesture motifs for existing V472/V473 accents.
 * Visual choreography only: does not detect vocals, beats, stress or individual singers.
 * No timers, persistent state, randomness or modifications to the original GLB clips.
 */
import type {VocalDanceAccentV472} from './vocalAwareChoreographyV472';

export type RapGestureMotifV474='none'|'nod'|'open'|'reply'|'sweep'|'bounce';
export type RapGestureVariationV474={
  active:boolean;
  motif:RapGestureMotifV474;
  accent:VocalDanceAccentV472;
  /** Small optional additive pose for the procedural fallback only (radians). */
  headTurn:number;
  headTilt:number;
  torsoSway:number;
};
export type RapGestureVarietyInputV474={
  trackId?:string|null;slot:number;playing:boolean;reducedMotion:boolean;
  /** Saved choreography or explicit manual performance owns these joints. */
  authored?:boolean;section?:string|null;
};
const MOTIFS:readonly Exclude<RapGestureMotifV474,'none'>[]=['nod','open','reply','sweep','bounce'];
const armWeights=[0.92,1.06,0.97,1.12,0.89] as const;
const headWeights=[1.09,0.95,1.02,0.91,1.13] as const;
const torsoWeights=[0.96,1.06,1.00,1.07,0.94] as const;
const clamp=(v:number,min:number,max:number)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
/** Stable, short seed from the Spotify track ID (not an artist identity). */
function trackSeed(trackId:string):number{
 let hash=2166136261;
 for(let i=0;i<Math.min(120,trackId.length);i++){
   hash=Math.imul(hash^trackId.charCodeAt(i),16777619);
 }
 return hash>>>0;
}
/** Every adjacent lyric line selects another motif for the same performer.
 * On hooks all performers share the motif, but retain small alternate arm/head bias.
 */
export function selectRapGestureMotifV474(trackId:string,lineIndex:number,slot:number,section?:string|null):RapGestureMotifV474{
 if(!trackId.trim()||!Number.isSafeInteger(lineIndex)||lineIndex<0||!Number.isFinite(slot))return 'none';
 const performer=Math.max(0,Math.min(3,Math.trunc(slot)));
 const hook=section==='hook'||section==='chorus';
 return MOTIFS[(trackSeed(trackId)%5+lineIndex*2+(hook?0:performer))%5];
}
/** Preserve the accent clock and real vocal role; vary only small, bounded movement.
 * A background performer is never promoted into an automatically recognised singer.
 */
export function resolveNaturalRapGestureV474(
 original:VocalDanceAccentV472,input:RapGestureVarietyInputV474,
):RapGestureVariationV474{
 const inactive:RapGestureVariationV474={active:false,motif:'none',accent:original,headTurn:0,headTilt:0,torsoSway:0};
 if(!original.active||!input.playing||input.reducedMotion||input.authored||
    original.role==='background'||!input.trackId||original.lineIndex<0)return inactive;
 const slot=Math.max(0,Math.min(3,Math.trunc(Number.isFinite(input.slot)?input.slot:0)));
 const motif=selectRapGestureMotifV474(input.trackId,original.lineIndex,slot,input.section);
 if(motif==='none')return inactive;
 const index=MOTIFS.indexOf(motif);
 const hook=input.section==='hook'||input.section==='chorus';
 const sideSign=((index===1||index===3)?-1:1)*(slot%2?-1:1);
 const side=clamp(Math.abs(original.side),0,1)*sideSign;
 // No invented word/phoneme accents: the underlying V472/V473 word clock is unchanged.
 const accent:VocalDanceAccentV472={
  ...original,
  side,
  head:clamp(original.head*headWeights[index],0,.055),
  chest:clamp(original.chest*torsoWeights[index],0,.09),
  arms:clamp(original.arms*armWeights[index]*(hook?.99:1),0,.11),
 };
 // Only derive tiny pose biases from an existing positive vocal cue.
 const gain=clamp(original.arms/.11,0,1);
 const stagger=hook?.7:1;
 const facing=slot%2?-1:1;
 return {active:true,motif,accent,
  headTurn:clamp(facing*(index===2?-.018:index===3?.017:.009)*gain*stagger,-.018,.018),
  headTilt:clamp(facing*(index===0?.012:index===4?-.010:.006)*gain*stagger,-.012,.012),
  torsoSway:clamp(side*(index===3?.016:.009)*gain*stagger,-.016,.016),
 };
}
