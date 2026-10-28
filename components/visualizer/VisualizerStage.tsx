"use client";
import {resolveImmersiveLyricFontV648,type TouchReadabilityV648} from "@/components/touchDisplayPolicyV648";

import {LiveStageDomProbeV592} from "./LiveStageDomProbeV592";
import {planAutomaticRapPerformanceV437,sampleAutomaticRapPerformanceV437,applyAutomaticRapPerformanceV437} from "./automaticRapPerformanceV437";
import {buildRapCameraTimelineV431} from "./rapCameraTimelineV431";
import {cameraSceneAssignmentsV436} from "./autoRapSceneAssignmentsV436";
import {planRapCameraAutoFixV436,combineRapCameraAutoFixV436} from "./rapCameraAutoFixV436";
import {resolveExpressiveRapCueV425,applyExpressiveRapV425} from "./expressiveRapDirectorV425";
import { rapLipStrengthV408 } from "./rapPerformanceEditorV408";
import {initialUnifiedV402,advanceUnifiedV402,chooseUnifiedModeV402,unifiedExperienceV402,gateUnifiedDanceV402} from "./unifiedConcertDirectorV402";
import {advanceFestivalShowV394,initialFestivalShowV394} from "./festivalShowDirectorV394";
import {advanceExperienceV396,initialExperienceV396,chooseExperienceModeV396} from "./performanceExperienceV396";
import {getActivePerformanceTier} from "./adaptivePerformance";
import {advanceConcertShowV387,initialConcertShowV387} from "./concertShowDirectorV387";
import {captureReviewV314} from "./dancePerformanceReviewV314";
import {initialEvolutionV313,advanceEvolutionV313,applyEvolutionV313,readEvolutionV313,DANCE_SHOW_EVOLUTION_EVENT_V313} from "./danceShowEvolutionV313";
import {initialShowQualityV310,advanceShowQualityV310,applyShowQualityV310,readShowQualitySettingsV310,SHOW_QUALITY_EVENT_V310} from "./smartShowQualityV310";
import { SHOW_PRESET_APPLIED_EVENT } from "./showPresetsV309";
import {useEffect,useMemo,useRef,useState} from "react";
import {useStageContentV330} from "@/services/stageContent/useStageContentV330";
import {useScreenLayoutV333} from "@/services/stageContent/useScreenLayoutV333";
import {ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318,readTrackAnalysisV318,resolveTimelineV318} from "@/services/musicAnalysis/trackAnalysisV318";
import { CinematicStageTransitionV288 } from "./CinematicStageTransitionV288";
import { initialShowState, advanceShowState, createShowCue, readShowSettings, ULTIMATE_SHOW_EVENT } from "./ultimateShowDirectorV306";
import { STAGE_DIRECTOR_EVENT, readStageDirector, advanceStageDirector, initialStageDirector, manualStageOverride } from "./stageDirectorV287";
import type { StageEnvironmentId } from "./stages";
import { recordRuntimeCheckpoint } from "@/services/monitoring/runtimePerformanceV285";
import {CHARACTER_MOTION_CHANGE_EVENT,loadCharacterMotionStore,chooseCharacterMotion} from "./characterMotionLibrary";
import {emptyDanceSequence,nextDanceCombination,danceSlot} from "./intelligentDanceCombinationV242";
import {nextAutomaticRapShowV438,type MotionSceneV438} from "./automaticMotionIntelligenceV438";
import {planFeatureCastV440,featureChoreoCueV440,featureCameraAssignmentsV440} from "./automaticFeatureShowV440";
import {buildSmartRapShowV446,sampleSmartRapShowV446,arrangeAutomaticGroupV446,smartShowCameraAssignmentsV446} from "./smartAutomaticRapShowV446";
import {planUltimateAutomaticShowV456,motionForUltimateShowV456,lightStrengthForUltimateShowV456} from "@/services/show/ultimateAutomaticShowV456";
import {planShowContinuityV457,motionEnergyForContinuityV457} from "@/services/show/showContinuityV457";
import {planAutomaticConcertExperienceV464,concertMotionEnergyV464} from "@/services/show/automaticConcertExperienceV464";
import {coordinateAutonomousConcertV478} from "@/services/show/autonomousConcertDirectorV478";
import {planVisualShowQualityV465} from "@/services/show/visualShowQualityV465";
import {planVisualBalanceV451,type VisualBalanceV451} from "@/services/show/visualBalanceV451";
import {planArtistBubblesV441} from "./artistNameBubblesV441";
import {planIntelligentFeatureV460,featureMotionForSlotV460,featureBubblesV460,featureSpotlightV460} from "./intelligentFeaturePerformanceV460";
import {planArtistSpotlightV443} from "./artistSpotlightV443";
import {evaluateGroupV326} from "./multiAvatarStageDirectorV326";
import {planMultiArtistCastV442,planMultiArtistGroupV442,featureFocusV442,multiArtistPhraseAtV442,featureCameraAssignmentsV442} from "./automaticMultiArtistStageV442";
import {MOTION_ANALYSIS_EVENT_V439,readMotionCacheV439,featuresForMotionsV439} from "./glbMotionCacheV439";
import {scanMotionLibraryV439} from "./glbMotionScanV439";
import {initialLiveStructure,advanceLiveStructure} from "./musicStructureAwareV243";
import {initialDanceIntelligence,advanceDanceIntelligence,danceIntelligenceSlot} from "./advancedMusicDanceIntelligenceV273";
import { useVisualizer } from "@/context/VisualizerContext";
import {isMusicGenre,musicGenreFamily} from "@/config/musicGenres";
import { visualizerRegistry } from "@/components/visualizer/registry";
import { useAvatarModel } from "@/hooks/useAvatarModel";
import {DEFAULT_CONCERT_DETAILS_V555} from './concertDetailEffectsV555';
import { KineticLyrics } from "@/components/KineticLyrics";
import {resolveAuthoredConcertSceneV528} from "./cinematicConcertSceneSourceV528";
import {coordinateSmartConcertV568} from "./smartConcertShowDirectorV568";
import {varyConcertDirectorV577} from "./showVariationV577";
import {planUltimateConcertV600,sampleUltimateConcertV600,refineAutomaticConcertGroupV600} from "./ultimateConcertDirectorV600";
import {planUltimateConcertDramaturgyV623} from "./ultimateConcertDramaturgyV623";
import {planConcertExperienceV628} from "./concertExperienceV628";
import {coordinateConcertEditionV642} from "./concertEditionV642";
import {IntelligentConcertTimelineV646} from "./ConcertTimelineOverlayV646";
import {planIntelligentSongDramaturgyV629,sampleIntelligentSongDramaturgyV629} from "./intelligentSongDramaturgyV629";
import {planFullSongDramaturgyV604,sampleFullSongDramaturgyV604,refineAutomaticGroupV604} from "./fullSongConcertDramaturgyV604";
import {refineAutoGroupTransitionsV609} from "./seamlessConcertTransitionsV609";
import {planGenreConcertV610} from "./genreConcertExperienceV610";
import {planContinuousConcertV611} from "./continuousConcertExperienceV611";
import {planSmartConcertDynamicsV502,concertDynamicsPercentV502,concertDynamicsEnergyV502} from "./smartConcertDynamicsV502";
import {hasActiveLyricsV350} from "@/services/stageContent/lyricsPhotoChoreographyV350";
import { LightingChoreographyStudio } from "./LightingChoreographyStudio";
import { setLightingPlayback } from "./lightingPlayback";
import type { AmbientPalette } from "@/components/MusicAwareThemes";
import type { Lyrics } from "@/types/music";
import type { CSSProperties } from "react";
import type { VisualizerProps } from "./registry";

export function VisualizerStage({ lyrics, progressMs = 0, activeIndex = -1, playing = false, stagePalette, visualBalanceV451, kioskReadabilityV648 }: { stagePalette?: AmbientPalette; lyrics?: Lyrics | null; progressMs?: number; activeIndex?: number; playing?: boolean; visualBalanceV451?: VisualBalanceV451; kioskReadabilityV648?: TouchReadabilityV648 }) {
  const { preferences, audio, audioActive, track, isPlaying, genre, genreFusion } = useVisualizer();
  // The shared context distinguishes live microphone analysis from estimated Spotify beats.
  const microphoneActiveV445=audioActive;
  const stageContentV330=useStageContentV330(track);
  // V440: Spotify contributor credits can request a second STAGE avatar, not a singer assignment.
  const featureCastV440=planFeatureCastV440({track,enabled:preferences.rapFeatureAvatarsV440??true,
    mode:preferences.multiAvatarMode??"solo",avatarStage:preferences.visualizerMode==="avatar",
    reducedMotion:preferences.reducedMotion});
  // V442: only auto-expand an unmodified solo stage. V326/other manual formation settings remain authoritative.
  const multiArtistCastV442=planMultiArtistCastV442({artists:featureCastV440.artists,
    enabled:(preferences.rapMultiArtistEnabledV442??true)&&(preferences.rapFeatureAvatarsV440??true),maxCount:preferences.rapMultiArtistMaxV442??4,
    avatarStage:preferences.visualizerMode==="avatar",reducedMotion:preferences.reducedMotion,
    manualMode:(preferences.multiAvatarMode??"solo")!=="solo"||
      preferences.avatarMotionMode==="choreography"||!!preferences.avatarTimelineEnabled||
      !!preferences.avatarBlendEnabled||!!preferences.smartDanceOverride||
      (preferences.avatarDancePreset??"auto")!=="auto"});
  const effectiveMultiModeV440=featureCastV440.mode;
  const performerCountV440=multiArtistCastV442.enabled?multiArtistCastV442.count:effectiveMultiModeV440==="solo"?1:2;
  const screenLayoutV333=useScreenLayoutV333();
  useEffect(() => { recordRuntimeCheckpoint("Visualizer-Komponente gemountet"); }, []);
  setLightingPlayback(track?.id ?? "", track?.durationMs ?? 0, progressMs, isPlaying);
  const expressiveCueV425=resolveExpressiveRapCueV425({
    enabled:preferences.rapExpressiveEnabledV425??false,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    lyrics,progressMs,trackId:track?.id??"",assignmentTrackId:track?.id??"",
    assignments:track?.id?(preferences.rapDuetAssignmentsV416??{})[track.id]??[]:[],
    avatarCount:performerCountV440,
    strength:preferences.rapExpressiveStrengthV425??65,
    manualPriority:preferences.avatarManualVocalEnabledV385===true
  });
  // V437: plan once per song/lyrics document; runtime sampling uses binary search.
  // No singer/phoneme detection, no persistent edits or extra animation loop.
  const rapPerformancePlanV437=useMemo(()=>planAutomaticRapPerformanceV437({
    trackId:track?.id??"",lyrics,
    authored:track?.id?(preferences.rapDuetAssignmentsV416??{})[track.id]??[]:[],
  }),[track?.id,lyrics,preferences.rapDuetAssignmentsV416]);
  // Known non-rap genres retain their normal choreography; unknown genre stays eligible.
  const rapGenreV437=!genre||/(?:rap|hip[\s-]?hop|trap|drill|grime|boom[\s-]?bap)/i.test(genre);
  const rapPerformanceCueV437=sampleAutomaticRapPerformanceV437(rapPerformancePlanV437,{
    trackId:track?.id??"",progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    enabled:(preferences.rapAutoPerformanceEnabledV437??true)&&rapGenreV437&&preferences.visualizerMode==="avatar",
    strength:preferences.rapAutoPerformanceStrengthV437??70,
    audioEnergy:audio.energyEnvelope??0,beat:audio.kickAccentIntensity??0,
  });
  const rapDanceAllowedV437=preferences.avatarMotionMode!=="choreography"&&
    !preferences.avatarTimelineEnabled&&!preferences.avatarBlendEnabled&&
    !preferences.smartDanceOverride&&(preferences.avatarDancePreset??"auto")==="auto";
  const rapPerformanceValuesV437=applyAutomaticRapPerformanceV437({
    cue:rapPerformanceCueV437,
    danceAllowed:rapDanceAllowedV437,
    vocalAllowed:!preferences.avatarManualVocalEnabledV385&&!preferences.rapSyllableEditsEnabledV420,
    intensity:preferences.avatarAnimationIntensity,aggression:preferences.danceAggression,
    variation:preferences.danceVariation,style:preferences.danceMotionStyle,
    face:applyExpressiveRapV425(preferences.avatarFacialExpressionV368??55,expressiveCueV425,"face"),
    gesture:applyExpressiveRapV425(preferences.avatarVocalBodyStrengthV371??60,expressiveCueV425,"gesture"),
    rapLip:preferences.avatarRapLipEnabledV415??false,
    lipEnabled:preferences.avatarLipSyncEnabled??true,
  });
  // V446: deterministic song score for the automatic stage only. No manual timeline is rewritten.
  const smartShowAllowedV446=(preferences.rapSmartShowEnabledV446??true)&&rapDanceAllowedV437&&
    (preferences.rapAutoPerformanceEnabledV437??true)&&rapGenreV437&&
    preferences.visualizerMode==="avatar"&&!preferences.reducedMotion;
  const smartShowPlanV446=useMemo(()=>buildSmartRapShowV446({
    trackId:track?.id??"",count:performerCountV440,lyrics,
    bpm:Math.round(audio.bpm??0),durationMs:track?.durationMs??0,
    enabled:smartShowAllowedV446,
  }),[track?.id,performerCountV440,lyrics,Math.round(audio.bpm??0),track?.durationMs,smartShowAllowedV446]);
  // In automatic V436 mode, use a conservative camera-only fallback if there
  // is no V416 cast. This never assigns an actual vocalist identity or mouth rig.
  const rapCameraCastV436=useMemo(()=>{
    const base=cameraSceneAssignmentsV436({lyrics,
      authored:track?.id?(preferences.rapDuetAssignmentsV416??{})[track.id]??[]:[],
      avatarCount:performerCountV440,autoEnabled:preferences.rapCameraAutoFixEnabledV436??true});
    // Inferred visual alternation is strictly camera-only, never a fabricated vocalist cast.
    return featureCastV440.enabled&&base.inferred?
      {...base,assignments:smartShowAllowedV446&&smartShowPlanV446.source==="synced-lyrics"?
        smartShowCameraAssignmentsV446(base.assignments,smartShowPlanV446):
        multiArtistCastV442.enabled?
          featureCameraAssignmentsV442(base.assignments,lyrics,multiArtistCastV442.count as 3|4):
          featureCameraAssignmentsV440(base.assignments,lyrics)}:base;
  },[lyrics,track?.id,preferences.rapDuetAssignmentsV416,
    effectiveMultiModeV440,featureCastV440.enabled,multiArtistCastV442.enabled,multiArtistCastV442.count,preferences.rapCameraAutoFixEnabledV436,smartShowAllowedV446,smartShowPlanV446]);
  // Keep one stable camera director for a track with authored scenes; do not
  // mount/unmount the R3F camera at every lyric line boundary.
  const rapCameraArmedV429=!!preferences.rapCameraEnabledV429&&!!lyrics?.synced&&
    !!track?.id&&effectiveMultiModeV440!=="solo"&&
    rapCameraCastV436.assignments.length>0;
  // V429 reads the same V416-authored timing as V425, but is independently optional.
  const rapCameraCueV429=resolveExpressiveRapCueV425({
    enabled:preferences.rapCameraEnabledV429??false,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    lyrics,progressMs,trackId:track?.id??"",assignmentTrackId:track?.id??"",
    assignments:rapCameraCastV436.assignments,assignmentSource:rapCameraCastV436.inferred?"auto":"authored",
    avatarCount:performerCountV440,strength:100,
    manualPriority:preferences.avatarManualVocalEnabledV385===true
  });
  // V436 is a non-destructive, per-song derivation; playback ticks NEVER rerun this analysis.
  // Round estimated tempo to 5 BPM buckets so micro-jitter cannot trigger a full-song scan.
  const rapAutoFixBpmV436=Number.isFinite(audio.bpm)?Math.round((audio.bpm??0)/5)*5:null;
  const rapAutoFixPlanV436=useMemo(()=>{
    const id=track?.id??"";
    const manual=id?(preferences.rapCameraOverridesV430??{})[id]??[]:[];
    const assigned=id?(preferences.rapDuetAssignmentsV416??{})[id]??[]:[];
    if(!(preferences.rapCameraAutoFixEnabledV436??true)||!preferences.rapCameraEnabledV429){
      return planRapCameraAutoFixV436({trackId:id,items:[],
        settings:{smoothness:preferences.rapCameraTransitionSmoothnessV433??55,
          beatSync:preferences.rapCameraBeatSyncV433??true}});
    }
    const timeline=buildRapCameraTimelineV431({trackId:id,lyrics,
      assignments:featureCastV440.enabled&&rapCameraCastV436.inferred?rapCameraCastV436.assignments:assigned,
      overrides:manual,avatarCount:performerCountV440,
      autoAssignIfMissing:true});
    return planRapCameraAutoFixV436({trackId:id,items:timeline.items,manualOverrides:manual,
      keyframes:id?(preferences.rapCameraKeyframesV432??{})[id]??[]:[],
      settings:{smoothness:preferences.rapCameraTransitionSmoothnessV433??55,
        beatSync:preferences.rapCameraBeatSyncV433??true},
      bpm:rapAutoFixBpmV436,duo:effectiveMultiModeV440!=="solo",
      lyricsProtected:preferences.lyricsVisible??true,strength:preferences.rapCameraStrengthV429??65});
  },[track?.id,lyrics,preferences.rapDuetAssignmentsV416,preferences.rapCameraOverridesV430,
    preferences.rapCameraKeyframesV432,effectiveMultiModeV440,
    preferences.rapCameraTransitionSmoothnessV433,preferences.rapCameraBeatSyncV433,
    preferences.rapCameraStrengthV429,preferences.lyricsVisible,rapAutoFixBpmV436,
    preferences.rapCameraAutoFixEnabledV436,preferences.rapCameraEnabledV429,
    featureCastV440.enabled,rapCameraCastV436]);
  const rapAutoFixActiveV436=(preferences.rapCameraAutoFixEnabledV436??true)&&
    !!preferences.rapCameraEnabledV429&&rapAutoFixPlanV436.available;
  const rapCameraEditsV436=useMemo(()=>{
    const original=track?.id?(preferences.rapCameraOverridesV430??{})[track.id]??[]:[];
    return rapAutoFixActiveV436?
      combineRapCameraAutoFixV436(rapAutoFixPlanV436.overrides,original):original;
  },[track?.id,preferences.rapCameraOverridesV430,rapAutoFixActiveV436,rapAutoFixPlanV436]);
  const definition = visualizerRegistry[preferences.visualizerMode];
  const Mode = definition.Component;
  const genreAvatar: Record<string, string> = { hardstyle: "festival", hardtekk: "festival", techno: "neon", rock: "festival", metal: "festival" };
  const avatarGenreFamily = genre && isMusicGenre(genre) ? musicGenreFamily(genre) : null;
  const selectedAvatarId = preferences.autoAvatarByGenre && genre ? (genreAvatar[genre.toLowerCase()] ?? (avatarGenreFamily?genreAvatar[avatarGenreFamily]:undefined) ?? preferences.avatarModelId) : preferences.avatarModelId;
  const avatarModel = useAvatarModel(selectedAvatarId);
  const secondaryAvatarId = preferences.secondaryAvatarModelId ?? "procedural";
  const secondaryAvatar = useAvatarModel(secondaryAvatarId);
  const avatarModelUrl = avatarModel.url;
  const [motionRevision,setMotionRevision]=useState(0);
  useEffect(()=>{const refresh=()=>setMotionRevision(v=>v+1);refresh();window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT,refresh);window.removeEventListener("storage",refresh);};},[]);
  const [motionAnalysisRevisionV439,setMotionAnalysisRevisionV439]=useState(0);
  useEffect(()=>{
    const refresh=()=>setMotionAnalysisRevisionV439(v=>v+1);
    window.addEventListener(MOTION_ANALYSIS_EVENT_V439,refresh);
    return ()=>window.removeEventListener(MOTION_ANALYSIS_EVENT_V439,refresh);
  },[]);
  // Browser-only, one GLB at a time. Up to 12 per selected avatar/session.
  // Cache updates may rerender, but never retrigger this scan on every music tick.
  const motionAutoScanV439=(preferences.rapAutoMotionEnabledV438??true)&&
    preferences.visualizerMode==="avatar"&&!preferences.reducedMotion;
  useEffect(()=>{
    if(!motionAutoScanV439)return;
    const controller=new AbortController();
    void scanMotionLibraryV439(loadCharacterMotionStore().motions,selectedAvatarId,controller.signal,12);
    return ()=>controller.abort();
  },[selectedAvatarId,motionRevision,motionAutoScanV439]);
  // V442: reuse the same bounded V439 cache for second dancer's motions too.
  useEffect(()=>{
    if(!motionAutoScanV439||!multiArtistCastV442.enabled||selectedAvatarId===secondaryAvatarId)return;
    const controller=new AbortController();
    void scanMotionLibraryV439(loadCharacterMotionStore().motions,secondaryAvatarId,controller.signal,12);
    return ()=>controller.abort();
  },[selectedAvatarId,secondaryAvatarId,motionRevision,motionAutoScanV439,multiArtistCastV442.enabled]);
  const sequenceRef = useRef(emptyDanceSequence());
  const liveStructureRef = useRef(initialLiveStructure());
  const danceIntelligenceRef = useRef(initialDanceIntelligence());
  liveStructureRef.current=advanceLiveStructure(liveStructureRef.current,{trackId:track?.id??"",progressMs,playing:isPlaying,energy:audio.energyEnvelope??0,bass:audio.bass??0,kick:audio.kickAccentIntensity??0,attack:audio.attack??0,anticipation:audio.kickAnticipation??0});
  const liveStructure=liveStructureRef.current;
  danceIntelligenceRef.current=advanceDanceIntelligence(danceIntelligenceRef.current,{trackId:track?.id??"",progressMs,playing:isPlaying,genre,bpm:audio.bpm,energy:audio.energyEnvelope??0,bass:audio.bass??0,kick:audio.kickAccentIntensity??0,structure:liveStructure});
  const danceIntelligence=danceIntelligenceRef.current;
  // V318: a track-specific, optional analysis supplements the causal live detector.
  // Track changes, cross-tab imports and deletes invalidate only this bounded lookup.
  const [analysisRevision,setAnalysisRevision]=useState(0);
  useEffect(()=>{
    const refresh=()=>setAnalysisRevision(x=>x+1);
    const onStorage=(event:StorageEvent)=>{if(event.key===ANALYSIS_STORAGE_KEY_V318)refresh();};
    window.addEventListener(ANALYSIS_EVENT_V318,refresh);window.addEventListener("storage",onStorage);
    return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,refresh);window.removeEventListener("storage",onStorage);};
  },[]);
  const importedAnalysis=useMemo(()=>readTrackAnalysisV318(track?.id??""),[track?.id,analysisRevision]);
  const musicTimeline=resolveTimelineV318({trackId:track?.id??"",progressMs,playing:isPlaying,
    liveSection:danceIntelligence.section,liveBpm:audio.bpm},importedAnalysis);
  const directedSection=musicTimeline.section;
  // V456: ONE bounded policy coordinates the existing stage motion, concert camera,
  // passive information budget and lighting. No authored scene or vocal cue is edited.
  const attentionV456=visualBalanceV451??planVisualBalanceV451({
    enabled:preferences.smartVisualBalanceEnabledV451??true,playing:isPlaying,
    progressMs,lyricsVisible:preferences.lyricsVisible,immersiveLyrics:preferences.lyricsImmersiveEnabled??false,
    lyrics:lyrics??null,activeIndex,
  });
  // V502: share the SAME V318 playback section between dance, camera, lighting
  // and visual lyric accents. Imported labels get stronger cues than live estimates.
  // Manual timeline/clip choices, camera edits and non-reactive lights remain authoritative.
  const dynamicsV502=planSmartConcertDynamicsV502({
    trackId:track?.id??"",progressMs,playing:isPlaying,
    enabled:preferences.visualizerMode==="avatar"||!!(preferences.lyricsVisible&&preferences.lyricsImmersiveEnabled),
    reducedMotion:preferences.reducedMotion,
    genre,section:directedSection,source:musicTimeline.source,
    hasSectionLabels:musicTimeline.hasSectionLabels,sectionStartMs:musicTimeline.sectionStartMs,
    energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
    tier:getActivePerformanceTier(),
    lyricFocus:attentionV456.attention==="lyrics",lyricsVisible:!!preferences.lyricsVisible,
    manualDance:preferences.visualizerMode!=="avatar"||!rapDanceAllowedV437,
    manualCamera:preferences.visualizerMode!=="avatar"||Boolean(track?.id&&preferences.rapCameraKeyframesEnabledV432&&
      (preferences.rapCameraKeyframesV432??{})[track.id]?.length)||
      !!preferences.avatarCameraTimelineV400,
    manualLighting:preferences.visualizerMode!=="avatar"||preferences.stageReactive===false,
    manualLyrics:preferences.lyricsBeatReactive===false,
  });
  // V528: one verified, track-bound scene for both the existing camera and 3D/DOM lyrics.
  // Never use feature credits or V527's visual-only spotlight as singer identities.
  const cinematicSceneV528=resolveAuthoredConcertSceneV528({
    trackId:track?.id,lyrics,count:performerCountV440,progressMs,playing,
    reducedMotion:preferences.reducedMotion,tier:getActivePerformanceTier(),
    manualStage:preferences.avatarMotionMode==='choreography'||
      !!preferences.avatarTimelineEnabled||preferences.visualizerMode!=='avatar',
    manualEnabled:preferences.avatarManualVocalEnabledV385,
    manualCameraAllowed:preferences.avatarManualVocalCameraV385!==false,
    manualAssignments:track?.id?(preferences.avatarVocalAssignmentsV385??{})[track.id]:[],
    timeEnabled:preferences.vocalTimeEnabledV496,
    timeCameraAllowed:preferences.rapDuetCameraV416!==false,
    timeSegments:track?.id?(preferences.vocalTimeSegmentsV496??{})[track.id]:[],
    duetEnabled:preferences.rapDuetEnabledV416,
    duetCameraAllowed:preferences.rapDuetCameraV416!==false,
    duetAssignments:track?.id?(preferences.rapDuetAssignmentsV416??{})[track.id]:[],
    roleOffsetMs:preferences.rapTimingLiveEnabledV418?preferences.rapTimingOffsetsV418?.roleMs??0:0,
  });
  // V568: shared, conservative stage intensity – no singer/camera/lyrics authoring.
  const smartConcertV568=coordinateSmartConcertV568({
    base:dynamicsV502,scene:cinematicSceneV528,attention:attentionV456,
    enabled:preferences.smartConcertDirectorEnabledV568??true,
    strength:preferences.smartConcertDirectorStrengthV568??65,
    trackId:track?.id??'',progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    tier:getActivePerformanceTier(),lyricsVisible:!!preferences.lyricsVisible,
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437,
    manualCamera:preferences.visualizerMode!=='avatar'||Boolean(track?.id&&preferences.rapCameraKeyframesEnabledV432&&
      (preferences.rapCameraKeyframesV432??{})[track.id]?.length)||
      !!preferences.avatarCameraTimelineV400?.enabled||!!preferences.avatarCameraStudioV398?.enabled,
    manualLighting:preferences.visualizerMode!=='avatar'||preferences.stageReactive===false,
    manualLyrics:preferences.lyricsBeatReactive===false,
  });
  const directedDynamicsV568=varyConcertDirectorV577(smartConcertV568,{
    progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437,
    manualCamera:preferences.visualizerMode!=='avatar'||Boolean(preferences.avatarCameraTimelineV400?.enabled||preferences.avatarCameraStudioV398?.enabled||
      track?.id&&preferences.rapCameraKeyframesEnabledV432&&(preferences.rapCameraKeyframesV432??{})[track.id]?.length),
    manualLighting:preferences.visualizerMode!=='avatar'||preferences.stageReactive===false,
  });
  // V600: one whole-song narrative from verified imported sections. For unlabelled
  // music the conservative duration contour never pretends to know a hook or drop.
  // Per-song planning is memoized; sampling is deterministic, no new timers/rAF.
  const concertArcPlanV600=useMemo(()=>planUltimateConcertV600({
    trackId:track?.id??'',durationMs:track?.durationMs??0,genre:dynamicsV502.genre,
    analysis:importedAnalysis,
  }),[track?.id,track?.durationMs,dynamicsV502.genre,importedAnalysis]);
  const concertArcV600=sampleUltimateConcertV600(concertArcPlanV600,{
    trackId:track?.id??'',progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    enabled:preferences.smartConcertDirectorEnabledV568??true,tier:getActivePerformanceTier(),
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437,
    manualCamera:preferences.visualizerMode!=='avatar'||Boolean(preferences.avatarCameraTimelineV400?.enabled||
      preferences.avatarCameraStudioV398?.enabled||track?.id&&preferences.rapCameraKeyframesEnabledV432&&
      (preferences.rapCameraKeyframesV432??{})[track.id]?.length),
    manualLighting:preferences.visualizerMode!=='avatar'||preferences.stageReactive===false,
    lyricsProtected:smartConcertV568.lyricsProtected,base:directedDynamicsV568,
  });
  const directedDynamicsV600=concertArcV600.dynamics;
  // V604: coherent FULL-TRACK direction from verified V600 sections only. A
  // live V318 label must match before any additional intensity is introduced.
  // Values fade to their untouched V600 baseline at EVERY scene boundary.
  const fullSongPlanV604=useMemo(()=>planFullSongDramaturgyV604(concertArcPlanV600),[concertArcPlanV600]);
  const fullSongStoryPlanV629=useMemo(()=>planIntelligentSongDramaturgyV629(fullSongPlanV604),[fullSongPlanV604]);
  const fullSongCueV604=sampleFullSongDramaturgyV604(fullSongPlanV604,{
    trackId:track?.id??'',progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    enabled:preferences.smartConcertDirectorEnabledV568??true,tier:getActivePerformanceTier(),
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437,
    manualCamera:preferences.visualizerMode!=='avatar'||Boolean(preferences.avatarCameraTimelineV400?.enabled||
      preferences.avatarCameraStudioV398?.enabled||track?.id&&preferences.rapCameraKeyframesEnabledV432&&
      (preferences.rapCameraKeyframesV432??{})[track.id]?.length),
    manualLighting:preferences.visualizerMode!=='avatar'||preferences.stageReactive===false,
    lyricsProtected:smartConcertV568.lyricsProtected,confirmedV600:concertArcV600,base:directedDynamicsV600,
  });
  const directedDynamicsV604=fullSongCueV604.dynamics;
  // V610 adjusts only automatically selected motions with genuine labelled cues.
  const concertGenreV610=planGenreConcertV610({
    narrative:{plan:fullSongPlanV604,cue:fullSongCueV604},
    trackId:track?.id??'',durationMs:track?.durationMs??0,positionMs:progressMs,
    section:concertArcV600.section??directedSection,genre:genre||concertArcPlanV600.genre,
    energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
    playing:isPlaying,reducedMotion:preferences.reducedMotion,tier:getActivePerformanceTier(),
    lyricsProtected:smartConcertV568.lyricsProtected,
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437||
      preferences.avatarMotionMode==='choreography'||preferences.avatarTimelineEnabled===true,
    manualCamera:true,manualLighting:true,
  });
    // V611: one evidence-bound song arc for the same automatic lanes, no new clock.
    const concertContinuityV611=planContinuousConcertV611({
    genreCue:concertGenreV610,
    narrative:{plan:fullSongPlanV604,cue:fullSongCueV604},
    trackId:track?.id??'',durationMs:track?.durationMs??0,positionMs:progressMs,
    section:concertArcV600.section??directedSection,genre:genre||concertArcPlanV600.genre,
    energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
    playing:isPlaying,reducedMotion:preferences.reducedMotion,tier:getActivePerformanceTier(),
    lyricsProtected:smartConcertV568.lyricsProtected,
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437||
      preferences.avatarMotionMode==='choreography'||preferences.avatarTimelineEnabled===true,
    manualCamera:true,manualLighting:true,
  });
  // V623: one verified song score coordinates the existing automatic lanes.
  // Manual clips/camera/lighting remain owned by their editors; no new clock.
  const concertDramaturgyBaseV623=planUltimateConcertDramaturgyV623({
    narrative:{plan:fullSongPlanV604,cue:fullSongCueV604},
    trackId:track?.id??'',durationMs:track?.durationMs??0,positionMs:progressMs,
    section:concertArcV600.section,playing:isPlaying,
    enabled:preferences.smartConcertDirectorEnabledV568??true,
    reducedMotion:preferences.reducedMotion,tier:getActivePerformanceTier(),
    energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
    lyricsProtected:smartConcertV568.lyricsProtected,
    vocalFocus:smartConcertV568.focusSlot!=null,
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437||
      preferences.avatarMotionMode==='choreography'||preferences.avatarTimelineEnabled===true,
    manualCamera:preferences.visualizerMode!=='avatar'||!!preferences.avatarCameraTimelineV400?.enabled||
      !!preferences.avatarCameraStudioV398?.enabled||Boolean(track?.id&&preferences.rapCameraKeyframesEnabledV432&&
      (preferences.rapCameraKeyframesV432??{})[track.id]?.length),
    manualLighting:preferences.visualizerMode!=='avatar'||preferences.stageReactive===false,
  });
  // V628: re-balance all four existing V623 consumers with one verified act.
  // No new renderer, camera loop, timeline, stage reload or unsourced song cues.
  const concertExperienceV628=planConcertExperienceV628({
    base:concertDramaturgyBaseV623,narrative:{plan:fullSongPlanV604,cue:fullSongCueV604},
    trackId:track?.id??'',durationMs:track?.durationMs??0,positionMs:progressMs,
    section:concertArcV600.section,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    tier:getActivePerformanceTier(),lyricsProtected:smartConcertV568.lyricsProtected,
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437||
      preferences.avatarMotionMode==='choreography'||preferences.avatarTimelineEnabled===true,
    manualCamera:preferences.visualizerMode!=='avatar'||!!preferences.avatarCameraTimelineV400?.enabled||
      !!preferences.avatarCameraStudioV398?.enabled||Boolean(track?.id&&preferences.rapCameraKeyframesEnabledV432&&
      (preferences.rapCameraKeyframesV432??{})[track.id]?.length),
    manualLighting:preferences.visualizerMode!=='avatar'||preferences.stageReactive===false,
  });
  // V629: full-track hook contrast and recovery, bounded by the SAME V628 cue.
  // This remains the single final V623 score for every existing renderer.
  const concertStoryV629=sampleIntelligentSongDramaturgyV629({
    plan:fullSongStoryPlanV629,narrative:{plan:fullSongPlanV604,cue:fullSongCueV604},
    experience:concertExperienceV628,trackId:track?.id??'',durationMs:track?.durationMs??0,
    positionMs:progressMs,section:concertArcV600.section,playing:isPlaying,
    reducedMotion:preferences.reducedMotion,tier:getActivePerformanceTier(),
    lyricsProtected:smartConcertV568.lyricsProtected,
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437||
      preferences.avatarMotionMode==='choreography'||preferences.avatarTimelineEnabled===true,
    manualCamera:preferences.visualizerMode!=='avatar'||!!preferences.avatarCameraTimelineV400?.enabled||
      !!preferences.avatarCameraStudioV398?.enabled||Boolean(track?.id&&preferences.rapCameraKeyframesEnabledV432&&
      (preferences.rapCameraKeyframesV432??{})[track.id]?.length),
    manualLighting:preferences.visualizerMode!=='avatar'||preferences.stageReactive===false,
  });
  // V642: last verified, cross-lane harmony pass. A protected singer/lyrics
  // scene takes precedence; repeated hooks alternate ONLY existing auto lanes.
  const concertEditionV642=coordinateConcertEditionV642({
    story:concertStoryV629,narrative:{plan:fullSongPlanV604,cue:fullSongCueV604},
    trackId:track?.id??'',durationMs:track?.durationMs??0,positionMs:progressMs,
    section:concertArcV600.section,playing:isPlaying,
    enabled:preferences.smartConcertDirectorEnabledV568??true,
    reducedMotion:preferences.reducedMotion,tier:getActivePerformanceTier(),
    lyricsProtected:smartConcertV568.lyricsProtected,
    verifiedVocalFocus:cinematicSceneV528.active===true,
    manualDance:preferences.visualizerMode!=='avatar'||!rapDanceAllowedV437||
      preferences.avatarMotionMode==='choreography'||preferences.avatarTimelineEnabled===true,
    manualCamera:preferences.visualizerMode!=='avatar'||!!preferences.avatarCameraTimelineV400?.enabled||
      !!preferences.avatarCameraStudioV398?.enabled||Boolean(track?.id&&preferences.rapCameraKeyframesEnabledV432&&
      (preferences.rapCameraKeyframesV432??{})[track.id]?.length),
    manualLighting:preferences.visualizerMode!=='avatar'||preferences.stageReactive===false,
  });
  const concertDramaturgyV623=concertEditionV642.cue;
  const experienceStateV396=useRef(initialExperienceV396());
  const experienceCueV396=advanceExperienceV396(experienceStateV396.current,{
    trackId:track?.id,progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    mode:preferences.avatarExperienceModeV396??'off',strength:preferences.avatarExperienceStrengthV396??65,
    section:directedSection,genre,energy:audio.energyEnvelope??0,beat:audio.kickAccentIntensity??0,
    activeLyrics:!!preferences.lyricsVisible&&lyrics?.synced===true&&attentionV456.attention==='lyrics',
    hasVocalTiming:!!lyrics?.synced&&!!preferences.avatarLipSyncEnabled,
    performers:effectiveMultiModeV440==='solo'&&!preferences.duoDirectorEnabled?1:2,
    performanceTier:getActivePerformanceTier(),
  });
  const unifiedStateV402=useRef(initialUnifiedV402());
  const unifiedCueV402=advanceUnifiedV402(unifiedStateV402.current,{
    trackId:track?.id,progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    mode:preferences.avatarUnifiedModeV402??'off',strength:preferences.avatarUnifiedStrengthV402??70,
    section:directedSection,genre,energy:audio.energyEnvelope??0,beat:audio.kickAccentIntensity??0,
    performers:effectiveMultiModeV440==='solo'&&!preferences.duoDirectorEnabled?1:2,
    activeLyrics:!!preferences.lyricsVisible&&lyrics?.synced===true&&attentionV456.attention==='lyrics',
    hasVocalTiming:!!lyrics?.synced&&!!preferences.avatarLipSyncEnabled,
    camera:preferences.avatarUnifiedCameraV402??true,lighting:preferences.avatarUnifiedLightingV402??true,
    dance:preferences.avatarUnifiedDanceV402??true,vocal:preferences.avatarUnifiedVocalV402??true,
    performanceTier:getActivePerformanceTier(),
  });
  const sharedExperienceCueV402=unifiedExperienceV402(experienceCueV396,unifiedCueV402);
  const unifiedSectionV402=unifiedCueV402.active&&!experienceCueV396.active?unifiedCueV402.section:directedSection;
  const concertShowStateV387=useRef(initialConcertShowV387());
  concertShowStateV387.current=advanceConcertShowV387(concertShowStateV387.current,{
    trackId:track?.id,progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    mode:chooseUnifiedModeV402(preferences.avatarShowModeV387??"off",experienceCueV396.concertMode,experienceCueV396.active,unifiedCueV402.concertMode),strength:preferences.avatarShowModeV387&&preferences.avatarShowModeV387!=="off"?(preferences.avatarShowStrengthV387??70):experienceCueV396.active?Math.round(65*experienceCueV396.visualGain):unifiedCueV402.active?unifiedCueV402.concertStrength:preferences.avatarShowStrengthV387??70,
    section:unifiedSectionV402,genre,energy:audio.energyEnvelope??audio.bass??0,
    beat:audio.kickAccentIntensity??0,
  });
  const concertShowCueV387=gateUnifiedDanceV402(concertShowStateV387.current.cue,unifiedCueV402,(preferences.avatarShowModeV387??"off")!=="off"||experienceCueV396.active);
  const festivalStateV394=useRef(initialFestivalShowV394());
  festivalStateV394.current=advanceFestivalShowV394(festivalStateV394.current,{
    trackId:track?.id,progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    mode:chooseUnifiedModeV402(preferences.avatarFestivalModeV394??"off",experienceCueV396.festivalMode,experienceCueV396.active,unifiedCueV402.festivalMode),strength:preferences.avatarFestivalModeV394&&preferences.avatarFestivalModeV394!=="off"?(preferences.avatarFestivalStrengthV394??70):experienceCueV396.active?Math.round(66*experienceCueV396.visualGain):unifiedCueV402.active?unifiedCueV402.festivalStrength:preferences.avatarFestivalStrengthV394??70,
    section:unifiedSectionV402,genre,energy:audio.energyEnvelope??audio.bass??0,
    beat:audio.kickAccentIntensity??0,performanceTier:getActivePerformanceTier(),
  });
  const festivalShowCueV394=festivalStateV394.current.cue;
  const [directorSettings, setDirectorSettings] = useState(readStageDirector);
  useEffect(() => { const refresh = () => setDirectorSettings(readStageDirector()); window.addEventListener(STAGE_DIRECTOR_EVENT, refresh); return () => window.removeEventListener(STAGE_DIRECTOR_EVENT, refresh); }, []);
  const [showSettings,setShowSettings] = useState(readShowSettings);
  useEffect(()=>{const sync=()=>setShowSettings(readShowSettings());window.addEventListener(ULTIMATE_SHOW_EVENT,sync);return ()=>window.removeEventListener(ULTIMATE_SHOW_EVENT,sync);},[]);
  const showStateRef=useRef(initialShowState());
  showStateRef.current=advanceShowState(showStateRef.current,{
    trackId:track?.id??"",progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    genre,section:directedSection,energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,settings:showSettings
  });
  const showCue=createShowCue(showStateRef.current,{
    trackId:track?.id??"",progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    genre,section:directedSection,energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,settings:showSettings
  });
  const [qualitySettings,setQualitySettings]=useState(readShowQualitySettingsV310);
  useEffect(()=>{const sync=()=>setQualitySettings(readShowQualitySettingsV310());window.addEventListener(SHOW_QUALITY_EVENT_V310,sync);return()=>window.removeEventListener(SHOW_QUALITY_EVENT_V310,sync);},[]);
  const qualityStateRef=useRef(initialShowQualityV310());
  const qualityInput={trackId:track?.id??"",progressMs,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    bpm:audio.bpm,energy:audio.energyEnvelope??0,cue:showCue,settings:qualitySettings};
  qualityStateRef.current=advanceShowQualityV310(qualityStateRef.current,qualityInput);
  const qualityCue=applyShowQualityV310(showCue,qualityStateRef.current,qualityInput);
  const [evolutionSettings,setEvolutionSettings]=useState(readEvolutionV313);
  useEffect(()=>{const sync=()=>setEvolutionSettings(readEvolutionV313());window.addEventListener(DANCE_SHOW_EVOLUTION_EVENT_V313,sync);return()=>window.removeEventListener(DANCE_SHOW_EVOLUTION_EVENT_V313,sync);},[]);
  const evolutionStateRef=useRef(initialEvolutionV313());
  const evolutionInput={trackId:track?.id??"",progressMs,durationMs:track?.durationMs??0,playing:isPlaying,
    reducedMotion:preferences.reducedMotion,energy:audio.energyEnvelope??0,cue:qualityCue,settings:evolutionSettings,
    fxBudget:qualitySettings.enabled?(qualitySettings.fxCeiling/100)*(1-.48*(qualitySettings.dancerFocus/100)):1,
    lightBudget:qualitySettings.enabled?1.42-.20*(qualitySettings.dancerFocus/100):1.53,
    beamBudget:qualitySettings.enabled?1.45-.30*(qualitySettings.dancerFocus/100):1.65};
  evolutionStateRef.current=advanceEvolutionV313(evolutionStateRef.current,evolutionInput);
  const directedShowCue=applyEvolutionV313(qualityCue,evolutionStateRef.current,evolutionInput);
  // V314: capture one bounded telemetry sample per playback interval after commit.
  // No render-phase writes; no additional rendering, network or song history persistence.
  useEffect(()=>{
    if(preferences.visualizerMode!=="avatar")return;
    captureReviewV314({trackId:track?.id??"",trackLabel:track?.title??"",progressMs,
      durationMs:track?.durationMs??0,playing:isPlaying,reducedMotion:preferences.reducedMotion,
      showCue:showSettings.enabled?directedShowCue:undefined,energy:audio.energyEnvelope??0,
      kick:audio.kickAccentIntensity??0,phaseLocked:audio.phaseLocked,
      phaseConfidence:audio.phaseConfidence});
  },[track?.id,track?.title,track?.durationMs,progressMs,isPlaying,preferences.visualizerMode,preferences.reducedMotion,
      directedShowCue,showSettings.enabled,audio.energyEnvelope,audio.kickAccentIntensity,audio.phaseLocked,audio.phaseConfidence]);
  const showEnabled=showSettings.enabled && preferences.visualizerMode === "avatar";
  const manualStage = (preferences.stageTheme ?? "classic") as StageEnvironmentId;
  const stageDirectorRef = useRef(initialStageDirector(manualStage));
  const previousManualRef = useRef(manualStage);
  const presetStageRef=useRef<StageEnvironmentId | null>(null);
  useEffect(()=>{
    const onPreset=(event:Event)=>{
      const theme=(event as CustomEvent<{theme?:StageEnvironmentId}>).detail?.theme;
      presetStageRef.current=theme??null;
      stageDirectorRef.current=initialStageDirector(theme??previousManualRef.current);
    };
    window.addEventListener(SHOW_PRESET_APPLIED_EVENT,onPreset);
    return ()=>window.removeEventListener(SHOW_PRESET_APPLIED_EVENT,onPreset);
  },[]);
  if (previousManualRef.current !== manualStage) {
    previousManualRef.current = manualStage;
    if (presetStageRef.current !== manualStage && (directorSettings.enabled || showEnabled) && stageDirectorRef.current.trackId === (track?.id ?? "")) {
      stageDirectorRef.current = manualStageOverride(stageDirectorRef.current, manualStage);
    }
  }
  // Consume an applied-preset signal even when its stage equals the previous stage.
  // Otherwise a later manual re-selection of that theme could accidentally be ignored.
  if (presetStageRef.current !== null) presetStageRef.current=null;
  stageDirectorRef.current = advanceStageDirector(stageDirectorRef.current, {
    trackId: track?.id ?? "", progressMs, playing: isPlaying, genre,
    section: directedSection, energy: audio.energyEnvelope ?? 0,
    currentManual: manualStage, desiredStage: showEnabled ? directedShowCue.stage : undefined, settings: showEnabled ? {...directorSettings,enabled:true} : directorSettings,
  });
  const directedStage = (directorSettings.enabled || showEnabled) && preferences.visualizerMode === "avatar"
    ? stageDirectorRef.current.stage : manualStage;
  const motionStore=loadCharacterMotionStore();
  const motionProfilesV439=useMemo(()=>featuresForMotionsV439(loadCharacterMotionStore().motions,readMotionCacheV439()),
    [motionRevision,motionAnalysisRevisionV439]);
  // V437 may annotate an inferred hook for the EXISTING automatic motion selector.
  // Switching requires installed compatible clips and motionStore.automatic; manually
  // selected clips/timelines/choreographies keep their existing precedence.
  const rapMotionHookV437=rapDanceAllowedV437&&rapPerformanceCueV437.active&&
    rapPerformanceCueV437.scene==="hook"&&motionStore.automatic;
  const danceEventV437=danceIntelligenceSlot(
    musicTimeline.phraseSlot??danceSlot(progressMs,musicTimeline.tempo??audio.bpm??undefined),danceIntelligence);
  const multiArtistGroupV442=useMemo(()=>multiArtistCastV442.enabled&&rapDanceAllowedV437&&track?.id?
    (smartShowAllowedV446&&!preferences.avatarManualVocalEnabledV385&&
      !(preferences.rapDuetEnabledV416&&track?.id&&
        (preferences.rapDuetAssignmentsV416??{})[track.id]?.length)?
      arrangeAutomaticGroupV446(planMultiArtistGroupV442({trackId:track.id,count:multiArtistCastV442.count as 3|4,lyrics,bpm:audio.bpm,
        modelIds:["","",...(preferences.rapMultiArtistExtraModelsV442??["",""])]}),smartShowPlanV446):
      planMultiArtistGroupV442({trackId:track.id,count:multiArtistCastV442.count as 3|4,lyrics,bpm:audio.bpm,
        modelIds:["","",...(preferences.rapMultiArtistExtraModelsV442??["",""])]})):null,
    [multiArtistCastV442.enabled,multiArtistCastV442.count,rapDanceAllowedV437,track?.id,lyrics,preferences.rapMultiArtistExtraModelsV442,Math.round(audio.bpm??0),smartShowAllowedV446,smartShowPlanV446,preferences.avatarManualVocalEnabledV385,
    preferences.rapDuetEnabledV416,preferences.rapDuetAssignmentsV416]);
  // V600: only replace automatically generated 3/4-performer formation cues.
  // The original GLB motion plan, singer assignments and manual group stay intact.
  const concertGroupV600=useMemo(()=>refineAutomaticConcertGroupV600(multiArtistGroupV442,concertArcPlanV600),
    [multiArtistGroupV442,concertArcPlanV600]);
  const concertGroupV604=useMemo(()=>refineAutomaticGroupV604(concertGroupV600,fullSongPlanV604,{
    enabled:preferences.smartConcertDirectorEnabledV568??true,
    reducedMotion:preferences.reducedMotion,tier:getActivePerformanceTier(),
  }),[concertGroupV600,fullSongPlanV604,preferences.smartConcertDirectorEnabledV568,preferences.reducedMotion,getActivePerformanceTier()]);
  // V609: only generated song-synced 3/4-artist cues may slightly extend their
  // existing V326 smoothstep transitions; authored group timelines never change.
  const concertGroupV609=useMemo(()=>refineAutoGroupTransitionsV609(concertGroupV604,fullSongPlanV604,{
    enabled:preferences.smartConcertDirectorEnabledV568??true,
    reducedMotion:preferences.reducedMotion,tier:getActivePerformanceTier(),
  }),[concertGroupV604,fullSongPlanV604,preferences.smartConcertDirectorEnabledV568,preferences.reducedMotion,getActivePerformanceTier()]);
  const smartShowCueV446=sampleSmartRapShowV446(smartShowPlanV446,progressMs,{
    enabled:smartShowAllowedV446,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    manualProtected:!rapDanceAllowedV437||preferences.avatarManualVocalEnabledV385===true||
      (preferences.rapDuetEnabledV416===true&&Boolean(track?.id&&
        (preferences.rapDuetAssignmentsV416??{})[track.id]?.length)),
    liveScene:rapPerformanceCueV437.active&&rapPerformanceCueV437.scene!=="none"?
      rapPerformanceCueV437.scene:rapMotionHookV437?"hook":directedSection,
  });
  // V460: a single VISUAL performer/response plan shared by motion, labels,
  // spotlight and cinematic framing. Existing explicit vocal/camera directions win.
  const baseFeatureDirectionV460=planIntelligentFeatureV460({
    plan:smartShowPlanV446,cue:smartShowCueV446,progressMs,count:performerCountV440,
    enabled:featureCastV440.enabled&&smartShowAllowedV446,playing:isPlaying,
    reducedMotion:preferences.reducedMotion,
    manualProtected:preferences.avatarManualVocalEnabledV385===true||
      Boolean(track?.id&&(preferences.rapDuetEnabledV416??false)&&
        (preferences.rapDuetAssignmentsV416??{})[track.id]?.length)||
      Boolean(track?.id&&(preferences.rapCameraKeyframesEnabledV432??false)&&
        (preferences.rapCameraKeyframesV432??{})[track.id]?.length),
  });
  const authoredCameraV456=Boolean(track?.id && preferences.rapCameraKeyframesEnabledV432 &&
    (preferences.rapCameraKeyframesV432??{})[track.id]?.length);
  const rawUltimateShowV456=planUltimateAutomaticShowV456({
    enabled:smartShowAllowedV446,
    playing:isPlaying,reducedMotion:preferences.reducedMotion,
    automaticDance:rapDanceAllowedV437,manualVocal:preferences.avatarManualVocalEnabledV385===true,
    manualCamera:authoredCameraV456,cue:smartShowCueV446,balance:attentionV456,
    count:performerCountV440,energy:audio.energyEnvelope??0,
  });
  // V457: smooth only automatic scene accents, using existing quality telemetry.
  // The full GLB dance and authored camera/keyframe systems remain unchanged.
  const continuityV457=planShowContinuityV457({direction:rawUltimateShowV456,
    plan:smartShowPlanV446,progressMs,trackId:track?.id??"",quality:getActivePerformanceTier()});
  // V464: long-form visual dramaturgy from the SAME bounded V446 timeline.
  // Only accent multipliers are altered: existing V456 camera choice, V460
  // feature credits, V457 transitions and all manual overrides stay authoritative.
  const concertExperienceV464Base=planAutomaticConcertExperienceV464({
    plan:smartShowPlanV446,progressMs,trackId:track?.id??"",playing:isPlaying,
    reducedMotion:preferences.reducedMotion,direction:continuityV457.direction,
    feature:baseFeatureDirectionV460,quality:continuityV457.quality,
  });
  // V478: one bounded visual arc for existing camera and reactive stage lights.
  // V454 camera holds, V451 lyrics protection, authored edits and user toggles
  // remain downstream; the song score and singer assignments are untouched.
  const concertExperienceV464=coordinateAutonomousConcertV478(concertExperienceV464Base,{
    cue:smartShowCueV446,plan:smartShowPlanV446,trackId:track?.id??"",progressMs,playing:isPlaying,
    reducedMotion:preferences.reducedMotion,enabled:smartShowAllowedV446,
    cameraEnabled:smartShowAllowedV446,manualCamera:authoredCameraV456,
    manualVocal:preferences.avatarManualVocalEnabledV385===true,
    quality:continuityV457.quality,lightingReactive:preferences.stageReactive??true,
  });
  const ultimateShowV456=concertExperienceV464.direction;
  const featureDirectionV460=concertExperienceV464.feature;
  const featureCueV440=featureChoreoCueV440({cast:featureCastV440,lyrics,progressMs,
    scene:smartShowCueV446.active?smartShowCueV446.motionScene:
      rapPerformanceCueV437.active&&rapPerformanceCueV437.scene!=="none"?rapPerformanceCueV437.scene:
      rapMotionHookV437?"hook":directedSection,
    phraseSlot:smartShowCueV446.active?smartShowCueV446.phrase:musicTimeline.phraseSlot??undefined,playing:isPlaying});
  const multiArtistFocusV442=multiArtistCastV442.enabled?
    featureFocusV442({count:performerCountV440,
      phrase:smartShowCueV446.active?smartShowCueV446.focus>=0?smartShowCueV446.focus:0:
        multiArtistPhraseAtV442(lyrics,progressMs,featureCueV440.phrase),scene:featureCueV440.scene}):null;
  // Performance slots are stage direction, never inferred individual vocal tracks.
  const motionSceneForSlotV442=(slot:number):MotionSceneV438=>multiArtistCastV442.enabled&&
    featureCueV440.scene!=="hook"&&featureCueV440.scene!=="duet"&&
    multiArtistFocusV442?.focus!==slot?"break":featureCueV440.scene;
  // Keep attention, motion ranking and stage choreography on the same show phrase.
  const smartMotionSceneForSlotV446=(slot:number):MotionSceneV438=>{
    const fallback:MotionSceneV438=smartShowCueV446.active?
      smartShowCueV446.group?smartShowCueV446.motionScene:
        smartShowCueV446.focus===slot?smartShowCueV446.motionScene:"break":motionSceneForSlotV442(slot);
    return featureMotionForSlotV460(featureDirectionV460,slot,
      motionForUltimateShowV456(ultimateShowV456,slot,fallback));
  };
  const smartMotionEnergyV446=(slot:number):number=>{
    const scene=smartMotionSceneForSlotV446(slot),energy=audio.energyEnvelope??0;
    const fallback=scene==="hook"||scene==="drop"?Math.max(.72,energy):scene==="break"?Math.min(.22,energy):energy;
    const base=ultimateShowV456.active?motionEnergyForContinuityV457(continuityV457,slot,energy):fallback;
    const directed=featureDirectionV460.active&&featureDirectionV460.moment==="reply"&&slot===featureDirectionV460.partner
      ?Math.min(continuityV457.quality==="low"?.36:.68,
          Math.max(base,(continuityV457.quality==="low"?.24:.42)+
            (continuityV457.quality==="low"?.08:.12)*featureDirectionV460.responseGain)):
      base;
    const motionEnergy=concertDynamicsEnergyV502(
      concertMotionEnergyV464(concertExperienceV464,directed,energy),directedDynamicsV604);
    return concertGenreV610.dance===1&&concertContinuityV611.dance===1?motionEnergy:
      Math.min(1,Math.max(0,motionEnergy*concertGenreV610.dance*concertContinuityV611.dance));
  };
  // V441: name tags follow artist credits, not a guessed microphone/singer identity.
  // Spotify credits + authored V416 stage ranges take priority over visual phrase alternation.
  const artistBubblePlanV441=featureBubblesV460(planArtistBubblesV441({
    enabled:preferences.artistNameBubblesV441??true,
    artists:featureCastV440.artists,visibleCount:performerCountV440,
    mode:preferences.artistBubbleModeV441??"focus",
    style:preferences.artistBubbleStyleV441??"comic",
    showSolo:preferences.artistBubbleSoloV441??true,
    progressMs,playing:isPlaying,
    scene:featureCueV440.scene,focusSlot:smartShowCueV446.active?smartShowCueV446.focus:
      multiArtistFocusV442?.focus??featureCueV440.focusSlot,
    phrase:featureCueV440.phrase,lyrics,
    authored:track?.id?(preferences.rapDuetAssignmentsV416??{})[track.id]??[]:[],
    authoredEnabled:preferences.rapDuetEnabledV416??false,
    manualVocalPriority:preferences.avatarManualVocalEnabledV385??false
  }),featureDirectionV460);
  // V465: automatic, visually inferred labels yield space to real synchronized lyrics
  // on crowded stages. Manual cast labels and explicitly 'always' labels are untouched.
  const visualQualityV465=planVisualShowQualityV465({
    playing:isPlaying,
    activeLyrics:!!preferences.lyricsVisible&&lyrics?.synced===true&&attentionV456.attention==='lyrics',
    immersiveLyrics:!!preferences.lyricsImmersiveEnabled&&preferences.visualizerMode==='avatar',
    count:performerCountV440,bubbles:artistBubblePlanV441,feature:featureDirectionV460,
  });
  // V443 visual direction is inferred only for the *automatic* V442 group.
  // Stored V416 vocal assignments and manual vocal control retain priority.
  const artistSpotlightPoseV443=concertGroupV609&&multiArtistCastV442.enabled?
    evaluateGroupV326(concertGroupV609,Math.max(0,progressMs)/1000):null;
  const artistSpotlightCueAtV443=concertGroupV609?.cues.find(c=>c.id===artistSpotlightPoseV443?.cueId)?.at??0;
  const artistSpotlightV443=featureSpotlightV460(planArtistSpotlightV443({pose:artistSpotlightPoseV443,
    count:performerCountV440,seconds:progressMs/1000,cueAt:artistSpotlightCueAtV443,
    enabled:(preferences.rapArtistSpotlightEnabledV443??true)&&!!concertGroupV609,
    playing:isPlaying,reducedMotion:preferences.reducedMotion,
    manualPriority:artistBubblePlanV441.source==="manual-stage"||
      !!preferences.avatarManualVocalEnabledV385,
    strength:preferences.rapArtistSpotlightStrengthV443??65}),featureDirectionV460);
  // Two independent motion clocks: stage slots never share selection history.
  const secondarySequenceV440=useRef(emptyDanceSequence());
  // Manual selection always wins. Automatic library sequencing changes only at phrase boundaries or hook boundaries.
  const combination=nextDanceCombination(sequenceRef.current,motionStore,{
    trackId:track?.id ?? "",avatarId:selectedAvatarId,genre:genre||"",bpm:musicTimeline.tempo ?? audio.bpm ?? undefined,
    progressMs,durationMs:track?.durationMs ?? 0,energy:audio.energyEnvelope ?? 0,fallback:avatarModel.animationUrl,detectedSection:rapMotionHookV437?"hook":directedSection,phraseSlot:musicTimeline.phraseSlot??undefined,
    eventSlot:rapMotionHookV437?`${danceEventV437}:rap-hook`:danceEventV437
  });
  // V438: automatic rap show keeps V242 as a fallback and never persists edits.
  // Manual choreographies, timelines, blending, disabled library and reduced motion win.
  const autoMotionEligibleV438=rapDanceAllowedV437&&rapGenreV437&&
    (preferences.rapAutoPerformanceEnabledV437??true)&&!preferences.reducedMotion&&
    preferences.visualizerMode==="avatar";
  const smartMotionV438=nextAutomaticRapShowV438(sequenceRef.current,motionStore,{
    enabled:(preferences.rapAutoMotionEnabledV438??true)&&autoMotionEligibleV438,
    manualProtected:!rapDanceAllowedV437,playing:isPlaying,reducedMotion:preferences.reducedMotion,
    trackId:track?.id??"",avatarId:selectedAvatarId,genre:genre||"",
    bpm:musicTimeline.tempo??audio.bpm??undefined,progressMs,durationMs:track?.durationMs??0,
    energy:smartMotionEnergyV446(0),
    scene:smartMotionSceneForSlotV446(0),
    phraseSlot:smartShowCueV446.active?smartShowCueV446.phrase:musicTimeline.phraseSlot??undefined,
    eventSlot:`${danceEventV437}:v438-${featureCueV440.eventKey}`,
    ...(smartShowCueV446.active?{eventSlot:smartShowCueV446.eventId}:{}),
    variety:preferences.rapAutoMotionVarietyV438??70,fallback:combination.url,motionProfilesV439,
  });
  const smartActiveV438=(preferences.rapAutoMotionEnabledV438??true)&&autoMotionEligibleV438&&
    motionStore.automatic && isPlaying;
  sequenceRef.current=smartActiveV438?smartMotionV438.state:combination.state;
  // V440: secondary performer receives its own motion ranking and phrase history.
  // This is visual choreography; never map a Spotify artist to a vocalist by guesswork.
  const autoChoreoV440=(preferences.rapAutoChoreographyV440??true)&&smartActiveV438;
  const secondaryMotionV440=nextAutomaticRapShowV438(secondarySequenceV440.current,motionStore,{
    enabled:autoChoreoV440&&featureCastV440.enabled,manualProtected:!rapDanceAllowedV437,
    playing:isPlaying,reducedMotion:preferences.reducedMotion,trackId:track?.id??"",
    avatarId:secondaryAvatarId,genre:genre||"",bpm:musicTimeline.tempo??audio.bpm??undefined,
    progressMs,durationMs:track?.durationMs??0,
    energy:smartMotionEnergyV446(1),
    scene:smartMotionSceneForSlotV446(1),
    phraseSlot:smartShowCueV446.active?smartShowCueV446.phrase:musicTimeline.phraseSlot??undefined,
    eventSlot:smartShowCueV446.active?`${smartShowCueV446.eventId}:slot-1`:`${danceEventV437}:v440-secondary-${featureCueV440.eventKey}`,
    variety:preferences.rapAutoMotionVarietyV438??70,
    fallback:secondaryAvatar.animationUrl,motionProfilesV439,
    avoidMotionId:smartMotionV438.chosen?.id,
  });
  secondarySequenceV440.current=secondaryMotionV440.state;
  const avatarAnimationUrl = smartActiveV438
    ? smartMotionV438.url
    : motionStore.automatic && isPlaying?combination.url
    : chooseCharacterMotion({...motionStore,automatic:false},selectedAvatarId,genre||"",audio.bpm??undefined,combination.section,avatarModel.animationUrl);
  // V442: independent phrase-scoped motion histories for stage slots 3 and 4.
  // Never changes the existing user's choreography, per-avatar asset or stored library.
  const extraSequencesV442=useRef([emptyDanceSequence(),emptyDanceSequence()]);
  const extraMotionsV442=[2,3].map((slot,index)=>{
    const avatarId=slot%2?secondaryAvatarId:selectedAvatarId;
    const candidate=nextAutomaticRapShowV438(extraSequencesV442.current[index],motionStore,{
      enabled:autoChoreoV440&&multiArtistCastV442.enabled&&slot<performerCountV440,
      manualProtected:!rapDanceAllowedV437,playing:isPlaying,reducedMotion:preferences.reducedMotion,
      trackId:track?.id??"",avatarId,genre:genre||"",bpm:musicTimeline.tempo??audio.bpm??undefined,
      progressMs,durationMs:track?.durationMs??0,
      energy:smartMotionEnergyV446(slot),
      scene:smartMotionSceneForSlotV446(slot),
      phraseSlot:smartShowCueV446.active?smartShowCueV446.phrase:musicTimeline.phraseSlot??undefined,
      eventSlot:smartShowCueV446.active?`${smartShowCueV446.eventId}:slot-${slot}`:`${danceEventV437}:v442-slot-${slot}-${featureCueV440.eventKey}`,
      variety:preferences.rapAutoMotionVarietyV438??70,
      fallback:slot%2?secondaryAvatar.animationUrl:avatarModel.animationUrl,motionProfilesV439,
      avoidMotionId:index===0?smartMotionV438.chosen?.id:secondaryMotionV440.chosen?.id,
    });
    extraSequencesV442.current[index]=candidate.state;
    return candidate.url;
  });
  const immersive = Boolean(preferences.lyricsVisible && preferences.lyricsImmersiveEnabled && lyrics?.lines.length && track);
  const side = preferences.lyricsImmersiveSide === "left" ? "left" : "right";
  const depth = Math.max(0, Math.min(100, preferences.lyricsImmersiveDepth ?? 45));
  const inCanvas = immersive && preferences.visualizerMode === "avatar";
  const lyricsScene: VisualizerProps["lyricsScene"] = inCanvas && lyrics ? {
    lyrics, progressMs, activeIndex, playing, side, depth, avatarCountV477:performerCountV440,
    colorFrom: preferences.lyricsGradientFrom ?? "#79f7ff",
    colorTo: preferences.lyricsGradientTo ?? "#d789ff",
    intensity: preferences.lyricsAnimationIntensity ?? 65,
    fontScale: resolveImmersiveLyricFontV648(preferences.lyricsFontSize ?? 100,!!kioskReadabilityV648,kioskReadabilityV648??"standard"),
    glow: preferences.lyricsGlow ?? 65,
    wordHighlight: preferences.lyricsWordHighlight ?? true,
    cinematicModeV378:preferences.avatarLyricsCameraModeV378??"off",
    cinematicStrengthV378:preferences.avatarLyricsCameraStrengthV378??70,
    cinematicContrastV378:preferences.avatarLyricsContrastV378??true,
    spatialLayoutV381:preferences.lyricsSpatialLayoutV381,
    kineticPresetV382:preferences.lyricsKineticPresetV382??"auto",kineticStrengthV382:preferences.lyricsKineticStrengthV382??65,
    kineticDropsV382:preferences.lyricsKineticDropsV382??true,genreV382:genre??"",
    concertLyricAccentV502:directedDynamicsV604.lyrics,cinematicSceneV528,
  } : undefined;
  return <section className={`immersive-stage ${immersive && (preferences.avatarLyricsCameraModeV378??"off")!=="off" ? "v378-lyrics-stage" : ""} ${immersive && !inCanvas ? "immersive-active" : ""} ${inCanvas ? "immersive-webgl" : ""} immersive-side-${side}`} style={{ "--immersive-depth": depth / 100 } as CSSProperties} aria-label={`${definition.label} visualization`} data-v456-moment={ultimateShowV456.moment} data-v457-quality={continuityV457.quality} data-v460-moment={featureDirectionV460.moment} data-v464-act={concertExperienceV464.act} data-v568-mode={smartConcertV568.mode} data-v568-evidence={smartConcertV568.evidence} data-v568-focus={smartConcertV568.focusSlot??"none"} data-v568-lyrics-protected={smartConcertV568.lyricsProtected?"yes":"no"} data-v502-genre={dynamicsV502.genre} data-v502-section-source={dynamicsV502.evidence} data-v478-shot={concertExperienceV464.visualV478.shot} data-v464-breathing={concertExperienceV464.breathing ? "yes" : "no"} data-v465-visual-mode={visualQualityV465.mode} data-v465-visible-labels={visualQualityV465.visibleLabels} data-v604-chapter={fullSongCueV604.chapter??"unclassified"} data-v604-motif={fullSongCueV604.motif??"none"} data-v604-act={fullSongCueV604.active?fullSongCueV604.act:-1} data-v629-beat={concertStoryV629.beat??"off"} data-v629-emphasis={concertStoryV629.emphasis??"off"} data-v629-hook={concertStoryV629.hookIndex} data-v628-moment={concertExperienceV628.moment} data-v628-motif={concertExperienceV628.motif??"none"} data-v628-repetition={concertExperienceV628.repetition} data-v642-focus={concertEditionV642.focus} data-v642-lane={concertEditionV642.leadLane} data-v642-act={concertEditionV642.act} data-v623-priority={concertDramaturgyV623.priority} data-v623-act={concertDramaturgyV623.act} data-v611-story={concertContinuityV611.moment} data-v611-act={concertContinuityV611.act} data-v611-repetition={concertContinuityV611.repetition} data-v641-track-id={track?.id??""} data-v641-duration-ms={track?.durationMs??0} data-v641-progress-ms={progressMs} data-v641-playing={isPlaying?"yes":"no"} data-v592-live-stage="true"><LiveStageDomProbeV592 trackId={track?.id??""} durationMs={track?.durationMs??0} progressMs={progressMs} playing={isPlaying} activeIndex={activeIndex} lyricsPresent={Boolean(lyrics?.lines?.length)} lyricsSynced={lyrics?.synced===true}/><Mode lipSync={{cinematicSceneV528,concertCameraArmedV454:smartShowAllowedV446&&!!track?.id,concertCameraCueV454:(featureDirectionV460.cameraCue??(ultimateShowV456.active?ultimateShowV456.cameraCue:smartShowCueV446))??undefined,concertCameraCastCountV454:performerCountV440,rapCameraCueV429,rapCameraArmedV429,rapCameraEnabledV429:preferences.rapCameraEnabledV429??false,rapCameraStrengthV429:preferences.rapCameraStrengthV429??65,rapCameraOverridesV430:rapCameraEditsV436, rapCameraTransitionsEnabledV433:(preferences.rapCameraTransitionsEnabledV433??false)||rapAutoFixActiveV436,rapCameraBeatSyncV433:rapAutoFixActiveV436?rapAutoFixPlanV436.settings.beatSync:(preferences.rapCameraBeatSyncV433??true),rapCameraTransitionSmoothnessV433:rapAutoFixActiveV436?rapAutoFixPlanV436.settings.smoothness:(preferences.rapCameraTransitionSmoothnessV433??55),rapCameraBpmV433:audio.bpm,rapCameraKickV433:audio.kickAccentIntensity??0,concertEnergyV610:audio.energyEnvelope??0,multiArtistCastCountV442:multiArtistCastV442.enabled?performerCountV440:undefined,rapCameraKeyframesEnabledV432:preferences.rapCameraKeyframesEnabledV432??false,rapCameraKeyframesV432:track?.id?(preferences.rapCameraKeyframesV432??{})[track.id]??[]:[], vocalCameraModeV401:preferences.avatarVocalCameraModeV401??"off",vocalCameraStrengthV401:preferences.avatarVocalCameraStrengthV401??55,cameraStudioV398:preferences.avatarCameraStudioV398,cameraTimelineV400:preferences.avatarCameraTimelineV400,visualDirectorModeV397:preferences.avatarVisualDirectorModeV397??"off",visualDirectorStrengthV397:preferences.avatarVisualDirectorStrengthV397??65,visualDirectorTierV397:getActivePerformanceTier(),performanceModeV393:chooseExperienceModeV396(preferences.avatarVocalPerformanceModeV393??"off",sharedExperienceCueV402.vocalMode,sharedExperienceCueV402),performanceStrengthV393:preferences.avatarVocalPerformanceModeV393&&preferences.avatarVocalPerformanceModeV393!=="off"?(preferences.avatarVocalPerformanceStrengthV393??55):sharedExperienceCueV402.active?Math.round(60*sharedExperienceCueV402.vocalGain):preferences.avatarVocalPerformanceStrengthV393??55,expressiveFaceEnabledV390:preferences.avatarExpressiveFaceEnabledV390??false,expressiveFaceStrengthV390:preferences.avatarExpressiveFaceStrengthV390??45,reducedMotionV390:preferences.reducedMotion,lyrics: lyrics ?? null,progressMs,playing,enabled:(preferences.avatarLipSyncEnabled ?? true) && !preferences.reducedMotion,strength:rapLipStrengthV408(preferences.avatarLipSyncStrength ?? 90,preferences.rapPerformanceEditorV408),mode:preferences.avatarLipSyncMode ?? "lyrics",style:rapPerformanceCueV437.active&&(preferences.avatarVocalStyleV368??"auto")==="auto"?"rap":preferences.avatarVocalStyleV368??"auto",expression:rapPerformanceValuesV437.face,jawFollowV369:preferences.avatarJawFollowV369 ?? 65,profilesV370:preferences.avatarFacialProfilesV370 ?? {},cameraModeV369:preferences.avatarVocalCameraV369 ?? "auto",cameraStrengthV369:preferences.avatarVocalCameraStrengthV369 ?? 55,bodyEnabledV371:preferences.avatarVocalBodyEnabledV371 ?? true,bodyStrengthV371:rapPerformanceValuesV437.gesture,eyeContactV371:preferences.avatarVocalEyeContactV371 ?? true,gesturesV371:preferences.avatarVocalGesturesV371 ?? true,coordinationEnabledV372:preferences.avatarVocalCoordinationEnabledV372 ?? true,coordinationStrengthV372:preferences.avatarVocalCoordinationStrengthV372 ?? 70,coordinationOffsetMsV372:preferences.avatarVocalCoordinationOffsetMsV372 ?? 0,qualityEnabledV374:preferences.avatarVocalQualityEnabledV374 ?? true,mouthSmoothnessV374:preferences.avatarVocalMouthSmoothnessV374 ?? 65,rapLipEnabledV415:rapPerformanceValuesV437.rapLip,rapLipPrecisionV415:preferences.avatarRapLipPrecisionV415??70,rapSyllableEnabledV419:preferences.avatarRapSyllableEnabledV419??false,rapSyllableStrengthV419:preferences.avatarRapSyllableStrengthV419??65,rapSyllableSmoothnessV419:preferences.avatarRapSyllableSmoothnessV419??70,rapSyllableEditsEnabledV420:preferences.rapSyllableEditsEnabledV420??false,rapSyllableTrackIdV420:track?.id??"",rapSyllableDocumentV420:track?.id?(preferences.rapSyllableDocumentsV420??{})[track.id]??null:null,rapAudioEnabledV423:preferences.rapAudioEnabledV423??false,rapAudioStrengthV423:preferences.rapAudioStrengthV423??45,rapAudioOffsetMsV423:preferences.rapAudioOffsetMsV423??0,rapAudioTrackIdV423:track?.id??"",rapAudioDocumentV423:track?.id?(preferences.rapAudioDocumentsV423??{})[track.id]??null:null,rapLipOffsetMsV415:preferences.rapTimingLiveEnabledV418?preferences.rapTimingOffsetsV418?.mouthMs??0:preferences.avatarRapLipOffsetMsV415??0,rapGestureCalmV374:preferences.avatarVocalRapGestureCalmV374 ?? 70,naturalArticulationEnabledV384:preferences.avatarNaturalArticulationEnabledV384 ?? true,articulationStrengthV384:preferences.avatarArticulationStrengthV384 ?? 70,lipSealV384:preferences.avatarLipSealV384 ?? 90,jawStabilityV384:preferences.avatarJawStabilityV384 ?? 65,ensembleModeV374:preferences.avatarVocalEnsembleModeV374 ?? "lead",performanceModeV375:preferences.avatarAdaptivePerformanceModeV375 ?? "off",performanceStrengthV375:preferences.avatarAdaptivePerformanceStrengthV375 ?? 65,concertModeV386:preferences.avatarConcertDirectorModeV386??"off",concertStrengthV386:preferences.avatarConcertDirectorStrengthV386??65,concertCameraV386:preferences.avatarConcertDirectorCameraV386??true,concertLightingV386:preferences.avatarConcertDirectorLightingV386??true,rapTimingLiveEnabledV418:preferences.rapTimingLiveEnabledV418??false,rapRoleOffsetMsV418:preferences.rapTimingOffsetsV418?.roleMs??0,rapDuetEnabledV416:preferences.rapDuetEnabledV416??false,rapDuetCameraV416:preferences.rapDuetCameraV416??true,rapDuetTrackIdV416:track?.id,rapDuetAssignmentsV416:track?.id?(preferences.rapDuetAssignmentsV416??{})[track.id]??[]:[],vocalTimeEnabledV496:preferences.vocalTimeEnabledV496??false,vocalTimeTrackIdV496:track?.id??"",vocalTimeSegmentsV496:track?.id?(preferences.vocalTimeSegmentsV496??{})[track.id]??[]:[],manualVocalEnabledV385:preferences.avatarManualVocalEnabledV385??false,manualVocalCameraV385:preferences.avatarManualVocalCameraV385??true,manualVocalAssignmentsV385:track?.id?(preferences.avatarVocalAssignmentsV385??{})[track.id]??[]:[],manualVocalTrackIdV385:track?.id,duetModeV376:preferences.avatarVocalDuetModeV376??"off",duetStrengthV376:preferences.avatarVocalDuetStrengthV376??60,cinematicDuetCameraModeV377:preferences.avatarDuetCameraModeV377??"off",cinematicDuetCameraStrengthV377:preferences.avatarDuetCameraStrengthV377??65,cinematicLyricsModeV378:preferences.avatarLyricsCameraModeV378??"off",cinematicLyricsStrengthV378:preferences.avatarLyricsCameraStrengthV378??70,cinematicLyricsSideV378:immersive?side:null,cinematicLyricsVisibleV378:immersive,}} concertDetailsV555={{enabled:preferences.concertDetailEnabledV555??DEFAULT_CONCERT_DETAILS_V555.enabled,gobo:preferences.concertGoboV555??true,pixelWall:preferences.concertPixelWallV555??true,floorFog:preferences.concertFloorFogV555??true,duetArc:preferences.concertDuetArcV555??true,adlibEcho:preferences.concertAdlibEchoV555??true,hookProjection:preferences.concertHookProjectionV555??true,rhymeAccent:preferences.concertRhymeAccentV555??true,strength:preferences.concertDetailStrengthV555??45,avatarLight:preferences.concertAvatarLightV557??true,avatarLightStrength:preferences.concertAvatarLightStrengthV557??55,portraitLight:preferences.concertPortraitLightV558??true,portraitWarmth:preferences.concertPortraitWarmthV558??52,beatPortraitLight:preferences.concertBeatPortraitLightV559??true,beatPortraitStrength:preferences.concertBeatPortraitStrengthV559??45,cinematicFaceLightV566:preferences.concertCinematicFaceLightV566??true,cinematicFaceStrengthV566:preferences.concertCinematicFaceStrengthV566??50}} lyricsScene={lyricsScene} lyricsSignalV350={{active:!!preferences.lyricsVisible&&hasActiveLyricsV350(lyrics,activeIndex,progressMs),side:immersive?side:null}} audio={audio} track={track} isPlaying={isPlaying} reducedMotion={preferences.reducedMotion} genre={genre} genreFusion={genreFusion} avatarModelUrl={preferences.visualizerMode === "avatar" ? avatarModelUrl : null} avatarModelId={selectedAvatarId} multiAvatarMode={effectiveMultiModeV440} duoDirectorEnabled={preferences.duoDirectorEnabled ?? false} partnerContactCalibration={preferences.partnerContactCalibration} secondaryContactCalibration={preferences.secondaryContactCalibration} secondaryAvatarModelId={secondaryAvatarId} secondaryAvatarModelUrl={secondaryAvatar.url} secondaryAvatarAnimationUrl={secondaryAvatar.animationUrl} secondaryAvatarSharedMotionUrlV531={secondaryAvatar.sharedMotionUrl} preferredMotionUrlV440={autoChoreoV440?smartMotionV438.url:undefined} secondaryPreferredMotionUrlV440={autoChoreoV440&&featureCastV440.enabled?secondaryMotionV440.url:undefined} artistBubblePlanV441={visualQualityV465.bubbles} artistSpotlightV443={artistSpotlightV443} featureDirectionV460={featureDirectionV460} artistInteractionEnabledV444={preferences.rapArtistInteractionEnabledV444??true} artistInteractionStrengthV444={Math.min(100,Math.round((preferences.rapArtistInteractionStrengthV444??60)*ultimateShowV456.interactionMultiplier))} vocalChangeEnabledV445={preferences.rapVocalChangeEnabledV445??true} vocalChangeSensitivityV445={preferences.rapVocalChangeSensitivityV445??60} vocalChangeMicrophoneActiveV445={microphoneActiveV445} autoMultiArtistGroupV442={concertGroupV609} multiArtistMotionsV442={multiArtistCastV442.enabled&&autoChoreoV440?[smartMotionV438.url,secondaryMotionV440.url,...extraMotionsV442]:undefined} secondaryDancePreset={preferences.secondaryDancePreset ?? "auto"} avatarAnimationUrl={preferences.visualizerMode === "avatar" ? avatarAnimationUrl : null} avatarSharedMotionUrlV531={preferences.visualizerMode === "avatar" ? avatarModel.sharedMotionUrl : null} avatarScale={preferences.avatarScale} avatarOffsetY={preferences.avatarOffsetY} avatarAnimationIntensity={concertDynamicsPercentV502(rapPerformanceValuesV437.intensity,directedDynamicsV604.dance)*(motionStore.automatic?concertGenreV610.dance:1)*(motionStore.automatic?concertContinuityV611.dance:1)*(motionStore.automatic?concertDramaturgyV623.dance:1)} danceAggression={rapPerformanceValuesV437.aggression} danceVariation={rapPerformanceValuesV437.variation} danceMotionStyle={rapPerformanceValuesV437.style} avatarMotionMode={preferences.avatarMotionMode} smartDanceEnabled={preferences.smartDanceEnabled} smartDanceOverride={preferences.smartDanceOverride} avatarClipSpeed={preferences.avatarClipSpeed} avatarBlendEnabled={preferences.avatarBlendEnabled} avatarBlendClip={preferences.avatarBlendClip} avatarBlendWeight={preferences.avatarBlendWeight} avatarBlendAutoEnergy={preferences.avatarBlendAutoEnergy} avatarBlendBpmSync={preferences.avatarBlendBpmSync} avatarBlendReferenceBpm={preferences.avatarBlendReferenceBpm} avatarBlendSmoothing={preferences.avatarBlendSmoothing} avatarBlendCurve={preferences.avatarBlendCurve} avatarBlendSpeed={preferences.avatarBlendSpeed} avatarBlendMask={preferences.avatarBlendMask ?? "full"} avatarCrossfadeSeconds={preferences.avatarCrossfadeSeconds} avatarArmResponse={preferences.avatarArmResponse} avatarLegResponse={preferences.avatarLegResponse} avatarFootIKEnabled={preferences.avatarFootIKEnabled} avatarFootIKStrength={preferences.avatarFootIKStrength} avatarFootIKContact={preferences.avatarFootIKContact} avatarFootIKLock={preferences.avatarFootIKLock} stagePalette={stageContentV330.musicPalette??stagePalette} stageScreenV330={stageContentV330.item} stageScreensV333={screenLayoutV333.screens} stageLayoutEnabledV333={screenLayoutV333.enabled} stageSlidesV333={stageContentV330.slides} stageLivePushV333={stageContentV330.livePush} stageRotationIndexV333={stageContentV330.rotationIndex} stageScreenSettingsV330={stageContentV330.settings} stageTheme={directedStage} showCue={showEnabled ? directedShowCue : undefined} concertShowCueV387={concertShowCueV387} festivalShowCueV394={festivalShowCueV394} experienceCueV396={sharedExperienceCueV402}
      festivalShowCameraV394={(preferences.avatarFestivalCameraV394??true) && (!unifiedCueV402.active || (preferences.avatarFestivalModeV394??"off")!=="off" || experienceCueV396.active || unifiedCueV402.camera)}
      festivalShowLightingV394={(preferences.avatarFestivalLightingV394??true) && (!unifiedCueV402.active || (preferences.avatarFestivalModeV394??"off")!=="off" || experienceCueV396.active || unifiedCueV402.lighting)}
      festivalShowAtmosphereV394={(preferences.avatarFestivalAtmosphereV394??true) && (!unifiedCueV402.active || (preferences.avatarFestivalModeV394??"off")!=="off" || experienceCueV396.active || unifiedCueV402.lighting)}
      festivalShowLasersV394={preferences.avatarFestivalLasersV394??false}
      concertShowCameraV387={(preferences.avatarShowCameraV387??true) && (!unifiedCueV402.active || (preferences.avatarShowModeV387??"off")!=="off" || experienceCueV396.active || unifiedCueV402.camera)}
      concertShowLightingV387={(preferences.avatarShowLightingV387??true) && (!unifiedCueV402.active || (preferences.avatarShowModeV387??"off")!=="off" || experienceCueV396.active || unifiedCueV402.lighting)}
      concertShowAtmosphereV387={(preferences.avatarShowAtmosphereV387??true) && (!unifiedCueV402.active || (preferences.avatarShowModeV387??"off")!=="off" || experienceCueV396.active || unifiedCueV402.lighting)} cameraDirectorEnabled={showEnabled && directedShowCue.cameraEnabled || directorSettings.enabled && directorSettings.realCamera} cameraDirectorIntensity={concertDynamicsPercentV502(showEnabled && directedShowCue.cameraEnabled ? showSettings.intensity : directorSettings.cameraIntensity,directedDynamicsV604.camera)} cameraDirectorSection={directedSection} cameraDirectorProgressMs={progressMs} cameraNarrativeV605={{plan:fullSongPlanV604,cue:fullSongCueV604,manualCamera:Boolean(preferences.avatarCameraTimelineV400?.enabled||preferences.avatarCameraStudioV398?.enabled||track?.id&&preferences.rapCameraKeyframesEnabledV432&&(preferences.rapCameraKeyframesV432??{})[track.id]?.length)}} stageReactive={preferences.stageReactive ?? true} stageLightStrength={concertDynamicsPercentV502(lightStrengthForUltimateShowV456(ultimateShowV456,preferences.stageLightStrength??60,preferences.stageReactive??true),directedDynamicsV604.lighting)} dancePostEnabledV468={preferences.dancePostEnabledV468??true} shaderEnvironmentV468={preferences.shaderEnvironmentV468??'auto'} wardrobeModeV468={preferences.wardrobeModeV468??'album'} wardrobeColorV468={preferences.wardrobeColorV468??'#de38fa'} wardrobePatternV468={preferences.wardrobePatternV468??'original'} wardrobeGlowV468={preferences.wardrobeGlowV468??35} audioMotionEnabledV468={preferences.audioMotionEnabledV468??true} audioMotionStrengthV468={preferences.audioMotionStrengthV468??45} danceFxEnabled={preferences.danceFxEnabled} danceFxStrength={preferences.danceFxStrength} danceFxShockwaves={preferences.danceFxShockwaves} danceFxFootprints={preferences.danceFxFootprints} danceFxTrails={preferences.danceFxTrails} avatarRigProfile={preferences.avatarRigProfile} avatarDancePreset={preferences.avatarDancePreset} />{(directorSettings.enabled || showEnabled) && !preferences.reducedMotion && preferences.visualizerMode === "avatar" && stageDirectorRef.current.lastChangeMs > 0 && (!showEnabled || showStateRef.current.changeAtMs >= 0 && progressMs - showStateRef.current.changeAtMs < 10000) && (showEnabled || directorSettings.cinematic
    ? <CinematicStageTransitionV288 key={`${stageDirectorRef.current.trackId}:${directedStage}:${stageDirectorRef.current.lastChangeMs}`} stage={directedStage} section={directedSection} durationMs={directorSettings.transitionMs} cameraMotion={directorSettings.cameraMotion} dropFlash={showEnabled ? directedShowCue.accent > 0.05 : directorSettings.dropFlash} />
    : <div key={`${stageDirectorRef.current.trackId}:${directedStage}:${stageDirectorRef.current.lastChangeMs}`} className="stage-director-transition-v287" style={{ animationDuration: `${directorSettings.transitionMs}ms` }} aria-hidden="true" />)}{preferences.visualizerMode === "avatar" && stagePalette && <LightingChoreographyStudio trackId={track?.id ?? ""} durationMs={track?.durationMs ?? 0} positionMs={progressMs} audio={audio} isPlaying={isPlaying} />}{immersive && !inCanvas && <div className={`immersive-lyrics-overlay v461-immersive-overlay ${preferences.avatarLyricsContrastV378??true?"v378-lyrics-contrast":""}`}><KineticLyrics lyrics={lyrics ?? null} progressMs={progressMs} activeIndex={activeIndex} playing={playing} genre={genre??""} avatarCountV477={performerCountV440} concertLyricAccentV502={directedDynamicsV604.lyrics} cinematicSceneV528={cinematicSceneV528} sectionCueV598={directedSection === "hook" ? "hook" : "unknown"} fullSongCueV604={fullSongCueV604} concertDramaturgyV623={concertDramaturgyV623} immersive/></div>}{inCanvas && <span className="sr-only" aria-live="off">{lyrics?.lines[activeIndex]?.text ?? ""}</span>}{preferences.visualizerMode === "avatar" && <IntelligentConcertTimelineV646
   trackId={track?.id??""} durationMs={track?.durationMs??0} progressMs={progressMs}
   playing={isPlaying} arc={concertArcPlanV600} narrative={fullSongPlanV604} confirmed={concertArcV600}
   vocal={track?.id?(preferences.vocalTimeSegmentsV496??{})[track.id]:[]}
   vocalEnabled={preferences.vocalTimeEnabledV496===true} avatarCount={performerCountV440}
 />}</section>;
}
