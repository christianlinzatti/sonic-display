'use client';
import {useEffect,useState} from 'react';
import {GOVEE_CONFIG_EVENT_V909,loadGoveeConfigV909} from '@/lib/goveeLanV909';
import {GOVEE_SYNC_CONSENT_EVENT_V1143,loadGoveeSyncConsentV1143,saveGoveeSyncConsentV1143,setGoveeMusicSyncV1143} from '@/lib/goveeMusicVoiceV1143';
export function GoveeMusicVoiceControlsV1143({compact=false}:{compact?:boolean}={}){
 const [voiceAllowed,setVoiceAllowed]=useState(false),[active,setActive]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{
  const refresh=()=>{setVoiceAllowed(loadGoveeSyncConsentV1143().enabled);setActive(loadGoveeConfigV909().autoSync);};
  refresh();for(const event of [GOVEE_SYNC_CONSENT_EVENT_V1143,GOVEE_CONFIG_EVENT_V909,'storage'])window.addEventListener(event,refresh);
  return()=>{for(const event of [GOVEE_SYNC_CONSENT_EVENT_V1143,GOVEE_CONFIG_EVENT_V909,'storage'])window.removeEventListener(event,refresh);};
 },[]);
 const manual=(next:boolean)=>{try{setNotice(setGoveeMusicSyncV1143(next));setActive(loadGoveeConfigV909().autoSync);}
  catch(e){setNotice(e instanceof Error?e.message:'Govee-Musikmodus konnte nicht geändert werden.');}};
 const consent=(next:boolean)=>{try{saveGoveeSyncConsentV1143(next);setVoiceAllowed(next);setNotice(next?'Govee-Musikmodus per Alexa freigegeben.':'Alexa-Govee-Musikmodus gesperrt.');}
  catch{setNotice('Alexa-Freigabe konnte nicht gespeichert werden.');}};
 return <div role="group" aria-label="Govee Musiklicht per Alexa" className={compact?'govee-v909-actions':'govee-v958-settings'}>
  {!compact&&<label className="setting-check"><input type="checkbox" checked={voiceAllowed} onChange={e=>consent(e.target.checked)}/>
   Alexa darf die Govee-Musiksynchronisation starten und pausieren</label>}
  <div className="govee-v909-actions">
   <button type="button" disabled={active} onClick={()=>manual(true)}>Musik-Sync starten</button>
   <button type="button" disabled={!active} onClick={()=>manual(false)}>Musik-Sync pausieren</button>
  </div>
  {!compact&&<small>Getrennte, standardmäßig ausgeschaltete Freigabe. Manuelle Schalter brauchen keine Alexa-Freigabe. Der Start schaltet keine Lampe ein und startet keine Spotify-Wiedergabe.</small>}
  {notice&&<small role="status">{notice}</small>}
 </div>;
}
