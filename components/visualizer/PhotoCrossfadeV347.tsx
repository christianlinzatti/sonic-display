"use client";
import {useEffect,useState,type CSSProperties} from 'react';
/** Crossfade changes only the DOM image. Never creates extra Three.js meshes. */
export function PhotoCrossfadeV347({src,alt,enabled,durationMs,onError,className=''}:{
 src:string;alt:string;enabled:boolean;durationMs:number;onError:()=>void;className?:string;
}){
 const [display,setDisplay]=useState<{current:string;previous:string|null}>({current:src,previous:null});
 useEffect(()=>{
  if(!enabled){setDisplay({current:src,previous:null});return;}
  setDisplay(old=>old.current===src?old:{current:src,previous:old.current});
 },[src,enabled]);
 useEffect(()=>{
  if(!display.previous)return;
  const timer=window.setTimeout(()=>setDisplay(old=>old.current===display.current?{...old,previous:null}:old),durationMs+70);
  return()=>window.clearTimeout(timer);
 },[display.current,display.previous,durationMs]);
 const fading=enabled&&!!display.previous;
 return <div className={`sonic-photo-crossfade-v347 ${className}`} style={{'--sonic-photo-fade-ms':`${durationMs}ms`} as CSSProperties}>
  {fading&&<img key={`prev-${display.previous}`} className="sonic-photo-crossfade-out-v347" aria-hidden="true" src={display.previous!} alt=""/>}
  <img key={display.current} className={fading?'sonic-photo-crossfade-in-v347':''} src={display.current} alt={alt} onError={onError}/>
 </div>;
}
