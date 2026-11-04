/** V901 – Concert Quality Intelligence 2.0.
 * Pure, read-only quality evidence derived from V900 cue and existing V826 frame
 * telemetry. Camera composition, lyric occlusion and dance pose quality are NOT
 * directly measured: report configuration/evidence checks, never fake scores.
 * No renderer changes, autonomous tuning, network access or expensive sampling.
 */
import type {UltimateCueV900,UltimatePlanV900} from './ultimateConcertExperienceV900';
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';

export type QualityFindingLevelV901='info'|'warning'|'critical';
export type QualityLaneStateV901='ready'|'inactive'|'unknown'|'attention';
export interface QualityFindingV901 {id:string;level:QualityFindingLevelV901;text:string}
export interface QualityLaneV901 {id:'camera'|'lyrics'|'dance'|'lights'|'fx';label:string;state:QualityLaneStateV901;detail:string}
export interface QualitySettingsV901 {enabled:boolean;showRenderer:boolean;showChecks:boolean;showRecommendations:boolean;maxFindings:number}
export const QUALITY_STORAGE_KEY_V901='sonic-concert-quality-intelligence-v901';
export const DEFAULT_QUALITY_SETTINGS_V901:Readonly<QualitySettingsV901>={enabled:true,showRenderer:true,showChecks:true,showRecommendations:true,maxFindings:6};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function normalizeQualitySettingsV901(raw:unknown):QualitySettingsV901 {
 const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<QualitySettingsV901>:{};
 const defaults=DEFAULT_QUALITY_SETTINGS_V901;
 const flag=(key:'enabled'|'showRenderer'|'showChecks'|'showRecommendations')=>typeof r[key]==='boolean'?r[key]:defaults[key];
 return {enabled:flag('enabled'),showRenderer:flag('showRenderer'),showChecks:flag('showChecks'),
  showRecommendations:flag('showRecommendations'),maxFindings:finite(r.maxFindings)?Math.round(clamp(r.maxFindings,1,12)):defaults.maxFindings};
}
export interface QualityEvidenceV901 {
 trackId:string;durationMs:number;positionMs:number;playing:boolean;reducedMotion:boolean;
 autoEnabled:boolean;directorEnabled:boolean;ultimateEnabled:boolean;
 plan:UltimatePlanV900|null|undefined;cue:UltimateCueV900|null|undefined;
 renderer:ConcertQualitySnapshotV826|null|undefined;
 cameraEnabled:boolean;danceEnabled:boolean;lightsEnabled:boolean;ledEnabled:boolean;
 fxEnabled:boolean;lyricsGuard:boolean;cameraLyricsGuard:boolean;danceFootGuard:boolean;
 energyExpected:boolean;
}
export interface QualityReportV901 {
 mode:'disabled'|'paused'|'no-evidence'|'active';headline:string;
 scene:string|null;sceneIndex:number;frameEvidence:boolean;fps:number|null;frameMs:number|null;
 p95FrameMs:number|null;targetFps:30|60|null;pressure:number|null;
 /** Overall status is NOT an invented quality score. Warnings are based on evidence. */
 severity:'none'|'warning'|'critical';lanes:readonly QualityLaneV901[];findings:readonly QualityFindingV901[];
 measured:readonly string[];unmeasured:readonly string[];
}
const lane=(id:QualityLaneV901['id'],label:string,state:QualityLaneStateV901,detail:string):QualityLaneV901=>({id,label,state,detail});
const noValues=()=>({frameEvidence:false,fps:null,frameMs:null,p95FrameMs:null,targetFps:null,pressure:null});
/** Song bounds and cue identity must agree; stale/foreign scores are not used. */
export function evaluateConcertQualityV901(e:QualityEvidenceV901):QualityReportV901 {
 const findings:QualityFindingV901[]=[];
 const add=(id:string,level:QualityFindingLevelV901,text:string)=>{if(!findings.some(x=>x.id===id))findings.push({id,level,text});};
 const plan=e.plan;
 const validClock=!!e.trackId&&e.trackId.length<=160&&finite(e.durationMs)&&e.durationMs>=10000&&e.durationMs<=1800000&&
  finite(e.positionMs)&&e.positionMs>=0&&e.positionMs<e.durationMs;
 const verified=!!plan&&plan.source==='verified-v604'&&validClock&&plan.trackId===e.trackId&&
  plan.durationMs===e.durationMs&&Array.isArray(plan.scenes)&&plan.scenes.length>0;
 const scene=verified?plan!.scenes.find(s=>finite(s.startMs)&&finite(s.endMs)&&e.positionMs>=s.startMs&&e.positionMs<s.endMs):null;
 const cueValid=!!scene&&e.cue?.active===true&&e.cue.sceneIndex===scene.index&&e.cue.reason==='active';
 const active=e.playing&&!e.reducedMotion&&e.autoEnabled&&e.directorEnabled&&e.ultimateEnabled;
 const mode:QualityReportV901['mode']=!validClock?'no-evidence':!e.playing?'paused':!active?'disabled':!scene?'no-evidence':'active';
 const measured: string[]=[];
 const unmeasured=['Kamera-Framing und Gesichtssichtbarkeit','tatsächliche Lyrics-Überdeckung','Fußkontakt und Tanzqualität','tatsächliche Licht- und FX-Sichtbarkeit'];
 if(mode==='no-evidence')add('timeline','info','Keine passende, bestätigte Song-Partitur: Bild- und Choreografiekoordination lässt sich nicht beurteilen.');
 if(mode==='paused')add('paused','info','Wiedergabe pausiert: Keine laufende Konzertqualität bewerten.');
 if(mode==='disabled')add('inactive','info',e.reducedMotion?'Reduzierte Bewegung aktiv: automatische Regie bleibt zurückgenommen.':'Konzertautomatik oder V900-Regie deaktiviert; manuelle Show wird nicht als Fehler gewertet.');
 if(mode==='active'&&!cueValid)add('cue','info','Es liegt kein aktiver V900-Regieakzent vor; bestehende Show bleibt unverändert.');
 const lyricsScene=!!scene&&(scene.motif==='lyric-space'||scene.motif==='portrait');
 if(mode==='active'&&lyricsScene&&(!e.lyricsGuard||!e.cameraLyricsGuard))add('lyrics-guard','warning','Lyrics-/Kameraschutz in den Einstellungen prüfen; keine Messung einer tatsächlichen Überdeckung.');
 if(mode==='active'&&e.danceEnabled&&!e.danceFootGuard)add('foot-guard','warning','Tanz-Fußkontakt-Schutz ist deaktiviert. Prüfe die manuelle Choreografie.');
 if(mode==='active'&&e.energyExpected&&!e.cue?.energyUsed)add('energy','info','Für diese Szene sind keine ausreichend aktuellen Audio-Energiewerte bestätigt. Keine Energieereignisse ableiten.');
 const planned=(n:unknown):string=>finite(n)&&n>=0&&n<=1.1?`${Math.round(n*100)} % Soll`:'keine gültige Sollstärke';
 const lanes:QualityLaneV901[]=[
  lane('camera','Kamera',mode!=='active'?'unknown':!e.cameraEnabled?'inactive':cueValid?'ready':'unknown',
   mode!=='active'?'Keine aktive automatische Szene':!e.cameraEnabled?'Automatische Kamera deaktiviert':cueValid?`Kameratempo ${planned(e.cue!.cameraRate)}; Bildausschnitt nicht gemessen`:'Wartet auf einen gültigen Regieakzent'),
  lane('lyrics','Lyrics',mode!=='active'?'unknown':!e.lyricsGuard||!e.cameraLyricsGuard?'attention':'ready',
   !e.lyricsGuard||!e.cameraLyricsGuard?'Nicht alle Lyrics-Schutzoptionen sind aktiviert':'Schutzoptionen aktiv; tatsächliche Lesbarkeit nicht gemessen'),
  lane('dance','Tänzer',mode!=='active'?'unknown':!e.danceEnabled?'inactive':!e.danceFootGuard?'attention':cueValid?'ready':'unknown',
   !e.danceEnabled?'Automatische Tanzkoordination deaktiviert':!e.danceFootGuard?'Fußkontakt-Schutz prüfen':cueValid?`Tanzintensität ${planned(e.cue!.danceGain)}; Tanzqualität nicht gemessen`:'Kein aktiver V900-Tanzakzent'),
  lane('lights','Beleuchtung',mode!=='active'?'unknown':!e.lightsEnabled&&!e.ledEnabled?'inactive':cueValid?'ready':'unknown',
   !e.lightsEnabled&&!e.ledEnabled?'Licht- und LED-Koordination ausgeschaltet':cueValid?`Spotlights ${planned(e.cue!.lightGain)}, LED ${planned(e.cue!.ledGain)}; nicht optisch geprüft`:'Kein aktiver V900-Lichtakzent'),
  lane('fx','Spezialeffekte',mode!=='active'?'unknown':!e.fxEnabled?'inactive':'ready',
   !e.fxEnabled?'FX-Kopplung ausgeschaltet':'FX-Steuerung vorhanden; tatsächliche Sichtbarkeit wird nicht gemessen'),
 ];
 // V826 is live renderer-wide telemetry, NOT attributed to a specific song.
 const r=e.renderer;
 const frameEvidence=!!r?.available&&e.playing&&r.playing===true&&finite(r.fps)&&r.fps>0&&r.fps<=500&&
  finite(r.frameMs)&&r.frameMs>0&&r.frameMs<=250&&finite(r.p95FrameMs)&&r.p95FrameMs>=0&&
  (r.targetFps===30||r.targetFps===60)&&finite(r.pressure)&&r.pressure>=0&&r.pressure<=1&&r.sampleCount>0;
 let values:Pick<QualityReportV901,'frameEvidence'|'fps'|'frameMs'|'p95FrameMs'|'targetFps'|'pressure'>=noValues();
 if(frameEvidence){
  values={frameEvidence:true,fps:r!.fps,frameMs:r!.frameMs,p95FrameMs:r!.p95FrameMs,
   targetFps:r!.targetFps,pressure:r!.pressure};
  measured.push('Frame-Abstände und V825-FX-Druck des laufenden Renderers (nicht songbezogen)');
  if(r!.status==='critical')add('fps-critical','critical','Starke Renderer-Verlangsamung: GPU-/Avatar-Last und aktive FX im V826-Dashboard prüfen.');
  else if(r!.status==='warning')add('fps-warning','warning','Framezeiten erhöht: Effektbudget und Performance-Profil prüfen.');
  if(r!.pressure>=.72)add('fx-pressure','warning','FX-Regeldruck hoch; dekorative Effekte reduzieren, falls die Bildrate leidet.');
  if(r!.p95FrameMs>1000/r!.targetFps*1.8)add('frame-spikes','warning','P95-Framezeit erhöht: mögliche Lastspitzen genauer untersuchen.');
 }else if(e.playing)add('no-frames','info','Keine gültigen V826-Live-Frames. Qualitätsdashboard in Concert FX Studio aktivieren; FPS werden nicht geschätzt.');
 // Actual strength is planned attenuation only, never infer real visibility.
 const severity=findings.some(x=>x.level==='critical')?'critical':findings.some(x=>x.level==='warning')?'warning':'none';
 const headline=mode==='active'?severity==='critical'?'Kritische Renderer-Warnung':severity==='warning'?'Prüfpunkte erkannt':'Regie-Evidenz verfügbar':
  mode==='paused'?'Wiedergabe pausiert':mode==='disabled'?'Automatik derzeit inaktiv':'Keine bestätigte Regie-Evidenz';
 return {mode,headline,scene:scene?`${scene.section} · ${scene.motif} · ${scene.lens}`:null,
  sceneIndex:scene?.index??-1,...values,severity,lanes,findings:findings.slice(0,12),measured,unmeasured};
}
/** Download only an already evaluated snapshot; no silent background telemetry.
 * Never include Spotify identifiers, song titles or unverified visual scores. */
export function exportConcertQualityV901(report:QualityReportV901,settings:QualitySettingsV901):string {
 return JSON.stringify({schema:'sonic-concert-quality-intelligence-v901',version:1,
  type:'manual-diagnostic-snapshot',settings:normalizeQualitySettingsV901(settings),
  report,note:'Read-only renderer metrics and configuration checks. No visual recognition, inferred vocal identities or actual lyrics/pose quality measurement.'},null,2);
}
