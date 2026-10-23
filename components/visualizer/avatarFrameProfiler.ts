"use client";
import { useSyncExternalStore } from "react";

export type AvatarFrameStat = {id: string; label: string; meanMs: number; p95Ms: number; maxMs: number; frames: number; updatedAt: number};
type Entry = { label:string; samples:number[]; last:number };
const entries=new Map<string,Entry>();
// V257: bounded session-level comparison, retained across avatar unmounts.
// Every 4th callback is retained; this is a CPU-callback proxy, not total rendering cost.
export type AvatarModelComparison = {label:string; meanMs:number; p95Ms:number; maxMs:number; samples:number; activeInstances:number};
type ModelEntry = {samples:number[]; seen:number};
const modelEntries=new Map<string,ModelEntry>();
let comparisonSnapshot:AvatarModelComparison[]=[];
export function useAvatarModelComparison(){return useSyncExternalStore(subscribe,()=>comparisonSnapshot,()=>[]);}
export function resetAvatarModelComparison(){modelEntries.clear();comparisonSnapshot=[];publish();}

const listeners=new Set<()=>void>();
let snapshot:AvatarFrameStat[]=[];
let lastPublish=0;
const subscribe=(fn:()=>void)=>{listeners.add(fn);return ()=>{listeners.delete(fn);};};
export function useAvatarFrameProfiler(){return useSyncExternalStore(subscribe,()=>snapshot,()=>[]);}
function publish(){
  snapshot=Array.from(entries,([id,e])=>{
    const sorted=[...e.samples].sort((a,b)=>a-b);
    return {id,label:e.label,meanMs:e.samples.reduce((a,b)=>a+b,0)/e.samples.length,
      p95Ms:sorted[Math.max(0,Math.ceil(sorted.length*.95)-1)]??0,maxMs:sorted[sorted.length-1]??0,
      frames:e.samples.length,updatedAt:e.last};
  }).sort((a,b)=>b.p95Ms-a.p95Ms);
  comparisonSnapshot=Array.from(modelEntries,([label,m])=>{
    const sorted=[...m.samples].sort((a,b)=>a-b);
    return {label,meanMs:m.samples.reduce((a,b)=>a+b,0)/m.samples.length,
      p95Ms:sorted[Math.max(0,Math.ceil(sorted.length*.95)-1)]??0,
      maxMs:sorted[sorted.length-1]??0,samples:m.samples.length,
      activeInstances:Array.from(entries.values()).filter(e=>e.label===label).length};
  }).sort((a,b)=>a.p95Ms-b.p95Ms);
  for(const fn of listeners)fn();
}
/** Samples synchronous avatar useFrame CPU time; excludes GPU and other useFrame callbacks. */
export function recordAvatarFrame(id:string,label:string,durationMs:number,nowMs:number){
  if(!Number.isFinite(durationMs)||durationMs<0||durationMs>1000)return;
  let entry=entries.get(id);
  if(!entry){entry={label,samples:[],last:nowMs};entries.set(id,entry);}
  entry.label=label;entry.last=nowMs;
  if(entry.samples.length>=120)entry.samples.shift();
  entry.samples.push(durationMs);
  let model=modelEntries.get(label);
  if(!model && modelEntries.size<32){model={samples:[],seen:0};modelEntries.set(label,model);}
  if(model && ++model.seen%4===0){
    if(model.samples.length>=240)model.samples.shift();
    model.samples.push(durationMs);
  }
  if(nowMs-lastPublish>=1000){lastPublish=nowMs;publish();}
}
export function releaseAvatarFrame(id:string){if(entries.delete(id))publish();}
export function resetAvatarFrameProfiler(){entries.clear();modelEntries.clear();snapshot=[];comparisonSnapshot=[];lastPublish=0;for(const fn of listeners)fn();}

/** Synchronous read for the animation scheduler, avoiding render subscriptions. */
export function getAvatarFrameStats(): readonly AvatarFrameStat[] { return snapshot; }
