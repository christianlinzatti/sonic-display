"use client";
import {LiveStageCanvasProbeV592} from "./LiveStageCanvasProbeV592";
// Extracted unchanged from ThreeAvatar.tsx (V492 modular refactor).
// --- Extracted dependencies (V492 refactor) ---
import {setPiStudioFeaturesV518} from "./piConcertPerformanceRuntimeV518";
import { LiveStageCanvasBridgeV301 } from "./LiveStageCanvasBridgeV301";
import { advanceRecoveryV395, initialRecoveryV395 } from "./displayRecoveryPolicyV395";
import { appendProductionEventV395, setProductionRecoveryStateV395, useDisplayProductionV395 } from "../DisplayProductionV395";
import { StageContentScreenV330 } from "./StageContentScreenV330";
import { StageContentScreensV333 } from "./StageContentScreensV333";
import { StageEnvironment } from "./stages";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { readMultiAvatarSettings, MULTI_AVATAR_EVENT, type MultiAvatarCue } from "./multiAvatarChoreography";
import { readChoreographyV312, CHOREOGRAPHY_V312_EVENT, type ChoreographyCueV312 } from "./intelligentDanceChoreographyV312";
import { type DuoScene } from "./duoChoreographyDirector";
import { readEnsembleTimelineV325, canPlayEnsembleTimelineV325, ENSEMBLE_TIMELINE_EVENT_V325 } from "./ensembleChoreographyV325";
import { readGroupV326, canRunGroupV326, GROUP_EVENT_V326 } from "./multiAvatarStageDirectorV326";
import { Component, type ErrorInfo, type ReactNode, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ArtistNameBubbleV441 } from "./ArtistNameBubbleV441";
import { ConcertQualityProbeV466 } from "./ConcertQualityProbeV466";
import { ConcertQualityInspectorV466 } from "./ConcertQualityInspectorV466";
import { resetConcertQualityV466 } from "./concertQualityStoreV466";
import type { VisualizerProps } from "./registry";
import { Lyrics3DScene } from "./Lyrics3DScene";
import {planCinematicConcertV497} from "./cinematicConcertChoreographyV497";
import {refineVocalConcertHandoffsV498} from "./vocalHandoffDirectorV498";
import { hasActiveLyricsV350 } from "@/services/stageContent/lyricsPhotoChoreographyV350";
import { SMART_STAGE_EVENT_V351, readSmartStageV351, decideSmartStageV351 } from "@/services/stageContent/smartStageCompositionV351";
import { GENRE_VISUAL_EVENT_V352, readGenreVisualV352, decideGenreVisualV352, resolveGenreVisualV352, mergeGenreCompositionV352 } from "@/services/stageContent/genreVisualDirectorV352";
import { VISUAL_FX_EVENT_V353, readVisualFxV353, decideVisualFxV353 } from "@/services/stageContent/visualEffectsStudioV353";
import {planConcertDetailsV555,DEFAULT_CONCERT_DETAILS_V555} from './concertDetailEffectsV555';
import {ConcertDetailStageV555} from './ConcertDetailStageV555';
import { StageVisualEffectsV353 } from "./StageVisualEffectsV353";
import { LongRunStabilityControllerV355 } from "./LongRunStabilityV355";
import { useStabilityCapV355, stabilityEffectFactorV355 } from "@/services/monitoring/performanceStabilityV355";
import { SHOW_TIMELINE_EVENT_V354, readTimelineV354, evaluateTimelineV354 } from "@/services/stageContent/showTimelineV354";
import { AUTONOMOUS_SHOW_EVENT_V356, readAutoShowV356, planAutonomousShowV356 } from "@/services/stageContent/autonomousShowV356";
import { SHOW_QUALITY_EVENT_V357, readShowQualityV357, refineShowQualityV357 } from "@/services/stageContent/showQualityV357";
import { SHOW_LEARNING_EVENT_V358, readShowLearningSettingsV358, readShowLearningHistoryV358, recordShowLearningV358, storeShowLearningHistoryV358, refineLearnedShowV358, type ShowLearningContextV358, type ShowLearningObservationV358 } from "@/services/stageContent/adaptiveShowLearningV358";
import { getRenderMetricsSnapshot } from "./renderDiagnostics";
import { DancePostProcessingV468 } from './DancePostProcessingV468';
import { usePiConcertBudgetV479 } from "./piConcertRuntimeV479";
import { resolvePiConcertEffectsV479 } from "@/services/monitoring/piConcertBudgetV479";
import { ProceduralShaderEnvironmentV468 } from './ProceduralShaderEnvironmentV468';
import { DanceFX } from "./DanceFX";
import { DynamicStage } from "./DynamicStage";
import { SmartStageCameraV236 } from "./SmartStageCameraV236";
import { TRACKING_ROOT_NAME } from "./smartCameraTrackingV297";
import { StageCameraDirectorV289 } from "./StageCameraDirectorV289";
import { AdaptivePerformanceController } from "./adaptivePerformance";
import { RaspberryPiProfileBootstrap } from "./RaspberryPiEdition";
import { Dancer, DuoDirectorTick, FormationDancers, IntelligentChoreographyTickV312, MultiAvatarDirectorTick } from './DanceFormationActorsV492';
import { GroupDancersV326 } from './GroupDancersV326SceneV492';

class SceneErrorBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
function WebGLWatch({ onLost, onRestored, onStable }: {onLost: () => void; onRestored: () => void; onStable: () => void}) {
  const gl = useThree(state => state.gl);
  const stability = useRef({seconds:0,reported:false});
  useFrame((_state,delta)=>{
    if(stability.current.reported||!Number.isFinite(delta)||delta<=0||delta>.20||
       gl.getContext().isContextLost()||
       (typeof document!=='undefined'&&document.hidden))return;
    stability.current.seconds+=delta;
    if(stability.current.seconds>=2.5){stability.current.reported=true;onStable();}
  });
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault();stability.current={seconds:0,reported:false};onLost(); };
    const restored = () => {stability.current={seconds:0,reported:false};onRestored();};
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => { canvas.removeEventListener("webglcontextlost", lost); canvas.removeEventListener("webglcontextrestored", restored); };
  }, [gl, onLost, onRestored]);
  return null;
}
/** Playback time lookup; does not manufacture word timestamps. */
function resolveConcertLineIndexV555(lyrics:import('@/types/music').Lyrics|null|undefined,at:number):number{
  if(!lyrics?.synced||!lyrics.lines.length||!Number.isFinite(at))return -1;
  let lo=0,hi=lyrics.lines.length-1,answer=-1;
  while(lo<=hi){const mid=(lo+hi)>>1;if(lyrics.lines[mid].startMs<=at){answer=mid;lo=mid+1;}else hi=mid-1;}
  return answer;
}
export function ThreeAvatar(props: VisualizerProps) {
  const piConcertBudgetV479=usePiConcertBudgetV479();
  // V466: voluntary, read-only live QA – no extra sampling while closed.
  const [qualityInspectorEnabledV466,setQualityInspectorEnabledV466]=useState(false);
  useEffect(()=>()=>resetConcertQualityV466(),[]);
  useEffect(()=>{resetConcertQualityV466();},[props.track?.id]);
  const [autoScene, setAutoScene] = useState<DuoScene>("solo");
  const [groupSettingsV326,setGroupSettingsV326]=useState(readGroupV326);
  useEffect(()=>{const sync=()=>setGroupSettingsV326(readGroupV326());window.addEventListener(GROUP_EVENT_V326,sync);return()=>window.removeEventListener(GROUP_EVENT_V326,sync);},[]);
  const [multiSettings,setMultiSettings]=useState(readMultiAvatarSettings);
  const [choreography,setChoreography]=useState<MultiAvatarCue | null>(null);
  const [intelligentSettings,setIntelligentSettings]=useState(readChoreographyV312);
  const [intelligentCue,setIntelligentCue]=useState<ChoreographyCueV312|null>(null);
  useEffect(()=>{const sync=()=>setIntelligentSettings(readChoreographyV312());window.addEventListener(CHOREOGRAPHY_V312_EVENT,sync);return()=>window.removeEventListener(CHOREOGRAPHY_V312_EVENT,sync);},[]);
  useEffect(()=>{const cb=()=>setMultiSettings(readMultiAvatarSettings());window.addEventListener(MULTI_AVATAR_EVENT,cb);return()=>window.removeEventListener(MULTI_AVATAR_EVENT,cb);},[]);
  useEffect(()=>setChoreography(null),[props.track?.id,multiSettings.enabled]);
  const [authoredTimeline,setAuthoredTimeline]=useState(readEnsembleTimelineV325);
  useEffect(()=>{const sync=()=>setAuthoredTimeline(readEnsembleTimelineV325());window.addEventListener(ENSEMBLE_TIMELINE_EVENT_V325,sync);return()=>window.removeEventListener(ENSEMBLE_TIMELINE_EVENT_V325,sync);},[]);
  const authoredEnabled=canPlayEnsembleTimelineV325(authoredTimeline,props.track?.id)&&(!authoredTimeline.songSync||Number.isFinite(props.cameraDirectorProgressMs));
  const manualGroupOnV326=canRunGroupV326(groupSettingsV326,props.track?.id)&&(!groupSettingsV326.songSync||Number.isFinite(props.cameraDirectorProgressMs));
  const autoGroupOnV442=!groupSettingsV326.enabled&&!manualGroupOnV326&&!multiSettings.enabled&&!authoredEnabled&&
    !props.duoDirectorEnabled&&!props.reducedMotion&&!!props.autoMultiArtistGroupV442?.enabled&&
    props.autoMultiArtistGroupV442.trackId===props.track?.id&&Number.isFinite(props.cameraDirectorProgressMs);
  const groupOnV326=manualGroupOnV326||autoGroupOnV442;
  const effectiveGroupSettingsV442=autoGroupOnV442?props.autoMultiArtistGroupV442!:groupSettingsV326;
  const [showTimelineV354,setShowTimelineV354]=useState(readTimelineV354);
  useEffect(()=>{const sync=()=>setShowTimelineV354(readTimelineV354());window.addEventListener(SHOW_TIMELINE_EVENT_V354,sync);return()=>window.removeEventListener(SHOW_TIMELINE_EVENT_V354,sync);},[]);
  const [autoShowSettingsV356,setAutoShowSettingsV356]=useState(readAutoShowV356);
  useEffect(()=>{const sync=()=>setAutoShowSettingsV356(readAutoShowV356());window.addEventListener(AUTONOMOUS_SHOW_EVENT_V356,sync);return()=>window.removeEventListener(AUTONOMOUS_SHOW_EVENT_V356,sync);},[]);
  const [showQualitySettingsV357,setShowQualitySettingsV357]=useState(readShowQualityV357);
  useEffect(()=>{const sync=()=>setShowQualitySettingsV357(readShowQualityV357());window.addEventListener(SHOW_QUALITY_EVENT_V357,sync);return()=>window.removeEventListener(SHOW_QUALITY_EVENT_V357,sync);},[]);
  const lyricsActiveV356=props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs);
  // V518: actual main-stage flags, never inferred from Settings preferences.
  useEffect(()=>{
    setPiStudioFeaturesV518({lyrics:lyricsActiveV356,lipSync:props.lipSync?.enabled===true,reactiveLighting:props.stageReactive!==false});
    return ()=>setPiStudioFeaturesV518(null);
  },[lyricsActiveV356,props.lipSync?.enabled,props.stageReactive]);
  const authoredCueV354=evaluateTimelineV354(showTimelineV354,{progressMs:props.cameraDirectorProgressMs,
    trackId:props.track?.id,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    lyricsActive:lyricsActiveV356});
  const autoPlanV356=planAutonomousShowV356({trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,bpm:props.audio.bpm,genre:props.genre,section:props.cameraDirectorSection,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,lyricsActive:lyricsActiveV356,
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:multiSettings.enabled?2:props.duoDirectorEnabled?2:props.showCue?.formationsEnabled?2:1,
    automaticShowEnabled:props.showCue?.enabled===true,authoredTimeline:showTimelineV354},
    {...autoShowSettingsV356,formations:autoShowSettingsV356.formations&&props.showCue?.formationsEnabled===true,
      camera:autoShowSettingsV356.camera&&props.showCue?.cameraEnabled===true,
      lighting:autoShowSettingsV356.lighting&&props.showCue?.lightingEnabled===true,
      effects:autoShowSettingsV356.effects&&props.showCue?.fxEnabled===true});
  // V357 only refines the automatic V356 proposal: manual V354 scores always win.
  // No new clock/renderer. V351 lyrics protection and V355 effect caps remain downstream.
  const qualityResultV357=refineShowQualityV357(autoPlanV356,{
    trackId:props.track?.id,section:props.cameraDirectorSection,
    lyricsActive:lyricsActiveV356,
    mediaCount:props.stageScreenSettingsV330?.enabled
      ?(props.stageLayoutEnabledV333?(props.stageScreensV333??[]).filter(screen=>screen.enabled).length:props.stageScreenV330?1:0):0,
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:multiSettings.enabled?2:props.duoDirectorEnabled?2:props.showCue?.formationsEnabled?2:1,
    reducedMotion:props.reducedMotion,playing:props.isPlaying,manualOverride:authoredCueV354.active,
  },showQualitySettingsV357);
  // V358: opt-in local aggregates; never store track identities, lyrics or frame-by-frame data.
  const [showLearningSettingsV358,setShowLearningSettingsV358]=useState(readShowLearningSettingsV358);
  const [showLearningHistoryV358,setShowLearningHistoryV358]=useState(readShowLearningHistoryV358);
  useEffect(()=>{const sync=()=>{setShowLearningSettingsV358(readShowLearningSettingsV358());setShowLearningHistoryV358(readShowLearningHistoryV358());};
    window.addEventListener(SHOW_LEARNING_EVENT_V358,sync);return()=>window.removeEventListener(SHOW_LEARNING_EVENT_V358,sync);},[]);
  const learningContextV358:ShowLearningContextV358={genre:props.genre,section:props.cameraDirectorSection,
    lyricsActive:lyricsActiveV356,mediaCount:props.stageScreenSettingsV330?.enabled
      ?(props.stageLayoutEnabledV333?(props.stageScreensV333??[]).filter(screen=>screen.enabled).length:props.stageScreenV330?1:0):0,
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:multiSettings.enabled?2:props.duoDirectorEnabled?2:props.showCue?.formationsEnabled?2:1,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,manualOverride:authoredCueV354.active};
  const learnedResultV358=refineLearnedShowV358(qualityResultV357,learningContextV358,showLearningSettingsV358,showLearningHistoryV358);
  // Observe one played phrase at a time. Only commit a result on the next consecutive
  // phrase boundary with fresh renderer FPS/P95; no timers and no writes while rendering.
  const observedPhraseV358=useRef<null|{track:string;index:number;firstMs:number;lastMs:number;
    phraseMs:number;context:ShowLearningContextV358;shot:NonNullable<typeof qualityResultV357.cue.cameraShot>;
    formation:NonNullable<typeof qualityResultV357.cue.danceFormation>;planScore:number}>(null);
  useEffect(()=>{
    const p=autoPlanV356,nowMs=props.cameraDirectorProgressMs,track=props.track?.id;
    const valid=showLearningSettingsV358.enabled&&showLearningSettingsV358.mode!=='off'&&
      qualityResultV357.active&&p.active&&!!track&&typeof nowMs==='number'&&Number.isFinite(nowMs)&&
      learningContextV358.playing&&!learningContextV358.manualOverride&&!learningContextV358.reducedMotion;
    if(!valid||!track||typeof nowMs!=="number"){observedPhraseV358.current=null;return;}
    const moment=learnedResultV358.moments[0]??qualityResultV357.moments[0];
    if(!moment)return;
    const prev=observedPhraseV358.current;
    if(prev&&prev.track===track&&prev.index===p.index){
      if(nowMs>=prev.lastMs&&nowMs<=(p.index+1)*p.phraseMs+200){prev.lastMs=nowMs;}
      else observedPhraseV358.current=null;
      return;
    }
    if(prev&&prev.track===track&&p.index===prev.index+1&&nowMs>=prev.lastMs){
      const metric=getRenderMetricsSnapshot();
      const observedAt=Date.now();
      const observation:ShowLearningObservationV358={context:prev.context,shot:prev.shot,formation:prev.formation,
        fps:metric.fps,p95FrameMs:metric.p95FrameMs??NaN,metricAt:metric.updatedAt,observedAt,
        planScore:prev.planScore,playedMs:prev.lastMs-prev.firstMs,phraseMs:prev.phraseMs,automatic:true};
      const next=recordShowLearningV358(readShowLearningHistoryV358(),observation,showLearningSettingsV358);
      // Reject stale/unavailable measurements: never write if there is no new observation.
      if(next.entries.length!==showLearningHistoryV358.entries.length||
        next.entries.some((e,i)=>e.observations!==showLearningHistoryV358.entries[i]?.observations||e.lastSeen!==showLearningHistoryV358.entries[i]?.lastSeen)){
        storeShowLearningHistoryV358(next,showLearningSettingsV358);
      }
    }
    observedPhraseV358.current={track,index:p.index,firstMs:nowMs,lastMs:nowMs,phraseMs:p.phraseMs,
      context:learningContextV358,shot:moment.shot,formation:moment.formation,planScore:qualityResultV357.after.score};
  });
  const autoCueV357=learnedResultV358.active?learnedResultV358.cue:qualityResultV357.active?qualityResultV357.cue:autoPlanV356.cue;
  // Authored V354 scores win globally. V356/V357 only fill in when no matching score is enabled.
  const timelineCueV354=authoredCueV354.active?authoredCueV354:autoPlanV356.active?autoCueV357:authoredCueV354;
  const manualFormationV354=!!timelineCueV354.danceFormation&&!groupOnV326&&!multiSettings.enabled&&!authoredEnabled&&
    (props.multiAvatarMode??'solo')==='solo'&&!props.duoDirectorEnabled;
  const multiEnabled=multiSettings.enabled;
  // V306 only directs formations when no manual multi-avatar/duo director was chosen.
  const showFormation=props.showCue?.enabled && props.showCue.formationsEnabled && (props.multiAvatarMode??"solo")==="solo" && !multiEnabled && !props.duoDirectorEnabled;
  // V312 directs automatic V306 shows, including preset-enabled legacy Duo Director.
  // Explicit V206/V274 settings and manual duet/mirror/sync scenes remain authoritative.
  const intelligentEnabled = intelligentSettings.enabled && !!props.showCue?.enabled && !!props.showCue.formationsEnabled
    && !multiEnabled && (props.duoDirectorEnabled === true || (props.multiAvatarMode ?? "solo") === "solo");
  const auto = !multiEnabled && !intelligentEnabled && props.duoDirectorEnabled === true;
  const mode = manualFormationV354 ? timelineCueV354.danceFormation! : authoredEnabled ? "sync" : multiEnabled ? (choreography?.scene ?? "sync") : intelligentEnabled ? (intelligentCue?.scene ?? props.showCue!.formation) : auto ? autoScene : showFormation ? props.showCue!.formation : (props.multiAvatarMode ?? "solo");
  const dual = groupOnV326 || mode !== "solo";
  // V351: stage-wide cues are computed once and shared by camera, lighting, lyrics and media.
  const [smartStageSettingsV351,setSmartStageSettingsV351]=useState(readSmartStageV351);
  useEffect(()=>{const sync=()=>setSmartStageSettingsV351(readSmartStageV351());window.addEventListener(SMART_STAGE_EVENT_V351,sync);return()=>window.removeEventListener(SMART_STAGE_EVENT_V351,sync);},[]);
  const visibleMediaCountV351=props.stageScreenSettingsV330?.enabled ?
    (props.stageLayoutEnabledV333 ? (props.stageScreensV333??[]).filter(x=>x.enabled).length : props.stageScreenV330?1:0) : 0;
  const [genreSettingsV352,setGenreSettingsV352]=useState(readGenreVisualV352);
  useEffect(()=>{const sync=()=>setGenreSettingsV352(readGenreVisualV352());window.addEventListener(GENRE_VISUAL_EVENT_V352,sync);return()=>window.removeEventListener(GENRE_VISUAL_EVENT_V352,sync);},[]);
  const lyricsActiveV352=props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs);
  const compositionV351=decideSmartStageV351({
    lyricsActive:lyricsActiveV352,
    lyricsSide:props.lyricsSignalV350?.side??props.lyricsScene?.side??null,
    section:props.cameraDirectorSection,screenCount:visibleMediaCountV351,
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:dual?2:1,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,beatAccent:props.audio?.kickAccentIntensity,
  },smartStageSettingsV351);
  // V497 directs the existing V496 singer cues. Never invent vocal timestamps or re-route
  // an authored camera/light timeline. The actual light timeline is checked by DynamicStage.
  const castCountV497=groupOnV326?effectiveGroupSettingsV442.count:dual?2:1;
  const cinematicPlanV497=planCinematicConcertV497({
    trackId:props.track?.id??"",cueTrackId:props.lipSync?.vocalTimeTrackIdV496??"",
    progressMs:props.lipSync?.progressMs??-1,playing:props.isPlaying,
    reducedMotion:props.reducedMotion,enabled:props.lipSync?.vocalTimeEnabledV496===true,
    castCount:castCountV497,segments:props.lipSync?.vocalTimeSegmentsV496,
    manualVocalPriority:props.lipSync?.manualVocalEnabledV385===true&&
      !!props.lipSync.manualVocalAssignmentsV385?.length,
    manualCameraPriority:authoredEnabled||manualFormationV354||authoredCueV354.active||
      !!timelineCueV354.active||props.showCue?.cameraEnabled===true||
      !!(manualGroupOnV326&&groupSettingsV326.trackId),
    manualLightingPriority:!!timelineCueV354.active&&timelineCueV354.activeLanes.includes("lighting")||
      props.showCue?.lightingEnabled===true,
    cameraEnabled:props.lipSync?.rapDuetCameraV416!==false,
    lightingEnabled:props.stageReactive!==false,lyricsActive:lyricsActiveV352,
  });
  // V498 is a stateless finishing pass. Source of truth remains the V496 timeline;
  // all authored camera, light and vocal priorities were already checked by V497.
  const cinematicCueV497=refineVocalConcertHandoffsV498(cinematicPlanV497,{
    trackId:props.track?.id??"",progressMs:props.lipSync?.progressMs??-1,
    castCount:castCountV497,segments:props.lipSync?.vocalTimeSegmentsV496,
  });
  // V352 drives the same canvas. V351 content protection still caps unsafe effects.
  const genreCueV352=decideGenreVisualV352({
    genre:props.genre,fusion:props.genreFusion,section:props.cameraDirectorSection,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    beatAccent:props.audio?.kickAccentIntensity,lyricsActive:lyricsActiveV352,
    screenCount:visibleMediaCountV351,avatarCount:compositionV351.avatarCount,currentTheme:props.stageTheme??'classic',
  },genreSettingsV352);
  const compositionV352=mergeGenreCompositionV352(compositionV351,genreCueV352);
  // V354 applies only active lanes, without removing V351/V352 content safety caps.
  const compositionV354=timelineCueV354.active && (timelineCueV354.activeLanes.includes('photos')||timelineCueV354.lyricsFocus)
    ? {...compositionV352,photoOpacity:Math.min(compositionV352.photoOpacity,timelineCueV354.photoOpacity),
        fxGain:timelineCueV354.lyricsFocus?Math.min(compositionV352.fxGain,.75):compositionV352.fxGain,
        beamGain:timelineCueV354.lyricsFocus?Math.min(compositionV352.beamGain,.8):compositionV352.beamGain}
    :compositionV352;
  // V497 narrows optional automatic effects when the singer is framed next to lyrics;
  // use existing content protection rather than adding a competing lyrics renderer.
  const compositionV497=cinematicCueV497.active&&cinematicCueV497.lyricsProtected
    ? {...compositionV354,fxGain:Math.min(compositionV354.fxGain,.72),
        beamGain:Math.min(compositionV354.beamGain,.78)}:compositionV354;
  const [visualFxSettingsV353,setVisualFxSettingsV353]=useState(readVisualFxV353);
  useEffect(()=>{const sync=()=>setVisualFxSettingsV353(readVisualFxV353());window.addEventListener(VISUAL_FX_EVENT_V353,sync);return()=>window.removeEventListener(VISUAL_FX_EVENT_V353,sync);},[]);
  const visualFxCueV353=decideVisualFxV353({playing:props.isPlaying,reducedMotion:props.reducedMotion,
    lyricsActive:lyricsActiveV352,beatAccent:props.audio?.kickAccentIntensity,section:props.cameraDirectorSection,
    genre:genreCueV352.genre??resolveGenreVisualV352(props.genre),genreCue:genreCueV352,composition:compositionV354,quality:'high'},visualFxSettingsV353);
  const stabilityCapV355=useStabilityCapV355();
  const stabilityGainV355=stabilityEffectFactorV355(stabilityCapV355);
  const fxScaleV354=timelineCueV354.active&&timelineCueV354.activeLanes.includes('effects')?timelineCueV354.fxGain:1;
  const visualFxCueV354=fxScaleV354===1?visualFxCueV353:{...visualFxCueV353,
    particleCount:Math.floor(visualFxCueV353.particleCount*Math.min(1.8,fxScaleV354)),
    particleOpacity:Math.min(1,visualFxCueV353.particleOpacity*fxScaleV354),
    shaderStrength:Math.min(1,visualFxCueV353.shaderStrength*fxScaleV354),
    glowGain:Math.min(1.8,visualFxCueV353.glowGain*fxScaleV354)};
  // V355 reduces only optional presentation layers; V351/V354 remain authoritative.
  const visualFxCueV355=stabilityGainV355===1?visualFxCueV354:{...visualFxCueV354,
    particleCount:Math.floor(visualFxCueV354.particleCount*stabilityGainV355),
    particleOpacity:visualFxCueV354.particleOpacity*stabilityGainV355,
    shaderStrength:visualFxCueV354.shaderStrength*stabilityGainV355,
    glowGain:visualFxCueV354.glowGain*stabilityGainV355};
  // Pass only an optional phrase hint to the existing GLB mixer; no second mixer or timers.
  const dancerPropsV356:VisualizerProps=autoPlanV356.active&&autoShowSettingsV356.motions&&!groupOnV326&&!multiSettings.enabled&&!authoredEnabled&&!props.duoDirectorEnabled
    ? {...props,autonomousShowPhraseV356:{index:autoPlanV356.index,enabled:true}}:props;
  const directedThemeV352=genreCueV352.theme;
  const directedPaletteV352=genreCueV352.palette??props.stagePalette;
  // V395: browser context restoration gets a grace period; repeated renderer errors
  // are retried at most three times. Paused Spotify is *not* a recovery trigger.
  const productionV395=useDisplayProductionV395();
  const recoveryEnabledV395=productionV395.enabled&&productionV395.kiosk;
  const [recoveryV395,setRecoveryV395]=useState(initialRecoveryV395);
  const [graphicsLost, setGraphicsLost] = useState(false);
  const [graphicsFailure, setGraphicsFailure] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const onLost = useCallback(() => {
    resetConcertQualityV466();
    setGraphicsLost(true);
    setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'lost',now:Date.now(),enabled:recoveryEnabledV395}));
    appendProductionEventV395('webgl','Kontext verloren');
  },[recoveryEnabledV395]);
  const onRestored = useCallback(() => {
    appendProductionEventV395('webgl','Kontext durch Browser wiederhergestellt');
    if(!recoveryEnabledV395){setGraphicsLost(false);setRecoveryV395(initialRecoveryV395());return;}
    setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'restored',now:Date.now(),enabled:true}));
  },[recoveryEnabledV395]);
  const onFailure = useCallback(() => {
    resetConcertQualityV466();
    setGraphicsFailure(true);
    setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'error',now:Date.now(),enabled:recoveryEnabledV395}));
    appendProductionEventV395('renderer','3D-Szene konnte nicht gezeichnet werden');
  },[recoveryEnabledV395]);
  const onStableV395=useCallback(() => {
    setGraphicsLost(false);
    setGraphicsFailure(false);
    setRecoveryV395(previous=>previous.phase==='ready'?previous:advanceRecoveryV395(previous,{type:'healthy',now:Date.now(),enabled:recoveryEnabledV395}));
  },[recoveryEnabledV395]);
  const manualRetryV395=useCallback(()=>{
    appendProductionEventV395('retry','Manueller 3D-Neustart');
    setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'manual',now:Date.now(),enabled:true}));
  },[]);
  useEffect(()=>{
    setProductionRecoveryStateV395(recoveryV395.phase,recoveryV395.cause,recoveryV395.attempts);
  },[recoveryV395.phase,recoveryV395.cause,recoveryV395.attempts]);
  useEffect(()=>{
    // Only wall-clock supervision of a *known* context/renderer fault.
    // Stale FPS, track changes, slow music and a paused stage never trigger remounts.
    if(recoveryV395.phase!=='lost'&&recoveryV395.phase!=='waiting'&&recoveryV395.phase!=='ready')return;
    const tick=()=>setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'tick',now:Date.now(),enabled:recoveryEnabledV395,visible:!document.hidden}));
    const timer=window.setInterval(tick,recoveryV395.phase==='ready'?10000:500);
    return()=>window.clearInterval(timer);
  },[recoveryV395.phase,recoveryEnabledV395]);
  const lastRestartV395=useRef(-1);
  useEffect(()=>{
    if(recoveryV395.phase!=='restarting')return;
    // React Strict Mode and repeated renders may not remount the Canvas twice.
    if(lastRestartV395.current===recoveryV395.attempts)return;
    lastRestartV395.current=recoveryV395.attempts;
    appendProductionEventV395('retry',`3D-Neustart ${recoveryV395.attempts}/3`);
    setGraphicsLost(false);setGraphicsFailure(false);setRetryKey(key=>key+1);
  },[recoveryV395.phase,recoveryV395.attempts]);
  useEffect(()=>{
    if(recoveryV395.phase==='ready')lastRestartV395.current=-1;
  },[recoveryV395.phase]);
  const piConcertEffectsV479=resolvePiConcertEffectsV479(piConcertBudgetV479,{
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1,
    manualFx:props.danceFxEnabled===true,
    manualPostProcess:props.dancePostEnabledV468===true,
    manualShader:props.shaderEnvironmentV468!==undefined&&props.shaderEnvironmentV468!=='auto',
  });
  const concertDetailCueV557=planConcertDetailsV555({
    lyrics:props.lipSync?.lyrics??props.lyricsScene?.lyrics,
    progressMs:props.cameraDirectorProgressMs??props.lipSync?.progressMs??0,
    activeIndex:props.lyricsScene?.activeIndex??resolveConcertLineIndexV555(props.lipSync?.lyrics,props.lipSync?.progressMs??0),
    section:props.cameraDirectorSection,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    count:groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1,
    scene:props.lipSync?.cinematicSceneV528,settings:props.concertDetailsV555,
  });
  return <div className="visualizer-stage three-avatar-stage" role="group" aria-label={groupOnV326 ? `${effectiveGroupSettingsV442.count} music-reactive 3D avatars` : dual ? "Two music-reactive 3D avatars" : "3D music-reactive avatar"}>
    <RaspberryPiProfileBootstrap />
    <LongRunStabilityControllerV355 graphicsReady={!graphicsLost&&!graphicsFailure} />
    {(graphicsLost || graphicsFailure) && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white gap-2 p-6 text-center">
      <strong>2D-Modus · Sonic Display</strong><span>{graphicsLost ? "WebGL-Kontext vorübergehend verloren – Wiederherstellung läuft." : "3D-Darstellung nicht verfügbar."}</span>
      {(recoveryV395.phase==='lost'||recoveryV395.phase==='waiting')&&recoveryEnabledV395&&<span>Automatische Wiederherstellung begrenzt auf drei Versuche.</span>}
      {(recoveryV395.phase==='manual'||!recoveryEnabledV395)&&<span>Automatischer Neustart nicht aktiv oder Versuche ausgeschöpft.</span>}
      <button type="button" onClick={manualRetryV395} className="rounded border px-3 py-1">3D erneut versuchen</button>
    </div>}
    {!graphicsFailure && <SceneErrorBoundary key={retryKey} onFailure={onFailure}><Canvas camera={{ position: [0, 0.1, groupOnV326 ? 8.8 : dual || auto ? 5.9 : 4.2], fov: 38 }} dpr={[1, 1.5]} shadows={false} gl={{ powerPreference: "high-performance" }}>
      <WebGLWatch onLost={onLost} onRestored={onRestored} onStable={onStableV395} />
      <LiveStageCanvasBridgeV301 />
      <LiveStageCanvasProbeV592 />
      {qualityInspectorEnabledV466&&<ConcertQualityProbeV466 enabled />}
      {!groupOnV326 && auto && <DuoDirectorTick props={props} onScene={setAutoScene} />}
      {!groupOnV326 && multiEnabled && <MultiAvatarDirectorTick props={props} settings={multiSettings} onCue={setChoreography} />}
      {!groupOnV326 && intelligentEnabled && <IntelligentChoreographyTickV312 props={props} settings={intelligentSettings} onCue={setIntelligentCue} />}
      <AdaptivePerformanceController avatarCount={groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1} playing={props.isPlaying}/>{props.cameraDirectorEnabled || props.lipSync?.concertCameraArmedV454===true || props.lipSync?.cinematicSceneV528?.active===true || props.lipSync?.rapCameraArmedV429===true || (props.lipSync?.vocalCameraModeV401!=="off" && props.lipSync?.vocalCameraModeV401!==undefined) || props.lipSync?.visualDirectorModeV397!=="off" && props.lipSync?.visualDirectorModeV397!==undefined || (props.lipSync?.cinematicLyricsModeV378!=="off" && props.lipSync?.cinematicLyricsSideV378 && props.lipSync?.cinematicLyricsVisibleV378 || (props.lipSync?.cinematicDuetCameraModeV377!=="off" && props.lipSync?.cinematicDuetCameraModeV377!==undefined && props.lipSync?.duetModeV376!=="off" && dual || props.lipSync?.manualVocalEnabledV385===true && props.lipSync.manualVocalCameraV385!==false && (dual||groupOnV326) || props.lipSync?.vocalTimeEnabledV496===true && props.lipSync.vocalTimeSegmentsV496?.length && props.lipSync.rapDuetCameraV416!==false && (dual||groupOnV326) || props.lipSync?.rapDuetEnabledV416===true && props.lipSync.rapDuetCameraV416!==false && (dual||groupOnV326) || props.lipSync?.concertModeV386!=="off" && props.lipSync?.concertModeV386!==undefined && props.lipSync?.concertCameraV386!==false && (dual||groupOnV326) || props.concertShowCueV387?.active && props.concertShowCameraV387!==false || props.festivalShowCueV394?.active && props.festivalShowCameraV394!==false)) ? <StageCameraDirectorV289 section={props.cameraDirectorSection ?? "verse"} progressMs={props.cameraDirectorProgressMs ?? 0} intensity={props.cameraDirectorIntensity ?? 55} playing={props.isPlaying} reducedMotion={props.reducedMotion} duo={dual || auto || !!showFormation || intelligentEnabled} showCue={props.showCue} concertShowCueV387={props.concertShowCueV387} festivalShowCueV394={props.festivalShowCueV394} festivalShowCameraV394={props.festivalShowCameraV394}
      concertShowCameraV387={props.concertShowCameraV387} cinematicCueV497={cinematicCueV497} cameraNarrativeV605={props.cameraNarrativeV605} composition={compositionV497} genreCue={genreCueV352} timelineCue={timelineCueV354} lipSync={props.lipSync?{...props.lipSync,cameraCastCountV377:groupOnV326?effectiveGroupSettingsV442.count:dual?2:1,cameraManualStagePriorityV377:authoredEnabled||manualFormationV354||authoredCueV354.active||props.showCue?.formationsEnabled===true||manualGroupOnV326&&!!groupSettingsV326.trackId||canPlayEnsembleTimelineV325(readEnsembleTimelineV325(),props.track?.id)}:undefined} genre={props.genre} /> : <SmartStageCameraV236 audio={props.audio} genre={props.genre} playing={props.isPlaying} reducedMotion={props.reducedMotion} duo={dual || auto} composition={compositionV497} genreCue={genreCueV352} timelineCue={timelineCueV354} lipSync={props.lipSync} />}<DynamicStage lyricsProtectedV542={lyricsActiveV356} vocalFocusV542={Boolean(props.lipSync?.playing&&props.lipSync?.enabled)} groupCountV542={groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1} musicPalette={directedPaletteV352} theme={directedThemeV352} genre={props.genre} audio={props.audio} showCue={props.showCue} isPlaying={props.isPlaying} reducedMotion={props.reducedMotion} reactive={props.stageReactive ?? true} strength={props.stageLightStrength ?? 60} cinematicCueV497={cinematicCueV497} cameraNarrativeV605={props.cameraNarrativeV605} cameraSectionV608={props.cameraDirectorSection} composition={compositionV497} glowGainV353={visualFxCueV355.glowGain} timelineGainV354={timelineCueV354.active&&timelineCueV354.activeLanes.includes("lighting")?timelineCueV354.lightGain:1}
       performerLightingV557={{settings:props.concertDetailsV555??{...DEFAULT_CONCERT_DETAILS_V555},cue:concertDetailCueV557,scene:props.lipSync?.cinematicSceneV528,progressMs:props.cameraDirectorProgressMs??props.lipSync?.progressMs??0}}
       concertShowCueV387={props.concertShowCueV387} festivalShowCueV394={props.festivalShowCueV394} festivalShowLightingV394={props.festivalShowLightingV394} festivalShowAtmosphereV394={props.festivalShowAtmosphereV394} festivalShowLasersV394={props.festivalShowLasersV394} concertShowLightingV387={props.concertShowLightingV387}
       concertShowAtmosphereV387={props.concertShowAtmosphereV387} concertLipSyncV386={props.lipSync?{...props.lipSync,cameraCastCountV377:groupOnV326?effectiveGroupSettingsV442.count:dual?2:1,
         cameraManualStagePriorityV377:authoredEnabled||manualFormationV354||authoredCueV354.active||props.showCue?.formationsEnabled===true||manualGroupOnV326&&!!groupSettingsV326.trackId||canPlayEnsembleTimelineV325(readEnsembleTimelineV325(),props.track?.id)}:undefined} />
      <Suspense fallback={null}><ConcertDetailStageV555 settings={props.concertDetailsV555??{...DEFAULT_CONCERT_DETAILS_V555}}
        cue={concertDetailCueV557}
        avatarCount={groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1}
        playing={props.isPlaying} reducedMotion={props.reducedMotion}
        section={props.cameraDirectorSection} manualLighting={authoredEnabled||authoredCueV354.active}
        reactive={props.stageReactive!==false} lyricsProtected={lyricsActiveV356} genre={props.genre}
        cameraNarrativeV605={props.cameraNarrativeV605} vocalFocusV621={Boolean(props.lipSync?.playing&&props.lipSync?.enabled)}
        energyV621={props.audio?.energyEnvelope??props.audio?.bass??0} kickV621={props.audio?.kickAccentIntensity??0}/></Suspense>
      <StageVisualEffectsV353 cue={visualFxCueV355}/>
      {props.stageScreenSettingsV330?.enabled && props.stageLayoutEnabledV333 && <StageContentScreensV333 screens={props.stageScreensV333??[]} slides={props.stageSlidesV333??[]} push={props.stageLivePushV333??null} index={props.stageRotationIndexV333??0} settings={props.stageScreenSettingsV330} playing={props.isPlaying} reducedMotion={props.reducedMotion} albumCoverUrl={props.track?.albumCoverUrl??null} section={props.cameraDirectorSection??"verse"} beatAccent={props.audio?.kickAccentIntensity??0} genre={props.genre??undefined} lyricsActive={props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs)} lyricsSide={props.lyricsSignalV350?.side??props.lyricsScene?.side??null} composition={compositionV354} genreCue={genreCueV352} fxCue={visualFxCueV355}/>}
      {props.stageScreenSettingsV330?.enabled && !props.stageLayoutEnabledV333 && <StageContentScreenV330 content={props.stageScreenV330??null} settings={props.stageScreenSettingsV330} playing={props.isPlaying} reducedMotion={props.reducedMotion} albumCoverUrl={props.track?.albumCoverUrl??null} section={props.cameraDirectorSection??"verse"} beatAccent={props.audio?.kickAccentIntensity??0} genre={props.genre??undefined} lyricsActive={props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs)} lyricsSide={props.lyricsSignalV350?.side??props.lyricsScene?.side??null} composition={compositionV354} genreCue={genreCueV352} fxCue={visualFxCueV355}/>}
      <ProceduralShaderEnvironmentV468 mode={piConcertEffectsV479.automaticShader?props.shaderEnvironmentV468??'auto':'off'} theme={directedThemeV352} audio={props.audio} playing={props.isPlaying} reducedMotion={props.reducedMotion} color={directedPaletteV352?.primary}/>
      <StageEnvironment theme={directedThemeV352} audio={props.audio} isPlaying={props.isPlaying} reducedMotion={props.reducedMotion} reactive={props.stageReactive ?? true} />
      <DancePostProcessingV468 audio={props.audio} playing={props.isPlaying} reducedMotion={props.reducedMotion}
        enabled={(props.dancePostEnabledV468??true) && piConcertEffectsV479.automaticPostProcess && Boolean(props.danceFxEnabled || props.showCue?.fxEnabled) && compositionV354.fxGain>0.15 && stabilityGainV355>.35}
        strength={(props.danceFxStrength??60)*compositionV354.fxGain*stabilityGainV355}
        drop={props.cameraDirectorSection==='drop' || props.showCue?.section==='drop'}/>
      <DanceFX audio={props.audio} isPlaying={props.isPlaying} reducedMotion={props.reducedMotion} settings={{ tint:visualFxCueV355.active?visualFxCueV355.color:undefined, enabled: props.danceFxEnabled || (piConcertEffectsV479.automaticFx && props.showCue?.fxEnabled), strength: (props.showCue?.fxEnabled ? Math.max(props.danceFxEnabled ? (props.danceFxStrength ?? 0) : 0,Math.round(props.showCue.fxGain*85)) : (props.danceFxStrength ?? 0)) * compositionV354.fxGain * fxScaleV354 * stabilityGainV355, shockwaves: props.danceFxShockwaves || (props.showCue?.fxGain ?? 0) > .7, footprints: props.danceFxFootprints, trails: props.danceFxTrails }} />
      {props.lyricsScene && <Suspense fallback={null}><Lyrics3DScene scene={props.lyricsScene} audio={props.audio} reducedMotion={props.reducedMotion} composition={compositionV497} /></Suspense>}
      <group name={TRACKING_ROOT_NAME}>{groupOnV326 ? <GroupDancersV326 props={autoGroupOnV442?dancerPropsV356:{...dancerPropsV356,multiArtistMotionsV442:undefined}} settings={effectiveGroupSettingsV442}/> : (dual || auto || multiEnabled || showFormation) ? <FormationDancers props={dancerPropsV356} mode={mode} choreography={authoredEnabled ? null : multiEnabled ? choreography : intelligentEnabled ? intelligentCue : null} /> : <group><Dancer props={dancerPropsV356}/><ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={0} reducedMotion={props.reducedMotion}/></group>}</group>
    </Canvas></SceneErrorBoundary>}
    <ConcertQualityInspectorV466 enabled={qualityInspectorEnabledV466} onToggle={()=>{
      if(qualityInspectorEnabledV466)resetConcertQualityV466();
      setQualityInspectorEnabledV466(value=>!value);
    }}/>
  </div>;
}
