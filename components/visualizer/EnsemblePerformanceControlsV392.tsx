'use client';
import {useEffect,useState} from 'react';
import {DEFAULT_ENSEMBLE_V392,readEnsembleV392,saveEnsembleV392,type EnsembleSettingsV392} from './ensemblePerformanceV392';

export function EnsemblePerformanceControlsV392(){
 const [settings,setSettings]=useState<EnsembleSettingsV392>(DEFAULT_ENSEMBLE_V392);
 useEffect(()=>setSettings(readEnsembleV392()),[]);
 const edit=(patch:Partial<EnsembleSettingsV392>)=>setSettings(saveEnsembleV392({...settings,...patch}));
 return <fieldset className="multi-avatar-controls"><legend>V392 – Multi-Avatar Performance 3.0</legend>
  <label>Gemeinsame Rollenregie
   <select value={settings.mode} onChange={e=>edit({mode:e.target.value as EnsembleSettingsV392['mode']})}>
    <option value="off">Aus (bisheriges Verhalten)</option>
    <option value="subtle">Dezent · natürliche Wechsel</option>
    <option value="expressive">Ausdrucksstark · Konzert</option>
   </select>
  </label>
  <label>Rollen-/Interaktionsstärke ({settings.strength} %)
   <input type="range" min="0" max="100" step="5" disabled={settings.mode==='off'} value={settings.strength} onChange={e=>edit({strength:Number(e.target.value)})}/>
  </label>
  <p>Für Duo- und Gruppenbühnen: Leadsänger-/Backing-/Tänzer-Akzente, gelegentliche Call-and-Response-Gesten und sanfte Blickausrichtung. Verse, Hook, Build und Drop werden anhand vorhandener Abschnittshinweise oder Audioenergie unterschieden.</p>
  <small>Keine Erkennung echter Stimmen aus Spotify-Audio. Die Funktion greift ausschließlich in die reaktive Intensität und eine kleine Bühnen-Drehung ein. Manuelle Gesangsbesetzung, Track-Choreografien, IK und importierte GLB-Animationen behalten Vorrang.</small>
  <button type="button" onClick={()=>edit(DEFAULT_ENSEMBLE_V392)}>V392 zurücksetzen</button>
 </fieldset>;
}
