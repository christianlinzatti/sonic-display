"use client";
import {useFrame} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef} from 'react';
import {Color,Object3D,Quaternion,Vector3,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {sampleMusicalDynamicsGainV1090,type MusicalDynamicsStateV1090} from '@/lib/arena360MusicalDynamicsV1090';
import {sampleStoryArcGainV1091,type StoryArcStateV1091} from '@/lib/arena360StoryArcDirectorV1091';
import {sampleGenreShowGainV1093,type GenreShowStateV1093} from '@/lib/arena360GenreShowIntelligenceV1093';
import {sampleUltimateFestivalDropV1087,type UltimateFestivalDropCueV1087,type UltimateFestivalDropStateV1087} from '@/lib/arena360UltimateFestivalDropV1087';
import type {ArenaFinaleCueV1046} from '@/lib/arena360CinematicFinaleV1046';
import type {IntelligentLaserCueV1057} from '@/lib/arena360IntelligentLaserV1057';
import {sampleLaserEndpointV1080,type LaserExperienceCueV1080} from '@/lib/arena360LaserExperienceV1080';
import type {ArenaAtmosphereDirectorCueV1045} from '@/lib/arena360AtmosphereDirectorV1045';
import {useAdaptivePerformance} from '../adaptivePerformance';
import type {ArenaPeakStateV1036} from '@/lib/arena360AtmosphereV1036';
import {createArenaLasersV1036,planArenaAtmosphereV1036,sampleArenaLaserV1036} from '@/lib/arena360AtmosphereV1036';
/** All rays are translucent, bounded mesh geometry, not physical lasers or HDR flashes.
 * Fixed in arena coordinates: the rotating performer deck is never affected.
 */
export function ArenaLaserFansV1036({audio,playing,reducedMotion,reactive,enabled,directorEnabled,
 section,progressMs,durationMs,intensity,peakRef,atmosphereV1045,finaleV1046,laserCueV1057,laserExperienceCueV1080,ultimateFestivalDropCueV1087,ultimateFestivalDropStateV1087,musicalDynamicsStateV1090,storyArcStateV1091,genreShowStateV1093}: {
 audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive:boolean;enabled:boolean;directorEnabled:boolean;
 section?:string;progressMs?:number;durationMs?:number;intensity?:number;
 peakRef?:{readonly current:ArenaPeakStateV1036};atmosphereV1045?:ArenaAtmosphereDirectorCueV1045;finaleV1046?:ArenaFinaleCueV1046;
 laserCueV1057?:IntelligentLaserCueV1057;laserExperienceCueV1080?:LaserExperienceCueV1080;
 ultimateFestivalDropCueV1087?:UltimateFestivalDropCueV1087;ultimateFestivalDropStateV1087?:{readonly current:UltimateFestivalDropStateV1087};
 musicalDynamicsStateV1090?:{readonly current:MusicalDynamicsStateV1090};
 storyArcStateV1091?:{readonly current:StoryArcStateV1091};
 genreShowStateV1093?:{readonly current:GenreShowStateV1093};
}){
 const tier=useAdaptivePerformance().tier;
 const fixtures=useMemo(()=>createArenaLasersV1036(tier),[tier]);
 const rays=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]),up=useMemo(()=>new Vector3(0,1,0),[]);
 const start=useMemo(()=>new Vector3(),[]),end=useMemo(()=>new Vector3(),[]),direction=useMemo(()=>new Vector3(),[]);
 const quaternion=useMemo(()=>new Quaternion(),[]),tint=useMemo(()=>new Color(),[]);
 const blue=useMemo(()=>new Color('#49d8ff'),[]),purple=useMemo(()=>new Color('#dc78f5'),[]);
 const softBlue=useMemo(()=>new Color('#49d8ff'),[]),softPurple=useMemo(()=>new Color('#dc78f5'),[]);
 const targetBlue=useMemo(()=>new Color(),[]),targetPurple=useMemo(()=>new Color(),[]);
 const budget=useRef(.2),clock=useRef(0),wasActive=useRef(true);
 useLayoutEffect(()=>{budget.current=.2;},[fixtures]);
 useFrame((_,delta)=>{
  if(!enabled||!rays.current)return;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  const active=playing&&!reducedMotion&&reactive&&directorEnabled;
  if(active)clock.current+=dt*(atmosphereV1045?.active?atmosphereV1045.drift:1);
  if(!active&&!wasActive.current)return;
  budget.current+=dt;
  if(active&&budget.current<(tier==='low'?.14:.065))return;
  budget.current=0;wasActive.current=active;
  const cue=planArenaAtmosphereV1036({enabled:directorEnabled,playing,reducedMotion,reactive,
    section,progressMs,durationMs,energy:audio.energyEnvelope,intensity,peak:peakRef?.current.energy});
  const mix=Math.min(1,dt*1.5);
  softBlue.lerp(targetBlue.copy(blue).set(laserCueV1057?.active?laserCueV1057.colorA:atmosphereV1045?.active?atmosphereV1045.laserB:'#49d8ff'),mix);
  softPurple.lerp(targetPurple.copy(purple).set(laserCueV1057?.active?laserCueV1057.colorB:atmosphereV1045?.active?atmosphereV1045.laserA:'#dc78f5'),mix);
  const gain=(atmosphereV1045?.active?atmosphereV1045.laserGain:1)*(finaleV1046?.active?finaleV1046.laserAccent:1);
  for(let i=0;i<fixtures.length;i++){
   const f=fixtures[i],sample=sampleArenaLaserV1036(f,clock.current,cue);
   start.set(f.originX,f.originY,f.originZ);
   // Bounded stage-only targets; show phases open the laser fan and lift its horizon.
   const v1057=laserCueV1057?.active?laserCueV1057:null;
   const spread=(atmosphereV1045?.active?atmosphereV1045.laserSpread:1)*(v1057?.fanSpread??1);
   const lift=(atmosphereV1045?.active?atmosphereV1045.laserLift:0)+(v1057?.fanLift??0);
   // Existing fixtures only: a limited musical sweep cannot reach outside the arena.
   const sweep=v1057?Math.sin(clock.current*.28+i*.41)*v1057.sweep:0;
   const cos=Math.cos(sweep),sin=Math.sin(sweep);
   const x=sample.targetX*spread,z=sample.targetZ*spread;
   end.set(Math.max(-4.4,Math.min(4.4,x*cos-z*sin)),
    Math.max(.64,Math.min(2.20,sample.targetY+lift+(finaleV1046?.active?finaleV1046.deckAccent*2:0))),
    Math.max(-4.4,Math.min(4.4,x*sin+z*cos)));
   if(laserExperienceCueV1080?.active)sampleLaserEndpointV1080(
    laserExperienceCueV1080,i,fixtures.length,clock.current,'fan',end);
   // Shared V1087 beat wave opens existing fan geometry; never increases beam brightness.
   if(ultimateFestivalDropCueV1087?.channels.laser&&ultimateFestivalDropStateV1087){
    const pulse=sampleUltimateFestivalDropV1087(ultimateFestivalDropCueV1087,ultimateFestivalDropStateV1087.current).laser;
    const spread=1+.065*pulse;
    end.x=Math.max(-4.4,Math.min(4.4,end.x*spread));
    end.z=Math.max(-4.4,Math.min(4.4,end.z*spread));
   }
   direction.subVectors(end,start);const length=direction.length();
   quaternion.setFromUnitVectors(up,direction.normalize());
   dummy.position.copy(start).add(end).multiplyScalar(.5);
   dummy.quaternion.copy(quaternion);dummy.scale.set(.75,Math.max(.001,length),.75);dummy.updateMatrix();
   rays.current.setMatrixAt(i,dummy.matrix);
   rays.current.setColorAt(i,tint.copy(i%2?softBlue:softPurple).multiplyScalar(active?Math.min(.74,sample.brightness*gain*(laserCueV1057?.active?laserCueV1057.fanGain:1)*(laserExperienceCueV1080?.active?laserExperienceCueV1080.gain:1)*
      sampleMusicalDynamicsGainV1090(musicalDynamicsStateV1090?.current)*sampleStoryArcGainV1091(storyArcStateV1091?.current)*sampleGenreShowGainV1093(genreShowStateV1093?.current,'laser')):.008));
  }
  rays.current.instanceMatrix.needsUpdate=true;
  if(rays.current.instanceColor)rays.current.instanceColor.needsUpdate=true;
 });
 if(!enabled)return null;
 return <group name="v1036-360-arena-laser-fans">
  <instancedMesh ref={rays} args={[undefined,undefined,fixtures.length]} frustumCulled={false}>
   <cylinderGeometry args={[.010,.048,1,6,1,true]}/>
   <meshBasicMaterial color="#ffffff" transparent opacity={.30} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
 </group>;
}
