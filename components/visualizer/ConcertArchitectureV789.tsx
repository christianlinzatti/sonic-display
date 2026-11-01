"use client";
import {useLayoutEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {AdditiveBlending,Color,Object3D} from 'three';
import type {Group,InstancedMesh,MeshBasicMaterial} from 'three';
import type {AudioFeatures} from '@/types/audio';
import type {StageEnvironmentId} from './stages';
import type {StageSection} from './stageDirectorV287';
import type {CinematicCueV761} from './cinematicConcertDirectorV761';
import type {ShowCue} from './ultimateShowDirectorV306';
import {getActivePerformanceTier} from './adaptivePerformance';
import {getVisualLevelV640} from './adaptiveVisualBudgetV640';
import {getLightingPlayback} from './lightingPlayback';
import {useSceneDetail} from './scenePerformanceControls';
import {createArchitectureBarsV789,planArchitectureCueV789} from './architecturalLightPlanV789';
import type {LightChoreographyCueV793} from './advancedLightChoreographerV793';
import type {EpicPeakCueV794} from './epicPeakMomentsV794';
import {positionStageEvolutionBarV795} from './dynamicStageEvolutionV795';
import type {StageEvolutionCueV795} from './dynamicStageEvolutionV795';

/** Low-cost architectural accent layer: one instanced draw call, no lights,
 * shadows, postprocessing, mesh creation or allocations inside useFrame.
 * Geometry stays behind performers and cannot cover DOM lyrics.
 */
export function ConcertArchitectureV789({theme,audio,isPlaying,reactive,reducedMotion,
  primary,secondary,sectionRef,timelineGainRef,showCue,cinematicCue,lyricsProtected,
  manualLighting=false,timelineGain=1,strength=60,choreographyRefV793,peakRefV794,evolutionRefV795}: {
  theme:StageEnvironmentId;audio:AudioFeatures;isPlaying:boolean;reactive:boolean;
  reducedMotion:boolean;primary:string;secondary:string;
  sectionRef:{current:StageSection};timelineGainRef:{current:number};
  showCue?:ShowCue;cinematicCue?:CinematicCueV761;
  lyricsProtected:boolean;manualLighting?:boolean;timelineGain?:number;strength?:number;
  choreographyRefV793?:{current:LightChoreographyCueV793};peakRefV794?:{current:EpicPeakCueV794|null};evolutionRefV795?:{current:StageEvolutionCueV795};
}){
  const bars=useMemo(()=>createArchitectureBarsV789(theme),[theme]);
  const mesh=useRef<InstancedMesh>(null);
  const group=useRef<Group>(null);
  const material=useRef<MeshBasicMaterial>(null);
  const transform=useMemo(()=>new Object3D(),[]);
  const colorA=useMemo(()=>new Color(),[]);
  const colorB=useMemo(()=>new Color(),[]);
  const chaseColor=useMemo(()=>new Color(),[]);
  const lastChaseStep=useRef(-1);
  const fade=useRef(0);
  const evolutionV795=useRef({spread:0,lift:0,depth:0});
  const matrixElapsedV795=useRef(0);
  const uploadedV795=useRef({spread:0,lift:0,depth:0});
  const detail=useSceneDetail();
  useLayoutEffect(()=>{
    const instanced=mesh.current;
    if(!instanced)return;
    colorA.set(primary);colorB.set(secondary);
    for(let i=0;i<bars.length;i++){
      const bar=bars[i];
      transform.position.set(bar.x,bar.y,bar.z);
      transform.rotation.set(0,0,bar.angle);
      transform.scale.set(bar.width,bar.length,.08);
      transform.updateMatrix();
      instanced.setMatrixAt(i,transform.matrix);
      instanced.setColorAt(i,bar.accent?colorB:colorA);
    }
    instanced.instanceMatrix.needsUpdate=true;
    if(instanced.instanceColor)instanced.instanceColor.needsUpdate=true;
    instanced.computeBoundingSphere();
    lastChaseStep.current=-1;
    evolutionV795.current.spread=0;
    evolutionV795.current.lift=0;
    evolutionV795.current.depth=0;
    matrixElapsedV795.current=0;
    uploadedV795.current.spread=0;
    uploadedV795.current.lift=0;
    uploadedV795.current.depth=0;
  },[bars,transform,colorA,colorB,primary,secondary]);
  useFrame((_,delta)=>{
    const tier=getActivePerformanceTier();
    const playback=getLightingPlayback();
    const authoredOff=showCue?.enabled&&showCue.lightingEnabled===false;
    const cue=planArchitectureCueV789({
      playing:isPlaying,reactive,reducedMotion:reducedMotion||detail==='no-pulse',section:sectionRef.current,
      intent:cinematicCue?.active?cinematicCue.intent:null,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playbackMs:playback.positionMs,lyricsProtected,
      blackout:timelineGainRef.current<=.001||timelineGain<=.001||authoredOff===true,
      manualLighting,lowTier:tier==='low'||getVisualLevelV640()==='minimal'||strength<40,
      muted:detail==='minimal-lights'||detail==='no-rings',
    });
    if(!material.current||!mesh.current||!group.current)return;
    // V795: gently move the SAME 40–60 portal bars instead of spawning scenery.
    // One instanced matrix buffer, updated at most 20 times/sec and only when
    // visibly changing. Scene/track/blackout gating lives in DynamicStage.
    const evolution=evolutionRefV795?.current;
    const targetSpread=evolution?.active===true?evolution.spread:0;
    const targetLift=evolution?.active===true?evolution.lift:0;
    const targetDepth=evolution?.active===true?evolution.depth:0;
    const transition=1-Math.exp(-Math.min(.1,Math.max(0,delta))*3.5);
    const shape=evolutionV795.current;
    shape.spread+=(targetSpread-shape.spread)*transition;
    shape.lift+=(targetLift-shape.lift)*transition;
    shape.depth+=(targetDepth-shape.depth)*transition;
    if(targetSpread===0&&shape.spread<.0005)shape.spread=0;
    if(targetLift===0&&shape.lift<.0005)shape.lift=0;
    if(targetDepth===0&&shape.depth<.0005)shape.depth=0;
    matrixElapsedV795.current+=Math.min(.1,Math.max(0,delta));
    const uploaded=uploadedV795.current;
    const changes=Math.abs(uploaded.spread-shape.spread)>.0005||
      Math.abs(uploaded.lift-shape.lift)>.0005||
      Math.abs(uploaded.depth-shape.depth)>.0005||
      (shape.spread===0&&uploaded.spread!==0)||
      (shape.lift===0&&uploaded.lift!==0)||
      (shape.depth===0&&uploaded.depth!==0);
    if(matrixElapsedV795.current>=.05&&changes){
      matrixElapsedV795.current=0;
      uploaded.spread=shape.spread;
      uploaded.lift=shape.lift;
      uploaded.depth=shape.depth;
      for(let i=0;i<bars.length;i++){
        const bar=bars[i];
        positionStageEvolutionBarV795(transform.position,bar.x,bar.y,bar.z,
          shape.spread,shape.lift,shape.depth);
        transform.rotation.set(0,0,bar.angle);
        transform.scale.set(bar.width,bar.length,.08);
        transform.updateMatrix();
        mesh.current.setMatrixAt(i,transform.matrix);
      }
      mesh.current.instanceMatrix.needsUpdate=true;
      // Bounds can change with the expansion, so recalculate after matrix edits.
      mesh.current.computeBoundingSphere();
    }
    // A very slow travelling colour accent gives hooks/drops a sense of movement.
    // Only a tiny instance-colour buffer changes, at most 10 times per second;
    // no React commits, GPU textures or geometry are created per frame.
    const chasing=cue.visible&&isPlaying&&reactive&&!reducedMotion&&
      detail==='full'&&!manualLighting&&playback.playing&&Number.isFinite(playback.positionMs);
    // V793 shares the existing 100ms instance-colour update, no second loop.
    // One source of choreography for the actual beam and the virtual fixture banks.
    const choreography=choreographyRefV793?.current;
    const choreographed=chasing&&choreography?.active===true;
    const step=chasing?Math.floor(Math.max(0,playback.positionMs)/100):-1;
    if(step!==lastChaseStep.current){
      lastChaseStep.current=step;
      for(let i=0;i<bars.length;i++){
        // Distinct crossed/fan/rise patterns change the EXISTING bar colours,
        // not their geometry. Smooth brightness floor avoids perceived strobing.
        const side=bars[i].x<0?-1:1;
        const phase=choreographed?(choreography?.chase??0):step*.055;
        const directed=choreographed?(
          choreography?.pattern==='cross'?phase*1.6+i*.19*side:
          choreography?.pattern==='fan'?phase*.72+Math.abs(bars[i].x)*.82+i*.10:
          choreography?.pattern==='rise'?phase*.40+bars[i].y*.94:
          choreography?.pattern==='portrait'?phase*.25+i*.10:
          phase+i*.19):i*.37+phase;
        const depth=choreographed?(choreography?.depth??0):0;
        const brightness=chasing?.76+.24*(.5+.5*Math.cos(directed)):
          1;
        const mixed=choreographed?Math.max(.62,brightness*(1-depth*.18)):brightness;
        // V794: one continuous accent on existing fixture bars. Never strobe.
        const peakGain=chasing&&playback.playing&&cue.visible&&
          !manualLighting&&!authoredOff&&timelineGain>=1&&
          timelineGainRef.current>.001&&peakRefV794?.current?.active===true?
          Math.max(.72,Math.min(1.16,peakRefV794.current.architectureGain)):1;
        chaseColor.copy(bars[i].accent?colorB:colorA).multiplyScalar(Math.min(1.16,mixed*peakGain));
        mesh.current.setColorAt(i,chaseColor);
      }
      if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
    }
    // Immediate blackout; gradual, non-strobing transitions for all other cues.
    const rate=cue.visible?(reducedMotion?1:1-Math.exp(-Math.min(.1,Math.max(0,delta))*3)):1;
    fade.current+=(cue.opacity-fade.current)*rate;
    material.current.opacity=fade.current*Math.min(1,Math.max(0,strength)/60)*(tier==='balanced'?.78:1);
    mesh.current.visible=fade.current>.003;
    const size=tier==='balanced'?.65:1;
    // No beat-driven camera or singer movement; the portal remains behind cast.
    group.current.scale.setScalar(1+(cue.scale-1)*size);
    group.current.rotation.y=reducedMotion||manualLighting?0:(cue.chase-.5)*.018;
  });
  return <group ref={group} name="v789-cinematic-light-architecture">
    <instancedMesh ref={mesh} name="v789-single-batch-light-bars" args={[undefined,undefined,bars.length]}
      frustumCulled={true} visible={false}>
      <boxGeometry args={[1,1,1]}/>
      <meshBasicMaterial ref={material} color="#ffffff" transparent opacity={0}
        depthWrite={false} depthTest={true} toneMapped={false} blending={AdditiveBlending}/>
    </instancedMesh>
  </group>;
}
