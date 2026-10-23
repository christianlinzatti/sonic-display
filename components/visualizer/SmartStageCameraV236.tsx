"use client";
import {guardAutomaticCameraV351,type SmartStageCueV351} from "@/services/stageContent/smartStageCompositionV351";
import {directCameraV354,type ShowTimelineCueV354} from "@/services/stageContent/showTimelineV354";
import type {GenreVisualCueV352} from "@/services/stageContent/genreVisualDirectorV352";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type {VisualizerProps} from "./registry";
import {TRACKING_ROOT_NAME} from "./smartCameraTrackingV297";
import {planVocalCameraV369,composeVocalCameraV369,approachVocalFocusV369,holdVocalShotV369,newVocalShotHoldV369} from "./vocalCameraV369";
import {sampleVocalFaceYV369} from "./vocalFaceAnchorV369";
import type { PerspectiveCamera } from "three";
import type { AudioFeatures } from "@/types/audio";
import {advanceStageDirector,createStageDirectorState} from "./smartStageDirectorV236";
/** Moves only the active scene camera; no new render passes or per-frame React state. */
export function SmartStageCameraV236({audio,genre,playing,reducedMotion,duo,composition,genreCue,timelineCue,lipSync}:{audio:AudioFeatures;genre?:string|null;playing:boolean;reducedMotion:boolean;duo:boolean;composition?:SmartStageCueV351;genreCue?:GenreVisualCueV352;timelineCue?:ShowTimelineCueV354;lipSync?:VisualizerProps["lipSync"]}){
 const director=useRef(createStageDirectorState());
 const focusV369=useRef(0);
 const holdV369=useRef(newVocalShotHoldV369());
 const faceV369=useRef<{value:number|null;remaining:number}>({value:null,remaining:0});
 const lookV369=useRef(0);
 const initial=useRef<{camera:PerspectiveCamera;x:number;y:number;z:number;fov:number}|null>(null);
 useFrame(({camera,clock,scene},delta)=>{
  if(!initial.current||initial.current.camera!==camera){initial.current={camera:camera as PerspectiveCamera,x:camera.position.x,y:camera.position.y,z:camera.position.z,fov:(camera as PerspectiveCamera).fov};director.current=createStageDirectorState();}
  const base=initial.current;const cue=advanceStageDirector(director.current,audio,delta,genre,playing,reducedMotion);
  const cameraMotion=genreCue?.active?genreCue.cameraMotion:1;
  const sway=cue.camera*(duo?.16:.11)*cameraMotion;
  const targetX=base.x+Math.sin(clock.elapsedTime*.45)*sway;
  const targetY=base.y+cue.camera*.065;
  const targetZ=base.z-cue.camera*(duo?.25:.31)*cameraMotion;
  const timelineCamera=directCameraV354({x:targetX,z:targetZ,fov:base.fov},
    playing&&!reducedMotion&&timelineCue?.active?timelineCue.cameraShot:undefined,timelineCue?.timeMs??0);
  const rawFocus=!reducedMotion&&playing&&lipSync?.enabled
    ?planVocalCameraV369(lipSync.lyrics,lipSync.progressMs,lipSync.playing,{mode:lipSync.cameraModeV369??"off",style:lipSync.style,genre}):0;
  focusV369.current=approachVocalFocusV369(focusV369.current,holdVocalShotV369(holdV369.current,rawFocus,lipSync?.progressMs??0,playing&&!reducedMotion&&!!lipSync?.enabled),delta);
  faceV369.current.remaining-=Math.max(0,delta);
  if(focusV369.current>.01&&faceV369.current.remaining<=0){
    faceV369.current.remaining=.25;
    faceV369.current.value=sampleVocalFaceYV369(scene.getObjectByName(TRACKING_ROOT_NAME)??null);
  }
  const vocalCamera=composeVocalCameraV369({...timelineCamera,y:targetY,targetY:0},focusV369.current,{duo,intensity:lipSync?.cameraStrengthV369??55,headY:faceV369.current.value,lyricsProtected:composition?.protectLyrics??false});
  const safe=guardAutomaticCameraV351(vocalCamera,composition);
  const t=1-Math.exp(-Math.min(Math.max(delta,0),.1)*3);
  camera.position.x+=(safe.x-camera.position.x)*t;
  camera.position.y+=(safe.y-camera.position.y)*t;
  camera.position.z+=(safe.z-camera.position.z)*t;
  // Restore original FOV when V351 is disabled, rather than leaving the wider lens latched.
  const pc=camera as PerspectiveCamera;
  if(Math.abs(pc.fov-safe.fov)>.015){pc.fov+=(safe.fov-pc.fov)*t;pc.updateProjectionMatrix();}
  lookV369.current+=(safe.targetY-lookV369.current)*t;
  camera.lookAt(0,lookV369.current,0);
 });
 return null;
}
