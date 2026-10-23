"use client";
import {PredictiveDanceTransitionsPanel} from "./PredictiveDanceTransitionsPanel";
import {useEffect,useState} from "react";
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
import {EMPTY_EVOLUTION,EVOLUTION_EVENT,readEvolution,writeEvolution,suggestEvolution,type EvolutionState,type EvolutionStep} from "./smartChoreographyEvolution";
import type {TimelinePhase} from "./musicStructureTimeline";
import {composeDanceSequence} from "./aiDanceChoreographer";
import {DEFAULT_GENRE_DANCE,readGenreDanceSettings,writeGenreDanceSettings,GENRE_DANCE_EVENT,normalizeGenre,DANCE_GENRES,type GenreDanceSettings} from "./genreSpecificDanceIntelligence";
import {GENRES} from "@/config/musicGenres";
import {composeVariedDanceSequence} from "./danceVariationEngine";
const phases:TimelinePhase[]=["verse","build","drop","break"];
export function SmartChoreographyEvolutionPanel({avatarId,motions}:{avatarId:string;motions:InstalledCharacterMotion[]}){
 const [state,setState]=useState<EvolutionState>(EMPTY_EVOLUTION);
 const [genre,setGenre]=useState("");
 const [genreSettings,setGenreSettings]=useState<GenreDanceSettings>(DEFAULT_GENRE_DANCE);
 useEffect(()=>{const refresh=()=>setGenreSettings(readGenreDanceSettings());refresh();window.addEventListener(GENRE_DANCE_EVENT,refresh);return()=>window.removeEventListener(GENRE_DANCE_EVENT,refresh);},[]);
 const setGenreOption=(value:GenreDanceSettings)=>setGenreSettings(writeGenreDanceSettings(value));
 const [bpm,setBpm]=useState(180);
 const [energy,setEnergy]=useState(0.8);
 const [seed,setSeed]=useState(1);
 const [diversity,setDiversity]=useState(0.7);
 const [phraseBars,setPhraseBars]=useState(16);
 const [variationEnabled,setVariationEnabled]=useState(true);
 const propose=(phase:TimelinePhase)=>variationEnabled?composeVariedDanceSequence(motions,{avatarId,genre,bpm,energy,phase,seed,maxSteps:5},{diversity,phraseBars}):composeDanceSequence(motions,{avatarId,genre,bpm,energy,phase,seed,maxSteps:5});
 const [previews,setPreviews]=useState<Partial<Record<TimelinePhase,ReturnType<typeof composeDanceSequence>>>>({});
 const generate=(phase:TimelinePhase)=>setPreviews(old=>({...old,[phase]:propose(phase)}));
 useEffect(()=>{const refresh=()=>setState(readEvolution());refresh();window.addEventListener(EVOLUTION_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(EVOLUTION_EVENT,refresh);window.removeEventListener("storage",refresh);};},[]);
 const save=(next:EvolutionState)=>setState(writeEvolution(next));
 const setSteps=(phase:TimelinePhase,steps:EvolutionStep[])=>save({...state,sequences:{...state.sequences,[avatarId]:{...state.sequences[avatarId],[phase]:steps}}});
 return <fieldset aria-label="Smart Choreography Evolution V198" style={{minWidth:0}}><legend>Smart Choreography Evolution · V198</legend>
  <PredictiveDanceTransitionsPanel/>
  <fieldset aria-label="AI Dance Choreographer 2.0" style={{marginBottom:12}}><legend>AI Dance Choreographer 2.0 · V200</legend>
   <p>Regelbasierter, nachvollziehbarer Generator (kein externes KI-Modell). Vorschläge ändern deine gespeicherten Sequenzen erst nach „Übernehmen“.</p>
   <label>Genre <select value={genre} onChange={e=>setGenre(e.target.value)}><option value="">Alle Genres</option>{GENRES.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label>{" "}
   <label>BPM <input type="number" min={50} max={240} value={bpm} onChange={e=>setBpm(Math.max(50,Math.min(240,Number(e.target.value)||180)))}/></label>{" "}
   <label>Energie <input type="range" min={0} max={1} step={0.05} value={energy} onChange={e=>setEnergy(Number(e.target.value))}/> {Math.round(energy*100)}%</label>{" "}
   <label>Variante <input type="number" min={0} max={9999} value={seed} onChange={e=>setSeed(Math.max(0,Math.min(9999,Number(e.target.value)||0)))}/></label>
   <button type="button" disabled={!motions.length} onClick={()=>setPreviews(Object.fromEntries(phases.map(phase=>[phase,propose(phase)])) as typeof previews)}>Alle Phasen vorschlagen</button>
  </fieldset>
  <fieldset aria-label="Genre-Specific Dance Intelligence V210" style={{marginBottom:12}}><legend>Genre-Specific Dance Intelligence · V210</legend>
   <p>Intelligente Gewichtung vorhandener GLB-Motions. Hardtekk: Kick/Footwork; Hardstyle: Jump; Techno: Flow/Shuffle; Deutschrap: Groove/Head-Nod. Kein neues KI-Modell.</p>
   <label><input type="checkbox" checked={genreSettings.enabled} onChange={e=>setGenreOption({...genreSettings,enabled:e.target.checked})}/> Genre-Intelligenz auch für automatische Live-Motions aktivieren</label>{" "}
   <label>Musikstil <select value={genreSettings.override} onChange={e=>setGenreOption({...genreSettings,override:e.target.value as GenreDanceSettings["override"]})}><option value="auto">Automatisch</option>{DANCE_GENRES.map(x=><option key={x} value={x}>{x}</option>)}</select></label>{" "}
   <label>Stilgewichtung <input type="range" min={0} max={1} step={0.05} value={genreSettings.strength} onChange={e=>setGenreOption({...genreSettings,strength:Number(e.target.value)})}/> {Math.round(genreSettings.strength*100)}%</label>
   <small>Die vorhandenen BPM-Grenzen und Avatar-Zuordnungen bleiben erhalten. Die manuelle Timeline hat weiterhin Vorrang. Aktuelle Generierung: {normalizeGenre(genreSettings.override==="auto"?genre:genreSettings.override)}.</small>
  </fieldset>
  <fieldset aria-label="Dance Variation Engine V201"><legend>Dance Variation Engine · V201</legend>
   <label><input type="checkbox" checked={variationEnabled} onChange={e=>setVariationEnabled(e.target.checked)}/> Intelligente Variationen in generierten Vorschlägen</label>{" "}
   <label>Abwechslung <input type="range" min={0} max={1} step={0.05} value={diversity} onChange={e=>setDiversity(Number(e.target.value))}/> {Math.round(diversity*100)}%</label>{" "}
   <label>Sequenzlänge (Takte) <input type="number" min={4} max={64} value={phraseBars} onChange={e=>setPhraseBars(Math.max(4,Math.min(64,Number(e.target.value)||16)))}/></label>
   <small>Wiederholungsarm geplante Motion-Folgen; keine künstlich generierten Skelett-Frames oder Änderungen an GLB-Dateien. Erst nach „Vorschlag übernehmen“ wirksam.</small>
  </fieldset>
  <p>Sequenzen aus bereits installierten GLB-Motions. Die Reihenfolge wiederholt sich anhand der verfügbaren BPM-Taktphase; keine vorgreifende Spotify-Audioanalyse.</p>
  <label><input type="checkbox" checked={state.enabled} onChange={e=>save({...state,enabled:e.target.checked})}/> Automatische Sequenzen auf der Live-Bühne aktivieren</label>
  {phases.map(phase=>{const steps=state.sequences[avatarId]?.[phase]??[];return <section key={phase} style={{padding:8,border:"1px solid #8885",borderRadius:8,marginTop:8}}><strong>{phase.toUpperCase()}</strong>
   <button type="button" disabled={!motions.length} onClick={()=>generate(phase)}>V201/V200 Vorschau generieren</button>
   {previews[phase] && <div style={{padding:7,marginTop:6,border:"1px dashed #8887",borderRadius:6}}>
    <p>{previews[phase]!.reason} ({previews[phase]!.totalBars} Takte)</p>
    <ol>{previews[phase]!.steps.map((step,i)=><li key={i}>{motions.find(m=>m.id===step.motionId)?.name??step.motionId} – {step.bars} Takte</li>)}</ol>
    <button type="button" disabled={!previews[phase]!.steps.length} onClick={()=>setSteps(phase,previews[phase]!.steps)}>Vorschlag übernehmen</button>
   </div>}
   <button type="button" disabled={!motions.length} onClick={()=>setSteps(phase,suggestEvolution(motions,phase,""))}>Einfache V198-Sequenz</button>
   {steps.map((step,i)=><div key={i} style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginTop:6}}>
    <label>Motion <select value={step.motionId} onChange={e=>setSteps(phase,steps.map((x,j)=>i===j?{...x,motionId:e.target.value}:x))}>{motions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
    <label>Takte <input type="number" min={1} max={16} value={step.bars} style={{width:55}} onChange={e=>setSteps(phase,steps.map((x,j)=>i===j?{...x,bars:Math.max(1,Math.min(16,Number(e.target.value)||1))}:x))}/></label>
    <button type="button" onClick={()=>setSteps(phase,steps.filter((_,j)=>j!==i))}>Entfernen</button>
   </div>)}
   <button type="button" disabled={!motions.length||steps.length>=12} onClick={()=>setSteps(phase,[...steps,{motionId:motions[0].id,bars:2}])}>Motion hinzufügen</button>
  </section>})}
  <small>Manuelle Sequenzen haben bei aktivierter Funktion Vorrang vor einer einzelnen phasenbasierten Motion. Abschalten stellt die bisherige V196/V197-Auswahl wieder her. Einstellungen bleiben lokal in diesem Browser.</small>
 </fieldset>;
}
