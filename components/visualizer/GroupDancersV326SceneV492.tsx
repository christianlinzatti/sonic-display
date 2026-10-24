"use client";
// Extracted unchanged from ThreeAvatar.tsx (V492 modular refactor).
// --- Extracted dependencies (V492 refactor) ---
import { resolveEnsembleSettingsV396 } from "./performanceExperienceV396";
import { advanceEnsembleV392, initialEnsembleV392, readEnsembleV392 } from "./ensemblePerformanceV392";
import { useFrame } from "@react-three/fiber";
import { formationApproach } from "./duoFormationEngine";
import { canRunGroupV326, evaluateGroupV326, type GroupStudioV326 } from "./multiAvatarStageDirectorV326";
import { getAvatarModel } from "./avatarModels";
import { readGroupSyncV327, GROUP_SYNC_EVENT_V327, evaluateGroupSyncV327, type GroupSyncV327 } from "./groupDanceSynchronizationV327";
import { readMotionSyncV328, MOTION_SYNC_EVENT_V328, type MotionSyncV328, type MotionSyncClockV328 } from "./groupMotionSynchronizationV328";
import { readPhraseV329, PHRASE_EVENT_V329, planGroupPhrasesV329, type PhraseSettingsV329, type PhraseSignatureV329 } from "./intelligentMotionPhraseV329";
import { readTrackAnalysisV318, ANALYSIS_EVENT_V318, type TrackAnalysisV318 } from "@/services/musicAnalysis/trackAnalysisV318";
import { NEUTRAL_LOOK } from "./partnerLookAtEngine";
import { NEUTRAL_GESTURE } from "./partnerGestureEngine";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArtistNameBubbleV441 } from "./ArtistNameBubbleV441";
import { planArtistSpotlightV443 } from "./artistSpotlightV443";
import { planMultiArtistInteractionV444 } from "./multiArtistInteractionV444";
import { planCrewAccentsV452, combineCrewGesturesV452, combineCrewLooksV452 } from "./advancedMultiAvatarPerformanceV452";
import { refineNaturalCrewV458 } from "./naturalStageInteractionV458";
import { VOCAL_CHANGE_EVENT_V445, advanceVocalEvidenceV445, emptyVocalEvidenceV445, vocalHintPulseV445 } from "./vocalChangeEvidenceV445";
import { type Group } from "three";
import type { VisualizerProps } from "./registry";
import { effectiveRapTimingOffsetV418 } from "./rapPerformanceQualityV418";
import { resolveAdaptiveVocalPerformanceV375 } from "./adaptiveVocalPerformanceV375";
import { resolveDuetInteractionV376 } from "./interactiveVocalDuetsV376";
import { resolveConcertCueV386 } from "./expressiveConcertDirectorV386";
import { resolveManualVocalCueV385, applyManualVocalCueV385 } from "./manualVocalCastingV385";
import { resolveRapDuetCueV416, applyRapDuetInteractionV416, toVocalCueV416 } from "./rapDuetStudioV416";
import { featureSpotlightV460, featureInteractionV460 } from "./intelligentFeaturePerformanceV460";
import { refineMultiAvatarInteractionV475 } from "./intelligentMultiAvatarInteractionV475";
import { LOW_POSE_EVENT_V481, readLowPoseV481, planLowPosesV481, type LowPoseSlotV481 } from "./intelligentLowPoseV481";
import { newLowInteractionStateV483, stepLowInteractionV483 } from "./naturalLowPoseInteractionV483";
import { planExpressiveLowPoseV484 } from "./expressiveLowPosePerformanceV484";
import { planNaturalDanceMotionV485, type NaturalDanceSlotV485 } from "./naturalDanceMotionStudioV485";
import { planAdvancedDanceFootworkV486, type FootSupportV486, type FootworkSlotV486 } from "./advancedDanceFootworkV486";
import { buildGroundContactReportV487, emptyGroundObservationV487, GROUND_CONTACT_REPORT_EVENT_V487 } from './groundContactStudioV487';
import { readFootLockV322, FOOT_LOCK_EVENT_V322 } from "./intelligentFootLockV322";
import { getActivePerformanceTier } from "./adaptivePerformance";
import { Dancer } from './DanceFormationActorsV492';
import { GroupDanceMotionContextV485, GroupFootSupportContextV486, GroupFootworkContextV486, GroupGroundObservationContextV487, GroupLowPoseContextV481, GroupMotionClockContextV328, GroupPhraseContextV329, PartnerCalibrationContext, PartnerGestureContext, PartnerLookContext } from './ThreeAvatarContextsV492';

export function GroupDancersV326({props,settings}:{props:VisualizerProps;settings:GroupStudioV326}){
 const refs=useRef<(Group|null)[]>([null,null,null,null]);
 // Stable mutable contexts: individual avatar rigs read these inside their existing
 // V144/V145 head/arm overlay without React renders or resetting motion mixers.
 const looksV444=useRef(Array.from({length:4},()=>({current:{...NEUTRAL_LOOK}})));
 const lowPosesV481=useRef(Array.from({length:4},()=>({current:{mode:"stand" as LowPoseSlotV481["mode"],depth:0}})));
 const danceMotionV485=useRef(Array.from({length:4},()=>({current:{offsetX:0,offsetZ:0,step:0,lean:0} as NaturalDanceSlotV485})));
 const footworkV486=useRef(Array.from({length:4},()=>({current:{offsetX:0,offsetZ:0,liftLeft:0,liftRight:0,rootSpeed:1,weightShift:0} as FootworkSlotV486})));
 const supportV486=useRef(Array.from({length:4},()=>({current:{tracked:false,leftPlanted:false,rightPlanted:false} as FootSupportV486})));
 const groundV487=useRef(Array.from({length:4},()=>({current:emptyGroundObservationV487()})));
 const lastGroundReportV487=useRef(-1);
 const lowInteractionV483=useRef(newLowInteractionStateV483());
 const [lowSettingsV481,setLowSettingsV481]=useState(readLowPoseV481);
 useEffect(()=>{const update=()=>setLowSettingsV481(readLowPoseV481());window.addEventListener(LOW_POSE_EVENT_V481,update);return()=>window.removeEventListener(LOW_POSE_EVENT_V481,update);},[]);
 const gesturesV444=useRef(Array.from({length:4},()=>({current:{...NEUTRAL_GESTURE}})));
 // V445: ephemeral track-scoped band summaries; no waveform, uploads or artist identities.
 const vocalEvidenceV445=useRef(emptyVocalEvidenceV445());
 const lastPublishedV445=useRef("");
 const ensembleStateV392=useRef(initialEnsembleV392());
 const performanceCueRefV375=useRef<ReturnType<typeof resolveAdaptiveVocalPerformanceV375>|null>(null);
 const interactionCueRefV376=useRef<ReturnType<typeof resolveDuetInteractionV376>|null>(null);
  const concertCueRefV386=useRef<ReturnType<typeof resolveConcertCueV386>|null>(null);
 const manualVocalCueRefV385=useRef<ReturnType<typeof resolveManualVocalCueV385>|null>(null);
 const time=useRef(0);
 const contact=useRef(readFootLockV322());
 const [motionSyncV328,setMotionSyncV328]=useState<MotionSyncV328>(readMotionSyncV328);
 const [phraseSettingsV329,setPhraseSettingsV329]=useState<PhraseSettingsV329>(readPhraseV329);
 const [phraseProfilesV329,setPhraseProfilesV329]=useState<readonly (readonly PhraseSignatureV329[])[]>([[],[],[],[]]);
 const registerPhrasesV329=useCallback((slot:number,profiles:readonly PhraseSignatureV329[])=>{
  if(slot<0||slot>3)return;
  setPhraseProfilesV329(prior=>{
   const old=prior[slot];
   const identity=(xs:readonly PhraseSignatureV329[])=>xs.map(s=>`${s.index}:${s.name}:${s.duration}:${s.evidence}:${s.wave.join(',')}`).join('|');
   if(identity(old)===identity(profiles))return prior;
   const next=[...prior];next[slot]=profiles;return next;
  });
 },[]);
 const phrasePlanV329=useMemo(()=>planGroupPhrasesV329(phraseProfilesV329,settings.count,phraseSettingsV329,motionSyncV328.enabled?motionSyncV328.clipIndexes:[],motionSyncV328.beatCycle),[phraseProfilesV329,settings.count,phraseSettingsV329,motionSyncV328.clipIndexes,motionSyncV328.beatCycle]);
 const motionClocksV328=useRef<Array<{current:MotionSyncClockV328}>>(Array.from({length:4},(_,slot)=>({current:{enabled:false,seconds:0,bpm:128,playing:false,reducedMotion:false,slot}})));
 const [rhythm,setRhythm]=useState<GroupSyncV327>(readGroupSyncV327);
 const beatAnalysis=useRef<TrackAnalysisV318|null>(null);
 const beatSeconds=useRef<number[]>([]);
 // Each dancer receives an independent normalized audio object. Never mutate the
 // shared microphone/Spotify source, and never rewrite imported GLB keyframes.
 const groupAudio=useRef<VisualizerProps['audio'][]>(Array.from({length:4},()=>({...props.audio})));
 useEffect(()=>{const sync=()=>setRhythm(readGroupSyncV327());window.addEventListener(GROUP_SYNC_EVENT_V327,sync);return()=>window.removeEventListener(GROUP_SYNC_EVENT_V327,sync);},[]);
 useEffect(()=>{const sync=()=>setMotionSyncV328(readMotionSyncV328());window.addEventListener(MOTION_SYNC_EVENT_V328,sync);return()=>window.removeEventListener(MOTION_SYNC_EVENT_V328,sync);},[]);
 useEffect(()=>{const sync=()=>setPhraseSettingsV329(readPhraseV329());window.addEventListener(PHRASE_EVENT_V329,sync);return()=>window.removeEventListener(PHRASE_EVENT_V329,sync);},[]);
 useEffect(()=>{const refresh=()=>{beatAnalysis.current=readTrackAnalysisV318(props.track?.id??'');beatSeconds.current=beatAnalysis.current?.beats.map(b=>b.startMs/1000)??[];};refresh();window.addEventListener(ANALYSIS_EVENT_V318,refresh);return()=>window.removeEventListener(ANALYSIS_EVENT_V318,refresh);},[props.track?.id]);
 useEffect(()=>{const sync=()=>{contact.current=readFootLockV322();};window.addEventListener(FOOT_LOCK_EVENT_V322,sync);return()=>window.removeEventListener(FOOT_LOCK_EVENT_V322,sync);},[]);
 useEffect(()=>{time.current=0;},[props.track?.id]);
 useEffect(()=>{ensembleStateV392.current=initialEnsembleV392();},[props.track?.id]);
 const urls=useMemo(()=>settings.modelIds.map(id=>id?getAvatarModel(id):null),[settings.modelIds]);
 useFrame((_state,delta)=>{
  if(props.isPlaying)time.current+=Math.min(.15,Math.max(0,delta));
  const seconds=settings.songSync ? (Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:null):time.current;
  if(seconds===null)return;
  const pose=evaluateGroupV326(settings,seconds);
  if(!pose)return;
  const analysis=settings.songSync?beatAnalysis.current:null;
  // V392: one shared section/phrase clock, with the existing V326 authored stage
  // positions left intact. Never reinterpret manually assigned singer roles.
  const ensembleV392=advanceEnsembleV392(ensembleStateV392.current,{
   settings:resolveEnsembleSettingsV396(readEnsembleV392(),props.experienceCueV396),trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
   delta,playing:props.isPlaying,reducedMotion:props.reducedMotion,count:settings.count,
   section:props.cameraDirectorSection,genre:props.genre,bpm:analysis?.tempo??props.audio.bpm,
   energy:props.audio.energyEnvelope,beat:props.audio.beatStrength,kick:props.audio.kickAccentIntensity,
   leader:interactionCueRefV376.current?.enabled?interactionCueRefV376.current.leadSlot:
     performanceCueRefV375.current?.enabled?performanceCueRefV375.current.leadSlot:0,
   manualPriority:!!settings.trackId||(props.lipSync?.manualVocalEnabledV385===true&&
     props.track?.id===props.lipSync?.manualVocalTrackIdV385),
  });
  const music=evaluateGroupSyncV327(rhythm,{seconds,bpm:analysis?.tempo??props.audio.bpm??settings.bpm,count:settings.count,
    focus:pose.focus,drop:pose.drop,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    beatTimes:beatSeconds.current,beatsPerBar:analysis?.timeSignature});
  for(let i=0;i<settings.count;i++){
   const target=groupAudio.current[i],gain=music.gains[i]*ensembleV392.gains[i],pulse=music.pulses[i];
   // A modest, evidence-gated echo lets a later dancer accent an existing onset;
   // beat-grid prediction alone cannot synthesize a missing audio beat.
   const onset=Math.max(props.audio.beatStrength??0,props.audio.kickAccentIntensity??0,props.audio.snare??0);
   const echo=music.playing&&rhythm.enabled?Math.min(.18,onset*.18)*pulse*gain:0;
   const weight=music.playing&&rhythm.enabled?gain*(rhythm.mode==='stagger'?.55+.45*pulse:1):1;
   Object.assign(target,props.audio,{
     beatStrength:Math.min(1,(props.audio.beatStrength??0)*weight+echo),
     kickAccentIntensity:Math.min(1,(props.audio.kickAccentIntensity??0)*weight+echo),
     kick:(props.audio.kick??0)*weight,
     snare:(props.audio.snare??0)*weight,
     rhythmPhraseAccent:(props.audio.rhythmPhraseAccent??0)*weight,
   });
  }
  // Shared clock published without React setState/rerenders on every frame.
  // Imported beats are only safe when this group follows the song timeline.
  for(let slot=0;slot<settings.count;slot++){
   Object.assign(motionClocksV328.current[slot].current,{enabled:canRunGroupV326(settings,props.track?.id),seconds,
    bpm:analysis?.tempo??props.audio.bpm??settings.bpm,beatTimes:settings.songSync?beatSeconds.current:undefined,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,slot});
  }
  const performanceV375=resolveAdaptiveVocalPerformanceV375({
    lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    section:props.cameraDirectorSection,bpm:analysis?.tempo??props.audio.bpm,
    energy:props.audio.energyEnvelope,beatAccent:props.audio.beatStrength,
    count:settings.count,mode:props.lipSync?.performanceModeV375??"off",
    strength:props.lipSync?.performanceStrengthV375??65,
    // Track-specific manually authored stage scripts must never be overridden.
    manualPriority:!!settings.trackId,
  });
  const displayPerformanceV375=!props.isPlaying&&!props.reducedMotion&&props.lipSync?.performanceModeV375!=="off"&&performanceCueRefV375.current?.enabled
    ?performanceCueRefV375.current:performanceV375;
  performanceCueRefV375.current=displayPerformanceV375;
  const duetV376=resolveDuetInteractionV376({lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,count:settings.count,
    mode:props.lipSync?.duetModeV376??"off",strength:props.lipSync?.duetStrengthV376??60,
    performance:displayPerformanceV375,manualPriority:!!settings.trackId});
  const manualCueV385=resolveManualVocalCueV385({lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
    playing:props.isPlaying,count:settings.count,enabled:props.lipSync?.manualVocalEnabledV385===true&&
    !!props.track?.id&&props.track.id===props.lipSync?.manualVocalTrackIdV385,
    assignments:props.lipSync?.manualVocalAssignmentsV385,manualPriority:!!settings.trackId});
  const rapDuetCueV416=resolveRapDuetCueV416({
    lyrics:props.lipSync?.lyrics,progressMs:(props.lipSync?.progressMs??0)+effectiveRapTimingOffsetV418(!!props.lipSync?.rapTimingLiveEnabledV418,props.lipSync?.rapRoleOffsetMsV418??0),playing:props.isPlaying,
    reducedMotion:props.reducedMotion,count:settings.count,
    enabled:props.lipSync?.rapDuetEnabledV416===true&&!manualCueV385.active&&
      !!props.track?.id&&props.track.id===props.lipSync?.rapDuetTrackIdV416,
    assignments:props.lipSync?.rapDuetAssignmentsV416,manualPriority:!!settings.trackId
  });
  const liveSingerCueV416=rapDuetCueV416.active?toVocalCueV416(rapDuetCueV416):manualCueV385;
  manualVocalCueRefV385.current=liveSingerCueV416;
  const finalDuetV385=applyRapDuetInteractionV416(
    applyManualVocalCueV385(duetV376,manualCueV385,props.reducedMotion),rapDuetCueV416);
  interactionCueRefV376.current=finalDuetV385;
  concertCueRefV386.current=resolveConcertCueV386({mode:props.lipSync?.concertModeV386,
    strength:props.lipSync?.concertStrengthV386,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    count:settings.count,manual:liveSingerCueV416,duet:finalDuetV385,section:props.cameraDirectorSection,
    beat:props.audio.beatStrength,manualPriority:!!settings.trackId});
  const activeSlotsV376=finalDuetV385.enabled?finalDuetV385.activeSlots:null;
  const spotlightPoseV443=props.artistSpotlightV443?.enabled&&settings===props.autoMultiArtistGroupV442;
  const currentCueAtV443=spotlightPoseV443?settings.cues.find(c=>c.id===pose.cueId)?.at??0:0;
  const spotlightV443=featureSpotlightV460(planArtistSpotlightV443({pose,count:settings.count,seconds,cueAt:currentCueAtV443,
    enabled:!!spotlightPoseV443,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!manualCueV385.active||!!rapDuetCueV416.active||
      !!displayPerformanceV375.enabled||!!finalDuetV385.enabled||
      props.artistBubblePlanV441?.source==="manual-stage",
    strength:props.artistSpotlightV443?.strength??65}),
    props.featureDirectionV460??{active:false,moment:"off",lead:0,partner:0,group:false,eventId:"",responseGain:0,cameraCue:null});
  // V444: user-authored V385/V416 singer assignment wins over visually inferred
  // spotlight. Never infer real recorded singers from track credits.
  const selectedSingerV444=rapDuetCueV416.active?toVocalCueV416(rapDuetCueV416):
    manualCueV385.active?manualCueV385:null;
  vocalEvidenceV445.current=advanceVocalEvidenceV445(vocalEvidenceV445.current,{
    trackId:props.track?.id??"",progressMs:props.lipSync?.progressMs??0,
    enabled:props.vocalChangeEnabledV445===true&&settings===props.autoMultiArtistGroupV442,
    microphoneActive:props.vocalChangeMicrophoneActiveV445===true,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!settings.trackId||!!selectedSingerV444||
      (props.lipSync?.manualVocalEnabledV385===true)||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    lyrics:props.lipSync?.lyrics,audio:props.audio,
    sensitivity:props.vocalChangeSensitivityV445??60,
  });
  const hintV445=vocalEvidenceV445.current.hint;
  const hintKeyV445=hintV445?`${props.track?.id??""}:${hintV445.atMs}`:"";
  if(hintV445&&lastPublishedV445.current!==hintKeyV445){
    lastPublishedV445.current=hintKeyV445;
    // Only bounded time/confidence metadata; no samples, lyrics or inferred artist.
    window.dispatchEvent(new CustomEvent(VOCAL_CHANGE_EVENT_V445,{detail:{
      trackId:props.track?.id??"",atMs:hintV445.atMs,confidence:hintV445.confidence,
    }}));
  }
  const mixChangePulseV445=!selectedSingerV444?
    vocalHintPulseV445(hintV445,props.lipSync?.progressMs??0):0;
  const interactionBaseV444=planMultiArtistInteractionV444({
    pose,count:settings.count,enabled:!!props.artistInteractionEnabledV444&&
      settings===props.autoMultiArtistGroupV442,playing:props.isPlaying,
    reducedMotion:props.reducedMotion,manualStage:!!settings.trackId||
      // Existing explicitly selected duet/performance directors own these cues.
      (!selectedSingerV444&&(displayPerformanceV375.enabled||
        (props.lipSync?.duetModeV376??"off")!=="off")),
    singer:selectedSingerV444,beat:props.audio.beatStrength,
    seconds,cueAt:currentCueAtV443,strength:props.artistInteractionStrengthV444??60,
    audioChangePulse:mixChangePulseV445,
  });
  const interactionV444=featureInteractionV460(interactionBaseV444,
    props.featureDirectionV460??{active:false,moment:"off",lead:0,partner:0,group:false,eventId:"",responseGain:0,cameraCue:null});
  // V475: only refine automatically directed visual interactions. Explicit singer
  // assignments, saved stage cues, GLB clips and lip-sync ownership are untouched.
  const interactionV475=refineMultiAvatarInteractionV475({
    base:interactionV444,pose,feature:props.featureDirectionV460,
    trackId:props.track?.id,count:settings.count,seconds,cueSeconds:currentCueAtV443,
    beat:props.audio.beatStrength??0,strength:props.artistInteractionStrengthV444??60,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!settings.trackId||!!selectedSingerV444||
      displayPerformanceV375.enabled||finalDuetV385.enabled,
    tier:getActivePerformanceTier(),
  });
  // V452: additive visual crew accents. Explicitly authored V385/V416 singer
  // parts, manual stage cues and alternative performance directors keep priority.
  const crewV452=planCrewAccentsV452({
    enabled:props.artistInteractionEnabledV444===true&&settings===props.autoMultiArtistGroupV442,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!settings.trackId||!!selectedSingerV444||
      displayPerformanceV375.enabled||finalDuetV385.enabled||
      (props.lipSync?.duetModeV376??"off")!=="off"||
      (props.lipSync?.manualVocalEnabledV385===true&&props.track?.id===props.lipSync?.manualVocalTrackIdV385)||
      (props.lipSync?.rapDuetEnabledV416===true&&props.track?.id===props.lipSync?.rapDuetTrackIdV416&&
        !!props.lipSync.rapDuetAssignmentsV416?.length),
    count:settings.count,positions:pose.positions,focus:pose.focus,drop:pose.drop,
    section:props.cameraDirectorSection,seconds,cueSeconds:currentCueAtV443,
    beat:props.audio.beatStrength,energy:props.audio.energyEnvelope,
    strength:props.artistInteractionStrengthV444??60,blend:pose.blend,
  });
  // V458: keep existing V452 gating and all manual stage/vocal priorities.
  // Contact IK prohibits additional stage-root translation; the existing
  // performance tier limits only optional accents, not imported motion clips.
  const footLock=contact.current.enabled;
  const crewV458=refineNaturalCrewV458(crewV452,{
    seconds,cueSeconds:currentCueAtV443,beat:props.audio.beatStrength??0,
    energy:props.audio.energyEnvelope??0,positions:pose.positions,
    quality:getActivePerformanceTier(),footLocked:footLock,
  });
  for(let i=0;i<settings.count;i++){
    const accent=crewV458.slots[i];
    Object.assign(looksV444.current[i].current,accent?
      combineCrewLooksV452(interactionV475.slots[i]?.look??NEUTRAL_LOOK,accent.look):
      interactionV475.slots[i]?.look??NEUTRAL_LOOK);
    Object.assign(gesturesV444.current[i].current,accent?
      combineCrewGesturesV452(interactionV475.slots[i]?.gesture??NEUTRAL_GESTURE,accent.gesture):
      interactionV475.slots[i]?.gesture??NEUTRAL_GESTURE);
  }
  // V481: bounded automatic group-only body-pose intentions. No manual V326
  // cue, karaoke foreground or authored vocal/timeline may trigger low poses.
  const lowPlanV481=planLowPosesV481({
    settings:lowSettingsV481,count:settings.count,trackId:props.track?.id,
    seconds,cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,focus:pose.focus,drop:pose.drop,
    section:props.cameraDirectorSection,genre:props.genre,
    beat:props.audio.beatStrength??0,kick:props.audio.kickAccentIntensity??0,
    energy:props.audio.energyEnvelope??0,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    automaticGroup:settings===props.autoMultiArtistGroupV442,
    manualPriority:!!selectedSingerV444||displayPerformanceV375.enabled||finalDuetV385.enabled||
      (props.avatarMotionMode==='choreography')||
      (props.lipSync?.manualVocalEnabledV385===true)||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    lyricsForeground:props.lipSync?.cinematicLyricsVisibleV378===true && !props.lipSync?.cinematicLyricsSideV378,
    tier:getActivePerformanceTier(),
  });
  // V483: stage-wide crouch responses are layered on top of V475/V458 gaze
  // and gestures. Only the fresh V481 plan is updated; existing rigs own IK.
  const lowInteractionPlanV483=stepLowInteractionV483(lowInteractionV483.current,{
    plan:lowPlanV481,positions:pose.positions,count:settings.count,
    trackId:props.track?.id,seconds,
    cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,
    focus:pose.focus,drop:pose.drop,beat:props.audio.beatStrength??0,
    energy:props.audio.energyEnvelope??0,playing:props.isPlaying,
    reducedMotion:props.reducedMotion,
    manualPriority:!!selectedSingerV444||!!settings.trackId||displayPerformanceV375.enabled||
      finalDuetV385.enabled||props.avatarMotionMode==='choreography'||
      props.lipSync?.manualVocalEnabledV385===true||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    automaticGroup:settings===props.autoMultiArtistGroupV442,
    lyricsForeground:props.lipSync?.cinematicLyricsVisibleV378===true&&!props.lipSync?.cinematicLyricsSideV378,
    enabled:lowSettingsV481.enabled,tier:getActivePerformanceTier(),
    maxConcurrent:lowSettingsV481.maxConcurrent,
  });
  for(let i=0;i<settings.count;i++){
    Object.assign(lowPosesV481.current[i].current,lowInteractionPlanV483.plan.slots[i]);
    const accent=lowInteractionPlanV483.slots[i];
    if(accent){
      Object.assign(looksV444.current[i].current,combineCrewLooksV452(looksV444.current[i].current,accent.look));
      Object.assign(gesturesV444.current[i].current,combineCrewGesturesV452(gesturesV444.current[i].current,accent.gesture));
    }
  }
  // V484: optional whole-body expressive accents on existing partner gesture
  // channels. A low-pose scene must already have passed V481/V483 priority
  // guards; no new rig, GLB retarget or beat/voice inference is introduced.
  const expressiveV484=planExpressiveLowPoseV484({
    plan:lowInteractionPlanV483.plan,count:settings.count,focus:pose.focus,
    seconds,cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,
    genre:props.genre,section:props.cameraDirectorSection,
    beat:props.audio.beatStrength??0,kick:props.audio.kickAccentIntensity??0,
    snare:props.audio.snare??0,energy:props.audio.energyEnvelope??0,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!selectedSingerV444||!!settings.trackId||displayPerformanceV375.enabled||
      finalDuetV385.enabled||props.avatarMotionMode==='choreography'||
      props.lipSync?.manualVocalEnabledV385===true||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    automaticGroup:settings===props.autoMultiArtistGroupV442,
    lyricsForeground:props.lipSync?.cinematicLyricsVisibleV378===true&&!props.lipSync?.cinematicLyricsSideV378,
    tier:getActivePerformanceTier(),
  });
  if(expressiveV484.active)for(let i=0;i<settings.count;i++){
    Object.assign(gesturesV444.current[i].current,
      combineCrewGesturesV452(gesturesV444.current[i].current,expressiveV484.accents[i]));
  }
  // V485: deterministic, corridor-safe near-passes and synchronized returns.
  // Every avatar retains its own original stage slot, mixer and Foot IK. A
  // crowding/foot-lock/manual cue inhibits all optional translations.
  const naturalMotionV485=planNaturalDanceMotionV485({
    plan:lowInteractionPlanV483.plan,count:settings.count,positions:pose.positions,
    focus:pose.focus,trackId:props.track?.id,seconds,
    cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,
    beat:props.audio.beatStrength??0,kick:props.audio.kickAccentIntensity??0,
    energy:props.audio.energyEnvelope??0,genre:props.genre,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!selectedSingerV444||!!settings.trackId||displayPerformanceV375.enabled||
      finalDuetV385.enabled||props.avatarMotionMode==='choreography'||
      props.lipSync?.manualVocalEnabledV385===true||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    lyricsForeground:props.lipSync?.cinematicLyricsVisibleV378===true&&!props.lipSync?.cinematicLyricsSideV378,
    automaticGroup:settings===props.autoMultiArtistGroupV442,
    footLocked:footLock,tier:getActivePerformanceTier(),
  });
  // V486: single song-time foot cadence + existing GLB Foot-IK stance reports;
  // scale only OPTIONAL V485 translation, never authored formation or clips.
  const advancedFootworkV486=planAdvancedDanceFootworkV486({
    motion:naturalMotionV485,count:settings.count,seconds,
    cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,
    bpm:props.audio.bpm,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!selectedSingerV444||!!settings.trackId||displayPerformanceV375.enabled||
      finalDuetV385.enabled||props.avatarMotionMode==='choreography'||
      props.lipSync?.manualVocalEnabledV385===true||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    footLocked:footLock,tier:getActivePerformanceTier(),
    support:supportV486.current.map(ref=>ref.current),
  });
  const contactReportV487=buildGroundContactReportV487(
    groundV487.current.map(item=>item.current),advancedFootworkV486.slots,settings.count,
    props.isPlaying&&!props.reducedMotion);
  // Reuse the existing group frame callback. Emit at most twice per second;
  // React controls never update component state from individual frame reports.
  if(typeof window!=='undefined'&&seconds-lastGroundReportV487.current>=.5){
    lastGroundReportV487.current=seconds;
    window.dispatchEvent(new CustomEvent(GROUND_CONTACT_REPORT_EVENT_V487,{detail:contactReportV487}));
  } else if(seconds<lastGroundReportV487.current-0.2){
    lastGroundReportV487.current=seconds-0.5; // seek backwards
  }
  for(let i=0;i<settings.count;i++){
    Object.assign(footworkV486.current[i].current,advancedFootworkV486.slots[i]);
    Object.assign(danceMotionV485.current[i].current,naturalMotionV485.slots[i]);
    // Add only small expressive upper-body compensation to existing clamps.
    if(naturalMotionV485.active){
      const g=gesturesV444.current[i].current;
      Object.assign(g,combineCrewGesturesV452(g,{leftLift:0,rightLift:0,shoulder:0,
        lean:naturalMotionV485.slots[i].lean,intensity:Math.abs(naturalMotionV485.slots[i].lean)}));
    }
  }
  const groundTravelV487=contactReportV487.slots.map(slot=>slot.travelMultiplier);
  const speed=props.reducedMotion?20:footLock?1.65:3.4;
  const beat=props.isPlaying&&!props.reducedMotion?Math.max(0,Math.min(1,props.audio.beatStrength??0)):0;
  for(let i=0;i<settings.count;i++){
   const g=refs.current[i];if(!g)continue;
   const p=pose.positions[i];
   // Root translation only: keep each imported clip and its IK isolated.
   const dropWidth=pose.drop?beat*.08:0;
   const present=activeSlotsV376?activeSlotsV376.includes(i):displayPerformanceV375.enabled?displayPerformanceV375.activeSlots.includes(i):true;
   const focus=finalDuetV385.enabled?finalDuetV385.leadSlot===i:displayPerformanceV375.enabled&&displayPerformanceV375.leadSlot===i;
   // V376 facial call-and-response must not reorder existing group roots every lyric line.
   // V375 keeps the phrase-stable cast; temporarily reintroduced dancers keep their stage slot.
   const inV375Cast=displayPerformanceV375.activeSlots.includes(i);
   const targetX=displayPerformanceV375.enabled&&present&&inV375Cast
     ?(displayPerformanceV375.activeSlots.indexOf(i)-(displayPerformanceV375.activeCount-1)/2)*Math.max(1.28,settings.minSpacing+.2)
     :p[0]+Math.sign(p[0])*dropWidth;
   const targetZ=(displayPerformanceV375.enabled&&present?(focus?-.18-.20*(duetV376.enabled?duetV376.emphasis:displayPerformanceV375.emphasis):0):p[2]+(pose.focus===i?-.18:0))+(spotlightV443.slots[i]?.offsetZ??0);
   // V452 accents are stage-root translations, below 5 cm; spacing preserved
   // for hooks (all dancers receive the same lateral offset).
   g.position.x=formationApproach(g.position.x,targetX+(crewV458.slots[i]?.offsetX??0)+advancedFootworkV486.slots[i].offsetX,delta,speed*advancedFootworkV486.slots[i].rootSpeed*(groundTravelV487[i]??1));
   g.position.z=formationApproach(g.position.z,targetZ+(crewV458.slots[i]?.offsetZ??0)+advancedFootworkV486.slots[i].offsetZ,delta,speed*advancedFootworkV486.slots[i].rootSpeed*(groundTravelV487[i]??1));
   g.position.y=0;
   g.rotation.y=formationApproach(g.rotation.y,ensembleV392.yaw[i]+(spotlightV443.slots[i]?.turnY??0)+(crewV458.slots[i]?.turnY??0),delta,props.reducedMotion?20:3.1);
   const desiredScale=present?1:.001;
   const scaled=formationApproach(g.scale.x,desiredScale,delta,props.reducedMotion?20:3.2);
   g.scale.setScalar(Math.max(.001,scaled));
   g.visible=scaled>.003;
  }
 });
 return <>{Array.from({length:settings.count},(_,i)=>{
  const chosen=urls[i];
  const usingPartner=i%2===1;
  const modelUrl=chosen?chosen.url:(usingPartner?props.secondaryAvatarModelUrl:props.avatarModelUrl);
  const animationUrl=chosen?('animationUrl' in chosen?chosen.animationUrl:undefined):(usingPartner?props.secondaryAvatarAnimationUrl:props.avatarAnimationUrl);
  const modelId=chosen?.id??(usingPartner?props.secondaryAvatarModelId:props.avatarModelId);
  const groupProps:VisualizerProps={...props,lipSync:props.lipSync?{...props.lipSync,ensembleCountV374:settings.count,performanceCueRefV375,interactionCueRefV376,manualVocalCueRefV385,concertCueRefV386}:undefined,audio:groupAudio.current[i],multiAvatarMode:'sync',avatarModelUrl:modelUrl,avatarAnimationUrl:animationUrl,avatarModelId:modelId,preferredMotionUrlV440:props.multiArtistMotionsV442?.[i]??(usingPartner?props.secondaryPreferredMotionUrlV440:props.preferredMotionUrlV440),
   avatarDancePreset:usingPartner?props.secondaryDancePreset??props.avatarDancePreset:props.avatarDancePreset,
   danceVariation:Math.min(1,(props.danceVariation??.5)+(i>1?.07:0))};
  return <group key={i} name={`v377-vocal-stage-slot-${i}`} ref={node=>{refs.current[i]=node;}} position={[(-settings.count+1)/2*1.4+i*1.4,0,0]}>
   <PartnerCalibrationContext.Provider value={usingPartner?props.secondaryContactCalibration??null:props.partnerContactCalibration??null}>
    <GroupMotionClockContextV328.Provider value={{settings:motionSyncV328,clock:motionClocksV328.current[i]}}>
     <GroupPhraseContextV329.Provider value={{settings:phraseSettingsV329,plan:phrasePlanV329,register:registerPhrasesV329}}>
      <GroupLowPoseContextV481.Provider value={lowPosesV481.current[i]}>
      <GroupDanceMotionContextV485.Provider value={danceMotionV485.current[i]}>
      <GroupFootworkContextV486.Provider value={footworkV486.current[i]}>
      <GroupFootSupportContextV486.Provider value={supportV486.current[i]}>
      <GroupGroundObservationContextV487.Provider value={groundV487.current[i]}>
      <PartnerLookContext.Provider value={looksV444.current[i]}>
       <PartnerGestureContext.Provider value={gesturesV444.current[i]}>
        <Dancer props={groupProps} slot={i}/>
       </PartnerGestureContext.Provider>
      </PartnerLookContext.Provider>
      </GroupGroundObservationContextV487.Provider>
      </GroupFootSupportContextV486.Provider>
      </GroupFootworkContextV486.Provider>
      </GroupDanceMotionContextV485.Provider>
      </GroupLowPoseContextV481.Provider>
      <ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={i} reducedMotion={props.reducedMotion} spotlightV443={props.artistSpotlightV443}/>
     </GroupPhraseContextV329.Provider>
    </GroupMotionClockContextV328.Provider>
   </PartnerCalibrationContext.Provider>
  </group>;
 })}</>;
}

