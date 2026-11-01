'use client';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {buildLastFmDiscoveryTimelineV720,findLastFmDiscoveryArtistV720,lastFmDiscoveryYearMonthsV720,searchLastFmDiscoveryArtistsV720} from '@/lib/lastfm-discovery-timeline-v720';

type Props={key?:string;events:readonly LastFmEventV706[];onOpenYear:(year:number)=>void;onOpenMonth:(month:string,artist:string)=>void;
 onOpenArtist:(year:number,artist:string)=>void;onOpenSong:(year:number,artist:string,title:string)=>void};
const fmt=(n:number)=>n.toLocaleString('de-AT');
const monthNames=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const pretty=(date:string)=>new Date(date).toLocaleDateString('de-AT',{day:'numeric',month:'long',year:'numeric'});
const prettyMonth=(month:string)=>`${monthNames[Number(month.slice(5))-1]} ${month.slice(0,4)}`;

/** V720 interactive discovery; uses the full existing IndexedDB snapshot via props only. */
export function LastFmDiscoveryTimelinePanelV720({events,onOpenYear,onOpenMonth,onOpenArtist,onOpenSong}:Props){
 const [term,setTerm]=useState('');
 const [chosen,setChosen]=useState<string|null>(null);
 const [chosenYear,setChosenYear]=useState<number|null>(null);
 const [discoveryYear,setDiscoveryYear]=useState<number|null>(null);
 const data=useMemo(()=>buildLastFmDiscoveryTimelineV720(events),[events]);
 const list=useMemo(()=>searchLastFmDiscoveryArtistsV720(data,term,12),[data,term]);
 const currentKey=chosen&&findLastFmDiscoveryArtistV720(data,chosen)?chosen:data.artists[0]?.key??null;
 const selected=currentKey?findLastFmDiscoveryArtistV720(data,currentKey):null;
 const activeYear=selected?(chosenYear!==null&&selected.years.includes(chosenYear)?chosenYear:selected.years[selected.years.length-1]):null;
 const months=useMemo(()=>selected&&activeYear!==null?lastFmDiscoveryYearMonthsV720(selected,activeYear):[],[selected,activeYear]);
 const top=Math.max(1,...months.map(m=>m.plays));
 const newestDiscoveryYear=data.years[data.years.length-1]?.year??null;
 const shownDiscoveryYear=discoveryYear!==null&&data.years.some(y=>y.year===discoveryYear)?discoveryYear:newestDiscoveryYear;
 const selectedYear=data.years.find(y=>y.year===shownDiscoveryYear);
 const maxNew=Math.max(1,...data.years.map(y=>y.firstSeenArtists));
 return <section id="lastfm-discovery-timeline-v720" className="lastfm-discovery-v720" aria-label="Music Discovery Timeline">
  <div className="lastfm-discovery-heading-v720"><div><h4>Music Discovery Timeline · V720</h4><p>Vom ersten erfassten Scrobble bis zum messbaren Favoritenmoment – ohne neue API-Anfragen.</p></div><span>{fmt(data.artists.length)} erfasste Künstler</span></div>
  {!selected?<p>Dein Last.fm-Langzeitarchiv enthält noch keine Scrobbles. Importiere zuerst deine Wiedergaben.</p>:<>
   <div className="lastfm-discovery-grid-v720">
    <article className="lastfm-discovery-card-v720"><h5>Entdeckungen im Jahresverlauf</h5><p>Künstler, die in diesem Jahr zum ersten Mal <em>im Archiv</em> erscheinen. Kein Beleg für das tatsächliche erste Hören.</p>
     <div className="lastfm-discovery-years-v720" role="group" aria-label="Entdeckungsjahr wählen">{data.years.map(y=><button type="button" key={y.year} className={shownDiscoveryYear===y.year?'is-selected':''} aria-pressed={shownDiscoveryYear===y.year} title={`${y.year}: ${fmt(y.firstSeenArtists)} erstmals archivierte Künstler`} onClick={()=>setDiscoveryYear(y.year)}><span className="lastfm-discovery-year-bar-v720"><i style={{height:`${y.firstSeenArtists?Math.max(5,Math.round(y.firstSeenArtists/maxNew*100)):0}%`}}/></span><strong>{y.year}</strong><small>{fmt(y.firstSeenArtists)}</small></button>)}</div>
     {selectedYear&&<div className="lastfm-discovery-year-details-v720"><strong>{selectedYear.year}: {fmt(selectedYear.firstSeenArtists)} erstmals archivierte Künstler</strong><span>{fmt(selectedYear.scrobbles)} Scrobbles in diesem Jahr</span><button type="button" onClick={()=>onOpenYear(selectedYear.year)}>Jahreschronik öffnen</button>
      {selectedYear.newArtists.length>0&&<ul>{selectedYear.newArtists.map(a=><li key={a.key}><button type="button" onClick={()=>{setChosen(a.key);setChosenYear(null);}}>{a.artist} · {fmt(a.plays)} Scrobbles gesamt</button></li>)}</ul>}</div>}
    </article>
    <article className="lastfm-discovery-card-v720"><h5>Einen Künstler entdecken</h5><label className="lastfm-discovery-search-v720">Künstler suchen<input type="search" value={term} onChange={(e:{target:{value:string}})=>setTerm(e.target.value)} placeholder="Künstler im Archiv finden" aria-label="Künstler in der Discovery Timeline suchen"/></label>
     <div className="lastfm-discovery-results-v720" role="group" aria-label="Künstler auswählen">{list.map(a=><button type="button" key={a.key} aria-pressed={selected.key===a.key} className={selected.key===a.key?'is-selected':''} onClick={()=>{setChosen(a.key);setChosenYear(null);}}><strong>{a.artist}</strong><small>{fmt(a.plays)} Scrobbles · erstmals {a.firstYear}</small></button>)}{!list.length&&<p>Keine Künstler gefunden.</p>}</div>
     <p className="lastfm-discovery-note-v720">Die Suche zeigt maximal zwölf Treffer. Bei leerer Suche erscheinen zuerst deine meistgehörten Künstler.</p>
    </article>
   </div>
   <div className="lastfm-discovery-portrait-v720"><div className="lastfm-discovery-artist-head-v720"><div><h5>{selected.artist}</h5><p>Deine dokumentierte Hörentwicklung</p></div><button type="button" onClick={()=>onOpenArtist(activeYear??selected.firstYear,selected.artist)}>Künstler-Chronik öffnen</button></div>
    <div className="lastfm-discovery-moments-v720" aria-label="Meilensteine des Künstlers">
     <div><small>Erstmals im Archiv</small><strong>{pretty(selected.firstAt)}</strong><span>Erster beobachteter Scrobble</span></div>
     <div><small>Erster Monat mit ≥5 Scrobbles</small><strong>{selected.firstRepeatMonth?prettyMonth(selected.firstRepeatMonth):'–'}</strong><span>{selected.firstRepeatMonth?'Wiederholt im selben Monat erfasst':'Noch kein solcher Monat erfasst'}</span></div>
     <div><small>Erster Favoritenmoment</small><strong>{selected.favoriteMoment?prettyMonth(selected.favoriteMoment.month):'–'}</strong><span>{selected.favoriteMoment?`${fmt(selected.favoriteMoment.plays)} Scrobbles · ${(selected.favoriteMoment.share*100).toFixed(1)} % Monatsanteil`:'Schwelle im Archiv nicht erreicht'}</span></div>
     <div><small>Stärkster Monat</small><strong>{prettyMonth(selected.peakMonth.month)}</strong><span>{fmt(selected.peakMonth.plays)} Scrobbles · Rang {selected.peakMonth.rank} im Monat</span></div>
    </div>
    <p className="lastfm-discovery-note-v720">„Favoritenmoment“: erster Monat mit mindestens 20 Scrobbles insgesamt, mindestens fünf für diesen Künstler, mindestens 10 % Monatsanteil und Platz 1–3 im Monatsranking. „Kein Favoritenmoment“ bedeutet nur: im Archiv nicht nachweisbar.</p>
    <div className="lastfm-discovery-month-head-v720"><h5>Verlauf über die Monate</h5><label>Jahr<select aria-label="Jahr des Künstlerverlaufs" value={activeYear??''} onChange={(e:{target:{value:string}})=>setChosenYear(Number(e.target.value))}>{selected.years.map(year=><option key={year} value={year}>{year}</option>)}</select></label></div>
    <div className="lastfm-discovery-months-v720" role="group" aria-label="Monatliche Scrobbles des Künstlers">{months.map((m,i)=><button type="button" key={m.month} disabled={!m.plays} title={`${m.month}: ${fmt(m.plays)} Künstler-Scrobbles (${(m.share*100).toFixed(1)} % der Monats-Scrobbles)`} onClick={()=>onOpenMonth(m.month,selected.artist)}><span className="lastfm-discovery-month-bar-v720"><i style={{height:`${m.plays?Math.max(4,Math.round(m.plays/top*100)):0}%`}}/></span><strong>{monthNames[i]}</strong><small>{m.plays||'·'}</small></button>)}</div>
    <div className="lastfm-discovery-song-card-v720"><h5>Deine meistgespielten Songs von {selected.artist}</h5><p>Nach Anzahl der archivierten Scrobbles sortiert; „prägend“ beschreibt hier nur die gemessene Häufigkeit.</p><ol>{selected.topSongs.map(s=><li key={s.key}><button type="button" onClick={()=>onOpenSong(new Date(s.lastAt).getFullYear(),selected.artist,s.title)}><span><strong>{s.title}</strong><small>Erstmals archiviert: {pretty(s.firstAt)}</small></span><span>{fmt(s.plays)}× · {(s.share*100).toFixed(1)} %</span></button></li>)}</ol></div>
   </div>
   <p className="lastfm-discovery-note-v720">Alle Ereignisse stammen aus dem lokalen Last.fm-Archiv. Unvollständige Importzeiträume, nicht erfasste Scrobbles und laufende Monate beeinflussen die Ergebnisse. Keine Genre-Vermutungen, Hörminuten-Schätzungen oder zusätzliche Scrobbles.</p>
  </>}
 </section>;
}
