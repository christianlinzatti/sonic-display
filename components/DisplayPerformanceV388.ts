"use client";
import {useEffect,useSyncExternalStore} from "react";
import type {DisplayProfileV388} from "./visualizer/displayPerformancePolicyV388";
const KEY="sonic-display:v388:display-profile";
const valid=new Set<DisplayProfileV388>(["off","auto","eco","sharp"]);
type Snapshot={profile:DisplayProfileV388;kioskEnabled:boolean};
const defaultState:Snapshot={profile:"off",kioskEnabled:false};
let state:Snapshot=defaultState;
const listeners=new Set<()=>void>();
function emit(next:Snapshot){if(state.profile===next.profile&&state.kioskEnabled===next.kioskEnabled)return;state=next;for(const cb of listeners)cb();}
function subscribe(cb:()=>void){listeners.add(cb);return ()=>{listeners.delete(cb);};}
/** External store: all canvases see the same profile without polling or per-frame rerenders. */
export function useDisplayProfileV388(){
 const snapshot=useSyncExternalStore(subscribe,()=>state,()=>defaultState);
 useEffect(()=>{
  try{const saved=window.localStorage.getItem(KEY) as DisplayProfileV388|null;if(saved&&valid.has(saved))emit({...state,profile:saved});}catch{}
  const sync=(event:StorageEvent)=>{if(event.key!==KEY)return;const value=event.newValue as DisplayProfileV388|null;emit({...state,profile:value&&valid.has(value)?value:"off"});};
  window.addEventListener("storage",sync);return()=>window.removeEventListener("storage",sync);
 },[]);
 return {...snapshot,setProfile:setDisplayProfileV388};
}
export function setDisplayProfileV388(profile:DisplayProfileV388){
 if(!valid.has(profile))return;
 try{if(typeof window!=="undefined")window.localStorage.setItem(KEY,profile);}catch{}
 emit({...state,profile});
}
export function setKioskActiveV388(kioskEnabled:boolean){emit({...state,kioskEnabled});}
