'use client';
import {useConcertReview} from './concertReviewStore';
export function ConcertShowReview(){
 const review=useConcertReview();
 return <details className="concert-show-review" aria-label="Show-Check"><summary>Show-Check · Live-Messung</summary>
  {review?<div data-review-source={review.source} data-review-coverage={review.coverage.toFixed(3)} data-review-samples={review.samples} data-review-camera-ms={review.cameraMs} data-review-crew-ms={review.crewMs} data-review-lyric-ms={review.lyricMs}>
   <p>{review.fullSong?'Ganzer Song erfasst':'Ausschnitt erfasst'} · {Math.round(review.observedMs/1000)} Sekunden · {Math.round(review.coverage*100)} % des Songs.</p>
   <p>Beobachtet: Kamera {Math.round(review.cameraMs/1000)} s · Lyrics {Math.round(review.lyricMs/1000)} s · Tänze {Math.round(review.crewMs/1000)} s.</p>
   {review.warnings.length?<ul>{review.warnings.map(warning=><li key={warning}>{warning}</li>)}</ul>:<p>{review.samples?'Keine Auffälligkeit in den erfassten Daten.':'Die Messung beginnt bei laufender Wiedergabe.'}</p>}
   <p>Fehlende Messdaten gelten nicht als bestandene Prüfung. Beim Songwechsel beginnt eine neue Messung.</p>
  </div>:<p>Aktiviere eine intelligente Konzertshow mit AI-Show-Planung. Die Messung erfasst laufende Wiedergabe und bleibt nur für den aktuellen Song im Arbeitsspeicher.</p>}
 </details>;
}
