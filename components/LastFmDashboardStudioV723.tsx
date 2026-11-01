'use client';
import {useEffect,useState,type ReactNode} from 'react';
import {clearDashboardLayoutV723,dashboardLayoutKeyV723,defaultDashboardLayoutV723,readDashboardLayoutV723,reorderDashboardWidgetV723,resizeDashboardWidgetV723,toggleDashboardWidgetV723,V723_WIDGET_IDS,V723_WIDGET_TITLES,writeDashboardLayoutV723,type V723Layout,type V723WidgetId} from '@/lib/lastfm-dashboard-layout-v723';

type Props={account:string;widgets:Record<V723WidgetId,ReactNode>;controlledLayout?:V723Layout;onLayoutChange?:(layout:V723Layout)=>void;onRestorePreset?:()=>void};
/** Editable local layout around existing V722 widgets; never mutates archive data. */
export function LastFmDashboardStudioV723({account,widgets,controlledLayout,onLayoutChange,onRestorePreset}:Props){
 const [localLayout,setLayout]=useState<V723Layout>(defaultDashboardLayoutV723);
 const layout=controlledLayout??localLayout;
 const [editing,setEditing]=useState(false);
 const [status,setStatus]=useState('');
 const [dragging,setDragging]=useState<V723WidgetId|null>(null);
 useEffect(()=>{
  const load=()=>{try{const result=readDashboardLayoutV723(window.localStorage,account);setLayout(result.layout);setStatus(result.error??'');}catch{setLayout(defaultDashboardLayoutV723());setStatus('Browserspeicher nicht verfügbar. Änderungen bleiben nur in dieser Ansicht.');}};
  if(controlledLayout)return;
  load();const key=dashboardLayoutKeyV723(account);
  const onOtherTab=(event:StorageEvent)=>{if(key&&(event.key===key||event.key===null))load();};
  window.addEventListener('storage',onOtherTab);return()=>window.removeEventListener('storage',onOtherTab);
 },[account,controlledLayout!==undefined]);
 function apply(next:V723Layout){
  if(controlledLayout){onLayoutChange?.(next);return;}
  setLayout(next);
  try{setStatus(writeDashboardLayoutV723(window.localStorage,account,next)?'Layout automatisch gespeichert.':'Speichern nicht möglich. Layout gilt nur bis zum Neuladen.');}catch{setStatus('Browserspeicher nicht verfügbar. Layout gilt nur bis zum Neuladen.');}
 }
 function restore(){
  if(controlledLayout){onRestorePreset?.();setStatus('Aktuelles Preset-Layout zurückgesetzt.');return;}
  const fresh=defaultDashboardLayoutV723();setLayout(fresh);
  try{setStatus(clearDashboardLayoutV723(window.localStorage,account)?'Standardlayout wiederhergestellt.':'Zurückgesetzt, aber der Browserspeicher konnte nicht geändert werden.');}catch{setStatus('Standardansicht geladen, aber Browserspeicher nicht verfügbar.');}
 }
 function startDrag(event:{dataTransfer:{setData:(type:string,data:string)=>void;effectAllowed:string}},id:V723WidgetId){
  setDragging(id);event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',id);
 }
 function drop(event:{preventDefault:()=>void;dataTransfer:{getData:(type:string)=>string}},target:V723WidgetId){
  event.preventDefault();const source=event.dataTransfer.getData('text/plain');setDragging(null);
  if(!editing||!V723_WIDGET_IDS.some(id=>id===source))return;
  apply(reorderDashboardWidgetV723(layout,source as V723WidgetId,target));
 }
 const visible=layout.filter(widget=>widget.enabled);
 return <section className="lastfm-studio-v723" aria-label="Personal Dashboard Studio">
  <div className="lastfm-studio-top-v723">
   <div><span>V723 · PERSONAL DASHBOARD STUDIO</span><p>Wähle selbst, welche Kacheln sichtbar sind und wie sie angeordnet werden.</p></div>
   <button type="button" aria-expanded={editing} aria-controls="lastfm-studio-editor-v723" onClick={()=>setEditing(value=>!value)}>{editing?'Bearbeitung schließen':'Dashboard anpassen'}</button>
  </div>
  {editing&&<div id="lastfm-studio-editor-v723" className="lastfm-studio-editor-v723">
   <p>Per Maus ziehen oder über die Pfeile verschieben. Die Pfeile funktionieren auch per Touch und Tastatur. „Breit“ belegt beide Spalten.</p>
   <div className="lastfm-studio-options-v723" role="group" aria-label="Sichtbare Dashboard-Kacheln">
    {layout.map(w=><label key={w.id}><input type="checkbox" checked={w.enabled} disabled={w.enabled&&visible.length===1} onChange={()=>apply(toggleDashboardWidgetV723(layout,w.id))}/><span>{V723_WIDGET_TITLES[w.id]}</span></label>)}
   </div>
   <button type="button" onClick={restore}>Standardlayout wiederherstellen</button>
  </div>}
  {status&&<p className="lastfm-studio-message-v723" role="status">{status}</p>}
  <div className="lastfm-studio-grid-v723" aria-label="Anpassbare Dashboard-Ansicht">
   {visible.map((widget,index)=><div key={widget.id} className={`lastfm-studio-widget-v723 size-${widget.size}${dragging===widget.id?' is-dragging':''}`}
    draggable={editing}
    onDragStart={(event:{dataTransfer:{setData:(type:string,data:string)=>void;effectAllowed:string}})=>{if(editing)startDrag(event,widget.id);}}
    onDragOver={(event:{preventDefault:()=>void})=>{if(editing)event.preventDefault();}}
    onDrop={(event:{preventDefault:()=>void;dataTransfer:{getData:(type:string)=>string}})=>drop(event,widget.id)} onDragEnd={()=>setDragging(null)}>
    {editing&&<div className="lastfm-studio-handle-v723"><strong>{V723_WIDGET_TITLES[widget.id]}</strong><div>
     <button type="button" aria-label={`${V723_WIDGET_TITLES[widget.id]} nach oben`} disabled={index===0} onClick={()=>{const previous=visible[index-1];if(previous)apply(reorderDashboardWidgetV723(layout,widget.id,previous.id));}}>↑</button>
     <button type="button" aria-label={`${V723_WIDGET_TITLES[widget.id]} nach unten`} disabled={index===visible.length-1} onClick={()=>{
      const nextVisible=visible[index+1];if(nextVisible)apply(reorderDashboardWidgetV723(layout,widget.id,nextVisible.id));
     }}>↓</button>
     <button type="button" aria-label={`${V723_WIDGET_TITLES[widget.id]} ${widget.size==='half'?'breit':'halb'} anzeigen`} onClick={()=>apply(resizeDashboardWidgetV723(layout,widget.id))}>{widget.size==='half'?'↔ Breit':'½ Halb'}</button>
     <button type="button" aria-label={`${V723_WIDGET_TITLES[widget.id]} ausblenden`} disabled={visible.length<=1} onClick={()=>apply(toggleDashboardWidgetV723(layout,widget.id))}>Ausblenden</button>
    </div></div>}
    {widgets[widget.id]}
   </div>)}
  </div>
  <p className="lastfm-studio-note-v723">Die Anordnung wird nur im Browser für dieses Last.fm-Konto gespeichert – keine Cloud-Synchronisierung. Importierte Hörhistorie und Spotify-Scrobbling bleiben unverändert.</p>
 </section>;
}
