'use client';
import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh,type Mesh,type MeshBasicMaterial} from 'three';
import type {AudioFeatures} from '@/types/audio';
import type {ArenaFinaleCueV1046} from '@/lib/arena360CinematicFinaleV1046';
import {acceptEpicDropBeatV1069,type EpicDropCueV1069} from '@/lib/arena360EpicDropV1069';

const TAU=Math.PI*2;
/** 360-degree instanced paper confetti + a single bass wave ring. One existing
 * render loop, no allocations on frames, no light sources, network or flashes.
 * Shockwaves ONLY occur on rising edges of actual detected strong beats.
 */
export function ArenaCinematicFinaleV1046({cue,audio,trackId,playing,reducedMotion,progressMs,epicDropCueV1069}: {
 cue:ArenaFinaleCueV1046;audio:AudioFeatures;trackId?:string|null;
 playing:boolean;reducedMotion:boolean;progressMs?:number;epicDropCueV1069?:EpicDropCueV1069;
}){
 const confetti=useRef<InstancedMesh>(null),material=useRef<MeshBasicMaterial>(null);
 const wave=useRef<Mesh>(null),waveMat=useRef<MeshBasicMaterial>(null);
 const dummy=useMemo(()=>new Object3D(),[]),tint=useMemo(()=>new Color(),[]);
 const elapsed=useRef(0),shockAge=useRef(9),cooldown=useRef(0),lastBeat=useRef(false);
 const previousTrack=useRef(trackId),wasActive=useRef(false);
 const dropAge=useRef(9),lastProgress=useRef<number|undefined>(undefined);
 useFrame((_,delta)=>{
  const mesh=confetti.current,ring=wave.current;
  if(!mesh||!ring)return;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  const trackChanged=previousTrack.current!==trackId;
  const seeked=Number.isFinite(progressMs)&&Number.isFinite(lastProgress.current)&&
    (progressMs!<lastProgress.current!-250||progressMs!>lastProgress.current!+1500);
  if(Number.isFinite(progressMs))lastProgress.current=progressMs;
  if(trackChanged||seeked){previousTrack.current=trackId;shockAge.current=9;dropAge.current=9;
   cooldown.current=2.8;elapsed.current=0;lastBeat.current=Boolean(audio.beat);}
  const finaleActive=cue.active&&playing&&!reducedMotion;
  const dropActive=epicDropCueV1069?.active===true&&playing&&!reducedMotion;
  if(!finaleActive&&!dropActive){mesh.count=0;mesh.visible=false;ring.visible=false;
   shockAge.current=9;dropAge.current=9;lastBeat.current=Boolean(audio.beat);
   wasActive.current=false;return;}
  const beat=audio.beat===true;
  cooldown.current=Math.max(0,cooldown.current-dt);
  const validDropBeat=dropActive&&!!epicDropCueV1069&&acceptEpicDropBeatV1069({
    cue:epicDropCueV1069,beat,previousBeat:lastBeat.current,
    cooldownSeconds:cooldown.current,beatStrength:audio.beatStrength,
    bass:audio.bass,energy:audio.energyEnvelope});
  const validFinaleBeat=finaleActive&&beat&&!lastBeat.current&&cue.shockPower>.01&&cooldown.current<=0&&
   Number.isFinite(audio.beatStrength)&&Number(audio.beatStrength)>=.55&&
   (Number(audio.bass??0)>=.4||Number(audio.energyEnvelope??0)>=.55);
  lastBeat.current=beat;
  if(validDropBeat){dropAge.current=0;shockAge.current=0;
   cooldown.current=epicDropCueV1069!.cooldownSeconds;}
  else if(validFinaleBeat){shockAge.current=0;cooldown.current=1.45;}
  else shockAge.current+=dt;
  if(!validDropBeat)dropAge.current+=dt;
  const waveLive=shockAge.current<1.25;
  ring.visible=waveLive;
  if(waveLive){
   const fraction=shockAge.current/1.25;
   const radius=2.78+fraction*2.6;
   ring.scale.set(radius,radius,1);
   const shockPower=Math.max(finaleActive?cue.shockPower:0,dropActive&&dropAge.current<1.25?epicDropCueV1069!.shockPower:0);
   if(waveMat.current)waveMat.current.opacity=Math.max(0,Math.min(.28,(1-fraction)*shockPower*.43));
  }
  // Never allocate more than 96 paper pieces, even on fast GPUs.
  const burstLive=dropActive&&dropAge.current<2.7;
  const burstFade=burstLive?Math.max(0,1-dropAge.current/2.7):0;
  const paperCount=Math.max(finaleActive?cue.confettiCount:0,
    burstLive?epicDropCueV1069!.confettiCount:0);
  const paperGain=Math.max(finaleActive?cue.confetti:0,
    burstLive?epicDropCueV1069!.confetti*burstFade:0);
  mesh.count=Math.min(96,Math.max(0,paperCount));
  mesh.visible=mesh.count>0&&paperGain>.001;
  if(material.current)material.current.opacity=mesh.visible?Math.min(.42,paperGain*.67):0;
  if(!mesh.visible){elapsed.current=0;wasActive.current=false;return;}
  elapsed.current+=dt;
  if(wasActive.current&&elapsed.current<.06)return;
  elapsed.current=0;wasActive.current=true;
  // Song-position anchoring keeps confetti deterministic after seeking or pausing.
  const t=Number.isFinite(progressMs)?Math.max(0,progressMs??0)/1000:cue.clockSeconds;
  for(let k=0;k<mesh.count;k++){
   const seed=((k*0.61803398875)%1),angle=TAU*((k*.38196601125)%1);
   const fall=((seed+t*(.095+(k%5)*.012))%1+1)%1;
   const radius=3.1+seed*1.35;
   dummy.position.set(Math.cos(angle)*radius+Math.sin(t*.65+k)*.14,3.05-fall*4.75,
    Math.sin(angle)*radius+Math.cos(t*.52+k)*.14);
   dummy.rotation.set(t*.36+k*.21,angle,t*.60+k*.43);
   dummy.scale.set(.045+(k%3)*.013,.088+(k%4)*.014,.008);
   dummy.updateMatrix();mesh.setMatrixAt(k,dummy.matrix);
   // Metallic gold, icy cyan and rose paper. No emissive glare or flash.
   const glint=.60+.22*Math.sin(t*.92+k*.77);
   if(k%3===0)tint.setRGB(.43*glint,.83*glint,glint);
   else if(k%3===1)tint.setRGB(glint,.72*glint,.32*glint);
   else tint.setRGB(glint,.45*glint,.68*glint);
   mesh.setColorAt(k,tint);
  }
  mesh.instanceMatrix.needsUpdate=true;
  if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 });
 return <group name="v1046-cinematic-finale" frustumCulled={false}>
  <instancedMesh ref={confetti} args={[undefined,undefined,96]} frustumCulled={false}
    name="v1046-360-confetti" visible={false} castShadow={false} receiveShadow={false}>
    <planeGeometry args={[1,1]}/>
    <meshBasicMaterial ref={material} color="#ffffff" transparent opacity={0}
      depthWrite={false} toneMapped={false} side={2}/>
  </instancedMesh>
  <mesh ref={wave} name="v1046-audio-beat-shockwave" position={[0,-1.795,0]}
    rotation={[-Math.PI/2,0,0]} visible={false}>
    <ringGeometry args={[.975,1,64]}/>
    <meshBasicMaterial ref={waveMat} color="#71cfff" transparent opacity={0}
      depthWrite={false} toneMapped={false} side={2}/>
  </mesh>
 </group>;
}
