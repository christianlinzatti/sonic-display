"use client";
import { useSyncExternalStore } from "react";

export type LodPoseSample = {
  source: string; asset: string; owner: string; sampledAt: number;
  clips: Record<string, {time: number; weight: number}>;
  bones: Record<string, [number, number, number, number]>;
};
export type LodContinuityReport = {
  active: boolean; source: string; variants: string[]; clipsCompared: number;
  maxClipDeltaMs: number | null; bonesCompared: number;
  averageAngularErrorDeg: number | null; maxAngularErrorDeg: number | null;
  score: number | null; warning: string;
};
const EMPTY: LodContinuityReport = Object.freeze({active:false,source:"",variants:[],clipsCompared:0,maxClipDeltaMs:null,bonesCompared:0,averageAngularErrorDeg:null,maxAngularErrorDeg:null,score:null,warning:"Kein gleichzeitiger LOD-Wechsel messbar."});
const samples = new Map<string, LodPoseSample>();
let snapshot: LodContinuityReport = EMPTY;
const listeners = new Set<() => void>();
export function quaternionAngularErrorDeg(a: number[], b: number[]) {
  if (a.length !== 4 || b.length !== 4 || [...a,...b].some(x=>!Number.isFinite(x))) return null;
  const na = Math.hypot(...a), nb = Math.hypot(...b);
  if (na < 1e-8 || nb < 1e-8) return null;
  const dot = Math.min(1,Math.max(0,Math.abs(a.reduce((sum,x,i)=>sum+x*b[i],0)/(na*nb))));
  return Math.acos(dot)*360/Math.PI;
}
export function compareLodPose(a:LodPoseSample,b:LodPoseSample):LodContinuityReport {
  const clipNames = Object.keys(a.clips).filter(k=>b.clips[k] && a.clips[k].weight>0.01 && b.clips[k].weight>0.01);
  const clipDeltas = clipNames.map(k=>Math.abs(a.clips[k].time-b.clips[k].time)*1000).filter(Number.isFinite);
  const angular = Object.keys(a.bones).filter(k=>b.bones[k]).map(k=>quaternionAngularErrorDeg(a.bones[k],b.bones[k])).filter((v):v is number=>v!==null);
  const maxClipDeltaMs = clipDeltas.length ? Math.max(...clipDeltas) : null;
  const averageAngularErrorDeg = angular.length ? angular.reduce((a,b)=>a+b,0)/angular.length : null;
  const maxAngularErrorDeg = angular.length ? Math.max(...angular):null;
  const score = angular.length || clipDeltas.length ? Math.max(0,Math.round(100-(averageAngularErrorDeg??0)*1.5-(maxClipDeltaMs??0)*0.08)) : null;
  return {active:true,source:a.source,variants:[a.asset,b.asset],clipsCompared:clipDeltas.length,maxClipDeltaMs,bonesCompared:angular.length,averageAngularErrorDeg,maxAngularErrorDeg,score,warning:!angular.length?'Keine gemeinsamen Bones gefunden; Posenvergleich nicht möglich.':!clipDeltas.length?'Keine aktiven gemeinsamen Animationsclips.':maxClipDeltaMs!==null && maxClipDeltaMs>100?'Animationszeit weicht um mehr als 100 ms ab.':''};
}
export function publishLodPoseSample(sample:LodPoseSample) {
  samples.set(sample.owner,sample);
  for(const [key,item] of samples) if(sample.sampledAt-item.sampledAt>0.6) samples.delete(key);
  // V569 – avoid arrays, pose comparisons and subscriber notifications when
  // only one LOD of an avatar is present (normal operation on the Pi).
  let outgoing:LodPoseSample|null=null;
  for(const item of samples.values()){
    if(item.source===sample.source&&item.owner!==sample.owner&&item.asset!==sample.asset){outgoing=item;break;}
  }
  const next=outgoing?compareLodPose(outgoing,sample):EMPTY;
  if(next===EMPTY&&snapshot===EMPTY)return;
  snapshot=next;listeners.forEach(fn=>fn());
}
/** Read the outgoing (first registered) LOD as a pose reference for the newer instance.
 * The pose correction must not feed back into the outgoing model.
 */
export function getOutgoingLodPose(source:string, incomingOwner:string, now:number):LodPoseSample|null {
  // No intermediate Array.from/filter/find allocations in the render loop.
  let first:LodPoseSample|null=null;
  let count=0;
  let incomingPresent=false;
  for(const item of samples.values()){
    if(item.source!==source||now<item.sampledAt||now-item.sampledAt>=0.35)continue;
    if(first===null)first=item;
    count++;
    if(item.owner===incomingOwner)incomingPresent=true;
  }
  return count>=2&&first?.owner!==incomingOwner&&incomingPresent?first:null;
}
export function removeLodPoseSample(owner:string) { samples.delete(owner); snapshot=EMPTY; listeners.forEach(fn=>fn()); }
export function useLodContinuityDiagnostics() { return useSyncExternalStore(fn=>{listeners.add(fn);return ()=>{listeners.delete(fn);};},()=>snapshot,()=>EMPTY); }
