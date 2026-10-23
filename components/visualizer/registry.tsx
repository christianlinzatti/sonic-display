import { ThreeAvatar } from "./ThreeAvatar";
import type { ComponentType } from "react";
import type { Track, Lyrics } from "@/types/music";
import type { AudioFeatures } from "@/types/audio";

export type VisualizerMode = "wave" | "particles" | "album-glow" | "avatar";
export interface VisualizerProps {
  audio: AudioFeatures;
  lyricsSignalV350?: {active:boolean;side:"left"|"right"|null};
  lipSync?: {concertCameraArmedV454?:boolean;concertCameraCueV454?:import("./smartAutomaticRapShowV446").SmartShowCueV446;concertCameraCastCountV454?:number;rapCameraCueV429?:import("./expressiveRapDirectorV425").ExpressiveRapCueV425;rapCameraArmedV429?:boolean;rapCameraEnabledV429?:boolean;rapCameraStrengthV429?:number;rapCameraOverridesV430?:import("./rapCameraShotStudioV430").RapCameraOverrideV430[];rapCameraKeyframesEnabledV432?:boolean;rapCameraKeyframesV432?:import("./rapCameraKeyframesV432").RapCameraKeyframeV432[];rapCameraTransitionsEnabledV433?:boolean;rapCameraBeatSyncV433?:boolean;rapCameraTransitionSmoothnessV433?:number;rapCameraBpmV433?:number|null;rapCameraKickV433?:number;multiArtistCastCountV442?:number; vocalCameraModeV401?:"off"|"subtle"|"musicvideo"; vocalCameraStrengthV401?:number; cameraStudioV398?:import("./cameraPerformanceStudioV398").CameraStudioProfileV398; cameraTimelineV400?:import("./cinematicCameraTimelineV400").CameraTimelineLibraryV400; visualDirectorModeV397?:"off"|"subtle"|"cinematic"; visualDirectorStrengthV397?:number; visualDirectorTierV397?:"low"|"balanced"|"high"; performanceModeV393?: "off"|"subtle"|"expressive"; performanceStrengthV393?: number; expressiveFaceEnabledV390?:boolean; expressiveFaceStrengthV390?:number; reducedMotionV390?:boolean; lyrics: Lyrics | null; progressMs: number; playing: boolean; enabled: boolean; strength: number; mode: "lyrics" | "hybrid"; style?: "auto" | "rap" | "singing"; expression?: number; jawFollowV369?: number; cameraModeV369?: "off" | "auto" | "performance"; cameraStrengthV369?: number; bodyEnabledV371?: boolean; bodyStrengthV371?: number; eyeContactV371?: boolean; gesturesV371?: boolean; coordinationEnabledV372?: boolean; coordinationStrengthV372?: number; coordinationOffsetMsV372?: number; qualityEnabledV374?: boolean; mouthSmoothnessV374?: number; rapLipEnabledV415?:boolean; rapLipPrecisionV415?:number; rapLipOffsetMsV415?:number; rapSyllableEnabledV419?:boolean; rapSyllableStrengthV419?:number; rapSyllableSmoothnessV419?:number; rapSyllableEditsEnabledV420?:boolean; rapSyllableTrackIdV420?:string; rapSyllableDocumentV420?:import("./rapSyllableKeyframesV420").RapMouthDocumentV420|null;rapAudioEnabledV423?:boolean;rapAudioStrengthV423?:number;rapAudioOffsetMsV423?:number;rapAudioTrackIdV423?:string;rapAudioDocumentV423?:import("./rapAudioAwareV423").RapAudioDocumentV423|null; rapGestureCalmV374?: number; naturalArticulationEnabledV384?: boolean; articulationStrengthV384?: number; lipSealV384?: number; jawStabilityV384?: number; ensembleModeV374?: "balanced" | "lead" | "call-response"; ensembleCountV374?: number; performanceModeV375?: "off" | "balanced" | "dynamic"; performanceStrengthV375?: number; concertModeV386?: "off"|"subtle"|"expressive"; concertStrengthV386?: number; concertCameraV386?: boolean; concertLightingV386?: boolean; concertCueRefV386?: {current:import("./expressiveConcertDirectorV386").ConcertCueV386|null}; rapTimingLiveEnabledV418?:boolean; rapRoleOffsetMsV418?:number; rapDuetEnabledV416?:boolean; rapDuetCameraV416?:boolean; rapDuetAssignmentsV416?: import("./rapDuetStudioV416").RapDuetAssignmentV416[]; rapDuetTrackIdV416?:string; manualVocalEnabledV385?: boolean; manualVocalCameraV385?: boolean; manualVocalAssignmentsV385?: import("./manualVocalCastingV385").VocalAssignmentV385[]; manualVocalTrackIdV385?: string; manualVocalCueRefV385?: {current:import("./manualVocalCastingV385").VocalCueV385|null}; duetModeV376?: "off"|"handoff"|"dialogue"; duetStrengthV376?: number; cinematicDuetCameraModeV377?: "off" | "subtle" | "cinematic"; cinematicDuetCameraStrengthV377?: number; cinematicLyricsModeV378?: "off"|"readable"|"cinematic"; cinematicLyricsStrengthV378?: number; cinematicLyricsSideV378?: "left"|"right"|null; cinematicLyricsVisibleV378?: boolean; cameraCastCountV377?: number; cameraManualStagePriorityV377?: boolean; interactionCueRefV376?: {current:import("./interactiveVocalDuetsV376").DuetInteractionV376|null}; performanceCueRefV375?: {current:import("./adaptiveVocalPerformanceV375").PerformanceCueV375|null}; profilesV370?: Record<string, import("./facialRigStudioV370").FacialProfileV370> };
  lyricsScene?: { lyrics: Lyrics; progressMs: number; activeIndex: number; playing: boolean; side: "left" | "right"; depth: number; colorFrom: string; colorTo: string; intensity: number; fontScale: number; glow: number; wordHighlight: boolean; cinematicModeV378?: "off"|"readable"|"cinematic"; cinematicStrengthV378?: number; cinematicContrastV378?: boolean; spatialLayoutV381?: import("./lyricsSpatialEditorV381").LyricsSpatialLayoutV381; kineticPresetV382?: import("./kineticLyricsV382").KineticLyricsPresetV382; kineticStrengthV382?:number; kineticDropsV382?:boolean; genreV382?:string; avatarCountV477?:number; };
  track: Track | null;
  isPlaying: boolean;
  reducedMotion: boolean;
  genre?: string | null;
  genreFusion?: import("@/services/genre/genreIntelligence").GenreFusion|null;
  avatarModelUrl?: string | null;
  avatarAnimationUrl?: string | null;
  avatarModelId?: string;
  multiAvatarMode?: "solo" | "sync" | "mirror" | "duet";
  duoDirectorEnabled?: boolean;
  partnerContactCalibration?: { reach:number; height:number; strength:number };
  secondaryContactCalibration?: { reach:number; height:number; strength:number };
  secondaryAvatarModelUrl?: string | null;
  secondaryAvatarAnimationUrl?: string | null;
  preferredMotionUrlV440?:string;
  secondaryPreferredMotionUrlV440?:string;
  artistSpotlightV443?:import("./artistSpotlightV443").ArtistSpotlightV443;
  featureDirectionV460?:import("./intelligentFeaturePerformanceV460").FeatureDirectionV460;
  artistInteractionEnabledV444?:boolean;
  artistInteractionStrengthV444?:number;
  vocalChangeEnabledV445?:boolean;
  vocalChangeSensitivityV445?:number;
  vocalChangeMicrophoneActiveV445?:boolean;
  artistBubblePlanV441?:import("./artistNameBubblesV441").ArtistBubblePlanV441;
  autoMultiArtistGroupV442?:import("./multiAvatarStageDirectorV326").GroupStudioV326|null;
  multiArtistMotionsV442?:Array<string|undefined>;
  secondaryAvatarModelId?: string;
  secondaryDancePreset?: VisualizerProps["avatarDancePreset"];
  avatarScale?: number;
  avatarOffsetY?: number;
  avatarAnimationIntensity?: number;
  danceAggression?: number;
  danceVariation?: number;
  danceMotionStyle?: "smooth" | "balanced" | "sharp";
  avatarMotionMode?: "hybrid" | "choreography" | "reactive";
  smartDanceEnabled?: boolean;
  smartDanceOverride?: string;
  avatarClipSpeed?: number;
  avatarBlendEnabled?: boolean;
  avatarBlendClip?: string;
  avatarBlendWeight?: number;
  avatarBlendAutoEnergy?: boolean;
  avatarBlendBpmSync?: boolean;
  avatarBlendReferenceBpm?: number;
  avatarBlendSmoothing?: number;
  avatarBlendCurve?: "linear" | "smooth" | "ease-in" | "ease-out";
  avatarBlendSpeed?: number;
  avatarBlendMask?: "full" | "upper" | "arms" | "lower";
  avatarCrossfadeSeconds?: number;
  avatarArmResponse?: number;
  avatarLegResponse?: number;
  avatarFootIKEnabled?: boolean;
  avatarFootIKStrength?: number;
  avatarFootIKContact?: number;
  avatarFootIKLock?: number;
  stagePalette?: { primary: string; secondary: string; glow: string };
  stageScreensV333?: import("@/services/stageContent/layoutV333").ContentScreenV333[];
  stageLayoutEnabledV333?: boolean;
  stageSlidesV333?: import("@/services/stageContent/stageContentV330").StageContentV330[];
  stageLivePushV333?: import("@/services/stageContent/stageContentV330").StageContentV330 | null;
  stageRotationIndexV333?: number;
  stageScreenV330?: import("@/services/stageContent/stageContentV330").StageContentV330 | null;
  stageScreenSettingsV330?: import("@/services/stageContent/stageContentV330").StageContentSettingsV330;
  stageTheme?: import("./stages").StageEnvironmentId;
  showCue?: import("./ultimateShowDirectorV306").ShowCue;
  experienceCueV396?: import("./performanceExperienceV396").ExperienceCueV396;
  festivalShowCueV394?: import("./festivalShowDirectorV394").FestivalShowCueV394;
  festivalShowCameraV394?:boolean;festivalShowLightingV394?:boolean;festivalShowAtmosphereV394?:boolean;festivalShowLasersV394?:boolean;
  concertShowCueV387?: import("./concertShowDirectorV387").ConcertShowCueV387;
  concertShowCameraV387?: boolean;
  concertShowLightingV387?: boolean;
  concertShowAtmosphereV387?: boolean;
  autonomousShowPhraseV356?: {index:number;enabled:boolean};
  cameraDirectorEnabled?: boolean;
  cameraDirectorIntensity?: number;
  cameraDirectorSection?: import("./stageDirectorV287").StageSection;
  cameraDirectorProgressMs?: number;
  stageReactive?: boolean;
  stageLightStrength?: number;
  dancePostEnabledV468?: boolean;
  shaderEnvironmentV468?: import('./ProceduralShaderEnvironmentV468').ShaderEnvironmentModeV468;
  wardrobeModeV468?: import('./avatarWardrobeV468').WardrobeModeV468;
  wardrobeColorV468?: string;
  wardrobePatternV468?: import("./avatarWardrobeV468").WardrobePatternV468;
  wardrobeGlowV468?: number;
  audioMotionEnabledV468?: boolean;
  audioMotionStrengthV468?: number;
  danceFxEnabled?: boolean;
  danceFxStrength?: number;
  danceFxShockwaves?: boolean;
  danceFxFootprints?: boolean;
  danceFxTrails?: boolean;
  avatarRigProfile?: "auto" | "humanoid" | "mixamo" | "ready-player-me" | "robot";
  avatarDancePreset?: "auto" | "hardstyle" | "techno" | "rock-metal" | "robot" | "ambient" | "freestyle";
}
export interface VisualizerDefinition {
  id: VisualizerMode;
  label: string;
  Component: ComponentType<VisualizerProps>;
}

function WaveVisualizer({ audio, isPlaying, reducedMotion }: VisualizerProps) {
  return <div className="visualizer-stage wave-stage" aria-label="Waveform visualizer" style={{ "--wave-level": audio.volume, "--wave-motion": reducedMotion ? "0s" : isPlaying ? "1.2s" : "0s" } as React.CSSProperties}><div className="wave-bars">{Array.from({ length: 32 }, (_, i) => <i key={i} style={{ height: `${8 + 75 * Math.max(audio.bass, audio.mids, audio.highs) * (0.25 + Math.abs(Math.sin(i * 0.73)))}%` }} />)}</div></div>;
}
function ParticleVisualizer({ audio, isPlaying, reducedMotion }: VisualizerProps) {
  return <div className={`visualizer-stage particle-stage ${isPlaying && !reducedMotion ? "is-active" : ""}`} aria-label="Particle visualizer" style={{ "--particle-energy": audio.volume } as React.CSSProperties}>{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--i": i, "--delay": `${i * -0.17}s` } as React.CSSProperties} />)}</div>;
}
function AlbumGlowVisualizer({ audio, track }: VisualizerProps) {
  return <div className="visualizer-stage album-glow-stage" aria-label="Album art glow" style={{ "--glow-energy": audio.bass } as React.CSSProperties}>{track?.albumCoverUrl ? <img src={track.albumCoverUrl} alt="" /> : <span>♫</span>}</div>;
}


export const visualizerRegistry: Record<VisualizerMode, VisualizerDefinition> = {
  wave: { id: "wave", label: "Waveform", Component: WaveVisualizer },
  particles: { id: "particles", label: "Particles", Component: ParticleVisualizer },
  "album-glow": { id: "album-glow", label: "Album glow", Component: AlbumGlowVisualizer },
  avatar: { id: "avatar", label: "3D Avatar", Component: ThreeAvatar },
};
