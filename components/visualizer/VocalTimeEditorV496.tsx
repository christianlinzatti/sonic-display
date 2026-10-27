"use client";
import {useEffect,useMemo,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {normalizeVocalTimeSegmentsV496,resolveVocalTimeCueV496,
 type VocalTimeSegmentV496,type VocalTimeStyleV496,type VocalTimeRoleV547} from "./vocalTimeDirectorV496";
import {projectFeatureVocalTimelineV547,snapVocalTimestampV547} from "./featureVocalTimelineV547";
const pretty=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,"0")}.${String(Math.floor(ms%1000)).padStart(3,"0")}`;
const seconds=(ms:number)=>Math.round(ms)/1000;
/** 10-ms precision without seeking Spotify. Assignments are explicit visual direction only. */
export function VocalTimeEditorV496(){
 const {track,progressMs}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const trackId=track?.id??"";
 const durationMs=track?.durationMs&&track.durationMs>0?Math.min(track.durationMs,4*60*60*1000):4*60*60*1000;
 const items=useMemo(()=>normalizeVocalTimeSegmentsV496(
  trackId?(preferences.vocalTimeSegmentsV496??{})[trackId]:[],durationMs),
  [trackId,durationMs,preferences.vocalTimeSegmentsV496]);
 const [start,setStart]=useState("0");
 const [end,setEnd]=useState("5");
 const [lead,setLead]=useState(0);
 const [partner,setPartner]=useState(1);
 const [style,setStyle]=useState<VocalTimeStyleV496>("solo");
 const [role,setRole]=useState<VocalTimeRoleV547>("verse");
 const [hookSlots,setHookSlots]=useState<number[]>([0,1]);
 const [strength,setStrength]=useState(70);
 const [editing,setEditing]=useState<number|null>(null);
 const [preview,setPreview]=useState<number|null>(null);
 useEffect(()=>{setEditing(null);setPreview(null);setStart("0");setEnd("5");},[trackId]);
 const values=(preferences.vocalTimeSegmentsV496??{});
 const persist=(next:VocalTimeSegmentV496[])=>{
  if(!trackId)return;
  updatePreferences({vocalTimeSegmentsV496:{...values,
   [trackId]:normalizeVocalTimeSegmentsV496(next,durationMs)}});
 };
 const resolvedStyle:VocalTimeStyleV496=role==="adlib"?"solo":role==="hook"?"hook":style;
 const resolvedLead=resolvedStyle==="hook"?hookSlots[0]??lead:lead;
 const activeSlots=resolvedStyle==="hook"?hookSlots:
  resolvedStyle==="duet"?[lead,partner]:[lead];
 const proposed=normalizeVocalTimeSegmentsV496([{startMs:snapVocalTimestampV547(Number(start)*1000,durationMs),
  endMs:snapVocalTimestampV547(Number(end)*1000,durationMs),leadSlot:resolvedLead,partnerSlot:partner,
  style:resolvedStyle,strength,roleV547:role,singerSlotsV547:activeSlots}],durationMs)[0];
 const lanes=useMemo(()=>projectFeatureVocalTimelineV547(items,durationMs,4),[items,durationMs]);
 const edit=(item:VocalTimeSegmentV496,i:number)=>{
  setEditing(i);setStart(String(seconds(item.startMs)));setEnd(String(seconds(item.endMs)));
  setLead(item.leadSlot);setPartner(item.partnerSlot);setStyle(item.style);
  setRole(item.roleV547??(item.style==="hook"?"hook":"verse"));
  setHookSlots(item.singerSlotsV547?.length?item.singerSlotsV547:
    item.style==="hook"?[0,1,2,3]:[item.leadSlot]);
  setStrength(item.strength);setPreview(item.startMs+10);
 };
 const save=()=>{
  if(!trackId||!proposed)return;
  persist(editing===null?[...items,proposed]:items.map((v,i)=>i===editing?proposed:v));
  setEditing(null);setPreview(proposed.startMs+10);
 };
 const previewMs=preview??progressMs;
 const cue=resolveVocalTimeCueV496({trackId,progressMs:previewMs,playing:true,count:4,
  enabled:true,segments:items});
 const setNow=(target:"start"|"end")=>{
  const ms=Math.max(0,Math.min(durationMs,Math.round(progressMs)));
  if(target==="start")setStart(String(seconds(ms)));
  else setEnd(String(seconds(ms)));
 };
 return <fieldset className="v496-vocal-time-editor" aria-label="V496 Sänger-Zeitmarken">
  <legend>V547 · Feature Vocal Assignment Studio</legend>
  <label className="setting-check"><input type="checkbox" checked={preferences.vocalTimeEnabledV496??false}
   onChange={e=>updatePreferences({vocalTimeEnabledV496:e.target.checked})}/>
   Zeitbasierte Sängerrollen für die Live-Show aktivieren</label>
  <p><small>Du ordnest sichtbaren Avataren manuell Sängerrollen zu. Keine automatische Sprechererkennung.
   Die Zeitmarken funktionieren auch ohne synchronisierte Lyrics. V385-Zuordnungen haben Vorrang,
   danach V496-Zeitmarken, danach V416-Lyrics-Zeilen. Die echte Bühne kann 2 bis 4 Avatare zeigen.</small></p>
  <p><strong>Song:</strong> {track?`${track.artist} – ${track.title}`:"Kein Song"} · {items.length} Zeitmarken</p>
  <p><small>V547: Mehrspurige Sänger-Timeline mit Lead, Feature, Hook und zusätzlichen Adlibs.
   Nur explizit von dir gespeicherte Zuordnungen werden für Mundbewegungen, Rap-Gesten
   und die vorhandene automatische Kameraregie berücksichtigt. Gleiche Zeitbereiche werden
   als Überlappung markiert; zuletzt gespeicherte Hauptpassage gewinnt, Adlibs ergänzen nur.</small></p>
  {!trackId?<p>Wähle einen Song, um Zeitmarken zu bearbeiten.</p>:<>
   <div aria-label="V547 visuelle Sänger-Timeline" style={{background:"#10182b",color:"#fff",borderRadius:12,padding:12,marginBlock:12}}>
     <div style={{display:"flex",justifyContent:"space-between",fontSize:12,opacity:.85}}>
       <span>0:00</span><strong>{pretty(previewMs)} · Vorschau</strong><span>{pretty(durationMs)}</span>
     </div>
     {[0,1,2,3].map(slot=><div key={slot} style={{display:"grid",gridTemplateColumns:"72px minmax(0,1fr)",gap:8,alignItems:"center",marginTop:7}}>
       <span style={{fontSize:12}}>Avatar {slot+1}</span>
       <div style={{position:"relative",height:39,background:"#253147",borderRadius:6,overflow:"hidden"}}>
         {lanes.filter(l=>l.slot===slot).map(l=><button key={`${l.id}-${slot}`} type="button"
           title={`Zeitmarke ${l.id+1}: ${l.role}${l.overlap?" · überlappende Hauptpassage":""}`}
           aria-label={`Avatar ${slot+1}, Zeitmarke ${l.id+1}, ${l.role}${l.overlap?", Überschneidung":""} bearbeiten`}
           onClick={()=>edit(items[l.id],l.id)}
           style={{position:"absolute",left:`${l.left}%`,width:`${l.width}%`,minWidth:4,
             height:l.isAdlib?16:23,top:l.isAdlib?22:2,overflow:"hidden",padding:0,
             border:l.overlap?"2px solid #ffbf60":"1px solid #b1c8ed",borderRadius:4,
             background:l.isAdlib?"#f5a446":l.role==="feature"?"#917bff":l.role==="hook"?"#00b3ac":"#4c9bd8",
             color:"white",fontSize:10,textAlign:"left",whiteSpace:"nowrap"}}>{l.width>7?(l.isAdlib?"Adlib":l.role):""}</button>)}
         <div aria-hidden="true" style={{position:"absolute",top:0,bottom:0,left:`${Math.min(100,100*previewMs/durationMs)}%`,
           width:2,background:"#fff",boxShadow:"0 0 3px #000",pointerEvents:"none"}}/>
       </div>
     </div>)}
     <small>Hellblau: Verse · Violett: Feature · Türkis: Hook · Orange: Adlib · Orange Umrandung: konkurrierende Hauptpassagen.
       Balken antippen, um die Zuordnung zu bearbeiten.</small>
   </div>
   <div style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"end"}}>
    <label>Start (Sekunden) <input type="number" min="0" max={seconds(durationMs)} step="0.01" value={start}
      onChange={e=>setStart(e.target.value)}/></label>
    <button type="button" onClick={()=>setNow("start")}>Start = aktuelle Zeit</button>
    <label>Ende (Sekunden) <input type="number" min="0" max={seconds(durationMs)} step="0.01" value={end}
      onChange={e=>setEnd(e.target.value)}/></label>
    <button type="button" onClick={()=>setNow("end")}>Ende = aktuelle Zeit</button>
    <label>Rolle <select value={role} onChange={e=>{const next=e.target.value as VocalTimeRoleV547;
      setRole(next);if(next==="hook")setStyle("hook");else if(next==="adlib"||style==="hook")setStyle("solo");}}>
      <option value="verse">Lead / Verse</option><option value="feature">Feature</option>
      <option value="hook">Gemeinsame Hook</option><option value="adlib">Adlib / Backing</option>
    </select></label>
    <label>Regie <select value={resolvedStyle} disabled={role==="hook"||role==="adlib"}
      onChange={e=>setStyle(e.target.value as VocalTimeStyleV496)}>
      <option value="solo">Solo</option><option value="duet">Duett</option><option value="hook" disabled>Gemeinsame Hook (oben als Rolle wählen)</option>
    </select></label>
    <label>{resolvedStyle==="hook"?"Lead (aus Hook-Auswahl)":"Lead"} <select value={resolvedStyle==="hook"?resolvedLead:lead} disabled={resolvedStyle==="hook"} onChange={e=>setLead(Number(e.target.value))}>
      {[0,1,2,3].map(i=><option key={i} value={i}>Avatar {i+1}</option>)}
    </select></label>
    {resolvedStyle==="duet"&&<label>Partner <select value={partner} onChange={e=>setPartner(Number(e.target.value))}>
      {[0,1,2,3].map(i=><option key={i} value={i}>Avatar {i+1}</option>)}
    </select></label>}
    {resolvedStyle==="hook"&&<fieldset style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <legend>Wer singt die Hook?</legend>
      {[0,1,2,3].map(i=><label key={i} style={{whiteSpace:"nowrap"}}><input type="checkbox"
        checked={hookSlots.includes(i)} onChange={e=>setHookSlots(cur=>
          e.target.checked?[...new Set([...cur,i])].sort((a,b)=>a-b):cur.filter(v=>v!==i))}/>
        Avatar {i+1}</label>)}
    </fieldset>}
    <label>Intensität ({strength} %) <input type="range" min="0" max="100" step="5"
      value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label>
    <button type="button" disabled={!proposed} onClick={save}>{editing===null?"Zeitmarke speichern":"Änderungen speichern"}</button>
    {editing!==null&&<button type="button" onClick={()=>setEditing(null)}>Abbrechen</button>}
   </div>
   {!proposed&&<small role="alert">Bitte gültige Zeiten eingeben: Ende nach Start, innerhalb der Songlänge;
     Duett mit unterschiedlichen Avataren; mindestens ein Hook-Sänger.</small>}
   <div aria-label="Gespeicherte Sänger-Zeitmarken" style={{display:"grid",gap:6,marginTop:12}}>
    {items.map((item,i)=><div key={`${i}-${item.startMs}`} style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <span>{pretty(item.startMs)}–{pretty(item.endMs)} · {item.roleV547??item.style} · Lead {item.leadSlot+1}
       {item.singerSlotsV547?.length?` · Lippen: ${item.singerSlotsV547.map(v=>v+1).join(", ")}`:
        item.style==="duet"?` + ${item.partnerSlot+1}`:""}</span>
      <button type="button" onClick={()=>edit(item,i)}>Bearbeiten</button>
      <button type="button" onClick={()=>{persist(items.filter((_,j)=>j!==i));setEditing(null);}}>Entfernen</button>
    </div>)}
   </div>
   <label>Vorschau bei {pretty(previewMs)}
    <input type="range" min="0" max={Math.max(1000,durationMs)} step="10" value={previewMs}
     onChange={e=>setPreview(Number(e.target.value))}/></label>
   <div aria-live="polite">{cue.active?`Regie: ${cue.style} · Lead Avatar ${cue.leadSlot+1} · Lippen: ${cue.singingSlots.map(i=>i+1).join(", ")}`:"Keine aktive Zeitmarke"}
     {preview!==null&&<button type="button" onClick={()=>setPreview(null)}>Live-Zeit verwenden</button>}
   </div>
   <small>Die Vorschau verändert die Spotify-Position nicht. Fehlende Avatar-Slots werden in der Live-Bühne ignoriert.
    Start ist inklusive, Ende exklusiv. Bei überlappenden Zeitmarken gewinnt die zuletzt gespeicherte.</small>
  </>}
 </fieldset>;
}
