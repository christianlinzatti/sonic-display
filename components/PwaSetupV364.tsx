"use client";
import {useEffect,useState} from "react";
import {PushSettingsV365} from "@/components/PushSettingsV365";
export function PwaSetupV364(){
 const [permission,setPermission]=useState<NotificationPermission|"unsupported">("unsupported");
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{
  if("serviceWorker" in navigator && window.isSecureContext) void navigator.serviceWorker.register("/sw-v364.js",{scope:"/"}).catch(()=>{});
  if("Notification" in window)setPermission(Notification.permission);
  try{setEnabled(localStorage.getItem("sonic.v364.foreground-alerts")==="true");}catch{}
 },[]);
 async function enable(){
  if(!("Notification" in window))return;
  const result=await Notification.requestPermission();setPermission(result);
  const next=result==="granted";setEnabled(next);
  try{localStorage.setItem("sonic.v364.foreground-alerts",String(next));}catch{}
 }
 function disable(){setEnabled(false);try{localStorage.setItem("sonic.v364.foreground-alerts","false");}catch{}}
 return <aside style={{position:"fixed",bottom:12,left:12,zIndex:120,background:"#17172ae8",color:"white",borderRadius:12,padding:"8px 12px",maxWidth:270,fontSize:12}}>
  <strong>📱 Sonic Display App</strong><div>Über das Browsermenü „App installieren“ bzw. „Zum Startbildschirm“ hinzufügen.</div>
  {permission==="unsupported"?<small>Systembenachrichtigungen nicht verfügbar.</small>:enabled?<button onClick={disable}>Hinweise deaktivieren</button>:<button onClick={()=>void enable()}>Hinweise bei geöffneter App erlauben</button>}
 <PushSettingsV365/></aside>;
}
