"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { AvatarPreview3D } from "@/components/visualizer/AvatarPreview3D";
import type { AvatarModel } from "@/components/visualizer/avatarModels";
import type { UiPreferences } from "@/types/music";
import { addCharacterMotion,loadCharacterMotionStore } from "@/components/visualizer/characterMotionLibrary";
import { CharacterMotionLibraryPanel } from "@/components/CharacterMotionLibraryPanel";
import { inspectMotion, isolateMotionClip, type MotionInspection, inspectSelectedMotionQualityV533, fingerprintMotionClipsV535 } from "@/components/visualizer/motionClipInspector";
import {duplicateInAvatarV535,suggestMotionCategoryV535,MOTION_CATEGORY_LABELS_V535} from "@/components/visualizer/motionLibraryIntelligenceV535";
import type { ClipQualityReport } from "@/components/visualizer/glbMotionQualityAnalyzer";
import { inspectAdvancedMotionV534, type AdvancedMotionReportV534 } from "@/components/visualizer/motionQualitySamplerV534";
import { VisualDanceReviewPanelV589 } from "@/components/visualizer/VisualDanceReviewPanelV589";
import { planAdditionalMotionClipsV533, validateMotionAssignmentV533, explainAdditionalMotionQualityV533 } from "@/components/visualizer/expandableMotionLibraryV533";
import { inspectSharedMotionV531, stripDuplicateAnimationsV531, sameSharedMotionV531, type MotionIdentityV531 } from "@/components/visualizer/sharedEmbeddedMotionV531";
import { inspectEmbeddedAvatarFileV529, type EmbeddedAvatarBundleV529 } from "@/components/visualizer/embeddedAvatarBundleV529";
import { previewChecksV532, reviewKeyV532, type PreviewModeV532 } from "@/components/visualizer/avatarPreviewQualityV532";

type Item = { id: string; file: File; kind: "character"|"motion"; url: string; error: string; installed: boolean; installedUrl?: string; installedSharedUrl?:string; target: string };
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
  const [embeddedBundles,setEmbeddedBundles]=useState<Record<string,EmbeddedAvatarBundleV529>>({});
  const [clipIndices,setClipIndices]=useState<Record<string,number>>({});
  const [inspectionBusy,setInspectionBusy]=useState(false);
  const [fingerprintsV535,setFingerprintsV535]=useState<Record<string,(string|undefined)[]>>({});
  const [duplicatesSkippedV535,setDuplicatesSkippedV535]=useState(0);
  const [allowUnmatched,setAllowUnmatched]=useState(false);
  // Explicit opt-in: adding clips must not overwrite existing active motions.
  const [appendMotionsV533,setAppendMotionsV533]=useState(false);
  const [importAllClipsV533,setImportAllClipsV533]=useState(false);
  const [addedClipsV533,setAddedClipsV533]=useState(0);
  const [qualityReportsV533,setQualityReportsV533]=useState<Record<string,ClipQualityReport>>({});
  const [qualityBusyV533,setQualityBusyV533]=useState(false);
  // V534: reports are keyed by GLB + selected clip + optional following clip.
  const [advancedReportsV534,setAdvancedReportsV534]=useState<Record<string,AdvancedMotionReportV534>>({});
  const [advancedBusyV534,setAdvancedBusyV534]=useState(false);
  const [nextClipV534,setNextClipV534]=useState<Record<string,number>>({});
  const [previewSeekV534,setPreviewSeekV534]=useState<{seconds:number;seq:number}|undefined>();
  const [shareMotionsV531,setShareMotionsV531]=useState(false);
  const [savedBytesV531,setSavedBytesV531]=useState(0);
  const [sharedCountV531,setSharedCountV531]=useState(0);
  const [showOriginalV531,setShowOriginalV531]=useState(false);
  // Quality is confirmed by the person who sees the actual GLB, never by a hash.
  // State is per queued model and clip. Checking Play is *not* an automatic pass.
  const [playedModesV532,setPlayedModesV532]=useState<Record<string,Partial<Record<PreviewModeV532,boolean>>>>({});
  const [acceptedClipsV532,setAcceptedClipsV532]=useState<Record<string,boolean>>({});
  const modelOptions=models.filter(m=>m.id!=="procedural"&&Boolean(m.url));
  const current=items.find(item=>item.id===active);
  const qualityClipsV532=current?.kind==="character"?previewChecksV532(embeddedBundles[current.id]?.animations??[]):[];
  const compareReadyV532=Boolean(current?.kind==="character"&&current.installedUrl&&qualityClipsV532.length===3);
  const comparisonModeV532:PreviewModeV532=showOriginalV531||!current?.installedUrl?"original":"installed";
  const qualityCompleteV532=qualityClipsV532.length===3&&qualityClipsV532.every(clip=>acceptedClipsV532[reviewKeyV532(current?.id??"",clip.name)]);
  const available=useMemo(()=>items.filter(x=>!x.installed),[items]);
  useEffect(()=>()=>{blobUrls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
  async function addFiles(files:FileList|null,kind:"character"|"motion"){
    if(!files)return;
    const next=Array.from(files).slice(0,30).map(file=>({id:crypto.randomUUID(),file,kind,url:URL.createObjectURL(file),error:"",installed:false,target:modelOptions[0]?.id||""}));
    blobUrls.current.push(...next.map(x=>x.url));
    setItems(old=>[...old,...next].slice(-60));setActive(next[0]?.id||active);setShowOriginalV531(false);setMessage("");
    // Only the JSON chunk is inspected; do not decode 3D meshes or textures here.
    // Scan one file at a time to avoid holding 30 GLBs in memory simultaneously.
    for (const item of next.filter(item=>item.kind==="character")) {
      try {
        const report=await inspectEmbeddedAvatarFileV529(item.file);
        setEmbeddedBundles(old=>({...old,[item.id]:report}));
      } catch(error) { update(item.id,{error:error instanceof Error?error.message:"GLB-Analyse fehlgeschlagen"}); }
    }
  }
  async function inspect(item:Item){
    if(item.kind!=="motion")return;
    setInspectionBusy(true);
    try{
      await validGLB(item.file);
      const model=modelOptions.find(x=>x.id===item.target);
      const result=await inspectMotion(item.url,model?.url||undefined);
      setInspections(old=>({...old,[item.id]:result}));
      try {const fingerprints=await fingerprintMotionClipsV535(item.url);setFingerprintsV535(old=>({...old,[item.id]:fingerprints}));}
      catch {setFingerprintsV535(old=>({...old,[item.id]:[]}));} // Older/unusual GLBs remain importable without hash-based dedupe.
      update(item.id,{error:""});
    }catch(err){update(item.id,{error:err instanceof Error?err.message:"Clip-Prüfung fehlgeschlagen"});}
    finally{setInspectionBusy(false);}
  }
  async function inspectQualityV533(item:Item){
    if(item.kind!=="motion"||!inspections[item.id]||qualityBusyV533)return;
    const index=clipIndices[item.id]??0;
    setQualityBusyV533(true);
    try{
      const report=await inspectSelectedMotionQualityV533(item.url,index);
      setQualityReportsV533(old=>({...old,[`${item.id}:${index}`]:report}));
    }catch(error){setMessage(error instanceof Error?error.message:"Qualitätsanalyse fehlgeschlagen");}
    finally{setQualityBusyV533(false);}
  }
  const advancedKeyV534=(item:Item)=>`${item.id}:${clipIndices[item.id]??0}:${nextClipV534[item.id]??-1}`;
  async function inspectAdvancedV534(item:Item){
    if(advancedBusyV534||busy)return;
    const index=clipIndices[item.id]??0;
    const following=nextClipV534[item.id];
    setAdvancedBusyV534(true);setMessage("");
    try {
      // Inspect the original GLB, not a modified asset. For separate motion GLBs
      // these are source-rig diagnostics; final retarget quality is only visual.
      const report=await inspectAdvancedMotionV534(item.url,index,following,item.kind==="character"?"original-glb":"separate-motion-glb");
      setAdvancedReportsV534(old=>({...old,[advancedKeyV534(item)]:report}));
    }catch(error){setMessage(error instanceof Error?error.message:"Erweiterte Bewegungsanalyse fehlgeschlagen");}
    finally{setAdvancedBusyV534(false);}
  }
  function advancedPanelV534(item:Item,clipNames:readonly string[]){
    const report=advancedReportsV534[advancedKeyV534(item)];
    const selected=clipIndices[item.id]??0;
    return <div className="avatar-metadata-editor" aria-label="V534 Advanced Motion Quality Inspector">
      <strong>V534 · Advanced Motion Quality Inspector</strong>
      <p>Analysiert tatsächliche GLB-Skelettpositionen, Gelenkkurven und optional den Übergang zum nächsten Clip. Keine Änderung der Original-GLB.</p>
      <label>Übergang zur Animation
        <select aria-label="Folgeanimation für Qualitätsvergleich" value={nextClipV534[item.id]??-1} onChange={e=>setNextClipV534(old=>{const next={...old};const v=Number(e.target.value);if(v<0)delete next[item.id];else next[item.id]=v;return next;})}>
          <option value={-1}>Kein Übergangsvergleich</option>
          {clipNames.map((name,i)=>i===selected?null:<option key={i} value={i}>{name||`Clip ${i+1}`}</option>)}
        </select>
      </label>
      <button type="button" disabled={advancedBusyV534||busy} onClick={()=>void inspectAdvancedV534(item)}>{advancedBusyV534?"Prüfe Skelettposen…":"Fußkontakt, Gelenke und Übergang analysieren"}</button>
      {report&&<div role="status">
        <p><strong>{report.clipName}</strong> · {report.summary}</p>
        <p>{report.pose.samples} ausgewertete Posen · {report.pose.footSamples} Fußvergleiche · {report.keyframes.sampledTracks} Animationskanäle · {report.curveEvents.length} Kurvenhinweise</p>
        {report.pose.contactAssumption==="unavailable"&&<p>Kein vergleichbarer Fußknochen vorhanden – keine Aussage über Fußkontakt möglich.</p>}
        {report.pose.contactAssumption!=="unavailable"&&<p>Mögliche Fußrutscher: {report.pose.potentialSlideIntervals} · Auffällige Hüftbewegungen: {report.pose.rootJumps}</p>}
        {report.transition&&<p>Übergang zu <strong>{report.transitionTo}</strong>: {report.transition.note} Vorschlag für Crossfade: {report.transition.recommendedCrossfadeSeconds.toFixed(2)} s.{report.transitionCurveDegrees!==null?` Durchschnittliche lokale Gelenkrotation: ${report.transitionCurveDegrees}°.`:""}</p>}
        {(report.pose.findings.length>0||report.curveEvents.length>0)&&<ul>
          {report.pose.findings.slice(0,5).map((finding,i)=><li key={`p-${i}`}><button type="button" onClick={()=>setPreviewSeekV534(old=>({seconds:finding.atSeconds,seq:(old?.seq??0)+1}))}>Bei {finding.atSeconds.toFixed(2)} s ansehen</button> {finding.label} – {finding.explanation}</li>)}
          {report.curveEvents.slice(0,5).map((finding,i)=><li key={`c-${i}`}><button type="button" onClick={()=>setPreviewSeekV534(old=>({seconds:finding.atSeconds,seq:(old?.seq??0)+1}))}>Bei {finding.atSeconds.toFixed(2)} s ansehen</button> {finding.detail} ({finding.track})</li>)}
        </ul>}
        <VisualDanceReviewPanelV589 key={advancedKeyV534(item)} report={report}
          durationSeconds={item.kind==='motion'?inspections[item.id]?.durations[selected]??0:embeddedBundles[item.id]?.animations[selected]?.durationSeconds??0}
          hasFollowingClip={!!report.transition} sourceLabel={item.file.name}
          onSeek={seconds=>setPreviewSeekV534(old=>({seconds,seq:(old?.seq??0)+1}))}/>
        <small>Die zeitlichen Markierungen springen in der 3D-Vorschau zum betreffenden Bild. „Am Boden“ wird nur aus der tiefsten Fußposition geschätzt, nicht durch eine Kontaktmessung erkannt. Der Inspector bewertet weder die Hautverformung noch die visuelle Ästhetik und führt keine Reparatur durch. Bei externen Motions wird das Quell-Skelett geprüft, nicht das spätere Retargeting.</small>
      </div>}
    </div>;
  }
  function selectClipV534(item:Item,index:number){
    setClipIndices(old=>({...old,[item.id]:index}));
    setNextClipV534(old=>{
      if(old[item.id]!==index)return old;
      const next={...old};delete next[item.id];return next;
    });
    setPreviewSeekV534(undefined);
  }
  function update(id:string,patch:Partial<Item>){setItems(old=>old.map(x=>x.id===id?{...x,...patch}:x));}
  type SharedInfoV531=MotionIdentityV531 & {sourceUrl?:string};
  async function send(file:File,kind:"character"|"motion",shared?:SharedInfoV531){
    await validGLB(file);
    if(blobEnabled){
      const filename=`${cleanName(file.name)}-${crypto.randomUUID()}.glb`;
      const uploaded=await upload(`sonic/${kind==="character"?"models":"animations"}/${filename}`,file,{access:"public",handleUploadUrl:"/api/avatars/upload",contentType:"model/gltf-binary"});
      if(!uploaded.url)throw new Error("Blob Upload fehlgeschlagen");
      if(kind==="character"){
        const response=await fetch("/api/avatars/config",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({filename:uploaded.pathname.split("/").pop(),metadata:{label:cleanName(file.name),description:"Über Batch Installer installiert",preview:"/avatars/custom-preview.svg",genre:[],tags:[],category:"Eigene Modelle",favorite:false,defaultDancePreset:"auto",sharedMotionUrl:shared?.sourceUrl||"",sharedMotionFingerprint:shared?.fingerprint||"",sharedRigFingerprint:shared?.rigFingerprint||"",sharedMotionClipCount:shared?.clips||0}})});
        if(!response.ok)throw new Error("Modell hochgeladen, aber Metadaten konnten nicht gespeichert werden");
      }
      return uploaded.url;
    }
    const form=new FormData();form.set("file",file);
    if(kind==="character"&&shared){form.set("sharedMotionUrl",shared.sourceUrl||"");
      form.set("sharedMotionFingerprint",shared.fingerprint);form.set("sharedRigFingerprint",shared.rigFingerprint);
      form.set("sharedMotionClipCount",String(shared.clips));}
    const response=await fetch(kind==="character"?"/api/avatars/models/install":"/api/avatars/animations/import",{method:"POST",body:form});
    const result:{url?:string;error?:string}=await response.json();
    if(!response.ok||!result.url)throw new Error(result.error||"Upload fehlgeschlagen");
    return result.url;
  }
  async function install(){
    if(!admin||busy||available.length===0)return;
    setBusy(true);setMessage("");setSavedBytesV531(0);setSharedCountV531(0);setAddedClipsV533(0);setDuplicatesSkippedV535(0);
    let savedTotal=0,sharedTotal=0;let success=0;let failure=0;let clipsAdded=0;let duplicatesSkipped=0;
    // Canonical motion sources must already exist on the server, or have just been
    // uploaded in this same batch. Failed uploads are NEVER used as a source.
    const knownPacksV531:Array<MotionIdentityV531 & {url:string}>=[];
    if(shareMotionsV531)try{
      const response=await fetch("/api/avatars",{cache:"no-store"});
      if(response.ok){const data=await response.json();
        for(const m of [...(data.models??[]),...(data.defaults??[])]){
          if(m.url&&!m.sharedMotionUrl&&/^[a-f0-9]{64}$/.test(m.sharedMotionFingerprint)&&
            /^[a-f0-9]{64}$/.test(m.sharedRigFingerprint)&&Number.isInteger(m.sharedMotionClipCount)&&m.sharedMotionClipCount>0)
             knownPacksV531.push({url:m.url,fingerprint:m.sharedMotionFingerprint,rigFingerprint:m.sharedRigFingerprint,clips:m.sharedMotionClipCount});
        }
      }
    }catch{/* If the registry is unavailable, first imported character becomes source. */}
    const assignments=new Set<string>();
    for(const item of available){
      try{
        if(item.kind==="motion"){
          if(!item.target)throw new Error("Bitte einen Ziel-Avatar auswählen");
          const model=modelOptions.find(x=>x.id===item.target);
          if(!model)throw new Error("Ziel-Avatar nicht gefunden");
          const assignmentError=validateMotionAssignmentV533(appendMotionsV533,assignments.has(item.target),Boolean(model.animationUrl),replace);
          if(assignmentError)throw new Error(assignmentError);
          const check=inspections[item.id];
          if(!check||check.names.length===0)throw new Error("Bitte zuerst Motion und Rig prüfen");
          if(check.status==="incompatible"&&!allowUnmatched)throw new Error("Keine passenden Skelett-Spuren: Installation ausdrücklich freigeben");
          if(!appendMotionsV533)assignments.add(item.target);
        }
        if (item.kind==="character") {
          // The complete GLB, including every animation and morph target, is installed.
          // A preview selection must never strip or export a single embedded clip.
          const report=embeddedBundles[item.id]??await inspectEmbeddedAvatarFileV529(item.file);
          if (!report.meshes) throw new Error("Kein Avatar-Mesh gefunden");
        }
        let sharedInfoV531:SharedInfoV531|undefined;
        let characterFileV531=item.file;
        if(item.kind==="character"&&shareMotionsV531&&embeddedBundles[item.id]?.animations.length){
          try{
            const identity=await inspectSharedMotionV531(item.file);
            const existing=knownPacksV531.find(s=>sameSharedMotionV531(s,identity));
            if(existing){
              const compact=stripDuplicateAnimationsV531(await item.file.arrayBuffer());
              if(compact.byteLength<item.file.size){
                characterFileV531=new File([new Uint8Array(compact)],item.file.name,{type:"model/gltf-binary"});
                sharedInfoV531={...identity,sourceUrl:existing.url};
              }
            }else sharedInfoV531=identity;
          }catch(error){
            // Conservative fallback: preserve ALL embedded animations. A failed
            // dedupe check can never create an unanimated or broken avatar.
            sharedInfoV531=undefined;
            setMessage("Hinweis: Eine GLB konnte nicht kompaktiert werden und wird vollständig gespeichert.");
          }
        }
        if(item.kind==="motion"){
          const inspection=inspections[item.id];
          if(!inspection)throw new Error("Bitte zuerst Motions und Rig prüfen");
          const selectedIndex=clipIndices[item.id]??0;
          if(!inspection.names[selectedIndex])throw new Error("Ungültige Clip-Auswahl");
          // Optional: import *all* contained clips as individual library entries.
          // 64 clips per GLB protects browsers from unbounded export/upload queues;
          // additional files can be imported in subsequent batches.
          const indices=planAdditionalMotionClipsV533(inspection.names,selectedIndex,importAllClipsV533);
          let primaryUrl="";
          for(const index of indices){
            const fingerprint=fingerprintsV535[item.id]?.[index];
            const existing=duplicateInAvatarV535(loadCharacterMotionStore().motions,item.target,fingerprint);
            if(existing){
              duplicatesSkipped++;
              if(!primaryUrl)primaryUrl=existing.url;
              if(!appendMotionsV533&&index===selectedIndex){
                const response=await fetch("/api/avatars/animations/install",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({modelId:item.target.startsWith("local:")?item.target:`default:${item.target}`,animationUrl:existing.url})});
                const result:{error?:string}=await response.json();
                if(!response.ok)throw new Error(result.error||"Vorhandene Motion konnte nicht aktiviert werden");
              }
              continue;
            }
            const prepared=await isolateMotionClip(item.url,index,item.file.name);
            const url=await send(prepared,"motion");
            if(!primaryUrl)primaryUrl=url;
            // Existing active motion is only replaced in the legacy, explicitly selected mode.
            if(!appendMotionsV533&&index===selectedIndex){
              const response=await fetch("/api/avatars/animations/install",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({modelId:item.target.startsWith("local:")?item.target:`default:${item.target}`,animationUrl:url})});
              const result:{error?:string}=await response.json();
              if(!response.ok)throw new Error(result.error||"Zuordnung fehlgeschlagen; Upload liegt bereits vor");
            }
            addCharacterMotion(item.target,`${cleanName(item.file.name)} · ${inspection.names[index]||`Clip ${index+1}`}`,url,{fingerprint,category:suggestMotionCategoryV535(inspection.names[index])});
            clipsAdded++;
          }
          success++;update(item.id,{installed:true,installedUrl:primaryUrl,error:""});
        }else{
          const url=await send(characterFileV531,"character",sharedInfoV531);
          if(sharedInfoV531){
            if(sharedInfoV531.sourceUrl){savedTotal+=item.file.size-characterFileV531.size;sharedTotal++;}
            else knownPacksV531.push({...sharedInfoV531,url});
          }
          success++;update(item.id,{installed:true,installedUrl:url,installedSharedUrl:sharedInfoV531?.sourceUrl,error:""});
        }
      }catch(error){failure++;update(item.id,{error:error instanceof Error?error.message:"Installation fehlgeschlagen"});}
    }
    try{await onInstalled();}catch{/* Installation was completed even if refreshing failed. */}
    setSavedBytesV531(savedTotal);setSharedCountV531(sharedTotal);setAddedClipsV533(clipsAdded);setDuplicatesSkippedV535(duplicatesSkipped);
    setMessage(`${success} installiert, ${failure} fehlgeschlagen. ${clipsAdded} neue Bewegungen in der Motion-Bibliothek, ${duplicatesSkipped} nach Bewegungsdaten identische Clips übersprungen. ${sharedTotal} Avatar-GLBs verwenden die gemeinsame Motion-Quelle; ${(savedTotal/1048576).toFixed(2)} MB Upload-Daten eingespart. Neue Charaktere erscheinen nach dem Aktualisieren in der Bibliothek.`);setBusy(false);
  }
  return <section className="avatar-metadata-editor" aria-label="Character & Motion Batch Installer">
    <h3>Character & Motion Library · V535</h3>
    <p>Einfach eine GLB mit Avatar und mehreren Animationen hochladen: die Animationen bleiben über die gespeicherte GLB oder eine identische gemeinsame Quelle abspielbar. Mehrere GLBs lassen sich zusammen importieren – ohne Konfigurationsdateien.</p>
    <label className="setting-check"><input type="checkbox" checked={shareMotionsV531} onChange={e=>setShareMotionsV531(e.target.checked)}/>
      Speicheroptimierung aktivieren: identische Animationen gemeinsam speichern (nur bei übereinstimmendem Rig)</label>
    <small>Standardmäßig werden die Original-GLBs vollständig gespeichert, damit die Vorschau unverändert bleibt. Bei aktivierter Optimierung wird die erste vollständige GLB zur gemeinsamen Quelle. Weitere passende Avatare werden beim Upload ohne redundante Animationen gespeichert; ihre Originaldateien bleiben unverändert. Die Quelle darf nicht gelöscht werden, solange andere Avatare darauf verweisen. Bereits früher installierte GLBs werden nicht rückwirkend verändert.</small>
    {sharedCountV531>0&&<p role="status">{sharedCountV531} gemeinsame Avatar-Zuordnungen · {(savedBytesV531/1048576).toFixed(2)} MB eingespart</p>}
    {!admin&&<p role="status">Zum Installieren bitte als Administrator anmelden.</p>}
    <label>Charaktere (.glb) auswählen<input aria-label="Mehrere Charaktere auswählen" type="file" multiple accept=".glb,model/gltf-binary" onChange={e=>{void addFiles(e.target.files,"character");e.target.value="";}} /></label>
    <div className="avatar-metadata-editor" aria-label="V533 Erweiterbare Motion-Bibliothek">
      <h4>V533 · Später weitere Animationen hinzufügen</h4>
      <label className="setting-check"><input type="checkbox" checked={appendMotionsV533} onChange={e=>setAppendMotionsV533(e.target.checked)}/> Motions nur zur Bibliothek hinzufügen, aktive Animation und vorhandene Choreografien beibehalten</label>
      <label className="setting-check"><input type="checkbox" checked={importAllClipsV533} onChange={e=>setImportAllClipsV533(e.target.checked)}/> Alle Clips einer Motion-GLB importieren (bis zu 64 pro Datei)</label>
      <small>Die Sammlung ist nicht auf die bisherigen 20 Animationen begrenzt. Bei zusätzlichem Bibliotheksimport bleibt die aktuell aktive Motion unverändert. Neue Bewegungen müssen vor der Nutzung im 3D-Viewer auf saubere Gelenke und Fußkontakt geprüft werden. Unterschiedliche Skelette sind nicht automatisch kompatibel.</small>
      {addedClipsV533>0&&<p role="status">{addedClipsV533} neue Clips zur Bibliothek hinzugefügt.</p>}
    </div>
    <label>Motions (.glb) auswählen<input aria-label="Mehrere Motions auswählen" type="file" multiple accept=".glb,model/gltf-binary" onChange={e=>{void addFiles(e.target.files,"motion");e.target.value="";}} /></label>
    {items.length>0&&<div className="avatar-library-grid">{items.map(item=><button key={item.id} type="button" className={`avatar-card ${active===item.id?"selected":""}`} onClick={()=>{setActive(item.id);setShowOriginalV531(false);}} aria-pressed={active===item.id}>
      <strong>{item.kind==="character"?"Charakter":"Motion"}: {item.file.name}</strong><small>{(item.file.size/1048576).toFixed(2)} MB</small><small>{item.installed?"✓ Installiert":item.error?`Fehler: ${item.error}`:item.kind==="character"&&embeddedBundles[item.id]?`${embeddedBundles[item.id].animations.length} eingebettete Clips · ${embeddedBundles[item.id].joints} Gelenke`:"Bereit zur Vorschau"}</small>
    </button>)}</div>}
    {current&&<div className="settings-avatar-preview">
      <div style={{minHeight:260,width:"100%"}}>{current.kind==="character"?<AvatarPreview3D key={`${current.id}:${current.installedUrl && !showOriginalV531?"installed":"original"}`} modelUrl={current.installedUrl&&!showOriginalV531?current.installedUrl:current.url} sharedMotionUrlV531={!showOriginalV531?current.installedSharedUrl:undefined} selectedEmbeddedClipIndex={clipIndices[current.id]??0} previewSeekV534={previewSeekV534} onPreviewPlaybackV532={compareReadyV532?()=>{
        const clip=embeddedBundles[current.id]?.animations.find(clip=>clip.index===(clipIndices[current.id]??0));
        if (!clip || !qualityClipsV532.some(c=>c.name===clip.name)) return;
        const key=reviewKeyV532(current.id,clip.name);
        setPlayedModesV532(old=>({...old,[key]:{...old[key],[comparisonModeV532]:true}}));
      }:undefined} preferences={preferences} />: current.target && modelOptions.find(m=>m.id===current.target)?.url ? <AvatarPreview3D key={`${current.id}:${current.target}`} modelUrl={modelOptions.find(m=>m.id===current.target)?.url||null} animationUrl={current.url} studio selectedExternalClipIndexV534={clipIndices[current.id]??0} previewSeekV534={previewSeekV534} preferences={preferences}/>:<p>Für die animierte Vorschau einen Avatar auswählen.</p>}</div>
      <div><strong>{current.file.name}</strong><p>{current.kind==="character"?current.installedUrl?"3D-Vorschau der installierten GLB – Originalvergleich möglich":"3D-Charaktervorschau – Maus/Touch zum Drehen":"Motion wird dem ausgewählten Avatar zugewiesen"}</p>
        {current.kind==="character"&&current.installedUrl&&!compareReadyV532&&<button type="button" onClick={()=>setShowOriginalV531(v=>!v)}>{showOriginalV531?"Installierte GLB testen":"Original-GLB zum Vergleich zeigen"}</button>}
        {compareReadyV532&&<div className="avatar-metadata-editor" aria-label="V532 Qualitätstest Original gegen installiert">
          <strong>V532 · 3 Tanzbewegungen im A/B-Vergleich prüfen</strong>
          <p>Jede Bewegung zuerst als Original, danach als installierte GLB abspielen und auf Füße, Gelenke und saubere Bewegungsabläufe achten. „Tanz testen“ startet nur die Ansicht – grün wird ein Clip erst nach deiner Bestätigung.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button type="button" aria-pressed={showOriginalV531} onClick={()=>setShowOriginalV531(true)}>Original-GLB</button>
            <button type="button" aria-pressed={!showOriginalV531} onClick={()=>setShowOriginalV531(false)}>Installierte GLB{current.installedSharedUrl?" (gemeinsame Motions)":""}</button>
          </div>
          <p role="status">Aktueller Vergleich: <strong>{comparisonModeV532==="original"?"Original":"Installiert"}</strong>. Der Wechsel startet den Clip bei 0 Sekunden und pausiert; bitte erneut „Tanz testen“ drücken.</p>
          {qualityClipsV532.map(clip=>{
            const key=reviewKeyV532(current.id,clip.name);
            const views=playedModesV532[key]??{};
            const both=Boolean(views.original&&views.installed);
            return <div key={clip.name} style={{marginTop:8}}>
              <button type="button" aria-pressed={(clipIndices[current.id]??0)===clip.index} onClick={()=>selectClipV534(current,clip.index)}>{clip.name}</button>
              <small> {views.original?"✓ Original gestartet":"○ Original offen"} · {views.installed?"✓ Installation gestartet":"○ Installation offen"}</small>
              <label className="setting-check"><input type="checkbox" disabled={!both} checked={!!acceptedClipsV532[key]}
                onChange={event=>setAcceptedClipsV532(old=>({...old,[key]:event.target.checked}))}/>
                Beide Ansichten geprüft – Bewegung sieht für mich gut aus</label>
            </div>;
          })}
          <p role="status">{qualityCompleteV532?"✓ Alle drei A/B-Vergleiche von dir bestätigt.":"Noch nicht abgeschlossen. Die Optimierung bleibt optional; falls ein Clip nicht stimmt, Original-GLB verwenden."}</p>
          <small>Es handelt sich um eine manuelle Sichtprüfung in deinem Browser, nicht um einen automatischen visuellen Regressionstest. Die Schaltflächen speichern keine GLB-Dateien und ändern keine Choreografie.</small>
        </div>}
        {current.kind==="character"&&embeddedBundles[current.id]&&<div className="avatar-metadata-editor" aria-label="Eingebettete GLB-Animationen V529">
          <p role="status"><strong>{embeddedBundles[current.id].animations.length} Animationen direkt im Avatar</strong> · {embeddedBundles[current.id].joints} Gelenke · {embeddedBundles[current.id].skins} Skelett(e) · {embeddedBundles[current.id].morphTargets.length} Gesicht-/Morph-Targets</p>
          {embeddedBundles[current.id].animations.length>0&&<label>Animation in der 3D-Vorschau testen
            <select aria-label="Eingebettete Animation auswählen" value={clipIndices[current.id]??0} onChange={e=>selectClipV534(current,Number(e.target.value))}>
              {embeddedBundles[current.id].animations.map(clip=><option key={clip.index} value={clip.index}>{clip.name} · {clip.durationSeconds===null?"Dauer unbekannt":`${clip.durationSeconds.toFixed(1)} s`} · {clip.channels} Kanäle</option>)}
            </select>
          </label>}
          {embeddedBundles[current.id].morphTargets.length>0&&<p><strong>Morph-Targets:</strong> {embeddedBundles[current.id].morphTargets.join(", ")}</p>}
          {embeddedBundles[current.id].warnings.length>0&&<ul>{embeddedBundles[current.id].warnings.map((warning,i)=><li key={i}>{warning}</li>)}</ul>}
          {embeddedBundles[current.id].animations.length>0&&advancedPanelV534(current,embeddedBundles[current.id].animations.map(clip=>clip.name))}
          <small>Mit „Tanz testen“ die gewählte Animation abspielen. Die Auswahl betrifft nur die Vorschau. Ohne Speicheroptimierung wird die vollständige GLB gespeichert; mit Optimierung können identische Clips über einen gemeinsamen Quell-Avatar abgespielt werden.</small>
        </div>}
        {current.kind==="character"&&current.error&&<p role="alert">{current.error}</p>}
        {current.kind==="motion"&&<label>Ziel-Avatar<select value={current.target} onChange={e=>{update(current.id,{target:e.target.value});setInspections(old=>{const next={...old};delete next[current.id];return next;});}}>{modelOptions.map(m=><option value={m.id} key={m.id}>{m.label}</option>)}</select></label>}
        {current.kind==="motion"&&<div className="avatar-metadata-editor">
          <button type="button" disabled={inspectionBusy||busy} onClick={()=>void inspect(current)}>{inspectionBusy?"Prüfe…":"Clips und Rig prüfen"}</button>
          {inspections[current.id]&&<>
            <p role="status">Skelett-Status: {inspections[current.id].status} · {inspections[current.id].matched} passende / {inspections[current.id].total} Spuren ({inspections[current.id].skipped} übersprungen). Namensbasierte Heuristik, keine Garantie für korrektes Retargeting.</p>
            <label>Clip zur Installation<select value={clipIndices[current.id]??0} onChange={e=>selectClipV534(current,Number(e.target.value))}>{inspections[current.id].names.map((name,i)=><option key={i} value={i}>{name} · {inspections[current.id].durations[i].toFixed(1)}s · {inspections[current.id].tracks[i]} Spuren</option>)}</select></label>
            {(()=>{const index=clipIndices[current.id]??0;
              const fingerprint=fingerprintsV535[current.id]?.[index];
              const duplicate=duplicateInAvatarV535(loadCharacterMotionStore().motions,current.target,fingerprint);
              const category=suggestMotionCategoryV535(inspections[current.id].names[index]??"");
              return <p role="status">V535 · {MOTION_CATEGORY_LABELS_V535[category]} · {duplicate?`Identische Animationskurven bereits vorhanden: ${duplicate.name} – erneuter Upload wird übersprungen.`:fingerprint?"Animierter Clip geprüft – kein bereits bekannter identischer Datensatz für diesen Avatar.":"Kein Fingerabdruck verfügbar – vorsichtshalber keine automatische Dublettenentscheidung."}</p>;
            })()}
            <div className="avatar-metadata-editor" aria-label="V533 Motion Quality Inspector">
              <strong>Motion Quality Inspector · technischer Vorabcheck</strong>
              <button type="button" disabled={qualityBusyV533||busy} onClick={()=>void inspectQualityV533(current)}>{qualityBusyV533?"Untersuche…":"Ausgewählten Clip auf Sprünge und Fußbewegungen prüfen"}</button>
              {qualityReportsV533[`${current.id}:${clipIndices[current.id]??0}`]&&(()=>{
                const report=qualityReportsV533[`${current.id}:${clipIndices[current.id]??0}`];
                return <div role="status"><p>{report.name}: {report.sampledTracks} analysierte Spuren, {report.keyframes} Keyframes · {explainAdditionalMotionQualityV533(report.issues.length,report.sampledTracks)}</p>
                  {report.issues.length>0?<ul>{report.issues.slice(0,8).map((issue,i)=><li key={i}>{issue.message} ({issue.track}) – {issue.suggestion}</li>)}</ul>:<p>Keine Auffälligkeiten in den geprüften Kurven. Das ist kein Beweis für gute 3D-Bewegungen.</p>}
                </div>;
              })()}
              <small>Der Inspector nutzt begrenzte Keyframe-Stichproben. Er ersetzt keine echte Sichtprüfung auf der Bühne und bewertet keine ästhetische Tanzqualität.</small>
            </div>
            {advancedPanelV534(current,inspections[current.id].names)}
            <small>Die 3D-Vorschau bietet eigene Wiedergabe- und Clip-Regler. Mit „Alle Clips“ wird jede Animation als eigener Bibliothekseintrag exportiert; sonst nur die ausgewählte.</small>
          </>}
        </div>}
        <button type="button" onClick={()=>{URL.revokeObjectURL(current.url);blobUrls.current=blobUrls.current.filter(url=>url!==current.url);setItems(old=>old.filter(x=>x.id!==current.id));setActive("");}} disabled={busy}>Aus Warteschlange entfernen</button>
      </div>
    </div>}
    <label className="setting-check"><input type="checkbox" checked={allowUnmatched} onChange={e=>setAllowUnmatched(e.target.checked)}/> Installation ohne passende Rig-Spuren ausdrücklich erlauben</label>
    <label className="setting-check"><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/> Bereits zugewiesene Motions ersetzen</label>
    <button type="button" disabled={!admin||busy||available.length===0} onClick={()=>void install()}>{busy?"Installiere…":`${available.length} Dateien installieren`}</button>
    {message&&<p role="status">{message}</p>}
    <CharacterMotionLibraryPanel models={models} preferences={preferences} admin={admin} />
    <small>V589: Manuelle Qualitätsabnahme mit Zeitmarkern und JSON-Prüfbericht auf Basis tatsächlich ausgewerteter Original-GLB-Posen, keine automatische Sichtprüfung. V535: Neue Clips werden vorsichtig anhand ihrer tatsächlichen Animationskurven dedupliziert (pro Ziel-Avatar, niemals allein anhand des Namens); ältere Einträge können in der Bibliothek per Knopfdruck nachanalysiert werden. V534: Zusätzliche read-only Skelett- und Übergangsdiagnostik im Import-Preview. V533: Separate Motion-GLBs können jederzeit als zusätzliche Bibliothekseinträge installiert werden, ohne die aktive Bewegung zu ersetzen. V531: Beim ersten Import wird eine vollständige GLB mit allen Clips gespeichert; identische Folgemodelle können die Clips über einen gemeinsam genutzten Quell-Avatar beziehen. Separate Motion-GLBs behalten den bisherigen Einzelclip-Import. Maximal 30 Dateien pro Auswahl und 35 MB je GLB. Ohne Vercel Blob funktioniert die Installation nur lokal im Entwicklungsmodus; Upload und Vorschau erfordern Admin-Rechte für die Installation. Das Retargeting fremder Skelette bleibt heuristisch. Bereits installierte Charaktere bleiben erhalten.</small>
  </section>;
}
