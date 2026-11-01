"use client";
import {useEffect,useRef,useState} from 'react';
import type {RecentPageV672} from '@/lib/recently-played-v672';
import {validArchiveOwnerV701} from '@/lib/persistent-listening-history-v701';
import {V702_CHANGE_EVENT,V702_POLL_INTERVAL_MS,V702_STATUS_EVENT,appendAutoHistoryV702,isAutoHistoryStorageKeyV702,readAutoHistoryConsentV702,writeAutoHistoryStatusV702} from '@/lib/automatic-listening-history-v702';

/** Runs only with a connected Sonic Display, after account-specific opt-in, in a visible browser tab.
 *  Nothing runs in a service worker, and no local archive data leaves this device. */
export function AutomaticListeningHistoryRecorderV702(){
 const activeRequest=useRef<AbortController|null>(null);
 const busy=useRef(false);
 const lastAttempt=useRef(0);
 const cooldownUntil=useRef(0);
 const [owner,setOwner]=useState<string|null>(null);
 useEffect(()=>{
  const controller=new AbortController();
  void (async()=>{
   try{
    const response=await fetch('/api/spotify/history-identity',{cache:'no-store',signal:controller.signal});
    if(!response.ok)return;
    const body=await response.json() as {spotifyUserId?:unknown};
    if(!controller.signal.aborted&&validArchiveOwnerV701(body.spotifyUserId)){
     setOwner(body.spotifyUserId);
    }
   }catch{/* No consent or identity is inferred from a failing request. */}
  })();
  return()=>{controller.abort();activeRequest.current?.abort();};
 },[]);
 useEffect(()=>{
  if(!owner)return;
  let stopped=false;
  const allowed=()=>!stopped&&document.visibilityState==='visible'&&document.hasFocus()&&navigator.onLine!==false&&readAutoHistoryConsentV702(window.localStorage,owner).enabled;
  const poll=async()=>{
   if(busy.current||!allowed()||Date.now()<cooldownUntil.current||Date.now()-lastAttempt.current<V702_POLL_INTERVAL_MS)return;
   lastAttempt.current=Date.now();
   busy.current=true;
   const controller=new AbortController();activeRequest.current=controller;
   try{
    // A fresh account check prevents silently writing another account's listening events after a login switch.
    const identity=await fetch('/api/spotify/history-identity',{cache:'no-store',signal:controller.signal});
    if(!identity.ok)return;
    const identityBody=await identity.json() as {spotifyUserId?:unknown};
    if(identityBody.spotifyUserId!==owner){controller.abort();return;}
    if(!allowed())return;
    const response=await fetch('/api/spotify/recently-played',{cache:'no-store',signal:controller.signal});
    if(response.status===429){
     const retry=Number(response.headers.get('Retry-After'));
     if(Number.isSafeInteger(retry)&&retry>0)cooldownUntil.current=Date.now()+Math.min(retry,86400)*1000;
     return;
    }
    if(!response.ok)return; // Spotify 401/403/5xx: do not fabricate or persist any events.
    const body=await response.json() as Partial<RecentPageV672>;
    if(!Array.isArray(body.tracks)||body.tracks.length>30||!allowed())return;
    const saved=appendAutoHistoryV702(window.localStorage,owner,body.tracks);
    if(saved.status==='saved'||saved.status==='no-new-events'){
     writeAutoHistoryStatusV702(window.localStorage,owner,{at:new Date().toISOString(),added:saved.added,trimmed:saved.trimmed});
     window.dispatchEvent(new Event(V702_STATUS_EVENT));
    }
   }catch{/* Offline, consent or storage failure: no retry storm or server-side persistence. */}
   finally{busy.current=false;if(activeRequest.current===controller)activeRequest.current=null;}
  };
  const reactToPreference=()=>{if(!readAutoHistoryConsentV702(window.localStorage,owner).enabled){activeRequest.current?.abort();return;}void poll();};
  const reactToStorage=(event:StorageEvent)=>{if(isAutoHistoryStorageKeyV702(event.key,owner))reactToPreference();};
  const reactToVisibility=()=>{if(document.visibilityState!=='visible'){activeRequest.current?.abort();return;}void poll();};
  const reactToOffline=()=>activeRequest.current?.abort();
  window.addEventListener(V702_CHANGE_EVENT,reactToPreference);
  window.addEventListener('storage',reactToStorage);
  window.addEventListener('focus',reactToPreference);
  window.addEventListener('online',reactToPreference);
  window.addEventListener('offline',reactToOffline);
  document.addEventListener('visibilitychange',reactToVisibility);
  const timer=window.setInterval(()=>void poll(),V702_POLL_INTERVAL_MS);
  // One modest initial check, only if the user already opted in.
  if(allowed())void poll();
  return()=>{stopped=true;activeRequest.current?.abort();window.clearInterval(timer);window.removeEventListener(V702_CHANGE_EVENT,reactToPreference);window.removeEventListener('storage',reactToStorage);window.removeEventListener('focus',reactToPreference);window.removeEventListener('online',reactToPreference);window.removeEventListener('offline',reactToOffline);document.removeEventListener('visibilitychange',reactToVisibility);};
 },[owner]);
 return null;
}
