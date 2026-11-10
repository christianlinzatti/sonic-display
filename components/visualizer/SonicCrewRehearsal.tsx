'use client';
import {newShowAudit,sampleShowAudit} from '@/lib/showQualityAudit';
import {crewConversation} from '@/lib/crewConversation';
import {collectAvatarRigNodes} from './avatarRigController';
import {initializeFootIK,updateFootIK} from './avatarFootIK';
import {planNaturalDancePerformanceV630} from './naturalDancePerformanceV630';
import {previewSampleV1136,type ShowClockV1136} from '@/lib/showContinuityV1136';
import {SonicFootContactV1135} from './SonicFootContactV1135';
import {useConcertStoryV1131} from './useConcertStoryV1131';
import type {Lyrics} from '@/types/playbackCore';
import {useThree} from '@react-three/fiber';
import {useState} from 'react';
import {Suspense,useEffect,useMemo,useRef} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import {AnimationMixer,Vector3} from 'three';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {useOwnedAvatarResourcesV1009} from './useOwnedAvatarResourcesV1009';
import {usePreviewGltfCacheV654} from './usePreviewGltfCacheV654';
import {disposeClonedAvatarSkeletonsV654} from './disposeClonedAvatarSkeletonsV654';
import {ModelPreviewBoundaryV733} from './ModelPreviewBoundaryV733';
import {PreviewClipPlayer} from './previewClipPlayer';
import {newCrewState,stepCrew,crewClipTime,type CrewSettings} from './sonicCrewDirector';
import {prepareCrewReaction,applyCrewReaction} from './sonicCrewReaction';
export type CrewScenario={section:string;genre:string;energy:number;bpm:number;lyrics?:Lyrics|null;durationMs?:number;trackId?:string};
export type CrewReading={slot:number;clip:string;time:number;leader:boolean;role?:string;chapter?:string;persona?:string;sequence?:string;bodyStyle?:string;contact?:number;evaluatedClip?:string;answerStyle?:string;quality?:{samples:number;plantedSeconds:number;slideSeconds:number;abruptMoves:number}};
import {getAvatarModel} from './avatarModels';
function Clock({clock,playing,maxSeconds}:{clock:{current:number};playing:boolean;maxSeconds:number}){useFrame((_,dt)=>{if(playing)clock.current=Math.min(maxSeconds,clock.current+Math.min(dt,.1));});return null;}
function Performer({slot,modelId,clock,playing,settings,scenario,onReading}:{slot:number;modelId:string;clock:{current:number};playing:boolean;settings:CrewSettings;scenario:CrewScenario;onReading:(reading:CrewReading)=>void}){
 const url=getAvatarModel(modelId).url!,{scene,animations}=useGLTF(url);
 usePreviewGltfCacheV654(url);
 const model=useMemo(()=>clone(scene),[scene]);useOwnedAvatarResourcesV1009(model);
 const mixer=useMemo(()=>new AnimationMixer(model),[model]);
 const player=useMemo(()=>new PreviewClipPlayer(mixer,model),[mixer,model]);
 const reaction=useMemo(()=>prepareCrewReaction(model),[model]);
 const feetV1135=useMemo(()=>['LeftFoot','RightFoot'].map(name=>({node:model.getObjectByName(name),point:new Vector3()})),[model]);
 const targets=useMemo(()=>collectAvatarRigNodes(model).targets,[model]);
 const ik=useMemo(()=>({current:initializeFootIK(model,targets)}),[model,targets]),audit=useRef(newShowAudit());
 const hips=useMemo(()=>({node:model.getObjectByName('Hips'),point:new Vector3()}),[model]);
 const sampledClockV1136=useRef<ShowClockV1136|null>(null);
 const state=useRef(newCrewState()),selected=useRef(''),time=useRef(0),lastReport=useRef(-1);
 useEffect(()=>()=>{player.dispose();mixer.stopAllAction();mixer.uncacheRoot(model);disposeClonedAvatarSkeletonsV654(model);},[player,mixer,model]);
 useFrame((frame,dt)=>{
  const point={source:scenario.trackId??'sonic-crew-rehearsal',positionMs:clock.current*1000};
  const sample=previewSampleV1136(sampledClockV1136.current,point,playing);
  // Explicit paused scrubs reconstruct the beat; provider jitter tolerance is for live playback.
  const next=stepCrew(!playing&&sample.cut?newCrewState():state.current,{...scenario,section:scenario.section==='auto'?undefined:scenario.section,modelId,clips:animations,trackId:scenario.trackId??'sonic-crew-rehearsal',progressMs:clock.current*1000,slot,count:3,playing:sample.sample,reducedMotion:false,manualPriority:false,settings});
  state.current=next.state;
  if(next.plan.active){
   const clip=animations.find(c=>c.name===next.plan.clip);
   if(clip){
    const target=crewClipTime(next.plan,clip.duration);
    if(selected.current!==clip.name){
     const transition=planNaturalDancePerformanceV630({outgoing:animations.find(c=>c.name===selected.current),incoming:clip,outgoingSeconds:time.current,incomingSeconds:target,baseSeconds:.55,bpm:scenario.bpm,plantedLeft:ik.current.left?.contact.phase==='planted',plantedRight:ik.current.right?.contact.phase==='planted',rapidSwitch:false,automatic:true,playing,reducedMotion:false});
     player.select(clip,target,sample.cut?0:transition.fadeSeconds);selected.current=clip.name;
    }
    if(sample.cut)player.seek(target);
    time.current=target;
   }
  }
  if(sample.sample)sampledClockV1136.current=point;
  player.update(time.current,playing?Math.min(dt,.1):0);
  if(sample.cut){ik.current=initializeFootIK(model,targets);audit.current.last=undefined;}
  updateFootIK(ik.current,model,dt,playing&&next.plan.active,.7,.55,.65,undefined,undefined,undefined,{trackId:point.source,playheadMs:point.positionMs},{enabled:true,intensity:.55});
  if(playing&&next.plan.active){
   const [left,right]=feetV1135.map(f=>f.node?.getWorldPosition(f.point));
   sampleShowAudit(audit.current,{time:clock.current,hips:hips.node?.getWorldPosition(hips.point).clone(),left:left?.clone(),right:right?.clone(),leftPlanted:ik.current.left?.contact.phase==='planted'&&(ik.current.left?.contact.confidence??0)>.6,rightPlanted:ik.current.right?.contact.phase==='planted'&&(ik.current.right?.contact.confidence??0)>.6});
  }else audit.current.last=undefined;
  applyCrewReaction(reaction,playing?next.plan:{...next.plan,active:false},next.plan.beat,scenario.energy,dt);
  if(frame.clock.elapsedTime-lastReport.current>.35){lastReport.current=frame.clock.elapsedTime;const contact=Math.min(...feetV1135.filter(f=>!!f.node).map(f=>f.node!.getWorldPosition(f.point).y+1-.12));onReading({answerStyle:crewConversation(next.plan,next.plan.beat).style,quality:{samples:audit.current.samples,plantedSeconds:audit.current.plantedSeconds,slideSeconds:audit.current.slideSeconds,abruptMoves:audit.current.abruptMoves},evaluatedClip:selected.current,contact:Number.isFinite(contact)?contact:undefined,slot,clip:playing&&next.plan.active?selected.current:'Pausiert',time:time.current,leader:next.plan.leader===slot,role:next.plan.interaction?.role,chapter:next.plan.story?.chapter,persona:next.plan.persona?.label,sequence:next.plan.sequence?.label,bodyStyle:next.plan.bodyStyle});}
 });
 return <group position={[(slot-1)*1.4,0,0]}><primitive object={model}/><SonicFootContactV1135 model={model} floorY={-1}/></group>;
}
function RehearsalLightsV1131({clock,scenario,playing}:{clock:{current:number};scenario:CrewScenario;playing:boolean}){
 const [position,setPosition]=useState(clock.current),last=useRef(-1);
 useFrame(({clock:frameClock})=>{if(frameClock.elapsedTime-last.current>.35){last.current=frameClock.elapsedTime;setPosition(clock.current);}});
 const story=useConcertStoryV1131({...scenario,section:scenario.section==='auto'?undefined:scenario.section,progressMs:position*1000,count:3},false);
 return <><ambientLight intensity={1.3}/><directionalLight color={story?.palette??'#ffffff'} position={[3,5,4]} intensity={playing?(story?.lightGain??1)*2:2}/></>;
}
export default function SonicCrewRehearsal(props:{modelIds:string[];clock:{current:number};playing:boolean;settings:CrewSettings;scenario:CrewScenario;onReading:(reading:CrewReading)=>void}){
 return <ModelPreviewBoundaryV733 onRetry={()=>props.modelIds.forEach(id=>{const url=getAvatarModel(id).url;if(url)useGLTF.clear(url);})}><div style={{height:320,border:'1px solid #ffffff33',borderRadius:12,overflow:'hidden'}} role="img" aria-label="Simulierte Sonic-Crew-Show mit drei echten GLB-Modellen">
  <Canvas camera={{position:[0,.2,6.2],fov:40}} dpr={[1,1.3]}>
   <RehearsalLightsV1131 clock={props.clock} scenario={props.scenario} playing={props.playing}/>
   <mesh position={[0,-1.008,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[3.4,48]}/><meshStandardMaterial color="#131b2b" roughness={.84} metalness={.08}/></mesh>
   <Clock clock={props.clock} playing={props.playing} maxSeconds={Math.max(120,Math.min(3600,(props.scenario.durationMs??120000)/1000))}/>
   <Suspense fallback={null}>{props.modelIds.slice(0,3).map((id,slot)=><Performer key={`${slot}-${id}`} modelId={id} slot={slot} {...props}/>)}</Suspense>
   <OrbitControls target={[0,0,0]} enablePan={false} minDistance={3.8} maxDistance={10}/>
  </Canvas>
 </div></ModelPreviewBoundaryV733>;
}
