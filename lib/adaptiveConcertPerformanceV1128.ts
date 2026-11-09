/** V1128: bounded decoration scheduling from existing, real R3F frame windows.
 * No RAF, timer, storage, microphone, network or hardware side effects.
 * Does not alter music clocks, geometry, camera, avatar motion or authored cues.
 */
export type ConcertFxLevelV1128 = 'full'|'balanced'|'economy';
export type ConcertFxBudgetV1128 = Readonly<{
 level:ConcertFxLevelV1128; badWindows:number; goodWindows:number; holdSeconds:number;
 samples:number; lastFps:number|null; lastP95Ms:number|null; reason:string;
}>;
export type ConcertFxWindowV1128 = Readonly<{
 fps:number;p95Ms:number;slowRatio:number;elapsed:number;samples:number;
 targetFps?:30|45|60;
 playing:boolean;visible:boolean;transitioning:boolean;auto:boolean;
}>;
export const INITIAL_CONCERT_FX_V1128:ConcertFxBudgetV1128=Object.freeze({
 level:'full',badWindows:0,goodWindows:0,holdSeconds:0,samples:0,
 lastFps:null,lastP95Ms:null,reason:'Waiting for valid FPS samples',
});
const levels:readonly ConcertFxLevelV1128[]=['full','balanced','economy'];
const finite=(v:number)=>Number.isFinite(v);
export function initialConcertFxBudgetV1128():ConcertFxBudgetV1128{return INITIAL_CONCERT_FX_V1128;}
/** Hysteresis: three consecutive stressed windows reduce one step, seven stable
 * windows restore one. A >=8s hold prevents rapid oscillation. Poor or missing
 * telemetry, hidden tabs and transitions never count as performance evidence.
 */
export function stepConcertFxBudgetV1128(
 state:ConcertFxBudgetV1128,window:ConcertFxWindowV1128):ConcertFxBudgetV1128{
 if(!window.auto||!window.playing||!window.visible)return INITIAL_CONCERT_FX_V1128;
 if(window.transitioning)return {...state,badWindows:0,goodWindows:0,reason:'Scene transition ignored'};
 if(!finite(window.elapsed)||window.elapsed<.6||window.elapsed>3||
  !Number.isInteger(window.samples)||window.samples<15||
  !finite(window.fps)||window.fps<=0||window.fps>240||
  !finite(window.p95Ms)||window.p95Ms<=0||window.p95Ms>250||
  !finite(window.slowRatio)||window.slowRatio<0||window.slowRatio>1)
  return {...state,badWindows:0,goodWindows:0,reason:'Insufficient frame evidence'};
 const elapsed=Math.min(window.elapsed,2),holdSeconds=Math.max(0,state.holdSeconds-elapsed);
 const target=window.targetFps===30||window.targetFps===45?window.targetFps:60;
 // At a deliberate 30 FPS cap, the legacy "slow frame >33ms" counter is
 // expected to be high; it must not be treated as GPU overload by itself.
 const stressed=window.fps<target*.8||window.p95Ms>1600/target||
  (target>35&&window.slowRatio>.28);
 const stable=window.fps>=target*.93&&window.p95Ms<=1150/target&&
  (target<=35||window.slowRatio<=.12);
 const badWindows=stressed?Math.min(3,state.badWindows+1):0;
 const goodWindows=stable?Math.min(7,state.goodWindows+1):0;
 const common={samples:state.samples+1,lastFps:window.fps,lastP95Ms:window.p95Ms};
 const index=levels.indexOf(state.level);
 if(holdSeconds<=0&&badWindows>=3&&index<2)return {
  ...common,level:levels[index+1],badWindows:0,goodWindows:0,holdSeconds:8,
  reason:'Sustained low FPS: reduce optional FX update work',
 };
 if(holdSeconds<=0&&goodWindows>=7&&index>0)return {
  ...common,level:levels[index-1],badWindows:0,goodWindows:0,holdSeconds:8,
  reason:'Sustained stable FPS: restore optional FX gradually',
 };
 return {...state,...common,badWindows,goodWindows,holdSeconds,
  reason:stressed?'Measuring sustained frame pressure':stable?'Measuring sustained recovery':'FPS between thresholds',
 };
}
/** Only optional refresh frequency & ground fog opacity. All gains <=1. */
const CONCERT_FX_FACTORS_V1128={
 full:Object.freeze({crowdTick:1,ledTick:1,fogTick:1,laserTick:1,fogOpacity:1}),
 balanced:Object.freeze({crowdTick:1.45,ledTick:1.5,fogTick:1.5,laserTick:1.4,fogOpacity:.85}),
 economy:Object.freeze({crowdTick:2,ledTick:2.1,fogTick:2.2,laserTick:2,fogOpacity:.65}),
} as const;
export function concertFxFactorsV1128(level:ConcertFxLevelV1128){
 return CONCERT_FX_FACTORS_V1128[level]??CONCERT_FX_FACTORS_V1128.full;
}

