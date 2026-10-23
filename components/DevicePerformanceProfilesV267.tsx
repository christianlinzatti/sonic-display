'use client';
import {useEffect,useMemo,useState} from 'react';
import {currentDeviceFingerprint} from '@/components/visualizer/deviceCalibrationProfiles';
import {setPerformanceMode,useAdaptivePerformance} from '@/components/visualizer/adaptivePerformance';
import {readMultiAvatarDirectorEnabled,setMultiAvatarDirectorEnabled} from '@/components/visualizer/adaptiveMultiAvatarDirectorV260';
import {selectDeviceProfile} from '@/services/monitoring/smartDeviceAutoSelectionV269';
import {decodeProfiles,PROFILE_KEY,profileFromExperiment,recommendProfile,storeProfile,type DevicePerformanceProfile} from '@/services/monitoring/adaptivePerformanceProfilesV267';
import {exportProfileBackup,parseProfileBackup,mergeImportedProfiles,MAX_BACKUP_BYTES,type ParsedBackup,type ImportChoice} from '@/services/monitoring/performanceProfileBackupV268';
import type {PerformanceExperiment,ExperimentConfig} from '@/services/monitoring/performanceExperimentsV266';
export function DevicePerformanceProfilesV267({experiments}:{experiments:readonly PerformanceExperiment[]}){
 const performance=useAdaptivePerformance();
 const [fingerprint,setFingerprint]=useState('');
 const [profiles,setProfiles]=useState<DevicePerformanceProfile[]>([]);
 const [selectedExperiment,setSelectedExperiment]=useState('');
 const [label,setLabel]=useState('Mein Geräteprofil');
 const [preview,setPreview]=useState<DevicePerformanceProfile|null>(null);
 const [undo,setUndo]=useState<ExperimentConfig|null>(null);
 const [feedback,setFeedback]=useState('');
 const [director,setDirector]=useState(false);
 const [incoming,setIncoming]=useState<ParsedBackup|null>(null);
 const [choices,setChoices]=useState<ImportChoice[]>([]);
 useEffect(()=>{setFingerprint(currentDeviceFingerprint());try{setProfiles(decodeProfiles(window.localStorage.getItem(PROFILE_KEY)));}catch{}setDirector(readMultiAvatarDirectorEnabled());const update=()=>setDirector(readMultiAvatarDirectorEnabled());window.addEventListener('sonic:v260-director',update);return()=>window.removeEventListener('sonic:v260-director',update);},[]);
 const recommended=useMemo(()=>recommendProfile(profiles,fingerprint),[profiles,fingerprint]);
 const autoSuggestion=useMemo(()=>selectDeviceProfile(profiles,fingerprint,{mode:performance.mode,director}),[profiles,fingerprint,performance.mode,director]);
 function save(next:DevicePerformanceProfile[]){setProfiles(next);try{window.localStorage.setItem(PROFILE_KEY,JSON.stringify(next));}catch{setFeedback('Profil nur für diese Sitzung gespeichert: Browser-Speicher nicht verfügbar.');}}
 function create(){const e=experiments.find(x=>x.id===selectedExperiment);if(!e||!fingerprint)return;const result=profileFromExperiment(e,fingerprint,label,Date.now());if(!result){setFeedback('Dieser Versuch enthält keine gültigen Vergleichswerte.');return;}save(storeProfile(profiles,result));setFeedback('Profil für dieses Gerät gespeichert. Es wird nicht automatisch aktiviert.');}
 function apply(){if(!preview||preview.fingerprint!==fingerprint)return;setUndo({mode:performance.mode,director});setPerformanceMode(preview.config.mode);setMultiAvatarDirectorEnabled(preview.config.director);setDirector(preview.config.director);setPreview(null);setFeedback('Geräteprofil übernommen. Die vorherige Einstellung kann rückgängig gemacht werden.');}
 function revert(){if(!undo)return;setPerformanceMode(undo.mode);setMultiAvatarDirectorEnabled(undo.director);setDirector(undo.director);setUndo(null);setFeedback('Vorherige Performance-Einstellungen wiederhergestellt.');}
 function downloadBackup(){
  try{const blob=new Blob([exportProfileBackup(profiles)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='sonic-display-performance-profiles-v268.json';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);setFeedback(`${profiles.length} Profile exportiert.`);}catch(e){setFeedback(e instanceof Error?e.message:'Export fehlgeschlagen.');}
 }
 async function readBackup(file:File|undefined){
  setIncoming(null);setChoices([]);if(!file)return;
  if(file.size>MAX_BACKUP_BYTES){setFeedback('Datei zu groß: maximal 256 KB.');return;}
  try{const parsed=parseProfileBackup(await file.text());setIncoming(parsed);setChoices(parsed.profiles.map(p=>({id:p.id,selected:!profiles.some(x=>x.id===p.id),conflict:'skip' as const})));setFeedback(`${parsed.profiles.length} Profile geprüft. Bitte Importauswahl bestätigen.`);}catch(e){setFeedback(e instanceof Error?e.message:'Import fehlgeschlagen.');}
 }
 function commitImport(){
  if(!incoming)return;
  const next=mergeImportedProfiles(profiles,incoming.profiles,choices);
  if(next.length===profiles.length&&next.every((p,i)=>p===profiles[i])){setFeedback('Keine Profile übernommen.');return;}
  save(next);setIncoming(null);setChoices([]);setFeedback(`${next.length} Profile sind nun lokal gespeichert. Importierte Profile wurden nicht aktiviert.`);
 }
 const matching=profiles.filter(p=>p.fingerprint===fingerprint);
 return <section aria-label="V267 Adaptive Performance Profile Manager" style={{marginTop:18}}>
  <h4>V267 · Adaptive Performance Profile Manager</h4>
  <div aria-label="V269 Smart Device Profile Auto Selection" style={{padding:12,marginBottom:12,border:'1px solid currentColor'}}>
   <h4>V269 · Automatische Geräteprofil-Empfehlung</h4>
   {!fingerprint?<p className="settings-note">Gerätekennung wird erkannt …</p>:autoSuggestion?<><p className="settings-note"><strong>{autoSuggestion.profile.label}</strong> · {autoSuggestion.profile.fps.toFixed(1)} FPS im gespeicherten Experiment · {autoSuggestion.reason}</p>
    <p className="settings-note">Gespeichert: {autoSuggestion.profile.config.mode}, Director {autoSuggestion.profile.config.director?'an':'aus'}. Aktuell: {performance.mode}, Director {director?'an':'aus'}.</p>
    {autoSuggestion.status==='ready'?<button type="button" onClick={()=>setPreview(autoSuggestion.profile)}>Empfohlenes Profil prüfen</button>:<span role="status">Empfohlenes Profil bereits aktiv</span>}
   </>:<p className="settings-note">Noch kein Profil mit exakt passender Gerätekennung. Du kannst ein Profil aus einem Experiment speichern oder eine JSON-Sicherung importieren.</p>}
   <p className="settings-note">Nur eine Empfehlung: keine automatische Änderung. Ein importiertes Profil für andere Geräte wird niemals aktiviert.</p>
  </div>
  <p className="settings-note">Gerätegebundene Profile aus abgeschlossenen Experimenten. Aktuelle Hardwarekennung: <code style={{overflowWrap:'anywhere'}}>{fingerprint||'wird erkannt'}</code>. Andere Geräte benötigen eigene Messungen. Keine automatische Aktivierung oder Cloud-Synchronisierung.</p>
  <p className="settings-note">Aktuell: {performance.mode}, Multi-Avatar Director {director?'an':'aus'}. {recommended?<>Empfehlung für dieses Gerät: <strong>{recommended.label}</strong> (Messwert {recommended.fps.toFixed(1)} FPS).</>:'Noch kein passendes Profil für dieses Gerät.'}</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}><label>Versuch <select value={selectedExperiment} onChange={e=>setSelectedExperiment(e.target.value)}><option value="">Bitte auswählen</option>{experiments.map(e=><option key={e.id} value={e.id}>{new Date(e.at).toLocaleString('de-AT')} – {e.after.mode} / Director {e.after.director?'an':'aus'}</option>)}</select></label><label>Profilname <input maxLength={80} value={label} onChange={e=>setLabel(e.target.value)} /></label><button type="button" disabled={!selectedExperiment||!label.trim()||!fingerprint} onClick={create}>Profil aus Versuch speichern</button></div>
  <div style={{marginTop:16,padding:12,border:'1px solid currentColor'}} aria-label="V268 Profile Sync und Backup">
   <h4>V268 · Profil-Sicherung und Geräteübertragung</h4>
   <p className="settings-note">Alle Profile (auch die anderer Geräte) als JSON sichern oder eine Sicherung prüfen. Beim Import erfolgt keine automatische Aktivierung. Maximal 30 Profile insgesamt.</p>
   <button type="button" disabled={!profiles.length} onClick={downloadBackup}>Profile als JSON exportieren</button>{' '}
   <label>JSON-Sicherung auswählen <input type="file" accept=".json,application/json" onChange={e=>{void readBackup(e.target.files?.[0]);e.target.value='';}} /></label>
   {incoming&&<div style={{marginTop:12}}><strong>Import-Vorschau ({incoming.profiles.length} Profile)</strong><p className="settings-note">Exportiert: {new Date(incoming.exportedAt).toLocaleString('de-AT')}. Profile für andere Hardware werden nur gespeichert, nicht aktiviert.</p>
    <div style={{overflowX:'auto'}}><table><thead><tr><th>Übernehmen</th><th>Name / Gerät</th><th>Konflikt</th></tr></thead><tbody>{incoming.profiles.map(p=>{const conflict=profiles.some(x=>x.id===p.id);const choice=choices.find(x=>x.id===p.id);return <tr key={p.id}><td><input aria-label={`Profil ${p.label} importieren`} type="checkbox" checked={choice?.selected??false} onChange={e=>setChoices(old=>old.map(c=>c.id===p.id?{...c,selected:e.target.checked}:c))}/></td><td>{p.label}<div className="settings-note" style={{overflowWrap:'anywhere'}}>{p.fingerprint===fingerprint?'Aktuelles Gerät':'Anderes Gerät'} · {p.config.mode}, Director {p.config.director?'an':'aus'}</div></td><td>{conflict?<select aria-label={`Konflikt ${p.label}`} value={choice?.conflict??'skip'} onChange={e=>setChoices(old=>old.map(c=>c.id===p.id?{...c,conflict:e.target.value as 'skip'|'replace'}:c))}><option value="skip">Vorhandenes behalten</option><option value="replace">Vorhandenes ersetzen</option></select>:'Neu'}</td></tr>})}</tbody></table></div>
    <button type="button" disabled={!choices.some(c=>c.selected)} onClick={commitImport}>Ausgewählte Profile importieren</button>{' '}<button type="button" onClick={()=>{setIncoming(null);setChoices([]);}}>Import abbrechen</button>
   </div>}
  </div>
  {matching.length>0&&<div style={{overflowX:'auto'}}><table><thead><tr><th>Profil</th><th>Renderqualität</th><th>Director</th><th>FPS</th><th>Aktionen</th></tr></thead><tbody>{[...matching].sort((a,b)=>b.score-a.score).map(p=><tr key={p.id}><td>{p.label}{recommended?.id===p.id?' · Empfohlen':''}</td><td>{p.config.mode}</td><td>{p.config.director?'an':'aus'}</td><td>{p.fps.toFixed(1)}</td><td><button type="button" onClick={()=>setPreview(p)}>Vorschau</button> <button type="button" onClick={()=>save(profiles.filter(x=>x.id!==p.id))}>Löschen</button></td></tr>)}</tbody></table></div>}
  {preview&&<div style={{border:'1px solid currentColor',padding:12,marginTop:12}}><strong>Vor Übernahme prüfen: {preview.label}</strong><p className="settings-note">Aktuell: {performance.mode}, Director {director?'an':'aus'}. Danach: {preview.config.mode}, Director {preview.config.director?'an':'aus'}. Nur diese zwei Einstellungen werden geändert.</p><button type="button" onClick={apply} disabled={preview.fingerprint!==fingerprint}>Dieses Profil übernehmen</button> <button type="button" onClick={()=>setPreview(null)}>Abbrechen</button></div>}
  {undo&&<button type="button" onClick={revert}>Profilübernahme rückgängig machen</button>}
  {feedback&&<p role="status" className="settings-note">{feedback}</p>}
  <p className="settings-note">Die Empfehlung vergleicht nur Messungen auf derselben Hardwarekennung. Unterschiedliche Musik, Szenen oder Avatarzahlen können die Ergebnisse beeinflussen. Die globale Konfiguration bleibt jederzeit manuell änderbar.</p>
 </section>;
}
