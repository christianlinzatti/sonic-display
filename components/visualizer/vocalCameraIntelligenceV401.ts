import type {Lyrics} from "@/types/music";
import type {CameraPose} from "./stageCameraPoseHelpersV289";
import type {CameraAnchorV377} from "./cinematicDuetCameraV377";
import type {VocalCueV385} from "./manualVocalCastingV385";
import type {DuetInteractionV376} from "./interactiveVocalDuetsV376";
import type {VisualPlanV397} from "./visualPerformanceDirectorV397";
import {timedLineV397,composeVisualPerformanceV397} from "./visualPerformanceDirectorV397";
import {resolveVocalPerformanceV368,type VocalStyleV368} from "./vocalPerformanceV368";

/** V401 reuses the *estimated* V368 mouth/word cues, not isolated vocals or speaker recognition. */
export type VocalCameraModeV401="off"|"subtle"|"musicvideo";
export type VocalCameraOptionsV401={mode?:VocalCameraModeV401;strength?:number};
export type VocalCameraStateV401={trackId:string;lastMs:number;wordKey:string;heldUntilMs:number;leadSlot:number};
export type VocalCameraPlanV401={active:boolean;shot:"lead"|"two-shot";leadSlot:number;partnerSlot:number|null;accent:number;source:"timed-word"|"manual-handoff"};
export type VocalCameraInputV401={trackId?:string|null;progressMs:number;playing:boolean;reducedMotion:boolean;lyrics?:Lyrics|null;
 lyricsEnabled:boolean;count:number;style?:VocalStyleV368;genre?:string|null;section?:string|null;
 manual?:VocalCueV385|null;duet?:DuetInteractionV376|null;authoredPriority?:boolean;existingShot?:boolean;
 performanceTier?:"low"|"balanced"|"high";settings?:VocalCameraOptionsV401};
const bound=(n:unknown,lo:number,hi:number,fallback:number)=>typeof n==="number"&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;
export const initialVocalCameraStateV401=():VocalCameraStateV401=>({trackId:"",lastMs:-1,wordKey:"",heldUntilMs:0,leadSlot:0});
export const normalizeVocalCameraV401=(raw:VocalCameraOptionsV401|null|undefined):Required<VocalCameraOptionsV401>=>({
 mode:raw?.mode==="subtle"||raw?.mode==="musicvideo"?raw.mode:"off",
 strength:Math.round(bound(raw?.strength,0,100,55))
});
const inactive=():VocalCameraPlanV401=>({active:false,shot:"lead",leadSlot:0,partnerSlot:null,accent:0,source:"timed-word"});
/** Very small, deterministic cinematic accents. Only word-timed lyrics can activate it. */
export function advanceVocalCameraV401(state:VocalCameraStateV401,input:VocalCameraInputV401):VocalCameraPlanV401{
 const ms=input.progressMs,track=input.trackId??"";
 const reset=track!==state.trackId||state.lastMs<0||!Number.isFinite(ms)||ms<state.lastMs-180||ms-state.lastMs>5000;
 if(reset){state.wordKey="";state.heldUntilMs=0;state.leadSlot=0;}
 state.trackId=track;state.lastMs=ms;
 const settings=normalizeVocalCameraV401(input.settings);
 if(!track||!input.playing||input.reducedMotion||!input.lyricsEnabled||!Number.isFinite(ms)||ms<0||settings.mode==="off"||settings.strength<=0||input.authoredPriority||input.existingShot){
  state.wordKey="";state.heldUntilMs=0;return inactive();
 }
 const count=Math.trunc(bound(input.count,1,4,1));
 const line=timedLineV397(input.lyrics,ms);
 if(line<0||!input.lyrics?.lines[line]?.words?.length)return inactive();
 const vocal=resolveVocalPerformanceV368(input.lyrics,ms,true,{style:input.style??"auto",genre:input.genre,expression:.65});
 if(vocal.confidence!=="word"||!vocal.activeWord)return inactive();
 // V385 stage assignments and V376 interaction are *authored* or explicit role hints,
 // not estimates of the real speaker's identity. Without them, stage slot 0 is used.
 const manual=input.manual?.active&&input.manual.lineIndex===line&&input.manual.count===count?input.manual:null;
 const duet=input.duet?.enabled&&input.duet.lineIndex===line&&input.duet.count===count?input.duet:null;
 let lead=manual?.leadSlot??duet?.leadSlot??0;
 if(!Number.isInteger(lead)||lead<0||lead>=count)lead=0;
 const from=manual?.handoffFrom??duet?.fromSlot??null;
 const partner=from!=null&&Number.isInteger(from)&&from>=0&&from<count&&from!==lead?from:null;
 // The current word timestamp, not a guessed syllable location, defines the accent.
 const words=input.lyrics.lines[line].words??[];
 let current:typeof words[number]|undefined;
 for(const candidate of words){
  if(Number.isFinite(candidate.startMs)&&candidate.startMs<=ms&&(!current||candidate.startMs>=current.startMs))current=candidate;
 }
 if(!current?.text?.trim()||!Number.isFinite(current.startMs))return inactive();
 const wordKey=`${line}:${current.startMs}:${current.text}`;
 if(wordKey!==state.wordKey){
  if(!reset&&lead!==state.leadSlot&&ms<state.heldUntilMs&&partner===null)lead=state.leadSlot;
  state.wordKey=wordKey;state.heldUntilMs=ms+(partner!==null?480:720);state.leadSlot=lead;
 }
 // V368's jaw/head/brow estimate couples framing to the same facial performance.
 // Small movement, softer during consonant closure and for singing.
 const onset=bound((ms-current.startMs)/210,0,1,1);
 const envelope=Math.sin(Math.PI*onset*.5);
 const articulation=bound(vocal.jaw*(1-.7*vocal.lipsClosed)+vocal.headAccent*.7+vocal.brow*.16,0,1,0);
 const phraseGain=vocal.style==="rap"?1:.55;
 const modeGain=settings.mode==="subtle"?.42:1;
 const tierGain=input.performanceTier==="low"?.42:input.performanceTier==="balanced"?.74:1;
 const accent=bound(articulation*envelope*phraseGain*modeGain*tierGain*settings.strength/100,0,.8,0);
 if(accent<=.008)return inactive();
 // Group views on hooks/drops belong to existing V397/V394, not a forced vocal close-up.
 if((input.section==="hook"||input.section==="drop")&&!manual?.active)return inactive();
 return {active:true,shot:partner!==null?"two-shot":"lead",leadSlot:lead,partnerSlot:partner,accent,source:partner!==null?"manual-handoff":"timed-word"};
}
/** Uses existing stage anchors. Never creates a model or obscures lyrics with a full-frame zoom. */
export function composeVocalCameraV401(pose:CameraPose,plan:VocalCameraPlanV401,
 anchors:readonly CameraAnchorV377[],lyricsProtected:boolean,faceY:number|null,
 existingV397?:VisualPlanV397):CameraPose{
 if(!plan.active||plan.accent<=0)return pose;
 const visible=anchors.filter(a=>a.visible&&Number.isFinite(a.x)&&Number.isFinite(a.z));
 if(!visible.some(a=>a.slot===plan.leadSlot)||plan.partnerSlot!==null&&!visible.some(a=>a.slot===plan.partnerSlot))return pose;
 // Existing solo framing may receive a minor performance accent; do not override an existing duet/group.
 if(existingV397?.active&&(existingV397.shot!=="lead"||existingV397.leadSlot!==plan.leadSlot))return pose;
 const planV397:VisualPlanV397={active:true,shot:plan.shot,leadSlot:plan.leadSlot,partnerSlot:plan.partnerSlot,
 strength:Math.min(.65,plan.accent*.72),count:Math.max(1,Math.min(4,Math.max(...anchors.map(a=>a.slot))+1)),
 reason:plan.shot==="two-shot"?"handoff":"verse",source:"timed-lyrics"};
 const framed=existingV397?.active?pose:composeVisualPerformanceV397(pose,planV397,anchors,lyricsProtected,faceY);
 if(framed===pose&&!existingV397?.active)return pose;
 const softness=lyricsProtected?.3:1;
 const zoom=Math.min(.22,plan.accent*.26)*softness;
 return {...framed,z:Math.max(3.2,framed.z-zoom),fov:Math.max(30,framed.fov-zoom*.7)};
}
