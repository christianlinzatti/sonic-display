"use client";
import {useEffect,useState} from 'react';
const KEY='sonic-display:v395:keep-screen-on';
type ScreenLockV395={release:()=>Promise<void>;addEventListener?:(type:string,handler:()=>void)=>void};
type WakeNavigatorV395=Navigator&{wakeLock?:{request:(type:'screen')=>Promise<ScreenLockV395>}};
/** Optional Screen Wake Lock, not a synthetic keep-awake video or timer.
 * OS/browser may deny it; release on background/unmount and respect permissions. */
export function useDisplayWakeLockV395(kioskEnabled:boolean){
 const [requested,setRequested]=useState(false);
 const [visible,setVisible]=useState(true);
 const [active,setActive]=useState(false);
 const [status,setStatus]=useState('Aus');
 const [supported,setSupported]=useState(false);
 useEffect(()=>{
  try{setRequested(localStorage.getItem(KEY)==='true');}catch{}
  setSupported(Boolean((navigator as WakeNavigatorV395).wakeLock?.request));
  const update=()=>setVisible(!document.hidden);
  update();document.addEventListener('visibilitychange',update);
  return()=>document.removeEventListener('visibilitychange',update);
 },[]);
 useEffect(()=>{
  let closed=false;const held:{current:ScreenLockV395|null}={current:null};
  const api=(navigator as WakeNavigatorV395).wakeLock;
  if(!kioskEnabled||!requested||!visible){setActive(false);setStatus(requested?'Pausiert':'Aus');return;}
  if(!api){setStatus('Vom Browser nicht unterstützt');return;}
  setStatus('Aktiviere…');
  void api.request('screen').then(acquired=>{
   if(closed){void acquired.release().catch(()=>{});return;}
   held.current=acquired;setActive(true);setStatus('Bildschirm bleibt aktiv');
   acquired.addEventListener?.('release',()=>{if(!closed){setActive(false);setStatus('Durch System freigegeben');}});
  }).catch(()=>{if(!closed){setActive(false);setStatus('Vom Gerät/Browser abgelehnt');}});
  return()=>{closed=true;const current=held.current;if(current)void current.release().catch(()=>{});};
 },[kioskEnabled,requested,visible]);
 const change=(enabled:boolean)=>{setRequested(enabled);try{localStorage.setItem(KEY,String(enabled));}catch{}};
 return {requested,change,active,status,supported};
}
