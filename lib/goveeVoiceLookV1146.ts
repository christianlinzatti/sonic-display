/** V1146: explicitly authorized, bounded Govee brightness and color voice controls.
 * Uses only the existing local LAN bridge and currently selected devices.
 */
import {loadGoveeConfigV909,saveGoveeConfigV909,goveeBridgeRequestV909,type GoveeColorV909} from './goveeLanV909';
import {canExecuteGoveePowerV1138} from './goveePowerV1138';
import type {VoiceMessageV1008,VoiceResultV1008} from './alexaVoiceV1008';

export const GOVEE_LOOK_CONSENT_KEY_V1146='sonic-display:alexa-govee-look-v1146';
export const GOVEE_LOOK_CONSENT_EVENT_V1146='sonic-display:alexa-govee-look-changed-v1146';
export type GoveeLookConsentV1146={enabled:boolean;since:number};
export type GoveeVoiceColorV1146='red'|'blue'|'green'|'violet'|'cyan'|'amber'|'white'|'warmwhite';
export type GoveeVoiceLookV1146={brightness:number}|{color:GoveeVoiceColorV1146};
export type GoveeVoiceLookCommandV1146='govee-brightness'|'govee-color';
const COLORS:Readonly<Record<GoveeVoiceColorV1146,GoveeColorV909>>={
 red:{r:255,g:20,b:32},blue:{r:15,g:90,b:255},green:{r:20,g:210,b:80},
 violet:{r:170,g:35,b:235},cyan:{r:0,g:195,b:230},amber:{r:255,g:135,b:25},
 white:{r:255,g:255,b:255},warmwhite:{r:255,g:190,b:115}
};
const LABELS:Record<GoveeVoiceColorV1146,string>={
 red:'Rot',blue:'Blau',green:'Grün',violet:'Violett',cyan:'Türkis',amber:'Orange',white:'Weiß',warmwhite:'Warmweiß'};
export const isGoveeVoiceLookCommandV1146=(value:unknown):value is GoveeVoiceLookCommandV1146=>
 value==='govee-brightness'||value==='govee-color';
export function validGoveeVoiceLookV1146(command:unknown,value:unknown):value is GoveeVoiceLookV1146{
 if(!isGoveeVoiceLookCommandV1146(command)||!value||typeof value!=='object'||Array.isArray(value))return false;
 const obj=value as Record<string,unknown>,keys=Object.keys(obj);
 if(keys.length!==1)return false;
 if(command==='govee-brightness')
  return keys[0]==='brightness'&&typeof obj.brightness==='number'&&Number.isSafeInteger(obj.brightness)&&obj.brightness>=1&&obj.brightness<=100;
 return keys[0]==='color'&&typeof obj.color==='string'&&Object.prototype.hasOwnProperty.call(COLORS,obj.color);
}
export function loadGoveeLookConsentV1146():GoveeLookConsentV1146{
 if(typeof window==='undefined')return {enabled:false,since:0};
 try{const value:unknown=JSON.parse(localStorage.getItem(GOVEE_LOOK_CONSENT_KEY_V1146)||'null');
  if(!value||typeof value!=='object'||Array.isArray(value))return {enabled:false,since:0};
  const obj=value as Partial<GoveeLookConsentV1146>;
  return obj.enabled===true&&typeof obj.since==='number'&&Number.isSafeInteger(obj.since)&&obj.since>0&&obj.since<=Date.now()
   ?{enabled:true,since:obj.since}:{enabled:false,since:0};
 }catch{return {enabled:false,since:0};}
}
export function saveGoveeLookConsentV1146(enabled:boolean):GoveeLookConsentV1146{
 const value={enabled,since:enabled?Date.now():0};
 localStorage.setItem(GOVEE_LOOK_CONSENT_KEY_V1146,JSON.stringify(value));
 window.dispatchEvent(new Event(GOVEE_LOOK_CONSENT_EVENT_V1146));
 return value;
}
export async function sendGoveeVoiceLookV1146(command:GoveeVoiceLookCommandV1146,value:GoveeVoiceLookV1146,
 options:{allowed?:()=>boolean;signal?:AbortSignal}={}):Promise<string>{
 if(!validGoveeVoiceLookV1146(command,value))throw Error('Ungültige Govee-Farbe oder Helligkeit. Erlaubt sind 1 bis 100 Prozent und festgelegte Farben.');
 const initial=loadGoveeConfigV909();
 if(!canExecuteGoveePowerV1138(initial))throw Error('Govee LAN aktivieren, Bridge-Token eintragen und mindestens eine Lampe auswählen.');
 const selected=[...initial.selectedIps];if(selected.length>32)throw Error('Zu viele ausgewählte Govee-Geräte.');
 const check=()=>{
  if(options.signal?.aborted||options.allowed?.()===false)throw Error('Govee-Lichtbefehl abgebrochen oder Freigabe widerrufen.');
  const now=loadGoveeConfigV909();
  if(!canExecuteGoveePowerV1138(now)||now.endpoint!==initial.endpoint||now.token!==initial.token||
   JSON.stringify(now.selectedIps)!==JSON.stringify(selected))throw Error('Govee-Auswahl geändert. Bitte erneut versuchen.');
 };
 check();
 // Manual voice settings own the LEDs until Music-Sync is explicitly restarted.
 if(initial.autoSync)saveGoveeConfigV909({...initial,autoSync:false});
 const setting=command==='govee-brightness'?(value as {brightness:number}).brightness:(value as {color:GoveeVoiceColorV1146}).color;
 let sent=0;
 for(const ip of selected){
  check();
  await goveeBridgeRequestV909(initial,'/devices/add','POST',{ip});
  check();
  await goveeBridgeRequestV909(initial,'/command','POST',{
   ip,action:command==='govee-brightness'?'brightness':'color',
   value:command==='govee-brightness'?setting:COLORS[setting as GoveeVoiceColorV1146]
  });
  sent++;
 }
 // Persist brightness only once all selected requests were accepted by the bridge.
 // The LAN hardware itself still has NOT acknowledged the setting.
 if(command==='govee-brightness'){
  check();const latest=loadGoveeConfigV909();
  saveGoveeConfigV909({...latest,masterBrightness:setting as number});
 }
 const desc=command==='govee-brightness'?String(setting)+' Prozent':LABELS[setting as GoveeVoiceColorV1146];
 return `Govee ${desc}: Befehl an ${sent} ausgewählte Leuchte(n) gesendet. Gerätebestätigung separat prüfen. Musik-Sync bleibt pausiert.`;
}
export async function executeAlexaGoveeVoiceLookV1146(message:VoiceMessageV1008,options:{
 since:number;now:()=>number;allowed:()=>boolean;signal?:AbortSignal;
}):Promise<VoiceResultV1008>{
 if(!isGoveeVoiceLookCommandV1146(message.command)||!validGoveeVoiceLookV1146(message.command,message.goveeLook))
  throw Error('Ungültiger Govee-Lichtbefehl.');
 const check=()=>{
  const now=options.now();
  if(!Number.isSafeInteger(message.createdAt)||options.since<=0||message.createdAt<options.since||
   message.createdAt>now||now-message.createdAt>30000||!options.allowed()||options.signal?.aborted)
    throw Error('Govee-Lichtbefehl ist abgelaufen oder wurde widerrufen.');
 };
 check();
 const text=await sendGoveeVoiceLookV1146(message.command,message.goveeLook,{
  signal:options.signal,allowed:()=>{try{check();return true;}catch{return false;}}
 });
 return {kind:'complete',text};
}
