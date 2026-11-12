"use client";
/** V536: no extra useFrame/mixer; uses existing time/section props. */
import {useEffect,useMemo,useRef,useState} from 'react';
import {newGenreMotionStateV536,stepGenreMotionV536,validGenreCandidateV536,libraryMotionEligibleV536,type GenreMotionInputV536} from './genreAwareMotionDirectorV536';
import {isMixamoMotion} from './mixamoMotionDirector';
import {mixamoEnsembleSelectionSlot} from './mixamoShowChoreography';
import {newLongFormMotionStateV588,stepLongFormChoreographyV588} from './longFormChoreographyV588';
import {newChoreographyVarietyStateV615,stepChoreographyVarietyV615} from './intelligentChoreographyVarietyV615';
import {newIntelligentMotionLibraryStateV639,stepIntelligentMotionLibraryV639} from './intelligentMotionLibraryV639';
export function useGenreAwareMotionDirectorV536(input:GenreMotionInputV536):string|null {
  const state=useRef(newGenreMotionStateV536());
  const longFormV588=useRef(newLongFormMotionStateV588());
  const varietyV615=useRef(newChoreographyVarietyStateV615());
  const libraryV639=useRef(newIntelligentMotionLibraryStateV639());
  const [published,setPublished]=useState({trackId:'',modelKey:'',selectedName:null as string|null});
  const {clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,ensembleCount,playing,reducedMotion,manualPriority}=input;
  // Duplicate avatars sharing the same library choose compatible hooks/drops
  // in a common lane. Verses keep independent lead/support repertoire.
  const eligibleMixamo=useMemo(()=>clips.some(c=>
    c.source==='library'&&isMixamoMotion(c.label)&&validGenreCandidateV536(c)&&
    libraryMotionEligibleV536(c,{bpm,genre,section})),[clips,bpm,genre,section]);
  const selectionSlot=mixamoEnsembleSelectionSlot({
    slot,ensembleCount:ensembleCount??1,section,hasEligibleMixamo:eligibleMixamo,
  });
  useEffect(()=>{
    const stageInput={clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot:selectionSlot,ensembleCount,playing,reducedMotion,manualPriority};
    const next=stepGenreMotionV536(state.current,stageInput);
    state.current=next;
    // V588: long-song repertoire rotation, still under V536's safety/ownership gates.
    const planned=stepLongFormChoreographyV588(longFormV588.current,
      stageInput,next);
    longFormV588.current=planned;
    // V615: whole-song anti-repeat operates only on the approved automatic pool.
    const varied=stepChoreographyVarietyV615(varietyV615.current,
      stageInput,planned.selectedName);
    varietyV615.current=varied;
    // V639: quality-aware rotation of genre-compatible, already-loaded GLB actions.
    // No extra animation mixer or frame loop; V492 remains crossfade owner.
    const selectedV639=stepIntelligentMotionLibraryV639(libraryV639.current,
      stageInput,varied.selectedName);
    libraryV639.current=selectedV639;
    setPublished(prev=>prev.trackId===next.trackId&&prev.modelKey===next.modelKey&&prev.selectedName===selectedV639.selectedName
      ?prev:{trackId:next.trackId,modelKey,selectedName:selectedV639.selectedName});
  },[clips,trackId,modelKey,progressMs,section,genre,bpm,energy,slot,ensembleCount,selectionSlot,playing,reducedMotion,manualPriority]);
  if(!playing||reducedMotion||manualPriority||published.trackId!==(trackId??'')||published.modelKey!==modelKey)return null;
  return clips.some(c=>c.name===published.selectedName)?published.selectedName:null;
}
