/** V970 – voice-controlled, opt-in Govee room looks (not power commands).
 * Alexa's signed relay is transport only. A fresh, per-display local consent
 * and the *existing* configured Govee auto-sync are both required.
 * The effects are evaluated in the existing per-fixture send loop. No timers,
 * bridge calls, hardware power, microphones or Spotify commands live here.
 */
import type {GoveeConfigV909,GoveeLookV909,GoveeColorV909} from './goveeLanV909';
import {isAlexaConcertCommandV969,canApplyAlexaCommandV969,
 type AlexaConcertCommandV969} from './alexaConcertV969';

export const ALEXA_GOVEE_COMMANDS_V970=[
 'govee-arena','govee-festival','govee-club','govee-calm','govee-dim','govee-auto'
] as const;
export type AlexaGoveeCommandV970=(typeof ALEXA_GOVEE_COMMANDS_V970)[number];
export type AlexaCommandV970=AlexaConcertCommandV969|AlexaGoveeCommandV970;
export type AlexaQueuedCommandV970=Readonly<{id:string;command:AlexaCommandV970;createdAt:number}>;
export type AlexaGoveeConsentV970=Readonly<{enabled:boolean;since:number}>;
export type AlexaGoveeCueV970=Readonly<{command:AlexaGoveeCommandV970;receivedAt:number}>;
export const ALEXA_GOVEE_CONSENT_KEY_V970='sonic-display:alexa-govee-consent-v970';
export const ALEXA_GOVEE_CONSENT_EVENT_V970='sonic-display:alexa-govee-consent-changed-v970';
export const ALEXA_GOVEE_CUE_EVENT_V970='sonic-display:alexa-govee-look-v970';
export const ALEXA_GOVEE_RESET_EVENT_V970='sonic-display:alexa-govee-reset-v970';
export const ALEXA_GOVEE_CUE_TTL_MS_V970=180000;
export const ALEXA_GOVEE_MESSAGES_V970:Readonly<Record<AlexaGoveeCommandV970,string>>={
 'govee-arena':'Govee Arena-Raumlicht', 'govee-festival':'Govee Festival-Raumlicht',
 'govee-club':'Govee Club-Raumlicht', 'govee-calm':'Govee ruhiges Raumlicht',
 'govee-dim':'Govee gedämpftes Raumlicht','govee-auto':'Govee-Musikautomatik ohne Alexa-Look'
};
export function isAlexaGoveeCommandV970(raw:unknown):raw is AlexaGoveeCommandV970{
 return typeof raw==='string'&&(ALEXA_GOVEE_COMMANDS_V970 as readonly string[]).includes(raw);
}
export function isAlexaCommandV970(raw:unknown):raw is AlexaCommandV970{
 return isAlexaConcertCommandV969(raw)||isAlexaGoveeCommandV970(raw);
}
export function canApplyAlexaCommandV970(raw:unknown,enabledSince:number,now:number):raw is AlexaQueuedCommandV970{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
 const input=raw as Partial<AlexaQueuedCommandV970>;
 if(isAlexaConcertCommandV969(input.command))return canApplyAlexaCommandV969(raw,enabledSince,now);
 return typeof input.id==='string'&&/^[\da-f-]{36}$/i.test(input.id)&&
  isAlexaGoveeCommandV970(input.command)&&Number.isSafeInteger(enabledSince)&&
  Number.isSafeInteger(now)&&typeof input.createdAt==='number'&&Number.isSafeInteger(input.createdAt)&&
  input.createdAt>=enabledSince-1000&&input.createdAt<=now+5000&&now-input.createdAt<=75000;
}
/** A browser-local permission is never inferred from ordinary Alexa or Govee settings. */
export function normalizeAlexaGoveeConsentV970(raw:unknown):AlexaGoveeConsentV970{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {enabled:false,since:0};
 const data=raw as Partial<AlexaGoveeConsentV970>;
 return data.enabled===true&&Number.isSafeInteger(data.since)&&
  typeof data.since==='number'&&data.since>0&&data.since<=Date.now()+5000?
   {enabled:true,since:data.since}:{enabled:false,since:0};
}
export function loadAlexaGoveeConsentV970():AlexaGoveeConsentV970{
 if(typeof window==='undefined')return {enabled:false,since:0};
 try{return normalizeAlexaGoveeConsentV970(JSON.parse(localStorage.getItem(ALEXA_GOVEE_CONSENT_KEY_V970)||'null'));}
 catch{return {enabled:false,since:0};}
}
export function saveAlexaGoveeConsentV970(enabled:boolean):AlexaGoveeConsentV970{
 const next:AlexaGoveeConsentV970={enabled,since:enabled?Date.now():0};
 localStorage.setItem(ALEXA_GOVEE_CONSENT_KEY_V970,JSON.stringify(next));
 window.dispatchEvent(new Event(ALEXA_GOVEE_CONSENT_EVENT_V970));
 return next;
}
/** No voice action can enable an inactive Govee integration or change its IPs. */
export function mayAcceptAlexaGoveeV970(command:AlexaGoveeCommandV970,consent:AlexaGoveeConsentV970,
 config:GoveeConfigV909,alexaEnabled:boolean,alexaEnabledSince:number,createdAt:number):boolean{
 return isAlexaGoveeCommandV970(command)&&alexaEnabled&&consent.enabled&&
  Number.isSafeInteger(alexaEnabledSince)&&alexaEnabledSince>0&&
  Number.isSafeInteger(createdAt)&&createdAt>=Math.max(consent.since,alexaEnabledSince)&&
  config.enabled&&config.autoSync&&config.token.trim().length>0&&config.selectedIps.length>0;
}
const PALETTE:Readonly<Record<Exclude<AlexaGoveeCommandV970,'govee-auto'|'govee-dim'>,GoveeColorV909>>={
 'govee-arena':{r:218,g:95,b:38},'govee-festival':{r:162,g:45,b:211},
 'govee-club':{r:43,g:86,b:202},'govee-calm':{r:106,g:62,b:118}
};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
const step=(from:number,to:number,maxDelta:number)=>Math.round(clamp(to,from-maxDelta,from+maxDelta));
/** Pure bounded color overlay. Existing group brightness/master caps and V961
 * governor remain authoritative; never raise brightness or flash/strobe. */
export function applyAlexaGoveeLookV970(base:GoveeLookV909,previous:GoveeLookV909|undefined,
 cue:AlexaGoveeCueV970|null,config:GoveeConfigV909,
 options:{consent:AlexaGoveeConsentV970;playing:boolean;visible:boolean;
  savedShowActive:boolean;authoredStageActive:boolean;recovering:boolean;now:number}):GoveeLookV909{
 if(!cue||!isAlexaGoveeCommandV970(cue.command)||!config.enabled||!config.autoSync||
  !config.token||config.selectedIps.length===0||!options.consent.enabled||
  cue.receivedAt<options.consent.since||!options.playing||!options.visible||
  options.savedShowActive||options.authoredStageActive||options.recovering||
  !Number.isSafeInteger(cue.receivedAt)||!Number.isSafeInteger(options.now)||
  cue.receivedAt>options.now||options.now-cue.receivedAt>ALEXA_GOVEE_CUE_TTL_MS_V970||
  cue.command==='govee-auto')return base;
 const target=cue.command==='govee-dim'?null:PALETTE[cue.command];
 const color=target?{
  r:Math.round(base.color.r*.35+target.r*.65),
  g:Math.round(base.color.g*.35+target.g*.65),
  b:Math.round(base.color.b*.35+target.b*.65)
 }:base.color;
 const cap=Math.min(base.brightness,config.masterBrightness);
 const brightness=cue.command==='govee-dim'?Math.round(clamp(cap*.65,20,cap)):
  cue.command==='govee-calm'?Math.round(Math.min(cap,42)):Math.round(cap);
 return {color:{
  r:step(previous?.color.r??base.color.r,color.r,28),
  g:step(previous?.color.g??base.color.g,color.g,28),
  b:step(previous?.color.b??base.color.b,color.b,28)
 },brightness:Math.min(cap,step(previous?.brightness??base.brightness,brightness,8))};
}
