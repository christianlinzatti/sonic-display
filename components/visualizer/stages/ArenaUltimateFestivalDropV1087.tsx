'use client';
import {useFrame} from '@react-three/fiber';
import {useRef} from 'react';
import type {Mesh,MeshBasicMaterial} from 'three';
import {sampleUltimateFestivalDropV1087,
 type UltimateFestivalDropCueV1087,type UltimateFestivalDropStateV1087} from '@/lib/arena360UltimateFestivalDropV1087';
/** Single low-overdraw ring, the only additional draw call for V1087.
 * World-fixed, never an HDR flash or a physical device signal. */
export function ArenaUltimateFestivalDropV1087({cue,stateRef}:{
 cue:UltimateFestivalDropCueV1087;stateRef:{readonly current:UltimateFestivalDropStateV1087};
}){
 const mesh=useRef<Mesh>(null);
 useFrame(()=>{
  const ring=mesh.current;
  if(!ring)return;
  const pulse=sampleUltimateFestivalDropV1087(cue,stateRef.current);
  ring.visible=cue.channels.shockwave&&pulse.shockwave>.002;
  if(!ring.visible)return;
  const scale=Math.min(2.35,1+.85*pulse.ageSeconds);
  ring.scale.set(scale,scale,scale);
  const material=ring.material as MeshBasicMaterial;
  material.opacity=Math.min(.23,.23*pulse.shockwave*(1-Math.min(1,pulse.ageSeconds/1.55)));
 });
 if(!cue.active||!cue.channels.shockwave)return null;
 return <mesh ref={mesh} name="v1087-virtual-festival-shockwave" visible={false}
  position={[0,-1.78,0]} rotation={[-Math.PI/2,0,0]}>
  <torusGeometry args={[1.36,.024,5,64]}/>
  <meshBasicMaterial color="#84d8ff" transparent opacity={0} depthWrite={false} toneMapped={false}/>
 </mesh>;
}
