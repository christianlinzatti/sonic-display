/** V827: real render-loop benchmark capture for configured 1/2/4-performer slots.
 * This cannot validate GLB loading, model complexity or GPU utilization. A session
 * requires live-show samples, a verified active track, stable tier/track/count,
 * and deliberately comparable stage conditions. No synthetic benchmark results.
 */
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
export type BenchmarkCountV827=1|2|4;
export type BenchmarkProfileV827='low'|'balanced'|'high';
export interface BenchmarkResultV827{
 count:BenchmarkCountV827;trackId:string;tier:BenchmarkProfileV827;
 durationSeconds:number;fps:number;frameMs:number;p95FrameMs:number;
 slowFrameShare:number;rendererCalls:number;rendererTriangles:number;samples:number;
}
export interface BenchmarkProgressV827 {count:BenchmarkCountV827;seconds:number;targetSeconds:number;trackId:string;tier:BenchmarkProfileV827}
export interface BenchmarkStoreV827 {active:boolean;progress:BenchmarkProgressV827|null;results:Partial<Record<BenchmarkCountV827,BenchmarkResultV827>>;notice:string}
export const createConcertBenchmarkV827=():BenchmarkStoreV827=>({active:false,progress:null,results:{},notice:'Benchmark noch nicht gestartet.'});
const needed=[1,2,4] as const;
const clean=(v:number,minimum=0)=>Number.isFinite(v)?Math.max(minimum,v):minimum;
let store=createConcertBenchmarkV827();
let accumulated={seconds:0,frames:0,ms:0,slow:0,p95:0,calls:0,triangles:0,samples:0};
const listeners=new Set<()=>void>();
const emit=()=>{for(const listener of listeners)listener();};
export const subscribeBenchmarkV827=(callback:()=>void)=>{listeners.add(callback);return ()=>{listeners.delete(callback);};};
export const getBenchmarkV827=()=>store;
export const getBenchmarkServerV827=()=>EMPTY_BENCHMARK_V827;
export const EMPTY_BENCHMARK_V827:Readonly<BenchmarkStoreV827>=createConcertBenchmarkV827();
const resetWindow=()=>{accumulated={seconds:0,frames:0,ms:0,slow:0,p95:0,calls:0,triangles:0,samples:0};};
export function startBenchmarkV827():void{
 resetWindow();store={active:true,progress:null,results:{},notice:'Live-Show starten und nacheinander 1, 2 und 4 Performer konfigurieren.'};emit();
}
export function stopBenchmarkV827():void{
 resetWindow();store={...store,active:false,progress:null,notice:'Benchmark beendet; Ergebnisse bleiben bis zum Neustart sichtbar.'};emit();
}
export function clearBenchmarkV827():void{resetWindow();store=createConcertBenchmarkV827();emit();}
export const nextBenchmarkCountV827=(s:BenchmarkStoreV827):BenchmarkCountV827|null=>needed.find(n=>!s.results[n])??null;
export function recordBenchmarkWindowV827(input:{snapshot:ConcertQualitySnapshotV826;count:number;trackId:string;
 liveShow:boolean;targetSeconds:number}):void{
 if(!store.active||!input.liveShow)return;
 const s=input.snapshot;
 const next=nextBenchmarkCountV827(store);
 if(next===null){store={...store,active:false,progress:null,notice:'Alle drei Besetzungen gemessen.'};emit();return;}
 // Do not silently reinterpret configured avatar slots as actually loaded GLB meshes.
 const valid= input.count===next&&s.available&&s.playing&&s.verified&&s.sampleCount>=6&&
  typeof input.trackId==='string'&&input.trackId.trim().length>0&&
  Number.isFinite(s.frameMs)&&s.frameMs>0&&Number.isFinite(s.fps)&&s.fps>0&&
  Number.isFinite(s.p95FrameMs)&&s.p95FrameMs>0;
 if(!valid){
   if(store.progress){resetWindow();store={...store,progress:null,notice:`Bitte ${next} Performer auswählen und einen bestätigten Song abspielen.`};emit();}
   return;
 }
 const desired=Number.isFinite(input.targetSeconds)?Math.max(5,Math.min(60,input.targetSeconds)):12;
 if(store.progress&&(store.progress.count!==next||store.progress.trackId!==input.trackId||store.progress.tier!==s.performanceTier)){
  resetWindow();store={...store,progress:null,notice:'Besetzung, Song oder Qualitätsprofil geändert – neues Messfenster.'};
 }
 const duration=s.sampleCount*s.frameMs/1000;
 if(!Number.isFinite(duration)||duration<.1||duration>2)return;
 accumulated.seconds+=duration;
 accumulated.frames+=s.sampleCount;
 accumulated.ms+=s.sampleCount*s.frameMs;
 accumulated.slow+=s.sampleCount*clean(s.slowFrameShare);
 accumulated.p95=Math.max(accumulated.p95,s.p95FrameMs);
 accumulated.calls+=clean(s.rendererCalls);
 accumulated.triangles+=clean(s.rendererTriangles);
 accumulated.samples++;
 const progress={count:next,seconds:Math.min(accumulated.seconds,desired),targetSeconds:desired,trackId:input.trackId,tier:s.performanceTier};
 if(accumulated.seconds<desired){store={...store,progress,notice:`Messung ${next} Performer läuft.`};emit();return;}
 const result:BenchmarkResultV827={count:next,trackId:input.trackId,tier:s.performanceTier,
  durationSeconds:Math.round(accumulated.seconds*10)/10,
  fps:Math.round(accumulated.frames/accumulated.seconds*10)/10,
  frameMs:Math.round(accumulated.ms/accumulated.frames*10)/10,
  p95FrameMs:Math.round(accumulated.p95*10)/10, // WORST P95 across windows, not pooled P95
  slowFrameShare:Math.round(accumulated.slow/accumulated.frames*1000)/1000,
  rendererCalls:Math.round(accumulated.calls/accumulated.samples),
  rendererTriangles:Math.round(accumulated.triangles/accumulated.samples),samples:accumulated.samples};
 resetWindow();
 const results={...store.results,[next]:result};
 const following=needed.find(n=>!results[n]);
 store={active:following!==undefined,progress:null,results,
  notice:following?`${next} abgeschlossen. Bitte ${following} Performer einstellen.`:'1, 2 und 4 Performer erfasst. Ergebnisse vergleichen.'};
 emit();
}
/** More conservative than a Pi/Mini-PC recommendation: measurements are not device comparisons. */
export function benchmarkAdviceV827(s:BenchmarkStoreV827):string{
 if(!needed.every(n=>s.results[n]))return 'Für einen Vergleich alle drei Besetzungen bei gleicher Auflösung, Qualität, Song und möglichst gleichen Effekten messen.';
 const values=needed.map(n=>s.results[n]!);
 if(new Set(values.map(v=>`${v.trackId}|${v.tier}`)).size!==1)return 'Nicht direkt vergleichbar: Song oder Qualitätsprofil unterscheiden sich.';
 if(values[2].slowFrameShare>.3||values[2].fps<30)return '4er-Besetzung zeigt starke Framezeitprobleme. Zuerst Effekte und GLB-Komplexität optimieren; Hardwareentscheidung separat benchmarken.';
 return 'Die drei Besetzungen wurden gemessen. Ein direkter Raspberry-Pi-/Mini-PC-Vergleich erfordert Messungen auf diesen Geräten.';
}
