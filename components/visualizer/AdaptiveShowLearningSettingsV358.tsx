'use client';
import {useEffect,useMemo,useState} from 'react';
import {SHOW_LEARNING_EVENT_V358,DEFAULT_SHOW_LEARNING_V358,
 readShowLearningSettingsV358,readShowLearningHistoryV358,saveShowLearningSettingsV358,
 clearShowLearningV358,contextKeyV358,refineLearnedShowV358,
 type ShowLearningSettingsV358,type LearningModeV358} from '@/services/stageContent/adaptiveShowLearningV358';
import {planAutonomousShowV356,DEFAULT_AUTO_SHOW_V356,type AutoShowSectionV356} from '@/services/stageContent/autonomousShowV356';
import {refineShowQualityV357,DEFAULT_SHOW_QUALITY_V357} from '@/services/stageContent/showQualityV357';
const sections:AutoShowSectionV356[]=['verse','hook','build','drop','break'];
/** Settings can be used without a running Canvas; only actual live playing learns. */
export function AdaptiveShowLearningSettingsV358(){
 const [settings,setSettings]=useState(readShowLearningSettingsV358);
 const [history,setHistory]=useState(readShowLearningHistoryV358);
 const [genre,setGenre]=useState('Deutschrap');
 const [section,setSection]=useState<AutoShowSectionV356>('hook');
 const [confirmReset,setConfirmReset]=useState(false);
 useEffect(()=>{const sync=()=>{setSettings(readShowLearningSettingsV358());setHistory(readShowLearningHistoryV358());};
  window.addEventListener(SHOW_LEARNING_EVENT_V358,sync);
  return()=>window.removeEventListener(SHOW_LEARNING_EVENT_V358,sync);},[]);
 const change=(patch:Partial<ShowLearningSettingsV358>)=>setSettings(saveShowLearningSettingsV358({...settings,...patch}));
 const total=history.entries.reduce((sum,e)=>sum+e.observations,0);
 const observedContexts=new Set(history.entries.map(e=>e.key)).size;
 const context=useMemo(()=>({genre,section,lyricsActive:false,mediaCount:0,avatarCount:2,playing:true,reducedMotion:false,manualOverride:false}),[genre,section]);
 const sample=useMemo(()=>{
  const p=planAutonomousShowV356({trackId:'v358-preview',progressMs:45000,durationMs:240000,bpm:140,genre,section,
   lyricsActive:false,avatarCount:2,playing:true,reducedMotion:false,automaticShowEnabled:true},
   {...DEFAULT_AUTO_SHOW_V356,lookahead:8});
  const q=refineShowQualityV357(p,{trackId:'v358-preview',section,lyricsActive:false,
   avatarCount:2,mediaCount:0,playing:true,reducedMotion:false},DEFAULT_SHOW_QUALITY_V357);
  return refineLearnedShowV358(q,context,settings,history);
 // preview has deliberately separate inputs and never learns/writes data
 },[settings,history,genre,section,context]);
 const best=[...history.entries].sort((a,b)=>b.observations-a.observations).slice(0,8);
 return <fieldset className="sonic-show-learning-v358"><legend>V358 – Adaptive Show Learning</legend>
  <p>Erkennt lokal wiederkehrend gute Regie-Kombinationen aus <strong>tatsächlich abgespielten</strong> automatischen Szenen. Echte FPS/P95-Messwerte und der ausdrücklich heuristische V357-Planungsscore werden getrennt erfasst.</p>
  <label><input type="checkbox" checked={settings.enabled} onChange={e=>change({enabled:e.target.checked})}/>
   Lokales Lernen aktivieren (Opt-in; standardmäßig aus)</label>
  <div className="sonic-show-toolbar-v354">
   <label>Lernmodus <select value={settings.mode} onChange={e=>change({mode:e.target.value as LearningModeV358})}>
    <option value="off">Aus (nur gespeicherte Historie anzeigen)</option>
    <option value="conservative">Vorsichtig</option>
    <option value="balanced">Ausgewogen</option></select></label>
   <label>Mindest-Beobachtungen ({settings.minSamples}) <input type="range" min="3" max="12" step="1" value={settings.minSamples}
    onChange={e=>change({minSamples:Number(e.target.value)})}/></label>
   <label>Maximaler Einfluss ({settings.maxInfluence} %) <input type="range" min="5" max="40" step="5" value={settings.maxInfluence}
    onChange={e=>change({maxInfluence:Number(e.target.value)})}/></label>
  </div>
  <p role="status"><strong>{total} Beobachtungen</strong> in {observedContexts} Kontexten · {history.entries.length} Kombinationen gespeichert.</p>
  <details><summary>Gelernte Kamera- und Formationskombinationen</summary>
   {best.length?<div style={{overflowX:'auto'}}><table><thead><tr><th>Musikumfeld</th><th>Kamera</th><th>Formation</th><th>Beobachtungen</th><th>Ø FPS (gemessen)</th><th>Ø Plan-Score (heuristisch)</th></tr></thead>
    <tbody>{best.map(e=><tr key={`${e.key}|${e.shot}|${e.formation}`}><td>{e.key}</td><td>{e.shot}</td><td>{e.formation}</td>
     <td>{e.observations}</td><td>{(e.fpsSum/e.observations).toFixed(1)}</td><td>{(e.planScoreSum/e.observations).toFixed(0)}/100</td></tr>)}</tbody></table></div>:
    <p>Noch keine Live-Beobachtungen. Spiele mehrere vollständige Musikphrasen mit aktivierter automatischer Show ab.</p>}
  </details>
  <details><summary>Regie mit Lernhistorie simulieren (ohne Speichern)</summary>
   <div className="sonic-show-toolbar-v354"><label>Genre <select value={genre} onChange={e=>setGenre(e.target.value)}>
    {['Deutschrap','Hardstyle','Hardtekk','Techno','Ambient','Pop','Rock'].map(g=><option key={g}>{g}</option>)}
   </select></label><label>Abschnitt <select value={section} onChange={e=>setSection(e.target.value as AutoShowSectionV356)}>
    {sections.map(sec=><option key={sec}>{sec}</option>)}</select></label></div>
   <p>Kontext: {contextKeyV358(context)} · {sample.matchedSamples} passende Erfahrungswerte</p>
   <p>{sample.active?sample.changes.join(' · '):sample.reason}</p>
   <ol>{sample.moments.slice(0,5).map(m=><li key={m.index}>Phrase {m.index}: {m.shot} · {m.formation} · FX {Math.round(m.fxGain*100)} %</li>)}</ol>
  </details>
  <div className="avatar-editor-buttons">
   {!confirmReset?<button type="button" onClick={()=>setConfirmReset(true)}>Lernhistorie löschen …</button>:
    <><button type="button" onClick={()=>{clearShowLearningV358();setConfirmReset(false);}}>Ja, Lernhistorie löschen</button>
     <button type="button" onClick={()=>setConfirmReset(false)}>Abbrechen</button></>}
   <button type="button" onClick={()=>change(DEFAULT_SHOW_LEARNING_V358)}>Lernen deaktivieren &amp; Einstellungen zurücksetzen</button>
  </div>
  <small>Datenschutz: ausschließlich lokale, auf höchstens 64 Kombinationen begrenzte Statistik; keine Song-IDs, Künstler, Lyrics, Bilder oder personenbezogenen Daten in der Lernhistorie. Keine Cloudübertragung. Ohne aktuelle Messwerte, bei Pause, manueller Timeline oder reduzierter Bewegung wird nicht gelernt. Änderungen betreffen nur seltene automatische Szenenvorschläge; V351-Lyrics-Schutz, V355-Performance-Limits und manuelle Presets bleiben vorrangig. Ein hoher Score belegt keine subjektiv bessere Show.</small>
 </fieldset>;
}
