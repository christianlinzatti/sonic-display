'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import type {V711TimeZone} from '@/lib/lastfm-intelligence-v711';
import {validateGenreResponseV857,type V857GenreEvidence} from '@/lib/lastfm-personal-discovery-v857';
import {buildGenreEvolutionV862,genreChangeV862,type V862Mode} from '@/lib/lastfm-genre-evolution-v862';
import {isMusicGenre,MUSIC_GENRES} from '@/config/musicGenres';

type Props={events:readonly LastFmEventV706[]};
const number=(n:number)=>n.toLocaleString('de-AT');
const percent=(part:number,total:number)=>total?`${Math.round(part/total*100)} %`:'0 %';
const name=(genre:string)=>isMusicGenre(genre)?MUSIC_GENRES[genre].label:genre;
const color=(genre:string)=>isMusicGenre(genre)?MUSIC_GENRES[genre].accent:'#94a3b8';
const label=(period:string)=>period.length===4?period:new Intl.DateTimeFormat('de-AT',{month:'short',year:'2-digit',timeZone:'UTC'}).format(new Date(`${period}-01T12:00:00Z`));
/** Explicit opt-in Last.fm enrichment only. Genre results are ephemeral and never alter history or Spotify playback. */
export function LastFmGenreEvolutionV862({events}:Props){
 const [mode,setMode]=useState<V862Mode>('months');
 const [zone,setZone]=useState<V711TimeZone>('Europe/Vienna');
 const [selection,setSelection]=useState('');
 const [genreFilter,setGenreFilter]=useState('');
 const [revision,setRevision]=useState(0);
 const [busy,setBusy]=useState(false);
 const [progress,setProgress]=useState(0);
 const [requestTotal,setRequestTotal]=useState(0);
 const [errors,setErrors]=useState(0);
 const [attempted,setAttempted]=useState(false);
 const cached=useRef(new Map<string,V857GenreEvidence>());
 const controller=useRef<AbortController|null>(null);
 useEffect(()=>()=>controller.current?.abort(),[]);
 const summary=useMemo(()=>buildGenreEvolutionV862(events,cached.current,mode,new Date(),zone),[events,mode,zone,revision]);
 const selected=summary.buckets.find(b=>b.period===selection)??summary.buckets[summary.buckets.length-1];
 const index=summary.buckets.findIndex(b=>b.period===selected?.period);
 const previous=index>0?summary.buckets[index-1]:undefined;
 const top=selected?.genres??[];
 const relevant=genreFilter?top.filter(g=>g.genre===genreFilter):top;
 const checked=summary.samples.filter(t=>cached.current.has(t.key)).length;
 const pending=summary.samples.filter(t=>!cached.current.has(t.key));
 const change=genreFilter?genreChangeV862(previous,selected,genreFilter):null;
 async function enrich(){
  if(busy||!pending.length){setAttempted(true);return;}
  controller.current?.abort();const ctrl=new AbortController();controller.current=ctrl;
  setBusy(true);setProgress(0);setErrors(0);setAttempted(true);setRequestTotal(pending.length);
  let next=0,finished=0,failed=0;
  const worker=async()=>{while(!ctrl.signal.aborted){
   const pos=next++;if(pos>=pending.length)return;
   const item=pending[pos];
   try{
    const response=await fetch(`/api/genre?${new URLSearchParams({artist:item.artist,track:item.title})}`,{signal:ctrl.signal,headers:{Accept:'application/json'}});
    if(!response.ok)throw Error('Der Last.fm-Genre-Dienst ist nicht erreichbar.');
    const json:unknown=await response.json();const evidence=validateGenreResponseV857(json);
    if(!evidence)throw Error('Kein verlässliches Genre-Metadatum erhalten.');
    if(!ctrl.signal.aborted)cached.current.set(item.key,evidence);
   }catch{if(!ctrl.signal.aborted)failed++;}
   finally{if(!ctrl.signal.aborted){finished++;setProgress(finished);setErrors(failed);}}
  }};
  try{await Promise.all(Array.from({length:Math.min(3,pending.length)},()=>worker()));}finally{if(!ctrl.signal.aborted){setRevision(n=>n+1);setBusy(false);}}
 }
 function changeMode(value:V862Mode){if(busy)return;setMode(value);setSelection('');setGenreFilter('');setAttempted(false);}
 function changeZone(value:V711TimeZone){if(busy)return;setZone(value);setSelection('');setAttempted(false);}
 return <section id="lastfm-genre-evolution-v862" className="lastfm-genre-evolution-v862" aria-label="Genre Evolution Studio">
  <header className="lastfm-genre-head-v862"><div><small>V862 · GENRE EVOLUTION STUDIO</small><h4>Deine Musik. <em>Im Wandel.</em></h4><p>Wie sich deine nachgewiesenen Genre-Tags über Monate und Jahre verteilen – mit sichtbaren Datenlücken.</p></div></header>
  <div className="lastfm-genre-tools-v862"><div role="group" aria-label="Genre-Zeitraum"><button type="button" aria-pressed={mode==='months'} disabled={busy} onClick={()=>changeMode('months')}>24 Monate</button><button type="button" aria-pressed={mode==='years'} disabled={busy} onClick={()=>changeMode('years')}>10 Jahre</button></div><label>Zeitzone <select disabled={busy} value={zone} onChange={(e:{target:{value:string}})=>changeZone(e.target.value==='UTC'?'UTC':'Europe/Vienna')}><option value="Europe/Vienna">Wien</option><option value="UTC">UTC</option></select></label></div>
  <div className="lastfm-genre-stats-v862"><article><small>Archivierte Scrobbles</small><strong>{number(summary.total)}</strong></article><article><small>Mit Genre-Metadaten</small><strong>{number(summary.covered)}</strong></article><article><small>Abdeckung</small><strong>{percent(summary.covered,summary.total)}</strong></article><article><small>Song-/Künstler-Tags</small><strong>{number(summary.trackBased)} / {number(summary.artistBased)}</strong></article></div>
  <div className="lastfm-genre-fetch-v862"><button type="button" disabled={busy||!pending.length} onClick={()=>{void enrich();}}>{busy?'Tags werden geprüft …':!attempted?'Genre-Metadaten freiwillig laden':'Weitere Genre-Tags prüfen'}</button><span>{checked} von {summary.samples.length} ausgewählten Songs geprüft · höchstens {summary.maxLookups} pro Ansicht</span></div>
  {busy&&<p role="status">Metadatenabfragen: {progress}/{requestTotal} · maximal drei gleichzeitig.</p>}
  {attempted&&errors>0&&<p role="status">{errors} Abfrage(n) fehlgeschlagen oder unklar. Sie wurden nicht als Genre-Ergebnis gespeichert und können erneut geprüft werden.</p>}
  <p className="lastfm-genre-help-v862">Das Abrufen startet nur nach einem Klick. Dabei werden Künstler- und Songnamen über den bestehenden Genre-Dienst an Last.fm übermittelt. Die Abfrage ist auf ausgewählte Songs begrenzt; die gesamte History wird nicht hochgeladen.</p>
  <div className="lastfm-genre-plot-v862"><div className="lastfm-genre-plot-head-v862"><h5>Genre-Zeitreise</h5><label>Genre-Fokus <select value={summary.genres.some(g=>g.genre===genreFilter)?genreFilter:''} onChange={(e:{target:{value:string}})=>setGenreFilter(e.target.value)}><option value="">Alle erkannten Genres</option>{summary.genres.map(g=><option key={g.genre} value={g.genre}>{name(g.genre)}</option>)}</select></label></div>
   <div className="lastfm-genre-periods-v862" role="group" aria-label="Zeiträume zur Genre-Analyse auswählen">{summary.buckets.map(b=>{
    const visible=b.genres.filter(g=>!genreFilter||g.genre===genreFilter);return <button type="button" key={b.period} aria-pressed={selected?.period===b.period} onClick={()=>setSelection(b.period)} aria-label={`${label(b.period)}, ${number(b.covered)} von ${number(b.total)} Scrobbles mit Genrezuordnung`}><span className="lastfm-genre-bar-v862">{b.covered>0?visible.map(g=><i key={g.genre} style={{height:`${Math.max(0,g.plays/b.covered*100)}%`,background:color(g.genre)}} title={`${name(g.genre)}: ${number(g.plays)} von ${number(b.covered)} zugeordneten Scrobbles`}/>):<i className="lastfm-genre-no-data-v862"/>}</span><small>{label(b.period)}</small><b>{b.covered?percent(b.covered,b.total):'–'}</b></button>;
   })}</div><p className="lastfm-genre-help-v862">Balkenhöhen zeigen die Verteilung <strong>innerhalb zugeordneter Scrobbles</strong>. Die Prozentzahl unter jedem Balken zeigt, wie viel vom gesamten Archiv des Zeitraums überhaupt zugeordnet ist. „–“ bedeutet keine gültige Zuordnung, nicht null Musik.</p>
  </div>
  <div className="lastfm-genre-details-v862"><article><small>AUSGEWÄHLTER ZEITRAUM</small><h5>{selected?label(selected.period):'Keine Daten'}</h5><strong>{number(selected?.covered??0)} / {number(selected?.total??0)} Scrobbles</strong><p>{selected?.covered?`Davon ${selected.trackBased} mit Song-Tags und ${selected.artistBased} mit weniger spezifischen Künstler-Tags.`:'Noch keine verlässlichen Genre-Tags in diesem Zeitraum. Eine fehlende Zuordnung ist keine Aussage über deinen tatsächlichen Musikgeschmack.'}</p>{change&&<p>Veränderung für {name(genreFilter)} zum vorigen Zeitraum: {change.percentagePoints>0?'+':''}{change.percentagePoints.toFixed(1).replace('.',',')} Prozentpunkte <small>(nur unter den zugeordneten Scrobbles)</small></p>}</article><article><small>BEKANNTE GENRES</small><h5>Genre-Verteilung</h5>{relevant.length?<ol>{relevant.slice(0,10).map(g=><li key={g.genre}><span><i style={{background:color(g.genre)}}/>{name(g.genre)}</span><strong>{number(g.plays)} · {Math.round(g.share*100)} %</strong></li>)}</ol>:<p>Für diese Auswahl keine belegten Genre-Metadaten vorhanden.</p>}</article></div>
  <p className="lastfm-genre-footer-v862">Wichtig: Das sind <strong>Stichproben</strong>, keine vollständige automatische Genreklassifikation. Nur geprüfte Last.fm-Tags zählen. Niedrige Abdeckung, artistbasierte Tags, unvollständige Archive und wiederholte Songs können Trends verzerren. „Deutschrock“ wird nur dann als eigenständige Stilrichtung ausgewiesen, wenn die Genre-Registry ihn kennt – aktuell läuft dieses Tag in der vorhandenen Rock-Kategorie. Keine automatischen Spotify-Aktionen oder Änderungen am Scrobble-Archiv.</p>
 </section>;
}
