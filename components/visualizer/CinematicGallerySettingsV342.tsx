"use client";
import {useState} from 'react';
import {readCinematicV342,saveCinematicV342,type CinematicGallerySettingsV342} from '@/services/stageContent/cinematicGalleryV342';
export function CinematicGallerySettingsV342(){
 const [s,setS]=useState(readCinematicV342);
 const update=(patch:Partial<CinematicGallerySettingsV342>)=>setS(saveCinematicV342({...s,...patch}));
 return <fieldset><legend>V342 – Cinematic Photo Transitions</legend>
  <p>Sanfte Kamerafahrten innerhalb von Künstlerfotos. Kein zusätzlicher Three.js-Renderloop. Effekte sind standardmäßig aus.</p>
  <label className="setting-check"><input type="checkbox" checked={s.enabled} onChange={e=>update({enabled:e.target.checked})}/> Filmische Fotoanimation aktivieren</label>
  <label>Bewegung <select value={s.style} onChange={e=>update({style:e.target.value as CinematicGallerySettingsV342['style']})}>
   <option value="mixed">Schwenk, Zoom &amp; Parallax</option><option value="pan">Schwenk</option><option value="zoom">Zoom</option><option value="parallax">Parallax &amp; Schwenk</option></select></label>
  <label>Zoom ({s.zoomPercent.toFixed(1)} %) <input type="range" min="0" max="14" step="0.5" value={s.zoomPercent} onChange={e=>update({zoomPercent:Number(e.target.value)})}/></label>
  <label>Schwenk ({s.panPercent.toFixed(1)} %) <input type="range" min="0" max="10" step="0.5" value={s.panPercent} onChange={e=>update({panPercent:Number(e.target.value)})}/></label>
  <label>Parallax ({s.parallaxPercent.toFixed(1)} %) <input type="range" min="0" max="5" step="0.5" value={s.parallaxPercent} onChange={e=>update({parallaxPercent:Number(e.target.value)})}/></label>
  <label>Überblenddauer ({s.transitionMs} ms) <input type="range" min="150" max="2000" step="50" value={s.transitionMs} onChange={e=>update({transitionMs:Number(e.target.value)})}/></label>
  <label className="setting-check"><input type="checkbox" checked={s.lowPower} onChange={e=>update({lowPower:e.target.checked})}/> Sparmodus (halbe Bewegungsstärke)</label>
  <small>Bei System-Einstellung „Bewegung reduzieren“ oder der Bewegungsreduktion in Sonic Display bleiben die Fotos statisch. Die Galerie nutzt vorhandene Bilddateien, ohne neue Tracking-Daten.</small>
 </fieldset>;
}
