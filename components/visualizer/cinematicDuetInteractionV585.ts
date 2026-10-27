/** Sonic Display V585 – Cinematic Duet Camera & Facial Interaction 4.0.
 * Deliberately pure: uses existing verified V528/V416 cue timing and stage roots.
 * No inferred vocals, additional camera, render loop, GLB bone or clip mutation.
 */
import type {CameraPoseV528 as CameraPose, ConcertSceneV528, ConcertAnchorV528} from './cinematicConcertCoordinationV528';
import type {RapDuetInputV500,RapDuetPlanV500} from './intelligentRapDuetPerformanceV500';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';

const finite=(v:number)=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const offCamera=(pose:CameraPose)=>pose;
export type DuetCameraOptionsV585={trackId?:string|null;progressMs:number;aspect:number;
  playing:boolean;reducedMotion:boolean;automatic:boolean;authored:boolean;
  lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;faceY?:number|null};
/** A shared temporal curve for the camera and the cast-facing acknowledgement.
 * Seeking to any song time recomputes the same envelope; no stale frame state.
 */
export function duetHandoffEnvelopeV585(now:number,start:number,end:number):number{
  if(![now,start,end].every(finite)||start<0||end<=start||now<start||now>=end)return 0;
  const elapsed=now-start;
  return smooth(elapsed/320)*(1-smooth((elapsed-680)/780))*smooth((end-now)/270);
}
const validPose=(p:CameraPose)=>[p.x,p.y,p.z,p.targetX??0,p.targetY,p.targetZ??0,p.fov].every(finite)&&p.fov>=28&&p.fov<=76;
/** Adjust only the already-composed automatic V550 result, before V351 lyrics safety.
 * V540 and V550 frame diagnostics must both stay at least as good as before.
 * The "faceY" input is an approximate measured rig height, not face detection.
 */
export function composeCinematicDuetInteractionV585(pose:CameraPose,
  scene:ConcertSceneV528|null|undefined,anchors:readonly ConcertAnchorV528[],o:DuetCameraOptionsV585):CameraPose{
  if(!scene?.active||scene.focus!=='handoff'&&scene.focus!=='ensemble'||
    !o.playing||o.reducedMotion||!o.automatic||o.authored||!o.trackId?.trim()||
    scene.trackId!==o.trackId||!finite(o.progressMs)||
    o.progressMs<scene.cueStartMs||o.progressMs>=scene.cueEndMs||
    !validPose(pose)||!finite(o.aspect)||o.aspect<.5||o.aspect>4||
    !Number.isInteger(scene.count)||scene.count<2||scene.count>4||
    !Number.isInteger(scene.leadSlot)||scene.leadSlot<0||scene.leadSlot>=scene.count||
    !finite(scene.strength)||scene.strength<=0||scene.strength>1||
    !Array.isArray(scene.singingSlots)||scene.singingSlots.length<1||
    new Set(scene.singingSlots).size!==scene.singingSlots.length||
    scene.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=scene.count)||
    !scene.singingSlots.includes(scene.leadSlot))return offCamera(pose);
  const handoff=scene.focus==='handoff';
  const former=scene.handoffFrom;
  if(handoff&&(former===null||!Number.isInteger(former)||former<0||former>=scene.count||former===scene.leadSlot)||
    !handoff&&scene.singingSlots.length!==scene.count)return pose;
  const slots=handoff?[former!,scene.leadSlot]:scene.singingSlots;
  const selected=slots.map(slot=>anchors.find(a=>a.slot===slot&&a.visible&&
    [a.x,a.y,a.z].every(n=>finite(n)&&Math.abs(n)<40)));
  if(selected.some(a=>!a))return pose;
  const cast=selected as ConcertAnchorV528[];
  // Respect the existing frontal camera, rather than moving authored side-angle shots.
  const dx=pose.x-(pose.targetX??0),dy=pose.y-pose.targetY,dz=pose.z-(pose.targetZ??0);
  const distance=Math.hypot(dx,dy,dz);
  if(!finite(distance)||distance<.5||dz<=.5||Math.abs(dx)>Math.abs(dz)*.8)return pose;
  const side=o.lyricsProtected?o.lyricsSide??null:null;
  const faceY=finite(o.faceY as number)?clamp(o.faceY as number,.7,2.7):1.55;
  const before=measureConcertFrameV550(pose,cast,o.aspect,side,o.lyricsProtected,faceY);
  const before540=measureScreenFrameV540(pose,cast,o.aspect,side);
  if(!before||!before540)return pose;
  const strength=clamp(scene.strength*(o.lyricsProtected?.35:1),0,.65);
  let result:CameraPose;
  if(handoff){
    const progress=duetHandoffEnvelopeV585(o.progressMs,scene.cueStartMs,scene.cueEndMs);
    if(progress<=.0001)return pose;
    const old=cast[0],lead=cast[1];
    // The focus travels from outgoing to incoming singer over the handoff,
    // with a capped micro-pan. V550 already provides the primary two-shot.
    const blend=smooth((o.progressMs-scene.cueStartMs)/900);
    const wanted=old.x+(lead.x-old.x)*blend;
    const shift=clamp((wanted-(pose.targetX??0))*strength*progress*.34,-.22,.22);
    if(Math.abs(shift)<.00001)return pose;
    result={...pose,x:pose.x+shift,targetX:(pose.targetX??0)+shift};
  }else{
    const elapsed=o.progressMs-scene.cueStartMs;
    const life=smooth(elapsed/650)*smooth((scene.cueEndMs-o.progressMs)/500);
    const gain=strength*life;
    if(gain<.001)return pose;
    const spread=Math.max(...cast.map(a=>a.x))-Math.min(...cast.map(a=>a.x));
    // Keep ALL verified hook singers in frame; no per-singer camera flicker.
    const widen=clamp(.025+.012*spread,.025,.065)*gain;
    result={...pose,x:pose.x+dx*widen,y:pose.y+dy*widen,z:pose.z+dz*widen,
      fov:clamp(pose.fov+.5*gain,28,76)};
  }
  const after=measureConcertFrameV550(result,cast,o.aspect,side,o.lyricsProtected,faceY);
  const after540=measureScreenFrameV540(result,cast,o.aspect,side);
  return after&&after540&&after.overflow<=before.overflow+1e-6&&
    after.headOverflow<=before.headOverflow+1e-6&&
    after.fullBodyOverflow<=before.fullBodyOverflow+1e-6&&
    after540.overflow<=before540.overflow+1e-6?result:pose;
}

/** A short reciprocal glance between ONLY two confirmed, reasonably spaced
 * performers. V500/V584 continue to own stage target, gesture and role; V585
 * never touches mouths, root motion, IK or the lip-sync face rig directly.
 * Solo passages retain V500's strictly front-facing lead invariant.
 */
export function refineCinematicDuetFaceV585(base:RapDuetPlanV500,input:RapDuetInputV500):RapDuetPlanV500{
  const {cue,count,positions,progressMs}=input;
  if(!base.active||input.manualPriority||input.reducedMotion||input.tier==='low'||
    !input.playing||!input.trackId||input.trackId!==input.cueTrackId||
    !cue.active||cue.count!==count||!Number.isInteger(count)||count<2||count>4||
    base.slots.length!==count||cue.style!=='reply'||
    cue.handoffFrom===null||!Number.isInteger(cue.handoffFrom)||
    cue.handoffFrom<0||cue.handoffFrom>=count||cue.handoffFrom===cue.leadSlot||
    !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
    !Array.isArray(cue.singingSlots)||!cue.singingSlots.includes(cue.leadSlot)||
    positions.length<count)return base;
  const old=cue.handoffFrom,lead=cue.leadSlot;
  const a=positions[old],b=positions[lead];
  if(!a||!b||a.length<3||b.length<3||
    ![...a,...b].every(finite))return base;
  const space=Math.hypot(a[0]-b[0],a[2]-b[2]);
  if(space<.85||space>6)return base;
  const envelope=duetHandoffEnvelopeV585(progressMs,cue.startMs,cue.endMs);
  const gain=envelope*clamp((input.strength??65)/100,0,1)*(input.tier==='balanced'?.55:1);
  if(gain<.0001)return base;
  const slots=base.slots.map((performer,index)=>{
    if(index!==old&&index!==lead)return performer;
    const other=index===old?b:a;
    const self=index===old?a:b;
    const angle=clamp(Math.atan2(other[0]-self[0],Math.max(1.6,3+other[2]-self[2])),-.38,.38);
    const n=gain*(index===lead?.19:.13);
    const yaw=clamp(performer.look.yaw+angle*n,-.42,.42);
    const eyeYaw=clamp(performer.look.eyeYaw+angle*n*.23,-.11,.11);
    return {...performer,look:{...performer.look,yaw,eyeYaw,
      weight:clamp(performer.look.weight+n*.26,0,.46)}};
  });
  return {...base,slots};
}
