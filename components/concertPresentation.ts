'use client';
import {useSyncExternalStore} from 'react';
let enabled=false;
const listeners=new Set<()=>void>();
export function setConcertPresentation(value:boolean){enabled=value;for(const fn of listeners)fn();}
export function useConcertPresentation(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>enabled,()=>false);}
