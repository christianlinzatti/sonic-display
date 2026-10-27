'use client';
/** Read-only instrumentation of the EXISTING live R3F scene, active only on loopback opt-in. */
import {useFrame,useThree} from '@react-three/fiber';
import {Box3,Vector3} from 'three';
import {useRef} from 'react';
import {v592LoopbackAllowed,type V592CanvasSnapshot,type V592Bounds} from './liveStageQualityV592';
declare global {interface Window{__sonicV592Canvas?:V592CanvasSnapshot;}}
const corners=Array.from({length:8},()=>new Vector3());
export function LiveStageCanvasProbeV592(){
 const {scene,camera,gl}=useThree();const last=useRef(-Infinity);
 useFrame(({clock})=>{
  if(typeof window==='undefined')return;
  if(!v592LoopbackAllowed(window.location)){if(window.__sonicV592Canvas)delete window.__sonicV592Canvas;return;}
  const elapsed=clock.getElapsedTime();if(elapsed-last.current<.4)return;last.current=elapsed;
  const actors:V592CanvasSnapshot['actors']=[];
  scene.traverse(object=>{
   if(object.userData?.sonicV592GlbActor!==true)return;
   let meshes=0;object.traverse(child=>{if((child as {isMesh?:boolean}).isMesh)meshes++;});
   const box=new Box3().setFromObject(object,true);let bounds:V592Bounds|null=null;
   if(meshes&& !box.isEmpty()){
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(let i=0;i<8;i++){
     const v=corners[i].set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).project(camera);
     minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);
    }
    if([minX,maxX,minY,maxY].every(Number.isFinite))bounds={minX,maxX,minY,maxY};
   }
   actors.push({meshes,bounds});
  });
  window.__sonicV592Canvas={sampledAt:performance.now(),webglVersion:gl.capabilities.isWebGL2?'WebGL2':'WebGL1',actors,
   drawCalls:gl.info.render.calls,triangles:gl.info.render.triangles,
   camera:{x:camera.position.x,y:camera.position.y,z:camera.position.z},contextLost:gl.getContext().isContextLost()};
 });
 return null;
}
