/** V898 – Dance & Camera Coordination.
 * A bounded, PURE finishing pass on the SAME R3F camera. Uses only verified
 * V604/V895 scenes and actual sampled V377 stage-root positions (1–4).
 * It cannot identify dancers/singers, detect footwork or manufacture solos.
 * Existing V550/V540 head/foot/lyrics framing must not become worse.
 */
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';
import type {CameraPlanV897,CameraPoseV897} from './cinematicCameraDirectorV897';

export type DanceCameraStyleV898='subtle'|'cinematic'|'dynamic';
export type DanceCameraModeV898='auto'|'solo'|'duet'|'ensemble';
export type DanceCameraShotV898=Exclude<DanceCameraModeV898,'auto'>;
export interface DanceCameraSettingsV898 {
 enabled:boolean;style:DanceCameraStyleV898;mode:DanceCameraModeV898;
 intensity:number;solo:boolean;duet:boolean;ensemble:boolean;
 motionFollow:boolean;protectLyrics:boolean;protectDuets:boolean;
}
export const DANCE_CAMERA_KEY_V898='sonic-dance-camera-coordination-v898';
export const DEFAULT_DANCE_CAMERA_V898:Readonly<DanceCameraSettingsV898>={
 enabled:true,style:'cinematic',mode:'auto',intensity:50,
 solo:true,duet:true,ensemble:true,motionFollow:true,
 protectLyrics:true,protectDuets:true,
};
export type DanceCameraAnchorV898={slot:number;x:number;y:number;z:number;visible:boolean};
export type DanceCameraReviewV898={active:boolean;mode:DanceCameraShotV898|null;
 reason:'coordinated'|'off'|'unverified'|'protected'|'unsafe';
 pose:CameraPoseV897;gain:number;cameraRate:number;sceneIndex:number;visibleSlots:readonly number[];
 motion:number};
export interface DanceCameraInputV898 {
 pose:CameraPoseV897;plan?:CameraPlanV897|null;settings:DanceCameraSettingsV898;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;
 autoEnabled:boolean;directorEnabled:boolean;cameraEnabled:boolean;danceEnabled:boolean;
 reducedMotion:boolean;tier:'low'|'balanced'|'high';aspect:number;
 anchors:readonly DanceCameraAnchorV898[];anchorAgeMs:number;motion:number;
 manualFx?:boolean;manualCamera?:boolean;manualDance?:boolean;authored?:boolean;
 seekBlocked?:boolean;blackout?:boolean;lyricsProtected?:boolean;lyricsVisible?:boolean;
 lyricsSide?:'left'|'right'|null;faceY?:number|null;
 /** Track-bound V528 singing slots are an optional *verified* framing hint. */
 verifiedLeadSlot?:number|null;verifiedSingingSlots?:readonly number[]|null;
}
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const smooth=(t:number)=>{const v=clamp(t,0,1);return v*v*(3-2*v);};
const styles:readonly DanceCameraStyleV898[]=['subtle','cinematic','dynamic'];
const modes:readonly DanceCameraModeV898[]=['auto','solo','duet','ensemble'];
export function normalizeDanceCameraV898(raw:unknown):DanceCameraSettingsV898 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<DanceCameraSettingsV898>:{};
 const flag=(k:keyof DanceCameraSettingsV898)=>typeof v[k]==='boolean'?v[k] as boolean:DEFAULT_DANCE_CAMERA_V898[k] as boolean;
 return {enabled:flag('enabled'),style:styles.includes(v.style as DanceCameraStyleV898)?v.style as DanceCameraStyleV898:'cinematic',
  mode:modes.includes(v.mode as DanceCameraModeV898)?v.mode as DanceCameraModeV898:'auto',
  intensity:finite(v.intensity)?Math.round(clamp(v.intensity,0,100)):50,
  solo:flag('solo'),duet:flag('duet'),ensemble:flag('ensemble'),
  motionFollow:flag('motionFollow'),protectLyrics:flag('protectLyrics'),protectDuets:flag('protectDuets')};
}
/** Compare real stage-root samples on one track. Reset to zero on seek, dropout
 * or track switch. The output is a bounded root-translation proxy (not a
 * claim about dance animation, tempo, singer identity or foot contacts). */
export function measureAnchorMotionV898(previous:readonly DanceCameraAnchorV898[],current:readonly DanceCameraAnchorV898[],
 elapsedMs:number,validContinuity:boolean):number {
 if(!validContinuity||!finite(elapsedMs)||elapsedMs<80||elapsedMs>1000||
  !previous.length||!current.length||previous.length>4||current.length>4)return 0;
 let max=0,matches=0;
 for(const a of current){
  if(!a.visible||![a.x,a.y,a.z].every(finite))continue;
  const b=previous.find(p=>p.slot===a.slot&&p.visible);
  if(!b||![b.x,b.y,b.z].every(finite))continue;
  const movement=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
  if(movement>1.4)return 0; // teleport or reset, never a dance impulse
  max=Math.max(max,movement);matches++;
 }
 return matches?clamp(max/(elapsedMs/1000)/.65,0,1):0;
}
/** Select a shot only with existing visible roots and a verified scene.
 * Solo-with-others requires an explicit track-bound lead slot; two visible
 * people are described as a two-shot rather than an inferred vocal duet. */
export function selectDanceCameraModeV898(scene:{section:string;focus?:string},
 roots:readonly DanceCameraAnchorV898[],settings:DanceCameraSettingsV898,
 leadSlot:number|null|undefined,singingSlots:readonly number[]|null|undefined):DanceCameraShotV898|null {
 const active=roots.filter(a=>a.visible);
 if(!active.length)return null;
 const verifiedSolo=singingSlots?.length===1&&Number.isInteger(leadSlot)&&
  singingSlots[0]===leadSlot&&active.some(a=>a.slot===leadSlot);
 const verifiedDuo=singingSlots?.length===2&&
  singingSlots.every(slot=>active.some(a=>a.slot===slot));
 let mode:DanceCameraShotV898;
 if(scene.section==='verse'||scene.section==='break')
  mode=verifiedSolo||active.length===1?'solo':active.length===2?'duet':'ensemble';
 else if(scene.section==='hook'||scene.section==='drop'||scene.section==='finale')
  mode=active.length>=3?'ensemble':active.length===2?'duet':'solo';
 else mode=active.length===1?'solo':active.length===2?'duet':'ensemble';
 if(settings.mode!=='auto')mode=settings.mode;
 if(!settings[mode])return null;
 if(mode==='solo'&&!verifiedSolo&&active.length!==1)return null;
 if(mode==='duet'&&active.length!==2&&!verifiedDuo)return null;
 if(mode==='ensemble'&&active.length<3)return null;
 return mode;
}
export function sampleDanceCameraV898(i:DanceCameraInputV898):DanceCameraReviewV898 {
 const reject=(reason:DanceCameraReviewV898['reason'],sceneIndex=-1):DanceCameraReviewV898=>({
  active:false,mode:null,reason,pose:i.pose,gain:0,cameraRate:1,sceneIndex,visibleSlots:[],motion:0,
 });
 const s=i.settings,p=i.plan;
 if(!s.enabled||s.intensity<=0||!i.playing||!i.autoEnabled||!i.directorEnabled||
  !i.cameraEnabled||!i.danceEnabled||i.manualFx||i.manualCamera||i.manualDance||i.authored||
  i.seekBlocked||i.blackout||i.reducedMotion||i.tier==='low')return reject('protected');
 if(!p||p.source!=='verified-v604'||!i.trackId||i.trackId.length>160||
  p.trackId!==i.trackId||p.durationMs!==i.durationMs||!finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  !finite(i.aspect)||i.aspect<.6||i.aspect>3.5||!finite(i.anchorAgeMs)||i.anchorAgeMs<0||i.anchorAgeMs>450||
  !finite(i.motion)||i.motion<0||i.motion>1||!Array.isArray(i.anchors)||
  i.anchors.length<1||i.anchors.length>4)return reject('unverified');
 if((s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible))||
  ![i.pose.x,i.pose.y,i.pose.z,i.pose.targetX??0,i.pose.targetY,i.pose.targetZ??0,i.pose.fov].every(finite)||
  i.pose.fov<28||i.pose.fov>76)return reject('protected');
 const roots=i.anchors.filter(a=>a.visible);
 if(!roots.length||roots.some(a=>!Number.isInteger(a.slot)||a.slot<0||a.slot>3||
  ![a.x,a.y,a.z].every(n=>finite(n)&&Math.abs(n)<35))||
  new Set(roots.map(a=>a.slot)).size!==roots.length)return reject('unverified');
 const scene=p.scenes.find(x=>i.positionMs>=x.startMs&&i.positionMs<x.endMs);
 if(!scene||!Number.isInteger(scene.index)||scene.index<0||!finite(scene.startMs)||!finite(scene.endMs)||
  scene.startMs<0||scene.endMs>i.durationMs||scene.endMs-scene.startMs<2600)return reject('unverified');
 const shot=selectDanceCameraModeV898(scene,roots,s,i.verifiedLeadSlot,i.verifiedSingingSlots);
 if(!shot)return reject('off',scene.index);
 if(i.verifiedSingingSlots&&i.verifiedSingingSlots.some(slot=>
  !Number.isInteger(slot)||!roots.some(a=>a.slot===slot)))return reject('unverified',scene.index);
 const age=i.positionMs-scene.startMs,remain=scene.endMs-i.positionMs;
 const fade=s.style==='subtle'?2600:s.style==='dynamic'?1250:1900;
 const gain=clamp(s.intensity/100,0,1)*(i.tier==='balanced'?.6:1)*
  (s.style==='subtle'?.52:s.style==='dynamic'?1:.76)*smooth(age/fade)*smooth(remain/fade)*
  (shot==='duet'&&s.protectDuets?.65:1);
 if(gain<.00001)return reject('off',scene.index);
 const center=(Math.min(...roots.map(a=>a.x))+Math.max(...roots.map(a=>a.x)))/2;
 const lead=roots.find(a=>a.slot===i.verifiedLeadSlot);
 const target=shot==='solo'&&lead?lead.x:center;
 const tx=i.pose.targetX??0,ty=i.pose.targetY,tz=i.pose.targetZ??0;
 const dx=i.pose.x-tx,dy=i.pose.y-ty,dz=i.pose.z-tz;
 const distance=Math.hypot(dx,dy,dz);
 if(distance<1.6||dz<.75||Math.abs(dx)>dz*.75)return reject('unverified',scene.index);
 const span=Math.max(...roots.map(a=>a.x))-Math.min(...roots.map(a=>a.x));
 const motion=s.motionFollow?i.motion:0;
 const pan=clamp((target-tx)*(shot==='solo'?.17:.10)*gain,-.085,.085);
 const zoom=shot==='solo'?-.04:shot==='duet'?.025:.05+clamp(span/10,0,.02);
 const fovChange=shot==='solo'?-0.35:shot==='duet'?.23:.42;
 const side=s.protectLyrics?i.lyricsSide??null:null;
 const faceY=finite(i.faceY)?clamp(i.faceY,.7,2.7):1.55;
 const before=measureConcertFrameV550(i.pose,roots,i.aspect,side,s.protectLyrics,faceY);
 const beforeScreen=measureScreenFrameV540(i.pose,roots,i.aspect,side);
 if(!before||!beforeScreen)return reject('unsafe',scene.index);
 const singles=roots.map(a=>measureConcertFrameV550(i.pose,[a],i.aspect,side,s.protectLyrics,faceY));
 if(singles.some(f=>!f))return reject('unsafe',scene.index);
 const rhythm=1+motion*.08; // rooted movement, not invented beat detection
 for(const fraction of [1,.5,.2] as const){
  const scale=1+zoom*gain*fraction;
  const newX=tx+pan*fraction;
  const candidate:CameraPoseV897={...i.pose,targetX:newX,
   x:newX+dx*scale,y:ty+dy*scale,z:tz+dz*scale,
   fov:clamp(i.pose.fov+fovChange*gain*fraction,28,76)};
  const after=measureConcertFrameV550(candidate,roots,i.aspect,side,s.protectLyrics,faceY);
  const afterScreen=measureScreenFrameV540(candidate,roots,i.aspect,side);
  const afterSingles=roots.map(a=>measureConcertFrameV550(candidate,[a],i.aspect,side,s.protectLyrics,faceY));
  const eps=1e-7;
  if(!after||!afterScreen||afterSingles.some(f=>!f)||
   after.overflow>before.overflow+eps||after.headOverflow>before.headOverflow+eps||
   after.fullBodyOverflow>before.fullBodyOverflow+eps||afterScreen.overflow>beforeScreen.overflow+eps||
   afterSingles.some((f,n)=>f!.overflow>singles[n]!.overflow+eps||
    f!.headOverflow>singles[n]!.headOverflow+eps||f!.fullBodyOverflow>singles[n]!.fullBodyOverflow+eps))continue;
  return {active:true,reason:'coordinated',pose:candidate,mode:shot,gain:gain*fraction,
   sceneIndex:scene.index,cameraRate:clamp((shot==='solo'?.96:shot==='duet'?.985:1.025)*rhythm,.94,1.04),
   visibleSlots:roots.map(a=>a.slot),motion};
 }
 return reject('unsafe',scene.index);
}
export function exportDanceCameraV898(plan:CameraPlanV897,settings:DanceCameraSettingsV898):string|null {
 if(plan.source!=='verified-v604'||!plan.trackId||!finite(plan.durationMs)||
  plan.durationMs<10000||plan.durationMs>1800000||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-dance-camera-v898',version:1,source:plan.source,
  trackId:plan.trackId,durationMs:plan.durationMs,settings:normalizeDanceCameraV898(settings),
  scenes:plan.scenes.map(x=>({index:x.index,startMs:x.startMs,endMs:x.endMs,section:x.section,
   possibleModes:settings.mode==='auto'?['solo','duet','ensemble']:[settings.mode]})),
  note:'Verified song sections only. Runtime camera modes require current visible avatar roots and framing checks. No inferred dance/voice IDs.'},null,2);
}
