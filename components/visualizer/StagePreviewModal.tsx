"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { createPortal } from "react-dom";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import {PreviewGlbPortraitV560,type GlbLipDiagnosticsV561} from "./PreviewGlbPortraitV560";
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {normalizeVocalAssignmentsV385,resolveManualVocalCueV385} from './manualVocalCastingV385';
import {concertLipSongClockV561} from './concertLipPreviewV561';
import {normalizeMouthCalibrationV562,mouthCalibrationCoverageV562} from "./advancedFacialCalibrationV562";
import {concertLipTimingV561,planConcertLipPreviewV561,type ConcertLipPreviewModeV561,type ConcertLipSongV561} from './concertLipPreviewV561';
import {auditConcertExperienceV570} from "./concertExperienceAuditV570";
import {selectDuetModelsV563,planRealDuetPreviewV563,sceneForRealDuetV563,type DuetPreviewModelV563,type DuetPreviewPartV563,type DuetPreviewRoleV563} from './realDuetPreviewV563';
import {ConcertDetailStageV555} from './ConcertDetailStageV555';
import {useAdaptivePerformance} from './adaptivePerformance';
import {DEFAULT_CONCERT_DETAILS_V555,type ConcertDetailSettingsV555} from './concertDetailEffectsV555';
import {concertPreviewV556,type ConcertPreviewModeV556} from './concertDetailPreviewV556';
import type { AudioFeatures } from "@/types/audio";
import { DynamicStage } from "@/components/visualizer/DynamicStage";
import { STAGE_ENVIRONMENTS, StageEnvironment, type StageEnvironmentId } from "@/components/visualizer/stages";

export type StagePreviewModalProps = {
  stageId: StageEnvironmentId;
  selectedStageId: StageEnvironmentId;
  onSelect: (id: StageEnvironmentId) => void;
  onClose: () => void;
  reactive: boolean;
  lightStrength: number;
  reducedMotion: boolean;
  concertDetailsV555?: ConcertDetailSettingsV555;
  avatarModelUrl?:string|null;
  duetModelsV563?:readonly DuetPreviewModelV563[];
};

const colors: Record<StageEnvironmentId, {fog:string; first:string; second:string}> = {
  classic: {fog:"#595d9c", first:"#8d78ff", second:"#66e7e8"},
  neon: {fog:"#262159", first:"#00efff", second:"#ff42ce"},
  festival: {fog:"#512658", first:"#ffb938", second:"#b453ff"},
  minimal: {fog:"#52606b", first:"#f5f8ff", second:"#99b4d4"},
  cyberpunk: {fog:"#3a1653", first:"#00f0ff", second:"#f32cc5"},
  vaporwave: {fog:"#50286e", first:"#ff86b7", second:"#67f0cc"},
  galaxy: {fog:"#292553", first:"#8da4ff", second:"#c766ff"},
  white: {fog:"#e3eaf4", first:"#ffffff", second:"#bed0e1"},
  rock: {fog:"#4c302b", first:"#ff9d3e", second:"#e53c37"},
};

const initialAudio: AudioFeatures = {
  bass: 0, mids: 0, highs: 0, volume: 0, beat: false, beatStrength: 0,
  bpm: 130, kick: 0, snare: 0, hiHat: 0, energyEnvelope: 0, attack: 0, decay: 0,
};

function PreviewBeatDriver({ audio, playing, enabled, reducedMotion }: {
  audio: AudioFeatures; playing: boolean; enabled: boolean; reducedMotion: boolean;
}) {
  useFrame(({clock}) => {
    const running = playing && enabled && !reducedMotion;
    const beats = (clock.elapsedTime * (audio.bpm ?? 130) / 60);
    const phase = beats - Math.floor(beats);
    const kick = running ? Math.exp(-phase * 12) : 0;
    audio.beat = running && phase < 0.12;
    audio.beatStrength = kick;
    audio.bass = running ? Math.min(1, .20 + kick * .7) : 0;
    audio.mids = running ? .18 + kick * .2 : 0;
    audio.highs = running ? .22 + kick * .1 : 0;
    audio.kick = kick;
    audio.attack = kick;
    audio.energyEnvelope = running ? .28 + kick * .5 : 0;
    audio.volume = running ? .3 + kick * .35 : 0;
    audio.kickAccentIntensity = kick;
    audio.kickAnticipation = running ? (phase > .8 ? (phase - .8) * 4 : 0) : 0;
  });
  return null;
}

function MovingSpotlight({ position, color, phase, moving, strength }: {
  position: [number,number,number]; color: string; phase: number; moving: boolean; strength: number;
}) {
  const group = useRef<Group>(null);
  useFrame(({clock}) => {
    if (!group.current) return;
    group.current.rotation.z = moving ? Math.sin(clock.elapsedTime * .65 + phase) * .22 : 0;
    group.current.rotation.x = moving ? Math.sin(clock.elapsedTime * .42 + phase * 1.4) * .12 : 0;
  });
  return <group ref={group} position={position}>
    <mesh position={[0,-1.4,0]}>
      <coneGeometry args={[.9,2.8,22,1,true]} />
      <meshBasicMaterial color={color} transparent opacity={.10 * strength} depthWrite={false} side={2} />
    </mesh>
    <mesh>
      <cylinderGeometry args={[.12,.18,.18,12]} />
      <meshStandardMaterial color="#33343a" metalness={.75} roughness={.35} />
    </mesh>
    <spotLight position={[0,-.14,0]} color={color} intensity={1.15 * strength} angle={.38} penumbra={.95} distance={9} />
  </group>;
}

function HazeCloud({ position, tint, phase, moving }: {
  position: [number,number,number]; tint: string; phase: number; moving: boolean;
}) {
  const root = useRef<Group>(null);
  useFrame(({clock}) => {
    if (!root.current || !moving) return;
    root.current.position.x = position[0] + Math.sin(clock.elapsedTime * .17 + phase) * .6;
    root.current.position.y = position[1] + Math.sin(clock.elapsedTime * .27 + phase) * .10;
  });
  return <group ref={root} position={position}>
    <mesh>
      <sphereGeometry args={[.82,12,8]} />
      <meshBasicMaterial color={tint} transparent opacity={.055} depthWrite={false} side={2} />
    </mesh>
    <mesh position={[.65,.09,-.2]}>
      <sphereGeometry args={[.67,12,8]} />
      <meshBasicMaterial color={tint} transparent opacity={.04} depthWrite={false} side={2} />
    </mesh>
  </group>;
}


/** V563 demo cast is explicitly synthetic; real-song cast comes only from V385's authored, track-bound lines. */
function PreviewDuetDirectorV563({stageId,audio,playing,reactive,lightStrength,reducedMotion,concertDetails,cue,realModels,urls,
    lipModeV561,songV561,profiles,manualEnabled,manualAssignments,duetPart,onRoleChange,onDiagnostics,tier,correct,rapBodyV564,rapBodyStrengthV564,motionPreviewV565,motionSmoothV565,onMotionCountV565}: {
  stageId:StageEnvironmentId;audio:AudioFeatures;playing:boolean;reactive:boolean;lightStrength:number;reducedMotion:boolean;
  concertDetails:ConcertDetailSettingsV555;cue:ReturnType<typeof concertPreviewV556>['cue'];
  realModels:boolean;urls:readonly [string|null,string|null];lipModeV561:ConcertLipPreviewModeV561;songV561:ConcertLipSongV561;
  profiles:readonly [import('./facialRigStudioV370').FacialProfileV370|undefined,import('./facialRigStudioV370').FacialProfileV370|undefined];
  manualEnabled:boolean;manualAssignments:readonly import('./manualVocalCastingV385').VocalAssignmentV385[];
  duetPart:DuetPreviewPartV563;onRoleChange:(r:DuetPreviewRoleV563)=>void;
  onDiagnostics:(slot:number,info:GlbLipDiagnosticsV561)=>void;tier:'low'|'balanced'|'high';correct:boolean;rapBodyV564:boolean;rapBodyStrengthV564:number;motionPreviewV565:boolean;motionSmoothV565:boolean;onMotionCountV565?:(slot:number,count:number)=>void;
}){
  const [role,setRole]=useState<DuetPreviewRoleV563>(()=>planRealDuetPreviewV563({part:duetPart,elapsedSeconds:0,mode:lipModeV561,playing,reducedMotion,song:songV561,manualEnabled}));
  const previousKey=useRef('');
  const onFirstDiagnosticsV563=useCallback((value:GlbLipDiagnosticsV561)=>onDiagnostics(0,value),[onDiagnostics]);
  const onSecondDiagnosticsV563=useCallback((value:GlbLipDiagnosticsV561)=>onDiagnostics(1,value),[onDiagnostics]);
  const onDuetMotionV565First=useCallback((count:number)=>onMotionCountV565?.(0,count),[onMotionCountV565]);
  const onDuetMotionV565Second=useCallback((count:number)=>onMotionCountV565?.(1,count),[onMotionCountV565]);
  useFrame(({clock})=>{
    const nowMs=Date.now();
    const songClock=concertLipSongClockV561(songV561,nowMs);
    const manualCue=lipModeV561==='song'&&manualEnabled&&songClock.playing
      ?resolveManualVocalCueV385({lyrics:songV561.lyrics,progressMs:songClock.progressMs,playing:true,count:2,enabled:true,assignments:manualAssignments}):null;
    const next=planRealDuetPreviewV563({part:duetPart,elapsedSeconds:clock.elapsedTime,
      mode:lipModeV561,playing,reducedMotion,song:songV561,manualEnabled,authoredCue:manualCue,authoredTrackId:songV561.trackId,nowMs});
    const key=[next.source,next.leadSlot,next.singingSlots.join(','),next.handoffFrom,next.cueStartMs,next.description].join(':');
    if(key!==previousKey.current){previousKey.current=key;setRole(next);onRoleChange(next);}
  });
  const scene=sceneForRealDuetV563(role,role.source==='authored'?songV561.trackId:'preview-demo');
  return <>
    <DynamicStage theme={stageId} audio={audio} isPlaying={playing&&!reducedMotion} reducedMotion={reducedMotion}
      reactive={reactive&&playing} strength={lightStrength} groupCountV542={2}
      performerLightingV557={{settings:concertDetails,cue,progressMs:role.progressMs,scene}}/>
    {realModels&&urls.map((url,slot)=>url&&<PreviewGlbPortraitV560 key={`${slot}:${url}`} url={url} slotV563={slot}
      xV563={slot===0?-1.12:1.12} correct={correct} lowTier={tier==='low'}
      lipModeV561={lipModeV561} playingV561={playing} reducedMotionV561={reducedMotion}
      songV561={songV561} profileV561={profiles[slot]}
      voiceActiveV563={role.singingSlots.includes(slot)} lookTowardV563={role.source!=='none'&&(role.singingSlots.length===2||role.leadSlot!==slot)}
      rapBodyV564={rapBodyV564} rapBodyStrengthV564={rapBodyStrengthV564}
      motionPreviewV565={motionPreviewV565} motionSmoothV565={motionSmoothV565}
      onMotionCountV565={slot===0?onDuetMotionV565First:onDuetMotionV565Second}
      onDiagnosticsV561={slot===0?onFirstDiagnosticsV563:onSecondDiagnosticsV563}/>)}
  </>;
}

function PreviewScene({ stageId, reactive, lightStrength, reducedMotion, playing, showFx, autorotate, resetKey, concertDetails, concertMode, avatarModelUrl, previewRealGlbV560, previewMaterialV560, faceCloseUpV560, lipModeV561, songV561, profileV561, onGlbDiagnosticsV561,duetPartnerUrlV563,duetPartnerProfileV563,duetPartV563,duetManualEnabledV563,duetAssignmentsV563,onDuetRoleV563,onDuetDiagnosticsV563,rapBodyV564,rapBodyStrengthV564,motionPreviewV565,motionSmoothV565,onMotionCountV565 }: {
  stageId: StageEnvironmentId; reactive: boolean; lightStrength: number; reducedMotion: boolean;
  playing: boolean; showFx: boolean; autorotate: boolean; resetKey: number;
  concertDetails:ConcertDetailSettingsV555;concertMode:ConcertPreviewModeV556;avatarModelUrl?:string|null;previewRealGlbV560:boolean;previewMaterialV560:boolean;faceCloseUpV560:boolean;
  lipModeV561:ConcertLipPreviewModeV561;songV561:ConcertLipSongV561;profileV561?:import('./facialRigStudioV370').FacialProfileV370;
  onGlbDiagnosticsV561:(info:GlbLipDiagnosticsV561)=>void;
  duetPartnerUrlV563?:string|null;duetPartnerProfileV563?:import('./facialRigStudioV370').FacialProfileV370;
  duetPartV563:DuetPreviewPartV563;duetManualEnabledV563:boolean;
  duetAssignmentsV563:readonly import('./manualVocalCastingV385').VocalAssignmentV385[];
  onDuetRoleV563:(role:DuetPreviewRoleV563)=>void;onDuetDiagnosticsV563:(slot:number,info:GlbLipDiagnosticsV561)=>void;
  rapBodyV564:boolean;rapBodyStrengthV564:number;motionPreviewV565:boolean;motionSmoothV565:boolean;onMotionCountV565?:(slot:number,count:number)=>void;
}) {
  const palette = colors[stageId];
  const audio = useRef<AudioFeatures>({...initialAudio});
  const strength = Math.max(.1, Math.min(1.45, lightStrength / 70));
  const motion = playing && !reducedMotion;
  const {tier}=useAdaptivePerformance();
  const demonstration = concertPreviewV556(concertMode,concertDetails,reducedMotion,tier,playing);
  const showGlbV560=!!avatarModelUrl&&previewRealGlbV560&&concertMode!=='duet';
  const previewGroupCountV542=concertMode==='duet'?2:1;
  const duetAssetsV563=selectDuetModelsV563(avatarModelUrl,duetPartnerUrlV563,previewRealGlbV560,tier);
  return <Canvas
    key={`${resetKey}:${faceCloseUpV560?'face':'stage'}`}
    className="stage-preview-modal-canvas"
    gl={{antialias:true, alpha:false, powerPreference:"low-power"}}
    dpr={[1,1.5]}
    camera={{position:faceCloseUpV560?[0,.22,concertMode==='duet'?5.8:3.8]:[0,1.2,8.2],fov:faceCloseUpV560?42:47,near:.1,far:80}}
    fallback={<div className="stage-preview-webgl-fallback">WebGL-Vorschau ist in diesem Browser nicht verfügbar.</div>}
  >
    <PreviewBeatDriver audio={audio.current} playing={playing} enabled={reactive} reducedMotion={reducedMotion} />
    <fog attach="fog" args={[palette.fog,9,26]} />
    {concertMode==='duet'?<PreviewDuetDirectorV563 stageId={stageId} audio={audio.current} playing={playing}
      reactive={reactive} lightStrength={lightStrength} reducedMotion={reducedMotion} concertDetails={concertDetails}
      cue={demonstration.cue} realModels={duetAssetsV563.useReal}
      urls={[avatarModelUrl??null,duetPartnerUrlV563??null]} lipModeV561={lipModeV561} songV561={songV561}
      profiles={[profileV561,duetPartnerProfileV563]} manualEnabled={duetManualEnabledV563}
      manualAssignments={duetAssignmentsV563} duetPart={duetPartV563} onRoleChange={onDuetRoleV563}
      onDiagnostics={onDuetDiagnosticsV563} tier={tier} correct={previewMaterialV560}
      rapBodyV564={rapBodyV564} rapBodyStrengthV564={rapBodyStrengthV564}
      motionPreviewV565={motionPreviewV565} motionSmoothV565={motionSmoothV565}
      onMotionCountV565={onMotionCountV565}/>
      :<DynamicStage theme={stageId} audio={audio.current} isPlaying={motion} reducedMotion={reducedMotion}
      reactive={reactive&&playing} strength={lightStrength} groupCountV542={previewGroupCountV542}
      performerLightingV557={{settings:concertDetails,cue:demonstration.cue,progressMs:900,scene:null}}/>}
    <StageEnvironment theme={stageId} audio={audio.current} isPlaying={motion} reducedMotion={reducedMotion} reactive={reactive && playing} />
    <Suspense fallback={null}><ConcertDetailStageV555 cue={demonstration.cue} settings={concertDetails} playing={playing} reducedMotion={reducedMotion} /></Suspense>
    {/* V560: optionally render the actual chosen GLB; legacy silhouettes remain
        the fallback for duet demos and when loading is not requested. */}
    {showGlbV560&&<PreviewGlbPortraitV560 url={avatarModelUrl!} correct={previewMaterialV560} lowTier={tier==='low'}
      lipModeV561={lipModeV561} playingV561={playing} reducedMotionV561={reducedMotion}
      songV561={songV561} profileV561={profileV561} onDiagnosticsV561={onGlbDiagnosticsV561}
      rapBodyV564={rapBodyV564} rapBodyStrengthV564={rapBodyStrengthV564}
      motionPreviewV565={motionPreviewV565} motionSmoothV565={motionSmoothV565}
      onMotionCountV565={onMotionCountV565?count=>onMotionCountV565(0,count):undefined}/>}
    {/* Neutral silhouettes are retained as the default low-cost preview. */}
    {([-1.12,1.12] as const).map((x,i)=><group key={i} visible={concertMode==='duet'?!duetAssetsV563.useReal:(i===0&&!showGlbV560)} name={`v377-vocal-stage-slot-${i}`} position={[concertMode==='duet'?x:0,-1.58,-.7]}>
      <mesh position={[0,.93,0]}><capsuleGeometry args={[.22,.80,4,10]}/><meshStandardMaterial color="#303d52" roughness={.85}/></mesh>
      <mesh position={[0,1.71,0]}><sphereGeometry args={[.23,12,10]}/><meshStandardMaterial color="#65748d" roughness={.72}/></mesh>
      <mesh position={[-.16,.31,0]}><capsuleGeometry args={[.09,.52,4,8]}/><meshStandardMaterial color="#293347"/></mesh>
      <mesh position={[.16,.31,0]}><capsuleGeometry args={[.09,.52,4,8]}/><meshStandardMaterial color="#293347"/></mesh>
    </group>)}
    {showFx && <>
      <MovingSpotlight position={[-2.55,3.05,-1.1]} color={palette.first} phase={0} moving={motion} strength={strength}/>
      <MovingSpotlight position={[2.55,3.05,-1.1]} color={palette.second} phase={1.8} moving={motion} strength={strength}/>
      {concertDetails.enabled && concertDetails.floorFog && <HazeCloud position={[-1.4,-1.6,.1]} tint={palette.fog} phase={0} moving={motion}/>}
      {concertDetails.enabled && concertDetails.floorFog && <HazeCloud position={[.45,-1.7,.6]} tint={palette.fog} phase={1.7} moving={motion}/>}
    </>}
    <OrbitControls
      makeDefault
      enableRotate
      enableZoom
      enablePan
      autoRotate={autorotate && motion}
      autoRotateSpeed={.4}
      enableDamping={!reducedMotion}
      target={faceCloseUpV560?[0,.2,-.8]:[0,-.1,-.8]}
      minDistance={faceCloseUpV560?1.8:3}
      maxDistance={17}
      minPolarAngle={.12}
      maxPolarAngle={Math.PI-.15}
    />
  </Canvas>;
}

export function StagePreviewModal({stageId,selectedStageId,onSelect,onClose,reactive,lightStrength,reducedMotion,concertDetailsV555,avatarModelUrl,duetModelsV563=[]}:StagePreviewModalProps) {
  const music=useMusic();
  const {preferences}=useUiPreferences();
  const [previewStage,setPreviewStage] = useState<StageEnvironmentId>(stageId);
  const [playing,setPlaying] = useState(true);
  const [concertMode,setConcertMode] = useState<ConcertPreviewModeV556>('hook');
  const [previewPortraitV558,setPreviewPortraitV558]=useState(true);
  const [previewBeatV559,setPreviewBeatV559]=useState(true);
  const concertDetails=concertDetailsV555??{...DEFAULT_CONCERT_DETAILS_V555};
  const [previewRealGlbV560,setPreviewRealGlbV560]=useState(false);
  const [previewMaterialV560,setPreviewMaterialV560]=useState(true);
  const [faceCloseUpV560,setFaceCloseUpV560]=useState(false);
  const [previewCinematicV566,setPreviewCinematicV566]=useState(true);
  const [lipModeV561,setLipModeV561]=useState<ConcertLipPreviewModeV561>('off');
  const [duetPartV563,setDuetPartV563]=useState<DuetPreviewPartV563>('handoff');
  const [duetPartnerIdV563,setDuetPartnerIdV563]=useState(preferences.secondaryAvatarModelId??'');
  const [duetRoleV563,setDuetRoleV563]=useState<DuetPreviewRoleV563|null>(null);
  const [duetDiagnosticsV563,setDuetDiagnosticsV563]=useState<Record<number,GlbLipDiagnosticsV561>>({});
  const onDuetRoleV563=useCallback((role:DuetPreviewRoleV563)=>setDuetRoleV563(role),[]);
  const onDuetDiagnosticsV563=useCallback((slot:number,info:GlbLipDiagnosticsV561)=>setDuetDiagnosticsV563(prev=>prev[slot]===info?prev:{...prev,[slot]:info}),[]);
  const [compareCalibrationV562,setCompareCalibrationV562]=useState(true);
  const [rapBodyV564,setRapBodyV564]=useState(true);
  const [rapBodyStrengthV564,setRapBodyStrengthV564]=useState(65);
  const [motionPreviewV565,setMotionPreviewV565]=useState(false);
  const [motionSmoothV565,setMotionSmoothV565]=useState(true);
  const [motionCountsV565,setMotionCountsV565]=useState<Record<number,number>>({});
  const onMotionCountV565=useCallback((slot:number,count:number)=>setMotionCountsV565(current=>
    current[slot]===count?current:{...current,[slot]:count}),[]);
  const [glbDiagnosticsV561,setGlbDiagnosticsV561]=useState<GlbLipDiagnosticsV561|null>(null);
  const onGlbDiagnosticsV561=useCallback((info:GlbLipDiagnosticsV561)=>setGlbDiagnosticsV561(info),[]);
  const songV561:ConcertLipSongV561={trackId:music.track?.id??null,lyrics:music.lyrics,
    progressMs:music.progressMs,fetchedAt:music.fetchedAt,durationMs:music.track?.durationMs??null,
    isPlaying:music.isPlaying,connected:music.connected&&music.connectionStatus==='connected',offsetMs:preferences.lyricsOffsetMs??0};
  const lipPlanV561=planConcertLipPreviewV561(lipModeV561,playing,reducedMotion,songV561);
  const songTimingV561=concertLipTimingV561(music.lyrics);
  const avatarProfileV562=preferences.avatarFacialProfilesV370?.[preferences.avatarModelId];
  const mouthProfileV562=useMemo(()=>normalizeMouthCalibrationV562(avatarProfileV562?.mouthCalibrationV562),[avatarProfileV562?.mouthCalibrationV562]);
  const calibratedProfileV562=useMemo(()=>avatarProfileV562?{...avatarProfileV562,mouthCalibrationV562:{...mouthProfileV562,enabled:mouthProfileV562.enabled&&compareCalibrationV562}}:undefined,
    [avatarProfileV562,mouthProfileV562,compareCalibrationV562]);
  const coverageV562=glbDiagnosticsV561?mouthCalibrationCoverageV562(glbDiagnosticsV561.mouthChannels,glbDiagnosticsV561.jawBone,avatarProfileV562?.mapping?.jaw==='none'):null;
  const {tier}=useAdaptivePerformance();
  const duetPartnerV563=duetModelsV563.find(model=>model.id===duetPartnerIdV563);
  const duetPartnerProfileV563=preferences.avatarFacialProfilesV370?.[duetPartnerIdV563];
  const duetPartnerCalibratedV563=useMemo(()=>duetPartnerProfileV563?{...duetPartnerProfileV563,
    mouthCalibrationV562:{...normalizeMouthCalibrationV562(duetPartnerProfileV563.mouthCalibrationV562),
      enabled:!!duetPartnerProfileV563.mouthCalibrationV562?.enabled&&compareCalibrationV562}}:undefined,
    [duetPartnerProfileV563,compareCalibrationV562]);
  const duetAssetsV563=selectDuetModelsV563(avatarModelUrl,duetPartnerV563?.url,previewRealGlbV560,tier);
  const duetAssignmentsV563=normalizeVocalAssignmentsV385((music.track?.id&&(preferences.avatarVocalAssignmentsV385??{})[music.track.id])||[],music.lyrics?.lines.length??0);
  const validGlbV560=typeof avatarModelUrl==='string'&&/^(?:\/|https?:\/\/).*\.(?:glb|gltf)(?:\?.*)?$/i.test(avatarModelUrl);
  const demonstration=concertPreviewV556(concertMode,concertDetails,reducedMotion,tier,playing);
  const auditV570=auditConcertExperienceV570({
    previewMode:concertMode,glbRequested:previewRealGlbV560,primaryUrl:avatarModelUrl,
    partnerUrl:duetPartnerV563?.url,primaryRig:concertMode==='duet'?duetDiagnosticsV563[0]:glbDiagnosticsV561,
    partnerRig:duetDiagnosticsV563[1],tier,playing,reducedMotion,lipMode:lipModeV561,
    song:songV561,duetRole:duetRoleV563,manualCastEnabled:preferences.avatarManualVocalEnabledV385===true,
    motionPreviewEnabled:motionPreviewV565,motionClips:[motionCountsV565[0],motionCountsV565[1]],nowMs:Date.now()
  });
  const [showFx,setShowFx] = useState(true);
  const [autorotate,setAutorotate] = useState(false);
  const [resetKey,setResetKey] = useState(0);
  useEffect(()=>{
    setGlbDiagnosticsV561(null);
    setDuetDiagnosticsV563({});
    setDuetRoleV563(null);
    setMotionCountsV565({});
  },[avatarModelUrl]);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = "stage-preview-modal-title";
  const stages = STAGE_ENVIRONMENTS;
  const stageIndex = stages.findIndex(stage=>stage.id === previewStage);
  const definition = stages[stageIndex] ?? stages[0];

  useEffect(() => {
    closeButton.current?.focus();
    const originalOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{document.body.style.overflow=originalOverflow;};
  },[]);

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if(event.key === "Tab" && dialog.current) {
        const elements=Array.from(dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]),[tabindex="0"]'));
        const first=elements[0],last=elements[elements.length-1];
        if(!first||!last) return;
        if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    window.addEventListener("keydown",onKey,true);
    return ()=>window.removeEventListener("keydown",onKey,true);
  },[onClose]);

  const chooseOffset=(offset:number)=>{
    const next=stages[(stageIndex+offset+stages.length)%stages.length];
    setPreviewStage(next.id);
    setResetKey(v=>v+1);
  };
  const activate=()=>{onSelect(previewStage);onClose();};

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="stage-preview-modal-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
      <div className="stage-preview-modal" data-v571-preview-root="true" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialog}>
        <header className="stage-preview-modal-header">
          <div>
            <span className="stage-preview-modal-eyebrow">SONIC DISPLAY · BÜHNENSTUDIO</span>
            <h2 id={titleId}>{definition.label} – 3D-Vorschau</h2>
            <p>{definition.description}</p>
          </div>
          <button type="button" className="stage-preview-modal-close" onClick={onClose} ref={closeButton} aria-label="3D-Vorschau schließen">×</button>
        </header>
        <div className="stage-preview-modal-viewport" aria-label="Interaktive 3D-Bühne – mit der Maus drehen und zoomen">
          <PreviewScene
            stageId={previewStage} reactive={reactive} lightStrength={lightStrength}
            reducedMotion={reducedMotion} playing={playing} showFx={showFx}
            autorotate={autorotate} resetKey={resetKey} concertDetails={{...concertDetails,portraitLight:previewPortraitV558&&concertDetails.portraitLight!==false,beatPortraitLight:previewBeatV559&&concertDetails.beatPortraitLight!==false,cinematicFaceLightV566:previewCinematicV566&&concertDetails.cinematicFaceLightV566!==false}} concertMode={concertMode} avatarModelUrl={validGlbV560?avatarModelUrl:null} previewRealGlbV560={previewRealGlbV560} previewMaterialV560={previewMaterialV560} faceCloseUpV560={faceCloseUpV560}
            lipModeV561={lipModeV561} songV561={songV561}
            profileV561={calibratedProfileV562} onGlbDiagnosticsV561={onGlbDiagnosticsV561}
            duetPartnerUrlV563={duetPartnerV563?.url} duetPartnerProfileV563={duetPartnerCalibratedV563}
            duetPartV563={duetPartV563} duetManualEnabledV563={preferences.avatarManualVocalEnabledV385===true}
            duetAssignmentsV563={duetAssignmentsV563} onDuetRoleV563={onDuetRoleV563} onDuetDiagnosticsV563={onDuetDiagnosticsV563}
            rapBodyV564={rapBodyV564} rapBodyStrengthV564={rapBodyStrengthV564}
            motionPreviewV565={motionPreviewV565} motionSmoothV565={motionSmoothV565}
            onMotionCountV565={onMotionCountV565}
          />
          <span className="stage-preview-modal-watermark">LIVE 3D · {definition.mood} · DEMO</span>
          {concertDetails.enabled && <div className="v556-preview-main-lyrics" aria-label="Beispiel-Lyrics, nicht aus Spotify">
            <small>LESEBEREICH · BEISPIELTEXT</small><strong>{demonstration.caption}</strong>
          </div>}
        </div>
        <details className="v570-experience-audit" data-v570-audit="input-readiness">
          <summary>V570 · Konzert-Qualitätscheck <span>{auditV570.ok} Eingangsprüfungen positiv · {auditV570.limited} eingeschränkt · {auditV570.pending} offen</span></summary>
          <p>{auditV570.summary} Demo-Mundbewegungen, vorhandene Timings und geladene GLB-Rigs sind von echten visuellen Hardwaretests zu unterscheiden.</p>
          <ul>{auditV570.checks.map(item=><li key={item.id} data-v570-status={item.status} data-v571-audit-id={item.id}>
            <strong>{item.status==='ok'?'✓':item.status==='pending'?'○':'–'} {item.label}</strong>
            <span>{item.detail}</span>
          </li>)}</ul>
          <small>Für eine echte Freigabe: Build lokal mit installierten Abhängigkeiten ausführen, WebGL-Sichtprüfung durchführen sowie Pi-FPS und Speicherverlauf über mehrere Stunden aufzeichnen. Diese Eingangsprüfung misst keine Bildqualität.</small>
        </details>
        <div className="v556-preview-control" role="group" aria-label="Lichtszenen zum Vergleichen">
          <span>V559 · Beat- und Porträtlicht bei Hook &amp; Duett vergleichen:</span>
          {([['verse','Strophe'],['hook','Hook'],['dense','Dichter Deutschrap'],['rapHook','Deutschrap-Hook'],['duet','Duett (Demo)']] as const).map(([mode,label])=><button type="button"
            key={mode} aria-pressed={concertMode===mode} onClick={()=>{setConcertMode(mode);if(mode==='duet'&&lipModeV561==='off')setLipModeV561('rap');}}>{label}</button>)}
          <button type="button" aria-pressed={previewPortraitV558} onClick={()=>setPreviewPortraitV558(v=>!v)}
            title="Gleiche Vorschau mit und ohne V558-Porträtlicht vergleichen">Porträtlicht {previewPortraitV558?'an':'aus'}</button>
          <button type="button" aria-pressed={previewBeatV559} onClick={()=>setPreviewBeatV559(v=>!v)}
            title="V559: gleiche 3D-Demoszene mit und ohne Beat-Porträtlicht">Beat-Licht {previewBeatV559?'an':'aus'}</button>
          <button type="button" aria-pressed={previewCinematicV566} onClick={()=>setPreviewCinematicV566(v=>!v)}
            title="V566: kameraabhängige Gesichtsausleuchtung an derselben Kameraposition A/B vergleichen">Kameralicht V566 {previewCinematicV566?'an':'aus'}</button>
          {validGlbV560&&<button type="button" aria-pressed={previewRealGlbV560} onClick={()=>setPreviewRealGlbV560(v=>!v)}
            title="V563: Solo als GLB anzeigen; im Duett zwei getrennte echte GLB-Instanzen, sofern gewählt und unterstützt">Echten GLB zeigen {previewRealGlbV560?'an':'aus'}</button>}
          {validGlbV560&&<button type="button" aria-pressed={previewMaterialV560} onClick={()=>setPreviewMaterialV560(v=>!v)}
            title="V560-Materialkorrektur am exakt gleichen GLB vergleichen">GLB-Hautmaterial {previewMaterialV560?'optimiert':'Original'}</button>}
          {validGlbV560&&previewRealGlbV560&&<button type="button" aria-pressed={faceCloseUpV560} onClick={()=>setFaceCloseUpV560(v=>!v)}
            title="Gesichtsausleuchtung und optional die aktive V561-Lip-Sync-Animation am echten GLB prüfen">Gesichts-Nahaufnahme {faceCloseUpV560?'an':'aus'}</button>}
          {validGlbV560&&previewRealGlbV560&&<>
            <span>V561 · Echter GLB – Mundanimation:</span>
            {([['off','Lip-Sync aus'],['rap','Deutschrap-Demo'],['singing','Gesangs-Demo'],['song','Aktueller Song']] as const).map(([mode,label])=><button
              key={mode} type="button" aria-pressed={lipModeV561===mode}
              disabled={mode==='song'&&(!music.track||songTimingV561==='none'||!music.connected||(concertMode==='duet'&&(!preferences.avatarManualVocalEnabledV385||duetAssignmentsV563.length===0)))}
              onClick={()=>{setLipModeV561(mode);if(mode!=='off')setFaceCloseUpV560(true);}}>{label}</button>)}
            <span role="status" aria-live="polite">{lipPlanV561.reason} · {concertMode==='duet'?'Individuelle Rig-Prüfung unten':glbDiagnosticsV561
              ?glbDiagnosticsV561.mouthSupported?`Mund-Rig: ${glbDiagnosticsV561.mouthChannels.join(', ')||'Kieferknochen'} (${glbDiagnosticsV561.morphs} Morphs)`: 'Mund-Rig nicht erkannt – keine animierbare Lip-Sync-Vorschau'
              :'GLB-Rig wird geladen/geprüft'}</span>
          </>}
          {validGlbV560&&previewRealGlbV560&&<>
            <button type="button" aria-pressed={compareCalibrationV562&&mouthProfileV562.enabled}
              disabled={!mouthProfileV562.enabled} onClick={()=>setCompareCalibrationV562(v=>!v)}
              title="V562 nur in dieser Vorschau umschalten; gespeicherte Avatar-Einstellungen bleiben unverändert">V562-Kalibrierung {mouthProfileV562.enabled&&compareCalibrationV562?'an':'aus / Original'}</button>
            <span role="status">V562: {mouthProfileV562.enabled?'aktiv für diesen Avatar':'im Gesichtsanimation-Studio noch nicht aktiviert'} · {coverageV562?`${coverageV562.count}/4 Mundkanäle`:'GLB wird geprüft'}</span>
          </>}
          {validGlbV560&&previewRealGlbV560&&<>
            <span>V564 · Deutschrap-Kopf, Oberkörper und Rap-Gesten (simulierte Demo):</span>
            <button type="button" aria-pressed={rapBodyV564} onClick={()=>setRapBodyV564(v=>!v)}>Rap-Körpergesten {rapBodyV564?'an':'aus'}</button>
            <label>Gestenstärke {rapBodyStrengthV564}% <input type="range" min={0} max={100} step={5} value={rapBodyStrengthV564}
              onChange={e=>setRapBodyStrengthV564(Number(e.target.value))} aria-label="V564 Rap-Gestenstärke" /></label>
            <small>V564 reagiert nur in der Deutschrap-Demo. Die Song-Vorschau erfindet keine Gesangs- oder Bewegungszeitmarken.</small>
          </>}
          {validGlbV560&&previewRealGlbV560&&<>
            <span>V565 · Eingebettete GLB-Tanzclips vergleichen (nur wenn mindestens zwei vorhanden):</span>
            <button type="button" aria-pressed={motionPreviewV565} disabled={tier==='low'||reducedMotion}
              onClick={()=>setMotionPreviewV565(v=>!v)}>Tanzclip-Vorschau {motionPreviewV565?'an':'aus'}</button>
            <button type="button" aria-pressed={motionSmoothV565} disabled={!motionPreviewV565}
              onClick={()=>setMotionSmoothV565(v=>!v)}>Überblendung {motionSmoothV565?'weich':'direkt'}</button>
            <span role="status">Geeignete Clips: Avatar 1 {motionCountsV565[0]??'lädt'}{concertMode==='duet'?` · Avatar 2 ${motionCountsV565[1]??'lädt'}`:''} · für Übergänge sind mindestens zwei pro Avatar nötig.</span>
            <small>V565: Vergleich mit echten eingebetteten GLB-Tanzclips im wiederholten Demo-Wechsel. Fehlen zwei geeignete Clips, bleibt das Modell unverändert. Kein automatischer Download weiterer Motion-GLBs.</small>
          </>}
          {concertMode==='duet'&&previewRealGlbV560&&<>
            <span>V563 · Zwei echte GLB-Avatare:</span>
            <label>Zweiter GLB <select value={duetPartnerIdV563} onChange={e=>{setDuetPartnerIdV563(e.target.value);setDuetDiagnosticsV563({});setDuetRoleV563(null);setMotionCountsV565({});}}>
              <option value="">Zweiten Avatar wählen</option>
              {duetModelsV563.filter(m=>m.url).map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
            </select></label>
            {([['handoff','Sängerwechsel (Demo)'],['hook','Gemeinsamer Hook (Demo)']] as const).map(([part,label])=><button
              type="button" key={part} aria-pressed={duetPartV563===part} onClick={()=>setDuetPartV563(part)}>{label}</button>)}
            <span role="status" aria-live="polite">{duetAssetsV563.reason} · {duetRoleV563?.description??'Besetzung wird vorbereitet'}
              {duetAssetsV563.useReal?` · Rig 1: ${duetDiagnosticsV563[0]?.mouthSupported?'geeignet':'nicht erkannt'} · Rig 2: ${duetDiagnosticsV563[1]?.mouthSupported?'geeignet':'nicht erkannt'}`:''}
            </span>
          </>}
          <span className="v556-preview-budget">Relative Pegel · Gobo {Math.round(demonstration.balance.gobo*100)}% · LED {Math.round(demonstration.balance.pixelWall*100)}% · Projektion {Math.round(demonstration.balance.projection*100)}%</span>
        </div>
        <p className="stage-preview-modal-help">Demo-Texte und Lichtszenen werden simuliert; keine echten Song-Timestamps. Porträtlicht an/aus vergleicht dieselben 3D-Demofiguren mit den echten Bühnen-Lichtquellen. Die Projektion nutzt den gleichen Renderer wie die Live-Bühne. Mit Maus oder Finger ziehen: drehen · Mausrad oder Pinch: zoomen · Rechtsklick: verschieben. Das V559-Beat-Licht nutzt die vorhandenen Key-/Fill-Lichter; der Vergleich bleibt eine Demo-Simulation, kein gemessener Spotify-Audiostream oder eine echte Gesangs-Stimmtrennung. V563 lädt im Duett auf Wunsch zwei unabhängig geklonte echte GLBs; bei fehlendem Partnermodell oder Pi/Low-Tier bleiben Demofiguren. Die Materialkorrektur wirkt nur auf eindeutig benannte PBR-Hautteile und verändert keine importierten GLB-Dateien. V561 nutzt bei Deutschrap-/Gesangs-Demos die echte Gesichts-Engine, aber ausschließlich synthetische Demobewegungen. „Aktueller Song“ verwendet nur vorhandene synchronisierte Lyrics und den Spotify-Wiedergabezeitpunkt mit dem eingestellten Lyrics-Offset – keine erfundenen Wortmarken und keine Phonemerkennung. Nicht erkannte Mund-Rigs bewegen sich nicht. V562 ergänzt pro Avatar sichere Grenzen für Mundöffnung, Lippenverschluss und Vokalwechsel. Der Vorher-/Nachher-Schalter gilt nur für die Vorschau; gespeicherte Werte aus dem Gesichtsanimation-Studio werden nicht verändert. V564 führt nur bei bestätigten Wort-Zeitmarken kleine, geglättete Kopf-/Oberkörper-Akzente zur echten Live-Tanzanimation hinzu. Die zusätzliche Rap-Körperdemo in der Vorschau ist eindeutig simuliert; der Vorher-/Nachher-Vergleich beeinflusst weder gespeicherte Profile noch Spotify. V565 verfeinert nur automatische Live-GLB-Übergänge ohne manuelle Regie. Die opt-in-Tanzvorschau zeigt echte eingebettete Clipdaten bei simulierten Wechselzeitpunkten, ohne Sprecher-, Beat- oder Songzuordnung; bei Low-Tier beziehungsweise reduzierter Bewegung bleibt sie aus. V563 benutzt im Duett ausschließlich gekennzeichnete Demo-Besetzungen oder aktivierte manuelle V385-Zuordnungen für exakt den aktuellen Song; aus Lyrics werden keine Sänger erraten. Die sanfte Zuwendung zum Duettpartner ist keine echte Blick-IK. Die optionale GLB-Vorschau steuert weder Spotify noch die Live-Bühne.</p>
        <div className="stage-preview-modal-toolbar">
          <button type="button" onClick={()=>chooseOffset(-1)} aria-label="Vorherige Bühne">‹ Vorherige</button>
          <button type="button" onClick={()=>chooseOffset(1)} aria-label="Nächste Bühne">Nächste ›</button>
          <button type="button" onClick={()=>setResetKey(v=>v+1)}>Kamera zurücksetzen</button>
          <button type="button" aria-pressed={playing} onClick={()=>setPlaying(v=>!v)}>{playing ? "Animation pausieren" : "Animation abspielen"}</button>
          <button type="button" aria-pressed={showFx} onClick={()=>setShowFx(v=>!v)}>Zusatzlicht & Nebel {showFx ? "an" : "aus"}</button>
          <button type="button" aria-pressed={autorotate} disabled={reducedMotion} onClick={()=>setAutorotate(v=>!v)}>Auto-Drehung {autorotate ? "an" : "aus"}</button>
        </div>
        <footer className="stage-preview-modal-footer">
          <span>{definition.mood} · {previewStage === selectedStageId ? "Aktuell ausgewählt" : "Noch nicht ausgewählt"}</span>
          <div>
            <button type="button" className="stage-preview-modal-secondary" onClick={onClose}>Schließen</button>
            <button type="button" className="stage-preview-modal-primary" onClick={activate}>Diese Bühne verwenden</button>
          </div>
        </footer>
      </div>
    </div>,document.body
  );
}
