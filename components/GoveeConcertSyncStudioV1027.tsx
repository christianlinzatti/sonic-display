'use client';
import {useEffect,useState} from 'react';
import {GOVEE_SYNC_EVENT_V1027,GOVEE_SYNC_KEY_V1027,GOVEE_ZONES_V1027,
 loadGoveeSyncV1027,saveGoveeSyncV1027,normalizeGoveeSyncV1027,
 type GoveeSyncSettingsV1027,type GoveeZoneV1027} from '@/lib/goveeConcertSyncV1027';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
const labels:Record<GoveeZoneV1027,string>={wall:'1 · Bühnenwand',rhythm:'2 · Rhythmus / Bass',
 neon:'3 · Neon / Akzent',ambient:'4 · Ambiente / Ruhe'};
export function GoveeConcertSyncStudioV1027({config,devices,onConfig}:{config:GoveeConfigV909;
 devices:GoveeDeviceV909[];onConfig:(patch:Partial<GoveeConfigV909>)=>void}){
 const [settings,setSettings]=useState<GoveeSyncSettingsV1027>(loadGoveeSyncV1027);
 useEffect(()=>{const refresh=()=>setSettings(loadGoveeSyncV1027());
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===GOVEE_SYNC_KEY_V1027)refresh();};
  refresh();window.addEventListener(GOVEE_SYNC_EVENT_V1027,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_SYNC_EVENT_V1027,refresh);window.removeEventListener('storage',storage);};
 },[]);
 const save=(next:GoveeSyncSettingsV1027)=>{const safe=normalizeGoveeSyncV1027(next);
  setSettings(safe);saveGoveeSyncV1027(safe);};
 const assigned=Object.values(settings.fixtureIps).filter(Boolean);
 const available=config.selectedIps.slice(0,4);
 const ready=config.enabled&&config.autoSync&&config.directorEnabledV911&&settings.enabled&&
  available.length>0&&config.selectedIps.length<=4&&assigned.some(ip=>available.includes(ip));
 return <section aria-label="V1027 Govee Concert Sync 3.0" className="govee-v909-device-list">
  <h3>V1027 · Govee Concert Sync 3.0 · Vier-Zonen-Regie</h3>
  <p className="settings-note">Freiwillige Feinanpassung der bestehenden Govee-LAN-Musikautomatik: vier feste Rollen, bestätigte Songabschnitte und sanfte Übergänge. Keine neuen Netzwerk-Timer, Blitze, Ein-/Ausschaltbefehle oder RGBIC-Segmentsteuerung. Die Zuordnung sendet zunächst keine Befehle.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled}
   onChange={e=>save({...settings,enabled:e.target.checked})}/> V1027 zusätzliche Vier-Zonen-Synchronisierung aktivieren</label>
  {GOVEE_ZONES_V1027.map(zone=>{
   const current=settings.fixtureIps[zone];
   return <label key={zone} className="govee-v909-device">{labels[zone]}
    <select aria-label={`V1027 ${labels[zone]} zuordnen`} value={current}
     onChange={event=>save({...settings,fixtureIps:{...settings.fixtureIps,[zone]:event.target.value}})}>
     <option value="">Keine Leuchte</option>
     {available.filter(ip=>ip===current||!assigned.includes(ip)).map(ip=>{
      const d=devices.find(item=>item.ip===ip);
      return <option key={ip} value={ip}>{d?.name||d?.sku||ip} · {ip}</option>;})}
    </select>
   </label>;
  })}
  <label>V1027-Effektstärke ({settings.strength} %)
   <input type="range" min={0} max={65} step={5} value={settings.strength}
    onChange={e=>save({...settings,strength:Number(e.target.value)})}/></label>
  <label>Sanfter Phasenübergang ({(settings.transitionMs/1000).toFixed(1)} s)
   <input type="range" min={1200} max={6000} step={100} value={settings.transitionMs}
    onChange={e=>save({...settings,transitionMs:Number(e.target.value)})}/></label>
  {available.filter(ip=>assigned.includes(ip)).map(ip=>{
   const value=settings.visualDelayMs[ip]??0;
   return <label key={ip} className="govee-v909-device">Sichtbare Verzögerung {devices.find(d=>d.ip===ip)?.name||ip}: {value} ms
    <input type="range" min={0} max={350} step={10} value={value}
     onChange={e=>save({...settings,visualDelayMs:{...settings.visualDelayMs,[ip]:Number(e.target.value)}})}/>
   </label>;
  })}
  <p className="settings-note" role="status">{ready?'V1027 konfiguriert · im bestehenden autorisierten LAN-Takt, nur bei bestätigter Songphase':'V1027 inaktiv · Govee-LAN, Musik-Sync, V911-Regie und Zonenzuordnung müssen ausdrücklich aktiv sein'}.
   Die manuell beobachtete Verzögerung und V927-Kalibrierung werden <strong>nicht addiert</strong>; der größere, auf 350 ms begrenzte Wert gilt. HTTP-Statuszeiten sind keine optische Messung.</p>
  <button type="button" onClick={()=>onConfig({autoSync:false})} disabled={!config.autoSync}>Musikautomatik pausieren · manueller Vorrang</button>
  <p className="settings-note">Beim Pausieren wird die gesamte Govee-Musikautomatik ausgeschaltet; sie startet erst nach erneuter manueller Aktivierung. Gespeicherte Shows, manuelle Licht-Cues, Blackout, Voice-Override und Lyrics-Schutz behalten Vorrang.</p>
 </section>;
}
