/** V753: bounded, explicit-session read-only measurements from the V466 WebGL probe.
 * These are observed renderer telemetry windows, not GPU timings or simulated FPS.
 * No song identity, track data, device identifiers or lyrics are recorded. */
export type BenchmarkSampleV753 = Readonly<{
  at:number; metricsAt:number; fps:number; frameMs:number; p95WindowMs:number; drawCalls:number;
  triangles:number; geometries:number|null; textures:number|null; jsHeapMb:number|null;
}>;
export type BenchmarkEnvironmentV753 = Readonly<{
  avatars:1|2|3|4; qualityTier:string; canvasWidth:number; canvasHeight:number;
}>;
export type BenchmarkRunV753 = Readonly<{
  environment:BenchmarkEnvironmentV753; startedAt:number; status:'running'|'complete'|'stopped';
  samples:readonly BenchmarkSampleV753[]; lastReason:string;
}>;
export type ProbeReadingV753 = Readonly<{
  at:number; fps:number|null; frameMs:number|null; p95FrameMs:number|null;
  drawCalls:number|null; triangles:number|null; qualityTier:string; samples:number;
  canvas:{width:number;height:number}|null;
  avatars:readonly {loaded?:boolean}[];
  assessment:{activeAvatarCount:number}|null;
  geometries?:number|null; textures?:number|null; jsHeapMb?:number|null;
  renderWidthPx?:number|null; renderHeightPx?:number|null; metricsAt?:number|null;
}>;
export const BENCHMARK_TARGET_SAMPLES_V753=12;
const finite=(n:number|null|undefined)=>typeof n==='number'&&Number.isFinite(n);
const positive=(n:number|null|undefined)=>finite(n)&&(n as number)>0;
const nonnegative=(n:number|null|undefined)=>finite(n)&&(n as number)>=0;
const validCount=(n:number):n is 1|2|3|4=>Number.isInteger(n)&&n>=1&&n<=4;
const integer=(v:number)=>Number.isInteger(v)&&v>=0;
const bounded=(v:number|null|undefined,max:number)=>nonnegative(v)&&(v as number)<=max?v!:null;
export function validateProbeV753(p:ProbeReadingV753,now:number,requested:number):string|null{
 if(!validCount(requested))return 'Nur Gruppen mit 1 bis 4 Avataren sind vergleichbar';
 if(!finite(now)||!finite(p.at)||p.at<=0||p.at>now||now-p.at>2500)return 'Keine frische WebGL-Messung';
 if(!p.canvas||!finite(p.canvas.width)||!finite(p.canvas.height)||p.canvas.width<160||p.canvas.height<100)return 'Keine gültige Canvas-Auflösung';
 if(!positive(p.renderWidthPx)||!positive(p.renderHeightPx)||p.renderWidthPx!<160||p.renderHeightPx!<100)return 'Keine gültige WebGL-Renderauflösung';
 if(!positive(p.metricsAt)||p.metricsAt!>now||now-p.metricsAt!>2500)return 'Keine frische Renderer-Timing-Messung';
 if(p.assessment?.activeAvatarCount!==requested||p.avatars.length!==requested)return `Die laufende Bühne zeigt nicht ${requested} Avatar(e)`;
 if(p.avatars.some(a=>a.loaded!==true))return 'Mindestens ein Avatar-GLB ist noch nicht geladen';
 if(!p.qualityTier||p.qualityTier==='?')return 'Kein gültiges Qualitätsprofil';
 if(!integer(p.samples)||p.samples<2)return 'Zu wenige Renderer-Frames in der Messung';
 if(!positive(p.fps)||(p.fps as number)>240||!positive(p.frameMs)||(p.frameMs as number)>1000||
    !positive(p.p95FrameMs)||(p.p95FrameMs as number)>1000||!nonnegative(p.drawCalls)||
    !nonnegative(p.triangles))return 'Unvollständige oder ungültige Renderer-Metriken';
 return null;
}
export function startBenchmarkV753(p:ProbeReadingV753,now:number,requested:number):BenchmarkRunV753|null{
 if(validateProbeV753(p,now,requested)!==null||!p.canvas||!validCount(requested))return null;
 return {environment:{avatars:requested,qualityTier:p.qualityTier,
  canvasWidth:Math.round(p.renderWidthPx!),canvasHeight:Math.round(p.renderHeightPx!)},
  startedAt:now,status:'running',samples:[],lastReason:''};
}
export function collectBenchmarkV753(run:BenchmarkRunV753,p:ProbeReadingV753,now:number):BenchmarkRunV753{
 if(run.status!=='running')return run;
 const reason=validateProbeV753(p,now,run.environment.avatars);
 if(reason)return {...run,status:'stopped',lastReason:reason};
 if(!p.canvas||p.qualityTier!==run.environment.qualityTier||
    Math.round(p.renderWidthPx!)!==run.environment.canvasWidth||
    Math.round(p.renderHeightPx!)!==run.environment.canvasHeight)
   return {...run,status:'stopped',lastReason:'Qualitätsprofil oder Canvas-Auflösung während der Messung geändert'};
 if(p.at<run.startedAt||p.metricsAt!<run.startedAt)return run;
 if(run.samples.length&&(p.at<=run.samples[run.samples.length-1].at||p.metricsAt!<=run.samples[run.samples.length-1].metricsAt))return run;
 if(run.samples.length&&p.at-run.samples[run.samples.length-1].at>3000)
   return {...run,status:'stopped',lastReason:'Unterbrechung von mehr als drei Sekunden'};
 if(now-run.startedAt>60000)return {...run,status:'stopped',lastReason:'Messzeit überschritten'};
 const sample:BenchmarkSampleV753={at:p.at,metricsAt:p.metricsAt!,fps:p.fps!,frameMs:p.frameMs!,p95WindowMs:p.p95FrameMs!,
   drawCalls:p.drawCalls!,triangles:p.triangles!,geometries:bounded(p.geometries,1e7),
   textures:bounded(p.textures,1e7),jsHeapMb:bounded(p.jsHeapMb,1e6)};
 const samples=[...run.samples,sample];
 return {...run,samples,status:samples.length>=BENCHMARK_TARGET_SAMPLES_V753?'complete':'running',lastReason:''};
}
export function stopBenchmarkV753(run:BenchmarkRunV753,reason='Manuell beendet'):BenchmarkRunV753{
 return run.status==='running'?{...run,status:'stopped',lastReason:reason}:run;
}
const avg=(n:readonly number[])=>n.reduce((s,v)=>s+v,0)/n.length;
const median=(n:readonly number[])=>{const a=[...n].sort((x,y)=>x-y),mid=a.length>>1;return a.length%2?a[mid]:(a[mid-1]+a[mid])/2;};
export function summarizeBenchmarkV753(run:BenchmarkRunV753){
 if(run.status!=='complete'||run.samples.length!==BENCHMARK_TARGET_SAMPLES_V753)return null;
 const s=run.samples,known=(key:'geometries'|'textures'|'jsHeapMb')=>{
  const values=s.map(x=>x[key]).filter((x):x is number=>x!==null);
  return values.length===s.length?Math.round(median(values)*10)/10:null;
 };
 return {environment:run.environment,windows:s.length,
  fps:Math.round(avg(s.map(x=>x.fps))*10)/10,
  minFps:Math.round(Math.min(...s.map(x=>x.fps))*10)/10,
  avgFrameMs:Math.round(avg(s.map(x=>x.frameMs))*10)/10,
  medianP95WindowMs:Math.round(median(s.map(x=>x.p95WindowMs))*10)/10,
  drawCalls:Math.round(avg(s.map(x=>x.drawCalls))),triangles:Math.round(avg(s.map(x=>x.triangles))),
  geometries:known('geometries'),textures:known('textures'),jsHeapMb:known('jsHeapMb')};
}
export type BenchmarkSummaryV753=NonNullable<ReturnType<typeof summarizeBenchmarkV753>>;
export function comparableBenchmarksV753(a:BenchmarkSummaryV753,b:BenchmarkSummaryV753){
 return a.environment.qualityTier===b.environment.qualityTier&&
 a.environment.canvasWidth===b.environment.canvasWidth&&a.environment.canvasHeight===b.environment.canvasHeight;
}
/** Only user-confirmed complete measurements. Changing avatar count remains a manual step. */
export function exportBenchmarkCsvV753(results:readonly BenchmarkSummaryV753[]):string{
 const rows=['avatars,quality,canvasWidth,canvasHeight,windows,avgFps,minFps,avgFrameMs,medianWindowP95Ms,avgDrawCalls,avgTriangles,geometries,textures,jsHeapMb'];
 for(const r of results){const e=r.environment;
  rows.push([e.avatars,e.qualityTier.replace(/[^\w-]/g,''),e.canvasWidth,e.canvasHeight,
   r.windows,r.fps,r.minFps,r.avgFrameMs,r.medianP95WindowMs,r.drawCalls,r.triangles,
   r.geometries??'',r.textures??'',r.jsHeapMb??''].join(','));}
 return '\uFEFF'+rows.join('\r\n')+'\r\n';
}
