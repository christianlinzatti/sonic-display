"use client";

import {composeConcertSceneCameraV528} from "./cinematicConcertCoordinationV528";
import {readConcertStageSyncV882} from './concertStageSyncV882';
import {sampleDirectorV895,DEFAULT_DIRECTOR_V895} from './aiConcertDirectorV895';
import {sampleUltimateV900,DEFAULT_ULTIMATE_V900} from './ultimateConcertExperienceV900';
import {sampleEnergyV896,readEnergyV896,DEFAULT_ENERGY_V896} from './musicalEnergyIntelligenceV896';
import {sampleCinematicCameraV897,DEFAULT_CAMERA_V897} from './cinematicCameraDirectorV897';
import {sampleCinemaV992,createCinemaStateV992,DEFAULT_CINEMA_V992} from './cinematicCameraDirectorV992';
import {sampleDanceCameraV898,measureAnchorMotionV898,DEFAULT_DANCE_CAMERA_V898} from './danceCameraCoordinationV898';
import {sampleDanceShowV899,DEFAULT_DANCE_SHOW_V899} from './advancedDanceShowDirectorV899';
import {sampleEpicDropV892,DEFAULT_EPIC_DROP_V892} from './epicDropExperienceV892';
import {sampleCinematicTransitionV884,DEFAULT_CINEMATIC_TRANSITIONS_V884} from './cinematicConcertTransitionsV884';
import {composeMultiVocalSpotlightCameraV797,type MultiVocalSpotlightCueV797} from "./multiVocalSpotlightDirectorV797";
import {composeIntelligentEnsembleCameraV806} from "./intelligentEnsembleCameraV806";
import {composeCinematicPerformerHarmonyV809} from "./cinematicPerformerCameraHarmonyV809";
import {composeIntelligentVocalDuetCameraV838,type VocalDuetPlanV838} from "./intelligentVocalDuetDirectorV838";
import {composeCinematicCameraDirectorV848} from "./cinematicCameraDirectorV848";
import {composeConcertCameraV540} from "./cinematicCameraCompositionV540";
import {composeCinematicConcertCameraV550} from "./cinematicConcertCameraV550";
import {planConcertLyricsHarmonyV606,composeConcertHarmonyCameraV606,activeLyricLineV606} from "./concertLyricsPerformerHarmonyV606";
import {composeFullSongCameraV605} from "./cinematicFullSongCameraV605";
import {planGenreConcertV610} from "./genreConcertExperienceV610";
import {planContinuousConcertV611} from "./continuousConcertExperienceV611";
import {composeConcertShotPacingV613} from "./concertShotPacingV613";
import {planUltimateConcertDramaturgyV623} from "./ultimateConcertDramaturgyV623";
import {composeIntelligentCameraV620} from "./intelligentCameraCompositionV620";
import {planCinematicCameraV633,composeCinematicCameraV633,type DirectorOptionsV633} from "./cinematicCameraDirectorV633";
import {planSeamlessConcertTransitionV609} from "./seamlessConcertTransitionsV609";
import type {SceneTransitionCueV791} from "./seamlessSceneTransitionsV791";
import {composeSmartCameraChoreographyV792,type CameraChoreographyCueV792} from "./smartCameraChoreographyV792";
import type {ConcertFlowCueV654} from "./intelligentConcertFlowV654";
import {advanceNaturalCameraV655,composeNaturalCameraV655,initialNaturalCameraStateV655} from "./naturalConcertCameraV655";
import {advanceCameraVarietyV682,composeCameraVarietyV682,initialVarietyStateV682} from "./cinematicCameraVarietyV682";
import {advancePerformanceCameraV747,composePerformanceCameraV747,initialPerformanceCameraStateV747} from "./performanceCameraDirectorV747";
import type {NarrativePlanV604,NarrativeCueV604} from "./fullSongConcertDramaturgyV604";
import {composeCinematicDuetInteractionV585} from "./cinematicDuetInteractionV585";
import {frameMultiArtistCameraV442} from "./multiArtistCameraV442";
import {planConcertCameraV454,holdConcertCameraV454,composeConcertCameraV454,newConcertCameraHoldV454} from "./cinematicConcertCameraV454";
import {applyRapCameraShotV430} from "./rapCameraShotStudioV430";
import {newRapCameraHoldV429,planRapCameraV429,advanceRapCameraHoldV429,composeRapCameraV429} from "./cinematicRapCameraV429";
import {composeRapCameraKeyframeV432} from "./rapCameraKeyframesV432";
import {advanceRapCameraTransitionV433,newRapCameraTransitionStateV433} from "./smartRapCameraTransitionsV433";
import type {GenreVisualCueV352} from "@/services/stageContent/genreVisualDirectorV352";
import {guardAutomaticCameraV351,type SmartStageCueV351} from "@/services/stageContent/smartStageCompositionV351";
import {directCameraV354,type ShowTimelineCueV354} from "@/services/stageContent/showTimelineV354";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { LIVE_CAMERA_EDIT_COMMAND_EVENT, normalizeLiveCameraEditCommand } from "./liveCameraEditingV302";
import type { CameraPose } from "./stageCameraPoseHelpersV289";
import { applyManualCameraMode, readManualCameraMode, CAMERA_STUDIO_MODE_EVENT, CAMERA_STUDIO_STATUS_EVENT, type ManualCameraMode } from "./cameraStudioHelpersV299";
import { Vector3, Box3, type PerspectiveCamera } from "three";
import type {VisualizerProps} from "./registry";
import {planVocalCameraV369,composeVocalCameraV369,approachVocalFocusV369,holdVocalShotV369,newVocalShotHoldV369} from "./vocalCameraV369";
import {sampleVocalFaceYV369} from "./vocalFaceAnchorV369";
import {resolveDuetInteractionV376} from "./interactiveVocalDuetsV376";
import {resolveManualVocalCueV385,applyManualVocalCueV385} from "./manualVocalCastingV385";
import {resolveRapDuetCueV416,applyRapDuetInteractionV416,toVocalCueV416} from "./rapDuetStudioV416";
import {resolveVocalTimeCueV496} from "./vocalTimeDirectorV496";
import {composeCinematicConcertCameraV497,type CinematicConcertCueV497} from "./cinematicConcertChoreographyV497";
import {composeFestivalCameraV394,type FestivalShowCueV394} from "./festivalShowDirectorV394";
import {initialVisualDirectorV397,advanceVisualDirectorV397,composeVisualPerformanceV397,timedLineV397} from "./visualPerformanceDirectorV397";
import {normalizeCameraStudioV398,tuneCameraPoseV398,chooseCameraShotV398} from "./cameraPerformanceStudioV398";
import {normalizeCameraTimelineV400,activeCameraCueV400,composeCameraTimelineV400} from "./cinematicCameraTimelineV400";
import {advanceVocalCameraV401,initialVocalCameraStateV401,composeVocalCameraV401} from "./vocalCameraIntelligenceV401";
import {composeConcertShowCameraV387,type ConcertShowCueV387} from "./concertShowDirectorV387";
import {resolveConcertCueV386} from "./expressiveConcertDirectorV386";
import {planCinematicDuetCameraV377,holdCinematicDuetShotV377,newDuetCameraHoldV377,composeCinematicDuetCameraV377,type CameraAnchorV377} from "./cinematicDuetCameraV377";
import type { StageSection } from "./stageDirectorV287";
import {planCinematicLyricsV378,composeCinematicLyricsCameraV378} from "./cinematicLyricsCompositionV378";
import { readCameraPresets, resolveCameraPose, CAMERA_PRESET_EVENT } from "./cameraPresetLibraryV290";
import { readCameraKeyframes, CAMERA_KEYFRAMES_EVENT, type CameraKeyframe } from "./cameraKeyframesV295";
import { TRACKING_ROOT_NAME, SMART_CAMERA_TRACKING_EVENT, readSmartCameraTrackingEnabled, frameTrackedAvatar } from "./smartCameraTrackingV297";
import { composeCameraPose, readSmartCameraComposer, SMART_CAMERA_COMPOSER_EVENT } from "./smartCameraComposerV298";
import { readLiveCameraKeyframesEnabled, resolveLiveCameraKeyframePose, LIVE_CAMERA_KEYFRAMES_EVENT } from "./liveCameraKeyframesV296";
import { showCameraPose } from "./showCameraV306";
import type { ShowCue } from "./ultimateShowDirectorV306";
import { CAMERA_PATH_EVENT, readCameraPathSettings, type CameraPathSettings } from "./cinematicCameraPathsV305";
/** Drives the existing R3F camera only; avoids a second Canvas or React updates per frame. */
export function StageCameraDirectorV289({ section, progressMs, intensity, playing, reducedMotion, duo, showCue, concertShowCueV387, concertShowCameraV387=true, festivalShowCueV394,festivalShowCameraV394=true, composition, genreCue, timelineCue, lipSync, genre, cinematicCueV497, cameraNarrativeV605, concertFlowV654, transitionV791, choreographyV792, vocalSpotlightV797, vocalDuetV838 }: {
  section: StageSection; progressMs: number; intensity: number; playing: boolean; reducedMotion: boolean; duo: boolean; showCue?: ShowCue; concertShowCueV387?:ConcertShowCueV387; concertShowCameraV387?:boolean;festivalShowCueV394?:FestivalShowCueV394;festivalShowCameraV394?:boolean; composition?:SmartStageCueV351; genreCue?:GenreVisualCueV352; timelineCue?:ShowTimelineCueV354; lipSync?:VisualizerProps["lipSync"];genre?:string|null;cinematicCueV497?:CinematicConcertCueV497;cameraNarrativeV605?:{plan:NarrativePlanV604;cue:NarrativeCueV604;manualCamera:boolean};concertFlowV654?:ConcertFlowCueV654;transitionV791?:SceneTransitionCueV791;choreographyV792?:CameraChoreographyCueV792;vocalSpotlightV797?:MultiVocalSpotlightCueV797;vocalDuetV838?:VocalDuetPlanV838;
}) {
  const camera = useThree(state => state.camera as PerspectiveCamera);
  const liveEditPose = useRef<CameraPose|null>(null);
  useEffect(()=>{
    const onCommand=(event:Event)=>{
      const command=normalizeLiveCameraEditCommand((event as CustomEvent<unknown>).detail);
      if(!command)return;
      liveEditPose.current=command.kind==="stop"?null:command.pose;
    };
    window.addEventListener(LIVE_CAMERA_EDIT_COMMAND_EVENT,onCommand);
    return ()=>window.removeEventListener(LIVE_CAMERA_EDIT_COMMAND_EVENT,onCommand);
  },[]);
  const scene = useThree(state => state.scene);
  const cinemaStateV992=useRef(createCinemaStateV992());
  const trackingEnabled = useRef(false);
  const manualMode = useRef<ManualCameraMode>("auto");
  const statusInterval = useRef(0);
  useEffect(()=>{const sync=()=>{manualMode.current=readManualCameraMode();};sync();window.addEventListener(CAMERA_STUDIO_MODE_EVENT,sync);return ()=>window.removeEventListener(CAMERA_STUDIO_MODE_EVENT,sync);},[]);
  const composerSettings = useRef(readSmartCameraComposer());
  const sampleDelay = useRef(0);
  const observedBounds = useRef<{centerX:number;centerY:number;width:number;height:number}|null>(null);
  const boundsBox = useRef(new Box3());
  const boundsCenter = useRef(new Vector3());
  const boundsSize = useRef(new Vector3());
  const origin = useRef({x:0,y:.1,z:duo?5.9:4.2,fov:38});
  const target = useRef(new Vector3());
  const vocalFocusV369=useRef(0);
  const holdV369=useRef(newVocalShotHoldV369());
  const faceSampleV369=useRef<{value:number|null;remaining:number}>({value:null,remaining:0});
  const duetCameraHoldV377=useRef(newDuetCameraHoldV377());
  const visualDirectorV397=useRef(initialVisualDirectorV397());
  const lastCameraCueV400=useRef("");
  const vocalCameraStateV401=useRef(initialVocalCameraStateV401());
  const rapCameraHoldV429=useRef(newRapCameraHoldV429());
  const concertCameraHoldV454=useRef(newConcertCameraHoldV454());
  const naturalCameraStateV655=useRef(initialNaturalCameraStateV655());
  const cameraVarietyStateV682=useRef(initialVarietyStateV682());
  const performanceCameraStateV747=useRef(initialPerformanceCameraStateV747());
  const rapCameraTransitionV433=useRef(newRapCameraTransitionStateV433());
  const studioProfileV398=useMemo(()=>normalizeCameraStudioV398(lipSync?.cameraStudioV398),[lipSync?.cameraStudioV398]);
  const cameraTimelineV400=useMemo(()=>normalizeCameraTimelineV400(lipSync?.cameraTimelineV400),[lipSync?.cameraTimelineV400]);
  const duetAnchorSampleV377=useRef<{remaining:number;anchors:CameraAnchorV377[];trackId:string}>({remaining:0,anchors:[],trackId:""});
  const danceMotionV898=useRef<{trackId:string;positionMs:number;motion:number;lastSampleMs:number}>({trackId:"",positionMs:-1,motion:0,lastSampleMs:-1});
  const anchorPositionV377=useRef(new Vector3());
  const library = useRef(readCameraPresets());
  const liveEnabled = useRef(readLiveCameraKeyframesEnabled());
  const motionFrames = useRef<Record<string, CameraKeyframe[]>>({});
  const cinematicPaths = useRef<Record<string, CameraPathSettings>>({});
  useEffect(() => {
    const refreshFrames = () => {
      library.current = readCameraPresets();
      motionFrames.current = Object.fromEntries(library.current.presets.map(p => [p.id, readCameraKeyframes(p.id)]));
      cinematicPaths.current = Object.fromEntries(library.current.presets.map(p => [p.id, readCameraPathSettings(p.id)]));
      liveEnabled.current = readLiveCameraKeyframesEnabled();
    };
    refreshFrames();
    window.addEventListener(CAMERA_PRESET_EVENT, refreshFrames);
    window.addEventListener(CAMERA_KEYFRAMES_EVENT, refreshFrames);
    window.addEventListener(CAMERA_PATH_EVENT, refreshFrames);
    window.addEventListener(LIVE_CAMERA_KEYFRAMES_EVENT, refreshFrames);
    return () => {
      window.removeEventListener(CAMERA_PRESET_EVENT, refreshFrames);
      window.removeEventListener(CAMERA_KEYFRAMES_EVENT, refreshFrames);
      window.removeEventListener(CAMERA_PATH_EVENT, refreshFrames);
      window.removeEventListener(LIVE_CAMERA_KEYFRAMES_EVENT, refreshFrames);
    };
  }, []);
  useEffect(() => {
    const refresh = () => { library.current = readCameraPresets(); };
    window.addEventListener(CAMERA_PRESET_EVENT, refresh);
    return () => window.removeEventListener(CAMERA_PRESET_EVENT, refresh);
  }, []);
  useEffect(() => {
    const refreshComposer=()=>{composerSettings.current=readSmartCameraComposer();};
    window.addEventListener(SMART_CAMERA_COMPOSER_EVENT,refreshComposer);
    return ()=>window.removeEventListener(SMART_CAMERA_COMPOSER_EVENT,refreshComposer);
  },[]);
  useEffect(() => {
    const refreshTracking = () => { trackingEnabled.current = readSmartCameraTrackingEnabled(); observedBounds.current = null; sampleDelay.current = 0; };
    refreshTracking();
    window.addEventListener(SMART_CAMERA_TRACKING_EVENT, refreshTracking);
    return () => window.removeEventListener(SMART_CAMERA_TRACKING_EVENT, refreshTracking);
  }, []);
  useEffect(() => {
    const initial = origin.current;
    return () => {camera.position.set(initial.x,initial.y,initial.z);camera.fov=initial.fov;camera.updateProjectionMatrix();camera.lookAt(0,0,0);};
  },[camera]);
  useFrame((_,dt) => {
    const userHasPreset=library.current.enabled && Boolean(library.current.assignments[section]);
    const baseCue = resolveLiveCameraKeyframePose(library.current, section, progressMs, liveEnabled.current, motionFrames.current, cinematicPaths.current)
      ?? resolveCameraPose(library.current, section, progressMs, intensity, duo);
    // Saved camera presets/keyframes remain authoritative; only augment automatic framing.
    const cue = showCue?.cameraEnabled && !userHasPreset && playing && !reducedMotion
      ? showCameraPose(baseCue,showCue,progressMs,duo) : baseCue;
    const editingPose=liveEditPose.current;
    const to = editingPose ?? (playing && !reducedMotion
      ? composeCameraPose(cue,section,progressMs,intensity,duo,composerSettings.current)
      : {x:0,y:.1,z:duo?5.9:4.2,targetY:0,fov:38});
    // Manual studio framing wins over composition/keyframes, but not avatar safety tracking.
    const manual = manualMode.current;
    if(!editingPose && playing && !reducedMotion && manual!=="auto") Object.assign(to,applyManualCameraMode(to,manual,duo));
    let trackingX = 0;
    if (!editingPose && playing && !reducedMotion && trackingEnabled.current) {
      sampleDelay.current -= Math.max(0, dt);
      if (sampleDelay.current <= 0) {
        sampleDelay.current = .2; // Limit expensive skinned mesh bounds checks to 5 Hz.
        const avatars = scene.getObjectByName(TRACKING_ROOT_NAME);
        if (avatars && avatars.visible) {
          avatars.updateWorldMatrix(true, true);
          boundsBox.current.setFromObject(avatars, true);
          if (!boundsBox.current.isEmpty()) {
            boundsBox.current.getCenter(boundsCenter.current);
            boundsBox.current.getSize(boundsSize.current);
            const size = boundsSize.current, center = boundsCenter.current;
            if (Number.isFinite(size.y) && size.y > .2 && size.y < 15 && Number.isFinite(size.x) && size.x < 20) {
              observedBounds.current = {centerX:center.x,centerY:center.y,width:size.x,height:size.y};
            }
          }
        }
      }
      if (observedBounds.current) {
        const viewX=to.x-(to.targetX??0),viewY=to.y-to.targetY,viewZ=to.z-(to.targetZ??0);
        const viewDistance=Math.max(.001,Math.hypot(viewX,viewY,viewZ));
        const framed = frameTrackedAvatar(observedBounds.current, viewDistance, to.fov, camera.aspect, duo);
        // Increase distance along the CURRENT viewing direction (including negative Z).
        trackingX = Math.max(-1.5,Math.min(1.5,framed.targetX)) * .5;
        to.targetX=(to.targetX??0)+trackingX;
        to.x+=trackingX;
        const distance=Math.max(viewDistance,framed.z);
        to.x=(to.targetX??0)+viewX/viewDistance*distance;
        to.y=to.targetY+viewY/viewDistance*distance;
        to.z=(to.targetZ??0)+viewZ/viewDistance*distance;
      }
    }
    // Never modify a live edit, manual shot or authored camera preset.
    const automaticShot=!editingPose && manual==='auto' && !userHasPreset;
    const cameraMode=lipSync?.cameraModeV369??"off";
    const castV377=Math.min(4,Math.max(lipSync?.cameraCastCountV377??0,lipSync?.multiArtistCastCountV442??0,duo?2:1));
    const cameraModeV377=((lipSync?.vocalTimeEnabledV496&&lipSync?.rapDuetCameraV416!==false&&lipSync.vocalTimeSegmentsV496?.length)||
      (lipSync?.rapDuetEnabledV416&&lipSync?.rapDuetCameraV416!==false&&lipSync.rapDuetAssignmentsV416?.length)||
      (lipSync?.manualVocalEnabledV385&&lipSync?.manualVocalCameraV385!==false&&lipSync.manualVocalAssignmentsV385?.length)||
      (lipSync?.concertModeV386!=="off"&&lipSync?.concertModeV386!==undefined&&lipSync?.concertCameraV386!==false))&&lipSync?.cinematicDuetCameraModeV377==="off"
      ?"subtle":lipSync?.cinematicDuetCameraModeV377??"off";
    const interactionV377=automaticShot&&lipSync?.duetModeV376!=="off"&&!!lipSync?.lyrics
      ?resolveDuetInteractionV376({lyrics:lipSync.lyrics,progressMs:lipSync.progressMs,playing:playing&&lipSync.playing,
        reducedMotion,count:castV377,mode:lipSync.duetModeV376,strength:lipSync.duetStrengthV376,
        manualPriority:lipSync.cameraManualStagePriorityV377}):null;
    const manualV385=resolveManualVocalCueV385({lyrics:lipSync?.lyrics,progressMs:lipSync?.progressMs??0,
      playing:playing&&!!lipSync?.playing,count:castV377,
      enabled:lipSync?.manualVocalEnabledV385===true&&!!lipSync.manualVocalTrackIdV385,
      assignments:lipSync?.manualVocalAssignmentsV385,
      manualPriority:!automaticShot||!!lipSync?.cameraManualStagePriorityV377});
    const selectedV385=interactionV377&&manualV385.active?
      applyManualVocalCueV385(interactionV377,manualV385,reducedMotion):manualV385.active?
      applyManualVocalCueV385({enabled:false,leadSlot:0,partnerSlot:null,activeSlots:[],fromSlot:null,toSlot:0,
        event:"none",phase:0,emphasis:0,source:"none",lineIndex:-1,count:castV377},manualV385,reducedMotion):interactionV377;
    // V496: explicit sub-line singer timestamps use the existing cinematic duet camera,
    // never an independent camera or an inferred vocalist identity. Authored camera wins.
    const timeCueV496=resolveVocalTimeCueV496({
      trackId:lipSync?.vocalTimeTrackIdV496??"",progressMs:lipSync?.progressMs??0,
      playing:playing&&!!lipSync?.playing,reducedMotion,count:castV377,
      enabled:lipSync?.vocalTimeEnabledV496===true&&!manualV385.active&&
        lipSync?.rapDuetCameraV416!==false&&
        !!lipSync.vocalTimeTrackIdV496&&lipSync.vocalTimeTrackIdV496===lipSync.manualVocalTrackIdV385,
      segments:lipSync?.vocalTimeSegmentsV496,
      manualPriority:!automaticShot||!!lipSync?.cameraManualStagePriorityV377||!!timelineCue?.active,
    });
    const legacyDuetCueV416=resolveRapDuetCueV416({
      lyrics:lipSync?.lyrics,progressMs:lipSync?.progressMs??0,playing:playing&&!!lipSync?.playing,
      reducedMotion,count:castV377,enabled:lipSync?.rapDuetEnabledV416===true&&!manualV385.active&&!timeCueV496.active&&
        !!lipSync.rapDuetTrackIdV416&&lipSync.rapDuetTrackIdV416===lipSync.manualVocalTrackIdV385,
      assignments:lipSync?.rapDuetAssignmentsV416,
      manualPriority:!automaticShot||!!lipSync?.cameraManualStagePriorityV377||!!timelineCue?.active,
    });
    const rapDuetCueV416=timeCueV496.active?timeCueV496:legacyDuetCueV416;
    const selectedV416=rapDuetCueV416.active
      ?applyRapDuetInteractionV416(selectedV385??{enabled:false,leadSlot:0,partnerSlot:null,
        activeSlots:[],fromSlot:null,toSlot:0,event:"none",phase:0,emphasis:0,source:"none",
        lineIndex:-1,count:castV377},rapDuetCueV416):selectedV385;
    const manualV416=rapDuetCueV416.active?toVocalCueV416(rapDuetCueV416):manualV385;
    const concertV386=resolveConcertCueV386({mode:lipSync?.concertModeV386,
      strength:lipSync?.concertStrengthV386,playing:playing&&!!lipSync?.playing,
      reducedMotion,count:castV377,manual:manualV416,duet:selectedV416,section,
      manualPriority:!automaticShot||!!lipSync?.cameraManualStagePriorityV377||!!timelineCue?.active});
    const plannedV377=planCinematicDuetCameraV377({mode:lipSync?.concertCameraV386!==false&&concertV386.active&&cameraModeV377==="off"?"subtle":cameraModeV377,strength:lipSync?.cinematicDuetCameraStrengthV377??65,
      playing:playing&&!!lipSync?.playing,reducedMotion,count:castV377,section,duet:selectedV416,
      manualPriority:!automaticShot||!!lipSync?.cameraManualStagePriorityV377||!!timelineCue?.active});
    const vocalCameraV385=((manualV385.active&&manualV385.role==="hook")||(rapDuetCueV416.active&&rapDuetCueV416.style==="hook"))&&plannedV377.active
      ?{...plannedV377,shot:"group" as const,reason:"hook" as const}
      :rapDuetCueV416.active&&rapDuetCueV416.style==="duet"&&plannedV377.active
        ?{...plannedV377,shot:"two-shot" as const,reason:"verse" as const}:plannedV377;
    const shotPlanV386=concertV386.active&&lipSync?.concertCameraV386!==false&&vocalCameraV385.active
      ?{...vocalCameraV385,shot:concertV386.camera,leadSlot:concertV386.leadSlot,
        partnerSlot:concertV386.partnerSlot,reason:concertV386.camera==="group"?"hook" as const:
          concertV386.camera==="two-shot"?"handoff" as const:"verse" as const}:vocalCameraV385;
    const shotV377=holdCinematicDuetShotV377(duetCameraHoldV377.current,shotPlanV386,lipSync?.progressMs??0,playing);
    const visualPlanV397=chooseCameraShotV398(advanceVisualDirectorV397(visualDirectorV397.current,{
      trackId:lipSync?.manualVocalTrackIdV385,progressMs:lipSync?.progressMs??0,
      playing:playing&&!!lipSync?.playing,reducedMotion,mode:lipSync?.visualDirectorModeV397,
      strength:lipSync?.visualDirectorStrengthV397,count:castV377,section,
      studioV398:studioProfileV398,
      performanceTier:lipSync?.visualDirectorTierV397,
      lyrics:lipSync?.lyrics,lyricsEnabled:lipSync?.enabled===true,
      duet:selectedV385,manual:manualV385,
      manualCamera:!automaticShot||!!timelineCue?.active,
      authoredStage:!!lipSync?.cameraManualStagePriorityV377,
      existingCamera:shotV377.active||lipSync?.cinematicDuetCameraModeV377!=="off"&&lipSync?.cinematicDuetCameraModeV377!==undefined,
    }),section,studioProfileV398,{
      timedLyrics:lipSync?.enabled===true&&timedLineV397(lipSync.lyrics,lipSync.progressMs)>=0,
      hasPartner:!!(selectedV385?.enabled&&selectedV385.fromSlot!==null||manualV385.active&&manualV385.handoffFrom!==null),
      leadSlot:manualV385.active?manualV385.leadSlot:selectedV385?.enabled?selectedV385.leadSlot:undefined,
      partnerSlot:manualV385.active?manualV385.handoffFrom:selectedV385?.enabled?selectedV385.fromSlot:null
    });
    // V400 is a manually authored per-song camera timeline, not automatic vocalist detection.
    // Existing stage camera presets, live edits and explicit camera/show timelines win.
    const authoredCueV400=automaticShot&&!timelineCue?.active&&!lipSync?.cameraManualStagePriorityV377&&!shotV377.active
      ?activeCameraCueV400(cameraTimelineV400,lipSync?.manualVocalTrackIdV385??"",
        lipSync?.progressMs??-1,playing&&!!lipSync?.playing,reducedMotion,castV377):null;
    // V401 is subordinate to authored V400 cues, V377 duets, existing V354 timelines,
    // explicit manual camera controls and saved presets; V397 solo shots can be accented.
    const vocalPlanV401=advanceVocalCameraV401(vocalCameraStateV401.current,{
      trackId:lipSync?.manualVocalTrackIdV385,progressMs:lipSync?.progressMs??-1,
      playing:playing&&!!lipSync?.playing,reducedMotion,lyrics:lipSync?.lyrics,
      lyricsEnabled:lipSync?.enabled===true,count:castV377,style:lipSync?.style,genre,section,
      manual:manualV385,duet:selectedV385,
      performanceTier:lipSync?.visualDirectorTierV397,
      settings:{mode:lipSync?.vocalCameraModeV401,strength:lipSync?.vocalCameraStrengthV401},
      authoredPriority:!automaticShot||!!timelineCue?.active||!!lipSync?.cameraManualStagePriorityV377,
      existingShot:shotV377.active||!!authoredCueV400,
    });
    // Do not use performer positions cached for an earlier Spotify track.
    const anchorTrackV806=lipSync?.manualVocalTrackIdV385??"";
    if(duetAnchorSampleV377.current.trackId!==anchorTrackV806){
      duetAnchorSampleV377.current={remaining:0,anchors:[],trackId:anchorTrackV806};
      danceMotionV898.current={trackId:anchorTrackV806,positionMs:-1,motion:0,lastSampleMs:-1};
    }
    // V898 also resets the motion snapshot when V604's actual song ID changes,
    // even if no manual V385 vocalist track ID is available.
    const coordTrackV898=cameraNarrativeV605?.plan.trackId??'';
    if(danceMotionV898.current.trackId!==coordTrackV898){
      danceMotionV898.current={trackId:coordTrackV898,positionMs:-1,motion:0,lastSampleMs:-1};
      duetAnchorSampleV377.current.remaining=0;
      duetAnchorSampleV377.current.anchors=[];
    }
    duetAnchorSampleV377.current.remaining-=Math.max(0,dt);
    if((shotV377.active||visualPlanV397.active||authoredCueV400||vocalPlanV401.active||lipSync?.cinematicSceneV528?.active||cameraNarrativeV605?.cue.active||readConcertStageSyncV882().danceCameraSettingsV898?.enabled)&&duetAnchorSampleV377.current.remaining<=0){
      duetAnchorSampleV377.current.remaining=.18;
      const anchors:CameraAnchorV377[]=[];
      for(let i=0;i<Math.min(4,castV377);i++){
        const root=scene.getObjectByName(`v377-vocal-stage-slot-${i}`);
        if(!root && i===0 && castV377===1){
          const solo=scene.getObjectByName(TRACKING_ROOT_NAME);
          if(solo?.visible){solo.updateWorldMatrix(true,false);solo.getWorldPosition(anchorPositionV377.current);
            anchors.push({slot:0,x:anchorPositionV377.current.x,y:anchorPositionV377.current.y,z:anchorPositionV377.current.z,visible:true});}
          continue;
        }
        if(!root)continue;
        root.updateWorldMatrix(true,false);
        root.getWorldPosition(anchorPositionV377.current);
        const visible=root.visible&&Math.abs(root.scale.x)>.12;
        anchors.push({slot:i,x:anchorPositionV377.current.x,y:anchorPositionV377.current.y,z:anchorPositionV377.current.z,visible});
      }
      // V898: compare only snapshots of the SAME real avatar roots and track.
      // A seek, time reversal, or missing root is neutral, never fabricated motion.
      const priorV898=danceMotionV898.current;
      const elapsedV898=progressMs-priorV898.positionMs;
      const continuousV898=priorV898.trackId===coordTrackV898&&elapsedV898>=80&&elapsedV898<=1000;
      const actualMotionV898=measureAnchorMotionV898(
        duetAnchorSampleV377.current.anchors,anchors,elapsedV898,continuousV898);
      danceMotionV898.current={trackId:coordTrackV898,positionMs:progressMs,
        lastSampleMs:progressMs,motion:actualMotionV898};
      duetAnchorSampleV377.current.anchors=anchors;
    }
    const lyricShot=automaticShot&&playing&&!reducedMotion&&lipSync?.enabled
      ?planVocalCameraV369(lipSync.lyrics,lipSync.progressMs,lipSync.playing,{mode:cameraMode,style:lipSync.style,genre}):0;
    vocalFocusV369.current=approachVocalFocusV369(vocalFocusV369.current,holdVocalShotV369(holdV369.current,lyricShot,lipSync?.progressMs??0,playing&&!reducedMotion&&!!lipSync?.enabled),dt);
    faceSampleV369.current.remaining-=Math.max(0,dt);
    if(automaticShot&&(vocalFocusV369.current>.01||shotV377.active||vocalPlanV401.active)&&faceSampleV369.current.remaining<=0){
      faceSampleV369.current.remaining=.25;
      faceSampleV369.current.value=sampleVocalFaceYV369(scene.getObjectByName(TRACKING_ROOT_NAME)??null);
    }
    // If a dancer unmounts or temporarily has no readable world anchor, preserve V369 framing.
    const anchorsV377=duetAnchorSampleV377.current.anchors.filter(a=>a.visible);
    const shotAvailableV377=shotV377.active && (shotV377.shot==="lead"
      ?anchorsV377.some(a=>a.slot===shotV377.leadSlot)
      :shotV377.shot==="two-shot"
        ?anchorsV377.some(a=>a.slot===shotV377.leadSlot)&&anchorsV377.some(a=>a.slot===shotV377.partnerSlot)
        :anchorsV377.length>0);
    const effectiveShotV377=shotAvailableV377?shotV377:{...shotV377,active:false,shot:"none" as const};
    const vocalFramed=automaticShot
      ?composeVocalCameraV369(to,shotAvailableV377?0:vocalFocusV369.current,{duo,intensity:lipSync?.cameraStrengthV369??55,headY:faceSampleV369.current.value,lyricsProtected:composition?.protectLyrics??false})
      :to;
    const duetFramedV377=automaticShot
      ?composeCinematicDuetCameraV377(vocalFramed,effectiveShotV377,duetAnchorSampleV377.current.anchors,
        {lyricsProtected:composition?.protectLyrics??false,faceY:faceSampleV369.current.value}):vocalFramed;
    const visuallyFramedV397=automaticShot
      ?composeVisualPerformanceV397(duetFramedV377,visualPlanV397,duetAnchorSampleV377.current.anchors,
        !!composition?.protectLyrics,faceSampleV369.current.value):duetFramedV377;
    const cameraTunedV398=visuallyFramedV397!==duetFramedV377
      ?tuneCameraPoseV398(visuallyFramedV397,visualPlanV397,section,
        studioProfileV398,!!composition?.protectLyrics):visuallyFramedV397;
    const lyricsPlanV378=planCinematicLyricsV378({
      mode:lipSync?.cinematicLyricsModeV378??"off",strength:lipSync?.cinematicLyricsStrengthV378??70,
      playing:playing&&!!lipSync?.playing,reducedMotion,lyricsVisible:lipSync?.cinematicLyricsVisibleV378??false,
      side:lipSync?.cinematicLyricsSideV378??null,lyrics:lipSync?.lyrics,progressMs:lipSync?.progressMs??0,
      manualPriority:!automaticShot||!!lipSync?.cameraManualStagePriorityV377||!!timelineCue?.active,
      section,duet:effectiveShotV377,
    });
    const lyricsFramedV378=automaticShot?composeCinematicLyricsCameraV378(cameraTunedV398,lyricsPlanV378):cameraTunedV398;
    const motion=genreCue?.active&&playing&&!reducedMotion?genreCue.cameraMotion:1;
    // Only modify automatically planned lateral movement; authored poses remain unchanged.
    const genreFramed=automaticShot && motion!==1?{...lyricsFramedV378,x:lyricsFramedV378.x*motion}:lyricsFramedV378;
    const timelineFramed=automaticShot&&timelineCue?.active
      ?directCameraV354(genreFramed,timelineCue.cameraShot,timelineCue.timeMs):genreFramed;
    const concertFramedV387=concertShowCameraV387
      ?composeConcertShowCameraV387(timelineFramed,concertShowCueV387,{
        automatic:automaticShot&&!timelineCue?.active,authored:!!lipSync?.cameraManualStagePriorityV377,
        lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active}):timelineFramed;
    const festivalFramedV394=composeFestivalCameraV394(concertFramedV387,festivalShowCueV394,{
      automatic:automaticShot&&!timelineCue?.active,enabled:festivalShowCameraV394,
      authored:!!lipSync?.cameraManualStagePriorityV377,lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active});
    const cameraTimelineFramedV400=automaticShot
      ?composeCameraTimelineV400(festivalFramedV394,authoredCueV400,duetAnchorSampleV377.current.anchors,
        !!composition?.protectLyrics||!!lyricsPlanV378.active):festivalFramedV394;
    const vocalFramedV401=automaticShot&&!authoredCueV400&&!shotV377.active
      ?composeVocalCameraV401(cameraTimelineFramedV400,vocalPlanV401,
        duetAnchorSampleV377.current.anchors,!!composition?.protectLyrics||!!lyricsPlanV378.active,
        faceSampleV369.current.value,visualPlanV397):cameraTimelineFramedV400;
    // V429: only a subtle overlay on the existing automatic R3F camera. Do not override
    // live edits, user presets/keyframes, V354 show cues, V400 authored timelines or
    // V377/V397/V401 duet/vocal shots and active concert/festival camera direction.
    const rapCameraBlockedV429=!automaticShot||!!timelineCue?.active||
      !!lipSync?.cameraManualStagePriorityV377||!!authoredCueV400||shotV377.active||
      !!visualPlanV397.active||!!vocalPlanV401.active||!!concertShowCueV387?.active||
      !!festivalShowCueV394?.active||!!showCue?.cameraEnabled||
      !!studioProfileV398.enabled||!!liveEnabled.current&&userHasPreset;
    const rapPlanV429=planRapCameraV429({enabled:lipSync?.rapCameraEnabledV429===true,
      strength:lipSync?.rapCameraStrengthV429??65,cue:lipSync?.rapCameraCueV429??{
        active:false,scene:"none",faceStrength:0,gestureStrength:0,cameraEnergy:0,
        lineIndex:-1,leadSlot:0,startMs:0,endMs:0,articulationWeight:0,source:"inactive"},
      trackId:lipSync?.manualVocalTrackIdV385??"",assignmentTrackId:lipSync?.rapDuetTrackIdV416??"",
      progressMs:lipSync?.progressMs??-1,playing:playing&&!!lipSync?.playing,
      reducedMotion,manualPriority:rapCameraBlockedV429});
    // V430: line-level edits modify only validated V429 plans; manual cameras still win.
    const editedRapPlanV430=applyRapCameraShotV430(rapPlanV429,
      lipSync?.manualVocalTrackIdV385??"",lipSync?.rapDuetTrackIdV416??"",
      lipSync?.rapCameraOverridesV430);
    const heldRapPlanV429=advanceRapCameraHoldV429(rapCameraHoldV429.current,editedRapPlanV430,
      lipSync?.manualVocalTrackIdV385??"",lipSync?.progressMs??-1,playing&&!rapCameraBlockedV429);
    const rapFramedV429=composeRapCameraV429(vocalFramedV401,heldRapPlanV429,{
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      duo});
    // V433 is opt-in and may blend ONLY automatically composed V429 poses.
    // V432 user's explicit keyframes remain downstream and authoritative.
    const rapFramedV433=advanceRapCameraTransitionV433(rapCameraTransitionV433.current,
      rapFramedV429,vocalFramedV401,heldRapPlanV429,{
        enabled:lipSync?.rapCameraTransitionsEnabledV433===true&&!rapCameraBlockedV429,
        playing:playing&&!!lipSync?.playing,reducedMotion,
        trackId:lipSync?.manualVocalTrackIdV385??"",progressMs:lipSync?.progressMs??-1,
        bpm:lipSync?.rapCameraBpmV433,kick:lipSync?.rapCameraKickV433,
        beatSync:lipSync?.rapCameraBeatSyncV433!==false,
        smoothness:lipSync?.rapCameraTransitionSmoothnessV433??55});
    // V432: local song/lyric keyframes apply ONLY after V429/V430 and their priority gates.
    // The existing stage camera remains the sole renderer; no additional render loop.
    // V442: frame inferred 3/4-performer spotlights without touching explicit V416 roles,
    // V430 authored shots, manually saved cameras or V432 song keyframes.
    const autoMultiCameraV442=lipSync?.multiArtistCastCountV442&&lipSync.multiArtistCastCountV442>=3&&
      lipSync.rapCameraCueV429?.source==="auto-lyrics"&&!rapCameraBlockedV429&&heldRapPlanV429.active&&
      !lipSync.rapCameraOverridesV430?.some(x=>x.lineIndex===heldRapPlanV429.lineIndex);
    const rapFramedV442=autoMultiCameraV442?frameMultiArtistCameraV442(rapFramedV433,{
      count:lipSync.multiArtistCastCountV442!,slot:heldRapPlanV429.leadSlot,
      group:heldRapPlanV429.shot==="hook-push"||heldRapPlanV429.shot==="duet-wide",
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active}):rapFramedV433;
    const rapFramedV432=composeRapCameraKeyframeV432(rapFramedV442,heldRapPlanV429,
      lipSync?.rapCameraKeyframesV432??[],lipSync?.progressMs??-1,{
        enabled:lipSync?.rapCameraKeyframesEnabledV432===true,
        lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active});
    // V454 is an opt-free finishing pass for the V446 visual stage score.
    // Never adjust manually authored shots, camera timelines, lens presets or cast edits.
    const hasManualRapCameraV454=!!lipSync?.rapCameraOverridesV430?.some(edit=>
      edit.lineIndex===heldRapPlanV429.lineIndex);
    const blockedConcertCameraV454=rapCameraBlockedV429||hasManualRapCameraV454||
      !!(lipSync?.rapCameraKeyframesEnabledV432&&lipSync.rapCameraKeyframesV432?.length)||
      !!lipSync?.vocalTimeEnabledV496&&!!lipSync.vocalTimeSegmentsV496?.length||
      !!lipSync?.rapDuetEnabledV416&&!!lipSync.rapDuetAssignmentsV416?.length||
      !!lipSync?.manualVocalEnabledV385&&!!lipSync.manualVocalAssignmentsV385?.length;
    const concertPlanV454=planConcertCameraV454({
      cue:lipSync?.concertCameraCueV454,count:lipSync?.concertCameraCastCountV454??castV377,
      enabled:true,playing:playing&&!!lipSync?.playing,reducedMotion,
      manualPriority:blockedConcertCameraV454,
      strength:lipSync?.rapCameraStrengthV429??65,
    });
    const concertHeldV454=holdConcertCameraV454(concertCameraHoldV454.current,concertPlanV454,
      lipSync?.manualVocalTrackIdV385??"",lipSync?.progressMs??-1,playing&&!blockedConcertCameraV454);
    const concertFramedV454=composeConcertCameraV454(rapFramedV432,concertHeldV454,{
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      faceY:faceSampleV369.current.value,
      alreadyMultiFramed:!!autoMultiCameraV442,
    });
    // V497 is a final, bounded vocal/section flourish on AUTO shots only.
    // V400 authored camera cues, V354 timelines, live edits and stage manual priority win.
    const concertFramedV497=composeCinematicConcertCameraV497(concertFramedV454,
      cinematicCueV497,{
      authored:!automaticShot||!!timelineCue?.active||!!authoredCueV400||
        !!lipSync?.cameraManualStagePriorityV377||!!liveEditPose.current||
        !!studioProfileV398.enabled||!!liveEnabled.current&&userHasPreset,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
    });
    // V528: V527 focus intent is permitted only for explicitly confirmed singers.
    // Existing V377/V400/V432, live edits, show timelines and manual camera presets
    // keep authority; the final V351 lyrics safety guard remains downstream.
    const sceneV528=lipSync?.cinematicSceneV528;
    const authoredCameraV528=!automaticShot||!!timelineCue?.active||!!authoredCueV400||
      !!lipSync?.cameraManualStagePriorityV377||!!liveEditPose.current||
      !!studioProfileV398.enabled||!!showCue?.cameraEnabled||
      !!concertShowCueV387?.active||!!festivalShowCueV394?.active||
      !!lipSync?.rapCameraOverridesV430?.length||
      !!(lipSync?.rapCameraKeyframesEnabledV432&&lipSync.rapCameraKeyframesV432?.length);
    const sceneFramedV528=sceneV528&&sceneV528.trackId===lipSync?.manualVocalTrackIdV385&&
      sceneV528.count===castV377
      ?composeConcertSceneCameraV528(concertFramedV497,sceneV528,
        duetAnchorSampleV377.current.anchors,{
        automatic:automaticShot,authored:authoredCameraV528,
        lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active})
      :concertFramedV497;
    // V540: physical viewport-aware framing for VERIFIED singers only.
    // V528 already gates track identity and manual priorities. V351 retains
    // the last word for actual lyrics safety, and the same R3F camera remains.
    const concertFramedV540=composeConcertCameraV540(sceneFramedV528,sceneV528,
      duetAnchorSampleV377.current.anchors,{
      trackId:lipSync?.manualVocalTrackIdV385,progressMs:lipSync?.progressMs??-1,
      aspect:camera.aspect,playing:playing&&!!lipSync?.playing,reducedMotion,
      automatic:automaticShot,authored:authoredCameraV528,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
      faceY:faceSampleV369.current.value,
    });
    // V550: verified solo/feature/hook cinematography, after V540 screen framing
    // and before V351 final lyrics safety. Same camera, no extra frame loop.
    const concertFramedV550=composeCinematicConcertCameraV550(concertFramedV540,sceneV528,
      duetAnchorSampleV377.current.anchors,{
      trackId:lipSync?.manualVocalTrackIdV385,progressMs:lipSync?.progressMs??-1,
      aspect:camera.aspect,playing:playing&&!!lipSync?.playing,reducedMotion,
      automatic:automaticShot,authored:authoredCameraV528,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
      faceY:faceSampleV369.current.value,
    });
    // V585: a bounded, verified duet handoff micro-pan or complete hook-wide
    // finish. Authored shots, low/reduced-motion, missing cast and unsafe lyrics
    // framing return the original V550 pose unchanged.
    const duetFramedV585=composeCinematicDuetInteractionV585(concertFramedV550,sceneV528,
      duetAnchorSampleV377.current.anchors,{
      trackId:lipSync?.manualVocalTrackIdV385,progressMs:lipSync?.progressMs??-1,
      aspect:camera.aspect,playing:playing&&!!lipSync?.playing,reducedMotion,
      automatic:automaticShot,authored:authoredCameraV528,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
      faceY:faceSampleV369.current.value,
    });
    // V605: actual, bounded whole-track camera movement from VERIFIED V604 acts.
    // Manual edits, keyframes, authored V400/V354 shots and V351 final lyrics
    // safety remain authoritative. One R3F camera; no new update loop.
    const framedV605=composeFullSongCameraV605(duetFramedV585,
      cameraNarrativeV605?.plan,cameraNarrativeV605?.cue,
      duetAnchorSampleV377.current.anchors,sceneV528,{
      trackId:lipSync?.manualVocalTrackIdV385??"",progressMs:lipSync?.progressMs??-1,
      playing:playing&&!!lipSync?.playing,reducedMotion,
      automatic:automaticShot,authored:authoredCameraV528||cameraNarrativeV605?.manualCamera===true,
      quality:lipSync?.visualDirectorTierV397??"balanced",aspect:camera.aspect,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
    });
    // V606: shared evidence-based lyrics/performer harmony AFTER V605 and
    // BEFORE the existing final V351 safety guard. Authored shots win.
    const lyricIntervalV606=activeLyricLineV606(lipSync?.lyrics?.lines??[],lipSync?.progressMs??-1);
    const narrativeV606=cameraNarrativeV605?.cue;
    const confirmedHookV606=narrativeV606?.active&&narrativeV606.chapter==='payoff'&&
      cameraNarrativeV605?.plan.acts[narrativeV606.act]?.section==='hook';
    const harmonyV606=planConcertLyricsHarmonyV606({
      line:lyricIntervalV606?.line,nextLineStart:lyricIntervalV606?.next,
      progressMs:lipSync?.progressMs??-1,playing:playing&&!!lipSync?.playing,
      synchronized:lipSync?.lyrics?.synced===true,reducedMotion,
      immersive:lipSync?.cinematicLyricsVisibleV378===true,cast:castV377,
      trackId:lipSync?.manualVocalTrackIdV385??'',scene:sceneV528,
      cue:narrativeV606,hookSection:!!confirmedHookV606,
      wordHighlight:false,
    });
    const framedV606=composeConcertHarmonyCameraV606(framedV605,harmonyV606,
      duetAnchorSampleV377.current.anchors,sceneV528,{
      trackId:lipSync?.manualVocalTrackIdV385??'',progressMs:lipSync?.progressMs??-1,
      playing:playing&&!!lipSync?.playing,reducedMotion,automatic:automaticShot,
      authored:authoredCameraV528||cameraNarrativeV605?.manualCamera===true,
      aspect:camera.aspect,quality:lipSync?.visualDirectorTierV397??'balanced',
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
      cue:narrativeV606,
    });
    // V610 adjusts only the FINAL automatic camera candidate, before the V351
    // screen/lyrics guard. Authored keyframes, manual timelines and cuts win.
    const concertGenreV610=planGenreConcertV610({
      narrative:cameraNarrativeV605,trackId:lipSync?.manualVocalTrackIdV385??"",
      durationMs:cameraNarrativeV605?.plan.durationMs??0,
      positionMs:lipSync?.progressMs??-1,section,genre,
      energy:lipSync?.concertEnergyV610??0,kick:lipSync?.rapCameraKickV433??0,
      playing:playing&&!!lipSync?.playing,reducedMotion,
      tier:lipSync?.visualDirectorTierV397??"balanced",
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      manualDance:true,manualLighting:true,
      manualCamera:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera||
        !automaticShot||timelineCue?.active||authoredCueV400||editingPose||
        lipSync?.cameraManualStagePriorityV377),
    });
    // V611: one evidence-bound song arc for the same automatic lanes, no new clock.
    const concertContinuityV611=planContinuousConcertV611({
    genreCue:concertGenreV610,
      narrative:cameraNarrativeV605,trackId:lipSync?.manualVocalTrackIdV385??"",
      durationMs:cameraNarrativeV605?.plan.durationMs??0,
      positionMs:lipSync?.progressMs??-1,section,genre,
      energy:lipSync?.concertEnergyV610??0,kick:lipSync?.rapCameraKickV433??0,
      playing:playing&&!!lipSync?.playing,reducedMotion,
      tier:lipSync?.visualDirectorTierV397??"balanced",
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      manualDance:true,manualLighting:true,
      manualCamera:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera||
        !automaticShot||timelineCue?.active||authoredCueV400||editingPose||
        lipSync?.cameraManualStagePriorityV377),
    });
    // V613: deliberate multi-second shot holds inside *verified* V604 acts;
    // only automatic, screen-safe camera poses. V351 still guards last.
    // V606 singer/lyrics focus stays authoritative; no lyric or mouth changes.
    const framedV613=composeConcertShotPacingV613(framedV606,
      cameraNarrativeV605?.plan,cameraNarrativeV605?.cue,
      duetAnchorSampleV377.current.anchors,sceneV528,{
      trackId:lipSync?.manualVocalTrackIdV385??"",progressMs:lipSync?.progressMs??-1,
      playing:playing&&!!lipSync?.playing,reducedMotion,automatic:automaticShot,
      authored:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera||
        timelineCue?.active||authoredCueV400||editingPose||
        lipSync?.cameraManualStagePriorityV377),
      quality:lipSync?.visualDirectorTierV397??"balanced",aspect:camera.aspect,
      energy:lipSync?.concertEnergyV610??0,kick:lipSync?.rapCameraKickV433??0,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
    });
    const genreFramedV610=concertGenreV610.active&&
      (concertGenreV610.cameraDrift!==1||concertGenreV610.cameraFov!==0||concertContinuityV611.cameraDrift!==1||concertContinuityV611.cameraFov!==0)
      ?{...framedV613,x:framedV613.x*concertGenreV610.cameraDrift*concertContinuityV611.cameraDrift,
        fov:framedV613.fov+concertGenreV610.cameraFov+concertContinuityV611.cameraFov}:framedV613;
    // V620: evidence-bound portrait/duet/group composition. The full visible
    // cast and head/foot bounds may never crop worse; no voice inference.
    // After V613 and the genre cue; V351 remains the LAST lyrics safety gate.
    const dramaturgyV623=planUltimateConcertDramaturgyV623({
      narrative:cameraNarrativeV605,trackId:lipSync?.manualVocalTrackIdV385??'',
      durationMs:cameraNarrativeV605?.plan.durationMs??0,positionMs:lipSync?.progressMs??-1,
      playing:playing&&!!lipSync?.playing,reducedMotion,tier:lipSync?.visualDirectorTierV397??'balanced',
      energy:lipSync?.concertEnergyV610??0,kick:lipSync?.rapCameraKickV433??0,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      manualCamera:!automaticShot||!!authoredCameraV528||!!cameraNarrativeV605?.manualCamera,
    });
    const composedV620=composeIntelligentCameraV620(genreFramedV610,sceneV528,
      duetAnchorSampleV377.current.anchors,cameraNarrativeV605?.plan,cameraNarrativeV605?.cue,{
      trackId:lipSync?.manualVocalTrackIdV385??"",progressMs:lipSync?.progressMs??-1,
      playing:playing&&!!lipSync?.playing,reducedMotion,automatic:automaticShot,
      authored:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera||
        timelineCue?.active||authoredCueV400||editingPose||
        lipSync?.cameraManualStagePriorityV377),
      quality:lipSync?.visualDirectorTierV397??"balanced",aspect:camera.aspect,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
      faceY:faceSampleV369.current.value,paceV623:dramaturgyV623.camera,
    });
    // V633: final evidence-bound filmic handoff/portrait and repeated-act refinement.
    // Retain V351 before and after: no new cue can bypass established lyric safety.
    const priorLyricsSafeV620=automaticShot
      ?guardAutomaticCameraV351(composedV620,composition):to;
    const cinematicOptionsV633:DirectorOptionsV633={
      trackId:lipSync?.manualVocalTrackIdV385??"",progressMs:lipSync?.progressMs??-1,
      playing:playing&&!!lipSync?.playing,reducedMotion,automatic:automaticShot,
      authored:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera||
        timelineCue?.active||authoredCueV400||editingPose||
        lipSync?.cameraManualStagePriorityV377),
      quality:lipSync?.visualDirectorTierV397??"balanced",aspect:camera.aspect,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
      faceY:faceSampleV369.current.value,
    };
    const cinematicIntentV633=planCinematicCameraV633(sceneV528,
      duetAnchorSampleV377.current.anchors,cameraNarrativeV605?.plan,
      cameraNarrativeV605?.cue,cinematicOptionsV633);
    const composedV633=composeCinematicCameraV633(priorLyricsSafeV620,sceneV528,
      duetAnchorSampleV377.current.anchors,cameraNarrativeV605?.plan,
      cameraNarrativeV605?.cue,cinematicOptionsV633);
    // V655: genuine vocalist/verified-act shot persistence, no second camera.
    // All authored timelines, manual presets and live edits win. V351 guards last.
    const naturalV655=advanceNaturalCameraV655(naturalCameraStateV655.current,
      sceneV528,cameraNarrativeV605?.plan,cameraNarrativeV605?.cue,
      duetAnchorSampleV377.current.anchors,{
        trackId:lipSync?.manualVocalTrackIdV385??cameraNarrativeV605?.plan.trackId??"",
        progressMs:lipSync?.progressMs??progressMs,
        playing:playing&&!!lipSync?.playing,reducedMotion,
        automatic:automaticShot,authored:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera||
          timelineCue?.active||authoredCueV400||editingPose||lipSync?.cameraManualStagePriorityV377),
        quality:lipSync?.visualDirectorTierV397??"balanced",aspect:camera.aspect,
        lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
        lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
        faceY:faceSampleV369.current.value,
      });
    naturalCameraStateV655.current=naturalV655.state;
    // V682: held, non-repeating shot motifs after the proven V655 singer/act
    // decision. No new cut or vocalist guess; full cast and lyrics are checked
    // against V550/V540 before the existing V655 and V351 finishing passes.
    const cameraVarietyV682=advanceCameraVarietyV682(cameraVarietyStateV682.current,
      naturalV655.cue,duetAnchorSampleV377.current.anchors,{
        trackId:lipSync?.manualVocalTrackIdV385??cameraNarrativeV605?.plan.trackId??"",
        progressMs:lipSync?.progressMs??progressMs,
        playing:playing&&!!lipSync?.playing,reducedMotion,automatic:automaticShot,
        authored:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera||
          timelineCue?.active||authoredCueV400||editingPose||lipSync?.cameraManualStagePriorityV377),
        quality:lipSync?.visualDirectorTierV397??"balanced",aspect:camera.aspect,
        lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
        lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
        faceY:faceSampleV369.current.value,
      });
    cameraVarietyStateV682.current=cameraVarietyV682.state;
    const varietyFramedV682=automaticShot?composeCameraVarietyV682(
      composedV633,cameraVarietyV682.cue,duetAnchorSampleV377.current.anchors,{
        aspect:camera.aspect,lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
        lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
        faceY:faceSampleV369.current.value,
      }):composedV633;
    const naturalFramedV655=automaticShot?composeNaturalCameraV655(
      varietyFramedV682,naturalV655.cue,duetAnchorSampleV377.current.anchors,{
      aspect:camera.aspect,lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
      faceY:faceSampleV369.current.value,
    }):composedV633;
    // V747: verified singer/act performance direction, after V655 and BEFORE
    // V351 final caption guard. The screen/cast guard is also inside compose.
    const performanceCameraV747=advancePerformanceCameraV747(performanceCameraStateV747.current,
      sceneV528,cameraNarrativeV605?.plan,cameraNarrativeV605?.cue,
      duetAnchorSampleV377.current.anchors,{
        trackId:lipSync?.manualVocalTrackIdV385??cameraNarrativeV605?.plan.trackId??'',
        progressMs:lipSync?.progressMs??progressMs,
        playing:playing&&!!lipSync?.playing,reducedMotion,automatic:automaticShot,
        authored:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera||
          timelineCue?.active||authoredCueV400||editingPose||lipSync?.cameraManualStagePriorityV377),
        quality:lipSync?.visualDirectorTierV397??'balanced',aspect:camera.aspect,
        lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
        lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
        faceY:faceSampleV369.current.value,settings:lipSync?.performanceCameraV747,
      });
    performanceCameraStateV747.current=performanceCameraV747.state;
    const framedV747=automaticShot?composePerformanceCameraV747(
      naturalFramedV655,performanceCameraV747.cue,duetAnchorSampleV377.current.anchors,{
        aspect:camera.aspect,lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
        lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
        faceY:faceSampleV369.current.value,
      }):naturalFramedV655;
    // V792: performance-aware cinematic travel on the SAME existing camera.
    // Manual edits win, with V550/V540 framing and V351 as final safety guard.
    // Unlike the legacy authoredCameraV528 guard, automatic V306/V387/V394
    // show cues are NOT manual overrides. They remain the primary composition,
    // while V792 may gently animate that composition. Explicit edits still win.
    const shotGuardV792=automaticShot&&!reducedMotion&&playing&&
      !cameraNarrativeV605?.manualCamera&&!editingPose&&
      !authoredCueV400&&!timelineCue?.active&&
      !lipSync?.cameraManualStagePriorityV377&&!liveEditPose.current&&
      !studioProfileV398.enabled&&
      !lipSync?.rapCameraOverridesV430?.length&&
      !(lipSync?.rapCameraKeyframesEnabledV432&&lipSync.rapCameraKeyframesV432?.length);
    const framedV792=shotGuardV792&&choreographyV792?.active
      ?composeSmartCameraChoreographyV792(framedV747,choreographyV792,
        duetAnchorSampleV377.current.anchors,{
          aspect:camera.aspect,
          lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
          lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
          faceY:faceSampleV369.current.value,
          leadSlot:naturalV655.cue.active?naturalV655.cue.leadSlot:-1,
        }):framedV747;
    // V797: a small, anchor-verified two-shot/solo finish after V792.
    // Final V351 lyrics guard remains authoritative; no second camera.
    const framedV797=composeMultiVocalSpotlightCameraV797(framedV792,vocalSpotlightV797,
      duetAnchorSampleV377.current.anchors,{
      automatic:shotGuardV792,authored:authoredCameraV528||!!cameraNarrativeV605?.manualCamera,
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      reducedMotion,
    });
    // V806: improve a VERIFIED duet/ensemble crop using the currently sampled
    // V377 stage roots; preserve every V550/V540 head/foot/lyrics guard.
    // No second camera, no authored timeline mutation, no inferred singers.
    const frameOptionsV809={
        trackId:lipSync?.manualVocalTrackIdV385??cameraNarrativeV605?.plan.trackId??'',
        progressMs:lipSync?.progressMs??progressMs,playing:playing&&!!lipSync?.playing,
        automatic:shotGuardV792,authored:authoredCameraV528||!!cameraNarrativeV605?.manualCamera,
        reducedMotion,tier:lipSync?.visualDirectorTierV397??'balanced',aspect:camera.aspect,
        lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
        lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
        faceY:faceSampleV369.current.value,
    } as const;
    const framedV806=composeIntelligentEnsembleCameraV806(framedV797,vocalSpotlightV797,
      sceneV528,duetAnchorSampleV377.current.anchors,frameOptionsV809);
    // V809: harmonize camera gaze with V807 artist glances and the ACTUAL
    // V808 root positions. V806 remains first; V351 is still the final guard.
    const framedV809=composeCinematicPerformerHarmonyV809(framedV806,vocalSpotlightV797,
      sceneV528,duetAnchorSampleV377.current.anchors,frameOptionsV809);
    // V838 uses only real V377 anchors; projected frame protection can reject
    // the micro-pan. Existing manual and V351 lyrics safety always win.
    const framedV838=vocalDuetV838?composeIntelligentVocalDuetCameraV838(
      framedV809,vocalDuetV838,duetAnchorSampleV377.current.anchors,{
        automatic:shotGuardV792,authored:authoredCameraV528||!!cameraNarrativeV605?.manualCamera,
        lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
        reducedMotion,aspect:camera.aspect,faceY:faceSampleV369.current.value,
        lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
      }):framedV809;
    // V848: verified wide/duet/portrait finishing over V838. Reuses V792/V797
    // evidence + sampled V377 anchors and stays BEFORE the final V351 lyrics guard.
    // No second camera loop; manual edits, keyframes and authored shots win.
    const framedV848=composeCinematicCameraDirectorV848(framedV838,sceneV528,
      vocalSpotlightV797,choreographyV792,duetAnchorSampleV377.current.anchors,{
        ...frameOptionsV809,section,authored:authoredCameraV528||
          !!cameraNarrativeV605?.manualCamera,
    });
    // V897: one camera, verified full-song scenes, small continuous cinematography.
    // V848 anchors remain authoritative; V351's final lyrics/frame guard still runs LAST.
    const cameraSignalV897=readConcertStageSyncV882();
    const cinematicCameraV897=sampleCinematicCameraV897({
      pose:framedV848,plan:cameraSignalV897.directorPlanV895,
      settings:cameraSignalV897.cameraSettingsV897??DEFAULT_CAMERA_V897,
      trackId:cameraNarrativeV605?.plan.trackId??'',durationMs:cameraSignalV897.durationMs,
      positionMs:progressMs,playing,autoEnabled:cameraSignalV897.enabled&&automaticShot&&shotGuardV792,
      directorEnabled:!!cameraSignalV897.directorSettingsV895?.enabled,
      directorCameraEnabled:!!cameraSignalV897.directorSettingsV895?.camera,
      reducedMotion,tier:lipSync?.visualDirectorTierV397??'balanced',aspect:camera.aspect,
      authored:!!(editingPose||userHasPreset||authoredCameraV528||
       cameraNarrativeV605?.manualCamera||!automaticShot),
      manualFx:!!cameraSignalV897.manual,
      seekBlocked:progressMs<(cameraSignalV897.atmosphereSeekBlockedUntilMs??0),
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsVisible:!!lipSync?.cinematicLyricsVisibleV378,
      closeup:!!(sceneV528?.active&&sceneV528.focus==='lead'),duo,
    });
    // V992: single existing R3F camera, verified V604 acts and optional measured
    // V433 bass onset. Preserve V897 framing; V898 coordination and V351 final guard follow.
    const cinemaV992=sampleCinemaV992({
      pose:cinematicCameraV897.pose,plan:cameraSignalV897.directorPlanV895,
      settings:cameraSignalV897.cameraSettingsV992??DEFAULT_CINEMA_V992,
      trackId:cameraNarrativeV605?.plan.trackId??'',durationMs:cameraSignalV897.durationMs,
      positionMs:progressMs,playing,autoEnabled:cameraSignalV897.enabled&&automaticShot&&shotGuardV792,
      directorEnabled:!!cameraSignalV897.directorSettingsV895?.enabled,
      directorCameraEnabled:!!cameraSignalV897.directorSettingsV895?.camera,
      reducedMotion,tier:lipSync?.visualDirectorTierV397??'balanced',aspect:camera.aspect,
      authored:!!(editingPose||userHasPreset||authoredCameraV528||authoredCueV400||
       timelineCue?.active||cameraNarrativeV605?.manualCamera||!automaticShot),
      manualFx:!!cameraSignalV897.manual,
      seekBlocked:progressMs<(cameraSignalV897.atmosphereSeekBlockedUntilMs??0),
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsVisible:!!lipSync?.cinematicLyricsVisibleV378,
      vocalCloseup:!!(sceneV528?.active&&sceneV528.focus==='lead'),
      duo,measuredKick:lipSync?.rapCameraKickV433,
    },cinemaStateV992.current);
    // V898: sampled V377 roots, verified V604 section, safe V550/V540 head + foot framing.
    // Retains V897's single camera; V351 remains the LAST protection stage.
    const confirmedV528=sceneV528?.active&&sceneV528.trackId===cameraNarrativeV605?.plan.trackId&&
      progressMs>=sceneV528.cueStartMs&&progressMs<sceneV528.cueEndMs;
    const danceCameraV898=sampleDanceCameraV898({
      pose:cinemaV992.pose,plan:cameraSignalV897.directorPlanV895,
      settings:cameraSignalV897.danceCameraSettingsV898??DEFAULT_DANCE_CAMERA_V898,
      trackId:cameraNarrativeV605?.plan.trackId??'',durationMs:cameraSignalV897.durationMs,
      positionMs:progressMs,playing,autoEnabled:cameraSignalV897.enabled&&shotGuardV792,
      directorEnabled:!!cameraSignalV897.directorSettingsV895?.enabled,
      cameraEnabled:!!cameraSignalV897.directorSettingsV895?.camera,
      danceEnabled:!!cameraSignalV897.sync.dance&&!!cameraSignalV897.directorSettingsV895?.dance,
      reducedMotion,tier:lipSync?.visualDirectorTierV397??'balanced',aspect:camera.aspect,
      anchors:duetAnchorSampleV377.current.anchors,
      anchorAgeMs:progressMs-danceMotionV898.current.lastSampleMs,
      motion:danceMotionV898.current.motion,
      manualFx:!!cameraSignalV897.manual,
      manualCamera:!!(editingPose||userHasPreset||authoredCameraV528||
       cameraNarrativeV605?.manualCamera||!automaticShot||timelineCue?.active||authoredCueV400),
      manualDance:!!lipSync?.cameraManualStagePriorityV377,
      seekBlocked:progressMs<(cameraSignalV897.atmosphereSeekBlockedUntilMs??0),
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      lyricsVisible:!!lipSync?.cinematicLyricsVisibleV378,
      lyricsSide:lipSync?.cinematicLyricsVisibleV378?lipSync?.cinematicLyricsSideV378:null,
      faceY:faceSampleV369.current.value,
      verifiedLeadSlot:confirmedV528?sceneV528.leadSlot:null,
      verifiedSingingSlots:confirmedV528?sceneV528.singingSlots:null,
    });
    // V899 affects only the camera's existing easing rate. Framing remains
    // V898 -> final V351, and authored/manually chosen cameras never move.
    const danceShowCameraV899=sampleDanceShowV899({
      settings:cameraSignalV897.danceShowSettingsV899??DEFAULT_DANCE_SHOW_V899,
      plan:cameraSignalV897.directorPlanV895,
      trackId:cameraNarrativeV605?.plan.trackId??'',durationMs:cameraSignalV897.durationMs,
      positionMs:progressMs,playing,autoEnabled:cameraSignalV897.enabled&&shotGuardV792,
      directorEnabled:!!cameraSignalV897.directorSettingsV895?.enabled,
      danceEnabled:!!cameraSignalV897.directorSettingsV895?.dance&&cameraSignalV897.sync.dance,
      cameraEnabled:!!cameraSignalV897.directorSettingsV895?.camera,
      duo:duetAnchorSampleV377.current.anchors.filter(a=>a.visible).length>=2,
      count:Math.max(1,duetAnchorSampleV377.current.anchors.filter(a=>a.visible).length),
      tier:lipSync?.visualDirectorTierV397??'balanced',reducedMotion,
      manualCamera:!!(editingPose||userHasPreset||authoredCameraV528||cameraNarrativeV605?.manualCamera||
        !automaticShot||timelineCue?.active||authoredCueV400),
      manualDance:!!lipSync?.cameraManualStagePriorityV377,
      manualFx:!!cameraSignalV897.manual,
      seekBlocked:progressMs<(cameraSignalV897.atmosphereSeekBlockedUntilMs??0),
      lyricsVisible:!!lipSync?.cinematicLyricsVisibleV378||!!lyricsPlanV378.active,
      energy:readEnergyV896(cameraNarrativeV605?.plan.trackId??'',cameraSignalV897.durationMs,progressMs),
    });
    const stageFramed=automaticShot
      ?guardAutomaticCameraV351(danceCameraV898.pose,composition):to;
    // Explicit edits must exactly match the pose that will be saved; no smoothing while editing.
    const liveCueV400=authoredCueV400&&cameraTimelineFramedV400!==festivalFramedV394?authoredCueV400:null;
    const cameraCueKeyV400=liveCueV400?`${liveCueV400.trackId}:${liveCueV400.cue.id}`:"";
    const cutToCameraCueV400=!!cameraCueKeyV400&&cameraCueKeyV400!==lastCameraCueV400.current&&liveCueV400?.cue.transition==="cut";
    lastCameraCueV400.current=cameraCueKeyV400;
    // V609: use the same V604-confirmed act and existing Spotify clock. These
    // multipliers change only automatic easing; a saved cut, editor or authored
    // shot remains completely authoritative.
    const sceneBlendV609=planSeamlessConcertTransitionV609({
      narrative:cameraNarrativeV605,trackId:lipSync?.manualVocalTrackIdV385??"",
      positionMs:lipSync?.progressMs??-1,playing:playing&&!!lipSync?.playing,
      reducedMotion,tier:lipSync?.visualDirectorTierV397??"balanced",
      manualCamera:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera||!automaticShot),
      manualLighting:true,
    });
    // V654 slows only automatic camera easing; manual/editor/cut transitions win.
    const concertFlowRateV654=concertFlowV654?.active && !editingPose && !cutToCameraCueV400 &&
      !authoredCameraV528 && !cameraNarrativeV605?.manualCamera && automaticShot &&
      concertFlowV654.act===cameraNarrativeV605?.cue.act && concertFlowV654.section===section
      ?concertFlowV654.cameraRate:1;
    // V884: slow ONLY the existing automatic interpolation at verified seams;
    // never modify manual shots, live camera edits, keyframes, stored cuts or lyrics guards.
    const v884Signal=readConcertStageSyncV882();
    const v884Camera=sampleCinematicTransitionV884({
      plan:v884Signal.transitionPlan,trackId:cameraNarrativeV605?.plan.trackId??'',
      durationMs:v884Signal.durationMs,positionMs:progressMs,playing,
      reducedMotion,settings:v884Signal.transitionSettings??DEFAULT_CINEMATIC_TRANSITIONS_V884,
      autoEnabled:v884Signal.enabled&&automaticShot&&!!cameraNarrativeV605?.plan.trackId,
      seekBlocked:progressMs<(v884Signal.transitionSeekBlockedUntilMs??0),
      manualCamera:!!(editingPose||cutToCameraCueV400||liveCueV400||authoredCameraV528||
        cameraNarrativeV605?.manualCamera||!automaticShot),
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      tier:lipSync?.visualDirectorTierV397??'balanced',
      manualFx:!!v884Signal.manual,
    });
    const v892Camera=sampleEpicDropV892({
      plan:v884Signal.epicPlanV892,settings:v884Signal.epicSettingsV892??DEFAULT_EPIC_DROP_V892,
      trackId:cameraNarrativeV605?.plan.trackId??'',durationMs:v884Signal.durationMs,
      positionMs:progressMs,playing,autoEnabled:v884Signal.enabled,reducedMotion,
      tier:lipSync?.visualDirectorTierV397??'balanced',
      seekBlocked:progressMs<(v884Signal.atmosphereSeekBlockedUntilMs??0),
      manualFx:!!v884Signal.manual,
      manualCamera:!!(editingPose||cutToCameraCueV400||liveCueV400||authoredCameraV528||
        cameraNarrativeV605?.manualCamera||!automaticShot),
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
    });
    const directorCameraV895=sampleDirectorV895({
      plan:v884Signal.directorPlanV895,settings:v884Signal.directorSettingsV895??DEFAULT_DIRECTOR_V895,
      trackId:cameraNarrativeV605?.plan.trackId??'',durationMs:v884Signal.durationMs,
      positionMs:progressMs,playing,autoEnabled:v884Signal.enabled&&automaticShot,
      reducedMotion,tier:lipSync?.visualDirectorTierV397??'balanced',
      seekBlocked:progressMs<(v884Signal.atmosphereSeekBlockedUntilMs??0),
      manualFx:!!v884Signal.manual,
      manualCamera:!!(editingPose||cutToCameraCueV400||liveCueV400||authoredCameraV528||
        cameraNarrativeV605?.manualCamera||!automaticShot),
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
    });
    const ultimateCameraV900=sampleUltimateV900({
      plan:v884Signal.ultimatePlanV900,settings:v884Signal.ultimateSettingsV900??DEFAULT_ULTIMATE_V900,
      trackId:cameraNarrativeV605?.plan.trackId??'',durationMs:v884Signal.durationMs,
      positionMs:progressMs,playing,autoEnabled:v884Signal.enabled&&automaticShot,
      directorEnabled:!!v884Signal.directorSettingsV895?.enabled,reducedMotion,
      tier:lipSync?.visualDirectorTierV397??'balanced',
      seekBlocked:progressMs<(v884Signal.atmosphereSeekBlockedUntilMs??0),manualFx:!!v884Signal.manual,
      manualCamera:!!(editingPose||cutToCameraCueV400||liveCueV400||authoredCameraV528||
        cameraNarrativeV605?.manualCamera||!automaticShot),
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
      energy:readEnergyV896(cameraNarrativeV605?.plan.trackId??'',v884Signal.durationMs,progressMs),
    });
    const energyCameraV896=sampleEnergyV896({
      state:readEnergyV896(cameraNarrativeV605?.plan.trackId??'',v884Signal.durationMs,progressMs),
      plan:v884Signal.directorPlanV895,settings:v884Signal.energySettingsV896??DEFAULT_ENERGY_V896,
      trackId:cameraNarrativeV605?.plan.trackId??'',durationMs:v884Signal.durationMs,
      positionMs:progressMs,playing,autoEnabled:v884Signal.enabled&&automaticShot,
      directorEnabled:!!v884Signal.directorSettingsV895?.enabled,
      reducedMotion,tier:lipSync?.visualDirectorTierV397??'balanced',
      seekBlocked:progressMs<(v884Signal.atmosphereSeekBlockedUntilMs??0),
      manualFx:!!v884Signal.manual,
      manualCamera:!!(editingPose||cutToCameraCueV400||liveCueV400||authoredCameraV528||
        cameraNarrativeV605?.manualCamera||!automaticShot),
      lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active,
    });
    const alpha = editingPose||cutToCameraCueV400 ? 1 : liveCueV400
      ?1-Math.exp(-Math.min(.1,Math.max(0,dt))*4000/liveCueV400.cue.transitionMs)
      :1-Math.exp(-Math.min(.1,Math.max(0,dt))*(framedV606!==framedV605?1.65:framedV605!==duetFramedV585?1.75:duetFramedV585!==concertFramedV550?1.85:concertFramedV550!==concertFramedV540?(sceneV528?.focus==='handoff'?1.85:1.6):concertFramedV540!==sceneFramedV528?1.5:sceneFramedV528!==concertFramedV497?1.65:concertHeldV454.active?2.15:2.8)*Math.min(sceneBlendV609.cameraRate,automaticShot&&!authoredCameraV528&&!cameraNarrativeV605?.manualCamera&&transitionV791?.active?transitionV791.cameraRate:1)*concertGenreV610.cameraRate*concertContinuityV611.cameraRate*concertFlowRateV654*
        (cinematicIntentV633.active?cinematicIntentV633.cameraRate:1)*
        (naturalV655.cue.active?naturalV655.cue.cameraRate:1)*
        (cameraVarietyV682.cue.active?cameraVarietyV682.cue.cameraRate:1)*
        (performanceCameraV747.cue.active?performanceCameraV747.cue.cameraRate:1)*v884Camera.cameraRate*v892Camera.cameraRate*directorCameraV895.cameraRate*energyCameraV896.cameraRate*cinematicCameraV897.cameraRate*cinemaV992.cameraRate*danceCameraV898.cameraRate*danceShowCameraV899.cameraRate*ultimateCameraV900.cameraRate);
    camera.position.x += (stageFramed.x-camera.position.x)*alpha;
    camera.position.y += (stageFramed.y-camera.position.y)*alpha;
    camera.position.z += (stageFramed.z-camera.position.z)*alpha;
    camera.fov += (stageFramed.fov-camera.fov)*alpha;
    camera.updateProjectionMatrix();
    target.current.x += ((stageFramed.targetX??0)-target.current.x)*alpha;
    target.current.y += (stageFramed.targetY-target.current.y)*alpha;
    target.current.z += ((stageFramed.targetZ??0)-target.current.z)*alpha;
    camera.lookAt(target.current);
    statusInterval.current -= Math.max(0,dt);
    if(statusInterval.current<=0 && typeof window!=="undefined") {
      statusInterval.current=.5;
      const preset = library.current.enabled && library.current.presets.find(p=>p.id===library.current.assignments[section]);
      const isKeyframe = !!(preset && liveEnabled.current && motionFrames.current[preset.id]?.length);
      const source = editingPose?"Live-Editor":!playing?"Pausiert":reducedMotion?"Reduced Motion":manual!=="auto"?`Manuell: ${manual}`:isKeyframe?(preset && cinematicPaths.current[preset.id]?.enabled?"Cinematic Camera Path":"Keyframe-Fahrt"):preset?`Preset: ${preset.name}`:"Automatische Regie";
      window.dispatchEvent(new CustomEvent(CAMERA_STUDIO_STATUS_EVENT,{detail:{section,mode:manual,playing,reducedMotion,intensity,source,composer:composerSettings.current.enabled,tracking:trackingEnabled.current,progressMs,camera:{x:camera.position.x,y:camera.position.y,z:camera.position.z,fov:camera.fov,targetX:target.current.x,targetY:target.current.y,targetZ:target.current.z}}}));
    }
  });
  return null;
}
