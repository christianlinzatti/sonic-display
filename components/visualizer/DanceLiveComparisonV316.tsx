"use client";
/** V316: independent WebGL A/B stages. Both use one clock and the same sampled
 * beat, then run the real V306/307/310/311 quality algorithms with independent
 * state. Never reads or writes live-stage preferences inside Canvas. */
import {Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject} from 'react';
import {createPortal} from 'react-dom';
import {Canvas,useFrame} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {AnimationMixer,Box3,Vector3,type AnimationClip,type Group,type MeshBasicMaterial,type PointLight,type Object3D} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {retargetHumanoidClips,readRetargetCalibration} from './avatarAnimationRetarget';
import {loadCharacterMotionStore,CHARACTER_MOTION_CHANGE_EVENT,type InstalledCharacterMotion} from './characterMotionLibrary';
import {clipBlendV317,comparisonMotionSourcesV317,fadeSecondsV317,plantedFootV317,validComparisonClipsV317,type MotionClipInfoV317} from './realMotionComparisonV317';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {getAvatarModel} from './avatarModels';
import {collectAvatarRigNodes,applyAvatarRigMotion,type AvatarRigTargets,type AvatarRigMotion} from './avatarRigController';
import {createDanceQualityState,enhanceDanceQuality} from './danceQualityV307';
import {createAdvancedDanceStateV311,refineDancePerformanceV311} from './advancedDancePerformanceV311';
import {initialShowState,advanceShowState,createShowCue} from './ultimateShowDirectorV306';
import {initialShowQualityV310,advanceShowQualityV310,applyShowQualityV310} from './smartShowQualityV310';
import {demoRigMotionV316,demoSampleV316,demoSectionLabelV316,prepareComparisonV316,previewBpmV316,
  type ComparisonGenreV316} from './danceComparisonHelpersV316';
import type {ImprovementSettingsV315,ImprovementSuggestionV315} from './danceImprovementAssistantV315';

type PlaybackClock={running:boolean;startMs:number;heldSeconds:number;revision:number};
const timeAt=(c:PlaybackClock)=>c.heldSeconds+(c.running?Math.max(0,performance.now()-c.startMs)/1000:0);
type Report={section:string;shot:string;fx:number;contact?:string};
type ClipControllerV317={rig:AvatarRigTargets;sample:(seconds:number,polish:number,dt:number)=>{left:boolean;right:boolean};};
type ComparisonModeV317='real'|'synthetic';

/** Remove previously applied relative overlays before sampling the authored clip.
 * This also prevents accumulation on rigs where a particular joint has no track. */
function resetRealOverlayV317(overlay:Map<Object3D,[number,number,number]>) {
  for(const [joint,[x,y,z]] of overlay){joint.rotation.x-=x;joint.rotation.y-=y;joint.rotation.z-=z;}
  overlay.clear();
}
function overlayRealMotionV317(rig:AvatarRigTargets,motion:AvatarRigMotion,overlay:Map<Object3D,[number,number,number]>) {
  const add=(key:keyof AvatarRigTargets,axis:0|1|2,value:number)=>{
    const joint=rig[key];if(!joint||!Number.isFinite(value))return;
    const safe=Math.max(-.45,Math.min(.45,value))*.46;
    const last=overlay.get(joint)??[0,0,0];last[axis]+=safe;overlay.set(joint,last);
    if(axis===0)joint.rotation.x+=safe;else if(axis===1)joint.rotation.y+=safe;else joint.rotation.z+=safe;
  };
  add('head',0,motion.headNod+motion.headLag);add('head',1,motion.headTurn);
  add('spine',2,motion.spineSway+motion.shoulderRoll*.3);add('spine',1,motion.torsoTwist??0);
  add('hips',1,motion.hipSway+(motion.hipCounter??0));
  add('leftArm',2,motion.armSwing+(motion.leftArmAccent??0));
  add('rightArm',2,-motion.armSwing+(motion.rightArmAccent??0));
  add('leftLeg',0,motion.legGroove+(motion.kneeFollow??0));add('rightLeg',0,motion.legGroove-(motion.kneeFollow??0));
  add('leftFoot',0,motion.footStep);add('rightFoot',0,-motion.footStep);
}

const genres:ComparisonGenreV316[]=['Hardtekk','Deutschrap','Cinematic'];

/** Lightweight labelled humanoid with actual adjustable pivot joints. */
function DemoHumanoid(){
  const skin='#dfae94',suit='#654ac8',cloth='#293555';
  return <group name="DemoHumanoid">
    <group name="Hips" position={[0,1.15,0]}>
      <mesh><boxGeometry args={[.58,.30,.28]}/><meshStandardMaterial color={cloth}/></mesh>
      <group name="Spine" position={[0,.24,0]}>
        <mesh position={[0,.28,0]}><boxGeometry args={[.77,.77,.36]}/><meshStandardMaterial color={suit} roughness={.58}/></mesh>
        <group name="Chest" position={[0,.68,0]}>
          <mesh><boxGeometry args={[.83,.19,.42]}/><meshStandardMaterial color={suit}/></mesh>
        </group>
        <group name="Neck" position={[0,.83,0]}>
          <mesh><cylinderGeometry args={[.105,.11,.23,10]}/><meshStandardMaterial color={skin}/></mesh>
          <group name="Head" position={[0,.28,0]}>
            <mesh><sphereGeometry args={[.23,18,16]}/><meshStandardMaterial color={skin}/></mesh>
            <mesh position={[0,.135,-.013]}><sphereGeometry args={[.23,18,12,0,Math.PI*2,0,.95]}/><meshStandardMaterial color="#231e38"/></mesh>
            <mesh position={[-.079,.022,.20]}><sphereGeometry args={[.016,8,8]}/><meshBasicMaterial color="#1a1531"/></mesh>
            <mesh position={[.079,.022,.20]}><sphereGeometry args={[.016,8,8]}/><meshBasicMaterial color="#1a1531"/></mesh>
          </group>
        </group>
        <group name="LeftArm" position={[-.49,.66,0]} rotation={[0,0,-.13]}>
          <mesh position={[0,-.34,0]}><capsuleGeometry args={[.115,.42,6,10]}/><meshStandardMaterial color={skin}/></mesh>
          <group name="LeftForeArm" position={[0,-.66,0]}><mesh position={[0,-.24,0]}><capsuleGeometry args={[.098,.29,6,10]}/><meshStandardMaterial color={skin}/></mesh></group>
        </group>
        <group name="RightArm" position={[.49,.66,0]} rotation={[0,0,.13]}>
          <mesh position={[0,-.34,0]}><capsuleGeometry args={[.115,.42,6,10]}/><meshStandardMaterial color={skin}/></mesh>
          <group name="RightForeArm" position={[0,-.66,0]}><mesh position={[0,-.24,0]}><capsuleGeometry args={[.098,.29,6,10]}/><meshStandardMaterial color={skin}/></mesh></group>
        </group>
      </group>
      <group name="LeftLeg" position={[-.21,-.18,0]}>
        <mesh position={[0,-.45,0]}><capsuleGeometry args={[.15,.57,6,12]}/><meshStandardMaterial color={cloth}/></mesh>
        <group name="LeftFoot" position={[0,-1.01,.11]}><mesh position={[0,-.09,.13]}><boxGeometry args={[.29,.18,.50]}/><meshStandardMaterial color="#131b31"/></mesh></group>
      </group>
      <group name="RightLeg" position={[.21,-.18,0]}>
        <mesh position={[0,-.45,0]}><capsuleGeometry args={[.15,.57,6,12]}/><meshStandardMaterial color={cloth}/></mesh>
        <group name="RightFoot" position={[0,-1.01,.11]}><mesh position={[0,-.09,.13]}><boxGeometry args={[.29,.18,.50]}/><meshStandardMaterial color="#131b31"/></mesh></group>
      </group>
    </group>
  </group>;
}

function ModelHumanoid({url,onReady}:{url:string;onReady:(targets:AvatarRigTargets)=>void}){
  const {scene}=useGLTF(url);
  const clone=useMemo(()=>cloneSkinnedScene(scene),[scene]);
  const transform=useMemo(()=>{
    const box=new Box3().setFromObject(clone);const size=new Vector3(),center=new Vector3();
    box.getSize(size);box.getCenter(center);
    const factor=Math.max(.03,Math.min(5,2.8/Math.max(.1,size.y)));
    return {scale:factor,position:[-center.x*factor,-box.min.y*factor,-center.z*factor] as [number,number,number]};
  },[clone]);
  const rig=useMemo(()=>collectAvatarRigNodes(clone,'auto').targets,[clone]);
  useEffect(()=>{if(rig.head && (rig.leftArm||rig.rightArm))onReady(rig);},[rig,onReady]);
  if(!rig.head || !(rig.leftArm||rig.rightArm))return <DemoHumanoid/>;
  return <group scale={transform.scale} position={transform.position}><primitive object={clone}/></group>;
}
class ModelFallback extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<DemoHumanoid/>:this.props.children;}
}

/** Real V317 playback uses the same independent cloned GLB on each stage,
 * the actual embedded or retargeted imported AnimationClips, and a shared seek clock. */
function RealGLBMotionV317({url,motionUrl,clipId,secondClipId,onReady,onCatalog}:{url:string;motionUrl:string|null;
  clipId:string;secondClipId:string;onReady:(controller:ClipControllerV317|null)=>void;onCatalog:(clips:MotionClipInfoV317[])=>void}){
  const {scene,animations}=useGLTF(url);
  const cloned=useMemo(()=>cloneSkinnedScene(scene),[scene]);
  const mixer=useMemo(()=>new AnimationMixer(cloned),[cloned]);
  const [imported,setImported]=useState<AnimationClip[]>([]);
  useEffect(()=>{
    let current=true;setImported([]);
    if(motionUrl)new GLTFLoader().loadAsync(motionUrl).then(gltf=>{
      if(!current)return;
      const result=retargetHumanoidClips(gltf.animations,gltf.scene,cloned,readRetargetCalibration(url));
      setImported(result.clips);
    }).catch(()=>{if(current)setImported([]);});
    return()=>{current=false};
  },[motionUrl,cloned,url]);
  const all=useMemo(()=>motionUrl?imported.map((clip,index)=>({id:`external:${index}`,clip})):
    animations.map((clip,index)=>({id:`embedded:${index}`,clip})),[motionUrl,imported,animations]);
  const catalog=useMemo(()=>validComparisonClipsV317(all.map(({id,clip})=>({id,name:clip.name||`Motion ${id}`,duration:clip.duration}))),[all]);
  const selection=all.find(c=>c.id===clipId&&catalog.some(x=>x.id===c.id))??
    all.find(c=>catalog.some(x=>x.id===c.id));
  const secondary=all.find(c=>c.id===secondClipId&&c.id!==selection?.id&&catalog.some(x=>x.id===c.id));
  const targets=useMemo(()=>collectAvatarRigNodes(cloned,'auto').targets,[cloned]);
  const usable=!!(targets.head&&(targets.leftArm||targets.rightArm));
  const box=useMemo(()=>{const bounds=new Box3().setFromObject(cloned),size=new Vector3(),center=new Vector3();
    bounds.getSize(size);bounds.getCenter(center);
    const scale=Math.max(.03,Math.min(5,2.8/Math.max(.1,size.y)));
    return {scale,translation:[-center.x*scale,-bounds.min.y*scale,-center.z*scale] as [number,number,number]};
  },[cloned]);
  const callbackRef=useRef({onReady,onCatalog});callbackRef.current={onReady,onCatalog};
  useEffect(()=>{callbackRef.current.onCatalog(catalog);},[catalog]);
  useEffect(()=>{
    mixer.stopAllAction();
    if(!usable||!selection){callbackRef.current.onReady(null);return;}
    const a=mixer.clipAction(selection.clip);a.reset().play();
    const b=secondary?mixer.clipAction(secondary.clip):null;
    if(b)b.reset().play();
    const footState:{left:{prev:number|null;min:number};right:{prev:number|null;min:number};lastTime:number|null}={
      left:{prev:null,min:Infinity},right:{prev:null,min:Infinity},lastTime:null};
    const left=new Vector3(),right=new Vector3();
    const sample=(seconds:number,polish:number,dt:number)=>{
      const fade=b?fadeSecondsV317(selection.clip.duration,secondary!.clip.duration,polish):0;
      const blend=clipBlendV317(seconds,selection.clip.duration,secondary?.clip.duration??0,fade);
      a.time=blend.primaryTime;a.setEffectiveWeight(blend.primaryWeight);
      if(b){b.time=blend.secondaryTime;b.setEffectiveWeight(blend.secondaryWeight);}
      mixer.update(0); // samples authored tracks; the parent's additive overlay is applied AFTER this.
      if(footState.lastTime===null||seconds<footState.lastTime||seconds-footState.lastTime>1){
        footState.left={prev:null,min:Infinity};footState.right={prev:null,min:Infinity};
      }
      footState.lastTime=seconds;
      cloned.updateMatrixWorld(true);
      const measure=(joint:Object3D|undefined,state:{prev:number|null;min:number},point:Vector3)=>{
        if(!joint)return false;joint.getWorldPosition(point);
        const planted=plantedFootV317(point.y,state.prev,Math.min(state.min,point.y),dt);
        state.min=Math.min(state.min,point.y);state.prev=point.y;return planted;
      };
      return {left:measure(targets.leftFoot,footState.left,left),right:measure(targets.rightFoot,footState.right,right)};
    };
    callbackRef.current.onReady({rig:targets,sample});
    return()=>{callbackRef.current.onReady(null);a.stop();if(b)b.stop();mixer.stopAllAction();};
  },[mixer,cloned,targets,selection?.clip,secondary?.clip,usable]);
  useEffect(()=>()=>{mixer.stopAllAction();mixer.uncacheRoot(cloned);},[mixer,cloned]);
  if(!usable)return <DemoHumanoid/>;
  return <group scale={box.scale} position={box.translation}><primitive object={cloned} dispose={null}/></group>;
}

function SceneController({settings,genre,clock,modelUrl,motionUrl,clipId,secondClipId,mode,onReport,onCatalog}:{settings:ImprovementSettingsV315;genre:ComparisonGenreV316;
  clock:RefObject<PlaybackClock>;modelUrl:string|null;motionUrl:string|null;clipId:string;secondClipId:string;mode:ComparisonModeV317;onReport:(r:Report)=>void;onCatalog:(clips:MotionClipInfoV317[])=>void}){
  const dancer=useRef<Group>(null),rig=useRef<AvatarRigTargets|null>(null);
  const beam=useRef<PointLight>(null),ring=useRef<MeshBasicMaterial>(null);
  const qualityMotion=useRef(createDanceQualityState()),perfMotion=useRef(createAdvancedDanceStateV311());
  const show=useRef(initialShowState()),showQuality=useRef(initialShowQualityV310());
  const lastReport=useRef(-2),lastTime=useRef(-1),lastRevision=useRef(-1);
  const reportRef=useRef(onReport);reportRef.current=onReport;
  const real=useRef<ClipControllerV317|null>(null),overlay=useRef(new Map<Object3D,[number,number,number]>());
  const attachReal=useCallback((c:ClipControllerV317|null)=>{resetRealOverlayV317(overlay.current);real.current=c;},[]);
  const realMode=mode==='real'&&!!modelUrl;
  const realModeRef=useRef(realMode);realModeRef.current=realMode;
  useEffect(()=>{resetRealOverlayV317(overlay.current);rig.current=null;qualityMotion.current=createDanceQualityState();perfMotion.current=createAdvancedDanceStateV311();},[modelUrl,motionUrl,clipId,secondClipId,mode]);
  useFrame(({camera},delta)=>{
    const time=timeAt(clock.current);
    if(!dancer.current)return;
    // Seek while paused is a one-shot still-frame update; otherwise stop work.
    if(!clock.current.running&&lastRevision.current===clock.current.revision)return;
    if(lastRevision.current!==clock.current.revision){
      lastRevision.current=clock.current.revision;lastTime.current=-1;lastReport.current=-2;
      qualityMotion.current=createDanceQualityState();perfMotion.current=createAdvancedDanceStateV311();
      show.current=initialShowState();showQuality.current=initialShowQualityV310();
    }
    const dt=lastTime.current>=0?Math.min(.08,Math.max(0,time-lastTime.current)):Math.min(.04,delta);
    lastTime.current=time;
    const sample=demoSampleV316(time,genre);
    const input={playing:true,reducedMotion:false,delta:dt,songSeconds:time,trackId:'v316-demo',
      genre,section:sample.section,bpm:sample.bpm,beatStrength:sample.beat,kick:sample.kick,
      snare:sample.snare,energy:sample.energy,plantedLeft:sample.plantedLeft,plantedRight:sample.plantedRight};
    const realController=realModeRef.current?real.current:null;
    resetRealOverlayV317(overlay.current);
    const contacts=realController?.sample(time,settings.performance.transitionPolish,dt);
    const plantedLeft=contacts?contacts.left:sample.plantedLeft;
    const plantedRight=contacts?contacts.right:sample.plantedRight;
    let motion=enhanceDanceQuality(qualityMotion.current,demoRigMotionV316(sample),{...input,plantedLeft,plantedRight,settings:settings.dance});
    motion=refineDancePerformanceV311(perfMotion.current,motion,{settings:settings.performance,
      playing:true,reducedMotion:false,time,delta:dt,trackId:'v316-demo',genre,section:sample.section,
      bpm:sample.bpm,beat:sample.beat,kick:sample.kick,snare:sample.snare,
      plantedLeft,plantedRight,authoredClipPriority:!!realController});
    if(realController)overlayRealMotionV317(realController.rig,motion,overlay.current);
    else if(!realModeRef.current){
      if(!rig.current)rig.current=collectAvatarRigNodes(dancer.current,'auto').targets;
      applyAvatarRigMotion(rig.current,motion,dt);
    }
    // Shared source groove is identical on both sides; only V307/311 overlays differ.
    dancer.current.position.y=realModeRef.current?0:Math.max(0,Math.sin(time*sample.bpm/60*Math.PI))*.065*sample.energy;
    show.current=advanceShowState(show.current,{trackId:'v316-demo',progressMs:time*1000,playing:true,
      reducedMotion:false,genre,section:sample.section,energy:sample.energy,kick:sample.kick,
      settings:{enabled:true,style:'auto',intensity:72,camera:true,lighting:true,effects:true,formations:true}});
    const inputShow={trackId:'v316-demo',progressMs:time*1000,playing:true,reducedMotion:false,genre,
      section:sample.section,energy:sample.energy,kick:sample.kick,
      settings:{enabled:true,style:'auto' as const,intensity:72,camera:true,lighting:true,effects:true,formations:true}};
    const raw=createShowCue(show.current,inputShow);
    const qualityInput={trackId:'v316-demo',progressMs:time*1000,playing:true,reducedMotion:false,
      bpm:sample.bpm,energy:sample.energy,cue:raw,settings:settings.quality};
    showQuality.current=advanceShowQualityV310(showQuality.current,qualityInput);
    const cue=applyShowQualityV310(raw,showQuality.current,qualityInput);
    const distance=cue.cameraShot==='intimate'?4.2:cue.cameraShot==='wide'?6.2:cue.cameraShot==='rise'?5.3:5.0;
    const x=cue.cameraShot==='hero'?.65:cue.cameraShot==='groove'?.3:0;
    const y=cue.cameraShot==='rise'?2.7:cue.cameraShot==='wide'?2.05:1.9;
    const damp=1-Math.exp(-dt*1.2);
    camera.position.x+=(x-camera.position.x)*damp;
    camera.position.y+=(y-camera.position.y)*damp;
    camera.position.z+=(distance-camera.position.z)*damp;
    camera.lookAt(0,1.45,0);
    if(ring.current)ring.current.opacity=Math.min(.4,Math.max(0,cue.fxGain)*.30)*(0.5+sample.kick*.5);
    if(beam.current)beam.current.intensity=Math.min(8,Math.max(0,cue.beamGain)*2.1);
    if(time-lastReport.current>.45){lastReport.current=time;reportRef.current({section:demoSectionLabelV316(sample.section),shot:cue.cameraShot,fx:cue.fxGain,contact:realController?`${plantedLeft?'L':''}${plantedRight?'R':''}`:'–'});}
  });
  return <>
    <ambientLight intensity={1.25}/><directionalLight position={[-3,7,5]} intensity={2.25}/>
    <pointLight ref={beam} position={[1.9,3.1,1.8]} color="#ad8cff" intensity={2}/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.05,0]}><circleGeometry args={[3,40]}/><meshStandardMaterial color="#1b2033" roughness={.9}/></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.04,0]}><ringGeometry args={[.9,1.25,44]}/><meshBasicMaterial ref={ring} color="#8a70ff" transparent opacity={.15} depthWrite={false}/></mesh>
    <group ref={dancer}>{modelUrl?<ModelFallback key={`${modelUrl}:${motionUrl}:${mode}`}><Suspense fallback={<DemoHumanoid/>}>{realMode?
      <RealGLBMotionV317 url={modelUrl} motionUrl={motionUrl} clipId={clipId} secondClipId={secondClipId} onReady={attachReal} onCatalog={onCatalog}/>:<ModelHumanoid url={modelUrl} onReady={targets=>{rig.current=targets;}}/>
      }</Suspense></ModelFallback>:<DemoHumanoid/>}</group>
  </>;
}
function PreviewStage({settings,genre,clock,modelUrl,motionUrl,clipId,secondClipId,mode,title,onCatalog}:{settings:ImprovementSettingsV315;genre:ComparisonGenreV316;
  clock:RefObject<PlaybackClock>;modelUrl:string|null;motionUrl:string|null;clipId:string;secondClipId:string;mode:ComparisonModeV317;title:string;onCatalog:(clips:MotionClipInfoV317[])=>void}){
  const [report,setReport]=useState<Report>({section:'Groove',shot:'groove',fx:0});
  return <section className="dance-comparison-v316-stage" aria-label={`${title}: 3D-Tanzvorschau`}>
    <h3>{title}</h3>
    <div className="dance-comparison-v316-canvas">
      <Canvas camera={{position:[0,2.1,5.6],fov:43,near:.1,far:65}} dpr={[1,1.4]} gl={{antialias:true,powerPreference:'low-power'}}
        fallback={<div role="status">WebGL ist auf diesem Gerät nicht verfügbar.</div>}>
        <color attach="background" args={['#0e1220']}/>
        <SceneController settings={settings} genre={genre} clock={clock} modelUrl={modelUrl} motionUrl={motionUrl} clipId={clipId} secondClipId={secondClipId} mode={mode} onReport={setReport} onCatalog={onCatalog}/>
      </Canvas>
    </div>
    <div className="dance-comparison-v316-stats" aria-live="off">
      <span>{report.section}</span><span>Kamera: {report.shot}</span><span>FX: {Math.round(report.fx*100)} %</span>{mode==='real'&&<span>Fußkontakt: {report.contact||'–'}</span>}
    </div>
  </section>;
}
export function DanceLiveComparisonV316({baseline,proposals,onClose}:{baseline:ImprovementSettingsV315;
  proposals:readonly ImprovementSuggestionV315[];onClose:()=>void}){
  const result=useMemo(()=>prepareComparisonV316(baseline,proposals),[baseline,proposals]);
  const {preferences}=useUiPreferences();
  const [genre,setGenre]=useState<ComparisonGenreV316>('Hardtekk');
  const [playing,setPlaying]=useState(!preferences.reducedMotion);
  const [useModel,setUseModel]=useState(true);
  const [mode,setMode]=useState<ComparisonModeV317>('real');
  const [installed,setInstalled]=useState<InstalledCharacterMotion[]>([]);
  const [motionSourceId,setMotionSourceId]=useState('embedded');
  const [clips,setClips]=useState<MotionClipInfoV317[]>([]);
  const [clipId,setClipId]=useState('');
  const [secondClipId,setSecondClipId]=useState('');
  const clock=useRef<PlaybackClock>({running:!preferences.reducedMotion,startMs:typeof performance==='undefined'?0:performance.now(),heldSeconds:0,revision:0});
  const closeRef=useRef<HTMLButtonElement>(null),dialogRef=useRef<HTMLDivElement>(null);
  const model=useMemo(()=>getAvatarModel(preferences.avatarModelId),[preferences.avatarModelId]);
  const modelUrl=useModel&&model.url?model.url:null;
  const modelAnimationUrl='animationUrl' in model ? model.animationUrl : undefined;
  const sources=useMemo(()=>comparisonMotionSourcesV317(model.id,modelAnimationUrl,installed),[model.id,modelAnimationUrl,installed]);
  const source=sources.find(s=>s.id===motionSourceId)??sources[0];
  const motionUrl=mode==='real'?source?.url??null:null;
  const handleCatalog=useCallback((list:MotionClipInfoV317[])=>{setClips(previous=>
    JSON.stringify(previous)===JSON.stringify(list)?previous:list);},[]);
  const silentCatalog=useCallback((_list:MotionClipInfoV317[])=>{},[]);
  useEffect(()=>{const update=()=>setInstalled(loadCharacterMotionStore().motions);update();window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT,update);return()=>window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT,update);},[]);
  useEffect(()=>{setClipId(clips[0]?.id??'');setSecondClipId('');},[motionSourceId]);
  useEffect(()=>{if(clips.length&&!clips.some(c=>c.id===clipId))setClipId(clips[0].id);
    if(secondClipId&&!clips.some(c=>c.id===secondClipId))setSecondClipId('');},[clips,clipId,secondClipId]);
  const togglePlaying=()=>{const now=timeAt(clock.current);clock.current={running:!clock.current.running,startMs:performance.now(),heldSeconds:now,revision:clock.current.revision};setPlaying(clock.current.running);};
  const seekToBeat=(beat:number)=>{clock.current={running:clock.current.running,startMs:performance.now(),
    heldSeconds:beat*60/previewBpmV316(genre),revision:clock.current.revision+1};};
  const restart=()=>seekToBeat(0);
  useEffect(()=>{
    const savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';closeRef.current?.focus();
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.stopPropagation();onClose();return;}
      if(e.key!=='Tab'||!dialogRef.current)return;
      const controls=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),select:not([disabled]),input:not([disabled]),[tabindex="0"]'));
      const first=controls[0],last=controls[controls.length-1];if(!first||!last)return;
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',onKey,true);
    return()=>{document.body.style.overflow=savedOverflow;document.removeEventListener('keydown',onKey,true);};
  },[onClose]);
  useEffect(()=>{const handler=()=>{if(document.hidden&&clock.current.running){const t=timeAt(clock.current);clock.current={running:false,startMs:performance.now(),heldSeconds:t,revision:clock.current.revision};setPlaying(false);}};
    document.addEventListener('visibilitychange',handler);return()=>document.removeEventListener('visibilitychange',handler);},[]);
  if(typeof document==='undefined')return null;
  return createPortal(<div className="dance-comparison-v316-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="dance-comparison-v316-dialog" role="dialog" aria-modal="true" aria-labelledby="dance-comparison-title" ref={dialogRef}>
      <header><div><small>SONIC DISPLAY · LIVE 3D A/B</small><h2 id="dance-comparison-title">Real Motion Comparison Studio · V317</h2>
        <p>Zwei unabhängige WebGL-Bühnen mit synchronisierten Original-GLB-Clips. Nur die rechte Seite erhält die vorgeschlagenen Verfeinerungen.</p></div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="3D-Vergleich schließen">✕</button></header>
      {!result.ok?<p role="alert">{result.reason}</p>:<>
      <div className="dance-comparison-v316-toolbar">
        <label>Demo-Rhythmus <select value={genre} onChange={e=>{setGenre(e.target.value as ComparisonGenreV316);restart();}}>{genres.map(g=><option key={g} value={g}>{g} · {previewBpmV316(g)} BPM</option>)}</select></label>
        <button type="button" onClick={togglePlaying} aria-pressed={playing} disabled={preferences.reducedMotion}>{playing?'Pausieren':'Abspielen'}</button>
        <button type="button" onClick={restart}>Von vorn</button>
        <button type="button" onClick={()=>seekToBeat(72)}>Zum Break</button>
        <button type="button" onClick={()=>seekToBeat(104)}>Zum Drop</button>
        {model.url&&<label className="setting-check"><input type="checkbox" checked={useModel} onChange={e=>{setUseModel(e.target.checked);restart();}}/> Ausgewähltes GLB-Modell</label>}
        <label>Modus <select value={mode} onChange={e=>{setMode(e.target.value as ComparisonModeV317);restart();}}><option value="real">Echte GLB-Motion</option><option value="synthetic">Synthetische Demo</option></select></label>
      </div>
      {mode==='real'&&modelUrl&&<div className="dance-comparison-v317-motionbar">
        <label>Animationsquelle <select value={source?.id??'embedded'} onChange={e=>{setMotionSourceId(e.target.value);setClips([]);setClipId('');setSecondClipId('');restart();}}>
          {sources.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Clip <select value={clipId} onChange={e=>{setClipId(e.target.value);setSecondClipId('');restart();}} disabled={!clips.length}>
          {clips.length?clips.map(c=><option key={c.id} value={c.id}>{c.name} · {c.duration.toFixed(1)} s</option>):<option value="">Kein passender Clip</option>}</select></label>
        <label>Optionaler Übergang <select value={secondClipId} onChange={e=>{setSecondClipId(e.target.value);restart();}} disabled={clips.length<2}>
          <option value="">Nur ausgewählten Clip loopen</option>{clips.filter(c=>c.id!==clipId).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <small>{clips.length?`${clips.length} echte Clips verfügbar. Beide Bühnen verwenden exakt dieselbe Animationszeit.`:
          'Keine verwendbaren GLB-Clips erkannt. Wähle eine installierte Animation oder den synthetischen Demo-Modus.'}</small>
      </div>}
      {mode==='real'&&!modelUrl&&<p role="status">Kein GLB-Avatar ausgewählt. Bitte ein Modell aktivieren oder den Demo-Modus nutzen.</p>}
      <div className="dance-comparison-v316-grid">
        <PreviewStage title="Bisher · Original" settings={result.before} genre={genre} clock={clock} modelUrl={modelUrl} motionUrl={motionUrl} clipId={clipId} secondClipId={secondClipId} mode={mode} onCatalog={handleCatalog}/>
        <PreviewStage title="Vorschlag · Vorschau" settings={result.after} genre={genre} clock={clock} modelUrl={modelUrl} motionUrl={motionUrl} clipId={clipId} secondClipId={secondClipId} mode={mode} onCatalog={silentCatalog}/>
      </div>
      <p className="dance-comparison-v316-differences"><strong>Im Vergleich:</strong> {proposals.map(s=>`${s.title} (${s.before} → ${s.after})`).join(' · ')}</p>
      <small>V317 spielt im Modus „Echte GLB-Motion“ eingebettete oder per bestehender Humanoid-Retargeting-Funktion importierte Clips in beiden Ansichten synchron ab. V307/V311 verändern nur die additive Ebene und optionale A/B-Clip-Überblendung, <strong>nicht die Quelldatei oder die Roh-Keyframes</strong>. Die Musik ist weiterhin ein <strong>synthetischer Beat</strong>, nicht der Spotify-Song. Fußkontakt ist eine Schätzung aus Clip-Bewegungen, keine vollständige IK-Simulation. Nicht kompatible Rigs fallen auf die Demofigur zurück; ohne Clip gibt es keinen vorgetäuschten Originaltanz. Der Vergleich bleibt eine qualitative Vorschau.</small>
      </>}
      <footer><span>Keine Einstellungen geändert · {result.ok?result.changed:0} Vorschläge</span><button type="button" onClick={onClose}>Vorschau schließen</button></footer>
    </div>
  </div>,document.body);
}
