/** V520 — explicit, reversible single-control *experiment*, never an automatic performance policy.
 * The current quality tier and DPR are one coupled quality-control change.
 * No setting is written here; this module only validates captures and transition safety. */
import type {PiStudioCaptureV518} from './piConcertPerformanceStudioV518';
import {planConcertOptimizationV519,compareOptimizationCapturesV519,
 validOptimizationCaptureV519,type ConcertTargetV519} from './concertOptimizationAdvisorV519';

export type V520Mode='auto'|'high'|'balanced'|'low';
export type V520PiProfile='off'|'auto'|'pi-low'|'pi-balanced';
export type V520Trial=Readonly<{
 version:520;previousMode:V520Mode;targetMode:'balanced'|'low';
 startedAt:number;baseline:PiStudioCaptureV518;
}>;
export type V520Proposal=Readonly<{allowed:boolean;targetMode:'balanced'|'low'|null;reason:string;
 changedControl:'Renderqualitaet'|null}>;
export type V520TrialResult=Readonly<{
 status:'ready'|'awaiting'|'invalid'|'interference';reason:string;
 changes:readonly string[];fpsDelta:number|null;p95DeltaMs:number|null;
 positiveObservation:boolean;candidate:PiStudioCaptureV518|null;
}>;
const validAt=(n:number)=>Number.isFinite(n)&&n>0&&n<Number.MAX_SAFE_INTEGER;
export function proposeConcertTuneV520(
  baseline:PiStudioCaptureV518|null|undefined,
  current:{mode:V520Mode;tier:'high'|'balanced'|'low'},
  piProfile:V520PiProfile,now:number,target:ConcertTargetV519=30,
  liveConfiguration:string|null
):V520Proposal{
 const deny=(reason:string):V520Proposal=>({allowed:false,targetMode:null,changedControl:null,reason});
 if(!validOptimizationCaptureV519(baseline)||!validAt(now)||now<baseline.at||now-baseline.at>180000)
  return deny('Erst eine aktuelle, gültige Referenzmessung (6–20 Fenster) übernehmen.');
 if(liveConfiguration===null||liveConfiguration!==baseline.configuration)
  return deny('Die aktuellen Messfenster stimmen nicht mehr mit der Referenz überein. Neu messen.');
 if(piProfile!=='off')return deny('Das Pi-Geräteprofil steuert die Qualität bereits. Für einen isolierten manuellen Test zuerst das Pi-Profil im vorhandenen Einstellungsbereich ausschalten.');
 if(current.mode==='auto')return deny('Die automatische Grafikqualität kann sich während des Tests ändern. Für diesen Test zuerst eine feste Grafikstufe im vorhandenen Einstellungsbereich wählen.');
 if(current.mode!==baseline.tier||current.tier!==baseline.tier)
  return deny('Aktiver Qualitätsmodus und Referenz unterscheiden sich. Eine neue Messung aufnehmen.');
 const advice=planConcertOptimizationV519(baseline,target);
 if(!advice.valid||advice.severity==='ok'||!advice.actions.some(a=>a.id==='quality'))
  return deny('Für diese Messung wurde keine Reduktion der Grafikqualität empfohlen.');
 if(baseline.tier==='low')return deny('Grafikqualität bereits Low. Keine weitere Absenkung verfügbar.');
 const targetMode=baseline.tier==='high'?'balanced':'low';
 return {allowed:true,targetMode,changedControl:'Renderqualitaet',
  reason:`Einzelner Bedienungsschritt: Grafikmodus ${current.mode} → ${targetMode}. Die DPR kann sich als direkte Folge mitändern. Lip-Sync, Lyrics, Licht, Avataranzahl und GLB-Motions bleiben unangetastet.`};
}
export function validV520Trial(value:unknown):value is V520Trial{
 if(!value||typeof value!=='object')return false;
 const v=value as Partial<V520Trial>;
 const startedAt=v.startedAt;
 return v.version===520&&typeof startedAt==='number'&&validAt(startedAt)&&
   (v.previousMode==='high'||v.previousMode==='balanced')&&
   (v.targetMode==='balanced'||v.targetMode==='low')&&
   ((v.previousMode==='high'&&v.targetMode==='balanced')||
   (v.previousMode==='balanced'&&v.targetMode==='low'))&&
   validOptimizationCaptureV519(v.baseline)&&v.baseline.tier===v.previousMode&&
   startedAt>=v.baseline.at&&startedAt-v.baseline.at<=180000;
}
/** Only follow-up captures *after* the explicit click, with the expected coupled tier/DPR change. */
export function assessConcertTrialV520(trial:V520Trial|null|undefined,
  candidates:readonly PiStudioCaptureV518[],mode:V520Mode,piProfile:V520PiProfile):V520TrialResult{
 const result=(status:V520TrialResult['status'],reason:string,
  candidate:PiStudioCaptureV518|null=null,changes:readonly string[]=[],fpsDelta:number|null=null,
  p95DeltaMs:number|null=null,positiveObservation=false):V520TrialResult=>({status,reason,candidate,changes,fpsDelta,p95DeltaMs,positiveObservation});
 if(!validV520Trial(trial))return result('invalid','Kein gültiger V520-Test aktiv.');
 if(mode!==trial.targetMode||piProfile!=='off')return result('interference',
   'Grafikmodus oder Pi-Profil wurde inzwischen außerhalb des Tests geändert. Nicht automatisch überschreiben.');
 const after=candidates.filter(c=>validOptimizationCaptureV519(c)&&c.at>trial.startedAt&&
   c.startAt>trial.startedAt+500);
 const b=after[after.length-1];
 if(!b)return result('awaiting','Neue Messung fehlt: nach dem Teststart mindestens sechs stabile Ein-Sekunden-Fenster übernehmen.');
 if(b.tier!==trial.targetMode)return result('interference',
  `Nachmessung meldet ${b.tier} statt der gewählten Qualitätsstufe ${trial.targetMode}. Keine Ergebnisfreigabe.`,b);
 const comparison=compareOptimizationCapturesV519(trial.baseline,b);
 const expected=comparison.changes.length>0&&comparison.changes.every(x=>x==='Grafikprofil'||x==='DPR')&&
  comparison.changes.includes('Grafikprofil');
 if(!expected)return result('interference',
  `Messungen unterscheiden sich in weiteren Einstellungen (${comparison.changes.join(', ')||'keine'}). Messung nicht als Qualitäts-Test werten.`,b,comparison.changes,
  comparison.fpsDelta,comparison.p95DeltaMs);
 return result('ready',
  'Nur der Qualitätsmodus samt möglicher DPR-Folge ist in den erfassten Einstellungen verändert. Unterschiede sind beobachtet, nicht kausal bewiesen.',
  b,comparison.changes,comparison.fpsDelta,comparison.p95DeltaMs,
  (comparison.fpsDelta??0)>0&&(comparison.p95DeltaMs??0)<0);
}
