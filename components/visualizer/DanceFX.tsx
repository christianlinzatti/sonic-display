"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, DoubleSide, Group, Mesh, MeshBasicMaterial } from "three";
import type { AudioFeatures } from "@/types/audio";
import { getActivePerformanceTier } from "./adaptivePerformance";
import {shouldSkipDormantFxV552} from "./piConcertDrawBudgetV552";

type FxSettings = { tint?:string; enabled?: boolean; strength?: number; shockwaves?: boolean; footprints?: boolean; trails?: boolean };
type Pulse = { active: boolean; age: number; x: number; z: number; side: number };
const POOL = 8;
const clamp = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
/** Bounded geometry pool; effect objects never mount/unmount on every beat. */
export function DanceFX({ audio, isPlaying, reducedMotion, settings }: {audio: AudioFeatures; isPlaying: boolean; reducedMotion: boolean; settings: FxSettings}) {
  const group = useRef<Group>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  const marks = useRef<(Mesh | null)[]>([]);
  const trails = useRef<(Mesh | null)[]>([]);
  const pulses = useRef<Pulse[]>(Array.from({ length: POOL }, () => ({ active:false, age:0, x:0, z:0, side:0 })));
  const cursor = useRef(0);
  const elapsed = useRef(0);
  const lastKick = useRef(-10);
  const lastBeat = useRef(false);
  const wasEnabledV552=useRef(false);
  const tint = useMemo(() => new Color("#4feafa"), []);
  tint.set(settings.tint ?? "#4feafa");
  useFrame((state, delta) => {
    const tier = getActivePerformanceTier();
    const enabled = (settings.enabled ?? false) && !reducedMotion && isPlaying && (settings.strength ?? 60) > 0;
    const max = tier === "low" ? 2 : tier === "balanced" ? 4 : POOL;
    const intensity = clamp((settings.strength ?? 60) / 100);
    elapsed.current += Math.min(delta, 0.1);
    const isBeat = !!audio.beat;
    const onset = isBeat && !lastBeat.current;
    lastBeat.current = isBeat;
    // V552: a disabled pool has nothing to simulate/render after the first
    // disable frame. Stop visiting 24 meshes each frame; preserve beat edge.
    if(shouldSkipDormantFxV552(enabled,wasEnabledV552.current))return;
    if(!enabled){
      for(const pulse of pulses.current)pulse.active=false;
      for(let i=0;i<POOL;i++){
        if(rings.current[i])rings.current[i]!.visible=false;
        if(marks.current[i])marks.current[i]!.visible=false;
        if(trails.current[i])trails.current[i]!.visible=false;
      }
      if(group.current)group.current.visible=false;
      wasEnabledV552.current=false;
      return;
    }
    wasEnabledV552.current=true;
    const kick = Math.max(clamp(audio.kickAccentIntensity ?? 0), clamp(audio.kick), clamp(audio.beatStrength));
    // Fire on the first beat edge or a strong kick accent, never on each rendered frame.
    const trigger = enabled && tier !== "low" && (onset || (audio.kickAccent === "strong" && kick > .75)) &&
      elapsed.current - lastKick.current >= 0.24 && kick > 0.19;
    if (trigger) {
      lastKick.current = elapsed.current;
      const pulse = pulses.current[cursor.current % max];
      cursor.current++;
      pulse.active = true; pulse.age = 0; pulse.side = cursor.current % 2 === 0 ? -1 : 1;
      pulse.x = pulse.side * 0.36; pulse.z = 0.06;
    }
    for (let i=0; i<POOL; i++) {
      const pulse=pulses.current[i];
      if (pulse.active) { pulse.age += Math.min(delta,.1); if (pulse.age>1.1) pulse.active=false; }
      const visible = enabled && i < max && pulse.active;
      const ring=rings.current[i];
      const mark=marks.current[i];
      const trail=trails.current[i];
      if (ring) {
        ring.visible=visible && (settings.shockwaves ?? true) && tier!=="low";
        if (ring.visible) {
          const grow=0.2+pulse.age*2.2; ring.position.set(pulse.x,-1.52,pulse.z); ring.scale.setScalar(grow);
          (ring.material as MeshBasicMaterial).opacity=Math.max(0,(1-pulse.age/.95)*.56*intensity);
        }
      }
      if (mark) {
        mark.visible=visible && (settings.footprints ?? true);
        if(mark.visible) {
          mark.position.set(pulse.x,-1.514,pulse.z); mark.rotation.z=pulse.side*0.16;
          (mark.material as MeshBasicMaterial).opacity=Math.max(0,(1-pulse.age/1.1)*.42*intensity);
        }
      }
      if(trail) {
        trail.visible=visible && (settings.trails ?? true) && tier==="high";
        if(trail.visible) {
          trail.position.set(pulse.x + pulse.side*pulse.age*.11, -1.37+pulse.age*.3, pulse.z);
          trail.scale.setScalar(.5 + pulse.age*.7);
          (trail.material as MeshBasicMaterial).opacity=Math.max(0,(1-pulse.age/.65)*.25*intensity);
        }
      }
    }
    if(group.current) group.current.visible=enabled;
  });
  return <group ref={group} visible={false}>
    {Array.from({length:POOL},(_,i)=><group key={i}>
      <mesh ref={node=>{rings.current[i]=node}} visible={false} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[.34,.41,32]}/><meshBasicMaterial color={tint} transparent opacity={0} depthWrite={false} side={DoubleSide} blending={AdditiveBlending}/>
      </mesh>
      <mesh ref={node=>{marks.current[i]=node}} visible={false} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[.2,.33]}/><meshBasicMaterial color="#cb79ff" transparent opacity={0} depthWrite={false} side={DoubleSide}/>
      </mesh>
      <mesh ref={node=>{trails.current[i]=node}} visible={false}>
        <sphereGeometry args={[.14,8,6]}/><meshBasicMaterial color="#6decff" transparent opacity={0} depthWrite={false} blending={AdditiveBlending}/>
      </mesh>
    </group>)}
  </group>;
}
