"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { AvatarPreview3D } from "@/components/visualizer/AvatarPreview3D";
import type { AvatarModel } from "@/components/visualizer/avatarModels";
import type { UiPreferences } from "@/types/music";
import { addCharacterMotion } from "@/components/visualizer/characterMotionLibrary";
import { CharacterMotionLibraryPanel } from "@/components/CharacterMotionLibraryPanel";
import { inspectMotion, isolateMotionClip, type MotionInspection } from "@/components/visualizer/motionClipInspector";

type Item = { id: string; file: File; kind: "character"|"motion"; url: string; error: string; installed: boolean; target: string };
type Props = {admin:boolean; blobEnabled:boolean; models:AvatarModel[]; preferences:UiPreferences; onInstalled:()=>Promise<void>};
const MAX_BYTES=35*1024*1024;
function cleanName(name:string){return name.replace(/\.glb$/i,"").replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,50)||"character";}
async function validGLB(file:File){
  if(!/\.glb$/i.test(file.name)||file.size<20||file.size>MAX_BYTES) throw new Error("GLB-Datei zwischen 20 Byte und 35 MB erforderlich");
  const view=new DataView(await file.slice(0,12).arrayBuffer());
  if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==file.size) throw new Error("Ungültiger GLB-Header");
}
export function CharacterMotionBatchInstaller({admin,blobEnabled,models,preferences,onInstalled}:Props){
  const [items,setItems]=useState<Item[]>([]);
  const blobUrls=useRef<string[]>([]);
  const [active,setActive]=useState<string>("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [replace,setReplace]=useState(false);
  const [inspections,setInspections]=useState<Record<string,MotionInspection>>({});
  const [clipIndices,setClipIndices]=useState<Record<string,number>>({});
  const [inspectionBusy,setInspectionBusy]=useState(false);
  const [allowUnmatched,setAllowUnmatched]=useState(false);
  const modelOptions=models.filter(m=>m.id!=="procedural"&&Boolean(m.url));
  const current=items.find(item=>item.id===active);
  const available=useMemo(()=>items.filter(x=>!x.installed),[items]);
  useEffect(()=>()=>{blobUrls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
  async function addFiles(files:FileList|null,kind:"character"|"motion"){
    if(!files)return;
    const next=Array.from(files).slice(0,30).map(file=>({id:crypto.randomUUID(),file,kind,url:URL.createObjectURL(file),error:"",installed:false,target:modelOptions[0]?.id||""}));
    blobUrls.current.push(...next.map(x=>x.url));
    setItems(old=>[...old,...next].slice(-60));setActive(next[0]?.id||active);setMessage("");
  }
  async function inspect(item:Item){
    if(item.kind!=="motion")return;
    setInspectionBusy(true);
    try{
      await validGLB(item.file);
      const model=modelOptions.find(x=>x.id===item.target);
      const result=await inspectMotion(item.url,model?.url||undefined);
      setInspections(old=>({...old,[item.id]:result}));update(item.id,{error:""});
    }catch(err){update(item.id,{error:err instanceof Error?err.message:"Clip-Prüfung fehlgeschlagen"});}
    finally{setInspectionBusy(false);}
  }
  function update(id:string,patch:Partial<Item>){setItems(old=>old.map(x=>x.id===id?{...x,...patch}:x));}
  async function send(file:File,kind:"character"|"motion"){
    await validGLB(file);
    if(blobEnabled){
      const filename=`${cleanName(file.name)}-${crypto.randomUUID()}.glb`;
      const uploaded=await upload(`sonic/${kind==="character"?"models":"animations"}/${filename}`,file,{access:"public",handleUploadUrl:"/api/avatars/upload",contentType:"model/gltf-binary"});
      if(!uploaded.url)throw new Error("Blob Upload fehlgeschlagen");
      if(kind==="character"){
        const response=await fetch("/api/avatars/config",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({filename:uploaded.pathname.split("/").pop(),metadata:{label:cleanName(file.name),description:"Über Batch Installer installiert",preview:"/avatars/custom-preview.svg",genre:[],tags:[],category:"Eigene Modelle",favorite:false,defaultDancePreset:"auto"}})});
        if(!response.ok)throw new Error("Modell hochgeladen, aber Metadaten konnten nicht gespeichert werden");
      }
      return uploaded.url;
    }
    const form=new FormData();form.set("file",file);
    const response=await fetch(kind==="character"?"/api/avatars/models/install":"/api/avatars/animations/import",{method:"POST",body:form});
    const result:{url?:string;error?:string}=await response.json();
    if(!response.ok||!result.url)throw new Error(result.error||"Upload fehlgeschlagen");
    return result.url;
  }
  async function install(){
    if(!admin||busy||available.length===0)return;
    setBusy(true);setMessage("");let success=0;let failure=0;
    const assignments=new Set<string>();
    for(const item of available){
      try{
        if(item.kind==="motion"){
          if(!item.target)throw new Error("Bitte einen Ziel-Avatar auswählen");
          if(assignments.has(item.target))throw new Error("Pro Avatar kann nur eine Motion gleichzeitig aktiv sein. Bitte unterschiedliche Ziele verwenden.");
          const model=modelOptions.find(x=>x.id===item.target);
          if(!model)throw new Error("Ziel-Avatar nicht gefunden");
          if(model.animationUrl&&!replace)throw new Error("Vorhandene Motion: Ersetzen zuerst bestätigen");
          const check=inspections[item.id];
          if(!check||check.names.length===0)throw new Error("Bitte zuerst Motion und Rig prüfen");
          if(check.status==="incompatible"&&!allowUnmatched)throw new Error("Keine passenden Skelett-Spuren: Installation ausdrücklich freigeben");
          assignments.add(item.target);
        }
        const selectedIndex=clipIndices[item.id]??0;
        const prepared=item.kind==="motion"&&inspections[item.id]?.names.length ? await isolateMotionClip(item.url,selectedIndex,item.file.name) : item.file;
        const url=await send(prepared,item.kind);
        if(item.kind==="motion"){
          const response=await fetch("/api/avatars/animations/install",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({modelId:item.target.startsWith("local:")?item.target:`default:${item.target}`,animationUrl:url})});
          const result:{error?:string}=await response.json();
          if(!response.ok)throw new Error(result.error||"Zuordnung fehlgeschlagen; Upload liegt bereits vor");
        }
        if(item.kind==="motion")addCharacterMotion(item.target,`${cleanName(item.file.name)} · ${inspections[item.id]?.names[selectedIndex]||"Clip"}`,url);
        success++;update(item.id,{installed:true,error:""});
      }catch(error){failure++;update(item.id,{error:error instanceof Error?error.message:"Installation fehlgeschlagen"});}
    }
    try{await onInstalled();}catch{/* Installation was completed even if refreshing failed. */}
    setMessage(`${success} installiert, ${failure} fehlgeschlagen. Neue Charaktere erscheinen nach dem Aktualisieren in der Bibliothek.`);setBusy(false);
  }
  return <section className="avatar-metadata-editor" aria-label="Character & Motion Batch Installer">
    <h3>Character & Motion Library · V190</h3>
    <p>Mehrere GLBs auswählen, vorab in 3D ansehen und ohne Änderungen an Konfigurationsdateien installieren.</p>
    {!admin&&<p role="status">Zum Installieren bitte als Administrator anmelden.</p>}
    <label>Charaktere (.glb) auswählen<input aria-label="Mehrere Charaktere auswählen" type="file" multiple accept=".glb,model/gltf-binary" onChange={e=>{void addFiles(e.target.files,"character");e.target.value="";}} /></label>
    <label>Motions (.glb) auswählen<input aria-label="Mehrere Motions auswählen" type="file" multiple accept=".glb,model/gltf-binary" onChange={e=>{void addFiles(e.target.files,"motion");e.target.value="";}} /></label>
    {items.length>0&&<div className="avatar-library-grid">{items.map(item=><button key={item.id} type="button" className={`avatar-card ${active===item.id?"selected":""}`} onClick={()=>setActive(item.id)} aria-pressed={active===item.id}>
      <strong>{item.kind==="character"?"Charakter":"Motion"}: {item.file.name}</strong><small>{(item.file.size/1048576).toFixed(2)} MB</small><small>{item.installed?"✓ Installiert":item.error?`Fehler: ${item.error}`:"Bereit zur Vorschau"}</small>
    </button>)}</div>}
    {current&&<div className="settings-avatar-preview">
      <div style={{minHeight:260,width:"100%"}}>{current.kind==="character"?<AvatarPreview3D modelUrl={current.url} preferences={preferences} />: current.target && modelOptions.find(m=>m.id===current.target)?.url ? <AvatarPreview3D key={`${current.id}:${current.target}`} modelUrl={modelOptions.find(m=>m.id===current.target)?.url||null} animationUrl={current.url} studio preferences={preferences}/>:<p>Für die animierte Vorschau einen Avatar auswählen.</p>}</div>
      <div><strong>{current.file.name}</strong><p>{current.kind==="character"?"3D-Charaktervorschau – Maus/Touch zum Drehen":"Motion wird dem ausgewählten Avatar zugewiesen"}</p>
        {current.kind==="motion"&&<label>Ziel-Avatar<select value={current.target} onChange={e=>{update(current.id,{target:e.target.value});setInspections(old=>{const next={...old};delete next[current.id];return next;});}}>{modelOptions.map(m=><option value={m.id} key={m.id}>{m.label}</option>)}</select></label>}
        {current.kind==="motion"&&<div className="avatar-metadata-editor">
          <button type="button" disabled={inspectionBusy||busy} onClick={()=>void inspect(current)}>{inspectionBusy?"Prüfe…":"Clips und Rig prüfen"}</button>
          {inspections[current.id]&&<>
            <p role="status">Skelett-Status: {inspections[current.id].status} · {inspections[current.id].matched} passende / {inspections[current.id].total} Spuren ({inspections[current.id].skipped} übersprungen). Namensbasierte Heuristik, keine Garantie für korrektes Retargeting.</p>
            <label>Clip zur Installation<select value={clipIndices[current.id]??0} onChange={e=>setClipIndices(old=>({...old,[current.id]:Number(e.target.value)}))}>{inspections[current.id].names.map((name,i)=><option key={i} value={i}>{name} · {inspections[current.id].durations[i].toFixed(1)}s · {inspections[current.id].tracks[i]} Spuren</option>)}</select></label>
            <small>Die 3D-Vorschau bietet eigene Wiedergabe- und Clip-Regler. Für die Installation wird ausschließlich der hier ausgewählte Clip als GLB exportiert.</small>
          </>}
        </div>}
        <button type="button" onClick={()=>{setItems(old=>old.filter(x=>x.id!==current.id));setActive("");}} disabled={busy}>Aus Warteschlange entfernen</button>
      </div>
    </div>}
    <label className="setting-check"><input type="checkbox" checked={allowUnmatched} onChange={e=>setAllowUnmatched(e.target.checked)}/> Installation ohne passende Rig-Spuren ausdrücklich erlauben</label>
    <label className="setting-check"><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/> Bereits zugewiesene Motions ersetzen</label>
    <button type="button" disabled={!admin||busy||available.length===0} onClick={()=>void install()}>{busy?"Installiere…":`${available.length} Dateien installieren`}</button>
    {message&&<p role="status">{message}</p>}
    <CharacterMotionLibraryPanel models={models} preferences={preferences} admin={admin} />
    <small>Maximal 30 Dateien pro Auswahl und 35 MB je GLB. Ohne Vercel Blob funktioniert die Installation nur lokal im Entwicklungsmodus. Nur ein aktiver Animations-GLB-Pfad pro Avatar; das vorhandene namensorientierte Retargeting ist nicht für alle Skelette geeignet. Bereits registrierte Charaktere bleiben erhalten.</small>
  </section>;
}
