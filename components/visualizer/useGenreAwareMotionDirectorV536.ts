"use client";
/** V536: no extra useFrame/mixer; uses existing time/section props. */
import {useEffect,useRef,useState} from 'react';
import {newGenreMotionStateV536,stepGenreMotionV536,type GenreMotionInputV536} from './genreAwareMotionDirectorV536';
import {newLongFormMotionStateV588,stepLongFormChoreographyV588} from './longFormChoreographyV588';
export function useGenreAwareMotionDirectorV536(input:GenreMotionInputV536):string|null {
  const state=useRef(newGenreMotionStateV536());
  const longFormV588=useRef(newLongFormMotionStateV588());
  const [published,setPublished]=useState({trackId:'',modelKey:'',selectedName:null as string|null});
  const {clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority}=input;
  useEffect(()=>{
    const next=stepGenreMotionV536(state.current,{clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority});
    state.current=next;
    // V588: long-song repertoire rotation, still under V536's safety/ownership gates.
    const planned=stepLongFormChoreographyV588(longFormV588.current,
      {clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority},next);
    longFormV588.current=planned;
    setPublished(prev=>prev.trackId===next.trackId&&prev.modelKey===next.modelKey&&prev.selectedName===planned.selectedName
      ?prev:{trackId:next.trackId,modelKey:next.modelKey,selectedName:planned.selectedName});
  },[clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority]);
  if(!playing||reducedMotion||manualPriority||published.trackId!==(trackId??'')||published.modelKey!==modelKey)return null;
  return clips.some(c=>c.name===published.selectedName)?published.selectedName:null;
}
