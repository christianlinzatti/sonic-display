/** V1138: explicit Govee LAN power commands. No cloud or server-side hardware credentials.
 * Voice control requires a separate browser-local opt-in; manual UI buttons are independent.
 */
import {goveeBridgeRequestV909,loadGoveeConfigV909,saveGoveeConfigV909,type GoveeConfigV909} from './goveeLanV909';
import type {VoiceMessageV1008,VoiceResultV1008} from './alexaVoiceV1008';

export const GOVEE_POWER_CONSENT_KEY_V1138='sonic-display:alexa-govee-power-v1138';
export const GOVEE_POWER_CONSENT_EVENT_V1138='sonic-display:alexa-govee-power-changed-v1138';
export type GoveePowerConsentV1138={enabled:boolean;since:number};
export type GoveePowerCommandV1138='govee-power-on'|'govee-power-off';
export const isGoveePowerCommandV1138=(value:unknown):value is GoveePowerCommandV1138=>
 value==='govee-power-on'||value==='govee-power-off';
export function normalizeGoveePowerConsentV1138(value:unknown):GoveePowerConsentV1138{
 if(!value||typeof value!=='object'||Array.isArray(value))return {enabled:false,since:0};
 const raw=value as Partial<GoveePowerConsentV1138>;
 return raw.enabled===true&&Number.isSafeInteger(raw.since)&&typeof raw.since==='number'&&
 raw.since>0&&raw.since<=Date.now()?{enabled:true,since:raw.since}:{enabled:false,since:0};
}
export function loadGoveePowerConsentV1138():GoveePowerConsentV1138{
 if(typeof window==='undefined')return {enabled:false,since:0};
 try{return normalizeGoveePowerConsentV1138(JSON.parse(localStorage.getItem(GOVEE_POWER_CONSENT_KEY_V1138)||'null'));}
 catch{return {enabled:false,since:0};}
}
export function saveGoveePowerConsentV1138(enabled:boolean):GoveePowerConsentV1138{
 const value={enabled,since:enabled?Date.now():0};
 localStorage.setItem(GOVEE_POWER_CONSENT_KEY_V1138,JSON.stringify(value));
 window.dispatchEvent(new Event(GOVEE_POWER_CONSENT_EVENT_V1138));
 return value;
}
export function canExecuteGoveePowerV1138(config:GoveeConfigV909):boolean{
 return config.enabled&&Boolean(config.token.trim())&&config.selectedIps.length>0&&config.selectedIps.length<=32;
}
type SendOptions={allowed?:()=>boolean;signal?:AbortSignal};
export async function sendGoveePowerV1138(on:boolean,options:SendOptions={}):Promise<string>{
 const initial=loadGoveeConfigV909();
 if(!canExecuteGoveePowerV1138(initial))throw Error('Govee LAN aktivieren, Bridge-Token eintragen und mindestens eine Leuchte auswählen.');
 const check=()=>{
  if(options.signal?.aborted||options.allowed?.()===false)throw Error('Govee-Befehl abgebrochen: Freigabe nicht mehr gültig.');
  const current=loadGoveeConfigV909();
  if(!canExecuteGoveePowerV1138(current)||current.endpoint!==initial.endpoint||current.token!==initial.token||
   JSON.stringify(current.selectedIps)!==JSON.stringify(initial.selectedIps))
   throw Error('Govee-Konfiguration geändert. Bitte den Befehl erneut senden.');
 };
 check();
 // Explicit power commands supersede automatic music lighting. Never resume automatically.
 if(initial.autoSync)saveGoveeConfigV909({...initial,autoSync:false});
 let sent=0;
 for(const ip of initial.selectedIps){
  check();
  await goveeBridgeRequestV909(initial,'/devices/add','POST',{ip});
  check();
  await goveeBridgeRequestV909(initial,'/command','POST',{ip,action:'power',value:on});
  sent++;
 }
 return `Govee ${on?'EIN':'AUS'}: Schaltbefehl an ${sent} ausgewählte Leuchte(n) gesendet. Das LAN-Protokoll quittiert den tatsächlichen Schaltzustand nicht.`;
}
export async function executeAlexaGoveePowerV1138(message:VoiceMessageV1008,
 options:{since:number;now:()=>number;allowed:()=>boolean;signal?:AbortSignal}):Promise<VoiceResultV1008>{
 if(!isGoveePowerCommandV1138(message.command))throw Error('Unbekannter Govee-Power-Befehl.');
 const check=()=>{
  const now=options.now();
  if(!Number.isSafeInteger(message.createdAt)||options.since<=0||message.createdAt<options.since||
   message.createdAt>now||now-message.createdAt>30000||!options.allowed()||options.signal?.aborted)
   throw Error('Govee-Ein/Aus wurde nicht freigegeben oder ist abgelaufen.');
 };
 check();
 const text=await sendGoveePowerV1138(message.command==='govee-power-on',{allowed:checkAllowed,signal:options.signal});
 return {kind:'complete',text};
 function checkAllowed(){try{check();return true;}catch{return false;}}
}
