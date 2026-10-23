/** V323 — stance-aware, bounded additive full-body balance.
 * Uses observations from the PREVIOUS V135/V322 contact frame to avoid feedback
 * between the same-frame body overlay and IK targets. This is a motion-quality
 * heuristic, NOT inverse dynamics, physical center-of-mass or force simulation.
 * No root/pelvis translation, foot keyframes or IK joint limits are changed.
 */
export interface FullBodyBalanceSettingsV323 {
  enabled:boolean;
  stanceTransfer:number;       // 0..100
  turnCounterbalance:number;  // 0..100
  landingSoftness:number;     // 0..100
  response:number;            // 0..100
}
export const FULL_BODY_BALANCE_KEY_V323='sonic-full-body-balance-v323';
export const FULL_BODY_BALANCE_EVENT_V323='sonic:full-body-balance-v323';
export const FULL_BODY_BALANCE_DIAGNOSTIC_V323='sonic:full-body-balance-diagnostics-v323';
export const DEFAULT_FULL_BODY_BALANCE_V323:FullBodyBalanceSettingsV323={enabled:false,stanceTransfer:60,turnCounterbalance:55,landingSoftness:65,response:55};
const safe=(v:unknown,fallback=0)=>typeof v==='number'&&Number.isFinite(v)?v:fallback;
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,safe(v,lo)));
export function normalizeFullBodyBalanceV323(raw:unknown):FullBodyBalanceSettingsV323{
  if(!raw||typeof raw!=='object')return {...DEFAULT_FULL_BODY_BALANCE_V323};
  const r=raw as Partial<FullBodyBalanceSettingsV323>;
  return {enabled:typeof r.enabled==='boolean'?r.enabled:false,
    stanceTransfer:Math.round(clamp(safe(r.stanceTransfer,60),0,100)),
    turnCounterbalance:Math.round(clamp(safe(r.turnCounterbalance,55),0,100)),
    landingSoftness:Math.round(clamp(safe(r.landingSoftness,65),0,100)),
    response:Math.round(clamp(safe(r.response,55),0,100))};
}
let cached:FullBodyBalanceSettingsV323|null=null;
export function readFullBodyBalanceV323():FullBodyBalanceSettingsV323{
  if(cached)return cached;
  if(typeof window==='undefined')return {...DEFAULT_FULL_BODY_BALANCE_V323};
  try{cached=normalizeFullBodyBalanceV323(JSON.parse(window.localStorage.getItem(FULL_BODY_BALANCE_KEY_V323)??'null'));}
  catch{cached={...DEFAULT_FULL_BODY_BALANCE_V323};}
  return cached;
}
export function refreshFullBodyBalanceV323(){cached=null;return readFullBodyBalanceV323();}
export function writeFullBodyBalanceV323(value:FullBodyBalanceSettingsV323){
  cached=normalizeFullBodyBalanceV323(value);
  if(typeof window==='undefined')return;
  try{window.localStorage.setItem(FULL_BODY_BALANCE_KEY_V323,JSON.stringify(cached));}catch{/* optional storage */}
  window.dispatchEvent(new Event(FULL_BODY_BALANCE_EVENT_V323));
}
/** Local foot-X normalized by leg length; measurements are avatar-relative, not meters. */
export interface StanceProbeV323 {
  left:{x:number;contact:boolean;confidence:number}|null;
  right:{x:number;contact:boolean;confidence:number}|null;
}
export type SupportSideV323='left'|'right'|'both'|'none';
export interface StanceEstimateV323{side:SupportSideV323;offset:number;quality:number;count:number;}
export function estimateStanceV323(probe:StanceProbeV323|null|undefined):StanceEstimateV323{
  const left=probe?.left,right=probe?.right;
  const lw=left?.contact&&Number.isFinite(left.x)?clamp(left.confidence,0,1):0;
  const rw=right?.contact&&Number.isFinite(right.x)?clamp(right.confidence,0,1):0;
  const l=lw>=.40?lw:0,r=rw>=.40?rw:0;
  const count=Number(l>0)+Number(r>0);
  if(!count)return {side:'none',offset:0,quality:0,count:0};
  const side:SupportSideV323=count===2?'both':l?'left':'right';
  return {side,offset:clamp(((l*clamp(safe(left?.x),-.38,.38))+(r*clamp(safe(right?.x),-.38,.38)))/(l+r),-.32,.32),
    quality:clamp((l+r)/count,0,1),count};
}
export interface FullBodyBalanceStateV323 {
  lastTime:number|null;lastTrack:string;lastYaw:number|null;
  lean:number;velocity:number;turn:number;landing:number;previousCount:number;
  side:SupportSideV323;
}
export const createFullBodyBalanceStateV323=():FullBodyBalanceStateV323=>({lastTime:null,lastTrack:'',lastYaw:null,lean:0,velocity:0,turn:0,landing:0,previousCount:0,side:'none'});
export function resetFullBodyBalanceV323(state:FullBodyBalanceStateV323){
  state.lastTime=null;state.lastYaw=null;state.lean=0;state.velocity=0;
  state.turn=0;state.landing=0;state.previousCount=0;state.side='none';state.lastTrack='';
}
export interface FullBodyBalanceInputV323 {
  settings:FullBodyBalanceSettingsV323;
  stance:StanceProbeV323|null;
  time:number;delta:number;trackId?:string;
  playing:boolean;reducedMotion:boolean;
  yaw?:number; // live avatar heading; never inferred from music
  authoredClipPriority?:boolean;
}
export interface BalanceMotionV323 {
  hipSway:number;spineSway:number;weightShift:number;chestPulse:number;
  torsoTwist?:number;counterArm?:number;hipCounter?:number;headLag?:number;
}
/** Avoid overly large signed world-yaw deltas at +/- pi wrap. */
export function angleDeltaV323(a:number,b:number):number{
  return Math.atan2(Math.sin(a-b),Math.cos(a-b));
}
/** Preserve the caller's original object when disabled; return ONLY small upper-body
 * overlays if a reliable stance exists, leaving hips/root translation and legs alone. */
export function refineFullBodyBalanceV323<T extends BalanceMotionV323>(state:FullBodyBalanceStateV323,motion:T,input:FullBodyBalanceInputV323):T{
  const t=safe(input.time),dt=clamp(input.delta,0,.10),track=input.trackId??'';
  const discontinuity=state.lastTime!==null&&(t<state.lastTime-.16||t-state.lastTime>2.5);
  const switched=state.lastTrack!==track;
  const angle=typeof input.yaw==='number'&&Number.isFinite(input.yaw)?input.yaw:null;
  const earlierYaw=state.lastYaw;
  state.lastTrack=track;state.lastTime=t;state.lastYaw=angle;
  if(!input.settings.enabled||!input.playing||input.reducedMotion||!dt||switched||discontinuity){
    state.lean=0;state.velocity=0;state.turn=0;state.landing=0;
    state.previousCount=0;state.side='none';return motion;
  }
  const stance=estimateStanceV323(input.stance);
  if(!stance.count){
    // Disallow stale support during airborne phases; next plant has a new reference.
    state.lean=0;state.velocity=0;state.turn=0;state.landing=0;
    state.previousCount=0;state.side='none';return motion;
  }
  const s=input.settings;
  const sourceScale=input.authoredClipPriority?.30:1;
  const strength=(s.stanceTransfer/100)*sourceScale;
  const target=clamp((stance.offset/.28)*stance.quality*strength,-.8,.8);
  // Critically damped response independent of render FPS, with bounded velocity.
  const omega=5+clamp(s.response,0,100)*.08;
  state.velocity=clamp(state.velocity+(omega*omega*(target-state.lean)-2*omega*state.velocity)*dt,-3,3);
  state.lean=clamp(state.lean+state.velocity*dt,-.85,.85);
  const yawDelta=angle!==null&&earlierYaw!==null?angleDeltaV323(angle,earlierYaw):0;
  const targetTurn=clamp(yawDelta/Math.max(dt,.008),-2,2)*stance.quality*(s.turnCounterbalance/100)*sourceScale;
  state.turn+= (targetTurn-state.turn)*(1-Math.exp(-10*dt));
  state.turn=clamp(state.turn,-1.5,1.5);
  if(stance.count>state.previousCount){state.landing=Math.min(1,state.landing+.6*stance.quality);}
  state.previousCount=stance.count;
  state.landing*=Math.exp(-(5+8*s.landingSoftness/100)*dt);
  state.side=stance.side;
  const out={...motion} as T;
  // Tiny counter-rotations: do not touch footStep, legGroove or imported clip tracks.
  out.weightShift=clamp(safe(motion.weightShift)+state.lean*.12,-1.2,1.2);
  out.spineSway=clamp(safe(motion.spineSway)-state.lean*.06,-1.2,1.2);
  out.hipSway=clamp(safe(motion.hipSway)+state.lean*.025,-1.2,1.2);
  out.torsoTwist=clamp(safe(motion.torsoTwist)-state.turn*.06,-.8,.8);
  out.hipCounter=clamp(safe(motion.hipCounter)+state.turn*.032,-.8,.8);
  out.counterArm=clamp(safe(motion.counterArm)-state.lean*.03-state.turn*.025,-.8,.8);
  out.chestPulse=clamp(safe(motion.chestPulse)-state.landing*.018*(s.landingSoftness/100)*sourceScale,-1.2,1.2);
  return out;
}
export function fullBodyBalanceReportV323(state:FullBodyBalanceStateV323){
  return {support:state.side,lean:Math.round(state.lean*100),turn:Math.round(state.turn*100),landing:Math.round(state.landing*100)};
}
