'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {AfterimagePass} from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {getActivePerformanceTier,useAdaptivePerformance} from './adaptivePerformance';
import {advanceDanceFxEnvelopeV468,initialDanceFxEnvelopeV468} from './danceVisualEngineV468';
import type {AudioFeatures} from '@/types/audio';

/** One compositor owns the final render (priority 2). No full-screen flashes/strobes.
 * The optional afterimage is a bounded temporal echo, NOT motion-vector blur. */
export function DancePostProcessingV468({audio,playing,reducedMotion,enabled,strength,drop}:{audio:AudioFeatures;playing:boolean;reducedMotion:boolean;enabled:boolean;strength:number;drop?:boolean}) {
 const {gl,scene,camera,size}=useThree();
 const qualityTier=useAdaptivePerformance().tier;
 const envelope=useRef(initialDanceFxEnvelopeV468());
 const passes=useMemo(()=>({
  composer:null as EffectComposer|null,
  shader:null as ShaderPass|null,
  echo:null as AfterimagePass|null,
  dpr:0,
  texel:[1/1024,1/768],
 }),[gl,scene,camera]);
 useEffect(()=>{
   if(!enabled||reducedMotion||qualityTier==='low')return;
   const composer=new EffectComposer(gl);
   composer.addPass(new RenderPass(scene,camera));
   const shader=new ShaderPass({uniforms:{tDiffuse:{value:null},uTexel:{value:[1/1024,1/768]},uPulse:{value:0},uGlitch:{value:0},uTime:{value:0},uAnticipation:{value:0},uBloom:{value:0}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 uTexel;uniform float uPulse,uGlitch,uTime,uAnticipation,uBloom;varying vec2 vUv;
      void main(){float distortion=(sin(vUv.y*135.0+uTime*58.0)*uGlitch*.012 + sin(vUv.y*17.0+uTime*5.0)*uAnticipation*.009);
       vec2 uv=clamp(vUv+vec2(distortion,0.),vec2(0.),vec2(1.));
       float shift=uGlitch*.011+uPulse*.003;
       vec3 rgb=vec3(texture2D(tDiffuse,clamp(uv+vec2(shift,0.),0.,1.)).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,clamp(uv-vec2(shift,0.),0.,1.)).b);
       vec2 s=uTexel*2.5;
       vec3 glow=(texture2D(tDiffuse,clamp(uv+vec2(s.x,0.),0.,1.)).rgb+texture2D(tDiffuse,clamp(uv-vec2(s.x,0.),0.,1.)).rgb+texture2D(tDiffuse,clamp(uv+vec2(0.,s.y),0.,1.)).rgb+texture2D(tDiffuse,clamp(uv-vec2(0.,s.y),0.,1.)).rgb)*.25;
       rgb+=max(glow-vec3(.53),vec3(0.))*uBloom*.24;
       rgb*=1.+min(.075,uPulse*.11);
       gl_FragColor=vec4(rgb,1.);}`});
   composer.addPass(shader);
   const echo=new AfterimagePass(.65);
   echo.enabled=false;
   composer.addPass(echo);
   composer.addPass(new OutputPass());
   passes.composer=composer;passes.shader=shader;passes.echo=echo;
   return ()=>{passes.composer=null;passes.shader=null;passes.echo=null;composer.dispose();};
 },[gl,scene,camera,enabled,reducedMotion,qualityTier,passes]);
 useEffect(()=>{passes.composer?.setSize(size.width,size.height);},[size.width,size.height,passes]);
 useFrame((_,dt)=>{
   const tier=getActivePerformanceTier();
   const running=enabled&&playing&&!reducedMotion&&tier!=='low'&&strength>0;
   envelope.current=advanceDanceFxEnvelopeV468(envelope.current,audio,dt,{playing:running,reducedMotion,strength,tier,drop});
   const composer=passes.composer;
   // The low tier and reduced-motion mode bypass the extra render targets entirely.
   if(!running||!composer||!passes.shader){gl.setRenderTarget(null);gl.render(scene,camera);return;}
   const dpr=gl.getPixelRatio();
   if(dpr!==passes.dpr){composer.setPixelRatio(dpr);passes.dpr=dpr;}
   const uniforms=passes.shader.uniforms;
   passes.texel[0]=1/Math.max(1,size.width*dpr);
   passes.texel[1]=1/Math.max(1,size.height*dpr);
   uniforms.uTexel.value=passes.texel;
   uniforms.uPulse.value=envelope.current.pulse;
   uniforms.uGlitch.value=envelope.current.glitch;
   uniforms.uAnticipation.value=envelope.current.anticipation;
   uniforms.uBloom.value=tier==='high'?.7:.34;
   uniforms.uTime.value=envelope.current.elapsed;
   if(passes.echo){passes.echo.enabled=tier==='high'&&envelope.current.blur>.06;
     // Short afterimage; never leave a persistent motion trail after the kick.
     passes.echo.uniforms.damp.value=.40+envelope.current.blur*.25;}
   composer.render(Math.min(.1,Math.max(0,dt)));
 },2);
 return null;
}
