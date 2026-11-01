"use client";
import type {ConcertQualitySnapshotV466} from './concertQualityStoreV466';
import {inspectLiveConcertQualityV692,type V692Check,type V692Inspection} from './concertQualityInspectorV692';
const statusLabel:Record<V692Check['status'],string>={review:'Gezielt prüfen',observed:'Messung vorhanden',manual:'Sichtprüfung nötig',insufficient:'Daten fehlen'};
const sourceLabel:Record<V692Check['evidence'],string>={
 'browser-measurement':'Browser-Messwerte','geometric-projection':'Geometrische Prüfung',
 'director-metadata':'Regie-Metadaten','none':'Kein direkter Messnachweis'
};
const timeLabel=(ms:number|null)=>ms===null?null:`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
export function ConcertQualityInspectionResultsV692({result}:{result:V692Inspection}){
 return <section className="v692-quality-results" data-v692-quality-mode={result.mode} aria-label="V692 Konzertqualität nach Evidenz">
  <strong>V692 · Konzertqualitäts-Inspektor</strong>
  <p>{result.mode==='live'?'Live-Momentaufnahme':'Lokale Vollsong-Aufzeichnung'} · {result.sampleCount} Probe(n){result.coveragePercent!==null?` · ${result.coveragePercent.toFixed(1)} % Abdeckung`:''}</p>
  <ul>{result.checks.map(c=><li key={c.id} data-v692-domain={c.id} data-v692-status={c.status}>
    <b>{c.title} · {statusLabel[c.status]}</b> <small>({sourceLabel[c.evidence]})</small>
    <div>{c.detail}{c.atMs!==null?<span> · Zeitmarke {timeLabel(c.atMs)}</span>:null}</div>
    <div><b>Nächster Schritt:</b> {c.action}</div>
  </li>)}</ul>
  <p>Keine automatische Bewertung von Tanzstil, echtem Gesichtslicht, Wortverständlichkeit oder GPU-Last. Keine Freigabe und keine automatischen Änderungen.</p>
 </section>;
}
export function LiveConcertQualityInspectorV692({live}:{live:ConcertQualitySnapshotV466}){
 const report=inspectLiveConcertQualityV692({at:live.at,now:Date.now(),fps:live.fps,p95FrameMs:live.p95FrameMs,assessment:live.assessment});
 return <ConcertQualityInspectionResultsV692 result={report}/>;
}
