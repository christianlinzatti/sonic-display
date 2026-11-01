'use client';
import {useSyncExternalStore} from 'react';
import {EMPTY_CONCERT_DASHBOARD_V751,concertDashboardSignatureV751,
  type ConcertDashboardSnapshotV751} from './concertDashboardProjectionV751';
export const V751_OPEN_RENDER_QA_EVENT='sonic:v751-open-render-qa';
let snapshot:ConcertDashboardSnapshotV751=EMPTY_CONCERT_DASHBOARD_V751;
let signature='';
const observers=new Set<()=>void>();
const subscribe=(fn:()=>void)=>{observers.add(fn);return()=>{observers.delete(fn);};};
export function useConcertDashboardV751():ConcertDashboardSnapshotV751{
 return useSyncExternalStore(subscribe,()=>snapshot,()=>EMPTY_CONCERT_DASHBOARD_V751);
}
/** Called by the actual playback stage. Updates are capped at 1 Hz if the
 * diagnosis has not changed; consumers do not start their own polling loop. */
export function publishConcertDashboardV751(next:ConcertDashboardSnapshotV751):void{
 if(!Number.isFinite(next.at)||next.at<=0)return;
 const sig=concertDashboardSignatureV751(next);
 if(sig===signature&&next.at-snapshot.at<1000)return;
 if(next.at<snapshot.at)return;
 snapshot=next;signature=sig;
 for(const cb of observers)cb();
}
export function resetConcertDashboardV751():void{
 snapshot=EMPTY_CONCERT_DASHBOARD_V751;signature='';
 for(const cb of observers)cb();
}
