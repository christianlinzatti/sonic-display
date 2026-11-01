'use client';
/** Local-only V788 profile audit. No external uploads or automatic live setting changes. */
import {useState} from 'react';
import {reviewConcertGovernorV788,type GovernorReviewV788} from '@/services/monitoring/concertGovernorReviewV788';
import type {GovernorTargetV788} from '@/services/monitoring/concertQualityGovernorV788';
export function ConcertGovernorReviewV788(){
 const [runs,setRuns]=useState<unknown>(null),[target,setTarget]=useState<GovernorTargetV788>(45),[error,setError]=useState('');
 const review:GovernorReviewV788|null=runs!==null?reviewConcertGovernorV788(runs,target):null;
 async function load(file:File|undefined){setError('');setRuns(null);if(!file)return;
  if(file.size>30*1024*1024){setError('Datei zu groß (maximal 30 MB)');return}
  try{const value=JSON.parse(await file.text());setRuns(Array.isArray(value)?value:value?.runs)}catch(e){setError('Ungültige JSON-Datei: '+String(e))}}
 return <main style={{padding:24,minHeight:'100vh',background:'#101728',color:'#f6f8ff',fontFamily:'system-ui'}}>
  <h1>V788 · Intelligent Concert Quality Governor</h1>
  <p>Priorität: Lyrics, Mundanimation, Sänger und Kamera schützen; zuerst dekorative DanceFX, sekundäre Lichter und Hintergrundreaktion reduzieren. Der Live-Konzertmodus wird nicht umgestellt.</p>
  <p>Messbasis: vier echte Browserläufe (off/on/on/off), sechs Szenen je Lauf, 2 × 240 Frames je Szene. Keine FPS-Schätzwerte.</p>
  <label>FPS-Ziel <select value={target} onChange={e=>setTarget(Number(e.target.value) as GovernorTargetV788)}>{[30,45,60].map(n=><option key={n} value={n}>{n} FPS</option>)}</select></label>
  <p><label>Lokale <code>artifacts/v788/runs.json</code> öffnen: <input type="file" accept=".json,application/json" onChange={e=>void load(e.currentTarget.files?.[0])}/></label></p>
  {error&&<p role="alert">{error}</p>}
  {review&&<section><h2>{review.status==='ready'?'Vergleichbare GPU-Messungen':'Nicht vergleichbar / unvollständig'}</h2>
   {review.issues.map((issue,i)=><p role="alert" key={i}>{issue}</p>)}
   {review.rows.length>0&&<div style={{overflowX:'auto'}}><table style={{borderCollapse:'collapse',fontSize:13}}><thead><tr>{['Bühne','Avatare','FPS off/on','P95 ms off/on','Draw Calls off/on','Reduzierte Frames L1/L2','Wechsel','Ziel erreicht'].map(h=><th key={h} style={{padding:8,textAlign:'left'}}>{h}</th>)}</tr></thead>
    <tbody>{review.rows.map(row=><tr key={row.id}>{[row.id,row.avatars,`${row.fpsOff} / ${row.fpsOn}`,`${row.p95Off} / ${row.p95On}`,`${row.callsOff} / ${row.callsOn}`,`${row.levelOneFrames} / ${row.levelTwoFrames}`,row.switches,row.reachedTarget?'Ja':'Nein'].map((v,i)=><td key={i} style={{padding:8,borderTop:'1px solid #586077'}}>{v}</td>)}</tr>)}</tbody></table></div>}
   {review.rows.flatMap(row=>row.notes.map(n=><p key={row.id+n}>{row.id}: {n}</p>))}
   <h3>Prüfgrenzen</h3>{review.notes.map(n=><p key={n}>{n}</p>)}
  </section>}
 </main>;
}
