"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { MusicContextValue } from "@/types/music";
import type { MusicGenre } from "@/types/animation";
import { usePlaybackPolling } from "@/hooks/usePlaybackPolling";
import { useGenreDetection } from "@/hooks/useGenreDetection";
import { readGenreMemory, writeGenreMemory, saveTrackCorrection, deleteTrackCorrection, recommendArtistGenre } from "@/services/genre/genreCorrectionMemory";
import type { GenreMemory } from "@/services/genre/genreCorrectionMemory";
import { disconnectSpotify } from "@/services/spotify/client";
const Context=createContext<MusicContextValue|null>(null);
export function MusicProvider({children}:{children:React.ReactNode}) {
 const {state,setState,refresh,trackId}=usePlaybackPolling();
 const detected=useGenreDetection(state.track);
 const [memory,setMemory]=useState(readGenreMemory);
 const [temporaryOverride,setTemporaryOverride]=useState<{trackId:string;genre:MusicGenre}|null>(null);
 const track=state.track;
 const storedOverride=track?memory.corrections.find(c=>c.trackId===track.id)?.genre??null:null;
 const genreOverride=track?(temporaryOverride!=null&&temporaryOverride.trackId===track.id?temporaryOverride.genre:storedOverride):null;
 const artistSuggestion=track&&!genreOverride?recommendArtistGenre(memory,track):null;
 const setGenreOverride=useCallback((genre:MusicGenre|null)=>{
  if(!track)return;
  setTemporaryOverride(null);
  const next=genre===null?deleteTrackCorrection(memory,track.id):saveTrackCorrection(memory,track,genre);
  if(writeGenreMemory(next))setMemory(next);
 },[memory,track]);
 const replaceGenreMemory=useCallback((next:GenreMemory)=>{if(writeGenreMemory(next)){setMemory(next);setTemporaryOverride(null);return true;}return false;},[]);
 const clearGenreMemory=useCallback(()=>{const next={version:1 as const,corrections:[]};if(writeGenreMemory(next)){setMemory(next);setTemporaryOverride(null);}},[]);
 const disconnect=useCallback(async()=>{await disconnectSpotify();trackId.current=null;setTemporaryOverride(null);setState({connected:false,connectionStatus:"disconnected",loading:false,error:null,track:null,progressMs:0,isPlaying:false,fetchedAt:0,lyrics:null});},[setState,trackId]);
 const genre=genreOverride??detected.detectedGenre;
 const genreFusion=genreOverride?null:detected.detectedFusion;
 const value=useMemo<MusicContextValue>(()=>({...state,refresh,disconnect,genre,...detected,genreFusion,genreSource:genreOverride?"manual":detected.genreSource,genreOverride,setGenreOverride,artistSuggestion,genreMemoryCount:memory.corrections.length,genreMemory:memory,replaceGenreMemory,clearGenreMemory}),[state,refresh,disconnect,genre,genreFusion,detected,genreOverride,setGenreOverride,artistSuggestion,memory,replaceGenreMemory,clearGenreMemory]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMusic(){const value=useContext(Context);if(!value)throw new Error("useMusic must be used within MusicProvider");return value;}
