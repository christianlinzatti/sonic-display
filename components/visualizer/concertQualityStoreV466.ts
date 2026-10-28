"use client";
import {useSyncExternalStore} from 'react';
import type {ConcertQualityAssessmentV466,ProjectedAvatarV466,ScreenRectV466} from '@/services/show/concertQualityInspectorV466';
import {observationFromConcertQualityV467,type ConcertQualityObservationV467} from '@/services/show/concertQualityAdvisorV467';
export interface ConcertQualitySnapshotV466 {
  at:number; canvas:ScreenRectV466|null; lyrics:ScreenRectV466|null;
  avatars:readonly ProjectedAvatarV466[];
  assessment:ConcertQualityAssessmentV466|null;
  fps:number|null; frameMs:number|null; p95FrameMs:number|null;
  drawCalls:number|null; triangles:number|null;
  qualityTier:string; samples:number;
  /** V467: opt-in, current-song-only, bounded history of V466 probe snapshots. */
  historyV467?:readonly ConcertQualityObservationV467[];
}
const empty:ConcertQualitySnapshotV466={at:0,canvas:null,lyrics:null,avatars:[],assessment:null,
 fps:null,frameMs:null,p95FrameMs:null,drawCalls:null,triangles:null,qualityTier:'?',samples:0,historyV467:[]};
let snapshot=empty;
let recentV467:ConcertQualityObservationV467[]=[];
const listeners=new Set<()=>void>();
const subscribe=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
export function useConcertQualityV466(){return useSyncExternalStore(subscribe,()=>snapshot,()=>empty);}
/** V641: read-only snapshot for an explicitly started, local full-song audit. */
export function getConcertQualitySnapshotV641():ConcertQualitySnapshotV466{return snapshot;}
export function publishConcertQualityV466(next:ConcertQualitySnapshotV466){
  if(next.at<=0){recentV467=[];}
  else {
    const o=observationFromConcertQualityV467(next);
    if(o){
      // Ignore exact-duplicate samples, out-of-order samples and old song remnants.
      const previous=recentV467[recentV467.length-1];
      if(!previous||o.at>previous.at){
        if(previous&&o.at-previous.at>4000)recentV467=[];
        recentV467=[...recentV467.slice(-3),o];
      }
    }
  }
  snapshot={...next,historyV467:recentV467};
  for(const cb of listeners)cb();
}
export function resetConcertQualityV466(){publishConcertQualityV466(empty);}

