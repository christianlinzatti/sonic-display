'use client';
/** Opt-in diagnostic endpoint on real production stage, not a second renderer. */
import {useEffect} from 'react';
import {v592LoopbackAllowed,v592Status,v592BoundsWarning,type V592Status,type V592CanvasSnapshot} from './liveStageQualityV592';
export interface V592LiveState {status:V592Status;source:'real-visualizer-stage';trackId:string;durationMs:number;progressMs:number;
 playing:boolean;activeIndex:number;lyricsPresent:boolean;lyricsSynced:boolean;lyricsMode:string;canvasReady:boolean;
 canvas:V592CanvasSnapshot|null;warnings:string[];stageRect:{x:number;y:number;width:number;height:number}|null;
 lyricRect:{x:number;y:number;width:number;height:number}|null;}
interface V592API{state:()=>V592LiveState;}
declare global {interface Window{__sonicV592?:V592API;__sonicV592Canvas?:V592CanvasSnapshot;}}
export function LiveStageDomProbeV592({trackId,durationMs,progressMs,playing,activeIndex,lyricsPresent,lyricsSynced}:{
 trackId:string;durationMs:number;progressMs:number;playing:boolean;activeIndex:number;lyricsPresent:boolean;lyricsSynced:boolean;
}){
 useEffect(()=>{
  if(!v592LoopbackAllowed(window.location))return;
  const state=():V592LiveState=>{
   const stage=document.querySelector<HTMLElement>('[data-v592-live-stage]');
   const canvas=stage?.querySelector('canvas')??null;
   const stageBox=stage?.getBoundingClientRect(),canvasBox=canvas?.getBoundingClientRect();
   const lyric=stage?.querySelector<HTMLElement>('.immersive-lyrics-overlay')??
    document.querySelector<HTMLElement>('.layout .kinetic-lyrics, .layout [class*="lyrics"]');
   const lyricBox=lyric?.getBoundingClientRect();
   const stageRect=stageBox&&stageBox.width>0&&stageBox.height>0?
    {x:stageBox.x,y:stageBox.y,width:stageBox.width,height:stageBox.height}:null;
   const lyricRect=lyricBox&&lyricBox.width>0&&lyricBox.height>0?
    {x:lyricBox.x,y:lyricBox.y,width:lyricBox.width,height:lyricBox.height}:null;
   const webgl=window.__sonicV592Canvas??null;
   const canvasReady=Boolean(canvas&&canvas.width>0&&canvas.height>0&&canvasBox&&canvasBox.width>0&&canvasBox.height>0);
   const fresh=Boolean(webgl&&performance.now()-webgl.sampledAt<2000);
   const validActors=fresh?webgl!.actors.filter(x=>x.meshes>0&&x.bounds!==null).length:0;
   const status=v592Status({trackId,playing,canvas:canvasReady&&fresh,lyrics:lyricsPresent,glbActors:validActors,contextLost:webgl?.contextLost??false});
   const warnings=webgl?.actors.flatMap((actor,i)=>v592BoundsWarning(actor.bounds).map(s=>`Avatar ${i+1}: ${s}`))??[];
   if(!lyricsSynced&&lyricsPresent)warnings.push('Lyrics nicht als synchronisiert bestätigt');
   if(!lyricRect&&lyricsPresent)warnings.push('Lyrics im WebGL oder ohne messbaren DOM-Rechteckbereich');
   return {status,source:'real-visualizer-stage',trackId,durationMs,progressMs,playing,activeIndex,lyricsPresent,lyricsSynced,
    lyricsMode:lyricRect?'dom-overlay':'webgl-or-external',canvasReady,canvas:webgl,warnings,stageRect,lyricRect};
  };
  const api:V592API={state};window.__sonicV592=api;
  return ()=>{if(window.__sonicV592===api)delete window.__sonicV592;};
 },[trackId,durationMs,progressMs,playing,activeIndex,lyricsPresent,lyricsSynced]);
 return null;
}
