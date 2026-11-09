/** V1141: selected device or opt-in group power via the existing protected LAN bridge. */
import {loadGoveeConfigV909,saveGoveeConfigV909,goveeBridgeRequestV909} from './goveeLanV909';
import {loadGoveeGroupsV915} from './goveeDeviceGroupsV915';
import {canExecuteGoveePowerV1138,isGoveePowerCommandV1138} from './goveePowerV1138';
import {validGoveeVoiceTargetV1141,resolveGoveeVoiceIpsV1141,type GoveeVoiceTargetV1141} from './goveeVoiceTargetV1141';
import type {VoiceMessageV1008,VoiceResultV1008} from './alexaVoiceV1008';
type Guard={allowed?:()=>boolean;signal?:AbortSignal};
export async function sendTargetedGoveePowerV1141(on:boolean,target:GoveeVoiceTargetV1141,options:Guard={}):Promise<string>{
 const config=loadGoveeConfigV909(),groupData=loadGoveeGroupsV915();
 if(!canExecuteGoveePowerV1138(config)||!validGoveeVoiceTargetV1141(target))
  throw Error('Govee LAN konfigurieren oder gültiges Lampenziel auswählen.');
 const ips=resolveGoveeVoiceIpsV1141(target,config.selectedIps,config.deviceRolesV911,groupData);
 if(!ips.length)throw Error('Für dieses Ziel ist keine ausgewählte Govee-Leuchte eingerichtet.');
 const check=()=>{
  if(options.signal?.aborted||options.allowed?.()===false)throw Error('Govee-Befehl abgebrochen.');
  const current=loadGoveeConfigV909(),groups=loadGoveeGroupsV915();
  if(!canExecuteGoveePowerV1138(current)||current.endpoint!==config.endpoint||current.token!==config.token||
   JSON.stringify(current.selectedIps)!==JSON.stringify(config.selectedIps)||
   JSON.stringify(resolveGoveeVoiceIpsV1141(target,current.selectedIps,current.deviceRolesV911,groups))!==JSON.stringify(ips))
   throw Error('Govee-Ziel oder Konfiguration wurde verändert. Bitte erneut versuchen.');
 };
 check();
 if(config.autoSync)saveGoveeConfigV909({...config,autoSync:false});
 let sent=0;
 for(const ip of ips){
  check();
  await goveeBridgeRequestV909(config,'/devices/add','POST',{ip});
  check();
  await goveeBridgeRequestV909(config,'/command','POST',{ip,action:'power',value:on});
  sent++;
 }
 return `Govee ${on?'EIN':'AUS'}: Schaltbefehl an ${sent} gezielte Leuchte(n) gesendet. Gerätebestätigung separat prüfen.`;
}
export async function executeAlexaGoveePowerV1141(message:VoiceMessageV1008,
 options:{since:number;now:()=>number;allowed:()=>boolean;signal?:AbortSignal}):Promise<VoiceResultV1008>{
 if(!isGoveePowerCommandV1138(message.command)||!validGoveeVoiceTargetV1141(message.goveeTarget))
  throw Error('Ungültiges Govee-Sprachziel.');
 const check=()=>{
  const now=options.now();
  if(!Number.isSafeInteger(message.createdAt)||options.since<=0||message.createdAt<options.since||
   message.createdAt>now||now-message.createdAt>30000||!options.allowed()||options.signal?.aborted)
   throw Error('Govee-Sprachbefehl abgelaufen oder widerrufen.');
 };
 check();
 const text=await sendTargetedGoveePowerV1141(message.command==='govee-power-on',message.goveeTarget,
  {allowed:()=>{try{check();return true;}catch{return false;}},signal:options.signal});
 return {kind:'complete',text};
}
