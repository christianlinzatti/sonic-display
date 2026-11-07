/** V1043 · Planned 360° concert camera: pure and opt-in.
 * This module never owns a camera, clock, timeline, animation or renderer.
 * Existing manual, authored, vocal, lyric, preset and safety guards always win.
 */
import type {ArenaShowCameraV1040,ArenaShowCueV1040} from './arena360ShowDesignerV1040';
export type ArenaShowCameraCueV1043={
 active:boolean;reason:'disabled'|'paused'|'motion'|'manual'|'clock'|'planned';
 shot:ArenaShowCameraV1040;strength:number;seconds:number;
};
export const OFF_ARENA_SHOW_CAMERA_V1043:ArenaShowCameraCueV1043=Object.freeze({
 active:false,reason:'disabled',shot:'wide',strength:0,seconds:0,
});
const bounded=(n:unknown,fallback:number,min:number,max:number)=>
 typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
/** A show template is not a detected musical event; the Spotify position is the only clock. */
export function planArenaShowCameraV1043(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 manualPriority?:boolean;show?:ArenaShowCueV1040|null;
 trackId?:string|null;progressMs?:number|null;strength?:number;
}):ArenaShowCameraCueV1043{
 if(!input.enabled||!input.stageIsArena||!input.show?.active)return OFF_ARENA_SHOW_CAMERA_V1043;
 if(!input.playing)return {...OFF_ARENA_SHOW_CAMERA_V1043,reason:'paused'};
 if(input.reducedMotion)return {...OFF_ARENA_SHOW_CAMERA_V1043,reason:'motion'};
 if(input.manualPriority)return {...OFF_ARENA_SHOW_CAMERA_V1043,reason:'manual'};
 if(!input.trackId||typeof input.progressMs!=='number'||!Number.isFinite(input.progressMs)||input.progressMs<0)
  return {...OFF_ARENA_SHOW_CAMERA_V1043,reason:'clock'};
 const gain=bounded(input.strength,45,0,80)/100*
  bounded(input.show.intensity,0,0,100)/100*bounded(input.show.fade,0,0,1);
 if(gain<=0)return OFF_ARENA_SHOW_CAMERA_V1043;
 return {active:true,reason:'planned',shot:input.show.camera,strength:gain,
  seconds:input.progressMs/1000};
}
/** A subtle, continuous offset on an eligible existing automatic shot only. */
export function composeArenaShowCameraV1043<T extends {
 x:number;y:number;z:number;fov:number;targetX?:number;targetY:number;targetZ?:number;
}>(pose:T,cue?:ArenaShowCameraCueV1043|null,protectedShot=false):T{
 if(!cue?.active||protectedShot||![pose.x,pose.y,pose.z,pose.fov,pose.targetY].every(Number.isFinite))return pose;
 const strength=bounded(cue.strength,0,0,.8);
 const centerX=Number.isFinite(pose.targetX)?pose.targetX!:0;
 const centerZ=Number.isFinite(pose.targetZ)?pose.targetZ!:0;
 const x=pose.x-centerX,z=pose.z-centerZ,dist=Math.hypot(x,z);
 if(dist<4||dist>25||strength<=0)return pose;
 let nx=x,nz=z,ny=pose.y,nfov=pose.fov;
 if(cue.shot==='wide'||cue.shot==='group'){
  const factor=1+strength*(cue.shot==='wide'?.11:.065);
  nx*=factor;nz*=factor;ny+=strength*.12;nfov+=strength*(cue.shot==='wide'?3:2);
 }else if(cue.shot==='lead'){
  const factor=1-strength*.045;
  nx*=factor;nz*=factor;ny+=strength*.08;nfov-=strength*1.5;
 }else if(cue.shot==='orbit'&&Number.isFinite(cue.seconds)){
  const theta=Math.sin(cue.seconds*.07)*strength*.23;
  const c=Math.cos(theta),s=Math.sin(theta);
  nx=x*c+z*s;nz=z*c-x*s;ny+=strength*.08;
 }
 return {...pose,x:centerX+nx,y:ny,z:centerZ+nz,fov:Math.max(28,Math.min(65,nfov))};
}
