'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {SHOW_TIMELINE_EVENT_V354,SHOW_LANES_V354,DEFAULT_TIMELINE_V354,readTimelineV354,saveTimelineV354,
 sanitizeTimelineV354,evaluateTimelineV354,addTimelineClipV354,updateTimelineClipV354,deleteTimelineClipV354,
 type ShowLaneV354,type ShowClipV354,type ShowTimelineV354} from '@/services/stageContent/showTimelineV354';
const names:Record<ShowLaneV354,string>={dance:'Tanz / Formation',camera:'Kamera',lighting:'Licht',effects:'Visual FX',photos:'Fotos',lyrics:'Lyrics'};
const fixed=(v:number)=>Number((v/1000).toFixed(2));
const valueOptions:Partial<Record<ShowLaneV354,{value:string;label:string}[]>>={
 dance:[{value:'solo',label:'Solo'},{value:'sync',label:'Synchron'},{value:'mirror',label:'Spiegel'},{value:'duet',label:'Duett'}],
 camera:[{value:'wide',label:'Weit'},{value:'medium',label:'Halbtotal'},{value:'close',label:'Nah'},{value:'orbit',label:'Orbit'}],
 lyrics:[{value:'focus',label:'Lyrics priorisieren'},{value:'normal',label:'Normal'}],
};
export function ShowTimelineEditorV354(){
 const [score,setScore]=useState(readTimelineV354);
 const [selected,setSelected]=useState('');
 const [playhead,setPlayhead]=useState(0);
 const [previewPlaying,setPreviewPlaying]=useState(true);
 const [notice,setNotice]=useState('');
 const importer=useRef<HTMLInputElement>(null);
 const dragging=useRef<{id:string;originX:number;startMs:number;width:number;latestMs:number;moved:boolean}|null>(null);
 const ignoreClick=useRef(false);
 useEffect(()=>{const update=()=>setScore(readTimelineV354());window.addEventListener(SHOW_TIMELINE_EVENT_V354,update);return()=>window.removeEventListener(SHOW_TIMELINE_EVENT_V354,update);},[]);
 const apply=(value:ShowTimelineV354)=>setScore(saveTimelineV354(value));
 const clip=score.clips.find(c=>c.id===selected);
 const setClip=(patch:Partial<ShowClipV354>)=>{if(clip)apply(updateTimelineClipV354(score,clip.id,patch));};
 const cue=evaluateTimelineV354({...score,enabled:true,trackId:''},{progressMs:playhead,playing:previewPlaying,reducedMotion:false,lyricsActive:true});
 const add=(lane:ShowLaneV354)=>{
  const next=addTimelineClipV354(score,lane,playhead);
  if(next.clips.length===score.clips.length){setNotice('Maximal 400 Clips möglich.');return;}
  apply(next);setSelected(next.clips[next.clips.length-1].id);
 };
 const download=()=>{
  const json=JSON.stringify(sanitizeTimelineV354(score),null,2);
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-display-show-v354.json';anchor.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const load=async(file?:File)=>{
  if(!file)return;if(file.size>1024*1024){setNotice('Show-Datei ist zu groß (maximal 1 MB).');return;}
  try{const parsed:unknown=JSON.parse(await file.text());
   if(!parsed||typeof parsed!=='object'||(parsed as {version?:unknown}).version!==1||!Array.isArray((parsed as {clips?:unknown}).clips))throw new Error('format');
   apply({...sanitizeTimelineV354(parsed),enabled:false});setSelected('');setPlayhead(0);setNotice('Show importiert und sicherheitshalber deaktiviert.');
  }catch{setNotice('Die JSON-Datei ist kein gültiges V354-Showformat.');}
 };
 return <fieldset className="sonic-show-editor-v354"><legend>V354 – Show Timeline Editor</legend>
  <p>Songbasierter Mehrspur-Editor für Bühne, Kamera, Tanz, Fotos, Lyrics und Effekte. Clips lassen sich ziehen oder über Zeitfelder exakt positionieren. Die Show verändert die Live-Bühne erst nach dem Aktivieren und nur mit gültiger Spotify-Songposition.</p>
  <div className="sonic-show-toolbar-v354">
   <label><input type="checkbox" checked={score.enabled} onChange={e=>apply({...score,enabled:e.target.checked})}/> Show live aktivieren</label>
   <label>Show-Name <input maxLength={60} value={score.name} onChange={e=>apply({...score,name:e.target.value})}/></label>
   <label>Länge in Sekunden <input type="number" min={10} max={1800} value={Math.round(score.durationMs/1000)} onChange={e=>{const d=Math.max(10,Math.min(1800,Number(e.target.value)||180));apply({...score,durationMs:d*1000});setPlayhead(v=>Math.min(v,d*1000-1));}}/></label>
   <label>Track-ID (optional) <input maxLength={160} value={score.trackId} onChange={e=>apply({...score,trackId:e.target.value})} placeholder="leer: für alle Songs"/></label>
  </div>
  <div className="sonic-show-preview-v354">
   <label>Abspielposition {fixed(playhead)} s <input type="range" min={0} max={score.durationMs-1} step={100} value={Math.min(playhead,score.durationMs-1)} onChange={e=>setPlayhead(Number(e.target.value))}/></label>
   <button type="button" onClick={()=>setPreviewPlaying(v=>!v)}>{previewPlaying?'Vorschau pausieren':'Vorschau starten'}</button>
  </div>
  <div className="sonic-show-lanes-v354" role="group" aria-label="Sechs Show-Timeline-Spuren">
   {SHOW_LANES_V354.map(lane=><div className="sonic-show-lane-v354" key={lane}>
    <div className="sonic-show-lane-head-v354"><strong>{names[lane]}</strong><button type="button" onClick={()=>add(lane)} aria-label={`${names[lane]} Clip hinzufügen`}>+ Clip</button></div>
    <div className="sonic-show-track-v354" onClick={e=>{if(e.target===e.currentTarget){const rect=e.currentTarget.getBoundingClientRect();setPlayhead(Math.min(score.durationMs-1,Math.round(Math.max(0,Math.min(1,(e.clientX-rect.left)/Math.max(1,rect.width)))*score.durationMs)));}}}>
     {score.clips.filter(c=>c.lane===lane).map(c=><button key={c.id} type="button" className={`sonic-show-clip-v354 ${selected===c.id?'selected':''}`} style={{left:`${c.startMs/score.durationMs*100}%`,width:`${c.durationMs/score.durationMs*100}%`} as CSSProperties} title={`${c.label} · ${fixed(c.startMs)}–${fixed(c.startMs+c.durationMs)} s`} onPointerDown={e=>{const track=e.currentTarget.parentElement;if(!track)return;
      dragging.current={id:c.id,originX:e.clientX,startMs:c.startMs,width:track.getBoundingClientRect().width,latestMs:c.startMs,moved:false};
      e.currentTarget.setPointerCapture(e.pointerId);setSelected(c.id);}}
     onPointerMove={e=>{const d=dragging.current;if(!d||d.id!==c.id||!d.width)return;
      const delta=e.clientX-d.originX;if(Math.abs(delta)>4)d.moved=true;
      if(d.moved){d.latestMs=Math.max(0,Math.min(score.durationMs-c.durationMs,Math.round((d.startMs+delta/d.width*score.durationMs)/250)*250));setPlayhead(d.latestMs);}}}
     onPointerUp={e=>{const d=dragging.current;if(!d||d.id!==c.id)return;
      dragging.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
      if(d.moved){ignoreClick.current=true;apply(updateTimelineClipV354(score,c.id,{startMs:d.latestMs}));}}}
     onPointerCancel={()=>{dragging.current=null;}}
     onClick={()=>{if(ignoreClick.current){ignoreClick.current=false;return;}setSelected(c.id);setPlayhead(c.startMs)}}>{c.label}</button>)}
     <div className="sonic-show-playhead-v354" style={{left:`${playhead/score.durationMs*100}%`}} aria-hidden="true"/>
    </div>
   </div>)}
  </div>
  {clip&&<div className="sonic-show-clip-editor-v354"><h4>Clip bearbeiten: {names[clip.lane]}</h4><div className="sonic-show-toolbar-v354">
   <label>Bezeichnung <input value={clip.label} maxLength={60} onChange={e=>setClip({label:e.target.value})}/></label>
   <label>Start (s) <input type="number" min="0" step="0.25" max={fixed(score.durationMs)} value={fixed(clip.startMs)} onChange={e=>setClip({startMs:Math.round((Number(e.target.value)||0)*1000)})}/></label>
   <label>Dauer (s) <input type="number" min="0.25" step="0.25" max={fixed(score.durationMs)} value={fixed(clip.durationMs)} onChange={e=>setClip({durationMs:Math.round((Number(e.target.value)||.25)*1000)})}/></label>
   {valueOptions[clip.lane] ? <label>Aktion <select value={String(clip.value)} onChange={e=>setClip({value:e.target.value})}>{valueOptions[clip.lane]?.map(v=><option key={v.value} value={v.value}>{v.label}</option>)}</select></label>:
    <label>{clip.lane==='lighting'?'Lichtfaktor':clip.lane==='effects'?'Effektfaktor':'Foto-Deckkraft'} ({Number(clip.value).toFixed(2)}) <input type="range" min={clip.lane==='lighting'?'0.25':'0'} max={clip.lane==='photos'?'1':'1.8'} step="0.05" value={Number(clip.value)} onChange={e=>setClip({value:Number(e.target.value)})}/></label>}
  </div><button type="button" onClick={()=>{apply(deleteTimelineClipV354(score,clip.id));setSelected('');}}>Clip löschen</button></div>}
  <div className="sonic-show-preview-v354"><strong>Aktuelle Vorschau:</strong> {cue.activeLanes.length?cue.activeLanes.map(l=>names[l]).join(' · '):'Keine Clips an dieser Stelle'}
   <small>Kamera: {cue.cameraShot||'Automatik'} · Formation: {cue.danceFormation||'Automatik'} · Licht: {Math.round(cue.lightGain*100)} % · FX: {Math.round(cue.fxGain*100)} % · Fotos: {Math.round(cue.photoOpacity*100)} % · Lyrics-Fokus: {cue.lyricsFocus?'Ja':'Nein'}</small>
  </div>
  <div className="sonic-show-actions-v354">
   <button type="button" onClick={download}>Show als JSON exportieren</button>
   <button type="button" onClick={()=>importer.current?.click()}>Show aus JSON importieren</button>
   <input ref={importer} type="file" accept="application/json,.json" hidden onChange={e=>{void load(e.target.files?.[0]);e.target.value='';}} />
   <button type="button" onClick={()=>{apply(DEFAULT_TIMELINE_V354);setSelected('');setPlayhead(0);setNotice('Show zurückgesetzt.');}}>Show zurücksetzen</button>
   <span role="status">{notice}</span>
  </div>
  <small>Bewusst deaktivierte Foto-Leinwände, manuelle Kamerafahrten und bestehende Licht-Timelines werden nicht eingeschaltet oder ersetzt. Bei aktivierten Lyrics gelten die V351-Schutzgrenzen. Die Preview steuert nicht Spotify, sondern zeigt nur Timeline-Cues.</small>
 </fieldset>;
}
