"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh, Object3D } from "three";
import type { VisualizerProps } from "./registry";
import { resolveVocalCueV367 } from "./vocalLipSyncV367";

const morphNames = {
  jaw: /^(jawopen|mouthopen|viseme_aa|viseme_ah|aa|a|open)$/i,
  wide: /^(mouthstretchleft|mouthstretchright|mouthsmileleft|mouthsmileright|viseme_e|viseme_i|viseme_ee|ee)$/i,
  round: /^(mouthfunnel|mouthpucker|viseme_o|viseme_u|viseme_ou|ou)$/i,
};
type Channel = "jaw" | "wide" | "round";
type MorphChannel = {mesh: Mesh; index: number; channel: Channel; weight: number};
function findVocalTargets(model: Object3D) {
  const channels: MorphChannel[] = [];
  let jaw: Object3D | null = null;
  model.traverse(node => {
    if (!jaw && /(^|[_.:-])(jaw|mandible)([_.:-]|$)/i.test(node.name)) jaw = node;
    const mesh = node as Mesh;
    if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    Object.entries(mesh.morphTargetDictionary).forEach(([key, index]) => {
      const channel = (Object.keys(morphNames) as Channel[]).find(k => morphNames[k].test(key));
      if (channel && Number.isInteger(index) && index >= 0 && index < mesh.morphTargetInfluences!.length)
        channels.push({ mesh, index, channel, weight: 0 });
    });
  });
  return { channels, jaw };
}
/** Late per-avatar overlay. Never mutates a shared GLTF asset; model is the dancer's clone. */
export function VocalRigV367({ model, lipSync, audio }: {
  model: Object3D;
  lipSync?: VisualizerProps["lipSync"];
  audio: VisualizerProps["audio"];
}) {
  const targets = useMemo(() => findVocalTargets(model), [model]);
  const lastJaw = useRef(0);
  const smoothed = useRef({ jaw: 0, wide: 0, round: 0 });
  useFrame((_, delta) => {
    const cue = lipSync?.enabled
      ? resolveVocalCueV367(lipSync.lyrics, lipSync.progressMs, lipSync.playing, lipSync.mode, audio.mids)
      : { jaw: 0, wide: 0, round: 0 };
    const t = Math.min(1, Math.max(0, delta) * (cue.jaw > smoothed.current.jaw ? 23 : 13));
    const strength = Math.max(0, Math.min(1.5, (lipSync?.strength ?? 80) / 100));
    for (const key of ["jaw", "wide", "round"] as const) {
      smoothed.current[key] += (cue[key] * strength - smoothed.current[key]) * t;
    }
    const { channels, jaw } = targets;
    if (channels.length) {
      for (const target of channels) {
        const influences = target.mesh.morphTargetInfluences;
        if (!influences) continue;
        // Add only this component's previous delta. Preserves authored facial animation.
        const base = influences[target.index] - target.weight;
        const value = smoothed.current[target.channel];
        const overlay = Math.min(1 - Math.max(0, base), value * (target.channel === "wide" ? .48 : .9));
        influences[target.index] = Math.max(0, Math.min(1, base + overlay));
        target.weight = overlay;
      }
    } else if (jaw) {
      // Bone fallback when the model supplies no recognized face morphs.
      (jaw as Object3D).rotation.x += smoothed.current.jaw * .22 - lastJaw.current;
      lastJaw.current = smoothed.current.jaw * .22;
    }
  });
  return null;
}
