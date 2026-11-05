'use client';
/** Read-only diagnostics. AI can explain aggregate findings, NEVER modify a show. */
import {useEffect,useRef,useState} from 'react';
import {useConcertInspectorV801} from './concertExperienceInspectorStoreV801';
import {useConcertQualityV466} from './concertQualityStoreV466';
import {useConcertGovernorV999} from './concertPerformanceGovernorStoreV999';
import {aiConcertQaPayloadV1002,normalizeQaAiResponseV1002,reviewConcertQualityV1002,
 type QaAiResponseV1002} from './concertQualityAssuranceV1002';
export function ConcertQualityAssurancePanelV1002({now}:{now:number}){
 const show=useConcertInspectorV801();
 const render=useConcertQualityV466();
 const governor=useConcertGovernorV999();
 const report=reviewConcertQualityV1002({now,planAt:show.at,playing:show.playing,
  plan:show.report,renderAt:render.at,fps:render.fps,p95FrameMs:render.p95FrameMs,
  warnings:render.assessment?.warnings??[],targetFps:governor.targetFps,
  governorAt:governor.at,governorActive:governor.active});
 const [feedback,setFeedback]=useState<QaAiResponseV1002|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const request=useRef<AbortController|null>(null);
 const seq=useRef(0);
 const track=report.planAvailable?show.report.trackId:'';
 useEffect(()=>{seq.current++;request.current?.abort();request.current=null;
  setBusy(false);setFeedback(null);setMessage('');
  return()=>{seq.current++;request.current?.abort();};},[track]);
 const ask=async()=>{
  request.current?.abort();const controller=new AbortController();request.current=controller;
  const id=++seq.current;setBusy(true);setFeedback(null);setMessage('');
  try{
   const response=await fetch('/api/ai/concert-qa',{method:'POST',credentials:'same-origin',
    cache:'no-store',headers:{'Content-Type':'application/json'},signal:controller.signal,
    body:JSON.stringify(aiConcertQaPayloadV1002(report))});
   const raw:unknown=await response.json();
   if(id!==seq.current||controller.signal.aborted)return;
   if(!response.ok)throw Error('Service unavailable');
   const normalized=normalizeQaAiResponseV1002((raw as {review?:unknown}).review);
   if(!normalized)throw Error('Invalid AI review');
   setFeedback(normalized);
  }catch{if(id===seq.current&&!controller.signal.aborted)
   setMessage('KI-Auswertung derzeit nicht verfügbar. Lokale Empfehlungen bleiben sichtbar.');}
  finally{if(id===seq.current){request.current=null;setBusy(false);}}
 };
 return <section className="v751-measurements" data-v1002-quality-assurance aria-label="V1002 Concert Quality Assurance">
  <h3>V1002 · Concert Quality Assurance</h3>
  <p>Unabhängige Qualitätskontrolle für <b>geplante Struktur</b> und <b>gemessene Render-Performance</b>. Diese Ansicht ändert keine Konzertregler.</p>
  <div className="v751-summary">
   <div><small>Strukturwert (nur Plan)</small><strong>{report.structureScore===null?'Nicht bewertet':`${report.structureScore}/100`}</strong></div>
   <div><small>Bestätigte Szenen</small><strong>{report.planAvailable?report.sceneCount:'–'}</strong></div>
   <div><small>Kamera-Intents im Plan</small><strong>{report.cameraIntentCount??'–'}</strong></div>
   <div><small>Live-Performance</small><strong>{report.runtimeAvailable?`${report.measuredFps} FPS`:'Nicht gemessen'}</strong></div>
  </div>
  <p><small>Performance-Ziel: {report.targetFps} FPS · P95: {report.measuredP95===null?'nicht gemessen':`${report.measuredP95} ms`}. FPS sind aus Frame-Abständen berechnet, nicht GPU-Zeiten. Strukturpunkte sind kein Gesamtqualitätswert.</small></p>
  <h4>Priorisierte Befunde ({report.findings.length})</h4>
  <ol>{report.findings.map(f=><li key={f.code}>
   <strong>{f.severity==='important'?'Wichtig':f.severity==='improve'?'Verbessern':'Hinweis'} · {f.title}</strong>
   <small> ({f.evidence==='plan'?'Szenenplanung':f.evidence==='runtime'?'Live-Messung':'Nicht gemessen'})</small>
   <p>{f.recommendation}</p>
  </li>)}</ol>
  <p><strong>Nicht objektiv geprüft:</strong> {report.unverified.join(' · ')}.</p>
  <div className="immersive-ai-actions-v982">
   <button type="button" onClick={()=>void ask()} disabled={busy||(!report.planAvailable&&!report.runtimeAvailable)}>
    {busy?'KI prüft Diagnose …':'KI-Empfehlungen anfordern'}</button>
  </div>
  <small>Nur aggregierte Diagnosecodes, Szenenzahl und gemessene Kennzahlen werden nach deinem Klick übertragen. Keine Titel, Song-IDs, Lyrics, Audiodaten oder Spotify-Tokens. API-Kosten möglich. Ohne KI ist die lokale Auswertung vollständig nutzbar.</small>
  {message&&<p role="status">{message}</p>}
  {feedback&&<div role="status" aria-live="polite"><strong>Optionale KI-Einordnung</strong>
   <p>{feedback.summary}</p><ul>{feedback.suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul>
   <small>KI-Text ist ein Vorschlag, kein technischer Messnachweis. Es werden keine Cues automatisch verändert.</small>
  </div>}
 </section>;
}
