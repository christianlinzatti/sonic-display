import type { RapArticulationCueV405 } from "./rapArticulationV405";
import type { VocalStageCueV371 } from "./vocalStageExpressionV371";

/** V406: share ONE already-verified lyric-word clock between facial emphasis and
 * restrained head / shoulder / torso accents. Visual estimates only: we do NOT
 * detect phonemes, classify the recorded vocalist or fabricate word boundaries. */
export type RapPerformanceContextV406 = {
  playing: boolean;
  reducedMotion?: boolean;
  enabled?: boolean;
  slot?: number;
  energy?: number;
  strength?: number;        // Existing vocal expression control (0..100)
  authoredPriority?: boolean;
  bodyEnabled?: boolean;
  gestures?: boolean;
  eyeContact?: boolean;
};

const unit = (n: number): number => Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
const limit = (n: number, min: number, max: number): number => Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
const ZERO = Object.freeze({active:false,drive:0,head:0,shoulder:0,torso:0,brow:0,squint:0,cheek:0});

/** Stateless, seek-safe, per-avatar accents. V405 word validity is authoritative. */
export function rapPerformanceAccentsV406(cue: RapArticulationCueV405 | null | undefined,
 context: RapPerformanceContextV406) {
  if (!cue || !context.playing || context.reducedMotion || context.enabled===false ||
      cue.confidence!=="word" || cue.vocal.style!=="rap" || !cue.articulationV405.active ||
      cue.articulationV405.source!=="estimated-word" ||
      !Number.isFinite(cue.effectiveTimeMs)) return ZERO;
  // Backing avatars in the existing role model, including manually excluded
  // singers, must not receive fake vocal expression.
  const role = cue.qualityV374.role;
  if (role==="backing") return ZERO;
  const roleMix = role==="ensemble" ? .72 : 1;
  const expression = unit((context.strength??55)/100);
  const clarity = unit(cue.articulationV405.intensity);
  const focus = unit(cue.focus);
  const energy = unit(context.energy??0);
  const drive = unit((.62*clarity+.38*focus)*expression*roleMix*(.82+.18*energy));
  if (drive<=0) return ZERO;
  // Small, physically plausible gestures, subordinate to choreography.
  return {active:true,drive,head:-.055*drive,shoulder:.105*drive,torso:-.045*drive,
    brow:.11*drive,squint:.080*drive,cheek:.060*drive};
}

/** Add to the existing V371/V393 body cue; V371 handles animation smoothing.
 * Never reset authored bones, manual choreography, partner movement or eye contact. */
export function composeRapStageV406<T extends VocalStageCueV371>(body:T,
 cue:RapArticulationCueV405,context:RapPerformanceContextV406):T {
  if (context.bodyEnabled===false || context.authoredPriority || body.confidence!=="word" || body.mode!=="rap")return body;
  const a=rapPerformanceAccentsV406(cue,context);
  if(!a.active)return body;
  const emphasis=unit(body.emphasis);
  const gain=emphasis*(context.gestures===false?.26:1);
  const side=Math.abs(Math.trunc(Number.isFinite(context.slot)?context.slot!:0))%2===0?1:-1;
  const shoulder=context.gestures===false?0:a.shoulder*emphasis;
  return {...body,
    headPitch:limit(body.headPitch+a.head*gain,-.18,.18),
    headTilt:limit(body.headTilt+side*.019*a.drive*gain,-.12,.12),
    // Deliberately do not change headYaw / eyeYaw: partner looks remain authoritative.
    chestLean:limit(body.chestLean+a.torso*gain,-.12,.12),
    leftArm:limit(body.leftArm-shoulder*(side>0?1:.30),-.25,.25),
    rightArm:limit(body.rightArm+shoulder*(side<0?1:.30),-.25,.25),
  };
}

/** Facial micro-expression with NO modifications to jaw, lips, wide or round.
 * This preserves V384 bilabial closure, V405 vowels, and authored morph targets. */
export function composeRapFaceV406<T extends {brow:number;squint:number;cheek:number}>(face:T,
 cue:RapArticulationCueV405|null|undefined,context:RapPerformanceContextV406):T {
  const a=rapPerformanceAccentsV406(cue,context);
  if(!a.active)return face;
  return {...face,
    brow:unit(face.brow+a.brow),
    squint:unit(face.squint+a.squint),
    cheek:unit(face.cheek+a.cheek),
  };
}
