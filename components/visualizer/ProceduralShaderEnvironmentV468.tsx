'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,DoubleSide,ShaderMaterial} from 'three';
import {getActivePerformanceTier} from './adaptivePerformance';
import type {AudioFeatures} from '@/types/audio';
export type ShaderEnvironmentModeV468='off'|'auto'|'tunnel'|'galaxy'|'waves';
export function resolveShaderEnvironmentV468(choice:ShaderEnvironmentModeV468,theme:string):Exclude<ShaderEnvironmentModeV468,'auto'> {
 if(choice!=='auto')return choice;
 if(theme==='cyberpunk'||theme==='festival'||theme==='neon')return 'tunnel';
 if(theme==='galaxy')return 'galaxy';
 if(theme==='vaporwave')return 'waves';
 return 'off';
}
/** Single background plane + one shader, no environment GLBs/textures/network calls. */
export function ProceduralShaderEnvironmentV468({mode,theme,audio,playing,reducedMotion,color}:{mode:ShaderEnvironmentModeV468;theme:string;audio:AudioFeatures;playing:boolean;reducedMotion:boolean;color?:string}){
 const material=useRef<ShaderMaterial>(null);
 const uniforms=useMemo(()=>({uTime:{value:0},uBass:{value:0},uMids:{value:0},uHighs:{value:0},uMode:{value:0},uColor:{value:new Color('#578afc')}}),[]);
 const resolved=resolveShaderEnvironmentV468(mode,theme);
 useFrame((_,delta)=>{
  const tier=getActivePerformanceTier();
  if(material.current)material.current.visible=resolved!=='off'&&tier!=='low';
  if(resolved==='off'||tier==='low')return;
  const dt=Math.max(0,Math.min(.08,delta));
  const lerp=1-Math.exp(-dt*5);
  const bass=playing&&!reducedMotion?Math.max(0,Math.min(1,audio.bass)):0;
  const mids=playing&&!reducedMotion?Math.max(0,Math.min(1,audio.mids)):0;
  const highs=playing&&!reducedMotion?Math.max(0,Math.min(1,audio.highs)):0;
  uniforms.uBass.value+=(bass-uniforms.uBass.value)*lerp;
  uniforms.uMids.value+=(mids-uniforms.uMids.value)*lerp;
  uniforms.uHighs.value+=(highs-uniforms.uHighs.value)*lerp;
  uniforms.uMode.value=resolved==='tunnel'?0:resolved==='galaxy'?1:2;
  if(playing&&!reducedMotion)uniforms.uTime.value+=dt*(tier==='high'?1:.55);
  uniforms.uColor.value.set(color??'#578afc');
 });
 return <mesh name="SonicShaderBackdropV468" position={[0,0,-10]} renderOrder={-20} frustumCulled={false}>
   <planeGeometry args={[36,25]}/>
   <shaderMaterial ref={material} visible={resolved!=='off'} uniforms={uniforms} side={DoubleSide} depthWrite={false} transparent opacity={1}
   vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
   fragmentShader={`varying vec2 vUv;uniform float uTime,uBass,uMids,uHighs,uMode;uniform vec3 uColor;
     float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
     void main(){vec2 p=(vUv-.5)*vec2(1.78,1.);float r=length(p)+.0001;float a=atan(p.y,p.x);float t=uTime;
       float tunnel=pow(max(0.,sin(15.*log(r+.12)-t*2.1+sin(a*7.)*.6)),9.);
       tunnel+=.35*pow(max(0.,sin(a*12.+sin(r*8.-t)*1.4)),12.);
       float gal=0.;vec2 cell=floor(p*43.+vec2(t*.04,t*.08));float star=hash21(cell);
       gal+=step(.986,star)*pow(max(0.,1.-length(fract(p*43.+vec2(t*.04,t*.08))-.5)*2.),6.);
       gal+=.18*pow(max(0.,sin(p.x*7.+t*.28)*sin(p.y*6.-t*.17)),5.);
       float waves=pow(max(0.,sin(p.y*32.+sin(p.x*9.+t)*4.-t*2.1)),8.);
       float pattern=uMode<.5?tunnel:uMode<1.5?gal:waves;
       float strength=clamp(.16+uBass*.17+uMids*.08+uHighs*.06,0.,.38);
       vec3 base=vec3(.011,.011,.030);
       vec3 rgb=base+uColor*pattern*strength*(.7+.3*cos(a*2.+t*.3));
       gl_FragColor=vec4(rgb,1.);}`}/>
 </mesh>;
}
