'use client';
import {useEffect,useRef,useState} from 'react';
import {useConcertQualityV466} from './concertQualityStoreV466';
import {appendConcertVisualV836,inspectConcertVisualV836,
 type VisualReviewV836} from './concertVisualQualityV836';
import type {VisualProbeSnapshotV754} from './visualQualityInspectorV754';
import {V751_OPEN_RENDER_QA_EVENT} from './concertDashboardStoreV751';

const titles={clear:'Geometrisch unauffällig',risk:'Prüfhinweis',unverified:'Nicht nachgewiesen'};
export function ConcertVisualQualityInspectorV836(){
 const probe=useConcertQualityV466();
 const last=useRef<VisualProbeSnapshotV754|null>(null);
 const [review,setReview]=useState<VisualReviewV836|null>(null);
 const [history,setHistory]=useState<readonly VisualReviewV836[]>([]);
 const [now,setNow]=useState(0);
 useEffect(()=>{setNow(Date.now());const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer);},[]);
 useEffect(()=>{
  const next=inspectConcertVisualV836(probe,Date.now(),last.current);
  if(next.status==='no-probe') {last.current=null;setReview(null);return;}
  if(last.current&&probe.at<=last.current.at)return;
  setReview(next);
  setHistory(previous=>appendConcertVisualV836(previous,next));
  last.current=probe;
 },[probe]);
 const fresh=review&&now>=review.at&&now-review.at<=5000;
 const risks=history.reduce((sum,item)=>sum+item.risks,0);
 return <section className="v751-measurements" data-v836-inspector aria-label="V836 Concert Visual Quality Inspector 2.0">
  <h3>V836 · Concert Visual Quality Inspector 2.0</h3>
  <p>Automatische geometrische Hinweise aus der freiwilligen WebGL-Probe. Der Inspector verändert weder Kamera, Lyrics, Licht noch Animation.</p>
  {!fresh?<div role="status">Keine aktuelle Live-Projektion. Starte die WebGL-Qualitätsmessung auf der Bühne.</div>:
   <>
    <div className="v751-summary">
     <div><small>Prüffelder</small><strong>{review.evidenceCount}/5 mit Projektion</strong></div>
     <div><small>Prüfhinweise</small><strong>{review.risks}</strong></div>
     <div><small>Nicht nachweisbar</small><strong>{review.unverified}</strong></div>
     <div><small>Live-Messfenster</small><strong>{history.length}/{24}</strong></div>
    </div>
    <ul>{review.checks.map(item=><li key={item.id} data-v836-check={item.id} data-v836-status={item.status}>
      <strong>{item.title}: {titles[item.status]}.</strong> {item.detail}
    </li>)}</ul>
   </>}
  <small>Verlauf im Arbeitsspeicher: {history.length} Fenster, {risks} geometrische Prüfhinweise. Nicht nachweisbar ist niemals bestanden.</small>
  <div><button type="button" onClick={()=>window.dispatchEvent(new Event(V751_OPEN_RENDER_QA_EVENT))}>
   WebGL-Qualitätsmessung öffnen</button>{' '}
   <button type="button" disabled={!history.length} onClick={()=>{setHistory([]);last.current=null;setReview(null);}}>Prüfverlauf leeren</button></div>
  <small>Kein Pixel-Reading, keine Verdeckungs-, Kontrast-, Gesichts- oder Lippenanalyse. Positionssprünge können beabsichtigte Kameraschnitte sein. Für die Produktionsfreigabe sind die V829/V830-Abnahme und ein visueller Review weiterhin erforderlich.</small>
 </section>;
}
