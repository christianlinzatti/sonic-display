"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import type { MusicContextValue } from "@/types/music";
import { usePlaybackPolling } from "@/hooks/usePlaybackPolling";
import { disconnectSpotify } from "@/services/spotify/client";
const Context=createContext<MusicContextValue|null>(null);
export function MusicProvider({children}:{children:React.ReactNode}) {
  const {state,setState,refresh,trackId}=usePlaybackPolling();
  const disconnect=useCallback(async()=>{await disconnectSpotify();trackId.current=null;setState({connected:false,connectionStatus:"disconnected",loading:false,error:null,track:null,progressMs:0,isPlaying:false,fetchedAt:0,lyrics:null});},[setState,trackId]);
  const value=useMemo(()=>({...state,refresh,disconnect}),[state,refresh,disconnect]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMusic(){const value=useContext(Context);if(!value)throw new Error("useMusic must be used within MusicProvider");return value;}
