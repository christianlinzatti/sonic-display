"use client";

import { Component, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import { Box3, Vector3, type Object3D } from "three";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { VocalRigV368 } from "./VocalRigV368";
import {
  scanFacialRigV370, FACIAL_CHANNELS_V370,FACIAL_LABELS_V370,
  type FacialChannelV370,type FacialProfileV370,
} from "./facialRigStudioV370";
import {measureFacialMotionV424,planFacialCalibrationV424,applyFacialCalibrationV424} from "./facialCalibrationV424";
import type { FacialPoseV369 } from "./facialPerformanceV369";
import {diagnoseFacialRigV383,suggestSafeFacialProfileV383,exportFacialProfileV383,importFacialProfileV383} from "./advancedFacialRigV383";
import type { AvatarModel } from "./avatarModels";
import type { VisualizerProps } from "./registry";

type TargetView = {id:string;name:string;meshName:string;suggestion:FacialChannelV370|null;confidence:string;normalizedRms:number|null};
type RigReport = {targets:TargetView[];jawBone:boolean;warnings:string[]};
type Props = {models:AvatarModel[];initialAvatarId:string};
const EMPTY_AUDIO = {mids:0} as VisualizerProps["audio"];
const EMPTY_POSE:FacialPoseV369 = {jaw:0,wide:0,round:0,lipsClosed:0,smile:0,brow:0,blink:0,cheek:0,squint:0};
const samples: Array<{name:string;pose:Partial<FacialPoseV369>}> = [
  {name:"A / AH",pose:{jaw:.9}},{name:"E / I",pose:{jaw:.25,wide:1}},
  {name:"O / U",pose:{jaw:.35,round:1}},{name:"M / B / P",pose:{lipsClosed:1}},
  {name:"Lächeln",pose:{smile:.9,cheek:.6}},{name:"Blinzeln",pose:{blink:1}},
];
class PreviewErrorV370 extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed ? <p role="alert">GLB-Vorschau konnte nicht geladen werden. Prüfe die Modell-URL und CORS-Freigabe.</p>:this.props.children;}
}
function PreviewGltfV370({url,pose,profile,demo,onScan,previewTargetV383}:{url:string;pose:FacialPoseV369;profile:FacialProfileV370;demo:"off"|"rap"|"singing";previewTargetV383:{id:string;weight:number}|null;onScan:(report:RigReport)=>void}) {
  const {scene}=useGLTF(url);
  // Runtime and editor get their own model clones; previews never modify the cached GLTF asset.
  const model=useMemo(()=>cloneSkinnedScene(scene),[scene]);
  const scan=useMemo(()=>scanFacialRigV370(model),[model]);
  const bounds=useMemo(()=>{
    const box=new Box3().setFromObject(model);
    if(box.isEmpty())return {offset:new Vector3(),scale:1};
    const size=box.getSize(new Vector3());
    const center=box.getCenter(new Vector3());
    // Frame upper face rather than the model's feet; safe with differently sized imports.
    const height=Math.max(.1,size.y);
    return {offset:new Vector3(-center.x,-(box.max.y-height*.14),-center.z),scale:Math.max(.15,Math.min(6,2.8/height))};
  },[model]);
  useEffect(()=>{
    onScan({targets:scan.targets.map(target=>({id:target.id,name:target.name,meshName:target.meshName,suggestion:target.suggestion,confidence:target.confidence,normalizedRms:measureFacialMotionV424(target).normalizedRms})),
      jawBone:Boolean(scan.jawBone),warnings:scan.warnings});
  },[scan,onScan]);
  return <group scale={bounds.scale}><group position={bounds.offset}>
    <primitive object={model}/>
    <VocalRigV368 model={model} audio={EMPTY_AUDIO} profileV370={profile} previewPoseV370={pose} demoV370={demo} previewTargetV383={previewTargetV383}/>
  </group></group>;
}
function ProceduralFaceV370({pose}:{pose:FacialPoseV369}) {
  return <group>
    <mesh><sphereGeometry args={[.74,32,24]}/><meshStandardMaterial color="#b99bba" roughness={.8}/></mesh>
    <mesh position={[-.27,.16,.62]} scale={[.12,Math.max(.025,.12*(1-pose.blink)),.08]}><sphereGeometry args={[1,12,12]}/><meshStandardMaterial color="#152436"/></mesh>
    <mesh position={[.27,.16,.62]} scale={[.12,Math.max(.025,.12*(1-pose.blink)),.08]}><sphereGeometry args={[1,12,12]}/><meshStandardMaterial color="#152436"/></mesh>
    <mesh position={[0,-.30,.67]} scale={[.25*(1+pose.wide*.55-pose.round*.35),.055+pose.jaw*.25+pose.round*.07,.065]}>
      <sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#402033"/>
    </mesh>
  </group>;
}
export function FacialAnimationStudioV370({models,initialAvatarId}:Props) {
  const {preferences,updatePreferences}=useUiPreferences();
  const [avatarId,setAvatarId]=useState(initialAvatarId);
  const [pose,setPose]=useState<FacialPoseV369>({...EMPTY_POSE});
  const [demo,setDemo]=useState<"off"|"rap"|"singing">("off");
  const [report,setReport]=useState<RigReport|null>(null);
  const [previewMorphV383,setPreviewMorphV383]=useState("");
  const [previewWeightV383,setPreviewWeightV383]=useState(.85);
  const [profileTextV383,setProfileTextV383]=useState("");
  const [profileFeedbackV383,setProfileFeedbackV383]=useState("");
  const [selectedV424,setSelectedV424]=useState<FacialChannelV370[]>(["jaw","wide","round","lipsClosed"]);
  const [overwriteV424,setOverwriteV424]=useState(false);
  const selected=models.find(m=>m.id===avatarId);
  const profile=preferences.avatarFacialProfilesV370?.[avatarId]??{};
  const onScan=useCallback((next:RigReport)=>setReport(next),[]);
  const patchProfile=(patch:Partial<FacialProfileV370>)=>{
    updatePreferences({avatarFacialProfilesV370:{...preferences.avatarFacialProfilesV370,
      [avatarId]:{...profile,...patch}}});
  };
  const setMapping=(channel:FacialChannelV370,id:string)=>{
    const mapping={...profile.mapping};
    if (id==="auto") delete mapping[channel];
    else mapping[channel]=id;
    patchProfile({mapping});
  };
  const setGain=(channel:FacialChannelV370,value:number)=>patchProfile({gains:{...profile.gains,[channel]:value}});
  const assignSample=(next:Partial<FacialPoseV369>)=>{setDemo("off");setPreviewMorphV383("");setPose({...EMPTY_POSE,...next});};
  const isProcedural=!selected?.url;
  const visibleTargets=report?.targets??[];
  const detected=visibleTargets.filter(t=>t.suggestion);
  const planV424=useMemo(()=>planFacialCalibrationV424(visibleTargets,profile,overwriteV424),[visibleTargets,profile,overwriteV424]);
  const rigDiagnosticV383=useMemo(()=>diagnoseFacialRigV383(visibleTargets,Boolean(report?.jawBone),profile),[visibleTargets,report?.jawBone,profile]);
  const auditionMorphV383=(id:string)=>{setPreviewMorphV383(id);setDemo("off");setPose({...EMPTY_POSE});};
  const restoreProfileV383=()=>{
    try {
      const result=importFacialProfileV383(profileTextV383,visibleTargets);
      patchProfile(result.profile);
      setProfileFeedbackV383(result.warnings.length?`Profil geladen. ${result.warnings.join(" ")}`:"Profil erfolgreich geladen und dem Avatar zugeordnet.");
      auditionMorphV383("");
    } catch(error){setProfileFeedbackV383(error instanceof Error?error.message:"Profil konnte nicht geladen werden.");}
  };
  return <section className="v370-studio" aria-label="Gesichtsanimation Studio">
    <header><h3>V370 · Advanced Facial Animation Studio</h3><p>Erkannte Morph-Targets prüfen und für jeden Avatar individuell kalibrieren.</p></header>
    <label>Avatar für die Kalibrierung<select value={avatarId} onChange={e=>{setAvatarId(e.target.value);setReport(null);assignSample({});setPreviewMorphV383("");setProfileTextV383("");setProfileFeedbackV383("");setSelectedV424(["jaw","wide","round","lipsClosed"]);setOverwriteV424(false);}}>
      {models.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
    </select></label>
    <div className="v370-studio-layout">
      <div>
        <div className="v370-preview" aria-label="Interaktive Gesichts-Vorschau">
          <PreviewErrorV370 key={selected?.url??"procedural"}>
            <Canvas camera={{position:[0,0,3.6],fov:38}} dpr={[1,1.5]}>
              <ambientLight intensity={1.25}/><directionalLight position={[2,3,5]} intensity={1.8}/>
              <Suspense fallback={null}>{selected?.url
                ? <PreviewGltfV370 key={selected.url} url={selected.url} pose={pose} profile={profile} demo={preferences.reducedMotion?"off":demo} previewTargetV383={previewMorphV383?{id:previewMorphV383,weight:previewWeightV383}:null} onScan={onScan}/>
                : <ProceduralFaceV370 pose={pose}/>}</Suspense>
              <OrbitControls enablePan={false} minDistance={2} maxDistance={7}/>
            </Canvas>
          </PreviewErrorV370>
        </div>
        <div className="v370-samples">{samples.map(sample=><button type="button" key={sample.name}
          onClick={()=>assignSample(sample.pose)}>{sample.name}</button>)}
          <button type="button" onClick={()=>assignSample({})}>Neutral</button>
        </div>
        <div className="v370-samples">
          <button type="button" disabled={preferences.reducedMotion} aria-pressed={demo==="rap"} onClick={()=>{setPreviewMorphV383("");setDemo(v=>v==="rap"?"off":"rap");}}>{demo==="rap"?"■ Rap stoppen":"▶ Rap-Demo"}</button>
          <button type="button" disabled={preferences.reducedMotion} aria-pressed={demo==="singing"} onClick={()=>{setPreviewMorphV383("");setDemo(v=>v==="singing"?"off":"singing");}}>{demo==="singing"?"■ Gesang stoppen":"▶ Gesang-Demo"}</button>
        </div>
        <p className="v370-info">Demos verwenden ein simuliertes Sprechtempo, keine echte Spracherkennung. Die Probe animiert die echten Morphs über denselben Controller wie die Show. Änderungen an diesem Profil wirken sofort auf den zugehörigen Avatar.</p>
      </div>
      <div className="v370-calibration">
        {isProcedural ? <p>Prozeduraler Avatar: Die Demo zeigt Mund- und Augenbewegungen. Individuelle GLB-Morph-Zuordnung ist nur für importierte Modelle verfügbar.</p> : <>
          <p><strong>{visibleTargets.length}</strong> Morph-Targets gefunden, <strong>{detected.length}</strong> automatisch zugeordnet{report?.jawBone?", Kieferknochen erkannt":""}.</p>
          {report?.warnings.map(w=><p className="v370-warning" key={w}>{w}</p>)}
          <section className="v383-rig-panel" aria-label="V383 Advanced Facial Rig">
            <h4>V383 · Advanced Facial Rig</h4>
            <p>Automatische Analyse: <strong>{rigDiagnosticV383.coverage} % Kanalabdeckung</strong> · {rigDiagnosticV383.identified} von {rigDiagnosticV383.total} Morphs erkannt · {rigDiagnosticV383.active} Kanäle mit Blendshape</p>
            <div className="v383-rig-coverage" role="progressbar" aria-label="Gesichts-Kanalabdeckung" aria-valuenow={rigDiagnosticV383.coverage} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${rigDiagnosticV383.coverage}%`}}/></div>
            <div className="v383-rig-status">{FACIAL_CHANNELS_V370.map(c=><span key={c} title={FACIAL_LABELS_V370[c]} data-status={rigDiagnosticV383.channels[c].status}>{c}: {rigDiagnosticV383.channels[c].status==='ready'?"automatisch":rigDiagnosticV383.channels[c].status==='manual'?"manuell":rigDiagnosticV383.channels[c].status==='disabled'?"aus":rigDiagnosticV383.channels[c].status==='invalid'?"ungültig":"fehlt"}</span>)}</div>
            {rigDiagnosticV383.warnings.map(w=><p className="v370-warning" key={w}>{w}</p>)}
            <button type="button" onClick={()=>{patchProfile(suggestSafeFacialProfileV383(visibleTargets,profile));setProfileFeedbackV383("Sichere Startintensitäten übernommen; gültige manuelle Zuordnungen beibehalten.");}}>Sichere Startkalibrierung übernehmen</button>
            <label>Einzelnes Blendshape testen
              <select value={previewMorphV383} onChange={e=>auditionMorphV383(e.target.value)}>
                <option value="">Kein Morph isolieren</option>
                {visibleTargets.map(t=><option key={t.id} value={t.id}>{t.meshName} · {t.name}{t.suggestion?` → ${t.suggestion}`:""}</option>)}
              </select>
            </label>
            {previewMorphV383&&<>
              <label>Test-Intensität: {Math.round(previewWeightV383*100)} %
                <input type="range" min="0" max="100" step="5" value={Math.round(previewWeightV383*100)} onChange={e=>setPreviewWeightV383(Number(e.target.value)/100)}/>
              </label>
              <button type="button" onClick={()=>auditionMorphV383("")}>Einzeltest beenden</button>
            </>}
            <details><summary>Alle erkannten Morph-Targets ({visibleTargets.length})</summary>
              <div className="v383-morph-list">{visibleTargets.map(t=><button type="button" key={t.id} onClick={()=>auditionMorphV383(t.id)} aria-pressed={previewMorphV383===t.id}>{t.meshName} · {t.name} <span>{t.suggestion??"nicht erkannt"}{t.confidence==='high'?" ✓":""}</span></button>)}</div>
            </details>
            <details><summary>Kalibrierungsprofil exportieren / importieren</summary>
              <p>Der Export enthält nur Morph-Zuordnungen und Intensitäten, keine GLB-Daten. Für einen anderen Avatar werden nicht vorhandene Zuordnungen auf Automatik zurückgesetzt.</p>
              <button type="button" onClick={()=>{setProfileTextV383(exportFacialProfileV383(profile));setProfileFeedbackV383("Profil als JSON vorbereitet – Text kopieren und später wieder einfügen.");}}>Aktuelles Profil als JSON anzeigen</button>
              <label>Profil-JSON<textarea rows={6} spellCheck={false} value={profileTextV383} onChange={e=>setProfileTextV383(e.target.value)} placeholder="Gesichtsprofil als JSON hier einfügen"/></label>
              <button type="button" disabled={!profileTextV383.trim()} onClick={restoreProfileV383}>Profil überprüfen und übernehmen</button>
            </details>
            {profileFeedbackV383&&<p role="status" className="v383-profile-feedback">{profileFeedbackV383}</p>}
            <p className="v370-info">Die Erkennung bewertet Morph-Namen, nicht anatomische Qualität. Links-/Rechts-Paare bleiben bei Automatik gemeinsam aktiv. Einzeltest und Profile verändern keine gespeicherte GLB-Datei.</p>
          </section>
          <section className="v383-rig-panel" aria-label="V424 Avatar Facial Calibration Studio">
            <h4>V424 · Geometry-aware Facial Calibration</h4>
            <p>Misst die Größenordnung von Positions-Morph-Verformungen und schlägt behutsame Intensitäten für Kiefer, breite/runde Lippen und Lippenverschluss vor. Keine automatische anatomische Erkennung.</p>
            <label><input type="checkbox" checked={overwriteV424} onChange={e=>setOverwriteV424(e.target.checked)}/> Bestehende manuelle Intensitäten ausdrücklich zur Neukalibrierung freigeben</label>
            <p><strong>{planV424.suggestions.length} Vorschläge</strong> · {planV424.missing.length} nicht kalibrierbare Mundkanäle. Vorhandene manuelle Gains und deaktivierte Morphs bleiben unangetastet.</p>
            {planV424.suggestions.map(item=><label key={item.channel} style={{display:"block"}}>
              <input type="checkbox" checked={selectedV424.includes(item.channel)} onChange={e=>setSelectedV424(list=>e.target.checked?[...list,item.channel]:list.filter(c=>c!==item.channel))}/>
              {FACIAL_LABELS_V370[item.channel]}: <strong>{Math.round(item.currentGain*100)} % → {Math.round(item.gain*100)} %</strong>
              <small style={{display:"block"}}>{item.reason}</small>
            </label>)}
            {planV424.missing.length>0&&<p className="v370-info">Ohne verlässliche Geometriedaten: {planV424.missing.join(", ")}. Diese Kanäle werden nicht verändert.</p>}
            {planV424.warnings.map((message,i)=><p key={i} className="v370-warning">{message}</p>)}
            <button type="button" disabled={!planV424.suggestions.some(item=>selectedV424.includes(item.channel))} onClick={()=>{
              const chosen=planV424.suggestions.filter(item=>selectedV424.includes(item.channel));
              patchProfile(applyFacialCalibrationV424(profile,planV424,selectedV424,overwriteV424));
              setProfileFeedbackV383(`${chosen.length} vorgeschlagene Kanalintensitäten gespeichert. Über die A/E/O/M-Proben und die GLB-Vorschau überprüfen; jederzeit einzeln rückstellbar.`);
            }}>Ausgewählte V424-Kalibrierung übernehmen</button>
            <details><summary>Gemessene Morph-Verformungen ({visibleTargets.length})</summary>
              <div className="v383-morph-list">{visibleTargets.map(t=><button key={t.id} type="button" onClick={()=>auditionMorphV383(t.id)}>
                {t.meshName} · {t.name}: {t.normalizedRms===null?"keine Positionsdaten":`${(t.normalizedRms*100).toFixed(2)} % RMS`}
              </button>)}</div>
            </details>
            <p className="v370-info">Die Skalierung basiert auf der Mesh-Geometrie, nicht auf Bildanalyse oder echten Lauten. Es gibt keine automatische Änderung an GLB-Dateien. Für sichtbare Verbesserungen jeweils die Mundform-Proben verwenden.</p>
          </section>
          {FACIAL_CHANNELS_V370.map(channel=><div className="v370-channel" key={channel}>
            <label>{FACIAL_LABELS_V370[channel]}
              <select value={profile.mapping?.[channel]??"auto"} onChange={e=>setMapping(channel,e.target.value)}>
                <option value="auto">Automatisch ({visibleTargets.filter(t=>t.suggestion===channel).length})</option>
                <option value="none">Deaktivieren</option>
                {visibleTargets.map(t=><option key={t.id} value={t.id}>{t.meshName}: {t.name}{t.suggestion===channel?" ✓":""}</option>)}
              </select>
            </label>
            <label>Intensität: {Math.round((profile.gains?.[channel]??1)*100)} %
              <input type="range" min="0" max="200" step="5" value={Math.round((profile.gains?.[channel]??1)*100)}
                onChange={e=>setGain(channel,Number(e.target.value)/100)}/>
            </label>
          </div>)}
          <button type="button" onClick={()=>{
            const all={...preferences.avatarFacialProfilesV370};delete all[avatarId];
            updatePreferences({avatarFacialProfilesV370:all});
          }}>Profil für diesen Avatar zurücksetzen</button>
          <p className="v370-info">Automatik erkennt typische ARKit-, Oculus-/ReadyPlayerMe- und einige VRM-Namen. Bei einem anderen Rig bitte manuell zuordnen. Mehrere Links-/Rechts-Morphs werden im Automatikmodus gemeinsam animiert.</p>
        </>}
      </div>
    </div>
  </section>;
}
