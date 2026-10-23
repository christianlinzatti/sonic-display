"use client";
import {analyzeMotionClipsV439} from "./glbMotionAnalyzerV439";
import {readMotionCacheV439,writeMotionCacheEntryV439} from "./glbMotionCacheV439";
import type {InstalledCharacterMotion} from "./characterMotionLibrary";

const MAX_BYTES=12*1024*1024;
const ERROR_RETRY_MS=12*60*60*1000;
const busy=new Set<string>();
const isGlb=(url:string)=>/\.glb(?:[?#]|$)/i.test(url);

async function boundedGlbBytes(url:string,signal:AbortSignal):Promise<ArrayBuffer>{
  const response=await fetch(url,{signal,credentials:"same-origin"});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const declared=Number(response.headers.get("content-length")||"0");
  if(declared>MAX_BYTES)throw new Error("GLB überschreitet Analyse-Limit");
  if(!response.body){const data=await response.arrayBuffer();if(data.byteLength>MAX_BYTES)throw new Error("GLB zu groß");return data;}
  const reader=response.body.getReader();
  const chunks:Uint8Array[]=[];let bytes=0;
  try{
    while(true){
      const {done,value}=await reader.read();if(done)break;
      if(!value)continue;
      bytes+=value.byteLength;
      if(bytes>MAX_BYTES){void reader.cancel();throw new Error("GLB zu groß");}
      chunks.push(value);
    }
  }finally{reader.releaseLock();}
  const all=new Uint8Array(bytes);let offset=0;
  for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.length;}
  if(bytes<12||new DataView(all.buffer).getUint32(0,true)!==0x46546c67)throw new Error("Kein GLB-Container");
  return all.buffer;
}

/** Single-file, on-demand load. Failures are cached briefly, not retried on each playback tick. */
export async function scanGlbMotionV439(m:InstalledCharacterMotion,signal?:AbortSignal,force=false):Promise<void>{
  if(typeof window==="object"&&window.navigator&&window.navigator.onLine===false)return;
  if(!isGlb(m.url)||busy.has(m.id))return;
  const cached=readMotionCacheV439()[m.id];
  if(!force&&cached?.url===m.url&&(cached.status!=="error"||Date.now()-cached.at<ERROR_RETRY_MS))return;
  busy.add(m.id);
  const controller=new AbortController();
  const onAbort=()=>controller.abort();
  signal?.addEventListener("abort",onAbort,{once:true});
  if(signal?.aborted)controller.abort();
  const deadline=window.setTimeout(()=>controller.abort(),13000);
  try{
    const bytes=await boundedGlbBytes(m.url,controller.signal);
    const {GLTFLoader}=await import("three/examples/jsm/loaders/GLTFLoader.js");
    if(controller.signal.aborted)return;
    const gltf=await new GLTFLoader().parseAsync(bytes,m.url.substring(0,m.url.lastIndexOf("/")+1));
    if(controller.signal.aborted)return;
    const features=analyzeMotionClipsV439(gltf.animations);
    writeMotionCacheEntryV439(m.id,{url:m.url,at:Date.now(),status:features?"ok":"unsupported",...(features?{features}:{})});
  }catch{
    if(!controller.signal.aborted)writeMotionCacheEntryV439(m.id,{url:m.url,at:Date.now(),status:"error"});
  }finally{
    window.clearTimeout(deadline);
    signal?.removeEventListener("abort",onAbort);
    busy.delete(m.id);
  }
}

/** Automatic scanning is capped per session/active avatar; an explicit button scans the remainder. */
export async function scanMotionLibraryV439(motions:readonly InstalledCharacterMotion[],avatarId:string,signal?:AbortSignal,maxFiles=12,force=false):Promise<void>{
  if(typeof window==="undefined")return;
  let attempted=0;
  for(const m of motions){
    if(signal?.aborted||attempted>=maxFiles)break;
    if(m.avatarId!==avatarId||!isGlb(m.url))continue;
    const cached=readMotionCacheV439()[m.id];
    if(!force&&cached?.url===m.url&&(cached.status!=="error"||Date.now()-cached.at<ERROR_RETRY_MS))continue;
    attempted++;
    await scanGlbMotionV439(m,signal,force);
  }
}
