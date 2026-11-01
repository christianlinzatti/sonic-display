'use client';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {buildLastFmTasteStoryV718,compareLastFmStoryYearsV718,selectLastFmStoryYearV718} from '@/lib/lastfm-taste-story-v718';

type Props={events:readonly LastFmEventV706[];onOpenYear:(year:number)=>void;
 onOpenMonth:(month:string)=>void;onOpenArtist:(year:number,artist:string)=>void};
const fmt=(n:number)=>n.toLocaleString('de-AT');
const months=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

/** V718 – all visualisations operate on the full, local IndexedDB snapshot supplied by V706.
 * This component never calls Spotify, Last.fm, storage APIs, or any scrobbling endpoint.
 */
export function LastFmTasteStoryPanelV718({events,onOpenYear,onOpenMonth,onOpenArtist}:Props){
 const [choice,setChoice]=useState<number|null>(null);
 const story=useMemo(()=>buildLastFmTasteStoryV718(events),[events]);
 const selectedYear=choice!==null&&story.years.some(y=>y.year===choice)?choice:story.latestYear;
 const selected=selectedYear===null?null:selectLastFmStoryYearV718(story,selectedYear);
 const comparison=selectedYear===null?null:compareLastFmStoryYearsV718(story,selectedYear);
 const maxYear=Math.max(1,...story.years.map(y=>y.plays));
 const maxMonth=Math.max(1,...(selected?.months.map(m=>m.plays)??[]));
 const incomplete=selectedYear===new Date().getFullYear();
 return <section className="lastfm-story-v718" aria-label="Music Taste Story – deine Hörgeschichte">
  <div className="lastfm-story-heading-v718"><div><h4>Music Taste Story · V718</h4><p>Deine musikalische Zeitreise anhand der bereits archivierten Last.fm-Scrobbles.</p></div><span>{fmt(story.total)} Scrobbles im Archiv</span></div>
  {!selected||!story.total?<p className="lastfm-story-empty-v718">Noch keine archivierten Scrobbles. Sobald du deinen Last.fm-Verlauf importiert hast, erscheint hier deine persönliche Zeitachse.</p>:<>
   <div className="lastfm-story-highlights-v718" aria-label="Höhepunkte deiner Hörgeschichte">
    <div><small>Erstes erfasstes Jahr</small><strong>{story.firstYear}</strong></div>
    <div><small>Aktivstes erfasstes Jahr</small><strong>{story.mostPlayedYear??'–'}</strong></div>
    <div><small>Meiste erstmals erfasste Künstler</small><strong>{story.mostExploratoryYear??'–'}</strong></div>
    <div><small>Meiste unterschiedliche Künstler</small><strong>{story.mostDiverseYear??'–'}</strong></div>
   </div>
   <div className="lastfm-story-timeline-head-v718"><h5>Deine Jahre</h5><span>Wähle ein Jahr für Künstler, Songs und Monatsverlauf</span></div>
   <div className="lastfm-story-timeline-v718" role="group" aria-label="Jahr in der Music Taste Story auswählen">
    {story.years.map(y=><button key={y.year} type="button" aria-pressed={selectedYear===y.year} className={`lastfm-story-year-v718${selectedYear===y.year?' is-selected':''}${y.plays===0?' is-empty':''}`} onClick={()=>setChoice(y.year)}
     aria-label={`${y.year}: ${fmt(y.plays)} archivierte Scrobbles${y.plays===0?', keine Daten':''}`} title={`${y.year}: ${fmt(y.plays)} Scrobbles`}>
     <span className="lastfm-story-year-bar-wrap-v718"><i style={{height:`${y.plays?Math.max(8,Math.round(y.plays/maxYear*100)):3}%`}}/></span><strong>{y.year}</strong><small>{fmt(y.plays)}</small>
    </button>)}
   </div>
   <div className="lastfm-story-year-head-v718"><div><h5>{selected.year} im Rückblick</h5><p>{selected.plays?`${fmt(selected.plays)} Scrobbles · ${fmt(selected.artists)} Künstler · ${fmt(selected.songs)} Songs · ${fmt(selected.activeDays)} erfasste Tage`:'Für dieses Jahr liegen keine Scrobbles im Archiv vor.'}</p></div><button type="button" disabled={!selected.plays} onClick={()=>onOpenYear(selected.year)}>Wiedergaben aus {selected.year} öffnen</button></div>
   {selected.plays>0&&<>
    <div className="lastfm-story-chapter-v718" aria-label={`Dein Musikjahr ${selected.year} als Geschichte`}>
    <h6>Kapitel {selected.year}: {selected.topArtists[0]?.artist??'Dein Hörjahr'}</h6>
    <p>{selected.topArtists[0]?`Dein am häufigsten erfasster Künstler war ${selected.topArtists[0].artist} mit ${fmt(selected.topArtists[0].plays)} Scrobbles. `:''}
     {`${fmt(selected.firstSeenArtists)} Künstler tauchten in diesem Jahr erstmals in deinem Archiv auf; ${fmt(selected.returningArtists)} waren bereits aus früheren Archivjahren bekannt. `}
     {comparison?.previous?`${fmt(selected.retainedArtists)} Künstler erscheinen sowohl ${selected.year-1} als auch ${selected.year}.`:'Ein belastbarer Vergleich mit dem unmittelbar vorhergehenden Jahr ist anhand des Archivs nicht möglich.'}</p>
   </div>
   <div className="lastfm-story-summary-v718">
     <article><strong>{fmt(selected.firstSeenArtists)}</strong><span>Künstler erstmals im Archiv erfasst</span></article>
     <article><strong>{fmt(selected.returningArtists)}</strong><span>Künstler bereits aus älteren Jahren bekannt</span></article>
     <article><strong>{comparison?.continuityPercent===null?'–':`${comparison?.continuityPercent}%`}</strong><span>Künstler auch im Vorjahr erfasst</span></article>
     <article><strong>{comparison?.delta===null?'–':`${comparison!.delta>0?'+':''}${fmt(comparison!.delta)}`}</strong><span>Scrobbles zum Vorjahr</span></article>
    </div>
    <div className="lastfm-story-columns-v718">
     <section className="lastfm-story-card-v718" aria-label="Die Top-Künstler des Jahres"><h6>Deine Top-Künstler {selected.year}</h6><ol>{selected.topArtists.map((artist,index)=><li key={`${artist.artist}-${index}`}>
      <button type="button" onClick={()=>onOpenArtist(selected.year,artist.artist)} title={`${artist.artist} in der Chronik des Jahres ${selected.year} öffnen`}>
       <span><strong>{index+1}. {artist.artist}</strong><small>{artist.firstObservedYear===selected.year?'Erstmals im Archiv':artist.presentPreviousYear?'Auch im Vorjahr':'Aus einem älteren Jahr zurück'}</small></span><b>{fmt(artist.plays)}×</b>
      </button></li>)}</ol></section>
     <section className="lastfm-story-card-v718" aria-label="Monatlicher Hörverlauf"><h6>Der Jahresverlauf</h6><p>Tippe einen Monatsbalken an, um die Wiedergaben zu öffnen.</p>
      <div className="lastfm-story-months-v718">{selected.months.map((m,index)=><button type="button" key={m.month} disabled={m.plays===0} onClick={()=>onOpenMonth(m.month)} title={`${months[index]} ${selected.year}: ${fmt(m.plays)} Scrobbles`} aria-label={`${months[index]} ${selected.year}: ${fmt(m.plays)} Scrobbles öffnen`}>
       <span className="lastfm-story-month-bar-v718"><i style={{height:`${m.plays?Math.max(6,Math.round(m.plays/maxMonth*100)):0}%`}}/></span><small>{months[index]}</small><b>{m.plays?fmt(m.plays):'·'}</b>
      </button>)}</div>
      <p>{incomplete?'Das laufende Jahr ist unvollständig. ':''}{comparison?.previous?`Vorjahr ${comparison.previous.year}: ${fmt(comparison.previous.plays)} Scrobbles. `:'Für einen belastbaren Vorjahresvergleich fehlen archivierte Einträge im Vorjahr. '}Verglichen werden erfasste Scrobbles, nicht Hörminuten.</p>
     </section>
    </div>
    <div className="lastfm-story-songs-v718"><h6>Die meistgespielten Songs {selected.year}</h6><ol>{selected.topSongs.map((s,index)=><li key={`${s.artist}:${s.title}:${index}`}><span>{s.title}<small>{s.artist}</small></span><strong>{fmt(s.plays)}×</strong></li>)}</ol></div>
   </>}
   <p className="lastfm-story-footnote-v718">Die Story basiert ausschließlich auf deinem lokalen Last.fm-Archiv und der Browser-Zeitzone. „Neu“, „zurück“ und „Favorit“ beschreiben nur Beobachtungen in diesem Archiv. Synchronisierungslücken sowie unvollständig erfasste Jahre können die Ergebnisse verändern; fehlende Scrobbles beweisen nicht, dass du nichts gehört hast. Aus den Scrobbles werden keine Genres oder Hörminuten erfunden. Es werden keine Scrobbles gesendet.</p>
  </>}
 </section>;
}
