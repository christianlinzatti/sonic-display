"use client";
import {useSyncExternalStore} from 'react';
import {INITIAL_CONCERT_FX_V1128,type ConcertFxBudgetV1128} from '@/lib/adaptiveConcertPerformanceV1128';
let current:ConcertFxBudgetV1128=INITIAL_CONCERT_FX_V1128;
const subscribers=new Set<()=>void>();
export function getConcertFxBudgetV1128(){return current;}
export function publishConcertFxBudgetV1128(next:ConcertFxBudgetV1128){
 // No React update on every FPS window: components read the cached snapshot in
 // their existing useFrame; the settings panel updates only on tier transitions.
 if(next.level!==current.level||next.reason!==current.reason&&next.level==='full'&&next.samples===0){
  current=next;for(const listener of subscribers)listener();
 }else current=next;
}
export function subscribeConcertFxBudgetV1128(listener:()=>void){
 subscribers.add(listener);return ()=>{subscribers.delete(listener);};
}
export function useConcertFxBudgetV1128(){return useSyncExternalStore(
 subscribeConcertFxBudgetV1128,getConcertFxBudgetV1128,()=>INITIAL_CONCERT_FX_V1128);}
