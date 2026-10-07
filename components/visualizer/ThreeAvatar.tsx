"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import type { VisualizerProps } from "./registry";

function AvatarRig({ audio, isPlaying, reducedMotion }: VisualizerProps) {
  const root = useRef<Group>(null);
  const head = useRef<Mesh>(null);
  const torso = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!root.current || !head.current || !torso.current) return;
    const movement = reducedMotion || !isPlaying ? 0 : 1;
    const smooth = Math.min(1, delta * 7);
    const pulse = 1 + audio.bass * 0.22 * movement;
    head.current.scale.y += (pulse - head.current.scale.y) * smooth;
    torso.current.scale.x += (1 + audio.volume * 0.12 * movement - torso.current.scale.x) * smooth;
    root.current.rotation.y += ((movement ? Math.sin(state.clock.elapsedTime * 0.65) * 0.16 + (audio.beat ? audio.beatStrength * 0.12 : 0) : 0) - root.current.rotation.y) * smooth;
    root.current.position.y += ((movement ? Math.sin(state.clock.elapsedTime * 2.1) * (0.025 + audio.mids * 0.07) : 0) - root.current.position.y) * smooth;
  });
  return <group ref={root}>
    <mesh ref={torso} position={[0, -0.48, 0]}><capsuleGeometry args={[0.48, 0.62, 6, 12]} /><meshStandardMaterial color="#7557d9" roughness={0.42} /></mesh>
    <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.43, 32, 24]} /><meshStandardMaterial color="#e7b99d" roughness={0.55} /></mesh>
    <mesh ref={head} position={[0, 0.57, 0.02]} scale={[1, 1, 1]}><sphereGeometry args={[0.44, 32, 24]} /><meshStandardMaterial color="#e7b99d" roughness={0.55} /></mesh>
    <mesh position={[-0.16, 0.62, 0.39]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#241b35" /></mesh>
    <mesh position={[0.16, 0.62, 0.39]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#241b35" /></mesh>
    <mesh position={[0, 1.03, 0]}><sphereGeometry args={[0.27, 20, 12]} /><meshStandardMaterial color="#35264b" /></mesh>
    <mesh position={[-0.59, -0.42, 0]} rotation={[0, 0, -0.25]}><capsuleGeometry args={[0.13, 0.55, 4, 8]} /><meshStandardMaterial color="#e7b99d" /></mesh>
    <mesh position={[0.59, -0.42, 0]} rotation={[0, 0, 0.25]}><capsuleGeometry args={[0.13, 0.55, 4, 8]} /><meshStandardMaterial color="#e7b99d" /></mesh>
  </group>;
}
export function ThreeAvatar(props: VisualizerProps) {
  return <div className="visualizer-stage three-avatar-stage" role="img" aria-label="3D music-reactive avatar">
    <Canvas camera={{ position: [0, 0.1, 4.2], fov: 38 }} dpr={[1, 1.5]}>
      <ambientLight intensity={1.7} /><directionalLight position={[3, 4, 5]} intensity={2.2} />
      <AvatarRig {...props} />
    </Canvas>
  </div>;
}
