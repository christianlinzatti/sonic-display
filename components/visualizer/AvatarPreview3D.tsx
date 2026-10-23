"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { retargetHumanoidClips, readRetargetCalibration, RETARGET_EVENT } from "./avatarAnimationRetarget";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import { AnimationMixer, LoopOnce, LoopRepeat, AnimationClip, type Group } from "three";
import {GLB_BLEND_PRESET_LIMIT_V492,readBlendPresetsV492,writeBlendPresetsV492,mergeBlendPresetsV492,parseBlendPresetsV492,serializeBlendPresetsV492,scopedBlendPresetsV492,type GlbBlendPresetV492,type BlendGenreV492} from "./glbBlendPresetsV492";
import { previewBlendRegionsV491, resolvePreviewBlendV491, previewBlendWeightV491, isPreviewBlendTrackV491, type PreviewBlendPlanV491 } from "./glbMotionBlendPreviewV491";
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

type TimelineClip = { id: string; name: string; label: string; duration: number; blendArmsV491: number; blendUpperV491: number };
type TimelineState = { clipId: string; start: number; end: number; cursor: number; playing: boolean; speed: number };

/** Each preview owns an independent mixer; external clips are retargeted against its cloned rig. */
function GltfPreview({ url, animationUrl, timeline, blendV491, onClips, onPosition, footIK, preferences }: {
  url: string; animationUrl?: string; timeline: TimelineState; blendV491?: PreviewBlendPlanV491;
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
  useEffect(() => { onClips(allClips.map(({ id, label, clip }) => ({ id, name:clip.name, label, duration: clip.duration, blendArmsV491: clip.tracks.filter(t=>isPreviewBlendTrackV491(t.name,"arms")).length, blendUpperV491: clip.tracks.filter(t=>isPreviewBlendTrackV491(t.name,"upper")).length }))); }, [allClips, onClips]);
  const selected = allClips.find(c => c.id === timeline.clipId) ?? allClips[0];
  // This preview is isolated from live playback and manual mixer preferences.
  // Mask clips are cloned from the imported animation; no GLB asset is altered.
  const blendClipV491 = useMemo(() => {
    const result = blendV491 ? resolvePreviewBlendV491(allClips, selected?.id ?? "", {...blendV491,weight:.25}, preferences.reducedMotion) : null;
    if (!result) return null;
    const masked = result.clip.clip.tracks.filter(t => result.trackNames.includes(t.name)).map(t => t.clone());
    return new AnimationClip(`PreviewMixV491:${result.clip.id}:${blendV491?.region}`, result.clip.clip.duration, masked);
  }, [allClips, blendV491?.enabled, blendV491?.sourceId, blendV491?.region, selected?.id, preferences.reducedMotion]);
  const overlayActionV491 = useRef<ReturnType<AnimationMixer["clipAction"]> | null>(null);
  const overlayWeightV491 = blendClipV491 ? previewBlendWeightV491(blendV491?.weight ?? 0) : 0;

  useEffect(() => {
    mixer.stopAllAction();
    selectedAction.current = null;
    overlayActionV491.current = null;
    if (!selected) return;
    const action = mixer.clipAction(selected.clip);
    action.reset(); action.setLoop(LoopOnce, 1); action.clampWhenFinished = true;
    action.play(); // The clock is driven explicitly by mixer.setTime (also when scrubbing).
    selectedAction.current = action;
    clock.current = Math.max(0, Math.min(selected.clip.duration, timeline.start));
    mixer.setTime(clock.current);
    return () => { action.stop(); selectedAction.current = null; };
    // Only rebind when selected clip changes, not on every timeline edit.
  }, [mixer, selected?.id, selected?.clip]);
  useEffect(() => {
    const old = overlayActionV491.current;
    if (old) { old.stop(); overlayActionV491.current = null; }
    if (!blendClipV491 || !selected) return;
    const overlay = mixer.clipAction(blendClipV491);
    overlay.reset(); overlay.setLoop(LoopRepeat, Infinity);
    overlay.setEffectiveWeight(overlayWeightV491); overlay.play();
    overlayActionV491.current = overlay;
    mixer.setTime(clock.current);
    return () => { overlay.stop(); if (overlayActionV491.current === overlay) overlayActionV491.current = null; };
  }, [mixer, blendClipV491, selected?.id]);
  useEffect(() => {
    overlayActionV491.current?.setEffectiveWeight(overlayWeightV491);
  }, [overlayWeightV491]);
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
  const [blendV491, setBlendV491] = useState<PreviewBlendPlanV491>({enabled:false,sourceId:"",weight:.25,region:"upper"});
  useEffect(() => setBlendV491({enabled:false,sourceId:"",weight:.25,region:"upper"}), [modelUrl, animationUrl]);
  // V492: presets are browser-local data, scoped to the current model + source.
  const [blendPresetsV492,setBlendPresetsV492]=useState<GlbBlendPresetV492[]>([]);
  const [chosenPresetV492,setChosenPresetV492]=useState("");
  const [presetNameV492,setPresetNameV492]=useState("");
  const [presetGenreV492,setPresetGenreV492]=useState<BlendGenreV492>("all");
  const [presetAutoV492,setPresetAutoV492]=useState(false);
  const [presetMessageV492,setPresetMessageV492]=useState("");
  useEffect(()=>{if(studio){setBlendPresetsV492(readBlendPresetsV492());setChosenPresetV492("");setPresetMessageV492("");}},[studio,modelUrl,animationUrl]);
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
  const blendOptionsV491 = clips.filter(c=>c.id!==clipId);
  const blendSelectionV491 = blendOptionsV491.find(c=>c.id===blendV491.sourceId);
  const blendSafeCountV491 = blendSelectionV491 ? blendV491.region==="arms"?blendSelectionV491.blendArmsV491:blendSelectionV491.blendUpperV491 : 0;
  const canBlendV491 = Boolean(modelUrl && clips.length>=2 && !preferences.reducedMotion);
  const currentBlendPresetsV492=scopedBlendPresetsV492(blendPresetsV492,modelUrl??"",animationUrl??"");
  const selectedBlendPresetV492=currentBlendPresetsV492.find(p=>p.id===chosenPresetV492);
  // UI clips also need their safe-track names. Actual usability is validated in
  // GltfPreview / ThreeAvatar, not inferred from the selected index alone.
  const currentPresetValidV492=selectedBlendPresetV492&&clips.some(c=>c.id===selectedBlendPresetV492.base.id&&c.name===selectedBlendPresetV492.base.name)
    &&clips.some(c=>c.id===selectedBlendPresetV492.overlay.id&&c.name===selectedBlendPresetV492.overlay.name
      &&(selectedBlendPresetV492.region==='arms'?c.blendArmsV491:c.blendUpperV491)>0);
  const persistBlendV492=(updated:GlbBlendPresetV492[],message:string)=>{
    try{writeBlendPresetsV492(updated);setBlendPresetsV492(updated);setPresetMessageV492(message);}
    catch{setPresetMessageV492('Presets konnten nicht gespeichert werden (Browserspeicher prüfen).');}
  };
  const saveBlendPresetV492=(forceNew=false)=>{
    const base=clips.find(c=>c.id===clipId), overlay=clips.find(c=>c.id===blendV491.sourceId);
    const name=presetNameV492.trim().slice(0,60);
    if(!modelUrl||!name||!base?.name||!overlay?.name||base.id===overlay.id||base.name===overlay.name||!blendV491.enabled||blendV491.weight<=0
      ||(blendV491.region==='arms'?overlay.blendArmsV491:overlay.blendUpperV491)<=0){
      setPresetMessageV492('Bitte einen Namen, zwei verschiedene Clips mit passenden Gelenken und ein Mischgewicht über 0 wählen.');return;
    }
    const old=forceNew?undefined:selectedBlendPresetV492;
    if(!old&&blendPresetsV492.length>=GLB_BLEND_PRESET_LIMIT_V492){setPresetMessageV492('Maximal 40 gespeicherte Kombinationen.');return;}
    const preset:GlbBlendPresetV492={version:1,id:old?.id??`blend-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,name,
      modelUrl,animationUrl:animationUrl??'',base:{id:base.id,name:base.name},overlay:{id:overlay.id,name:overlay.name},
      region:blendV491.region,weight:previewBlendWeightV491(blendV491.weight),genre:presetGenreV492,autoEnabled:presetAutoV492};
    const updated=old?blendPresetsV492.map(p=>p.id===old.id?preset:preset):[...blendPresetsV492,preset];
    persistBlendV492(updated,`„${name}“ ${old?'aktualisiert':'gespeichert'}.`);setChosenPresetV492(preset.id);
  };
  const loadBlendPresetV492=()=>{
    const preset=selectedBlendPresetV492;
    if(!preset||!currentPresetValidV492){setPresetMessageV492('Preset nicht ladbar: GLB-Clip fehlt oder passende Gelenkkanäle wurden entfernt.');return;}
    setClipId(preset.base.id);
    setBlendV491({enabled:true,sourceId:preset.overlay.id,weight:preset.weight,region:preset.region});
    setPresetNameV492(preset.name);setPresetGenreV492(preset.genre);setPresetAutoV492(preset.autoEnabled);
    setPlaying(false);setPresetMessageV492(`„${preset.name}“ in die 3D-Vorschau geladen.`);
  };
  const deleteBlendPresetV492=()=>{
    if(!selectedBlendPresetV492)return;
    persistBlendV492(blendPresetsV492.filter(p=>p.id!==selectedBlendPresetV492.id),'Preset gelöscht.');
    setChosenPresetV492('');setPresetNameV492('');
  };
  const exportBlendPresetsV492=()=>{
    const json=serializeBlendPresetsV492(blendPresetsV492);
    const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='sonic-glb-blending-presets-v492.json';a.click();
    URL.revokeObjectURL(url);
    setPresetMessageV492('Preset-Backup exportiert.');
  };
  const importBlendPresetsV492=async(file:File|undefined)=>{
    if(!file)return;
    try{
      if(file.size>128000)throw new Error('Preset-Datei zu groß (maximal 128 KB).');
      const incoming=parseBlendPresetsV492(await file.text());
      const merged=mergeBlendPresetsV492(readBlendPresetsV492(),incoming);
      persistBlendV492(merged,`${incoming.length} Presets importiert / aktualisiert. Nur passende Modelle werden hier angezeigt.`);
    }catch(error){setPresetMessageV492(error instanceof Error?error.message:'Import fehlgeschlagen.');}
  };
  const activeBlendV491 = canBlendV491 ? blendV491 : {...blendV491,enabled:false};
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
                <Suspense fallback={<ProceduralModel/>}><GltfPreview url={modelUrl} animationUrl={animationUrl} timeline={timeline} blendV491={activeBlendV491} onClips={handleClips} onPosition={handlePosition} footIK={false} preferences={preferences}/></Suspense>
              </PreviewMotion>
            </group>
            <group position={[1.12, 0, 0]} scale={0.72}>
              <PreviewMotion playing={playing && !preferences.reducedMotion} speed={speed} intensity={intensity} beatEnabled={beatEnabled} bpm={bpm} style={style} onBeat={() => {}}>
                <Suspense fallback={<ProceduralModel/>}><GltfPreview url={modelUrl} animationUrl={animationUrl} timeline={timeline} blendV491={activeBlendV491} onClips={handleClips} onPosition={() => {}} footIK={true} preferences={preferences}/></Suspense>
              </PreviewMotion>
            </group>
          </> : <PreviewMotion playing={playing && !preferences.reducedMotion} speed={speed} intensity={intensity} beatEnabled={beatEnabled} bpm={bpm} style={style} onBeat={handleBeat}>
            {modelUrl ? <Suspense fallback={<ProceduralModel/>}><GltfPreview url={modelUrl} animationUrl={animationUrl} timeline={timeline} blendV491={activeBlendV491} onClips={handleClips} onPosition={handlePosition} footIK={previewIK} preferences={preferences}/></Suspense> : <ProceduralModel/>}
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
    {studio && <fieldset className="avatar-timeline-editor avatar-motion-blend-preview-v491" aria-label="GLB Motion Preview & Blending Studio V491">
      <legend>GLB Motion Preview & Blending Studio · V491</legend>
      <p>Kombiniere zwei bereits installierte Clips live in dieser 3D-Vorschau. Der Basisclip wird in der Timeline ausgewählt; nur sichere Arm- und Brustrotationen werden vom zweiten Clip übernommen. GLB-Dateien und die Live-Bühne bleiben unverändert.</p>
      <label><input type="checkbox" checked={blendV491.enabled} disabled={!canBlendV491} onChange={e=>setBlendV491(v=>({...v,enabled:e.target.checked}))}/> Zweiten Clip einblenden</label>
      <div className="avatar-v491-blend-controls">
        <label>Gestenclip <select aria-label="Zusätzliche GLB-Animation" value={blendOptionsV491.some(c=>c.id===blendV491.sourceId)?blendV491.sourceId:""}
          disabled={!canBlendV491} onChange={e=>setBlendV491(v=>({...v,sourceId:e.target.value}))}>
          <option value="">Clip auswählen…</option>
          {blendOptionsV491.map(c=><option key={c.id} value={c.id}>{c.label}{!(blendV491.region==="arms"?c.blendArmsV491:c.blendUpperV491)?" (keine geeigneten Gelenke)":""}</option>)}
        </select></label>
        <label>Körperbereich <select aria-label="Körperbereich für den Gestenclip" value={blendV491.region} disabled={!canBlendV491}
          onChange={e=>setBlendV491(v=>({...v,region:e.target.value as PreviewBlendPlanV491["region"]}))}>
          {previewBlendRegionsV491.map(region=><option key={region.value} value={region.value}>{region.label}</option>)}
        </select></label>
        <label>Mischgewicht: {Math.round(blendV491.weight*100)} %
          <input type="range" aria-label="GLB Mischgewicht" min={0} max={50} step={1} value={Math.round(blendV491.weight*100)} disabled={!canBlendV491}
            onChange={e=>setBlendV491(v=>({...v,weight:Number(e.target.value)/100}))}/>
        </label>
        <button type="button" onClick={()=>setBlendV491({enabled:false,sourceId:"",weight:.25,region:"upper"})}>Mischung zurücksetzen</button>
      </div>
      {!modelUrl?<p role="status">Bitte zuerst einen GLB-Avatar auswählen.</p>:
        clips.length<2?<p role="status">Für diese Vorschau werden mindestens zwei Clips benötigt. Importiere eine zusätzliche GLB-Animation.</p>:
        preferences.reducedMotion?<p role="status">Bei aktivierter Bewegungsreduktion bleibt das Blending deaktiviert.</p>:
        blendV491.enabled&&!blendV491.sourceId?<p role="status">Wähle einen zweiten Clip aus.</p>:
        blendV491.enabled&&blendSelectionV491&&blendSafeCountV491===0?<p role="status">Dieser Clip enthält keine passenden Arm- oder Brustrotationen. Bitte einen anderen Clip oder Körperbereich auswählen.</p>:
        blendV491.enabled&&blendSelectionV491?<p role="status">{blendSafeCountV491} sichere Animationskanäle verfügbar · {Math.round(blendV491.weight*100)} % Mischung</p>:null}
      <small>Geschützte Kanäle: Hüfte, Beine, Füße, Root-Bewegung, Kopf, Gesicht und Hände. Foot-IK bleibt separat steuerbar. Ohne explizite Aktivierung beeinflusst kein gespeichertes Preset die Live-Bühne.</small>
      <fieldset className="avatar-blending-presets-v492" aria-label="GLB Blending Preset Studio V492">
        <legend>GLB Blending Preset Studio · V492</legend>
        <p>Speichere die Kombination für dieses GLB-Modell und diese Animationsquelle. Nur wenn du die automatische Verwendung aktivierst und die Basisanimation gerade tatsächlich läuft, kann sie auf der Live-Bühne verwendet werden.</p>
        <label>Preset-Name <input type="text" maxLength={60} placeholder="z. B. Deep Crouch + Rap-Gesten" value={presetNameV492} onChange={e=>setPresetNameV492(e.target.value)}/></label>
        <label>Genre für automatische Verwendung <select value={presetGenreV492} onChange={e=>setPresetGenreV492(e.target.value as BlendGenreV492)}>
          <option value="all">Alle Genres</option><option value="rap">Deutschrap / Hip-Hop / Trap</option><option value="hard">Hardstyle / Hardtekk / Hardcore</option>
        </select></label>
        <label><input type="checkbox" checked={presetAutoV492} onChange={e=>setPresetAutoV492(e.target.checked)}/> Bei passender Basisanimation automatisch in der Live-Show nutzen</label>
        <div className="avatar-editor-actions">
          <button type="button" onClick={()=>saveBlendPresetV492()} disabled={!canBlendV491}>Preset speichern / aktualisieren</button>
          <button type="button" onClick={()=>saveBlendPresetV492(true)} disabled={!canBlendV491}>Als neues Preset speichern</button>
        </div>
        <label>Gespeicherte GLB-Kombination <select aria-label="Gespeicherte GLB-Mischung" value={chosenPresetV492} onChange={e=>setChosenPresetV492(e.target.value)}>
          <option value="">Preset auswählen…</option>
          {currentBlendPresetsV492.map(p=><option key={p.id} value={p.id}>{p.name}{p.autoEnabled?' · live':''}</option>)}
        </select></label>
        <div className="avatar-editor-actions">
          <button type="button" disabled={!selectedBlendPresetV492||!currentPresetValidV492} onClick={loadBlendPresetV492}>In Vorschau laden</button>
          <button type="button" disabled={!selectedBlendPresetV492} onClick={deleteBlendPresetV492}>Preset löschen</button>
        </div>
        {selectedBlendPresetV492&&!currentPresetValidV492&&<p role="status">Dieses Preset verwendet fehlende oder geänderte Clips. Es wird in der Live-Show sicher übersprungen.</p>}
        <div className="avatar-editor-actions">
          <button type="button" onClick={exportBlendPresetsV492}>Presets als JSON exportieren</button>
          <label>Preset-JSON importieren <input type="file" accept=".json,application/json" onChange={e=>{
            const file=e.target.files?.[0];void importBlendPresetsV492(file);e.target.value='';}}/></label>
        </div>
        {presetMessageV492&&<p role="status">{presetMessageV492}</p>}
        <small>Maximal {GLB_BLEND_PRESET_LIMIT_V492} Presets, browserlokal gespeichert. Bei fehlenden Clips erfolgt kein Ersatz durch zufällige Animationen. Import und Export enthalten nur Einstellungen, keine GLB-Dateien.</small>
      </fieldset>
    </fieldset>}
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
