/** V826 – scoped, read-only live concert diagnostics. No browser globals, network,
 * persistence or GPU timer queries. Samples are render-loop deltas, not GPU times.
 * Three renderer info counters are the previous draw when automatic reset is on.
 */
import type {FxPerfGainsV825,FxPerfLaneV825} from './concertFxPerformanceOptimizerV825';
export type ConcertQualityStatusV826='unavailable'|'paused'|'healthy'|'warning'|'critical';
export type ConcertQualityCountsV826={crowd:number;sparks:number;shards:number;confetti:number;energyRings:number;
  foamBubbles:number;foamMist:number;kineticColumns:number;spectralWaves:number;spectralRings:number;spectralPrisms:number};
export const EMPTY_QUALITY_COUNTS_V826:Readonly<ConcertQualityCountsV826>={crowd:0,sparks:0,shards:0,confetti:0,energyRings:0,
 foamBubbles:0,foamMist:0,kineticColumns:0,spectralWaves:0,spectralRings:0,spectralPrisms:0};
export interface ConcertQualitySampleV826{
  playing:boolean;verified:boolean;targetFps:30|60;pressure:number;
  fxCapacity:number;fxCost:number;fxActive:boolean;gains:FxPerfGainsV825;
  counts:ConcertQualityCountsV826;rendererCalls:number;rendererTriangles:number;
  rendererGeometries:number;rendererTextures:number; // Three.js WebGLRenderer.info counters, not GPU memory
  performanceTier:'low'|'balanced'|'high';
  autoQualityPressureV827?:number;autoQualityReasonV827?:string;
  cameraAwareReasonV834?:string;cameraAwareSavingsV834?:number;cameraIntentV834?:string;
}
export interface ConcertQualitySnapshotV826 extends ConcertQualitySampleV826 {
  available:boolean;fps:number;frameMs:number;p95FrameMs:number;maxFrameMs:number;
  slowFrameShare:number;sampleCount:number;status:ConcertQualityStatusV826;
  recommendations:readonly string[];
}
const NEUTRAL_GAINS_V826:Readonly<FxPerfGainsV825>={laser:1,led:1,particles:1,foam:1,transition:1,crowd:1,
 spectral:1,haze:1,kinetic:1,vocal:1};
const clean=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const count=(v:number)=>Math.floor(clean(v,0,100000));
const gains=(g:FxPerfGainsV825):FxPerfGainsV825=>({laser:clean(g.laser,0,1),led:clean(g.led,0,1),
 particles:clean(g.particles,0,1),foam:clean(g.foam,0,1),transition:clean(g.transition,0,1),
 crowd:clean(g.crowd,0,1),spectral:clean(g.spectral,0,1),haze:clean(g.haze,0,1),
 kinetic:clean(g.kinetic,0,1),vocal:clean(g.vocal,0,1)});
export function qualityCountsV826(i:Partial<ConcertQualityCountsV826>):ConcertQualityCountsV826{
 const result={...EMPTY_QUALITY_COUNTS_V826};
 for(const k of Object.keys(result) as (keyof ConcertQualityCountsV826)[])result[k]=count(i[k]??0);
 return result;
}
export function qualityDiagnosticsV826(i:ConcertQualitySnapshotV826):readonly string[]{
 if(!i.available)return ['Keine Live-Messdaten. Konzertrenderer öffnen und Dashboard aktivieren.'];
 if(!i.playing)return ['Wiedergabe pausiert: Framewerte beschreiben nur die aktuell gerenderte Bühne.'];
 const notes:string[]=[];
 if(i.status==='critical')notes.push('Anhaltend niedrige Bildrate: FX-Qualität oder Avatar-Komplexität reduzieren.');
 else if(i.status==='warning')notes.push('Framezeit erhöht: Performance-Profil und aktive Effekte prüfen.');
 if(i.pressure>.55&&i.fxActive)notes.push('V825 drosselt FX. Kleinere Partikel- und Schaumbudgets können helfen.');
 if(i.p95FrameMs>1000/i.targetFps*2)notes.push('Unregelmäßige Framezeiten: Lastspitzen und Hintergrundprozesse prüfen.');
 if(!i.verified)notes.push('Keine verifizierte Song-FX-Freigabe; Effekte können deaktiviert sein.');
 if(!notes.length)notes.push('Keine auffällige Framezeit-Abweichung in diesem Messfenster.');
 return notes;
}
export const EMPTY_QUALITY_SNAPSHOT_V826:Readonly<ConcertQualitySnapshotV826>={
 available:false,playing:false,verified:false,targetFps:60,pressure:0,fxCapacity:0,fxCost:0,
 fxActive:false,gains:NEUTRAL_GAINS_V826 as FxPerfGainsV825,counts:EMPTY_QUALITY_COUNTS_V826 as ConcertQualityCountsV826,
 rendererCalls:0,rendererTriangles:0,rendererGeometries:0,rendererTextures:0,performanceTier:'low',
 fps:0,frameMs:0,p95FrameMs:0,maxFrameMs:0,slowFrameShare:0,sampleCount:0,
 status:'unavailable',recommendations:['Keine Live-Messdaten. Konzertrenderer öffnen und Dashboard aktivieren.']};
export interface ConcertQualityMonitorV826{
 windowSeconds:number;totalSeconds:number;frames:number;slowFrames:number;maxFrameMs:number;
 times:Float32Array;timeIndex:number;timeCount:number;
}
export const createConcertQualityMonitorV826=():ConcertQualityMonitorV826=>({windowSeconds:0,totalSeconds:0,frames:0,
 slowFrames:0,maxFrameMs:0,times:new Float32Array(90),timeIndex:0,timeCount:0});
export const resetConcertQualityMonitorV826=(m:ConcertQualityMonitorV826):void=>{
 m.windowSeconds=0;m.totalSeconds=0;m.frames=0;m.slowFrames=0;m.maxFrameMs=0;m.timeIndex=0;m.timeCount=0;
};
/** At most two snapshots per second, no React state updates in each frame.
 * Ignore browser tab wake-ups >250ms instead of claiming a GPU stall.
 */
export function accumulateConcertFrameV826(m:ConcertQualityMonitorV826,frameSeconds:number,targetFps:30|60):boolean{
 if(!Number.isFinite(frameSeconds)||frameSeconds<=0||frameSeconds>.25){resetConcertQualityMonitorV826(m);return false;}
 m.windowSeconds+=frameSeconds;m.totalSeconds+=frameSeconds;m.frames++;
 const frameMs=frameSeconds*1000;
 m.maxFrameMs=Math.max(m.maxFrameMs,frameMs);
 if(frameMs>1000/targetFps*1.5)m.slowFrames++;
 m.times[m.timeIndex]=frameMs;m.timeIndex=(m.timeIndex+1)%m.times.length;
 m.timeCount=Math.min(m.timeCount+1,m.times.length);
 return m.windowSeconds>=.5;
}
/** Capture detailed cue counts only on the publishing frame (about twice/second).
 * The lightweight accumulator above has no heap allocations on ordinary frames.
 */
export function completeConcertQualityV826(m:ConcertQualityMonitorV826,i:ConcertQualitySampleV826):ConcertQualitySnapshotV826{
 const sorted=Array.from(m.times.subarray(0,m.timeCount)).sort((a,b)=>a-b);
 const fps=m.totalSeconds>0?m.frames/m.totalSeconds:0;
 const avg=m.frames>0?m.totalSeconds*1000/m.frames:0;
 const slowShare=m.frames>0?m.slowFrames/m.frames:0;
 const status:ConcertQualityStatusV826=!i.playing?'paused':
   fps<i.targetFps*.55||slowShare>.62?'critical':
   fps<i.targetFps*.80||slowShare>.32||i.pressure>.7?'warning':'healthy';
 const partial:ConcertQualitySnapshotV826={...i,available:true,status,fps:Math.round(fps*10)/10,
  frameMs:Math.round(avg*10)/10,
  p95FrameMs:Math.round((sorted[Math.max(0,Math.ceil(sorted.length*.95)-1)]??0)*10)/10,
  maxFrameMs:Math.round(m.maxFrameMs*10)/10,slowFrameShare:Math.round(slowShare*1000)/1000,
  sampleCount:m.frames,pressure:clean(i.pressure,0,1),fxCapacity:clean(i.fxCapacity,0,1000),
  fxCost:clean(i.fxCost,0,1000),gains:gains(i.gains),counts:qualityCountsV826(i.counts),
  rendererCalls:count(i.rendererCalls),rendererTriangles:count(i.rendererTriangles),
  rendererGeometries:count(i.rendererGeometries),rendererTextures:count(i.rendererTextures),recommendations:[]};
 const snapshot={...partial,recommendations:qualityDiagnosticsV826(partial)};
 resetConcertQualityMonitorV826(m);
 return snapshot;
}
/** Test/convenience wrapper for accumulator + capture. */
export function sampleConcertQualityV826(m:ConcertQualityMonitorV826,frameSeconds:number,i:ConcertQualitySampleV826):ConcertQualitySnapshotV826|null{
 return accumulateConcertFrameV826(m,frameSeconds,i.targetFps)?completeConcertQualityV826(m,i):null;
}
// Module-scoped store: strictly transient; no user data or browser storage.
let current:Readonly<ConcertQualitySnapshotV826>=EMPTY_QUALITY_SNAPSHOT_V826;
const listeners=new Set<()=>void>();
export const getConcertQualityV826=()=>current;
export const subscribeConcertQualityV826=(cb:()=>void)=>{listeners.add(cb);return ()=>{listeners.delete(cb)};};
export function publishConcertQualityV826(snapshot:ConcertQualitySnapshotV826):void{
 current=snapshot;for(const listener of listeners)listener();
}
export function clearConcertQualityV826():void{
 current=EMPTY_QUALITY_SNAPSHOT_V826;for(const listener of listeners)listener();
}
export const CONCERT_QUALITY_LANES_V826:readonly FxPerfLaneV825[]=['laser','led','particles','foam','transition','crowd','spectral','haze','kinetic','vocal'];
