'use client';
import {V726_DEFAULT_SELECTION,type V726Selection,type V726Range,type V726FilterResult} from '@/lib/lastfm-shared-history-filter-v726';

type Props={result:V726FilterResult;selection:V726Selection;onChange:(value:V726Selection)=>void};
/** One controlled filter for the V722 dashboard and V715 chronology; no API calls. */
export function LastFmSharedHistoryFilterV726({result,selection,onChange}:Props){
 const update=(patch:Partial<V726Selection>)=>onChange({...selection,...patch});
 const years=result.years;
 return <section className="lastfm-shared-filter-v726" aria-label="Gemeinsamer Musikzeitraum">
  <div className="lastfm-shared-filter-head-v726"><div><span>V726 · INTELLIGENT HISTORY FILTERS</span><h4>Ein Zeitraum. Deine Musik.</h4><p>Steuert die Insights-Kacheln, die Hörstatistik und die Chronik gemeinsam.</p></div><button type="button" onClick={()=>onChange({...V726_DEFAULT_SELECTION})}>Alle Filter zurücksetzen</button></div>
  <div className="lastfm-shared-filter-controls-v726">
   <label>Zeitraum<select aria-label="Gemeinsamer Zeitraum" value={selection.range} onChange={(e:{target:{value:string}})=>{const range=e.target.value as V726Range;update({range,year:range==='year'?(years.includes(selection.year)?selection.year:years[0]??new Date().getFullYear()):selection.year});}}>
    <option value="all">Gesamtes Archiv</option><option value="days">Letzte Kalendertage</option><option value="year">Kalenderjahr</option><option value="custom">Eigener Zeitraum</option>
   </select></label>
   {selection.range==='days'&&<label>Tage<select aria-label="Anzahl Archivtage" value={selection.days} onChange={(e:{target:{value:string}})=>update({days:Number(e.target.value) as 7|30|90})}><option value={7}>7 Tage</option><option value={30}>30 Tage</option><option value={90}>90 Tage</option></select></label>}
   {selection.range==='year'&&<label>Jahr<select aria-label="Archivjahr" value={selection.year} onChange={(e:{target:{value:string}})=>update({year:Number(e.target.value)})}>{years.length?years.map(y=><option key={y} value={y}>{y}</option>):<option value={selection.year}>Keine Archivjahre</option>}</select></label>}
   {selection.range==='custom'&&<><label>Von (einschließlich)<input type="date" min="2000-01-01" value={selection.from} onChange={(e:{target:{value:string}})=>update({from:e.target.value})}/></label><label>Bis (einschließlich)<input type="date" min="2000-01-01" value={selection.to} onChange={(e:{target:{value:string}})=>update({to:e.target.value})}/></label></>}
   <label>Künstler<input type="search" list="lastfm-v726-artists" value={selection.artist} maxLength={160} placeholder="Alle Künstler" onChange={(e:{target:{value:string}})=>update({artist:e.target.value})} aria-label="Künstler im gesamten Dashboard"/></label>
   <datalist id="lastfm-v726-artists">{result.artists.slice(0,250).map(a=><option key={a} value={a}/>)}</datalist>
  </div>
  {result.error?<p className="lastfm-shared-filter-error-v726" role="alert">{result.error} Bitte korrigieren; die Anzeige zeigt bis dahin keine ungefilterten Scrobbles.</p>:<p className="lastfm-shared-filter-result-v726" role="status"><strong>{result.events.length.toLocaleString('de-AT')}</strong> von {result.sourceTotal.toLocaleString('de-AT')} archivierten Scrobbles · {result.label}{result.anchorDay?` · Letzter Archiv-Eintrag: ${result.anchorDay}`:''}</p>}
  <p className="lastfm-shared-filter-note-v726">„Letzte Tage“ sind lokale Kalendertage bis einschließlich zum letzten archivierten Scrobble, keine Live-Messung. Die zusätzlichen Langzeit- und Vergleichsberichte darunter arbeiten weiterhin ausdrücklich mit dem vollständigen Archiv. Fehlende Einträge sind keine bestätigten Hörpausen.</p>
 </section>;
}
