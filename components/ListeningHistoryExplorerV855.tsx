"use client";

import {useMemo,useState} from 'react';
import type {RecentTrackV672} from '@/lib/recently-played-v672';
import {HISTORY_DEFAULT_FILTERS_V855,HISTORY_PAGE_SIZE_V855,exportListeningHistoryCSVV855,filterListeningHistoryV855,pageListeningHistoryV855,type HistoryFiltersV855} from '@/lib/listening-history-explorer-v855';

const clock=new Intl.DateTimeFormat('de-AT',{hour:'2-digit',minute:'2-digit'});

/** History Studio for the existing opt-in Spotify archive; filtering stays entirely on-device. */
export function ListeningHistoryExplorerV855({events}:{events:ReadonlyArray<RecentTrackV672>}){
 const [filters,setFilters]=useState<HistoryFiltersV855>({...HISTORY_DEFAULT_FILTERS_V855});
 const [page,setPage]=useState(1);
 const [expanded,setExpanded]=useState(true);
 const result=useMemo(()=>filterListeningHistoryV855(events,filters),[events,filters]);
 const paged=useMemo(()=>pageListeningHistoryV855(result.items,page),[result.items,page]);
 const change=<K extends keyof HistoryFiltersV855>(key:K,value:HistoryFiltersV855[K])=>{setFilters(previous=>({...previous,[key]:value}));setPage(1);};
 const reset=()=>{setFilters({...HISTORY_DEFAULT_FILTERS_V855});setPage(1);};
 const download=()=>{
  if(!result.items.length)return;
  const blob=new Blob([exportListeningHistoryCSVV855(result.items)],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='sonic-display-spotify-history-v855.csv';
  document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),10000);
 };
 return <section className="history-studio-v855" aria-label="Spotify History Studio">
  <div className="history-studio-header-v855">
   <div><span className="recent-insight-kicker-v673">V855 · HISTORY STUDIO</span><h4>Dein Musikverlauf<span>.</span></h4><p>Alle gespeicherten Wiedergaben durchsuchen – ohne zusätzliche Spotify-Anfragen.</p></div>
   <button type="button" className="history-studio-disclosure-v855" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>{expanded?'Ansicht einklappen':'Chronik anzeigen'} <span aria-hidden="true">{expanded?'⌃':'⌄'}</span></button>
  </div>
  {expanded&&<>
   <div className="history-studio-filters-v855">
    <label className="history-studio-search-v855">Song, Künstler oder Album suchen<input type="search" placeholder="z. B. Deutschrap, Künstler, Song …" value={filters.query} onChange={(event:{target:{value:string}})=>change('query',event.target.value)} autoComplete="off"/></label>
    <label>Von<input type="date" value={filters.from} max={filters.to||undefined} onChange={(event:{target:{value:string}})=>change('from',event.target.value)}/></label>
    <label>Bis<input type="date" value={filters.to} min={filters.from||undefined} onChange={(event:{target:{value:string}})=>change('to',event.target.value)}/></label>
    <label>Reihenfolge<select value={filters.order} onChange={(event:{target:{value:string}})=>change('order',event.target.value==='oldest'?'oldest':'newest')}><option value="newest">Neueste zuerst</option><option value="oldest">Älteste zuerst</option></select></label>
   </div>
   <div className="history-studio-toolbar-v855">
    <label className="history-studio-repeat-v855"><input type="checkbox" checked={filters.repeatsOnly} onChange={(event:{target:{checked:boolean}})=>change('repeatsOnly',event.target.checked)}/> Nur mehrfach gehörte Songs</label>
    <div className="history-studio-buttons-v855"><button type="button" onClick={reset}>Filter zurücksetzen</button><button type="button" disabled={!result.total} onClick={download}>↓ Treffer als CSV</button></div>
   </div>
   <div className="history-studio-stats-v855" aria-live="polite">
    <div><strong>{result.total.toLocaleString('de-AT')}</strong><span>Gefundene Plays</span></div>
    <div><strong>{result.uniqueSongs.toLocaleString('de-AT')}</strong><span>Verschiedene Titel</span></div>
    <div><strong>{result.activeDays.toLocaleString('de-AT')}</strong><span>Hörtage</span></div>
    <div><strong>{result.repeatEvents.toLocaleString('de-AT')}</strong><span>Plays wiederholter Titel</span></div>
   </div>
   {result.total>0?<>
    <p className="history-studio-count-v855">Einträge {paged.from}–{paged.to} von {result.total.toLocaleString('de-AT')} · {HISTORY_PAGE_SIZE_V855} pro Seite</p>
    <div className="history-studio-timeline-v855">
     {paged.groups.map(group=><section className="history-studio-day-v855" key={`${group.key}-${paged.page}`} aria-label={group.label}>
      <h5><span className="history-studio-day-pulse-v855" aria-hidden="true"/>{group.label}<small>{group.items.length} auf dieser Seite</small></h5>
      <ol>{group.items.map((track,index)=><li key={`${track.id}:${track.playedAt}:${index}`}>
       <time dateTime={track.playedAt}>{clock.format(new Date(track.playedAt))}</time>
       {track.albumCoverUrl?<img src={track.albumCoverUrl} loading="lazy" alt=""/>:<span className="history-studio-cover-empty-v855" aria-hidden="true">♫</span>}
       <div className="history-studio-track-v855"><a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer">{track.title} <span aria-hidden="true">↗</span></a><span>{track.artist}</span><small title={track.album}>{track.album}</small></div>
      </li>)}</ol>
     </section>)}
    </div>
    {paged.pages>1&&<nav className="history-studio-pagination-v855" aria-label="Seiten des Hörverlaufs"><button type="button" disabled={paged.page===1} onClick={()=>setPage(value=>Math.max(1,value-1))}>← Zurück</button><span>Seite {paged.page} von {paged.pages}</span><button type="button" disabled={paged.page===paged.pages} onClick={()=>setPage(value=>Math.min(paged.pages,value+1))}>Weiter →</button></nav>}
   </>:<div className="history-studio-empty-v855"><span aria-hidden="true">♫</span><strong>Keine passenden Wiedergaben</strong><p>Ändere die Suche oder den Zeitraum. Das Archiv bleibt unverändert.</p><button type="button" onClick={reset}>Alle gespeicherten Einträge anzeigen</button></div>}
   <p className="history-studio-note-v855">Es werden nur im lokalen Spotify-Archiv erfasste Ereignisse angezeigt, keine lückenlose Spotify-Historie. Datum und Uhrzeit richten sich nach deinem Gerät. CSV enthält ausschließlich die gefilterten Treffer.</p>
  </>}
 </section>;
}
