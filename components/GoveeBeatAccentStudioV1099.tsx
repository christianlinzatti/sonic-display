'use client';
import {useEffect,useState} from 'react';
import {GOVEE_ZONES_V1027,loadGoveeSyncV1027,GOVEE_SYNC_EVENT_V1027,GOVEE_SYNC_KEY_V1027} from '@/lib/goveeConcertSyncV1027';
import {loadGoveeRoomV1096,GOVEE_ROOM_EVENT_V1096,GOVEE_ROOM_KEY_V1096,planGoveeRoomV1096} from '@/lib/goveeRoomLightingV1096';
import {GOVEE_BEAT_ACCENT_KEY_V1099,GOVEE_BEAT_ACCENT_EVENT_V1099,loadGoveeBeatAccentV1099,
 saveGoveeBeatAccentV1099,normalizeGoveeBeatAccentV1099,planGoveeBeatAccentV1099,
 applyGoveeBeatAccentV1099,type GoveeBeatAccentSettingsV1099,type GoveeBeatAccentStyleV1099} from '@/lib/goveeLiveBeatAccentV1099';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
const LABELS={wall:'Bühnenwand',rhythm:'Bass / Rhythmus',neon:'Neon-Akzent',ambient:'Ambiente'};
export function GoveeBeatAccentStudioV1099({config,devices}:{config:GoveeConfigV909;devices:GoveeDeviceV909[]}){
 const [settings,setSettings]=useState<GoveeBeatAccentSettingsV1099>(loadGoveeBeatAccentV1099);
 const [room,setRoom]=useState(loadGoveeRoomV1096);
 const [sync,setSync]=useState(loadGoveeSyncV1027);
 const [strength,setStrength]=useState(95);
 const [age,setAge]=useState(100);
 const [phase,setPhase]=useState<'hook'|'drop'>('hook');
 useEffect(()=>{
  const refresh=()=>{setSettings(loadGoveeBeatAccentV1099());setRoom(loadGoveeRoomV1096());setSync(loadGoveeSyncV1027());};
  const storage=(e:StorageEvent)=>{if(!e.key||[GOVEE_BEAT_ACCENT_KEY_V1099,GOVEE_ROOM_KEY_V1096,GOVEE_SYNC_KEY_V1027].includes(e.key))refresh();};
  refresh();window.addEventListener(GOVEE_BEAT_ACCENT_EVENT_V1099,refresh);
  window.addEventListener(GOVEE_ROOM_EVENT_V1096,refresh);window.addEventListener(GOVEE_SYNC_EVENT_V1027,refresh);
  window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_BEAT_ACCENT_EVENT_V1099,refresh);
   window.removeEventListener(GOVEE_ROOM_EVENT_V1096,refresh);window.removeEventListener(GOVEE_SYNC_EVENT_V1027,refresh);
   window.removeEventListener('storage',storage);};
 },[]);
 const save=(next:GoveeBeatAccentSettingsV1099)=>{
  const safe=normalizeGoveeBeatAccentV1099(next);saveGoveeBeatAccentV1099(safe);setSettings(safe);
 };
 const ready=config.enabled&&config.autoSync&&config.directorEnabledV911&&room.enabled&&
  config.selectedIps.length>0&&config.selectedIps.length<=4;
 const cue={phase,previous:'verse' as const,transition:.8,verified:true};
 return <section className="govee-v909-device-list" aria-label="V1099 Govee Live Beat Accent">
  <h3>V1099 · Govee Live Beat Accent</h3>
  <p className="settings-note">Kurze, räumlich gestaffelte Farbakzente nur bei frischen, gemessenen Mikrofon-Beats in bestätigten Hooks und Drops. Keine neuen Hardwarebefehle, kein Stroboskop und keine Erhöhung der maximalen Helligkeit.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled}
   onChange={e=>save({...settings,enabled:e.target.checked})}/> Live-Beat-Farben aktivieren</label>
  <label>Akzentstil <select value={settings.style} onChange={e=>save({...settings,style:e.target.value as GoveeBeatAccentStyleV1099})}>
   <option value="soft">Sanft</option><option value="dynamic">Dynamisch</option></select></label>
  <label>Akzentintensität · {settings.strength}%<input type="range" min={0} max={60} step={5}
   value={settings.strength} onChange={e=>save({...settings,strength:Number(e.target.value)})}/></label>
  <strong>Reine Vorschau – simuliertes Signal, keine Hardwarebefehle</strong>
  <label>Abschnitt <select value={phase} onChange={e=>setPhase(e.target.value as 'hook'|'drop')}>
   <option value="hook">Hook</option><option value="drop">Drop</option></select></label>
  <label>Beat-Stärke · {strength}%<input type="range" min={75} max={100} step={5}
   value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label>
  <label>Signalalter · {age} ms<input type="range" min={0} max={600} step={50}
   value={age} onChange={e=>setAge(Number(e.target.value))}/></label>
  <div className="govee-v909-device-list" aria-label="Simulierte Beat-Akzentfarben">
   {GOVEE_ZONES_V1027.map(zone=>{
    const ip=sync.fixtureIps[zone];
    const base=planGoveeRoomV1096({settings:{...room,enabled:true},syncSettings:sync,ip,
     selectedIps:config.selectedIps,phase:cue,genre:'Hardtekk',bridgeEnabled:true,autoSync:true,
     directorEnabled:true,playing:true,visible:true,stageIsArena:true});
    const decision=planGoveeBeatAccentV1099({settings:{...settings,enabled:true},base,phase:cue,
     microphoneActive:true,beatObserved:true,beatStrength:strength/100,sampleAgeMs:age});
    const after=applyGoveeBeatAccentV1099(base,decision);
    return <div key={zone} className="govee-v909-device">
     <span>{LABELS[zone]} · {devices.find(d=>d.ip===ip)?.name||ip||'nicht zugeordnet'}</span>
     <span aria-label={`${zone}: ${decision.active?'simulierter Beat-Akzent':'kein gültiger Beat-Akzent'}`}
      style={{display:'inline-block',width:38,height:24,borderRadius:6,border:'1px solid #888',
       backgroundColor:base.active?`rgb(${after.accent.r},${after.accent.g},${after.accent.b})`:'transparent'}}/>
    </div>;
   })}
  </div>
  <p className="settings-note" role="status">{ready?'Govee-Grundfreigabe aktiv. Für Live-Akzente zusätzlich bestätigte V318-Abschnitte und ein frisches Mikrofon-Beatsignal erforderlich.':'Für Live-Akzente zunächst V1096 sowie LAN-, Musik- und Gerätesteuerung freigeben.'}</p>
  <p className="settings-note">Gespeicherte Shows, manuelle Befehle, Alexa, Gruppensteuerung und der bestehende V961-Sicherheits-Governor haben Vorrang. Diese Vorschau sendet keine Befehle.</p>
 </section>;
}
