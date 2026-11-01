'use client';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {buildSongRediscoveryV861,type RediscoveryWindowV861,type V861Comeback,type V861Dormant} from '@/lib/lastfm-song-rediscovery-v861';

type Props={events:readonly LastFmEventV706[];onOpenSong?:(artist:string,title:string)=>void};
type Tab='comebacks'|'dormant';
const fmt=(v:string)=>new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeZone:'Europe/Vienna'}).format(new Date(v));
const number=(v:number)=>v.toLocaleString('de-AT');
const PAGE_SIZE=10;
/** V861: reads the existing account-bound archive; never starts Spotify playback. */
export function LastFmSongRediscoveryV861({events,onOpenSong}:Props){
 const [threshold,setThreshold]=useState<RediscoveryWindowV861>(90);
 const [tab,setTab]=useState<Tab>('comebacks');
 const [search,setSearch]=useState('');
 const [page,setPage]=useState(1);
 const report=useMemo(()=>buildSongRediscoveryV861(events,threshold),[events,threshold]);
 const query=search.normalize('NFKC').trim().toLocaleLowerCase('de-AT');
 const selection=(tab==='comebacks'?report.comebacks:report.dormant).filter(song=>`${song.artist} ${song.title} ${song.album}`.normalize('NFKC').toLocaleLowerCase('de-AT').includes(query));
 const pages=Math.max(1,Math.ceil(selection.length/PAGE_SIZE));
 const current=Math.min(page,pages);
 const visible=selection.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE);
 function changeThreshold(value:RediscoveryWindowV861){setThreshold(value);setPage(1);}
 function changeTab(value:Tab){setTab(value);setPage(1);}
 return <section id="lastfm-song-rediscovery-v861" className="lastfm-rediscovery-v861" aria-label="Song-Wiederentdeckungen">
  <header className="lastfm-rediscovery-header-v861"><div><span>SONIC DISPLAY · SONG REDISCOVERY 2.0</span><h4>Vergessene Songs. <em>Wiedergefunden.</em></h4><p>Entdecke Comebacks nach längeren Abständen zwischen archivierten Scrobbles – und frühere Favoriten, die seit einiger Zeit nicht mehr auftauchten.</p></div></header>
  <div className="lastfm-rediscovery-stats-v861"><article><small>Erfasste Songs</small><strong>{number(report.songs)}</strong></article><article><small>Song-Comebacks</small><strong>{number(report.comebacks.length)}</strong></article><article><small>Länger nicht erfasst</small><strong>{number(report.dormant.length)}</strong></article></div>
  <div className="lastfm-rediscovery-tools-v861"><div role="group" aria-label="Mindestabstand in Tagen">{([90,180,365] as const).map(days=><button type="button" key={days} aria-pressed={threshold===days} onClick={()=>changeThreshold(days)}>{days} Tage</button>)}</div><label>Song oder Künstler suchen<input type="search" value={search} maxLength={120} onChange={(e:{target:{value:string}})=>{setSearch(e.target.value);setPage(1);}} placeholder="Song, Künstler, Album …"/></label></div>
  <div className="lastfm-rediscovery-tabs-v861" role="group" aria-label="Art der Wiederentdeckung"><button type="button" aria-pressed={tab==='comebacks'} onClick={()=>changeTab('comebacks')}>Wiederentdeckt ({number(report.comebacks.length)})</button><button type="button" aria-pressed={tab==='dormant'} onClick={()=>changeTab('dormant')}>Frühere Favoriten ({number(report.dormant.length)})</button></div>
  <p className="lastfm-rediscovery-intro-v861">{tab==='comebacks'?`Neuer Scrobble nach mindestens ${threshold} Tagen Abstand zum vorherigen Eintrag desselben Songs. Angezeigt wird das jüngste passende Comeback pro Song.`:`Mindestens zweimal archivierte Songs, deren letzter Scrobble mindestens ${threshold} Tage zurückliegt – sortiert nach Häufigkeit.`}</p>
  {!report.events?<p className="lastfm-rediscovery-empty-v861">Noch keine Last.fm-Scrobbles im Archiv. Importiere zunächst deine Musikgeschichte.</p>:!selection.length?<p className="lastfm-rediscovery-empty-v861">Für diese Auswahl sind keine passenden archivierten Songs vorhanden. Ein unvollständiges Archiv kann Wiederentdeckungen verdecken.</p>:<>
   <ol className="lastfm-rediscovery-list-v861">{visible.map(item=><li key={item.key}>{item.cover?<img src={item.cover} alt="" loading="lazy" referrerPolicy="no-referrer"/>:<span className="lastfm-rediscovery-cover-v861" aria-hidden="true">♫</span>}<div className="lastfm-rediscovery-track-v861"><strong>{item.title}</strong><span>{item.artist}</span><small>{tab==='comebacks'?<>{(item as V861Comeback).gapDays} Tage Abstand · {fmt((item as V861Comeback).previous)} → {fmt((item as V861Comeback).returned)}</>:<>{(item as V861Dormant).daysSinceLast} Tage seit letztem Eintrag · zuletzt {fmt(item.last)}</>}</small><small>{number(item.plays)} erfasste Wiedergaben{tab==='comebacks'?` · ${(item as V861Comeback).playsSinceReturn} seit Comeback`:''}</small></div>{onOpenSong&&<button type="button" onClick={()=>onOpenSong(item.artist,item.title)} aria-label={`${item.title} von ${item.artist} im History Explorer öffnen`}>Explorer ↗</button>}</li>)}</ol>
   <nav className="lastfm-rediscovery-pages-v861" aria-label="Song-Liste umblättern"><button type="button" disabled={current<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>← Zurück</button><span>Seite {current} von {pages} · {number(selection.length)} Songs</span><button type="button" disabled={current>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>Weiter →</button></nav>
  </>}
  <p className="lastfm-rediscovery-foot-v861">Ein Abstand zwischen Last.fm-Einträgen bedeutet nicht, dass der Song tatsächlich nicht gespielt wurde: Geräte ohne Scrobbling und Archivlücken werden nicht erfasst. Die Berechnung nutzt UTC-Zeitabstände von jeweils 24 Stunden; die sichtbaren Kalenderdaten werden für Wien formatiert. Gleichnamige Aufnahmen eines Künstlers können zusammenfallen. Es werden keine neuen Daten abgerufen, keine Einstellungen geändert und keine Songs automatisch gestartet.</p>
 </section>;
}
