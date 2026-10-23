"use client";
import {useEffect,useState} from "react";
import {useDisplayProfileV388} from "./DisplayPerformanceV388";
import {useAdaptivePerformance} from "./visualizer/adaptivePerformance";
import {getRenderMetricsSnapshot,type RenderMetrics} from "./visualizer/renderDiagnostics";
import {resolveDisplayBudgetV388} from "./visualizer/displayPerformancePolicyV388";
import {resolveDisplayPixelsV403} from "./visualizer/displayPixelBudgetV403";

/** V403: UI is mounted only when requested; no new Canvas or per-avatar timers. */
export function DisplayProductionPanelV403({onClose}:{onClose:()=>void}){
 const {profile,kioskEnabled}=useDisplayProfileV388();
 const quality=useAdaptivePerformance();
 const [metrics,setMetrics]=useState<RenderMetrics|null>(null);
 const [device,setDevice]=useState({width:0,height:0,pixelRatio:1,cores:8,memoryGb:8,saveData:false});
 useEffect(()=>{
  const tick=()=>{if(document.hidden)return;
    const nav=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};
    setDevice({width:window.innerWidth,height:window.innerHeight,pixelRatio:window.devicePixelRatio||1,
     cores:nav.hardwareConcurrency||8,memoryGb:nav.deviceMemory??8,saveData:nav.connection?.saveData??false});
    setMetrics(getRenderMetricsSnapshot());};
  tick();const id=window.setInterval(tick,2500);
  window.addEventListener("resize",tick,{passive:true});
  return ()=>{window.clearInterval(id);window.removeEventListener("resize",tick);};
 },[]);
 const count=metrics?.avatarCount??1;
 const hints={...device,avatarCount:count};
 const budget=resolveDisplayBudgetV388(profile,kioskEnabled,hints);
 const pixels=resolveDisplayPixelsV403(profile,hints,budget.dprCap,kioskEnabled);
 const stale=!metrics||!metrics.updatedAt||Date.now()-metrics.updatedAt>8000;
 const highPressure=!stale&&metrics&&(metrics.p95FrameMs??0)>35&&metrics.slowPercent>20;
 return <aside className="v395-production-panel" role="dialog" aria-modal="false" aria-label="V403 Display-Produktionsdiagnose">
  <div className="v395-production-head"><strong>V403 · Display-Produktionsdiagnose</strong><button type="button" aria-label="Diagnose schließen" onClick={onClose}>✕</button></div>
  <p>Verwendet die bestehende Rendering-Telemetrie. Keine zweite Bühne, keine Änderungen an Audio, Tanz oder Spotify.</p>
  <div className="v395-stats"><span>Bildschirm: {device.width} × {device.height}</span><span>Avatare: {stale?'–':count}</span><span>Profil: {profile}</span></div>
  <div className="v395-stats"><span>Live-DPR: {quality.dpr.toFixed(2)}</span><span>DPR-Limit: {budget.enabled?budget.dprCap.toFixed(2):'kein Display-Limit'}</span><span>Qualität: {quality.tier}</span></div>
  <div className="v395-stats"><span>FPS: {stale?'–':metrics?.fps.toFixed(1)}</span><span>P95: {stale?'–':metrics?.p95FrameMs?.toFixed(1)??'–'} ms</span><span>Draw Calls: {stale?'–':metrics?.drawCalls}</span></div>
  <p role="status">{stale?'Noch keine aktuellen Bühnendaten':highPressure?'Hohe Renderlast: Display-Profil „Adaptiv“ oder „Energiesparen“ verwenden':budget.reason}</p>
  <p className="v395-help">{budget.enabled?`V403 Ziel-Pixelbudget: ${(pixels.maxPixels/1000000).toFixed(1)} Mio. Pixel; bei minimaler DPR 0,5 sind auf 4K-Bildschirmen mehr Pixel möglich. Geschätzte Obergrenze: ${(pixels.estimatedPixels/1000000).toFixed(1)} Mio. Pixel für den gesamten Viewport.`:'Standardmodus: die bisherige Auflösung bleibt unverändert.'} Gemessene WebGL-Renderzeit, Temperatur und GPU-Speicher stehen nicht zuverlässig zur Verfügung.</p>
  <p className="v395-help">Für die Produktion: 30 Minuten mit vier aktiven Tänzern testen, dann Fenster minimieren/wiederherstellen und die FPS sowie P95-Framezeiten vergleichen. Browser- und Treibertests sind vor Ort erforderlich.</p>
 </aside>;
}
