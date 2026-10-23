"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
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

function PreviewScene({ stageId, reactive, lightStrength, reducedMotion, playing, showFx, autorotate, resetKey }: {
  stageId: StageEnvironmentId; reactive: boolean; lightStrength: number; reducedMotion: boolean;
  playing: boolean; showFx: boolean; autorotate: boolean; resetKey: number;
}) {
  const palette = colors[stageId];
  const audio = useRef<AudioFeatures>({...initialAudio});
  const strength = Math.max(.1, Math.min(1.45, lightStrength / 70));
  const motion = playing && !reducedMotion;
  return <Canvas
    key={resetKey}
    className="stage-preview-modal-canvas"
    gl={{antialias:true, alpha:false, powerPreference:"low-power"}}
    dpr={[1,1.5]}
    camera={{position:[0,1.2,8.2],fov:47,near:.1,far:80}}
    fallback={<div className="stage-preview-webgl-fallback">WebGL-Vorschau ist in diesem Browser nicht verfügbar.</div>}
  >
    <PreviewBeatDriver audio={audio.current} playing={playing} enabled={reactive} reducedMotion={reducedMotion} />
    <fog attach="fog" args={[palette.fog,9,26]} />
    <DynamicStage theme={stageId} audio={audio.current} isPlaying={motion} reducedMotion={reducedMotion} reactive={reactive && playing} strength={lightStrength} />
    <StageEnvironment theme={stageId} audio={audio.current} isPlaying={motion} reducedMotion={reducedMotion} reactive={reactive && playing} />
    {showFx && <>
      <MovingSpotlight position={[-2.55,3.05,-1.1]} color={palette.first} phase={0} moving={motion} strength={strength}/>
      <MovingSpotlight position={[2.55,3.05,-1.1]} color={palette.second} phase={1.8} moving={motion} strength={strength}/>
      <HazeCloud position={[-1.4,-1.6,.1]} tint={palette.fog} phase={0} moving={motion}/>
      <HazeCloud position={[.45,-1.7,.6]} tint={palette.fog} phase={1.7} moving={motion}/>
    </>}
    <OrbitControls
      makeDefault
      enableRotate
      enableZoom
      enablePan
      autoRotate={autorotate && motion}
      autoRotateSpeed={.4}
      enableDamping={!reducedMotion}
      target={[0,-.1,-.8]}
      minDistance={3}
      maxDistance={17}
      minPolarAngle={.12}
      maxPolarAngle={Math.PI-.15}
    />
  </Canvas>;
}

export function StagePreviewModal({stageId,selectedStageId,onSelect,onClose,reactive,lightStrength,reducedMotion}:StagePreviewModalProps) {
  const [previewStage,setPreviewStage] = useState<StageEnvironmentId>(stageId);
  const [playing,setPlaying] = useState(true);
  const [showFx,setShowFx] = useState(true);
  const [autorotate,setAutorotate] = useState(false);
  const [resetKey,setResetKey] = useState(0);
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
      <div className="stage-preview-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialog}>
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
            autorotate={autorotate} resetKey={resetKey}
          />
          <span className="stage-preview-modal-watermark">LIVE 3D · {definition.mood}</span>
        </div>
        <p className="stage-preview-modal-help">Mit Maus oder Finger ziehen: drehen · Mausrad oder Pinch: zoomen · Rechtsklick: verschieben. Die Beat-Reaktion ist eine Demo-Simulation, kein gemessener Spotify-Audiostream.</p>
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
