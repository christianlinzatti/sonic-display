/** V906 – evidence-only, privacy-preserving reports from COMPLETE V905 benchmark runs.
 * Pure module. No device detection, GPU measurement, timers, persistence or external calls.
 * A report describes the current measured device only. It cannot predict Raspberry Pi FPS.
 */
import {summarizeGuidedBenchmarksV905,type BenchmarkRunV905,
 type BenchmarkPresetV905,type BenchmarkGroupStatusV905} from './guidedConcertBenchmarkV905';
import type {ReviewTierV903} from './concertQualityReviewV903';

export const BENCHMARK_REPORT_MIN_RUNS_V906=3;
export const BENCHMARK_REPORT_SCHEMA_V906='sonic-concert-benchmark-report-v906';
export type ReportEvidenceV906='insufficient'|'variable'|'repeatable';
export type ReportSeverityV906='note'|'attention'|'risk';
export interface ReportFindingV906 {code:string;severity:ReportSeverityV906;title:string;detail:string;nextStep:string}
export interface ReportRunV906 {index:number;fpsMedian:number;fpsMean:number;frameMsMedian:number;p95WindowMean:number;
 pressureMean:number;belowTargetShare:number;samples:number}
export interface BenchmarkReportV906 {
 groupId:number;sceneIndex:number;preset:BenchmarkPresetV905;tier:ReviewTierV903;targetFps:30|60;
 count:number;evidence:ReportEvidenceV906;status:BenchmarkGroupStatusV905;frameBudgetMs:number;
 fpsMedian:number;fpsMin:number;fpsMax:number;fpsIqr:number;fpsSpread:number;
 frameMsMedian:number;p95WindowMean:number;pressureMean:number;
 belowTargetRuns:number;belowBudgetShare:number;firstToLastFpsDelta:number|null;
 findings:ReportFindingV906[];runs:ReportRunV906[];
}
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const round=(x:number,digits=2):number=>Number(x.toFixed(digits));
const median=(values:readonly number[])=>{const a=[...values].sort((x,y)=>x-y),m=Math.floor(a.length/2);
 return a.length%2?a[m]:(a[m-1]+a[m])/2;};
const percentile=(values:readonly number[],p:number)=>{const a=[...values].sort((x,y)=>x-y),index=(a.length-1)*p;
 const low=Math.floor(index),high=Math.ceil(index);return a[low]+(a[high]-a[low])*(index-low);};
/** One-run V905 validation is reused so corrupted or manually fabricated entries do not create reports. */
const validV905Run=(r:BenchmarkRunV905)=>!!r&&summarizeGuidedBenchmarksV905([r]).length===1&&
 [r.fpsMedian,r.fpsMean,r.frameMsMedian,r.p95WindowMean,r.pressureMean,r.belowTargetShare].every(finite);
const sameRunContext=(a:BenchmarkRunV905,b:BenchmarkRunV905)=>a.trackKey===b.trackKey&&a.sceneIndex===b.sceneIndex&&
 a.preset===b.preset&&a.targetFps===b.targetFps&&a.tier===b.tier;
/** Only V905-validated groups, no cross-song or cross-performance-profile comparison. */
export function createConcertBenchmarkReportsV906(history:readonly BenchmarkRunV905[]):BenchmarkReportV906[] {
 const groups=summarizeGuidedBenchmarksV905(history);
 return groups.flatMap(g=>{
  const anchor=history.find(r=>r.id===g.groupId&&r.sceneIndex===g.sceneIndex&&
   r.preset===g.preset&&r.tier===g.tier&&r.targetFps===g.targetFps&&validV905Run(r));
  if(!anchor)return [];
  const seen=new Set<number>();
  const matches=history.filter(r=>validV905Run(r)&&sameRunContext(r,anchor)&&!seen.has(r.id)&&!!seen.add(r.id));
  if(matches.length!==g.count||!matches.length)return []; // reject inconsistent/tampered history
  const fps=matches.map(r=>r.fpsMedian),budget=1000/g.targetFps;
  const evidence:ReportEvidenceV906=matches.length<BENCHMARK_REPORT_MIN_RUNS_V906?'insufficient':
   g.status==='variable'?'variable':'repeatable';
  const iqr=percentile(fps,.75)-percentile(fps,.25),spread=Math.max(...fps)-Math.min(...fps);
  const pressure=matches.reduce((acc,r)=>acc+r.pressureMean,0)/matches.length;
  const share=matches.filter(r=>r.p95WindowMean>budget*1.25).length/matches.length;
  const findings:ReportFindingV906[]=[];
  if(evidence==='insufficient')findings.push({code:'need-repeats',severity:'note',title:'Noch keine belastbare Wiederholung',
   detail:`${matches.length} von mindestens ${BENCHMARK_REPORT_MIN_RUNS_V906} unabhängigen Läufen vorhanden.`,
   nextStep:'Zwei bzw. weitere Durchläufe mit demselben Songabschnitt, Profil und Messpreset erfassen.'});
  if(evidence==='variable')findings.push({code:'unstable',severity:'attention',title:'Starke Schwankungen zwischen Läufen',
   detail:`FPS-Spannweite ${round(spread,1)}; Aussagen zu Hardware und Einstellungen derzeit unsicher.`,
   nextStep:'Hintergrundprogramme und Browserlast stabilisieren; denselben Abschnitt mehrfach wiederholen.'});
  if(evidence==='repeatable'&&g.status==='below-target')findings.push({code:'below-target',severity:'risk',
   title:'FPS-Ziel mehrfach deutlich unterschritten',detail:`${g.belowTargetRuns} von ${g.count} Läufen unter 80 % von ${g.targetFps} FPS.`,
   nextStep:'Auf diesem Gerät niedrigere FX-/Qualitätsstufe testen und unter gleichen Bedingungen erneut messen.'});
  if(evidence==='repeatable'&&share>=.5)findings.push({code:'slow-p95',severity:'attention',
   title:'Langsame Frame-Spitzen in mehreren Läufen',detail:`In ${Math.round(share*100)} % der Läufe lag der Mittelwert der V826-P95-Fenster über 125 % des Framebudgets (${round(budget,1)} ms).`,
   nextStep:'Abweichende Spikes im Browser/Performance-Dashboard prüfen; GPU-Ursache ist nicht nachgewiesen.'});
  if(evidence==='repeatable'&&pressure>=.7)findings.push({code:'fx-pressure',severity:'attention',
   title:'Hoher FX-Regeldruck',detail:`Durchschnittlicher V826-FX-Druck: ${round(pressure*100,1)} %.`,
   nextStep:'Dekorative Partikel- und Laserintensität probeweise reduzieren; danach neue identische Durchläufe messen.'});
  if(evidence==='repeatable'&&!findings.length)findings.push({code:'stable',severity:'note',title:'Messungen vergleichbar',
   detail:'In diesen Durchläufen keine eindeutige schwere Renderer-Warnung; dies ist keine Prüfung der Bildqualität.',
   nextStep:'Zum Hardwarevergleich denselben Benchmark separat auf dem Zielgerät ausführen.'});
  findings.push({code:'hardware',severity:'note',title:'Hardwarewahl nicht hochrechnen',
   detail:'Die Ergebnisse gelten nur für das Gerät, auf dem diese Renderer-Messungen aufgenommen wurden. CPU-/GPU-Modell und GPU-Zeit sind nicht gemessen.',
   nextStep:'Vor einem Raspberry Pi oder Mini-PC Kauf dieselbe 3D-Szene mit realen GLB-Avataren auf dem jeweiligen Zielgerät benchmarken.'});
  return [{groupId:g.groupId,sceneIndex:g.sceneIndex,preset:g.preset,tier:g.tier,targetFps:g.targetFps,
   count:matches.length,evidence,status:g.status,frameBudgetMs:round(budget),
   fpsMedian:round(median(fps)),fpsMin:round(Math.min(...fps)),fpsMax:round(Math.max(...fps)),
   fpsIqr:round(iqr),fpsSpread:round(spread),frameMsMedian:round(g.frameMsMedian),
   p95WindowMean:round(g.p95WindowMean),pressureMean:round(pressure,4),
   belowTargetRuns:g.belowTargetRuns,belowBudgetShare:round(share,4),
   firstToLastFpsDelta:evidence==='repeatable'?round(fps[fps.length-1]-fps[0]):null,
   findings,runs:matches.map((r,index)=>({index:index+1,fpsMedian:round(r.fpsMedian),fpsMean:round(r.fpsMean),
    frameMsMedian:round(r.frameMsMedian),p95WindowMean:round(r.p95WindowMean),pressureMean:round(r.pressureMean,4),
    belowTargetShare:round(r.belowTargetShare,4),samples:r.samples}))}];
 });
}
/** Fully anonymous output. Deliberately omits V905's groupId and all private song keys. */
const anonymousReports=(runs:readonly BenchmarkRunV905[])=>createConcertBenchmarkReportsV906(runs).map(({groupId,...rest},index)=>({report:index+1,...rest}));
export function exportConcertBenchmarkReportV906(history:readonly BenchmarkRunV905[]):string {
 return JSON.stringify({schema:BENCHMARK_REPORT_SCHEMA_V906,version:1,source:'V826 renderer windows summarized by V905',
  reports:anonymousReports(history),limitations:[
   'Measured FPS/frame intervals are not GPU timing, visual quality, power consumption or device specifications.',
   'P95-window mean is not the P95 across all captured frames.',
   'Only same private song, verified scene, preset, FPS target and performance tier are grouped.',
   'Differences between benchmark runs are observational, not proof that any setting caused a change.',
   'No Raspberry Pi or mini-PC performance can be predicted from a different device.'
  ]},null,2);
}
/** Offline Markdown report for sharing/printing, also without track IDs, timestamps or raw frames. */
export function exportConcertBenchmarkMarkdownV906(history:readonly BenchmarkRunV905[]):string {
 const reports=anonymousReports(history);
 const lines=['# Sonic Display V906 – Concert Benchmark Report','','Quelle: echte V826 Renderer-Messfenster, zusammengefasst durch V905.'];
 if(!reports.length)lines.push('','Keine abgeschlossenen Benchmarkläufe vorhanden.');
 for(const r of reports){
  lines.push('','## Bericht '+r.report+' – Szene '+(r.sceneIndex+1),
   `- Profil: ${r.tier}; Messpreset: ${r.preset}; FPS-Ziel: ${r.targetFps}; Läufe: ${r.count}`,
   `- Evidenz: ${r.evidence} (${r.status})`,
   `- FPS-Median: ${r.fpsMedian}; Bereich: ${r.fpsMin}–${r.fpsMax}; IQR: ${r.fpsIqr}`,
   `- Median Framezeit: ${r.frameMsMedian} ms; Ø V826-P95-Fenster: ${r.p95WindowMean} ms; Budget: ${r.frameBudgetMs} ms`,
   `- Ø FX-Druck: ${(r.pressureMean*100).toFixed(1)} %; langsame P95-Läufe: ${(r.belowBudgetShare*100).toFixed(0)} %`,
   '', '| Lauf | FPS-Median | Framezeit (ms) | Ø P95 (ms) | FX-Druck |','| --- | ---: | ---: | ---: | ---: |');
  for(const run of r.runs)lines.push(`| ${run.index} | ${run.fpsMedian} | ${run.frameMsMedian} | ${run.p95WindowMean} | ${(run.pressureMean*100).toFixed(1)} % |`);
  lines.push('','### Hinweise');
  for(const f of r.findings)lines.push(`- **${f.title}:** ${f.detail} Nächster Schritt: ${f.nextStep}`);
 }
 lines.push('','**Grenzen:** Ergebnisse gelten nur für das gemessene Gerät. Keine GPU-Zeit, keine optische Qualitätsprüfung, keine Kausalität und keine Raspberry-Pi-Prognose. Songkennungen, Zeitstempel und einzelne Frame-Messungen werden nicht exportiert.');
 return lines.join('\n')+'\n';
}
