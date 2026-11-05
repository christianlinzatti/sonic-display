'use client';
import {useEffect,useMemo,useState} from 'react';
import type {ConcertStoryV984} from '@/lib/aiConcertStoryV984';
import {importPredictiveCuesV985,previewPredictiveCuesV985,proposePredictiveCuesV985,
 verifiedConcertSnapshotV985} from '@/lib/predictiveShowTimelineV985';
import {CONCERT_TIMELINE_EVENT_V763,getConcertTimelineV763} from './concertTimelineBridgeV763';
import {SHOW_TIMELINE_EVENT_V354,readTimelineV354,saveTimelineV354} from '../../services/stageContent/showTimelineV354';
import {createConcertSongV764} from '../../services/stageContent/concertTimelineAutomationV764';
const fmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
/** V985: opt-in authoring UI. No direct cue execution, Govee API or artificial audio timing. */
export function PredictiveShowTimelineV985({story,trackId,durationMs}:{story:ConcertStoryV984;trackId:string;durationMs:number}){
 const [snapshot,setSnapshot]=useState(getConcertTimelineV763);
 const [score,setScore]=useState(readTimelineV354);
 const [selected,setSelected]=useState<string[]>([]);
 const [message,setMessage]=useState('');
 useEffect(()=>{
  const sync=()=>setSnapshot(getConcertTimelineV763());
  const updateScore=()=>setScore(readTimelineV354());
  window.addEventListener(CONCERT_TIMELINE_EVENT_V763,sync);
  window.addEventListener(SHOW_TIMELINE_EVENT_V354,updateScore);
  return ()=>{window.removeEventListener(CONCERT_TIMELINE_EVENT_V763,sync);
   window.removeEventListener(SHOW_TIMELINE_EVENT_V354,updateScore);};
 },[]);
 useEffect(()=>{setSelected([]);setMessage('');},[trackId,story]);
 const verified=verifiedConcertSnapshotV985(snapshot,trackId,durationMs);
 const cues=useMemo(()=>proposePredictiveCuesV985(snapshot,story,trackId,durationMs),[snapshot,story,trackId,durationMs]);
 const ready=verified&&score.trackId===trackId&&score.durationMs===durationMs;
 const preview=previewPredictiveCuesV985(cues,snapshot?.progressMs??0,snapshot?.playing===true,verified);
 const toggle=(id:string,yes:boolean)=>setSelected(prev=>yes?[...prev.filter(x=>x!==id),id]:prev.filter(x=>x!==id));
 const create=()=>{
  if(!verified)return;
  if(score.clips.length>0&&!window.confirm('Vorhandene Show wechseln? Sie wird vor dem Wechsel zuerst sicher in die Konzertbibliothek gespeichert.'))return;
  setMessage(createConcertSongV764(trackId,durationMs)?'Song-Timeline angelegt (inaktiv). Bitte Vorschläge auswählen und überprüfen.':'Anlegen fehlgeschlagen; bestehende Show wurde nicht ersetzt.');
  setScore(readTimelineV354());
 };
 const apply=()=>{
  // Re-fetch the real bridge at the moment of approval. Old or changed tracks fail closed.
  const current=getConcertTimelineV763(),latest=readTimelineV354();
  if(!verifiedConcertSnapshotV985(current,trackId,durationMs)||
   latest.trackId!==trackId||latest.durationMs!==durationMs){
   setMessage('Song-/Timeline-Abgleich fehlgeschlagen. Keine Änderung.');return;
  }
  const result=importPredictiveCuesV985(latest,current,story,selected);
  if(!result.added){setMessage(`Keine Cues übernommen (${result.conflicts} Konflikte, ${result.invalid} ungültige Vorschläge).`);return;}
  saveTimelineV354(result.score);
  const stored=readTimelineV354();
  // No false success when localStorage is blocked. Never enable an inactive show.
  if(JSON.stringify(stored)!==JSON.stringify(result.score)){
   setMessage('Speicherung nicht bestätigt – bitte Speicherzugriff prüfen.');return;
  }
  setScore(stored);setSelected([]);
  setMessage(`${result.added} geprüfte Cues übernommen; ${result.conflicts} Konflikte übersprungen. `+
   (stored.enabled?'Vorhandene aktivierte V354-Timeline steuert die Wiedergabe.':'V354-Timeline bleibt inaktiv; Aktivierung erfolgt separat im Show-Timeline-Editor.'));
 };
 return <fieldset className="predictive-show-timeline-v985" aria-label="V985 Predictive Show Timeline">
  <legend>V985 · Predictive Show Timeline</legend>
  <p>Die fünf Story-Akte färben vorhandene bestätigte Szenen. Ein Blick auf den nächsten Einsatz ist
   bis zu zwei Sekunden vorher möglich; ausgelöst wird ausschließlich zur bestätigten Songposition über die bestehende V354-Timeline.</p>
  {!verified?<p role="status">Keine bestätigte V604/V763-Szenen-Timeline für diesen Song verfügbar.
   KI-Metadaten allein erzeugen keine zeitgesteuerten Effekte.</p>:<>
   <p><b>{cues.length} Vorschläge</b> aus bestätigten Szenengrenzen · Quelle: V604 via V763 ·
    Status: {snapshot?.playing?'Wiedergabe':'Pausiert'}</p>
   {preview.state==='upcoming'&&preview.next&&<p role="status">Demnächst: {preview.next.clip.label} in {preview.secondsUntil} s – nur Vorschau.</p>}
   {preview.state==='live'&&preview.next&&<p role="status">Aktuelle bestätigte Szene: {preview.next.clip.label}.</p>}
   {!ready?<><p>Zum Freigeben der Vorschläge muss zunächst eine passende V354-Songshow geöffnet werden.</p>
    <button type="button" onClick={create}>Songshow sicher anlegen (inaktiv)</button></>:<>
    <p><small>Show: {score.enabled?'aktiv':'inaktiv'} · Manuelle/ältere Cues bleiben erhalten. Überschneidungen werden ausgelassen. Keine echten Govee-Befehle.</small></p>
    <div style={{maxHeight:240,overflowY:'auto',margin:'6px 0'}} aria-label="Prüfbare zeitliche V985-Cues">
     {cues.map(({clip,section,reason,storyAct})=>{
      const conflict=score.clips.some(c=>c.id===clip.id||c.lane===clip.lane&&c.startMs<clip.startMs+clip.durationMs&&clip.startMs<c.startMs+c.durationMs);
      return <label key={clip.id} style={{display:'block',padding:'5px 0'}}>
       <input type="checkbox" disabled={conflict} checked={selected.includes(clip.id)&&!conflict}
        onChange={e=>toggle(clip.id,e.target.checked)}/>
       <b>{fmt(clip.startMs)}</b> · Akt {storyAct} · {section} · {clip.lane} · {String(clip.value)}
       <small> – {conflict?'Konflikt mit vorhandener Show':reason}</small>
      </label>;
     })}
    </div>
    <button type="button" onClick={()=>setSelected(cues.filter(({clip})=>!score.clips.some(x=>x.id===clip.id||x.lane===clip.lane&&x.startMs<clip.startMs+clip.durationMs&&clip.startMs<x.startMs+x.durationMs)).map(x=>x.clip.id))}>Konfliktfreie auswählen</button>{' '}
    <button type="button" onClick={()=>setSelected([])}>Auswahl aufheben</button>{' '}
    <button type="button" disabled={!selected.length} onClick={apply}>Ausgewählte Cues nach Prüfung übernehmen</button>
   </>}
  </>}
  {message&&<p role="status">{message}</p>}
  <small>Keine BPM-Erkennung, keine KI-generierten Zeitmarken, keine automatische Aktivierung und keine Ansteuerung echter Leuchten.
   Bei Songwechsel, Pause und Suchen folgt die Vorschau nur der aktuellen V763-Position.</small>
 </fieldset>;
}
