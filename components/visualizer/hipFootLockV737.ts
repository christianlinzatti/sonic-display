/** V737 — temporary foot anchors during the procedural V735 hip dance.
 * Pure world-space target planner. The existing V492 IK is the only joint solver.
 * No forced contacts, root translation, animation keyframe or GLB edits.
 */
import type { ContactPhase } from './groundContactEngine';

export const HIP_FOOT_LOCK_DIAGNOSTICS_V737='sonic:hip-foot-lock-diagnostics-v737';
export type HipFootPointV737 = { x:number; y:number; z:number };
export type HipFootAnchorV737 = { anchor:HipFootPointV737; active:boolean; blend:number; slip:number };
export type HipFootLockStateV737 = {
  left:HipFootAnchorV737; right:HipFootAnchorV737;
  lastTrack:string; lastMs:number|null;
};
export type HipFootProbeV737 = {
  position:HipFootPointV737;
  phase:ContactPhase;
  confidence:number;
  floorY:number;
  verticalSpeed:number;
  legLength:number;
  delta:number;
  /** Normalized V735 hip intensity, not a second IK strength setting. */
  intensity:number;
};
export type HipFootTargetV737 = HipFootPointV737 & { weight:number; locked:boolean; slip:number };
const finite=(value:number,otherwise=0)=>Number.isFinite(value)?value:otherwise;
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,finite(value)));
export const createHipFootAnchorV737=():HipFootAnchorV737=>({anchor:{x:0,y:0,z:0},active:false,blend:0,slip:0});
export const createHipFootLockStateV737=():HipFootLockStateV737=>({left:createHipFootAnchorV737(),right:createHipFootAnchorV737(),lastTrack:'',lastMs:null});
export function resetHipFootLockV737(state:HipFootLockStateV737){
  state.left=createHipFootAnchorV737();state.right=createHipFootAnchorV737();
  state.lastTrack='';state.lastMs=null;
}
/** Avoid reusing a planted target after a seek, track switch or clock jump. */
export function detectHipFootDiscontinuityV737(state:HipFootLockStateV737,trackId:string,ms:number|null):boolean {
  const safeMs=ms!==null&&Number.isFinite(ms)&&ms>=0?ms:null;
  const switched=state.lastTrack!==''&&trackId!==state.lastTrack;
  const jumped=safeMs!==null&&state.lastMs!==null&&(safeMs<state.lastMs-180||safeMs-state.lastMs>2500);
  if(switched||jumped){resetHipFootLockV737(state);}
  state.lastTrack=trackId;
  state.lastMs=safeMs;
  return switched||jumped;
}
/** Capture once when V135 confirms a planted contact; never recapture each frame.
 * A lifted/releasing foot immediately loses its anchor, avoiding glued steps.
 * Reach and floor checks deliberately favor safety over perfect stabilization.
 */
export function stepHipFootLockV737(state:HipFootAnchorV737,p:HipFootProbeV737):HipFootTargetV737 {
  const raw=p.position;
  const pos={x:finite(raw.x),y:finite(raw.y),z:finite(raw.z)};
  const dt=clamp(p.delta,0,.1),length=clamp(p.legLength,.15,4);
  const intensity=clamp(p.intensity,0,1),confidence=clamp(p.confidence,0,1);
  const ground=Math.abs(pos.y-finite(p.floorY,pos.y));
  const grounded=intensity>0&&p.phase==='planted'&&confidence>=.25&&
    ground<Math.max(.035,length*.085)&&Math.abs(finite(p.verticalSpeed))<length*.8;
  if(!grounded)state.active=false;
  else if(!state.active){state.anchor={...pos};state.active=true;}
  const goal=state.active?confidence:0;
  const rate=state.active?14:22;
  state.blend=clamp(state.blend+(goal-state.blend)*(1-Math.exp(-rate*dt)),0,1);
  if(!state.active){state.slip=0;return {...pos,weight:0,locked:false,slip:0};}
  const dx=state.anchor.x-pos.x,dy=state.anchor.y-pos.y,dz=state.anchor.z-pos.z;
  const slip=Math.hypot(dx,dy,dz);
  // Abort implausible stance changes rather than tugging a moving foot back.
  if(!Number.isFinite(slip)||slip>length*.12){
    state.active=false;state.blend=0;state.slip=0;
    return {...pos,weight:0,locked:false,slip:0};
  }
  state.slip=slip;
  const radius=length*.055; // 5.5% of leg length; never unbounded correction
  const ratio=slip>radius?radius/slip:1;
  const weight=clamp(state.blend*(.72+.28*intensity),0,1);
  return {x:pos.x+dx*ratio,y:pos.y+dy*ratio,z:pos.z+dz*ratio,weight,locked:true,slip};
}
export function hipFootLockReportV737(state:HipFootLockStateV737){
  return {leftLocked:state.left.active,rightLocked:state.right.active,
    leftSlipCm:Math.round(state.left.slip*1000)/10,
    rightSlipCm:Math.round(state.right.slip*1000)/10};
}
