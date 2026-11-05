/** V1003 – audited, deterministic improvements from V1002 evidence.
 * No AI-generated text is ever parsed as instructions or actions. No hardware,
 * timelines, song-time synthesis, account mutation, or effect activation.
 */
import type {ConcertQaReportV1002,ConcertQaFindingCodeV1002} from './concertQualityAssuranceV1002';
import {touchAllowedV1001,touchValuesEqualV1001,TOUCH_LANES_V1001,
 type TouchContextV1001,type TouchValuesV1001,type TouchLaneV1001,type TouchDiffV1001}
 from './interactiveConcertControlV1001';

export type AutoAdviceV1003=Readonly<{
 code:ConcertQaFindingCodeV1002;label:string;detail:string;automatable:boolean;
}>;
export type AutoEvidenceV1003=Readonly<{
 planTrackId:string;planAt:number;renderAt:number;now:number;progressMs:number;
}>;
export type AutoImprovementPreviewV1003=Readonly<{
 trackId:string;durationMs:number;createdAt:number;progressMs:number;
 before:TouchValuesV1001;after:TouchValuesV1001;
 diffs:readonly TouchDiffV1001[];advice:readonly AutoAdviceV1003[];
 triggerCodes:readonly ConcertQaFindingCodeV1002[];
}>;
export const AUTO_PREVIEW_TTL_V1003=20000;
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const safeValue=(n:number)=>Math.max(0,Math.min(100,Math.ceil(n/5)*5));
const note:Partial<Record<ConcertQaFindingCodeV1002,readonly [string,string]>>={
 'performance-slow':['Optionale Effekte begrenzen',
  'Bei gemessener niedriger FPS: bereits aktivierte Bühnen- und virtuelle Lichtintensität vorsichtig reduzieren und neu messen.'],
 'frame-variance':['Frame-Spitzen beruhigen',
  'Bei gemessener hoher P95-Framezeit: virtuelle Zusatzbeleuchtung und Bühne vorsichtig reduzieren.'],
 'coverage-gap':['Szenenplan prüfen',
  'Fehlende Zeitabschnitte im Storyboard manuell überprüfen. Keine Zeitmarken automatisch erzeugen.'],
 'camera-repetition':['Kamera-Intents abwechslungsreicher planen',
  'Im bestätigten Storyboard alternative Kamera-Intents prüfen. Globale Kameraregler ersetzen keine Szenenplanung.'],
 'camera-variety':['Kameravielfalt prüfen',
  'Im Storyboard mehrere bestätigte Perspektiven einplanen, ohne den Sängerfokus zu verlieren.'],
 'missing-break':['Ruhephase überprüfen',
  'Nur bei einem musikalisch tatsächlich passenden Break einen ruhigeren Abschnitt markieren.'],
 'lyrics-unverified':['Lyrics-Zeiten prüfen',
  'Den Lyrics-Provider oder manuelle Zeitmarken prüfen, keine Synchronität behaupten.'],
 'visual-projection':['WebGL-Warnungen prüfen',
  'V466-Projektionswarnungen in der aktiven Vorschau untersuchen; keine automatische Kamerakorrektur.'],
 'render-unavailable':['Performance zunächst messen',
  'Freiwillige WebGL-Messung starten, bevor Effektregler wegen Performance geändert werden.'],
 'missing-plan':['Songplanung zunächst prüfen',
  'Eine aktuelle bestätigte Timeline laden, bevor ein Umbau der Konzertregie vorgeschlagen wird.'],
};
const validValues=(s:TouchValuesV1001)=>TOUCH_LANES_V1001.every(k=>
  typeof s[k]?.enabled==='boolean'&&finite(s[k].intensity)&&
  s[k].intensity>=0&&s[k].intensity<=100);
const validEvidence=(r:ConcertQaReportV1002,c:TouchContextV1001,e:AutoEvidenceV1003)=>
 r.planAvailable&&e.planTrackId===c.trackId&&c.trackId.length>0&&
 finite(e.planAt)&&finite(e.now)&&e.planAt>0&&e.now>=e.planAt&&e.now-e.planAt<=6000&&
 finite(e.progressMs)&&e.progressMs>=0&&e.progressMs<=c.durationMs;

/** Propose only evidence-supported, bounded *reductions* to already-enabled virtual settings.
 * Plan-only findings remain advisory; they cannot invent cues or claim to fix a camera plan.
 */
export function planAutoImprovementV1003(report:ConcertQaReportV1002,before:TouchValuesV1001,
 c:TouchContextV1001,e:AutoEvidenceV1003):AutoImprovementPreviewV1003|null{
 if(!validValues(before)||!validEvidence(report,c,e))return null;
 const available=new Set(report.findings.map(f=>f.code));
 const advice:AutoAdviceV1003[]=[];
 for(const f of report.findings){
  const text=note[f.code];if(!text)continue;
  advice.push({code:f.code,label:text[0],detail:text[1],
   automatable:(f.code==='performance-slow'||f.code==='frame-variance')&&
    f.evidence==='runtime'&&report.runtimeAvailable});
 }
 const after=Object.fromEntries(TOUCH_LANES_V1001.map(k=>
  [k,{enabled:before[k].enabled,intensity:before[k].intensity}])) as
  Record<TouchLaneV1001,{enabled:boolean;intensity:number}>;
 const triggerCodes:ConcertQaFindingCodeV1002[]=[];
 const canPropose=touchAllowedV1001(c)&&report.runtimeAvailable&&
  finite(e.renderAt)&&e.renderAt>0&&e.now>=e.renderAt&&e.now-e.renderAt<=5000;
 if(canPropose){
  const slow=report.findings.some(f=>f.code==='performance-slow'&&f.evidence==='runtime');
  const variance=report.findings.some(f=>f.code==='frame-variance'&&f.evidence==='runtime');
  if(slow||variance){
   const stageDelta=slow?15:10,lightDelta=slow?10:5;
   if(after.stage.enabled)after.stage.intensity=safeValue(before.stage.intensity-stageDelta);
   if(after.lights.enabled)after.lights.intensity=safeValue(before.lights.intensity-lightDelta);
   if(slow)triggerCodes.push('performance-slow');
   if(variance)triggerCodes.push('frame-variance');
  }
 }
 const diffs:TouchDiffV1001[]=TOUCH_LANES_V1001.filter(k=>
  after[k].intensity!==before[k].intensity).map(k=>({lane:k,
  before:before[k].intensity,after:after[k].intensity}));
 return {trackId:c.trackId,durationMs:c.durationMs,createdAt:e.now,
  progressMs:e.progressMs,before,after,diffs,advice:advice.slice(0,8),triggerCodes};
}

/** Compare-and-swap before every apply, including the live evidence and seek window. */
export function canCommitAutoImprovementV1003(p:AutoImprovementPreviewV1003|null,
 current:TouchValuesV1001,c:TouchContextV1001,e:AutoEvidenceV1003,
 report:ConcertQaReportV1002):boolean{
 if(!p||p.diffs.length===0||!touchAllowedV1001(c)||
  p.trackId!==c.trackId||p.durationMs!==c.durationMs||
  !validEvidence(report,c,e)||!report.runtimeAvailable||!validValues(current)||
  !finite(e.now)||e.now<p.createdAt||e.now-p.createdAt>AUTO_PREVIEW_TTL_V1003||
  e.progressMs+1000<p.progressMs||e.progressMs-p.progressMs>25000||
  !touchValuesEqualV1001(p.before,current))return false;
 const expected=planAutoImprovementV1003(report,current,c,e);
 return !!expected&&touchValuesEqualV1001(expected.after,p.after)&&
  p.triggerCodes.length>0&&p.triggerCodes.some(code=>
   report.findings.some(f=>f.code===code&&f.evidence==='runtime'))&&
  p.diffs.every(d=>(d.lane==='stage'||d.lane==='lights')&&current[d.lane].enabled&&
   d.after>=0&&d.after<d.before&&d.before-d.after<=(d.lane==='stage'?15:10));
}
/** Undo may work after playback pauses, but never across a track/setting/manual change. */
export function canUndoAutoImprovementV1003(p:AutoImprovementPreviewV1003|null,
 current:TouchValuesV1001,c:TouchContextV1001):boolean{
 return !!p&&p.trackId===c.trackId&&p.durationMs===c.durationMs&&
  c.controlsReady&&!c.manual&&!c.seekBlocked&&validValues(current)&&
  touchValuesEqualV1001(p.after,current);
}
