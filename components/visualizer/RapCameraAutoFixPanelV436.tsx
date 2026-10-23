"use client";
import {useMemo,useState} from "react";
import type {Lyrics} from "@/types/music";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {useAudioAnalysis} from "@/context/AudioAnalysisContext";
import {buildRapCameraTimelineV431} from "./rapCameraTimelineV431";
import {planRapCameraAutoFixV436} from "./rapCameraAutoFixV436";
import {saveRapCameraOverrideV430,normalizeRapCameraLibraryV430} from "./rapCameraShotStudioV430";

const EMPTY_V436:never[]=[];

export function RapCameraAutoFixPanelV436({trackId,lyrics,avatarCount,onPreview}:{
  trackId:string;lyrics:Lyrics|null;avatarCount:number;onPreview?:(timeMs:number)=>void;
}){
  const {preferences,updatePreferences}=useUiPreferences();
  const {metrics}=useAudioAnalysis();
  const [expanded,setExpanded]=useState(false);
  const [notice,setNotice]=useState("");
  const enabled=preferences.rapCameraAutoFixEnabledV436??true;
  const manual=trackId?(preferences.rapCameraOverridesV430??{})[trackId]??EMPTY_V436:EMPTY_V436;
  const frames=trackId?(preferences.rapCameraKeyframesV432??{})[trackId]??EMPTY_V436:EMPTY_V436;
  const assignments=trackId?(preferences.rapDuetAssignmentsV416??{})[trackId]??EMPTY_V436:EMPTY_V436;
  const approxBpm=Number.isFinite(metrics.bpm)?Math.round((metrics.bpm??0)/5)*5:null;
  const timeline=useMemo(()=>buildRapCameraTimelineV431({trackId,lyrics,
    assignments,overrides:manual,avatarCount,
    autoAssignIfMissing:preferences.rapCameraAutoFixEnabledV436??true}),[trackId,lyrics,assignments,manual,avatarCount,preferences.rapCameraAutoFixEnabledV436]);
  const plan=useMemo(()=>planRapCameraAutoFixV436({trackId,items:timeline.items,
    manualOverrides:manual,keyframes:frames,
    settings:{smoothness:preferences.rapCameraTransitionSmoothnessV433??55,
      beatSync:preferences.rapCameraBeatSyncV433??true},bpm:approxBpm,
    duo:avatarCount>1,lyricsProtected:preferences.lyricsVisible??true,
    strength:preferences.rapCameraStrengthV429??65}),
    [trackId,timeline,manual,frames,preferences.rapCameraTransitionSmoothnessV433,
      preferences.rapCameraBeatSyncV433,approxBpm,avatarCount,
      preferences.lyricsVisible,preferences.rapCameraStrengthV429]);
  const commit=()=>{
    if(!trackId||!plan.available||!plan.overrides.length)return;
    const old=normalizeRapCameraLibraryV430(preferences.rapCameraOverridesV430);
    let lines=old[trackId]??[];
    const existing=new Set(lines.map(item=>item.lineIndex));
    let saved=0;
    for(const item of plan.overrides){
      if(existing.has(item.lineIndex)||lines.length>=256)continue;
      lines=saveRapCameraOverrideV430(lines,item.lineIndex,item.shot,item.strength);
      saved++;
    }
    if(saved){updatePreferences({rapCameraOverridesV430:{...old,[trackId]:lines}});}
    setNotice(saved?`${saved} Zeilen in V430 fest gespeichert.`:"Keine weiteren Zeilen speicherbar.");
  };
  return <fieldset aria-label="V436 Rap Camera Auto Fix Studio"
      style={{marginTop:12,padding:12,border:"1px solid #63816b",borderRadius:8}}>
    <legend>V436 · Automatischer Rap Camera Auto-Fix</legend>
    <label className="setting-check"><input type="checkbox" checked={enabled}
      onChange={e=>{updatePreferences({rapCameraAutoFixEnabledV436:e.target.checked});setNotice("");}}/>
      <strong>Ganzer Song automatisch optimieren</strong> (empfohlen)</label>
    <p>Keine einzelnen Keyframes nötig: Die Analyse läuft automatisch, sobald synchronisierte Lyrics und
      mindestens zwei Avatare vorhanden sind. Bestehende V416-Rapper-Zuordnungen haben Vorrang.</p>
    {plan.available?<>
      <p role="status">{plan.analyzed} Lyrics-Zeilen geprüft · {plan.eligible} aktive Rap-Zeilen ·
        <strong> {plan.changes.length} automatische Korrekturen</strong> ·
        {plan.protectedLines} manuelle Zeilen geschützt</p>
      <p>Geschätzte Kameraqualität: <strong>{plan.scoreBefore??"–"}</strong> →
        <strong> {plan.scoreAfter??"–"}</strong> / 100 (Stichprobe: {plan.sampledTransitions} Übergänge)</p>
      <p>Automatisch gewählte Übergänge: {plan.settings.smoothness} % Weichheit ·
        BPM-Anpassung {plan.settings.beatSync?"an":"aus"}.
        {enabled?" Die Automatik wird bei aktiver V429-Kamera ohne Speichern verwendet.":" Die Automatik ist abgeschaltet."}</p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button type="button" onClick={()=>setExpanded(value=>!value)} aria-expanded={expanded}>
          {expanded?"Korrekturen ausblenden":"Automatische Korrekturen ansehen"}</button>
        <button type="button" onClick={commit} disabled={!plan.changes.length}>
          Vorschläge optional fest in V430 speichern</button>
      </div>
      {expanded&&<div style={{maxHeight:260,overflow:"auto",marginTop:8}}>
        {plan.changes.length?plan.changes.slice(0,64).map(change=><div key={change.lineIndex}
          style={{padding:"4px 0",borderBottom:"1px solid #53606a"}}>
          <button type="button" onClick={()=>onPreview?.(change.startMs)}>
            {(change.startMs/1000).toFixed(1)} s · Zeile {change.lineIndex+1}</button>{" "}
          {change.previousShot} → <strong>{change.shot}</strong> ·
          {change.reason==="short-line"?"zu kurze Einstellung":"zu viele schnelle Schnitte"}
        </div>):<p>Keine automatischen Korrekturen erforderlich.</p>}
        {plan.changes.length>64&&<small>Weitere {plan.changes.length-64} Änderungen werden automatisch berücksichtigt.</small>}
      </div>}
      {notice&&<p role="status">{notice}</p>}
    </>:<p>Für diesen Song sind keine geeigneten synchronisierten Rap-Zeilen verfügbar. V436 kann die Grundregie auch ohne manuelle V416-Rapper-Zuordnungen erstellen.
      Ohne diese Daten verändert V436 keine Kamerafahrt.</p>}
    <small>V436 erstellt den Vorschlag automatisch und berechnet ihn nur bei Änderungen der Song-Daten neu.
      Solange die V429-Kamera ausgeschaltet ist, bleibt der Livebetrieb unverändert. Manuelle V430-Shots,
      gespeicherte V432-Keyframes, andere Kameraregien, reduzierte Bewegung und Lyrics-Schutz haben Vorrang.
      Qualitätswerte sind Heuristiken, keine visuelle Prüfung gerenderter Gesichter. Ohne ausdrückliches Festschreiben
      werden keine V430-Shots dauerhaft überschrieben.</small>
  </fieldset>;
}
