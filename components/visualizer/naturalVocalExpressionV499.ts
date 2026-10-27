import type {AdvancedVocalFrameV459} from "./advancedVocalPerformanceV459";
import type {ExpressiveLipFrameV476} from "./expressiveLipSyncV476";
import type {ExpressiveLipContextV453} from "./expressiveLipSyncV453";
import {normalizeVocalTimeSegmentsV496,type VocalTimeSegmentV496} from "./vocalTimeDirectorV496";

/** V499 only feathers existing, illustrative V476 micro-expression at V496's
 * manually-authored performer boundaries. It is NOT phoneme recognition,
 * diarization, forced mouth closure, or a new source of vocal timestamps.
 */
export type NaturalVocalExpressionV499=ExpressiveLipFrameV476&{
  activeV499:boolean;
  roleEnvelopeV499:number;
  transitionV499:"enter"|"exit"|"sustain"|"none";
};
export type NaturalVocalInputV499={
  trackId:string;cueTrackId:string;progressMs:number;
  playing:boolean;enabled:boolean;reducedMotion:boolean;
  avatarSlot:number;castCount:number;
  segments:readonly VocalTimeSegmentV496[]|undefined;
  /** A V385 manual singer assignment or authored choreography has precedence. */
  manualPriority?:boolean;
};
const clamp=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
const smooth=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
const idle=(frame:ExpressiveLipFrameV476):NaturalVocalExpressionV499=>({...frame,activeV499:false,roleEnvelopeV499:1,transitionV499:"none"});

/** Stateless, seek-safe: the same timeline, word and millisecond yield the same pose.
 * Primary V453/V459 mouth, V420 author edits, and V423 audio evidence win.
 * Only the additive V476 micro-expression and optional V459 head extras are
 * eased; bilabial closure, primary jaw and user-authored blink stay untouched.
 */
export function refineNaturalVocalExpressionV499(
  base:AdvancedVocalFrameV459,frame:ExpressiveLipFrameV476,
  context:ExpressiveLipContextV453,input:NaturalVocalInputV499,
):NaturalVocalExpressionV499{
  const off=idle(frame);
  if(!base.active||!frame.activeV476||!context.playing||context.enabled===false||
    context.reducedMotion||context.manualSilent||context.preserveAudioMouth||
    !input.playing||!input.enabled||input.reducedMotion||input.manualPriority||
    !input.trackId||input.trackId!==input.cueTrackId||
    !Number.isFinite(input.progressMs)||input.progressMs<0||
    !Number.isInteger(input.castCount)||input.castCount<2||input.castCount>4||
    !Number.isInteger(input.avatarSlot)||input.avatarSlot<0||input.avatarSlot>=input.castCount||
    !input.segments?.length)return off;
  // Normalize only once per in-frame evaluation. Scanning at most the V496
  // editor's 120 authored intervals avoids re-normalizing on every role lookup.
  const segments=normalizeVocalTimeSegmentsV496(input.segments);
  const valid=(s:VocalTimeSegmentV496)=>s.leadSlot<input.castCount&&
    (s.style!=="duet"||s.partnerSlot<input.castCount);
  const selectedAt=(time:number)=>{
    let chosen:VocalTimeSegmentV496|undefined;
    for(const s of segments)if(valid(s)&&s.startMs<=time&&time<s.endMs)chosen=s;
    return chosen;
  };
  const sings=(s:VocalTimeSegmentV496)=>s.style==="hook"||
    s.leadSlot===input.avatarSlot||(s.style==="duet"&&s.partnerSlot===input.avatarSlot);
  const now=selectedAt(input.progressMs);
  if(!now||!sings(now))return off;

  // If this avatar was already singing in the previous active V496 segment,
  // a later editorial entry must not reset its mouth micro-expression.
  const previous=now.startMs>0?selectedAt(now.startMs-1):undefined;
  let alreadySinging=!!previous&&sings(previous);
  if(!alreadySinging){
    let previousEnded:VocalTimeSegmentV496|undefined;
    for(const s of segments){
      if(valid(s)&&s.endMs<=now.startMs&&now.startMs-s.endMs<=650&&
        (!previousEnded||s.endMs>=previousEnded.endMs))previousEnded=s;
    }
    alreadySinging=!!previousEnded&&sings(previousEnded);
  }
  const elapsed=input.progressMs-now.startMs;
  const remaining=now.endMs-input.progressMs;
  const incoming=alreadySinging?1:smooth(elapsed/240);
  // The release only feathers micro-expression. Never silence the underlying
  // aligned voice, or imply that the singer stopped before the actual boundary.
  const outgoing=smooth(remaining/205);
  const envelope=Math.min(incoming,outgoing);
  const face={...frame.face};
  const channels=["jaw","wide","round","cheek","brow","squint"] as const;
  for(const channel of channels){
    // Blend ONLY the extra V476 delta, not the genuine timed V453/V459 mouth.
    face[channel]=clamp(base.face[channel]+(frame.face[channel]-base.face[channel])*envelope);
  }
  return {...frame,face,activeV499:true,roleEnvelopeV499:envelope,
    transitionV499:incoming<outgoing?"enter":outgoing<incoming?"exit":"sustain",
    // Restrain illustrative head accents, but never touch V453 gesture ownership.
    headPitchExtra:base.headPitchExtra*envelope,
    headYawExtra:base.headYawExtra*envelope};
}
