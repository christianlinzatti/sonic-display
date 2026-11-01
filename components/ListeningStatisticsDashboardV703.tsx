"use client";
import {useEffect,useMemo,useState} from 'react';
import {readArchiveV701,validArchiveOwnerV701,type V701Archive} from '@/lib/persistent-listening-history-v701';
import {V702_STATUS_EVENT} from '@/lib/automatic-listening-history-v702';
import {listeningStatisticsV703,type V703Range} from '@/lib/listening-statistics-v703';

const months=new Intl.DateTimeFormat('de-AT',{month:'short',year:'2-digit'});
const days=['So','Mo','Di','Mi','Do','Fr','Sa'];
const dateText=(iso:string)=>new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso));
const maxCount=(values:ReadonlyArray<{plays:number}>)=>Math.max(1,...values.map(v=>v.plays));

/** Read-only, opt-in Spotify archive dashboard. No new listening-history API calls or server writes. */
export function ListeningStatisticsDashboardV703({onOpenArchive}:{onOpenArchive:()=>void}){
 const [archive,setArchive]=useState<V701Archive|null>(null);
 const [owner,setOwner]=useState<string|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const [range,setRange]=useState<V703Range>('90d');
 const [updated,setUpdated]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  const load=async()=>{
   setLoading(true);setError('');setOwner(null);setArchive(null);
   try{
    const response=await fetch('/api/spotify/history-identity',{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw new Error('Spotify-Konto nicht verfügbar. Bitte Verbindung prüfen.');
    const identity=await response.json() as {spotifyUserId?:unknown};
    if(!validArchiveOwnerV701(identity.spotifyUserId))throw new Error('Spotify-Konto konnte nicht zugeordnet werden.');
    if(controller.signal.aborted)return;
    const saved=readArchiveV701(window.localStorage,identity.spotifyUserId);
    setOwner(identity.spotifyUserId);setArchive(saved.archive);setError(saved.error??'');
   }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Statistik konnte nicht geöffnet werden.');}
   finally{if(!controller.signal.aborted)setLoading(false);}
  };void load();return()=>controller.abort();
 },[updated]);
 useEffect(()=>{
  if(!owner)return;
  const read=()=>{const result=readArchiveV701(window.localStorage,owner);setArchive(result.archive);setError(result.error??'');};
  const onStorage=(e:StorageEvent)=>{if(e.key===null||e.key===`sonic-display:personal-history:v701:${encodeURIComponent(owner)}`)read();};
  window.addEventListener('storage',onStorage);window.addEventListener(V702_STATUS_EVENT,read);
  return()=>{window.removeEventListener('storage',onStorage);window.removeEventListener(V702_STATUS_EVENT,read);};
 },[owner]);
 const stats=useMemo(()=>archive?listeningStatisticsV703(archive,range):null,[archive,range]);
 const maxMonth=stats?maxCount(stats.months):1,maxHour=stats?maxCount(stats.hours):1,maxWeekday=stats?maxCount(stats.weekdays):1;
 const comparison=stats?.completedMonths;
 return <section className="listening-stats-v703" aria-label="Persönliches Listening Statistics Dashboard">
  <div className="listening-stats-header-v703"><div><span className="recent-insight-kicker-v673">V703 / DEIN HÖRARCHIV</span><h3>Dein Sound in Zahlen<span>.</span></h3><p>Musiktrends aus deinem bewusst gespeicherten Spotify-Archiv – über Monate hinweg.</p></div>
   <div className="listening-stats-tools-v703"><label>Zeitraum <select value={range} onChange={(e:{target:{value:string}})=>setRange(e.target.value as V703Range)} aria-label="Statistik-Zeitraum"><option value="30d">Letzte 30 Tage</option><option value="90d">Letzte 90 Tage</option><option value="365d">Letzte 365 Tage</option><option value="all">Gesamtes Archiv</option></select></label><button type="button" onClick={()=>setUpdated(n=>n+1)} disabled={loading}>Archiv neu einlesen</button></div>
  </div>
  {loading&&<p role="status">Gespeicherten Verlauf und Spotify-Konto prüfen …</p>}
  {!loading&&error&&<p role="alert" className="listening-stats-alert-v703">{error} Die gespeicherten Daten werden nicht verändert.</p>}
  {!loading&&!error&&!archive&&<div className="listening-stats-empty-v703"><h4>Dein Musikarchiv ist noch nicht aktiviert.</h4><p>Erst nach einer bewussten Sicherung sind Langzeitstatistiken möglich. Die normale Spotify-Chronik wird nicht automatisch zur Statistik addiert.</p><button type="button" onClick={onOpenArchive}>Mein Archiv öffnen</button></div>}
  {!loading&&!error&&archive&&stats&&<>
   <div className="listening-stats-metrics-v703" aria-label="Statistik Kennzahlen">
    <div><strong>{stats.plays.toLocaleString('de-AT')}</strong><span>Erfasste Wiedergaben</span></div><div><strong>{stats.uniqueSongs.toLocaleString('de-AT')}</strong><span>Unterschiedliche Songs</span></div><div><strong>{stats.repeatEvents.toLocaleString('de-AT')}</strong><span>Weitere Wiedergaben gleicher Songs</span></div><div><strong>{stats.activeDays.toLocaleString('de-AT')}</strong><span>Tage mit archivierten Ereignissen</span></div>
   </div>
   <section className="listening-stats-surface-v703"><div className="listening-stats-section-head-v703"><div><h4>Deine letzten zwölf Kalendermonate</h4><p>Nur tatsächlich gespeicherte Wiedergaben im gewählten Zeitraum · laufender Monat ist unvollständig.</p></div></div>
    <div className="listening-stats-months-v703" role="img" aria-label={`Erfasste Wiedergaben je Monat: ${stats.months.map(m=>`${m.key} ${m.plays}`).join(', ')}`}>
     {stats.months.map(m=><div key={m.key} title={`${m.key}: ${m.plays} Ereignisse`}><span className="listening-stats-month-count-v703">{m.plays}</span><div className="listening-stats-month-bar-v703"><span style={{height:`${m.plays?Math.max(3,100*m.plays/maxMonth):0}%`}}/></div><small>{months.format(new Date(`${m.key}-01T12:00:00`))}{m.isCurrent?' *':''}</small></div>)}
    </div>
    {comparison&&<div className="listening-stats-comparison-v703"><div><strong>Letzte abgeschlossene Monate</strong><span>{comparison.latestKey}: {comparison.latest} · {comparison.earlierKey}: {comparison.earlier} Ereignisse</span></div><b>{comparison.earlier===0?'Kein Prozentvergleich möglich':`${comparison.delta>=0?'+':''}${comparison.delta} Ereignisse (${comparison.percent!==null&&comparison.percent>=0?'+':''}${comparison.percent} %) `}</b></div>}
   </section>
   <div className="listening-stats-columns-v703">
    <section className="listening-stats-surface-v703"><h4>Deine meistwiederholten Songs</h4><p>Platzierung nach Anzahl archivierter Ereignisse.</p>
     {stats.topSongs.length?<ol className="listening-stats-ranking-v703">{stats.topSongs.map((s,i)=><li key={s.id}><span className="listening-stats-rank-v703">{String(i+1).padStart(2,'0')}</span><div><a href={s.spotifyUrl} target="_blank" rel="noopener noreferrer">{s.title} ↗</a><small>{s.artist} · {s.activeDays} {s.activeDays===1?'Tag':'Tage'} · zuletzt {dateText(s.lastPlayedAt)}</small></div><strong>{s.plays}×</strong></li>)}</ol>:<p>In diesem Zeitraum sind noch keine Wiedergaben gespeichert.</p>}
    </section>
    <section className="listening-stats-surface-v703"><h4>Deine häufigsten Künstler-Credits</h4><p>Features/Duette werden wie in den Spotify-Metadaten gemeinsam gezählt.</p>
     {stats.topArtists.length?<ol className="listening-stats-ranking-v703">{stats.topArtists.map((a,i)=><li key={a.name}><span className="listening-stats-rank-v703">{String(i+1).padStart(2,'0')}</span><div><span>{a.name}</span><small>{a.uniqueSongs} verschiedene Songs · zuletzt {dateText(a.lastPlayedAt)}</small></div><strong>{a.plays}×</strong></li>)}</ol>:<p>Keine Künstler-Credits im gewählten Zeitraum.</p>}
    </section>
   </div>
   <div className="listening-stats-columns-v703">
    <section className="listening-stats-surface-v703"><h4>Zu welcher Uhrzeit hörst du?</h4><p>Lokale Browserzeit der archivierten Wiedergaben (0–23 Uhr).</p><div className="listening-stats-hours-v703" role="img" aria-label={`Wiedergaben pro Stunde: ${stats.hours.map(h=>`${h.key} Uhr ${h.plays}`).join(', ')}`}>
     {stats.hours.map(h=><span key={h.key} title={`${h.key}:00 Uhr · ${h.plays} Ereignisse`}><i style={{height:`${h.plays?Math.max(3,100*h.plays/maxHour):0}%`}}/><small>{h.key%3===0?String(h.key).padStart(2,'0'):''}</small></span>)}
    </div></section>
    <section className="listening-stats-surface-v703"><h4>Nach Wochentag</h4><p>Verteilung der archivierten Ereignisse, keine vollständige Erfassung aller Hörzeiten.</p><div className="listening-stats-weekdays-v703">{[1,2,3,4,5,6,0].map(d=><div key={d}><span>{days[d]}</span><div><i style={{width:`${100*stats.weekdays[d].plays/maxWeekday}%`}}/></div><strong>{stats.weekdays[d].plays}</strong></div>)}</div></section>
   </div>
   <p className="listening-stats-disclaimer-v703">Datenbasis: <strong>{stats.archivedEvents} gespeicherte, gültige Ereignisse</strong> in diesem lokalen Spotify-Konto · zuletzt gesichert: {dateText(archive.savedAt)}. Spotify liefert keinen lückenlosen Langzeitverlauf. Ein Ereignis beweist weder einen vollständig gehörten Titel noch Hörminuten; fehlende Monate sind keine Aussage über tatsächliche Inaktivität. Prozentvergleiche nutzen die letzten beiden abgeschlossenen Kalendermonate aus dem gesamten Archiv, unabhängig vom gewählten Filter. Die Statistik überträgt keine Hörhistorie an einen Server.</p>
  </>}
 </section>;
}
