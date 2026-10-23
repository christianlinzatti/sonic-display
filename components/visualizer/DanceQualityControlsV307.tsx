"use client";
import {useEffect,useState} from "react";
import {DEFAULT_DANCE_QUALITY, DANCE_QUALITY_EVENT, readDanceQualitySettings, refreshDanceQualitySettings, writeDanceQualitySettings, type DanceQualitySettings, type DanceQualityStyle} from "./danceQualityV307";

export function DanceQualityControlsV307() {
  const [settings,setSettings] = useState<DanceQualitySettings>(DEFAULT_DANCE_QUALITY);
  useEffect(()=>{
    const sync=()=>setSettings(refreshDanceQualitySettings());
    sync();window.addEventListener(DANCE_QUALITY_EVENT,sync);window.addEventListener("storage",sync);
    return ()=>{window.removeEventListener(DANCE_QUALITY_EVENT,sync);window.removeEventListener("storage",sync);};
  },[]);
  const update=(next:Partial<DanceQualitySettings>)=>{
    const merged={...settings,...next};setSettings(merged);writeDanceQualitySettings(merged);
  };
  return <fieldset className="stage-director-v287 dance-quality-v307"><legend>Dance Quality &amp; Expression · V307</legend>
    <p>Natürlichere, abwechslungsreichere Akzente für Kopf, Schultern, Oberkörper und Arme. Der Original-Tanzclip bleibt erhalten; die Fußkorrektur hat Vorrang.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> <strong>Lebendige Tanzbewegungen aktivieren</strong></label>
    <label>Bewegungsstil<select value={settings.style} disabled={!settings.enabled} onChange={e=>update({style:e.target.value as DanceQualityStyle})}>
      <option value="auto">Automatisch nach Musikgenre</option><option value="rave">Hardtekk / Hardstyle – präzise Akzente</option><option value="rap">Deutschrap – lockerer Groove und Gestik</option><option value="cinematic">Cinematic – ruhigere Bewegungen</option>
    </select></label>
    <label>Ausdrucksstärke ({settings.intensity} %)<input type="range" min="0" max="100" step="5" value={settings.intensity} disabled={!settings.enabled} onChange={e=>update({intensity:Number(e.target.value)})}/></label>
    <label className="setting-check"><input type="checkbox" checked={settings.expressiveArms} disabled={!settings.enabled} onChange={e=>update({expressiveArms:e.target.checked})}/> Abwechselnde, natürliche Armgesten</label>
    <label className="setting-check"><input type="checkbox" checked={settings.bodyGroove} disabled={!settings.enabled} onChange={e=>update({bodyGroove:e.target.checked})}/> Schulter-, Hüft- und Oberkörper-Groove</label>
    <label className="setting-check"><input type="checkbox" checked={settings.plantedFootSafety} disabled={!settings.enabled} onChange={e=>update({plantedFootSafety:e.target.checked})}/> Zusätzliche Schritte bei Bodenkontakt begrenzen</label>
    <button type="button" onClick={()=>update(DEFAULT_DANCE_QUALITY)}>V307 auf Standardwerte zurücksetzen</button>
    <small>V307 verwendet musikalische Phrasen für wiederholbare, variierende Gesten. Bei Pause oder „Reduzierte Bewegung“ schaltet die Schicht ab. Im reinen Choreografie-Modus bleiben zusätzliche Akzente bewusst dezent. Ohne Mikrofon/BPM-Signal wird ein geschätzter Rhythmus verwendet.</small>
  </fieldset>;
}
