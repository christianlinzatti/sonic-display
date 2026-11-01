'use client';
/** Local-only JSON analysis. No upload, no saved settings, no simulated FPS. */
import {useState} from 'react';
import {reviewCameraRunsV784,type CameraReviewV784} from '@/services/monitoring/cameraReviewV784';
export function CameraSmoothnessReviewV784(){
 const [review,setReview]=useState<CameraReviewV784|null>(null),[error,setError]=useState('');
 async function open(file:File|undefined){setError('');setReview(null);if(!file)return;
  if(file.size>20*1024*1024){setError('Die JSON-Datei darf maximal 20 MB groß sein');return}
  try{const o=JSON.parse(await file.text());setReview(reviewCameraRunsV784(Array.isArray(o)?o:o?.runs));}
  catch(e){setError('JSON ungültig: '+String(e));}}
 return <main style={{padding:24,minHeight:'100vh',background:'#0c1425',color:'#f2f7ff',fontFamily:'system-ui'}}>
  <h1>V784 · Cinematic Camera Smoothness</h1>
  <p>Vergleicht echte WebGL-Kameraaufnahmen: direkte Schnitte → weiche Übergänge → weiche Übergänge → direkte Schnitte.</p>
  <p>Sechs Bühnen-/Avatar-Szenen, jeweils zwei Messdurchläufe und 240 Frames. Gleiche GLBs, GPU und Konfiguration sind Pflicht.</p>
  <label>Lokale <code>artifacts/v784/runs.json</code> wählen: <input type="file" accept=".json,application/json" onChange={e=>void open(e.currentTarget.files?.[0])}/></label>
  {error&&<p role="alert">{error}</p>}
  {review&&<section><h2>{review.status==='ready'?'Vergleichbar':'Nicht vergleichbar / unvollständig'}</h2>
   {review.issues.map((x,i)=><p role="alert" key={i}>{x}</p>)}
   {!!review.rows.length&&<div style={{overflowX:'auto'}}><table style={{borderCollapse:'collapse',fontSize:13,width:'100%'}}><thead><tr>
    {['Bühne','GLBs','Harte Schnitte off/on','P95 Drehungs-Jerk off/on (°)','P95 Positions-Jerk off/on','Lyrics außerhalb % off/on','FPS off/on','Warnungen'].map(t=><th style={{textAlign:'left',padding:8}} key={t}>{t}</th>)}
   </tr></thead><tbody>{review.rows.map(r=><tr key={r.id}>
    {[r.id,r.avatars,`${r.hardCutsOff} / ${r.hardCutsOn}`,`${r.p95RotationJerkOff} / ${r.p95RotationJerkOn}`,`${r.p95PositionJerkOff} / ${r.p95PositionJerkOn}`,`${r.lyricSafeOff} / ${r.lyricSafeOn}`,`${r.fpsOff} / ${r.fpsOn}`,r.warnings.join('; ')||'–'].map((v,i)=><td key={i} style={{padding:8,borderTop:'1px solid #465064'}}>{v}</td>)}
   </tr>)}</tbody></table></div>}
   <h3>Messgrenzen</h3>{review.notes.map(n=><p key={n}>{n}</p>)}
  </section>}
 </main>;
}
