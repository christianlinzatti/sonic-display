"use client";
import {AdditiveBlending,Color,DoubleSide,NormalBlending} from 'three';
import type {AtmosphereDepthCueV989} from '@/lib/volumetricAtmosphereV989';
import {useConcertGovernorLevelV999,getConcertFactorsV999} from './concertPerformanceGovernorStoreV999';
import {limitDepthV999} from './intelligentPerformanceGovernorV999';
import {DEPTH_FRAGMENT_V989,DEPTH_VERTEX_V989} from './volumetricDepthShaderV989';

/** Max 2 / 4 / 6 transparent meshes, all using the EXISTING R3F Canvas.
 * Static geometry, no lights, no shadows, no animation loop or real fog allocation.
 */
export function VolumetricDepthV989({cue}:{cue:AtmosphereDepthCueV989}){
 useConcertGovernorLevelV999(); // React commit only at governor-level changes; no second RAF.
 cue=limitDepthV999(cue,getConcertFactorsV999().depth);
 if(!cue.active)return null;
 return <group name="VolumetricDepthV989">
  {cue.layers.map((layer,index)=>{
   const fog=layer.kind==='fog';
   return <mesh key={`${layer.kind}-${index}`}
     position={fog?[0,-.49+index*.006,layer.z]:[layer.side*(2.3+index*.12),1.05,layer.z]}
     rotation={fog?[-Math.PI/2,0,0]:[0,layer.side*.17,-layer.side*.14]}>
     <planeGeometry args={[layer.width,fog?2.8:3.65]}/>
     <shaderMaterial vertexShader={DEPTH_VERTEX_V989} fragmentShader={DEPTH_FRAGMENT_V989}
      uniforms={{uColor:{value:new Color(fog?cue.colorB:cue.colorA)},
       uOpacity:{value:layer.opacity},uPhase:{value:layer.phase},uKind:{value:fog?1:0}}}
      depthWrite={false} depthTest={true} side={DoubleSide} transparent
      blending={fog?NormalBlending:AdditiveBlending}/>
    </mesh>;
  })}
 </group>;
}
