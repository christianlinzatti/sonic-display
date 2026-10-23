"use client";
import dynamic from "next/dynamic";
import {useMemo,useState} from "react";
import type {Lyrics} from "@/types/music";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {useAudioAnalysis} from "@/context/AudioAnalysisContext";
import {getAvatarModel} from "./avatarModels";
import {buildRapCameraTimelineV431,timelineLineAtV431} from "./rapCameraTimelineV431";
import {normalizeRapCameraPreviewDraftV434,rapCameraPreviewPathV434,
  sampleRapCameraTransitionPreviewV434} from "./rapCameraTransitionPreviewV434";
import {inspectRapCameraTransitionV435,proposeRapCameraQualitySettingsV435} from
  "./rapCameraQualityOptimizerV435";

const CameraLivePreviewV291=dynamic(()=>import("./CameraLivePreviewV291").then(m=>m.CameraLivePreviewV291),
  {ssr:false,loading:()=> <p>3D-Kameravorschau wird geladen …</p>});
const seconds=(ms:number)=>(ms/1000).toFixed(2)+" s";

/** Isolated editor: A is the current V433 setup, B is a draft until explicitly accepted. */
export function RapCameraTransitionPreviewPanelV434({trackId,lyrics,previewMs,avatarCount}: {
  trackId:string;lyrics:Lyrics|null;previewMs:number;avatarCount:number;
}){
  const {preferences,updatePreferences}=useUiPreferences();
  const {metrics}=useAudioAnalysis();
  const original=normalizeRapCameraPreviewDraftV434({
    smoothness:preferences.rapCameraTransitionSmoothnessV433??55,
    beatSync:preferences.rapCameraBeatSyncV433??true});
  const [candidate,setCandidate]=useState(()=>({...original}));
  const [active,setActive]=useState<"A"|"B">("B");
  const [offsetMs,setOffsetMs]=useState(0);
  const [previewOpen,setPreviewOpen]=useState(false);
  const [notice,setNotice]=useState("");
  const timeline=useMemo(()=>buildRapCameraTimelineV431({trackId,lyrics,
    assignments:trackId?(preferences.rapDuetAssignmentsV416??{})[trackId]:[],
    overrides:trackId?(preferences.rapCameraOverridesV430??{})[trackId]:[],avatarCount,
    autoAssignIfMissing:preferences.rapCameraAutoFixEnabledV436??true}),
    [trackId,lyrics,preferences.rapDuetAssignmentsV416,preferences.rapCameraOverridesV430,avatarCount,preferences.rapCameraAutoFixEnabledV436]);
  const index=timelineLineAtV431(timeline.items,previewMs);
  const item=index>=0?timeline.items[index]:null;
  const previous=index>0?timeline.items[index-1]:null;
  const maxMs=item?Math.max(0,Math.min(1500,Math.floor(item.durationMs)-1)):0;
  const atMs=(item?.startMs??0)+Math.min(offsetMs,maxMs);
  const bpm=metrics.bpm; // This is an estimated BPM; its playback-clock phase is approximate.
  const baseInput=item?{trackId,current:item,previous,progressMs:atMs,
    duo:avatarCount>=2,strength:preferences.rapCameraStrengthV429??65,
    lyricsProtected:preferences.lyricsVisible??true,bpm}:null;
  const a=baseInput?sampleRapCameraTransitionPreviewV434({...baseInput,settings:original}):null;
  const b=baseInput?sampleRapCameraTransitionPreviewV434({...baseInput,settings:candidate}):null;
  const chosen=active==="A"?a:b;
  // Only the line/shot or editable settings change quality. Playback scrubbing must not
  // trigger the 42-candidate optimisation on every Spotify progress update.
  const inspectionInput=useMemo(()=>item?{trackId,current:item,previous,
    strength:preferences.rapCameraStrengthV429??65,duo:avatarCount>=2,
    lyricsProtected:preferences.lyricsVisible??true,bpm,settings:original,
    history:timeline.items.slice(Math.max(0,index-32),index+1)}:null,
    [trackId,item,previous,avatarCount,preferences.rapCameraStrengthV429,
      preferences.lyricsVisible,bpm,timeline,index]);
  const qualityA=useMemo(()=>inspectionInput?inspectRapCameraTransitionV435(inspectionInput,original):null,
    [inspectionInput,original.smoothness,original.beatSync]);
  const qualityB=useMemo(()=>inspectionInput?inspectRapCameraTransitionV435(inspectionInput,candidate):null,
    [inspectionInput,candidate]);
  const suggestion=useMemo(()=>inspectionInput?proposeRapCameraQualitySettingsV435(inspectionInput,candidate):null,
    [inspectionInput,candidate]);
  const path=baseInput&&previewOpen?rapCameraPreviewPathV434({...baseInput,settings:active==="A"?original:candidate}):[];
  const graphDuration=item?Math.min(1500,Math.max(100,item.durationMs)):1000;
  const progressCurve=(settings:typeof original)=>!baseInput?"":Array.from({length:31},(_,i)=>{
    const fraction=i/30;
    const point=sampleRapCameraTransitionPreviewV434({...baseInput,
      progressMs:item!.startMs+graphDuration*fraction,settings});
    return `${(fraction*290+5).toFixed(1)},${(93-point.progress*82).toFixed(1)}`;
  }).join(" ");
  const model=getAvatarModel(preferences.avatarModelId??"procedural");
  const dirty=candidate.smoothness!==original.smoothness||candidate.beatSync!==original.beatSync;
  const canPreview=!!item&&!!chosen?.available;
  const accept=()=>{
    if(!dirty||!canPreview)return;
    updatePreferences({rapCameraTransitionSmoothnessV433:candidate.smoothness,
      rapCameraBeatSyncV433:candidate.beatSync});
    setNotice("Variante B gespeichert. V433 bleibt nur aktiv, wenn die Live-Option eingeschaltet ist.");
  };
  return <fieldset aria-label="V434 Rap Camera Preview & Transition Studio"
    style={{marginTop:12,padding:12,border:"1px solid #7282bb",borderRadius:10,minWidth:0}}>
    <legend>V434 · Rap Camera Preview & Transition Studio</legend>
    <p>Vergleiche A (aktuelle V433-Einstellung) und B (Entwurf) an derselben Lyrics-Stelle. Die Vorschau verändert weder Spotify noch die Bühnenkamera.</p>
    {!item?<p>Wähle eine synchronisierte Lyrics-Zeile in der V431-Timeline.</p>:<>
      <p>Zeile {item.lineIndex+1}: <strong>{item.text||"(Pause)"}</strong> · {seconds(item.startMs)} ·
        {previous?` vorher: ${previous.shot}`:" erster Shot"} → {item.shot}</p>
      {!canPreview&&<p>Für den Übergang ist eine gültige V416-Rapper-Szene nötig.</p>}
      {canPreview&&<>
        <label>Gleicher Vorschauzeitpunkt für A und B: +{seconds(Math.min(offsetMs,maxMs))}
          <input type="range" aria-label="V434 Übergang Vorschauzeit" min="0" max={Math.max(1,maxMs)}
            step="20" value={Math.min(offsetMs,maxMs)} onChange={e=>setOffsetMs(Number(e.target.value))}/></label>
        <p><small>Musiktempo: {bpm&&Number.isFinite(bpm)?`${Math.round(bpm)} BPM (geschätzt)`:"nicht verfügbar"}.
          Die Live-Kick-Akzente werden nicht rückwirkend als Treffer in der Vorschau ausgegeben.</small></p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10,margin:"12px 0"}}>
          {(["A","B"] as const).map(which=>{
            const state=which==="A"?a!:b!;
            const settings=which==="A"?original:candidate;
            return <button type="button" key={which} aria-pressed={active===which}
              onClick={()=>setActive(which)} style={{textAlign:"left",padding:12,borderRadius:9,color:"#eff5ff",
                background:active===which?"#1f3b58":"#182437",border:`2px solid ${active===which?"#79d6ff":"#4c5e75"}`}}>
              <strong>{which} · {which==="A"?"Gespeichert":"Entwurf"}</strong>
              <span style={{display:"block",marginTop:6}}>Weichheit: {settings.smoothness} % · BPM-Raster: {settings.beatSync?"an":"aus"}</span>
              <span style={{display:"block"}}>Dauer: {state.durationMs} ms · Raster-Wartezeit: {state.delayMs} ms</span>
              <span style={{display:"block"}}>Fortschritt: {Math.round(state.progress*100)} % · Z-Abstand: {state.pose.z.toFixed(2)}</span>
            </button>;
          })}
        </div>
        <svg role="img" aria-label="Übergangskurven A und B, Verlauf von 0 bis 100 Prozent"
          viewBox="0 0 300 110" style={{display:"block",width:"100%",maxWidth:560,height:"auto",
            background:"#101b2d",borderRadius:8,marginBottom:9}}>
          <path d="M5 8 V94 H295" fill="none" stroke="#66809c" strokeWidth="1"/>
          <path d="M5 11 H295" stroke="#475c74" strokeDasharray="3 4"/>
          <polyline fill="none" stroke="#62b9ff" strokeWidth="2.5" points={progressCurve(original)}/>
          <polyline fill="none" stroke="#fbbf7b" strokeWidth="2.5" points={progressCurve(candidate)}/>
          <path d={`M${5+290*Math.min(offsetMs,graphDuration)/graphDuration} 5 V94`}
            stroke="#e2e8f0" strokeDasharray="3 3"/>
          <text x="11" y="105" fill="#bed1e8" fontSize="9">0 ms</text>
          <text x="247" y="105" fill="#bed1e8" fontSize="9">{graphDuration} ms</text>
          <text x="12" y="22" fill="#62b9ff" fontSize="10">A</text>
          <text x="29" y="22" fill="#fbbf7b" fontSize="10">B</text>
        </svg>
        {!a?.changed&&<p>Der Rapper und die Shot-Art bleiben gleich – V433 löst hier keinen neuen Übergang aus.</p>}
        <section aria-label="V435 Intelligent Rap Camera Quality Optimizer"
          style={{border:"1px solid #537383",borderRadius:8,padding:12,margin:"12px 0"}}>
          <strong>V435 · Intelligent Rap Camera Quality Optimizer</strong>
          <p>Heuristische A/B-Prüfung: Tempo der Kamerafahrt, verfügbare Ruhezeit,
            schnelle Shot-Wechsel und grobe Bildausschnitt-Grenzen.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
            {([{label:"A · Gespeichert",report:qualityA},{label:"B · Entwurf",report:qualityB}] as const).map(({label,report})=><div
              key={label} style={{border:"1px solid #536476",borderRadius:8,padding:9}}>
              <strong>{label}</strong>
              <p style={{margin:"5px 0"}}>Qualitätsindikator: {report?.score??"–"} / 100</p>
              {report?.available&&<small>Max. Bewegung: {report.metrics.peakUnitsPerSecond.toFixed(2)}
                {" "}Einheiten/s · Restzeit: {Math.round(report.metrics.remainingHoldMs)} ms
                {" "}· Shot-Wechsel/4 s: {report.metrics.changesInFourSeconds}</small>}
            </div>)}
          </div>
          {(qualityB?.issues.length??0)>0?<ul style={{margin:"10px 0"}}>{qualityB!.issues.map(issue=><li
            key={issue.code}><strong>{issue.severity==="warning"?"Warnung":"Hinweis"}:</strong>{" "}
            {issue.message} <small>{issue.advice}</small></li>)}</ul>:
            <p>Variante B: keine Auffälligkeit innerhalb der verfügbaren Heuristiken.</p>}
          {qualityB?.available&&!qualityB.changed&&<p>Keine neue Kameraperspektive:
            Ein Übergang kann in dieser Zeile nicht bewertet werden.</p>}
          <button type="button" disabled={!suggestion?.improved||!canPreview}
            onClick={()=>{if(!suggestion?.improved)return;
              setCandidate(suggestion.settings);setActive("B");setNotice("");}}>
            Optimierungsvorschlag in Variante B übernehmen
          </button>
          {suggestion?.improved&&<p><small>Vorschlag: Weichheit {suggestion.settings.smoothness} %,
            BPM-Raster {suggestion.settings.beatSync?"an":"aus"}; Qualitätsindikator
            {" "}{suggestion.before.score} → {suggestion.after.score}. Erst nach „Variante B übernehmen“
            werden Einstellungen gespeichert.</small></p>}
          {!suggestion?.improved&&<small>Keine bessere globale V433-Parameterkombination gefunden.
            Häufige Shot-Wechsel oder ein ungeeigneter Ausschnitt müssen gegebenenfalls in
            V430 beziehungsweise am Avatar selbst korrigiert werden.</small>}
          <p><small>Der Indikator ist keine Bild- oder Kollisionserkennung. Die Vorschau verwendet eine
            neutrale Grundkamera und kennt weder verdeckte Gesichter noch die tatsächliche
            Avatar-Geometrie. Keine automatischen Live-Kameraänderungen.</small></p>
        </section>
        <label>Variante B – Übergangsweichheit: {candidate.smoothness} %
          <input type="range" min="0" max="100" step="5" value={candidate.smoothness}
            aria-label="V434 Entwurf Übergangsweichheit" onChange={e=>{
              setCandidate(c=>({...c,smoothness:Number(e.target.value)}));setNotice("");}}/></label>
        <label className="setting-check"><input type="checkbox" checked={candidate.beatSync} onChange={e=>{
          setCandidate(c=>({...c,beatSync:e.target.checked}));setNotice("");}}/>
          Variante B auf BPM-Raster ausrichten (im Livebetrieb nur bei vorhandenem BPM-Wert)</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"10px 0"}}>
          <button type="button" onClick={()=>{setCandidate({...original});setNotice("");}}>Entwurf zurücksetzen</button>
          <button type="button" onClick={accept} disabled={!dirty||!canPreview}>Variante B übernehmen</button>
          <button type="button" aria-expanded={previewOpen} onClick={()=>setPreviewOpen(v=>!v)}>
            {previewOpen?"3D-Vorschau schließen":"3D-Vorschau öffnen"}</button>
        </div>
        {dirty&&<p role="status">Nicht gespeicherter Entwurf – Live-Einstellungen unverändert.</p>}
        {notice&&<p role="status">{notice}</p>}
        {previewOpen&&chosen&&<div aria-label={`Isolierte 3D-Vorschau Variante ${active}`}>
          <strong>3D-Vorschau: Variante {active} · {seconds(atMs)}</strong>
          <CameraLivePreviewV291 pose={chosen.pose} onPoseChange={()=>{/* Read-only editorial comparison. */}}
            avatarUrl={model.url} avatarLabel={model.label} playing={false} pathPoints={path}/>
        </div>}
        <small>Die Kamerapfade werden mit der V433-Übergangskurve und den gespeicherten V416-/V430-Shots berechnet.
          Das Studio verwendet eine neutrale Verse-Grundkamera und zeigt eine Näherung der finalen Bühnenkomposition.
          BPM-Ausrichtung basiert auf einem angenäherten Wiedergabe-Raster ohne garantierte Beat-Phase;
          aktuelle Kick-Akzente werden nicht als historische Ereignisse verwendet.
          Manuelle Kamera, V432-Keyframes, andere Regiemodi, Lyrics-Schutz und reduzierte Bewegung behalten live Vorrang.</small>
      </>}
    </>}
  </fieldset>;
}
