'use client';
/** V589 visual sign-off UI for REAL GLB pose samples. Controlled clip URL/index
 * identity ensures review checkboxes cannot accidentally carry across clips. */
import {useMemo,useState} from 'react';
import type {AdvancedMotionReviewInputV589} from './visualDanceReviewV589';
import {buildVisualDanceReviewV589,emptyVisualDanceChecklistV589,exportDanceReviewV589,
  visualDanceReviewStatusV589,type VisualDanceChecklistV589} from './visualDanceReviewV589';
export function VisualDanceReviewPanelV589({report,durationSeconds,onSeek,hasFollowingClip,sourceLabel}:
 {report:AdvancedMotionReviewInputV589;durationSeconds:number;onSeek:(seconds:number)=>void;hasFollowingClip:boolean;sourceLabel:string}){
 const review=useMemo(()=>buildVisualDanceReviewV589(report,durationSeconds),[report,durationSeconds]);
 const [checks,setChecks]=useState<VisualDanceChecklistV589>(emptyVisualDanceChecklistV589);
 const status=visualDanceReviewStatusV589(checks,hasFollowingClip);
 const update=(name:keyof VisualDanceChecklistV589,value:boolean)=>setChecks(old=>({...old,[name]:value}));
 function exportReport(){
  const safe=(review.clipName||'clip').replace(/[^a-z0-9_-]/gi,'-').slice(0,40);
  const json=JSON.stringify(exportDanceReviewV589(review,checks,hasFollowingClip),null,2);
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  try{const a=document.createElement('a');a.href=url;a.download=`sonic-v589-${safe}-review.json`;a.click();}
  finally{window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }
 return <section className="avatar-metadata-editor" aria-label="V589 Visual Dance Quality Review">
  <h4>V589 · Visual Dance Quality & Real GLB Validation</h4>
  <p><strong>Prüfquelle:</strong> {sourceLabel} · Clip: {review.clipName} · {review.sampleCount} echte, im Browser ausgewertete Posen</p>
  <p><strong>Messhinweise:</strong> {review.counts.slides} mögliche Fußrutsch-Intervalle, {review.counts.jumps} Root-Ausreißer,
   {' '}{review.counts.curveWarnings} Kurvenwarnungen, {review.counts.transitionChecks} auffällige Übergänge.
   {!review.validFootSamples&&' Kein auswertbarer Fußknochen – keine Fußkontakt-Aussage.'}</p>
  <div aria-label="V589 Clip-Prüftimeline" style={{height:18,position:'relative',borderRadius:6,background:'#263449',marginBottom:8,overflow:'hidden'}}>
   {review.flags.map((flag,i)=><button key={`${i}-${flag.atSeconds}`} type="button" title={`${flag.atSeconds.toFixed(2)} s – ${flag.title}`}
    aria-label={`Bei ${flag.atSeconds.toFixed(2)} Sekunden ${flag.title} prüfen`} onClick={()=>onSeek(flag.atSeconds)}
    style={{position:'absolute',left:`${review.durationSeconds?Math.min(98.5,100*flag.atSeconds/review.durationSeconds):0}%`,
      width:5,height:'100%',padding:0,border:0,background:flag.importance==='check'?'#ee986b':'#7ebde6',cursor:'pointer'}}/>)}
  </div>
  <p><small>Markierungen: Orange = auffälliger Bereich, Blau = Hinweis. Tippen springt zur Originalanimation im 3D-Viewer.</small></p>
  {review.flags.length>0?<ol style={{maxHeight:205,overflowY:'auto',paddingLeft:23}}>
   {review.flags.slice(0,18).map((flag,i)=><li key={`${i}-${flag.atSeconds}`}>
    <button type="button" onClick={()=>onSeek(flag.atSeconds)}>{flag.atSeconds.toFixed(2)} s</button> – {flag.title}
    <small> · {flag.explanation}</small>
   </li>)}
  </ol>:<p>In den begrenzt untersuchten Skelettdaten keine Warnmarker gefunden. Die visuelle Abnahme ist trotzdem erforderlich.</p>}
  {review.crossfadeSeconds!==null&&<p>Vorsichtiger Crossfade-Vorschlag: {review.crossfadeSeconds.toFixed(2)} s (nicht automatisch auf die Show angewendet).</p>}
  <fieldset style={{border:'1px solid #45556e',borderRadius:8,padding:12}}>
   <legend><strong>Manuelle 3D-Sichtabnahme</strong></legend>
   {([
    ['motionSeen','Original-GLB abgespielt und Körper-/Armgelenke geprüft'],
    ['footContactSeen','Beide Füße bei Stand, Schritt und Landung angesehen'],
    ...(hasFollowingClip?[['transitionSeen','Übergang zum gewählten Folgeclip visuell geprüft']]:[]),
    ['fullSongSeen','Längere Choreografie-Sequenz mit echten Clips in der Vorschau geprüft'],
   ] as [keyof VisualDanceChecklistV589,string][]).map(([key,label])=><label key={key} className="setting-check" style={{display:'block',margin:'6px 0'}}>
    <input type="checkbox" checked={checks[key]} onChange={e=>update(key,e.target.checked)}/> {label}</label>)}
   <p role="status">{status.label} · {status.stepsDone}/{status.stepsTotal} bestätigte Schritte.</p>
   <button type="button" onClick={()=>setChecks(emptyVisualDanceChecklistV589())}>Sichtprüfung zurücksetzen</button>{' '}
   <button type="button" onClick={exportReport}>Prüfbericht als JSON exportieren</button>
  </fieldset>
  <small>{review.disclaimer} Die Bestätigung gilt nur für diese aktuelle Browser-Vorschau und wird nicht als automatische Qualitätseinstufung in der Motion-Bibliothek gespeichert.</small>
 </section>;
}
