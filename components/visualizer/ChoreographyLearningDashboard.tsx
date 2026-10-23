"use client";
import {useEffect,useMemo,useState} from "react";
import {ADAPTIVE_CHOREOGRAPHY_EVENT,EMPTY_ADAPTIVE_STATE,loadAdaptiveState,saveAdaptiveState,type AdaptiveChoreographyState} from "./adaptiveChoreographyLearning";
import {getLearningRecommendations,acceptLearningSuggestion,dismissLearningSuggestion,clearLearningHistory} from "./choreographyLearningInsights";
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
export function ChoreographyLearningDashboard({avatarId,motions}:{avatarId:string;motions:InstalledCharacterMotion[]}){
 const [state,setState]=useState<AdaptiveChoreographyState>(EMPTY_ADAPTIVE_STATE);
 const [genre,setGenre]=useState("");
 useEffect(()=>{const refresh=()=>setState(loadAdaptiveState());refresh();window.addEventListener(ADAPTIVE_CHOREOGRAPHY_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(ADAPTIVE_CHOREOGRAPHY_EVENT,refresh);window.removeEventListener("storage",refresh);};},[]);
 const genres=useMemo(()=>Array.from(new Set(motions.map(m=>m.genre).filter(Boolean))).sort(),[motions]);
 const recommendations=useMemo(()=>getLearningRecommendations(state,avatarId,motions,genre),[state,avatarId,motions,genre]);
 const update=(next:AdaptiveChoreographyState)=>setState(saveAdaptiveState(next));
 const sum=state.counts.filter(c=>c.avatarId===avatarId).reduce((n,c)=>n+c.count,0);
 return <fieldset aria-label="Choreography Learning Dashboard V197" style={{minWidth:0}}>
  <legend>Choreography Learning Dashboard · V197</legend>
  <p>Lokale Lernhistorie und Motion-Empfehlungen. Konfidenz = Beobachtungen dieser Motion / alle Beobachtungen der Phase. Keine Spotify-Trackanalyse.</p>
  <label>Genre-Filter <select aria-label="Genre filtern" value={genre} onChange={e=>setGenre(e.target.value)}><option value="">Alle Genres</option>{genres.map(g=><option value={g} key={g}>{g}</option>)}</select></label>
  <p><small>{sum} gespeicherte Beobachtungen für diesen Charakter · {recommendations.length} Vorschläge · Lernen {state.learn?"aktiv":"deaktiviert"}</small></p>
  {recommendations.length===0?<p>Noch keine gelernten Motions. Aktiviere optional das Lernen im V196-Panel und lasse mehrere Musikphasen beobachten.</p>:<div style={{display:"grid",gap:8}}>
   {recommendations.map(r=><div key={`${r.phase}:${r.motionId}`} style={{border:"1px solid var(--border, #6665)",borderRadius:8,padding:10}}>
    <strong>{r.phase.toUpperCase()} · {r.name}</strong> <small>({r.genre})</small>
    <div style={{margin:"6px 0"}}><progress aria-label={`Konfidenz ${r.phase} ${r.name}`} value={r.confidence} max={1} style={{width:"100%"}}/></div>
    <small>{Math.round(r.confidence*100)} % · {r.count} von {r.total} Beobachtungen · {r.manual?"Manuell festgelegt":r.eligible?"Empfehlung bereit":"Noch nicht ausreichend bestätigt (mind. 3 / 60 %)"}</small>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
     <button type="button" disabled={r.manual} onClick={()=>update(acceptLearningSuggestion(state,avatarId,r.phase,r.motionId,motions))}>Als manuelle Motion übernehmen</button>
     <button type="button" onClick={()=>update(dismissLearningSuggestion(state,avatarId,r.phase,r.motionId))}>Lernwert verwerfen</button>
    </div>
   </div>)}
  </div>}
  <button type="button" style={{marginTop:10}} disabled={!sum} onClick={()=>{if(window.confirm("Alle gelernten Beobachtungen dieses Charakters löschen? Manuelle Zuordnungen bleiben erhalten."))update(clearLearningHistory(state,avatarId));}}>Lernhistorie dieses Charakters löschen</button>
  <p><small>Manuelle Korrekturen werden im V196-Phasenmapping gespeichert und steuern damit auch die Live-Auswahl. Das Verwerfen löscht nur Beobachtungen für diesen Kandidaten, keine GLB-Datei. Alles lokal im Browser.</small></p>
 </fieldset>;
}
