'use client';
/** Read-only live-concert GPU probe, only on an explicit localhost URL flag.
 * Samples the EXISTING ThreeAvatar WebGL renderer; no additional canvas or GPU assets.
 */
import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
export type LiveGpuSnapshotV767={sampledAt:number;geometries:number;textures:number;programs:number|null;drawCalls:number;triangles:number;contextLost:boolean;jsHeapBytes:number|null};
export type LiveGpuProbeV767={samples:LiveGpuSnapshotV767[];reset:()=>void;download:()=>void};
declare global{interface Window{__sonicV767Live?:LiveGpuProbeV767}}
function enabled(){
 if(typeof window==='undefined')return false;
 return ['localhost','127.0.0.1','::1'].includes(window.location.hostname) &&
   new URLSearchParams(window.location.search).get('gpuLeakV767')==='1';
}
export function LiveGpuMemoryProbeV767(){
 const gl=useThree(s=>s.gl);
 const last=useRef(-Infinity);
 const enabledRef=useRef(false);
 const samples=useRef<LiveGpuSnapshotV767[]>([]);
 useEffect(()=>{
   enabledRef.current=enabled();
   if(!enabledRef.current)return;
   const output:LiveGpuProbeV767={samples:samples.current,
     reset:()=>{samples.current.length=0;},
     download:()=>{
       const text=JSON.stringify({format:'sonic-v767-live-gpu',scope:'full-live-canvas',samples:samples.current},null,2);
       const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
       const a=document.createElement('a');a.href=url;a.download='gpu-memory-v767-live.json';a.click();
       setTimeout(()=>URL.revokeObjectURL(url),1000);
     }};
   window.__sonicV767Live=output;
   return ()=>{enabledRef.current=false;if(window.__sonicV767Live===output)delete window.__sonicV767Live;};
 },[]);
 useFrame(()=>{
   if(!enabledRef.current)return;
   const now=performance.now();if(now-last.current<1000)return;last.current=now;
   const mem=(performance as Performance&{memory?:{usedJSHeapSize?:number}}).memory?.usedJSHeapSize;
   samples.current.push({sampledAt:now,geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,
    programs:gl.info.programs?.length??null,drawCalls:gl.info.render.calls,triangles:gl.info.render.triangles,
    contextLost:gl.getContext().isContextLost(),jsHeapBytes:typeof mem==='number'?mem:null});
   // Fixed-size ring buffer: ~2 minutes of 1Hz samples; no unbounded JS telemetry allocation.
   if(samples.current.length>120)samples.current.splice(0,samples.current.length-120);
 });
 return null;
}
