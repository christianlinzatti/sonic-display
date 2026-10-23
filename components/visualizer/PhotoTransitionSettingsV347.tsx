"use client";
import {useEffect,useState} from 'react';
import {DEFAULT_PHOTO_TRANSITIONS_V347,PHOTO_TRANSITIONS_EVENT_V347,readPhotoTransitionsV347,savePhotoTransitionsV347,type PhotoTransitionsV347,type PhotoTransitionStyleV347} from '@/services/stageContent/photoTransitionsV347';
/** Controls affect preview and actual stage through the same persisted event bus. */
export function PhotoTransitionSettingsV347(){
 const [settings,setSettings]=useState(readPhotoTransitionsV347);
 useEffect(()=>{const refresh=()=>setSettings(readPhotoTransitionsV347());window.addEventListener(PHOTO_TRANSITIONS_EVENT_V347,refresh);return()=>window.removeEventListener(PHOTO_TRANSITIONS_EVENT_V347,refresh);},[]);
 const patch=(value:Partial<PhotoTransitionsV347>)=>savePhotoTransitionsV347({...settings,...value});
 return <fieldset className="sonic-photo-transitions-settings-v347"><legend>V347 – Smart Photo Transitions</legend>
  <p>Fließende Umpositionierung der Foto-Kacheln und Überblendung beim Bildwechsel. Nutzt vorhandene V345-Kompositionen; mit V346 werden Fokus-, Balanced- und Impact-Wechsel animiert.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>patch({enabled:e.target.checked})}/> Sanfte Foto-Übergänge aktivieren</label>
  <label>Übergangsstil <select value={settings.style} onChange={e=>patch({style:e.target.value as PhotoTransitionStyleV347})} disabled={!settings.enabled}><option value="smooth">Weich</option><option value="cinematic">Cinematic</option><option value="snappy">Dynamisch</option></select></label>
  <label>Layoutwechsel: {settings.durationMs} ms <input type="range" min="150" max="2200" step="50" value={settings.durationMs} disabled={!settings.enabled} onChange={e=>patch({durationMs:Number(e.target.value)})}/></label>
  <label>Bildüberblendung: {settings.crossfadeMs} ms <input type="range" min="100" max="1600" step="50" value={settings.crossfadeMs} disabled={!settings.enabled} onChange={e=>patch({crossfadeMs:Number(e.target.value)})}/></label>
  <label className="setting-check"><input type="checkbox" checked={settings.beatSync} disabled={!settings.enabled} onChange={e=>patch({beatSync:e.target.checked})}/> Layoutwechsel am nächsten Beat-Akzent auslösen</label>
  {settings.beatSync&&<><label>Beat-Schwelle: {Math.round(settings.beatThreshold*100)} % <input type="range" min="0.35" max="0.98" step="0.01" value={settings.beatThreshold} disabled={!settings.enabled} onChange={e=>patch({beatThreshold:Number(e.target.value)})}/></label>
  <label>Maximale Wartezeit: {settings.maxBeatWaitMs} ms <input type="range" min="100" max="900" step="50" value={settings.maxBeatWaitMs} disabled={!settings.enabled} onChange={e=>patch({maxBeatWaitMs:Number(e.target.value)})}/></label></>}
  <button type="button" onClick={()=>savePhotoTransitionsV347(DEFAULT_PHOTO_TRANSITIONS_V347)}>Auf Standard zurücksetzen</button>
  <small>Ohne Beat-Signal erfolgt der Wechsel spätestens nach der eingestellten Wartezeit. Bei „Bewegung reduzieren“ werden Animationen abgeschaltet. Bestehende Layoutvorlagen bleiben unverändert.</small>
 </fieldset>;
}
