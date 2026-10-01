"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import type {MusicContextValue,MusicState,Track,Lyrics} from "@/types/music";
const Context=createContext<MusicContextValue|null>(null);
const initial:MusicState={connected:false,loading:true,error:null,track:null,progressMs:0,isPlaying:false,fetchedAt:0,lyrics:null};
export function MusicProvider({children}:{children:React.ReactNode}){
 const [state,setState]=useState(initial);
 const refresh=useCallback(async()=>{try{const r=await fetch("/api/spotify/current",{cache:"no-store"});if(r.status===401){setState(s=>({...s,connected:false,loading:false}));return;}if(!r.ok)throw new Error(`API request failed (${r.status})`);const d=await r.json() as {connected:boolean;track:Track|null;progressMs:number;isPlaying:boolean;fetchedAt:number};setState(s=>({...s,...d,loading:false,error:null,lyrics:d.track?.id===s.track?.id?s.lyrics:null}));if(d.track&&d.track.id!==state.track?.id){const p=new URLSearchParams({title:d.track.title,artist:d.track.artist,album:d.track.album,duration:String(Math.round(d.track.durationMs/1000))});const lr=await fetch(`/api/lyrics?${p}`,{cache:"no-store"});if(lr.ok){const lyrics=await lr.json() as Lyrics|null;setState(s=>({...s,lyrics}));}}}catch(e){setState(s=>({...s,loading:false,error:e instanceof Error?e.message:"Unknown error"}));}},[state.track?.id]);
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),4000);return()=>window.clearInterval(id);},[refresh]);
 const disconnect=useCallback(async()=>{await fetch("/api/spotify/disconnect",{method:"POST"});setState(initial);},[]);
 const value=useMemo(()=>({...state,refresh,disconnect}),[state,refresh,disconnect]);return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMusic(){const v=useContext(Context);if(!v)throw new Error("useMusic must be used within MusicProvider");return v;}
