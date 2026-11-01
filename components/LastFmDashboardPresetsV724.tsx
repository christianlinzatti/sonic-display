'use client';
import {useEffect,useState,type ReactNode} from 'react';
import {LastFmDashboardStudioV723} from '@/components/LastFmDashboardStudioV723';
import type {V723Layout,V723WidgetId} from '@/lib/lastfm-dashboard-layout-v723';
import {
 activeDashboardPresetV724,createDashboardPresetV724,dashboardPresetsKeyV724,defaultDashboardPresetsV724,
 deleteDashboardPresetV724,isBuiltInDashboardPresetV724,readDashboardPresetsV724,
 renameDashboardPresetV724,resetActiveDashboardPresetV724,selectDashboardPresetV724,
 updateActiveDashboardLayoutV724,validPresetNameV724,writeDashboardPresetsV724,
 V724_MAX_PRESETS,type V724PresetState
} from '@/lib/lastfm-dashboard-presets-v724';

type Props={account:string;widgets:Record<V723WidgetId,ReactNode>};
/** Preset switcher owns V723's existing editor in controlled mode; archive remains read-only. */
export function LastFmDashboardPresetsV724({account,widgets}:Props){
 const [state,setState]=useState<V724PresetState>(defaultDashboardPresetsV724);
 const [loadedAccount,setLoadedAccount]=useState<string|null>(null);
 const [status,setStatus]=useState('');
 const [name,setName]=useState('');
 const [rename,setRename]=useState('');
 const [showManage,setShowManage]=useState(false);
 useEffect(()=>{
  const load=()=>{
   try{const data=readDashboardPresetsV724(window.localStorage,account);setState(data.state);setStatus(data.warning??(data.migrated?'Dein V723-Layout wurde ins persönliche Preset übernommen.':''));}
   catch{setState(defaultDashboardPresetsV724());setStatus('Browserspeicher nicht verfügbar. Presets bleiben nur bis zum Neuladen erhalten.');}
   setLoadedAccount(account);
  };
  setLoadedAccount(null);load();
  const key=dashboardPresetsKeyV724(account);
  const onOtherTab=(event:StorageEvent)=>{if(key&&(event.key===key||event.key===null))load();};
  window.addEventListener('storage',onOtherTab);return()=>window.removeEventListener('storage',onOtherTab);
 },[account]);
 function commit(next:V724PresetState,message:string){
  setState(next);
  try{setStatus(writeDashboardPresetsV724(window.localStorage,account,next)?message:'Speichern nicht möglich. Änderungen bleiben nur in dieser Ansicht.');}
  catch{setStatus('Browserspeicher nicht verfügbar. Änderungen bleiben nur in dieser Ansicht.');}
 }
 const ready=loadedAccount===account;
 // Avoid displaying another account's custom preset names during an account switch.
 const displayState=ready?state:defaultDashboardPresetsV724();
 const active=activeDashboardPresetV724(displayState);
 const custom=!isBuiltInDashboardPresetV724(active.id);
 function create(){const result=createDashboardPresetV724(state,name.trim());if(!result){setStatus('Ungültiger oder bereits verwendeter Name. Maximal 16 Presets mit je 40 Zeichen.');return;}commit(result,`Preset „${name.trim()}“ gespeichert.`);setName('');setRename('');}
 function applyRename(){const result=renameDashboardPresetV724(state,active.id,rename.trim());if(!result){setStatus('Der Name ist ungültig oder bereits vergeben.');return;}commit(result,'Preset umbenannt.');setRename('');}
 function remove(){const result=deleteDashboardPresetV724(state,active.id);if(result){commit(result,'Eigenes Preset gelöscht.');setRename('');}}
 return <section className="lastfm-presets-v724" aria-label="Smart Dashboard Presets">
  <div className="lastfm-presets-top-v724">
   <div><span>V724 · SMART DASHBOARD PRESETS</span><h5>Deine Ansichten</h5><p>Ein Fingertipp wechselt die Dashboard-Anordnung. Jedes Preset speichert eigene Kachelgrößen und Sichtbarkeit.</p></div>
   <button type="button" aria-expanded={showManage} aria-controls="lastfm-presets-manage-v724" onClick={()=>setShowManage(v=>!v)} disabled={!ready}>{showManage?'Preset-Verwaltung schließen':'Presets verwalten'}</button>
  </div>
  <div className="lastfm-presets-switch-v724" role="group" aria-label="Dashboard-Ansicht auswählen">
   {displayState.presets.map(p=><button key={p.id} type="button" disabled={!ready} aria-pressed={active.id===p.id} onClick={()=>{commit(selectDashboardPresetV724(state,p.id),`Ansicht „${p.name}“ ausgewählt.`);setRename('');}}>{p.name}</button>)}
  </div>
  {showManage&&<div className="lastfm-presets-manage-v724" id="lastfm-presets-manage-v724">
   <div><label htmlFor="lastfm-presets-new-v724">Aktuelles Layout unter neuem Namen sichern</label><div><input id="lastfm-presets-new-v724" type="text" maxLength={40} value={name} placeholder="Name für neues Preset" onChange={(e:{target:{value:string}})=>setName(e.target.value)} disabled={!ready||state.presets.length>=V724_MAX_PRESETS}/><button type="button" disabled={!ready||!validPresetNameV724(name.trim())||state.presets.length>=V724_MAX_PRESETS} onClick={create}>Kopie speichern</button></div></div>
   {custom&&<div><label htmlFor="lastfm-presets-rename-v724">Eigenes Preset umbenennen</label><div><input id="lastfm-presets-rename-v724" type="text" maxLength={40} value={rename} placeholder={active.name} onChange={(e:{target:{value:string}})=>setRename(e.target.value)}/><button type="button" disabled={!ready||!validPresetNameV724(rename.trim())} onClick={applyRename}>Umbenennen</button><button type="button" disabled={!ready} onClick={remove}>Preset löschen</button></div></div>}
   <p>Die fünf Grundansichten bleiben vorhanden. Du kannst alle Layouts bearbeiten und zurücksetzen, eigene Presets zusätzlich umbenennen oder löschen. Maximal {V724_MAX_PRESETS} Presets.</p>
  </div>}
  {status&&<p className="lastfm-presets-status-v724" role="status">{status}</p>}
  {ready?<LastFmDashboardStudioV723 account={account} widgets={widgets} controlledLayout={active.layout} onLayoutChange={(layout:V723Layout)=>commit(updateActiveDashboardLayoutV724(state,layout),'Aktuelles Preset automatisch gespeichert.')} onRestorePreset={()=>commit(resetActiveDashboardPresetV724(state),'Preset auf seine Standardanordnung zurückgesetzt.')}/>:<p role="status">Ansichten werden geladen …</p>}
  <p className="lastfm-presets-note-v724">Presets werden ausschließlich im Browser für dieses Last.fm-Konto gespeichert. Dein altes V723-Layout wird beim ersten Öffnen übernommen und bleibt als Sicherung erhalten. Keine zusätzlichen Last.fm-Abfragen oder Scrobbles.</p>
 </section>;
}
