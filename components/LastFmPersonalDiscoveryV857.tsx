'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import type {V711TimeZone} from '@/lib/lastfm-intelligence-v711';
import {availableInsightMonthsV856} from '@/lib/lastfm-monthly-insights-v856';
import {genreTrendsV857,personalDiscoveryV857,validateGenreResponseV857,type V857GenreEvidence} from '@/lib/lastfm-personal-discovery-v857';
import {MUSIC_GENRES,isMusicGenre} from '@/config/musicGenres';

type Props={events:readonly LastFmEventV706[];onOpenArtist?:(artist:string)=>void};
const dateLabel=(key:string)=>new Intl.DateTimeFormat('de-AT',{month:'short',year:'2-digit',timeZone:'UTC'}).format(new Date(`${key}-01T12:00:00Z`));
const format=(n:number)=>n.toLocaleString('de-AT');
const genreLabel=(g:string)=>isMusicGenre(g)?MUSIC_GENRES[g].label:g;
const genreColor=(g:string)=>isMusicGenre(g)?MUSIC_GENRES[g].accent:'#7d9caf';

/** Uses V713 account-scoped history; genre API lookups happen ONLY after an explicit user click. */
export function LastFmPersonalDiscoveryV857({events,onOpenArtist}:Props){
 const [chosen,setChosen]=useState('');
 const [zone,setZone]=useState<V711TimeZone>('Europe/Vienna');
 const [expanded,setExpanded]=useState(true);
 const [loading,setLoading]=useState(false);
 const [attempted,setAttempted]=useState(false);
 const [failed,setFailed]=useState(0);
 const [progress,setProgress]=useState(0);
 const [totalRequested,setTotalRequested]=useState(0);
 const [revision,setRevision]=useState(0);
 const cached=useRef(new Map<string,V857GenreEvidence>());
 const controller=useRef<AbortController|null>(null);
 useEffect(()=>()=>{controller.current?.abort();},[]);
 const months=useMemo(()=>availableInsightMonthsV856(events,new Date(),zone),[events,zone]);
 const selected=months.includes(chosen)?chosen:months[0];
 const data=useMemo(()=>personalDiscoveryV857(events,selected,new Date(),zone),[events,selected,zone]);
 const trend=useMemo(()=>genreTrendsV857(events,data.months,cached.current,new Date(),zone),[events,data.months,zone,revision]);
 const covered=trend.reduce((sum,m)=>sum+m.covered,0);
 const total=trend.reduce((sum,m)=>sum+m.total,0);
 const matched=data.samples.filter(s=>cached.current.has(s.key)).length;
 const monthNow=trend[trend.length-1];
 const ranked=monthNow?.genres.slice(0,5)??[];
 const identified=[...cached.current.values()].filter(v=>v.genre).length;
 async function loadGenres(){
  if(loading)return;
  const work=data.samples.filter(s=>!cached.current.has(s.key));
  if(!work.length){setAttempted(true);return;}
  controller.current?.abort();const ctrl=new AbortController();controller.current=ctrl;
  setLoading(true);setAttempted(true);setFailed(0);setProgress(0);setTotalRequested(work.length);
  let cursor=0;let failures=0;let completed=0;
  const worker=async()=>{while(!ctrl.signal.aborted){
   const index=cursor++;if(index>=work.length)return;
   const item=work[index];
   try{
    const params=new URLSearchParams({artist:item.artist,track:item.title});
    const response=await fetch(`/api/genre?${params.toString()}`,{signal:ctrl.signal,headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Genre-Dienst antwortet nicht.');
    const json:unknown=await response.json();
    const evidence=validateGenreResponseV857(json);
    if(!evidence)throw new Error('Genre-Metadaten fehlen oder sind unklar.');
    if(ctrl.signal.aborted)return;
    cached.current.set(item.key,evidence);
   }catch{if(ctrl.signal.aborted)return;failures++;}finally{
    if(!ctrl.signal.aborted){completed++;setProgress(completed);setFailed(failures);setRevision(n=>n+1);}
   }
  }};
  try{await Promise.all(Array.from({length:Math.min(3,work.length)},()=>worker()));}
  finally{if(!ctrl.signal.aborted)setLoading(false);}
 }
 return <section className="lastfm-discovery-v857" id="lastfm-discovery-v857" aria-label="Persönliche Musikgeschmacks-Analyse">
  <header className="lastfm-discovery-header-v857">
   <div><span className="lastfm-discovery-eyebrow-v857">V857 · PERSONAL MUSIC DISCOVERY</span><h4>Dein Musik-Radar<span>.</span></h4><p>Welche Künstler gewinnen an Bedeutung – und welche Genres sind in deinen tatsächlich erkannten Songs vertreten?</p></div>
   <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(x=>!x)}>{expanded?'Einklappen':'Radar öffnen'} {expanded?'⌃':'⌄'}</button>
  </header>
  {expanded&&<>
   <div className="lastfm-discovery-controls-v857"><label>Monat<select value={selected} onChange={(e:{target:{value:string}})=>setChosen(e.target.value)}>{months.map(m=><option key={m} value={m}>{dateLabel(m)}</option>)}</select></label><label>Zeitzone<select value={zone} onChange={(e:{target:{value:string}})=>{setZone(e.target.value==='UTC'?'UTC':'Europe/Vienna');setChosen('');}}><option value="Europe/Vienna">Wien</option><option value="UTC">UTC</option></select></label></div>
   <div className="lastfm-discovery-stats-v857"><div><strong>{format(data.currentPlays)}</strong><small>Scrobbles im Monat</small></div><div><strong>{data.artists.length}</strong><small>Favoriten im Aufwind</small></div><div><strong>{data.newArtists.length}</strong><small>Erstmals erfasste Künstler</small></div><div><strong>{data.uniqueTracks}</strong><small>Unterschiedliche Songs · 6 Monate</small></div></div>
   <div className="lastfm-discovery-grid-v857">
    <div className="lastfm-discovery-card-v857"><div className="lastfm-discovery-card-head-v857"><h5>Favoriten im Aufwind</h5><span>Anteil gegenüber den 3 Vormonaten</span></div>
     {data.artists.length?<ol className="lastfm-discovery-artist-list-v857">{data.artists.map((a,i)=><li key={a.artist}><span className="lastfm-discovery-number-v857">{String(i+1).padStart(2,'0')}</span><div><strong>{a.artist}</strong><small>{a.before} → {a.plays} Scrobbles · {Math.round(a.share*100)} % der aktuellen Plays</small></div><b>+{a.changePoints.toFixed(1)} Pp.</b>{onOpenArtist&&<button type="button" onClick={()=>onOpenArtist(a.artist)} aria-label={`${a.artist} in der History öffnen`}>↗</button>}</li>)}</ol>:<p className="lastfm-discovery-empty-v857">Noch keine belastbare Zunahme. Dafür braucht es mindestens zehn erfasste Wiedergaben im gewählten Monat und im vorherigen Dreimonatszeitraum.</p>}
    </div>
    <div className="lastfm-discovery-card-v857"><div className="lastfm-discovery-card-head-v857"><h5>Neu in deiner History</h5><span>Erstmals erfasst · mind. 3 Scrobbles</span></div>
     {data.newArtists.length?<ol className="lastfm-discovery-artist-list-v857">{data.newArtists.map((a,i)=><li key={a.artist}><span className="lastfm-discovery-number-v857">{String(i+1).padStart(2,'0')}</span><div><strong>{a.artist}</strong><small>Erstmals im gespeicherten Verlauf dieses Monats</small></div><b>{a.plays}×</b>{onOpenArtist&&<button type="button" onClick={()=>onOpenArtist(a.artist)} aria-label={`${a.artist} in der History öffnen`}>↗</button>}</li>)}</ol>:<p className="lastfm-discovery-empty-v857">In diesem Monat keine neuen Künstler mit mindestens drei erfassten Scrobbles.</p>}
    </div>
   </div>
   <div className="lastfm-discovery-card-v857 lastfm-discovery-genre-v857">
    <div className="lastfm-discovery-card-head-v857"><div><h5>Genre-Kompass</h5><p>Nur Metadaten aus Last.fm-Tags. Keine Genre-Schätzung anhand von Titeln oder Künstlernamen.</p></div><span>{covered} / {total} Scrobbles zugeordnet</span></div>
    <div className="lastfm-discovery-fetch-v857"><button type="button" disabled={loading||!data.samples.length} onClick={()=>{void loadGenres();}}>{loading?'Genre-Daten werden geprüft …':!attempted?'Genre-Metadaten abrufen':'Weitere Genre-Daten abrufen'}</button><span>{matched}/{data.samples.length} ausgewählte Songs geprüft · {identified} Treffer im Sitzungscache</span></div>
    {loading&&<p role="status" className="lastfm-discovery-status-v857">Prüfe Metadaten für bis zu 6 Songs je Monat (maximal 36). Fortschritt: {progress}/{totalRequested} Abfragen dieser Runde.</p>}
    {attempted&&failed>0&&<p role="status" className="lastfm-discovery-status-v857">{failed} Abfrage(n) waren nicht auswertbar. Prüfe die Last.fm-API-Konfiguration oder versuche es später erneut.</p>}
    {!attempted?<p className="lastfm-discovery-empty-v857">Die Genre-Analyse startet erst nach deinem Klick. Sie fragt höchstens 36 repräsentative Titel über den vorhandenen Genre-Dienst ab. Dabei werden Künstler und Songtitel an Last.fm übertragen.</p>:<>
     {covered?<><div className="lastfm-discovery-genre-months-v857" role="img" aria-label="Monatliche Verteilung bekannter Genre-Tags in abgedeckten Scrobbles">{trend.map(m=><div className="lastfm-discovery-genre-row-v857" key={m.month}><span>{dateLabel(m.month)}</span><div className="lastfm-discovery-track-v857">{m.genres.map(g=><i key={g.genre} title={`${genreLabel(g.genre)}: ${g.plays} erkannte Scrobbles`} style={{width:`${m.covered?g.plays/m.covered*100:0}%`,background:genreColor(g.genre)}}/>)}</div><small>{m.covered}/{m.total}</small></div>)}</div><div className="lastfm-discovery-genre-legend-v857">{ranked.map(g=><span key={g.genre}><i style={{background:genreColor(g.genre)}}/>{genreLabel(g.genre)} · {g.plays}×</span>)}</div></>:<p className="lastfm-discovery-empty-v857">Für die bisher geprüften Titel liegen noch keine ausreichend eindeutigen Genre-Tags vor.</p>}
    </>}
    <p className="lastfm-discovery-footnote-v857">Die Farben zeigen ausschließlich den Anteil innerhalb der <strong>erkannten</strong> Wiedergaben. Nicht abgefragte oder unklare Songs bleiben unzugeordnet. Bei Artist-Tags gilt die Zuordnung nur als grober Hinweis. Genre-Trends sind bei niedriger Abdeckung nicht repräsentativ. Alles andere wird lokal aus deinem Archiv berechnet; keine neue Scrobble-Speicherung.</p>
   </div>
  </>}
 </section>;
}
