"use client";
import {useMemo,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {normalizeVocalAssignmentsV385,resolveManualVocalCueV385,
 type VocalAssignmentV385,type VocalRoleV385} from "./manualVocalCastingV385";

const label:Record<VocalRoleV385,string>={lead:"Hauptstimme",feature:"Feature / Antwort",hook:"Gemeinsame Hook"};
const clock=(n:number)=>`${Math.floor(n/60000)}:${String(Math.floor(n%60000/1000)).padStart(2,"0")}`;
/** Editable, per-song vocal cast. No inferred singer IDs or Spotify playback controls. */
export function MultiVocalPerformanceStudioV385(){
 const {track,lyrics,progressMs}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const [from,setFrom]=useState(0),[to,setTo]=useState(0),[slot,setSlot]=useState(0);
 const [role,setRole]=useState<VocalRoleV385>("lead");
 const [editing,setEditing]=useState<number|null>(null);
 const [previewMs,setPreviewMs]=useState<number|null>(null);
 const [expanded,setExpanded]=useState(false);
 const id=track?.id??"";
 const validLyrics=!!lyrics?.synced&&!!lyrics.lines.length;
 const current=useMemo(()=>normalizeVocalAssignmentsV385(id?(preferences.avatarVocalAssignmentsV385??{})[id]:[],lyrics?.lines.length??0),
   [id,lyrics?.lines.length,preferences.avatarVocalAssignmentsV385]);
 const cue=resolveManualVocalCueV385({lyrics,progressMs:previewMs??progressMs,playing:true,count:4,
   enabled:preferences.avatarManualVocalEnabledV385??false,assignments:current});
 const save=(updated:VocalAssignmentV385[])=>{
   if(!id)return;
   const existing=preferences.avatarVocalAssignmentsV385??{};
   updatePreferences({avatarVocalAssignmentsV385:{...existing,[id]:updated}});
 };
 const n=lyrics?.lines.length??0;
 const add=()=>{
   if(!validLyrics)return;
   const a=Math.min(n-1,Math.max(0,Math.trunc(from)));
   const b=Math.min(n-1,Math.max(a,Math.trunc(to)));
   const record={fromLine:a,toLine:b,slot,role};
   save(editing!==null&&current[editing]?[...current.slice(0,editing),record,...current.slice(editing+1)]:[...current,record]);
   setEditing(null);
   setPreviewMs(lyrics!.lines[a].startMs);
 };
 return <fieldset className="v385-manual-vocal-studio">
  <legend>V385 · Multi-Vocal Performance Studio</legend>
  <label className="setting-check"><input type="checkbox" checked={preferences.avatarManualVocalEnabledV385??false}
    onChange={e=>updatePreferences({avatarManualVocalEnabledV385:e.target.checked})}/>
    Manuell zugeordnete Stimmen auf der Bühne verwenden</label>
  <label className="setting-check"><input type="checkbox" checked={preferences.avatarManualVocalCameraV385??true}
    onChange={e=>updatePreferences({avatarManualVocalCameraV385:e.target.checked})}/>
    Kamera automatisch zur zugeordneten Hauptstimme führen (nur Automatikmodus)</label>
  <p><strong>Titel:</strong> {track?`${track.artist} – ${track.title}`:"Kein Spotify-Titel ausgewählt"}</p>
  <small>Zuordnungen werden getrennt nach Spotify-Track-ID lokal gespeichert. Keine Stimmenerkennung: Du legst selbst fest, welcher 3D-Tänzer den jeweiligen Text darstellen soll. Manuelle Kamera- und Show-Choreografien haben Vorrang.</small>
  {!validLyrics?<p>Für die Zuordnung werden synchronisierte Lyrics mit Zeilen-Zeitstempeln benötigt.</p>:<>
   <button type="button" onClick={()=>setExpanded(!expanded)}>{expanded?"Zeilenübersicht verbergen":"Zeilenübersicht öffnen"} ({n} Zeilen)</button>
   {expanded&&<div style={{maxHeight:220,overflowY:"auto",display:"grid",gap:3}} aria-label="Lyrics-Zeilen für Vocal-Zuordnung">
     {lyrics!.lines.map((line,i)=><button key={`${i}-${line.startMs}`} type="button"
       title={`Ab ${clock(line.startMs)} · Zeile ${i+1}`}
       style={{textAlign:"left",opacity:line.text.trim()?1:.55}}
       onClick={()=>{setEditing(null);setFrom(i);setTo(i);setPreviewMs(line.startMs+50);}}>
       {i+1}. {clock(line.startMs)} — {line.text||"(Instrumentalpause)"}
     </button>)}
   </div>}
   <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"end"}}>
    <label>Von Zeile <input type="number" min={1} max={n} value={from+1}
      onChange={e=>{const i=Math.min(n-1,Math.max(0,Number(e.target.value)-1));setFrom(i);if(to<i)setTo(i);}}/></label>
    <label>Bis Zeile <input type="number" min={from+1} max={n} value={to+1}
      onChange={e=>setTo(Math.min(n-1,Math.max(from,Number(e.target.value)-1)))}/></label>
    <label>Rolle <select value={role} onChange={e=>setRole(e.target.value as VocalRoleV385)}>
       <option value="lead">Hauptstimme</option><option value="feature">Feature / Antwort</option><option value="hook">Gemeinsame Hook</option></select></label>
    <label>{role==="hook"?"Referenz-Tänzer":"Sprechender Tänzer"} <select value={slot} onChange={e=>setSlot(Number(e.target.value))}>
      {[0,1,2,3].map(i=><option key={i} value={i}>Tänzer {i+1}</option>)}</select></label>
    <button type="button" onClick={add}>{editing===null?"Bereich zuordnen":"Zuordnung aktualisieren"}</button>
    {editing!==null&&<button type="button" onClick={()=>setEditing(null)}>Bearbeitung abbrechen</button>}
   </div>
   <p>Bei „Gemeinsame Hook“ singen alle konfigurierten Tänzer visuell mit. Andere Zuordnungen steuern primär einen Sänger; die übrigen Tänzer tanzen weiter, ohne dieselben Lippenbewegungen zu übernehmen.</p>
   <div style={{display:"grid",gap:6}} aria-label="Gespeicherte Vocal-Rollen">
    {current.length===0?<small>Noch keine Zuordnungen für diesen Titel.</small>:current.map((a,i)=><div key={`${i}-${a.fromLine}-${a.toLine}`}
     style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
       <span>Zeilen {a.fromLine+1}–{a.toLine+1} · {label[a.role]} · {a.role==="hook"?"alle Tänzer":`Tänzer ${a.slot+1}`}</span>
       <button type="button" onClick={()=>{setEditing(i);setFrom(a.fromLine);setTo(a.toLine);setRole(a.role);setSlot(a.slot);setPreviewMs(lyrics!.lines[a.fromLine].startMs);}}>Bearbeiten</button>
       <button type="button" onClick={()=>{save(current.filter((_,j)=>j!==i));setEditing(null);}} aria-label={`Vocal-Zuordnung ${i+1} entfernen`}>Entfernen</button>
    </div>)}
   </div>
   <div aria-live="polite"><strong>Vorschau:</strong> {cue.active?`${label[cue.role!]} · ${cue.role==="hook"?"alle":`Tänzer ${cue.leadSlot+1}`} · Zeile ${cue.lineIndex+1}`:"Keine aktive Zuordnung an diesem Zeitpunkt"}
    {previewMs!==null&&<button type="button" onClick={()=>setPreviewMs(null)}>Zur Live-Position wechseln</button>}
   </div>
   <label>Vorschau-Zeit: {clock(previewMs??progressMs)} <input type="range" min="0" max={Math.max(1000,track?.durationMs??lyrics!.lines[n-1]?.endMs??1000)} step="100"
     value={previewMs??progressMs} onChange={e=>setPreviewMs(Number(e.target.value))}/></label>
  </>}
  <small>Dieses Studio verändert die Spotify-Wiedergabe nicht. V385 wirkt nur mit mindestens zwei Bühnen-Avataren und gültigem Lyrics-Timing; ohne Zuordnung bleiben die bisherigen V375-/V376-Regeln erhalten.</small>
 </fieldset>;
}
