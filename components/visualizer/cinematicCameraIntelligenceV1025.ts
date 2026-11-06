/** V1025 – Cinematic Camera Intelligence 4.0.
 * Small, verified, frame-safe finishing of the EXISTING StageCameraDirector camera.
 * V604/V895 owns the song structure; V528 owns singer identity; V377 supplies
 * actual visible avatar roots. No second camera, model inference, storage, timers,
 * beat fabrication, live tracking loop or unverified vocalist assignments.
 */
import type {CameraPoseV897 as Pose, CameraPlanV897 as Plan, CameraSceneV897 as Act} from './cinematicCameraDirectorV897';
import type {ConcertSceneV528 as VocalScene, ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type CinematicShotV1025='off'|'portrait'|'handoff'|'ensemble'|'arena'|'glide'|'lyrics-hold';
export type CameraInputV1025={
 pose:Pose;plan:Plan|null|undefined;vocalScene?:VocalScene|null;
 anchors:readonly Anchor[];trackId:string;durationMs:number;positionMs:number;
 playing:boolean;automatic:boolean;directorEnabled:boolean;cameraEnabled:boolean;
 manualCamera?:boolean;manualFx?:boolean;seekBlocked?:boolean;blackout?:boolean;
 reducedMotion?:boolean;tier:'low'|'balanced'|'high';aspect:number;
 lyricsProtected?:boolean;lyricsVisible?:boolean;lyricsSide?:'left'|'right'|null;
 faceY?:number|null;
};
export type CameraResultV1025={
 pose:Pose;active:boolean;shot:CinematicShotV1025;reason:'verified'|'protected'|'unverified'|'framing'|'boundary';
 sceneIndex:number;participants:readonly number[];cameraRate:number;
};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const sections=new Set(['intro','verse','hook','build','drop','break','finale','outro']);
const validAnchor=(a:Anchor)=>Number.isInteger(a.slot)&&a.slot>=0&&a.slot<=3&&a.visible&&
 [a.x,a.y,a.z].every(x=>finite(x)&&Math.abs(x)<35);
const validPose=(p:Pose)=>[p.x,p.y,p.z,p.targetX??0,p.targetY,p.targetZ??0,p.fov].every(finite)&&
 p.fov>=28&&p.fov<=76&&Math.hypot(p.x-(p.targetX??0),p.y-p.targetY,p.z-(p.targetZ??0))>=1.8&&
 p.z-(p.targetZ??0)>.7&&Math.abs(p.x-(p.targetX??0))<(p.z-(p.targetZ??0))*.75;
function currentAct(plan:Plan,at:number):Act|null {
 if(!Array.isArray(plan.scenes)||plan.scenes.length<1||plan.scenes.length>120)return null;
 let active:Act|null=null;
 for(const act of plan.scenes){
  if(!Number.isInteger(act.index)||act.index<0||!finite(act.startMs)||!finite(act.endMs)||
    act.startMs<0||act.endMs>plan.durationMs||act.endMs-act.startMs<2200||
    !sections.has(act.section))return null;
  if(at>=act.startMs&&at<act.endMs){
   if(active)return null; // Ambiguous overlap never causes a camera decision.
   active=act;
  }
 }
 return active;
}
/** V528 handoff/lead facts must be from the same song and current, verified cue. */
function validVocal(v:VocalScene|null|undefined,i:CameraInputV1025):v is VocalScene {
 if(!v?.active||v.trackId!==i.trackId||!finite(v.cueStartMs)||!finite(v.cueEndMs)||
   v.cueStartMs<0||v.cueEndMs<=v.cueStartMs||i.positionMs<v.cueStartMs||i.positionMs>=v.cueEndMs||
   !Number.isInteger(v.count)||v.count<2||v.count>4||
   !Number.isInteger(v.leadSlot)||v.leadSlot<0||v.leadSlot>=v.count||
   !finite(v.strength)||v.strength<=0||v.strength>1||
   !Array.isArray(v.singingSlots)||v.singingSlots.length<1||v.singingSlots.length>v.count||
   new Set(v.singingSlots).size!==v.singingSlots.length||
   !v.singingSlots.includes(v.leadSlot)||
   !v.singingSlots.every(x=>Number.isInteger(x)&&x>=0&&x<v.count))return false;
 if(v.focus==='handoff')return v.handoffFrom!==null&&Number.isInteger(v.handoffFrom)&&
  v.handoffFrom>=0&&v.handoffFrom<v.count&&v.handoffFrom!==v.leadSlot;
 if(v.focus==='ensemble')return v.singingSlots.length===v.count;
 return v.focus==='lead'&&v.singingSlots.length>=1;
}
/** Deterministic camera finish; rejected operations preserve the original pose BY REFERENCE. */
export function reviewCinematicCameraV1025(i:CameraInputV1025):CameraResultV1025 {
 const off=(reason:CameraResultV1025['reason'],shot:CinematicShotV1025='off',sceneIndex=-1):CameraResultV1025=>({
  pose:i.pose,active:false,shot,reason,sceneIndex,participants:[],cameraRate:1});
 if(!i.playing||!i.automatic||!i.directorEnabled||!i.cameraEnabled||i.manualCamera||i.manualFx||
   i.seekBlocked||i.blackout||i.reducedMotion||i.tier==='low')return off('protected');
 if(i.lyricsProtected||i.lyricsVisible)return off('protected','lyrics-hold');
 const p=i.plan;
 if(!p||p.source!=='verified-v604'||!i.trackId||i.trackId.length>180||p.trackId!==i.trackId||
   !finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||p.durationMs!==i.durationMs||
   !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
   !finite(i.aspect)||i.aspect<.6||i.aspect>3.5||!validPose(i.pose)||
   !Array.isArray(i.anchors)||i.anchors.length<1||i.anchors.length>4||
   !i.anchors.every(validAnchor)||new Set(i.anchors.map(a=>a.slot)).size!==i.anchors.length)
  return off('unverified');
 const act=currentAct(p,i.positionMs);
 if(!act)return off('unverified');
 const age=i.positionMs-act.startMs,remaining=act.endMs-i.positionMs;
 const envelope=smooth(age/950)*smooth(remaining/950);
 if(envelope<.0001)return off('boundary','off',act.index);
 const v=validVocal(i.vocalScene,i)?i.vocalScene:null;
 let shot:CinematicShotV1025='glide';
 let slots:number[]=[];
 if(v&&v.focus==='handoff'){
  shot='handoff';slots=[v.handoffFrom!,v.leadSlot];
 }else if(v&&v.focus==='ensemble'){
  shot='ensemble';slots=[...v.singingSlots];
 }else if(v&&v.focus==='lead'&&v.singingSlots.length>1){
  // Even a lead-focused cue may have two actual singers: never crop to a fake solo.
  shot='ensemble';slots=[...v.singingSlots];
 }else if(v&&v.focus==='lead'&&act.section==='verse'){
  shot=act.index%3===2?'glide':'portrait';slots=[v.leadSlot];
 }else if(['hook','drop','finale'].includes(act.section)){
  shot='arena';slots=i.anchors.map(a=>a.slot);
 }else if(v&&v.focus==='lead'){
  shot='glide';slots=[v.leadSlot];
 }else {
  // No verified singer: no portrait/close-up. Glide only using actual roots.
  shot='glide';slots=i.anchors.map(a=>a.slot);
 }
 const selected=slots.map(slot=>i.anchors.find(a=>a.slot===slot));
 if(selected.some(a=>!a)||selected.length<1||new Set(slots).size!==slots.length)return off('unverified','off',act.index);
 const anchors=selected as Anchor[];
 // The reference projection remains conservative: compare full group AND each singer.
 const faceY=finite(i.faceY)?clamp(i.faceY,.8,2.6):1.55;
 const side=i.lyricsSide??null;
 const measure=(pose:Pose,which:readonly Anchor[])=>{
  const frame=measureConcertFrameV550(pose,which,i.aspect,side,false,faceY);
  const screen=measureScreenFrameV540(pose,which,i.aspect,side);
  return frame&&screen?{frame,screen}:null;
 };
 const before=measure(i.pose,i.anchors),singles=i.anchors.map(a=>measure(i.pose,[a]));
 if(!before||singles.some(f=>!f))return off('framing','off',act.index);
 const strength=envelope*(i.tier==='balanced'?.48:.8)*(v?clamp(v.strength,.1,.8):.42);
 const progress=age/(act.endMs-act.startMs);
 const drift=Math.sin(progress*Math.PI*2+act.index*.43);
 const center=anchors.reduce((s,a)=>s+a.x,0)/anchors.length;
 const from=v?.focus==='handoff'?anchors.find(a=>a.slot===v.handoffFrom):null;
 const to=v?.focus==='handoff'?anchors.find(a=>a.slot===v.leadSlot):null;
 const leading=from&&to?from.x*(1-(.40+.30*smooth(progress)))+to.x*(.40+.30*smooth(progress)):center;
 const tx=i.pose.targetX??0,ty=i.pose.targetY,tz=i.pose.targetZ??0;
 const dx=i.pose.x-tx,dy=i.pose.y-ty,dz=i.pose.z-tz;
 // Subtle, continuous composition on the existing camera, NO hard cuts.
 const pan=clamp((leading-tx)*.12*strength+drift*(shot==='glide'?.035:.015)*strength,-.055,.055);
 const dolly=shot==='portrait'?1-.025*strength:
  shot==='arena'||shot==='ensemble'?1+.035*strength:1+.007*strength;
 const rise=shot==='arena'?.025*strength:shot==='glide'?.008*strength:0;
 const fov=shot==='portrait'?-1.0*strength:shot==='arena'||shot==='ensemble'?.55*strength:0;
 for(const fraction of [1,.5,.2]){
  const targetX=tx+pan*fraction,targetY=ty+rise*fraction,scale=1+(dolly-1)*fraction;
  const candidate:Pose={...i.pose,targetX,targetY,x:targetX+dx*scale,y:targetY+dy*scale,
   z:tz+dz*scale,fov:clamp(i.pose.fov+fov*fraction,28,76)};
  const after=measure(candidate,i.anchors),afterSingles=i.anchors.map(a=>measure(candidate,[a]));
  if(!after||afterSingles.some(f=>!f))continue;
  const eps=1e-7;
  if(after.frame.overflow>before.frame.overflow+eps||
    after.frame.headOverflow>before.frame.headOverflow+eps||
    after.frame.fullBodyOverflow>before.frame.fullBodyOverflow+eps||
    after.screen.overflow>before.screen.overflow+eps||
    afterSingles.some((f,n)=>f!.frame.overflow>singles[n]!.frame.overflow+eps||
      f!.frame.headOverflow>singles[n]!.frame.headOverflow+eps||
      f!.frame.fullBodyOverflow>singles[n]!.frame.fullBodyOverflow+eps||
      f!.screen.overflow>singles[n]!.screen.overflow+eps))continue;
  return {pose:candidate,active:true,shot,reason:'verified',sceneIndex:act.index,participants:slots,
   cameraRate:shot==='portrait'?.968:shot==='handoff'?.955:shot==='glide'?.985:1};
 }
 return off('framing','off',act.index);
}
export const composeCinematicCameraV1025=(input:CameraInputV1025):Pose=>reviewCinematicCameraV1025(input).pose;
