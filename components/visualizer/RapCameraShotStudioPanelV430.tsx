"use client";
import {useMemo,useState} from "react";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import type {RapCameraPlanV429} from "./cinematicRapCameraV429";
import {applyRapCameraShotV430,normalizeRapCameraOverridesV430,saveRapCameraLibraryV430,
  type RapCameraDraftChoiceV430,type RapCameraChoiceV430} from "./rapCameraShotStudioV430";

const SHOT_LABELS:Record<RapCameraDraftChoiceV430,string> = {
  auto:"Automatisch (V429)","solo-close":"Solo · Nahaufnahme",
  "reply-side":"Antwort · Seitenwechsel","duet-wide":"Duett · Totale",
  "hook-push":"Hook · sanfte Kamerafahrt",off:"Kamera hier nicht zusätzlich bewegen"
};

/** The preview timeline in V425 selects the lyric line; edits never seek Spotify or the stage camera. */
export function RapCameraShotStudioPanelV430({trackId,lineIndex,plan,lyricText}:{
  trackId:string;lineIndex:number;plan:RapCameraPlanV429;lyricText:string;
}) {
  const {preferences,updatePreferences}=useUiPreferences();
  const existing=useMemo(()=>normalizeRapCameraOverridesV430(
    trackId ? (preferences.rapCameraOverridesV430??{})[trackId] : null
  ),[preferences.rapCameraOverridesV430,trackId]);
  const saved=existing.find(item=>item.lineIndex===lineIndex);
  const [shot,setShot]=useState<RapCameraDraftChoiceV430>(saved?.shot??"auto");
  const [strength,setStrength]=useState(saved?.strength??100);
  const available=!!trackId&&lineIndex>=0&&plan.active;
  const effective=applyRapCameraShotV430(plan,trackId,trackId,existing);
  const changed=shot!==(saved?.shot??"auto")||strength!==(saved?.strength??100);
  const label=effective.active?SHOT_LABELS[effective.shot as RapCameraChoiceV430]:saved?.shot==="off"?"Ausgesetzt":"Keine Kameraszene";
  const save=()=>{
    if (!available) return;
    updatePreferences({rapCameraOverridesV430:saveRapCameraLibraryV430(
      preferences.rapCameraOverridesV430,trackId,lineIndex,shot,strength)});
    if (shot === "auto") setStrength(100);
  };
  return <fieldset aria-label="V430 Rap Camera Shot Studio" style={{padding:12,marginTop:12,border:"1px solid #536b87",borderRadius:8}}>
    <legend>V430 · Rap Camera Shot Studio</legend>
    <p>Individuelle Kameraeinstellungen pro Lyrics-Zeile. {existing.length} gespeicherte Anpassung(en) für diesen Titel.</p>
    {available?<>
      <p>Zeile {lineIndex+1}: <strong>{lyricText||"(ohne Text)"}</strong></p>
      <label htmlFor="v430-camera-shot">Kameraeinstellung
        <select id="v430-camera-shot" value={shot}
          onChange={e=>setShot(e.target.value as RapCameraDraftChoiceV430)}>
          {Object.entries(SHOT_LABELS).map(([value,text])=><option key={value} value={value}>{text}</option>)}
        </select>
      </label>
      <label>Intensität der Zeile ({strength} %)
        <input aria-label="V430 Intensität pro Lyrics-Zeile" type="range" min="0" max="100" step="5"
          value={strength} disabled={shot==="auto"||shot==="off"} onChange={e=>setStrength(Number(e.target.value))}/>
      </label>
      <p>Live aktiv gespeichert: <strong>{label}</strong> · Kameraenergie: {Math.round(effective.gain*100)} %</p>
      <button type="button" onClick={save} disabled={!changed}>Kameraeinstellung für diese Zeile speichern</button>{" "}
      <button type="button" disabled={!saved} onClick={()=>{
        updatePreferences({rapCameraOverridesV430:saveRapCameraLibraryV430(
          preferences.rapCameraOverridesV430,trackId,lineIndex,"auto",100)});
        setShot("auto");setStrength(100);
      }}>Zeile auf Automatik zurücksetzen</button>
      {changed&&<small>Änderung ist nur vorgemerkt. Erst „speichern“ übernimmt sie in die lokale Konfiguration.</small>}
    </>:<p>Wähle mit dem Vorschauzeit-Regler eine synchronisierte, manuell zugeordnete V416-Rap-Zeile aus. Ohne Zuordnung bleibt V429 unverändert.</p>}
    <small>V430 wirkt ausschließlich bei aktivierter V429-Kamera. Spotify-Position, Gesicht, Lippenbewegung und gespeicherte Kamera-Keyframes bleiben unverändert. Die manuelle Kamerasteuerung hat weiterhin Vorrang.</small>
  </fieldset>;
}
