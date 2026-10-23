 'use client';
import {useEffect,useMemo,useState} from 'react';
import {MOTION_SYNC_DEFAULT_V328,readMotionSyncV328,writeMotionSyncV328,phaseForClipV328,type MotionSyncV328} from './groupMotionSynchronizationV328';
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
const names=['Lead','Partner','Tänzer 3','Tänzer 4'];
export function GroupMotionSyncControlsV328({seconds,count,bpm,analysis,playing,songSync}:{seconds:number;count:3|4;bpm:number;analysis:TrackAnalysisV318|null;playing:boolean;songSync:boolean}){
 const [settings,setSettings]=useState<MotionSyncV328>(MOTION_SYNC_DEFAULT_V328);
 useEffect(()=>setSettings(readMotionSyncV328()),[]);
 const put=(patch:Partial<MotionSyncV328>)=>setSettings(writeMotionSyncV328({...settings,...patch}));
 const beats=useMemo(()=>songSync?analysis?.beats.map(b=>b.startMs/1000):undefined,[analysis,songSync]);
 const rows=Array.from({length:count},(_,slot)=>phaseForClipV328(settings,{enabled:true,seconds,slot,bpm:analysis?.tempo??bpm,beatTimes:beats,playing:true,reducedMotion:false},4));
 return <fieldset className="group-motion-sync-v328"><legend>Advanced Motion Synchronization Studio · V328</legend>
  <p>Gemeinsame Clip-Phase für drei bis vier echte GLB-Animationsmixer. Die importierten Keyframes bleiben unverändert. Dieses Studio greift nicht in manuelle Timelines, Loop-Presets oder Animation-Layer ein.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>put({enabled:e.target.checked})}/> GLB-Clip-Synchronisierung live aktivieren</label>
  <div className="ensemble-studio-v325-controls">
   <label>Zyklus (Beats) <select value={settings.beatCycle} onChange={e=>put({beatCycle:Number(e.target.value) as MotionSyncV328['beatCycle']})}>{[1,2,4,8,16].map(n=><option value={n} key={n}>{n}</option>)}</select></label>
   <label>Uhr-Modus <select value={settings.mode} onChange={e=>put({mode:e.target.value as MotionSyncV328['mode']})}><option value="cycle">Musikalische Clip-Zyklusphase</option><option value="absolute">Echtzeit + Beat-Versatz</option></select></label>
   <label>Startposition (Sekunden) <input type="number" value={settings.phaseOrigin} min="0" max="3600" step=".25" onChange={e=>put({phaseOrigin:Number(e.target.value)})}/></label>
  </div>
  <div className="group-dance-sync-v327-meters" aria-label="V328 individuelle GLB-Clip-Phasen">
   {rows.map((r,i)=><div className="group-dance-sync-v327-meter" key={i}>
    <label>{names[i]} – Phasenversatz ({settings.phaseOffsets[i].toFixed(2)} Beats)
     <input type="range" min="-8" max="8" step=".25" value={settings.phaseOffsets[i]} onChange={e=>put({phaseOffsets:settings.phaseOffsets.map((n,j)=>i===j?Number(e.target.value):n)})}/>
    </label>
    <label>Clip-Index <input type="number" min="-1" max="63" step="1" value={settings.clipIndexes[i]} onChange={e=>put({clipIndexes:settings.clipIndexes.map((n,j)=>i===j?Number(e.target.value):n)})}/></label>
    <div aria-hidden="true"><span style={{width:`${Math.round((r?.fraction??0)*100)}%`}}/></div>
    <small>{r?`${Math.round(r.fraction*100)} % · ${r.source==='imported'?'Song-Beats':'BPM'}`:'Clip ohne aktive Zeitsteuerung'}</small>
   </div>)}
  </div>
  <small>Clip-Index −1 bedeutet automatisch ausgewählter Clip. Ab 0 wird ein vorhandener Clip dieser Avatar-Instanz nach Index verwendet; ein ungültiger Index fällt auf die normale Auswahl zurück. Der Modus „Zyklus“ ordnet einen Clip unabhängig von seiner ursprünglichen Dauer einem gemeinsamen musikalischen Zyklus zu; schnellere/langsamere Bewegungen sind möglich. In „Echtzeit“ bleibt die Clip-Geschwindigkeit normal. Importierte V318-Beatmarker gelten nur bei aktivierter Songbindung. In Pause werden neue Zeitpositionen nicht erzwungen. Ohne GLB-Animationsclip gibt es nichts zu synchronisieren.</small>
  <button type="button" onClick={()=>setSettings(writeMotionSyncV328(MOTION_SYNC_DEFAULT_V328))}>V328 zurücksetzen</button>
 </fieldset>;
}
