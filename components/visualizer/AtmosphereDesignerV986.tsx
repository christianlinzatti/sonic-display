'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ACCENT_HEX_V986,localAtmospherePlanV986,normalizeAtmospherePlanV986,
 immersivePlanFromAtmosphereV986,type AtmospherePlanV986} from '@/lib/aiAtmosphereDesignerV986';
import {importAtmosphereCuesV986,proposeAtmosphereCuesV986} from '@/lib/atmosphereTimelineV986';
import {verifiedConcertSnapshotV985} from '@/lib/predictiveShowTimelineV985';
import {GOVEE_ROOM_ATMOSPHERE_EVENT_V987,createRoomAtmosphereSessionV987} from '@/lib/goveeAtmosphereSyncV987';
import {loadGoveeConfigV909} from '@/lib/goveeLanV909';
import type {ConcertStoryV984} from '@/lib/aiConcertStoryV984';
import type {SongInsightV983} from '@/lib/aiSongIntelligenceV983';
import type {ImmersivePlanV982} from '@/lib/immersiveAiDirectorV982';
import {CONCERT_TIMELINE_EVENT_V763,getConcertTimelineV763} from './concertTimelineBridgeV763';
import {SHOW_TIMELINE_EVENT_V354,readTimelineV354,saveTimelineV354} from
 '../../services/stageContent/showTimelineV354';

const names={intro:'Prolog',verse:'Künstlerfokus',hook:'Öffnung',drop:'Höhepunkt',finale:'Finale'};
const fmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
/** Explicit AI/local authoring. No renderer, timers, GPU resources or physical lighting controls. */
export function AtmosphereDesignerV986({trackId,durationMs,story,insight,onApply,canApply}:{
 trackId:string;durationMs:number;story:ConcertStoryV984;insight:SongInsightV983;
 onApply:(plan:ImmersivePlanV982)=>void;canApply:boolean;
}){
 const [plan,setPlan]=useState<AtmospherePlanV986|null>(null);
 const [source,setSource]=useState<'local'|'ai'|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [applied,setApplied]=useState(false);
 const [selected,setSelected]=useState<string[]>([]);
 const [roomApproved,setRoomApproved]=useState(false);
 const [snapshot,setSnapshot]=useState(getConcertTimelineV763);
 const [score,setScore]=useState(readTimelineV354);
 const serial=useRef(0),abort=useRef<AbortController|null>(null);
 const revokeRoom=()=>{if(typeof window!=='undefined')window.dispatchEvent(
  new CustomEvent(GOVEE_ROOM_ATMOSPHERE_EVENT_V987,{detail:null}));};
 const current=useRef({trackId,story,insight});current.current={trackId,story,insight};
 useEffect(()=>{
  serial.current++;abort.current?.abort();abort.current=null;
  revokeRoom();setRoomApproved(false);
  setPlan(null);setSource(null);setBusy(false);setMessage('');setApplied(false);setSelected([]);
 },[trackId,story,insight]);
 useEffect(()=>()=>{serial.current++;abort.current?.abort();revokeRoom();},[]);
 useEffect(()=>{
  const updateBridge=()=>setSnapshot(getConcertTimelineV763());
  const updateScore=()=>setScore(readTimelineV354());
  window.addEventListener(CONCERT_TIMELINE_EVENT_V763,updateBridge);
  window.addEventListener(SHOW_TIMELINE_EVENT_V354,updateScore);
  return ()=>{window.removeEventListener(CONCERT_TIMELINE_EVENT_V763,updateBridge);
   window.removeEventListener(SHOW_TIMELINE_EVENT_V354,updateScore);};
 },[]);
 const reset=()=>{revokeRoom();setRoomApproved(false);serial.current++;abort.current?.abort();abort.current=null;
  setBusy(false);setPlan(null);setSource(null);setSelected([]);setApplied(false);setMessage('');};
 const local=()=>{reset();const result=localAtmospherePlanV986(story,insight.mood);
  if(result){setPlan(result);setSource('local');setMessage('Lokale Lichtwelt vorbereitet – nichts geändert.');}
  else setMessage('Storyboard ist ungültig. Keine Änderungen.');
 };
 const ask=async()=>{
  reset();const controller=new AbortController();abort.current=controller;
  const requestId=serial.current,oldTrack=trackId,oldStory=story,oldInsight=insight;
  setBusy(true);setMessage('KI entwirft die zusammenhängende Lichtwelt …');
  try{
   const response=await fetch('/api/ai/atmosphere',{method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({story,mood:insight.mood}),signal:controller.signal});
   const data:unknown=await response.json();
   if(requestId!==serial.current||oldTrack!==current.current.trackId||
    oldStory!==current.current.story||oldInsight!==current.current.insight)return;
   const body=data&&typeof data==='object'?data as Record<string,unknown>:{};
   if(!response.ok){setMessage(typeof body.error==='string'?body.error:'KI-Lichtwelt konnte nicht erstellt werden.');return;}
   const normalized=normalizeAtmospherePlanV986(body.atmosphere);
   if(!normalized){setMessage('KI-Lichtwelt ungültig. Keine Änderungen.');return;}
   setPlan(normalized);setSource('ai');setMessage('KI-Lichtwelt bereit. Bitte Vorschau prüfen.');
  }catch{
   if(requestId===serial.current&&!controller.signal.aborted)
    setMessage('KI nicht erreichbar. Du kannst die lokale Lichtwelt verwenden.');
  }finally{if(requestId===serial.current){setBusy(false);abort.current=null;}}
 };
 const virtual=plan?immersivePlanFromAtmosphereV986(plan,story,insight):null;
 const verified=verifiedConcertSnapshotV985(snapshot,trackId,durationMs);
 const cues=useMemo(()=>plan?proposeAtmosphereCuesV986(snapshot,plan,trackId,durationMs):[],
  [snapshot,plan,trackId,durationMs]);
 const ready=verified&&score.trackId===trackId&&score.durationMs===durationMs;
 const conflicts=(id:string,startMs:number,duration:number)=>score.clips.some(x=>
  x.id===id||x.lane==='lighting'&&x.startMs<startMs+duration&&startMs<x.startMs+x.durationMs);
 const approveRoom=()=>{
  if(!plan||!canApply||!trackId||!durationMs){setMessage('Keine gültige Lichtwelt oder Showfreigabe.');return;}
  const cfg=loadGoveeConfigV909();
  if(!cfg.enabled||!cfg.autoSync||!cfg.token||cfg.selectedIps.length===0){
   setMessage('Bitte Govee LAN mit ausgewählten Lampen und Auto-Sync aktivieren.');return;}
  const currentBridge=getConcertTimelineV763();
  const session=createRoomAtmosphereSessionV987(plan,currentBridge,trackId,durationMs,Date.now());
  if(!session){setMessage('Raumlicht nur bei aktuell spielendem Song mit bestätigten Szenen freigeben.');return;}
  window.dispatchEvent(new CustomEvent(GOVEE_ROOM_ATMOSPHERE_EVENT_V987,{detail:session}));
  setRoomApproved(true);setMessage('Govee-Farbstimmung für diesen Song freigegeben. Keine zusätzlichen LAN-Befehle.');
 };
 const stopRoom=()=>{revokeRoom();setRoomApproved(false);setMessage('Govee-Raumlichtfreigabe beendet.');};
 const applyCues=()=>{
  const latest=readTimelineV354(),currentBridge=getConcertTimelineV763();
  if(!plan||!verifiedConcertSnapshotV985(currentBridge,trackId,durationMs)||
   latest.trackId!==trackId||latest.durationMs!==durationMs){
   setMessage('Song/Timestamp nicht mehr bestätigt. Keine Timeline-Änderungen.');return;
  }
  const result=importAtmosphereCuesV986(latest,currentBridge,plan,selected);
  if(!result.added){setMessage(`${result.conflicts} Überschneidungen und ${result.invalid} ungültige Cues übersprungen.`);return;}
  saveTimelineV354(result.score);
  const stored=readTimelineV354();
  if(JSON.stringify(stored)!==JSON.stringify(result.score)){
   setMessage('Speicherung nicht bestätigt; bitte Browser-Speicher prüfen.');return;
  }
  setScore(stored);setSelected([]);
  setMessage(`${result.added} virtuelle Licht-Cues importiert (${result.conflicts} Konflikte). `+
   (stored.enabled?'Aktive V354-Timeline übernimmt sie.':'Timeline bleibt inaktiv.'));
 };
 return <fieldset className="atmosphere-designer-v986" aria-label="V986 AI Atmosphere Designer">
  <legend>V986 · AI Atmosphere Designer</legend>
  <p>Eine konsistente Lichtwelt für die fünf kreativen Story-Akte: Farbpalette, virtuelles
   Licht, Nebel- und LED-Ideen mit weichen Übergängen.</p>
  <div className="concert-story-actions-v984">
   <button type="button" onClick={()=>void ask()} disabled={busy}>{busy?'KI entwirft …':'KI-Lichtwelt gestalten'}</button>
   <button type="button" onClick={local}>Lokale Lichtwelt erstellen</button>
  </div>
  <small>KI-Abfrage nur auf Klick. Übermittelt werden das kreative V984-Storyboard und die V983-Stimmung;
   keine Tokens, Lyrics oder Audiodaten. Kosten über den konfigurierten OpenAI-API-Schlüssel möglich.</small>
  {message&&<p role="status">{message}</p>}
  {plan&&<section aria-label="Atmosphärenvorschau V986">
   <h4>{plan.title} <small>· {source==='ai'?'KI-Vorschlag':'Lokaler Entwurf'}</small></h4>
   <p><b>Farbmotiv:</b> {plan.motif} · <b>Palette:</b> {plan.palette}</p>
   <p>{plan.description}</p>
   <ol>{plan.acts.map((act,i)=><li key={act.section} style={{padding:'6px 0'}}>
    <span aria-hidden="true" style={{display:'inline-block',width:18,height:18,
     borderRadius:'50%',verticalAlign:'middle',marginRight:8,background:ACCENT_HEX_V986[act.accent]}}/>
    <b>{names[act.section]}</b> · {act.accent} · Licht {act.virtualLight}/65 · Dunst-Idee {act.haze}/35 ·
    Strahlen-Idee {act.beams}/55 · LED-Idee: {act.led}
    <p>{act.note} · Übergang: {act.transition}</p>
   </li>)}</ol>
   <small>Farb-, Dunst- und LED-Verläufe pro Akt sind zunächst <b>visuelle Vorschläge</b>, nicht gerenderte
    LED-Wand-Cues. Nur das freigegebene globale V982-Bühnenbild verändert vorhandene virtuelle Einstellungen.
    Keine echten Govee-Befehle, keine automatisch erfundenen Zeitpunkte.</small>
   <div className="concert-story-actions-v984"><button type="button" disabled={!canApply||!virtual||applied}
    onClick={()=>{if(!virtual)return;onApply(virtual);setApplied(true);
     setMessage('Virtueller V982-Look übernommen. Rückgängig im Immersive Show Studio möglich.');}}>
    {applied?'Bühnen-Look übernommen':'Virtuelle Lichtwelt übernehmen'}</button></div>
   {!canApply&&<small>Übernahme nur bei aktiver automatischer Show und ohne reduzierte Bewegung.</small>}
   <hr/>
   <h4>V987 · Govee Immersive Sync 2.0</h4>
   <p>Optionaler Raumlicht-Farbabgleich mit den vorhandenen Govee-Leuchten. Nur bestätigte
    Songabschnitte; die fünf kreativen Akte sind Farb-Motive, keine gemessene Songstruktur.
    Gespeicherte Govee-Shows, manuelle Bühnen-Cues, Sprachbefehle und reduzierte Bewegung haben Vorrang.</p>
   <div className="concert-story-actions-v984">
    <button type="button" disabled={!canApply||!verified||roomApproved} onClick={approveRoom}>
     {roomApproved?'Govee-Raumlicht freigegeben':'Govee-Raumlicht für diesen Song freigeben'}</button>
    {roomApproved&&<button type="button" onClick={stopRoom}>Raumlicht-Sync sofort beenden</button>}
   </div>
   <small>Eine zusätzliche, jederzeit widerrufbare Freigabe nur für den aktuellen Song und Tab.
    V909 muss separat mit LAN-Bridge, Lampen und Auto-Sync eingerichtet sein.
    Keine Einschalt-/Ausschaltbefehle, kein Strobo, keine neuen Timer.
    Ohne verifizierte V604/V763-Timeline bleibt das echte Raumlicht unverändert.</small>
   <hr/>
   <h4>Zeitgebundene virtuelle Lichtakzente (optional)</h4>
   {!verified?<p>Keine verifizierte V604/V763-Szenen-Timeline. Es werden keine Zeiten geschätzt.</p>:
    !ready?<p>Für Licht-Cues zunächst eine passende Songshow im V985-Timeline-Panel anlegen oder öffnen.</p>:<>
     <p>{cues.length} Vorschläge aus real bestätigten Szenengrenzen; alle bleiben vor Übernahme inaktiv bzw. folgen dem bisherigen Timeline-Status.</p>
     <div style={{maxHeight:190,overflowY:'auto'}} aria-label="V986 Licht-Cue-Auswahl">
      {cues.map(({clip,actIndex})=>{
       const blocked=conflicts(clip.id,clip.startMs,clip.durationMs);
       return <label key={clip.id} style={{display:'block',padding:'3px 0'}}>
        <input type="checkbox" checked={!blocked&&selected.includes(clip.id)} disabled={blocked}
         onChange={e=>setSelected(prev=>e.target.checked?[...prev.filter(x=>x!==clip.id),clip.id]:prev.filter(x=>x!==clip.id))}/>
        {fmt(clip.startMs)} · Akt {actIndex+1} · virtuelle Lichtstärke {String(clip.value)}
        {blocked?' – bestehender Cue hat Vorrang':''}
       </label>;
      })}</div>
     <button type="button" onClick={()=>setSelected(cues.filter(({clip})=>!conflicts(clip.id,clip.startMs,clip.durationMs)).map(x=>x.clip.id))}>Konfliktfreie auswählen</button>{' '}
     <button type="button" onClick={()=>setSelected([])}>Auswahl aufheben</button>{' '}
     <button type="button" disabled={!selected.length} onClick={applyCues}>Licht-Cues geprüft übernehmen</button>
     <small>V354 übernimmt ausschließlich die bestätigten Startzeiten und steuert nur virtuelles Licht.
      Gespeicherte Cues werden nicht überschrieben; die Show wird nicht automatisch aktiviert.</small>
    </>}
  </section>}
 </fieldset>;
}
