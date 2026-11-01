'use client';
import {LastFmCollectionsV732} from '@/components/LastFmCollectionsV732';
import {LastFmExplorerToolsV730} from '@/components/LastFmExplorerToolsV730';
import {filterExplorerRangeV730,localDateV730,type ExplorerRangeV730} from '@/lib/lastfm-explorer-v730';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {buildExplorerProfileV729,explorerCatalogV729,explorerKeyV729,spotifyExplorerLinkV729,type ExplorerSelectionV729} from '@/lib/lastfm-explorer-v729';

type Props={account?:string;events:readonly LastFmEventV706[];selection:ExplorerSelectionV729|null;onSelect:(selection:ExplorerSelectionV729|null)=>void};
const date=(stamp:string|null)=>stamp?new Date(stamp).toLocaleString('de-AT'):'–';
export function LastFmExplorerV729({account='',events,selection,onSelect}:Props){
 const [query,setQuery]=useState(''),[mode,setMode]=useState<'artists'|'songs'>('artists'),[limit,setLimit]=useState(20);
 const catalog=useMemo(()=>explorerCatalogV729(events),[events]);
 const [range,setRange]=useState<ExplorerRangeV730>({from:'',to:''});
 const filtered=useMemo(()=>filterExplorerRangeV730(events,range),[events,range]);
 const profile=useMemo(()=>selection?buildExplorerProfileV729(filtered.events,selection):null,[filtered.events,selection]);
 const candidates: {artist:string;title?:string;plays:number}[]=catalog[mode];
 const items=candidates.filter(e=>explorerKeyV729(`${e.artist} ${e.title!==undefined?e.title:''}`).includes(explorerKeyV729(query)));
 const choose=(next:ExplorerSelectionV729)=>{setLimit(20);onSelect(next);};
 return <section id="lastfm-explorer-v729" className="lastfm-explorer-v729" tabIndex={-1} aria-label="Advanced Artist & Track Explorer">
  <header><span>DEIN HÖRARCHIV · V732</span><h4>Advanced Artist &amp; Track Explorer</h4><p>Künstler und Songs im gesamten Last.fm-Archiv erkunden.</p></header>
  <div className="explorer-controls-v729"><label>Profile suchen<input type="search" value={query} onChange={(e:{target:{value:string}})=>{setQuery(e.target.value);setLimit(20);}} placeholder="Künstler oder Song"/></label><label>Profiltyp<select value={mode} onChange={(e:{target:{value:string}})=>{setMode(e.target.value as 'artists'|'songs');setLimit(20);}}><option value="artists">Künstler</option><option value="songs">Songs</option></select></label></div>
  <fieldset className="explorer-range-v730"><legend>Zeitraum für Profile, Vergleiche und CSV</legend><div className="explorer-controls-v729"><label>Von (einschließlich)<input type="date" min="2000-01-01" max={localDateV730(new Date())} value={range.from} onChange={(e:{target:{value:string}})=>{setRange(r=>({...r,from:e.target.value}));setLimit(20);}}/></label><label>Bis (einschließlich)<input type="date" min="2000-01-01" max={localDateV730(new Date())} value={range.to} onChange={(e:{target:{value:string}})=>{setRange(r=>({...r,to:e.target.value}));setLimit(20);}}/></label><button type="button" onClick={()=>{setRange({from:'',to:''});setLimit(20);}}>Gesamtes Archiv</button><button type="button" onClick={()=>{const end=new Date(),start=new Date(end);start.setDate(start.getDate()-29);setRange({from:localDateV730(start),to:localDateV730(end)});setLimit(20);}}>Letzte 30 Kalendertage</button></div><p role="status">{range.from||range.to?`${range.from||'Archivbeginn'} bis ${range.to||'Archivende'}`:'Gesamtes Archiv'} · {filtered.events.length.toLocaleString('de-AT')} gültige Scrobbles</p>{filtered.error&&<p role="alert">{filtered.error}</p>}</fieldset>
  {!events.length?<p>Importiere zuerst deinen Last.fm-Hörverlauf.</p>:<>
   <p role="status">{items.length.toLocaleString('de-AT')} Profile im gesamten Archiv gefunden</p>
   <div className="explorer-catalog-v729">{items.slice(0,limit).map(e=><button type="button" key={JSON.stringify([e.artist,e.title!==undefined?e.title:null])} aria-pressed={selection!==null&&explorerKeyV729(selection.artist)===explorerKeyV729(e.artist)&&explorerKeyV729(selection.title??'')===explorerKeyV729(e.title!==undefined?e.title:'')} onClick={()=>choose(e.title!==undefined?{artist:e.artist,title:e.title}:{artist:e.artist})}><strong>{e.title!==undefined?e.title:e.artist}</strong><small>{e.title!==undefined?`${e.artist} · `:''}{e.plays} Scrobbles</small></button>)}</div>
   {items.length>limit&&<button type="button" onClick={()=>setLimit(n=>n+40)}>Weitere Profile anzeigen</button>}
  </>}
  {profile&&selection&&<article aria-label="Detailprofil" className="explorer-profile-v729">
   <header><h5>{selection.title??selection.artist}</h5>{selection.title!==undefined&&<button type="button" onClick={()=>choose({artist:selection.artist})}>{selection.artist} · Künstlerprofil öffnen</button>}<button type="button" onClick={()=>onSelect(null)}>Profil schließen</button></header>
   <a href={spotifyExplorerLinkV729(selection)} target="_blank" rel="noopener noreferrer">Auf Spotify suchen ↗</a>
   <p>{profile.plays.toLocaleString('de-AT')} archivierte Scrobbles · {profile.topSongs.length} verschiedene Songs</p>
   <dl><dt>Erstmals im gewählten Zeitraum</dt><dd>{date(profile.first)}</dd><dt>Zuletzt im gewählten Zeitraum</dt><dd>{date(profile.last)}</dd></dl>
   {!profile.plays&&<p>Im gewählten Zeitraum sind für dieses Profil keine gültigen Scrobbles vorhanden.</p>}
   <div className="explorer-columns-v729"><div><h6>Jahresstatistiken</h6><ul>{profile.years.map(([year,plays])=><li key={year}>{year}: {plays} Scrobbles <meter min={0} max={profile.plays} value={plays} aria-label={`${year}: ${plays} Scrobbles`}/></li>)}</ul></div>
   <div><h6>Top-Songs</h6><ol>{profile.topSongs.slice(0,20).map(s=><li key={s.title}><button type="button" onClick={()=>choose({artist:s.artist,title:s.title})}>{s.title}</button> · {s.plays}×</li>)}</ol></div></div>
   <h6>Wiederentdeckungen</h6><p>Mindestens 90 lokale Kalendertage zwischen zwei archivierten Wiedergaben. Fehlende Scrobbles belegen keine tatsächliche Hörpause.</p>
   {profile.rediscoveries.length?<ul>{profile.rediscoveries.slice(0,limit).map(r=><li key={r.returned}>{date(r.returned)} · {r.gapDays} Tage seit {date(r.previous)}</li>)}</ul>:<p>Keine entsprechende Rückkehr im Archiv nachweisbar.</p>}
   <h6>Hörverlauf · neueste zuerst</h6><ol>{profile.history.slice(0,limit).map(e=><li key={JSON.stringify([e.playedAt,e.title])}><time dateTime={e.playedAt}>{date(e.playedAt)}</time> · <button type="button" onClick={()=>choose({artist:e.artist,title:e.title})}>{e.title}</button> · {e.album}</li>)}</ol>
   {(profile.history.length>limit||profile.rediscoveries.length>limit)&&<button type="button" onClick={()=>setLimit(n=>n+50)}>Mehr Hörverlauf und Wiederentdeckungen</button>}
  </article>}
  <LastFmCollectionsV732 key={account} account={account} events={events} onSelect={choose}/>
  <LastFmExplorerToolsV730 account={account} events={events} selection={selection} profile={profile} range={range} rangeError={filtered.error} onSelect={choose}/>
  <p>Der Profilkatalog umfasst das gesamte Archiv. Detailprofile, Monats-/Jahresstatistiken und Vergleiche verwenden den oben gewählten Zeitraum, unabhängig von Chronikfiltern. Schreibweisen werden mit Unicode-NFKC und ohne Groß-/Kleinschreibung abgeglichen; Songversionen mit anderem Titel bleiben getrennt. Spotify öffnet eine Suche, keine bestätigte Zuordnung. Keine zusätzlichen API-Aufrufe.</p>
 </section>;
}
