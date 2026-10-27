"use client";
import {useEffect,useMemo,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {inspectVocalTimingV373,summarizeVocalTimingV373,VOCAL_TIMING_DEMO_V373} from "./vocalSyncDiagnosticsV373";
import {resolveAdaptiveVocalPerformanceV375} from "./adaptiveVocalPerformanceV375";
import {resolveDuetInteractionV376,overlayDuetV376} from "./interactiveVocalDuetsV376";
import {planCinematicDuetCameraV377} from "./cinematicDuetCameraV377";
import {planCinematicLyricsV378} from "./cinematicLyricsCompositionV378";
import {resolveManualVocalCueV385,applyManualVocalCueV385} from "./manualVocalCastingV385";
import {resolveConcertCueV386} from "./expressiveConcertDirectorV386";
import type {StageSection} from "./stageDirectorV287";
import {normalizeRapAudioDocumentV423,sampleRapAudioV423} from "./rapAudioAwareV423";
import {sampleWordConcertV567} from "./wordSyncedConcertV567";

const formatMs=(n:number)=>`${Math.floor(Math.max(0,n)/60000)}:${String(Math.floor(Math.max(0,n)%60000/1000)).padStart(2,"0")}.${String(Math.floor(Math.max(0,n)%1000/10)).padStart(2,"0")}`;
const qualityLabels={word:"Wort-Timing",line:"Nur Zeilen-Timing",none:"Kein synchronisiertes Timing"} as const;
const statusLabels={word:"Aktives Wort",line:"Zeilen-Schätzung",paused:"Wiedergabe pausiert",unsynced:"Kein Sync-Signal",silent:"Pause oder Textlücke"} as const;
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;

type SourceV373="song"|"demo";
type ModeV373="live"|"preview";
export function VocalSyncInspectorV373(){
  const {track,progressMs,isPlaying,fetchedAt,lyrics,genre}=useMusic();
  const {preferences,updatePreferences}=useUiPreferences();
  const [source,setSource]=useState<SourceV373>("song");
  const [mode,setMode]=useState<ModeV373>("live");
  const [previewMs,setPreviewMs]=useState(1550);
  const [previewDancersV374,setPreviewDancersV374]=useState(1);
  const [previewSlotV374,setPreviewSlotV374]=useState(0);
  const [previewSectionV375,setPreviewSectionV375]=useState<StageSection>("verse");
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{if(mode!=="live"||!isPlaying)return;const interval=window.setInterval(()=>{if(!document.hidden)setNow(Date.now());},100);return()=>window.clearInterval(interval);},[mode,isPlaying]);
  const realProgress=isPlaying?Math.min(track?.durationMs??Infinity,Math.max(0,progressMs+Math.max(0,now-fetchedAt))):Math.max(0,progressMs);
  const demo=source==="demo";
  const activeLyrics=demo?VOCAL_TIMING_DEMO_V373:lyrics;
  const maxMs=demo?9600:Math.max(1000,track?.durationMs??0,activeLyrics?.lines.at(-1)?.endMs??0);
  const progress=mode==="preview"?clamp(previewMs,0,maxMs):demo?(realProgress%9600):realProgress;
  const lyricTime=Math.max(0,progress+(demo?0:preferences.lyricsOffsetMs??0));
  const report=useMemo(()=>summarizeVocalTimingV373(activeLyrics),[activeLyrics]);
  const isActive=mode==="preview"||isPlaying;
  const inspected=inspectVocalTimingV373(activeLyrics,lyricTime,isActive,{
    enabled:preferences.avatarVocalCoordinationEnabledV372??true,
    reducedMotion:preferences.reducedMotion,
    alignment:preferences.avatarVocalCoordinationStrengthV372??70,
    timingOffsetMs:preferences.avatarVocalCoordinationOffsetMsV372??0,
    genre:demo?"Deutschrap":genre,style:preferences.avatarVocalStyleV368??"auto",
    mode:preferences.avatarLipSyncMode??"lyrics",lipStrength:preferences.avatarLipSyncEnabled===false?0:preferences.avatarLipSyncStrength??90,
    expression:(preferences.avatarFacialExpressionV368??55)/100,jawFollow:preferences.avatarJawFollowV369??65,
    bodyEnabled:preferences.avatarVocalBodyEnabledV371??true,
    bodyStrength:preferences.avatarVocalBodyStrengthV371??60,
    eyeContact:preferences.avatarVocalEyeContactV371??true,gestures:preferences.avatarVocalGesturesV371??true,
  },{
    qualityEnabledV374:preferences.avatarVocalQualityEnabledV374??true,
    naturalArticulationEnabledV384:preferences.avatarNaturalArticulationEnabledV384??true,
    articulationStrengthV384:preferences.avatarArticulationStrengthV384??70,
    lipSealV384:preferences.avatarLipSealV384??90,
    jawStabilityV384:preferences.avatarJawStabilityV384??65,
    mouthSmoothnessV374:preferences.avatarVocalMouthSmoothnessV374??65,
    rapSyllableEnabledV419:preferences.avatarRapSyllableEnabledV419??false,rapSyllableStrengthV419:preferences.avatarRapSyllableStrengthV419??65,rapSyllableSmoothnessV419:preferences.avatarRapSyllableSmoothnessV419??70,rapSyllableEditsEnabledV420:preferences.rapSyllableEditsEnabledV420??false,rapSyllableTrackIdV420:track?.id??"",rapSyllableDocumentV420:track?.id?(preferences.rapSyllableDocumentsV420??{})[track.id]??null:null,rapAudioEnabledV423:!demo&&(preferences.rapAudioEnabledV423??false),rapAudioStrengthV423:preferences.rapAudioStrengthV423??45,rapAudioOffsetMsV423:preferences.rapAudioOffsetMsV423??0,rapAudioTrackIdV423:track?.id??"",rapAudioDocumentV423:!demo&&track?.id?(preferences.rapAudioDocumentsV423??{})[track.id]??null:null,rapLipEnabledV415:preferences.avatarRapLipEnabledV415??false,rapLipPrecisionV415:preferences.avatarRapLipPrecisionV415??70,rapLipOffsetMsV415:preferences.avatarRapLipOffsetMsV415??0,
    rapGestureCalmV374:preferences.avatarVocalRapGestureCalmV374??70,
    ensembleModeV374:preferences.avatarVocalEnsembleModeV374??"lead",
    ensembleCountV374:previewDancersV374,avatarSlot:Math.min(previewSlotV374,previewDancersV374-1),
  });
  const audioDocV423=!demo&&track?.id?normalizeRapAudioDocumentV423(track.id,(preferences.rapAudioDocumentsV423??{})[track.id],track.durationMs):null;
  const audioSampleV423=sampleRapAudioV423(audioDocV423,progress+(preferences.rapAudioOffsetMsV423??0));
  const concertWordV567=sampleWordConcertV567({lyrics:activeLyrics,timeMs:inspected.effectiveTimeMs,
    playing:isActive,reducedMotion:preferences.reducedMotion});
  const face=inspected.face,body=inspected.body;
  const qualityV374="qualityV374" in inspected ? inspected.qualityV374 as import("./vocalPerformanceQualityV374").VocalQualityResultV374["qualityV374"] : null;
  const articulationV384="articulationV384" in inspected ? inspected.articulationV384 as import("./naturalVocalArticulationV384").NaturalArticulationCueV384["articulationV384"] : null;
  const articulationV405="articulationV405" in inspected ? inspected.articulationV405 as import("./rapArticulationV405").RapArticulationCueV405["articulationV405"] : null;
  const rapLipV415="rapLipV415" in inspected? inspected.rapLipV415 as import("./rapLipPrecisionV415").RapLipDiagnosticV415:null;
  const syllableV419="rapSyllableV419" in inspected ? inspected.rapSyllableV419 as import("./rapSyllableArticulationV419").RapSyllableDiagnosticV419 : null;
  const performanceV375=resolveAdaptiveVocalPerformanceV375({
    lyrics:activeLyrics,progressMs:lyricTime,playing:isActive,reducedMotion:preferences.reducedMotion,
    section:previewSectionV375,count:previewDancersV374,bpm:120,
    mode:preferences.avatarAdaptivePerformanceModeV375??"off",
    strength:preferences.avatarAdaptivePerformanceStrengthV375??65,
  });
  const duetPreviewV376=resolveDuetInteractionV376({lyrics:activeLyrics,progressMs:lyricTime,
    playing:isActive,reducedMotion:preferences.reducedMotion,count:previewDancersV374,
    mode:preferences.avatarVocalDuetModeV376??"off",strength:preferences.avatarVocalDuetStrengthV376??60,
    performance:performanceV375});
  const manualV385=resolveManualVocalCueV385({lyrics:activeLyrics,progressMs:lyricTime,
    playing:isActive,count:previewDancersV374,enabled:!demo&&preferences.avatarManualVocalEnabledV385===true&&!!track?.id,
    assignments:!demo&&track?.id?(preferences.avatarVocalAssignmentsV385??{})[track.id]??[]:[]});
  const concertV386=resolveConcertCueV386({mode:preferences.avatarConcertDirectorModeV386??"off",
    strength:preferences.avatarConcertDirectorStrengthV386??65,playing:isActive,
    reducedMotion:preferences.reducedMotion,count:previewDancersV374,manual:manualV385,
    duet:applyManualVocalCueV385(duetPreviewV376,manualV385,preferences.reducedMotion),
    section:previewSectionV375});
  const duetCameraV377=planCinematicDuetCameraV377({mode:preferences.avatarDuetCameraModeV377??"off",
    strength:preferences.avatarDuetCameraStrengthV377??65,playing:isActive,reducedMotion:preferences.reducedMotion,
    count:previewDancersV374,section:previewSectionV375,duet:duetPreviewV376});
  const lyricsCameraV378=planCinematicLyricsV378({mode:preferences.avatarLyricsCameraModeV378??"off",
    strength:preferences.avatarLyricsCameraStrengthV378??70,playing:isActive,
    reducedMotion:preferences.reducedMotion,lyricsVisible:preferences.lyricsVisible,
    side:preferences.lyricsImmersiveEnabled?(preferences.lyricsImmersiveSide==="left"?"left":"right"):null,
    lyrics:activeLyrics,progressMs:lyricTime,section:previewSectionV375,duet:duetCameraV377});
  const duetPreviewBodyV376=overlayDuetV376(body,duetPreviewV376,previewSlotV374,isActive);
  const channels=[
    {label:"Kiefer",value:face.jaw},{label:"Lippen offen / breit",value:face.wide},
    {label:"Lippen rund",value:face.round},{label:"Lippenverschluss",value:face.lipsClosed},
    {label:"Mimik / Brauen",value:face.brow},
    {label:"Kopfakzent",value:clamp(Math.abs(duetPreviewBodyV376.headPitch)/.16,0,1)},
    {label:"Gesten",value:clamp(Math.max(Math.abs(duetPreviewBodyV376.leftArm),Math.abs(duetPreviewBodyV376.rightArm))/.2,0,1)},
  ];
  const marks=inspected.marks;
  const hasSource=demo||!!track;
  return <section className="v373-inspector" aria-label="V373 Vocal Sync Diagnose und Vorschau">
    <header><h3>V373 · Vocal Sync Inspector</h3><p>Live-Timing und Vorschau für Mund, Gesicht, Kopf und Gesten. Kein Mikrofon und keine phonetische Spracherkennung.</p></header>
    <div className="v373-actions" role="group" aria-label="Lyrics-Quelle">
      <button type="button" aria-pressed={!demo} onClick={()=>{setSource("song");setMode("live");}}>Aktueller Song</button>
      <button type="button" aria-pressed={demo} onClick={()=>{setSource("demo");setMode("preview");setPreviewMs(1550);}}>Test-Lyrics</button>
    </div>
    <div className="v373-actions" role="group" aria-label="Zeitmodus">
      <button type="button" aria-pressed={mode==="live"} disabled={demo||!hasSource} onClick={()=>setMode("live")}>Live</button>
      <button type="button" aria-pressed={mode==="preview"} onClick={()=>{setPreviewMs(lyricTime-(demo?0:preferences.lyricsOffsetMs??0));setMode("preview");}}>Zeitpunkt testen</button>
    </div>
    <div className="v373-overview" aria-live="off">
      <p><strong>Datenbasis:</strong> {qualityLabels[report.quality]} · {demo?"Demo, nicht Spotify":report.source??"Keine Quelle"}</p>
      <p><strong>Wortmarken:</strong> {report.timedWords} · <strong>Wortgetaktete Zeilen:</strong> {report.wordTimedLines}/{report.timedLines} ({report.wordCoveragePercent} %)</p>
      {report.invalidWords>0&&<p>Hinweis: {report.invalidWords} unbrauchbare Wortmarken wurden ignoriert.</p>}
      {!activeLyrics?.synced&&<p>Für diesen Song sind aktuell keine synchronisierten Lyrics vorhanden. Nutze die klar gekennzeichnete Test-Demo.</p>}
      {preferences.reducedMotion&&<p>Reduzierte Bewegung ist eingeschaltet – die Bewegungswerte bleiben neutral.</p>}
    </div>
    <p className="v373-time"><strong>{statusLabels[inspected.status]}</strong> · Text: {formatMs(lyricTime)} · Tänzer: {formatMs(inspected.effectiveTimeMs)}</p>
    {mode==="preview" && <label className="v373-scrub">Vorschau-Zeitpunkt: {formatMs(previewMs)}
      <input type="range" min="0" max={maxMs} step="25" value={clamp(previewMs,0,maxMs)} onChange={e=>setPreviewMs(Number(e.target.value))}/>
    </label>}
    <div className="v373-words" role="group" aria-label="Zeitmarken in der Nähe">
      {marks.length?marks.map(mark=>{
        const active=inspected.effectiveTimeMs>=mark.startMs&&inspected.effectiveTimeMs<mark.endMs;
        return <button type="button" key={mark.key} className={active?"v373-current":""}
          title={`${formatMs(mark.startMs)} – ${formatMs(mark.endMs)} · ${mark.kind==="word"?"Wort":"Zeile"}`}
          aria-pressed={active} onClick={()=>{setMode("preview");setPreviewMs(clamp(mark.startMs-(demo?0:preferences.lyricsOffsetMs??0)-(preferences.avatarVocalCoordinationEnabledV372===false?0:preferences.avatarVocalCoordinationOffsetMsV372??0)+75,0,maxMs));}}>
          {mark.label}
        </button>;
      }):<span>Keine aktiven Wort-/Zeilenmarken in der Nähe.</span>}
    </div>
    <p className="v373-active">{inspected.vocal.activeWord?`Aktuelles Wort: ${inspected.vocal.activeWord}`:inspected.confidence==="line"?"Zeilentiming: Mundformen nur geschätzt":"Keine aktive vokale Wortmarke"} · Modus: {inspected.vocal.style}</p>
    <p role="status" className="v373-active">V567 · Gemeinsame Wort-Zeitmarke: {concertWordV567.quality==='word'
      ?`Wort „${concertWordV567.word}“ (${formatMs(concertWordV567.startMs)}–${formatMs(concertWordV567.endMs)}) · Rap-/Karaoke-Akzente nur innerhalb dieser Marke`
      :concertWordV567.quality==='line'?'Nur Zeilen-Zeitmarke: keine zusätzlichen Wortakzente'
      :concertWordV567.quality==='paused'?'Pausiert oder reduzierte Bewegung: keine zusätzlichen Akzente'
      :'Keine geprüfte Wort- oder Zeilenmarke'}.</p>
    <fieldset className="v374-role-preview"><legend>V374 · Tänzerrollen-Vorschau</legend>
      <label>Tänzeranzahl (Simulation)<select value={previewDancersV374} onChange={e=>{setPreviewDancersV374(Number(e.target.value));setPreviewSlotV374(0);}}><option value={1}>Solo</option><option value={2}>Duo</option><option value={4}>Vier Tänzer</option></select></label>
      {previewDancersV374>1&&<label>Vorschau-Tänzer<select value={previewSlotV374} onChange={e=>setPreviewSlotV374(Number(e.target.value))}>{Array.from({length:previewDancersV374},(_,i)=><option value={i} key={i}>Tänzer {i+1}</option>)}</select></label>}
      <small>Nur die berechneten Rollen und Animationsziele im Inspector. Die Bühnengruppe wird nicht verändert; die Stimmzuordnung ist rein visuell.</small>
    </fieldset>
    <fieldset className="v375-formation-preview"><legend>V375 · Besetzungsregie-Vorschau</legend>
      <label>Songabschnitt (Simulation)<select value={previewSectionV375} onChange={e=>setPreviewSectionV375(e.target.value as StageSection)}><option value="verse">Verse / Strophe</option><option value="hook">Hook / Refrain</option><option value="build">Build-up</option><option value="drop">Drop</option><option value="break">Break</option></select></label>
      <p><strong>Auftritt:</strong> {performanceV375.formation==="solo"?"Solo":performanceV375.formation==="duo"?"Duo":"Gruppe"} · {performanceV375.activeCount} von {previewDancersV374} Tänzern · Lead: {performanceV375.leadSlot+1}</p>
      <p><strong>Aktiv:</strong> {performanceV375.activeSlots.map(i=>`Tänzer ${i+1}`).join(", ")} · Grundlage: {performanceV375.source==="lyrics"?"Lyrics-Phrasen":performanceV375.source==="section"?"Songabschnitt / Tempo":"Manueller Modus"}</p>
      <small>Vorschau, keine Änderung an der Bühne. Sänger werden nicht erkannt; festgelegte Bühnenchoreografien behalten Vorrang.</small>
    </fieldset>
    <fieldset className="v376-duet-preview"><legend>V376 · Interaktive Vocal-Duette</legend>
      <p><strong>Vocal Lead:</strong> Tänzer {duetPreviewV376.leadSlot+1} · <strong>Antwortpartner:</strong> {duetPreviewV376.partnerSlot===null?"keiner":`Tänzer ${duetPreviewV376.partnerSlot+1}`}</p>
      <p><strong>Regie-Cue:</strong> {duetPreviewV376.event==="handoff"?"Lead-Übergabe":duetPreviewV376.event==="reply"?"Rap-Antwort":"Kein aktueller Übergabeimpuls"} · {Math.round(duetPreviewV376.phase*100)} % · {duetPreviewV376.source==="word-timed"?"Wort- und Zeilenzeiten":duetPreviewV376.source==="line-timed"?"Zeilenzeiten":"Keine gesicherten Zeitmarken"}</p>
      <small>Nur visuelle Choreografie; keine Musiker- oder Stimmenerkennung. Verändert weder die Spotify-Wiedergabe noch die Bühnenbesetzung.</small>
    </fieldset>
    {articulationV384?.active&&<p className="v384-articulation-diagnostic">V384 · Artikulation: {articulationV384.bilabial==="initial"?"Lippenverschluss am Wortanfang":articulationV384.bilabial==="final"?"Lippenverschluss am Wortende":"Vokalverbindung"} · Lippenschluss {Math.round(articulationV384.closure*100)} % · Kieferberuhigung {Math.round(articulationV384.jawDamping*100)} % · Vokalverbindung {Math.round(articulationV384.vowelBlend*100)} %</p>}
    {articulationV405?.active&&<p className="v405-rap-articulation-diagnostic">V405 · Rap-Mundform (geschätzt): {({"round-vowel":"runder Vokal (O/U/Ö/Ü)","wide-vowel":"breiter Vokal (E/I/Ä)","labiodental":"F/V/W-Lippenkontakt","sibilant":"S/Z/ß-Zischlaut","neutral":"neutrale Lautform","none":"keine"} as const)[articulationV405.class]} · Stärke {Math.round(articulationV405.intensity*100)} % · Wort-Zeitmarke (keine Phonemerkennung)</p>}
    {qualityV374&&<p className="v374-diagnostic">V374: {qualityV374.role==="solo"?"Einzeltänzer":qualityV374.role==="lead"?"Lead-Rolle":qualityV374.role==="backing"?"Begleitung":"Gemeinsame Performance"} · Glättung {Math.round(qualityV374.mouthMix*100)} % · Gestenfaktor {Math.round(qualityV374.gestureGain*100)} % {qualityV374.rapidWord?"· schnelle Wortfolge":""}</p>}
    <div className="v373-channel-grid" aria-label="Berechnete Animationswerte">
      {channels.map(({label,value})=><div key={label} className="v373-channel"><span>{label}</span>
        <div className="v373-meter" role="meter" aria-label={label} aria-valuenow={Math.round(value*100)} aria-valuemin={0} aria-valuemax={100}>
          <span style={{width:`${Math.round(clamp(value,0,1)*100)}%`}}/>
        </div><output>{Math.round(clamp(value,0,1)*100)} %</output></div>)}
    </div>
    <fieldset className="v377-camera-preview"><legend>V377 · Cinematic Duet Camera – Vorschau</legend>
      <p><strong>Geplanter Shot:</strong> {duetCameraV377.active?duetCameraV377.shot==="group"?"Gruppenaufnahme":duetCameraV377.shot==="two-shot"?"Zweieraufnahme bei Übergabe":"Nahaufnahme des Lead-Tänzers":"Keine automatische Kamerafahrt"}</p>
      {duetCameraV377.active&&<p>Lead: Tänzer {duetCameraV377.leadSlot+1} · {duetCameraV377.reason==="hook"?"Hook/Drop":duetCameraV377.reason==="handoff"?"Rollenübergabe":"Strophe"} · Intensität: {Math.round(duetCameraV377.strength*100)} %</p>}
      <small>Simulation auf Basis der vorhandenen Lyrics-Marken und der gewählten Sektion; keine Erkennung der tatsächlichen Stimme. Reale Kamera folgt den sichtbaren Tänzerpositionen und respektiert manuelle Einstellungen.</small>
    </fieldset>
    <fieldset className="v386-concert-preview"><legend>V386 · Expressive Concert Director – Vorschau</legend>
      {concertV386.active?<>
        <p><strong>Szene:</strong> {concertV386.moment==="hook"?"Gemeinsame Hook":concertV386.moment==="handoff"?"Lead-Übergabe":concertV386.moment==="response"?"Feature-Antwort":"Strophe"} · <strong>Lead:</strong> Tänzer {concertV386.leadSlot+1}</p>
        <p>Begleitung: {concertV386.supportSlots.length?concertV386.supportSlots.map(i=>`Tänzer ${i+1}`).join(", "):"gemeinsamer Gesang"} · Kameravorschlag: {concertV386.camera==="group"?"Gruppe":concertV386.camera==="two-shot"?"Zweieraufnahme":"Lead"} · Reaktionsstärke {Math.round(concertV386.emphasis*100)} %</p>
      </>:<p>Keine aktive automatische Konzert-Interaktion. Prüfe V386-Modus, Besetzung, Song-Timing und die V385-/V376-Zuordnung.</p>}
      <small>Simulation auf Grundlage manuell zugeordneter Songzeilen oder aktiver Duett-Regie. Kein tatsächliches Sprechererkennen; die reale Bühne respektiert gespeicherte Animationen und Kamerapresets.</small>
    </fieldset>
    <fieldset className="v378-lyrics-preview"><legend>V378 · Cinematic Lyrics Composition – Vorschau</legend>
      <p><strong>Komposition:</strong> {lyricsCameraV378.active?(lyricsCameraV378.shot==="lyrics"?"Lyrics-Fokus am Phrasenende":lyricsCameraV378.shot==="face"?"Gesicht mit Text-Schutzzone":lyricsCameraV378.shot==="duet"?"Zweierbild mit Lyrics":lyricsCameraV378.shot==="group"?"Gruppenbild mit Lyrics":"Geschützter Karaoke-Bereich"):"Keine automatische Lyrics-Komposition"}</p>
      {lyricsCameraV378.active&&<p>Textseite: {lyricsCameraV378.side==="right"?"rechts":"links"} · Zeile {lyricsCameraV378.lineIndex+1} · {lyricsCameraV378.timed?"Wort-Zeitstempel vorhanden":"Nur Zeilenzeitstempel"}</p>}
      <small>Simulation für den gewählten Zeitpunkt. Eine Lyrics-Fokusfahrt erfordert echte Wortmarken. Kein Screenshot, keine Behauptung über den tatsächlichen Sänger.</small>
    </fieldset>
    <fieldset className="v419-rap-syllable-inspector" aria-label="V419 Rap-Silbenartikulation">
      <legend>V419 · Schneller Deutschrap – geschätzte Silbenartikulation</legend>
      <p><strong>Datenbasis:</strong> {syllableV419?.active?"Wortzeitstempel + Buchstaben/Vokalkerne (Schätzung)":"Keine aktive V419-Silbenschätzung"} · <strong>Wort:</strong> {syllableV419?.word??"–"}</p>
      <p><strong>Geschätzte Vokalkerne:</strong> {syllableV419?.estimatedSyllables??0} · <strong>verwendete Mundimpulse:</strong> {syllableV419?.sampledSyllables??0} · <strong>aktueller Vokalkern:</strong> {syllableV419?.nucleus??"–"}</p>
      <label className="setting-check"><input type="checkbox" checked={preferences.avatarRapSyllableEnabledV419??false} onChange={e=>updatePreferences({avatarRapSyllableEnabledV419:e.target.checked})}/> V419-Silbenartikulation im Live-Avatar aktivieren</label>
      <label>Artikulationsstärke ({preferences.avatarRapSyllableStrengthV419??65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarRapSyllableStrengthV419??65} onChange={e=>updatePreferences({avatarRapSyllableStrengthV419:Number(e.target.value)})}/></label>
      <label>Übergangsglättung ({preferences.avatarRapSyllableSmoothnessV419??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarRapSyllableSmoothnessV419??70} onChange={e=>updatePreferences({avatarRapSyllableSmoothnessV419:Number(e.target.value)})}/></label>
      <small>Keine akustische Phonem- oder Silbenerkennung. Die Wortgrenzen stammen aus synchronisierten Lyrics; Zwischenformen sind nur grobe Texthypothesen. Ohne Wortmarken bzw. in Pausen bleibt V419 inaktiv.</small>
    </fieldset>
    <fieldset className="v423-audio-aware-inspector" aria-label="V423 Audio-Lip-Sync-Merkmale">
      <legend>V423 · Lokale Audio-Hinweise für Rap-Mundformen</legend>
      <p><strong>Audioquelle:</strong> {audioDocV423?"Explizit analysierte lokale Audiodatei – abgeleitete Merkmale":"Keine passende lokale Audioanalyse"} · <strong>Live:</strong> {preferences.rapAudioEnabledV423&&audioDocV423?"optional aktiv":"deaktiviert"}</p>
      <p><strong>Energie:</strong> {audioSampleV423?Math.round(audioSampleV423.energy*100)+" %":"–"} · <strong>Klanghelligkeit:</strong> {audioSampleV423?Math.round(audioSampleV423.brightness*100)+" %":"–"} · <strong>Einsatz:</strong> {audioSampleV423?Math.round(audioSampleV423.onset*100)+" %":"–"}</p>
      <small>Merkmale der kompletten lokalen Aufnahme, keine isolierten Rap-Vocals und keine echten Phonem-Labels. Nur bei Wortzeitstempeln und aktivierter V419-Artikulation werden diese Hinweise live berücksichtigt; V420-Keyframes behalten Vorrang. Analyse und Speicherung erfolgen im Rap Performance Editor.</small>
    </fieldset>
    <fieldset className="v415-rap-lipsync-inspector" aria-label="V415 Rap-Lippen-Diagnose">
      <legend>V415 · Rap Lip-Sync – Vergleich und Mund-Zeitabgleich</legend>
      <p><strong>Erkannte Datenbasis:</strong> {rapLipV415?.active?"Wortzeitstempel · Text-Schätzung":"Keine V415-Wortartikulation"} · {rapLipV415?.word??"–"}</p>
      <p><strong>Mundzeit:</strong> {formatMs(rapLipV415?.mouthTimeMs??inspected.effectiveTimeMs)} · <strong>Worttempo:</strong> {rapLipV415?.rapid?"schnelle Wortfolge":"normal oder nicht verfügbar"} · <strong>B/P/M-Verschluss:</strong> {rapLipV415?.closure==="bilabial"?"geschätzt aktiv":"nicht aktiv"}</p>
      <div role="img" aria-label="V415 Mundkanäle aus Lyrics-Zeitstempeln, keine Audio-Messung" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}}>
        {[{name:"Kiefer",value:face.jaw},{name:"Breit",value:face.wide},{name:"Rund",value:face.round},{name:"Verschluss",value:face.lipsClosed}].map(channel=><div key={channel.name}>
          <span style={{fontSize:12}}>{channel.name} {Math.round(clamp(channel.value,0,1)*100)} %</span>
          <div style={{background:"#14213c",height:12,borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",background:"#63d5dd",width:`${clamp(channel.value,0,1)*100}%`}}/></div>
        </div>)}
      </div>
      <label className="setting-check"><input type="checkbox" checked={preferences.avatarRapLipEnabledV415??false} onChange={e=>updatePreferences({avatarRapLipEnabledV415:e.target.checked})}/> V415-Mundoptimierung im Live-Avatar aktivieren</label>
      <label>Mund-Präzision ({preferences.avatarRapLipPrecisionV415??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarRapLipPrecisionV415??70} onChange={e=>updatePreferences({avatarRapLipPrecisionV415:Number(e.target.value)})}/></label>
      <label>Nur Mund korrigieren ({preferences.avatarRapLipOffsetMsV415??0} ms)<input type="range" min="-150" max="150" step="5" value={preferences.avatarRapLipOffsetMsV415??0} onChange={e=>updatePreferences({avatarRapLipOffsetMsV415:Number(e.target.value)})}/></label>
      <small>Live oder Vorschau-Zeitpunkt ändern die Spotify-Wiedergabe nicht. Dies visualisiert textbasierte Mundformen; es misst keine tatsächliche Lippen-/Audio-Abweichung.</small>
    </fieldset>
    <fieldset className="v373-tuning"><legend>Zeitabgleich für die echte Show</legend>
      <label>Lyrics-Versatz: {preferences.lyricsOffsetMs??0} ms<input type="range" min="-2000" max="2000" step="25" value={clamp(preferences.lyricsOffsetMs??0,-2000,2000)} onChange={e=>updatePreferences({lyricsOffsetMs:Number(e.target.value)})}/></label>
      <label>Tänzer-Versatz: {preferences.avatarVocalCoordinationOffsetMsV372??0} ms<input type="range" min="-200" max="200" step="10" value={preferences.avatarVocalCoordinationOffsetMsV372??0} onChange={e=>updatePreferences({avatarVocalCoordinationOffsetMsV372:Number(e.target.value)})}/></label>
      <button type="button" onClick={()=>updatePreferences({lyricsOffsetMs:0,avatarVocalCoordinationOffsetMsV372:0})}>Beide Versätze zurücksetzen</button>
    </fieldset>
    <small>Diese Anzeige bewertet nur, ob Wort-/Zeilen-Zeitstempel vorhanden sind. Sie misst weder die Qualität der Audioaufnahme noch die tatsächliche Lippensynchronität. Bei der Vorschau wird Spotify nicht pausiert oder vorgespult; nur die Berechnung an einem Testzeitpunkt angezeigt.</small>
  </section>;
}
