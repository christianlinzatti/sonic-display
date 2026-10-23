"use client";
import {useEffect,useState} from "react";
import {getAnalysisSamples} from "@/services/monitoring/performanceSessionAnalyzerV262";
import {SESSION_METRICS_EVENT} from "@/services/monitoring/longSessionMetrics";
import {BENCHMARK_SAMPLES,BENCHMARK_WARMUP,benchmarkWindow,rankBenchmarks,type BenchmarkMode,type BenchmarkResult} from "@/services/monitoring/adaptivePerformanceBenchmarkV270";
import {setPerformanceMode,useAdaptivePerformance} from "@/components/visualizer/adaptivePerformance";
import {readMultiAvatarDirectorEnabled} from "@/components/visualizer/adaptiveMultiAvatarDirectorV260";
import {looksLikeRaspberryPi,recommendPiMode} from "@/services/monitoring/raspberryPiOptimizerV271";
const MODES:BenchmarkMode[]=["high","balanced","low"];
const fmt=(v:number|null)=>v===null?"—":v.toFixed(1);
export function AdaptivePerformanceBenchmarkV270(){
 const performance=useAdaptivePerformance();
 const [active,setActive]=useState<{mode:BenchmarkMode;started:number;previous:"auto"|BenchmarkMode;director:boolean}|null>(null);
 const [results,setResults]=useState<BenchmarkResult[]>([]);
 const [tick,setTick]=useState(0);
 const [message,setMessage]=useState("");
 const [piMode,setPiMode]=useState(false);
 const [suggested,setSuggested]=useState(false);
 const [restore,setRestore]=useState<"auto"|BenchmarkMode|null>(null);
 useEffect(()=>{setPiMode(looksLikeRaspberryPi(navigator.userAgent,navigator.platform));},[]);
 useEffect(()=>{const update=()=>setTick(v=>v+1);window.addEventListener(SESSION_METRICS_EVENT,update);return()=>window.removeEventListener(SESSION_METRICS_EVENT,update);},[]);
 // Restore original quality when this diagnostic panel unmounts, unless a user has changed it separately.
 useEffect(()=>()=>{if(active)setPerformanceMode(active.previous);},[active]);
 const series=getAnalysisSamples();void tick;
 const windowResult=active?benchmarkWindow(series,active.started,active.mode):null;
 function begin(mode:BenchmarkMode){if(active)return;const started=Date.now();const director=readMultiAvatarDirectorEnabled();setActive({mode,started,previous:performance.mode,director});setPerformanceMode(mode);setMessage("Benchmark gestartet: nur die Renderqualität wurde vorübergehend geändert. Musik laufen lassen und Tab sichtbar halten.");}
 function stop(){if(!active)return;setPerformanceMode(active.previous);setActive(null);setMessage("Benchmark abgebrochen. Vorherige Renderqualität wiederhergestellt.");}
 function finish(){if(!active||!windowResult?.result)return;const result=windowResult.result;setResults(prev=>[...prev.filter(r=>r.mode!==active.mode),result]);setPerformanceMode(active.previous);setActive(null);setMessage("Messung abgeschlossen. Vorherige Renderqualität wiederhergestellt.");}
 const piRecommendation=piMode?recommendPiMode(results):null;
 const ranked=rankBenchmarks(results);const avatarCounts=new Set(results.map(r=>r.activeAvatars));
 return <section aria-label="V270 Adaptive Performance Benchmark Studio" style={{padding:"0.75rem 1rem",border:"1px solid currentColor",marginTop:16}}>
  <h4>V270 · Adaptive Performance Benchmark Studio</h4>
  <p className="settings-note">Vergleiche High, Balanced und Low unter möglichst gleichen Bedingungen. Pro Test werden zwei neue Messungen zum Aufwärmen und anschließend sechs für die Auswertung erfasst (ca. 40 Sekunden). Kein automatischer Durchlauf und keine Änderung an Avataren oder Choreografien.</p>
  <p className="settings-note">Renderqualität: {performance.mode}. Multi-Avatar Director bleibt {readMultiAvatarDirectorEnabled()?"aktiv":"aus"}. Für faire Ergebnisse denselben Track, dieselbe Szene und dieselbe Avatar-Anzahl verwenden.</p>
  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{MODES.map(mode=><button key={mode} type="button" disabled={!!active} onClick={()=>begin(mode)}>Test: {mode}</button>)}{active&&<button type="button" onClick={stop}>Abbrechen und zurücksetzen</button>}</div>
  {active&&<div role="status" className="settings-note">Test {active.mode}: {Math.min(windowResult?.count??0,BENCHMARK_WARMUP+BENCHMARK_SAMPLES)}/{BENCHMARK_WARMUP+BENCHMARK_SAMPLES} Messungen.{windowResult?.result?<button type="button" onClick={finish}>Ergebnis übernehmen und Renderqualität zurücksetzen</button>:windowResult?.count===(BENCHMARK_WARMUP+BENCHMARK_SAMPLES)?" Avatar-Anzahl hat sich geändert – Test abbrechen und wiederholen.":" Wiedergabe und sichtbaren Tab erforderlich."}</div>}
  {results.length>0&&<div style={{overflowX:"auto"}}><table><thead><tr><th>Qualität</th><th>FPS Ø</th><th>Frame P95 Ø</th><th>Langsame Frames</th><th>Avatar Callback Ø</th><th>Avatare</th></tr></thead><tbody>{ranked.map((r,i)=><tr key={r.mode}><td>{r.mode}{i===0&&avatarCounts.size===1?" · Beste Messung":""}</td><td>{fmt(r.fps)}</td><td>{fmt(r.p95FrameMs)} ms</td><td>{fmt(r.slowPercent)} %</td><td>{fmt(r.avatarCallbackMeanMs)} ms</td><td>{r.activeAvatars}</td></tr>)}</tbody></table></div>}
  {avatarCounts.size>1&&<p className="settings-note">Unterschiedliche Avatar-Anzahlen gemessen: ein direkter Leistungsvergleich ist nur eingeschränkt sinnvoll.</p>}
  <div aria-label="V271 Raspberry Pi Performance Optimizer" style={{padding:12,marginTop:12,border:"1px solid currentColor"}}>
   <h4>V271 · Raspberry Pi Performance Optimizer</h4>
   <label><input type="checkbox" checked={piMode} onChange={e=>{setPiMode(e.target.checked);setSuggested(false);}}/> Für Raspberry Pi auswerten (manuell aktivieren, falls Browser das Gerät nicht erkennt)</label>
   {!piMode?<p className="settings-note">Die Empfehlung ist deaktiviert. Auf Raspberry Pi aktivieren oder Gerät erkennen lassen.</p>:!piRecommendation?<p className="settings-note">Mindestens eine vollständige Benchmark-Messung mit gültigen FPS und P95-Framezeiten erforderlich. Alle gemessenen Avatar-Anzahlen müssen übereinstimmen.</p>:<>
    <p className="settings-note">Empfehlung: <strong>{piRecommendation.mode}</strong> · {piRecommendation.fps.toFixed(1)} FPS · P95 {piRecommendation.p95FrameMs.toFixed(1)} ms · {piRecommendation.activeAvatars} Avatare. {piRecommendation.reason}</p>
    {piRecommendation.confidence==='limited'&&<p className="settings-note">Eingeschränkte Sicherheit: Für einen besseren Vergleich mindestens zwei Qualitätsstufen testen.</p>}
    {!active&&<button type="button" onClick={()=>setSuggested(true)}>Empfehlung in Vorschau ansehen</button>}
    {suggested&&!active&&<div role="group" aria-label="Empfehlung bestätigen"><p className="settings-note">Aktuell {performance.mode} → danach {piRecommendation.mode}. Ausschließlich die Renderqualität ändert sich. Avatare, Motion-Dateien, Director und Choreografien bleiben unverändert.</p><button type="button" onClick={()=>{setRestore(performance.mode);setPerformanceMode(piRecommendation.mode);setSuggested(false);setMessage('Empfohlene Renderqualität aktiviert. Rückgängig ist verfügbar.');}}>Renderqualität übernehmen</button> <button type="button" onClick={()=>setSuggested(false)}>Abbrechen</button></div>}
    {restore!==null&&!active&&<button type="button" onClick={()=>{setPerformanceMode(restore);setRestore(null);setMessage('Vorherige Renderqualität wiederhergestellt.');}}>V271-Änderung rückgängig machen</button>}
   </>}
   <p className="settings-note">Raspberry-Pi-Erkennung ist nur eine Browser-Heuristik. Kein direkter CPU-/GPU-Test, keine automatische Avatar-LOD- oder Animationsänderung; Ergebnisse gelten nur für die getestete Szene. Weitere Geräteprofile können über V267/V268 gespeichert werden.</p>
  </div>
  {results.length>0&&<button type="button" onClick={()=>{setResults([]);setSuggested(false);setMessage("Benchmark-Ergebnisse gelöscht.");}}>Messreihe löschen</button>}
  {message&&<p role="status" className="settings-note">{message}</p>}
  <p className="settings-note">Die Auswertung basiert auf Sitzungs-Telemetrie, nicht auf direkten CPU-/GPU-Messungen. Ergebnisse bleiben nur während dieser Ansicht gespeichert. Ein Test verändert vorübergehend global die Renderqualität; die Rückstellung erfolgt beim Abschluss, Abbruch oder Verlassen der Ansicht.</p>
 </section>;
}
