/** V540 – Cinematic Concert Camera 3.0: verified-performer screen composition.
 * A PURE finishing pass on the existing R3F camera. Singer identity comes only
 * from the track-bound V528 cue; visual-only spotlight hints are not singers.
 * No camera cuts, extra render loop, DOM queries or persisted settings.
 */
import type {CameraPoseV528 as CameraPose,ConcertSceneV528,ConcertAnchorV528} from './cinematicConcertCoordinationV528';

export type CompositionOptionsV540={
  trackId?:string|null;progressMs:number;aspect:number;
  playing:boolean;reducedMotion:boolean;automatic:boolean;authored:boolean;
  lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;faceY?:number|null;
};
export type ScreenFrameV540={left:number;right:number;safeLeft:number;safeRight:number;overflow:number};
const finite=(x:number)=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,x));
const smooth=(x:number)=>{const p=clamp(x,0,1);return p*p*(3-2*p);};
const bound=(v:number)=>finite(v)&&Math.abs(v)<100;
function geometry(pose:CameraPose,aspect:number){
  const dx=pose.x-(pose.targetX??0),dy=pose.y-pose.targetY,dz=pose.z-(pose.targetZ??0);
  const distance=Math.hypot(dx,dy,dz),slope=Math.tan(pose.fov*Math.PI/360)*aspect;
  return {dx,dy,dz,distance,slope};
}
/** Horizontal framing diagnostics (conservative half-body width around roots).
 * Coordinates are viewport normalized: -1 = left edge, +1 = right edge.
 * Root centers are sampled from actual visible V377 stage slots, not fabricated.
 */
export function measureScreenFrameV540(pose:CameraPose,anchors:readonly ConcertAnchorV528[],
  aspect:number,lyricsSide:'left'|'right'|null=null):ScreenFrameV540|null{
  if(!finite(aspect)||aspect<.5||aspect>4||![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite)||pose.fov<20||pose.fov>100||
    !anchors.length||anchors.some(a=>![a.x,a.y,a.z].every(bound)||!a.visible))return null;
  const {distance,slope}=geometry(pose,aspect);
  if(distance<.5||!finite(distance)||!finite(slope)||slope<=0)return null;
  const min=Math.min(...anchors.map(a=>a.x))-.38,max=Math.max(...anchors.map(a=>a.x))+.38;
  const left=(min-(pose.targetX??0))/(distance*slope);
  const right=(max-(pose.targetX??0))/(distance*slope);
  const safeLeft=lyricsSide==='left'?-0.20:-.78;
  const safeRight=lyricsSide==='right'?.20:.78;
  return {left,right,safeLeft,safeRight,overflow:Math.max(0,safeLeft-left)+Math.max(0,right-safeRight)};
}
/** Protect every selected performer rather than reframing a missing/misassigned
 * avatar. In wide hooks only verified singing slots can drive the camera.
 * Manual studio shots, saved presets, show timelines and live edits win.
 */
export function composeConcertCameraV540(pose:CameraPose,scene:ConcertSceneV528|null|undefined,
  anchors:readonly ConcertAnchorV528[],options:CompositionOptionsV540):CameraPose{
  if(!scene?.active||scene.focus==='none'||scene.focus==='drop'||
    !options.playing||options.reducedMotion||!options.automatic||options.authored||
    !options.trackId?.trim()||scene.trackId!==options.trackId||
    !finite(options.progressMs)||options.progressMs<scene.cueStartMs||options.progressMs>=scene.cueEndMs||
    !Number.isInteger(scene.count)||scene.count<2||scene.count>4||
    !Number.isInteger(scene.leadSlot)||scene.leadSlot<0||scene.leadSlot>=scene.count||
    !scene.singingSlots.length||new Set(scene.singingSlots).size!==scene.singingSlots.length||
    !scene.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<scene.count)||
    !scene.singingSlots.includes(scene.leadSlot)||
    (scene.focus==='ensemble'&&scene.singingSlots.length!==scene.count)||
    (scene.focus==='handoff'&&(scene.handoffFrom===null||scene.handoffFrom===scene.leadSlot||
      !Number.isInteger(scene.handoffFrom)||scene.handoffFrom<0||scene.handoffFrom>=scene.count))||
    !finite(scene.strength)||scene.strength<=0||scene.strength>1||
    !finite(options.aspect)||options.aspect<.5||options.aspect>4||
    ![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite)||
    pose.fov<20||pose.fov>100)return pose;
  const selected=scene.focus==='ensemble'?scene.singingSlots:
    scene.focus==='handoff'?[scene.leadSlot,scene.handoffFrom!]:[scene.leadSlot];
  const positions=selected.map(slot=>anchors.find(a=>a.slot===slot&&a.visible&&
    [a.x,a.y,a.z].every(bound)));
  if(positions.some(a=>!a)||positions.length===0)return pose;
  const pts=positions as ConcertAnchorV528[];
  const minX=Math.min(...pts.map(a=>a.x))-.38,maxX=Math.max(...pts.map(a=>a.x))+.38;
  const centerX=(minX+maxX)/2;
  const screenSide=options.lyricsProtected?(options.lyricsSide??null):null;
  const safeLeft=screenSide==='left'?-.20:-.78;
  const safeRight=screenSide==='right'?.20:.78;
  const baseFrame=measureScreenFrameV540(pose,pts,options.aspect,screenSide);
  if(!baseFrame)return pose;
  const {dx,dy,dz,distance,slope}=geometry(pose,options.aspect);
  // Horizontal stage-root measurements assume a predominantly frontal shot.
  // For reverse / steep side camera angles preserve the existing directors.
  if(dz<=.5||Math.abs(dx)>Math.abs(dz)*.8)return pose;
  // Avoid changing the camera too aggressively on the first 550ms of a vocal
  // handoff; V528's easing envelope remains authoritative too.
  const cueFade=smooth((options.progressMs-scene.cueStartMs)/550)*
    smooth((scene.cueEndMs-options.progressMs)/430);
  const gain=clamp(scene.strength*cueFade*(screenSide?.70:.84),0,.7);
  if(gain<.005)return pose;
  const halfSpace=distance*slope;
  const preferredScreen=(safeLeft+safeRight)/2;
  const desiredX=centerX-preferredScreen*halfSpace;
  const originalX=pose.targetX??0;
  const shift=clamp(desiredX-originalX,-.85,.85)*gain;
  const targetX=clamp(originalX+shift,-2.6,2.6);
  // Real measured spacing, vertical FOV and current viewport aspect all affect
  // the minimum comfortable distance; avoid narrow-screen singer clipping.
  const leftReach=Math.max(.08,-safeLeft),rightReach=Math.max(.08,safeRight);
  const neededForLeft=Math.max(0,(targetX-minX)/(leftReach*slope));
  const neededForRight=Math.max(0,(maxX-targetX)/(rightReach*slope));
  const padding=scene.focus==='ensemble'?1.05:scene.focus==='handoff'?1.02:1;
  const required=Math.max(distance,neededForLeft,neededForRight)*padding;
  const desiredDistance=clamp(required,distance,Math.max(distance,11.4));
  const newDistance=distance+(desiredDistance-distance)*gain;
  const ratio=clamp(newDistance/distance,1,1.55);
  const faceY=options.faceY;
  const faceShift=finite(faceY as number)?clamp((faceY as number)-pose.targetY,-.3,.3)*gain*.18:0;
  const result:CameraPose={...pose,targetX,x:targetX+dx*ratio,
    targetY:pose.targetY+faceShift,y:pose.targetY+faceShift+dy*ratio,
    z:(pose.targetZ??0)+dz*ratio,
    // A modest group FOV adjustment helps preserve body framing, but never
    // teleports the camera or steals the lens from manual settings.
    fov:clamp(pose.fov+(scene.focus==='ensemble'?.8:scene.focus==='handoff'?.35:-.2)*gain,28,76)};
  const finalFrame=measureScreenFrameV540(result,pts,options.aspect,screenSide);
  // Fails closed if the proposed framing would make lyrics/body overlap worse.
  if(!finalFrame||finalFrame.overflow>baseFrame.overflow+1e-6)return pose;
  return result;
}
