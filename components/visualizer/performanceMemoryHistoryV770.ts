/** V770: bounded, passive memory/render telemetry. No timer, RAF, network or storage.
 * Fed exclusively by the existing once-per-second AdaptivePerformanceController window.
 * renderer.info memory measures OBJECT COUNTS, never GPU VRAM bytes.
 */
export const V770_INTERVAL_MS = 5_000;
export const V770_MAX_SAMPLES = 360; // 30 minutes at 5-second intervals

type RenderReadingV770 = {
  updatedAt:number; fps:number; frameMs:number; p95FrameMs?:number; drawCalls:number;
  triangles:number; geometries:number; textures:number; avatarCount?:number; programs?:number|null;
};
export type CacheReadingV770 = {
  activeEntries:number; idleEntries:number; activeEstimatedBytes:number; idleEstimatedBytes:number;
  idleLimit:number; idleByteBudget:number;
};
export type PerformanceMemorySampleV770 = {
  at:number; fps:number; frameMs:number; p95FrameMs:number|null;
  drawCalls:number; triangles:number; geometries:number; textures:number;
  avatarCount:number|null; programs:number|null; heapMiB:number|null;
  cache:CacheReadingV770|null; segment:number;
};
export type PerformanceMemorySnapshotV770 = { samples:readonly PerformanceMemorySampleV770[]; latest:PerformanceMemorySampleV770|null };
export type ResourceTrendV770 = {state:'insufficient'|'stable'|'review';geometryDelta:number;textureDelta:number;reason:string};
const EMPTY:PerformanceMemorySnapshotV770={samples:[],latest:null};
let snapshot:PerformanceMemorySnapshotV770=EMPTY;
let lastTime=-Infinity;
let currentSegment=0;
let cacheReader:(()=>CacheReadingV770)|null=null;
const listeners=new Set<()=>void>();
const notify=()=>{for(const listener of listeners)listener();};
const safe=(v:unknown):number|null=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
export function setCacheReaderV770(reader:(()=>CacheReadingV770)|null):void {cacheReader=reader;}
export function getPerformanceMemorySnapshotV770():PerformanceMemorySnapshotV770{return snapshot;}
export function getPerformanceMemoryServerSnapshotV770():PerformanceMemorySnapshotV770{return EMPTY;}
export function subscribePerformanceMemoryV770(listener:()=>void):()=>void {listeners.add(listener);return ()=>{listeners.delete(listener);};}
export function resetPerformanceMemoryV770():void {
  snapshot=EMPTY;lastTime=-Infinity;currentSegment=0;notify();
}
export function recordPerformanceMemoryV770(reading:RenderReadingV770,heapBytes?:number|null):boolean {
  const at=safe(reading.updatedAt);
  if(at===null||!Number.isFinite(reading.fps)||reading.fps<=0)return false;
  if(at>=lastTime&&at-lastTime<V770_INTERVAL_MS)return false;
  if(at<lastTime||at-lastTime>30_000)currentSegment++;
  lastTime=at;
  let cache:CacheReadingV770|null=null;
  try {if(cacheReader){const candidate=cacheReader();if(candidate && Number.isFinite(candidate.idleEstimatedBytes))cache={...candidate};}}
  catch { /* a diagnostic reader must never interrupt the render loop */ }
  const heap=safe(heapBytes);
  const point:PerformanceMemorySampleV770={
    at,fps:reading.fps,frameMs:reading.frameMs,p95FrameMs:safe(reading.p95FrameMs),
    drawCalls:reading.drawCalls,triangles:reading.triangles,geometries:reading.geometries,
    textures:reading.textures,programs:safe(reading.programs),
    avatarCount:safe(reading.avatarCount),heapMiB:heap===null?null:heap/1048576,
    cache,segment:currentSegment,
  };
  // Immutable bounded snapshot: React useSyncExternalStore has a stable getter.
  snapshot={samples:[...snapshot.samples.slice(-(V770_MAX_SAMPLES-1)),point],latest:point};
  notify();return true;
}
function mean(values:number[]):number {return values.reduce((a,b)=>a+b,0)/Math.max(1,values.length);}
/** A *hint*, never a leak verdict. Compare an unchanged avatar count/continuous segment.
 * At least 2 minutes of samples are needed; scene/camera can still affect counts.
 */
export function assessResourceTrendV770(samples:readonly PerformanceMemorySampleV770[]):ResourceTrendV770 {
  const tail=samples.at(-1);
  if(!tail)return {state:'insufficient',geometryDelta:0,textureDelta:0,reason:'Noch keine Messungen.'};
  const same=samples.filter(s=>s.segment===tail.segment&&s.avatarCount===tail.avatarCount);
  if(same.length<24||same.at(-1)!.at-same[0].at<115_000)return {state:'insufficient',geometryDelta:0,textureDelta:0,reason:'Mindestens zwei Minuten zusammenhängende Messwerte mit gleicher Avataranzahl erforderlich.'};
  const head=same.slice(0,6),end=same.slice(-6);
  const geometryDelta=Math.round(mean(end.map(x=>x.geometries))-mean(head.map(x=>x.geometries)));
  const textureDelta=Math.round(mean(end.map(x=>x.textures))-mean(head.map(x=>x.textures)));
  const review=geometryDelta>=8||textureDelta>=8;
  return {state:review?'review':'stable',geometryDelta,textureDelta,
    reason:review?'Ressourcenzahlen sind angestiegen; gleiche Bühne erneut messen und mit V767 prüfen. Kein Leak-Beweis.':'Kein auffälliger Nettoanstieg der Ressourcenanzahl in diesem Messfenster. Kein Leak-Freiheitsnachweis.'};
}
