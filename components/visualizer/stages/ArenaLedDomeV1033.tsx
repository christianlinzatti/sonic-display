"use client";
import {useFrame} from "@react-three/fiber";
import {useLayoutEffect,useMemo,useRef} from "react";
import {Color,Object3D,type InstancedMesh} from "three";
import type {AudioFeatures} from "@/types/audio";
import {useAdaptivePerformance} from "../adaptivePerformance";
import {createArenaDomePixelsV1033,sampleArenaDomePixelV1033} from "@/lib/arena360ImmersionV1033";

/** Stationary floating LED cupola above the 360° deck. Pixels use ONE instanced draw
 * call and update at 8–15 Hz. No reflections, video textures, network or shadows.
 */
export function ArenaLedDomeV1033({audio,playing,reducedMotion,enabled=true,reactive=true}:{
  audio:AudioFeatures;playing:boolean;reducedMotion:boolean;enabled?:boolean;reactive?:boolean;
}){
  const tier=useAdaptivePerformance().tier;
  const pixels=useMemo(()=>createArenaDomePixelsV1033(tier),[tier]);
  const mesh=useRef<InstancedMesh>(null);
  const dummy=useMemo(()=>new Object3D(),[]);
  const tint=useMemo(()=>new Color(),[]);
  const base=useMemo(()=>[new Color('#43dfff'),new Color('#af68ff'),new Color('#ff6ebf'),new Color('#7cf0dd')],[]);
  const timer=useRef(0),elapsed=useRef(0),isAnimated=useRef(false);
  useLayoutEffect(()=>{
    if(!mesh.current)return;
    for(let i=0;i<pixels.length;i++){
      const pixel=pixels[i];
      dummy.position.set(pixel.x,pixel.y,pixel.z);
      dummy.rotation.set(0,-pixel.angle,0);
      dummy.scale.set(1,1,1);
      dummy.updateMatrix();mesh.current.setMatrixAt(i,dummy.matrix);
      mesh.current.setColorAt(i,tint.copy(base[pixel.ring]).multiplyScalar(.48));
    }
    mesh.current.instanceMatrix.needsUpdate=true;
    if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
    mesh.current.computeBoundingSphere();
  },[pixels,dummy,tint,base]);
  useFrame((_,delta)=>{
    if(!enabled||!mesh.current)return;
    const animate=playing&&!reducedMotion&&reactive;
    if(!animate&&!isAnimated.current)return;
    const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
    if(animate)elapsed.current+=dt;
    timer.current+=dt;
    if(animate&&timer.current<(tier==='low' ? .125 : .065))return;
    timer.current=0;isAnimated.current=animate;
    const bass=animate?audio.bass??0:0;
    const beat=animate&&audio.beat?audio.beatStrength??0:0;
    for(let i=0;i<pixels.length;i++){
      const pixel=pixels[i];
      const light=animate?sampleArenaDomePixelV1033(pixel,elapsed.current,bass,beat):.38;
      mesh.current.setColorAt(i,tint.copy(base[pixel.ring]).multiplyScalar(light));
    }
    if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
  });
  if(!enabled)return null;
  return <group name="v1033-floating-led-cupola">
    {/* Open rings preserve the central aerial camera sightline and let lyrics stay legible. */}
    {[[3.62,3.23],[2.88,3.65],[2.12,3.99],[1.26,4.23]].map(([radius,height],i)=>
      (tier==='low'&&i>1)?null:<mesh key={i} position={[0,height,0]} rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[radius,.028,5,64]}/>
        <meshStandardMaterial color={i%2===0?'#3d6883':'#665395'} metalness={.7} roughness={.42}/>
      </mesh>)}
    <instancedMesh name="v1033-cupola-led-pixels" ref={mesh} args={[undefined,undefined,pixels.length]} frustumCulled={false}>
      <boxGeometry args={[.16,.07,.10]}/>
      <meshBasicMaterial color="#ffffff" toneMapped={false}/>
    </instancedMesh>
  </group>;
}
