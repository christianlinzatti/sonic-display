'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import {createFoamLayoutV817,FOAM_CAPS_V817} from './foamCannonPlannerV817';
import type {FoamCannonCueV817} from './foamCannonPlannerV817';
import {sampleFoamParticleV843} from './foamExperiencePlannerV843';
import type {FoamParticlePoseV843} from './foamExperiencePlannerV843';

/** Two stage-wing foam jets. GPU-instanced, no physics/lights/shadows or frame allocations.
 * The center aisle |x| < 3.25 is reserved for singers and 3D lyrics.
 */
export function FoamCannonV817({cueRef}:{cueRef:{current:FoamCannonCueV817}}){
 const bubbles=useRef<InstancedMesh>(null),mist=useRef<InstancedMesh>(null);
 const bubblesMat=useRef<MeshBasicMaterial>(null),mistMat=useRef<MeshBasicMaterial>(null);
 const leftCannon=useRef<import('three').Group>(null),rightCannon=useRef<import('three').Group>(null);
 const shape=useMemo(()=>new Object3D(),[]);
 const tint=useMemo(()=>new Color(),[]);
 const pose=useMemo<FoamParticlePoseV843>(()=>({x:0,y:0,z:0,scale:0}),[]);
 const big=useMemo(()=>createFoamLayoutV817(FOAM_CAPS_V817.bubbles),[]);
 const fine=useMemo(()=>createFoamLayoutV817(FOAM_CAPS_V817.mist),[]);
 const streams=useMemo(()=>[{ref:bubbles,layout:big,tiny:false},{ref:mist,layout:fine,tiny:true}],[big,fine]);
 const elapsed=useRef(1);
 useFrame((_,delta)=>{
  const cue=cueRef.current;
  if(!bubbles.current||!mist.current)return;
  const active=cue.active&&Number.isFinite(cue.phase)&&Number.isFinite(cue.power);
  const visibleLeft=active&&cue.side!=='right',visibleRight=active&&cue.side!=='left';
  if(leftCannon.current)leftCannon.current.visible=visibleLeft;
  if(rightCannon.current)rightCannon.current.visible=visibleRight;
  bubbles.current.count=active?Math.min(FOAM_CAPS_V817.bubbles,Math.max(0,cue.bubbles)):0;
  mist.current.count=active?Math.min(FOAM_CAPS_V817.mist,Math.max(0,cue.mist)):0;
  bubbles.current.visible=active&&bubbles.current.count>0;
  mist.current.visible=active&&mist.current.count>0;
  if(!active){elapsed.current=1;return;}
  tint.set(cue.color);
  if(bubblesMat.current){bubblesMat.current.color.copy(tint);bubblesMat.current.opacity=cue.opacity;}
  if(mistMat.current){mistMat.current.color.copy(tint);mistMat.current.opacity=cue.opacity*.45;}
  elapsed.current+=Math.max(0,Math.min(.1,delta));
  if(elapsed.current<.05)return;
  elapsed.current=0;
  for(const stream of streams){
   const mesh=stream.ref.current!;
   const {layout,tiny}=stream;
   for(let i=0;i<mesh.count;i++){
    const p=layout[i];
    // The unused side's instances have zero scale (no unwanted side spray).
    const usable=cue.side==='both'||(cue.side==='left'&&p.side<0)||(cue.side==='right'&&p.side>0);
    if(cue.experienceV843?.active){
      sampleFoamParticleV843(p,cue.phase,tiny,cue.experienceV843,pose);
      shape.position.set(pose.x,pose.y,pose.z);
      shape.scale.setScalar(usable?pose.scale:0);
    }else{
      // Opt-out path exactly preserves the V817 trajectory.
      const life=((cue.phase*(tiny?.85:.62)+p.phase)%1+1)%1;
      const outward=3.65+life*1.85+Math.abs(p.skew)*.26;
      const height=-.12+life*4.0-life*life*2.85+p.rise*.35;
      const reach=2.5+life*2.8+p.skew*.30;
      shape.position.set(p.side*outward,height,reach);
      const size=(tiny?.034:.083)*p.size*(.7+life*.55)*(usable?1:0);
      shape.scale.setScalar(size);
    }
    shape.rotation.set(0,0,0);
    shape.updateMatrix();mesh.setMatrixAt(i,shape.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
 });
 return <group name="v817-virtual-foam-cannons" frustumCulled={false}>
  {([-1,1] as const).map(side=><group key={side} ref={side<0?leftCannon:rightCannon}
    position={[side*3.8,-.25,2.45]} visible={false}>
    {/* Tubes tilt outward from the open middle; white nozzle ring = visible foam cannon. */}
    <mesh rotation={[.55,0,side*-.47]} castShadow={false} receiveShadow={false}>
     <cylinderGeometry args={[.14,.22,.78,9]}/><meshStandardMaterial color="#465362" metalness={.55} roughness={.5}/>
    </mesh>
    <mesh position={[side*.17,.33,.29]} rotation={[.55,0,side*-.47]}>
     <torusGeometry args={[.16,.034,6,12]}/><meshBasicMaterial color="#d9f5ff" toneMapped={false}/>
    </mesh>
  </group>)}
  <instancedMesh ref={bubbles} args={[undefined,undefined,FOAM_CAPS_V817.bubbles]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <sphereGeometry args={[1,6,4]}/><meshBasicMaterial ref={bubblesMat} color="#f1fcff" transparent opacity={0} depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={mist} args={[undefined,undefined,FOAM_CAPS_V817.mist]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <sphereGeometry args={[1,5,3]}/><meshBasicMaterial ref={mistMat} color="#f1fcff" transparent opacity={0} depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
 </group>;
}
