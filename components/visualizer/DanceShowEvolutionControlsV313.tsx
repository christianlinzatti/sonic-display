"use client";
import {useEffect,useState} from "react";
import {DEFAULT_EVOLUTION_V313,readEvolutionV313,writeEvolutionV313,DANCE_SHOW_EVOLUTION_EVENT_V313,type EvolutionSettingsV313} from "./danceShowEvolutionV313";

/** Music narrative adjusts only V306's automatic cues; all manual layers remain authoritative. */
export function DanceShowEvolutionControlsV313(){
  const [settings,setSettings]=useState<EvolutionSettingsV313>({...DEFAULT_EVOLUTION_V313});
  useEffect(()=>{const sync=()=>setSettings(readEvolutionV313());sync();window.addEventListener(DANCE_SHOW_EVOLUTION_EVENT_V313,sync);return()=>window.removeEventListener(DANCE_SHOW_EVOLUTION_EVENT_V313,sync);},[]);
  const edit=(changes:Partial<EvolutionSettingsV313>)=>setSettings(writeEvolutionV313({...settings,...changes}));
  return <fieldset className="stage-director-v287 dance-show-evolution-v313"><legend>Dance Show Evolution · V313</legend>
    <p>Entwickelt die automatische Show über den gesamten Song: Einstieg, Groove, Spannungsaufbau, Höhepunkt und Finale. Echte Breaks und Drops haben musikalischen Vorrang.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>edit({enabled:e.target.checked})}/> Song-Dramaturgie aktivieren</label>
    <label>Dramaturgie-Intensität ({settings.arcStrength} %)<input type="range" min="0" max="100" step="5" disabled={!settings.enabled} value={settings.arcStrength} onChange={e=>edit({arcStrength:Number(e.target.value)})}/></label>
    <label>Ruhiger Einstieg ({settings.calmIntro} %)<input type="range" min="0" max="100" step="5" disabled={!settings.enabled} value={settings.calmIntro} onChange={e=>edit({calmIntro:Number(e.target.value)})}/></label>
    <label>Spätere Höhepunkte ({settings.climaxLift} %)<input type="range" min="0" max="100" step="5" disabled={!settings.enabled} value={settings.climaxLift} onChange={e=>edit({climaxLift:Number(e.target.value)})}/></label>
    <label className="setting-check"><input type="checkbox" checked={settings.finaleEnabled} disabled={!settings.enabled} onChange={e=>edit({finaleEnabled:e.target.checked})}/> Filmischen Ausklang und Finale berücksichtigen</label>
    <label className="setting-check"><input type="checkbox" checked={settings.musicalPriority} disabled={!settings.enabled} onChange={e=>edit({musicalPriority:e.target.checked})}/> Breaks und Drops wichtiger als Zeitverlauf</label>
    <button type="button" onClick={()=>edit(DEFAULT_EVOLUTION_V313)}>V313 auf Standard setzen</button>
    <small>Nur bei aktiviertem Ultimate Show Director V306 und einer bekannten Songlänge ab 45 Sekunden. Keine zusätzlichen Drops, keine Änderungen an deinen importierten Motion-Clips, individuellen Keyframes oder Licht-Timelines. Pause und Reduced Motion haben Vorrang.</small>
  </fieldset>;
}
