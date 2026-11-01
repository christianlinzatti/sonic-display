"use client";
import {useEffect,useMemo,useState} from 'react';
import {readArchiveV701,validArchiveOwnerV701,type V701Archive} from '@/lib/persistent-listening-history-v701';
import {V702_STATUS_EVENT} from '@/lib/automatic-listening-history-v702';
import {listeningDiscoveryV704,type V704Song} from '@/lib/listening-discovery-v704';

type Section='comebacks'|'rareGems'|'firstInArchive'|'onRepeat'|'artistChanges';
const sections:ReadonlyArray<{id:Section;title:string;hint:string}>=[
 {id:'comebacks',title:'Comebacks',hint:'Nach mindestens 30 Tagen Abstand wieder im Archiv aufgetaucht.'},
 {id:'rareGems',title:'Selten gehört',hint:'Einmal archiviert, zuletzt vor 14–365 Tagen.'},
 {id:'firstInArchive',title:'Neu im Archiv',hint:'Erstmals in deinem gespeicherten Archiv erfasst – nicht zwingend neue Musik.'},
 {id:'onRepeat',title:'Auf Repeat',hint:'Mindestens drei erfasste Wiedergaben in den letzten 30 Kalendertagen.'},
 {id:'artistChanges',title:'Künstler im Wandel',hint:'Höherer Anteil an archivierten Ereignissen gegenüber den 30 Tagen davor.'}
];
const fmt=(iso:string)=>new Intl.DateTimeFormat('de-AT',{dateStyle:'medium'}).format(new Date(iso));
function DiscoverySongsV704({items,section}:{items:V704Song[];section:Section}){
 if(!items.length)return <p role="status" className="discovery-empty-v704">Für diese Kategorie liegen noch keine passenden archivierten Wiedergaben vor.</p>;
 return <ol className="discovery-songs-v704">{items.map((song,i)=><li key={song.id}>
  <span className="discovery-index-v704">{String(i+1).padStart(2,'0')}</span>
  <div className="discovery-cover-v704">{song.cover?<img src={song.cover} alt="" loading="lazy"/>:<span aria-hidden="true">♫</span>}</div>
  <div className="discovery-song-text-v704"><a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">{song.title} <span aria-hidden="true">↗</span></a><small>{song.artist}</small><small>{section==='comebacks'?`Letzter Abstand: ${song.lastGapDays} Tage · Wieder gehört: ${fmt(song.lastPlayedAt)}`:section==='onRepeat'?`${song.recentPlays} Wiedergaben in 30 Tagen · zuletzt ${fmt(song.lastPlayedAt)}`:section==='firstInArchive'?`Erster Archivereintrag: ${fmt(song.firstPlayedAt)}`:`Einmal erfasst: ${fmt(song.lastPlayedAt)}`}</small></div>
  <strong className="discovery-count-v704">{song.plays}×</strong>
 </li>)}</ol>;
}
/** Read-only analysis of the opt-in V701 archive; no new Spotify scopes, fetch of history, or writes. */
export function ListeningDiscoveryDashboardV704({onOpenArchive}:{onOpenArchive:()=>void}){
 const [archive,setArchive]=useState<V701Archive|null>(null);
 const [owner,setOwner]=useState<string|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [updated,setUpdated]=useState(0);
 const [section,setSection]=useState<Section>('comebacks');
 useEffect(()=>{
  const controller=new AbortController();
  const load=async()=>{setLoading(true);setError('');setArchive(null);setOwner(null);
   try{
    const res=await fetch('/api/spotify/history-identity',{signal:controller.signal,cache:'no-store'});
    if(!res.ok)throw new Error('Spotify-Konto nicht verfügbar. Bitte Verbindung prüfen.');
    const identity=await res.json() as {spotifyUserId?:unknown};
    if(!validArchiveOwnerV701(identity.spotifyUserId))throw new Error('Spotify-Konto konnte nicht zugeordnet werden.');
    if(controller.signal.aborted)return;
    const saved=readArchiveV701(window.localStorage,identity.spotifyUserId);
    setOwner(identity.spotifyUserId);setArchive(saved.archive);setError(saved.error??'');
   }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Entdeckungen konnten nicht geladen werden.');}
   finally{if(!controller.signal.aborted)setLoading(false);}
  };void load();return()=>controller.abort();
 },[updated]);
 useEffect(()=>{
  if(!owner)return;
  const read=()=>{const saved=readArchiveV701(window.localStorage,owner);setArchive(saved.archive);setError(saved.error??'');};
  const onStorage=(event:StorageEvent)=>{if(event.key===null||event.key===`sonic-display:personal-history:v701:${encodeURIComponent(owner)}`)read();};
  window.addEventListener('storage',onStorage);window.addEventListener(V702_STATUS_EVENT,read);
  return()=>{window.removeEventListener('storage',onStorage);window.removeEventListener(V702_STATUS_EVENT,read);};
 },[owner]);
 const discoveries=useMemo(()=>archive?listeningDiscoveryV704(archive):null,[archive]);
 const active=sections.find(s=>s.id===section)!;
 return <section className="discovery-dashboard-v704" aria-label="Music Discovery Dashboard">
  <header className="discovery-head-v704"><div><span className="recent-insight-kicker-v673">V704 / MUSIC DISCOVERY</span><h3>Deine Musik neu entdecken<span>.</span></h3><p>Spannende Muster aus deinen tatsächlich gespeicherten Spotify-Wiedergaben.</p></div><button type="button" disabled={loading} onClick={()=>setUpdated(v=>v+1)}>Archiv neu einlesen</button></header>
  {loading&&<p role="status">Spotify-Konto und lokales Musikarchiv prüfen …</p>}
  {!loading&&error&&<p role="alert" className="discovery-alert-v704">{error} Das gespeicherte Archiv wurde nicht verändert.</p>}
  {!loading&&!error&&!archive&&<div className="discovery-empty-v704"><h4>Du hast noch kein aktiviertes Musikarchiv.</h4><p>Speichere zunächst deine Wiedergaben unter „Mein Archiv“. Erst dann sind längerfristige Entdeckungen möglich.</p><button type="button" onClick={onOpenArchive}>Mein Archiv öffnen</button></div>}
  {!loading&&!error&&discoveries&&<>
   <div className="discovery-metrics-v704"><div><strong>{discoveries.validEvents.toLocaleString('de-AT')}</strong><span>Archivierte Ereignisse</span></div><div><strong>{discoveries.last30.toLocaleString('de-AT')}</strong><span>Letzte 30 Kalendertage</span></div><div><strong>{discoveries.comebacks.length}</strong><span>Comebacks (max. 12)</span></div><div><strong>{discoveries.onRepeat.length}</strong><span>Repeat-Songs (max. 12)</span></div></div>
   <div className="discovery-tabs-v704" role="group" aria-label="Entdeckungsansicht wählen">{sections.map(s=><button type="button" key={s.id} aria-pressed={section===s.id} className={section===s.id?'is-selected':''} onClick={()=>setSection(s.id)}>{s.title}</button>)}</div>
   <section className="discovery-content-v704" aria-live="polite"><h4>{active.title}</h4><p>{active.hint}</p>
    {section==='artistChanges'?discoveries.comparisonAvailable?(discoveries.artistChanges.length?<ol className="discovery-artist-list-v704">{discoveries.artistChanges.map(a=><li key={a.name}><div><strong>{a.name}</strong><small>{a.recent} von {discoveries.last30} Ereignissen zuletzt · zuvor {a.previous} von {discoveries.previous30}</small></div><span>+{a.deltaPoints} Prozentpunkte</span></li>)}</ol>:<p className="discovery-empty-v704">Im gespeicherten Verlauf ist derzeit keine deutliche Zunahme eines Künstler-Credits erkennbar.</p>):<p className="discovery-empty-v704">Für einen Vergleich werden mindestens acht archivierte Ereignisse in jedem der beiden 30-Tage-Zeiträume benötigt. Aktuell: {discoveries.last30} / {discoveries.previous30}.</p>
    :<DiscoverySongsV704 items={discoveries[section]} section={section}/>}
   </section>
   <p className="discovery-disclaimer-v704">Grundlage sind ausschließlich <strong>{discoveries.validEvents} gültige archivierte Wiedergabeereignisse</strong> dieses Spotify-Kontos (Archivstand: {fmt(archive!.savedAt)}). Die Kategorien zeigen höchstens zwölf Treffer. „Neu“ bedeutet nur erstmals **in diesem Archiv**. Lücken, Speicherkappung, fehlende Abspielzeiten und unterschiedlich vollständige 30-Tage-Zeiträume können das Ergebnis verzerren. Ein Wiedergabeereignis belegt weder Hörminuten noch einen vollständig gehörten Song. Künstler-Credits werden nicht in einzelne Feature-Künstler zerlegt. Keine externen Empfehlungen, keine neuen API-Abfragen, keine Serverübertragung des Archivs.</p>
  </>}
 </section>;
}
