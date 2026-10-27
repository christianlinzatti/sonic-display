'use client';
import {useEffect,useState} from 'react';
import {DEFAULT_NATURAL_DANCE_V320,NATURAL_DANCE_EVENT_V320,refreshNaturalDanceV320,writeNaturalDanceV320,type NaturalDanceSettingsV320} from './naturalDanceIntelligenceV320';
import {DEFAULT_DANCE_FLOW_V391,DANCE_FLOW_EVENT_V391,refreshDanceFlowV391,writeDanceFlowV391,type DanceFlowSettingsV391} from './naturalDanceIntelligenceV391';
import type {DanceQualityStyle} from './danceQualityV307';
import {DEFAULT_NATURAL_DANCE_MOTION_V545,NATURAL_DANCE_MOTION_EVENT_V545,refreshNaturalDanceMotionV545,writeNaturalDanceMotionV545,type NaturalDanceMotionSettingsV545} from './naturalDanceMotionV545';

export function NaturalDanceControlsV320(){
  const [natural545,setNatural545]=useState<NaturalDanceMotionSettingsV545>(DEFAULT_NATURAL_DANCE_MOTION_V545);
  useEffect(()=>{const sync=()=>setNatural545(refreshNaturalDanceMotionV545());sync();
    window.addEventListener(NATURAL_DANCE_MOTION_EVENT_V545,sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener(NATURAL_DANCE_MOTION_EVENT_V545,sync);window.removeEventListener('storage',sync);};},[]);
  const change545=(patch:Partial<NaturalDanceMotionSettingsV545>)=>{
    const next={...natural545,...patch};setNatural545(next);writeNaturalDanceMotionV545(next);
  };
  const [flow,setFlow]=useState<DanceFlowSettingsV391>(DEFAULT_DANCE_FLOW_V391);
  useEffect(()=>{const sync=()=>setFlow(refreshDanceFlowV391());sync();window.addEventListener(DANCE_FLOW_EVENT_V391,sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener(DANCE_FLOW_EVENT_V391,sync);window.removeEventListener("storage",sync);};},[]);
  const changeFlow=(patch:Partial<DanceFlowSettingsV391>)=>{const next={...flow,...patch};setFlow(next);writeDanceFlowV391(next);};
  const [settings,setSettings]=useState<NaturalDanceSettingsV320>(DEFAULT_NATURAL_DANCE_V320);
  useEffect(()=>{
    const sync=()=>setSettings(refreshNaturalDanceV320());sync();
    window.addEventListener(NATURAL_DANCE_EVENT_V320,sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener(NATURAL_DANCE_EVENT_V320,sync);window.removeEventListener('storage',sync);};
  },[]);
  const update=(patch:Partial<NaturalDanceSettingsV320>)=>{const next={...settings,...patch};setSettings(next);writeNaturalDanceV320(next);};
  const slider=(key:'weightTransfer'|'followThrough'|'groove'|'footSafety',label:string)=><label key={key}>
    {label} ({settings[key]} %)<input type="range" min="0" max="100" step="5" value={settings[key]}
      disabled={!settings.enabled} onChange={event=>update({[key]:Number(event.target.value)})}/></label>;
  return <fieldset className="stage-director-v287 natural-dance-v320">
    <legend>Natürlicher Tanz · V320 + V391</legend>
    <p>Rhythmische Gewichtsverlagerung, natürliches Nachschwingen und genreangepasste Akzente – ausschließlich als kleine Zusatzbewegungen.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={event=>update({enabled:event.target.checked})}/> Natürliche Tanzbewegung aktivieren</label>
    <label>Tanzstil<select disabled={!settings.enabled} value={settings.style} onChange={event=>update({style:event.target.value as DanceQualityStyle})}>
      <option value="auto">Automatisch nach Genre</option><option value="rave">Hardtekk / Hardstyle</option><option value="rap">Deutschrap / Hip-Hop</option><option value="cinematic">Cinematic / Ambient</option>
    </select></label>
    {slider('weightTransfer','Gewichtsverlagerung und Gegenbewegung')}
    {slider('followThrough','Natürliches Nachschwingen')}
    {slider('groove','Beat- und Snare-Akzente')}
    {slider('footSafety','Fußkontakt-Schutz')}
    <button type="button" onClick={()=>update({...DEFAULT_NATURAL_DANCE_V320})}>V320 zurücksetzen</button>
    <div className="natural-dance-v391" style={{padding:'12px 0'}}>
      <strong>V391 · Natural Dance Intelligence 3.0 – Flow</strong>
      <p>Unregelmäßige, beatgebundene Gewichtsverlagerung und weicheres Nachschwingen. Nur additive Rig-Kanäle, kein Eingriff in Clip-Keyframes oder Fuß-IK.</p>
      <label className="setting-check"><input type="checkbox" checked={flow.enabled} onChange={e=>changeFlow({enabled:e.target.checked})}/> V391 Flow-Variation aktivieren</label>
      <label>Variation ({flow.strength} %)<input type="range" min="0" max="100" step="5" disabled={!flow.enabled} value={flow.strength} onChange={e=>changeFlow({strength:Number(e.target.value)})}/></label>
      <button type="button" onClick={()=>changeFlow(DEFAULT_DANCE_FLOW_V391)}>V391 zurücksetzen</button>
    </div>
    <div className="natural-dance-v545" style={{padding:'12px 0'}}>
      <strong>V545 · Natural Dance Motion 6.0 – GLB-Fußkontakt</strong>
      <p>Glättet nur Zusatzrotationen an Hüfte und Beinen, wenn die vorhandene Fuß-IK sicheren Kontakt meldet. Deutschrap bleibt geschmeidig; Hardstyle/Hardtekk reagieren schneller.</p>
      <label className="setting-check"><input type="checkbox" checked={natural545.enabled}
        onChange={event=>change545({enabled:event.target.checked})}/> Fußkontakt-Glättung aktivieren</label>
      <label>Schutzstärke ({natural545.strength} %)<input type="range" min="0" max="100" step="5"
        disabled={!natural545.enabled} value={natural545.strength}
        onChange={event=>change545({strength:Number(event.target.value)})}/></label>
      <button type="button" onClick={()=>change545(DEFAULT_NATURAL_DANCE_MOTION_V545)}>V545 zurücksetzen</button>
    </div>
    <small>Respektiert Pause, Reduced Motion und importierte GLB-Keyframes. Bei manuell gewählten Choreografien wird der Effekt bewusst stark reduziert. Keine Änderung der Fuß-IK oder Root-Translation.</small>
  </fieldset>;
}
