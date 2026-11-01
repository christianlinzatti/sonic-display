'use client';
/** V785 local JSON inspection; no remote upload, no changing live-stage settings. */
import {useState} from 'react';
import {reviewLyricsRunsV785,type LyricsReviewV785} from '@/services/monitoring/lyricsReviewV785';
export function LyricsProtectionReviewV785(){
 const [review,setReview]=useState<LyricsReviewV785|null>(null),[error,setError]=useState('');
 async function open(file:File|undefined){setError('');setReview(null);if(!file)return;
  if(file.size>20*1024*1024){setError('Maximale JSON-Größe: 20 MB');return}
  try{const value=JSON.parse(await file.text());setReview(reviewLyricsRunsV785(Array.isArray(value)?value:value?.runs))}
  catch(e){setError('Ungültige JSON-Datei: '+String(e))}}
 return <main style={{padding:24,minHeight:'100vh',background:'#0c1425',color:'#f2f7ff',fontFamily:'system-ui'}}>
  <h1>V785 · Lyrics Performance Protection</h1>
  <p>Vergleicht echte GPU-Konzertszenen mit identischer Kameraregie: herkömmlicher 3D-Text → geschützter Text → geschützter Text → herkömmlicher Text.</p>
  <p>Sechs Szenen (Cyberpunk, Rock, Galaxy × 2/4 GLBs), zwei Durchläufe und 240 Frames je Messung. Es werden tatsächliche 3D-Textgrenzen projiziert; Darsteller sind nur Näherungspositionen.</p>
  <label>Lokale <code>artifacts/v785/runs.json</code> öffnen: <input type="file" accept=".json,application/json" onChange={e=>void open(e.currentTarget.files?.[0])}/></label>
  {error&&<p role="alert">{error}</p>}
  {review&&<section><h2>{review.status==='ready'?'Vollständige vergleichbare Messungen':'Nicht vergleichbar / unvollständig'}</h2>
   {review.issues.map((x,i)=><p key={i} role="alert">{x}</p>)}
   {!!review.rows.length&&<div style={{overflowX:'auto'}}><table style={{borderCollapse:'collapse',fontSize:13,width:'100%'}}><thead><tr>
    {['Bühne','GLBs','Text außerhalb % off/on','Proxy-Überlappung % off/on','Zeilen-Lag % off/on','Sprünge off/on','FPS off/on','P95 ms off/on','Hinweise'].map(x=><th key={x} style={{padding:8,textAlign:'left'}}>{x}</th>)}
   </tr></thead><tbody>{review.rows.map(row=><tr key={row.id}>
    {[row.id,row.avatars,`${row.clipOff} / ${row.clipOn}`,`${row.proxyOverlapOff} / ${row.proxyOverlapOn}`,`${row.lagOff} / ${row.lagOn}`,`${row.jumpsOff} / ${row.jumpsOn}`,`${row.fpsOff} / ${row.fpsOn}`,`${row.p95Off} / ${row.p95On}`,row.warnings.join('; ')||'–'].map((v,i)=><td key={i} style={{padding:8,borderTop:'1px solid #465064'}}>{v}</td>)}
   </tr>)}</tbody></table></div>}
   <h3>Grenzen</h3>{review.notes.map(n=><p key={n}>{n}</p>)}
  </section>}
 </main>;
}
