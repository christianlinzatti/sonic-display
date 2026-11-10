'use client';
import {useState} from 'react';
import {loadFullConcertConsentV1145} from '@/lib/alexaFullConcertV1145';
import {loadGoveeSyncConsentV1143} from '@/lib/goveeMusicVoiceV1143';
import {loadGoveeLookConsentV1146} from '@/lib/goveeVoiceLookV1146';
import {planConcertSceneV1147,type ConcertGenreV1147,type ConcertSceneV1147} from '@/lib/alexaConcertScenesV1147';

/** Preview only: no hardware writes, no Spotify changes and no implicit opt-in. */
export function AlexaConcertScenePreviewV1147(){
 const [scene,setScene]=useState<ConcertSceneV1147>('calm');
 const [genre,setGenre]=useState<ConcertGenreV1147>('deutschrap');
 const [message,setMessage]=useState('');
 const preview=()=>{
  try{
   const show=loadFullConcertConsentV1145();
   const plan=planConcertSceneV1147({
    scene,genre,showConsent:show.enabled,
    goveeConsent:show.includeGovee&&loadGoveeLookConsentV1146().enabled,
    musicSyncConsent:loadGoveeSyncConsentV1143().enabled,
    reducedMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    masterBrightness:50
   });
   setMessage('Vorschau: Bühnenintensität '+plan.stageIntensity+' %, Lichtlimit '+plan.brightnessCap+
    ' %, Govee '+(plan.goveeAllowed?'freigegeben':'nicht freigegeben')+'. Keine Einstellungen oder Lampen verändert.');
  }catch(error){setMessage(error instanceof Error?error.message:'Vorschau nicht verfügbar.');}
 };
 return <fieldset aria-label="V1147 Konzertszene Vorschau"><legend>V1147 – Konzertszene (Vorschau)</legend>
  <p className="settings-note">Nur eine lokale Vorschau. Alexa-Befehle und echte Lichtsteuerung werden dadurch noch nicht aktiviert.</p>
  <label>Musikstil <select value={genre} onChange={e=>setGenre(e.target.value as ConcertGenreV1147)}>
   <option value="deutschrap">Deutschrap</option><option value="hardtekk">Hardtekk</option>
   <option value="deutschrock">Deutschrock</option><option value="other">Andere</option>
  </select></label>
  <label>Konzertphase <select value={scene} onChange={e=>setScene(e.target.value as ConcertSceneV1147)}>
   <option value="calm">Ruhig</option><option value="intense">Intensiv</option><option value="finale">Finale</option>
  </select></label>
  <button type="button" onClick={preview}>Sichere Vorschau berechnen</button>
  {message&&<p role="status">{message}</p>}
 </fieldset>;
}
