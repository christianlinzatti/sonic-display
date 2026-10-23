"use client";
import {useEffect,useState} from "react";
import {DEFAULT_SHOW_QUALITY_V310,readShowQualitySettingsV310,writeShowQualitySettingsV310,SHOW_QUALITY_EVENT_V310,type ShowQualitySettingsV310} from "./smartShowQualityV310";

export function ShowQualityControlsV310(){
  const [settings,setSettings]=useState<ShowQualitySettingsV310>({...DEFAULT_SHOW_QUALITY_V310});
  useEffect(()=>{const sync=()=>setSettings(readShowQualitySettingsV310());sync();window.addEventListener(SHOW_QUALITY_EVENT_V310,sync);return()=>window.removeEventListener(SHOW_QUALITY_EVENT_V310,sync);},[]);
  const change=(update:Partial<ShowQualitySettingsV310>)=>{const next={...settings,...update};setSettings(next);writeShowQualitySettingsV310(next);};
  return <fieldset className="stage-director-v287 smart-show-quality-v310"><legend>Smart Show Quality Director · V310</legend>
    <p>Weniger Wiederholungen, ruhige Breaks und ausgewogene Lichteffekte. Die Show verändert ihre Einstellungen nur an musikalischen Abschnitten oder Phrasengrenzen.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>change({enabled:e.target.checked})}/> <strong>Show-Qualität automatisch optimieren</strong></label>
    <label>Abwechslung ({settings.variety} %)<input type="range" min="0" max="100" step="5" value={settings.variety} disabled={!settings.enabled} onChange={e=>change({variety:Number(e.target.value)})}/></label>
    <label>Kameraposition mindestens halten ({settings.minHoldSeconds} Sekunden)<input type="range" min="8" max="40" step="2" value={settings.minHoldSeconds} disabled={!settings.enabled} onChange={e=>change({minHoldSeconds:Number(e.target.value)})}/></label>
    <label>Tänzer im Mittelpunkt ({settings.dancerFocus} %)<input type="range" min="0" max="100" step="5" value={settings.dancerFocus} disabled={!settings.enabled} onChange={e=>change({dancerFocus:Number(e.target.value)})}/></label>
    <label>Maximale automatische Dance FX ({settings.fxCeiling} %)<input type="range" min="0" max="100" step="5" value={settings.fxCeiling} disabled={!settings.enabled} onChange={e=>change({fxCeiling:Number(e.target.value)})}/></label>
    <small>Wirkt nur bei eingeschaltetem Ultimate Show Director V306. Eigene Kamera-Keyframes, manuelle Animationen und Licht-Timelines behalten Vorrang. Pausen, Titelsprünge und Reduced Motion werden berücksichtigt.</small>
  </fieldset>;
}
