/** V1047 · Immersive Arena Experience 3.0.
 * Deterministic, virtual-only audience holograms, sky light-tunnel and optional
 * single-camera accents. The V1040 score is an authored template, NOT proof of
 * music sections. No real laser, Govee, pyro, network, timers or new camera.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import type {ArenaTierV1036} from './arena360AtmosphereV1036';

export type ArenaImmersiveModeV1047='arrival'|'orbit'|'spiral'|'canopy'|'crown';
export type ArenaImmersiveCueV1047={
 active:boolean;mode:ArenaImmersiveModeV1047;seconds:number;gain:number;speed:number;
 hologramCount:number;tunnelCount:number;primary:string;secondary:string;
};
export type ArenaImmersiveCameraCueV1047={active:boolean;seconds:number;mode:ArenaImmersiveModeV1047;gain:number};
const OFF:ArenaImmersiveCueV1047=Object.freeze({active:false,mode:'arrival',seconds:0,gain:0,speed:0,
 hologramCount:0,tunnelCount:0,primary:'#55d8ff',secondary:'#ad70ff'});
const OFF_CAMERA:ArenaImmersiveCameraCueV1047=Object.freeze({active:false,mode:'arrival',seconds:0,gain:0});
const clamp=(n:number,low:number,high:number)=>Number.isFinite(n)?Math.min(high,Math.max(low,n)):low;
const modes:Record<ArenaShowSceneV1040,ArenaImmersiveModeV1047>={
 intro:'arrival',verse:'orbit',build:'spiral',hook:'canopy',interlude:'arrival',finale:'crown',
};
const palettes={
 rap:['#52ddff','#b56bff'],hard:['#36f6ed','#ff5988'],rock:['#ffaf55','#ff5e5e'],pop:['#91e5ff','#ff91da'],
} as const;
const safeClock=(progressMs?:number|null,durationMs?:number|null)=>Number.isFinite(progressMs)&&
 Number.isFinite(durationMs)&&(progressMs??-1)>=0&&(durationMs??0)>=30000&&
 (progressMs??0)<=(durationMs??0);
export function planArenaImmersionV1047(input:{enabled:boolean;stageIsArena:boolean;
 playing:boolean;reducedMotion:boolean;reactive:boolean;show?:ArenaShowCueV1040|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 strength?:number|null;genre?:string|null;performanceTier?:ArenaTierV1036|null;
}):ArenaImmersiveCueV1047{
 const show=input.show;
 if(!input.enabled||!input.stageIsArena||!input.playing||input.reducedMotion||!input.reactive||
  !show?.active||!show.scene||!input.trackId||!safeClock(input.progressMs,input.durationMs))return OFF;
 const strength=clamp((input.strength??55)/100,0,.75),fade=clamp(show.fade,0,1);
 const gain=clamp(strength*clamp(show.intensity/100,0,1)*fade,0,.65);
 if(gain<=0)return OFF;
 const low=input.performanceTier==='low',balanced=input.performanceTier==='balanced';
 const count=low?0:balanced?12:24,tunnels=low?0:balanced?6:12;
 const genre=(input.genre??'').toLowerCase();
 const palette=genre.includes('hard')||genre.includes('tekk')?palettes.hard:
  genre.includes('rock')||genre.includes('metal')?palettes.rock:
  genre.includes('rap')||genre.includes('hip')?palettes.rap:palettes.pop;
 return {active:true,mode:modes[show.scene],seconds:(input.progressMs??0)/1000,
  gain,speed:.2+gain*.9,hologramCount:count,tunnelCount:tunnels,
  primary:palette[0],secondary:palette[1]};
}
/** Lightweight sampling: visual fixtures are preallocated, never created per frame. */
export function sampleAudienceHologramV1047(index:number,total:number,cue:ArenaImmersiveCueV1047){
 const n=Math.max(1,Math.floor(total)),a=Math.PI*2*(index+.5)/n;
 const motion=cue.seconds*cue.speed*(cue.mode==='spiral'?1.55:.7);
 const wave=Math.sin(a*3-motion*2),radius=6.7+(cue.mode==='canopy'?.6:0)+.36*wave;
 const rotation=cue.mode==='orbit'?motion*.24:cue.mode==='crown'?motion*.10:motion*.14;
 const ang=a+rotation;
 const height=cue.mode==='arrival'?2.25+wave*.12:cue.mode==='orbit'?2.55+wave*.30:
  cue.mode==='spiral'?2.7+Math.sin(a*2+motion)*.86:
  cue.mode==='canopy'?3.48+wave*.22:3.72+wave*.40;
 const size=(cue.mode==='crown'?.83:.58)+cue.gain*.42;
 return {x:Math.cos(ang)*radius,y:height,z:Math.sin(ang)*radius,angle:ang,
  tilt:cue.mode==='spiral'?Math.sin(motion+a)*.4:.15,size,
  glow:clamp(cue.gain*(.76+.24*Math.sin(a*2-motion)),0,.65)};
}
export function sampleLightTunnelV1047(index:number,total:number,cue:ArenaImmersiveCueV1047){
 const n=Math.max(1,Math.floor(total)),a=Math.PI*2*(index+.5)/n;
 const motion=cue.seconds*cue.speed;
 const wave=Math.sin(motion*1.3-index*.7);
 const ring=cue.mode==='spiral'?5.25:cue.mode==='canopy'?6.55:5.8;
 const radius=ring+.18*wave;
 return {x:Math.cos(a)*radius,y:cue.mode==='crown'?3.85:cue.mode==='arrival'?2.65:3.05+wave*.22,
  z:Math.sin(a)*radius,yaw:a+Math.PI/2+Math.sin(motion*.5)*.08,
  size:(cue.mode==='canopy'?1.26:cue.mode==='crown'?1.17:1.05)+cue.gain*.25,
  glow:clamp(cue.gain*(.68+.20*Math.sin(index*1.7-motion)),0,.6)};
}
/** Camera remains owned by StageCameraDirector/SmartStageCamera. Never alter manual shots. */
export function planArenaImmersiveCameraV1047(input:{enabled:boolean;stageIsArena:boolean;
 cameraEnabled:boolean;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 show?:ArenaShowCueV1040|null;trackId?:string|null;progressMs?:number|null;
 durationMs?:number|null;strength?:number|null;performanceTier?:ArenaTierV1036|null;
}):ArenaImmersiveCameraCueV1047{
 if(!input.enabled||!input.stageIsArena||!input.cameraEnabled||!input.playing||
  input.reducedMotion||input.manualPriority||input.performanceTier==='low'||
  !input.show?.active||!input.show.scene||!input.trackId||
  !safeClock(input.progressMs,input.durationMs))return OFF_CAMERA;
 const gain=clamp((input.strength??55)/100,0,.75)*clamp(input.show.intensity/100,0,1)*
  clamp(input.show.fade,0,1)*.40;
 return gain>0?{active:true,seconds:(input.progressMs??0)/1000,
  mode:modes[input.show.scene],gain}:OFF_CAMERA;
}
export function composeArenaImmersiveCameraV1047<T extends {x:number;y:number;z:number;fov:number;
 targetX?:number;targetY:number;targetZ?:number}>(pose:T,cue?:ArenaImmersiveCameraCueV1047|null,
 protectedShot=false):T{
 if(!cue?.active||protectedShot||![pose.x,pose.y,pose.z,pose.fov,pose.targetY,cue.seconds].every(Number.isFinite))return pose;
 const x0=Number.isFinite(pose.targetX)?pose.targetX!:0;
 const z0=Number.isFinite(pose.targetZ)?pose.targetZ!:0;
 const dx=pose.x-x0,dz=pose.z-z0,distance=Math.hypot(dx,dz);
 if(distance<4||distance>25)return pose;
 const g=clamp(cue.gain,0,.30);
 const angle=Math.sin(cue.seconds*.09)*g*(cue.mode==='orbit'?.29:.17);
 const c=Math.cos(angle),s=Math.sin(angle);
 const pull=1+g*(cue.mode==='canopy'?.12:cue.mode==='crown'?.14:.055);
 return {...pose,x:x0+(dx*c-dz*s)*pull,z:z0+(dx*s+dz*c)*pull,
  y:pose.y+g*(cue.mode==='canopy'?.65:cue.mode==='crown'?.85:.25),
  fov:clamp(pose.fov+g*(cue.mode==='canopy'?4:2),28,65)};
}
