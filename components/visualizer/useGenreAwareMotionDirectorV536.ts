"use client";
/** V536: no extra useFrame/mixer; uses existing time/section props. */
import {useEffect,useRef,useState} from 'react';
import {newGenreMotionStateV536,stepGenreMotionV536,type GenreMotionInputV536} from './genreAwareMotionDirectorV536';
import {newLongFormMotionStateV588,stepLongFormChoreographyV588} from './longFormChoreographyV588';
import {newChoreographyVarietyStateV615,stepChoreographyVarietyV615} from './intelligentChoreographyVarietyV615';
import {newIntelligentMotionLibraryStateV639,stepIntelligentMotionLibraryV639} from './intelligentMotionLibraryV639';
export function useGenreAwareMotionDirectorV536(input:GenreMotionInputV536):string|null {
  const state=useRef(newGenreMotionStateV536());
  const longFormV588=useRef(newLongFormMotionStateV588());
  const varietyV615=useRef(newChoreographyVarietyStateV615());
  const libraryV639=useRef(newIntelligentMotionLibraryStateV639());
  const [published,setPublished]=useState({trackId:'',modelKey:'',selectedName:null as string|null});
  const {clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority}=input;
  useEffect(()=>{
    const next=stepGenreMotionV536(state.current,{clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority});
    state.current=next;
    // V588: long-song repertoire rotation, still under V536's safety/ownership gates.
    const planned=stepLongFormChoreographyV588(longFormV588.current,
      {clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority},next);
    longFormV588.current=planned;
    // V615: whole-song anti-repeat operates only on the approved automatic pool.
    const varied=stepChoreographyVarietyV615(varietyV615.current,
      {clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority},planned.selectedName);
    varietyV615.current=varied;
    // V639: quality-aware rotation of genre-compatible, already-loaded GLB actions.
    // No extra animation mixer or frame loop; V492 remains crossfade owner.
    const selectedV639=stepIntelligentMotionLibraryV639(libraryV639.current,
      {clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority},varied.selectedName);
    libraryV639.current=selectedV639;
    setPublished(prev=>prev.trackId===next.trackId&&prev.modelKey===next.modelKey&&prev.selectedName===selectedV639.selectedName
      ?prev:{trackId:next.trackId,modelKey,selectedName:selectedV639.selectedName});
  },[clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,playing,reducedMotion,manualPriority]);
  if(!playing||reducedMotion||manualPriority||published.trackId!==(trackId??'')||published.modelKey!==modelKey)return null;
  return clips.some(c=>c.name===published.selectedName)?published.selectedName:null;
}
