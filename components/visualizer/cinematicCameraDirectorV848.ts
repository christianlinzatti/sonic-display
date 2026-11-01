/** V848 – Cinematic Camera Director 4.0.
 * Finishes ONLY the verified V528/V797 vocalist or V792 storyboard shot on the
 * existing camera; no beat guessing, second camera, timer, GPU resources or cuts.
 */
import type {CameraPoseV528 as Pose,ConcertSceneV528 as Scene,ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import type {MultiVocalSpotlightCueV797 as VocalCue} from './multiVocalSpotlightDirectorV797';
import type {CameraChoreographyCueV792 as StoryCue} from './smartCameraChoreographyV792';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type ShotModeV848='portrait'|'duet'|'wide'|'off';
export type CameraOptionsV848={trackId:string;progressMs:number;playing:boolean;
 automatic:boolean;authored:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
 aspect:number;lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;faceY?:number|null;
 section:'verse'|'hook'|'drop'|'build'|'break';
};
export type CameraReviewV848={pose:Pose;active:boolean;mode:ShotModeV848;
 reason:'cinematic'|'protected'|'unverified'|'no-improvement';
 participants:readonly number[];dollyRatio:number;pan:number;fovChange:number};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const ease=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
/** Review returns the EXACT input pose when authoring or projection safety rejects a move. */
export function reviewCinematicCameraDirectorV848(pose:Pose,scene:Scene|null|undefined,
 vocal:VocalCue|null|undefined,story:StoryCue|null|undefined,anchors:readonly Anchor[],
 o:CameraOptionsV848):CameraReviewV848{
 const reject=(reason:CameraReviewV848['reason']):CameraReviewV848=>({
  pose,active:false,mode:'off',reason,participants:[],dollyRatio:1,pan:0,fovChange:0});
 if(!o.playing||!o.automatic||o.authored||o.reducedMotion||o.tier==='low')return reject('protected');
 if(!o.trackId||o.trackId.length>180||!finite(o.progressMs)||o.progressMs<0||
    !finite(o.aspect)||o.aspect<.55||o.aspect>3.5||
    ![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite)||
    pose.fov<28||pose.fov>76||!Array.isArray(anchors)||anchors.length<1||anchors.length>4||
    anchors.some(a=>!a.visible||!Number.isInteger(a.slot)||a.slot<0||a.slot>3||
       ![a.x,a.y,a.z].every(n=>finite(n)&&Math.abs(n)<35))||
    new Set(anchors.map(a=>a.slot)).size!==anchors.length)return reject('unverified');
 const tx=pose.targetX??0,ty=pose.targetY,tz=pose.targetZ??0;
 const dx=pose.x-tx,dy=pose.y-ty,dz=pose.z-tz;
 const dist=Math.hypot(dx,dy,dz);
 if(dist<1||dz<.6||Math.abs(dx)>dz*.75)return reject('unverified');
 let mode:ShotModeV848='off';let selected:Anchor[]=[];let gain=0;
 const sceneValid=!!scene?.active&&scene.trackId===o.trackId&&
   finite(scene.cueStartMs)&&finite(scene.cueEndMs)&&scene.cueStartMs>=0&&
   scene.cueEndMs>scene.cueStartMs&&
   o.progressMs>=scene.cueStartMs&&o.progressMs<scene.cueEndMs&&
   Number.isInteger(scene.count)&&scene.count>=2&&scene.count<=4&&
   Number.isInteger(scene.leadSlot)&&scene.leadSlot>=0&&scene.leadSlot<scene.count&&
   finite(scene.strength)&&scene.strength>0&&scene.strength<=.8&&
   Array.isArray(scene.singingSlots)&&scene.singingSlots.length>=1&&
   scene.singingSlots.length<=scene.count&&
   new Set(scene.singingSlots).size===scene.singingSlots.length&&
   scene.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<scene.count)&&
   scene.singingSlots.includes(scene.leadSlot);
 const vocalValid=sceneValid&&!!vocal?.active&&vocal.cameraActive&&
   vocal.trackId===o.trackId&&vocal.leadSlot===scene!.leadSlot&&
   finite(vocal.cameraWeight)&&vocal.cameraWeight>0&&vocal.cameraWeight<=.256&&
   Array.isArray(vocal.activeSlots)&&vocal.activeSlots.length>0&&
   new Set(vocal.activeSlots).size===vocal.activeSlots.length;
 // The storyboard is already produced from V790's verified track-specific scene.
 // A drop section alone is NOT evidence; V792 has to confirm its own shot intent.
 const wideValid=o.section==='drop'&&!!story?.active&&story.reason==='verified-scene'&&
   (story.move==='dolly-out'||story.move==='crane')&&
   Number.isInteger(story.sceneIndex)&&story.sceneIndex>=0&&
   finite(story.weight)&&story.weight>0&&story.weight<=.82&&
   finite(story.phase)&&story.phase>=0&&story.phase<=1;
 if(wideValid){
   mode='wide';selected=anchors.slice();
   gain=story!.weight*(o.tier==='balanced'?.43:.72)*
     ease(Math.min(story!.phase,1-story!.phase)/.16);
 }else if(vocalValid&&!o.lyricsProtected){
   let slots:number[]=[];
   if(scene!.focus==='handoff'&&vocal!.mode==='handoff'&&
      scene!.singingSlots.length===1&&scene!.handoffFrom!==null&&
      Number.isInteger(scene!.handoffFrom)&&scene!.handoffFrom>=0&&
      scene!.handoffFrom<scene!.count&&scene!.handoffFrom!==scene!.leadSlot&&
      vocal!.partnerSlot===scene!.handoffFrom){
     mode='duet';slots=[scene!.leadSlot,scene!.handoffFrom];
   }else if(scene!.focus==='lead'&&vocal!.mode==='duet'&&
      scene!.singingSlots.length===2&&vocal!.partnerSlot!==null&&
      scene!.singingSlots.includes(vocal!.partnerSlot)&&vocal!.partnerSlot!==scene!.leadSlot){
     mode='duet';slots=[...scene!.singingSlots];
   }else if(scene!.focus==='lead'&&vocal!.mode==='solo'&&scene!.singingSlots.length===1&&
      vocal!.partnerSlot===null){
     mode='portrait';slots=[scene!.leadSlot];
   }
   if(mode!=='off'&&vocal!.activeSlots.length===slots.length&&
      slots.every(s=>vocal!.activeSlots.includes(s))&&
      vocal!.activeSlots.every(s=>slots.includes(s))){
      selected=slots.map(s=>anchors.find(a=>a.slot===s)).filter((a):a is Anchor=>!!a);
      if(selected.length!==slots.length)return reject('unverified');
      const entry=ease((o.progressMs-scene!.cueStartMs)/650);
      const exit=ease((scene!.cueEndMs-o.progressMs)/720);
      gain=scene!.strength*vocal!.cameraWeight*(o.tier==='balanced'?.66:1.1)*entry*exit;
   }else mode='off';
 }
 if(mode==='off'||selected.length===0)return reject('unverified');
 if(gain<.00005)return reject('no-improvement');
 const side=o.lyricsProtected?o.lyricsSide??null:null;
 const faceY=finite(o.faceY)?clamp(o.faceY,.7,2.7):1.55;
 const frame=(p:Pose,a:readonly Anchor[])=>measureConcertFrameV550(p,a,o.aspect,side,o.lyricsProtected,faceY);
 const screen=(p:Pose,a:readonly Anchor[])=>measureScreenFrameV540(p,a,o.aspect,side);
 const before=frame(pose,selected),beforeScreen=screen(pose,selected);
 const singles=selected.map(a=>frame(pose,[a]));
 if(!before||!beforeScreen||singles.some(x=>!x))return reject('unverified');
 const center=selected.reduce((sum,a)=>sum+a.x,0)/selected.length;
 // Keep lead prominent for portraits. For duets, use a slow two-shot drift;
 // wide shots emphasize the established stage center without panning past the cast.
 const phase=mode==='wide'?story!.phase:
   (o.progressMs-scene!.cueStartMs)/(scene!.cueEndMs-scene!.cueStartMs);
 const drift=mode==='duet'?.075*Math.sin(phase*Math.PI*2):
   mode==='wide'?.05*Math.sin(phase*Math.PI*2):0;
 const pan=clamp((center-tx)*gain*(mode==='portrait'?.26:.16)+drift*gain,-.075,.075);
 const ratio=mode==='wide'?1+.09*gain:mode==='duet'?1+.035*gain:1-.055*gain;
 const fov=mode==='wide'?.9*gain:mode==='duet'?.22*gain:-.36*gain;
 // Only a tiny shot finish; existing camera alpha provides the natural travel.
 for(const fraction of [1,.5,.2]){
   const newX=tx+pan*fraction,scale=1+(ratio-1)*fraction;
   const candidate:Pose={...pose,targetX:newX,
      x:newX+dx*scale,y:ty+dy*scale,z:tz+dz*scale,
      fov:clamp(pose.fov+fov*fraction,28,76)};
   const after=frame(candidate,selected),afterScreen=screen(candidate,selected);
   const afterSingles=selected.map(a=>frame(candidate,[a]));
   const eps=1e-7;
   if(!after||!afterScreen||afterSingles.some(x=>!x)||
      after.overflow>before.overflow+eps||
      after.headOverflow>before.headOverflow+eps||
      after.fullBodyOverflow>before.fullBodyOverflow+eps||
      afterScreen.overflow>beforeScreen.overflow+eps||
      afterSingles.some((a,i)=>a!.overflow>singles[i]!.overflow+eps||
         a!.headOverflow>singles[i]!.headOverflow+eps||
         a!.fullBodyOverflow>singles[i]!.fullBodyOverflow+eps))continue;
   return {pose:candidate,active:true,mode,reason:'cinematic',
      participants:selected.map(a=>a.slot),dollyRatio:scale,pan:pan*fraction,fovChange:candidate.fov-pose.fov};
 }
 return reject('no-improvement');
}
export function composeCinematicCameraDirectorV848<T extends Pose>(pose:T,
 scene:Scene|null|undefined,vocal:VocalCue|null|undefined,
 story:StoryCue|null|undefined,anchors:readonly Anchor[],o:CameraOptionsV848):T{
 return reviewCinematicCameraDirectorV848(pose,scene,vocal,story,anchors,o).pose as T;
}
