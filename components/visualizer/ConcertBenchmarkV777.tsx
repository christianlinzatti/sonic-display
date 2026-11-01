'use client';
/** Real WebGL concert-like fixture: actual GLB/SkeletonUtils.clone, AnimationMixer,
 * facial morphs, three.js lighting, existing DanceFX, stage and Drei 3D text.
 * Synthetic deterministic audio/lyrics inputs only; NOT a full Spotify player or the
 * complete application dance/retargeting director. No invented browser metrics. */
import {Component,Suspense,useCallback,useEffect,useMemo,useRef,useState,type ReactNode,type MutableRefObject} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Text,useGLTF} from '@react-three/drei';
import {AnimationMixer,Box3,Quaternion,Vector3,type Bone,type Mesh,type Object3D} from 'three';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import type {AudioFeatures} from '@/types/audio';
import {StageEnvironment,type StageEnvironmentId} from './stages';
import {DynamicStage} from './DynamicStage';
import {DanceFX} from './DanceFX';
import {disposeClonedAvatarSkeletonsV654} from './disposeClonedAvatarSkeletonsV654';
import {CONCERT_CASES_V777,CONCERT_BENCHMARK_STAGES_V777,V777_REFERENCE_GLB,normalizeGlbPathV777,syntheticConcertCueV777,
  summarizeConcertCaseV777,type ConcertFrameV777,type ConcertReportV777,type ConcertCaseV777} from '@/services/monitoring/concertBenchmarkV777';

import {QUALITY_PROFILES_V779,resolveConcertProfileV779,type QualityProfileIdV779} from '@/services/monitoring/concertQualityProfilesV779';
import {normalizeVisualFramesV780} from '@/services/monitoring/visualQualityPlanV780';
import {createPoseInterpolationV782,type PoseNodeV782} from '@/services/monitoring/adaptiveAnimationInterpolationV782';
import {createLipSyncGuardV783} from '@/services/monitoring/lipSyncQualityGuardV783';
import {createCameraControllerV784,summarizeCameraSceneV784,type CameraSampleV784,type CameraSceneV784,type CameraModeV784} from '@/services/monitoring/cameraSmoothnessV784';
import type {CameraReportV784} from '@/services/monitoring/cameraReviewV784';
import {selectLyricsAnchorV785,lyricsProxyOverlapV785,summarizeLyricsSceneV785,type LyricsModeV785,type LyricsSampleV785,type LyricsSceneV785,type LyricsReportV785,type NdcRectV785} from '@/services/monitoring/lyricsProtectionV785';
import {createConcertGovernorV788,GOVERNOR_BUDGETS_V788,type GovernorModeV788,type GovernorLevelV788,type GovernorCaseV788,type GovernorTraceV788,type GovernorTargetV788} from '@/services/monitoring/concertQualityGovernorV788';
import {summarizeMotionSceneV781,type MotionSampleV781,type MotionReportV781,type MotionQuatV781,type MotionVec3V781,type MotionSceneV781} from '@/services/monitoring/motionSmoothnessV781';

type CollectV777={frames:ConcertFrameV777[];enabled:boolean;frame:number;visualFrameV780?:number;motionEnabledV781?:boolean;motionSessionV781?:boolean;motionSamplesV781?:MotionSampleV781[];cameraSamplesV784?:CameraSampleV784[];cameraEnabledV784?:boolean;lyricsEnabledV785?:boolean;lyricsSamplesV785?:LyricsSampleV785[];governorEnabledV788?:boolean;governorScenesV788?:GovernorCaseV788[];governorActiveV788?:ReturnType<typeof createConcertGovernorV788>};
type IdentityV777={renderer:string;viewport:string;dpr:number};
type RigV777={animations:number;skinnedMeshes:number;mouthMorphs:number};
type VisualCaptureV780={format:'sonic-visual-capture-v780';profile:QualityProfileIdV779;stage:string;avatars:2|4;frame:number;renderer:string;viewport:string;assetMode:'reference'|'user-glb';hashes:string[];dataUrl:string};
type ControllerV780={capture:(o:{stage:string;avatars:2|4;frame:number})=>Promise<VisualCaptureV780>;state:()=>string};
type ControllerV777={run:(o?:{label?:string;passes?:number;warmupFrames?:number;sampleFrames?:number;motionV781?:boolean})=>Promise<ConcertReportV777>;state:()=>string;profile:()=>QualityProfileIdV779};
type ControllerV781={report:()=>MotionReportV781|null;state:()=>string};
type ControllerV784={report:()=>CameraReportV784|null;state:()=>string};
type ControllerV785={report:()=>LyricsReportV785|null;state:()=>string};
type ControllerV788={report:()=>GovernorTraceV788|null;state:()=>string};
declare global{interface Window{__sonicV777?:ControllerV777;__sonicV780?:ControllerV780;__sonicV781?:ControllerV781;__sonicV784?:ControllerV784;__sonicV785?:ControllerV785;__sonicV788?:ControllerV788}}
const nextFrame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
async function frameWait(n:number){for(let i=0;i<n;i++)await nextFrame();}
const hostAllowed=()=>typeof window!=='undefined'&&['localhost','127.0.0.1','::1','[::1]'].includes(window.location.hostname)&&
  new URLSearchParams(window.location.search).get('concertBenchV777')==='1';
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const baseAudio:AudioFeatures={bass:.3,mids:.4,highs:.23,volume:.38,beat:false,beatStrength:0,bpm:138,kick:0,snare:0,hiHat:0,energyEnvelope:.5,attack:0,decay:.2};
function ProbeV777({data,identity,audio}:{data:MutableRefObject<CollectV777>;identity:MutableRefObject<IdentityV777>;audio:AudioFeatures}){
  const gl=useThree(s=>s.gl),size=useThree(s=>s.size);
  useEffect(()=>{const ctx=gl.getContext(),ext=ctx.getExtension('WEBGL_debug_renderer_info');
    const vendor=String(ctx.getParameter(ext?ext.UNMASKED_VENDOR_WEBGL:ctx.VENDOR));
    const renderer=String(ctx.getParameter(ext?ext.UNMASKED_RENDERER_WEBGL:ctx.RENDERER));
    identity.current={renderer:vendor+' / '+renderer,viewport:Math.round(size.width)+'x'+Math.round(size.height),dpr:gl.getPixelRatio()};
  },[gl,size.width,size.height,identity]);
  useFrame((state,delta)=>{
    if(data.current.visualFrameV780!==undefined){
      data.current.frame=data.current.visualFrameV780;
      // Fix the Three.js animation clock for comparable lighting/scene FX.
      state.clock.elapsedTime=data.current.frame/60;
    }else data.current.frame++;
    const cue=syntheticConcertCueV777(data.current.frame);
    Object.assign(audio,cue);
    if(!data.current.enabled)return;
    const ctx=gl.getContext();
    data.current.frames.push({ms:delta*1000,calls:gl.info.render.calls,triangles:gl.info.render.triangles,
      geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,programs:gl.info.programs?.length??null,contextLost:ctx.isContextLost()});
  },-100); // synthetic signal BEFORE the lighting/dancer/effect callbacks
  return null;
}
/** V788: only decorative render settings are changed during opt-in diagnostics.
 * The singer, GLB mixer, facial morphs, camera and lyrics NEVER receive this budget.
 * useFrame observes the same actual frame intervals as V777 and React rerenders only on level changes. */
function ConcertGovernorProbeV788({clock,cycle,mode,target,onLevel}:{clock:MutableRefObject<CollectV777>;cycle:number;mode:GovernorModeV788;target:GovernorTargetV788;onLevel:(level:GovernorLevelV788)=>void}){
 const controller=useMemo(()=>createConcertGovernorV788(target,mode),[cycle,target,mode]);
 const previous=useRef<GovernorLevelV788>(0);
 clock.current.governorActiveV788=controller;
 useEffect(()=>{previous.current=0;onLevel(0)},[controller,onLevel]);
 useFrame((_state,delta)=>{
   if(!clock.current.governorEnabledV788)return;
   const level=controller.step(delta*1000);
   if(level!==previous.current){previous.current=level;onLevel(level)}
 },-95);
 useEffect(()=>()=>{
   // The parent stores this snapshot before a scene unmount; no global timer.
 },[controller]);
 return null;
}
/** V784 opt-in camera: actual perspective transform and projected lyric / performer centres.
 * No changes to the existing production camera or older benchmark modes. */
function CameraDirectorBenchmarkV784({clock,mode,avatars,cycle}:{clock:MutableRefObject<CollectV777>;mode:CameraModeV784;avatars:2|4;cycle:number}){
  const {camera}=useThree();
  const controller=useMemo(()=>createCameraControllerV784(mode),[mode]);
  const aim=useMemo(()=>new Vector3(),[]),projection=useMemo(()=>new Vector3(),[]);
  useEffect(()=>{controller.reset()},[controller,cycle]);
  useFrame(()=>{
    const pose=controller.sample(clock.current.frame,avatars);
    camera.position.set(...pose.position);aim.set(...pose.target);camera.lookAt(aim);
    if('fov' in camera){const perspective=camera as import('three').PerspectiveCamera;
      if(perspective.fov!==pose.fov){perspective.fov=pose.fov;perspective.updateProjectionMatrix();}}
    camera.updateMatrixWorld();
    if(!clock.current.cameraEnabledV784||!clock.current.cameraSamplesV784)return;
    const lyric=projection.set(0,.52,2.25).project(camera),lyricNdc:[number,number]=[lyric.x,lyric.y];
    let visible=0;
    for(let i=0;i<avatars;i++){
      projection.set(showPositions(avatars,i),.4,0).project(camera);
      if(projection.z>=-1&&projection.z<=1&&Math.abs(projection.x)<.88&&Math.abs(projection.y)<.88)visible++;
    }
    const q=camera.quaternion;
    clock.current.cameraSamplesV784.push({frame:clock.current.frame,position:[camera.position.x,camera.position.y,camera.position.z],
      quaternion:[q.x,q.y,q.z,q.w],fov:'fov' in camera?(camera as import('three').PerspectiveCamera).fov:45,
      lyricNdc,visiblePerformers:visible,shot:pose.shot});
  });
  return null;
}
function showPositions(n:2|4,i:number){return n===2?[-.9,.9][i]:[-1.8,-.6,.6,1.8][i]}
const names=/mouth|jaw|viseme|aah|open|vowel/i;
function PerformerV777({url,slot,count,cycle,clock,animationStride,interpolationV782,lipGuardV783,onReady}:{url:string;slot:number;count:2|4;cycle:number;
  clock:MutableRefObject<CollectV777>;animationStride:number;interpolationV782:boolean;lipGuardV783:boolean;onReady:(cycle:number,slot:number,url:string,rig:RigV777)=>void}){
  const {scene,animations}=useGLTF(url);
  const clone=useMemo(()=>cloneSkinnedScene(scene),[scene]);
  const mixer=useMemo(()=>new AnimationMixer(clone),[clone]);
  const {mouthMeshes,rig}=useMemo(()=>{
    const mouthMeshes:{mesh:Mesh;index:number}[]=[];let skinnedMeshes=0;
    clone.traverse(node=>{
      const mesh=node as Mesh;
      if((mesh as unknown as {isSkinnedMesh?:boolean}).isSkinnedMesh)skinnedMeshes++;
      if(!mesh.isMesh||!mesh.morphTargetDictionary||!mesh.morphTargetInfluences)return;
      for(const [name,index] of Object.entries(mesh.morphTargetDictionary))if(names.test(name)){
        mouthMeshes.push({mesh,index});break;
      }
    });
    return {mouthMeshes,rig:{animations:animations.length,skinnedMeshes,mouthMorphs:mouthMeshes.length}};
  },[clone,animations.length]);
  // V781: named bones are detected once per cloned GLB. No fabricated foot
  // positions: missing left/right foot bones produce null evidence explicitly.
  const bonesV781=useMemo(()=>{
    const bones:Bone[]=[];clone.traverse(node=>{if((node as Bone).isBone)bones.push(node as Bone)});
    const find=(pattern:RegExp)=>bones.find(b=>pattern.test(b.name))??null;
    return {hip:find(/hips?|pelvis|root/i)??bones[0]??null,
      upper:find(/spine|chest|torso/i),
      left:find(/left[_. -]?(?:foot|ankle)|(?:foot|ankle)[_. -]?(?:l|left)$/i),
      right:find(/right[_. -]?(?:foot|ankle)|(?:foot|ankle)[_. -]?(?:r|right)$/i)};
  },[clone]);
  // V782: sample actual GLB transforms only at stride boundaries, blend them on
  // every display frame. Full node traversal preserves non-bone tracks and other
  // animated morph targets; all arrays are allocated once per avatar instance.
  const poseInterpolatorV782=useMemo(()=>{
    if(!interpolationV782||animationStride===1)return null;
    const nodes:PoseNodeV782[]=[];
    clone.traverse(node=>{nodes.push(node as unknown as PoseNodeV782)});
    return createPoseInterpolationV782(nodes,time=>mixer.setTime(time),animationStride);
  },[clone,mixer,animationStride,interpolationV782]);
  const mouthBlendV782=useRef<number[]>([]);
  const lipGuardStateV783=useMemo(()=>createLipSyncGuardV783(),[]);
  useEffect(()=>{poseInterpolatorV782?.reset();lipGuardStateV783.reset();mouthBlendV782.current=mouthMeshes.map(()=>0)},[poseInterpolatorV782,lipGuardStateV783,cycle,mouthMeshes]);
  const poseQ=useMemo(()=>new Quaternion(),[]),footVec=useMemo(()=>new Vector3(),[]);
  const sampleQ=(bone:Bone|null):MotionQuatV781|null=>{
    if(!bone)return null;bone.getWorldQuaternion(poseQ);return [poseQ.x,poseQ.y,poseQ.z,poseQ.w];
  };
  const sampleFoot=(bone:Bone|null):MotionVec3V781|null=>{
    if(!bone)return null;bone.getWorldPosition(footVec);return [footVec.x,footVec.y,footVec.z];
  };
  useEffect(()=>{
    if(!animations.length)return;
    const action=mixer.clipAction(animations[0]);action.reset().play();
    return()=>{action.stop();mixer.stopAllAction();mixer.uncacheRoot(clone)};
  },[mixer,animations,clone]);
  useEffect(()=>()=>{disposeClonedAvatarSkeletonsV654(clone)},[clone]);
  useEffect(()=>{onReady(cycle,slot,url,rig)},[cycle,slot,url,rig,onReady]);
  useFrame(()=>{
    if(clock.current.visualFrameV780!==undefined){
      // Exact pose in screenshot mode, including V779 cadence quantization.
      const aligned=Math.floor(clock.current.frame/animationStride)*animationStride;
      if(poseInterpolatorV782)poseInterpolatorV782.sample(clock.current.frame);
      else mixer.setTime(aligned/60);
      const vocal=syntheticConcertCueV777(poseInterpolatorV782?clock.current.frame:aligned).vocal;
      for(const {mesh,index} of mouthMeshes)if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[index]=vocal;
      return;
    }
    if(clock.current.motionSessionV781&&clock.current.frame===1){
      // Exact same logical starting phase per measured scene/pass, including mouth.
      // This is V781-only; normal V777/V779 playback is intentionally unchanged.
      mouthBlendV782.current.fill(0);lipGuardStateV783.reset();
      for(const {mesh,index} of mouthMeshes)if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[index]=0;
    }
    if(lipGuardV783){
      // V783: independently animate named mouth morphs every rendered frame.
      // Keep interpolation for the body; never modify mixer or other morphs.
      poseInterpolatorV782?.sample(clock.current.frame);
      const cue=syntheticConcertCueV777(clock.current.frame).vocal;
      const guarded=lipGuardStateV783.sample(clock.current.frame,cue);
      for(const {mesh,index} of mouthMeshes)if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[index]=guarded;
    }else if(poseInterpolatorV782){
      // V782: motion sampling is precomputed at 2/3-frame boundaries. SLERP for
      // bones, linear for scale/position/morphs. Vocal cues still update every
      // display frame, independently of the bone mixer cadence.
      poseInterpolatorV782.sample(clock.current.frame);
      const vocal=syntheticConcertCueV777(clock.current.frame).vocal;
      for(let i=0;i<mouthMeshes.length;i++){
        const {mesh,index}=mouthMeshes[i];if(!mesh.morphTargetInfluences)continue;
        const next=lerp(mouthBlendV782.current[i]??0,vocal,.32);
        mouthBlendV782.current[i]=next;mesh.morphTargetInfluences[index]=next;
      }
    }else if(clock.current.frame%animationStride===0){
      if(clock.current.motionSessionV781)mixer.setTime(clock.current.frame/60);
      else mixer.update(animationStride/60); // V779: original cadence
      const vocal=syntheticConcertCueV777(clock.current.frame).vocal;
      for(const {mesh,index} of mouthMeshes)if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[index]=lerp(mesh.morphTargetInfluences[index]??0,vocal,.32);
    }
    // Opt-in ONLY while measuring; sample AFTER mixer and morph updates.
    if(!clock.current.motionEnabledV781||!clock.current.motionSamplesV781||!bonesV781.hip)return;
    const hip=sampleQ(bonesV781.hip)!;
    const vocal=syntheticConcertCueV777(clock.current.frame).vocal;
    const value=mouthMeshes.length?(mouthMeshes[0].mesh.morphTargetInfluences?.[mouthMeshes[0].index]??0):0;
    clock.current.motionSamplesV781.push({frame:clock.current.frame,slot,hip,upper:sampleQ(bonesV781.upper),
      mouth:Math.min(1,Math.max(0,value)),vocal,leftFoot:sampleFoot(bonesV781.left),rightFoot:sampleFoot(bonesV781.right)});
  });
  return <group position={[showPositions(count,slot),-0.70,0]} scale={count===4 ? .73 : .88}>
    <primitive object={clone}/>
  </group>;
}
/** V785 opt-in lyrics safe-placement. Measures actual projected Drei glyph box, not guessed widths.
 * Performer points are explicit lane/height proxies, NOT facial bounding boxes. */
function LyricCardsV777({clock,onReady,modeV785,avatars,cycle}:{clock:MutableRefObject<CollectV777>;onReady:()=>void;modeV785:LyricsModeV785|null;avatars:2|4;cycle:number}){
  const {camera}=useThree();
  const [line,setLine]=useState(0),last=useRef(-1),root=useRef<import('three').Group>(null),synced=useRef(false);
  const {area,corner,axis,head}=useMemo(()=>({area:new Box3(),corner:new Vector3(),axis:new Vector3(),head:new Vector3()}),[]);
  const anchorRef=useRef({x:0,y:-.66});
  const preferredAnchorV785=useRef({x:0,y:-.66});
  useEffect(()=>{if(modeV785!==null){anchorRef.current={x:0,y:-.66};preferredAnchorV785.current={x:0,y:-.66};last.current=-1;setLine(0)}},[cycle,modeV785]);
  const sync=useCallback(()=>{if(!synced.current){synced.current=true;onReady()}},[onReady]);
  useFrame(()=>{
    const frame=clock.current.frame,index=Math.floor(frame/104)%4;
    if(index!==last.current){last.current=index;setLine(index)}
    const group=root.current;if(!group)return;
    const points:[number,number][]=[];
    if(modeV785!==null){camera.updateMatrixWorld(true);for(let i=0;i<avatars;i++){
      head.set(showPositions(avatars,i),.65,0).project(camera);points.push([head.x,head.y]);
    }}
    if(modeV785==='on'){
      // Keep 3D text facing the camera at a safe, stable NDC anchor; no DOM overlay.
      const target=selectLyricsAnchorV785(points,preferredAnchorV785.current),prev=anchorRef.current;
      preferredAnchorV785.current=target;
      const smoothing=.36;prev.x+=(target.x-prev.x)*smoothing;prev.y+=(target.y-prev.y)*smoothing;
      const perspective=camera as import('three').PerspectiveCamera;
      const depth=3.3,halfHeight=Math.tan(perspective.fov*Math.PI/360)*depth;
      axis.set(prev.x*halfHeight*perspective.aspect,prev.y*halfHeight,-depth).applyQuaternion(camera.quaternion).add(camera.position);
      group.position.copy(axis);group.quaternion.copy(camera.quaternion);group.scale.setScalar(.33);
    }else{
      group.position.set(0,.25+Math.sin(frame*.015)*.025,2.25);group.quaternion.identity();group.scale.setScalar(1);
    }
    if(!clock.current.lyricsEnabledV785||!clock.current.lyricsSamplesV785)return;
    group.updateMatrixWorld(true);area.setFromObject(group,true);
    let rect:NdcRectV785|null=null;
    if(!area.isEmpty()){
      let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity;
      for(const x of [area.min.x,area.max.x])for(const y of [area.min.y,area.max.y])for(const z of [area.min.z,area.max.z]){
        corner.set(x,y,z).project(camera);left=Math.min(left,corner.x);right=Math.max(right,corner.x);
        bottom=Math.min(bottom,corner.y);top=Math.max(top,corner.y);
      }
      if([left,right,bottom,top].every(Number.isFinite))rect={left,right,bottom,top};
    }
    // Compare the displayed React text against the deterministic expected line.
    clock.current.lyricsSamplesV785.push({frame,expectedLine:index,displayedLine:line,rect,
      proxyOverlap:rect?lyricsProxyOverlapV785(rect,points):false});
  });
  const lines=['Beat im Kopf  •  Licht im Raum','Wir gehen nach vorne','Bass und Rhythmus  •  volle Energie','Der Drop kommt jetzt'];
  return <group ref={root} position={[0,.25,2.25]}>
    <Text position={[0,.32,0]} fontSize={.21} anchorX="center" color="#ffcbfb" maxWidth={5} material-depthTest={false} onSync={sync}>{lines[line]}</Text>
    <Text position={[0,0,0]} fontSize={.09} anchorX="center" color="#67edff" material-depthTest={false}>V777 · SYNTHETISCHE TEXTZEILEN</Text>
  </group>;
}

class GlbErrorBoundaryV777 extends Component<{children:ReactNode;fail:(reason:string)=>void},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(error:Error){this.props.fail(error.message)}
  render(){return this.state.failed?null:this.props.children}
}
async function assetChecksV777(urls:readonly string[]){
  const bytes:number[]=[],hashes:string[]=[];
  for(const u of urls){
    const res=await fetch(u,{cache:'no-store'});
    if(!res.ok)throw Error('GLB nicht erreichbar: '+u+' ('+res.status+')');
    const buf=await res.arrayBuffer(),v=new DataView(buf);
    if(buf.byteLength<20||v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==buf.byteLength)
      throw Error('Keine gültige GLB-Datei: '+u);
    const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',buf));
    hashes.push(Array.from(hash,b=>b.toString(16).padStart(2,'0')).join(''));bytes.push(buf.byteLength);
  }
  return {bytes,hashes};
}
export function ConcertBenchmarkV777(){
  const [allowed,setAllowed]=useState(false),[runState,setRunState]=useState('ready');
  const [profileId,setProfileId]=useState<QualityProfileIdV779>('cinematic');
  const [profileOpted,setProfileOpted]=useState(false);
  const profile=QUALITY_PROFILES_V779[profileId];
  const [report,setReport]=useState<ConcertReportV777|null>(null);
  const visualModeV780=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('visualV780')==='1';
  const motionModeV781=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('motionV781')==='1';
  // Explicit local opt-in. Legacy V779/V780/V781 results retain their old cadence.
  const interpolationModeV782=typeof window!=='undefined'?new URLSearchParams(window.location.search).get('interpolationV782'):null;
  const interpolationV782=interpolationModeV782==='on';
  // Guard is deliberately opt-in and benchmark-only. The paired test fixes V782 on.
  const lipModeV783=typeof window!=='undefined'?new URLSearchParams(window.location.search).get('lipGuardV783'):null;
  const lipGuardV783=lipModeV783==='on';
  const cameraModeV784=typeof window!=='undefined'?new URLSearchParams(window.location.search).get('cameraV784'):null;
  const lyricsModeV785=typeof window!=='undefined'?new URLSearchParams(window.location.search).get('lyricsV785'):null;
  const governorModeV788=typeof window!=='undefined'?new URLSearchParams(window.location.search).get('governorV788'):null;
  const governorTargetRawV788=typeof window!=='undefined'?new URLSearchParams(window.location.search).get('targetV788'):null;
  const governorTargetV788=Number(governorTargetRawV788??45) as GovernorTargetV788;
  const [governorLevelV788,setGovernorLevelV788]=useState<GovernorLevelV788>(0);
  const governorBudgetV788=GOVERNOR_BUDGETS_V788[governorLevelV788];
  const effectiveStageV788=governorModeV788!==null?governorBudgetV788:profile;
  const lastGovernorReportV788=useRef<GovernorTraceV788|null>(null);
  const [caseName,setCaseName]=useState<ConcertCaseV777>(CONCERT_CASES_V777[0]);const [cycle,setCycle]=useState(0);
  const [urls,setUrls]=useState<string[]>([V777_REFERENCE_GLB]);const collector=useRef<CollectV777>({frames:[],enabled:false,frame:0});
  const identity=useRef<IdentityV777>({renderer:'unknown',viewport:'unknown',dpr:1});
  const audio=useMemo(()=>({...baseAudio}),[]);const active=useRef(false);const readiness=useRef(new Set<string>());
  const lastMotionReportV781=useRef<MotionReportV781|null>(null);
  const lastCameraReportV784=useRef<CameraReportV784|null>(null);
  const lastLyricsReportV785=useRef<LyricsReportV785|null>(null);
  const rigs=useRef(new Map<string,RigV777>());const lyricsSynced=useRef(false);const failed=useRef<string|null>(null);const invalidPath=useRef<string|null>(null);const refCase=useRef(caseName);refCase.current=caseName;
  useEffect(()=>{if(!hostAllowed())return;setAllowed(true);
    try{const p=new URLSearchParams(window.location.search);if(interpolationModeV782!==null&&!['on','off'].includes(interpolationModeV782))throw Error('Ungültiger V782-Interpolationsmodus');
      if(lipModeV783!==null&&(!['on','off'].includes(lipModeV783)||interpolationModeV782!=='on'))throw Error('V783 benötigt explizite V782-Interpolation und on/off-Modus');
      if(cameraModeV784!==null&&!['on','off'].includes(cameraModeV784))throw Error('Ungültiger V784-Kameramodus');
      if(lyricsModeV785!==null&&(!['on','off'].includes(lyricsModeV785)||cameraModeV784!=='on'))throw Error('V785 benötigt V784-Kamera=on und Lyrics=on/off');if(governorModeV788!==null&&(!['on','off'].includes(governorModeV788)||![30,45,60].includes(governorTargetV788)))throw Error('Ungültiger V788-Modus oder FPS-Ziel');
      if(governorModeV788!==null&&(resolveConcertProfileV779(p.get('profileV779'))!=='cinematic'||interpolationModeV782!=='on'||lipModeV783!=='on'||cameraModeV784!=='on'||lyricsModeV785!=='on'))throw Error('V788 benötigt Cinematic, V782/V783=on und Kamera/Lyrics=on');
      setProfileId(resolveConcertProfileV779(p.get('profileV779')));setProfileOpted(p.has('profileV779'));
      const first=normalizeGlbPathV777(p.get('glb')||V777_REFERENCE_GLB);
      const second=p.get('glb2');setUrls(second?[first,normalizeGlbPathV777(second)]:[first]);
    }catch(e){invalidPath.current=String(e);setRunState('error: '+String(e))}
  },[interpolationModeV782]);
  const onReady=useCallback((current:number,slot:number,url:string,rig:RigV777)=>{
    readiness.current.add(`${current}:${slot}`);rigs.current.set(url,rig);
    if(!rig.animations||!rig.skinnedMeshes||!rig.mouthMorphs)
      failed.current='Unvollständiges GLB-Rig/Animation/Mund-Morph: '+url+' '+JSON.stringify(rig);
  },[]);
  const onFail=useCallback((msg:string)=>{failed.current=msg;},[]);
  const onLyricsReady=useCallback(()=>{lyricsSynced.current=true},[]);
  const run=useCallback(async(o:{label?:string;passes?:number;warmupFrames?:number;sampleFrames?:number;motionV781?:boolean}={}):Promise<ConcertReportV777>=>{
    if(invalidPath.current)throw Error(invalidPath.current);
    if(o.motionV781&&!motionModeV781)throw Error('V781 nur im lokalen Motion-Benchmark verfügbar');
    if(active.current)throw Error('V777 läuft bereits');active.current=true;setRunState('running');setReport(null);
    const passes=Math.max(1,Math.min(4,Math.trunc(o.passes??2)));
    const warmupFrames=Math.max(45,Math.min(240,Math.trunc(o.warmupFrames??60)));
    const sampleFrames=Math.max(90,Math.min(600,Math.trunc(o.sampleFrames??180)));
    try{
      const verified=await assetChecksV777(urls);
      // Order: same fixed 3 scenes × {2,4} every time; program cache warm pass then measured passes.
      const raw=new Map<string,ConcertFrameV777[]>(),motionScenesV781:MotionSceneV781[]=[],cameraScenesV784:CameraSceneV784[]=[],lyricsScenesV785:LyricsSceneV785[]=[],governorScenesV788:GovernorCaseV788[]=[];let seq=0;
      for(let pass=-1;pass<passes;pass++)for(const c of CONCERT_CASES_V777){
        collector.current.enabled=false;collector.current.motionEnabledV781=false;collector.current.lyricsEnabledV785=false;collector.current.motionSessionV781=!!o.motionV781;failed.current=null;readiness.current.clear();collector.current.frame=0;collector.current.governorEnabledV788=false;setGovernorLevelV788(0);
        seq++;setCaseName(c);setCycle(seq);
        let pending=0;
        while(readiness.current.size<c.avatarCount||!lyricsSynced.current){
          if(failed.current)throw Error('GLB-Laden: '+failed.current);
          if(++pending>2400)throw Error('GLB-/React-Initialisierung nicht abgeschlossen: '+c.id);
          await nextFrame();
        }
        if(failed.current)throw Error(failed.current);
        await frameWait(warmupFrames);
        if(pass<0)continue;
        collector.current.frame=0;collector.current.frames=[];collector.current.motionSamplesV781=[];collector.current.lyricsSamplesV785=[];
        collector.current.lyricsEnabledV785=lyricsModeV785!==null;collector.current.motionEnabledV781=!!o.motionV781;collector.current.cameraEnabledV784=cameraModeV784!==null;collector.current.cameraSamplesV784=[];collector.current.enabled=true;collector.current.governorEnabledV788=governorModeV788!==null;
        await frameWait(sampleFrames);collector.current.enabled=false;collector.current.governorEnabledV788=false;collector.current.motionEnabledV781=false;collector.current.cameraEnabledV784=false;collector.current.lyricsEnabledV785=false;
        const frames=collector.current.frames.slice(1); // Render-info belongs to preceding frame.
        if(frames.length<sampleFrames-3)throw Error('Zu wenige gemessene Frames: '+c.id);
        raw.set(c.id,[...(raw.get(c.id)||[]),...frames]);
        if(governorModeV788!==null){const controller=collector.current.governorActiveV788;if(!controller)throw Error('V788-Regler nicht bereit');governorScenesV788.push(controller.snapshot(c.id,pass,c.avatarCount))}
        if(cameraModeV784!==null)cameraScenesV784.push(summarizeCameraSceneV784(c.id,pass,c.avatarCount,collector.current.cameraSamplesV784??[]));
        if(lyricsModeV785!==null)lyricsScenesV785.push(summarizeLyricsSceneV785(c.id,pass,c.avatarCount,collector.current.lyricsSamplesV785??[]));
        if(o.motionV781)motionScenesV781.push(summarizeMotionSceneV781(c.id,pass,profileId,c.avatarCount,
          collector.current.motionSamplesV781??[],frames.map(f=>f.ms)));
      }
      const a=[...rigs.current.entries()].filter(([u])=>urls.includes(u));
      if(a.length!==urls.length)throw Error('GLB-Metadaten unvollständig');
      const animations=a.reduce((n,[,r])=>n+r.animations,0),skinnedMeshes=a.reduce((n,[,r])=>n+r.skinnedMeshes,0),mouthMorphs=a.reduce((n,[,r])=>n+r.mouthMorphs,0);
      if(animations<urls.length||skinnedMeshes<urls.length||mouthMorphs<urls.length)
        throw Error('GLBs benötigen Rig/Animationsclip und ein benanntes Mouth-/Jaw-/Viseme-Morph-Target. Vorhanden: '+JSON.stringify({animations,skinnedMeshes,mouthMorphs}));
      const renderIdentity=identity.current;
      const result:ConcertReportV777={format:'sonic-concert-benchmark-v777',version:1,
        label:String(o.label||'candidate').slice(0,80),measuredAt:new Date().toISOString(),
        environment:{userAgent:navigator.userAgent,renderer:renderIdentity.renderer,viewport:renderIdentity.viewport,dpr:renderIdentity.dpr,
          antialias:false,softwareRenderer:/swiftshader|llvmpipe|softpipe|software/i.test(renderIdentity.renderer)},
        config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',...(profileOpted?{profileV779:profileId}:{}),...(interpolationModeV782?{interpolationV782:interpolationModeV782 as 'on'|'off'}:{}),...(lipModeV783?{lipGuardV783:lipModeV783 as 'on'|'off'}:{}),...(cameraModeV784?{cameraV784:cameraModeV784 as CameraModeV784}:{}),...(lyricsModeV785?{lyricsV785:lyricsModeV785 as LyricsModeV785}:{}),...(governorModeV788?{governorV788:governorModeV788 as GovernorModeV788,targetV788:governorTargetV788}:{}),stages:CONCERT_BENCHMARK_STAGES_V777,counts:[2,4],
          passes,warmupFrames,sampleFrames,audioMode:'deterministic-synthetic-beat-v1',lyricsMode:'synthetic-3d-text-v1',lipMode:'named-morph-v1'},
        assets:{urls,hashes:verified.hashes,bytes:verified.bytes,animations,skinnedMeshes,mouthMorphs,
          mode:urls.length===1&&urls[0]===V777_REFERENCE_GLB?'reference':'user-glb'},
        scenes:CONCERT_CASES_V777.map(c=>summarizeConcertCaseV777(c,raw.get(c.id)||[]))};
      if(governorModeV788!==null){lastGovernorReportV788.current={format:'sonic-concert-governor-v788',version:1,mode:governorModeV788 as GovernorModeV788,target:governorTargetV788,
          environment:result.environment,assets:{hashes:verified.hashes,mode:result.assets.mode},config:{passes,warmupFrames,sampleFrames,profile:'cinematic',protect:'avatar-mouth-lyrics-camera-v1',windowFrames:24},scenes:governorScenesV788};}
      if(cameraModeV784!==null){
        lastCameraReportV784.current={format:'sonic-camera-smoothness-v784',version:1,mode:cameraModeV784 as CameraModeV784,
          environment:result.environment,assets:{hashes:verified.hashes,mode:result.assets.mode},
          config:{passes,sampleFrames,warmupFrames,timeline:'scripted-shots-240f-v784',sampling:'post-camera-projection-v784'},scenes:cameraScenesV784};
      }
      if(lyricsModeV785!==null){
        lastLyricsReportV785.current={format:'sonic-lyrics-protection-v785',version:1,mode:lyricsModeV785 as LyricsModeV785,
          environment:result.environment,assets:{hashes:verified.hashes,mode:result.assets.mode},
          config:{passes,sampleFrames,warmupFrames,timeline:'scripted-shots-240f-v784',sampling:'projected-3d-glyph-bounds-v785'},scenes:lyricsScenesV785};
      }
      if(o.motionV781){
        lastMotionReportV781.current={format:'sonic-motion-smoothness-v781',version:1,profile:profileId,
          environment:result.environment,assets:{hashes:verified.hashes,mode:result.assets.mode},
          config:{passes,sampleFrames,warmupFrames,cue:'deterministic-synthetic-beat-v1',sampling:'post-mixer-world-bones-v1',frameRateHint:60},
          scenes:motionScenesV781};
      }
      setReport(result);setRunState('done');return result;
    }catch(e){setRunState('error: '+String(e));throw e;}finally{collector.current.enabled=false;collector.current.motionEnabledV781=false;collector.current.motionSessionV781=false;collector.current.cameraEnabledV784=false;collector.current.lyricsEnabledV785=false;collector.current.governorEnabledV788=false;active.current=false}
  },[urls,profileId,profileOpted,motionModeV781,interpolationModeV782,lipModeV783,cameraModeV784,lyricsModeV785,governorModeV788,governorTargetV788]);
  const captureV780=useCallback(async(o:{stage:string;avatars:2|4;frame:number}):Promise<VisualCaptureV780>=>{
    if(!visualModeV780||!hostAllowed())throw Error('V780 nur im lokalen Visual-Benchmark');
    if(active.current)throw Error('Ein Benchmark läuft bereits');
    const chosen=CONCERT_CASES_V777.find(c=>c.stage===o.stage&&c.avatarCount===o.avatars);
    if(!chosen)throw Error('Ungültige V780-Szene');
    normalizeVisualFramesV780([o.frame]);
    if(invalidPath.current)throw Error(invalidPath.current);
    active.current=true;setRunState('capturing');
    try{
      const assets=await assetChecksV777(urls);
      failed.current=null;readiness.current.clear();
      collector.current.enabled=false;collector.current.visualFrameV780=o.frame;
      setCaseName(chosen);setCycle(x=>x+1);
      let pending=0;
      while(readiness.current.size<o.avatars||!lyricsSynced.current){
        if(failed.current)throw Error('GLB-Fehler: '+failed.current);
        if(++pending>1200)throw Error('GLB/Lyrics nicht bereit: '+chosen.id);
        await nextFrame();
      }
      // All draw systems receive the same frozen logical frame. Await text glyph sync
      // and THREE renderer passes before reading the actual WebGL canvas bitmap.
      await frameWait(20);
      if(failed.current)throw Error(failed.current);
      const canvas=document.querySelector('canvas');
      if(!(canvas instanceof HTMLCanvasElement)||canvas.width!==960||canvas.height!==540)
        throw Error('Erwarteter 960x540-WebGL-Canvas fehlt');
      const dataUrl=canvas.toDataURL('image/png');
      if(!dataUrl.startsWith('data:image/png;base64,')||dataUrl.length<2000)throw Error('PNG leer oder WebGL-Export gesperrt');
      return {format:'sonic-visual-capture-v780',profile:profileId,stage:chosen.stage,avatars:o.avatars,frame:o.frame,
        renderer:identity.current.renderer,viewport:identity.current.viewport,
        assetMode:urls.length===1&&urls[0]===V777_REFERENCE_GLB?'reference':'user-glb',hashes:assets.hashes,dataUrl};
    }finally{
      // No persistent fixture settings, timers or GPU resources remain after capture.
      collector.current.visualFrameV780=undefined;active.current=false;setRunState('ready');
    }
  },[visualModeV780,urls,profileId]);
  const refCaptureV780=useRef(captureV780);refCaptureV780.current=captureV780;
  const refRun=useRef(run);refRun.current=run;const refState=useRef(runState);refState.current=runState;const refProfile=useRef(profileId);refProfile.current=profileId;
  useEffect(()=>{if(!allowed)return;window.__sonicV777={run:o=>refRun.current(o),state:()=>refState.current,profile:()=>refProfile.current};return()=>{delete window.__sonicV777}},[allowed]);
  useEffect(()=>{if(!allowed||!visualModeV780)return;window.__sonicV780={capture:o=>refCaptureV780.current(o),state:()=>refState.current};return()=>{delete window.__sonicV780}},[allowed,visualModeV780]);
  useEffect(()=>{if(!allowed||cameraModeV784===null)return;window.__sonicV784={report:()=>lastCameraReportV784.current,state:()=>refState.current};return()=>{delete window.__sonicV784}},[allowed,cameraModeV784]);
  useEffect(()=>{if(!allowed||lyricsModeV785===null)return;window.__sonicV785={report:()=>lastLyricsReportV785.current,state:()=>refState.current};return()=>{delete window.__sonicV785}},[allowed,lyricsModeV785]);
  useEffect(()=>{if(!allowed||governorModeV788===null)return;window.__sonicV788={report:()=>lastGovernorReportV788.current,state:()=>refState.current};return()=>{delete window.__sonicV788}},[allowed,governorModeV788]);
  useEffect(()=>{if(!allowed||!motionModeV781)return;window.__sonicV781={report:()=>lastMotionReportV781.current,state:()=>refState.current};return()=>{delete window.__sonicV781}},[allowed,motionModeV781]);
  if(!allowed)return <main><h1>V777 Concert Benchmark</h1><p>Nur auf localhost mit ?concertBenchV777=1 aktiv.</p></main>;
  const save=()=>{if(!report)return;const link=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=link;a.download='sonic-v777-concert-benchmark.json';a.click();setTimeout(()=>URL.revokeObjectURL(link),1000)};
  return <main style={{padding:16,minHeight:'100vh',background:'#101624',color:'#eff8ff',fontFamily:'system-ui'}}>
    <h1>V777 · GLB-Konzertbenchmark</h1>
    <p><a href="/diagnostics/concert-quality">V778 Quality Advisor</a> · <a href="/diagnostics/concert-profiles">V779 Qualitätsprofile</a> · V780 visuelle Vergleichsaufnahmen · V781 Bewegungsanalyse · V782 GLB-Pose-Interpolation · V783 Lip-Sync Guard · <a href="/diagnostics/camera-smoothness">V784 Kamera-Smoothness</a> · <a href="/diagnostics/lyrics-protection">V785 Lyrics-Schutz</a> · <a href="/diagnostics/concert-governor">V788 Concert Governor</a> (lokale Opt-ins)</p>
    <p>3 echte Bühnen · 2 und 4 GLB-Avatare · AnimationMixer · benannte Mund-Morphs · 3D-Lyrics · Licht · DanceFX · 960 × 540 / DPR 1.</p>
    <p>Audio und Text sind <strong>deterministische Testsignale, keine Spotify-/Mikrofonmessungen.</strong> Die mitgelieferte 38-KB-Referenz-GLB ist kein realistischer Hardware-Maßstab.</p>
    <p>GLB: {urls.join(' + ')} · Szene: {caseName.id} · Qualitätsprofil: {profile.label} (V779) · Governor V788: {governorModeV788??'aus'} · Budget: {governorBudgetV788.name} · Interpolation V782: {interpolationModeV782??'Legacy'} </p>
    <div style={{width:960,maxWidth:'100%',height:540}}>
      <Canvas style={{width:'100%',height:'100%'}} dpr={1} frameloop="always" camera={{position:[0,.2,8],fov:45}}
        gl={{antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:visualModeV780}} shadows={false}>
        <ProbeV777 data={collector} identity={identity} audio={audio}/>
        {governorModeV788!==null&&<ConcertGovernorProbeV788 clock={collector} cycle={cycle} mode={governorModeV788 as GovernorModeV788} target={governorTargetV788} onLevel={setGovernorLevelV788}/>}
        {cameraModeV784!==null&&<CameraDirectorBenchmarkV784 clock={collector} mode={cameraModeV784 as CameraModeV784} avatars={caseName.avatarCount} cycle={cycle}/>}
        <ambientLight intensity={1}/><directionalLight intensity={1.5} position={[2,5,6]}/>
        <StageEnvironment theme={caseName.stage as StageEnvironmentId} audio={audio} isPlaying reducedMotion={effectiveStageV788.stageReducedMotion} reactive={effectiveStageV788.stageReactive}/>
        <DynamicStage theme={caseName.stage} audio={audio} isPlaying reducedMotion={profile.stageReducedMotion} strength={effectiveStageV788.stageStrength} reactive={effectiveStageV788.stageReactive}/>
        <DanceFX audio={audio} isPlaying reducedMotion={false} settings={effectiveStageV788.danceFx}/>
        <Suspense fallback={null}><LyricCardsV777 clock={collector} onReady={onLyricsReady} modeV785={lyricsModeV785 as LyricsModeV785|null} avatars={caseName.avatarCount} cycle={cycle}/></Suspense>
        <GlbErrorBoundaryV777 fail={onFail}>
          <Suspense fallback={null}>
            {Array.from({length:caseName.avatarCount},(_,i)=><PerformerV777 key={i+'-'+urls[i%urls.length]}
              slot={i} count={caseName.avatarCount} url={urls[i%urls.length]} clock={collector} cycle={cycle} animationStride={profile.animationStride} interpolationV782={interpolationV782} lipGuardV783={lipGuardV783} onReady={onReady}/>)}
          </Suspense>
        </GlbErrorBoundaryV777>
      </Canvas>
    </div>
    <p data-v777-state={runState}>Status: {runState}</p>
    <button disabled={runState==='running'} onClick={()=>void run().catch(()=>{})}>Konzertbenchmark starten</button>
    {' '}<button disabled={!report} onClick={save}>JSON exportieren</button>
    {report&&<table><thead><tr>{['Szene','FPS','P95 ms','Draw Calls','Dreiecke','Geometrien','Texturen'].map(h=><th key={h} style={{padding:8}}>{h}</th>)}</tr></thead><tbody>
      {report.scenes.map(s=><tr key={s.id}>{[s.id,s.fps,s.p95Ms,s.avgCalls,s.avgTriangles,s.maxGeometries,s.maxTextures].map((v,i)=><td key={i} style={{padding:8,textAlign:i?'right':'left'}}>{v}</td>)}</tr>)}
    </tbody></table>}
  </main>;
}
