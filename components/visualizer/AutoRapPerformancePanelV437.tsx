"use client";
import {useMemo} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {planAutomaticRapPerformanceV437,sampleAutomaticRapPerformanceV437} from "./automaticRapPerformanceV437";

export function AutoRapPerformancePanelV437({previewMs}:{previewMs:number|null}){
  const {track,lyrics,progressMs}=useMusic();
  const {preferences,updatePreferences}=useUiPreferences();
  const enabled=preferences.rapAutoPerformanceEnabledV437??true;
  const strength=preferences.rapAutoPerformanceStrengthV437??70;
  const id=track?.id??"";
  const plan=useMemo(()=>planAutomaticRapPerformanceV437({trackId:id,lyrics,
    authored:id?(preferences.rapDuetAssignmentsV416??{})[id]??[]:[]}),
    [id,lyrics,preferences.rapDuetAssignmentsV416]);
  const preview=sampleAutomaticRapPerformanceV437(plan,{trackId:id,progressMs:previewMs??progressMs,
    playing:true,reducedMotion:false,enabled:true,strength});
  return <fieldset aria-label="V437 Automatic Rap Performance Director" style={{marginTop:10,padding:12,border:"1px solid #587c76",borderRadius:8}}>
    <legend>V437 · Automatic Rap Performance Director</legend>
    <label className="setting-check"><input type="checkbox" checked={enabled}
      onChange={e=>updatePreferences({rapAutoPerformanceEnabledV437:e.target.checked})}/>
      Rap-Performance für jeden Song automatisch steuern</label>
    <label>Automatik-Intensität ({strength} %)
      <input type="range" min="0" max="100" step="5" value={strength} aria-label="V437 Rap Automatik Intensität"
        onChange={e=>updatePreferences({rapAutoPerformanceStrengthV437:Number(e.target.value)})}/></label>
    <p>Analyse: <strong>{plan.available?`${plan.lines.length} Lyrics-Zeilen · ${plan.hookLines} Hook-Zeilen`:"Noch keine synchronisierten Lyrics"}</strong>
      {plan.available&&<> · {plan.authored?"Deine Rapper-Zuordnungen":"Automatisch erkannte Textstruktur"}</>}</p>
    <p>Vorschau: <strong>{preview.active?preview.scene:"Keine aktive Lyrics-Zeile"}</strong>
      {preview.active&&<> · Dynamik {Math.round(preview.energy*100)} % · Mimik +{preview.faceBoost} · Gesten +{preview.gestureBoost}</>}</p>
    <small>Die Analyse startet bei verfügbaren, synchronisierten Lyrics automatisch, auch mit einem Solo-Avatar.
      Bei bekanntem Nicht-Rap-Genre bleibt die normale Performance aktiv.
      Verse, Hook-Wiederholungen und Silbendichte sind Textheuristiken – keine echte Rapper-, Phonem- oder Emotionserkennung.
      Nur während der Wiedergabe aktiv; pausierte Titel und reduzierte Bewegung setzen den Effekt aus.
      Manuell festgelegte Choreografien, Tänze, Sprecher und feinbearbeitete Lippenbewegungen haben Vorrang.
      Vorschau verändert weder Spotify-Zeit noch Live-Animation.</small>
  </fieldset>;
}
