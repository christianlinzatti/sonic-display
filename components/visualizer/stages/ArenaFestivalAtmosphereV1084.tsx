"use client";
import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import {Color,Object3D,DoubleSide,type InstancedMesh} from 'three';
import {useAdaptivePerformance} from '../adaptivePerformance';
import type {AudioFeatures} from '@/types/audio';
import {sampleUltimateFestivalDropV1087,type UltimateFestivalDropCueV1087,type UltimateFestivalDropStateV1087} from '@/lib/arena360UltimateFestivalDropV1087';
import {INITIAL_FESTIVAL_BURST_V1084,sampleFestivalParticleV1084,stepFestivalBurstsV1084,
 type FestivalCueV1084,type FestivalKindV1084,type FestivalBurstStateV1084} from '@/lib/arena360FestivalAtmosphereV1084';
/** Three pooled, fixed-size particle batches: bubbles, paper/confetti, virtual CO2.
 * No sprites/textures/postprocessing/lights, no per-frame object creation or real devices.
 */
export function ArenaFestivalAtmosphereV1084({cue,audio,progressMs,ultimateFestivalDropCueV1087,ultimateFestivalDropStateV1087}:{cue:FestivalCueV1084;
 audio:AudioFeatures;progressMs:number;ultimateFestivalDropCueV1087?:UltimateFestivalDropCueV1087;
 ultimateFestivalDropStateV1087?:{readonly current:UltimateFestivalDropStateV1087}}){
 const tier=useAdaptivePerformance().tier;
 const bubbles=tier==='low'?0:tier==='balanced'?16:28;
 const confetti=tier==='low'?0:tier==='balanced'?18:38;
 const streamers=tier==='low'?0:tier==='balanced'?8:20;
 const jets=tier==='low'?0:tier==='balanced'?4:8;
 const bubbleMesh=useRef<InstancedMesh>(null),paperMesh=useRef<InstancedMesh>(null),jetMesh=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]),color=useMemo(()=>new Color(),[]);
 const state=useRef<FestivalBurstStateV1084>({...INITIAL_FESTIVAL_BURST_V1084});
 const gate=useRef(.2);
 const palettes=useMemo(()=>({bubbles:['#a9edff','#c4b8ff','#d7fff3'],
  confetti:['#ffe07c','#ff8aa5','#8fe4fd','#bfa6ff'],
  streamers:['#ffec95','#a2c8ff','#ffb1d6'],jets:['#d9f4ff','#e5faff']}),[]);
 useFrame((_,delta)=>{
  if(!cue.active)return;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  state.current=stepFestivalBurstsV1084(state.current,dt,cue,audio,progressMs);
  // Existing paper batches respond to the SAME V1087 event; no new confetti mesh.
  if(ultimateFestivalDropCueV1087?.channels.confetti&&ultimateFestivalDropStateV1087&&cue.confetti>.02){
   const pulse=sampleUltimateFestivalDropV1087(ultimateFestivalDropCueV1087,ultimateFestivalDropStateV1087.current).confetti;
   if(pulse>state.current.confetti)state.current.confetti=pulse;
  }
  gate.current+=dt;
  if(gate.current<(tier==='balanced'?.085:.05))return;
  gate.current=0;
  const draw=(mesh:InstancedMesh|null,kind:FestivalKindV1084,start:number,count:number,total:number,palette:readonly string[])=>{
   if(!mesh)return;
   for(let i=0;i<count;i++){
    const sample=sampleFestivalParticleV1084(kind,i,total,progressMs,cue,state.current);
    dummy.position.set(sample.x,sample.y,sample.z);
    dummy.rotation.set(kind==='bubble'?0:sample.rotation,kind==='co2'?sample.rotation:0,kind==='bubble'?0:sample.rotation*.5);
    dummy.scale.set(sample.scaleX,sample.scaleY,sample.scaleZ);
    dummy.updateMatrix();mesh.setMatrixAt(start+i,dummy.matrix);
    mesh.setColorAt(start+i,color.set(palette[i%palette.length]).multiplyScalar(.18+.82*sample.alpha));
   }
   mesh.instanceMatrix.needsUpdate=true;
   if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  };
  draw(bubbleMesh.current,'bubble',0,bubbles,bubbles,palettes.bubbles);
  draw(paperMesh.current,'confetti',0,confetti,confetti,palettes.confetti);
  draw(paperMesh.current,'streamer',confetti,streamers,streamers,palettes.streamers);
  draw(jetMesh.current,'co2',0,jets,jets,palettes.jets);
 });
 if(!cue.active||tier==='low')return null;
 return <group name="v1084-virtual-festival-atmosphere">
  <instancedMesh ref={bubbleMesh} args={[undefined,undefined,bubbles]} frustumCulled={false}>
   <sphereGeometry args={[1,6,4]}/>
   <meshBasicMaterial transparent opacity={.24} depthWrite={false} color="#ffffff"/>
  </instancedMesh>
  <instancedMesh ref={paperMesh} args={[undefined,undefined,confetti+streamers]} frustumCulled={false}>
   <planeGeometry args={[1,1]}/>
   <meshBasicMaterial transparent opacity={.67} side={DoubleSide} depthWrite={false} color="#ffffff"/>
  </instancedMesh>
  <instancedMesh ref={jetMesh} args={[undefined,undefined,jets]} frustumCulled={false}>
   <sphereGeometry args={[1,6,4]}/>
   <meshBasicMaterial transparent opacity={.22} depthWrite={false} color="#ffffff"/>
  </instancedMesh>
 </group>;
}
