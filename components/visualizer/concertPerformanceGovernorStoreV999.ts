"use client";
import {useSyncExternalStore} from 'react';
import {advanceConcertBudgetV999,concertBudgetFactorsV999,initialConcertBudgetV999,
 type ConcertBudgetV999,type ConcertBudgetWindowV999,type ConcertBudgetFactorsV999} from './intelligentPerformanceGovernorV999';
export const GOVERNOR_TTL_V999=5000;
export type ConcertGovernorStatusV999=Readonly<{
 enabled:boolean;targetFps:30|45|60;state:ConcertBudgetV999;
 at:number;fps:number|null;p95FrameMs:number|null;active:boolean;
}>;
const neutral=initialConcertBudgetV999();
let status:ConcertGovernorStatusV999={enabled:true,targetFps:45,state:neutral,at:0,fps:null,p95FrameMs:null,active:false};
const subscribers=new Set<()=>void>();
const levelSubscribers=new Set<()=>void>();
const subscribeLevel=(cb:()=>void)=>{levelSubscribers.add(cb);return()=>{levelSubscribers.delete(cb);};};
const getLevel=()=>status.enabled&&status.active?status.state.level:0;
export const useConcertGovernorLevelV999=()=>useSyncExternalStore(subscribeLevel,getLevel,()=>0);
const subscribe=(cb:()=>void)=>{subscribers.add(cb);return()=>{subscribers.delete(cb);};};
const publish=(next:ConcertGovernorStatusV999)=>{
 const oldLevel=getLevel();status=next;
 for(const listener of subscribers)listener();
 if(oldLevel!==getLevel())for(const listener of levelSubscribers)listener();
};
export const getConcertGovernorStatusV999=()=>status;
export const useConcertGovernorV999=()=>useSyncExternalStore(subscribe,getConcertGovernorStatusV999,getConcertGovernorStatusV999);
export function configureConcertGovernorV999(enabled:boolean,targetFps:30|45|60=status.targetFps){
 if(typeof enabled!=='boolean'||![30,45,60].includes(targetFps))return;
 publish({...status,enabled,targetFps,state:initialConcertBudgetV999(),active:false,at:0,fps:null,p95FrameMs:null});
}
export function resetConcertGovernorV999(){
 if(status.active||status.at||status.state.level>0)publish({...status,state:initialConcertBudgetV999(),active:false,at:0,fps:null,p95FrameMs:null});
}
export function sampleConcertGovernorV999(window:Omit<ConcertBudgetWindowV999,'targetFps'>,at:number){
 if(!status.enabled||!window.auto||!window.playing||!window.visible||window.transitioning){resetConcertGovernorV999();return;}
 if(!Number.isFinite(at)||at<=0)return;
 const next=advanceConcertBudgetV999(status.state,{...window,targetFps:status.targetFps});
 // Invalid telemetry must not refresh the TTL and must not act as a measurement.
 const valid=Number.isFinite(window.fps)&&window.fps>0&&window.fps<=240&&
   Number.isFinite(window.p95FrameMs)&&window.p95FrameMs>0&&window.p95FrameMs<=250&&
   Number.isFinite(window.slowRatio)&&window.slowRatio>=0&&window.slowRatio<=1&&
   Number.isFinite(window.elapsed)&&window.elapsed>=.5&&window.elapsed<=2.5&&
   Number.isFinite(window.drawCalls)&&window.drawCalls>=0&&
   Number.isFinite(window.triangles)&&window.triangles>=0&&
   Number.isInteger(window.avatarCount)&&window.avatarCount>=0&&window.avatarCount<=64;
 if(!valid)return;
 publish({...status,state:next,active:true,at,fps:window.fps,p95FrameMs:window.p95FrameMs});
}
/** Read-only bridge for the existing render loop. No timer or React commit per frame.
 * Stale samples, pause and manual quality have neutral factors.
 */
export function getConcertFactorsV999(now:number=Date.now()):ConcertBudgetFactorsV999{
 if(!status.enabled||!status.active||now<status.at||now-status.at>GOVERNOR_TTL_V999)
  return concertBudgetFactorsV999(0);
 return concertBudgetFactorsV999(status.state.level);
}
