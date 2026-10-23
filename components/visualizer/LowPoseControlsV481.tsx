'use client';
import {useEffect,useState} from 'react';
import {DEFAULT_LOW_POSE_V481,readLowPoseV481,writeLowPoseV481,type LowPoseSettingsV481} from './intelligentLowPoseV481';
/** V481: opt-in and limits shared by the auto 3/4-dancer show. */
export function LowPoseControlsV481(){
 const [settings,setSettings]=useState<LowPoseSettingsV481>(DEFAULT_LOW_POSE_V481);
 useEffect(()=>setSettings(readLowPoseV481()),[]);
 const patch=(value:Partial<LowPoseSettingsV481>)=>setSettings(writeLowPoseV481({...settings,...value}));
 return <fieldset className="low-pose-studio-v481"><legend>V481 · Hocke &amp; Low-Pose-Choreografie</legend>
  <p>Bei automatisch gesteuerten 3–4 Avataren dürfen vorhandene GLB-Hock-/Knieclips oder prozedurale Low-Poses passend zum Musikabschnitt verwendet werden. Manuelle Tanz- und Sängerzuordnungen bleiben geschützt.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>patch({enabled:e.target.checked})}/> Automatische Low Poses erlauben</label>
  <div className="ensemble-studio-v325-controls">
   <label>Intensität <select disabled={!settings.enabled} value={settings.intensity} onChange={e=>patch({intensity:e.target.value as LowPoseSettingsV481['intensity']})}><option value="subtle">Dezent</option><option value="medium">Mittel</option><option value="strong">Stark</option></select></label>
   <label>Maximal gleichzeitig <select disabled={!settings.enabled} value={settings.maxConcurrent} onChange={e=>patch({maxConcurrent:Number(e.target.value) as LowPoseSettingsV481['maxConcurrent']})}>{[1,2,3,4].map(n=><option key={n} value={n}>{n} Avatar{n>1?'e':''}</option>)}</select></label>
  </div>
  <label className="setting-check"><input type="checkbox" disabled={!settings.enabled} checked={settings.synchronizedDrops} onChange={e=>patch({synchronizedDrops:e.target.checked})}/> Gemeinsame Hocke bei nachgewiesenen Drops zulassen</label>
  <small>Kein künstliches Kniebeugen bei GLB-Modellen ohne geeignete Animation. Bei geringer Performance, pausierter Wiedergabe, manuellem Modus oder Lyrics-Vordergrund bleiben die Extras aus.</small>
 </fieldset>;
}
