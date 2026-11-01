'use client';

import {useEffect,useRef,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {
 LOOK_STORAGE_KEY_V676,parseLookLibraryV676,captureConcertLookV676,
 type LookLibraryV676,type LookPatchV676,
} from '@/lib/concert-look-designer-v676';
import {
 trustedAutoGenreV677,selectAutoConcertLookV677,safeToContinueAutoLookV677,
} from '@/lib/smart-concert-look-v677';

/** V677: library is browser-local; no history requests, external APIs or changes to vocals, lyrics,
 * camera and authored timelines. Auto Look is OFF until a user enables it in Concert Designer. */
export const LOOK_LIBRARY_UPDATED_V677='sonic-display:v677:look-library-updated';
export const AUTO_LOOK_STATUS_V677='sonic-display:v677:auto-look-status';
export function SmartConcertLookControllerV677(){
 const {track,connected,isPlaying,progressMs,genre,genreSource,genreConfidence,genreStatus,genreTrackId}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const [library,setLibrary]=useState<LookLibraryV676|null>(null);
 const [loaded,setLoaded]=useState(false);
 const applied=useRef<LookPatchV676|null>(null);
 const handledTrack=useRef<string|null>(null);
 useEffect(()=>{
  const reload=()=>{
   try{const raw=localStorage.getItem(LOOK_STORAGE_KEY_V676);
    setLibrary(raw===null?null:parseLookLibraryV676(raw));
   }catch{setLibrary(null);}
   setLoaded(true);
  };
  const storage=(event:StorageEvent)=>{if(event.key===LOOK_STORAGE_KEY_V676||event.key===null)reload();};
  reload();window.addEventListener(LOOK_LIBRARY_UPDATED_V677,reload);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(LOOK_LIBRARY_UPDATED_V677,reload);window.removeEventListener('storage',storage);};
 },[]);
 useEffect(()=>{
  if(preferences.smartLookAutoV677!==true){applied.current=null;handledTrack.current=null;return;}
  // A human (or another settings screen) changed a setting touched by the autopilot:
  // disengage instead of fighting manual preferences on the same or following song.
  if(applied.current&&!safeToContinueAutoLookV677(captureConcertLookV676(preferences),applied.current)){
   applied.current=null;handledTrack.current=null;
   updatePreferences({smartLookAutoV677:false});
   window.dispatchEvent(new CustomEvent(AUTO_LOOK_STATUS_V677,{detail:'Automatik angehalten: Eine Bühnen-, Licht- oder Tanz-Einstellung wurde manuell geändert.'}));
   return;
  }
  // Late genre lookups must not interrupt an established verse, hook or drop.
  if(!loaded||!library||!connected||!isPlaying||!track?.id||progressMs>20000)return;
  const accepted=trustedAutoGenreV677({trackId:track.id,detectedForTrackId:genreTrackId,genre,source:genreSource,confidence:genreConfidence,status:genreStatus});
  if(!accepted)return;
  // One automatic choice per song start, regardless of background genre refetches or library edits.
  if(handledTrack.current===track.id)return;
  const choice=selectAutoConcertLookV677(library,accepted,track.id);
  if(!choice)return;
  handledTrack.current=track.id;
  const patch={...choice.look.patch};
  applied.current=patch;
  const current=captureConcertLookV676(preferences);
  if(!safeToContinueAutoLookV677(current,patch))updatePreferences(patch);
  window.dispatchEvent(new CustomEvent(AUTO_LOOK_STATUS_V677,{detail:`Auto-Look: „${choice.look.name}“ (${choice.mood}) für ${track.title} angewendet.`}));
 },[preferences,library,loaded,connected,isPlaying,progressMs,track?.id,track?.title,genre,genreSource,genreConfidence,genreStatus,genreTrackId,updatePreferences]);
 return null;
}
