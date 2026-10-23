"use client";
/** V321 synchronized A/B motion preview. Both canvases sample the same clock;
 * both GLB skeletons and animation mixers are independent. */
import {Suspense,useEffect,useMemo,type ReactNode,Component} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import {AnimationMixer,Box3,Vector3,type AnimationClip,type Group} from 'three';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {retargetHumanoidClips,readRetargetCalibration} from './avatarAnimationRetarget';
import {polishMotionClipV321,type MotionQualitySettingsV321} from './advancedMotionQualityV321';

function MotionStage({modelUrl,sourceScene,sourceClips,index,settings,seconds,corrected}:{modelUrl:string;sourceScene:Group;sourceClips:AnimationClip[];
  index:number;settings:MotionQualitySettingsV321;seconds:number;corrected:boolean}){
 const gltf=useGLTF(modelUrl);
 const clone=useMemo(()=>cloneSkinnedScene(gltf.scene),[gltf.scene]);
 const clips=useMemo(()=>retargetHumanoidClips(sourceClips,sourceScene,clone,readRetargetCalibration(modelUrl)).clips,[sourceClips,sourceScene,clone,modelUrl]);
 const source=clips[index]??clips[0];
 const clip=useMemo(()=>source?(corrected?polishMotionClipV321(source,{...settings,enabled:true}):source):null,[source,corrected,settings]);
 const mixer=useMemo(()=>new AnimationMixer(clone),[clone]);
 const action=useMemo(()=>clip?mixer.clipAction(clip):null,[mixer,clip]);
 const placement=useMemo(()=>{
  const box=new Box3().setFromObject(clone),size=new Vector3(),center=new Vector3();box.getSize(size);box.getCenter(center);
  const scale=Math.max(.05,Math.min(4,2.55/Math.max(.1,size.y)));
  return {scale,position:[-center.x*scale,-box.min.y*scale,-center.z*scale] as [number,number,number]};
 },[clone]);
 useEffect(()=>{
  if(!action)return;
  action.reset().play();action.paused=true;action.enabled=true;action.setEffectiveWeight(1);
  return()=>{action.stop();mixer.stopAllAction();};
 },[action,mixer]);
 useEffect(()=>()=>{mixer.stopAllAction();mixer.uncacheRoot(clone);},[mixer,clone]);
 useFrame(()=>{
  if(!action||!clip||!(clip.duration>.01))return;
  action.paused=true;action.enabled=true;
  action.time=(Math.max(0,seconds)%clip.duration+clip.duration)%clip.duration;
  mixer.update(0);
 });
 return <group scale={placement.scale} position={placement.position}><primitive object={clone} dispose={null}/></group>;
}
class StageErrorBoundary extends Component<{children:ReactNode},{error:boolean}>{
 state={error:false};static getDerivedStateFromError(){return {error:true};}
 render(){return this.state.error?<p style={{padding:12}}>3D-Avatar kann nicht geladen werden.</p>:this.props.children;}
}
export function MotionQualityPreviewV321({modelUrl,sourceScene,sourceClips,index,settings,seconds}:{modelUrl:string;sourceScene:Group;
 sourceClips:AnimationClip[];index:number;settings:MotionQualitySettingsV321;seconds:number}){
 return <div className="motion-quality-compare-v321" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(205px,1fr))',gap:12}}>
  {[false,true].map(corrected=><section key={String(corrected)} style={{minWidth:0}}>
    <strong>{corrected?'Vorschlag · geglättete Kopie':'Original · unverändert'}</strong>
    <div style={{height:265,background:'#131b2b',borderRadius:10,overflow:'hidden'}}>
      <StageErrorBoundary><Canvas camera={{position:[0,1.45,4.3],fov:43}} dpr={[1,1.4]}>
        <ambientLight intensity={1.2}/><directionalLight position={[3,5,4]} intensity={2}/>
        <Suspense fallback={null}><MotionStage modelUrl={modelUrl} sourceScene={sourceScene} sourceClips={sourceClips} index={index} settings={settings} seconds={seconds} corrected={corrected}/></Suspense>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={7}/><gridHelper args={[7,10,'#45556e','#293147']} position={[0,-.02,0]}/>
      </Canvas></StageErrorBoundary>
    </div>
  </section>)}
 </div>;
}
