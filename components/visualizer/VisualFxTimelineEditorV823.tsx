"use client";
import {useEffect,useState} from 'react';
import {getLightingPlayback} from './lightingPlayback';
import type {ConcertFxSettingsV810} from './concertFxStudioV810';
import {FX_TIMELINE_LANES_V823,normalizeFxTimelineV823,evaluateFxTimelineV823} from './visualFxTimelineV823';
import type {FxTimelineCueV823,FxTimelineLaneV823,FxTimelineModeV823,FxTimelineLedLookV823} from './visualFxTimelineV823';
const labels:Record<FxTimelineLaneV823,string>={laser:'Laser',led:'LED-Wand',particles:'Partikel',foam:'Schaumkanone',transition:'Lichtübergänge'};
const lookLabels:Record<FxTimelineLedLookV823,string>={auto:'Automatisch',equalizer:'Equalizer',geometry:'Geometrie',waves:'Wellen',tunnel:'Tunnel'};
const sec=(ms:number)=>(ms/1000).toFixed(ms%1000?1:0);
export function VisualFxTimelineEditorV823({value,onChange}:{value:ConcertFxSettingsV810;onChange:(next:ConcertFxSettingsV810)=>void}){
 const [live,setLive]=useState({trackId:'',durationMs:0,positionMs:0,playing:false});
 const [trackId,setTrackId]=useState('');const [durationSec,setDurationSec]=useState(210);
 const [cursorSec,setCursorSec]=useState(30);
 const [lane,setLane]=useState<FxTimelineLaneV823>('led');
 const [mode,setMode]=useState<FxTimelineModeV823>('boost');
 const [selection,setSelection]=useState('');
 useEffect(()=>{
  const update=()=>{const p=getLightingPlayback();setLive({trackId:p.trackId,durationMs:p.durationMs,positionMs:p.positionMs,playing:p.playing});};
  update();const timer=window.setInterval(update,1000);return ()=>window.clearInterval(timer);
 },[]);
 const cues=normalizeFxTimelineV823(value.timelineCuesV823);
 const filtered=cues.filter(c=>c.trackId===trackId);
 const duration=Math.max(1,Math.min(21600,Number.isFinite(durationSec)?durationSec:210));
 const selected=filtered.find(c=>c.id===selection);
 const save=(list:FxTimelineCueV823[])=>onChange({...value,timelineCuesV823:normalizeFxTimelineV823(list)});
 const edit=(id:string,changes:Partial<FxTimelineCueV823>)=>save(cues.map(c=>c.trackId===trackId&&c.id===id?{...c,...changes}:c));
 const add=()=>{
  if(!trackId||filtered.length>=48||cues.length>=200)return;
  const id='cue'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  save([...cues,{id,trackId,startMs:Math.round(Math.max(0,cursorSec)*1000),durationMs:3000,lane,mode,intensity:70,ledLook:'auto'}]);
  setSelection(id);
 };
 const preview=evaluateFxTimelineV823({cues,enabled:value.timelineEnabledV823,trackId,durationMs:duration*1000,
  progressMs:cursorSec*1000,verified:true,playing:true,reducedMotion:false});
 return <fieldset style={{border:'1px solid #656b80',borderRadius:10,padding:12}}>
  <legend>V823 · Visual FX Timeline Editor</legend>
  <label className="setting-check"><input type="checkbox" checked={value.timelineEnabledV823}
   onChange={e=>onChange({...value,timelineEnabledV823:e.target.checked})}/> Songbezogene FX-Cues aktivieren</label>
  <p style={{fontSize:12,opacity:.85}}>Bearbeitete Zeitfenster verstärken oder dämpfen nur bereits freigegebene Effekte. Blackouts, manuelle Lichtregie, Lyrics-Schutz und Gerätegrenzen haben Vorrang. Lichtübergänge benötigen weiterhin einen bestätigten V791-Szenenwechsel.</p>
  {live.trackId&&<button type="button" onClick={()=>{setTrackId(live.trackId);setDurationSec(Math.max(1,Math.ceil(live.durationMs/1000)));setCursorSec(Math.max(0,Math.floor(live.positionMs/1000)));setSelection('');}}>
   Aktuellen Song übernehmen ({live.playing?'spielt':'pausiert'} · {sec(live.positionMs)}/{sec(live.durationMs)} s)</button>}
  <div style={{display:'flex',flexWrap:'wrap',gap:10,margin:'10px 0'}}>
   <label>Spotify-Track-ID <input aria-label="FX-Track-ID" style={{maxWidth:240}} value={trackId} placeholder="Track-ID auswählen oder eingeben" onChange={e=>{setTrackId(e.target.value.replace(/[^a-zA-Z0-9_:-]/g,'').slice(0,128));setSelection('');}}/></label>
   <label>Songlänge (s) <input type="number" min="1" max="21600" value={durationSec} style={{width:90}} onChange={e=>setDurationSec(Math.max(1,Math.min(21600,Number(e.target.value)||1)))}/></label>
  </div>
  <div style={{fontSize:12,marginBottom:8}}>Cursor: {sec(cursorSec*1000)} s · {filtered.length}/48 Cues für diesen Song ({cues.length}/200 insgesamt)</div>
  <input aria-label="FX-Timeline-Cursor" type="range" min="0" max={duration} step="0.1" value={Math.min(duration,cursorSec)} style={{width:'100%'}} onChange={e=>setCursorSec(Number(e.target.value))}/>
  <div aria-label="FX-Spuren" style={{display:'grid',gap:5,marginTop:8}}>
   {FX_TIMELINE_LANES_V823.map(l=><div key={l} style={{display:'grid',gridTemplateColumns:'94px minmax(0, 1fr)',alignItems:'center',gap:7}}>
    <span style={{fontSize:12}}>{labels[l]}</span>
    <div style={{height:29,position:'relative',background:'linear-gradient(90deg,#1c2537,#141b2a)',borderRadius:5,border:'1px solid #47516a',overflow:'hidden'}}>
     <span style={{position:'absolute',zIndex:2,left:`${Math.min(100,cursorSec/duration*100)}%`,width:1,height:'100%',background:'#fff',pointerEvents:'none'}}/>
     {filtered.filter(c=>c.lane===l).map(c=><button type="button" key={c.id} title={`${labels[l]} · ${sec(c.startMs)}–${sec(c.startMs+c.durationMs)} s · ${c.mode}`}
      onClick={()=>{setSelection(c.id);setCursorSec(c.startMs/1000)}}
      style={{position:'absolute',top:4,bottom:4,left:`${Math.min(99.5,c.startMs/(duration*1000)*100)}%`,
       width:`${Math.max(.7,Math.min(100-c.startMs/(duration*1000)*100,c.durationMs/(duration*1000)*100))}%`,
       background:c.mode==='mute'?'#b65766':'#41a7d8',border:c.id===selection?'2px solid #fff':'1px solid #c5d7e0',borderRadius:3,cursor:'pointer',padding:0,minWidth:3}}/>) }
    </div>
   </div>)}
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:9,alignItems:'end',marginTop:12}}>
   <label>Effekt<select value={lane} onChange={e=>setLane(e.target.value as FxTimelineLaneV823)}>{FX_TIMELINE_LANES_V823.map(l=><option key={l} value={l}>{labels[l]}</option>)}</select></label>
   <label>Modus<select value={mode} onChange={e=>setMode(e.target.value as FxTimelineModeV823)}><option value="boost">Verstärken</option><option value="mute">Dämpfen</option></select></label>
   <button type="button" disabled={!trackId||filtered.length>=48||cues.length>=200} onClick={add}>Cue bei Cursor hinzufügen</button>
  </div>
  {selected&&<div style={{marginTop:12,padding:9,borderRadius:8,border:'1px solid #596075'}}>
   <strong>Ausgewählter Cue</strong>
   <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:7}}>
    <label>Spur<select value={selected.lane} onChange={e=>edit(selected.id,{lane:e.target.value as FxTimelineLaneV823})}>{FX_TIMELINE_LANES_V823.map(l=><option value={l} key={l}>{labels[l]}</option>)}</select></label>
    <label>Modus<select value={selected.mode} onChange={e=>edit(selected.id,{mode:e.target.value as FxTimelineModeV823})}><option value="boost">Verstärken</option><option value="mute">Dämpfen</option></select></label>
    <label>Start (s)<input type="number" min="0" max="21600" step="0.1" style={{width:90}} value={sec(selected.startMs)} onChange={e=>edit(selected.id,{startMs:Math.round((Number(e.target.value)||0)*1000)})}/></label>
    <label>Dauer (s)<input type="number" min="0.25" max="600" step="0.25" style={{width:90}} value={sec(selected.durationMs)} onChange={e=>edit(selected.id,{durationMs:Math.round((Number(e.target.value)||.25)*1000)})}/></label>
    <label>Stärke (%)<input type="number" min="0" max="100" step="5" style={{width:76}} value={selected.intensity} onChange={e=>edit(selected.id,{intensity:Number(e.target.value)})}/></label>
    {selected.lane==='led'&&selected.mode==='boost'&&<label>LED-Muster<select value={selected.ledLook} onChange={e=>edit(selected.id,{ledLook:e.target.value as FxTimelineLedLookV823})}>{Object.entries(lookLabels).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></label>}
    <button type="button" onClick={()=>{save(cues.filter(c=>!(c.trackId===trackId&&c.id===selected.id)));setSelection('')}}>Cue löschen</button>
   </div></div>}
  <small>Simulierte Cursor-Vorschau: {FX_TIMELINE_LANES_V823.map(l=>`${labels[l]} +${Math.round(preview[l].boost*100)} % / −${Math.round(preview[l].mute*100)} %`).join(' · ')}. Keine Wiedergabe-Steuerung; Einstellungen werden über die reguläre Sicherung exportiert.</small>
 </fieldset>;
}
