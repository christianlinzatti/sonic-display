'use client';
import {useEffect,useMemo,useState} from 'react';
import {PHOTO_SELECTION_EVENT_V349,readPhotoSelectionV349,savePhotoSelectionV349,rankPhotosForFrameV349,type PhotoSelectionSettingsV349} from '@/services/stageContent/photoSelectionV349';
import {usePhotoDimensionsV349} from '@/services/stageContent/usePhotoDimensionsV349';
import {safeStageMediaV330} from '@/services/stageContent/stageContentV330';
/** Shares the exact ranking algorithm with the 2D and world-space 3D galleries. */
export function PhotoSelectionSettingsV349({images=[],aspect=16/9}:{images?:string[];aspect?:number}){
 const [s,setS]=useState(readPhotoSelectionV349);
 const safe=useMemo(()=>[...new Set(images.map(safeStageMediaV330).filter((u):u is string=>!!u))].slice(0,24),[images]);
 const dimensions=usePhotoDimensionsV349(safe,true);
 const [previewRatio,setPreviewRatio]=useState<'screen'|'square'|'portrait'>('screen');
 useEffect(()=>{const reload=()=>setS(readPhotoSelectionV349());window.addEventListener(PHOTO_SELECTION_EVENT_V349,reload);return()=>window.removeEventListener(PHOTO_SELECTION_EVENT_V349,reload);},[]);
 const update=(patch:Partial<PhotoSelectionSettingsV349>)=>setS(savePhotoSelectionV349({...s,...patch}));
 const ratio=previewRatio==='screen'?aspect:previewRatio==='square'?1:3/4;
 const ranked=useMemo(()=>rankPhotosForFrameV349(safe.map(url=>({url,...dimensions[url]})),{width:ratio*900,height:900,displayWidth:960,displayHeight:Math.round(960/ratio)},s),[safe,dimensions,ratio,s]);
 return <fieldset className="sonic-photo-selection-settings-v349"><legend>V349 – Intelligent Photo Selection</legend>
  <p>Passende Fotos für jedes Bildfeld auswählen: Auflösung, Seitenverhältnis und Wiederholungen werden berücksichtigt. Funktioniert für die flache und die räumliche Galerie.</p>
  <label className="setting-check"><input type="checkbox" checked={s.enabled} onChange={e=>update({enabled:e.target.checked})}/> Intelligente Bildauswahl aktivieren</label>
  <label>Auswahlprofil <select value={s.mode} onChange={e=>update({mode:e.target.value as PhotoSelectionSettingsV349['mode']})}>
   <option value="balanced">Ausgewogen</option><option value="resolution">Hohe Auflösung bevorzugen</option><option value="fit">Wenig Bildzuschnitt bevorzugen</option>
  </select></label>
  <label className="setting-check"><input type="checkbox" checked={s.avoidDuplicates} onChange={e=>update({avoidDuplicates:e.target.checked})}/> Doppelte Quellen und unmittelbar wiederholte Fotos vermeiden</label>
  <div className="sonic-gallery-layout-controls-v344">
   <label>Zuschnitt gewichten: {Math.round(s.cropImportance*100)} %<input type="range" min="0" max="1" step="0.05" value={s.cropImportance} onChange={e=>update({cropImportance:Number(e.target.value)})}/></label>
   <label>Minimale kurze Bildkante: {s.minShortEdge} px<input type="range" min="0" max="2000" step="80" value={s.minShortEdge} onChange={e=>update({minShortEdge:Number(e.target.value)})}/></label>
   <label>Erlaubte Vergrößerung: {s.maxUpscale.toFixed(1)}×<input type="range" min="1" max="4" step="0.1" value={s.maxUpscale} onChange={e=>update({maxUpscale:Number(e.target.value)})}/></label>
  </div>
  <label>Vorschau-Bildformat <select value={previewRatio} onChange={e=>setPreviewRatio(e.target.value as typeof previewRatio)}><option value="screen">Aktuelle Leinwand</option><option value="square">Quadratisch 1:1</option><option value="portrait">Hochformat 3:4</option></select></label>
  {ranked.length?<div className="sonic-photo-ranking-v349" aria-label="Bewertete Fotokandidaten">{ranked.slice(0,6).map((item,i)=>{
   const meta=dimensions[item.url];return <div className="sonic-photo-ranking-entry-v349" key={item.url}>
    <img loading="lazy" src={item.url} alt={`Bildkandidat ${i+1}`} />
    <div><strong>#{i+1} · {Math.round(item.score)} Punkte</strong><small>{meta?`${meta.width} × ${meta.height} px`:'Auflösung unbekannt'}</small><small>{item.note}</small></div>
   </div>;
  })}</div>:<small>Lade zunächst im Gallery Preview Editor Künstlerfotos oder eigene Bildadressen, um die Auswahl und Auflösung hier zu vergleichen.</small>}
  <small>Die Bewertung verwendet ausschließlich Bildabmessungen, Seitenverhältnis und URL-Ähnlichkeit. Sie erkennt keine Gesichter, Schärfe oder Motive im Bild. Externe Bilder ohne auslesbare Metadaten bleiben nutzbar; Einstellungen werden lokal gespeichert, nicht die Bild-URLs.</small>
 </fieldset>;
}
