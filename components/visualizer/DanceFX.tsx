"use client";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending, Color, DoubleSide, DynamicDrawUsage, FrontSide,
  InstancedBufferAttribute, InstancedMesh, Object3D,
  NormalBlending, PlaneGeometry, RingGeometry, SphereGeometry, ShaderMaterial,
} from "three";
import type { AudioFeatures } from "@/types/audio";
import { getActivePerformanceTier } from "./adaptivePerformance";
import { shouldSkipDormantFxV552 } from "./piConcertDrawBudgetV552";
import { getDanceFxPoolLimitV774, writeDanceFxInstancesV774, type DanceFxPulseV774, type DanceFxInstanceSinkV774 } from "./danceFxInstancePlanV774";

type FxSettings = { tint?: string; enabled?: boolean; strength?: number; shockwaves?: boolean; footprints?: boolean; trails?: boolean };
const POOL = 8;
const clamp = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));

const vertexShaderV774 = `
  attribute float instanceOpacity;
  varying float vInstanceOpacity;
  void main() {
    vInstanceOpacity = instanceOpacity;
    vec4 local = instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * local;
  }
`;
const fragmentShaderV774 = `
  uniform vec3 uColor;
  varying float vInstanceOpacity;
  void main() {
    if (vInstanceOpacity <= 0.0001) discard;
    gl_FragColor = vec4(uColor, vInstanceOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** V774: one draw per effect type, instead of one per active pulse/mesh.
 * Each instance has its own transform and alpha; all GPU allocations are mount-time only.
 * No resources are shared with the avatar's GLB cache. */
export function DanceFX({ audio, isPlaying, reducedMotion, settings }: { audio: AudioFeatures; isPlaying: boolean; reducedMotion: boolean; settings: FxSettings }) {
  const rings = useRef<InstancedMesh>(null);
  const marks = useRef<InstancedMesh>(null);
  const trails = useRef<InstancedMesh>(null);
  const pulses = useRef<DanceFxPulseV774[]>(Array.from({ length: POOL }, () => ({ active: false, age: 0, x: 0, z: 0, side: 0 })));
  const cursor = useRef(0);
  const elapsed = useRef(0);
  const lastKick = useRef(-10);
  const lastBeat = useRef(false);
  const wasEnabledV552 = useRef(false);

  const geometries = useMemo(() => {
    const ring = new RingGeometry(.34, .41, 32);
    const mark = new PlaneGeometry(.2, .33);
    const trail = new SphereGeometry(.14, 8, 6);
    const attributes = [ring, mark, trail].map(geometry => {
      const alpha = new InstancedBufferAttribute(new Float32Array(POOL), 1);
      alpha.setUsage(DynamicDrawUsage);
      geometry.setAttribute("instanceOpacity", alpha);
      return alpha;
    });
    return { ring, mark, trail, attributes };
  }, []);
  const uniforms = useMemo(() => [
    { uColor: { value: new Color("#4feafa") } },
    { uColor: { value: new Color("#cb79ff") } },
    { uColor: { value: new Color("#6decff") } },
  ], []);
  const materials = useMemo(() => [
    new ShaderMaterial({ vertexShader: vertexShaderV774, fragmentShader: fragmentShaderV774,
      uniforms: uniforms[0], transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, forceSinglePass: true }),
    new ShaderMaterial({ vertexShader: vertexShaderV774, fragmentShader: fragmentShaderV774,
      uniforms: uniforms[1], transparent: true, depthWrite: false, blending: NormalBlending, side: DoubleSide, forceSinglePass: true }),
    new ShaderMaterial({ vertexShader: vertexShaderV774, fragmentShader: fragmentShaderV774,
      uniforms: uniforms[2], transparent: true, depthWrite: false, blending: AdditiveBlending, side: FrontSide }),
  ] as const, [uniforms]);
  const flags = useMemo(() => ({ shockwaves: true, footprints: true, trails: true,
    tier: "high" as "low" | "balanced" | "high" }), []);
  const lastTint = useRef("#4feafa");
  const dummy = useMemo(() => new Object3D(), []);

  // These callbacks/targets are allocated once, never on beat or render frame.
  const sinks = useMemo(() => {
    const makeSink = (meshRef: typeof rings, alpha: InstancedBufferAttribute, kind: "ring" | "mark" | "trail"): DanceFxInstanceSinkV774 => ({
      write(index, pulse, opacity) {
        const mesh = meshRef.current;
        if (!mesh) return;
        if (kind === "ring") {
          dummy.position.set(pulse.x, -1.52, pulse.z);
          dummy.rotation.set(-Math.PI / 2, 0, 0);
          dummy.scale.setScalar(.2 + pulse.age * 2.2);
        } else if (kind === "mark") {
          dummy.position.set(pulse.x, -1.514, pulse.z);
          dummy.rotation.set(-Math.PI / 2, 0, pulse.side * .16);
          dummy.scale.setScalar(1);
        } else {
          dummy.position.set(pulse.x + pulse.side * pulse.age * .11, -1.37 + pulse.age * .3, pulse.z);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.setScalar(.5 + pulse.age * .7);
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        alpha.setX(index, opacity);
      },
      finish(count) {
        const mesh = meshRef.current;
        if (!mesh) return;
        mesh.count = count;
        mesh.visible = count > 0;
        if (count > 0) {
          mesh.instanceMatrix.needsUpdate = true;
          alpha.needsUpdate = true;
        }
      },
    });
    return [makeSink(rings, geometries.attributes[0], "ring"),
      makeSink(marks, geometries.attributes[1], "mark"),
      makeSink(trails, geometries.attributes[2], "trail")] as const;
  }, [dummy, geometries]);

  useEffect(() => {
    for (const mesh of [rings.current, marks.current, trails.current]) {
      if (mesh) {
        mesh.instanceMatrix.setUsage(DynamicDrawUsage);
        mesh.count = 0;
        mesh.visible = false;
      }
    }
    return () => {
      geometries.ring.dispose();
      geometries.mark.dispose();
      geometries.trail.dispose();
      for (const material of materials) material.dispose();
    };
  }, [geometries, materials]);

  useFrame((_state, delta) => {
    const tier = getActivePerformanceTier();
    const enabled = (settings.enabled ?? false) && !reducedMotion && isPlaying && (settings.strength ?? 60) > 0;
    const max = getDanceFxPoolLimitV774(tier);
    const intensity = clamp((settings.strength ?? 60) / 100);
    elapsed.current += Math.min(delta, .1);
    const isBeat = !!audio.beat;
    const onset = isBeat && !lastBeat.current;
    lastBeat.current = isBeat;
    // Keep the V552 dormant-pool fast path; never scan idle instances every frame.
    if (shouldSkipDormantFxV552(enabled,wasEnabledV552.current)) return;
    if(!enabled){
      for (const pulse of pulses.current) pulse.active=false;
      // The three instance batches draw nothing until a new beat activates them.
      for (const sink of sinks) sink.finish(0);
      wasEnabledV552.current = false;
      return;
    }
    wasEnabledV552.current=true;
    const tint = settings.tint ?? "#4feafa";
    if (lastTint.current !== tint) {
      uniforms[0].uColor.value.set(tint);
      lastTint.current = tint;
    }
    const kick = Math.max(clamp(audio.kickAccentIntensity ?? 0), clamp(audio.kick), clamp(audio.beatStrength));
    const trigger = tier !== "low" && (onset || (audio.kickAccent === "strong" && kick > .75)) &&
      elapsed.current - lastKick.current >= .24 && kick > .19;
    if (trigger) {
      lastKick.current = elapsed.current;
      const pulse = pulses.current[cursor.current % max];
      cursor.current++;
      pulse.active = true;
      pulse.age = 0;
      pulse.side = cursor.current % 2 === 0 ? -1 : 1;
      pulse.x = pulse.side * .36;
      pulse.z = .06;
    }
    for (const pulse of pulses.current) {
      if (pulse.active) {
        pulse.age += Math.min(delta, .1);
        if (pulse.age > 1.1) pulse.active=false;
      }
    }
    flags.shockwaves = settings.shockwaves ?? true;
    flags.footprints = settings.footprints ?? true;
    flags.trails = settings.trails ?? true;
    flags.tier = tier;
    writeDanceFxInstancesV774(pulses.current, max, intensity, flags, sinks[0], sinks[1], sinks[2]);
  });

  return <group name="DanceFXInstancedV774">
    <instancedMesh ref={rings} args={[geometries.ring, materials[0], POOL]} visible={false} frustumCulled={false} />
    <instancedMesh ref={marks} args={[geometries.mark, materials[1], POOL]} visible={false} frustumCulled={false} />
    <instancedMesh ref={trails} args={[geometries.trail, materials[2], POOL]} visible={false} frustumCulled={false} />
  </group>;
}
