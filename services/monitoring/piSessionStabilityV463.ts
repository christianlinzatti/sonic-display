/** V463: conservative scene-transition grace for the existing V253/V355 quality regulators.
 * Pure transition logic plus an in-memory snapshot read from the existing 3D render loop.
 * Does not change transport time, animation clocks, authored quality or GLB assets.
 */
export interface PiSessionInputV463 {
  at:number;
  trackId:string|null|undefined;
  playing:boolean;
  visible:boolean;
  graphicsReady:boolean;
}
export interface PiSessionGuardV463 {
  lastAt:number;
  lastTransitionAt:number;
  holdUntil:number;
  trackId:string;
  playing:boolean;
  visible:boolean;
  graphicsReady:boolean;
  suspended:boolean;
  reason:string;
  transitions:number;
}
export const PI_TRACK_GRACE_MS_V463=12000;
export const PI_RESUME_GRACE_MS_V463=8000;
export const PI_CONTEXT_GRACE_MS_V463=15000;
export const initialPiSessionGuardV463:PiSessionGuardV463={
  lastAt:0,lastTransitionAt:0,holdUntil:0,trackId:'',playing:false,visible:true,
  graphicsReady:true,suspended:false,reason:'Initialisiert',transitions:0,
};
const finiteAt=(at:number):number|null=>Number.isFinite(at)&&at>=0?at:null;
export function advancePiSessionGuardV463(previous:PiSessionGuardV463,input:PiSessionInputV463):PiSessionGuardV463 {
  const at=finiteAt(input.at);
  if(at===null)return previous;
  const trackId=typeof input.trackId==='string'?input.trackId.trim().slice(0,256):'';
  const playing=input.playing===true,visible=input.visible===true,graphicsReady=input.graphicsReady===true;
  const suspended=!trackId||!playing||!visible||!graphicsReady;
  const initial=previous.lastAt===0;
  const trackChanged=trackId!==previous.trackId;
  const returned=visible&&!previous.visible;
  const resumed=playing&&!previous.playing;
  const contextRestored=graphicsReady&&!previous.graphicsReady;
  const clockJump=previous.lastAt>0&&(at<previous.lastAt||at-previous.lastAt>60000);
  const changed=initial||trackChanged||returned||resumed||contextRestored||clockJump;
  let holdUntil=previous.holdUntil;
  let lastTransitionAt=previous.lastTransitionAt;
  let reason=previous.reason;
  if(changed){
    const grace=trackChanged||initial?PI_TRACK_GRACE_MS_V463:contextRestored?PI_CONTEXT_GRACE_MS_V463:PI_RESUME_GRACE_MS_V463;
    // Resumes cannot shorten an ongoing song-loading grace. A real track change starts its own window.
    holdUntil=trackChanged||initial?at+grace:Math.max(previous.holdUntil,at+grace);
    lastTransitionAt=at;
    reason=trackChanged?'Songwechsel / GLB-Ladephase':contextRestored?'WebGL-Wiederherstellung':returned?'Tab wieder sichtbar':resumed?'Wiedergabe fortgesetzt':'Initialisierung / Zeitunterbrechung';
  }
  if(suspended)reason=!graphicsReady?'WebGL nicht verfügbar':!visible?'Hintergrund-Tab':!trackId?'Kein aktiver Song':'Wiedergabe pausiert';
  return {lastAt:at,lastTransitionAt,holdUntil,trackId,playing,visible,graphicsReady,suspended,reason,
    transitions:previous.transitions+(changed?1:0)};
}
/** True during loading, hidden tabs, paused playback or unavailable WebGL.
 * The existing FPS publication still runs; ONLY automatic tier/calibration updates are gated.
 */
export function blockAutomaticQualityV463(state:PiSessionGuardV463,at:number):boolean {
  return state.suspended||(Number.isFinite(at)&&at<state.holdUntil);
}
export function acceptPiSessionMetricsV463(state:PiSessionGuardV463,at:number,updatedAt:number):boolean {
  return Number.isFinite(at)&&Number.isFinite(updatedAt)&&updatedAt>0&&updatedAt<=at&&
    at-updatedAt<=3500&&updatedAt>state.lastTransitionAt&&!blockAutomaticQualityV463(state,at);
}
let livePiSessionGuardV463:PiSessionGuardV463=initialPiSessionGuardV463;
export function observePiSessionV463(input:PiSessionInputV463):PiSessionGuardV463 {
  livePiSessionGuardV463=advancePiSessionGuardV463(livePiSessionGuardV463,input);
  return livePiSessionGuardV463;
}
export function getPiSessionGuardV463():PiSessionGuardV463{return livePiSessionGuardV463;}
export function isPiQualityTransitionV463(at:number):boolean {
  return blockAutomaticQualityV463(livePiSessionGuardV463,at);
}
export function resetPiSessionGuardV463():void {livePiSessionGuardV463=initialPiSessionGuardV463;}
