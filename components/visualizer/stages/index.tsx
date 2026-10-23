"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { AudioFeatures } from "@/types/audio";
import { getActivePerformanceTier } from "../adaptivePerformance";

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
  return <group position={[x, -.15, -1.9]}><mesh><boxGeometry args={[.2, 3.6, .22]} /><meshStandardMaterial color="#171923" metalness={.8} roughness={.35} /></mesh>{[0, .8, 1.6].map(y => <mesh key={y} position={[0, y - 1, .15]}><boxGeometry args={[.28, .06, .09]} /><meshBasicMaterial color={color} /></mesh>)}</group>;
}

function CyberpunkStage(p: Props) {
  return <ResponsiveGroup {...p}><mesh position={[0, -1.99, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 16]} /><meshStandardMaterial color="#090d1c" metalness={.78} roughness={.19} /></mesh>{[-3, 3].map(x => <Tower key={x} x={x} color={x < 0 ? "#00f0ff" : "#fa38d7"} />)}{[-2.5, 2.5].map(x => <mesh key={x} position={[x, .2, -2.65]}><boxGeometry args={[.065, 4.1, .1]} /><meshBasicMaterial color="#e933e9" /></mesh>)}<mesh position={[0, 1.25, -3.2]}><boxGeometry args={[6, .035, .08]} /><meshBasicMaterial color="#00f0ff" /></mesh></ResponsiveGroup>;
}

function VaporwaveStage(p: Props) {
  return <ResponsiveGroup {...p}><mesh position={[0, .95, -7]}><circleGeometry args={[2.35, 64]} /><meshBasicMaterial color="#ff7cae" toneMapped={false} /></mesh>{Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0, -.9 + i * .24, -6.9]}><boxGeometry args={[5, .05, .06]} /><meshBasicMaterial color="#4b174e" /></mesh>)}<gridHelper args={[22, 22, "#f65fcd", "#633caf"]} position={[0, -1.93, 0]} /><mesh position={[0, -1.97, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[22, 22]} /><meshBasicMaterial color="#1b1036" /></mesh>{[-4, 4].map(x => <group key={x} position={[x, -1.8, -3]}><mesh position={[0, .95, 0]}><cylinderGeometry args={[.055, .1, 2.1, 8]} /><meshBasicMaterial color="#572779" /></mesh>{[-.5, 0, .5].map((a, i) => <mesh key={i} position={[a, 2.15, -.15]} rotation={[0, 0, -a * .65]}><coneGeometry args={[.54, 1.2, 4]} /><meshBasicMaterial color="#39daa8" /></mesh>)}</group>)}</ResponsiveGroup>;
}

function GalaxyStage(p: Props) {
  const low = getActivePerformanceTier() === "low";
  const count = low ? 75 : 210;
  return <ResponsiveGroup {...p}><mesh position={[0, -2.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.45, 48]} /><meshStandardMaterial color="#15102c" metalness={.5} roughness={.3} /></mesh>{Array.from({ length: count }, (_, i) => { const t = i * 2.399963, r = 2.5 + Math.sqrt(i / count) * 11; return <mesh key={i} position={[Math.cos(t) * r, Math.sin(i * 19.17) * 5, Math.sin(t) * r - 5]}><sphereGeometry args={[i % 9 === 0 ? .045 : .02, 4, 4]} /><meshBasicMaterial color={i % 3 === 0 ? "#86b6ff" : i % 3 === 1 ? "#f9d1ff" : "#ffffff"} /></mesh>; })}<mesh position={[0, 1, -7]}><sphereGeometry args={[1.8, 28, 18]} /><meshBasicMaterial color="#342569" transparent opacity={.3} depthWrite={false} /></mesh></ResponsiveGroup>;
}

function WhiteStudioStage(p: Props) {
  return <ResponsiveGroup {...p}><mesh position={[0, -2.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4.1, 64]} /><meshStandardMaterial color="#e6e8ed" metalness={.22} roughness={.28} /></mesh><mesh position={[0, 1.2, -3.3]}><planeGeometry args={[12, 8]} /><meshBasicMaterial color="#e9edf4" /></mesh>{[-3.4, 3.4].map(x => <mesh key={x} position={[x, 2.3, -1]} rotation={[0, x < 0 ? .25 : -.25, 0]}><planeGeometry args={[1.8, 2.7]} /><meshBasicMaterial color="#ffffff" side={2} /></mesh>)}<mesh position={[0, -1.92, 0]}><cylinderGeometry args={[2.1, 2.2, .18, 64]} /><meshStandardMaterial color="#b9c4d4" metalness={.68} roughness={.26} /></mesh></ResponsiveGroup>;
}

function RockStage(p: Props) {
  return <ResponsiveGroup {...p}><mesh position={[0, -2.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#28272a" roughness={.93} /></mesh><mesh position={[0, 1, -3.6]}><boxGeometry args={[12, 7, .3]} /><meshStandardMaterial color="#25262b" roughness={.9} /></mesh>{[-3.7, 3.7].map(x => <group key={x}><mesh position={[x, .7, -2]}><boxGeometry args={[.22, 5.2, .22]} /><meshStandardMaterial color="#626368" metalness={.75} /></mesh>{[-1.3, .3, 1.9].map(y => <mesh key={y} position={[x, y, -1.8]}><boxGeometry args={[1, .7, .25]} /><meshStandardMaterial color="#121315" /></mesh>)}</group>)}<mesh position={[0, 3.05, -2]}><boxGeometry args={[8, .17, .17]} /><meshStandardMaterial color="#777a80" metalness={.8} /></mesh>{[-2.6, 0, 2.6].map(x => <group key={x}><mesh position={[x, 2.72, -1.8]}><cylinderGeometry args={[.18, .22, .4, 12]} /><meshStandardMaterial color="#454545" metalness={.8} /></mesh><spotLight position={[x, 2.5, -1.7]} color="#ff952e" intensity={.85} distance={8} angle={.54} penumbra={.85} /></group>)}</ResponsiveGroup>;
}

export function StageEnvironment({ theme, ...props }: Props & { theme: StageEnvironmentId }) {
  switch (theme) {
    case "cyberpunk":
      return <CyberpunkStage {...props} />;
    case "vaporwave":
      return <VaporwaveStage {...props} />;
    case "galaxy":
      return <GalaxyStage {...props} />;
    case "white":
      return <WhiteStudioStage {...props} />;
    case "rock":
      return <RockStage {...props} />;
    default:
      return null;
  }
}
