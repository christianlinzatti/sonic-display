"use client";
import {setupNetworkWakeV1010,resetClientSpotifyV1010} from '@/lib/networkCoordinatorV1010';
import { useCallback, useEffect, useRef, useState } from "react";
import { spotifyMusicSource } from "@/services/musicSource";
import { fetchLyrics } from "@/services/lyrics/client";
import type { CurrentTrackResponse, Lyrics, MusicState } from "@/types/music";
import {createSingleFlightPollingV654} from "./playbackPollingSchedulerV654";

const NORMAL_INTERVAL = 5000;
const MAX_BACKOFF = 60000;
const initial: MusicState = { connected:false, connectionStatus:"disconnected", loading:true, error:null, track:null, progressMs:0, isPlaying:false, fetchedAt:0, lyrics:null };

export function usePlaybackPolling() {
  const [state,setState] = useState<MusicState>(initial);
  const stateRef=useRef<MusicState>(initial);
  stateRef.current=state;
  const trackId = useRef<string|null>(null);
  const pending = useRef<Promise<void>|null>(null);
  const retryDelay = useRef(NORMAL_INTERVAL);
  const mounted = useRef(false);
  const generation = useRef(0);
  const lyricsAbort = useRef<AbortController|null>(null);
  const lyricsRetryAt=useRef(0);
  const lyricsFailures=useRef(0);
  const pollStop=useRef<(()=>void)|null>(null);
  const disconnected=useRef(false);
  const playbackAbort=useRef<AbortController|null>(null);
  const retryAt=useRef(0);

  const refresh = useCallback(():Promise<void> => {
    // Manual refresh, tab activation and periodic polls must share one request.
    if(disconnected.current||!mounted.current||Date.now()<retryAt.current)return Promise.resolve();
    if(pending.current)return pending.current;
    const requestGeneration=generation.current;
    const current=()=>mounted.current&&!disconnected.current&&generation.current===requestGeneration;
    const request=(async()=>{
      try {
        const data: CurrentTrackResponse = await spotifyMusicSource.fetchPlayback((playbackAbort.current=new AbortController()).signal);
        if(!current())return;
        const changed = data.track?.id !== (trackId.current ?? undefined);
        trackId.current = data.track?.id ?? null;
        setState(s => ({ ...s, ...data, loading:false, connectionStatus:"connected", error:null, lyrics:!data.track||changed?null:s.lyrics }));
        retryDelay.current=NORMAL_INTERVAL;
        if(changed){
          lyricsAbort.current?.abort();
          lyricsAbort.current=null;
          lyricsRetryAt.current=0;lyricsFailures.current=0;
        }
        // Lyrics are independent of playback. Retry transient errors on the SAME track,
        // with a backoff to avoid hammering missing/failed providers.
        if(data.track && !lyricsAbort.current &&
           (changed || (!stateRef.current.lyrics && Date.now()>=lyricsRetryAt.current))){
          const requestedTrack=data.track.id;
          const controller=new AbortController();
          lyricsAbort.current=controller;
          // Lyrics run independently: even a stuck optional provider never stalls Spotify.
          void fetchLyrics(data.track,controller.signal).then((lyrics:Lyrics|null)=>{
            if(current() && !controller.signal.aborted && trackId.current===requestedTrack){
              if(lyrics){lyricsFailures.current=0;lyricsRetryAt.current=Number.POSITIVE_INFINITY;}
              else {lyricsFailures.current++;lyricsRetryAt.current=Date.now()+Math.min(120000,15000*2**Math.min(lyricsFailures.current-1,3));}
              setState(s=>({...s,lyrics}));
            }
          }).catch(()=>{
            if(current() && !controller.signal.aborted && trackId.current===requestedTrack){
              lyricsFailures.current++;lyricsRetryAt.current=Date.now()+Math.min(120000,15000*2**Math.min(lyricsFailures.current-1,3));
              setState(s=>({...s,lyrics:null}));
            }
          }).finally(()=>{
            if(lyricsAbort.current===controller)lyricsAbort.current=null;
          });
        }
      }catch(cause){
        if(!current())return;
        const err=cause as Error & {status?:number;retryAfter?:number};
        if(err.status===401){
          setState(s=>({...s,connected:false,connectionStatus:"disconnected",loading:false,error:"Spotify-Anmeldung erforderlich.",track:null,lyrics:null}));
          retryDelay.current=NORMAL_INTERVAL;
        }else{
          setState(s=>({...s,loading:false,connectionStatus:s.connected?"reconnecting":"disconnected",error:err.message||"Verbindungsfehler"}));
          retryDelay.current=Number.isFinite(err.retryAfter)&&err.retryAfter!>0?Math.min(300000,err.retryAfter!):Math.min(retryDelay.current*2,MAX_BACKOFF);
          retryAt.current=Date.now()+retryDelay.current;
        }
      }
    })();
    pending.current=request;
    void request.then(()=>{if(pending.current===request)pending.current=null;},
      ()=>{if(pending.current===request)pending.current=null;});
    return request;
  },[]);

  useEffect(()=>{
    const stopNetworkWake=setupNetworkWakeV1010();
    mounted.current=true;disconnected.current=false;generation.current++;
    const poll=createSingleFlightPollingV654({
      run:refresh,delayMs:()=>Math.min(2147483647,Math.max(
        document.visibilityState==='hidden'?30000:NORMAL_INTERVAL,
        typeof navigator!=='undefined'&&navigator.onLine===false?60000:0,
        retryDelay.current,retryAt.current-Date.now())),
      clock:{setTimeout:(fn,ms)=>window.setTimeout(fn,ms),clearTimeout:id=>window.clearTimeout(id)},
    });
    pollStop.current=()=>poll.stop();
    poll.start();
    const onVisibility=()=>{if(document.visibilityState==="visible")poll.wake();};
    document.addEventListener("visibilitychange",onVisibility);
    return()=>{
      mounted.current=false;generation.current++;playbackAbort.current?.abort();
      poll.stop();pollStop.current=null;lyricsAbort.current?.abort();lyricsAbort.current=null;
      pending.current=null;document.removeEventListener("visibilitychange",onVisibility);stopNetworkWake();
    };
  },[refresh]);
  const invalidateSession=useCallback(()=>{
    // Invalidate BEFORE the disconnect HTTP request. Even an already-resolved
    // Spotify response cannot resurrect a disconnected UI.
    disconnected.current=true;generation.current++;resetClientSpotifyV1010();playbackAbort.current?.abort();
    pollStop.current?.();lyricsAbort.current?.abort();lyricsAbort.current=null;
    pending.current=null;trackId.current=null;
    setState({connected:false,connectionStatus:"disconnected",loading:false,error:null,track:null,progressMs:0,isPlaying:false,fetchedAt:0,lyrics:null});
  },[]);
  return { state, refresh, setState, trackId, invalidateSession };
}
