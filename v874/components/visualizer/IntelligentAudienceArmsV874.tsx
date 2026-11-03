'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Object3D} from 'three';
import type {InstancedMesh} from 'three';
import {createVirtualCrowdLayoutV815,CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';
import type {AudienceCueV874} from './intelligentAudienceExperienceV874';
import type {VirtualCrowdCueV815} from './virtualConcertCrowdPlannerV815';

/** Two extra instanced meshes; no bones, lighting, shadows or per-frame allocation.
 * Arms are strictly in the side-wing lanes of V815, never over the performers.
 */
export function IntelligentAudienceArmsV874({cueRef}:{cueRef:{current:VirtualCrowdCueV815}}){
 const people=useMemo(createVirtualCrowdLayoutV815,[]);
 const object=useMemo(()=>new Object3D(),[]);
 const left=useRef<InstancedMesh>(null),right=useRef<InstancedMesh>(null);
 const accumulator=useRef(0);
 useFrame((_,dt)=>{
  const l=left.current,r=right.current;
  if(!l||!r)return;
  const cue=cueRef.current as Partial<AudienceCueV874> & VirtualCrowdCueV815;
  const lift=Number.isFinite(cue.armLift)?Math.max(0,Math.min(.88,cue.armLift??0)):0;
  const active=cue.active&&cue.count>1&&lift>.003;
  l.visible=r.visible=active;
  if(!active){accumulator.current=0;return;}
  const n=Math.min(CROWD_MAX_V815,Math.max(0,Math.floor(cue.count)));
  l.count=r.count=n;
  accumulator.current+=Math.min(.1,Math.max(0,dt));
  if(accumulator.current<.05)return; // cap matrix upload frequency at 20 Hz
  accumulator.current=0;
  for(let index=0;index<n;index++){
   const p=people[index];
   const position=p.phase+cue.phase*(cue.style==='rave'?7:cue.style==='clap'?5:3);
   const rhythm=Math.sin(position);
   const wave=Math.max(0,Math.min(1,.51+rhythm*.49));
   for(let side=-1;side<=1;side+=2){
    const mesh=side<0?l:r;
    const alternate=side===-1?wave:Math.max(0,Math.min(1,.51+Math.sin(position+1.2)*.49));
    object.position.set(p.x+side*.36*p.scale,p.y+.65*p.scale,p.z-.018);
    object.rotation.set(0,0,-side*(.12+lift*(.27+alternate*1.07)));
    object.scale.set(p.scale,p.scale,p.scale);
    object.updateMatrix();mesh.setMatrixAt(index,object.matrix);
   }
  }
  l.instanceMatrix.needsUpdate=r.instanceMatrix.needsUpdate=true;
 });
 return <group name="v874-intelligent-audience-arms" frustumCulled={false}>
  <instancedMesh ref={left} args={[undefined,undefined,CROWD_MAX_V815]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <cylinderGeometry args={[.058,.076,.52,5,1]}/>
   <meshBasicMaterial color="#182035" transparent opacity={.8} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={right} args={[undefined,undefined,CROWD_MAX_V815]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <cylinderGeometry args={[.058,.076,.52,5,1]}/>
   <meshBasicMaterial color="#182035" transparent opacity={.8} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
 </group>;
}
