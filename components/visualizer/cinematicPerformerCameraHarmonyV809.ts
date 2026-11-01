/** V809 – camera harmony for REAL, verified V807/V808 duet, handoff and hook moments.
 * Runs after the existing V806 ensemble camera and before V351's final lyrics guard.
 * Uses the sampled V377 stage roots (including safe V808 depth travel), not guessed
 * performer positions. No scene mutation, React state, camera allocation or GPU work.
 */
import type {CameraPoseV528 as Pose,ConcertSceneV528 as Scene,ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import type {MultiVocalSpotlightCueV797 as Cue} from './multiVocalSpotlightDirectorV797';
import type {EnsembleCameraOptionsV806 as Options} from './intelligentEnsembleCameraV806';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const ease=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
export type CameraHarmonyReviewV809={
 pose:Pose;active:boolean;reason:'harmonized'|'protected'|'unverified'|'no-improvement';
 mode:'duet'|'handoff'|'ensemble'|'off';participants:readonly number[];
 aimShift:number;dollyChange:number;
};
/** The scene is the song-bound V528 evidence, the cue is the separately
 * validated V797 vocalist focus; BOTH must agree on participating performers.
 */
export function reviewCinematicPerformerHarmonyV809(pose:Pose,cue:Cue|undefined,
 scene:Scene|null|undefined,anchors:readonly Anchor[],o:Options):CameraHarmonyReviewV809{
 const fail=(reason:CameraHarmonyReviewV809['reason']):CameraHarmonyReviewV809=>({
  pose,active:false,reason,mode:'off',participants:[],aimShift:0,dollyChange:0});
 if(!o.playing||!o.automatic||o.authored||o.reducedMotion||o.tier==='low'||o.lyricsProtected)
  return fail('protected');
 if(!o.trackId||o.trackId.length>180||!scene?.active||!cue?.active||!cue.cameraActive||
    scene.trackId!==o.trackId||cue.trackId!==o.trackId||
    !finite(o.progressMs)||!finite(scene.cueStartMs)||!finite(scene.cueEndMs)||
    scene.cueStartMs<0||scene.cueEndMs<=scene.cueStartMs||
    o.progressMs<scene.cueStartMs||o.progressMs>=scene.cueEndMs||
    !finite(scene.strength)||scene.strength<=0||scene.strength>1||
    !finite(cue.cameraWeight)||cue.cameraWeight<=0||cue.cameraWeight>.256||
    !finite(o.aspect)||o.aspect<.55||o.aspect>3.5||
    !Number.isInteger(scene.count)||scene.count<2||scene.count>4||
    !Number.isInteger(scene.leadSlot)||scene.leadSlot<0||scene.leadSlot>=scene.count||
    !Array.isArray(scene.singingSlots)||scene.singingSlots.length<1||
    scene.singingSlots.length>scene.count||
    new Set(scene.singingSlots).size!==scene.singingSlots.length||
    scene.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=scene.count)||
    !scene.singingSlots.includes(scene.leadSlot)||
    cue.leadSlot!==scene.leadSlot||!Array.isArray(cue.activeSlots)||
    ![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite)||
    pose.fov<28||pose.fov>76||!Array.isArray(anchors))return fail('unverified');
 let slots:readonly number[];
 let mode:'duet'|'handoff'|'ensemble';
 if(scene.focus==='ensemble'&&cue.mode==='ensemble'&&scene.count>=3&&
    scene.singingSlots.length===scene.count){slots=scene.singingSlots;mode='ensemble';}
 else if(scene.focus==='handoff'&&cue.mode==='handoff'&&scene.handoffFrom!==null&&
    cue.partnerSlot===scene.handoffFrom&&
    Number.isInteger(scene.handoffFrom)&&scene.handoffFrom>=0&&
    scene.handoffFrom<scene.count&&scene.handoffFrom!==scene.leadSlot&&
    scene.singingSlots.length===1){slots=[scene.leadSlot,scene.handoffFrom];mode='handoff';}
 else if(scene.focus==='lead'&&cue.mode==='duet'&&scene.singingSlots.length===2&&
    cue.partnerSlot===scene.singingSlots.find(s=>s!==scene.leadSlot)){
    slots=scene.singingSlots;mode='duet';}
 else return fail('unverified');
 if(slots.length<2||slots.length>4||new Set(slots).size!==slots.length||
    cue.activeSlots.length!==slots.length||new Set(cue.activeSlots).size!==slots.length||
    cue.activeSlots.some(s=>!slots.includes(s)))return fail('unverified');
 const roots=slots.map(s=>{
  const matches=anchors.filter(a=>a.slot===s);
  return matches.length===1&&matches[0].visible&&
    [matches[0].x,matches[0].y,matches[0].z].every(n=>finite(n)&&Math.abs(n)<35)
   ?matches[0]:null;
 });
 if(roots.some(a=>!a))return fail('unverified');
 const participants=roots as Anchor[];
 const lead=participants.find(a=>a.slot===scene.leadSlot)!;
 const center=participants.reduce((sum,a)=>sum+a.x,0)/participants.length;
 const span=Math.max(...participants.map(a=>a.x))-Math.min(...participants.map(a=>a.x));
 if(span>13||Math.abs(lead.x-center)>8)return fail('unverified');
 const duration=scene.cueEndMs-scene.cueStartMs;
 // V807 gaze motifs settle at ~340 ms; V808 stage positions settle after 540 ms.
 // Match the SLOWER 540/640 ms boundaries to avoid a camera snap or foot travel rush.
 const envelope=ease((o.progressMs-scene.cueStartMs)/540)*
   ease((scene.cueEndMs-o.progressMs)/640);
 const gain=clamp(scene.strength,0,.8)*(o.tier==='balanced'?.55:.85)*envelope;
 if(gain<.00001)return fail('no-improvement');
 const phase=clamp((o.progressMs-scene.cueStartMs)/Math.max(1,duration),0,1);
 // Duets retain lead attention but relax to mutual framing during the V807
 // lead -> partner gaze moment. Handoffs gently transfer attention to new lead.
 const glance=mode==='duet'?ease(1-Math.abs((((o.progressMs-scene.cueStartMs)%2650)+2650)%2650/2650-.56)/.22):0;
 const bias=mode==='duet'?.18*(1-.6*glance):mode==='handoff'?.10*ease(phase*2):0;
 const desired=center+(lead.x-center)*bias;
 const tx=pose.targetX??0,ty=pose.targetY,tz=pose.targetZ??0;
 const dx=pose.x-tx,dy=pose.y-ty,dz=pose.z-tz;
 const distance=Math.hypot(dx,dy,dz);
 if(distance<1||dz<=.5||Math.abs(dx)>Math.abs(dz)*.75)return fail('unverified');
 // Tiny steering only. Hooks may open the lens slightly without altering FOV.
 const shift=clamp((desired-tx)*gain*.35,-.115,.115);
 const dolly=mode==='ensemble'?clamp((span/7.5-.6)*gain*.08,0,.028):0;
 if(Math.abs(shift)<.00005&&dolly<.00005)return fail('no-improvement');
 const side=o.lyricsSide??null,faceY=finite(o.faceY)?clamp(o.faceY,1,2.3):1.55;
 const frame=(p:Pose)=>measureConcertFrameV550(p,participants,o.aspect,side,false,faceY);
 const screen=(p:Pose)=>measureScreenFrameV540(p,participants,o.aspect,side);
 const before=frame(pose),beforeScreen=screen(pose);
 const beforeSingles=participants.map(a=>measureConcertFrameV550(pose,[a],o.aspect,side,false,faceY));
 if(!before||!beforeScreen||beforeSingles.some(f=>!f))return fail('unverified');
 // Reject ANY candidate worsening estimated face/feet/side screen safety, even
 // a change which would look more exciting in a plan-only quality score.
 for(const fraction of [1,.5,.2]){
  const delta=shift*fraction;const scale=1+dolly*fraction;const nextX=tx+delta;
  const candidate:Pose={...pose,targetX:nextX,x:nextX+dx*scale,
    y:ty+dy*scale,z:tz+dz*scale};
  const after=frame(candidate),afterScreen=screen(candidate);
  const singles=participants.map(a=>measureConcertFrameV550(candidate,[a],o.aspect,side,false,faceY));
  if(!after||!afterScreen||singles.some(f=>!f))continue;
  const epsilon=1e-7;
  if(after.overflow>before.overflow+epsilon||
     after.headOverflow>before.headOverflow+epsilon||
     after.fullBodyOverflow>before.fullBodyOverflow+epsilon||
     afterScreen.overflow>beforeScreen.overflow+epsilon||
     singles.some((f,i)=>f!.overflow>beforeSingles[i]!.overflow+epsilon||
       f!.headOverflow>beforeSingles[i]!.headOverflow+epsilon||
       f!.fullBodyOverflow>beforeSingles[i]!.fullBodyOverflow+epsilon))continue;
  return {pose:candidate,active:true,reason:'harmonized',mode,
    participants:slots,aimShift:delta,dollyChange:scale-1};
 }
 return fail('no-improvement');
}
export function composeCinematicPerformerHarmonyV809(pose:Pose,cue:Cue|undefined,
 scene:Scene|null|undefined,anchors:readonly Anchor[],o:Options):Pose{
 return reviewCinematicPerformerHarmonyV809(pose,cue,scene,anchors,o).pose;
}
