"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import type { AudioFeatures } from "@/types/audio";
import { getActivePerformanceTier, useAdaptivePerformance } from "../adaptivePerformance";
import {getVisualLevelV640} from "../adaptiveVisualBudgetV640";
import {resolveLightingBudgetV772} from "../adaptiveLightingBudgetV772";
import type {SpotLight} from "three";
import { createGalaxyStarfieldV766 } from "./galaxyStarfieldV766";
import {StageStaticBatchV775} from "./StageStaticBatchV775";
import {Arena360StageV1031} from "./Arena360StageV1031";
import {VAPORWAVE_BARS_V775, VAPORWAVE_PALM_TRUNKS_V775, VAPORWAVE_PALM_LEAVES_V775,
  ROCK_AMP_PANELS_V775, ROCK_TRUSS_POSTS_V775, ROCK_TRUSS_HOUSINGS_V775,
  CYBERPUNK_TOWER_LEDS_V775, CYBERPUNK_SIDE_NEONS_V775} from "./stageInstancePlansV775";

export type StageEnvironmentDefinition = {
  id: string;
  label: string;
  genres: readonly string[];
  description: string;
  mood: string;
};

export const STAGE_ENVIRONMENTS = [
  {id:"classic", label:"Classic Stage", genres:[], description:"Klassische Konzertbühne mit klaren Lichtkreisen und dunklem Floor.", mood:"Allround / neutral"},
  {id:"neon", label:"Neon Club", genres:["electro"], description:"Club-Atmosphäre mit cyan-magenta Neonlicht und urbanem Glow.", mood:"Electro / Club"},
  {id:"festival", label:"Festival", genres:["hardstyle","hardtekk"], description:"Breite Festivalbühne mit kräftigen Akzentfarben und Mainstage-Energie.", mood:"Hardstyle / Hardtekk"},
  {id:"minimal", label:"Minimal Studio", genres:[], description:"Reduziertes, sauberes Studio für elegante und fokussierte Präsentationen.", mood:"Clean / neutral"},
  {id:"cyberpunk", label:"Cyberpunk Club", genres:["techno","industrial","dark techno"], description:"Industrielle Neon-Location mit Spiegelungen, Röhrenlicht und dunklem Stahl.", mood:"Techno / Industrial"},
  {id:"vaporwave", label:"Vaporwave Sunset", genres:["synthwave","retrowave","chillout"], description:"Retrowave-Sonne, Grid und Palmen-Silhouetten für einen nostalgischen 80s-Look.", mood:"Synthwave / Chill"},
  {id:"galaxy", label:"Cosmic Galaxy", genres:["ambient","trance","deep house"], description:"Offener Deep-Space-Raum mit Sternenfeld und schwebender kosmischer Atmosphäre.", mood:"Ambient / Trance"},
  {id:"white", label:"White Showroom", genres:["pop","hip-hop","rap","deutschrap"], description:"Helles High-End-Studio mit weichen Softboxen und Premium-Showroom-Gefühl.", mood:"Pop / Hip-Hop"},
  {id:"rock", label:"Rock Arena", genres:["rock","metal","punk"], description:"Dunkle Arena mit Traversen, Backstage-Stahl und warmen, aggressiven Flutern.", mood:"Rock / Metal"},
  {id:"arena360", label:"360° Ultimate Concert Arena", genres:[], description:"360°-Rundbühne mit transformierenden LED-Petalen, Laserfächern, Nebel und intelligenter Konzertregie.", mood:"360° / Immersive Live"},
] as const satisfies readonly StageEnvironmentDefinition[];

export type StageEnvironmentId = typeof STAGE_ENVIRONMENTS[number]["id"];

export function isStageEnvironmentId(value: unknown): value is StageEnvironmentId {
  return typeof value === "string" && STAGE_ENVIRONMENTS.some(stage => stage.id === value);
}

export function getStageEnvironmentDefinition(theme: StageEnvironmentId): (typeof STAGE_ENVIRONMENTS)[number] {
  return STAGE_ENVIRONMENTS.find(stage => stage.id === theme) ?? STAGE_ENVIRONMENTS[0];
}

export function recommendedStage(genre: string | null | undefined): StageEnvironmentId {
  const g = (genre ?? "").toLowerCase();
  return STAGE_ENVIRONMENTS.find(stage => stage.genres.some(name => g.includes(name)))?.id ?? "classic";
}

type Props = { audio: AudioFeatures; isPlaying: boolean; reducedMotion: boolean; reactive?: boolean };

function ResponsiveGroup({ children, audio, isPlaying, reducedMotion, reactive = true }: Props & { children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const energy = reactive && isPlaying ? Math.max(0, Math.min(1, audio.bass ?? audio.energyEnvelope ?? 0)) : 0;
    const target = 1 + energy * .035;
    const scale = reducedMotion ? 1 : target;
    ref.current.scale.setScalar(scale);
    if (!reducedMotion) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * .15) * .012;
  });
  return <group ref={ref}>{children}</group>;
}

function Tower({ x, color }: { x: number; color: string }) {
  return <group position={[x, -.15, -1.9]}>
    <mesh><boxGeometry args={[.2, 3.6, .22]}/><meshStandardMaterial color="#171923" metalness={.8} roughness={.35}/></mesh>
    <StageStaticBatchV775 name="v775-cyberpunk-tower-leds" instances={CYBERPUNK_TOWER_LEDS_V775} geometry="box" color={color}/>
  </group>;
}

function CyberpunkStage(p: Props) {
  return <ResponsiveGroup {...p}>
    <mesh position={[0, -1.99, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 16]}/><meshStandardMaterial color="#090d1c" metalness={.78} roughness={.19}/></mesh>
    {[-3, 3].map(x => <Tower key={x} x={x} color={x < 0 ? "#00f0ff" : "#fa38d7"}/>)}
    <StageStaticBatchV775 name="v775-cyberpunk-neon-columns" instances={CYBERPUNK_SIDE_NEONS_V775} geometry="box" color="#e933e9"/>
    <mesh position={[0, 1.25, -3.2]}><boxGeometry args={[6, .035, .08]}/><meshBasicMaterial color="#00f0ff"/></mesh>
  </ResponsiveGroup>;
}

function VaporwaveStage(p: Props) {
  return <ResponsiveGroup {...p}>
    <mesh position={[0, .95, -7]}><circleGeometry args={[2.35, 64]}/><meshBasicMaterial color="#ff7cae" toneMapped={false}/></mesh>
    <StageStaticBatchV775 name="v775-vaporwave-sunset-bars" instances={VAPORWAVE_BARS_V775} geometry="box" color="#4b174e"/>
    <gridHelper args={[22, 22, "#f65fcd", "#633caf"]} position={[0, -1.93, 0]}/>
    <mesh position={[0, -1.97, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[22, 22]}/><meshBasicMaterial color="#1b1036"/></mesh>
    <StageStaticBatchV775 name="v775-vaporwave-palm-trunks" instances={VAPORWAVE_PALM_TRUNKS_V775} geometry="palmTrunk" color="#572779"/>
    <StageStaticBatchV775 name="v775-vaporwave-palm-leaves" instances={VAPORWAVE_PALM_LEAVES_V775} geometry="palmLeaf" color="#39daa8"/>
  </ResponsiveGroup>;
}

/** V766: One GPU point cloud / one draw call; tier changes recreate only the buffer. */
function GalaxyStarfieldV766() {
  const { tier } = useAdaptivePerformance();
  const count = tier === "low" ? 75 : 210;
  const geometry = useMemo(() => createGalaxyStarfieldV766(count), [count]);
  const screenHeight = useThree(state => state.size.height * state.viewport.dpr);
  const uniforms = useMemo(() => ({ uScreenHeight: { value: screenHeight } }), []);
  uniforms.uScreenHeight.value = screenHeight;
  // An explicitly created geometry must be disposed when its quality tier changes
  // or when the Galaxy stage / its WebGL canvas unmounts.
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <points geometry={geometry} frustumCulled name="GalaxyStarfieldV766">
    <shaderMaterial
      uniforms={uniforms}
      transparent depthWrite={false} depthTest={true} toneMapped={false}
      vertexShader={`attribute vec3 color;
        attribute float starSize;
        uniform float uScreenHeight;
        varying vec3 vStarColor;
        void main() {
          vStarColor = color;
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = clamp(starSize * uScreenHeight * projectionMatrix[1][1] / max(0.1, -viewPosition.z), 1.0, 24.0);
        }`}
      fragmentShader={`varying vec3 vStarColor;
        void main() {
          float r2 = dot(gl_PointCoord * 2.0 - 1.0, gl_PointCoord * 2.0 - 1.0);
          if (r2 > 1.0) discard;
          float opacity = 1.0 - smoothstep(0.6, 1.0, r2);
          gl_FragColor = vec4(vStarColor, opacity);
          #include <colorspace_fragment>
        }`}
    />
  </points>;
}

function GalaxyStage(p: Props) {
  return <ResponsiveGroup {...p}>
    <mesh position={[0, -2.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.45, 48]} />
      <meshStandardMaterial color="#15102c" metalness={.5} roughness={.3} />
    </mesh>
    <GalaxyStarfieldV766 />
    <mesh position={[0, 1, -7]}>
      <sphereGeometry args={[1.8, 28, 18]} />
      <meshBasicMaterial color="#342569" transparent opacity={.3} depthWrite={false} />
    </mesh>
  </ResponsiveGroup>;
}

function WhiteStudioStage(p: Props) {
  return <ResponsiveGroup {...p}><mesh position={[0, -2.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4.1, 64]} /><meshStandardMaterial color="#e6e8ed" metalness={.22} roughness={.28} /></mesh><mesh position={[0, 1.2, -3.3]}><planeGeometry args={[12, 8]} /><meshBasicMaterial color="#e9edf4" /></mesh>{[-3.4, 3.4].map(x => <mesh key={x} position={[x, 2.3, -1]} rotation={[0, x < 0 ? .25 : -.25, 0]}><planeGeometry args={[1.8, 2.7]} /><meshBasicMaterial color="#ffffff" side={2} /></mesh>)}<mesh position={[0, -1.92, 0]}><cylinderGeometry args={[2.1, 2.2, .18, 64]} /><meshStandardMaterial color="#b9c4d4" metalness={.68} roughness={.26} /></mesh></ResponsiveGroup>;
}

/** V772: a single real truss spotlight, shared with the concert light budget.
 * Outer fixtures are still rendered as emissive stage props, not extra lights.
 */
function RockTrussSpotV772(){
  const ref=useRef<SpotLight>(null);
  useFrame(()=>{
    if(ref.current)ref.current.visible=resolveLightingBudgetV772(
      getActivePerformanceTier(),getVisualLevelV640(),'rock').rockSpot;
  });
  return <spotLight ref={ref} position={[0,2.5,-1.7]} color="#ff952e"
    intensity={.85} distance={8} angle={.54} penumbra={.85} castShadow={false}/>;
}
function RockStage(p: Props) {
  return <ResponsiveGroup {...p}>
    <mesh position={[0, -2.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[14,10]}/><meshStandardMaterial color="#28272a" roughness={.93}/></mesh>
    <mesh position={[0, 1, -3.6]}><boxGeometry args={[12,7,.3]}/><meshStandardMaterial color="#25262b" roughness={.9}/></mesh>
    <StageStaticBatchV775 name="v775-rock-truss-posts" instances={ROCK_TRUSS_POSTS_V775} geometry="box" color="#626368" material="standard" metalness={.75}/>
    <StageStaticBatchV775 name="v775-rock-amp-panels" instances={ROCK_AMP_PANELS_V775} geometry="box" color="#121315" material="standard"/>
    <mesh position={[0,3.05,-2]}><boxGeometry args={[8,.17,.17]}/><meshStandardMaterial color="#777a80" metalness={.8}/></mesh>
    <StageStaticBatchV775 name="v775-rock-truss-housings" instances={ROCK_TRUSS_HOUSINGS_V775} geometry="trussHousing" color="#454545" material="standard" metalness={.8} emissive="#ee6d20" emissiveIntensity={.3}/>
    <RockTrussSpotV772/>
  </ResponsiveGroup>;
}

export function StageEnvironment({ theme, children, rotationSpeed, rotationEnabled, audienceEnabled, lightsEnabled, dropEnabled, wavesEnabled, phoneSyncEnabled, phoneMode, domeEnabled, showDirectorEnabled,secondLevelEnabled,skyFormationEnabled,section,
  fullSongDirectorEnabled,ledColumnsEnabled,virtualPyroEnabled,crowdChantEnabled,showIntensity,progressMs,durationMs,
  lasersEnabled,movingSkyEnabled,groundFogEnabled,arenaPeaksEnabled,
  transformingDeckEnabled,transformingDeckMode,transformingDeckStrength,
  floatingStageEnabled,floatingStageMode,floatingStageIntensity,
  hologramsEnabled,laserArchitectureEnabled,hologramPattern,hologramStrength,showDesignerEnabled,showPlan,audienceDirectorEnabled,audienceDirectorStrength,atmosphereDirectorEnabled,atmosphereDirectorStrength,cinematicFinaleEnabled,cinematicFinaleStrength,immersiveEnabled,immersiveStrength,concertDirectorEnabled,concertDirectorStrength,
  liveConcertEnabledV1049,liveConcertStrengthV1049,microphoneActiveV1049,
  storytellingEnabledV1050,storytellingStrengthV1050,
  crowdExperienceEnabledV1051,crowdExperienceStrengthV1051,audienceExperienceEnabledV1073,audienceExperienceStrengthV1073,avatarAudienceCueV1074,crowdEnergyEnabledV1075,crowdEnergyStrengthV1075,
  ultimateConcertEnabledV1052,ultimateConcertStrengthV1052,
  cinematicLightingEnabledV1056,cinematicLightingStrengthV1056,
  intelligentLaserEnabledV1057,intelligentLaserStrengthV1057,
  volumetricLightingEnabledV1058,volumetricLightingStrengthV1058,
  ledWallEnabledV1059,ledWallStrengthV1059,ledWallPatternV1059,
  advancedLedEnabledV1083,advancedLedStrengthV1083,advancedLedModeV1083,lyricTextV1083,
  festivalFxEnabledV1084,festivalFxStrengthV1084,festivalFxModeV1084,
  projectionEnabledV1085,projectionStrengthV1085,projectionModeV1085,
  epicTransformationEnabledV1086,epicTransformationStrengthV1086,epicTransformationModeV1086,
  ultimateFestivalDropEnabledV1087,ultimateFestivalDropStrengthV1087,
  beatIntelligenceEnabledV1089,beatIntelligencePrecisionV1089,
  musicalDynamicsEnabledV1090,musicalDynamicsStrengthV1090,musicalDynamicsStyleV1090,
  lightingChoreographerEnabledV1060,lightingChoreographerStrengthV1060,
  transformingStageEnabledV1066,transformingStageStrengthV1066,
  floatingExperienceEnabledV1067,floatingExperienceStrengthV1067,
  holographicConcertEnabledV1068,holographicConcertStrengthV1068,
  holographicDancersEnabledV1081,holographicDancersStrengthV1081,
  dynamicArchitectureEnabledV1082,dynamicArchitectureStrengthV1082,
  epicDropEnabledV1069,epicDropStrengthV1069,ultimateFinaleEnabledV1070,ultimateFinaleStrengthV1070,smartConcertFlowEnabledV1071,smartConcertFlowStrengthV1071,trackId,genre, ...props }:
  Props & { theme: StageEnvironmentId; children?: React.ReactNode; rotationSpeed?: number; rotationEnabled?: boolean;
    audienceEnabled?: boolean; lightsEnabled?: boolean; dropEnabled?: boolean;
    wavesEnabled?:boolean;phoneSyncEnabled?:boolean;phoneMode?:import("@/lib/arena360ImmersionV1033").ArenaPhoneModeV1033;domeEnabled?:boolean;
    showDirectorEnabled?:boolean;secondLevelEnabled?:boolean;skyFormationEnabled?:boolean;section?:string;
    fullSongDirectorEnabled?:boolean;ledColumnsEnabled?:boolean;virtualPyroEnabled?:boolean;
    crowdChantEnabled?:boolean;showIntensity?:number;progressMs?:number;durationMs?:number;
    lasersEnabled?:boolean;movingSkyEnabled?:boolean;groundFogEnabled?:boolean;arenaPeaksEnabled?:boolean;
    transformingDeckEnabled?:boolean;transformingDeckMode?:import('@/lib/arena360TransformationV1037').ArenaTransformationModeV1037;
    transformingDeckStrength?:number;floatingStageEnabled?:boolean;
    floatingStageMode?:import('@/lib/arena360FloatingStageV1038').FloatingStageModeV1038;floatingStageIntensity?:number;
    hologramsEnabled?:boolean;laserArchitectureEnabled?:boolean;
    hologramPattern?:import('@/lib/arena360HolographyV1039').HologramPatternV1039;
    hologramStrength?:number;showDesignerEnabled?:boolean;
    showPlan?:import('@/lib/arena360ShowDesignerV1040').ArenaShowPlanV1040;
    audienceDirectorEnabled?:boolean;audienceDirectorStrength?:number;
    atmosphereDirectorEnabled?:boolean;atmosphereDirectorStrength?:number;
    // V1047: optional immersive audience renderer.
    cinematicFinaleEnabled?:boolean;cinematicFinaleStrength?:number;immersiveEnabled?:boolean;immersiveStrength?:number;
    concertDirectorEnabled?:boolean;concertDirectorStrength?:number;
    liveConcertEnabledV1049?:boolean;liveConcertStrengthV1049?:number;microphoneActiveV1049?:boolean;
    storytellingEnabledV1050?:boolean;storytellingStrengthV1050?:number;
    crowdExperienceEnabledV1051?:boolean;crowdExperienceStrengthV1051?:number;
    audienceExperienceEnabledV1073?:boolean;audienceExperienceStrengthV1073?:number;
    avatarAudienceCueV1074?:import('@/lib/arena360AvatarAudienceInteractionV1074').AvatarAudienceCueV1074;
    crowdEnergyEnabledV1075?:boolean;crowdEnergyStrengthV1075?:number;
    ultimateConcertEnabledV1052?:boolean;ultimateConcertStrengthV1052?:number;
    cinematicLightingEnabledV1056?:boolean;cinematicLightingStrengthV1056?:number;
    intelligentLaserEnabledV1057?:boolean;intelligentLaserStrengthV1057?:number;
    volumetricLightingEnabledV1058?:boolean;volumetricLightingStrengthV1058?:number;
    ledWallEnabledV1059?:boolean;ledWallStrengthV1059?:number;ledWallPatternV1059?:import('@/lib/arena360LedWallV1059').LedWallPatternV1059;
    advancedLedEnabledV1083?:boolean;advancedLedStrengthV1083?:number;advancedLedModeV1083?:import('@/lib/arena360LedWallExperienceV1083').LedExperienceModeV1083;lyricTextV1083?:string;
    festivalFxEnabledV1084?:boolean;festivalFxStrengthV1084?:number;festivalFxModeV1084?:import('@/lib/arena360FestivalAtmosphereV1084').FestivalModeV1084;
    projectionEnabledV1085?:boolean;projectionStrengthV1085?:number;projectionModeV1085?:import('@/lib/arena360ProjectionMappingV1085').ProjectionModeV1085;
    epicTransformationEnabledV1086?:boolean;epicTransformationStrengthV1086?:number;epicTransformationModeV1086?:import('@/lib/arena360EpicStageTransformationV1086').EpicStageModeV1086;
    ultimateFestivalDropEnabledV1087?:boolean;ultimateFestivalDropStrengthV1087?:number;
    beatIntelligenceEnabledV1089?:boolean;beatIntelligencePrecisionV1089?:import('@/lib/beatDropIntelligenceV1089').BeatPrecisionV1089;
    musicalDynamicsEnabledV1090?:boolean;musicalDynamicsStrengthV1090?:number;musicalDynamicsStyleV1090?:import('@/lib/arena360MusicalDynamicsV1090').MusicalDynamicsStyleV1090;
    lightingChoreographerEnabledV1060?:boolean;lightingChoreographerStrengthV1060?:number;
    transformingStageEnabledV1066?:boolean;transformingStageStrengthV1066?:number;
    floatingExperienceEnabledV1067?:boolean;floatingExperienceStrengthV1067?:number;
    holographicConcertEnabledV1068?:boolean;holographicConcertStrengthV1068?:number;
    holographicDancersEnabledV1081?:boolean;holographicDancersStrengthV1081?:number;
    dynamicArchitectureEnabledV1082?:boolean;dynamicArchitectureStrengthV1082?:number;
    epicDropEnabledV1069?:boolean;epicDropStrengthV1069?:number;
    ultimateFinaleEnabledV1070?:boolean;ultimateFinaleStrengthV1070?:number;
    smartConcertFlowEnabledV1071?:boolean;smartConcertFlowStrengthV1071?:number;
    trackId?:string|null;genre?:string|null }) {
  if (theme === "arena360") {
    return <Arena360StageV1031 {...props} rotationSpeed={rotationSpeed} rotationEnabled={rotationEnabled}
      audienceEnabled={audienceEnabled} lightsEnabled={lightsEnabled} dropEnabled={dropEnabled}
      wavesEnabled={wavesEnabled} phoneSyncEnabled={phoneSyncEnabled} phoneMode={phoneMode} domeEnabled={domeEnabled} showDirectorEnabled={showDirectorEnabled}
      secondLevelEnabled={secondLevelEnabled} skyFormationEnabled={skyFormationEnabled} section={section}
      fullSongDirectorEnabled={fullSongDirectorEnabled} ledColumnsEnabled={ledColumnsEnabled}
      virtualPyroEnabled={virtualPyroEnabled} crowdChantEnabled={crowdChantEnabled}
      showIntensity={showIntensity} progressMs={progressMs} durationMs={durationMs}
      lasersEnabled={lasersEnabled} movingSkyEnabled={movingSkyEnabled}
      groundFogEnabled={groundFogEnabled} arenaPeaksEnabled={arenaPeaksEnabled}
      transformingDeckEnabled={transformingDeckEnabled} transformingDeckMode={transformingDeckMode}
      transformingDeckStrength={transformingDeckStrength}
      floatingStageEnabled={floatingStageEnabled} floatingStageMode={floatingStageMode}
      floatingStageIntensity={floatingStageIntensity}
      hologramsEnabled={hologramsEnabled} laserArchitectureEnabled={laserArchitectureEnabled}
      hologramPattern={hologramPattern} hologramStrength={hologramStrength} showDesignerEnabled={showDesignerEnabled} showPlan={showPlan}
      audienceDirectorEnabled={audienceDirectorEnabled} audienceDirectorStrength={audienceDirectorStrength}
      atmosphereDirectorEnabled={atmosphereDirectorEnabled} atmosphereDirectorStrength={atmosphereDirectorStrength}
      cinematicFinaleEnabled={cinematicFinaleEnabled} cinematicFinaleStrength={cinematicFinaleStrength}
      immersiveEnabled={immersiveEnabled} immersiveStrength={immersiveStrength}
      transformingStageEnabledV1066={transformingStageEnabledV1066}
      transformingStageStrengthV1066={transformingStageStrengthV1066}
      floatingExperienceEnabledV1067={floatingExperienceEnabledV1067}
      floatingExperienceStrengthV1067={floatingExperienceStrengthV1067}
      holographicConcertEnabledV1068={holographicConcertEnabledV1068}
      holographicConcertStrengthV1068={holographicConcertStrengthV1068}
      holographicDancersEnabledV1081={holographicDancersEnabledV1081}
      holographicDancersStrengthV1081={holographicDancersStrengthV1081}
      dynamicArchitectureEnabledV1082={dynamicArchitectureEnabledV1082}
      dynamicArchitectureStrengthV1082={dynamicArchitectureStrengthV1082}
      epicDropEnabledV1069={epicDropEnabledV1069}
      epicDropStrengthV1069={epicDropStrengthV1069}
      ultimateFinaleEnabledV1070={ultimateFinaleEnabledV1070}
      ultimateFinaleStrengthV1070={ultimateFinaleStrengthV1070}
      smartConcertFlowEnabledV1071={smartConcertFlowEnabledV1071}
      smartConcertFlowStrengthV1071={smartConcertFlowStrengthV1071}
      concertDirectorEnabled={concertDirectorEnabled} concertDirectorStrength={concertDirectorStrength}
      liveConcertEnabledV1049={liveConcertEnabledV1049} liveConcertStrengthV1049={liveConcertStrengthV1049}
      microphoneActiveV1049={microphoneActiveV1049}
      storytellingEnabledV1050={storytellingEnabledV1050} storytellingStrengthV1050={storytellingStrengthV1050}
      crowdExperienceEnabledV1051={crowdExperienceEnabledV1051} crowdExperienceStrengthV1051={crowdExperienceStrengthV1051}
      audienceExperienceEnabledV1073={audienceExperienceEnabledV1073} audienceExperienceStrengthV1073={audienceExperienceStrengthV1073} avatarAudienceCueV1074={avatarAudienceCueV1074} crowdEnergyEnabledV1075={crowdEnergyEnabledV1075} crowdEnergyStrengthV1075={crowdEnergyStrengthV1075}
      ultimateConcertEnabledV1052={ultimateConcertEnabledV1052} ultimateConcertStrengthV1052={ultimateConcertStrengthV1052}
      cinematicLightingEnabledV1056={cinematicLightingEnabledV1056}
      cinematicLightingStrengthV1056={cinematicLightingStrengthV1056}
      intelligentLaserEnabledV1057={intelligentLaserEnabledV1057}
      intelligentLaserStrengthV1057={intelligentLaserStrengthV1057}
      volumetricLightingEnabledV1058={volumetricLightingEnabledV1058}
      volumetricLightingStrengthV1058={volumetricLightingStrengthV1058}
      ledWallEnabledV1059={ledWallEnabledV1059}
      ledWallStrengthV1059={ledWallStrengthV1059}
      ledWallPatternV1059={ledWallPatternV1059}
      advancedLedEnabledV1083={advancedLedEnabledV1083}
      advancedLedStrengthV1083={advancedLedStrengthV1083}
      advancedLedModeV1083={advancedLedModeV1083}
      festivalFxEnabledV1084={festivalFxEnabledV1084}
      festivalFxStrengthV1084={festivalFxStrengthV1084}
      festivalFxModeV1084={festivalFxModeV1084}
      projectionEnabledV1085={projectionEnabledV1085}
      projectionStrengthV1085={projectionStrengthV1085}
      projectionModeV1085={projectionModeV1085}
      epicTransformationEnabledV1086={epicTransformationEnabledV1086}
      epicTransformationStrengthV1086={epicTransformationStrengthV1086}
      epicTransformationModeV1086={epicTransformationModeV1086}
      ultimateFestivalDropEnabledV1087={ultimateFestivalDropEnabledV1087}
      ultimateFestivalDropStrengthV1087={ultimateFestivalDropStrengthV1087}
      beatIntelligenceEnabledV1089={beatIntelligenceEnabledV1089}
      beatIntelligencePrecisionV1089={beatIntelligencePrecisionV1089}
      musicalDynamicsEnabledV1090={musicalDynamicsEnabledV1090}
      musicalDynamicsStrengthV1090={musicalDynamicsStrengthV1090}
      musicalDynamicsStyleV1090={musicalDynamicsStyleV1090}
      lyricTextV1083={lyricTextV1083}
      lightingChoreographerEnabledV1060={lightingChoreographerEnabledV1060}
      lightingChoreographerStrengthV1060={lightingChoreographerStrengthV1060}
      trackId={trackId} genre={genre}>
      {children}
    </Arena360StageV1031>;
  }
  let environment: React.ReactNode = null;
  switch (theme) {
    case "cyberpunk": environment = <CyberpunkStage {...props}/>; break;
    case "vaporwave": environment = <VaporwaveStage {...props}/>; break;
    case "galaxy": environment = <GalaxyStage {...props}/>; break;
    case "white": environment = <WhiteStudioStage {...props}/>; break;
    case "rock": environment = <RockStage {...props}/>; break;
  }
  return <>{environment}{children}</>;
}
