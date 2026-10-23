"use client";
import {recommendConcertQualityV467} from '@/services/show/concertQualityAdvisorV467';
import type {ConcertQualityObservationV467} from '@/services/show/concertQualityAdvisorV467';

/** Read-only advice derived from an already open V466 QA session. */
export function ConcertQualityAdvisorV467({history,now}:{history:readonly ConcertQualityObservationV467[];now:number}){
 const result=recommendConcertQualityV467(history,now);
 return <section className="v467-advisor" aria-label="Show-Qualitätsberatung">
   <strong>V467 · Qualitäts-Tipps</strong>
   {result.status==='waiting'&&<p>Für zuverlässige Hinweise werden drei aufeinanderfolgende Live-Proben gesammelt ({result.sampleCount}/3).</p>}
   {result.status==='stale'&&<p>Keine aktuellen Daten. Diagnose bei laufender 3D-Bühne erneut öffnen.</p>}
   {result.status==='ready'&&!result.advice.length&&<p>Keine anhaltenden Auffälligkeiten in den letzten drei Proben. Das bestätigt nicht die optische Sichtbarkeit der Gesichter.</p>}
   {result.status==='ready'&&result.advice.length>0&&<ol>{result.advice.map(tip=><li key={tip.id} className={`v467-advice-${tip.severity}`}>
     <b>{tip.title}</b>
     <span>{tip.detail}</span>
     <span><b>Vorschlag:</b> {tip.suggestion}</span>
     <small>{tip.evidence==='fps-measured'?'Quelle: gemessene FPS':tip.evidence==='head-estimated'?'Quelle: DOM + geschätzter Kopfpunkt':tip.evidence==='dom-projected'?'Quelle: DOM + projizierter Kopfpunkt':tip.evidence==='head-projected'?'Quelle: Kameraprojektion':'Quelle: QA-Probenstatus'}</small>
   </li>)}</ol>}
   <p className="v467-advisor-footnote">Nur lokale Hinweise · keine automatischen Änderungen oder Speicherung.</p>
 </section>;
}
