'use client';
import {useEffect,useState} from 'react';
import {GOVEE_ZONES_V1027,loadGoveeSyncV1027,GOVEE_SYNC_EVENT_V1027,GOVEE_SYNC_KEY_V1027} from '@/lib/goveeConcertSyncV1027';
import {loadGoveeRoomV1096,GOVEE_ROOM_EVENT_V1096,GOVEE_ROOM_KEY_V1096,planGoveeRoomV1096} from '@/lib/goveeRoomLightingV1096';
import {GOVEE_ZONE_MIXER_KEY_V1100,GOVEE_ZONE_MIXER_EVENT_V1100,GOVEE_ZONE_PRESETS_V1100,
 loadGoveeZoneMixerV1100,saveGoveeZoneMixerV1100,normalizeGoveeZoneMixerV1100,
 planGoveeZoneMixV1100,applyGoveeZoneMixV1100,
 type GoveeZoneMixerSettingsV1100,type GoveeZonePresetV1100} from '@/lib/goveeRoomZoneMixerV1100';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
const LABELS={wall:'Bühnenwand',rhythm:'Bass / Rhythmus',neon:'Neon-Akzent',ambient:'Ambiente'};
export function GoveeRoomZoneMixerStudioV1100({config,devices}:{config:GoveeConfigV909;devices:GoveeDeviceV909[]}){
 const [settings,setSettings]=useState<GoveeZoneMixerSettingsV1100>(loadGoveeZoneMixerV1100);
 const [room,setRoom]=useState(loadGoveeRoomV1096);
 const [sync,setSync]=useState(loadGoveeSyncV1027);
 const [phase,setPhase]=useState<'verse'|'build'|'hook'|'break'>('hook');
 useEffect(()=>{
  const refresh=()=>{setSettings(loadGoveeZoneMixerV1100());setRoom(loadGoveeRoomV1096());setSync(loadGoveeSyncV1027());};
  const storage=(e:StorageEvent)=>{if(!e.key||[GOVEE_ZONE_MIXER_KEY_V1100,GOVEE_ROOM_KEY_V1096,GOVEE_SYNC_KEY_V1027].includes(e.key))refresh();};
  refresh();
  window.addEventListener(GOVEE_ZONE_MIXER_EVENT_V1100,refresh);
  window.addEventListener(GOVEE_ROOM_EVENT_V1096,refresh);
  window.addEventListener(GOVEE_SYNC_EVENT_V1027,refresh);
  window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_ZONE_MIXER_EVENT_V1100,refresh);
   window.removeEventListener(GOVEE_ROOM_EVENT_V1096,refresh);
   window.removeEventListener(GOVEE_SYNC_EVENT_V1027,refresh);
   window.removeEventListener('storage',storage);};
 },[]);
 const save=(raw:GoveeZoneMixerSettingsV1100)=>{
  const next=normalizeGoveeZoneMixerV1100(raw);saveGoveeZoneMixerV1100(next);setSettings(next);
 };
 const ready=Boolean(config.enabled&&config.autoSync&&config.directorEnabledV911&&room.enabled&&
  config.selectedIps.length>0&&config.selectedIps.length<=4);
 const cue={phase,previous:'verse' as const,transition:.7,verified:true};
 return <section className="govee-v909-device-list" aria-label="V1100 Govee Room Zone Mixer">
  <h3>V1100 · Govee Room Zone Mixer</h3>
  <p className="settings-note">Die vier Raumlichtzonen getrennt abstimmen. Die Regler reduzieren ausschließlich den zusätzlichen Farbanteil bereits freigegebener V1096-Cues – keine Einschaltbefehle und keine Helligkeitsanhebung.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled}
   onChange={e=>save({...settings,enabled:e.target.checked})}/> Zonenmischer aktivieren</label>
  <p>Voreinstellungen:{' '}{(['balanced','stage','ambient'] as const).map(preset=><button key={preset} type="button"
    onClick={()=>save({...settings,weights:{...GOVEE_ZONE_PRESETS_V1100[preset as GoveeZonePresetV1100]}})}>
    {preset==='balanced'?'Alle gleich':preset==='stage'?'Bühne im Fokus':'Ambiente im Fokus'}</button>)}</p>
  {GOVEE_ZONES_V1027.map(zone=><label key={zone}>{LABELS[zone]} · {settings.weights[zone]} %
   <input type="range" min={0} max={100} step={5} value={settings.weights[zone]}
    onChange={e=>save({...settings,weights:{...settings.weights,[zone]:Number(e.target.value)}})}/></label>)}
  <strong>Reine Vorschau – keine Hardwarebefehle</strong>
  <label>Musikabschnitt <select value={phase} onChange={e=>setPhase(e.target.value as typeof phase)}>
   <option value="verse">Strophe</option><option value="build">Aufbau</option>
   <option value="hook">Hook</option><option value="break">Break</option></select></label>
  <div className="govee-v909-device-list" aria-label="V1100 simulierte Raumlichtzonen">
   {GOVEE_ZONES_V1027.map(zone=>{
    const ip=sync.fixtureIps[zone];
    const base=planGoveeRoomV1096({settings:{...room,enabled:true},syncSettings:sync,ip,
      selectedIps:config.selectedIps,phase:cue,genre:'Deutschrap',bridgeEnabled:true,
      autoSync:true,directorEnabled:true,playing:true,visible:true,stageIsArena:true});
    const decision=planGoveeZoneMixV1100({settings:{...settings,enabled:true},base,phase:cue});
    const mixed=applyGoveeZoneMixV1100(base,decision);
    return <div className="govee-v909-device" key={zone}>
     <span>{LABELS[zone]} · {devices.find(d=>d.ip===ip)?.name||ip||'nicht zugeordnet'}</span>
     <span>{base.active?`${Math.round(mixed.mix/base.mix*100)||0} % Farbanteil`:'Keine Freigabe'}</span>
     <span aria-label={`${zone}: ${base.active?'simulierter Farbanteil':'kein freigegebener Raum-Cue'}`}
      style={{display:'inline-block',width:38,height:24,borderRadius:6,border:'1px solid #888',
       backgroundColor:base.active?`rgb(${mixed.accent.r},${mixed.accent.g},${mixed.accent.b})`:'transparent',
       opacity:base.active?Math.max(.15,mixed.mix/Math.max(.001,base.mix)):1}}/>
    </div>;
   })}
  </div>
  <p className="settings-note" role="status">{ready?'Govee-Grundfreigabe aktiv; live nur bei tatsächlich bestätigten V318-Musikabschnitten.':'Für den Livebetrieb zuerst V1096, Gerätezuordnung und Govee-Musiksynchronisierung aktivieren.'}</p>
  <p className="settings-note">Bei Reglerwert 0 wird nur der zusätzliche Farbakzent unterdrückt. Bestehende manuelle Shows, Alexa, die Govee-Governors und die V909-LAN-Sendegrenzen bleiben unberührt.</p>
 </section>;
}
