/** V902 – Automatic Concert Quality Advisor.
 * Deterministic, evidence-backed proposals from the read-only V901 report.
 * No hidden writes, no new V826 sampling, no audio/GL resources and no claims
 * that renderer FPS necessarily improves after decreasing visual intensity.
 * Only whitelisted AUTO settings are eligible; authored/manual tracks are owned
 * by existing systems and cannot be modified here.
 */
import type {QualityReportV901} from './concertQualityIntelligenceV901';
export type AdvisorTargetV902='ultimate'|'camera'|'dance'|'laser'|'particles'|'spotlights';
export type AdvisorFieldV902='intensity'|'protectLyrics'|'protectFootwork';
export type AdvisorValueV902=number|boolean;
export interface AdvisorControlV902 {enabled:boolean;intensity?:number;protectLyrics?:boolean;protectFootwork?:boolean}
export interface AdvisorConfigV902 {
 ultimate:AdvisorControlV902;camera:AdvisorControlV902;dance:AdvisorControlV902;
 laser:AdvisorControlV902;particles:AdvisorControlV902;spotlights:AdvisorControlV902;
}
export interface AdvisorProposalV902 {
 id:string;target:AdvisorTargetV902;field:AdvisorFieldV902;
 before:AdvisorValueV902;after:AdvisorValueV902;
 title:string;why:string;expected:string;findingId:string;
 /** A proposal is tied to the verified scene in which it was previewed. */
 sceneIndex:number;
}
export interface AdvisorResultV902 {state:'ready'|'inactive'|'missing-evidence';proposals:readonly AdvisorProposalV902[];observations:readonly string[]}
export interface AdvisorPatchV902 {target:AdvisorTargetV902;field:AdvisorFieldV902;before:AdvisorValueV902;value:AdvisorValueV902}
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const eligible=(report:QualityReportV901)=>report.mode==='active'&&Number.isInteger(report.sceneIndex)&&report.sceneIndex>=0;
const numeric=(v:unknown)=>finite(v)&&Number.isInteger(v)&&v>=0&&v<=100;
const hasFinding=(report:QualityReportV901,id:string)=>report.findings.some(f=>f.id===id);
/** Never guesses missing measurements, revives disabled effects or edits manual lanes. */
export function adviseConcertV902(report:QualityReportV901,settings:AdvisorConfigV902):AdvisorResultV902 {
 if(!eligible(report))return {state:report.mode==='no-evidence'?'missing-evidence':'inactive',proposals:[],
  observations:['Keine aktive, bestätigte V900-Szene: keine Einstellungsvorschläge.']};
 const proposals:AdvisorProposalV902[]=[];
 const observations:string[]=[];
 const offer=(id:string,target:AdvisorTargetV902,field:AdvisorFieldV902,after:AdvisorValueV902,
  title:string,why:string,expected:string,findingId:string)=>{
  const control=settings[target];
  if(!control||!control.enabled)return;
  const before=control[field];
  if((typeof before!=='boolean'&&!numeric(before))||typeof before!==typeof after||before===after)return;
  if(field==='intensity'&&(!numeric(after)||(after as number)>(before as number)))return;
  if(field!=='intensity'&&after!==true)return; // protective flags only
  proposals.push({id,target,field,before:before as AdvisorValueV902,after,title,why,expected,findingId,sceneIndex:report.sceneIndex});
 };
 // Scene-specific V901 findings are configuration evidence, NOT optical recognition.
 if(hasFinding(report,'lyrics-guard')){
  offer('lyrics-v900','ultimate','protectLyrics',true,'Lyrics-Schutz der Konzertregie aktivieren',
   'V901 meldet in einem lyrics-sensiblen Abschnitt eine deaktivierte Schutzoption.',
   'Automatische Bühneneffekte werden bei Lyrics-Fokus vorsichtiger gedämpft; Lesbarkeit bleibt ungeprüft.', 'lyrics-guard');
  offer('lyrics-v897','camera','protectLyrics',true,'Lyrics-Schutz der Kamera aktivieren',
   'V901 erkennt eine deaktivierte Kameraschutz-Einstellung.',
   'Die vorhandene Kameraautomatik verzichtet bei Lyrics-Fokus auf zusätzliche Bewegungen.', 'lyrics-guard');
 }
 if(hasFinding(report,'foot-guard'))offer('foot-v899','dance','protectFootwork',true,
  'Fußkontakt-Schutz in der Tanzregie aktivieren',
  'V901 erkennt einen deaktivierten Fußkontakt-Schutz bei aktiver Tanzregie.',
  'Zusätzliche automatische Formationsverschiebungen werden bei Fußkontakt vorsichtiger begrenzt.', 'foot-guard');
 // Require actual live renderer measurements. No inference from a plan or stale paused values.
 const frames=report.frameEvidence===true&&report.targetFps!==null&&report.fps!==null&&
  finite(report.fps)&&finite(report.frameMs)&&finite(report.p95FrameMs)&&finite(report.pressure);
 const load=frames&&(hasFinding(report,'fps-critical')||hasFinding(report,'fps-warning')||
  hasFinding(report,'fx-pressure')||hasFinding(report,'frame-spikes'));
 if(load){
  const why=`V901: ${report.fps!.toFixed(1)} FPS, P95 ${report.p95FrameMs!.toFixed(1)} ms, FX-Druck ${Math.round(report.pressure!*100)} %. Renderer-Messwerte, nicht songbezogen.`;
  const reduce=(target:AdvisorTargetV902,minimum:number,step:number,id:string,title:string,expected:string)=>{
   const v=settings[target];
   if(!v?.enabled||!numeric(v.intensity)||(v.intensity as number)<=minimum)return;
   offer(id,target,'intensity',Math.max(minimum,(v.intensity as number)-step),title,why,expected,'renderer-load');
  };
  reduce('particles',35,20,'fx-particles','Dekorative Partikel reduzieren',
   'Weniger Partikel-Intensität innerhalb bereits freigegebener Effekte; FPS-Gewinn nicht garantiert.');
  reduce('laser',35,15,'fx-laser','Laserintensität zurücknehmen',
   'Weniger visuelle Laserintensität; keine Aussage über eine messbare FPS-Verbesserung.');
  reduce('spotlights',40,10,'lights-spotlights','Scheinwerfer ruhiger aussteuern',
   'Geringerer automatisch geplanter Spotlight-Akzent; reduziert nicht zwangsläufig GPU-Last.');
  if(hasFinding(report,'frame-spikes'))reduce('camera',35,10,'camera-smoothing',
   'Kamerabewegungen dezenter gestalten',
   'Weniger automatische Kamerabewegung; kann die Bildruhe verbessern, beseitigt keine Framezeit-Spitzen.');
  observations.push('Renderer-Warnung: zuerst im Browser erneut messen; Empfehlungen verändern keine Avatar-LOD und keine manuelle Show.');
 }else if(!frames)observations.push('Keine gültige laufende V826-Messung: keine Leistungsoptimierung aus FPS-Schätzungen.');
 if(!proposals.length)observations.push('Aktuell keine begründete, automatisch anwendbare Änderung. Weiterhin visuell im Browser prüfen.');
 return {state:'ready',proposals:proposals.slice(0,8),observations};
}
/** Recalculate on the click; any changed scene, evidence, setting or active flag
 * invalidates the preview. Caller must then explicitly dispatch this patch. */
export function confirmConcertAdviceV902(
 proposal:AdvisorProposalV902|null|undefined,report:QualityReportV901,settings:AdvisorConfigV902
):AdvisorPatchV902|null {
 if(!proposal||!eligible(report)||!settings[proposal.target]?.enabled)return null;
 const fresh=adviseConcertV902(report,settings).proposals.find(x=>x.id===proposal.id);
 if(!fresh||fresh.sceneIndex!==proposal.sceneIndex||fresh.target!==proposal.target||
  fresh.field!==proposal.field||fresh.before!==proposal.before||fresh.after!==proposal.after||
  fresh.findingId!==proposal.findingId)return null;
 return {target:fresh.target,field:fresh.field,before:fresh.before,value:fresh.after};
}
export function exportConcertAdviceV902(report:QualityReportV901,result:AdvisorResultV902):string {
 return JSON.stringify({schema:'sonic-concert-advisor-v902',version:1,
  type:'manual-advisor-preview',sceneIndex:report.sceneIndex,state:result.state,
  proposals:result.proposals,observations:result.observations,
  warning:'Preview only: no modification is applied by this export. Visual quality and actual performance improvements are not measured.'},null,2);
}
