/** V655 – natural, singer-safe camera cadence on the existing R3F camera.
 * No invented vocal identities, new camera, audio clock, animation loop or timers.
 * The V528 scene is a verified singer assignment; V604 acts are verified sections.
 * Manual/authored shots are never modified. The V351 screen guard remains last.
 */
import type {CameraPoseV528 as Pose,ConcertSceneV528 as Scene,ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type NaturalShotV655='off'|'portrait'|'duet'|'ensemble'|'wide'|'rest';
export type NaturalCameraStateV655={trackId:string;lastMs:number;startMs:number;shot:NaturalShotV655;
  variant:number;serial:number;leadSlot:number;act:number};
export type NaturalCameraCueV655={active:boolean;shot:NaturalShotV655;variant:number;
  leadSlot:number;act:number;cameraRate:number;strength:number;reason:string};
export type NaturalCameraOptionsV655={trackId:string;progressMs:number;playing:boolean;
  reducedMotion:boolean;automatic:boolean;authored:boolean;quality:'low'|'balanced'|'high';
  aspect:number;lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;faceY?:number|null};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const smooth=(n:number)=>{const v=clamp(n,0,1);return v*v*(3-2*v)};
const inactive:NaturalCameraCueV655={active:false,shot:'off',variant:0,leadSlot:-1,act:-1,
  cameraRate:1,strength:0,reason:'unavailable'};
export const initialNaturalCameraStateV655=():NaturalCameraStateV655=>({trackId:'',lastMs:-1,
  startMs:0,shot:'off',variant:0,serial:0,leadSlot:-1,act:-1});
const validAnchor=(a:Anchor)=>a.visible&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<4&&
  [a.x,a.y,a.z].every(n=>finite(n)&&Math.abs(n)<40);
const poseOK=(p:Pose)=>[p.x,p.y,p.z,p.targetY,p.targetX??0,p.targetZ??0,p.fov].every(finite)&&p.fov>=28&&p.fov<=76;

export function advanceNaturalCameraV655(state:NaturalCameraStateV655,
  scene:Scene|null|undefined,plan:NarrativePlanV604|null|undefined,cue:NarrativeCueV604|null|undefined,
  anchors:readonly Anchor[],o:NaturalCameraOptionsV655):{state:NaturalCameraStateV655;cue:NaturalCameraCueV655}{
 const idle={state,cue:inactive};
 if(!o.automatic||o.authored||!o.playing||o.reducedMotion||o.quality==='low'||
   !o.trackId?.trim()||!finite(o.progressMs)||o.progressMs<0||
   !finite(o.aspect)||o.aspect<.55||o.aspect>3.5||!Array.isArray(anchors)||
   anchors.length<1||anchors.length>4||!anchors.every(validAnchor)||
   new Set(anchors.map(a=>a.slot)).size!==anchors.length)return idle;
 const singer=!!scene?.active&&scene.trackId===o.trackId&&
   finite(scene.cueStartMs)&&finite(scene.cueEndMs)&&
   o.progressMs>=scene.cueStartMs&&o.progressMs<scene.cueEndMs&&
   Number.isInteger(scene.leadSlot)&&scene.leadSlot>=0&&scene.leadSlot<4&&
   anchors.some(a=>a.slot===scene.leadSlot)&&
   Number.isInteger(scene.count)&&scene.count===anchors.length&&
   Array.isArray(scene.singingSlots)&&scene.singingSlots.length>0&&
   new Set(scene.singingSlots).size===scene.singingSlots.length&&
   scene.singingSlots.includes(scene.leadSlot)&&
   scene.singingSlots.every(slot=>anchors.some(a=>a.slot===slot))&&
   finite(scene.strength)&&scene.strength>0&&scene.strength<=1;
 const verifiedAct=!!plan&&plan.source==='verified-v600'&&plan.trackId===o.trackId&&
   finite(plan.durationMs)&&o.progressMs<plan.durationMs&&
   !!cue?.active&&cue.source==='verified-v600'&&Number.isInteger(cue.act)&&
   cue.act>=0&&cue.act<plan.acts.length&&
   finite(cue.transition)&&cue.transition>=0&&cue.transition<=1&&
   plan.acts[cue.act].index===cue.act&&
   plan.acts[cue.act].startMs<=o.progressMs&&o.progressMs<plan.acts[cue.act].endMs&&
   plan.acts[cue.act].chapter===cue.chapter&&plan.acts[cue.act].motif===cue.motif&&
   plan.acts[cue.act].repetition===cue.repetition;
 if(!singer&&!verifiedAct)return idle;
 const act=verifiedAct?plan!.acts[cue!.act]:null;
 const lead=singer?scene!.leadSlot:-1;
 // Only a *verified* V528 vocalist may trigger portraits or duets.
 const section=act?.section;
 const desired:NaturalShotV655=singer
   ?scene!.singingSlots.length>=3||scene!.focus==='ensemble'?'ensemble':
     scene!.singingSlots.length===2||scene!.focus==='handoff'?'duet':'portrait'
   :section==='break'?'rest':section==='hook'||section==='drop'?'wide':'ensemble';
 const reset=state.trackId!==o.trackId||o.progressMs<state.lastMs-180||
   (state.lastMs>=0&&o.progressMs-state.lastMs>9000);
 const source=reset?initialNaturalCameraStateV655():state;
 const changedSinger=singer&&source.leadSlot>=0&&lead!==source.leadSlot;
 // Maintain cinematic hold lengths; confirmed handoffs can update sooner,
 // but never on a single frame. All decisions use the Spotify song clock.
 const minHold=section==='break'?7600:section==='hook'||section==='drop'?5100:
   section==='build'?6800:section==='verse'?8800:9200;
 const held=o.progressMs-source.startMs;
 const change=source.shot==='off'||held>=minHold||
   (changedSinger&&held>=1750);
 let next:NaturalCameraStateV655={...source,lastMs:o.progressMs};
 if(change){
  // In stable passages, keep the verified singer but alternate camera motif
  // and framing variant. The same framing variant never repeats back-to-back.
  const same=desired===source.shot;
  const variant=same?(source.variant+1)%3:(source.serial+((act?.repetition??0)%3))%3;
  next={...next,trackId:o.trackId,startMs:o.progressMs,shot:desired,
    variant,leadSlot:lead,act:act?.index??-1,serial:source.serial+1};
 }
 const elapsed=Math.max(0,o.progressMs-next.startMs);
 const cueGain=verifiedAct?cue!.transition:1;
 const envelope=smooth(elapsed/1100)*(singer?Math.min(1,scene!.strength*1.7):1);
 const intensity=clamp(envelope*cueGain*(o.quality==='balanced'?.5:.78)*
   (o.lyricsProtected?.20:1),0,.78);
 const rate=(next.shot==='portrait'?.72:next.shot==='duet'?.68:
   next.shot==='rest'?.62:next.shot==='ensemble'?.79:.83);
 return {state:next,cue:{active:true,shot:next.shot,variant:next.variant,
   leadSlot:next.leadSlot,act:next.act,cameraRate:rate,strength:intensity,
   reason:singer?'verified-v528-singer':'verified-v604-section'}};
}

/** A tiny cinematic finishing bias; refuse even a slight increase in crop or
 * on-screen overflow. Earlier V633 and the final V351 guard retain authority.
 */
export function composeNaturalCameraV655(pose:Pose,cue:NaturalCameraCueV655,
  anchors:readonly Anchor[],o:Pick<NaturalCameraOptionsV655,'aspect'|'lyricsProtected'|'lyricsSide'|'faceY'>):Pose{
 if(!cue.active||cue.strength<.002||!poseOK(pose)||
   !Array.isArray(anchors)||!anchors.length||anchors.length>4||
   !anchors.every(validAnchor))return pose;
 const side=o.lyricsProtected?o.lyricsSide??null:null;
 const prev=measureConcertFrameV550(pose,anchors,o.aspect,side,o.lyricsProtected,o.faceY??1.55);
 const prevScreen=measureScreenFrameV540(pose,anchors,o.aspect,side);
 if(!prev||!prevScreen)return pose;
 const lead=cue.leadSlot>=0?anchors.find(a=>a.slot===cue.leadSlot):undefined;
 const cx=pose.targetX??0,cz=pose.targetZ??0;
 const direction=cue.variant===0?-1:cue.variant===1?0:1;
 // Do not pan across active captions or invent a face position.
 const bias=o.lyricsProtected?0:direction*.095*cue.strength;
 const follow=lead&&!o.lyricsProtected?(lead.x-cx)*.085*cue.strength:0;
 const drift=clamp(bias+follow,-.12,.12);
 const widen=cue.shot==='ensemble'||cue.shot==='wide'? .36:
   cue.shot==='rest'?.1:cue.shot==='duet'?.16:-.11;
 const fov=clamp(pose.fov+widen*cue.strength,28,76);
 if(Math.abs(drift)<1e-8&&Math.abs(fov-pose.fov)<1e-8)return pose;
 const next:Pose={...pose,x:pose.x+drift,targetX:cx+drift,fov};
 if(!poseOK(next))return pose;
 const after=measureConcertFrameV550(next,anchors,o.aspect,side,o.lyricsProtected,o.faceY??1.55);
 const afterScreen=measureScreenFrameV540(next,anchors,o.aspect,side);
 if(!after||!afterScreen||after.overflow>prev.overflow+1e-6||
   after.headOverflow>prev.headOverflow+1e-6||
   after.fullBodyOverflow>prev.fullBodyOverflow+1e-6||
   afterScreen.overflow>prevScreen.overflow+1e-6)return pose;
 return next;
}
