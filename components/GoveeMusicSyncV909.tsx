'use client';
import {useEffect,useRef,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {sampleArenaShowPlanV1040} from '@/lib/arena360ShowDesignerV1040';
import {directArenaShowV1048} from '@/lib/arena360ConcertDirectorV1048';
import {directLiveConcertV1049} from '@/lib/arena360LiveConcertIntelligenceV1049';
import {planGoveeShowV1042,applyGoveeShowV1042} from '@/lib/goveeShowSyncV1042';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {GOVEE_CONFIG_EVENT_V909,GOVEE_CONFIG_KEY_V909,loadGoveeConfigV909,goveeBridgeRequestV909,planGoveeLookV909,
 type GoveeConfigV909,type GoveeLookV909,type GoveeDeviceV909} from '@/lib/goveeLanV909';
import {resolveGoveePhaseV911,resolveGoveeRoleV911,planGoveeConcertLookV911,
 easeGoveeLookV911,changedGoveeLookV911} from '@/lib/goveeConcertDirectorV911';
import {GOVEE_SHOWS_KEY_V912,GOVEE_SHOWS_EVENT_V912,loadGoveeShowsV912,getGoveeFadeMsV912,type GoveeShowV912} from '@/lib/goveeLightShowV912';
import {planGoveeAdvancedShowLookV914} from '@/lib/goveeTransitionsV914';
import {GOVEE_GROUPS_KEY_V915,GOVEE_GROUPS_EVENT_V915,EMPTY_GOVEE_GROUPS_V915,loadGoveeGroupsV915,findActiveGoveeGroupV915,getGoveeGroupSourceIpV915,applyGoveeGroupBrightnessV915,type GoveeGroupLibraryV915} from '@/lib/goveeDeviceGroupsV915';
import {GOVEE_BASS_KEY_V917,GOVEE_BASS_EVENT_V917,loadGoveeBassV917,resetGoveeBassEnvelopeV917,stepGoveeBassEnvelopeV917,applyGoveeBassLookV917,type GoveeBassSettingsV917} from '@/lib/goveeBassReactiveV917';
import {GOVEE_BEAT_KEY_V918,GOVEE_BEAT_EVENT_V918,loadGoveeBeatV918,resetGoveeBeatDispatchV918,planGoveeBeatDispatchV918,applyGoveePredictedLookV918,type GoveeBeatSettingsV918} from '@/lib/goveeBeatPredictionV918';
import {GOVEE_SECTION_KEY_V919,GOVEE_SECTION_EVENT_V919,loadGoveeSectionV919,planGoveeSectionV919,applyGoveeSectionV919,type GoveeSectionSettingsV919} from '@/lib/goveeSectionDirectorV919';
import {GOVEE_GENRE_KEY_V920,GOVEE_GENRE_EVENT_V920,loadGoveeGenreV920,planGoveeGenreV920,applyGoveeGenreV920,type GoveeGenreSettingsV920} from '@/lib/goveeGenreLightV920';
import {GOVEE_CINEMATIC_KEY_V921,GOVEE_CINEMATIC_EVENT_V921,GOVEE_STAGE_CUE_EVENT_V921,loadGoveeCinematicV921,planGoveeCinematicV921,applyGoveeCinematicV921,validGoveeStageCueV921,type GoveeConcertSyncSettingsV921,type GoveeStageCueV921} from '@/lib/goveeConcertSyncV921';
import {GOVEE_SHOCKWAVE_KEY_V922,GOVEE_SHOCKWAVE_EVENT_V922,loadGoveeShockwaveV922,
 resetGoveeShockwaveV922,stepGoveeShockwaveV922,planGoveeShockwaveV922,applyGoveeShockwaveV922,
 type GoveeShockwaveSettingsV922} from '@/lib/goveeShockwaveV922';
import {GOVEE_NEON_KEY_V923,GOVEE_NEON_EVENT_V923,loadGoveeNeonV923,planGoveeNeonV923,applyGoveeNeonV923,
 type GoveeNeonSettingsV923} from '@/lib/goveeNeonPulseV923';
import {GOVEE_ENERGY_KEY_V924,GOVEE_ENERGY_EVENT_V924,loadGoveeEnergyV924,planGoveeEnergyV924,applyGoveeEnergyV924,type GoveeEnergySettingsV924} from '@/lib/goveeLightEnergyV924';
import {GOVEE_FESTIVAL_KEY_V925,GOVEE_FESTIVAL_EVENT_V925,loadGoveeFestivalV925,planGoveeFestivalV925,applyGoveeFestivalV925,type GoveeFestivalSettingsV925} from '@/lib/goveeFestivalFxV925';
import {GOVEE_SPATIAL_KEY_V926,GOVEE_SPATIAL_EVENT_V926,loadGoveeSpatialV926,spatialIndexV926,planGoveeSpatialV926,applyGoveeSpatialV926,type GoveeSpatialSettingsV926} from '@/lib/goveeSpatialDirectorV926';
import {GOVEE_CALIBRATION_KEY_V927,GOVEE_CALIBRATION_EVENT_V927,loadGoveeCalibrationV927,
 goveeVisualAdvanceV927,compensatedGoveeWaveTimeV927,compensatedGoveeVerifiedTimeV927,
 type GoveeRoomCalibrationV927} from '@/lib/goveeRoomCalibrationV927';
import {loadConcertRoadmapV958,CONCERT_ROADMAP_EVENT_V958,CONCERT_ROADMAP_KEY_V958,
 composeConcertSceneV958,mixConcertRoomLookV937,resolveConcertRoleV935,recoveryDelayV930,safeFallbackV934,CONCERT_SIGNAL_EVENT_V933,
 type ConcertSettingsV958,type ConcertPhaseV958} from '@/lib/ultimateConcertRoadmapV958';
import {previousVerifiedConcertSceneV960,applyConcertContinuityV960} from '@/lib/concertContinuityV960';
import {governConcertLookV961} from '@/lib/goveeConcertGovernorV961';
import {GOVEE_ROOM_ATMOSPHERE_EVENT_V987,normalizeRoomAtmosphereSessionV987,planRoomAtmosphereV987,applyRoomAtmosphereV987,type RoomAtmosphereSessionV987} from '@/lib/goveeAtmosphereSyncV987';
import {getConcertTimelineV763} from '@/components/visualizer/concertTimelineBridgeV763';
import {GOVEE_SYNC_EVENT_V1027,GOVEE_SYNC_KEY_V1027,loadGoveeSyncV1027,visualAdvanceV1027,safeGoveeSyncProgressV1027,planGoveeSyncV1027,applyGoveeSyncV1027,type GoveeSyncSettingsV1027} from '@/lib/goveeConcertSyncV1027';
import {planConcertNarrativeV962,dimConcertNarrativeLookV962} from '@/lib/concertNarrativeV962';
import {planVerifiedConcertBridgeV963,dimConcertBridgeLookV963} from '@/lib/concertBridgeV963';
import {planConcertPeakRecoveryV964,dimConcertPeakRecoveryLookV964} from '@/lib/concertPeakRecoveryV964';
import {planConcertRoomWaveV965,dimConcertRoomWaveLookV965} from '@/lib/concertRoomWaveV965';
import {ALEXA_GOVEE_CUE_EVENT_V970,ALEXA_GOVEE_CONSENT_EVENT_V970,ALEXA_GOVEE_RESET_EVENT_V970,ALEXA_GOVEE_CUE_TTL_MS_V970,
 loadAlexaGoveeConsentV970,mayAcceptAlexaGoveeV970,applyAlexaGoveeLookV970,
 isAlexaGoveeCommandV970,type AlexaGoveeCueV970} from '@/lib/alexaGoveeV970';
import {ALEXA_LOCAL_ENABLED_KEY_V967} from '@/lib/alexaConcertV967';
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318,
 type TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
/** Client-mounted on the Vercel page. Commands go only to the Raspberry Pi's localhost Bridge.
 * Opt-in, paced per device, paused when tab hidden, and no automatic on/off operations.
 */
export function GoveeMusicSyncV909(){
 const {track,isPlaying,genre,progressMs,fetchedAt}=useMusic();
 const {metrics,active:microphoneActive}=useAudioAnalysis();
 const {preferences}=useUiPreferences();
 const goveeShowEnabledV1042=preferences.goveeShowSyncEnabledV1042===true;
 const goveeShowStrengthV1042=preferences.goveeShowSyncStrengthV1042??45;
 const concertDirectorEnabledV1048=preferences.arenaConcertDirectorEnabledV1048===true;
 const concertDirectorStrengthV1048=preferences.arenaConcertDirectorStrengthV1048??50;
 const liveConcertEnabledV1049=preferences.arenaLiveConcertEnabledV1049===true;
 const liveConcertStrengthV1049=preferences.arenaLiveConcertStrengthV1049??50;
 const arenaShowEnabledV1040=preferences.arenaShowDesignerEnabledV1040===true;
 const arenaShowPlanV1040=preferences.arenaShowPlanV1040;
 const showStageIsArenaV1042=preferences.stageTheme==='arena360';
 const reducedMotionV1042=preferences.reducedMotion===true;
 const [config,setConfig]=useState<GoveeConfigV909|null>(null);
 const [showLibrary,setShowLibrary]=useState<GoveeShowV912[]>([]);
 const [groups,setGroups]=useState<GoveeGroupLibraryV915>(EMPTY_GOVEE_GROUPS_V915);
 const [bassSettings,setBassSettings]=useState<GoveeBassSettingsV917>(loadGoveeBassV917);
 const [beatSettings,setBeatSettings]=useState<GoveeBeatSettingsV918>(loadGoveeBeatV918);
 const [sectionSettings,setSectionSettings]=useState<GoveeSectionSettingsV919>(loadGoveeSectionV919);
 const [genreSettings,setGenreSettings]=useState<GoveeGenreSettingsV920>(loadGoveeGenreV920);
 const [cinematicSettings,setCinematicSettings]=useState<GoveeConcertSyncSettingsV921>(loadGoveeCinematicV921);
 const [shockSettings,setShockSettings]=useState<GoveeShockwaveSettingsV922>(loadGoveeShockwaveV922);
 const [neonSettings,setNeonSettings]=useState<GoveeNeonSettingsV923>(loadGoveeNeonV923);
 const [energySettings,setEnergySettings]=useState<GoveeEnergySettingsV924>(loadGoveeEnergyV924);
 const [festivalSettings,setFestivalSettings]=useState<GoveeFestivalSettingsV925>(loadGoveeFestivalV925);
 const [spatialSettings,setSpatialSettings]=useState<GoveeSpatialSettingsV926>(loadGoveeSpatialV926);
 const [calibrationSettings,setCalibrationSettings]=useState<GoveeRoomCalibrationV927>(loadGoveeCalibrationV927);
 const [syncSettingsV1027,setSyncSettingsV1027]=useState<GoveeSyncSettingsV1027>(loadGoveeSyncV1027);
 const [roadmapSettings,setRoadmapSettings]=useState<ConcertSettingsV958>(loadConcertRoadmapV958);
 const stageCueV921=useRef<GoveeStageCueV921|null>(null);
 const roomAtmosphereV987=useRef<RoomAtmosphereSessionV987|null>(null);
 useEffect(()=>{
  const receive=(event:Event)=>{
   const detail=(event as CustomEvent<unknown>).detail;
   roomAtmosphereV987.current=normalizeRoomAtmosphereSessionV987(detail);
  };
  const revoke=()=>{const cfg=loadGoveeConfigV909();
   if(!cfg.enabled||!cfg.autoSync||!cfg.token||!cfg.selectedIps.length)
    roomAtmosphereV987.current=null;};
  window.addEventListener(GOVEE_ROOM_ATMOSPHERE_EVENT_V987,receive);
  window.addEventListener(GOVEE_CONFIG_EVENT_V909,revoke);
  return()=>{roomAtmosphereV987.current=null;
   window.removeEventListener(GOVEE_ROOM_ATMOSPHERE_EVENT_V987,receive);
   window.removeEventListener(GOVEE_CONFIG_EVENT_V909,revoke);};
 },[]);
 const alexaGoveeCueV970=useRef<AlexaGoveeCueV970|null>(null);
 useEffect(()=>{
  const receive=(event:Event)=>{
   const data=(event as CustomEvent<{command?:unknown;createdAt?:unknown}>).detail;
   const command=data?.command;const createdAt=data?.createdAt;
   const consent=loadAlexaGoveeConsentV970();const settings=loadGoveeConfigV909();
   let receiver:{enabled?:boolean;since?:number}|null=null;
   try{receiver=JSON.parse(localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967)||'null');}catch{/* fail closed */}
   // Runtime recheck: a stale browser message cannot grant consent or enable Govee.
   if(isAlexaGoveeCommandV970(command)&&typeof createdAt==='number'&&
    mayAcceptAlexaGoveeV970(command,consent,settings,receiver?.enabled===true,receiver?.since??0,createdAt))
    alexaGoveeCueV970.current=command==='govee-auto'?null:{command,receivedAt:Date.now()};
  };
  const revoke=()=>{const cfg=loadGoveeConfigV909();
   let receiver:{enabled?:boolean}|null=null;
   try{receiver=JSON.parse(localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967)||'null');}catch{/* fail closed */}
   if(!loadAlexaGoveeConsentV970().enabled||!cfg.enabled||!cfg.autoSync||receiver?.enabled!==true)
    alexaGoveeCueV970.current=null;};
  const reset=()=>{alexaGoveeCueV970.current=null;};
  window.addEventListener(ALEXA_GOVEE_CUE_EVENT_V970,receive);
  window.addEventListener(ALEXA_GOVEE_CONSENT_EVENT_V970,revoke);
  window.addEventListener(ALEXA_GOVEE_RESET_EVENT_V970,reset);
  window.addEventListener('storage',revoke);
  window.addEventListener(GOVEE_CONFIG_EVENT_V909,revoke);
  return()=>{alexaGoveeCueV970.current=null;
   window.removeEventListener(ALEXA_GOVEE_CUE_EVENT_V970,receive);
   window.removeEventListener(ALEXA_GOVEE_CONSENT_EVENT_V970,revoke);
   window.removeEventListener(ALEXA_GOVEE_RESET_EVENT_V970,reset);
   window.removeEventListener('storage',revoke);
   window.removeEventListener(GOVEE_CONFIG_EVENT_V909,revoke);};
 },[]);
 // An unchanged audio snapshot is NOT a fresh beat measurement.
 const metricSeen=useRef({current:metrics,observedAt:Date.now()});
 if(metricSeen.current.current!==metrics)metricSeen.current={current:metrics,observedAt:Date.now()};
 const live=useRef({track,isPlaying,genre,progressMs,fetchedAt,metrics,microphoneActive,observedAt:metricSeen.current.observedAt});
 const analysis=useRef<TrackAnalysisV318|null>(null);
 live.current={track,isPlaying,genre,progressMs,fetchedAt,metrics,microphoneActive,observedAt:metricSeen.current.observedAt};
 useEffect(()=>{
  const refresh=()=>setConfig(loadGoveeConfigV909());
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===GOVEE_CONFIG_KEY_V909)refresh();};
  refresh();window.addEventListener(GOVEE_CONFIG_EVENT_V909,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_CONFIG_EVENT_V909,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // V930–V958 settings refresh via storage events; no new UDP or sampling timer.
 useEffect(()=>{
  const read=()=>setRoadmapSettings(loadConcertRoadmapV958());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===CONCERT_ROADMAP_KEY_V958)read();};
  read();window.addEventListener(CONCERT_ROADMAP_EVENT_V958,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(CONCERT_ROADMAP_EVENT_V958,read);window.removeEventListener('storage',storage);};
 },[]);
 // V927 calibrated visible-lag offsets are opt-in and never use diagnostic RTT for timing.
 useEffect(()=>{
  const read=()=>setCalibrationSettings(loadGoveeCalibrationV927());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_CALIBRATION_KEY_V927)read();};
  read();window.addEventListener(GOVEE_CALIBRATION_EVENT_V927,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_CALIBRATION_EVENT_V927,read);window.removeEventListener('storage',storage);};
 },[]);
 // V926 opt-in room coordinates are saved locally (not read from a draft).
 useEffect(()=>{
  const refresh=()=>setSpatialSettings(loadGoveeSpatialV926());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_SPATIAL_KEY_V926)refresh();};
  refresh();window.addEventListener(GOVEE_SPATIAL_EVENT_V926,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_SPATIAL_EVENT_V926,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // Saved show edits are applied on the same tab and on other tabs, but drafts never change live lighting.
 useEffect(()=>{
  const refresh=()=>setShowLibrary(loadGoveeShowsV912());
  const storage=(e:StorageEvent)=>{if(e.key===GOVEE_SHOWS_KEY_V912||e.key===null)refresh();};
  refresh();window.addEventListener(GOVEE_SHOWS_EVENT_V912,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_SHOWS_EVENT_V912,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // Group edits are opt-in and saved; unsaved drafts never change the live lighting.
 useEffect(()=>{
  const refresh=()=>setGroups(loadGoveeGroupsV915());
  const storage=(e:StorageEvent)=>{if(e.key===GOVEE_GROUPS_KEY_V915||e.key===null)refresh();};
  refresh();window.addEventListener(GOVEE_GROUPS_EVENT_V915,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_GROUPS_EVENT_V915,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // Saved V917 bass preferences are opt-in and apply on this tab and other tabs.
 useEffect(()=>{
  const read=()=>setBassSettings(loadGoveeBassV917());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_BASS_KEY_V917)read();};
  read();window.addEventListener(GOVEE_BASS_EVENT_V917,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_BASS_EVENT_V917,read);window.removeEventListener('storage',storage);};
 },[]);
 // V918 changes apply across tabs; disabled by default and never enable the microphone.
 useEffect(()=>{
  const read=()=>setBeatSettings(loadGoveeBeatV918());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_BEAT_KEY_V918)read();};
  read();window.addEventListener(GOVEE_BEAT_EVENT_V918,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_BEAT_EVENT_V918,read);window.removeEventListener('storage',storage);};
 },[]);
 // V919 settings are browser-local, opt-in and never enable LAN or microphone by themselves.
 useEffect(()=>{
  const read=()=>setSectionSettings(loadGoveeSectionV919());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_SECTION_KEY_V919)read();};
  read();window.addEventListener(GOVEE_SECTION_EVENT_V919,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_SECTION_EVENT_V919,read);window.removeEventListener('storage',storage);};
 },[]);
 // V920 is opt-in and tracks cross-tab settings; it never enables Govee or the microphone.
 useEffect(()=>{
  const read=()=>setGenreSettings(loadGoveeGenreV920());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_GENRE_KEY_V920)read();};
  read();window.addEventListener(GOVEE_GENRE_EVENT_V920,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_GENRE_EVENT_V920,read);window.removeEventListener('storage',storage);};
 },[]);
 // V921 stage signal comes from the mounted 3D scene; not a fabricated replay of
 // camera data. A source unmount/pause immediately invalidates the signal.
 useEffect(()=>{
  const receive=(event:Event)=>{
   const cue=(event as CustomEvent<GoveeStageCueV921>).detail;
   stageCueV921.current=cue&&typeof cue.trackId==='string'&&cue.playing?cue:null;
  };
  window.addEventListener(GOVEE_STAGE_CUE_EVENT_V921,receive);
  return()=>{window.removeEventListener(GOVEE_STAGE_CUE_EVENT_V921,receive);stageCueV921.current=null;};
 },[]);
 useEffect(()=>{
  const refresh=()=>setCinematicSettings(loadGoveeCinematicV921());
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===GOVEE_CINEMATIC_KEY_V921)refresh();};
  refresh();window.addEventListener(GOVEE_CINEMATIC_EVENT_V921,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_CINEMATIC_EVENT_V921,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // V922 shockwave intensity and direction are opt-in, with cross-tab updates.
 useEffect(()=>{
  const refresh=()=>setShockSettings(loadGoveeShockwaveV922());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_SHOCKWAVE_KEY_V922)refresh();};
  refresh();window.addEventListener(GOVEE_SHOCKWAVE_EVENT_V922,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_SHOCKWAVE_EVENT_V922,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // V923 remains opt-in; saved settings are synchronized across tabs.
 useEffect(()=>{
  const refresh=()=>setNeonSettings(loadGoveeNeonV923());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_NEON_KEY_V923)refresh();};
  refresh();window.addEventListener(GOVEE_NEON_EVENT_V923,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_NEON_EVENT_V923,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // V924 is an opt-in, browser-local energy layer. No new LAN timers, commands or credentials.
 useEffect(()=>{
  const refresh=()=>setEnergySettings(loadGoveeEnergyV924());
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===GOVEE_ENERGY_KEY_V924)refresh();};
  refresh();window.addEventListener(GOVEE_ENERGY_EVENT_V924,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_ENERGY_EVENT_V924,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // V925 settings update without a second network loop or any new bridge endpoints.
 useEffect(()=>{
  const refresh=()=>setFestivalSettings(loadGoveeFestivalV925());
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===GOVEE_FESTIVAL_KEY_V925)refresh();};
  refresh();window.addEventListener(GOVEE_FESTIVAL_EVENT_V925,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_FESTIVAL_EVENT_V925,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // V1027 is an explicit opt-in layer inside the existing sender. No extra LAN timer.
 useEffect(()=>{
  const refresh=()=>setSyncSettingsV1027(loadGoveeSyncV1027());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_SYNC_KEY_V1027)refresh();};
  refresh();window.addEventListener(GOVEE_SYNC_EVENT_V1027,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_SYNC_EVENT_V1027,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // Never use section cues imported for a different track; refresh immediately on V318 imports.
 useEffect(()=>{
  const read=()=>{analysis.current=readTrackAnalysisV318(track?.id??'');};
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===ANALYSIS_STORAGE_KEY_V318)read();};
  read();window.addEventListener(ANALYSIS_EVENT_V318,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,read);window.removeEventListener('storage',storage);};
 },[track?.id]);
 useEffect(()=>{
  if(!config?.enabled||!config.autoSync||!config.token||!config.selectedIps.length)return;
  let cancelled=false;let busy=false;let retryAt=0;let lastDevicesAt=0;
  const registered=new Set<string>();const sent=new Map<string,GoveeLookV909>();
  const deviceSkus=new Map<string,string>();const deviceRetry=new Map<string,number>();
  const deviceFailures=new Map<string,number>();const recoveringDevices=new Set<string>();let bridgeFailures=0;
  // High-frequency sampling is LOCAL only; UDP is rate-limited below.
  let envelope=resetGoveeBassEnvelopeV917();let lastTrack='';
  let shockwave=resetGoveeShockwaveV922();
  let beatDispatch=resetGoveeBeatDispatchV918();let lastBeatTrack='';
  const sample=()=>{
   const state=live.current;
   const sampleAt=Date.now();
   const fresh=state.microphoneActive&&sampleAt-state.observedAt<=1500;
   if(cancelled||document.hidden||!state.isPlaying||!state.track||!fresh||(!bassSettings.enabled&&!shockSettings.enabled&&!(neonSettings.enabled&&neonSettings.mode==='bass'))){
    envelope=resetGoveeBassEnvelopeV917();shockwave=resetGoveeShockwaveV922();lastTrack='';return;
   }
   if(state.track.id!==lastTrack){envelope=resetGoveeBassEnvelopeV917();shockwave=resetGoveeShockwaveV922();lastTrack=state.track.id;}
   // Reuse V917's real measured onset detector even when only V922 is enabled.
   // V917's brightness overlay still respects its own independent enabled flag.
   envelope=stepGoveeBassEnvelopeV917(envelope,state.metrics,sampleAt,
    bassSettings.enabled?bassSettings:{...bassSettings,enabled:true},true);
   shockwave=stepGoveeShockwaveV922(shockwave,envelope,sampleAt,state.track.id,fresh,shockSettings);
  };
  const sampler=window.setInterval(sample,120);
  const neonBassEnabled=neonSettings.enabled&&neonSettings.mode==='bass';

  const tick=async()=>{
   if(cancelled||busy||document.hidden||!navigator.onLine||Date.now()<retryAt)return;
   const state=live.current;if(!state.isPlaying||!state.track)return;
   const now=Date.now();
   if(lastBeatTrack!==state.track.id){beatDispatch=resetGoveeBeatDispatchV918();lastBeatTrack=state.track.id;}
   // 120ms local scheduler; commands are still at least 900ms apart. Only
   // fresh, confidence-locked microphone beats receive early LAN dispatches.
   const decision=planGoveeBeatDispatchV918(beatDispatch,state.metrics,now,state.observedAt,
    beatSettings,state.microphoneActive,bassSettings.enabled||shockSettings.enabled||neonBassEnabled?900:1700);
   if(!decision.send)return;
   beatDispatch=decision.dispatch;
   busy=true;
   try{
    if(Date.now()-lastDevicesAt>60000){
     // Read-only inventory is cached for automatic model roles, no repeated multicast scans.
     const inventory=await goveeBridgeRequestV909<{devices:GoveeDeviceV909[]}>(config,'/devices');
     if(cancelled)return;
     deviceSkus.clear();for(const item of inventory.devices)deviceSkus.set(item.ip,item.sku);
     lastDevicesAt=Date.now();bridgeFailures=0;
    }
    const progress=state.progressMs+Math.max(0,now-(state.fetchedAt||now));
    // A previously approved atmosphere never survives a track switch.
    if(roomAtmosphereV987.current?.trackId!==state.track.id)
     roomAtmosphereV987.current=null;
    const phase=resolveGoveePhaseV911(analysis.current,state.track.id,progress);
    // V1042 uses the SAME absolute Spotify timeline as the 360° stage.
    // The local scene template cannot invent verified drops or downbeats.
    const baseGoveeShowV1040=sampleArenaShowPlanV1040(arenaShowPlanV1040,{
     enabled:arenaShowEnabledV1040&&goveeShowEnabledV1042,
     playing:state.isPlaying,reducedMotion:reducedMotionV1042,
     progressMs:progress,durationMs:state.track.durationMs,
     observedSection:phase.verified?phase.phase:null});
    const arrangedGoveeShowV1048=directArenaShowV1048({
      enabled:concertDirectorEnabledV1048&&arenaShowEnabledV1040&&goveeShowEnabledV1042,
      stageIsArena:showStageIsArenaV1042,playing:state.isPlaying,
      reducedMotion:reducedMotionV1042,show:baseGoveeShowV1040,
      plan:arenaShowPlanV1040,trackId:state.track.id,progressMs:progress,
      durationMs:state.track.durationMs,strength:concertDirectorStrengthV1048}).show;
    // V1049 only attenuates the existing optional Govee cue, using fresh microphone data.
    const authoredGoveeShowV1042=directLiveConcertV1049({
      enabled:liveConcertEnabledV1049&&goveeShowEnabledV1042&&arenaShowEnabledV1040,
      stageIsArena:showStageIsArenaV1042,playing:state.isPlaying,
      microphoneActive:state.microphoneActive,reducedMotion:reducedMotionV1042,
      show:arrangedGoveeShowV1048,audio:state.metrics,strength:liveConcertStrengthV1049,
      sampleAgeMs:now-state.observedAt}).show;
    const sectionDecision=config.directorEnabledV911?planGoveeSectionV919(analysis.current,state.track.id,progress,sectionSettings):null;
    const genreDecision=sectionDecision?planGoveeGenreV920(analysis.current,state.track.id,progress,state.genre,sectionDecision,genreSettings):null;
    const energyDecision=sectionDecision?planGoveeEnergyV924(analysis.current,state.track.id,progress,state.genre,sectionDecision,energySettings):null;
    const show=config.showEnabledV912&&config.directorEnabledV911?showLibrary.find(item=>item.id===config.selectedShowIdV912):undefined;
    // V939/V945/V946: deterministic whole-song scene; never invent confirmed phases.
    const sourceSections=analysis.current?.trackId===state.track.id?analysis.current.sections:[];
    const sectionIndex=sourceSections.findIndex(s=>s.startMs<=progress&&progress<s.startMs+s.durationMs);
    const sourceSection=sectionIndex>=0?sourceSections[sectionIndex]:null;
    const stageValid=validGoveeStageCueV921(stageCueV921.current,state.track.id,progress,now);
    const stage=stageValid?stageCueV921.current:null;
    const roadmapScene=roadmapSettings.enabled?composeConcertSceneV958({
      trackId:state.track.id,progressMs:progress,durationMs:state.track.durationMs,
      phase:phase.verified?phase.phase as ConcertPhaseV958:'verse',
      sectionIndex:Math.max(0,sectionIndex),sectionStartMs:sourceSection?.startMs??progress,
      verified:phase.verified&&sectionIndex>=0,genre:String(state.genre??''),
      energy:state.metrics.energyEnvelope??0,bass:state.metrics.bass??0,
      lyricsVisible:stage?.lyricsVisible??false,reducedMotion:stage?.reducedMotion??false,
      stageCamera:stage?.cameraShot,stageFormation:stage?.danceFormation,
      authoredStage:stage?.source==='authored'},roadmapSettings):null;
    const priorSceneV960=roadmapScene&&(roadmapSettings.transitionsV960||roadmapSettings.narrativeV962)?previousVerifiedConcertSceneV960({
      analysis:analysis.current,trackId:state.track.id,sectionIndex,
      durationMs:state.track.durationMs,genre:String(state.genre??''),
      energy:state.metrics.energyEnvelope??0,bass:state.metrics.bass??0,
      lyricsVisible:stage?.lyricsVisible??false,reducedMotion:stage?.reducedMotion??false,
      settings:roadmapSettings}):null;
    const continuousSceneV960=roadmapScene?applyConcertContinuityV960(roadmapScene,priorSceneV960,
      progress-(sourceSection?.startMs??progress),roadmapSettings,{
       manualStage:stage?.source==='authored',savedShowActive:Boolean(show),
       reducedMotion:stage?.reducedMotion??false}).scene:null;
    // V962: plan once per existing send batch. No new LAN tick, audio polling or network request.
    const narrativeV962=continuousSceneV960?planConcertNarrativeV962(continuousSceneV960,priorSceneV960,{
     enabled:roadmapSettings.enabled&&roadmapSettings.hardwareSync&&roadmapSettings.narrativeV962,
     playing:state.isPlaying,elapsedMs:progress-(sourceSection?.startMs??progress),
     sectionDurationMs:sourceSection?.durationMs??0,
     savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored',
     reducedMotion:stage?.reducedMotion??false}):null;
    const narrativeSceneV962=narrativeV962?.scene??continuousSceneV960;
    // V963: verified NEXT phase only, planned once for the existing batch of LAN cues.
    const bridgeV963=planVerifiedConcertBridgeV963(narrativeSceneV962,analysis.current,
     state.track.id,sectionIndex,progress,{enabled:roadmapSettings.enabled&&
      roadmapSettings.hardwareSync&&roadmapSettings.bridgeV963,playing:state.isPlaying,
      savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored',
      reducedMotion:stage?.reducedMotion??false});
    // V964: a verified POST-peak quiet window, planned once per existing batch.
    const peakRecoveryV964=planConcertPeakRecoveryV964(narrativeSceneV962,analysis.current,
     state.track.id,sectionIndex,progress,{enabled:roadmapSettings.enabled&&roadmapSettings.hardwareSync&&roadmapSettings.peakRecoveryV964,
      playing:state.isPlaying,savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored',
      reducedMotion:stage?.reducedMotion??false});
    // V965 is a pure, slow room wave computed ONCE per existing LAN batch.
    const roomWaveV965=planConcertRoomWaveV965(narrativeSceneV962,analysis.current,
     state.track.id,sectionIndex,progress,{enabled:roadmapSettings.enabled&&roadmapSettings.hardwareSync&&roadmapSettings.roomWaveV965,
      playing:state.isPlaying,savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored',
      reducedMotion:stage?.reducedMotion??false});
    const shared={genre:String(state.genre??''),progressMs:progress,durationMs:state.track.durationMs,
     metrics:state.metrics,microphoneActive:state.microphoneActive,config};
    for(const ip of config.selectedIps){
     if(cancelled||document.hidden||!live.current.isPlaying||live.current.track?.id!==state.track.id)break;
     if((deviceRetry.get(ip)??0)>Date.now())continue;
     try{
      if(!registered.has(ip)){
       const add=await goveeBridgeRequestV909<{device:GoveeDeviceV909}>(config,'/devices/add','POST',{ip});
       if(cancelled)break;
       registered.add(ip);
       if(add.device.sku)deviceSkus.set(ip,add.device.sku);
      }
      const group=findActiveGoveeGroupV915(groups,ip,config.selectedIps);
      const sourceIp=getGoveeGroupSourceIpV915(group,ip,config.selectedIps);
      // Synchron groups share a single V911/V914 cue. Individual groups retain each lamp's role.
      const selection=group?.mode==='unison'?group.role:config.deviceRolesV911[ip];
      const role=resolveGoveeRoleV911(selection,deviceSkus.get(sourceIp));
      const devicePhase=show?resolveGoveePhaseV911(analysis.current,state.track.id,progress,getGoveeFadeMsV912(show,sourceIp,phase.phase)):phase;
      // Legacy planGoveeShowLookV912 is reused inside the V914 planner.
      const planned=show
       ?planGoveeAdvancedShowLookV914({...shared,phase:devicePhase,role,show,ip:sourceIp})
       :config.directorEnabledV911?planGoveeConcertLookV911({...shared,phase,role}):planGoveeLookV909(shared);
      // V917 overlays measured kicks, V918 adds a small pre-beat cue only
      // for the current scheduled batch. Saved show/group settings remain authoritative.
      const sectionLook=sectionDecision?applyGoveeSectionV919(planned,sectionDecision,role,sectionSettings,config.masterBrightness):planned;
      const unboosted=genreDecision?applyGoveeGenreV920(sectionLook,genreDecision,role,genreSettings,config.masterBrightness):sectionLook;
      const bassLook=applyGoveeBassLookV917(unboosted,role,envelope,bassSettings,config.masterBrightness,state.microphoneActive);
      const freshAccent=decision.accent && Date.now()-now<=Math.max(120,beatSettings.leadMs+100);
      const base=applyGoveePredictedLookV918(bassLook,role,beatSettings,freshAccent,config.masterBrightness);
      // V921 gently adapts existing light cues to the SAME show signals rendered
      // by ThreeAvatar (V354/V356/lyrics); never starts additional UDP polling.
      const cinematicDecision=config.directorEnabledV911
       ?planGoveeCinematicV921(stageCueV921.current,state.track.id,progress,Date.now(),role,cinematicSettings):null;
      // Preserve V915's established baseline and apply its group dimmer to any
      // V921-adjusted cue BEFORE dispatch. One pure extra calculation, no extra LAN request.
      const target=applyGoveeGroupBrightnessV915(base,group,config.masterBrightness);
      const coordinated=cinematicDecision?.active
       ?applyGoveeGroupBrightnessV915(
         applyGoveeCinematicV921(base,cinematicDecision,cinematicSettings,config.masterBrightness),group,config.masterBrightness)
       :target;
      // V922 adds a spatially ordered measured-bass crest to the V921-adjusted cue.
      // Apply V915 group dimming LAST so group limits remain authoritative.
      // This is still the same per-device command pass, not another UDP request.
      const position=config.selectedIps.indexOf(ip);
      // V926 changes ORDER, not UDP cadence or hardware addressing. Group unison
      // uses the saved source lamp; when V926 is off the exact legacy indices apply.
      const spatialSource=spatialSettings.enabled?sourceIp:ip;
      const spatialPosition=spatialIndexV926(config.selectedIps,spatialSource,spatialSettings);
      // V927: per-fixture MANUAL visible-lag offset, not network-RTT inference.
      // Planning phase is advanced; the existing UDP cadence is unchanged.
      const visualAdvance=goveeVisualAdvanceV927(ip,config.selectedIps,calibrationSettings);
      const waveNow=visualAdvance>0?compensatedGoveeWaveTimeV927(Date.now(),ip,config.selectedIps,calibrationSettings):Date.now();
      const waveProgress=compensatedGoveeWaveTimeV927(progress,ip,config.selectedIps,calibrationSettings);
      const verifiedWaveProgress=compensatedGoveeVerifiedTimeV927(analysis.current,state.track.id,progress,ip,config.selectedIps,calibrationSettings);
      const shockDecision=planGoveeShockwaveV922(shockwave,spatialPosition,config.selectedIps.length,waveNow,shockSettings);
      const roomLook=shockDecision.active
       ?applyGoveeGroupBrightnessV915(
         applyGoveeShockwaveV922(cinematicDecision?.active
          ?applyGoveeCinematicV921(base,cinematicDecision,cinematicSettings,config.masterBrightness):base,
          shockDecision,shockSettings,config.masterBrightness),group,config.masterBrightness)
       :coordinated;
      const previous=sent.get(ip);
      // V923 is a long-duration whole-lamp neon movement, not a second LAN loop.
      // Compute from the *pre-group* V921/V922 look and apply V915 group dimming
      // LAST, including for the neon pulse. Keep legacy roomLook byte-for-byte
      // when V923 is disabled; no previously saved show is rewritten.
      const neonDecision=planGoveeNeonV923({progressMs:waveProgress,genre:state.genre,role,
       deviceIndex:spatialPosition,deviceCount:config.selectedIps.length,
       microphoneFresh:state.microphoneActive&&lastTrack===state.track.id&&Date.now()-state.observedAt<=1500,
       now:waveNow,envelope},neonSettings);
      const neonLook=neonDecision.active?applyGoveeGroupBrightnessV915(
       applyGoveeNeonV923(
        shockDecision.active?applyGoveeShockwaveV922(
         cinematicDecision?.active?applyGoveeCinematicV921(base,cinematicDecision,cinematicSettings,config.masterBrightness):base,
         shockDecision,shockSettings,config.masterBrightness)
        :cinematicDecision?.active?applyGoveeCinematicV921(base,cinematicDecision,cinematicSettings,config.masterBrightness):base,
        neonDecision,neonSettings,config.masterBrightness),group,config.masterBrightness):roomLook;
      // V924 applies to the *pre-group* combined concert look and only then
      // reapplies the V915 group limiter. When disabled the old neonLook/look
      // path is completely unchanged. It adds no extra Govee LAN requests.
      const energyLook=energyDecision?.active?applyGoveeGroupBrightnessV915(
       applyGoveeEnergyV924(
        applyGoveeNeonV923(
         shockDecision.active?applyGoveeShockwaveV922(
          cinematicDecision?.active?applyGoveeCinematicV921(base,cinematicDecision,cinematicSettings,config.masterBrightness):base,
          shockDecision,shockSettings,config.masterBrightness)
         :cinematicDecision?.active?applyGoveeCinematicV921(base,cinematicDecision,cinematicSettings,config.masterBrightness):base,
         neonDecision,neonSettings,config.masterBrightness),
        energyDecision,role,energySettings,config.masterBrightness),group,config.masterBrightness):neonLook;
      const look=config.directorEnabledV911||neonDecision.active?easeGoveeLookV911(previous,neonLook):neonLook;
      const deliveredLook=energyDecision?.active?easeGoveeLookV911(previous,energyLook):look;
      // V925 Festival Studio is computed from the CURRENT verified V919 cue.
      // Unison device groups share the same physical source index: they stay in
      // unison even during sweeps. Reconstruct the ungrouped combined look ONLY
      // when active, then apply the V915 dimmer LAST before existing V911 easing.
      const festivalPosition=spatialIndexV926(config.selectedIps,sourceIp,spatialSettings);
      const festivalDecision=planGoveeFestivalV925(analysis.current,state.track.id,verifiedWaveProgress,
       sectionDecision,state.genre,festivalPosition,config.selectedIps.length,festivalSettings);
      let festivalDeliveredLook=deliveredLook;
      let spatialBaseUngrouped:GoveeLookV909|null=null;
      if(festivalDecision.active){
       const ungroupedCinematic=cinematicDecision?.active
        ?applyGoveeCinematicV921(base,cinematicDecision,cinematicSettings,config.masterBrightness):base;
       const ungroupedShock=shockDecision.active
        ?applyGoveeShockwaveV922(ungroupedCinematic,shockDecision,shockSettings,config.masterBrightness):ungroupedCinematic;
       const ungroupedNeon=neonDecision.active
        ?applyGoveeNeonV923(ungroupedShock,neonDecision,neonSettings,config.masterBrightness):ungroupedShock;
       const ungroupedEnergy=energyDecision?.active
        ?applyGoveeEnergyV924(ungroupedNeon,energyDecision,role,energySettings,config.masterBrightness):ungroupedNeon;
       const festivalUngrouped=applyGoveeFestivalV925(ungroupedEnergy,festivalDecision,role,festivalSettings,config.masterBrightness);
       spatialBaseUngrouped=festivalUngrouped;
       const festivalGrouped=applyGoveeGroupBrightnessV915(festivalUngrouped,group,config.masterBrightness);
       festivalDeliveredLook=easeGoveeLookV911(previous,festivalGrouped);
      }
      // V926 is a purely spatial, opt-in crest. It uses the SAME per-device
      // command pass and is always applied BEFORE final V915 dimming/easing.
      // Recompute pre-group source look only if the new director is active.
      const spatialDecision=planGoveeSpatialV926(config.selectedIps,sourceIp,waveProgress,state.genre,spatialSettings);
      if(spatialDecision.active){
       if(!spatialBaseUngrouped){
        const ungCinematic=cinematicDecision?.active
         ?applyGoveeCinematicV921(base,cinematicDecision,cinematicSettings,config.masterBrightness):base;
        const ungShock=shockDecision.active
         ?applyGoveeShockwaveV922(ungCinematic,shockDecision,shockSettings,config.masterBrightness):ungCinematic;
        const ungNeon=neonDecision.active
         ?applyGoveeNeonV923(ungShock,neonDecision,neonSettings,config.masterBrightness):ungShock;
        spatialBaseUngrouped=energyDecision?.active
         ?applyGoveeEnergyV924(ungNeon,energyDecision,role,energySettings,config.masterBrightness):ungNeon;
       }
       const spatialUngrouped=applyGoveeSpatialV926(spatialBaseUngrouped,spatialDecision,role,spatialSettings,config.masterBrightness);
       festivalDeliveredLook=easeGoveeLookV911(previous,
        applyGoveeGroupBrightnessV915(spatialUngrouped,group,config.masterBrightness));
      }
      // V937 is post-processing in the EXISTING per-fixture dispatch only.
      // It may dim the existing group-capped brightness, never exceed group caps.
      // Saved V912 shows and authored V354 stages are protected by hard gates.
      const role958=resolveConcertRoleV935(ip,roadmapSettings,role);
      const mixed=narrativeSceneV962?mixConcertRoomLookV937(festivalDeliveredLook,narrativeSceneV962,role958,roadmapSettings,
       {savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored'}):festivalDeliveredLook;
      const narrativeLookV962=narrativeV962?dimConcertNarrativeLookV962(mixed,narrativeV962):mixed;
      // V963 sits after V962 dimming and before V961's final rate-of-change cap.
      const bridgeLookV963=recoveringDevices.has(ip)?narrativeLookV962:dimConcertBridgeLookV963(narrativeLookV962,bridgeV963);
      const peakLookV964=recoveringDevices.has(ip)?bridgeLookV963:dimConcertPeakRecoveryLookV964(bridgeLookV963,peakRecoveryV964);
      const roomWaveLookV965=recoveringDevices.has(ip)?peakLookV964:dimConcertRoomWaveLookV965(
       peakLookV964,roomWaveV965,config.selectedIps.indexOf(sourceIp),config.selectedIps.length);
      const plannedLook=roadmapScene&&roadmapSettings.hardwareSync
       ?easeGoveeLookV911(previous,{...peakLookV964,brightness:Math.min(festivalDeliveredLook.brightness,roomWaveLookV965.brightness)})
       :festivalDeliveredLook;
      // V934: a lamp that just reconnected gets ONE calm, dimmed recovery look.
      // This is opt-in and never interferes with existing V912 shows or manual input.
      const recoveryLookV961=recoveringDevices.has(ip)&&roadmapSettings.enabled&&roadmapSettings.hardwareSync&&!show&&stage?.source!=='authored'
       ?easeGoveeLookV911(previous,safeFallbackV934(plannedLook)):plannedLook;
      // V970: ephemeral opted-in voice overlay inside the existing LAN dispatch.
      // Never enables Govee, bypasses selected devices or introduces extra UDP sends.
      // V987: verified V763 scenes + explicit current-tab permission only.
      // Reuses this same V909 per-fixture send; V915/group caps stay the ceiling.
      const roomDecisionV987=planRoomAtmosphereV987(roomAtmosphereV987.current,
       getConcertTimelineV763(),state.track.id,state.track.durationMs,progress,Date.now(),{
        enabled:config.enabled&&config.autoSync,playing:state.isPlaying,visible:!document.hidden,
        savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored',
        recovering:recoveringDevices.has(ip),
        reducedMotion:Boolean(stage?.reducedMotion||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
        voiceActive:Boolean(alexaGoveeCueV970.current&&loadAlexaGoveeConsentV970().enabled&&
         now>=alexaGoveeCueV970.current.receivedAt&&
         now-alexaGoveeCueV970.current.receivedAt<=ALEXA_GOVEE_CUE_TTL_MS_V970)});
      const roomLookV987=applyRoomAtmosphereV987(recoveryLookV961,previous,roomDecisionV987,
       role,config.masterBrightness);
      const voiceLookV970=applyAlexaGoveeLookV970(roomLookV987,previous,alexaGoveeCueV970.current,config,{
       consent:loadAlexaGoveeConsentV970(),playing:state.isPlaying,visible:!document.hidden,
       savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored',
       recovering:recoveringDevices.has(ip),now:Date.now()});
      // V1027 uses only selected, explicitly assigned fixtures and verified V318
      // phase markers. The V927 and manual visual advances are MAXed, not added.
      // V915 group/master caps and V961 governor remain authoritative; no second LAN request.
      const advanceV1027=visualAdvanceV1027(syncSettingsV1027,ip,visualAdvance);
      // Never pre-trigger the NEXT section: V927's optical guard uses the same
      // rule. The greatest manual delay is applied only inside the present
      // verified section, so even an overlapping/adjacent hook is not invented.
      const nextStartV1027=sourceSections[sectionIndex+1]?.startMs??Infinity;
      const safeProgressV1027=safeGoveeSyncProgressV1027(progress,advanceV1027,
       sourceSection?.startMs??null,sourceSection?.durationMs??null,nextStartV1027);
      const verifiedPhaseV1027=resolveGoveePhaseV911(analysis.current,state.track.id,
       safeProgressV1027,syncSettingsV1027.transitionMs);
      const syncDecisionV1027=planGoveeSyncV1027({settings:syncSettingsV1027,ip,
       selectedIps:config.selectedIps,bridgeEnabled:config.enabled,autoSync:config.autoSync,
       directorEnabled:config.directorEnabledV911,playing:state.isPlaying,visible:!document.hidden,
       progressMs:progress,durationMs:state.track.durationMs,phase:verifiedPhaseV1027,
       savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored',
       roomAtmosphereActive:roomDecisionV987.active,groupUnisonActive:group?.mode==='unison',
       recovering:recoveringDevices.has(ip),reducedMotion:Boolean(stage?.reducedMotion||
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
       lyricsVisible:stage?.lyricsVisible??false,
       voiceActive:Boolean(alexaGoveeCueV970.current&&loadAlexaGoveeConsentV970().enabled&&
        now>=alexaGoveeCueV970.current.receivedAt&&now-alexaGoveeCueV970.current.receivedAt<=ALEXA_GOVEE_CUE_TTL_MS_V970),
       stageCamera:stage?.cameraShot});
      // The original V915 group-capped look is an additional ceiling; the
      // V1027 overlay cannot undo that cap even if an earlier overlay differs.
      const syncedLookV1027=applyGoveeSyncV1027(voiceLookV970,previous,syncDecisionV1027,
       Math.min(config.masterBrightness,festivalDeliveredLook.brightness));
      // V1042 is an optional post-V1027 accent. Higher-priority Govee looks,
      // user-authored shows and the existing V915/V961 safety ceiling always win.
      const authoredDecisionV1042=planGoveeShowV1042({enabled:goveeShowEnabledV1042,
       strength:goveeShowStrengthV1042,show:authoredGoveeShowV1042,
       genre:arenaShowPlanV1040?.genre??'pop',phase,settings:syncSettingsV1027,
       ip,selectedIps:config.selectedIps,bridgeEnabled:config.enabled,
       autoSync:config.autoSync,directorEnabled:config.directorEnabledV911,
       playing:state.isPlaying,visible:!document.hidden,stageIsArena:showStageIsArenaV1042,
       reducedMotion:reducedMotionV1042||Boolean(stage?.reducedMotion),
       savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored',
       groupUnisonActive:group?.mode==='unison',recovering:recoveringDevices.has(ip),
       voiceActive:Boolean(alexaGoveeCueV970.current&&loadAlexaGoveeConsentV970().enabled),
       roomAtmosphereActive:roomDecisionV987.active,higherPrioritySyncActive:syncDecisionV1027.active});
      const showLookV1042=applyGoveeShowV1042(syncedLookV1027,previous,authoredDecisionV1042,
       Math.min(config.masterBrightness,festivalDeliveredLook.brightness));
      const finalLook=governConcertLookV961(previous,showLookV1042,{
       enabled:roadmapSettings.enabled&&roadmapSettings.hardwareSync&&roadmapSettings.lightGovernorV961,
       playing:state.isPlaying,verified:Boolean(roadmapScene?.verified),
       savedShowActive:Boolean(show),authoredStageActive:stage?.source==='authored',
       recovering:recoveringDevices.has(ip)}).look;
      if(!changedGoveeLookV911(previous,finalLook))continue;
      await goveeBridgeRequestV909(config,'/command','POST',{ip,action:'look',value:finalLook});
      if(!cancelled){
       sent.set(ip,finalLook);deviceFailures.delete(ip);recoveringDevices.delete(ip);
       if(roadmapScene&&roadmapSettings.hardwareSync&&roadmapScene.verified&&!show&&stage?.source!=='authored'){
        window.dispatchEvent(new CustomEvent(CONCERT_SIGNAL_EVENT_V933,{detail:{
         fixture:config.selectedIps.indexOf(ip)+1,cue:roadmapScene.wall,phase:roadmapScene.phase,
         atMs:progress,brightness:finalLook.brightness,source:'ultimate-concert-v958'}}));
       }
      }
     }catch{
      // An unreachable single lamp must never disable the other selected lamps.
      registered.delete(ip);recoveringDevices.add(ip);const failures=(deviceFailures.get(ip)??0)+1;deviceFailures.set(ip,failures);
      deviceRetry.set(ip,Date.now()+recoveryDelayV930(failures,config.selectedIps.indexOf(ip)));
     }
    }
   }catch{bridgeFailures++;retryAt=Date.now()+recoveryDelayV930(bridgeFailures);}finally{busy=false;}
  };
  void tick();const interval=beatSettings.enabled
   ?window.setInterval(()=>void tick(),120)
   :bassSettings.enabled||shockSettings.enabled?window.setInterval(()=>void tick(),900)
   :neonBassEnabled?window.setInterval(()=>void tick(),900):window.setInterval(()=>void tick(),1700);
  return()=>{cancelled=true;window.clearInterval(interval);window.clearInterval(sampler);};
 },[config,showLibrary,groups,bassSettings,beatSettings,sectionSettings,genreSettings,cinematicSettings,shockSettings,neonSettings,energySettings,festivalSettings,spatialSettings,calibrationSettings,roadmapSettings,syncSettingsV1027,goveeShowEnabledV1042,goveeShowStrengthV1042,concertDirectorEnabledV1048,concertDirectorStrengthV1048,liveConcertEnabledV1049,liveConcertStrengthV1049,arenaShowEnabledV1040,arenaShowPlanV1040,showStageIsArenaV1042,reducedMotionV1042]);
 return null;
}
