"use client";
/** V763: visual layering over the existing, ACTUALLY PLAYED V354 authored lanes.
 * No parallel camera/light renderer and no automatic write to user's manual show. */
import {useEffect,useState} from 'react';
import {CONCERT_TIMELINE_EVENT_V763,getConcertTimelineV763,canEditConcertTimelineV763,
 type ConcertTimelineSnapshotV763} from './concertTimelineBridgeV763';
import {SHOW_TIMELINE_EVENT_V354,readTimelineV354,saveTimelineV354,addTimelineClipV354,
 updateTimelineClipV354,deleteTimelineClipV354,evaluateTimelineV354,DEFAULT_TIMELINE_V354,
 type ShowTimelineV354,type ShowLaneV354,type ShowValueV354} from '../../services/stageContent/showTimelineV354';
const lanes:readonly ShowLaneV354[]=['camera','lighting','dance','effects','lyrics','photos'];
const names:Record<ShowLaneV354,string>={camera:'Kamera',lighting:'Licht',dance:'Tanz & Formation',effects:'Showeffekte',lyrics:'Lyrics',photos:'Fotos'};
const palette:Record<ShowLaneV354,string>={camera:'#5bc5f9',lighting:'#f9be55',dance:'#dca7fc',effects:'#ec729b',lyrics:'#8fe1b8',photos:'#bfbad7'};
const values:Record<'camera'|'dance'|'lyrics',readonly [string,string][]>= {
 camera:[['wide','Weitwinkel'],['medium','Halbtotale'],['close','Nahaufnahme'],['orbit','Orbit']],
 dance:[['solo','Solo'],['sync','Synchron'],['mirror','Spiegel'],['duet','Duett']],
 lyrics:[['focus','Lyrics hervorheben'],['normal','Normal']]
};
const bound=(x:number,lower:number,upper:number)=>Math.max(lower,Math.min(upper,x));
const time=(n:number)=>`${Math.floor(n/60000)}:${String(Math.floor(n/1000)%60).padStart(2,'0')}`;
const BAR={position:'relative' as const,height:25,background:'#1b2636',borderRadius:5,overflow:'hidden' as const,margin:'4px 0 12px'};
export function InteractiveConcertTimelineStudioV763(){
 const [snapshot,setSnapshot]=useState<ConcertTimelineSnapshotV763|null>(getConcertTimelineV763);
 const [score,setScore]=useState<ShowTimelineV354>(readTimelineV354);
 const [playhead,setPlayhead]=useState<number|null>(null);
 const [selected,setSelected]=useState('');
 const [confirmReplacement,setConfirmReplacement]=useState(false);
 const [message,setMessage]=useState('');
 useEffect(()=>{const sync=()=>setSnapshot(getConcertTimelineV763());sync();
  window.addEventListener(CONCERT_TIMELINE_EVENT_V763,sync);
  return ()=>window.removeEventListener(CONCERT_TIMELINE_EVENT_V763,sync);},[]);
 useEffect(()=>{const sync=()=>setScore(readTimelineV354());window.addEventListener(SHOW_TIMELINE_EVENT_V354,sync);
  return ()=>window.removeEventListener(SHOW_TIMELINE_EVENT_V354,sync);},[]);
 useEffect(()=>{setPlayhead(null);setSelected('');setConfirmReplacement(false);},[snapshot?.trackId]);
 const editable=canEditConcertTimelineV763(score,snapshot);
 const duration=snapshot?.durationMs??0;
 const now=playhead??snapshot?.progressMs??0;
 const clip=editable?score.clips.find(c=>c.id===selected):undefined;
 const update=(s:ShowTimelineV354)=>setScore(saveTimelineV354(s));
 const start=()=>{
  if(!snapshot||!snapshot.trackId)return;
  if(score.clips.length>0&&!confirmReplacement){setConfirmReplacement(true);setMessage('Bestehende V354-Show enthält Clips. Vor dem Ersetzen bitte im bisherigen V354-Editor als JSON exportieren. Danach erneut bestätigen.');return;}
  update({...DEFAULT_TIMELINE_V354,name:'Konzertregie',trackId:snapshot.trackId,durationMs:snapshot.durationMs,enabled:false,clips:[]});
  setSelected('');setConfirmReplacement(false);setMessage('Songgebundene Timeline angelegt – zunächst deaktiviert.');
 };
 const exportExisting=()=>{
  const blob=new Blob([JSON.stringify(score,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='sonic-show-before-v763.json';link.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const add=(lane:ShowLaneV354)=>{
  if(!editable)return;
  const at=bound(Math.round(now),0,Math.max(0,duration-250));
  const next=addTimelineClipV354(score,lane,at);
  if(next.clips.length===score.clips.length){setMessage('Maximal 400 Clips möglich.');return;}
  const created=next.clips.find(c=>!score.clips.some(previous=>previous.id===c.id));
  update(next);if(created)setSelected(created.id);
 };
 const changeClip=(patch:{startMs?:number;durationMs?:number;value?:ShowValueV354;label?:string})=>{
  if(clip)update(updateTimelineClipV354(score,clip.id,patch));
 };
 const preview=editable?evaluateTimelineV354({...score,enabled:true},
  {progressMs:now,trackId:snapshot?.trackId,playing:true,reducedMotion:false,lyricsActive:true}):null;
 return <fieldset className="concert-timeline-studio-v763"><legend>V763 · Interactive Concert Timeline Studio</legend>
  <p>Automatische V761-Szenen und manuelle V354-Cues auf einer gemeinsamen Zeitleiste. Nur gespeicherte manuelle Cues werden wirklich abgespielt.</p>
  {!snapshot?<p role="status">Kein laufendes Sonic-Display-Bühnenmodell vorhanden. Öffne die Musikansicht mit einem Song, damit die echte Song-ID und Dauer bekannt sind.</p>:<>
   <p role="status">Song: <code>{snapshot.trackId}</code> · {time(duration)} · {snapshot.playing?'Wiedergabe':'Pausiert'} ·
    {snapshot.source==='verified-v604'?' V761-Szenenplan bestätigt':' Kein verifizierter V761-Szenenplan – nur manuelle Cues möglich'}</p>
   <label>Vorschauposition: {time(now)} / {time(duration)}
    <input type="range" min="0" max={duration} step="250" value={now} onChange={(e:{target:{value:string;checked:boolean}})=>setPlayhead(Number(e.target.value))}/>
   </label>
   <button type="button" onClick={()=>setPlayhead(null)}>Zur Live-Position zurück</button>
   <div><strong>Automatische Szenen (schreibgeschützte Vorschau)</strong>
    <div style={BAR} aria-label="Bestätigter V761-Szenenplan">
     {snapshot.scenes.map(s=><div key={s.index} title={`${s.section}: ${s.intent} · ${time(s.startMs)}–${time(s.endMs)}`}
      style={{position:'absolute',left:`${s.startMs/duration*100}%`,width:`${(s.endMs-s.startMs)/duration*100}%`,top:2,bottom:2,
       background:['#52728e','#8554a1','#397776','#8b693a'][s.actIndex%4],border:'1px solid #33475e',boxSizing:'border-box',fontSize:11,overflow:'hidden',whiteSpace:'nowrap'}}>
       {(s.endMs-s.startMs)>duration*.06?s.intent:''}</div>)}
     <div style={{position:'absolute',left:`${now/duration*100}%`,top:0,bottom:0,width:2,background:'#fff',pointerEvents:'none'}}/>
    </div>
   </div>
   {!editable?<div><p>Die gespeicherte V354-Timeline ist {score.clips.length?'bereits belegt':'noch nicht an diesen Song gebunden'}. Es werden keine Daten automatisch überschrieben.</p>
    <button type="button" onClick={start}>{score.clips.length?'Vorhandene Show ersetzen (Bestätigung nötig)':'Songgebundene Timeline anlegen'}</button>
    {score.clips.length>0&&<button type="button" onClick={exportExisting}>Bestehende Show als JSON sichern</button>}
    {confirmReplacement&&<button type="button" onClick={start}>Ja, bisherige V354-Show endgültig ersetzen</button>}
    {message&&<p role="status">{message}</p>}
   </div>:<>
    <label><input type="checkbox" checked={score.enabled} onChange={(e:{target:{value:string;checked:boolean}})=>update({...score,enabled:e.target.checked})}/>
     Manuelle Cues für diesen Song aktivieren</label>
    <p>Manuelle Cues wirken in den bestehenden V354-Kamera-, Licht-, Tanz-, FX-, Foto- und Lyrics-Pfaden. Die Vorschau verändert die Spotify-Wiedergabeposition nicht.</p>
    {lanes.map(lane=><div key={lane}>
     <div style={{display:'flex',gap:9,justifyContent:'space-between',alignItems:'baseline'}}>
      <strong>{names[lane]}</strong><button type="button" onClick={()=>add(lane)}>Cue bei {time(now)} hinzufügen</button>
     </div>
     <div style={BAR} role="group" aria-label={`${names[lane]} – manuelle Clips`}>
      {score.clips.filter(c=>c.lane===lane).map(c=><button type="button" key={c.id} title={`${c.label}: ${time(c.startMs)}–${time(c.startMs+c.durationMs)}`}
       aria-label={`${names[lane]}: ${c.label} bearbeiten`} onClick={()=>setSelected(c.id)}
       style={{position:'absolute',top:2,bottom:2,left:`${c.startMs/duration*100}%`,width:`${c.durationMs/duration*100}%`,
        minWidth:5,background:palette[lane],border:selected===c.id?'2px solid white':'1px solid #24354a',
        color:'#121b2b',fontSize:10,padding:0,overflow:'hidden'}}>{c.durationMs>duration*.065?c.label:''}</button>)}
      <div style={{position:'absolute',top:0,bottom:0,left:`${now/duration*100}%`,width:2,background:'#fff',pointerEvents:'none'}}/>
     </div>
    </div>)}
    {clip&&<fieldset><legend>{names[clip.lane]} · ausgewählter manueller Cue</legend>
     <label>Bezeichnung<input value={clip.label} maxLength={60} onChange={(e:{target:{value:string;checked:boolean}})=>changeClip({label:e.target.value})}/></label>
     <label>Beginn in Sekunden<input type="number" min="0" max={(duration-1)/1000} step="0.25" value={clip.startMs/1000}
      onChange={(e:{target:{value:string;checked:boolean}})=>{const n=Number(e.target.value);if(Number.isFinite(n))changeClip({startMs:Math.round(bound(n*1000,0,duration-1))});}}/></label>
     <label>Dauer in Sekunden<input type="number" min="0.25" max={duration/1000} step="0.25" value={clip.durationMs/1000}
      onChange={(e:{target:{value:string;checked:boolean}})=>{const n=Number(e.target.value);if(Number.isFinite(n))changeClip({durationMs:Math.round(bound(n*1000,250,duration))});}}/></label>
     {clip.lane==='camera'||clip.lane==='dance'||clip.lane==='lyrics'?<label>Aktion
      <select value={String(clip.value)} onChange={(e:{target:{value:string;checked:boolean}})=>changeClip({value:e.target.value})}>
       {values[clip.lane].map(([v,name])=><option value={v} key={v}>{name}</option>)}
      </select></label>:<label>{clip.lane==='lighting'?'Lichtfaktor':clip.lane==='effects'?'FX-Faktor':'Foto-Deckkraft'}
       <input type="range" min={clip.lane==='lighting'?.25:0} max={clip.lane==='photos'?1:1.8} step="0.05"
        value={Number(clip.value)} onChange={(e:{target:{value:string;checked:boolean}})=>changeClip({value:Number(e.target.value)})}/>
       {Number(clip.value).toFixed(2)}
      </label>}
     <button type="button" onClick={()=>{update(deleteTimelineClipV354(score,clip.id));setSelected('');}}>Cue löschen</button>
    </fieldset>}
    <p>Vorschau bei {time(now)}: {preview?.active?preview.activeLanes.map(x=>names[x]).join(' · '):'Kein manueller Cue aktiv'}.
     {score.enabled?' Live-Song-Cues eingeschaltet.':' Live-Song-Cues sind ausgeschaltet.'}</p>
   </>}
  </>}
  <small>V761 ist eine verifizierte Planvorschau, kein automatischer Clip-Import. V354 speichert lokal nur eine Show gleichzeitig: vor einem Songwechsel vorhandene Show als JSON sichern. Manuelle Sänger-Zeitmarken und GLB-Clips werden hier nicht geändert. Keine neuen Kameras, Lampen oder Renderpässe.</small>
 </fieldset>;
}
