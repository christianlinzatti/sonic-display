'use client';
/** V881: Lightweight 2D concert overlay and opt-in cue controls. No WebGL allocations. */
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {getConcertTimelineV763,CONCERT_TIMELINE_EVENT_V763,
 type ConcertTimelineSnapshotV763} from './concertTimelineBridgeV763';
import {DEFAULT_LIVE_FX_V881,LIVE_FX_KEY_V881,normalizeLiveFxSettingsV881,
 planLiveFxCueV881,resolveLiveFxStyleV881,selectLiveFxLookV881,
 verifiedLiveFxScenesV881,exportLiveFxSheetV881,resetManualLiveFxOnSeekV881,
 type LiveFxSettingsV881,type LiveFxTriggerV881,type LiveFxManualV881} from './liveFxDeckPlannerV881';
import {CONCERT_MOMENTS_KEY_V883,DEFAULT_CONCERT_MOMENTS_V883,normalizeConcertMomentsV883,
 buildConcertMomentsV883,planConcertMomentV883,exportConcertMomentsV883,
 type ConcertMomentsSettingsV883} from './intelligentConcertMomentsV883';
import {CINEMATIC_TRANSITIONS_KEY_V884,DEFAULT_CINEMATIC_TRANSITIONS_V884,
 normalizeCinematicTransitionsV884,buildCinematicTransitionsV884,sampleCinematicTransitionV884,
 exportCinematicTransitionsV884,type CinematicTransitionSettingsV884} from './cinematicConcertTransitionsV884';
import {ATMOSPHERE_STORAGE_KEY_V885,DEFAULT_ATMOSPHERE_V885,normalizeAtmosphereV885,
 buildAtmospherePlanV885,sampleAtmosphereV885,exportAtmospherePlanV885,
 previewAtmospherePaletteV885,resolveAtmospherePaletteV885,
 type AtmosphereSettingsV885} from './dynamicConcertAtmosphereV885';
import {FOG_STORAGE_KEY_V887,DEFAULT_FOG_V887,normalizeCinematicFogV887,previewFogV887,
 exportFogPlanV887,type CinematicFogSettingsV887} from './cinematicFogDirectorV887';
import {LASER_SHOW_KEY_V888,DEFAULT_LASER_SHOW_V888,normalizeLaserShowV888,
 LASER_PATTERN_LABELS_V888,exportLaserShowV888,type LaserShowSettingsV888} from './laserShowDirectorV888';
import {PARTICLE_STORAGE_KEY_V889,DEFAULT_PARTICLE_V889,normalizeParticleV889,
 suggestedParticleHeroV889,exportParticlePlanV889,type ParticleSettingsV889} from './advancedParticleDirectorV889';
import {PYRO_STORAGE_KEY_V891,DEFAULT_PYRO_V891,normalizePyroV891,
 suggestedPyroV891,exportPyroPlanV891,type PyroSettingsV891} from './virtualPyrotechnicsV891';
import {ULTIMATE_KEY_V900,DEFAULT_ULTIMATE_V900,normalizeUltimateV900,buildUltimatePlanV900,
 sampleUltimateV900,exportUltimatePlanV900,type UltimateSettingsV900} from './ultimateConcertExperienceV900';
import {CHOREOGRAPHY_KEY_V993,DEFAULT_CHOREOGRAPHY_V993,normalizeChoreographyV993,previewChoreographyV993,
 type ChoreographySettingsV993} from './aiChoreographyDirectorV993';
import {VOCAL_KEY_V994,DEFAULT_VOCAL_V994,normalizeVocalV994,type VocalSettingsV994} from './vocalPerformanceIntelligenceV994';
import {DUET_KEY_V995,DEFAULT_DUET_V995,normalizeDuetV995,type DuetSettingsV995} from './duetEnsembleDirectorV995';
import {CROWD_EXPERIENCE_KEY_V996,DEFAULT_CROWD_EXPERIENCE_V996,normalizeCrowdExperienceV996,type CrowdExperienceSettingsV996} from './virtualCrowdExperienceV996';
import {CONCERT_FLOW_KEY_V997,DEFAULT_FLOW_V997,EMPTY_FLOW_V997,normalizeFlowV997,advanceFlowV997,type FlowSettingsV997,type FlowHandoverV997} from './continuousConcertFlowV997';
import {DANCE_SHOW_KEY_V899,DEFAULT_DANCE_SHOW_V899,normalizeDanceShowV899,exportDanceShowV899,
 type DanceShowSettingsV899} from './advancedDanceShowDirectorV899';
import {DANCE_CAMERA_KEY_V898,DEFAULT_DANCE_CAMERA_V898,normalizeDanceCameraV898,exportDanceCameraV898,
 type DanceCameraSettingsV898} from './danceCameraCoordinationV898';
import {CAMERA_KEY_V897,DEFAULT_CAMERA_V897,normalizeCinematicCameraV897,selectCameraShotV897,exportCinematicCameraV897,
 type CinematicCameraSettingsV897} from './cinematicCameraDirectorV897';
import {CINEMA_KEY_V992,DEFAULT_CINEMA_V992,normalizeCinemaV992,previewCinemaV992,
 type CinemaSettingsV992} from './cinematicCameraDirectorV992';
import {ENERGY_KEY_V896,DEFAULT_ENERGY_V896,normalizeEnergyV896,readEnergyV896,exportEnergyV896,
 type EnergySettingsV896} from './musicalEnergyIntelligenceV896';
import {DIRECTOR_KEY_V895,DEFAULT_DIRECTOR_V895,normalizeDirectorV895,buildDirectorPlanV895,
 sampleDirectorV895,exportDirectorV895,type DirectorSettingsV895} from './aiConcertDirectorV895';
import {GENRE_STAGE_KEY_V894,DEFAULT_GENRE_STAGE_V894,normalizeGenreStageV894,
 buildGenreStagePlanV894,exportGenreStageV894,resolveGenreStageLookV894,GENRE_STAGE_LOOKS_V894,
 type GenreStageSettingsV894} from './ultimateGenreStageV894';
import {ARENA_CROWD_KEY_V893,DEFAULT_ARENA_CROWD_V893,normalizeArenaCrowdV893,
 buildArenaCrowdPlanV893,exportArenaCrowdV893,type ArenaCrowdSettingsV893} from './arenaCrowdAtmosphereV893';
import {EPIC_DROP_KEY_V892,DEFAULT_EPIC_DROP_V892,normalizeEpicDropV892,
 buildEpicDropPlanV892,sampleEpicDropV892,exportEpicDropPlanV892,type EpicDropSettingsV892} from './epicDropExperienceV892';
import {SPOTLIGHT_STORAGE_KEY_V890,DEFAULT_SPOTLIGHT_V890,normalizeSpotlightV890,
 suggestedSpotlightV890,exportSpotlightPlanV890,type SpotlightSettingsV890} from './professionalSpotlightShowV890';
import {ConcertQualityIntelligencePanelV901} from './ConcertQualityIntelligencePanelV901';
import {ImmersiveAiDirectorV982} from './ImmersiveAiDirectorV982';
import {LiveConcertAssistantV998} from './LiveConcertAssistantV998';
import {InteractiveConcertControlV1001} from './InteractiveConcertControlPanelV1001';
import {AutoImprovementDirectorV1003} from './AutoImprovementDirectorPanelV1003';
import type {TouchValuesV1001,TouchContextV1001} from './interactiveConcertControlV1001';
import {getImmersiveSettingsV1000,useImmersiveSettingsV1000,restoreImmersiveSettingsV1000,setImmersiveSettingsV1000} from './immersiveConcertStoreV1000';
import {normalizeLivePlanV998,resolveLiveChangesV998,
 type LivePlanV998,type LiveSnapshotV998} from '@/lib/liveConcertAssistantV998';
import {SongIntelligencePanelV983} from './SongIntelligencePanelV983';
import {SongUnderstandingPanelV1018} from './SongUnderstandingPanelV1018';
import {PredictiveConcertPanelV1019} from './PredictiveConcertPanelV1019';
import {ConcertStorytellingPanelV1020} from './ConcertStorytellingPanelV1020';
import type {ImmersivePlanV982} from '@/lib/immersiveAiDirectorV982';
import type {AdvisorPatchV902} from './concertQualityAdvisorV902';
import {validReviewPatchV903} from './concertQualityReviewV903';
import {CONCERT_SYNC_KEY_V882,DEFAULT_CONCERT_SYNC_V882,normalizeConcertSyncV882,
 publishConcertStageSyncV882,type ConcertSyncSettingsV882} from './concertStageSyncV882';

type Props={trackId:string;title:string;artist:string;durationMs:number;progressMs:number;genre:string;
 playing:boolean;reducedMotion:boolean;lyricsProtected?:boolean;controlsVisible?:boolean};
const fmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
const sparks=Array.from({length:12},(_,i)=>i);
const effectLabels:Record<LiveFxManualV881,string>={shockwave:'Bass-Welle',sweep:'Arena Sweep',confetti:'Konfetti'};
const sceneLabels:Record<string,string>={verse:'Verse',hook:'Hook',build:'Build-up',drop:'Drop',break:'Break'};
const momentIcons:Record<string,string>={rise:'↗',hook:'✦',drop:'◎',finale:'★'};

export function LiveFxDeckV881({trackId,title,artist,durationMs,progressMs,genre,playing,reducedMotion,lyricsProtected=false,controlsVisible=true}:Props){
 const [settings,setSettings]=useState<LiveFxSettingsV881>({...DEFAULT_LIVE_FX_V881});
 const immersiveSettingsV1000=useImmersiveSettingsV1000();
 useEffect(()=>{restoreImmersiveSettingsV1000();},[]);
 const [storageReady,setStorageReady]=useState(false);
 const [syncSettings,setSyncSettings]=useState<ConcertSyncSettingsV882>({...DEFAULT_CONCERT_SYNC_V882});
 const [syncReady,setSyncReady]=useState(false);
 const [momentSettings,setMomentSettings]=useState<ConcertMomentsSettingsV883>({...DEFAULT_CONCERT_MOMENTS_V883});
 const [transitionSettings,setTransitionSettings]=useState<CinematicTransitionSettingsV884>({...DEFAULT_CINEMATIC_TRANSITIONS_V884});
 const [transitionsReady,setTransitionsReady]=useState(false);
 const [atmosphereSettings,setAtmosphereSettings]=useState<AtmosphereSettingsV885>({...DEFAULT_ATMOSPHERE_V885});
 const [atmosphereReady,setAtmosphereReady]=useState(false);
 const [fogSettingsV887,setFogSettingsV887]=useState<CinematicFogSettingsV887>({...DEFAULT_FOG_V887});
 const [fogReadyV887,setFogReadyV887]=useState(false);
 const [laserSettingsV888,setLaserSettingsV888]=useState<LaserShowSettingsV888>({...DEFAULT_LASER_SHOW_V888});
 const [laserReadyV888,setLaserReadyV888]=useState(false);
 const [particleSettingsV889,setParticleSettingsV889]=useState<ParticleSettingsV889>({...DEFAULT_PARTICLE_V889});
 const [particleReadyV889,setParticleReadyV889]=useState(false);
 const [spotlightSettingsV890,setSpotlightSettingsV890]=useState<SpotlightSettingsV890>({...DEFAULT_SPOTLIGHT_V890});
 const [spotlightReadyV890,setSpotlightReadyV890]=useState(false);
 const [pyroSettingsV891,setPyroSettingsV891]=useState<PyroSettingsV891>({...DEFAULT_PYRO_V891});
 const [pyroReadyV891,setPyroReadyV891]=useState(false);
 const [epicSettingsV892,setEpicSettingsV892]=useState<EpicDropSettingsV892>({...DEFAULT_EPIC_DROP_V892});
 const [epicReadyV892,setEpicReadyV892]=useState(false);
 const [arenaSettingsV893,setArenaSettingsV893]=useState<ArenaCrowdSettingsV893>({...DEFAULT_ARENA_CROWD_V893});
 const [arenaReadyV893,setArenaReadyV893]=useState(false);
 const [ultimateSettingsV900,setUltimateSettingsV900]=useState<UltimateSettingsV900>({...DEFAULT_ULTIMATE_V900});
 const [ultimateReadyV900,setUltimateReadyV900]=useState(false);
 const [danceShowSettingsV899,setDanceShowSettingsV899]=useState<DanceShowSettingsV899>({...DEFAULT_DANCE_SHOW_V899});
 const [choreographySettingsV993,setChoreographySettingsV993]=useState<ChoreographySettingsV993>({...DEFAULT_CHOREOGRAPHY_V993});
 const [choreographyReadyV993,setChoreographyReadyV993]=useState(false);
 const [vocalSettingsV994,setVocalSettingsV994]=useState<VocalSettingsV994>({...DEFAULT_VOCAL_V994});
 const [vocalReadyV994,setVocalReadyV994]=useState(false);
 const [duetSettingsV995,setDuetSettingsV995]=useState<DuetSettingsV995>({...DEFAULT_DUET_V995});
 const [duetReadyV995,setDuetReadyV995]=useState(false);
 const [crowdSettingsV996,setCrowdSettingsV996]=useState<CrowdExperienceSettingsV996>({...DEFAULT_CROWD_EXPERIENCE_V996});
 const [crowdReadyV996,setCrowdReadyV996]=useState(false);
 const [flowSettingsV997,setFlowSettingsV997]=useState<FlowSettingsV997>({...DEFAULT_FLOW_V997});
 const [flowReadyV997,setFlowReadyV997]=useState(false);
 const [flowHandoverV997,setFlowHandoverV997]=useState<FlowHandoverV997|null>(null);
 const flowStateV997=useRef(EMPTY_FLOW_V997);
 const [danceShowReadyV899,setDanceShowReadyV899]=useState(false);
 const [danceCameraSettingsV898,setDanceCameraSettingsV898]=useState<DanceCameraSettingsV898>({...DEFAULT_DANCE_CAMERA_V898});
 const [danceCameraReadyV898,setDanceCameraReadyV898]=useState(false);
 const [cameraSettingsV897,setCameraSettingsV897]=useState<CinematicCameraSettingsV897>({...DEFAULT_CAMERA_V897});
 const [cameraReadyV897,setCameraReadyV897]=useState(false);
 const [cameraSettingsV992,setCameraSettingsV992]=useState<CinemaSettingsV992>({...DEFAULT_CINEMA_V992});
 const [cameraReadyV992,setCameraReadyV992]=useState(false);
 const [energySettingsV896,setEnergySettingsV896]=useState<EnergySettingsV896>({...DEFAULT_ENERGY_V896});
 const [energyReadyV896,setEnergyReadyV896]=useState(false);
 const [directorSettingsV895,setDirectorSettingsV895]=useState<DirectorSettingsV895>({...DEFAULT_DIRECTOR_V895});
 const [directorReadyV895,setDirectorReadyV895]=useState(false);
 const [genreStageSettingsV894,setGenreStageSettingsV894]=useState<GenreStageSettingsV894>({...DEFAULT_GENRE_STAGE_V894});
 const [genreStageReadyV894,setGenreStageReadyV894]=useState(false);
 const [transitionSeekBlock,setTransitionSeekBlock]=useState<{trackId:string;untilMs:number}>({trackId:'',untilMs:0});
 const [momentsReady,setMomentsReady]=useState(false);
 const [systemReduced,setSystemReduced]=useState(false);
 const [storageError,setStorageError]=useState(false);
 const [open,setOpen]=useState(false);
 const [timeline,setTimeline]=useState<ConcertTimelineSnapshotV763|null>(null);
 const [aiUndoV982,setAiUndoV982]=useState<null|{
  trackId:string;
  before:{atmosphere:AtmosphereSettingsV885;genreStage:GenreStageSettingsV894;fx:LiveFxSettingsV881};
  after:{atmosphere:AtmosphereSettingsV885;genreStage:GenreStageSettingsV894;fx:LiveFxSettingsV881};
 }>(null);
 const [liveUndoV998,setLiveUndoV998]=useState<null|{
  trackId:string;
  before:{atmosphere:AtmosphereSettingsV885;stage:GenreStageSettingsV894;
   camera:CinemaSettingsV992;fx:LiveFxSettingsV881};
  after:{atmosphere:AtmosphereSettingsV885;stage:GenreStageSettingsV894;
   camera:CinemaSettingsV992;fx:LiveFxSettingsV881};
 }>(null);
 const [trigger,setTrigger]=useState<LiveFxTriggerV881|null>(null);
 const nextTrigger=useRef(0);
 const priorPlayback=useRef<{trackId:string;progressMs:number}|null>(null);
 const triggerButton=useRef<HTMLButtonElement>(null);
 // System-level reduced-motion protection works independently of Sonic settings.
 useEffect(()=>{
  if(!window.matchMedia)return;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>setSystemReduced(media.matches);
  sync();media.addEventListener?.('change',sync);
  return()=>media.removeEventListener?.('change',sync);
 },[]);
 const motionOff=reducedMotion||systemReduced;
 // Never access browser storage or V763's mutable singleton during server rendering.
 useEffect(()=>{
  try {setSettings(normalizeLiveFxSettingsV881(JSON.parse(window.localStorage.getItem(LIVE_FX_KEY_V881)??'null')));}
  catch {setSettings({...DEFAULT_LIVE_FX_V881});}
  setStorageReady(true);
 },[]);
 useEffect(()=>{
  try {setSyncSettings(normalizeConcertSyncV882(JSON.parse(window.localStorage.getItem(CONCERT_SYNC_KEY_V882)??'null')));}
  catch {setSyncSettings({...DEFAULT_CONCERT_SYNC_V882});}
  setSyncReady(true);
 },[]);
 useEffect(()=>{
  try {setMomentSettings(normalizeConcertMomentsV883(JSON.parse(window.localStorage.getItem(CONCERT_MOMENTS_KEY_V883)??'null')));}
  catch {setMomentSettings({...DEFAULT_CONCERT_MOMENTS_V883});}
  setMomentsReady(true);
 },[]);
 useEffect(()=>{
  try {setTransitionSettings(normalizeCinematicTransitionsV884(JSON.parse(window.localStorage.getItem(CINEMATIC_TRANSITIONS_KEY_V884)??'null')));}
  catch {setTransitionSettings({...DEFAULT_CINEMATIC_TRANSITIONS_V884});}
  setTransitionsReady(true);
 },[]);
 useEffect(()=>{
  try{setAtmosphereSettings(normalizeAtmosphereV885(JSON.parse(window.localStorage.getItem(ATMOSPHERE_STORAGE_KEY_V885)??'null')));}
  catch{setAtmosphereSettings({...DEFAULT_ATMOSPHERE_V885});}
  setAtmosphereReady(true);
 },[]);
 useEffect(()=>{
  try{setFogSettingsV887(normalizeCinematicFogV887(JSON.parse(window.localStorage.getItem(FOG_STORAGE_KEY_V887)??'null')));}
  catch{setFogSettingsV887({...DEFAULT_FOG_V887});}
  setFogReadyV887(true);
 },[]);
 useEffect(()=>{
  try{setLaserSettingsV888(normalizeLaserShowV888(JSON.parse(window.localStorage.getItem(LASER_SHOW_KEY_V888)??'null')));}
  catch{setLaserSettingsV888({...DEFAULT_LASER_SHOW_V888});}
  setLaserReadyV888(true);
 },[]);
 useEffect(()=>{
  try{setParticleSettingsV889(normalizeParticleV889(JSON.parse(window.localStorage.getItem(PARTICLE_STORAGE_KEY_V889)??'null')));}
  catch{setParticleSettingsV889({...DEFAULT_PARTICLE_V889});}
  setParticleReadyV889(true);
 },[]);
 useEffect(()=>{
  try{setSpotlightSettingsV890(normalizeSpotlightV890(JSON.parse(window.localStorage.getItem(SPOTLIGHT_STORAGE_KEY_V890)??'null')));}
  catch{setSpotlightSettingsV890({...DEFAULT_SPOTLIGHT_V890});}
  setSpotlightReadyV890(true);
 },[]);
 useEffect(()=>{
  try{setPyroSettingsV891(normalizePyroV891(JSON.parse(window.localStorage.getItem(PYRO_STORAGE_KEY_V891)??'null')));}
  catch{setPyroSettingsV891({...DEFAULT_PYRO_V891});}
  setPyroReadyV891(true);
 },[]);
 useEffect(()=>{
  try{setEpicSettingsV892(normalizeEpicDropV892(JSON.parse(window.localStorage.getItem(EPIC_DROP_KEY_V892)??'null')));}
  catch{setEpicSettingsV892({...DEFAULT_EPIC_DROP_V892});}
  setEpicReadyV892(true);
 },[]);
 useEffect(()=>{
  try{setArenaSettingsV893(normalizeArenaCrowdV893(JSON.parse(window.localStorage.getItem(ARENA_CROWD_KEY_V893)??'null')));}
  catch{setArenaSettingsV893({...DEFAULT_ARENA_CROWD_V893});}
  setArenaReadyV893(true);
 },[]);
 useEffect(()=>{
  try{setUltimateSettingsV900(normalizeUltimateV900(JSON.parse(window.localStorage.getItem(ULTIMATE_KEY_V900)??'null')));}
  catch{setUltimateSettingsV900({...DEFAULT_ULTIMATE_V900});}
  setUltimateReadyV900(true);
 },[]);
 useEffect(()=>{
  if(!ultimateReadyV900)return;
  try{window.localStorage.setItem(ULTIMATE_KEY_V900,JSON.stringify(ultimateSettingsV900));}catch{setStorageError(true);}
 },[ultimateReadyV900,ultimateSettingsV900]);
 useEffect(()=>{
  try{setChoreographySettingsV993(normalizeChoreographyV993(JSON.parse(window.localStorage.getItem(CHOREOGRAPHY_KEY_V993)??'null')));}
  catch{setChoreographySettingsV993({...DEFAULT_CHOREOGRAPHY_V993});}
  setChoreographyReadyV993(true);
 },[]);
 useEffect(()=>{
  if(!choreographyReadyV993)return;
  try{window.localStorage.setItem(CHOREOGRAPHY_KEY_V993,JSON.stringify(choreographySettingsV993));}catch{setStorageError(true);}
 },[choreographyReadyV993,choreographySettingsV993]);
 useEffect(()=>{
  try{setVocalSettingsV994(normalizeVocalV994(JSON.parse(window.localStorage.getItem(VOCAL_KEY_V994)??'null')));}
  catch{setVocalSettingsV994({...DEFAULT_VOCAL_V994});}
  setVocalReadyV994(true);
 },[]);
 useEffect(()=>{
  if(!vocalReadyV994)return;
  try{window.localStorage.setItem(VOCAL_KEY_V994,JSON.stringify(vocalSettingsV994));}catch{setStorageError(true);}
 },[vocalReadyV994,vocalSettingsV994]);
 useEffect(()=>{
  try{setDuetSettingsV995(normalizeDuetV995(JSON.parse(window.localStorage.getItem(DUET_KEY_V995)??'null')));}
  catch{setDuetSettingsV995({...DEFAULT_DUET_V995});}
  setDuetReadyV995(true);
 },[]);
 useEffect(()=>{
  if(!duetReadyV995)return;
  try{window.localStorage.setItem(DUET_KEY_V995,JSON.stringify(duetSettingsV995));}catch{setStorageError(true);}
 },[duetReadyV995,duetSettingsV995]);
 useEffect(()=>{
  try{setCrowdSettingsV996(normalizeCrowdExperienceV996(JSON.parse(window.localStorage.getItem(CROWD_EXPERIENCE_KEY_V996)??'null')));}
  catch{setCrowdSettingsV996({...DEFAULT_CROWD_EXPERIENCE_V996});}
  setCrowdReadyV996(true);
 },[]);
 useEffect(()=>{
  if(!crowdReadyV996)return;
  try{window.localStorage.setItem(CROWD_EXPERIENCE_KEY_V996,JSON.stringify(crowdSettingsV996));}catch{setStorageError(true);}
 },[crowdReadyV996,crowdSettingsV996]);
 useEffect(()=>{
  try{setFlowSettingsV997(normalizeFlowV997(JSON.parse(window.localStorage.getItem(CONCERT_FLOW_KEY_V997)??'null')));}
  catch{setFlowSettingsV997({...DEFAULT_FLOW_V997});}
  setFlowReadyV997(true);
 },[]);
 useEffect(()=>{
  if(!flowReadyV997)return;
  try{window.localStorage.setItem(CONCERT_FLOW_KEY_V997,JSON.stringify(flowSettingsV997));}catch{setStorageError(true);}
 },[flowReadyV997,flowSettingsV997]);
 // Observed Spotify snapshots, not a synthetic playlist or speculative next track.
 useEffect(()=>{
  if(!flowReadyV997)return;
  const updated=advanceFlowV997(flowStateV997.current,{trackId,positionMs:progressMs,
   durationMs,atMs:Date.now(),playing,autoEnabled:settings.enabled&&settings.auto,
   reducedMotion:motionOff,manualOverride:!!trigger,
   lyricsProtected,settings:flowSettingsV997});
  flowStateV997.current=updated;
  setFlowHandoverV997(old=>old===updated.handover?old:updated.handover);
 },[flowReadyV997,trackId,durationMs,progressMs,playing,settings.enabled,settings.auto,
   motionOff,trigger,lyricsProtected,flowSettingsV997]);
 useEffect(()=>{
  try{setDanceShowSettingsV899(normalizeDanceShowV899(JSON.parse(window.localStorage.getItem(DANCE_SHOW_KEY_V899)??'null')));}
  catch{setDanceShowSettingsV899({...DEFAULT_DANCE_SHOW_V899});}
  setDanceShowReadyV899(true);
 },[]);
 useEffect(()=>{
  if(!danceShowReadyV899)return;
  try{window.localStorage.setItem(DANCE_SHOW_KEY_V899,JSON.stringify(danceShowSettingsV899));}catch{}
 },[danceShowSettingsV899,danceShowReadyV899]);
 useEffect(()=>{
  try{setDanceCameraSettingsV898(normalizeDanceCameraV898(JSON.parse(window.localStorage.getItem(DANCE_CAMERA_KEY_V898)??'null')));}
  catch{setDanceCameraSettingsV898({...DEFAULT_DANCE_CAMERA_V898});}
  setDanceCameraReadyV898(true);
 },[]);
 useEffect(()=>{
  if(!danceCameraReadyV898)return;
  try{window.localStorage.setItem(DANCE_CAMERA_KEY_V898,JSON.stringify(danceCameraSettingsV898));}catch{}
 },[danceCameraSettingsV898,danceCameraReadyV898]);
 useEffect(()=>{
  try{setCameraSettingsV897(normalizeCinematicCameraV897(JSON.parse(window.localStorage.getItem(CAMERA_KEY_V897)??'null')));}
  catch{setCameraSettingsV897({...DEFAULT_CAMERA_V897});}
  setCameraReadyV897(true);
 },[]);
 useEffect(()=>{
  try{setCameraSettingsV992(normalizeCinemaV992(JSON.parse(window.localStorage.getItem(CINEMA_KEY_V992)??'null')));}
  catch{setCameraSettingsV992({...DEFAULT_CINEMA_V992});}
  setCameraReadyV992(true);
 },[]);
 useEffect(()=>{
  if(!cameraReadyV992)return;
  try{window.localStorage.setItem(CINEMA_KEY_V992,JSON.stringify(cameraSettingsV992));}catch{setStorageError(true);}
 },[cameraSettingsV992,cameraReadyV992]);
 useEffect(()=>{
  if(!cameraReadyV897)return;
  try{window.localStorage.setItem(CAMERA_KEY_V897,JSON.stringify(cameraSettingsV897));}catch{}
 },[cameraSettingsV897,cameraReadyV897]);
 useEffect(()=>{
  try{setEnergySettingsV896(normalizeEnergyV896(JSON.parse(window.localStorage.getItem(ENERGY_KEY_V896)??'null')));}
  catch{setEnergySettingsV896({...DEFAULT_ENERGY_V896});}
  setEnergyReadyV896(true);
 },[]);
 useEffect(()=>{
  if(!energyReadyV896)return;
  try{window.localStorage.setItem(ENERGY_KEY_V896,JSON.stringify(energySettingsV896));}
  catch{setStorageError(true);}
 },[energySettingsV896,energyReadyV896]);
 useEffect(()=>{
  try{setDirectorSettingsV895(normalizeDirectorV895(JSON.parse(window.localStorage.getItem(DIRECTOR_KEY_V895)??'null')));}
  catch{setDirectorSettingsV895({...DEFAULT_DIRECTOR_V895});}
  setDirectorReadyV895(true);
  try{setGenreStageSettingsV894(normalizeGenreStageV894(JSON.parse(window.localStorage.getItem(GENRE_STAGE_KEY_V894)??'null')));}
  catch{setGenreStageSettingsV894({...DEFAULT_GENRE_STAGE_V894});}
  setGenreStageReadyV894(true);
 },[]);
 useEffect(()=>{
  if(!directorReadyV895)return;
  try{window.localStorage.setItem(DIRECTOR_KEY_V895,JSON.stringify(directorSettingsV895));}
  catch{/* private browsing or quota */}
 },[directorSettingsV895,directorReadyV895]);
 useEffect(()=>{
  if(!genreStageReadyV894)return;
  try{window.localStorage.setItem(GENRE_STAGE_KEY_V894,JSON.stringify(genreStageSettingsV894));}
  catch{setStorageError(true);}
 },[genreStageSettingsV894,genreStageReadyV894]);
 useEffect(()=>{
  if(!arenaReadyV893)return;
  try{window.localStorage.setItem(ARENA_CROWD_KEY_V893,JSON.stringify(arenaSettingsV893));}
  catch{setStorageError(true);}
 },[arenaSettingsV893,arenaReadyV893]);
 useEffect(()=>{
  if(!epicReadyV892)return;
  try{window.localStorage.setItem(EPIC_DROP_KEY_V892,JSON.stringify(epicSettingsV892));}
  catch{setStorageError(true);}
 },[epicSettingsV892,epicReadyV892]);
 useEffect(()=>{
  if(!pyroReadyV891)return;
  try{window.localStorage.setItem(PYRO_STORAGE_KEY_V891,JSON.stringify(pyroSettingsV891));}
  catch{setStorageError(true);}
 },[pyroSettingsV891,pyroReadyV891]);
 useEffect(()=>{
  if(!spotlightReadyV890)return;
  try{window.localStorage.setItem(SPOTLIGHT_STORAGE_KEY_V890,JSON.stringify(spotlightSettingsV890));}
  catch{setStorageError(true);}
 },[spotlightSettingsV890,spotlightReadyV890]);
 useEffect(()=>{
  if(!particleReadyV889)return;
  try{window.localStorage.setItem(PARTICLE_STORAGE_KEY_V889,JSON.stringify(particleSettingsV889));}
  catch{setStorageError(true);}
 },[particleSettingsV889,particleReadyV889]);
 useEffect(()=>{
  if(!laserReadyV888)return;
  try{window.localStorage.setItem(LASER_SHOW_KEY_V888,JSON.stringify(laserSettingsV888));}
  catch{setStorageError(true);}
 },[laserSettingsV888,laserReadyV888]);
 useEffect(()=>{
  if(!fogReadyV887)return;
  try{window.localStorage.setItem(FOG_STORAGE_KEY_V887,JSON.stringify(fogSettingsV887));}
  catch{setStorageError(true);}
 },[fogSettingsV887,fogReadyV887]);
 useEffect(()=>{
  if(!atmosphereReady)return;
  try{window.localStorage.setItem(ATMOSPHERE_STORAGE_KEY_V885,JSON.stringify(atmosphereSettings));}
  catch{setStorageError(true);}
 },[atmosphereSettings,atmosphereReady]);
 useEffect(()=>{
  if(!transitionsReady)return;
  try {window.localStorage.setItem(CINEMATIC_TRANSITIONS_KEY_V884,JSON.stringify(transitionSettings));}
  catch {setStorageError(true);}
 },[transitionSettings,transitionsReady]);
 useEffect(()=>{
  if(!momentsReady)return;
  try {window.localStorage.setItem(CONCERT_MOMENTS_KEY_V883,JSON.stringify(momentSettings));}
  catch {setStorageError(true);}
 },[momentSettings,momentsReady]);
 useEffect(()=>{
  if(!syncReady)return;
  try {window.localStorage.setItem(CONCERT_SYNC_KEY_V882,JSON.stringify(syncSettings));}
  catch {setStorageError(true);}
 },[syncSettings,syncReady]);
 useEffect(()=>{
  if(!storageReady)return;
  try {window.localStorage.setItem(LIVE_FX_KEY_V881,JSON.stringify(settings));setStorageError(false);}
  catch {setStorageError(true);}
 },[settings,storageReady]);
 useEffect(()=>{
  const sync=()=>{
   const snap=getConcertTimelineV763();
   setTimeline(previous=>{
    if(!snap||snap.trackId!==trackId)return null;
    // Scene coordinates seldom change; no UI update for every playback tick.
    if(previous&&previous.trackId===snap.trackId&&previous.durationMs===snap.durationMs&&
      previous.source===snap.source&&previous.scenes.length===snap.scenes.length&&
      previous.scenes.every((x,i)=>{
       const y=snap.scenes[i];return !!y&&x.startMs===y.startMs&&x.endMs===y.endMs&&
        x.section===y.section&&x.intent===y.intent;
      }))return previous;
    return snap;
   });
  };
  sync();window.addEventListener(CONCERT_TIMELINE_EVENT_V763,sync);
  return()=>window.removeEventListener(CONCERT_TIMELINE_EVENT_V763,sync);
 },[trackId]);
 useEffect(()=>{setTrigger(null);setOpen(false);setAiUndoV982(null);setLiveUndoV998(null);},[trackId]);
 useEffect(()=>{
  const current={trackId,progressMs};
  if(resetManualLiveFxOnSeekV881(priorPlayback.current,current)){
   setTrigger(null);
   setTransitionSeekBlock({trackId,untilMs:Math.max(0,progressMs)+2500});
  }
  priorPlayback.current=current;
 },[trackId,progressMs]);
 useEffect(()=>{if(!settings.enabled||motionOff)setTrigger(null);},[settings.enabled,motionOff]);
 useEffect(()=>{
  if(!open)return;
  const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);triggerButton.current?.focus();}};
  document.addEventListener('keydown',onKey);
  return()=>document.removeEventListener('keydown',onKey);
 },[open]);
 const cue=planLiveFxCueV881({settings,trackId,genre,durationMs,progressMs,
  playing,reducedMotion:motionOff,timeline,trigger});
 const scenes=useMemo(()=>verifiedLiveFxScenesV881(timeline,trackId,durationMs),[timeline,trackId,durationMs]);
 const style=resolveLiveFxStyleV881(settings.style,genre);
 const momentPlan=useMemo(()=>buildConcertMomentsV883({timeline,trackId,durationMs}),[timeline,trackId,durationMs]);
 const epicPlanV892=useMemo(()=>buildEpicDropPlanV892(momentPlan),[momentPlan]);
 const transitionPlan=useMemo(()=>buildCinematicTransitionsV884({timeline,trackId,durationMs}),[timeline,trackId,durationMs]);
 const atmospherePlan=useMemo(()=>buildAtmospherePlanV885({timeline,trackId,durationMs,genre,
   settings:atmosphereSettings,liveFxStyle:settings.style}),
   [timeline,trackId,durationMs,genre,atmosphereSettings,settings.style]);
 const arenaPlanV893=useMemo(()=>buildArenaCrowdPlanV893(atmospherePlan),[atmospherePlan]);
 const genreStagePlanV894=useMemo(()=>buildGenreStagePlanV894(atmospherePlan),[atmospherePlan]);
 const directorPlanV895=useMemo(()=>buildDirectorPlanV895(atmospherePlan),[atmospherePlan]);
 const ultimatePlanV900=useMemo(()=>buildUltimatePlanV900(directorPlanV895),[directorPlanV895]);
 const ultimateCueV900=sampleUltimateV900({plan:ultimatePlanV900,settings:ultimateSettingsV900,
  trackId,durationMs,positionMs:progressMs,playing,autoEnabled:settings.enabled&&settings.auto,
  directorEnabled:directorSettingsV895.enabled,reducedMotion:motionOff,tier:'balanced',
  seekBlocked:transitionSeekBlock.trackId===trackId&&progressMs<transitionSeekBlock.untilMs,manualFx:!!cue.manual});
 const energyLiveV896=readEnergyV896(trackId,durationMs,progressMs);
 const directorCueV895=sampleDirectorV895({plan:directorPlanV895,settings:directorSettingsV895,
  trackId,durationMs,positionMs:progressMs,playing,autoEnabled:settings.enabled&&settings.auto,
  reducedMotion:motionOff,tier:'balanced',
  seekBlocked:transitionSeekBlock.trackId===trackId&&progressMs<transitionSeekBlock.untilMs,
  manualFx:!!cue.manual});
 const transitionCue=sampleCinematicTransitionV884({plan:transitionPlan,trackId,durationMs,
  positionMs:progressMs,playing,reducedMotion:motionOff,settings:transitionSettings,
  autoEnabled:settings.enabled&&settings.auto,seekBlocked:transitionSeekBlock.trackId===trackId&&
   progressMs<transitionSeekBlock.untilMs,manualFx:!!cue.manual});
 const fogPreviewV887=previewFogV887(genre,fogSettingsV887.mood);
 const atmospherePreview=previewAtmospherePaletteV885(
  resolveAtmospherePaletteV885(atmosphereSettings.palette,genre,settings.style));
 const atmosphereCue=sampleAtmosphereV885({plan:atmospherePlan,settings:atmosphereSettings,
  trackId,durationMs,positionMs:progressMs,playing,reducedMotion:motionOff,
  autoEnabled:settings.enabled&&settings.auto,seekBlocked:transitionSeekBlock.trackId===trackId&&
   progressMs<transitionSeekBlock.untilMs,manualFx:!!cue.manual});
 const epicCueV892=sampleEpicDropV892({plan:epicPlanV892,settings:epicSettingsV892,trackId,durationMs,
  positionMs:progressMs,playing,autoEnabled:settings.enabled&&settings.auto&&momentSettings.enabled,
  reducedMotion:motionOff,tier:'high',seekBlocked:transitionSeekBlock.trackId===trackId&&progressMs<transitionSeekBlock.untilMs,
  manualFx:!!cue.manual});
 const momentCue=planConcertMomentV883({plan:momentPlan,trackId,durationMs,positionMs:progressMs,
  playing,reducedMotion:motionOff,settings:momentSettings,autoEnabled:settings.auto&&settings.enabled});
 useEffect(()=>{
  // Reuse V881's verified scene and manual trigger. No duplicate music analysis.
  // The R3F stage samples against its own song-scoped playback clock.
  if(!storageReady||!syncReady||!momentsReady||!transitionsReady||!atmosphereReady||!fogReadyV887||!laserReadyV888||!particleReadyV889||!spotlightReadyV890||!pyroReadyV891||!epicReadyV892||!arenaReadyV893||!genreStageReadyV894||!directorReadyV895||!energyReadyV896||!cameraReadyV897||!cameraReadyV992||!danceCameraReadyV898||!danceShowReadyV899||!choreographyReadyV993||!vocalReadyV994||!duetReadyV995||!crowdReadyV996||!flowReadyV997||!ultimateReadyV900)return;
  publishConcertStageSyncV882({trackId,durationMs,playing,reducedMotion:motionOff,
   enabled:settings.enabled,intensity:cue.intensity,sceneSource:cue.sceneSource,
   section:cue.section,look:cue.look,
   sceneStartMs:scenes[cue.sceneIndex]?.startMs??-1,
   manual:cue.manual,manualId:cue.manualId,
   manualStartMs:cue.manual&&trigger?.id===cue.manualId?trigger.startMs:-1,
   sync:syncSettings,
   momentKind:momentCue.kind,momentStartMs:momentCue.startMs,
   momentWeight:momentSettings.style==='festival'?1:momentSettings.style==='cinematic'?.60:.80,
   transitionPlan,transitionSettings:normalizeCinematicTransitionsV884({
    ...transitionSettings,enabled:transitionSettings.enabled&&settings.auto}),
   transitionSeekBlockedUntilMs:transitionSeekBlock.trackId===trackId?transitionSeekBlock.untilMs:0,
   fogSettingsV887:normalizeCinematicFogV887({...fogSettingsV887,enabled:fogSettingsV887.enabled&&settings.auto}),
   laserSettingsV888:normalizeLaserShowV888({...laserSettingsV888,enabled:laserSettingsV888.enabled&&settings.auto}),
   particleSettingsV889:normalizeParticleV889({...particleSettingsV889,enabled:particleSettingsV889.enabled&&settings.auto}),
   spotlightSettingsV890:normalizeSpotlightV890({...spotlightSettingsV890,enabled:spotlightSettingsV890.enabled&&settings.auto}),
   pyroSettingsV891:normalizePyroV891({...pyroSettingsV891,enabled:pyroSettingsV891.enabled&&settings.auto}),
   epicSettingsV892:normalizeEpicDropV892({...epicSettingsV892,enabled:epicSettingsV892.enabled&&settings.auto&&momentSettings.enabled}),
   epicPlanV892,
   arenaSettingsV893:normalizeArenaCrowdV893({...arenaSettingsV893,enabled:arenaSettingsV893.enabled&&settings.auto}),
   arenaPlanV893,
   genreStageSettingsV894:normalizeGenreStageV894({...genreStageSettingsV894,enabled:genreStageSettingsV894.enabled&&settings.auto}),
   genreStagePlanV894,
   directorSettingsV895:normalizeDirectorV895({...directorSettingsV895,enabled:directorSettingsV895.enabled&&settings.auto}),
   energySettingsV896:normalizeEnergyV896({...energySettingsV896,enabled:energySettingsV896.enabled&&settings.auto}),
   cameraSettingsV897:normalizeCinematicCameraV897({...cameraSettingsV897,enabled:cameraSettingsV897.enabled&&settings.auto}),
   cameraSettingsV992:normalizeCinemaV992({...cameraSettingsV992,enabled:cameraSettingsV992.enabled&&settings.auto}),
   danceCameraSettingsV898:normalizeDanceCameraV898({...danceCameraSettingsV898,enabled:danceCameraSettingsV898.enabled&&settings.auto}),
   danceShowSettingsV899:normalizeDanceShowV899({...danceShowSettingsV899,enabled:danceShowSettingsV899.enabled&&settings.auto}),
   choreographySettingsV993:normalizeChoreographyV993({...choreographySettingsV993,enabled:choreographySettingsV993.enabled&&settings.auto}),
   vocalSettingsV994:normalizeVocalV994({...vocalSettingsV994,enabled:vocalSettingsV994.enabled&&settings.auto}),
   duetSettingsV995:normalizeDuetV995({...duetSettingsV995,enabled:duetSettingsV995.enabled&&settings.auto}),
   crowdSettingsV996:normalizeCrowdExperienceV996({...crowdSettingsV996,enabled:crowdSettingsV996.enabled&&settings.auto}),
   flowCueV997:flowSettingsV997.enabled&&settings.auto&&!motionOff&&!trigger?flowHandoverV997:null,
   ultimateSettingsV900:normalizeUltimateV900({...ultimateSettingsV900,enabled:ultimateSettingsV900.enabled&&settings.auto}),
   ultimatePlanV900,
   directorPlanV895,
   atmospherePlan,atmosphereSettings:normalizeAtmosphereV885({...atmosphereSettings,
     enabled:atmosphereSettings.enabled&&settings.auto}),
   atmosphereSeekBlockedUntilMs:transitionSeekBlock.trackId===trackId?transitionSeekBlock.untilMs:0});
 },[storageReady,syncReady,momentsReady,transitionsReady,atmosphereReady,fogReadyV887,laserReadyV888,particleReadyV889,spotlightReadyV890,pyroReadyV891,epicReadyV892,arenaReadyV893,genreStageReadyV894,genreStageSettingsV894,genreStagePlanV894,directorReadyV895,directorSettingsV895,directorPlanV895,energyReadyV896,energySettingsV896,cameraReadyV897,cameraSettingsV897,cameraReadyV992,cameraSettingsV992,danceCameraReadyV898,danceCameraSettingsV898,danceShowReadyV899,danceShowSettingsV899,choreographyReadyV993,choreographySettingsV993,vocalReadyV994,vocalSettingsV994,duetReadyV995,duetSettingsV995,crowdReadyV996,crowdSettingsV996,flowReadyV997,flowSettingsV997,flowHandoverV997,ultimateReadyV900,ultimateSettingsV900,ultimatePlanV900,arenaSettingsV893,arenaPlanV893,epicSettingsV892,epicPlanV892,momentSettings.enabled,pyroSettingsV891,spotlightSettingsV890,particleSettingsV889,fogSettingsV887,laserSettingsV888,trackId,durationMs,playing,motionOff,settings.enabled,settings.auto,
  cue.intensity,cue.sceneSource,cue.section,cue.look,cue.sceneIndex,
  cue.manual,cue.manualId,scenes,trigger,syncSettings,
  momentCue.kind,momentCue.startMs,momentSettings.style,transitionPlan,transitionSettings,transitionSeekBlock,
  atmospherePlan,atmosphereSettings]);
 useEffect(()=>()=>publishConcertStageSyncV882(null),[]);

 /** Only explicit, previewed V902 patches are accepted. A stale before-value
  * cannot overwrite a later manual settings change. Never enable a disabled FX. */
 const applyAdvisorV902=useCallback((patch:AdvisorPatchV902)=>{
  const {target,field,before,value}=patch;
  if(target==='ultimate')setUltimateSettingsV900(s=>s.enabled&&
   (field==='protectLyrics'&&s.protectLyrics===before&&value===true
    ? true:field==='intensity'&&s.intensity===before&&typeof value==='number'&&value<=s.intensity)
   ?normalizeUltimateV900({...s,[field]:value}):s);
  if(target==='camera')setCameraSettingsV897(s=>s.enabled&&
   (field==='protectLyrics'&&s.protectLyrics===before&&value===true
    ? true:field==='intensity'&&s.intensity===before&&typeof value==='number'&&value<=s.intensity)
   ?normalizeCinematicCameraV897({...s,[field]:value}):s);
  if(target==='dance'&&field==='protectFootwork'&&value===true)
   setDanceShowSettingsV899(s=>s.enabled&&s.protectFootwork===before?normalizeDanceShowV899({...s,protectFootwork:true}):s);
  if(target==='laser'&&field==='intensity'&&typeof value==='number')
   setLaserSettingsV888(s=>s.enabled&&s.intensity===before&&value<=s.intensity?normalizeLaserShowV888({...s,intensity:value}):s);
  if(target==='particles'&&field==='intensity'&&typeof value==='number')
   setParticleSettingsV889(s=>s.enabled&&s.intensity===before&&value<=s.intensity?normalizeParticleV889({...s,intensity:value}):s);
  if(target==='spotlights'&&field==='intensity'&&typeof value==='number')
   setSpotlightSettingsV890(s=>s.enabled&&s.intensity===before&&value<=s.intensity?normalizeSpotlightV890({...s,intensity:value}):s);
 },[]);

 /** V903: explicit, exact-value rollback. Unlike V902's application path this
  * may increase an intensity or switch a protective flag OFF only when the
  * user separately confirms restoring the previously saved value. */
 const restoreAdvisorV903=useCallback((patch:AdvisorPatchV902)=>{
  const {target,field,before,value}=patch;
  const undo={target,field,before:value,value:before} as AdvisorPatchV902;
  if(!validReviewPatchV903(undo))return;
  if(target==='ultimate'&&(field==='intensity'||field==='protectLyrics'))setUltimateSettingsV900(s=>s.enabled&&s[field]===before?
   normalizeUltimateV900({...s,[field]:value}):s);
  if(target==='camera'&&(field==='intensity'||field==='protectLyrics'))setCameraSettingsV897(s=>s.enabled&&s[field]===before?
   normalizeCinematicCameraV897({...s,[field]:value}):s);
  if(target==='dance'&&field==='protectFootwork')setDanceShowSettingsV899(s=>s.enabled&&s.protectFootwork===before?
   normalizeDanceShowV899({...s,protectFootwork:value as boolean}):s);
  if(target==='laser'&&field==='intensity')setLaserSettingsV888(s=>s.enabled&&s.intensity===before?
   normalizeLaserShowV888({...s,intensity:value as number}):s);
  if(target==='particles'&&field==='intensity')setParticleSettingsV889(s=>s.enabled&&s.intensity===before?
   normalizeParticleV889({...s,intensity:value as number}):s);
  if(target==='spotlights'&&field==='intensity')setSpotlightSettingsV890(s=>s.enabled&&s.intensity===before?
   normalizeSpotlightV890({...s,intensity:value as number}):s);
 },[]);

 /** V982 approval applies only already-enabled virtual effects; no hardware or automatic re-enabling. */
 const applyImmersiveV982=(plan:ImmersivePlanV982)=>{
  if(!settings.auto||!settings.enabled||motionOff||!trackId)return;
  const atmosphere=atmosphereSettings.enabled?normalizeAtmosphereV885({...atmosphereSettings,
   palette:plan.palette,pace:plan.pace,intensity:plan.atmosphereIntensity}):atmosphereSettings;
  const genreStage=genreStageSettingsV894.enabled?normalizeGenreStageV894({...genreStageSettingsV894,
   look:plan.look,pace:plan.pace==='gentle'?'smooth':plan.pace==='festival'?'festival':'concert',
   intensity:plan.stageIntensity,protectLyrics:true}):genreStageSettingsV894;
  // FX budget can only be reduced, never escalated by an AI response.
  const fx=normalizeLiveFxSettingsV881({...settings,intensity:Math.min(settings.intensity,plan.fxIntensity)});
  setAiUndoV982({trackId,before:{atmosphere:atmosphereSettings,genreStage:genreStageSettingsV894,fx:settings},
   after:{atmosphere,genreStage,fx}});
  setAtmosphereSettings(atmosphere);setGenreStageSettingsV894(genreStage);setSettings(fx);
 };
 const undoImmersiveV982=():boolean=>{
  if(!aiUndoV982||aiUndoV982.trackId!==trackId||
   JSON.stringify(atmosphereSettings)!==JSON.stringify(aiUndoV982.after.atmosphere)||
   JSON.stringify(genreStageSettingsV894)!==JSON.stringify(aiUndoV982.after.genreStage)||
   JSON.stringify(settings)!==JSON.stringify(aiUndoV982.after.fx))return false;
  setAtmosphereSettings(aiUndoV982.before.atmosphere);
  setGenreStageSettingsV894(aiUndoV982.before.genreStage);
  setSettings(aiUndoV982.before.fx);
  setAiUndoV982(null);return true;
 };
 /** V998 – preview and commit share ONE safe interpreter. No physical lights or playback operations. */
 const snapshotLiveV998=():LiveSnapshotV998=>({
  atmosphere:{enabled:atmosphereSettings.enabled,palette:atmosphereSettings.palette,intensity:atmosphereSettings.intensity},
  stage:{enabled:genreStageSettingsV894.enabled,look:genreStageSettingsV894.look,intensity:genreStageSettingsV894.intensity},
  camera:{enabled:cameraSettingsV992.enabled,mode:cameraSettingsV992.mode,intensity:cameraSettingsV992.intensity},
  fx:{enabled:settings.enabled,auto:settings.auto,intensity:settings.intensity},
 });
 const previewLiveV998=(plan:LivePlanV998)=>
  resolveLiveChangesV998(plan,snapshotLiveV998())?.diffs??[];
 const applyLiveV998=(plan:LivePlanV998):boolean=>{
  if(!normalizeLivePlanV998(plan)||!trackId||!playing||motionOff||
   !settings.enabled||!settings.auto||!storageReady||!atmosphereReady||!genreStageReadyV894||
   !cameraReadyV992||!controlsVisible)return false;
  const result=resolveLiveChangesV998(plan,snapshotLiveV998());
  if(!result?.diffs.length)return false;
  const {after}=result;
  const next={
   atmosphere:normalizeAtmosphereV885({...atmosphereSettings,...after.atmosphere}),
   stage:normalizeGenreStageV894({...genreStageSettingsV894,...after.stage}),
   camera:normalizeCinemaV992({...cameraSettingsV992,...after.camera}),
   fx:normalizeLiveFxSettingsV881({...settings,...after.fx}),
  };
  setLiveUndoV998({trackId,before:{atmosphere:atmosphereSettings,stage:genreStageSettingsV894,
   camera:cameraSettingsV992,fx:settings},after:next});
  setAtmosphereSettings(next.atmosphere);setGenreStageSettingsV894(next.stage);
  setCameraSettingsV992(next.camera);setSettings(next.fx);
  return true;
 };
 const undoLiveV998=():boolean=>{
  const saved=liveUndoV998;
  if(!saved||saved.trackId!==trackId||
   JSON.stringify(atmosphereSettings)!==JSON.stringify(saved.after.atmosphere)||
   JSON.stringify(genreStageSettingsV894)!==JSON.stringify(saved.after.stage)||
   JSON.stringify(cameraSettingsV992)!==JSON.stringify(saved.after.camera)||
   JSON.stringify(settings)!==JSON.stringify(saved.after.fx))return false;
  setAtmosphereSettings(saved.before.atmosphere);setGenreStageSettingsV894(saved.before.stage);
  setCameraSettingsV992(saved.before.camera);setSettings(saved.before.fx);
  setLiveUndoV998(null);return true;
 };
 const update=useCallback((patch:Partial<LiveFxSettingsV881>)=>setSettings(s=>normalizeLiveFxSettingsV881({...s,...patch})),[]);
 const updateSync=useCallback((patch:Partial<ConcertSyncSettingsV882>)=>setSyncSettings(s=>normalizeConcertSyncV882({...s,...patch})),[]);
 const updateMoments=useCallback((patch:Partial<ConcertMomentsSettingsV883>)=>setMomentSettings(s=>normalizeConcertMomentsV883({...s,...patch})),[]);
 const updateUltimateV900=useCallback((patch:Partial<UltimateSettingsV900>)=>
  setUltimateSettingsV900(s=>normalizeUltimateV900({...s,...patch})),[]);
 const updateFlowV997=useCallback((patch:Partial<FlowSettingsV997>)=>
  setFlowSettingsV997(s=>normalizeFlowV997({...s,...patch})),[]);
 const updateCrowdV996=useCallback((patch:Partial<CrowdExperienceSettingsV996>)=>
  setCrowdSettingsV996(s=>normalizeCrowdExperienceV996({...s,...patch})),[]);
 const updateDuetV995=useCallback((patch:Partial<DuetSettingsV995>)=>
  setDuetSettingsV995(s=>normalizeDuetV995({...s,...patch})),[]);
 const updateVocalV994=useCallback((patch:Partial<VocalSettingsV994>)=>
  setVocalSettingsV994(s=>normalizeVocalV994({...s,...patch})),[]);
 const updateChoreographyV993=useCallback((patch:Partial<ChoreographySettingsV993>)=>
  setChoreographySettingsV993(s=>normalizeChoreographyV993({...s,...patch})),[]);
 const updateDanceShowV899=useCallback((patch:Partial<DanceShowSettingsV899>)=>
  setDanceShowSettingsV899(s=>normalizeDanceShowV899({...s,...patch})),[]);
 const updateDanceCameraV898=useCallback((patch:Partial<DanceCameraSettingsV898>)=>
  setDanceCameraSettingsV898(s=>normalizeDanceCameraV898({...s,...patch})),[]);
 const updateCameraV897=useCallback((patch:Partial<CinematicCameraSettingsV897>)=>
  setCameraSettingsV897(s=>normalizeCinematicCameraV897({...s,...patch})),[]);
 const updateCinemaV992=useCallback((patch:Partial<CinemaSettingsV992>)=>
  setCameraSettingsV992(s=>normalizeCinemaV992({...s,...patch})),[]);
 const updateEnergyV896=useCallback((patch:Partial<EnergySettingsV896>)=>
  setEnergySettingsV896(s=>normalizeEnergyV896({...s,...patch})),[]);
 const updateDirectorV895=useCallback((patch:Partial<DirectorSettingsV895>)=>
  setDirectorSettingsV895(s=>normalizeDirectorV895({...s,...patch})),[]);
 const updateGenreStageV894=useCallback((patch:Partial<GenreStageSettingsV894>)=>
  setGenreStageSettingsV894(s=>normalizeGenreStageV894({...s,...patch})),[]);
 const updateArenaV893=useCallback((patch:Partial<ArenaCrowdSettingsV893>)=>
  setArenaSettingsV893(s=>normalizeArenaCrowdV893({...s,...patch})),[]);
 const updateEpicV892=useCallback((patch:Partial<EpicDropSettingsV892>)=>
  setEpicSettingsV892(s=>normalizeEpicDropV892({...s,...patch})),[]);
 const updatePyroV891=useCallback((patch:Partial<PyroSettingsV891>)=>
  setPyroSettingsV891(s=>normalizePyroV891({...s,...patch})),[]);
 const updateSpotlightV890=useCallback((patch:Partial<SpotlightSettingsV890>)=>
  setSpotlightSettingsV890(s=>normalizeSpotlightV890({...s,...patch})),[]);
 const updateParticleV889=useCallback((patch:Partial<ParticleSettingsV889>)=>
  setParticleSettingsV889(s=>normalizeParticleV889({...s,...patch})),[]);
 const updateLaserV888=useCallback((patch:Partial<LaserShowSettingsV888>)=>
  setLaserSettingsV888(s=>normalizeLaserShowV888({...s,...patch})),[]);
 const updateFogV887=useCallback((patch:Partial<CinematicFogSettingsV887>)=>
  setFogSettingsV887(s=>normalizeCinematicFogV887({...s,...patch})),[]);
 const updateAtmosphere=useCallback((patch:Partial<AtmosphereSettingsV885>)=>
  setAtmosphereSettings(s=>normalizeAtmosphereV885({...s,...patch})),[]);
 const updateTransitions=useCallback((patch:Partial<CinematicTransitionSettingsV884>)=>setTransitionSettings(s=>normalizeCinematicTransitionsV884({...s,...patch})),[]);
 const fire=(kind:LiveFxManualV881)=>{
  if(!playing||motionOff||!settings.enabled||settings.intensity===0||!Number.isFinite(progressMs))return;
  nextTrigger.current+=1;
  setTrigger({id:nextTrigger.current,kind,startMs:Math.max(0,progressMs),trackId});
 };
 const exportSheet=()=>{
  const json=exportLiveFxSheetV881({trackId,durationMs,genre,timeline,settings});
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-live-fx-v881.json';
  document.body.append(anchor);anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportMoments=()=>{
  const json=exportConcertMomentsV883(momentPlan,momentSettings);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-concert-moments-v883.json';
  document.body.append(anchor);anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportUltimateV900Json=()=>{
  const json=exportUltimatePlanV900(ultimatePlanV900,ultimateSettingsV900);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-ultimate-concert-v900.json';
  document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportDanceShowV899Json=()=>{
  const json=exportDanceShowV899(directorPlanV895,danceShowSettingsV899);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-dance-show-v899.json';
  document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportDanceCameraV898Json=()=>{
  const json=exportDanceCameraV898(directorPlanV895,danceCameraSettingsV898);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-dance-camera-v898.json';
  a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportCameraV897Json=()=>{
  const json=exportCinematicCameraV897(directorPlanV895,cameraSettingsV897);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-cinematic-camera-v897.json';
  a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportEnergyV896Json=()=>{
  const json=exportEnergyV896(readEnergyV896(trackId,durationMs,progressMs),energySettingsV896);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-energy-snapshot-v896.json';
  document.body.append(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportDirectorV895Json=()=>{
  const json=exportDirectorV895(directorPlanV895,directorSettingsV895);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-ai-concert-director-v895.json';
  document.body.append(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const downloadGenreStageV894=()=>{
  const json=exportGenreStageV894(genreStagePlanV894,genreStageSettingsV894,genre);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-genre-stage-v894.json';
  document.body.append(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportArenaV893=()=>{
  const json=exportArenaCrowdV893(arenaPlanV893,arenaSettingsV893);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-arena-crowd-v893.json';
  a.click();URL.revokeObjectURL(url);
 };
 const exportEpicV892=()=>{
  const json=exportEpicDropPlanV892(epicPlanV892,epicSettingsV892);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-epic-drop-v892.json';
  document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportPyroV891=()=>{
  const json=exportPyroPlanV891(atmospherePlan,pyroSettingsV891,genre??'');
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-virtual-pyro-v891.json';
  document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportSpotlightV890=()=>{
  const json=exportSpotlightPlanV890(atmospherePlan,spotlightSettingsV890,genre??'');
  if(!json)return;
  const blob=new Blob([json],{type:'application/json'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='sonic-spotlight-show-v890.json';a.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),0);
 };
 const exportParticleV889=()=>{
  const json=exportParticlePlanV889(atmospherePlan,particleSettingsV889,genre);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-particle-director-v889.json';
  document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportLaserV888=()=>{
  const json=exportLaserShowV888(atmospherePlan,laserSettingsV888);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-laser-show-v888.json';
  document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportFogV887=()=>{
  const json=exportFogPlanV887(atmospherePlan,fogSettingsV887,genre);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-cinematic-fog-v887.json';
  document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportAtmosphere=()=>{
  const json=exportAtmospherePlanV885(atmospherePlan,atmosphereSettings);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-dynamic-atmosphere-v885.json';
  document.body.append(anchor);anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportTransitions=()=>{
  const json=exportCinematicTransitionsV884(transitionPlan,transitionSettings);
  if(!json)return;
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-cinematic-transitions-v884.json';
  document.body.append(anchor);anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const activeEffect=cue.manual?effectLabels[cue.manual]:momentCue.kind?momentCue.label:transitionCue.active?'Szenenübergang':cue.look!=='none'?cue.look.toUpperCase():'Bereit';
 const stopped=!settings.enabled||motionOff||!playing||settings.intensity===0;
 // V1001 and V1003 share one guarded write path to existing virtual controls.
 const touchContextV1001:TouchContextV1001={trackId,durationMs,playing,
  autoEnabled:settings.enabled&&settings.auto,
  verified:directorPlanV895.source==='verified-v604'&&directorPlanV895.scenes.length>0,
  reducedMotion:motionOff,manual:Boolean(cue.manual),
  seekBlocked:transitionSeekBlock.trackId===trackId&&progressMs<transitionSeekBlock.untilMs,
  controlsReady:controlsVisible&&storageReady&&atmosphereReady&&choreographyReadyV993&&cameraReadyV992};
 const touchValuesV1001:TouchValuesV1001={
  stage:{enabled:immersiveSettingsV1000.enabled,intensity:immersiveSettingsV1000.intensity},
  camera:{enabled:cameraSettingsV992.enabled,intensity:cameraSettingsV992.intensity},
  dance:{enabled:choreographySettingsV993.enabled,intensity:choreographySettingsV993.intensity},
  lights:{enabled:atmosphereSettings.enabled,intensity:atmosphereSettings.intensity},
 };
 const applyTouchValuesV1001=(next:TouchValuesV1001)=>{
  const prior=getImmersiveSettingsV1000();
  if(prior.enabled&&prior.intensity!==next.stage.intensity)
   setImmersiveSettingsV1000({...prior,intensity:next.stage.intensity});
  if(cameraSettingsV992.enabled&&cameraSettingsV992.intensity!==next.camera.intensity)
   updateCinemaV992({intensity:next.camera.intensity});
  if(choreographySettingsV993.enabled&&choreographySettingsV993.intensity!==next.dance.intensity)
   updateChoreographyV993({intensity:next.dance.intensity});
  if(atmosphereSettings.enabled&&atmosphereSettings.intensity!==next.lights.intensity)
   updateAtmosphere({intensity:next.lights.intensity});
 };
 return <>
  <div className={`live-fx-stage-v881 fx-v881-style-${style} ${motionOff?'fx-v881-static':''}`}
   data-v881-look={cue.look} data-v881-manual={cue.manual??'none'} data-v881-evidence={cue.sceneSource}
   style={{'--v881-power':cue.intensity} as CSSProperties} aria-hidden="true">
   {atmosphereCue.active&&atmosphereCue.overlayOpacity>0&&<div className="concert-atmosphere-wash-v885"
     style={{'--v885-primary':atmosphereCue.primary,'--v885-secondary':atmosphereCue.secondary,
      '--v885-opacity':atmosphereCue.overlayOpacity} as CSSProperties} />}
   {atmosphereCue.active&&atmosphereCue.hazeOpacity>0&&<div className="concert-atmosphere-haze-v885"
     style={{'--v885-primary':atmosphereCue.primary,'--v885-haze-opacity':atmosphereCue.hazeOpacity} as CSSProperties}/>}
   {cue.look!=='none'&&<div className={`live-fx-wash-v881 look-${cue.look}`} />}
   {transitionCue.active&&transitionCue.visualOpacity>0&&<div className={`concert-transition-wash-v884 is-${transitionCue.kind}`}
    style={{'--transition-opacity-v884':transitionCue.visualOpacity} as CSSProperties} />}
   {(cue.look==='neon'||cue.look==='arena')&&<div className="live-fx-horizon-v881" />}
   {cue.look==='arena'&&<div className="live-fx-beams-v881"><i/><i/><i/></div>}
   {cue.manual==='shockwave'&&<div key={`wave-${cue.manualId}`} className="live-fx-shockwave-v881"/>}
   {cue.manual==='sweep'&&<div key={`sweep-${cue.manualId}`} className="live-fx-sweep-v881"><i/><i/><i/></div>}
   {cue.manual==='confetti'&&<div key={`confetti-${cue.manualId}`} className="live-fx-confetti-v881">
    {sparks.map(i=><i key={i} style={{'--v881-i':i,'--v881-x':`${(i*37)%100}%`,'--v881-delay':`${i*97}ms`} as CSSProperties}/>)}
   </div>}
  </div>
  {settings.enabled&&momentSettings.showOverlay&&momentCue.kind&&momentCue.power>0&&
   <div className={`concert-moment-banner-v883 is-${momentCue.kind}`} aria-hidden="true"
    style={{'--moment-power-v883':momentCue.power} as CSSProperties}>
    <span>{momentIcons[momentCue.kind]}</span><strong>{momentCue.label}</strong>
    <small>INTELLIGENT SHOW DIRECTOR</small>
   </div>}
  {controlsVisible&&<aside className={`live-fx-dock-v881 ${open?'is-open':''}`} data-v881-deck={open?'open':'closed'} aria-label="Live FX Deck V881">
   <button ref={triggerButton} type="button" className="live-fx-toggle-v881" aria-expanded={open}
    aria-controls="live-fx-controls-v881" onClick={()=>setOpen(v=>!v)}>
    <span aria-hidden="true">✦</span> LIVE FX <small>{cue.active?activeEffect:stopped?'Pausiert':'Bereit'}</small>
   </button>
   {open&&<div id="live-fx-controls-v881" className="live-fx-panel-v881" role="region" aria-label="Live FX Steuerung">
    <header><div><strong>LIVE FX DECK</strong><small>V891 · Virtual Pyrotechnics</small></div>
     <button className="live-fx-close-v881" type="button" aria-label="Live FX schließen" onClick={()=>{setOpen(false);triggerButton.current?.focus();}}>×</button></header>
    <div className="live-fx-status-v881"><span className={cue.active?'is-live':''}/>
     <div><strong>{!playing?'Wiedergabe pausiert':motionOff?'Reduzierte Bewegung aktiv':
       cue.sceneSource==='verified'?`Regie: ${sceneLabels[cue.section]??cue.section}`:'Manuelle Effekte verfügbar'}</strong>
      <small>{cue.sceneSource==='verified'?'Abschnitt aus vorhandener V763-Timeline':'Keine verifizierte Szenen-Timeline – Automatik bleibt aus'}</small>
     </div></div>
    <div className="live-fx-manual-v881">
     <span className="live-fx-eyebrow-v881">LIVE AUSLÖSEN</span>
     <div className="live-fx-buttons-v881">
      <button type="button" disabled={stopped} onClick={()=>fire('shockwave')}><b aria-hidden="true">◎</b>Bass-Welle</button>
      <button type="button" disabled={stopped} onClick={()=>fire('sweep')}><b aria-hidden="true">╱╲</b>Arena Sweep</button>
      <button type="button" disabled={stopped} onClick={()=>fire('confetti')}><b aria-hidden="true">✧</b>Konfetti</button>
     </div>
     {cue.manual&&<div className="live-fx-manual-progress-v881" role="status">{effectLabels[cue.manual]} aktiv
      <span><i style={{width:`${100*(1-cue.manualProgress)}%`}}/></span></div>}
    </div>
    <InteractiveConcertControlV1001 key={`v1001-${trackId}`}
     context={touchContextV1001} current={touchValuesV1001} onChange={applyTouchValuesV1001}/>
    <AutoImprovementDirectorV1003 key={`v1003-${trackId}`}
     context={touchContextV1001} current={touchValuesV1001}
     onChange={applyTouchValuesV1001} progressMs={progressMs}/>
    <LiveConcertAssistantV998 key={`v998-${trackId}`} trackId={trackId} genre={genre}
     onPreview={previewLiveV998} onApply={applyLiveV998} onUndo={undoLiveV998}
     undoAvailable={Boolean(liveUndoV998&&liveUndoV998.trackId===trackId)}
     canApply={Boolean(trackId)&&playing&&!motionOff&&settings.enabled&&settings.auto&&
      storageReady&&atmosphereReady&&genreStageReadyV894&&cameraReadyV992&&controlsVisible}/>
    <SongUnderstandingPanelV1018 trackId={trackId} durationMs={durationMs}
     positionMs={progressMs} playing={playing} genre={genre}/>
    <PredictiveConcertPanelV1019 trackId={trackId} durationMs={durationMs}
     positionMs={progressMs} playing={playing} genre={genre}
     enabled={settings.enabled&&settings.auto} manualOverride={Boolean(cue.manual)}
     reducedMotion={motionOff} seekBlocked={transitionSeekBlock.trackId===trackId&&progressMs<transitionSeekBlock.untilMs}/>
    <ConcertStorytellingPanelV1020 trackId={trackId} durationMs={durationMs}
     positionMs={progressMs} playing={playing} genre={genre}
     enabled={settings.enabled&&settings.auto} manualOverride={Boolean(cue.manual)}
     reducedMotion={motionOff} seekBlocked={transitionSeekBlock.trackId===trackId&&progressMs<transitionSeekBlock.untilMs}/>
    <SongIntelligencePanelV983 key={trackId} trackId={trackId} title={title} artist={artist}
     durationMs={durationMs} genre={genre} onApply={applyImmersiveV982}
     canApply={settings.enabled&&settings.auto&&!motionOff}/>
    <ImmersiveAiDirectorV982 trackId={trackId} genre={genre} onApply={applyImmersiveV982}
     onUndo={undoImmersiveV982} undoAvailable={Boolean(aiUndoV982)}
     canApply={settings.enabled&&settings.auto&&!motionOff}/>
    <div className="live-fx-options-v881">
     <label className="live-fx-check-v881"><input type="checkbox" checked={settings.enabled} onChange={(e:{target:{checked:boolean}})=>update({enabled:e.target.checked})}/>Live FX aktiv</label>
     <label className="live-fx-check-v881"><input type="checkbox" checked={settings.auto} onChange={(e:{target:{checked:boolean}})=>update({auto:e.target.checked})}/>Automatik aus Regie-Timeline</label>
     <label className="live-fx-check-v881"><input type="checkbox" checked={settings.showHud} onChange={(e:{target:{checked:boolean}})=>update({showHud:e.target.checked})}/>Mini-Timeline anzeigen</label>
     <fieldset className="concert-moment-options-v883" aria-label="Intelligente Konzert-Momente">
      <legend>V883 · Intelligent Concert Moments</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={momentSettings.enabled} onChange={(e:{target:{checked:boolean}})=>updateMoments({enabled:e.target.checked})}/>Automatische Show-Highlights</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={momentSettings.showOverlay} onChange={(e:{target:{checked:boolean}})=>updateMoments({showOverlay:e.target.checked})}/>Moment-Einblendung</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={momentSettings.showCountdown} onChange={(e:{target:{checked:boolean}})=>updateMoments({showCountdown:e.target.checked})}/>Nächsten Höhepunkt ankündigen</label>
      <label className="live-fx-style-v881">Dramaturgie <select value={momentSettings.style} onChange={(e:{target:{value:string}})=>updateMoments({style:e.target.value as ConcertMomentsSettingsV883['style']})}>
       <option value="balanced">Ausgewogen</option><option value="cinematic">Cinematic · dezent</option>
       <option value="festival">Festival · energischer</option>
      </select></label>
      <small>Max. sechs Highlights pro Song · min. 18,5 s Abstand · nur verifizierte Regie-Szenen.</small>
     </fieldset>
     <fieldset className="concert-genre-stage-v894" aria-label="Ultimate Genre Stage">
      <legend>V894 · Ultimate Genre Stage</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={genreStageSettingsV894.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateGenreStageV894({enabled:e.target.checked})}/>Genre-Bühnenarchitektur aktivieren</label>
      <label className="live-fx-style-v881">Bühnenwelt <select value={genreStageSettingsV894.look}
       onChange={(e:{target:{value:string}})=>updateGenreStageV894({look:e.target.value as GenreStageSettingsV894['look']})}>
       <option value="auto">Automatisch · Musikgenre</option>
       <option value="noir">Deutschrap · Noir Skyline</option>
       <option value="reactor">Hardtekk · Reactor Grid</option>
       <option value="rock-arena">Deutschrock · Arena Truss</option>
       <option value="prism">Pop · Prism Stage</option>
      </select></label>
      <label className="live-fx-style-v881">Szenenübergang <select value={genreStageSettingsV894.pace}
       onChange={(e:{target:{value:string}})=>updateGenreStageV894({pace:e.target.value as GenreStageSettingsV894['pace']})}>
       <option value="smooth">Sanft</option><option value="concert">Cinematic Concert</option><option value="festival">Festival</option>
      </select></label>
      <label className="live-fx-range-v881">Bühnenintensität <strong>{genreStageSettingsV894.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={genreStageSettingsV894.intensity}
        onChange={(e:{target:{value:string}})=>updateGenreStageV894({intensity:Number(e.target.value)})}/></label>
      <div className="concert-particle-toggles-v889">{([['architecture','Bühnenarchitektur'],['lightTint','Lichtfarben'],['protectLyrics','Lyrics schützen']] as const).map(([key,label])=><label key={key} className="live-fx-check-v881">
       <input type="checkbox" checked={genreStageSettingsV894[key]}
        onChange={(e:{target:{checked:boolean}})=>updateGenreStageV894({[key]:e.target.checked})}/>{label}
      </label>)}</div>
      <div className="concert-genre-stage-preview-v894" aria-live="off">
       <span className="concert-genre-stage-colors-v894" style={{background:`linear-gradient(100deg,${GENRE_STAGE_LOOKS_V894[resolveGenreStageLookV894(genreStageSettingsV894.look,genre)].primary},${GENRE_STAGE_LOOKS_V894[resolveGenreStageLookV894(genreStageSettingsV894.look,genre)].secondary})`}} aria-hidden="true"/>
       <strong>{GENRE_STAGE_LOOKS_V894[resolveGenreStageLookV894(genreStageSettingsV894.look,genre)].label}</strong>
       <small>{GENRE_STAGE_LOOKS_V894[resolveGenreStageLookV894(genreStageSettingsV894.look,genre)].description}</small>
      </div>
      <div className="concert-transition-status-v884" aria-live="off">
       {genreStagePlanV894.source==='verified-v604'?`${genreStagePlanV894.scenes.length} bestätigte Genre-Bühnenszenen`:
        'Wartet auf bestätigte Songabschnitte · keine erfundenen Drops'}
      </div>
      {genreStagePlanV894.scenes.length>0&&<>
       <button type="button" className="concert-transition-export-v884" onClick={downloadGenreStageV894}>Genre-Bühnenplan als JSON exportieren</button>
       <ol className="concert-atmosphere-scenes-v885">{genreStagePlanV894.scenes.slice(0,8).map(sc=><li key={sc.index}>
        <b>{fmt(sc.startMs)}</b> {sc.section} · {sc.name}
       </li>)}</ol>
      </>}
      <small>Zusätzliche virtuelle Deko hinter den Künstlern; deine gewählte Bühnenumgebung und manuell gespeicherte Lichtshows bleiben bestehen.
       Keine neuen Scheinwerfer, keine Strobe-Auslösung und keine echten Bühnenhardware-Befehle.</small>
     </fieldset>
     <fieldset className="concert-arena-crowd-v893" aria-label="Arena Crowd Atmosphere">
      <legend>V893 · Arena Crowd Atmosphere</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={arenaSettingsV893.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateArenaV893({enabled:e.target.checked})}/>Intelligente Publikumsatmosphäre aktivieren</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={arenaSettingsV893.protectLyrics}
       onChange={(e:{target:{checked:boolean}})=>updateArenaV893({protectLyrics:e.target.checked})}/>Lyrics und Künstler schützen</label>
      <label className="live-fx-style-v881">Publikumsstil <select value={arenaSettingsV893.style}
       onChange={(e:{target:{value:string}})=>updateArenaV893({style:e.target.value as ArenaCrowdSettingsV893['style']})}>
       <option value="auto">Automatisch · Genre</option><option value="cinematic">Cinematic · ruhig</option>
       <option value="balanced">Ausgewogen</option><option value="festival">Festival · lebendig</option>
      </select></label>
      <label className="live-fx-range-v881">Atmosphäre <strong>{arenaSettingsV893.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={arenaSettingsV893.intensity}
        onChange={(e:{target:{value:string}})=>updateArenaV893({intensity:Number(e.target.value)})}/></label>
      <div className="concert-particle-toggles-v889">{([['phones','Handylichter'],['waves','Publikumswellen'],['silhouettes','Silhouetten-Glow']] as const).map(([key,label])=><label key={key} className="live-fx-check-v881">
       <input type="checkbox" checked={arenaSettingsV893[key]}
        onChange={(e:{target:{checked:boolean}})=>updateArenaV893({[key]:e.target.checked})}/>{label}
      </label>)}</div>
      <div className="concert-transition-status-v884" aria-live="off">
       {arenaPlanV893.source==='verified-v604'?`${arenaPlanV893.scenes.length} bestätigte Publikumsszenen`:
        'Publikumsautomatik wartet auf bestätigte Songabschnitte'}
      </div>
      {arenaPlanV893.scenes.length>0&&<>
       <button type="button" className="concert-transition-export-v884" onClick={exportArenaV893}>Publikumsregie als JSON exportieren</button>
       <ol className="concert-atmosphere-scenes-v885">{arenaPlanV893.scenes.slice(0,8).map(sc=><li key={sc.index}>
        <b>{fmt(sc.startMs)}</b> {sc.section} · {sc.look}
       </li>)}</ol>
      </>}
      <small>Nutzt ausschließlich vorhandene virtuelle V815-Publikumsinstanzen. Die Regie aktiviert keine
       abgeschalteten Publikumseffekte, erzeugt keine zusätzlichen Lichtquellen und respektiert
       Blackouts, Kamerafokus, manuelle Steuerung, reduzierte Bewegung und Performance-Limits.
       Das virtuelle Publikum muss zusätzlich im Concert FX Studio aktiviert sein.</small>
     </fieldset>
     <fieldset className="concert-epic-options-v892" aria-label="Epic Drop Experience">
      <legend>V892 · Epic Drop Experience</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={epicSettingsV892.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateEpicV892({enabled:e.target.checked})}/>Gemeinsame Drop-Regie aktivieren</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={epicSettingsV892.protectLyrics}
       onChange={(e:{target:{checked:boolean}})=>updateEpicV892({protectLyrics:e.target.checked})}/>Lyrics und Sänger-Close-ups schützen</label>
      <label className="live-fx-style-v881">Show-Charakter <select value={epicSettingsV892.style}
       onChange={(e:{target:{value:string}})=>updateEpicV892({style:e.target.value as EpicDropSettingsV892['style']})}>
       <option value="cinematic">Cinematic · reduziert</option><option value="balanced">Ausgewogen</option>
       <option value="festival">Festival · energisch</option>
      </select></label>
      <label className="live-fx-range-v881">Drop-Intensität <strong>{epicSettingsV892.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={epicSettingsV892.intensity}
        onChange={(e:{target:{value:string}})=>updateEpicV892({intensity:Number(e.target.value)})}/></label>
      <div className="concert-particle-toggles-v889">{([['stage','Bass-Schockwelle'],['led','LED-Wall'],['laser','Laser'],['spotlight','Spotlights'],['pyro','Virtuelle Pyro'],['dance','Tänzer'],['camera','Kamera'] ] as const).map(([key,label])=><label key={key} className="live-fx-check-v881">
       <input type="checkbox" checked={epicSettingsV892[key]}
        onChange={(e:{target:{checked:boolean}})=>updateEpicV892({[key]:e.target.checked})}/>{label}
      </label>)}</div>
      <div className="concert-transition-status-v884" aria-live="off">
       {epicCueV892.active?`Aktuelle Phase: ${epicCueV892.phase==='impact'?'Impact':epicCueV892.phase==='drive'?'Drive':'Release'} · ${epicCueV892.label}`:
        `${epicPlanV892.beats.length} bestätigte Drops/Finales geplant`}
      </div>
      {epicPlanV892.beats.length>0&&<>
       <button type="button" className="concert-transition-export-v884" onClick={exportEpicV892}>Drop-Choreografie als JSON exportieren</button>
       <ol className="concert-atmosphere-scenes-v885">{epicPlanV892.beats.map(b=><li key={b.id}>
        <b>{fmt(b.startMs)}</b> {b.kind==='drop'?'DROP':'FINALE'} · Impact → Drive → Release
       </li>)}</ol>
      </>}
      <small>Nur bestätigte V883/V604-Szenen. Es werden ausschließlich bereits aktivierte Effekte moduliert.
       Kein Stroboskop, keine neue Kamera oder Hardwaresteuerung. Manuelle Einstellungen haben Vorrang.</small>
     </fieldset>
     <fieldset className="concert-pyro-options-v891" aria-label="Virtuelle Pyrotechnik">
      <legend>V891 · Virtual Pyrotechnics</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={pyroSettingsV891.enabled}
       onChange={(e:{target:{checked:boolean}})=>updatePyroV891({enabled:e.target.checked})}/>Virtuelle Pyro-Choreografie aktivieren (Standard: aus)</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={pyroSettingsV891.protectLyrics}
       onChange={(e:{target:{checked:boolean}})=>updatePyroV891({protectLyrics:e.target.checked})}/>Lyrics und Künstler-Close-ups schützen</label>
      <div className="concert-particle-toggles-v889">{(['flames','jets','sparks'] as const).map(kind=><label key={kind} className="live-fx-check-v881">
       <input type="checkbox" checked={pyroSettingsV891[kind]}
        onChange={(e:{target:{checked:boolean}})=>updatePyroV891({[kind]:e.target.checked})}/>
        {kind==='flames'?'Virtuelle Flammen':kind==='jets'?'CO₂-Jets':'Funkenfontänen'}
      </label>)}</div>
      <label className="live-fx-style-v881">Pyro-Effekt <select value={pyroSettingsV891.style}
       onChange={(e:{target:{value:string}})=>updatePyroV891({style:e.target.value as PyroSettingsV891['style']})}>
       <option value="auto">Automatisch nach Songabschnitt</option><option value="flames">Flammen</option>
       <option value="jets">CO₂-Jets</option><option value="sparks">Funkenfontänen</option>
      </select></label>
      <label className="live-fx-style-v881">Dramaturgie <select value={pyroSettingsV891.mode}
       onChange={(e:{target:{value:string}})=>updatePyroV891({mode:e.target.value as PyroSettingsV891['mode']})}>
       <option value="cinematic">Cinematic</option><option value="balanced">Ausgewogen</option><option value="festival">Festival</option>
      </select></label>
      <label className="live-fx-range-v881">Pyro-Intensität <strong>{pyroSettingsV891.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={pyroSettingsV891.intensity}
        onChange={(e:{target:{value:string}})=>updatePyroV891({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-summary-v884">
       {atmospherePlan.source==='verified-v604'?`${atmospherePlan.scenes.length} bestätigte Szenen`: 'Ohne bestätigte Songabschnitte bleibt virtuelle Pyro deaktiviert'}
      </div>
      {atmospherePlan.source==='verified-v604'&&<>
       <button type="button" className="concert-transition-export-v884" onClick={exportPyroV891}>Virtuellen Pyro-Plan als JSON exportieren</button>
       <ol className="concert-atmosphere-scenes-v885">{atmospherePlan.scenes.slice(0,6).map(sc=><li key={sc.index}>
        <b>{fmt(sc.startMs)}</b> {sc.section} · {pyroSettingsV891.style==='auto'?suggestedPyroV891(sc.section,genre??''):pyroSettingsV891.style}
       </li>)}</ol>
      </>}
      <small>Nur virtuelle 3D-Effekte – keine echte Pyrotechnik oder CO₂-Steuerung. Ausschließlich bei bestätigten Builds,
       Hooks, Drops und Finales. Manuelle FX-/Lichtregie, Blackouts, Reduced Motion und Gerätebudget haben Vorrang.
       Bestehende V844-CO₂-Effekte werden nicht verdoppelt.</small>
     </fieldset>
     <fieldset className="concert-spotlight-options-v890" aria-label="Professional Spotlight Show">
      <legend>V890 · Professional Spotlight Show</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={spotlightSettingsV890.enabled}
       onChange={(e:{target:{checked:boolean;value:string}})=>updateSpotlightV890({enabled:e.target.checked})}/>Professionelle Spotlight-Regie aktiv</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={spotlightSettingsV890.followArtists}
       onChange={(e:{target:{checked:boolean;value:string}})=>updateSpotlightV890({followArtists:e.target.checked})}/>Vorhandenen Künstler-Fokus berücksichtigen</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={spotlightSettingsV890.protectLyrics}
       onChange={(e:{target:{checked:boolean;value:string}})=>updateSpotlightV890({protectLyrics:e.target.checked})}/>Lyrics und Gesangs-Close-ups schützen</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={spotlightSettingsV890.softTransitions}
       onChange={(e:{target:{checked:boolean;value:string}})=>updateSpotlightV890({softTransitions:e.target.checked})}/>Weiche Lichtwechsel</label>
      <label className="live-fx-style-v881">Licht-Choreografie <select value={spotlightSettingsV890.style}
       onChange={(e:{target:{value:string}})=>updateSpotlightV890({style:e.target.value as SpotlightSettingsV890['style']})}>
       <option value="auto">Automatisch nach Songabschnitt</option><option value="portrait">Portrait · ruhig</option>
       <option value="follow">Follow-Spot · Künstler</option><option value="fan">Lichtfächer · Hook</option>
       <option value="cross">Kreuzlicht · Build</option>
      </select></label>
      <label className="live-fx-style-v881">Genre-Look <select value={spotlightSettingsV890.mood}
       onChange={(e:{target:{value:string}})=>updateSpotlightV890({mood:e.target.value as SpotlightSettingsV890['mood']})}>
       <option value="auto">Automatisch</option><option value="noir">Noir · Deutschrap</option>
       <option value="electric">Electric · Hardtekk</option><option value="arena">Arena · Deutschrock</option>
       <option value="dream">Dream · Pop</option>
      </select></label>
      <label className="live-fx-range-v881">Spotlight-Dramaturgie <strong>{spotlightSettingsV890.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={spotlightSettingsV890.intensity}
        onChange={(e:{target:{checked:boolean;value:string}})=>updateSpotlightV890({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="off">
       {atmospherePlan.source==='verified-v604'?`${atmospherePlan.scenes.length} bestätigte Szenen · bestehende 3D-Spots werden choreografiert`:
        'Keine bestätigte Szenen-Timeline – bestehende Spots bleiben unverändert'}</div>
      {atmospherePlan.source==='verified-v604'&&<>
       <button type="button" className="concert-transition-export-v884" onClick={exportSpotlightV890}>Spotlight-Plan als JSON exportieren</button>
       <ol className="concert-atmosphere-scenes-v885">{atmospherePlan.scenes.slice(0,6).map(sc=><li key={sc.index}>
        <b>{fmt(sc.startMs)}</b> {sc.section} · {spotlightSettingsV890.style==='auto'?suggestedSpotlightV890(sc.section,sc.intent,genre??''):spotlightSettingsV890.style}
       </li>)}</ol>
      </>}
      <small>Verwendet ausschließlich die vorhandenen V308-3D-Spots und Lichtkegel. Keine neuen Lichtquellen,
       Blitz-Modi oder Hardwaresteuerung. Manuelle Timelines, Blackouts, Spulen und Geräteleistung haben Vorrang.</small>
     </fieldset>
     <fieldset className="concert-particle-options-v889" aria-label="Advanced Particle FX">
      <legend>V889 · Advanced Particle FX</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={particleSettingsV889.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateParticleV889({enabled:e.target.checked})}/>Particle Show Director aktiv</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={particleSettingsV889.protectLyrics}
       onChange={(e:{target:{checked:boolean}})=>updateParticleV889({protectLyrics:e.target.checked})}/>Lyrics vor Partikelüberlagerung schützen</label>
      <div className="concert-particle-toggles-v889">
       {(['bubbles','foam','streamers','confetti'] as const).map(k=><label key={k} className="live-fx-check-v881">
        <input type="checkbox" checked={particleSettingsV889[k]}
         onChange={(e:{target:{checked:boolean}})=>updateParticleV889({[k]:e.target.checked})}/>
        {({bubbles:'Seifenblasen',foam:'Schaumkanonen',streamers:'Papier-Luftschlangen',confetti:'Konfetti'} as const)[k]}</label>)}
      </div>
      <label className="live-fx-style-v881">Dramaturgie <select value={particleSettingsV889.mode}
       onChange={(e:{target:{value:string}})=>updateParticleV889({mode:e.target.value as ParticleSettingsV889['mode']})}>
       <option value="balanced">Ausgewogen</option><option value="cinematic">Cinematic · Freiraum</option>
       <option value="festival">Festival · vollere Show</option>
      </select></label>
      <label className="live-fx-style-v881">Genre-Look <select value={particleSettingsV889.mood}
       onChange={(e:{target:{value:string}})=>updateParticleV889({mood:e.target.value as ParticleSettingsV889['mood']})}>
       <option value="auto">Automatisch nach Musikgenre</option><option value="noir">Noir · Deutschrap</option>
       <option value="electric">Electric · Hardtekk</option><option value="arena">Arena · Deutschrock</option>
       <option value="dream">Dream · Pop</option>
      </select></label>
      <label className="live-fx-style-v881">Bevorzugter Effekt <select value={particleSettingsV889.focus}
       onChange={(e:{target:{value:string}})=>updateParticleV889({focus:e.target.value as ParticleSettingsV889['focus']})}>
       <option value="auto">Passend zum Songabschnitt</option><option value="bubbles">Seifenblasen</option>
       <option value="foam">Schaumkanonen</option><option value="streamers">Papier-Luftschlangen</option>
       <option value="confetti">Konfetti</option>
      </select></label>
      <label className="live-fx-range-v881">Partikel-Mischung <strong>{particleSettingsV889.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={particleSettingsV889.intensity}
        onChange={(e:{target:{value:string}})=>updateParticleV889({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="off">
       {atmospherePlan.source==='verified-v604'?`${atmospherePlan.scenes.length} bestätigte Abschnitte · intelligente Partikelmischung`:
        'Keine bestätigte Timeline – bestehende Partikeleffekte bleiben unverändert'}</div>
      {atmospherePlan.source==='verified-v604'&&<>
       <button type="button" className="concert-transition-export-v884" onClick={exportParticleV889}>Partikel-Showplan als JSON exportieren</button>
       <ol className="concert-atmosphere-scenes-v885">{atmospherePlan.scenes.slice(0,6).map(sc=><li key={sc.index}>
        <b>{fmt(sc.startMs)}</b> {sc.section} · Vorrang: {({none:'keiner',bubbles:'Seifenblasen',foam:'Schaum',streamers:'Luftschlangen',confetti:'Konfetti'} as const)[suggestedParticleHeroV889(sc.section,genre,particleSettingsV889)]}
       </li>)}</ol>
      </>}
      <small>Steuert ausschließlich bereits aktive 3D-Partikeleffekte aus dem Concert FX Studio.
       Manuelle Effekt-Timelines bleiben unverändert, es entstehen keine zusätzlichen Partikel oder Renderdurchläufe.
       Der Showplan zeigt Prioritäten, keine garantierten Auslösungen.</small>
     </fieldset>
     <fieldset className="concert-laser-options-v888" aria-label="Virtuelle Laser Show">
      <legend>V888 · Laser Show Director</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={laserSettingsV888.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateLaserV888({enabled:e.target.checked})}/>Intelligente Laser-Regie aktiv</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={laserSettingsV888.protectLyrics}
       onChange={(e:{target:{checked:boolean}})=>updateLaserV888({protectLyrics:e.target.checked})}/>Bei Lyrics und Gesangs-Close-ups zurücknehmen</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={laserSettingsV888.useScenePalette}
       onChange={(e:{target:{checked:boolean}})=>updateLaserV888({useScenePalette:e.target.checked})}/>Szenenfarben übernehmen</label>
      <label className="live-fx-style-v881">Lasermuster <select value={laserSettingsV888.pattern}
       onChange={(e:{target:{value:string}})=>updateLaserV888({pattern:e.target.value as LaserShowSettingsV888['pattern']})}>
       <option value="auto">Automatisch nach Songabschnitt</option>
       {Object.entries(LASER_PATTERN_LABELS_V888).map(([key,label])=><option key={key} value={key}>{label}</option>)}
      </select></label>
      <label className="live-fx-style-v881">Bewegung <select value={laserSettingsV888.motion}
       onChange={(e:{target:{value:string}})=>updateLaserV888({motion:e.target.value as LaserShowSettingsV888['motion']})}>
       <option value="calm">Ruhig</option><option value="cinematic">Cinematic</option>
       <option value="festival">Festival (ohne Blitz)</option>
      </select></label>
      <label className="live-fx-range-v881">Laserintensität <strong>{laserSettingsV888.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={laserSettingsV888.intensity}
        onChange={(e:{target:{value:string}})=>updateLaserV888({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="off">
       {atmospherePlan.source==='verified-v604'?`${atmospherePlan.scenes.length} Szenen für die Laser-Choreografie`:
        'Keine verifizierte Szenen-Timeline – vorhandene Laser laufen unverändert'}</div>
      {atmospherePlan.scenes.length>0&&<button type="button" className="concert-transition-export-v884"
       onClick={exportLaserV888}>Laser-Szenenplan als JSON exportieren</button>}
      <small>Virtuelle 3D-Bühnenlaser auf der vorhandenen V811-Fläche. Concert FX Studio → Laser muss aktiv sein.
       Manuelle Laser-Timelines, Blackouts und reduzierte Bewegung haben Vorrang. Keine Hardwarelaser oder Strobo-Blitze.</small>
     </fieldset>
     <fieldset className="concert-fog-options-v887" aria-label="Cinematic Fog and Haze">
      <legend>V887 · Cinematic Fog &amp; Haze</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={fogSettingsV887.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateFogV887({enabled:e.target.checked})}/>Cinematic Nebel-Regie aktiv</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={fogSettingsV887.floor}
       onChange={(e:{target:{checked:boolean}})=>updateFogV887({floor:e.target.checked})}/>Rollender Bodennebel (3D)</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={fogSettingsV887.shafts}
       onChange={(e:{target:{checked:boolean}})=>updateFogV887({shafts:e.target.checked})}/>Weiche Lichtkegel im Dunst (3D)</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={fogSettingsV887.protectLyrics}
       onChange={(e:{target:{checked:boolean}})=>updateFogV887({protectLyrics:e.target.checked})}/>Nebel bei Lyrics-Fokus ausblenden</label>
      <label className="live-fx-style-v881">Nebelprofil <select value={fogSettingsV887.mood}
       onChange={(e:{target:{value:string}})=>updateFogV887({mood:e.target.value as CinematicFogSettingsV887['mood']})}>
       <option value="auto">Automatisch nach Genre</option>
       <option value="noir">Noir · Deutschrap</option><option value="electric">Electric · Hardtekk</option>
       <option value="arena">Arena · Deutschrock</option><option value="dream">Dream · Pop</option>
      </select></label>
      <label className="live-fx-style-v881">Nebelbewegung <select value={fogSettingsV887.motion}
       onChange={(e:{target:{value:string}})=>updateFogV887({motion:e.target.value as CinematicFogSettingsV887['motion']})}>
       <option value="still">Still · nahezu statisch</option><option value="rolling">Cinematic · sanft rollend</option>
       <option value="festival">Festival · lebendiger</option>
      </select></label>
      <label className="live-fx-range-v881">Nebelintensität <strong>{fogSettingsV887.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={fogSettingsV887.intensity}
        onChange={(e:{target:{value:string}})=>updateFogV887({intensity:Number(e.target.value)})}/></label>
      <div className="concert-atmosphere-preview-v885" aria-live="off">
       <span className="concert-atmosphere-swatch-v885" style={{backgroundColor:fogPreviewV887.color}} aria-hidden="true"/>
       <span>{fogPreviewV887.label} · {atmospherePlan.source==='verified-v604'?
        `${atmospherePlan.scenes.length} bestätigte Szenen`:'Keine verifizierte Szenen-Timeline'}</span>
      </div>
      {atmospherePlan.scenes.length>0&&<button type="button" className="concert-transition-export-v884"
       onClick={exportFogV887}>Nebel-Szenenplan als JSON exportieren</button>}
      <small>Verwendet die vorhandenen V814-Nebelflächen. Benötigt aktivierte atmosphärische Effekte im Concert FX Studio.
       Kein neuer Scheinwerfer und keine Blitz-Effekte. Blackouts, manuelle Beleuchtung, Pausen und reduzierte Bewegung haben Vorrang.</small>
     </fieldset>
     <ConcertQualityIntelligencePanelV901 trackId={trackId} durationMs={durationMs} positionMs={progressMs}
      playing={playing} reducedMotion={motionOff} autoEnabled={settings.enabled&&settings.auto}
      directorEnabled={directorSettingsV895.enabled} ultimateEnabled={ultimateSettingsV900.enabled}
      plan={ultimatePlanV900} cue={ultimateCueV900}
      cameraEnabled={ultimateSettingsV900.camera&&cameraSettingsV897.enabled}
      danceEnabled={ultimateSettingsV900.dance&&danceShowSettingsV899.enabled&&syncSettings.dance}
      lightsEnabled={ultimateSettingsV900.lights&&syncSettings.lights}
      ledEnabled={ultimateSettingsV900.led&&syncSettings.stage}
      fxEnabled={syncSettings.stage&&(laserSettingsV888.enabled||particleSettingsV889.enabled||pyroSettingsV891.enabled)}
      lyricsGuard={ultimateSettingsV900.protectLyrics} cameraLyricsGuard={cameraSettingsV897.protectLyrics}
      danceFootGuard={danceShowSettingsV899.protectFootwork}
      energyExpected={ultimateSettingsV900.energyResponse}
      advisorControls={{ultimate:ultimateSettingsV900,camera:cameraSettingsV897,dance:danceShowSettingsV899,
       laser:laserSettingsV888,particles:particleSettingsV889,spotlights:spotlightSettingsV890}}
      onApplyAdvice={applyAdvisorV902} onRestoreAdvice={restoreAdvisorV903}/>
     <fieldset className="concert-director-options-v895 concert-ultimate-options-v900" aria-label="Ultimate Concert Experience 5.0">
      <legend>V900 · Ultimate Concert Experience 5.0</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={ultimateSettingsV900.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateUltimateV900({enabled:e.target.checked})}/>Vollständige Song-Regie koordinieren</label>
      <div className="concert-particle-toggles-v889">{(['contrast','smoothTransitions','energyResponse','protectLyrics','camera','dance','lights','led','stage'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={ultimateSettingsV900[k]} onChange={(e:{target:{checked:boolean}})=>updateUltimateV900({[k]:e.target.checked})}/>
       {({contrast:'Kontraste zwischen Strophen und Höhepunkten',smoothTransitions:'Weiche Szenenübergänge',energyResponse:'Echte Audioenergie berücksichtigen',protectLyrics:'Lyrics & Sänger schützen',camera:'Kamera-Rhythmus koordinieren',dance:'Tanzenergie koordinieren',lights:'Spotlights abstimmen',led:'LED-Wall abstimmen',stage:'Bühnenarchitektur abstimmen'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Konzertprofil <select value={ultimateSettingsV900.style}
       onChange={(e:{target:{value:string}})=>updateUltimateV900({style:e.target.value as UltimateSettingsV900['style']})}>
       <option value="cinematic">Cinematic – lange, ruhige Einstellungen</option><option value="balanced">Ausgewogen</option>
       <option value="festival">Festival – schnellere Wechsel</option></select></label>
      <label className="live-fx-range-v881">Show-Dramaturgie <strong>{ultimateSettingsV900.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={ultimateSettingsV900.intensity}
        onChange={(e:{target:{value:string}})=>updateUltimateV900({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="off">
       {ultimateCueV900.active?`Aktueller Look: ${ultimateCueV900.motif} · ${ultimateCueV900.act} · ${ultimateCueV900.lens}`:
        ultimatePlanV900.source==='verified-v604'?`${ultimatePlanV900.scenes.length} bestätigte Szenen · ${ultimatePlanV900.peakCount} Show-Höhepunkte · ${ultimatePlanV900.variationCount} Variationen`:
        'Keine bestätigte Song-Timeline – Automatik bleibt neutral'}</div>
      {ultimatePlanV900.source==='verified-v604'&&<button type="button" className="concert-transition-export-v884"
       onClick={exportUltimateV900Json}>V900 Konzert-Partitur als JSON exportieren</button>}
      <small>Eine gemeinsame, regelbasierte Partitur. Verwendet ausschließlich bestätigte V604-Szenen; keine generative KI.
       Dämpft nur bereits aktive Regiesysteme und respektiert manuelle Shows, Lyrics, Blackouts, Pausen und Performance-Grenzen.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895 concert-dance-show-options-v899" aria-label="Advanced Dance Show Director">
      <legend>V899 · Advanced Dance Show Director</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={danceShowSettingsV899.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateDanceShowV899({enabled:e.target.checked})}/>Intelligente Tanzformationen aktivieren</label>
      <div className="concert-particle-toggles-v889">{(['formations','transitions','cameraSync','energyResponse','protectLyrics','protectFootwork'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={danceShowSettingsV899[k]} onChange={(e:{target:{checked:boolean}})=>updateDanceShowV899({[k]:e.target.checked})}/>
       {({formations:'Solo-/Duett-Aufstellung koordinieren',transitions:'Weiche Formationswechsel',cameraSync:'Mit Kameratempo abstimmen',energyResponse:'Gemessene Audioenergie berücksichtigen',protectLyrics:'Lyrics-Fokus schützen',protectFootwork:'Fußsperren und Kollisionen schützen'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Regiestil <select value={danceShowSettingsV899.style}
       onChange={(e:{target:{value:string}})=>updateDanceShowV899({style:e.target.value as DanceShowSettingsV899['style']})}>
       <option value="cinematic">Cinematic – dezente Bewegung</option><option value="balanced">Ausgewogen</option>
       <option value="arena">Arena – breitere Formationen</option></select></label>
      <label className="live-fx-range-v881">Formationsintensität <strong>{danceShowSettingsV899.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={danceShowSettingsV899.intensity}
        onChange={(e:{target:{value:string}})=>updateDanceShowV899({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="off">
       {directorPlanV895.source==='verified-v604'
         ? `${directorPlanV895.scenes.length} bestätigte Szenen · Verse enger, Hooks breiter · keine neuen Animationen`
         : 'Keine bestätigte Songstruktur – keine automatischen Formationen'}</div>
      {directorPlanV895.source==='verified-v604'&&<button type="button" className="concert-transition-export-v884"
       onClick={exportDanceShowV899Json}>V899 Tanz-Show-Plan als JSON exportieren</button>}
      <small>V899 verwendet vorhandene Gruppen-Roots, bestätigt getaktete Songabschnitte und optionale reale V896-Energiemesswerte.
       Die V324-Formation, manuelle V325-Timelines, V322-Fußsperren, Clips und V351-Kameraschutz behalten Vorrang.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895 concert-choreography-v993" aria-label="AI Choreography Director V993">
      <legend>V993 · AI Choreography Director</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={choreographySettingsV993.enabled}
       onChange={e=>updateChoreographyV993({enabled:e.target.checked})}/>Genre-Choreografie (Oberkörper) aktivieren</label>
      <div className="concert-particle-toggles-v889">{(['ensembleSync','smoothTransitions','energyAccents','protectLyrics','protectFootwork'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={choreographySettingsV993[k]} onChange={e=>updateChoreographyV993({[k]:e.target.checked})}/>
       {({ensembleSync:'Gemeinsame Ensemble-Akzente',smoothTransitions:'Weiche Szenenübergänge',energyAccents:'Nur gemessene Audioakzente nutzen',protectLyrics:'Lyrics-Fokus schützen',protectFootwork:'Fuß- und Kollisionsschutz'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Tanzstil <select value={choreographySettingsV993.style}
       onChange={e=>updateChoreographyV993({style:e.target.value as ChoreographySettingsV993['style']})}>
       <option value="auto">Automatisch (bestätigtes Genre)</option><option value="deutschrap">Deutschrap – Grooves</option>
       <option value="hardtekk">Hardtekk – Drive</option><option value="hardstyle">Hardstyle – Pulse</option>
       <option value="rock">Rock – Arena</option><option value="pop">Pop – Flow</option></select></label>
      <label className="live-fx-range-v881">Choreografie-Stärke <strong>{choreographySettingsV993.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={choreographySettingsV993.intensity}
        onChange={e=>updateChoreographyV993({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="polite">
       {directorPlanV895.source==='verified-v604'
        ? `${previewChoreographyV993(directorPlanV895,choreographySettingsV993,genre).length} bestätigte Szenen für die Choreografie-Vorschau`
        : 'Keine bestätigte Songstruktur – Choreografie bleibt aus'}</div>
      <small>Bestehende GLB-Clips, Fuß-IK, Bühnenaufstellung und manuelle Timelines behalten Vorrang.
       Genre-Akzente sind regelbasiert und keine neu generierten Tanzclips. Ohne Live-Audio wird kein Beat behauptet.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895 concert-vocal-v994" aria-label="V994 Vocal Performance Intelligence">
      <legend>V994 · Vocal Performance Intelligence</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={vocalSettingsV994.enabled}
       onChange={e=>updateVocalV994({enabled:e.target.checked})}/>Wortbasierte Rap-Phrasierung aktivieren</label>
      <div className="concert-particle-toggles-v889">{(['mouthTiming','phraseExpression','headAccents'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={vocalSettingsV994[k]} onChange={e=>updateVocalV994({[k]:e.target.checked})}/>
       {({mouthTiming:'Mundübergänge sanfter gestalten',phraseExpression:'Dezente Gesichtsausdrücke',headAccents:'Natürliche Kopfakzente'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Performance-Stil <select value={vocalSettingsV994.style}
       onChange={e=>updateVocalV994({style:e.target.value as VocalSettingsV994['style']})}>
       <option value="natural">Natürlich</option><option value="rap-flow">Schneller Rap-Flow</option>
       <option value="stage">Bühnen-Performance</option></select></label>
      <label className="live-fx-range-v881">Performance-Intensität <strong>{vocalSettingsV994.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={vocalSettingsV994.intensity}
        onChange={e=>updateVocalV994({intensity:Number(e.target.value)})}/></label>
      <small>Nur mit synchronisierten Wortzeiten und berechtigter Sängerrolle. Kein Phonem- oder Stimmen-Erkennen,
       kein neues Mikrofon und keine künstlichen Rap-Silben. Manuelle Lippenformen, importierte Clips und
       Gesichts-Previews behalten Vorrang. In niedriger Grafikqualität deaktiviert.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895 concert-duet-v995" aria-label="V995 Duet & Ensemble 3.0">
      <legend>V995 · Duet &amp; Ensemble 3.0</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={duetSettingsV995.enabled}
       onChange={e=>updateDuetV995({enabled:e.target.checked})}/>Bestätigte Duette und gemeinsame Hook-Gesten hervorheben</label>
      <div className="concert-particle-toggles-v889">{(['partnerGaze','handoffGestures','sharedHooks','protectLyrics'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={duetSettingsV995[k]} onChange={e=>updateDuetV995({[k]:e.target.checked})}/>
       {({partnerGaze:'Kurze gegenseitige Blicke',handoffGestures:'Gesten bei Lead-Wechseln',sharedHooks:'Gemeinsame Hook-Akzente',protectLyrics:'Bei eingeblendeten Lyrics zurückhalten'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Interaktionsstil <select value={duetSettingsV995.style}
       onChange={e=>updateDuetV995({style:e.target.value as DuetSettingsV995['style']})}>
       <option value="natural">Natürlich</option><option value="responsive">Dialog &amp; Antwort</option>
       <option value="arena">Arena &amp; große Hook</option></select></label>
      <label className="live-fx-range-v881">Interaktionsstärke <strong>{duetSettingsV995.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={duetSettingsV995.intensity}
        onChange={e=>updateDuetV995({intensity:Number(e.target.value)})}/></label>
      <small>Nur bei bestätigter Song- und Sängerzuordnung. Keine Sprechererkennung oder neuen Animationen.
       V807/V838 liefern Rollen und Blicksignale, V995 ergänzt kurze Oberkörperakzente.
       Keine Eingriffe in Mund, Füße, importierte Clips, Kamera oder manuelle Shows.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895 concert-crowd-v996" aria-label="V996 Virtual Crowd Experience">
      <legend>V996 · Virtual Crowd Experience</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={crowdSettingsV996.enabled}
       onChange={e=>updateCrowdV996({enabled:e.target.checked})}/>Virtuelles Publikum bei bestätigten Songmomenten verstärken</label>
      <div className="concert-particle-toggles-v889">{(['glowsticks','waves','reactions','protectLyrics'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={crowdSettingsV996[k]} onChange={e=>updateCrowdV996({[k]:e.target.checked})}/>
       {({glowsticks:'Dezente virtuelle Lichtstäbe',waves:'Publikumswellen',reactions:'Reaktion auf gemessene Bassimpulse',protectLyrics:'Lyrics und Sängerfokus schützen'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Publikumsstil <select value={crowdSettingsV996.style}
       onChange={e=>updateCrowdV996({style:e.target.value as CrowdExperienceSettingsV996['style']})}>
       <option value="subtle">Dezent</option><option value="festival">Festival</option><option value="arena">Arena</option></select></label>
      <label className="live-fx-range-v881">Publikumsintensität <strong>{crowdSettingsV996.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={crowdSettingsV996.intensity}
        onChange={e=>updateCrowdV996({intensity:Number(e.target.value)})}/></label>
      <small>Nur virtuelle V815-Instanzen mit bestätigten V604-Songabschnitten und echtem Basssignal.
       Keine zusätzliche Publikumssimulation, keine Govee-Befehle und kein Stroboskop.
       Manuelle Regie, Lyrics, reduzierte Bewegung und niedrige Grafikqualität bleiben geschützt.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895 concert-flow-v997" aria-label="V997 Continuous Concert Flow">
      <legend>V997 · Continuous Concert Flow</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={flowSettingsV997.enabled}
       onChange={e=>updateFlowV997({enabled:e.target.checked})}/>Sanfte virtuelle Übergänge bei beobachtetem Songwechsel</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={flowSettingsV997.protectLyrics}
       onChange={e=>updateFlowV997({protectLyrics:e.target.checked})}/>Lyrics bevorzugen</label>
      <label className="live-fx-style-v881">Übergangsstil <select value={flowSettingsV997.style}
       onChange={e=>updateFlowV997({style:e.target.value as FlowSettingsV997['style']})}>
       <option value="subtle">Dezent</option><option value="cinematic">Filmisch</option>
       <option value="festival">Festival</option></select></label>
      <label className="live-fx-range-v881">Übergangsstärke <strong>{flowSettingsV997.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={flowSettingsV997.intensity}
        onChange={e=>updateFlowV997({intensity:Number(e.target.value)})}/></label>
      <small>Opt-in: maximal 2,7 Sekunden dezente Bühnenringe, wenn Spotify gegen Ende eines Songs
       einen neuen laufenden Titel nahe dessen Beginn meldet. Kein Audio-Crossfade, keine
       Playlist-Vorhersage, keine KI-Schätzung, keine Govee-Befehle und kein Überschreiben
       manueller Regie. Nicht jeder manuelle Titelsprung lässt sich von Spotify unterscheiden.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895 concert-dance-camera-options-v898" aria-label="Intelligent Dance & Camera Coordination">
      <legend>V898 · Intelligent Dance &amp; Camera Coordination</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={danceCameraSettingsV898.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateDanceCameraV898({enabled:e.target.checked})}/>Kamera &amp; Tanzformation gemeinsam inszenieren</label>
      <div className="concert-particle-toggles-v889">{(['solo','duet','ensemble','motionFollow','protectLyrics','protectDuets'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={danceCameraSettingsV898[k]} onChange={(e:{target:{checked:boolean}})=>updateDanceCameraV898({[k]:e.target.checked})}/>
       {({solo:'Solo-Fokus',duet:'Zwei-Personen-Bilder',ensemble:'Ensemble & Gruppen',motionFollow:'Reale Avatar-Positionsänderung berücksichtigen',protectLyrics:'Lyrics und Gesichter schützen',protectDuets:'Duette sanft halten'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Regiestil <select value={danceCameraSettingsV898.style}
       onChange={(e:{target:{value:string}})=>updateDanceCameraV898({style:e.target.value as DanceCameraSettingsV898['style']})}>
       <option value="subtle">Subtil – ruhige Kameraführung</option><option value="cinematic">Cinematic – filmische Gruppenbilder</option>
       <option value="dynamic">Dynamisch – Festival</option></select></label>
      <label className="live-fx-style-v881">Bevorzugtes Bild <select value={danceCameraSettingsV898.mode}
       onChange={(e:{target:{value:string}})=>updateDanceCameraV898({mode:e.target.value as DanceCameraSettingsV898['mode']})}>
       <option value="auto">Automatisch nach sichtbarer Besetzung</option><option value="solo">Solo</option>
       <option value="duet">Zwei Personen</option><option value="ensemble">Ensemble</option></select></label>
      <label className="live-fx-range-v881">Koordinationsstärke <strong>{danceCameraSettingsV898.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={danceCameraSettingsV898.intensity}
        onChange={(e:{target:{value:string}})=>updateDanceCameraV898({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="off">
       {directorPlanV895.source==='verified-v604'
         ? `${directorPlanV895.scenes.length} bestätigte Szenen · Kameraauswahl erst mit sichtbaren Avataren`
         : 'Keine bestätigte Songstruktur – Koordination bleibt aus'}</div>
      {directorPlanV895.source==='verified-v604'&&<button type="button" className="concert-transition-export-v884"
        onClick={exportDanceCameraV898Json}>Dance-&amp;-Camera-Plan als JSON exportieren</button>}
      <small>V898 nutzt ausschließlich die sichtbaren, tatsächlich vorhandenen Avatar-Weltpositionen und die bestätigte V604-Timeline.
       Keine neue Sänger-, Beat- oder Tanzschritt-Erkennung. Manuelle Kamera-/Tanz-Timelines, V897 und der finale Lyrics-/Full-Body-Bildausschnitt haben Vorrang.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895 concert-camera-options-v897" aria-label="Cinematic Camera 4.0">
      <legend>V897 · Cinematic Camera 4.0</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={cameraSettingsV897.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateCameraV897({enabled:e.target.checked})}/>Automatische Filmkamera aktiv</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={cameraSettingsV897.protectLyrics}
       onChange={(e:{target:{checked:boolean}})=>updateCameraV897({protectLyrics:e.target.checked})}/>Lyrics und Sänger-Close-ups schützen</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={cameraSettingsV897.protectDuets}
       onChange={(e:{target:{checked:boolean}})=>updateCameraV897({protectDuets:e.target.checked})}/>Duett-Framing priorisieren</label>
      <div className="concert-particle-toggles-v889">{(['portrait','orbit','dolly','crane','wide'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={cameraSettingsV897[k]} onChange={(e:{target:{checked:boolean}})=>updateCameraV897({[k]:e.target.checked})}/>
       {({portrait:'Portrait und Künstlerfokus',orbit:'Seitlicher Kamerabogen',dolly:'Sanfte Dolly-Fahrt',crane:'Kran-Perspektive',wide:'Weite Arena-Einstellung'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Kamerastil <select value={cameraSettingsV897.style}
       onChange={(e:{target:{value:string}})=>updateCameraV897({style:e.target.value as CinematicCameraSettingsV897['style']})}>
       <option value="steady">Ruhig · Nahaufnahmen</option><option value="cinematic">Cinematic · Filmisch</option>
       <option value="dynamic">Dynamisch · Festival</option></select></label>
      <label className="live-fx-style-v881">Bevorzugte Perspektive <select value={cameraSettingsV897.preference}
       onChange={(e:{target:{value:string}})=>updateCameraV897({preference:e.target.value as CinematicCameraSettingsV897['preference']})}>
       <option value="auto">Automatisch &amp; abwechslungsreich</option>
       <option value="portrait">Portrait</option><option value="orbit">Orbit</option>
       <option value="dolly">Dolly</option><option value="crane">Kranfahrt</option>
       <option value="wide">Weite Bühne</option></select></label>
      <label className="live-fx-range-v881">Kamerabewegung <strong>{cameraSettingsV897.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={cameraSettingsV897.intensity}
        onChange={(e:{target:{value:string}})=>updateCameraV897({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="off">{
       directorPlanV895.source==='verified-v604'
        ? `${directorPlanV895.scenes.filter(s=>selectCameraShotV897(s,cameraSettingsV897)!==null).length} bestätigte Kamera-Szenen verfügbar`
        : 'Keine bestätigte Song-Timeline – bisherige Kameraregie bleibt unverändert'}</div>
      {directorPlanV895.source==='verified-v604'&&<>
       <button type="button" className="concert-transition-export-v884" onClick={exportCameraV897Json}>Kamera-Partitur als JSON exportieren</button>
       <ol className="concert-atmosphere-scenes-v885">{directorPlanV895.scenes.slice(0,8).map(s=><li key={s.index}>
        <b>{fmt(s.startMs)}</b> {selectCameraShotV897(s,cameraSettingsV897)??'Aus'} · {s.section}</li>)}</ol>
      </>}
      <small>Verwendet nur bestätigte V604-Szenen und die vorhandene R3F-Kamera. Manuelle Kamera-Presets, gespeicherte Fahrten,
       Live-Editor, Lyrics und bestehende Künstlerrahmung behalten Vorrang. Keine harten Schnitte oder zweite Kamera.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895 concert-camera-options-v992" aria-label="V992 Cinematic Camera Director 3.0">
      <legend>V992 · Cinematic Camera Director 3.0</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={cameraSettingsV992.enabled}
       onChange={e=>updateCinemaV992({enabled:e.target.checked})}/>Zusätzliche filmische Kameraregie aktivieren</label>
      <label className="live-fx-style-v881">Bildsprache <select value={cameraSettingsV992.mode}
       disabled={!cameraSettingsV992.enabled}
       onChange={e=>updateCinemaV992({mode:e.target.value as CinemaSettingsV992['mode']})}>
       <option value="story">Songgeschichte · sanfte Wechsel</option>
       <option value="performer">Künstler · nah und ruhig</option>
       <option value="festival">Festival · weite Arena</option>
      </select></label>
      <label className="live-fx-range-v881">Kamera-Intensität <strong>{cameraSettingsV992.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={cameraSettingsV992.intensity}
        disabled={!cameraSettingsV992.enabled}
        onChange={e=>updateCinemaV992({intensity:Number(e.target.value)})}/></label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={cameraSettingsV992.accents}
       disabled={!cameraSettingsV992.enabled}
       onChange={e=>updateCinemaV992({accents:e.target.checked})}/>Kurze Akzente nur bei gemessenem Bass</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={cameraSettingsV992.protectLyrics}
       disabled={!cameraSettingsV992.enabled}
       onChange={e=>updateCinemaV992({protectLyrics:e.target.checked})}/>Lyrics und Sänger-Close-ups schützen</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={cameraSettingsV992.protectDuets}
       disabled={!cameraSettingsV992.enabled}
       onChange={e=>updateCinemaV992({protectDuets:e.target.checked})}/>Duette mit reduzierter Kamerabewegung</label>
      {directorPlanV895.source==='verified-v604'?<ol className="concert-atmosphere-scenes-v885">
       {previewCinemaV992(directorPlanV895,cameraSettingsV992).slice(0,8).map(x=><li key={x.index}>
        <b>{fmt(x.startMs)}</b> {x.style} · {x.section}</li>)}</ol>
       :<small>Keine bestätigten Songabschnitte: V992 bleibt aus und übernimmt keine geschätzten Zeitpunkte.</small>}
      <small>Nur dieselbe vorhandene Kamera, keine Schnitte oder zusätzliche Render-Loop. Manuelle Timelines,
       Lyrics, bestehendes V848/V897-Framing, V898-Tanzkamera und V351-Sicherheitsrahmen behalten Vorrang.
       Bassakzente benötigen gemessene Kick-Flanken – Spotify-Metadaten allein reichen nicht.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895" aria-label="Musical Energy Intelligence">
      <legend>V896 · Musical Energy Intelligence</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={energySettingsV896.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateEnergyV896({enabled:e.target.checked})}/>Audio-Energie mit der Konzertregie verbinden</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={energySettingsV896.protectLyrics}
       onChange={(e:{target:{checked:boolean}})=>updateEnergyV896({protectLyrics:e.target.checked})}/>Lyrics und Close-ups schützen</label>
      <div className="concert-particle-toggles-v889">{(['dynamics','bass','camera','dance','lights','led'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={energySettingsV896[k]} onChange={(e:{target:{checked:boolean}})=>updateEnergyV896({[k]:e.target.checked})}/>
       {({dynamics:'Musikalische Dynamik',bass:'Bass-/Anschlag-Akzente',camera:'Automatische Kamera',dance:'Tänzer',lights:'Vorhandene Spotlights',led:'LED-Wall'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Reaktionsstil <select value={energySettingsV896.style}
       onChange={(e:{target:{value:string}})=>updateEnergyV896({style:e.target.value as EnergySettingsV896['style']})}>
       <option value="subtle">Subtil · ruhiger Konzertfilm</option>
       <option value="balanced">Ausgewogen · musikalisch</option>
       <option value="expressive">Expressiv · Festival</option>
      </select></label>
      <label className="live-fx-range-v881">Empfindlichkeit <strong>{energySettingsV896.sensitivity}%</strong>
       <input type="range" min="0" max="100" step="5" value={energySettingsV896.sensitivity}
        onChange={(e:{target:{value:string}})=>updateEnergyV896({sensitivity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="off">
       {energyLiveV896&&energyLiveV896.samples>=3&&playing?
        `Live-Audio: Energie ${Math.round(energyLiveV896.smoothed*100)}% · Bass ${Math.round(energyLiveV896.bass*100)}% · Trend ${energyLiveV896.trend>0.07?'steigend':energyLiveV896.trend<-.07?'fallend':'stabil'}`:
        'Noch keine ausreichend aktuellen Audiomesswerte – die Konzertregie arbeitet unverändert'}</div>
      <button type="button" disabled={!energyLiveV896||energyLiveV896.samples<3} className="concert-transition-export-v884"
       onClick={exportEnergyV896Json}>Live-Audio-Messpunkt als JSON exportieren</button>
      <small>Reagiert auf die vorhandenen normalisierten Audio-Messwerte. Es erfolgt keine neue Songabschnitt- oder Beat-Erkennung;
       erforderlich sind eine bestätigte V604-Timeline, V895 und laufende Musik. Kein externes KI-Modell.</small>
     </fieldset>
     <fieldset className="concert-director-options-v895" aria-label="AI Concert Director 3.0">
      <legend>V895 · AI Concert Director 3.0</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={directorSettingsV895.enabled}
       onChange={(e:{target:{checked:boolean}})=>updateDirectorV895({enabled:e.target.checked})}/>Gemeinsame Konzertregie aktiv</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={directorSettingsV895.protectLyrics}
       onChange={(e:{target:{checked:boolean}})=>updateDirectorV895({protectLyrics:e.target.checked})}/>Lyrics und Sänger-Close-ups schützen</label>
      <div className="concert-particle-toggles-v889">{(['camera','dance','lights','led','stage'] as const).map(k=><label key={k} className="live-fx-check-v881">
       <input type="checkbox" checked={directorSettingsV895[k]} onChange={(e:{target:{checked:boolean}})=>updateDirectorV895({[k]:e.target.checked})}/>
       {({camera:'Kamera-Übergänge',dance:'Tänzer-Akzente',lights:'Vorhandene Spotlights',led:'LED-Wall',stage:'3D-Bühne und Show-Akzente'} as const)[k]}
      </label>)}</div>
      <label className="live-fx-style-v881">Show-Dramaturgie <select value={directorSettingsV895.style}
       onChange={(e:{target:{value:string}})=>updateDirectorV895({style:e.target.value as DirectorSettingsV895['style']})}>
       <option value="cinematic">Cinematic · Künstler und Lyrics</option>
       <option value="balanced">Ausgewogen · ganze Show</option>
       <option value="festival">Festival · größere Höhepunkte</option>
      </select></label>
      <label className="live-fx-range-v881">Regie-Intensität <strong>{directorSettingsV895.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={directorSettingsV895.intensity}
        onChange={(e:{target:{value:string}})=>updateDirectorV895({intensity:Number(e.target.value)})}/></label>
      <div className="concert-transition-status-v884" aria-live="off">
       {directorCueV895.active?`Jetzt: ${directorCueV895.label} · ${directorCueV895.section}`:
        directorPlanV895.source==='verified-v604'?`${directorPlanV895.scenes.length} bestätigte Song-Szenen geplant`:
        'Keine bestätigte Song-Timeline – bisherige Regie bleibt unverändert'}</div>
      {directorPlanV895.source==='verified-v604'&&<>
       <button type="button" className="concert-transition-export-v884" onClick={exportDirectorV895Json}>Konzert-Partitur als JSON exportieren</button>
       <ol className="concert-atmosphere-scenes-v885">{directorPlanV895.scenes.slice(0,8).map(sc=><li key={sc.index}>
        <b>{fmt(sc.startMs)}</b> {sc.label} · {sc.section}</li>)}</ol>
      </>}
      <small>Regelbasierte automatische Konzertregie (kein externes KI-Modell). Koordiniert nur bereits aktivierte Systeme;
       manuelle Timelines, Blackouts, pausierte Musik und reduzierte Bewegung bleiben maßgeblich.</small>
     </fieldset>
     <fieldset className="concert-atmosphere-options-v885" aria-label="Dynamische Konzertatmosphäre">
      <legend>V885 · Dynamic Concert Atmosphere</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={atmosphereSettings.enabled} onChange={(e:{target:{checked:boolean}})=>updateAtmosphere({enabled:e.target.checked})}/>Atmosphären-Regie aktiv</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={atmosphereSettings.lights} onChange={(e:{target:{checked:boolean}})=>updateAtmosphere({lights:e.target.checked})}/>3D-Scheinwerferfarben</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={atmosphereSettings.environment} onChange={(e:{target:{checked:boolean}})=>updateAtmosphere({environment:e.target.checked})}/>3D-Bühnenhintergrund und Boden</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={atmosphereSettings.haze} onChange={(e:{target:{checked:boolean}})=>updateAtmosphere({haze:e.target.checked})}/>Sanfter Atmosphären-Dunst</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={atmosphereSettings.overlay} onChange={(e:{target:{checked:boolean}})=>updateAtmosphere({overlay:e.target.checked})}/>Farb-Glow über die Ansicht</label>
      <label className="live-fx-style-v881">Farbwelt <select value={atmosphereSettings.palette} onChange={(e:{target:{value:string}})=>updateAtmosphere({palette:e.target.value as AtmosphereSettingsV885['palette']})}>
       <option value="auto">Automatisch nach Genre</option><option value="noir">Noir · Deutschrap</option>
       <option value="electric">Electric · Hardtekk</option><option value="arena">Arena · Deutschrock</option>
       <option value="dream">Dream · Pop</option>
      </select></label>
      <label className="live-fx-style-v881">Farbübergänge <select value={atmosphereSettings.pace} onChange={(e:{target:{value:string}})=>updateAtmosphere({pace:e.target.value as AtmosphereSettingsV885['pace']})}>
       <option value="gentle">Langsam &amp; fließend</option><option value="cinematic">Cinematic</option>
       <option value="festival">Festival · reaktionsfreudig</option>
      </select></label>
      <label className="live-fx-range-v881">Atmosphäre <strong>{atmosphereSettings.intensity}%</strong>
       <input type="range" min="0" max="100" step="5" value={atmosphereSettings.intensity} onChange={(e:{target:{value:string}})=>updateAtmosphere({intensity:Number(e.target.value)})}/></label>
      <div className="concert-atmosphere-preview-v885">
       <span className="concert-atmosphere-swatch-v885" style={{backgroundColor:atmosphereCue.active?atmosphereCue.primary:atmospherePreview.primary}} aria-hidden="true"/>
       <span className="concert-atmosphere-swatch-v885" style={{backgroundColor:atmosphereCue.active?atmosphereCue.secondary:atmospherePreview.secondary}} aria-hidden="true"/>
       <span className="concert-atmosphere-swatch-v885" style={{backgroundColor:atmosphereCue.active?atmosphereCue.ambient:atmospherePreview.ambient}} aria-hidden="true"/>
       <span>{atmosphereCue.active?atmosphereCue.label:atmospherePlan.source==='verified-v604'?'Farbvorschau · Automatik inaktiv':'Farbvorschau · Szenen-Timeline fehlt'}</span>
      </div>
      {atmospherePlan.scenes.length>0&&<><button type="button" className="concert-transition-export-v884" onClick={exportAtmosphere}>Atmosphärenplan als JSON exportieren</button>
       <ol className="concert-atmosphere-scenes-v885">{atmospherePlan.scenes.slice(0,6).map(s=><li key={s.index}><b>{fmt(s.startMs)}</b>
        <i style={{background:s.primary}} aria-hidden="true"/>{s.name} · {s.section}</li>)}</ol></>}
      <small>Nur bestätigte Szenen; kein Stroboskop. Manuelle Licht-Timelines, Lyrics, Blackouts und reduzierte Bewegung haben Vorrang.</small>
     </fieldset>
     <fieldset className="concert-transition-options-v884" aria-label="Cinematic Concert Transitions">
      <legend>V884 · Cinematic Transitions</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={transitionSettings.enabled} onChange={(e:{target:{checked:boolean}})=>updateTransitions({enabled:e.target.checked})}/>Sanfte automatische Szenenübergänge</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={transitionSettings.camera} onChange={(e:{target:{checked:boolean}})=>updateTransitions({camera:e.target.checked})}/>Automatische Kamera-Dämpfung</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={transitionSettings.lights} onChange={(e:{target:{checked:boolean}})=>updateTransitions({lights:e.target.checked})}/>Vorhandene Lichter sanft überblenden</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={transitionSettings.visual} onChange={(e:{target:{checked:boolean}})=>updateTransitions({visual:e.target.checked})}/>Cinematischer Übergangs-Look</label>
      <label className="live-fx-style-v881">Übergangsstil <select value={transitionSettings.style} onChange={(e:{target:{value:string}})=>updateTransitions({style:e.target.value as CinematicTransitionSettingsV884['style']})}>
       <option value="subtle">Sanft · zurückhaltend</option><option value="cinematic">Cinematic · fließend</option><option value="arena">Arena · ausdrucksstark</option>
      </select></label>
      <div className="concert-transition-status-v884" aria-live="off">{transitionCue.active?`Übergang: ${transitionCue.label}`:`${transitionPlan.transitions.length} bestätigte Szenenübergänge geplant`}</div>
      {transitionPlan.transitions.length>0&&<>
       <button type="button" className="concert-transition-export-v884" onClick={exportTransitions}>Übergangsplan als JSON exportieren</button>
       <ol className="concert-transition-list-v884">{transitionPlan.transitions.slice(0,8).map(t=><li key={t.id} className={transitionCue.id===t.id?'is-active':''}><b>{fmt(t.atMs)}</b> {t.label}</li>)}</ol>
      </>}
      <small>Nur benachbarte bestätigte Szenen · manuelle Kamera und Licht-Timelines haben Vorrang.</small>
     </fieldset>
     <fieldset className="concert-sync-options-v882" aria-label="3D-Konzertverbindung">
      <legend>V882 · Konzert-Synchronisation</legend>
      <label className="live-fx-check-v881"><input type="checkbox" checked={syncSettings.stage} onChange={(e:{target:{checked:boolean}})=>updateSync({stage:e.target.checked})}/>3D-Bühneneffekte</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={syncSettings.lights} onChange={(e:{target:{checked:boolean}})=>updateSync({lights:e.target.checked})}/>Lichtregie koppeln</label>
      <label className="live-fx-check-v881"><input type="checkbox" checked={syncSettings.dance} onChange={(e:{target:{checked:boolean}})=>updateSync({dance:e.target.checked})}/>Automatische Tänzer-Akzente</label>
      <small>Nur bei 3D-Avatar-Bühne · Manuelle Timelines behalten Vorrang.</small>
     </fieldset>
     <label className="live-fx-range-v881">Intensität <strong>{settings.intensity}%</strong><input type="range" min="0" max="100" step="5" value={settings.intensity} onChange={(e:{target:{value:string}})=>update({intensity:Number(e.target.value)})}/></label>
     <label className="live-fx-style-v881">Look-Profil <select value={settings.style} onChange={(e:{target:{value:string}})=>update({style:e.target.value as LiveFxSettingsV881['style']})}>
      <option value="auto">Automatisch nach Genre</option><option value="rap">Deutschrap · Cinematic</option>
      <option value="hardtekk">Hardtekk · Neon</option><option value="rock">Deutschrock · Arena</option><option value="pop">Pop · Aurora</option>
     </select></label>
    </div>
    {momentSettings.enabled&&momentPlan.moments.length>0&&<section className="concert-moments-list-v883" aria-label="Show-Höhepunkte">
     <div className="live-fx-section-heading-v881"><span>Show-Höhepunkte ({momentPlan.moments.length})</span>
      <button type="button" onClick={exportMoments}>Momente exportieren</button></div>
     <ol>{momentPlan.moments.map(m=><li key={m.id} className={momentCue.id===m.id?'is-active':''}>
      <span aria-hidden="true">{momentIcons[m.kind]}</span><b>{fmt(m.startMs)}</b><strong>{m.label}</strong>
      <small>{m.reason}</small></li>)}</ol>
     {momentSettings.showCountdown&&momentCue.secondsUntilNext!==null&&momentCue.secondsUntilNext<=30&&
      <p className="concert-next-moment-v883">Nächster Show-Moment in {momentCue.secondsUntilNext} s · {momentCue.next?.label}</p>}
    </section>}
    {scenes.length>0?<><div className="live-fx-section-heading-v881"><span>Szenenplan</span>
      <button type="button" onClick={exportSheet}>JSON exportieren</button></div>
     <div className="live-fx-scenes-v881" role="img" aria-label={`${scenes.length} verifizierte Szenen; Position ${fmt(progressMs)}`}>
      {scenes.map(s=><span key={s.index} title={`${fmt(s.startMs)}–${fmt(s.endMs)} · ${s.section} · ${s.intent}`}
       className={cue.sceneIndex===s.index?'is-current':''}
       style={{left:`${100*s.startMs/durationMs}%`,width:`${100*(s.endMs-s.startMs)/durationMs}%`,
        background:({'cinema':'#8c83c9','neon':'#00ceb8','arena':'#fb9e59','aurora':'#81c3f0','none':'#475569'} as Record<string,string>)[selectLiveFxLookV881(s,style)]}} />)}
      <i style={{left:`${100*Math.min(1,Math.max(0,progressMs/durationMs))}%`}}/>
     </div><small className="live-fx-caption-v881">{scenes.length} Szenen aus bestätigter Planung · {fmt(progressMs)} / {fmt(durationMs)}</small>
    </>:<p className="live-fx-note-v881">Für automatische Looks ist eine verifizierte Songplanung nötig. Die drei Live-Tasten funktionieren auch ohne diese.</p>}
    {storageError&&<p className="live-fx-note-v881" role="status">Einstellungen konnten nicht dauerhaft gespeichert werden.</p>}
    <p className="live-fx-note-v881">Visuelle Highlights nach bestätigter Timeline; optional 3D-Bühnen-Sync. Kein Stroboskop, keine Spotify- oder Kamerasteuerung. Autorisierte Licht- und Tanz-Timelines behalten Vorrang; reduzierte Bewegung stoppt die Effekte.</p>
   </div>}
  </aside>}
  {controlsVisible&&settings.enabled&&settings.showHud&&playing&&scenes.length>0&&
   <div className="live-fx-mini-timeline-v881" aria-label={`Konzertszene ${cue.sceneSource==='verified'?sceneLabels[cue.section]??cue.section:'nicht verfügbar'}`}>
    <span>SHOW</span><div className="live-fx-mini-track-v881">
     {cue.sceneIndex>=0&&scenes[cue.sceneIndex]&&<i className="is-current" style={{left:`${100*scenes[cue.sceneIndex].startMs/durationMs}%`,
      width:`${100*(scenes[cue.sceneIndex].endMs-scenes[cue.sceneIndex].startMs)/durationMs}%`}}/>}
     <b style={{left:`${100*Math.min(1,Math.max(0,progressMs/durationMs))}%`}}/>
    </div><span>{fmt(progressMs)}</span>
    {momentSettings.enabled&&momentSettings.showCountdown&&momentCue.next&&momentCue.secondsUntilNext!==null&&momentCue.secondsUntilNext<=30&&
     <em className="concert-next-inline-v883">{momentIcons[momentCue.next.kind]} {momentCue.secondsUntilNext}s</em>}
   </div>}
 </>;
}
