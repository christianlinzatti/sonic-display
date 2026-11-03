'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import {createVirtualCrowdLayoutV815,CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';
import type {VirtualCrowdCueV815} from './virtualConcertCrowdPlannerV815';
import type {FestivalAtmosphereCueV875} from './smartFestivalAtmosphereV875';

/** Two instanced draw calls for non-flashing concert wristbands.
 * Side-lanes only, no shadows, extra Light objects, react state updates or
 * allocations in the animation loop. Matrix updates limited to 20 Hz.
 */
export function FestivalWristbandsV875({cueRef}:{cueRef:{current:VirtualCrowdCueV815}}){
 const people=useMemo(createVirtualCrowdLayoutV815,[]);
 const dummy=useMemo(()=>new Object3D(),[]);
 const primary=useMemo(()=>new Color('#68aaff'),[]);
 const secondary=useMemo(()=>new Color('#c47aff'),[]);
 const mixed=useMemo(()=>new Color(),[]);
 const left=useRef<InstancedMesh>(null),right=useRef<InstancedMesh>(null);
 const leftMat=useRef<MeshBasicMaterial>(null),rightMat=useRef<MeshBasicMaterial>(null);
 const tick=useRef(0),priorCount=useRef(-1);
 useFrame((_,dt)=>{
  const l=left.current,r=right.current;
  if(!l||!r)return;
  const cue=cueRef.current as VirtualCrowdCueV815&Partial<FestivalAtmosphereCueV875>;
  const glow=Number.isFinite(cue.wristbandGlow)?Math.max(0,Math.min(.42,cue.wristbandGlow??0)):0;
  const n=Number.isFinite(cue.wristbandCount)?Math.max(0,Math.min(CROWD_MAX_V815,Math.floor(cue.wristbandCount??0))):0;
  if(!cue.active||glow<=.002||n<2){l.visible=r.visible=false;priorCount.current=-1;tick.current=0;return;}
  tick.current+=Math.max(0,Math.min(.1,dt));
  if(priorCount.current===n&&tick.current<.05)return;
  tick.current=0;priorCount.current=n;
  l.count=r.count=n;
  const wave=Number.isFinite(cue.festivalWave)?Math.max(0,Math.min(.65,cue.festivalWave??0)):0;
  // All mood colors follow existing V810 stage palettes, not a separate effect engine.
  primary.set(/^#[0-9a-f]{6}$/i.test(cue.primary)?cue.primary:'#68aaff');
  secondary.set(/^#[0-9a-f]{6}$/i.test(cue.secondary)?cue.secondary:'#c47aff');
  for(let index=0;index<n;index++){
   const p=people[index];
   const travel=Math.sin(cue.phase*2.5-p.x*.72+p.phase*.18);
   const lift=wave*(.15+.16*travel);
   const pulse=.77+.23*Math.sin(cue.phase*2+p.phase);
   for(const side of [-1,1]){
    const mesh=side===-1?l:r;
    dummy.position.set(p.x+side*.37*p.scale,p.y+(.95+lift)*p.scale,p.z-.02);
    dummy.rotation.set(0,0,0);
    dummy.scale.set(.082*p.scale,.042*p.scale,.063*p.scale);
    dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);
    mixed.copy(index%2===0?primary:secondary).multiplyScalar(Math.max(.48,Math.min(1,pulse)));
    mesh.setColorAt(index,mixed);
   }
  }
  for(const mesh of [l,r]){
   mesh.instanceMatrix.needsUpdate=true;
   if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
   mesh.visible=true;
  }
  if(leftMat.current)leftMat.current.opacity=glow;
  if(rightMat.current)rightMat.current.opacity=glow;
 });
 return <>
  <instancedMesh name="v875-left-wristbands" ref={left} args={[undefined,undefined,CROWD_MAX_V815]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <sphereGeometry args={[1,5,4]}/>
   <meshBasicMaterial ref={leftMat} color="#ffffff" transparent opacity={0} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
  <instancedMesh name="v875-right-wristbands" ref={right} args={[undefined,undefined,CROWD_MAX_V815]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <sphereGeometry args={[1,5,4]}/>
   <meshBasicMaterial ref={rightMat} color="#ffffff" transparent opacity={0} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
 </>;
}
