'use client';
import {useEffect,useState} from 'react';
import {loadGoveeConfigV909} from '@/lib/goveeLanV909';
import {GOVEE_LOOK_CONSENT_EVENT_V1146,loadGoveeLookConsentV1146,saveGoveeLookConsentV1146,sendGoveeVoiceLookV1146} from '@/lib/goveeVoiceLookV1146';

export function GoveeVoiceLookControlsV1146(){
 const [enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[brightness,setBrightness]=useState(50),
  [notice,setNotice]=useState('');
 useEffect(()=>{
  const update=()=>{setEnabled(loadGoveeLookConsentV1146().enabled);setBrightness(loadGoveeConfigV909().masterBrightness);};
  update();window.addEventListener(GOVEE_LOOK_CONSENT_EVENT_V1146,update);window.addEventListener('storage',update);
  return()=>{window.removeEventListener(GOVEE_LOOK_CONSENT_EVENT_V1146,update);window.removeEventListener('storage',update);};
 },[]);
 const toggle=(on:boolean)=>{try{saveGoveeLookConsentV1146(on);setEnabled(on);setNotice(on?'Govee-Farbe und -Helligkeit für Alexa freigegeben.':'Alexa-Farb- und Helligkeitsbefehle gesperrt.');}
  catch{setNotice('Freigabe konnte nicht gespeichert werden.');}};
 const tryLocal=async()=>{
  if(busy)return;setBusy(true);
  try{setNotice(await sendGoveeVoiceLookV1146('govee-brightness',{brightness}));}
  catch(e){setNotice(e instanceof Error?e.message:'Govee-Befehl fehlgeschlagen.');}
  finally{setBusy(false);}
 };
 return <fieldset aria-label="V1146 Govee Farben und Helligkeit per Alexa">
  <legend>V1146 · Govee Farben und Helligkeit</legend>
  <label className="setting-check"><input type="checkbox" checked={enabled} onChange={e=>toggle(e.target.checked)}/>
   Alexa darf ausgewählte Govee-Leuchten umfärben und dimmen</label>
  <p className="settings-note">Standardmäßig aus. Sprachbefehle: „Stelle Govee Helligkeit auf 40 Prozent“ oder „Stelle Govee auf Blau“. Die neue Freigabe ist unabhängig von Govee Ein/Aus und Musik-Sync. Maximal 32 bereits ausgewählte Lampen, keine frei wählbaren IP-Adressen, keine automatischen Wiederholungen.</p>
  <label>Helligkeit lokal ausprobieren ({brightness} %)
   <input type="range" min={1} max={100} step={1} value={brightness} onChange={e=>setBrightness(Number(e.target.value))}/>
  </label>
  <button type="button" disabled={busy} onClick={()=>void tryLocal()}>{busy?'Übertrage…':'Helligkeit senden'}</button>
  <small>Der lokale Test benötigt eine konfigurierte Govee-LAN-Bridge, aber keine Alexa-Freigabe. Ein Befehl stoppt die laufende Musik-Lichtsynchronisation. Er schaltet keine Lampen ein.</small>
  {notice&&<p role="status">{notice}</p>}
 </fieldset>;
}
