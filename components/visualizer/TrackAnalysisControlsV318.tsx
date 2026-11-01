"use client";
import { useEffect, useMemo, useState } from "react";
import { useVisualizer } from "@/context/VisualizerContext";
import { useMusic } from "@/context/MusicContext";
import {ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318,normalizeTrackAnalysisV318,readTrackAnalysisV318,writeTrackAnalysisV318,resolveTimelineV318} from "@/services/musicAnalysis/trackAnalysisV318";
import type {TrackAnalysisV318} from "@/services/musicAnalysis/trackAnalysisV318";
import {classifyConcertGenreV502} from "@/components/visualizer/smartConcertDynamicsV502";
import {planUltimateConcertV600} from "@/components/visualizer/ultimateConcertDirectorV600";
import {planFullSongDramaturgyV604} from "@/components/visualizer/fullSongConcertDramaturgyV604";
import {planFullSongPacingV671} from "@/components/visualizer/fullSongPacingV671";
import {planIntelligentSongArcV679} from "@/components/visualizer/intelligentSongArcV679";
import {planSectionDirectionV681} from "@/components/visualizer/verseHookDropDirectionV681";
import {planSmartEnsembleV683,ensembleMomentAtV683} from "@/components/visualizer/smartEnsembleDirectorV683";

export function TrackAnalysisControlsV318(){
  const {track,audio,isPlaying,genre}=useVisualizer();
  const {progressMs}=useMusic();
  const trackId=track?.id??"";
  const [stored,setStored]=useState<TrackAnalysisV318|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    const update=()=>setStored(readTrackAnalysisV318(trackId));
    update(); window.addEventListener(ANALYSIS_EVENT_V318,update);
    const storage=(e:StorageEvent)=>{if(e.key===ANALYSIS_STORAGE_KEY_V318)update();};
    window.addEventListener("storage",storage);
    return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,update);window.removeEventListener("storage",storage);};
  },[trackId]);
  const selected=stored?.trackId===trackId?stored:null;
  const cue=resolveTimelineV318({trackId,progressMs,playing:isPlaying,liveSection:"verse",liveBpm:audio.bpm},selected);
  const narrativePlanV679=useMemo(()=>planFullSongDramaturgyV604(
    planUltimateConcertV600({trackId,durationMs:track?.durationMs??0,
      genre:classifyConcertGenreV502(genre),analysis:selected})),
    [trackId,track?.durationMs,genre,selected]);
  const pacingPlanV671=useMemo(()=>planFullSongPacingV671(narrativePlanV679),[narrativePlanV679]);
  const currentPacingV671=pacingPlanV671.beats.find(b=>progressMs>=b.startMs&&progressMs<b.endMs);
  const intelligentArcV679=useMemo(()=>planIntelligentSongArcV679(narrativePlanV679,pacingPlanV671),
    [narrativePlanV679,pacingPlanV671]);
  const sectionPlanV681=useMemo(()=>planSectionDirectionV681(narrativePlanV679,pacingPlanV671,intelligentArcV679),
    [narrativePlanV679,pacingPlanV671,intelligentArcV679]);
  const currentSectionV681=sectionPlanV681.moments.find(m=>progressMs>=m.startMs&&progressMs<m.endMs);
  const ensemblePreviewV683=useMemo(()=>planSmartEnsembleV683(sectionPlanV681,4),[sectionPlanV681]);
  const currentEnsembleV683=ensembleMomentAtV683(ensemblePreviewV683,progressMs);
  async function importFile(file:File|undefined){
    if(!file||!trackId)return;
    setBusy(true);setMessage("");
    try{
      if(file.size>1_500_000)throw Error("JSON-Datei ist zu groß (max. 1,5 MB).");
      const parsed=JSON.parse(await file.text()) as unknown;
      const next=normalizeTrackAnalysisV318(parsed,trackId,track?.durationMs??0,"json-import");
      // Avoid applying data to a different song if playback changes mid-upload.
      if(trackId!==track?.id)throw Error("Track während des Imports gewechselt.");
      writeTrackAnalysisV318(next,trackId);setStored(next);
      setMessage("Analyse ausschließlich für diesen Track gespeichert.");
    }catch(error){setMessage(error instanceof Error?error.message:"Ungültige Analysedatei.");}
    finally{setBusy(false);}
  }
  function clear(){
    try{writeTrackAnalysisV318(null,trackId);setStored(null);setMessage("Import für diesen Track entfernt.");}
    catch(e){setMessage(e instanceof Error?e.message:"Löschen fehlgeschlagen.");}
  }
  return <fieldset className="stage-director-v287"><legend>Unified Track Analysis · V318</legend>
    <p>Freiwillige Track-Analyse aus einer vorhandenen JSON-Datei importieren. Beats und Takte ergänzen die bestehende Live-Rhythmuserkennung. Es wird <strong>kein</strong> privater Spotify-Endpunkt aufgerufen.</p>
    <p><strong>Track:</strong> {track?.title??"Kein Titel ausgewählt"} {track?.artist?`– ${track.artist}`:""}</p>
    <p><strong>Quelle:</strong> {selected?"Lokaler JSON-Import":"Live-Fallback"} {selected?` · ${selected.beats.length} Beats · ${selected.bars.length} Takte · ${selected.sections.length} Abschnitte`:""}</p>
    <p><strong>BPM:</strong> {cue.tempo?.toFixed(1)??"unbekannt"} {selected?.sections.length?" · Abschnitte ohne eindeutige Labels bleiben Live-Schätzungen.":""}</p>
    {selected && <p><strong>Timeline:</strong> {cue.beatIndex!==null?`Beat ${cue.beatIndex+1}`:'Beat unbekannt'} · {cue.barIndex!==null?`Takt ${cue.barIndex+1}`:'Takt unbekannt'}
      {cue.nextBarMs!==null?` · nächster Takt bei ${(cue.nextBarMs/1000).toFixed(2)}s`:''}
      {cue.hasSectionLabels?` · markierter Abschnitt: ${cue.section}`:' · Abschnittsbezeichnungen kommen aus der Live-Erkennung'}
    </p>}
    <section aria-label="V671 Full-Song Dramaturgy Inspector" data-v671-plan={pacingPlanV671.source}
      style={{margin:'12px 0',padding:12,border:'1px solid #5b7188',borderRadius:8}}>
      <h4 style={{margin:'0 0 8px'}}>V671 · Full-Song Dramaturgy</h4>
      <p><strong>Szenenplanung:</strong> {pacingPlanV671.source==='verified-v604'
        ?`${pacingPlanV671.beats.length} belegte Abschnitte`:'Sanfter neutraler Verlauf (keine bestätigten Abschnitte)'}</p>
      {pacingPlanV671.highPointIndex>=0&&<p><strong>Geplanter Höhepunkt:</strong>
        {' '}Abschnitt {pacingPlanV671.highPointIndex+1}
        {' · '}<strong>Aktuell:</strong> {currentPacingV671?.intent??'nicht klassifiziert'}</p>}
      {pacingPlanV671.beats.length>0&&<ol style={{margin:'6px 0',paddingLeft:20}}>
        {pacingPlanV671.beats.slice(0,12).map(b=><li key={`${b.index}-${b.startMs}`}>
          {b.intent} · {Math.round(b.startMs/1000)}–{Math.round(b.endMs/1000)} s
          {' · '}Bühnenmotiv: {b.motif}{b.repetition>0?` · Wiederholung ${b.repetition+1}`:''}
          {b.index===pacingPlanV671.highPointIndex?' · dramaturgischer Höhepunkt':''}
        </li>)}{pacingPlanV671.beats.length>12&&<li>Weitere Phasen: {pacingPlanV671.beats.length-12}</li>}
      </ol>}
      <small>Vorschau aus importierten, bestätigten Songabschnitten. Ohne diese Daten
        werden keine Hooks, Drops, Duette oder Soloauftritte erfunden. Im Live-Betrieb
        haben manuelle Regie, Liedtext und der V670-Qualitätswächter Vorrang.</small>
    </section>
    <section aria-label="V679 Intelligent Song Arc Inspector" data-v679-plan={intelligentArcV679.source}
      style={{margin:'12px 0',padding:12,border:'1px solid #647e92',borderRadius:10}}>
      <h4 style={{margin:'0 0 8px'}}>V679 · Intelligent Song Arc</h4>
      <p><strong>Haupt-Höhepunkt:</strong> {intelligentArcV679.peakIndex<0
        ?'Keine ausreichend belegten Songabschnitte'
        :`Abschnitt ${intelligentArcV679.peakIndex+1} · ${intelligentArcV679.moments[intelligentArcV679.peakIndex]?.section}`}
        {' · '}<strong>Weitere Akzente:</strong> {intelligentArcV679.supportIndices.length}</p>
      {intelligentArcV679.moments.length>0&&<>
        <div role="img" aria-label="Dramaturgischer Songbogen: belegte Abschnitte, Haupt-Höhepunkt und Ruhephasen"
          style={{position:'relative',height:30,borderRadius:7,overflow:'hidden',background:'#26303c',margin:'10px 0'}}>
          {intelligentArcV679.moments.map(m=><span key={m.index}
            title={`${m.section}: ${m.role} · ${Math.round(m.startMs/1000)}–${Math.round(m.endMs/1000)} Sekunden`}
            style={{position:'absolute',top:3,bottom:3,left:`${100*m.startMs/intelligentArcV679.durationMs}%`,
              width:`${100*(m.endMs-m.startMs)/intelligentArcV679.durationMs}%`,
              background:m.role==='main-peak'?'#f0c55b':m.role==='support-peak'?'#e8997e':
                m.role==='rest'?'#659abb':m.role==='build'?'#a18edb':'#54796d',
              borderRight:'2px solid #26303c'}} />)}
        </div>
        <ol style={{paddingLeft:20,margin:'8px 0',maxHeight:175,overflow:'auto'}}>
          {intelligentArcV679.moments.map(m=><li key={m.index}>
            {Math.round(m.startMs/1000)}–{Math.round(m.endMs/1000)} s · {m.section}
            {' · '}{m.role==='main-peak'?'★ Haupt-Höhepunkt':m.role==='support-peak'?'Kleiner Höhepunkt':
              m.role==='rest'?'Atempause':m.role==='build'?'Aufbau':m.role==='release'?'Übergang':'Grundmotiv'}
          </li>)}
        </ol>
      </>}
      <small>Nur bestätigte importierte Songabschnitte. Der Bogen markiert einen belegten
        Hook/Drop als Haupt-Höhepunkt, schafft Kontrast zu Ruhephasen und verändert nur kleine
        automatische Tanz-, Kamera- und Lichtakzente. Keine neuen Szenenschnitte; manuelle
        Regie, Lyrics und der V670-Qualitätswächter behalten Vorrang.</small>
    </section>
    <section aria-label="V681 Verse Hook Drop Inspector" data-v681-plan={sectionPlanV681.source}
      style={{margin:'12px 0',padding:12,border:'1px solid #647e92',borderRadius:10}}>
      <h4 style={{margin:'0 0 8px'}}>V681 · Verse–Hook–Drop Intelligence</h4>
      <p><strong>Aktueller bestätigter Abschnitt:</strong> {currentSectionV681
        ? `${currentSectionV681.section} · ${currentSectionV681.flavor}`
        : 'Kein bestätigter Abschnitt'}</p>
      {sectionPlanV681.moments.length>0&&<div style={{display:'grid',gap:5,maxHeight:260,overflowY:'auto'}}>
        {sectionPlanV681.moments.map(m=><div key={m.index} style={{display:'flex',gap:8,alignItems:'center',
          padding:'5px 7px',borderRadius:6,background:m.index===currentSectionV681?.index?'#273f50':'#25313a'}}>
          <span style={{minWidth:62,fontVariantNumeric:'tabular-nums'}}>{Math.round(m.startMs/1000)}–{Math.round(m.endMs/1000)} s</span>
          <strong style={{minWidth:50}}>{m.section}</strong>
          <span>{m.flavor==='lyric-space'?'Platz für Lyrics':m.flavor==='wide-hook'?'Großer Hook-Akzent':
            m.flavor==='answer-hook'?'Variierter Hook-Akzent':m.flavor==='rising-build'?'Behutsamer Aufbau':
            m.flavor==='drop-impact'?'Drop-Höhepunkt':'Atempause'}</span>
          {m.arcRole==='main-peak'&&<span title="Haupt-Höhepunkt aus V679">★</span>}
        </div>)}
      </div>}
      <small>Beschreibt ausschließlich belegte Abschnitte aus dem lokalen Analyseimport.
        Keine automatische Genre- oder Emotionserkennung, keine neuen Kameraschnitte und keine
        Änderungen an Text, Lippenbewegungen oder manuell gesetzten Bühnenaktionen.
        Im Live-Betrieb müssen V604, V671 und V679 übereinstimmen; V670 begrenzt die Wirkung.</small>
    </section>
    <section aria-label="V683 Smart Ensemble Inspector" data-v683-plan={ensemblePreviewV683.source}
      style={{margin:'12px 0',padding:12,border:'1px solid #647e92',borderRadius:10}}>
      <h4 style={{margin:'0 0 8px'}}>V683 · Smart Ensemble Director</h4>
      <p><strong>Geplante Bühnenaufstellung:</strong> {currentEnsembleV683
        ? `${currentEnsembleV683.mode} · ${currentEnsembleV683.formation}`
        : 'Keine bestätigte Gruppenphase'}</p>
      {ensemblePreviewV683.moments.length>0&&<div style={{display:'grid',gap:5,maxHeight:240,overflowY:'auto'}}>
        {ensemblePreviewV683.moments.map(m=><div key={m.index} style={{display:'flex',gap:8,alignItems:'center',
          padding:'5px 7px',borderRadius:6,background:m.index===currentEnsembleV683?.index?'#273f50':'#25313a'}}>
          <span style={{minWidth:62,fontVariantNumeric:'tabular-nums'}}>{Math.round(m.startMs/1000)}–{Math.round(m.endMs/1000)} s</span>
          <strong style={{minWidth:87}}>{m.mode==='solo-focus'?'Solofokus':m.mode==='dialogue'?'Dialog':
            m.mode==='ensemble'?'Ensemble':m.mode==='build'?'Aufbau':'Ruhe'}</strong>
          <span>{m.reason}</span>
        </div>)}
      </div>}
      <small>Lesende Vorschau für eine automatische 4-Performer-Gruppe. Live nur bei tatsächlich
        automatisch erzeugten 3-/4-Avatar-Gruppen und belegter Songstruktur aktiv; keine
        erfundenen Sänger, keine neuen Tanzclips, Kameraschnitte oder Timestamps.
        Manuelle Aufstellungen und V326-Abstände behalten Vorrang.</small>
    </section>
    <label>Track-spezifische Analyse importieren (JSON)
      <input type="file" accept="application/json,.json" disabled={!trackId||busy} onChange={e=>{const f=e.target.files?.[0];void importFile(f);e.target.value="";}} />
    </label>
    <button type="button" disabled={!selected||busy} onClick={clear}>Analyse für diesen Titel entfernen</button>
    {message&&<p role="status">{message}</p>}
    <small>Importe bleiben nur lokal im Browser gespeichert (maximal 3 Tracks). Kein Audio, keine Tokens und keine automatischen Netzwerkanfragen. Nur rechtmäßig verfügbare Analysedaten verwenden. Bei fehlenden Beats, Labels oder Zugriff läuft die bestehende Live-Erkennung weiter.</small>
  </fieldset>;
}
