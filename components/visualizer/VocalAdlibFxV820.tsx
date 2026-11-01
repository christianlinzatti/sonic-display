'use client';
/** V820 – side-wing vocal identity accents and optionally a single explicitly
 * timestamped adlib word. The readable lyrics and actual vocal camera own the center. */
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {CanvasTexture,Color,DoubleSide,LinearFilter,SRGBColorSpace} from 'three';
import type {Mesh,MeshBasicMaterial,ShaderMaterial} from 'three';
import type {VocalAdlibFxCueV820} from './vocalAdlibFxPlannerV820';

const VERTEX=`varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const FRAGMENT=`precision mediump float;
varying vec2 vUv;
uniform vec3 uPrimary;uniform vec3 uSecondary;
uniform float uLead;uniform float uAdlib;uniform float uPhase;uniform float uSide;
uniform float uLeadSide;uniform float uAdlibSide;uniform float uFeature;
void main(){
  vec2 uv=vUv;
  float leadMask=1.0-step(0.5,abs(uSide-uLeadSide));
  float adlibMask=1.0-step(0.5,abs(uSide-uAdlibSide));
  float glow=exp(-pow((uv.x-0.50)*3.5,2.0));
  float horizontal=smoothstep(.06,.26,uv.y)*(1.0-smoothstep(.76,.96,uv.y));
  float organic=.84+.16*sin(uv.y*9.0+uPhase*1.4);
  float featureCut=uFeature>.5?(.68+.32*sin(uv.y*18.0+uPhase*2.0)):1.0;
  float lead=leadMask*uLead*glow*horizontal*organic*featureCut;
  float adlib=adlibMask*uAdlib*exp(-pow((uv.y-.68)*5.0,2.0))*
    (.55+.45*sin(uv.y*24.0+uPhase*5.0))*glow;
  float alpha=clamp(lead+adlib,0.0,.22);
  if(alpha<.0005)discard;
  vec3 tone=mix(uPrimary,uSecondary,clamp(uFeature*.6+adlib/(lead+adlib+.001),0.0,1.0));
  gl_FragColor=vec4(tone,alpha);
}`;
const uniforms=(side:number)=>({uPrimary:{value:new Color('#40e5ff')},uSecondary:{value:new Color('#ef4ad8')},
 uLead:{value:0},uAdlib:{value:0},uPhase:{value:0},uSide:{value:side},uLeadSide:{value:0},uAdlibSide:{value:1},uFeature:{value:0}});
export function VocalAdlibFxV820({cueRef}:{cueRef:{current:VocalAdlibFxCueV820}}){
 const left=useRef<Mesh>(null),right=useRef<Mesh>(null),wordMesh=useRef<Mesh>(null);
 const leftMat=useRef<ShaderMaterial>(null),rightMat=useRef<ShaderMaterial>(null);
 const wordMat=useRef<MeshBasicMaterial>(null);
 const wordTexture=useRef<CanvasTexture|null>(null),canvasRef=useRef<HTMLCanvasElement|null>(null);
 const drawn=useRef(''),primary=useMemo(()=>new Color(),[]),secondary=useMemo(()=>new Color(),[]);
 const leftUniforms=useMemo(()=>uniforms(0),[]),rightUniforms=useMemo(()=>uniforms(1),[]);
 useEffect(()=>{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const tex=new CanvasTexture(canvas);tex.colorSpace=SRGBColorSpace;tex.minFilter=LinearFilter;tex.magFilter=LinearFilter;
  canvasRef.current=canvas;wordTexture.current=tex;
  if(wordMat.current){wordMat.current.map=tex;wordMat.current.needsUpdate=true;}
  return ()=>{
   if(wordMat.current){wordMat.current.map=null;wordMat.current.needsUpdate=true;}
   canvasRef.current=null;wordTexture.current=null;drawn.current='';tex.dispose();
  };
 },[]);
 useFrame(()=>{
  const cue=cueRef.current;
  if(left.current)left.current.visible=cue.active;
  if(right.current)right.current.visible=cue.active;
  const hasWord=cue.active&&cue.adlibOpacity>.005&&cue.adlibWord.length>0&&!!wordTexture.current;
  if(wordMesh.current){wordMesh.current.visible=hasWord;
   wordMesh.current.position.x=cue.adlibSlot!==null&&cue.adlibSlot%2===0?-4.42:4.42;
  }
  if(!cue.active)return;
  primary.set(cue.primary);secondary.set(cue.secondary);
  for(const mat of [leftMat.current,rightMat.current]){
   if(!mat)continue;
   mat.uniforms.uPrimary.value.copy(primary);mat.uniforms.uSecondary.value.copy(secondary);
   mat.uniforms.uLead.value=cue.leadOpacity;mat.uniforms.uAdlib.value=cue.adlibOpacity;
   mat.uniforms.uLeadSide.value=cue.leadSlot%2===0?0:1;
   mat.uniforms.uAdlibSide.value=cue.adlibSlot!==null&&cue.adlibSlot%2===0?0:1;
   mat.uniforms.uFeature.value=cue.role==='feature'?1:0;
   mat.uniforms.uPhase.value=cue.phase;
  }
  if(wordMat.current){wordMat.current.opacity=hasWord?Math.min(.35,cue.adlibOpacity*1.4):0;
   wordMat.current.color.copy(secondary);
  }
  if(hasWord&&drawn.current!==cue.adlibWord&&canvasRef.current){
   const canvas=canvasRef.current,ctx=canvas.getContext('2d');
   if(ctx){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='#ffffff';ctx.shadowBlur=7;ctx.shadowColor='#ffffff';
    let font=82;ctx.font=`bold ${font}px system-ui, sans-serif`;
    while(font>28&&ctx.measureText(cue.adlibWord).width>canvas.width*.85){font-=5;ctx.font=`bold ${font}px system-ui, sans-serif`;}
    ctx.fillText(cue.adlibWord,canvas.width/2,canvas.height/2);
    if(wordTexture.current)wordTexture.current.needsUpdate=true;
    drawn.current=cue.adlibWord;
   }
  }
 });
 return <group name="v820-vocal-adlib-fx" frustumCulled={false}>
  <mesh ref={left} visible={false} position={[-4.45,.20,-3.42]} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <planeGeometry args={[2.6,5.4]}/>
   <shaderMaterial ref={leftMat} uniforms={leftUniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT}
    transparent depthWrite={false} depthTest side={DoubleSide} toneMapped={false}/>
  </mesh>
  <mesh ref={right} visible={false} position={[4.45,.20,-3.42]} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <planeGeometry args={[2.6,5.4]}/>
   <shaderMaterial ref={rightMat} uniforms={rightUniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT}
    transparent depthWrite={false} depthTest side={DoubleSide} toneMapped={false}/>
  </mesh>
  <mesh ref={wordMesh} visible={false} position={[-4.42,1.15,-3.39]} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <planeGeometry args={[2.35,.60]}/>
   <meshBasicMaterial ref={wordMat} transparent depthWrite={false} depthTest opacity={0} side={DoubleSide} toneMapped={false}/>
  </mesh>
 </group>;
}
