'use client';
import {useSyncExternalStore} from 'react';
import {advanceConcertSnapshotV480,emptyConcertSnapshotV480,
 type ConcertInputV480,type ConcertSnapshotV480} from '@/services/monitoring/concertPerformanceDiagnosticsV480';

const empty=emptyConcertSnapshotV480();
let snapshot:ConcertSnapshotV480=empty;
const listeners=new Set<()=>void>();
const subscribe=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
/** Called by the existing V479 sampler about once a second. No extra timers. */
export function recordConcertDiagnosticsV480(input:ConcertInputV480){
  const next=advanceConcertSnapshotV480(snapshot,input);
  if(next===snapshot)return;
  snapshot=next;
  for(const listener of listeners)listener();
}
export function useConcertDiagnosticsV480(){return useSyncExternalStore(subscribe,()=>snapshot,()=>empty);}
export function clearConcertDiagnosticsV480(){
  snapshot=empty;
  for(const listener of listeners)listener();
}
