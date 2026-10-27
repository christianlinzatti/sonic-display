"use client";
import {useEffect,useMemo,useState} from "react";
import {readGroupV326,canRunGroupV326,GROUP_EVENT_V326} from "./multiAvatarStageDirectorV326";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {RapSceneSuggestionsPanelV417} from "./RapSceneSuggestionsPanelV417";
import {VocalTimeEditorV496} from "./VocalTimeEditorV496";
import {normalizeRapDuetAssignmentsV416,resolveRapDuetCueV416,
  type RapDuetAssignmentV416,type RapDuetStyleV416} from "./rapDuetStudioV416";

const styles:Record<RapDuetStyleV416,string>={
  solo:"Solo / Lead",reply:"Call & Response",duet:"Duett (beide Stimmen)",hook:"Gemeinsame Hook"
};
const time=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,"0")}`;
/** Explicit track-specific visual stage casting, never automatic human-speaker detection. */
export function RapDuetStudioV416(){
  const {track,lyrics,progressMs}=useMusic();
  const {preferences,updatePreferences}=useUiPreferences();
  const [open,setOpen]=useState(false);
  const [group,setGroup]=useState(readGroupV326);
  useEffect(()=>{const update=()=>setGroup(readGroupV326());
    window.addEventListener(GROUP_EVENT_V326,update);
    return ()=>window.removeEventListener(GROUP_EVENT_V326,update);
  },[]);
  const [from,setFrom]=useState(0),[to,setTo]=useState(0);
  const [lead,setLead]=useState(0),[partner,setPartner]=useState(1);
  const [style,setStyle]=useState<RapDuetStyleV416>("reply");
  const [strength,setStrength]=useState(65);
  const [editing,setEditing]=useState<number|null>(null);
  const [preview,setPreview]=useState<number|null>(null);
  const id=track?.id??"";
  const lineCount=lyrics?.synced?lyrics.lines.length:0;
  const values=useMemo(()=>normalizeRapDuetAssignmentsV416(
    id?(preferences.rapDuetAssignmentsV416??{})[id]:[],lineCount),
    [id,preferences.rapDuetAssignmentsV416,lineCount]);
  const count=canRunGroupV326(group,id)?group.count:
    preferences.multiAvatarMode==="solo"?1:2;
  const cue=resolveRapDuetCueV416({lyrics,progressMs:preview??progressMs,playing:true,
    count,enabled:true,assignments:values});
  const save=(newItems:RapDuetAssignmentV416[])=>{
    if(!id)return;
    updatePreferences({rapDuetAssignmentsV416:{...(preferences.rapDuetAssignmentsV416??{}),
      [id]:normalizeRapDuetAssignmentsV416(newItems,lineCount)}});
  };
  const add=()=>{
    if(!id||!lineCount)return;
    const a=Math.max(0,Math.min(lineCount-1,Math.trunc(from))),
      b=Math.max(a,Math.min(lineCount-1,Math.trunc(to)));
    if((style==="duet"||style==="reply")&&lead===partner)return;
    const value={fromLine:a,toLine:b,leadSlot:lead,partnerSlot:partner,style,strength};
    save(editing!==null?
      [...values.slice(0,editing),value,...values.slice(editing+1)]:[...values,value]);
    setPreview(lyrics!.lines[a].startMs+50);setEditing(null);
  };
  return <fieldset className="v416-rap-duet-studio" aria-label="V416 Rap Duet Studio">
    <legend>V416 · Multi-Avatar Rap Duet Studio</legend>
    <label className="setting-check"><input type="checkbox"
      checked={preferences.rapDuetEnabledV416??false}
      onChange={e=>updatePreferences({rapDuetEnabledV416:e.target.checked})}/>
      Gespeicherte Rapper-Rollen in der Live-Show verwenden</label>
    <label className="setting-check"><input type="checkbox"
      checked={preferences.rapDuetCameraV416??true}
      onChange={e=>updatePreferences({rapDuetCameraV416:e.target.checked})}/>
      Automatischen Kamerafokus für Lead, Duett und Hook erlauben</label>
    <p><strong>Auf der Bühne:</strong> {count} Avatar{count===1?"":"e"}.
      {count<2?" Aktiviere eine Duo- oder 3/4-Avatar-Bühne für die Live-Duette.":""}</p>
    <p><strong>Aktueller Titel:</strong> {track?`${track.artist} – ${track.title}`:"Kein Titel"}
      {" · "}{values.length} gespeicherte Szenen</p>
    <small>Nur bei synchronisierten Lyrics und 2–4 sichtbaren Avataren. Die Zuordnung ist eine
      künstlerische Regieanweisung – keine automatische Trennung oder Erkennung echter Rapper.
      Manuelle V385-Stimmenzuordnungen, Show-Choreografien und Kamera-Keyframes behalten Vorrang.</small>
    {!id||!lineCount?<p>Zum Bearbeiten benötigst du einen Titel mit zeitgestempelten Lyrics.</p>:<>
      <button type="button" onClick={()=>setOpen(v=>!v)}
        aria-expanded={open}>{open?"▾ Lyrics-Zeilen schließen":"▸ Lyrics-Zeilen auswählen"}</button>
      {open&&<div style={{maxHeight:240,overflowY:"auto",display:"grid",gap:3}}>
        {lyrics!.lines.map((l,i)=><button key={`${i}-${l.startMs}`} type="button"
          style={{textAlign:"left",opacity:l.text.trim()?1:.55}}
          onClick={()=>{setEditing(null);setFrom(i);setTo(i);setPreview(l.startMs+40)}}>
          {i+1}. {time(l.startMs)} — {l.text||"(Instrumentalpause)"}
        </button>)}
      </div>}
      <div style={{display:"flex",gap:9,alignItems:"end",flexWrap:"wrap"}}>
        <label>Von Zeile <input type="number" min="1" max={lineCount} value={from+1}
          onChange={e=>{const n=Math.min(lineCount-1,Math.max(0,Number(e.target.value)-1));setFrom(n);setTo(Math.max(n,to));}}/></label>
        <label>Bis Zeile <input type="number" min={from+1} max={lineCount} value={to+1}
          onChange={e=>setTo(Math.min(lineCount-1,Math.max(from,Number(e.target.value)-1)))}/></label>
        <label>Szene <select value={style} onChange={e=>setStyle(e.target.value as RapDuetStyleV416)}>
          {Object.entries(styles).map(([id,label])=><option key={id} value={id}>{label}</option>)}
        </select></label>
        <label>Lead <select value={lead} onChange={e=>setLead(Number(e.target.value))}>
          {[0,1,2,3].map(i=><option key={i} value={i}>Avatar {i+1}</option>)}
        </select></label>
        {(style==="duet"||style==="reply")&&<label>Partner <select value={partner}
          onChange={e=>setPartner(Number(e.target.value))}>
          {[0,1,2,3].map(i=><option key={i} value={i}>Avatar {i+1}</option>)}
        </select></label>}
        <label>Ausdruck ({strength} %) <input type="range" min="0" max="100" step="5"
          value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label>
        <button type="button" disabled={style!=="solo"&&style!=="hook"&&lead===partner}
          onClick={add}>{editing===null?"Szene speichern":"Szene ändern"}</button>
        {editing!==null&&<button type="button" onClick={()=>setEditing(null)}>Abbrechen</button>}
      </div>
      <RapSceneSuggestionsPanelV417 key={id} lyrics={lyrics} count={count} existing={values}
        trackId={id} onAccept={save} onPreview={setPreview}/>
      <div style={{display:"grid",gap:4}} aria-label="Gespeicherte Rap-Duette">
        {values.map((v,i)=><div key={`${i}-${v.fromLine}`} style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span>Zeile {v.fromLine+1}–{v.toLine+1}: {styles[v.style]} ·
            Avatar {v.leadSlot+1}{v.style==="reply"||v.style==="duet"?` + ${v.partnerSlot+1}`:""} · {v.strength} %</span>
          <button type="button" onClick={()=>{
            setEditing(i);setFrom(v.fromLine);setTo(v.toLine);setLead(v.leadSlot);
            setPartner(v.partnerSlot);setStyle(v.style);setStrength(v.strength);
            setPreview(lyrics!.lines[v.fromLine].startMs+50);}}>Bearbeiten</button>
          <button type="button" onClick={()=>{save(values.filter((_,j)=>j!==i));setEditing(null)}}>Entfernen</button>
        </div>)}
      </div>
      <div aria-live="polite"><strong>Vorschau:</strong> {cue.active
        ?`${styles[cue.style!]} · Lead: Avatar ${cue.leadSlot+1} · Lippen: ${cue.singingSlots.map(i=>i+1).join(", ")}`
        :"Keine aktive Regieanweisung"}.
        {preview!==null&&<button type="button" onClick={()=>setPreview(null)}>Live-Zeit verwenden</button>}
      </div>
      <label>Vorschau-Zeit {time(preview??progressMs)}
        <input type="range" min="0" max={Math.max(1000,track?.durationMs??lyrics!.lines[lineCount-1].endMs??1000)}
          step="100" value={preview??progressMs} onChange={e=>setPreview(Number(e.target.value))}/></label>
    </>}
    <small>Der Vorschau-Regler verändert die Spotify-Wiedergabe nicht. Im Modus „Antwort“ wechselt
      der visuelle Lead im letzten Teil der Zeile. In der „Duett“-Szene animieren beide
      Avatare ihre Lippen. Bei „Hook“ singen alle sichtbaren Avatare visuell mit.</small>
  <VocalTimeEditorV496/>
  </fieldset>;
}
