import {rapEditorGainV408, type RapPerformanceEditorSettingsV408} from "./rapPerformanceEditorV408";
import type { AudioFeatures } from "@/types/audio";
import type { RapArticulationCueV405 } from "./rapArticulationV405";
import type { RapPerformanceContextV406 } from "./rapStagePerformanceV406";
import { rapPerformanceAccentsV406 } from "./rapStagePerformanceV406";
import type { VocalStageCueV371 } from "./vocalStageExpressionV371";

/** V407: restrained drum-informed rap gestures. No synthetic audio onsets:
 * measured percussion signals require microphone-analysis provenance. */
export type RapRhythmSectionV407 = "verse" | "hook" | "build" | "drop" | "break";
export type RapRhythmContextV407 = RapPerformanceContextV406 & {
  section?: string | null;
  rhythmEnabled?: boolean;
  headGain?: number;        // existing rap groove controls, normalized 0..1
  shoulderGain?: number;
  snareGain?: number;
  editorV408?: RapPerformanceEditorSettingsV408;
};
export type RapRhythmAccentsV407 = {
  active:boolean; section:RapRhythmSectionV407;
  /** Provenance is explicit: word-only accents are NOT audio onset recognition. */
  source:"none"|"word"|"microphone";
  kick:number; snare:number; phrase:number; head:number; chest:number; arm:number;
};
const unit = (v:number):number => Number.isFinite(v) ? Math.min(1,Math.max(0,v)) : 0;
const bounded=(v:number,min:number,max:number):number=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
const silent=(section:RapRhythmSectionV407):RapRhythmAccentsV407=>({active:false,section,source:"none",kick:0,snare:0,phrase:0,head:0,chest:0,arm:0});
const sectionOf=(section?:string|null):RapRhythmSectionV407=>section==="hook"||section==="build"||section==="drop"||section==="break"?section:"verse";

/** Pure calculation: no clock, ref, timer, allocation-heavy analysis or learned
 * singer attribution. Invalid/unsynced lyrics and backing roles stay inactive. */
export function rapRhythmAccentsV407(
  word:RapArticulationCueV405|null|undefined,
  audio:Pick<AudioFeatures,"kick"|"snare"|"attack"|"beatPhase"|"phaseConfidence"|"phaseLocked"|"bpmConfidence"|"kickAccentIntensity">|null|undefined,
  context:RapRhythmContextV407,
):RapRhythmAccentsV407 {
  const section=sectionOf(context.section);
  const base=rapPerformanceAccentsV406(word,context);
  if (!base.active||context.bodyEnabled===false||context.authoredPriority||context.rhythmEnabled===false||
      section==="break"||!word||word.body.confidence!=="word"||word.body.mode!=="rap")return silent(section);
  const emphasis=unit(word.body.emphasis);
  const dynamics=section==="hook"?1.12:section==="drop"?1.00:section==="build"?.75:1;
  // During a verse, lyric emphasis is more important than broad arm gestures;
  // hooks are more open, and breaks should remain calm.
  const phrase=emphasis*base.drive*(section==="hook"?.90:section==="verse"?.33:.43)*rapEditorGainV408(context.editorV408,section==="hook"?"hook":"verse");
  // Microphone capture supplies bpmConfidence/phaseLocked and the onset envelope.
  // Spotify's estimated pulse intentionally supplies neither; never label it a
  // detected kick/snare. Measured onsets can be used even before a stable BPM lock.
  const measured=audio!=null && (Number.isFinite(audio.bpmConfidence) || audio.phaseLocked===true);
  const attack=measured?unit(audio.attack):0;
  const trustedKick=measured&&Number.isFinite(audio.kickAccentIntensity)?unit(audio.kickAccentIntensity!):0;
  const kick=unit(trustedKick*(.78+.22*unit(audio?.kick??0))*rapEditorGainV408(context.editorV408,"kick"));
  // Snare is a spectral-band heuristic, not drum source separation: require
  // a transient rise and attenuate kick-heavy frames to avoid false backbeats.
  const snare=measured?unit(Math.max(0,unit(audio?.snare??0)-.28*unit(audio?.kick??0)))*unit(attack*3.2)*rapEditorGainV408(context.editorV408,"snare"):0;
  const gain=unit((context.strength??55)/100)*dynamics;
  const head=rapEditorGainV408(context.editorV408,"head")*unit(context.headGain??.75)*gain*(.90*snare+.18*kick+.22*phrase);
  const chest=gain*(.90*kick+.16*snare+.18*phrase);
  const arm=context.gestures===false?0:rapEditorGainV408(context.editorV408,"gestures")*unit(context.shoulderGain??.5)*unit(context.snareGain??.7)*gain*
    ((section==="hook"?1.25:section==="verse"?.62:.75)*snare+(section==="hook"?.85:.22)*phrase);
  const active=head>0||chest>0||arm>0;
  return {active,section,source:!active?"none":kick>0||snare>0?"microphone":"word",kick,snare,phrase,head,chest,arm};
}

/** Overlay on V406, never the authored rig: V371 handles smoothing and release.
 * Vocal mouth channels, partner gaze and IK are deliberately unaffected. */
export function composeRapRhythmStageV407<T extends VocalStageCueV371>(
  body:T,word:RapArticulationCueV405|null|undefined,
  audio:Parameters<typeof rapRhythmAccentsV407>[1],context:RapRhythmContextV407,
):T {
  if(body.confidence!=="word"||body.mode!=="rap")return body;
  const a=rapRhythmAccentsV407(word,audio,context);
  if(!a.active)return body;
  const side=Math.abs(Math.trunc(Number.isFinite(context.slot)?context.slot!:0))%2===0?1:-1;
  const head=-.036*a.head;
  const chest=-.047*a.chest;
  const shoulder=.074*a.arm;
  return {...body,
    headPitch:bounded(body.headPitch+head,-.18,.18),
    headTilt:bounded(body.headTilt+side*.012*a.head,-.12,.12),
    chestLean:bounded(body.chestLean+chest,-.12,.12),
    leftArm:bounded(body.leftArm-shoulder*(side>0?1:.26),-.25,.25),
    rightArm:bounded(body.rightArm+shoulder*(side<0?1:.26),-.25,.25),
  };
}
