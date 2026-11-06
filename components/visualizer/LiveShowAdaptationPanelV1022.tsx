'use client';
/** V1022 read-only live adaptation preview; does not write to the stage or hardware. */
import {useSyncExternalStore} from 'react';
import {readEnergyV896} from './musicalEnergyIntelligenceV896';
import {getConcertTimelineV763} from './concertTimelineBridgeV763';
import {getConcertQualityV826,subscribeConcertQualityV826,
 EMPTY_QUALITY_SNAPSHOT_V826} from './concertQualityTelemetryV826';
import {adaptLiveShowV1022} from '@/lib/aiLiveShowAdaptationV1022';

export function LiveShowAdaptationPanelV1022({trackId,durationMs,positionMs,playing,genre,
 enabled,manualOverride,seekBlocked,blackout,reducedMotion,lyricsProtected}: {
 trackId:string;durationMs:number;positionMs:number;playing:boolean;genre:string;
 enabled:boolean;manualOverride?:boolean;seekBlocked?:boolean;blackout?:boolean;
 reducedMotion?:boolean;lyricsProtected?:boolean;
}) {
 const renderer=useSyncExternalStore(subscribeConcertQualityV826,
  getConcertQualityV826,()=>EMPTY_QUALITY_SNAPSHOT_V826);
 const plan=adaptLiveShowV1022({trackId,durationMs,positionMs,playing,genre,
  enabled,manualOverride,seekBlocked,blackout,reducedMotion,lyricsProtected,
  audio:readEnergyV896(trackId,durationMs,positionMs),
  timeline:getConcertTimelineV763(),renderer});
 const labels={unavailable:'Keine sichere Anpassung',baseline:'Genre-Grundplanung',
  adapted:'Audio-adaptierte Vorschau','performance-limited':'Performance-schonende Vorschau'};
 const quality={unmeasured:'Nicht gemessen',healthy:'Unauffällig',
  strained:'Erhöhte Framebelastung',critical:'Kritische Framebelastung'};
 return <fieldset aria-label="V1022 AI Live Show Adaptation" data-v1022-live-adaptation
  data-v1022-status={plan.status}>
  <legend>V1022 · AI Live Show Adaptation</legend>
  <p><b>{labels[plan.status]}</b>{plan.suggestedIntensity===null?'':
   ` · vorgeschlagene Intensität ${Math.round(plan.suggestedIntensity*100)}%`}</p>
  {plan.suggestedIntensity===null?
   <p><small>Keine bestätigte, freigegebene Songphase. Pause, Seek, manuelle Regie und Blackout bleiben maßgeblich.</small></p>:
   <p><small>Ausgangsplanung: {Math.round((plan.baselineIntensity??0)*100)}% ·
    {' '}FX-Dichte: {plan.fxDensity} · Bühnenlook: {plan.look?.stage} ·
    {' '}Kamera: {plan.look?.camera}.</small></p>}
  <p><small>Audio: {plan.audioEvidence==='measured-v896'?'Aktuelle Messwerte':'Keine aktuelle Messung'} ·
   {' '}Renderer: {quality[plan.performanceBudget]}. Die Angaben sind Vorschläge, keine ausgeführten Aktionen.</small></p>
  <p><small>{plan.explanations.join(' ')}</small></p>
  <small>Nur Vorschau aus verifizierter Timeline und vorhandenen Messungen. Keine zusätzlichen Anfragen,
   keine automatischen Kamera-, FX-, Avatar- oder Govee-Kommandos.
   Manuelle Steuerung, Blackout, Lyrics und Bewegungsreduktion haben Vorrang.</small>
 </fieldset>;
}
