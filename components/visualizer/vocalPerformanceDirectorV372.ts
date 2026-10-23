import type { Lyrics } from "@/types/music";
import {resolveVocalPerformanceV368, type VocalPerformanceCueV368, type VocalStyleV368} from "./vocalPerformanceV368";
import {resolveFacialPoseV369, type FacialPoseV369} from "./facialPerformanceV369";
import {resolveVocalStageCueV371, type VocalStageCueV371} from "./vocalStageExpressionV371";

/** Shared track-clock vocal director. Predicts *visual* articulation from timed text;
 * does not identify actual recorded phonemes or voices. No timers or mutable cache. */
export type VocalDirectorOptionsV372 = {
  enabled?: boolean;
  reducedMotion?: boolean;
  alignment?: number; // 0..100: link facial/emphasis and body accents
  timingOffsetMs?: number; // -200..200, applies to BOTH channels (not karaoke text)
  style?: VocalStyleV368;
  genre?: string | null;
  mode?: "lyrics" | "hybrid";
  mids?: number;
  expression?: number; // 0..1
  lipStrength?: number;
  jawFollow?: number;
  bodyEnabled?: boolean;
  bodyStrength?: number;
  eyeContact?: boolean;
  gestures?: boolean;
  avatarSlot?: number;
  partnerAttention?: number;
  authoredPriority?: boolean;
};
export type CoordinatedVocalCueV372 = {
  songTimeMs: number;
  effectiveTimeMs: number;
  vocal: VocalPerformanceCueV368;
  face: FacialPoseV369;
  body: VocalStageCueV371;
  confidence: "none" | "line" | "word";
  /** 0..1 shared focus for a timed word, not a classification certainty. */
  focus: number;
};
const bound=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;

export function resolveCoordinatedVocalV372(
  lyrics: Lyrics | null, songTimeMs: number, playing: boolean, options: VocalDirectorOptionsV372={}
): CoordinatedVocalCueV372 {
  const enabled=options.enabled!==false;
  const time=Number.isFinite(songTimeMs)?Math.max(0,songTimeMs+(enabled?bound(Number.isFinite(options.timingOffsetMs)?options.timingOffsetMs!:0,-200,200):0)):0;
  const active=playing && !options.reducedMotion && (options.lipStrength??90)>0;
  const vocal=resolveVocalPerformanceV368(lyrics,time,active,{
    style:options.style??"auto",genre:options.genre,mode:options.mode??"lyrics",mids:options.mids??0,
    expression:options.expression??.55,avatarSlot:options.avatarSlot??0,
  });
  const face=resolveFacialPoseV369(vocal,{strength:options.lipStrength??90,jawFollow:options.jawFollow??65});
  const body=resolveVocalStageCueV371(lyrics,time,active,{
    enabled:options.bodyEnabled!==false,reducedMotion:options.reducedMotion,
    style:options.style??"auto",genre:options.genre,strength:options.bodyStrength??60,
    eyeContact:options.eyeContact!==false,gestures:options.gestures!==false,
    avatarSlot:options.avatarSlot??0,partnerAttention:options.partnerAttention,
    authoredPriority:options.authoredPriority,
    baseCueV368:vocal,
  });
  // Only trustworthy word marks may drive cross-channel accents. With a line-only
  // timestamp there is no invented gesture/brow/emphasis, just the legacy low-level motion.
  const linked=enabled && vocal.confidence==="word" && body.confidence==="word";
  const blend=linked?bound((options.alignment??70)/100,0,1):0;
  const focus=linked?bound(body.emphasis*(.4+.6*face.jaw),0,1):0;
  if (!blend || !focus) return {songTimeMs,effectiveTimeMs:time,vocal,face,body,confidence:vocal.confidence,focus};
  const gestureGain=1+blend*(.15*face.jaw-.04);
  return {songTimeMs,effectiveTimeMs:time,vocal,confidence:vocal.confidence,focus,
    face:{...face,brow:bound(face.brow+blend*focus*.06,0,1),
      cheek:bound(face.cheek+blend*focus*.035,0,1)},
    body:{...body,headPitch:body.headPitch*gestureGain,
      headTilt:body.headTilt*gestureGain,
      chestLean:body.chestLean*gestureGain,
      leftArm:body.leftArm*gestureGain,rightArm:body.rightArm*gestureGain},
  };
}
