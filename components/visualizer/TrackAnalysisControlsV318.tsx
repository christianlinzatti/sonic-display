"use client";
import { useEffect, useState } from "react";
import { useVisualizer } from "@/context/VisualizerContext";
import { useMusic } from "@/context/MusicContext";
import {ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318,normalizeTrackAnalysisV318,readTrackAnalysisV318,writeTrackAnalysisV318,resolveTimelineV318} from "@/services/musicAnalysis/trackAnalysisV318";
import type {TrackAnalysisV318} from "@/services/musicAnalysis/trackAnalysisV318";

export function TrackAnalysisControlsV318(){
  const {track,audio,isPlaying}=useVisualizer();
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
    <label>Track-spezifische Analyse importieren (JSON)
      <input type="file" accept="application/json,.json" disabled={!trackId||busy} onChange={e=>{const f=e.target.files?.[0];void importFile(f);e.target.value="";}} />
    </label>
    <button type="button" disabled={!selected||busy} onClick={clear}>Analyse für diesen Titel entfernen</button>
    {message&&<p role="status">{message}</p>}
    <small>Importe bleiben nur lokal im Browser gespeichert (maximal 3 Tracks). Kein Audio, keine Tokens und keine automatischen Netzwerkanfragen. Nur rechtmäßig verfügbare Analysedaten verwenden. Bei fehlenden Beats, Labels oder Zugriff läuft die bestehende Live-Erkennung weiter.</small>
  </fieldset>;
}
