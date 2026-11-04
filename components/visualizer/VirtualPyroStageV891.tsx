'use client';
/** Fixed 3-draw-call virtual pyro rig: no lights, shadows, physics, textures,
 * external timers or GPU allocations inside useFrame. Culled when inactive. */
import {useEffect,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,DoubleSide,DynamicDrawUsage,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import type {PyroCueV891} from './virtualPyrotechnicsV891';
const SPARKS=18, JETS=14, FLAMES=6;
export function VirtualPyroStageV891({cueRef}:{cueRef:{current:PyroCueV891}}){
 const flames=useRef<InstancedMesh>(null),jets=useRef<InstancedMesh>(null),sparks=useRef<InstancedMesh>(null);
 const flameMat=useRef<MeshBasicMaterial>(null),jetMat=useRef<MeshBasicMaterial>(null),sparkMat=useRef<MeshBasicMaterial>(null);
 const proxy=useRef(new Object3D());
 useEffect(()=>{
  const a=flames.current,b=jets.current,c=sparks.current;
  for(const m of [a,b,c])if(m)m.instanceMatrix.setUsage(DynamicDrawUsage);
  if(a){for(let j=0;j<FLAMES;j++)a.setColorAt(j,new Color(j%2?'#ffb344':'#ff6728'));if(a.instanceColor)a.instanceColor.needsUpdate=true;}
  if(b){for(let j=0;j<JETS;j++)b.setColorAt(j,new Color(j%3?'#b0e7ff':'#ffffff'));if(b.instanceColor)b.instanceColor.needsUpdate=true;}
  if(c){for(let j=0;j<SPARKS;j++)c.setColorAt(j,new Color(j%3?'#ffe28e':'#ff8d54'));if(c.instanceColor)c.instanceColor.needsUpdate=true;}
 },[]);
 useFrame(()=>{
  const cue=cueRef.current,kind=cue.active?cue.kind:'none';
  const a=flames.current,b=jets.current,c=sparks.current;
  if(a){a.visible=kind==='flames';a.count=a.visible?Math.min(FLAMES,cue.count):0;}
  if(b){b.visible=kind==='jets';b.count=b.visible?Math.min(JETS,cue.count):0;}
  if(c){c.visible=kind==='sparks';c.count=c.visible?Math.min(SPARKS,cue.count):0;}
  if(flameMat.current)flameMat.current.opacity=kind==='flames'?Math.min(.52,cue.opacity*.8):0;
  if(jetMat.current)jetMat.current.opacity=kind==='jets'?Math.min(.27,cue.opacity*.42):0;
  if(sparkMat.current)sparkMat.current.opacity=kind==='sparks'?Math.min(.58,cue.opacity*.9):0;
  if(kind==='none')return;
  const p=cue.phase,o=proxy.current;
  if(a?.visible){for(let j=0;j<a.count;j++){
   const side=j%2?-1:1,layer=Math.floor(j/2);
   o.position.set(side*(2.65+layer*.2),-1.26+Math.sin(p*14+j)*.08,-1.7-layer*.10);
   o.rotation.set(0,0,side*.12+Math.sin(p*12+j)*.12);
   const height=(.65+.30*Math.sin(p*12+j)*Math.sin(p*12+j))*(1+cue.opacity*.6);
   o.scale.set(.68-layer*.14,height, .75-layer*.14);o.updateMatrix();a.setMatrixAt(j,o.matrix);
  }a.instanceMatrix.needsUpdate=true;}
  if(b?.visible){for(let j=0;j<b.count;j++){
   const side=j%2?-1:1,seed=((j*37+11)%59)/59;
   const rise=(p*1.25+seed)%1;
   o.position.set(side*(2.95+rise*.32)+Math.sin(p*8+j)*.09,-1.60+rise*3.2,-1.9+seed*.25);
   o.rotation.set(0,0,side*.09);const size=.09+rise*.16;
   o.scale.set(size,size*(1.15+rise*.4),size);o.updateMatrix();b.setMatrixAt(j,o.matrix);
  }b.instanceMatrix.needsUpdate=true;}
  if(c?.visible){for(let j=0;j<c.count;j++){
   const side=j%2?-1:1,seed=((j*23+5)%47)/47;
   const rise=(p*.95+seed)%1;
   o.position.set(side*(2.55+rise*.55)+Math.sin(j*2.4+p*11)*rise*.4,
     -1.71+rise*2.9-(rise*rise)*.65,-1.4+seed*.33);
   o.rotation.set(p*12+j,0,p*8+j);o.scale.set(.025+seed*.02,.10+seed*.05,1);
   o.updateMatrix();c.setMatrixAt(j,o.matrix);
  }c.instanceMatrix.needsUpdate=true;}
 });
 return <group name="v891-virtual-pyrotechnics">
  <instancedMesh ref={flames} args={[undefined,undefined,FLAMES]} visible={false} frustumCulled={false} renderOrder={4}>
   <coneGeometry args={[.27,1.6,6,1,true]}/>
   <meshBasicMaterial ref={flameMat} vertexColors transparent opacity={0} side={DoubleSide} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={jets} args={[undefined,undefined,JETS]} visible={false} frustumCulled={false} renderOrder={4}>
   <sphereGeometry args={[1,6,4]}/>
   <meshBasicMaterial ref={jetMat} vertexColors transparent opacity={0} side={DoubleSide} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={sparks} args={[undefined,undefined,SPARKS]} visible={false} frustumCulled={false} renderOrder={4}>
   <planeGeometry args={[1,1]}/>
   <meshBasicMaterial ref={sparkMat} vertexColors transparent opacity={0} side={DoubleSide} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
 </group>;
}
