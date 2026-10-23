"use client";
import {useEffect,useState} from "react";
import {CONTEXT_MEMORY_EVENT,DEFAULT_CONTEXT_MEMORY,loadContextMemory,saveContextMemory,observeContextMemory,type ContextMemory} from "./choreographyContextMemory";
import {ADAPTIVE_CHOREOGRAPHY_EVENT,EMPTY_ADAPTIVE_STATE,PHASES,loadAdaptiveState,saveAdaptiveState,learnFromObservation,resolveAdaptiveMotion,type AdaptiveChoreographyState} from "./adaptiveChoreographyLearning";
import {MUSIC_STRUCTURE_TIMELINE_EVENT,type TimelineObservation} from "./musicStructureTimeline";
import {CHARACTER_MOTION_CHANGE_EVENT,loadCharacterMotionStore,type InstalledCharacterMotion} from "./characterMotionLibrary";
export function AdaptiveChoreographyTimeline({avatarId,motions}:{avatarId:string;motions:InstalledCharacterMotion[]}) {
 const [settings,setSettings]=useState<AdaptiveChoreographyState>(EMPTY_ADAPTIVE_STATE);
 const [memory,setMemory]=useState<ContextMemory>(DEFAULT_CONTEXT_MEMORY);
 useEffect(()=>{const refresh=()=>setMemory(loadContextMemory());refresh();window.addEventListener(CONTEXT_MEMORY_EVENT,refresh);return()=>window.removeEventListener(CONTEXT_MEMORY_EVENT,refresh);},[]);
 const [current,setCurrent]=useState<TimelineObservation|null>(null);
 useEffect(()=>{const refresh=()=>setSettings(loadAdaptiveState());refresh();window.addEventListener(ADAPTIVE_CHOREOGRAPHY_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(ADAPTIVE_CHOREOGRAPHY_EVENT,refresh);window.removeEventListener("storage",refresh);};},[]);
 useEffect(()=>{setCurrent(null);},[avatarId]);
 useEffect(()=>{
  let lastPhase="";const listener=(e:Event)=>{
   const obs=(e as CustomEvent<TimelineObservation>).detail;
   if(!obs||obs.avatarId!==avatarId)return;
   setCurrent(obs);
   if(obs.phase===lastPhase)return;
   lastPhase=obs.phase;
   const store=loadAdaptiveState();const updated=learnFromObservation(store,obs,loadCharacterMotionStore().motions);
   if(updated!==store)saveAdaptiveState(updated);
   const matched=loadCharacterMotionStore().motions.find(m=>m.avatarId===obs.avatarId&&m.name===obs.motion);
   if(matched&&obs.evidence.confidence>=0.55){const before=loadContextMemory();const after=observeContextMemory(before,{avatarId:obs.avatarId,motionId:matched.id,phase:obs.phase,genre:matched.genre||"",bpm:0});if(after!==before)saveContextMemory(after);}
  };
  window.addEventListener(MUSIC_STRUCTURE_TIMELINE_EVENT,listener);
  return()=>window.removeEventListener(MUSIC_STRUCTURE_TIMELINE_EVENT,listener);
 },[avatarId]);
 const update=(fn:(s:AdaptiveChoreographyState)=>AdaptiveChoreographyState)=>setSettings(s=>saveAdaptiveState(fn(s)));
 const totalFor=(phase:string)=>settings.counts.filter(c=>c.avatarId===avatarId&&c.phase===phase).reduce((n,c)=>n+c.count,0);
 return <fieldset aria-label="Adaptive Choreography Timeline V196" style={{minWidth:0}}>
  <legend>Adaptive Choreography Timeline · V196</legend>
  <p>Musikphasen zu vorhandenen Motions zuordnen. Lernwerte stammen aus beobachteten Phasenwechseln, nicht aus einem vollständigen Spotify-Track.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update(s=>({...s,enabled:e.target.checked}))}/> Phasenbasierte Motion-Auswahl aktivieren</label>
  <label className="setting-check"><input type="checkbox" checked={settings.learn} onChange={e=>update(s=>({...s,learn:e.target.checked}))}/> Aus Live-Phasenwechseln lernen (optional)</label>
  {PHASES.map(phase=><div key={phase} style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,margin:"8px 0"}}>
   <label style={{minWidth:90}}>{phase.toUpperCase()}</label>
   <select aria-label={`Motion für ${phase}`} value={settings.assignments[avatarId]?.[phase]||""} onChange={e=>update(s=>({...s,assignments:{...s.assignments,[avatarId]:{...s.assignments[avatarId],[phase]:e.target.value}}}))}>
    <option value="">Automatisch lernen / bisherige Auswahl</option>
    {motions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
   </select>
   <small>{totalFor(phase)} Beobachtungen · Vorschlag: {resolveAdaptiveMotion(settings,avatarId,phase,motions)?.name||"bisherige Motion"}</small>
  </div>)}
  {current&&<p aria-live="off">Live: {current.phase.toUpperCase()} · {current.motion||"Standard"} · Konfidenz {Math.round(current.evidence.confidence*100)}%</p>}
  <button type="button" onClick={()=>update(s=>({...s,counts:s.counts.filter(c=>c.avatarId!==avatarId)}))}>Gelernte Werte für diesen Charakter zurücksetzen</button>
  <fieldset aria-label="Adaptive Choreography Memory V235"><legend>Adaptive Choreography Memory · V235</legend>
    <label className="setting-check"><input type="checkbox" checked={memory.enabled} onChange={e=>setMemory(saveContextMemory({...memory,enabled:e.target.checked}))}/> Kontextauswahl aktivieren</label>
    <label className="setting-check"><input type="checkbox" checked={memory.learn} onChange={e=>setMemory(saveContextMemory({...memory,learn:e.target.checked}))}/> Kontextwerte lokal lernen</label>
    <label className="setting-check"><input type="checkbox" checked={memory.avoidRepeats} onChange={e=>setMemory(saveContextMemory({...memory,avoidRepeats:e.target.checked}))}/> Wiederholungen vermeiden</label>
    <p>{memory.records.filter(r=>r.avatarId===avatarId).length} gespeicherte Kontextkombinationen</p>
    <button type="button" onClick={()=>setMemory(saveContextMemory({...memory,records:memory.records.filter(r=>r.avatarId!==avatarId),history:[]}))}>Kontext-Lernwerte zurücksetzen</button>
  </fieldset>
  <p><small>Manuelle Phasen-Zuordnungen haben Vorrang. Lernen beginnt erst nach mindestens drei unterschiedlichen Phasenbeobachtungen pro Kandidat; benötigt mindestens 60 % Übereinstimmung. Speicherung nur im lokalen Browser.</small></p>
 </fieldset>;
}
