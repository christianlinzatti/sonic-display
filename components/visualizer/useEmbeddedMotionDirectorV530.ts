"use client";
/** Render-safe adapter: no useFrame, no new mixer and no per-frame GLB parsing. */
import {useEffect,useRef,useState} from 'react';
import {newEmbeddedMotionStateV530,stepEmbeddedMotionV530,type EmbeddedClipV530} from './embeddedMotionDirectorV530';
export function useEmbeddedMotionDirectorV530(input:{
  clips:readonly EmbeddedClipV530[];modelKey:string;trackId:string|null|undefined;
  progressMs:number|null|undefined;section:string|null|undefined;genre:string|null|undefined;
  energy:number|null|undefined;bpm:number|null|undefined;slot:number;
  playing:boolean;reducedMotion:boolean;manualPriority:boolean;
}):string|null {
  const state=useRef(newEmbeddedMotionStateV530());
  const [selection,setSelection]=useState<{modelKey:string;trackId:string;name:string|null}>({modelKey:'',trackId:'',name:null});
  const {clips,modelKey,trackId,progressMs,section,genre,energy,bpm,slot,playing,reducedMotion,manualPriority}=input;
  useEffect(()=>{
    const next=stepEmbeddedMotionV530(state.current,{clips,modelKey,trackId,progressMs,section,genre,energy,bpm,slot,playing,reducedMotion,manualPriority});
    state.current=next;
    setSelection(old=>old.name===next.selectedName&&old.modelKey===next.modelKey&&old.trackId===next.trackId
      ?old:{modelKey:next.modelKey,trackId:next.trackId,name:next.selectedName});
  },[clips,modelKey,trackId,progressMs,section,genre,energy,bpm,slot,playing,reducedMotion,manualPriority]);
  // Do not show stale selection between a manual edit, model change, stop or seek.
  if (!playing||reducedMotion||manualPriority||selection.modelKey!==modelKey||selection.trackId!==(trackId??''))return null;
  return clips.some(c=>c.name===selection.name)?selection.name:null;
}
