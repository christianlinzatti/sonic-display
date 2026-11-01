'use client';
import {useMemo} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {compareLastFmMonthsV717,lastFmMilestonesV717,type V717Month} from '@/lib/lastfm-milestones-v717';
import {moveMonthV716} from '@/lib/lastfm-history-calendar-v716';

type Props={events:readonly LastFmEventV706[];month:string;onSelectDay:(day:string)=>void;
 onSelectMonth:(month:string)=>void;onFindSong:(song:{day:string;artist:string;title:string})=>void};
const number=(n:number)=>n.toLocaleString('de-AT');
const day=(key:string)=>new Date(`${key}T12:00:00`).toLocaleDateString('de-AT',{day:'numeric',month:'short',year:'numeric'});
const monthLabel=(key:string)=>new Date(`${key}-15T12:00:00`).toLocaleDateString('de-AT',{month:'long',year:'numeric'});
const diff=(n:number)=>n>0?`+${number(n)}`:number(n);
const rows:{field:keyof Pick<V717Month,'plays'|'artists'|'songs'|'activeDays'>;label:string}[]=[
 {field:'plays',label:'Scrobbles'},{field:'artists',label:'Künstler'},{field:'songs',label:'Songs'},{field:'activeDays',label:'Aktive Tage'}
];

export function LastFmMilestonesPanelV717({events,month,onSelectDay,onSelectMonth,onFindSong}:Props){
 const book=useMemo(()=>lastFmMilestonesV717(events),[events]);
 const current=useMemo(()=>compareLastFmMonthsV717(book,month),[book,month]);
 const previous=moveMonthV716(month,-1);
 return <section className="lastfm-milestones-v717" aria-label="Hörrekorde und Monatsvergleich">
  <header className="lastfm-milestones-head-v717"><div><h5>Deine Hörrekorde · V717</h5><p>Persönliche Rekorde aus deinem gespeicherten Last.fm-Archiv.</p></div><span>{number(book.total)} archivierte Scrobbles</span></header>
  {book.total===0?<p className="lastfm-milestones-note-v717">Noch keine archivierten Scrobbles. Nach dem Import erscheinen hier deine Hörrekorde.</p>:<>
   <div className="lastfm-milestones-kpis-v717">
    <article><span>Rekordtag</span><strong>{book.peakDay?number(book.peakDay.plays):'–'}</strong>{book.peakDay?<button type="button" onClick={()=>onSelectDay(book.peakDay!.day)}>{day(book.peakDay.day)} · Tag öffnen</button>:<small>Keine Daten</small>}</article>
    <article><span>Rekordmonat</span><strong>{book.peakMonth?number(book.peakMonth.plays):'–'}</strong>{book.peakMonth?<button type="button" onClick={()=>onSelectMonth(book.peakMonth!.month)}>{monthLabel(book.peakMonth.month)} · Monat öffnen</button>:<small>Keine Daten</small>}</article>
    <article><span>Längste Hörserie</span><strong>{book.longestStreak?`${book.longestStreak.days} Tage`:'–'}</strong><small>{book.longestStreak?`${day(book.longestStreak.start)} – ${day(book.longestStreak.end)}`:'Keine Daten'}</small></article>
    <article><span>Aktuelle Hörserie</span><strong>{book.currentStreak?`${book.currentStreak.days} Tage`:'–'}</strong><small>{book.currentStreak?'Letzter Scrobble heute oder gestern':'Zurzeit keine laufende Serie'}</small></article>
   </div>
   <div className="lastfm-milestones-columns-v717">
    <section aria-label="Monatsvergleich" className="lastfm-milestones-card-v717">
     <div className="lastfm-milestones-card-head-v717"><div><h6>Monatsvergleich</h6><p>{monthLabel(month)} gegenüber {previous?monthLabel(previous):'dem Vormonat'}</p></div></div>
     <table><thead><tr><th scope="col">Kennzahl</th><th scope="col">Monat</th><th scope="col">Vormonat</th><th scope="col">Differenz</th></tr></thead><tbody>
      {rows.map(({field,label})=><tr key={field}><th scope="row">{label}</th><td>{number(current.selected[field])}</td><td>{current.previous?number(current.previous[field]):'–'}</td><td className={current.change?(current.change[field]>0?'is-up':current.change[field]<0?'is-down':''):''}>{current.change?diff(current.change[field]):'–'}</td></tr>)}
     </tbody></table>
     <p className="lastfm-milestones-note-v717">{current.previous?'Verglichen werden die im Archiv erfassten Scrobbles beider Kalendermonate.':'Kein Vormonat innerhalb des bisherigen Archivs – daher keine belastbare Differenz.'} {current.isCurrentMonth?'Der aktuelle Monat ist noch nicht abgeschlossen.':''}</p>
    </section>
    <section aria-label="Wiederentdeckte Songs" className="lastfm-milestones-card-v717">
     <h6>Wiederentdeckt</h6><p>Songs, die nach mindestens 90 Kalendertagen ohne archivierten Scrobble wieder auftauchten.</p>
     {book.rediscoveries.length?<ol>{book.rediscoveries.map(s=><li key={`${s.artist}\u001f${s.title}`}><button type="button" onClick={()=>onFindSong(s)}><strong>{s.title}</strong><span>{s.artist} · nach {number(s.gapDays)} Tagen · {day(s.day)}</span></button></li>)}</ol>:<p className="lastfm-milestones-note-v717">Noch keine Wiederentdeckung mit mindestens 90 Tagen Abstand im Archiv erkennbar.</p>}
    </section>
   </div>
   <p className="lastfm-milestones-note-v717">Auswertung des gesamten lokalen Archivs, unabhängig von Such- und Datumsfiltern. Tage zählen nach deiner Browser-Zeitzone. Fehlende Scrobbles und Pausen in der Synchronisierung können Rekorde, Hörserien und Wiederentdeckungen beeinflussen. Es werden weder Hörminuten berechnet noch neue Scrobbles gesendet.</p>
  </>}
 </section>;
}
