'use client';
import {useEffect,useRef,useState} from 'react';
import {localSongInsightV983,normalizeSongInsightV983,immersivePlanFromInsightV983,
 type SongInsightV983,type SongContextV983} from '@/lib/aiSongIntelligenceV983';
import type {ImmersivePlanV982} from '@/lib/immersiveAiDirectorV982';
import {ConcertStoryDirectorV984} from './ConcertStoryDirectorV984';
const phaseNames={intro:'Intro',verse:'Verse',hook:'Hook',drop:'Drop-Idee',finale:'Finale'};
const moodNames={dark:'Dunkel / cineastisch',energetic:'Energetisch',anthemic:'Arena',dreamy:'Verträumt',warm:'Warm',neutral:'Neutral'};
export function SongIntelligencePanelV983({trackId,title,artist,genre,durationMs,onApply,canApply}: {
 trackId:string;title:string;artist:string;genre:string;durationMs:number;
 onApply:(plan:ImmersivePlanV982)=>void;canApply:boolean;
}){
 const [insight,setInsight]=useState<SongInsightV983|null>(null);
 const [source,setSource]=useState<'ai'|'local'|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [applied,setApplied]=useState(false);
 const abort=useRef<AbortController|null>(null);
 const serial=useRef(0);
 const currentTrack=useRef(trackId);
 currentTrack.current=trackId;
 useEffect(()=>{serial.current++;abort.current?.abort();abort.current=null;
  setBusy(false);setInsight(null);setSource(null);setMessage('');setApplied(false);
 },[trackId,title,artist,durationMs,genre]);
 useEffect(()=>()=>{serial.current++;abort.current?.abort();},[]);
 const context:SongContextV983={title,artist,genre,durationMs};
 const valid=title.trim().length>0&&artist.trim().length>0&&Number.isFinite(durationMs)&&durationMs>=15000;
 const local=()=>{
  serial.current++;abort.current?.abort();abort.current=null;
  setBusy(false);setInsight(localSongInsightV983(context));setSource('local');setApplied(false);
  setMessage('Lokaler, regelbasierter Vorschlag – keine KI-Abfrage.');
 };
 const analyze=async()=>{
  if(!valid){setMessage('Songdaten fehlen.');return;}
  serial.current++;abort.current?.abort();
  const controller=new AbortController();abort.current=controller;
  const run=serial.current,expectedTrack=trackId;
  setBusy(true);setInsight(null);setApplied(false);setMessage('Metadaten werden für eine KI-Idee gesendet …');
  try{
   const response=await fetch('/api/ai/song-intelligence',{method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},body:JSON.stringify(context),signal:controller.signal});
   const result:unknown=await response.json();
   if(run!==serial.current||expectedTrack!==currentTrack.current)return;
   const data=result&&typeof result==='object'?result as Record<string,unknown>:{};
   if(!response.ok){setMessage(typeof data.error==='string'?data.error:'KI konnte keine Song-Idee liefern.');return;}
   const normalized=normalizeSongInsightV983(data.insight);
   if(!normalized){setMessage('Ungültige KI-Antwort. Nichts übernommen.');return;}
   setInsight(normalized);setSource('ai');setMessage('Entwurf fertig. Bühne und reale Lichter bleiben unverändert.');
  }catch(error){if(run===serial.current&&!controller.signal.aborted)
    setMessage('KI nicht erreichbar. Die lokale Song-Idee bleibt verfügbar.');}
  finally{if(run===serial.current){setBusy(false);abort.current=null;}}
 };
 const plan=insight?immersivePlanFromInsightV983(insight):null;
 return <fieldset className="song-intelligence-v983" aria-label="V983 AI Song Intelligence">
  <legend>V983 · AI Song Intelligence</legend>
  <p>Songbezogene Konzertidee mit bewusstem Opt-in. Die KI erhält nur die sichtbaren Metadaten – keine Musikaufnahme.</p>
  <p className="song-intelligence-track-v983"><b>{title}</b> · {artist}<br/>
   <small>{genre||'Genre unbekannt'} · {Math.floor(Math.max(0,durationMs)/60000)} min Laufzeit</small></p>
  <div className="song-intelligence-actions-v983">
   <button type="button" disabled={!valid||busy} onClick={()=>void analyze()}>{busy?'KI denkt …':'Song mit KI interpretieren'}</button>
   <button type="button" disabled={!valid} onClick={local}>Lokale Song-Idee</button>
  </div>
  <small>Nur nach Klick: Titel, Künstler, Genre und Laufzeit an OpenAI. Keine Lyrics, Audiodaten,
   Spotify-Zugangsdaten oder Hörverläufe. Anfrage kann API-Kosten verursachen. Die KI kennt
   keine gemessenen BPM und keine verifizierten Songabschnitte.</small>
  {message&&<p role="status">{message}</p>}
  {insight&&<section className="song-intelligence-preview-v983" aria-label="Song-Interpretation">
   <p><strong>{insight.direction}</strong> <small>{source==='ai'?'KI-Interpretation':'Lokale Regelidee'}</small></p>
   <p><b>Stimmungs-Idee:</b> {moodNames[insight.mood]} · <b>Genre-Hinweis:</b> {insight.genreHint}</p>
   <p>{insight.explanation}</p>
   <p><small>Datengrundlage: ausschließlich Metadaten. Konfidenz: kreative Schätzung.
    BPM: nicht gemessen. Abschnittszeiten: nicht verifiziert.</small></p>
   <ol>{insight.phases.map(p=><li key={p.section}>
    <b>{phaseNames[p.section]}</b> · vorgeschlagene Energie {p.energy}/75 – {p.idea}
   </li>)}</ol>
   <small>Die fünf Phasen sind <b>keine erkannte Songstruktur</b> und lösen keine zeitgesteuerten Effekte aus.
    Erst verifizierte Timelines dürfen spätere Effekte auslösen. Keine Hardware-Kommandos.</small>
   <div className="song-intelligence-actions-v983">
    <button type="button" disabled={!canApply||applied||!plan} onClick={()=>{
     if(plan){onApply(plan);setApplied(true);setMessage('Virtueller Song-Look übernommen; keine echte Beleuchtung geändert.');}
    }}>{applied?'Show-Look übernommen':'Virtuellen Song-Look übernehmen'}</button>
   </div>
   {!canApply&&<small>Übernahme nur mit aktivierter automatischer Show und ohne reduzierte Bewegung.</small>}
   <ConcertStoryDirectorV984 trackId={trackId} insight={insight} durationMs={durationMs} onApply={onApply} canApply={canApply}/>
  </section>}
 </fieldset>;
}
