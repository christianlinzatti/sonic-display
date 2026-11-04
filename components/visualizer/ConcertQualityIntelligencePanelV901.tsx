'use client';
/** V901 – read-only live check panel: V826 telemetry updates at <=2 Hz.
 * No requestAnimationFrame, extra WebGL resources, new audio capture or polling. */
import {useEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react';
import {getConcertQualityV826,subscribeConcertQualityV826,EMPTY_QUALITY_SNAPSHOT_V826,
 type ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
import {DEFAULT_QUALITY_SETTINGS_V901,QUALITY_STORAGE_KEY_V901,normalizeQualitySettingsV901,
 evaluateConcertQualityV901,exportConcertQualityV901,type QualitySettingsV901,type QualityEvidenceV901} from './concertQualityIntelligenceV901';

import {ConcertQualityAdvisorPanelV902} from './ConcertQualityAdvisorPanelV902';
import type {AdvisorConfigV902,AdvisorPatchV902} from './concertQualityAdvisorV902';
import {ConcertQualityReviewPanelV903} from './ConcertQualityReviewPanelV903';
import {advanceConcertReviewV903,beginConcertReviewV903,completeReviewRestoreV903,
 markReviewRestoringV903,restorePatchV903,reviewFrameV903,syncConcertReviewV903,invalidateConcertReviewV903,
 REVIEW_MAX_HISTORY_V903,type ConcertReviewV903,type ReviewFrameV903,type ReviewContextV903} from './concertQualityReviewV903';
import {ConcertQualityRegressionPanelV904} from './ConcertQualityRegressionPanelV904';
import {recordConcertRegressionV904,type RegressionRecordV904} from './concertQualityRegressionV904';
import {GuidedConcertBenchmarkPanelV905} from './GuidedConcertBenchmarkPanelV905';
type Props=Omit<QualityEvidenceV901,'renderer'>&{advisorControls:AdvisorConfigV902;onApplyAdvice:(patch:AdvisorPatchV902)=>void;onRestoreAdvice:(patch:AdvisorPatchV902)=>void};
const chip=(state:string)=>state==='ready'?'Bereit':state==='attention'?'Prüfen':state==='inactive'?'Inaktiv':'Keine Aussage';
const shade=(state:string)=>state==='attention'?'#f5c270':state==='ready'?'#83d8b2':'#a6adba';
export function ConcertQualityIntelligencePanelV901(props:Props){
 const renderer=useSyncExternalStore(subscribeConcertQualityV826,getConcertQualityV826,
  ()=>EMPTY_QUALITY_SNAPSHOT_V826 as ConcertQualitySnapshotV826);
 const [settings,setSettings]=useState<QualitySettingsV901>({...DEFAULT_QUALITY_SETTINGS_V901});
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  try{setSettings(normalizeQualitySettingsV901(JSON.parse(window.localStorage.getItem(QUALITY_STORAGE_KEY_V901)??'null')));}
  catch{setSettings({...DEFAULT_QUALITY_SETTINGS_V901});}
  setReady(true);
 },[]);
 useEffect(()=>{
  if(!ready)return;
  try{window.localStorage.setItem(QUALITY_STORAGE_KEY_V901,JSON.stringify(settings));}catch{}
 },[ready,settings]);
 const report=useMemo(()=>evaluateConcertQualityV901({...props,renderer}),[props,renderer]);
 // V903 stores only a short, in-memory history of genuinely new V826 publications.
 // It never introduces another RAF, timer, worker, GPU readback or storage key.
 const [review,setReview]=useState<ConcertReviewV903|null>(null);
 // V904: bounded, transient completed comparisons only. No additional V826 subscription.
 const [regressionHistory,setRegressionHistory]=useState<RegressionRecordV904[]>([]);
 const beforeFrames=useRef<ReviewFrameV903[]>([]);
 const lastV826=useRef<ConcertQualitySnapshotV826|null>(renderer);
 const reviewSequence=useRef(0);
 const previousPlayback=useRef<{trackKey:string;positionMs:number}|null>(null);
 const ctx:ReviewContextV903={trackKey:props.trackId,sceneIndex:report.sceneIndex,mode:report.mode,playing:props.playing};
 useEffect(()=>{
  const old=previousPlayback.current;
  const now={trackKey:props.trackId,positionMs:props.positionMs};
  previousPlayback.current=now;
  // A forward skip >20 s or backward seek >1.5 s may change renderer load
  // even without changing a V900 scene index. Never attribute it to an FX patch.
  if(old&&old.trackKey===now.trackKey&&Number.isFinite(now.positionMs)&&Number.isFinite(old.positionMs)&&
   (now.positionMs<old.positionMs-1500||now.positionMs>old.positionMs+20000)){
   beforeFrames.current=[];
   setReview(s=>invalidateConcertReviewV903(s,'Wiedergabeposition wurde sprunghaft verändert (Seek). Kein vergleichbares Messfenster.'));
  }
 },[props.trackId,props.positionMs]);
 useEffect(()=>{
  // The old comparison cannot stay valid across a new scene, pause or switched song.
  beforeFrames.current=beforeFrames.current.filter(f=>f.trackKey===ctx.trackKey&&f.sceneIndex===ctx.sceneIndex);
  setReview(s=>syncConcertReviewV903(s,ctx,props.advisorControls));
 },[props.trackId,report.sceneIndex,report.mode,props.playing,props.advisorControls]);
 useEffect(()=>{
  if(lastV826.current===renderer)return; // no duplicate sample on UI renders
  lastV826.current=renderer;
  const frame=reviewFrameV903(renderer,ctx,Date.now());
  if(frame)beforeFrames.current=[...beforeFrames.current,frame].slice(-REVIEW_MAX_HISTORY_V903);
  setReview(s=>advanceConcertReviewV903(s,ctx,props.advisorControls,frame));
 },[renderer,props.trackId,report.sceneIndex,report.mode,props.playing,props.advisorControls]);
 useEffect(()=>{
  setReview(s=>completeReviewRestoreV903(s,props.advisorControls));
 },[props.advisorControls]);
 useEffect(()=>{
  // A review is archived once only AFTER V903 reaches its fully measured state.
  // React StrictMode may repeat the effect; recordConcertRegressionV904 deduplicates by id.
  if(review?.state==='ready')setRegressionHistory(h=>recordConcertRegressionV904(h,review));
 },[review]);
 const applyWithReview=(patch:AdvisorPatchV902)=>{
  const pending=beginConcertReviewV903(beforeFrames.current,ctx,patch,props.advisorControls,Date.now(),++reviewSequence.current);
  if(pending){beforeFrames.current=[];setReview(pending);}
  props.onApplyAdvice(patch); // V902 validates the actual React setting again.
 };
 const restoreWithReview=()=>{
  const patch=restorePatchV903(review,props.advisorControls);
  if(!patch)return;
  setReview(s=>markReviewRestoringV903(s,props.advisorControls));
  props.onRestoreAdvice(patch); // independently guards the exact applied value
 };

 const update=(patch:Partial<QualitySettingsV901>)=>setSettings(s=>normalizeQualitySettingsV901({...s,...patch}));
 const download=()=>{
  const blob=new Blob([exportConcertQualityV901(report,settings)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  try{const a=document.createElement('a');a.href=url;a.download='sonic-concert-quality-v901.json';a.click();}
  finally{URL.revokeObjectURL(url);}
 };
 return <fieldset className="concert-director-options-v895 concert-quality-intelligence-v901" aria-label="Concert Quality Intelligence 2.0">
  <legend>V901 · Concert Quality Intelligence 2.0</legend>
  <label className="live-fx-check-v881"><input type="checkbox" checked={settings.enabled}
   onChange={(e:{target:{checked:boolean}})=>update({enabled:e.target.checked})}/>Live-Regie-Diagnose anzeigen (nur lesend)</label>
  {!settings.enabled?<small>Die V901-Auswertung ist ausgeschaltet. Keine automatische Anpassung.</small>:<>
   <div role="status" aria-live="polite" className="concert-transition-status-v884">
    <strong>{report.headline}</strong>{report.scene?` · ${report.scene}`:''}
   </div>
   <div className="concert-particle-toggles-v889">
    {(['showRenderer','showChecks','showRecommendations'] as const).map(k=><label key={k} className="live-fx-check-v881">
     <input type="checkbox" checked={settings[k]} onChange={(e:{target:{checked:boolean}})=>update({[k]:e.target.checked})}/>
     {({showRenderer:'Live-Performance',showChecks:'Koordinations-Checks',showRecommendations:'Empfehlungen'} as const)[k]}
    </label>)}
   </div>
   {settings.showRenderer&&<div style={{display:'flex',flexWrap:'wrap',gap:12,padding:'8px 0'}} aria-label="Gemessene Renderer-Daten">
    <div><strong>{report.frameEvidence?`${report.fps!.toFixed(1)} FPS`:'— FPS'}</strong><small style={{display:'block'}}>Renderer-Frame-Abstände</small></div>
    <div><strong>{report.frameEvidence?`${report.frameMs!.toFixed(1)} ms`:'— ms'}</strong><small style={{display:'block'}}>Ø Framezeit</small></div>
    <div><strong>{report.frameEvidence?`${report.p95FrameMs!.toFixed(1)} ms`:'— ms'}</strong><small style={{display:'block'}}>P95-Framezeit</small></div>
    <div><strong>{report.frameEvidence?`${Math.round(report.pressure!*100)} %`:'—'}</strong><small style={{display:'block'}}>FX-Regeldruck</small></div>
   </div>}
   {settings.showChecks&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:7,margin:'8px 0'}}>
    {report.lanes.map(c=><div key={c.id} style={{border:'1px solid #7778',borderRadius:9,padding:9}}>
     <div style={{display:'flex',justifyContent:'space-between',gap:5,flexWrap:'wrap'}}><b>{c.label}</b><small style={{color:shade(c.state)}}>{chip(c.state)}</small></div>
     <small>{c.detail}</small>
    </div>)}
   </div>}
   {settings.showRecommendations&&<div><b>Live-Hinweise</b><ul style={{margin:'6px 0 10px',paddingLeft:18}}>
    {report.findings.slice(0,settings.maxFindings).map(f=><li key={f.id} style={{margin:'5px 0'}}>{f.text}</li>)}
    {report.findings.length===0&&<li>Keine Warnsignale aus den derzeit verfügbaren Daten. Sichtbare Showqualität weiterhin im Browser prüfen.</li>}
   </ul></div>}
   <ConcertQualityAdvisorPanelV902 report={report} controls={props.advisorControls} onApply={applyWithReview}/>
   <ConcertQualityReviewPanelV903 review={review} controls={props.advisorControls} onRestore={restoreWithReview}/>
   <ConcertQualityRegressionPanelV904 history={regressionHistory} onClear={()=>setRegressionHistory([])}/>
   <GuidedConcertBenchmarkPanelV905 renderer={renderer} trackKey={props.trackId} sceneIndex={report.sceneIndex} mode={report.mode} playing={props.playing} positionMs={props.positionMs}/>
   <button type="button" className="concert-transition-export-v884" onClick={download}>V901 Diagnose-Momentaufnahme als JSON exportieren</button>
   <small>Nur lesend. FPS und FX-Druck stammen aus V826-Rendermessungen; sie sind nicht songbezogen. Kamera-Framing,
    Lyrics-Lesbarkeit, Körperbewegungen und tatsächlich sichtbare Effekte werden <b>nicht</b> optisch gemessen.
    „Bereit“ bedeutet nur, dass der jeweilige Regiekanal korrekt konfiguriert und für die bestätigte Szene verfügbar ist.
    Keine selbstständigen Einstellungsänderungen und kein zusätzlicher WebGL-Aufwand.</small>
  </>}
 </fieldset>;
}
