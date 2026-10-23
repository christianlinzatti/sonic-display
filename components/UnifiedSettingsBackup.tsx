"use client";
import { useRef, useState } from "react";
import {applyUnifiedBackup,createUnifiedBackup,parseUnifiedBackup,previewUnifiedBackup,MAX_BACKUP_BYTES,groupForBackupKey,type BackupGroup,type BackupPreview} from "@/services/settings/unifiedBackup";
const GROUPS:Array<[BackupGroup,string]> = [["genre","Genre-Korrekturen"],["lighting","Licht-Presets und Lernwerte"],["timeline","Song-Licht-Timelines"],["avatar","Avatar- und Choreografie-Einstellungen"],["device","Raspberry-Pi und Display"],["ui","Oberflächen-Einstellungen"]];
export function UnifiedSettingsBackup(){
 const file=useRef<HTMLInputElement>(null);
 const [preview,setPreview]=useState<BackupPreview|null>(null);
 const [selection,setSelection]=useState<BackupGroup[]>(GROUPS.map(([group])=>group));
 const [overwrite,setOverwrite]=useState(false);
 const [message,setMessage]=useState("");
 const exportData=()=>{try{
  const backup=createUnifiedBackup(localStorage);
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=`sonic-display-settings-v184-${new Date().toISOString().slice(0,10)}.json`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  setMessage(`${Object.keys(backup.entries).length} Einstellungen exportiert.`);
 }catch{setMessage("Export fehlgeschlagen.");}};
 const readFile=async(incoming:File|null)=>{setPreview(null);if(!incoming)return;try{
  if(incoming.size>MAX_BACKUP_BYTES)throw new Error("Datei zu groß.");
  const data=parseUnifiedBackup(await incoming.text());setPreview(previewUnifiedBackup(data,localStorage));setMessage("Sicherung geprüft. Bitte Import-Bereiche auswählen.");
 }catch(e){setMessage(e instanceof Error?e.message:"Import fehlgeschlagen.");}};
 const restore=()=>{if(!preview||!selection.length)return;
  const num=preview.newKeys.filter(k=>selection.includes(groupForBackupKey(k)!)).length+(overwrite?preview.conflicts.filter(k=>selection.includes(groupForBackupKey(k)!)).length:0);
  if(num===0){setMessage("Keine neuen Einstellungen ausgewählt.");return;}
  if(!window.confirm(`${num} Einstellungen importieren? ${overwrite?"Bestehende Werte werden ersetzt.":"Vorhandene Werte bleiben erhalten."} Vorher am besten eine Sicherung exportieren.`))return;
  try{const applied=applyUnifiedBackup(preview,localStorage,{overwrite,groups:selection});setPreview(null);setMessage(`${applied} Einstellungen importiert. Seite neu laden, um sie zu aktivieren.`);}catch{setMessage("Import fehlgeschlagen; Wiederherstellung vorheriger Werte wurde versucht.");}
 };
 return <section aria-label="V184 Unified Settings Backup" style={{border:"1px solid #64748b",padding:14,borderRadius:12,margin:"16px 0"}}>
  <h3>V184 · Gesamteinstellungen sichern</h3>
  <p>Persönliche Genre-Korrekturen, Lichtshows, Avatare und Geräteeinstellungen lokal als JSON übertragen. Spotify-Zugangsdaten und andere Geheimnisse werden nicht exportiert.</p>
  <button type="button" onClick={exportData}>Gesamteinstellungen exportieren</button>
  <label style={{display:"block",marginTop:12}}>JSON-Sicherung importieren
   <input ref={file} type="file" accept=".json,application/json" onChange={e=>void readFile(e.target.files?.[0]??null)}/>
  </label>
  {preview&&<div role="region" aria-label="Import-Vorschau">
   <h4>Import-Vorschau</h4>
   <p>{preview.newKeys.length} neu · {preview.conflicts.length} Konflikte · {preview.same.length} unverändert</p>
   {GROUPS.map(([group,label])=><label key={group} style={{display:"block",padding:3}}><input type="checkbox" checked={selection.includes(group)} onChange={e=>setSelection(s=>e.target.checked?[...s,group]:s.filter(g=>g!==group))}/> {label} ({preview.counts[group]})</label>)}
   <label style={{display:"block",marginTop:8}}><input type="checkbox" checked={overwrite} onChange={e=>setOverwrite(e.target.checked)}/> Konflikte ersetzen (bestehende Einstellungen überschreiben)</label>
   <button type="button" onClick={restore} disabled={selection.length===0}>Ausgewählte Einstellungen wiederherstellen</button>
   <button type="button" onClick={()=>setPreview(null)}>Abbrechen</button>
  </div>}
  {message&&<p role="status">{message}</p>}
 </section>;
}
