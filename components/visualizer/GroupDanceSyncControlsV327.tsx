'use client';
import {useEffect,useMemo,useState} from 'react';
import {GROUP_SYNC_DEFAULT_V327,readGroupSyncV327,writeGroupSyncV327,evaluateGroupSyncV327,
 type GroupSyncV327} from './groupDanceSynchronizationV327';
import type {GroupPoseV326} from './multiAvatarStageDirectorV326';
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
const names=['Lead','Partner','Tänzer 3','Tänzer 4'];
export function GroupDanceSyncControlsV327({seconds,count,bpm,pose,analysis,playing,trackMatches}:{seconds:number;count:3|4;bpm:number;pose:GroupPoseV326|null;analysis:TrackAnalysisV318|null;playing:boolean;trackMatches:boolean}){
 const [settings,setSettings]=useState<GroupSyncV327>(GROUP_SYNC_DEFAULT_V327);
 useEffect(()=>{setSettings(readGroupSyncV327());},[]);
 const beatTimes=useMemo(()=>trackMatches?analysis?.beats.map(b=>b.startMs/1000):undefined,[analysis,trackMatches]);
 const result=evaluateGroupSyncV327(settings,{seconds,bpm:analysis?.tempo??bpm,count,focus:pose?.focus??-1,drop:pose?.drop??false,playing,reducedMotion:false,beatTimes,beatsPerBar:analysis?.timeSignature});
 const put=(patch:Partial<GroupSyncV327>)=>setSettings(writeGroupSyncV327({...settings,...patch}));
 return <fieldset className="group-dance-sync-v327"><legend>Intelligent Group Dance Synchronization · V327</legend>
  <p>Musikreaktive Zusatzbewegungen für alle {count} Tänzer koordinieren. Eingebettete oder importierte GLB-Clipzeiten, Retargeting und Fuß-IK bleiben unverändert.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>put({enabled:e.target.checked})}/> Gruppen-Rhythmusregie live aktivieren</label>
  <div className="ensemble-studio-v325-controls">
   <label>Tanzmuster <select value={settings.mode} onChange={e=>put({mode:e.target.value as GroupSyncV327['mode']})}>
    <option value="unison">Gemeinsam / Unison</option><option value="stagger">Versetzte Beats</option><option value="call-response">Call &amp; Response</option><option value="alternating">Abwechselnde Tänzer</option>
   </select></label>
   <label>Akzentstärke ({Math.round(settings.accentStrength*100)} %) <input type="range" min="0" max="1" step=".05" value={settings.accentStrength} onChange={e=>put({accentStrength:Number(e.target.value)})}/></label>
   {settings.mode==='stagger'&&<label>Versatz ({settings.staggerBeats.toFixed(2)} Beats) <input type="range" min="0" max=".75" step=".05" value={settings.staggerBeats} onChange={e=>put({staggerBeats:Number(e.target.value)})}/></label>}
   {settings.mode==='call-response'&&<label>Wechsel nach Takten <input type="number" min="1" max="8" value={settings.barsPerResponse} onChange={e=>put({barsPerResponse:Number(e.target.value)})}/></label>}
   {(settings.mode==='call-response'||settings.mode==='alternating')&&<label>Hintergrundbewegung ({Math.round(settings.softBackground*100)} %) <input type="range" min="0" max="1" step=".05" value={settings.softBackground} onChange={e=>put({softBackground:Number(e.target.value)})}/></label>}
   <label className="setting-check"><input type="checkbox" checked={settings.dropTogether} onChange={e=>put({dropTogether:e.target.checked})}/> Gemeinsame Drop-Akzente</label>
  </div>
  <div className="group-dance-sync-v327-meters" aria-label="V327 Gruppen-Akzent-Vorschau">
   {Array.from({length:count},(_,i)=><div key={i} className="group-dance-sync-v327-meter"><span>{names[i]}</span><div aria-hidden="true"><span style={{width:`${Math.round(100*result.gains[i]*(.35+.65*result.pulses[i]))}%`}}/></div><small>{Math.round(100*result.gains[i])} %</small></div>)}
  </div>
  <small>{result.source==='imported'?'Importierte V318-Beatpositionen':'Geschätztes BPM-Raster'} · Vorschau nutzt die Editor-Zeitposition. Im Live-Modus werden echte Audioimpulse durch die Gruppengewichtung moduliert. Importierte Beats steuern die Live-Bühne nur bei eingeschalteter V326-Songbindung. Der Versatz ist eine additive Reaktion, keine Verschiebung der Original-GLB-Animation. Pausen und Reduced Motion unterdrücken Akzente.</small>
  <button type="button" onClick={()=>setSettings(writeGroupSyncV327(GROUP_SYNC_DEFAULT_V327))}>V327-Einstellungen zurücksetzen</button>
 </fieldset>;
}
