'use client';
import {useEffect,useState} from 'react';
import {GOVEE_ZONES_V1027,loadGoveeSyncV1027,GOVEE_SYNC_EVENT_V1027,GOVEE_SYNC_KEY_V1027} from '@/lib/goveeConcertSyncV1027';
import {loadGoveeRoomV1096,GOVEE_ROOM_EVENT_V1096,GOVEE_ROOM_KEY_V1096,planGoveeRoomV1096} from '@/lib/goveeRoomLightingV1096';
import {GOVEE_JOURNEY_KEY_V1098,GOVEE_JOURNEY_EVENT_V1098,
 loadGoveeJourneyV1098,saveGoveeJourneyV1098,normalizeGoveeJourneyV1098,
 planGoveeColorJourneyV1098,applyGoveeColorJourneyV1098,
 type GoveeJourneySettingsV1098,type GoveeJourneyStyleV1098} from '@/lib/goveeColorJourneyV1098';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
const LABELS={wall:'Bühnenwand',rhythm:'Bass / Rhythmus',neon:'Neon-Akzent',ambient:'Ambiente'};
export function GoveeColorJourneyStudioV1098({config,devices}:{config:GoveeConfigV909;devices:GoveeDeviceV909[]}){
 const [settings,setSettings]=useState<GoveeJourneySettingsV1098>(loadGoveeJourneyV1098);
 const [room,setRoom]=useState(loadGoveeRoomV1096);
 const [sync,setSync]=useState(loadGoveeSyncV1027);
 const [scene,setScene]=useState<'verse'|'build'|'hook'|'drop'|'break'>('verse');
 const [progress,setProgress]=useState(45);
 useEffect(()=>{
  const reload=()=>{setSettings(loadGoveeJourneyV1098());setRoom(loadGoveeRoomV1096());setSync(loadGoveeSyncV1027());};
  const storage=(e:StorageEvent)=>{if(!e.key||[GOVEE_JOURNEY_KEY_V1098,GOVEE_ROOM_KEY_V1096,GOVEE_SYNC_KEY_V1027].includes(e.key))reload();};
  reload();window.addEventListener(GOVEE_JOURNEY_EVENT_V1098,reload);
  window.addEventListener(GOVEE_ROOM_EVENT_V1096,reload);window.addEventListener(GOVEE_SYNC_EVENT_V1027,reload);
  window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_JOURNEY_EVENT_V1098,reload);
   window.removeEventListener(GOVEE_ROOM_EVENT_V1096,reload);window.removeEventListener(GOVEE_SYNC_EVENT_V1027,reload);
   window.removeEventListener('storage',storage);};
 },[]);
 const save=(next:GoveeJourneySettingsV1098)=>{
  const safe=normalizeGoveeJourneyV1098(next);saveGoveeJourneyV1098(safe);setSettings(safe);
 };
 const ready=config.enabled&&config.autoSync&&config.directorEnabledV911&&room.enabled&&
  config.selectedIps.length>0&&config.selectedIps.length<=4;
 return <section className="govee-v909-device-list" aria-label="V1098 Govee Immersive Color Journey">
  <h3>V1098 · Govee Immersive Color Journey</h3>
  <p className="settings-note">Kühle Strophen, spannungsvoller Aufbau und wärmere Hooks: sanfte Farbdramaturgie für vier Raumzonen auf Basis bestätigter Musikabschnitte.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled}
   onChange={e=>save({...settings,enabled:e.target.checked})}/> Farbdramaturgie aktivieren</label>
  <label>Konzertlook <select value={settings.style}
   onChange={e=>save({...settings,style:e.target.value as GoveeJourneyStyleV1098})}>
   <option value="balanced">Ausgewogen</option><option value="cinematic">Cinematic</option>
   <option value="festival">Festival</option>
  </select></label>
  <label>Farbintensität · {settings.strength}% <input type="range" min={0} max={60} step={5}
   value={settings.strength} onChange={e=>save({...settings,strength:Number(e.target.value)})}/></label>
  <label>Reine Vorschau – simulierte Musikphase
   <select value={scene} onChange={e=>setScene(e.target.value as typeof scene)}>
    <option value="verse">Strophe</option><option value="build">Aufbau</option>
    <option value="hook">Hook</option><option value="drop">Drop</option>
    <option value="break">Break</option>
   </select></label>
  <label>Phasenfortschritt · {progress}% <input type="range" min={0} max={100} step={5}
   value={progress} onChange={e=>setProgress(Number(e.target.value))}/></label>
  <div className="govee-v909-device-list" aria-label="V1098 simulierte Farbstimmungen">
   {GOVEE_ZONES_V1027.map(zone=>{
    const ip=sync.fixtureIps[zone];
    const phase={phase:scene,previous:'verse' as const,transition:progress/100,verified:true};
    const base=planGoveeRoomV1096({settings:{...room,enabled:true},syncSettings:sync,ip,
     selectedIps:config.selectedIps,phase,genre:'Pop',bridgeEnabled:true,autoSync:true,
     directorEnabled:true,playing:true,visible:true,stageIsArena:true});
    const decision=planGoveeColorJourneyV1098({settings:{...settings,enabled:true},base,phase});
    const look=applyGoveeColorJourneyV1098(base,decision);
    const device=devices.find(d=>d.ip===ip);
    return <div className="govee-v909-device" key={zone}>
     <span>{LABELS[zone]} · {device?.name||ip||'nicht zugeordnet'}</span>
     <span aria-label={`${zone}: simulierte Farbe`}
      style={{display:'inline-block',width:80,height:14,borderRadius:7,
       background:base.active?`rgb(${look.accent.r},${look.accent.g},${look.accent.b})`:'rgba(130,140,150,.25)'}}/>
    </div>;
   })}
  </div>
  <p className="settings-note" role="status">{ready?'Live nur bei bestätigtem V318-Musikabschnitt und freigegebenen V1096-Zonen.':'V1096, Govee-LAN und Musik-Sync zuerst freigeben.'}</p>
  <p className="settings-note">Diese Simulation sendet keine Befehle. Manuelle Lichtshows, Sprachbefehle, Wellen und alle bisherigen Sicherheits-Grenzen haben Vorrang.</p>
 </section>;
}
