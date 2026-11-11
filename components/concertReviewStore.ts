'use client';
import {useSyncExternalStore} from 'react';
import type {ConcertShowSummary} from '@/lib/concertShowReview';
let current:ConcertShowSummary|null=null;
const listeners=new Set<()=>void>();
export function publishConcertReview(summary:ConcertShowSummary|null){current=summary;for(const listener of listeners)listener();}
const subscribe=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
export function useConcertReview(){return useSyncExternalStore(subscribe,()=>current,()=>null);}
