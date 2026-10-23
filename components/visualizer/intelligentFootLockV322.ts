/** V322 — conservative world-space foot plant assistant.
 * All coordinates are in Three.js world units. Never edits authored keyframes,
 * root/pelvis transforms, geometry or joint constraints. The existing IK solver
 * is the sole owner of bone rotations; this module only suggests bounded targets.
 */
import type {ContactPhase} from './groundContactEngine';

export interface FootLockSettingsV322 {
  enabled:boolean;
  anchorStrength:number;      // 0..100
  releaseSpeed:number;        // 0..100, higher releases sooner
  floorTracking:number;       // 0..100, slow recalibration only on firm contact
  maxCorrectionCm:number;     // 1..12, normalized against a 1.8m avatar
}
export const FOOT_LOCK_KEY_V322='sonic-foot-lock-v322';
export const FOOT_LOCK_EVENT_V322='sonic:foot-lock-settings-v322';
export const FOOT_LOCK_DIAGNOSTIC_EVENT_V322='sonic:foot-lock-diagnostics-v322';
export const DEFAULT_FOOT_LOCK_V322:FootLockSettingsV322={enabled:false,anchorStrength:72,releaseSpeed:65,floorTracking:35,maxCorrectionCm:6};
const num=(x:unknown,otherwise:number):number=>typeof x==='number'&&Number.isFinite(x)?x:otherwise;
const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
export function normalizeFootLockV322(raw:unknown):FootLockSettingsV322 {
  if(!raw||typeof raw!=='object')return {...DEFAULT_FOOT_LOCK_V322};
  const r=raw as Partial<FootLockSettingsV322>;
  return {enabled:typeof r.enabled==='boolean'?r.enabled:false,
    anchorStrength:Math.round(clamp(num(r.anchorStrength,72),0,100)),
    releaseSpeed:Math.round(clamp(num(r.releaseSpeed,65),0,100)),
    floorTracking:Math.round(clamp(num(r.floorTracking,35),0,100)),
    maxCorrectionCm:Math.round(clamp(num(r.maxCorrectionCm,6),1,12))};
}
let cache:FootLockSettingsV322|null=null;
export function readFootLockV322():FootLockSettingsV322 {
  if(cache)return cache;
  if(typeof window==='undefined')return {...DEFAULT_FOOT_LOCK_V322};
  try{cache=normalizeFootLockV322(JSON.parse(window.localStorage.getItem(FOOT_LOCK_KEY_V322)||'null'));}
  catch{cache={...DEFAULT_FOOT_LOCK_V322};}
  return cache;
}
export function refreshFootLockV322(){cache=null;return readFootLockV322();}
export function writeFootLockV322(value:FootLockSettingsV322){
  cache=normalizeFootLockV322(value);
  if(typeof window==='undefined')return;
  try{window.localStorage.setItem(FOOT_LOCK_KEY_V322,JSON.stringify(cache));}catch{/* optional storage */}
  window.dispatchEvent(new Event(FOOT_LOCK_EVENT_V322));
}
export type PointV322={x:number;y:number;z:number};
export type FootAnchorV322={point:PointV322;active:boolean;blend:number;lastSlip:number;maxSlip:number};
export type GroundLockStateV322={left:FootAnchorV322;right:FootAnchorV322;floorY:number|null;lastTrack:string;lastMs:number|null};
export const createFootAnchorV322=():FootAnchorV322=>({point:{x:0,y:0,z:0},active:false,blend:0,lastSlip:0,maxSlip:0});
export const createGroundLockStateV322=():GroundLockStateV322=>({left:createFootAnchorV322(),right:createFootAnchorV322(),floorY:null,lastTrack:'',lastMs:null});
export function resetGroundLockV322(state:GroundLockStateV322){
  state.left=createFootAnchorV322();state.right=createFootAnchorV322();state.floorY=null;state.lastTrack='';state.lastMs=null;
}
export function isFootLockDiscontinuityV322(state:GroundLockStateV322,trackId:string,ms:number|null):boolean {
  const jumped=ms!==null&&state.lastMs!==null&&(ms<state.lastMs-180||ms-state.lastMs>2500);
  const switched=state.lastTrack!==''&&trackId!==state.lastTrack;
  state.lastTrack=trackId;
  state.lastMs=ms;
  return jumped||switched;
}
export function updateGroundEstimateV322(state:GroundLockStateV322,observations:Array<{position:PointV322; phase:ContactPhase; confidence:number}>, dt:number,settings:FootLockSettingsV322,scale:number):number {
  const points=observations.map(x=>x.position).filter(x=>Number.isFinite(x.y));
  if(!points.length)return state.floorY??0;
  if(state.floorY===null){state.floorY=Math.min(...points.map(p=>p.y));return state.floorY;}
  const firm=observations.filter(x=>x.phase==='planted'&&x.confidence>.75&&Number.isFinite(x.position.y));
  if(!firm.length)return state.floorY;
  const next=Math.min(...firm.map(x=>x.position.y));
  // Restrict calibration to tiny corrections; a high lifted foot is not ground.
  if(Math.abs(next-state.floorY)>Math.max(.015,scale*.035))return state.floorY;
  const limit=.012*scale*clamp(settings.floorTracking/100,0,1)*clamp(dt,0,.1);
  state.floorY+=clamp(next-state.floorY,-limit,limit);
  return state.floorY;
}
export interface FootLockProbeV322 {
  position:PointV322;
  phase:ContactPhase;
  confidence:number;
  verticalSpeed:number;
  legLength:number;
  delta:number;
  floorY:number;
}
export interface FootTargetV322 extends PointV322 {weight:number;locked:boolean;slip:number;}
/** Contact hysteresis is supplied by V135. Only a confident planted foot can capture an anchor.
 * A moving/lifted foot fades out without acquiring new anchors. The target is
 * finite, reach-limited and can never exceed a small fraction of leg length.
 */
export function updateFootLockTargetV322(state:FootAnchorV322,p:FootLockProbeV322,settings:FootLockSettingsV322):FootTargetV322 {
  const position=p.position;
  const safePos={x:num(position.x,0),y:num(position.y,0),z:num(position.z,0)};
  const dt=clamp(num(p.delta,0),0,.1),length=clamp(num(p.legLength,1),.1,4);
  const conf=clamp(num(p.confidence,0),0,1);
  const groundDistance=Math.abs(safePos.y-num(p.floorY,safePos.y));
  const grounded=p.phase==='planted'&&conf>.30&&groundDistance<Math.max(.035,length*.095)&&num(p.verticalSpeed,0)<length*.9;
  const radius=length*clamp(settings.maxCorrectionCm/180, .005,.09);
  if(!grounded&&state.active)state.active=false;
  if(grounded&&!state.active){state.point={...safePos};state.active=true;state.maxSlip=0;}
  const decay=8+settings.releaseSpeed*.24;
  const rate=state.active?9:decay;
  const goal=state.active?conf:0;
  state.blend=clamp(state.blend+(goal-state.blend)*(1-Math.exp(-rate*dt)),0,1);
  const dx=state.point.x-safePos.x,dy=state.point.y-safePos.y,dz=state.point.z-safePos.z;
  const slip=Math.hypot(dx,dy,dz);
  state.lastSlip=state.active?slip:0;
  state.maxSlip=Math.max(state.maxSlip,state.lastSlip);
  const ratio=slip>radius?radius/slip:1;
  const influence=state.blend*clamp(settings.anchorStrength/100,0,1);
  // No correction once fully released; neither velocity nor IK is bypassed.
  return {x:safePos.x+dx*ratio*influence,y:safePos.y+dy*ratio*influence,z:safePos.z+dz*ratio*influence,
    weight:influence,locked:state.active,slip:state.lastSlip};
}
export function groundLockReportV322(state:GroundLockStateV322){
  return {leftLocked:state.left.active,rightLocked:state.right.active,
    leftSlipCm:Math.round(state.left.lastSlip*1000)/10,rightSlipCm:Math.round(state.right.lastSlip*1000)/10,
    // World units are interpreted as meters for display only, not calibrated measurement.
    floorY:state.floorY};
}
