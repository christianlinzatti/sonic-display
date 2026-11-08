'use client';
import {useFrame} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {sampleMusicalDynamicsGainV1090,type MusicalDynamicsStateV1090} from '@/lib/arena360MusicalDynamicsV1090';
import {sampleStoryArcGainV1091,type StoryArcStateV1091} from '@/lib/arena360StoryArcDirectorV1091';
import {sampleUltimateFestivalDropV1087,type UltimateFestivalDropCueV1087,type UltimateFestivalDropStateV1087} from '@/lib/arena360UltimateFestivalDropV1087';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {createLedWallPixelsV1059,sampleLedWallPixelV1059,type LedWallCueV1059} from '@/lib/arena360LedWallV1059';
import {acceptEpicDropBeatV1069,sampleEpicDropLedAccentV1069,type EpicDropCueV1069} from '@/lib/arena360EpicDropV1069';
import {sampleLedWallExperienceV1083,type LedExperienceCueV1083} from '@/lib/arena360LedWallExperienceV1083';
import {ArenaLedLyricsV1083} from './ArenaLedLyricsV1083';

/** One instanced draw call, not a video texture or a wall hiding the singers.
 * An open, low-slung ring of small pixels surrounds the existing arena floor.
 * Matrix positions are static. Only colors change at 8–14 Hz.
 */
export function ArenaLedWallV1059({audio,playing,reducedMotion,cue,progressMs,epicDropCueV1069,experienceCueV1083,ultimateFestivalDropCueV1087,ultimateFestivalDropStateV1087,musicalDynamicsStateV1090,storyArcStateV1091}: {
 audio:AudioFeatures;playing:boolean;reducedMotion:boolean;cue:LedWallCueV1059;progressMs?:number;
 epicDropCueV1069?:EpicDropCueV1069;experienceCueV1083?:LedExperienceCueV1083;
 ultimateFestivalDropCueV1087?:UltimateFestivalDropCueV1087;ultimateFestivalDropStateV1087?:{readonly current:UltimateFestivalDropStateV1087};
 musicalDynamicsStateV1090?:{readonly current:MusicalDynamicsStateV1090};
 storyArcStateV1091?:{readonly current:StoryArcStateV1091};
}){
 const tier=useAdaptivePerformance().tier;
 const pixels=useMemo(()=>createLedWallPixelsV1059(tier),[tier]);
 const mesh=useRef<InstancedMesh>(null),timer=useRef(.2);
 const dummy=useMemo(()=>new Object3D(),[]),tint=useMemo(()=>new Color(),[]);
 const colorA=useMemo(()=>new Color(),[]),colorB=useMemo(()=>new Color(),[]);
 const accentColor=useMemo(()=>new Color('#f6bc77'),[]);
 const beatHeld=useRef(false),accentAge=useRef(9),cooldown=useRef(0),lastProgress=useRef<number|undefined>(undefined);
 useLayoutEffect(()=>{
  if(!mesh.current)return;
  for(let i=0;i<pixels.length;i++){
   const p=pixels[i];
   dummy.position.set(p.x,p.y,p.z);
   dummy.rotation.set(0,-p.angle,0);
   dummy.scale.set(1,1,1);dummy.updateMatrix();
   mesh.current.setMatrixAt(i,dummy.matrix);
   mesh.current.setColorAt(i,tint.set('#050b16'));
  }
  mesh.current.instanceMatrix.needsUpdate=true;
  if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
  mesh.current.computeBoundingSphere();
 },[pixels,dummy,tint,cue.active]);
 useFrame((_,delta)=>{
  if(!cue.active||!playing||reducedMotion||tier==='low'||!mesh.current){
   beatHeld.current=Boolean(audio.beat);accentAge.current=9;return;}
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  const seeked=Number.isFinite(progressMs)&&Number.isFinite(lastProgress.current)&&
   (progressMs!<lastProgress.current!-250||progressMs!>lastProgress.current!+1500);
  if(Number.isFinite(progressMs))lastProgress.current=progressMs;
  if(seeked){accentAge.current=9;cooldown.current=2.8;beatHeld.current=Boolean(audio.beat);}
  cooldown.current=Math.max(0,cooldown.current-dt);
  const beat=Boolean(audio.beat);
  if(epicDropCueV1069&&acceptEpicDropBeatV1069({cue:epicDropCueV1069,beat,
   previousBeat:beatHeld.current,cooldownSeconds:cooldown.current,
   beatStrength:audio.beatStrength,bass:audio.bass,energy:audio.energyEnvelope})){
   accentAge.current=0;cooldown.current=epicDropCueV1069.cooldownSeconds;
  }else accentAge.current+=dt;
  beatHeld.current=beat;
  timer.current+=dt;
  if(timer.current<(tier==='high'?.07:.12))return;
  timer.current=0;
  colorA.set(cue.colorA);colorB.set(cue.colorB);
  // A warm hue accent, never a brightness increase or fullscreen flash.
  const accent=epicDropCueV1069?sampleEpicDropLedAccentV1069(accentAge.current,epicDropCueV1069):0;
  accentColor.set(epicDropCueV1069?.genre==='hard'?'#ff697a':
   epicDropCueV1069?.genre==='rap'?'#ffb47a':
   epicDropCueV1069?.genre==='rock'?'#ff916d':'#ffd69e');
  // Preserve luminance budget: hue changes may not brighten an existing pixel.
  const luminance=(c:Color)=>.2126*c.r+.7152*c.g+.0722*c.b;
  const beforeA=luminance(colorA),beforeB=luminance(colorB);
  colorA.lerp(accentColor,accent);colorB.lerp(accentColor,accent);
  const afterA=luminance(colorA),afterB=luminance(colorB);
  if(afterA>beforeA&&afterA>0)colorA.multiplyScalar(beforeA/afterA);
  if(afterB>beforeB&&afterB>0)colorB.multiplyScalar(beforeB/afterB);
  const time=(Number.isFinite(progressMs)?Math.max(0,progressMs??0):0)/1000;
  const sharedDrop=ultimateFestivalDropCueV1087&&ultimateFestivalDropStateV1087?
   sampleUltimateFestivalDropV1087(ultimateFestivalDropCueV1087,ultimateFestivalDropStateV1087.current).led:0;
  for(let i=0;i<pixels.length;i++){
   const p=pixels[i];
   const light=experienceCueV1083?.active?sampleLedWallExperienceV1083(p,experienceCueV1083,audio,time):sampleLedWallPixelV1059(p,cue,audio,time);
   tint.copy(p.column%2===0?colorA:colorB).multiplyScalar(light);
   if(sharedDrop>.001){
    const before=luminance(tint);
    // A travelling hue shift, not an extra bright flash; clamp luminance to original.
    const phase=Math.sin(p.angle*3+time*2.2);
    tint.lerp(accentColor,sharedDrop*(.35+.25*phase));
    const after=luminance(tint);
    if(after>before&&after>0)tint.multiplyScalar(before/after);
   }
   // V1090: multiplicative, bounded optical crossfade; NEVER boost a pixel.
   tint.multiplyScalar(sampleMusicalDynamicsGainV1090(musicalDynamicsStateV1090?.current)*sampleStoryArcGainV1091(storyArcStateV1091?.current));
   mesh.current.setColorAt(i,tint);
  }
  if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
 });
 if(!cue.active||!playing||reducedMotion||tier==='low'||pixels.length===0)return null;
 return <group name="v1059-led-wall-360">
  <instancedMesh ref={mesh} name="v1059-led-wall-pixels" args={[undefined,undefined,pixels.length]} frustumCulled={false}>
   <boxGeometry args={[.24,.18,.085]}/><meshBasicMaterial color="#ffffff" toneMapped={false}/>
  </instancedMesh>
  {experienceCueV1083?.active&&experienceCueV1083.look==='lyrics'&&<ArenaLedLyricsV1083 cue={experienceCueV1083}/>}
 </group>;
}
