"use client";
import {useSyncExternalStore} from 'react';
import type {RecoveryPhaseV395,RecoveryCauseV395} from './visualizer/displayRecoveryPolicyV395';
const STORAGE='sonic-display:v395:auto-recovery';
export type ProductionEventV395={at:number;type:string;details:string};
type Snapshot={enabled:boolean;kiosk:boolean;phase:RecoveryPhaseV395;cause:RecoveryCauseV395;attempts:number;events:ProductionEventV395[]};
const initial:Snapshot={enabled:true,kiosk:false,phase:'ready',cause:null,attempts:0,events:[]};
let snapshot=initial;
const listeners=new Set<()=>void>();
const subscribe=(cb:()=>void)=>{listeners.add(cb);return()=>{listeners.delete(cb);};};
const notify=(patch:Partial<Snapshot>)=>{snapshot={...snapshot,...patch};for(const listener of listeners)listener();};
export const getProductionSnapshotV395=()=>snapshot;
export function useDisplayProductionV395(){return useSyncExternalStore(subscribe,getProductionSnapshotV395,()=>initial);}
export function hydrateDisplayProductionV395(){
  try {notify({enabled:window.localStorage.getItem(STORAGE)!=='false'});} catch { /* storage can be disabled in kiosk */ }
}
export function setProductionKioskV395(kiosk:boolean){if(snapshot.kiosk!==kiosk)notify({kiosk});}
export function setAutoRecoveryV395(enabled:boolean){if(snapshot.enabled!==enabled)notify({enabled});try{window.localStorage.setItem(STORAGE,String(enabled));}catch{}}
export function setProductionRecoveryStateV395(phase:RecoveryPhaseV395,cause:RecoveryCauseV395,attempts:number){
  if(snapshot.phase!==phase||snapshot.cause!==cause||snapshot.attempts!==attempts)notify({phase,cause,attempts});
}
export function appendProductionEventV395(type:string,details:string){
  notify({events:[...snapshot.events,{at:Date.now(),type,details:details.slice(0,180)}].slice(-18)});
}
export function clearProductionEventsV395(){notify({events:[]});}
