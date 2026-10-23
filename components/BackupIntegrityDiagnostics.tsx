'use client';
import {useState,type ChangeEvent} from 'react';
import {createUnifiedBackup,previewUnifiedBackup,groupForBackupKey,type BackupData,type BackupGroup} from '@/services/settings/unifiedBackup';
import {createIntegrityEnvelope,verifyIntegrityEnvelope,createMigrationReport,applyMigration,type MigrationReport} from '@/services/settings/backupIntegrity';
const groups:BackupGroup[]=['genre','lighting','timeline','avatar','device','ui'];
const download=(name:string,value:unknown)=>{const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
export function BackupIntegrityDiagnostics(){
 const [incoming,setIncoming]=useState<BackupData|null>(null),[verified,setVerified]=useState(false),[legacy,setLegacy]=useState(false),[error,setError]=useState(''),[report,setReport]=useState<MigrationReport|null>(null);
 const [selected,setSelected]=useState<BackupGroup[]>(groups),[overwrite,setOverwrite]=useState(false),[checks,setChecks]=useState<Record<string,'found'|'missing'|'unknown'>>({});
 const [busy,setBusy]=useState(false);
 const preview=incoming?previewUnifiedBackup(incoming,localStorage):null;
 const assets=incoming?createMigrationReport(incoming,localStorage,verified,checks).assets:[];
 const exportVerified=async()=>{setBusy(true);setError('');try{const value=await createIntegrityEnvelope(createUnifiedBackup(localStorage));download('sonic-display-v186-verified-backup.json',value);}catch(e){setError(String(e));}finally{setBusy(false);}};
 const importFile=async(e:ChangeEvent<HTMLInputElement>)=>{setIncoming(null);setReport(null);setError('');setChecks({});const file=e.target.files?.[0];if(!file)return;setBusy(true);try{if(file.size>2*1024*1024+4096)throw new Error('Datei zu groß.');const result=await verifyIntegrityEnvelope(await file.text());setIncoming(result.backup);setVerified(result.verified);setLegacy(result.legacy);}catch(ex){setError(ex instanceof Error?ex.message:'Ungültige Sicherung.');}finally{setBusy(false);e.target.value='';}};
 const checkAssets=async()=>{setBusy(true);const result:typeof checks={...checks};for(const asset of assets){if(asset.kind!=='local'){result[asset.path]='unknown';continue;}try{const response=await fetch(asset.path,{method:'HEAD',cache:'no-store'});result[asset.path]=response.ok?'found':'missing';}catch{result[asset.path]='unknown';}setChecks({...result});}setBusy(false);};
 const apply=()=>{if(!incoming||!preview)return;const count=preview.newKeys.filter(k=>selected.includes(groupForBackupKey(k) as BackupGroup)).length+(overwrite?preview.conflicts.filter(k=>selected.includes(groupForBackupKey(k) as BackupGroup)).length:0);if(!window.confirm(`${count} mögliche Änderungen. Jetzt Einstellungen importieren? ${overwrite?'Bestehende Daten dürfen überschrieben werden.':'Bestehende Daten bleiben geschützt.'}`))return;try{setReport({...applyMigration(incoming,localStorage,selected,overwrite,verified),assetStatus:checks});setError('');}catch(e){setError(e instanceof Error?e.message:'Wiederherstellung fehlgeschlagen.');}};
 return <section aria-label="V186 Backup Integrity und Migrationsdiagnose" style={{border:'1px solid #64748b',borderRadius:12,padding:14,margin:'14px 0'}}>
  <h3>V186 · Backup Integrity & Migration Diagnostics</h3>
  <p>SHA-256 prüft, ob die exportierten Einstellungsdaten unverändert sind. Die Prüfsumme ist keine digitale Signatur und schützt nicht gegen absichtlich gefälschte Backups.</p>
  <button type="button" disabled={busy} onClick={()=>void exportVerified()}>Backup mit SHA-256 exportieren</button>
  <label style={{display:'block',marginTop:8}}>Sicherung prüfen (V186 oder ältere V184-JSON-Datei) <input type="file" accept=".json,application/json" disabled={busy} onChange={e=>void importFile(e)}/></label>
  {incoming&&preview&&<div role="region" aria-label="Integritätsprüfung und Migrationsvorschau">
   <p role="status">{verified?'SHA-256 stimmt überein.':legacy?'Altes V184-Backup ohne Prüfsumme: nicht verifiziert.':'Nicht verifiziert.'}</p>
   <p>{preview.newKeys.length} neue · {preview.conflicts.length} Konflikte · {preview.same.length} identische Werte.</p>
   {groups.map(group=><label key={group} style={{display:'inline-block',marginRight:10}}><input type="checkbox" checked={selected.includes(group)} onChange={e=>setSelected(s=>e.target.checked?[...s,group]:s.filter(g=>g!==group))}/>{group} ({preview.counts[group]})</label>)}
   <label style={{display:'block'}}><input type="checkbox" checked={overwrite} onChange={e=>setOverwrite(e.target.checked)}/> Konflikte bewusst überschreiben</label>
   <h4>Migrationsdiagnose: referenzierte Assets</h4>
   <p>Binäre GLB/FBX/VRM-Dateien sind nicht im JSON enthalten. Eine HEAD-Prüfung bestätigt nur die aktuelle URL, nicht das Vorhandensein auf dem Zielgerät.</p>
   <button type="button" disabled={busy||!assets.length} onClick={()=>void checkAssets()}>Assets prüfen</button>
   {assets.map(asset=><p key={asset.path} style={{overflowWrap:'anywhere'}}>{checks[asset.path]||'ungeprüft'} · {asset.kind} · {asset.path}</p>)}
   <button type="button" disabled={busy||!selected.length} onClick={apply}>Geprüfte Einstellungen übernehmen</button>
   <button type="button" onClick={()=>download('sonic-display-v186-migration-preview.json',createMigrationReport(incoming,localStorage,verified,checks))}>Diagnosebericht exportieren</button>
  </div>}
  {report&&<div role="status"><p><strong>Migrationsbericht:</strong> {report.applied} Einstellungen geschrieben. Bitte App neu laden.</p><button type="button" onClick={()=>download('sonic-display-v186-migration-report.json',report)}>Migrationsbericht als JSON</button>{report.warnings.map(w=><p key={w}>{w}</p>)}</div>}
  {error&&<p role="alert">{error}</p>}
 </section>;
}
