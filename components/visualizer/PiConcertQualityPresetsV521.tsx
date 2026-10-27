'use client';
import {CONCERT_PRESETS_V521,previewConcertPresetV521,compareConcertPresetEvidenceV521,
 type ConcertPresetIdV521} from '@/services/monitoring/concertQualityPresetsV521';
import type {V520Proposal,V520Mode} from '@/services/monitoring/concertAutoTuningV520';
import type {PiStudioCaptureV518} from '@/services/monitoring/piConcertPerformanceStudioV518';
const number=(n:number|null)=>n===null||!Number.isFinite(n)?'—':n.toFixed(1);
/** Pure preview of suggested profiles. Selection never changes show settings. */
export function PiConcertQualityPresetsV521({selected,onSelect,quality,proposal,captures,trialActive}:{
 selected:ConcertPresetIdV521;onSelect:(id:ConcertPresetIdV521)=>void;
 quality:{mode:V520Mode;tier:'high'|'balanced'|'low'};proposal:V520Proposal;
 captures:readonly PiStudioCaptureV518[];trialActive:boolean;
}){
 const p=previewConcertPresetV521(selected,quality,proposal,captures);
 const reference=previewConcertPresetV521('cinematic',quality,proposal,captures);
 const measuredComparison=compareConcertPresetEvidenceV521(reference.preset,p.preset,captures);
 return <div className="settings-note" aria-label="V521 Smart Concert Quality Presets">
  <h5>V521 – Smart Concert Quality Presets &amp; Benchmark Comparison</h5>
  <p>Wähle eine <strong>unverbindliche Vorschau</strong>. Die Profile sind Empfehlungen – keine neuen automatischen Qualitätsregeln oder vorhergesagte FPS. Nur eine passende, ausdrücklich gestartete V520-Grafikänderung ist rücknehmbar testbar.</p>
  <label>Konzertprofil <select aria-label="Konzertprofil für V521 auswählen" value={selected} disabled={trialActive}
   onChange={e=>onSelect(e.target.value as ConcertPresetIdV521)}>
   {CONCERT_PRESETS_V521.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
  </select></label>
  <div className="render-diagnostics-grid">
   {CONCERT_PRESETS_V521.map(item=>{
    const observed=previewConcertPresetV521(item.id,quality,proposal,captures);
    return <div key={item.id}>
     <strong>{item.name}{item.id===selected?' · ausgewählt':''}</strong>
     <p>Grafik: {item.quality} · Show-Empfehlung: {item.suggestedAvatars} Tänzer</p>
     <p>{item.purpose}</p>
     <small>{observed.measured&&observed.captured?
      `Echt gemessen: ${number(observed.captured.avgFps)} FPS · schlechtestes P95-Fenster ${number(observed.captured.worstWindowP95Ms)} ms · ${observed.captured.count} Messfenster`:
      'Keine passende echte Messung; keine geschätzten FPS'}</small>
    </div>;
   })}
  </div>
  <p><strong>Vorschau:</strong> {p.qualityChange}. Licht: {p.preset.reactiveLighting==='recommended'?'reaktiv empfohlen':'reaktiv optional'}; Lyrics und Lip-Sync bleiben an. Empfohlene Avatarzahl und Lichteinstellungen werden durch den Test <strong>nicht</strong> geschrieben.</p>
  <p role="status">{trialActive?'V520-Test läuft – erst abschließen oder zurücknehmen.':p.reason}</p>
  {selected!=='cinematic'&&<p><strong>Gegenüber Bildqualität:</strong> {measuredComparison.status==='observed'?
    `Gemessen Δ FPS ${number(measuredComparison.fpsDelta)} · Δ Fenster-P95 ${number(measuredComparison.p95DeltaMs)} ms · Unterschiede: ${measuredComparison.changes.join(', ')||'keine'}.`:
    'Noch kein echter Profilvergleich.'} {measuredComparison.description}</p>}
  <p>Für belastbare Vergleiche denselben Abschnitt mit vergleichbarer Szene, Avataranzahl und Gerätetemperatur wiederholen. GPU-Zeit, Temperatur und Pi-Gesamtspeicher bleiben unbekannt.</p>
 </div>;
}
