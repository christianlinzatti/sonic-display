'use client';
import {useCallback,useEffect,useState} from 'react';
import {DEFAULT_GOVEE_CONFIG_V909,GOVEE_CONFIG_KEY_V909,loadGoveeConfigV909,saveGoveeConfigV909,
 goveeBridgeRequestV909,isGoveeLanIpV909,validBridgeUrlV909,type GoveeConfigV909,type GoveeDeviceV909,type GoveeRoleSelectionV911} from '@/lib/goveeLanV909';
import {resolveGoveeRoleV911,resolveGoveePhaseV911,planGoveeConcertLookV911,type GoveePhaseV911} from '@/lib/goveeConcertDirectorV911';
import {readTrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import {useMusic} from '@/context/MusicContext';
import {GoveeLightShowEditorV912} from '@/components/GoveeLightShowEditorV912';
import {GoveeDeviceGroupStudioV915} from '@/components/GoveeDeviceGroupStudioV915';
import {GoveeBassStudioV917} from '@/components/GoveeBassStudioV917';
import {GoveeBeatStudioV918} from '@/components/GoveeBeatStudioV918';
import {GoveeSectionStudioV919} from '@/components/GoveeSectionStudioV919';
import {GoveeGenreStudioV920} from '@/components/GoveeGenreStudioV920';
import {GoveeConcertSyncStudioV921} from '@/components/GoveeConcertSyncStudioV921';
import {GoveeShockwaveStudioV922} from '@/components/GoveeShockwaveStudioV922';
import {GoveeNeonPulseStudioV923} from '@/components/GoveeNeonPulseStudioV923';
import {GoveeLightEnergyStudioV924} from '@/components/GoveeLightEnergyStudioV924';
import {GoveeFestivalFxStudioV925} from '@/components/GoveeFestivalFxStudioV925';
import {GoveeSpatialStudioV926} from '@/components/GoveeSpatialStudioV926';
import {GoveeRoomCalibrationStudioV927} from '@/components/GoveeRoomCalibrationStudioV927';
import {GoveeConcertSyncStudioV1027} from '@/components/GoveeConcertSyncStudioV1027';
import {GoveeRoomLightingStudioV1096} from '@/components/GoveeRoomLightingStudioV1096';
import {GoveeSpatialWavesStudioV1097} from '@/components/GoveeSpatialWavesStudioV1097';
import {GoveeColorJourneyStudioV1098} from '@/components/GoveeColorJourneyStudioV1098';
import {GoveeBeatAccentStudioV1099} from '@/components/GoveeBeatAccentStudioV1099';
import {GoveeRoomZoneMixerStudioV1100} from '@/components/GoveeRoomZoneMixerStudioV1100';
import {GoveeSceneTransitionStudioV1101} from '@/components/GoveeSceneTransitionStudioV1101';
import {GoveeSceneZoneStudioV1102} from '@/components/GoveeSceneZoneStudioV1102';
import {GoveeRoomPerformanceDashboardV928} from '@/components/GoveeRoomPerformanceDashboardV928';
import {IntegrationSetupWizardV971} from '@/components/IntegrationSetupWizardV971';
import {GoveeLightDashboardV1142} from '@/components/GoveeLightDashboardV1142';
import {ConcertRoadmapStudioV958} from '@/components/ConcertRoadmapStudioV958';
import {recoveryDelayV930} from '@/lib/ultimateConcertRoadmapV958';
type DeviceList={devices:GoveeDeviceV909[]};
type Health={ok:boolean;udpError:string|null;devices:number;onlineDevices?:number;uptimeSeconds?:number;lastScanAt?:number;version:string};
const rgbHex=(text:string)=>/^#[0-9a-fA-F]{6}$/.test(text)?text:'#a51bc9';
function hexColor(hex:string){const n=parseInt(hex.slice(1),16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
export function GoveeLanPanelV909(){
 const {track,progressMs,genre}=useMusic();
 const [previewPhase,setPreviewPhase]=useState<GoveePhaseV911>('verse');
 const [config,setConfig]=useState<GoveeConfigV909>({...DEFAULT_GOVEE_CONFIG_V909});
 const [devices,setDevices]=useState<GoveeDeviceV909[]>([]);
 const [health,setHealth]=useState<Health|null>(null);
 const [busy,setBusy]=useState(false);
 const [lastRefreshedAt,setLastRefreshedAt]=useState(0);
 const [checkInitiated,setCheckInitiated]=useState(false);
 const [bridgeState,setBridgeState]=useState<'unchecked'|'connected'|'offline'>('unchecked');
 const [notice,setNotice]=useState('Bridge starten und Token eintragen, anschließend Geräte suchen.');
 const [ip,setIp]=useState('');const [color,setColor]=useState('#a51bc9');const [kelvin,setKelvin]=useState(4000);
 const update=useCallback((patch:Partial<GoveeConfigV909>)=>{
  const next={...config,...patch};
  setConfig(next);saveGoveeConfigV909(next);
 },[config]);
 useEffect(()=>{
  const refresh=()=>setConfig(loadGoveeConfigV909());
  const storage=(event:StorageEvent)=>{if(event.key===GOVEE_CONFIG_KEY_V909||event.key===null)refresh();};
  refresh();window.addEventListener('storage',storage);
  return()=>window.removeEventListener('storage',storage);
 },[]);
 // Only poll after a deliberate user connection attempt, respecting Chromium LNA prompts.
 // This reconnects the settings UI after Wi-Fi loss or a systemd bridge restart.
 useEffect(()=>{
  if(!checkInitiated||!config.token.trim())return;
  let cancelled=false;let inFlight=false;let failures=0;let nextAt=0;
  const poll=async()=>{
   if(cancelled||inFlight||document.hidden||!navigator.onLine||Date.now()<nextAt)return;
   inFlight=true;
   try{
    const h=await goveeBridgeRequestV909<Health>(config,'/health');
    if(cancelled)return;
    setHealth(h);setBridgeState(h.ok?'connected':'offline');
    if(h.ok){failures=0;nextAt=0;const list=await goveeBridgeRequestV909<DeviceList>(config,'/devices');if(!cancelled){setDevices(list.devices);setLastRefreshedAt(Date.now());}}
   }catch{failures++;nextAt=Date.now()+recoveryDelayV930(failures);if(!cancelled)setBridgeState('offline');}
   finally{inFlight=false;}
  };
  const timer=window.setInterval(()=>void poll(),12000);
  const online=()=>void poll();window.addEventListener('online',online);
  return()=>{cancelled=true;window.clearInterval(timer);window.removeEventListener('online',online);};
 },[checkInitiated,config.endpoint,config.token]);
 const operation=async(fn:()=>Promise<void>)=>{
  setBusy(true);
  try{await fn();}catch(error){setNotice(error instanceof Error?error.message:'Govee-Befehl fehlgeschlagen.');}
  finally{setBusy(false);}
 };
 const refresh=async()=>{
  setCheckInitiated(true);
  try{
   const [h,d]=await Promise.all([goveeBridgeRequestV909<Health>(config,'/health'),goveeBridgeRequestV909<DeviceList>(config,'/devices')]);
   setHealth(h);setDevices(d.devices);setBridgeState(h.ok?'connected':'offline');setLastRefreshedAt(Date.now());
   setNotice(h.ok?'Bridge erreichbar. Geräte können lokal gesteuert werden.':'UDP-Fehler: '+(h.udpError||'unbekannt'));
  }catch(error){setBridgeState('offline');throw error;}
 };
 const scan=async()=>{
  const result=await goveeBridgeRequestV909<DeviceList>(config,'/scan','POST');
  setDevices(result.devices);setNotice(`${result.devices.length} Gerät(e) gefunden/registriert. Falls keines angezeigt wird: LAN Control aktivieren oder die IP manuell hinzufügen.`);
 };
 const addIp=async()=>{
  if(!isGoveeLanIpV909(ip))throw Error('Bitte eine gültige private Geräte-IP eingeben (z. B. 192.168.1.50).');
  const value=ip.trim();await goveeBridgeRequestV909(config,'/devices/add','POST',{ip:value});
  const result=await goveeBridgeRequestV909<DeviceList>(config,'/devices');setDevices(result.devices);setIp('');setNotice(`${value} hinzugefügt. Aktiviere das Gerät in der Liste.`);
 };
 const readStatus=async()=>{
  if(!config.selectedIps.length)throw Error('Bitte mindestens ein Gerät auswählen.');
  const result=await Promise.all(config.selectedIps.map(async selected=>{
   await goveeBridgeRequestV909(config,'/devices/add','POST',{ip:selected});
   return goveeBridgeRequestV909<{device:GoveeDeviceV909}>(config,'/status','POST',{ip:selected});
  }));
  setDevices(previous=>previous.map(d=>result.find(r=>r.device.ip===d.ip)?.device??d));
  setNotice('Gerätestatus abgefragt (nur wenn das Gerät eine UDP-Antwort gesendet hat).');
 };
 const action=async(action:'power'|'brightness'|'color'|'temperature',value:unknown)=>{
  if(!config.selectedIps.length)throw Error('Bitte zuerst mindestens eine Govee-Leuchte auswählen.');
  // An explicit manual command takes priority: stop auto-sync until re-enabled.
  if(config.autoSync)update({autoSync:false});
  for(const selected of config.selectedIps){
   await goveeBridgeRequestV909(config,'/devices/add','POST',{ip:selected});
   await goveeBridgeRequestV909(config,'/command','POST',{ip:selected,action,value});
  }
  setNotice(`Befehl an ${config.selectedIps.length} Leuchte(n) gesendet (UDP quittiert Schaltbefehle nicht).`);
 };
 return <fieldset className="govee-v909"><legend>Govee LAN · lokale Konzertbeleuchtung</legend>
  <p>Govee-Leuchten ohne Cloud/API-Schlüssel steuern. Die lokale Bridge läuft auf demselben Gerät wie der Browser: <strong>Windows-PC oder Raspberry Pi mit Chromium</strong>. Nicht unterstützte Govee-Modelle können nicht über das offizielle LAN-Protokoll gesteuert werden.</p>
  <div className="govee-v909-grid">
   <label>Bridge-Adresse<input id="govee-v909-endpoint" type="text" spellCheck={false} value={config.endpoint} onChange={e=>setConfig(v=>({...v,endpoint:e.target.value}))} onBlur={()=>{try{update({endpoint:validBridgeUrlV909(config.endpoint)});}catch(error){setNotice(error instanceof Error?error.message:'Ungültige Adresse');}}} placeholder="http://127.0.0.1:8765"/></label>
   <label>Bridge-Token<input id="govee-v909-auth" type="password" autoComplete="off" spellCheck={false} value={config.token} onChange={e=>update({token:e.target.value})} placeholder="Token aus Terminal einfügen"/></label>
  </div>
  <p className="settings-note">Raspberry Pi V910 (bestehender Kiosk): <code>node scripts/pi/install-v910.cjs --url https://deine-app.vercel.app</code>. Der systemd-Dienst startet die Bridge und Chromium öffnet die Vercel-Seite beim Desktop-Login. Bridge-Adresse auf <code>http://127.0.0.1:8765</code> lassen. Beim ersten Verbindungstest in Chromium die Freigabe für den lokalen/Loopback-Netzwerkzugriff erteilen. Token einmalig auf dem Pi mit <code>npm run pi:token</code> anzeigen. Alternativ V971-Pi-Bridge aus <code>integrations/govee-bridge-raspberry-pi/</code> manuell starten; keine zweite Bridge bei laufendem V910-Dienst.</p>
  <div className="govee-v909-actions">
   <button id="govee-v909-connect" type="button" disabled={busy} onClick={()=>void operation(refresh)}>Verbindung prüfen</button>
   <button id="govee-v909-scan" type="button" disabled={busy} onClick={()=>void operation(scan)}>Leuchten im LAN suchen</button>
  </div>
  <p className="govee-v909-notice" role="status">{bridgeState==='connected'?'● Bridge verbunden · ':bridgeState==='offline'?'○ Bridge getrennt – automatischer Wiederverbindungsversuch · ':'○ Noch nicht verbunden · '}{notice}</p>
  {health&&bridgeState==='connected'&&<p className="settings-note">Bridge {health.version} · {health.onlineDevices??'?'} von {health.devices} Leuchten zuletzt erreichbar · Aktualisierung etwa alle 12 Sekunden nach dem ersten Verbindungstest.</p>}
  <IntegrationSetupWizardV971 config={config} bridgeState={bridgeState} bridgeHealthy={Boolean(health?.ok)}
   onlineDevices={health?.onlineDevices??0} busy={busy} onCheck={()=>void operation(refresh)} onScan={()=>void operation(scan)}/>
  <div className="govee-v909-actions"><label>IP manuell hinzufügen
   <input type="text" spellCheck={false} value={ip} onChange={e=>setIp(e.target.value)} placeholder="192.168.1.50" aria-label="Govee-Geräte-IP" /></label>
   <button type="button" disabled={busy} onClick={()=>void operation(addIp)}>Hinzufügen</button>
  </div>
  <div id="govee-v909-devices" className="govee-v909-device-list" aria-label="Govee-Geräteliste">
   {!devices.length&&<p className="settings-note">Noch keine Geräte entdeckt. Nach dem Scan kannst du jede Leuchte auswählen.</p>}
   {devices.map(d=><label key={d.ip} className="govee-v909-device">
    <input type="checkbox" checked={config.selectedIps.includes(d.ip)} onChange={e=>update({selectedIps:e.target.checked?[...config.selectedIps.filter(ip=>ip!==d.ip),d.ip]:config.selectedIps.filter(ip=>ip!==d.ip)})} />
    <span><strong>{d.name||d.sku||'Govee-Leuchte'}</strong><small>{d.ip}{d.sku?` · ${d.sku}`:''}{d.manual?' · manuell':''}{d.online===true?' · im LAN erreichbar':d.online===false?' · derzeit nicht erreichbar':''}{d.status?.on===true?' · eingeschaltet':d.status?.on===false?' · ausgeschaltet':''}{typeof d.status?.brightness==='number'?` · ${d.status.brightness}%`:''}</small></span>
   </label>)}
   {config.selectedIps.filter(ip=>!devices.some(d=>d.ip===ip)).map(missing=><label key={missing} className="govee-v909-device">
    <input type="checkbox" checked onChange={()=>update({selectedIps:config.selectedIps.filter(ip=>ip!==missing)})}/>
    <span><strong>{missing}</strong><small>Gespeichert · Bridge neu starten / erneut suchen</small></span>
   </label>)}
  </div>
  <div className="govee-v909-actions">
   <button type="button" disabled={busy||!config.selectedIps.length} onClick={()=>void operation(readStatus)}>Gerätestatus lesen</button>
   <button type="button" disabled={busy||!config.selectedIps.length} onClick={()=>void operation(()=>action('power',true))}>Lichter EIN</button>
   <button type="button" disabled={busy||!config.selectedIps.length} onClick={()=>void operation(()=>action('power',false))}>Lichter AUS</button>
  </div>
  <div className="govee-v909-grid">
   <label>Farbe<input type="color" value={rgbHex(color)} onChange={e=>setColor(e.target.value)}/></label>
   <label>Helligkeit ({config.masterBrightness} %)<input type="range" min={1} max={100} value={config.masterBrightness} onChange={e=>update({masterBrightness:Number(e.target.value)})}/></label>
  </div>
  <GoveeLightDashboardV1142/>
  <div className="govee-v909-actions"><button type="button" disabled={busy||!config.selectedIps.length} onClick={()=>void operation(()=>action('color',hexColor(color)))}>Farbe senden</button>
  <button type="button" disabled={busy||!config.selectedIps.length} onClick={()=>void operation(()=>action('brightness',config.masterBrightness))}>Helligkeit senden</button></div>
  <label>Farbtemperatur ({kelvin} K)<input type="range" min={2000} max={9000} step={100} value={kelvin} onChange={e=>setKelvin(Number(e.target.value))}/></label>
  <div className="govee-v909-actions"><button type="button" disabled={busy||!config.selectedIps.length} onClick={()=>void operation(()=>action('temperature',kelvin))}>Farbtemperatur senden</button></div>
  <h3>V911 · Concert Light Director</h3>
  <p className="settings-note">Die vier Leuchten spielen unterschiedliche Rollen. Automatisch: H6063 = Bühnenwand, H610B = Rhythmuslicht, H61A2 = Neon-Akzent, H6051 = Ambientelicht. Bei anderen Modellen wird zunächst Ambient gewählt. Du kannst jede Rolle selbst festlegen.</p>
  {config.selectedIps.length>0&&<div className="govee-v909-device-list" aria-label="Lichtrollen je Gerät">
   {config.selectedIps.map(selected=>{
    const d=devices.find(item=>item.ip===selected);
    const selection=config.deviceRolesV911[selected]??'auto';
    const role=resolveGoveeRoleV911(selection,d?.sku);
    return <label key={selected} className="govee-v909-device">{d?.name||d?.sku||selected} · {role}
     <select aria-label={`Lichtrolle für ${selected}`} value={selection} onChange={e=>update({deviceRolesV911:{...config.deviceRolesV911,[selected]:e.target.value as GoveeRoleSelectionV911}})}>
      <option value="auto">Automatisch (Modell)</option><option value="wall">Bühnenwand</option>
      <option value="rhythm">Rhythmus / Bass</option><option value="neon">Neon / Akzent</option><option value="ambient">Ambient / Ruhe</option>
     </select>
    </label>;
   })}
  </div>}
  <label id="govee-v909-director" className="setting-check"><input type="checkbox" checked={config.directorEnabledV911} onChange={e=>update({directorEnabledV911:e.target.checked})}/> V911 Lichtregie aktivieren (benötigt auch Musik-Synchronisierung)</label>
  <label>Stärke der Lichtregie ({config.directorStrengthV911} %)<input type="range" min={0} max={100} value={config.directorStrengthV911} onChange={e=>update({directorStrengthV911:Number(e.target.value)})}/></label>
  <div className="govee-v909-grid"><label>Vorschau-Songphase (nur Anzeige)
   <select value={previewPhase} onChange={e=>setPreviewPhase(e.target.value as GoveePhaseV911)}>
    <option value="ambient">Ohne bestätigte Songphase</option><option value="verse">Verse</option><option value="hook">Hook</option>
    <option value="build">Build-up</option><option value="drop">Drop</option><option value="break">Break</option>
   </select></label></div>
  {config.selectedIps.length>0&&<div className="govee-v909-device-list" aria-label="Farbvorschau ohne LAN-Befehle">
   {config.selectedIps.map(selected=>{
    const role=resolveGoveeRoleV911(config.deviceRolesV911[selected],devices.find(d=>d.ip===selected)?.sku);
    const look=planGoveeConcertLookV911({genre:String(genre??''),progressMs:8000,phase:{phase:previewPhase,previous:previewPhase,transition:1,verified:false},role,config,
     microphoneActive:false,metrics:{bass:0,beatStrength:0,energyEnvelope:.45,volume:.45}});
    return <div key={selected} className="govee-v909-device"><span>{devices.find(d=>d.ip===selected)?.sku||selected} · {role} · {look.brightness}%</span>
     <span aria-label={`Farbe ${look.color.r}, ${look.color.g}, ${look.color.b}`} style={{display:'inline-block',width:38,height:24,borderRadius:6,border:'1px solid #888',backgroundColor:`rgb(${look.color.r},${look.color.g},${look.color.b})`}}/></div>;
   })}
  </div>}
  <p className="settings-note">Automatische Verse/Hook/Drop/Build-Akzente nur mit <strong>importierten, eindeutig beschrifteten Songabschnitten (V318)</strong>. Für den aktuellen Track: {track?.id?resolveGoveePhaseV911(readTrackAnalysisV318(track.id),track.id,progressMs).verified?'bestätigte Songphase verfügbar':'keine bestätigte Songphase; Ambient-Modus':'kein Track'}. Vorschau sendet keine Befehle. Beim Pausieren, in versteckten Tabs und nach manuellen Eingriffen stoppt die automatische Steuerung. Keine Stroboskop- oder Power-Kommandos.</p>
  <GoveeRoomPerformanceDashboardV928 config={config} devices={devices} health={health} bridgeState={bridgeState} lastRefreshedAt={lastRefreshedAt} busy={busy} onRefresh={()=>void operation(refresh)}/>
  <ConcertRoadmapStudioV958 config={config} devices={devices} onConfig={update}/>
  <GoveeDeviceGroupStudioV915 config={config} devices={devices} genre={String(genre??'')} onConfig={update}/>
  <GoveeBassStudioV917 config={config}/>
  <GoveeBeatStudioV918 config={config}/>
  <GoveeSectionStudioV919 config={config}/>
  <GoveeGenreStudioV920 config={config}/>
  <GoveeConcertSyncStudioV921/>
  <GoveeShockwaveStudioV922 config={config}/>
  <GoveeNeonPulseStudioV923 config={config}/>
  <GoveeLightEnergyStudioV924 config={config}/>
  <GoveeFestivalFxStudioV925 config={config}/>
  <GoveeSpatialStudioV926 config={config} devices={devices}/>
  <GoveeRoomCalibrationStudioV927 config={config} devices={devices}/>
  <GoveeConcertSyncStudioV1027 config={config} devices={devices} onConfig={update}/>
  <GoveeRoomLightingStudioV1096 config={config} devices={devices}/>
  <GoveeSpatialWavesStudioV1097 config={config} devices={devices}/>
  <GoveeColorJourneyStudioV1098 config={config} devices={devices}/>
  <GoveeBeatAccentStudioV1099 config={config} devices={devices}/>
  <GoveeRoomZoneMixerStudioV1100 config={config} devices={devices}/>
  <GoveeSceneTransitionStudioV1101 config={config} devices={devices}/>
  <GoveeSceneZoneStudioV1102 config={config} devices={devices}/>
  <GoveeLightShowEditorV912 config={config} devices={devices} genre={String(genre??'')} onConfig={update}/>
  <h3 id="govee-v909-auto">Automatische Konzert-Beleuchtung</h3>
  <label className="setting-check"><input type="checkbox" checked={config.enabled} onChange={e=>update({enabled:e.target.checked})}/> Govee-Lichtintegration aktivieren</label>
  <label className="setting-check"><input type="checkbox" checked={config.autoSync} onChange={e=>update({autoSync:e.target.checked})}/> Farben und Helligkeit zur laufenden Musik synchronisieren</label>
  <label>Musikempfindlichkeit ({config.sensitivity} %)<input type="range" min={0} max={100} value={config.sensitivity} onChange={e=>update({sensitivity:Number(e.target.value)})}/></label>
  <p className="settings-note">Die Farben wechseln je nach Genre (Deutschrap: dunkles Rot/Violett · Hardtekk: Cyan/Magenta · Deutschrock: Orange/Rot). Mit Mikrofon reagiert die Helligkeit auf tatsächliche Bässe; ohne Mikrofon auf eine <strong>geschätzte</strong> Rhythmuskurve. Kein Stroboskop und keine automatischen Ein-/Ausschaltblitze. Beim Pausieren bleibt das Licht unverändert.</p>
 </fieldset>;
}
