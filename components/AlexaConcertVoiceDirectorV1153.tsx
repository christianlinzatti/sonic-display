'use client';
import {useEffect,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {readFullConcertSnapshotV1145,loadFullConcertConsentV1145,
 ALEXA_FULL_CONCERT_EVENT_V1145,ALEXA_FULL_CONCERT_ACTIVE_EVENT_V1145} from '@/lib/alexaFullConcertV1145';
import {ALEXA_DIRECTOR_CONSENT_EVENT_V1153,loadDirectorConsentV1153,saveDirectorConsentV1153,
 applyVoiceDirectorV1153,type AlexaDirectorCommandV1153} from '@/lib/alexaConcertVoiceDirectorV1153';

export function AlexaConcertVoiceDirectorV1153(){
 const {connected,isPlaying,track}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const [enabled,setEnabled]=useState(false),[showActive,setShowActive]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{
  const refresh=()=>{setEnabled(loadDirectorConsentV1153().enabled);setShowActive(Boolean(readFullConcertSnapshotV1145()));};
  refresh();
  for(const e of [ALEXA_DIRECTOR_CONSENT_EVENT_V1153,ALEXA_FULL_CONCERT_EVENT_V1145,ALEXA_FULL_CONCERT_ACTIVE_EVENT_V1145,'storage'])
   window.addEventListener(e,refresh);
  return()=>{for(const e of [ALEXA_DIRECTOR_CONSENT_EVENT_V1153,ALEXA_FULL_CONCERT_EVENT_V1145,ALEXA_FULL_CONCERT_ACTIVE_EVENT_V1145,'storage'])
   window.removeEventListener(e,refresh);};
 },[]);
 const change=(next:boolean)=>{
  try{saveDirectorConsentV1153(next);setEnabled(next);setNotice(next?'Alexa-Konzertregie freigegeben.':'Alexa-Konzertregie gesperrt.');}
  catch{setNotice('Die Freigabe konnte nicht gespeichert werden.');}
 };
 const local=(command:AlexaDirectorCommandV1153)=>{
  try{
   if(!enabled||!loadFullConcertConsentV1145().enabled)throw Error('Bitte zuerst beide Alexa-Konzertfreigaben aktivieren.');
   const answer=applyVoiceDirectorV1153(command,{
    preferences,updatePreferences,showActive:Boolean(readFullConcertSnapshotV1145()),
    connected,playing:isPlaying,trackId:track?.id,
    allowed:()=>loadDirectorConsentV1153().enabled&&loadFullConcertConsentV1145().enabled
   });
   setNotice(answer);
  }catch(e){setNotice(e instanceof Error?e.message:'Konzertregie nicht verfügbar.');}
 };
 return <fieldset aria-label="V1153 Alexa Konzertregie">
  <legend>V1153 · Alexa-Konzertregie 2.0</legend>
  <label className="setting-check"><input type="checkbox" checked={enabled} onChange={e=>change(e.target.checked)}/>
   Bühnenwechsel, Lichtstimmungen und Show-Intensität per Alexa freigeben</label>
  <p className="settings-note">Erfordert die zusätzliche Konzertshow-Freigabe V1145 und eine laufende, von Alexa gestartete Show mit Spotify-Wiedergabe. Nur virtuelle Änderungen – keine Govee-Gerätebefehle, keine Spotify-Steuerung.</p>
  <small role="status">{showActive?'Alexa-Konzertshow aktiv':'Keine Alexa-Konzertshow aktiv – bitte zuerst die komplette Show starten'}</small>
  <p className="settings-note">Sprachbeispiele: „Wechsle die Konzertbühne zur Festivalbühne“, „Setze die Konzertlichtstimmung auf Neon“, „Mach die Konzertshow intensiver“.</p>
  <details><summary>Virtuelle Regie lokal ausprobieren</summary>
   <div className="govee-v958-settings">
    <button type="button" disabled={!enabled||!showActive} onClick={()=>local('concert-director-stage-arena')}>360°-Arena</button>
    <button type="button" disabled={!enabled||!showActive} onClick={()=>local('concert-director-stage-festival')}>Festival</button>
    <button type="button" disabled={!enabled||!showActive} onClick={()=>local('concert-director-stage-club')}>Neon-Club</button>
    <button type="button" disabled={!enabled||!showActive} onClick={()=>local('concert-director-mood-warm')}>Warmes Licht</button>
    <button type="button" disabled={!enabled||!showActive} onClick={()=>local('concert-director-mood-neon')}>Neon-Licht</button>
    <button type="button" disabled={!enabled||!showActive} onClick={()=>local('concert-director-energy-calm')}>Ruhig</button>
    <button type="button" disabled={!enabled||!showActive} onClick={()=>local('concert-director-energy-intense')}>Intensiv</button>
   </div>
  </details>
  {notice&&<p role="status">{notice}</p>}
 </fieldset>;
}
