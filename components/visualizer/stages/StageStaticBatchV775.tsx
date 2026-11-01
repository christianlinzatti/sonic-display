"use client";
import {useLayoutEffect, useMemo, useRef} from "react";
import {InstancedMesh, Object3D} from "three";
import type {StageInstanceV775} from "./stageInstancePlansV775";

/**
 * Static, same-material stage props share one geometry/material and one draw call.
 * Geometry/material children are owned by R3F and disposed when the batch unmounts.
 * The original Object3D transforms are applied only on mount / plan change.
 */
export function StageStaticBatchV775({instances, geometry, color, material = "basic", metalness = 0,
  roughness = 1, emissive, emissiveIntensity = 0, name}: {
  instances: readonly StageInstanceV775[];
  geometry: "box" | "palmTrunk" | "palmLeaf" | "trussHousing";
  color: string;
  material?: "basic" | "standard";
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  name: string;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < instances.length; i++) {
      const transform = instances[i];
      const [x, y, z] = transform.position;
      const [sx, sy, sz] = transform.scale ?? [1, 1, 1];
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, 0, transform.rotationZ ?? 0);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.count = instances.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [dummy, instances]);

  return <instancedMesh ref={meshRef} name={name} args={[undefined, undefined, instances.length]}>
    {geometry === "box" ? <boxGeometry args={[1, 1, 1]}/> :
      geometry === "palmTrunk" ? <cylinderGeometry args={[.055, .1, 2.1, 8]}/> :
      geometry === "palmLeaf" ? <coneGeometry args={[.54, 1.2, 4]}/> :
      <cylinderGeometry args={[.18, .22, .4, 12]}/>}
    {material === "standard" ?
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness}
        emissive={emissive ?? "#000000"} emissiveIntensity={emissiveIntensity}/> :
      <meshBasicMaterial color={color}/>}
  </instancedMesh>;
}
