"use client";
/** Only two dim rings behind the cast. No video/audio crossfade, strobe, external
 * timer, light device access, camera ownership or extra crowd geometry. */
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import type {Mesh,MeshBasicMaterial} from 'three';
import {readConcertStageSyncV882} from './concertStageSyncV882';
import {sampleFlowV997} from './continuousConcertFlowV997';
export function ConcertFlowBridgeV997({allowed,color='#53b6da'}:{allowed:boolean;color?:string}){
 const near=useRef<Mesh>(null),far=useRef<Mesh>(null);
 const nearMat=useRef<MeshBasicMaterial>(null),farMat=useRef<MeshBasicMaterial>(null);
 useFrame(()=>{
  const sync=readConcertStageSyncV882();
  const cue=sampleFlowV997(sync.flowCueV997,sync.trackId,Date.now(),sync.playing,
   !allowed||!sync.enabled||!sync.sync.stage||sync.reducedMotion||!!sync.manual);
  if(near.current)near.current.visible=cue.active;
  if(far.current)far.current.visible=cue.active;
  if(!cue.active)return;
  if(near.current)near.current.scale.setScalar(1.1+cue.progress*.25);
  if(far.current)far.current.scale.setScalar(1.3+cue.progress*.13);
  if(nearMat.current)nearMat.current.opacity=cue.opacity;
  if(farMat.current)farMat.current.opacity=cue.opacity*.50;
 });
 return <group name="v997-visual-track-handover">
  <mesh ref={near} visible={false} position={[0,.15,-3.35]} renderOrder={-1}>
   <ringGeometry args={[1.65,1.69,56]}/>
   <meshBasicMaterial ref={nearMat} color={color} transparent opacity={0} depthWrite={false} depthTest toneMapped={false}/>
  </mesh>
  <mesh ref={far} visible={false} position={[0,.15,-3.38]} renderOrder={-1}>
   <ringGeometry args={[1.98,2.0,56]}/>
   <meshBasicMaterial ref={farMat} color={color} transparent opacity={0} depthWrite={false} depthTest toneMapped={false}/>
  </mesh>
 </group>;
}
