'use client';
/** V1003: plan and approve a bounded *local* virtual improvement. Optional AI
 * reviews only aggregate QA text; it never generates executable patches. */
import {useEffect,useRef,useState} from 'react';
import {useConcertInspectorV801} from './concertExperienceInspectorStoreV801';
import {useConcertQualityV466} from './concertQualityStoreV466';
import {useConcertGovernorV999} from './concertPerformanceGovernorStoreV999';
import {reviewConcertQualityV1002,aiConcertQaPayloadV1002,normalizeQaAiResponseV1002,
 type QaAiResponseV1002} from './concertQualityAssuranceV1002';
import {planAutoImprovementV1003,canCommitAutoImprovementV1003,
 canUndoAutoImprovementV1003,type AutoImprovementPreviewV1003}
 from './autoImprovementDirectorV1003';
import type {TouchValuesV1001,TouchContextV1001,TouchLaneV1001}
 from './interactiveConcertControlV1001';

const names:Record<TouchLaneV1001,string>={stage:'Bühnenregie',camera:'Kamera',
 dance:'Tanz',lights:'Virtuelles Licht'};
export function AutoImprovementDirectorV1003({context,current,onChange,progressMs}: {
 context:TouchContextV1001;current:TouchValuesV1001;
 onChange:(v:TouchValuesV1001)=>void;progressMs:number;
}){
 const show=useConcertInspectorV801();
 const render=useConcertQualityV466();
 const governor=useConcertGovernorV999();
 const [now,setNow]=useState(0);
 const [preview,setPreview]=useState<AutoImprovementPreviewV1003|null>(null);
 const [undo,setUndo]=useState<AutoImprovementPreviewV1003|null>(null);
 const [message,setMessage]=useState('');
 const [ai,setAi]=useState<QaAiResponseV1002|null>(null);
 const [busy,setBusy]=useState(false);
 const pending=useRef<AbortController|null>(null);
 const sequence=useRef(0);
 useEffect(()=>{
  setNow(Date.now());const timer=window.setInterval(()=>setNow(Date.now()),1000);
  return()=>{window.clearInterval(timer);sequence.current++;
   pending.current?.abort();};
 },[]);
 const report=reviewConcertQualityV1002({now,planAt:show.at,playing:show.playing,
  plan:show.report,renderAt:render.at,fps:render.fps,p95FrameMs:render.p95FrameMs,
  warnings:render.assessment?.warnings??[],targetFps:governor.targetFps,
  governorAt:governor.at,governorActive:governor.active});
 const evidence={planTrackId:show.report.trackId,planAt:show.at,renderAt:render.at,
  now,progressMs};
 const permitted=report.planAvailable&&show.report.trackId===context.trackId;
 const commitOk=canCommitAutoImprovementV1003(preview,current,context,evidence,report);
 const undoOk=canUndoAutoImprovementV1003(undo,current,context);
 const create=()=>{
  const proposal=planAutoImprovementV1003(report,current,context,evidence);
  setPreview(proposal);setMessage(proposal?
   'Vorschlag erstellt. Prüfe jede Änderung vor der Übernahme.':
   'Keine aktuelle, songgebundene Qualitätsdiagnose verfügbar.');
 };
 const ask=async()=>{
  pending.current?.abort();const controller=new AbortController();pending.current=controller;
  const id=++sequence.current;setBusy(true);setAi(null);setMessage('');
  try{
   const response=await fetch('/api/ai/concert-qa',{method:'POST',credentials:'same-origin',
    cache:'no-store',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(aiConcertQaPayloadV1002(report)),signal:controller.signal});
   const data:unknown=await response.json();
   if(id!==sequence.current||controller.signal.aborted)return;
   if(!response.ok)throw Error('service');
   const result=normalizeQaAiResponseV1002((data as {review?:unknown}).review);
   if(!result)throw Error('invalid response');
   setAi(result);
  }catch{if(id===sequence.current&&!controller.signal.aborted)
   setMessage('KI momentan nicht erreichbar; die lokale Analyse bleibt verfügbar.');}
  finally{if(id===sequence.current){setBusy(false);pending.current=null;}}
 };
 return <fieldset className="concert-touch-v1001" data-v1003-auto-improvement
  aria-label="V1003 AI Auto-Improvement Director">
  <legend>V1003 · AI Auto-Improvement Director</legend>
  <p>Erkennt aus aktuellen V1002-Befunden konkrete Verbesserungen. Nur <b>gemessene</b>
   Performanceprobleme erlauben eine vorsichtige Reduktion bereits aktiver virtueller Regler.
   Kamera- und Timing-Befunde bleiben überprüfbare Empfehlungen.</p>
  <p><small>Struktur: {permitted?`${report.structureScore}/100 (Plan)`:'nicht bestätigt'}
   {' · '}Browser-FPS: {report.runtimeAvailable?report.measuredFps:'nicht gemessen'}
   {' · '}P95: {report.runtimeAvailable?`${report.measuredP95} ms`:'nicht gemessen'}</small></p>
  <div className="concert-touch-actions-v1001">
   <button type="button" disabled={!permitted} onClick={create}>Verbesserungen prüfen</button>
   <button type="button" disabled={busy||!permitted} onClick={()=>void ask()}>
    {busy?'KI analysiert …':'KI-Einordnung anfordern'}</button>
  </div>
  {preview&&<div className="concert-touch-preview-v1001" aria-live="polite">
   <strong>Qualitätsvorschläge ({preview.advice.length})</strong>
   {preview.advice.length?<ul>{preview.advice.map(a=><li key={a.code}>
    <b>{a.label}</b> · {a.detail} <small>{a.automatable?'Messbasierter Vorschlag':'Nur Planung / Kontrolle'}</small>
   </li>)}</ul>:<p>Keine relevanten Qualitätsmängel aus der aktuellen Diagnose ableitbar.</p>}
   <strong>Vorgeschlagene virtuelle Änderungen</strong>
   {preview.diffs.length?<ul>{preview.diffs.map(d=><li key={d.lane}>
    {names[d.lane]}: {d.before} % → {d.after} %</li>)}</ul>:
    <p>Keine sichere automatische Änderung. Bei fehlender Messung, gesperrter Show oder
     ausschließlich dramaturgischen Befunden bleibt alles unverändert.</p>}
   <p><small>Die Vorschau gilt maximal 20 Sekunden und nur für denselben Song, ohne Seek,
    manuelle Regie oder Zwischenänderungen. Keine neuen Cues, keine Hardwaresteuerung.</small></p>
   <button type="button" disabled={!commitOk} onClick={()=>{
    if(!canCommitAutoImprovementV1003(preview,current,context,evidence,report)){
     setPreview(null);setMessage('Vorschau veraltet. Erneut prüfen.');return;
    }
    onChange(preview.after);setUndo(preview);setPreview(null);
    setMessage('Vorsichtig reduzierte virtuelle Regler übernommen. Rückgängig verfügbar.');
   }}>Geprüfte Änderungen übernehmen</button>
  </div>}
  {undo&&<button type="button" disabled={!undoOk} onClick={()=>{
   if(!canUndoAutoImprovementV1003(undo,current,context)){
    setUndo(null);setMessage('Regler oder Song seitdem verändert; nichts überschrieben.');return;
   }
   onChange(undo.before);setUndo(null);setMessage('Letzte V1003-Anpassung zurückgenommen.');
  }}>Letzte Optimierung rückgängig</button>}
  {ai&&<div role="status"><strong>Optionale KI-Einordnung – nur Text</strong>
   <p>{ai.summary}</p><ul>{ai.suggestions.map((x,i)=><li key={i}>{x}</li>)}</ul>
   <small>Die KI hat keinen Zugriff auf die Freigabe, die Regler oder ein Gerät. Die
    lokal geprüften Änderungen werden niemals aus KI-Text abgeleitet.</small>
  </div>}
  {message&&<p role="status" aria-live="polite">{message}</p>}
  <small>KI-Aufruf nur nach Klick: ausschließlich aggregierte Diagnosecodes und Messwerte,
   keine Songtitel, Lyrics, Tokens oder Audiodaten. Erfordert konfigurierte OpenAI-API;
   die lokalen Vorschläge funktionieren offline.</small>
 </fieldset>;
}
