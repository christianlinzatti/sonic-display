'use client';
import {useSyncExternalStore} from 'react';
import {readConcertSession} from '@/lib/concertSession';
let enabled:boolean|undefined;
const listeners=new Set<()=>void>();
export function setConcertPresentation(value:boolean){enabled=value;for(const fn of listeners)fn();}
function snapshot(){if(enabled===undefined&&typeof window!=='undefined')enabled=!!readConcertSession();return enabled??false;}
function subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
export function useConcertPresentation(){return useSyncExternalStore(subscribe,snapshot,()=>false);}
