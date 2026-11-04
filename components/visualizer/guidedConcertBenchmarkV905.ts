/** V905 – manual, evidence-only concert benchmark. Pure state machine.
 * Reuses genuine V826 publications via V903's frame validator. No new clocks,
 * GPU sampling, synthetic beats, network requests, or persisted song details.
 */
import {reviewFrameV903,type ReviewFrameV903,type ReviewContextV903,type ReviewTierV903} from './concertQualityReviewV903';
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';

export type BenchmarkPresetV905='quick'|'standard'|'thorough';
export type BenchmarkStateV905='warmup'|'measuring'|'ready'|'invalid';
export const BENCHMARK_WARMUP_V905=2;
export const BENCHMARK_MAX_RUNS_V905=18;
export const BENCHMARK_MAX_GROUPS_V905=6;
export const BENCHMARK_MAX_FRAMES_V905=24;
export const BENCHMARK_REQUIREMENTS_V905:Readonly<Record<BenchmarkPresetV905,number>>={quick:5,standard:8,thorough:12};
export interface BenchmarkRunV905 {
 id:number;trackKey:string;sceneIndex:number;preset:BenchmarkPresetV905;targetFps:30|60;tier:ReviewTierV903;
 samples:number;fpsMedian:number;fpsMean:number;frameMsMedian:number;p95WindowMean:number;
 pressureMean:number;fpsLow:number;fpsHigh:number;sampleSpread:number;belowTargetShare:number;
}
export interface BenchmarkSessionV905 {
 id:number;trackKey:string;sceneIndex:number;preset:BenchmarkPresetV905;targetFps:30|60;tier:ReviewTierV903;
 state:BenchmarkStateV905;reason:string;warmup:number;frames:readonly ReviewFrameV903[];
 lastCaptureMs:number;result:BenchmarkRunV905|null;
}
export type BenchmarkGroupStatusV905='more-runs'|'consistent'|'variable'|'below-target';
export interface BenchmarkGroupV905 {
 groupId:number;sceneIndex:number;preset:BenchmarkPresetV905;targetFps:30|60;tier:ReviewTierV903;
 count:number;fpsMedian:number;fpsMin:number;fpsMax:number;spread:number;fpsMean:number;
 frameMsMedian:number;p95WindowMean:number;pressureMean:number;belowTargetRuns:number;
 status:BenchmarkGroupStatusV905;description:string;
}
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const validId=(v:number)=>Number.isSafeInteger(v)&&v>0;
const median=(list:readonly number[]):number=>{const a=[...list].sort((x,y)=>x-y),mid=Math.floor(a.length/2);
 return a.length%2?a[mid]:(a[mid-1]+a[mid])/2;};
const mean=(list:readonly number[])=>list.reduce((sum,n)=>sum+n,0)/list.length;
export const isBenchmarkPresetV905=(p:unknown):p is BenchmarkPresetV905=>p==='quick'||p==='standard'||p==='thorough';
const sameFrameContext=(f:ReviewFrameV903,s:BenchmarkSessionV905)=>f.trackKey===s.trackKey&&
 f.sceneIndex===s.sceneIndex&&f.targetFps===s.targetFps&&f.tier===s.tier;
const consistentContext=(s:BenchmarkSessionV905,c:ReviewContextV903)=>c.playing&&c.mode==='active'&&
 c.trackKey===s.trackKey&&c.sceneIndex===s.sceneIndex;
export const validBenchmarkFrameV905=(f:ReviewFrameV903|null):f is ReviewFrameV903=>!!f&&
 finite(f.capturedMs)&&f.capturedMs>=0&&Number.isSafeInteger(f.sceneIndex)&&f.sceneIndex>=0&&
 !!f.trackKey&&(f.targetFps===30||f.targetFps===60)&&(['low','balanced','high'] as string[]).includes(f.tier)&&
 Number.isInteger(f.sampleCount)&&f.sampleCount>=3&&finite(f.fps)&&f.fps>0&&f.fps<=500&&
 finite(f.frameMs)&&f.frameMs>0&&f.frameMs<=250&&finite(f.p95FrameMs)&&f.p95FrameMs>=0&&f.p95FrameMs<=250&&
 finite(f.pressure)&&f.pressure>=0&&f.pressure<=1;
/** Explicit user click, and only when genuine active V826 evidence is available. */
export function startGuidedBenchmarkV905(c:ReviewContextV903,snapshot:ConcertQualitySnapshotV826|null,
 nowMs:number,id:number,preset:BenchmarkPresetV905):BenchmarkSessionV905|null {
 if(!validId(id)||!isBenchmarkPresetV905(preset))return null;
 const frame=reviewFrameV903(snapshot,c,nowMs);
 if(!validBenchmarkFrameV905(frame))return null;
 return {id,trackKey:c.trackKey,sceneIndex:c.sceneIndex,preset,targetFps:frame.targetFps,tier:frame.tier,
  state:'warmup',reason:'Lauf gestartet. Zwei neue Renderer-Messfenster dienen der Stabilisierung.',warmup:0,
  frames:[],lastCaptureMs:frame.capturedMs,result:null};
}
export const invalidateGuidedBenchmarkV905=(s:BenchmarkSessionV905|null,reason:string):BenchmarkSessionV905|null=>
 !s||s.state==='ready'||s.state==='invalid'?s:{...s,state:'invalid',reason,frames:[]};
export function syncGuidedBenchmarkV905(s:BenchmarkSessionV905|null,c:ReviewContextV903,
 targetFps:30|60,tier:ReviewTierV903):BenchmarkSessionV905|null {
 if(!s||s.state==='invalid'||s.state==='ready')return s;
 if(!consistentContext(s,c))return invalidateGuidedBenchmarkV905(s,'Wiedergabe, Song oder bestätigte Szene verändert. Lauf ungültig.');
 if(targetFps!==s.targetFps||tier!==s.tier)return invalidateGuidedBenchmarkV905(s,'FPS-Ziel oder Performance-Profil verändert. Lauf ungültig.');
 return s;
}
export function summarizeGuidedRunV905(s:BenchmarkSessionV905):BenchmarkRunV905|null {
 if(s.state==='invalid'||!validId(s.id)||!isBenchmarkPresetV905(s.preset)||s.warmup<BENCHMARK_WARMUP_V905||
  s.frames.length<BENCHMARK_REQUIREMENTS_V905[s.preset]||s.frames.length>BENCHMARK_MAX_FRAMES_V905||
  s.frames.some((f,i)=>!validBenchmarkFrameV905(f)||!sameFrameContext(f,s)||
   (i>0&&f.capturedMs<=s.frames[i-1].capturedMs)))return null;
 const fps=s.frames.map(f=>f.fps),ms=s.frames.map(f=>f.frameMs),p95=s.frames.map(f=>f.p95FrameMs),press=s.frames.map(f=>f.pressure);
 return {id:s.id,trackKey:s.trackKey,sceneIndex:s.sceneIndex,preset:s.preset,
  targetFps:s.targetFps,tier:s.tier,samples:s.frames.length,
  fpsMedian:median(fps),fpsMean:mean(fps),frameMsMedian:median(ms),p95WindowMean:mean(p95),
  pressureMean:mean(press),fpsLow:Math.min(...fps),fpsHigh:Math.max(...fps),
  sampleSpread:Math.max(...fps)-Math.min(...fps),belowTargetShare:fps.filter(v=>v<s.targetFps*.8).length/fps.length};
}
/** Called only on fresh V826 store publications, never on React render ticks. */
export function advanceGuidedBenchmarkV905(s:BenchmarkSessionV905|null,c:ReviewContextV903,
 frame:ReviewFrameV903|null):BenchmarkSessionV905|null {
 if(!s||s.state==='invalid'||s.state==='ready')return s;
 if(!consistentContext(s,c))return invalidateGuidedBenchmarkV905(s,'Songabschnitt, Wiedergabe oder Regiemodus verändert.');
 if(!validBenchmarkFrameV905(frame))return invalidateGuidedBenchmarkV905(s,'Keine gültigen neuen V826-Renderer-Werte; Lauf abgebrochen.');
 if(!sameFrameContext(frame,s))return invalidateGuidedBenchmarkV905(s,'FPS-Ziel, Profil oder Songabschnitt verändert.');
 if(frame.capturedMs<=s.lastCaptureMs)return s; // repeated/old snapshot cannot inflate count
 if(s.warmup<BENCHMARK_WARMUP_V905)return {...s,warmup:s.warmup+1,lastCaptureMs:frame.capturedMs,
  state:'warmup',reason:`Stabilisierungsfenster ${s.warmup+1}/${BENCHMARK_WARMUP_V905}.`};
 const frames=[...s.frames,frame].slice(0,BENCHMARK_MAX_FRAMES_V905);
 const remaining=Math.max(0,BENCHMARK_REQUIREMENTS_V905[s.preset]-frames.length);
 if(remaining)return {...s,frames,lastCaptureMs:frame.capturedMs,state:'measuring',reason:`Messfenster ${frames.length}/${BENCHMARK_REQUIREMENTS_V905[s.preset]}.`};
 const pending={...s,frames,lastCaptureMs:frame.capturedMs,state:'measuring' as BenchmarkStateV905,reason:''};
 const result=summarizeGuidedRunV905(pending);
 return result?{...pending,state:'ready',result,reason:`${result.samples} neue V826-Fenster gemessen. Ergebnisse sind beobachtend.`}:
  invalidateGuidedBenchmarkV905(pending,'Keine ausreichend vergleichbaren Messdaten.');
}
/** Retain only complete, independent runs; prevent StrictMode duplicate IDs. */
export function recordGuidedBenchmarkV905(history:readonly BenchmarkRunV905[],session:BenchmarkSessionV905|null):BenchmarkRunV905[] {
 if(!session||session.state!=='ready'||!session.result||history.some(x=>x.id===session.id))return [...history];
 const checked=summarizeGuidedRunV905(session);
 if(!checked||JSON.stringify(checked)!==JSON.stringify(session.result))return [...history];
 return [...history,{...checked}].slice(-BENCHMARK_MAX_RUNS_V905);
}
const validRun=(r:BenchmarkRunV905)=>validId(r.id)&&!!r.trackKey&&Number.isInteger(r.sceneIndex)&&r.sceneIndex>=0&&
 isBenchmarkPresetV905(r.preset)&&(r.targetFps===30||r.targetFps===60)&&
 (['low','balanced','high'] as string[]).includes(r.tier)&&r.samples>=BENCHMARK_REQUIREMENTS_V905[r.preset]&&r.samples<=BENCHMARK_MAX_FRAMES_V905&&
 [r.fpsMedian,r.fpsMean,r.frameMsMedian,r.p95WindowMean,r.pressureMean,r.fpsLow,r.fpsHigh,r.sampleSpread,r.belowTargetShare].every(finite)&&
 r.fpsLow>0&&r.fpsLow<=r.fpsHigh&&r.fpsHigh<=500&&r.fpsMean>0&&r.fpsMean<=500&&
 r.fpsMedian>0&&r.fpsMedian<=500&&r.frameMsMedian>0&&r.frameMsMedian<=250&&r.p95WindowMean>=0&&r.p95WindowMean<=250&&
 r.pressureMean>=0&&r.pressureMean<=1&&r.sampleSpread>=0&&r.belowTargetShare>=0&&r.belowTargetShare<=1;
const matching=(a:BenchmarkRunV905,b:BenchmarkRunV905)=>a.trackKey===b.trackKey&&a.sceneIndex===b.sceneIndex&&
 a.preset===b.preset&&a.tier===b.tier&&a.targetFps===b.targetFps;
export function summarizeGuidedBenchmarksV905(history:readonly BenchmarkRunV905[]):BenchmarkGroupV905[] {
 const groups:BenchmarkRunV905[][]=[];
 for(const item of history){if(!validRun(item))continue;
  const group=groups.find(g=>matching(g[0],item));
  if(group){if(!group.some(x=>x.id===item.id))group.push(item);}else groups.push([item]);
 }
 return groups.map(runs=>{
  const first=runs[0],latest=runs[runs.length-1];
  const fps=runs.map(x=>x.fpsMedian),ms=runs.map(x=>x.frameMsMedian),p95=runs.map(x=>x.p95WindowMean),pressure=runs.map(x=>x.pressureMean);
  const count=runs.length,fpsMin=Math.min(...fps),fpsMax=Math.max(...fps),fpsMedian=median(fps),spread=fpsMax-fpsMin;
  const belowTargetRuns=fps.filter(x=>x<first.targetFps*.8).length;
  let status:BenchmarkGroupStatusV905='more-runs';let description='Mindestens drei eigenständige Läufe sind für eine vorsichtige Stabilitätsbeurteilung nötig.';
  if(count>=3){
   if(spread>Math.max(5,fpsMedian*.15)){status='variable';description='FPS-Werte schwanken zwischen Läufen stark. Keine verlässliche Benchmark-Basis.';}
   else if(belowTargetRuns>=Math.ceil(count*.7)){status='below-target';description='Bei vergleichbarer Szene wiederholt unter 80 % des FPS-Ziels. Profil/FX prüfen.';}
   else {status='consistent';description='Renderer-Messwerte zwischen den Läufen relativ ähnlich. Kein Beweis für visuelle Qualität.';}
  }
  return {groupId:latest.id,sceneIndex:first.sceneIndex,preset:first.preset,targetFps:first.targetFps,tier:first.tier,
   count,fpsMedian,fpsMin,fpsMax,spread,fpsMean:mean(fps),frameMsMedian:median(ms),
   p95WindowMean:mean(p95),pressureMean:mean(pressure),belowTargetRuns,status,description};
 }).sort((a,b)=>b.groupId-a.groupId).slice(0,BENCHMARK_MAX_GROUPS_V905);
}
/** Explicit privacy-respecting export. No track IDs, playback positions, raw frames, clocks or personal metadata. */
export function exportGuidedBenchmarksV905(history:readonly BenchmarkRunV905[]):string {
 const groups=summarizeGuidedBenchmarksV905(history).map(({groupId,...g},i)=>({group:i+1,...g}));
 return JSON.stringify({schema:'sonic-guided-concert-benchmark-v905',version:1,totalRuns:history.length,
  presets:BENCHMARK_REQUIREMENTS_V905,warmupWindows:BENCHMARK_WARMUP_V905,groups,
  caveat:'V826 reports renderer frame intervals, not GPU timings, image quality or causal performance improvements. Runs compare only within the same private song, verified scene, FPS target, tier and measurement preset. Track IDs, timestamps and raw windows are not exported.'},null,2);
}
