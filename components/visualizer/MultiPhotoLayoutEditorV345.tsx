'use client';
import {useEffect,useRef,useState,type PointerEvent as Pointer,type KeyboardEvent as Key} from 'react';
import {createPortal} from 'react-dom';
import type {GalleryRatioV344} from '@/services/stageContent/galleryLayoutV344';
import {MULTI_PHOTO_EVENT_V345,readPhotoCompositionsV345,updatePhotoCompositionV345,updatePhotoLayerV345,addPhotoLayerV345,removePhotoLayerV345,readPhotoPresetsV345,savePhotoPresetV345,deletePhotoPresetV345,DEFAULT_LAYERS_V345,type PhotoLayerV345,type PhotoMotionV345} from '@/services/stageContent/multiPhotoLayoutV345';
type Drag={kind:'move'|'resize';startX:number;startY:number;original:PhotoLayerV345};
export function MultiPhotoLayoutEditorV345({ratio,surfaceRef,imageCount}:{ratio:GalleryRatioV344;surfaceRef:React.RefObject<HTMLDivElement|null>;imageCount:number}){
 const [layouts,setLayouts]=useState(readPhotoCompositionsV345);
 const [selected,setSelected]=useState(0);
 const [editing,setEditing]=useState(false);
 const [name,setName]=useState('');const [presets,setPresets]=useState(readPhotoPresetsV345);const [chosen,setChosen]=useState('');
 const drag=useRef<Drag|null>(null);
 useEffect(()=>{const listener=()=>setLayouts(readPhotoCompositionsV345());window.addEventListener(MULTI_PHOTO_EVENT_V345,listener);return()=>window.removeEventListener(MULTI_PHOTO_EVENT_V345,listener);},[]);
 const composition=layouts[ratio];const active=composition.layers.find(x=>x.id===selected)||composition.layers[0];
 const patch=(p:Partial<PhotoLayerV345>)=>{if(active)updatePhotoLayerV345(ratio,active.id,p);};
 const start=(event:Pointer<HTMLDivElement>,layer:PhotoLayerV345,kind:'move'|'resize')=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();setSelected(layer.id);event.currentTarget.setPointerCapture(event.pointerId);drag.current={kind,startX:event.clientX,startY:event.clientY,original:layer};};
 const move=(event:Pointer<HTMLDivElement>)=>{const d=drag.current;const rect=surfaceRef.current?.getBoundingClientRect();if(!d||!rect)return;
  const dx=(event.clientX-d.startX)/Math.max(1,rect.width)*100,dy=(event.clientY-d.startY)/Math.max(1,rect.height)*100;
  updatePhotoLayerV345(ratio,d.original.id,d.kind==='move'?{x:d.original.x+dx,y:d.original.y+dy}:{width:d.original.width+dx,height:d.original.height+dy});
 };
 const onKey=(event:Key<HTMLDivElement>,layer:PhotoLayerV345)=>{const delta=event.shiftKey?5:1;
  if(event.key==='ArrowLeft')updatePhotoLayerV345(ratio,layer.id,{x:layer.x-delta});
  else if(event.key==='ArrowRight')updatePhotoLayerV345(ratio,layer.id,{x:layer.x+delta});
  else if(event.key==='ArrowUp')updatePhotoLayerV345(ratio,layer.id,{y:layer.y-delta});
  else if(event.key==='ArrowDown')updatePhotoLayerV345(ratio,layer.id,{y:layer.y+delta});
  else return;event.preventDefault();event.stopPropagation();};
 const slider=(key:'x'|'y'|'width'|'height'|'zoom'|'cropX'|'cropY',min:number,max:number,step:number,label:string)=>active&&<label key={key}>{label}: {Math.round(active[key]*100)/100}<input type="range" min={min} max={max} step={step} value={active[key]} onChange={e=>patch({[key]:Number(e.target.value)})}/></label>;
 return <fieldset className="sonic-multi-photo-editor-v345"><legend>V345 – Multi-Photo Layout Studio</legend>
  <p>Bis zu acht Fotos unabhängig auf einer Leinwand positionieren. Reihenfolge: unteres Bild zuerst, oberstes Bild zuletzt. Leere Fotoslots werden in der Anzeige übersprungen.</p>
  <label className="setting-check"><input type="checkbox" checked={composition.enabled} onChange={e=>updatePhotoCompositionV345(ratio,{enabled:e.target.checked})}/> Mehrbild-Komposition auf Vorschau und Bühne aktivieren</label>
  <label className="setting-check"><input type="checkbox" checked={editing} onChange={e=>setEditing(e.target.checked)}/> Einzelne Bilder direkt in der Vorschau bearbeiten</label>
  <div className="sonic-preview-toolbar-v343"><label>Fotoebene <select value={active?.id??''} onChange={e=>setSelected(Number(e.target.value))}>{composition.layers.map((l,i)=><option key={l.id} value={l.id}>Bild {i+1} (Foto {(i%Math.max(1,imageCount))+1})</option>)}</select></label>
   <button type="button" onClick={()=>{const c=addPhotoLayerV345(ratio);setSelected(c.layers[c.layers.length-1]?.id??0);}} disabled={composition.layers.length>=8}>Bild hinzufügen</button>
   <button type="button" disabled={!active} onClick={()=>{if(active){removePhotoLayerV345(ratio,active.id);setSelected(composition.layers.find(x=>x.id!==active.id)?.id??0);}}}>Bild entfernen</button>
   <button type="button" onClick={()=>{updatePhotoCompositionV345(ratio,{layers:DEFAULT_LAYERS_V345});setSelected(0);}}>Standardanordnung</button>
  </div>
  {editing&&composition.enabled&&surfaceRef.current&&createPortal(<div className="sonic-multi-photo-overlay-v345" aria-label="Bilder auf Leinwand bearbeiten">
   {composition.layers.map((l,i)=><div key={l.id} role="group" tabIndex={0} aria-label={`Bild ${i+1}: Pfeiltasten verschieben, Shift für größere Schritte`} onKeyDown={e=>onKey(e,l)}
     className={`sonic-multi-photo-edit-frame-v345 ${l.id===active?.id?'sonic-multi-photo-selected-v345':''}`}
     style={{left:`${l.x}%`,top:`${l.y}%`,width:`${l.width}%`,height:`${l.height}%`}}
     onPointerDown={e=>{if(e.target===e.currentTarget)start(e,l,'move');}} onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
      <span className="sonic-multi-photo-label-v345">{i+1}</span>
      <div className="sonic-multi-photo-handle-v345" role="button" aria-label={`Bild ${i+1} skalieren`} onPointerDown={e=>start(e,l,'resize')} onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}/>
    </div>)}
  </div>,surfaceRef.current)}
  {active?<><div className="sonic-gallery-layout-controls-v344">{slider('x',0,100-active.width,1,'Links %')}{slider('y',0,100-active.height,1,'Oben %')}{slider('width',12,100-active.x,1,'Breite %')}{slider('height',12,100-active.y,1,'Höhe %')}{slider('zoom',1,2.5,.05,'Fotozoom')}{slider('cropX',0,100,1,'Fokus horizontal')}{slider('cropY',0,100,1,'Fokus vertikal')}</div>
   <label>Animation für dieses Bild <select value={active.motion} onChange={e=>patch({motion:e.target.value as PhotoMotionV345})}><option value="none">Keine</option><option value="float">Langsam schweben</option><option value="pulse">Sanft pulsieren</option><option value="fade">Einblenden</option></select></label></>:<p>Füge mindestens ein Bild hinzu.</p>}
  <div className="sonic-preview-toolbar-v343"><label>Komposition benennen <input maxLength={48} value={name} onChange={e=>setName(e.target.value)} placeholder="z. B. Künstler-Trio"/></label>
   <button type="button" disabled={!name.trim()} onClick={()=>{setPresets(savePhotoPresetV345(name,ratio,composition.layers));setChosen(name.trim());}}>Speichern</button>
   <label>Gespeicherte Kompositionen <select value={chosen} onChange={e=>setChosen(e.target.value)}><option value="">Auswählen</option>{presets.filter(p=>p.ratio===ratio).map(p=><option key={p.name} value={p.name}>{p.name}</option>)}</select></label>
   <button type="button" disabled={!chosen} onClick={()=>{const p=presets.find(p=>p.name===chosen&&p.ratio===ratio);if(p){updatePhotoCompositionV345(ratio,{enabled:true,layers:p.layers});setSelected(p.layers[0]?.id??0);}}}>Laden</button>
   <button type="button" disabled={!chosen} onClick={()=>{setPresets(deletePhotoPresetV345(chosen,ratio));setChosen('');}}>Löschen</button>
  </div>
  <small>Die Fotodateien und URLs werden nicht gespeichert. Vorlagen enthalten nur Bildplätze und Darstellungsparameter. Bei weniger Fotos als Ebenen werden verfügbare Fotos wiederverwendet. Animationen berücksichtigen reduzierte Bewegung.</small>
 </fieldset>;
}
