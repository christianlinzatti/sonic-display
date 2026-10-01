"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { GenreDetectionStatus, MusicContextValue } from "@/types/music";
import type { MusicGenre } from "@/types/animation";
import { usePlaybackPolling } from "@/hooks/usePlaybackPolling";
import { disconnectSpotify } from "@/services/spotify/client";

const Context=createContext<MusicContextValue|null>(null);
type GenreResult = { genre: MusicGenre|null; matchedTag?:string|null; source?:"track"|"artist"; error?:string };

export function MusicProvider({children}:{children:React.ReactNode}) {
  const {state,setState,refresh,trackId}=usePlaybackPolling();
  const [detectedGenre,setDetectedGenre]=useState<MusicGenre|null>(null);
  const [genreStatus,setGenreStatus]=useState<GenreDetectionStatus>("idle");
  const [genreSource,setGenreSource]=useState<"track"|"artist"|null>(null);
  const [genreMatchedTag,setGenreMatchedTag]=useState<string|null>(null);
  const [genreError,setGenreError]=useState<string|null>(null);
  const [genreOverride,setGenreOverrideState]=useState<MusicGenre|null>(null);

  useEffect(()=>{
    if(!state.track){setDetectedGenre(null);setGenreStatus("idle");setGenreSource(null);setGenreMatchedTag(null);setGenreError(null);return;}
    const controller=new AbortController();
    setGenreStatus("loading");setGenreError(null);
    const params=new URLSearchParams({artist:state.track.artist,track:state.track.title});
    fetch(`/api/genre?${params}`,{signal:controller.signal})
      .then(async response=>{if(!response.ok)throw new Error(`Genre lookup failed (${response.status})`);return response.json() as Promise<GenreResult>;})
      .then(result=>{
        if(controller.signal.aborted)return;
        setDetectedGenre(result.genre??null);
        setGenreSource(result.genre?(result.source??null):null);
        setGenreMatchedTag(result.matchedTag??null);
        setGenreError(result.error??null);
        setGenreStatus(result.error?"error":result.genre?"detected":"unknown");
      })
      .catch(error=>{if(controller.signal.aborted)return;setDetectedGenre(null);setGenreSource(null);setGenreMatchedTag(null);setGenreError(error instanceof Error?error.message:"Genre lookup failed");setGenreStatus("error");});
    return ()=>controller.abort();
  },[state.track?.id,state.track?.artist,state.track?.title]);

  const setGenreOverride=useCallback((genre:MusicGenre|null)=>setGenreOverrideState(genre),[]);
  const disconnect=useCallback(async()=>{
    await disconnectSpotify();trackId.current=null;
    setDetectedGenre(null);setGenreStatus("idle");setGenreSource(null);setGenreMatchedTag(null);setGenreError(null);setGenreOverrideState(null);
    setState({connected:false,connectionStatus:"disconnected",loading:false,error:null,track:null,progressMs:0,isPlaying:false,fetchedAt:0,lyrics:null});
  },[setState,trackId]);
  const genre=genreOverride??detectedGenre;
  const value=useMemo(()=>({...state,refresh,disconnect,genre,detectedGenre,genreStatus,genreSource:genreOverride?"manual":genreSource,genreMatchedTag,genreError,genreOverride,setGenreOverride}),[state,refresh,disconnect,genre,detectedGenre,genreStatus,genreSource,genreMatchedTag,genreError,genreOverride,setGenreOverride]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMusic(){const value=useContext(Context);if(!value)throw new Error("useMusic must be used within MusicProvider");return value;}
