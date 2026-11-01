'use client';
import {useSyncExternalStore} from 'react';
import type {ConcertInspectionV801,ConcertInspectorEvidenceV801} from './concertExperienceInspectorV801';
import type {ShowPlanV790} from './cinematicShowDirectorV790';
import type {ConcertExperiencePlanV800} from './concertExperienceMilestoneV800';
export type ConcertInspectorSnapshotV801={at:number;progressMs:number;playing:boolean;
  report:ConcertInspectionV801;plan?:ShowPlanV790;audit?:ConcertExperiencePlanV800;
  evidence?:ConcertInspectorEvidenceV801};
export const EMPTY_CONCERT_INSPECTOR_V801:ConcertInspectorSnapshotV801={at:0,
  progressMs:0,playing:false,report:{source:'unavailable',trackId:'',durationMs:0,
  coverage:0,sceneCount:0,structureScore:null,findings:[],scenes:[],
  summary:{attention:0,information:0,unverifiedLanes:0},note:'Keine laufende Show.'}};
let snapshot=EMPTY_CONCERT_INSPECTOR_V801;
const listeners=new Set<()=>void>();
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
/** Read-only telemetry: identity stable between updates, no persistent data. */
export function useConcertInspectorV801():ConcertInspectorSnapshotV801{
  return useSyncExternalStore(subscribe,()=>snapshot,()=>EMPTY_CONCERT_INSPECTOR_V801);
}
export function publishConcertInspectorV801(next:ConcertInspectorSnapshotV801):void{
  if(!Number.isFinite(next.at)||next.at<=0||!Number.isFinite(next.progressMs))return;
  if(next.at<snapshot.at)return;
  if(next.report===snapshot.report&&next.playing===snapshot.playing&&
    next.at-snapshot.at<950)return;
  snapshot=next;
  listeners.forEach(l=>l());
}
export function resetConcertInspectorV801():void{
  snapshot=EMPTY_CONCERT_INSPECTOR_V801;
  listeners.forEach(l=>l());
}
