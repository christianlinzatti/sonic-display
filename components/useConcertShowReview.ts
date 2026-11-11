'use client';
import {useEffect,useRef} from 'react';
import {newConcertShowReview,sampleConcertShowReview,summarizeConcertShow,type ConcertShowReview,type ReviewClip,type ReviewPoint} from '@/lib/concertShowReview';
import {lyricLayoutAudit} from '@/lib/showQualityAudit';
import type {ConcertScoreV1134} from '@/lib/concertScoreV1134';
import {publishConcertReview} from './concertReviewStore';
type CameraSample={at:number;point:ReviewPoint};
type ClipSample={at:number;clip:string};
/** Reads rendered observations on the existing playback updates; owns no interval or audio. */
export function useConcertShowReview(cue:ConcertScoreV1134|null,playing:boolean,reducedMotion:boolean,concert:boolean){
 const enabled=!!cue?.production,source=cue?.sourceKey??'';
 const state=useRef<ConcertShowReview|null>(null),last=useRef(-Infinity),camera=useRef<CameraSample|null>(null),clips=useRef(new Map<number,ClipSample>());
 useEffect(()=>{
  state.current=enabled?newConcertShowReview(source,0):null;camera.current=null;clips.current.clear();last.current=-Infinity;publishConcertReview(null);
  if(!enabled)return;
  const onCamera=(event:Event)=>{
   const d=(event as CustomEvent).detail;
   if(d?.scoreSourceV1136!==source||d.showReviewEligible!==true||!d.playing||d.reducedMotion||d.mode!=='auto'||!['Automatische Regie','Automatische Basisregie'].includes(d.source)||![d.camera?.x,d.camera?.y,d.camera?.z].every(Number.isFinite)){camera.current=null;return;}
   camera.current={at:performance.now(),point:{x:d.camera.x,y:d.camera.y,z:d.camera.z}};
  };
  const onCrew=(event:Event)=>{
   const d=(event as CustomEvent).detail;
   if(d?.source!==source||!Number.isInteger(d.slot)||d.slot<0||d.slot>=4)return;
   if(typeof d.clip==='string')clips.current.set(d.slot,{at:performance.now(),clip:d.clip});else clips.current.delete(d.slot);
  };
  window.addEventListener('sonic-camera-studio-status-v299',onCamera);window.addEventListener('sonic:crew-performance',onCrew);
  return()=>{window.removeEventListener('sonic-camera-studio-status-v299',onCamera);window.removeEventListener('sonic:crew-performance',onCrew);publishConcertReview(null);};
 },[enabled,source]);
 useEffect(()=>{
  if(!cue||!state.current)return;
  const now=performance.now();if(playing&&now-last.current<300)return;last.current=now;
  const duration=cue.durationMs??0;
  const visible=document.visibilityState==='visible'&&!document.querySelector('[role="dialog"][aria-modal="true"]');
  const region=document.querySelector<HTMLElement>('section.lyrics[data-show-production]:not([data-show-production="off"])');
  const line=region?.querySelector<HTMLElement>('.lyric.active');let layout:ReturnType<typeof lyricLayoutAudit>|undefined;
  if(line&&region){
   const lane=region.getBoundingClientRect(),rect=line.getBoundingClientRect(),stage=concert?document.querySelector('.immersive-stage canvas')?.getBoundingClientRect():undefined;
   const viewport={x:Math.max(0,lane.left),y:Math.max(0,lane.top),width:Math.min(innerWidth,lane.right)-Math.max(0,lane.left),height:Math.min(innerHeight,lane.bottom)-Math.max(0,lane.top)};
   layout=lyricLayoutAudit(rect,viewport,stage);
  }
  const actual:ReviewClip[]=[];for(const [slot,entry] of clips.current)if(now-entry.at<=1400)actual.push({slot,clip:entry.clip});
  sampleConcertShowReview(state.current,{source,nowMs:now,positionMs:cue.positionMs,durationMs:duration,playing,eligible:visible&&!reducedMotion,reading:cue.reading,
   intentionalMotif:cue.reading||cue.lyricFocus||!!cue.memory||!!cue.dialogue||cue.act!=='story',clips:actual,
   ...(camera.current&&now-camera.current.at<=1400?{camera:camera.current.point}:{}),...(layout?.measured?{lyrics:{clipped:layout.clipped,overlap:layout.overlap}}:{})});
  publishConcertReview(summarizeConcertShow(state.current));
 },[cue,playing,reducedMotion,concert,source]);
}
