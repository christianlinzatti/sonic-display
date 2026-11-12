'use client';
import {forwardRef,useCallback,useEffect,useImperativeHandle,useMemo,useRef} from 'react';
import {CanvasTexture,LinearFilter,SRGBColorSpace,type Mesh,type MeshBasicMaterial} from 'three';
import {paintStageScreen,stageScreenImageUrl,type StageScreenTrack} from '@/lib/concertStageScreens';
export type StageScreenUpdate={count:number;opacity:number;lyric:string;source:string};
export type ConcertStageScreensHandle={update:(plan:StageScreenUpdate)=>void;read:()=>{count:number;image:string;title:string;lyric:boolean;opacity:number}};
export const ConcertStageScreens=forwardRef<ConcertStageScreensHandle,{track?:StageScreenTrack|null;enabled:boolean}>(function ConcertStageScreens({track,enabled},ref){
 const left=useRef<Mesh>(null),right=useRef<Mesh>(null),leftMaterial=useRef<MeshBasicMaterial>(null),rightMaterial=useRef<MeshBasicMaterial>(null);
 const data=useRef<{source:string;track:StageScreenTrack|null;image:HTMLImageElement|null;status:string;lyric:string}>({source:'',track:null,image:null,status:'none',lyric:''});
 const textures=useMemo(()=>[0,1].map(()=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=640;const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.minFilter=LinearFilter;texture.magFilter=LinearFilter;texture.generateMipmaps=false;return {canvas,texture};}),[]);
 useEffect(()=>()=>{for(const item of textures)item.texture.dispose();},[textures]);
 const paint=useCallback(()=>{for(let i=0;i<textures.length;i++){const context=textures[i].canvas.getContext('2d');if(context){paintStageScreen(context,data.current.track,data.current.image,data.current.lyric,i===0);textures[i].texture.needsUpdate=true;}}},[textures]);
 useEffect(()=>{
  let cancelled=false;data.current={source:enabled&&track?`track:${track.id}`:'',track:track??null,image:null,status:'none',lyric:''};paint();
  if(!enabled||!track)return;
  const url=stageScreenImageUrl(track.albumCoverUrl,location.origin);if(!url){data.current.status='fallback';return;}
  const image=new Image();image.crossOrigin='anonymous';data.current.status='loading';
  image.onload=()=>{if(cancelled)return;data.current.image=image.naturalWidth>0&&image.naturalHeight>0?image:null;data.current.status=data.current.image?'ready':'fallback';paint();};
  image.onerror=()=>{if(cancelled)return;data.current.status='fallback';paint();};image.src=url;
  return()=>{cancelled=true;image.onload=null;image.onerror=null;};
 },[enabled,track?.id,track?.title,track?.artist,track?.albumCoverUrl,textures,paint]);
 useImperativeHandle(ref,()=>({update(plan){
  const valid=data.current.source===plan.source,count=valid?plan.count:0;
  if(left.current)left.current.visible=count>=1;if(right.current)right.current.visible=count>=2;
  for(const material of [leftMaterial.current,rightMaterial.current])if(material)material.opacity=plan.opacity;
  const lyric=count>=2?plan.lyric:'';if(lyric!==data.current.lyric){data.current.lyric=lyric;const context=textures[1].canvas.getContext('2d');if(context){paintStageScreen(context,data.current.track,data.current.image,lyric,false);textures[1].texture.needsUpdate=true;}}
 },read(){return {count:Number(left.current?.visible===true)+Number(right.current?.visible===true),image:data.current.status,title:data.current.track?.title??'',lyric:!!data.current.lyric,opacity:leftMaterial.current?.opacity??0};}}),[textures]);
 return <group name="concert-side-screens">
  <mesh ref={left} name="concert-album-screen" visible={false} position={[-4.5,.15,-3.1]} rotation={[0,.14,0]}><planeGeometry args={[2.2,2.75]}/><meshBasicMaterial ref={leftMaterial} map={textures[0].texture} transparent depthWrite={false} toneMapped={false}/></mesh>
  <mesh ref={right} name="concert-title-screen" visible={false} position={[4.5,.15,-3.1]} rotation={[0,-.14,0]}><planeGeometry args={[2.2,2.75]}/><meshBasicMaterial ref={rightMaterial} map={textures[1].texture} transparent depthWrite={false} toneMapped={false}/></mesh>
 </group>;
});
