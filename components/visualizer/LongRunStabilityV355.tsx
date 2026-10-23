'use client';
import {useEffect,useRef,useState} from 'react';
import {useVisualizer} from '@/context/VisualizerContext';
import {observePiSessionV463,acceptPiSessionMetricsV463,resetPiSessionGuardV463,getPiSessionGuardV463} from '@/services/monitoring/piSessionStabilityV463';
import {useAdaptivePerformance} from './adaptivePerformance';
import {getRenderMetricsSnapshot,useRenderDiagnostics} from './renderDiagnostics';
import {initializeStabilityV355,sampleStabilityV355,saveStabilitySettingsV355,
 useStabilityV355,useStabilitySettingsV355,getStabilityDeviceV355,getStabilityHistoryV355,resetStabilityRuntimeV355} from '@/services/monitoring/performanceStabilityV355';

function deviceHintsV355(){
 const userAgent=typeof navigator==='undefined'?'':navigator.userAgent;
 const arm=/\b(armv7l|aarch64|arm64)\b/i.test(userAgent)&&/linux/i.test(userAgent);
 const coarse=typeof window!=='undefined'&&window.matchMedia?.('(pointer: coarse)').matches===true;
 const compact=typeof window!=='undefined'&&Math.min(window.innerWidth,window.innerHeight)<=900;
 return {linuxArm:arm,coarse,compact};
}
/** Mount next to the live Canvas only. Reuses V253/V254 measurements, no second render loop. */
export function LongRunStabilityControllerV355({graphicsReady=true}:{graphicsReady?:boolean}){
 const {track,isPlaying,audioActive}=useVisualizer();
 const quality=useAdaptivePerformance();
 // Keep one sampling timer even when a song, visibility or the selected quality changes.
 const sourceId=track?.id??(audioActive?'live-microphone':'');
 const activePlayback=isPlaying||audioActive;
 const liveRef=useRef({trackId:sourceId,playing:activePlayback,automatic:quality.mode==='auto',graphicsReady});
 liveRef.current={trackId:sourceId,playing:activePlayback,automatic:quality.mode==='auto',graphicsReady};
 useEffect(()=>{
  const observed=()=>observePiSessionV463({at:Date.now(),trackId:liveRef.current.trackId,
   playing:liveRef.current.playing,graphicsReady:liveRef.current.graphicsReady,visible:!document.hidden});
  observed();
  document.addEventListener('visibilitychange',observed);
  return()=>document.removeEventListener('visibilitychange',observed);
 },[sourceId,activePlayback,graphicsReady]);
 useEffect(()=>{
  initializeStabilityV355(deviceHintsV355());
  let lastSampleAt=0;
  const tick=()=>{
   const metrics=getRenderMetricsSnapshot();const now=Date.now();
   const live=liveRef.current;
   const guard=observePiSessionV463({at:now,trackId:live.trackId,playing:live.playing,
    visible:!document.hidden,graphicsReady:live.graphicsReady});
   const fresh=acceptPiSessionMetricsV463(guard,now,metrics.updatedAt)&&metrics.updatedAt!==lastSampleAt;
   lastSampleAt=metrics.updatedAt;
   const perf=typeof performance!=='undefined'?performance as Performance & {memory?:{usedJSHeapSize?:number;jsHeapSizeLimit?:number}}:null;
   const used=perf?.memory?.usedJSHeapSize;const limit=perf?.memory?.jsHeapSizeLimit;
   const heapFraction=typeof used==='number'&&typeof limit==='number'&&limit>0&&Number.isFinite(used)&&Number.isFinite(limit)?used/limit:null;
   sampleStabilityV355({at:now,fps:fresh?metrics.fps:NaN,p95FrameMs:fresh?metrics.p95FrameMs??null:null,
    heapFraction,visible:fresh,automatic:live.automatic});
  };
  const interval=window.setInterval(tick,5000);
  return()=>{window.clearInterval(interval);resetStabilityRuntimeV355();resetPiSessionGuardV463();};
 },[]);
 return null;
}

export function LongRunStabilitySettingsV355(){
 const settings=useStabilitySettingsV355();const status=useStabilityV355();const m=useRenderDiagnostics();
 const [details,setDetails]=useState(false);
 return <section className="settings-field" aria-label="V355 Performance & Stability">
  <h3>V355 – Performance &amp; Stability</h3>
  <p className="settings-note">Zusätzlicher Langzeitschutz für die vorhandene adaptive 3D-Auflösung. Ohne neue Canvas, Timer pro Avatar oder Änderungen an Beat-/Spotify-Synchronisation.</p>
  <label><input type="checkbox" checked={settings.enabled} onChange={e=>saveStabilitySettingsV355({...settings,enabled:e.target.checked})}/> Langzeitschutz für automatische Qualität einschalten</label>
  <label>Geräteprofil
   <select value={settings.device} onChange={e=>saveStabilitySettingsV355({...settings,device:e.target.value})}>
    <option value="auto">Automatisch (Browser-Hinweise)</option><option value="display">10-Zoll-Touchdisplay / Kiosk</option>
    <option value="raspberry-pi">Raspberry Pi / schwache GPU</option><option value="desktop">Desktop / schnelle Hardware</option>
   </select>
  </label>
  <label><input type="checkbox" checked={settings.memoryGuard} onChange={e=>saveStabilitySettingsV355({...settings,memoryGuard:e.target.checked})}/> Browser-Heap berücksichtigen, falls Messwerte verfügbar sind</label>
  <p role="status" className="settings-note">Profil: {getStabilityDeviceV355()} · Schutzstufe: {status.cap} · {status.reason}</p>
  <p className="settings-note">FPS: {m.updatedAt&&Date.now()-m.updatedAt<10000?m.fps.toFixed(1):'keine aktuellen Daten'} · P95: {m.p95FrameMs?.toFixed(1)??'—'} ms · Anpassungen: {status.changes}</p>
  <div className="avatar-editor-buttons"><button type="button" onClick={()=>resetStabilityRuntimeV355()}>Beobachtung zurücksetzen</button><button type="button" onClick={()=>setDetails(v=>!v)}>{details?'Verlauf ausblenden':'Letzte Anpassungen'}</button></div>
  {details&&<ol>{getStabilityHistoryV355().map((h,i)=><li key={`${h.at}-${i}`}>{new Date(h.at).toLocaleTimeString('de-AT')} · {h.cap}: {h.reason}</li>)}</ol>}
  <small>V463: Bei Songwechsel, Rückkehr zum Tab oder nach WebGL-Wiederherstellung pausiert nur die automatische Qualitätsentscheidung kurz. Messwerte bleiben sichtbar; manuelle Qualität und Musik-Synchronisierung bleiben unangetastet. {getPiSessionGuardV463().suspended?'Aktuell: '+getPiSessionGuardV463().reason+'.':''}</small>
  <small>Das Profil wird lokal gespeichert. Im manuellen Renderqualitätsmodus ist V355 passiv. Fehlende oder veraltete Messwerte werden nicht als Lastspitzen interpretiert. Browser-Heap ist nur in manchen Browsern verfügbar und kein verlässlicher GPU-Speicherwert.</small>
 </section>;
}
