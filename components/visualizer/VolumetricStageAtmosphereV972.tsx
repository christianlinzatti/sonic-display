"use client";
import {AdditiveBlending,Color,DoubleSide,NormalBlending} from 'three';
import type {VolumetricCueV972} from '@/lib/volumetricStageAtmosphereV972';
import {VOLUMETRIC_FRAGMENT_V972,VOLUMETRIC_VERTEX_V972} from './volumetricShaderV972';

/** Each transparent plane is depth-write-free and bounded. All motion comes from
 * verified song time; this adds no useFrame, timers, lights or hardware I/O.
 * Eco (Pi) draws four planes; balanced seven; cinematic ten.
 */
export function VolumetricStageAtmosphereV972({cue}:{cue:VolumetricCueV972}){
 if(!cue.active)return null;
 return <group name="VolumetricStageAtmosphereV972">
  {[-1,1].flatMap(side=>Array.from({length:cue.beamLayers},(_,i)=>
   <mesh key={`shaft-${side}-${i}`}
    position={[side*(2.7+i*.22),1.35,-2.55-i*.35]}
    rotation={[0,side*.14,-side*.09]}
    scale={[cue.fanWidth,1,1]}>
    <planeGeometry args={[2.35+i*.28,3.8,1,1]}/>
    <shaderMaterial vertexShader={VOLUMETRIC_VERTEX_V972} fragmentShader={VOLUMETRIC_FRAGMENT_V972}
     uniforms={{uColor:{value:new Color(cue.colorA)},
      uOpacity:{value:cue.beamOpacity/Math.sqrt(cue.beamLayers)},
      uPhase:{value:cue.phase+i*.33},uKind:{value:0}}}
     transparent depthWrite={false} depthTest={true} side={DoubleSide} blending={AdditiveBlending}/>
   </mesh>))}
  {Array.from({length:cue.hazeLayers},(_,i)=><mesh key={`haze-${i}`}
   position={[0,1.2,-3.75-i*.22]}>
    <planeGeometry args={[7.6,3.8]}/>
    <shaderMaterial vertexShader={VOLUMETRIC_VERTEX_V972} fragmentShader={VOLUMETRIC_FRAGMENT_V972}
     uniforms={{uColor:{value:new Color(cue.colorB)},
      uOpacity:{value:cue.hazeOpacity/cue.hazeLayers},
      uPhase:{value:cue.phase+i*.6},uKind:{value:1}}}
     transparent depthWrite={false} depthTest={true} side={DoubleSide} blending={NormalBlending}/>
   </mesh>)}
  <mesh position={[0,-.53,-1.65]} rotation={[-Math.PI/2,0,0]}>
    <planeGeometry args={[6.5,3.15]}/>
    <shaderMaterial vertexShader={VOLUMETRIC_VERTEX_V972} fragmentShader={VOLUMETRIC_FRAGMENT_V972}
     uniforms={{uColor:{value:new Color(cue.colorB)},uOpacity:{value:cue.floorOpacity},
      uPhase:{value:cue.phase},uKind:{value:2}}}
     transparent depthWrite={false} depthTest={true} side={DoubleSide} blending={NormalBlending}/>
  </mesh>
 </group>;
}
