"use client";
import {useState} from 'react';
import {readGalleryV338,saveGalleryV338,type GallerySettingsV338} from '@/services/stageContent/galleryV338';
export function GallerySettingsV338(){
 const [settings,setSettings]=useState(readGalleryV338);
 const update=(patch:Partial<GallerySettingsV338>)=>setSettings(saveGalleryV338({...settings,...patch}));
 return <fieldset><legend>V338 – Bildergalerien</legend>
  <p>Mehrere Künstler- und Konzertbilder anzeigen, wenn die API sie liefert. Keine QR-Codes.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Galerie aktivieren</label>
  <label>Darstellung <select value={settings.mode} onChange={e=>update({mode:e.target.value as GallerySettingsV338['mode']})}><option value="slideshow">Diashow</option><option value="collage">Collage (bis zu 4 Bilder)</option><option value="single">Nur erstes Bild</option></select></label>
  <label>Bildwechsel ({settings.intervalSeconds} Sekunden) <input type="range" min="3" max="30" value={settings.intervalSeconds} onChange={e=>update({intervalSeconds:Number(e.target.value)})}/></label>
  <label>Maximale Bilder ({settings.maxImages}) <input type="range" min="1" max="12" value={settings.maxImages} onChange={e=>update({maxImages:Number(e.target.value)})}/></label>
  <small>Spotify liefert für Künstler oft nur verschiedene Auflösungen desselben Motivs; zusätzliche Motive benötigen eine weitere Bildquelle.</small>
 </fieldset>;
}
