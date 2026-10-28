/** V627 – read-only, evidence-aware concert quality summary.
 * V522: measured main WebGL benchmark windows; V543: explicitly human-checked visuals;
 * optionally imported V593: heuristics derived from real V592 screenshots.
 * Neither FPS nor imported JSON certifies lip sync, artistic quality or an entire song.
 */
import {BENCHMARK_RECIPES_V522,benchmarkResultV522,
 type BenchmarkRunV522,type BenchmarkSceneV522} from './concertBenchmarkValidationV522';
import {assessConcertShowReadinessV543,type ConcertVisualReviewsV543} from './concertShowReadinessV543';

export type QualitySeverityV627='high'|'medium'|'info';
export type ConcertFindingV627=Readonly<{
 id:string;area:string;severity:QualitySeverityV627;evidence:'measured-browser'|'human-review-pending'|'imported-image-heuristic';
 detail:string;recommendation:string;scene:BenchmarkSceneV522|null;
}>;
export type VisualAdvisorFindingV627=Readonly<{
 id:string;area:string;priority:'high'|'medium'|'low';reason:string;action:string;
 capturedFrames:number;totalFrames:number;
}>;
export type VisualAdviceImportV627=Readonly<{
 format:'sonic-v593-concert-advice';status:'advice-needs-human-review';
 source:'v592-live-report';sourceScreenshotCount:number;
 humanReviewRequired:true;autoApplied:false;
 recommendations:readonly VisualAdvisorFindingV627[];
}>;
export type ConcertQualityReportV627=Readonly<{
 format:'sonic-v627-concert-quality-inspection';version:'V627';
 status:'measurements-missing'|'attention-needed'|'human-review-needed'|'reviewed-locally';
 targetFps:30|45|60;scenesMeasured:number;scenesWithThreeMatchingRuns:number;
 scenesManuallyReviewed:number;visualFramesImported:number;visualSource:'none'|'v593-import';
 inspectionScope:'selected-benchmark-scenes-not-full-song';
 findings:readonly ConcertFindingV627[];
 sceneEvidence:readonly Readonly<{scene:BenchmarkSceneV522;configuration:string|null;
 repetitions:number;performance:'provisional'|'needs-review'|'mixed'|'insufficient';
 humanChecks:number;averageFps:number|null;worstP99Ms:number|null;}>[];
 limitations:readonly string[];automaticApproval:false;
}>;

const obj=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const num=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const safe=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length>0&&v.length<=max;
/** Strictly accept the V593 advice envelope, without treating user-supplied JSON as trusted hardware evidence. */
export function parseVisualAdviceV627(value:unknown):VisualAdviceImportV627|null{
 if(!obj(value)||value.format!=='sonic-v593-concert-advice'||value.status!=='advice-needs-human-review'||
  value.source!=='v592-live-report'||value.humanReviewRequired!==true||value.autoApplied!==false||
  !Number.isInteger(value.sourceScreenshotCount)||!num(value.sourceScreenshotCount)||
  value.sourceScreenshotCount<2||value.sourceScreenshotCount>200||
  !Array.isArray(value.recommendations)||value.recommendations.length>30)return null;
 const parsed:VisualAdvisorFindingV627[]=[];
 const ids=new Set<string>();
 for(const entry of value.recommendations as unknown[]){
  if(!obj(entry)||!safe(entry.id,64)||!(/^[a-z0-9-]+$/).test(entry.id)||ids.has(entry.id)||
   !safe(entry.area,70)||!safe(entry.reason,600)||!safe(entry.action,700)||
   !['high','medium','low'].includes(String(entry.priority))||entry.status!=='suggested-not-applied'||
   !obj(entry.evidence)||!Number.isInteger(entry.evidence.capturedFrames)||
   !Number.isInteger(entry.evidence.totalFrames)||!num(entry.evidence.capturedFrames)||
   !num(entry.evidence.totalFrames)||entry.evidence.totalFrames!==value.sourceScreenshotCount||
   entry.evidence.capturedFrames<2||entry.evidence.capturedFrames>entry.evidence.totalFrames)return null;
  ids.add(entry.id);
  parsed.push({id:entry.id,area:entry.area,priority:entry.priority as VisualAdvisorFindingV627['priority'],
   reason:entry.reason,action:entry.action,capturedFrames:entry.evidence.capturedFrames,
   totalFrames:entry.evidence.totalFrames});
 }
 return {format:'sonic-v593-concert-advice',status:'advice-needs-human-review',
  source:'v592-live-report',sourceScreenshotCount:value.sourceScreenshotCount,
  humanReviewRequired:true,autoApplied:false,recommendations:parsed};
}
export function inspectConcertQualityV627(
 runs:readonly BenchmarkRunV522[],reviews:ConcertVisualReviewsV543,targetFps:30|45|60,
 visual:VisualAdviceImportV627|null=null,
):ConcertQualityReportV627{
 const readiness=assessConcertShowReadinessV543(runs,reviews,targetFps);
 const findings:ConcertFindingV627[]=[];
 const add=(f:ConcertFindingV627)=>{if(findings.length<32&&!findings.some(v=>v.id===f.id))findings.push(f);};
 for(const scene of readiness.scenes){
  const id=scene.scene;
  const newestInvalid=runs.some(r=>r.scene===id&&r.targetFps===targetFps&&r.status==='invalid'&&
   !runs.some(next=>next.scene===id&&next.targetFps===targetFps&&next.status==='complete'&&next.startedAt>r.startedAt));
  if(newestInvalid){
   add({id:`invalid-${id}`,area:'Messintegrität',severity:'high',evidence:'measured-browser',scene:id,
    detail:`${scene.label}: Mindestens ein späterer Durchlauf wurde wegen instabiler oder geänderter Messbedingungen verworfen.`,
    recommendation:'Quelle der Unterbrechung oder Konfigurationsänderung prüfen und einen neuen vollständigen Lauf durchführen.'});
  }
  if(scene.repetitions<3){
   add({id:`missing-${id}`,area:'Performance',severity:'medium',evidence:'measured-browser',scene:id,
    detail:`${scene.repetitions}/3 vergleichbare, vollständig gemessene Durchläufe für ${scene.label}.`,
    recommendation:'Dreimal dieselbe Passage mit unveränderter WebGL-Auflösung, Avatarzahl, Qualität und Effekten messen.'});
  }else if(scene.status==='needs-review'){
   add({id:`slow-${id}`,area:'Performance',severity:'high',evidence:'measured-browser',scene:id,
    detail:`Leistungsziel für ${scene.label} verfehlt oder Wiederholungen instabil (${scene.meanFps?.toFixed(1)??'?'} FPS im Mittel).`,
    recommendation:'Draw Calls, LOD und optionale Bühnen-Effekte einzeln vergleichen; keine automatische Qualitätsänderung.'});
  }else if(scene.status==='mixed'){
   add({id:`mixed-${id}`,area:'Performance',severity:'medium',evidence:'measured-browser',scene:id,
    detail:`${scene.label}: Messkonfigurationen unterscheiden sich.`,
    recommendation:'Nur drei Durchläufe mit derselben aufgezeichneten Konfiguration vergleichen.'});
  }
  if(scene.repetitions===3&&scene.worstP99Ms===null){
   add({id:`p99-${id}`,area:'Performance',severity:'medium',evidence:'measured-browser',scene:id,
    detail:`${scene.label}: P99-Framezeit nicht vollständig gemessen.`,
    recommendation:'Messung in unterstütztem Browser wiederholen und P99-Daten kontrollieren.'});
  }
  if(scene.visualChecked<4){
   add({id:`human-${id}`,area:'Lyrics, Lip-Sync, Tanz und Licht',severity:'info',
    evidence:'human-review-pending',scene:id,
    detail:`${scene.label}: ${scene.visualChecked}/4 manuelle Sicht-/Hörprüfungen bestätigt.`,
    recommendation:'Lyrics, Sängerzuordnung/Lippensynchronität, Fußkontakt und Kamera/Licht im echten Song prüfen.'});
  }
  const relevant=runs.filter(r=>r.scene===id&&r.targetFps===targetFps&&r.status==='complete');
  const last=relevant.at(-1);
  const evidence=last?relevant.filter(r=>r.configuration===last.configuration).slice(-3):[];
  if(evidence.length===3){
   const results=evidence.map(benchmarkResultV522);
   if(results.every(r=>r!==null)&&results.some(r=>(r?.avgSlowPercent??0)>20)){
    add({id:`stutters-${id}`,area:'Frame-Pacing',severity:'high',evidence:'measured-browser',scene:id,
     detail:`${scene.label}: mehr als 20 % langsame Frames in mindestens einem gemessenen Lauf.`,
     recommendation:'Framezeiten und sichtbare Hänger im selben Abschnitt vergleichen; Bühnen-FX stufenweise prüfen.'});
   }
  }
 }
 if(visual){
  for(const item of visual.recommendations){
   add({id:`visual-${item.id}`,area:item.area,severity:item.priority==='high'?'high':item.priority==='medium'?'medium':'info',
    evidence:'imported-image-heuristic',scene:null,
    detail:`${item.reason} (${item.capturedFrames}/${item.totalFrames} Aufnahmen; importierter V593-Bericht).`,
    recommendation:item.action});
  }
 }else{
  add({id:'missing-v593',area:'Kamera und Bildkomposition',severity:'info',evidence:'human-review-pending',scene:null,
   detail:'Kein V593-Bildbericht eingelesen: Kamera-Cropping, Lyrics-Überlappung und Avataraufstellung wurden nicht automatisch bildbasiert geprüft.',
   recommendation:'Optional eine echte V592-Aufnahme durchführen und den daraus erzeugten V593-JSON-Hinweisbericht importieren.'});
 }
 const order:{[K in QualitySeverityV627]:number}={high:0,medium:1,info:2};
 findings.sort((a,b)=>order[a.severity]-order[b.severity]||a.id.localeCompare(b.id));
 const high=findings.some(f=>f.severity==='high');
 const status=high?'attention-needed':readiness.completedScenes<3?'measurements-missing':
  readiness.reviewedScenes<3?'human-review-needed':'reviewed-locally';
 return {format:'sonic-v627-concert-quality-inspection',version:'V627',status,targetFps,
  scenesMeasured:readiness.scenes.filter(s=>s.repetitions>0).length,
  scenesWithThreeMatchingRuns:readiness.completedScenes,scenesManuallyReviewed:readiness.reviewedScenes,
  visualFramesImported:visual?.sourceScreenshotCount??0,visualSource:visual?'v593-import':'none',
  inspectionScope:'selected-benchmark-scenes-not-full-song',
  findings,sceneEvidence:readiness.scenes.map(s=>({scene:s.scene,configuration:s.configuration,
   repetitions:s.repetitions,performance:s.status,humanChecks:s.visualChecked,
   averageFps:s.meanFps,worstP99Ms:s.worstP99Ms})),
  limitations:[
   'Drei V522-Testszenen sind keine lückenlose Messung des gesamten Songs; V522-Langzeitlauf misst höchstens drei Minuten.',
   'FPS, Framezeiten und Renderbudgets beurteilen keine Lippenformen, Audio-Synchronität, Fußkontakt oder künstlerische Qualität.',
   'V543-Sichtprüfungen sind Bedieneraussagen, keine automatische Validierung.',
   visual?'V593-JSON stammt aus einem lokalen Import; Herkunft und Unverändertheit sind nicht kryptografisch überprüft. Bildwarnungen sind Heuristiken.':
    'Ohne V593-Bericht stehen keine bildbasierten Kamera-/Lyrics-Befunde zur Verfügung.',
   'Keine automatische Freigabe, Änderung von Regie/Spotify oder Prognose zur Raspberry-Pi-Hardware.'
  ],automaticApproval:false};
}
export function exportConcertQualityV627(report:ConcertQualityReportV627,operatorNote:string){
 return {exportedFormat:'sonic-v627-operator-report',report,
  operatorNote:operatorNote.trim().slice(0,2000),
  provenance:'Browser V518/V522 observed WebGL windows; V543 manual reviews; optional imported V593 image heuristics',
  warning:'Nicht als vollständig automatisch geprüfte Song- oder Hardwarequalität interpretieren.'};
}
