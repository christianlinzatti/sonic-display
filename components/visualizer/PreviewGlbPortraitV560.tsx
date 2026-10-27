"use client";
import {Suspense,useEffect,useMemo,useRef,type ReactNode,Component} from 'react';
import {useFrame} from '@react-three/fiber';
import {VocalRigV368} from './VocalRigV368';
import {scanFacialRigV370,bindingsForFacialProfileV370,type FacialProfileV370} from './facialRigStudioV370';
import type {AudioFeatures} from '@/types/audio';
import type {VisualizerProps} from './registry';
import {planConcertLipPreviewV561,concertLipSongClockV561,type ConcertLipSongV561,type ConcertLipPreviewModeV561} from './concertLipPreviewV561';
import {useGLTF} from '@react-three/drei';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {AnimationClip,AnimationMixer,Box3,Vector3,type Group} from 'three';
import {planEmbeddedMotionPreviewV565} from './intelligentDanceTransitionsV565';
import {preparePortraitMaterialsV560} from './applyGlbPortraitMaterialsV560';
import {useAudioMotionEngine} from '@/hooks/useAudioMotionEngine';
import {sampleDeutschrapDemoBodyV564} from './naturalDeutschrapBodyV564';

/** A load failure only affects this opt-in preview; never the settings dialog. */
function NeutralGlbPreviewV560({slotV563=0,xV563=0}:{slotV563?:number;xV563?:number}){
  return <group name={`v377-vocal-stage-slot-${slotV563}`} position={[xV563,-1.58,-.7]}>
    <mesh position={[0,1.02,0]}><capsuleGeometry args={[.3,1.2,4,12]}/><meshStandardMaterial color="#404c62" roughness={.82}/></mesh>
    <mesh position={[0,1.82,0]}><sphereGeometry args={[.24,12,10]}/><meshStandardMaterial color="#647890" roughness={.8}/></mesh>
  </group>;
}
export class GlbPreviewBoundaryV560 extends Component<{children:ReactNode;slotV563?:number;xV563?:number},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<NeutralGlbPreviewV560 slotV563={this.props.slotV563} xV563={this.props.xV563}/>:this.props.children;}
}
export type GlbLipDiagnosticsV561=Readonly<{morphs:number;mouthChannels:string[];jawBone:boolean;mouthSupported:boolean;warnings:ReadonlyArray<string>}>;
type PreviewGlbPropsV561={url:string;correct:boolean;lowTier:boolean;lipModeV561?:ConcertLipPreviewModeV561;
  playingV561?:boolean;reducedMotionV561?:boolean;songV561?:ConcertLipSongV561|null;
  profileV561?:FacialProfileV370;onDiagnosticsV561?:(value:GlbLipDiagnosticsV561)=>void;
  slotV563?:number;xV563?:number;voiceActiveV563?:boolean;lookTowardV563?:boolean;rapBodyV564?:boolean;rapBodyStrengthV564?:number;motionPreviewV565?:boolean;motionSmoothV565?:boolean;onMotionCountV565?:(n:number)=>void};
// A deliberately neutral signal in the real-song preview: this modal does NOT
// receive an actual audio analyser or infer vocals from the beat demo.
const QUIET_AUDIO_V561:AudioFeatures={bass:0,mids:0,highs:0,volume:0,beat:false,beatStrength:0,bpm:0,kick:0,snare:0,hiHat:0,energyEnvelope:0,attack:0,decay:0};
function GlbPreviewModelV560({url,correct,lowTier,lipModeV561='off',playingV561=true,reducedMotionV561=false,songV561,profileV561,onDiagnosticsV561,slotV563=0,xV563=0,voiceActiveV563=true,lookTowardV563=false,rapBodyV564=false,rapBodyStrengthV564=65,motionPreviewV565=false,motionSmoothV565=true,onMotionCountV565}:PreviewGlbPropsV561){
  const {scene,animations}=useGLTF(url);
  const rootV563=useRef<Group>(null);
  const model=useMemo(()=>{
    const clone=cloneSkinnedScene(scene);
    // Frame diverse real GLB proportions without changing original bones/animations.
    const bounds=new Box3().setFromObject(clone);
    const size=bounds.getSize(new Vector3());
    const center=bounds.getCenter(new Vector3());
    if(Number.isFinite(size.y)&&size.y>0.05){
      const scale=Math.min(4,Math.max(.03,2.12/size.y));
      clone.scale.multiplyScalar(scale);
      clone.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    }
    clone.traverse(node=>{
      if('castShadow' in node)node.castShadow=false;
      if('receiveShadow' in node)node.receiveShadow=false;
    });
    return clone;
  },[scene]);
  // V565: only an opt-in comparison of *embedded* GLB animations. Every preview
  // gets its own mixer and skinned clone; the shared cached model stays untouched.
  // Filter face/jaw/morph tracks so existing live facial rig remains independent.
  const danceClipsV565=useMemo(()=>{
    const eligible:AnimationClip[]=[];
    for(const clip of animations){
      if(eligible.length===2)break;
      if(!Number.isFinite(clip.duration)||clip.duration<=.15)continue;
      const tracks=clip.tracks.filter(track=>!/morphTargetInfluences|(?:^|[./])(?:jaw|face|mouth|lip|eye|brow)(?:[./]|$)/i.test(track.name));
      if(tracks.length>=2)eligible.push(new AnimationClip(clip.name,clip.duration,tracks));
    }
    return eligible;
  },[animations]);
  const danceMixerV565=useMemo(()=>new AnimationMixer(model),[model]);
  const danceActionsV565=useMemo(()=>danceClipsV565.map(clip=>danceMixerV565.clipAction(clip)),[danceMixerV565,danceClipsV565]);
  const danceSwitchV565=useRef(-1);
  useEffect(()=>{onMotionCountV565?.(danceClipsV565.length);},[danceClipsV565.length,onMotionCountV565]);
  useEffect(()=>()=>{danceActionsV565.forEach(a=>a.stop());danceMixerV565.stopAllAction();
    danceMixerV565.uncacheRoot(model);},[danceActionsV565,danceMixerV565,model]);
  const previewBodyMotorV564=useAudioMotionEngine({intensity:.75,protectFootIK:true});
  useEffect(()=>{previewBodyMotorV564.bindBones(model);},[model,previewBodyMotorV564.bindBones]);
  const session=useMemo(()=>preparePortraitMaterialsV560(model),[model]);
  useEffect(()=>{session.apply(correct,65,lowTier);},[session,correct,lowTier]);
  useEffect(()=>()=>session.dispose(),[session]);
  const scanV561=useMemo(()=>scanFacialRigV370(model),[model]);
  const diagnosticsV561=useMemo<GlbLipDiagnosticsV561>(()=>{
    const mouthChannels=[...new Set(bindingsForFacialProfileV370(scanV561,profileV561).map(t=>t.channel).filter((c):c is 'jaw'|'wide'|'round'|'lipsClosed'=>c==='jaw'||c==='wide'||c==='round'||c==='lipsClosed'))];
    return {morphs:scanV561.targets.length,mouthChannels,jawBone:!!scanV561.jawBone,
      mouthSupported:mouthChannels.length>0||!!scanV561.jawBone&&profileV561?.mapping?.jaw!=='none',warnings:scanV561.warnings};
  },[scanV561,profileV561]);
  useEffect(()=>{onDiagnosticsV561?.(diagnosticsV561);},[diagnosticsV561,onDiagnosticsV561]);
  const lipPlanV561=planConcertLipPreviewV561(lipModeV561,playingV561,reducedMotionV561,songV561);
  // A stable mutable frame-clock is deliberately private to the optional preview;
  // the global player state, GLB cache and live stage are never mutated.
  const lipSyncV561=useMemo<NonNullable<VisualizerProps['lipSync']>>(()=>({
    lyrics:songV561?.lyrics??null,progressMs:0,playing:false,enabled:true,strength:85,
    mode:'lyrics',style:'auto',expression:55,ensembleCountV374:1,
  }),[songV561?.trackId,songV561?.lyrics]);
  useFrame(({clock},delta)=>{
    const previewMotionV565=planEmbeddedMotionPreviewV565(clock.elapsedTime,danceActionsV565.length,
      motionPreviewV565&&!lowTier,playingV561,reducedMotionV561);
    if(!previewMotionV565.active){
      if(danceSwitchV565.current!==-1){danceActionsV565.forEach(action=>action.stop());danceSwitchV565.current=-1;}
    }else{
      const active=danceActionsV565[previewMotionV565.index];
      if(active&&danceSwitchV565.current!==previewMotionV565.segment){
        const old=danceSwitchV565.current>=0?danceActionsV565[(danceSwitchV565.current%2)]:null;
        if(!old){active.reset().setEffectiveWeight(1).play();}
        else {active.reset().setEffectiveWeight(1).fadeIn(motionSmoothV565?.58:.08).play();
          old.fadeOut(motionSmoothV565?.58:.08);}
        danceSwitchV565.current=previewMotionV565.segment;
      }
      // Run this private mixer only when enabled; do not run a new render loop.
      danceMixerV565.update(Math.min(.05,Math.max(0,delta)));
    }
    // V564: only a clearly simulated Rap demo; never invent movement from live Spotify vocals.
    const bodyPose=sampleDeutschrapDemoBodyV564(clock.elapsedTime,{
      enabled:rapBodyV564&&lipModeV561==='rap'&&!lowTier,playing:playingV561,reducedMotion:reducedMotionV561,
      voiceActive:voiceActiveV563,slot:slotV563,hook:lookTowardV563,
      intensity:rapBodyStrengthV564/100,
    });
    previewBodyMotorV564.updateMotion(QUIET_AUDIO_V561,delta,bodyPose.active,undefined,undefined,bodyPose);
    // V563: mild staged partner acknowledgment, not gaze-IK or eye tracking.
    if(rootV563.current){const destination=lookTowardV563?(slotV563===0?.09:-.09):0;
      rootV563.current.rotation.y+=(destination-rootV563.current.rotation.y)*.055;}
    if(lipPlanV561.source==='song'){
      const clock=concertLipSongClockV561(songV561,Date.now());
      lipSyncV561.progressMs=clock.progressMs;
      lipSyncV561.playing=clock.playing;
    }else lipSyncV561.playing=false;
  });
  return <group ref={rootV563} name={`v377-vocal-stage-slot-${slotV563}`} position={[xV563,-1.58,-.7]}>
    <primitive object={model}/>
    {diagnosticsV561.mouthSupported&&lipPlanV561.source!=='off'&&voiceActiveV563&&<VocalRigV368
      model={model} audio={QUIET_AUDIO_V561} reducedMotion={reducedMotionV561} avatarSlot={slotV563}
      profileV370={profileV561} trackId={songV561?.trackId??''}
      demoV370={lipPlanV561.source==='demo-rap'?'rap':lipPlanV561.source==='demo-singing'?'singing':'off'}
      lipSync={lipPlanV561.source==='song'?lipSyncV561:undefined}/>}
  </group>;
}
export function PreviewGlbPortraitV560(props:PreviewGlbPropsV561){
  const {url}=props;
  return <GlbPreviewBoundaryV560 key={`${url}:${props.slotV563??0}`} slotV563={props.slotV563} xV563={props.xV563}><Suspense fallback={<NeutralGlbPreviewV560 slotV563={props.slotV563} xV563={props.xV563}/>}>
    <GlbPreviewModelV560 {...props}/>
  </Suspense></GlbPreviewBoundaryV560>;
}
