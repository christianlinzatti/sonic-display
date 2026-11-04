'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {previousVerifiedConcertSceneV960,applyConcertContinuityV960} from '@/lib/concertContinuityV960';
import type {Group} from 'three';
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318} from '@/services/musicAnalysis/trackAnalysisV318';
import {loadConcertRoadmapV958,composeConcertSceneV958,CONCERT_ROADMAP_EVENT_V958,
 type ConcertSettingsV958,type ConcertPhaseV958} from '@/lib/ultimateConcertRoadmapV958';

/** Real lightweight WebGL effects (V949–V955), opt-in. No new render loop, timer, UDP command,
 * postprocessing pass, light flashes, shadow caster, or shader compilation at runtime.
 * Reuses the existing R3F Canvas; only strong real V318 sections can cause highlight FX.
 */
export function ConcertFestivalFxV958({trackId,progressMs,durationMs,genre,energy,bass,playing,
 reducedMotion,lyricsVisible}:{trackId:string;progressMs:number;durationMs:number;genre:string;
 energy:number;bass:number;playing:boolean;reducedMotion:boolean;lyricsVisible:boolean}){
 const [settings,setSettings]=useState<ConcertSettingsV958>(loadConcertRoadmapV958);
 const [analysisVersion,setAnalysisVersion]=useState(0);
 const rotation=useRef<Group>(null);const wallMotion=useRef<Group>(null);
 useEffect(()=>{const sync=()=>setSettings(loadConcertRoadmapV958());
  window.addEventListener(CONCERT_ROADMAP_EVENT_V958,sync);
  return()=>window.removeEventListener(CONCERT_ROADMAP_EVENT_V958,sync);},[]);
 useEffect(()=>{const refresh=()=>setAnalysisVersion(v=>v+1);
  const storage=(event:StorageEvent)=>{if(!event.key||event.key==='sonic-track-analyses-v318')refresh();};
  window.addEventListener(ANALYSIS_EVENT_V318,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,refresh);window.removeEventListener('storage',storage);};},[]);
 const analysis=useMemo(()=>readTrackAnalysisV318(trackId),[trackId,analysisVersion]);
 const active=analysis?.trackId===trackId?analysis.sections.findIndex(s=>s.startMs<=progressMs&&progressMs<s.startMs+s.durationMs):-1;
 const section=active!==undefined&&active>=0?analysis?.sections[active]:undefined;
 const verified=Boolean(section&&section.label&&section.confidence>=.5);
 const scene=useMemo(()=>{
  if(!settings.enabled||!settings.virtualFx||!playing||!trackId||!verified||!section?.label)return null;
  const original=composeConcertSceneV958({trackId,progressMs,durationMs,genre,
   phase:section.label as ConcertPhaseV958,sectionIndex:active??0,sectionStartMs:section.startMs,
   verified:true,energy,bass,lyricsVisible,reducedMotion},settings);
  const previous=settings.transitionsV960?previousVerifiedConcertSceneV960({analysis,trackId,
    sectionIndex:active??0,durationMs,genre,energy,bass,lyricsVisible,reducedMotion,settings}):null;
  return applyConcertContinuityV960(original,previous,progressMs-section.startMs,settings,{reducedMotion}).scene;
 },[analysis,settings,playing,trackId,progressMs,durationMs,genre,verified,section,active,energy,bass,lyricsVisible,reducedMotion]);
 useFrame((_state,delta)=>{if(rotation.current&&playing&&!reducedMotion&&scene){
  rotation.current.rotation.y+=Math.min(.02,Math.max(0,delta))*.20;
 }
  if(wallMotion.current&&playing&&!reducedMotion&&scene){
   wallMotion.current.position.x=.09*Math.sin(_state.clock.elapsedTime*.42);
  }
 });
 if(!scene)return null;
 const beams=scene.effects.includes('beams');const lasers=scene.effects.includes('lasers');
 const fog=scene.effects.includes('fog');const confetti=scene.effects.includes('confetti');
 const streamers=scene.effects.includes('streamers');const sweep=scene.effects.includes('sweep');
 const impact=scene.effects.includes('bass-impact');
 return <group name="UltimateConcertStageFxV958">
  {/* V951: dynamic low-cost LED geometry behind performers; an actual 3D object. */}
  <group ref={wallMotion} position={[0,1.8,-3.0]}>
   {Array.from({length:14},(_,i)=><mesh key={i} position={[(i-6.5)*.47,0,0]}>
    <boxGeometry args={[.33,
      .32+scene.intensity*(scene.wall==='equalizer'?(Math.sin(i*1.4+progressMs/2600)+1)/2:
       scene.wall==='geometry'?(i%4)/3:scene.wall==='pulse'?.5+.5*Math.sin(progressMs/3200):
       scene.wall==='starfield'?((i*7+active*3)%8)/7:Math.abs(Math.sin(i*.6+progressMs/5200)))*1.25,.018]}/>
    <meshBasicMaterial color={i%2?scene.palette[0]:scene.palette[1]} transparent opacity={.15+.20*scene.intensity} depthWrite={false}/>
   </mesh>)}
  </group>
  {/* V949: translucent, non-flashing stage-volume silhouettes. */}
  {beams&&[-1,1].map((side)=><mesh key={`beam-${side}`} position={[side*2.0,1.5,-1.8]} rotation={[0,0,side*.27]}>
   <coneGeometry args={[.95,3.5,12,1,true]}/><meshBasicMaterial color={scene.palette[0]} transparent opacity={.07*scene.intensity} depthWrite={false} side={2}/>
  </mesh>)}
  {/* V950: virtual graphic laser lines; never control physical lasers. */}
  {lasers&&[-1,1].map(side=><group key={`laser-${side}`} position={[side*2.6,1.5,-1.8]} rotation={[0,0,side*.39]}>
   <mesh><cylinderGeometry args={[.012,.012,4,6]}/><meshBasicMaterial color={scene.palette[1]} transparent opacity={.42} depthWrite={false}/></mesh>
  </group>)}
  {sweep&&<group ref={rotation} position={[0,1,-2.4]}><mesh rotation={[0,0,.6]}>
   <coneGeometry args={[.45,3.6,10,1,true]}/><meshBasicMaterial color={scene.palette[0]} transparent opacity={.055} depthWrite={false} side={2}/>
  </mesh></group>}
  {/* V953: simulated, spatial bass-impact ring, not a strobe. */}
  {impact&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,-.9,0]}>
   <ringGeometry args={[1.3+scene.intensity*.5,1.42+scene.intensity*.5,40]}/>
   <meshBasicMaterial color={scene.palette[0]} transparent opacity={.18} depthWrite={false} side={2}/>
  </mesh>}
  {/* V954: low-complexity fog plates; bounded to avoid overdraw on Pi. */}
  {fog&&Array.from({length:3},(_,i)=><mesh key={`fog-${i}`} rotation={[-Math.PI/2,0,0]} position={[i*1.3-1.3,-.75,-.8+i*.4]}>
   <circleGeometry args={[1.2,18]}/><meshBasicMaterial color={scene.palette[1]} transparent opacity={.045} depthWrite={false}/>
  </mesh>)}
  {/* V955: small deterministic confetti/streamers for verified finale only. */}
  {(confetti||streamers)&&Array.from({length:24},(_,i)=>{
   const x=((i*17)%23-11)*.32,y=((i*13)%19)*.14-.1,z=-.1-((i*7)%12)*.12;
   return <mesh key={`paper-${i}`} position={[x,y,z]} rotation={[i*.71,i*.39,i*.57]}>
    <planeGeometry args={[(streamers&&i%4===0)?.035:.07,(streamers&&i%4===0)?.55:.10]}/>
    <meshBasicMaterial color={i%2?scene.palette[0]:scene.palette[1]} side={2} transparent opacity={.65} depthWrite={false}/>
   </mesh>;
  })}
 </group>;
}
