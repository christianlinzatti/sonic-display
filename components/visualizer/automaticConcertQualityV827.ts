/** V827: hysteretic adaptive FX quality. Real R3F frame cadence, never GPU timing.
 * Operates only after the V826 measurement window has completed (<= 2Hz).
 * Can only increase the pressure supplied to the already safety-gated V825 budget.
 */
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
export type AutoQualityResponseV827='gentle'|'balanced'|'responsive';
export interface AutoQualityStateV827{
 pressure:number;badWindows:number;goodWindows:number;observations:number;
 reason:'off'|'waiting'|'stable'|'throttling'|'recovering';
}
export const createAutoQualityV827=():AutoQualityStateV827=>({pressure:0,badWindows:0,goodWindows:0,observations:0,reason:'waiting'});
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function advanceAutomaticQualityV827(s:AutoQualityStateV827,input:{
 snapshot:Pick<ConcertQualitySnapshotV826,'available'|'playing'|'verified'|'sampleCount'|'frameMs'|'p95FrameMs'|'slowFrameShare'|'targetFps'>;
 enabled:boolean;optimizerEnabled:boolean;response:AutoQualityResponseV827;
}):AutoQualityStateV827{
 const q=input.snapshot;
 if(!input.enabled||!input.optimizerEnabled){s.pressure=0;s.badWindows=0;s.goodWindows=0;s.reason='off';return s;}
 if(!q.available||!q.playing||!q.verified||q.sampleCount<6||
    !Number.isFinite(q.frameMs)||!Number.isFinite(q.p95FrameMs)||!Number.isFinite(q.slowFrameShare)||
    q.frameMs<=0||q.p95FrameMs<=0||q.slowFrameShare<0||q.slowFrameShare>1||
    (q.targetFps!==30&&q.targetFps!==60)){
   s.badWindows=0;s.goodWindows=0;s.pressure=0;s.reason='waiting';return s;
 }
 s.observations=Math.min(1000000,s.observations+1);
 const target=1000/q.targetFps;
 const response=input.response==='gentle'?'gentle':input.response==='responsive'?'responsive':'balanced';
 const bad=q.frameMs>target*1.29||q.p95FrameMs>target*1.65||q.slowFrameShare>.38;
 const good=q.frameMs<target*1.10&&q.p95FrameMs<target*1.27&&q.slowFrameShare<.12;
 if(bad){
   s.goodWindows=0;s.badWindows=Math.min(12,s.badWindows+1);
   const required=response==='responsive'?2:response==='gentle'?4:3;
   if(s.badWindows>=required){
     const severity=clamp(Math.max(q.frameMs/target-1,q.p95FrameMs/target-1)*.27+q.slowFrameShare*.32,.10,.55);
     s.pressure=clamp(s.pressure+severity*(response==='gentle'?.12:response==='responsive'?.35:.23),0,.85);
     s.reason='throttling';
   }
 }else if(good){
   s.badWindows=0;s.goodWindows=Math.min(30,s.goodWindows+1);
   const required=response==='responsive'?4:response==='gentle'?8:6;
   if(s.goodWindows>=required){
     s.pressure=Math.max(0,s.pressure-(response==='gentle'?.014:response==='responsive'?.038:.025));
     s.reason=s.pressure>0?'recovering':'stable';
   }
 }else{s.badWindows=0;s.goodWindows=0;s.reason=s.pressure>0?'recovering':'stable';}
 return s;
}
/** Auto-tuning must never activate V825, bypass the song gate, or add FX. */
export function effectiveFxPressureV827(observed:number,tuner:AutoQualityStateV827,enabled:boolean):number{
 const measured=Number.isFinite(observed)?clamp(observed,0,1):0;
 return enabled?Math.max(measured,clamp(tuner.pressure,0,.85)):measured;
}
