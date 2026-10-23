"use client";
import { useEffect, useState } from "react";
import { CONCERT_ATMOSPHERE_EVENT, DEFAULT_CONCERT_ATMOSPHERE, readConcertAtmosphereSettings, writeConcertAtmosphereSettings, type AtmosphereSettingsV308 } from "./concertAtmosphereV308";

/** Saved independently of stage presets and V306 show preferences. */
export function ConcertAtmosphereControlsV308() {
  const [settings, setSettings] = useState<AtmosphereSettingsV308>(DEFAULT_CONCERT_ATMOSPHERE);
  useEffect(() => {
    const sync=()=>setSettings(readConcertAtmosphereSettings());
    sync(); window.addEventListener(CONCERT_ATMOSPHERE_EVENT,sync); window.addEventListener("storage",sync);
    return ()=>{window.removeEventListener(CONCERT_ATMOSPHERE_EVENT,sync);window.removeEventListener("storage",sync);};
  }, []);
  const update=(patch:Partial<AtmosphereSettingsV308>)=>{
    const next={...settings,...patch};setSettings(next);writeConcertAtmosphereSettings(next);
  };
  return <fieldset className="stage-director-v287 concert-atmosphere-v308"><legend>Concert Lighting &amp; Atmosphere · V308</legend>
    <p>Weiche 3D-Lichtkegel, dezenter Bodennebel und räumliche Bühnenspots. Die Show-Regie steuert Build-up, Break und Drop gemeinsam mit deinen Licht-Timelines.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> <strong>Konzertatmosphäre aktivieren</strong></label>
    <label className="setting-check"><input type="checkbox" disabled={!settings.enabled} checked={settings.beams} onChange={e=>update({beams:e.target.checked})}/> Weiche volumetrische Lichtkegel</label>
    <label className="setting-check"><input type="checkbox" disabled={!settings.enabled} checked={settings.haze} onChange={e=>update({haze:e.target.checked})}/> Sanfter Bodennebel / Haze</label>
    <label className="setting-check"><input type="checkbox" disabled={!settings.enabled} checked={settings.stageSpots} onChange={e=>update({stageSpots:e.target.checked})}/> Zusätzliche echte 3D-Spotlights ohne Schattenberechnung</label>
    <label className="setting-check"><input type="checkbox" disabled={!settings.enabled} checked={settings.syncToShow} onChange={e=>update({syncToShow:e.target.checked})}/> An Ultimate Show Director synchronisieren</label>
    <label>Lichtintensität ({settings.intensity} %)<input type="range" min="0" max="100" step="5" value={settings.intensity} disabled={!settings.enabled} onChange={e=>update({intensity:Number(e.target.value)})}/></label>
    <label>Nebeldichte ({settings.hazeDensity} %)<input type="range" min="0" max="100" step="5" value={settings.hazeDensity} disabled={!settings.enabled||!settings.haze} onChange={e=>update({hazeDensity:Number(e.target.value)})}/></label>
    <label>Spotlight-Bewegung ({settings.sweep} %)<input type="range" min="0" max="100" step="5" value={settings.sweep} disabled={!settings.enabled||!settings.beams} onChange={e=>update({sweep:Number(e.target.value)})}/></label>
    <button type="button" onClick={()=>update(DEFAULT_CONCERT_ATMOSPHERE)}>V308 auf Standardwerte zurücksetzen</button>
    <small>Auf Low-End-Geräten deaktiviert Sonic Display neue Lichtkegel und Zusatzspots automatisch; die bestehenden Lichter bleiben erhalten. Keine Stroboskop-Effekte oder zusätzlichen Shadow-Maps. Reduzierte Bewegung hält die Lichtkegel still.</small>
  </fieldset>;
}
