'use client';
import {useSyncExternalStore} from 'react';
import {captureStageSafetyV511,EMPTY_STAGE_SAFETY_V511,type StageSafetySnapshotV511} from './concertStageQualityV511';
import type {AnimatedCollisionPlanV508} from './animatedCollisionV508';
import {publishVisualFrameV512,clearVisualFramesV512} from './visualConcertQualityRuntimeV512';
let snapshot:StageSafetySnapshotV511=EMPTY_STAGE_SAFETY_V511;
const subscribers=new Set<()=>void>();
function subscribe(fn:()=>void){subscribers.add(fn);return()=>{subscribers.delete(fn);};}
export function recordStageSafetyV511(input:{at:number;source:'duo'|'group';avatars:number;plan:AnimatedCollisionPlanV508;playing:boolean;visible:boolean;positions?:readonly (readonly number[])[]}){
 // This is called from the *existing* V508 R3F callback. Publication is <= 1 Hz.
 const next=captureStageSafetyV511(snapshot,input);
 if(next===snapshot)return;
 snapshot=next;publishVisualFrameV512(next.readings[next.readings.length-1],input.positions,input.plan);for(const fn of subscribers)fn();
}
export function useStageSafetyV511(){return useSyncExternalStore(subscribe,()=>snapshot,()=>EMPTY_STAGE_SAFETY_V511);}
export function clearStageSafetyV511(){snapshot=EMPTY_STAGE_SAFETY_V511;clearVisualFramesV512();for(const fn of subscribers)fn();}
