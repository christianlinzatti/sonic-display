/** V626 – evidence-only 10-inch concert device sizing from actual V522 main-canvas runs.
 * This report NEVER predicts Raspberry Pi FPS from measurements on a different computer.
 * It does not measure GPU load/VRAM, wattage, temperature or process RAM.
 */
import {benchmarkResultV522,type BenchmarkRunV522,type BenchmarkSceneV522} from './concertBenchmarkValidationV522';

export type DeviceBaselineRowV626=Readonly<{
 avatarCount:2|3|4;repetitions:number;status:'missing'|'incomplete'|'meets-target'|'below-target'|'limited';
 meanFps:number|null;minFps:number|null;worstWindowP95Ms:number|null;
 worstWindowP99Ms:number|null;meanSlowPercent:number|null;
 maxDrawCalls:number|null;maxTriangles:number|null;maxHeapDeltaMb:number|null;
}>;
export type DeviceBaselineV626=Readonly<{
 scene:BenchmarkSceneV522;targetFps:30|45|60;renderWidthPx:number;renderHeightPx:number;
 profile:string;quality:string;dpr:number;features:string;
 comparable:boolean;ready:boolean;reason:string;
 rows:readonly DeviceBaselineRowV626[];fpsDrop2To4:number|null;
 /** No measured cross-device evidence exists: hardware recommendation is deliberately withheld. */
 hardwareRecommendation:'unknown';
}>;
export const V626_REPETITIONS=3;
const avg=(n:readonly number[])=>n.reduce((sum,v)=>sum+v,0)/n.length;
const round=(n:number)=>Math.round(n*10)/10;
const int=(n:number)=>Number.isInteger(n)&&n>0&&n<=16384;
/** Returns dimensions only if the actual drawing buffer was recorded by V626. */
export function renderSizeV626(config:string):{width:number;height:number}|null{
 const m=config.match(/\|(\d+)x(\d+)$/);if(!m)return null;
 const width=Number(m[1]),height=Number(m[2]);
 return int(width)&&int(height)?{width,height}:null;
}
/** Normalizes a measured configuration by avatar count; all other flags MUST match. */
export function deviceProfileV626(config:string):string|null{
 const parts=config.split('|');
 if(parts.length!==7||!['2','3','4'].includes(parts[0])||!renderSizeV626(config))return null;
 return parts.slice(1).join('|');
}
export function planDeviceBaselineV626(runs:readonly BenchmarkRunV522[],scene:BenchmarkSceneV522,
 targetFps:30|45|60,selectedProfile:string|null):DeviceBaselineV626{
 const profile=selectedProfile??'';
 const compatible=runs.filter(r=>r.status==='complete'&&r.scene===scene&&r.targetFps===targetFps&&
   deviceProfileV626(r.configuration)===profile&&profile.length>0);
 const validProfile=profile.length>0&&compatible.length>0;
 const size=validProfile?renderSizeV626(compatible[0].configuration):null;
 const flags=profile.split('|');
 const rows:DeviceBaselineRowV626[]=([2,3,4] as const).map((avatarCount):DeviceBaselineRowV626=>{
  const matched=compatible.filter(r=>r.avatarCount===avatarCount).slice(-V626_REPETITIONS);
  const metrics=matched.map(benchmarkResultV522).filter((x):x is NonNullable<typeof x>=>x!==null);
  const repetitions=metrics.length;
  if(!repetitions)return {avatarCount,repetitions,status:'missing' as const,meanFps:null,minFps:null,
   worstWindowP95Ms:null,worstWindowP99Ms:null,meanSlowPercent:null,
   maxDrawCalls:null,maxTriangles:null,maxHeapDeltaMb:null};
  const complete=repetitions>=V626_REPETITIONS;
  const p99Known=metrics.every(m=>m.worstWindowP99Ms!==null);
  const status=!complete?'incomplete':!p99Known?'limited':metrics.every(m=>m.status==='meets-target')?'meets-target':'below-target';
  return {avatarCount,repetitions,status,meanFps:round(avg(metrics.map(m=>m.avgFps))),
   minFps:round(Math.min(...metrics.map(m=>m.minFps))),
   worstWindowP95Ms:round(Math.max(...metrics.map(m=>m.worstWindowP95Ms))),
   worstWindowP99Ms:p99Known?round(Math.max(...metrics.map(m=>m.worstWindowP99Ms??0))):null,
   meanSlowPercent:round(avg(metrics.map(m=>m.avgSlowPercent))),
   maxDrawCalls:round(Math.max(...metrics.map(m=>m.avgDrawCalls))),
   maxTriangles:Math.max(...metrics.map(m=>m.maxTriangles)),
   maxHeapDeltaMb:metrics.every(m=>m.heapDeltaMb!==null)?round(Math.max(...metrics.map(m=>m.heapDeltaMb??0))):null};
 });
 const ready=!!size&&rows.every(r=>r.repetitions>=V626_REPETITIONS&&r.status!=='limited');
 const two=rows[0].meanFps,four=rows[2].meanFps;
 const fpsDrop2To4=rows[0].repetitions>=V626_REPETITIONS&&rows[2].repetitions>=V626_REPETITIONS&&two!==null&&four!==null?round(two-four):null;
 return {scene,targetFps,renderWidthPx:size?.width??0,renderHeightPx:size?.height??0,
  profile,quality:flags[0]??'',dpr:Number(flags[1])||0,features:flags[4]??'',
  comparable:!!size,ready,rows,fpsDrop2To4,hardwareRecommendation:'unknown',
  reason:!size?'Noch keine abgeschlossene Messung mit dokumentierter WebGL-Renderauflösung.':
   !ready?'Pro Avatar-Anzahl 3 vollständige Messläufe mit demselben Profil, DPR, Renderformat, Songabschnitt und aktivierten Funktionen aufnehmen.':
   'Drei vergleichbare Messläufe pro Avatar-Anzahl vorhanden. Gemessene Windows-/Browser-Leistung, keine Pi-Prognose.'};
}
/** Select only profile of latest valid finished run, not from a potentially unrecorded future config. */
export function latestBaselineProfileV626(runs:readonly BenchmarkRunV522[],scene:BenchmarkSceneV522,
 targetFps:30|45|60):string|null{
 for(let i=runs.length-1;i>=0;i--){const r=runs[i];if(r.status==='complete'&&r.scene===scene&&
   r.targetFps===targetFps){const profile=deviceProfileV626(r.configuration);if(profile)return profile;}}
 return null;
}
export function exportDeviceReportV626(runs:readonly BenchmarkRunV522[],baseline:DeviceBaselineV626,
 operatorNote:string){
 const eligible=runs.filter(r=>r.status==='complete'&&r.scene===baseline.scene&&
  r.targetFps===baseline.targetFps&&deviceProfileV626(r.configuration)===baseline.profile);
 return {version:'V626',createdAt:new Date().toISOString(),operatorNote:operatorNote.trim().slice(0,500),
  provenance:'Observed main-WebGL-canvas 1s browser frame windows from V518/V522.',
  limitations:['Main-thread frame time is not GPU time or GPU utilization',
   'WebGL renderer counts do not measure GPU VRAM, temperature, power or total RAM',
   'No transferable Raspberry Pi performance estimate',
   'Window P95/P99 are maxima of per-second percentiles, not pooled frame percentiles',
   'Hardware device identity and 10-inch physical size are not verified by pixels',
   'Different musical passages, auto-quality changes, browser caps and thermal drift confound comparisons'],
  baseline,completedRuns:eligible.map(r=>({run:r,result:benchmarkResultV522(r)}))};
}
