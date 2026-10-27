/** V522 — an incremental benchmark of OBSERVED main-stage render windows.
 * No new sampling loop, GPU queries, synthetic audio, settings writes or fabricated FPS.
 * Numbers are window statistics, NOT a combined-frame percentile or Pi process metrics.
 */
import {studioConfigurationV518,validStudioReadingV518,
 type PiStudioReadingV518} from './piConcertPerformanceStudioV518';

export type BenchmarkSceneV522='deutschrap-feature'|'hardstyle-drop'|'long-concert';
export type BenchmarkRecipeV522=Readonly<{
 id:BenchmarkSceneV522;label:string;instructions:string;warmupSeconds:number;
 measurementSeconds:number;recommendedAvatars:2|4;recommendedQuality:'balanced'|'low';
}>;
export const BENCHMARK_RECIPES_V522:readonly BenchmarkRecipeV522[]=Object.freeze([
 {id:'deutschrap-feature',label:'Deutschrap-Feature (4 Avatare)',
  instructions:'Denselben Verse-/Hook-Abschnitt mit bestätigten Sängerrollen, Wort-Lyrics und Lip-Sync abspielen. Die Kamera und Bühnenkonfiguration für alle Wiederholungen möglichst gleich lassen.',
  warmupSeconds:5,measurementSeconds:30,recommendedAvatars:4,recommendedQuality:'balanced'},
 {id:'hardstyle-drop',label:'Hardstyle-/Hardtekk-Drop',
  instructions:'Einen festen Drop mit vier Tänzern, Bewegungswechseln und reaktivem Licht wiederholen. Den gleichen Songabschnitt und die gleiche Kamera wählen.',
  warmupSeconds:5,measurementSeconds:45,recommendedAvatars:4,recommendedQuality:'balanced'},
 {id:'long-concert',label:'Lange Konzertshow (3 Minuten)',
  instructions:'Mindestens drei Minuten mit durchgehender Wiedergabe und unveränderter Bühnenkonfiguration laufen lassen; dabei auf Unterbrechungen und sichtbare Speicherentwicklung achten.',
  warmupSeconds:5,measurementSeconds:180,recommendedAvatars:4,recommendedQuality:'low'},
]);
export const BENCHMARK_RUN_LIMIT_V522=12;
export const BENCHMARK_REPEAT_COUNT_V522=3;
export type BenchmarkStateV522='running'|'complete'|'invalid'|'cancelled';
export type BenchmarkRunV522=Readonly<{
 id:string;scene:BenchmarkSceneV522;targetFps:30|45|60;status:BenchmarkStateV522;
 reason:string;startedAt:number;lastAt:number;configuration:string;avatarCount:number;
 tier:PiStudioReadingV518['tier'];dpr:number;piProfile:string;piLevel:string;
 features:PiStudioReadingV518['features'];warmupSeconds:number;measurementSeconds:number;
 count:number;sumFps:number;minFps:number;worstP95Ms:number;worstP99Ms:number|null;
 p99Windows:number;sumSlowPercent:number;sumDrawCalls:number;maxTriangles:number;
 firstHeapMb:number|null;lastHeapMb:number|null;peakHeapMb:number|null;
 lastTextureCount:number|null;lastGeometryCount:number|null;
 endAt:number|null;
}>;
export type BenchmarkResultV522=Readonly<{
 scene:BenchmarkSceneV522;configuration:string;at:number;targetFps:number;
 seconds:number;windows:number;avgFps:number;minFps:number;
 worstWindowP95Ms:number;worstWindowP99Ms:number|null;
 avgSlowPercent:number;avgDrawCalls:number;maxTriangles:number;
 heapDeltaMb:number|null;peakHeapMb:number|null;
 targetMet:boolean;status:'meets-target'|'below-target'|'limited';
}>;
export type BenchmarkValidationV522=Readonly<{
 status:'insufficient'|'mixed'|'needs-review'|'provisional';
 reason:string;repetitions:number;meanFps:number|null;fpsRange:number|null;
 worstP95Ms:number|null;worstP99Ms:number|null;heapGrowthMb:number|null;
}>;
const range=(n:number,min:number,max:number)=>Number.isFinite(n)&&n>=min&&n<=max;
export function benchmarkRecipeV522(scene:BenchmarkSceneV522):BenchmarkRecipeV522{
 return BENCHMARK_RECIPES_V522.find(s=>s.id===scene)??BENCHMARK_RECIPES_V522[0];
}
/** A start is valid only after the LIVE main-canvas source has a recent valid reading. */
export function beginBenchmarkV522(id:string,scene:BenchmarkSceneV522,targetFps:30|45|60,
 reading:PiStudioReadingV518|null,now:number):BenchmarkRunV522|null{
 if(!reading||!validStudioReadingV518(reading)||!range(now,1,Number.MAX_SAFE_INTEGER)||
    now-reading.at>3500||now<reading.at-1500||!id||![30,45,60].includes(targetFps))return null;
 const recipe=benchmarkRecipeV522(scene);
 return {id,scene,targetFps,status:'running',reason:'Aufwärmen – aktuelle Rendering-Daten sammeln.',
  startedAt:reading.at,lastAt:reading.at,configuration:studioConfigurationV518(reading),
  avatarCount:reading.avatarCount,tier:reading.tier,dpr:reading.dpr,
  piProfile:reading.piProfile,piLevel:reading.piLevel,features:{...reading.features},
  warmupSeconds:recipe.warmupSeconds,measurementSeconds:recipe.measurementSeconds,
  count:0,sumFps:0,minFps:Infinity,worstP95Ms:0,worstP99Ms:null,p99Windows:0,
  sumSlowPercent:0,sumDrawCalls:0,maxTriangles:0,firstHeapMb:null,lastHeapMb:null,
  peakHeapMb:null,lastTextureCount:null,lastGeometryCount:null,endAt:null};
}
function invalid(run:BenchmarkRunV522,reason:string,at:number):BenchmarkRunV522{
 return {...run,status:'invalid',reason,endAt:at};
}
/** Called once for every new 1s V518 reading. Duplicate and old samples are ignored. */
export function advanceBenchmarkV522(run:BenchmarkRunV522,reading:PiStudioReadingV518):BenchmarkRunV522{
 if(run.status!=='running'||!reading||!Number.isFinite(reading.at)||reading.at<=run.lastAt)return run;
 if(!validStudioReadingV518(reading))return invalid(run,'Ungültige Render-Messung.',reading.at);
 const gap=reading.at-run.lastAt;
 if(gap<650||gap>2800)return invalid(run,'Messlücke oder unterbrochene Wiedergabe – Durchlauf nicht verwertbar.',reading.at);
 if(studioConfigurationV518(reading)!==run.configuration)
  return invalid(run,'Grafik-/Pi-Profil, Avatare, Lyrics, Lip-Sync oder Licht wurden verändert.',reading.at);
 const elapsed=(reading.at-run.startedAt)/1000;
 if(elapsed<=run.warmupSeconds)return {...run,lastAt:reading.at,
  reason:`Aufwärmen ${Math.min(run.warmupSeconds,Math.floor(elapsed))}/${run.warmupSeconds} s.`};
 // p99 is the observed 99th percentile of this individual 1s frame window, if available.
 const p99=reading.p99FrameMs;
 const hasP99=p99!==undefined&&range(p99,reading.p95FrameMs,250);
 const heap=reading.heapMb;
 const firstHeap=run.firstHeapMb??heap;
 const count=run.count+1;
 const expected=run.measurementSeconds;
 const complete=elapsed>=run.warmupSeconds+expected&&count>=expected-2;
 const next:BenchmarkRunV522={...run,lastAt:reading.at,count,sumFps:run.sumFps+reading.fps,
  minFps:Math.min(run.minFps,reading.fps),worstP95Ms:Math.max(run.worstP95Ms,reading.p95FrameMs),
  worstP99Ms:hasP99?Math.max(run.worstP99Ms??0,p99):run.worstP99Ms,
  p99Windows:run.p99Windows+Number(hasP99),sumSlowPercent:run.sumSlowPercent+reading.slowPercent,
  sumDrawCalls:run.sumDrawCalls+reading.drawCalls,maxTriangles:Math.max(run.maxTriangles,reading.triangles),
  firstHeapMb:firstHeap,lastHeapMb:heap??run.lastHeapMb,
  peakHeapMb:heap===null?run.peakHeapMb:Math.max(run.peakHeapMb??0,heap),
  lastTextureCount:reading.textures??null,lastGeometryCount:reading.geometries??null,
  status:complete?'complete':'running',endAt:complete?reading.at:null,
  reason:complete?'Messphase abgeschlossen – jetzt Sichtprüfung und weitere Wiederholungen durchführen.':
   `Messphase ${Math.min(expected,Math.floor(elapsed-run.warmupSeconds))}/${expected} s.`};
 return elapsed>run.warmupSeconds+expected+4&&!complete?
  invalid(next,'Zu wenige Messfenster für eine vollständige Messphase.',reading.at):next;
}
export function cancelBenchmarkV522(run:BenchmarkRunV522,at:number):BenchmarkRunV522{
 return run.status==='running'?{...run,status:'cancelled',endAt:at,reason:'Messung manuell abgebrochen.'}:run;
}
export function benchmarkResultV522(run:BenchmarkRunV522):BenchmarkResultV522|null{
 if(run.status!=='complete'||run.count<run.measurementSeconds-2)return null;
 const avgFps=run.sumFps/run.count,avgSlowPercent=run.sumSlowPercent/run.count;
 const targetMet=avgFps>=run.targetFps&&run.minFps>=run.targetFps*.65&&
  run.worstP95Ms<=1000/run.targetFps*2&&avgSlowPercent<=20;
 // p99 from the old builds could be missing. Do not silently certify a full validation.
 const coverage=run.p99Windows/run.count;
 const status=coverage<.9?'limited':targetMet?'meets-target':'below-target';
 return {scene:run.scene,configuration:run.configuration,at:run.endAt??run.lastAt,
  targetFps:run.targetFps,seconds:run.measurementSeconds,windows:run.count,avgFps,
  minFps:run.minFps,worstWindowP95Ms:run.worstP95Ms,
  worstWindowP99Ms:coverage>=.9?run.worstP99Ms:null,avgSlowPercent,
  avgDrawCalls:run.sumDrawCalls/run.count,maxTriangles:run.maxTriangles,
  heapDeltaMb:run.firstHeapMb!==null&&run.lastHeapMb!==null?run.lastHeapMb-run.firstHeapMb:null,
  peakHeapMb:run.peakHeapMb,targetMet,status};
}
export function validateBenchmarksV522(runs:readonly BenchmarkRunV522[],scene:BenchmarkSceneV522,
 targetFps:30|45|60,configuration:string):BenchmarkValidationV522{
 const completed=runs.filter(r=>r.status==='complete'&&r.scene===scene&&r.targetFps===targetFps);
 const matched=completed.filter(r=>r.configuration===configuration).slice(-BENCHMARK_REPEAT_COUNT_V522);
 const results=matched.map(benchmarkResultV522).filter((v):v is BenchmarkResultV522=>v!==null);
 const mixed=completed.some(r=>r.configuration!==configuration);
 if(results.length<BENCHMARK_REPEAT_COUNT_V522)return {status:mixed?'mixed':'insufficient',
  reason:`${results.length}/${BENCHMARK_REPEAT_COUNT_V522} abgeschlossene Wiederholungen mit gleicher erfasster Konfiguration. ${mixed?'Andere Profile sind getrennt zu beurteilen.':''}`,
  repetitions:results.length,meanFps:null,fpsRange:null,worstP95Ms:null,worstP99Ms:null,heapGrowthMb:null};
 const meanFps=results.reduce((s,r)=>s+r.avgFps,0)/results.length;
 const fpsRange=Math.max(...results.map(r=>r.avgFps))-Math.min(...results.map(r=>r.avgFps));
 const heapDelta=results.every(r=>r.heapDeltaMb!==null)?results.reduce((s,r)=>s+(r.heapDeltaMb??0),0):null;
 const p99Known=results.every(r=>r.worstWindowP99Ms!==null);
 const needsReview=!results.every(r=>r.status==='meets-target')||fpsRange>targetFps*.18||
   (heapDelta!==null&&heapDelta>64);
 return {status:needsReview?'needs-review':'provisional',
  reason:needsReview?'Mindestens ein Messlauf verfehlte die Kriterien oder die Wiederholungen schwanken deutlich.':
   'Drei Messläufe erfüllen die Browser-Kriterien. Sichtprüfung, Temperatur und reale Hardware bleiben offen.',
  repetitions:results.length,meanFps,fpsRange,
  worstP95Ms:Math.max(...results.map(r=>r.worstWindowP95Ms)),
  worstP99Ms:p99Known?Math.max(...results.map(r=>r.worstWindowP99Ms??0)):null,
  heapGrowthMb:heapDelta};
}
export type BenchmarkVisualAuditV522=Readonly<{
 lyricsLegible:boolean;lipSyncPlausible:boolean;motionNatural:boolean;lightReadable:boolean;
}>;
export function benchmarkVisualReviewV522(a:BenchmarkVisualAuditV522):string{
 return Object.values(a).every(Boolean)?'Sichtprüfung vom Nutzer bestätigt (keine automatische Bild-/Audio-Validierung).':
  'Mindestens ein Sichtprüfpunkt offen; Audio-/Lippensynchronität wird nicht automatisch gemessen.';
}
