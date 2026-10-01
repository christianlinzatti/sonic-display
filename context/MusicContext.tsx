"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from "react";
import type {MusicContextValue,MusicState,Track,Lyrics} from "@/types/music";
const Context=createContext<MusicContextValue|null>(null);
const initial:MusicState={connected:false,loading:true,error:null,track:null,progressMs:0,isPlaying:false,fetchedAt:0,lyrics:null};
export function MusicProvider({children}:{children:React.ReactNode}){
 const [state,setState]=useState(initial);const [retryDelay,setRetryDelay]=useState(4000);const trackId=useRef<string|null>(null);const busy=useRef(false);
 const refresh=useCallback(async()=>{if(busy.current)return;busy.current=true;try{
  const r=await fetch("/api/spotify/current",{cache:"no-store"});
  if(r.status===401){setState(s=>({...s,connected:false,loading:false,error:"Spotify-Anmeldung erforderlich."}));setRetryDelay(4000);return;}
  if(!r.ok){const retry=Number(r.headers.get("Retry-After"));throw Object.assign(new Error(`Spotify vorübergehend nicht erreichbar (${r.status})`),{retryAfter:Number.isFinite(retry)&&retry>0?retry:0});}
  const d=await r.json() as {connected:boolean;track:Track|null;progressMs:number;isPlaying:boolean;fetchedAt:number};
  const changed=!!d.track&&d.track.id!==trackId.current;trackId.current=d.track?.id??null;
  setState(s=>({...s,...d,loading:false,error:null,lyrics:changed?null:s.lyrics}));setRetryDelay(4000);
  if(changed&&d.track){const p=new URLSearchParams({title:d.track.title,artist:d.track.artist,album:d.track.album,duration:String(Math.round(d.track.durationMs/1000))});const lr=await fetch(`/api/lyrics?${p}`,{cache:"no-store"});if(lr.ok){const lyrics=await lr.json() as Lyrics|null;setState(s=>({...s,lyrics}));}}
 }catch(e){const retryAfter=(e as Error&{retryAfter?:number}).retryAfter;setState(s=>({...s,loading:false,error:e instanceof Error?e.message:"Verbindungsfehler"}));setRetryDelay(retryAfter?Math.min(retryAfter*1000,120000):d=>Math.min(Math.max(4000,d*2),60000));}finally{busy.current=false;}},[]);
 useEffect(()=>{let timer:number;let stopped=false;const tick=async()=>{await refresh();if(!stopped)timer=window.setTimeout(tick,retryDelay);};void tick();const visibility=()=>{if(document.visibilityState==="visible"){window.clearTimeout(timer);void tick();}};document.addEventListener("visibilitychange",visibility);return()=>{stopped=true;window.clearTimeout(timer);document.removeEventListener("visibilitychange",visibility);};},[refresh,retryDelay]);
 const disconnect=useCallback(async()=>{await fetch("/api/spotify/disconnect",{method:"POST"});trackId.current=null;setState(initial);},[]);
 const value=useMemo(()=>({...state,refresh,disconnect}),[state,refresh,disconnect]);return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMusic(){const v=useContext(Context);if(!v)throw new Error("useMusic must be used within MusicProvider");return v;}
