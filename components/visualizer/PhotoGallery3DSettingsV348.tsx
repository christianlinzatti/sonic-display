'use client';
import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import {PHOTO_GALLERY_3D_EVENT_V348,readPhotoGallery3DV348,savePhotoGallery3DV348,projectPhotoLayerV348,type PhotoGallery3DSettingsV348} from '@/services/stageContent/photoGallery3DV348';
import {MULTI_PHOTO_EVENT_V345,readPhotoCompositionsV345} from '@/services/stageContent/multiPhotoLayoutV345';
import {layoutRatioV344} from '@/services/stageContent/galleryLayoutV344';
import {safeStageMediaV330} from '@/services/stageContent/stageContentV330';
/** Lightweight perspective preview. The actual stage uses Three.js world-space panels. */
export function PhotoGallery3DSettingsV348({images=[],aspect=16/9}:{images?:string[];aspect?:number}){
 const [s,setS]=useState(readPhotoGallery3DV348);
 const [compositions,setCompositions]=useState(readPhotoCompositionsV345);
 const [playing,setPlaying]=useState(false);
 const [beat,setBeat]=useState(0);
 const [phase,setPhase]=useState(0);
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setPhase(t=>t+.11*s.motionSpeed),100);return()=>window.clearInterval(timer);},[playing,s.motionSpeed]);
 useEffect(()=>{const reload=()=>setS(readPhotoGallery3DV348());const reloadLayers=()=>setCompositions(readPhotoCompositionsV345());window.addEventListener(PHOTO_GALLERY_3D_EVENT_V348,reload);window.addEventListener(MULTI_PHOTO_EVENT_V345,reloadLayers);return()=>{window.removeEventListener(PHOTO_GALLERY_3D_EVENT_V348,reload);window.removeEventListener(MULTI_PHOTO_EVENT_V345,reloadLayers);};},[]);
 const update=(patch:Partial<PhotoGallery3DSettingsV348>)=>savePhotoGallery3DV348({...s,...patch});
 const ratio=layoutRatioV344(aspect);
 const layers=compositions[ratio].layers;
 const safe=useMemo(()=>images.map(safeStageMediaV330).filter((x):x is string=>!!x).slice(0,8),[images]);
 const slider=(key:'depth'|'tilt'|'floatAmount'|'parallax'|'beatResponse'|'motionSpeed',min:number,max:number,step:number,label:string,unit='')=><label key={key}>{label}: {s[key].toFixed(key==='tilt'?0:2)}{unit}<input type="range" min={min} max={max} step={step} value={s[key]} onChange={e=>update({[key]:Number(e.target.value)})}/></label>;
 return <fieldset className="sonic-photo-gallery-3d-settings-v348"><legend>V348 – 3D Photo Gallery</legend>
  <p>Fotokarten schweben als separate <strong>3D-Elemente auf der Bühne</strong>. Jede V345-Bildebene erhält eigene Tiefe und Perspektive. Ohne aktivierte Mehrbild-Komposition bleibt die bisherige Galerie bestehen.</p>
  <label className="setting-check"><input type="checkbox" checked={s.enabled} onChange={e=>update({enabled:e.target.checked})}/> Räumliche Fotogalerie aktivieren</label>
  <div className="sonic-gallery-layout-controls-v344">
   {slider('depth',0,1,.05,'Tiefe')}{slider('tilt',0,30,1,'Perspektive','°')}{slider('floatAmount',0,1,.05,'Schwebebewegung')}{slider('parallax',0,1,.05,'Kamera-Parallaxe')}{slider('beatResponse',0,1,.05,'Beat-Reaktion')}{slider('motionSpeed',.2,2,.1,'Übergangsgeschwindigkeit')}
  </div>
  <label>Rahmenstil <select value={s.frameStyle} onChange={e=>update({frameStyle:e.target.value as PhotoGallery3DSettingsV348['frameStyle']})}><option value="glass">Glas</option><option value="clean">Minimal</option><option value="neon">Neon</option></select></label>
  <label>Qualität <select value={s.quality} onChange={e=>update({quality:e.target.value as PhotoGallery3DSettingsV348['quality']})}><option value="eco">Eco – weniger Effekte</option><option value="balanced">Ausgewogen</option><option value="full">Vollständig</option></select></label>
  <div className="sonic-preview-toolbar-v343"><button type="button" onClick={()=>setPlaying(x=>!x)}>{playing?'Bewegung stoppen':'Bewegung testen'}</button><label>Beat-Vorschau <input aria-label="Simulierter Beat" type="range" min="0" max="1" step="0.1" value={beat} onChange={e=>setBeat(Number(e.target.value))}/></label></div>
  <div className={`sonic-photo-3d-preview-v348 sonic-photo-3d-quality-${s.quality}-v348`} style={{aspectRatio:String(aspect),perspective:'850px'}} aria-label="Vorschau der räumlichen Bildanordnung">
   {layers.slice(0,8).map((layer,i)=>{
    const p=projectPhotoLayerV348(layer,i,layers.length,s,4.8,2.7);
    const fallbackHue=(i*63+208)%360;
    const tileStyle:CSSProperties={left:`${layer.x}%`,top:`${layer.y}%`,width:`${layer.width}%`,height:`${layer.height}%`,
     transform:`translateX(${playing?Math.sin(phase*.38)*s.parallax*(1+p.z)*6:0}px) translateZ(${Math.round(p.z*260)}px) rotateY(${p.yaw*180/Math.PI}deg) rotateX(${p.pitch*180/Math.PI}deg) translateY(${playing?Math.sin(phase+i*1.4)*s.floatAmount*4:0}px) scale(${playing?1+beat*s.beatResponse*.06:1})`,
     zIndex:i+1,'--sonic-multi-crop-x':`${layer.cropX}%`,'--sonic-multi-crop-y':`${layer.cropY}%`,'--sonic-multi-zoom':String(layer.zoom),background:`hsl(${fallbackHue} 28% 17%)`} as CSSProperties;
    return <div className={`sonic-photo-3d-panel-v348 sonic-photo-3d-frame-${s.frameStyle}-v348`} key={layer.id} style={tileStyle} aria-label={`3D-Karte ${i+1}`}>
     {safe.length?<img src={safe[i%safe.length]} alt={`3D-Vorschaubild ${i+1}`}/>:<span className="sonic-photo-3d-placeholder-v348">Bild {i+1}</span>}
    </div>;
   })}
  </div>
  <small>3D-Vorschau mit CSS-Perspektive; auf der Bühne werden die Karten wirklich als getrennte Three.js-Positionen gerendert. Ohne geladene Bilder zeigt die Vorschau beschriftete Platzhalter. Bei reduzierter Bewegung, nur einem Foto oder deaktiviertem V345-Mehrbildmodus greift weiterhin die flache Galerie. Einstellungen bleiben ausschließlich lokal im Browser.</small>
 </fieldset>;
}
