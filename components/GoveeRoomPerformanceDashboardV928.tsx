'use client';
import {useEffect,useMemo,useState} from 'react';
import {type GoveeConfigV909,type GoveeDeviceV909} from '@/lib/goveeLanV909';
import {loadGoveeGroupsV915,GOVEE_GROUPS_EVENT_V915} from '@/lib/goveeDeviceGroupsV915';
import {loadGoveeShowsV912,GOVEE_SHOWS_EVENT_V912} from '@/lib/goveeLightShowV912';
import {loadGoveeBassV917,GOVEE_BASS_EVENT_V917} from '@/lib/goveeBassReactiveV917';
import {loadGoveeBeatV918,GOVEE_BEAT_EVENT_V918} from '@/lib/goveeBeatPredictionV918';
import {loadGoveeSectionV919,GOVEE_SECTION_EVENT_V919} from '@/lib/goveeSectionDirectorV919';
import {loadGoveeGenreV920,GOVEE_GENRE_EVENT_V920} from '@/lib/goveeGenreLightV920';
import {loadGoveeCinematicV921,GOVEE_CINEMATIC_EVENT_V921} from '@/lib/goveeConcertSyncV921';
import {loadGoveeShockwaveV922,GOVEE_SHOCKWAVE_EVENT_V922} from '@/lib/goveeShockwaveV922';
import {loadGoveeNeonV923,GOVEE_NEON_EVENT_V923} from '@/lib/goveeNeonPulseV923';
import {loadGoveeEnergyV924,GOVEE_ENERGY_EVENT_V924} from '@/lib/goveeLightEnergyV924';
import {loadGoveeFestivalV925,GOVEE_FESTIVAL_EVENT_V925} from '@/lib/goveeFestivalFxV925';
import {loadGoveeSpatialV926,GOVEE_SPATIAL_EVENT_V926} from '@/lib/goveeSpatialDirectorV926';
import {loadGoveeCalibrationV927,GOVEE_CALIBRATION_EVENT_V927} from '@/lib/goveeRoomCalibrationV927';
import {GoveeTroubleshootingAssistantV929} from '@/components/GoveeTroubleshootingAssistantV929';
import {buildGoveeTroubleshootingV929} from '@/lib/goveeTroubleshootingV929';
import {buildGoveeDashboardV928,createGoveeDashboardReportV928,
 type GoveeDashboardHealthV928,type GoveeBridgeStateV928,type GoveeDashboardFeatureV928} from '@/lib/goveeRoomDashboardV928';

const events=[GOVEE_GROUPS_EVENT_V915,GOVEE_SHOWS_EVENT_V912,GOVEE_BASS_EVENT_V917,
 GOVEE_BEAT_EVENT_V918,GOVEE_SECTION_EVENT_V919,GOVEE_GENRE_EVENT_V920,
 GOVEE_CINEMATIC_EVENT_V921,GOVEE_SHOCKWAVE_EVENT_V922,GOVEE_NEON_EVENT_V923,
 GOVEE_ENERGY_EVENT_V924,GOVEE_FESTIVAL_EVENT_V925,GOVEE_SPATIAL_EVENT_V926,GOVEE_CALIBRATION_EVENT_V927];
function localSettings(){
 return {groups:loadGoveeGroupsV915(),shows:loadGoveeShowsV912(),
  bass:loadGoveeBassV917(),beat:loadGoveeBeatV918(),section:loadGoveeSectionV919(),
  genre:loadGoveeGenreV920(),cinematic:loadGoveeCinematicV921(),shock:loadGoveeShockwaveV922(),
  neon:loadGoveeNeonV923(),energy:loadGoveeEnergyV924(),festival:loadGoveeFestivalV925(),
  spatial:loadGoveeSpatialV926(),calibration:loadGoveeCalibrationV927()};
}
const feature=(id:string,label:string,enabled:boolean,requires:GoveeDashboardFeatureV928['requires']):GoveeDashboardFeatureV928=>({id,label,enabled,requires});
const fmtDate=(value:number|null)=>value===null?'–':new Date(value).toLocaleString('de-AT');
const presenceLabel={recent:'Kürzlich im LAN gesehen','not-seen':'Seit mehr als 90 s nicht bestätigt',
 unregistered:'Nicht in der Bridge registriert',unknown:'Keine bestätigte UDP-Antwort',
 'bridge-offline':'Bridge getrennt','stale-snapshot':'Statusdaten veraltet'} as const;
const bridgeLabel={unchecked:'Nicht geprüft',connected:'Bridge verbunden',offline:'Bridge nicht erreichbar',stale:'Status veraltet'} as const;
/** Diagnostic-only UI, no power/color sends and no extra network polling. */
export function GoveeRoomPerformanceDashboardV928({config,devices,health,bridgeState,lastRefreshedAt,busy,onRefresh}:{
 config:GoveeConfigV909;devices:GoveeDeviceV909[];health:GoveeDashboardHealthV928|null;
 bridgeState:GoveeBridgeStateV928;lastRefreshedAt:number;busy:boolean;onRefresh:()=>void;
}){
 const [local,setLocal]=useState<ReturnType<typeof localSettings>|null>(null);
 const [notice,setNotice]=useState('');
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{
  const read=()=>setLocal(localSettings());
  const storage=()=>read();
  read();events.forEach(event=>window.addEventListener(event,read));
  window.addEventListener('storage',storage);
  return()=>{events.forEach(event=>window.removeEventListener(event,read));window.removeEventListener('storage',storage);};
 },[]);
 const snapshot=useMemo(()=>{
  if(!local)return null;
  const features:GoveeDashboardFeatureV928[]=[
   feature('v911','Concert Light Director',config.directorEnabledV911,'sync'),
   feature('v912','Light Show Editor',config.showEnabledV912,'show'),
   feature('v915','Gerätegruppen',local.groups.enabled,'integration'),
   feature('v917','Bass Reactive',local.bass.enabled,'sync'),
   feature('v918','Beat Prediction',local.beat.enabled,'sync'),
   feature('v919','Verse/Hook/Drop',local.section.enabled,'director'),
   feature('v920','Genre-Lichtregie',local.genre.enabled,'director'),
   feature('v921','Cinematic Sync',local.cinematic.enabled,'sync'),
   feature('v922','Bass Shockwave',local.shock.enabled,'sync'),
   feature('v923','Neon Pulse',local.neon.enabled,'sync'),
   feature('v924','Light Energy Director',local.energy.enabled,'director'),
   feature('v925','Festival FX',local.festival.enabled,'sync'),
   feature('v926','Spatial Light Director',local.spatial.enabled,'sync'),
   feature('v927','Raumkalibrierung',local.calibration.enabled,'integration'),
  ];
  return buildGoveeDashboardV928({config,devices,health,bridgeState,lastRefreshedAt,now:Date.now(),features,
   groups:local.groups,calibration:local.calibration,spatial:local.spatial,showIds:local.shows.map(show=>show.id)});
 },[config,devices,health,bridgeState,lastRefreshedAt,local]);
 const troubleshooting=useMemo(()=>snapshot?buildGoveeTroubleshootingV929({dashboard:snapshot,config,health}):null,[snapshot,config,health]);
 const copyReport=async()=>{
  if(!snapshot)return;
  try{await navigator.clipboard.writeText(createGoveeDashboardReportV928(snapshot,new Date().toISOString()));
   setNotice('Diagnosebericht ohne Token, Bridge-Adresse, IPs und Gerätenamen kopiert.');}
  catch{setNotice('Kopieren nicht möglich: Bitte Clipboard-Berechtigung für die Seite prüfen.');}
 };
 return <section className="govee-v928" aria-label="V928 Room Light Performance Dashboard">
  <h3>V928 · Room Light Performance Dashboard</h3>
  <p className="settings-note">Zentrale Diagnose für deine Govee-Konzertbeleuchtung. „Kürzlich gesehen“ bedeutet nur eine empfangene UDP-Antwort innerhalb von 90 Sekunden – <strong>keine Garantie für aktuelle Erreichbarkeit oder einen sichtbar ausgeführten Lichtbefehl</strong>.</p>
  {!snapshot?<p className="settings-note">Lese lokal gespeicherte Einstellungen …</p>:<>
   <div className="govee-v928-summary" aria-label="Govee-Systemübersicht">
    <div><strong>{bridgeLabel[snapshot.bridge]}</strong><small>Bridge · {snapshot.snapshotAgeSeconds===null?'noch kein vollständiger Abruf':`letzte Abfrage vor ${snapshot.snapshotAgeSeconds} s`}</small></div>
    <div><strong>{snapshot.recentCount} / {snapshot.selectedCount}</strong><small>Ausgewählte Leuchten kürzlich gesehen</small></div>
    <div><strong>{snapshot.enabledCount} / {snapshot.features.length}</strong><small>Lichtfunktionen eingeschaltet</small></div>
    <div><strong>{snapshot.readyCount}</strong><small>Funktionen mit konfigurierten Voraussetzungen</small></div>
   </div>
   <div className="govee-v909-actions">
    <button type="button" onClick={onRefresh} disabled={busy}>Bridge und Geräte jetzt aktualisieren</button>
    <button type="button" onClick={()=>void copyReport()}>Diagnosebericht kopieren (ohne sensible Daten)</button>
   </div>
   {notice&&<p className="settings-note" role="status">{notice}</p>}
   <p className="settings-note">Bridge-Version: {health?.version||'unbekannt'} · Letzte Suche: {fmtDate(snapshot.lastScanAt)} · Musik-Synchronisierung: <strong>{config.enabled&&config.autoSync?'eingeschaltet':'ausgeschaltet'}</strong>. Eingeschaltet bedeutet nicht, dass gerade Musik läuft oder Licht gesendet wird.</p>
   {snapshot.warnings.length>0&&<div className="govee-v928-warnings" role="status"><strong>Prüfhinweise</strong><ul>{snapshot.warnings.map(warning=><li key={warning}>{warning}</li>)}</ul></div>}
   {troubleshooting&&<GoveeTroubleshootingAssistantV929 result={troubleshooting}/>}
   <h4>Gerätestatus und Kalibrierung</h4>
   {!snapshot.devices.length?<p className="settings-note">Noch keine Leuchte ausgewählt. Geräte können oberhalb gesucht und ausgewählt werden.</p>:
    <div className="govee-v928-devices">{snapshot.devices.map(d=><div key={d.ip} className="govee-v928-device">
     <strong>{d.label}</strong><small>{d.model} · {d.ip} · Rolle: {d.role}</small>
     <span className={`govee-v928-state ${d.presence==='recent'?'recent':''}`}>{presenceLabel[d.presence]}</span>
     <small>Letzte bestätigte Antwort: {fmtDate(d.lastSeenAt)}{d.lastSeenAgeSeconds!==null?` (vor ${d.lastSeenAgeSeconds} s)`:''}</small>
     <small>Gruppe: {d.groupName??'keine'}{d.groupBrightnessPercent!==null?` · ${d.groupBrightnessPercent}%`:''}</small>
     <small>Optischer Zeitversatz: {d.visualDelayMs} ms{local?.calibration.enabled?' (V927 aktiv)':' (V927 aus)'}</small>
     <small>Netzwerk-Statusdiagnose: {d.statusRoundtripMs===null?'noch nicht gemessen':`${d.statusRoundtripMs} ms (keine LED-Latenz)`}</small>
     {d.spatialPosition&&<small>Raumposition: X {Math.round(d.spatialPosition.x*100)}% · Y {Math.round(d.spatialPosition.y*100)}%</small>}
    </div>)}</div>}
   <button type="button" className="govee-v928-details-toggle" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>{expanded?'Lichtmodule ausblenden':'Alle Lichtmodule und Voraussetzungen anzeigen'}</button>
   {expanded&&<div className="govee-v928-features">{snapshot.features.map(f=><div key={f.id} className="govee-v928-feature">
    <strong>{f.id.toUpperCase()} · {f.label}</strong>
    <span>{f.enabled?(f.ready?'Eingeschaltet · Voraussetzungen konfiguriert':'Eingeschaltet · noch nicht bereit'):'Ausgeschaltet'}</span>
    <small>{f.reason}</small>
   </div>)}</div>}
   <p className="settings-note">Die Statuskarte nutzt ausschließlich die bereits vorhandenen <code>/health</code>- und <code>/devices</code>-Antworten. Neue Netzwerkabfragen erfolgen nur über „Bridge und Geräte jetzt aktualisieren“ beziehungsweise den bestehenden 12-Sekunden-Verbindungspoll. Kein automatisches Schalten, kein Mikrofonstart, keine Tokenausgabe.</p>
  </>}
 </section>;
}
