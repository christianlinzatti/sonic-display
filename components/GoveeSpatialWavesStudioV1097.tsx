'use client';
import {useEffect,useState} from 'react';
import {GOVEE_ZONES_V1027,loadGoveeSyncV1027,GOVEE_SYNC_EVENT_V1027,GOVEE_SYNC_KEY_V1027} from '@/lib/goveeConcertSyncV1027';
import {GOVEE_ROOM_EVENT_V1096,GOVEE_ROOM_KEY_V1096,loadGoveeRoomV1096,planGoveeRoomV1096} from '@/lib/goveeRoomLightingV1096';
import {GOVEE_WAVES_KEY_V1097,GOVEE_WAVES_EVENT_V1097,loadGoveeWavesV1097,
 saveGoveeWavesV1097,normalizeGoveeWavesV1097,planGoveeSpatialWaveV1097,
 type GoveeWaveSettingsV1097,type GoveeWaveStyleV1097} from '@/lib/goveeSpatialWavesV1097';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';

const LABELS={wall:'Bühnenwand',rhythm:'Bass / Rhythmus',neon:'Neon-Akzent',ambient:'Ambiente'};
export function GoveeSpatialWavesStudioV1097({config,devices}:{config:GoveeConfigV909;devices:GoveeDeviceV909[]}){
 const [settings,setSettings]=useState<GoveeWaveSettingsV1097>(loadGoveeWavesV1097);
 const [room,setRoom]=useState(loadGoveeRoomV1096);
 const [sync,setSync]=useState(loadGoveeSyncV1027);
 const [preview,setPreview]=useState(0);
 useEffect(()=>{
  const reload=()=>{setSettings(loadGoveeWavesV1097());setRoom(loadGoveeRoomV1096());setSync(loadGoveeSyncV1027());};
  const storage=(e:StorageEvent)=>{if(!e.key||[GOVEE_WAVES_KEY_V1097,GOVEE_ROOM_KEY_V1096,GOVEE_SYNC_KEY_V1027].includes(e.key))reload();};
  reload();window.addEventListener(GOVEE_WAVES_EVENT_V1097,reload);
  window.addEventListener(GOVEE_ROOM_EVENT_V1096,reload);
  window.addEventListener(GOVEE_SYNC_EVENT_V1027,reload);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_WAVES_EVENT_V1097,reload);
   window.removeEventListener(GOVEE_ROOM_EVENT_V1096,reload);
   window.removeEventListener(GOVEE_SYNC_EVENT_V1027,reload);window.removeEventListener('storage',storage);};
 },[]);
 const save=(next:GoveeWaveSettingsV1097)=>{
  const safe=normalizeGoveeWavesV1097(next);saveGoveeWavesV1097(safe);setSettings(safe);
 };
 const ready=config.enabled&&config.autoSync&&config.directorEnabledV911&&
  room.enabled&&config.selectedIps.length>0&&config.selectedIps.length<=4;
 return <section className="govee-v909-device-list" aria-label="V1097 Govee Spatial Light Waves">
  <h3>V1097 · Govee Spatial Light Waves</h3>
  <p className="settings-note">Eine sanft wandernde Farbwelle zwischen deinen vier Govee-Zonen. Baut auf der bestätigten V1096-Raumlicht-Regie auf. Kein neuer LAN-Sendetakt und keine zusätzlichen Helligkeitsspitzen.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled}
   onChange={e=>save({...settings,enabled:e.target.checked})}/> Räumliche Lichtwellen aktivieren</label>
  <label>Wellenformation
   <select value={settings.style} onChange={e=>save({...settings,style:e.target.value as GoveeWaveStyleV1097})}>
    <option value="orbit">Rundum laufend</option><option value="mirror">Gespiegelte Paare</option>
    <option value="breath">Gemeinsam pulsierend</option>
   </select></label>
  <label>Wellenintensität · {settings.strength}%
   <input type="range" min={0} max={60} step={5} value={settings.strength}
    onChange={e=>save({...settings,strength:Number(e.target.value)})}/></label>
  <label>Reine Vorschau – bestätigter Hook (Simulation) · {preview}%
   <input type="range" min={0} max={100} step={5} value={preview}
    onChange={e=>setPreview(Number(e.target.value))}/></label>
  <div className="govee-v909-device-list" aria-label="V1097 simulierte Lichtwelle">
   {GOVEE_ZONES_V1027.map(zone=>{
    const ip=sync.fixtureIps[zone];
    const phase={phase:'hook' as const,previous:'verse' as const,transition:preview/100,verified:true};
    const base=planGoveeRoomV1096({settings:{...room,enabled:true},syncSettings:sync,ip,
     selectedIps:config.selectedIps,phase,genre:'Pop',bridgeEnabled:true,autoSync:true,
     directorEnabled:true,playing:true,visible:true,stageIsArena:true});
    const decision=planGoveeSpatialWaveV1097({settings:{...settings,enabled:true},base,phase});
    const amount=decision.active?Math.round(decision.wave*100):0;
    const device=devices.find(d=>d.ip===ip);
    return <div className="govee-v909-device" key={zone}>
     <span>{LABELS[zone]} · {device?.name||ip||'nicht zugeordnet'}</span>
     <span aria-label={`${zone}: ${amount}% simulierte Welle`}
      style={{display:'inline-block',width:80,height:12,borderRadius:6,
       background:'rgba(130,140,150,.25)',overflow:'hidden'}}>
      <span style={{display:'block',height:'100%',width:`${amount}%`,
       background:base.active?`rgb(${base.accent.r},${base.accent.g},${base.accent.b})`:'transparent'}}/>
     </span>
    </div>;
   })}
  </div>
  <p className="settings-note" role="status">{ready?'V1096 ist freigegeben. Die tatsächliche Welle benötigt zusätzlich eine bestätigte V318-Songphase und gültige Zonenzuordnung.':'Für den Livebetrieb zuerst V1096, Govee-LAN, Musik-Sync und die vier Zonen freigeben.'}</p>
  <p className="settings-note">Diese Vorschau sendet keine LAN-Kommandos. Gespeicherte Shows, Sprachbefehle, manuelle Lichtmuster, Gruppensynchronisation und Sicherheits-Governor haben weiterhin Vorrang.</p>
 </section>;
}
