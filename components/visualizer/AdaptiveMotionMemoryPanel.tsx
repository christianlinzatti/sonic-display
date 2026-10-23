"use client";
import {useEffect,useState} from 'react';
import {ADAPTIVE_MOTION_MEMORY_EVENT,DEFAULT_MOTION_MEMORY,readMotionMemory,writeMotionMemory,type MotionMemorySettings} from './adaptiveMotionMemory';
export function AdaptiveMotionMemoryPanel(){
 const [settings,setSettings]=useState<MotionMemorySettings>(DEFAULT_MOTION_MEMORY);
 useEffect(()=>{const sync=()=>setSettings(readMotionMemory());sync();window.addEventListener(ADAPTIVE_MOTION_MEMORY_EVENT,sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener(ADAPTIVE_MOTION_MEMORY_EVENT,sync);window.removeEventListener('storage',sync);};},[]);
 const change=(x:Partial<MotionMemorySettings>)=>setSettings(writeMotionMemory({...settings,...x}));
 return <fieldset aria-label="Adaptive Motion Memory V213" style={{marginBottom:12}}><legend>Adaptive Motion Memory · V213</legend>
  <label style={{display:'block'}}><input type="checkbox" checked={settings.enabled} onChange={e=>change({enabled:e.target.checked})}/> Adaptive Cache-Verwaltung aktivieren</label>
  <label style={{display:'block'}}>Hardware-Profil <select value={settings.profile} onChange={e=>change({profile:e.target.value as MotionMemorySettings['profile']})} disabled={!settings.enabled}><option value="auto">Automatisch</option><option value="desktop">Desktop</option><option value="pi">Raspberry Pi / Low Memory</option></select></label>
  <label style={{display:'block'}}>Mindestens {settings.minClips} Clips <input type="range" min={2} max={12} value={settings.minClips} disabled={!settings.enabled} onChange={e=>change({minClips:Number(e.target.value),maxClips:Math.max(settings.maxClips,Number(e.target.value))})}/></label>
  <label style={{display:'block'}}>Höchstens {settings.maxClips} Clips <input type="range" min={settings.minClips} max={16} value={settings.maxClips} disabled={!settings.enabled} onChange={e=>change({maxClips:Number(e.target.value)})}/></label>
  <label style={{display:'block'}}><input type="checkbox" checked={settings.favorFrequentlyUsed} disabled={!settings.enabled} onChange={e=>change({favorFrequentlyUsed:e.target.checked})}/> Häufig verwendete Clips priorisieren</label>
  <small>Funktioniert nur zusammen mit V212 Selective Prefetch. Nutzt Browser-Hardwarehinweise (falls verfügbar). Aktuelle und unmittelbar geplante Motions bleiben geschützt; während einer Session werden nur Zähler geführt, keine Nutzungsprofile gespeichert. Der Modus „Aus“ behält das V212-Verhalten bei.</small>
 </fieldset>;
}
