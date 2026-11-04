'use client';
/** V903 – manual-only observational comparison and explicit two-click rollback.
 * Receives existing V901/V826 snapshots; no independent sampling or writes.
 */
import {useState} from 'react';
import type {AdvisorConfigV902} from './concertQualityAdvisorV902';
import {canRestoreConcertReviewV903,exportConcertReviewV903,reviewDeltaV903,
 type ConcertReviewV903,type ReviewWindowV903} from './concertQualityReviewV903';
interface Props {review:ConcertReviewV903|null;controls:AdvisorConfigV902;onRestore:()=>void}
const number=(n:number)=>n.toFixed(1);
const stateTitle:Record<NonNullable<ConcertReviewV903>['state'],string>={
 'awaiting-change':'Übernahme wird geprüft','sampling':'Live-Nachmessung','ready':'Messfenster verglichen',
 'unavailable':'Vergleich nicht verfügbar','invalid':'Vergleich ungültig',
 'restoring':'Rücksetzen wird geprüft','restored':'Ursprüngliche Einstellung wiederhergestellt'};
function Metrics({name,window}: {name:string;window:ReviewWindowV903|null}){
 return <div style={{border:'1px solid #7776',padding:9,borderRadius:8,minWidth:145,flex:1}}>
  <b>{name}</b>{window?<div style={{display:'grid',gap:3,marginTop:5}}>
   <span>{number(window.fps)} FPS</span><span>Ø {number(window.frameMs)} ms</span>
   <span>Ø der P95-Fenster {number(window.p95FrameMs)} ms</span>
   <span>FX-Druck {number(window.pressure*100)} %</span>
   <small>{window.samples} getrennte Live-Messfenster · {window.targetFps}-FPS-Ziel · {window.tier}</small>
  </div>:<small style={{display:'block',marginTop:6}}>Keine ausreichenden Live-Messfenster.</small>}</div>;
}
export function ConcertQualityReviewPanelV903({review,controls,onRestore}:Props){
 const [undoFor,setUndoFor]=useState<number|null>(null);
 const undoPreview=review!==null&&undoFor===review.id;
 const canUndo=canRestoreConcertReviewV903(review,controls);
 const download=()=>{
  if(!review)return;
  const url=URL.createObjectURL(new Blob([exportConcertReviewV903(review)],{type:'application/json;charset=utf-8'}));
  try{const a=document.createElement('a');a.href=url;a.download='sonic-quality-review-v903.json';a.click();}
  finally{URL.revokeObjectURL(url);}
 };
 const diff=reviewDeltaV903(review);
 return <fieldset className="concert-director-options-v895 concert-quality-review-v903" aria-label="Concert Quality Before After Review">
  <legend>V903 · Concert Quality Before/After Review</legend>
  <p style={{margin:'4px 0 8px'}}>Nach einer ausdrücklich bestätigten V902-Änderung werden frische V826-Messfenster verglichen. Keine automatische Optimierung.</p>
  {!review?<small>Noch keine bestätigte V902-Optimierung in dieser Sitzung. Für einen Vergleich zunächst einige Sekunden laufende V826-Telemetrie sammeln und anschließend eine Vorschau bestätigen.</small>:<>
   <div role="status" aria-live="polite"><strong>{stateTitle[review.state]}</strong> · <small>{review.reason}</small></div>
   <small style={{display:'block',margin:'7px 0'}}>Einstellung: {review.patch.target}.{review.patch.field} · {String(review.patch.before)} → {String(review.patch.value)} · Songabschnitt #{review.sceneIndex+1}</small>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'8px 0'}} aria-label="V903 Vorher-Nachher-Messfenster">
    <Metrics name="Vorher" window={review.before}/><Metrics name="Nachher" window={review.after}/>
   </div>
   {diff&&<div style={{margin:'5px 0 9px'}}>
    <b>Beobachtete Differenz:</b> FPS {diff.fps>=0?'+':''}{number(diff.fps)},
    Ø Framezeit {diff.frameMs>=0?'+':''}{number(diff.frameMs)} ms,
    P95-Fenster {diff.p95FrameMs>=0?'+':''}{number(diff.p95FrameMs)} ms.
    <small style={{display:'block'}}>Keine Kausalitätsaussage: Die Belastung der Szene kann trotz gleicher Einstellungen schwanken.</small>
   </div>}
   {!undoPreview&&<button type="button" className="concert-transition-export-v884" disabled={!canUndo}
    onClick={()=>setUndoFor(review?.id??null)}>Rücksetzen prüfen</button>}
   {undoPreview&&<section aria-label="V903 Rücksetzen bestätigen" style={{border:'1px solid #b4a17b',borderRadius:9,padding:9,margin:'8px 0'}}>
    <strong>Ursprüngliche Einstellung wiederherstellen?</strong>
    <p style={{margin:'5px 0'}}>Nur {review.patch.target}.{review.patch.field}: {String(review.patch.value)} → {String(review.patch.before)}. Es werden keine manuellen Timelines zurückgesetzt.</p>
    <button type="button" disabled={!canUndo} className="concert-transition-export-v884" onClick={()=>{setUndoFor(null);onRestore();}}>Jetzt ausdrücklich zurücksetzen</button>{' '}
    <button type="button" className="concert-transition-export-v884" onClick={()=>setUndoFor(null)}>Abbrechen</button>
    {!canUndo&&<small style={{display:'block'}}>Einstellung wurde geändert oder deaktiviert. Rücksetzen blockiert.</small>}
   </section>}
   <button type="button" className="concert-transition-export-v884" onClick={download}>V903 Vergleich als JSON exportieren</button>
  </>}
  <small style={{display:'block',marginTop:7}}>V826 misst Renderer-Frame-Abstände, keine GPU-Zeit. Vorher und Nachher werden nur bei identischem FPS-Ziel, Performance-Profil und Songabschnitt verglichen. Zwei Nachmessfenster dienen als Übergangszeit. Alle Messungen bleiben nur während dieser Sitzung im Arbeitsspeicher. Es gibt keine garantierte FPS-Steigerung.</small>
 </fieldset>;
}
