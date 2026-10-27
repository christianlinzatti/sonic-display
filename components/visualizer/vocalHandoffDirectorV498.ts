import {normalizeVocalTimeSegmentsV496,resolveVocalTimeCueV496,type VocalTimeSegmentV496} from "./vocalTimeDirectorV496";
import type {CinematicConcertCueV497} from "./cinematicConcertChoreographyV497";

/** V498 extends the existing V497 cue. No playback state, timers, new lights or animation loops. */
export type VocalConcertHandoffV498=CinematicConcertCueV497&{
  /** A preceding *authored* singer, never an artist guessed from lyrics/audio. */
  focusFromV498:number|null;
  /** 0 = preceding singer, 1 = selected singer; only used for automatic beam steering. */
  focusBlendV498:number;
  /** Deterministic cinematic accent envelope based on the current song timestamp. */
  accentEnvelopeV498:number;
};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const transitionMs=850;

/**
 * Feather automatic lighting and camera at user-authored vocal interval boundaries.
 * Resolve a preceding singer strictly within the same supplied track timeline.
 * Source remains V496's last-entry-wins selection; without an active V497 cue
 * this function cannot turn a camera or light on.
 */
export function refineVocalConcertHandoffsV498(
  cue:CinematicConcertCueV497,
  input:{trackId:string;progressMs:number;castCount:number;
    segments:readonly VocalTimeSegmentV496[]|undefined}
):VocalConcertHandoffV498{
  const neutral={...cue,focusFromV498:null,focusBlendV498:1,accentEnvelopeV498:0};
  const now=input.progressMs;
  if(!cue.active||cue.trackId!==input.trackId||!input.trackId||
      !Number.isFinite(now)||now<cue.startMs||now>=cue.endMs||
      !Number.isInteger(input.castCount)||input.castCount<2||input.castCount>4)return neutral;

  const elapsed=now-cue.startMs,remaining=cue.endMs-now;
  const cameraFade=Math.min(ease(elapsed/570),ease(remaining/520));
  const lightFade=Math.min(ease(elapsed/460),ease(remaining/460));
  // V497 limits gains to +11% key / +13% beam; V498 only reduces them.
  const cameraWeight=cue.cameraActive?cue.cameraWeight*cameraFade:0;
  const lightGain=cue.lightingActive?1+(cue.lightGain-1)*lightFade:1;
  const beamGain=cue.lightingActive?1+(cue.beamGain-1)*lightFade:1;

  let focusFromV498:number|null=null;
  let focusBlendV498=1;
  if(cue.lightingActive&&cue.focusSlot!==null&&elapsed<transitionMs){
    const segments=normalizeVocalTimeSegmentsV496(input.segments);
    // Active immediately before this segment wins, including overlaps.
    const previous=cue.startMs>0?resolveVocalTimeCueV496({
      trackId:input.trackId,progressMs:cue.startMs-1,playing:true,enabled:true,
      count:input.castCount,segments,reducedMotion:false,
    }):null;
    let precedingSlot=previous?.active?previous.leadSlot:null;
    // Short silent interstitials can still have a smooth authored hand-off.
    if(precedingSlot===null){
      const ended=segments.filter(s=>s.endMs<=cue.startMs&&
        cue.startMs-s.endMs<=650&&s.leadSlot<input.castCount&&
        (s.style!=="duet"||s.partnerSlot<input.castCount));
      if(ended.length){
        const latestEnd=Math.max(...ended.map(s=>s.endMs));
        // Same-timestamp entries: the last valid one wins, as in V496.
        precedingSlot=ended.filter(s=>s.endMs===latestEnd).at(-1)?.leadSlot??null;
      }
    }
    if(precedingSlot!==null&&precedingSlot!==cue.focusSlot&&
       precedingSlot>=0&&precedingSlot<input.castCount){
      focusFromV498=precedingSlot;
      focusBlendV498=ease(elapsed/transitionMs);
    }
  }
  return {...cue,cameraWeight,lightGain,beamGain,focusFromV498,
    focusBlendV498,accentEnvelopeV498:Math.min(cameraFade,lightFade)};
}
