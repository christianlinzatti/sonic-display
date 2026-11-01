/** V682 – evidence-bound cinematic framing variety.
 * Runs inside the existing R3F StageCameraDirector; no extra camera, timer,
 * audio inference, vocal identity guesses or hard cuts. V655 determines the
 * verified singer/section. V550/V540 validate the actual visible 3D anchors.
 */
import type {CameraPoseV528 as Pose, ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import type {NaturalCameraCueV655, NaturalShotV655} from './naturalConcertCameraV655';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type CameraMotifV682='center'|'stage-left'|'stage-right'|'crane'|'wide';
export type VarietyStateV682={trackId:string;lastMs:number;sinceMs:number;motif:CameraMotifV682|null;
  shot:NaturalShotV655;leadSlot:number;history:readonly CameraMotifV682[];serial:number};
export type VarietyCueV682={active:boolean;motif:CameraMotifV682|null;strength:number;cameraRate:number;
  serial:number;reason:string};
export type VarietyOptionsV682={trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
  automatic:boolean;authored:boolean;quality:'low'|'balanced'|'high';aspect:number;
  lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;faceY?:number|null};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const smooth=(t:number)=>{const v=clamp(t,0,1);return v*v*(3-2*v);};
const off:VarietyCueV682={active:false,motif:null,strength:0,cameraRate:1,serial:0,reason:'inactive'};
export const initialVarietyStateV682=():VarietyStateV682=>({trackId:'',lastMs:-1,sinceMs:0,
  motif:null,shot:'off',leadSlot:-1,history:[],serial:0});
const anchorsOK=(anchors:readonly Anchor[])=>Array.isArray(anchors)&&anchors.length>0&&anchors.length<=4&&
  anchors.every(a=>a.visible&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<4&&
    [a.x,a.y,a.z].every(v=>finite(v)&&Math.abs(v)<40))&&
  new Set(anchors.map(a=>a.slot)).size===anchors.length;
const cameraOK=(pose:Pose)=>[pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite)&&
  pose.fov>=28&&pose.fov<=76;
const candidates:Record<Exclude<NaturalShotV655,'off'>,readonly CameraMotifV682[]>={
  portrait:['center','stage-left','stage-right','crane'],
  duet:['wide','stage-left','stage-right','center'],
  ensemble:['wide','crane','stage-left','stage-right'],
  wide:['wide','stage-left','stage-right','crane'],
  rest:['center','wide','crane','stage-left'],
};

/** A pure 6.5–10-second shot decision. Never switch on a single render frame.
 * History is per-song, bounded to the last three motifs and never persisted.
 * An artist handoff is allowed a faster change, but cannot create an identity.
 */
export function advanceCameraVarietyV682(state:VarietyStateV682,cue:NaturalCameraCueV655,
  anchors:readonly Anchor[],o:VarietyOptionsV682):{state:VarietyStateV682;cue:VarietyCueV682}{
  const idle={state,cue:off};
  if(!o.automatic||o.authored||!o.playing||o.reducedMotion||o.quality==='low'||
    !o.trackId?.trim()||!finite(o.progressMs)||o.progressMs<0||
    !finite(o.aspect)||o.aspect<.55||o.aspect>3.5||!anchorsOK(anchors)||
    !cue.active||cue.shot==='off'||!candidates[cue.shot]||
    !finite(cue.strength)||cue.strength<=0||cue.strength>.8||
    !['verified-v528-singer','verified-v604-section'].includes(cue.reason)||
    !Number.isInteger(cue.leadSlot)||cue.leadSlot < -1 ||cue.leadSlot>3||
    (cue.leadSlot>=0&&!anchors.some(a=>a.slot===cue.leadSlot)))return idle;
  const reset=state.trackId!==o.trackId||o.progressMs<state.lastMs-180||
    (state.lastMs>=0&&o.progressMs-state.lastMs>12000);
  const prev=reset?initialVarietyStateV682():state;
  const handoff=prev.leadSlot>=0&&cue.leadSlot>=0&&prev.leadSlot!==cue.leadSlot;
  const hold=cue.shot==='portrait'?8800:cue.shot==='rest'?10300:cue.shot==='duet'?7900:6500;
  const elapsed=o.progressMs-prev.sinceMs;
  const change=prev.motif===null||(prev.shot!==cue.shot&&elapsed>=2600)||
    (handoff&&elapsed>=1900)||elapsed>=hold;
  let next:VarietyStateV682={...prev,trackId:o.trackId,lastMs:o.progressMs};
  if(change){
    const list=candidates[cue.shot];
    // Avoid immediate and next-to-last repetitions when there are alternatives.
    const previous=new Set(prev.history.slice(-2));
    const allowed=list.filter(m=>m!==prev.motif&&!previous.has(m));
    const pool=allowed.length?allowed:list.filter(m=>m!==prev.motif);
    const index=(prev.serial+Math.max(0,cue.act)+Math.max(0,cue.variant))%pool.length;
    const motif=pool[index];
    next={...next,sinceMs:o.progressMs,motif,shot:cue.shot,leadSlot:cue.leadSlot,
      serial:prev.serial+1,history:[...prev.history.slice(-2),motif]};
  }
  if(next.motif===null)return idle;
  // Smooth the *framing influence* after each accepted hold; no hard cut.
  const strength=clamp(cue.strength*smooth((o.progressMs-next.sinceMs)/1500)*
    (o.quality==='balanced'?.48:.72)*(o.lyricsProtected?.18:1),0,.40);
  return {state:next,cue:{active:true,motif:next.motif,strength,
    cameraRate:next.motif==='crane'?.72:next.motif==='wide'?.77:.82,
    serial:next.serial,reason:cue.reason}};
}

/** One small candidate at a time, keeping the full visible cast, their heads,
 * feet and any side lyrics at least as safe as the incoming shot. Never trust
 * the chosen motif without measuring the already-composed camera pose.
 */
export function composeCameraVarietyV682(pose:Pose,cue:VarietyCueV682,
  anchors:readonly Anchor[],o:Pick<VarietyOptionsV682,'aspect'|'lyricsProtected'|'lyricsSide'|'faceY'>):Pose{
  if(!cue.active||!cue.motif||cue.strength<.001||!cameraOK(pose)||!anchorsOK(anchors)||
    !finite(o.aspect)||o.aspect<.55||o.aspect>3.5)return pose;
  const side=o.lyricsProtected?o.lyricsSide??null:null;
  const faceY=finite(o.faceY)?clamp(o.faceY,1.1,2.4):1.55;
  const baseline=measureConcertFrameV550(pose,anchors,o.aspect,side,o.lyricsProtected,faceY);
  const screen=measureScreenFrameV540(pose,anchors,o.aspect,side);
  if(!baseline||!screen)return pose;
  const tx=pose.targetX??0,ty=pose.targetY,tz=pose.targetZ??0;
  const dx=pose.x-tx,dy=pose.y-ty,dz=pose.z-tz;
  const distance=Math.hypot(dx,dy,dz);
  if(distance<.5||dz<=.5||Math.abs(dx)>Math.abs(dz)*.8)return pose;
  let pan=0,lift=0,widen=0,fov=0;
  switch(cue.motif){
    case 'stage-left': pan=-.18;fov=.18;break;
    case 'stage-right':pan=.18;fov=.18;break;
    case 'crane':lift=.15;widen=.018;fov=.30;break;
    case 'wide':widen=.028;fov=.60;break;
    case 'center':fov=-.25;break;
  }
  // Protected captions win; no horizontal shifts with side or bottom lyrics.
  if(o.lyricsProtected)pan=0;
  for(const gain of [1,.65,.35]){
    const amount=cue.strength*gain;
    const px=tx+pan*amount,py=ty+lift*amount;
    const ratio=1+widen*amount;
    const candidate:Pose={...pose,targetX:px,targetY:py,
      x:px+dx*ratio,y:py+dy*ratio,z:tz+dz*ratio,
      fov:clamp(pose.fov+fov*amount,28,76)};
    if(!cameraOK(candidate))continue;
    const measured=measureConcertFrameV550(candidate,anchors,o.aspect,side,o.lyricsProtected,faceY);
    const framed=measureScreenFrameV540(candidate,anchors,o.aspect,side);
    if(!measured||!framed||measured.overflow>baseline.overflow+1e-6||
      measured.headOverflow>baseline.headOverflow+1e-6||
      measured.fullBodyOverflow>baseline.fullBodyOverflow+1e-6||
      framed.overflow>screen.overflow+1e-6)continue;
    return candidate;
  }
  return pose;
}
