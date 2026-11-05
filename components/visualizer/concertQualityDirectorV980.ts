/** V980 – Concert Quality & Performance Director.
 * Consumes only completed, verified V826 renderer measurement windows (<=2 Hz).
 * This is frame-cadence telemetry, not GPU timings or predicted FPS.
 * In-memory only: no timers, persistence, network, React renders or audio changes.
 * V825 remains the sole FX quality executor with its authored/lyrics/vocal floors.
 */
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
export type QualityModeV980='visual'|'balanced'|'performance';
export type QualityReasonV980='off'|'waiting'|'stable'|'observing'|'reducing'|'holding'|'restoring';
export interface ConcertQualityDirectorStateV980 {
 pressure:number;reason:QualityReasonV980;badWindows:number;goodWindows:number;
 observations:number;scopeKey:string;lastFps:number;targetFps:30|60;
}
export const createConcertQualityDirectorV980=():ConcertQualityDirectorStateV980=>({
 pressure:0,reason:'off',badWindows:0,goodWindows:0,observations:0,
 scopeKey:'',lastFps:0,targetFps:60,
});
export function clearAdaptiveQualityV980(s:ConcertQualityDirectorStateV980,reason:QualityReasonV980='off'):
 ConcertQualityDirectorStateV980 {
 s.pressure=0;s.reason=reason;s.badWindows=0;s.goodWindows=0;
 s.observations=0;s.scopeKey='';s.lastFps=0;s.targetFps=60;return s;
}
const cap=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function advanceConcertQualityDirectorV980(s:ConcertQualityDirectorStateV980,i:{
 snapshot:Pick<ConcertQualitySnapshotV826,'available'|'verified'|'playing'|'sampleCount'|'fps'|'frameMs'|'p95FrameMs'|'slowFrameShare'|'targetFps'>;
 enabled:boolean;optimizerEnabled:boolean;telemetryEnabled:boolean;
 tier:'low'|'balanced'|'high';allowLowTier:boolean;restore:boolean;
 mode:QualityModeV980;scopeKey:string;
}):ConcertQualityDirectorStateV980 {
 const q=i.snapshot;
 if(!i.enabled||!i.optimizerEnabled||!i.telemetryEnabled)return clearAdaptiveQualityV980(s,'off');
 if(i.tier==='low'&&!i.allowLowTier)return clearAdaptiveQualityV980(s,'off');
 // Do not carry quality pressure across a song, preview, seek scope or a stopped track.
 if(!i.scopeKey || (s.scopeKey!==''&&s.scopeKey!==i.scopeKey)){
   clearAdaptiveQualityV980(s,'waiting');
   if(!i.scopeKey)return s;
 }
 s.scopeKey=i.scopeKey;
 if(!q.available||!q.verified||!q.playing||q.sampleCount<6||
    (q.targetFps!==30&&q.targetFps!==60)||
    q.targetFps!==(i.tier==='low'?30:60)||
    !Number.isFinite(q.fps)||!Number.isFinite(q.frameMs)||
    !Number.isFinite(q.p95FrameMs)||!Number.isFinite(q.slowFrameShare)||
    q.fps<=0||q.frameMs<=0||q.p95FrameMs<=0||
    q.slowFrameShare<0||q.slowFrameShare>1){
   return clearAdaptiveQualityV980(s,'waiting');
 }
 s.scopeKey=i.scopeKey;s.lastFps=q.fps;s.targetFps=q.targetFps;
 s.observations=Math.min(100000,s.observations+1);
 const target=1000/q.targetFps;
 const mode=i.mode==='visual'?'visual':i.mode==='performance'?'performance':'balanced';
 const thresholds=mode==='visual'?[1.32,1.78,.43]:mode==='performance'?[1.13,1.37,.25]:[1.23,1.55,.34];
 const bad=q.frameMs>target*thresholds[0]||q.p95FrameMs>target*thresholds[1]||q.slowFrameShare>thresholds[2];
 const good=q.frameMs<target*1.09&&q.p95FrameMs<target*1.23&&q.slowFrameShare<.11;
 if(bad){
  s.badWindows=Math.min(30,s.badWindows+1);s.goodWindows=0;
  const required=mode==='visual'?4:mode==='performance'?2:3;
  if(s.badWindows>=required){
   const excess=Math.max(q.frameMs/target-1,q.p95FrameMs/target-1,q.slowFrameShare);
   const delta=cap(excess*.075,.025,mode==='performance'?.095:.075);
   s.pressure=cap(s.pressure+delta,0,.85);s.reason='reducing';
  }else{s.reason='observing';}
 }else if(good){
  s.badWindows=0;s.goodWindows=Math.min(40,s.goodWindows+1);
  if(!i.restore){s.reason=s.pressure>0?'holding':'stable';return s;}
  const required=mode==='visual'?8:mode==='performance'?5:6;
  if(s.goodWindows>=required){
   s.pressure=Math.max(0,s.pressure-(mode==='visual'?.012:mode==='performance'?.022:.018));
   s.reason=s.pressure>0?'restoring':'stable';
  }else{s.reason=s.pressure>0?'holding':'stable';}
 }else{
  s.badWindows=0;s.goodWindows=0;s.reason=s.pressure>0?'holding':'stable';
 }
 return s;
}
/** V980 cannot raise an existing V825 gain or bypass the lower-level safety budget. */
export function qualityPressureV980(observed:number,s:ConcertQualityDirectorStateV980,enabled:boolean):number{
 const baseline=Number.isFinite(observed)?cap(observed,0,1):0;
 return enabled?Math.max(baseline,cap(s.pressure,0,.85)):baseline;
}
