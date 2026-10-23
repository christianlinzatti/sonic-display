"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { memo, useMemo, useRef, type ReactNode } from "react";
import type { Group, Mesh } from "three";
import { Color } from "three";
import type { StageEnvironmentId } from "@/components/visualizer/stages";

type Props = {
  stageId: StageEnvironmentId;
  reactive?: boolean;
  lightStrength?: number;
  reducedMotion?: boolean;
  active?: boolean;
};

type StagePalette = {
  base: string;
  accentA: string;
  accentB: string;
  glow: string;
  fog: string;
  floor: string;
};

const PALETTES: Record<StageEnvironmentId, StagePalette> = {
  classic: { base: "#0f1424", accentA: "#7ea1ff", accentB: "#98c9ff", glow: "#90b5ff", fog: "#b4c8ff", floor: "#121828" },
  neon: { base: "#0d1224", accentA: "#00e7ff", accentB: "#ff4ed2", glow: "#7efaff", fog: "#c45eff", floor: "#0d1120" },
  festival: { base: "#11121d", accentA: "#ffb74d", accentB: "#985cff", glow: "#ffd578", fog: "#c39aff", floor: "#11131e" },
  minimal: { base: "#eceff7", accentA: "#d8e0f5", accentB: "#abb8d6", glow: "#ffffff", fog: "#f6f8ff", floor: "#dde4f1" },
  cyberpunk: { base: "#090d1a", accentA: "#00f0ff", accentB: "#ef33d5", glow: "#86fcff", fog: "#ff7ae3", floor: "#090d18" },
  vaporwave: { base: "#22113d", accentA: "#ff79b3", accentB: "#5de0d2", glow: "#ffc5da", fog: "#a287ff", floor: "#190f30" },
  galaxy: { base: "#060914", accentA: "#8da4ff", accentB: "#77d6ff", glow: "#e2ecff", fog: "#97b6ff", floor: "#091124" },
  white: { base: "#f6f7fb", accentA: "#ffffff", accentB: "#d9dfeb", glow: "#ffffff", fog: "#ffffff", floor: "#eef1f7" },
  rock: { base: "#151111", accentA: "#ff9d56", accentB: "#d74d2f", glow: "#ffd0a8", fog: "#ffb77d", floor: "#161111" },
};

function clampStrength(lightStrength: number | undefined) {
  return Math.max(0.25, Math.min(1.2, (lightStrength ?? 60) / 75));
}

function StageThemeCardSceneComponent({ stageId, reactive = true, lightStrength = 60, reducedMotion = false, active = false }: Props) {
  const palette = PALETTES[stageId];
  const intensity = clampStrength(lightStrength);
  const animate = reactive && !reducedMotion;

  return (
    <div className={`stage-theme-3d-shell ${active ? "active" : ""}`} aria-hidden="true">
      <Canvas
        className="stage-theme-3d-canvas"
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 1.15, 4.7], fov: 34 }}
      >
        <fog attach="fog" args={[palette.base, 5, 11]} />
        <ambientLight intensity={stageId === "white" ? 1.15 : 0.55} color={palette.glow} />
        <directionalLight position={[2.8, 3.6, 2.4]} intensity={0.55 * intensity} color={palette.accentA} />
        <directionalLight position={[-2.4, 2.8, 1.6]} intensity={0.45 * intensity} color={palette.accentB} />
        <SceneRig animate={animate}>
          <PreviewBackdrop stageId={stageId} palette={palette} />
          <Floor stageId={stageId} palette={palette} animate={animate} />
          <PulseStage animate={animate} palette={palette} stageId={stageId} active={active} />
        </SceneRig>
      </Canvas>
      <span className="stage-theme-3d-badge">3D</span>
    </div>
  );
}

const StageThemeCardScene = memo(StageThemeCardSceneComponent);
export { StageThemeCardScene };

function SceneRig({ children, animate }: { children: ReactNode; animate: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current || !animate) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.12;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
  });
  return <group ref={ref}>{children}</group>;
}

function Floor({ stageId, palette, animate }: { stageId: StageEnvironmentId; palette: StagePalette; animate: boolean }) {
  const ring = useRef<Mesh>(null);
  useFrame((state) => {
    if (!animate || !ring.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.04;
    ring.current.scale.set(pulse, pulse, 1);
  });

  const floorColor = stageId === "white" ? "#f4f7fd" : palette.floor;
  const ringColor = stageId === "minimal" || stageId === "white" ? palette.accentB : palette.accentA;

  return (
    <group position={[0, -1.18, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.15, 48]} />
        <meshStandardMaterial color={floorColor} metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.6, 1.28, 48]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.58} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 1.88, 48]} />
        <meshBasicMaterial color={palette.accentB} transparent opacity={stageId === "white" ? 0.18 : 0.34} />
      </mesh>
    </group>
  );
}

function PulseStage({ stageId, palette, animate, active }: { stageId: StageEnvironmentId; palette: StagePalette; animate: boolean; active: boolean }) {
  const beamIntensity = active ? 1.08 : 0.9;
  return (
    <>
      <LightCone position={[-1.3, 1.45, -0.2]} rotation={[0.14, 0.2, 0.46]} color={palette.accentA} animate={animate} phase={0} intensity={beamIntensity} />
      <LightCone position={[0, 1.65, -0.3]} rotation={[0.18, 0, 0]} color={palette.glow} animate={animate} phase={0.6} intensity={beamIntensity * 0.9} />
      <LightCone position={[1.3, 1.45, -0.2]} rotation={[0.14, -0.2, -0.46]} color={palette.accentB} animate={animate} phase={1.2} intensity={beamIntensity} />
      <FogCloud position={[-0.7, -0.82, 0.2]} color={palette.fog} animate={animate} phase={0} />
      <FogCloud position={[0.65, -0.78, 0.4]} color={palette.fog} animate={animate} phase={1.2} />
      {renderStageSet(stageId, palette, animate)}
    </>
  );
}

function renderStageSet(stageId: StageEnvironmentId, palette: StagePalette, animate: boolean) {
  switch (stageId) {
    case "classic":
      return <ClassicSet palette={palette} animate={animate} />;
    case "neon":
      return <NeonSet palette={palette} animate={animate} />;
    case "festival":
      return <FestivalSet palette={palette} animate={animate} />;
    case "minimal":
      return <MinimalSet palette={palette} animate={animate} />;
    case "cyberpunk":
      return <CyberpunkSet palette={palette} animate={animate} />;
    case "vaporwave":
      return <VaporwaveSet palette={palette} animate={animate} />;
    case "galaxy":
      return <GalaxySet palette={palette} animate={animate} />;
    case "white":
      return <WhiteSet palette={palette} animate={animate} />;
    case "rock":
      return <RockSet palette={palette} animate={animate} />;
  }
}

function PreviewBackdrop({ stageId, palette }: { stageId: StageEnvironmentId; palette: StagePalette }) {
  const bgColor = useMemo(() => new Color(palette.base), [palette.base]);
  return (
    <group position={[0, 0.35, -2.75]}>
      <mesh>
        <planeGeometry args={[5.8, 4.8]} />
        <meshBasicMaterial color={bgColor} />
      </mesh>
      {(stageId === "classic" || stageId === "neon" || stageId === "festival" || stageId === "rock" || stageId === "cyberpunk") && (
        <>
          <Tower x={-1.95} color={palette.accentA} />
          <Tower x={1.95} color={palette.accentB} />
        </>
      )}
    </group>
  );
}

function Tower({ x, color }: { x: number; color: string }) {
  return (
    <group position={[x, -0.2, 0]}>
      <mesh>
        <boxGeometry args={[0.2, 2.5, 0.2]} />
        <meshStandardMaterial color="#171c28" metalness={0.82} roughness={0.38} />
      </mesh>
      {[-0.7, 0.1, 0.9].map((y, index) => (
        <mesh key={index} position={[0, y, 0.13]}>
          <boxGeometry args={[0.28, 0.09, 0.05]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function ClassicSet({ palette, animate }: { palette: StagePalette; animate: boolean }) {
  return (
    <group>
      <Pillars color={palette.accentA} accent={palette.accentB} />
      <BackBar y={0.58} color={palette.glow} width={2.9} />
      <AnimatedOrb position={[0, -0.28, 0.35]} color={palette.accentA} animate={animate} />
    </group>
  );
}

function NeonSet({ palette, animate }: { palette: StagePalette; animate: boolean }) {
  return (
    <group>
      <BackBar y={0.6} color={palette.accentA} width={3.1} />
      <BackBar y={0.1} color={palette.accentB} width={2.5} />
      <NeonPanel position={[-1.1, -0.05, -1.45]} color={palette.accentA} />
      <NeonPanel position={[1.1, -0.05, -1.45]} color={palette.accentB} />
      <AnimatedOrb position={[0, -0.32, 0.3]} color={palette.glow} animate={animate} />
    </group>
  );
}

function FestivalSet({ palette, animate }: { palette: StagePalette; animate: boolean }) {
  return (
    <group>
      <Truss color="#293042" y={0.92} />
      <LaserBar position={[-1.42, 0.82, -0.8]} color={palette.accentA} rotation={[0, 0, 0.52]} animate={animate} phase={0} />
      <LaserBar position={[1.42, 0.82, -0.8]} color={palette.accentB} rotation={[0, 0, -0.52]} animate={animate} phase={1} />
      <BackBar y={0.18} color={palette.glow} width={3.6} />
      <AnimatedOrb position={[0, -0.3, 0.28]} color={palette.accentA} animate={animate} />
    </group>
  );
}

function MinimalSet({ palette }: { palette: StagePalette; animate: boolean }) {
  return (
    <group>
      <mesh position={[0, -0.2, -1.6]}>
        <boxGeometry args={[3.3, 1.9, 0.08]} />
        <meshStandardMaterial color="#eef2f8" metalness={0.1} roughness={0.08} />
      </mesh>
      <BackBar y={0.55} color={palette.accentB} width={2.4} />
      <BackBar y={-0.02} color={palette.accentA} width={1.5} />
    </group>
  );
}

function CyberpunkSet({ palette, animate }: { palette: StagePalette; animate: boolean }) {
  return (
    <group>
      <NeonColumn x={-1.05} color={palette.accentA} />
      <NeonColumn x={1.05} color={palette.accentB} />
      <BackBar y={0.72} color={palette.accentA} width={2.9} />
      <BackBar y={0.2} color={palette.accentB} width={2.1} />
      <AnimatedOrb position={[0, -0.26, 0.35]} color={palette.glow} animate={animate} />
    </group>
  );
}

function VaporwaveSet({ palette, animate }: { palette: StagePalette; animate: boolean }) {
  return (
    <group>
      <SunDisk color={palette.accentA} accent={palette.accentB} animate={animate} />
      <GridPlane color={palette.accentB} />
      <PalmTree x={-1.62} color={palette.accentB} leafColor={palette.accentA} />
      <PalmTree x={1.62} color={palette.accentB} leafColor={palette.accentA} />
    </group>
  );
}

function GalaxySet({ palette, animate }: { palette: StagePalette; animate: boolean }) {
  return (
    <group>
      <Sparkles count={42} scale={[4.4, 2.8, 2.6]} size={1.8} speed={animate ? 0.42 : 0} color={palette.glow} position={[0, 0.1, -0.8]} />
      <AnimatedOrb position={[0, 0.15, -0.55]} color={palette.accentA} animate={animate} scale={0.7} />
      <AnimatedOrb position={[-0.75, -0.12, -0.35]} color={palette.accentB} animate={animate} scale={0.35} speed={1.6} />
      <AnimatedOrb position={[0.88, 0.18, -0.48]} color={palette.glow} animate={animate} scale={0.24} speed={1.3} />
    </group>
  );
}

function WhiteSet({ palette, animate }: { palette: StagePalette; animate: boolean }) {
  return (
    <group>
      <mesh position={[0, -0.18, -1.7]}>
        <boxGeometry args={[3.4, 2.0, 0.08]} />
        <meshStandardMaterial color="#ffffff" metalness={0.04} roughness={0.06} />
      </mesh>
      <Softbox position={[-1.3, 0.72, -0.8]} color={palette.accentA} animate={animate} />
      <Softbox position={[1.3, 0.72, -0.8]} color={palette.accentA} animate={animate} />
      <BackBar y={0.12} color={palette.accentB} width={1.8} />
    </group>
  );
}

function RockSet({ palette, animate }: { palette: StagePalette; animate: boolean }) {
  return (
    <group>
      <Truss color="#2b2222" y={0.95} />
      <SpeakerStack x={-1.38} />
      <SpeakerStack x={1.38} />
      <Flare position={[-0.8, -0.54, 0.22]} color={palette.accentA} animate={animate} />
      <Flare position={[0, -0.58, 0.28]} color={palette.glow} animate={animate} phase={0.5} />
      <Flare position={[0.82, -0.54, 0.22]} color={palette.accentB} animate={animate} phase={1} />
      <BackBar y={0.2} color={palette.accentA} width={2.5} />
    </group>
  );
}

function LightCone({ position, rotation, color, animate, phase = 0, intensity = 1 }: { position: [number, number, number]; rotation: [number, number, number]; color: string; animate: boolean; phase?: number; intensity?: number }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current || !animate) return;
    ref.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 1.8 + phase) * 0.18;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh>
        <coneGeometry args={[0.5, 2.9, 22, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.12 * intensity} depthWrite={false} />
      </mesh>
    </group>
  );
}

function FogCloud({ position, color, animate, phase = 0 }: { position: [number, number, number]; color: string; animate: boolean; phase?: number }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current || !animate) return;
    ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.9 + phase) * 0.08;
    ref.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 0.7 + phase) * 0.03;
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh position={[0.22, 0.05, 0.08]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}

function AnimatedOrb({ position, color, animate, scale = 0.26, speed = 2.2 }: { position: [number, number, number]; color: string; animate: boolean; scale?: number; speed?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current || !animate) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.14;
    ref.current.scale.setScalar(scale * pulse);
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 18, 18]} />
      <meshBasicMaterial color={color} transparent opacity={0.78} />
    </mesh>
  );
}

function BackBar({ y, color, width }: { y: number; color: string; width: number }) {
  return (
    <mesh position={[0, y, -1.45]}>
      <boxGeometry args={[width, 0.07, 0.05]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Pillars({ color, accent }: { color: string; accent: string }) {
  return (
    <>
      <mesh position={[-1.18, -0.24, -1.2]}>
        <boxGeometry args={[0.12, 1.6, 0.12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[1.18, -0.24, -1.2]}>
        <boxGeometry args={[0.12, 1.6, 0.12]} />
        <meshBasicMaterial color={accent} />
      </mesh>
    </>
  );
}

function NeonPanel({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.36, 1.2, 0.06]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Truss({ color, y }: { color: string; y: number }) {
  return (
    <group position={[0, y, -1.18]}>
      <mesh>
        <boxGeometry args={[3.4, 0.08, 0.08]} />
        <meshStandardMaterial color={color} metalness={0.76} roughness={0.3} />
      </mesh>
      {[-1.1, 0, 1.1].map((x, index) => (
        <mesh key={index} position={[x, -0.22, 0]} rotation={[0, 0, 0.72]}>
          <boxGeometry args={[0.48, 0.04, 0.04]} />
          <meshStandardMaterial color={color} metalness={0.76} roughness={0.3} />
        </mesh>
      ))}
      {[-1.1, 0, 1.1].map((x, index) => (
        <mesh key={`b-${index}`} position={[x, -0.22, 0]} rotation={[0, 0, -0.72]}>
          <boxGeometry args={[0.48, 0.04, 0.04]} />
          <meshStandardMaterial color={color} metalness={0.76} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function LaserBar({ position, color, rotation, animate, phase }: { position: [number, number, number]; color: string; rotation: [number, number, number]; animate: boolean; phase: number }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current || !animate) return;
    ref.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 2 + phase) * 0.18;
  });
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.05, 1.75, 0.04]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function NeonColumn({ x, color }: { x: number; color: string }) {
  return (
    <group position={[x, -0.08, -1.18]}>
      <mesh>
        <boxGeometry args={[0.06, 1.75, 0.04]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.04]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function SunDisk({ color, accent, animate }: { color: string; accent: string; animate: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current || !animate) return;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
    ref.current.scale.set(scale, scale, 1);
  });
  return (
    <group ref={ref} position={[0, 0.62, -1.58]}>
      <mesh>
        <circleGeometry args={[0.78, 40]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {[-0.22, -0.06, 0.1, 0.26].map((y, index) => (
        <mesh key={index} position={[0, y, 0.01]}>
          <boxGeometry args={[1.2, 0.04, 0.02]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      ))}
    </group>
  );
}

function GridPlane({ color }: { color: string }) {
  return (
    <group position={[0, -1.1, -0.9]} rotation={[-0.96, 0, 0]}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`h-${i}`} position={[0, -0.2 + i * 0.18, 0]}>
          <boxGeometry args={[3.3, 0.02, 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} />
        </mesh>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={`v-${i}`} position={[-1.5 + i * 0.5, 0.24, 0]}>
          <boxGeometry args={[0.02, 1.12, 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function PalmTree({ x, color, leafColor }: { x: number; color: string; leafColor: string }) {
  return (
    <group position={[x, -0.58, -1.05]}>
      <mesh rotation={[0, 0, x < 0 ? 0.1 : -0.1]}>
        <cylinderGeometry args={[0.04, 0.08, 1.15, 8]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.65} />
      </mesh>
      {[-0.45, 0, 0.45].map((r, index) => (
        <mesh key={index} position={[0, 0.65, 0]} rotation={[0, 0, r]}>
          <coneGeometry args={[0.26, 0.7, 3]} />
          <meshBasicMaterial color={leafColor} />
        </mesh>
      ))}
    </group>
  );
}

function Softbox({ position, color, animate }: { position: [number, number, number]; color: string; animate: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current || !animate) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4 + position[0]) * 0.06;
    ref.current.scale.set(pulse, pulse, 1);
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.62, 0.44, 0.04]} />
      <meshBasicMaterial color={color} transparent opacity={0.86} />
    </mesh>
  );
}

function SpeakerStack({ x }: { x: number }) {
  return (
    <group position={[x, -0.45, -0.88]}>
      <mesh>
        <boxGeometry args={[0.44, 1.05, 0.42]} />
        <meshStandardMaterial color="#1c1b1f" metalness={0.46} roughness={0.56} />
      </mesh>
      {[-0.18, 0.18].map((y, index) => (
        <mesh key={index} position={[0, y, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.03, 24]} />
          <meshBasicMaterial color="#35353a" />
        </mesh>
      ))}
    </group>
  );
}

function Flare({ position, color, animate, phase = 0 }: { position: [number, number, number]; color: string; animate: boolean; phase?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current || !animate) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.6 + phase) * 0.18;
    ref.current.scale.setScalar(pulse);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.14, 18, 18]} />
      <meshBasicMaterial color={color} transparent opacity={0.72} />
    </mesh>
  );
}
