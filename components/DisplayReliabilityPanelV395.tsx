"use client";
import {useEffect,useState} from 'react';
import {appendProductionEventV395,clearProductionEventsV395,setAutoRecoveryV395,useDisplayProductionV395} from './DisplayProductionV395';
import {getRenderMetricsSnapshot,type RenderMetrics} from './visualizer/renderDiagnostics';
const label:Record<string,string>={ready:'3D-Bühne bereit',lost:'WebGL-Kontext verloren',waiting:'Wiederherstellung geplant',restarting:'3D wird neu gestartet',manual:'Manueller Eingriff erforderlich'};
export function DisplayReliabilityPanelV395({onClose}:{onClose:()=>void}){
 const status=useDisplayProductionV395();
 const [metrics,setMetrics]=useState<RenderMetrics|null>(null);
 useEffect(()=>{const tick=()=>{if(!document.hidden)setMetrics(getRenderMetricsSnapshot());};tick();const id=window.setInterval(tick,2000);return()=>window.clearInterval(id);},[]);
 const stale=!metrics||Date.now()-metrics.updatedAt>8000;
 function exportReport(){
  // No Spotify access token, lyric text, track ID or personally identifying data.
  const report={version:395,exportedAt:new Date().toISOString(),browser:typeof navigator!=='undefined'?navigator.userAgent:'',
   viewport:{width:innerWidth,height:innerHeight,pixelRatio:devicePixelRatio},
   recovery:{enabled:status.enabled,kiosk:status.kiosk,phase:status.phase,cause:status.cause,attempts:status.attempts},
   metrics:!stale&&metrics?{fps:metrics.fps,p95FrameMs:metrics.p95FrameMs,slowPercent:metrics.slowPercent,drawCalls:metrics.drawCalls,triangles:metrics.triangles,updatedAt:metrics.updatedAt}:null,
   events:status.events};
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const anchor=document.createElement('a');
  anchor.href=url;anchor.download='sonic-display-v395-reliability.json';anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),1500);
  appendProductionEventV395('export','Diagnose lokal exportiert');
 }
 return <aside className="v395-production-panel" role="dialog" aria-label="V395 Display-Stabilität" aria-modal="false">
  <div className="v395-production-head"><strong>V395 · Display-Stabilität</strong><button type="button" aria-label="Diagnose schließen" onClick={onClose}>✕</button></div>
  <p role="status" aria-live="polite">{label[status.phase]} · Wiederholversuche {status.attempts}/3</p>
  <label className="setting-check"><input type="checkbox" checked={status.enabled} onChange={e=>setAutoRecoveryV395(e.target.checked)}/> Automatische WebGL-Wiederherstellung im Touchmodus</label>
  <p className="v395-help">Maximal drei automatische Versuche. Bei dauerhaftem Fehler bleibt die 2D-Anzeige mit manuellem Neustart. Pausierte oder inaktive Tabs lösen keinen automatischen Neustart aus.</p>
  <div className="v395-stats"><span>FPS: {stale?'–':metrics?.fps.toFixed(1)}</span><span>P95: {stale?'–':metrics?.p95FrameMs?.toFixed(1)??'–'} ms</span><span>Frames: {stale?'Telemetrie veraltet':'Aktuelle Bühnenwerte'}</span></div>
  <strong>Letzte Ereignisse (nur diese Sitzung)</strong>
  <ol className="v395-events">{status.events.length?status.events.slice().reverse().map((e,i)=><li key={`${e.at}-${i}`}><time>{new Date(e.at).toLocaleTimeString('de-AT')}</time> · {e.type}: {e.details}</li>):<li>Noch keine Fehlerereignisse</li>}</ol>
  <div className="v395-actions"><button type="button" onClick={exportReport}>Diagnose als JSON</button><button type="button" onClick={clearProductionEventsV395}>Verlauf leeren</button></div>
 </aside>;
}
