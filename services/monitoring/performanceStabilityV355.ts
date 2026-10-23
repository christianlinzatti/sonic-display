/** V355: independent, bounded long-session policy. No changes to song or animation clocks. */
import {useSyncExternalStore} from 'react';

export type StabilityDeviceV355='auto'|'display'|'raspberry-pi'|'desktop';
export type StabilityTierV355='high'|'balanced'|'low';
export interface StabilitySettingsV355 {enabled:boolean;device:StabilityDeviceV355;memoryGuard:boolean}
export interface StabilitySampleV355 {at:number;fps:number;p95FrameMs:number|null;heapFraction:number|null;visible:boolean;automatic:boolean}
export interface StabilityStateV355 {cap:StabilityTierV355;bad:number;good:number;memoryBad:number;lastChange:number;lastSample:number;reason:string;changes:number}
export interface StabilityHistoryV355 {at:number;cap:StabilityTierV355;reason:string}
export const STABILITY_STORAGE_V355='sonic-v355-stability-settings';
export const DEFAULT_STABILITY_SETTINGS_V355:StabilitySettingsV355={enabled:true,device:'auto',memoryGuard:true};
export const DEFAULT_STABILITY_STATE_V355:StabilityStateV355={cap:'high',bad:0,good:0,memoryBad:0,lastChange:0,lastSample:0,reason:'Warte auf aktuelle 3D-Messwerte.',changes:0};
export const STABILITY_BAD_WINDOWS_V355=3;
export const STABILITY_GOOD_WINDOWS_V355=9;
export const STABILITY_DOWN_COOLDOWN_V355=20000;
export const STABILITY_UP_COOLDOWN_V355=90000;
const tiers:readonly StabilityTierV355[]=['high','balanced','low'];
export function effectiveDeviceV355(device:StabilityDeviceV355, hints:{coarse:boolean;compact:boolean;linuxArm:boolean}):Exclude<StabilityDeviceV355,'auto'> {
 if(device!=='auto')return device;
 return hints.linuxArm?'raspberry-pi':hints.coarse&&hints.compact?'display':'desktop';
}
export function advanceStabilityV355(prev:StabilityStateV355,sample:StabilitySampleV355,settings:StabilitySettingsV355,device:Exclude<StabilityDeviceV355,'auto'>):StabilityStateV355 {
 if(!settings.enabled||!sample.automatic)return {...prev,cap:'high',bad:0,good:0,memoryBad:0,lastSample:sample.at,reason:!settings.enabled?'Langzeitschutz deaktiviert.':'Manuelle Renderqualität hat Vorrang.'};
 if(!sample.visible||!Number.isFinite(sample.at)||!Number.isFinite(sample.fps)||!Number.isFinite(sample.p95FrameMs)||sample.fps<=0||(sample.p95FrameMs as number)<=0||
   (prev.lastSample>0&&(sample.at<=prev.lastSample||sample.at-prev.lastSample>18000))) {
  return {...prev,bad:0,good:0,memoryBad:0,lastSample:sample.at,reason:'Inaktive oder veraltete Messung – keine Anpassung.'};
 }
 const target=device==='raspberry-pi'?30:device==='display'?45:55;
 const unhealthy=sample.fps<target*.78||(sample.p95FrameMs as number)>(1000/target)*1.55;
 const healthy=sample.fps>=target*.95&&(sample.p95FrameMs as number)<=(1000/target)*1.15;
 const heapHigh=settings.memoryGuard&&sample.heapFraction!==null&&Number.isFinite(sample.heapFraction)&&sample.heapFraction>=.88;
 const bad=unhealthy?prev.bad+1:0;
 const good=healthy&&!heapHigh?prev.good+1:0;
 const memoryBad=heapHigh?prev.memoryBad+1:0;
 const rank=tiers.indexOf(prev.cap);
 const since=sample.at-prev.lastChange;
 if((bad>=STABILITY_BAD_WINDOWS_V355||memoryBad>=3)&&rank<2&&(prev.lastChange===0||since>=STABILITY_DOWN_COOLDOWN_V355)){
  const reason=memoryBad>=3?'Hohe gemeldete JS-Heap-Belegung.':'Anhaltend niedrige FPS oder hohe Framezeiten.';
  return {...prev,cap:tiers[rank+1],bad:0,good:0,memoryBad:0,lastChange:sample.at,lastSample:sample.at,reason,changes:prev.changes+1};
 }
 if(good>=STABILITY_GOOD_WINDOWS_V355&&rank>0&&since>=STABILITY_UP_COOLDOWN_V355){
  return {...prev,cap:tiers[rank-1],bad:0,good:0,memoryBad:0,lastChange:sample.at,lastSample:sample.at,reason:'Über längere Zeit stabile 3D-Darstellung.',changes:prev.changes+1};
 }
 return {...prev,bad:Math.min(bad,STABILITY_BAD_WINDOWS_V355),good:Math.min(good,STABILITY_GOOD_WINDOWS_V355),memoryBad:Math.min(memoryBad,3),lastSample:sample.at,
  reason:heapHigh?'Speicherauslastung wird beobachtet.':unhealthy?'Langsame Frames werden beobachtet.':healthy?'Stabilitätsprüfung läuft.':'Grenzbereich; keine Änderung.'};
}
export function stabilityEffectFactorV355(tier:StabilityTierV355):number{return tier==='low'?.35:tier==='balanced'?.68:1;}
export function stabilityDprCapV355(tier:StabilityTierV355,device:Exclude<StabilityDeviceV355,'auto'>):number {
 const baseline=device==='raspberry-pi'?1:device==='display'?1.25:1.5;
 return Math.min(baseline,tier==='low'?.8:tier==='balanced'?1.05:1.5);
}
export function sanitizeStabilitySettingsV355(input:unknown):StabilitySettingsV355{
 const v=(input&&typeof input==='object'?input:{}) as Partial<StabilitySettingsV355>;
 return {enabled:typeof v.enabled==='boolean'?v.enabled:true,device:v.device==='desktop'||v.device==='display'||v.device==='raspberry-pi'?v.device:'auto',memoryGuard:typeof v.memoryGuard==='boolean'?v.memoryGuard:true};
}
export function readStabilitySettingsV355():StabilitySettingsV355{
 if(typeof window==='undefined')return DEFAULT_STABILITY_SETTINGS_V355;
 try {return sanitizeStabilitySettingsV355(JSON.parse(window.localStorage.getItem(STABILITY_STORAGE_V355)||'{}'));}catch{return DEFAULT_STABILITY_SETTINGS_V355;}
}
let settings:StabilitySettingsV355=DEFAULT_STABILITY_SETTINGS_V355;
let status:StabilityStateV355=DEFAULT_STABILITY_STATE_V355;
let history:StabilityHistoryV355[]=[];
let device:Exclude<StabilityDeviceV355,'auto'>='desktop';
const listeners=new Set<()=>void>();
const notify=()=>{for(const l of listeners)l();};
const subscribe=(l:()=>void)=>{listeners.add(l);return()=>{listeners.delete(l);};};
export function useStabilityV355(){return useSyncExternalStore(subscribe,()=>status,()=>DEFAULT_STABILITY_STATE_V355);}
export function useStabilitySettingsV355(){return useSyncExternalStore(subscribe,()=>settings,()=>DEFAULT_STABILITY_SETTINGS_V355);}
export function useStabilityDeviceV355(){return useSyncExternalStore(subscribe,()=>device,()=> 'desktop' as const);}
export function useStabilityCapV355(){return useSyncExternalStore(subscribe,()=>status.cap,()=>DEFAULT_STABILITY_STATE_V355.cap);}
export function getStabilityCapV355(){return status.cap;}
export function getStabilityDeviceV355(){return device;}
export function getStabilityHistoryV355():readonly StabilityHistoryV355[]{return history.slice();}
export function getStabilitySettingsV355(){return settings;}
export function resetStabilityRuntimeV355(){status=DEFAULT_STABILITY_STATE_V355;history=[];notify();}
export function saveStabilitySettingsV355(raw:unknown){
 settings=sanitizeStabilitySettingsV355(raw);
 try{if(typeof window!=='undefined')window.localStorage.setItem(STABILITY_STORAGE_V355,JSON.stringify(settings));}catch{/* unavailable storage */}
 resetStabilityRuntimeV355();
}
export function initializeStabilityV355(hints:{coarse:boolean;compact:boolean;linuxArm:boolean}){
 settings=readStabilitySettingsV355();device=effectiveDeviceV355(settings.device,hints);status=DEFAULT_STABILITY_STATE_V355;notify();
}
export function sampleStabilityV355(sample:StabilitySampleV355){
 const previous=status;const next=advanceStabilityV355(previous,sample,settings,device);
 if(next.cap!==previous.cap){history=[...history,{at:sample.at,cap:next.cap,reason:next.reason}].slice(-20);}
 status=next;notify();
}
