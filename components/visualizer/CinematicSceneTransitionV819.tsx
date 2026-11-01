'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,DoubleSide} from 'three';
import type {Mesh,ShaderMaterial} from 'three';
import type {CinematicTransitionCueV819} from './cinematicTransitionPlannerV819';

const VERTEX=`varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const FRAGMENT=`precision mediump float;
varying vec2 vUv;
uniform vec3 uPrimary;uniform vec3 uSecondary;
uniform float uOpacity;uniform float uStyle;uniform float uPhase;uniform float uProximity;uniform float uEdge;uniform float uSide;
float hash(float n){return fract(sin(n*127.1)*43758.5453);}
void main(){
  vec2 p=vUv;
  float glow=0.0;
  if(uStyle<0.5){ // soft vertical light wipe travelling across side-stage wall
    float sweep=uEdge<0.5?uProximity:1.0-uProximity;
    float head=mix(-0.2,1.2,sweep);
    float line=exp(-pow((p.x-head)*8.0,2.0));
    glow=line*(0.32+0.38*sin(p.y*3.14159));
  }else if(uStyle<1.5){ // small, horizontal glitch slices. No fullscreen flash.
    float row=floor(p.y*22.0);
    float grain=hash(row+floor(uPhase*8.0)*17.0+uSide*7.0);
    float bar=step(0.71,grain)*step(0.27,fract(p.x*2.0+grain*3.0+uPhase*.10));
    glow=bar*0.65*(0.5+0.5*sin(p.y*3.14159));
  }else{ // gentle diffused light dissolve for arena transitions
    float beam=exp(-pow((p.x-0.5)*2.8,2.0));
    float ripple=0.72+0.28*sin(p.y*8.0+uPhase*1.2+uSide);
    glow=beam*ripple*.48;
  }
  float edgeFade=smoothstep(0.02,0.22,p.x)*(1.0-smoothstep(0.75,0.98,p.x))*
   smoothstep(0.0,0.25,p.y)*(1.0-smoothstep(0.75,1.0,p.y));
  vec3 tone=mix(uPrimary,uSecondary,clamp(p.y*.65+uSide*.20,0.0,1.0));
  float alpha=clamp(uOpacity*glow*edgeFade,0.0,0.24);
  if(alpha<0.0005)discard;
  gl_FragColor=vec4(tone,alpha);
}`;
/** Two back-wing planes, no overdraw through the singers' center lane.
 * V791 already owns synchronized camera/lighting interpolation; this layer only embellishes it.
 */
export function CinematicSceneTransitionV819({cueRef}:{cueRef:{current:CinematicTransitionCueV819}}){
 const left=useRef<Mesh>(null),right=useRef<Mesh>(null);
 const leftMaterial=useRef<ShaderMaterial>(null),rightMaterial=useRef<ShaderMaterial>(null);
 const color1=useMemo(()=>new Color(),[]),color2=useMemo(()=>new Color(),[]);
 useFrame(()=>{
  const c=cueRef.current;
  if(left.current)left.current.visible=c.active;
  if(right.current)right.current.visible=c.active;
  if(!c.active)return;
  color1.set(c.primary);color2.set(c.secondary);
  for(const [index,material] of [leftMaterial.current,rightMaterial.current].entries()){
   if(!material)continue;
   material.uniforms.uPrimary.value.copy(color1);
   material.uniforms.uSecondary.value.copy(color2);
   material.uniforms.uOpacity.value=c.opacity;
   material.uniforms.uStyle.value=c.style==='wipe'?0:c.style==='glitch'?1:2;
   material.uniforms.uPhase.value=c.phase;
   material.uniforms.uProximity.value=c.progress;
   material.uniforms.uEdge.value=c.edge==='entry'?0:1;
   material.uniforms.uSide.value=index;
  }
 });
 const makeUniforms=(side:number)=>({uPrimary:{value:new Color('#40e5ff')},uSecondary:{value:new Color('#ef4ad8')},
  uOpacity:{value:0},uStyle:{value:0},uPhase:{value:0},uProximity:{value:0},uEdge:{value:0},uSide:{value:side}});
 const leftUniforms=useMemo(()=>makeUniforms(0),[]);
 const rightUniforms=useMemo(()=>makeUniforms(1),[]);
 return <group name="v819-cinematic-scene-transition" frustumCulled={false}>
  <mesh ref={left} position={[-4.45,.20,-3.55]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <planeGeometry args={[2.6,5.7,1,1]}/>
   <shaderMaterial ref={leftMaterial} uniforms={leftUniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT}
     transparent depthWrite={false} depthTest side={DoubleSide} toneMapped={false}/>
  </mesh>
  <mesh ref={right} position={[4.45,.20,-3.55]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <planeGeometry args={[2.6,5.7,1,1]}/>
   <shaderMaterial ref={rightMaterial} uniforms={rightUniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT}
     transparent depthWrite={false} depthTest side={DoubleSide} toneMapped={false}/>
  </mesh>
 </group>;
}
