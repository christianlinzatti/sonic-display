"use client";
import {IntelligentMotionPrefetchPanel} from "./IntelligentMotionPrefetchPanel";
import {useEffect,useState} from 'react';
import {DEFAULT_PREDICTIVE_DANCE,readPredictiveDance,writePredictiveDance,PREDICTIVE_DANCE_EVENT,type PredictiveDanceSettings} from './predictiveDanceTransitions';
export function PredictiveDanceTransitionsPanel(){
 const [settings,setSettings]=useState<PredictiveDanceSettings>(DEFAULT_PREDICTIVE_DANCE);
 useEffect(()=>{const update=()=>setSettings(readPredictiveDance());update();window.addEventListener(PREDICTIVE_DANCE_EVENT,update);window.addEventListener('storage',update);return()=>{window.removeEventListener(PREDICTIVE_DANCE_EVENT,update);window.removeEventListener('storage',update);};},[]);
 const update=(patch:Partial<PredictiveDanceSettings>)=>setSettings(writePredictiveDance({...settings,...patch}));
 return <><IntelligentMotionPrefetchPanel/><fieldset aria-label="Predictive Dance Transitions V211" style={{marginBottom:12}}><legend>Predictive Dance Transitions · V211</legend>
  <label style={{display:'block',marginBottom:8}}><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Vorausplanung aktivieren</label>
  <label style={{display:'block',marginBottom:8}}>Vorlauf: {settings.leadBeats} Beats <input type="range" min="0.25" max="4" step="0.25" value={settings.leadBeats} onChange={e=>update({leadBeats:Number(e.target.value)})}/></label>
  <label style={{display:'block',marginBottom:8}}>Mindestabstand: {settings.minimumDwellBars} Takte <input type="range" min="0" max="8" step="1" value={settings.minimumDwellBars} onChange={e=>update({minimumDwellBars:Number(e.target.value)})}/></label>
  <small>Bereitet den nächsten installierten Timeline-Clip vor und schaltet nur auf einer Taktgrenze, wenn der Clip geladen ist. Ohne passende Sequenz bleibt die bisherige Logik aktiv. Keine samplegenaue Spotify-Synchronisation.</small>
 </fieldset></>;
}
