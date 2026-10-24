"use client";
// Extracted unchanged from ThreeAvatar.tsx (V492 modular refactor).
// --- Extracted dependencies (V492 refactor) ---
import { measureProfilerPhase } from "./runtimeProfiler";
import { evaluateAnimationBudget, shouldRunScheduledTask } from "./adaptiveAnimationScheduler";
import { resolveEnsembleSettingsV396 } from "./performanceExperienceV396";
import { advanceEnsembleV392, initialEnsembleV392, readEnsembleV392, type EnsembleCueV392 } from "./ensemblePerformanceV392";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { useFrame } from "@react-three/fiber";
import { advanceMultiAvatarChoreography, initialMultiAvatarState, type MultiAvatarSettings, type MultiAvatarCue } from "./multiAvatarChoreography";
import { advanceChoreographyV312, initialChoreographyV312, type ChoreographySettingsV312, type ChoreographyCueV312 } from "./intelligentDanceChoreographyV312";
import { advanceInteraction, initialInteractionState } from "./multiAvatarInteractionV274";
import { advanceDuoDirector, createDuoDirectorState, type DuoScene } from "./duoChoreographyDirector";
import { duoFormationTargets, formationApproach } from "./duoFormationEngine";
import { advanceEnsembleBalanceV324, createEnsembleStateV324, readEnsembleBalanceV324, refreshEnsembleBalanceV324, ENSEMBLE_BALANCE_EVENT_V324, ENSEMBLE_BALANCE_DIAGNOSTIC_V324 } from "./adaptiveEnsembleBalanceV324";
import { readEnsembleTimelineV325, canPlayEnsembleTimelineV325, evaluateEnsembleTimelineV325, ENSEMBLE_TIMELINE_EVENT_V325 } from "./ensembleChoreographyV325";
import { partnerCue, separatePartners } from "./avatarPartnerAwareness";
import { NEUTRAL_LOOK, partnerLookCue, type LookAtCue } from "./partnerLookAtEngine";
import { NEUTRAL_GESTURE, partnerGestureCue, type PartnerGestureCue } from "./partnerGestureEngine";
import { advancePartnerInteraction, createPartnerInteractionState } from "./partnerInteractionDirector";
import { advancePartnerSync, createPartnerSyncState } from "./partnerMotionSync";
import { handInteractionWeight, NEUTRAL_HAND, type PartnerHandCue } from "./partnerHandIK";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArtistNameBubbleV441 } from "./ArtistNameBubbleV441";
import { planCrewAccentsV452, combineCrewGesturesV452, combineCrewLooksV452 } from "./advancedMultiAvatarPerformanceV452";
import { refineNaturalCrewV458 } from "./naturalStageInteractionV458";
import { VOCAL_CHANGE_EVENT_V445, advanceVocalEvidenceV445, emptyVocalEvidenceV445, vocalHintPulseV445 } from "./vocalChangeEvidenceV445";
import { loadCharacterMotionStore } from "./characterMotionLibrary";
import { type Group } from "three";
import type { VisualizerProps } from "./registry";
import { effectiveRapTimingOffsetV418 } from "./rapPerformanceQualityV418";
import { resolveAdaptiveVocalPerformanceV375 } from "./adaptiveVocalPerformanceV375";
import { resolveDuetInteractionV376 } from "./interactiveVocalDuetsV376";
import { resolveConcertCueV386 } from "./expressiveConcertDirectorV386";
import { resolveManualVocalCueV385, applyManualVocalCueV385 } from "./manualVocalCastingV385";
import { resolveRapDuetCueV416, applyRapDuetInteractionV416, toVocalCueV416 } from "./rapDuetStudioV416";
import { readFootLockV322 } from "./intelligentFootLockV322";
import { getActivePerformanceTier } from "./adaptivePerformance";
import { AutomaticLODAssetLoader } from "./AutomaticLODAssetLoader";
import { ProceduralAvatar } from './ProceduralDancerAvatarV492';
import { GltfAvatar, ImportedAnimationAvatar } from './GltfDancerAvatarV492';
import { PartnerCalibrationContext, PartnerGestureContext, PartnerHandContext, PartnerLookContext } from './ThreeAvatarContextsV492';

export function Dancer({ props, secondary = false, slot }: { props: VisualizerProps; secondary?: boolean; slot?: number }) {
  const {preferences: dancerTimelinePreferences}=useUiPreferences();
  const modelUrl = secondary ? props.secondaryAvatarModelUrl : props.avatarModelUrl;
  const requestedAnimationUrl = secondary ? props.secondaryAvatarAnimationUrl : props.avatarAnimationUrl;
  const library = loadCharacterMotionStore();
  // The current imported animation remains a fallback while library clips preload.
  // Avoid remounts across automatic library switches.
  const animationUrl = library.automatic ? undefined : requestedAnimationUrl;
  // V313: scale only procedural/reactive dance accents; preserve the authored GLB clip and IK.
  const concertGainV387=props.isPlaying&&!props.reducedMotion&&props.avatarMotionMode!=="choreography"&&
    !dancerTimelinePreferences.avatarTimelineEnabled ? (props.concertShowCueV387?.danceGain??1) : 1;
  const narrativeGain=(props.isPlaying && !props.reducedMotion ? (props.showCue?.evolution?.dancerScale??1) : 1)*concertGainV387;
  const baseProps:VisualizerProps=narrativeGain===1?props:{...props,danceAggression:Math.min(1,Math.max(0,(props.danceAggression??.5)*narrativeGain))};
  const ensembleCountV374=baseProps.lipSync?.ensembleCountV374??((baseProps.multiAvatarMode??"solo")!=="solo"?2:1);
  const pacedProps:VisualizerProps=baseProps.lipSync?{...baseProps,lipSync:{...baseProps.lipSync,ensembleCountV374}}:baseProps;
  const dancerProps: VisualizerProps & { workloadSlot?: number } = secondary ? {
    ...pacedProps,
    avatarModelUrl: modelUrl,
    avatarAnimationUrl: animationUrl,
    preferredMotionUrlV440:props.secondaryPreferredMotionUrlV440,
    avatarModelId: props.secondaryAvatarModelId ?? props.avatarModelId,
    workloadSlot: slot ?? (secondary ? 1 : 0),
    avatarDancePreset: props.multiAvatarMode === "duet" ? (props.secondaryDancePreset ?? "freestyle") : props.avatarDancePreset,
    // Duet has a modestly different reactive response; sync/mirror retain the same dance input.
    danceVariation: props.multiAvatarMode === "duet" ? Math.min(1, (props.danceVariation ?? 0.5) + 0.25) : props.danceVariation,
  } : slot === undefined ? pacedProps : {...pacedProps,workloadSlot:slot};
  return modelUrl
    ? <AutomaticLODAssetLoader sourceUrl={modelUrl}>{assetUrl => <Suspense fallback={<ProceduralAvatar {...dancerProps} />}>
        {animationUrl
          ? <ImportedAnimationAvatar key={assetUrl} {...dancerProps} url={modelUrl} assetUrl={assetUrl} animationUrl={animationUrl} />
          : <GltfAvatar key={assetUrl} {...dancerProps} url={modelUrl} assetUrl={assetUrl} />}
      </Suspense>}</AutomaticLODAssetLoader>
    : <ProceduralAvatar {...dancerProps} />;
}

export function DuoDirectorTick({props, onScene}: {props: VisualizerProps; onScene: (scene: DuoScene) => void}) {
  const director = useRef(createDuoDirectorState());
  const prior = useRef<DuoScene>("solo");
  useFrame((_state, delta) => {
    const next = advanceDuoDirector(director.current, props.audio, delta, props.genre, props.isPlaying, props.reducedMotion);
    if (next !== prior.current) { prior.current = next; onScene(next); }
  });
  useEffect(() => { director.current = createDuoDirectorState(); prior.current = "solo"; onScene("solo"); }, [props.track?.id, onScene]);
  return null;
}

/** V206: one shared musical director, no independent timers per avatar. */
export function MultiAvatarDirectorTick({props, settings, onCue}: {props:VisualizerProps;settings:MultiAvatarSettings;onCue:(cue:MultiAvatarCue)=>void}) {
  const clock = useRef(initialMultiAvatarState());
  const interaction = useRef(initialInteractionState());
  // Compare scene/role/phrase as primitives instead of building a string every frame.
  const last = useRef<Pick<MultiAvatarCue, "scene" | "role" | "phrase"> | null>(null);
  const lastDrop = useRef(false);
  useEffect(()=>{clock.current=initialMultiAvatarState();interaction.current=initialInteractionState();last.current=null;},[props.track?.id]);
  useFrame((_state,delta)=>{
    const base=advanceMultiAvatarChoreography(clock.current,settings,props.audio,delta,props.isPlaying,props.reducedMotion);
    const cue=advanceInteraction(interaction.current,props.audio,delta,props.genre,props.isPlaying,props.reducedMotion,base,settings);
    const previous = last.current;
    if (!previous || cue.scene !== previous.scene || cue.role !== previous.role || cue.phrase !== previous.phrase || cue.dropAccent !== lastDrop.current) {
      last.current = {scene: cue.scene, role: cue.role, phrase: cue.phrase};
      lastDrop.current = cue.dropAccent;
      onCue(cue);
    }
  });
  return null;
}

/** V312: one playback-clock-driven director shared by both skinned dancers. */
export function IntelligentChoreographyTickV312({props,settings,onCue}:{props:VisualizerProps;settings:ChoreographySettingsV312;onCue:(cue:ChoreographyCueV312|null)=>void}){
  const director=useRef(initialChoreographyV312());
  const latest=useRef("");
  useEffect(()=>{director.current=initialChoreographyV312();latest.current="";onCue(null);},[props.track?.id,settings,onCue]);
  useFrame(()=>{
    if(!props.showCue)return;
    director.current=advanceChoreographyV312(director.current,{
      trackId:props.track?.id??"",progressMs:props.cameraDirectorProgressMs??0,playing:props.isPlaying,
      reducedMotion:props.reducedMotion,bpm:props.audio.bpm,genre:props.genre,showCue:props.showCue,settings
    });
    const cue=director.current.cue;
    // One React update per musical change, never one update per animation frame.
    const signature=cue?`${cue.scene}|${cue.role}|${cue.phrase}|${cue.formation}|${cue.partnerDelayBeats}|${cue.dropAccent}|${cue.interactionMode}|${cue.interactionStrength}`:"";
    if(signature!==latest.current){latest.current=signature;onCue(cue);}
  });
  return null;
}

/** V142: groups persist across scene changes so animator state and foot anchors survive. */
export function FormationDancers({props, mode, choreography}: {props: VisualizerProps; mode: DuoScene; choreography?: MultiAvatarCue | null}) {
  const lead = useRef<Group>(null);
  const partner = useRef<Group>(null);
  const ensembleStateV392 = useRef(initialEnsembleV392());
  const ensembleCueV392 = useRef<EnsembleCueV392 | null>(null);
  const performanceCueRefV375=useRef<ReturnType<typeof resolveAdaptiveVocalPerformanceV375>|null>(null);
  const interactionCueRefV376=useRef<ReturnType<typeof resolveDuetInteractionV376>|null>(null);
  const concertCueRefV386=useRef<ReturnType<typeof resolveConcertCueV386>|null>(null);
 const manualVocalCueRefV385=useRef<ReturnType<typeof resolveManualVocalCueV385>|null>(null);
  const visibility = useRef(mode !== "solo" ? 1 : 0);
  const dual = mode !== "solo";
  // V312: scale only reactive overlays for the background dancer. Authored GLB clips and IK remain untouched.
  const leadProps = useMemo(() => {
    const gain=choreography?.leadGain ?? 1;
    const syncedProps={...props,lipSync:props.lipSync?{...props.lipSync,performanceCueRefV375,interactionCueRefV376,manualVocalCueRefV385,concertCueRefV386}:undefined};
    return choreography ? {...syncedProps, avatarArmResponse:(props.avatarArmResponse??1)*(.35+.65*gain),
      avatarLegResponse:(props.avatarLegResponse??1)*(.60+.40*gain),
      danceAggression:Math.min(1,(props.danceAggression??.5)*(.50+.50*gain))} : syncedProps;
  },[props,choreography?.leadGain]);
  const partnerProps = useMemo(() => {
    const gain=choreography?.partnerGain ?? 1;
    return {...props,lipSync:props.lipSync?{...props.lipSync,performanceCueRefV375,interactionCueRefV376,manualVocalCueRefV385,concertCueRefV386}:undefined, multiAvatarMode: mode,
      ...(choreography ? {avatarArmResponse:(props.avatarArmResponse??1)*(.35+.65*gain),
        avatarLegResponse:(props.avatarLegResponse??1)*(.60+.40*gain),
        danceAggression:Math.min(1,(props.danceAggression??.5)*(.50+.50*gain))} : {})};
  }, [props,mode,choreography?.partnerGain]);
  const leadLook = useRef<LookAtCue>({...NEUTRAL_LOOK});
  const partnerLook = useRef<LookAtCue>({...NEUTRAL_LOOK});
  const leadGesture = useRef<PartnerGestureCue>({...NEUTRAL_GESTURE});
  const partnerGesture = useRef<PartnerGestureCue>({...NEUTRAL_GESTURE});
  // V445 shares the same conservative anonymous cue on the existing two-avatar stage.
  const duoVocalEvidenceV445=useRef(emptyVocalEvidenceV445());
  const duoLastHintV445=useRef("");
  const interaction = useRef(createPartnerInteractionState());
  const partnerSync = useRef(createPartnerSyncState());
  const cachedFormation = useRef<ReturnType<typeof duoFormationTargets> | null>(null);
  // V324: one shared stage-space coordinator; isolated from both clip/IK instances.
  const [ensembleSettings,setEnsembleSettings]=useState(readEnsembleBalanceV324);
  const ensembleState=useRef(createEnsembleStateV324());
  // V325: authored formation cues override automatic group positions only when explicitly enabled.
  const [manualTimeline,setManualTimeline]=useState(readEnsembleTimelineV325);
  const manualClock=useRef(0);
  useEffect(()=>{const sync=()=>setManualTimeline(readEnsembleTimelineV325());window.addEventListener(ENSEMBLE_TIMELINE_EVENT_V325,sync);return()=>window.removeEventListener(ENSEMBLE_TIMELINE_EVENT_V325,sync);},[]);
  useEffect(()=>{manualClock.current=0;},[props.track?.id]);
  const lastEnsembleReport=useRef(0);
  useEffect(()=>{
    const sync=()=>setEnsembleSettings(refreshEnsembleBalanceV324());
    window.addEventListener(ENSEMBLE_BALANCE_EVENT_V324,sync);
    return()=>window.removeEventListener(ENSEMBLE_BALANCE_EVENT_V324,sync);
  },[]);
  useEffect(()=>{ensembleState.current=createEnsembleStateV324();lastEnsembleReport.current=0;},[props.track?.id]);
  const previousMode = useRef(mode);
  const leadHand = useRef<PartnerHandCue>({...NEUTRAL_HAND});
  const partnerHand = useRef<PartnerHandCue>({...NEUTRAL_HAND});
  useEffect(() => { interaction.current = createPartnerInteractionState(); partnerSync.current = createPartnerSyncState(); }, [props.track?.id]);
  useEffect(()=>{ensembleStateV392.current=initialEnsembleV392();ensembleCueV392.current=null;},[props.track?.id]);
  useFrame((_state, delta) => {
    evaluateAnimationBudget(_state.clock.elapsedTime);
    if (shouldRunScheduledTask("duo", "formation", _state.clock.elapsedTime, previousMode.current !== mode || !cachedFormation.current)) {
      cachedFormation.current = measureProfilerPhase("formation", () => duoFormationTargets(mode, props.audio.beatStrength, props.audio.rhythmPhrasePosition, props.reducedMotion));
      previousMode.current = mode;
    }
    const scene = cachedFormation.current!;
    // V143: keep adequate spacing while partner-facing adds subtle stage interaction.
    // V230: shared phrase-based formations, preserving the existing separation/IK pipeline.
    if(props.isPlaying)manualClock.current+=Math.max(0,Math.min(.15,delta));
    const manualActive=canPlayEnsembleTimelineV325(manualTimeline,props.track?.id)&&mode!=="solo"&&!props.reducedMotion;
    const manualTime=manualTimeline.songSync?props.cameraDirectorProgressMs!==undefined&&Number.isFinite(props.cameraDirectorProgressMs)?props.cameraDirectorProgressMs/1000:null:manualClock.current;
    const manualPose=manualActive&&manualTime!==null?evaluateEnsembleTimelineV325(manualTimeline,manualTime):null;
    const formation = choreography?.formation ?? "line";
    const smart = choreography && "interactionMode" in choreography ? choreography as ChoreographyCueV312 : null;
    const leadTarget: [number,number,number] = [...scene.lead];
    const partnerTarget: [number,number,number] = [...scene.partner];
    if (mode !== "solo" && formation === "diagonal") { leadTarget[2] -= .32; partnerTarget[2] += .32; }
    if (mode !== "solo" && formation === "wide") { leadTarget[0] -= .34; partnerTarget[0] += .34; }
    if(manualPose){leadTarget[0]=manualPose.lead[0];leadTarget[1]=manualPose.lead[1];leadTarget[2]=manualPose.lead[2];
      partnerTarget[0]=manualPose.partner[0];partnerTarget[1]=manualPose.partner[1];partnerTarget[2]=manualPose.partner[2];}
    const safe = separatePartners(leadTarget, partnerTarget, 1.35);
    const ensemble=advanceEnsembleBalanceV324(ensembleState.current,{
      trackId:props.track?.id??'',lead:safe.lead,partner:safe.partner,
      role:manualPose?.role ?? choreography?.role,dropAccent:manualPose?.drop ?? choreography?.dropAccent ?? (props.showCue?.enabled===true && props.showCue.section==='drop'),
      beatStrength:props.audio.beatStrength,delta,playing:props.isPlaying,
      reducedMotion:props.reducedMotion,duo:mode!=='solo',footLockEnabled:readFootLockV322().enabled,
      settings:manualPose?{...ensembleSettings,enabled:true}:ensembleSettings,
    });
    // Group transforms only: skinned GLB actions, V322 foot targets and V323 rig offsets stay independent.
    if(ensemble.active&&_state.clock.elapsedTime-lastEnsembleReport.current>=1&&typeof window!=='undefined'){
      lastEnsembleReport.current=_state.clock.elapsedTime;
      window.dispatchEvent(new CustomEvent(ENSEMBLE_BALANCE_DIAGNOSTIC_V324,{detail:{
        separation:Math.round(ensemble.separation*100)/100,
        protectionActive:ensemble.protectionActive,role:ensemble.role,
        footLockEnabled:readFootLockV322().enabled,
      }}));
    }
    const cue = partnerCue(mode, ensemble.lead, ensemble.partner, props.audio.beatStrength, props.reducedMotion);
    const travel = props.reducedMotion ? 20 : 4.5;
    const update = (group: Group | null, target: [number,number,number]) => {
      if (!group) return;
      group.position.x = formationApproach(group.position.x, target[0], delta, travel);
      group.position.y = formationApproach(group.position.y, target[1], delta, travel);
      group.position.z = formationApproach(group.position.z, target[2], delta, travel);
    };
    // V324 directly controls group-space targets when opted in. Do not apply a second high-speed easing.
    if(ensemble.active){
      if(lead.current)lead.current.position.set(...ensemble.lead);
      if(partner.current)partner.current.position.set(...ensemble.partner);
    } else {
      update(lead.current, mode === "solo" ? scene.lead : safe.lead);
      update(partner.current, mode === "solo" ? scene.partner : safe.partner);
    }
    // V312: slight partner-facing invitation during call/response; manual scenes unchanged.
    const interactionStrength = smart && props.isPlaying && !props.reducedMotion ? smart.interactionStrength : 0;
    const leadInvitation = smart?.interactionMode === "exchange" && smart.role === "partner-solo" ? .2 * interactionStrength : 0;
    const partnerInvitation = smart?.interactionMode === "exchange" && smart.role === "lead-solo" ? -.2 * interactionStrength : 0;
    if (lead.current) {
      lead.current.rotation.y = formationApproach(lead.current.rotation.y, cue.leadYaw + leadInvitation + (ensembleCueV392.current?.yaw[0]??0), delta, 3.5);
      lead.current.rotation.z = formationApproach(lead.current.rotation.z, -cue.leadLean, delta, 3.5);
    }
    if (partner.current) {
      partner.current.rotation.y = formationApproach(partner.current.rotation.y, cue.partnerYaw + partnerInvitation + (ensembleCueV392.current?.yaw[1]??0), delta, 3.5);
      partner.current.rotation.z = formationApproach(partner.current.rotation.z, cue.partnerLean, delta, 3.5);
    }
    // V375: stage-root casting only. Manual V325 timelines, authored choreography and
    // explicit show formations take priority; source GLB clips and foot IK are untouched.
    const autoPerformanceV375=resolveAdaptiveVocalPerformanceV375({
      lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
      playing:props.isPlaying,reducedMotion:props.reducedMotion,
      section:props.cameraDirectorSection,bpm:props.audio.bpm,energy:props.audio.energyEnvelope,
      beatAccent:props.audio.beatStrength,count:2,
      mode:props.lipSync?.performanceModeV375??"off",strength:props.lipSync?.performanceStrengthV375??65,
      manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==="solo",
    });
    const displayPerformanceV375=!props.isPlaying&&!props.reducedMotion&&props.lipSync?.performanceModeV375!=="off"&&performanceCueRefV375.current?.enabled
      ?performanceCueRefV375.current:autoPerformanceV375;
    performanceCueRefV375.current=displayPerformanceV375;
    const duetV376=resolveDuetInteractionV376({lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
      playing:props.isPlaying,reducedMotion:props.reducedMotion,count:2,
      mode:props.lipSync?.duetModeV376??"off",strength:props.lipSync?.duetStrengthV376??60,
      performance:displayPerformanceV375,manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==="solo"});
    const manualCueV385=resolveManualVocalCueV385({lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
      playing:props.isPlaying,count:2,enabled:props.lipSync?.manualVocalEnabledV385===true&&
      !!props.track?.id&&props.track.id===props.lipSync?.manualVocalTrackIdV385,
      assignments:props.lipSync?.manualVocalAssignmentsV385,manualPriority:!!manualPose||!!choreography||
      props.showCue?.formationsEnabled===true||mode==="solo"});
    const rapDuetCueV416=resolveRapDuetCueV416({
      lyrics:props.lipSync?.lyrics,progressMs:(props.lipSync?.progressMs??0)+effectiveRapTimingOffsetV418(!!props.lipSync?.rapTimingLiveEnabledV418,props.lipSync?.rapRoleOffsetMsV418??0),playing:props.isPlaying,
      reducedMotion:props.reducedMotion,count:2,
      enabled:props.lipSync?.rapDuetEnabledV416===true&&!manualCueV385.active&&
        !!props.track?.id&&props.track.id===props.lipSync?.rapDuetTrackIdV416,
      assignments:props.lipSync?.rapDuetAssignmentsV416,
      manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==="solo"
    });
    const liveSingerCueV416=rapDuetCueV416.active?toVocalCueV416(rapDuetCueV416):manualCueV385;
    manualVocalCueRefV385.current=liveSingerCueV416;
    const finalDuetV385=applyRapDuetInteractionV416(
      applyManualVocalCueV385(duetV376,manualCueV385,props.reducedMotion),rapDuetCueV416);
    interactionCueRefV376.current=finalDuetV385;
    // V392 blends only reactive role accents; authored and manually assigned roles win.
    const ensembleV392=advanceEnsembleV392(ensembleStateV392.current,{
      settings:resolveEnsembleSettingsV396(readEnsembleV392(),props.experienceCueV396),trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
      delta,playing:props.isPlaying,reducedMotion:props.reducedMotion,count:2,
      section:props.cameraDirectorSection,genre:props.genre,bpm:props.audio.bpm,
      energy:props.audio.energyEnvelope,beat:props.audio.beatStrength,kick:props.audio.kickAccentIntensity,
      leader:displayPerformanceV375.enabled?displayPerformanceV375.leadSlot:0,
      manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==='solo'||
        !!manualActive||!!manualCueV385.active,
    });
    ensembleCueV392.current=ensembleV392;
    concertCueRefV386.current=resolveConcertCueV386({mode:props.lipSync?.concertModeV386,
      strength:props.lipSync?.concertStrengthV386,playing:props.isPlaying,reducedMotion:props.reducedMotion,
      count:2,manual:liveSingerCueV416,duet:finalDuetV385,section:props.cameraDirectorSection,
      beat:props.audio.beatStrength,manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==="solo"});
    const interactiveSlotsV376=finalDuetV385.enabled?finalDuetV385.activeSlots:null;
    const activePartnerV375=interactiveSlotsV376?interactiveSlotsV376.includes(1):displayPerformanceV375.enabled ? displayPerformanceV375.activeSlots.includes(1):scene.partnerVisible;
    const activeLeadV375=interactiveSlotsV376?interactiveSlotsV376.includes(0):displayPerformanceV375.enabled ? displayPerformanceV375.activeSlots.includes(0):true;
    visibility.current = formationApproach(visibility.current,activePartnerV375 ? 1 : 0, delta, props.reducedMotion ? 20 : 3.2);
    if(lead.current){
      const target=activeLeadV375?1:.001;
      const scale=formationApproach(lead.current.scale.x,target,delta,props.reducedMotion?20:3.2);
      lead.current.scale.setScalar(Math.max(.001,scale));
      lead.current.visible=scale>.003;
    }
    // React refs are stable; no per-frame React updates, GLB reloads or mixer resets.
    const watching = props.isPlaying && !props.reducedMotion;
    const a = lead.current?.position ?? {x: 0, y: 0, z: 0};
    const b = partner.current?.position ?? {x: 0, y: 0, z: 0};
    leadLook.current = partnerLookCue(mode, [a.x,a.y,a.z], [b.x,b.y,b.z], watching, visibility.current);
    partnerLook.current = partnerLookCue(mode, [b.x,b.y,b.z], [a.x,a.y,a.z], watching, visibility.current);
    const beat = props.audio.beatStrength;
    // V159: use a single bounded, musical clock for both dancers and partner contact.
    const sync = advancePartnerSync(partnerSync.current, props.audio, delta, mode, watching, props.reducedMotion);
    const phrase = sync.phase;
    // V146: one shared choreography clock; distinct smoothly weighted cues for each dancer.
    const directed = advancePartnerInteraction(interaction.current, props.audio, delta, mode, props.genre, watching, props.reducedMotion, props.duoDirectorEnabled === true);
    const baseLead = props.duoDirectorEnabled === true ? directed.lead : 1;
    const directedLead = (manualPose?(manualPose.role==='partner-solo'?.35:1):(choreography?.leadGain ?? 1) * (choreography ? 1 : baseLead))*(ensembleCueV392.current?.gains[0]??1);
    const basePartner = props.duoDirectorEnabled === true ? directed.partner : 1;
    const directedPartner = (manualPose?(manualPose.role==='lead-solo'?.35:1):(choreography?.partnerGain ?? 1) * (choreography ? 1 : basePartner))*(ensembleCueV392.current?.gains[1]??1);
    leadGesture.current = partnerGestureCue(mode, beat * directedLead, sync.leadPhase, watching, props.reducedMotion, false, visibility.current);
    partnerGesture.current = partnerGestureCue(mode, beat * directedPartner, sync.partnerPhase - (choreography?.partnerDelayBeats ?? 0) * Math.PI / 2, watching, props.reducedMotion, true, visibility.current);
    // V445 in duet mode: only neutral *guest reaction* to a possible mix change.
    // It cannot identify the speaker, choose the lead, or alter mouth/motion clips.
    const duoProgressV445=props.lipSync?.progressMs??0;
    duoVocalEvidenceV445.current=advanceVocalEvidenceV445(duoVocalEvidenceV445.current,{
      trackId:props.track?.id??"",progressMs:duoProgressV445,
      enabled:props.vocalChangeEnabledV445===true&&mode!=="solo"&&
        !!props.artistBubblePlanV441?.enabled,
      microphoneActive:props.vocalChangeMicrophoneActiveV445===true,
      playing:props.isPlaying,reducedMotion:props.reducedMotion,
      manualPriority:!!manualPose||!!choreography||!!manualActive||
        props.showCue?.formationsEnabled===true||!!manualCueV385.active||
        !!rapDuetCueV416.active||!!props.lipSync?.manualVocalEnabledV385||
        !!props.lipSync?.rapDuetEnabledV416&&!!props.lipSync.rapDuetAssignmentsV416?.length,
      lyrics:props.lipSync?.lyrics,audio:props.audio,
      sensitivity:props.vocalChangeSensitivityV445??60,
    });
    const duoHintV445=duoVocalEvidenceV445.current.hint;
    const duoHintKeyV445=duoHintV445?`${props.track?.id??""}:${duoHintV445.atMs}`:"";
    if(duoHintV445&&duoLastHintV445.current!==duoHintKeyV445){
      duoLastHintV445.current=duoHintKeyV445;
      window.dispatchEvent(new CustomEvent(VOCAL_CHANGE_EVENT_V445,{detail:{
        trackId:props.track?.id??"",atMs:duoHintV445.atMs,confidence:duoHintV445.confidence,
      }}));
    }
    const duoResponseV445=vocalHintPulseV445(duoHintV445,duoProgressV445);
    if(duoResponseV445>0){
      partnerGesture.current={...partnerGesture.current,
        rightLift:Math.min(.24,partnerGesture.current.rightLift+duoResponseV445*.12),
        intensity:Math.min(1,partnerGesture.current.intensity+duoResponseV445*.18)};
    }
    // V452: two-person crew accent uses the existing duo contexts. It cannot
    // replace manual duets, authored formations, hand contact or singer IDs.
    const crewDuoV452=planCrewAccentsV452({
      enabled:props.artistInteractionEnabledV444===true&&!!props.artistBubblePlanV441?.enabled&&mode!=="solo",
      playing:props.isPlaying,reducedMotion:props.reducedMotion,
      manualPriority:!!manualPose||!!manualActive||!!choreography||
        props.showCue?.formationsEnabled===true||!!manualCueV385.active||!!rapDuetCueV416.active||
        displayPerformanceV375.enabled||finalDuetV385.enabled||
        (props.lipSync?.manualVocalEnabledV385===true&&props.track?.id===props.lipSync?.manualVocalTrackIdV385)||
        (props.lipSync?.rapDuetEnabledV416===true&&props.track?.id===props.lipSync?.rapDuetTrackIdV416&&
          !!props.lipSync.rapDuetAssignmentsV416?.length),
      count:2,positions:[[a.x,a.y,a.z],[b.x,b.y,b.z]],
      focus:props.cameraDirectorSection==='hook'?-1:0,
      drop:props.cameraDirectorSection==='hook',section:props.cameraDirectorSection,
      seconds:Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:manualClock.current,
      cueSeconds:Math.floor((Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:manualClock.current)/6)*6,
      beat:props.audio.beatStrength,energy:props.audio.energyEnvelope,
      strength:props.artistInteractionStrengthV444??60,
    });
    // V458 refines only the bounded upper-body overlay in duo mode;
    // partner hand-IK and root contacts always remain controlled by V145/V159.
    const crewDuoV458=refineNaturalCrewV458(crewDuoV452,{
      seconds:Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:manualClock.current,
      cueSeconds:Math.floor((Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:manualClock.current)/6)*6,
      beat:props.audio.beatStrength??0,energy:props.audio.energyEnvelope??0,
      positions:[[a.x,a.y,a.z],[b.x,b.y,b.z]],quality:getActivePerformanceTier(),footLocked:true,
    });
    if(crewDuoV458.active){
      leadGesture.current=combineCrewGesturesV452(leadGesture.current,crewDuoV458.slots[0].gesture);
      partnerGesture.current=combineCrewGesturesV452(partnerGesture.current,crewDuoV458.slots[1].gesture);
      leadLook.current=combineCrewLooksV452(leadLook.current,crewDuoV458.slots[0].look);
      partnerLook.current=combineCrewLooksV452(partnerLook.current,crewDuoV458.slots[1].look);
    }
    // Both hands approach a shared point only during greeting / together phases.
    const handWeight = handInteractionWeight(mode, directed.phase, watching, props.reducedMotion, props.duoDirectorEnabled === true, visibility.current) * sync.contactGain;
    const target: [number, number, number] = [(a.x + b.x) / 2, Math.max(a.y, b.y) + 1.1, (a.z + b.z) / 2];
    leadHand.current = {enabled: handWeight > 0, strength: handWeight, target};
    partnerHand.current = {enabled: handWeight > 0, strength: handWeight, target};

    if (partner.current) {
      // Shrink/expand without unmounting the skinned character (keeps animation clips alive).
      const visibleScale = Math.max(0.001, visibility.current);
      const mirror = mode === "mirror" ? -1 : 1;
      partner.current.scale.set(visibleScale * mirror, visibleScale, visibleScale);
      partner.current.visible = visibility.current > 0.003 || dual;
    }
  });
  return <>
    <group name="v377-vocal-stage-slot-0" ref={lead} position={[0,0,0]}><PartnerLookContext.Provider value={leadLook}><PartnerGestureContext.Provider value={leadGesture}><PartnerHandContext.Provider value={leadHand}><PartnerCalibrationContext.Provider value={props.partnerContactCalibration ?? null}><Dancer props={leadProps} /><ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={0} reducedMotion={props.reducedMotion}/></PartnerCalibrationContext.Provider></PartnerHandContext.Provider></PartnerGestureContext.Provider></PartnerLookContext.Provider></group>
    <group name="v377-vocal-stage-slot-1" ref={partner} position={[1.9,0,-0.5]} scale={[0.001,0.001,0.001]}>
      <PartnerLookContext.Provider value={partnerLook}><PartnerGestureContext.Provider value={partnerGesture}><PartnerHandContext.Provider value={partnerHand}><PartnerCalibrationContext.Provider value={props.secondaryContactCalibration ?? null}><Dancer props={partnerProps} secondary /><ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={1} reducedMotion={props.reducedMotion}/></PartnerCalibrationContext.Provider></PartnerHandContext.Provider></PartnerGestureContext.Provider></PartnerLookContext.Provider>
    </group>
  </>;
}

/** V326: optional four independent mixers/IK rigs, one shared formation clock.
 * Stage roots only; legacy V325 duo path remains untouched when V326 is off. */
