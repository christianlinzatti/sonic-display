"use client";
import {useEffect,useMemo,useState} from "react";
import {readMultiAvatarDirectorEnabled,setMultiAvatarDirectorEnabled} from "@/components/visualizer/adaptiveMultiAvatarDirectorV260";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {avatarModels} from "@/components/visualizer/avatarModels";
import {proposeAvatarSelection} from "@/components/visualizer/avatarAutoSelection";
import {adviseAvatarModels} from "@/components/visualizer/avatarPerformanceAdvisor";
import {useAvatarFrameProfiler,resetAvatarFrameProfiler,useAvatarModelComparison,resetAvatarModelComparison} from "@/components/visualizer/avatarFrameProfiler";
const fmt=(n:number)=>n.toFixed(2);
export function AvatarFrameProfilerPanel(){
  const {updatePreferences}=useUiPreferences();
  const avatars=useAvatarFrameProfiler();
  const models=useAvatarModelComparison();
  const [targetCount,setTargetCount]=useState(2);
  const [directorEnabled,setDirectorEnabled]=useState(false);
  useEffect(()=>{setDirectorEnabled(readMultiAvatarDirectorEnabled());},[]);
  const advice=useMemo(()=>adviseAvatarModels(models,targetCount),[models,targetCount]);
  const selection=useMemo(()=>proposeAvatarSelection(models,avatarModels.filter(m=>m.url).map(m=>m.id),targetCount===1?1:2),[models,targetCount]);
  const [selectionMessage,setSelectionMessage]=useState("");
  function applySelection(){
    if(!selection.ready){setSelectionMessage(selection.reason);return;}
    updatePreferences({visualizerMode:"avatar",autoAvatarByGenre:false,avatarModelId:selection.ids[0],
      multiAvatarMode:targetCount===1?"solo":"sync",
      ...(targetCount!==1?{secondaryAvatarModelId:selection.ids[1]}:{})});
    setSelectionMessage(`Auswahl übernommen: ${selection.ids.join(" + ")}. Manuelle Auswahl weiterhin möglich.`);
  }
  return <section aria-label="Avatar CPU Profiling" style={{padding:"0.75rem 1rem"}}>
    <h3>V251 · Avatar CPU-Profiling</h3>
    <p className="settings-note">Gemessen wird die synchrone CPU-Zeit des zentralen Animations-Callbacks pro Avatar (120 letzte Frames). Keine GPU-Zeit, kein vollständiges React-Rendering und keine weiteren Avatar-Callbacks. Eine Messung ist daher keine gesamte Avatar-Auslastung.</p>
    {!avatars.length ? <p className="settings-note">Noch keine Avatar-Messungen. Starte die 3D-Visualisierung.</p> :
      <div style={{maxHeight:320,overflowY:"auto"}}><table><thead><tr><th>Avatar</th><th>Ø CPU</th><th>P95</th><th>Maximum</th><th>Frames</th></tr></thead><tbody>
      {avatars.map(a=><tr key={a.id}><td>{a.label}</td><td>{fmt(a.meanMs)} ms</td><td>{fmt(a.p95Ms)} ms</td><td>{fmt(a.maxMs)} ms</td><td>{a.frames}</td></tr>)}
      </tbody></table></div>}
    <p className="settings-note">Nach P95 sortiert. Werte werden nur im Arbeitsspeicher gehalten und beim Entfernen des Avatars freigegeben.</p>
    <button type="button" onClick={resetAvatarFrameProfiler}>Avatar-Messungen zurücksetzen</button>
    <h3>V257 · Avatar-Vergleich (aktuelle Sitzung)</h3>
    <p className="settings-note">Vergleicht die CPU-Zeit des Animations-Callbacks nach Avatar-Modell. Grün markierte Favoriten werden nicht abgeleitet: Niedrigere P95-Werte bedeuten nur günstigere Callback-Zeiten, nicht automatisch höhere FPS. Messungen bleiben auch nach Modellwechsel bis zum Zurücksetzen erhalten (maximal 32 Modelle, 240 Stichproben pro Modell). Vergleichbar sind vor allem Messungen mit ähnlichen Animationen und Szenen.</p>
    {!models.length ? <p className="settings-note">Noch keine Vergleichsdaten. Lass einen Avatar für einige Frames laufen.</p> :
      <div style={{maxHeight:340,overflowY:"auto"}}><table aria-label="V257 Avatar-Leistungsvergleich"><thead><tr><th>Modell</th><th>Ø CPU</th><th>P95</th><th>Max.</th><th>Samples</th><th>Aktiv</th></tr></thead><tbody>
      {models.map(m=><tr key={m.label}><td>{m.label}</td><td>{fmt(m.meanMs)} ms</td><td>{fmt(m.p95Ms)} ms</td><td>{fmt(m.maxMs)} ms</td><td>{m.samples}</td><td>{m.activeInstances}</td></tr>)}
      </tbody></table></div>}
    <button type="button" onClick={resetAvatarModelComparison}>Avatar-Vergleich zurücksetzen</button>
    <h3>V258 · Smart Avatar Performance Advisor</h3>
    <p className="settings-note">Vorschläge nur für ausreichend gemessene Modelle (mindestens 30 Stichproben). Die 3,5-ms-Grenze ist eine vorsichtige Heuristik für die Summe der P95-Animations-Callbacks, kein garantiertes Frame-Budget und kein Raspberry-Pi-Benchmark.</p>
    <label htmlFor="avatar-advisor-count">Geplante Avatare: </label>
    <select id="avatar-advisor-count" value={targetCount} onChange={e=>setTargetCount(Number(e.target.value))}>
      {[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}
    </select>
    {!advice.candidates.length ? <p className="settings-note">Noch keine ausreichend belastbaren Modellmessungen. Lass einen oder mehrere Avatare länger animieren.</p> : <>
      <p className="settings-note">{advice.suggested.length} von {targetCount} gewünschten Modellplätzen vorgeschlagen · geschätzte P95-Callback-Summe: {fmt(advice.usedCallbackBudgetMs)} ms / {fmt(advice.estimatedCallbackBudgetMs)} ms (Heuristik).</p>
      <div style={{maxHeight:300,overflowY:"auto"}}><table aria-label="V258 Avatar-Empfehlungen"><thead><tr><th>Modell</th><th>P95</th><th>Bewertung</th><th>Messbasis</th><th>Empfohlen</th></tr></thead><tbody>
        {advice.candidates.map(m=><tr key={m.label}><td>{m.label}</td><td>{fmt(m.p95Ms)} ms</td><td>{m.tier==="efficient"?"Effizient":m.tier==="balanced"?"Mittel":"Aufwendig"}</td><td>{m.samples} ({m.confidence==="good"?"gut":m.confidence==="moderate"?"mittel":"gering"})</td><td>{advice.suggested.some(s=>s.label===m.label)?"Ja":"–"}</td></tr>)}
      </tbody></table></div>
    </>}
    <h3>V259 · Smart Multi-Avatar Auto Selection</h3>
    <p className="settings-note">Freiwillige Einmal-Auswahl auf Basis von mindestens 80 CPU-Messpunkten je installiertem GLTF-Modell. Kein laufender automatischer Wechsel. Für 1 oder 2 Avatare; bei 3–4 geplanten Avataren werden maximal 2 gleichzeitig ausgewählt. Bereits eingestellte Choreografien bleiben unverändert.</p>
    <p className="settings-note">{selection.reason}{selection.ready?` · ${selection.ids.join(" + ")} · geschätzte P95-Summe ${fmt(selection.estimatedMs)} ms`:""}</p>
    <button type="button" disabled={!selection.ready} onClick={applySelection}>Empfohlene Avatar-Kombination übernehmen</button>
    {selectionMessage && <p role="status" className="settings-note">{selectionMessage}</p>}
    <h3>V260 · Adaptive Multi-Avatar Performance Director</h3>
    <p className="settings-note">Optionaler Live-Modus: Bei gleichzeitig aktiven, ausreichend gemessenen Avataren werden ausschließlich aufwendige Choreografie-Berechnungen vorsichtig gedrosselt. Beats, Mixer, Posen und IK bleiben pro Frame aktiv. Keine automatischen Charakterwechsel. Die Einstellung gilt für diesen Browser.</p>
    <label><input type="checkbox" checked={directorEnabled} onChange={e=>{setDirectorEnabled(e.target.checked);setMultiAvatarDirectorEnabled(e.target.checked);}} /> Adaptive Multi-Avatar-Optimierung aktivieren</label>
    <p role="status" className="settings-note">{directorEnabled?"Aktiv: CPU-basierte Lastverteilung für mehrere Avatare.":"Aus: bisherige V252-Lastverteilung bleibt aktiv."}</p>
    <p className="settings-note">{advice.note} Für einen Raspberry Pi müssen die Messungen auf dem Raspberry Pi selbst durchgeführt werden; Desktop-Messwerte sind nicht übertragbar.</p>

  </section>;
}
