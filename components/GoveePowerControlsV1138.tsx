'use client';
import {useEffect,useState} from 'react';
import {GOVEE_CONFIG_EVENT_V909,loadGoveeConfigV909} from '@/lib/goveeLanV909';
import {GOVEE_POWER_CONSENT_EVENT_V1138,loadGoveePowerConsentV1138,
 saveGoveePowerConsentV1138,sendGoveePowerV1138,canExecuteGoveePowerV1138} from '@/lib/goveePowerV1138';

export function GoveePowerQuickControlsV1138({compact=false,onActivity}:{compact?:boolean;onActivity?:()=>void}={}){
 const [available,setAvailable]=useState(false);
 const [count,setCount]=useState(0);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 useEffect(()=>{
  const refresh=()=>{const cfg=loadGoveeConfigV909();setAvailable(canExecuteGoveePowerV1138(cfg));setCount(cfg.selectedIps.length);};
  refresh();window.addEventListener(GOVEE_CONFIG_EVENT_V909,refresh);window.addEventListener('storage',refresh);
  return()=>{window.removeEventListener(GOVEE_CONFIG_EVENT_V909,refresh);window.removeEventListener('storage',refresh);};
 },[]);
 const power=async(on:boolean)=>{
  if(busy)return;setBusy(true);onActivity?.();
  try{setNotice(await sendGoveePowerV1138(on));}
  catch(e){setNotice(e instanceof Error?e.message:'Govee-LAN-Befehl fehlgeschlagen.');}
  finally{setBusy(false);}
 };
 return <div role="group" aria-label="Govee-Lichter Schnelleinstellungen" className={compact?'govee-v909-actions':'govee-v958-settings'}>
  {!compact&&<p className="settings-note">Direktsteuerung der {count} ausgewählten Govee-Lampe(n). Diese Schalter benötigen keine Alexa-Freigabe.</p>}
  <button type="button" disabled={!available||busy} onClick={()=>void power(true)}>Govee EIN</button>
  <button type="button" disabled={!available||busy} onClick={()=>void power(false)}>Govee AUS</button>
  {!available&&<small>Govee LAN in den Einstellungen konfigurieren und Leuchten auswählen.</small>}
  {notice&&<small role="status">{notice}</small>}
 </div>;
}
export function GoveePowerPermissionV1138(){
 const [enabled,setEnabled]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{
  const refresh=()=>setEnabled(loadGoveePowerConsentV1138().enabled);
  refresh();window.addEventListener(GOVEE_POWER_CONSENT_EVENT_V1138,refresh);window.addEventListener('storage',refresh);
  return()=>{window.removeEventListener(GOVEE_POWER_CONSENT_EVENT_V1138,refresh);window.removeEventListener('storage',refresh);};
 },[]);
 const toggle=(next:boolean)=>{
  try{saveGoveePowerConsentV1138(next);setEnabled(next);setNotice(next?'Alexa darf die zuvor ausgewählten Govee-Lichter ein- und ausschalten.':'Alexa-Ein/Aus-Befehle gesperrt.');}
  catch{setNotice('Freigabe konnte nicht gespeichert werden.');}
 };
 return <fieldset aria-label="Alexa Govee Ein Aus">
  <legend>Alexa: Govee-Lichter ein- und ausschalten</legend>
  <label className="setting-check"><input type="checkbox" checked={enabled} onChange={e=>toggle(e.target.checked)}/>
   Alexa darf ausgewählte Govee-Lichter ein- und ausschalten</label>
  <p className="settings-note">Separate, standardmäßig ausgeschaltete Freigabe für echte Hardware-Schaltbefehle. Erfordert einen laufenden Govee-LAN-Bridge-Dienst, ausgewählte Lampen, den Bridge-Token und aktiven Alexa-Empfang. Beim Schalten wird die Musik-Lichtsynchronisation angehalten. Alexa verändert weder Geräteauswahl noch Spotify-Wiedergabe.</p>
  {notice&&<p role="status">{notice}</p>}
 </fieldset>;
}
