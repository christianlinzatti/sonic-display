'use client';
import {useMemo,useRef,useEffect} from 'react';
import {getActivePerformanceTier} from './adaptivePerformance';
import {useFrame} from '@react-three/fiber';
import {AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Points, PointsMaterial, ShaderMaterial} from 'three';
import type {VisualFxCueV353} from '@/services/stageContent/visualEffectsStudioV353';
/** Single-canvas, two-draw-call FX. Fixed 96-point geometry; no per-beat allocations or timers.
 * Shader is behind all stage surfaces (z=-4.5); depthWrite=false and low alpha preserve lyrics. */
export function StageVisualEffectsV353({cue}:{cue:VisualFxCueV353}){
 const particles=useRef<Points>(null);
 const shader=useRef<ShaderMaterial>(null);
 const material=useRef<PointsMaterial>(null);
 const geometry=useMemo(()=>{
  const points:number[]=[];
  for(let i=0;i<96;i++){
   const a=i*2.399963229728653,r=Math.sqrt((i+.5)/96);
   points.push(Math.cos(a)*4.4*r,Math.sin(a*3.1)*2.15+0.2,-2.8-(i%6)*.18);
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(points,3));g.setDrawRange(0,0);
  return g;
 },[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 const uniforms=useMemo(()=>({uTime:{value:0},uAlpha:{value:0},uColor:{value:new Color('#62c7ff')}}),[]);
 useFrame((state,dt)=>{
  const tier=getActivePerformanceTier();
  const count=cue.active?(tier==='low'?0:Math.min(cue.particleCount,tier==='balanced'?42:96)):0;
  geometry.setDrawRange(0,count);
  if(particles.current){
   particles.current.visible=count>0;
   if(count>0)particles.current.rotation.z+=Math.min(dt,.08)*cue.particleSpeed*.02;
  }
  if(material.current){material.current.opacity=cue.particleOpacity;material.current.color.set(cue.color);}
  if(shader.current){shader.current.visible=cue.active&&tier!=='low'&&cue.shaderStrength>.005;
   uniforms.uAlpha.value=cue.shaderStrength;
   uniforms.uColor.value.set(cue.color);
   if(cue.particleSpeed>0)uniforms.uTime.value+=Math.min(dt,.08)*cue.particleSpeed;
  }
 });
 return <group name="SonicVisualEffectsV353" renderOrder={-1}>
  <points ref={particles} geometry={geometry} visible={false} frustumCulled={false}>
   <pointsMaterial ref={material} color={cue.color} size={.047} sizeAttenuation transparent opacity={0}
    depthWrite={false} blending={AdditiveBlending}/>
  </points>
  <mesh position={[0,.15,-4.5]} renderOrder={-1}>
   <planeGeometry args={[10,6]}/>
   <shaderMaterial ref={shader} visible={false} transparent depthWrite={false} depthTest={true}
    blending={AdditiveBlending} uniforms={uniforms}
    vertexShader={`varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
    fragmentShader={`varying vec2 vUv; uniform float uTime; uniform float uAlpha; uniform vec3 uColor;
    void main(){vec2 p=vUv-.5; float r=length(p*vec2(1.0,1.65));
      float halo=pow(max(0.0,1.0-r*1.5),2.5);
      float wave=.75+.25*sin(uTime*.8+vUv.x*6.283);
      gl_FragColor=vec4(uColor,clamp(uAlpha*halo*wave,0.0,.32));}`}/>
  </mesh>
 </group>;
}
