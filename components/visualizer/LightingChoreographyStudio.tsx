"use client";
import { useEffect, useRef, useState } from "react";
import { defaultLightingPreset, lightingPresets, loadLightingPreset, saveLightingPreset, type LightingPreset } from "./predictiveLighting";
import { loadLightCues, saveLightCues, suggestedLightCue, sanitizeLightCues, type LightCue, type LightCueKind } from "./lightingTimeline";
import { DEFAULT_AUTO_CUES, generateAutomaticLightCues, mergeAcceptedLightCues, type AutoCueSettings } from "./automaticLightingCues";
import { analyzeLightingObservations, combineAnalyzedLightingCues, type AnalyzedLightCue, type LightingObservation } from "./lightingTimelineAnalyzer";
import { loadLightingLearning, saveLightingLearning, resetLightingLearning, recordLightingFeedback, rankLearnedLightCues, suggestLearnedCueOffset, type LightingLearningState } from "./lightingLearningEngine";
import { summarizeLightingLearning } from "./lightingLearningDashboard";
import { evolveLightingPreset, undoPresetEvolution, type PresetEvolution } from "./lightingPresetEvolution";
import { addPresetRevision, deletePresetEntry, exportPresetLibrary, importPresetLibrary, loadPresetLibrary, restorePresetRevision, savePresetLibrary, type PresetLibrary } from "./lightingPresetLibrary";
import { LIGHTING_GENRES, loadGenreProfiles, saveGenreProfiles, type GenreProfiles } from "./lightingGenreProfiles";
import type { AudioFeatures } from "@/types/audio";
import {MUSIC_GENRES} from "@/config/musicGenres";
const sanitizePlaybackBuffer=(samples:LightingObservation[])=>samples.slice(-1800);
const colors = ["#FF3978", "#00E5D7", "#FFAE42", "#8F7AFF"];
const buttonStyle = {minHeight:44,borderRadius:10,background:"#2769bc",color:"white",border:0,padding:"8px 12px"};
/** V172: editable song timeline; suggestions require manual acceptance, never stored automatically. */
export function LightingChoreographyStudio({trackId="",durationMs=0,positionMs=0,audio,isPlaying=false}:{trackId?:string;durationMs?:number;positionMs?:number;audio?:AudioFeatures;isPlaying?:boolean}) {
  const [open,setOpen]=useState(false);
  const [library,setLibrary]=useState<PresetLibrary>({version:1,entries:[]});
  const [libraryOpen,setLibraryOpen]=useState(false);
  const [genreProfiles,setGenreProfiles]=useState<GenreProfiles>({version:1,enabled:false,assignments:{}});
  const [libraryId,setLibraryId]=useState("");
  const [libraryName,setLibraryName]=useState("");
  const [libraryGenre,setLibraryGenre]=useState("hardstyle");
  const importFile=useRef<HTMLInputElement>(null);
  const [learning,setLearning]=useState<LightingLearningState>({version:1,events:[]});
  const [learningEnabled,setLearningEnabled]=useState(true);
  const [dashboardOpen,setDashboardOpen]=useState(false);
  const [evolution,setEvolution]=useState<PresetEvolution|null>(null);
  const [undoPreset,setUndoPreset]=useState<LightingPreset|null>(null);
  const [dashboardGenre,setDashboardGenre]=useState("");
  const observations=useRef<LightingObservation[]>([]);
  const lastSampleAt=useRef(-1);
  const [analyzed,setAnalyzed]=useState<AnalyzedLightCue[]>([]);
  const [confidenceById,setConfidenceById]=useState<Record<string,AnalyzedLightCue>>({});
  const [generatorSettings,setGeneratorSettings]=useState<AutoCueSettings>(DEFAULT_AUTO_CUES);
  const [generated,setGenerated]=useState<LightCue[]>([]);
  const [selectedSuggestions,setSelectedSuggestions]=useState<string[]>([]);
  const [preset,setPreset]=useState<LightingPreset>(defaultLightingPreset);
  const [cues,setCues]=useState<LightCue[]>([]);
  const [selectedKind,setSelectedKind]=useState<LightCueKind>("drop");
  const [draftAt,setDraftAt]=useState(0);
  const [dirty,setDirty]=useState(false);
  const [message,setMessage]=useState("");
  useEffect(()=>{setPreset(loadLightingPreset());setLibrary(loadPresetLibrary());setGenreProfiles(loadGenreProfiles());setLearning(loadLightingLearning());try{setLearningEnabled(localStorage.getItem("sonic-display:lighting-learning-enabled")!=="off");}catch{}},[]);
  const feedback=(cue:LightCue,action:"accept"|"reject"|"edit",deltaMs=0)=>{if(!learningEnabled)return;setLearning(current=>{const next=recordLightingFeedback(current,generatorSettings.genre,cue,action,deltaMs);saveLightingLearning(next);return next;});};
  useEffect(()=>{setCues(loadLightCues(trackId,durationMs));setDirty(false);setMessage("");setGenerated([]);setSelectedSuggestions([]);setAnalyzed([]);setConfidenceById({});observations.current=[];lastSampleAt.current=-1;},[trackId,durationMs]);
  useEffect(()=>{
    if(!isPlaying||!audio||!trackId||durationMs<12000||!Number.isFinite(positionMs))return;
    const atMs=Math.round(positionMs);
    if(atMs<0||atMs>durationMs||Math.abs(atMs-lastSampleAt.current)<450)return;
    lastSampleAt.current=atMs;
    observations.current=sanitizePlaybackBuffer([...observations.current,{atMs,energy:audio.energyEnvelope??audio.volume??0,bass:audio.bass??0,beatStrength:audio.beatStrength??0,beat:audio.beat??false}]);
  },[trackId,durationMs,positionMs,audio,isPlaying]);
  const update=(name:"anticipation"|"kickRollStrength"|"blackoutStrength",value:number)=>setPreset(p=>({...p,[name]:value}));
  const setTimeline=(next:LightCue[])=>{setCues(sanitizeLightCues(next,durationMs));setDirty(true);};
  const addCue=(atMs:number,kind=selectedKind)=>setTimeline([...cues,{...suggestedLightCue(atMs,kind),id:`manual-${Date.now()}-${cues.length}`,color:kind==="color"?colors[0]:undefined}]);
  const time=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,"0")}`;
  return <div className="lighting-studio-v172" style={{position:"absolute",right:12,bottom:12,zIndex:9,pointerEvents:"auto"}}>
    <button type="button" aria-expanded={open} onClick={()=>setOpen(!open)} style={{minHeight:44,padding:"8px 14px",borderRadius:14,background:"#10172be8",color:"white",border:"1px solid #7282ad"}}>Lichtstudio</button>
    {open && <div style={{background:"#10172bf2",color:"white",border:"1px solid #7282ad",padding:14,borderRadius:14,width:"min(410px,calc(100vw - 40px))",maxHeight:"min(78vh,690px)",overflowY:"auto",display:"grid",gap:10,marginTop:8}}>
      <strong>V179 · Smart Preset Auto-Selection & Genre Profiles</strong>
      <label>Preset <select value={preset.pattern} onChange={e=>{const p=lightingPresets.find(x=>x.pattern===e.target.value);if(p)setPreset({...p});}} style={{minHeight:40,width:"100%"}}>{lightingPresets.map(p=><option key={p.id} value={p.pattern}>{p.name}</option>)}</select></label>
      {([ ["anticipation","Drop-Vorschau"], ["kickRollStrength","Kick-Roll"], ["blackoutStrength","Blackout"] ] as const).map(([key,title])=><label key={key} style={{display:"grid",gap:3}}>{title}: {Math.round(preset[key]*100)} %<input aria-label={title} type="range" min="0" max="100" value={Math.round(preset[key]*100)} onChange={e=>update(key,Number(e.target.value)/100)}/></label>)}
      <section aria-label="Genre-Profile und Auto-Auswahl" style={{display:"grid",gap:8,padding:10,border:"1px solid #65749b",borderRadius:10}}>
        <strong>V179 · Genre-Profile & automatische Preset-Auswahl</strong>
        <small>Beim Genrewechsel wird die neueste Version der zugewiesenen Bibliotheks-Presets verwendet. Ohne Zuordnung bleibt das manuelle Preset aktiv. Änderungen erfolgen nur nach Speichern.</small>
        <label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={genreProfiles.enabled} onChange={e=>{const next={...genreProfiles,enabled:e.target.checked};if(saveGenreProfiles(next)){setGenreProfiles(next);setMessage(e.target.checked?"Automatische Genre-Auswahl aktiviert.":"Manuelle Preset-Auswahl aktiviert.");}else setMessage("Genre-Profile konnten nicht gespeichert werden.");}}/>Automatisch nach Genre auswählen</label>
        {LIGHTING_GENRES.map(g=><label key={g} style={{display:"grid",gap:3}}>{MUSIC_GENRES[g].label}
          <select aria-label={`Genre-Preset ${g}`} value={genreProfiles.assignments[g]??""} onChange={e=>{const next={...genreProfiles,assignments:{...genreProfiles.assignments,[g]:e.target.value}};if(saveGenreProfiles(next))setGenreProfiles(next);else setMessage("Zuordnung konnte nicht gespeichert werden.");}} style={{width:"100%",minHeight:40}}>
            <option value="">Keine Zuordnung (Familien-Preset falls vorhanden)</option>
            {library.entries.map(entry=><option key={entry.id} value={entry.id}>{entry.name} ({entry.revisions.length} Versionen)</option>)}
          </select>
        </label>)}
        <small>Hardtekk wird nur separat automatisch ausgewählt, falls die Musikquelle es als eigenes Genre meldet. Bei einer allgemeinen Techno-Erkennung gilt das Techno-Profil.</small>
        <button type="button" style={{...buttonStyle,background:"#42445a"}} onClick={()=>{const next={...genreProfiles,enabled:false};if(saveGenreProfiles(next)){setGenreProfiles(next);setMessage("Manuelle Übersteuerung aktiv. Die gespeicherten Genre-Zuordnungen bleiben erhalten.");}}}>Manuell übersteuern (Auto aus)</button>
      </section>
      <section aria-label="Preset Evolution Studio" style={{display:"grid",gap:7,padding:10,border:"1px solid #65749b",borderRadius:10}}>
        <strong>Preset Evolution · Vorher / Nachher</strong>
        <small>Aus mindestens 6 Genre-Entscheidungen berechnet. Vorschläge ändern dein gespeichertes Preset nicht automatisch.</small>
        <button type="button" style={buttonStyle} onClick={()=>{const proposal=evolveLightingPreset(preset,learning,generatorSettings.genre);setEvolution(proposal);setMessage(proposal?"Preset-Variante berechnet. Erst übernehmen und speichern, um sie dauerhaft zu nutzen.":"Zu wenig Feedback für dieses Genre (mindestens sechs Entscheidungen notwendig).");}}>Individuelles Preset vorschlagen</button>
        {evolution && <div style={{display:"grid",gap:6}}>
          <small>{evolution.genre} · {evolution.sampleCount} Bewertungen</small>
          {([ ["anticipation","Drop-Vorschau"],["kickRollStrength","Kick-Roll"],["blackoutStrength","Blackout"] ] as const).map(([key,label])=><div key={key} style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:12}}><span>{label}</span><span>{Math.round(evolution.before[key]*100)} % → <strong>{Math.round(evolution.after[key]*100)} %</strong></span></div>)}
          {evolution.reason.map(r=><small key={r}>{r}</small>)}
          <button type="button" style={buttonStyle} onClick={()=>{setUndoPreset({...preset});setPreset({...evolution.after});setEvolution(null);setMessage("Variante nur in den Editor übernommen. Zum dauerhaften Übernehmen Preset speichern wählen.");}}>Variante in Editor übernehmen</button>
          <button type="button" style={{...buttonStyle,background:"#42445a"}} onClick={()=>setEvolution(null)}>Vorschlag verwerfen</button>
        </div>}
        <button type="button" disabled={!undoPreset} style={{...buttonStyle,background:"#42445a",opacity:undoPreset?1:.5}} onClick={()=>{if(undoPreset){setPreset(undoPresetEvolution(undoPreset));setUndoPreset(null);setEvolution(null);setMessage("Vorheriges Editor-Preset wiederhergestellt. Gespeichertes Preset nicht verändert.");}}}>Rückgängig (Editor)</button>
      </section>
      <section aria-label="Licht-Preset-Bibliothek" style={{display:"grid",gap:8,padding:10,border:"1px solid #65749b",borderRadius:10}}>
        <button type="button" style={buttonStyle} aria-expanded={libraryOpen} onClick={()=>setLibraryOpen(!libraryOpen)}>Preset-Bibliothek {libraryOpen?"schließen":"öffnen"}</button>
        {libraryOpen && <>
          <small>Bis zu 64 Presets und 25 Versionen pro Preset. Lokal im Browser gespeichert. Wiederherstellen lädt nur einen Editor-Entwurf.</small>
          <label>Name <input aria-label="Bibliothek Preset-Name" maxLength={48} value={libraryName} onChange={e=>setLibraryName(e.target.value)} placeholder="Mein Hardtekk-Licht" style={{width:"100%",minHeight:40}}/></label>
          <label>Genre <select value={libraryGenre} onChange={e=>setLibraryGenre(e.target.value)} style={{width:"100%",minHeight:40}}>{["hardstyle","hardtekk","techno","hip hop","ambient","sonstige"].map(g=><option key={g} value={g}>{g}</option>)}</select></label>
          <button type="button" style={buttonStyle} onClick={()=>{const name=libraryName.trim();if(!name){setMessage("Bitte zuerst einen Namen für das Preset eingeben.");return;}const id=libraryId||`preset-${Date.now()}`;const next=addPresetRevision(library,id,name,libraryGenre,preset);if(savePresetLibrary(next)){setLibrary(next);setLibraryId(id);setMessage("Neue Preset-Version in der Bibliothek gespeichert.");}else setMessage("Bibliothek konnte nicht gespeichert werden.");}}>Editor als neue Version sichern</button>
          <input ref={importFile} type="file" accept="application/json,.json" style={{display:"none"}} aria-label="Preset-Bibliothek JSON auswählen" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>1024*1024)throw new Error("Datei zu groß");const incoming=importPresetLibrary(await file.text());const current=loadPresetLibrary();const merged={version:1 as const,entries:[...current.entries.filter(x=>!incoming.entries.some(i=>i.id===x.id)),...incoming.entries].slice(-64)};if(!savePresetLibrary(merged))throw new Error("Speichern fehlgeschlagen");setLibrary(merged);setMessage(`${incoming.entries.length} Presets importiert; gleiche IDs ersetzt.`);}catch(err){setMessage(err instanceof Error?err.message:"Import fehlgeschlagen");}finally{e.target.value="";}}}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button type="button" style={buttonStyle} onClick={()=>{const blob=new Blob([exportPresetLibrary(library)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="sonic-lighting-presets-v178.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>JSON exportieren</button>
            <button type="button" style={buttonStyle} onClick={()=>importFile.current?.click()}>JSON importieren</button>
          </div>
          {library.entries.map(entry=><div key={entry.id} style={{borderTop:"1px solid #465071",paddingTop:8,display:"grid",gap:6}}>
            <strong>{entry.name} · {entry.genre}</strong>
            <small>{entry.revisions.length} Version(en), letzte: {new Date(entry.revisions[entry.revisions.length-1].savedAt).toLocaleString("de-AT")}</small>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button type="button" style={buttonStyle} onClick={()=>{setLibraryId(entry.id);setLibraryName(entry.name);setLibraryGenre(entry.genre);setMessage("Preset für nächste Version ausgewählt.");}}>Weiter versionieren</button>
              <button type="button" style={{...buttonStyle,background:"#71384b"}} onClick={()=>{if(!window.confirm(`Preset ${entry.name} inklusive Versionsverlauf löschen?`))return;const next=deletePresetEntry(library,entry.id);if(savePresetLibrary(next)){setLibrary(next);if(libraryId===entry.id)setLibraryId("");}}}>Löschen</button>
            </div>
            {entry.revisions.slice().reverse().map(rev=><div key={rev.revision} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}><small>Version {rev.revision} · {Math.round(rev.preset.anticipation*100)}/{Math.round(rev.preset.kickRollStrength*100)}/{Math.round(rev.preset.blackoutStrength*100)} %</small><button type="button" style={{...buttonStyle,background:"#42445a"}} onClick={()=>{const restored=restorePresetRevision(library,entry.id,rev.revision);if(restored){setUndoPreset({...preset});setPreset(restored);setLibraryId(entry.id);setLibraryName(entry.name);setLibraryGenre(entry.genre);setMessage("Version in den Editor geladen. Zum Aktivieren Preset speichern wählen.");}}}>Wiederherstellen</button></div>)}
          </div>)}
        </>}
      </section>
      <button type="button" onClick={()=>saveLightingPreset(preset)} style={buttonStyle}>Preset speichern</button>
      <hr style={{width:"100%",borderColor:"#465071"}}/>
      <strong>Song-Timeline {dirty?"· ungespeichert":""}</strong>
      {!trackId || durationMs<=0 ? <small>Für die Timeline einen Spotify-Titel starten.</small> : <>
        <small>Position {time(positionMs)} / {time(durationMs)} · {cues.length} manuelle Cues</small>
        <div style={{height:32,background:"#33405a",position:"relative",borderRadius:6,overflow:"hidden"}} role="img" aria-label="Licht-Cue-Timeline">
          {cues.map(c=><span key={c.id} title={`${c.kind} ${time(c.atMs)}`} style={{position:"absolute",left:`${100*c.atMs/durationMs}%`,height:"100%",width:4,background:c.kind==="blackout"?"#e4e7ef":c.kind==="drop"?"#ff4f8d":"#20dfda"}}/>)}
          <span style={{position:"absolute",left:`${Math.min(100,100*positionMs/durationMs)}%`,top:0,bottom:0,width:2,background:"#ffe66a"}}/>
        </div>
        <label>Cue-Position {time(draftAt)}<input type="range" min="0" max={durationMs} step="100" value={Math.min(draftAt,durationMs)} onChange={e=>setDraftAt(Number(e.target.value))} style={{width:"100%"}}/></label>
        <label>Effekt <select value={selectedKind} onChange={e=>setSelectedKind(e.target.value as LightCueKind)} style={{minHeight:40,width:"100%"}}>{(["drop","build","blackout","strobe","color"] as LightCueKind[]).map(k=><option key={k} value={k}>{k}</option>)}</select></label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button type="button" style={buttonStyle} onClick={()=>addCue(draftAt)}>Cue hinzufügen</button>
          <button type="button" style={buttonStyle} onClick={()=>addCue(positionMs)}>Cue an aktueller Position</button>
          <button type="button" style={buttonStyle} onClick={()=>{setDraftAt(positionMs);setMessage("Vorschlag: Drop-Cue auf Basis der aktuellen Wiedergabeposition. Bitte vor dem Speichern prüfen.");}}>Drop-Vorschlag</button>
        </div>
        <div style={{display:"grid",gap:8,border:"1px solid #445574",padding:10,borderRadius:10}}>
          <strong>Automatische Lichtshow · Vorschläge</strong>
          <label style={{display:"flex",gap:7,alignItems:"center"}}><input type="checkbox" checked={learningEnabled} onChange={e=>{setLearningEnabled(e.target.checked);try{localStorage.setItem("sonic-display:lighting-learning-enabled",e.target.checked?"on":"off");}catch{}}}/>V175 Lernfunktion aktivieren</label>
          <small>Feedback: {learning.events.length} Bewertungen (lokal, maximal 250). Eine Korrektur ändert den Confidence-Score nur begrenzt. Manuelle Freigabe bleibt erforderlich.</small>
          <button type="button" aria-expanded={dashboardOpen} style={{...buttonStyle,background:"#394b75"}} onClick={()=>setDashboardOpen(v=>!v)}>Lern-Dashboard {dashboardOpen?"schließen":"öffnen"}</button>
          {dashboardOpen && <div aria-label="Lighting Learning Dashboard" style={{display:"grid",gap:9,padding:10,border:"1px solid #65749b",borderRadius:10}}>
            <strong>Deine Licht-Vorlieben</strong>
            <small>{learning.events.length} lokale Bewertungen · {learningEnabled?"Lernen aktiv":"Lernen pausiert"}. Empfehlungen ändern die Bühne nicht ohne deine Bestätigung.</small>
            {summarizeLightingLearning(learning).length===0?<small>Nach der ersten Übernahme oder Ablehnung von Licht-Cues erscheinen hier Genre-Statistiken.</small>:<>
              <label>Genre <select aria-label="Dashboard Genre" value={dashboardGenre&&summarizeLightingLearning(learning).some(g=>g.genre===dashboardGenre)?dashboardGenre:summarizeLightingLearning(learning)[0].genre} onChange={e=>setDashboardGenre(e.target.value)} style={{minHeight:40,width:"100%"}}>{summarizeLightingLearning(learning).map(g=><option key={g.genre} value={g.genre}>{g.genre} ({g.total})</option>)}</select></label>
              {summarizeLightingLearning(learning).filter(g=>g.genre===(dashboardGenre&&summarizeLightingLearning(learning).some(x=>x.genre===dashboardGenre)?dashboardGenre:summarizeLightingLearning(learning)[0].genre)).map(g=><div key={g.genre} style={{display:"grid",gap:6}}>
                <small>{g.accepted} übernommen · {g.rejected} verworfen · {g.edited} Zeitkorrekturen</small>
                {g.kinds.filter(k=>k.total>0).map(k=><div key={k.kind} style={{display:"grid",gap:2,padding:"5px 0",borderBottom:"1px solid #38445d"}}><div style={{display:"flex",justifyContent:"space-between",gap:6}}><span>{k.kind}</span><span>{k.approvalRate===null?"–":`${Math.round(k.approvalRate*100)} %`} Zustimmung</span></div><div style={{height:6,background:"#29364f",borderRadius:4,overflow:"hidden"}}><div style={{width:`${Math.round((k.approvalRate??0)*100)}%`,height:"100%",background:"#38b7a9"}}/></div><small>{k.accepted} ✓ / {k.rejected} ✕ / {k.edited} Korrekturen · {k.recommendation}{k.averageOffsetMs?` · Zeitversatz ${k.averageOffsetMs} ms`:""}</small></div>)}
                <strong>Preset-Empfehlung: {g.recommendedPreset==="hard-dance"?"Hard Dance":g.recommendedPreset==="cinematic"?"Cinematic":"Balanced"}</strong>
                <small>{g.reason}. Rein heuristisch; keine automatische Übernahme.</small>
                <button type="button" style={buttonStyle} disabled={!g.sampleSufficient} onClick={()=>{const target=lightingPresets.find(p=>p.id===(g.recommendedPreset==="hard-dance"?"rave":g.recommendedPreset==="balanced"?"classic":"cinematic"));if(target){setPreset({...target});setMessage("Empfohlenes Preset in Editor geladen. Erst mit Preset speichern dauerhaft übernehmen.");}else setMessage("Empfohlenes Preset ist in dieser Installation nicht verfügbar.");}}>Empfehlung in Editor laden</button>
              </div>)}
            </>}
          </div>}
          <button type="button" style={{...buttonStyle,background:"#52566d"}} onClick={()=>{resetLightingLearning();setLearning({version:1,events:[]});setMessage("Gespeichertes Licht-Lernfeedback zurückgesetzt.");}}>Lernfeedback zurücksetzen</button>
          <small>Vorschläge sind rhythmisch geschätzte Takt-/Phrasenmarker, keine echte Offline-Audioanalyse. Manuelle Cues bleiben unangetastet, bis du Vorschläge übernimmst.</small>
          <label style={{display:"grid",gap:3}}>BPM <input aria-label="Generator BPM" type="number" min={65} max={220} value={generatorSettings.bpm} onChange={e=>setGeneratorSettings(s=>({...s,bpm:Number(e.target.value)}))} style={{minHeight:40}}/></label>
          <label style={{display:"grid",gap:3}}>Takte je Phrase <select aria-label="Takte je Phrase" value={generatorSettings.barsPerPhrase} onChange={e=>setGeneratorSettings(s=>({...s,barsPerPhrase:Number(e.target.value)}))} style={{minHeight:40}}>{[4,8,16].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <label style={{display:"grid",gap:3}}>Genre <select aria-label="Generator Genre" value={generatorSettings.genre} onChange={e=>setGeneratorSettings(s=>({...s,genre:e.target.value}))} style={{minHeight:40}}><option value="">Allgemein</option><option value="hardstyle">Hardstyle</option><option value="hardtekk">Hardtekk</option><option value="techno">Techno</option><option value="hip hop">Hip-Hop</option><option value="ambient">Ambient</option></select></label>
          <label>Musikenergie {Math.round(generatorSettings.energy*100)} %<input type="range" min={0} max={100} value={Math.round(generatorSettings.energy*100)} onChange={e=>setGeneratorSettings(s=>({...s,energy:Number(e.target.value)/100}))} style={{width:"100%"}}/></label>
          <label style={{display:"flex",alignItems:"center",gap:7}}><input type="checkbox" checked={generatorSettings.includeBlackouts} onChange={e=>setGeneratorSettings(s=>({...s,includeBlackouts:e.target.checked}))}/>Blackouts vorschlagen</label>
          <label style={{display:"flex",alignItems:"center",gap:7}}><input type="checkbox" checked={generatorSettings.includeStrobes} onChange={e=>setGeneratorSettings(s=>({...s,includeStrobes:e.target.checked}))}/>Strobes vorschlagen</label>
          <small>Live-Messungen: {observations.current.length} Stichproben der aktuellen Wiedergabe. Nicht gehörte Songteile können nicht analysiert werden.</small>
          <button type="button" style={buttonStyle} onClick={()=>{const next=generateAutomaticLightCues(durationMs,generatorSettings);const evidence=analyzeLightingObservations(observations.current,durationMs);const ranked=combineAnalyzedLightingCues(next,evidence,durationMs);const learned=learningEnabled?rankLearnedLightCues(ranked,learning,generatorSettings.genre):ranked.map(c=>({...c,learnedConfidence:c.confidence,adjustment:0,explanation:"Lernen deaktiviert"}));setAnalyzed(evidence);setConfidenceById(Object.fromEntries(learned.map(c=>[c.cue.id,{...c,confidence:c.learnedConfidence,reason:`${c.reason} · ${c.explanation}`}])));setGenerated(learned.map(c=>({...c.cue,atMs:Math.max(0,Math.min(durationMs-100,c.cue.atMs+(learningEnabled?suggestLearnedCueOffset(learning,generatorSettings.genre,c.cue.kind):0)))})));setSelectedSuggestions(learned.map(c=>c.cue.id));setMessage(`${learned.length} Vorschläge: ${evidence.length} aus Live-Messungen, andere aus BPM-/Phrasen-Schätzung. Lerngewichtung ${learningEnabled?"aktiv":"aus"}. Noch nicht gespeichert.`);}}>Lichtshow generieren</button>
          {generated.length>0 && <>
            <small>{selectedSuggestions.length} von {generated.length} Vorschlägen ausgewählt · {analyzed.length} gemessene Kandidaten. Confidence ist eine Heuristik, keine garantierte Erkennungswahrscheinlichkeit.</small>
            <div style={{maxHeight:170,overflowY:"auto",display:"grid",gap:5}} aria-label="Generierte Licht-Cues">
              {generated.map(c=><label key={c.id} style={{display:"flex",alignItems:"center",gap:7,fontSize:12}}><input type="checkbox" checked={selectedSuggestions.includes(c.id)} onChange={e=>setSelectedSuggestions(old=>e.target.checked?[...old,c.id]:old.filter(x=>x!==c.id))}/>{time(c.atMs)} · {c.kind} · {Math.round(c.strength*100)} % · Confidence {Math.round((confidenceById[c.id]?.confidence??.22)*100)} % <span title={confidenceById[c.id]?.reason}>{confidenceById[c.id]?.evidence?"Live-Messung":"Phrasen-Schätzung"}</span></label>)}
            </div>
            <button type="button" style={buttonStyle} onClick={()=>{const accepted=generated.filter(c=>selectedSuggestions.includes(c.id));generated.forEach(c=>feedback(c,selectedSuggestions.includes(c.id)?"accept":"reject"));setTimeline(mergeAcceptedLightCues(cues,accepted,durationMs));setGenerated([]);setSelectedSuggestions([]);setMessage("Übernommene Vorschläge sind ungespeichert. Mit Timeline speichern bestätigen.");}}>Ausgewählte Cues übernehmen</button>
            <button type="button" style={{...buttonStyle,background:"#42445a"}} onClick={()=>{generated.forEach(c=>feedback(c,"reject"));setGenerated([]);setSelectedSuggestions([]);}}>Vorschläge verwerfen</button>
          </>}
        </div>
        {message && <small role="status">{message}</small>}
        {cues.map((cue,index)=><div key={cue.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",alignItems:"end",gap:5,borderTop:"1px solid #465071",paddingTop:7}}>
          <label style={{display:"grid",fontSize:12}}>Zeit (s)<input type="number" min={0} max={durationMs/1000} step=".1" value={cue.atMs/1000} onChange={e=>setTimeline(cues.map((c,i)=>i===index?{...c,atMs:Number(e.target.value)*1000}:c))} style={{width:"100%",minHeight:36}}/></label>
          <label style={{display:"grid",fontSize:12}}>Effekt<select value={cue.kind} onChange={e=>setTimeline(cues.map((c,i)=>i===index?{...c,kind:e.target.value as LightCueKind}:c))} style={{minHeight:36}}>{(["drop","build","blackout","strobe","color"] as LightCueKind[]).map(k=><option key={k}>{k}</option>)}</select></label>
          <button type="button" aria-label={`Cue ${index+1} löschen`} style={{...buttonStyle,background:"#663449",minHeight:36}} onClick={()=>setTimeline(cues.filter((_,i)=>i!==index))}>×</button>
          <label style={{gridColumn:"span 2",fontSize:12}}>Intensität {Math.round(cue.strength*100)} %<input type="range" min={0} max={100} value={Math.round(cue.strength*100)} onChange={e=>setTimeline(cues.map((c,i)=>i===index?{...c,strength:Number(e.target.value)/100}:c))} style={{width:"100%"}}/></label>
          <label style={{fontSize:12}}>Dauer (ms)<input type="number" min={60} max={10000} value={cue.durationMs} step={50} onChange={e=>setTimeline(cues.map((c,i)=>i===index?{...c,durationMs:Number(e.target.value)}:c))} style={{width:"100%",minHeight:36}}/></label>
          {cue.kind==="color"&&<label style={{gridColumn:"span 3",fontSize:12}}>Farbe <input type="color" value={cue.color??colors[0]} onChange={e=>setTimeline(cues.map((c,i)=>i===index?{...c,color:e.target.value}:c))}/></label>}
        </div>)}
        <div style={{display:"flex",gap:8}}><button type="button" style={buttonStyle} onClick={()=>{const previous=loadLightCues(trackId,durationMs);const ok=saveLightCues(trackId,durationMs,cues);if(ok){for(const cue of cues){const old=previous.find(p=>p.id===cue.id);if(old&&old.atMs!==cue.atMs)feedback(old,"edit",cue.atMs-old.atMs);}}setMessage(ok?"Timeline gespeichert":"Speichern fehlgeschlagen");if(ok)setDirty(false);}}>Timeline speichern</button><button type="button" style={{...buttonStyle,background:"#42445a"}} onClick={()=>{setCues(loadLightCues(trackId,durationMs));setDirty(false);}}>Zurücksetzen</button></div>
      </>}
      <small>Automatisch geschätzte Drops sind keine präzisen Songmarker. Vorschläge werden erst nach deiner Bestätigung gespeichert. Strobes sind reduziert und respektieren Reduced Motion.</small>
    </div>}
  </div>;
}
