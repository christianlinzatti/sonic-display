"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { MusicContextValue } from "@/types/music";
import type { MusicGenre } from "@/types/animation";
import { usePlaybackPolling } from "@/hooks/usePlaybackPolling";
import { useGenreDetection } from "@/hooks/useGenreDetection";
import { disconnectSpotify } from "@/services/spotify/client";
const Context=createContext<MusicContextValue|null>(null);
export function MusicProvider({children}:{children:React.ReactNode}) {
 const {state,setState,refresh,trackId}=usePlaybackPolling();
 const detected=useGenreDetection(state.track);
 const [genreOverride,setGenreOverrideState]=useState<MusicGenre|null>(null);
 const setGenreOverride=useCallback((genre:MusicGenre|null)=>setGenreOverrideState(genre),[]);
 const disconnect=useCallback(async()=>{await disconnectSpotify();trackId.current=null;setGenreOverrideState(null);setState({connected:false,connectionStatus:"disconnected",loading:false,error:null,track:null,progressMs:0,isPlaying:false,fetchedAt:0,lyrics:null});},[setState,trackId]);
 const genre=genreOverride??detected.detectedGenre;
 const value=useMemo(()=>({...state,refresh,disconnect,genre,...detected,genreSource:genreOverride?"manual":detected.genreSource,genreOverride,setGenreOverride}),[state,refresh,disconnect,genre,detected,genreOverride,setGenreOverride]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMusic(){const value=useContext(Context);if(!value)throw new Error("useMusic must be used within MusicProvider");return value;}
