import type {Lyrics} from "@/types/music";
import type {CameraAnchorV377,DuetCameraPlanV377} from "./cinematicDuetCameraV377";
import type {CameraPose} from "./stageCameraPoseHelpersV289";
import {composeCinematicDuetCameraV377} from "./cinematicDuetCameraV377";
import type {DuetInteractionV376} from "./interactiveVocalDuetsV376";
import type {VocalCueV385} from "./manualVocalCastingV385";
import type {CameraStudioProfileV398} from "./cameraPerformanceStudioV398";

/** V397: visual-stage editor, NOT an audio source separation/speaker identifier. */
export type VisualDirectorModeV397="off"|"subtle"|"cinematic";
export type VisualShotV397="none"|"lead"|"two-shot"|"group";
export type VisualPlanV397={active:boolean;shot:VisualShotV397;leadSlot:number;partnerSlot:number|null;
 strength:number;count:number;reason:"none"|"verse"|"handoff"|"chorus";
 source:"none"|"section"|"timed-lyrics"|"manual-stage-cast"};
export type VisualDirectorStateV397={trackId:string;lastMs:number;shot:VisualShotV397;
 leadSlot:number;heldUntilMs:number;section:string;candidate:string;candidateSince:number};
export type VisualDirectorInputV397={trackId?:string|null;progressMs:number;playing:boolean;reducedMotion:boolean;
 mode?:VisualDirectorModeV397;strength?:number;count:number;section?:string|null;
 lyrics?:Lyrics|null;lyricsEnabled?:boolean;duet?:DuetInteractionV376|null;manual?:VocalCueV385|null;
 manualCamera?:boolean;authoredStage?:boolean;existingCamera?:boolean;performanceTier?:"low"|"balanced"|"high";studioV398?:CameraStudioProfileV398};
const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;
const none=(count:number):VisualPlanV397=>({active:false,shot:"none",leadSlot:0,partnerSlot:null,
 strength:0,count,reason:"none",source:"none"});
export const initialVisualDirectorV397=():VisualDirectorStateV397=>({trackId:"",lastMs:-1,shot:"none",
 leadSlot:0,heldUntilMs:0,section:"verse",candidate:"verse",candidateSince:0});
/** Validate that the current line has a *real* start time, text and a bounded duration. */
export function timedLineV397(lyrics:Lyrics|null|undefined,ms:number):number{
 if(!lyrics?.synced||!lyrics.lines?.length||!Number.isFinite(ms)||ms<0)return -1;
 let found=-1;
 for(let i=0;i<lyrics.lines.length;i++){
  const line=lyrics.lines[i];
  if(!Number.isFinite(line.startMs)||line.startMs<0)continue;
  if(line.startMs<=ms)found=i;else break;
 }
 if(found<0)return -1;
 const line=lyrics.lines[found], next=lyrics.lines[found+1]?.startMs??Infinity;
 const end=Math.min(line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,
  next,line.startMs+12000);
 return line.text?.trim()&&ms<end?found:-1;
}
/** Stateful shot editing with dwell time, bounded holds and seek/track resets. */
export function advanceVisualDirectorV397(state:VisualDirectorStateV397,input:VisualDirectorInputV397):VisualPlanV397{
 const count=Math.floor(clamp(input.count,1,4));
 const time=input.progressMs,track=input.trackId??"";
 const reset=track!==state.trackId||state.lastMs<0||!Number.isFinite(time)||time<state.lastMs-200||time-state.lastMs>6000;
 const requested=input.section==="hook"||input.section==="drop"||input.section==="build"||input.section==="break"?input.section:"verse";
 if(reset){state.shot="none";state.leadSlot=0;state.heldUntilMs=0;state.section=requested;
  state.candidate=requested;state.candidateSince=time;}
 else if(requested!==state.candidate){state.candidate=requested;state.candidateSince=time;}
 else if(state.section!==requested&&time-state.candidateSince>=280)state.section=requested;
 state.trackId=track;state.lastMs=time;
 const blocked=!track||!input.playing||input.reducedMotion||!Number.isFinite(time)||time<0||
  !input.mode||input.mode==="off"||!Number.isFinite(input.strength??60)||(input.strength??60)<=0||
  input.manualCamera||input.authoredStage||input.existingCamera;
 if(blocked){state.shot="none";state.heldUntilMs=0;return none(count);}
 const intensity=clamp((input.strength??60)/100,0,1)*(input.mode==="subtle"?.55:1)*
  (input.performanceTier==="low"?.48:input.performanceTier==="balanced"?.75:1);
 if(intensity<=0)return none(count);
 const section=state.section;
 const line=input.lyricsEnabled?timedLineV397(input.lyrics,time):-1;
 const manual=input.manual?.active&&input.manual.count===count&&input.manual.lineIndex===line?input.manual:null;
 const duet=input.duet?.enabled&&input.duet.count===count&&input.duet.lineIndex===line?input.duet:null;
 let shot:VisualShotV397="none",leadSlot=0,partnerSlot:number|null=null;
 let reason:VisualPlanV397["reason"]="none",source:VisualPlanV397["source"]="none";
 if(count>1&&(section==="hook"||section==="drop")){
  shot="group";reason="chorus";source="section";
 }else if(line>=0){
  leadSlot=manual?manual.leadSlot:duet?duet.leadSlot:0;
  if(leadSlot<0||leadSlot>=count)leadSlot=0;
  const previous=manual?.handoffFrom??duet?.fromSlot??null;
  partnerSlot=previous!==null&&previous!==leadSlot&&previous>=0&&previous<count?previous:null;
  shot=partnerSlot!==null?"two-shot":"lead";
  reason=partnerSlot!==null?"handoff":"verse";
  source=manual?"manual-stage-cast":"timed-lyrics";
 }
 if(shot==="none"){state.shot="none";state.heldUntilMs=0;return none(count);}
 // Avoid rapid alternating close-ups; a new chorus/group view or real hand-off may interrupt.
 if(!reset&&shot==="lead"&&state.shot==="lead"&&leadSlot!==state.leadSlot&&time<state.heldUntilMs)
  leadSlot=state.leadSlot;
 if(!reset&&shot==="lead"&&state.shot==="group"&&time<state.heldUntilMs)return {
  active:true,shot:"group",leadSlot:0,partnerSlot:null,strength:intensity,count,reason:"chorus",source:"section"};
 if(shot!==state.shot||leadSlot!==state.leadSlot){
  const customHold=input.studioV398?.enabled?(Number.isFinite(input.studioV398.holdMs)?clamp(input.studioV398.holdMs,450,2400):1150):null;
  state.heldUntilMs=time+(customHold??(shot==="group"?550:shot==="two-shot"?450:1150));
  state.shot=shot;state.leadSlot=leadSlot;}
 return {active:true,shot,leadSlot,partnerSlot,strength:intensity,count,reason,source};
}
/** Uses V377's already tested, existing-camera composition and visible character anchors. */
export function composeVisualPerformanceV397(pose:CameraPose,plan:VisualPlanV397,
 anchors:readonly CameraAnchorV377[],lyricsProtected:boolean,faceY:number|null):CameraPose{
 if(!plan.active||plan.shot==="none")return pose;
 const visible=anchors.filter(a=>a.visible&&Number.isFinite(a.x)&&Number.isFinite(a.z)&&a.slot>=0&&a.slot<plan.count);
 if(plan.shot==="lead"&&!visible.some(a=>a.slot===plan.leadSlot))return pose;
 if(plan.shot==="two-shot"&&(!visible.some(a=>a.slot===plan.leadSlot)||!visible.some(a=>a.slot===plan.partnerSlot)))return pose;
 if(plan.shot==="group"&&visible.length<2)return pose;
 const duet:DuetCameraPlanV377={active:true,shot:plan.shot,leadSlot:plan.leadSlot,partnerSlot:plan.partnerSlot,
  strength:plan.strength,count:plan.count,reason:plan.reason==="chorus"?"hook":plan.reason==="handoff"?"handoff":"verse",
  source:plan.source==="none"||plan.source==="section"?"none":"line-timed"};
 return composeCinematicDuetCameraV377(pose,duet,visible,{lyricsProtected,faceY});
}
