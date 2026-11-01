/** V806 – safe, evidence-bound multi-performer framing on the EXISTING R3F camera.
 * Root positions are sampled from real visible stage slots; shoulder/face/feet
 * extents remain V550's approximations, NOT rendered-GLB occlusion evidence.
 * The V805 geometry inspector is still the separate, read-only visual review.
 */
import type {CameraPoseV528 as Pose,ConcertSceneV528 as Scene,ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';
import type {MultiVocalSpotlightCueV797 as VocalCue} from './multiVocalSpotlightDirectorV797';

export type EnsembleCameraOptionsV806={
 trackId:string;progressMs:number;playing:boolean;automatic:boolean;
 authored:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
 aspect:number;lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;
 faceY?:number|null;
};
export type EnsembleCameraReviewV806={
 verified:boolean;slots:readonly number[];risk:'unverified'|'clipped'|'crowded'|'clear';
 overflow:number;headOverflow:number;bodyOverflow:number;horizontalOverflow:number;
};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
function selectV806(scene:Scene|null|undefined,anchors:readonly Anchor[],o:EnsembleCameraOptionsV806):Anchor[]|null{
 if(!scene?.active||scene.focus==='none'||scene.focus==='drop'||
   !o.playing||!o.automatic||o.authored||o.reducedMotion||o.tier==='low'||
   !o.trackId||scene.trackId!==o.trackId||!finite(o.progressMs)||
   !finite(scene.cueStartMs)||!finite(scene.cueEndMs)||scene.cueStartMs<0||
   scene.cueEndMs<=scene.cueStartMs||o.progressMs<scene.cueStartMs||o.progressMs>=scene.cueEndMs||
   !finite(scene.strength)||scene.strength<=0||scene.strength>1||
   !Number.isInteger(scene.count)||scene.count<2||scene.count>4||
   !Number.isInteger(scene.leadSlot)||scene.leadSlot<0||scene.leadSlot>=scene.count||
   !Array.isArray(scene.singingSlots)||!Array.isArray(anchors)||
   scene.singingSlots.length<1||scene.singingSlots.length>scene.count||
   new Set(scene.singingSlots).size!==scene.singingSlots.length||
   !scene.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<scene.count)||
   !scene.singingSlots.includes(scene.leadSlot)||
   (scene.focus==='ensemble'&&scene.singingSlots.length!==scene.count)||
   (scene.focus==='handoff'&&(scene.handoffFrom===null||
     !Number.isInteger(scene.handoffFrom)||scene.handoffFrom<0||
     scene.handoffFrom>=scene.count||scene.handoffFrom===scene.leadSlot))||
   !finite(o.aspect)||o.aspect<.55||o.aspect>3.5)return null;
 const slots=scene.focus==='ensemble'?[...scene.singingSlots]:
   scene.focus==='handoff'?[scene.leadSlot,scene.handoffFrom!]:[...scene.singingSlots];
 if(slots.length<2||slots.length>4)return null; // Solo never gets a synthetic partner.
 if(slots.some(slot=>anchors.filter(a=>a.slot===slot).length!==1))return null;
 const roots=slots.map(slot=>anchors.find(a=>a.slot===slot&&a.visible&&
   [a.x,a.y,a.z].every(v=>finite(v)&&Math.abs(v)<35)));
 if(roots.some(a=>!a)||new Set(roots.map(a=>a!.slot)).size!==slots.length)return null;
 return roots as Anchor[];
}
function measureV806(pose:Pose,roots:readonly Anchor[],o:EnsembleCameraOptionsV806){
 const side=o.lyricsProtected?o.lyricsSide??null:null;
 const faceY=finite(o.faceY)?clamp(o.faceY,1,2.3):1.55;
 const frame=measureConcertFrameV550(pose,roots,o.aspect,side,o.lyricsProtected,faceY);
 const screen=measureScreenFrameV540(pose,roots,o.aspect,side);
 const singles=roots.map(root=>measureConcertFrameV550(pose,[root],o.aspect,side,o.lyricsProtected,faceY));
 if(!frame||!screen||singles.some(f=>!f))return null;
 return {frame,screen,singles:singles as NonNullable<typeof frame>[],
   center:(frame.left+frame.right)/2,preferred:(frame.safeLeft+frame.safeRight)/2,
   width:frame.right-frame.left};
}
/** Diagnostics based on real slot roots but estimated body extents; no promise of
 * genuine 3D face occlusion, collision or pixel-level lyrics visibility. */
export function inspectEnsembleCameraV806(pose:Pose,scene:Scene|null|undefined,
 anchors:readonly Anchor[],o:EnsembleCameraOptionsV806):EnsembleCameraReviewV806{
 const roots=selectV806(scene,anchors,o);
 const measured=roots&&measureV806(pose,roots,o);
 if(!roots||!measured)return {verified:false,slots:[],risk:'unverified',overflow:0,
   headOverflow:0,bodyOverflow:0,horizontalOverflow:0};
 const {frame,screen,width}=measured;
 return {verified:true,slots:roots.map(a=>a.slot),
  risk:frame.overflow>.0001||screen.overflow>.0001?'clipped':width>1.35?'crowded':'clear',
  overflow:frame.overflow,headOverflow:frame.headOverflow,
  bodyOverflow:frame.fullBodyOverflow,horizontalOverflow:screen.overflow};
}
/** Small pure finish after V797; V351 performs the final caption guard.
 * Evaluates the WHOLE group and every participant, never sacrifices an edge
 * singer to improve a lead close-up. Fail closed on uncertain projection.
 */
function calculateV806(pose:Pose,scene:Scene|null|undefined,
 anchors:readonly Anchor[],o:EnsembleCameraOptionsV806):Pose{
 const roots=selectV806(scene,anchors,o);
 if(!roots||!scene)return pose;
 const base=measureV806(pose,roots,o);
 if(!base)return pose;
 const tx=pose.targetX??0,ty=pose.targetY,tz=pose.targetZ??0;
 const dx=pose.x-tx,dy=pose.y-ty,dz=pose.z-tz;
 const distance=Math.hypot(dx,dy,dz);
 if(distance<1||dz<=.5||Math.abs(dx)>Math.abs(dz)*.75||pose.fov<28||pose.fov>76)return pose;
 const midpoint=(Math.min(...roots.map(a=>a.x))+Math.max(...roots.map(a=>a.x)))/2;
 const imbalance=Math.abs(base.center-base.preferred);
 const requiresSpace=base.frame.overflow>.00001||base.screen.overflow>.00001||base.width>1.27;
 if(!requiresSpace&&imbalance<.09)return pose;
 // Exact zero at both cue boundaries; stage camera V784 applies its normal easing.
 const envelope=smooth((o.progressMs-scene.cueStartMs)/600)*
   smooth((scene.cueEndMs-o.progressMs)/540);
 const gain=scene.strength*(o.tier==='balanced'?.35:.65)*envelope*
   (o.lyricsProtected?.52:1);
 if(gain<.001)return pose;
 const shift=clamp(midpoint-tx,-1.4,1.4)*gain*.38;
 const need=requiresSpace?clamp(base.width/1.3-1,0,.28):0;
 const widen=clamp((need+Math.max(base.frame.overflow,base.screen.overflow)*.14)*gain,0,.11);
 // Bounded: no hard cut, no camera reset, and no new graphics resources.
 for(const fraction of [1,.55,.25]){
   const targetX=tx+shift*fraction;
   const scale=1+widen*fraction;
   const candidate:Pose={...pose,targetX,
     x:targetX+dx*scale,y:ty+dy*scale,z:tz+dz*scale,
     fov:pose.fov};
   const next=measureV806(candidate,roots,o);
   if(!next)continue;
   const tolerance=1e-6;
   if(next.frame.overflow>base.frame.overflow+tolerance||
      next.frame.headOverflow>base.frame.headOverflow+tolerance||
      next.frame.fullBodyOverflow>base.frame.fullBodyOverflow+tolerance||
      next.screen.overflow>base.screen.overflow+tolerance||
      next.singles.some((f,i)=>f.overflow>base.singles[i].overflow+tolerance||
        f.headOverflow>base.singles[i].headOverflow+tolerance||
        f.fullBodyOverflow>base.singles[i].fullBodyOverflow+tolerance))continue;
   const improved=next.frame.overflow<base.frame.overflow-tolerance||
     next.screen.overflow<base.screen.overflow-tolerance||
     Math.abs(next.center-next.preferred)<imbalance-.00005||
     next.width<base.width-.00005;
   if(improved)return candidate;
 }
 return pose;
}

/** Detailed read-only decision: no score is a screenshot or V805 GLB measurement. */
export type EnsembleCameraDecisionV806={pose:Pose;review:{active:boolean;reason:'corrected'|'unverified'|'protected'|'already-safe';
 selectedSlots:readonly number[];beforeBalance:number;afterBalance:number;considered:number}};
export function reviewEnsembleCameraV806(pose:Pose,cue:VocalCue|undefined,
 scene:Scene|null|undefined,anchors:readonly Anchor[],o:EnsembleCameraOptionsV806):EnsembleCameraDecisionV806{
 const fail=(reason:'unverified'|'protected'|'already-safe',slots:readonly number[]=[]):EnsembleCameraDecisionV806=>({
  pose,review:{active:false,reason,selectedSlots:slots,beforeBalance:0,afterBalance:0,considered:0}});
 if(!o.automatic||o.authored||!o.playing||o.reducedMotion||o.tier==='low'||o.lyricsProtected)
  return fail('protected');
 const roots=selectV806(scene,anchors,o);
 if(!cue?.active||!cue.cameraActive||!['duet','ensemble','handoff'].includes(cue.mode)||
   cue.trackId!==o.trackId||cue.trackId!==scene?.trackId||
   !finite(cue.cameraWeight)||cue.cameraWeight<=0||cue.cameraWeight>.256||
   !roots||cue.leadSlot!==scene?.leadSlot||
   !Array.isArray(cue.activeSlots)||cue.activeSlots.length!==roots.length||
   new Set(cue.activeSlots).size!==cue.activeSlots.length||
   cue.activeSlots.some(slot=>!roots.some(root=>root.slot===slot)))return fail('unverified');
 const first=measureV806(pose,roots,o);
 if(!first)return fail('unverified');
 const corrected=calculateV806(pose,scene,anchors,o);
 const last=measureV806(corrected,roots,o);
 if(!last)return fail('unverified');
 const beforeBalance=Math.abs(first.center-first.preferred);
 const afterBalance=Math.abs(last.center-last.preferred);
 return {pose:corrected,review:{active:corrected!==pose,reason:corrected!==pose?'corrected':'already-safe',
  selectedSlots:roots.map(a=>a.slot),beforeBalance,afterBalance,considered:roots.length}};
}
export function composeIntelligentEnsembleCameraV806(pose:Pose,cue:VocalCue|undefined,
 scene:Scene|null|undefined,anchors:readonly Anchor[],o:EnsembleCameraOptionsV806):Pose{
 return reviewEnsembleCameraV806(pose,cue,scene,anchors,o).pose;
}
