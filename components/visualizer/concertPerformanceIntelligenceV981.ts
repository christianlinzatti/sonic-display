/** V981 – Concert Performance Intelligence 2.0.
 * Read-only, explainable diagnostics from completed V826 renderer windows.
 * Does not infer GPU/CPU time; draw-call and FX-cost counters are only clues.
 * Fixed 12-window history, reset on track/seek or invalid playback, no timers.
 */
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
export type PerformanceTrendV981='insufficient'|'improving'|'steady'|'degrading';
export type PerformanceClueV981='insufficient'|'healthy'|'frame-spikes'|'scene-complexity'|'fx-budget'|'unclassified';
export interface PerformanceInsightV981 {
  readonly trend:PerformanceTrendV981;
  readonly clue:PerformanceClueV981;
  readonly meanFps:number;
  readonly examinedWindows:number;
  readonly strainedWindows:number;
  readonly advice:string;
  readonly disclaimer:string;
}
export interface PerformanceIntelligenceStateV981 {
  scopeKey:string;
  fps:Float32Array;
  strained:Uint8Array;
  cursor:number;
  length:number;
}
const HISTORY=12;
const DISCLAIMER='Hinweis aus Frame-Abständen und Rendererzählern, keine gemessene CPU-/GPU-Ursache.';
const cap=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
export function createPerformanceIntelligenceV981():PerformanceIntelligenceStateV981 {
 return {scopeKey:'',fps:new Float32Array(HISTORY),strained:new Uint8Array(HISTORY),cursor:0,length:0};
}
export function clearPerformanceIntelligenceV981(s:PerformanceIntelligenceStateV981):void {
 s.scopeKey='';s.fps.fill(0);s.strained.fill(0);s.cursor=0;s.length=0;
}
const recent=(s:PerformanceIntelligenceStateV981,fromNewest:number):number=>
 s.fps[(s.cursor-1-fromNewest+HISTORY*2)%HISTORY];
const recentStrained=(s:PerformanceIntelligenceStateV981,fromNewest:number):number=>
 s.strained[(s.cursor-1-fromNewest+HISTORY*2)%HISTORY];
function validWindow(q:ConcertQualitySnapshotV826):boolean{
 return q.available===true&&q.playing===true&&q.verified===true&&q.sampleCount>=6&&
  (q.targetFps===30||q.targetFps===60)&&q.fps>0&&q.frameMs>0&&q.p95FrameMs>0&&
  Number.isFinite(q.fps)&&Number.isFinite(q.frameMs)&&Number.isFinite(q.p95FrameMs)&&
  Number.isFinite(q.slowFrameShare)&&q.slowFrameShare>=0&&q.slowFrameShare<=1;
}
/** Called exactly once for each completed V826 window (not per render frame).
 * Returns null for unavailable/paused/unverified data to prevent false diagnoses.
 */
export function analyzeConcertPerformanceV981(s:PerformanceIntelligenceStateV981,
 q:ConcertQualitySnapshotV826,scopeKey:string):PerformanceInsightV981|null {
 if(!scopeKey||!validWindow(q)){clearPerformanceIntelligenceV981(s);return null;}
 if(s.scopeKey!==scopeKey){clearPerformanceIntelligenceV981(s);s.scopeKey=scopeKey;}
 const strained=q.fps<q.targetFps*.8||q.p95FrameMs>(1000/q.targetFps)*1.6||q.slowFrameShare>.32;
 s.fps[s.cursor]=cap(q.fps,.1,240);s.strained[s.cursor]=strained?1:0;
 s.cursor=(s.cursor+1)%HISTORY;s.length=Math.min(HISTORY,s.length+1);
 const count=s.length;
 let mean=0;for(let n=0;n<count;n++)mean+=recent(s,n);
 mean=Math.round(mean/count*10)/10;
 let bad=0;for(let n=0;n<Math.min(count,4);n++)bad+=recentStrained(s,n);
 let trend:PerformanceTrendV981='insufficient';
 if(count>=8){
  let latest=0,earlier=0;
  for(let n=0;n<4;n++){latest+=recent(s,n);earlier+=recent(s,n+4);}
  latest/=4;earlier/=4;
  trend=latest>earlier*1.09?'improving':latest<earlier*.91?'degrading':'steady';
 }
 let clue:PerformanceClueV981='insufficient';
 let advice='Weitere gültige Live-Messfenster sammeln; einzelne FPS-Spitzen nicht überbewerten.';
 if(count>=4){
  if(bad<3){
   clue='healthy';advice='Keine anhaltende Framezeitbelastung in den letzten vier Messfenstern.';
  }else if(q.p95FrameMs>q.frameMs*1.55&&q.slowFrameShare>.25){
   clue='frame-spikes';advice='Unregelmäßige Framezeiten erkannt: Hintergrundlast und teure Einzel-Effekte prüfen.';
  }else if(q.rendererCalls>=280||q.rendererTriangles>=850000){
   clue='scene-complexity';advice='Viele Draw Calls oder Dreiecke: sichtbare Avatare, Crowd und Bühnendetails prüfen.';
  }else if(q.fxActive===true&&q.fxCapacity>0&&
   Number.isFinite(q.fxCost)&&Number.isFinite(q.fxCapacity)&&q.fxCost/q.fxCapacity>=.85){
   clue='fx-budget';advice='FX-Budget stark belegt: Schaum und Partikel vor LED- und Vocal-Effekten reduzieren.';
  }else{
   clue='unclassified';advice='Anhaltender FPS-Verlust ohne eindeutigen Renderer-Hinweis: Gerätebenchmark durchführen.';
  }
 }
 return {trend,clue,meanFps:mean,examinedWindows:count,strainedWindows:bad,
  advice,disclaimer:DISCLAIMER};
}
