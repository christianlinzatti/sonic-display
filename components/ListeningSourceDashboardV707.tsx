'use client';
import {useEffect,useMemo,useState} from 'react';
import {ListeningStatisticsDashboardV703} from '@/components/ListeningStatisticsDashboardV703';
import {ListeningDiscoveryDashboardV704} from '@/components/ListeningDiscoveryDashboardV704';
import {SmartHistoryFusionPanelV865} from '@/components/SmartHistoryFusionPanelV865';
import {readArchiveV701,validArchiveOwnerV701,type V701Archive} from '@/lib/persistent-listening-history-v701';
import {readLastFmArchiveV706,validLastFmUsernameV706,V706_USERNAME_KEY,V706_STORAGE_PREFIX,type LastFmArchiveV706} from '@/lib/lastfm-history-v706';
import {openLongtermDbV713,loadAndMigrateHistoryV713,V713_CHANGE_EVENT} from '@/lib/lastfm-indexed-history-v713';
import {V708_STATUS_EVENT} from '@/lib/automatic-lastfm-history-v708';
import {V702_STATUS_EVENT} from '@/lib/automatic-listening-history-v702';
import {collectHistoryV707,historyStatisticsV707,historyDiscoveriesV707,type HistorySourceV707,type HistoryRangeV707,type HistorySongV707} from '@/lib/listening-sources-v707';

type View='statistics'|'discovery';
const monthDate=(iso:string)=>new Intl.DateTimeFormat('de-AT',{dateStyle:'medium'}).format(new Date(iso));
const sourceName:Record<HistorySourceV707,string>={spotify:'Spotify',lastfm:'Last.fm',combined:'Gemeinsam'};
const categories=[{id:'comebacks',title:'Comebacks',description:'Nach mindestens 30 Tagen Pause wieder gehört.'},{id:'rare',title:'Seltene Funde',description:'Genau einmal erfasst, vor 14 bis 365 Tagen.'},{id:'first',title:'Neu im Archiv',description:'Erstmalig in den erfassten Quellen innerhalb von 30 Tagen.'},{id:'repeat',title:'Auf Repeat',description:'Mindestens drei erfasste Wiedergaben in 30 Tagen.'},{id:'artistChanges',title:'Künstler im Wandel',description:'Anteil der Künstler-Credits in zwei 30-Tage-Zeiträumen.'}] as const;
type Category=(typeof categories)[number]['id'];
function SongRows({songs}:{songs:HistorySongV707[]}){
 if(!songs.length)return <p className="history-sources-empty-v707">Für diese Kategorie sind keine erfassten Wiedergaben vorhanden.</p>;
 return <ol className="history-sources-songs-v707">{songs.map((song,i)=><li key={song.key}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{song.url?<a href={song.url} rel="noopener noreferrer" target="_blank">{song.title} ↗</a>:song.title}</strong><small>{song.artist} · zuletzt {monthDate(song.last)} · {song.days} Hörtage</small></div><b>{song.plays}×</b></li>)}</ol>;
}
/** V707 leaves both persisted archives untouched. Spotify's original screens remain the default. */
export function ListeningSourceDashboardV707({view,onOpenArchive,onOpenLastFm}:{view:View;onOpenArchive:()=>void;onOpenLastFm:()=>void}){
 const [source,setSource]=useState<HistorySourceV707>('spotify');
 const [range,setRange]=useState<HistoryRangeV707>('90d');
 const [category,setCategory]=useState<Category>('comebacks');
 const [revision,setRevision]=useState(0);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [spotify,setSpotify]=useState<V701Archive|null>(null);
 const [lastfm,setLastfm]=useState<LastFmArchiveV706|null>(null);
 const [username,setUsername]=useState('');
 useEffect(()=>{
  if(source==='spotify')return;
  let cancelled=false;const controller=new AbortController();
  const load=async()=>{
   setLoading(true);setError('');setSpotify(null);setLastfm(null);setUsername('');
   try{
    const rawUsername=window.localStorage.getItem(V706_USERNAME_KEY);
    if(!validLastFmUsernameV706(rawUsername))throw new Error('Noch kein Last.fm-Konto ausgewählt. Öffne zuerst „Last.fm-History“.');
    const last=readLastFmArchiveV706(window.localStorage,rawUsername);
    if(last.error)throw new Error(last.error);
    let history:LastFmArchiveV706|null=last.archive;
    try{const db=await openLongtermDbV713();try{history=await loadAndMigrateHistoryV713(db,window.localStorage,rawUsername);}finally{db.close();}}
    catch(e){if(!history)throw e;/* Read-only fallback when IndexedDB is unavailable. */}
    if(!history||history.events.length===0)throw new Error('Noch keine Last.fm-Scrobbles im lokalen Archiv. Bitte zuerst Last.fm-History importieren.');
    let spotifyArchive:V701Archive|null=null;
    if(source==='combined'){
     const response=await fetch('/api/spotify/history-identity',{cache:'no-store',signal:controller.signal});
     if(!response.ok)throw new Error('Spotify-Verbindung nicht verfügbar.');
     const identity=await response.json() as {spotifyUserId?:unknown};
     if(!validArchiveOwnerV701(identity.spotifyUserId))throw new Error('Spotify-Konto konnte nicht überprüft werden.');
     const result=readArchiveV701(window.localStorage,identity.spotifyUserId);
     if(result.error)throw new Error(result.error);
     if(!result.archive)throw new Error('Kein gespeichertes Spotify-Archiv vorhanden. Bitte „Mein Archiv“ öffnen.');
     spotifyArchive=result.archive;
    }
    if(cancelled)return;
    setUsername(rawUsername);setLastfm(history);setSpotify(spotifyArchive);
   }catch(e){if(!cancelled)setError(e instanceof Error?e.message:'Archive konnten nicht geladen werden.');}
   finally{if(!cancelled)setLoading(false);}
  };
  void load();
  return()=>{cancelled=true;controller.abort();};
 },[source,revision]);
 useEffect(()=>{
  if(source==='spotify')return;
  const refresh=()=>setRevision(n=>n+1);
  const storage=(event:StorageEvent)=>{if(event.key===null||event.key===V706_USERNAME_KEY||event.key.startsWith(V706_STORAGE_PREFIX)||event.key.startsWith('sonic-display:personal-history:v701:'))refresh();};
  window.addEventListener('storage',storage);window.addEventListener(V702_STATUS_EVENT,refresh);window.addEventListener(V713_CHANGE_EVENT,refresh);window.addEventListener(V708_STATUS_EVENT,refresh);
  return()=>{window.removeEventListener('storage',storage);window.removeEventListener(V702_STATUS_EVENT,refresh);window.removeEventListener(V713_CHANGE_EVENT,refresh);window.removeEventListener(V708_STATUS_EVENT,refresh);};
 },[source]);
 const collection=useMemo(()=>source!=='spotify'&&lastfm?collectHistoryV707(spotify,lastfm,source):null,[source,spotify,lastfm]);
 const stats=useMemo(()=>collection&&view==='statistics'?historyStatisticsV707(collection,range):null,[collection,view,range]);
 const discoveries=useMemo(()=>collection&&view==='discovery'?historyDiscoveriesV707(collection):null,[collection,view]);
 const selected=categories.find(c=>c.id===category)!;
 const highMonth=Math.max(1,...(stats?.months.map(m=>m.plays)??[]));
 const highHour=Math.max(1,...(stats?.hours??[]));
 return <section className="history-sources-v707" aria-label="Hörhistorie Datenquelle auswählen">
  <div className="history-sources-toolbar-v707"><label>Datenquelle <select aria-label="Hörverlauf-Datenquelle" value={source} onChange={(e:{target:{value:string}})=>setSource(e.target.value as HistorySourceV707)}><option value="spotify">Spotify</option><option value="lastfm">Last.fm</option><option value="combined">Gemeinsam (ohne erkannte Doppelungen)</option></select></label>
   <span>Originalarchive bleiben getrennt und unverändert.</span>
   {source!=='spotify'&&<button type="button" disabled={loading} onClick={()=>setRevision(v=>v+1)}>Archive aktualisieren</button>}
  </div>
  {source==='spotify'?(view==='statistics'?<ListeningStatisticsDashboardV703 onOpenArchive={onOpenArchive}/>:<ListeningDiscoveryDashboardV704 onOpenArchive={onOpenArchive}/> ):
  <div className="history-sources-panel-v707">
   <header><span className="recent-insight-kicker-v673">V707 / {sourceName[source].toUpperCase()}</span><h3>{view==='statistics'?'Dein Musikjahr im Überblick.':'Wiederentdeckungen und Trends.'}</h3><p>{source==='lastfm'?`Erfasste Scrobbles aus dem lokalen Last.fm-Archiv${username?` von ${username}`:''}.`:'Archivierte Spotify-Wiedergaben und Last.fm-Scrobbles in einer vorsichtig abgeglichenen Ansicht.'}</p></header>
   {loading&&<p role="status">Archivdaten lokal einlesen …</p>}
   {!loading&&error&&<div role="alert" className="history-sources-alert-v707"><p>{error}</p><button type="button" onClick={onOpenLastFm}>Last.fm-History öffnen</button><button type="button" onClick={onOpenArchive}>Spotify-Archiv öffnen</button></div>}
   {!loading&&!error&&collection&&<>
    {source==='combined'&&<SmartHistoryFusionPanelV865 collection={collection}/>}
    <div className="history-sources-metrics-v707"><div><strong>{collection.spotifyCount}</strong><span>Spotify-Ereignisse</span></div><div><strong>{collection.lastfmCount}</strong><span>Last.fm-Scrobbles</span></div><div><strong>{collection.matched}</strong><span>Mögliche Doppelungen</span></div><div><strong>{collection.events.length}</strong><span>Gezählte Ereignisse</span></div></div>
    {source==='combined'&&<p className="history-sources-caution-v707">Abgleich: gleicher Künstler und Titel (normalisiert), höchstens 90 Sekunden Zeitdifferenz, jeweils höchstens ein Treffer pro Ereignis. Das ist eine heuristische Erkennung: Nicht gefundene Überschneidungen und fälschliche Übereinstimmungen sind möglich. {collection.unmatchedSpotify} Spotify- und {collection.unmatchedLastfm} Last.fm-Ereignisse blieben ohne Paar.</p>}
    {view==='statistics'&&stats&&<>
     <div className="history-sources-filter-v707"><label>Zeitraum <select value={range} onChange={(e:{target:{value:string}})=>setRange(e.target.value as HistoryRangeV707)}><option value="30d">Letzte 30 Tage</option><option value="90d">Letzte 90 Tage</option><option value="365d">Letzte 365 Tage</option><option value="all">Gesamtes Archiv</option></select></label></div>
     <div className="history-sources-metrics-v707"><div><strong>{stats.plays}</strong><span>Im Zeitraum</span></div><div><strong>{stats.uniqueSongs}</strong><span>Verschiedene Titel/Credits</span></div><div><strong>{stats.repeats}</strong><span>Wiederholungsereignisse</span></div><div><strong>{stats.activeDays}</strong><span>Tage mit Ereignissen</span></div></div>
     <section className="history-sources-card-v707"><h4>Letzte zwölf Kalendermonate</h4><div className="history-sources-months-v707" role="img" aria-label={stats.months.map(m=>`${m.key}: ${m.plays}`).join(', ')}>{stats.months.map(m=><div key={m.key} title={`${m.key}: ${m.plays}`}><strong>{m.plays}</strong><span><i style={{height:`${100*m.plays/highMonth}%`}}/></span><small>{m.key.slice(5)}</small></div>)}</div><p>Abgeschlossene Monate: {stats.previousMonth.earlier} ({stats.previousMonth.earlierCount}) → {stats.previousMonth.latest} ({stats.previousMonth.latestCount}); Veränderung {stats.previousMonth.delta>=0?'+':''}{stats.previousMonth.delta} Ereignisse{stats.previousMonth.percent===null?' (kein Prozentvergleich möglich)':` (${stats.previousMonth.percent} %) `}.</p></section>
     <div className="history-sources-columns-v707"><section className="history-sources-card-v707"><h4>Deine Top-Songs</h4><SongRows songs={stats.topSongs}/></section><section className="history-sources-card-v707"><h4>Künstler-Credits</h4><ol className="history-sources-artists-v707">{stats.topArtists.map(a=><li key={a.name}><span>{a.name}<small>{a.songs} verschiedene Titel · zuletzt {monthDate(a.last)}</small></span><b>{a.plays}×</b></li>)}</ol></section></div>
     <div className="history-sources-columns-v707"><section className="history-sources-card-v707"><h4>Tageszeiten</h4><div className="history-sources-hours-v707" role="img" aria-label={stats.hours.map((v,i)=>`${i} Uhr ${v}`).join(', ')}>{stats.hours.map((v,i)=><span key={i} title={`${i}:00 Uhr · ${v}`}><i style={{height:`${100*v/highHour}%`}}/><small>{i%4===0?i:''}</small></span>)}</div></section><section className="history-sources-card-v707"><h4>Wochentage</h4><ol className="history-sources-artists-v707">{[1,2,3,4,5,6,0].map(i=><li key={i}><span>{['So','Mo','Di','Mi','Do','Fr','Sa'][i]}</span><b>{stats.weekdays[i]}</b></li>)}</ol></section></div>
    </>}
    {view==='discovery'&&discoveries&&<>
     <div className="history-sources-filter-v707" role="group" aria-label="Entdeckungskategorie wählen">{categories.map(c=><button type="button" aria-pressed={category===c.id} key={c.id} onClick={()=>setCategory(c.id)}>{c.title}</button>)}</div>
     <section className="history-sources-card-v707"><h4>{selected.title}</h4><p>{selected.description}</p>{category==='artistChanges'?(discoveries.comparisonAvailable?<ol className="history-sources-artists-v707">{discoveries.artistChanges.map(a=><li key={a.name}><span>{a.name}<small>Letzte 30 Tage: {a.recent} / zuvor: {a.previous}</small></span><b>+{a.deltaPoints} PP</b></li>)}</ol>:<p>Für den Vergleich sind mindestens acht Ereignisse je 30-Tage-Zeitraum nötig ({discoveries.currentCount} / {discoveries.previousCount}).</p>):<SongRows songs={discoveries[category]}/>}</section>
    </>}
    <p className="history-sources-disclaimer-v707">Alle Angaben sind erfasste Wiedergabeereignisse beziehungsweise Last.fm-Scrobbles – keine garantierte vollständige Hörhistorie oder Hörminuten. Gleiche Songtitel und Künstler-Credits werden für die Songranglisten zusammengefasst, selbst wenn es unterschiedliche Albumversionen gibt. Die Zeiträume verwenden die lokale Gerätezeit. Es erfolgen keine zusätzlichen Last.fm-API-Abfragen und keine Schreibzugriffe auf die Archive.</p>
   </>}
  </div>}
 </section>;
}
