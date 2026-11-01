'use client';
import {useState,useSyncExternalStore} from 'react';
import {subscribeRealGlbV832,getRealGlbV832,getRealGlbServerV832,startRealGlbV832,stopRealGlbV832,
 clearRealGlbV832,nextRealGlbCountV832,compareRealGlbV832,exportRealGlbV832} from './realGlbConcertBenchmarkV832';
/** Guided live measurement; does not fabricate GLB assets or device comparisons. */
export function RealGlbBenchmarkPanelV832({enabled=true}:{enabled?:boolean}){
 const s=useSyncExternalStore(subscribeRealGlbV832,getRealGlbV832,getRealGlbServerV832);
 const [error,setError]=useState('');
 const comparison=compareRealGlbV832(s);
 const download=()=>{
  try{
   const blob=new Blob([JSON.stringify({...exportRealGlbV832(s),exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;
   a.download='sonic-display-v832-real-glb-benchmark.json';document.body.appendChild(a);a.click();a.remove();
   URL.revokeObjectURL(url);setError('');
  }catch{setError('Bericht konnte nicht exportiert werden.');}
 };
 return <section aria-label="V832 Real GLB Konzertbenchmark" style={{display:'grid',gap:9}}>
  <b>V832 · Real GLB Concert Benchmark 2.0</b>
  <small>Nur echte Renderloop-Messfenster mit nachweislich sichtbaren, geriggten SkinnedMeshes in allen
   Performer-Slots. GLB-Dateiherkunft, GPU-Zeit, VRAM und tatsächliche GPU-Auslastung können aus diesen
   Messwerten nicht bestätigt werden.</small>
  {!enabled&&<small role="alert">Zuerst die Live-Messung im V826 Concert Quality Dashboard einschalten.</small>}
  <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
   <button type="button" disabled={!enabled||s.active} onClick={startRealGlbV832}>Live-Benchmark starten</button>
   <button type="button" disabled={!s.active} onClick={stopRealGlbV832}>Stoppen</button>
   <button type="button" onClick={clearRealGlbV832}>Zurücksetzen</button>
   <button type="button" onClick={download}>JSON exportieren</button>
  </div>
  {error&&<small role="alert">{error}</small>}
  <div role="status">{s.notice} {s.active?`Nächster Fall: ${nextRealGlbCountV832(s)} Performer.`:''}</div>
  {s.progress&&<div>{s.progress.count} Rigs · {s.progress.seconds.toFixed(1)} / {s.progress.targetSeconds.toFixed(0)} s
   <progress style={{display:'block',width:'100%'}} max={s.progress.targetSeconds} value={s.progress.seconds}/></div>}
  <div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:12,textAlign:'left'}}>
   <thead><tr><th>Rigs</th><th>FPS</th><th>Ø ms</th><th>P95*</th><th>Slow</th><th>Calls</th><th>Mesh</th><th>Vertices</th><th>Geo/Textures</th></tr></thead>
   <tbody>{([1,2,4] as const).map(n=>{const r=s.results[n];return <tr key={n}>
    <td>{n}</td><td>{r?.fps.toFixed(1)??'–'}</td><td>{r?.avgFrameMs.toFixed(1)??'–'}</td>
    <td>{r?.worstWindowP95Ms.toFixed(1)??'–'}</td><td>{r?`${(r.slowFrameShare*100).toFixed(1)} %`:'–'}</td>
    <td>{r?.avgDrawCalls??'–'}</td><td>{r?.maxSkinnedMeshes??'–'}</td><td>{r?.maxSkinnedVertices??'–'}</td>
    <td>{r?`${r.peakGeometries}/${r.peakTextures}`:'–'}</td>
   </tr>})}</tbody>
  </table></div>
  <small>{comparison.reason}</small>
  {comparison.comparable&&<small>4/1-FPS-Verhältnis: {comparison.fps4to1?.toFixed(1)}.
   Diese Zahl ist kein GPU-Benchmark anderer Geräte.</small>}
  <small>Pro Besetzung werden 15 Sekunden mit identischem Song, Qualitätsprofil, gleicher Auflösung
   und unveränderter Effektkonfiguration erfasst. Besetzung wird manuell umgestellt; tatsächliche sichtbare
   Rigs werden automatisch im laufenden Renderer geprüft. Pausen, fehlende Rigs, Sprünge und Änderungen
   setzen das jeweilige Messfenster zurück. *P95 zeigt den schlechtesten Fenster-P95, keinen Gesamt-P95.
   Renderer-Geometrien/Texturen sind Ressourcenanzahlen, keine Speichergröße.</small>
 </section>;
}
