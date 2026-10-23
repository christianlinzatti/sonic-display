'use client';
import {useState} from 'react';
import {analyzeAssetReferences,compareBackups,createSnapshot,loadSnapshots,removeSnapshot,type NamedSnapshot,type ReferencedAsset} from '@/services/settings/backupManager';
import {applyUnifiedBackup,createUnifiedBackup,previewUnifiedBackup,type BackupGroup} from '@/services/settings/unifiedBackup';
const groups:BackupGroup[]=['genre','lighting','timeline','avatar','device','ui'];
export function BackupMigrationAssistant(){
 const [snapshots,setSnapshots]=useState<NamedSnapshot[]|null>(null);
 const [name,setName]=useState('Vor Gerätewechsel');
 const [selected,setSelected]=useState('');
 const [overwrite,setOverwrite]=useState(false);
 const [checks,setChecks]=useState<Record<string,'found'|'missing'|'unknown'|'checking'>>({});
 const [status,setStatus]=useState('');
 const all=snapshots??[];
 const active=all.find(s=>s.id===selected);
 const assets=active?analyzeAssetReferences(active.data):[];
 const current=active?createUnifiedBackup(localStorage):null;
 const comparison=active&&current?compareBackups(active.data,current):null;
 const initialize=()=>setSnapshots(loadSnapshots(localStorage));
 const save=()=>{try{const next=createSnapshot(localStorage,name);setSnapshots(next);setSelected(next[0]?.id||'');setStatus('Sicherung lokal gespeichert. Für einen Gerätewechsel zusätzlich JSON exportieren.');}catch(e){setStatus(e instanceof Error?e.message:'Sicherung fehlgeschlagen.');}};
 const exportSelected=()=>{if(!active)return;const blob=new Blob([JSON.stringify(active.data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sonic-display-migration-'+active.createdAt.slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const checkAssets=async()=>{
  const next:Record<string,'found'|'missing'|'unknown'|'checking'>={};for(const a of assets)next[a.path]=a.kind==='local'?'checking':'unknown';setChecks(next);
  for(const asset of assets.filter(a=>a.kind==='local')){
   try{const response=await fetch(asset.path,{method:'HEAD',cache:'no-store'});next[asset.path]=response.ok?'found':'missing';}
   catch{next[asset.path]='unknown';}
   setChecks({...next});
  }
  setStatus('Dateiprüfung beendet. Externe URLs und Browser-Blob-Referenzen müssen manuell überprüft werden.');
 };
 const restore=()=>{if(!active)return;const preview=previewUnifiedBackup(active.data,localStorage);const changed=preview.newKeys.length+(overwrite?preview.conflicts.length:0);if(!changed){setStatus('Keine neuen Einstellungen zu übernehmen.');return;}
  if(!window.confirm(`${changed} Einstellungen wiederherstellen? ${overwrite?'Konflikte werden überschrieben.':'Vorhandene Einstellungen bleiben erhalten.'}`))return;
  try{const count=applyUnifiedBackup(preview,localStorage,{overwrite,groups});setStatus(`${count} Einstellungen wiederhergestellt. App neu laden.`);}catch{setStatus('Fehler beim Wiederherstellen; Rücknahme wurde versucht.');}
 };
 return <section aria-label="V185 Backup Manager und Migration" style={{border:'1px solid #64748b',borderRadius:12,padding:14,margin:'14px 0'}}>
  <h3>V185 · Backup Manager & Gerätewechsel</h3>
  <p>Benannte Browser-Sicherungen und Checkliste für den PC-/Raspberry-Pi-Umzug. Lokale Sicherungen bleiben ausschließlich auf diesem Gerät – zur Übertragung JSON exportieren.</p>
  {snapshots===null?<button type="button" onClick={initialize}>Backup Manager öffnen</button>:<>
   <label>Sicherungsname <input value={name} maxLength={70} onChange={e=>setName(e.target.value)}/></label>
   <button type="button" onClick={save}>Neue lokale Sicherung erstellen</button>
   <label style={{display:'block',marginTop:8}}>Gespeicherte Sicherung
    <select value={selected} onChange={e=>{setSelected(e.target.value);setChecks({});}}><option value="">Bitte wählen</option>{all.map(s=><option key={s.id} value={s.id}>{s.name} · {s.createdAt.slice(0,16).replace('T',' ')}</option>)}</select>
   </label>
   {active&&comparison&&<div role="region" aria-label="Sicherungsvergleich">
    <p><strong>Vergleich zum aktuellen Gerät:</strong> {comparison.added.length} nur im Backup · {comparison.changed.length} unterschiedlich · {comparison.unchanged} identisch · {comparison.removed.length} nur auf diesem Gerät.</p>
    <p>{Object.entries(comparison.groups).map(([k,v])=>`${k}: ${v}`).join(' · ')}</p>
    <button type="button" onClick={exportSelected}>Sicherung als JSON exportieren</button>
    <label style={{display:'block'}}><input type="checkbox" checked={overwrite} onChange={e=>setOverwrite(e.target.checked)}/> Bestehende Werte beim Wiederherstellen überschreiben</label>
    <button type="button" onClick={restore}>Diese Sicherung wiederherstellen</button>
    <button type="button" onClick={()=>{if(window.confirm('Lokale Sicherung löschen?')){setSnapshots(removeSnapshot(localStorage,active.id));setSelected('');}}}>Sicherung löschen</button>
    <h4>Gerätewechsel · Asset-Vollständigkeit</h4>
    <p>Die JSON-Datei enthält keine hochgeladenen GLB/FBX/VRM-Dateien. Referenzen werden nur in gespeicherten Avatar-Einstellungen gesucht. Nicht gespeicherte und dynamisch geladene Dateien können fehlen.</p>
    <p>{assets.length} erkennbare Datei-Referenzen</p>
    <button type="button" onClick={()=>void checkAssets()} disabled={!assets.some(a=>a.kind==='local')}>Erreichbarkeit lokaler Dateien prüfen</button>
    {assets.map((asset:ReferencedAsset)=><p key={asset.path} style={{overflowWrap:'anywhere'}}>{checks[asset.path]||'ungeprüft'} · {asset.kind} · {asset.path}</p>)}
    <p><strong>Migrations-Checkliste:</strong> 1. JSON exportieren. 2. Avatar-/Animationsdateien separat kopieren. 3. Auf dem Zielgerät über V184 importieren. 4. Gespeicherte Pfade und Darstellungsqualität überprüfen.</p>
   </div>}
  </>}
  {status&&<p role="status">{status}</p>}
 </section>;
}
