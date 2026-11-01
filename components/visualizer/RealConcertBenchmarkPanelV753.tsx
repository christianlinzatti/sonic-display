'use client';
import {useEffect,useState} from 'react';
import {useConcertQualityV466} from './concertQualityStoreV466';
import {useQualityAutoTuneEnabledV755} from './qualityAutoTuneStoreV755';
import {V751_OPEN_RENDER_QA_EVENT,useConcertDashboardV751} from './concertDashboardStoreV751';
import {isConcertDashboardFreshV751} from './concertDashboardProjectionV751';
import {BENCHMARK_TARGET_SAMPLES_V753,collectBenchmarkV753,comparableBenchmarksV753,
 exportBenchmarkCsvV753,startBenchmarkV753,stopBenchmarkV753,summarizeBenchmarkV753,
 validateProbeV753,type BenchmarkRunV753,type BenchmarkSummaryV753} from './realConcertBenchmarkV753';

const value=(n:number|null,unit='')=>n===null?'Nicht verfügbar':`${n.toFixed(1)}${unit}`;
export function RealConcertBenchmarkPanelV753(){
 const probe=useConcertQualityV466();
 const stage=useConcertDashboardV751();
 const autoTuneEnabledV755=useQualityAutoTuneEnabledV755();
 const [sectionAtStart,setSectionAtStart]=useState<string|null>(null);
 const [count,setCount]=useState<1|2|3|4>(1);
 const [run,setRun]=useState<BenchmarkRunV753|null>(null);
 const [results,setResults]=useState<BenchmarkSummaryV753[]>([]);
 const [clock,setClock]=useState(0);
 useEffect(()=>{setClock(Date.now());const timer=window.setInterval(()=>setClock(Date.now()),1000);
  return()=>window.clearInterval(timer);},[]);
 useEffect(()=>{if(!run||run.status!=='running')return;
  if(autoTuneEnabledV755||!stage.playing||!stage.avatarStage||stage.section!==sectionAtStart||
     !isConcertDashboardFreshV751(stage,Date.now())){
   setRun(previous=>previous?stopBenchmarkV753(previous,'Wiedergabe, Songabschnitt oder Bühnenstatus geändert'):previous);return;
  }
  setRun(previous=>previous&&previous.status==='running'?collectBenchmarkV753(previous,probe,Date.now()):previous);
 },[probe,stage,autoTuneEnabledV755]);
 useEffect(()=>{if(!run||run.status!=='complete')return;
  const summary=summarizeBenchmarkV753(run);
  if(summary)setResults(previous=>[...previous.filter(x=>x.environment.avatars!==summary.environment.avatars),summary].sort((a,b)=>a.environment.avatars-b.environment.avatars));
 },[run]);
 useEffect(()=>{if(!run||run.status!=='running'||clock<=0)return;
  if(clock-run.startedAt>60000||run.samples.length>0&&clock-run.samples[run.samples.length-1].at>5500)
   setRun(previous=>previous?stopBenchmarkV753(previous,'Messung unterbrochen: keine aktuellen WebGL-Daten'):previous);
 },[clock,run]);
 const error=autoTuneEnabledV755?'V755 Auto-Tuning für vergleichbare Benchmark-Messungen ausschalten':
  !stage.playing||!stage.avatarStage||!isConcertDashboardFreshV751(stage,clock||Date.now())?
  'Keine aktive 3D-Musikwiedergabe':validateProbeV753(probe,clock||Date.now(),count);
 const running=run?.status==='running';
 const sameProfile=results.length<2||results.every(x=>comparableBenchmarksV753(x,results[0]));
 const exportCsv=()=>{
  const blob=new Blob([exportBenchmarkCsvV753(results)],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='sonic-display-v753-benchmark.csv';
  document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <section className="v751-measurements" aria-label="V753 Real Concert Performance Benchmark" data-v753-benchmark>
   <h3>V753 · Real Concert Performance Benchmark</h3>
   <p>Freiwillige Browser-Messung für 1–4 tatsächlich geladene GLB-Avatare. Jede Messreihe sammelt {BENCHMARK_TARGET_SAMPLES_V753} echte WebGL-Telemetriefenster. Keine geschätzten FPS, keine automatischen Qualitäts- oder Avatar-Umschaltungen.</p>
   <label htmlFor="v753-avatars">Avatar-Anzahl im aktuellen Bühnenbild</label>{' '}
   <select id="v753-avatars" value={count} disabled={running} onChange={(e:{target:{value:string}})=>setCount(Number(e.target.value) as 1|2|3|4)}>
    {[1,2,3,4].map(n=><option value={n} key={n}>{n} Avatar{n===1?'':'e'}</option>)}
   </select>{' '}
   <button type="button" onClick={()=>window.dispatchEvent(new Event(V751_OPEN_RENDER_QA_EVENT))}>
    WebGL-Probe auf der Bühne aktivieren
   </button>{' '}
   <button type="button" disabled={running||!!error} onClick={()=>{setSectionAtStart(stage.section);setRun(startBenchmarkV753(probe,Date.now(),count));}}>
    Messung starten
   </button>{' '}
   {running&&<button type="button" onClick={()=>setRun(previous=>previous?stopBenchmarkV753(previous):previous)}>Abbrechen</button>}
   <p role="status">{running?`Messung läuft: ${run.samples.length}/${BENCHMARK_TARGET_SAMPLES_V753} Fenster`:
    run?.status==='stopped'?`Nicht übernommen: ${run.lastReason}`:
    run?.status==='complete'?'Messreihe abgeschlossen und übernommen.':
    error??'Bereit. Bitte denselben Songabschnitt und dieselbe Bühne für alle Gruppen verwenden.'}</p>
   {results.length>0&&<><div style={{overflowX:'auto'}}><table><thead><tr>
    <th>GLB</th><th>Renderpixel</th><th>Profil</th><th>FPS Ø</th><th>FPS Min</th><th>Frame Ø</th>
    <th>P95-Fenster-Median</th><th>Draw Calls Ø</th><th>Dreiecke Ø</th><th>Geometrien</th><th>Texturen</th><th>JS-Heap MB</th>
   </tr></thead><tbody>{results.map(result=><tr key={result.environment.avatars}>
    <td>{result.environment.avatars}</td><td>{result.environment.canvasWidth}×{result.environment.canvasHeight}</td>
    <td>{result.environment.qualityTier}</td><td>{value(result.fps)}</td><td>{value(result.minFps)}</td>
    <td>{value(result.avgFrameMs,' ms')}</td><td>{value(result.medianP95WindowMs,' ms')}</td>
    <td>{result.drawCalls}</td><td>{result.triangles}</td><td>{result.geometries??'–'}</td>
    <td>{result.textures??'–'}</td><td>{value(result.jsHeapMb)}</td>
   </tr>)}</tbody></table></div>
   <p>{sameProfile?'Messreihen mit gleicher WebGL-Renderauflösung und Renderqualität vergleichbar (Szenen und Songabschnitte bitte ebenfalls konstant halten).':
    'Nicht direkt vergleichbar: Auflösung oder Qualitätsprofil unterscheiden sich.'}</p>
   <button type="button" onClick={exportCsv}>CSV exportieren</button>{' '}
   <button type="button" onClick={()=>{setResults([]);setRun(null);}}>Ergebnisse verwerfen</button></>}
   <small>Die V466-Probe misst Renderer-FPS, CPU-seitige Frame-Timings und Renderer-Zähler. Die ausgewiesene P95-Kennzahl ist der Median der P95-Werte einzelner Messfenster, nicht der P95-Wert aller Einzelbilder. Geometrien und Texturen sind Ressourcenanzahlen, keine GPU-Speichergröße. JS-Heap ist nur in unterstützten Browsern verfügbar. Keine GPU-Zeit-, Energie-, VRAM- oder Temperaturmessung. Ergebnisse bleiben nur in dieser Ansicht und werden nicht übertragen. Für einen Vergleich die Gruppe auf der Bühne manuell auf 1, 2, 3 und 4 Avatare umstellen.</small>
 </section>;
}
