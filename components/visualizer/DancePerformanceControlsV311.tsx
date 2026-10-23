'use client';
import {useEffect,useState} from 'react';
import {DEFAULT_DANCE_PERFORMANCE_V311,DANCE_PERFORMANCE_EVENT_V311,readDancePerformanceV311,refreshDancePerformanceV311,writeDancePerformanceV311,type AdvancedDanceSettingsV311} from './advancedDancePerformanceV311';
import type {DanceQualityStyle} from './danceQualityV307';

export function DancePerformanceControlsV311(){
  const [settings,setSettings]=useState<AdvancedDanceSettingsV311>(DEFAULT_DANCE_PERFORMANCE_V311);
  useEffect(()=>{
    const sync=()=>setSettings(refreshDancePerformanceV311());sync();
    window.addEventListener(DANCE_PERFORMANCE_EVENT_V311,sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener(DANCE_PERFORMANCE_EVENT_V311,sync);window.removeEventListener('storage',sync);};
  },[]);
  const update=(patch:Partial<AdvancedDanceSettingsV311>)=>{const next={...settings,...patch};setSettings(next);writeDancePerformanceV311(next);};
  const slider=(key:'fluidity'|'balance'|'footProtection'|'transitionPolish',name:string)=>
    <label>{name} ({settings[key]} %)<input type="range" min="0" max="100" step="5" disabled={!settings.enabled} value={settings[key]} onChange={e=>update({[key]:Number(e.target.value)})}/></label>;
  return <fieldset className="stage-director-v287 dance-performance-v311"><legend>Advanced Dance Performance · V311</legend>
    <p>Flüssigere Motion-Übergänge, sanfte Gegenbewegungen und weniger zusätzliche Fußbewegung bei Bodenkontakt. Die importierten Tanzclips und die Fuß-IK bleiben erhalten.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> <strong>Intelligente Tanzverfeinerung aktivieren</strong></label>
    <label>Bewegungsstil<select value={settings.style} disabled={!settings.enabled} onChange={e=>update({style:e.target.value as DanceQualityStyle})}>
      <option value="auto">Automatisch nach Genre</option><option value="rave">Hardtekk / Hardstyle</option><option value="rap">Deutschrap / Hip-Hop</option><option value="cinematic">Cinematic / Ambient</option>
    </select></label>
    {slider('fluidity','Geschmeidigkeit und Bewegungsübergänge')}
    {slider('balance','Körperbalance und Gegenbewegung')}
    {slider('footProtection','Fußkontakt-Schutz')}
    {slider('transitionPolish','Automatische Clip-Überblendung')}
    <button type="button" onClick={()=>update(DEFAULT_DANCE_PERFORMANCE_V311)}>V311 auf Standardwerte zurücksetzen</button>
    <small>Manuelle Choreografien und Timeline-Clips haben Vorrang. Bei Pause, Seek oder reduzierter Bewegung erzeugt V311 keine neuen Bewegungen. Die Qualität tatsächlicher Bewegungen hängt weiterhin von den importierten Motion-Dateien und dem Avatar-Rig ab.</small>
  </fieldset>;
}
