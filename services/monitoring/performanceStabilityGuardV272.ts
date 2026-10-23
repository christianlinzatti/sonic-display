"use client";
import type {AnalysisSample} from "./performanceSessionAnalyzerV262";

export type GuardMode="auto"|"high"|"balanced"|"low";
export type GuardAssessment=Readonly<{status:"warming"|"healthy"|"degraded"|"stale";count:number;badCount:number;detail:string}>;
/** Each reading represents about five seconds. Only consecutive *fresh* complete readings count. */
export const GUARD_WINDOW=6;
export const GUARD_MAX_SAMPLE_AGE_MS=12000;
export const GUARD_FPS_THRESHOLD=30;
export const GUARD_P95_THRESHOLD_MS=45;
export const GUARD_COOLDOWN_MS=60000;
export function assessStability(samples:readonly AnalysisSample[],now:number):GuardAssessment{
 const recent=samples.slice(-GUARD_WINDOW);
 if(!recent.length)return {status:"warming",count:0,badCount:0,detail:"Noch keine Telemetrie vorhanden."};
 if(!Number.isFinite(now)||now-recent[recent.length-1].at>GUARD_MAX_SAMPLE_AGE_MS||recent[recent.length-1].at>now+2000)return {status:"stale",count:recent.length,badCount:0,detail:"Messwerte sind veraltet – keine automatische Änderung."};
 const complete=recent.filter((s,i)=>Number.isFinite(s.at)&&s.fps!==null&&Number.isFinite(s.fps)&&s.p95FrameMs!==null&&Number.isFinite(s.p95FrameMs)&&(i===0||(s.at>recent[i-1].at&&s.at-recent[i-1].at<=12000)));
 if(recent.length<GUARD_WINDOW||complete.length<GUARD_WINDOW)return {status:"warming",count:complete.length,badCount:0,detail:`${complete.length}/${GUARD_WINDOW} gültige aufeinanderfolgende Messungen.`};
 const bad=complete.filter(s=>(s.fps as number)<GUARD_FPS_THRESHOLD||(s.p95FrameMs as number)>GUARD_P95_THRESHOLD_MS).length;
 return {status:bad===GUARD_WINDOW?"degraded":"healthy",count:complete.length,badCount:bad,detail:bad===GUARD_WINDOW?"Über sechs Messpunkte anhaltend niedrige FPS bzw. hohe Framezeit.":`${bad} von ${GUARD_WINDOW} Messpunkten unterhalb der Leistungsgrenzen.`};
}
export function shouldRecover(assessment:GuardAssessment,armed:boolean,tabVisible:boolean,now:number,lastChange:number):boolean{
 return armed&&tabVisible&&assessment.status==="degraded"&&Number.isFinite(now)&&now-lastChange>=GUARD_COOLDOWN_MS;
}
