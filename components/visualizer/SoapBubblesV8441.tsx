"use client";
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Object3D} from 'three';
import type {InstancedMesh,ShaderMaterial} from 'three';
import type {SoapBubbleCueV8441} from './festivalBubblesFlashPlannerV8441';
// One thin, iridescent quad per bubble, instanced; capped at 64 and without shadows.
const BUBBLE_VERTEX_V8441=`
 varying vec2 vUvBubble;
 varying float vTint;
 void main(){
   vUvBubble=uv;
   #ifdef USE_INSTANCING
   vTint=fract(instanceMatrix[3][0]*.173+instanceMatrix[3][1]*.297);
   vec4 pos=instanceMatrix*vec4(position,1.0);
   #else
   vTint=0.5;
   vec4 pos=vec4(position,1.0);
   #endif
   gl_Position=projectionMatrix*modelViewMatrix*pos;
 }
`;
const BUBBLE_FRAGMENT_V8441=`
 precision mediump float;
 varying vec2 vUvBubble;
 varying float vTint;
 uniform float uAlpha;
 void main(){
   vec2 d=vUvBubble-vec2(.5);
   float r=length(d)*2.0;
   if(r>=1.0)discard;
   float rim=smoothstep(.69,.93,r)*(1.0-smoothstep(.965,1.0,r));
   float inner=(1.0-smoothstep(.25,.86,r))*.12;
   float shift=clamp(vUvBubble.y*.8+vTint*.25,0.0,1.0);
   vec3 tint=mix(vec3(.28,.84,1.0),vec3(1.0,.58,.92),shift);
   float alpha=min(.30,uAlpha)*(rim*.85+inner);
   gl_FragColor=vec4(tint,alpha);
 }
`;
export function SoapBubblesV8441({cueRef}:{cueRef:{current:SoapBubbleCueV8441}}){
 const mesh=useRef<InstancedMesh>(null),material=useRef<ShaderMaterial>(null);
 const dummy=useMemo(()=>new Object3D(),[]),elapsed=useRef(.1);
 useFrame((state,dt)=>{
  const cue=cueRef.current,m=mesh.current;
  if(!m)return;
  const count=cue.active?Math.min(64,Math.max(0,cue.count)):0;
  m.count=count;m.visible=count>0;
  if(material.current)material.current.uniforms.uAlpha.value=m.visible?Math.min(.27,cue.opacity):0;
  if(!m.visible){elapsed.current=.1;return;}
  elapsed.current+=Math.min(.1,Math.max(0,dt));
  if(elapsed.current<1/30)return;
  elapsed.current=0;
  for(let k=0;k<count;k++){
   const t=(k*0.61803398875)%1;
   const rise=(((cue.phase*cue.riseSpeed*.16+t)*1.0)%1.0+1.0)%1.0;
   const side=k%2===0?-1:1;
   dummy.position.set(side*(2.1+t*.95)+Math.sin(cue.phase*.32+k*2.13)*.28,
     -1.50+rise*3.65,-2.80-.3*t);
   dummy.quaternion.copy(state.camera.quaternion);
   const radius=.19+(k%5)*.043;
   dummy.scale.set(radius,radius,.01);
   dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);
  }
  m.instanceMatrix.needsUpdate=true;
 });
 return <instancedMesh name="v8441-soap-bubbles" ref={mesh} args={[undefined,undefined,64]}
   visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
   <planeGeometry args={[1,1]}/>
   <shaderMaterial ref={material} vertexShader={BUBBLE_VERTEX_V8441}
     fragmentShader={BUBBLE_FRAGMENT_V8441} transparent depthTest depthWrite={false}
     toneMapped={false} uniforms={{uAlpha:{value:0}}}/>
 </instancedMesh>;
}
