"use client";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {OrbitControls,useGLTF} from "@react-three/drei";
import {Component,Suspense,useEffect,useMemo,useRef,type ReactNode} from "react";
import {Box3,PerspectiveCamera,Vector3} from "three";
import {clone as cloneSkinnedScene} from "three/examples/jsm/utils/SkeletonUtils.js";
import type {OrbitControls as OrbitControlsImpl} from "three-stdlib";
import type {CameraPose} from "./stageCameraPoseHelpersV289";
import type {GroupPointV326} from "./multiAvatarStageDirectorV326";
import type {CameraPreviewPlanV399} from "./multiAvatarCameraV399";

export type PreviewDancerV399={id:string;label:string;url:string|null};
const palette=["#63ddec","#c29bff","#86d9af","#ffcf84"];
function DemoFigure({index}:{index:number}){
 return <group>
  <mesh position={[0,1.10,0]}><capsuleGeometry args={[.23,.76,6,12]}/><meshStandardMaterial color={palette[index%4]} roughness={.6}/></mesh>
  <mesh position={[0,1.86,0]}><sphereGeometry args={[.22,14,12]}/><meshStandardMaterial color="#f6dcc6"/></mesh>
  {[-1,1].map(side=><group key={side}>
   <mesh position={[side*.35,1.20,0]} rotation={[0,0,side*.2]}><capsuleGeometry args={[.085,.67,6,8]}/><meshStandardMaterial color={palette[index%4]}/></mesh>
   <mesh position={[side*.13,.42,0]}><capsuleGeometry args={[.11,.68,6,10]}/><meshStandardMaterial color="#425578"/></mesh>
  </group>)}
 </group>;
}
function AvatarClone({url}:{url:string}){
 const {scene}=useGLTF(url);
 const copy=useMemo(()=>{
  const cloned=cloneSkinnedScene(scene);
  const box=new Box3().setFromObject(cloned);
  const height=box.max.y-box.min.y;
  if(Number.isFinite(height)&&height>.001){
   const k=Math.max(.02,Math.min(4,2.2/height));
   const center=box.getCenter(new Vector3());
   cloned.scale.multiplyScalar(k);
   cloned.position.set(-center.x*k,-box.min.y*k,-center.z*k);
  }
  return cloned;
 },[scene]);
 return <primitive object={copy} dispose={null}/>;
}
class AvatarErrorV399 extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}
function DancerV399({point,dancer,index,selected}:{point:GroupPointV326;dancer:PreviewDancerV399;index:number;selected:boolean}){
 return <group position={point}>
  {dancer.url?<AvatarErrorV399 key={dancer.url} fallback={<DemoFigure index={index}/>}>
    <Suspense fallback={<DemoFigure index={index}/>}><AvatarClone url={dancer.url}/></Suspense>
  </AvatarErrorV399>:<DemoFigure index={index}/>}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.012,0]}>
   <ringGeometry args={[.39,.45,28]}/><meshBasicMaterial color={selected?"#fff4ae":palette[index%4]}/>
  </mesh>
 </group>;
}
function CinematicOrbitV399({plan,transitionMs,poseChanged,onPoseChange}:{
 plan:CameraPreviewPlanV399;transitionMs:number;poseChanged:number;onPoseChange:(pose:CameraPose)=>void}){
 const {camera,invalidate}=useThree();
 const orbit=useRef<OrbitControlsImpl>(null);
 const target=useRef(plan.pose);
 const running=useRef(false);
 const userOrbit=useRef(false);
 useEffect(()=>{
  target.current=plan.pose;
  running.current=transitionMs>0&&!userOrbit.current;
  if(transitionMs===0){
   camera.position.set(plan.pose.x,plan.pose.y,plan.pose.z);
   if(camera instanceof PerspectiveCamera){camera.fov=plan.pose.fov;camera.updateProjectionMatrix();}
   orbit.current?.target.set(plan.pose.targetX??0,plan.pose.targetY,plan.pose.targetZ??0);
   orbit.current?.update();invalidate();
  }
 },[plan.pose.x,plan.pose.y,plan.pose.z,plan.pose.targetX,plan.pose.targetY,plan.pose.targetZ,plan.pose.fov,poseChanged,transitionMs,camera,invalidate]);
 useFrame((_,delta)=>{
  if(!running.current||userOrbit.current)return;
  const p=target.current,t=orbit.current;
  const rate=1-Math.exp(-Math.min(.08,delta)*1000/Math.max(100,transitionMs));
  camera.position.lerp(new Vector3(p.x,p.y,p.z),rate);
  if(t)t.target.lerp(new Vector3(p.targetX??0,p.targetY,p.targetZ??0),rate);
  if(camera instanceof PerspectiveCamera){camera.fov+=(p.fov-camera.fov)*rate;camera.updateProjectionMatrix();}
  t?.update();
  if(camera.position.distanceTo(new Vector3(p.x,p.y,p.z))<.008&&(!t||t.target.distanceTo(new Vector3(p.targetX??0,p.targetY,p.targetZ??0))<.008))running.current=false;
 });
 const capture=()=>{
  const t=orbit.current;if(!t)return;
  onPoseChange({x:camera.position.x,y:camera.position.y,z:camera.position.z,
   targetX:t.target.x,targetY:t.target.y,targetZ:t.target.z,
   fov:camera instanceof PerspectiveCamera?camera.fov:plan.pose.fov});
 };
 return <OrbitControls ref={orbit} makeDefault enablePan enableZoom enableRotate minDistance={2} maxDistance={16}
  onStart={()=>{userOrbit.current=true;running.current=false;}}
  onEnd={()=>{userOrbit.current=false;capture();}}/>;
}
/** A GPU canvas is mounted ONLY while V399 is opened. No live 3D scene is mutated. */
export function MultiAvatarCameraCanvasV399({plan,positions,dancers,onPoseChange,reducedMotion,holdMs,revision}:{
 plan:CameraPreviewPlanV399;positions:GroupPointV326[];dancers:PreviewDancerV399[];
 onPoseChange:(pose:CameraPose)=>void;reducedMotion:boolean;holdMs:number;revision:number}){
 const transitionMs=reducedMotion?0:Math.min(1100,Math.max(250,holdMs*.68));
 return <div className="v399-camera-canvas" aria-label="V399 Bühnenvorschau mit mehreren Avataren">
  <Canvas camera={{position:[plan.pose.x,plan.pose.y,plan.pose.z],fov:plan.pose.fov}} dpr={[1,1.35]}>
   <color attach="background" args={["#0a1020"]}/>
   <ambientLight intensity={1.05}/><directionalLight position={[4,7,5]} intensity={1.8}/>
   <pointLight position={[-3,3,2]} intensity={8} color="#56b8d9"/>
   <gridHelper args={[12,12,"#405477","#253249"]} position={[0,-.04,0]}/>
   <mesh position={[0,-.10,0]}><boxGeometry args={[10,.16,5]}/><meshStandardMaterial color="#17223b" roughness={.85}/></mesh>
   {positions.map((point,i)=><DancerV399 key={`slot-${i}`} point={point} dancer={dancers[i]??{id:String(i),label:`Tänzer ${i+1}`,url:null}} index={i} selected={plan.actors.includes(i)}/>)}
   <CinematicOrbitV399 plan={plan} transitionMs={transitionMs} poseChanged={revision} onPoseChange={onPoseChange}/>
  </Canvas>
 </div>;
}
