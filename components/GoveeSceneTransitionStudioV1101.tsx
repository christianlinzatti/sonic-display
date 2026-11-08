'use client';
import {useEffect,useState} from 'react';
import {GOVEE_TRANSITION_KEY_V1101,GOVEE_TRANSITION_EVENT_V1101,
 loadGoveeTransitionV1101,saveGoveeTransitionV1101,normalizeGoveeTransitionV1101,
 planGoveeSceneTransitionV1101,applyGoveeSceneTransitionV1101,
 type GoveeTransitionSettingsV1101,type GoveeTransitionStyleV1101} from '@/lib/goveeSceneTransitionV1101';
import {loadGoveeRoomV1096,GOVEE_ROOM_KEY_V1096,GOVEE_ROOM_EVENT_V1096,planGoveeRoomV1096} from '@/lib/goveeRoomLightingV1096';
import {loadGoveeSyncV1027,GOVEE_SYNC_KEY_V1027,GOVEE_SYNC_EVENT_V1027,GOVEE_ZONES_V1027} from '@/lib/goveeConcertSyncV1027';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
const LABELS={wall:'Bühnenwand',rhythm:'Bass / Rhythmus',neon:'Neon',ambient:'Ambiente'};
export function GoveeSceneTransitionStudioV1101({config,devices}:{config:GoveeConfigV909;devices:GoveeDeviceV909[]}){
 const [settings,setSettings]=useState<GoveeTransitionSettingsV1101>(loadGoveeTransitionV1101);
 const [room,setRoom]=useState(loadGoveeRoomV1096),[sync,setSync]=useState(loadGoveeSyncV1027);
 const [phase,setPhase]=useState<'verse'|'build'|'hook'|'break'>('hook');
 const [progress,setProgress]=useState(0.35);
 useEffect(()=>{
  const refresh=()=>{setSettings(loadGoveeTransitionV1101());setRoom(loadGoveeRoomV1096());setSync(loadGoveeSyncV1027());};
  const storage=(e:StorageEvent)=>{if(!e.key||[GOVEE_TRANSITION_KEY_V1101,GOVEE_ROOM_KEY_V1096,GOVEE_SYNC_KEY_V1027].includes(e.key))refresh();};
  refresh();window.addEventListener(GOVEE_TRANSITION_EVENT_V1101,refresh);
  window.addEventListener(GOVEE_ROOM_EVENT_V1096,refresh);window.addEventListener(GOVEE_SYNC_EVENT_V1027,refresh);
  window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_TRANSITION_EVENT_V1101,refresh);
   window.removeEventListener(GOVEE_ROOM_EVENT_V1096,refresh);window.removeEventListener(GOVEE_SYNC_EVENT_V1027,refresh);
   window.removeEventListener('storage',storage);};
 },[]);
 const save=(raw:GoveeTransitionSettingsV1101)=>{
  const next=normalizeGoveeTransitionV1101(raw);saveGoveeTransitionV1101(next);setSettings(next);
 };
 const ready=Boolean(config.enabled&&config.autoSync&&config.directorEnabledV911&&room.enabled&&
  config.selectedIps.length>0&&config.selectedIps.length<=4);
 const cue={phase,previous:'verse' as const,transition:progress,verified:true};
 return <section className="govee-v909-device-list" aria-label="V1101 Govee Scene Transition Smoother">
  <h3>V1101 · Govee Scene Transition Smoother</h3>
  <p className="settings-note">Neue Raumlicht-Farben bei bestätigten Songabschnitten sanft einblenden. Keine eigene Songanalyse, keine zusätzlichen LAN-Befehle und keine Helligkeitsanhebung.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled}
   onChange={e=>save({...settings,enabled:e.target.checked})}/> Sanfte Szenenwechsel aktivieren</label>
  <label>Übergangsstil <select value={settings.style} onChange={e=>save({...settings,style:e.target.value as GoveeTransitionStyleV1101})}>
   <option value="gentle">Sanft</option><option value="cinematic">Cinematic</option><option value="festival">Festival</option>
  </select></label>
  <label>Übergangsstärke · {settings.strength} % <input type="range" min={0} max={80} step={5}
   value={settings.strength} onChange={e=>save({...settings,strength:Number(e.target.value)})}/></label>
  <strong>Reine Vorschau – keine Hardwarebefehle</strong>
  <label>Musikabschnitt <select value={phase} onChange={e=>setPhase(e.target.value as typeof phase)}>
   <option value="verse">Strophe</option><option value="build">Aufbau</option>
   <option value="hook">Hook</option><option value="break">Break</option></select></label>
  <label>Fortschritt im Abschnitt · {Math.round(progress*100)} % <input type="range" min={0} max={100} step={5}
   value={Math.round(progress*100)} onChange={e=>setProgress(Number(e.target.value)/100)}/></label>
  <div className="govee-v909-device-list" aria-label="V1101 simulierte sanfte Übergänge">
   {GOVEE_ZONES_V1027.map(zone=>{
    const ip=sync.fixtureIps[zone];
    const base=planGoveeRoomV1096({settings:{...room,enabled:true},syncSettings:sync,ip,
     selectedIps:config.selectedIps,phase:cue,genre:'Deutschrap',bridgeEnabled:true,
     autoSync:true,directorEnabled:true,playing:true,visible:true,stageIsArena:true});
    const decision=planGoveeSceneTransitionV1101({settings:{...settings,enabled:true},base,phase:cue});
    const applied=applyGoveeSceneTransitionV1101(base,decision);
    return <div key={zone} className="govee-v909-device">
     <span>{LABELS[zone]} · {devices.find(d=>d.ip===ip)?.name||ip||'nicht zugeordnet'}</span>
     <span>{base.active?`${Math.round(applied.mix/Math.max(base.mix,.000001)*100)} % Farbanteil`:'Keine Freigabe'}</span>
     <span aria-label={`${zone}: ${base.active?'simulierter Übergang':'kein Raum-Cue'}`}
      style={{display:'inline-block',width:38,height:24,borderRadius:6,border:'1px solid #888',
       backgroundColor:base.active?`rgb(${applied.accent.r},${applied.accent.g},${applied.accent.b})`:'transparent',
       opacity:base.active?Math.max(.15,applied.mix/Math.max(.001,base.mix)):1}}/>
    </div>;
   })}
  </div>
  <p className="settings-note" role="status">{ready?'Grundfreigabe vorhanden. Live werden nur tatsächlich bestätigte V318-Musikabschnitte verwendet.':'Für den Livebetrieb V1096, Govee-Synchronisierung und Gerätezuordnung aktivieren.'}</p>
 </section>;
}
