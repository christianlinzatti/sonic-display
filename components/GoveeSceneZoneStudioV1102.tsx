'use client';
import {useEffect,useState} from 'react';
import {GOVEE_CHOREOGRAPHER_KEY_V1102,GOVEE_CHOREOGRAPHER_EVENT_V1102,
 loadGoveeChoreographerV1102,saveGoveeChoreographerV1102,normalizeGoveeChoreographerV1102,
 planGoveeSceneZoneV1102,applyGoveeSceneZoneV1102,
 type GoveeSceneZoneSettingsV1102,type GoveeSceneZoneStyleV1102} from '@/lib/goveeSceneZoneChoreographerV1102';
import {loadGoveeRoomV1096,GOVEE_ROOM_KEY_V1096,GOVEE_ROOM_EVENT_V1096,planGoveeRoomV1096} from '@/lib/goveeRoomLightingV1096';
import {loadGoveeSyncV1027,GOVEE_SYNC_KEY_V1027,GOVEE_SYNC_EVENT_V1027,GOVEE_ZONES_V1027} from '@/lib/goveeConcertSyncV1027';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
const LABELS={wall:'Bühnenwand',rhythm:'Bass / Rhythmus',neon:'Neon-Akzent',ambient:'Ambiente'};
export function GoveeSceneZoneStudioV1102({config,devices}:{config:GoveeConfigV909;devices:GoveeDeviceV909[]}){
 const [settings,setSettings]=useState<GoveeSceneZoneSettingsV1102>(loadGoveeChoreographerV1102);
 const [room,setRoom]=useState(loadGoveeRoomV1096),[sync,setSync]=useState(loadGoveeSyncV1027);
 const [phase,setPhase]=useState<'verse'|'build'|'hook'|'drop'|'break'>('hook');
 const [progress,setProgress]=useState(.7);
 useEffect(()=>{
  const refresh=()=>{setSettings(loadGoveeChoreographerV1102());setRoom(loadGoveeRoomV1096());setSync(loadGoveeSyncV1027());};
  const storage=(e:StorageEvent)=>{if(!e.key||[GOVEE_CHOREOGRAPHER_KEY_V1102,GOVEE_ROOM_KEY_V1096,GOVEE_SYNC_KEY_V1027].includes(e.key))refresh();};
  refresh();window.addEventListener(GOVEE_CHOREOGRAPHER_EVENT_V1102,refresh);
  window.addEventListener(GOVEE_ROOM_EVENT_V1096,refresh);window.addEventListener(GOVEE_SYNC_EVENT_V1027,refresh);
  window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_CHOREOGRAPHER_EVENT_V1102,refresh);
   window.removeEventListener(GOVEE_ROOM_EVENT_V1096,refresh);window.removeEventListener(GOVEE_SYNC_EVENT_V1027,refresh);
   window.removeEventListener('storage',storage);};
 },[]);
 const save=(raw:GoveeSceneZoneSettingsV1102)=>{const next=normalizeGoveeChoreographerV1102(raw);
  saveGoveeChoreographerV1102(next);setSettings(next);};
 const ready=Boolean(config.enabled&&config.autoSync&&config.directorEnabledV911&&room.enabled&&
  config.selectedIps.length>0&&config.selectedIps.length<=4);
 const cue={phase,previous:'verse' as const,transition:progress,verified:true};
 return <section className="govee-v909-device-list" aria-label="V1102 Govee Scene Zone Choreographer">
  <h3>V1102 · Govee Scene Zone Choreographer</h3>
  <p className="settings-note">Vier Lichtzonen erhalten je nach bestätigtem Musikabschnitt unterschiedliche Rollen. Die automatische Gewichtung kann nur den zusätzlichen V1096-Farbanteil verringern; manuelle V1100-Gewichte und alle Sicherheits-Governors behalten Vorrang.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled}
   onChange={e=>save({...settings,enabled:e.target.checked})}/> Automatische Zonen-Choreografie aktivieren</label>
  <label>Showstil <select value={settings.style} onChange={e=>save({...settings,style:e.target.value as GoveeSceneZoneStyleV1102})}>
   <option value="balanced">Ausgewogen</option><option value="cinematic">Cinematic</option><option value="festival">Festival</option>
  </select></label>
  <label>Stärke · {settings.strength} % <input type="range" min={0} max={100} step={5}
   value={settings.strength} onChange={e=>save({...settings,strength:Number(e.target.value)})}/></label>
  <strong>Reine Vorschau – keine Hardwarebefehle</strong>
  <label>Musikabschnitt <select value={phase} onChange={e=>setPhase(e.target.value as typeof phase)}>
   <option value="verse">Strophe</option><option value="build">Aufbau</option><option value="hook">Hook</option>
   <option value="drop">Drop</option><option value="break">Break</option></select></label>
  <label>Fortschritt im Abschnitt · {Math.round(progress*100)} % <input type="range" min={0} max={100} step={5}
   value={Math.round(progress*100)} onChange={e=>setProgress(Number(e.target.value)/100)}/></label>
  <div className="govee-v909-device-list" aria-label="V1102 simulierte Zonen-Choreografie">
   {GOVEE_ZONES_V1027.map(zone=>{
    const ip=sync.fixtureIps[zone];
    const base=planGoveeRoomV1096({settings:{...room,enabled:true},syncSettings:sync,ip,
     selectedIps:config.selectedIps,phase:cue,genre:'Deutschrap',bridgeEnabled:true,
     autoSync:true,directorEnabled:true,playing:true,visible:true,stageIsArena:true});
    const decision=planGoveeSceneZoneV1102({settings:{...settings,enabled:true},base,phase:cue});
    const result=applyGoveeSceneZoneV1102(base,decision);
    const ratio=base.mix>0?result.mix/base.mix:0;
    return <div key={zone} className="govee-v909-device">
     <span>{LABELS[zone]} · {devices.find(d=>d.ip===ip)?.name||ip||'nicht zugeordnet'}</span>
     <span>{base.active?`${Math.round(ratio*100)} % Zusatzfarbe`:'Keine Freigabe'}</span>
     <span aria-label={`${zone}: ${base.active?'simulierter Zonenfokus':'kein Raum-Cue'}`}
      style={{display:'inline-block',width:38,height:24,borderRadius:6,border:'1px solid #888',
       backgroundColor:base.active?`rgb(${result.accent.r},${result.accent.g},${result.accent.b})`:'transparent',
       opacity:base.active?Math.max(.15,ratio):1}}/>
    </div>;
   })}
  </div>
  <p className="settings-note" role="status">{ready?'Grundfreigabe vorhanden. Im Livebetrieb werden nur vom Song bestätigte V318-Abschnitte genutzt.':'Für den Livebetrieb Govee-Synchronisierung, V1096 und die Gerätezonen aktivieren.'}</p>
 </section>;
}
