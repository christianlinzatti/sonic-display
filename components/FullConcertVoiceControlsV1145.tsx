'use client';
import {useEffect,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {ALEXA_FULL_CONCERT_EVENT_V1145,loadFullConcertConsentV1145,saveFullConcertConsentV1145,
 readFullConcertSnapshotV1145,runFullConcertV1145} from '@/lib/alexaFullConcertV1145';

export function FullConcertVoiceControlsV1145(){
 const {connected,isPlaying,track}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const [enabled,setEnabled]=useState(false),[withGovee,setWithGovee]=useState(false),
  [active,setActive]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{
  const refresh=()=>{const consent=loadFullConcertConsentV1145();setEnabled(consent.enabled);
   setWithGovee(consent.includeGovee);setActive(Boolean(readFullConcertSnapshotV1145()));};
  refresh();window.addEventListener('storage',refresh);window.addEventListener(ALEXA_FULL_CONCERT_EVENT_V1145,refresh);
  return()=>{window.removeEventListener('storage',refresh);window.removeEventListener(ALEXA_FULL_CONCERT_EVENT_V1145,refresh);};
 },[]);
 const consent=(on:boolean,govee:boolean)=>{
  try{const next=saveFullConcertConsentV1145(on,govee);setEnabled(next.enabled);setWithGovee(next.includeGovee);
   setNotice(on?'Alexa darf eine komplette virtuelle Konzertshow starten und stoppen.':'Alexa-Konzertshow-Befehle gesperrt. Eine bereits laufende Show kann lokal beendet werden.');}
  catch{setNotice('Freigabe konnte nicht gespeichert werden.');}
 };
 const control=(command:'concert-show-start'|'concert-show-stop')=>{
  try{const message=runFullConcertV1145(command,{preferences,updatePreferences,connected,playing:isPlaying,trackId:track?.id});
   setActive(Boolean(readFullConcertSnapshotV1145()));setNotice(message);}
  catch(e){setNotice(e instanceof Error?e.message:'Konzertshow konnte nicht umgeschaltet werden.');}
 };
 return <fieldset aria-label="V1145 komplette Konzertshow per Alexa">
  <legend>V1145 · Komplette 360°-Konzertshow</legend>
  <label className="setting-check"><input type="checkbox" checked={enabled} onChange={e=>consent(e.target.checked,withGovee)}/>
   Alexa darf die komplette 360°-Konzertshow starten und stoppen</label>
  <label className="setting-check"><input type="checkbox" checked={withGovee} disabled={!enabled}
   onChange={e=>consent(enabled,e.target.checked)}/>
   Bei Showstart auch den bereits freigegebenen Govee-Musik-Sync aktivieren</label>
  <p className="settings-note">Die Govee-Option greift nur mit der zusätzlichen V1143-Musik-Sync-Freigabe, ausgewählten Geräten und laufender Bridge. Die Show schaltet keine Lampen ein und startet keine Spotify-Wiedergabe. Reduzierte Animationen und manuelle Show-Timelines bleiben geschützt.</p>
  <div className="govee-v909-actions">
   <button type="button" disabled={active||!connected||!isPlaying||!track?.id} onClick={()=>control('concert-show-start')}>360°-Konzert starten</button>
   <button type="button" disabled={!active} onClick={()=>control('concert-show-stop')}>Konzertshow beenden</button>
  </div>
  <small>Alexa: „Starte die komplette Konzertshow“ oder „Beende die komplette Konzertshow“.</small>
  {notice&&<p role="status">{notice}</p>}
 </fieldset>;
}
