'use client';
import {useEffect,useRef,useState} from 'react';
import {validLastFmUsernameV706,V706_USERNAME_KEY} from '@/lib/lastfm-history-v706';
import {V708_CHANGE_EVENT,V708_STATUS_EVENT} from '@/lib/automatic-lastfm-history-v708';
import {V709_GAP_EVENT} from '@/lib/lastfm-recovery-v709';
import {commitRecoveryV710,planRecoveryV710,V710_CHANGE_EVENT,V710_STATUS_EVENT,V710_STEP_INTERVAL_MS} from '@/lib/lastfm-health-v710';
/** Explicit separate opt-in; one additional historical page per five minutes in a visible, focused tab. */
export function AutomaticLastFmRecoveryV710(){
 const [user,setUser]=useState<string|null>(null);
 const busy=useRef(false),abort=useRef<AbortController|null>(null),lastAttempt=useRef(0),cooldown=useRef(0);
 useEffect(()=>{
  const read=()=>{try{const v=window.localStorage.getItem(V706_USERNAME_KEY);setUser(validLastFmUsernameV706(v)?v:null);}catch{setUser(null);}};
  const storage=(e:StorageEvent)=>{if(e.key===null||e.key===V706_USERNAME_KEY)read();};
  read();window.addEventListener('storage',storage);window.addEventListener(V708_CHANGE_EVENT,read);
  return()=>{abort.current?.abort();window.removeEventListener('storage',storage);window.removeEventListener(V708_CHANGE_EVENT,read);};
 },[]);
 useEffect(()=>{
  if(!user)return;
  let stopped=false;
  const active=()=>!stopped&&document.visibilityState==='visible'&&document.hasFocus()&&navigator.onLine!==false;
  const onePage=async()=>{
   if(busy.current||!active()||Date.now()<cooldown.current||Date.now()-lastAttempt.current<V710_STEP_INTERVAL_MS)return;
   const plan=planRecoveryV710(window.localStorage,user);
   if(plan.status!=='ready'||!plan.session)return;
   // Avoid parallel recovery from multiple Chrome tabs; skip instead of racing if Web Locks unavailable.
   if(!navigator.locks?.request)return;
   lastAttempt.current=Date.now();busy.current=true;
   const controller=new AbortController();abort.current=controller;
   try{
    await navigator.locks.request(`sonic-lastfm-v710-${encodeURIComponent(user.toLowerCase())}`,{mode:'exclusive',ifAvailable:true},async lock=>{
     if(!lock||controller.signal.aborted||!active())return;
     const fresh=planRecoveryV710(window.localStorage,user);
     if(fresh.status!=='ready'||!fresh.session)return;
     const url=`/api/lastfm/recent-tracks?user=${encodeURIComponent(user)}&page=${fresh.session.nextPage}&to=${fresh.session.to}`;
     const r=await fetch(url,{cache:'no-store',signal:controller.signal});
     if(r.status===429){const secs=Number(r.headers.get('Retry-After'));cooldown.current=Date.now()+(Number.isSafeInteger(secs)&&secs>0?Math.min(secs,86400)*1000:V710_STEP_INTERVAL_MS);return;}
     if(!r.ok||controller.signal.aborted||!active())return;
     const data:unknown=await r.json();if(controller.signal.aborted||!active())return;
     const committed=commitRecoveryV710(window.localStorage,user,fresh,data);
     if(committed.status==='saved'||committed.status==='completed'||committed.status==='limit'){
      window.dispatchEvent(new Event(V710_STATUS_EVENT));window.dispatchEvent(new Event(V709_GAP_EVENT));window.dispatchEvent(new Event(V708_STATUS_EVENT));
     }
    });
   }catch{/* Offline, cancelled, malformed API response, forbidden storage: do not advance. */}
   finally{busy.current=false;if(abort.current===controller)abort.current=null;}
  };
  const check=()=>{if(!active()){abort.current?.abort();return;}void onePage();};
  const storage=(e:StorageEvent)=>{if(e.key===V706_USERNAME_KEY||e.key?.startsWith('sonic-display:lastfm:recovery-consent:v710:'))check();};
  const visibility=()=>{if(document.visibilityState!=='visible')abort.current?.abort();else check();};
  const consentChanged=()=>{if(planRecoveryV710(window.localStorage,user).status==='off')abort.current?.abort();check();};
  window.addEventListener(V710_CHANGE_EVENT,consentChanged);window.addEventListener(V708_CHANGE_EVENT,consentChanged);window.addEventListener(V709_GAP_EVENT,check);
  const offline=()=>abort.current?.abort();
  window.addEventListener('storage',storage);window.addEventListener('focus',check);window.addEventListener('offline',offline);document.addEventListener('visibilitychange',visibility);
  const timer=window.setInterval(check,V710_STEP_INTERVAL_MS);check();
  return()=>{stopped=true;abort.current?.abort();window.clearInterval(timer);window.removeEventListener(V710_CHANGE_EVENT,consentChanged);window.removeEventListener(V708_CHANGE_EVENT,consentChanged);window.removeEventListener(V709_GAP_EVENT,check);window.removeEventListener('storage',storage);window.removeEventListener('focus',check);window.removeEventListener('offline',offline);document.removeEventListener('visibilitychange',visibility);};
 },[user]);
 return null;
}
