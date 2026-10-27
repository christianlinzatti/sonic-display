'use client';
/** Local V590 screenshot target. Loads genuine GLB(s), never a procedural substitute. */
import {Suspense,useCallback,useEffect,useMemo,useRef,useState, type MutableRefObject} from 'react';
import {Canvas,useFrame, useThree} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {AnimationMixer,Box3,Vector3,Group,LoopOnce, type AnimationClip} from 'three';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {retargetHumanoidClips,readRetargetCalibration} from './avatarAnimationRetarget';
import {assessFramingV590,safeLocalGlbV590,type V590Bounds} from './realConcertBenchmarkV590';

type Shot={ready:boolean;error:string|null;modelUrl:string;motionUrl:string|null;clipNames:string[];clipDurations:number[];
 clipIndex:number;seconds:number;generation:number;appliedGeneration:number;bounds:V590Bounds;meshes:number;skinnedMeshes:number;
 webglVersion:string|null;triangles:number;drawCalls:number;};
type StageApi={state:()=>Shot;seek:(clipIndex:number,seconds:number)=>boolean};
declare global{interface Window{__sonicV590?:StageApi;}}
const initial:Shot={ready:false,error:null,modelUrl:'',motionUrl:null,clipNames:[],clipDurations:[],clipIndex:0,seconds:0,generation:0,
 appliedGeneration:-1,bounds:null,meshes:0,skinnedMeshes:0,webglVersion:null,triangles:0,drawCalls:0};
function RenderRig({modelUrl,motionUrl,selection,onReady,shotRef}:{modelUrl:string;motionUrl:string|null;
 selection:{clipIndex:number;seconds:number;generation:number};onReady:(names:string[],durations:number[])=>void;shotRef:MutableRefObject<Shot>}){
 const source=useGLTF(modelUrl);const motion=useGLTF(motionUrl||modelUrl);
 const gltf=useMemo(()=>cloneSkinnedScene(source.scene),[source.scene]);
 const clips=useMemo<AnimationClip[]>(()=>motionUrl
  ?retargetHumanoidClips(motion.animations,motion.scene,gltf,readRetargetCalibration(modelUrl)).clips
  :source.animations,[motionUrl,motion.animations,motion.scene,source.animations,gltf,modelUrl]);
 const validClips=useMemo(()=>clips.filter(clip=>clip.tracks.length>0&&Number.isFinite(clip.duration)&&clip.duration>0),[clips]);
 const mixer=useMemo(()=>new AnimationMixer(gltf),[gltf]);
 const rigRef=useRef<Group>(null);
 const setup=useMemo(()=>{
  const box=new Box3().setFromObject(gltf),center=new Vector3();box.getCenter(center);
  const height=Math.max(.001,box.getSize(new Vector3()).y);const scale=Math.min(100,Math.max(.001,2.55/height));
  let meshes=0,skinnedMeshes=0;gltf.traverse(node=>{if((node as any).isMesh)meshes++;if((node as any).isSkinnedMesh)skinnedMeshes++;});
  return {scale,offset:[-center.x*scale,1.30-center.y*scale,-center.z*scale] as [number,number,number],meshes,skinnedMeshes};
 },[gltf]);
 const {gl,camera}=useThree();const done=useRef(-1);
 useEffect(()=>{
  shotRef.current.meshes=setup.meshes;shotRef.current.skinnedMeshes=setup.skinnedMeshes;
  shotRef.current.webglVersion=gl.capabilities.isWebGL2?'WebGL2':'WebGL1';
  onReady(validClips.map((clip,i)=>clip.name||`GLB-Clip ${i+1}`),validClips.map(clip=>clip.duration));
  return ()=>{mixer.stopAllAction();mixer.uncacheRoot(gltf);};
 },[validClips,onReady,setup.meshes,setup.skinnedMeshes,gl,mixer,gltf,shotRef]);
 useEffect(()=>{
  const clip=validClips[selection.clipIndex];done.current=-1;
  if(!clip||!Number.isFinite(clip.duration)||clip.duration<=0)return;
  mixer.stopAllAction();const action=mixer.clipAction(clip);
  action.reset();action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
  // True animation track sampling at the requested timestamp. No playback clock drift.
  mixer.setTime(Math.min(Math.max(0,selection.seconds),Math.max(0,clip.duration-.00001)));
 },[mixer,validClips,selection]);
 useFrame(()=>{
  if(!rigRef.current||!validClips[selection.clipIndex]||setup.meshes<1||done.current===selection.generation)return;
  rigRef.current.updateWorldMatrix(true,true);
  // A single precise (skinned-vertex-aware when supported) bound per requested shot,
  // never a heavy full-geometry scan every display refresh.
  const boundsWorld=new Box3().setFromObject(rigRef.current,true);
  if(boundsWorld.isEmpty())return;
  const bmin=boundsWorld.min,bmax=boundsWorld.max;let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(let i=0;i<8;i++){
   const point=new Vector3(i&1?bmax.x:bmin.x,i&2?bmax.y:bmin.y,i&4?bmax.z:bmin.z).project(camera);
   if(!Number.isFinite(point.x)||!Number.isFinite(point.y))return;
   minX=Math.min(minX,point.x);maxX=Math.max(maxX,point.x);minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);
  }
  shotRef.current.bounds={minX,maxX,minY,maxY};
  shotRef.current.triangles=gl.info.render.triangles;shotRef.current.drawCalls=gl.info.render.calls;
  if(done.current!==selection.generation){done.current=selection.generation;shotRef.current.appliedGeneration=selection.generation;}
 });
 return <group ref={rigRef} position={setup.offset} scale={setup.scale}><primitive object={gltf}/></group>;
}
export function V590BrowserStage(){
 const [config,setConfig]=useState<{model:string;motion:string|null;error:string}|null>(null);
 const [selection,setSelection]=useState({clipIndex:0,seconds:0,generation:0});
 const [ready,setReady]=useState(false);const shotRef=useRef<Shot>({...initial});
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search),model=params.get('model')||'',motion=params.get('motion');
  const error=!safeLocalGlbV590(model)?'Ein lokaler GLB-Modellpfad ist erforderlich (z. B. /avatars/performer.glb).'
   :motion&&!safeLocalGlbV590(motion)?'Auch das externe Motion-GLB muss ein lokaler Pfad sein.':'';
  setConfig({model,motion,error});shotRef.current={...initial,modelUrl:model,motionUrl:motion,error:error||null};
 },[]);
 const onReady=useCallback((names:string[],durations:number[])=>{
  shotRef.current.clipNames=names;shotRef.current.clipDurations=durations;
  if(!names.length){shotRef.current.error='Die geladene GLB enthält keine kompatiblen Animationsclips.';return;}
  if(shotRef.current.meshes<1){shotRef.current.error='Das GLB enthält kein sichtbares Mesh.';return;}
  shotRef.current.ready=true;setReady(true);
 },[]);
 useEffect(()=>{
  if(!ready)return;
  const api:StageApi={state:()=>({...shotRef.current,bounds:shotRef.current.bounds?{...shotRef.current.bounds}:null,
   clipNames:[...shotRef.current.clipNames],clipDurations:[...shotRef.current.clipDurations]}),
   seek:(clipIndex,seconds)=>{
    const clips=shotRef.current.clipDurations;
    if(!Number.isInteger(clipIndex)||clipIndex<0||clipIndex>=clips.length||!Number.isFinite(seconds)||seconds<0||seconds>=clips[clipIndex])return false;
    shotRef.current.generation+=1;shotRef.current.clipIndex=clipIndex;shotRef.current.seconds=seconds;
    setSelection({clipIndex,seconds,generation:shotRef.current.generation});return true;
   }};
  window.__sonicV590=api;return ()=>{if(window.__sonicV590===api)delete window.__sonicV590;};
 },[ready]);
 return <main style={{background:'#0b1423',color:'#f2f5ff',minHeight:'100vh',padding:16,fontFamily:'system-ui, sans-serif'}}>
  <h1 style={{fontSize:21}}>V590 · Real GLB Concert Visual Benchmark</h1>
  <p style={{fontSize:13}}>Unabhängige lokale 3D-Testszenen. Keine Spotify-Songdaten, keine automatische Sichtfreigabe.</p>
  {config?.error?<p role="alert">{config.error}</p>:null}
  {!config?.error&&config?.model?<div style={{width:'960px',maxWidth:'100%',height:'540px',position:'relative',overflow:'hidden',border:'1px solid #354b6a'}}
    data-v590-scene={ready?'ready':'loading'}>
   <Canvas frameloop="always" dpr={1} gl={{antialias:true,preserveDrawingBuffer:true}}
    camera={{position:[0,1.4,7],fov:40,near:.1,far:150}}>
    <color attach="background" args={['#101d30']}/><ambientLight intensity={1.2}/><directionalLight position={[3,5,5]} intensity={1.55}/>
    <gridHelper args={[8,8,'#304961','#213247']} position={[0,0,0]}/>
    <Suspense fallback={null}><RenderRig modelUrl={config.model} motionUrl={config.motion} selection={selection} onReady={onReady} shotRef={shotRef}/></Suspense>
   </Canvas>
  </div>:null}
  <p role="status" data-v590-status={ready?'ready':config?.error?'blocked':'loading'}>
   {ready?`${shotRef.current.clipNames.length} echte GLB-Clips geladen · ${shotRef.current.meshes} Meshes · ${assessFramingV590(shotRef.current.bounds).status}`:
    config?.error||'GLB wird geladen. Ohne gültige Datei kein Benchmark.'}
  </p>
  {ready&&<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <label>Clip <select value={selection.clipIndex} onChange={e=>{const i=Number(e.target.value);window.__sonicV590?.seek(i,0);}}>
    {shotRef.current.clipNames.map((name,i)=><option value={i} key={i}>{i}: {name}</option>)}
   </select></label>
   <label>Position (s) <input type="number" step="0.1" min="0" value={selection.seconds}
    onChange={e=>{const at=Number(e.target.value);window.__sonicV590?.seek(selection.clipIndex,Math.max(0,Math.min(at,shotRef.current.clipDurations[selection.clipIndex]-.001)));}}/></label>
  </div>}
  <p style={{fontSize:12}}>Automatische Screenshots: <code>npm run benchmark:v590:visual -- --model=/avatars/performer.glb --original=0 --following=1</code></p>
 </main>;
}
