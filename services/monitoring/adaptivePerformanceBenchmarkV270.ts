"use client";
import type {AnalysisSample} from "./performanceSessionAnalyzerV262";
export type BenchmarkMode="high"|"balanced"|"low";
export type BenchmarkResult=Readonly<{mode:BenchmarkMode;at:number;fps:number|null;p95FrameMs:number|null;slowPercent:number|null;avatarCallbackMeanMs:number|null;activeAvatars:number;count:number}>;
export const BENCHMARK_WARMUP=2;
export const BENCHMARK_SAMPLES=6;
const average=(values:(number|null)[]):number|null=>{const valid=values.filter((x):x is number=>x!==null&&Number.isFinite(x));return valid.length>=4?valid.reduce((a,b)=>a+b,0)/valid.length:null;};
export function benchmarkWindow(series:readonly AnalysisSample[],startAt:number,mode:BenchmarkMode):{count:number;result:BenchmarkResult|null}{
 const after=series.filter(s=>s.at>startAt).slice(0,BENCHMARK_WARMUP+BENCHMARK_SAMPLES);
 const measured=after.slice(BENCHMARK_WARMUP);
 if(after.length<BENCHMARK_WARMUP+BENCHMARK_SAMPLES)return {count:after.length,result:null};
 const avatarCounts=new Set(measured.map(s=>s.activeAvatars));
 if(avatarCounts.size!==1)return {count:after.length,result:null};
 return {count:after.length,result:{mode,at:startAt,count:measured.length,activeAvatars:measured[0].activeAvatars,fps:average(measured.map(s=>s.fps)),p95FrameMs:average(measured.map(s=>s.p95FrameMs)),slowPercent:average(measured.map(s=>s.slowPercent)),avatarCallbackMeanMs:average(measured.map(s=>s.avatarCallbackMeanMs))}};
}
export function rankBenchmarks(results:readonly BenchmarkResult[]):BenchmarkResult[]{
 return [...results].sort((a,b)=>{if(a.activeAvatars!==b.activeAvatars)return 0;const score=(r:BenchmarkResult)=>(r.fps??0)-(r.p95FrameMs??100)*.3-(r.slowPercent??100)*.15;return score(b)-score(a);});
}
