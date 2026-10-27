'use client';
import {useAdaptivePerformance} from './adaptivePerformance';
import {usePiConcertBudgetV479} from './piConcertRuntimeV479';
import {clearStageSafetyV511,useStageSafetyV511} from './concertStageQualityRuntimeV511';
import {optionalBodySampleHzV511,stageSafetyStatusV511} from './concertStageQualityV511';
/** Diagnostics-tab-only view; there is no additional GLB/RAF sampler. */
export function ConcertStageQualityPanelV511(){
 const state=useStageSafetyV511(),quality=useAdaptivePerformance(),pi=usePiConcertBudgetV479();
 const {status,latest,details}=stageSafetyStatusV511(state,Date.now());
 const hz=optionalBodySampleHzV511(quality.tier,pi,latest?.avatars??1);
 const meaning={ 'no-data':'Keine aktuellen Daten',unverified:'Nicht prüfbar',partial:'Teilweise geprüft',close:'Kapseln nahe beieinander',measured:'Vereinfachte Kapseln geprüft'}[status];
 return <section className="concert-diagnostics-v480" aria-label="V511 Ensemble-Qualitätsdiagnose">
  <h4>V511 – Ensemble-Qualität & Pi-Abtastbudget</h4>
  <p className="settings-note">Die Anzeige beobachtet ausschließlich die bestehende V508-Kapselprüfung, höchstens einmal pro Sekunde. Keine neue Render-Schleife, keine Aufzeichnung auf Servern.</p>
  <p role="status" aria-live="polite"><strong>{meaning}</strong> – {details}</p>
  <div className="render-diagnostics-grid">
   <div><span>Geprüfte Avatar-Paare</span><strong>{latest?`${latest.checkedPairs} / ${latest.possiblePairs}`:'—'}</strong></div>
   <div><span>Sehr nahe Kapselpaare</span><strong>{latest?latest.nearPairs:'—'}</strong></div>
   <div><span>Maximaler Dämpfungs-Risikowert</span><strong>{latest?`${Math.round(latest.maxRisk*100)} %`:'—'}</strong></div>
   <div><span>GLB-Knochenabtastung, Obergrenze</span><strong>{hz?`${hz} Hz`:'Deaktiviert'}</strong></div>
  </div>
  <p className="settings-note">{latest?`Letzte ${latest.source==='duo'?'Duett-':'Gruppen-'}Messung: ${new Date(latest.at).toLocaleTimeString('de-AT')} · angenäherter Kapselabstand: ${latest.closestSurface===null?'nicht verfügbar':`${latest.closestSurface.toFixed(2)} Bühnen-Einheiten`}.`:'Nur bei aktiver GLB-Mehr-Avatar-Bühne verfügbar.'} Pi-Budget: {pi.enabled?pi.level:'aus'} · Grafikstufe: {quality.tier}.</p>
  {status==='close'&&<p className="settings-note">Hinweis: Zusätzliche automatische Gesten werden bereits durch V506/V508 gedämpft. Dies ist keine exakte Erkennung berührender Skinned Meshes.</p>}
  <p className="settings-note">Die Pi-Drosselung betrifft nur optionale V508-Knochenprüfungen bei drei bis vier Avataren. Sie verändert weder Lip-Sync, Fuß-IK, GLB-Clip-Timing noch manuelle Qualitätseinstellungen. Fehlende GLB-Knochen ergeben ausdrücklich „Nicht prüfbar“, nicht „kollisionsfrei“.</p>
  <button type="button" onClick={clearStageSafetyV511} disabled={!state.readings.length}>V511-Sitzungswerte löschen</button>
 </section>;
}
