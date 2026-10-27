"use client";
/** Render-safe V493 director: pure policy, React effect for decisions, no frame polling. */
import {useEffect,useRef,useState} from 'react';
import {newPresetDirectorStateV493,stepMotionPresetDirectorV493} from './intelligentMotionPresetDirectorV493';
import type {PreparedGltfBlendV492} from './useGltfBlendSetupV492';
export function useGltfMotionPresetDirectorV493({presets,selectedBase,trackId,positionMs,section,energy,bpm,slot,playing,reducedMotion,manualPriority,quality}:{
  presets:readonly PreparedGltfBlendV492[];selectedBase:string|null|undefined;trackId:string|null|undefined;
  positionMs:number;section:string|null|undefined;energy:number|null|undefined;bpm:number|null|undefined;slot:number;
  playing:boolean;reducedMotion:boolean;manualPriority:boolean;quality:string;
}):PreparedGltfBlendV492|null{
  const state=useRef(newPresetDirectorStateV493());
  const [selectedId,setSelectedId]=useState<string|null>(null);
  useEffect(()=>{
    const next=stepMotionPresetDirectorV493(state.current,{candidates:presets,selectedBase,trackId,positionMs,
      section,energy,bpm,slot,playing,reducedMotion,manualPriority,quality});
    state.current=next;
    setSelectedId(id=>id===next.selectedId?id:next.selectedId);
  },[presets,selectedBase,trackId,positionMs,section,energy,bpm,slot,playing,reducedMotion,manualPriority,quality]);
  // A changed clip/model or manual intervention must never expose an old overlay,
  // even for the one render before useEffect commits the new selection.
  if(manualPriority||!playing||reducedMotion||quality==='low'||!trackId)return null;
  return presets.find(p=>p.actionName===selectedId&&p.baseName===selectedBase)??null;
}
