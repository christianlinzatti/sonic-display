import type {CameraPoseV432 as CameraPose} from "./cameraPoseTypeV432";
import type {RapCameraPlanV429} from "./cinematicRapCameraV429";

/** V433: state belongs to the existing stage camera and is reset on seek, pause or song change. */
export type RapCameraTransitionStateV433 = {
  trackId:string;lastMs:number;key:string;from:CameraPose|null;output:CameraPose|null;
  startMs:number;durationMs:number;
};
export type RapCameraTransitionOptionsV433 = {
  enabled:boolean;playing:boolean;reducedMotion:boolean;trackId:string;progressMs:number;
  bpm?:number|null;kick?:number;beatSync?:boolean;smoothness?:number;
};
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):lo;
const poseKeys=["x","y","z","targetX","targetY","targetZ","fov"] as const;
const finitePose=(p:CameraPose)=>poseKeys.every(k=>Number.isFinite(p[k]??0));
const copyPose=(p:CameraPose):CameraPose=>({...p});
export function newRapCameraTransitionStateV433():RapCameraTransitionStateV433 {
  return {trackId:"",lastMs:-1,key:"",from:null,output:null,startMs:0,durationMs:0};
}
const smoothstep=(t:number)=>{const v=clamp(t,0,1);return v*v*(3-2*v);};
/** A playback-clock beat grid is an approximation; only a measured kick accent can confirm a transient. */
export function rapCameraBeatDelayV433(progressMs:number,bpm:number|null|undefined,kick:number|undefined,beatSync=true):number{
  if(!beatSync||!Number.isFinite(progressMs)||progressMs<0)return 0;
  if(typeof kick==="number"&&Number.isFinite(kick)&&kick>=.72)return 0;
  if(typeof bpm!=="number"||!Number.isFinite(bpm)||bpm<60||bpm>220)return 0;
  const beatMs=60000/bpm;
  const until=(beatMs-(progressMs%beatMs))%beatMs;
  // Never postpone a lyric/role change for more than 160 ms merely to reach a grid point.
  return until<=160?until:0;
}
export function rapCameraTransitionDurationV433(plan:RapCameraPlanV429,smoothness:number):number{
  const base=plan.shot==="duet-wide"?520:plan.shot==="hook-push"?430:
    plan.shot==="reply-side"?350:300;
  return Math.round(clamp(base*(.6+clamp(smoothness,0,100)/100),160,820));
}
/** Blend just the automatic V429 pose; V432 authored keyframes are applied after this layer. */
export function advanceRapCameraTransitionV433(
  state:RapCameraTransitionStateV433,automaticPose:CameraPose,basePose:CameraPose,
  plan:RapCameraPlanV429,opts:RapCameraTransitionOptionsV433,
):CameraPose{
  const now=opts.progressMs;
  const allowed=opts.enabled&&opts.playing&&!opts.reducedMotion&&!!opts.trackId&&
    Number.isFinite(now)&&now>=0&&plan.active&&plan.gain>0&&
    now>=plan.startMs&&now<plan.endMs&&finitePose(automaticPose)&&finitePose(basePose);
  if(!allowed){Object.assign(state,newRapCameraTransitionStateV433());return automaticPose;}
  const jumped=state.trackId!==opts.trackId||now<state.lastMs-250||
    (state.lastMs>=0&&now-state.lastMs>2500);
  // Only actual shot/rapper changes begin transitions; repeated render frames never restart one.
  const key=`${plan.shot}:${plan.leadSlot}`;
  if(jumped){
    Object.assign(state,newRapCameraTransitionStateV433());
    state.trackId=opts.trackId;
  }
  if(state.key!==key){
    state.from=copyPose(state.output??basePose);
    state.key=key;
    state.startMs=now+rapCameraBeatDelayV433(now,opts.bpm,opts.kick,opts.beatSync!==false);
    state.durationMs=rapCameraTransitionDurationV433(plan,opts.smoothness??55);
  }
  const t=smoothstep((now-state.startMs)/Math.max(1,state.durationMs));
  const from=state.from??basePose;
  const blended:CameraPose={...automaticPose};
  for(const field of poseKeys){
    const a=from[field]??0,b=automaticPose[field]??0;
    blended[field]=a+(b-a)*t;
  }
  // Preserve the existing safe camera pipeline's bounds. Never increase FOV beyond either pose.
  blended.fov=clamp(blended.fov,20,95);
  state.output=copyPose(blended);
  state.trackId=opts.trackId;
  state.lastMs=now;
  return blended;
}
