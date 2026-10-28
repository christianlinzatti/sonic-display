"use client";
import {useEffect,useRef,useState} from "react";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {buildControlPatchV649,undoControlPatchV649,STAGES_V649,DANCE_STYLES_V649,V649_TABS,V649_TAB_LABELS,type ControlTabV649,type ControlKeyV649} from "./concertControlPolicyV649";
import type {KioskView} from "./TouchKioskControls";
import type {TouchReadabilityV648} from "./touchDisplayPolicyV648";
import type {UiPreferences} from "@/types/music";
import {ConcertPresetManagerV650} from "./ConcertPresetManagerV650";
import {sanitizeConcertPatchV650,type ConcertPresetV650} from "./concertPresetsV650";
import type {SmartPresetAutomationUiV651} from "./useSmartPresetAutomationV651";

type Props={onClose:()=>void,onActivity:()=>void,view:KioskView,setView:(view:KioskView)=>void,
  readability:TouchReadabilityV648,setReadability:(value:TouchReadabilityV648)=>void;displayProfile:"off"|"auto"|"eco"|"sharp";setDisplayProfile:(value:"off"|"auto"|"eco"|"sharp")=>void;automationV651:SmartPresetAutomationUiV651};
export function ConcertControlCenterV649({onClose,onActivity,view,setView,readability,setReadability,displayProfile,setDisplayProfile,automationV651}:Props){
 const {preferences,updatePreferences}=useUiPreferences();
 const [tab,setTab]=useState<ControlTabV649|"presets">("stage");
 const [undo,setUndo]=useState<Partial<UiPreferences>|null>(null);
 const [undoPresentationV650,setUndoPresentationV650]=useState<{view:KioskView;readability:TouchReadabilityV648;displayProfile:"off"|"auto"|"eco"|"sharp"}|null>(null);
 const closeRef=useRef<HTMLButtonElement>(null);
 const closeActionRef=useRef(onClose);
 useEffect(()=>{closeActionRef.current=onClose;},[onClose]);
 useEffect(()=>{closeRef.current?.focus();const onEscape=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.stopPropagation();closeActionRef.current();}};
   document.addEventListener("keydown",onEscape);return()=>document.removeEventListener("keydown",onEscape);},[]);
 const change=(key:ControlKeyV649,value:unknown)=>{
   const patch=buildControlPatchV649(key,value);
   if(!patch)return;
   automationV651.manualChange();
   const prior=undoControlPatchV649(preferences,patch);
   if(Object.keys(patch).every(k=>Object.is(preferences[k as keyof UiPreferences],patch[k as keyof UiPreferences])))return;
   setUndo(prior);setUndoPresentationV650(null);updatePreferences(patch);onActivity();
 };
 const applyProfileV650=(preset:ConcertPresetV650)=>{
   automationV651.manualChange();
   const safe=sanitizeConcertPatchV650(preset.patch);
   if(!safe)return;
   const changed=Object.fromEntries(Object.entries(safe).filter(([key,value])=>!Object.is(preferences[key as keyof UiPreferences],value))) as Partial<UiPreferences>;
   const presentationChanged=view!==preset.view||readability!==preset.readability||(preset.displayProfile!==undefined&&displayProfile!==preset.displayProfile);
   if(Object.keys(changed).length===0&&!presentationChanged)return;
   setUndo(undoControlPatchV649(preferences,changed));
   setUndoPresentationV650(presentationChanged?{view,readability,displayProfile}:null);
   if(Object.keys(changed).length)updatePreferences(changed);
   if(view!==preset.view)setView(preset.view);
   if(readability!==preset.readability)setReadability(preset.readability);
   if(preset.displayProfile!==undefined&&displayProfile!==preset.displayProfile)setDisplayProfile(preset.displayProfile);
   onActivity();
 };
 const rollback=()=>{if(!undo)return; if(Object.keys(undo).length)updatePreferences(undo);
   if(undoPresentationV650){setView(undoPresentationV650.view);setReadability(undoPresentationV650.readability);setDisplayProfile(undoPresentationV650.displayProfile);}
   setUndoPresentationV650(null);setUndo(null);onActivity();};
 const buttons=(items:readonly {value:string;label:string}[],active:string,choose:(value:string)=>void)=>
   <div className="v649-choices">{items.map(item=><button type="button" key={item.value} aria-pressed={active===item.value} onClick={()=>choose(item.value)}>{item.label}</button>)}</div>;
 const toggle=(title:string,key:ControlKeyV649,checked:boolean,detail?:string)=>
   <label className="v649-toggle"><span><strong>{title}</strong>{detail&&<small>{detail}</small>}</span>
     <input type="checkbox" checked={checked} onChange={e=>change(key,e.target.checked)}/></label>;
 const range=(title:string,key:ControlKeyV649,value:number,min=0,max=100)=>
   <label className="v649-range"><span>{title}<strong>{value}</strong></span>
     <input type="range" min={min} max={max} step={1} value={value} onChange={e=>change(key,Number(e.target.value))}/></label>;
 return <aside className="v649-control-panel" role="dialog" aria-modal="false" aria-label="Interaktive Konzertsteuerung V649" onPointerDown={onActivity}>
   <header className="v649-heading"><div><strong>Konzertsteuerung</strong><small>Live · Änderungen wirken sofort</small></div>
     <button type="button" ref={closeRef} aria-label="Konzertsteuerung schließen" onClick={onClose}>✕</button></header>
   <div className="v649-tabs" role="tablist" aria-label="Steuerungsbereiche">
     {V649_TABS.map(t=><button key={t} type="button" role="tab" id={`v649-tab-${t}`} aria-selected={tab===t} aria-controls="v649-content" onClick={()=>{setTab(t);onActivity();}}>{V649_TAB_LABELS[t]}</button>)}
     <button type="button" role="tab" id="v649-tab-presets" aria-selected={tab==="presets"} aria-controls="v649-content" onClick={()=>{setTab("presets");onActivity();}}>Profile</button>
   </div>
   <div id="v649-content" role="tabpanel" aria-labelledby={`v649-tab-${tab}`} className="v649-panel-body">
    {tab==="presets"&&<ConcertPresetManagerV650 preferences={preferences} view={view} readability={readability} displayProfile={displayProfile} onApply={applyProfileV650} onActivity={onActivity} automationV651={automationV651}/>}
    {tab==="stage"&&<>
      <h3>Bühne auswählen</h3><p>Der Bühnenstil verwendet dieselbe Auswahl wie die Einstellungen.</p>
      {buttons(STAGES_V649,preferences.stageTheme,value=>change("stageTheme",value))}
      {toggle("Beatreaktion der Bühne","stageReactive",preferences.stageReactive,"Manuelle Lichtprogramme bleiben unverändert.")}
    </>}
    {tab==="camera"&&<>
      <h3>Sänger-Kamera</h3><p>Die vorhandene Vocal-Kamera steuern. Manuelle Kamerazeitleisten und andere Regisseure können Vorrang haben.</p>
      {buttons([{value:"off",label:"Aus"},{value:"auto",label:"Auto"},{value:"performance",label:"Performance"}],preferences.avatarVocalCameraV369??"auto",value=>change("avatarVocalCameraV369",value))}
      {range("Vocal-Kamera-Stärke","avatarVocalCameraStrengthV369",preferences.avatarVocalCameraStrengthV369??55)}
      {toggle("Rap-Kamera-Regie","rapCameraEnabledV429",preferences.rapCameraEnabledV429??false,"Greift nur, wenn die Rap-Regie aktiv ist.")}
    </>}
    {tab==="lyrics"&&<>
      <h3>Lyrics-Darstellung</h3><p>Ansicht und Touch-Lesbarkeit lassen sich ändern, ohne den Song neu zu starten.</p>
      {buttons([{value:"stage",label:"Bühne"},{value:"split",label:"Mix"},{value:"lyrics",label:"Lyrics"}],view,value=>{automationV651.manualChange();setView(value as KioskView);onActivity();})}
      <h4>Lesbarkeit am Touchdisplay</h4>
      {buttons([{value:"standard",label:"Normal"},{value:"clear",label:"Klar"},{value:"large",label:"Groß"}],readability,value=>{automationV651.manualChange();setReadability(value as TouchReadabilityV648);onActivity();})}
      {range("Eigene Schriftgröße","lyricsFontSize",preferences.lyricsFontSize,40,240)}
      {toggle("Lyrics-Fokus","lyricsFocusMode",preferences.lyricsFocusMode??true)}
      {toggle("Immersive Lyrics","lyricsImmersiveEnabled",preferences.lyricsImmersiveEnabled,"Die aktuelle Bühnenansicht bleibt auswählbar.")}
    </>}
    {tab==="avatars"&&<>
      <h3>Avatar-Performance</h3><p>Bestehende Besetzung und Tanzstile steuern. Keine automatische Sängerzuweisung.</p>
      <h4>Ensemble</h4>
      {buttons([{value:"solo",label:"Solo"},{value:"sync",label:"Sync"},{value:"mirror",label:"Spiegel"},{value:"duet",label:"Duett"}],preferences.multiAvatarMode??"solo",value=>change("multiAvatarMode",value))}
      <h4>Tanzstil</h4>
      {buttons(DANCE_STYLES_V649,preferences.avatarDancePreset,value=>change("avatarDancePreset",value))}
      {toggle("Lip-Sync aktiv","avatarLipSyncEnabled",preferences.avatarLipSyncEnabled??true,"Vorhandene Visem-Timelines werden nicht verändert.")}
    </>}
    {tab==="light"&&<>
      <h3>Licht und Effekte</h3><p>Die vorhandenen 3D-Lichter und Bühnendetails einstellen – ohne neue Lichtobjekte.</p>
      {range("Bühnenlicht","stageLightStrength",preferences.stageLightStrength)}
      {toggle("Bühnendetails","concertDetailEnabledV555",preferences.concertDetailEnabledV555??true)}
      {range("Detail-Intensität","concertDetailStrengthV555",preferences.concertDetailStrengthV555??45)}
      {toggle("Bewegung reduzieren","reducedMotion",preferences.reducedMotion,"Kann Bühnenanimationen und Effekte beruhigen.")}
    </>}
   </div>
   <footer className="v649-footer"><button type="button" disabled={!undo} onClick={rollback}>↶ Letzte Änderung zurück</button>
     <button type="button" onClick={onClose}>Fertig</button></footer>
 </aside>;
}
