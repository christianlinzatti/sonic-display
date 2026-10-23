"use client";
import {useState} from 'react';
import {readMusicGalleryV341,saveMusicGalleryV341,type MusicGallerySettingsV341} from '@/services/stageContent/musicGalleryV341';
export function MusicGallerySettingsV341(){
 const [s,setS]=useState(readMusicGalleryV341);
 const update=(patch:Partial<MusicGallerySettingsV341>)=>setS(saveMusicGalleryV341({...s,...patch}));
 return <fieldset><legend>V341 – Musiksynchrone Bildergalerie</legend>
  <p>Bildwechsel je nach Songabschnitt: ruhig bei Verse/Break, lebendiger bei Hook/Drop. Optional starke Beatimpulse verwenden.</p>
  <label className="setting-check"><input type="checkbox" checked={s.enabled} onChange={e=>update({enabled:e.target.checked})}/> Musiksynchronisierung aktivieren</label>
  <label>Intensität ({s.intensity} %) <input type="range" min="0" max="100" step="5" value={s.intensity} onChange={e=>update({intensity:Number(e.target.value)})}/></label>
  <label className="setting-check"><input type="checkbox" checked={s.beatSync} onChange={e=>update({beatSync:e.target.checked})}/> Bildwechsel auf markante Kicks (nur Hook, Build, Drop)</label>
  <label>Kick-Schwelle ({s.beatThreshold.toFixed(2)}) <input type="range" min="0.1" max="1" step="0.05" value={s.beatThreshold} onChange={e=>update({beatThreshold:Number(e.target.value)})}/></label>
  <label>Mindestabstand ({s.minGapSeconds.toFixed(1)} s) <input type="range" min="1" max="10" step="0.5" value={s.minGapSeconds} onChange={e=>update({minGapSeconds:Number(e.target.value)})}/></label>
  <label>Übergang <select value={s.transition} onChange={e=>update({transition:e.target.value as MusicGallerySettingsV341['transition']})}><option value="fade">Überblenden</option><option value="slide">Seitlich einblenden</option><option value="zoom">Sanfter Zoom</option></select></label>
  <small>Bei aktivierter Bewegungsreduktion und bei Einzelbild/Collage gibt es keine automatischen Bildwechsel. Keine weitere Mikrofonberechtigung nötig.</small>
 </fieldset>;
}
