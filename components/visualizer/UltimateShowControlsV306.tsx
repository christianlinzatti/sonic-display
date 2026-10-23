"use client";
import { useEffect, useState } from "react";
import { DEFAULT_SHOW_SETTINGS, readShowSettings, writeShowSettings, ULTIMATE_SHOW_EVENT, type ShowSettings, type ShowStyle } from "./ultimateShowDirectorV306";
/** One-click opt-in orchestration. Existing scene, camera presets and manual clips are not rewritten. */
export function UltimateShowControlsV306() {
  const [settings,setSettings]=useState<ShowSettings>(DEFAULT_SHOW_SETTINGS);
  useEffect(()=>{const sync=()=>setSettings(readShowSettings());sync();window.addEventListener(ULTIMATE_SHOW_EVENT,sync);return ()=>window.removeEventListener(ULTIMATE_SHOW_EVENT,sync);},[]);
  const update=(changes:Partial<ShowSettings>)=>{const next={...settings,...changes};setSettings(next);writeShowSettings(next);};
  return <fieldset className="stage-director-v287 ultimate-show-v306"><legend>Ultimate Show Director · V306</legend>
    <p>Ein gemeinsamer Show-Plan synchronisiert Bühne, Kamera, Licht, Tanzformationen und Dance FX mit Verse, Hook, Build, Break und Drop.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> <strong>Automatische Tanzshow starten</strong></label>
    <label>Show-Stil<select value={settings.style} disabled={!settings.enabled} onChange={e=>update({style:e.target.value as ShowStyle})}>
      <option value="auto">Automatisch nach Genre</option><option value="rave">Hardtekk / Hardstyle Rave</option><option value="rap">Deutschrap Spotlight</option><option value="cinematic">Cinematic Concert</option>
    </select></label>
    <label>Show-Intensität ({settings.intensity} %)<input type="range" min="0" max="100" step="5" value={settings.intensity} disabled={!settings.enabled} onChange={e=>update({intensity:Number(e.target.value)})}/></label>
    <label className="setting-check"><input type="checkbox" checked={settings.camera} disabled={!settings.enabled} onChange={e=>update({camera:e.target.checked})}/> Automatische Kamerainszenierung (eigene Presets haben Vorrang)</label>
    <label className="setting-check"><input type="checkbox" checked={settings.lighting} disabled={!settings.enabled} onChange={e=>update({lighting:e.target.checked})}/> Lichtdramaturgie und Drop-Akzente</label>
    <label className="setting-check"><input type="checkbox" checked={settings.formations} disabled={!settings.enabled} onChange={e=>update({formations:e.target.checked})}/> Solo-/Duo-Formationen passend zum Songabschnitt</label>
    <label className="setting-check"><input type="checkbox" checked={settings.effects} disabled={!settings.enabled} onChange={e=>update({effects:e.target.checked})}/> Dezente Dance FX zum Beat</label>
    <small>Optional und abschaltbar. Deine eigenen Motion-Clips, Kamera-Keyframes und manuelle Multi-Avatar-Einstellungen bleiben erhalten. Pausen/Seek erzeugen keinen künstlichen Drop; Reduced Motion unterdrückt animierte Akzente.</small>
  </fieldset>;
}
