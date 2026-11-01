'use client';
import {useSyncExternalStore} from 'react';
import {subscribeBenchmarkV827,getBenchmarkV827,getBenchmarkServerV827,startBenchmarkV827,stopBenchmarkV827,
 clearBenchmarkV827,nextBenchmarkCountV827,benchmarkAdviceV827} from './concertBenchmarkV827';
/** Guided REAL render-loop capture: no simulated benchmark and no automatic GLB swaps. */
export function ConcertBenchmarkPanelV827({enabled=true}:{enabled?:boolean}){
 const state=useSyncExternalStore(subscribeBenchmarkV827,getBenchmarkV827,getBenchmarkServerV827);
 return <section aria-label="V827 Konzertbenchmark 1 2 4 Performer" style={{display:'grid',gap:8,marginTop:12}}>
  <b>1 / 2 / 4 Performer · Live-Vergleich</b>
  <small>Die laufende Hauptbühne muss geöffnet bleiben; der Song benötigt bestätigte FX-Zeitmarken.
   Für einen fairen Vergleich immer dieselbe Auflösung, dieselben GLB-Modelle bzw. vergleichbare
   Komplexität, denselben Song und dieselben Effekte verwenden. Die erfasste Anzahl ist die konfigurierte
   Besetzung – tatsächlich geladene GLB-Meshes werden nicht gezählt.</small>
  <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
   <button type="button" disabled={!enabled||state.active} onClick={startBenchmarkV827}>Benchmark starten / neu starten</button>
   <button type="button" disabled={!state.active} onClick={stopBenchmarkV827}>Stoppen</button>
   <button type="button" onClick={clearBenchmarkV827}>Ergebnisse löschen</button>
  </div>
  {!enabled&&<small role="alert">Live-Messung im Concert Quality Dashboard aktivieren, um Benchmarks zu erfassen.</small>}
  <div role="status">{state.notice} {state.active&&`Nächste Besetzung: ${nextBenchmarkCountV827(state)??'-'} Performer.`}</div>
  {state.progress&&<div>{state.progress.count} Performer · {state.progress.seconds.toFixed(1)} / {state.progress.targetSeconds.toFixed(0)} s
   <progress max={state.progress.targetSeconds} value={state.progress.seconds} style={{display:'block',width:'100%'}}/></div>}
  <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',fontSize:13}}>
   <thead><tr><th>Performer</th><th>FPS</th><th>Ø ms</th><th>P95*</th><th>Langsam</th><th>Calls</th></tr></thead>
   <tbody>{([1,2,4] as const).map(count=>{const r=state.results[count];return <tr key={count}><td>{count}</td><td>{r?.fps.toFixed(1)??'—'}</td><td>{r?.frameMs.toFixed(1)??'—'}</td>
    <td>{r?.p95FrameMs.toFixed(1)??'—'}</td><td>{r?`${(r.slowFrameShare*100).toFixed(1)} %`:'—'}</td><td>{r?.rendererCalls??'—'}</td></tr>})}</tbody>
  </table></div>
  <small>* P95 ist der höchste Fenster-P95-Wert, kein Gesamt-P95. Draw Calls sind Renderer-Snapshots. Die Ergebnisse gelten nur für dieses Gerät und diesen Browser.</small>
  <small>{benchmarkAdviceV827(state)}</small>
 </section>;
}
