"use client";
/** V641 opt-in live-song recorder. Only reads existing V466 QA and stage data, never alters playback. */
import {useEffect,useRef,useState} from 'react';
import {getConcertQualitySnapshotV641} from './concertQualityStoreV466';
import {auditFullConcertV641,validV641Observation,V641_SAMPLE_LIMIT,type V641Observation} from './fullConcertQualityAuditV641';
import {reviewConcertAuditV642} from './concertEditionReviewV642';
import {inspectFullConcertQualityV692} from './concertQualityInspectorV692';
import {ConcertQualityInspectionResultsV692} from './ConcertQualityResultsPanelV692';
import {ConcertQualityImprovementStudioV693} from './ConcertQualityImprovementStudioV693';
import {createV693Snapshot,type V693Progress} from './concertQualityImprovementV693';
import {ConcertQualityHistoryPanelV694} from './ConcertQualityHistoryPanelV694';
import {archiveV694Comparison,clearV694Draft,decodeV694Archive,deleteV694Entry,emptyV694Archive,markV694Task,rememberV694Run,type V694Archive,type V694Run} from './concertQualityHistoryV694';
import {loadV694History,persistV694History} from './concertQualityHistoryStorageV694';
const readStage=()=>Array.from(document.querySelectorAll<HTMLElement>('[data-v641-track-id]'))
 .find(el=>{const box=el.getBoundingClientRect();return box.width>0&&box.height>0&&!!el.querySelector('canvas');})??null;
function observe():V641Observation|null{
 const stage=readStage(),q=getConcertQualitySnapshotV641();
 if(!stage||stage.dataset.v641Playing!=='yes'||!q.assessment||Date.now()-q.at>3500)return null;
 const trackId=stage.dataset.v641TrackId??'';
 const n=(key:string)=>Number(stage.dataset[key]??NaN);
 const cue=(v:string|undefined)=>(v??'').replace(/[^A-Za-z0-9_.:/-]/g,'_').slice(0,80);
 const measured=(v:number|null,min:number,max:number)=>v!==null&&Number.isFinite(v)&&v>=min&&v<=max?v:null;
 const durationMs=n('v641DurationMs'),progressMs=n('v641ProgressMs');
 const glb=window.__sonicV592Canvas;
 const verifiedGlbActors=glb&&performance.now()-glb.sampledAt<2000&&!glb.contextLost?glb.actors.filter(a=>a.meshes>0&&a.bounds!==null).length:null;
 return {trackId,durationMs,progressMs,observedAt:Date.now(),avatarCount:q.assessment.activeAvatarCount,
  headsInFrame:q.assessment.headsInFrame,verifiedGlbActors,fps:measured(q.fps,1,240),p95FrameMs:measured(q.p95FrameMs,1,2000),
  drawCalls:measured(q.drawCalls,0,100000),triangles:measured(q.triangles,0,20_000_000),
  lyrics:q.assessment.lyrics,headVisibility:q.assessment.headVisibility,
  chapter:cue(stage.dataset.v604Chapter),shot:cue(stage.dataset.v478Shot),
  motif:cue(stage.dataset.v604Motif),focus:cue(stage.dataset.v568Focus)};
}
export function FullConcertQualityAuditV641(){
 const [running,setRunning]=useState(false),[,setRevision]=useState(0),[notice,setNotice]=useState('');
 const samples=useRef<V641Observation[]>([]);
 const [captureV693,setCaptureV693]=useState(0);
 const [archiveV694,setArchiveV694]=useState<V694Archive>(emptyV694Archive);
 const [historyAvailableV694,setHistoryAvailableV694]=useState(true);
 const [historyCorruptV694,setHistoryCorruptV694]=useState(false);
 const [historyNoticeV694,setHistoryNoticeV694]=useState('');
 // Initial hydration only reads localStorage. All subsequent writes require an explicit QA action.
 useEffect(()=>{
  const loaded=loadV694History();setArchiveV694(loaded.archive);
  setHistoryAvailableV694(loaded.available);setHistoryCorruptV694(loaded.corrupt);setHistoryNoticeV694(loaded.notice);
 },[]);
 const commitV694=(next:V694Archive,message='',explicitReplace=false)=>{
  if(historyCorruptV694&&!explicitReplace){
   setArchiveV694(next);setHistoryNoticeV694('Vorhandene ungültige QA-Daten wurden nicht überschrieben. Für dauerhafte Speicherung bewusst JSON importieren oder Historie löschen.');return;
  }
  if(!persistV694History(next)){
   setHistoryAvailableV694(false);
   setHistoryNoticeV694('Speichern im Browser fehlgeschlagen. Änderungen sind nur in dieser QA-Sitzung vorhanden. Bitte die Speicherberechtigung prüfen.');
  }else{
   setHistoryAvailableV694(true);if(explicitReplace)setHistoryCorruptV694(false);setHistoryNoticeV694(message);
  }
  setArchiveV694(next);
 };
 const beforeV693=archiveV694.before?.snapshot??null;
 const afterV693=archiveV694.after?.snapshot??null;
 const progressV693=archiveV694.progress;
 const runV694=():V694Run|null=>{
  const value=snapshotV693();return value?{snapshot:value,release:'V694',capturedAt:Date.now()}:null;
 };
 useEffect(()=>{
  if(!running)return;
  const tick=()=>{
   const value=observe();if(!value)return;
   const last=samples.current[samples.current.length-1];
   if(last&&(last.trackId!==value.trackId||value.progressMs<last.progressMs-250)){
    setRunning(false);setNotice('Trackwechsel oder Zurückspulen: Aufzeichnung beendet, bisherigen Song separat prüfen.');return;
   }
   if(samples.current.length>=V641_SAMPLE_LIMIT){setRunning(false);setNotice('Maximale Aufzeichnungsdauer erreicht.');return;}
   if(last&&value.progressMs<=last.progressMs+50)return;
   // Invalid state is never recorded; auditor validates again before aggregation.
   if(!validV641Observation(value))return;
   samples.current.push(value);
   if(samples.current.length%5===0)setRevision(v=>v+1);
  };
  tick();const interval=window.setInterval(tick,1000);
  return ()=>window.clearInterval(interval);
 },[running]);
 const start=()=>{samples.current=[];setCaptureV693(v=>Math.max(Date.now(),v+1,beforeV693?.captureId??0,afterV693?.captureId??0)+1);setNotice('');setRevision(v=>v+1);setRunning(true);};
 const stop=()=>{setRunning(false);setRevision(v=>v+1);};
 const report=auditFullConcertV641(samples.current);
 const actionsV642=reviewConcertAuditV642(report);
 const inspectionV692=inspectFullConcertQualityV692(report,samples.current);
 const canSnapshotV693=!running&&report.samples>0&&report.status!=='no-evidence'&&inspectionV692.sampleCount===report.samples;
 const snapshotV693=()=>canSnapshotV693?createV693Snapshot(report,inspectionV692,captureV693):null;
 const exportJson=()=>{
  if(!samples.current.length)return;
  const payload={...report,inspectionV692,observations:samples.current,recordingMode:'manually-started-browser-qa',privacy:'no-lyrics-text-no-audio-no-network'};
  const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`sonic-v641-audit-${report.observedAvatarCounts.join('-')||'none'}-avatars.json`;
  document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <div className="v641-concert-audit" data-v641-recorder={running?'recording':'idle'}>
  <strong>V641 · Vollsong-Qualitätsprüfung</strong>
  <p><a href="/acceptance" data-v697-acceptance-link="true">V697 · Konzertabnahme-Dashboard für 1/2/4 GLB-Avatare öffnen</a> · Manuelle Prüfliste und lokale V592-Bildvorschau</p>
  <p>Aufzeichnung nur nach Start, lokal im Browser. Für den Nachweis echter GLB-Meshes auf localhost zusätzlich ?benchmarkV592=1 öffnen. Song abspielen und QA öffnen; keine Audio-/Lyrics-Speicherung.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   {!running?<button type="button" onClick={start}>Neue Song-Aufzeichnung</button>:<button type="button" onClick={stop}>Aufzeichnung beenden</button>}
   <button type="button" disabled={!samples.current.length} onClick={exportJson}>JSON-Prüfbericht</button>
  </div>
  <p role="status">{running?'Aufzeichnung läuft · ':''}{report.samples} Messpunkte · {report.coveragePercent.toFixed(1)} % nachgewiesene Songabdeckung · {report.observedAvatarCounts.join(', ')||'—'} Avatar-Slots · {report.verifiedGlbCounts.join(', ')||'—'} gemessene GLB-Mesh-Gruppen</p>
  {notice&&<p role="status">{notice}</p>}
  {report.samples>0&&<><ConcertQualityInspectionResultsV692 result={inspectionV692}/><p>FPS Median {report.medianFps?.toFixed(1)??'—'} · P95 Median {report.medianP95Ms?.toFixed(1)??'—'} ms · Kamerawechsel {report.cameraTransitions} · Motivwechsel {report.motifTransitions}</p>
   {report.findings.length>0&&<ul>{report.findings.slice(0,6).map((f,i)=><li key={`${f.id}-${i}`}>{f.detail}</li>)}</ul>}
   {actionsV642.length>0&&<section data-v642-qa-actions="read-only"><strong>V642 · Gezielte Nachprüfung (keine automatische Korrektur)</strong><ul>{actionsV642.map(a=><li key={a.id}><b>{a.heading}:</b> {a.advice}</li>)}</ul></section>}
  </>}
  <ConcertQualityImprovementStudioV693
    inspection={inspectionV692} before={beforeV693} after={afterV693} progress={progressV693}
    onProgress={(key,value:V693Progress)=>commitV694(markV694Task(archiveV694,key,value),'Aufgabenstatus lokal gespeichert.')}
    onBefore={()=>{const run=runV694();if(run)commitV694(rememberV694Run(archiveV694,'before',run),'Vorher-Aufnahme lokal gespeichert.');}}
    onAfter={()=>{const run=runV694();if(run&&run.snapshot.captureId!==beforeV693?.captureId){
      const next=rememberV694Run(archiveV694,'after',run);
      if(next!==archiveV694)commitV694(next,'Nachher-Aufnahme lokal gespeichert.');
      else setHistoryNoticeV694('Aufnahmen nicht vergleichbar: bitte Song, Abdeckung und GLB-Konfiguration prüfen.');
    }}}
    onReset={()=>commitV694(clearV694Draft(archiveV694),'Vergleich zurückgesetzt; Aufgabenstatus und Archiv bleiben erhalten.')}
    canSnapshot={canSnapshotV693}/>
  <ConcertQualityHistoryPanelV694 archive={archiveV694} available={historyAvailableV694} notice={historyNoticeV694}
    onArchive={()=>{const next=archiveV694Comparison(archiveV694,Date.now());
      if(next)commitV694(next,'Vorher-/Nachher-Vergleich im lokalen QA-Archiv gespeichert.');
      else setHistoryNoticeV694('Vergleich nicht archivierbar: zwei gültige, getrennte und vergleichbare Aufnahmen nötig.');}}
    onProgress={(key,stage)=>commitV694(markV694Task(archiveV694,key,stage),'Gespeicherter Aufgabenstatus aktualisiert.')}
    onDelete={id=>commitV694(deleteV694Entry(archiveV694,id),'Archivierter Vergleich gelöscht.')}
    onReplace={raw=>{const parsed=decodeV694Archive(raw);if(parsed)commitV694(parsed,'JSON-Historie importiert.',true);
      else setHistoryNoticeV694('JSON-Sicherung ungültig, zu groß oder aus einem nicht unterstützten Format. Vorhandene Daten unverändert.');}}
    onClear={()=>commitV694(emptyV694Archive(),'Lokale QA-Historie gelöscht.',true)}/>
  <p>Keine automatische Qualitätsfreigabe. Geometrische Projektionen beweisen weder natürliche Tänze noch lesbare Lyrics oder echten Lip-Sync. Zum Vergleich von 1/2/4 GLB-Avataren separate Aufzeichnungen erstellen.</p>
 </div>;
}
