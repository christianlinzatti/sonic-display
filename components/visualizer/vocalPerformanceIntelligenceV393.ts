import type {VocalStageCueV371} from './vocalStageExpressionV371';
import type {NaturalArticulationCueV384} from './naturalVocalArticulationV384';

/** V393 is a bounded *visual* body-performance overlay. It does not perform
 * voice separation, phoneme recognition or motion generation from raw Spotify audio.
 * Uses the same lyric clock and word-confidence already driving the face.
 * Deliberately leaves the mouth and the authored animation tracks untouched. */
export type VocalPerformanceModeV393='off'|'subtle'|'expressive';
export type VocalPerformanceSettingsV393={mode?:VocalPerformanceModeV393;strength?:number};
export type VocalPerformanceContextV393={playing:boolean;reducedMotion:boolean;
 authoredPriority?:boolean;bodyEnabled?:boolean;gestures?:boolean;eyeContact?:boolean;
 section?:'verse'|'hook'|'drop'|'build'|'break'|null;slot?:number};
export const DEFAULT_VOCAL_PERFORMANCE_V393:Required<VocalPerformanceSettingsV393>={mode:'off',strength:55};
const bound=(v:number,lo=0,hi=1)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
export function normalizeVocalPerformanceV393(value:VocalPerformanceSettingsV393|null|undefined):Required<VocalPerformanceSettingsV393>{
 const mode=value?.mode==='subtle'||value?.mode==='expressive'?value.mode:'off';
 return {mode,strength:bound(value?.strength??55,0,100)};
}
/** Amplifies timed words as restrained head/shoulder/arm cues; the existing
 * V371 channel smoothing ensures no abrupt pose jumps when the phrase ends.
 * Rap favors alternating, grounded gestures; singing favors open, flowing arms. */
export function composeVocalBodyV393<T extends VocalStageCueV371>(body:T,vocal:NaturalArticulationCueV384,
 settings:VocalPerformanceSettingsV393,context:VocalPerformanceContextV393):T {
 const {mode,strength}=normalizeVocalPerformanceV393(settings);
 if(mode==='off'||strength<=0||!context.playing||context.reducedMotion||context.authoredPriority||context.bodyEnabled===false || vocal.confidence!=='word'||body.confidence!=='word'||body.emphasis<=0)return body;
 // Do not invent emphasized syllables for line-only lyrics or instrumental spans.
 const role=vocal.qualityV374.role;
 const roleGain=role==='backing'?.32:role==='ensemble'?.74:1;
 const amount=bound(strength/100)* (mode==='subtle'?.43:1)*roleGain;
 const emphasis=bound(body.emphasis);
 const jaw=bound(vocal.face.jaw);
 const closed=bound(vocal.face.lipsClosed);
 // Mouth closures must be preserved; nearby head motions become less pronounced.
 const articulation=bound(jaw*(1-closed*.65));
 const phrase=bound(emphasis*(.40+.60*articulation));
 const sectionGain=context.section==='hook'?1.12:context.section==='drop'?1.07:context.section==='break'?.65:1;
 const gain=amount*phrase*sectionGain;
 if(gain<=0)return body;
 const rap=body.mode==='rap'||vocal.vocal.style==='rap';
 // Per-avatar alternating emphasis, rather than all performers raising one arm.
 const side=(context.slot??0)%2===0?1:-1;
 const head=rap?(.048*gain):(.028*gain);
 const shoulder=rap?(.045*gain):(.037*gain);
 const gesture=(context.gestures===false?0:rap?.115*gain:.09*gain);
 const look=context.eyeContact===false?0:side*.026*gain;
 return {...body,
   headPitch:bound(body.headPitch-head,-.18,.18),
   headYaw:bound(body.headYaw+look,-.19,.19),
   headTilt:bound(body.headTilt+side*.014*gain,-.12,.12),
   eyeYaw:bound(body.eyeYaw+look*.7,-.16,.16),
   chestLean:bound(body.chestLean+(rap?-.035:.024)*gain,-.12,.12),
   leftArm:bound(body.leftArm+gesture*(side>0?1:.30),-.25,.25),
   rightArm:bound(body.rightArm-gesture*(side<0?1:.30),-.25,.25),
 };
}
