"use client";
import type {ImmersiveCueV966} from '@/lib/immersiveConcertEngineV966';
import {AdditiveBlending,DoubleSide} from 'three';
import {planImmersiveDepthV982} from '@/lib/immersiveDepthPortalV982';

/** A few bounded, unlit meshes in the existing stage Canvas.
 * No lights, post-process passes, timers, additional render loops or hardware.
 * They sit behind/at the perimeter of performers and leave lyrics unobstructed.
 */
export function ImmersiveConcertEnvironmentV966({cue}:{cue:ImmersiveCueV966}){
 if(!cue.active)return null;
 const depthRingsV982=planImmersiveDepthV982(cue);
 return <group name="ImmersiveConcertEnvironmentV966">
  {/* Perimeter light shafts create perceived depth without actual volumetric raymarching. */}
  {[-1,1].map(side=><group key={`side-${side}`}>
   <mesh position={[side*3.2,1.5,-2.7]} rotation={[0,0,-side*.22]}>
    <coneGeometry args={[1.05,3.4,12,1,true]}/>
    <meshBasicMaterial color={cue.colorA} opacity={cue.beamOpacity} transparent
     depthWrite={false} side={DoubleSide} blending={AdditiveBlending}/>
   </mesh>
   <mesh position={[side*3.55,-.72,-.8]} rotation={[-Math.PI/2,0,0]}>
    <circleGeometry args={[1.05,20]}/>
    <meshBasicMaterial color={cue.colorB} opacity={cue.floorGlowOpacity} transparent depthWrite={false}/>
   </mesh>
   <mesh position={[side*3.9,1,-3.2]}>
    <planeGeometry args={[.25,3.2]}/>
    <meshBasicMaterial color={cue.colorB} opacity={cue.sideGlowOpacity} transparent
     depthWrite={false} side={DoubleSide} blending={AdditiveBlending}/>
   </mesh>
  </group>)}
  {/* Far backdrop and rim arc are outside the performer blocking region. */}
  <mesh position={[0,1.8,-4.3]} scale={[cue.archScale,cue.archScale,1]}>
   <torusGeometry args={[3.25,.025,6,48,Math.PI]}/>
   <meshBasicMaterial color={cue.colorA} opacity={cue.sideGlowOpacity} transparent
    depthWrite={false} blending={AdditiveBlending}/>
  </mesh>
  {/* V982: bounded concentric depth accents. Only high-confidence V966 scenes
      get the extra three far-stage draw calls; no new lights or render loop. */}
  {depthRingsV982.map((ring,i)=><mesh key={`depth-ring-${i}`}
   position={[0,1.55,ring.z]} scale={[cue.archScale,cue.archScale,1]}>
   <torusGeometry args={[ring.radius,ring.width,4,48]}/>
   <meshBasicMaterial color={i===1?cue.colorB:cue.colorA} opacity={ring.opacity}
    transparent depthWrite={false} blending={AdditiveBlending}/>
  </mesh>)}
  <mesh position={[0,1.5,-4.5]}>
   <planeGeometry args={[7.8,4.6]}/>
   <meshBasicMaterial color={cue.colorB} opacity={cue.backHazeOpacity} transparent depthWrite={false}/>
  </mesh>
  {/* Ambient crowd-edge wash; does not add or override crowd instances. */}
  {[-1,1].map(side=><mesh key={`crowd-edge-${side}`} position={[side*4,-.62,1]} rotation={[-Math.PI/2,0,0]}>
   <planeGeometry args={[1.25,2.5]}/>
   <meshBasicMaterial color={cue.colorA} opacity={cue.audienceEdgeOpacity} transparent depthWrite={false}/>
  </mesh>)}
 </group>;
}
