/** V746 Vocal Performance 2.0 – word-evidence-driven *additive body* accents.
 * This deliberately does not infer which recorded voice belongs to a GLB;
 * a solo performer or an explicit, track-matching singer cue is required.
 * No mouth/face, mixer actions, root/pelvis, IK or V745 dance timings are touched.
 */
/** Structural mirror of the existing V371 cue, kept dependency-free so the
 * director can be validated without loading the entire render dependency graph. */
export type VocalStageCueV746={
  headPitch:number;headYaw:number;headTilt:number;eyeYaw:number;
  chestLean:number;leftArm:number;rightArm:number;
  confidence:'none'|'line'|'word';mode:'silent'|'rap'|'singing'|'line';emphasis:number;
};
export type VocalEvidenceV746={
  confidence:'none'|'line'|'word';style:'silent'|'line'|'rap'|'singing';
  jaw:number;headAccent:number;
};

export type VocalPerformanceSettingsV746={enabled:boolean;strength:number;head:number;gestures:number;rapEmphasis:number};
export const DEFAULT_VOCAL_PERFORMANCE_V746:Readonly<VocalPerformanceSettingsV746>={
  enabled:true,strength:65,head:65,gestures:60,rapEmphasis:75};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
export function normalizeVocalPerformanceV746(raw:Partial<VocalPerformanceSettingsV746>|null|undefined):VocalPerformanceSettingsV746{
  const percent=(n:unknown,defaultValue:number)=>finite(n)?Math.round(clamp(n,0,100)):defaultValue;
  return {enabled:raw?.enabled===undefined?true:raw.enabled===true,
    strength:percent(raw?.strength,65),head:percent(raw?.head,65),
    gestures:percent(raw?.gestures,60),rapEmphasis:percent(raw?.rapEmphasis,75)};
}
export type VocalRoleV746='singer'|'backing'|'unassigned';
/** Only an explicit track-matching cue may assign a singer in multi-avatar mode.
 * The V745 dance lead is NOT a singer assignment. */
export function resolveVocalRoleV746(input:{slot:number;count:number;trackId?:string|null;
  cueTrackIds?:readonly (string|null|undefined)[];assignedSlots?:readonly number[]|null;
  authoredCueActive?:boolean;timedCueActive?:boolean}):VocalRoleV746{
  const count=finite(input.count)?Math.round(clamp(input.count,1,4)):1;
  const slot=finite(input.slot)?Math.round(input.slot):-1;
  if(slot<0||slot>=count)return 'unassigned';
  if(count===1)return 'singer';
  const sameTrack=!!input.trackId&&input.cueTrackIds?.some(t=>!!t&&t===input.trackId)===true;
  if(!sameTrack)return 'unassigned';
  if(input.authoredCueActive&&Array.isArray(input.assignedSlots))
    return input.assignedSlots.includes(slot)?'singer':'backing';
  // V496's resolved per-slot vocal segment is checked in the existing lip pipeline.
  if(input.timedCueActive)return 'singer';
  return 'unassigned';
}
export type VocalInputV746={settings?:Partial<VocalPerformanceSettingsV746>|null;
  body:VocalStageCueV746;vocal:VocalEvidenceV746;
  role:VocalRoleV746;playing:boolean;reducedMotion:boolean;manualBodyPriority:boolean;
  bodyEnabled:boolean;gesturesEnabled:boolean;genre?:string|null;focus?:number;
  section?:string|null};
export type VocalOutputV746={active:boolean;role:VocalRoleV746;body:VocalStageCueV746;intensity:number};
/** Stateless, seek-safe and FPS-independent. The existing V371 overlay performs
 * the final temporal smoothing. Inactive states preserve the exact body cue. */
export function directVocalPerformanceV746(input:VocalInputV746):VocalOutputV746{
  const settings=normalizeVocalPerformanceV746(input.settings);
  const inactive=():VocalOutputV746=>({active:false,role:input.role,body:input.body,intensity:0});
  if(!settings.enabled||settings.strength<=0||!input.playing||input.reducedMotion||
    input.manualBodyPriority||!input.bodyEnabled||input.role!=='singer'||
    input.vocal.confidence!=='word'||input.vocal.style==='silent'||input.vocal.style==='line')return inactive();
  const jaw=finite(input.vocal.jaw)?clamp(input.vocal.jaw,0,1):0;
  const focus=finite(input.focus)?clamp(input.focus,0,1):0;
  const accent=finite(input.vocal.headAccent)?clamp(input.vocal.headAccent,0,1):0;
  const presence=clamp(jaw*.65+focus*.35,0,1);
  if(presence<=.0001)return inactive();
  const rap=input.vocal.style==='rap'||/rap|hip.?hop|drill|trap/i.test(input.genre??'');
  const sectionGain=input.section==='hook'||input.section==='drop'?1.12:input.section==='intro'||input.section==='outro'?.75:1;
  const rapGain=rap?(.8+.4*settings.rapEmphasis/100):.85;
  const intensity=clamp(presence*settings.strength/100*sectionGain*rapGain,0,1);
  const headGain=settings.head/100;
  const gestureGain=input.gesturesEnabled?settings.gestures/100:0;
  const side=(Math.round(clamp(accent*7,0,7))%2===0)?1:-1;
  // Each channel is clamped to the existing V371 limits. These are *total*
  // outputs, so we never bypass the established overlay and its IK ordering.
  const body:VocalStageCueV746={...input.body,
    headPitch:clamp(input.body.headPitch-(rap?.048:.026)*intensity*headGain,-.18,.18),
    headYaw:clamp(input.body.headYaw+side*(rap?.013:.009)*intensity*headGain,-.20,.20),
    headTilt:clamp(input.body.headTilt-side*.012*intensity*headGain,-.16,.16),
    chestLean:clamp(input.body.chestLean+(rap?-.030:.020)*intensity*gestureGain,-.15,.15),
    leftArm:clamp(input.body.leftArm-.060*intensity*gestureGain,-.20,.20),
    rightArm:clamp(input.body.rightArm+.060*intensity*gestureGain,-.20,.20),
  };
  return {active:true,role:input.role,body,intensity};
}
