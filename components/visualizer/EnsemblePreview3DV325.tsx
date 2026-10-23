'use client';
import {Suspense,useEffect,useMemo} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import {AnimationMixer} from 'three';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import type {EnsemblePoseV325} from './ensembleChoreographyV325';
function RigModel({url,seconds}:{url:string;seconds:number}) {
 const {scene,animations}=useGLTF(url);
 const model=useMemo(()=>cloneSkinnedScene(scene),[scene]);
 const mixer=useMemo(()=>new AnimationMixer(model),[model]);
 useEffect(()=>{
  const clip=animations[0];if(clip)mixer.clipAction(clip).play();
  return()=>{mixer.stopAllAction();mixer.uncacheRoot(model);};
 },[animations,mixer,model]);
 useFrame(()=>{if(animations[0])mixer.setTime(seconds%Math.max(.1,animations[0].duration));});
 return <primitive object={model}/>;
}
function FallbackDancer({purple}:{purple:boolean}) {
 const color=purple?'#bf8cff':'#62dbe9';
 return <group><mesh position={[0,1.18,0]}><capsuleGeometry args={[.27,.72,5,10]}/><meshStandardMaterial color={color}/></mesh>
  <mesh position={[0,1.94,0]}><sphereGeometry args={[.22,12,8]}/><meshStandardMaterial color="#ffdfc4"/></mesh>
  {[-1,1].map(side=><group key={side}><mesh position={[side*.16,.45,0]}><capsuleGeometry args={[.115,.65,4,8]}/><meshStandardMaterial color="#263a58"/></mesh>
  <mesh position={[side*.44,1.22,0]} rotation={[0,0,side*.35]}><capsuleGeometry args={[.09,.60,4,8]}/><meshStandardMaterial color={color}/></mesh></group>)}
 </group>;
}
function Dancer({position,url,seconds,purple,solo}:{position:[number,number,number];url:string|null;seconds:number;purple:boolean;solo:boolean}) {
 return <group position={position} scale={solo?[1.02,1.02,1.02]:[1,1,1]}>
  <Suspense fallback={<FallbackDancer purple={purple}/>}>{url?<RigModel url={url} seconds={seconds}/>:<FallbackDancer purple={purple}/>}</Suspense>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.008,0]}><circleGeometry args={[.49,32]}/><meshBasicMaterial color={purple?'#bc88ff':'#69dce9'} transparent opacity={solo?.36:.16}/></mesh>
 </group>;
}
export function EnsemblePreview3DV325({pose,seconds,leadUrl,partnerUrl}:{pose:EnsemblePoseV325|null;seconds:number;leadUrl:string|null;partnerUrl:string|null}){
 if(!pose)return <p>Keine Formation verfügbar.</p>;
 return <section aria-label="3D Formationsvorschau V325"><div className="ensemble-studio-v325-preview">
  <Canvas camera={{position:[0,3.25,7.2],fov:44}} dpr={[1,1.4]}><ambientLight intensity={1.3}/><directionalLight position={[2,5,5]} intensity={1.75}/>
   <gridHelper args={[12,12,'#53657a','#2e3a54']} position={[0,-.02,0]}/>
   <Dancer position={pose.lead} url={leadUrl} seconds={seconds} purple={false} solo={pose.role==='lead-solo'}/>
   <Dancer position={pose.partner} url={partnerUrl} seconds={seconds} purple solo={pose.role==='partner-solo'}/>
   <OrbitControls enablePan={false} minDistance={3} maxDistance={13} target={[0,.9,0]}/>
  </Canvas></div><small>{pose.formation} · {pose.role} · {pose.blend<1?'Formationsübergang':'Position erreicht'}. Eingebettete GLB-Animationen werden synchron abgetastet, falls vorhanden; ansonsten wird ein Demo-Avatar gezeigt. Nicht die vollständige Live-IK-/Lichtshow.</small></section>;
}
