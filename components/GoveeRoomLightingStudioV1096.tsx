'use client';
import {useEffect,useState} from 'react';
import {GOVEE_ZONES_V1027,GOVEE_SYNC_EVENT_V1027,GOVEE_SYNC_KEY_V1027,
 loadGoveeSyncV1027} from '@/lib/goveeConcertSyncV1027';
import {GOVEE_ROOM_KEY_V1096,GOVEE_ROOM_EVENT_V1096,loadGoveeRoomV1096,
 saveGoveeRoomV1096,normalizeGoveeRoomV1096,planGoveeRoomV1096,
 type GoveeRoomSettingsV1096,type GoveeRoomStyleV1096} from '@/lib/goveeRoomLightingV1096';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
const names={wall:'Bühnenwand',rhythm:'Rhythmus',neon:'Neon-Akzent',ambient:'Ambiente'};
export function GoveeRoomLightingStudioV1096({config,devices}:{config:GoveeConfigV909;devices:GoveeDeviceV909[]}){
 const [settings,setSettings]=useState<GoveeRoomSettingsV1096>(loadGoveeRoomV1096);
 const [sync,setSync]=useState(loadGoveeSyncV1027);
 const [previewPhase,setPreviewPhase]=useState<'verse'|'hook'|'build'|'drop'|'break'>('verse');
 useEffect(()=>{
  const refresh=()=>setSettings(loadGoveeRoomV1096());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_ROOM_KEY_V1096)refresh();};
  refresh();window.addEventListener(GOVEE_ROOM_EVENT_V1096,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_ROOM_EVENT_V1096,refresh);window.removeEventListener('storage',storage);};
 },[]);
 useEffect(()=>{
  const refresh=()=>setSync(loadGoveeSyncV1027());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_SYNC_KEY_V1027)refresh();};
  refresh();window.addEventListener(GOVEE_SYNC_EVENT_V1027,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_SYNC_EVENT_V1027,refresh);window.removeEventListener('storage',storage);};
 },[]);
 const save=(next:GoveeRoomSettingsV1096)=>{const safe=normalizeGoveeRoomV1096(next);saveGoveeRoomV1096(safe);setSettings(safe);};
 const zones=GOVEE_ZONES_V1027.filter(zone=>config.selectedIps.includes(sync.fixtureIps[zone]));
 const ready=config.enabled&&config.autoSync&&config.directorEnabledV911&&config.selectedIps.length<=4&&zones.length>0;
 return <section className="govee-v909-device-list" aria-label="V1096 Govee Room Lighting 5.0">
  <h3>V1096 · Govee Room Lighting 5.0</h3>
  <p className="settings-note">Optionale Raumlicht-Farbharmonie für bis zu vier zugeordnete Govee-LAN-Leuchten. Nutzt nur bestätigte Musikabschnitte und denselben sicheren LAN-Sendetakt. Keine neuen Timer, RGBIC-Kommandos, Blitze oder automatischen Ein-/Ausschaltbefehle.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled}
   onChange={e=>save({...settings,enabled:e.target.checked})}/> Zusätzliche Raumlicht-Regie aktivieren</label>
  <label>Raumlicht-Stil
   <select value={settings.style} onChange={e=>save({...settings,style:e.target.value as GoveeRoomStyleV1096})}>
    <option value="balanced">Ausgewogen</option><option value="cinematic">Cinematic</option><option value="festival">Festival</option>
   </select></label>
  <label>Zusätzliche Farbanpassung · {settings.strength}%
   <input type="range" min={0} max={60} step={5} value={settings.strength}
    onChange={e=>save({...settings,strength:Number(e.target.value)})}/></label>
  <p className="settings-note" role="status">{ready?'Zonen bereit · die tatsächliche Ausgabe setzt außerdem eine bestätigte V318-Songphase voraus.':'Noch nicht bereit: Govee-LAN, Musik-Sync, V911-Regie und mindestens eine V1027-Zonenzuordnung aktivieren.'} V1027 muss für die Zuordnung nicht selbst eingeschaltet werden.</p>
  <label>Reine Vorschau (keine LAN-Kommandos)
   <select value={previewPhase} onChange={e=>setPreviewPhase(e.target.value as typeof previewPhase)}>
    <option value="verse">Strophe</option><option value="build">Aufbau</option><option value="hook">Hook</option><option value="drop">Bestätigter Drop (Simulation)</option><option value="break">Break</option>
   </select></label>
  <div className="govee-v909-device-list" aria-label="Simulierte Govee-Raumfarben">
   {GOVEE_ZONES_V1027.map(zone=>{
    const ip=sync.fixtureIps[zone];
    const decision=planGoveeRoomV1096({settings:{...settings,enabled:true},syncSettings:sync,
     ip,selectedIps:config.selectedIps,phase:{phase:previewPhase,previous:previewPhase,transition:1,verified:true},
     genre:'pop',bridgeEnabled:true,autoSync:true,directorEnabled:true,playing:true,visible:true,stageIsArena:true});
    const device=devices.find(d=>d.ip===ip);
    return <div className="govee-v909-device" key={zone}>
     <span>{names[zone]} · {device?.name||ip||'nicht zugeordnet'} · {decision.active?'Vorschau':'inaktiv'}</span>
     <span aria-label={`${zone} Farbprobe`} style={{display:'inline-block',width:38,height:24,borderRadius:6,
      border:'1px solid #888',backgroundColor:decision.active?`rgb(${decision.accent.r},${decision.accent.g},${decision.accent.b})`:'transparent'}}/>
    </div>;
   })}
  </div>
  <p className="settings-note">Die Vorschau nutzt künstliche Beispielabschnitte und sendet <strong>nie</strong> an die Leuchten. Im Livebetrieb haben manuelle Shows, Gruppenmodus, Sprachbefehle, V987-Raumatmosphäre, V1027-Sync und V1042-Showakzente Vorrang. Ohne bestätigte Songphase bleibt V1096 inaktiv.</p>
 </section>;
}
