/** V967: Pure Alexa-to-virtual-concert policy. No audio, Spotify or hardware actions. */
import type {ConcertSettingsV958} from './ultimateConcertRoadmapV958';

export const ALEXA_CONCERT_COMMANDS_V967=['arena','festival','club','calm','stop','fx-on','fx-off'] as const;
export type AlexaConcertCommandV967=(typeof ALEXA_CONCERT_COMMANDS_V967)[number];
export type AlexaQueuedCommandV967=Readonly<{id:string;command:AlexaConcertCommandV967;createdAt:number}>;
export const ALEXA_LOCAL_ENABLED_KEY_V967='sonic-display:alexa-virtual-concert-v967';
export function isAlexaConcertCommandV967(command:unknown):command is AlexaConcertCommandV967 {
 return typeof command==='string'&&(ALEXA_CONCERT_COMMANDS_V967 as readonly string[]).includes(command);
}
/** Voice actions explicitly control VIRTUAL automation only; they cannot enable Govee hardware. */
export function applyAlexaConcertCommandV967(settings:ConcertSettingsV958,command:AlexaConcertCommandV967):ConcertSettingsV958 {
 const base={...settings,hardwareSync:false};
 switch(command){
  case 'arena': return {...base,enabled:true,virtualFx:true,immersiveV966:true,strength:75,immersiveStrengthV966:75};
  case 'festival': return {...base,enabled:true,virtualFx:true,immersiveV966:true,strength:90,immersiveStrengthV966:90};
  case 'club': return {...base,enabled:true,virtualFx:true,immersiveV966:true,strength:60,immersiveStrengthV966:65};
  case 'calm': return {...base,enabled:true,virtualFx:true,immersiveV966:true,strength:25,immersiveStrengthV966:30};
  case 'stop': return {...base,enabled:false,virtualFx:false};
  case 'fx-on': return {...base,enabled:true,virtualFx:true};
  case 'fx-off': return {...base,virtualFx:false};
 }
}
/** Reject old/invalid notifications and unrecognized actions; do not apply stale commands on reconnect. */
export function canApplyAlexaCommandV967(raw:unknown,enabledSince:number,now:number):raw is AlexaQueuedCommandV967{
 if(!raw||typeof raw!=='object')return false;
 const o=raw as Partial<AlexaQueuedCommandV967>;
 return typeof o.id==='string'&&/^[\da-f-]{36}$/i.test(o.id)&&isAlexaConcertCommandV967(o.command)&&
  typeof o.createdAt==='number'&&Number.isSafeInteger(o.createdAt)&&o.createdAt>=enabledSince-1000&&
  o.createdAt<=now+5000&&now-o.createdAt<=75000;
}
export const ALEXA_CONCERT_MESSAGES_V967:Record<AlexaConcertCommandV967,string>={
 arena:'Arena-Atmosphäre',festival:'Festival-Atmosphäre',club:'Club-Atmosphäre',
 calm:'ruhige Konzertatmosphäre',stop:'Konzertautomatik aus',
 'fx-on':'virtuelle Effekte an','fx-off':'virtuelle Effekte aus'
};
