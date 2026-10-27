'use client';
import {useSyncExternalStore} from 'react';
import {appendPiStudioReadingV518,type PiStudioReadingV518,type PiStudioFeaturesV518} from '@/services/monitoring/piConcertPerformanceStudioV518';
const empty:readonly PiStudioReadingV518[]=[];
let readings:readonly PiStudioReadingV518[]=empty;
let features:PiStudioFeaturesV518|null=null;
const listeners=new Set<()=>void>();
const subscribe=(listener:()=>void)=>{listeners.add(listener);return ()=>{listeners.delete(listener);};};
/** ThreeAvatar supplies actual stage flags. The profiler must never guess them from Settings. */
export function setPiStudioFeaturesV518(value:PiStudioFeaturesV518|null){features=value;}
/** Existing one-second V479 render sample only; no timer, extra canvas or extra React render loop. */
export function recordPiStudioV518(value:Omit<PiStudioReadingV518,'features'>,playing:boolean,visible:boolean){
 if(!playing||!visible||!features)return;
 const next=appendPiStudioReadingV518(readings,{...value,features:{...features}});
 if(next===readings)return;
 readings=next;
 for(const listener of listeners)listener();
}
export function usePiStudioV518(){return useSyncExternalStore(subscribe,()=>readings,()=>empty);}
export function clearPiStudioV518(){readings=empty;for(const listener of listeners)listener();}
