"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { VisualizerProps } from "./registry";
import { animationMapping } from "./animationMapping";
import { getAvatarAnimationState } from "./avatarAnimationEngine";
import { applyAvatarRigMotion, collectAvatarRigNodes, type AvatarRigTargets } from "./avatarRigController";
import { getAvatarRigProfile, type AvatarRigProfileId } from "./avatarRigProfiles";
import { getAvatarDancePreset } from "./avatarDancePresets";
import { createDanceIntelligenceState, getDanceIntelligenceMultipliers, updateDanceIntelligence } from "./danceIntelligence";
import { createFullBodyDanceState, getFullBodyDanceMotion, updateFullBodyDance } from "./fullBodyDance";
import { getAvatarExpressionState } from "./avatarExpressionEngine";
import { createPerformanceDirectorState, updatePerformanceDirector } from "./performanceDirector";
import { createMusicalStructureState, getMusicalStructure, updateMusicalStructure } from "./musicalStructureEngine";
import { createNaturalMotionState, updateNaturalMotion } from "./naturalMotionEngine";
import { createChoreographyState, updateDanceChoreography } from "./advancedDanceChoreography";
import { createRhythmChoreographyState, updateRhythmChoreography } from "./rhythmAwareChoreography";
import { publishDancePerformance, nextPhraseBoundary } from "./dancePerformanceStore";
import { createFrameSampler, sampleAvatarFrame } from "./danceDiagnosticsStore";
import { AdaptivePerformanceController, getActivePerformanceTier } from "./adaptivePerformance";
import { createAnimationCadence, shouldUpdateAnimation, publishAnimationQuality } from "./adaptiveAnimationQuality";
import { createPersonalityState, updateAvatarPersonality } from "./avatarPersonalityEngine";

function ProceduralAvatar({ audio, isPlaying, reducedMotion, genre, avatarScale = 1, avatarOffsetY = 0, avatarAnimationIntensity = 1, avatarDancePreset = "auto", danceAggression = 0.5, danceMotionStyle = "balanced" }: VisualizerProps) {
  const root = useRef<Group>(null);
  const intelligence = useRef(createDanceIntelligenceState());
  const performanceDirector = useRef(createPerformanceDirectorState());
  const musicalStructure = useRef(createMusicalStructureState());
  const previewPublishedAt = useRef(-1);
  const frameSampler = useRef(createFrameSampler());
  const head = useRef<Mesh>(null);
  const torso = useRef<Mesh>(null);
  useFrame((state, delta) => {
    sampleAvatarFrame(frameSampler.current, delta, "procedural", isPlaying);
    if (!root.current || !head.current || !torso.current) return;
    intelligence.current = updateDanceIntelligence(intelligence.current, audio, state.clock.elapsedTime);
    const intelligenceMultipliers = getDanceIntelligenceMultipliers(intelligence.current);
    musicalStructure.current = updateMusicalStructure(musicalStructure.current, audio, state.clock.elapsedTime, isPlaying, reducedMotion);
    const structure = getMusicalStructure(musicalStructure.current, state.clock.elapsedTime);
    const performance = updatePerformanceDirector(performanceDirector.current, audio, genre, intelligence.current, structure, state.clock.elapsedTime, isPlaying, reducedMotion, avatarDancePreset);
    if (state.clock.elapsedTime - previewPublishedAt.current >= 0.15) {
      previewPublishedAt.current = state.clock.elapsedTime;
      publishDancePerformance({ playing: isPlaying, sequence: "baseline", move: isPlaying ? "procedural groove" : "idle",
        section: performance.section, rhythm: audio.learnedRhythm ?? "unknown", confidence: audio.rhythmConfidence ?? 0,
        blend: 1, ...nextPhraseBoundary(state.clock.elapsedTime, audio.bpm), source: "procedural" });
    }
    const motion = getAvatarAnimationState(audio, genre, isPlaying, reducedMotion, avatarAnimationIntensity, state.clock.elapsedTime, avatarDancePreset);
    const expression = getAvatarExpressionState(audio, genre, isPlaying, reducedMotion, avatarAnimationIntensity * performance.expressionIntensity, state.clock.elapsedTime);
    const preKick = isPlaying && !reducedMotion ? (audio.kickAnticipation ?? 0) : 0;
    const kickAccent = isPlaying && !reducedMotion ? (audio.kickAccentIntensity ?? 0) : 0;
    const patternConfidence = audio.kickPatternConfidence ?? 0;
    const patternAccent = isPlaying && !reducedMotion && patternConfidence >= 0.4 ? (audio.kickPatternAccent ?? 0) * patternConfidence : 0;
    const patternKick = audio.kickPattern === "double" ? patternAccent * 0.32 : audio.kickPattern === "syncopated" ? patternAccent * 0.23 : patternAccent * 0.10;
    const learnedAccent = isPlaying && !reducedMotion && (audio.rhythmConfidence ?? 0) >= 0.5
      ? (audio.rhythmPhraseAccent ?? 0) * (audio.rhythmConfidence ?? 0) * Math.max(0, audio.beatStrength) * 0.22 : 0;
    const smooth = Math.min(1, delta * (danceMotionStyle === "sharp" ? 15 : danceMotionStyle === "smooth" ? 4 : 8));
    head.current.scale.y += (1 + (motion.beatImpulse + kickAccent * 0.55 + patternKick + learnedAccent) * 0.18 * (0.7 + danceAggression * 0.6) * intelligenceMultipliers.kick * performance.danceMultiplier + performance.poseImpulse * 0.08 + performance.buildUp * 0.025 - preKick * 0.055 - head.current.scale.y) * smooth;
    head.current.rotation.z += (expression.headTilt - head.current.rotation.z) * smooth;
    torso.current.scale.x += (1 + audio.volume * 0.12 * motion.intensity - torso.current.scale.x) * smooth;
    root.current.rotation.y += (motion.bodySway * performance.danceMultiplier - root.current.rotation.y) * smooth;
    root.current.position.y += (motion.bodyBounce * performance.danceMultiplier - preKick * 0.065 + Math.sin(state.clock.elapsedTime * 2.1) * audio.mids * 0.025 * motion.intensity - root.current.position.y) * smooth;
  });
  return <group ref={root} scale={avatarScale} position={[0, avatarOffsetY, 0]}>
    <mesh ref={torso} position={[0, -0.48, 0]}><capsuleGeometry args={[0.48, 0.62, 6, 12]} /><meshStandardMaterial color="#7557d9" roughness={0.42} /></mesh>
    <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.43, 32, 24]} /><meshStandardMaterial color="#e7b99d" roughness={0.55} /></mesh>
    <mesh ref={head} position={[0, 0.57, 0.02]}><sphereGeometry args={[0.44, 32, 24]} /><meshStandardMaterial color="#e7b99d" roughness={0.55} /></mesh>
    <mesh position={[-0.16, 0.62, 0.39]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#241b35" /></mesh>
    <mesh position={[0.16, 0.62, 0.39]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#241b35" /></mesh>
    <mesh position={[0, 1.03, 0]}><sphereGeometry args={[0.27, 20, 12]} /><meshStandardMaterial color="#35264b" /></mesh>
    <mesh position={[-0.59, -0.42, 0]} rotation={[0, 0, -0.25]}><capsuleGeometry args={[0.13, 0.55, 4, 8]} /><meshStandardMaterial color="#e7b99d" /></mesh>
    <mesh position={[0.59, -0.42, 0]} rotation={[0, 0, 0.25]}><capsuleGeometry args={[0.13, 0.55, 4, 8]} /><meshStandardMaterial color="#e7b99d" /></mesh>
  </group>;
}

function propsGenreKey(genre?: string | null) { return genre?.toLowerCase() ?? "default"; }

function GltfAvatar({ url, audio, isPlaying, reducedMotion, genre, avatarModelId, avatarScale = 1, avatarOffsetY = 0, avatarAnimationIntensity = 1, avatarRigProfile = "auto", avatarDancePreset = "auto", danceAggression = 0.5, danceVariation = 0.5, danceMotionStyle = "balanced" }: VisualizerProps & { url: string; avatarRigProfile?: AvatarRigProfileId }) {
  const root = useRef<Group>(null);
  const intelligence = useRef(createDanceIntelligenceState());
  const performanceDirector = useRef(createPerformanceDirectorState());
  const musicalStructure = useRef(createMusicalStructureState());
  const choreography = useRef(createChoreographyState());
  const previewPublishedAt = useRef(-1);
  const frameSampler = useRef(createFrameSampler());
  const rhythmChoreography = useRef(createRhythmChoreographyState());
  const personality = useRef(createPersonalityState());
  const animationCadence = useRef(createAnimationCadence());
  const cachedChoreography = useRef<ReturnType<typeof updateDanceChoreography> | null>(null);
  const cachedSignature = useRef<ReturnType<typeof updateAvatarPersonality> | null>(null);
  const cachedFullBody = useRef<ReturnType<typeof getFullBodyDanceMotion> | null>(null);
  const rigTargets = useRef<AvatarRigTargets>({});
  const fullBodyDance = useRef(createFullBodyDanceState());
  const naturalMotion = useRef(createNaturalMotionState());
  const { scene, animations } = useGLTF(url);
  // Clone only when the model changes. SkeletonUtils preserves skinned-mesh
  // bone bindings; cloning inside JSX on every React render breaks caching.
  // Geometry and materials remain shared with the GLTF cache (never dispose here).
  const model = useMemo(() => {
    const instance = cloneSkinnedScene(scene);
    instance.traverse(node => {
      if ("castShadow" in node) node.castShadow = false;
      if ("receiveShadow" in node) node.receiveShadow = false;
    });
    return instance;
  }, [scene]);
  const { actions, names } = useAnimations(animations, root);

  useEffect(() => {
    if (root.current) {
      rigTargets.current = collectAvatarRigNodes(root.current, avatarRigProfile).targets;
    }
  }, [model, avatarRigProfile]);
  const mapping = animationMapping[propsGenreKey(genre)];
  const danceClip = names.find((name) => mapping?.playing.some((pattern) => pattern.test(name))) ?? names.find((name) => /dance|move|groove/i.test(name));
  const idleClip = names.find((name) => mapping?.idle.some((pattern) => pattern.test(name))) ?? names.find((name) => /idle|stand|rest/i.test(name));
  useFrame((state, delta) => {
    sampleAvatarFrame(frameSampler.current, delta, "gltf", isPlaying);
    if (!root.current) return;
    intelligence.current = updateDanceIntelligence(intelligence.current, audio, state.clock.elapsedTime);
    const intelligenceMultipliers = getDanceIntelligenceMultipliers(intelligence.current);
    musicalStructure.current = updateMusicalStructure(musicalStructure.current, audio, state.clock.elapsedTime, isPlaying, reducedMotion);
    const structure = getMusicalStructure(musicalStructure.current, state.clock.elapsedTime);
    const performance = updatePerformanceDirector(performanceDirector.current, audio, genre, intelligence.current, structure, state.clock.elapsedTime, isPlaying, reducedMotion, avatarDancePreset);
    const rhythmDance = updateRhythmChoreography(rhythmChoreography.current, audio, state.clock.elapsedTime, delta, isPlaying && !reducedMotion);
    if (state.clock.elapsedTime - previewPublishedAt.current >= 0.15) {
      previewPublishedAt.current = state.clock.elapsedTime;
      publishDancePerformance({ playing: isPlaying, sequence: rhythmDance.sequence,
        move: isPlaying ? choreography.current.currentMove : "idle", section: performance.section,
        rhythm: audio.learnedRhythm ?? "unknown", confidence: rhythmDance.confidence, blend: rhythmDance.blend,
        ...nextPhraseBoundary(state.clock.elapsedTime, audio.bpm), source: "gltf" });
    }
    // Costly pattern/personality evaluation can run at a lower cadence. Every frame
    // still updates beat accents, prediction, rig interpolation and the actual 3D pose.
    const lastComplexUpdate = animationCadence.current.lastRun;
    const animationTier = getActivePerformanceTier();
    const updateComplexMotion = shouldUpdateAnimation(animationCadence.current, state.clock.elapsedTime, animationTier);
    publishAnimationQuality(animationTier, animationCadence.current, state.clock.elapsedTime);
    if (updateComplexMotion || !cachedChoreography.current || !cachedSignature.current) {
      const elapsedSinceUpdate = Math.min(0.15, Math.max(delta, Number.isFinite(lastComplexUpdate) ? state.clock.elapsedTime - lastComplexUpdate : delta));
      cachedChoreography.current = updateDanceChoreography(choreography.current, audio, genre, avatarDancePreset, performance.section, performance.pattern, state.clock.elapsedTime, elapsedSinceUpdate, isPlaying, reducedMotion, { aggression: danceAggression, variation: danceVariation, style: danceMotionStyle }, rhythmDance.moveOptions);
      cachedSignature.current = updateAvatarPersonality(personality.current, audio, avatarModelId, genre, avatarDancePreset, performance.section, state.clock.elapsedTime, isPlaying, reducedMotion);
    }
    const choreographyMotion = cachedChoreography.current;
    const signature = cachedSignature.current;
    const motion = getAvatarAnimationState(audio, genre, isPlaying, reducedMotion, avatarAnimationIntensity, state.clock.elapsedTime, avatarDancePreset);
    const expression = getAvatarExpressionState(audio, genre, isPlaying, reducedMotion, avatarAnimationIntensity * performance.expressionIntensity, state.clock.elapsedTime);
    naturalMotion.current = updateNaturalMotion(naturalMotion.current, audio, genre, state.clock.elapsedTime, delta, isPlaying, reducedMotion, avatarDancePreset);
    const natural = naturalMotion.current;
    const preKick = isPlaying && !reducedMotion ? (audio.kickAnticipation ?? 0) : 0;
    const kickAccent = isPlaying && !reducedMotion ? (audio.kickAccentIntensity ?? 0) : 0;
    const patternConfidence = audio.kickPatternConfidence ?? 0;
    const patternAccent = isPlaying && !reducedMotion && patternConfidence >= 0.4 ? (audio.kickPatternAccent ?? 0) * patternConfidence : 0;
    const patternKick = audio.kickPattern === "double" ? patternAccent * 0.32 : audio.kickPattern === "syncopated" ? patternAccent * 0.23 : patternAccent * 0.10;
    const learnedAccent = isPlaying && !reducedMotion && (audio.rhythmConfidence ?? 0) >= 0.5
      ? (audio.rhythmPhraseAccent ?? 0) * (audio.rhythmConfidence ?? 0) * Math.max(0, audio.beatStrength) * 0.22 : 0;
    const smooth = Math.min(1, delta * (danceMotionStyle === "sharp" ? 15 : danceMotionStyle === "smooth" ? 4 : 8));
    root.current.rotation.y += ((motion.bodySway + natural.hipSway * 0.35 + (audio.kickPattern === "syncopated" ? patternAccent * 0.055 : 0)) * performance.danceMultiplier - root.current.rotation.y) * smooth;
    root.current.position.y += (motion.bodyBounce * performance.danceMultiplier - preKick * 0.065 - root.current.position.y) * smooth;

    if (updateComplexMotion || !cachedFullBody.current) {
      fullBodyDance.current = updateFullBodyDance(fullBodyDance.current, audio, state.clock.elapsedTime, avatarDancePreset);
      cachedFullBody.current = getFullBodyDanceMotion(fullBodyDance.current, audio, motion.intensity);
    }
    const fullBody = cachedFullBody.current;
    const profile = getAvatarRigProfile(avatarRigProfile);
    const dance = getAvatarDancePreset(avatarDancePreset, genre);
    const liveAmplitude = 0.7 + danceAggression * 0.6;
    applyAvatarRigMotion(rigTargets.current, {
      headNod: (-motion.headNod * 0.75 * profile.multipliers.headNod * intelligenceMultipliers.head) + natural.anticipation * 0.035 - preKick * 0.09 + (choreographyMotion.headAccent + signature.head) * liveAmplitude,
      headTurn: motion.bodySway * 0.55 * profile.multipliers.headTurn,
      spineSway: motion.bodySway * 0.8 * profile.multipliers.spineSway + natural.hipSway * 0.28,
      hipSway: natural.hipSway + (choreographyMotion.hipAccent + signature.hip) * liveAmplitude,
      shoulderRoll: natural.shoulderRoll,
      followThrough: natural.followThrough,
      headLag: natural.headLag,
      chestPulse: ((motion.beatImpulse + kickAccent * 0.55 + patternKick + learnedAccent) * 0.055 * profile.multipliers.chestPulse * dance.multipliers.chest * intelligenceMultipliers.chest + performance.poseImpulse * 0.05) * performance.danceMultiplier,
      armSwing: (((motion.beatImpulse + kickAccent * 0.55 + patternKick + learnedAccent) * 0.16 * intelligenceMultipliers.kick + Math.sin(state.clock.elapsedTime * 2.4) * 0.08 * motion.intensity * intelligenceMultipliers.arms + natural.anticipation * 0.045) * profile.multipliers.armSwing * dance.multipliers.arms + (choreographyMotion.armAccent + signature.arm) * liveAmplitude) * performance.danceMultiplier + performance.poseImpulse * 0.12 + (choreographyMotion.poseAccent + signature.pose) * liveAmplitude,
      legGroove: (fullBody.legGroove * dance.multipliers.bounce + (audio.kickPattern === "double" ? patternAccent * 0.12 : 0) + (choreographyMotion.legAccent + signature.leg) * liveAmplitude) * performance.danceMultiplier,
      footStep: fullBody.footStep * dance.multipliers.kick * performance.danceMultiplier,
      weightShift: (fullBody.weightShift * dance.multipliers.sway + natural.weightShift - preKick * 0.12) * performance.danceMultiplier,
      beatImpulse: (motion.beatImpulse + kickAccent * 0.55 + patternKick + learnedAccent) * performance.danceMultiplier,
      expressionJaw: expression.jaw,
      expressionBrow: expression.brow,
      expressionEyeNarrow: -expression.eyeNarrow,
      expressionHeadTilt: expression.headTilt,
    }, delta * (danceMotionStyle === "sharp" ? 1.8 : danceMotionStyle === "smooth" ? 0.55 : 1));
  });
  // Prefer an authored dance/groove clip while playing; use idle when paused.
  // State changes cross-fade clips instead of restarting them every render.
  useEffect(() => {
    const active = isPlaying && !reducedMotion;
    const selected = active ? (danceClip ?? idleClip) : (idleClip ?? danceClip);
    const nextAction = selected ? actions[selected] : undefined;
    if (nextAction) {
      nextAction.reset().fadeIn(0.25).play();
      if (!active && selected === danceClip) nextAction.paused = true;
    }
    for (const [name, action] of Object.entries(actions)) {
      if (name !== selected) action?.fadeOut(0.2);
    }
    return () => { nextAction?.fadeOut(0.15); };
  }, [actions, danceClip, idleClip, isPlaying, reducedMotion]);
  return <group ref={root} scale={avatarScale} position={[0, avatarOffsetY, 0]}><primitive object={model} /></group>;
}

export function ThreeAvatar(props: VisualizerProps) {
  const modelUrl = props.avatarModelUrl;
  return <div className="visualizer-stage three-avatar-stage" role="img" aria-label="3D music-reactive avatar">
    <Canvas camera={{ position: [0, 0.1, 4.2], fov: 38 }} dpr={[1, 1.5]} shadows={false} gl={{ powerPreference: "high-performance" }}>
      <AdaptivePerformanceController /><ambientLight intensity={1.7} /><directionalLight position={[3, 4, 5]} intensity={2.2} castShadow={false} />
      {modelUrl ? <Suspense fallback={<ProceduralAvatar {...props} />}><GltfAvatar {...props} avatarRigProfile={props.avatarRigProfile} avatarDancePreset={props.avatarDancePreset} url={modelUrl} /></Suspense> : <ProceduralAvatar {...props} />}
    </Canvas>
  </div>;
}
