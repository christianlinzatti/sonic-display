'use client';
/** V1000 – local preference only. Never persists song titles, timings or histories. */
import {useSyncExternalStore} from 'react';
import {DEFAULT_IMMERSIVE_V1000,IMMERSIVE_KEY_V1000,normalizeImmersiveV1000,
 type ImmersiveSettingsV1000} from './immersiveConcertDirectorV1000';
let settings:ImmersiveSettingsV1000=DEFAULT_IMMERSIVE_V1000;
const listeners=new Set<()=>void>();
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export const getImmersiveSettingsV1000=()=>settings;
export const useImmersiveSettingsV1000=()=>useSyncExternalStore(subscribe,getImmersiveSettingsV1000,()=>DEFAULT_IMMERSIVE_V1000);
function publish(next:ImmersiveSettingsV1000){
 if(settings.enabled===next.enabled&&settings.style===next.style&&settings.intensity===next.intensity&&settings.protectLyrics===next.protectLyrics)return;
 settings=next;for(const listener of listeners)listener();
}
export function setImmersiveSettingsV1000(raw:unknown){
 const next=normalizeImmersiveV1000(raw);publish(next);
 try{if(typeof window!=='undefined')window.localStorage.setItem(IMMERSIVE_KEY_V1000,JSON.stringify(next));}catch{/* private mode, storage full */}
}
export function restoreImmersiveSettingsV1000(){
 try{if(typeof window==='undefined')return;
  const json=window.localStorage.getItem(IMMERSIVE_KEY_V1000);if(json)publish(normalizeImmersiveV1000(JSON.parse(json)));
 }catch{/* storage unavailable, defaults safe */}
}
