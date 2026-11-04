/** V903 – evidence-only Before/After Review for explicitly confirmed V902 changes.
 * Uses existing V826 frame-window snapshots (not GPU timers or an FPS forecast).
 * No timers, autonomous writes, WebGL resources, network requests or persistence.
 * Performance comparison is observational; it does NOT establish causation.
 */
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
import type {QualityReportV901} from './concertQualityIntelligenceV901';
import type {AdvisorConfigV902,AdvisorPatchV902,AdvisorValueV902} from './concertQualityAdvisorV902';

export const MIN_REVIEW_FRAMES_V903=3;
export const REVIEW_SETTLE_FRAMES_V903=2;
export const REVIEW_FRESH_MS_V903=5500;
export const REVIEW_MAX_HISTORY_V903=10;
export type ReviewStateV903='awaiting-change'|'sampling'|'ready'|'unavailable'|'invalid'|'restoring'|'restored';
export type ReviewTierV903='low'|'balanced'|'high';
export interface ReviewContextV903 {
 /** Identifies the current song only in transient component state; never exported. */
 trackKey:string;sceneIndex:number;mode:QualityReportV901['mode'];playing:boolean;
}
export interface ReviewFrameV903 {
 capturedMs:number;trackKey:string;sceneIndex:number;targetFps:30|60;tier:ReviewTierV903;
 fps:number;frameMs:number;p95FrameMs:number;pressure:number;sampleCount:number;
}
export interface ReviewWindowV903 {
 samples:number;targetFps:30|60;tier:ReviewTierV903;
 fps:number;frameMs:number;p95FrameMs:number;pressure:number;
}
export interface ConcertReviewV903 {
 id:number;patch:AdvisorPatchV902;trackKey:string;sceneIndex:number;
 state:ReviewStateV903;reason:string;before:ReviewWindowV903|null;after:ReviewWindowV903|null;
 settled:number;awaited:number;collected:readonly ReviewFrameV903[];
}
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const validClock=(v:number)=>finite(v)&&v>=0&&v<=Number.MAX_SAFE_INTEGER;
const equal=(v:AdvisorValueV902|undefined,w:AdvisorValueV902)=>v===w;
export function reviewControlValueV903(cfg:AdvisorConfigV902,p:AdvisorPatchV902):AdvisorValueV902|undefined {
 const c=cfg[p.target];return c?.enabled?c[p.field]:undefined;
}
export function validReviewPatchV903(p:AdvisorPatchV902):boolean {
 if(!p||!(['ultimate','camera','dance','laser','particles','spotlights'] as string[]).includes(p.target))return false;
 if(!(['intensity','protectLyrics','protectFootwork'] as string[]).includes(p.field))return false;
 if(p.field==='intensity')return p.target!=='dance'&&typeof p.before==='number'&&Number.isInteger(p.before)&&p.before>=0&&p.before<=100&&
  typeof p.value==='number'&&Number.isInteger(p.value)&&p.value>=0&&p.value<p.before;
 return typeof p.before==='boolean'&&p.before===false&&p.value===true&&
  (p.field==='protectFootwork'?p.target==='dance':p.target==='camera'||p.target==='ultimate');
}
/** Reject invalid, disabled, paused and invented frames. V826 frame times are CPU/render-loop intervals, not GPU timings. */
export function reviewFrameV903(r:ConcertQualitySnapshotV826|null|undefined,c:ReviewContextV903,nowMs:number):ReviewFrameV903|null {
 if(!r||!r.available||!r.playing||!c.playing||c.mode!=='active'||!c.trackKey||c.sceneIndex<0||!validClock(nowMs)||
  (r.targetFps!==30&&r.targetFps!==60)||!(['low','balanced','high'] as string[]).includes(r.performanceTier)||
  !finite(r.fps)||r.fps<=0||r.fps>500||!finite(r.frameMs)||r.frameMs<=0||r.frameMs>250||
  !finite(r.p95FrameMs)||r.p95FrameMs<0||r.p95FrameMs>250||!finite(r.pressure)||r.pressure<0||r.pressure>1||
  !Number.isInteger(r.sampleCount)||r.sampleCount<3)return null;
 return {capturedMs:nowMs,trackKey:c.trackKey,sceneIndex:c.sceneIndex,targetFps:r.targetFps,tier:r.performanceTier,
  fps:r.fps,frameMs:r.frameMs,p95FrameMs:r.p95FrameMs,pressure:r.pressure,sampleCount:r.sampleCount};
}
export function reviewWindowV903(frames:readonly ReviewFrameV903[]):ReviewWindowV903|null {
 if(frames.length<MIN_REVIEW_FRAMES_V903)return null;
 const last=frames[frames.length-1];
 if(frames.some((f,i)=>i>0&&f.capturedMs<=frames[i-1].capturedMs)||
  frames.some(f=>f.targetFps!==last.targetFps||f.tier!==last.tier||f.sceneIndex!==last.sceneIndex||f.trackKey!==last.trackKey||
  !validClock(f.capturedMs)||!finite(f.fps)||!finite(f.frameMs)||!finite(f.p95FrameMs)||!finite(f.pressure)))return null;
 const avg=(field:'fps'|'frameMs'|'p95FrameMs'|'pressure')=>frames.reduce((sum,f)=>sum+f[field],0)/frames.length;
 return {samples:frames.length,targetFps:last.targetFps,tier:last.tier,
  fps:avg('fps'),frameMs:avg('frameMs'),p95FrameMs:avg('p95FrameMs'),pressure:avg('pressure')};
}
/** Baseline only from 3+ distinct, fresh V826 publications in this scene. */
export function beginConcertReviewV903(history:readonly ReviewFrameV903[],c:ReviewContextV903,
 p:AdvisorPatchV902,cfg:AdvisorConfigV902,nowMs:number,id:number):ConcertReviewV903|null {
 if(!validReviewPatchV903(p)||!equal(reviewControlValueV903(cfg,p),p.before)||!c.trackKey||c.mode!=='active'||!c.playing||c.sceneIndex<0||
  !validClock(nowMs)||!Number.isInteger(id)||id<=0)return null;
 const available=history.filter(f=>f.trackKey===c.trackKey&&f.sceneIndex===c.sceneIndex&&
  f.capturedMs<=nowMs&&nowMs-f.capturedMs<=REVIEW_FRESH_MS_V903).slice(-REVIEW_MAX_HISTORY_V903);
 const baseline=reviewWindowV903(available.slice(-Math.max(MIN_REVIEW_FRAMES_V903,4)));
 return {id,patch:{...p},trackKey:c.trackKey,sceneIndex:c.sceneIndex,state:'awaiting-change',
  reason:baseline?'Warte auf bestätigte Einstellungsübernahme.':'Keine drei frischen, vergleichbaren V826-Messfenster vor der Änderung.',
  before:baseline,after:null,settled:0,awaited:0,collected:[]};
}
const invalid=(s:ConcertReviewV903,reason:string):ConcertReviewV903=>({...s,state:'invalid',reason,collected:[]});
const matchingScene=(s:ConcertReviewV903,c:ReviewContextV903)=>c.mode==='active'&&c.playing&&c.trackKey===s.trackKey&&c.sceneIndex===s.sceneIndex;
/** Seeking within even the same scene invalidates before/after comparability. */
export function invalidateConcertReviewV903(s:ConcertReviewV903|null,why:string):ConcertReviewV903|null {
 if(!s||s.state==='restoring'||s.state==='restored'||s.state==='invalid')return s;
 return invalid(s,why);
}

/** Called after React has committed the actual setting, never on button preview. */
export function syncConcertReviewV903(s:ConcertReviewV903|null,c:ReviewContextV903,cfg:AdvisorConfigV902):ConcertReviewV903|null {
 if(!s||s.state==='restored'||s.state==='restoring'||s.state==='invalid'||s.state==='unavailable')return s;
 if(!matchingScene(s,c))return invalid(s,'Songabschnitt, Wiedergabe oder Regie wurde verändert. Kein gültiger Performancevergleich.');
 const v=reviewControlValueV903(cfg,s.patch);
 if(s.state==='awaiting-change'){
  if(v===s.patch.before)return s;
  if(v!==s.patch.value)return invalid(s,'Einstellung wurde anderweitig verändert; V902-Übernahme nicht bestätigt.');
  if(!s.before)return {...s,state:'unavailable',reason:'Vor der Änderung fehlten mindestens drei aktuelle Messfenster. FPS-Vergleich nicht verfügbar.'};
  return {...s,state:'sampling',reason:'Neue Live-Frames sammeln: die ersten zwei V826-Fenster werden verworfen.',settled:0,awaited:0,collected:[]};
 }
 if(v!==s.patch.value)return invalid(s,'Optimierte Einstellung wurde geändert. Vergleich nicht mehr zuordenbar.');
 return s;
}
/** Called only on genuinely NEW V826 snapshots (never on React re-render with the same snapshot). */
export function advanceConcertReviewV903(s:ConcertReviewV903|null,c:ReviewContextV903,cfg:AdvisorConfigV902,
 frame:ReviewFrameV903|null):ConcertReviewV903|null {
 const current=syncConcertReviewV903(s,c,cfg);
 if(!current)return current;
 if(current.state==='awaiting-change'&&frame){
  if(current.awaited>=5)return invalid(current,'Übernahme wurde in sechs neuen Messfenstern nicht bestätigt. Keine Optimierung behauptet.');
  return {...current,awaited:current.awaited+1};
 }
 if(current.state!=='sampling')return current;
 if(!frame)return invalid(current,'Die neue V826-Telemetrie enthält keine gültigen laufenden Messfenster mehr.');
 if(frame.trackKey!==current.trackKey||frame.sceneIndex!==current.sceneIndex)return invalid(current,'Neuer Songabschnitt während der Nachmessung.');
 if(frame.targetFps!==current.before!.targetFps||frame.tier!==current.before!.tier)
  return invalid(current,'FPS-Ziel oder Performance-Profil hat sich geändert.');
 if(current.settled<REVIEW_SETTLE_FRAMES_V903)return {...current,settled:current.settled+1};
 const samples=[...current.collected,frame];
 const after=reviewWindowV903(samples);
 return after?{...current,state:'ready',after,collected:samples,reason:'Beobachtungswerte vorhanden; andere Lastfaktoren können die Unterschiede erklären.'}:
  {...current,collected:samples,reason:`Nachmessung ${samples.length}/${MIN_REVIEW_FRAMES_V903} Fenster; kein Ergebnis vor ausreichender Evidenz.`};
}
/** Explicit rollback is only offered if the exact applied value still exists. */
export function canRestoreConcertReviewV903(s:ConcertReviewV903|null,cfg:AdvisorConfigV902):boolean {
 return !!s&&s.state!=='restored'&&s.state!=='restoring'&&s.state!=='awaiting-change'&&
  validReviewPatchV903(s.patch)&&reviewControlValueV903(cfg,s.patch)===s.patch.value;
}
export function restorePatchV903(s:ConcertReviewV903|null,cfg:AdvisorConfigV902):AdvisorPatchV902|null {
 return canRestoreConcertReviewV903(s,cfg)?{target:s!.patch.target,field:s!.patch.field,
  before:s!.patch.value,value:s!.patch.before}:null;
}
export function markReviewRestoringV903(s:ConcertReviewV903|null,cfg:AdvisorConfigV902):ConcertReviewV903|null {
 return canRestoreConcertReviewV903(s,cfg)?{...s!,state:'restoring',reason:'Zurücksetzen angefordert; prüfe aktuellen Einstellungswert.'}:s;
}
export function completeReviewRestoreV903(s:ConcertReviewV903|null,cfg:AdvisorConfigV902):ConcertReviewV903|null {
 if(!s||s.state!=='restoring')return s;
 if(reviewControlValueV903(cfg,s.patch)===s.patch.before)return {...s,state:'restored',reason:'Ursprünglicher Wert wiederhergestellt; Nachmessung bleibt rein historisch.'};
 if(reviewControlValueV903(cfg,s.patch)!==s.patch.value)return invalid(s,'Rücksetzen konnte wegen einer parallelen Einstellungsänderung nicht bestätigt werden.');
 return s;
}
export function reviewDeltaV903(s:ConcertReviewV903|null):{fps:number;frameMs:number;p95FrameMs:number;pressure:number}|null {
 if(!s||!s.before||!s.after||!(['ready','restoring','restored'] as string[]).includes(s.state))return null;
 return {fps:s.after.fps-s.before.fps,frameMs:s.after.frameMs-s.before.frameMs,
  p95FrameMs:s.after.p95FrameMs-s.before.p95FrameMs,pressure:s.after.pressure-s.before.pressure};
}
export function exportConcertReviewV903(s:ConcertReviewV903):string {
 const {trackKey:unusedKey,...rest}=s;
 return JSON.stringify({schema:'sonic-concert-quality-review-v903',version:1,type:'observational-before-after',
  review:{id:rest.id,state:rest.state,reason:rest.reason,sceneIndex:rest.sceneIndex,patch:rest.patch,
   before:rest.before,after:rest.after,delta:reviewDeltaV903(s)},
  caveat:'V826 frame intervals are renderer-wide, not GPU timings. Samples are distinct live windows. Comparisons are observational, not proof the change caused a performance improvement. No song identifier is exported.'},null,2);
}
