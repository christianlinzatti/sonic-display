"use client";
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {GALLERY_LAYOUT_EVENT_V344,readGalleryLayoutsV344,updateGalleryFrameV344,resetGalleryFrameV344,readGalleryPresetsV344,saveGalleryPresetV344,deleteGalleryPresetV344, type GalleryRatioV344,type GalleryFrameV344} from '@/services/stageContent/galleryLayoutV344';

type DragV344={kind:'move'|'resize';startX:number;startY:number;initial:GalleryFrameV344};
/** Overlay is strictly editor-only; saved frame also applies to the real stage gallery. */
export function GalleryLayoutEditorV344({ratio,surfaceRef}:{ratio:GalleryRatioV344;surfaceRef:React.RefObject<HTMLDivElement|null>}){
 const [layout,setLayout]=useState(readGalleryLayoutsV344);
 const [editing,setEditing]=useState(false);
 const [name,setName]=useState('');
 const [presets,setPresets]=useState(readGalleryPresetsV344);
 const [selected,setSelected]=useState('');
 const drag=useRef<DragV344|null>(null);
 useEffect(()=>{const update=()=>setLayout(readGalleryLayoutsV344());window.addEventListener(GALLERY_LAYOUT_EVENT_V344,update);return()=>window.removeEventListener(GALLERY_LAYOUT_EVENT_V344,update);},[]);
 const frame=layout[ratio];
 const patch=(v:Partial<GalleryFrameV344>)=>updateGalleryFrameV344(ratio,v);
 const start=(event:ReactPointerEvent<HTMLDivElement>,kind:'move'|'resize')=>{
  if(!editing||event.button!==0)return;
  event.preventDefault();event.stopPropagation();event.currentTarget.setPointerCapture(event.pointerId);
  drag.current={kind,startX:event.clientX,startY:event.clientY,initial:frame};
 };
 const move=(event:ReactPointerEvent<HTMLDivElement>)=>{
  const active=drag.current;const rect=surfaceRef.current?.getBoundingClientRect();if(!active||!rect)return;
  const dx=(event.clientX-active.startX)/Math.max(1,rect.width)*100;
  const dy=(event.clientY-active.startY)/Math.max(1,rect.height)*100;
  if(active.kind==='move')patch({x:active.initial.x+dx,y:active.initial.y+dy});
  else patch({width:active.initial.width+dx,height:active.initial.height+dy});
 };
 const slider=(key:keyof GalleryFrameV344,min:number,max:number,step:number,label:string)=>
  <label key={key}>{label} ({Math.round(frame[key]*100)/100})
   <input type="range" min={min} max={max} step={step} value={frame[key]} onChange={e=>patch({[key]:Number(e.target.value)})}/>
  </label>;
 const applyPreset=()=>{const preset=presets.find(p=>p.name===selected&&p.ratio===ratio);if(preset)patch(preset.frame);};
 const onKey=(event:ReactKeyboardEvent<HTMLDivElement>)=>{
  const delta=event.shiftKey?5:1;
  if(event.key==='ArrowLeft')patch({x:frame.x-delta});
  else if(event.key==='ArrowRight')patch({x:frame.x+delta});
  else if(event.key==='ArrowUp')patch({y:frame.y-delta});
  else if(event.key==='ArrowDown')patch({y:frame.y+delta});
  else return;
  event.preventDefault();event.stopPropagation();
 };
 return <fieldset className="sonic-gallery-layout-editor-v344"><legend>V344 – Gallery Layout Editor</legend>
  <p>Rahmen im Bild ziehen oder am gelben Eckgriff skalieren. Position, Größe und Bildausschnitt werden getrennt für 16:9, 1:1 und 3:4 gespeichert und auch auf der Bühne verwendet.</p>
  <label className="setting-check"><input type="checkbox" checked={editing} onChange={e=>setEditing(e.target.checked)}/> Bildrahmen im Vorschaufenster bearbeiten</label>
  {editing&&surfaceRef.current&&createPortal(<div className="sonic-gallery-layout-overlay-v344" style={{position:'absolute',inset:0}} aria-label="Galerierahmen bearbeiten">
   <div className="sonic-gallery-layout-frame-v344" tabIndex={0} role="group" aria-label="Galerierahmen: Pfeiltasten verschieben, Shift für größere Schritte" onKeyDown={onKey}
    style={{left:`${frame.x}%`,top:`${frame.y}%`,width:`${frame.width}%`,height:`${frame.height}%`}}
    onPointerDown={e=>{if(e.target===e.currentTarget)start(e,'move');}}
    onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
    <div className="sonic-gallery-layout-handle-v344" role="button" tabIndex={-1} aria-label="Galerierahmen vergrößern" onPointerDown={e=>start(e,'resize')} onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}/>
   </div>
  </div>,surfaceRef.current)}
  <div className="sonic-gallery-layout-controls-v344">
   {slider('x',0,100-frame.width,1,'Links %')}
   {slider('y',0,100-frame.height,1,'Oben %')}
   {slider('width',20,100-frame.x,1,'Rahmenbreite %')}
   {slider('height',20,100-frame.y,1,'Rahmenhöhe %')}
   {slider('zoom',1,2,.05,'Bildzoom')}
   {slider('cropX',0,100,1,'Bildausschnitt horizontal %')}
   {slider('cropY',0,100,1,'Bildausschnitt vertikal %')}
  </div>
  <button type="button" onClick={()=>resetGalleryFrameV344(ratio)}>Layout für dieses Format zurücksetzen</button>
  <div className="sonic-preview-toolbar-v343">
   <label>Vorlage benennen <input value={name} maxLength={48} onChange={e=>setName(e.target.value)} placeholder="z. B. Künstlerportrait"/></label>
   <button type="button" disabled={!name.trim()} onClick={()=>{setPresets(saveGalleryPresetV344(name,ratio,frame));setSelected(name.trim());}}>Vorlage speichern</button>
   <label>Gespeicherte Vorlagen <select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Vorlage wählen</option>{presets.filter(p=>p.ratio===ratio).map(p=><option key={p.name} value={p.name}>{p.name}</option>)}</select></label>
   <button type="button" disabled={!selected} onClick={applyPreset}>Vorlage laden</button>
   <button type="button" disabled={!selected} onClick={()=>{setPresets(deleteGalleryPresetV344(selected,ratio));setSelected('');}}>Vorlage löschen</button>
  </div>
  <small>Der Ausschnitt wird ohne Änderung an den Quelldateien gespeichert. Bildposition und Zoom gelten für das gesamte gewählte Bildformat. Die Bilder selbst werden nicht gespeichert.</small>
 </fieldset>;
}
