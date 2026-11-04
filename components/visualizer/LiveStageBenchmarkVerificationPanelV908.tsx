'use client';
/** V908: renders only the evidence attached to existing V905 measurements. */
import {useMemo} from 'react';
import {exportVerifiedRunsV908,getVerifiedRunsV908,type VerifiedRunV908} from './liveStageBenchmarkProofV908';
import type {BenchmarkRunV905} from './guidedConcertBenchmarkV905';
const laneName={crowd:'Publikum',particles:'Partikel',foam:'Schaum',kinetic:'Kinetik',spectral:'Spektral'};
export function LiveStageBenchmarkVerificationPanelV908({history,proofs}:{history:readonly BenchmarkRunV905[];proofs:readonly VerifiedRunV908[]}){
 const active=useMemo(()=>getVerifiedRunsV908(proofs,history),[proofs,history]);
 const download=()=>{
  const blob=new Blob([exportVerifiedRunsV908(active)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  try{const a=document.createElement('a');a.href=url;a.download='sonic-v908-live-scene-proof.json';a.click();}
  finally{URL.revokeObjectURL(url);}
 };
 return <section aria-label="V908 Live Avatar & FX Benchmark Verification" style={{border:'1px solid #7778',borderRadius:10,padding:11,display:'grid',gap:8,margin:'10px 0'}}>
  <b>V908 · Live Avatar & FX Benchmark Verification</b>
  <small>Nachweis aus dem echten 3D-Szenengraphen (V830) und den V826-Effektmengen, synchron zu abgeschlossenen V905-Messfenstern. Kein zusätzlicher Render- oder Telemetrie-Loop.</small>
  <strong>{active.length} überprüfte Benchmark-Durchläufe in dieser Sitzung</strong>
  {!active.length?<small>Benchmark ausdrücklich starten. V908 prüft während jedes Messfensters automatisch die sichtbaren, geriggten Bühnen-Avatare und beobachtbare FX-Lanes.</small>:active.map((r,i)=><div key={r.runId} style={{border:'1px solid #7776',borderRadius:8,padding:9}}>
   <b>Durchlauf {i+1} · {r.verdict==='verified-visible-rigs'?`${r.castCount} sichtbare, geriggte Avatare bestätigt`:'Besetzung nicht durchgängig nachgewiesen'}</b>
   <small style={{display:'block'}}>{r.confirmed}/{r.requested} geriggte Messfenster bestätigt · Szene #{r.sceneIndex+1} · Profil {r.tier}</small>
   <small style={{display:'block'}}>Beobachtete FX: {r.fxLanes.length?r.fxLanes.map(k=>laneName[k]).join(', '):'Keine der erfassten Kategorien'} · FX-Budget aktiv: {r.fxActiveWindows}/{r.seen} Fenster</small>
   <small style={{display:'block'}}>{r.note}</small>
  </div>)}
  <button type="button" className="concert-transition-export-v884" disabled={!active.length} onClick={download}>V908 Szenennachweise als JSON exportieren</button>
  <small>Geriggte SkinnedMeshes sind kein GLB-Dateiherkunftsnachweis. Beobachtete FX-Elemente belegen keine vollständige Licht-/Laser-/LED-Wirkung. V907-FX-Labels bleiben manuelle Angaben; Geräte-/GPU-Performance lässt sich daraus nicht vorhersagen.</small>
 </section>;
}
