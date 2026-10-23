import type {CameraPose} from "./stageCameraPoseHelpersV289";
import type {StageSection} from "./stageDirectorV287";
import type {DuetInteractionV376} from "./interactiveVocalDuetsV376";

/** These are VISUAL performers, not verified speakers from source audio. */
export type DuetCameraModeV377="off"|"subtle"|"cinematic";
export type DuetCameraShotV377="none"|"lead"|"two-shot"|"group";
export type DuetCameraPlanV377={active:boolean;shot:DuetCameraShotV377;leadSlot:number;partnerSlot:number|null;
  strength:number;count:number;reason:"verse"|"handoff"|"hook"|"none";source:"line-timed"|"word-timed"|"none"};
export type CameraAnchorV377={slot:number;x:number;y:number;z:number;visible:boolean};
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const empty=(count:number):DuetCameraPlanV377=>({active:false,shot:"none",leadSlot:0,partnerSlot:null,strength:0,count,reason:"none",source:"none"});
/** Word/line timings and stage section are the only drivers; no random cuts or speaker claims. */
export function planCinematicDuetCameraV377({mode="off",strength=60,playing,reducedMotion=false,count,section="verse",duet,manualPriority=false}:{
  mode?:DuetCameraModeV377;strength?:number;playing:boolean;reducedMotion?:boolean;count:number;
  section?:StageSection;duet?:DuetInteractionV376|null;manualPriority?:boolean;
}):DuetCameraPlanV377 {
  const n=Math.trunc(clamp(count,1,4));
  if(mode==="off"||!playing||reducedMotion||manualPriority||n<2||!duet ||
    duet.count!==n)return empty(n);
  const gain=clamp(strength/100,0,1)*(mode==="subtle"?.55:1);
  if(gain<=0)return empty(n);
  // A chorus or drop is always a wide group shot, including gaps between lyric lines.
  if(section==="hook"||section==="drop")return {active:true,shot:"group",leadSlot:duet.leadSlot,
    partnerSlot:duet.partnerSlot,strength:gain,count:n,reason:"hook",source:duet.source};
  if(!duet.enabled||duet.lineIndex<0||duet.source==="none")return empty(n);
  const lead=Math.trunc(clamp(duet.leadSlot,0,n-1));
  const partner=duet.partnerSlot!==null&&duet.partnerSlot!==lead&&duet.partnerSlot>=0&&duet.partnerSlot<n?duet.partnerSlot:null;
  const handoff=duet.event!=="none"&&duet.fromSlot!==null&&partner!==null;
  return {active:true,shot:handoff?"two-shot":"lead",leadSlot:lead,partnerSlot:partner,
    strength:gain,count:n,reason:handoff?"handoff":"verse",source:duet.source};
}
export type DuetCameraHoldV377={lastMs:number;lastShot:DuetCameraShotV377;lastLead:number;untilMs:number};
export const newDuetCameraHoldV377=():DuetCameraHoldV377=>({lastMs:-1,lastShot:"none",lastLead:0,untilMs:0});
/** Prevent sub-second cutting; clear on pause, backward seek or forward scrub. */
export function holdCinematicDuetShotV377(state:DuetCameraHoldV377,plan:DuetCameraPlanV377,ms:number,playing:boolean):DuetCameraPlanV377{
  if(!plan.active||!playing||!Number.isFinite(ms)||ms<0||state.lastMs>=0&&(ms<state.lastMs-90||ms-state.lastMs>2200)){
    state.lastShot="none";state.lastLead=0;state.untilMs=0;state.lastMs=Number.isFinite(ms)?ms:-1;
    return !playing||!plan.active?{...plan,active:false,shot:"none",strength:0}:plan;
  }
  state.lastMs=ms;
  // Always permit a dramatic handoff two-shot and a hook-wide shot immediately.
  if(plan.shot==="group"||plan.shot==="two-shot"){
    state.lastShot=plan.shot;state.lastLead=plan.leadSlot;state.untilMs=ms+(plan.shot==="two-shot"?400:500);return plan;
  }
  if(state.lastShot==="lead"&&state.lastLead!==plan.leadSlot&&ms<state.untilMs)
    return {...plan,leadSlot:state.lastLead};
  if(state.lastShot!==plan.shot||state.lastLead!==plan.leadSlot){state.untilMs=ms+1150;state.lastShot=plan.shot;state.lastLead=plan.leadSlot;}
  return plan;
}
/** Small adjustments applied to the EXISTING camera pose; downstream lyrics safety remains mandatory. */
export function composeCinematicDuetCameraV377(pose:CameraPose,plan:DuetCameraPlanV377,
 anchors:readonly CameraAnchorV377[],{lyricsProtected=false,faceY=null}:{lyricsProtected?:boolean;faceY?:number|null}={}):CameraPose{
  if(!plan.active||plan.shot==="none")return pose;
  const strength=plan.strength*(lyricsProtected?.48:1);
  if(strength<=0)return pose;
  const valid=(slot:number|null)=>slot===null?null:anchors.find(a=>a.slot===slot&&a.visible&&Number.isFinite(a.x)&&Number.isFinite(a.z))??null;
  const a=valid(plan.leadSlot),b=valid(plan.partnerSlot);
  const available=anchors.filter(a=>a.visible&&Number.isFinite(a.x)&&Number.isFinite(a.z)).slice(0,plan.count);
  if(!available.length)return pose; // do not aim at a hypothetical character
  let centerX=0,centerZ=0,span=0;
  if(plan.shot==="lead") {if(!a)return pose;centerX=a.x;centerZ=a.z;}
  else if(plan.shot==="two-shot"){
    if(!a||!b)return pose;centerX=(a.x+b.x)/2;centerZ=(a.z+b.z)/2;span=Math.abs(a.x-b.x);
  }else {
    centerX=available.reduce((s,x)=>s+x.x,0)/available.length;
    centerZ=available.reduce((s,x)=>s+x.z,0)/available.length;
    span=Math.max(...available.map(x=>x.x))-Math.min(...available.map(x=>x.x));
  }
  const gain=clamp(strength,0,1);
  const tx=pose.targetX??0,tz=pose.targetZ??0;
  const wantedX=clamp(centerX,-2.6,2.6),shift=clamp(wantedX-tx,-2.2,2.2)*gain;
  const wantedZ=plan.shot==="lead"?Math.max(3.25,4.0+Math.abs(centerZ)*.1):
    plan.shot==="two-shot"?Math.max(4.35,4.75+span*.32):Math.max(5.25,5.5+span*.38);
  const desiredZ=clamp(wantedZ,3.2,9.2);
  const y=faceY!==null&&Number.isFinite(faceY)?clamp(faceY,-.2,1.9):.65;
  // Preserve camera yaw and authored base movement; never teleport the camera.
  const zoomZ=pose.z+(desiredZ-pose.z)*gain*.8;
  const targetY=pose.targetY+(y-pose.targetY)*gain*(plan.shot==="lead"?.36:.16);
  return {...pose,x:pose.x+shift*.8,z:zoomZ,targetX:tx+shift,targetZ:tz+(clamp(centerZ,-1,1)-tz)*gain*.1,
    targetY,fov:clamp(pose.fov+(plan.shot==="group"?3.5:plan.shot==="two-shot"?1.0:-2.5)*gain,28,76)};
}
