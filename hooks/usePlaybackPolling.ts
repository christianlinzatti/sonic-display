"use client";
import {setupNetworkWakeV1010,resetClientSpotifyV1010,clientNetworkV1010} from '@/lib/networkCoordinatorV1010';
import {smartOfflineV1016} from '@/lib/smartOfflineV1016';
import { useCallback, useEffect, useRef, useState } from "react";
import { spotifyMusicSource } from "@/services/musicSource";
import { fetchLyrics } from "@/services/lyrics/client";
import type { CurrentTrackResponse, Lyrics, MusicState } from "@/types/music";
import {createSingleFlightPollingV654} from "./playbackPollingSchedulerV654";

const NORMAL_INTERVAL = 5000;
const MAX_BACKOFF = 60000;
const initial: MusicState = { connected:false, connectionStatus:"disconnected", loading:true, error:null, track:null, progressMs:0, isPlaying:false, fetchedAt:0, lyrics:null, offlineSnapshot:false };

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
        const scope=clientNetworkV1010.getAccount();
        // Account scope is set by Spotify's server-verified response, never by URL alone.
        smartOfflineV1016.setScope(scope);
        if(data.track)smartOfflineV1016.rememberPlayback(data.track,data.progressMs,data.fetchedAt);
        const knownLyrics=data.track?smartOfflineV1016.lyricsFor(data.track):null;
        setState(s => ({ ...s, ...data, loading:false, offlineSnapshot:false,
          connectionStatus:"connected", error:null, lyrics:!data.track?null:changed?knownLyrics:s.lyrics??knownLyrics }));
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
          const requestedScope=scope;
          const controller=new AbortController();
          lyricsAbort.current=controller;
          // Lyrics run independently: even a stuck optional provider never stalls Spotify.
          void fetchLyrics(data.track,controller.signal).then((lyrics:Lyrics|null)=>{
            if(current() && !controller.signal.aborted && trackId.current===requestedTrack &&
               clientNetworkV1010.getAccount()===requestedScope){
              if(lyrics){smartOfflineV1016.rememberLyrics(data.track!,lyrics);lyricsFailures.current=0;lyricsRetryAt.current=Number.POSITIVE_INFINITY;}
              else {lyricsFailures.current++;lyricsRetryAt.current=Date.now()+Math.min(120000,15000*2**Math.min(lyricsFailures.current-1,3));}
              setState(s=>({...s,lyrics:lyrics??s.lyrics}));
            }
          }).catch(()=>{
            if(current() && !controller.signal.aborted && trackId.current===requestedTrack &&
               clientNetworkV1010.getAccount()===requestedScope){
              lyricsFailures.current++;lyricsRetryAt.current=Date.now()+Math.min(120000,15000*2**Math.min(lyricsFailures.current-1,3));
              // Do not discard already shown lyrics after a transient network error.
              setState(s=>({...s,lyrics:s.lyrics??smartOfflineV1016.lyricsFor(data.track!)}));
            }
          }).finally(()=>{
            if(lyricsAbort.current===controller)lyricsAbort.current=null;
          });
        }
      }catch(cause){
        if(!current())return;
        const err=cause as Error & {status?:number;retryAfter?:number};
        if(err.status===401){
          smartOfflineV1016.clear();
          setState(s=>({...s,connected:false,connectionStatus:"disconnected",loading:false,
            error:"Spotify-Anmeldung erforderlich.",track:null,lyrics:null,offlineSnapshot:false,isPlaying:false}));
          retryDelay.current=NORMAL_INTERVAL;
        }else{
          const saved=smartOfflineV1016.lastKnown();
          setState(s=>({...s,...(!s.track&&saved?{track:saved.track,lyrics:saved.lyrics,
            progressMs:saved.progressMs,fetchedAt:saved.fetchedAt,connected:true}:{}),
            loading:false,isPlaying:false,offlineSnapshot:Boolean(s.track||saved),
            connectionStatus:s.connected||saved?"reconnecting":"disconnected",
            error:"Letzter bestätigter Stand – Spotify derzeit nicht erreichbar."}));
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
    const onAccountChange=()=>{
      // A logout in this or another tab invalidates visible private content immediately.
      generation.current++;lyricsAbort.current?.abort();lyricsAbort.current=null;
      playbackAbort.current?.abort();pending.current=null;trackId.current=null;
      smartOfflineV1016.clear();setState({...initial,loading:false});poll.wake();
    };
    const onStorage=(event:StorageEvent)=>{
      if(event.key==='sonic:spotify-account-changed-v1010')onAccountChange();
    };
    window.addEventListener('sonic:spotify-account-changed-v1010',onAccountChange);
    window.addEventListener('storage',onStorage);
    const onVisibility=()=>{if(document.visibilityState==="visible")poll.wake();};
    const onOnline=()=>{retryAt.current=0;retryDelay.current=NORMAL_INTERVAL;poll.wake();};
    const onOffline=()=>{const saved=smartOfflineV1016.lastKnown();
      setState(s=>({...s,...(!s.track&&saved?{track:saved.track,lyrics:saved.lyrics,
        progressMs:saved.progressMs,fetchedAt:saved.fetchedAt,connected:true}:{}),
        isPlaying:false,offlineSnapshot:Boolean(s.track||saved),
        connectionStatus:s.connected||saved?"reconnecting":"disconnected",
        error:"Offline – letzter bestätigter Stand; Wiedergabe nicht live überprüft."}));};
    document.addEventListener("visibilitychange",onVisibility);
    window.addEventListener('online',onOnline);window.addEventListener('offline',onOffline);
    return()=>{
      mounted.current=false;generation.current++;playbackAbort.current?.abort();
      poll.stop();pollStop.current=null;lyricsAbort.current?.abort();lyricsAbort.current=null;
      pending.current=null;document.removeEventListener("visibilitychange",onVisibility);
      window.removeEventListener('online',onOnline);window.removeEventListener('offline',onOffline);
      window.removeEventListener('sonic:spotify-account-changed-v1010',onAccountChange);
      window.removeEventListener('storage',onStorage);stopNetworkWake();
    };
  },[refresh]);
  const invalidateSession=useCallback(()=>{
    // Invalidate BEFORE the disconnect HTTP request. Even an already-resolved
    // Spotify response cannot resurrect a disconnected UI.
    disconnected.current=true;generation.current++;smartOfflineV1016.clear();resetClientSpotifyV1010();playbackAbort.current?.abort();
    pollStop.current?.();lyricsAbort.current?.abort();lyricsAbort.current=null;
    pending.current=null;trackId.current=null;
    setState({connected:false,connectionStatus:"disconnected",loading:false,error:null,track:null,progressMs:0,isPlaying:false,fetchedAt:0,lyrics:null,offlineSnapshot:false});
  },[]);
  return { state, refresh, setState, trackId, invalidateSession };
}
