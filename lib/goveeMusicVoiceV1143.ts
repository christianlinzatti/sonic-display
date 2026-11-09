/** V1143: voice control for the locally stored Govee music-sync switch.
 * Neither Spotify playback nor the physical power state is changed.
 */
import {loadGoveeConfigV909,saveGoveeConfigV909} from './goveeLanV909';
import {canExecuteGoveePowerV1138,isGoveePowerCommandV1138} from './goveePowerV1138';
import type {VoiceMessageV1008,VoiceResultV1008} from './alexaVoiceV1008';
export const GOVEE_SYNC_CONSENT_KEY_V1143='sonic-display:alexa-govee-sync-v1143';
export const GOVEE_SYNC_CONSENT_EVENT_V1143='sonic-display:alexa-govee-sync-changed-v1143';
export type GoveeSyncConsentV1143={enabled:boolean;since:number};
export type GoveeMusicVoiceCommandV1143='govee-sync-start'|'govee-sync-pause';
export const isGoveeMusicVoiceCommandV1143=(v:unknown):v is GoveeMusicVoiceCommandV1143=>
 v==='govee-sync-start'||v==='govee-sync-pause';
export const isGoveeOnlyVoiceCommandV1143=(v:unknown):boolean=>
 isGoveePowerCommandV1138(v)||isGoveeMusicVoiceCommandV1143(v);
export function loadGoveeSyncConsentV1143():GoveeSyncConsentV1143{
 if(typeof window==='undefined')return {enabled:false,since:0};
 try{const raw:unknown=JSON.parse(localStorage.getItem(GOVEE_SYNC_CONSENT_KEY_V1143)||'null');
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {enabled:false,since:0};
  const x=raw as Partial<GoveeSyncConsentV1143>;
  return x.enabled===true&&typeof x.since==='number'&&Number.isSafeInteger(x.since)&&x.since>0&&x.since<=Date.now()?{enabled:true,since:x.since}:{enabled:false,since:0};
 }catch{return {enabled:false,since:0};}
}
export function saveGoveeSyncConsentV1143(enabled:boolean):GoveeSyncConsentV1143{
 const value={enabled,since:enabled?Date.now():0};
 localStorage.setItem(GOVEE_SYNC_CONSENT_KEY_V1143,JSON.stringify(value));
 window.dispatchEvent(new Event(GOVEE_SYNC_CONSENT_EVENT_V1143));
 return value;
}
export function setGoveeMusicSyncV1143(enabled:boolean,options:{allowed?:()=>boolean;signal?:AbortSignal}={}):string{
 const check=()=>{if(options.signal?.aborted||options.allowed?.()===false)throw Error('Govee-Musikmodus nicht mehr freigegeben.');};
 check();const initial=loadGoveeConfigV909();
 if(enabled&&!canExecuteGoveePowerV1138(initial))throw Error('Govee LAN aktivieren, Bridge-Token eintragen und Leuchten auswählen.');
 if(initial.autoSync===enabled)return enabled?'Govee-Musikautomatik ist bereits aktiv.':'Govee-Musikautomatik ist bereits pausiert.';
 check();
 const current=loadGoveeConfigV909();
 if(JSON.stringify(current)!==JSON.stringify(initial))throw Error('Govee-Konfiguration geändert. Bitte erneut versuchen.');
 saveGoveeConfigV909({...initial,autoSync:enabled});
 return enabled?'Govee-Musikautomatik aktiviert. Sie läuft nur bei aktiver Musik und geöffnetem Display; keine Lampe wurde eingeschaltet.':'Govee-Musikautomatik pausiert. Die Leuchten behalten ihren Zustand.';
}
export function executeAlexaGoveeMusicSyncV1143(message:VoiceMessageV1008,options:{since:number;now:()=>number;allowed:()=>boolean;signal?:AbortSignal}):VoiceResultV1008{
 if(!isGoveeMusicVoiceCommandV1143(message.command))throw Error('Unbekannter Govee-Musikbefehl.');
 const check=()=>{const now=options.now();if(!Number.isSafeInteger(message.createdAt)||options.since<=0||message.createdAt<options.since||message.createdAt>now||now-message.createdAt>30000||!options.allowed()||options.signal?.aborted)throw Error('Govee-Musikbefehl abgelaufen oder widerrufen.');};
 check();
 const text=setGoveeMusicSyncV1143(message.command==='govee-sync-start',{allowed:()=>{try{check();return true;}catch{return false;}},signal:options.signal});
 return {kind:'complete',text};
}
