/** V454 Cinematic Concert Camera 2.0.
 * Pure camera composition for the existing R3F director. The visual singer slot
 * is a stage convention, never an identification of a real vocalist.
 */
import type {RapCameraPoseV429} from './cinematicRapCameraV429';
import type {SmartShowCueV446} from './smartAutomaticRapShowV446';

export type ConcertShotV454='none'|'portrait'|'ensemble';
export interface ConcertCameraPlanV454 {
  active:boolean;shot:ConcertShotV454;eventId:string;leadSlot:number;
  count:number;strength:number;
}
export interface ConcertCameraHoldV454 {
  trackId:string;lastMs:number;sinceMs:number;plan:ConcertCameraPlanV454;
}
const clamp=(v:number,min:number,max:number)=>Number.isFinite(v)?Math.min(max,Math.max(min,v)):min;
const OFF:ConcertCameraPlanV454={active:false,shot:'none',eventId:'',leadSlot:0,count:1,strength:0};
export const inactiveConcertCameraV454=():ConcertCameraPlanV454=>({...OFF});
export const newConcertCameraHoldV454=():ConcertCameraHoldV454=>({trackId:'',lastMs:-1,sinceMs:0,plan:inactiveConcertCameraV454()});

/** Stage-score inputs are already constrained by V446's manual-cast protections. */
export function planConcertCameraV454(input:{cue:SmartShowCueV446|null|undefined;count:number;
  enabled:boolean;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
  strength?:number}):ConcertCameraPlanV454{
  const cue=input.cue;
  if(!input.enabled||!input.playing||input.reducedMotion||input.manualPriority||!cue?.active||
    !cue.eventId||!Number.isFinite(input.count)||input.count<1)return inactiveConcertCameraV454();
  const count=Math.trunc(clamp(input.count,1,4));
  const group=cue.group||cue.section==='hook'||cue.section==='intro'||cue.section==='outro';
  const leadSlot=Math.trunc(clamp(cue.focus,0,count-1));
  const strength=clamp(input.strength??60,0,100)/100;
  if(strength===0)return inactiveConcertCameraV454();
  return {active:true,shot:group?'ensemble':'portrait',eventId:cue.eventId,
    leadSlot,count,strength};
}

/** Keep each visual shot for at least 2.1s, but never preserve it across pause/seek/song change.
 * The show plan itself changes only on phrase boundaries; the hold handles noisy live sections.
 */
export function holdConcertCameraV454(state:ConcertCameraHoldV454,
  incoming:ConcertCameraPlanV454,trackId:string,progressMs:number,playing:boolean):ConcertCameraPlanV454{
  if(!playing||!incoming.active||!trackId||!Number.isFinite(progressMs)||progressMs<0){
    Object.assign(state,newConcertCameraHoldV454());return inactiveConcertCameraV454();
  }
  const jump=state.trackId!==trackId||progressMs<state.lastMs-250||
    state.lastMs>=0&&progressMs-state.lastMs>3500;
  const changed=state.plan.eventId!==incoming.eventId||state.plan.shot!==incoming.shot;
  if(jump||!state.plan.active||changed&&progressMs-state.sinceMs>=2100){
    state.plan=incoming;
    state.sinceMs=progressMs;
  }else if(state.plan.eventId===incoming.eventId){
    state.plan=incoming;
  }
  state.trackId=trackId;state.lastMs=progressMs;
  return state.plan;
}

/** Bounded dolly and safe multi-artist composition, applied AFTER existing automatic
 * camera plans but BEFORE the V351 lyrics safety guard. It never mutates saved poses.
 */
export function composeConcertCameraV454(pose:RapCameraPoseV429,plan:ConcertCameraPlanV454,
  options:{lyricsProtected?:boolean;faceY?:number|null;alreadyMultiFramed?:boolean}={}):RapCameraPoseV429{
  if(!plan.active||plan.shot==='none'||plan.strength<=0||
    ![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(Number.isFinite))return pose;
  const count=Math.trunc(clamp(plan.count,1,4));
  const gain=clamp(plan.strength,0,1)*(options.lyricsProtected?.4:1);
  const originX=pose.targetX??0,originZ=pose.targetZ??0;
  const dx=pose.x-originX,dy=pose.y-pose.targetY,dz=pose.z-originZ;
  const distance=Math.hypot(dx,dy,dz);
  if(!Number.isFinite(distance)||distance<.01)return pose;
  const ensemble=plan.shot==='ensemble';
  const minDistance=ensemble?(count>=4?8.25:count===3?7.1:count===2?5.25:3.5):
    count>=3?6.25:count===2?4.35:2.85;
  const ratio=ensemble?1+.11*gain:1-.11*gain;
  const nextDistance=Math.max(minDistance,distance*ratio);
  const safeRatio=nextDistance/distance;
  const lead=Math.trunc(clamp(plan.leadSlot,0,count-1));
  const slotOffset=ensemble?0:count===2?(lead===0?-.42:.42):0;
  // V442 has already framed three/four-artist closeups; do not shift the same slot twice.
  const xShift=options.alreadyMultiFramed&&count>=3?0:slotOffset*gain;
  const targetX=clamp(ensemble?originX*(1-.26*gain):originX+xShift,-2.4,2.4);
  const baseTargetY=pose.targetY;
  const faceOffset=!ensemble&&options.faceY!=null&&Number.isFinite(options.faceY)
    ?clamp(options.faceY-baseTargetY,-.15,.28)*gain*.22:0;
  const targetY=baseTargetY+faceOffset;
  const x=targetX+dx*safeRatio;
  const y=targetY+dy*safeRatio;
  const z=originZ+dz*safeRatio;
  const fov=ensemble?clamp(Math.max(count>=4?43:count===3?40:37,pose.fov+1.8*gain),28,75):
    clamp(pose.fov-1.5*gain,31,75);
  return {...pose,x,y,z,targetX,targetY,fov};
}
