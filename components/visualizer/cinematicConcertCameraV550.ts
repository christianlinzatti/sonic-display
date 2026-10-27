/** V550 – Cinematic Concert Camera 4.0.
 * Verified singer/cast-aware shot finishing on the EXISTING R3F camera.
 * Samples actual visible stage roots; approximated face and feet positions
 * are framing diagnostics, not inferred identities or visual occlusion proof.
 * Pure, cheap, deterministic, and intentionally without an animation loop.
 */
import type {CameraPoseV528 as Pose,ConcertSceneV528 as Scene,ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';
export type DirectorOptionsV550={
 trackId?:string|null;progressMs:number;aspect:number;playing:boolean;
 reducedMotion:boolean;automatic:boolean;authored:boolean;
 lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;faceY?:number|null;
};
export type FrameMeasureV550={
 left:number;right:number;top:number;bottom:number;
 safeLeft:number;safeRight:number;safeTop:number;safeBottom:number;
 overflow:number;headOverflow:number;fullBodyOverflow:number;
};
const finite=(n:number)=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));
const smooth=(t:number)=>{const v=clamp(t,0,1);return v*v*(3-2*v);};
const validPose=(p:Pose)=>[p.x,p.y,p.z,p.targetX??0,p.targetY,p.targetZ??0,p.fov].every(finite)&&p.fov>=25&&p.fov<=85;
/** Perspective projection of actual stage roots plus a bounded human-height
 * estimate. These diagnostic boundaries are NOT screenshots or actual meshes.
 */
export function measureConcertFrameV550(pose:Pose,selected:readonly Anchor[],aspect:number,
  lyricsSide:'left'|'right'|null=null,lyricsProtected=false,faceY=1.55):FrameMeasureV550|null{
 if(!validPose(pose)||!finite(aspect)||aspect<.5||aspect>4||
   !selected.length||selected.length>4||!finite(faceY)||faceY<.7||faceY>2.7||
   selected.some(a=>!Number.isInteger(a.slot)||a.slot<0||a.slot>3||!a.visible||
     ![a.x,a.y,a.z].every(n=>finite(n)&&Math.abs(n)<40)))return null;
 const tx=pose.targetX??0,tz=pose.targetZ??0;
 const vx=tx-pose.x,vy=pose.targetY-pose.y,vz=tz-pose.z;
 const len=Math.hypot(vx,vy,vz),flat=Math.hypot(vx,vz);
 if(len<.5||flat<.5||vz>=-.5||Math.abs(vx)>Math.abs(vz)*.8)return null;
 const fx=vx/len,fy=vy/len,fz=vz/len;
 const rx=-fz/(flat/len),rz=fx/(flat/len);
 const ux=-fy*rx,uy=flat/len,uz=-fy*rz;
 const tan=Math.tan(pose.fov*Math.PI/360);
 if(!finite(tan)||tan<=0)return null;
 let left=Infinity,right=-Infinity,top=-Infinity,bottom=Infinity;
 // Project conservative shoulder width, head and feet. 3D roots are sampled
 // from scene, but body proportions remain an approximation.
 let headOverflow=0,fullBodyOverflow=0;
 const safeLeft=lyricsSide==='left'?-.2:-.78,safeRight=lyricsSide==='right'?.2:.78;
 const safeTop=.82,safeBottom=-.86;
 for(const a of selected){
   const pts:[number,number,number][]=[
     [a.x-.34,a.y+Math.max(1.15,faceY),a.z],
     [a.x+.34,a.y+Math.max(1.15,faceY),a.z],
     [a.x-.34,a.y+.04,a.z],
     [a.x+.34,a.y+.04,a.z],
   ];
   for(let i=0;i<pts.length;i++){
     const [px,py,pz]=pts[i];const dx=px-pose.x,dy=py-pose.y,dz=pz-pose.z;
     const depth=dx*fx+dy*fy+dz*fz;
     if(depth<=.5||!finite(depth))return null;
     const screenX=(dx*rx+dz*rz)/(depth*tan*aspect);
     const screenY=(dx*ux+dy*uy+dz*uz)/(depth*tan);
     if(!finite(screenX)||!finite(screenY))return null;
     left=Math.min(left,screenX);right=Math.max(right,screenX);
     top=Math.max(top,screenY);bottom=Math.min(bottom,screenY);
     const h=Math.max(0,safeLeft-screenX)+Math.max(0,screenX-safeRight);
     if(i<2){
       headOverflow+=h+Math.max(0,screenY-safeTop)*1.5;
       // Bottom lyrics bands must not hide heads; a side panel is handled by
       // the horizontal safe rectangle above.
       if(lyricsProtected&&!lyricsSide)headOverflow+=Math.max(0,-.10-screenY)*1.5;
     } else fullBodyOverflow+=h+Math.max(0,safeBottom-screenY)*.6;
   }
 }
 const overflow=headOverflow+fullBodyOverflow;
 return {left,right,top,bottom,safeLeft,safeRight,safeTop,safeBottom,
   overflow,headOverflow,fullBodyOverflow};
}
/** Moderate cinematic close focus, softer singer handoff, wide hook.
 * Only fully verified track-bound V528 roles; no camera or voice guessing.
 * Manually authored settings and low-motion/device options always win.
 */
export function composeCinematicConcertCameraV550(pose:Pose,scene:Scene|null|undefined,
  roots:readonly Anchor[],o:DirectorOptionsV550):Pose{
 if(!scene?.active||scene.focus==='none'||scene.focus==='drop'||
   !o.playing||o.reducedMotion||!o.automatic||o.authored||
   !o.trackId?.trim()||o.trackId!==scene.trackId||
   !finite(o.progressMs)||o.progressMs<scene.cueStartMs||o.progressMs>=scene.cueEndMs||
   !finite(scene.cueStartMs)||!finite(scene.cueEndMs)||scene.cueEndMs<=scene.cueStartMs||
   !Number.isInteger(scene.count)||scene.count<2||scene.count>4||
   !Number.isInteger(scene.leadSlot)||scene.leadSlot<0||scene.leadSlot>=scene.count||
   !Array.isArray(scene.singingSlots)||!scene.singingSlots.length||
   scene.singingSlots.length>scene.count||
   new Set(scene.singingSlots).size!==scene.singingSlots.length||
   !scene.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<scene.count)||
   !scene.singingSlots.includes(scene.leadSlot)||
   (scene.focus==='ensemble'&&scene.singingSlots.length!==scene.count)||
   (scene.focus==='handoff'&&(!Number.isInteger(scene.handoffFrom)||
       scene.handoffFrom===scene.leadSlot||scene.handoffFrom===null||
       scene.handoffFrom<0||scene.handoffFrom>=scene.count))||
   !finite(scene.strength)||scene.strength<=0||scene.strength>1||
   !validPose(pose)||!finite(o.aspect)||o.aspect<.5||o.aspect>4)return pose;
 const slots=scene.focus==='ensemble'?scene.singingSlots:
   scene.focus==='handoff'?[scene.handoffFrom!,scene.leadSlot]:[scene.leadSlot];
 const pts=slots.map(s=>roots.find(r=>r.slot===s&&r.visible));
 if(pts.some(p=>!p))return pose;
 const selected=pts as Anchor[];
 const side=o.lyricsProtected?(o.lyricsSide??null):null;
 const faceY=finite(o.faceY as number)?clamp(o.faceY as number,1.2,2.3):1.55;
 const original=measureConcertFrameV550(pose,selected,o.aspect,side,o.lyricsProtected,faceY);
 if(!original)return pose;
 const baseline540=measureScreenFrameV540(pose,selected,o.aspect,side);
 if(!baseline540)return pose;
 const vx=pose.x-(pose.targetX??0),vy=pose.y-pose.targetY,vz=pose.z-(pose.targetZ??0);
 const dist=Math.hypot(vx,vy,vz);
 if(dist<.5||vz<.5||Math.abs(vx)>Math.abs(vz)*.8)return pose;
 const cueFade=smooth((o.progressMs-scene.cueStartMs)/650)*
   smooth((scene.cueEndMs-o.progressMs)/500);
 const power=clamp(scene.strength*cueFade*(o.lyricsProtected?.46:.68),0,.54);
 if(power<.006)return pose;
 const lead=selected.find(a=>a.slot===scene.leadSlot)!;
 let desiredX=lead.x;
 if(scene.focus==='handoff'){
   const prior=selected.find(a=>a.slot===scene.handoffFrom)!;
   // Initially keep both vocalists, then gradually favor the incoming lead.
   const incoming=.54+.18*smooth((o.progressMs-scene.cueStartMs)/1350);
   desiredX=prior.x*(1-incoming)+lead.x*incoming;
 } else if(scene.focus==='ensemble')desiredX=selected.reduce((sum,a)=>sum+a.x,0)/selected.length;
 const oldTargetX=pose.targetX??0;
 const targetX=oldTargetX+clamp(desiredX-oldTargetX,-.34,.34)*power;
 const desiredY=scene.focus==='lead'?Math.min(1.08,lead.y+faceY*.48):
   scene.focus==='handoff'?Math.min(.92,lead.y+faceY*.38):pose.targetY;
 const targetY=pose.targetY+clamp(desiredY-pose.targetY,-.20,.20)*power;
 // Zoom IN for solo close shot only; never crop inferred feet/faces. Two-shot
 // and group shot receive a restrained amount of breathing room instead.
 const ratio=scene.focus==='lead'?1-.105*power:scene.focus==='handoff'?1+.045*power:1+.11*power;
 const result:Pose={...pose,targetX,targetY,
   x:targetX+vx*ratio,y:targetY+vy*ratio,
   z:(pose.targetZ??0)+vz*ratio,
   fov:clamp(pose.fov+(scene.focus==='lead'?-.8:scene.focus==='handoff'?.35:.8)*power,28,76)};
 const next=measureConcertFrameV550(result,selected,o.aspect,side,o.lyricsProtected,faceY);
 const after540=measureScreenFrameV540(result,selected,o.aspect,side);
 // The prior cinematic pipeline has final authority. If quality is worse,
 // return the EXACT original pose object (no surprise camera discontinuity).
 if(!next||!after540||next.overflow>original.overflow+1e-6||
   next.headOverflow>original.headOverflow+1e-6||
   next.fullBodyOverflow>original.fullBodyOverflow+1e-6||
   after540.overflow>baseline540.overflow+1e-6)return pose;
 return result;
}
