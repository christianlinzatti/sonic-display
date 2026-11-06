'use client';
/** Read-only pre-cue overview. Existing V763 director remains sole authority. */
import {readEnergyV896} from './musicalEnergyIntelligenceV896';
import {getConcertTimelineV763} from './concertTimelineBridgeV763';
import {predictConcertV1019,type ShowChannelV1019,type ShowLookV1019,
 type PreparationPhaseV1019} from '@/lib/predictiveConcertDirectorV1019';

const channels:Record<ShowChannelV1019,string>={camera:'Kamera',stage:'Bühne',avatars:'Avatare',lights:'Licht'};
const looks:Record<ShowLookV1019,string>={
 'close-up':'Nahaufnahme','wide-shot':'Totale','stable-shot':'ruhige Einstellung',
 'soft-sweep':'sanfte Kamerafahrt',hold:'halten',minimal:'reduziert',cinematic:'filmisch',
 rising:'steigender Aufbau',arena:'Arena-Look','lead-groove':'Lead-Performance',
 ensemble:'Ensemble',rest:'zurückgenommen','soft-wash':'sanfte Farben',
 'build-wash':'Farbaufbau','low-light':'dezentes Licht',
};
const phaseLabel:Record<PreparationPhaseV1019,string>={
 unavailable:'Nicht verfügbar',standby:'Noch kein Vorbereitungspunkt',
 prepare:'Vorbereitung vorgesehen',imminent:'Nächster Abschnitt steht bevor',
};
const sections={verse:'Verse',hook:'Hook',build:'Build-up',drop:'Drop',break:'Break'};
const fmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
export function PredictiveConcertPanelV1019({trackId,durationMs,positionMs,playing,genre,
 enabled,manualOverride,reducedMotion,seekBlocked,blackout}: {
 trackId:string;durationMs:number;positionMs:number;playing:boolean;genre:string;
 enabled:boolean;manualOverride?:boolean;reducedMotion?:boolean;seekBlocked?:boolean;blackout?:boolean;
}){
 const plan=predictConcertV1019({trackId,durationMs,positionMs,playing,genre,enabled,
  manualOverride,reducedMotion,seekBlocked,blackout,
  audio:readEnergyV896(trackId,durationMs,positionMs),timeline:getConcertTimelineV763()});
 return <fieldset className="predictive-concert-v1019" aria-label="V1019 Predictive Concert Director"
  data-v1019-predictive-director data-v1019-phase={plan.phase}>
  <legend>V1019 · Predictive Concert Director</legend>
  <p><b>Vorausschauende Regie:</b> {phaseLabel[plan.phase]}</p>
  {plan.evidence==='verified-v604'&&plan.nextSection&&plan.nextStartMs!==null&&plan.etaMs!==null?
   <p><b>Bestätigter nächster Abschnitt:</b> {sections[plan.nextSection]} um {fmt(plan.nextStartMs)}
    {' '}· in {(plan.etaMs/1000).toFixed(1)} s</p>:
   <p><small>{!playing?'Wiedergabe pausiert':manualOverride?'Manueller Effekt hat Vorrang':
    seekBlocked?'Songposition wird überprüft':blackout?'Blackout hat Vorrang':
    !enabled?'Automatische Konzertregie ist deaktiviert':
    'Keine gültige bevorstehende Songpassage bestätigt'}</small></p>}
  {plan.preview.length>0&&<div className="predictive-concert-plan-v1019" aria-label="Vorbereitungsvorschau">
   {plan.preview.map(item=><span key={item.channel}><b>{channels[item.channel]}:</b> {looks[item.look]}{' · '}</span>)}
  </div>}
  <small>Nur eine Vorschau aus der verifizierten Song-Timeline; keine neuen Drops oder Beats geschätzt.
   {' '}Kein vorzeitiger Auslöser für Licht, Kamera, Avatare oder Bühneneffekte.
   {' '}{reducedMotion?'Bewegungsarme Vorschau aktiv. ':''}
   {plan.audioMeasured?'Aktuelle Live-Audiomessung verfügbar.':'Keine bestätigte Live-Audiomessung benötigt.'}</small>
 </fieldset>;
}
