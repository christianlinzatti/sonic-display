'use client';
import {useState,type ChangeEvent} from 'react';
import {upload} from '@vercel/blob/client';
import {createUnifiedBackup,previewUnifiedBackup,applyUnifiedBackup,type BackupData,type BackupGroup} from '@/services/settings/unifiedBackup';
import {analyzeAssetReferences} from '@/services/settings/backupManager';
import {createPortableTarV657,readPortableTarV657,sha256BlobV657,sha256TextV657,remapSettingsV657,PORTABLE_ASSET_LIMIT,PORTABLE_FILE_LIMIT,PORTABLE_TOTAL_LIMIT,validAssetNameV657,type PortableManifestV657,type PortableFileV657,type PortableAssetV657} from '@/services/settings/portableArchiveV657';
const GROUPS:BackupGroup[]=['genre','lighting','timeline','avatar','device','ui'];
type DirectoryResponse={assets:PortableFileV657[];avatarConfig:Record<string,Record<string,unknown>>;blobEnabled:boolean;error?:string};
type ReadyArchive={manifest:PortableManifestV657;assets:Map<string,Blob>};
const err=(e:unknown)=>e instanceof Error?e.message:'Unbekannter Fehler';
function references(settings:BackupData,config:Record<string,Record<string,unknown>>,managed:string[]){
 const known=new Set(managed);const candidates=new Set(analyzeAssetReferences(settings).map(a=>a.path));
 const collect=(v:unknown)=>{if(typeof v==='string'&&(/^(?:blob:|https?:\/\/|\/(?:avatars|models|animations|previews)\/)/.test(v)))candidates.add(v);else if(Array.isArray(v))v.forEach(collect);else if(v&&typeof v==='object')Object.values(v).forEach(collect);};
 Object.values(config).forEach(collect);
 return [...candidates].filter(v=>!known.has(v)).slice(0,500);
}
function remapObject(v:unknown,mapping:Record<string,string>):unknown{
 if(typeof v==='string')return mapping[v]??v;
 if(Array.isArray(v))return v.map(x=>remapObject(x,mapping));
 if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([key,val])=>[key,remapObject(val,mapping)]));
 return v;
}
export function PortableBackupV657(){
 const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const [archive,setArchive]=useState<ReadyArchive|null>(null);
 const [directory,setDirectory]=useState<DirectoryResponse|null>(null);
 const [overwrite,setOverwrite]=useState(false);
 const [includeDefaults,setIncludeDefaults]=useState(false);
 const discover=async():Promise<DirectoryResponse>=>{
  const response=await fetch('/api/portable-backup/assets',{cache:'no-store'});
  const data:DirectoryResponse=await response.json();if(!response.ok)throw Error(data.error||'Anmeldung erforderlich.');return data;
 };
 const exportArchive=async()=>{
  if(busy)return;setBusy(true);setStatus('Sicherungsdateien werden geprüft ...');
  try{
   const data=await discover();setDirectory(data);
   const settings=createUnifiedBackup(localStorage);
   const list=data.assets;
   if(list.length>PORTABLE_ASSET_LIMIT)throw Error('Mehr als 150 Dateien: bitte Bibliothek vor dem Export aufteilen.');
   const size=list.reduce((sum,item)=>sum+item.size,0);
   if(size>PORTABLE_TOTAL_LIMIT||list.some(a=>a.size>PORTABLE_FILE_LIMIT))throw Error('Die Sicherung überschreitet die Größenbegrenzung (100 MB je Datei, 650 MB gesamt).');
   const assets:PortableAssetV657[]=[],files=new Map<string,Blob>();
   for(let i=0;i<list.length;i++){
    const item=list[i];if(!validAssetNameV657(item.filename))throw Error('Ungültiger Dateiname in der Bibliothek.');
    setStatus(`Dateien sichern: ${i+1}/${list.length} · ${item.filename}`);
    const response=await fetch(item.downloadUrl,{cache:'no-store'});if(!response.ok)throw Error(`Download fehlgeschlagen: ${item.filename}`);
    const blob=await response.blob();if(blob.size!==item.size)throw Error(`Dateigröße abweichend: ${item.filename}`);
    const ext=item.filename.split('.').pop()!.toLowerCase();const path=`assets/${String(i+1).padStart(5,'0')}.${ext}`;
    assets.push({path,kind:item.kind,filename:item.filename,url:item.url,size:blob.size,sha256:await sha256BlobV657(blob)});files.set(path,blob);
   }
   const known=assets.flatMap(a=>[a.url,...(a.kind==='models'?[`/avatars/${a.filename}`,`/models/${a.filename}`]:[`/${a.kind}/${a.filename}`])]);
   const unresolved=references(settings,data.avatarConfig,known);
   const manifest:PortableManifestV657={format:'sonic-display-portable-v657',version:1,createdAt:new Date().toISOString(),settings,settingsSha256:await sha256TextV657(JSON.stringify(settings)),avatarConfig:data.avatarConfig,avatarConfigSha256:await sha256TextV657(JSON.stringify(data.avatarConfig)),assets,unresolved};
   const result=createPortableTarV657(manifest,files);
   const url=URL.createObjectURL(result);const a=document.createElement('a');a.href=url;a.download=`sonic-display-portable-v657-${new Date().toISOString().slice(0,10)}.tar`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
   setStatus(`${assets.length} Dateien und ${Object.keys(settings.entries).length} Einstellungen gesichert (${(result.size/1048576).toFixed(1)} MB). ${unresolved.length} nicht automatisch übertragbare Referenzen. ${unresolved.length?'Die Liste ist im Archiv enthalten.':''}`);
  }catch(e){setStatus('Export fehlgeschlagen: '+err(e));}finally{setBusy(false);}
 };
 const inspect=async(e:ChangeEvent<HTMLInputElement>)=>{
  const file=e.target.files?.[0];e.target.value='';setArchive(null);setDirectory(null);if(!file)return;
  setBusy(true);setStatus('Archiv und alle SHA-256-Prüfsummen werden geprüft ...');
  try{const result=await readPortableTarV657(file);setArchive(result);setStatus(`Archiv geprüft: ${result.manifest.assets.length} Dateien, ${Object.keys(result.manifest.settings.entries).length} Einstellungen. Keine Daten wurden verändert.`);}catch(ex){setStatus('Archiv abgelehnt: '+err(ex));}finally{setBusy(false);}
 };
 const restore=async()=>{
  if(busy||!archive)return;setBusy(true);setStatus('Zielgerät wird geprüft ...');
  let done=0;
  try{
   const target=await discover();setDirectory(target);
   const incoming=archive.manifest;
   if(target.blobEnabled&&incoming.assets.some(a=>a.kind!=='previews'&&!/\.glb$/i.test(a.filename)))throw Error('Externe glTF-Dateien ohne eingebettete Binärdaten können nicht auf Vercel wiederhergestellt werden.');
   if(!target.blobEnabled&&incoming.assets.some(a=>a.size>(a.kind==='previews'?5:35)*1024*1024))throw Error('Eine gesicherte Datei überschreitet das lokale Installationslimit (GLB: 35 MB, Bild: 5 MB).');
   if(target.blobEnabled&&incoming.assets.some(a=>a.kind!=='previews'&&!/\.glb$/i.test(a.filename)))throw Error('Das Ziel unterstützt nur eigenständige GLB-Dateien.');
   const localPreview=previewUnifiedBackup(incoming.settings,localStorage);
   const count=localPreview.newKeys.length+(overwrite?localPreview.conflicts.length:0);
   if(!window.confirm(`${incoming.assets.length} geprüfte Dateien installieren und ${count} Einstellungen übernehmen? Vorhandene Dateien werden niemals überschrieben. ${overwrite?'Konflikte in den Einstellungen werden ersetzt.':'Vorhandene Einstellungen bleiben erhalten.'}`))return;
   const mapping:Record<string,string>=Object.create(null);
   const installed:Record<string,string>=Object.create(null);
   for(let i=0;i<incoming.assets.length;i++){
    const item=incoming.assets[i];setStatus(`Installiere Datei ${i+1}/${incoming.assets.length}: ${item.filename}`);
    const contents=archive.assets.get(item.path);if(!contents)throw Error('Fehlende Datei: '+item.filename);
    if(!/\.glb$/i.test(item.filename)&&item.kind!=='previews'&&target.blobEnabled)throw Error('Auf Vercel werden derzeit nur eigenständige GLB-Modelle unterstützt: '+item.filename);
    const mime=item.kind==='previews'?/\.png$/i.test(item.filename)?'image/png':/\.webp$/i.test(item.filename)?'image/webp':'image/jpeg':'model/gltf-binary';
    const file=new File([contents],item.filename,{type:mime});
    let newUrl:string,newName:string;
    if(target.blobEnabled){
     const ext=item.filename.split('.').pop()!.toLowerCase();const base=item.filename.slice(0,-ext.length-1).replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,40)||'restored';
     newName=`${base}-${crypto.randomUUID().slice(0,12)}.${ext}`;
     const stored=await upload(`sonic/${item.kind}/${newName}`,file,{access:'public',handleUploadUrl:'/api/avatars/upload',contentType:mime});
     newUrl=stored.url;
    }else{
     const form=new FormData();form.set('kind',item.kind);form.set('file',file);
     const response=await fetch('/api/portable-backup/import-file',{method:'POST',body:form});const stored:{url?:string;filename?:string;error?:string}=await response.json();
     if(!response.ok||!stored.url||!stored.filename)throw Error(stored.error||'Installation fehlgeschlagen');newUrl=stored.url;newName=stored.filename;
    }
    mapping[item.url]=newUrl;
    mapping[`${item.kind==='models'?'/avatars':`/${item.kind}`}/${item.filename}`]=newUrl;
    if(item.kind==='models'){mapping[`/models/${item.filename}`]=newUrl;mapping[`local:${item.filename}`]=`local:${newName}`;mapping[item.filename]=newName;installed[item.filename]=newName;}
    done++;
   }
   // Resolve nested references before applying any browser settings. Do not change unmapped URLs.
   const mappedSettings=remapSettingsV657(incoming.settings,mapping);
   const config:Record<string,unknown>=Object.create(null);
   for(const [oldName,data] of Object.entries(incoming.avatarConfig)){
    const key=oldName.startsWith('default:')?oldName:installed[oldName];
    if(!key||oldName.startsWith('default:')&&!includeDefaults)continue;
    config[key]=remapObject(data,mapping);
   }
   if(Object.keys(config).length){
    setStatus('Avatar-Metadaten werden wiederhergestellt ...');
    const response=await fetch('/api/portable-backup/restore-metadata',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({config,overwrite:includeDefaults&&overwrite})});
    if(!response.ok)throw Error((await response.json()).error||'Metadaten nicht gespeichert');
   }
   const preview=previewUnifiedBackup(mappedSettings,localStorage);
   const applied=applyUnifiedBackup(preview,localStorage,{overwrite,groups:GROUPS});
   setArchive(null);
   setStatus(`${done} Dateien installiert, ${applied} Einstellungen wiederhergestellt. ${incoming.unresolved.length} externe/temporäre Referenzen bitte manuell prüfen. Seite danach neu laden.`);
  }catch(e){setStatus(`Wiederherstellung unterbrochen nach ${done} Dateien: ${err(e)}. Bereits installierte Dateien bleiben bestehen, Einstellungen wurden möglicherweise noch nicht angewandt.`);}finally{setBusy(false);}
 };
 return <section aria-label="V657 Complete Portable Backup" style={{border:'1px solid #64748b',borderRadius:12,padding:14,margin:'14px 0'}}>
  <h3>V657 · Vollständige Geräteübertragung</h3>
  <p>Verwaltete GLB-Modelle, Motion-Dateien, Vorschaubilder, Kamera- und Show-Presets samt Einstellungen als <strong>TAR-Archiv mit SHA-256</strong>. Export und Dateiinstallation erfordern eine Administrator-Anmeldung. Zugangsdaten und Spotify-Tokens werden nicht gesichert.</p>
  <button type="button" disabled={busy} onClick={()=>void exportArchive()}>Portables Backup mit Dateien exportieren</button>
  <label style={{display:'block',marginTop:12}}>Archiv auf Zielgerät prüfen (ohne Änderungen)
   <input type="file" accept=".tar,application/x-tar" disabled={busy} onChange={e=>void inspect(e)}/>
  </label>
  {archive&&<div role="region" aria-label="V657 Import-Vorschau">
   <p><strong>Geprüft:</strong> {archive.manifest.assets.length} Dateien ({(archive.manifest.assets.reduce((n,a)=>n+a.size,0)/1048576).toFixed(1)} MB), {Object.keys(archive.manifest.settings.entries).length} Einstellungsschlüssel, {Object.keys(archive.manifest.avatarConfig).length} Avatar-Metadaten.</p>
   <p>{archive.manifest.unresolved.length} nicht automatisch übertragbare externe oder temporäre Dateireferenzen.</p>
   {archive.manifest.unresolved.slice(0,12).map(v=><p key={v} style={{overflowWrap:'anywhere',fontSize:12}}>{v}</p>)}
   <label style={{display:'block'}}><input type="checkbox" checked={overwrite} onChange={e=>setOverwrite(e.target.checked)}/> Bestehende Browser-Einstellungen bei Konflikten ersetzen</label>
   <label style={{display:'block'}}><input type="checkbox" checked={includeDefaults} onChange={e=>setIncludeDefaults(e.target.checked)}/> Auch Standard-Avatar-Zuordnungen übernehmen (kann vorhandene überschreiben)</label>
   <button type="button" disabled={busy} onClick={()=>void restore()}>Geprüfte Dateien und Einstellungen wiederherstellen</button>
   <button type="button" disabled={busy} onClick={()=>setArchive(null)}>Abbrechen</button>
  </div>}
  <p>Externe Bilder, Blob-URLs aus anderen Browser-Sitzungen und nicht verwaltete Dateien können fehlen. Bei Abbruch bereits installierte Dateien prüfen; eine atomare Rücknahme mehrerer Uploads ist nicht möglich.</p>
  {directory&&<p style={{fontSize:12}}>Zielmodus: {directory.blobEnabled?'Vercel Blob':'lokale Entwicklungsinstallation'}</p>}
  {status&&<p role="status" style={{overflowWrap:'anywhere'}}>{status}</p>}
 </section>;
}
