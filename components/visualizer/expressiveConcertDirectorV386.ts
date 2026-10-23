import type {DuetInteractionV376} from "./interactiveVocalDuetsV376";
import type {VocalCueV385} from "./manualVocalCastingV385";
import type {StageSection} from "./stageDirectorV287";

/** Visual stage roles; no diarization or automatic singer identification. */
export type ConcertDirectionModeV386="off"|"subtle"|"expressive";
export type ConcertMomentV386="none"|"verse"|"response"|"handoff"|"hook";
export type ConcertCueV386={active:boolean;moment:ConcertMomentV386;leadSlot:number;
 supportSlots:number[];singingSlots:number[];count:number;partnerSlot:number|null;
 emphasis:number;envelope:number;camera:"none"|"lead"|"two-shot"|"group";
 source:"manual"|"duet"|"none"};
export const clampConcertV386=(v:number,min=0,max=1)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
const neutral=(count:number):ConcertCueV386=>({active:false,moment:"none",leadSlot:0,
 supportSlots:[],singingSlots:[],count,partnerSlot:null,emphasis:0,envelope:0,camera:"none",source:"none"});
/** Pure, seek-safe performance planner driven by existing lyric and casting cues. */
export function resolveConcertCueV386({mode="off",strength=65,playing,reducedMotion=false,count,
 manualPriority=false,manual,duet,section="verse",beat=0}:{mode?:ConcertDirectionModeV386;
 strength?:number;playing:boolean;reducedMotion?:boolean;count:number;manualPriority?:boolean;
 manual?:VocalCueV385|null;duet?:DuetInteractionV376|null;section?:StageSection;beat?:number}):ConcertCueV386{
 const n=Math.trunc(clampConcertV386(count,1,4));const empty=neutral(n);
 if(mode==="off"||!playing||reducedMotion||manualPriority||n<2)return empty;
 const authored=!!manual?.active&&manual.count===n;
 const automatic=!authored&&!!duet?.enabled&&duet.count===n&&duet.source!=="none"&&duet.lineIndex>=0;
 if(!authored&&!automatic)return empty;
 const lead=authored?manual!.leadSlot:duet!.leadSlot;
 if(!Number.isInteger(lead)||lead<0||lead>=n)return empty;
 const singing=authored?[...manual!.singingSlots]:[lead];
 const support=Array.from({length:n},(_,i)=>i).filter(i=>!singing.includes(i));
 const partner=authored?manual!.handoffFrom:duet!.fromSlot;
 const handoff=authored?manual!.handoffFrom!==null:duet!.event!=="none"&&duet!.fromSlot!==null;
 const hook=authored?manual!.role==="hook":section==="hook"||section==="drop";
 const moment:ConcertMomentV386=hook?"hook":handoff?"handoff":authored&&manual!.role==="feature"?"response":"verse";
 const phase=clampConcertV386(authored?manual!.phase:duet!.phase);
 const envelope=handoff?Math.sin(Math.PI*phase):moment==="response"?.52:moment==="hook"?.76:.42;
 const strengthRatio=clampConcertV386(strength/100)*(mode==="subtle"?.48:1);
 const emphasis=clampConcertV386(strengthRatio*envelope*(.88+.12*clampConcertV386(beat)));
 return {active:strengthRatio>0,moment,leadSlot:lead,partnerSlot:partner!==null&&partner>=0&&partner<n?partner:null,
  supportSlots:support,singingSlots:singing,count:n,emphasis,envelope,
  camera:hook?"group":handoff&&partner!==null?"two-shot":"lead",source:authored?"manual":"duet"};
}
/** Small additive reactions: preserve authored animation clips and foot IK. */
export function overlayConcertExpressionV386<T extends {headPitch:number;headYaw:number;headTilt:number;eyeYaw:number;
 chestLean:number;leftArm:number;rightArm:number}>(body:T,cue:ConcertCueV386|null|undefined,slot:number,
 {gestures=true,eyeContact=true,authoredPriority=false}:{gestures?:boolean;eyeContact?:boolean;authoredPriority?:boolean}={}):T{
 if(!cue?.active||authoredPriority||slot<0||slot>=cue.count)return body;
 const singer=cue.singingSlots.includes(slot),backup=cue.supportSlots.includes(slot);
 if(!singer&&!backup)return body;
 const energy=cue.emphasis,sign=cue.leadSlot>slot?1:-1;
 const look=eyeContact?(backup?.09:cue.moment==="handoff"?.06:.018)*sign*energy:0;
 const gesture=gestures?energy*(backup?(cue.moment==="handoff"?.08:.045):(cue.moment==="hook"?.085:.065)):0;
 return {...body,headPitch:clampConcertV386(body.headPitch+(backup?.026:-.012)*energy,-.18,.18),
 headYaw:clampConcertV386(body.headYaw+look,-.19,.19),
 headTilt:clampConcertV386(body.headTilt+(backup?.014:-.009)*energy,-.12,.12),
 eyeYaw:clampConcertV386(body.eyeYaw+look*.65,-.16,.16),
 chestLean:clampConcertV386(body.chestLean+(backup?.014:-.018)*energy,-.12,.12),
 leftArm:clampConcertV386(body.leftArm+(sign<0?gesture:gesture*.25),-.25,.25),
 rightArm:clampConcertV386(body.rightArm+(sign>0?gesture:-gesture*.25),-.25,.25)};
}
/** Bounded lighting gain; saved lighting timelines retain priority. */
export function concertLightAccentV386(cue:ConcertCueV386|null|undefined,authoredLighting=false){
 if(!cue?.active||authoredLighting)return {gain:1,beamGain:1,focusSlot:null as number|null};
 return {gain:1+Math.min(.12,cue.emphasis*.12),beamGain:1+Math.min(.16,cue.emphasis*.16),
  focusSlot:cue.moment==="hook"?null:cue.leadSlot};
}
