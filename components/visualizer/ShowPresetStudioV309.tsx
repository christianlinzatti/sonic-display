"use client";
import {useEffect,useState} from "react";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {StageThemeLivePreview} from "./StageThemeLivePreview";
import {readNaturalDanceV320,writeNaturalDanceV320} from "./naturalDanceIntelligenceV320";
import {readEvolutionV313,writeEvolutionV313} from "./danceShowEvolutionV313";
import {readChoreographyV312,writeChoreographyV312} from "./intelligentDanceChoreographyV312";
import {readDancePerformanceV311,writeDancePerformanceV311} from "./advancedDancePerformanceV311";
import {readShowSettings,writeShowSettings} from "./ultimateShowDirectorV306";
import {readDanceQualitySettings,writeDanceQualitySettings} from "./danceQualityV307";
import {readConcertAtmosphereSettings,writeConcertAtmosphereSettings} from "./concertAtmosphereV308";
import {readShowQualitySettingsV310,writeShowQualitySettingsV310} from "./smartShowQualityV310";
import {readStageDirector,writeStageDirector} from "./stageDirectorV287";
import {BUILTIN_SHOW_PRESETS,MAX_CUSTOM_SHOW_PRESETS,readCustomShowPresets,writeCustomShowPresets,readUndoShowPreset,saveUndoShowPreset,notifyPresetStageChange,captureShowSettings,type ShowPreset,type ShowPresetSettings} from "./showPresetsV309";

const currentSystems=()=>({show:readShowSettings(),dance:readDanceQualitySettings(),atmosphere:readConcertAtmosphereSettings(),director:readStageDirector(),quality:readShowQualitySettingsV310(),performanceV311:readDancePerformanceV311(),choreographyV312:readChoreographyV312(),evolutionV313:readEvolutionV313(),naturalV320:readNaturalDanceV320()});
export function ShowPresetStudioV309(){
  const {preferences,updatePreferences}=useUiPreferences();
  const [custom,setCustom]=useState<ShowPreset[]>([]);
  const [selected,setSelected]=useState("rave");
  const [undo,setUndo]=useState<ShowPresetSettings|null>(null);
  const [name,setName]=useState("");
  const [message,setMessage]=useState("");
  useEffect(()=>{setCustom(readCustomShowPresets());setUndo(readUndoShowPreset());},[]);
  const all=[...BUILTIN_SHOW_PRESETS,...custom];
  const preview=all.find(p=>p.id===selected)??BUILTIN_SHOW_PRESETS[0];
  const applySettings=(settings:ShowPresetSettings)=>{
    // Dispatch BEFORE React updates preferences. The scene must not mistake a preset for a manual stage override.
    notifyPresetStageChange(settings.ui.stageTheme);
    updatePreferences(settings.ui);
    writeStageDirector(settings.director);
    writeShowSettings(settings.show);
    writeDanceQualitySettings(settings.dance);
    writeConcertAtmosphereSettings(settings.atmosphere);
    writeShowQualitySettingsV310(settings.quality);
    writeDancePerformanceV311(settings.performanceV311);
    writeChoreographyV312(settings.choreographyV312);
    writeEvolutionV313(settings.evolutionV313);
    writeNaturalDanceV320(settings.naturalV320);
  };
  const start=(p:ShowPreset)=>{
    if(!undo){const snapshot=captureShowSettings(preferences,currentSystems());setUndo(snapshot);saveUndoShowPreset(snapshot);}
    applySettings(p);
    setSelected(p.id);
    setMessage(`„${p.name}“ aktiviert. Deine bisherigen Show-Einstellungen lassen sich wiederherstellen.`);
  };
  const restore=()=>{
    const previous=undo??readUndoShowPreset();
    if(!previous)return;
    applySettings(previous);setUndo(null);saveUndoShowPreset(null);
    setMessage("Vorherige Show-Einstellungen wiederhergestellt.");
  };
  const saveCustom=()=>{
    const label=name.trim().slice(0,50);
    if(!label){setMessage("Bitte einen Namen für dein Preset eingeben.");return;}
    if(custom.length>=MAX_CUSTOM_SHOW_PRESETS){setMessage(`Maximal ${MAX_CUSTOM_SHOW_PRESETS} eigene Shows möglich.`);return;}
    const item:ShowPreset={...captureShowSettings(preferences,currentSystems()),id:`custom-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,name:label,description:"Deine gespeicherte Kombination aus Kamera, Tanz, Bühne und Licht.",tag:"Eigenes Preset"};
    const next=[...custom,item];
    if(writeCustomShowPresets(next)){setCustom(next);setName("");setSelected(item.id);setMessage(`„${label}“ gespeichert.`);}
    else setMessage("Speichern im Browser ist nicht verfügbar.");
  };
  const remove=(id:string)=>{
    const next=custom.filter(p=>p.id!==id);
    if(writeCustomShowPresets(next)){setCustom(next);if(selected===id)setSelected("rave");setMessage("Eigenes Preset gelöscht.");}
    else setMessage("Löschen im Browser ist nicht verfügbar.");
  };
  return <fieldset className="stage-director-v287 show-presets-v309"><legend>One-Click Tanzshows · V309</legend>
    <p>Eine fertige Tanzshow mit einem Klick: Bühne, automatische Kameraregie, Tanzstil, Lichtkegel und Dance FX werden passend aufeinander abgestimmt.</p>
    <div className="show-presets-v309-grid" role="list" aria-label="Fertige Show-Presets">
      {all.map(p=><div role="listitem" key={p.id} className={`show-presets-v309-card ${selected===p.id?"selected":""}`}>
        <div className={`show-presets-v309-swatch theme-${p.ui.stageTheme??"classic"}`} aria-hidden="true"><span/></div>
        <strong>{p.name}</strong><small>{p.tag}</small>
        <div className="show-presets-v309-actions">
          <button type="button" onClick={()=>setSelected(p.id)} aria-label={`${p.name} ansehen`} aria-pressed={selected===p.id}>Vorschau</button>
          <button type="button" onClick={()=>start(p)} aria-label={`${p.name} starten`}>Show starten</button>
        </div>
        {p.id.startsWith("custom-")&&<button type="button" className="show-presets-v309-delete" onClick={()=>remove(p.id)} aria-label={`${p.name} löschen`}>Löschen</button>}
      </div>)}
    </div>
    <div className="show-presets-v309-preview">
      <strong>Vorschau: {preview.name}</strong>
      <p>{preview.description}</p>
      <StageThemeLivePreview theme={preview.ui.stageTheme??"classic"} reactive={preview.ui.stageReactive??true} lightStrength={preview.ui.stageLightStrength??60} reducedMotion={preferences.reducedMotion}/>
      <small>Kamera: {preview.director.cameraIntensity}% · Ausdruck: {preview.dance.intensity}% · Show: {preview.show.intensity}% · Atmosphäre: {preview.atmosphere.intensity}% · Choreo: {preview.choreographyV312.enabled?"Duo aktiv":"klassisch"} · Dramaturgie: {preview.evolutionV313.enabled?"aktiv":"aus"} · Natürlichkeit: {preview.naturalV320.enabled?"aktiv":"aus"}</small>
      <button type="button" onClick={()=>start(preview)}>▶ {preview.name} starten</button>
    </div>
    <div className="show-presets-v309-restore">
      <button type="button" onClick={restore} disabled={!undo}>Vorherige Show-Einstellungen wiederherstellen</button>
      <small>Die Sicherung bleibt auch beim Wechsel zwischen Shows bestehen. Importierte Avatare, Motion-Dateien, Kamera-Keyframes, Mikrofon-Einstellung und reduzierte Bewegung werden nicht verändert.</small>
    </div>
    <div className="show-presets-v309-save">
      <label>Eigene Show speichern<input type="text" value={name} maxLength={50} onChange={e=>setName(e.target.value)} placeholder="z. B. Mein Freitagabend-Set" /></label>
      <button type="button" onClick={saveCustom}>Aktuelle Show als Preset speichern</button>
    </div>
    <small role="status" aria-live="polite">{message||"Vorschau ändert keine Einstellungen. Die fertigen Presets berücksichtigen vorhandene Performance- und Licht-Blackout-Regeln."}</small>
  </fieldset>;
}
