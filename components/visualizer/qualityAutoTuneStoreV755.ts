'use client';
import {useSyncExternalStore} from 'react';
import {INITIAL_TUNE_V755,type TuneStateV755} from './qualityAutoTunerV755';

// Explicitly opted in per browser tab. Never stored or sent to a server.
let enabled=false;
let status:TuneStateV755={...INITIAL_TUNE_V755};
const observers=new Set<()=>void>();
const listen=(cb:()=>void)=>{observers.add(cb);return()=>{observers.delete(cb);};};
const emit=()=>{for(const cb of observers)cb();};
export function useQualityAutoTuneEnabledV755(){return useSyncExternalStore(listen,()=>enabled,()=>false);}
export function useQualityAutoTuneStatusV755(){return useSyncExternalStore(listen,()=>status,()=>INITIAL_TUNE_V755);}
export function getQualityAutoTuneStatusV755(){return status;}
export function setQualityAutoTuneEnabledV755(next:boolean){
 const value=next===true;
 if(enabled===value)return;
 enabled=value;
 status={...INITIAL_TUNE_V755};
 emit();
}
export function publishQualityAutoTuneV755(next:TuneStateV755){
 if(Object.keys(status).every(key=>status[key as keyof TuneStateV755]===next[key as keyof TuneStateV755]))return;
 status=next;
 emit();
}
