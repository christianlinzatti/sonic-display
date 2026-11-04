'use client';
/** V905 – guided, manual-only benchmark: reuses the ONE V826 external store
 * subscription owned by ConcertQualityIntelligencePanelV901. No RAF, timer or WebGL objects.
 */
import {useEffect,useMemo,useRef,useState} from 'react';
import {ConcertBenchmarkReportPanelV906} from './ConcertBenchmarkReportPanelV906';
import {PerformanceProfileComparisonPanelV907} from './PerformanceProfileComparisonPanelV907';
import {LiveStageBenchmarkVerificationPanelV908} from './LiveStageBenchmarkVerificationPanelV908';
import {readLiveStageProofV908,recordRunProofV908,finalizeRunProofV908,recordVerifiedRunV908,
 type RunWindowProofV908,type VerifiedRunV908} from './liveStageBenchmarkProofV908';
import {recordProfileRunV907,type DeclaredAvatarsV907,type DeclaredEffectsV907,
 type ProfileRunV907,type ProfileTagV907} from './performanceProfileComparisonV907';
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
import {reviewFrameV903,type ReviewContextV903} from './concertQualityReviewV903';
import {BENCHMARK_REQUIREMENTS_V905,BENCHMARK_WARMUP_V905,
 advanceGuidedBenchmarkV905,exportGuidedBenchmarksV905,invalidateGuidedBenchmarkV905,
 recordGuidedBenchmarkV905,startGuidedBenchmarkV905,summarizeGuidedBenchmarksV905,syncGuidedBenchmarkV905,
 type BenchmarkPresetV905,type BenchmarkRunV905,type BenchmarkSessionV905,type BenchmarkGroupStatusV905
} from './guidedConcertBenchmarkV905';
interface Props {renderer:ConcertQualitySnapshotV826;trackKey:string;sceneIndex:number;
 mode:ReviewContextV903['mode'];playing:boolean;positionMs:number}
const names:Record<BenchmarkPresetV905,string>={quick:'Kurz · 5 Fenster',standard:'Standard · 8 Fenster',thorough:'Ausführlich · 12 Fenster'};
const statuses:Record<BenchmarkGroupStatusV905,string>={
 'more-runs':'Weitere Läufe erforderlich',consistent:'Vergleichbare Messungen',variable:'Starke Schwankungen','below-target':'FPS-Ziel häufiger unterschritten'};
const colors:Record<BenchmarkGroupStatusV905,string>={
 'more-runs':'#a6adba',consistent:'#83d8b2',variable:'#f2bf7a','below-target':'#e99797'};
const one=(v:number)=>v.toFixed(1);
export function GuidedConcertBenchmarkPanelV905({renderer,trackKey,sceneIndex,mode,playing,positionMs}:Props){
 const [preset,setPreset]=useState<BenchmarkPresetV905>('standard');
 const [session,setSession]=useState<BenchmarkSessionV905|null>(null);
 const [history,setHistory]=useState<BenchmarkRunV905[]>([]);
 const [declaredAvatars,setDeclaredAvatars]=useState<0|DeclaredAvatarsV907>(0);
 const [declaredEffects,setDeclaredEffects]=useState<'unset'|DeclaredEffectsV907>('unset');
 const [profileHistory,setProfileHistory]=useState<ProfileRunV907[]>([]);
 const profileTags=useRef(new Map<number,ProfileTagV907>());
 const measuredProofV908=useRef<RunWindowProofV908[]>([]);
 const [verifiedHistoryV908,setVerifiedHistoryV908]=useState<VerifiedRunV908[]>([]);
 const [confirmClear,setConfirmClear]=useState(false);
 // This state deliberately triggers a render when the first genuine V826 publication
 // arrives. A mutable ref alone would leave the Start button disabled forever.
 const [readySnapshot,setReadySnapshot]=useState<ConcertQualitySnapshotV826|null>(null);
 const serial=useRef(0);
 const lastSnapshot=useRef<ConcertQualitySnapshotV826>(renderer);
 const previousPosition=useRef<{trackKey:string;positionMs:number}|null>(null);
 // The panel is mounted within V901 and receives its already subscribed V826 snapshot.
 // A fresh publication in this confirmed scene is required before START is enabled.
 const freshness=useRef({key:'',snapshot:null as ConcertQualitySnapshotV826|null});
 const sceneKey=`${trackKey}|${sceneIndex}|${mode}|${playing}|${renderer.targetFps}|${renderer.performanceTier}`;
 const context:ReviewContextV903={trackKey,sceneIndex,mode,playing};
 if(freshness.current.key!==sceneKey)freshness.current={key:sceneKey,snapshot:null};
 useEffect(()=>{
  setReadySnapshot(null);
  setSession(s=>syncGuidedBenchmarkV905(s,context,renderer.targetFps,renderer.performanceTier));
 },[trackKey,sceneIndex,mode,playing,renderer.targetFps,renderer.performanceTier]);
 useEffect(()=>{
  const prev=previousPosition.current;
  previousPosition.current={trackKey,positionMs};
  if(prev&&prev.trackKey===trackKey&&Number.isFinite(positionMs)&&Number.isFinite(prev.positionMs)&&
   (positionMs<prev.positionMs-1500||positionMs>prev.positionMs+20000)){
   freshness.current.snapshot=null;
   setReadySnapshot(null);
   setSession(s=>invalidateGuidedBenchmarkV905(s,'Seek erkannt. Dieser Lauf ist nicht vergleichbar.'));
  }
 },[trackKey,positionMs]);
 useEffect(()=>{
  if(lastSnapshot.current===renderer)return; // React re-renders never count as new samples
  lastSnapshot.current=renderer;
  const frame=reviewFrameV903(renderer,context,Date.now());
  if(frame){freshness.current.snapshot=renderer;setReadySnapshot(renderer);}
  else setReadySnapshot(null);
  setSession(s=>advanceGuidedBenchmarkV905(s,context,frame));
 },[renderer,trackKey,sceneIndex,mode,playing]);
 // Capture only frames that V905 really accepted as measured; never count warmup
 // or a duplicate React render. The proof must reference this exact V826 object.
 useEffect(()=>{
  if(!session||session.state==='invalid')return;
  measuredProofV908.current=recordRunProofV908(measuredProofV908.current,session,renderer,
   readLiveStageProofV908(renderer,trackKey));
 },[session,renderer,trackKey]);
 useEffect(()=>{
  if(session?.state==='ready'){
   if(session.result)setVerifiedHistoryV908(h=>recordVerifiedRunV908(h,
     finalizeRunProofV908(session.result!,measuredProofV908.current)));
   setHistory(h=>recordGuidedBenchmarkV905(h,session));
   const tag=profileTags.current.get(session.id)??null;
   setProfileHistory(h=>recordProfileRunV907(h,session.result,tag));
  }
 },[session]);
 const groups=useMemo(()=>summarizeGuidedBenchmarksV905(history),[history]);
 const running=session?.state==='warmup'||session?.state==='measuring';
 const canStart=!running&&readySnapshot===renderer&&freshness.current.snapshot===renderer&&
  !!reviewFrameV903(renderer,context,Date.now());
 const start=()=>{
  if(!canStart)return;
  const value=startGuidedBenchmarkV905(context,renderer,Date.now(),++serial.current,preset);
  if(value){
   measuredProofV908.current=[];
   if(declaredAvatars!==0&&declaredEffects!=='unset')
    profileTags.current.set(value.id,{avatars:declaredAvatars,effects:declaredEffects});
   freshness.current.snapshot=null;setReadySnapshot(null);setSession(value);
  }
 };
 const download=()=>{
  const url=URL.createObjectURL(new Blob([exportGuidedBenchmarksV905(history)],{type:'application/json;charset=utf-8'}));
  try{const a=document.createElement('a');a.href=url;a.download='sonic-guided-benchmark-v905.json';a.click();}
  finally{URL.revokeObjectURL(url);}
 };
 return <fieldset className="concert-director-options-v895 concert-guided-benchmark-v905" aria-label="Guided Concert Benchmark Studio">
  <legend>V905 · Guided Concert Benchmark Studio</legend>
  <p style={{margin:'4px 0 8px'}}>Geführter, manuell gestarteter Konzert-Benchmark aus echten V826-Renderer-Fenstern – ohne neue 3D-Last und ohne automatische Einstellungen.</p>
  <label style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center',marginBottom:8}}>
   Messdauer <select value={preset} disabled={!!running} onChange={(e:{target:{value:string}})=>setPreset(e.target.value as BenchmarkPresetV905)} aria-label="V905 Benchmark Messdauer">
    {(Object.keys(names) as BenchmarkPresetV905[]).map(k=><option key={k} value={k}>{names[k]}</option>)}
   </select>
  </label>
  <div style={{border:'1px solid #7776',borderRadius:8,padding:9,margin:'7px 0'}} aria-label="V907 Konfiguration vor Benchmarkbeginn">
   <b>V907 · Messprofil vor dem Start kennzeichnen</b>
   <small style={{display:'block',margin:'4px 0'}}>Die Bühne und Avatarzahl bitte vorher selbst konfigurieren. Die hier gewählten Labels ändern keinerlei Einstellung und werden nicht technisch überprüft.</small>
   <div style={{display:'flex',flexWrap:'wrap',gap:9,marginTop:6}}>
    <label>GLB-Avatare (selbst gezählt) <select aria-label="V907 GLB-Anzahl" disabled={!!running} value={declaredAvatars} onChange={(e:{target:{value:string}})=>setDeclaredAvatars(Number(e.target.value) as 0|DeclaredAvatarsV907)}>
     <option value={0}>Nicht gekennzeichnet</option><option value={2}>2 Avatare</option><option value={3}>3 Avatare</option><option value={4}>4 Avatare</option>
    </select></label>
    <label>FX-Aufbau (selbst eingestuft) <select aria-label="V907 FX-Aufbau" disabled={!!running} value={declaredEffects} onChange={(e:{target:{value:string}})=>setDeclaredEffects(e.target.value as 'unset'|DeclaredEffectsV907)}>
     <option value="unset">Nicht gekennzeichnet</option><option value="reduced">FX reduziert</option><option value="standard">FX Standard</option><option value="full">FX stark</option>
    </select></label>
   </div>
   <small>Diese Angaben werden beim Start festgehalten. Ohne beide Labels bleibt der normale V905-Benchmark verfügbar, erscheint aber nicht im V907-Profilvergleich.</small>
  </div>
  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
   <button type="button" className="concert-transition-export-v884" onClick={start} disabled={!canStart}>Benchmark ausdrücklich starten</button>
   {running&&<button type="button" className="concert-transition-export-v884" onClick={()=>setSession(s=>invalidateGuidedBenchmarkV905(s,'Lauf manuell abgebrochen. Keine Messung gespeichert.'))}>Lauf abbrechen</button>}
  </div>
  <div role="status" aria-live="polite" style={{margin:'8px 0'}}>
   {!session?<small>Start erst nach einer neuen V826-Veröffentlichung in der aktuell bestätigten, laufenden Songszene möglich.</small>:<>
    <strong>{session.state==='ready'?'Messlauf abgeschlossen':session.state==='invalid'?'Messlauf ungültig':session.state==='warmup'?'Einmessphase':'Messung läuft'}</strong>
    <small style={{display:'block'}}>{session.reason}</small>
    <small style={{display:'block'}}>Stabilisierung: {session.warmup}/{BENCHMARK_WARMUP_V905} · Messfenster: {session.frames.length}/{BENCHMARK_REQUIREMENTS_V905[session.preset]}</small>
    {session.result&&<div style={{margin:'7px 0'}}>
     <b>{one(session.result.fpsMedian)} FPS (Median)</b> · Ø {one(session.result.frameMsMedian)} ms · Ø P95-Fenster {one(session.result.p95WindowMean)} ms · FX-Druck {one(session.result.pressureMean*100)} %
    </div>}
   </>}
  </div>
  <div style={{borderTop:'1px solid #7776',paddingTop:8,display:'grid',gap:7}} aria-label="V905 Wiederholungsanalyse">
   <b>Vergleichbare Benchmark-Durchläufe</b>
   <small>{history.length} vollständige Läufe in dieser Sitzung · {groups.length} Gruppen · mindestens drei unabhängige Läufe für eine Stabilitätsaussage</small>
   {!groups.length?<small>Starte einen Benchmark. Für den Vergleich dieselbe Szene und dasselbe FPS-Ziel, Performance-Profil und Messpreset verwenden.</small>:groups.map(g=><div key={g.groupId} style={{border:'1px solid #7778',borderRadius:9,padding:9}}>
    <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:7}}>
     <b>Songszene #{g.sceneIndex+1} · {names[g.preset]}</b>
     <strong style={{color:colors[g.status]}}>{statuses[g.status]}</strong>
    </div>
    <small>{g.count} Läufe · {g.targetFps}-FPS-Ziel · Profil {g.tier}</small>
    <div style={{margin:'5px 0'}}>FPS-Median {one(g.fpsMedian)} · Bereich {one(g.fpsMin)}–{one(g.fpsMax)} · Spannweite {one(g.spread)} FPS</div>
    <small>Framezeit-Median {one(g.frameMsMedian)} ms · Ø P95-Fenster {one(g.p95WindowMean)} ms · FX-Druck {one(g.pressureMean*100)} %. {g.description}</small>
   </div>)}
  </div>
  <ConcertBenchmarkReportPanelV906 history={history}/>
  <PerformanceProfileComparisonPanelV907 history={history} tagged={profileHistory}/>
  <LiveStageBenchmarkVerificationPanelV908 history={history} proofs={verifiedHistoryV908}/>
  <div style={{display:'flex',flexWrap:'wrap',gap:8,margin:'9px 0'}}>
   <button type="button" className="concert-transition-export-v884" disabled={!history.length} onClick={download}>V905 Benchmark als JSON exportieren</button>
   {!confirmClear?<button type="button" className="concert-transition-export-v884" disabled={!history.length||!!running} onClick={()=>setConfirmClear(true)}>Benchmarkverlauf löschen prüfen</button>:
    <section aria-label="V905 Benchmarkverlauf löschen bestätigen" style={{border:'1px solid #b4a17b',borderRadius:8,padding:8}}>
     <strong>Alle gesammelten Benchmarkläufe aus dieser Sitzung löschen?</strong><p style={{margin:'4px 0'}}>Keine Einstellungen oder Kamerafahrten werden geändert.</p>
     <button type="button" className="concert-transition-export-v884" disabled={!!running} onClick={()=>{setHistory([]);setProfileHistory([]);setVerifiedHistoryV908([]);measuredProofV908.current=[];profileTags.current.clear();setConfirmClear(false);}}>Benchmarkverlauf ausdrücklich löschen</button>{' '}
     <button type="button" className="concert-transition-export-v884" onClick={()=>setConfirmClear(false)}>Abbrechen</button>
    </section>}
  </div>
  <small>Renderer-Frame-Abstände sind keine GPU-Zeit oder optische Qualitätsmessung. Ein Lauf ist bei Pause, Seek, Song-/Szenenwechsel, anderem FPS-Ziel/Profil oder fehlender Telemetrie ungültig. Wiederholungen beweisen weder Ursache noch Bildqualität. Verlauf nur im Arbeitsspeicher; exportierte Gruppen enthalten keine Songkennung oder Wiedergabeposition.</small>
 </fieldset>;
}
