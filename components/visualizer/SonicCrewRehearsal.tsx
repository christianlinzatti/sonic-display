'use client';
import {Suspense,useEffect,useMemo,useRef} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import {AnimationMixer} from 'three';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {useOwnedAvatarResourcesV1009} from './useOwnedAvatarResourcesV1009';
import {usePreviewGltfCacheV654} from './usePreviewGltfCacheV654';
import {disposeClonedAvatarSkeletonsV654} from './disposeClonedAvatarSkeletonsV654';
import {ModelPreviewBoundaryV733} from './ModelPreviewBoundaryV733';
import {PreviewClipPlayer} from './previewClipPlayer';
import {CREW_IDS,newCrewState,stepCrew,crewClipTime,type CrewSettings} from './sonicCrewDirector';
import {prepareCrewReaction,applyCrewReaction} from './sonicCrewReaction';
export type CrewScenario={section:string;genre:string;energy:number;bpm:number};
export type CrewReading={slot:number;clip:string;time:number;leader:boolean};
const slugs=['neon-pulse','festival-nova','chrome-beat'];
function Clock({clock,playing}:{clock:{current:number};playing:boolean}){useFrame((_,dt)=>{if(playing)clock.current=Math.min(120,clock.current+Math.min(dt,.1));});return null;}
function Performer({slot,clock,playing,settings,scenario,onReading}:{slot:number;clock:{current:number};playing:boolean;settings:CrewSettings;scenario:CrewScenario;onReading:(reading:CrewReading)=>void}){
 const url=`/avatars/sonic/${slugs[slot]}.glb`,{scene,animations}=useGLTF(url);
 usePreviewGltfCacheV654(url);
 const model=useMemo(()=>clone(scene),[scene]);useOwnedAvatarResourcesV1009(model);
 const mixer=useMemo(()=>new AnimationMixer(model),[model]);
 const player=useMemo(()=>new PreviewClipPlayer(mixer,model),[mixer,model]);
 const reaction=useMemo(()=>prepareCrewReaction(model),[model]);
 const state=useRef(newCrewState()),selected=useRef(''),time=useRef(0),lastReport=useRef(-1);
 useEffect(()=>()=>{player.dispose();mixer.stopAllAction();mixer.uncacheRoot(model);disposeClonedAvatarSkeletonsV654(model);},[player,mixer,model]);
 useFrame((frame,dt)=>{
  const next=stepCrew(state.current,{...scenario,modelId:CREW_IDS[slot],clips:animations,trackId:'sonic-crew-rehearsal',progressMs:clock.current*1000,slot,count:3,playing,reducedMotion:false,manualPriority:false,settings});
  state.current=next.state;
  if(next.plan.active){
   const clip=animations.find(c=>c.name===next.plan.clip);
   if(clip){if(selected.current!==clip.name){player.select(clip,0,.55);selected.current=clip.name;}time.current=crewClipTime(next.plan,clip.duration);}
  }
  player.update(time.current,playing?Math.min(dt,.1):0);
  applyCrewReaction(reaction,next.plan,next.plan.beat,scenario.energy);
  if(frame.clock.elapsedTime-lastReport.current>.35){lastReport.current=frame.clock.elapsedTime;onReading({slot,clip:next.plan.active?selected.current:'Pausiert',time:time.current,leader:next.plan.leader===slot});}
 });
 return <group position={[(slot-1)*1.4,0,0]}><primitive object={model}/></group>;
}
export default function SonicCrewRehearsal(props:{clock:{current:number};playing:boolean;settings:CrewSettings;scenario:CrewScenario;onReading:(reading:CrewReading)=>void}){
 return <ModelPreviewBoundaryV733 onRetry={()=>slugs.forEach(slug=>useGLTF.clear(`/avatars/sonic/${slug}.glb`))}><div style={{height:320,border:'1px solid #ffffff33',borderRadius:12,overflow:'hidden'}} role="img" aria-label="Simulierte Sonic-Crew-Show mit drei echten GLB-Modellen">
  <Canvas camera={{position:[0,.2,6.2],fov:40}} dpr={[1,1.3]}>
   <ambientLight intensity={1.5}/><directionalLight position={[3,5,4]} intensity={2}/>
   <Clock clock={props.clock} playing={props.playing}/>
   <Suspense fallback={null}>{CREW_IDS.map((id,slot)=><Performer key={id} slot={slot} {...props}/>)}</Suspense>
   <OrbitControls target={[0,0,0]} enablePan={false} minDistance={3.8} maxDistance={10}/>
  </Canvas>
 </div></ModelPreviewBoundaryV733>;
}
