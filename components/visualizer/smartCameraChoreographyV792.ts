/** V792 — music-driven camera choreography on the VERIFIED V790/V761 scene clock.
 * Pure per-position cue + collision/lyrics-aware composition in the existing R3F
 * camera. No independent timer, singer inference, hard cuts or render objects.
 */
import type {ShowPlanV790,ShowCueV790} from './cinematicShowDirectorV790';
import type {CameraPoseV528 as Pose,ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type CameraMoveV792='dolly-in'|'dolly-out'|'crane'|'arc-left'|'arc-right'|'off';
export type CameraChoreographyCueV792={active:boolean;sceneIndex:number;move:CameraMoveV792;
  weight:number;phase:number;reason:'verified-scene'|'off'};
export type CameraChoreographyInputV792={trackId:string;durationMs:number;positionMs:number;
  playing:boolean;enabled:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
  manualCamera:boolean;lyricsProtected:boolean;show:ShowCueV790};
export type CameraChoreographyFrameV792={aspect:number;lyricsProtected:boolean;
  lyricsSide?:'left'|'right'|null;faceY?:number|null;leadSlot?:number};
const OFF:Readonly<CameraChoreographyCueV792>=Object.freeze({
  active:false,sceneIndex:-1,move:'off',weight:0,phase:0,reason:'off',
});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(x:number,min:number,max:number)=>Math.min(max,Math.max(min,x));
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const round=(n:number)=>Math.round(n*100000)/100000;

/** Shot intent comes from verified storyboard scenes, not inferred beats or artists.
 * Fade to exact zero at every edge: even a seek or adjacent scene cannot create
 * an abrupt camera displacement. The existing V791 ease handles shot handoffs.
 */
export function sampleSmartCameraChoreographyV792(plan:ShowPlanV790,
  input:CameraChoreographyInputV792):CameraChoreographyCueV792{
  const cue=input.show;
  if(!input.enabled||!input.playing||input.reducedMotion||input.manualCamera||
    input.tier==='low'||!cue?.active||cue.reason!=='verified-show'||
    plan.source!=='verified-storyboard'||!input.trackId||input.trackId!==plan.trackId||
    input.durationMs!==plan.durationMs||!finite(input.durationMs)||input.durationMs<=0||
    !finite(input.positionMs)||input.positionMs<0||input.positionMs>=input.durationMs||
    !Number.isInteger(cue.sceneIndex)||cue.sceneIndex<0||cue.sceneIndex>=plan.scenes.length)return OFF;
  const scene=plan.scenes[cue.sceneIndex];
  if(!scene||scene.index!==cue.sceneIndex||scene.actIndex!==cue.actIndex||
    scene.intent!==cue.intent||scene.moment!==cue.moment||
    !finite(scene.startMs)||!finite(scene.endMs)||scene.endMs-scene.startMs<2400||
    scene.startMs<0||scene.endMs>plan.durationMs||
    input.positionMs<scene.startMs||input.positionMs>=scene.endMs||
    !finite(cue.blend)||cue.blend<0||cue.blend>1)return OFF;
  const duration=scene.endMs-scene.startMs;
  const t=(input.positionMs-scene.startMs)/duration;
  const fadeMs=Math.min(2200,duration*.24);
  const envelope=smooth(Math.min(input.positionMs-scene.startMs,scene.endMs-input.positionMs)/fadeMs);
  // Keep singer/lyrics readable and use only a restrained portion of the
  // available automatic camera headroom, even during the main climax.
  const tierScale=input.tier==='balanced'?.46:.74;
  const lyricScale=input.lyricsProtected?.32:1;
  const emphasis=scene.moment==='payoff'?1.12:scene.moment==='breath'?.55:
    scene.moment==='anticipate'?.88:1;
  const weight=round(clamp(tierScale*lyricScale*emphasis*envelope*cue.blend,0,.82));
  let move:CameraMoveV792;
  switch(scene.intent){
    case 'portrait':move='dolly-in';break;
    case 'dialogue':move=scene.variation<.9?'arc-right':'arc-left';break;
    case 'ensemble':move='crane';break;
    case 'wide':move='dolly-out';break;
    case 'rise':move='crane';break;
    case 'pulse':move=scene.index%2?'arc-left':'arc-right';break;
    case 'breath':move='dolly-out';break;
    default:return OFF;
  }
  return {active:weight>.00001,sceneIndex:scene.index,move,weight,phase:round(t),
    reason:'verified-scene'};
}

const poseOK=(p:Pose)=>[p.x,p.y,p.z,p.targetX??0,p.targetY,p.targetZ??0,p.fov]
  .every(finite)&&p.fov>=28&&p.fov<=76;
const anchorsOK=(anchors:readonly Anchor[])=>Array.isArray(anchors)&&anchors.length>0&&
  anchors.length<=4&&anchors.every(a=>a.visible&&Number.isInteger(a.slot)&&
    a.slot>=0&&a.slot<4&&[a.x,a.y,a.z].every(v=>finite(v)&&Math.abs(v)<40))&&
  new Set(anchors.map(a=>a.slot)).size===anchors.length;
/** Apply a tiny orbital/dolly/crane vector AFTER singer focus/variety and BEFORE
 * V351 final composition guard. Compare actual stage anchors with the unmodified
 * pose; reject any change that worsens full-body/head or screen-lyrics safety.
 */
export function composeSmartCameraChoreographyV792(pose:Pose,cue:CameraChoreographyCueV792,
  anchors:readonly Anchor[],o:CameraChoreographyFrameV792):Pose{
  if(!cue?.active||cue.reason!=='verified-scene'||cue.move==='off'||
    !finite(cue.weight)||cue.weight<=0||cue.weight>.82||
    !finite(cue.phase)||cue.phase<0||cue.phase>1||!poseOK(pose)||!anchorsOK(anchors)||
    !finite(o.aspect)||o.aspect<.55||o.aspect>3.5)return pose;
  const side=o.lyricsProtected?o.lyricsSide??null:null;
  const faceY=finite(o.faceY)?clamp(o.faceY,1.1,2.4):1.55;
  const base=measureConcertFrameV550(pose,anchors,o.aspect,side,o.lyricsProtected,faceY);
  const baseScreen=measureScreenFrameV540(pose,anchors,o.aspect,side);
  if(!base||!baseScreen)return pose;
  const lead=Number.isInteger(o.leadSlot)?anchors.find(a=>a.slot===o.leadSlot):undefined;
  const baseLead=lead?measureConcertFrameV550(pose,[lead],o.aspect,side,o.lyricsProtected,faceY):null;
  const tx=pose.targetX??0,ty=pose.targetY,tz=pose.targetZ??0;
  const dx=pose.x-tx,dy=pose.y-ty,dz=pose.z-tz;
  if(Math.hypot(dx,dy,dz)<.5||dz<=.5||Math.abs(dx)>Math.abs(dz)*.8)return pose;
  const sweep=2*cue.phase-1;
  let shift=0,lift=0,dolly=0,fov=0;
  switch(cue.move){
    case 'dolly-in': dolly=-.075;fov=-.36;break;
    case 'dolly-out': dolly=.075;fov=.50;break;
    case 'crane': lift=.14;dolly=.015;fov=.22;break;
    case 'arc-left':shift=-.21*sweep;fov=.12;break;
    case 'arc-right':shift=.21*sweep;fov=.12;break;
  }
  // Suppress side travels when captions are protected. Changing depth only
  // is gentler than parallax across the lyrics safe region.
  if(o.lyricsProtected)shift=0;
  for(const fraction of [1,.65,.3]){
    const w=cue.weight*fraction;
    const targetX=tx+shift*w,targetY=ty+lift*w;
    const scale=1+dolly*w;
    const candidate:Pose={...pose,targetX,targetY,
      x:targetX+dx*scale,y:targetY+dy*scale,z:tz+dz*scale,
      fov:clamp(pose.fov+fov*w,28,76)};
    if(!poseOK(candidate))continue;
    const measure=measureConcertFrameV550(candidate,anchors,o.aspect,side,o.lyricsProtected,faceY);
    const screen=measureScreenFrameV540(candidate,anchors,o.aspect,side);
    const leadFrame=lead?measureConcertFrameV550(candidate,[lead],o.aspect,side,o.lyricsProtected,faceY):null;
    if(!measure||!screen||
      measure.overflow>base.overflow+1e-6||
      measure.headOverflow>base.headOverflow+1e-6||
      measure.fullBodyOverflow>base.fullBodyOverflow+1e-6||
      screen.overflow>baseScreen.overflow+1e-6||
      (baseLead&&(!leadFrame||leadFrame.headOverflow>baseLead.headOverflow+1e-6)))continue;
    return candidate;
  }
  return pose;
}
