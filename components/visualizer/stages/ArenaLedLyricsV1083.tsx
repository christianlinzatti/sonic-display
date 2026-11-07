'use client';
import {useEffect,useState} from 'react';
import {CanvasTexture,SRGBColorSpace} from 'three';
import type {LedExperienceCueV1083} from '@/lib/arena360LedWallExperienceV1083';
/** One optional locally rasterized text surface; no font fetch or texture per frame.
 * The canvas texture belongs to this effect and is disposed on replacement/unmount.
 */
export function ArenaLedLyricsV1083({cue}: {cue:LedExperienceCueV1083}){
 const text=cue.active&&cue.look==='lyrics'?cue.lyric:'';
 const [asset,setAsset]=useState<{text:string;texture:CanvasTexture}|null>(null);
 useEffect(()=>{
  if(!text){setAsset(null);return;}
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const ctx=canvas.getContext('2d');if(!ctx){setAsset(null);return;}
  ctx.clearRect(0,0,512,128);
  ctx.font='bold 33px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.shadowColor='#3be3ff';ctx.shadowBlur=9;ctx.fillStyle='#e7faff';
  let size=33;while(ctx.measureText(text).width>475&&size>17){size-=2;ctx.font=`bold ${size}px system-ui, sans-serif`;}
  ctx.fillText(text,256,64,475);
  const tex=new CanvasTexture(canvas);tex.colorSpace=SRGBColorSpace;setAsset({text,texture:tex});
  return ()=>tex.dispose();
 },[text]);
 // Do not show a previous line during the one render before texture regeneration.
 if(!text||!asset||asset.text!==text)return null;
 return <mesh name="v1083-verified-lyrics" position={[0,-.65,-5.10]}
  renderOrder={1} frustumCulled={true}>
  <planeGeometry args={[3.8,.95]}/>
  <meshBasicMaterial map={asset.texture} transparent depthWrite={false} opacity={Math.min(.55,.25+cue.gain)} toneMapped={false}/>
 </mesh>;
}
