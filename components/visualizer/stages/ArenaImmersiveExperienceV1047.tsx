'use client';
import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh} from 'three';
import {sampleAudienceHologramV1047,sampleLightTunnelV1047,
 type ArenaImmersiveCueV1047} from '@/lib/arena360ImmersiveArenaV1047';

/** Two bounded instance batches; no point lights, shadows, camera ownership or hardware calls.
 * Both effects inherit the individual V1039 effect toggles. Pause/reduced motion hide them.
 */
export function ArenaImmersiveExperienceV1047({cue,hologramsEnabled,lasersEnabled}:{
 cue:ArenaImmersiveCueV1047;hologramsEnabled:boolean;lasersEnabled:boolean}){
 const holograms=useRef<InstancedMesh>(null),arches=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]),shade=useMemo(()=>new Color(),[]);
 const colors=useMemo(()=>[new Color(),new Color()],[]);
 const budget=useRef(.2),wasVisible=useRef(true);
 const canHolo=cue.active&&hologramsEnabled&&cue.hologramCount>0;
 const canLaser=cue.active&&lasersEnabled&&cue.tunnelCount>0;
 useFrame((_,dt)=>{
  const a=holograms.current,b=arches.current;if(!a||!b)return;
  const showing=canHolo||canLaser;
  a.visible=canHolo;b.visible=canLaser;
  if(!showing){wasVisible.current=false;return;}
  budget.current+=Number.isFinite(dt)?Math.max(0,Math.min(dt,.1)):0;
  if(wasVisible.current&&budget.current<.07)return;
  budget.current=0;wasVisible.current=true;
  colors[0].set(cue.primary);colors[1].set(cue.secondary);
  if(canHolo){
   a.count=cue.hologramCount;
   for(let i=0;i<a.count;i++){
    const f=sampleAudienceHologramV1047(i,a.count,cue);
    dummy.position.set(f.x,f.y,f.z);dummy.rotation.set(f.tilt,f.angle,0);
    dummy.scale.setScalar(f.size);dummy.updateMatrix();a.setMatrixAt(i,dummy.matrix);
    a.setColorAt(i,shade.copy(colors[i%2]).multiplyScalar(.2+f.glow));
   }
   a.instanceMatrix.needsUpdate=true;if(a.instanceColor)a.instanceColor.needsUpdate=true;
  }
  if(canLaser){
   b.count=cue.tunnelCount;
   for(let i=0;i<b.count;i++){
    const f=sampleLightTunnelV1047(i,b.count,cue);
    dummy.position.set(f.x,f.y,f.z);dummy.rotation.set(0,f.yaw,0);
    dummy.scale.setScalar(f.size);dummy.updateMatrix();b.setMatrixAt(i,dummy.matrix);
    b.setColorAt(i,shade.copy(colors[(i+1)%2]).multiplyScalar(.2+f.glow));
   }
   b.instanceMatrix.needsUpdate=true;if(b.instanceColor)b.instanceColor.needsUpdate=true;
  }
 });
 if(!canHolo&&!canLaser)return null;
 return <group name="v1047-audience-hologram-and-light-tunnel">
  <instancedMesh ref={holograms} args={[undefined,undefined,24]} frustumCulled={false} visible={canHolo}>
   <torusGeometry args={[.53,.017,5,36]}/>
   <meshBasicMaterial color="#ffffff" transparent opacity={.65} toneMapped={false} depthWrite={false}/>
  </instancedMesh>
  <instancedMesh ref={arches} args={[undefined,undefined,12]} frustumCulled={false} visible={canLaser}>
   <torusGeometry args={[.88,.025,6,42]}/>
   <meshBasicMaterial color="#ffffff" transparent opacity={.38} toneMapped={false} depthWrite={false}/>
  </instancedMesh>
 </group>;
}
