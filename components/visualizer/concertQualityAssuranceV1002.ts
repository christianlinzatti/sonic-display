/** V1002: evidence-scoped, read-only Concert Quality Assurance.
 * Structural intent is NOT visually verified. FPS is NOT GPU timing. No song,
 * lyrics, audio or private metadata are retained or sent to the optional AI.
 */
import type {ConcertInspectionV801} from './concertExperienceInspectorV801';

export type ConcertQaSeverityV1002='important'|'improve'|'info';
export type ConcertQaFindingCodeV1002=
 'missing-plan'|'coverage-gap'|'camera-repetition'|'camera-variety'|'missing-break'|
 'lyrics-unverified'|'performance-slow'|'frame-variance'|'render-unavailable'|
 'visual-projection'|'performance-stable'|'performer-unverified';
export type ConcertQaFindingV1002=Readonly<{
 code:ConcertQaFindingCodeV1002;severity:ConcertQaSeverityV1002;
 evidence:'plan'|'runtime'|'unknown';title:string;recommendation:string;
}>;
export type ConcertQaInputV1002=Readonly<{
 now:number;planAt:number;playing:boolean;plan:ConcertInspectionV801;
 renderAt:number;fps:number|null;p95FrameMs:number|null;warnings:readonly string[];
 targetFps:number;governorAt:number;governorActive:boolean;
}>;
export type ConcertQaReportV1002=Readonly<{
 source:'local-evidence';planAvailable:boolean;runtimeAvailable:boolean;
 structureScore:number|null;sceneCount:number;cameraIntentCount:number|null;
 measuredFps:number|null;measuredP95:number|null;targetFps:number;
 findings:readonly ConcertQaFindingV1002[];
 unverified:readonly string[];
}>;
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const fresh=(at:number,now:number,ttl:number)=>finite(at)&&finite(now)&&at>0&&now>=at&&now-at<=ttl;
const finding=(code:ConcertQaFindingCodeV1002,severity:ConcertQaSeverityV1002,
 evidence:ConcertQaFindingV1002['evidence'],title:string,recommendation:string):ConcertQaFindingV1002=>
 ({code,severity,evidence,title,recommendation});
const rank:Record<ConcertQaSeverityV1002,number>={important:0,improve:1,info:2};
export function reviewConcertQualityV1002(i:ConcertQaInputV1002):ConcertQaReportV1002{
 const validPlan=fresh(i.planAt,i.now,6000)&&i.playing&&i.plan.source==='verified-plan'&&
  i.plan.trackId.length>0&&i.plan.durationMs>0&&i.plan.sceneCount>0&&
  finite(i.plan.coverage)&&i.plan.coverage>=0&&i.plan.coverage<=1&&
  finite(i.plan.structureScore)&&i.plan.structureScore!==null&&i.plan.structureScore>=0&&i.plan.structureScore<=100;
 const validRender=i.playing&&fresh(i.renderAt,i.now,5000)&&
  finite(i.fps)&&i.fps!==null&&i.fps>0&&i.fps<=240&&
  finite(i.p95FrameMs)&&i.p95FrameMs!==null&&i.p95FrameMs>0&&i.p95FrameMs<=250;
 const target=([30,45,60] as const).includes(i.targetFps as 30|45|60)?i.targetFps:45;
 const f:ConcertQaFindingV1002[]=[];
 if(validPlan){
  const codes=new Set(i.plan.findings.map(x=>x.code));
  if(i.plan.coverage<.98||[...codes].some(x=>x.startsWith('coverage-gap')))
   f.push(finding('coverage-gap','important','plan','Lücken in der geplanten Show',
    'Bestätigte Szenenintervalle prüfen; keine ungemessenen Songabschnitte erfinden.'));
  if(codes.has('repeated-camera'))
   f.push(finding('camera-repetition','improve','plan','Wiederholte Kamera-Intents',
    'Eine alternative Perspektive im Storyboard planen und Sängerfokus erhalten.'));
  if(codes.has('low-shot-variety'))
   f.push(finding('camera-variety','improve','plan','Wenig geplante Kameravielfalt',
    'Mehr unterschiedliche Kamera-Intents für bestätigte Songabschnitte vorsehen.'));
  if(codes.has('missing-breath'))
   f.push(finding('missing-break','improve','plan','Keine ausgewiesene Ruhephase',
    'Eine musikalisch belegte Atempause prüfen; keine künstlichen Breaks auslösen.'));
  if(codes.has('unsynced-lyrics')||codes.has('no-lyrics'))
   f.push(finding('lyrics-unverified','info','plan','Lyrics nicht vollständig bestätigt',
    'Lyrics-Verfügbarkeit und Zeitmarken im entsprechenden Modul prüfen.'));
 }else f.push(finding('missing-plan','info','unknown','Keine aktuelle bestätigte Showplanung',
  'Laufenden Song und verifiziertes Storyboard prüfen, bevor du Strukturwerte vergleichst.'));
 if(validRender){
  const badFps=i.fps!<target*.85;
  const highP95=i.p95FrameMs!>1000/target*1.5;
  if(badFps)f.push(finding('performance-slow',i.fps!<target*.7?'important':'improve',
   'runtime','Gemessene Bildrate unter Ziel',
   'Optionale Effekte im V999-Performance-Governor reduzieren und erneut messen.'));
  if(highP95)f.push(finding('frame-variance','improve','runtime','Hohe P95-Framezeit',
   'Auf Frame-Spitzen achten; Nebel, Partikel und Crowd-Akzente im Budget prüfen.'));
  if(!badFps&&!highP95)f.push(finding('performance-stable','info','runtime',
   'Aktuelle Framewerte innerhalb der Prüfschwellen',
   'Längere Abschnitte separat beobachten; ein Messfenster belegt keine stabile Gesamtshow.'));
  if(i.warnings.length>0)f.push(finding('visual-projection','improve','runtime',
   'Hinweise der freiwilligen WebGL-Projektionsprüfung',
   'V466-Warnungen im Qualitätsdashboard ansehen; es handelt sich nicht um eine Pixel- oder Lip-Sync-Analyse.'));
 }else f.push(finding('render-unavailable','info','unknown','Keine frische WebGL-Messung',
  'Freiwillige V466-WebGL-Probe öffnen, um FPS und P95-Framezeit zu prüfen.'));
 f.push(finding('performer-unverified','info','unknown','Tanz und Lip-Sync nicht objektiv bewertet',
  'Manuelle Sichtprüfung und echte Wort-/Bewegungszeitdaten für eine Qualitätsabnahme nutzen.'));
 // Do not multiply findings for repeated scenes or let source strings enter AI input.
 const unique=Array.from(new Map(f.map(x=>[x.code,x])).values());
 unique.sort((a,b)=>rank[a.severity]-rank[b.severity]);
 return {
  source:'local-evidence',planAvailable:validPlan,runtimeAvailable:validRender,
  structureScore:validPlan?i.plan.structureScore:null,
  sceneCount:validPlan?i.plan.sceneCount:0,
  cameraIntentCount:validPlan?new Set(i.plan.scenes.map(s=>s.intent)).size:null,
  measuredFps:validRender?Math.round(i.fps!*10)/10:null,
  measuredP95:validRender?Math.round(i.p95FrameMs!*10)/10:null,
  targetFps:target,findings:unique.slice(0,9),
  unverified:['Tatsächliche Kamerawechsel','Tanz- und Foot-IK-Qualität','Phonem-/Lip-Sync-Genauigkeit','Raumlichtwirkung/Govee'],
 };
}
/** Whitelist only aggregated issue codes. Do not send song IDs, titles or details. */
export function aiConcertQaPayloadV1002(report:ConcertQaReportV1002){
 return {planAvailable:report.planAvailable,runtimeAvailable:report.runtimeAvailable,
  structureScore:report.structureScore,sceneCount:Math.min(report.sceneCount,200),
  targetFps:report.targetFps,fps:report.measuredFps,p95FrameMs:report.measuredP95,
  codes:report.findings.filter(f=>f.code!=='performer-unverified'&&f.code!=='performance-stable')
   .map(f=>f.code).slice(0,8)};
}
export type QaAiResponseV1002=Readonly<{summary:string;suggestions:readonly string[]}>;
export function normalizeQaAiResponseV1002(raw:unknown):QaAiResponseV1002|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 if(typeof r.summary!=='string'||r.summary.trim().length<8||r.summary.length>450||
  !Array.isArray(r.suggestions)||r.suggestions.length<1||r.suggestions.length>3||
  !r.suggestions.every(x=>typeof x==='string'&&x.trim().length>=8&&x.length<=240))return null;
 return {summary:r.summary.trim(),suggestions:r.suggestions.map((s:string)=>s.trim())};
}
