"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Group } from "three";
import type { UiPreferences } from "@/types/music";

type BeatStyle = "hardstyle" | "techno" | "house" | "half-time";

const beatStyles: Record<BeatStyle, { label: string; bpm: number; accent: number; bounce: number }> = {
  hardstyle: { label: "Hardstyle", bpm: 150, accent: 1.3, bounce: 1.2 },
  techno: { label: "Techno", bpm: 135, accent: 1, bounce: 0.8 },
  house: { label: "House", bpm: 125, accent: 0.8, bounce: 0.65 },
  "half-time": { label: "Half-time", bpm: 85, accent: 1.15, bounce: 1 },
};

type Props = {
  modelUrl: string | null;
  preferences: UiPreferences;
};

function PreviewMotion({ playing, speed, intensity, beatEnabled, bpm, style, onBeat, children }: {
  playing: boolean; speed: number; intensity: number; beatEnabled: boolean; bpm: number;
  style: BeatStyle; onBeat: (beat: number) => void; children: ReactNode;
}) {
  const group = useRef<Group>(null);
  const elapsed = useRef(0);
  const previousBeat = useRef(-1);
  const beatCallback = useRef(onBeat);
  beatCallback.current = onBeat;
  useFrame((_, delta) => {
    if (!group.current) return;
    if (playing) elapsed.current += Math.min(delta, 0.1) * speed;
    const t = elapsed.current;
    const amp = playing ? intensity : 0;
    const rhythm = beatStyles[style];
    const beatPosition = t * bpm / 60;
    const beatIndex = Math.floor(beatPosition);
    const beatPhase = beatPosition - beatIndex;
    if (beatEnabled && playing && beatIndex !== previousBeat.current) {
      previousBeat.current = beatIndex;
      beatCallback.current(beatIndex);
    }
    const accent = beatIndex % 4 === 0 ? rhythm.accent : 1;
    const kick = beatEnabled && playing ? Math.exp(-beatPhase * 12) * accent : 0;
    group.current.position.y = (Math.abs(Math.sin(t * 2.5)) * 0.08 + kick * 0.14 * rhythm.bounce) * amp;
    group.current.rotation.z = (Math.sin(t * 1.4) * 0.07 + (beatIndex % 2 ? 1 : -1) * kick * 0.12) * amp;
    group.current.rotation.y = Math.sin(t * 0.9) * 0.14 * amp;
    const pulse = 1 + kick * 0.045 * amp;
    group.current.scale.set(pulse, 1 - kick * 0.04 * amp, pulse);
  });
  return <group ref={group}>{children}</group>;
}

function ProceduralModel() {
  return <group>
    <mesh position={[0, -0.48, 0]}><capsuleGeometry args={[0.43, 0.65, 6, 16]} /><meshStandardMaterial color="#7557d9" roughness={0.45}/></mesh>
    <mesh position={[0, 0.53, 0]}><sphereGeometry args={[0.43, 24, 20]}/><meshStandardMaterial color="#e7b99d"/></mesh>
    <mesh position={[0, 0.98, 0]}><sphereGeometry args={[0.27, 20, 14]}/><meshStandardMaterial color="#35264b"/></mesh>
    <mesh position={[-0.16, 0.58, 0.38]}><sphereGeometry args={[0.037, 12, 12]}/><meshBasicMaterial color="#241b35"/></mesh>
    <mesh position={[0.16, 0.58, 0.38]}><sphereGeometry args={[0.037, 12, 12]}/><meshBasicMaterial color="#241b35"/></mesh>
    <mesh position={[-0.59, -0.42, 0]} rotation={[0, 0, -0.25]}><capsuleGeometry args={[0.13, 0.55, 4, 8]}/><meshStandardMaterial color="#e7b99d"/></mesh>
    <mesh position={[0.59, -0.42, 0]} rotation={[0, 0, 0.25]}><capsuleGeometry args={[0.13, 0.55, 4, 8]}/><meshStandardMaterial color="#e7b99d"/></mesh>
  </group>;
}

function GltfPreview({ url, playing, speed }: { url: string; playing: boolean; speed: number }) {
  const root = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const model = useMemo(() => cloneSkinnedScene(scene), [scene]);
  const { actions, names } = useAnimations(animations, root);
  useEffect(() => {
    const dance = names.find(name => /dance|groove|move/i.test(name));
    const idle = names.find(name => /idle|stand|rest/i.test(name));
    const selected = playing ? (dance ?? idle ?? names[0]) : (idle ?? names[0]);
    const action = selected ? actions[selected] : undefined;
    if (action) {
      action.reset().fadeIn(0.2).play();
      action.paused = !playing;
      action.timeScale = speed;
    }
    for (const [name, other] of Object.entries(actions)) if (name !== selected) other?.fadeOut(0.2);
    return () => { action?.fadeOut(0.15); };
  }, [actions, names, playing, speed]);
  return <group ref={root}><primitive object={model}/></group>;
}

export function AvatarPreview3D({ modelUrl, preferences }: Props) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [beatEnabled, setBeatEnabled] = useState(false);
  const [bpm, setBpm] = useState(150);
  const [style, setStyle] = useState<BeatStyle>("hardstyle");
  const [beatCount, setBeatCount] = useState(0);
  const [beatPulse, setBeatPulse] = useState(false);
  const beatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (beatTimer.current) clearTimeout(beatTimer.current); }, []);
  const handleBeat = (beat: number) => {
    setBeatCount(beat + 1);
    setBeatPulse(true);
    if (beatTimer.current) clearTimeout(beatTimer.current);
    beatTimer.current = setTimeout(() => setBeatPulse(false), 100);
  };
  const chooseStyle = (next: BeatStyle) => { setStyle(next); setBpm(beatStyles[next].bpm); setBeatCount(0); };
  const intensity = preferences.reducedMotion ? 0 : preferences.avatarAnimationIntensity;
  return <div className="avatar-preview-interactive">
    <div className="avatar-preview-canvas" role="img" aria-label="Interaktive 3D-Vorschau des Avatars; mit Maus oder Touch drehen und zoomen">
      <Canvas key={resetKey} camera={{ position: [0, 0.15, 4.2], fov: 38 }} dpr={[1, 1.5]} gl={{ powerPreference: "low-power" }}>
        <ambientLight intensity={1.7}/><directionalLight position={[3, 4, 5]} intensity={2.2}/>
        <group scale={preferences.avatarScale} position={[0, preferences.avatarOffsetY, 0]}>
          <PreviewMotion playing={playing && !preferences.reducedMotion} speed={speed} intensity={intensity} beatEnabled={beatEnabled} bpm={bpm} style={style} onBeat={handleBeat}>
            {modelUrl ? <Suspense fallback={<ProceduralModel/>}><GltfPreview url={modelUrl} playing={playing && !preferences.reducedMotion} speed={speed}/></Suspense> : <ProceduralModel/>}
          </PreviewMotion>
        </group>
        <OrbitControls enablePan={false} enableZoom minDistance={1.8} maxDistance={8} autoRotate={autoRotate && !playing} autoRotateSpeed={1.2}/>
      </Canvas>
    </div>
    <div className="avatar-preview-toolbar">
      <button type="button" onClick={() => setPlaying(value => !value)} disabled={preferences.reducedMotion} aria-pressed={playing}>{playing ? "⏸ Tanz pausieren" : "▶ Tanz testen"}</button>
      <label>Tempo <select value={speed} onChange={e => setSpeed(Number(e.target.value))} aria-label="Vorschau-Tempo"><option value={0.5}>0,5×</option><option value={1}>1×</option><option value={1.5}>1,5×</option><option value={2}>2×</option></select></label>
      <button type="button" aria-pressed={autoRotate} onClick={() => setAutoRotate(value => !value)}>{autoRotate ? "Rotation aus" : "Auto-Rotation"}</button>
      <button type="button" onClick={() => setResetKey(value => value + 1)}>Ansicht zurücksetzen</button>
    </div>
    <fieldset className="avatar-beat-simulator">
      <legend>Beat-Simulator</legend>
      <p className="avatar-beat-intro">Teste die Reaktion des Avatars auf simulierte Kicks – ohne Spotify und ohne Mikrofon.</p>
      <div className="avatar-beat-controls">
        <label>Rhythmus <select value={style} onChange={event => chooseStyle(event.target.value as BeatStyle)}>
          {(Object.keys(beatStyles) as BeatStyle[]).map(key => <option key={key} value={key}>{beatStyles[key].label}</option>)}
        </select></label>
        <label>BPM <output htmlFor="avatar-bpm">{bpm}</output><input id="avatar-bpm" type="range" min={60} max={200} step={1} value={bpm} onChange={event => setBpm(Number(event.target.value))} /></label>
        <button type="button" aria-pressed={beatEnabled} onClick={() => { setBeatEnabled(value => !value); setPlaying(true); }} disabled={preferences.reducedMotion}>{beatEnabled ? "■ Simulator aus" : "▶ Simulator starten"}</button>
        <div className="avatar-beat-meter" aria-live="off"><span className={beatPulse && beatEnabled && playing ? "avatar-beat-light active" : "avatar-beat-light"} aria-hidden="true"/><span>Kick {beatEnabled ? beatCount : "–"}</span></div>
      </div>
      <small>Nur visuelle Simulation: Die Kick-Impulse folgen dem BPM-Regler. Es wird kein Audio abgespielt und keine Spotify-Analyse simuliert.</small>
    </fieldset>
    <p className="avatar-preview-help">Ziehen zum Drehen · Scrollen oder Pinch zum Zoomen · Demo-Bewegung ohne Spotify</p>
  </div>;
}
