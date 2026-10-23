"use client";
import {useEffect,useMemo,useState} from "react";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {useMusic} from "@/context/MusicContext";
import {CHARACTER_MOTION_CHANGE_EVENT,loadCharacterMotionStore,saveCharacterMotionStore} from "./characterMotionLibrary";
import {catalogAutoMotionsV438,nextAutomaticRapShowV438} from "./automaticMotionIntelligenceV438";
import {MOTION_ANALYSIS_EVENT_V439,readMotionCacheV439,featuresForMotionsV439} from "./glbMotionCacheV439";
import {scanMotionLibraryV439} from "./glbMotionScanV439";
import {emptyDanceSequence,danceSlot} from "./intelligentDanceCombinationV242";
import type {MotionSceneV438} from "./automaticMotionIntelligenceV438";
import {planFeatureCastV440} from "./automaticFeatureShowV440";
import {planMultiArtistCastV442} from "./automaticMultiArtistStageV442";
import {avatarModels} from "./avatarModels";
import {VOCAL_CHANGE_EVENT_V445} from "./vocalChangeEvidenceV445";

export function AutoMotionIntelligencePanelV438(){
  const {preferences,updatePreferences}=useUiPreferences();
  const {track,progressMs}=useMusic();
  const [store,setStore]=useState(()=>loadCharacterMotionStore());
  const [scene,setScene]=useState<MotionSceneV438>("hook");
  const [analysisRevision,setAnalysisRevision]=useState(0);
  const [scanning,setScanning]=useState(false);
  const [lastVocalHintV445,setLastVocalHintV445]=useState<{trackId:string;atMs:number;confidence:number}|null>(null);
  useEffect(()=>{
    const onHint=(e:Event)=>{
      const d=(e as CustomEvent<{trackId:string;atMs:number;confidence:number}>).detail;
      if(d&&typeof d.trackId==="string"&&Number.isFinite(d.atMs)&&Number.isFinite(d.confidence))
        setLastVocalHintV445(d);
    };
    window.addEventListener(VOCAL_CHANGE_EVENT_V445,onHint);
    return ()=>window.removeEventListener(VOCAL_CHANGE_EVENT_V445,onHint);
  },[]);
  useEffect(()=>{const refresh=()=>setAnalysisRevision(v=>v+1);
    window.addEventListener(MOTION_ANALYSIS_EVENT_V439,refresh);
    return ()=>window.removeEventListener(MOTION_ANALYSIS_EVENT_V439,refresh);
  },[]);
  useEffect(()=>{
    const refresh=()=>setStore(loadCharacterMotionStore());
    refresh();
    window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT,refresh);
    return ()=>window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT,refresh);
  },[]);
  const avatarId=preferences.avatarModelId;
  const analyzed=useMemo(()=>featuresForMotionsV439(store.motions,readMotionCacheV439()),
    [store,analysisRevision]);
  const profiles=useMemo(()=>catalogAutoMotionsV438(store,avatarId,analyzed),[store,avatarId,analyzed]);
  const analyzedCount=profiles.filter(p=>Boolean(analyzed[p.id])).length;
  const scanRest=async()=>{
    if(scanning)return;
    setScanning(true);
    try{await scanMotionLibraryV439(store.motions,avatarId,undefined,250,true);}
    finally{setScanning(false);}
  };
  const enabled=preferences.rapAutoMotionEnabledV438??true;
  const variety=preferences.rapAutoMotionVarietyV438??70;
  const featureCast=useMemo(()=>planFeatureCastV440({track,enabled:preferences.rapFeatureAvatarsV440??true,
    mode:preferences.multiAvatarMode??"solo",avatarStage:preferences.visualizerMode==="avatar",
    reducedMotion:preferences.reducedMotion}),
    [track,preferences.rapFeatureAvatarsV440,preferences.multiAvatarMode,preferences.visualizerMode,preferences.reducedMotion]);
  const groupCastV442=planMultiArtistCastV442({artists:featureCast.artists,
    enabled:(preferences.rapMultiArtistEnabledV442??true)&&(preferences.rapFeatureAvatarsV440??true),
    maxCount:preferences.rapMultiArtistMaxV442??4,avatarStage:preferences.visualizerMode==="avatar",
    reducedMotion:preferences.reducedMotion,
    manualMode:(preferences.multiAvatarMode??"solo")!=="solo"||
      preferences.avatarMotionMode==="choreography"||!!preferences.avatarTimelineEnabled||
      !!preferences.avatarBlendEnabled||!!preferences.smartDanceOverride||
      (preferences.avatarDancePreset??"auto")!=="auto"});
  const extraModelIdsV442=preferences.rapMultiArtistExtraModelsV442??["",""];
  const modelChoicesV442=Array.from(new Set([
    ...avatarModels.map(m=>m.id),preferences.avatarModelId,preferences.secondaryAvatarModelId??"",
    ...extraModelIdsV442].filter(Boolean)));
  const example=useMemo(()=>nextAutomaticRapShowV438(emptyDanceSequence(),
    {...store,automatic:true},{enabled:true,manualProtected:false,playing:true,reducedMotion:false,
      trackId:track?.id??"V438-preview",avatarId,genre:"",progressMs:progressMs>=0?progressMs:0,
      durationMs:track?.durationMs??0,energy:scene==="hook"?.8:scene==="break"?.15:.5,
      scene,phraseSlot:danceSlot(progressMs,120),variety,motionProfilesV439:analyzed}),
    [store,track?.id,track?.durationMs,avatarId,progressMs,scene,variety,analyzed]);
  return <fieldset aria-label="V438 Automatic Motion Intelligence" style={{marginTop:10,padding:12,border:"1px solid #607780",borderRadius:8}}>
    <legend>V438 · Automatic Motion Intelligence</legend>
    <fieldset aria-label="V446 Smart Automatic Rap Show" style={{padding:10,margin:"5px 0 12px",border:"1px solid #3d909a",borderRadius:8}}>
      <legend>V446 · Smart Automatic Rap Show</legend>
      <label className="setting-check"><input type="checkbox" checked={preferences.rapSmartShowEnabledV446??true}
        onChange={e=>updatePreferences({rapSmartShowEnabledV446:e.target.checked})}/>
        Show-Autopilot verwenden (empfohlen)</label>
      <small>Ein Schalter für ruhige Szenenwechsel, abwechslungsreiche Tanzfolgen und passende
        Gruppenaufstellungen und Kameraschwerpunkte. Nutzt vorhandene synchronisierte Lyrics,
        ersatzweise Songtempo. Keine neue Installation, kein Dateiupload und keine Stimmerkennung.
        Manuelle Tanzfolgen, Rapper-Zuordnungen und Kamera-Keyframes haben Vorrang.
        Installierte GLB-Motions werden nur gewählt, wenn die Motion-Bibliothek-Automatik aktiv ist.</small>
    </fieldset>
    <label className="setting-check"><input type="checkbox" checked={enabled}
      onChange={e=>updatePreferences({rapAutoMotionEnabledV438:e.target.checked})}/>
      Vorhandene Motions automatisch kombinieren</label>
    <label>Abwechslung ({variety} %)
      <input type="range" min="0" max="100" step="5" value={variety}
        aria-label="V438 Motion Vielfalt" onChange={e=>updatePreferences({rapAutoMotionVarietyV438:Number(e.target.value)})}/></label>
    <fieldset aria-label="V440 Feature Song Ensemble" style={{padding:9,margin:"8px 0",border:"1px solid #507c92",borderRadius:7}}>
      <legend>V440 · Automatic Feature Show</legend>
      <label className="setting-check"><input type="checkbox" checked={preferences.rapFeatureAvatarsV440??true}
        onChange={e=>updatePreferences({rapFeatureAvatarsV440:e.target.checked})}/>
        Bei Songs mit mehreren Spotify-Künstlern automatisch zwei Avatare zeigen</label>
      <label className="setting-check"><input type="checkbox" checked={preferences.rapAutoChoreographyV440??true}
        onChange={e=>updatePreferences({rapAutoChoreographyV440:e.target.checked})}/>
        Bewegungen für beide Avatare automatisch arrangieren</label>
      <p>Spotify-Credits: <strong>{featureCast.artists.length?featureCast.artists.join(" · "):"Keine Künstler-Credits"}</strong></p>
      <p>Bühne: <strong>{groupCastV442.enabled?`Automatische ${groupCastV442.count}er-Gruppe`:featureCast.enabled?"Automatisches Duo":featureCast.source==="manual-mode"?"Manuell gewählte Formation":"Bestehende Aufstellung"}</strong>
        {featureCast.artists.length>2&&" · V442 kann bis zu vier Künstler aufstellen"}</p>
      <small>Spotify-Künstlerlisten erkennen eine Zusammenarbeit, nicht den Sänger einer bestimmten Lyrics-Zeile.
        Der Bühnenfokus wechselt deshalb nach musikalischen Abschnitten und ist ausdrücklich keine Stimmerkennung.
        Manuelle Formation und Clip-Timelines haben Vorrang. Deaktivieren erhält die bisherige Solo-Aufstellung.</small>
    </fieldset>
    <fieldset aria-label="V442 Multi Artist Director" style={{padding:9,margin:"8px 0",border:"1px solid #507c92",borderRadius:7}}>
      <legend>V442 · Multi-Artist Stage Director (3–4 Avatare)</legend>
      <label className="setting-check"><input type="checkbox" checked={preferences.rapMultiArtistEnabledV442??true}
        onChange={e=>updatePreferences({rapMultiArtistEnabledV442:e.target.checked})}/>
        Bei Tracks mit drei oder mehr Künstlern automatisch eine Gruppenbühne einsetzen</label>
      <label>Maximale Anzahl Avatare: <select aria-label="V442 Maximale Avataranzahl"
        value={preferences.rapMultiArtistMaxV442??4}
        onChange={e=>updatePreferences({rapMultiArtistMaxV442:Number(e.target.value) as 2|3|4})}>
        <option value={2}>2 – Duo beibehalten</option><option value={3}>3</option><option value={4}>4</option>
      </select></label>
      {[0,1].map((index)=><label key={index}>Avatar {index+3} (optional eigenes Modell)
        <select aria-label={`V442 Avatar ${index+3} Modell`} value={extraModelIdsV442[index]??""}
          onChange={e=>{
            const next=[...extraModelIdsV442];next[index]=e.target.value;
            updatePreferences({rapMultiArtistExtraModelsV442:next});
          }}>
          <option value="">Automatisch: vorhandene Modelle abwechseln</option>
          {modelChoicesV442.map(id=><option key={id} value={id}>{avatarModels.find(m=>m.id===id)?.label??id}</option>)}
        </select>
      </label>)}
      <small>Automatische Besetzung nur bei Spotify-Track-Credits und nicht manuell gewählter Formation.
        Bereits konfigurierte V326-Gruppen, Clips, Kamera-Keyframes und V416-Rollen behalten Vorrang.
        Die Namen stehen für Bühnenplätze, nicht für automatisch erkannte Rapper-Stimmen.
        Leistungsbedarf steigt mit jeder zusätzlichen GLB-Figur.</small>
    </fieldset>
    <fieldset aria-label="V443 Artist Spotlight" style={{padding:9,margin:"8px 0",border:"1px solid #507c92",borderRadius:7}}>
      <legend>V443 · Automatic Artist Spotlight &amp; Stage Interaction</legend>
      <label className="setting-check"><input type="checkbox" checked={preferences.rapArtistSpotlightEnabledV443??true}
        onChange={e=>updatePreferences({rapArtistSpotlightEnabledV443:e.target.checked})}/>
        Künstlerfokus, dezente Blickwendung und gemeinsame Hook-Auftritte automatisch inszenieren</label>
      <label>Spotlight-Intensität ({preferences.rapArtistSpotlightStrengthV443??65} %)
        <input type="range" aria-label="V443 Spotlight-Intensität" min="0" max="100" step="5"
          value={preferences.rapArtistSpotlightStrengthV443??65}
          onChange={e=>updatePreferences({rapArtistSpotlightStrengthV443:Number(e.target.value)})}/></label>
      <small>Aktiv nur auf der automatisch erzeugten V442-Gruppenbühne mit drei oder vier Künstlern.
        Der visuelle Fokus beruht auf Lyrics-Phrasen und Credits, nicht auf Stimmerkennung.
        Manuelle Gruppenaufstellungen, V416-Rollen und selbst gewählte Bewegungen bleiben unangetastet.
        Bei ausgeschalteter reduzierter Bewegung sind animierte Namensblasen aktiv.</small>
    </fieldset>
    <fieldset aria-label="V444 Smart Multi Artist Interaction" style={{padding:9,margin:"8px 0",border:"1px solid #507c92",borderRadius:7}}>
      <legend>V444 · Smart Multi-Artist Interaction &amp; Vocal Focus</legend>
      <label className="setting-check"><input type="checkbox" checked={preferences.rapArtistInteractionEnabledV444??true}
        onChange={e=>updatePreferences({rapArtistInteractionEnabledV444:e.target.checked})}/>
        Kleine Kopfbewegungen, Publikumsgesten und Call-and-Response automatisch inszenieren</label>
      <label>Interaktionsintensität ({preferences.rapArtistInteractionStrengthV444??60} %)
        <input type="range" min="0" max="100" step="5" aria-label="V444 Interaktionsintensität"
          value={preferences.rapArtistInteractionStrengthV444??60}
          onChange={e=>updatePreferences({rapArtistInteractionStrengthV444:Number(e.target.value)})}/></label>
      <small>Bei aktiver automatisch erzeugter V442-Gruppenbühne (3–4 Avatare) steuert V444
        bestehende Kopf-/Augen- und dezente Armanimationen. V385- und V416-Vocal-Rollen
        werden nur dort berücksichtigt, wo du sie ausdrücklich zugewiesen hast. Ohne diese Daten
        wechselt lediglich der visuelle Bühnenfokus – keine Stimmerkennung. Manuelle Gruppenaufstellungen,
        Vocal-Regie und GLB-Clips bleiben erhalten; reduzierter Bewegungsmodus deaktiviert die Zusatzgesten.</small>
    </fieldset>
    <fieldset aria-label="V445 Vocal Change Evidence" style={{padding:9,margin:"8px 0",border:"1px solid #507c92",borderRadius:7}}>
      <legend>V445 · Possible Vocal / Mix Changes</legend>
      <label className="setting-check"><input type="checkbox" checked={preferences.rapVocalChangeEnabledV445??true}
        onChange={e=>updatePreferences({rapVocalChangeEnabledV445:e.target.checked})}/>
        Mikrofon-Klangwechsel an Lyrics-Grenzen vorsichtig berücksichtigen</label>
      <label>Empfindlichkeit ({preferences.rapVocalChangeSensitivityV445??60} %)
        <input type="range" aria-label="V445 Empfindlichkeit" min="0" max="100" step="5"
          value={preferences.rapVocalChangeSensitivityV445??60}
          onChange={e=>updatePreferences({rapVocalChangeSensitivityV445:Number(e.target.value)})}/></label>
      <p>Letzter vorsichtiger Klangwechsel-Hinweis: <strong>{lastVocalHintV445!=null&&lastVocalHintV445.trackId===track?.id?
        `${(lastVocalHintV445.atMs/1000).toFixed(1)} s · maximal ${Math.round(lastVocalHintV445.confidence*100)} % Anhaltspunkt`:
        "Noch kein Hinweis bei diesem Track"}</strong></p>
      <small>Nur bei aktivem Mikrofon und synchronisierten Lyrics auf einer Feature-Duo- oder automatischen 3–4-Avatar-Bühne.
        Das Audiosignal liefert lediglich Bass-, Mitten- und Höhenenergie: Ein Klangwechsel kann
        auch durch Instrumente, Effekte oder Mixing entstehen. Deshalb werden Hinweise niemals
        einem bestimmten Sänger oder Spotify-Künstler zugeordnet; sie lösen höchstens eine dezente
        neutrale Reaktion aus. Gespeicherte V385-/V416-Rollen haben Vorrang. Keine Audiodaten
        werden von V445 gespeichert oder hochgeladen; ohne Mikrofon bleibt die Funktion inaktiv.</small>
    </fieldset>
    <fieldset aria-label="V441 Artist Name Bubbles" style={{padding:9,margin:"8px 0",border:"1px solid #507c92",borderRadius:7}}>
      <legend>V441 · Künstler-Sprechblasen</legend>
      <label className="setting-check"><input type="checkbox" checked={preferences.artistNameBubblesV441??true}
        onChange={e=>updatePreferences({artistNameBubblesV441:e.target.checked})}/>
        Künstlernamen über Avataren automatisch anzeigen</label>
      <label>Anzeige
        <select aria-label="V441 Anzeigenmodus" value={preferences.artistBubbleModeV441??"focus"}
          onChange={e=>updatePreferences({artistBubbleModeV441:e.target.value as "focus"|"intro"|"always"})}>
          <option value="focus">Songstart, Verse-Fokus und Hook</option>
          <option value="intro">Nur bei Songstart und Abschnittswechsel</option>
          <option value="always">Immer gleichberechtigt sichtbar</option>
        </select>
      </label>
      <label>Stil
        <select aria-label="V441 Blasenstil" value={preferences.artistBubbleStyleV441??"comic"}
          onChange={e=>updatePreferences({artistBubbleStyleV441:e.target.value as "comic"|"neon"|"minimal"})}>
          <option value="comic">Comic-Sprechblase</option>
          <option value="neon">Neon-Bühnenlabel</option>
          <option value="minimal">Dezentes Namensschild</option>
        </select>
      </label>
      <label className="setting-check"><input type="checkbox" checked={preferences.artistBubbleSoloV441??true}
        onChange={e=>updatePreferences({artistBubbleSoloV441:e.target.checked})}/>
        Künstlername auch bei Solo-Songs anzeigen</label>
      <small>Die Blasen hängen direkt über den 3D-Bühnenplätzen und folgen der tatsächlichen Kamera.
        Bei Hooks werden beide Namen hervorgehoben; der Verse-Fokus ist eine visuelle Inszenierung,
        keine Erkennung der Stimme. Deine V416-Rollenzuordnungen haben Vorrang.
        Es werden nur verfügbare Spotify-Künstlernamen angezeigt, keine erfundenen Rollen.</small>
    </fieldset>
    <label className="setting-check"><input type="checkbox" checked={store.automatic}
      onChange={e=>saveCharacterMotionStore({...store,automatic:e.target.checked})}/>
      Installierte Motion-Library automatisch verwenden</label>
    <p>Erkannte Clips für den ausgewählten Avatar: <strong>{profiles.length}</strong>
      {profiles.length>0&&<> · {profiles.filter(p=>p.confidence==="configured").length} ausdrücklich gekennzeichnet ·
      {" "}{profiles.filter(p=>p.confidence==="name-hint").length} aus Namen abgeleitet</>}</p>
    <p><strong>V439 · GLB Motion Analyzer:</strong> {analyzedCount} von {profiles.length} Clips aus echten Keyframes bewertet.
      Die ersten 12 GLBs werden bei aktiver Avatar-Automatik im Hintergrund der Browseransicht nacheinander untersucht.</p>
    <button type="button" disabled={scanning||profiles.length===0} onClick={()=>void scanRest()}>
      {scanning?"Untersuche GLB-Animationen …":"Alle GLB-Animationen erneut analysieren"}</button>
    {profiles.length>0&&<>
      <label>Vorschau für Abschnitt
        <select value={scene} onChange={e=>setScene(e.target.value as MotionSceneV438)}>
          <option value="verse">Verse</option><option value="reply">Antwort</option>
          <option value="duet">Duett</option><option value="hook">Hook</option>
          <option value="build">Build</option><option value="drop">Drop</option>
          <option value="break">Pause</option>
        </select>
      </label>
      <p>Vorschlag: <strong>{example.chosen?.name??"Kein passender Clip"}</strong></p>
      <ul style={{margin:"6px 0",paddingLeft:20}}>{profiles.slice(0,6).map(p=><li key={p.id}>
        {p.name} · {p.recommended.join(" / ")} · {p.confidence==="configured"?"manuell markiert":p.confidence==="measured"?"3D-Keyframes":p.confidence==="name-hint"?"Namenshinweis":"universell"}
        {analyzed[p.id]&&<> · Arme {Math.round(analyzed[p.id].arms*100)} % · Beine {Math.round(analyzed[p.id].legs*100)} % · Loop {Math.round(analyzed[p.id].loopability*100)} %</>}
      </li>)}</ul>
    </>}
    <small>Keine Clip-Installation nötig, wenn passende Animationen schon vorhanden sind.
      Bei vollständig leerer Bibliothek bleibt die bisherige Animation aktiv.
      V439 verwendet bei ausreichender Datenbasis gemessene Animations-Keyframes für Intensität,
      Arm- und Beinaktivität und Loop-Eignung. Manuelle Kategorien bleiben vorrangig.
      Ohne auswertbare GLBs bleiben Metadaten und Namenshinweise als Fallback aktiv.
      Die Messung ist keine verifizierte Fußkontakt-, Beat- oder Tanzqualitätsanalyse.
      Pro GLB gelten ein 12-MB-Limit und ein 13-Sekunden-Zeitlimit; ein Fehler ändert keine installierte Animation.
      Wechsel erfolgen nur an musikalischen Phrasengrenzen beziehungsweise beim Szenenwechsel.
      Manuelle Choreografien, Timeline, Blend-Modus, reduzierte Bewegung und die abgeschaltete Motion-Library behalten Vorrang.
      Diese Vorschau spielt keinen Song ab und ändert keine Clips.</small>
  </fieldset>;
}
