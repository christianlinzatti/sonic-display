/** V928 – read-only Govee room dashboard. No LAN, network, timers or credentials.
 * A recent UDP response is evidence of a recent sighting, NOT proof of current
 * reachability or proof that a colour/brightness command was applied.
 */
import {isGoveeLanIpV909,type GoveeConfigV909,type GoveeDeviceV909} from '@/lib/goveeLanV909';
import type {GoveeGroupLibraryV915} from '@/lib/goveeDeviceGroupsV915';
import type {GoveeRoomCalibrationV927} from '@/lib/goveeRoomCalibrationV927';
import type {GoveeSpatialSettingsV926} from '@/lib/goveeSpatialDirectorV926';
import {resolveGoveeRoleV911} from '@/lib/goveeConcertDirectorV911';

export type GoveeDashboardHealthV928={ok:boolean;udpError:string|null;devices:number;
 onlineDevices?:number;uptimeSeconds?:number;lastScanAt?:number;version:string};
export type GoveeBridgeStateV928='unchecked'|'connected'|'offline';
export type GoveePresenceV928='recent'|'not-seen'|'unregistered'|'unknown'|'bridge-offline'|'stale-snapshot';
export type GoveeDashboardFeatureV928={id:string;label:string;enabled:boolean;
 requires:'sync'|'director'|'show'|'integration';description?:string};
export type GoveeDashboardFeatureResultV928=GoveeDashboardFeatureV928&{ready:boolean;reason:string};
export type GoveeDashboardDeviceV928={ip:string;model:string;label:string;role:string;
 presence:GoveePresenceV928;lastSeenAt:number|null;lastSeenAgeSeconds:number|null;
 groupName:string|null;groupBrightnessPercent:number|null;visualDelayMs:number;
 statusRoundtripMs:number|null;spatialPosition:{x:number;y:number}|null};
export type GoveeDashboardV928={bridge:'unchecked'|'offline'|'connected'|'stale';
 snapshotAgeSeconds:number|null;selectedCount:number;recentCount:number;notRecentCount:number;
 devices:GoveeDashboardDeviceV928[];features:GoveeDashboardFeatureResultV928[];
 enabledCount:number;readyCount:number;warnings:string[];readyForSync:boolean;
 showConfigured:boolean;lastScanAt:number|null};
export type GoveeDashboardInputV928={config:GoveeConfigV909;devices:readonly GoveeDeviceV909[];
 bridgeState:GoveeBridgeStateV928;health:GoveeDashboardHealthV928|null;
 lastRefreshedAt:number;now:number;features:readonly GoveeDashboardFeatureV928[];
 groups:GoveeGroupLibraryV915;calibration:GoveeRoomCalibrationV927;
 spatial:GoveeSpatialSettingsV926;showIds:readonly string[]};
const asTime=(value:unknown,now:number):number|null=>typeof value==='number'&&Number.isFinite(value)&&value>0&&value<=now+5000?value:null;
const age=(then:number,now:number)=>Math.max(0,Math.floor((now-then)/1000));
/** Never classify an old bridge snapshot as an online device. */
export function buildGoveeDashboardV928(x:GoveeDashboardInputV928):GoveeDashboardV928{
 const now=Number.isFinite(x.now)&&x.now>0?x.now:Date.now();
 const last=asTime(x.lastRefreshedAt,now);
 const snapshotAgeSeconds=last===null?null:age(last,now);
 const bridge=x.bridgeState==='offline'?'offline':x.bridgeState!=='connected'?'unchecked':
  !x.health?.ok?'offline':snapshotAgeSeconds===null||snapshotAgeSeconds>30?'stale':'connected';
 const selected=[...new Set(x.config.selectedIps.filter(isGoveeLanIpV909))].slice(0,32);
 const devices=selected.map((ip,i):GoveeDashboardDeviceV928=>{
  const discovered=x.devices.find(d=>d.ip===ip);
  const seen=asTime(discovered?.lastSeen,now);
  const recent=seen!==null&&now-seen<=90000&&discovered?.online===true;
  const presence:GoveePresenceV928=bridge==='offline'?'bridge-offline':bridge==='stale'?'stale-snapshot':
   bridge==='unchecked'?'unknown':!discovered?'unregistered':recent?'recent':seen?'not-seen':'unknown';
  const group=x.groups.enabled?x.groups.groups.find(g=>g.members.includes(ip)):undefined;
  const fixture=x.calibration.fixtures[ip];
  return {ip,model:discovered?.sku||'Unbekannt',label:discovered?.name||discovered?.sku||`Leuchte ${i+1}`,
   role:resolveGoveeRoleV911(x.config.deviceRolesV911[ip]??'auto',discovered?.sku),
   presence,lastSeenAt:seen,lastSeenAgeSeconds:seen===null?null:age(seen,now),
   groupName:group?.name??null,groupBrightnessPercent:group?.brightnessPercent??null,
   visualDelayMs:x.calibration.enabled?fixture?.visualDelayMs??0:0,
   statusRoundtripMs:typeof fixture?.statusRoundtripMs==='number'?fixture.statusRoundtripMs:null,
   spatialPosition:x.spatial.enabled?x.spatial.positions[ip]??null:null};
 });
 const showConfigured=x.config.showEnabledV912&&x.showIds.includes(x.config.selectedShowIdV912);
 const readyForSync=bridge==='connected'&&Boolean(x.config.token.trim())&&x.config.enabled&&x.config.autoSync&&selected.length>0;
 const features=x.features.map(feature=>{
  const dependency=feature.requires==='director'?x.config.directorEnabledV911:
   feature.requires==='show'?showConfigured:true;
  const ready=feature.enabled&&readyForSync&&dependency;
  const reason=!feature.enabled?'Ausgeschaltet':!readyForSync?'Musik-Synchronisierung/Bridge nicht bereit':
   !dependency?(feature.requires==='director'?'V911-Lichtregie deaktiviert':'Keine ausgewählte gespeicherte Show'):
   'Voraussetzungen konfiguriert (Songdaten/Mikrofon gegebenenfalls erforderlich)';
  return {...feature,ready,reason};
 });
 const warnings:string[]=[];
 if(!x.config.token.trim())warnings.push('Kein Bridge-Token konfiguriert.');
 if(bridge==='unchecked')warnings.push('Bridge noch nicht geprüft.');
 if(bridge==='offline')warnings.push('Bridge nicht erreichbar oder UDP-Problem gemeldet.');
 if(bridge==='stale')warnings.push('Geräteliste veraltet: Status bitte manuell aktualisieren.');
 if(selected.length===0)warnings.push('Keine Leuchte für die Konzertsteuerung ausgewählt.');
 if(bridge==='connected'&&devices.some(d=>d.presence==='unregistered'))warnings.push('Mindestens eine ausgewählte Leuchte ist in der Bridge nicht registriert.');
 if(bridge==='connected'&&selected.length&&devices.every(d=>d.presence!=='recent'))warnings.push('Keine ausgewählte Leuchte wurde innerhalb der letzten 90 Sekunden bestätigt.');
 if(x.config.showEnabledV912&&!showConfigured)warnings.push('Aktivierte V912-Show ist nicht in der gespeicherten Bibliothek vorhanden.');
 if(x.config.enabled&&!x.config.autoSync)warnings.push('Govee-Integration aktiviert, Musik-Synchronisierung aber ausgeschaltet.');
 return {bridge,snapshotAgeSeconds,selectedCount:selected.length,
  recentCount:devices.filter(d=>d.presence==='recent').length,
  notRecentCount:devices.filter(d=>d.presence!=='recent').length,
  devices,features,enabledCount:features.filter(f=>f.enabled).length,
  readyCount:features.filter(f=>f.ready).length,warnings,readyForSync,showConfigured,
  lastScanAt:asTime(x.health?.lastScanAt,now)};
}
/** Clipboard diagnostics intentionally omit IP, bearer token, bridge endpoint, coordinates and names. */
export function createGoveeDashboardReportV928(status:GoveeDashboardV928,generatedAt:string):string{
 const output={schema:'sonic-govee-dashboard-v928',generatedAt,
  bridge:status.bridge,snapshotAgeSeconds:status.snapshotAgeSeconds,
  selectedDevices:status.selectedCount,recentlySeen:status.recentCount,
  configuredFeatures:status.enabledCount,featuresReady:status.readyCount,
  features:status.features.map(f=>({id:f.id,enabled:f.enabled,prerequisitesConfigured:f.ready})),
  devices:status.devices.map((d,index)=>({fixture:index+1,model:d.model,role:d.role,
   presence:d.presence,ageSeconds:d.lastSeenAgeSeconds,
   opticalOffsetMs:d.visualDelayMs,networkDiagnosticMs:d.statusRoundtripMs})),
  warnings:status.warnings};
 return JSON.stringify(output,null,2);
}
