"use client";
import {useMemo,useState} from "react";
import dynamic from "next/dynamic";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import type {CameraPose} from "./stageCameraPoseHelpersV289";
import {DEFAULT_CAMERA_STUDIO_V398,normalizeCameraStudioV398,previewCameraPoseV398,profileFromPreviewPoseV398,
 type CameraSceneV398,type CameraShotChoiceV398} from "./cameraPerformanceStudioV398";

const CameraLivePreviewV291=dynamic(()=>import("./CameraLivePreviewV291").then(m=>m.CameraLivePreviewV291),{ssr:false});
const scenes:CameraSceneV398[]=["verse","hook","drop"];
const labels:Record<CameraSceneV398,string>={verse:"Verse · Rap/Gesang",hook:"Hook · Refrain",drop:"Drop · Festival"};
const shotChoices:{value:CameraShotChoiceV398;label:string}[]=[
 {value:"auto",label:"Automatisch · V397 entscheidet"},{value:"lead",label:"Solo · Sänger"},
 {value:"two-shot",label:"Duett · zwei Performer"},{value:"group",label:"Gruppe · Bühnenweite"}];
/** On-demand stage camera editor; preview Canvas is isolated and does not alter the live renderer. */
export function CameraPerformanceStudioV398({avatarUrl,avatarLabel}:{avatarUrl?:string|null;avatarLabel?:string}){
 const {preferences,updatePreferences}=useUiPreferences();
 const profile=normalizeCameraStudioV398(preferences.avatarCameraStudioV398);
 const [scene,setScene]=useState<CameraSceneV398>("verse");
 const [showPreview,setShowPreview]=useState(false);
 const tuning=profile.scenes[scene];
 const pose=useMemo(()=>previewCameraPoseV398(scene,profile),[scene,tuning.shot,tuning.distance,tuning.pan]);
 const commit=(patch:Partial<typeof tuning>)=>updatePreferences({avatarCameraStudioV398:{...profile,scenes:{...profile.scenes,[scene]:{...tuning,...patch}}}});
 const selectScene=(newScene:CameraSceneV398)=>{setScene(newScene);};
 const orbitUpdate=(next:CameraPose)=>updatePreferences({avatarCameraStudioV398:profileFromPreviewPoseV398(profile,scene,next)});
 return <section className="camera-performance-studio-v398" aria-label="V398 Camera Performance Studio">
  <h4>V398 · Camera Performance Studio</h4>
  <p>Solo, Duett und Gruppe für Verse, Hook und Drop getrennt einstellen. Die 3D-Vorschau nutzt den ausgewählten Avatar und beeinflusst die Live-Kamera nicht direkt.</p>
  <label className="setting-check"><input type="checkbox" checked={profile.enabled} onChange={e=>updatePreferences({avatarCameraStudioV398:{...profile,enabled:e.target.checked}})}/> V398-Einstellungen in der laufenden V397-Regie verwenden</label>
  <div role="group" aria-label="Musikabschnitt wählen" className="v398-scenes">
   {scenes.map(key=><button key={key} type="button" aria-pressed={scene===key} onClick={()=>selectScene(key)}>{labels[key]}</button>)}
  </div>
  <label>Kameraperspektive
   <select value={tuning.shot} onChange={e=>commit({shot:e.target.value as CameraShotChoiceV398})}>
    {shotChoices.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}
   </select>
  </label>
  <label>Zoom / Nähe ({tuning.distance} %)<input type="range" min="0" max="100" step="1" value={tuning.distance} onChange={e=>commit({distance:Number(e.target.value)})}/></label>
  <label>Seitliche Ausrichtung ({tuning.pan} %)<input type="range" min="-100" max="100" step="1" value={tuning.pan} onChange={e=>commit({pan:Number(e.target.value)})}/></label>
  <label>Minimale Haltezeit ({profile.holdMs} ms)<input type="range" min="450" max="2400" step="50" value={profile.holdMs} onChange={e=>updatePreferences({avatarCameraStudioV398:{...profile,holdMs:Number(e.target.value)}})}/></label>
  <div className="v398-actions">
   <button type="button" onClick={()=>setShowPreview(v=>!v)} aria-expanded={showPreview}>{showPreview?"3D-Vorschau schließen":"3D-Vorschau öffnen"}</button>
   <button type="button" onClick={()=>commit(DEFAULT_CAMERA_STUDIO_V398.scenes[scene])}>Diesen Abschnitt zurücksetzen</button>
   <button type="button" onClick={()=>updatePreferences({avatarCameraStudioV398:normalizeCameraStudioV398(null)})}>Alle zurücksetzen</button>
  </div>
  {showPreview&&<div className="v398-preview" aria-label={`3D-Vorschau ${labels[scene]}`}>
   <CameraLivePreviewV291 pose={pose} onPoseChange={orbitUpdate} avatarUrl={avatarUrl} avatarLabel={avatarLabel}/>
   <small>3D-Kamera drehen, zoomen oder seitlich verschieben. Zoom und seitliches Verschieben werden für „{labels[scene]}“ übernommen. Dreh-/Neigungswinkel dienen nur der Vorschau; die Live-Kamera respektiert die vorhandenen Regiepfade. Eine Duett-/Gruppenauswahl zeigt hier nur einen Avatar; die tatsächliche Besetzung ist auf der Hauptbühne sichtbar.</small>
  </div>}
  <small>V397 muss eingeschaltet sein. Solo- und Duettfokus erfordern gültige zeitmarkierte Lyrics; Duett benötigt eine echte Rollenübergabe. Unsichtbare Performer werden nicht eingeblendet. Manuelle Kamera-Presets, Live-Edits, Timelines, Lyrics-Schutz, Pause und „Reduced Motion“ haben Vorrang.</small>
 </section>;
}
