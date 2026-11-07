"use client";
import {useFrame} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh,type ShaderMaterial} from 'three';
import type {ArenaAtmosphereDirectorCueV1045} from '@/lib/arena360AtmosphereDirectorV1045';
import type {VolumetricLightCueV1058} from '@/lib/arena360VolumetricLightingV1058';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import type {ArenaPeakStateV1036} from '@/lib/arena360AtmosphereV1036';
import {createArenaFogBanksV1036,planArenaAtmosphereV1036,sampleArenaFogV1036} from '@/lib/arena360AtmosphereV1036';
/** Fake, texture-free ground haze with a soft radial alpha shader.
 * Not volumetric particles, and never a dense layer over performers or subtitles.
 */
const vert=`varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}`;
const frag=`varying vec2 vUv; uniform float uOpacity; uniform float uTime; uniform vec3 uTint;
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);
float wisps=.86+.14*sin(p.x*5.+uTime*.2)*cos(p.y*4.-uTime*.13);
float alpha=uOpacity*(1.-smoothstep(.13,1.,r))*wisps;
gl_FragColor=vec4(uTint,alpha);}`;
export function ArenaLowFogV1036({audio,playing,reducedMotion,reactive,enabled,directorEnabled,
 section,progressMs,durationMs,intensity,peakRef,atmosphereV1045,volumetricCueV1058}: {
 audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive:boolean;enabled:boolean;directorEnabled:boolean;
 section?:string;progressMs?:number;durationMs?:number;intensity?:number;
 peakRef?:{readonly current:ArenaPeakStateV1036};atmosphereV1045?:ArenaAtmosphereDirectorCueV1045;
 volumetricCueV1058?:VolumetricLightCueV1058|null;
}){
 const tier=useAdaptivePerformance().tier;
 const banks=useMemo(()=>createArenaFogBanksV1036(tier),[tier]);
 const plumeBanks=useMemo(()=>banks.filter((_,i)=>i%2===0).slice(0,tier==='low'?2:tier==='balanced'?4:6),[banks,tier]);
 const mesh=useRef<InstancedMesh>(null),material=useRef<ShaderMaterial>(null);
 const plumes=useRef<InstancedMesh>(null),plumeMaterial=useRef<ShaderMaterial>(null);
 const dummy=useMemo(()=>new Object3D(),[]),budget=useRef(.2),clock=useRef(0),wasActive=useRef(true);
 const targetTint=useMemo(()=>new Color('#478eae'),[]);
 useLayoutEffect(()=>{budget.current=.2;},[banks]);
 useFrame((_,delta)=>{
  if(!enabled||!mesh.current||!material.current||!plumes.current||!plumeMaterial.current)return;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  const active=playing&&!reducedMotion&&reactive&&directorEnabled;
  if(active)clock.current+=dt*(atmosphereV1045?.active?atmosphereV1045.drift:1);
  if(!active&&!wasActive.current)return;
  budget.current+=dt;
  if(active&&budget.current<(tier==='low'?.17:.09))return;
  budget.current=0;wasActive.current=active;
  const cue=planArenaAtmosphereV1036({enabled:directorEnabled,playing,reducedMotion,reactive,
   section,progressMs,durationMs,energy:audio.energyEnvelope,intensity,peak:peakRef?.current.energy});
  // V1058 never overrides manually disabled fog; preserve V1045 tint priority.
  // Both the existing floor and wisp batches retain their original opacity caps.
  const volume=volumetricCueV1058?.active&&tier!=='low'&&active?volumetricCueV1058:null;
  const gain=(atmosphereV1045?.active?atmosphereV1045.fogGain:1)*(volume?.fogGain??1);
  const blend=Math.min(1,dt*1.5);
  targetTint.set(atmosphereV1045?.active?atmosphereV1045.fogColor:volume?.fogTint??'#478eae');
  material.current.uniforms.uTint.value.lerp(targetTint,blend);
  plumeMaterial.current.uniforms.uTint.value.lerp(targetTint,blend);
  material.current.uniforms.uTime.value=clock.current;
  const floorOpacity=active?Math.min(.16,cue.fog*.2*gain):0;
  const plumeOpacity=active?Math.min(.095,cue.fog*.12*gain):0;
  material.current.uniforms.uOpacity.value=active?
   material.current.uniforms.uOpacity.value+(floorOpacity-material.current.uniforms.uOpacity.value)*blend:0;
  plumeMaterial.current.uniforms.uTime.value=clock.current;
  plumeMaterial.current.uniforms.uOpacity.value=active?
   plumeMaterial.current.uniforms.uOpacity.value+(plumeOpacity-plumeMaterial.current.uniforms.uOpacity.value)*blend:0;
  for(let i=0;i<banks.length;i++){
   const b=banks[i],s=sampleArenaFogV1036(b,clock.current,cue);
   dummy.position.set(s.x,s.height,s.z);
   dummy.rotation.set(-Math.PI/2,0,b.angle);
   dummy.scale.set(2.4*s.size,1.4*s.size,1);
   dummy.updateMatrix();mesh.current.setMatrixAt(i,dummy.matrix);
  }
  mesh.current.instanceMatrix.needsUpdate=true;
  // A separate tiny batch of vertical smoke wisps on the outer stage ring.
  // No camera-facing billboards over the artists or lyrics.
  for(let i=0;i<plumeBanks.length;i++){
   const b=plumeBanks[i],sample=sampleArenaFogV1036(b,clock.current,cue);
   dummy.position.set(sample.x*1.14,-1.07+.035*Math.sin(clock.current*.24+b.phase),sample.z*1.14);
   dummy.rotation.set(0,-b.angle,0);
   dummy.scale.set(.48*sample.size,1.5*sample.size,1);
   dummy.updateMatrix();plumes.current.setMatrixAt(i,dummy.matrix);
  }
  plumes.current.instanceMatrix.needsUpdate=true;
 });
 if(!enabled)return null;
 return <group name="v1036-gentle-ground-haze">
  <instancedMesh ref={mesh} args={[undefined,undefined,banks.length]} frustumCulled={false}>
   <planeGeometry args={[1,1]}/>
   <shaderMaterial ref={material} vertexShader={vert} fragmentShader={frag}
    uniforms={{uOpacity:{value:0},uTime:{value:0},uTint:{value:new Color('#478eae')}}} depthWrite={false} transparent/>
  </instancedMesh>
  <instancedMesh name="v1036-soft-smoke-wisps" ref={plumes} args={[undefined,undefined,plumeBanks.length]} frustumCulled={false}>
   <planeGeometry args={[1,1]}/>
   <shaderMaterial ref={plumeMaterial} vertexShader={vert} fragmentShader={frag}
    uniforms={{uOpacity:{value:0},uTime:{value:0}}} depthWrite={false} transparent side={2}/>
  </instancedMesh>
 </group>;
}
