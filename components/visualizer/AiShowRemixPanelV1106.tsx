'use client';
/** V1106 · Deliberate opt-in, preview, explicit apply and conflict-safe undo. */
import {useEffect,useRef,useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {useMusic} from '@/context/MusicContext';
import {DEFAULT_CREATIVE_BRIEF_V1107,curateCreativeRemixV1107,auditCreativeRemixV1107,
 type CreativeStyleV1107} from '@/lib/aiCreativeProducerV1107';
import {createMusicEmotionSessionV1108,collectMusicEmotionSampleV1108,readMusicEmotionV1108,
 suggestCreativeDirectionV1108,type MusicEmotionReadingV1108,type MusicMoodHintV1108} from '@/lib/aiMusicEmotionV1108';
import {AVATAR_CAST_V1112,AVATAR_PERSONALITY_LABELS_V1112,directAvatarPersonalityV1112,
 sampleAvatarPersonalityV1112,syncPersonalityConductorV1112,
 type AvatarPersonalityV1112,type AvatarCastV1112,type AvatarPersonalityShowV1112} from '@/lib/aiAvatarPersonalityV1112';
import {choreographDanceV1114,syncDancePerformanceV1114,sampleDanceCueV1114,
 DANCE_STYLE_LABELS_V1114,type DanceStyleV1114,type DanceShowV1114} from '@/lib/aiDanceChoreographerV1114';
import {useCrewSettings,writeCrewSettings} from '@/components/visualizer/useSonicCrew';
import {directVocalActingV1115,sampleVocalCueV1115,vocalPresetV1115,
 VOCAL_STYLE_LABELS_V1115,type VocalStyleV1115,type VocalShowV1115,type VocalPresetV1115}
 from '@/lib/aiVocalActingV1115';
import {directFestivalShowMasterV1126,masterDirectorOptionsV1126,sampleFestivalShowMasterV1126,
 festivalShowMasterLivePresetV1126,MASTER_LABELS_V1126,
 type MasterStyleV1126,type MasterShowV1126} from '@/lib/aiFestivalShowMasterV1126';
import {directFestivalCrowdV1125,sampleFestivalCrowdV1125,festivalCrowdLivePresetV1125,
 FESTIVAL_CROWD_LABELS_V1125,type FestivalCrowdStyleV1125,
 type FestivalCrowdShowV1125,type FestivalCrowdLivePresetV1125} from '@/lib/aiFestivalCrowdDirectorV1125';
import {directAudienceEnergySyncV1124,sampleAudienceEnergySyncV1124,audienceLivePresetV1124,
 AUDIENCE_STYLE_LABELS_V1124,type AudienceStyleV1124,type AudienceShowV1124,
 type AudienceLivePresetV1124} from '@/lib/aiAudienceEnergySyncV1124';
import {directConcertEnergyV1123,sampleConcertEnergyV1123,energyLivePresetV1123,
 ENERGY_LABELS_V1123,type EnergyStyleV1123,type EnergyShowV1123,
 type EnergyLivePresetV1123} from '@/lib/aiConcertEnergyDirectorV1123';
import {directConcertAtmosphereV1122,sampleConcertAtmosphereV1122,atmosphereLivePresetV1122,
 ATMOSPHERE_LABELS_V1122,type AtmosphereStyleV1122,type AtmosphereShowV1122,
 type AtmosphereLivePresetV1122} from '@/lib/aiConcertAtmosphereDirectorV1122';
import {directImmersiveTransitionsV1121,sampleImmersiveTransitionV1121,transitionLivePresetV1121,
 TRANSITION_LABELS_V1121,type TransitionStyleV1121,type TransitionShowV1121,
 type TransitionLivePresetV1121} from '@/lib/aiImmersiveSceneTransitionsV1121';
import {directDynamicLightingV1120,lightingLivePresetV1120,sampleLightingCueV1120,
 LIGHTING_LABELS_V1120,type LightingStyleV1120,type LightingShowV1120,
 type LightingLivePresetV1120} from '@/lib/aiDynamicLightingConductorV1120';
import {directCinematicCameraV1119,cameraLivePresetV1119,sampleCameraCueV1119,
 CAMERA_STYLE_LABELS_V1119,type CameraStyleV1119,type CameraShowV1119,
 type CameraLivePresetV1119} from '@/lib/aiCinematicCameraDirectorV1119';
import {directHolographicShowV1118,hologramLivePresetV1118,sampleHologramCueV1118,
 HOLOGRAM_STYLE_LABELS_V1118,type HologramStyleV1118,type HologramShowV1118,
 type HologramLivePresetV1118} from '@/lib/aiHolographicStageDirectorV1118';
import {directStageTransformationV1117,stageLivePresetV1117,sampleStageCueV1117,
 STAGE_STYLE_LABELS_V1117,type StageStyleV1117,type StageShowV1117,
 type StageLivePresetV1117} from '@/lib/aiStageTransformationV1117';
import {directArtistInteractionV1116,sampleInteractionCueV1116,liveArtistPresetV1116,
 INTERACTION_LABELS_V1116,type InteractionStyleV1116,type InteractionShowV1116,
 type LiveArtistPresetV1116} from '@/lib/aiArtistInteractionV1116';
import {directPerformanceV1113,syncPerformancePersonalityV1113,samplePerformanceCueV1113,
 PERFORMANCE_MODE_LABELS_V1113,type PerformanceModeV1113,type PerformanceShowV1113} from '@/lib/aiPerformanceDirectorV1113';
import {conductAiShowV1111,sampleConductorCueV1111,
 type ConductorModeV1111,type ConductorShowV1111} from '@/lib/aiLiveShowConductorV1111';
import {readDropReadinessV1110,directDropRemixV1110,syncDropStoryV1110,
 type DropReadingV1110,type DropCueV1110} from '@/lib/aiDropPredictionV1110';
import {composeConcertStoryV1109,STORY_ARC_LABELS_V1109,
 type ConcertStoryArcV1109,type ConcertStoryPacingV1109,type ConcertStoryResultV1109} from '@/lib/aiConcertStoryV1109';
import {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,
 type ArenaShowPlanV1040} from '@/lib/arena360ShowDesignerV1040';
import {applyAiShowRemixV1106,localAiShowRemixV1106,normalizeAiShowRemixV1106,
 type AiShowRemixV1106,type RemixGenreV1106} from '@/lib/arena360AiShowRemixV1106';
const NAMES:Record<string,string>={intro:'Intro',verse:'Strophe',build:'Build-up',hook:'Hook',
 interlude:'Atempause',finale:'Finale'};
export function AiShowRemixPanelV1106({plan,prompt,genre,title,durationMs}:{
 plan:ArenaShowPlanV1040|null;prompt:string;genre:string;title:string;durationMs:number;
}){
 const {preferences,updatePreferences}=useUiPreferences();
 const crewSettings=useCrewSettings();
 const crewUndo=useRef<{before:typeof crewSettings;after:string}|null>(null);
 const audio=useAudioAnalysis();
 const music=useMusic();
 const [director,setDirector]=useState<CreativeStyleV1107>('cinematic');
 const [contrast,setContrast]=useState(50);
 const [surprise,setSurprise]=useState(35);
 const [mood,setMood]=useState<MusicMoodHintV1108>('none');
 const [moodExplanation,setMoodExplanation]=useState('Noch keine Messung ausgewählt.');
 const [sampling,setSampling]=useState(false);
 const [sampleCount,setSampleCount]=useState(0);
 const [reading,setReading]=useState<MusicEmotionReadingV1108|null>(null);
 const emotionSession=useRef(createMusicEmotionSessionV1108());
 const [dropReading,setDropReading]=useState<DropReadingV1110|null>(null);
 const [dropCue,setDropCue]=useState<DropCueV1110|null>(null);
 const currentTrack=music.track?.id??'';
 const [storyArc,setStoryArc]=useState<ConcertStoryArcV1109>('crescendo');
 const [storyPacing,setStoryPacing]=useState<ConcertStoryPacingV1109>('balanced');
 const [storyEnabled,setStoryEnabled]=useState(false);
 const [storyPreview,setStoryPreview]=useState<ConcertStoryResultV1109|null>(null);
 const [conductorEnabled,setConductorEnabled]=useState(false);
 const [conductorMode,setConductorMode]=useState<ConductorModeV1111>('cinematic');
 const [conductorSurprise,setConductorSurprise]=useState(true);
 const [conductorPreview,setConductorPreview]=useState<ConductorShowV1111|null>(null);
 const [personalityEnabled,setPersonalityEnabled]=useState(false);
 const [cast,setCast]=useState<AvatarCastV1112>(()=>AVATAR_CAST_V1112.map(x=>({...x})));
 const [personalityPreview,setPersonalityPreview]=useState<AvatarPersonalityShowV1112|null>(null);
 const [performanceEnabled,setPerformanceEnabled]=useState(false);
 const [performanceMode,setPerformanceMode]=useState<PerformanceModeV1113>('natural');
 const [performanceExpression,setPerformanceExpression]=useState(50);
 const [performancePreview,setPerformancePreview]=useState<PerformanceShowV1113|null>(null);
 const [danceStyle,setDanceStyle]=useState<DanceStyleV1114>('expressive');
 const [danceEnabled,setDanceEnabled]=useState(false);
 const [dancePreview,setDancePreview]=useState<DanceShowV1114|null>(null);
 const [crewCanUndo,setCrewCanUndo]=useState(false);
 const [vocalStyle,setVocalStyle]=useState<VocalStyleV1115>('rap');
 const [vocalExpression,setVocalExpression]=useState(50);
 const [vocalEnabled,setVocalEnabled]=useState(false);
 const [vocalPreview,setVocalPreview]=useState<VocalShowV1115|null>(null);
 const [vocalCanUndo,setVocalCanUndo]=useState(false);
 const [interactionStyle,setInteractionStyle]=useState<InteractionStyleV1116>('dialogue');
 const [interactionStrength,setInteractionStrength]=useState(50);
 const [interactionEnabled,setInteractionEnabled]=useState(false);
 const [interactionPreview,setInteractionPreview]=useState<InteractionShowV1116|null>(null);
 const [interactionCanUndo,setInteractionCanUndo]=useState(false);
 const [stageStyle,setStageStyle]=useState<StageStyleV1117>('kinetic');
 const [stageStrength,setStageStrength]=useState(50);
 const [stageEnabled,setStageEnabled]=useState(false);
 const [stagePreview,setStagePreview]=useState<StageShowV1117|null>(null);
 const [stageCanUndo,setStageCanUndo]=useState(false);
 const [masterStyle,setMasterStyle]=useState<MasterStyleV1126>('cinematic');
 const [masterStrength,setMasterStrength]=useState(50);
 const [masterEnabled,setMasterEnabled]=useState(false);
 const [masterPreview,setMasterPreview]=useState<MasterShowV1126|null>(null);
 const [masterCanUndo,setMasterCanUndo]=useState(false);
 const masterUndo=useRef<{before:Partial<typeof preferences>;after:Record<string,boolean|number|string>}|null>(null);
 const [festivalStyle,setFestivalStyle]=useState<FestivalCrowdStyleV1125>('ripple');
 const [festivalStrength,setFestivalStrength]=useState(50);
 const [festivalEnabled,setFestivalEnabled]=useState(false);
 const [festivalPreview,setFestivalPreview]=useState<FestivalCrowdShowV1125|null>(null);
 const [festivalCanUndo,setFestivalCanUndo]=useState(false);
 const festivalUndo=useRef<{before:Partial<typeof preferences>;after:FestivalCrowdLivePresetV1125}|null>(null);
 const [audienceStyle,setAudienceStyle]=useState<AudienceStyleV1124>('wave');
 const [audienceStrength,setAudienceStrength]=useState(50);
 const [audienceEnabled,setAudienceEnabled]=useState(false);
 const [audiencePreview,setAudiencePreview]=useState<AudienceShowV1124|null>(null);
 const [audienceCanUndo,setAudienceCanUndo]=useState(false);
 const audienceUndo=useRef<{before:Partial<typeof preferences>;after:AudienceLivePresetV1124}|null>(null);
 const [energyStyle,setEnergyStyle]=useState<EnergyStyleV1123>('balanced');
 const [energyStrength,setEnergyStrength]=useState(50);
 const [energyEnabled,setEnergyEnabled]=useState(false);
 const [energyUseMeasurement,setEnergyUseMeasurement]=useState(false);
 const [energyPreview,setEnergyPreview]=useState<EnergyShowV1123|null>(null);
 const [energyCanUndo,setEnergyCanUndo]=useState(false);
 const energyUndo=useRef<{before:Partial<typeof preferences>;after:EnergyLivePresetV1123}|null>(null);
 const [atmosphereStyle,setAtmosphereStyle]=useState<AtmosphereStyleV1122>('cinematic');
 const [atmosphereStrength,setAtmosphereStrength]=useState(50);
 const [atmosphereEnabled,setAtmosphereEnabled]=useState(false);
 const [atmospherePreview,setAtmospherePreview]=useState<AtmosphereShowV1122|null>(null);
 const [atmosphereCanUndo,setAtmosphereCanUndo]=useState(false);
 const atmosphereUndo=useRef<{before:Partial<typeof preferences>;after:AtmosphereLivePresetV1122}|null>(null);
 const [transitionStyle,setTransitionStyle]=useState<TransitionStyleV1121>('cinematic');
 const [transitionDuration,setTransitionDuration]=useState<'short'|'balanced'|'long'>('balanced');
 const [transitionStrength,setTransitionStrength]=useState(50);
 const [transitionEnabled,setTransitionEnabled]=useState(false);
 const [transitionPreview,setTransitionPreview]=useState<TransitionShowV1121|null>(null);
 const [transitionCanUndo,setTransitionCanUndo]=useState(false);
 const transitionUndo=useRef<{before:Partial<typeof preferences>;after:TransitionLivePresetV1121}|null>(null);
 const [lightingStyle,setLightingStyle]=useState<LightingStyleV1120>('cinematic');
 const [lightingStrength,setLightingStrength]=useState(50);
 const [lightingEnabled,setLightingEnabled]=useState(false);
 const [lightingPreview,setLightingPreview]=useState<LightingShowV1120|null>(null);
 const [lightingCanUndo,setLightingCanUndo]=useState(false);
 const lightingUndo=useRef<{before:Partial<typeof preferences>;after:LightingLivePresetV1120}|null>(null);
 const [cameraStyle,setCameraStyle]=useState<CameraStyleV1119>('cinematic');
 const [cameraStrength,setCameraStrength]=useState(50);
 const [cameraEnabled,setCameraEnabled]=useState(false);
 const [cameraPreview,setCameraPreview]=useState<CameraShowV1119|null>(null);
 const [cameraCanUndo,setCameraCanUndo]=useState(false);
 const cameraUndo=useRef<{before:Partial<typeof preferences>;after:CameraLivePresetV1119}|null>(null);
 const [holoStyle,setHoloStyle]=useState<HologramStyleV1118>('spectral');
 const [holoStrength,setHoloStrength]=useState(50);
 const [holoEnabled,setHoloEnabled]=useState(false);
 const [holoPreview,setHoloPreview]=useState<HologramShowV1118|null>(null);
 const [holoCanUndo,setHoloCanUndo]=useState(false);
 const holoUndo=useRef<{before:Partial<typeof preferences>;after:HologramLivePresetV1118}|null>(null);
 const stageUndo=useRef<{before:Partial<typeof preferences>;after:StageLivePresetV1117}|null>(null);
 const interactionUndo=useRef<{before:Partial<typeof preferences>;after:LiveArtistPresetV1116}|null>(null);
 const vocalUndo=useRef<{before:Partial<typeof preferences>;after:VocalPresetV1115}|null>(null);
 const [conductorScrub,setConductorScrub]=useState(35);
 const [followSong,setFollowSong]=useState(false);
 const [idea,setIdea]=useState('Düsteres Intro, starke Hook, schwebende Bühnen und ein überraschendes Finale');
 const [cap,setCap]=useState(70);
 const [preview,setPreview]=useState<AiShowRemixV1106|null>(null);
 const [source,setSource]=useState<'ai'|'local'|null>(null);
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState(false);
 const [baseSignature,setBaseSignature]=useState('');
 const [canUndo,setCanUndo]=useState(false);
 const controller=useRef<AbortController|null>(null);
 const requestId=useRef(0);
 const undo=useRef<{before:ArenaShowPlanV1040|null;after:string}|null>(null);
 const base=plan??generateArenaShowPlanV1040({prompt,genre,durationMs,title});
 const signature=JSON.stringify(base);
 const style:RemixGenreV1106=base.genre;
 const creativeBrief=()=>({style:director,contrast,surprise,mood});
 const storyOptions=()=>({arc:storyArc,pacing:storyPacing,intensityCap:cap});
 const storyFor=(remix:AiShowRemixV1106)=>composeConcertStoryV1109(base,remix,storyOptions());
 // A Drop cue is an explicit user choice and is applied only to PREVIEW data.
 const withDrop=(remix:AiShowRemixV1106,story:ConcertStoryResultV1109|null)=>{
  const staged=dropCue?directDropRemixV1110(story?.remix??remix,dropCue,cap):story?.remix??remix;
  return {staged,story:story?syncDropStoryV1110(story,staged):null};
 };
 const withConductor=(remix:AiShowRemixV1106,story:ConcertStoryResultV1109|null,force=false)=>{
  const dropped=withDrop(remix,story);
  if(!dropped.staged)return {staged:null,story:null,conductor:null};
  const conductor=(conductorEnabled||force)?conductAiShowV1111(base,dropped.staged,
   {mode:conductorMode,intensityCap:cap,surprise:conductorSurprise}):null;
  if((conductorEnabled||force)&&!conductor)return {staged:null,story:null,conductor:null};
  const staged=conductor?.remix??dropped.staged;
  const stagedStory=dropped.story?syncDropStoryV1110(dropped.story,staged):null;
  return {staged,story:stagedStory,conductor};
 };
 const withPersonality=(staged:AiShowRemixV1106|null,conductor:ConductorShowV1111|null,force=false)=>{
  if(!staged)return {staged:null,conductor:null,personality:null};
  if(!personalityEnabled&&!force)return {staged,conductor,personality:null};
  const personality=directAvatarPersonalityV1112(base,staged,cast,cap);
  if(!personality)return {staged:null,conductor:null,personality:null};
  return {staged:personality.remix,conductor:syncPersonalityConductorV1112(conductor,personality),personality};
 };
 const withPerformance=(staged:AiShowRemixV1106|null,conductor:ConductorShowV1111|null,
  personality:AvatarPersonalityShowV1112|null,force=false)=>{
  if(!staged)return {staged:null,conductor:null,personality:null,performance:null};
  if(!performanceEnabled&&!force)return {staged,conductor,personality,performance:null};
  if(!personality)return {staged:null,conductor:null,personality:null,performance:null};
  const performance=directPerformanceV1113(base,personality,
   {mode:performanceMode,expression:performanceExpression,intensityCap:cap});
  if(!performance)return {staged:null,conductor:null,personality:null,performance:null};
  const aligned=syncPerformancePersonalityV1113(personality,performance);
  if(!aligned)return {staged:null,conductor:null,personality:null,performance:null};
  return {staged:performance.remix,conductor:syncPersonalityConductorV1112(conductor,aligned),
   personality:aligned,performance};
 };
 const withDance=(staged:AiShowRemixV1106|null,conductor:ConductorShowV1111|null,
  personality:AvatarPersonalityShowV1112|null,performance:PerformanceShowV1113|null,force=false)=>{
  if(!staged)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  if(!danceEnabled&&!force)return {staged,conductor,personality,performance,dance:null};
  if(!performance||!personality)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  const dance=choreographDanceV1114(base,performance,{style:danceStyle,intensityCap:cap});
  if(!dance)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  const alignedPerformance=syncDancePerformanceV1114(performance,dance);
  if(!alignedPerformance)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  const alignedPersonality=syncPerformancePersonalityV1113(personality,alignedPerformance);
  if(!alignedPersonality)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  return {staged:dance.remix,conductor:syncPersonalityConductorV1112(conductor,alignedPersonality),
   personality:alignedPersonality,performance:alignedPerformance,dance};
 };
 const withVocal=(performance:PerformanceShowV1113|null,dance:DanceShowV1114|null,force=false)=>{
  if(!vocalEnabled&&!force)return null;
  return directVocalActingV1115(base,performance,dance,
   {style:vocalStyle,expression:vocalExpression,intensityCap:cap});
 };
 const withInteraction=(performance:PerformanceShowV1113|null,dance:DanceShowV1114|null,
  vocal:VocalShowV1115|null,force=false)=>{
  if(!interactionEnabled&&!force)return null;
  return directArtistInteractionV1116(base,performance,dance,vocal,
   {style:interactionStyle,strength:interactionStrength,intensityCap:cap});
 };
 const songDuration=music.track?.durationMs??0;
 const followAvailable=music.isPlaying&&Number.isFinite(songDuration)&&songDuration>0&&
  Number.isFinite(music.progressMs)&&music.progressMs>=0;
 const previewPercent=followSong&&followAvailable?
  Math.min(1,Math.max(0,music.progressMs/songDuration)):conductorScrub/100;
 const activeConductorCue=sampleConductorCueV1111(conductorPreview,previewPercent);
 const activePersonalityCue=sampleAvatarPersonalityV1112(personalityPreview,previewPercent);
 const activePerformanceCue=samplePerformanceCueV1113(performancePreview,previewPercent);
 const activeDanceCue=sampleDanceCueV1114(dancePreview,previewPercent);
 const activeVocalCue=sampleVocalCueV1115(vocalPreview,previewPercent);
 const activeInteractionCue=sampleInteractionCueV1116(interactionPreview,previewPercent);
 const activeStageCue=sampleStageCueV1117(stagePreview,previewPercent);
 const activeHoloCue=sampleHologramCueV1118(holoPreview,previewPercent);
 const activeCameraCue=sampleCameraCueV1119(cameraPreview,previewPercent);
 const activeLightingCue=sampleLightingCueV1120(lightingPreview,previewPercent);
 const activeTransition=sampleImmersiveTransitionV1121(transitionPreview,previewPercent);
 const activeAtmosphere=sampleConcertAtmosphereV1122(atmospherePreview,previewPercent);
 const activeEnergy=sampleConcertEnergyV1123(energyPreview,previewPercent);
 const activeAudience=sampleAudienceEnergySyncV1124(audiencePreview,previewPercent);
 const activeFestival=sampleFestivalCrowdV1125(festivalPreview,previewPercent);
 const activeMaster=sampleFestivalShowMasterV1126(masterPreview,previewPercent);
 const masterOptions=()=>({style:masterStyle,strength:masterStrength,intensityCap:cap});
 const stageOptions=()=>({style:stageStyle,strength:stageStrength,intensityCap:cap});
 const holoOptions=()=>({style:holoStyle,strength:holoStrength,intensityCap:cap});
 const cameraOptions=()=>({style:cameraStyle,strength:cameraStrength,intensityCap:cap});
 const lightingOptions=()=>({style:lightingStyle,strength:lightingStrength,intensityCap:cap});
 const transitionOptions=()=>({style:transitionStyle,strength:transitionStrength,duration:transitionDuration,intensityCap:cap});
 const atmosphereOptions=()=>({style:atmosphereStyle,strength:atmosphereStrength,intensityCap:cap});
 const energyOptions=()=>({style:energyStyle,strength:energyStrength,intensityCap:cap});
 const audienceOptions=()=>({style:audienceStyle,strength:audienceStrength,intensityCap:cap});
 const festivalOptions=()=>({style:festivalStyle,strength:festivalStrength,intensityCap:cap});
 const energyObservation=()=>energyUseMeasurement&&!sampling&&canSample&&reading?.ready?reading:null;
 const canSample=audio.active&&music.isPlaying&&!preferences.reducedMotion&&!!currentTrack;
 // Tracking is strictly session-only: stop and forget measurements on a song
 // change, playback interruption, microphone loss or reduced-motion preference.
 useEffect(()=>{
  emotionSession.current=createMusicEmotionSessionV1108();
  setReading(null);setDropReading(null);setDropCue(null);setSampleCount(0);setSampling(false);
  setFollowSong(false);setConductorPreview(null);setPersonalityPreview(null);setPerformancePreview(null);setDancePreview(null);setVocalPreview(null);setInteractionPreview(null);setStagePreview(null);setHoloPreview(null);setCameraPreview(null);setLightingPreview(null);setEnergyPreview(null);setAudiencePreview(null);setFestivalPreview(null);setMasterPreview(null);setAtmospherePreview(null);setTransitionPreview(null);
 },[currentTrack]);
 useEffect(()=>{
  // Completed readings are also invalidated if the microphone or playback stops.
  if(!canSample){
   emotionSession.current=createMusicEmotionSessionV1108();
   setSampleCount(0);setReading(null);setDropReading(null);setDropCue(null);setSampling(false);
  }
 },[canSample]);
 useEffect(()=>{
  if(!sampling)return;
  if(!canSample){
   emotionSession.current=createMusicEmotionSessionV1108();
   setSampleCount(0);setReading(null);setDropReading(null);setDropCue(null);setSampling(false);
   return;
  }
  const old=emotionSession.current;
  const next=collectMusicEmotionSampleV1108(old,audio.metrics,{
   microphoneActive:audio.active,playing:music.isPlaying,reducedMotion:preferences.reducedMotion
  },Date.now(),currentTrack);
  if(next!==old){
   emotionSession.current=next;
   setSampleCount(next.samples.length);
   const measured=readMusicEmotionV1108(next);
   setReading(measured);setDropReading(readDropReadinessV1110(next,measured));
  }
 },[sampling,canSample,currentTrack,audio.active,audio.metrics,music.isPlaying,preferences.reducedMotion]);
 const startEmotionMeasurement=()=>{
  if(!canSample)return;
  emotionSession.current=createMusicEmotionSessionV1108();
  setReading(null);setDropReading(null);setDropCue(null);setSampleCount(0);setSampling(true);
  setMoodExplanation('Messung läuft ausschließlich lokal. Noch kein Vorschlag übernommen.');
 };
 const adoptEmotionSuggestion=()=>{
  if(sampling||!canSample)return;
  const recommended=suggestCreativeDirectionV1108(reading);
  if(!recommended)return;
  setDirector(recommended.style);setContrast(recommended.contrast);
  setSurprise(recommended.surprise);setMood(recommended.mood);
  invalidate();
  setMoodExplanation(`Messwertbasierter Regievorschlag übernommen (${Math.round(reading!.confidence*100)}% Messsicherheit). Erstelle nun ausdrücklich eine Vorschau; keine Bühne oder Lampe wurde geschaltet.`);
  setReading(null);setDropReading(null);setSampleCount(0);emotionSession.current=createMusicEmotionSessionV1108();
 };
 const acceptDropCue=()=>{
  if(busy||sampling||!canSample||!dropReading?.cue||dropReading.confidence<.56)return;
  invalidate();setDropCue(dropReading.cue);
  setStatus('V1110 Drop-Regieidee vorgemerkt: wirkt nur auf eine neue Vorschau, noch nichts am Showplan geändert.');
 };
 const discardEmotionMeasurement=()=>{
  emotionSession.current=createMusicEmotionSessionV1108();
  setSampling(false);setReading(null);setDropReading(null);setDropCue(null);setSampleCount(0);
  setMoodExplanation('Lokale Messwerte verworfen. Es wurde nichts gespeichert oder übertragen.');
 };
 const invalidate=()=>{setMasterPreview(null);setEnergyPreview(null);setAudiencePreview(null);setFestivalPreview(null);setAtmospherePreview(null);setTransitionPreview(null);setLightingPreview(null);setCameraPreview(null);setHoloPreview(null);setStagePreview(null);controller.current?.abort();requestId.current++;setBusy(false);setPreview(null);setStoryPreview(null);setConductorPreview(null);setPersonalityPreview(null);setPerformancePreview(null);setDancePreview(null);setVocalPreview(null);setInteractionPreview(null);setSource(null);setStatus('');};
 useEffect(()=>{setEnergyPreview(null);setAudiencePreview(null);setFestivalPreview(null);setMasterPreview(null);setAtmospherePreview(null);setTransitionPreview(null);setLightingPreview(null);setCameraPreview(null);setHoloPreview(null);setStagePreview(null);controller.current?.abort();requestId.current++;setPreview(null);setStoryPreview(null);setConductorPreview(null);setPersonalityPreview(null);setPerformancePreview(null);setDancePreview(null);setVocalPreview(null);setInteractionPreview(null);setSource(null);setBusy(false);
  return ()=>{controller.current?.abort();requestId.current++;};
 },[signature]);
 const local=(storyOnly=false,conductorOnly=false,personalityOnly=false,performanceOnly=false,danceOnly=false,vocalOnly=false,interactionOnly=false,stageOnly=false,holoOnly=false,cameraOnly=false,lightingOnly=false,transitionOnly=false,atmosphereOnly=false,energyOnly=false,audienceOnly=false,festivalOnly=false,masterOnly=false)=>{
  const masterOn=masterOnly||masterEnabled;
  const master=masterOn?masterDirectorOptionsV1126(masterOptions()):null;
  if(masterOn&&!master){setStatus('V1126: ungültige Master-Regieparameter.');return;}
  invalidate();
  const curated=curateCreativeRemixV1107(localAiShowRemixV1106(idea,style,cap),creativeBrief(),cap);
  if(!curated){setStatus('Regieentwurf ungültig – keine Änderungen übernommen.');return;}
  const story=storyOnly||storyEnabled?storyFor(curated):null;
  if((storyOnly||storyEnabled)&&!story){setStatus('Storybogen konnte nicht sicher geplant werden. Der Showplan bleibt unverändert.');return;}
  const {staged,story:stagedStory,conductor}=withConductor(curated,story,conductorOnly);
  if(!staged||(story&&!stagedStory)){setStatus('Drop-Regieimpuls ungültig. Bestehender Showplan unverändert.');return;}
  const personalized=withPersonality(staged,conductor,personalityOnly||performanceOnly||danceOnly||vocalOnly||interactionOnly||performanceEnabled||danceEnabled||vocalEnabled||interactionEnabled);
  if(!personalized.staged){setStatus('V1112 Avatar-Persönlichkeiten konnten nicht sicher geplant werden. Bestehende Show unverändert.');return;}
  const directed=withPerformance(personalized.staged,personalized.conductor,personalized.personality,performanceOnly||danceOnly||vocalOnly||interactionOnly||danceEnabled||vocalEnabled||interactionEnabled);
  if(!directed.staged){setStatus('V1113 Performance Director konnte nicht sicher geplant werden. Bestehende Show unverändert.');return;}
  const danced=withDance(directed.staged,directed.conductor,directed.personality,directed.performance,danceOnly||vocalOnly||interactionOnly||vocalEnabled||interactionEnabled);
  if(!danced.staged){setStatus('V1114 Tanzregie konnte nicht sicher geplant werden. Bestehende Show unverändert.');return;}
  const vocal=withVocal(danced.performance,danced.dance,vocalOnly||interactionOnly||interactionEnabled);
  if((vocalOnly||interactionOnly||vocalEnabled||interactionEnabled)&&!vocal){setStatus('V1115 Vocal Acting konnte nicht sicher geplant werden. Bestehende Show unverändert.');return;}
  const interaction=withInteraction(danced.performance,danced.dance,vocal,interactionOnly);
  if((interactionOnly||interactionEnabled)&&!interaction){setStatus('V1116 Interaktion konnte nicht sicher geplant werden. Show unverändert.');return;}
  const finalRemix=interaction?.remix??danced.staged;
  const stage=stageEnabled||stageOnly||masterOn?directStageTransformationV1117(base,finalRemix,(master?.stage??stageOptions())):null;
  if((stageEnabled||stageOnly||masterOn)&&!stage){setStatus('V1117 Bühnenverwandlung konnte nicht sicher geplant werden. Show unverändert.');return;}
  const holo=holoEnabled||holoOnly||masterOn?directHolographicShowV1118(base,stage?.remix??finalRemix,(master?.holo??holoOptions())):null;
  if((holoEnabled||holoOnly||masterOn)&&!holo){setStatus('V1118 Hologramm-Regie konnte nicht sicher geplant werden. Show unverändert.');return;}
  const camera=cameraEnabled||cameraOnly||masterOn?directCinematicCameraV1119(base,holo?.remix??stage?.remix??finalRemix,(master?.camera??cameraOptions())):null;
  if((cameraEnabled||cameraOnly||masterOn)&&!camera){setStatus('V1119 Kameraregie konnte nicht sicher geplant werden. Show unverändert.');return;}
  const lighting=lightingEnabled||lightingOnly||masterOn?directDynamicLightingV1120(base,camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.lighting??lightingOptions())):null;
  if((lightingEnabled||lightingOnly||masterOn)&&!lighting){setStatus('V1120 Lichtregie konnte nicht sicher geplant werden. Show unverändert.');return;}
  const transitions=transitionEnabled||transitionOnly||masterOn?directImmersiveTransitionsV1121(base,lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.transition??transitionOptions())):null;
  if((transitionEnabled||transitionOnly||masterOn)&&!transitions){setStatus('V1121 Übergänge konnten nicht sicher geplant werden. Show unverändert.');return;}
  const atmosphere=atmosphereEnabled||atmosphereOnly||masterOn?directConcertAtmosphereV1122(base,transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.atmosphere??atmosphereOptions())):null;
  if((atmosphereEnabled||atmosphereOnly||masterOn)&&!atmosphere){setStatus('V1122 Atmosphäre konnte nicht sicher geplant werden. Show unverändert.');return;}
  const energy=energyEnabled||energyOnly||masterOn?directConcertEnergyV1123(base,atmosphere?.remix??transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.energy??energyOptions()),energyObservation()):null;
  if((energyEnabled||energyOnly||masterOn)&&!energy){setStatus('V1123 Energie konnte nicht sicher geplant werden. Show unverändert.');return;}
  const audience=audienceEnabled||audienceOnly||masterOn?directAudienceEnergySyncV1124(base,energy?.remix??atmosphere?.remix??transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.audience??audienceOptions()),energy):null;
  if((audienceEnabled||audienceOnly||masterOn)&&!audience){setStatus('V1124 Publikum konnte nicht sicher geplant werden. Show unverändert.');return;}
  const festival=festivalEnabled||festivalOnly||masterOn?directFestivalCrowdV1125(base,audience?.remix??energy?.remix??atmosphere?.remix??transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.festival??festivalOptions()),audience):null;
  if((festivalEnabled||festivalOnly||masterOn)&&!festival){setStatus('V1125 Acht-Sektoren-Regie konnte nicht sicher geplant werden. Show unverändert.');return;}
  const mastered=masterOn?directFestivalShowMasterV1126(base,festival?.remix??finalRemix,masterOptions(),
   {stage:stage!,holo:holo!,camera:camera!,lighting:lighting!,transition:transitions!,
    atmosphere:atmosphere!,energy:energy!,audience:audience!,festival:festival!}):null;
  if(masterOn&&!mastered){setStatus('V1126: Regieszenen nicht synchron. Nichts übernommen.');return;}
  setMasterPreview(mastered);
  setFestivalPreview(festival);setAudiencePreview(audience);setEnergyPreview(energy);setAtmospherePreview(atmosphere);setTransitionPreview(transitions);setLightingPreview(lighting);setCameraPreview(camera);setHoloPreview(holo);setStagePreview(stage);setInteractionPreview(interaction);setVocalPreview(vocal);
  setStoryPreview(stagedStory?syncDropStoryV1110(stagedStory,lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix):null);
  setConductorPreview(danced.conductor);setPersonalityPreview(danced.personality);setPerformancePreview(danced.performance);setDancePreview(danced.dance);
  setPreview(festival?.remix??audience?.remix??energy?.remix??atmosphere?.remix??transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix);setBaseSignature(signature);setSource('local');
  setStatus(mastered?'V1126: neun Regiemodule über dieselben sieben Songphasen abgestimmt. Alle Effekte bleiben Vorschau, bis du sie separat freigibst.':festival?'V1125: Acht räumliche Publikumssektoren und drei geplante Künstlerfokusse als Vorschau. Keine echten Sänger erkannt und keine Geräte aktiviert.':audience?'V1124: sieben Publikumswellen in der Vorschau. Keine Lichter, Audios oder Geräte aktiviert.':energy?'V1123: fünf virtuelle Showkanäle mit gemeinsamem Energiebogen geplant. Keine Geräte aktiviert.':atmosphere?'V1122: sieben sichere Atmosphärenstimmungen als lokale Vorschau. Keine Nebelmaschine oder Geräte geschaltet.':transitions?'V1121: sechs sanfte Übergangsfenster geplant. Keine eigene Live-Zeitspur, keine Geräte geschaltet.':lighting?'V1120: sieben virtuelle Lichtphasen als lokale Vorschau. Noch kein Lichtmodul und kein Govee-Gerät geschaltet.':camera?'V1119: sieben geplante Kameraszenen als lokale Vorschau, mit sanften vorhandenen V1072-Fahrten. Keine Kamera oder Geräte geschaltet.':holo?'V1118: sieben holografische Regieszenen als lokale optische Vorschau; echte 3D-Projektion nur nach separater Freigabe, keine Hardware.':stage?'V1117: sieben Bühnenverwandlungen als lokale Vorschau. Reale virtuelle Plattformen nur nach separater Freigabe; keine Gerätebefehle.':interaction?'V1116: sieben Artist-Interaktionen als Vorschau. Kameraführung über vorhandene Modi; echte Partnerreaktionen nur durch separate V1079-Aktivierung bei synchronisierten Lyrics. Keine automatisch erkannten Sänger.':vocal?'V1115 Vocal Acting: sieben Szenen mit Bühnen-Vocal-Rollen als Vorschau. Die tatsächliche Lippen-/Gestik-Engine bleibt bis zur gesonderten Zustimmung unverändert. Keine Stimmen oder Phoneme erkannt.':danced.dance?'V1114: Solo, Duo, Kanon und Unisono als sichere Vorschau. Echte GLB-Tanzclips können zusätzlich in der Stage Crew mit V1114 Automatik aktiviert werden. Noch kein Gerät oder Clip geschaltet.':directed.performance?'V1113 Performance Director: sieben abgestimmte Charakter-Momente als Vorschau bereit; gemeinsam unterstützte Tanz- und Kameramodi können nach Bestätigung übernommen werden. Keine einzelnen GLB-Animationen oder Geräte gesteuert.':personalized.personality?'V1112 Avatar Personality: drei individuelle Performer-Rollen sind als Vorschau geplant; nur bestehende Kamera-/Tanzmodi werden später übernommen. Keine GLB-Clips oder Geräte geschaltet.':conductor?'V1111 Live Show Conductor: sieben koordinierte Szenen als lokale Regieprobe bereit. Keine Bühne oder Geräte geschaltet.':story?'V1109 lokaler Storybogen als Vorschau bereit. Keine KI-Anfrage, kein Gerät geschaltet und noch nichts übernommen.':
   'Lokaler Remix: keine Netzwerk- oder KI-Anfrage. Noch nichts übernommen.');
 };
 const remote=async()=>{
  const master=masterEnabled?masterDirectorOptionsV1126(masterOptions()):null;
  if(masterEnabled&&!master){setStatus('V1126: ungültige Master-Regieparameter.');return;}
  if(idea.trim().length<4||idea.length>400){setStatus('Bitte 4 bis 400 Zeichen eingeben.');return;}
  invalidate();
  const id=requestId.current;
  const current=new AbortController();controller.current=current;
  setBusy(true);setStatus('KI erstellt einen Vorschlag. Die Live-Show bleibt unverändert.');
  try{
   const response=await fetch('/api/ai/show-remix',{method:'POST',cache:'no-store',signal:current.signal,
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt:idea,genre:style,intensityCap:cap,brief:creativeBrief()})});
   const data:unknown=await response.json();
   if(requestId.current!==id)return;
   const parsed:{remix?:unknown;error?:string}=data&&typeof data==='object'
    ? data as {remix?:unknown;error?:string}:{};
   if(!response.ok)throw Error(typeof parsed.error==='string'?parsed.error:'KI-Anfrage fehlgeschlagen.');
   const proposal=normalizeAiShowRemixV1106(parsed.remix);
   if(!proposal||proposal.acts.some(a=>a.intensity>cap))throw Error('KI-Vorschlag konnte nicht sicher validiert werden.');
   const story=storyEnabled?storyFor(proposal):null;
   if(storyEnabled&&!story)throw Error('Storybogen konnte nicht sicher geplant werden.');
   const {staged,story:stagedStory,conductor}=withConductor(proposal,story);
   if(!staged||(story&&!stagedStory))throw Error('Drop-Regieimpuls konnte nicht sicher geplant werden.');
   const personalized=withPersonality(staged,conductor,performanceEnabled||danceEnabled||vocalEnabled||interactionEnabled);
   if(!personalized.staged)throw Error('Avatar-Persönlichkeiten konnten nicht sicher geplant werden.');
   const directed=withPerformance(personalized.staged,personalized.conductor,personalized.personality,danceEnabled||vocalEnabled||interactionEnabled);
   if(!directed.staged)throw Error('Performance-Regie konnte nicht sicher geplant werden.');
   const danced=withDance(directed.staged,directed.conductor,directed.personality,directed.performance,vocalEnabled||interactionEnabled);
   if(!danced.staged)throw Error('Tanzchoreografie konnte nicht sicher geplant werden.');
   const vocal=withVocal(danced.performance,danced.dance,interactionEnabled);
   if((vocalEnabled||interactionEnabled)&&!vocal)throw Error('V1115 Vocal Acting konnte nicht sicher geplant werden.');
   const interaction=withInteraction(danced.performance,danced.dance,vocal);
   if(interactionEnabled&&!interaction)throw Error('V1116 Artist Interaction konnte nicht sicher geplant werden.');
   const finalRemix=interaction?.remix??danced.staged;
   const stage=stageEnabled||masterEnabled?directStageTransformationV1117(base,finalRemix,(master?.stage??stageOptions())):null;
   if((stageEnabled||masterEnabled)&&!stage)throw Error('V1117 Bühnenverwandlung konnte nicht sicher geplant werden.');
   const holo=holoEnabled||masterEnabled?directHolographicShowV1118(base,stage?.remix??finalRemix,(master?.holo??holoOptions())):null;
   if((holoEnabled||masterEnabled)&&!holo)throw Error('V1118 Hologramm-Planung konnte nicht sicher durchgeführt werden.');
   const camera=cameraEnabled||masterEnabled?directCinematicCameraV1119(base,holo?.remix??stage?.remix??finalRemix,(master?.camera??cameraOptions())):null;
   if((cameraEnabled||masterEnabled)&&!camera)throw Error('V1119 Kameraregie konnte nicht sicher durchgeführt werden.');
   const lighting=lightingEnabled||masterEnabled?directDynamicLightingV1120(base,camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.lighting??lightingOptions())):null;
   if((lightingEnabled||masterEnabled)&&!lighting)throw Error('V1120 Lichtregie konnte nicht sicher geplant werden.');
   const transitions=transitionEnabled||masterEnabled?directImmersiveTransitionsV1121(base,lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.transition??transitionOptions())):null;
   if((transitionEnabled||masterEnabled)&&!transitions)throw Error('V1121 Übergänge konnten nicht sicher geplant werden.');
   const atmosphere=atmosphereEnabled||masterEnabled?directConcertAtmosphereV1122(base,transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.atmosphere??atmosphereOptions())):null;
   if((atmosphereEnabled||masterEnabled)&&!atmosphere)throw Error('V1122 Atmosphäre konnte nicht sicher geplant werden.');
   const energy=energyEnabled||masterEnabled?directConcertEnergyV1123(base,atmosphere?.remix??transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.energy??energyOptions()),energyObservation()):null;
   if((energyEnabled||masterEnabled)&&!energy)throw Error('V1123 Energie konnte nicht sicher geplant werden.');
   const audience=audienceEnabled||masterEnabled?directAudienceEnergySyncV1124(base,energy?.remix??atmosphere?.remix??transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.audience??audienceOptions()),energy):null;
   if((audienceEnabled||masterEnabled)&&!audience)throw Error('V1124 Publikumsregie konnte nicht sicher geplant werden.');
   const festival=festivalEnabled||masterEnabled?directFestivalCrowdV1125(base,audience?.remix??energy?.remix??atmosphere?.remix??transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix,(master?.festival??festivalOptions()),audience):null;
   if((festivalEnabled||masterEnabled)&&!festival)throw Error('V1125 Festival-Publikum konnte nicht sicher geplant werden.');
   const mastered=masterEnabled?directFestivalShowMasterV1126(base,festival?.remix??finalRemix,masterOptions(),
    {stage:stage!,holo:holo!,camera:camera!,lighting:lighting!,transition:transitions!,
     atmosphere:atmosphere!,energy:energy!,audience:audience!,festival:festival!}):null;
   if(masterEnabled&&!mastered)throw Error('V1126: Kameras, Lichter, Bühne und Publikum sind nicht synchron.');
   setMasterPreview(mastered);
   setFestivalPreview(festival);setAudiencePreview(audience);setEnergyPreview(energy);setAtmospherePreview(atmosphere);setTransitionPreview(transitions);setLightingPreview(lighting);setCameraPreview(camera);setHoloPreview(holo);setStagePreview(stage);setInteractionPreview(interaction);setVocalPreview(vocal);
   setStoryPreview(stagedStory?syncDropStoryV1110(stagedStory,lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix):null);
   setConductorPreview(danced.conductor);setPersonalityPreview(danced.personality);setPerformancePreview(danced.performance);setDancePreview(danced.dance);
   setPreview(festival?.remix??audience?.remix??energy?.remix??atmosphere?.remix??transitions?.remix??lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix);setSource('ai');setBaseSignature(signature);
   setStatus('KI-Vorschlag bereit. Prüfe alle sieben Szenen und übernimm ihn ausdrücklich.');
  }catch(error){
   if(requestId.current===id&&!current.signal.aborted)
    setStatus((error instanceof Error?error.message:'KI vorübergehend nicht erreichbar.')+' Du kannst den lokalen Remix verwenden.');
  }finally{if(requestId.current===id)setBusy(false);}
 };
 const apply=()=>{
  if(!preview)return;
  if(signature!==baseSignature){setStatus('Der Showplan wurde inzwischen geändert. Bitte einen neuen Remix erstellen.');setPreview(null);return;}
  const result=applyAiShowRemixV1106(base,preview,cap);
  if(!result){setStatus('Remix ungültig – bestehender Showplan bleibt erhalten.');return;}
  undo.current={before:plan,after:JSON.stringify(result)};
  setCanUndo(true);
  updatePreferences({arenaShowPlanV1040:result});
  setPreview(null);setStoryPreview(null);setConductorPreview(null);setPersonalityPreview(null);setPerformancePreview(null);setDancePreview(null);setVocalPreview(null);setInteractionPreview(null);setStagePreview(null);setHoloPreview(null);setCameraPreview(null);setLightingPreview(null);setEnergyPreview(null);setAudiencePreview(null);setFestivalPreview(null);setMasterPreview(null);setAtmospherePreview(null);setTransitionPreview(null);
  setStatus('Remix gespeichert. Die 360°-Showplan-Aktivierung bleibt unverändert – keine Geräte wurden gesteuert.');
 };
 const activateFestivalShowMaster=()=>{
  if(busy||!masterPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1126-Master-Probe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: kein automatisches Show-Master-Preset.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048||
   !preferences.arenaAudienceEnabledV1032||!preferences.arenaPhoneSyncEnabledV1033||
   !preferences.arenaLightsEnabledV1032||!preferences.arenaCameraEnabledV1032){
   setStatus('V1126 benötigt 360°-Show Designer, Konzertdirektor, virtuelle Kamera, Licht und Publikum.');return;
  }
  if((preferences.arenaPhoneModeV1033??'wave')!=='wave'||
   (preferences.arenaChoreographyFormationV1041??'auto')!=='auto'||
   (preferences.arenaTransformingDeckModeV1037??'auto')!=='auto'||
   (preferences.arenaFloatingStageModeV1038??'auto')!=='auto'||
   (preferences.arenaHologramPatternV1039??'auto')!=='auto'||
   (preferences.arenaFestivalFxModeV1084??'auto')!=='auto'||
   (preferences.arenaLedWallPatternV1059??'auto')!=='auto'){
   setStatus('V1126: manuelle Crowd-, Tanz-, Bühnen-, Hologramm- oder Lichtmuster haben Vorrang. Bitte zuerst Auto wählen.');return;
  }
  if(masterUndo.current||stageUndo.current||holoUndo.current||cameraUndo.current||
   lightingUndo.current||transitionUndo.current||atmosphereUndo.current||
   energyUndo.current||audienceUndo.current||festivalUndo.current){
   setStatus('V1126: eine andere Regie ist noch rückgängig machbar. Bitte erst dort zurücksetzen.');return;
  }
  const preset=festivalShowMasterLivePresetV1126(masterOptions());
  if(!preset){setStatus('V1126: ungültiges Intensitätslimit.');return;}
  const projection=preferences.arenaProjectionModeV1085??'auto';
  if(projection!=='auto'&&projection!==preset.arenaProjectionModeV1085){
   setStatus('V1126: manueller Projektionsmodus hat Vorrang. Bitte zuerst Auto wählen.');return;
  }
  const before=Object.fromEntries(Object.keys(preset).map(k=>
   [k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset as Partial<typeof preferences>);
  masterUndo.current={before,after:preset};setMasterCanUndo(true);
  setStatus('V1126: vorhandene virtuelle Bühnen-, Kamera-, Licht-, Crowd- und Atmosphärenmodule gemeinsam aktiviert. Ihre Live-Limits bleiben gültig; kein Hardwarezugriff.');
 };
 const revertFestivalShowMaster=()=>{
  const saved=masterUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([key,value])=>preferences[key as keyof typeof preferences]===value)){
   masterUndo.current=null;setMasterCanUndo(false);
   setStatus('V1126: eine Einstellung wurde manuell geändert; Rückgängig zum Schutz abgebrochen.');return;
  }
  updatePreferences(saved.before);masterUndo.current=null;setMasterCanUndo(false);
  setStatus('V1126: vorherige virtuelle Regie-Einstellungen wiederhergestellt.');
 };
 const activateFestivalCrowd=()=>{
  if(busy||!festivalPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1125-Festivalprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine Festival-Publikumsbewegung.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048||
   !preferences.arenaAudienceEnabledV1032||!preferences.arenaPhoneSyncEnabledV1033){
   setStatus('V1125 benötigt Show Designer, Konzertdirektor, aktives virtuelles Publikum und Smartphone-Lichter.');return;
  }
  if((preferences.arenaPhoneModeV1033??'wave')!=='wave'){
   setStatus('V1125 respektiert den manuell gewählten Smartphone-Lichtmodus. Bitte erst Welle wählen.');return;
  }
  if(festivalUndo.current){setStatus('V1125 bereits aktiviert. Bitte vor einem Wechsel zurücksetzen.');return;}
  const preset=festivalCrowdLivePresetV1125(festivalOptions());
  if(!preset){setStatus('V1125 Festival-Grenzen ungültig.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>
   [k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);festivalUndo.current={before,after:preset};setFestivalCanUndo(true);
  setStatus('V1125: Acht Sektoren im vorhandenen virtuellen Publikum aktiviert; V1073-Bänder und V1074-Avatarantworten freigegeben. Keine neuen Instanzen, Geräte, Stimmen oder Stroboskop-Effekte.');
 };
 const revertFestivalCrowd=()=>{
  const saved=festivalUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([key,value])=>preferences[key as keyof typeof preferences]===value)){
   festivalUndo.current=null;setFestivalCanUndo(false);
   setStatus('V1125 Publikumseinstellungen wurden manuell verändert; Rückgängig sicher abgebrochen.');return;
  }
  updatePreferences(saved.before);festivalUndo.current=null;setFestivalCanUndo(false);
  setStatus('V1125 vorherige Crowd- und Avatar-Antwort-Einstellungen wiederhergestellt.');
 };
 const activateAudienceSync=()=>{
  if(busy||!audiencePreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1124-Publikumsprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine neuen Publikumsbewegungen.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048||
   !preferences.arenaAudienceEnabledV1032||!preferences.arenaPhoneSyncEnabledV1033){
   setStatus('V1124 benötigt Show Designer, Konzertdirektor und eingeschaltetes virtuelles Publikum mit Smartphone-Lichtern.');return;
  }
  if((preferences.arenaPhoneModeV1033??'wave')!=='wave'){
   setStatus('V1124 respektiert den manuell gewählten Smartphone-Lichtmodus. Bitte zuerst Welle wählen.');return;
  }
  if(audienceUndo.current){setStatus('V1124 Publikumsregie ist bereits aktiviert. Zuerst zurücksetzen.');return;}
  const preset=audienceLivePresetV1124(audienceOptions());
  if(!preset){setStatus('Ungültige V1124 Publikumsgrenze.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>
   [k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);audienceUndo.current={before,after:preset};setAudienceCanUndo(true);
  setStatus('V1124: vorhandene virtuelle V1044/V1073/V1075/V1092-Publikumsregie aktiviert. Abspielstatus, reduzierte Bewegung, Leistungsgrenze und manuelle Lichtmodi gelten weiterhin. Keine Hardware- oder Audioausgabe.');
 };
 const revertAudienceSync=()=>{
  const saved=audienceUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([k,v])=>preferences[k as keyof typeof preferences]===v)){
   audienceUndo.current=null;setAudienceCanUndo(false);
   setStatus('V1124 Publikumseinstellungen wurden inzwischen manuell verändert; Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);audienceUndo.current=null;setAudienceCanUndo(false);
  setStatus('Frühere virtuelle Publikumseinstellungen wiederhergestellt.');
 };
 const activateConcertEnergy=()=>{
  if(busy||!energyPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1123-Energieprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine neue Energieautomatik.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048||
   !preferences.arenaLightsEnabledV1032||!preferences.arenaCameraEnabledV1032){
   setStatus('V1123 benötigt Show Designer, Konzertdirektor, virtuelle Kamera und Bühnenlichter.');return;
  }
  if((preferences.arenaChoreographyFormationV1041??'auto')!=='auto'||
   (preferences.arenaTransformingDeckModeV1037??'auto')!=='auto'||
   (preferences.arenaFloatingStageModeV1038??'auto')!=='auto'){
   setStatus('V1123 respektiert manuelle Tanz-, Deck- und Plattformformationen. Bitte für Automatik auf Auto umstellen.');return;
  }
  if(energyUndo.current||stageUndo.current||cameraUndo.current||lightingUndo.current||
   atmosphereUndo.current||transitionUndo.current){
   setStatus('Eine andere virtuelle Regie ist noch als manuell rücknehmbares Preset aktiv. Zuerst diese Einstellungen zurücksetzen.');return;
  }
  const preset=energyLivePresetV1123(energyOptions());
  if(!preset){setStatus('Ungültige V1123 Energiegrenze.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>
   [k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);energyUndo.current={before,after:preset};setEnergyCanUndo(true);
  setStatus('V1123: vorhandene Konzertflow-, Tanz-, Kamera-, Bühnen-, Licht- und Atmosphärenmodule aktiviert. Deren eigene Live-Regeln bleiben maßgebend. Keine Govee-/Gerätebefehle.');
 };
 const revertConcertEnergy=()=>{
  const saved=energyUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([k,v])=>preferences[k as keyof typeof preferences]===v)){
   energyUndo.current=null;setEnergyCanUndo(false);
   setStatus('V1123 Energieeinstellungen wurden inzwischen manuell verändert; Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);energyUndo.current=null;setEnergyCanUndo(false);
  setStatus('Vorherige virtuelle Energieeinstellungen wiederhergestellt.');
 };
 const activateConcertAtmosphere=()=>{
  if(busy||!atmospherePreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1122-Atmosphärenprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: kein neues Atmosphärenpreset.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048||
   !preferences.arenaLightsEnabledV1032){
   setStatus('V1122 benötigt 360°-Show Designer, Konzertdirektor und virtuelle Bühnenlichter.');return;
  }
  if((preferences.arenaFestivalFxModeV1084??'auto')!=='auto'){
   setStatus('Manuelle Festival-Partikelmodi haben Vorrang. Bitte zuerst auf Auto umstellen.');return;
  }
  if(atmosphereUndo.current){setStatus('V1122-Atmosphärenpreset bereits aktiv. Bitte erst zurücksetzen.');return;}
  const preset=atmosphereLivePresetV1122(atmosphereOptions());
  if(!preset){setStatus('V1122: ungültige Atmosphäre-Intensität.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>
   [k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);atmosphereUndo.current={before,after:preset};setAtmosphereCanUndo(true);
  setStatus('V1122: vorhandene virtuelle V1045-/V1058-/V1084-Atmosphäre aktiviert. Songzeit, Bewegungsreduktion, GPU-Limits und manuelle Partikelmodi bleiben maßgebend. Keine realen Nebelmaschinen oder Hardware.');
 };
 const revertConcertAtmosphere=()=>{
  const saved=atmosphereUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([k,v])=>preferences[k as keyof typeof preferences]===v)){
   atmosphereUndo.current=null;setAtmosphereCanUndo(false);
   setStatus('V1122 Atmosphäre wurde inzwischen manuell geändert; automatisches Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);atmosphereUndo.current=null;setAtmosphereCanUndo(false);
  setStatus('Vorherige virtuelle Atmosphäre wiederhergestellt.');
 };
 const activateImmersiveTransitions=()=>{
  if(busy||!transitionPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1121-Übergangsprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine Übergangsautomatik eingeschaltet.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048||
   !preferences.arenaCameraEnabledV1032||!preferences.arenaLightsEnabledV1032){
   setStatus('V1121 benötigt Show Designer, Konzertdirektor, 360°-Kamera und virtuelle Bühnenlichter.');return;
  }
  if((preferences.arenaTransformingDeckModeV1037??'auto')!=='auto'||
   (preferences.arenaFloatingStageModeV1038??'auto')!=='auto'||
   (preferences.arenaHologramPatternV1039??'auto')!=='auto'){
   setStatus('Manuelle Bühnen-, Schwebebühnen- oder Hologramm-Muster haben Vorrang. Bitte zuerst auf Auto umstellen.');return;
  }
  if(transitionUndo.current){setStatus('V1121-Übergangspreset bereits aktiv. Vorher rückgängig machen.');return;}
  const preset=transitionLivePresetV1121(transitionOptions());
  if(!preset){setStatus('Ungültige V1121 Übergangsstärke.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>
   [k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);transitionUndo.current={before,after:preset};setTransitionCanUndo(true);
  setStatus('V1121: vorhandene V1071-, Kamera-, Licht-, Bühnen- und Hologramm-Übergänge aktiviert. Ihre Live-Easing-Zeiten bleiben maßgebend; V1121 speichert keine eigenen Fade-Zeitspuren oder Gerätebefehle.');
 };
 const revertImmersiveTransitions=()=>{
  const saved=transitionUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([k,v])=>preferences[k as keyof typeof preferences]===v)){
   transitionUndo.current=null;setTransitionCanUndo(false);
   setStatus('V1121 Übergangseinstellungen wurden inzwischen manuell geändert; Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);transitionUndo.current=null;setTransitionCanUndo(false);
  setStatus('Vorherige virtuelle Übergangseinstellungen wiederhergestellt.');
 };
 const activateDynamicLighting=()=>{
  if(busy||!lightingPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1120-Lichtprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine neue Lichtautomatik aktiviert.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048||
   !preferences.arenaLightsEnabledV1032){
   setStatus('V1120 benötigt den 360°-Show Designer, Konzertdirektor und aktivierte virtuelle Bühnenlichter.');return;
  }
  if(lightingUndo.current){setStatus('V1120 Lichtpreset bereits aktiv. Bitte zuerst zurücksetzen.');return;}
  const preset=lightingLivePresetV1120(lightingOptions());
  if(!preset){setStatus('V1120: ungültiges virtuelles Lichtlimit.');return;}
  // Do not overwrite authored lighting timeline, LED pattern, Govee, strobe or
  // stored scene times. Enable only existing guarded virtual render layers.
  const before=Object.fromEntries(Object.keys(preset).map(key=>
   [key,preferences[key as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);lightingUndo.current={before,after:preset};setLightingCanUndo(true);
  setStatus('V1120: vorhandene V1056/V1058/V1059/V1060-Lichtmodule aktiviert. Gespeicherte Licht-Timeline und manuelle Muster bleiben maßgebend. Keine Govee- oder Gerätebefehle.');
 };
 const revertDynamicLighting=()=>{
  const saved=lightingUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([key,value])=>preferences[key as keyof typeof preferences]===value)){
   lightingUndo.current=null;setLightingCanUndo(false);
   setStatus('V1120 Licht-Einstellungen wurden inzwischen manuell geändert; Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);lightingUndo.current=null;setLightingCanUndo(false);
  setStatus('Vorherige virtuelle Licht-Einstellungen wiederhergestellt.');
 };
 const activateCinematicCamera=()=>{
  if(busy||!cameraPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1119-Kameraprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine automatische Kamerafahrt eingeschaltet.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048||!preferences.arenaCameraEnabledV1032){
   setStatus('V1119 benötigt den aktiven 360°-Show Designer, Konzertdirektor und die freigegebene 360°-Kamera.');return;
  }
  if(cameraUndo.current){setStatus('V1119-Kamerapreset ist bereits aktiv. Bitte vorher rückgängig machen.');return;}
  const preset=cameraLivePresetV1119(cameraOptions());
  if(!preset){setStatus('V1119: ungültiges Kamera-Intensitätslimit.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(key=>
   [key,preferences[key as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);cameraUndo.current={before,after:preset};setCameraCanUndo(true);
  setStatus('V1119: bestehende V1043-/V1053-/V1072-Kamerafahrten aktiviert. Manuelle Kamera, Lyrics, Songzeit, Pause und Reduced Motion bleiben maßgebend. Keine Hardware.');
 };
 const revertCinematicCamera=()=>{
  const saved=cameraUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([key,value])=>preferences[key as keyof typeof preferences]===value)){
   cameraUndo.current=null;setCameraCanUndo(false);
   setStatus('V1119 Kamera-Einstellungen wurden inzwischen manuell geändert; Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);cameraUndo.current=null;setCameraCanUndo(false);
  setStatus('Vorherige Kamera-Einstellungen wiederhergestellt.');
 };
 const activateHolographicStage=()=>{
  if(busy||!holoPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1118-Hologramm-Probe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: kein Hologramm-Preset übernommen.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048){
   setStatus('V1118 benötigt den aktivierten 360°-Show Designer und Konzertdirektor.');return;
  }
  if((preferences.arenaHologramPatternV1039??'auto')!=='auto'){
   setStatus('Manueller Hologramm-Modus hat Vorrang: für V1118 zuerst den Hologramm-Modus auf Auto umstellen.');return;
  }
  const existingProjection=preferences.arenaProjectionModeV1085??'auto';
  const preset=hologramLivePresetV1118(holoOptions());
  if(!preset){setStatus('Ungültige Hologramm-Intensität.');return;}
  if(existingProjection!=='auto'&&existingProjection!==preset.arenaProjectionModeV1085){
   setStatus('Manueller Projektionsmodus hat Vorrang: für V1118 zuerst den Projektionsmodus auf Auto setzen.');return;
  }
  if(holoUndo.current){setStatus('V1118-Hologramm-Preset ist bereits aktiviert. Vorher rückgängig machen.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>
   [k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);holoUndo.current={before,after:preset};setHoloCanUndo(true);
  setStatus('V1118: vorhandene Hologramm-/Silhouetten- und Projektionsmodule aktiviert. Pause, niedrige GPU-Stufe, Bewegungsreduktion, Songzeit und manuelle Muster bleiben maßgebend. Keine realen Geräte.');
 };
 const revertHolographicStage=()=>{
  const saved=holoUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([k,v])=>preferences[k as keyof typeof preferences]===v)){
   holoUndo.current=null;setHoloCanUndo(false);
   setStatus('Hologramm-Einstellungen wurden inzwischen manuell geändert; Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);holoUndo.current=null;setHoloCanUndo(false);
  setStatus('Frühere Hologramm- und Projektionswerte wiederhergestellt.');
 };
 const activateStageTransformation=()=>{
  if(busy||!stagePreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1117-Bühnenprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine Bühnenautomatik eingeschaltet.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048){
   setStatus('Bitte zuerst 360°-Show Designer und Konzertdirektor in den Bühneneinstellungen aktivieren.');return;
  }
  if(stageUndo.current){setStatus('Bühnenautomatik ist bereits übernommen. Vorher zuerst zurücksetzen.');return;}
  const preset=stageLivePresetV1117(stageOptions());
  if(!preset){setStatus('Ungültige Bühnenstärke.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>
   [k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);
  stageUndo.current={before,after:preset};setStageCanUndo(true);
  setStatus('V1117: vorhandene virtuelle Bühnenbewegung aktiviert. Manuelle Deck-/Float-Modi, Pause, GPU-Grenze und Bewegungsreduktion haben weiterhin Vorrang. Keine Govee-Steuerung.');
 };
 const revertStageTransformation=()=>{
  const saved=stageUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([k,v])=>preferences[k as keyof typeof preferences]===v)){
   stageUndo.current=null;setStageCanUndo(false);
   setStatus('Bühneneinstellungen wurden manuell geändert; Rückgängig nicht ausgeführt.');return;
  }
  updatePreferences(saved.before);stageUndo.current=null;setStageCanUndo(false);
  setStatus('Frühere Einstellungen für Bühnenbewegung wiederhergestellt.');
 };
 const activateCrewStory=()=>{
  if(!dancePreview||!preview){setStatus('Bitte zuerst eine neue V1114-Probe erstellen.');return;}
  if(crewUndo.current){setStatus('Die Automatik ist bereits aktiviert. Erst den vorherigen Crew-Modus wiederherstellen.');return;}
  const after=writeCrewSettings({...crewSettings,mode:'story',enabled:true});
  crewUndo.current={before:crewSettings,after:JSON.stringify(after)};
  setCrewCanUndo(true);
  setStatus('V1114 Stage-Crew-Automatik ausdrücklich aktiviert. Die echten Clips laufen nur bei laufender Wiedergabe, vorhandenem Abschnittssignal, eingerichteter Trio-Bühne und ohne manuelle Priorität.');
 };
 const revertCrewStory=()=>{
  if(!crewUndo.current)return;
  if(JSON.stringify(crewSettings)!==crewUndo.current.after){
   crewUndo.current=null;setCrewCanUndo(false);
   setStatus('Stage Crew wurde inzwischen manuell geändert; automatisches Zurücksetzen abgebrochen.');return;
  }
  writeCrewSettings(crewUndo.current.before);
  crewUndo.current=null;setCrewCanUndo(false);
  setStatus('Früherer Stage-Crew-Modus wiederhergestellt.');
 };
 const revert=()=>{
  if(!undo.current)return;
  const saved=normalizeArenaShowPlanV1040(preferences.arenaShowPlanV1040);
  if(JSON.stringify(saved)!==undo.current.after){
   setStatus('Der Showplan wurde nach dem Remix geändert; Rückgängig würde manuelle Änderungen überschreiben.');
   setCanUndo(false);undo.current=null;return;
  }
  updatePreferences({arenaShowPlanV1040:undo.current.before??undefined});
  undo.current=null;setCanUndo(false);setStatus('Vorheriger Showplan wiederhergestellt.');
 };
 const applyLiveInteraction=()=>{
  if(busy||!interactionPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1116-Interaktionsprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine Interaktion eingeschaltet.');return;}
  if(interactionUndo.current){setStatus('Live-Interaktion wurde bereits übernommen. Zuerst zurücksetzen.');return;}
  const preset=liveArtistPresetV1116({style:interactionStyle,strength:interactionStrength,intensityCap:cap});
  if(!preset){setStatus('Ungültige Interaktionsstärke.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>[k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);
  interactionUndo.current={before,after:preset};setInteractionCanUndo(true);
  setStatus('V1116 Live-Interaktion bewusst eingeschaltet: vorhandene V1079-Partnerakzente nur bei synchronisierten Lyrics-Lücken, laufender Wiedergabe und kompatibler Bühne. Keine Sänger neu zugeordnet.');
 };
 const revertLiveInteraction=()=>{
  const saved=interactionUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([k,v])=>preferences[k as keyof typeof preferences]===v)){
   interactionUndo.current=null;setInteractionCanUndo(false);
   setStatus('Interaktionsregler inzwischen manuell geändert; automatisches Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);interactionUndo.current=null;setInteractionCanUndo(false);
  setStatus('Vorherige Live-Interaktion wiederhergestellt.');
 };
 const applyVocalPreset=()=>{
  if(busy||!vocalPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1115-Vorschau erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion ist aktiv. Vocal-Preset nicht eingeschaltet.');return;}
  const preset=vocalPresetV1115({style:vocalStyle,expression:vocalExpression,intensityCap:cap});
  if(!preset){setStatus('V1115 Vocal-Preset ist ungültig.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(key=>
   [key,preferences[key as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);
  vocalUndo.current={before,after:preset};setVocalCanUndo(true);
  setStatus('V1115: vorhandene Lyrics-/Mimik-/Körper-Regler bewusst aktiviert. Vorhandene manuelle Sängerzuordnungen, Audio und GLB-Dateien unverändert.');
 };
 const revertVocalPreset=()=>{
  const saved=vocalUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([key,value])=>preferences[key as keyof typeof preferences]===value)){
   vocalUndo.current=null;setVocalCanUndo(false);
   setStatus('Vocal-Regler wurden manuell geändert: automatisches Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);vocalUndo.current=null;setVocalCanUndo(false);
  setStatus('V1115 Vocal-Regler auf die vorherigen Werte zurückgesetzt.');
 };
 return <fieldset className="arena-v1106-ai-remix" aria-label="V1106 KI Show Remix">
  <legend>V1106 · KI Creative Producer – Show Remix</legend>
  <p>Aus einer Idee werden sieben abwechslungsreiche, zusammenhängende 360°-Konzertphasen.
   Die Vorschläge verändern erst nach deinem Klick den vorhandenen Showplan;
   individuelle Zeitgrenzen bleiben erhalten.</p>
  <label>Was soll die Konzertshow besonders machen?
   <textarea rows={3} maxLength={400} value={idea} disabled={busy}
    onChange={e=>{setIdea(e.target.value);invalidate();}}
    placeholder="z. B. Hardtekk: ruhiger Start, explosive Hook, Laser-Tunnel, episches Finale"/>
  </label>
  <fieldset aria-label="V1107 KI Regiefeinschliff" className="arena-v1107-creative-directions">
   <legend>V1107 · KI Creative Producer 2.0</legend>
   <label>Regiestil
    <select value={director} disabled={busy} onChange={e=>{setDirector(e.target.value as CreativeStyleV1107);invalidate();}}>
     <option value="cinematic">Filmisch und dramaturgisch</option>
     <option value="festival">Große Festivalshow</option>
     <option value="intimate">Intim und emotional</option>
     <option value="surprise">Überraschende Perspektiven</option>
    </select>
   </label>
   <label>Kontraste zwischen Ruhe und Höhepunkten: {contrast}%
    <input type="range" min="0" max="80" step="5" value={contrast} disabled={busy}
     onChange={e=>{setContrast(Number(e.target.value));invalidate();}}/>
   </label>
   <label>Kreative Überraschungen: {surprise}%
    <input type="range" min="0" max="70" step="5" value={surprise} disabled={busy}
     onChange={e=>{setSurprise(Number(e.target.value));invalidate();}}/>
   </label>
   <label>Musikalischer Stimmungshinweis (optional)
    <select value={mood} disabled={busy} onChange={e=>{setMood(e.target.value as MusicMoodHintV1108);invalidate();}}>
     <option value="none">Ohne Stimmungshinweis</option>
     <option value="calm">Ruhig / zurückhaltend</option>
     <option value="atmospheric">Atmosphärisch</option>
     <option value="focused">Fokussiert</option>
     <option value="euphoric">Euphorisch</option>
     <option value="intense">Intensiv</option>
    </select>
   </label>
   <fieldset aria-label="V1108 Music Emotion Intelligence" className="arena-v1108-emotion-intelligence">
    <legend>V1108 · Musik-Energie &amp; Dramaturgie</legend>
    <p>Auf Wunsch misst die App über mehrere Sekunden lokale Energie, Frequenzen und Beat-Impulse.
     Daraus schätzt sie einen Spannungsverlauf und macht einen unverbindlichen Regievorschlag.</p>
    <button type="button" disabled={busy||sampling||!canSample} onClick={startEmotionMeasurement}>
     Lokale Musikanalyse starten
    </button>
    {sampling&&<button type="button" onClick={()=>setSampling(false)}>
      Analyse beenden und Vorschlag prüfen
    </button>}
    {(reading||sampling)&&<p role="status" aria-live="polite">
      {reading?<>Messdauer: {(reading.durationMs/1000).toFixed(1)} s · {reading.sampleCount} Messpunkte ·
       Energie: {Math.round(reading.energy*100)}% · Impulsklarheit: {Math.round(reading.beatClarity*100)}% ·
       Verlauf: {reading.trend==='rising'?'steigend':reading.trend==='falling'?'abfallend':'gleichmäßig'} ·
       Messsicherheit: {Math.round(reading.confidence*100)}%.
       {reading.ready?' Vorschlag bereit.':' Für die Übernahme ist ein klareres, längeres Signal nötig.'}
      </>:<>Messung läuft: {sampleCount} lokale Messpunkte. Mindestens 4,5 Sekunden erforderlich.</>}
    </p>}
    {reading&&<p role="note" aria-label="V1108 Musikstimmung Vorschau">
      Geschätzte Musikenergie: {reading.mood} · maximale gemessene Energie: {Math.round(reading.peakEnergy*100)}%.
      Keine echte Emotionserkennung oder zuverlässige Hook-/Drop-Erkennung.
    </p>}
    <button type="button" disabled={busy||sampling||!canSample||!suggestCreativeDirectionV1108(reading)}
     onClick={adoptEmotionSuggestion}>Regievorschlag bewusst übernehmen</button>
    {(sampling||reading)&&<button type="button" onClick={discardEmotionMeasurement}>Messung verwerfen</button>}
    <small role="note">{moodExplanation} Die Analyse ist nur bei laufendem Song, aktivem Mikrofon
     und ohne Bewegungsreduktion möglich. Keine Audioaufzeichnung, keine automatische KI-Anfrage,
     keine Audioübertragung, keine Speicherung. Es werden nur flüchtige Messwerte im Arbeitsspeicher
     verwendet. Die Stimmung ist eine unverbindliche Energie-Heuristik.</small>
    <fieldset aria-label="V1110 AI Drop Prediction" className="arena-v1110-drop-prediction">
     <legend>V1110 · Drop-Radar &amp; Regievorschau</legend>
     <p>Das lokale Drop-Radar erkennt nur bereits gemessene Spannungsanstiege oder Einschläge.
      Es kann einen kommenden Höhepunkt vermuten, aber weder einen echten Drop noch dessen Zeitpunkt sicher vorhersagen.</p>
     {dropReading?<p role="note" aria-label="V1110 Drop-Radar Ergebnis">
      {dropReading.message} · Energieanstieg: {Math.round(dropReading.energyRise*100)} Punkte ·
      Beat-Klarheit: {Math.round(dropReading.beatClarity*100)}% ·
      Messsicherheit: {Math.round(dropReading.confidence*100)}%.
     </p>:<small>Starte oben die lokale Musikanalyse (mindestens fünf Sekunden). Ohne Mikrofon bleibt das Radar inaktiv.</small>}
     <button type="button" disabled={busy||sampling||!canSample||!dropReading?.cue||dropReading.confidence<.56}
      onClick={acceptDropCue}>Drop-Dramaturgie für nächste Vorschau vormerken</button>
     {dropCue&&<p role="status">{dropCue==='prepare'?'Aufbau vorbereiten':'Gemessenen Einschlag inszenieren'} ist vorgemerkt.
      Kamera, Laserlook und Tanz werden erst beim nächsten Entwurf zur Vorschau geändert.</p>}
     {dropCue&&<button type="button" onClick={()=>{setDropCue(null);invalidate();}}>Drop-Regieidee zurücksetzen</button>}
     <small>Keine automatische Lichtsteuerung, Stroboskope, Gerätebefehle, Audioaufzeichnung oder Cloud-Übertragung.
      Der endgültige Showplan wird ausschließlich mit „Diese sieben Szenen in meinen Showplan übernehmen“ verändert.</small>
    </fieldset>
   </fieldset>
  </fieldset>
  <fieldset aria-label="V1109 AI Concert Story Engine" className="arena-v1109-concert-story">
   <legend>V1109 · AI Concert Story Engine</legend>
   <p>Plane einen Spannungsbogen über den ganzen Song: Ruhe, Aufbau, Höhepunkte, Atempause und Finale.
    Die sieben Zeitabschnitte bleiben unverändert. Das ist eine dramaturgische Planung,
    keine Erkennung von Strophen, Hooks oder Drops im echten Audio.</p>
   <label>Erzählbogen
    <select value={storyArc} disabled={busy} onChange={e=>{setStoryArc(e.target.value as ConcertStoryArcV1109);invalidate();}}>
     {Object.entries(STORY_ARC_LABELS_V1109).map(([value,name])=><option key={value} value={value}>{name}</option>)}
    </select>
   </label>
   <label>Spannungsverteilung
    <select value={storyPacing} disabled={busy} onChange={e=>{setStoryPacing(e.target.value as ConcertStoryPacingV1109);invalidate();}}>
     <option value="balanced">Ausgewogener Verlauf</option>
     <option value="slow-burn">Langsamer Spannungsaufbau</option>
     <option value="early-energy">Früher erster Höhepunkt</option>
    </select>
   </label>
   <label>
    <input type="checkbox" checked={storyEnabled} disabled={busy}
     onChange={e=>{setStoryEnabled(e.target.checked);invalidate();}}/>
    Storybogen auch auf neue Offline-/OpenAI-Remixe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(true)}>Storybogen lokal entwerfen</button>
   <small>Der Story-Entwurf verwendet nur den aktuellen Songtitel, das gewählte Genre und deine
    Show-Einstellungen. Keine Audioaufzeichnung, keine automatischen OpenAI- oder Govee-Anfragen.
    Auch bei bewusst aktivierter Storyfunktion wird die bestehende Show erst nach deiner Bestätigung gespeichert.</small>
  </fieldset>
  <fieldset aria-label="V1111 AI Live Show Conductor" className="arena-v1111-live-conductor">
   <legend>V1111 · AI Live Show Conductor</legend>
   <p>Kamera, Avatar-Tanz, Plattform und Laserlook werden pro Songabschnitt gemeinsam geplant –
    mit ruhigem Einstieg, spannungsvollem Aufbau, Ensemble-Höhepunkt, Atempause und Finale.
    Die bestehende 360°-Show-Timeline führt den genehmigten Plan später aus.</p>
   <label>Regiecharakter
    <select value={conductorMode} disabled={busy} onChange={e=>{setConductorMode(e.target.value as ConductorModeV1111);invalidate();}}>
     <option value="cinematic">Filmisch und präzise</option>
     <option value="festival">Große Arena-Energie</option>
     <option value="balanced">Ausgewogen und fließend</option>
    </select>
   </label>
   <label>
    <input type="checkbox" checked={conductorSurprise} disabled={busy}
     onChange={e=>{setConductorSurprise(e.target.checked);invalidate();}}/>
    Überraschenden Perspektivwechsel vor dem Finale erlauben
   </label>
   <label>
    <input type="checkbox" checked={conductorEnabled} disabled={busy}
     onChange={e=>{setConductorEnabled(e.target.checked);invalidate();}}/>
    Konzertregie auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true)}>V1111 Konzertregie jetzt proben</button>
   <small>Die Probe ist eine lokale, lesbare Partitur und keine automatische Echtzeit-KI-Anfrage.
    Weder Govee-Geräte noch Strobo, Pyrotechnik oder Mikrofon werden ausgelöst.
    Nur der vorhandene Bestätigungsbutton kann den 360°-Showplan speichern.
    Es werden keine Songabschnitte oder Drop-Zeitpunkte aus Audiodaten erfunden.</small>
  </fieldset>
  <fieldset aria-label="V1112 AI Avatar Personality" className="arena-v1112-avatar-personality">
   <legend>V1112 · AI Avatar Personality</legend>
   <p>Gib den drei mitgelieferten Stage-Crew-Avataren individuelle Bühnencharaktere.
    Die Probe zeigt Fokus und Nebenrollen für alle sieben Szenen. Die übernommene
    360°-Timeline beeinflusst aktuell den <strong>gemeinsamen</strong> Tanz- und Kameramodus;
    individuelle GLB-Animationen oder die Zuordnung der Kamera zu einem bestimmten Avatar
    werden noch nicht automatisch gesteuert.</p>
   {cast.map((member,i)=><label key={member.id}>{member.label} Bühnenpersönlichkeit
    <select value={member.personality} disabled={busy} onChange={e=>{
     setCast(old=>old.map((person,j)=>j===i?{...person,personality:e.target.value as AvatarPersonalityV1112}:person));
     invalidate();
    }}>
     {Object.entries(AVATAR_PERSONALITY_LABELS_V1112).map(([personality,label])=><option key={personality} value={personality}>{label}</option>)}
    </select>
   </label>)}
   <label><input type="checkbox" checked={personalityEnabled} disabled={busy}
    onChange={e=>{setPersonalityEnabled(e.target.checked);invalidate();}}/>
    Charakterregie auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true)}>V1112 Avatar-Performance jetzt proben</button>
   <small>Keine dauernde KI-Abfrage. Die Charakterplanung bleibt lokal, ist ein Vorschlag
    und wird erst mit dem vorhandenen Showplan-Bestätigungsbutton übernommen.
    Keine Mikrofon- oder Gerätebefehle.</small>
  </fieldset>
  <fieldset aria-label="V1113 AI Performance Director" className="arena-v1113-performance-director">
   <legend>V1113 · AI Performance Director</legend>
   <p>Die drei Bühnenpersönlichkeiten erhalten einen dynamischen Auftritt über alle sieben Songphasen:
    ruhiger Einstieg, präzise Akzente, wechselnde Solo-Fokusse, Ensemble-Moment und Finale.
    Energie, Gestik und Spotlight werden pro Künstler separat als <strong>Probenpartitur</strong> ausgewiesen.
    Die Live-Engine verwendet weiterhin nur vorhandene gemeinsame Kamera- und Tanzmodi.</p>
   <label>Performance-Regiestil
    <select disabled={busy} value={performanceMode} onChange={e=>{
     setPerformanceMode(e.target.value as PerformanceModeV1113);invalidate();}}>
     {Object.entries(PERFORMANCE_MODE_LABELS_V1113).map(([key,name])=><option key={key} value={key}>{name}</option>)}
    </select>
   </label>
   <label>Ausdruckskraft in der Charakterprobe: {performanceExpression}%
    <input type="range" min="20" max="80" step="10" disabled={busy}
     value={performanceExpression} onChange={e=>{setPerformanceExpression(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" disabled={busy} checked={performanceEnabled}
    onChange={e=>{setPerformanceEnabled(e.target.checked);invalidate();}}/>
    Performance-Regie auch auf neue Offline-/OpenAI-Vorschläge anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true,true)}>
    V1113 Bühnenperformance jetzt proben
   </button>
   <small>Die individuellen Gesten sind noch keine echten, separat gesteuerten GLB-Clips.
    Die Regie verändert erst nach deiner ausdrücklichen Bestätigung existierende gemeinsame
    Kamera-/Tanzmodi im 360°-Showplan. Keine automatische Geräte-, Mikrofon- oder OpenAI-Abfrage.</small>
  </fieldset>
  <fieldset aria-label="V1114 AI Dance Choreographer" className="arena-v1114-ai-dance-choreographer">
   <legend>V1114 · AI Dance Choreographer 4.0</legend>
   <p>Sieben Tanzszenen mit Solo, Duo, 2-Beat-Kanon und gemeinsamem Finale. Die
    Probenpartitur nennt pro Avatar existierende GLB-Clip-Vorschläge und Rollen.
    Die neue optionale Stage-Crew-Automatik schaltet die tatsächlich geladenen
    Tanzclips je nach <em>vorhandenem</em> Songabschnitt um.</p>
   <label>Choreografie-Stil
    <select value={danceStyle} disabled={busy} onChange={e=>{setDanceStyle(e.target.value as DanceStyleV1114);invalidate();}}>
     {Object.entries(DANCE_STYLE_LABELS_V1114).map(([value,label])=><option key={value} value={value}>{label}</option>)}
    </select>
   </label>
   <label><input type="checkbox" checked={danceEnabled} disabled={busy}
    onChange={e=>{setDanceEnabled(e.target.checked);invalidate();}}/>
    Tanzregie auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true,true,true)}>
    V1114 Tanzchoreografie jetzt proben
   </button>
   {crewCanUndo&&<button type="button" onClick={revertCrewStory}>Früheren Stage-Crew-Modus wiederherstellen</button>}
   <small>Keine fiktiven GLB-Animationen: Für echte Wiedergabe kann die bestehende
    Stage-Crew-Engine im separaten Schritt aktiviert werden. Manuelle Clips,
    Wiedergabepause und reduzierte Bewegung haben immer Vorrang. Der
    360°-Showplan ändert sich nur mit dem bisherigen Bestätigungsbutton.</small>
  </fieldset>
  <fieldset aria-label="V1115 AI Vocal Acting" className="arena-v1115-ai-vocal-acting">
   <legend>V1115 · AI Vocal Acting &amp; Lip-Sync Intelligence</legend>
   <p>Vocal-Regieprobe für alle drei Stage-Crew-Künstler: Rap-Phrasen, Antwortgesten,
    Duo-Momente und bewusste Atempause. Die Rollen sind <strong>Bühnenvorschläge</strong> –
    keine automatisch erkannten Sänger oder Phoneme.</p>
   <label>Vocal-Auftrittsstil
    <select value={vocalStyle} disabled={busy} onChange={e=>{setVocalStyle(e.target.value as VocalStyleV1115);invalidate();}}>
     {Object.entries(VOCAL_STYLE_LABELS_V1115).map(([value,label])=><option key={value} value={value}>{label}</option>)}
    </select>
   </label>
   <label>Gesicht und Gestik – Intensität {vocalExpression}%
    <input type="range" min="20" max="80" step="10" disabled={busy} value={vocalExpression}
     onChange={e=>{setVocalExpression(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={vocalEnabled} disabled={busy}
     onChange={e=>{setVocalEnabled(e.target.checked);invalidate();}}/>
    Vocal-Regie auch in neue Offline-/OpenAI-Entwürfe aufnehmen
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true,true,true,true)}>
    V1115 Vocal Acting jetzt proben
   </button>
   {vocalCanUndo&&<button type="button" onClick={revertVocalPreset}>Frühere Vocal-Regler wiederherstellen</button>}
   <small>Die integrierte Lyrics-/Mimik-Engine wird <strong>nicht</strong> automatisch eingeschaltet.
    Die mitgelieferten drei GLBs haben keine eigenen Kieferknochen oder Mund-Morph-Targets;
    deshalb kann die Partitur bei ihnen keine echte Phonem-Mundform erzeugen. Kopf-/Körpergestik und
    Avatar-Modelle mit kompatiblen Gesichts-Rigs nutzen weiterhin die vorhandene Engine.
    Keine neuen KI- oder Mikrofonanfragen.</small>
  </fieldset>
  <fieldset aria-label="V1116 AI Artist Interaction" className="arena-v1116-ai-artist-interaction">
   <legend>V1116 · AI Artist Interaction</legend>
   <p>Neon Pulse, Festival Nova und Chrome Beat bekommen aufeinander abgestimmte
    Antwortgesten, Partnerwechsel, Duo-Momente und einen gemeinsamen Höhepunkt.
    Die <strong>Regiepartitur</strong> plant mögliche Blicke und Begegnungen, erkennt aber
    weder Sänger noch echte Blicke aus den drei GLB-Rigs.</p>
   <label>Interaktionsstil
    <select value={interactionStyle} disabled={busy}
     onChange={e=>{setInteractionStyle(e.target.value as InteractionStyleV1116);invalidate();}}>
     {Object.entries(INTERACTION_LABELS_V1116).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Interaktionsstärke {interactionStrength}%
    <input type="range" min="20" max="80" step="10" value={interactionStrength} disabled={busy}
     onChange={e=>{setInteractionStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={interactionEnabled} disabled={busy}
    onChange={e=>{setInteractionEnabled(e.target.checked);invalidate();}}/>
    Künstlerinteraktionen auch in neue Offline-/OpenAI-Entwürfe aufnehmen
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true,true,true,true,true)}>
    V1116 Künstlerinteraktionen jetzt proben
   </button>
   {interactionCanUndo&&<button type="button" onClick={revertLiveInteraction}>
    Frühere Live-Interaktion wiederherstellen
   </button>}
   <small>Live nur nach eigenem zweiten Klick: verwendet die vorhandenen visuellen
    V1079-Partnerakzente, sofern echte synchronisierte Lyrics-Lücken vorliegen.
    Manuelle Animationen, bestehende Sängerzuordnungen und reduzierte Bewegung
    behalten Vorrang. Keine künstliche Audio-/Gesangserkennung, keine Govee-Befehle.</small>
  </fieldset>
  <fieldset aria-label="V1126 AI Festival Show Master" className="arena-v1126-festival-master">
   <legend>V1126 · AI Festival Show Master</legend>
   <p>Eine gemeinsame Regieprobe koordiniert neun bestehende virtuelle Direktoren:
    Bühne, Hologramm, Kamera, Licht, Übergänge, Atmosphäre, Energie, Publikum und
    acht Crowd-Sektoren – mit sieben unveränderten Songphasen.</p>
   <label>Master-Konzertstil
    <select value={masterStyle} disabled={busy}
     onChange={e=>{setMasterStyle(e.target.value as MasterStyleV1126);invalidate();}}>
     {Object.entries(MASTER_LABELS_V1126).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Gemeinsame Show-Stärke {masterStrength}%
    <input type="range" min="20" max="80" step="10" value={masterStrength} disabled={busy}
     onChange={e=>{setMasterStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={masterEnabled} disabled={busy}
    onChange={e=>{setMasterEnabled(e.target.checked);invalidate();}}/>
    Master-Regie auch in neue Offline-/OpenAI-Entwürfe übernehmen
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true)}>
    V1126 komplette Festivalshow jetzt proben
   </button>
   {masterCanUndo&&<button type="button" onClick={revertFestivalShowMaster}>
    V1126 vorherige Show-Einstellungen wiederherstellen
   </button>}
   <small>Nur eine geplante Regiepartitur; keine Musik- oder Sängererkennung.
    Erst eine zweite Freigabe aktiviert vorhandene virtuelle Effekte.
    Manuelle Modi, Pause, Reduced Motion und GPU-Grenzen bleiben maßgebend.
    Keine Govee-, Nebelmaschinen-, Stroboskop- oder Mikrofonbefehle.</small>
  </fieldset>
  <fieldset aria-label="V1125 AI Festival Crowd Director 2.0" className="arena-v1125-festival-crowd">
   <legend>V1125 · Festival Crowd Director 2.0</legend>
   <p>Die vorhandene virtuelle Crowd reagiert in acht räumlichen Sektoren.
    Drei symbolische Stage-Crew-Fokusse koordinieren die geplanten Wellen über sieben Szenen.
    Keine automatische Sänger-/Beat-Erkennung und keine echten Geräte.</p>
   <label>Räumliche Publikumsformation
    <select value={festivalStyle} disabled={busy}
     onChange={e=>{setFestivalStyle(e.target.value as FestivalCrowdStyleV1125);invalidate();}}>
     {Object.entries(FESTIVAL_CROWD_LABELS_V1125).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Festivalbewegung {festivalStrength}%
    <input type="range" min="20" max="80" step="10" value={festivalStrength} disabled={busy}
     onChange={e=>{setFestivalStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={festivalEnabled} disabled={busy}
    onChange={e=>{setFestivalEnabled(e.target.checked);invalidate();}}/>
    Festival-Publikumsregie auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy}
    onClick={()=>local(false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true)}>
    V1125 Acht-Sektoren-Festival jetzt proben
   </button>
   {festivalCanUndo&&<button type="button" onClick={revertFestivalCrowd}>
    V1125 vorherige Publikumseinstellungen wiederherstellen
   </button>}
   <small>Die acht Sektoren sind eine visuelle Raumregie. Die drei Künstlerfokusse
    sind geplante Rollen, keine erkannten Sänger. Erst eine zweite Freigabe verändert
    bestehende virtuelle Crowd-Effekte. Pause, GPU-Grenzen, Reduced Motion und
    manuell gewählte Smartphone-Lichtmodi haben Vorrang.</small>
  </fieldset>
  <fieldset aria-label="V1124 AI Audience Energy Sync" className="arena-v1124-audience-sync">
   <legend>V1124 · AI Audience Energy Sync</legend>
   <p>Publikumswellen, Smartphone-Lichter, Armgesten und gemeinsame Reaktionen
    folgen sieben geplanten Konzertphasen. Keine neue Lautstärke-/Beatmessung,
    keine erzeugten Jubelgeräusche und kein automatischer Govee-Zugriff.</p>
   <label>Publikumsinszenierung
    <select value={audienceStyle} disabled={busy}
     onChange={e=>{setAudienceStyle(e.target.value as AudienceStyleV1124);invalidate();}}>
     {Object.entries(AUDIENCE_STYLE_LABELS_V1124).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Publikumsenergie {audienceStrength}%
    <input type="range" min="20" max="80" step="10" value={audienceStrength} disabled={busy}
     onChange={e=>{setAudienceStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={audienceEnabled} disabled={busy}
    onChange={e=>{setAudienceEnabled(e.target.checked);invalidate();}}/>
    Publikumswellen auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy}
    onClick={()=>local(false,false,false,false,false,false,false,false,false,false,false,false,false,false,true)}>
    V1124 Publikumswellen jetzt proben
   </button>
   {audienceCanUndo&&<button type="button" onClick={revertAudienceSync}>
    Frühere Publikumseinstellungen wiederherstellen
   </button>}
   <small>Live-Freigabe nur nach einem weiteren Klick. Benutzt vorhandene Crowd-Renderer
    mit festem Instanzbudget, Schutz bei Pause, wenig GPU, Reduced Motion und
    manuell gewähltem Handylicht-Modus. Die Vorschau ist keine sekundengenaue
    Steuerung von Jubelrufen, LED-Armbändern oder echten Smartphone-Geräten.</small>
  </fieldset>
  <fieldset aria-label="V1123 AI Concert Energy Director" className="arena-v1123-concert-energy">
   <legend>V1123 · AI Concert Energy Director</legend>
   <p>Eine gemeinsame Energie-Partitur koordiniert Kamera, Tanz, Bühnenformation,
    Licht und Atmosphäre über sieben geplante Songabschnitte. Das ist keine
    automatische vollständige Songanalyse und keine Vorhersage echter Drops.</p>
   <label>Energiedramaturgie
    <select value={energyStyle} disabled={busy}
     onChange={e=>{setEnergyStyle(e.target.value as EnergyStyleV1123);invalidate();}}>
     {Object.entries(ENERGY_LABELS_V1123).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Showenergie {energyStrength}%
    <input type="range" min="20" max="80" step="10" value={energyStrength} disabled={busy}
     onChange={e=>{setEnergyStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={energyEnabled} disabled={busy}
    onChange={e=>{setEnergyEnabled(e.target.checked);invalidate();}}/>
    Energiedramaturgie auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <label><input type="checkbox" checked={energyUseMeasurement} disabled={busy}
    onChange={e=>{setEnergyUseMeasurement(e.target.checked);invalidate();}}/>
    Freiwillige lokale V1108-Energiemessung vorsichtig berücksichtigen
   </label>
   <small>{energyUseMeasurement?(reading?.ready&&reading.confidence>=.58&&canSample&&!sampling?
    `Lokales Signal ausreichend (${Math.round(reading.confidence*100)}% Messsicherheit). Höchstens vier Energiepunkte Anpassung.`:
    'Noch keine ausreichende laufende Songmessung. Ohne sie verwendet V1123 ausschließlich die geplanten Szenen.'):
    'Nur die vorhandene Konzertdramaturgie. Keine Mikrofonpflicht.'}</small>
   <button type="button" disabled={busy}
    onClick={()=>local(false,false,false,false,false,false,false,false,false,false,false,false,false,true)}>
    V1123 Konzertenergie jetzt proben
   </button>
   {energyCanUndo&&<button type="button" onClick={revertConcertEnergy}>
    Frühere Konzertenergie-Einstellungen wiederherstellen
   </button>}
   <small>Erst nach gesonderter Zustimmung werden bestehende virtuelle Regiemodule
    aktiviert. Manuelle Szenen, GPU-/Bewegungsgrenzen und Hardware bleiben unangetastet.
    Lokale Messungen werden nicht an OpenAI gesendet oder gespeichert.</small>
  </fieldset>
  <fieldset aria-label="V1122 AI Concert Atmosphere Director" className="arena-v1122-concert-atmosphere">
   <legend>V1122 · AI Concert Atmosphere Director</legend>
   <p>Virtuelle Nebelschleier, Raumtiefe und bestehende Partikeleffekte über sieben
    Konzertkapitel. Die Szene enthält geplante Stimmungen, keine gemessene Nebeldichte
    oder automatisch erkannte Drops. Alle Song-Zeitmarken bleiben erhalten.</p>
   <label>Atmosphärenstil
    <select value={atmosphereStyle} disabled={busy}
     onChange={e=>{setAtmosphereStyle(e.target.value as AtmosphereStyleV1122);invalidate();}}>
     {Object.entries(ATMOSPHERE_LABELS_V1122).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Virtuelle Atmosphäre-Stärke {atmosphereStrength}%
    <input type="range" min="20" max="80" step="10" value={atmosphereStrength} disabled={busy}
     onChange={e=>{setAtmosphereStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={atmosphereEnabled} disabled={busy}
    onChange={e=>{setAtmosphereEnabled(e.target.checked);invalidate();}}/>
    Atmosphärenregie auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy}
    onClick={()=>local(false,false,false,false,false,false,false,false,false,false,false,false,true)}>
    V1122 Atmosphäre jetzt proben
   </button>
   {atmosphereCanUndo&&<button type="button" onClick={revertConcertAtmosphere}>
    Frühere Atmosphäre-Einstellungen wiederherstellen
   </button>}
   <small>Die Probe steuert weder Govee noch eine echte Nebelmaschine. Live werden nach
    separatem Klick ausschließlich die vorhandenen V1045-/V1058-/V1084-Renderer aktiviert.
    Manuelle Partikelmodi, Lyrics-Lesbarkeit, GPU-Grenzen und reduzierte Bewegung behalten Vorrang.</small>
  </fieldset>
  <fieldset aria-label="V1121 AI Immersive Scene Transitions" className="arena-v1121-immersive-transitions">
   <legend>V1121 · AI Immersive Scene Transitions</legend>
   <p>Sechs lokale, sanft berechnete Szenenübergänge: Kamera, Bühnenarchitektur,
    Licht und Hologramme. Die Vorschau folgt deinen originalen Show-Zeitmarken.
    Für die Live-Bühne bleiben die vorhandenen V1040/V1071-Interpolationen maßgebend.</p>
   <label>Übergangs-Regiestil
    <select value={transitionStyle} disabled={busy}
     onChange={e=>{setTransitionStyle(e.target.value as TransitionStyleV1121);invalidate();}}>
     {Object.entries(TRANSITION_LABELS_V1121).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Übergangslänge
    <select value={transitionDuration} disabled={busy}
     onChange={e=>{setTransitionDuration(e.target.value as 'short'|'balanced'|'long');invalidate();}}>
     <option value="short">Kurz · bis ca. 0,7 Sekunden</option>
     <option value="balanced">Ausgewogen · bis ca. 1,3 Sekunden</option>
     <option value="long">Filmisch · bis ca. 2,1 Sekunden</option>
    </select>
   </label>
   <label>Übergangsintensität {transitionStrength}%
    <input type="range" min="20" max="80" step="10" value={transitionStrength} disabled={busy}
     onChange={e=>{setTransitionStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={transitionEnabled} disabled={busy}
    onChange={e=>{setTransitionEnabled(e.target.checked);invalidate();}}/>
    Übergangsregie auch in neue Offline-/OpenAI-Entwürfe aufnehmen
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,false,false,false,false,false,false,false,false,false,false,true)}>
    V1121 Übergänge jetzt proben
   </button>
   {transitionCanUndo&&<button type="button" onClick={revertImmersiveTransitions}>
    Frühere Übergangseinstellungen wiederherstellen
   </button>}
   <small>Keine echten Drops erkannt. Ein zweiter Klick aktiviert ausschließlich vorhandene
    virtuelle Übergangs-Renderer. Manuelle Szenen, GPU-Grenzen und reduzierte Bewegung
    haben Vorrang. Keine Govee-, DMX-, Strobo- oder Pyro-Steuerung.</small>
  </fieldset>
  <fieldset aria-label="V1120 AI Dynamic Lighting Conductor" className="arena-v1120-dynamic-lighting">
   <legend>V1120 · AI Dynamic Lighting Conductor</legend>
   <p>Vier Lichtdramaturgien für die vorhandenen virtuellen 360°-Lichtsysteme,
    abgestimmt auf Kamera, Hologramme, Künstlerfokus und Atempause. Die Lichtfarben
    sind geplante Stimmungen, keine gespeicherten Farbwechsel der V1040-Timeline.</p>
   <label>Virtueller Licht-Regiestil
    <select value={lightingStyle} disabled={busy}
     onChange={e=>{setLightingStyle(e.target.value as LightingStyleV1120);invalidate();}}>
     {Object.entries(LIGHTING_LABELS_V1120).map(([key,label])=>
      <option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Virtuelle Lichtstärke {lightingStrength}%
    <input type="range" min="20" max="80" step="10" value={lightingStrength} disabled={busy}
     onChange={e=>{setLightingStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={lightingEnabled} disabled={busy}
    onChange={e=>{setLightingEnabled(e.target.checked);invalidate();}}/>
    Lichtregie auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,false,false,false,false,false,false,false,false,false,true)}>
    V1120 Lichtshow jetzt proben
   </button>
   {lightingCanUndo&&<button type="button" onClick={revertDynamicLighting}>
    Frühere Licht-Einstellungen wiederherstellen
   </button>}
   <small>Die Regieprobe ist lokal und steuert keine Lampen. Ein gesonderter Klick
    aktiviert nur V1056/V1058/V1059/V1060. Manuelle Licht-Timelines, Pausen,
    reduzierte Bewegung, Lyrics-Kontrast und GPU-Grenzen behalten Vorrang.
    Keine Govee-, DMX-, Strobo- oder Pyrotechnik-Befehle.</small>
  </fieldset>
  <fieldset aria-label="V1119 AI Cinematic Camera Director" className="arena-v1119-cinematic-camera">
   <legend>V1119 · AI Cinematic Camera Director 4.0</legend>
   <p>Vier filmische Kamerastile für die vorhandene 360°-Bühne: weiche Orbit- und Dollyfahrten,
    Künstlernähe und breite Ensemblebilder bei Hologramm-Momenten.
    Keine automatische Sänger-, Songstruktur- oder Drop-Erkennung.</p>
   <label>Kamera-Regiestil
    <select value={cameraStyle} disabled={busy}
     onChange={e=>{setCameraStyle(e.target.value as CameraStyleV1119);invalidate();}}>
     {Object.entries(CAMERA_STYLE_LABELS_V1119).map(([key,label])=>
      <option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Virtuelle Kamerafahrt-Stärke {cameraStrength}%
    <input type="range" min="20" max="80" step="10" value={cameraStrength} disabled={busy}
     onChange={e=>{setCameraStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={cameraEnabled} disabled={busy}
    onChange={e=>{setCameraEnabled(e.target.checked);invalidate();}}/>
    Kamera-Regie auch in neue Offline-/OpenAI-Entwürfe aufnehmen
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,false,false,false,false,false,false,false,false,true)}>
    V1119 Kamerafahrt jetzt proben
   </button>
   {cameraCanUndo&&<button type="button" onClick={revertCinematicCamera}>
    Frühere Kamera-Einstellungen wiederherstellen
   </button>}
   <small>Eine lokale, unverbindliche Partitur. Ein separater Klick aktiviert nur die vorhandenen
    V1043-, V1053- und V1072-Kameramodule. Manuell festgelegte Kameras, Lyrics,
    reduzierte Bewegung, schwache GPU und eine pausierte Wiedergabe behalten Vorrang.</small>
  </fieldset>
  <fieldset aria-label="V1118 AI Holographic Stage Director" className="arena-v1118-holographic-director">
   <legend>V1118 · AI Holographic Stage Director</legend>
   <p>Inszeniert vorhandene virtuelle Hologramm-Ringe, optische Tänzer-Silhouetten und
    Projektionen auf Bühnenflächen. Sieben geplante Songkapitel: kein echter
    Künstler-Klon, keine neue GLB-Datei, keine erkannten Drops und kein Hardware-Projektor.</p>
   <label>Hologramm-Regiestil
    <select value={holoStyle} disabled={busy}
     onChange={e=>{setHoloStyle(e.target.value as HologramStyleV1118);invalidate();}}>
     {Object.entries(HOLOGRAM_STYLE_LABELS_V1118).map(([key,label])=>
      <option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Virtuelle Hologramm-Intensität {holoStrength}%
    <input type="range" min="20" max="80" step="10" value={holoStrength} disabled={busy}
     onChange={e=>{setHoloStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={holoEnabled} disabled={busy}
    onChange={e=>{setHoloEnabled(e.target.checked);invalidate();}}/>
    Hologramm-Regie auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,false,false,false,false,false,false,false,true)}>
    V1118 Hologramm-Show jetzt proben
   </button>
   {holoCanUndo&&<button type="button" onClick={revertHolographicStage}>
    Frühere Hologramm-Einstellungen wiederherstellen
   </button>}
   <small>Die Probe ist rein lokal. Ein zusätzlicher Klick aktiviert ausschließlich vorhandene
    V1039-/V1068-/V1081-/V1085-Rendermodule. Automatik, Songposition, manuelle Muster,
    reduzierte Bewegung und GPU-Qualitätsgrenzen behalten Vorrang. Keine Govee-Geräte oder Kameras.</small>
  </fieldset>
  <fieldset aria-label="V1117 AI Stage Transformation" className="arena-v1117-ai-stage-transformation">
   <legend>V1117 · AI Stage Transformation</legend>
   <p>360°-Verwandlung mit echten vorhandenen Plattform-, Schwebebühnen- und
    Architekturmodulen: Intro, Strophen, Aufbau, Hook, Pause und großes Finale.
    Die Phasen sind entworfene Abschnitte, keine automatisch erkannten Drops.</p>
   <label>Bühnenverwandlungsstil
    <select value={stageStyle} disabled={busy}
     onChange={e=>{setStageStyle(e.target.value as StageStyleV1117);invalidate();}}>
     {Object.entries(STAGE_STYLE_LABELS_V1117).map(([key,value])=>
      <option key={key} value={key}>{value}</option>)}
    </select>
   </label>
   <label>Bühnenverwandlungsstärke {stageStrength}%
    <input type="range" min="20" max="80" step="10" value={stageStrength} disabled={busy}
     onChange={e=>{setStageStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={stageEnabled} disabled={busy}
    onChange={e=>{setStageEnabled(e.target.checked);invalidate();}}/>
    Bühnenverwandlung auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,false,false,false,false,false,false,true)}>
    V1117 Bühnenverwandlung jetzt proben
   </button>
   {stageCanUndo&&<button type="button" onClick={revertStageTransformation}>
    Frühere Bühnenbewegung wiederherstellen
   </button>}
   <small>Die Probe verändert keine Live-Bühne. Nach dem Showplan-Übernehmen
    können vorhandene virtuelle Bühneneffekte separat aktiviert werden.
    Dafür müssen 360°-Show Designer und Konzertdirektor aktiv sein.
    Manuelle Formationen, reduzierte Bewegung und schwache Hardware haben Vorrang.
    Keine Govee-, Strobo- oder Pyrotechnik-Befehle.</small>
  </fieldset>
  <label>Maximale virtuelle Showintensität: {cap}%
   <input type="range" min="30" max="85" step="5" value={cap} disabled={busy}
    onChange={e=>{setCap(Number(e.target.value));invalidate();}}/>
  </label>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
   <button type="button" onClick={()=>void remote()} disabled={busy||idea.trim().length<4}>
    {busy?'KI entwirft…':'Mit OpenAI kreativ gestalten'}
   </button>
   <button type="button" onClick={()=>local(false)} disabled={busy}>Offline-Remix ausprobieren</button>
   {canUndo&&<button type="button" onClick={revert}>Letzten Remix rückgängig machen</button>}
  </div>
  <small>OpenAI wird nur auf Knopfdruck angefragt (mit konfiguriertem OPENAI_API_KEY und Spotify-Anmeldung).
   Übertragen werden ausschließlich dein kurzer Gestaltungswunsch, Genre, Regiestil, Kontraste, Intensitätslimit und ggf. ein bewusst ausgewählter Stimmungshinweis –
   niemals Lyrics, Audiodaten, Tokens oder Govee-Geräteinformationen. Offline bleibt alles lokal.</small>
  {status&&<p role="status" aria-live="polite">{status}</p>}
  {preview&&<section aria-label="V1106 Show Remix Vorschau">
   {masterPreview&&<section aria-label="V1126 Festival Show Master Partitur">
    <h3>V1126 · Eine Show, neun virtuelle Regiekanäle</h3>
    <p role="note" aria-label="V1126 Master-Qualität">
     {masterPreview.quality.scenes} abgestimmte Szenen ·
     {masterPreview.quality.directors} vorhandene Regiemodule ·
     {masterPreview.quality.transitions} Szenenwechsel ·
     unveränderte Zeitmarken · ruhige Atempause · keine Hardwarebefehle.
    </p>
    {activeMaster&&<p role="status" aria-label="V1126 Aktuelle Showphase">
     Szene {activeMaster.index+1}: {activeMaster.focus} · Energie {activeMaster.energy}% ·
     Kamera {activeMaster.camera} · Licht {activeMaster.lighting} ·
     Bühne {activeMaster.stage}.
    </p>}
    <ol aria-label="V1126 sieben koordinierte Szenen">
     {masterPreview.scenes.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.scene}</strong> ·
      {Math.round(c.start*100)}–{Math.round(c.end*100)}% · Energie {c.energy}% ·
      Kamera {c.camera} · Bühne {c.stage} · Hologramm {c.hologram} ·
      Licht {c.lighting} · Atmosphäre {c.atmosphere} ·
      Publikum {c.audience} ({c.focus}) · Crowd-Spitzenlicht {c.maxCrowdLight}%.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion}
     onClick={activateFestivalShowMaster}>
     V1126 vorhandene virtuelle Festivalregie aktivieren
    </button>
    <small>Der vollständige Regieplan benötigt deine gesonderte Bestätigung.
     Die Kamera-, Licht-, Publikums- und Bühnenrenderer behalten ihre eigenen
     Laufzeitgrenzen; keine eigenständigen sekundengenauen Effekt-Zeitspuren.</small>
   </section>}
   {festivalPreview&&<section aria-label="V1125 Festival Crowd Director Partitur">
    <h3>V1125 · Acht Bereiche, drei Bühnenkünstler</h3>
    <p role="note" aria-label="V1125 Festival-Qualität">
     {festivalPreview.quality.scenes} Szenen · {festivalPreview.quality.sectors} feste Crowd-Sektoren ·
     {festivalPreview.quality.performers} geplante Bühnenrollen ·
     {festivalPreview.quality.quietBreak?'ruhige Atempause':'Ruhephase prüfen'} ·
     {festivalPreview.linkedAudience?'mit V1124 abgestimmt':'lokal geplant'}.
    </p>
    {activeFestival&&<p role="status" aria-label="V1125 Aktueller Künstlerfokus">
     Szene {activeFestival.scene.index+1}: {activeFestival.scene.focusLabel} ·
     Sektorwelle {activeFestival.sectors.join(' / ')}%.
     Diese Rollen sind Inszenierungsvorschläge, keine automatisch erkannten Sänger.
    </p>}
    <ol aria-label="V1125 sieben Festival-Szenen">
     {festivalPreview.scenes.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.focusLabel}</strong> ·
      {Math.round(c.start*100)}–{Math.round(c.end*100)}% des Songs ·
      Energie {c.energy}% · acht Sektorwerte: {c.sectors.join(' / ')}%.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateFestivalCrowd}>
     V1125 virtuelle Acht-Sektoren-Regie aktivieren
    </button>
    <small>Der echte 3D-Renderer verwendet feste V1032-Instanzen mit gedrosseltem
     Update-Takt sowie vorhandene V1073-/V1074-Module. Keine zusätzliche Crowd,
     keine Lautsprecher-, Mikrofon-, Govee- oder sonstigen Hardwarebefehle.</small>
   </section>}
   {audiencePreview&&<section aria-label="V1124 Audience Energy Sync Partitur">
    <h3>V1124 · Publikum und Bühne im gemeinsamen Rhythmus</h3>
    <p role="note" aria-label="V1124 Publikumsqualität">
     {audiencePreview.quality.scenes} Publikumsszenen ·
     {audiencePreview.energyLinked?'mit V1123 Konzertenergie verknüpft':'mit geplantem Show-Energieverlauf'} ·
     {audiencePreview.quality.quietBreak?'ruhige Atempause':'Atempause prüfen'} ·
     nur vorhandene virtuelle Crowd-Instanzen.
    </p>
    {activeAudience&&<p role="status" aria-label="V1124 Aktuelle Publikumswelle">
     Szene {activeAudience.scene.index+1}: {activeAudience.scene.label} ·
     Handylichter {activeAudience.channels.phones}% ·
     Lichtbänder {activeAudience.channels.wristbands}% ·
     Arme {activeAudience.channels.arms}% ·
     Jubelgesten {activeAudience.channels.cheer}%.
     Das sind geplante Regiewerte, keine Messung und kein Audiosignal.
    </p>}
    <ol aria-label="V1124 sieben Publikumswellen">
     {audiencePreview.scenes.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.label}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Energie {c.energy}% · Handylichter {c.channels.phones}% ·
      Lichtbänder {c.channels.wristbands}% · Arme {c.channels.arms}% ·
      Jubelgesten {c.channels.cheer}% · Bühnenfokus {c.channels.attention}%.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateAudienceSync}>
     V1124 vorhandene virtuelle Publikumsregie aktivieren
    </button>
    <small>Die angezeigte Partitur ist ein sicherer dramaturgischer Entwurf.
     Die Live-Crowd folgt nach Zustimmung ihren vorhandenen V1044/V1073/V1075/V1092-
     Rendermodulen und echten Wiedergabesignalen. Keine neuen Instanzen,
     keine automatischen Geräte-, Govee- oder Audio-Befehle.</small>
   </section>}
   {energyPreview&&<section aria-label="V1123 Concert Energy Partitur">
    <h3>V1123 · Gemeinsamer Show-Energiebogen</h3>
    <p role="note" aria-label="V1123 Energiequalität">
     {energyPreview.quality.scenes} Szenen · fünf koordinierte Regiekanäle ·
     {energyPreview.quality.quietBreak?'ruhige Atempause':'Atempause prüfen'} ·
     {energyPreview.measurementUsed?'kurze lokale Messung als kleine Korrektur':
      'rein geplante Dramaturgie – keine Songabschnitte erkannt'}.
    </p>
    {activeEnergy&&<p role="status" aria-label="V1123 Aktuelle Konzertenergie">
     Szene {activeEnergy.cue.index+1}: {activeEnergy.cue.chapter} ·
     Energie {activeEnergy.energy}% · Kamera {activeEnergy.channels.camera}% ·
     Tanz {activeEnergy.channels.dance}% · Bühne {activeEnergy.channels.stage}% ·
     Licht {activeEnergy.channels.lighting}% · Atmosphäre {activeEnergy.channels.atmosphere}%.
     Dies ist die Regieprobe, keine aktuelle Lautstärkemessung.
    </p>}
    <ol aria-label="V1123 sieben Energieszenen">
     {energyPreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.chapter}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Energie {c.energy}% · Kamera {c.camera}, Tanz {c.dance}, Deck {c.deck},
      Plattform {c.floating}, Laser {c.lasers}.
      <div role="img" aria-label={`V1123 Energie Szene ${c.index+1}: ${c.energy} von ${cap}`} style={{height:6,background:'rgba(130,155,185,.2)',borderRadius:4,maxWidth:240}}>
       <div style={{height:'100%',width:`${Math.round(100*c.energy/Math.max(1,cap))}%`,background:'linear-gradient(90deg,#35b7df,#cb67f7)',borderRadius:4}}/>
      </div>
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateConcertEnergy}>
     V1123 vorhandene virtuelle Konzertregie aktivieren
    </button>
    <small>Fünf Planungskanäle teilen ein Energie-Budget. V1040 übernimmt nur nach
     deiner Bestätigung die vorhandenen Timeline-Felder; die Live-Renderer steuern
     sich weiterhin über echte Musiksignale und eigene Schutzregeln.
     Keine direkten Govee-, Strobe- oder Pyrotechnikbefehle.</small>
   </section>}
   {atmospherePreview&&<section aria-label="V1122 Concert Atmosphere Partitur">
    <h3>V1122 · Virtuelle Konzertatmosphäre</h3>
    <p role="note" aria-label="V1122 Atmosphärenqualität">
     {atmospherePreview.quality.scenes} Atmosphärenszenen ·
     {atmospherePreview.quality.quietBreak?'ruhige Atempause':'Atempause prüfen'} ·
     {atmospherePreview.quality.lyricsReadable?'Lyrics-Sicht geschützt':'Sicht prüfen'}.
    </p>
    {activeAtmosphere&&<p role="status" aria-label="V1122 Aktuelle Atmosphäre">
     Szene {activeAtmosphere.cue.index+1}: {activeAtmosphere.cue.chapter} ·
     Nebel {activeAtmosphere.fog}% · Partikel {activeAtmosphere.particles}% ·
     Raumtiefe {activeAtmosphere.depth}% · Luftbewegung {activeAtmosphere.airflow}%.
     Dies ist eine virtuelle Regieprobe, keine Echtzeitmessung.
    </p>}
    <ol aria-label="V1122 sieben Atmosphärenszenen">
     {atmospherePreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.chapter}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Look {c.look}, Nebel {c.fog}%, Partikel {c.particles}%, Tiefe {c.depth}% ·
      Lyrics-Sicht mindestens {c.lyricsClearance}%.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateConcertAtmosphere}>
     V1122 vorhandene virtuelle Atmosphäre aktivieren
    </button>
    <small>Diese sieben Stimmungen sind kein sekundengenauer Partikel-Automationsplan.
     Die Live-Effekte folgen der vorhandenen V1045-/V1058-/V1084-Engine und deren eigenen
     Schutzregeln. Keine Hardware, Cloud-Abfrage oder Audioaufzeichnung.</small>
   </section>}
   {transitionPreview&&<section aria-label="V1121 Immersive Scene Transitions Partitur">
    <h3>V1121 · Sechs fließende Konzert-Übergänge</h3>
    <p role="note" aria-label="V1121 Übergangsqualität">
     {transitionPreview.quality.boundaries} Übergänge ·
     {transitionPreview.quality.noOverlappingWindows?'keine überlappenden Zeitfenster':'Grenzen prüfen'} ·
     originale Szenengrenzen bleiben erhalten.
    </p>
    <label>Virtuelle Übergangs-Probenposition: {previewPercent.toFixed(3)} des Songs
     <input type="range" min="0" max="100" step="0.1" value={Math.round(previewPercent*1000)/10}
      aria-label="V1121 Probenposition" onChange={e=>{setFollowSong(false);setConductorScrub(Number(e.target.value));}}/>
    </label>
    {activeTransition?<p role="status" aria-label="V1121 Aktueller Übergang">
     Übergang {activeTransition.cue.index+1}: {activeTransition.cue.from} → {activeTransition.cue.to} ·
     Überblendung {Math.round(activeTransition.blend*100)}% ·
     Kamera {Math.round(activeTransition.cameraToGain*100)}% ·
     Bühne {Math.round(activeTransition.stageToGain*100)}% ·
     Hologramm {Math.round(activeTransition.hologramToGain*100)}% ·
     Licht {Math.round(activeTransition.lightingToGain*100)}%.
    </p>:<p role="status" aria-label="V1121 Aktueller Übergang">
     An dieser Probenposition läuft kein Szenenübergang. Bewege den V1111-Songregler
     zu einer der sechs Szenengrenzen, um die Überblendung zu sehen.
    </p>}
    <ol aria-label="V1121 sechs Szenenübergänge">
     {transitionPreview.cues.map(c=><li key={c.index}>
      <strong>Übergang {c.index+1}: {c.from} → {c.to}</strong> ·
      bei {Math.round(c.atMs/1000)} s · Fenster {Math.round(c.durationMs)} ms ·
      Kamera {c.fromCamera} → {c.toCamera} ·
      Bühne {c.fromDeck} → {c.toDeck} ·
      Plattformen {c.fromFloating} → {c.toFloating} ·
      Licht/Hologramm als bestehende virtuelle Renderer.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateImmersiveTransitions}>
     V1121 vorhandene virtuelle Übergangsregie aktivieren
    </button>
    <small>Die berechneten Fenster sind eine Vorschau, keine eigene sekundengenaue Live-Timeline.
     Die tatsächlichen Kamera-, Bühnen-, Hologramm- und Licht-Easings bleiben den
     bereits vorhandenen Renderern vorbehalten. Keine Hardware oder zusätzlichen Audioabfragen.</small>
   </section>}
   {lightingPreview&&<section aria-label="V1120 Dynamic Lighting Partitur">
    <h3>V1120 · Koordinierte virtuelle Lichtregie</h3>
    <p role="note" aria-label="V1120 Licht-Qualität">
     {lightingPreview.quality.scenes} Lichtszenen · {lightingPreview.quality.lightLooks} Lichtlooks ·
     {lightingPreview.quality.quietBreak?'ruhige Atempause':'Lichtpause prüfen'} ·
     {lightingPreview.quality.fadeSafe?'begrenzte Übergänge':'Übergänge prüfen'}.
    </p>
    {activeLightingCue&&<p role="status" aria-label="V1120 Aktueller Lichtfokus">
     Szene {activeLightingCue.index+1}: {activeLightingCue.chapter} ·
     {activeLightingCue.colorMood} · Lichtenergie {activeLightingCue.virtualBrightness}%.
     Dies ist eine virtuelle Lichtprobe, keine Lichtmessung oder Gerätesteuerung.
    </p>}
    <ol aria-label="V1120 sieben Lichtszenen">
     {lightingPreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.chapter}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Lichtlook {c.look}, Stimmung {c.colorMood}, {c.virtualBrightness}% ·
      Kamera {c.camera}, Laserlook {c.lasers}.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateDynamicLighting}>
     V1120 vorhandene virtuelle Lichtregie aktivieren
    </button>
    <small>Die Vorschau verwendet die Zeitmarken des Showplans; weder echte Verse/Drops
     noch exakte Lichtfarben werden erkannt. Separate Bestätigung schaltet nur
     die vorhandenen virtuellen Lichtmodule ein. Keine Govee- oder Gerätebefehle.</small>
   </section>}
   {cameraPreview&&<section aria-label="V1119 Cinematic Camera Partitur">
    <h3>V1119 · Filmische 360°-Kameraregie</h3>
    <p role="note" aria-label="V1119 Kamera-Qualität">
     {cameraPreview.quality.scenes} Kameraszenen · {cameraPreview.quality.cameraLooks} Perspektiven ·
     {cameraPreview.quality.quietBreak?'ruhige Atempause':'Pause prüfen'} ·
     {cameraPreview.quality.smoothExistingCamera?'weiche vorhandene Übergänge':'Übergänge prüfen'}.
    </p>
    {activeCameraCue&&<p role="status" aria-label="V1119 Aktueller Kamerafokus">
     Szene {activeCameraCue.index+1}: {activeCameraCue.chapter} · Kamera {activeCameraCue.camera}.
     Dies ist nur eine Kameraprobe, kein Live-Schwenk und keine Sängererkennung.
    </p>}
    <ol aria-label="V1119 sieben Kameraszenen">
     {cameraPreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.chapter}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Kamera {c.camera} · Fokus {c.focus} · sanfte V1072-Überblendung.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateCinematicCamera}>
     V1119 vorhandene filmische Kamerafahrten aktivieren
    </button>
    <small>Freigabe separat zur Showplan-Übernahme. Bewegungen laufen nur in vorhandenen
     automatischen Kameras und werden durch manuelle Regie, Pausen und Motion-Schutz gesperrt.
     Die Partitur ist geplant und kein sekundenexakt reproduzierter V1072-Kamera-Cut-Track.</small>
   </section>}
   {holoPreview&&<section aria-label="V1118 Holographic Stage Partitur">
    <h3>V1118 · Optisches Hologramm-Konzert</h3>
    <p role="note" aria-label="V1118 Hologramm-Qualität">
     {holoPreview.quality.scenes} Szenen · {holoPreview.quality.looks} Hologramm-Phasen ·
     Projektion {holoPreview.quality.projectedPattern} ·
     {holoPreview.quality.quietBreak?'Atempause mit reduziertem Licht':'Atempause prüfen'} ·
     {holoPreview.quality.safeTransitions?'sanfte Übergänge':'Übergänge prüfen'}.
    </p>
    {activeHoloCue&&<p role="status" aria-label="V1118 Aktueller Hologramm-Fokus">
     Szene {activeHoloCue.index+1}: {activeHoloCue.chapter} ·
     Hologrammlook {activeHoloCue.look} · optische Choreografie {activeHoloCue.opticalDancers} ·
     Projektion {activeHoloCue.projection}. Nur Regieprobe, keine Live-Geräte.
    </p>}
    <ol aria-label="V1118 sieben holografische Szenen">
     {holoPreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.chapter}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Look {c.look} · Lichtfigur {c.opticalDancers} · Projektion {c.projection} · Laserlook {c.lasers}.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateHolographicStage}>
     V1118 vorhandene virtuelle Hologramm-Show aktivieren
    </button>
    <small>Separate Zustimmung für die bisherigen optischen Render-Effekte. Der Stil verändert
     das Projektionsmuster, während bestehende V1068/V1081-Effekte weiterhin den
     Songabschnitten folgen. Keine echte Künstlerprojektion oder zusätzlicher Avatar.</small>
   </section>}
   {stagePreview&&<section aria-label="V1117 Stage Transformation Partitur">
    <h3>V1117 · 360°-Bühnenverwandlung</h3>
    <p role="note" aria-label="V1117 Bühnenqualität">
     {stagePreview.quality.scenes} Szenen · {stagePreview.quality.layouts} Bühnenformationen ·
     {stagePreview.quality.floatingModes} Schwebevarianten ·
     {stagePreview.quality.quietBreak?'bewusste Atempause':'Atempause prüfen'} ·
     {stagePreview.quality.smoothTransitions?'weiche Übergänge':'Übergänge prüfen'}.
    </p>
    {activeStageCue&&<p role="status" aria-label="V1117 Aktuelle Bühnenszene">
     Szene {activeStageCue.index+1}: {activeStageCue.chapter} · Bühne {activeStageCue.deck} ·
     Plattformen {activeStageCue.floating} · Laserlook {activeStageCue.lasers}.
     Dies ist eine Regieprobe ohne Live-Bühnenbewegung.
    </p>}
    <ol aria-label="V1117 sieben Bühnenverwandlungen">
     {stagePreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.chapter}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Bühne {c.deck} · Plattformen {c.floating} · Laser {c.lasers} · {c.intensity}%.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateStageTransformation}>
     V1117 vorhandene virtuelle Bühnenverwandlung aktivieren
    </button>
    <small>Zweiter, separater Opt-in-Schritt für bereits vorhandene V1066/V1067/V1082/V1086-Module.
     Es werden keine neuen 3D-Modelle erzeugt; die Live-Show verwendet die gespeicherte Timeline,
     Songposition und bestehende Leistungssperren.</small>
   </section>}
   {interactionPreview&&<section aria-label="V1116 Artist Interaction Partitur">
    <h3>V1116 · Künstlerwechsel und Duo-Regie</h3>
    <p role="note" aria-label="V1116 Interaktionsqualität">
     {interactionPreview.quality.scenes} Szenen · {interactionPreview.quality.leadChanges} Lead-Wechsel ·
     {interactionPreview.quality.partnerMoments} Partnermomente ·
     {interactionPreview.quality.quietMoments} ruhige Szenen ·
     {interactionPreview.quality.verifiedSingerAssignments} verifizierte Sänger.
    </p>
    {activeInteractionCue&&<p role="status" aria-label="V1116 Aktuelle Interaktion">
     Szene {activeInteractionCue.index+1}: {activeInteractionCue.kind} ·
     {activeInteractionCue.description}
    </p>}
    <ol aria-label="V1116 sieben Künstlerinteraktionen">
     {interactionPreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1} · {c.kind}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Kamera {c.camera} · {c.gesture}.
      <span> {c.leadId?c.leadId.replace('sonic-','').replaceAll('-',' '):'Ensemble'}
       {c.partnerId?' ↔ '+c.partnerId.replace('sonic-','').replaceAll('-',' '):''}</span>
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={applyLiveInteraction}>
     V1116 vorhandene Live-Artist-Interaktion aktivieren
    </button>
    <small>Separater Opt-in: aktiviert nur den existierenden V1079-Modus für
     sichere Interaktionen während belegter Lyrics-Pausen. Der neue siebenphasige
     Regieplan ist zunächst nur eine Vorschau und wird ausschließlich mit
     „In meinen Showplan übernehmen“ gespeichert.</small>
   </section>}
   {vocalPreview&&<section aria-label="V1115 Vocal Acting Partitur">
    <h3>V1115 · Künstlerrollen und Vocal-Acting</h3>
    <p role="note" aria-label="V1115 Vocal-Qualität">
     {vocalPreview.quality.scenes} Szenen · {vocalPreview.quality.distinctActs} Vocal-Akzenttypen ·
     {vocalPreview.quality.roleChanges?'wechselnde Bühnenrollen':'Rollen unverändert'} ·
     {vocalPreview.quality.verifiedSingerAssignments} automatisch verifizierte Sänger.
    </p>
    {activeVocalCue&&<p role="status" aria-label="V1115 Aktuelle Vocal-Szene">
     Szene {activeVocalCue.index+1}: {activeVocalCue.intent} · {activeVocalCue.caption}
    </p>}
    <ol aria-label="V1115 sieben Vocal-Szenen">
     {vocalPreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1} · {c.intent}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      <ul>{c.members.map(m=><li key={m.id}>{m.label} · {m.role} · {m.act} · Ausdruck {m.energy}%</li>)}</ul>
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={applyVocalPreset}>
     V1115 Vocal-Preset für vorhandene Lip-Sync-Engine aktivieren
    </button>
    <small>Separater Opt-in-Schritt: setzt nur vorhandene Vocal-Einstellungen. Es werden
     keine neuen Sängerzuordnungen, Texte, Mundformen oder Clips erfunden;
     manuelle Zuordnungen bleiben vorrangig. Die Show-Timeline benötigt weiterhin
     den separaten Übernehmen-Button.</small>
   </section>}
   {dancePreview&&<section aria-label="V1114 Dance Choreographer Partitur">
    <h3>V1114 · Drei Tänzer, eine Konzertchoreografie</h3>
    <p role="note" aria-label="V1114 Tanzqualität">
     {dancePreview.quality.scenes} Szenen · {dancePreview.quality.differentForms} Formationen ·
     {dancePreview.quality.individualClips} verschiedene GLB-Clip-Vorschläge ·
     {dancePreview.quality.safeTransitions?'kontrollierte Übergänge':'Übergänge prüfen'}.
    </p>
    {activeDanceCue&&<p role="status" aria-label="V1114 Aktuelle Tanzszene">
     Szene {activeDanceCue.index+1}: {activeDanceCue.form} · {activeDanceCue.section} ·
     Crew-Modus {activeDanceCue.crewMode}. Vorschau, noch keine Live-Aktion.
    </p>}
    <ol aria-label="V1114 sieben Tanzszenen">
     {dancePreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.form}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% · {c.description}
      <ul>{c.members.map(member=><li key={member.id}>
       {member.label} · {member.role} · {member.clipSuggestion} · {member.energy}% ·
       {member.beatOffset} Beats Versatz
      </li>)}</ul>
     </li>)}
    </ol>
    <button type="button" onClick={activateCrewStory} disabled={busy}>
     V1114 Stage-Crew-Automatik für echte GLB-Clips aktivieren
    </button>
    <small>Diese separate Zustimmung aktiviert den optionalen lokalen Abschnittswechsel
     (ruhig → Solo → Kanon → gemeinsamer Drop) in der bestehenden Stage Crew.
     Zunächst im Stage-Crew-Bereich „Trio auf der Bühne einrichten“ wählen.
     Die gezeigte Partitur ist nicht identisch mit einer Clip-für-Clip gespeicherten Timeline:
     der Live-Player wählt ausschließlich tatsächlich vorhandene Clips.</small>
   </section>}
   {performancePreview&&<section aria-label="V1113 Performance Director Partitur">
    <h3>V1113 · Dynamische Künstler-Performance</h3>
    <p role="note" aria-label="V1113 Performance-Qualität">
     {performancePreview.quality.chapters} Szenen · {performancePreview.quality.distinctGestures} Gestikvarianten ·
     {performancePreview.quality.soloChapters} Solo- und {performancePreview.quality.ensembleChapters} Ensemble-Momente ·
     {performancePreview.quality.safeTransitions?'kontrollierte Intensitätsübergänge':'Übergänge prüfen'}.
    </p>
    {activePerformanceCue&&<p role="status" aria-label="V1113 Aktuelle Performance">
     Szene {activePerformanceCue.index+1}: {activePerformanceCue.moment} ·
     {activePerformanceCue.focusId?activePerformanceCue.performers.find(p=>p.id===activePerformanceCue.focusId)?.label:'Alle drei'} im Fokus.
     Kamera {activePerformanceCue.camera}, Tanz {activePerformanceCue.dance}.
     Es handelt sich um eine Vorschau ohne Live-Gestensteuerung.
    </p>}
    <ol aria-label="V1113 sieben Performance-Szenen">
     {performancePreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.moment}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      {c.performers.map(member=><div key={member.id} style={{margin:'4px 0 8px 8px'}}>
       {member.spotlight?'★ ':''}{member.label} ({member.role}): {member.cue} · Energie {member.energy}%
       <div style={{height:6,width:'100%',maxWidth:220,background:'rgba(120,130,150,.2)',borderRadius:3}}>
        <div style={{height:'100%',width:`${member.energy}%`,background:'#8ae8ff',borderRadius:3}}/>
       </div>
      </div>)}
     </li>)}
    </ol>
    <small>Die Rollen und Gesten sind Inszenierungsvorschläge. Nur die bestehenden gemeinsamen
     Kamera- und Tanzmodi werden nach „Übernehmen“ in die Timeline geschrieben.</small>
   </section>}
   {personalityPreview&&<section aria-label="V1112 Avatar Personality Partitur">
    <h3>V1112 · Drei Bühnenpersönlichkeiten</h3>
    <p role="note" aria-label="V1112 Charakter-Qualität">
     {personalityPreview.quality.distinctPersonalities} unterschiedliche Charaktere ·
     {personalityPreview.quality.featuredPerformers} Performer im Fokus ·
     {personalityPreview.quality.ensembleMoments} gemeinsame Ensemble-Momente ·
     {personalityPreview.quality.safeTransitions?'kontrollierte Übergänge':'Übergänge prüfen'}.
    </p>
    {activePersonalityCue&&<p role="status" aria-label="V1112 Aktueller Avatar-Fokus">
     Szene {activePersonalityCue.index+1}: {activePersonalityCue.focusId?
      activePersonalityCue.performers.find(x=>x.id===activePersonalityCue.focusId)?.label:'Alle drei zusammen'} ·
     Kamera {activePersonalityCue.camera} · Tanz {activePersonalityCue.dance}.
     Dies ist eine Regieprobe, keine individuelle Live-Animation.
    </p>}
    <ol aria-label="V1112 sieben Charakter-Szenen">
     {personalityPreview.cues.map(cue=><li key={cue.index}>
      <strong>Szene {cue.index+1}</strong> · {Math.round(cue.start*100)}–{Math.round(cue.end*100)}% ·
      {cue.performers.map(member=><span key={member.id}>
       {' '}{member.label}: {member.direction} ({member.role});
      </span>)}
     </li>)}
    </ol>
   </section>}
   {conductorPreview&&<section aria-label="V1111 Konzertregie Partitur">
    <h3>V1111 · Koordinierte Live-Show-Regie</h3>
    <p role="note" aria-label="V1111 Regie-Qualität">
     {conductorPreview.quality.synchronizedActs} abgestimmte Szenen ·
     {conductorPreview.quality.cameraVariety} Kameraperspektiven ·
     {conductorPreview.quality.safeTransitions?'kontrollierte Übergänge':'Übergang prüfen'} ·
     {conductorPreview.quality.quietContrast?'bewusste Atempause':'Kontrast prüfen'}.
    </p>
    <label>Virtuelle Probenposition: {Math.round(previewPercent*100)}% des Songs
     <input aria-label="V1111 Probeposition" type="range" min="0" max="100" step="1"
      disabled={followSong&&followAvailable} value={Math.round(previewPercent*100)}
      onChange={e=>setConductorScrub(Number(e.target.value))}/>
    </label>
    <label><input type="checkbox" checked={followSong&&followAvailable}
     disabled={!followAvailable} onChange={e=>setFollowSong(e.target.checked)}/>
     Laufender Spotify-Songposition folgen (nur Anzeige)
    </label>
    {activeConductorCue&&<p role="status" aria-label="V1111 Aktueller Regieimpuls">
     Probe: Szene {activeConductorCue.index+1} · {activeConductorCue.moment} ·
     {activeConductorCue.intensity}% · Kamera {activeConductorCue.camera} ·
     Tanz {activeConductorCue.dance} · Laser {activeConductorCue.lasers}.
     Keine virtuelle oder reale Bühne wird durch den Probenregler verändert.
    </p>}
    <ol aria-label="V1111 sieben koordinierte Regie-Cues">
     {conductorPreview.cues.map(c=><li key={c.index}>
      <strong>{c.moment}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      {c.intensity}% · Kamera {c.camera} · Tanz {c.dance} ·
      Bühne {c.deck}/{c.floating} · Laser {c.lasers}. {c.description}
     </li>)}
    </ol>
   </section>}
   {auditCreativeRemixV1107(preview)&&<p role="note" aria-label="V1107 Regie-Qualitätsvorschau">
     Regie-Check: {auditCreativeRemixV1107(preview)?.uniqueCameras} Kameraperspektiven,
     {auditCreativeRemixV1107(preview)?.uniqueStages} Bühnenvarianten,
     Dynamikspanne {auditCreativeRemixV1107(preview)?.contrastRange} Punkte.
     Die Szenenwechsel bleiben auf maximal 45 Intensitätspunkte begrenzt.
   </p>}
   {storyPreview&&<section aria-label="V1109 Storybogen Vorschau">
    <h3>Storybogen: {STORY_ARC_LABELS_V1109[storyPreview.arc]}</h3>
    <p role="note" aria-label="V1109 Story-Qualitätscheck">
     {storyPreview.quality.quietMoments} bewusste Ruhephasen · {storyPreview.quality.cameraVariety} Kameraperspektiven ·
     {storyPreview.quality.stageVariety} Bühnenvarianten · Spannungsumfang {storyPreview.quality.dramaticRange} Punkte ·
     {storyPreview.quality.safeTransitions?'sanfte Übergänge':'Übergänge prüfen'}.
    </p>
    <ol aria-label="V1109 sieben Storyphasen">
     {storyPreview.beats.map(beat=><li key={beat.index}>
      <strong>{beat.title}</strong> · {Math.round(beat.start*100)}–{Math.round(beat.end*100)}% des Songs ·
      {beat.intensity}% Showintensität. {beat.description}
     </li>)}
    </ol>
   </section>}
   <h3>{preview.title} <small>({source==='ai'?'OpenAI':'Lokaler Entwurf'})</small></h3>
   <p>{preview.explanation}</p>
   <ol style={{paddingLeft:22}}>
    {preview.acts.map((act,index)=><li key={index} style={{marginBottom:10}}>
     <strong>{index+1}. {NAMES[act.scene]} · {Math.min(cap,act.intensity)}%</strong>
     <div style={{height:7,width:'100%',maxWidth:350,background:'rgba(120,130,150,.22)',borderRadius:5}}>
      <div style={{height:'100%',width:`${Math.min(cap,act.intensity)}%`,background:'#7fe9f3',borderRadius:5}}/>
     </div>
     <small>Kamera: {act.camera} · Bühne: {act.deck}/{act.floating} · Laserlook: {act.lasers} · Tanz: {act.dance}</small>
     <p style={{margin:'3px 0 0'}}>{act.note}</p>
    </li>)}
   </ol>
   {preferences.reducedMotion&&<p>Bewegungsreduktion ist aktiv: Die Live-Bühne ignoriert bewegte Showplan-Cues weiterhin.</p>}
   <button type="button" onClick={apply}>Diese sieben Szenen in meinen Showplan übernehmen</button>
   <button type="button" onClick={invalidate}>Vorschlag verwerfen</button>
   <small>Dies ist eine entworfene Timeline, keine Erkennung echter Hooks oder Drops.
    Keine automatische Aktivierung von Pyrotechnik, Strobo, Govee oder anderen Geräten.</small>
  </section>}
 </fieldset>;
}
