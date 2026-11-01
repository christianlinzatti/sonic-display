/** V747 – performance-aware finishing camera for the existing R3F StageCameraDirector.
 * Only verified V528 vocal roles or validated V604 song acts are evidence.
 * Never changes authored shots, creates performers, or bypasses V550/V540/V351 framing.
 */
import type {CameraPoseV528 as Pose,ConcertSceneV528 as Scene,ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type PerformanceCameraSettingsV747={enabled:boolean;strength:number;vocalFocus:boolean;groupShots:boolean;transitionMs:number};
export const DEFAULT_PERFORMANCE_CAMERA_V747:PerformanceCameraSettingsV747={enabled:true,strength:60,vocalFocus:true,groupShots:true,transitionMs:1350};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
export function normalizePerformanceCameraV747(value?:Partial<PerformanceCameraSettingsV747>|null):PerformanceCameraSettingsV747{
 const n=(x:unknown,defaultValue:number,lo:number,hi:number)=>finite(x)?clamp(x,lo,hi):defaultValue;
 return {enabled:typeof value?.enabled==='boolean'?value.enabled:DEFAULT_PERFORMANCE_CAMERA_V747.enabled,
  strength:n(value?.strength,60,0,100),vocalFocus:typeof value?.vocalFocus==='boolean'?value.vocalFocus:true,
  groupShots:typeof value?.groupShots==='boolean'?value.groupShots:true,
  transitionMs:n(value?.transitionMs,1350,450,2500)};
}
export type PerformanceShotV747='off'|'vocal-portrait'|'vocal-handoff'|'hook-ensemble'|'drop-wide'|'build-rise'|'verse-stage'|'break-rest';
export type PerformanceCameraStateV747={trackId:string;lastMs:number;sinceMs:number;shot:PerformanceShotV747;leadSlot:number;serial:number};
export type PerformanceCameraCueV747={active:boolean;shot:PerformanceShotV747;leadSlot:number;strength:number;cameraRate:number;serial:number;source:'verified-singer'|'verified-section'|'off'};
export type PerformanceCameraOptionsV747={trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 automatic:boolean;authored:boolean;quality:'low'|'balanced'|'high';aspect:number;
 lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;faceY?:number|null;settings?:Partial<PerformanceCameraSettingsV747>|null};
export const initialPerformanceCameraStateV747=():PerformanceCameraStateV747=>({trackId:'',lastMs:-1,sinceMs:0,shot:'off',leadSlot:-1,serial:0});
const offCue:PerformanceCameraCueV747={active:false,shot:'off',leadSlot:-1,strength:0,cameraRate:1,serial:0,source:'off'};
const anchorOK=(a:Anchor)=>a.visible&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<4&&
 [a.x,a.y,a.z].every(n=>finite(n)&&Math.abs(n)<40);
const anchorsOK=(anchors:readonly Anchor[])=>Array.isArray(anchors)&&anchors.length>0&&anchors.length<=4&&
 anchors.every(anchorOK)&&new Set(anchors.map(a=>a.slot)).size===anchors.length;
const poseOK=(p:Pose)=>[p.x,p.y,p.z,p.targetX??0,p.targetY,p.targetZ??0,p.fov].every(finite)&&p.fov>=28&&p.fov<=76;
const validScene=(scene:Scene|null|undefined,anchors:readonly Anchor[],trackId:string,ms:number)=>!!scene?.active&&
 scene.trackId===trackId&&scene.count===anchors.length&&scene.cueStartMs<=ms&&ms<scene.cueEndMs&&
 finite(scene.cueStartMs)&&finite(scene.cueEndMs)&&scene.cueEndMs>scene.cueStartMs&&
 Number.isInteger(scene.leadSlot)&&anchors.some(a=>a.slot===scene.leadSlot)&&
 Array.isArray(scene.singingSlots)&&scene.singingSlots.length>0&&scene.singingSlots.includes(scene.leadSlot)&&
 scene.singingSlots.every(slot=>anchors.some(a=>a.slot===slot))&&
 finite(scene.strength)&&scene.strength>0&&scene.strength<=1;
const validAct=(plan:NarrativePlanV604|null|undefined,cue:NarrativeCueV604|null|undefined,
 trackId:string,ms:number)=>{
 if(plan?.source!=='verified-v600'||plan.trackId!==trackId||cue?.source!=='verified-v600'||!cue.active||
   !Number.isInteger(cue.act)||cue.act<0||cue.act>=plan.acts.length)return null;
 const act=plan.acts[cue.act];
 return act&&finite(act.startMs)&&finite(act.endMs)&&act.startMs<=ms&&ms<act.endMs&&
  act.startMs>=0&&act.endMs>act.startMs&&act.endMs<=plan.durationMs&&
  ['verse','hook','drop','build','break'].includes(act.section)?act:null;
};
/** State is per mounted camera, reset on pause, seek, track change or loss of authority.
 * Changes are held for a minimum dwell time; frame-to-frame signals never hard-cut.
 */
export function advancePerformanceCameraV747(state:PerformanceCameraStateV747,
 scene:Scene|null|undefined,plan:NarrativePlanV604|null|undefined,cue:NarrativeCueV604|null|undefined,
 anchors:readonly Anchor[],o:PerformanceCameraOptionsV747):{state:PerformanceCameraStateV747;cue:PerformanceCameraCueV747}{
 const settings=normalizePerformanceCameraV747(o.settings);
 const idle={state:initialPerformanceCameraStateV747(),cue:offCue};
 if(!settings.enabled||settings.strength<=0||!settings.groupShots&&!settings.vocalFocus||
  !o.automatic||o.authored||!o.playing||o.reducedMotion||o.quality==='low'||
  !o.trackId?.trim()||!finite(o.progressMs)||o.progressMs<0||
  !finite(o.aspect)||o.aspect<.55||o.aspect>3.5||!anchorsOK(anchors))return idle;
 const ms=o.progressMs;
 const singer=validScene(scene,anchors,o.trackId,ms);
 const act=validAct(plan,cue,o.trackId,ms);
 let shot:PerformanceShotV747='off';let leadSlot=-1;let source:PerformanceCameraCueV747['source']='off';
 // Explicit singer identity always wins a solo/duet close-up. An ensemble hook
 // or a validated drop remains wide for the *entire* cast, not just the lead.
 if(settings.groupShots&&act?.section==='drop'){shot='drop-wide';source='verified-section';}
 else if(settings.groupShots&&act?.section==='hook'){shot='hook-ensemble';source='verified-section';}
 else if(settings.vocalFocus&&singer&&scene){
   shot=scene.focus==='handoff'&&scene.handoffFrom!==null&&scene.handoffFrom!==scene.leadSlot&&
    anchors.some(a=>a.slot===scene.handoffFrom)?'vocal-handoff':'vocal-portrait';
   leadSlot=scene.leadSlot;source='verified-singer';
 }else if(settings.groupShots&&act){
  shot=act.section==='build'?'build-rise':act.section==='break'?'break-rest':'verse-stage';
  source='verified-section';
 }
 if(shot==='off')return idle;
 const reset=state.trackId!==o.trackId||ms<state.lastMs-180||state.lastMs<0||ms-state.lastMs>12000;
 const previous=reset?initialPerformanceCameraStateV747():state;
 const changed=shot!==previous.shot||leadSlot!==previous.leadSlot;
 // Higher-energy verified chapter changes can be picked up after 2 s; routine
 // portrait/verse shifts hold longer. Never reset on every render frame.
 const hold=shot==='vocal-handoff'?1900:shot==='hook-ensemble'||shot==='drop-wide'?2300:4800;
 const lostEvidence=previous.shot.startsWith('vocal-')&&!singer||
  previous.shot!=='off'&&!previous.shot.startsWith('vocal-')&&!act;
 const accept=previous.shot==='off'||lostEvidence||changed&&ms-previous.sinceMs>=hold;
 const next:PerformanceCameraStateV747=accept?{trackId:o.trackId,lastMs:ms,sinceMs:ms,shot,leadSlot,serial:previous.serial+1}:
  {...previous,trackId:o.trackId,lastMs:ms};
 const gain=smooth((ms-next.sinceMs)/settings.transitionMs)*settings.strength/100*
  (o.quality==='balanced'?.64:1)*(o.lyricsProtected?.36:1);
 return {state:next,cue:{active:true,shot:next.shot,leadSlot:next.leadSlot,
  strength:clamp(gain,0,1),cameraRate:next.shot==='vocal-portrait'?.82:.76,
  serial:next.serial,source:next.shot.startsWith('vocal-')?'verified-singer':'verified-section'}};
}
/** Candidate camera adjustment. Screening must NEVER accept a worse full-cast
 * crop, head/feet crop or side-lyrics overlap than the incoming composition.
 */
export function composePerformanceCameraV747(pose:Pose,cue:PerformanceCameraCueV747,
 anchors:readonly Anchor[],o:Pick<PerformanceCameraOptionsV747,'aspect'|'lyricsProtected'|'lyricsSide'|'faceY'>):Pose{
 if(!cue.active||cue.shot==='off'||cue.strength<=.001||!finite(cue.strength)||cue.strength>1||
  !poseOK(pose)||!anchorsOK(anchors)||!finite(o.aspect)||o.aspect<.55||o.aspect>3.5)return pose;
 const side=o.lyricsProtected?o.lyricsSide??null:null;
 const faceY=finite(o.faceY)?clamp(o.faceY,1.1,2.4):1.55;
 const before=measureConcertFrameV550(pose,anchors,o.aspect,side,o.lyricsProtected,faceY);
 const screen=measureScreenFrameV540(pose,anchors,o.aspect,side);
 if(!before||!screen)return pose;
 const tx=pose.targetX??0,ty=pose.targetY,tz=pose.targetZ??0;
 const dx=pose.x-tx,dy=pose.y-ty,dz=pose.z-tz;
 if(dz<.5||Math.hypot(dx,dy,dz)<.5)return pose;
 const lead=cue.leadSlot>=0?anchors.find(a=>a.slot===cue.leadSlot):undefined;
 if(cue.shot.startsWith('vocal-')&&!lead)return pose;
 let pan=0,widen=0,lift=0,lens=0;
 switch(cue.shot){
  case 'vocal-portrait':pan=lead?clamp((lead.x-tx)*.14,-.20,.20):0;widen=-.025;lens=-.5;break;
  case 'vocal-handoff':pan=lead?clamp((lead.x-tx)*.1,-.14,.14):0;widen=.008;lens=.18;break;
  case 'hook-ensemble':widen=.032;lens=.55;break;
  case 'drop-wide':widen=.045;lift=.075;lens=.7;break;
  case 'build-rise':widen=.018;lift=.12;lens=.3;break;
  case 'verse-stage':widen=-.007;lens=-.12;break;
  case 'break-rest':widen=.024;lens=.3;break;
  default:return pose;
 }
 if(o.lyricsProtected)pan=0;
 // Try progressively more conservative candidates; no extra camera passes.
 for(const share of [1,.55,.25]){
  const gain=cue.strength*share;
  const targetX=tx+pan*gain,targetY=ty+lift*gain;
  const scale=1+widen*gain;
  const result:Pose={...pose,targetX,targetY,x:targetX+dx*scale,
   y:targetY+dy*scale,z:tz+dz*scale,fov:clamp(pose.fov+lens*gain,28,76)};
  if(!poseOK(result))continue;
  const after=measureConcertFrameV550(result,anchors,o.aspect,side,o.lyricsProtected,faceY);
  const afterScreen=measureScreenFrameV540(result,anchors,o.aspect,side);
  if(after&&afterScreen&&after.overflow<=before.overflow+1e-6&&
    after.headOverflow<=before.headOverflow+1e-6&&
    after.fullBodyOverflow<=before.fullBodyOverflow+1e-6&&
    afterScreen.overflow<=screen.overflow+1e-6)return result;
 }
 return pose;
}
