'use client';
import {useEffect,useRef,useState} from 'react';
import {validLastFmUsernameV706,V706_USERNAME_KEY,type LastFmPageV706} from '@/lib/lastfm-history-v706';
import {inspectLastFmGapV709,writeLastFmGapV709,V709_GAP_EVENT} from '@/lib/lastfm-recovery-v709';
import {readLastFmArchiveV706} from '@/lib/lastfm-history-v706';
import {openLongtermDbV713,loadAndMigrateHistoryV713,V713_CHANGE_EVENT} from '@/lib/lastfm-indexed-history-v713';
import {V710_STATUS_EVENT} from '@/lib/lastfm-health-v710';
import {V708_CHANGE_EVENT,V708_POLL_INTERVAL_MS,V708_STATUS_EVENT,appendAutoLastFmV708,lastFmAutoStorageKeyV708,mayPollLastFmV708,writeLastFmAutoStatusV708} from '@/lib/automatic-lastfm-history-v708';
/** V708: browser-only and strictly opt-in; runs with the dialog closed, not with the tab/browser closed. */
export function AutomaticLastFmHistoryRecorderV708(){
 const [username,setUsername]=useState<string|null>(null);
 const busy=useRef(false),request=useRef<AbortController|null>(null),lastAttempt=useRef(0),cooldownUntil=useRef(0);
 useEffect(()=>{
  const load=()=>{try{const v=window.localStorage.getItem(V706_USERNAME_KEY);setUsername(validLastFmUsernameV706(v)?v:null);}catch{setUsername(null);}};
  const storage=(event:StorageEvent)=>{if(lastFmAutoStorageKeyV708(event.key))load();};
  load();window.addEventListener(V708_CHANGE_EVENT,load);window.addEventListener('storage',storage);
  return()=>{request.current?.abort();window.removeEventListener(V708_CHANGE_EVENT,load);window.removeEventListener('storage',storage);};
 },[]);
 useEffect(()=>{
  if(!username)return;
  // V713: mirror every V708/V710 local write into IndexedDB, including when the History dialog is closed.
  // No Last.fm request or scrobble is sent by this bridge.
  let bridgeStopped=false;
  const mirror=async()=>{
   try{
    if(bridgeStopped||window.localStorage.getItem(V706_USERNAME_KEY)!==username)return;
    const db=await openLongtermDbV713();
    try{await loadAndMigrateHistoryV713(db,window.localStorage,username);}
    finally{db.close();}
    if(!bridgeStopped&&window.localStorage.getItem(V706_USERNAME_KEY)===username)window.dispatchEvent(new Event(V713_CHANGE_EVENT));
   }catch{/* IndexedDB may be disabled/full; V706 data remains intact; user panel reports the failure. */}
  };
  const localChange=(event:StorageEvent)=>{if(event.key===null||event.key.startsWith('sonic-display:lastfm:history:v706:'))void mirror();};
  window.addEventListener(V708_STATUS_EVENT,mirror);window.addEventListener(V710_STATUS_EVENT,mirror);window.addEventListener('storage',localChange);
  void mirror();
  let stopped=false;
  const allowed=()=>!stopped&&document.visibilityState==='visible'&&document.hasFocus()&&navigator.onLine!==false&&mayPollLastFmV708(window.localStorage,username);
  const poll=async()=>{
   if(busy.current||!allowed()||Date.now()<cooldownUntil.current||Date.now()-lastAttempt.current<V708_POLL_INTERVAL_MS)return;
   lastAttempt.current=Date.now();busy.current=true;
   const controller=new AbortController();request.current=controller;
   try{
    const response=await fetch(`/api/lastfm/recent-tracks?user=${encodeURIComponent(username)}&page=1`,{cache:'no-store',signal:controller.signal});
    if(response.status===429){const retry=Number(response.headers.get('Retry-After'));cooldownUntil.current=Date.now()+((Number.isSafeInteger(retry)&&retry>0)?Math.min(retry,86400)*1000:V708_POLL_INTERVAL_MS);return;}
    if(!response.ok||!allowed())return;
    const page=await response.json() as Partial<LastFmPageV706>;
    if(!allowed())return;
    // Detect a possible gap BEFORE merging page 1; older events may be past this page.
    const before=readLastFmArchiveV706(window.localStorage,username);
    const gap=before.archive?inspectLastFmGapV709(before.archive,page as LastFmPageV706):null;
    const result=appendAutoLastFmV708(window.localStorage,username,page);
    if(result.status==='saved'||result.status==='no-new-events'){
     if(gap&&writeLastFmGapV709(window.localStorage,gap))window.dispatchEvent(new Event(V709_GAP_EVENT));
     writeLastFmAutoStatusV708(window.localStorage,username,{at:new Date().toISOString(),added:result.added,trimmed:result.trimmed});
     window.dispatchEvent(new Event(V708_STATUS_EVENT));
    }
   }catch{/* Timeout, offline, malformed response or disabled storage: nothing is written. */}
   finally{busy.current=false;if(request.current===controller)request.current=null;}
  };
  const changed=()=>{if(!allowed()){request.current?.abort();return;}void poll();};
  const changedStorage=(event:StorageEvent)=>{if(lastFmAutoStorageKeyV708(event.key))changed();};
  const visibility=()=>{if(document.visibilityState!=='visible')request.current?.abort();else changed();};
  const offline=()=>request.current?.abort();
  window.addEventListener(V708_CHANGE_EVENT,changed);
  window.addEventListener('storage',changedStorage);
  window.addEventListener('focus',changed);window.addEventListener('online',changed);window.addEventListener('offline',offline);
  document.addEventListener('visibilitychange',visibility);
  const timer=window.setInterval(()=>void poll(),V708_POLL_INTERVAL_MS);
  if(allowed())void poll();
  return()=>{bridgeStopped=true;window.removeEventListener(V708_STATUS_EVENT,mirror);window.removeEventListener(V710_STATUS_EVENT,mirror);window.removeEventListener('storage',localChange);stopped=true;request.current?.abort();window.clearInterval(timer);window.removeEventListener(V708_CHANGE_EVENT,changed);window.removeEventListener('storage',changedStorage);window.removeEventListener('focus',changed);window.removeEventListener('online',changed);window.removeEventListener('offline',offline);document.removeEventListener('visibilitychange',visibility);};
 },[username]);
 return null;
}
