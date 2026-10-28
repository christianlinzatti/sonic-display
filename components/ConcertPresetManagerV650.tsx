"use client";
import {useEffect,useRef,useState} from "react";
import type {UiPreferences} from "@/types/music";
import type {KioskView} from "./TouchKioskControls";
import type {TouchReadabilityV648} from "./touchDisplayPolicyV648";
import type {SmartPresetAutomationUiV651} from "./useSmartPresetAutomationV651";
import {captureConcertPresetV650,emptyPresetLibraryV650,FACTORY_PRESETS_V650,MAX_CUSTOM_PRESETS_V650,mergePresetLibraryV650,
 parsePresetLibraryV650,PRESET_STORAGE_KEY_V650,type ConcertPresetV650,type PresetLibraryV650} from "./concertPresetsV650";

type Props={preferences:UiPreferences;view:KioskView;readability:TouchReadabilityV648;displayProfile:"off"|"auto"|"eco"|"sharp";onApply:(preset:ConcertPresetV650)=>void;onActivity:()=>void;automationV651:SmartPresetAutomationUiV651};
function readStoredV650():{library:PresetLibraryV650;error:string}{
 try{const stored=localStorage.getItem(PRESET_STORAGE_KEY_V650);
  if(stored===null)return {library:emptyPresetLibraryV650(),error:""};
  const library=parsePresetLibraryV650(stored);
  return library?{library,error:""}:{library:emptyPresetLibraryV650(),error:"Gespeicherte Profile sind ungültig. Sie wurden nicht überschrieben."};
 }catch{return {library:emptyPresetLibraryV650(),error:"Lokale Profildaten konnten nicht gelesen werden."};}
}
export function ConcertPresetManagerV650({preferences,view,readability,displayProfile,onApply,onActivity,automationV651}:Props){
 const [library,setLibrary]=useState<PresetLibraryV650>(emptyPresetLibraryV650);
 const [name,setName]=useState("");
 const [message,setMessage]=useState("");
 const [loaded,setLoaded]=useState(false);
 const [deletePending,setDeletePending]=useState<string|null>(null);
 const fileRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{const stored=readStoredV650();setLibrary(stored.library);setMessage(stored.error);setLoaded(true);},[]);
 const persist=(next:PresetLibraryV650)=>{
  if(!loaded)return false;
  try{localStorage.setItem(PRESET_STORAGE_KEY_V650,JSON.stringify(next));setLibrary(next);return true;}
  catch{setMessage("Speichern im Browser nicht möglich. Bitte Speicherplatz oder Browser-Berechtigungen prüfen.");return false;}
 };
 const save=()=>{
  const clean=name.trim().replace(/\s+/g," ");
  if(clean.length<2||clean.length>40){setMessage("Profilname: 2 bis 40 Zeichen.");return;}
  if(library.profiles.length>=MAX_CUSTOM_PRESETS_V650){setMessage("Maximal 12 eigene Profile. Zuerst eines löschen.");return;}
  if([...FACTORY_PRESETS_V650,...library.profiles].some(p=>p.name.toLocaleLowerCase("de")===clean.toLocaleLowerCase("de"))){setMessage("Dieser Profilname existiert bereits.");return;}
  const id=`custom:${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
  const preset=captureConcertPresetV650(id,clean,preferences,view,readability,displayProfile);
  if(!preset){setMessage("Die aktuellen Einstellungen können nicht als Profil gespeichert werden.");return;}
  if(persist({...library,profiles:[...library.profiles,preset]})){setName("");setMessage(`„${clean}“ gespeichert.`);onActivity();}
 };
 const erase=(id:string)=>{
  if(deletePending!==id){setDeletePending(id);setMessage("Zum Löschen dieselbe Taste erneut antippen.");return;}
  const prior=library.profiles.find(p=>p.id===id);if(!prior)return;
  if(persist({...library,profiles:library.profiles.filter(p=>p.id!==id)})){setDeletePending(null);setMessage(`„${prior.name}“ gelöscht.`);onActivity();}
 };
 const exportLibrary=()=>{
  if(!loaded)return;
  try{const blob=new Blob([JSON.stringify(library,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);
   const anchor=document.createElement("a");anchor.href=url;anchor.download="sonic-display-v650-concert-presets.json";document.body.appendChild(anchor);anchor.click();anchor.remove();
   window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   setMessage("JSON-Export der eigenen Profile gestartet.");
  }catch{setMessage("Datei-Export im Browser nicht verfügbar.");}
 };
 const importLibrary=async(file:File|undefined)=>{
  if(!file)return;
  if(file.size>65536){if(fileRef.current)fileRef.current.value="";setMessage("Import abgelehnt: Die JSON-Datei ist zu groß (maximal 64 KiB).");return;}
  try{const incoming=parsePresetLibraryV650(await file.text());
   if(!incoming){setMessage("Import abgelehnt: falsches Format, ungültige Werte oder unbekannte Steuerfelder.");return;}
   const merged=mergePresetLibraryV650(library,incoming);
   if(merged.added===0){setMessage(`Keine neuen Profile (${merged.skipped} bereits vorhanden oder kein Platz).`);return;}
   if(persist(merged.library)){setMessage(`${merged.added} Profile importiert; ${merged.skipped} übersprungen. Bestehende Profile wurden nicht überschrieben.`);onActivity();}
  }catch{setMessage("Die Datei konnte nicht eingelesen werden.");}
  finally{if(fileRef.current)fileRef.current.value="";}
 };
 const display=(preset:ConcertPresetV650,custom:boolean)=><div className="v650-profile" key={preset.id}>
  <div className="v650-profile-head"><strong>{preset.name}</strong>{custom&&<small>Eigenes Profil</small>}</div>
  <p>{preset.description}</p>
  <div className="v650-profile-actions"><button type="button" onClick={()=>{onApply(preset);setMessage(`„${preset.name}“ angewendet. Rückgängig ist unten möglich.`);onActivity();}}>Anwenden</button>
   {custom&&<button type="button" className="v650-delete" aria-label={`Profil ${preset.name} löschen`} onClick={()=>erase(preset.id)}>{deletePending===preset.id?"Löschen bestätigen":"Löschen"}</button>}</div>
 </div>;
 return <section className="v650-presets" aria-label="Smarte Konzertprofile">
   <h3>Smart Concert Presets</h3><p>Ein Fingertipp übernimmt Bühne, Lyrics, Kamera, Avatar- und Lichtregler sowie bei eigenen Profilen das Display-Leistungsprofil. Song, Sängerzuweisungen und manuelle Timelines bleiben unverändert.</p>
   <section className="v651-automation" aria-label="Automatische Konzertprofile">
    <h4>V651 · Intelligente Profilwahl</h4>
    <p>Die Genre-Sicherheit stammt aus vorhandenen Metadaten (heuristisch, keine Audioanalyse). Manuelle Steuerungen haben Vorrang.</p>
    <fieldset className="v651-modes"><legend>Profilwechsel</legend>
     {([{value:"off",label:"Aus"},{value:"suggest",label:"Nur vorschlagen"},{value:"auto",label:"Automatisch · nur bei hoher Sicherheit"}] as const).map(option=><label key={option.value}><input type="radio" name="v651-automation-mode" value={option.value} checked={automationV651.mode===option.value} onChange={()=>{automationV651.setMode(option.value);onActivity();}}/>{option.label}</label>)}
    </fieldset>
    <p className="v651-evidence" role="status" aria-live="polite">{automationV651.reason}{automationV651.canSuggest?` · Wert: ${automationV651.score}/100`:""}</p>
    {automationV651.canSuggest&&automationV651.preset&&<div className="v651-suggestion"><strong>Vorschlag: {automationV651.preset.name}</strong><button type="button" onClick={()=>{automationV651.applySuggested();onActivity();}}>Jetzt anwenden</button></div>}
    {automationV651.canUndo&&<button type="button" onClick={()=>{automationV651.undoLast();onActivity();}}>Letzten automatischen Profilwechsel rückgängig machen</button>}
    {automationV651.lastAction&&<p className="v651-evidence" role="status">{automationV651.lastAction}</p>}
   </section>
   <h4>Vorlagen</h4><div className="v650-grid">{FACTORY_PRESETS_V650.map(p=>display(p,false))}</div>
   <h4>Eigene Profile ({library.profiles.length}/{MAX_CUSTOM_PRESETS_V650})</h4>
   <label className="v650-name-label" htmlFor="v650-profile-name">Aktuelle Einstellungen speichern</label>
   <div className="v650-save-row"><input id="v650-profile-name" type="text" maxLength={40} value={name} onChange={e=>setName(e.target.value)} placeholder="Profilname" autoComplete="off"/>
     <button type="button" onClick={save} disabled={!loaded||library.profiles.length>=MAX_CUSTOM_PRESETS_V650}>Speichern</button></div>
   {library.profiles.length>0?<div className="v650-grid">{library.profiles.map(p=>display(p,true))}</div>:<p>Noch keine eigenen Profile gespeichert.</p>}
   <h4>Profile übertragen</h4><div className="v650-transfer">
     <button type="button" onClick={exportLibrary} disabled={!loaded}>JSON exportieren</button>
     <label>JSON importieren<input ref={fileRef} type="file" accept="application/json,.json" aria-label="Konzertprofile als JSON importieren" onChange={e=>{void importLibrary(e.target.files?.[0]);}}/></label>
   </div>
   {message&&<p className="v650-message" role="status" aria-live="polite">{message}</p>}
 </section>;
}
