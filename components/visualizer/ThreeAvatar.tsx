"use client";
import {currentSyncedLedLyricV1083} from '@/lib/arena360LedWallExperienceV1083';
import {LiveStageCanvasProbeV592} from "./LiveStageCanvasProbeV592";
import {LiveGpuMemoryProbeV767} from "./LiveGpuMemoryProbeV767";
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
import {V751_OPEN_RENDER_QA_EVENT} from "./concertDashboardStoreV751";
import { resetConcertQualityV466 } from "./concertQualityStoreV466";
import type { VisualizerProps } from "./registry";
import { Lyrics3DScene } from "./Lyrics3DScene";
import {planCinematicConcertV497} from "./cinematicConcertChoreographyV497";
import {planMultiVocalSpotlightV797} from "./multiVocalSpotlightDirectorV797";
import {planIntelligentVocalDuetV838,refineVocalSpotlightV838} from "./intelligentVocalDuetDirectorV838";
import {refineVocalConcertHandoffsV498} from "./vocalHandoffDirectorV498";
import { hasActiveLyricsV350 } from "@/services/stageContent/lyricsPhotoChoreographyV350";
import { SMART_STAGE_EVENT_V351, readSmartStageV351, decideSmartStageV351 } from "@/services/stageContent/smartStageCompositionV351";
import { GENRE_VISUAL_EVENT_V352, readGenreVisualV352, decideGenreVisualV352, resolveGenreVisualV352, mergeGenreCompositionV352 } from "@/services/stageContent/genreVisualDirectorV352";
import { VISUAL_FX_EVENT_V353, readVisualFxV353, decideVisualFxV353 } from "@/services/stageContent/visualEffectsStudioV353";
import {planConcertDetailsV555,DEFAULT_CONCERT_DETAILS_V555} from './concertDetailEffectsV555';
import {ConcertDetailStageV555} from './ConcertDetailStageV555';
import { StageVisualEffectsV353 } from "./StageVisualEffectsV353";
import {ConcertFestivalFxV958} from "./ConcertFestivalFxV958";
import {previousVerifiedConcertSceneV960,applyConcertContinuityV960} from "@/lib/concertContinuityV960";
import {applyIntelligentConcertTransitionV976} from "@/lib/intelligentConcertTransitionsV976";
import { LongRunStabilityControllerV355 } from "./LongRunStabilityV355";
import { useStabilityCapV355, stabilityEffectFactorV355 } from "@/services/monitoring/performanceStabilityV355";
import {autoLoadConcertSongV764} from "@/services/stageContent/concertTimelineAutomationV764";
import { SHOW_TIMELINE_EVENT_V354, readTimelineV354, evaluateTimelineV354 } from "@/services/stageContent/showTimelineV354";
import {GOVEE_STAGE_CUE_EVENT_V921,makeGoveeStageCueV921,type GoveeStageSourceV921} from "@/lib/goveeConcertSyncV921";
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318,type TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import {resolveGoveePhaseV911} from '@/lib/goveeConcertDirectorV911';
import {loadConcertRoadmapV958,composeConcertSceneV958,overlayConcertStageV958,
 CONCERT_ROADMAP_EVENT_V958,CONCERT_ROADMAP_KEY_V958,type ConcertPhaseV958} from '@/lib/ultimateConcertRoadmapV958';
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
import { AdaptivePerformanceController,getActivePerformanceTier } from "./adaptivePerformance";
import {planIntelligentConcertTransitionV849} from "./intelligentConcertTransitionsV849";
import { RaspberryPiProfileBootstrap } from "./RaspberryPiEdition";
import {readFootLockV322} from "./intelligentFootLockV322";
import {planEnsembleChoreographyV1063} from '@/lib/arena360EnsembleChoreographyV1063';
import {planStageMovementV1064} from '@/lib/arena360StageMovementV1064';
import {planPerformanceDirectorV1065} from '@/lib/arena360PerformanceDirectorV1065';
import {planUltimateConcertFinaleV1070} from '@/lib/arena360UltimateFinaleV1070';
import {planSmartConcertFlowV1071} from '@/lib/arena360SmartConcertFlowV1071';
import {planConcertCameraDirectorV1072} from '@/lib/arena360ConcertCameraDirectorV1072';
import {planAvatarAudienceInteractionV1074} from '@/lib/arena360AvatarAudienceInteractionV1074';
import {planLiveArtistInteractionV1079} from '@/lib/arena360LiveArtistInteractionV1079';
import { Dancer, DuoDirectorTick, FormationDancers, IntelligentChoreographyTickV312, MultiAvatarDirectorTick } from './DanceFormationActorsV492';
import {planArenaCinematicFinaleV1046} from '@/lib/arena360CinematicFinaleV1046';
import {planArenaImmersiveCameraV1047} from '@/lib/arena360ImmersiveArenaV1047';
import {sampleArenaShowPlanV1040} from '@/lib/arena360ShowDesignerV1040';
import {directArenaShowV1048} from '@/lib/arena360ConcertDirectorV1048';
import {directLiveConcertV1049} from '@/lib/arena360LiveConcertIntelligenceV1049';
import {directAdaptiveStoryV1050} from '@/lib/arena360AdaptiveStorytellingV1050';
import {directUltimateConcertV1052} from '@/lib/arena360UltimateConcertV1052';
import {planStageInteractionV1055} from '@/lib/arena360StageInteractionV1055';
import {planArenaShowCameraV1043} from "@/lib/arena360ShowCameraV1043";
import {planArenaCinematicCameraV1053} from '@/lib/arena360CinematicCameraV1053';
import {planArenaChoreographyV1041} from '@/lib/arena360ChoreographyV1041';
import {planAvatarPerformanceV1054} from '@/lib/arena360AvatarPerformanceV1054';
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
  // V958 shares verified V318 song markers with the Govee loop, read-only.
  // No independent soundtrack clock, network polling or interval.
  const [concertSettingsV958,setConcertSettingsV958]=useState(loadConcertRoadmapV958);
  const [concertAnalysisV958,setConcertAnalysisV958]=useState<TrackAnalysisV318|null>(null);
  useEffect(()=>{
    const refresh=()=>setConcertSettingsV958(loadConcertRoadmapV958());
    const storage=(event:StorageEvent)=>{if(!event.key||event.key===CONCERT_ROADMAP_KEY_V958)refresh();};
    window.addEventListener(CONCERT_ROADMAP_EVENT_V958,refresh);window.addEventListener('storage',storage);
    return()=>{window.removeEventListener(CONCERT_ROADMAP_EVENT_V958,refresh);window.removeEventListener('storage',storage);};
  },[]);
  useEffect(()=>{
    const refresh=()=>setConcertAnalysisV958(readTrackAnalysisV318(props.track?.id??''));
    const storage=(event:StorageEvent)=>{if(!event.key||event.key===ANALYSIS_STORAGE_KEY_V318)refresh();};
    refresh();window.addEventListener(ANALYSIS_EVENT_V318,refresh);window.addEventListener('storage',storage);
    return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,refresh);window.removeEventListener('storage',storage);};
  },[props.track?.id]);
  // V466: voluntary, read-only live QA – no extra sampling while closed.
  const [qualityInspectorEnabledV466,setQualityInspectorEnabledV466]=useState(false);
  useEffect(()=>{const enable=()=>setQualityInspectorEnabledV466(true);
    window.addEventListener(V751_OPEN_RENDER_QA_EVENT,enable);
    return()=>window.removeEventListener(V751_OPEN_RENDER_QA_EVENT,enable);
  },[]);
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
  // V764: real track changes only; refresh React state even if the initial mount effect
  // ran before a V354 event listener had subscribed. Never switch on a time tick.
  useEffect(()=>{autoLoadConcertSongV764(props.track?.id);setShowTimelineV354(readTimelineV354());},[props.track?.id]);
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
  const automaticCueV354=authoredCueV354.active?authoredCueV354:autoPlanV356.active?autoCueV357:authoredCueV354;
  const progress958=props.cameraDirectorProgressMs??props.lyricsScene?.progressMs??-1;
  const track958=props.track?.id??'';
  const phase958=resolveGoveePhaseV911(concertAnalysisV958,track958,progress958);
  const marker958=concertAnalysisV958?.trackId===track958?concertAnalysisV958.sections.findIndex(s=>
    s.startMs<=progress958&&progress958<s.startMs+s.durationMs):-1;
  const source958=marker958>=0?concertAnalysisV958?.sections[marker958]:undefined;
  const scene958=concertSettingsV958.enabled&&props.isPlaying&&phase958.verified&&source958
   ?composeConcertSceneV958({trackId:track958,progressMs:progress958,
    durationMs:props.track?.durationMs??concertAnalysisV958?.durationMs??0,
    phase:phase958.phase as ConcertPhaseV958,sectionIndex:marker958,sectionStartMs:source958.startMs,
    verified:true,genre:String(props.genre??''),energy:props.audio?.energyEnvelope??0,
    bass:props.audio?.bass??0,lyricsVisible:lyricsActiveV356,reducedMotion:props.reducedMotion},concertSettingsV958)
   :null;
  const previousSceneV960=scene958&&(concertSettingsV958.transitionsV960||concertSettingsV958.intelligentTransitionsV976)?previousVerifiedConcertSceneV960({
    analysis:concertAnalysisV958,trackId:track958,sectionIndex:marker958,
    durationMs:props.track?.durationMs??concertAnalysisV958?.durationMs??0,
    genre:String(props.genre??''),energy:props.audio?.energyEnvelope??0,bass:props.audio?.bass??0,
    lyricsVisible:lyricsActiveV356,reducedMotion:props.reducedMotion,settings:concertSettingsV958}):null;
  const legacyContinuityV960=scene958?applyConcertContinuityV960(scene958,previousSceneV960,
    progress958-(source958?.startMs??progress958),concertSettingsV958,{
    manualStage:authoredCueV354.active||authoredEnabled,
    reducedMotion:props.reducedMotion}).scene:null;
  // V976 hands off only automatic V354 camera cues; the existing camera director
  // handles movement interpolation. Authored camera, group and lyric cues win.
  const continuousSceneV960=applyIntelligentConcertTransitionV976({
    scene:concertSettingsV958.intelligentTransitionsV976?scene958:legacyContinuityV960,
    previous:previousSceneV960,settings:concertSettingsV958,
    elapsedMs:progress958-(source958?.startMs??progress958),
    sectionDurationMs:source958?.durationMs??0,playing:props.isPlaying,
    authoredStage:authoredCueV354.active||authoredEnabled,
    savedShowActive:false,lowPerformance:getActivePerformanceTier()==='low'||
      (piConcertBudgetV479.enabled&&piConcertBudgetV479.level==='eco'),
    reducedMotion:props.reducedMotion,lyricsVisible:lyricsActiveV356}).scene;
  // V354 authored clips always win. Explicit avatar groups and manual duo setups are excluded.
  const timelineCueV354=overlayConcertStageV958(automaticCueV354,continuousSceneV960,{
    enabled:concertSettingsV958.enabled,authored:authoredCueV354.active,
    manualFormation:authoredEnabled||groupOnV326||multiSettings.enabled||props.duoDirectorEnabled===true||
      (props.multiAvatarMode??'solo')!=='solo'||props.showCue?.formationsEnabled===true});
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
  // V1041: the V1040 timeline is only a proposal. An explicit saved duo/group,
  // authored score, active cinematic formation, or user-selected motion wins.
  const authoredShowCueV1040=sampleArenaShowPlanV1040(props.arenaShowPlanV1040,{
    enabled:props.arenaShowDesignerEnabledV1040===true,playing:props.isPlaying,
    reducedMotion:props.reducedMotion,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,observedSection:props.cameraDirectorSection,
  });
  const arrangedShowV1048=directArenaShowV1048({enabled:props.arenaConcertDirectorEnabledV1048===true&&
    props.arenaShowDesignerEnabledV1040===true,stageIsArena:props.stageTheme==='arena360',
    playing:props.isPlaying,reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
    show:authoredShowCueV1040,plan:props.arenaShowPlanV1040,
    trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,strength:props.arenaConcertDirectorStrengthV1048??50,
    performanceTier:getActivePerformanceTier()}).show;
  const storyShowV1050=directAdaptiveStoryV1050({
    enabled:props.arenaStorytellingEnabledV1050===true&&props.arenaShowDesignerEnabledV1040===true,
    stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,
    reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
    plan:props.arenaShowPlanV1040,show:arrangedShowV1048,trackId:props.track?.id,
    progressMs:props.cameraDirectorProgressMs,durationMs:props.track?.durationMs,
    strength:props.arenaStorytellingStrengthV1050??55,performanceTier:getActivePerformanceTier(),
  }).show;
  const composedShowV1049=directLiveConcertV1049({enabled:props.arenaLiveConcertEnabledV1049===true&&
    props.arenaShowDesignerEnabledV1040===true,stageIsArena:props.stageTheme==='arena360',
    playing:props.isPlaying,reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
    show:storyShowV1050,audio:props.audio,microphoneActive:props.microphoneActiveV1049===true,
    strength:props.arenaLiveConcertStrengthV1049??50,performanceTier:getActivePerformanceTier()}).show;
  const ultimateConcertV1052=directUltimateConcertV1052({
    enabled:props.arenaUltimateConcertEnabledV1052===true&&props.arenaShowDesignerEnabledV1040===true,
    stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,
    reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
    plan:props.arenaShowPlanV1040,show:composedShowV1049,trackId:props.track?.id,
    progressMs:props.cameraDirectorProgressMs,durationMs:props.track?.durationMs,
    strength:props.arenaUltimateConcertStrengthV1052??60,performanceTier:getActivePerformanceTier(),
  });
  const showCueV1041=ultimateConcertV1052.show;
  // V1065: one local, conservative director across EXISTING rap, motion and
  // virtual-camera producers. It never owns a new player/camera/animation loop.
  const performanceDirectorV1065=planPerformanceDirectorV1065({
    enabled:props.arenaPerformanceDirectorEnabledV1065===true&&
      props.arenaShowDesignerEnabledV1040===true,
    stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,
    reducedMotion:props.reducedMotion,performanceTier:getActivePerformanceTier(),
    manualCamera:props.cameraNarrativeV605?.manualCamera===true||
      props.lipSync?.cameraManualStagePriorityV377===true||authoredCueV354.active,
    manualDance:authoredEnabled||manualFormationV354||multiSettings.enabled||
      props.avatarMotionMode==='choreography'||props.avatarTimelineEnabled===true||
      !!props.smartDanceOverride,
    manualRap:props.lipSync?.manualVocalEnabledV385===true||
      props.lipSync?.rapSyllableEditsEnabledV420===true,
    rapEvidence:props.lipSync?.enabled===true&&props.lipSync?.playing===true&&
      props.lipSync?.lyrics?.synced===true,
    trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,strength:props.arenaPerformanceDirectorStrengthV1065??55,
    show:authoredShowCueV1040,
  });
  // V1070: SAME normalized finale-score as the stage. Only already-approved
  // camera/choreography strengths are attenuated, never overridden.
  const finaleCastV1070=planUltimateConcertFinaleV1070({
    enabled:props.arenaUltimateFinaleEnabledV1070===true,
    stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,
    reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
    showDesignerEnabled:props.arenaShowDesignerEnabledV1040===true,
    showDirectorEnabled:props.arenaShowDirectorEnabledV1034??true,
    trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,strength:props.arenaUltimateFinaleStrengthV1070??55,
    performanceTier:getActivePerformanceTier(),show:showCueV1041,
    channels:{cast:props.arenaChoreographyEnabledV1041===true&&
      !authoredEnabled&&!manualFormationV354&&props.avatarTimelineEnabled!==true&&
      props.avatarMotionMode!=='choreography'&&!props.smartDanceOverride&&
      (props.arenaChoreographyFormationV1041??'auto')==='auto',
      camera:(props.arenaCameraEnabledV1032??true)&&
      props.arenaShowCameraEnabledV1043===true&&!authoredCueV354.active&&
      props.cameraNarrativeV605?.manualCamera!==true&&
      props.lipSync?.cameraManualStagePriorityV377!==true},
  });
  // V1071 shares one pure song-clock mix with V1031 stage; manual stage
  // camera, choreography, lyric syllables and edited show templates win.
  const smartFlowCastV1071=planSmartConcertFlowV1071({
    enabled:props.arenaSmartConcertFlowEnabledV1071===true,
    stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,
    reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
    showDesignerEnabled:props.arenaShowDesignerEnabledV1040===true,
    showDirectorEnabled:props.arenaShowDirectorEnabledV1034??true,
    trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,strength:props.arenaSmartConcertFlowStrengthV1071??55,
    show:showCueV1041,plan:props.arenaShowPlanV1040,
    performanceTier:getActivePerformanceTier(),
    channels:{cast:props.arenaChoreographyEnabledV1041===true&&
       !authoredEnabled&&!manualFormationV354&&!multiSettings.enabled&&
       props.avatarTimelineEnabled!==true&&props.avatarMotionMode!=='choreography'&&
       !props.smartDanceOverride&&(props.arenaChoreographyFormationV1041??'auto')==='auto',
      camera:props.arenaShowCameraEnabledV1043===true&&
       !authoredCueV354.active&&props.cameraNarrativeV605?.manualCamera!==true&&
       props.lipSync?.cameraManualStagePriorityV377!==true,
      rap:props.arenaRapPerformanceEnabledV1062===true&&
       props.lipSync?.enabled===true&&props.lipSync?.playing===true&&
       props.lipSync?.lyrics?.synced===true&&
       props.lipSync?.manualVocalEnabledV385!==true&&
       props.lipSync?.rapSyllableEditsEnabledV420!==true},
  });
  // V1055 shares this single song-clock stage-zone cue across ALL optional
  // visual systems. Manually authored blocking and protected dancers win.
  const stageInteractionV1055=planStageInteractionV1055({
    enabled:props.arenaStageInteractionEnabledV1055===true&&
      props.arenaShowDesignerEnabledV1040===true&&props.arenaChoreographyEnabledV1041===true,
    stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,
    reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
    manualPriority:authoredEnabled||authoredCueV354.active||manualFormationV354||
      !!groupOnV326||multiEnabled||intelligentEnabled||auto||!!showFormation||
      (props.multiAvatarMode??'solo')!=='solo'||props.avatarMotionMode==='choreography'||
      !!props.smartDanceOverride||props.avatarTimelineEnabled===true||
      props.lipSync?.manualVocalEnabledV385===true,
    plan:props.arenaShowPlanV1040,show:showCueV1041,
    trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,strength:props.arenaStageInteractionStrengthV1055??55,
    performanceTier:getActivePerformanceTier(),
  });
  // V1043: optional show-shot request only. Both existing directors retain camera authority.
  const arenaCameraV1043=planArenaShowCameraV1043({
    enabled:props.arenaShowCameraEnabledV1043===true&&(props.arenaCameraEnabledV1032??true),
    stageIsArena:props.stageTheme==='arena360',show:showCueV1041,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:props.cameraNarrativeV605?.manualCamera===true||
      props.lipSync?.cameraManualStagePriorityV377===true,
    trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    strength:(props.arenaShowCameraStrengthV1043??45)*ultimateConcertV1052.cameraGain*stageInteractionV1055.cameraGain*performanceDirectorV1065.cameraGain*finaleCastV1070.camera*smartFlowCastV1071.camera,
  });
  const arenaImmersiveCameraV1047=planArenaImmersiveCameraV1047({
    enabled:props.arenaImmersiveEnabledV1047===true&&props.arenaShowDesignerEnabledV1040===true,
    stageIsArena:props.stageTheme==='arena360',cameraEnabled:(props.arenaCameraEnabledV1032??true)&&
      props.arenaShowCameraEnabledV1043===true,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:props.cameraNarrativeV605?.manualCamera===true||
      props.lipSync?.cameraManualStagePriorityV377===true,
    show:showCueV1041,trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,strength:(props.arenaImmersiveStrengthV1047??55)*ultimateConcertV1052.cameraGain*stageInteractionV1055.cameraGain*performanceDirectorV1065.cameraGain*finaleCastV1070.camera*smartFlowCastV1071.camera,
    performanceTier:getActivePerformanceTier(),
  });
  // V1053: only word-timed lyrics may suggest a lead-facing CLOSE shot.
 // The actual director still owns all saved/manual/lyrics/duet protections.
 const arenaCameraV1053=planArenaCinematicCameraV1053({
   enabled:props.arenaCinematicCameraEnabledV1053===true&&props.arenaShowDesignerEnabledV1040===true,
   stageIsArena:props.stageTheme==='arena360',cameraEnabled:(props.arenaCameraEnabledV1032??true)&&
     props.arenaShowCameraEnabledV1043===true,playing:props.isPlaying,
   reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
   manualPriority:props.cameraNarrativeV605?.manualCamera===true||
     props.lipSync?.cameraManualStagePriorityV377===true,
   show:showCueV1041,trackId:props.track?.id,
   progressMs:props.cameraDirectorProgressMs,durationMs:props.track?.durationMs,
   strength:(props.arenaCinematicCameraStrengthV1053??50)*ultimateConcertV1052.cameraGain*stageInteractionV1055.cameraGain*performanceDirectorV1065.cameraGain*finaleCastV1070.camera*smartFlowCastV1071.camera,
   performanceTier:getActivePerformanceTier(),
   lyrics:props.lipSync?.enabled&&props.lipSync?.playing?props.lipSync.lyrics:
     props.lyricsScene?.playing?props.lyricsScene.lyrics:null,
   lyricsPlaying:Boolean(props.lipSync?.enabled&&props.lipSync?.playing||props.lyricsScene?.playing),
 });
  // V1072: share one planned, protected camera cue with both existing R3F camera
  // owners. Word-timed lyrics support subtle central framing, not singer identity.
  const concertCameraV1072=planConcertCameraDirectorV1072({
    enabled:props.arenaCameraDirectorEnabledV1072===true,
    stageIsArena:props.stageTheme==='arena360',cameraEnabled:props.arenaCameraEnabledV1032??true,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
    manualPriority:props.cameraNarrativeV605?.manualCamera===true||
      props.lipSync?.cameraManualStagePriorityV377===true||authoredCueV354.active,
    showDesignerEnabled:props.arenaShowDesignerEnabledV1040===true,
    showDirectorEnabled:props.arenaShowDirectorEnabledV1034??true,
    show:showCueV1041,plan:props.arenaShowPlanV1040,
    trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,
    strength:(props.arenaCameraDirectorStrengthV1072??55)*ultimateConcertV1052.cameraGain*
      stageInteractionV1055.cameraGain*performanceDirectorV1065.cameraGain*
      finaleCastV1070.camera*smartFlowCastV1071.camera,
    performanceTier:getActivePerformanceTier(),
    lyrics:props.lipSync?.enabled&&props.lipSync?.playing?props.lipSync.lyrics:
      props.lyricsScene?.playing?props.lyricsScene.lyrics:null,
    lyricsPlaying:Boolean(props.lipSync?.enabled&&props.lipSync?.playing||props.lyricsScene?.playing),
    castCount:groupOnV326?effectiveGroupSettingsV442.count:(auto||multiEnabled||intelligentEnabled||Boolean(showFormation)||manualFormationV354||authoredEnabled||(props.multiAvatarMode??"solo")!=="solo")?2:1,
  });
  const arenaChoreoV1041=planArenaChoreographyV1041({
    enabled:props.arenaChoreographyEnabledV1041===true,show:showCueV1041,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    genre:props.genre,stageIsArena:props.stageTheme==='arena360',
    strength:(props.arenaChoreographyStrengthV1041??60)*ultimateConcertV1052.choreoGain*performanceDirectorV1065.danceGain*finaleCastV1070.cast*smartFlowCastV1071.cast,
    formation:props.arenaChoreographyFormationV1041??'auto',
    performanceTier:getActivePerformanceTier(),
    manualPriority:authoredEnabled||authoredCueV354.active||manualFormationV354||
      !!groupOnV326||multiEnabled||intelligentEnabled||auto||!!showFormation||
      (props.multiAvatarMode??'solo')!=='solo'||
      props.avatarMotionMode==='choreography'||!!props.smartDanceOverride||
      props.avatarTimelineEnabled===true||props.lipSync?.manualVocalEnabledV385===true,
  });
  // The same opt-in finale accents the EXISTING V1041 choreography, not the cast.
  // Its manual/duo/GLB priorities and balanced/high-tier gates stay unchanged.
  const castFinaleV1046=planArenaCinematicFinaleV1046({
    enabled:props.arenaFinaleEnabledV1046===true&&props.arenaChoreographyEnabledV1041===true&&
      props.stageTheme==='arena360',playing:props.isPlaying,reducedMotion:props.reducedMotion,
    reactive:props.stageReactive??true,show:showCueV1041,trackId:props.track?.id,
    progressMs:props.cameraDirectorProgressMs,durationMs:props.track?.durationMs,
    strength:props.arenaFinaleStrengthV1046??60,performanceTier:getActivePerformanceTier(),
  });
  const originalChoreoV1041=arenaChoreoV1041.active ? arenaChoreoV1041 : null;
  const coordinatedChoreoV1046=originalChoreoV1041&&castFinaleV1046.active&&
    castFinaleV1046.choreoAccent>0?{
      ...arenaChoreoV1041,scene:'sync' as const,partnerDelayBeats:0,
      leadGain:Math.min(1.18,arenaChoreoV1041.leadGain+castFinaleV1046.choreoAccent),
      partnerGain:Math.min(1.18,arenaChoreoV1041.partnerGain+castFinaleV1046.choreoAccent),
    }:arenaChoreoV1041;
  // V1054 adds gentle, song-clock-based accents to the ONE existing V1041 cue.
  // Vocal role, authored formations, motion clips, collision and IK retain priority.
  const avatarPerformanceV1054=planAvatarPerformanceV1054({
    enabled:props.arenaAvatarPerformanceEnabledV1054===true&&
      props.arenaChoreographyEnabledV1041===true&&props.arenaShowDesignerEnabledV1040===true,
    stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,
    reducedMotion:props.reducedMotion,reactive:props.stageReactive??true,
    manualPriority:!arenaChoreoV1041.active,
    base:coordinatedChoreoV1046,show:showCueV1041,trackId:props.track?.id,
    progressMs:props.cameraDirectorProgressMs,durationMs:props.track?.durationMs,
    genre:props.genre,strength:(props.arenaAvatarPerformanceStrengthV1054??55)*performanceDirectorV1065.danceGain,
    performanceTier:getActivePerformanceTier(),
    lyrics:props.lipSync?.enabled&&props.lipSync?.playing?props.lipSync.lyrics:
      props.lyricsScene?.playing?props.lyricsScene.lyrics:null,
    lyricsPlaying:Boolean((props.lipSync?.enabled&&props.lipSync?.playing)||props.lyricsScene?.playing),
  });
  const performanceChoreoV1054=avatarPerformanceV1054.choreography;
  const mode = manualFormationV354 ? timelineCueV354.danceFormation! : authoredEnabled ? "sync" : multiEnabled ? (choreography?.scene ?? "sync") : intelligentEnabled ? (intelligentCue?.scene ?? props.showCue!.formation) : auto ? autoScene : showFormation ? props.showCue!.formation : arenaChoreoV1041.active ? performanceChoreoV1054.scene : (props.multiAvatarMode ?? "solo");
  // V921 publishes the EXISTING stage's show decision, never a second camera/
  // choreographer plan. Live Govee listeners require fresh matching-track events.
  // A single 1.4s heartbeat keeps a static (non-changing) camera cue fresh.
  const sharedStageCueV921=useRef({trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,lyricsVisible:lyricsActiveV356,
    source:(authoredCueV354.active?'authored':autoPlanV356.active||Boolean(scene958)?'automatic':'none') as GoveeStageSourceV921,
    cue:timelineCueV354,danceFormation:String(mode)});
  sharedStageCueV921.current={trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,lyricsVisible:lyricsActiveV356,
    source:authoredCueV354.active?'authored':autoPlanV356.active||Boolean(scene958)?'automatic':'none',
    cue:timelineCueV354,danceFormation:String(mode)};
  useEffect(()=>{
    const publish=()=>{
      const live=sharedStageCueV921.current;
      window.dispatchEvent(new CustomEvent(GOVEE_STAGE_CUE_EVENT_V921,{detail:makeGoveeStageCueV921({...live,capturedAt:Date.now()})}));
    };
    publish();const id=window.setInterval(publish,1400);
    return()=>{window.clearInterval(id);
      const live=sharedStageCueV921.current;
      window.dispatchEvent(new CustomEvent(GOVEE_STAGE_CUE_EVENT_V921,{detail:makeGoveeStageCueV921({...live,playing:false,capturedAt:Date.now()})}));
    };
  },[]);
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
  // V797: ONE verified singer spotlight plan shared by existing R3F camera and
  // stage lights. V528 already validated V385/V416/V496 editorial evidence.
  const vocalSpotlightV797=planMultiVocalSpotlightV797({
    scene:props.lipSync?.cinematicSceneV528,trackId:props.track?.id??'',
    progressMs:props.lipSync?.progressMs??-1,playing:props.isPlaying,
    enabled:true,count:castCountV497,
    reducedMotion:props.reducedMotion,tier:props.lipSync?.visualDirectorTierV397??'balanced',
    lyricsProtected:lyricsActiveV352,
    manualCamera:authoredEnabled||manualFormationV354||authoredCueV354.active||
      !!timelineCueV354.active||props.showCue?.cameraEnabled===true||
      props.lipSync?.cameraManualStagePriorityV377===true,
    manualLighting:!!timelineCueV354.active&&timelineCueV354.activeLanes.includes('lighting')||
      props.stageReactive===false||props.showCue?.lightingEnabled===true,
  });
  // V838: unified, verified singer handoffs. Never invent a vocal assignment.
  const vocalDuetV838=planIntelligentVocalDuetV838({
    scene:props.lipSync?.cinematicSceneV528,spotlight:vocalSpotlightV797,
    trackId:props.track?.id??'',progressMs:props.lipSync?.progressMs??-1,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    tier:props.lipSync?.visualDirectorTierV397??'balanced',
    manualVocal:props.lipSync?.manualVocalEnabledV385===true&&
      Boolean(props.lipSync.manualVocalAssignmentsV385?.length),
  });
  const directedSpotlightV838=refineVocalSpotlightV838(vocalSpotlightV797,vocalDuetV838);
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
  // V1074 shares a single deterministic opt-in cue with the avatar and the
  // already-instanced arena audience. Authored clips and manual vocal cues win.
  const avatarAudienceV1074=planAvatarAudienceInteractionV1074({
    enabled:props.arenaAvatarAudienceEnabledV1074===true,
    stageIsArena:props.stageTheme==='arena360',
    audienceEnabled:props.arenaAudienceEnabledV1032!==false,
    showDesignerEnabled:props.arenaShowDesignerEnabledV1040===true,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    reactive:props.stageReactive,performanceTier:getActivePerformanceTier(),
    manualPriority:authoredEnabled||props.avatarMotionMode==='choreography'||
      props.avatarTimelineEnabled===true||!!props.smartDanceOverride||
      !!props.avatarAnimationUrl||!!props.secondaryAvatarAnimationUrl||
      props.lipSync?.manualVocalEnabledV385===true,
    show:authoredShowCueV1040,trackId:props.track?.id,
    progressMs:props.cameraDirectorProgressMs,durationMs:props.track?.durationMs,
    strength:props.arenaAvatarAudienceStrengthV1074??55,
    observedSection:props.cameraDirectorSection,
  });
  // V1079: only current, time-aligned synced lyric gaps can accent the
  // existing avatar/audience cue. Manual vocal roles and authored clips win.
  const liveArtistV1079=planLiveArtistInteractionV1079({
    enabled:props.arenaLiveArtistEnabledV1079===true,
    playing:props.isPlaying,stageIsArena:props.stageTheme==='arena360',
    audienceEnabled:props.arenaAudienceEnabledV1032!==false,
    showDesignerEnabled:props.arenaShowDesignerEnabledV1040===true,
    reducedMotion:props.reducedMotion,reactive:props.stageReactive,
    performanceTier:getActivePerformanceTier(),
    manualPriority:authoredEnabled||props.avatarMotionMode==='choreography'||
      props.avatarTimelineEnabled===true||!!props.smartDanceOverride||
      !!props.avatarAnimationUrl||!!props.secondaryAvatarAnimationUrl||
      props.lipSync?.manualVocalEnabledV385===true||
      props.lipSync?.rapDuetEnabledV416===true,
    show:authoredShowCueV1040,baseline:avatarAudienceV1074,
    trackId:props.track?.id,durationMs:props.track?.durationMs,
    progressMs:props.cameraDirectorProgressMs,
    lyricsProgressMs:props.lipSync?.progressMs,lyrics:props.lipSync?.lyrics,
    performerCount:castCountV497,strength:props.arenaLiveArtistStrengthV1079??55,
  });
  // Rap/V1062 remains the sole gesture and lip-sync owner. Only its opt-in
  // strength is lowered from the same V1040 cue; manual syllables win earlier.
  const rapFlowGainV1071=smartFlowCastV1071.rap;
  const rapCombinedGainV1071=performanceDirectorV1065.rapGain*rapFlowGainV1071;
  const dancerPropsV1065:VisualizerProps=rapCombinedGainV1071<1
    ?{...dancerPropsV356,arenaRapPerformanceStrengthV1062:
        (props.arenaRapPerformanceStrengthV1062??55)*rapCombinedGainV1071,
        arenaRapGesturesStrengthV1076:
        (props.arenaRapGesturesStrengthV1076??55)*rapCombinedGainV1071}
    :dancerPropsV356;
  const dancerPropsV1074:VisualizerProps=liveArtistV1079.active
    ?{...dancerPropsV1065,arenaAvatarAudienceCueV1074:liveArtistV1079}
    :{...dancerPropsV1065,arenaAvatarAudienceCueV1074:undefined};
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
  // V849: one VERIFIED scene seam shared by the existing camera, lighting and
  // festival FX controllers. No extra clocks, scene objects or re-render loops.
  const coordinatedTransitionV849=planIntelligentConcertTransitionV849({
    seam:props.cinematicTransitionV791,settings:props.concertFxV810,
    trackId:props.track?.id??'',progressMs:props.cameraDirectorProgressMs??-1,
    playing:props.isPlaying,reactive:props.stageReactive!==false,
    reducedMotion:props.reducedMotion,
    manualCamera:authoredEnabled||authoredCueV354.active||
      props.cameraNarrativeV605?.manualCamera===true,
    manualLighting:authoredCueV354.active&&authoredCueV354.activeLanes.includes('lighting')||
      props.showCue?.lightingEnabled===true,
    lyricsProtected:lyricsActiveV356,
    vocalFocus:Boolean(props.lipSync?.playing&&props.lipSync?.enabled),
    castCount:groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1,
    tier:getActivePerformanceTier(),
    section:props.cameraDirectorSection??'verse',budget:1,
  });
  return <div className="visualizer-stage three-avatar-stage" data-v838-mode={vocalDuetV838.mode} data-v797-mode={vocalSpotlightV797.mode} data-v797-lead={vocalSpotlightV797.leadSlot} data-v797-cast={vocalSpotlightV797.activeSlots.join(",")} role="group" aria-label={groupOnV326 ? `${effectiveGroupSettingsV442.count} music-reactive 3D avatars` : dual ? "Two music-reactive 3D avatars" : "3D music-reactive avatar"}>
    <RaspberryPiProfileBootstrap />
    <LongRunStabilityControllerV355 graphicsReady={!graphicsLost&&!graphicsFailure} />
    {(graphicsLost || graphicsFailure) && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white gap-2 p-6 text-center">
      <strong>2D-Modus · Sonic Display</strong><span>{graphicsLost ? "WebGL-Kontext vorübergehend verloren – Wiederherstellung läuft." : "3D-Darstellung nicht verfügbar."}</span>
      {(recoveryV395.phase==='lost'||recoveryV395.phase==='waiting')&&recoveryEnabledV395&&<span>Automatische Wiederherstellung begrenzt auf drei Versuche.</span>}
      {(recoveryV395.phase==='manual'||!recoveryEnabledV395)&&<span>Automatischer Neustart nicht aktiv oder Versuche ausgeschöpft.</span>}
      <button type="button" onClick={manualRetryV395} className="rounded border px-3 py-1">3D erneut versuchen</button>
    </div>}
    {!graphicsFailure && <SceneErrorBoundary key={retryKey} onFailure={onFailure}><Canvas camera={{ position: [0, directedThemeV352 === "arena360" ? 1.35 : 0.1, directedThemeV352 === "arena360" ? (groupOnV326 ? 10.2 : dual || auto ? 8.6 : 7.8) : (groupOnV326 ? 8.8 : dual || auto ? 5.9 : 4.2)], fov: directedThemeV352 === "arena360" ? 45 : 38 }} dpr={[1, 1.5]} shadows={false} gl={{ powerPreference: "high-performance" }}>
      <WebGLWatch onLost={onLost} onRestored={onRestored} onStable={onStableV395} />
      <LiveStageCanvasBridgeV301 />
      <LiveStageCanvasProbeV592 />
      <LiveGpuMemoryProbeV767 />
      {qualityInspectorEnabledV466&&<ConcertQualityProbeV466 enabled />}
      {!groupOnV326 && auto && <DuoDirectorTick props={props} onScene={setAutoScene} />}
      {!groupOnV326 && multiEnabled && <MultiAvatarDirectorTick props={props} settings={multiSettings} onCue={setChoreography} />}
      {!groupOnV326 && intelligentEnabled && <IntelligentChoreographyTickV312 props={props} settings={intelligentSettings} onCue={setIntelligentCue} />}
      <AdaptivePerformanceController avatarCount={groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1} playing={props.isPlaying}/>{props.cameraDirectorEnabled || props.lipSync?.concertCameraArmedV454===true || props.lipSync?.cinematicSceneV528?.active===true || props.lipSync?.rapCameraArmedV429===true || (props.lipSync?.vocalCameraModeV401!=="off" && props.lipSync?.vocalCameraModeV401!==undefined) || props.lipSync?.visualDirectorModeV397!=="off" && props.lipSync?.visualDirectorModeV397!==undefined || (props.lipSync?.cinematicLyricsModeV378!=="off" && props.lipSync?.cinematicLyricsSideV378 && props.lipSync?.cinematicLyricsVisibleV378 || (props.lipSync?.cinematicDuetCameraModeV377!=="off" && props.lipSync?.cinematicDuetCameraModeV377!==undefined && props.lipSync?.duetModeV376!=="off" && dual || props.lipSync?.manualVocalEnabledV385===true && props.lipSync.manualVocalCameraV385!==false && (dual||groupOnV326) || props.lipSync?.vocalTimeEnabledV496===true && props.lipSync.vocalTimeSegmentsV496?.length && props.lipSync.rapDuetCameraV416!==false && (dual||groupOnV326) || props.lipSync?.rapDuetEnabledV416===true && props.lipSync.rapDuetCameraV416!==false && (dual||groupOnV326) || props.lipSync?.concertModeV386!=="off" && props.lipSync?.concertModeV386!==undefined && props.lipSync?.concertCameraV386!==false && (dual||groupOnV326) || props.concertShowCueV387?.active && props.concertShowCameraV387!==false || props.festivalShowCueV394?.active && props.festivalShowCameraV394!==false)) ? <StageCameraDirectorV289 concertCameraCueV1072={concertCameraV1072} arenaCinematicCameraCueV1053={arenaCameraV1053} arenaImmersiveCameraCueV1047={arenaImmersiveCameraV1047} arenaShowCameraCueV1043={arenaCameraV1043} arena360={directedThemeV352 === "arena360"} arenaCameraEnabled={props.arenaCameraEnabledV1032 ?? true} arenaCameraMode={props.arenaCameraModeV1032 ?? "arc"} arenaFlyoverEnabled={props.arenaFlyoverEnabledV1033 ?? true} arenaSectionCameraEnabled={(props.arenaShowDirectorEnabledV1034 ?? true) && (props.arenaSectionCameraEnabledV1034 ?? true)} audio={props.audio} section={props.cameraDirectorSection ?? "verse"} progressMs={props.cameraDirectorProgressMs ?? 0} intensity={props.cameraDirectorIntensity ?? 55} playing={props.isPlaying} reducedMotion={props.reducedMotion} duo={dual || auto || !!showFormation || intelligentEnabled} showCue={props.showCue} concertShowCueV387={props.concertShowCueV387} festivalShowCueV394={props.festivalShowCueV394} festivalShowCameraV394={props.festivalShowCameraV394}
      concertShowCameraV387={props.concertShowCameraV387} cinematicCueV497={cinematicCueV497} cameraNarrativeV605={props.cameraNarrativeV605} concertFlowV654={props.concertFlowV654} transitionV791={coordinatedTransitionV849.seam??undefined} choreographyV792={props.smartCameraChoreographyV792} vocalSpotlightV797={directedSpotlightV838} vocalDuetV838={vocalDuetV838} composition={compositionV497} genreCue={genreCueV352} timelineCue={timelineCueV354} lipSync={props.lipSync?{...props.lipSync,cameraCastCountV377:groupOnV326?effectiveGroupSettingsV442.count:dual?2:1,cameraManualStagePriorityV377:authoredEnabled||manualFormationV354||authoredCueV354.active||props.showCue?.formationsEnabled===true||manualGroupOnV326&&!!groupSettingsV326.trackId||canPlayEnsembleTimelineV325(readEnsembleTimelineV325(),props.track?.id)}:undefined} genre={props.genre} /> : <SmartStageCameraV236 concertCameraCueV1072={concertCameraV1072} arenaCinematicCameraCueV1053={arenaCameraV1053} arenaImmersiveCameraCueV1047={arenaImmersiveCameraV1047} arenaShowCameraCueV1043={arenaCameraV1043} arena360={directedThemeV352 === "arena360"} arenaCameraEnabled={props.arenaCameraEnabledV1032 ?? true} arenaCameraMode={props.arenaCameraModeV1032 ?? "arc"} arenaFlyoverEnabled={props.arenaFlyoverEnabledV1033 ?? true} arenaSectionCameraEnabled={(props.arenaShowDirectorEnabledV1034 ?? true) && (props.arenaSectionCameraEnabledV1034 ?? true)} section={props.cameraDirectorSection ?? "verse"} audio={props.audio} genre={props.genre} playing={props.isPlaying} reducedMotion={props.reducedMotion} duo={dual || auto} composition={compositionV497} genreCue={genreCueV352} timelineCue={timelineCueV354} lipSync={props.lipSync} />}<DynamicStage liveShowV827 stageEvolutionV795={props.stageEvolutionV795} vocalSpotlightV797={directedSpotlightV838} epicPeakV794={props.epicPeakV794} manualLightingV763={authoredCueV354.active&&authoredCueV354.activeLanes.includes("lighting")} transitionV791={coordinatedTransitionV849.seam??undefined} transitionV849={coordinatedTransitionV849} concertFxV810={props.concertFxV810} lyricsV813={props.lyricsScene?.lyrics??props.lipSync?.lyrics} lyricsVisibleV813={Boolean(props.lyricsScene?.lyrics?.synced)} scenicLightingV762={props.scenicLightingV762} cinematicCueV761={props.cinematicCueV761} performanceLightingV749={props.performanceLightingV749} lyricsProtectedV542={lyricsActiveV356} vocalFocusV542={Boolean(props.lipSync?.playing&&props.lipSync?.enabled)} groupCountV542={groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1} musicPalette={directedPaletteV352} theme={directedThemeV352} genre={props.genre} audio={props.audio} showCue={props.showCue} isPlaying={props.isPlaying} reducedMotion={props.reducedMotion} reactive={props.stageReactive ?? true} strength={props.stageLightStrength ?? 60} cinematicCueV497={cinematicCueV497} cameraNarrativeV605={props.cameraNarrativeV605} cameraSectionV608={props.cameraDirectorSection} composition={compositionV497} glowGainV353={visualFxCueV355.glowGain} timelineGainV354={timelineCueV354.active&&timelineCueV354.activeLanes.includes("lighting")?timelineCueV354.lightGain:1}
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
      <ConcertFestivalFxV958 trackId={props.track?.id??''} progressMs={props.cameraDirectorProgressMs??props.lyricsScene?.progressMs??0}
       durationMs={props.track?.durationMs??0} genre={String(props.genre??'')}
       energy={props.audio?.energyEnvelope??0} bass={props.audio?.bass??0}
       playing={props.isPlaying} reducedMotion={props.reducedMotion}
       lyricsVisible={lyricsActiveV356}
       authoredStage={authoredCueV354.active||authoredEnabled||
        props.showCue?.lightingEnabled===false||props.stageReactive===false}
       lowPerformance={piConcertBudgetV479.enabled&&piConcertBudgetV479.level==='eco'}/>
      {props.stageScreenSettingsV330?.enabled && props.stageLayoutEnabledV333 && <StageContentScreensV333 screens={props.stageScreensV333??[]} slides={props.stageSlidesV333??[]} push={props.stageLivePushV333??null} index={props.stageRotationIndexV333??0} settings={props.stageScreenSettingsV330} playing={props.isPlaying} reducedMotion={props.reducedMotion} albumCoverUrl={props.track?.albumCoverUrl??null} section={props.cameraDirectorSection??"verse"} beatAccent={props.audio?.kickAccentIntensity??0} genre={props.genre??undefined} lyricsActive={props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs)} lyricsSide={props.lyricsSignalV350?.side??props.lyricsScene?.side??null} composition={compositionV354} genreCue={genreCueV352} fxCue={visualFxCueV355} lipSyncActive={Boolean(props.lipSync?.playing&&props.lipSync?.enabled)} concertFlowV654={props.concertFlowV654}/>}
      {props.stageScreenSettingsV330?.enabled && !props.stageLayoutEnabledV333 && <StageContentScreenV330 content={props.stageScreenV330??null} settings={props.stageScreenSettingsV330} playing={props.isPlaying} reducedMotion={props.reducedMotion} albumCoverUrl={props.track?.albumCoverUrl??null} section={props.cameraDirectorSection??"verse"} beatAccent={props.audio?.kickAccentIntensity??0} genre={props.genre??undefined} lyricsActive={props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs)} lyricsSide={props.lyricsSignalV350?.side??props.lyricsScene?.side??null} composition={compositionV354} genreCue={genreCueV352} fxCue={visualFxCueV355} lipSyncActive={Boolean(props.lipSync?.playing&&props.lipSync?.enabled)} concertFlowV654={props.concertFlowV654}/>}
      <ProceduralShaderEnvironmentV468 mode={piConcertEffectsV479.automaticShader?props.shaderEnvironmentV468??'auto':'off'} theme={directedThemeV352} audio={props.audio} playing={props.isPlaying} reducedMotion={props.reducedMotion} color={directedPaletteV352?.primary}/>

      <DancePostProcessingV468 audio={props.audio} playing={props.isPlaying} reducedMotion={props.reducedMotion}
        enabled={(props.dancePostEnabledV468??true) && piConcertEffectsV479.automaticPostProcess && Boolean(props.danceFxEnabled || props.showCue?.fxEnabled) && compositionV354.fxGain>0.15 && stabilityGainV355>.35}
        strength={(props.danceFxStrength??60)*compositionV354.fxGain*stabilityGainV355}
        drop={props.cameraDirectorSection==='drop' || props.showCue?.section==='drop'}/>
      <DanceFX audio={props.audio} isPlaying={props.isPlaying} reducedMotion={props.reducedMotion} settings={{ tint:visualFxCueV355.active?visualFxCueV355.color:undefined, enabled: props.danceFxEnabled || (piConcertEffectsV479.automaticFx && props.showCue?.fxEnabled), strength: (props.showCue?.fxEnabled ? Math.max(props.danceFxEnabled ? (props.danceFxStrength ?? 0) : 0,Math.round(props.showCue.fxGain*85)) : (props.danceFxStrength ?? 0)) * compositionV354.fxGain * fxScaleV354 * stabilityGainV355, shockwaves: props.danceFxShockwaves || (props.showCue?.fxGain ?? 0) > .7, footprints: props.danceFxFootprints, trails: props.danceFxTrails }} />
      {props.lyricsScene && <Suspense fallback={null}><Lyrics3DScene scene={props.lyricsScene} audio={props.audio} reducedMotion={props.reducedMotion} composition={compositionV497} /></Suspense>}
      <StageEnvironment theme={directedThemeV352} audio={props.audio} isPlaying={props.isPlaying}
        reducedMotion={props.reducedMotion} reactive={props.stageReactive ?? true}
        rotationSpeed={props.stageRotationSpeedV1031 ?? 90}
        rotationEnabled={props.stageRotationEnabledV1031 ?? true}
        audienceEnabled={props.arenaAudienceEnabledV1032 ?? true}
        lightsEnabled={props.arenaLightsEnabledV1032 ?? true}
        dropEnabled={props.arenaDropEnabledV1032 ?? true}
        wavesEnabled={props.arenaWavesEnabledV1033 ?? true}
        phoneSyncEnabled={props.arenaPhoneSyncEnabledV1033 ?? true}
        phoneMode={props.arenaPhoneModeV1033 ?? "wave"}
        domeEnabled={props.arenaDomeEnabledV1033 ?? true}
        showDirectorEnabled={props.arenaShowDirectorEnabledV1034 ?? true}
        secondLevelEnabled={props.arenaSecondLevelEnabledV1034 ?? true}
        skyFormationEnabled={props.arenaSkyFormationEnabledV1034 ?? true}
        fullSongDirectorEnabled={props.arenaFullSongDirectorEnabledV1035 ?? true}
        ledColumnsEnabled={props.arenaLedColumnsEnabledV1035 ?? true}
        virtualPyroEnabled={props.arenaVirtualPyroEnabledV1035 ?? true}
        crowdChantEnabled={props.arenaCrowdChantEnabledV1035 ?? true}
        showIntensity={props.arenaShowIntensityV1035 ?? 65}
        lasersEnabled={props.arenaLasersEnabledV1036 ?? true}
        movingSkyEnabled={props.arenaMovingSkyEnabledV1036 ?? true}
        groundFogEnabled={props.arenaGroundFogEnabledV1036 ?? true}
        arenaPeaksEnabled={props.arenaPeakDirectorEnabledV1036 ?? true}
        transformingDeckEnabled={props.arenaTransformingDeckEnabledV1037 ?? true}
        transformingDeckMode={props.arenaTransformingDeckModeV1037 ?? 'auto'}
        transformingDeckStrength={props.arenaTransformingDeckStrengthV1037 ?? 70}
        transformingStageEnabledV1066={props.arenaTransformingStageEnabledV1066 ?? false}
        transformingStageStrengthV1066={props.arenaTransformingStageStrengthV1066 ?? 55}
        floatingExperienceEnabledV1067={props.arenaFloatingExperienceEnabledV1067 ?? false}
        floatingExperienceStrengthV1067={props.arenaFloatingExperienceStrengthV1067 ?? 55}
        holographicConcertEnabledV1068={props.arenaHolographicConcertEnabledV1068 ?? false}
        holographicConcertStrengthV1068={props.arenaHolographicConcertStrengthV1068 ?? 55}
        holographicDancersEnabledV1081={props.arenaHolographicDancersEnabledV1081 ?? false}
        holographicDancersStrengthV1081={props.arenaHolographicDancersStrengthV1081 ?? 55}
        dynamicArchitectureEnabledV1082={props.arenaDynamicArchitectureEnabledV1082 ?? false}
        dynamicArchitectureStrengthV1082={props.arenaDynamicArchitectureStrengthV1082 ?? 55}
        epicDropEnabledV1069={props.arenaEpicDropEnabledV1069 ?? false}
        epicDropStrengthV1069={props.arenaEpicDropStrengthV1069 ?? 55}
        ultimateFinaleEnabledV1070={props.arenaUltimateFinaleEnabledV1070 ?? false}
        ultimateFinaleStrengthV1070={props.arenaUltimateFinaleStrengthV1070 ?? 55}
        smartConcertFlowEnabledV1071={props.arenaSmartConcertFlowEnabledV1071 ?? false}
        smartConcertFlowStrengthV1071={props.arenaSmartConcertFlowStrengthV1071 ?? 55}
        floatingStageEnabled={props.arenaFloatingStageEnabledV1038 ?? true}
        floatingStageMode={props.arenaFloatingStageModeV1038 ?? 'auto'}
        floatingStageIntensity={(props.arenaFloatingStageIntensityV1038 ?? 70)*stageInteractionV1055.platformGain}
        hologramsEnabled={props.arenaHologramsEnabledV1039 ?? true}
        laserArchitectureEnabled={props.arenaLaserArchitectureEnabledV1039 ?? true}
        hologramPattern={props.arenaHologramPatternV1039 ?? 'auto'}
        hologramStrength={props.arenaHologramStrengthV1039 ?? 65}
        showDesignerEnabled={props.arenaShowDesignerEnabledV1040 ?? false}
        showPlan={props.arenaShowPlanV1040}
        audienceDirectorEnabled={props.arenaAudienceDirectorEnabledV1044 ?? false}
        audienceDirectorStrength={(props.arenaAudienceDirectorStrengthV1044 ?? 50)*stageInteractionV1055.crowdGain}
        atmosphereDirectorEnabled={props.arenaAtmosphereDirectorEnabledV1045 ?? false}
        atmosphereDirectorStrength={props.arenaAtmosphereDirectorStrengthV1045 ?? 55}
        cinematicFinaleEnabled={props.arenaFinaleEnabledV1046 ?? false}
        cinematicFinaleStrength={props.arenaFinaleStrengthV1046 ?? 60}
        immersiveEnabled={props.arenaImmersiveEnabledV1047 ?? false}
        immersiveStrength={props.arenaImmersiveStrengthV1047 ?? 55}
        concertDirectorEnabled={props.arenaConcertDirectorEnabledV1048 ?? false}
        concertDirectorStrength={props.arenaConcertDirectorStrengthV1048 ?? 50}
        liveConcertEnabledV1049={props.arenaLiveConcertEnabledV1049 ?? false}
        liveConcertStrengthV1049={props.arenaLiveConcertStrengthV1049 ?? 50}
        storytellingEnabledV1050={props.arenaStorytellingEnabledV1050 ?? false}
        storytellingStrengthV1050={props.arenaStorytellingStrengthV1050 ?? 55}
        avatarAudienceCueV1074={liveArtistV1079} audienceExperienceEnabledV1073={props.arenaAudienceExperienceEnabledV1073 ?? false}
        audienceExperienceStrengthV1073={props.arenaAudienceExperienceStrengthV1073 ?? 55} crowdEnergyEnabledV1075={props.arenaCrowdEnergyEnabledV1075 ?? false} crowdEnergyStrengthV1075={props.arenaCrowdEnergyStrengthV1075 ?? 55}
        crowdExperienceEnabledV1051={props.arenaCrowdExperienceEnabledV1051 ?? false}
        crowdExperienceStrengthV1051={(props.arenaCrowdExperienceStrengthV1051 ?? 55)*stageInteractionV1055.crowdGain}
        ultimateConcertEnabledV1052={props.arenaUltimateConcertEnabledV1052 ?? false}
        ultimateConcertStrengthV1052={props.arenaUltimateConcertStrengthV1052 ?? 60}
        cinematicLightingEnabledV1056={props.arenaCinematicLightingEnabledV1056 ?? false}
        cinematicLightingStrengthV1056={props.arenaCinematicLightingStrengthV1056 ?? 55}
        intelligentLaserEnabledV1057={props.arenaIntelligentLaserEnabledV1057 ?? false}
        intelligentLaserStrengthV1057={props.arenaIntelligentLaserStrengthV1057 ?? 55}
        volumetricLightingEnabledV1058={props.arenaVolumetricLightingEnabledV1058 ?? false}
        volumetricLightingStrengthV1058={props.arenaVolumetricLightingStrengthV1058 ?? 55}
        ledWallEnabledV1059={props.arenaLedWallEnabledV1059 ?? false}
        ledWallStrengthV1059={props.arenaLedWallStrengthV1059 ?? 55}
        ledWallPatternV1059={props.arenaLedWallPatternV1059 ?? "auto"}
        advancedLedEnabledV1083={props.arenaAdvancedLedEnabledV1083 ?? false}
        advancedLedStrengthV1083={props.arenaAdvancedLedStrengthV1083 ?? 55}
        advancedLedModeV1083={props.arenaAdvancedLedModeV1083 ?? 'auto'}
        festivalFxEnabledV1084={props.arenaFestivalFxEnabledV1084 ?? false}
        festivalFxStrengthV1084={props.arenaFestivalFxStrengthV1084 ?? 55}
        festivalFxModeV1084={props.arenaFestivalFxModeV1084 ?? 'auto'}
        projectionEnabledV1085={props.arenaProjectionEnabledV1085 ?? false}
        projectionStrengthV1085={props.arenaProjectionStrengthV1085 ?? 55}
        projectionModeV1085={props.arenaProjectionModeV1085 ?? 'auto'}
        epicTransformationEnabledV1086={props.arenaEpicTransformationEnabledV1086 ?? false}
        epicTransformationStrengthV1086={props.arenaEpicTransformationStrengthV1086 ?? 55}
        epicTransformationModeV1086={props.arenaEpicTransformationModeV1086 ?? 'auto'}
        ultimateFestivalDropEnabledV1087={props.arenaUltimateFestivalDropEnabledV1087 ?? false}
        ultimateFestivalDropStrengthV1087={props.arenaUltimateFestivalDropStrengthV1087 ?? 55}
        beatIntelligenceEnabledV1089={props.arenaBeatIntelligenceEnabledV1089 ?? false}
        beatIntelligencePrecisionV1089={props.arenaBeatIntelligencePrecisionV1089 ?? 'balanced'}
        musicalDynamicsEnabledV1090={props.arenaMusicalDynamicsEnabledV1090 ?? false}
        musicalDynamicsStrengthV1090={props.arenaMusicalDynamicsStrengthV1090 ?? 55}
        musicalDynamicsStyleV1090={props.arenaMusicalDynamicsStyleV1090 ?? 'balanced'}
        // Only an active, synchronized lyric line from the owned player is projected.
        lyricTextV1083={currentSyncedLedLyricV1083(props.lyricsScene?.lyrics,
          props.lyricsScene?.progressMs,Boolean(props.lyricsScene?.playing&&props.isPlaying))}
        lightingChoreographerEnabledV1060={props.arenaLightingChoreographerEnabledV1060 ?? false}
        lightingChoreographerStrengthV1060={props.arenaLightingChoreographerStrengthV1060 ?? 55}
        microphoneActiveV1049={props.microphoneActiveV1049 ?? false}
        trackId={props.track?.id}
        genre={props.genre}
        progressMs={props.cameraDirectorProgressMs ?? 0} durationMs={props.track?.durationMs ?? 0}
        section={props.cameraDirectorSection ?? "verse"}>
      <group name={TRACKING_ROOT_NAME}>{groupOnV326 ? <GroupDancersV326 stageMovementV1064={planStageMovementV1064({
        enabled:props.arenaStageMovementEnabledV1064===true&&props.arenaShowDesignerEnabledV1040===true,
        stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,reducedMotion:props.reducedMotion,
        manualPriority:!autoGroupOnV442||props.avatarMotionMode==='choreography'||
          props.avatarTimelineEnabled===true||!!props.smartDanceOverride,
        performanceTier:getActivePerformanceTier(),count:effectiveGroupSettingsV442.count,
        trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
        durationMs:props.track?.durationMs,show:authoredShowCueV1040,
        strength:(props.arenaStageMovementStrengthV1064??55)*performanceDirectorV1065.travelGain,
       })} ensembleV1063={planEnsembleChoreographyV1063({
        enabled:props.arenaEnsembleEnabledV1063===true&&props.arenaShowDesignerEnabledV1040===true,
        stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,reducedMotion:props.reducedMotion,
        manualPriority:!autoGroupOnV442||props.avatarMotionMode==='choreography'||
          props.avatarTimelineEnabled===true||!!props.smartDanceOverride,
        footLocked:false,collisionRisk:false,performanceTier:getActivePerformanceTier(),
        count:effectiveGroupSettingsV442.count,trackId:props.track?.id,
        progressMs:props.cameraDirectorProgressMs,durationMs:props.track?.durationMs,
        show:authoredShowCueV1040,strength:(props.arenaEnsembleStrengthV1063??55)*performanceDirectorV1065.ensembleGain,
       })} props={autoGroupOnV442?dancerPropsV1074:{...dancerPropsV1074,multiArtistMotionsV442:undefined}} settings={effectiveGroupSettingsV442} vocalDuetV838={vocalDuetV838}/> : (dual || auto || multiEnabled || showFormation) ? <FormationDancers ensembleV1063={planEnsembleChoreographyV1063({
        enabled:props.arenaEnsembleEnabledV1063===true&&props.arenaShowDesignerEnabledV1040===true,
        stageIsArena:props.stageTheme==='arena360',playing:props.isPlaying,reducedMotion:props.reducedMotion,
        manualPriority:!!manualFormationV354||authoredEnabled||multiEnabled||intelligentEnabled||
          !!props.duoDirectorEnabled||props.avatarTimelineEnabled===true||
          (props.multiAvatarMode??'solo')!=='solo'||!!props.smartDanceOverride||
          props.avatarMotionMode==='choreography',
        footLocked:readFootLockV322().enabled,collisionRisk:false,performanceTier:getActivePerformanceTier(),
        count:2,trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
        durationMs:props.track?.durationMs,show:authoredShowCueV1040,
        strength:(props.arenaEnsembleStrengthV1063??55)*performanceDirectorV1065.ensembleGain,
       })} props={dancerPropsV1074} mode={mode} performanceV1054={avatarPerformanceV1054} stageInteractionV1055={arenaChoreoV1041.active?stageInteractionV1055:null} choreography={authoredEnabled ? null : multiEnabled ? choreography : intelligentEnabled ? intelligentCue : arenaChoreoV1041.active ? performanceChoreoV1054 : null} /> : <group><Dancer props={dancerPropsV1074}/><ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={0} reducedMotion={props.reducedMotion}/></group>}</group>
      </StageEnvironment>
    </Canvas></SceneErrorBoundary>}
    <ConcertQualityInspectorV466 enabled={qualityInspectorEnabledV466} onToggle={()=>{
      if(qualityInspectorEnabledV466)resetConcertQualityV466();
      setQualityInspectorEnabledV466(value=>!value);
    }}/>
  </div>;
}
