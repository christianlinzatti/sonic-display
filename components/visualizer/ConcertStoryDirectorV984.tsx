'use client';
import {useEffect,useRef,useState} from 'react';
import {localConcertStoryV984,normalizeConcertStoryV984,immersivePlanFromStoryV984,
 type ConcertStoryV984,type ConcertStoryStyleV984} from '@/lib/aiConcertStoryV984';
import type {SongInsightV983} from '@/lib/aiSongIntelligenceV983';
import type {ImmersivePlanV982} from '@/lib/immersiveAiDirectorV982';
import {PredictiveShowTimelineV985} from './PredictiveShowTimelineV985';
import {AtmosphereDesignerV986} from './AtmosphereDesignerV986';
const sectionLabels={intro:'Intro-Idee',verse:'Verse-Idee',hook:'Hook-Idee',drop:'Drop-Idee',finale:'Finale-Idee'};

/** Opt-in storyboard, not a music-synchronized scheduler. */
export function ConcertStoryDirectorV984({trackId,durationMs,insight,onApply,canApply}:{
 trackId:string;durationMs:number;insight:SongInsightV983;
 onApply:(plan:ImmersivePlanV982)=>void;canApply:boolean;
}){
 const [style,setStyle]=useState<ConcertStoryStyleV984>('cinematic');
 const [story,setStory]=useState<ConcertStoryV984|null>(null);
 const [source,setSource]=useState<'ai'|'local'|null>(null);
 const [busy,setBusy]=useState(false);
 const [applied,setApplied]=useState(false);
 const [message,setMessage]=useState('');
 const serial=useRef(0);
 const abort=useRef<AbortController|null>(null);
 const currentTrack=useRef(trackId);
 currentTrack.current=trackId;
 const currentInsight=useRef(insight);
 currentInsight.current=insight;
 useEffect(()=>{
  serial.current++;abort.current?.abort();abort.current=null;
  setStory(null);setSource(null);setBusy(false);setApplied(false);setMessage('');
 },[trackId,insight]);
 useEffect(()=>()=>{serial.current++;abort.current?.abort();},[]);
 const clear=()=>{serial.current++;abort.current?.abort();abort.current=null;
  setStory(null);setSource(null);setBusy(false);setApplied(false);setMessage('');};
 const local=()=>{clear();setStory(localConcertStoryV984(insight,style));setSource('local');
  setMessage('Lokale Fünf-Akt-Regie erzeugt. Noch keine Show-Einstellungen verändert.');};
 const ask=async()=>{
  clear();
  const c=new AbortController();abort.current=c;
  const run=serial.current,expectedTrack=trackId,expectedInsight=insight;
  setBusy(true);setMessage('KI entwickelt den dramaturgischen Spannungsbogen …');
  try{
   const response=await fetch('/api/ai/concert-story',{
    method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({style,insight}),signal:c.signal,
   });
   const raw:unknown=await response.json();
   if(run!==serial.current||expectedTrack!==currentTrack.current||
    expectedInsight!==currentInsight.current)return;
   const body=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
   if(!response.ok){setMessage(typeof body.error==='string'?body.error:'KI konnte keine Story erstellen.');return;}
   const result=normalizeConcertStoryV984(body.story);
   if(!result){setMessage('KI-Story ungültig. Keine Änderungen übernommen.');return;}
   setStory(result);setSource('ai');
   setMessage('KI-Dramaturgie fertig: fünf virtuelle Szenen zur Vorschau.');
  }catch{
   if(run===serial.current&&!c.signal.aborted)
    setMessage('KI nicht erreichbar. Du kannst die lokale Regie verwenden.');
  }finally{if(run===serial.current){setBusy(false);abort.current=null;}}
 };
 const plan=story?immersivePlanFromStoryV984(story,insight):null;
 return <fieldset className="concert-story-v984" aria-label="V984 AI Concert Story Director">
  <legend>V984 · AI Concert Story Director</legend>
  <p>Aus der Songidee wird eine dramaturgisch zusammenhängende virtuelle Konzertgeschichte:
   Leitmotiv, Spannungsbogen, Kamerakonzept und Szenenübergänge.</p>
  <label htmlFor="concert-story-style-v984">Inszenierung</label>
  <select id="concert-story-style-v984" value={style} disabled={busy} onChange={e=>{
   clear();setStyle(e.target.value as ConcertStoryStyleV984);
  }}>
   <option value="cinematic">Filmisch · Spannungsaufbau</option>
   <option value="festival">Festival · große Steigerung</option>
   <option value="intimate">Intim · ruhige Lichtgeschichte</option>
  </select>
  <div className="concert-story-actions-v984">
   <button type="button" disabled={busy} onClick={()=>void ask()}>{busy?'KI plant …':'KI-Konzertgeschichte entwerfen'}</button>
   <button type="button" onClick={local}>Lokale Konzertgeschichte</button>
  </div>
  <small>Die KI erhält nur die zuvor erstellte Songinterpretation und den gewählten Stil.
   Es werden keine Lyrics, Audiodaten oder Spotify-Zugangsdaten gesendet.
   API-Abfragen sind kostenpflichtig möglich und erfolgen nur auf Klick.</small>
  {message&&<p role="status">{message}</p>}
  {story&&<section aria-label="Konzertgeschichte Vorschau" className="concert-story-preview-v984">
   <h4>{story.title}</h4>
   <p><b>Leitmotiv:</b> {story.motif} <small>· {source==='ai'?'KI-Entwurf':'Lokaler Entwurf'}</small></p>
   <p>{story.arcDescription}</p>
   <ol className="concert-story-acts-v984">{story.acts.map((act,i)=><li key={act.section}>
    <div className="concert-story-act-heading-v984"><b>{i+1}. {act.title}</b>
     <small>{sectionLabels[act.section]} · Energieidee {act.energy}/75</small></div>
    <div className="concert-story-energy-v984" aria-hidden="true"><i style={{width:`${act.energy/75*100}%`}}/></div>
    <p>{act.direction}</p>
    <small><b>Kamera:</b> {act.camera} · <b>Übergang:</b> {act.transition}</small>
   </li>)}</ol>
   <small>Wichtig: Die fünf Akte sind ein <b>Storyboard ohne verifizierte Song-Zeitpunkte</b>.
    Keine automatische zeitgesteuerte Effektfolge, keine echten Lampenbefehle.
    Erst bestätigte Konzert-Timelines dürfen künftig diese Übergänge auslösen.</small>
   <div className="concert-story-actions-v984">
    <button type="button" disabled={!canApply||applied||!plan} onClick={()=>{
     if(!plan)return;onApply(plan);setApplied(true);
     setMessage('Virtuelles Bühnenbild übernommen – die fünf Story-Akte sind weiterhin eine Vorschau.');
    }}>{applied?'Bühnenbild übernommen':'Virtuellen Story-Look übernehmen'}</button>
   </div>
   {!canApply&&<small>Übernahme nur bei aktivierten automatischen Live FX und ohne reduzierte Bewegung.</small>}
   <AtmosphereDesignerV986 key={`${trackId}-${style}`} trackId={trackId} durationMs={durationMs}
    story={story} insight={insight} onApply={onApply} canApply={canApply}/>
   <PredictiveShowTimelineV985 key={trackId} story={story} trackId={trackId} durationMs={durationMs}/>
  </section>}
 </fieldset>;
}
