"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { retargetHumanoidClips, readRetargetCalibration, RETARGET_EVENT } from "./avatarAnimationRetarget";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import { AnimationMixer, LoopOnce, type AnimationClip, type Group } from "three";
import {readFootLockV322} from "./intelligentFootLockV322";
import { createFootIKState, initializeFootIK, updateFootIK } from "./avatarFootIK";
import { collectAvatarRigNodes } from "./avatarRigController";
import type { UiPreferences } from "@/types/music";
import { type AvatarLoopPreset, readAvatarLoopPresets, persistAvatarLoopPresets, getActiveAvatarLoop, setActiveAvatarLoop } from "./avatarLoopPresets";

import { type AvatarChoreography, type ChoreographyStep, readChoreographies, saveChoreographies, setActiveChoreography } from "./avatarChoreographies";

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
  studio?: boolean;
  animationUrl?: string;
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

type TimelineClip = { id: string; label: string; duration: number };
type TimelineState = { clipId: string; start: number; end: number; cursor: number; playing: boolean; speed: number };

/** Each preview owns an independent mixer; external clips are retargeted against its cloned rig. */
function GltfPreview({ url, animationUrl, timeline, onClips, onPosition, footIK, preferences }: {
  url: string; animationUrl?: string; timeline: TimelineState;
  onClips: (clips: TimelineClip[]) => void; onPosition: (time: number) => void;
  footIK: boolean; preferences: UiPreferences;
}) {
  const root = useRef<Group>(null);
  const ik = useRef(createFootIKState());
  const { scene, animations } = useGLTF(url);
  const model = useMemo(() => cloneSkinnedScene(scene), [scene]);
  const mixer = useMemo(() => new AnimationMixer(model), [model]);
  const [externalClips, setExternalClips] = useState<AnimationClip[]>([]);
  const [calibrationVersion, setCalibrationVersion] = useState(0);
  useEffect(() => { const update = () => setCalibrationVersion(v=>v+1); window.addEventListener(RETARGET_EVENT, update); window.addEventListener("storage", update); return () => {window.removeEventListener(RETARGET_EVENT, update); window.removeEventListener("storage", update);}; }, []);
  const externalRequest = useRef(0);
  const clock = useRef(0);
  const selectedAction = useRef<ReturnType<AnimationMixer["clipAction"]> | null>(null);
  const onPositionRef = useRef(onPosition);
  onPositionRef.current = onPosition;
  const [compatible, setCompatible] = useState(false);
  useEffect(() => {
    const targets = collectAvatarRigNodes(model, preferences.avatarRigProfile).targets;
    ik.current = initializeFootIK(model, targets);
    setCompatible(Boolean(ik.current.left || ik.current.right));
  }, [model, preferences.avatarRigProfile]);
  useEffect(() => {
    const request = ++externalRequest.current;
    setExternalClips([]);
    if (!animationUrl) return;
    new GLTFLoader().load(animationUrl, gltf => {
      if (request !== externalRequest.current) return;
      const converted = retargetHumanoidClips(gltf.animations, gltf.scene, model, readRetargetCalibration(url));
      setExternalClips(converted.clips);
    }, undefined, error => {
      if (request === externalRequest.current) console.warn("Preview animation GLB could not be loaded", error);
    });
    return () => { externalRequest.current++; };
  }, [animationUrl, model, url, calibrationVersion]);
  const allClips = useMemo(() => [
    ...animations.map((clip, i) => ({ id: `embedded:${i}`, label: clip.name || `Clip ${i+1}`, clip })),
    ...externalClips.map((clip, i) => ({ id: `external:${i}`, label: `Import · ${clip.name || `Clip ${i+1}`}`, clip })),
  ], [animations, externalClips]);
  useEffect(() => { onClips(allClips.map(({ id, label, clip }) => ({ id, label, duration: clip.duration }))); }, [allClips, onClips]);
  const selected = allClips.find(c => c.id === timeline.clipId) ?? allClips[0];
  useEffect(() => {
    mixer.stopAllAction();
    selectedAction.current = null;
    if (!selected) return;
    const action = mixer.clipAction(selected.clip);
    action.reset(); action.setLoop(LoopOnce, 1); action.clampWhenFinished = true;
    action.play(); action.paused = true;
    selectedAction.current = action;
    clock.current = Math.max(0, Math.min(selected.clip.duration, timeline.start));
    mixer.setTime(clock.current);
    return () => { action.stop(); selectedAction.current = null; };
    // Only rebind when selected clip changes, not on every timeline edit.
  }, [mixer, selected?.id, selected?.clip]);
  const seekRequest = useRef(timeline.cursor);
  useEffect(() => {
    if (Math.abs(timeline.cursor - seekRequest.current) > 0.035) {
      clock.current = Math.max(0, Math.min(selected?.clip.duration ?? 0, timeline.cursor));
      mixer.setTime(clock.current);
    }
    seekRequest.current = timeline.cursor;
  }, [timeline.cursor, mixer, selected?.clip.duration]);
  const lastReport = useRef(0);
  useFrame((state, delta) => {
    if (!root.current || !selected || !selectedAction.current) return;
    const duration = Math.max(0.01, selected.clip.duration);
    const start = Math.min(Math.max(0, timeline.start), duration);
    const end = Math.max(start + 0.01, Math.min(duration, timeline.end || duration));
    if (timeline.playing && !preferences.reducedMotion) {
      clock.current += Math.min(delta, 0.1) * timeline.speed;
      if (clock.current >= end) clock.current = start + ((clock.current - start) % (end - start));
      mixer.setTime(clock.current);
    }
    updateFootIK(ik.current, root.current, delta, timeline.playing && footIK && compatible && (preferences.avatarFootIKEnabled ?? true),
      (preferences.avatarFootIKStrength ?? 70) / 100,
      (preferences.avatarFootIKContact ?? 50) / 100,
      (preferences.avatarFootIKLock ?? 50) / 100, undefined, undefined, readFootLockV322(),{playheadMs:clock.current*1000,trackId:timeline.clipId});
    if (state.clock.elapsedTime - lastReport.current >= 0.1) {
      lastReport.current = state.clock.elapsedTime;
      onPositionRef.current(clock.current);
    }
  });
  useEffect(() => () => { mixer.stopAllAction(); }, [mixer]);
  return <group ref={root}><primitive object={model}/></group>;
}

export function AvatarPreview3D({ modelUrl, preferences, studio = false, animationUrl }: Props) {
  const [playing, setPlaying] = useState(false);
  const [compareIK, setCompareIK] = useState(false);
  const [previewIK, setPreviewIK] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [clipId, setClipId] = useState("");
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [duration, setDuration] = useState(0);
  const [savedLoops, setSavedLoops] = useState<AvatarLoopPreset[]>([]);
  const [loopName, setLoopName] = useState("");
  const [chosenLoop, setChosenLoop] = useState("");
  const [loopMessage, setLoopMessage] = useState("");
  const [choreographies, setChoreographies] = useState<AvatarChoreography[]>([]);
  const [choreographyName, setChoreographyName] = useState("");
  const [choreographySteps, setChoreographySteps] = useState<ChoreographyStep[]>([]);
  const [selectedChoreography, setSelectedChoreography] = useState("");
  const [repeatChoreography, setRepeatChoreography] = useState(true);
  const [choreographyMessage, setChoreographyMessage] = useState("");
  const [draggedStep, setDraggedStep] = useState<number | null>(null);
  const [previewSequenceIndex, setPreviewSequenceIndex] = useState<number | null>(null);
  const previewStepsRef = useRef<ChoreographyStep[]>([]);
  const previewIndexRef = useRef<number | null>(null);
  const previewRepeatRef = useRef(false);
  const nextStepPending = useRef(false);
  const moveStep = (from: number, to: number) => {
    if (from < 0 || to < 0 || from === to) return;
    setChoreographySteps(old => {
      if (from >= old.length || to >= old.length) return old;
      const next = [...old]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); return next;
    });
  };
  const stopSequencePreview = () => {
    previewIndexRef.current = null; setPreviewSequenceIndex(null); setPlaying(false);
  };
  const showSequenceStep = (index: number, steps: ChoreographyStep[]) => {
    const step = steps[index];
    const preset = savedLoops.find(p => p.id === step?.loopId && p.modelUrl === modelUrl && p.animationUrl === (animationUrl ?? ""));
    if (!preset || !clips.some(clip => clip.id === preset.clipId)) {
      stopSequencePreview(); setChoreographyMessage("Ein Animationsclip der Vorschau fehlt."); return;
    }
    previewIndexRef.current = index; setPreviewSequenceIndex(index);
    pendingLoop.current = preset; setClipId(preset.clipId);
    setLoopStart(preset.start); setLoopEnd(preset.end); setCursor(preset.start); setSpeed(preset.speed);
    setPlaying(true); nextStepPending.current = false;
  };
  const startSequencePreview = () => {
    if (!choreographySteps.length) return;
    previewStepsRef.current = [...choreographySteps]; previewRepeatRef.current = repeatChoreography;
    showSequenceStep(0, previewStepsRef.current);
    setChoreographyMessage("3D-Vorschau läuft. Übergänge werden hier als Clipwechsel gezeigt; weiche Crossfades laufen in der Live-Bühne.");
  };
  useEffect(() => { if (studio) setChoreographies(readChoreographies()); }, [studio]);
  const matchingChoreographies = choreographies.filter(c => c.modelUrl === modelUrl && c.animationUrl === (animationUrl ?? ""));
  const addStep = () => {
    if (!chosenLoop || !matchingLoops.some(p => p.id === chosenLoop)) { setChoreographyMessage("Bitte zuerst einen gespeicherten Loop auswählen."); return; }
    setChoreographySteps(old => old.length >= 24 ? old : [...old, { loopId: chosenLoop, transition: 0.35, beatAligned: false }]);
    setChoreographyMessage("");
  };
  const editStep = (index: number, changes: Partial<ChoreographyStep>) =>
    setChoreographySteps(old => old.map((step, i) => i === index ? { ...step, ...changes } : step));
  const saveSequence = () => {
    const name = choreographyName.trim().slice(0, 60);
    if (!modelUrl || !name || !choreographySteps.length || choreographySteps.some(s => !matchingLoops.some(l => l.id === s.loopId))) {
      setChoreographyMessage("Name und mindestens einen gültigen Dance Loop angeben."); return;
    }
    const existing = matchingChoreographies.find(c => c.id === selectedChoreography);
    if (!existing && choreographies.length >= 30) { setChoreographyMessage("Maximal 30 Choreografien möglich."); return; }
    const item: AvatarChoreography = { id: existing?.id ?? `choreo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name, modelUrl, animationUrl: animationUrl ?? "", repeat: repeatChoreography, steps: choreographySteps };
    const next = existing ? choreographies.map(c => c.id === existing.id ? item : c) : [...choreographies, item];
    saveChoreographies(next); setChoreographies(next); setSelectedChoreography(item.id);
    setChoreographyMessage(`Choreografie „${name}“ gespeichert.`);
  };
  const loadSequence = () => {
    const item = matchingChoreographies.find(c => c.id === selectedChoreography);
    if (!item) return;
    setChoreographyName(item.name); setChoreographySteps(item.steps); setRepeatChoreography(item.repeat);
    setChoreographyMessage(`„${item.name}“ geladen.`);
  };
  const removeSequence = () => {
    if (!selectedChoreography) return;
    const next = choreographies.filter(c => c.id !== selectedChoreography);
    saveChoreographies(next); setActiveChoreography(null); setChoreographies(next);
    setSelectedChoreography(""); setChoreographyName(""); setChoreographySteps([]);
    setChoreographyMessage("Choreografie gelöscht.");
  };

  useEffect(() => {
    if (!studio) return;
    setSavedLoops(readAvatarLoopPresets());
    setChosenLoop(getActiveAvatarLoop(modelUrl ?? "", animationUrl ?? "")?.id ?? "");
  }, [studio, modelUrl, animationUrl]);
  const pendingLoop = useRef<AvatarLoopPreset | null>(null);
  const matchingLoops = savedLoops.filter(p => p.modelUrl === modelUrl && p.animationUrl === (animationUrl ?? ""));
  const saveLoop = () => {
    const name = loopName.trim().slice(0, 60);
    if (!name || !modelUrl || !clipId || loopEnd <= loopStart || !duration) {
      setLoopMessage("Bitte Namen und gültigen Loop-Bereich angeben."); return;
    }
    if (savedLoops.length >= 50) { setLoopMessage("Maximal 50 gespeicherte Loops."); return; }
    const preset: AvatarLoopPreset = { id: `loop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name, modelUrl, animationUrl: animationUrl ?? "", clipId, start: loopStart, end: loopEnd, speed };
    const next = [...savedLoops, preset];
    persistAvatarLoopPresets(next); setSavedLoops(next); setChosenLoop(preset.id); setLoopName("");
    setLoopMessage(`Loop „${name}“ gespeichert.`);
  };
  const loadLoop = () => {
    const preset = matchingLoops.find(p => p.id === chosenLoop);
    if (!preset) return;
    if (!clips.some(c => c.id === preset.clipId)) { setLoopMessage("Dieser Clip ist nicht mehr verfügbar."); return; }
    pendingLoop.current = preset; setClipId(preset.clipId); setLoopStart(preset.start); setLoopEnd(preset.end);
    setCursor(preset.start); setSpeed(preset.speed); setPlaying(false);
    setLoopMessage(`Loop „${preset.name}“ in Timeline geladen.`);
  };
  const applyLoop = () => {
    const preset = matchingLoops.find(p => p.id === chosenLoop);
    if (!preset || !clips.some(c => c.id === preset.clipId)) { setLoopMessage("Loop/Clip ist nicht verfügbar."); return; }
    setActiveChoreography(null); setActiveAvatarLoop(preset.id); loadLoop();
    setLoopMessage(`„${preset.name}“ für diesen Avatar aktiviert (auch in der Live-Bühne).`);
  };
  const deleteLoop = () => {
    const preset = matchingLoops.find(p => p.id === chosenLoop);
    if (!preset) return;
    const next = savedLoops.filter(p => p.id !== preset.id);
    if (getActiveAvatarLoop(modelUrl ?? "", animationUrl ?? "")?.id === preset.id) setActiveAvatarLoop(null);
    persistAvatarLoopPresets(next); setSavedLoops(next); setChosenLoop(""); setLoopMessage("Loop gelöscht.");
  };
  const handleClips = useCallback((next: TimelineClip[]) => {
    setClips(old => JSON.stringify(old) === JSON.stringify(next) ? old : next);
  }, []);
  const handlePosition = useCallback((time: number) => setCursor(old => Math.abs(old - time) < 0.035 ? old : time), []);
  useEffect(() => {
    const index = previewIndexRef.current;
    if (index === null || !playing || nextStepPending.current || !loopEnd || cursor < loopEnd - 0.075) return;
    nextStepPending.current = true;
    const next = index + 1;
    if (next >= previewStepsRef.current.length && !previewRepeatRef.current) {
      stopSequencePreview(); return;
    }
    showSequenceStep(next % previewStepsRef.current.length, previewStepsRef.current);
  }, [cursor, loopEnd, playing]);
  useEffect(() => {
    const current = clips.find(clip => clip.id === clipId) ?? clips[0];
    if (!current) { setDuration(0); setClipId(""); return; }
    if (current.id !== clipId) setClipId(current.id);
    setDuration(current.duration);
    setLoopStart(0);
    setLoopEnd(current.duration);
    setCursor(0);
    if (pendingLoop.current?.clipId === current.id) {
      const saved = pendingLoop.current; pendingLoop.current = null;
      setLoopStart(Math.min(saved.start, current.duration - 0.01));
      setLoopEnd(Math.min(saved.end, current.duration));
      setCursor(saved.start);
    }
  }, [clips, clipId]);
  const timeline: TimelineState = { clipId, start: loopStart, end: loopEnd, cursor, playing, speed };
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
          {studio && compareIK && modelUrl ? <>
            <group position={[-1.12, 0, 0]} scale={0.72}>
              <PreviewMotion playing={playing && !preferences.reducedMotion} speed={speed} intensity={intensity} beatEnabled={beatEnabled} bpm={bpm} style={style} onBeat={handleBeat}>
                <Suspense fallback={<ProceduralModel/>}><GltfPreview url={modelUrl} animationUrl={animationUrl} timeline={timeline} onClips={handleClips} onPosition={handlePosition} footIK={false} preferences={preferences}/></Suspense>
              </PreviewMotion>
            </group>
            <group position={[1.12, 0, 0]} scale={0.72}>
              <PreviewMotion playing={playing && !preferences.reducedMotion} speed={speed} intensity={intensity} beatEnabled={beatEnabled} bpm={bpm} style={style} onBeat={() => {}}>
                <Suspense fallback={<ProceduralModel/>}><GltfPreview url={modelUrl} animationUrl={animationUrl} timeline={timeline} onClips={handleClips} onPosition={() => {}} footIK={true} preferences={preferences}/></Suspense>
              </PreviewMotion>
            </group>
          </> : <PreviewMotion playing={playing && !preferences.reducedMotion} speed={speed} intensity={intensity} beatEnabled={beatEnabled} bpm={bpm} style={style} onBeat={handleBeat}>
            {modelUrl ? <Suspense fallback={<ProceduralModel/>}><GltfPreview url={modelUrl} animationUrl={animationUrl} timeline={timeline} onClips={handleClips} onPosition={handlePosition} footIK={previewIK} preferences={preferences}/></Suspense> : <ProceduralModel/>}
          </PreviewMotion>}
        </group>
        <OrbitControls enablePan={false} enableZoom minDistance={1.8} maxDistance={8} autoRotate={autoRotate && !playing} autoRotateSpeed={1.2}/>
      </Canvas>
    </div>
    <div className="avatar-preview-toolbar">
      <button type="button" onClick={() => setPlaying(value => !value)} disabled={preferences.reducedMotion} aria-pressed={playing}>{playing ? "⏸ Tanz pausieren" : "▶ Tanz testen"}</button>
      {studio && <>
        <label><input type="checkbox" checked={previewIK} disabled={!modelUrl || compareIK} onChange={e => setPreviewIK(e.target.checked)}/> Foot IK</label>
        <label><input type="checkbox" checked={compareIK} disabled={!modelUrl} onChange={e => setCompareIK(e.target.checked)}/> Vorher/Nachher</label>
      </>}
      <label>Tempo <select value={speed} onChange={e => setSpeed(Number(e.target.value))} aria-label="Vorschau-Tempo"><option value={0.25}>0,25× Zeitlupe</option><option value={0.5}>0,5×</option><option value={1}>1×</option><option value={1.5}>1,5×</option><option value={2}>2×</option></select></label>
      <button type="button" aria-pressed={autoRotate} onClick={() => setAutoRotate(value => !value)}>{autoRotate ? "Rotation aus" : "Auto-Rotation"}</button>
      <button type="button" onClick={() => setResetKey(value => value + 1)}>Ansicht zurücksetzen</button>
    </div>
    {studio && <fieldset className="avatar-timeline-editor"><legend>Animation Timeline · V93</legend>
      <p>Wähle einen eingebetteten oder importierten Clip, positioniere die Abspielmarke und lege eine Loop-Spanne fest. Die GLB-Dateien bleiben unverändert.</p>
      <label>Animation <select value={clipId} disabled={!clips.length} onChange={event => setClipId(event.target.value)}>
        {!clips.length && <option value="">Keine Animation vorhanden</option>}
        {clips.map(clip => <option key={clip.id} value={clip.id}>{clip.label} ({clip.duration.toFixed(1)} s)</option>)}
      </select></label>
      <label>Position: {cursor.toFixed(2)} / {duration.toFixed(2)} s
        <input type="range" aria-label="Animation scrubben" min={0} max={Math.max(0.01, duration)} step={0.01} value={Math.min(cursor, duration)} disabled={!duration} onChange={event => { setPlaying(false); setCursor(Number(event.target.value)); }}/>
      </label>
      <div className="avatar-timeline-range">
        <label>Loop Start: {loopStart.toFixed(2)} s<input type="range" min={0} max={Math.max(0.01, loopEnd - 0.05)} step={0.01} value={loopStart} disabled={!duration} onChange={event => {const v=Number(event.target.value);setLoopStart(v);setCursor(v);}}/></label>
        <label>Loop Ende: {loopEnd.toFixed(2)} s<input type="range" min={Math.min(duration, loopStart + 0.05)} max={Math.max(0.01, duration)} step={0.01} value={loopEnd} disabled={!duration} onChange={event => setLoopEnd(Number(event.target.value))}/></label>
      </div>
      <button type="button" disabled={!duration} onClick={() => {setLoopStart(0);setLoopEnd(duration);setCursor(0);setPlaying(false);}}>Loop zurücksetzen</button>
      <div className="avatar-timeline-presets">
        <h4>Gespeicherte Dance-Loops · V94</h4>
        <label>Loop-Name<input type="text" maxLength={60} placeholder="z. B. Hakken Kick 150 BPM" value={loopName} onChange={e => setLoopName(e.target.value)} /></label>
        <button type="button" onClick={saveLoop} disabled={!modelUrl || !duration}>Aktuellen Loop speichern</button>
        <label>Gespeicherter Loop<select value={chosenLoop} onChange={e => setChosenLoop(e.target.value)}>
          <option value="">Loop auswählen…</option>
          {matchingLoops.map(p => <option key={p.id} value={p.id}>{p.name} ({p.start.toFixed(1)}–{p.end.toFixed(1)} s)</option>)}
        </select></label>
        <div className="avatar-editor-actions">
          <button type="button" disabled={!chosenLoop} onClick={loadLoop}>In Timeline laden</button>
          <button type="button" disabled={!chosenLoop} onClick={applyLoop}>Auf Live-Avatar anwenden</button>
          <button type="button" disabled={!chosenLoop} onClick={deleteLoop}>Loop löschen</button>
          <button type="button" onClick={() => {setActiveAvatarLoop(null);setLoopMessage("Live-Loop deaktiviert.");}}>Live-Loop deaktivieren</button>
        </div>
        {loopMessage && <p role="status">{loopMessage}</p>}
        <small>Gespeichert im Browser dieses Geräts. Loop und Clip-Zuordnung gelten nur für die zugehörige Avatar-/Animations-Datei. Original-GLB unverändert.</small>
      </div>
      <div className="avatar-timeline-presets">
        <h4>Visual Choreography Timeline · V96</h4>
        <p>Mehrere gespeicherte Dance Loops zu einer Tanzsequenz verbinden. Übergänge steuern die Überblendung; optional beginnt der nächste Schritt auf einer geschätzten Beat-Grenze.</p>
        <label>Name <input maxLength={60} value={choreographyName} placeholder="z. B. Hardstyle Set" onChange={e => setChoreographyName(e.target.value)}/></label>
        <button type="button" onClick={addStep} disabled={!chosenLoop || choreographySteps.length >= 24}>Ausgewählten Loop zur Sequenz hinzufügen</button>
        <p className="avatar-choreography-help">Ziehe die farbigen Blöcke zum Umordnen. Die Breite entspricht der Länge des jeweiligen Loops. Übergänge werden im jeweiligen Block eingestellt.</p>
        <div className="avatar-choreography-track" aria-label="Visuelle Choreografie-Timeline">
          {choreographySteps.map((step, index) => {
            const loop = matchingLoops.find(p => p.id === step.loopId);
            const seconds = loop ? Math.max(0.1, (loop.end - loop.start) / Math.max(0.1, loop.speed)) : 1;
            return <div key={`track-${index}`} className={`avatar-choreography-block${previewSequenceIndex === index ? " is-previewing" : ""}`}
              style={{flexGrow: seconds, flexBasis: 0, minWidth: 85}} draggable
              onDragStart={event => { setDraggedStep(index); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(index)); }}
              onDragOver={event => {event.preventDefault(); event.dataTransfer.dropEffect = "move";}}
              onDrop={event => {event.preventDefault(); const from = Number(event.dataTransfer.getData("text/plain")); if (Number.isInteger(from)) moveStep(from, index); setDraggedStep(null);}}
              onDragEnd={() => setDraggedStep(null)} aria-label={`Schritt ${index+1}: ${loop?.name ?? "Unbekannt"}, ziehen zum Umordnen`}>
              <span className="avatar-choreography-block-title">☰ {index+1}. {loop?.name ?? "Loop fehlt"}</span>
              <small>{seconds.toFixed(1)} s · Blend {step.transition.toFixed(2)} s {step.beatAligned ? "· ♪" : ""}</small>
              <label>Übergang <input aria-label={`Übergang für Schritt ${index+1}`} type="range" min="0.05" max="2" step="0.05" value={step.transition} onChange={event => editStep(index, {transition: Number(event.target.value)})}/></label>
              <button type="button" onClick={() => moveStep(index, Math.max(0, index-1))} disabled={index===0}>←</button>
              <button type="button" onClick={() => moveStep(index, Math.min(choreographySteps.length-1,index+1))} disabled={index===choreographySteps.length-1}>→</button>
            </div>;
          })}
        </div>
        {draggedStep !== null && <small>Schritt {draggedStep+1} auf einen anderen Block ziehen.</small>}
        <div className="avatar-editor-actions">
          <button type="button" disabled={!choreographySteps.length || !modelUrl || !clips.length} onClick={startSequencePreview}>▶ Choreografie in 3D-Vorschau</button>
          <button type="button" disabled={previewSequenceIndex === null} onClick={stopSequencePreview}>■ Vorschau stoppen</button>
          {previewSequenceIndex !== null && <span role="status">Schritt {previewSequenceIndex+1} / {previewStepsRef.current.length}</span>}
        </div>
        <ol className="avatar-choreography-steps">{choreographySteps.map((step, index) => <li key={`${index}-${step.loopId}`}>
          <label>Loop <select value={step.loopId} onChange={e => editStep(index, {loopId: e.target.value})}>
            {matchingLoops.map(loop => <option key={loop.id} value={loop.id}>{loop.name}</option>)}
          </select></label>
          <label>Übergang {step.transition.toFixed(2)} s <input type="range" min={0.05} max={2} step={0.05} value={step.transition} onChange={e => editStep(index, {transition: Number(e.target.value)})}/></label>
          <label><input type="checkbox" checked={step.beatAligned} onChange={e => editStep(index, {beatAligned: e.target.checked})}/> Wechsel am Beat (BPM-Schätzung)</label>
          <div className="avatar-editor-actions">
            <button type="button" disabled={index===0} onClick={() => setChoreographySteps(old => {const next=[...old];[next[index-1],next[index]]=[next[index],next[index-1]];return next;})}>↑</button>
            <button type="button" disabled={index===choreographySteps.length-1} onClick={() => setChoreographySteps(old => {const next=[...old];[next[index+1],next[index]]=[next[index],next[index+1]];return next;})}>↓</button>
            <button type="button" onClick={() => setChoreographySteps(old => old.filter((_, i) => i !== index))}>Entfernen</button>
          </div>
        </li>)}</ol>
        <label><input type="checkbox" checked={repeatChoreography} onChange={e => setRepeatChoreography(e.target.checked)}/> Gesamte Sequenz wiederholen</label>
        <button type="button" disabled={!choreographySteps.length} onClick={saveSequence}>Choreografie speichern</button>
        <label>Gespeicherte Choreografie <select value={selectedChoreography} onChange={e => setSelectedChoreography(e.target.value)}>
          <option value="">Auswählen…</option>{matchingChoreographies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.steps.length} Schritte)</option>)}
        </select></label>
        <div className="avatar-editor-actions">
          <button type="button" disabled={!selectedChoreography} onClick={loadSequence}>Bearbeiten</button>
          <button type="button" disabled={!selectedChoreography} onClick={() => {setActiveChoreography(selectedChoreography);setChoreographyMessage("Choreografie für Live-Avatar aktiviert.");}}>Live abspielen</button>
          <button type="button" onClick={() => {setActiveChoreography(null);setChoreographyMessage("Choreografie deaktiviert.");}}>Live stoppen</button>
          <button type="button" disabled={!selectedChoreography} onClick={removeSequence}>Löschen</button>
        </div>
        {choreographyMessage && <p role="status">{choreographyMessage}</p>}
        <small>Browserlokal gespeichert. Nur Clips desselben Avatar-/Animation-Rigs; keine Veränderung der GLB-Dateien.</small>
      </div>
      {!modelUrl && <small>Wähle einen GLB-Avatar mit Animationen, um die Timeline zu verwenden.</small>}
      {modelUrl && !clips.length && <small>Das Modell enthält keine unterstützten Animationsclips. Importiere einen passenden Animations-GLB beim Avatar.</small>}
    </fieldset>}
    {studio && compareIK && <p className="avatar-preview-help">Links: ohne Foot IK · Rechts: mit Foot IK. Beide Modelle nutzen dieselben Animation-Clips und Regler.</p>}
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
    {studio && !modelUrl && <p className="avatar-preview-help">Für einen echten Foot-IK-Vergleich bitte einen humanoiden GLB-Avatar wählen. Der Procedural-Avatar besitzt keine IK-Kette.</p>}
    <p className="avatar-preview-help">Ziehen zum Drehen · Scrollen oder Pinch zum Zoomen · Demo-Bewegung ohne Spotify</p>
  </div>;
}
