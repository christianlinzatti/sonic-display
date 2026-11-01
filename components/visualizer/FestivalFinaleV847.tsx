"use client";
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import type {FestivalFinaleCueV847} from './festivalFinalePlannerV847';
/** One metallic paper shower and one virtual spark-wheel pair. Mutually exclusive by planner.
 * Bounded GPU-instancing, no extra light sources or shadows; 20 position uploads/s max.
 */
export function FestivalFinaleV847({cueRef}:{cueRef:{current:FestivalFinaleCueV847}}){
 const rain=useRef<InstancedMesh>(null),wheel=useRef<InstancedMesh>(null);
 const rainMat=useRef<MeshBasicMaterial>(null),wheelMat=useRef<MeshBasicMaterial>(null);
 const dummy=useMemo(()=>new Object3D(),[]),foilColor=useMemo(()=>new Color(),[]);
 const cadence=useRef(.1);
 useFrame((_,dt)=>{
  const cue=cueRef.current,r=rain.current,w=wheel.current;
  if(!r||!w)return;
  r.count=cue.active?Math.min(80,Math.max(0,cue.rainCount)):0;
  w.count=cue.active?Math.min(32,Math.max(0,cue.wheelCount)):0;
  r.visible=r.count>0;w.visible=w.count>0;
  if(rainMat.current)rainMat.current.opacity=r.visible?Math.min(.38,cue.rainOpacity):0;
  if(wheelMat.current)wheelMat.current.opacity=w.visible?Math.min(.34,cue.wheelOpacity):0;
  if(!r.visible&&!w.visible){cadence.current=.1;return;}
  cadence.current+=Math.max(0,Math.min(.1,dt));
  if(cadence.current<.05)return;
  cadence.current=0;
  for(let k=0;k<r.count;k++){
   const seed=(k*.618033988749895)%1,side=k%2===0?-1:1;
   const fall=((cue.phase*cue.fallSpeed*.20+seed)%1+1)%1;
   const ripple=Math.sin(cue.phase*.9+k*1.732)*.19;
   dummy.position.set(side*(1.78+seed*1.85)+ripple,3.4-fall*4.8,-2.7-.3*seed);
   dummy.rotation.set(cue.phase*(.5+seed*.7),seed*4.5,Math.sin(cue.phase*.9+k*.71));
   dummy.scale.set(.075+(k%3)*.022,.12+(k%4)*.023,.01);
   dummy.updateMatrix();r.setMatrixAt(k,dummy.matrix);
   // Foil is an optical illusion: alternating warm/cool reflections, no physical metal shader.
   const glint=.56+.40*Math.abs(Math.sin(cue.phase*1.5+k*2.43));
   const silver=cue.palette==='silver'||(cue.palette==='mixed'&&k%3===0);
   foilColor.setRGB(silver?glint:glint, silver?glint:glint*.72,
     silver?Math.min(1,glint*1.06):glint*.26);
   r.setColorAt(k,foilColor);
  }
  if(r.visible){r.instanceMatrix.needsUpdate=true;if(r.instanceColor)r.instanceColor.needsUpdate=true;}
  for(let k=0;k<w.count;k++){
   const side=k%2===0?-1:1,index=Math.floor(k/2);
   const angle=2*Math.PI*(index/16)+cue.phase*cue.wheelSpeed*1.6*side;
   const radial=.60+.14*Math.sin(cue.phase*1.4+index*.82);
   dummy.position.set(side*3.22+Math.cos(angle)*radial,.30+Math.sin(angle)*radial,-2.25);
   dummy.rotation.set(0,0,angle+Math.PI*.5);
   dummy.scale.set(.026,.16+(index%3)*.035,.012);
   dummy.updateMatrix();w.setMatrixAt(k,dummy.matrix);
  }
  if(w.visible)w.instanceMatrix.needsUpdate=true;
 });
 return <group name="v847-festival-finale" frustumCulled={false}>
   <instancedMesh name="v847-metallic-confetti-rain" ref={rain}
     args={[undefined,undefined,80]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
     <planeGeometry args={[1,1]}/>
     <meshBasicMaterial ref={rainMat} transparent opacity={0} color="#ffffff" side={2}
       depthWrite={false} depthTest toneMapped={false}/>
   </instancedMesh>
   <instancedMesh name="v847-virtual-spark-wheels" ref={wheel}
     args={[undefined,undefined,32]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
     <planeGeometry args={[1,1]}/>
     <meshBasicMaterial ref={wheelMat} transparent opacity={0} color="#ffd98d" side={2}
       depthWrite={false} depthTest toneMapped={false}/>
   </instancedMesh>
 </group>;
}
