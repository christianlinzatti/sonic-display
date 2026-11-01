'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import {createParticleLayoutV816,PARTICLE_CAPS_V816} from './reactiveParticlePlannerV816';
import type {ReactiveParticleCueV816} from './reactiveParticlePlannerV816';

/** Four low-cost GPU-instanced effects, all behind/alongside the performers.
 * No transient geometry/material allocation, lighting, physics or random calls per frame.
 * Stage parent supplies music cues, not this component's own beat detection.
 */
export function ReactiveParticleStudioV816({cueRef}:{cueRef:{current:ReactiveParticleCueV816}}){
 const spark=useRef<InstancedMesh>(null),shard=useRef<InstancedMesh>(null);
 const confetti=useRef<InstancedMesh>(null),ring=useRef<InstancedMesh>(null);
 const sparkMat=useRef<MeshBasicMaterial>(null),shardMat=useRef<MeshBasicMaterial>(null);
 const confettiMat=useRef<MeshBasicMaterial>(null),ringMat=useRef<MeshBasicMaterial>(null);
 const origin=useMemo(()=>new Object3D(),[]);
 const first=useMemo(()=>new Color(),[]),second=useMemo(()=>new Color(),[]);
 const caps=useMemo(()=>[PARTICLE_CAPS_V816.sparks,PARTICLE_CAPS_V816.shards,PARTICLE_CAPS_V816.confetti,PARTICLE_CAPS_V816.rings],[]);
 const meshes=useMemo(()=>[spark,shard,confetti,ring],[]);
 const layouts=useMemo(()=>({sparks:createParticleLayoutV816(PARTICLE_CAPS_V816.sparks),
  shards:createParticleLayoutV816(PARTICLE_CAPS_V816.shards),
  confetti:createParticleLayoutV816(PARTICLE_CAPS_V816.confetti),
  rings:createParticleLayoutV816(PARTICLE_CAPS_V816.rings)}),[]);
 const cadence=useRef(1);
 useFrame((_,dt)=>{
  const c=cueRef.current;
  if(!spark.current||!shard.current||!confetti.current||!ring.current)return;
  for(let k=0;k<4;k++){
   const m=meshes[k].current!;
   const count=k===0?c.sparks:k===1?c.shards:k===2?c.confetti:c.rings;
   m.count=Math.max(0,Math.min(caps[k],count));
   m.visible=c.active&&m.count>0;
  }
  if(!c.active){cadence.current=1;return;}
  first.set(c.primary);second.set(c.secondary);
  if(sparkMat.current){sparkMat.current.opacity=c.sparkOpacity;sparkMat.current.color.copy(first);}
  if(shardMat.current){shardMat.current.opacity=c.shardOpacity;shardMat.current.color.copy(second);}
  if(confettiMat.current){confettiMat.current.opacity=c.confettiOpacity;confettiMat.current.color.copy(first).lerp(second,.5);}
  if(ringMat.current){ringMat.current.opacity=c.ringOpacity;ringMat.current.color.copy(second);}
  cadence.current+=Math.max(0,Math.min(.1,dt));
  if(cadence.current<.05)return; // 20 uploads/second max
  cadence.current=0;
  const types=['sparks','shards','confetti','rings'] as const;
  for(let k=0;k<4;k++){
   const mesh=meshes[k].current!;
   const points=layouts[types[k]];
   for(let j=0;j<mesh.count;j++){
    const p=points[j];
    const progress=((c.phase*(k===3?.8:k===2?.4:1.1)+p.offset)%2+2)%2/2;
    const wave=Math.sin(c.phase*(2.3+p.tilt*.2)+p.offset*6.283);
    if(k===0){ // rising narrow sparks on both lateral stage towers
     origin.position.set(p.x+p.tilt*.26*progress,-1.25+progress*4.6,p.z);
     origin.scale.set(.025*p.size,.14*p.size*(.6+c.beat),.025);
     origin.rotation.set(0,0,p.tilt*.22);
    }else if(k===1){ // digital fragments rotate behind the cast
     origin.position.set(p.x+.34*wave,.4+p.y*2.6+.35*wave,p.z-.20);
     origin.scale.set(.09*p.size,.12*p.size,.012);
     origin.rotation.set(0,c.phase*.75+p.tilt,p.tilt+c.phase*.55);
    }else if(k===2){ // falling confetti along the stage wings
     origin.position.set(p.x+.2*wave,3.55-progress*4.7,p.z+.2);
     origin.scale.set(.08*p.size,.10*p.size,.018);
     origin.rotation.set(c.phase*1.7+p.tilt,c.phase*1.3,p.tilt);
    }else{ // expanding rings never cross the central singer plane
     origin.position.set(p.x,.4+p.y*1.2,p.z-.4);
     const size=.20+progress*.92;
     origin.scale.set(size,size,.18);
     origin.rotation.set(0,0,0);
    }
    origin.updateMatrix();mesh.setMatrixAt(j,origin.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
 });
 return <group name="v816-reactive-particle-studio" frustumCulled={false}>
  <instancedMesh ref={spark} args={[undefined,undefined,PARTICLE_CAPS_V816.sparks]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
   <boxGeometry args={[1,1,1]}/><meshBasicMaterial ref={sparkMat} transparent opacity={0} color="#49eaff" depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={shard} args={[undefined,undefined,PARTICLE_CAPS_V816.shards]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
   <planeGeometry args={[1,1]}/><meshBasicMaterial ref={shardMat} transparent opacity={0} color="#cc40ff" side={2} depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={confetti} args={[undefined,undefined,PARTICLE_CAPS_V816.confetti]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
   <planeGeometry args={[1,1]}/><meshBasicMaterial ref={confettiMat} transparent opacity={0} color="#fbc5fd" side={2} depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={ring} args={[undefined,undefined,PARTICLE_CAPS_V816.rings]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
   <torusGeometry args={[.75,.035,3,24]}/><meshBasicMaterial ref={ringMat} transparent opacity={0} color="#7e44ff" depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
 </group>;
}
