"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { spotifyMusicSource } from "@/services/musicSource";
import { fetchLyrics } from "@/services/lyrics/client";
import type { CurrentTrackResponse, Lyrics, MusicState } from "@/types/music";

const NORMAL_INTERVAL = 5000;
const MAX_BACKOFF = 60000;
const initial: MusicState = { connected:false, connectionStatus:"disconnected", loading:true, error:null, track:null, progressMs:0, isPlaying:false, fetchedAt:0, lyrics:null };

export function usePlaybackPolling() {
  const [state,setState] = useState<MusicState>(initial);
  const [retryDelay,setRetryDelay] = useState(NORMAL_INTERVAL);
  const trackId = useRef<string|null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const data: CurrentTrackResponse = await spotifyMusicSource.fetchPlayback();
      if (!mounted.current) return;
      const changed = !!data.track && data.track.id !== trackId.current;
      trackId.current = data.track?.id ?? null;
      setState(s => ({ ...s, ...data, loading:false, connectionStatus:"connected", error:null, lyrics:changed?null:s.lyrics }));
      setRetryDelay(NORMAL_INTERVAL);
      if (changed && data.track) {
        try { const lyrics:Lyrics|null = await fetchLyrics(data.track); if(mounted.current) setState(s=>({...s,lyrics})); }
        catch { if(mounted.current) setState(s=>({...s,lyrics:null})); }
      }
    } catch (cause) {
      if (!mounted.current) return;
      const err = cause as Error & { status?:number; retryAfter?:number };
      if (err.status === 401) {
        setState(s=>({...s,connected:false,connectionStatus:"disconnected",loading:false,error:"Spotify-Anmeldung erforderlich."}));
        setRetryDelay(NORMAL_INTERVAL);
      } else {
        setState(s=>({...s,loading:false,connectionStatus:s.connected?"reconnecting":"disconnected",error:err.message||"Verbindungsfehler"}));
        setRetryDelay(err.retryAfter ? Math.min(err.retryAfter*1000,120000) : d=>Math.min(d*2,MAX_BACKOFF));
      }
    } finally { busy.current=false; }
  },[]);

  useEffect(()=>{ mounted.current=true; let timer:number|undefined; let stopped=false;
    const schedule=()=>{ if(!stopped) timer=window.setTimeout(async()=>{await refresh();schedule();},retryDelay); };
    const tick=async()=>{await refresh();schedule();};
    void tick();
    const onVisibility=()=>{if(document.visibilityState==="visible"){if(timer)window.clearTimeout(timer);void tick();}};
    document.addEventListener("visibilitychange",onVisibility);
    return()=>{stopped=true;mounted.current=false;if(timer)window.clearTimeout(timer);document.removeEventListener("visibilitychange",onVisibility);};
  },[refresh,retryDelay]);
  return { state, refresh, setState, trackId };
}
