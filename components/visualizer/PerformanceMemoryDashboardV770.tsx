"use client";
import {useEffect,useState,useSyncExternalStore} from 'react';
import {useRenderDiagnostics} from './renderDiagnostics';
import {getCleanupSnapshotV833} from './resourceCleanupV833';
import {trimInactivePreviewGltfCacheV833} from './usePreviewGltfCacheV654';
import {assessResourceTrendV770,getPerformanceMemorySnapshotV770,getPerformanceMemoryServerSnapshotV770,
 resetPerformanceMemoryV770,subscribePerformanceMemoryV770,type PerformanceMemorySampleV770} from './performanceMemoryHistoryV770';

const num=(n:number|null|undefined,digits=0)=>n===null||n===undefined||!Number.isFinite(n)?'—':n.toFixed(digits);
const mib=(bytes:number|null|undefined)=>bytes===null||bytes===undefined?'—':(bytes/1048576).toFixed(1)+' MiB';
const series:[keyof PerformanceMemorySampleV770,string,number][]=[
 ['fps','FPS',70],['drawCalls','Draw Calls',0],['geometries','Geometrien',0],['textures','Texturen',0],['heapMiB','JS-Heap (MiB; optional)',0],
];
function TrendV770({samples,metric,label,cap}: {samples:readonly PerformanceMemorySampleV770[];metric:keyof PerformanceMemorySampleV770;label:string;cap:number}) {
 const width=320,height=68;
 const values=samples.map(s=>s[metric]).filter((v):v is number=>typeof v==='number'&&Number.isFinite(v));
 const ymax=Math.max(cap,1,...values);
 const coords=values.map((n,i)=>`${5+(i/Math.max(1,values.length-1))*310},${height-5-(n/ymax)*56}`).join(' ');
 return <div style={{minWidth:0}}>
   <small>{label} · {values.length} Messungen</small>
   {values.length<2?<p className="settings-note">Noch zu wenige Messwerte.</p>:<svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={`${label}: zeitlicher Verlauf aus ${values.length} Messungen`} style={{width:'100%',height:70,display:'block',marginTop:4}}>
     <line x1="5" y1="63" x2="315" y2="63" stroke="currentColor" strokeOpacity=".25" />
     <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" points={coords}/>
   </svg>}
 </div>;
}
/** V770: uses the already running 3D render telemetry. The dashboard itself never creates a Canvas. */
export function PerformanceMemoryDashboardV770(){
 const metrics=useRenderDiagnostics();
 const history=useSyncExternalStore(subscribePerformanceMemoryV770,getPerformanceMemorySnapshotV770,getPerformanceMemoryServerSnapshotV770);
 const [now,setNow]=useState(0);const [notice,setNotice]=useState('');
 useEffect(()=>{setNow(Date.now());const t=window.setInterval(()=>setNow(Date.now()),5000);return()=>window.clearInterval(t);},[]);
 const fresh=metrics.updatedAt>0&&now>0&&now-metrics.updatedAt<5000;
 const last=history.latest;
 const cache=last?.cache??null;
 const assessment=assessResourceTrendV770(history.samples);
 const recent=history.samples.slice(-60); // up to five minutes; global ring stores 30 minutes.
 function exportJson(){
   const report={format:'sonic-display-v770-performance-memory',exportedAt:new Date().toISOString(),
     measurementNote:'WebGL resource object counts; not allocated VRAM or proof of a memory leak',
     intervalMs:5000,maxSamples:360,trend:assessment,samples:history.samples,cleanupOperationsV833:getCleanupSnapshotV833()};
   const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
   try {const a=document.createElement('a');a.href=url;a.download='sonic-v770-performance-memory.json';document.body.appendChild(a);a.click();a.remove();setNotice('Diagnosebericht lokal erzeugt.');}
   finally{window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }
 return <section className="render-diagnostics" aria-label="V770 Live-Performance und Speicher" data-v770-performance-memory>
   <h3>V770 – Live-Performance & Speicher</h3>
   <p className="settings-note">Messwerte aus der bestehenden 3D-Konzertbühne; eine Messung alle fünf Sekunden, maximal 360 Werte (ca. 30 Minuten). Keine zweite GPU-Szene, keine Speicherung und kein Upload.</p>
   <p role="status"><strong>{fresh?'Live-Messung aktiv':'Keine aktuellen 3D-Messwerte'}</strong>{!fresh?' – aktiviere die 3D-Avatar-Bühne.':''}</p>
   <div className="render-diagnostics-grid">
     <div><span>FPS</span><strong>{fresh?num(metrics.fps,1):'—'}</strong></div>
     <div><span>P95 Framezeit</span><strong>{fresh?`${num(metrics.p95FrameMs,1)} ms`:'—'}</strong></div>
     <div><span>Draw Calls</span><strong>{fresh?num(metrics.drawCalls):'—'}</strong></div>
     <div><span>Dreiecke</span><strong>{fresh?num(metrics.triangles):'—'}</strong></div>
     <div><span>Geometrien</span><strong>{fresh?num(metrics.geometries):'—'}</strong></div>
     <div><span>Texturen</span><strong>{fresh?num(metrics.textures):'—'}</strong></div>
     <div><span>Shader-Programme</span><strong>{fresh?num(metrics.programs):'—'}</strong></div>
     <div><span>JS-Heap (Chromium)</span><strong>{fresh&&last?.heapMiB!==null&&last?.heapMiB!==undefined?`${num(last.heapMiB,1)} MiB`:'—'}</strong></div>
     <div><span>GLB-Cache aktiv / inaktiv</span><strong>{cache?`${cache.activeEntries} / ${cache.idleEntries}`:'—'}</strong></div>
     <div><span>GLB-Cache inaktiv (Schätzung)</span><strong>{cache?mib(cache.idleEstimatedBytes):'—'}</strong></div>
   </div>
   <p className="settings-note">{cache?`Cachebudget: ${cache.idleLimit} inaktive GLBs bzw. ${mib(cache.idleByteBudget)} geschätzte Dekodierdaten; aktiv ${mib(cache.activeEstimatedBytes)} (geschützt).`:'GLB-Cache noch nicht initialisiert bzw. keine Cache-Telemetrie.'}</p>
   <h4>V833 · Ressourcen-Lebensdauer</h4>
   <p className="settings-note">Explizit freigegebene Postprocessing-Pässe: {getCleanupSnapshotV833().disposed}; fehlgeschlagene Freigaben: {getCleanupSnapshotV833().failed}. Diese Zähler umfassen nur registrierte Freigaben, nicht den gesamten Renderer.</p>
   <button type="button" onClick={()=>{const result=trimInactivePreviewGltfCacheV833();setNotice(`${result.entries} inaktive GLB-Cacheeinträge entfernt (${(result.releasedEstimatedBytes/1048576).toFixed(1)} MiB geschätzte Dekodierdaten). Aktive Modelle bleiben erhalten. Kein Nachweis freigewordenen VRAMs.`);}}>
     Inaktiven GLB-Cache bereinigen
   </button>
   <h4>Verlauf · letzte 5 Minuten</h4>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'12px'}}>
    {series.map(([metric,label,cap])=><TrendV770 key={metric} samples={recent} metric={metric} label={label} cap={cap}/>)}
   </div>
   <p className="settings-note">Verlauf: {history.samples.length} / 360 Stichproben; {last?`zuletzt ${new Date(last.at).toLocaleTimeString('de-AT')}`:'noch keine Aufzeichnung'}.</p>
   <p role="status"><strong>{assessment.state==='review'?'Ressourcenanstieg prüfen':assessment.state==='stable'?'Ressourcenanzahl relativ stabil':'Trendbewertung noch nicht möglich'}</strong> – {assessment.reason}</p>
   {assessment.state!=='insufficient'&&<p className="settings-note">Nettoveränderung: {assessment.geometryDelta>=0?'+':''}{assessment.geometryDelta} Geometrien, {assessment.textureDelta>=0?'+':''}{assessment.textureDelta} Texturen. Änderungen der Bühne, Effekte oder Qualitätsstufe können einen Anstieg erklären.</p>}
   <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
    <button type="button" onClick={exportJson} disabled={!history.samples.length}>JSON-Bericht exportieren</button>
    <button type="button" onClick={()=>{resetPerformanceMemoryV770();setNotice('Messverlauf zurückgesetzt.');}} disabled={!history.samples.length}>Messverlauf löschen</button>
   </div>
   {notice&&<p role="status" className="settings-note">{notice}</p>}
   <p className="settings-note">WebGL-Geometrien, Texturen und Shader sind Objektzähler, keine VRAM-Bytes. GLB-Größen sind Schätzwerte, kein VRAM. JavaScript-Heap ist browserabhängig; Garbage Collection beeinflusst den Verlauf. Ein Trend beweist weder Lecks noch Leak-Freiheit. Für einen kontrollierten Bühnenwechseltest V767 nutzen.</p>
 </section>;
}
