"use client";
import type {SessionSample} from "./longSessionMetrics";
import {getAvatarFrameStats} from "@/components/visualizer/avatarFrameProfiler";
import {getQualityDecisionHistory} from "@/components/visualizer/qualityDecisionHistoryV255";

/** V262: extra measurements are captured only when V250 emits its 5s sample. */
export type AnalysisSample = Readonly<{at:number; elapsedSeconds:number; fps:number|null; p95FrameMs:number|null; slowPercent:number|null; drawCalls:number|null; heapMiB:number|null; avatarCallbackMeanMs:number|null; activeAvatars:number; qualityChanges:number}>;
export type SessionFinding = Readonly<{kind:"fps"|"frame"|"avatar"|"quality"; level:"notice"|"warning"; title:string; detail:string}>;
const MAX=720;
let samples:AnalysisSample[]=[];
export function recordAnalysisSample(sample:SessionSample):void {
  const now=typeof performance!=="undefined" ? performance.now() : 0;
  const active=getAvatarFrameStats().filter(a=>a.frames>0 && now>=a.updatedAt && now-a.updatedAt<=6000);
  const previous=samples[samples.length-1];
  const since=previous?.at ?? sample.at-5000;
  const qualityChanges=getQualityDecisionHistory().filter(d=>d.at>since && d.at<=sample.at).length;
  samples.push({at:sample.at,elapsedSeconds:sample.elapsedSeconds,fps:sample.fps,p95FrameMs:sample.p95FrameMs,slowPercent:sample.slowPercent,drawCalls:sample.drawCalls,heapMiB:sample.heapMiB,activeAvatars:active.length,avatarCallbackMeanMs:active.length?active.reduce((s,a)=>s+a.meanMs,0):null,qualityChanges});
  if(samples.length>MAX)samples.splice(0,samples.length-MAX);
}
export function getAnalysisSamples():readonly AnalysisSample[]{return samples.slice();}
export function resetAnalysisSamples():void{samples=[];}
export function analyzeSession(series:readonly AnalysisSample[]):SessionFinding[]{
  if(series.length<6)return [];
  const recent=series.slice(-12);
  const valid=(selector:(s:AnalysisSample)=>number|null)=>recent.map(selector).filter((v):v is number=>v!==null&&Number.isFinite(v));
  const mean=(arr:readonly number[])=>arr.reduce((sum,v)=>sum+v,0)/Math.max(1,arr.length);
  const findings:SessionFinding[]=[];
  const fps=valid(s=>s.fps);
  if(fps.length>=6 && mean(fps)<35)findings.push({kind:"fps",level:"warning",title:"Niedrige Framerate",detail:`Ø ${mean(fps).toFixed(1)} FPS in den letzten ${fps.length} Messungen. Rendering-Qualität oder Effekte prüfen.`});
  const p95=valid(s=>s.p95FrameMs);
  if(p95.length>=6 && mean(p95)>35)findings.push({kind:"frame",level:"warning",title:"Hohe P95-Framezeit",detail:`Ø ${mean(p95).toFixed(1)} ms. Auch einzelne langsame Frames können sichtbar ruckeln.`});
  const cpu=valid(s=>s.avatarCallbackMeanMs);
  if(cpu.length>=6 && mean(cpu)>8)findings.push({kind:"avatar",level:"notice",title:"Aufwendige Avatar-Callbacks",detail:`Ø ${mean(cpu).toFixed(2)} ms über aktive Avatar-Callbacks; keine Messung der gesamten CPU- oder GPU-Auslastung.`});
  const switches=recent.reduce((sum,s)=>sum+s.qualityChanges,0);
  if(switches>=3)findings.push({kind:"quality",level:"notice",title:"Häufige Qualitätswechsel",detail:`${switches} automatische Renderqualitätswechsel innerhalb des jüngsten Messfensters.`});
  return findings;
}
export function formatSessionCsv(series:readonly AnalysisSample[]):string{
 const header="time,elapsedSeconds,fps,p95FrameMs,slowPercent,drawCalls,avatarCallbackMeanMs,activeAvatars,qualityChanges";
 const number=(v:number|null)=>v===null||!Number.isFinite(v)?"":String(v);
 return [header,...series.map(s=>[new Date(s.at).toISOString(),s.elapsedSeconds,number(s.fps),number(s.p95FrameMs),number(s.slowPercent),number(s.drawCalls),number(s.avatarCallbackMeanMs),s.activeAvatars,s.qualityChanges].join(","))].join("\n");
}
