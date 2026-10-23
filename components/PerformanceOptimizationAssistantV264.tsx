"use client";
import {useEffect,useState} from "react";
import {DevicePerformanceProfilesV267} from "@/components/DevicePerformanceProfilesV267";
import {addExperiment,bestExperiment,decodeExperiments,EXPERIMENT_KEY,type ExperimentConfig,type PerformanceExperiment} from "@/services/monitoring/performanceExperimentsV266";
import {getAnalysisSamples} from "@/services/monitoring/performanceSessionAnalyzerV262";
import {detectBottlenecks} from "@/services/monitoring/performanceBottleneckDetectorV263";
import {proposeOptimizations,type OptimizationAction} from "@/services/monitoring/performanceOptimizationAdvisorV264";
import {summarizeImpactWindow,assessOptimizationImpact,type ImpactSnapshot} from "@/services/monitoring/performanceOptimizationImpactV265";
import {SESSION_METRICS_EVENT} from "@/services/monitoring/longSessionMetrics";
import {setPerformanceMode,useAdaptivePerformance} from "@/components/visualizer/adaptivePerformance";
import {readMultiAvatarDirectorEnabled,setMultiAvatarDirectorEnabled} from "@/components/visualizer/adaptiveMultiAvatarDirectorV260";
export function PerformanceOptimizationAssistantV264(){
 const performance=useAdaptivePerformance();
 const [tick,setTick]=useState(0);
 const [selection,setSelection]=useState<OptimizationAction[]>([]);
 const [undo,setUndo]=useState<{mode:"auto"|"high"|"balanced"|"low";director:boolean}|null>(null);
 const [message,setMessage]=useState("");
 const [impact,setImpact]=useState<{baseline:ImpactSnapshot;appliedAt:number;actions:OptimizationAction[];before:ExperimentConfig;after:ExperimentConfig;id:string}|null>(null);
 const [experiments,setExperiments]=useState<PerformanceExperiment[]>([]);
 const [loaded,setLoaded]=useState(false);
 const [restorePreview,setRestorePreview]=useState<PerformanceExperiment|null>(null);
 useEffect(()=>{try{setExperiments(decodeExperiments(window.localStorage.getItem(EXPERIMENT_KEY)));}catch{}setLoaded(true);},[]);
 useEffect(()=>{const update=()=>setTick(v=>v+1);window.addEventListener(SESSION_METRICS_EVENT,update);window.addEventListener("sonic:v260-director",update);return()=>{window.removeEventListener(SESSION_METRICS_EVENT,update);window.removeEventListener("sonic:v260-director",update);};},[]);
 const findings=detectBottlenecks(getAnalysisSamples());
 const director=readMultiAvatarDirectorEnabled();
 const proposals=proposeOptimizations(findings,performance.mode,director);
 const selected=selection.filter(id=>proposals.some(p=>p.id===id));
 const toggle=(id:OptimizationAction,checked:boolean)=>setSelection(previous=>checked?[...previous.filter(v=>v!==id),id]:previous.filter(v=>v!==id));
 function apply(){
  if(!selected.length)return;
  const original={mode:performance.mode,director};
  const sampleWindow=getAnalysisSamples().slice(-6);
  const baseline=summarizeImpactWindow(sampleWindow,6);
  const appliedAt=Date.now();
  if(selected.includes("render-low"))setPerformanceMode("low");
  else if(selected.includes("render-balanced"))setPerformanceMode("balanced");
  if(selected.includes("multi-avatar-director"))setMultiAvatarDirectorEnabled(true);
  const after:ExperimentConfig={mode:selected.includes("render-low")?"low":selected.includes("render-balanced")?"balanced":performance.mode,director:director||selected.includes("multi-avatar-director")};
  setImpact(baseline?{baseline,appliedAt,actions:[...selected],before:original,after,id:`${appliedAt}-${Math.random().toString(36).slice(2,9)}`}:null);
  setUndo(original);setSelection([]);setMessage(baseline?"Optimierungen übernommen; V265 misst jetzt sechs neue Sitzungswerte für den Vergleich.":"Optimierungen übernommen; mangels sechs Ausgangsmessungen ist kein Vorher-Nachher-Vergleich möglich.");
 }
 function revert(){if(!undo)return;setPerformanceMode(undo.mode);setMultiAvatarDirectorEnabled(undo.director);setUndo(null);setImpact(null);setMessage("Vorherige Einstellungen wiederhergestellt. Vorher-Nachher-Vergleich beendet.");}
 const impactResult=impact?assessOptimizationImpact(impact.baseline,getAnalysisSamples(),impact.appliedAt):null;
 useEffect(()=>{
  if(!loaded||!impact||impactResult?.status!=="ready")return;
  const entry:PerformanceExperiment={id:impact.id,at:impact.appliedAt,actions:impact.actions,before:impact.before,after:impact.after,baseline:impact.baseline,impact:impactResult};
  setExperiments(old=>{
   if(old.some(e=>e.id===entry.id))return old;
   const next=addExperiment(old,entry);
   try{window.localStorage.setItem(EXPERIMENT_KEY,JSON.stringify(next));}catch{}
   return next;
  });
 },[loaded,impact,impactResult?.status]);
 const best=bestExperiment(experiments);
 function restoreExperiment(){
  if(!restorePreview)return;
  const original:ExperimentConfig={mode:performance.mode,director};
  setPerformanceMode(restorePreview.after.mode);setMultiAvatarDirectorEnabled(restorePreview.after.director);
  setUndo(original);setImpact(null);setRestorePreview(null);
  setMessage("Gespeicherte Konfiguration übernommen. Die zuletzt aktiven Einstellungen können rückgängig gemacht werden.");
 }
 function removeExperiment(id:string){
  const next=experiments.filter(e=>e.id!==id);setExperiments(next);
  try{window.localStorage.setItem(EXPERIMENT_KEY,JSON.stringify(next));}catch{}
  if(restorePreview?.id===id)setRestorePreview(null);
 }
 void tick;
 return <section aria-label="V264 Smart Performance Optimization Assistant" style={{padding:"0.75rem 1rem"}}>
  <h4>V264 · Smart Performance Optimization Assistant</h4>
  <p className="settings-note">Vorschläge aus tatsächlichen Sitzungsmessungen. Es erfolgen keine automatischen Änderungen. Die Auswahl ist eine Vorschau und wird erst durch „Übernehmen“ aktiv.</p>
  <p className="settings-note">Aktuell: Renderqualität <strong>{performance.mode}</strong> · Multi-Avatar Director <strong>{director?"aktiv":"aus"}</strong></p>
  {!proposals.length?<p className="settings-note">Keine anwendbaren Vorschläge. Für eine Analyse mindestens sechs gültige Sitzungsmesspunkte erfassen; bei Speicherwachstum nur beobachten, da keine sichere automatische Gegenmaßnahme verfügbar ist.</p>:
  <fieldset><legend>Änderungen auswählen und prüfen</legend>{proposals.map(p=><label key={p.id} className="setting-check" style={{display:"block",marginBottom:12}}><input type="checkbox" checked={selected.includes(p.id)} onChange={e=>toggle(p.id,e.target.checked)}/> <strong>{p.title}</strong> ({p.confidence==="moderate"?"mittlere":"schwache"} Indizien)<span style={{display:"block",marginLeft:22}}>{p.explanation}</span></label>)}
  <button type="button" disabled={!selected.length} onClick={apply}>Ausgewählte Änderungen übernehmen ({selected.length})</button></fieldset>}
  {impact&&impactResult&&<section aria-label="V265 Performance Optimization Impact Analyzer" style={{marginTop:16}}>
   <h4>V265 · Vorher/Nachher-Performance</h4>
   <p className="settings-note">Übernommen: {impact.actions.join(", ")} · Messungen danach: {impactResult.count}/{impactResult.required}. Je Fenster etwa 30 Sekunden bei laufender Wiedergabe.</p>
   {impactResult.status==="ready"&&<table><thead><tr><th>Messwert</th><th>Vorher</th><th>Nachher</th><th>Änderung</th></tr></thead><tbody>{([
    ["fps","FPS"],["p95FrameMs","Frame P95 (ms)"],["avatarCallbackMeanMs","Avatar CPU (ms)"],["slowPercent","Langsame Frames (%)"]
   ] as const).map(([key,label])=>{const metric=impactResult.metrics[key];const fmt=(n:number|null)=>n===null?"—":n.toFixed(2);return <tr key={key}><td>{label}</td><td>{fmt(metric.before)}</td><td>{fmt(metric.after)}</td><td>{metric.difference===null?"Keine vergleichbaren Daten":`${metric.difference>0?"+":""}${fmt(metric.difference)} (${metric.better===null?"neutral":metric.better?"besser":"schlechter"})`}</td></tr>;})}</tbody></table>}
   <p role="status" className="settings-note">{impactResult.note}</p>
   <p className="settings-note">Die Messwerte sind nicht GPU-Zeiten. Nur gleiche Avatare, Musik und Szenenbedingungen erlauben einen aussagekräftigen Vergleich. Die Auswertung verändert keine Einstellungen.</p>
  </section>}
  <section aria-label="V266 Performance Experiment Manager" style={{marginTop:18}}>
   <h4>V266 · Smart Performance Experiment Manager</h4>
   <p className="settings-note">Bis zu 20 abgeschlossene Vorher/Nachher-Versuche werden lokal in diesem Browser gespeichert. Der Vergleichswert berücksichtigt FPS, P95 und langsame Frames; er ist keine Garantie für gleiche Resultate bei anderer Szene, Musik oder Hardware. Keine automatische Anwendung.</p>
   {!experiments.length?<p className="settings-note">Noch keine abgeschlossenen Versuche. Übernimm oben eine Optimierung und erfasse sechs neue Messpunkte.</p>:<div style={{overflowX:"auto"}}><table><thead><tr><th>Versuch</th><th>Einstellung</th><th>FPS vorher → nachher</th><th>Frame P95 danach</th><th>Bewertung</th><th>Aktion</th></tr></thead><tbody>{[...experiments].reverse().map(e=><tr key={e.id}><td>{new Date(e.at).toLocaleString("de-AT")}{best?.id===e.id?" · Beste Messung":""}</td><td>{e.after.mode} / Director {e.after.director?"an":"aus"}</td><td>{e.impact.metrics.fps.before?.toFixed(1)??"—"} → {e.impact.metrics.fps.after?.toFixed(1)??"—"}</td><td>{e.impact.metrics.p95FrameMs.after?.toFixed(1)??"—"} ms</td><td>{e.impact.note}</td><td><button type="button" onClick={()=>setRestorePreview(e)}>Vorschau</button> <button type="button" onClick={()=>removeExperiment(e.id)}>Löschen</button></td></tr>)}</tbody></table></div>}
   {restorePreview&&<div style={{border:"1px solid currentColor",padding:12,marginTop:12}}><strong>Konfiguration vor der Übernahme prüfen</strong><p className="settings-note">Aktuell: Renderqualität {performance.mode}, Director {director?"an":"aus"}. Vorgeschlagen: Renderqualität {restorePreview.after.mode}, Director {restorePreview.after.director?"an":"aus"}. Dabei werden ausschließlich diese zwei Einstellungen geändert, keine Avatare oder Choreografien.</p><button type="button" onClick={restoreExperiment}>Gespeicherte Konfiguration übernehmen</button> <button type="button" onClick={()=>setRestorePreview(null)}>Abbrechen</button></div>}
  </section>
  <DevicePerformanceProfilesV267 experiments={experiments}/>
  {undo&&<button type="button" onClick={revert}>Letzte Übernahme rückgängig machen</button>}
  {message&&<p role="status" className="settings-note">{message}</p>}
  <p className="settings-note">Achtung: Die Vorschläge ändern globale Einstellungen und wirken über diese Ansicht hinaus. „Rückgängig“ stellt den Zustand direkt vor der letzten Übernahme wieder her; zwischenzeitliche manuelle Änderungen würden überschrieben.</p>
 </section>;
}
