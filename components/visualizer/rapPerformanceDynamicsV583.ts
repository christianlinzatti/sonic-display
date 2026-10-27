/**
 * Sonic Display V583 – Intelligent Rap Performance Dynamics 3.0.
 * A deterministic, bounded finishing pass for the existing V472→V474 rap accent.
 * It consumes real lyric line/word timing and V473's conservative flow hints;
 * it does NOT infer singer identities, beats, vocal stems, adlib performers or
 * phonemes. Clip, foot IK, face and manual choreography are not modified.
 */
import type {VocalDanceAccentV472} from './vocalAwareChoreographyV472';
import {resolveRapFlowHintV473} from './rapFlowIntelligenceV473';

type TimedLineV583={text:string;startMs:number;endMs?:number|null;words?:readonly {text:string;startMs:number;endMs?:number|null}[]};
export type RapDynamicsModeV583='off'|'verse'|'relaxed'|'dense'|'flow-transition'|'hook'|'adlib-text';
export type RapDynamicsMotifV583='none'|'weight'|'counter'|'open'|'compact'|'answer'|'sway'|'hold';
export type RapDynamicsV583=Readonly<{
  active:boolean;
  mode:RapDynamicsModeV583;
  motif:RapDynamicsMotifV583;
  accent:VocalDanceAccentV472;
  /** Procedural avatar only; additive targets in radians, never root or feet. */
  headTurn:number;
  torsoSway:number;
  evidence:'none'|'line-timestamp'|'word-timestamps';
}>;
export type RapDynamicsInputV583={
  lyrics?:{synced:boolean;lines:readonly TimedLineV583[]}|null;
  progressMs?:number;
  offsetMs?:number;
  trackId?:string|null;
  slot:number;
  playing:boolean;
  rap:boolean;
  reducedMotion:boolean;
  authored:boolean;
  /** Already-selected music-structure section; not audio transcription. */
  section?:string|null;
  performanceTier:'low'|'balanced'|'high';
};
const MOTIFS:readonly Exclude<RapDynamicsMotifV583,'none'>[]=['weight','counter','open','compact','answer','sway','hold'];
const ARMS=[.97,1.05,1.035,.95,1.07,1.025,.92] as const;
const CHEST=[1.035,.975,.995,1.045,.97,1.04,.94] as const;
const HEAD=[1.025,.975,1.035,.97,1.015,1.045,.94] as const;
const SIDE=[1,-1,1,-1,-1,1,1] as const;
const cap=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const smooth=(t:number)=>{const v=cap(t,0,1);return v*v*(3-2*v);};
function seed(trackId:string):number{
 let h=2166136261;
 for(let i=0;i<Math.min(120,trackId.length);i++)h=Math.imul(h^trackId.charCodeAt(i),16777619);
 return h>>>0;
}
/** Motif changes per real lyric line; neighboring lines cannot select the same motif. */
export function selectRapDynamicsMotifV583(trackId:string,lineIndex:number,slot:number):RapDynamicsMotifV583{
 if(!trackId.trim()||!Number.isSafeInteger(lineIndex)||lineIndex<0||!Number.isSafeInteger(slot)||slot<0||slot>3)return 'none';
 return MOTIFS[(seed(trackId)%MOTIFS.length+lineIndex*3+slot*2)%MOTIFS.length];
}
function off(original:VocalDanceAccentV472):RapDynamicsV583{
 return {active:false,mode:'off',motif:'none',accent:original,headTurn:0,torsoSway:0,evidence:'none'};
}
export function planRapPerformanceDynamicsV583(original:VocalDanceAccentV472,input:RapDynamicsInputV583):RapDynamicsV583{
 // Early guard: no expensive lyric lookup for silent/background/manual/low-tier avatars.
 if(!original.active||original.role==='background'||!input.rap||!input.playing||input.reducedMotion||
    input.authored||input.performanceTier==='low'||!input.trackId?.trim()||
    !input.lyrics?.synced||!Number.isFinite(input.progressMs)||!Number.isFinite(input.offsetMs??0)||
    Math.abs(input.offsetMs??0)>2000||!Number.isSafeInteger(input.slot)||input.slot<0||input.slot>3||
    original.lineIndex<0||original.lineIndex>=input.lyrics.lines.length)return off(original);
 const time=input.progressMs!+(input.offsetMs??0);
 const line=input.lyrics.lines[original.lineIndex];
 const nextStart=input.lyrics.lines[original.lineIndex+1]?.startMs??Infinity;
 const end=Math.min(line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,
                    nextStart,line.startMs+15000);
 if(!Number.isFinite(time)||!Number.isFinite(line.startMs)||time<line.startMs||time>=end||end<=line.startMs)return off(original);
 const hint=resolveRapFlowHintV473({lyrics:input.lyrics,progressMs:input.progressMs,offsetMs:input.offsetMs,
   playing:input.playing,rap:input.rap,reducedMotion:input.reducedMotion,section:input.section});
 if(!hint.active||hint.lineIndex!==original.lineIndex)return off(original);
 // Adlibs are explicitly bracketed text candidates, NOT isolated voices.
 // Hook/chorus are supplied by the existing stage section, never fabricated.
 const mode:RapDynamicsModeV583=hint.adlibCandidate?'adlib-text':
   input.section==='hook'||input.section==='chorus'?'hook':
   hint.change!=='none'?'flow-transition':
   hint.wordsPerSecond!=null&&hint.wordsPerSecond>=4?'dense':
   hint.wordsPerSecond!=null&&hint.wordsPerSecond<=1.85?'relaxed':'verse';
 const motif=selectRapDynamicsMotifV583(input.trackId,original.lineIndex,input.slot);
 if(motif==='none')return off(original);
 const motifIndex=MOTIFS.indexOf(motif);
 // A soft phrase crossfade prevents jumping between sections at lyric boundaries.
 // An explicit faster/slower V473 transition additionally eases over ~550 ms.
 const elapsed=time-line.startMs;
 const phraseFade=smooth(elapsed/260)*smooth((end-time)/260);
 const confidence=hint.evidence==='word-timestamps'?1:.38;
 const variation=(input.performanceTier==='balanced'?.65:1)*confidence*phraseFade;
 const strength=mode==='hook'?1.15:mode==='dense'?1.115:mode==='relaxed'?.82:
                mode==='flow-transition'?(hint.change==='faster'?1.13:.84):
                mode==='adlib-text'?.92:1;
 const transitionBlend=mode==='flow-transition'?smooth(elapsed/550):1;
 const weight=cap(variation*transitionBlend,0,1);
 const level=1+(strength-1)*weight;
 // No hard jump: motif variation also follows the real phrase envelope.
 const head=cap(original.head*(1+(HEAD[motifIndex]*level-1)*weight),0,.055);
 const chest=cap(original.chest*(1+(CHEST[motifIndex]*level-1)*weight),0,.09);
 const arms=cap(original.arms*(1+(ARMS[motifIndex]*level-1)*weight),0,.11);
 // Preserve V474 side and casting. Only offset procedural upper-body targets.
 const direction=SIDE[motifIndex]*(input.slot%2?-1:1);
 const poseGain=weight*cap(original.arms/.11,0,1);
 const headTurn=cap(direction*(mode==='hook'?.007:mode==='adlib-text'?.004:.006)*poseGain,-.007,.007);
 const torsoSway=cap(-direction*(mode==='relaxed'?.004:.007)*poseGain,-.007,.007);
 return {active:true,mode,motif,evidence:hint.evidence,
   accent:{...original,head,chest,arms},headTurn,torsoSway};
}
