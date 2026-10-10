"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import type { Group, Object3D } from "three";
import { useVisualizer } from "@/context/VisualizerContext";
import { getAvatarModel } from "./avatarModels";

function ProceduralPreview({ pulse, intensity }: { pulse: number; intensity: number }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = Math.sin(performance.now() / 330) * 0.06 * intensity + pulse * 0.12 * intensity;
    group.current.rotation.y += (target - group.current.rotation.y) * Math.min(1, delta * 8);
    group.current.position.y += ((Math.sin(performance.now() / 250) * 0.035 * intensity + pulse * 0.06) - group.current.position.y) * Math.min(1, delta * 8);
  });
  return <group ref={group} position={[0, -0.55, 0]} scale={0.85}>
    <mesh position={[0, -0.2, 0]}><capsuleGeometry args={[0.48, 0.7, 6, 12]} /><meshStandardMaterial color="#7557d9" /></mesh>
    <mesh position={[0, 0.75, 0]}><sphereGeometry args={[0.43, 24, 18]} /><meshStandardMaterial color="#e7b99d" /></mesh>
    <mesh position={[0, 1.16, 0]}><sphereGeometry args={[0.27, 18, 12]} /><meshStandardMaterial color="#35264b" /></mesh>
  </group>;
}

function GltfPreview({ url, clip, playing, pulse, intensity, onClips }: {
  url: string;
  clip: string | null;
  playing: boolean;
  pulse: number;
  intensity: number;
  onClips: (clips: string[]) => void;
}) {
  const root = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, root);
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => onClips(names), [names, onClips]);

  useEffect(() => {
    for (const action of Object.values(actions)) action?.stop();
    if (playing && clip && actions[clip]) actions[clip].reset().fadeIn(0.18).play();
    return () => { if (clip) actions[clip]?.fadeOut(0.12); };
  }, [actions, clip, playing]);

  useFrame((_, delta) => {
    if (!root.current) return;
    const target = pulse * 0.1 * intensity;
    root.current.rotation.y += (target - root.current.rotation.y) * Math.min(1, delta * 8);
    root.current.position.y += ((pulse * 0.05 * intensity) - root.current.position.y) * Math.min(1, delta * 8);
  });

  return <group ref={root} scale={0.9}><primitive object={model as Object3D} /></group>;
}

export function AvatarEditor() {
  const { preferences, audio, isPlaying } = useVisualizer();
  const model = getAvatarModel(preferences.avatarModelId);
  const [clip, setClip] = useState<string | null>(null);
  const [clips, setClips] = useState<string[]>([]);
  const [playing, setPlaying] = useState(true);
  const [testBeat, setTestBeat] = useState(false);
  const pulse = testBeat ? 1 : audio.beat ? audio.beatStrength : 0;

  useEffect(() => {
    setClip(null);
    setClips([]);
  }, [model.id]);

  useEffect(() => {
    if (!testBeat) return;
    const timer = window.setTimeout(() => setTestBeat(false), 420);
    return () => window.clearTimeout(timer);
  }, [testBeat]);

  return <section className="avatar-editor" aria-label="Avatar editor">
    <div className="avatar-editor-preview">
      <Canvas camera={{ position: [0, 0.2, 4], fov: 38 }} dpr={[1, 1.25]}>
        <ambientLight intensity={1.8} /><directionalLight position={[3, 4, 5]} intensity={2} />
        <Suspense fallback={<ProceduralPreview pulse={pulse} intensity={preferences.avatarAnimationIntensity} />}>
          {model.url ? <GltfPreview url={model.url} clip={clip} playing={playing} pulse={pulse} intensity={preferences.avatarAnimationIntensity} onClips={setClips} /> : <ProceduralPreview pulse={pulse} intensity={preferences.avatarAnimationIntensity} />}
        </Suspense>
      </Canvas>
      <div className="avatar-editor-live">{isPlaying ? "LIVE AUDIO" : "PAUSED"}</div>
    </div>
    <div className="avatar-editor-controls">
      <div className="avatar-editor-actions">
        <button type="button" onClick={() => setPlaying(value => !value)}>{playing ? "Pause" : "Play"}</button>
        <button type="button" onClick={() => setTestBeat(true)}>Test beat</button>
      </div>
      {model.url ? <label>Animation clip
        <select value={clip ?? ""} onChange={event => setClip(event.target.value || null)}>
          <option value="">Auto / none</option>
          {clips.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label> : <p className="avatar-editor-help">The procedural avatar has no authored clips. Use “Test beat” to preview its reaction.</p>}
      {model.url && clips.length === 0 && <p className="avatar-editor-help">No animation clips were found in this model.</p>}
    </div>
  </section>;
}
