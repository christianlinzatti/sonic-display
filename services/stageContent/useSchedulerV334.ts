"use client";
import {useEffect,useState} from 'react';
import {readSchedulerV334,SCHEDULER_EVENT_V334,SCHEDULER_KEY_V334} from './schedulerV334';
export function useSchedulerV334(){
 const [settings,setSettings]=useState(readSchedulerV334);
 useEffect(()=>{const refresh=()=>setSettings(readSchedulerV334());const storage=(e:StorageEvent)=>{if(e.key===SCHEDULER_KEY_V334)refresh();};
 refresh();window.addEventListener(SCHEDULER_EVENT_V334,refresh);window.addEventListener('storage',storage);
 return()=>{window.removeEventListener(SCHEDULER_EVENT_V334,refresh);window.removeEventListener('storage',storage);};},[]);
 return settings;
}
