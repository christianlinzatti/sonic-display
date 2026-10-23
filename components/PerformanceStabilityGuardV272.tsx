"use client";
import {useEffect,useRef,useState} from "react";
import {SESSION_METRICS_EVENT} from "@/services/monitoring/longSessionMetrics";
import {getAnalysisSamples} from "@/services/monitoring/performanceSessionAnalyzerV262";
import {assessStability,shouldRecover,type GuardMode} from "@/services/monitoring/performanceStabilityGuardV272";
import {setPerformanceMode,useAdaptivePerformance} from "@/components/visualizer/adaptivePerformance";

const MODES:GuardMode[]=["auto","high","balanced","low"];
/** Opt-in, one-shot safety rollback. Nothing changes until explicitly armed and degradation persists. */
export function PerformanceStabilityGuardV272(){
 const performance=useAdaptivePerformance();
 const [target,setTarget]=useState<GuardMode>("balanced");
 const [armed,setArmed]=useState(false);
 const [tick,setTick]=useState(0);
 const [message,setMessage]=useState("Nicht aktiv. Nach Aktivierung wird bei anhaltenden Einbrüchen einmalig auf die bestätigte Zielqualität gewechselt.");
 const [restore,setRestore]=useState<GuardMode|null>(null);
 const armedRef=useRef(false);
 const lastChange=useRef(-Infinity);
 const origin=useRef<GuardMode|null>(null);
 const targetRef=useRef<GuardMode>("balanced");
 const observedMode=useRef<GuardMode>(performance.mode);
 targetRef.current=target;
 const assessment=assessStability(getAnalysisSamples(),Date.now());void tick;
 useEffect(()=>{const update=()=>setTick(v=>v+1);window.addEventListener(SESSION_METRICS_EVENT,update);return()=>window.removeEventListener(SESSION_METRICS_EVENT,update);},[]);
 // Do not silently override a change made in another performance panel or during a benchmark.
 useEffect(()=>{if(armedRef.current&&performance.mode!==observedMode.current){armedRef.current=false;setArmed(false);setMessage("Manueller Qualitätswechsel erkannt. Überwachung beendet.");}observedMode.current=performance.mode;},[performance.mode]);
 useEffect(()=>{const onSample=()=>{
   if(!armedRef.current||document.visibilityState!=="visible")return;
   const now=Date.now(); const a=assessStability(getAnalysisSamples(),now);
   if(!shouldRecover(a,armedRef.current,true,now,lastChange.current))return;
   const desired=targetRef.current;
   const previous=observedMode.current;
   armedRef.current=false;setArmed(false);
   if(previous===desired){setMessage("Leistungseinbruch erkannt. Zielqualität ist bereits aktiv; keine Änderung.");return;}
   origin.current=previous;setRestore(previous);lastChange.current=now;
   observedMode.current=desired;setPerformanceMode(desired);
   setMessage(`Anhaltender Einbruch: Renderqualität von ${previous} auf ${desired} zurückgesetzt. Rückgängig ist verfügbar.`);
  };window.addEventListener(SESSION_METRICS_EVENT,onSample);return()=>window.removeEventListener(SESSION_METRICS_EVENT,onSample);},[]);
 const arm=()=>{if(target===performance.mode){setMessage("Bitte eine andere stabile Zielqualität als die aktuelle auswählen.");return;}origin.current=performance.mode;observedMode.current=performance.mode;lastChange.current=Date.now()-60000;armedRef.current=true;setArmed(true);setRestore(null);setMessage(`Überwachung aktiv: Bei sechs aufeinanderfolgenden schlechten Messungen wird einmalig ${target} gewählt.`);};
 const disarm=()=>{armedRef.current=false;setArmed(false);setMessage("Überwachung deaktiviert. Die Renderqualität wurde nicht geändert.");};
 const undo=()=>{if(restore===null)return;armedRef.current=false;setArmed(false);observedMode.current=restore;setPerformanceMode(restore);setRestore(null);lastChange.current=Date.now();setMessage("Vorherige Renderqualität wiederhergestellt.");};
 return <section aria-label="V272 Performance Stability Guard" style={{padding:12,border:"1px solid currentColor",marginTop:16}}>
  <h4>V272 · Performance Stability Guard</h4>
  <p className="settings-note">Optionaler Schutz vor länger anhaltenden FPS-Einbrüchen. Nur während der Wiedergabe im sichtbaren Tab mit frischen 5-Sekunden-Messungen. Bei sechs aufeinanderfolgenden schlechten Messwerten (FPS &lt; 30 oder Frame-P95 &gt; 45 ms) wird einmalig auf die von dir gewählte stabile Qualität gewechselt.</p>
  <p className="settings-note">Aktuell: {performance.mode}. Status: {assessment.status} – {assessment.detail}</p>
  <label htmlFor="v272-recovery">Bestätigte stabile Zielqualität </label><select id="v272-recovery" value={target} disabled={armed} onChange={e=>setTarget(e.target.value as GuardMode)}>{MODES.map(mode=><option key={mode} value={mode}>{mode}</option>)}</select>
  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>{!armed?<button type="button" onClick={arm} disabled={target===performance.mode}>Schutz für diese Sitzung aktivieren</button>:<button type="button" onClick={disarm}>Schutz deaktivieren</button>}{restore!==null&&!armed&&<button type="button" onClick={undo}>Qualitätswechsel rückgängig machen</button>}</div>
  <p role="status" className="settings-note">{message}</p>
  <p className="settings-note">Keine Änderungen an Avataren, Choreografien oder Motion-Dateien. Keine Hintergrundüberwachung, kein automatisches erneutes Aktivieren. Andere Qualitätswechsel beenden den Schutz.</p>
 </section>;
}
