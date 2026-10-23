"use client";
import {useState} from 'react';
import {readImageSelectionV340,saveImageSelectionV340,type ImageSelectionSettingsV340} from '@/services/stageContent/imageSelectionV340';
export function ImageSelectionSettingsV340(){
 const [settings,setSettings]=useState(readImageSelectionV340);
 const update=(patch:Partial<ImageSelectionSettingsV340>)=>setSettings(saveImageSelectionV340({...settings,...patch}));
 return <fieldset><legend>V340 – Intelligente Bilderauswahl</legend>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Bildauswahl automatisch optimieren</label>
  <label>Auswahlprofil <select value={settings.mode} onChange={e=>update({mode:e.target.value as ImageSelectionSettingsV340['mode']})}><option value="balanced">Ausgewogen</option><option value="quality">Bildformat priorisieren</option><option value="variety">Abwechslung priorisieren</option></select></label>
  <label>Bildformat-Gewichtung ({settings.aspectWeight} %) <input type="range" min="0" max="100" step="5" value={settings.aspectWeight} onChange={e=>update({aspectWeight:Number(e.target.value)})}/></label>
  <label>Mindestbreite ({settings.minWidth}px) <input type="range" min="0" max="1600" step="40" value={settings.minWidth} onChange={e=>update({minWidth:Number(e.target.value)})}/></label>
  <label>Mindesthöhe ({settings.minHeight}px) <input type="range" min="0" max="1000" step="40" value={settings.minHeight} onChange={e=>update({minHeight:Number(e.target.value)})}/></label>
  <label className="setting-check"><input type="checkbox" checked={settings.preferDistinct} onChange={e=>update({preferDistinct:e.target.checked})}/> Unterschiedliche Motive bevorzugen</label>
  <small>Bewertung anhand von Abmessungen, Seitenverhältnis und URL-Ähnlichkeiten; keine KI-Gesichts- oder Unschärfeerkennung. Externe Bilder können die Auslesung von Metadaten blockieren.</small>
 </fieldset>;
}
