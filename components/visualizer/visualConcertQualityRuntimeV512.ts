'use client';
import {useSyncExternalStore} from 'react';
import {appendVisualFrameV512,type VisualHistoryV512} from './visualConcertQualityV512';
import type {StageSafetyReadingV511} from './concertStageQualityV511';
import type {AnimatedCollisionPlanV508} from './animatedCollisionV508';
const EMPTY_VISUAL_V512:VisualHistoryV512=[];
let history:VisualHistoryV512=EMPTY_VISUAL_V512;
const listeners=new Set<()=>void>();
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export function publishVisualFrameV512(reading:StageSafetyReadingV511,positions:readonly (readonly number[])[]|undefined,plan:AnimatedCollisionPlanV508){
 const next=appendVisualFrameV512(history,reading,positions,plan);
 if(next===history)return;
 history=next;for(const fn of listeners)fn();
}
export function useVisualFramesV512(){return useSyncExternalStore(subscribe,()=>history,()=>EMPTY_VISUAL_V512);}
export function clearVisualFramesV512(){history=EMPTY_VISUAL_V512;for(const fn of listeners)fn();}
