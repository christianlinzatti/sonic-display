"use client";
import {AdaptiveMotionMemoryPanel} from "./AdaptiveMotionMemoryPanel";
import {useEffect,useState} from 'react';
import {DEFAULT_MOTION_PREFETCH,readMotionPrefetch,writeMotionPrefetch,MOTION_PREFETCH_EVENT,type MotionPrefetchSettings} from './intelligentMotionPrefetch';
export function IntelligentMotionPrefetchPanel(){
 const [s,setS]=useState<MotionPrefetchSettings>(DEFAULT_MOTION_PREFETCH);
 useEffect(()=>{const refresh=()=>setS(readMotionPrefetch());refresh();window.addEventListener(MOTION_PREFETCH_EVENT,refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener(MOTION_PREFETCH_EVENT,refresh);window.removeEventListener('storage',refresh);};},[]);
 const change=(update:Partial<MotionPrefetchSettings>)=>setS(writeMotionPrefetch({...s,...update}));
 return <><AdaptiveMotionMemoryPanel/><fieldset aria-label="Intelligent Motion Prefetch V212" style={{marginBottom:12}}><legend>Intelligent Motion Prefetch · V212</legend>
 <label style={{display:'block'}}><input type="checkbox" checked={s.enabled} onChange={e=>change({enabled:e.target.checked})}/> Selektives GLB-Vorladen aktivieren</label>
 <label style={{display:'block'}}>Vorausschau: {s.aheadSteps} kommende Motion(s) <input type="range" min={1} max={4} value={s.aheadSteps} onChange={e=>change({aheadSteps:Number(e.target.value)})}/></label>
 <label style={{display:'block'}}>Clip-Cache: {s.cacheSize} Motions <input type="range" min={3} max={12} value={s.cacheSize} onChange={e=>change({cacheSize:Number(e.target.value)})}/></label>
 <label style={{display:'block'}}>Parallele Ladevorgänge: {s.concurrency} <input type="range" min={1} max={3} value={s.concurrency} onChange={e=>change({concurrency:Number(e.target.value)})}/></label>
 <small>Benötigt aktivierte V198-Timeline und V211-Vorausplanung. Geladene Clips bleiben während aktueller und geplanter Wiedergabe geschützt. Bei fehlgeschlagenem Laden greift die bestehende sichere Animationsauswahl. Ausschalten stellt den vollständigen Bibliotheks-Ladevorgang wieder her.</small>
 </fieldset></>;
}
