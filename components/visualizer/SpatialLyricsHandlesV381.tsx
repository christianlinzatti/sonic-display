"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";
import { STUDIO_CAST_POSITIONS_V380, type StudioCastV380 } from "./realLyricsPreviewV380";
import { checkFaceSafetyV381, dragSpatialLayoutV381, findSafeLayoutV381, normalizeSpatialLayoutV381,
  type LyricsSpatialLayoutV381, type ScreenRectV381, type SpatialDragModeV381 } from "./lyricsSpatialEditorV381";

export interface SpatialSafetyV381 { caption:ScreenRectV381; faces:ScreenRectV381[]; conflicts:number[]; }
interface Props {
  layout:LyricsSpatialLayoutV381; side:"left"|"right";depth:number;cast:StudioCastV380;avatarScale:number;
  editable:boolean;autoPlaceRequest:number;onLayoutChange:(layout:LyricsSpatialLayoutV381)=>void;
  onSafetyChange:(result:SpatialSafetyV381)=>void;
}
const v=(x:number,y:number,z:number)=>new Vector3(x,y,z);
const box=(corners:Vector3[]):ScreenRectV381=>({
  left:Math.min(...corners.map(p=>(p.x+1)/2)),right:Math.max(...corners.map(p=>(p.x+1)/2)),
  top:Math.min(...corners.map(p=>(1-p.y)/2)),bottom:Math.max(...corners.map(p=>(1-p.y)/2))
});
/** Actual camera projection, not a second simulated camera. Face bounds approximate humanoid heads rather than identifying GLB facial bones. */
export function projectSpatialSafetyV381(camera:import("three").Camera,layout:LyricsSpatialLayoutV381,side:"left"|"right",depth:number,cast:StudioCastV380,avatarScale:number):SpatialSafetyV381 {
  camera.updateMatrixWorld();
  if ("updateProjectionMatrix" in camera && typeof camera.updateProjectionMatrix === "function") camera.updateProjectionMatrix();
  const baseline=(side==="right"?1:-1)*(1.22+Math.min(1,Math.max(0,depth/100))*.20);
  const x=baseline+layout.x, y=layout.y, z=-.4-Math.min(1,Math.max(0,depth/100))*.65+layout.z;
  const halfWidth=1.35*layout.scale,halfHeight=.61*layout.scale;
  const caption=box([v(x-halfWidth,y-halfHeight,z).project(camera),v(x+halfWidth,y+halfHeight,z).project(camera)]);
  const faceRadiusX=.24*Math.max(.6,avatarScale),faceRadiusY=.32*Math.max(.6,avatarScale);
  const faces=STUDIO_CAST_POSITIONS_V380[cast].map(avatarX=>box([
    v(avatarX-faceRadiusX,.85-faceRadiusY,-.04).project(camera),v(avatarX+faceRadiusX,.85+faceRadiusY,-.04).project(camera)
  ]));
  return {caption,faces,conflicts:checkFaceSafetyV381(caption,faces,layout.safeMargin)};
}
/** Camera/world-space pointer intersection: works identically with a mouse or a touchscreen. */
function rayPointAtDepth(e:ThreeEvent<PointerEvent>,z:number) {
  const direction=e.ray.direction;
  if(Math.abs(direction.z)<.00001)return e.point.clone();
  return e.ray.origin.clone().addScaledVector(direction,(z-e.ray.origin.z)/direction.z);
}
export function SpatialLyricsHandlesV381({layout,side,depth,cast,avatarScale,editable,autoPlaceRequest,onLayoutChange,onSafetyChange}:Props) {
  const {camera,invalidate}=useThree();
  const origin=useRef<{layout:LyricsSpatialLayoutV381;start:Vector3;z:number;mode:SpatialDragModeV381}|null>(null);
  const sampleAt=useRef(-1);
  const initialized=useRef(autoPlaceRequest);
  const normalized=normalizeSpatialLayoutV381(layout);
  const baseline=(side==="right"?1:-1)*(1.22+Math.min(1,Math.max(0,depth/100))*.2);
  const hitZ=.65+normalized.z;
  const safe=(candidate:LyricsSpatialLayoutV381)=>projectSpatialSafetyV381(camera,candidate,side,depth,cast,avatarScale).conflicts.length>0;
  useEffect(()=>{
    if(initialized.current===autoPlaceRequest)return;
    initialized.current=autoPlaceRequest;
    const resolved=findSafeLayoutV381(normalized,safe);
    if(resolved)onLayoutChange(resolved);
    invalidate();
  // Trigger only when user requests auto-placement; current props are read in that event cycle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[autoPlaceRequest]);
  useFrame(({clock})=>{
    if(!editable||clock.elapsedTime-sampleAt.current<.30)return;
    sampleAt.current=clock.elapsedTime;
    onSafetyChange(projectSpatialSafetyV381(camera,normalized,side,depth,cast,avatarScale));
  });
  if(!editable)return null;
  const begin=(e:ThreeEvent<PointerEvent>,mode:SpatialDragModeV381)=>{
    e.stopPropagation();
    origin.current={layout:normalized,start:rayPointAtDepth(e,hitZ),z:hitZ,mode};
    (e.target as Element | null)?.setPointerCapture?.(e.pointerId);
  };
  const move=(e:ThreeEvent<PointerEvent>)=>{
    if(!origin.current)return;
    e.stopPropagation();
    const drag=origin.current;
    const point=rayPointAtDepth(e,drag.z);
    const candidate=dragSpatialLayoutV381(drag.layout,point.x-drag.start.x,point.y-drag.start.y,drag.mode);
    if(candidate.faceGuard&&safe(candidate))return;
    onLayoutChange(candidate);
    invalidate();
  };
  const end=(e:ThreeEvent<PointerEvent>)=>{
    if(!origin.current)return;
    e.stopPropagation();
    origin.current=null;
    const target=e.target as Element | null;
    if(target?.hasPointerCapture?.(e.pointerId))target.releasePointerCapture(e.pointerId);
  };
  return <group>
    <mesh position={[baseline+normalized.x,normalized.y,hitZ]} onPointerDown={e=>begin(e,"move")}
      onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <planeGeometry args={[2.7*normalized.scale,1.22*normalized.scale]}/>
      <meshBasicMaterial color="#6cecf4" transparent opacity={.10} depthTest={false} depthWrite={false}/>
    </mesh>
    <mesh position={[baseline+normalized.x,normalized.y,hitZ-.002]}>
      <planeGeometry args={[2.7*normalized.scale,1.22*normalized.scale]}/>
      <meshBasicMaterial color="#49e1f3" wireframe transparent opacity={.64} depthTest={false} depthWrite={false}/>
    </mesh>
    <mesh position={[baseline+normalized.x+1.35*normalized.scale,normalized.y-.61*normalized.scale,hitZ+.025]}
      onPointerDown={e=>begin(e,"scale")} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <sphereGeometry args={[.115,14,12]}/>
      <meshBasicMaterial color="#ffcd76" depthTest={false} depthWrite={false}/>
    </mesh>
  </group>;
}
