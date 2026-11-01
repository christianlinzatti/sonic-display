'use client';
import {useEffect,useState} from 'react';
import {useConcertQualityV466} from './concertQualityStoreV466';
import {V751_OPEN_RENDER_QA_EVENT} from './concertDashboardStoreV751';
import {appendVisualQualityV754,assessVisualQualityV754,summarizeVisualQualityV754,
 type VisualQualityReportV754} from './visualQualityInspectorV754';

const badge={ok:'Keine geometrischen Auffälligkeiten',attention:'Hinweise prüfen',
 critical:'Bildproblem erkannt',unavailable:'Keine aktuelle Messung'};
export function VisualConcertInspectorPanelV754(){
 const probe=useConcertQualityV466();
 const [history,setHistory]=useState<readonly VisualQualityReportV754[]>([]);
 const [now,setNow]=useState(0);
 useEffect(()=>{setNow(Date.now());const timer=window.setInterval(()=>setNow(Date.now()),1000);
  return()=>window.clearInterval(timer);},[]);
 useEffect(()=>{
  const report=assessVisualQualityV754(probe,Date.now());
  if(report.status!=='unavailable')setHistory(previous=>appendVisualQualityV754(previous,report));
 },[probe]);
 const report=assessVisualQualityV754(probe,now||Date.now());
 const summary=summarizeVisualQualityV754(history);
 return <section className="v751-measurements v754-inspector" aria-label="V754 Visual Concert Quality Inspector" data-v754-inspector>
  <h3>V754 · Visual Concert Quality Inspector</h3>
  <p>Geometrische Prüfung aus der echten, freiwilligen WebGL-Probe. Keine Bildpixel-Analyse, keine automatische Änderung an Kamera, Licht, Tanz oder Lyrics.</p>
  <div className="v754-status" role="status" data-v754-status={report.status}>
   <strong>{badge[report.status]}</strong><small>{report.reason}</small>
  </div>
  <div className="v751-summary">
   <div><small>Geladene Performer</small><strong>{report.status==='unavailable'?'–':report.examined}</strong></div>
   <div><small>Mit Kopf-/Fußknochen geprüft</small><strong>{report.status==='unavailable'?'–':`${report.verifiedBodies}/${report.examined}`}</strong></div>
   <div><small>Aktive Lyrics im Bühnenbild</small><strong>{report.status==='unavailable'?'–':report.lyricsApplicable?'Ja':'Nicht erfasst'}</strong></div>
   <div><small>Licht-/Bildkontrast</small><strong>Nicht gemessen</strong></div>
  </div>
  <button type="button" onClick={()=>window.dispatchEvent(new Event(V751_OPEN_RENDER_QA_EVENT))}>
   WebGL-Qualitätsmessung auf der Bühne öffnen
  </button>
  {report.status!=='unavailable'&&<>
   {report.findings.length?<ul className="v754-findings">{report.findings.map(f=><li key={f.code} data-v754-severity={f.severity}>
    <strong>{f.severity==='critical'?'Bildgrenze':'Hinweis'}:</strong> {f.message}
   </li>)}</ul>:<p>Keine geometrischen Auffälligkeiten in diesem Messfenster. Nicht erfasste Bereiche gelten nicht als fehlerfrei.</p>}
   {report.missingBodyEvidence>0&&<small>Bei {report.missingBodyEvidence} Avatar(en) fehlen eindeutig erkannte Kopf- oder Fußknochen. Vollständige Körper-Sichtbarkeit ist dort nicht überprüfbar.</small>}
  </>}
  <div className="v754-history">
   <strong>Letzte Qualitätsfenster (maximal 30, nur im Arbeitsspeicher)</strong>
   <p>{summary.samples} Fenster · {summary.counts.critical} mit Bildproblem · {summary.counts.attention} mit Hinweisen · {summary.counts.ok} ohne erkannte Auffälligkeit</p>
   <small>Kamera: {summary.kinds.camera} · Körper: {summary.kinds.body} · Lyrics-Rand: {summary.kinds.lyrics} · möglicher Lyrics-/Avatar-Konflikt: {summary.kinds.overlap}</small>
   <button type="button" disabled={history.length===0} onClick={()=>setHistory([])}>Verlauf leeren</button>
  </div>
  <small>Ein projizierter Knochen außerhalb des Canvas ist ein geometrischer Hinweis, keine Pixel-Sichtbarkeitsmessung. Überlagerungen sind nur DOM-Rechteck-/Knochen-Projektionen; Hintergrundkontrast, Schatten, Nebel, echte Verdeckung durch 3D-Objekte und subjektive Lichtqualität werden ausdrücklich nicht beurteilt. Die Historie erfasst nur Messfenster, während diese Ansicht geöffnet ist, und wird nicht dauerhaft gespeichert.</small>
 </section>;
}
