/** V693: explicit local quality-improvement workflow; no automatic fixes or approvals.
 * Advisory priorities refer only to measured/repeated evidence, never dance aesthetics.
 */
import type {V641Audit} from './fullConcertQualityAuditV641';
import type {V692Check,V692Domain,V692Evidence,V692Inspection,V692Status} from './concertQualityInspectorV692';

export type V693Priority='hoch'|'normal'|'sichtpruefung'|'daten-fehlen';
export type V693Progress='offen'|'in-arbeit'|'manuell-geprueft';
export interface V693Task{
 id:V692Domain;title:string;priority:V693Priority;status:V692Status;
 evidence:V692Evidence;atMs:number|null;detail:string;action:string;
 /** Stable within a track; the progress is only user-controlled. */
 key:string;
}
export interface V693Snapshot{
 format:'sonic-v693-qa-snapshot';trackId:string;durationMs:number;captureId:number;
 samples:number;coveragePercent:number;avatarCounts:number[];verifiedGlbCounts:number[];
 medianFps:number|null;medianP95Ms:number|null;
 checks:V692Check[];automaticallyApproved:false;
}
export type V693Change='hinweis-nicht-wiederholt'|'neuer-hinweis'|'weiter-pruefen'|'nicht-vergleichbar';
export interface V693ComparisonRow{
 id:V692Domain;title:string;evidence:V692Evidence;change:V693Change;
 beforeAtMs:number|null;afterAtMs:number|null;
}
export interface V693Comparison{
 comparable:boolean;reason:string;trackId:string|null;
 rows:V693ComparisonRow[];fpsDelta:number|null;p95DeltaMs:number|null;
 requiresHumanReview:true;automaticallyApproved:false;
}
const domains:readonly V692Domain[]=['dance','camera','lyrics','lighting','performance'];
const priorities:Record<V693Priority,number>={hoch:0,normal:1,sichtpruefung:2,'daten-fehlen':3};
const copyCheck=(c:V692Check):V692Check=>({...c});
const validCheck=(c:V692Check)=>domains.includes(c.id)&&
 ['review','observed','manual','insufficient'].includes(c.status)&&
 ['browser-measurement','geometric-projection','director-metadata','none'].includes(c.evidence)&&
 (c.atMs===null||(Number.isFinite(c.atMs)&&c.atMs>=0));

/** Do not manufacture tasks without a user-started, valid song recording. */
export function createV693Tasks(inspection:V692Inspection):V693Task[]{
 if(inspection.mode!=='full-song'||!inspection.trackId||inspection.sampleCount===0)return [];
 return inspection.checks.filter(validCheck).map((c):V693Task=>({
  id:c.id,title:c.title,
  priority:c.status==='insufficient'?'daten-fehlen':c.status==='manual'?'sichtpruefung':
   c.status==='review'&&c.evidence==='browser-measurement'?'hoch':'normal',
  status:c.status,evidence:c.evidence,atMs:c.atMs,detail:c.detail,action:c.action,
  key:`${inspection.trackId}:${c.id}`,
 })).sort((a,b)=>priorities[a.priority]-priorities[b.priority]||domains.indexOf(a.id)-domains.indexOf(b.id));
}

/** Clone the audit summary: subsequent recordings must not mutate the 'before' evidence. */
export function createV693Snapshot(report:V641Audit,inspection:V692Inspection,captureId:number):V693Snapshot|null{
 if(!Number.isSafeInteger(captureId)||captureId<=0||report.status==='no-evidence'||!report.trackId||report.samples<=0||report.samples!==inspection.sampleCount||
  inspection.mode!=='full-song'||inspection.trackId!==report.trackId||
  report.durationMs<=0||!Number.isFinite(report.coveragePercent)||
  !inspection.checks.every(validCheck)||inspection.checks.length!==5||
  domains.some(id=>inspection.checks.filter(c=>c.id===id).length!==1))return null;
 return {format:'sonic-v693-qa-snapshot',trackId:report.trackId,durationMs:report.durationMs,captureId,
  samples:report.samples,coveragePercent:report.coveragePercent,
  avatarCounts:[...report.observedAvatarCounts],verifiedGlbCounts:[...report.verifiedGlbCounts],
  medianFps:report.medianFps,medianP95Ms:report.medianP95Ms,
  checks:inspection.checks.map(copyCheck),automaticallyApproved:false};
}
const same=(a:readonly number[],b:readonly number[])=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const close=(a:number|null,b:number|null):number|null=>
 a!==null&&b!==null&&Number.isFinite(a)&&Number.isFinite(b)?Math.round((b-a)*10)/10:null;
const empty=(reason:string,trackId:string|null):V693Comparison=>({comparable:false,reason,trackId,
 rows:[],fpsDelta:null,p95DeltaMs:null,requiresHumanReview:true,automaticallyApproved:false});

/** Compare warnings, NOT visual quality. 'Not repeated' never means 'fixed'. */
export function compareV693Snapshots(before:V693Snapshot|null,after:V693Snapshot|null):V693Comparison{
 if(!before||!after)return empty('Vorher- und Nachher-Aufzeichnung müssen ausdrücklich gespeichert werden.',before?.trackId??after?.trackId??null);
 if(before.captureId===after.captureId)
  return empty('Vorher und Nachher müssen aus zwei getrennt gestarteten Aufzeichnungen stammen.',before.trackId);
 if(before.trackId!==after.trackId||Math.abs(before.durationMs-after.durationMs)>1500)
  return empty('Unterschiedlicher Song oder unterschiedliche Songdauer: kein gültiger Vergleich.',null);
 if(before.samples<30||after.samples<30||before.coveragePercent<60||after.coveragePercent<60)
  return empty('Mindestens 30 Messpunkte und 60 % tatsächliche Songabdeckung pro Aufnahme benötigt.',before.trackId);
 if(!same(before.avatarCounts,after.avatarCounts)||!same(before.verifiedGlbCounts,after.verifiedGlbCounts))
  return empty('Avatar- bzw. nachgewiesene GLB-Konfiguration unterschiedlich: Ergebnisse nicht vergleichbar.',before.trackId);
 // Widely different coverage can bias warning/no-warning comparisons even when >=60%.
 if(Math.abs(before.coveragePercent-after.coveragePercent)>15)
  return empty('Songabdeckung weicht um mehr als 15 Prozentpunkte ab. Aufnahme wiederholen.',before.trackId);
 const rows:V693ComparisonRow[]=domains.map(id=>{
  const a=before.checks.find(c=>c.id===id),b=after.checks.find(c=>c.id===id);
  const comparable=!!a&&!!b&&a.evidence===b.evidence&&a.evidence!=='none'&&
   ['review','observed'].includes(a.status)&&['review','observed'].includes(b.status);
  const change:V693Change=!comparable?'nicht-vergleichbar':
   a.status==='review'&&b.status==='observed'?'hinweis-nicht-wiederholt':
   a.status==='observed'&&b.status==='review'?'neuer-hinweis':'weiter-pruefen';
  return {id,title:b?.title??a?.title??id,evidence:comparable?b!.evidence:'none',change,
   beforeAtMs:a?.atMs??null,afterAtMs:b?.atMs??null};
 });
 const fpsDelta=rows.find(c=>c.id==='performance')?.change!=='nicht-vergleichbar'?
  close(before.medianFps,after.medianFps):null;
 const p95DeltaMs=rows.find(c=>c.id==='performance')?.change!=='nicht-vergleichbar'?
  close(before.medianP95Ms,after.medianP95Ms):null;
 return {comparable:true,reason:'Nur wiederholte Warnhinweise aus vergleichbaren Aufzeichnungen; keine automatische Fehlerbehebung oder Freigabe.',
  trackId:before.trackId,rows,fpsDelta,p95DeltaMs,requiresHumanReview:true,automaticallyApproved:false};
}
