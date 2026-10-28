"use client";
/** V641 opt-in live-song recorder. Only reads existing V466 QA and stage data, never alters playback. */
import {useEffect,useRef,useState} from 'react';
import {getConcertQualitySnapshotV641} from './concertQualityStoreV466';
import {auditFullConcertV641,validV641Observation,V641_SAMPLE_LIMIT,type V641Observation} from './fullConcertQualityAuditV641';
import {reviewConcertAuditV642} from './concertEditionReviewV642';
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
 const start=()=>{samples.current=[];setNotice('');setRevision(v=>v+1);setRunning(true);};
 const stop=()=>{setRunning(false);setRevision(v=>v+1);};
 const report=auditFullConcertV641(samples.current);
 const actionsV642=reviewConcertAuditV642(report);
 const exportJson=()=>{
  if(!samples.current.length)return;
  const payload={...report,observations:samples.current,recordingMode:'manually-started-browser-qa',privacy:'no-lyrics-text-no-audio-no-network'};
  const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`sonic-v641-audit-${report.observedAvatarCounts.join('-')||'none'}-avatars.json`;
  document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <div className="v641-concert-audit" data-v641-recorder={running?'recording':'idle'}>
  <strong>V641 · Vollsong-Qualitätsprüfung</strong>
  <p>Aufzeichnung nur nach Start, lokal im Browser. Für den Nachweis echter GLB-Meshes auf localhost zusätzlich ?benchmarkV592=1 öffnen. Song abspielen und QA öffnen; keine Audio-/Lyrics-Speicherung.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   {!running?<button type="button" onClick={start}>Neue Song-Aufzeichnung</button>:<button type="button" onClick={stop}>Aufzeichnung beenden</button>}
   <button type="button" disabled={!samples.current.length} onClick={exportJson}>JSON-Prüfbericht</button>
  </div>
  <p role="status">{running?'Aufzeichnung läuft · ':''}{report.samples} Messpunkte · {report.coveragePercent.toFixed(1)} % nachgewiesene Songabdeckung · {report.observedAvatarCounts.join(', ')||'—'} Avatar-Slots · {report.verifiedGlbCounts.join(', ')||'—'} gemessene GLB-Mesh-Gruppen</p>
  {notice&&<p role="status">{notice}</p>}
  {report.samples>0&&<><p>FPS Median {report.medianFps?.toFixed(1)??'—'} · P95 Median {report.medianP95Ms?.toFixed(1)??'—'} ms · Kamerawechsel {report.cameraTransitions} · Motivwechsel {report.motifTransitions}</p>
   {report.findings.length>0&&<ul>{report.findings.slice(0,6).map((f,i)=><li key={`${f.id}-${i}`}>{f.detail}</li>)}</ul>}
   {actionsV642.length>0&&<section data-v642-qa-actions="read-only"><strong>V642 · Gezielte Nachprüfung (keine automatische Korrektur)</strong><ul>{actionsV642.map(a=><li key={a.id}><b>{a.heading}:</b> {a.advice}</li>)}</ul></section>}
  </>}
  <p>Keine automatische Qualitätsfreigabe. Geometrische Projektionen beweisen weder natürliche Tänze noch lesbare Lyrics oder echten Lip-Sync. Zum Vergleich von 1/2/4 GLB-Avataren separate Aufzeichnungen erstellen.</p>
 </div>;
}
