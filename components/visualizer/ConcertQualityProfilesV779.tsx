'use client';
/** Analyze real, locally stored V779 runs; no WebGL scene and no network upload. */
import {useMemo,useState} from 'react';
import {assessProfileSweepV779,QUALITY_PROFILE_IDS_V779,QUALITY_PROFILES_V779,type AvatarCountV779,type TargetFpsV779} from '@/services/monitoring/concertQualityProfilesV779';
export function ConcertQualityProfilesV779(){
 const [runs,setRuns]=useState<unknown>(null),[target,setTarget]=useState<TargetFpsV779>(60),[avatars,setAvatars]=useState<AvatarCountV779>(4),[message,setMessage]=useState('');
 const summary=useMemo(()=>runs===null?null:assessProfileSweepV779(runs,target,avatars),[runs,target,avatars]);
 async function read(file:File|undefined){
  if(!file)return;
  if(file.size>12*1024*1024){setMessage('Die JSON-Datei ist größer als 12 MB.');return}
  try{const value:unknown=JSON.parse(await file.text());
   const list=Array.isArray(value)?value:(value as {runs?:unknown})?.runs;
   setRuns(list);setMessage(`${file.name} wurde ausschließlich lokal eingelesen.`);
  }catch{setRuns(null);setMessage('Kein gültiges JSON.');}
 }
 function save(){if(!summary)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(summary,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='sonic-v779-quality-sweep-analysis.json';link.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <main style={{padding:18,maxWidth:1080,margin:'0 auto',fontFamily:'system-ui'}} data-v779-quality-sweep>
  <h1>V779 · Konzert-Qualitätsprofil-Testreihe</h1>
  <p>Diese Ansicht bewertet echte V777-Browsermessungen mit drei unterschiedlichen Effektprofilen. Keine Messungen werden erfunden, nichts wird hochgeladen und keine Live-Show-Einstellung wird ohne deine Zustimmung verändert.</p>
  <p>Starte die automatisierten Testläufe mit <code>npm run benchmark:v779:sweep</code> und öffne danach <code>artifacts/v779/runs.json</code>. Die einzelnen Szenen enthalten weiterhin fest vorgegebene Testlyrics und synthetische Beat-Signale.</p>
  <section style={{display:'flex',gap:16,flexWrap:'wrap',alignItems:'end'}}>
   <label style={{display:'grid',gap:5}}>Echte Browserläufe (runs.json)
    <input type="file" accept=".json,application/json" onChange={e=>void read(e.currentTarget.files?.[0])}/>
   </label>
   <label style={{display:'grid',gap:5}}>FPS-Ziel
    <select value={target} onChange={e=>setTarget(Number(e.target.value) as TargetFpsV779)}><option value={30}>30 FPS</option><option value={45}>45 FPS</option><option value={60}>60 FPS</option></select>
   </label>
   <label style={{display:'grid',gap:5}}>Darsteller
    <select value={avatars} onChange={e=>setAvatars(Number(e.target.value) as AvatarCountV779)}><option value={2}>2 GLBs</option><option value={4}>4 GLBs</option></select>
   </label>
  </section>
  <p role="status">{message||'Keine Messberichte importiert.'}</p>
  <section><h2>Getestete Profile</h2>
   <ul>{QUALITY_PROFILE_IDS_V779.map(key=><li key={key}><strong>{QUALITY_PROFILES_V779[key].label}</strong> – Bühneneffekte, Lichtreaktion und Animationstakt angepasst (alle GLB-Polygone bleiben erhalten).</li>)}</ul>
  </section>
  {summary?.status==='blocked'&&<section role="alert"><h2>Messung nicht auswertbar</h2><ul>{summary.issues.map((s,i)=><li key={i}>{s}</li>)}</ul><p>Ohne echte, vergleichbare Messwerte wird keine Qualitätsvariante empfohlen.</p></section>}
  {summary?.status==='ready'&&<>
   <h2>Ergebnis für {avatars} GLBs / {target} FPS</h2>
   <p><strong>{summary.recommendedProfile?QUALITY_PROFILES_V779[summary.recommendedProfile].label:'Keine Variante erfüllt das Ziel durchgängig.'}</strong></p>
   <p>Renderer: {summary.renderer} · {summary.rounds} Messrunden · {summary.assetsMode==='reference'?'Kleine Referenz-GLB (keine Hardwareentscheidung)':'Eigene GLB-Modelle'}</p>
   {avatars===4&&<p>Alternative mit zwei Avataren: {summary.twoAvatarAlternative?QUALITY_PROFILES_V779[summary.twoAvatarAlternative].label:'Kein geprüftes Profil'}</p>}
   <div style={{overflowX:'auto'}}><table style={{borderCollapse:'collapse',width:'100%'}}>
    <thead><tr>{['Profil','Bühne','GLBs','Min. FPS','Schlechteste P95','Median Draw Calls','Ergebnis'].map(h=><th key={h} style={{textAlign:'left',padding:8,borderBottom:'1px solid currentColor'}}>{h}</th>)}</tr></thead>
    <tbody>{summary.rows.filter(r=>r.avatars===avatars).map(r=><tr key={`${r.profile}-${r.avatars}-${r.stage}`}>
     <td style={{padding:7}}>{r.profile}</td><td style={{padding:7}}>{r.stage}</td><td style={{padding:7}}>{r.avatars}</td>
     <td style={{padding:7}}>{r.minFps.toFixed(1)}</td><td style={{padding:7}}>{r.worstP95Ms.toFixed(1)} ms</td>
     <td style={{padding:7}}>{r.medianCalls.toFixed(0)}</td><td style={{padding:7}}>{r.unstable?'Instabil':r.passed?'Ziel erreicht':'Verfehlt'}</td>
    </tr>)}</tbody></table></div>
   <h3>Messgrenzen</h3><ul>{summary.notes.map((s,i)=><li key={i}>{s}</li>)}</ul>
   <button onClick={save} type="button">Auswertung als JSON speichern</button>
  </>}
 </main>;
}
